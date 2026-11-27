# Contributing to Hello World Project

Thank you for your interest in contributing! This guide explains how to add a new language or improve existing entries.

## Adding a New Language

### File Naming

Place your file in `docs/hello-world/` with the naming convention:

- **Standard:** `hello.<extension>` (e.g., `hello.py`, `hello.rs`)
- **Disambiguation:** When multiple languages share an extension, use `hello_<language>.<extension>` (e.g., `hello_matlab.m`, `hello_octave.m`)
- **Variants:** For script or alternative versions, use `hello_script.<extension>` (e.g., `hello_script.go`)

### File Content

Each file should contain a minimal, idiomatic "Hello, World!" program in the target language.

**Rules:**

- Output the exact string `Hello, World!` (with comma and exclamation mark).
- Use the simplest possible implementation for the language.
- Include only what is necessary to compile/run the program.
- Do not include comments.
- Exception: languages that cannot contain the literal text (Brainfuck, Ook!, Befunge, Shakespeare, Whitespace) must print it when run.

### Updating the Manifest

After adding your file, update the build script's extension mapping:

1. Open `docs/build.js`.
2. Add your extension to `EXTENSION_MAP` with the language name and paradigm tags.
3. If your file uses a disambiguated name, add it to `FILENAME_MAP` instead.
4. Add the language to `PRISM_MAP` with the Prism grammar that highlights it (see the [Prism language list](https://prismjs.com/#supported-languages)). If Prism has none, use the closest relative or add a small grammar to `docs/prism-extra.js`. The build fails if a language has no grammar.
5. Add an icon at `docs/icons/<slug>.svg`, where the slug is the base name in lowercase with `#` → `sharp`, `+` → `plus`, `*` → `star` and other punctuation as `-` (e.g. `csharp.svg`, `pl-i.svg`). Use a single-colour SVG: the site draws it as a mask in the theme colour, so colours are ignored and filled background shapes turn into solid blocks. Variants like "Ruby (Script)" reuse the base icon. Without a file, the site shows a two-letter placeholder.
6. Run `bun run build` to regenerate `languages.json`.

### Paradigm Tags

Each language entry requires at least one paradigm tag:

| Tag | Description |
| :--- | :--- |
| `procedural` | Imperative, step-by-step execution |
| `oop` | Object-oriented programming |
| `functional` | Functional programming paradigm |
| `scripting` | Interpreted scripting languages |
| `esoteric` | Esoteric or joke languages |
| `hardware` | Hardware description or assembly |
| `logic` | Logic programming |
| `markup` | Markup or data serialization |

## Pull Request Process

1. Fork the repository and create a feature branch.
2. Add your `hello.<ext>` file to `docs/hello-world/`.
3. Update `docs/build.js` with the extension mapping.
4. Run `bun run build` and verify `languages.json` was updated.
5. Commit all changed files.
6. Open a Pull Request with the title: `Add Hello World in <Language Name>`.

## Reporting Issues

If you find a bug in the website, an incorrect code sample, or a missing language, please open a GitHub Issue with:

- A clear title.
- Steps to reproduce (for bugs).
- The language name and expected output (for corrections).

## Code of Conduct

Be respectful. This is an educational project welcoming contributors of all skill levels.
