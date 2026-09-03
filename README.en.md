# dsh-readme-writer

> This skill helps you write or improve a GitHub project's README, and adds pictures along the way. If the project has a web page, it takes a screenshot of that page. If the project is a command-line program with no web page, it turns the program's running output into a "terminal" picture. If neither is possible, it explains the interface with plain text and a table instead.

![type](https://img.shields.io/badge/type-skill-blue)
![category](https://img.shields.io/badge/category-skill-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![verify](https://github.com/wenbuer/dsh-readme-writer/actions/workflows/verify.yml/badge.svg)

## What it is

This is a skill for [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness). Just say "write the README for this project" and it writes or improves your GitHub project's main page.

Its biggest difference from a "text-only" README tool is that it tries to add pictures — and it picks the right kind on its own:

- The project has a web page → it takes a screenshot of that page.
- The project is a command-line program with no web page → it turns the program's running output into a terminal-style picture.
- Neither is possible → it describes the interface with plain text and a table, so the README is still complete (no empty placeholder picture).

## Install

As a dsh plugin (cordis skill-bundle, installable via `dsh plugin add`):

~~~bash
# from GitHub (no npm package needed)
dsh plugin --profile <profile> add github:wenbuer/dsh-readme-writer

# from npm, once published
dsh plugin --profile <profile> add dsh-readme-writer
~~~

Or copy the skill into the user skill directory:

~~~bash
mkdir -p ~/.dsh/skills/readme-writer
cp skills/readme-writer/SKILL.md ~/.dsh/skills/readme-writer/
~~~

## Screenshots

![verify](assets/readme-writer-verify.png)
*Figure 1: `npm run verify` — the real provider check, proving `readme-writer` loads correctly.*

![terminal](assets/readme-writer-terminal.png)
*Figure 2: terminal screenshot — for a console/CLI project the skill renders runtime output as a terminal-style image.*

## Verify

```
npm run verify
```

Simulates the host `ctx.skills`, calls the plugin provider's `list()`/`get()`, and asserts that the
`readme-writer` skill is discovered and loaded.

## Directory

```
dsh-readme-writer/
├── package.json
├── README.md / README.en.md
├── LICENSE
├── CHANGELOG.md
├── screenshots.json
├── cordis.patch.yml
├── assets/
├── lib/index.js
├── scripts/verify-provider.mjs
├── .github/workflows/verify.yml
├── submission/wenbuer__dsh-readme-writer.yml
└── skills/readme-writer/SKILL.md
```

## License

MIT
