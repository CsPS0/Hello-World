document.addEventListener('DOMContentLoaded', () => {
    let languages = [];
    let fuse;
    let activeTag = 'all';
    let compareMode = false;
    let compareSelection = [];
    let codeCache = new Map();
    let searchDebounceTimer = null;
    let currentModalLang = null;

    const grid = document.getElementById('languages-grid');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const modal = document.getElementById('code-modal');
    const modalTitle = document.getElementById('modal-title');
    const codeBlock = document.getElementById('code-block');
    const closeModalBtn = document.getElementById('close-modal');
    const copyBtn = document.getElementById('copy-btn');
    const viewRawBtn = document.getElementById('view-raw-btn');
    const downloadBtn = document.getElementById('download-btn');
    const langCount = document.getElementById('lang-count');
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    const compareToggleBtn = document.getElementById('compare-toggle');
    const comparisonPanel = document.getElementById('comparison-panel');
    const comparisonColumns = document.getElementById('comparison-columns');
    const comparisonClear = document.getElementById('comparison-clear');
    const comparisonClose = document.getElementById('comparison-close');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const statsToggle = document.getElementById('stats-toggle');
    const statsContent = document.getElementById('stats-content');
    const statsBadges = document.getElementById('stats-badges');
    const filterBar = document.getElementById('filter-bar');
    const githubStats = document.getElementById('github-stats');

    const DEVICON_MAP = {
        'Python': 'devicon-python-plain',
        'JavaScript': 'devicon-javascript-plain',
        'Java': 'devicon-java-plain',
        'C': 'devicon-c-plain',
        'C++': 'devicon-cplusplus-plain',
        'C#': 'devicon-csharp-plain',
        'Ruby': 'devicon-ruby-plain',
        'Go': 'devicon-go-plain',
        'Rust': 'devicon-rust-plain',
        'TypeScript': 'devicon-typescript-plain',
        'Swift': 'devicon-swift-plain',
        'Kotlin': 'devicon-kotlin-plain',
        'PHP': 'devicon-php-plain',
        'Perl': 'devicon-perl-plain',
        'R': 'devicon-r-plain',
        'Scala': 'devicon-scala-plain',
        'Dart': 'devicon-dart-plain',
        'Elixir': 'devicon-elixir-plain',
        'Haskell': 'devicon-haskell-plain',
        'Lua': 'devicon-lua-plain',
        'OCaml': 'devicon-ocaml-plain',
        'Clojure': 'devicon-clojure-plain',
        'Erlang': 'devicon-erlang-plain',
        'Julia': 'devicon-julia-plain',
        'Fortran': 'devicon-fortran-plain',
        'HTML': 'devicon-html5-plain',
        'MATLAB': 'devicon-matlab-plain',
        'Groovy': 'devicon-groovy-plain',
        'Bash': 'devicon-bash-plain',
        'Vim': 'devicon-vim-plain',
        'CoffeeScript': 'devicon-coffeescript-original',
        'F#': 'devicon-fsharp-plain',
        'Crystal': 'devicon-crystal-original',
        'Elm': 'devicon-elm-plain',
        'Nim': 'devicon-nimble-original',
        'Objective-C': 'devicon-objectivec-plain',
        'Haxe': 'devicon-haxe-plain'
    };

    const TAG_COLORS = {
        'procedural': '#3b82f6',
        'oop': '#8b5cf6',
        'functional': '#10b981',
        'scripting': '#f59e0b',
        'esoteric': '#ef4444',
        'hardware': '#6366f1',
        'logic': '#ec4899',
        'markup': '#14b8a6'
    };

    const TAG_MAP = {
        'procedural': ['C', 'Pascal', 'Fortran', 'Fortran (Fixed)', 'COBOL', 'COBOL (GnuCOBOL)', 'BASIC', 'ALGOL 68', 'Ada', 'Ada (Script)', 'D', 'Zig', 'Nim', 'Go', 'Go (Script)', 'Crystal', 'Chapel', 'Forth', 'Assembly', 'Assembly (ARM)', 'Assembly (x64)'],
        'oop': ['Java', 'C++', 'C++ (Script)', 'C#', 'C# Script', 'Python', 'Ruby', 'Ruby (Script)', 'Swift', 'Swift (Script)', 'Kotlin', 'Kotlin (Script)', 'Dart', 'Scala', 'Groovy', 'Eiffel', 'Smalltalk', 'Objective-C', 'Objective-C++', 'TypeScript', 'CoffeeScript', 'CoffeeScript (Literate)', 'Haxe', 'Ceylon', 'Boo', 'Gambas', 'Gosu', 'Visual Basic .NET', 'Curl'],
        'functional': ['Haskell', 'Haskell (Literate)', 'Elixir', 'Erlang', 'Erlang (Script)', 'Clojure', 'ClojureScript', 'ClojureScript (Browser)', 'ClojureScript (Node)', 'OCaml', 'F#', 'F# (Script)', 'Elm', 'Scheme', 'Scheme (Script)', 'Racket', 'Common Lisp', 'Common Lisp (CLISP)', 'Common Lisp (SBCL)', 'Scala', 'Julia', 'Clean', 'Factor', 'Raku', 'Dylan', 'Arc', 'LiveScript'],
        'scripting': ['Python', 'JavaScript', 'Ruby', 'Ruby (Script)', 'PHP', 'PHP (Script)', 'Perl', 'Perl 5 (Script)', 'Bash', 'Shell', 'Lua', 'R', 'Tcl', 'Awk', 'PowerShell', 'Batch (Windows)', 'VBScript', 'VBA', 'AutoHotkey', 'AutoIt', 'Cython', 'AppleScript', 'BeanShell', 'Lasso', 'Rexx', 'Genie', 'ColdFusion Markup', 'ColdFusion Script', 'Groovy', 'Icon', 'Logo'],
        'esoteric': ['Brainfuck', 'LOLCODE', 'Whitespace', 'Shakespeare', 'Inform 7', 'Holy C'],
        'hardware': ['Verilog', 'VHDL', 'Assembly', 'Assembly (ARM)', 'Assembly (x64)', 'CIL', 'WebAssembly Text'],
        'logic': ['Prolog', 'Datalog', 'Logtalk', 'Mercury'],
        'markup': ['HTML', 'SQL', 'YAML', 'XQuery', 'MATLAB', 'Octave', 'Wolfram Language', 'Maple', 'R']
    };

    function getTagsForLanguage(name) {
        const tags = [];
        for (const [tag, langs] of Object.entries(TAG_MAP)) {
            if (langs.includes(name)) {
                tags.push(tag);
            }
        }
        return tags;
    }

    function slugify(str) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function getExtension(path) {
        const parts = path.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    function getPrismLang(ext) {
        const map = {
            'a68': 'plaintext',
            'adb': 'ada',
            'ads': 'ada',
            'ahk': 'autohotkey',
            'apl': 'apl',
            'applescript': 'applescript',
            'arc': 'lisp',
            'as': 'actionscript',
            'asm': 'nasm',
            'asm64': 'nasm',
            'au3': 'autoit',
            'awk': 'awk',
            'b': 'c',
            'bal': 'plaintext',
            'bas': 'basic',
            'bat': 'batch',
            'bf': 'brainfuck',
            'boo': 'python',
            'bsh': 'java',
            'c': 'c',
            'cbas': 'basic',
            'cbl': 'cobol',
            'ceylon': 'java',
            'cfc': 'clike',
            'cfm': 'markup',
            'chpl': 'plaintext',
            'clisp': 'lisp',
            'clj': 'clojure',
            'cljs': 'clojure',
            'cljs.browser': 'clojure',
            'cljs.node': 'clojure',
            'cls': 'clike',
            'cm': 'c',
            'cmumps': 'plaintext',
            'cob': 'cobol',
            'cobra': 'python',
            'coffee': 'coffeescript',
            'cp': 'pascal',
            'cpp': 'cpp',
            'cppsh': 'cpp',
            'cr': 'crystal',
            'cs': 'csharp',
            'csh': 'c',
            'csx': 'csharp',
            'curl': 'clike',
            'd': 'd',
            'dart': 'dart',
            'dl': 'prolog',
            'dylan': 'plaintext',
            'e': 'eiffel',
            'elm': 'elm',
            'erl': 'erlang',
            'escript': 'erlang',
            'exs': 'elixir',
            'f': 'fortran',
            'f90': 'fortran',
            'factor': 'factor',
            'fs': 'fsharp',
            'fsx': 'fsharp',
            'fth': 'plaintext',
            'gambas': 'basic',
            'go': 'go',
            'groovy': 'groovy',
            'gs': 'python',
            'gsp': 'java',
            'hc': 'c',
            'hh': 'php',
            'hs': 'haskell',
            'html': 'html',
            'hx': 'haxe',
            'icl': 'haskell',
            'icn': 'icon',
            'ijs': 'j',
            'il': 'cil',
            'io': 'io',
            'java': 'java',
            'jl': 'julia',
            'js': 'javascript',
            'k': 'plaintext',
            'kt': 'kotlin',
            'kts': 'kotlin',
            'lasso': 'clike',
            'lgo': 'plaintext',
            'lgt': 'prolog',
            'lhs': 'haskell',
            'lisp': 'lisp',
            'litcoffee': 'coffeescript',
            'lol': 'lolcode',
            'ls': 'livescript',
            'lua': 'lua',
            'm': 'objectivec',
            'mac': 'plaintext',
            'ml': 'ocaml',
            'mm': 'objectivec',
            'mod': 'pascal',
            'mpl': 'plaintext',
            'ni': 'inform7',
            'nim': 'nim',
            'p6': 'perl',
            'pas': 'pascal',
            'php': 'php',
            'phps': 'php',
            'pl': 'perl',
            'plx': 'perl',
            'pro': 'prolog',
            'ps1': 'powershell',
            'py': 'python',
            'pyx': 'python',
            'r': 'r',
            'rb': 'ruby',
            'rbw': 'ruby',
            'rexx': 'plaintext',
            'rkt': 'racket',
            'rs': 'rust',
            's': 'nasm',
            'sbcl': 'lisp',
            'scala': 'scala',
            'scm': 'scheme',
            'sh': 'bash',
            'spl': 'plaintext',
            'sql': 'sql',
            'st': 'smalltalk',
            'swift': 'swift',
            'tcl': 'tcl',
            'ts': 'typescript',
            'v': 'verilog',
            'vb': 'visual-basic',
            'vba': 'visual-basic',
            'vbs': 'visual-basic',
            'vhd': 'vhdl',
            'wat': 'wasm',
            'wl': 'wolfram',
            'ws': 'plaintext',
            'xq': 'xquery',
            'yaml': 'yaml',
            'zig': 'zig'
        };
        return map[ext] || 'plaintext';
    }

    function createDefaultIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const polyline1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline1.setAttribute('points', '16 18 22 12 16 6');
        const polyline2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline2.setAttribute('points', '8 6 2 12 8 18');
        svg.appendChild(polyline1);
        svg.appendChild(polyline2);
        return svg;
    }

    function initTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) {
            document.documentElement.dataset.theme = stored;
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.dataset.theme = 'light';
        } else {
            document.documentElement.dataset.theme = 'dark';
        }
        updateThemeIcons();
    }

    function updateThemeIcons() {
        const isDark = document.documentElement.dataset.theme !== 'light';
        iconSun.classList.toggle('hidden', !isDark);
        iconMoon.classList.toggle('hidden', isDark);
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme;
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
        updateThemeIcons();
    });

    initTheme();

    const clipboard = new ClipboardJS('#copy-btn', {
        text: () => codeBlock.textContent
    });

    clipboard.on('success', () => {
        const span = copyBtn.querySelector('.btn-text');
        span.textContent = 'Copied!';
        setTimeout(() => { span.textContent = 'Copy'; }, 2000);
    });

    fetch('languages.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load languages');
            return res.json();
        })
        .then(data => {
            languages = data.map(lang => {
                const tags = lang.tags || getTagsForLanguage(lang.name);
                return Object.assign({}, lang, { tags: tags });
            });

            if (langCount) langCount.textContent = languages.length;

            fuse = new Fuse(languages, {
                keys: ['name', 'description', 'tags'],
                threshold: 0.3
            });

            skeletonLoader.classList.add('hidden');
            renderGrid(languages);
            renderStats();
            checkDeepLink();
        })
        .catch(err => {
            skeletonLoader.classList.add('hidden');
            const errEl = document.createElement('div');
            errEl.className = 'no-results';
            const errP = document.createElement('p');
            errP.textContent = 'Failed to load languages: ' + err.message;
            errEl.appendChild(errP);
            grid.appendChild(errEl);
        });

    fetch('https://api.github.com/repos/CsPS0/Hello-World')
        .then(res => res.json())
        .then(data => {
            if (data.stargazers_count !== undefined) {
                const starEl = document.createElement('div');
                starEl.className = 'gh-stat';
                const starSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                starSvg.setAttribute('viewBox', '0 0 24 24');
                starSvg.setAttribute('fill', 'currentColor');
                const starPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                starPath.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
                starSvg.appendChild(starPath);
                const starText = document.createElement('span');
                starText.textContent = data.stargazers_count;
                starEl.appendChild(starSvg);
                starEl.appendChild(starText);
                githubStats.appendChild(starEl);

                const forkEl = document.createElement('div');
                forkEl.className = 'gh-stat';
                const forkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                forkSvg.setAttribute('viewBox', '0 0 24 24');
                forkSvg.setAttribute('fill', 'none');
                forkSvg.setAttribute('stroke', 'currentColor');
                forkSvg.setAttribute('stroke-width', '2');
                const forkPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                forkPath1.setAttribute('cx', '12');
                forkPath1.setAttribute('cy', '18');
                forkPath1.setAttribute('r', '3');
                const forkPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                forkPath2.setAttribute('cx', '6');
                forkPath2.setAttribute('cy', '6');
                forkPath2.setAttribute('r', '3');
                const forkPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                forkPath3.setAttribute('cx', '18');
                forkPath3.setAttribute('cy', '6');
                forkPath3.setAttribute('r', '3');
                const forkLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                forkLine.setAttribute('d', 'M18 9a9 9 0 0 1-9 9');
                const forkLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                forkLine2.setAttribute('d', 'M6 9a9 9 0 0 0 9 9');
                forkSvg.appendChild(forkPath1);
                forkSvg.appendChild(forkPath2);
                forkSvg.appendChild(forkPath3);
                forkSvg.appendChild(forkLine);
                forkSvg.appendChild(forkLine2);
                const forkText = document.createElement('span');
                forkText.textContent = data.forks_count;
                forkEl.appendChild(forkSvg);
                forkEl.appendChild(forkText);
                githubStats.appendChild(forkEl);
            }
        })
        .catch(() => {});

    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            applyFilters();
        }, 250);
    });

    filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeTag = chip.dataset.tag;
        filterBar.querySelectorAll('.filter-chip').forEach(c => {
            const isActive = c.dataset.tag === activeTag;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-selected', isActive);
        });
        applyFilters();
    });

    filterBar.addEventListener('keydown', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            chip.click();
        }
    });

    function applyFilters() {
        let filtered = languages;

        if (activeTag !== 'all') {
            filtered = filtered.filter(lang => lang.tags && lang.tags.includes(activeTag));
        }

        const query = searchInput.value.trim();
        if (query.length > 0) {
            const searchFuse = new Fuse(filtered, {
                keys: ['name', 'description', 'tags'],
                threshold: 0.3
            });
            filtered = searchFuse.search(query).map(r => r.item);
        }

        renderGrid(filtered);
    }

    function renderGrid(items) {
        grid.innerHTML = '';

        if (items.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');

        items.forEach(lang => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', lang.name);

            if (compareMode && compareSelection.some(s => s.name === lang.name)) {
                card.classList.add('compare-selected');
            }

            const checkDiv = document.createElement('div');
            checkDiv.className = 'compare-check';
            const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            checkSvg.setAttribute('viewBox', '0 0 24 24');
            checkSvg.setAttribute('fill', 'none');
            checkSvg.setAttribute('stroke', 'currentColor');
            checkSvg.setAttribute('stroke-width', '3');
            const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            checkPath.setAttribute('points', '20 6 9 17 4 12');
            checkSvg.appendChild(checkPath);
            checkDiv.appendChild(checkSvg);
            card.appendChild(checkDiv);

            const titleRow = document.createElement('div');
            titleRow.className = 'card-title-row';

            const iconContainer = document.createElement('div');
            iconContainer.className = 'card-icon';

            const baseName = lang.name.replace(/\s*\(.*\)$/, '');
            const deviconClass = DEVICON_MAP[baseName];
            if (deviconClass) {
                const iconEl = document.createElement('i');
                iconEl.className = deviconClass;
                iconContainer.appendChild(iconEl);
            } else {
                iconContainer.appendChild(createDefaultIcon());
            }

            const h3 = document.createElement('h3');
            h3.textContent = lang.name;

            titleRow.appendChild(iconContainer);
            titleRow.appendChild(h3);
            card.appendChild(titleRow);

            const desc = document.createElement('p');
            desc.textContent = lang.description;
            card.appendChild(desc);

            if (lang.tags && lang.tags.length > 0) {
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'card-tags';
                lang.tags.forEach(tag => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'card-tag';
                    tagEl.textContent = tag;
                    tagsDiv.appendChild(tagEl);
                });
                card.appendChild(tagsDiv);
            }

            card.addEventListener('click', () => {
                if (compareMode) {
                    toggleCompareSelection(lang, card);
                } else {
                    openModal(lang);
                }
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });

            grid.appendChild(card);
        });

        anime({
            targets: grid.querySelectorAll('.card'),
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(30),
            easing: 'easeOutQuad',
            duration: 400
        });
    }

    function renderStats() {
        statsBadges.innerHTML = '';

        const totalBadge = document.createElement('div');
        totalBadge.className = 'stat-badge';
        const totalCount = document.createElement('span');
        totalCount.className = 'stat-count';
        totalCount.textContent = languages.length;
        const totalLabel = document.createElement('span');
        totalLabel.textContent = 'Total';
        totalBadge.appendChild(totalCount);
        totalBadge.appendChild(totalLabel);
        statsBadges.appendChild(totalBadge);

        for (const [tag, color] of Object.entries(TAG_COLORS)) {
            const count = languages.filter(l => l.tags && l.tags.includes(tag)).length;
            if (count === 0) continue;
            const badge = document.createElement('div');
            badge.className = 'stat-badge';
            const dot = document.createElement('span');
            dot.className = 'stat-dot';
            dot.style.backgroundColor = color;
            const countEl = document.createElement('span');
            countEl.className = 'stat-count';
            countEl.textContent = count;
            const label = document.createElement('span');
            label.textContent = tag;
            badge.appendChild(dot);
            badge.appendChild(countEl);
            badge.appendChild(label);
            statsBadges.appendChild(badge);
        }
    }

    statsToggle.addEventListener('click', () => {
        const expanded = statsToggle.getAttribute('aria-expanded') === 'true';
        statsToggle.setAttribute('aria-expanded', !expanded);
        statsContent.classList.toggle('expanded', !expanded);
    });

    function openModal(lang) {
        currentModalLang = lang;
        modalTitle.textContent = lang.name;
        codeBlock.textContent = 'Loading...';
        codeBlock.className = 'language-plaintext';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        location.hash = slugify(lang.name);

        if (codeCache.has(lang.path)) {
            displayCode(codeCache.get(lang.path), lang);
        } else {
            fetch(lang.path)
                .then(res => {
                    if (!res.ok) throw new Error('File not found');
                    return res.text();
                })
                .then(code => {
                    codeCache.set(lang.path, code);
                    displayCode(code, lang);
                })
                .catch(err => {
                    codeBlock.textContent = 'Error loading code: ' + err.message;
                });
        }

        trapFocus(modal.querySelector('.modal-content'));
    }

    function displayCode(code, lang) {
        codeBlock.textContent = code;
        const ext = getExtension(lang.path);
        const prismLang = getPrismLang(ext);
        codeBlock.className = 'language-' + prismLang;
        Prism.highlightElement(codeBlock);
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        currentModalLang = null;
        history.replaceState(null, '', location.pathname + location.search);
    }

    closeModalBtn.addEventListener('click', closeModal);

    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    viewRawBtn.addEventListener('click', () => {
        if (currentModalLang) {
            window.open(currentModalLang.path, '_blank');
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!currentModalLang) return;
        const code = codeBlock.textContent;
        const filename = currentModalLang.path.split('/').pop();
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    function trapFocus(container) {
        const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        first.focus();

        function handler(e) {
            if (e.key !== 'Tab') return;
            if (modal.classList.contains('hidden')) {
                document.removeEventListener('keydown', handler);
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        document.addEventListener('keydown', handler);
    }

    compareToggleBtn.addEventListener('click', () => {
        compareMode = !compareMode;
        compareToggleBtn.classList.toggle('active', compareMode);
        document.body.classList.toggle('compare-mode', compareMode);
        if (!compareMode) {
            clearComparison();
        }
    });

    function toggleCompareSelection(lang, card) {
        const idx = compareSelection.findIndex(s => s.name === lang.name);
        if (idx > -1) {
            compareSelection.splice(idx, 1);
            card.classList.remove('compare-selected');
        } else {
            if (compareSelection.length >= 3) return;
            compareSelection.push(lang);
            card.classList.add('compare-selected');
        }
        updateComparisonPanel();
    }

    function updateComparisonPanel() {
        if (compareSelection.length === 0) {
            comparisonPanel.classList.remove('visible');
            comparisonPanel.classList.add('hidden');
            return;
        }

        comparisonPanel.classList.remove('hidden');
        requestAnimationFrame(() => {
            comparisonPanel.classList.add('visible');
        });

        comparisonColumns.innerHTML = '';
        compareSelection.forEach(lang => {
            const col = document.createElement('div');
            col.className = 'comparison-col';

            const header = document.createElement('div');
            header.className = 'comparison-col-header';
            header.textContent = lang.name;
            col.appendChild(header);

            const codeContainer = document.createElement('div');
            codeContainer.className = 'comparison-col-code';

            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = 'Loading...';

            if (codeCache.has(lang.path)) {
                code.textContent = codeCache.get(lang.path);
                const ext = getExtension(lang.path);
                code.className = 'language-' + getPrismLang(ext);
                pre.appendChild(code);
                codeContainer.appendChild(pre);
                col.appendChild(codeContainer);
                Prism.highlightElement(code);
            } else {
                pre.appendChild(code);
                codeContainer.appendChild(pre);
                col.appendChild(codeContainer);
                fetch(lang.path)
                    .then(res => res.text())
                    .then(text => {
                        codeCache.set(lang.path, text);
                        code.textContent = text;
                        const ext = getExtension(lang.path);
                        code.className = 'language-' + getPrismLang(ext);
                        Prism.highlightElement(code);
                    })
                    .catch(() => {
                        code.textContent = 'Error loading code.';
                    });
            }

            comparisonColumns.appendChild(col);
        });
    }

    function clearComparison() {
        compareSelection = [];
        comparisonPanel.classList.remove('visible');
        setTimeout(() => {
            comparisonPanel.classList.add('hidden');
            comparisonColumns.innerHTML = '';
        }, 350);
        grid.querySelectorAll('.card.compare-selected').forEach(c => {
            c.classList.remove('compare-selected');
        });
    }

    comparisonClear.addEventListener('click', clearComparison);
    comparisonClose.addEventListener('click', () => {
        compareMode = false;
        compareToggleBtn.classList.remove('active');
        document.body.classList.remove('compare-mode');
        clearComparison();
    });

    function checkDeepLink() {
        const hash = location.hash.replace('#', '');
        if (!hash) return;
        const match = languages.find(l => slugify(l.name) === hash);
        if (match) {
            openModal(match);
        }
    }

    window.addEventListener('hashchange', () => {
        const hash = location.hash.replace('#', '');
        if (!hash) return;
        if (modal.classList.contains('hidden')) {
            const match = languages.find(l => slugify(l.name) === hash);
            if (match) openModal(match);
        }
    });
});
