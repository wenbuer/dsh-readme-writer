// dsh-readme-writer: the adaptive GitHub README writing + screenshot skill for
// the DeepSeek Harness.
//
// A Cordis plugin that registers one skill provider into the HOST layer of the
// `ctx.skills` registry, so every agent preset's scope chain merges this skill.
// The skill body lives in `../skills/readme-writer/SKILL.md` inside this
// package; the provider locates it from `import.meta.url` (an assembly fact of
// this package, never user config) and loads the body on demand.
//
// The provider protocol mirrors @deepseek-ai/dsh-skill-filesystem:
//   - list()  discovers directory-bundle candidates (name/description from
//     YAML frontmatter, body left unread until requested)
//   - get()   parses the winning candidate's SKILL.md and returns the full
//     definition with a directory resource base for relative references
//
// The skill ships no bundled example images (README screenshots are generated
// at use time for the target project, per the skill's own section 3.4), so the
// directory resource base points at `../skills/readme-writer/` for any relative
// references the body mentions.
//
// @module dsh-readme-writer
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const name = "dsh-readme-writer";
const inject = ["skills"];

/** Registry precedence for packaged skill providers: ranks below the local bundled root. */
const PACKAGED_SKILL_RANK = 550;

/** The source bucket this skill advertises under (prompt-visible metadata). */
const SOURCE = "custom";

/** The public kebab-case skill-name grammar, matching @deepseek-ai/dsh-skill. */
const VALID_SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Parse the YAML frontmatter block of a SKILL.md into metadata plus body.
 *
 * Handles the scalar fields DSH skill discovery consumes (name, description,
 * whenToUse) plus the invocation flags, and supports folded scalar blocks
 * (`description: >` / `keywords: >` followed by indented lines) — folded lines
 * are joined with single spaces, matching YAML semantics. Richer metadata
 * (category, version, argument-hint, keywords) passes through verbatim.
 *
 * @param text - the raw skill file contents.
 * @returns parsed metadata object and the markdown body after the block, or
 *   null when the file has no frontmatter block at all.
 */
function parseFrontmatter(text) {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = text.slice(3, end);
  const body = text.slice(end + 4).replace(/^\n+/, "");
  const metadata = {};
  let currentKey = null;
  let folded = false;
  for (const rawLine of block.split("\n")) {
    const line = rawLine.trimEnd();
    if (/^[ \t]/.test(line) && currentKey !== null) {
      // Indented continuation of a folded scalar.
      const value = line.trim();
      if (value) {
        metadata[currentKey] = folded
          ? `${metadata[currentKey]} ${value}`
          : `${metadata[currentKey]}\n${value}`;
      }
      continue;
    }
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!match) {
      currentKey = null;
      folded = false;
      continue;
    }
    let value = match[2].trim();
    folded = value === ">" || value === ">-" || value === ">+";
    if (folded) {
      value = "";
    } else if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    metadata[match[1]] = value;
    currentKey = folded ? match[1] : null;
  }
  return { metadata, body };
}

/**
 * Read and parse one skill directory's SKILL.md.
 * @param skillFile - absolute path to the SKILL.md file.
 * @param signal - optional cancellation; aborts the read.
 * @returns the parsed skill record, or undefined when the file vanished or is
 *   missing the required `name`/`description` fields.
 */
async function parseSkillFile(skillFile, signal) {
  let text;
  try {
    text = await readFile(skillFile, "utf8");
  } catch {
    return undefined;
  }
  if (signal?.aborted) return undefined;
  const parsed = parseFrontmatter(text);
  if (parsed === null) return undefined;
  const meta = parsed.metadata;
  if (!meta.name || !meta.description) return undefined;
  return {
    name: meta.name,
    description: meta.description,
    whenToUse: meta.whenToUse,
    metadata: meta,
    content: parsed.body,
  };
}

/**
 * Map DSH invocation flags onto the skill record; anything unset stays model-
 * and user-invocable, matching dsh-skill-filesystem's defaults.
 * @param metadata - parsed frontmatter metadata.
 * @returns the DSH invocation record.
 */
function invocationFrom(metadata) {
  if (metadata["disable-model-invocation"] === "true") {
    return { modelInvocable: false, userInvocable: true };
  }
  if (metadata["user-invocable"] === "false") {
    return { modelInvocable: true, userInvocable: false };
  }
  return { modelInvocable: true, userInvocable: true };
}

/**
 * Discover packaged skill candidates by scanning the package's `skills/`
 * directory: one subdirectory per skill, each carrying a SKILL.md.
 * @param skillsRoot - absolute path to this package's skills directory.
 * @param signal - optional cancellation.
 * @returns the candidate list.
 */
async function discoverCandidates(skillsRoot, signal) {
  let entries;
  try {
    entries = await readdir(skillsRoot, { withFileTypes: true });
  } catch {
    return [];
  }
  const candidates = [];
  for (const entry of entries) {
    if (signal?.aborted) break;
    if (!entry.isDirectory()) continue;
    const skillDir = join(skillsRoot, entry.name);
    const skillFile = join(skillDir, "SKILL.md");
    const parsed = await parseSkillFile(skillFile, signal);
    if (parsed === undefined) continue;
    if (!VALID_SKILL_NAME.test(parsed.name)) continue;
    candidates.push({
      name: parsed.name,
      description: parsed.description,
      ...(parsed.whenToUse !== undefined ? { whenToUse: parsed.whenToUse } : {}),
      invocation: invocationFrom(parsed.metadata),
      source: SOURCE,
      provider: name,
      rank: PACKAGED_SKILL_RANK,
      locator: skillDir,
      path: skillFile,
      ...(Object.keys(parsed.metadata).length > 0 ? { metadata: parsed.metadata } : {}),
    });
  }
  return candidates;
}

/**
 * Register the packaged skill provider on `ctx.skills`.
 * @param ctx - the Cordis context, carrying the `skills` service.
 */
function apply(ctx) {
  const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");
  ctx.skills.registerProvider((control) => ({
    name,
    async list(options) {
      return discoverCandidates(skillsRoot, options.signal);
    },
    async get(candidate, options) {
      const parsed = await parseSkillFile(candidate.path, options.signal);
      if (parsed === undefined) return undefined;
      return {
        name: parsed.name,
        description: parsed.description,
        ...(parsed.whenToUse !== undefined ? { whenToUse: parsed.whenToUse } : {}),
        invocation: invocationFrom(parsed.metadata),
        source: SOURCE,
        provider: name,
        resourceBase: { kind: "directory", path: candidate.locator },
        path: candidate.path,
        ...(Object.keys(parsed.metadata).length > 0 ? { metadata: parsed.metadata } : {}),
        content: parsed.content,
      };
    },
  }));
}

export { apply, name, inject };
export default { apply, name, inject };
