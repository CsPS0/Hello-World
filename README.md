# Hello World Project

[![View Interactive Site](https://img.shields.io/badge/View_Site-e05a2b?style=for-the-badge)](https://csps0.github.io/Hello-World/)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Languages](https://img.shields.io/badge/languages-473-blue?style=for-the-badge)](docs/languages.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

**The same program, written in 473 different languages.**

[Browse the collection](https://csps0.github.io/Hello-World/)

---

## Overview

This project collects `Hello, World!` in every programming language it can find, from Python and C to Brainfuck, INTERCAL and Shakespeare. Every file prints a hello world, `Hello, World!` wherever the language allows. The differences are in the syntax.

Use it to look up how a language works, compare languages side by side, find a stack for a new project, or discover something you have not seen before.

## Features

| What | Details |
| :--- | :--- |
| **Languages** | Mainstream, historic, esoteric, hardware, logic and markup languages, each with creator, year, history and well-known projects. |
| **Icons** | Every language and framework has a single-colour SVG icon that follows the theme: the official logo where one exists, a pixel-art icon where none does. |
| **Syntax highlighting** | Every sample is highlighted with Prism. Grammars load on demand; languages Prism lacks get a custom grammar from `docs/prism-extra.js`. |
| **Official websites** | Language and framework cards link to the project's own site or repository, taken from Wikidata and checked by HTTP request. |
| **Search and filter** | Fuzzy search combined with paradigm filters, with a result count and per-filter counts. The search and filter are kept in the URL (`?q=rust&tag=functional`). |
| **Grid and list views** | Cards or a sortable table; the choice is remembered. |
| **Compare** | Pick up to 3 languages and see their code side by side. |
| **Frameworks & libraries** | A catalog of popular frameworks with their target language, category and website. |
| **Family tree** | A FAMILY TREE tab drawn like the `tree` command: pick a language to see the languages that influenced it and the ones it influenced, or start from the root languages. Influences are researched with sources and shown in each language's details too; links like `?tree=rust` open a tree directly. |
| **Stack Finder** | Answer a few questions and get a recommended stack with reasons, setup commands, project layout, tooling and docs, plus a prompt to paste into an AI chat (or ask Chrome's on-device AI where available). |
| **Deep links** | Link to any language with its slug, e.g. `#python`, `#csharp`, `#cplusplus`. The Back button closes the code view. |
| **Copy, raw and download** | One click to copy, open or download any source file. |
| **Dark and light mode** | Follows your system preference, with a manual toggle. |
| **CI/CD** | GitHub Actions rebuilds the manifest, fails if `languages.json` is stale, and deploys to GitHub Pages on every push. |

## Project Structure

```text
Hello-World/
├── docs/                      The static site (deployed to GitHub Pages)
│   ├── hello-world/           One Hello World source file per language
│   ├── icons/                 Language icons (SVG); frameworks/ holds framework icons
│   ├── index.html             Website entry point
│   ├── style.css              Styles and theme system
│   ├── app.js                 Application logic
│   ├── prism-extra.js         Syntax grammars for languages Prism does not ship
│   ├── wizard-stacks.js       Stack Finder catalog and recommender (no DOM)
│   ├── raw.html               Raw source viewer
│   ├── build.js               Builds languages.json from the sources and metadata
│   ├── languages.json         Generated language manifest (do not edit)
│   ├── language_metadata.json Creator, year, history, projects and website per language
│   └── frameworks_metadata.json  Framework catalog with icon and website
├── index.ts                   Local server (Bun)
├── .github/workflows/deploy.yml  CI: validation and GitHub Pages deployment
├── CONTRIBUTING.md            How to add a language
├── AGENTS.md                  Rules for coding agents working in this repo
└── LICENSE
```

## Quick Reference

| Language | File | Description |
| :--- | :--- | :--- |
| Python | [`hello.py`](docs/hello-world/hello.py) | High-level, general-purpose language. |
| JavaScript | [`hello.js`](docs/hello-world/hello.js) | Primary language of the web platform. |
| Rust | [`hello.rs`](docs/hello-world/hello.rs) | Memory-safe systems programming. |
| Go | [`hello.go`](docs/hello-world/hello.go) | Statically typed with built-in concurrency. |
| C | [`hello.c`](docs/hello-world/hello.c) | Foundation of systems programming. |
| Haskell | [`hello.hs`](docs/hello-world/hello.hs) | Purely functional programming. |
| Brainfuck | [`hello.bf`](docs/hello-world/hello.bf) | Eight commands, Turing complete. |
| INTERCAL | [`hello.i`](docs/hello-world/hello.i) | The original parody language: say PLEASE, but not too often. |

For the full list, visit the [interactive site](https://csps0.github.io/Hello-World/) or browse [`docs/hello-world/`](docs/hello-world/).

## Build & Run

Requires [Bun](https://bun.sh).

```bash
bun install        # dev dependencies (TypeScript types)
bun run build      # regenerate docs/languages.json
bun run dev        # serve at http://localhost:8080 with hot reload
bun start          # serve without hot reload (PORT=3000 bun start to change the port)
bun run check      # rebuild and fail if languages.json is out of date (what CI runs)
bunx tsc --noEmit  # type check
```

`build.js` scans `docs/hello-world/`, maps each file to a language by file name or extension, merges `language_metadata.json`, attaches the icon, website and syntax grammar, and writes `languages.json`. It fails on unknown grammars, duplicate deep-link slugs and malformed website URLs.

## Contributing

Contributions are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) has the full checklist: file naming, the sample rules, `build.js` maps, metadata fields, icons, websites and the pull request process.

**Summary:**

1. Add `docs/hello-world/hello.<ext>` that prints `Hello, World!` (or whatever hello world output the language produces), with no comments.
2. Register it in `docs/build.js`: `EXTENSION_MAP` (or `FILENAME_MAP`), `DESCRIPTION_DEFAULTS` and `PRISM_MAP`.
3. Add its entry to `docs/language_metadata.json`, including `website` if it has one.
4. Add an icon at `docs/icons/<slug>.svg`.
5. Run `bun run build`, then open a pull request.

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for the full text.
