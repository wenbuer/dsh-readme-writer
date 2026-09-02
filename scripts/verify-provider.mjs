// verify-provider.mjs — prove the readme-writer skill actually loads through
// the cordis plugin's provider, without booting a dsh profile.
//
// It wires a minimal `ctx.skills` that mirrors the host registry contract,
// applies the plugin, then calls list() and get() and asserts the skill
// surfaces with the right name, description, and body.
import { apply, name, inject } from "../lib/index.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { stat } from "node:fs/promises";

const providers = [];
const ctx = {
  skills: {
    registerProvider(create) {
      const provider = create({ signal: new AbortController().signal, invalidate() {} });
      providers.push(provider);
      return () => {};
    },
  },
};

apply(ctx);

if (providers.length !== 1) {
  console.error("FAIL: expected exactly one registered skill provider");
  process.exit(1);
}
const provider = providers[0];
if (provider.name !== name) {
  console.error(`FAIL: provider.name="${provider.name}" expected "${name}"`);
  process.exit(1);
}
if (JSON.stringify(inject) !== JSON.stringify(["skills"])) {
  console.error(`FAIL: inject="${JSON.stringify(inject)}" expected ["skills"]`);
  process.exit(1);
}

const candidates = await provider.list({ signal: undefined });
if (!Array.isArray(candidates) || candidates.length === 0) {
  console.error("FAIL: list() returned no skill candidates");
  process.exit(1);
}
const candidate = candidates.find((c) => c.name === "readme-writer");
if (candidate === undefined) {
  console.error(`FAIL: candidate "readme-writer" missing among ${candidates.map((c) => c.name).join(", ")}`);
  process.exit(1);
}
if (candidate.provider !== name) {
  console.error(`FAIL: candidate.provider="${candidate.provider}" expected "${name}"`);
  process.exit(1);
}

const skill = await provider.get(candidate, { signal: undefined });
if (skill === undefined) {
  console.error("FAIL: get() returned undefined");
  process.exit(1);
}
if (skill.name !== "readme-writer") {
  console.error(`FAIL: loaded skill name="${skill.name}"`);
  process.exit(1);
}
if (typeof skill.description !== "string" || skill.description.length === 0) {
  console.error("FAIL: loaded skill has no description");
  process.exit(1);
}
if (typeof skill.content !== "string" || skill.content.length < 200) {
  console.error(`FAIL: loaded skill content too short (${skill.content?.length ?? 0} chars)`);
  process.exit(1);
}
if (skill.invocation?.modelInvocable !== true || skill.invocation?.userInvocable !== true) {
  console.error(`FAIL: invocation=${JSON.stringify(skill.invocation)}`);
  process.exit(1);
}
const base = skill.resourceBase;
if (base?.kind !== "directory" || !base.path) {
  console.error("FAIL: resourceBase not a directory");
  process.exit(1);
}
const skmd = join(base.path, "SKILL.md");
const info = await stat(skmd).catch(() => undefined);
if (info === undefined) {
  console.error(`FAIL: resource base ${base.path} has no SKILL.md`);
  process.exit(1);
}
if (!skill.content.includes("先探测")) {
  console.error("FAIL: loaded body is not the readme-writer skill (missing '先探测')");
  process.exit(1);
}

console.log("OK: readme-writer skill loads via plugin provider");
console.log(`  name        = ${skill.name}`);
console.log(`  provider    = ${skill.provider}`);
console.log(`  rank        = ${candidate.rank}`);
console.log(`  description = ${skill.description.slice(0, 60)}...`);
console.log(`  content     = ${skill.content.length} chars`);
console.log(`  resourceBase = ${base.path}`);
