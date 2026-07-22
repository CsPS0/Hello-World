# Hello World Project

[![View Interactive Site](https://img.shields.io/badge/View_Site-e05a2b?style=for-the-badge)](https://csps0.github.io/Hello-World/)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Languages](https://img.shields.io/badge/languages-142-blue?style=for-the-badge)](docs/languages.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

**The same program, written in 142 different languages.**

[Browse all 142 languages](https://csps0.github.io/Hello-World/)

---

## Overview

This project collects `Hello, World!` in 142 programming languages — from Python and C to Brainfuck and Shakespeare. Every file prints the same string. The differences are in the syntax.

Use it to look up how a language works, compare two languages side by side, or find something you have not seen before.

## Features

| What | Details |
| :--- | :--- |
| **142 languages** | Procedural, OOP, functional, scripting, esoteric, hardware, logic, and markup. |
| **Search** | Type a name, find the language. Fuzzy matching included. |
| **Filter** | Click a paradigm tag to narrow the grid. |
| **Compare** | Pick up to 3 languages and see their code side by side. |
| **Copy and download** | One click to copy or download any source file. |
| **Dark and light mode** | Follows your system preference. Manual toggle available. |
| **Deep links** | Link directly to any language with a URL hash (e.g., `#python`). |
| **CI/CD** | GitHub Actions validates the manifest and deploys to Pages on every push. |

## Project Structure

```text
Hello-World/
├── docs/
│   ├── hello-world/     Source code files for all 142 languages
│   ├── index.html       Website entry point
│   ├── style.css        Styles and theme system
│   ├── app.js           Application logic
│   ├── languages.json   Language manifest (auto-generated)
│   └── build.py         Build script to regenerate the manifest
├── .github/
│   └── workflows/
│       └── deploy.yml   CI/CD: validation and GitHub Pages deployment
├── CONTRIBUTING.md      Contribution guidelines
├── LICENSE              MIT License
└── README.md
```

## Quick Reference

| Language | File | Description |
| :--- | :--- | :--- |
| Python | [`hello.py`](docs/hello-world/hello.py) | High-level, general-purpose language. |
| JavaScript | [`hello.js`](docs/hello-world/hello.js) | Primary language of the web platform. |
| Rust | [`hello.rs`](docs/hello-world/hello.rs) | Memory-safe systems programming. |
| Go | [`hello.go`](docs/hello-world/hello.go) | Statically typed with built-in concurrency. |
| C++ | [`hello.cpp`](docs/hello-world/hello.cpp) | High-performance compiled language. |
| Haskell | [`hello.hs`](docs/hello-world/hello.hs) | Purely functional programming. |
| Java | [`hello.java`](docs/hello-world/hello.java) | Platform-independent OOP language. |
| C | [`hello.c`](docs/hello-world/hello.c) | Foundation of systems programming. |

For the full list, visit the [interactive site](https://csps0.github.io/Hello-World/) or browse the [`hello-world/`](docs/hello-world/) directory.

## Build

Regenerate `languages.json` from the source files:

```bash
cd docs
python build.py
```

The script scans `hello-world/`, maps file extensions to language metadata via internal dictionaries, and writes the manifest with paradigm tags.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for file naming conventions, paradigm tag definitions, and the pull request process.

**Summary:**

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/add-language-name`.
3. Add the source file to `docs/hello-world/`.
4. Update the extension mapping in `docs/build.py`.
5. Run `python docs/build.py` to regenerate the manifest.
6. Commit, push, and open a pull request.

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for the full text.
