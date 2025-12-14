document.addEventListener('DOMContentLoaded', () => {
    let languages = [];
    let fuse;
    const grid = document.getElementById('languages-grid');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');
    const modal = document.getElementById('code-modal');
    const modalTitle = document.getElementById('modal-title');
    const codeBlock = document.getElementById('code-block');
    const closeModal = document.getElementById('close-modal');
    const copyBtn = document.getElementById('copy-btn');
    const langCount = document.getElementById('lang-count');

    // ClipboardJS
    new ClipboardJS('#copy-btn');
    const originalCopyText = copyBtn.querySelector('.btn-text').textContent;
    copyBtn.addEventListener('click', () => {
        const span = copyBtn.querySelector('.btn-text');
        span.textContent = 'Copied!';
        setTimeout(() => span.textContent = originalCopyText, 2000);
    });

    // Fetch Data
    fetch('languages.json')
        .then(res => res.json())
        .then(data => {
            languages = data;
            if(langCount) langCount.textContent = languages.length;
            
            // Init Fuse
            fuse = new Fuse(languages, {
                keys: ['name', 'description'],
                threshold: 0.3
            });

            renderGrid(languages);
        })
        .catch(err => console.error('Error loading languages:', err));

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length === 0) {
            renderGrid(languages);
        } else {
            const results = fuse.search(query);
            renderGrid(results.map(r => r.item));
        }
    });

    function renderGrid(items) {
        grid.innerHTML = '';
        if (items.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
            
            items.forEach((lang, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${lang.name}</h3>
                    <p>${lang.description}</p>
                `;
                card.onclick = () => openModal(lang);
                grid.appendChild(card);
            });

            // Animation
            anime({
                targets: '.card',
                opacity: [0, 1],
                translateY: [20, 0],
                delay: anime.stagger(50),
                easing: 'easeOutQuad'
            });
        }
    }

    // Modal
    function openModal(lang) {
        modalTitle.textContent = lang.name;
        codeBlock.textContent = 'Loading...';
        codeBlock.className = 'language-plaintext'; // reset
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // prevent bg scroll

        // Fetch Code
        // lang.path is like "hello-word/hello.c"
        fetch(lang.path)
            .then(res => {
                if(!res.ok) throw new Error('Network response was not ok');
                return res.text();
            })
            .then(code => {
                codeBlock.textContent = code;
                const ext = getExtension(lang.path);
                const prismLang = getPrismLang(ext);
                codeBlock.className = `language-${prismLang}`;
                Prism.highlightElement(codeBlock);
            })
            .catch(err => {
                codeBlock.textContent = `Error loading code: ${err.message}`;
            });
    }

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    function getExtension(path) {
        return path.split('.').pop().toLowerCase();
    }

    function getPrismLang(ext) {
        // Map uncommon extensions to Prism known aliases
        const map = {
            'cs': 'csharp',
            'fs': 'fsharp',
            'js': 'javascript',
            'ts': 'typescript',
            'kt': 'kotlin',
            'md': 'markdown',
            'm': 'matlab', // or objectivec, ambiguous
            'mm': 'objectivec',
            'pl': 'perl',
            'py': 'python',
            'rb': 'ruby',
            'rs': 'rust',
            'sh': 'bash',
            'yml': 'yaml',
            'adb': 'ada',
            'ads': 'ada',
            'ahk': 'autohotkey',
            'asm': 'nasm',
            'cob': 'cobol',
            'cbl': 'cobol',
            'f90': 'fortran',
            'hs': 'haskell',
            'clj': 'clojure',
            'erl': 'erlang',
            'exs': 'elixir',
            'vim': 'vim',
            'zig': 'zig'
        };
        return map[ext] || ext;
    }
});
