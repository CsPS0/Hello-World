const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'hello-world');
const OUTPUT_PATH = path.join(__dirname, 'languages.json');
const METADATA_PATH = path.join(__dirname, 'language_metadata.json');

const EXTENSION_MAP = {
    ".adb":          {"name": "Ada",                            "tags": ["procedural", "oop"]},
    ".ads":          {"name": "Ada (Script)",                   "tags": ["procedural", "oop"]},
    ".as":           {"name": "ActionScript",                   "tags": ["oop", "scripting"]},
    ".a68":          {"name": "ALGOL 68",                       "tags": ["procedural"]},
    ".apl":          {"name": "APL",                            "tags": ["functional"]},
    ".applescript":  {"name": "AppleScript",                    "tags": ["scripting"]},
    ".arc":          {"name": "Arc",                            "tags": ["functional"]},
    ".asm":          {"name": "Assembly",                       "tags": ["hardware"]},
    ".s":            {"name": "Assembly (ARM)",                 "tags": ["hardware"]},
    ".asm64":        {"name": "Assembly (x64)",                 "tags": ["hardware"]},
    ".ahk":          {"name": "AutoHotkey",                     "tags": ["scripting"]},
    ".au3":          {"name": "AutoIt",                         "tags": ["scripting"]},
    ".awk":          {"name": "Awk",                            "tags": ["scripting"]},
    ".bal":          {"name": "Ballerina",                      "tags": ["procedural", "oop"]},
    ".sh":           {"name": "Bash",                           "tags": ["scripting"]},
    ".bas":          {"name": "BASIC",                          "tags": ["procedural"]},
    ".bat":          {"name": "Batch (Windows)",                "tags": ["scripting"]},
    ".bsh":          {"name": "BeanShell",                      "tags": ["scripting", "oop"]},
    ".boo":          {"name": "Boo",                            "tags": ["oop"]},
    ".bf":           {"name": "Brainfuck",                      "tags": ["esoteric"]},
    ".c":            {"name": "C",                              "tags": ["procedural"]},
    ".csh":          {"name": "C (Script)",                     "tags": ["procedural", "scripting"]},
    ".cm":           {"name": "C--",                            "tags": ["procedural"]},
    ".cs":           {"name": "C#",                             "tags": ["oop"]},
    ".csx":          {"name": "C# Script",                      "tags": ["oop", "scripting"]},
    ".cpp":          {"name": "C++",                            "tags": ["oop", "procedural"]},
    ".cppsh":        {"name": "C++ (Script)",                   "tags": ["oop", "scripting"]},
    ".cbas":         {"name": "Caché Basic",                    "tags": ["procedural"]},
    ".cmumps":       {"name": "Caché MUMPS",                    "tags": ["procedural"]},
    ".mac":          {"name": "Caché ObjectScript",             "tags": ["oop"]},
    ".cls":          {"name": "Caché ObjectScript (Class)",     "tags": ["oop"]},
    ".ceylon":       {"name": "Ceylon",                         "tags": ["oop"]},
    ".chpl":         {"name": "Chapel",                         "tags": ["procedural"]},
    ".il":           {"name": "CIL",                            "tags": ["hardware"]},
    ".icl":          {"name": "Clean",                          "tags": ["functional"]},
    ".clj":          {"name": "Clojure",                        "tags": ["functional"]},
    ".cljs":         {"name": "ClojureScript",                  "tags": ["functional"]},
    ".cljs.browser": {"name": "ClojureScript (Browser)",        "tags": ["functional"]},
    ".cljs.node":    {"name": "ClojureScript (Node)",           "tags": ["functional"]},
    ".cbl":          {"name": "COBOL",                          "tags": ["procedural"]},
    ".cob":          {"name": "COBOL (GnuCOBOL)",              "tags": ["procedural"]},
    ".cobra":        {"name": "Cobra",                          "tags": ["oop"]},
    ".coffee":       {"name": "CoffeeScript",                   "tags": ["scripting"]},
    ".litcoffee":    {"name": "CoffeeScript (Literate)",        "tags": ["scripting"]},
    ".cfm":          {"name": "ColdFusion Markup",              "tags": ["scripting", "markup"]},
    ".cfc":          {"name": "ColdFusion Script",              "tags": ["scripting"]},
    ".lisp":         {"name": "Common Lisp",                    "tags": ["functional"]},
    ".clisp":        {"name": "Common Lisp (CLISP)",            "tags": ["functional"]},
    ".sbcl":         {"name": "Common Lisp (SBCL)",             "tags": ["functional"]},
    ".cp":           {"name": "Component Pascal",               "tags": ["procedural", "oop"]},
    ".mod":          {"name": "Component Pascal (BlackBox)",    "tags": ["procedural", "oop"]},
    ".cr":           {"name": "Crystal",                        "tags": ["oop"]},
    ".curl":         {"name": "Curl",                           "tags": ["oop"]},
    ".pyx":          {"name": "Cython",                         "tags": ["procedural", "scripting"]},
    ".d":            {"name": "D",                              "tags": ["procedural", "oop"]},
    ".dart":         {"name": "Dart",                           "tags": ["oop"]},
    ".dl":           {"name": "Datalog",                        "tags": ["logic"]},
    ".dylan":        {"name": "Dylan",                          "tags": ["functional", "oop"]},
    ".e":            {"name": "Eiffel",                         "tags": ["oop"]},
    ".exs":          {"name": "Elixir",                         "tags": ["functional"]},
    ".elm":          {"name": "Elm",                            "tags": ["functional"]},
    ".erl":          {"name": "Erlang",                         "tags": ["functional"]},
    ".escript":      {"name": "Erlang (Script)",                "tags": ["functional", "scripting"]},
    ".factor":       {"name": "Factor",                         "tags": ["functional"]},
    ".fth":          {"name": "Forth",                          "tags": ["procedural"]},
    ".f90":          {"name": "Fortran",                        "tags": ["procedural"]},
    ".f":            {"name": "Fortran (Fixed)",                "tags": ["procedural"]},
    ".fs":           {"name": "F#",                             "tags": ["functional"]},
    ".fsx":          {"name": "F# (Script)",                    "tags": ["functional", "scripting"]},
    ".gambas":       {"name": "Gambas",                         "tags": ["oop"]},
    ".gs":           {"name": "Genie",                          "tags": ["oop"]},
    ".go":           {"name": "Go",                             "tags": ["procedural"]},
    ".gsp":          {"name": "Gosu",                           "tags": ["oop"]},
    ".groovy":       {"name": "Groovy",                         "tags": ["oop", "scripting"]},
    ".hh":           {"name": "Hack",                           "tags": ["oop"]},
    ".hs":           {"name": "Haskell",                        "tags": ["functional"]},
    ".lhs":          {"name": "Haskell (Literate)",             "tags": ["functional"]},
    ".hx":           {"name": "Haxe",                           "tags": ["oop"]},
    ".HC":           {"name": "Holy C",                         "tags": ["procedural", "esoteric"]},
    ".html":         {"name": "HTML",                           "tags": ["markup"]},
    ".icn":          {"name": "Icon",                           "tags": ["procedural"]},
    ".ni":           {"name": "Inform 7",                       "tags": ["esoteric"]},
    ".io":           {"name": "Io",                             "tags": ["oop"]},
    ".ijs":          {"name": "J",                              "tags": ["functional"]},
    ".java":         {"name": "Java",                           "tags": ["oop"]},
    ".js":           {"name": "JavaScript",                     "tags": ["scripting", "oop"]},
    ".jl":           {"name": "Julia",                          "tags": ["procedural", "functional"]},
    ".k":            {"name": "K",                              "tags": ["functional"]},
    ".kt":           {"name": "Kotlin",                         "tags": ["oop"]},
    ".kts":          {"name": "Kotlin (Script)",                "tags": ["oop", "scripting"]},
    ".lasso":        {"name": "Lasso",                          "tags": ["scripting", "oop"]},
    ".b":            {"name": "Limbo",                          "tags": ["procedural"]},
    ".ls":           {"name": "LiveScript",                     "tags": ["functional", "scripting"]},
    ".lgt":          {"name": "Logtalk",                        "tags": ["logic", "oop"]},
    ".lol":          {"name": "LOLCODE",                        "tags": ["esoteric"]},
    ".lgo":          {"name": "Logo",                           "tags": ["procedural"]},
    ".lua":          {"name": "Lua",                            "tags": ["scripting"]},
    ".mpl":          {"name": "Maple",                          "tags": ["procedural"]},
    ".nim":          {"name": "Nim",                            "tags": ["procedural"]},
    ".m":            {"name": "Objective-C",                    "tags": ["oop"]},
    ".mm":           {"name": "Objective-C++",                  "tags": ["oop"]},
    ".ml":           {"name": "OCaml",                          "tags": ["functional", "oop"]},
    ".pas":          {"name": "Pascal",                         "tags": ["procedural"]},
    ".pl":           {"name": "Perl",                           "tags": ["scripting"]},
    ".plx":          {"name": "Perl 5 (Script)",                "tags": ["scripting"]},
    ".php":          {"name": "PHP",                            "tags": ["scripting", "oop"]},
    ".phps":         {"name": "PHP (Script)",                   "tags": ["scripting"]},
    ".ps1":          {"name": "PowerShell",                     "tags": ["scripting"]},
    ".pro":          {"name": "Prolog",                         "tags": ["logic"]},
    ".py":           {"name": "Python",                         "tags": ["scripting", "oop"]},
    ".r":            {"name": "R",                              "tags": ["procedural", "functional"]},
    ".rkt":          {"name": "Racket",                         "tags": ["functional"]},
    ".p6":           {"name": "Raku",                           "tags": ["scripting", "functional"]},
    ".rexx":         {"name": "Rexx",                           "tags": ["procedural", "scripting"]},
    ".rb":           {"name": "Ruby",                           "tags": ["oop", "scripting"]},
    ".rbw":          {"name": "Ruby (Script)",                  "tags": ["oop", "scripting"]},
    ".rs":           {"name": "Rust",                           "tags": ["procedural"]},
    ".scala":        {"name": "Scala",                          "tags": ["functional", "oop"]},
    ".scm":          {"name": "Scheme",                         "tags": ["functional"]},
    ".spl":          {"name": "Shakespeare",                    "tags": ["esoteric"]},
    ".st":           {"name": "Smalltalk",                      "tags": ["oop"]},
    ".sql":          {"name": "SQL",                            "tags": ["procedural"]},
    ".swift":        {"name": "Swift",                          "tags": ["oop"]},
    ".tcl":          {"name": "Tcl",                            "tags": ["scripting"]},
    ".ts":           {"name": "TypeScript",                     "tags": ["oop", "scripting"]},
    ".vba":          {"name": "VBA",                            "tags": ["procedural", "scripting"]},
    ".vbs":          {"name": "VBScript",                       "tags": ["scripting"]},
    ".v":            {"name": "Verilog",                        "tags": ["hardware"]},
    ".vhd":          {"name": "VHDL",                           "tags": ["hardware"]},
    ".vb":           {"name": "Visual Basic .NET",              "tags": ["oop"]},
    ".wat":          {"name": "WebAssembly Text",               "tags": ["hardware"]},
    ".ws":           {"name": "Whitespace",                     "tags": ["esoteric"]},
    ".wl":           {"name": "Wolfram Language",               "tags": ["functional"]},
    ".xq":           {"name": "XQuery",                         "tags": ["functional"]},
    ".yaml":         {"name": "YAML",                           "tags": ["markup"]},
    ".zig":          {"name": "Zig",                            "tags": ["procedural"]},
    ".gleam":        {"name": "Gleam",                          "tags": ["functional"]},
    ".mojo":         {"name": "Mojo",                           "tags": ["procedural", "oop"]},
    ".sol":          {"name": "Solidity",                       "tags": ["procedural", "oop"]},
    ".qs":           {"name": "Q#",                             "tags": ["functional", "procedural"]},
    ".befunge":      {"name": "Befunge",                        "tags": ["esoteric"]},
    ".rockstar":     {"name": "Rockstar",                       "tags": ["esoteric"]},
    ".chef":         {"name": "Chef",                           "tags": ["esoteric"]},
    ".arnoldc":      {"name": "ArnoldC",                        "tags": ["esoteric"]},
    ".odin": {"name": "Odin", "tags": ["procedural"]},
    ".nix": {"name": "Nix", "tags": ["functional"]},
    ".fish": {"name": "Fish", "tags": ["scripting"]},
    ".zsh": {"name": "Zsh", "tags": ["scripting"]},
    ".el": {"name": "Emacs Lisp", "tags": ["functional", "scripting"]},
    ".gd": {"name": "GDScript", "tags": ["scripting", "oop"]},
    ".purs": {"name": "PureScript", "tags": ["functional"]},
    ".idr": {"name": "Idris", "tags": ["functional"]},
    ".lean": {"name": "Lean", "tags": ["functional"]},
    ".agda": {"name": "Agda", "tags": ["functional"]},
    ".pony": {"name": "Pony", "tags": ["oop"]},
    ".red": {"name": "Red", "tags": ["procedural", "scripting"]},
    ".hy": {"name": "Hy", "tags": ["functional", "scripting"]},
    ".fnl": {"name": "Fennel", "tags": ["functional", "scripting"]},
    ".janet": {"name": "Janet", "tags": ["functional", "scripting"]},
    ".vala": {"name": "Vala", "tags": ["oop"]},
    ".res": {"name": "ReScript", "tags": ["functional"]},
    ".nu": {"name": "Nushell", "tags": ["scripting"]},
    ".wren": {"name": "Wren", "tags": ["oop", "scripting"]},
    ".nut": {"name": "Squirrel", "tags": ["oop", "scripting"]},
    ".moon": {"name": "MoonScript", "tags": ["scripting"]},
    ".bqn": {"name": "BQN", "tags": ["functional"]},
    ".jsonnet": {"name": "Jsonnet", "tags": ["functional", "markup"]},
    ".pike": {"name": "Pike", "tags": ["oop", "scripting"]},
    ".ha": {"name": "Hare", "tags": ["procedural"]},
    ".carbon": {"name": "Carbon", "tags": ["procedural", "oop"]},
    ".ua": {"name": "Uiua", "tags": ["functional"]},
    ".ook": {"name": "Ook!", "tags": ["esoteric"]},
    ".sml": {"name": "Standard ML", "tags": ["functional"]},
    ".m3": {"name": "Modula-3", "tags": ["procedural", "oop"]},
    ".ob": {"name": "Oberon", "tags": ["procedural"]},
    ".pli": {"name": "PL/I", "tags": ["procedural"]},
    ".sno": {"name": "SNOBOL", "tags": ["procedural"]},
    ".dhall": {"name": "Dhall", "tags": ["functional", "markup"]},
    ".cu": {"name": "CUDA", "tags": ["procedural", "oop"]},
    ".vy": {"name": "Vyper", "tags": ["procedural"]},
    ".tex": {"name": "LaTeX", "tags": ["markup"]},
    ".ps": {"name": "PostScript", "tags": ["procedural", "functional"]},
    ".cmake": {"name": "CMake", "tags": ["scripting"]},
    ".sv": {"name": "SystemVerilog", "tags": ["hardware"]},
    ".elv": {"name": "Elvish", "tags": ["scripting"]},
    ".star": {"name": "Starlark", "tags": ["scripting"]},
    ".nelua": {"name": "Nelua", "tags": ["procedural"]},
    ".kk": {"name": "Koka", "tags": ["functional"]},
    ".flix": {"name": "Flix", "tags": ["functional", "logic"]},
    ".oz": {"name": "Oz", "tags": ["functional", "logic", "oop"]},
    ".n": {"name": "Nemerle", "tags": ["oop", "functional"]},
    ".dpr": {"name": "Delphi", "tags": ["oop", "procedural"]},
    ".curry": {"name": "Curry", "tags": ["functional", "logic"]},
    ".pwn": {"name": "Pawn", "tags": ["procedural", "scripting"]},
    ".sim": {"name": "Simula", "tags": ["oop"]},
    ".bcpl": {"name": "BCPL", "tags": ["procedural"]},
    ".l": {"name": "PicoLisp", "tags": ["functional"]},
    ".lsp": {"name": "newLISP", "tags": ["functional", "scripting"]},
    ".do": {"name": "Stata", "tags": ["procedural", "scripting"]},
    ".sas": {"name": "SAS", "tags": ["procedural"]},
    ".pde": {"name": "Processing", "tags": ["oop"]},
    ".ino": {"name": "Arduino", "tags": ["procedural", "hardware"]},
    ".cairo": {"name": "Cairo", "tags": ["procedural"]},
    ".dockerfile": {"name": "Dockerfile", "tags": ["scripting", "markup"]},
    ".mk": {"name": "Makefile", "tags": ["scripting"]},
    ".joy": {"name": "Joy", "tags": ["functional"]}
};

const FILENAME_MAP = {
    "hello_matlab.m":       {"name": "MATLAB",              "description": "Numerical computing environment and programming language",   "tags": ["procedural"]},
    "hello_mercury.m":      {"name": "Mercury",             "description": "Purely declarative logic programming language",              "tags": ["logic", "functional"]},
    "hello_octave.m":       {"name": "Octave",              "description": "Open-source numerical computation language",                 "tags": ["procedural"]},
    "hello_script.go":      {"name": "Go (Script)",         "description": "Go for scripting purposes",                                 "tags": ["procedural", "scripting"]},
    "hello_script.scm":     {"name": "Scheme (Script)",     "description": "Scheme for scripting purposes",                             "tags": ["functional", "scripting"]},
    "hello_script.swift":   {"name": "Swift (Script)",      "description": "Swift for scripting purposes",                              "tags": ["oop", "scripting"]},
    "hello_v.v": {"name": "V", "description": "Simple, fast compiled language", "tags": ["procedural"]},
    "hello_golfscript.gs": {"name": "GolfScript", "description": "Stack-based language for code golf", "tags": ["esoteric", "scripting"]}
};

const DESCRIPTION_DEFAULTS = {
    "Ada":                          "General-purpose, strongly typed language",
    "Ada (Script)":                 "Ada for scripting purposes",
    "ActionScript":                 "Object-oriented language for Adobe Flash and AIR",
    "ALGOL 68":                     "High-level imperative programming language",
    "APL":                          "Array-oriented programming language",
    "AppleScript":                  "Scripting language for macOS",
    "Arc":                          "Lisp dialect for web applications",
    "Assembly":                     "Low-level language for direct hardware control",
    "Assembly (ARM)":               "Low-level language for ARM processors",
    "Assembly (x64)":               "Low-level language for x64 processors",
    "AutoHotkey":                   "Free, open-source macro-creation and automation software",
    "AutoIt":                       "Freeware automation language for Windows GUI",
    "Awk":                          "Text processing language",
    "Ballerina":                    "Cloud-native programming language",
    "Bash":                         "Unix shell and command language",
    "BASIC":                        "Beginner's All-purpose Symbolic Instruction Code",
    "Batch (Windows)":              "Scripting language for Windows command prompt",
    "BeanShell":                    "Lightweight Java scripting language",
    "Boo":                          "Object-oriented, statically typed programming language for .NET",
    "Brainfuck":                    "Minimalistic esoteric programming language",
    "C":                            "General-purpose language for systems programming",
    "C (Script)":                   "C for scripting purposes",
    "C--":                          "Simplified version of C with fewer features",
    "C#":                           "Modern, object-oriented language for .NET",
    "C# Script":                    "C# for scripting purposes",
    "C++":                          "Object-oriented extension of C",
    "C++ (Script)":                 "C++ for scripting purposes",
    "Gleam":                        "Friendly functional language for Erlang BEAM",
    "Mojo":                         "AI-oriented Python-compatible systems language",
    "Solidity":                     "Contract-oriented smart contract programming language",
    "Q#":                           "Quantum programming language from Microsoft",
    "Befunge":                      "Two-dimensional esoteric programming language",
    "Rockstar":                     "Computer programming language designed for creating song lyrics",
    "Chef":                         "Esoteric language where programs look like recipes",
    "ArnoldC":                      "Esoteric language composed of Arnold Schwarzenegger quotes",
    "Odin": "Data-oriented systems language, a C alternative",
    "Nix": "Pure, lazy language for reproducible builds and NixOS",
    "Fish": "Friendly interactive shell",
    "Zsh": "Extended Bourne-style shell",
    "Emacs Lisp": "Extension language of the Emacs editor",
    "GDScript": "Python-like scripting language of the Godot engine",
    "PureScript": "Strongly typed functional language compiling to JavaScript",
    "Idris": "Dependently typed functional language",
    "Lean": "Theorem prover and functional programming language",
    "Agda": "Dependently typed proof assistant language",
    "Pony": "Actor-model language with reference capabilities",
    "Red": "Full-stack language inspired by Rebol",
    "Hy": "Lisp embedded in Python",
    "Fennel": "Lisp that compiles to Lua",
    "Janet": "Embeddable Lisp-like scripting language",
    "Vala": "GObject-based language compiled to C",
    "ReScript": "Typed language that compiles to JavaScript",
    "Nushell": "Shell that treats output as structured data",
    "Wren": "Small, fast, class-based scripting language",
    "Squirrel": "Lightweight scripting language for games",
    "MoonScript": "Indentation-based language compiling to Lua",
    "BQN": "Modern array programming language",
    "Jsonnet": "Data templating language that extends JSON",
    "Pike": "Dynamic C-like language",
    "Hare": "Simple systems programming language",
    "Carbon": "Experimental successor to C++",
    "Uiua": "Stack-based array language",
    "V": "Simple, fast compiled language",
    "Ook!": "Brainfuck for orangutans",
    "Standard ML": "Statically typed functional language with modules",
    "Modula-3": "Modula-2 successor with objects and threads",
    "Oberon": "Minimal successor to Modula-2 by Niklaus Wirth",
    "PL/I": "IBM general-purpose language for business and science",
    "SNOBOL": "String-pattern matching language from Bell Labs",
    "Dhall": "Programmable configuration language",
    "CUDA": "NVIDIA parallel computing platform and C++ dialect",
    "Vyper": "Pythonic smart contract language for the EVM",
    "LaTeX": "Document preparation system for typesetting",
    "PostScript": "Stack-based page description language",
    "CMake": "Build system generator scripting language",
    "SystemVerilog": "Hardware description and verification language",
    "Elvish": "Expressive shell with structured pipelines",
    "Starlark": "Python dialect for build configuration",
    "Nelua": "Lua-like systems language that compiles to C",
    "Koka": "Functional language with algebraic effects",
    "Flix": "Functional language with Datalog and effects",
    "Oz": "Multiparadigm language from the Mozart system",
    "Nemerle": ".NET language with macros",
    "Delphi": "Object Pascal IDE and language by Borland",
    "Curry": "Functional logic language based on Haskell",
    "Pawn": "Small embeddable C-like scripting language",
    "Simula": "First object-oriented language",
    "BCPL": "Typeless ancestor of B and C",
    "PicoLisp": "Minimal Lisp with built-in database",
    "newLISP": "Lisp dialect for scripting",
    "Stata": "Statistical analysis software scripting language",
    "SAS": "Statistical analysis system language",
    "Processing": "Language and IDE for visual arts and learning",
    "Arduino": "C++ dialect for Arduino microcontrollers",
    "Cairo": "Provable programs language for StarkNet",
    "Dockerfile": "Container image build instructions",
    "Makefile": "Build rules for GNU Make",
    "Joy": "Concatenative functional language",
    "GolfScript": "Stack-based language for code golf"
};

function getExtension(filename) {
    const parts = filename.split('.');
    if (parts.length < 2) return '';
    // Special multi-dot extension matching like .cljs.browser or .cljs.node
    const ext2 = '.' + parts.slice(1).join('.');
    if (EXTENSION_MAP[ext2]) return ext2;
    return '.' + parts.pop();
}

function main() {
    console.log(`Scanning ${SOURCE_DIR}...`);
    
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(SOURCE_DIR);
    const langs = [];

    files.forEach(filename => {
        const filepath = path.join(SOURCE_DIR, filename);
        if (!fs.statSync(filepath).isFile()) return;

        const relPath = `hello-world/${filename}`;

        if (FILENAME_MAP[filename]) {
            const entry = FILENAME_MAP[filename];
            langs.push({
                name: entry.name,
                description: entry.description || `Hello World in ${entry.name}`,
                path: relPath,
                tags: entry.tags
            });
            return;
        }

        const ext = getExtension(filename);
        if (EXTENSION_MAP[ext]) {
            const meta = EXTENSION_MAP[ext];
            const name = meta.name;
            const desc = DESCRIPTION_DEFAULTS[name] || `Hello World in ${name}`;
            langs.push({
                name: name,
                description: desc,
                path: relPath,
                tags: meta.tags
            });
        } else {
            console.log(`Unknown extension for file: ${filename}`);
        }
    });

    console.log(`Found ${langs.length} languages.`);

    // Load language_metadata.json if it exists
    let metadata = {};
    if (fs.existsSync(METADATA_PATH)) {
        console.log(`Loading metadata from ${METADATA_PATH}...`);
        try {
            metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
        } catch (e) {
            console.error(`Error loading metadata: ${e.message}`);
        }
    }

    // Merge metadata
    langs.forEach(lang => {
        const name = lang.name;
        // Fallbacks
        lang.creator = "Unknown";
        lang.year = "N/A";
        lang.history = "";
        lang.famousProjects = [];
        lang.frameworks = {};
        lang.quiz = {
            platforms: [],
            backend: false,
            typing: "dynamic",
            speed: "moderate"
        };

        if (metadata[name]) {
            const meta = metadata[name];
            lang.creator = meta.creator || "Unknown";
            lang.year = meta.year || "N/A";
            lang.history = meta.history || "";
            lang.famousProjects = meta.famousProjects || [];
            lang.frameworks = meta.frameworks || {};
            lang.quiz = meta.quiz || {
                platforms: [],
                backend: false,
                typing: "dynamic",
                speed: "moderate"
            };
        }
    });

    // Sort by name case-insensitive
    langs.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

    console.log(`Writing ${OUTPUT_PATH}...`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(langs, null, 2), 'utf-8');
    console.log('Done.');
}

main();
