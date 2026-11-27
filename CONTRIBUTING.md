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

- Print a hello world. Prefer the exact string `Hello, World!` (with comma and exclamation mark) whenever the language can print it.
- Any other hello world output is accepted when that is what the language produces: another capitalisation or punctuation (HQ9+ prints `Hello, world!`), or output with a prefix, label or extra lines (OpenSCAD prints `ECHO: "Hello, World!"`). Describe the actual output in the history text.
- Use the simplest possible implementation for the language.
- Include only what is necessary to compile/run the program.
- Do not include comments.
- Exception: languages that cannot contain the literal text (Brainfuck, Ook!, Befunge, Shakespeare, Whitespace, INTERCAL and similar) must print it when run.
- If the language needs a flag or a host program to print (for example `jq -nr`), keep the sample minimal and mention it in the history text.

### Registering the Language

All of this lives in `docs/build.js` and `docs/language_metadata.json`:

1. **Extension.** Add the extension to `EXTENSION_MAP` with the language name and paradigm tags. If another language already uses the extension, name the file `hello_<language>.<ext>` and add it to `FILENAME_MAP` instead.
2. **Description.** Add a one-line description to `DESCRIPTION_DEFAULTS` (`FILENAME_MAP` entries carry their own).
3. **Syntax grammar.** Add the language to `PRISM_MAP` with the [Prism grammar](https://prismjs.com/#supported-languages) that highlights it. If Prism has none, use the closest relative, or add a small grammar to `docs/prism-extra.js`. The build fails if a language has no grammar.
4. **Metadata.** Add an entry to `docs/language_metadata.json`, keyed by the exact language name:

   ```json
   "Gleam": {
     "creator": "Louis Pilfold",
     "year": 2016,
     "famousProjects": ["Lustre"],
     "frameworks": { "web": ["Lustre", "Wisp"] },
     "quiz": { "platforms": ["web-backend"], "backend": true, "typing": "static", "speed": "high" },
     "history": "Two or three factual sentences: who made it, why, and where it is used.",
     "website": "https://gleam.run/",
     "released": "2019-04-15",
     "releasedEvent": "Gleam v0.1 released",
     "sources": ["https://gleam.run/news/", "https://github.com/gleam-lang/gleam"]
   }
   ```

   - `released`: the first public release, as precise as a source states it: `YYYY-MM-DD`, `YYYY-MM` or `YYYY`. Never invent a day or month. `year` must match it. `releasedEvent` says what the date refers to (a release, an announcement, a paper, a first commit).
   - `sources`: 1–3 URLs that support the date and creator, primary sources first (official site, creator's announcement, paper, repository), then Wikipedia. They are listed as links in the code view's history tab.

   - `quiz.platforms`: any of `web-frontend`, `web-backend`, `mobile`, `desktop`, `game`, `systems`, `embedded`, `cli`, `data-science`, `ai`, `cloud`, `esoteric`, `logic`, `hardware`, `markup`.
   - `quiz.typing`: `static` or `dynamic`. `quiz.speed`: `low`, `moderate`, `high` or `maximum`.
   - `website`: the project's own site, or its official repository when that is its home. No Wikipedia or wiki pages. Check that the URL loads. Leave the field out when there is none. Variants such as `"Ruby (Script)"` inherit the base language's website.
5. **Icon.** Add `docs/icons/<slug>.svg`. The slug is the name in lowercase with `#` → `sharp`, `+` → `plus`, `*` → `star`, `--` → `minusminus`, and any other run of punctuation or spaces as `-` (e.g. `csharp.svg`, `pl-i.svg`, `assembly-risc-v.svg`). The build looks for the full name first, then the base name, so `"Ruby (Script)"` reuses `ruby.svg`.
   - Use a single-colour SVG. The site draws it as a mask in the theme colour, so colours are ignored and filled background shapes become solid blocks.
   - Prefer the official logo; Simple Icons, devicon and file-icons are good sources. Check it is the right project, because names are often shared with unrelated products.
   - When no logo exists, draw a 16×16 pixel icon in the style of the existing ones.
   - Without a file, the site shows a two-letter placeholder.
6. **Build.** Run `bun run build` to regenerate `languages.json`, then update the language count in `README.md` (badge and intro) and `docs/index.html`.

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
2. Add the source file, the `build.js` entries, the metadata entry and the icon.
3. Run `bun run build` and `bunx tsc --noEmit`, then check the language in the browser with `bun run dev`: icon, syntax highlighting and website link.
4. Commit all changed files, including the regenerated `docs/languages.json`.
5. Open a pull request titled `Add Hello World in <Language Name>`.

## Reporting Issues

If you find a bug in the website, an incorrect code sample, or a missing language, please open a GitHub Issue with:

- A clear title.
- Steps to reproduce (for bugs).
- The language name and expected output (for corrections).

## Code of Conduct

Be respectful. This is an educational project welcoming contributors of all skill levels.
