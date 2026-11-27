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


    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const frameworksSearchInput = document.getElementById('frameworks-search-input');
    
    const clearSearchBtn = document.getElementById('clear-search');
    const clearFrameworksSearchBtn = document.getElementById('clear-frameworks-search');
    const randomBtn = document.getElementById('random-btn');
    const layoutToggleBtn = document.getElementById('layout-toggle-btn');
    const noResults = document.getElementById('no-results');
    const noResultsText = document.getElementById('no-results-text');
    const noResultsClear = document.getElementById('no-results-clear');
    const resultCount = document.getElementById('result-count');

    // Per-viewer preferences; storage can be blocked, so never let it throw
    function readPref(key, fallback) {
        try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
    }
    function writePref(key, value) {
        try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
    }

    // Set by openModal when it pushed a history entry, so closing can step back
    let modalPushedHistory = false;
    let focusBeforeModal = null;
    
    const modal = document.getElementById('code-modal');
    const modalTitle = document.getElementById('modal-title');
    const codeBlock = document.getElementById('code-block');
    const modalHistoryContent = document.getElementById('modal-history-content');
    let currentModalRawCode = '';
    const rawBtn = document.getElementById('raw-btn');
    const websiteBtn = document.getElementById('website-btn');
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

    // Monochrome logo from docs/icons (masked so it follows the theme colors);
    // languages without a logo get a two-letter monogram in the same box.
    function createLangIcon(lang) {
        const el = document.createElement('span');
        el.setAttribute('aria-hidden', 'true');
        if (lang.icon) {
            el.className = 'lang-icon';
            el.style.setProperty('--icon', `url("${lang.icon}")`);
        } else {
            el.className = 'lang-icon lang-icon-text';
            el.textContent = lang.name.replace(/[^A-Za-z0-9#+]/g, '').slice(0, 2) || '?';
        }
        return el;
    }

    // Link to a language or framework's own website. Lives inside clickable cards/rows,
    // so click and Enter must not bubble up and open the code modal instead.
    function createSiteLink(item, className = 'card-tag site-link') {
        const url = item.website;
        if (!url || !/^https?:\/\//.test(url)) return null;
        const a = document.createElement('a');
        a.className = className;
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        let host = '';
        try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { /* keep empty */ }
        a.textContent = host === 'github.com' ? 'REPO \u2197' : 'SITE \u2197';
        a.title = host;
        a.setAttribute('aria-label', `${item.name} ${host === 'github.com' ? 'repository' : 'website'} (${host}, opens in a new tab)`);
        a.addEventListener('click', e => e.stopPropagation());
        a.addEventListener('keydown', e => e.stopPropagation());
        return a;
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
            renderFinder();
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
                ogDesc.setAttribute('content', `A retro-inspired monospace terminal directory featuring ${langSize} programming languages, complete historical manifests, popular frameworks catalog, side-by-side code comparison, and a stack finder that turns your project idea into setup commands and a build plan.`);
            }

            const twitterTitle = document.querySelector('meta[name="twitter:title"]');
            if (twitterTitle) {
                twitterTitle.setAttribute('content', `Hello World Collection — ${langSize}+ Languages (TUI Console)`);
            }

            const twitterDesc = document.querySelector('meta[name="twitter:description"]');
            if (twitterDesc) {
                twitterDesc.setAttribute('content', `A retro-inspired monospace terminal directory featuring ${langSize} programming languages, complete historical manifests, popular frameworks catalog, side-by-side code comparison, and a stack finder that turns your project idea into setup commands and a build plan.`);
            }

            fuse = new Fuse(languages, {
                keys: ['name', 'description', 'tags', 'creator', 'famousProjects'],
                threshold: 0.35
            });

            skeletonLoader.classList.add('hidden');
            restoreUrlState();
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

    // Layout switch: two pressed-state buttons (GRID | LIST), remembered per viewer
    function markLayout(group, layout) {
        group.querySelectorAll('[data-layout]').forEach(b => {
            b.setAttribute('aria-pressed', String(b.dataset.layout === layout));
            b.classList.toggle('active', b.dataset.layout === layout);
        });
    }

    activeLayout = readPref('layout', 'gallery') === 'list' ? 'list' : 'gallery';
    activeFrameworksLayout = readPref('frameworksLayout', 'gallery') === 'list' ? 'list' : 'gallery';
    markLayout(layoutToggleBtn, activeLayout);
    markLayout(frameworksLayoutToggleBtn, activeFrameworksLayout);

    layoutToggleBtn.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-layout]');
        if (!btn || btn.dataset.layout === activeLayout) return;
        activeLayout = btn.dataset.layout;
        markLayout(layoutToggleBtn, activeLayout);
        writePref('layout', activeLayout);
        applyFilters();
    });

    // Paradigm filter chips are toggle buttons (aria-pressed), not tabs
    function setActiveTag(tag) {
        activeTag = tag;
        filterBar.querySelectorAll('.filter-chip').forEach(c => {
            const isActive = c.dataset.tag === activeTag;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-pressed', String(isActive));
        });
    }

    filterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        setActiveTag(chip.dataset.tag);
        applyFilters();
    });

    // Frameworks Layout Toggle Switch
    frameworksLayoutToggleBtn.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-layout]');
        if (!btn || btn.dataset.layout === activeFrameworksLayout) return;
        activeFrameworksLayout = btn.dataset.layout;
        markLayout(frameworksLayoutToggleBtn, activeFrameworksLayout);
        writePref('frameworksLayout', activeFrameworksLayout);
        renderFrameworksTable();
    });

    // Frameworks Category filter chip select
    function setActiveFrameworksTag(type) {
        activeFrameworksTag = type;
        frameworksFilterBar.querySelectorAll('.filter-chip').forEach(c => {
            const isActive = c.dataset.type === activeFrameworksTag;
            c.classList.toggle('active', isActive);
            c.setAttribute('aria-pressed', String(isActive));
        });
    }

    frameworksFilterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        setActiveFrameworksTag(chip.dataset.type);
        renderFrameworksTable();
    });

    // Empty state: one action that resets whichever view is showing
    noResultsClear.addEventListener('click', () => {
        if (activeView === 'frameworks') {
            frameworksSearchInput.value = '';
            clearFrameworksSearchBtn.classList.add('hidden');
            setActiveFrameworksTag('all');
            renderFrameworksTable();
            frameworksSearchInput.focus();
        } else {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            setActiveTag('all');
            applyFilters();
            searchInput.focus();
        }
    });

    function showNoResults(message) {
        noResultsText.textContent = message;
        noResults.classList.remove('hidden');
    }

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

    // Search and paradigm combine: Fuse ranks the query, then the tag narrows it
    function applyFilters() {
        const query = searchInput.value.trim();
        const matches = query.length > 0 ? fuse.search(query).map(r => r.item) : languages;
        const filtered = activeTag === 'all'
            ? matches
            : matches.filter(lang => lang.tags && lang.tags.includes(activeTag));

        updateChipCounts(matches);
        updateResultCount(filtered.length, query);
        syncUrlState(query);

        if (filtered.length === 0) {
            const where = activeTag === 'all' ? '' : ` IN ${activeTag.toUpperCase()}`;
            const what = query ? ` MATCH "${query}"` : '';
            const elsewhere = activeTag !== 'all' && matches.length > 0
                ? ` ${matches.length} MATCH IN ALL PARADIGMS.` : '';
            showNoResults(`*** NO LANGUAGES${what}${where}.${elsewhere} ***`);
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

    // "> 14 of 266 languages" line above the results, announced politely
    function updateResultCount(shown, query) {
        const parts = [`> ${shown} of ${languages.length} languages`];
        if (activeTag !== 'all') parts.push(`paradigm: ${activeTag}`);
        if (query) parts.push(`search: "${query}"`);
        resultCount.textContent = parts.join('  |  ');
    }

    // Each chip shows how many of the current search matches it would leave
    function updateChipCounts(matches) {
        filterBar.querySelectorAll('.filter-chip').forEach(chip => {
            const tag = chip.dataset.tag;
            const n = tag === 'all'
                ? matches.length
                : matches.filter(l => l.tags && l.tags.includes(tag)).length;
            let count = chip.querySelector('.chip-count');
            if (!count) {
                count = document.createElement('span');
                count.className = 'chip-count';
                chip.appendChild(count);
            }
            count.textContent = ` ${n}`;
            chip.classList.toggle('chip-empty', n === 0 && tag !== activeTag);
        });
    }

    // Search and paradigm live in ?q=&tag= so a filtered view can be shared or reloaded.
    // replaceState: typing must not flood the back button with history entries.
    function syncUrlState(query) {
        const params = new URLSearchParams(location.search);
        if (query) params.set('q', query); else params.delete('q');
        if (activeTag !== 'all') params.set('tag', activeTag); else params.delete('tag');
        const qs = params.toString();
        const url = location.pathname + (qs ? `?${qs}` : '') + location.hash;
        if (url !== location.pathname + location.search + location.hash) {
            history.replaceState(history.state, '', url);
        }
    }

    function restoreUrlState() {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) {
            searchInput.value = q;
            clearSearchBtn.classList.remove('hidden');
        }
        const tag = params.get('tag');
        if (tag && TAG_NAMES.includes(tag)) setActiveTag(tag);
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
            h3.appendChild(createLangIcon(lang));
            h3.appendChild(document.createTextNode(lang.name));
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
            const langSite = createSiteLink(lang);
            if (langSite) footerTags.appendChild(langSite);
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
                <td class="lang-name-cell">${escapeHTML(lang.name)}</td>
                <td>${escapeHTML(String(lang.creator || 'Unknown'))}</td>
                <td>${escapeHTML(String(lang.year || 'N/A'))}</td>
                <td><span class="row-projects">${escapeHTML(ecosystemStr)}</span></td>
            `;

            const nameCell = tr.querySelector('.lang-name-cell');
            nameCell.prepend(createLangIcon(lang));
            const rowSite = createSiteLink(lang, 'row-site-link');
            if (rowSite) nameCell.append(' ', rowSite);
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
                showNoResults('*** NO FRAMEWORKS MATCH THIS SEARCH AND CATEGORY ***');
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
                h3.appendChild(createLangIcon(fw));
                h3.appendChild(document.createTextNode(fw.name));
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

                const fwSite = createSiteLink(fw);
                if (fwSite) footerTags.appendChild(fwSite);
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
                showNoResults('*** NO FRAMEWORKS MATCH THIS SEARCH AND CATEGORY ***');
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
                    <td class="lang-name-cell">${escapeHTML(fw.name)}</td>
                    <td>${escapeHTML(fw.type)}</td>
                    <td><span class="btn-lang-link" data-lang="${escapeHTML(fw.language)}">${escapeHTML(fw.language)}</span></td>
                    <td><span class="row-projects">${escapeHTML(projectsStr)}</span></td>
                `;

                const fwNameCell = tr.querySelector('.lang-name-cell');
                fwNameCell.prepend(createLangIcon(fw));
                const fwRowSite = createSiteLink(fw, 'row-site-link');
                if (fwRowSite) fwNameCell.append(' ', fwRowSite);

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

    // ===== STACK FINDER (replaces the old step-by-step wizard) =====
    // Data and scoring live in wizard-stacks.js; this part only reads the form and renders.
    const W = window.WizardStacks;
    const finderForm = document.getElementById('finder-form');
    const finderResults = document.getElementById('finder-results');
    const finderDesc = document.getElementById('finder-desc');
    const finderVariantSet = document.getElementById('finder-variant');
    let finderPinnedStack = null; // alternative the viewer clicked, until answers change
    let finderAiAbort = null;

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function buildChoices(fieldset, name, type, options) {
        const box = fieldset.querySelector('.finder-choices');
        box.replaceChildren();
        options.forEach(opt => {
            const label = el('label', 'finder-choice');
            const input = document.createElement('input');
            input.type = type;
            input.name = name;
            input.value = opt.value;
            const title = el('span', 'finder-choice-label', opt.label);
            label.append(input, title);
            if (opt.hint) label.appendChild(el('span', 'finder-choice-hint', opt.hint));
            box.appendChild(label);
        });
    }

    function readFinderAnswers() {
        const data = new FormData(finderForm);
        return {
            description: finderDesc.value,
            target: data.get('target') || '',
            variant: data.get('variant') || '',
            known: data.getAll('known'),
            priority: data.get('priority') || '',
        };
    }

    function syncVariantQuestion(target) {
        const info = W.VARIANTS[target];
        finderVariantSet.hidden = !info;
        if (info) {
            finderVariantSet.querySelector('legend').textContent = `3. ${info.question}`;
            buildChoices(finderVariantSet, 'variant', 'radio', info.options);
        } else {
            finderVariantSet.querySelector('.finder-choices').replaceChildren();
        }
    }

    function initFinder() {
        buildChoices(document.getElementById('finder-target'), 'target', 'radio', W.TARGETS);
        buildChoices(document.getElementById('finder-known'), 'known', 'checkbox', W.FAMILIES);
        buildChoices(document.getElementById('finder-priority'), 'priority', 'radio', W.PRIORITIES);
        syncVariantQuestion('');

        finderForm.addEventListener('change', (e) => {
            // the description has its own debounced input handler; its blur "change" must not
            // reset a picked alternative or rebuild the results under the pointer
            if (e.target === finderDesc) return;
            if (e.target.name === 'target') syncVariantQuestion(e.target.value);
            finderPinnedStack = null;
            renderFinder();
        });
        let descTimer = null;
        finderDesc.addEventListener('input', () => {
            clearTimeout(descTimer);
            descTimer = setTimeout(renderFinder, 250);
        });
        finderForm.addEventListener('reset', () => {
            setTimeout(() => {
                syncVariantQuestion('');
                finderPinnedStack = null;
                renderFinder();
            });
        });
        finderForm.addEventListener('submit', e => e.preventDefault());
    }

    // Shell commands get "$ "; manual steps (download, click in an IDE) get "# " so a pasted
    // block stays harmless, and a block with no commands has no COPY button.
    const SHELL_START = /^(npx|npm|cd|mkdir|python|pip|source|django-admin|gem|rails|composer|mix|dotnet|curl|unzip|cargo|go|hugo|flutter|rustup|printf|chmod|arduino-cli|cobra-cli|mpremote|love|jupyter|fastapi|GOOS=|bin\/|php|\.\/)\b/;
    function finderCodeBlock(steps) {
        const isCmd = steps.map(st => SHELL_START.test(st));
        const wrap = el('div', 'finder-code');
        const pre = el('pre');
        pre.textContent = steps.map((st, i) => (isCmd[i] ? '$ ' : '# ') + st).join('\n');
        wrap.appendChild(pre);
        if (!isCmd.some(Boolean)) return wrap;
        const copyText = steps.map((st, i) => (isCmd[i] ? st : '# ' + st)).join('\n');
        const btn = el('button', 'btn-tui finder-copy', '[ COPY ]');
        btn.type = 'button';
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(copyText).then(() => {
                btn.textContent = '[ COPIED ]';
                setTimeout(() => { btn.textContent = '[ COPY ]'; }, 1500);
            }).catch(() => { btn.textContent = '[ COPY FAILED ]'; });
        });
        wrap.appendChild(btn);
        return wrap;
    }

    function kv(key, value) {
        const row = el('div', 'wizard-kv-row');
        row.append(el('span', 'wizard-kv-key', key), el('span', 'wizard-kv-val', value));
        return row;
    }

    function reasonList(item) {
        const ul = el('ul', 'finder-reasons');
        item.reasons.forEach(r => ul.appendChild(el('li', r.startsWith('Weak') ? 'con' : 'pro', r)));
        ul.appendChild(el('li', 'con', item.stack.tradeoff));
        return ul;
    }

    function renderStackDetail(item) {
        const s = item.stack;
        const card = el('div', 'wizard-result-section finder-main');
        card.appendChild(el('div', 'wizard-result-section-header', 'RECOMMENDED STACK'));
        const body = el('div', 'wizard-result-section-body');

        const title = el('div', 'finder-title');
        title.append(el('span', 'finder-title-name', s.name), el('span', 'finder-title-lang', ` / ${s.lang}`));
        body.append(title, el('p', 'finder-why', s.why), reasonList(item));

        body.appendChild(el('div', 'finder-sub', 'SETUP'));
        body.appendChild(finderCodeBlock(s.setup));
        body.appendChild(el('div', 'finder-sub', 'RUN'));
        body.appendChild(finderCodeBlock([s.run]));
        body.appendChild(el('div', 'finder-sub', 'PROJECT LAYOUT'));
        const layout = el('pre', 'finder-layout');
        layout.textContent = s.layout;
        body.appendChild(layout);

        body.appendChild(el('div', 'finder-sub', 'TOOLING'));
        body.append(kv('TEST', s.test), kv('LINT / FORMAT', s.lint), kv('DEPLOY', s.deploy));

        const links = el('div', 'finder-links');
        const docs = el('a', 'btn-tui', '[ OFFICIAL GETTING STARTED ]');
        docs.href = s.docs;
        docs.target = '_blank';
        docs.rel = 'noopener noreferrer';
        links.appendChild(docs);
        const lang = languages.find(l => l.name === s.lang);
        if (lang) {
            const hello = el('button', 'btn-tui', `[ HELLO WORLD IN ${s.lang.toUpperCase()} ]`);
            hello.type = 'button';
            hello.addEventListener('click', () => openModal(lang));
            links.appendChild(hello);
        }
        body.appendChild(links);
        card.appendChild(body);
        return card;
    }

    function renderAlternatives(items) {
        const sec = el('div', 'wizard-result-section');
        sec.appendChild(el('div', 'wizard-result-section-header', 'ALTERNATIVES'));
        const body = el('div', 'wizard-result-section-body');
        items.forEach(item => {
            const alt = el('div', 'finder-alt');
            const head = el('div', 'finder-alt-head');
            const name = el('span');
            name.append(el('span', 'finder-title-name', item.stack.name), el('span', 'finder-title-lang', ` / ${item.stack.lang}`));
            head.appendChild(name);
            const use = el('button', 'btn-tui finder-use', '[ SHOW DETAILS ]');
            use.type = 'button';
            use.addEventListener('click', () => {
                finderPinnedStack = item.stack.id;
                renderFinder();
                finderResults.scrollIntoView({ block: 'start' });
            });
            head.appendChild(use);
            alt.append(head, el('p', 'finder-why', item.stack.why), reasonList(item));
            body.appendChild(alt);
        });
        sec.appendChild(body);
        return sec;
    }

    // Free AI options: copy-and-open always works; on-device model only where Chrome ships it
    function renderAiSection(prompt) {
        const sec = el('div', 'wizard-result-section');
        sec.appendChild(el('div', 'wizard-result-section-header', 'GET A FULL BUILD PLAN FROM AN AI'));
        const body = el('div', 'wizard-result-section-body');
        body.appendChild(el('p', 'finder-note', 'This prompt holds your answers and the recommendation. Paste it into any AI chat to get MVP features, file structure and first code.'));

        const box = el('textarea', 'finder-prompt');
        box.readOnly = true;
        box.rows = 8;
        box.value = prompt;
        box.setAttribute('aria-label', 'Generated prompt');
        body.appendChild(box);

        const status = el('p', 'finder-note finder-status');
        status.setAttribute('aria-live', 'polite');
        const actions = el('div', 'finder-links');
        const copy = () => navigator.clipboard.writeText(prompt);
        const copyBtn = el('button', 'btn-tui', '[ COPY PROMPT ]');
        copyBtn.type = 'button';
        copyBtn.addEventListener('click', () => copy()
            .then(() => { status.textContent = 'Prompt copied.'; })
            .catch(() => { status.textContent = 'Copy failed: select the text above and copy it.'; }));
        actions.appendChild(copyBtn);
        [['CLAUDE', 'https://claude.ai/new'], ['CHATGPT', 'https://chatgpt.com/'], ['GEMINI', 'https://gemini.google.com/app']].forEach(([name, url]) => {
            const btn = el('button', 'btn-tui', `[ COPY + OPEN ${name} ]`);
            btn.type = 'button';
            btn.addEventListener('click', () => {
                // open first, inside the click, so popup blockers allow it
                const win = window.open(url, '_blank', 'noopener');
                copy().then(() => { status.textContent = `Prompt copied. Paste it into ${name.charAt(0) + name.slice(1).toLowerCase()} with Ctrl+V.`; })
                    .catch(() => { status.textContent = 'Copy failed: select the text above and copy it.'; });
                if (!win) status.textContent = 'Popup blocked: copy the prompt and open the site yourself.';
            });
            actions.appendChild(btn);
        });
        body.append(actions, status);

        if ('LanguageModel' in self) body.appendChild(renderOnDeviceAi(prompt));
        sec.appendChild(body);
        return sec;
    }

    function renderOnDeviceAi(prompt) {
        const wrap = el('div', 'finder-ondevice');
        wrap.appendChild(el('div', 'finder-sub', 'ON-DEVICE AI (CHROME)'));
        const note = el('p', 'finder-note', 'Runs Gemini Nano inside your browser: free, no account, nothing leaves your device. The first run downloads the model.');
        const askBtn = el('button', 'btn-tui', '[ ASK ON-DEVICE AI ]');
        askBtn.type = 'button';
        const stopBtn = el('button', 'btn-tui hidden', '[ STOP ]');
        stopBtn.type = 'button';
        const out = el('pre', 'finder-ai-output hidden');
        out.setAttribute('aria-live', 'polite');
        const row = el('div', 'finder-links');
        row.append(askBtn, stopBtn);
        wrap.append(note, row, out);

        const options = { expectedInputs: [{ type: 'text', languages: ['en'] }], expectedOutputs: [{ type: 'text', languages: ['en'] }] };
        LanguageModel.availability(options).then(state => {
            if (state === 'unavailable') {
                askBtn.disabled = true;
                note.textContent = 'Your browser has the on-device AI API, but this device cannot run the model (it needs about 22 GB free disk and a GPU with more than 4 GB VRAM, or 16 GB RAM).';
            }
        }).catch(() => { wrap.remove(); });

        askBtn.addEventListener('click', async () => {
            finderAiAbort = new AbortController();
            const signal = finderAiAbort.signal;
            askBtn.disabled = true;
            stopBtn.classList.remove('hidden');
            out.classList.remove('hidden');
            out.textContent = 'Starting model...';
            let session;
            try {
                // create() must run inside the click: it may start the model download
                session = await LanguageModel.create({
                    ...options,
                    signal,
                    initialPrompts: [{ role: 'system', content: 'You are a senior software engineer. Answer in plain text with short numbered lists and short code blocks. Be concrete and practical.' }],
                    monitor(m) {
                        m.addEventListener('downloadprogress', e => { out.textContent = `Downloading model: ${Math.round(e.loaded * 100)}%`; });
                    },
                });
                out.textContent = '';
                const stream = session.promptStreaming(prompt, { signal });
                for await (const chunk of stream) out.textContent += chunk;
            } catch (err) {
                if (err.name === 'AbortError') out.textContent += '\n[stopped]';
                else out.textContent = `On-device AI failed: ${err.message}. Use COPY PROMPT with any AI chat instead.`;
            } finally {
                if (session) session.destroy();
                askBtn.disabled = false;
                stopBtn.classList.add('hidden');
                finderAiAbort = null;
            }
        });
        stopBtn.addEventListener('click', () => { if (finderAiAbort) finderAiAbort.abort(); });
        return wrap;
    }

    function renderFinder() {
        if (!W) return;
        if (finderAiAbort) finderAiAbort.abort();
        const answers = readFinderAnswers();
        finderResults.replaceChildren();

        if (!answers.target) {
            const empty = el('div', 'finder-empty');
            empty.append(
                el('p', '', '> Pick what you are building (question 2) to get a recommended stack.'),
                el('p', 'finder-note', `Recommendations come from ${W.STACKS.length} hand-picked, widely used stacks, each with setup commands, project layout and tooling. Every answer you add refines the result.`)
            );
            finderResults.appendChild(empty);
            return;
        }

        const result = W.recommend(answers);
        const ranked = result.ranked;
        const pinnedIdx = finderPinnedStack ? ranked.findIndex(r => r.stack.id === finderPinnedStack) : -1;
        const main = pinnedIdx > 0 ? ranked[pinnedIdx] : ranked[0];
        const others = ranked.filter(r => r !== main).slice(0, 2);

        finderResults.appendChild(renderStackDetail(main));
        if (others.length) finderResults.appendChild(renderAlternatives(others));
        const promptResult = { ranked: [main, ...others] };
        finderResults.appendChild(renderAiSection(W.buildPrompt(answers, promptResult)));
    }

    initFinder();

    // Modal Control & View Tabs
    // fromHistory: opened by a hash change (deep link, Back/Forward), so the URL is already right
    function openModal(lang, fromHistory = false) {
        const wasOpen = !modal.classList.contains('hidden');
        if (!wasOpen) focusBeforeModal = document.activeElement;
        currentModalLang = lang;
        modalTitle.replaceChildren(createLangIcon(lang), document.createTextNode(lang.name));
        if (lang.website && /^https?:\/\//.test(lang.website)) {
            websiteBtn.href = lang.website;
            websiteBtn.setAttribute('aria-label', `${lang.name} website (opens in a new tab)`);
            websiteBtn.classList.remove('hidden');
        } else {
            websiteBtn.removeAttribute('href');
            websiteBtn.classList.add('hidden');
        }

        const target = `#${lang.slug}`;
        if (fromHistory) {
            if (!wasOpen) modalPushedHistory = false;
        } else if (location.hash !== target) {
            if (wasOpen) {
                // Switching language inside an open modal: one Back still closes it
                history.replaceState(history.state, '', location.pathname + location.search + target);
            } else {
                modalPushedHistory = true;
                location.hash = lang.slug;
            }
        }

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
        if (lang.released) {
            // Precision is whatever the sources state: YYYY-MM-DD, YYYY-MM or YYYY
            const event = lang.releasedEvent ? ` (${escapeHTML(lang.releasedEvent)})` : '';
            html += `RELEASED      : ${escapeHTML(String(lang.released))}${event}\n`;
        } else {
            html += `LAUNCH YEAR   : ${escapeHTML(String(lang.year || 'N/A'))}\n`;
        }
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

        const sources = (lang.sources || []).filter(u => /^https?:\/\//.test(u));
        if (sources.length > 0) {
            html += `\n<div class="terminal-section-title">SOURCES:</div>`;
            sources.forEach(u => {
                html += `- <a href="${escapeHTML(u)}" target="_blank" rel="noopener noreferrer">${escapeHTML(u)}</a>\n`;
            });
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

    // Prism.highlight() is synchronous and only sees grammars already loaded, so fetch
    // the grammar (plus its dependencies) through the autoloader first.
    function loadGrammar(id, done) {
        const autoloader = Prism.plugins && Prism.plugins.autoloader;
        if (!id || Prism.languages[id] || !autoloader) return done();
        autoloader.loadLanguages(id, done, done);
    }

    // Prism output can open a span on one line and close it lines later (block comments,
    // multi-line strings). Close open spans at each newline and reopen them on the next
    // line, so every line is self-contained and the line number never inherits a color.
    function splitHighlightedLines(html) {
        const lines = [];
        const open = [];
        let current = '';
        for (const part of html.split(/(<span[^>]*>|<\/span>|\n)/)) {
            if (part === '\n') {
                lines.push(current + '</span>'.repeat(open.length));
                current = open.join('');
            } else if (part.startsWith('<span')) {
                open.push(part);
                current += part;
            } else if (part === '</span>') {
                open.pop();
                current += part;
            } else {
                current += part;
            }
        }
        lines.push(current);
        return lines;
    }

    function renderCodeLines(code, grammarId) {
        const grammar = Prism.languages[grammarId] || Prism.languages.plaintext;
        const lines = splitHighlightedLines(Prism.highlight(code, grammar, grammarId));
        if (lines.length > 1 && lines[lines.length - 1].replace(/<[^>]+>/g, '') === '') lines.pop();
        codeBlock.innerHTML = lines.map((line, idx) =>
            `<span class="prism-line-number" data-line="${idx + 1}">${idx + 1}</span>${line}`
        ).join('\n');
    }

    function displayCode(code, lang) {
        currentModalRawCode = code;
        const grammarId = lang.prism || 'plaintext';

        try {
            // Plain first so the code shows instantly, then colors once the grammar arrives
            renderCodeLines(code, Prism.languages[grammarId] ? grammarId : 'plaintext');
            if (!Prism.languages[grammarId]) {
                loadGrammar(grammarId, () => {
                    if (currentModalLang === lang && currentModalRawCode === code) {
                        renderCodeLines(code, grammarId);
                    }
                });
            }
        } catch (e) {
            // Fallback
            codeBlock.textContent = code;
        }
    }

    function hideModal() {
        if (modal.classList.contains('hidden')) return;
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        currentModalLang = null;
        if (focusBeforeModal && document.contains(focusBeforeModal)) focusBeforeModal.focus();
        focusBeforeModal = null;
    }

    // Close = undo the history entry we pushed, so Back never reopens a closed modal.
    // A deep-link landing pushed nothing, so just strip the hash in place.
    function closeModal() {
        if (location.hash && modalPushedHistory) {
            modalPushedHistory = false;
            history.back(); // hashchange with an empty hash calls hideModal()
            return;
        }
        modalPushedHistory = false;
        hideModal();
        if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
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
            } else if (document.activeElement === searchInput && searchInput.value) {
                clearSearchBtn.click();
            } else if (document.activeElement === frameworksSearchInput && frameworksSearchInput.value) {
                clearFrameworksSearchBtn.click();
            }
        }
        const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]');
        if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && activeView !== 'wizard') {
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
                    const prismLang = lang.prism || 'plaintext';
                    
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
                            const prismLang = lang.prism || 'plaintext';
                            
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
    // Old links used slugify(name), which made C/C++/C# all "#c"; still accept those
    function findLanguageBySlug(hash) {
        return languages.find(l => l.slug === hash) || languages.find(l => slugify(l.name) === hash);
    }

    function checkDeepLink() {
        const hash = decodeURIComponent(location.hash.slice(1));
        if (!hash) return;
        const match = findLanguageBySlug(hash);
        if (match) openModal(match, true);
    }

    // The hash is the source of truth: Back/Forward open or close the modal
    window.addEventListener('hashchange', () => {
        const hash = decodeURIComponent(location.hash.slice(1));
        const match = hash ? findLanguageBySlug(hash) : null;
        if (!match) {
            modalPushedHistory = false;
            hideModal();
            return;
        }
        if (match !== currentModalLang) openModal(match, true);
    });
});
