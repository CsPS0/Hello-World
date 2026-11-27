// Prism grammars for languages Prism does not ship. Loaded after prism.min.js;
// languages Prism does ship are fetched on demand by the autoloader instead.
(function () {
    if (typeof Prism === 'undefined') return;
    const L = Prism.languages;

    const dq = { pattern: /"(?:\\.|""|[^"\\\r\n])*"/, greedy: true };
    const sq = { pattern: /'(?:\\.|''|[^'\\\r\n])*'/, greedy: true };
    const number = /\b\d+(?:\.\d+)?\b/;
    const words = (list, flags = '') => new RegExp(`\\b(?:${list.join('|')})\\b`, flags);
    const call = /\b[A-Za-z_]\w*(?=\s*\()/;

    L.algol68 = {
        comment: /\bCO\b[\s\S]*?\bCO\b|\bCOMMENT\b[\s\S]*?\bCOMMENT\b|#[^#]*#/,
        string: dq,
        keyword: words(['BEGIN', 'END', 'IF', 'THEN', 'ELSE', 'ELIF', 'FI', 'DO', 'OD', 'FOR', 'FROM', 'TO', 'BY', 'WHILE',
            'PROC', 'INT', 'REAL', 'BOOL', 'CHAR', 'STRING', 'VOID', 'MODE', 'OP', 'PR', 'PRAGMAT', 'SKIP', 'CASE', 'IN', 'OUT', 'ESAC']),
        builtin: words(['print', 'printf', 'newline', 'read']),
        number,
        punctuation: /[();,]/
    };

    L.arnoldc = {
        string: dq,
        keyword: {
            pattern: /^[ \t]*[A-Z][A-Z' ,!?.-]*?(?=[ \t]+(?:"|-?\d|@|[A-Za-z_]+[ \t]*$)|[ \t]*$)/m
        },
        number: /-?\b\d+\b/,
        constant: /@\w+(?: \w+)*/
    };

    L.befunge = {
        string: { pattern: /"[^"]*"/, greedy: true },
        number: /\d/,
        keyword: /[<>^v?_|#@]/,
        function: /[.,&~pg:\\$]/,
        operator: /[+\-*\/%!`]/
    };

    L.chef = {
        title: { pattern: /^[^\n]+\.(?=\n)/, alias: 'keyword' },
        keyword: /^(?:Ingredients|Method|Serves[^\n]*|Cooking time[^\n]*|Pre-heat oven[^\n]*)\.?$/m,
        function: words(['Take', 'Put', 'Fold', 'Add', 'Remove', 'Combine', 'Divide', 'Liquefy', 'Liquify', 'Stir', 'Mix',
            'Clean', 'Pour', 'Set aside', 'Serve with', 'Refrigerate']),
        builtin: words(['g', 'kg', 'pinch(?:es)?', 'ml', 'l', 'dash(?:es)?', 'cups?', 'teaspoons?', 'tablespoons?', 'heaped', 'level']),
        number
    };

    L.dc = {
        string: { pattern: /\[[^\]]*\]/, greedy: true },
        number: /_?\b\d+(?:\.\d+)?\b/,
        function: /[pnPfcdrkiIoOKvzZXqQ]/,
        operator: /[-+*\/%^~|]/,
        variable: /[sSlL<>=!:;][a-z]/
    };

    L.emojicode = {
        string: { pattern: /🔤[\s\S]*?🔤/u, greedy: true },
        keyword: /🏁|🍇|🍉|🐇|🆕|↩️|↪️|🙅|🔁|🔂|📗|📘|🍿|🍯/u,
        function: /😀|❗️|❓|❗|❓/u,
        number
    };

    L.forth = {
        comment: /\\ .*|\(\s[^)]*\)/,
        string: { pattern: /(?:\.|[sScC]|abort)"\s[^"]*"/, greedy: true },
        definition: { pattern: /(^|\s)[:;](?=\s|$)/m, lookbehind: true, alias: 'keyword' },
        keyword: words(['IF', 'THEN', 'ELSE', 'DO', 'LOOP', 'BEGIN', 'UNTIL', 'WHILE', 'REPEAT', 'AGAIN',
            'VARIABLE', 'CONSTANT', 'CREATE', 'EXIT', 'RECURSE'], 'i'),
        builtin: words(['CR', 'EMIT', 'TYPE', 'DUP', 'DROP', 'SWAP', 'OVER', 'ROT', 'BYE', 'SPACE', 'SPACES', 'KEY'], 'i'),
        number: /-?\b\d+\b/
    };

    // 05AB1E, GolfScript, Jelly, Pyth: strings may be left open at end of program
    L.golf = {
        string: { pattern: /["“][^"”]*(?:["”]|$)/, greedy: true },
        number,
        operator: /[^\w\s"“”]/
    };

    L.harbour = {
        comment: [/\/\*[\s\S]*?\*\//, /(?:\/\/|&&).*/, /^[ \t]*\*.*/m],
        string: [dq, sq],
        keyword: words(['PROCEDURE', 'FUNCTION', 'RETURN', 'LOCAL', 'STATIC', 'PRIVATE', 'PUBLIC', 'IF', 'ELSE', 'ELSEIF', 'ENDIF',
            'DO', 'WHILE', 'ENDDO', 'FOR', 'TO', 'STEP', 'NEXT', 'CASE', 'OTHERWISE', 'ENDCASE', 'CLASS', 'ENDCLASS', 'METHOD'], 'i'),
        function: call,
        number,
        operator: /:=|[+\-*\/=<>?!]+/
    };

    L.intercal = {
        keyword: /\b(?:PLEASE(?: DO)?|DO|NOT|N'T|GIVE UP|READ OUT|WRITE IN|COME FROM|STASH|RETRIEVE|IGNORE|REMEMBER|ABSTAIN FROM|REINSTATE|FORGET|RESUME|NEXT)\b/,
        operator: /<-|\bSUB\b|[~$&V?]/,
        variable: /[.,:;]\d+/,
        number: /#\d+/,
        label: { pattern: /\(\d+\)/, alias: 'function' }
    };

    L.joy = {
        string: dq,
        keyword: words(['DEFINE', 'LIBRA', 'HIDE', 'IN', 'END', 'MODULE', 'PRIVATE', 'PUBLIC']),
        builtin: words(['putchars', 'put', 'putch', 'dup', 'pop', 'swap', 'i', 'x', 'dip', 'map', 'step', 'fold', 'filter',
            'ifte', 'cond', 'while', 'times', 'linrec', 'binrec', 'primrec', 'first', 'rest', 'cons', 'concat', 'size']),
        number,
        punctuation: /==|[\[\].;]/
    };

    L.logo = {
        comment: /;.*/,
        string: /"[^\s\[\]()]+/,
        variable: /:\w+/,
        keyword: words(['to', 'end', 'repeat', 'if', 'ifelse', 'make', 'local', 'output', 'op', 'stop', 'forever', 'while'], 'i'),
        builtin: words(['print', 'pr', 'show', 'type', 'forward', 'fd', 'back', 'bk', 'left', 'lt', 'right', 'rt',
            'penup', 'pu', 'pendown', 'pd', 'home', 'clearscreen', 'cs', 'hideturtle', 'ht', 'showturtle', 'st'], 'i'),
        number,
        punctuation: /[\[\]()]/
    };

    L.m4 = {
        comment: /\bdnl\b.*|#.*/,
        string: { pattern: /`[^']*'/, greedy: true },
        keyword: words(['define', 'undefine', 'include', 'sinclude', 'ifdef', 'ifelse', 'changequote', 'changecom', 'divert',
            'undivert', 'divnum', 'pushdef', 'popdef', 'incr', 'decr', 'eval', 'len', 'index', 'substr', 'translit', 'syscmd'])
    };

    // MUMPS, Caché ObjectScript and its class definitions
    L.mumps = {
        comment: [/\/\*[\s\S]*?\*\//, /(?:\/\/|;).*/],
        string: { pattern: /"(?:""|[^"\r\n])*"/, greedy: true },
        keyword: [
            words(['Class', 'Extends', 'Method', 'ClassMethod', 'Property', 'Parameter', 'Index', 'Query', 'Return', 'As',
                'Break', 'Close', 'Do', 'Else', 'For', 'Goto', 'Halt', 'Hang', 'If', 'Job', 'Kill', 'Lock', 'Merge', 'New',
                'Open', 'Quit', 'Read', 'Set', 'Use', 'View', 'Write', 'Xecute', 'Try', 'Catch', 'Throw', 'While'], 'i'),
            { pattern: /(^[ \t]*)[BCDEFGHIJKLMNOQRSUVWX](?=[ \t:])/m, lookbehind: true }
        ],
        variable: /[%^][\w.]+/,
        number,
        operator: /[!_#?@'=<>+\-*\/\\&]/
    };

    L.ook = {
        keyword: /Ook(?=[.?!])/,
        operator: { pattern: /(Ook)[.?!]/, lookbehind: true }
    };

    L.pli = {
        comment: /\/\*[\s\S]*?\*\//,
        string: sq,
        label: { pattern: /^\s*\w+(?=\s*:)/m, alias: 'function' },
        keyword: words(['procedure', 'proc', 'options', 'main', 'put', 'get', 'skip', 'list', 'edit', 'data', 'end', 'declare',
            'dcl', 'do', 'if', 'then', 'else', 'call', 'return', 'begin', 'fixed', 'float', 'binary', 'decimal', 'char', 'character',
            'init', 'while', 'until', 'select', 'when', 'otherwise'], 'i'),
        number,
        punctuation: /[();:,]/
    };

    L.postscript = {
        comment: /%.*/,
        string: { pattern: /\((?:\\.|[^()\\]|\((?:\\.|[^()\\])*\))*\)/, greedy: true },
        variable: /\/[^\s\/\[\]{}()<>%]+/,
        keyword: words(['findfont', 'scalefont', 'setfont', 'selectfont', 'moveto', 'rmoveto', 'lineto', 'rlineto', 'show', 'showpage',
            'def', 'dup', 'exch', 'pop', 'stroke', 'newpath', 'closepath', 'fill', 'gsave', 'grestore', 'translate', 'rotate',
            'scale', 'if', 'ifelse', 'for', 'repeat', 'loop', 'exit', 'setgray', 'setrgbcolor', 'setlinewidth', 'arc', 'curveto']),
        number: /-?\b\d+(?:\.\d+)?\b/,
        punctuation: /[{}\[\]]/
    };

    // Red and Rebol
    L.rebol = {
        comment: /;.*/,
        string: [dq, { pattern: /\{[^{}]*\}/, greedy: true }],
        keyword: [/^(?:Red|REBOL)(?=\s*\[)/im,
            words(['func', 'function', 'does', 'has', 'if', 'either', 'unless', 'while', 'until', 'loop', 'repeat', 'foreach',
                'forall', 'return', 'make', 'object', 'context', 'switch', 'case'], 'i')],
        builtin: words(['print', 'prin', 'probe', 'append', 'insert', 'join', 'form', 'mold', 'length\\?'], 'i'),
        variable: /\b[\w-]+:/,
        number,
        punctuation: /[\[\]()]/
    };

    // Rexx and NetRexx
    L.rexx = {
        comment: [/\/\*[\s\S]*?\*\//, /--.*/],
        string: [dq, sq],
        keyword: words(['say', 'do', 'end', 'if', 'then', 'else', 'select', 'when', 'otherwise', 'call', 'return', 'exit', 'parse',
            'pull', 'arg', 'signal', 'iterate', 'leave', 'procedure', 'expose', 'nop', 'loop', 'method', 'class', 'import',
            'returns', 'catch', 'finally', 'to', 'by', 'for', 'forever', 'while', 'until'], 'i'),
        function: call,
        number,
        operator: /\|\||[=<>\\+\-*\/%]+/
    };

    L.rockstar = {
        comment: /\([^)]*\)/,
        string: dq,
        keyword: words(['Say', 'Shout', 'Whisper', 'Scream', 'Listen(?: to)?', 'Put', 'into', 'Let', 'be', 'is', 'was', 'are',
            'were', 'says', 'If', 'Else', 'While', 'Until', 'Give back', 'Take it to the top', 'Break it down', 'Build', 'up',
            'Knock', 'down', 'takes', 'taking', 'and', 'or', 'not', 'nor'], 'i'),
        number
    };

    L.shakespeare = {
        title: { pattern: /^[^\n]+\.(?=\n)/, alias: 'keyword' },
        heading: { pattern: /\b(?:Act|Scene)\s+[IVXLCDM]+:[^\n]*/, alias: 'keyword' },
        'stage-direction': {
            pattern: /\[[^\]]*\]/,
            alias: 'comment',
            inside: { keyword: /\b(?:Enter|Exit|Exeunt)\b/ }
        },
        function: /^[A-Z][a-z]+(?: [A-Z][a-z]+)*(?=:)/m,
        keyword: /\b(?:Speak your mind|Open your heart|Listen to your heart|Open your mind|Remember|Recall|Let us (?:proceed|return) to|We shall (?:proceed|return) to|Am I|Are you|Is|If so|If not)\b/i
    };

    L.snobol = {
        comment: /^\*.*/m,
        string: [dq, sq],
        label: { pattern: /^[^\s*-]\S*/m, alias: 'function' },
        goto: { pattern: /:[SF]?\([^)]*\)/, alias: 'keyword' },
        keyword: words(['OUTPUT', 'INPUT', 'END', 'DEFINE', 'DATA', 'ARRAY', 'TABLE', 'SIZE', 'DUPL', 'REPLACE', 'TRIM', 'LEN',
            'SPAN', 'BREAK', 'ANY', 'NOTANY', 'ARB', 'REM', 'RETURN', 'FRETURN']),
        number
    };

    L.uiua = {
        comment: /#.*/,
        string: dq,
        function: /&\w+/,
        number: /¯?\b\d+(?:\.\d+)?\b/,
        operator: /[^\x00-\x7F]/
    };

    L.underload = {
        string: { pattern: /\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/, greedy: true },
        keyword: /[~:!*^aS]/
    };

    L.unlambda = {
        comment: /#.*/,
        string: /\.[\s\S]/,
        punctuation: /`/,
        keyword: /\?[\s\S]|[skivdcer@|]/
    };

    // Whitespace: the program is the spaces and tabs, so make them visible
    L.whitespace = {
        comment: /[^ \t\n]+/,
        'ws-space': / /,
        'ws-tab': /\t/
    };
})();
