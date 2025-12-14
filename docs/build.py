import os
import re
import json
import shutil

# Paths
readme_path = "../README.md"
output_json_path = "languages.json"
source_code_dir = "hello-word"

def parse_readme():
    languages = []
    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Regex to find the table rows
        # This is a simple regex, might need adjustment based on exact formatting
        
        # We can find the table first
        table_match = re.search(r'<table>(.*?)</table>', content, re.DOTALL)
        if not table_match:
            print("Table not found")
            return []
            
        table_content = table_match.group(1)
        rows = re.findall(r'<tr>(.*?)</tr>', table_content, re.DOTALL)
        
        for row in rows:
            cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
            if len(cols) == 3:
                name = cols[0].strip()
                desc = cols[1].strip()
                file_cell = cols[2].strip()
                
                # Extract href from file_cell
                # <a href="docs/hello-word/hello.adb">hello.adb</a>
                href_match = re.search(r'href="([^"]+)"', file_cell)
                if href_match:
                    path = href_match.group(1)
                    # Clean path: docs/hello-word/hello.adb -> hello-word/hello.adb
                    if path.startswith("docs/"):
                        path = path[len("docs/"):]
                    
                    languages.append({
                        "name": name,
                        "description": desc,
                        "path": path
                    })
    except Exception as e:
        print(f"Error parsing README: {e}")
        
    return languages

def main():
    # 1. Parse README
    print("Parsing README...")
    langs = parse_readme()
    print(f"Found {len(langs)} languages.")
    
    # 2. Write JSON
    print("Writing languages.json...")
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(langs, f, indent=2)

