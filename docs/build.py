import os
import json

SOURCE_DIR = os.path.join(os.path.dirname(__file__), "hello-world")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "languages.json")

EXTENSION_MAP = {
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
}

FILENAME_MAP = {
    "hello_matlab.m":       {"name": "MATLAB",              "description": "Numerical computing environment and programming language",   "tags": ["procedural"]},
    "hello_mercury.m":      {"name": "Mercury",             "description": "Purely declarative logic programming language",              "tags": ["logic", "functional"]},
    "hello_octave.m":       {"name": "Octave",              "description": "Open-source numerical computation language",                 "tags": ["procedural"]},
    "hello_script.go":      {"name": "Go (Script)",         "description": "Go for scripting purposes",                                 "tags": ["procedural", "scripting"]},
    "hello_script.scm":     {"name": "Scheme (Script)",     "description": "Scheme for scripting purposes",                             "tags": ["functional", "scripting"]},
    "hello_script.swift":   {"name": "Swift (Script)",      "description": "Swift for scripting purposes",                              "tags": ["oop", "scripting"]},
}

DESCRIPTION_DEFAULTS = {
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
}


def get_extension(filename):
    parts = filename.split(".", 1)
    if len(parts) < 2:
        return ""
    return "." + parts[1]


def scan_directory():
    languages = []

    if not os.path.isdir(SOURCE_DIR):
        print(f"Source directory not found: {SOURCE_DIR}")
        return languages

    for filename in sorted(os.listdir(SOURCE_DIR)):
        filepath = os.path.join(SOURCE_DIR, filename)
        if not os.path.isfile(filepath):
            continue

        rel_path = f"hello-world/{filename}"

        if filename in FILENAME_MAP:
            entry = FILENAME_MAP[filename]
            languages.append({
                "name": entry["name"],
                "description": entry.get("description", f"Hello World in {entry['name']}"),
                "path": rel_path,
                "tags": entry["tags"],
            })
            continue

        ext = get_extension(filename)
        if ext in EXTENSION_MAP:
            meta = EXTENSION_MAP[ext]
            name = meta["name"]
            desc = DESCRIPTION_DEFAULTS.get(name, f"Hello World in {name}")
            languages.append({
                "name": name,
                "description": desc,
                "path": rel_path,
                "tags": meta["tags"],
            })
        else:
            print(f"Unknown extension for file: {filename}")

    return languages


def main():
    print(f"Scanning {SOURCE_DIR}...")
    langs = scan_directory()
    print(f"Found {len(langs)} languages.")

    langs.sort(key=lambda x: x["name"].lower())

    print(f"Writing {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(langs, f, indent=2, ensure_ascii=False)

    print("Done.")


if __name__ == "__main__":
    main()
