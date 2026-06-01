# Hello World Project

<div align="center">

[![View Interactive Site](https://img.shields.io/badge/View_Interactive_Site-4F46E5?style=for-the-badge&logo=html5&logoColor=white)](https://csps0.github.io/Hello-World/)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Languages](https://img.shields.io/badge/languages-142-blue?style=for-the-badge)](docs/languages.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

**A comprehensive collection of "Hello, World!" programs in 142 programming languages.**

[View the Interactive Documentation](https://csps0.github.io/Hello-World/)

</div>

---

## Overview

The Hello World Project compiles the universal first program — `Hello, World!` — across 142 languages. It spans industry standards such as Python and Java, systems languages like Rust and C, and esoteric languages including Brainfuck and Shakespeare.

The project serves three purposes: **reference** for developers comparing syntax across languages, **education** for students encountering new paradigms, and **preservation** of lesser-known programming languages.

## Features

| Feature | Description |
| :--- | :--- |
| **Comprehensive Library** | 142 languages across procedural, OOP, functional, logic, scripting, esoteric, hardware, and markup paradigms. |
| **Interactive Website** | Browse, search, filter by paradigm, and copy code snippets via the [documentation site](https://csps0.github.io/Hello-World/). |
| **Fuzzy Search** | Instant language lookup powered by Fuse.js. |
| **Paradigm Filtering** | Filter by tag: procedural, OOP, functional, scripting, esoteric, hardware, logic, markup. |
| **Comparison View** | Select up to 3 languages and view their implementations side-by-side. |
| **Dark and Light Mode** | Automatic theme detection with manual toggle. Persists across sessions. |
| **Deep Linking** | Share direct links to any language via URL hash (e.g., `#python`). |
| **CI/CD Pipeline** | Automated validation and deployment via GitHub Actions. |

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