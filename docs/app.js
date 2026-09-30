document.addEventListener('DOMContentLoaded', () => {
    let languages = [];
    let frameworks = [];
    let fuse;
    let activeView = 'languages';
    let activeLayout = 'gallery'; // 'gallery' or 'list'
    let activeTag = 'all';
    let compareMode = false;
    let compareSelection = [];
    let codeCache = new Map();
    let searchDebounceTimer = null;
    let currentModalLang = null;
    let currentModalTab = 'code';

    // Sorting state for table layout
    let sortField = 'name';
    let sortOrder = 'asc';
    let frameworksSortField = 'name';
    let frameworksSortOrder = 'asc';
    let activeFrameworksLayout = 'gallery'; // 'gallery' or 'list'
    let activeFrameworksTag = 'all';
    let frameworksCompareMode = false;
    let frameworksCompareSelection = [];

    // Wizard state
    let wizardCurrentStep = 0;
    const wizardAnswers = {
        projectType: '',
        currentLangs: [],
        currentFrameworks: [],
        platforms: [],
        // Domain-specific sub-questions
        gameRuntime: '',
        gameDimension: '',
        gameGraphics: '',
        webArchitecture: '',
        mobileStrategy: '',
        desktopFramework: '',
        dataFocus: '',
        teamSize: '',
        deployment: '',
        // Core technical preferences
        backend: '',
        typing: '',
        speed: '',
        targetLLM: '',
        tier: ''
    };
    let wizardKeydownHandler = null;

    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const frameworksSearchInput = document.getElementById('frameworks-search-input');
    
    const clearSearchBtn = document.getElementById('clear-search');
    const clearFrameworksSearchBtn = document.getElementById('clear-frameworks-search');
    const randomBtn = document.getElementById('random-btn');
    const layoutToggleBtn = document.getElementById('layout-toggle-btn');
    const noResults = document.getElementById('no-results');
    
    const modal = document.getElementById('code-modal');
    const modalTitle = document.getElementById('modal-title');
    const codeBlock = document.getElementById('code-block');
    const modalHistoryContent = document.getElementById('modal-history-content');
    let currentModalRawCode = '';
    const rawBtn = document.getElementById('raw-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const langCount = document.getElementById('lang-count');
    const footerLangCount = document.getElementById('footer-lang-count');
    
    const themeToggle = document.getElementById('theme-toggle');
    const compareToggleBtn = document.getElementById('compare-toggle');
    const comparisonPanel = document.getElementById('comparison-panel');
    const comparisonColumns = document.getElementById('comparison-columns');
    const comparisonClear = document.getElementById('comparison-clear');
    const comparisonClose = document.getElementById('comparison-close');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const filterBar = document.getElementById('filter-bar');

    // Navigation Tabs
    const tabLanguages = document.getElementById('tab-languages');
    const tabFrameworks = document.getElementById('tab-frameworks');
    const tabWizard = document.getElementById('tab-wizard');
    
    const viewLanguages = document.getElementById('view-languages');
    const viewFrameworks = document.getElementById('view-frameworks');
    const viewWizard = document.getElementById('view-wizard');

    // View sub-layouts
    const languagesGrid = document.getElementById('languages-grid');
    const languagesList = document.getElementById('languages-list');
    const languagesTableBody = document.getElementById('languages-table-body');
    const frameworksLayoutToggleBtn = document.getElementById('frameworks-layout-toggle-btn');
    const frameworksFilterBar = document.getElementById('frameworks-filter-bar');
    const frameworksGrid = document.getElementById('frameworks-grid');
    const frameworksList = document.getElementById('frameworks-list');
    const frameworksRandomBtn = document.getElementById('frameworks-random-btn');
    const frameworksCompareToggleBtn = document.getElementById('frameworks-compare-toggle');

    // Modal Tabs
    const modalTabs = document.querySelectorAll('.modal-tab');
    const modalTabCode = document.getElementById('modal-tab-content-code');
    const modalTabHistory = document.getElementById('modal-tab-content-history');

    // Wizard steps DOM
    const wizardStepContainer = document.getElementById('wizard-step-container');
    const wizardPrev = document.getElementById('wizard-prev');
    const wizardNext = document.getElementById('wizard-next');
    const wizardReset = document.getElementById('wizard-reset');

    const TAG_NAMES = ['procedural', 'oop', 'functional', 'scripting', 'esoteric', 'hardware', 'logic', 'markup'];

    const TAG_MAP = {
        'procedural': ['C', 'Pascal', 'Fortran', 'Fortran (Fixed)', 'COBOL', 'COBOL (GnuCOBOL)', 'BASIC', 'ALGOL 68', 'Ada', 'Ada (Script)', 'D', 'Zig', 'Nim', 'Go', 'Go (Script)', 'Crystal', 'Chapel', 'Forth', 'Assembly', 'Assembly (ARM)', 'Assembly (x64)', 'Limbo', 'Logo', 'C--', 'Caché Basic', 'Caché MUMPS', 'Caché ObjectScript', 'Caché ObjectScript (Class)', 'Component Pascal', 'Component Pascal (BlackBox)', 'Cython', 'Genie', 'Icon', 'LiveScript', 'Maple', 'MATLAB', 'Octave', 'SQL', 'VBA'],
        'oop': ['Java', 'C++', 'C++ (Script)', 'C#', 'C# Script', 'Python', 'Ruby', 'Ruby (Script)', 'Swift', 'Swift (Script)', 'Kotlin', 'Kotlin (Script)', 'Dart', 'Scala', 'Groovy', 'Eiffel', 'Smalltalk', 'Objective-C', 'Objective-C++', 'TypeScript', 'CoffeeScript', 'CoffeeScript (Literate)', 'Haxe', 'Ceylon', 'Boo', 'Gambas', 'Gosu', 'Visual Basic .NET', 'Curl', 'ActionScript', 'Ballerina', 'Caché ObjectScript', 'Caché ObjectScript (Class)', 'Cobra', 'ColdFusion Script', 'Lasso', 'Logtalk', 'PHP'],
        'functional': ['Haskell', 'Haskell (Literate)', 'Elixir', 'Erlang', 'Erlang (Script)', 'Clojure', 'ClojureScript', 'ClojureScript (Browser)', 'ClojureScript (Node)', 'OCaml', 'F#', 'F# (Script)', 'Elm', 'Scheme', 'Scheme (Script)', 'Racket', 'Common Lisp', 'Common Lisp (CLISP)', 'Common Lisp (SBCL)', 'Scala', 'Julia', 'Clean', 'Factor', 'Raku', 'Dylan', 'Arc', 'LiveScript', 'APL', 'J', 'K', 'Mercury', 'Wolfram Language', 'XQuery'],
        'scripting': ['Python', 'JavaScript', 'Ruby', 'Ruby (Script)', 'PHP', 'PHP (Script)', 'Perl', 'Perl 5 (Script)', 'Bash', 'Shell', 'Lua', 'R', 'Tcl', 'Awk', 'PowerShell', 'Batch (Windows)', 'VBScript', 'VBA', 'AutoHotkey', 'AutoIt', 'Cython', 'AppleScript', 'BeanShell', 'Lasso', 'Rexx', 'Genie', 'ColdFusion Markup', 'ColdFusion Script', 'Groovy', 'Icon', 'Logo', 'ActionScript', 'C# Script', 'C++ (Script)', 'ClojureScript (Node)', 'CoffeeScript', 'CoffeeScript (Literate)', 'Erlang (Script)', 'F# (Script)', 'Go (Script)', 'Kotlin (Script)', 'LiveScript', 'Raku', 'Scheme (Script)', 'Swift (Script)'],
        'esoteric': ['Brainfuck', 'LOLCODE', 'Whitespace', 'Shakespeare', 'Inform 7', 'Holy C'],
        'hardware': ['Verilog', 'VHDL', 'Assembly', 'Assembly (ARM)', 'Assembly (x64)', 'CIL', 'WebAssembly Text'],
        'logic': ['Prolog', 'Datalog', 'Logtalk', 'Mercury'],
        'markup': ['HTML', 'SQL', 'YAML', 'XQuery', 'MATLAB', 'Octave', 'Wolfram Language', 'Maple', 'R', 'ColdFusion Markup']
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

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getPrismLang(ext) {
        const map = {
            'a68': 'plaintext', 'adb': 'ada', 'ads': 'ada', 'ahk': 'autohotkey', 'apl': 'apl',
            'applescript': 'applescript', 'arc': 'lisp', 'as': 'actionscript', 'asm': 'nasm',
            'asm64': 'nasm', 'au3': 'autoit', 'awk': 'awk', 'b': 'c', 'bal': 'plaintext',
            'bas': 'basic', 'bat': 'batch', 'bf': 'brainfuck', 'boo': 'python', 'bsh': 'java',
            'c': 'c', 'cbas': 'basic', 'cbl': 'cobol', 'ceylon': 'java', 'cfc': 'clike',
            'cfm': 'markup', 'chpl': 'plaintext', 'clisp': 'lisp', 'clj': 'clojure',
            'cljs': 'clojure', 'cljs.browser': 'clojure', 'cljs.node': 'clojure',
            'cls': 'clike', 'cm': 'c', 'cmumps': 'plaintext', 'cob': 'cobol',
            'cobra': 'python', 'coffee': 'coffeescript', 'cp': 'pascal', 'cpp': 'cpp',
            'cppsh': 'cpp', 'cr': 'crystal', 'cs': 'csharp', 'csh': 'c', 'csx': 'csharp',
            'curl': 'clike', 'd': 'd', 'dart': 'dart', 'dl': 'prolog', 'dylan': 'plaintext',
            'e': 'eiffel', 'elm': 'elm', 'erl': 'erlang', 'escript': 'erlang',
            'exs': 'elixir', 'f': 'fortran', 'f90': 'fortran', 'factor': 'factor',
            'fs': 'fsharp', 'fsx': 'fsharp', 'fth': 'plaintext', 'gambas': 'basic',
            'go': 'go', 'groovy': 'groovy', 'gs': 'python', 'gsp': 'java', 'hc': 'c',
            'hh': 'php', 'hs': 'haskell', 'html': 'html', 'hx': 'haxe', 'icl': 'haskell',
            'icn': 'icon', 'ijs': 'j', 'il': 'cil', 'io': 'io', 'java': 'java',
            'jl': 'julia', 'js': 'javascript', 'k': 'plaintext', 'kt': 'kotlin',
            'kts': 'kotlin', 'lasso': 'clike', 'lgo': 'plaintext', 'lgt': 'prolog',
            'lhs': 'haskell', 'lisp': 'lisp', 'litcoffee': 'coffeescript', 'lol': 'lolcode',
            'ls': 'livescript', 'lua': 'lua', 'm': 'objectivec', 'mac': 'plaintext',
            'ml': 'ocaml', 'mm': 'objectivec', 'mod': 'pascal', 'mpl': 'plaintext',
            'ni': 'inform7', 'nim': 'nim', 'p6': 'perl', 'pas': 'pascal', 'php': 'php',
            'phps': 'php', 'pl': 'perl', 'plx': 'perl', 'pro': 'prolog', 'ps1': 'powershell',
            'py': 'python', 'pyx': 'python', 'r': 'r', 'rb': 'ruby', 'rbw': 'ruby',
            'rexx': 'plaintext', 'rkt': 'racket', 'rs': 'rust', 's': 'nasm',
            'sbcl': 'lisp', 'scala': 'scala', 'scm': 'scheme', 'sh': 'bash',
            'spl': 'plaintext', 'sql': 'sql', 'st': 'smalltalk', 'swift': 'swift',
            'tcl': 'tcl', 'ts': 'typescript', 'v': 'verilog', 'vb': 'visual-basic',
            'vba': 'visual-basic', 'vbs': 'visual-basic', 'vhd': 'vhdl', 'wat': 'wasm',
            'wl': 'wolfram', 'ws': 'plaintext', 'xq': 'xquery', 'yaml': 'yaml', 'zig': 'zig',
            'odin': 'go', 'nix': 'nix', 'fish': 'bash', 'zsh': 'bash', 'el': 'lisp', 'gd': 'gdscript', 'purs': 'haskell', 'idr': 'haskell', 'lean': 'haskell', 'agda': 'haskell', 'hy': 'lisp', 'fnl': 'lisp', 'janet': 'lisp', 'vala': 'vala', 'res': 'reason', 'nu': 'bash', 'wren': 'javascript', 'nut': 'javascript', 'moon': 'lua', 'jsonnet': 'jsonnet', 'pike': 'c', 'ha': 'go', 'carbon': 'cpp',
            'sml': 'ocaml', 'm3': 'pascal', 'ob': 'pascal', 'dhall': 'dhall', 'cu': 'cpp', 'vy': 'python', 'tex': 'latex', 'cmake': 'cmake', 'sv': 'verilog', 'elv': 'bash', 'star': 'python', 'nelua': 'lua', 'n': 'csharp', 'dpr': 'pascal', 'curry': 'haskell', 'pwn': 'c', 'l': 'lisp', 'lsp': 'lisp', 'sas': 'sas', 'pde': 'java', 'ino': 'cpp', 'cairo': 'rust', 'dockerfile': 'docker', 'mk': 'makefile'
        };
        return map[ext] || 'plaintext';
    }

    // View Navigation Router
    function setView(viewName) {
        activeView = viewName;

        // Clear compare modes when swapping tabs
        compareMode = false;
        compareToggleBtn.classList.remove('active');
        compareToggleBtn.textContent = '[ COMPARE: OFF ]';
        frameworksCompareMode = false;
        frameworksCompareToggleBtn.classList.remove('active');
        frameworksCompareToggleBtn.textContent = '[ COMPARE: OFF ]';
        document.body.classList.remove('compare-mode');
        clearComparison();
        clearFrameworksComparison();
        
        // Update Tabs styling
        tabLanguages.classList.toggle('active', viewName === 'languages');
        tabLanguages.setAttribute('aria-selected', viewName === 'languages');
        tabFrameworks.classList.toggle('active', viewName === 'frameworks');
        tabFrameworks.setAttribute('aria-selected', viewName === 'frameworks');
        tabWizard.classList.toggle('active', viewName === 'wizard');
        tabWizard.setAttribute('aria-selected', viewName === 'wizard');

        // Update View container visibility
        viewLanguages.classList.toggle('active', viewName === 'languages');
        viewLanguages.classList.toggle('hidden', viewName !== 'languages');
        viewFrameworks.classList.toggle('active', viewName === 'frameworks');
        viewFrameworks.classList.toggle('hidden', viewName !== 'frameworks');
        viewWizard.classList.toggle('active', viewName === 'wizard');
        viewWizard.classList.toggle('hidden', viewName !== 'wizard');

        if (viewName === 'languages') {
            applyFilters();
        } else if (viewName === 'frameworks') {
            renderFrameworksTable();
        } else if (viewName === 'wizard') {
            renderWizardStep();
        }
    }

    tabLanguages.addEventListener('click', () => setView('languages'));
    tabFrameworks.addEventListener('click', () => setView('frameworks'));
    tabWizard.addEventListener('click', () => setView('wizard'));

    // Theme Management
    function initTheme() {
        const stored = localStorage.getItem('theme');
        if (stored) {
            document.documentElement.dataset.theme = stored;
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.dataset.theme = 'light';
        } else {
            document.documentElement.dataset.theme = 'dark';
        }
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme;
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
    });

    initTheme();

    // Clipboard JS setup
    const clipboard = new ClipboardJS('#copy-btn', {
        text: () => currentModalRawCode
    });

    clipboard.on('success', () => {
        const span = copyBtn.querySelector('.btn-text');
        span.textContent = 'COPIED!';
        setTimeout(() => { span.textContent = 'COPY'; }, 1500);
    });

    // Load Languages & Frameworks
    const loadLanguages = fetch('languages.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load languages.json');
            return res.json();
        })
        .then(data => {
            languages = data.map(lang => {
                const tags = lang.tags || getTagsForLanguage(lang.name);
                return Object.assign({}, lang, { tags: tags });
            });

            if (langCount) langCount.textContent = languages.length;
            if (footerLangCount) footerLangCount.textContent = languages.length;

            // Dynamically update document title and meta descriptions
            const langSize = languages.length;
            document.title = `Hello World — ${langSize} Languages (TUI Console)`;
            
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', `The same program written in ${langSize} different programming languages. Search, read, copy, and compare Hello World source code.`);
            }
            
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) {
                ogTitle.setAttribute('content', `Hello World Collection — ${langSize}+ Languages (TUI Console)`);
            }
            
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) {
                ogDesc.setAttribute('content', `A retro-inspired monospace terminal directory featuring ${langSize} programming languages, complete historical manifests, popular frameworks catalog, side-by-side code comparison, and an interactive developer wizard for targeted LLM setups.`);
            }

            const twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) {
                twitterTitle.setAttribute('content', `Hello World Collection — ${langSize}+ Languages (TUI Console)`);
            }

            const twitterDesc = document.querySelector('meta[name="twitter:description"]');
            if (twitterDesc) {
                twitterDesc.setAttribute('content', `A retro-inspired monospace terminal directory featuring ${langSize} programming languages, complete historical manifests, popular frameworks catalog, side-by-side code comparison, and an interactive developer wizard for targeted LLM setups.`);
            }

            fuse = new Fuse(languages, {
                keys: ['name', 'description', 'tags', 'creator', 'famousProjects'],
                threshold: 0.35
            });

            skeletonLoader.classList.add('hidden');
            applyFilters();
            checkDeepLink();
        });

    const loadFrameworks = fetch('frameworks_metadata.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load frameworks_metadata.json');
            return res.json();
        })
        .then(data => {
            frameworks = data;
        });

    Promise.all([loadLanguages, loadFrameworks]).catch(err => {
        if (skeletonLoader) skeletonLoader.classList.add('hidden');
        const errEl = document.createElement('div');
        errEl.className = 'no-results';
        errEl.textContent = '*** ERROR: FAILED TO PARSE SYSTEM DATABASES: ' + err.message + ' ***';
        if (languagesGrid) languagesGrid.appendChild(errEl);
    });

    // Search input interactions
    searchInput.addEventListener('input', () => {
        const hasText = searchInput.value.length > 0;
        clearSearchBtn.classList.toggle('hidden', !hasText);
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            applyFilters();
        }, 120);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        applyFilters();
        searchInput.focus();
    });

    // Frameworks search input
    frameworksSearchInput.addEventListener('input', () => {
        const hasText = frameworksSearchInput.value.length > 0;
        clearFrameworksSearchBtn.classList.toggle('hidden', !hasText);
        renderFrameworksTable();
    });

    clearFrameworksSearchBtn.addEventListener('click', () => {
        frameworksSearchInput.value = '';
        clearFrameworksSearchBtn.classList.add('hidden');
        renderFrameworksTable();
        frameworksSearchInput.focus();
    });

    // Random Selector
    randomBtn.addEventListener('click', () => {
        if (languages.length === 0) return;
        const index = Math.floor(Math.random() * languages.length);
        openModal(languages[index]);
    });

    // Layout Toggle Switch
    layoutToggleBtn.addEventListener('click', () => {
        activeLayout = activeLayout === 'gallery' ? 'list' : 'gallery';
        layoutToggleBtn.textContent = activeLayout === 'gallery' ? '[ VIEW: GALLERY ]' : '[ VIEW: LIST ]';
        applyFilters();
    });

    // Paradigm filter chip select
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

    // Frameworks Layout Toggle Switch
    frameworksLayoutToggleBtn.addEventListener('click', () => {
        activeFrameworksLayout = activeFrameworksLayout === 'gallery' ? 'list' : 'gallery';
        frameworksLayoutToggleBtn.textContent = activeFrameworksLayout === 'gallery' ? '[ VIEW: GALLERY ]' : '[ VIEW: LIST ]';
        renderFrameworksTable();
    });

    // Frameworks Category filter chip select
    frameworksFilterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeFrameworksTag = chip.dataset.type;
        frameworksFilterBar.querySelectorAll('.filter-chip').forEach(c => {
            const isActive = c.dataset.type === activeFrameworksTag;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-selected', isActive);
        });
        renderFrameworksTable();
    });

    // Frameworks Random Selector
    frameworksRandomBtn.addEventListener('click', () => {
        if (frameworks.length === 0) return;
        const index = Math.floor(Math.random() * frameworks.length);
        const fw = frameworks[index];
        const parentLang = languages.find(l => l.name.toLowerCase() === fw.language.toLowerCase());
        if (parentLang) openModal(parentLang);
    });

    // Frameworks Compare Mode Toggle
    frameworksCompareToggleBtn.addEventListener('click', () => {
        frameworksCompareMode = !frameworksCompareMode;
        frameworksCompareToggleBtn.classList.toggle('active', frameworksCompareMode);
        frameworksCompareToggleBtn.textContent = frameworksCompareMode ? '[ COMPARE: ON ]' : '[ COMPARE: OFF ]';
        document.body.classList.toggle('compare-mode', frameworksCompareMode);
        if (!frameworksCompareMode) {
            clearFrameworksComparison();
        }
    });

    function applyFilters() {
        let filtered = languages;

        if (activeTag !== 'all') {
            filtered = filtered.filter(lang => lang.tags && lang.tags.includes(activeTag));
        }

        const query = searchInput.value.trim();
        if (query.length > 0) {
            filtered = fuse.search(query).map(r => r.item);
        }

        if (activeLayout === 'gallery') {
            languagesGrid.classList.remove('hidden');
            languagesList.classList.add('hidden');
            renderGrid(filtered);
        } else {
            languagesGrid.classList.add('hidden');
            languagesList.classList.remove('hidden');
            renderListTable(filtered);
        }
    }

    // Grid Rendering
    function renderGrid(items) {
        languagesGrid.innerHTML = '';

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
            checkDiv.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            card.appendChild(checkDiv);

            const h3 = document.createElement('h3');
            h3.textContent = lang.name;
            card.appendChild(h3);

            const desc = document.createElement('p');
            desc.textContent = lang.description;
            card.appendChild(desc);

            const footerTags = document.createElement('div');
            footerTags.className = 'card-tags';

            // Extension badge
            const ext = getExtension(lang.path);
            if (ext) {
                const extBadge = document.createElement('span');
                extBadge.className = 'card-tag lang-ext';
                extBadge.textContent = `.${ext}`;
                footerTags.appendChild(extBadge);
            }

            // Primary Paradigm tag
            if (lang.tags && lang.tags.length > 0) {
                const tagEl = document.createElement('span');
                tagEl.className = 'card-tag';
                tagEl.textContent = `[${lang.tags[0].toUpperCase()}]`;
                footerTags.appendChild(tagEl);
            }
            card.appendChild(footerTags);

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

            languagesGrid.appendChild(card);
        });


    }

    // List Table Rendering & Sorting
    function renderListTable(items) {
        languagesTableBody.innerHTML = '';

        if (items.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');

        // Copy array for sorting
        const sortedItems = [...items];

        sortedItems.sort((a, b) => {
            let valA, valB;
            if (sortField === 'famous') {
                const getEco = (lang) => {
                    const projs = [...(lang.famousProjects || [])];
                    if (lang.frameworks) {
                        Object.values(lang.frameworks).forEach(list => projs.push(...list));
                    }
                    return projs.join(', ').toLowerCase();
                };
                valA = getEco(a);
                valB = getEco(b);
            } else if (sortField === 'year') {
                valA = parseInt(a.year) || (sortOrder === 'asc' ? 9999 : -1);
                valB = parseInt(b.year) || (sortOrder === 'asc' ? 9999 : -1);
            } else {
                valA = String(a[sortField] || '').toLowerCase();
                valB = String(b[sortField] || '').toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        sortedItems.forEach(lang => {
            const tr = document.createElement('tr');
            
            // Build Famous Projects + Frameworks list
            const projs = [...(lang.famousProjects || [])];
            if (lang.frameworks) {
                Object.values(lang.frameworks).forEach(list => {
                    projs.push(...list);
                });
            }
            const ecosystemStr = projs.length > 0 ? projs.slice(0, 5).join(', ') : 'None';

            tr.innerHTML = `
                <td>${escapeHTML(lang.name)}</td>
                <td>${escapeHTML(String(lang.creator || 'Unknown'))}</td>
                <td>${escapeHTML(String(lang.year || 'N/A'))}</td>
                <td><span class="row-projects">${escapeHTML(ecosystemStr)}</span></td>
            `;

            tr.addEventListener('click', () => openModal(lang));
            languagesTableBody.appendChild(tr);
        });
    }

    document.querySelectorAll('#languages-list th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (sortField === field) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortOrder = 'asc';
            }

            // Update arrow indicator
            document.querySelectorAll('#languages-list th .sort-icon').forEach(icon => icon.textContent = '');
            const icon = th.querySelector('.sort-icon');
            icon.textContent = sortOrder === 'asc' ? ' ▲' : ' ▼';

            applyFilters();
        });
    });



    // Frameworks Table Render & Sort
    // Frameworks Table Render & Sort
    function renderFrameworksTable() {
        const body = document.getElementById('frameworks-table-body');
        body.innerHTML = '';
        frameworksGrid.innerHTML = '';

        // 1. Filter by category tags
        let items = frameworks;
        if (activeFrameworksTag !== 'all') {
            items = items.filter(fw => {
                const type = fw.type.toLowerCase();
                if (activeFrameworksTag === 'web') return type.includes('web');
                if (activeFrameworksTag === 'game') return type.includes('game');
                if (activeFrameworksTag === 'mobile') return type.includes('mobile') || type.includes('ui');
                if (activeFrameworksTag === 'data') return type.includes('data') || type.includes('ai') || type.includes('plot') || type.includes('ggplot');
                return false;
            });
        }

        // 2. Filter by search input query
        const query = frameworksSearchInput.value.trim().toLowerCase();
        if (query) {
            items = items.filter(fw => (
                fw.name.toLowerCase().includes(query) ||
                fw.type.toLowerCase().includes(query) ||
                fw.language.toLowerCase().includes(query) ||
                fw.description.toLowerCase().includes(query) ||
                (fw.famousProjects && fw.famousProjects.some(p => p.toLowerCase().includes(query)))
            ));
        }

        // 3. Sort
        items.sort((a, b) => {
            const valA = String(a[frameworksSortField] || '').toLowerCase();
            const valB = String(b[frameworksSortField] || '').toLowerCase();

            if (valA < valB) return frameworksSortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return frameworksSortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        // 4. Toggle Layout View
        if (activeFrameworksLayout === 'gallery') {
            frameworksGrid.classList.remove('hidden');
            frameworksList.classList.add('hidden');

            if (items.length === 0) {
                noResults.classList.remove('hidden');
                return;
            }
            noResults.classList.add('hidden');

            items.forEach(fw => {
                const card = document.createElement('div');
                card.className = 'card';
                if (frameworksCompareMode && frameworksCompareSelection.some(s => s.name === fw.name)) {
                    card.classList.add('compare-selected');
                }
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                card.setAttribute('aria-label', fw.name);

                const h3 = document.createElement('h3');
                h3.textContent = fw.name;
                card.appendChild(h3);

                const desc = document.createElement('p');
                // Display description + famous projects in body
                const projText = fw.famousProjects && fw.famousProjects.length > 0
                    ? ` (Famous: ${fw.famousProjects.join(', ')})`
                    : '';
                desc.textContent = fw.description + projText;
                card.appendChild(desc);

                const footerTags = document.createElement('div');
                footerTags.className = 'card-tags';

                // Category badge
                const catBadge = document.createElement('span');
                catBadge.className = 'card-tag';
                catBadge.textContent = `[${fw.type.toUpperCase()}]`;
                footerTags.appendChild(catBadge);

                // Host language badge (interactive language link)
                const langBadge = document.createElement('span');
                langBadge.className = 'card-tag lang-ext btn-lang-link';
                langBadge.textContent = fw.language;
                footerTags.appendChild(langBadge);

                card.appendChild(footerTags);

                langBadge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parentLang = languages.find(l => l.name.toLowerCase() === fw.language.toLowerCase());
                    if (parentLang) openModal(parentLang);
                });

                card.addEventListener('click', () => {
                    if (frameworksCompareMode) {
                        toggleFrameworksCompareSelection(fw, card);
                    } else {
                        const parentLang = languages.find(l => l.name.toLowerCase() === fw.language.toLowerCase());
                        if (parentLang) openModal(parentLang);
                    }
                });

                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        card.click();
                    }
                });

                frameworksGrid.appendChild(card);
            });
        } else {
            frameworksGrid.classList.add('hidden');
            frameworksList.classList.remove('hidden');

            if (items.length === 0) {
                noResults.classList.remove('hidden');
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="4" style="text-align: center; color: var(--accent);">*** NO RECORDS MATCH SEARCH QUERY ***</td>`;
                body.appendChild(tr);
                return;
            }
            noResults.classList.add('hidden');

            items.forEach(fw => {
                const tr = document.createElement('tr');
                
                const projectsStr = fw.famousProjects && fw.famousProjects.length > 0 
                    ? `${fw.description} (Famous: ${fw.famousProjects.join(', ')})`
                    : fw.description;

                tr.innerHTML = `
                    <td>${escapeHTML(fw.name)}</td>
                    <td>${escapeHTML(fw.type)}</td>
                    <td><span class="btn-lang-link" data-lang="${escapeHTML(fw.language)}">${escapeHTML(fw.language)}</span></td>
                    <td><span class="row-projects">${escapeHTML(projectsStr)}</span></td>
                `;

                const linkSpan = tr.querySelector('.btn-lang-link');
                linkSpan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parentLang = languages.find(l => l.name.toLowerCase() === fw.language.toLowerCase());
                    if (parentLang) openModal(parentLang);
                });

                tr.addEventListener('click', () => {
                    const parentLang = languages.find(l => l.name.toLowerCase() === fw.language.toLowerCase());
                    if (parentLang) openModal(parentLang);
                });

                body.appendChild(tr);
            });
        }
    }

    document.querySelectorAll('#view-frameworks th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (frameworksSortField === field) {
                frameworksSortOrder = frameworksSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                frameworksSortField = field;
                frameworksSortOrder = 'asc';
            }

            // Update arrow indicator
            document.querySelectorAll('#view-frameworks th .sort-icon').forEach(icon => icon.textContent = '');
            const icon = th.querySelector('.sort-icon');
            icon.textContent = frameworksSortOrder === 'asc' ? ' ▲' : ' ▼';

            renderFrameworksTable();
        });
    });

    // Smart Wizard Questionnaire — Advanced Multi-Select Branching
    function getWizardSteps() {
        const steps = [];
        let stepNum = 1;

        steps.push({
            key: 'projectType',
            question: `${stepNum++}. SELECT PROJECT INITIALIZATION TYPE:`,
            options: [
                { value: 'new', text: 'New Greenfield Project (Starting from scratch)' },
                { value: 'existing', text: 'Existing Project (Migrating, enhancing, or adding features)' }
            ]
        });

        if (wizardAnswers.projectType === 'existing') {
            steps.push({
                key: 'currentLangs',
                multi: true,
                question: `${stepNum++}. WHAT LANGUAGES DOES YOUR EXISTING CODEBASE USE?`,
                hint: 'Select all that apply, then press CONFIRM.',
                options: [
                    { value: 'javascript', text: 'JavaScript / TypeScript' },
                    { value: 'python', text: 'Python' },
                    { value: 'cpp', text: 'C / C++' },
                    { value: 'rust', text: 'Rust' },
                    { value: 'go', text: 'Go' },
                    { value: 'java', text: 'Java / Kotlin' },
                    { value: 'csharp', text: 'C# / .NET' },
                    { value: 'swift', text: 'Swift / Objective-C' },
                    { value: 'php', text: 'PHP' },
                    { value: 'ruby', text: 'Ruby' },
                    { value: 'other', text: 'Other' }
                ]
            });
            steps.push({
                key: 'currentFrameworks',
                multi: true,
                question: `${stepNum++}. WHAT FRAMEWORKS / LIBRARIES ARE YOU ALREADY USING?`,
                hint: 'Select all that apply, then press CONFIRM.',
                options: [
                    { value: 'react', text: 'React / Next.js / Remix' },
                    { value: 'vue', text: 'Vue / Nuxt' },
                    { value: 'svelte', text: 'Svelte / SvelteKit' },
                    { value: 'angular', text: 'Angular' },
                    { value: 'django', text: 'Django / Flask / FastAPI' },
                    { value: 'spring', text: 'Spring Boot / Java ecosystem' },
                    { value: 'dotnet', text: 'ASP.NET Core / .NET / Blazor' },
                    { value: 'unity', text: 'Unity / Godot / Game engines' },
                    { value: 'flutter', text: 'Flutter / React Native / Mobile SDKs' },
                    { value: 'none', text: 'None / Standard Library only' }
                ]
            });
        }

        // STEP: Platform/domain (MULTI-SELECT)
        steps.push({
            key: 'platforms',
            multi: true,
            question: `${stepNum++}. WHAT PLATFORMS ARE YOU TARGETING?`,
            hint: 'Select all that apply (e.g. Web + Mobile for a full product).',
            options: [
                { value: 'web-frontend', text: 'Web Frontend — UI / SPA / Browser app' },
                { value: 'web-backend', text: 'Web Backend — REST API / Server / Microservice' },
                { value: 'mobile', text: 'Mobile — iOS / Android app' },
                { value: 'desktop', text: 'Desktop — Windows / macOS / Linux GUI' },
                { value: 'game', text: 'Game — 2D / 3D game development' },
                { value: 'systems', text: 'Systems / Embedded — Kernel, drivers, bare-metal' },
                { value: 'cli', text: 'CLI — Scripts, automation, shell tools' },
                { value: 'data-science', text: 'Data Science / AI — ML models, analysis' }
            ]
        });

        const plats = wizardAnswers.platforms || [];

        // DOMAIN-SPECIFIC BRANCHES (conditional on selected platforms)
        if (plats.includes('game')) {
            steps.push({
                key: 'gameRuntime',
                question: `${stepNum++}. HOW SHOULD YOUR GAME BE DELIVERED?`,
                options: [
                    { value: 'native-engine', text: 'Native Engine (Unity, Unreal, Godot) — Standalone .exe' },
                    { value: 'browser', text: 'Browser / HTML5 — Play in browser (WebGL/Canvas)' },
                    { value: 'mobile-game', text: 'Mobile Game — App Store / Google Play' },
                    { value: 'console', text: 'Console — PlayStation, Xbox, Nintendo Switch' }
                ]
            });
            steps.push({
                key: 'gameDimension',
                question: `${stepNum++}. SELECT GAME DIMENSION TYPE:`,
                options: [
                    { value: '2d', text: '2D — Sprites, pixel art, top-down, side-scroller' },
                    { value: '3d', text: '3D — Full 3D environment, camera, lighting, meshes' },
                    { value: '2.5d', text: '2.5D — Isometric or 3D graphics on a 2D plane' }
                ]
            });
            steps.push({
                key: 'gameGraphics',
                question: `${stepNum++}. SELECT GRAPHICS QUALITY:`,
                options: [
                    { value: 'minimal', text: 'Minimal / Retro — ASCII, pixel art, simple shapes' },
                    { value: 'stylized', text: 'Stylized — Cartoon, cel-shaded, low-poly' },
                    { value: 'realistic', text: 'Realistic / AAA — PBR, ray-tracing, photorealism' }
                ]
            });
        }

        if (plats.includes('web-frontend')) {
            steps.push({
                key: 'webArchitecture',
                question: `${stepNum++}. SELECT WEB APPLICATION ARCHITECTURE:`,
                options: [
                    { value: 'spa', text: 'SPA — Client-side rendering (React, Vue, Svelte)' },
                    { value: 'ssr', text: 'SSR — Server-Side Rendered (Next.js, Nuxt, SvelteKit)' },
                    { value: 'ssg', text: 'SSG — Static Site Generator (Astro, Hugo, 11ty)' },
                    { value: 'mpa', text: 'MPA — Traditional multi-page (Rails, Django, Laravel)' }
                ]
            });
        }

        if (plats.includes('mobile')) {
            steps.push({
                key: 'mobileStrategy',
                question: `${stepNum++}. SELECT MOBILE DEVELOPMENT STRATEGY:`,
                options: [
                    { value: 'native-ios', text: 'Native iOS — Swift / SwiftUI' },
                    { value: 'native-android', text: 'Native Android — Kotlin / Jetpack Compose' },
                    { value: 'cross-platform', text: 'Cross-Platform — Flutter / React Native / MAUI' },
                    { value: 'pwa', text: 'PWA — Progressive Web App' }
                ]
            });
        }

        if (plats.includes('desktop')) {
            steps.push({
                key: 'desktopFramework',
                question: `${stepNum++}. SELECT DESKTOP FRAMEWORK APPROACH:`,
                options: [
                    { value: 'electron', text: 'Electron / Tauri — Web tech packaged as desktop' },
                    { value: 'native-qt', text: 'Native C++ / Qt — Max performance, OS integration' },
                    { value: 'dotnet-gui', text: '.NET (WPF / MAUI) — Windows-first or cross-platform' },
                    { value: 'swiftui-mac', text: 'SwiftUI / AppKit — macOS native' },
                    { value: 'gtk', text: 'GTK / Tk / Kivy — Linux-first, lightweight' }
                ]
            });
        }

        if (plats.includes('data-science')) {
            steps.push({
                key: 'dataFocus',
                question: `${stepNum++}. SELECT DATA SCIENCE / AI FOCUS:`,
                options: [
                    { value: 'ml-training', text: 'Model Training — Neural networks, fine-tuning, deep learning' },
                    { value: 'data-analysis', text: 'Data Analysis — Dashboards, ETL, statistics' },
                    { value: 'ml-inference', text: 'Model Deployment — API serving, edge inference' },
                    { value: 'nlp', text: 'NLP / LLMs — Text generation, chatbots, NLU' },
                    { value: 'cv', text: 'Computer Vision — Image/video processing, detection' }
                ]
            });
        }

        // STEP: Deployment
        steps.push({
            key: 'deployment',
            question: `${stepNum++}. SELECT TARGET DEPLOYMENT ENVIRONMENT:`,
            options: [
                { value: 'serverless', text: 'Serverless / Edge — Vercel, AWS Lambda, Cloudflare Workers' },
                { value: 'container', text: 'Containerized — Docker, Kubernetes, Cloud Run' },
                { value: 'vps', text: 'Traditional VPS — EC2, DigitalOcean, self-managed Linux' },
                { value: 'bare-metal', text: 'Bare Metal / Embedded — Direct hardware, IoT, Raspberry Pi' },
                { value: 'none', text: 'None — Local execution only (CLI, Desktop app, Game)' }
            ]
        });

        // STEP: Team size
        steps.push({
            key: 'teamSize',
            question: `${stepNum++}. HOW LARGE IS YOUR DEVELOPMENT TEAM?`,
            options: [
                { value: 'solo', text: 'Solo Developer — Just me, maximize velocity and simplicity' },
                { value: 'small', text: 'Small Team (2-5) — Need reasonable conventions but stay agile' },
                { value: 'large', text: 'Large Team (6+) — Need strict architecture, linting, CI/CD, code review' }
            ]
        });

        // STEP: Backend
        steps.push({
            key: 'backend',
            question: `${stepNum++}. DO YOU NEED INTERNET OR DATABASE CLIENT CONNECTIONS (BACKEND STORAGE)?`,
            options: [
                { value: 'yes', text: 'Yes, connecting to database repositories, user sessions, or Cloud buckets.' },
                { value: 'no', text: 'No, self-contained executor, driver, local UI, or mathematical script.' }
            ]
        });

        // STEP: Typing
        steps.push({
            key: 'typing',
            question: `${stepNum++}. SELECT TYPING SYSTEM PREFERENCE AND STRUCTURAL RIGIDITY:`,
            options: [
                { value: 'static', text: 'Statically Typed (Type safety, strict compile checks, scalable code)' },
                { value: 'dynamic', text: 'Dynamically Typed (Flexibility, rapid prototyping, direct runtime execute)' },
                { value: 'any', text: 'No preference — I am fine with both.' }
            ]
        });

        // STEP: Speed
        steps.push({
            key: 'speed',
            question: `${stepNum++}. SELECT PRIMARY PERFORMANCE REQUIREMENT:`,
            options: [
                { value: 'high', text: 'High Execution Speed — Low latency, high throughput, zero garbage collector.' },
                { value: 'moderate', text: 'High Developer Velocity — Readable code, rapid iterations, automatic memory.' },
                { value: 'balanced', text: 'Balanced — Needs solid speed, but compile times and simple code are key.' }
            ]
        });

        // STEP: LLM
        steps.push({
            key: 'targetLLM',
            question: `${stepNum++}. SELECT THE AI ASSISTANT / LLM SYSTEM YOU ARE USING TO WRITE CODE:`,
            options: [
                { value: 'claude', text: 'Claude (Anthropic) — Claude Code, Cursor, Zed, Windsurf' },
                { value: 'gemini', text: 'Gemini (Google) — Gemini CLI, Android Studio, Firebase' },
                { value: 'gpt', text: 'ChatGPT / Copilot (OpenAI) — GitHub Copilot, ChatGPT' },
                { value: 'local', text: 'Local / Open-Source LLMs — Ollama, Neovim plugins, DeepSeek' },
                { value: 'none', text: 'No AI Assistant — Manual coding only' }
            ]
        });

        // STEP: Tier (conditional — skip if no AI)
        if (wizardAnswers.targetLLM && wizardAnswers.targetLLM !== 'none') {
            steps.push({
                key: 'tier',
                question: `${stepNum++}. SELECT YOUR AI ACCOUNT TIER / PREFERRED COST:`,
                options: [
                    { value: 'pro', text: 'Premium / Paid Tier (Maximum intelligence, reasoning, larger context)' },
                    { value: 'free', text: 'Free / Cheap Tier (Fast, cost-effective, or rate-limit friendly models)' }
                ]
            });
        }

        return steps;
    }

    function renderWizardStep() {
        wizardStepContainer.innerHTML = '';
        const steps = getWizardSteps();

        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'wizard-progress';
        for (let i = 0; i < steps.length; i++) {
            if (i > 0) {
                const line = document.createElement('div');
                line.className = 'wizard-progress-line' + (i <= wizardCurrentStep ? ' done' : '');
                progressBar.appendChild(line);
            }
            const dot = document.createElement('div');
            dot.className = 'wizard-progress-dot';
            if (i < wizardCurrentStep) dot.classList.add('done');
            if (i === wizardCurrentStep) dot.classList.add('active');
            progressBar.appendChild(dot);
        }
        wizardStepContainer.appendChild(progressBar);

        // Terminal History Log
        const historyContainer = document.createElement('div');
        historyContainer.className = 'wizard-history';
        for (let i = 0; i < wizardCurrentStep; i++) {
            const pastStep = steps[i];
            if (!pastStep) continue;
            const ans = wizardAnswers[pastStep.key];
            if (!ans || (Array.isArray(ans) && ans.length === 0)) continue;
            
            let ansText = '';
            if (Array.isArray(ans)) {
                ansText = pastStep.options.filter(o => ans.includes(o.value)).map(o => o.text.split('—')[0].trim()).join(', ');
            } else {
                const opt = pastStep.options.find(o => o.value === ans);
                ansText = opt ? opt.text.split('—')[0].trim() : ans;
            }
            
            const line = document.createElement('div');
            line.className = 'wizard-history-line';
            line.innerHTML = `> ${pastStep.question} <span class="ans">[${ansText}]</span>`;
            historyContainer.appendChild(line);
        }
        if (historyContainer.childNodes.length > 0) {
            wizardStepContainer.appendChild(historyContainer);
        }

        if (wizardCurrentStep < steps.length) {
            const step = steps[wizardCurrentStep];
            const isMulti = step.multi === true;

            const qEl = document.createElement('div');
            qEl.className = 'wizard-question';
            wizardStepContainer.appendChild(qEl);
            
            // Typing effect
            let charIndex = 0;
            const textToType = step.question;
            qEl.innerHTML = '<span class="wizard-cursor"></span>';
            const cursorEl = qEl.querySelector('.wizard-cursor');
            
            function typeChar() {
                if (charIndex < textToType.length) {
                    qEl.insertBefore(document.createTextNode(textToType.charAt(charIndex)), cursorEl);
                    charIndex++;
                    setTimeout(typeChar, 15);
                }
            }
            typeChar();

            if (step.hint) {
                const hintEl = document.createElement('div');
                hintEl.className = 'wizard-hint';
                hintEl.textContent = step.hint;
                wizardStepContainer.appendChild(hintEl);
            }

            const optContainer = document.createElement('div');
            optContainer.className = 'wizard-options';
            
            // Keyboard navigation
            if (wizardKeydownHandler) {
                document.removeEventListener('keydown', wizardKeydownHandler);
            }
            wizardKeydownHandler = (e) => {
                if (activeView !== 'wizard') return;
                const num = parseInt(e.key);
                if (!isNaN(num) && num > 0 && num <= step.options.length) {
                    const btns = optContainer.querySelectorAll('.wizard-option');
                    if (btns[num - 1]) {
                        btns[num - 1].click();
                    }
                } else if (e.key === 'Enter' && isMulti) {
                    const confirmBtn = optContainer.querySelector('.wizard-confirm-btn');
                    if (confirmBtn && !confirmBtn.disabled) confirmBtn.click();
                }
            };
            document.addEventListener('keydown', wizardKeydownHandler);

            if (isMulti) {
                const currentArr = wizardAnswers[step.key] || [];

                step.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'wizard-option';
                    const isSel = currentArr.includes(opt.value);
                    if (isSel) btn.classList.add('multi-selected');
                    btn.textContent = `${isSel ? '[+]' : '[ ]'} ${opt.text}`;

                    btn.addEventListener('click', () => {
                        let arr = wizardAnswers[step.key] || [];
                        if (arr.includes(opt.value)) {
                            arr = arr.filter(v => v !== opt.value);
                        } else {
                            arr.push(opt.value);
                        }
                        wizardAnswers[step.key] = arr;
                        renderWizardStep();
                    });
                    optContainer.appendChild(btn);
                });

                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'wizard-confirm-btn';
                confirmBtn.textContent = `[ CONFIRM ${currentArr.length} SELECTED ]`;
                confirmBtn.disabled = currentArr.length === 0;
                confirmBtn.addEventListener('click', () => {
                    if (currentArr.length > 0) {
                        wizardCurrentStep++;
                        renderWizardStep();
                    }
                });
                optContainer.appendChild(confirmBtn);
            } else {
                step.options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'wizard-option';
                    const isSelected = wizardAnswers[step.key] === opt.value;
                    if (isSelected) btn.classList.add('selected');
                    btn.textContent = `${isSelected ? '[X]' : '[ ]'} ${opt.text}`;

                    btn.addEventListener('click', () => {
                        wizardAnswers[step.key] = opt.value;
                        optContainer.querySelectorAll('.wizard-option').forEach(b => {
                            b.classList.remove('selected');
                            b.textContent = b.textContent.replace('[X]', '[ ]');
                        });
                        btn.classList.add('selected');
                        btn.textContent = btn.textContent.replace('[ ]', '[X]');
                        setTimeout(() => {
                            wizardCurrentStep++;
                            renderWizardStep();
                        }, 200);
                    });
                    optContainer.appendChild(btn);
                });
            }

            wizardStepContainer.appendChild(optContainer);
            wizardPrev.classList.toggle('hidden', wizardCurrentStep === 0);
            wizardNext.classList.remove('hidden');
            wizardReset.classList.add('hidden');
        } else {
            renderWizardResults();
        }
    }

    function renderWizardResults() {
        wizardStepContainer.innerHTML = '';
        const resultsList = document.createElement('div');
        resultsList.className = 'wizard-results';

        const plats = wizardAnswers.platforms || [];
        const platLabels = {
            'web-frontend': 'Web Frontend', 'web-backend': 'Web Backend',
            'mobile': 'Mobile', 'desktop': 'Desktop', 'game': 'Game',
            'systems': 'Systems/Embedded', 'cli': 'CLI', 'data-science': 'Data Science / AI'
        };

        // ------- SCORING ENGINE -------
        const scores = languages.map(lang => {
            let score = 0;
            const q = lang.quiz;
            if (!q) return { lang, score: 0 };

            // Existing project affinity
            if (wizardAnswers.projectType === 'existing') {
                const nl = lang.name.toLowerCase();
                const langMap = {
                    javascript: ['javascript', 'typescript'], python: ['python'],
                    cpp: ['c', 'c++', 'c--'], rust: ['rust'], go: ['go', 'go (script)'],
                    java: ['java', 'kotlin', 'scala'], csharp: ['c#', 'c# script'],
                    swift: ['swift', 'objective-c'], php: ['php'], ruby: ['ruby']
                };
                const cLangs = wizardAnswers.currentLangs || [];
                for (const cl of cLangs) {
                    if (langMap[cl]?.includes(nl)) { score += 50; break; }
                }
                const cFws = wizardAnswers.currentFrameworks || [];
                if (!cFws.includes('none') && lang.frameworks) {
                    const fvals = Object.values(lang.frameworks).flat().map(v => v.toLowerCase());
                    for (const cf of cFws) {
                        if (fvals.some(v => v.includes(cf))) { score += 20; break; }
                    }
                }
            }

            // Platform match — distribute across selected platforms
            for (const p of plats) {
                if (q.platforms?.includes(p)) score += Math.round(45 / plats.length);
            }

            // Game-specific
            if (plats.includes('game')) {
                const nl = lang.name.toLowerCase();
                if (wizardAnswers.gameRuntime === 'browser' && ['javascript', 'typescript'].includes(nl)) score += 25;
                else if (wizardAnswers.gameRuntime === 'native-engine' && ['c#', 'c++', 'c'].includes(nl)) score += 25;
                else if (wizardAnswers.gameRuntime === 'native-engine' && nl === 'rust') score += 15;
                else if (wizardAnswers.gameRuntime === 'mobile-game' && ['c#', 'dart', 'kotlin', 'swift'].includes(nl)) score += 20;
                if (wizardAnswers.gameGraphics === 'realistic' && ['c++', 'c#', 'rust'].includes(nl)) score += 15;
                else if (wizardAnswers.gameGraphics === 'minimal' && ['lua', 'python', 'javascript'].includes(nl)) score += 10;
            }

            // Web architecture
            if (wizardAnswers.webArchitecture) {
                const nl = lang.name.toLowerCase();
                if (['spa', 'ssr'].includes(wizardAnswers.webArchitecture) && ['javascript', 'typescript'].includes(nl)) score += 15;
                else if (wizardAnswers.webArchitecture === 'mpa' && ['python', 'ruby', 'php', 'java'].includes(nl)) score += 15;
            }

            // Mobile strategy
            if (wizardAnswers.mobileStrategy) {
                const nl = lang.name.toLowerCase();
                if (wizardAnswers.mobileStrategy === 'native-ios' && nl === 'swift') score += 30;
                if (wizardAnswers.mobileStrategy === 'native-android' && ['kotlin', 'java'].includes(nl)) score += 30;
                if (wizardAnswers.mobileStrategy === 'cross-platform' && ['dart', 'javascript', 'typescript', 'c#'].includes(nl)) score += 25;
                if (wizardAnswers.mobileStrategy === 'pwa' && ['javascript', 'typescript'].includes(nl)) score += 25;
            }

            // Desktop framework
            if (wizardAnswers.desktopFramework) {
                const nl = lang.name.toLowerCase();
                if (wizardAnswers.desktopFramework === 'electron' && ['javascript', 'typescript'].includes(nl)) score += 25;
                if (wizardAnswers.desktopFramework === 'native-qt' && ['c++', 'c'].includes(nl)) score += 25;
                if (wizardAnswers.desktopFramework === 'dotnet-gui' && nl === 'c#') score += 25;
                if (wizardAnswers.desktopFramework === 'swiftui-mac' && nl === 'swift') score += 25;
                if (wizardAnswers.desktopFramework === 'gtk' && ['python', 'c', 'c++', 'rust'].includes(nl)) score += 20;
            }

            // Data science
            if (wizardAnswers.dataFocus) {
                const nl = lang.name.toLowerCase();
                if (['ml-training', 'nlp', 'cv'].includes(wizardAnswers.dataFocus) && nl === 'python') score += 30;
                if (wizardAnswers.dataFocus === 'data-analysis' && ['python', 'r', 'julia'].includes(nl)) score += 25;
                if (wizardAnswers.dataFocus === 'ml-inference' && ['python', 'rust', 'c++', 'go'].includes(nl)) score += 20;
            }

            // Deployment Engine (20 pts)
            if (wizardAnswers.deployment) {
                const nl = lang.name.toLowerCase();
                if (wizardAnswers.deployment === 'serverless' && ['javascript', 'typescript', 'go', 'rust', 'python'].includes(nl)) score += 20;
                else if (wizardAnswers.deployment === 'container' && ['go', 'java', 'c#', 'rust', 'python', 'javascript', 'typescript'].includes(nl)) score += 20;
                else if (wizardAnswers.deployment === 'bare-metal' && ['c', 'c++', 'rust', 'zig', 'nim', 'assembly'].includes(nl)) score += 20;
                else if (wizardAnswers.deployment === 'vps' && ['php', 'ruby', 'python', 'go', 'java', 'elixir'].includes(nl)) score += 15;
                
                // Penalize web languages on bare-metal
                if (wizardAnswers.deployment === 'bare-metal' && ['javascript', 'typescript', 'php', 'ruby'].includes(nl)) score -= 30;
            }

            // Backend (20 pts)
            if (wizardAnswers.backend === 'yes' && q.backend) score += 20;
            else if (wizardAnswers.backend === 'no') score += 20;
            // Typing (20 pts)
            if (wizardAnswers.typing === 'any') score += 20;
            else if (q.typing === wizardAnswers.typing) score += 20;
            // Speed (15 pts)
            if (wizardAnswers.speed === 'balanced') score += 15;
            else if (q.speed === wizardAnswers.speed) score += 15;
            else if (wizardAnswers.speed === 'high' && q.speed === 'moderate') score += 5;
            else if (wizardAnswers.speed === 'moderate' && q.speed === 'high') score += 8;

            return { lang, score };
        });

        const matches = scores.filter(i => i.score >= 25).sort((a, b) => b.score - a.score).slice(0, 8);
        let finalLang = matches.length > 0 ? matches[0].lang.name : 'TypeScript';
        let finalFramework = 'None';
        let suggestedEngine = '';

        if (matches.length > 0 && matches[0].lang.frameworks) {
            const fw = matches[0].lang.frameworks;
            if (plats.some(p => p.includes('web')) && fw.web) finalFramework = fw.web[0];
            else if (plats.includes('game') && fw.game) finalFramework = fw.game[0];
            else if (plats.includes('mobile') && fw.mobile) finalFramework = fw.mobile[0];
            else if (plats.includes('desktop') && fw.desktop) finalFramework = fw.desktop[0];
        }

        // Resolve game engine
        if (plats.includes('game')) {
            if (wizardAnswers.gameRuntime === 'browser') suggestedEngine = wizardAnswers.gameDimension === '3d' ? 'Three.js / Babylon.js' : 'Phaser / PixiJS';
            else if (wizardAnswers.gameRuntime === 'native-engine') {
                if (wizardAnswers.gameGraphics === 'realistic') suggestedEngine = 'Unreal Engine 5';
                else if (wizardAnswers.gameDimension === '2d') suggestedEngine = finalLang === 'C#' ? 'Unity 2D / MonoGame' : 'Godot Engine / SDL';
                else suggestedEngine = finalLang === 'C#' ? 'Unity 3D' : 'Godot Engine / Unreal Engine';
            } else if (wizardAnswers.gameRuntime === 'mobile-game') suggestedEngine = finalLang === 'C#' ? 'Unity Mobile' : 'Godot Engine';
            if (suggestedEngine) finalFramework = suggestedEngine;
        }
        // Resolve web architecture
        if (wizardAnswers.webArchitecture) {
            const am = { spa: { javascript: 'React', typescript: 'React + Vite' }, ssr: { javascript: 'Next.js', typescript: 'Next.js' }, ssg: { javascript: 'Astro', typescript: 'Astro' }, mpa: { python: 'Django', ruby: 'Ruby on Rails', php: 'Laravel', java: 'Spring Boot' } };
            const ac = am[wizardAnswers.webArchitecture];
            if (ac && ac[finalLang.toLowerCase()]) finalFramework = ac[finalLang.toLowerCase()];
        }
        // Resolve mobile
        if (wizardAnswers.mobileStrategy) {
            const mm = { 'native-ios': 'SwiftUI', 'native-android': 'Jetpack Compose', 'cross-platform': finalLang === 'Dart' ? 'Flutter' : 'React Native', 'pwa': 'Workbox + Vite PWA' };
            if (mm[wizardAnswers.mobileStrategy]) finalFramework = mm[wizardAnswers.mobileStrategy];
        }
        // Resolve desktop
        if (wizardAnswers.desktopFramework) {
            const dm = { electron: 'Electron', 'native-qt': 'Qt 6', 'dotnet-gui': 'WPF / MAUI', 'swiftui-mac': 'SwiftUI', gtk: 'GTK4 / Tkinter' };
            if (dm[wizardAnswers.desktopFramework]) finalFramework = dm[wizardAnswers.desktopFramework];
        }

        // ======== SECTION 1: PROJECT OVERVIEW ========
        const sec1 = document.createElement('div');
        sec1.className = 'wizard-result-section';
        const scopeText = wizardAnswers.projectType === 'new' ? 'New Greenfield Project' : `Existing Codebase (${(wizardAnswers.currentLangs || []).join(', ')})`;
        let domainDetails = '';
        if (plats.includes('game')) {
            const dim = { '2d': '2D', '3d': '3D', '2.5d': '2.5D' }[wizardAnswers.gameDimension] || '';
            const rt = { 'native-engine': 'Native', browser: 'Browser', 'mobile-game': 'Mobile', console: 'Console' }[wizardAnswers.gameRuntime] || '';
            const gfx = { minimal: 'Minimal', stylized: 'Stylized', realistic: 'AAA' }[wizardAnswers.gameGraphics] || '';
            domainDetails = `${dim} | ${rt} | ${gfx} Graphics`;
        }
        if (wizardAnswers.webArchitecture) domainDetails = { spa: 'SPA', ssr: 'SSR', ssg: 'SSG', mpa: 'MPA' }[wizardAnswers.webArchitecture] || '';
        if (wizardAnswers.mobileStrategy) domainDetails = { 'native-ios': 'Native iOS', 'native-android': 'Native Android', 'cross-platform': 'Cross-Platform', pwa: 'PWA' }[wizardAnswers.mobileStrategy] || '';

        const deployLabels = { 'serverless': 'Serverless / Edge', 'container': 'Containerized', 'vps': 'Traditional VPS', 'bare-metal': 'Bare Metal / Embedded', 'none': 'None (Local)' };

        sec1.innerHTML = `
            <div class="wizard-result-section-header">PROJECT OVERVIEW</div>
            <div class="wizard-result-section-body">
                <div class="wizard-kv-row"><span class="wizard-kv-key">SCOPE</span><span class="wizard-kv-val">${scopeText}</span></div>
                <div class="wizard-kv-row"><span class="wizard-kv-key">TARGET PLATFORMS</span><span class="wizard-kv-val accent">${plats.map(p => platLabels[p] || p).join(' + ')}</span></div>
                ${domainDetails ? `<div class="wizard-kv-row"><span class="wizard-kv-key">DOMAIN DETAILS</span><span class="wizard-kv-val">${domainDetails}</span></div>` : ''}
                <div class="wizard-kv-row"><span class="wizard-kv-key">TEAM SIZE</span><span class="wizard-kv-val">${{ solo: 'Solo', small: 'Small (2-5)', large: 'Large (6+)' }[wizardAnswers.teamSize] || ''}</span></div>
                ${wizardAnswers.deployment ? `<div class="wizard-kv-row"><span class="wizard-kv-key">DEPLOYMENT</span><span class="wizard-kv-val">${deployLabels[wizardAnswers.deployment]}</span></div>` : ''}
                <div class="wizard-kv-row"><span class="wizard-kv-key">BACKEND</span><span class="wizard-kv-val">${wizardAnswers.backend === 'yes' ? 'Required' : 'Not Required'}</span></div>
                <div class="wizard-kv-row"><span class="wizard-kv-key">TYPE SYSTEM</span><span class="wizard-kv-val">${{ static: 'Static', dynamic: 'Dynamic', any: 'No Preference' }[wizardAnswers.typing] || ''}</span></div>
                <div class="wizard-kv-row"><span class="wizard-kv-key">PERFORMANCE</span><span class="wizard-kv-val">${{ high: 'Maximum Speed', moderate: 'Developer Velocity', balanced: 'Balanced' }[wizardAnswers.speed] || ''}</span></div>
            </div>
        `;
        resultsList.appendChild(sec1);

        // ======== SECTION 2: RECOMMENDED STACK ========
        const sec2 = document.createElement('div');
        sec2.className = 'wizard-result-section';
        let stackHTML = `<div class="wizard-result-section-header">RECOMMENDED STACK</div><div class="wizard-result-section-body">`;
        if (matches.length === 0) {
            stackHTML += `<div style="color:var(--text-secondary);padding:10px 0;">No compatible matches. Press RESET to widen filters.</div>`;
        } else {
            stackHTML += `<div class="wizard-stack-card"><div class="wizard-stack-card-title">PRIMARY: ${escapeHTML(finalLang)} + ${escapeHTML(finalFramework)}</div>`;
            stackHTML += `<div class="wizard-kv-row"><span class="wizard-kv-key">LANGUAGE</span><span class="wizard-kv-val accent">${escapeHTML(finalLang)}</span></div>`;
            stackHTML += `<div class="wizard-kv-row"><span class="wizard-kv-key">FRAMEWORK</span><span class="wizard-kv-val accent">${escapeHTML(finalFramework)}</span></div>`;
            stackHTML += `</div>`;

            if (matches.length > 1) {
                stackHTML += `<div style="font-size:12px;color:var(--text-secondary);margin:8px 0 6px;">ALTERNATIVE LANGUAGES (click to view details):</div>`;
                matches.slice(0, 6).forEach(item => {
                    stackHTML += `<div class="wizard-result-item" data-lang-name="${escapeHTML(item.lang.name)}"><span>[>] ${escapeHTML(item.lang.name)} — ${escapeHTML(String(item.lang.creator || '?'))} (${escapeHTML(String(item.lang.year || '?'))})</span><span class="wizard-result-score">${Math.min(100, item.score)}%</span></div>`;
                });
            }
        }
        stackHTML += `</div>`;
        sec2.innerHTML = stackHTML;
        resultsList.appendChild(sec2);

        // Attach click listeners to result items
        sec2.querySelectorAll('.wizard-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const name = el.getAttribute('data-lang-name');
                const lang = languages.find(l => l.name === name);
                if (lang) openModal(lang);
            });
        });

        // ======== SECTION 3: AI CONFIGURATION ========
        const llm = wizardAnswers.targetLLM;
        const isPro = wizardAnswers.tier === 'pro';
        const showAI = llm && llm !== 'none';

        let modelRec = '', mcpTools = '', ideRec = '', pluginsRec = '';
        if (llm === 'claude') {
            modelRec = isPro ? 'Claude Opus 4 / Sonnet 4' : 'Claude Haiku 3.5';
            mcpTools = 'filesystem, git, puppeteer, serena, Context7';
            ideRec = isPro ? 'Claude Code CLI or Cursor IDE' : 'Cursor (free) or Windsurf';
            pluginsRec = 'CLAUDE.md rules, /init bootstrap, memory tool';
        } else if (llm === 'gemini') {
            modelRec = isPro ? 'Gemini 2.5 Pro (1M+ context)' : 'Gemini 2.5 Flash';
            mcpTools = 'dart-mcp, prisma-mcp, serena, Google Search';
            ideRec = isPro ? 'Gemini CLI or Android Studio' : 'Gemini CLI or VS Code extension';
            pluginsRec = 'GEMINI.md rules, Firebase, Vertex AI';
        } else if (llm === 'gpt') {
            modelRec = isPro ? 'GPT-4o / o1 / o3' : 'GPT-4o-mini';
            mcpTools = 'Code Interpreter, DALL-E, GPT Actions';
            ideRec = isPro ? 'GitHub Copilot Pro or ChatGPT Canvas' : 'Copilot Free or ChatGPT';
            pluginsRec = 'Copilot Chat, Copilot Workspace';
        } else if (llm === 'local') {
            modelRec = isPro ? 'DeepSeek-V3 / Qwen2.5-Coder 32B' : 'Llama 3.1 8B / Qwen 7B';
            mcpTools = 'Ollama API, filesystem, shell scripts';
            ideRec = 'Continue.dev or Aider CLI';
            pluginsRec = 'Ollama, Continue.dev, ChromaDB RAG';
        } else {
            modelRec = 'N/A'; mcpTools = 'N/A';
            ideRec = 'VS Code / Vim / JetBrains'; pluginsRec = 'ESLint, Prettier, LSP';
        }

        if (showAI) {
            const sec3 = document.createElement('div');
            sec3.className = 'wizard-result-section';
            sec3.innerHTML = `
                <div class="wizard-result-section-header">AI CONFIGURATION</div>
                <div class="wizard-result-section-body">
                    <div class="wizard-kv-row"><span class="wizard-kv-key">MODEL</span><span class="wizard-kv-val accent">${modelRec}</span></div>
                    <div class="wizard-kv-row"><span class="wizard-kv-key">IDE</span><span class="wizard-kv-val">${ideRec}</span></div>
                    <div class="wizard-kv-row"><span class="wizard-kv-key">MCP / TOOLS</span><span class="wizard-kv-val">${mcpTools}</span></div>
                    <div class="wizard-kv-row"><span class="wizard-kv-key">PLUGINS</span><span class="wizard-kv-val">${pluginsRec}</span></div>
                </div>
            `;
            resultsList.appendChild(sec3);
        }

        // ======== SECTION 4: BOOTSTRAP COMMAND ========
        let initCommand = '# No standard bootstrap command for this stack.';
        const lName = finalLang.toLowerCase();
        if (finalFramework.includes('React') || finalFramework.includes('Next')) initCommand = 'npx create-next-app@latest ./my-app';
        else if (finalFramework.includes('Vue') || finalFramework.includes('Nuxt')) initCommand = 'npx nuxi init my-app';
        else if (lName === 'rust') initCommand = 'cargo new my_project';
        else if (lName === 'go') initCommand = 'go mod init my_project';
        else if (lName === 'c#' || lName === 'f#') initCommand = 'dotnet new console -n MyApp';
        else if (lName === 'python' && finalFramework.includes('Django')) initCommand = 'django-admin startproject myproject';
        else if (lName === 'python') initCommand = 'python -m venv venv && source venv/bin/activate';
        else if (finalFramework.includes('Flutter')) initCommand = 'flutter create my_app';
        else if (lName === 'typescript' || finalFramework === 'None') initCommand = 'npm init -y && npm install typescript @types/node --save-dev && npx tsc --init';
        
        const sec4 = document.createElement('div');
        sec4.className = 'wizard-result-section';
        sec4.innerHTML = `
            <div class="wizard-result-section-header">BOOTSTRAP COMMAND</div>
            <div class="wizard-result-section-body" style="background:#0a0a0a; border: 1px solid var(--border); padding: 12px; font-family: monospace; color: #fff;">
                <span style="color:var(--text-secondary);">$</span> ${initCommand}
            </div>
        `;
        resultsList.appendChild(sec4);

        // ======== SECTION 5: GENERATED PROMPT ========
        const teamLabel = { solo: 'Solo Developer', small: 'Small Team (2-5)', large: 'Large Team (6+)' }[wizardAnswers.teamSize] || '';
        const pLines = [
            '# SYSTEM DIRECTIVE',
            'You are an expert software developer assisting with a highly optimized codebase.', '',
            '# CONTEXT',
            `- Scope: ${scopeText}`,
            `- Platforms: ${plats.map(p => platLabels[p] || p).join(', ')}`,
        ];
        if (domainDetails) pLines.push(`- Domain Details: ${domainDetails}`);
        pLines.push(`- Primary Language: ${finalLang}`);
        pLines.push(`- Primary Framework: ${finalFramework}`);
        if (wizardAnswers.deployment) pLines.push(`- Deployment: ${deployLabels[wizardAnswers.deployment] || wizardAnswers.deployment}`);
        pLines.push(`- Backend: ${wizardAnswers.backend === 'yes' ? 'Required' : 'None'}`);
        pLines.push(`- Types: ${wizardAnswers.typing}`, `- Speed: ${wizardAnswers.speed}`, `- Team: ${teamLabel}`, '');
        
        if (showAI) {
            pLines.push('# AI TOOLCHAIN', `- Model: ${modelRec}`, `- MCP: ${mcpTools}`, `- IDE: ${ideRec}`, `- Plugins: ${pluginsRec}`, '');
        }
        
        pLines.push('# ENFORCED RULES',
            '1. Write clean, production-ready code in English.',
            '2. Content-first design. No glassmorphism or bloated animations. Minimal retro TUI aesthetic preferred.',
            '3. Validate inputs, handle errors, check imports proactively.'
        );
        if (wizardAnswers.typing === 'static') pLines.push('4. Enforce strict type annotations everywhere. Do not use generic "any" types.');
        if (wizardAnswers.teamSize === 'large') pLines.push('5. Use consistent naming, JSDoc/docstrings, PR-ready structure. Write unit tests for business logic.');
        if (plats.includes('game')) pLines.push('6. Separate game logic from rendering. Use ECS/component patterns for performance.');
        if (plats.includes('data-science')) pLines.push('6. Document transforms. Reproducible seeds. Log experiments clearly.');
        if (wizardAnswers.backend === 'yes') pLines.push('7. Sanitize inputs. Parameterized queries to prevent SQLi. No hardcoded secrets in source.');
        if (wizardAnswers.deployment === 'serverless') pLines.push('8. Optimize for cold start. Keep dependencies small. Minimize global state.');
        if (wizardAnswers.deployment === 'container') pLines.push('8. Provide a lightweight Dockerfile (e.g. Alpine/Distroless). Handle graceful shutdown (SIGTERM).');
        
        const promptRules = pLines.join('\n');

        const sec5 = document.createElement('div');
        sec5.className = 'wizard-result-section';
        sec5.innerHTML = `
            <div class="wizard-result-section-header">GENERATED SYSTEM PROMPT</div>
            <div class="wizard-result-section-body">
                <textarea id="wizard-prompt-box" readonly style="width:100%;height:200px;background:#000;color:#00ff00;border:1px solid var(--border);font-family:inherit;padding:10px;font-size:13px;resize:vertical;white-space:pre-wrap;outline:none;margin-bottom:8px;"></textarea>
                <button id="copy-prompt-btn" class="btn-tui" style="display:block;width:100%;">[ COPY SYSTEM PROMPT ]</button>
            </div>
        `;
        resultsList.appendChild(sec5);
        wizardStepContainer.appendChild(resultsList);

        document.getElementById('wizard-prompt-box').textContent = promptRules;
        const copyBtn = document.getElementById('copy-prompt-btn');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(promptRules).then(() => {
                copyBtn.textContent = '[ COPIED! ]';
                setTimeout(() => { copyBtn.textContent = '[ COPY SYSTEM PROMPT ]'; }, 1500);
            }).catch(err => console.error('Copy failed:', err));
        });

        wizardPrev.classList.add('hidden');
        wizardNext.classList.add('hidden');
        wizardReset.classList.remove('hidden');
    }

    wizardPrev.addEventListener('click', () => {
        if (wizardCurrentStep > 0) {
            wizardCurrentStep--;
            renderWizardStep();
        }
    });

    wizardNext.addEventListener('click', () => {
        wizardCurrentStep++;
        renderWizardStep();
    });

    wizardReset.addEventListener('click', () => {
        wizardCurrentStep = 0;
        Object.keys(wizardAnswers).forEach(k => {
            wizardAnswers[k] = Array.isArray(wizardAnswers[k]) ? [] : '';
        });
        renderWizardStep();
    });

    // Modal Control & View Tabs
    function openModal(lang) {
        currentModalLang = lang;
        modalTitle.textContent = lang.name;
        location.hash = slugify(lang.name);
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Load content
        setModalTab('code');

        if (codeCache.has(lang.path)) {
            const cachedCode = codeCache.get(lang.path);
            currentModalRawCode = cachedCode;
            displayCode(cachedCode, lang);
        } else {
            codeBlock.textContent = 'Loading source from hello-world...';
            currentModalRawCode = '';
            
            fetch(lang.path)
                .then(res => {
                    if (!res.ok) throw new Error('File not found');
                    return res.text();
                })
                .then(code => {
                    codeCache.set(lang.path, code);
                    currentModalRawCode = code;
                    displayCode(code, lang);
                })
                .catch(err => {
                    codeBlock.textContent = 'Error loading source file: ' + err.message;
                    currentModalRawCode = '';
                });
        }

        // Generate historic tab printout
        generateModalHistory(lang);
        trapFocus(modal.querySelector('.modal-content'));
    }

    function generateModalHistory(lang) {
        const hContent = document.getElementById('modal-history-content');
        
        const hasHistory = lang.creator && lang.creator !== 'Unknown';
        if (!hasHistory) {
            hContent.innerHTML = `*** NO DETAILED HISTORY RECORDS FOUND FOR ${escapeHTML(lang.name.toUpperCase())} ***`;
            return;
        }

        let html = `<div class="terminal-header-line">SYSTEM_DUMP: ${escapeHTML(lang.name.toUpperCase())} ECOSYSTEM MANIFEST</div>`;
        html += `CREATOR       : ${escapeHTML(String(lang.creator))}\n`;
        html += `LAUNCH YEAR   : ${escapeHTML(String(lang.year || 'N/A'))}\n`;
        html += `FILE PARADIGM : ${lang.tags.map(t => escapeHTML(t.toUpperCase())).join(', ')}\n\n`;

        if (lang.history) {
            html += `<div class="terminal-section-title">HISTORICAL ORIGIN & BACKGROUND:</div>`;
            html += `${escapeHTML(lang.history)}\n\n`;
        }

        if (lang.famousProjects && lang.famousProjects.length > 0) {
            html += `<div class="terminal-section-title">FAMOUS PROJECTS & SYSTEMS WRITTEN IN THIS LANGUAGE:</div>`;
            lang.famousProjects.forEach(p => {
                html += `- ${escapeHTML(p)}\n`;
            });
        }

        if (lang.frameworks && Object.keys(lang.frameworks).length > 0) {
            html += `<div class="terminal-section-title">POPULAR LIBRARIES & FRAMEWORKS:</div>`;
            for (const [key, list] of Object.entries(lang.frameworks)) {
                html += `[${escapeHTML(key.toUpperCase())}] : ${escapeHTML(list.join(', '))}\n`;
            }
        }

        hContent.innerHTML = html;
    }

    function setModalTab(tabName) {
        currentModalTab = tabName;
        modalTabs.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
        });

        modalTabCode.classList.toggle('active', tabName === 'code');
        modalTabCode.classList.toggle('hidden', tabName !== 'code');
        modalTabHistory.classList.toggle('active', tabName === 'history');
        modalTabHistory.classList.toggle('hidden', tabName !== 'history');
    }

    modalTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            setModalTab(btn.dataset.tab);
        });
    });

    function displayCode(code, lang) {
        currentModalRawCode = code;

        const ext = getExtension(lang.path);
        const prismLang = getPrismLang(ext);
        
        // Split highlighted lines with numbers
        try {
            const highlightedHTML = Prism.highlight(code, Prism.languages[prismLang] || Prism.languages.plaintext, prismLang);
            const lines = highlightedHTML.split('\n');
            // Remove last empty line if it is empty
            if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();

            codeBlock.innerHTML = lines.map((line, idx) => {
                return `<span class="prism-line-number" data-line="${idx + 1}">${idx + 1}</span>${line}`;
            }).join('\n');
        } catch (e) {
            // Fallback
            codeBlock.textContent = code;
        }
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        currentModalLang = null;
        history.replaceState(null, '', location.pathname + location.search);
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    downloadBtn.addEventListener('click', () => {
        if (!currentModalLang) return;
        const code = currentModalRawCode;
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

    rawBtn.addEventListener('click', () => {
        if (currentModalLang) {
            window.open(`raw.html?file=${currentModalLang.path}`, '_blank');
        }
    });

    // Escape listener and search key shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!modal.classList.contains('hidden')) {
                closeModal();
            }
        }
        if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== frameworksSearchInput) {
            // Don't focus if modal is active
            if (modal.classList.contains('hidden')) {
                e.preventDefault();
                if (activeView === 'languages') searchInput.focus();
                if (activeView === 'frameworks') frameworksSearchInput.focus();
            }
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

    // Compare Mode Management
    compareToggleBtn.addEventListener('click', () => {
        compareMode = !compareMode;
        compareToggleBtn.classList.toggle('active', compareMode);
        compareToggleBtn.textContent = compareMode ? '[ COMPARE: ON ]' : '[ COMPARE: OFF ]';
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
            if (compareSelection.length >= 3) return; // Maximum 3 columns
            compareSelection.push(lang);
            card.classList.add('compare-selected');
        }
        updateComparisonPanel();
    }

    function updateComparisonPanel() {
        const selection = activeView === 'languages' ? compareSelection : frameworksCompareSelection;

        if (selection.length === 0) {
            comparisonPanel.classList.remove('visible');
            comparisonPanel.classList.add('hidden');
            return;
        }

        comparisonPanel.classList.remove('hidden');
        requestAnimationFrame(() => {
            comparisonPanel.classList.add('visible');
        });

        comparisonColumns.innerHTML = '';

        if (activeView === 'languages') {
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
                    const text = codeCache.get(lang.path);
                    const ext = getExtension(lang.path);
                    const prismLang = getPrismLang(ext);
                    
                    code.textContent = text;
                    code.className = 'language-' + prismLang;
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
                            const ext = getExtension(lang.path);
                            const prismLang = getPrismLang(ext);
                            
                            code.textContent = text;
                            code.className = 'language-' + prismLang;
                            Prism.highlightElement(code);
                        })
                        .catch(() => {
                            code.textContent = 'Error loading source file.';
                        });
                }

                comparisonColumns.appendChild(col);
            });
        } else {
            frameworksCompareSelection.forEach(fw => {
                const col = document.createElement('div');
                col.className = 'comparison-col';

                const header = document.createElement('div');
                header.className = 'comparison-col-header';
                header.textContent = fw.name;
                col.appendChild(header);

                const codeContainer = document.createElement('div');
                codeContainer.className = 'comparison-col-code';
                codeContainer.style.padding = '15px';
                codeContainer.style.overflowY = 'auto';

                let html = `<div class="terminal-header-line">SYSTEM_DUMP: FRAMEWORK MANIFEST</div>`;
                html += `CATEGORY       : ${escapeHTML(fw.type.toUpperCase())}\n`;
                html += `HOST LANGUAGE  : ${escapeHTML(fw.language.toUpperCase())}\n\n`;
                html += `<div class="terminal-section-title">DESCRIPTION:</div>`;
                html += `${escapeHTML(fw.description)}\n\n`;
                if (fw.famousProjects && fw.famousProjects.length > 0) {
                    html += `<div class="terminal-section-title">FAMOUS APPLICATIONS:</div>`;
                    html += escapeHTML(fw.famousProjects.join('\n'));
                }

                codeContainer.innerHTML = `<pre class="terminal-output" style="white-space: pre-wrap; font-family: inherit;">${html}</pre>`;
                col.appendChild(codeContainer);
                comparisonColumns.appendChild(col);
            });
        }
    }

    function toggleFrameworksCompareSelection(fw, card) {
        const idx = frameworksCompareSelection.findIndex(s => s.name === fw.name);
        if (idx > -1) {
            frameworksCompareSelection.splice(idx, 1);
            card.classList.remove('compare-selected');
        } else {
            if (frameworksCompareSelection.length >= 3) return; // Maximum 3 columns
            frameworksCompareSelection.push(fw);
            card.classList.add('compare-selected');
        }
        updateComparisonPanel();
    }

    function clearComparison() {
        compareSelection = [];
        comparisonPanel.classList.remove('visible');
        setTimeout(() => {
            comparisonPanel.classList.add('hidden');
            comparisonColumns.innerHTML = '';
        }, 120);
        const selectedCards = languagesGrid ? languagesGrid.querySelectorAll('.card.compare-selected') : [];
        selectedCards.forEach(c => {
            c.classList.remove('compare-selected');
        });
    }

    function clearFrameworksComparison() {
        frameworksCompareSelection = [];
        comparisonPanel.classList.remove('visible');
        setTimeout(() => {
            comparisonPanel.classList.add('hidden');
            comparisonColumns.innerHTML = '';
        }, 120);
        const selectedCards = frameworksGrid ? frameworksGrid.querySelectorAll('.card.compare-selected') : [];
        selectedCards.forEach(c => {
            c.classList.remove('compare-selected');
        });
    }

    comparisonClear.addEventListener('click', () => {
        clearComparison();
        clearFrameworksComparison();
    });

    comparisonClose.addEventListener('click', () => {
        compareMode = false;
        compareToggleBtn.classList.remove('active');
        compareToggleBtn.textContent = '[ COMPARE: OFF ]';
        frameworksCompareMode = false;
        frameworksCompareToggleBtn.classList.remove('active');
        frameworksCompareToggleBtn.textContent = '[ COMPARE: OFF ]';
        document.body.classList.remove('compare-mode');
        clearComparison();
        clearFrameworksComparison();
    });

    // Deep Linking support
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
