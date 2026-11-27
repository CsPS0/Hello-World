// Stack finder data + recommender. Pure functions, no DOM: app.js renders the result,
// and the same file runs under bun for tests (module.exports at the bottom).
(function (root) {
    // ----- Questions -------------------------------------------------------
    const TARGETS = [
        { value: 'webapp',   label: 'Web app',           hint: 'Logins, data, pages that change' },
        { value: 'website',  label: 'Website',           hint: 'Blog, docs, portfolio, landing page' },
        { value: 'api',      label: 'API / backend',     hint: 'JSON service other apps talk to' },
        { value: 'mobile',   label: 'Mobile app',        hint: 'iOS / Android' },
        { value: 'desktop',  label: 'Desktop app',       hint: 'Windows / macOS / Linux window' },
        { value: 'game',     label: 'Game',              hint: '2D or 3D, browser or desktop' },
        { value: 'cli',      label: 'CLI tool / script', hint: 'Runs in a terminal' },
        { value: 'data',     label: 'Data / AI',         hint: 'Analysis, ML models, LLM apps' },
        { value: 'embedded', label: 'Hardware / IoT',    hint: 'Microcontroller, Raspberry Pi' },
    ];

    // Follow-up question per target; a target with no entry skips the question
    const VARIANTS = {
        webapp: { question: 'What kind of web app?', options: [
            { value: 'interactive', label: 'App-like', hint: 'Dashboards, editors, lots of clicking' },
            { value: 'classic',     label: 'Classic',  hint: 'Forms, CRUD, admin, server pages' },
            { value: 'realtime',    label: 'Live',     hint: 'Chat, multiplayer, live updates' },
        ] },
        api: { question: 'What kind of API?', options: [
            { value: 'rest',     label: 'REST / JSON',      hint: 'Typical CRUD backend' },
            { value: 'realtime', label: 'High concurrency', hint: 'WebSockets, many connections' },
        ] },
        mobile: { question: 'Which phones?', options: [
            { value: 'both',    label: 'iOS and Android', hint: 'One codebase' },
            { value: 'ios',     label: 'iOS only',        hint: 'Needs a Mac' },
            { value: 'android', label: 'Android only',    hint: '' },
        ] },
        desktop: { question: 'How should it be built?', options: [
            { value: 'webui',  label: 'Web tech UI', hint: 'HTML/CSS/JS inside a window' },
            { value: 'native', label: 'Native UI',   hint: 'Real OS widgets' },
        ] },
        game: { question: 'What kind of game?', options: [
            { value: 'browser2d', label: '2D in the browser', hint: '' },
            { value: 'browser3d', label: '3D in the browser', hint: '' },
            { value: 'desktop2d', label: '2D desktop / mobile', hint: '' },
            { value: 'desktop3d', label: '3D desktop / mobile', hint: '' },
            { value: 'aaa',       label: 'High-end 3D',  hint: 'Realistic graphics, consoles' },
        ] },
        cli: { question: 'How will it be used?', options: [
            { value: 'script', label: 'Quick script', hint: 'Automate something on my machine' },
            { value: 'tool',   label: 'Tool to share', hint: 'Single binary others install' },
        ] },
        data: { question: 'What do you want to do?', options: [
            { value: 'analysis', label: 'Analyse data', hint: 'Tables, charts, statistics' },
            { value: 'training', label: 'Train models', hint: 'Neural networks, deep learning' },
            { value: 'llm',      label: 'LLM app',      hint: 'Chatbot, text generation' },
        ] },
        embedded: { question: 'What hardware?', options: [
            { value: 'mcu',   label: 'Microcontroller', hint: 'Arduino, ESP32, RP2040' },
            { value: 'linux', label: 'Linux board',     hint: 'Raspberry Pi and similar' },
        ] },
    };

    const FAMILIES = [
        { value: 'js', label: 'JavaScript / TypeScript' }, { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java / Kotlin' }, { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' }, { value: 'rust', label: 'Rust' }, { value: 'cpp', label: 'C / C++' },
        { value: 'ruby', label: 'Ruby' }, { value: 'php', label: 'PHP' }, { value: 'swift', label: 'Swift' },
        { value: 'elixir', label: 'Elixir' }, { value: 'lua', label: 'Lua' }, { value: 'r', label: 'R' },
    ];

    const PRIORITIES = [
        { value: 'fast', label: 'Ship fast / easy to learn' },
        { value: 'perf', label: 'Performance' },
        { value: 'safe', label: 'Type safety / long-term maintenance' },
    ];

    // ----- Stack catalog ---------------------------------------------------
    // lang: exact name in languages.json. family: matches FAMILIES. fit: 0-2 per priority.
    // pop: tie-breaker (bigger ecosystem, more tutorials). Commands are the official ones.
    const STACKS = [
        // Web apps
        { id: 'nextjs', name: 'Next.js', lang: 'TypeScript', family: 'js', targets: ['webapp', 'website'], variants: { webapp: ['interactive', 'realtime'] },
          fit: { fast: 2, perf: 1, safe: 2 }, pop: 10, popBy: { website: 5 },
          why: 'React framework with routing, server rendering and API routes in one project.',
          tradeoff: 'Many concepts (server vs client components); overkill for a simple site.',
          setup: ['npx create-next-app@latest my-app', 'cd my-app'], run: 'npm run dev',
          layout: 'app/\n  layout.tsx\n  page.tsx\npublic/\npackage.json',
          test: 'Vitest, Playwright', lint: 'ESLint (included)', deploy: 'Vercel, Netlify, or Docker on any Node host',
          docs: 'https://nextjs.org/docs' },
        { id: 'sveltekit', name: 'SvelteKit', lang: 'TypeScript', family: 'js', targets: ['webapp', 'website'], variants: { webapp: ['interactive', 'realtime'] },
          fit: { fast: 2, perf: 2, safe: 2 }, pop: 7, popBy: { website: 4 },
          why: 'Small, fast compiled UI framework with routing and server endpoints built in.',
          tradeoff: 'Smaller ecosystem than React; fewer ready-made components.',
          setup: ['npx sv create my-app', 'cd my-app', 'npm install'], run: 'npm run dev',
          layout: 'src/\n  routes/\n    +page.svelte\n  lib/\nstatic/\nsvelte.config.js',
          test: 'Vitest, Playwright', lint: 'ESLint, svelte-check', deploy: 'Vercel, Netlify, Cloudflare, or Node adapter',
          docs: 'https://svelte.dev/docs/kit' },
        { id: 'django', name: 'Django', lang: 'Python', family: 'python', targets: ['webapp'], variants: ['classic'],
          fit: { fast: 2, perf: 1, safe: 1 }, pop: 9,
          why: 'Batteries included: ORM, migrations, auth and a free admin panel for your data.',
          tradeoff: 'Server-rendered by default; rich client UIs need a separate frontend.',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install django', 'django-admin startproject mysite .'],
          run: 'python manage.py runserver',
          layout: 'manage.py\nmysite/\n  settings.py\n  urls.py\n<app>/\n  models.py\n  views.py\n  templates/',
          test: 'Django test runner, pytest-django', lint: 'Ruff', deploy: 'Any VPS with Gunicorn, or Fly.io / Render',
          docs: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' },
        { id: 'rails', name: 'Ruby on Rails', lang: 'Ruby', family: 'ruby', targets: ['webapp'], variants: ['classic', 'realtime'],
          fit: { fast: 2, perf: 0, safe: 0 }, pop: 7,
          why: 'Convention over configuration: generators build models, pages and tests for you.',
          tradeoff: 'Dynamic typing and "magic" can be hard to follow in big codebases.',
          setup: ['gem install rails', 'rails new my-app', 'cd my-app'], run: 'bin/rails server',
          layout: 'app/\n  models/\n  controllers/\n  views/\nconfig/routes.rb\ndb/migrate/',
          test: 'Minitest (included)', lint: 'RuboCop (included)', deploy: 'Kamal (included) to any VPS, or Render',
          docs: 'https://guides.rubyonrails.org/getting_started.html' },
        { id: 'laravel', name: 'Laravel', lang: 'PHP', family: 'php', targets: ['webapp'], variants: ['classic'],
          fit: { fast: 2, perf: 1, safe: 1 }, pop: 8,
          why: 'Full PHP framework with auth, queues and an ORM; runs on cheap shared hosting.',
          tradeoff: 'PHP hosting is easy, but large apps need discipline to stay tidy.',
          setup: ['composer create-project laravel/laravel my-app', 'cd my-app'], run: 'php artisan serve',
          layout: 'app/\n  Models/\n  Http/Controllers/\nresources/views/\nroutes/web.php\ndatabase/migrations/',
          test: 'Pest or PHPUnit (included)', lint: 'Laravel Pint', deploy: 'Laravel Forge, any PHP host, or Docker',
          docs: 'https://laravel.com/docs' },
        { id: 'phoenix', name: 'Phoenix', lang: 'Elixir', family: 'elixir', targets: ['webapp', 'api'], variants: { webapp: ['realtime'], api: ['realtime'] }, best: ['realtime'],
          fit: { fast: 1, perf: 2, safe: 1 }, pop: 5,
          why: 'LiveView gives real-time pages without writing JavaScript; the BEAM handles huge numbers of connections.',
          tradeoff: 'Functional language and OTP concepts take time to learn.',
          setup: ['mix archive.install hex phx_new', 'mix phx.new my_app', 'cd my_app'], run: 'mix phx.server',
          layout: 'lib/\n  my_app/\n  my_app_web/\n    live/\n    router.ex\nconfig/\npriv/repo/migrations/',
          test: 'ExUnit (included)', lint: 'Credo, mix format', deploy: 'Fly.io, Gigalixir, or a release on any VPS',
          docs: 'https://hexdocs.pm/phoenix/up_and_running.html' },
        { id: 'blazor', name: 'ASP.NET Core Blazor', lang: 'C#', family: 'csharp', targets: ['webapp'], variants: ['interactive', 'classic'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 6,
          why: 'Build interactive web UIs in C# instead of JavaScript, sharing code with the backend.',
          tradeoff: 'Smaller UI ecosystem than React; WebAssembly mode has a large first download.',
          setup: ['dotnet new blazor -o MyApp', 'cd MyApp'], run: 'dotnet watch',
          layout: 'Components/\n  Pages/\n  Layout/\nwwwroot/\nProgram.cs\nMyApp.csproj',
          test: 'xUnit, bUnit', lint: 'dotnet format, Roslyn analyzers', deploy: 'Azure App Service, or Docker anywhere',
          docs: 'https://learn.microsoft.com/aspnet/core/blazor/' },

        // Websites
        { id: 'astro', name: 'Astro', lang: 'TypeScript', family: 'js', targets: ['website'], variants: [],
          fit: { fast: 2, perf: 2, safe: 2 }, pop: 9,
          why: 'Ships zero JavaScript by default; write pages in Markdown or components from any framework.',
          tradeoff: 'Not meant for app-like UIs with lots of client state.',
          setup: ['npm create astro@latest my-site -- --template minimal', 'cd my-site'], run: 'npm run dev',
          layout: 'src/\n  pages/\n    index.astro\n  content/\npublic/\nastro.config.mjs',
          test: 'Vitest, Playwright', lint: 'ESLint, astro check', deploy: 'GitHub Pages, Netlify, Vercel, Cloudflare Pages',
          docs: 'https://docs.astro.build' },
        { id: 'hugo', name: 'Hugo', lang: 'Go', family: 'go', targets: ['website'], variants: [],
          fit: { fast: 2, perf: 2, safe: 0 }, pop: 6,
          why: 'Single binary static site generator; builds thousands of Markdown pages in seconds.',
          tradeoff: 'Go templates are awkward; little interactivity without extra JS.',
          setup: ['hugo new site my-site', 'cd my-site'], run: 'hugo server',
          layout: 'content/\nlayouts/\nstatic/\nthemes/\nhugo.toml',
          test: 'htmltest (links)', lint: 'Prettier for templates', deploy: 'GitHub Pages, Netlify, Cloudflare Pages',
          docs: 'https://gohugo.io/getting-started/quick-start/' },

        // APIs
        { id: 'fastapi', name: 'FastAPI', lang: 'Python', family: 'python', targets: ['api'], variants: ['rest'],
          fit: { fast: 2, perf: 1, safe: 1 }, pop: 9,
          why: 'Type hints become request validation and interactive API docs automatically.',
          tradeoff: 'Python is slower than Go/Rust for CPU-heavy endpoints.',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install "fastapi[standard]"'], run: 'fastapi dev main.py',
          layout: 'main.py\napp/\n  routers/\n  models.py\n  db.py\ntests/',
          test: 'pytest + TestClient', lint: 'Ruff, mypy', deploy: 'Docker on any host, Fly.io, Render',
          docs: 'https://fastapi.tiangolo.com/tutorial/' },
        { id: 'go-http', name: 'Go standard library', lang: 'Go', family: 'go', targets: ['api'], variants: ['rest', 'realtime'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 8,
          why: 'net/http routing is enough for most APIs; compiles to one small static binary.',
          tradeoff: 'More boilerplate than batteries-included frameworks; no ORM by default.',
          setup: ['mkdir my-api && cd my-api', 'go mod init example.com/my-api'], run: 'go run .',
          layout: 'main.go\ninternal/\n  handlers/\n  store/\ngo.mod',
          test: 'go test (built in)', lint: 'go vet, golangci-lint', deploy: 'Single binary on any VPS, or a scratch Docker image',
          docs: 'https://go.dev/doc/tutorial/web-service-gin' },
        { id: 'axum', name: 'Axum', lang: 'Rust', family: 'rust', targets: ['api'], variants: ['rest', 'realtime'],
          fit: { fast: 0, perf: 2, safe: 2 }, pop: 6,
          why: 'Fast, memory-safe async web framework on Tokio with compile-time checked handlers.',
          tradeoff: 'Rust compile times and the borrow checker slow early progress.',
          setup: ['cargo new my-api', 'cd my-api', 'cargo add axum', 'cargo add tokio --features full'], run: 'cargo run',
          layout: 'src/\n  main.rs\n  routes/\n  db.rs\nCargo.toml',
          test: 'cargo test', lint: 'Clippy, rustfmt', deploy: 'Single binary on any VPS, or a small Docker image',
          docs: 'https://docs.rs/axum/latest/axum/' },
        { id: 'hono', name: 'Hono', lang: 'TypeScript', family: 'js', targets: ['api'], variants: ['rest'],
          fit: { fast: 2, perf: 1, safe: 2 }, pop: 6,
          why: 'Tiny TypeScript web framework that runs on Node, Bun, Deno and edge platforms unchanged.',
          tradeoff: 'Bring your own database layer and auth.',
          setup: ['npm create hono@latest my-api', 'cd my-api'], run: 'npm run dev',
          layout: 'src/\n  index.ts\n  routes/\npackage.json\ntsconfig.json',
          test: 'Vitest', lint: 'ESLint, tsc', deploy: 'Cloudflare Workers, Bun/Node on any host, Vercel',
          docs: 'https://hono.dev/docs/' },
        { id: 'aspnet-api', name: 'ASP.NET Core Web API', lang: 'C#', family: 'csharp', targets: ['api'], variants: ['rest', 'realtime'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 7,
          why: 'Very fast, mature backend with EF Core ORM, auth and SignalR for real-time.',
          tradeoff: 'More ceremony than minimal frameworks; Microsoft-centric tooling.',
          setup: ['dotnet new webapi -o MyApi', 'cd MyApi'], run: 'dotnet watch',
          layout: 'Program.cs\nControllers/ or endpoints in Program.cs\nModels/\nappsettings.json\nMyApi.csproj',
          test: 'xUnit + WebApplicationFactory', lint: 'dotnet format, Roslyn analyzers', deploy: 'Azure App Service, or Docker anywhere',
          docs: 'https://learn.microsoft.com/aspnet/core/tutorials/min-web-api' },
        { id: 'spring', name: 'Spring Boot', lang: 'Java', family: 'java', targets: ['api', 'webapp'], variants: { api: ['rest'], webapp: ['classic'] },
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 8,
          why: 'The enterprise standard: huge ecosystem for security, data access and messaging.',
          tradeoff: 'Heavy for small projects; annotation magic and slow startup.',
          setup: ['curl https://start.spring.io/starter.zip -d dependencies=web -d type=gradle-project -o demo.zip', 'unzip demo.zip -d demo', 'cd demo'],
          run: './gradlew bootRun',
          layout: 'src/main/java/com/example/demo/\n  DemoApplication.java\nsrc/main/resources/application.properties\nsrc/test/\nbuild.gradle',
          test: 'JUnit 5 (included)', lint: 'Checkstyle or Spotless', deploy: 'Docker on any host, or a JAR on a VPS',
          docs: 'https://spring.io/guides/gs/rest-service' },

        // Mobile
        { id: 'flutter', name: 'Flutter', lang: 'Dart', family: 'dart', targets: ['mobile', 'desktop'], variants: { mobile: ['both'] },
          fit: { fast: 2, perf: 2, safe: 2 }, pop: 9,
          why: 'One Dart codebase for iOS and Android (plus desktop) with hot reload and its own consistent widgets.',
          tradeoff: 'Widgets are drawn by Flutter, not the OS, so it can feel less native.',
          setup: ['flutter create my_app', 'cd my_app'], run: 'flutter run',
          layout: 'lib/\n  main.dart\ntest/\nandroid/\nios/\npubspec.yaml',
          test: 'flutter test', lint: 'flutter analyze', deploy: 'App Store and Google Play',
          docs: 'https://docs.flutter.dev/get-started' },
        { id: 'expo', name: 'React Native (Expo)', lang: 'TypeScript', family: 'js', targets: ['mobile'], variants: ['both'],
          fit: { fast: 2, perf: 1, safe: 2 }, pop: 8,
          why: 'Use React and TypeScript for real native apps; preview on your phone with Expo Go.',
          tradeoff: 'Some native features need custom modules; performance tuning is harder than native.',
          setup: ['npx create-expo-app@latest my-app', 'cd my-app'], run: 'npx expo start',
          layout: 'app/\n  (tabs)/\n  _layout.tsx\ncomponents/\nassets/\napp.json',
          test: 'Jest, React Native Testing Library', lint: 'ESLint (expo lint)', deploy: 'EAS Build to App Store and Google Play',
          docs: 'https://docs.expo.dev/' },
        { id: 'swiftui', name: 'SwiftUI', lang: 'Swift', family: 'swift', targets: ['mobile', 'desktop'], variants: { mobile: ['ios'], desktop: ['native'] },
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 7, popBy: { desktop: 2 },
          why: "Apple's native UI framework: best look, performance and access to every iOS feature.",
          tradeoff: 'Apple platforms only, and you need a Mac with Xcode.',
          setup: ['Install Xcode from the Mac App Store', 'Xcode > File > New > Project > iOS App (Interface: SwiftUI)'], run: 'Press Cmd+R in Xcode',
          layout: 'MyApp/\n  MyAppApp.swift\n  ContentView.swift\n  Assets.xcassets\nMyAppTests/',
          test: 'Swift Testing / XCTest', lint: 'SwiftLint', deploy: 'App Store via Xcode / TestFlight',
          docs: 'https://developer.apple.com/tutorials/swiftui' },
        { id: 'compose', name: 'Jetpack Compose', lang: 'Kotlin', family: 'java', targets: ['mobile'], variants: ['android'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 7,
          why: "Google's modern native Android UI toolkit, written in Kotlin.",
          tradeoff: 'Android only; Android Studio is heavy.',
          setup: ['Install Android Studio', 'File > New > New Project > Empty Activity'], run: 'Click Run in Android Studio',
          layout: 'app/src/main/\n  java/.../MainActivity.kt\n  res/\n  AndroidManifest.xml\napp/build.gradle.kts',
          test: 'JUnit, Compose UI tests', lint: 'Android Lint, ktlint', deploy: 'Google Play Console',
          docs: 'https://developer.android.com/develop/ui/compose/tutorial' },
        { id: 'maui', name: '.NET MAUI', lang: 'C#', family: 'csharp', targets: ['mobile', 'desktop'], variants: { mobile: ['both'], desktop: ['native'] },
          fit: { fast: 1, perf: 1, safe: 2 }, pop: 5,
          why: 'One C# codebase for Android, iOS, Windows and macOS with native controls.',
          tradeoff: 'Tooling is smoothest on Windows/Visual Studio; smaller community than Flutter.',
          setup: ['dotnet workload install maui', 'dotnet new maui -o MyApp', 'cd MyApp'], run: 'Run from Visual Studio, or VS Code with the .NET MAUI extension',
          layout: 'MauiProgram.cs\nApp.xaml\nMainPage.xaml\nPlatforms/\nResources/',
          test: 'xUnit', lint: 'dotnet format', deploy: 'App Store, Google Play, Microsoft Store',
          docs: 'https://learn.microsoft.com/dotnet/maui/' },

        // Desktop
        { id: 'tauri', name: 'Tauri', lang: 'Rust', family: 'rust', targets: ['desktop'], variants: ['webui'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 7,
          why: 'Web UI in the OS webview with a Rust backend: installers of a few MB instead of 100+.',
          tradeoff: 'Native features need some Rust; webviews differ slightly per OS.',
          setup: ['npm create tauri-app@latest my-app', 'cd my-app', 'npm install'], run: 'npm run tauri dev',
          layout: 'src/            (web UI)\nsrc-tauri/\n  src/main.rs\n  tauri.conf.json\npackage.json',
          test: 'Vitest (UI), cargo test (Rust)', lint: 'ESLint, Clippy', deploy: 'tauri build: .msi, .dmg, .AppImage, .deb',
          docs: 'https://tauri.app/start/' },
        { id: 'electron', name: 'Electron', lang: 'TypeScript', family: 'js', targets: ['desktop'], variants: ['webui'],
          fit: { fast: 2, perf: 0, safe: 1 }, pop: 8,
          why: 'Bundles Chromium + Node.js: any web skills become a desktop app (VS Code, Slack, Discord).',
          tradeoff: 'Large downloads and high memory use.',
          setup: ['npx create-electron-app@latest my-app', 'cd my-app'], run: 'npm start',
          layout: 'src/\n  main.js       (main process)\n  preload.js\n  index.html\nforge.config.js',
          test: 'Vitest, Playwright for Electron', lint: 'ESLint', deploy: 'Electron Forge makers: Squirrel, DMG, deb/rpm',
          docs: 'https://www.electronjs.org/docs/latest/tutorial/tutorial-prerequisites' },
        { id: 'pyside', name: 'PySide6 (Qt for Python)', lang: 'Python', family: 'python', targets: ['desktop'], variants: ['native'],
          fit: { fast: 2, perf: 1, safe: 0 }, pop: 6,
          why: 'Official Qt bindings: native-looking cross-platform GUIs from simple Python.',
          tradeoff: 'Packaging Python apps into installers (PyInstaller) is fiddly.',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install PySide6'], run: 'python main.py',
          layout: 'main.py\nui/\n  main_window.py\nresources/\nrequirements.txt',
          test: 'pytest-qt', lint: 'Ruff, mypy', deploy: 'PyInstaller or pyside6-deploy',
          docs: 'https://doc.qt.io/qtforpython-6/gettingstarted.html' },
        { id: 'avalonia', name: 'Avalonia UI', lang: 'C#', family: 'csharp', targets: ['desktop'], variants: ['native'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 5,
          why: 'Cross-platform .NET desktop UI (Windows, macOS, Linux) with XAML, like WPF but everywhere.',
          tradeoff: 'Draws its own controls; smaller community than WPF.',
          setup: ['dotnet new install Avalonia.Templates', 'dotnet new avalonia.app -o MyApp', 'cd MyApp'], run: 'dotnet run',
          layout: 'App.axaml\nMainWindow.axaml\nMainWindow.axaml.cs\nProgram.cs\nMyApp.csproj',
          test: 'xUnit, Avalonia.Headless', lint: 'dotnet format', deploy: 'dotnet publish per OS',
          docs: 'https://docs.avaloniaui.net/' },
        { id: 'qt-cpp', name: 'Qt 6 (C++)', lang: 'C++', family: 'cpp', targets: ['desktop'], variants: ['native'],
          fit: { fast: 0, perf: 2, safe: 1 }, pop: 6,
          why: 'Mature native toolkit used by KDE, VLC and many industrial apps; maximum performance.',
          tradeoff: 'C++ is hard to learn; check Qt licensing (LGPL or commercial).',
          setup: ['Install Qt via the Qt Online Installer (includes Qt Creator)', 'Qt Creator > New Project > Qt Widgets Application'], run: 'Build and run from Qt Creator (Ctrl+R)',
          layout: 'main.cpp\nmainwindow.cpp\nmainwindow.h\nmainwindow.ui\nCMakeLists.txt',
          test: 'Qt Test', lint: 'clang-tidy, clang-format', deploy: 'windeployqt / macdeployqt / linuxdeploy',
          docs: 'https://doc.qt.io/qt-6/gettingstarted.html' },

        // Games
        { id: 'phaser', name: 'Phaser', lang: 'TypeScript', family: 'js', targets: ['game'], variants: ['browser2d'], best: ['browser2d'],
          fit: { fast: 2, perf: 1, safe: 1 }, pop: 7,
          why: 'Popular HTML5 2D game framework: sprites, physics, input and audio out of the box.',
          tradeoff: '2D only; browser performance limits big games.',
          setup: ['npm create @phaserjs/game@latest my-game', 'cd my-game', 'npm install'], run: 'npm run dev',
          layout: 'src/\n  main.ts\n  scenes/\npublic/assets/\nindex.html',
          test: 'Vitest for game logic', lint: 'ESLint', deploy: 'itch.io, GitHub Pages, any static host',
          docs: 'https://docs.phaser.io/' },
        { id: 'threejs', name: 'Three.js', lang: 'TypeScript', family: 'js', targets: ['game'], variants: ['browser3d'],
          fit: { fast: 1, perf: 1, safe: 1 }, pop: 7,
          why: 'The standard WebGL 3D library; huge example collection.',
          tradeoff: 'A renderer, not an engine: physics, scenes and tooling are up to you.',
          setup: ['npm create vite@latest my-game -- --template vanilla-ts', 'cd my-game', 'npm install', 'npm install three'], run: 'npm run dev',
          layout: 'src/\n  main.ts\n  scene.ts\npublic/models/\nindex.html',
          test: 'Vitest for game logic', lint: 'ESLint', deploy: 'itch.io, GitHub Pages, any static host',
          docs: 'https://threejs.org/manual/' },
        { id: 'godot', name: 'Godot', lang: 'GDScript', family: 'gdscript', targets: ['game'], variants: ['desktop2d', 'desktop3d', 'browser2d'], best: ['desktop2d'],
          fit: { fast: 2, perf: 1, safe: 1 }, pop: 8,
          why: 'Free, open-source engine with an excellent 2D workflow, a small download and a Python-like script language.',
          tradeoff: 'Fewer AAA-grade 3D features and asset-store content than Unity/Unreal.',
          setup: ['Download Godot from godotengine.org (single executable)', 'Project Manager > New Project'], run: 'Press F5 in the editor',
          layout: 'project.godot\nscenes/\n  main.tscn\nscripts/\n  player.gd\nassets/',
          test: 'GUT or gdUnit4', lint: 'gdtoolkit (gdlint, gdformat)', deploy: 'Export templates: Windows, macOS, Linux, Web, Android, iOS',
          docs: 'https://docs.godotengine.org/en/stable/getting_started/introduction/' },
        { id: 'unity', name: 'Unity', lang: 'C#', family: 'csharp', targets: ['game'], variants: ['desktop3d', 'desktop2d'],
          fit: { fast: 2, perf: 2, safe: 2 }, pop: 9,
          why: 'Most-used engine for mobile and indie 3D; huge asset store and tutorials.',
          tradeoff: 'Closed source; check the current license and runtime-fee terms.',
          setup: ['Install Unity Hub', 'Unity Hub > New project > Universal 3D (or 2D)'], run: 'Press Play in the editor',
          layout: 'Assets/\n  Scenes/\n  Scripts/\n  Prefabs/\nPackages/\nProjectSettings/',
          test: 'Unity Test Framework', lint: 'Roslyn analyzers', deploy: 'Build Settings: PC, mobile, consoles, WebGL',
          docs: 'https://learn.unity.com/' },
        { id: 'unreal', name: 'Unreal Engine 5', lang: 'C++', family: 'cpp', targets: ['game'], variants: ['aaa', 'desktop3d'],
          fit: { fast: 0, perf: 2, safe: 1 }, pop: 7,
          why: 'Top-end graphics (Nanite, Lumen) and console tooling; Blueprints for no-code logic.',
          tradeoff: 'Huge install, heavy C++; 5% royalty above the revenue threshold.',
          setup: ['Install the Epic Games Launcher', 'Unreal Engine > Library > install UE5', 'New Project > Games > Third Person'], run: 'Press Play in the editor',
          layout: 'Content/\nSource/<Project>/\nConfig/\n<Project>.uproject',
          test: 'Unreal Automation Testing', lint: 'clang-tidy', deploy: 'Package Project: PC, consoles, mobile',
          docs: 'https://dev.epicgames.com/documentation/en-us/unreal-engine' },
        { id: 'love', name: 'LÖVE', lang: 'Lua', family: 'lua', targets: ['game'], variants: ['desktop2d'],
          fit: { fast: 2, perf: 1, safe: 0 }, pop: 5,
          why: 'Tiny 2D framework: a main.lua file and three callbacks is a whole game.',
          tradeoff: 'No editor; everything is code.',
          setup: ['Install LÖVE from love2d.org', 'mkdir my-game && cd my-game', 'create main.lua'], run: 'love .',
          layout: 'main.lua\nconf.lua\nassets/',
          test: 'busted', lint: 'luacheck', deploy: '.love file, or fused executables per OS',
          docs: 'https://love2d.org/wiki/Getting_Started' },
        { id: 'bevy', name: 'Bevy', lang: 'Rust', family: 'rust', targets: ['game'], variants: ['desktop2d', 'desktop3d'],
          fit: { fast: 0, perf: 2, safe: 2 }, pop: 5,
          why: 'Data-driven Rust engine built on an ECS; fast and fully code-based.',
          tradeoff: 'Young engine with breaking changes between versions and no full editor yet.',
          setup: ['cargo new my-game', 'cd my-game', 'cargo add bevy'], run: 'cargo run',
          layout: 'src/\n  main.rs\n  systems/\nassets/\nCargo.toml',
          test: 'cargo test', lint: 'Clippy, rustfmt', deploy: 'cargo build --release per OS, or WebAssembly',
          docs: 'https://bevyengine.org/learn/' },

        // CLI
        { id: 'bash', name: 'Bash script', lang: 'Bash', family: 'bash', targets: ['cli'], variants: ['script'],
          fit: { fast: 2, perf: 1, safe: 0 }, pop: 6,
          why: 'Already installed on Linux and macOS; ideal for gluing existing commands together.',
          tradeoff: 'Gets fragile past ~100 lines; quoting and error handling are easy to get wrong.',
          setup: ['printf \'#!/usr/bin/env bash\\nset -euo pipefail\\n\' > script.sh', 'chmod +x script.sh'], run: './script.sh',
          layout: 'script.sh',
          test: 'bats-core', lint: 'ShellCheck, shfmt', deploy: 'Copy the file; it runs anywhere Bash exists',
          docs: 'https://www.gnu.org/software/bash/manual/' },
        { id: 'typer', name: 'Python + Typer', lang: 'Python', family: 'python', targets: ['cli'], variants: ['script', 'tool'],
          fit: { fast: 2, perf: 0, safe: 1 }, pop: 8,
          why: 'Function signatures become commands, options and --help text automatically.',
          tradeoff: 'Users need Python installed (or you bundle it with pipx/uv tool).',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install typer'], run: 'python main.py --help',
          layout: 'main.py\nmy_cli/\n  commands/\npyproject.toml\ntests/',
          test: 'pytest + typer.testing.CliRunner', lint: 'Ruff, mypy', deploy: 'Publish to PyPI; users install with pipx or uv tool',
          docs: 'https://typer.tiangolo.com/tutorial/' },
        { id: 'cobra', name: 'Go + Cobra', lang: 'Go', family: 'go', targets: ['cli'], variants: ['tool'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 8,
          why: 'The CLI library behind kubectl and the GitHub CLI; ships as one static binary per OS.',
          tradeoff: 'More boilerplate than Python for quick throwaway scripts.',
          setup: ['mkdir my-cli && cd my-cli', 'go mod init example.com/my-cli', 'go install github.com/spf13/cobra-cli@latest', 'cobra-cli init'],
          run: 'go run . --help',
          layout: 'main.go\ncmd/\n  root.go\ngo.mod',
          test: 'go test', lint: 'go vet, golangci-lint', deploy: 'GoReleaser: binaries, Homebrew, Scoop',
          docs: 'https://cobra.dev/' },
        { id: 'clap', name: 'Rust + clap', lang: 'Rust', family: 'rust', targets: ['cli'], variants: ['tool'],
          fit: { fast: 0, perf: 2, safe: 2 }, pop: 7,
          why: 'Derive a full argument parser from a struct; fast, single binary (ripgrep, bat, fd style).',
          tradeoff: 'Slower to write than Python or Go for small tools.',
          setup: ['cargo new my-cli', 'cd my-cli', 'cargo add clap --features derive'], run: 'cargo run -- --help',
          layout: 'src/\n  main.rs\n  cli.rs\nCargo.toml',
          test: 'cargo test, assert_cmd', lint: 'Clippy, rustfmt', deploy: 'cargo install, or cargo-dist for binaries',
          docs: 'https://docs.rs/clap/latest/clap/_derive/_tutorial/' },

        // Data / AI
        { id: 'pydata', name: 'Python + Polars / pandas + Jupyter', lang: 'Python', family: 'python', targets: ['data'], variants: ['analysis'],
          fit: { fast: 2, perf: 1, safe: 0 }, pop: 10,
          why: 'The standard data toolkit: notebooks to explore, Polars or pandas for tables, plenty of chart libraries.',
          tradeoff: 'Notebooks get messy; move stable code into modules.',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install polars pandas jupyterlab matplotlib'], run: 'jupyter lab',
          layout: 'notebooks/\n  01-explore.ipynb\nsrc/\ndata/\n  raw/\n  processed/\nrequirements.txt',
          test: 'pytest for src/', lint: 'Ruff, nbstripout', deploy: 'Share notebooks, or turn into a Streamlit app',
          docs: 'https://docs.pola.rs/user-guide/getting-started/' },
        { id: 'r-tidy', name: 'R + tidyverse', lang: 'R', family: 'r', targets: ['data'], variants: ['analysis'],
          fit: { fast: 2, perf: 1, safe: 0 }, pop: 6,
          why: 'Built for statistics: dplyr for wrangling and ggplot2 for publication-quality charts.',
          tradeoff: 'Less suited to building general software around the analysis.',
          setup: ['Install R and RStudio (or Positron)', 'In R: install.packages("tidyverse")'], run: 'Run scripts or Quarto documents from RStudio',
          layout: 'analysis.qmd\nR/\ndata/\nrenv.lock',
          test: 'testthat', lint: 'lintr, styler', deploy: 'Quarto reports, Shiny apps on Posit Connect or shinyapps.io',
          docs: 'https://r4ds.hadley.nz/' },
        { id: 'pytorch', name: 'Python + PyTorch', lang: 'Python', family: 'python', targets: ['data'], variants: ['training'],
          fit: { fast: 1, perf: 2, safe: 0 }, pop: 10,
          why: 'The most used deep-learning framework in research and industry; runs on GPUs.',
          tradeoff: 'Needs a GPU (or cloud GPU) for anything beyond small models.',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install torch'], run: 'python train.py',
          layout: 'train.py\nmodels/\ndata/\nconfigs/\ncheckpoints/',
          test: 'pytest for data and model shapes', lint: 'Ruff', deploy: 'TorchScript/ONNX, or serve behind FastAPI',
          docs: 'https://pytorch.org/tutorials/beginner/basics/intro.html' },
        { id: 'hf', name: 'Python + Hugging Face Transformers', lang: 'Python', family: 'python', targets: ['data'], variants: ['llm', 'training'],
          fit: { fast: 2, perf: 1, safe: 0 }, pop: 8,
          why: 'Thousands of open models for text, chat and embeddings, runnable locally or fine-tuned.',
          tradeoff: 'Large models need lots of RAM/GPU; hosted LLM APIs are simpler for production chat.',
          setup: ['python -m venv .venv', 'source .venv/bin/activate', 'pip install transformers torch'], run: 'python app.py',
          layout: 'app.py\nprompts/\nsrc/\ntests/',
          test: 'pytest with fixed prompts and expected outputs', lint: 'Ruff', deploy: 'FastAPI server, or Hugging Face Spaces',
          docs: 'https://huggingface.co/docs/transformers/quicktour' },
        { id: 'ts-llm', name: 'TypeScript + LLM provider SDK', lang: 'TypeScript', family: 'js', targets: ['data'], variants: ['llm'],
          fit: { fast: 2, perf: 1, safe: 2 }, pop: 7,
          why: 'Call a hosted model (Claude, GPT, Gemini) from a Node or edge backend and stream answers to a web UI.',
          tradeoff: 'Pay per token; keep API keys on the server, never in the browser.',
          setup: ['mkdir my-llm-app && cd my-llm-app', 'npm init -y', 'npm install typescript tsx', 'install your provider\'s official SDK'], run: 'npx tsx src/index.ts',
          layout: 'src/\n  index.ts\n  prompts/\n.env          (API key, git-ignored)\npackage.json',
          test: 'Vitest with recorded responses', lint: 'ESLint, tsc', deploy: 'Any Node host, Vercel, Cloudflare Workers',
          docs: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs' },

        // Embedded
        { id: 'arduino', name: 'Arduino (C++)', lang: 'C++', family: 'cpp', targets: ['embedded'], variants: ['mcu'],
          fit: { fast: 2, perf: 2, safe: 0 }, pop: 9,
          why: 'Biggest beginner hardware ecosystem: a library for almost every sensor and board.',
          tradeoff: 'The simple framework hides details you need for advanced, low-power designs.',
          setup: ['Install arduino-cli (or the Arduino IDE)', 'arduino-cli core install arduino:avr', 'arduino-cli sketch new MySketch'],
          run: 'arduino-cli compile --fqbn arduino:avr:uno MySketch && arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:uno MySketch',
          layout: 'MySketch/\n  MySketch.ino',
          test: 'Unit-test logic on the PC; test hardware on the board', lint: 'clang-format', deploy: 'Upload over USB',
          docs: 'https://arduino.github.io/arduino-cli/latest/getting-started/' },
        { id: 'micropython', name: 'MicroPython', lang: 'Python', family: 'python', targets: ['embedded'], variants: ['mcu'],
          fit: { fast: 2, perf: 0, safe: 0 }, pop: 6,
          why: 'Python on ESP32 and Raspberry Pi Pico: edit and re-run in seconds without compiling.',
          tradeoff: 'Slower and more memory hungry than C; not for hard real-time.',
          setup: ['Flash MicroPython firmware from micropython.org/download', 'pip install mpremote'], run: 'mpremote run main.py',
          layout: 'main.py\nlib/',
          test: 'Test logic with CPython + pytest', lint: 'Ruff', deploy: 'mpremote cp main.py :main.py',
          docs: 'https://docs.micropython.org/en/latest/' },
        { id: 'embassy', name: 'Embedded Rust (Embassy)', lang: 'Rust', family: 'rust', targets: ['embedded'], variants: ['mcu'],
          fit: { fast: 0, perf: 2, safe: 2 }, pop: 4,
          why: 'Async embedded Rust: memory safety and modern tooling on STM32, nRF and RP2040.',
          tradeoff: 'Steep learning curve; fewer ready-made drivers than Arduino.',
          setup: ['rustup target add thumbv7em-none-eabihf', 'cargo install probe-rs-tools', 'Start from an example in github.com/embassy-rs/embassy/tree/main/examples'],
          run: 'cargo run --release   (flashes via probe-rs)',
          layout: 'src/\n  main.rs\n.cargo/config.toml\nmemory.x\nCargo.toml',
          test: 'defmt-test on target, cargo test for host logic', lint: 'Clippy', deploy: 'probe-rs flash',
          docs: 'https://embassy.dev/book/' },
        { id: 'gpiozero', name: 'Python + gpiozero', lang: 'Python', family: 'python', targets: ['embedded'], variants: ['linux'],
          fit: { fast: 2, perf: 0, safe: 0 }, pop: 7,
          why: 'Simple Raspberry Pi library for LEDs, buttons, sensors and motors; preinstalled on Raspberry Pi OS.',
          tradeoff: 'Not for precise timing; use a microcontroller for that.',
          setup: ['python -m venv --system-site-packages .venv', 'source .venv/bin/activate', 'pip install gpiozero'], run: 'python main.py',
          layout: 'main.py\nsensors/\nsystemd/my-app.service',
          test: 'gpiozero mock pin factory + pytest', lint: 'Ruff', deploy: 'Run as a systemd service on the Pi',
          docs: 'https://gpiozero.readthedocs.io/' },
        { id: 'go-arm', name: 'Go (cross-compiled)', lang: 'Go', family: 'go', targets: ['embedded'], variants: ['linux'],
          fit: { fast: 1, perf: 2, safe: 2 }, pop: 5,
          why: 'Build one static ARM binary on your laptop and copy it to the board: no runtime to install.',
          tradeoff: 'Fewer hardware libraries than Python on the Pi.',
          setup: ['mkdir my-device && cd my-device', 'go mod init example.com/my-device'], run: 'GOOS=linux GOARCH=arm64 go build && scp my-device pi@raspberrypi.local:',
          layout: 'main.go\ninternal/\ngo.mod',
          test: 'go test', lint: 'go vet, golangci-lint', deploy: 'Copy the binary; run as a systemd service',
          docs: 'https://go.dev/doc/install/source#environment' },
    ];

    // ----- Recommender -----------------------------------------------------
    const label = (list, value) => (list.find(o => o.value === value) || {}).label || value;

    // answers: { target, variant, known: [families], priority, description }
    // Returns { ranked: [{ stack, score, reasons }], question } — never an empty pick for a valid target.
    function recommend(answers) {
        const target = answers.target;
        if (!target) return { ranked: [] };
        const known = answers.known || [];
        const variantInfo = VARIANTS[target];
        const ranked = STACKS.filter(s => s.targets.includes(target)).map(stack => {
            let score = (stack.popBy && stack.popBy[target] !== undefined) ? stack.popBy[target] : stack.pop;
            // variants: array (single-target stack) or { target: [...] }; a target missing from the object is neutral
            const fits = Array.isArray(stack.variants) ? stack.variants : stack.variants[target];
            const reasons = [];
            if (answers.variant && variantInfo) {
                const vLabel = label(variantInfo.options, answers.variant);
                if (fits && fits.includes(answers.variant)) {
                    score += 40;
                    const isBest = stack.best && stack.best.includes(answers.variant);
                    if (isBest) score += 15;
                    reasons.push(isBest ? `Best known choice for "${vLabel}".` : `Fits "${vLabel}".`);
                } else if (fits && fits.length) {
                    score -= 25;
                }
            }
            if (known.includes(stack.family)) {
                score += 35;
                reasons.push(`Uses ${stack.lang}, which you already know.`);
            }
            if (answers.priority) {
                const f = stack.fit[answers.priority];
                score += f * 12;
                if (f === 2) reasons.push(`Strong on "${label(PRIORITIES, answers.priority)}".`);
                if (f === 0) reasons.push(`Weak on "${label(PRIORITIES, answers.priority)}".`);
            }
            if (!known.length && stack.fit.fast === 2) {
                score += 5;
                reasons.push('Beginner friendly.');
            }
            if (!reasons.some(r => !r.startsWith('Weak'))) reasons.unshift('Widely used for this kind of project.');
            return { stack, score, reasons };
        }).sort((a, b) => b.score - a.score || b.stack.pop - a.stack.pop);
        return { ranked };
    }

    // Prompt for an outside AI (or the on-device model). Plain text, capped in length.
    function buildPrompt(answers, result, maxLength = 4000) {
        const top = result.ranked[0];
        if (!top) return '';
        const variantInfo = VARIANTS[answers.target];
        const lines = [
            'I am planning a software project and want a concrete build plan.',
            '',
            `Project: ${answers.description ? answers.description.trim() : '(not described yet - ask me one question about it first)'}`,
            `Type: ${label(TARGETS, answers.target)}${answers.variant && variantInfo ? ` (${label(variantInfo.options, answers.variant)})` : ''}`,
            `Languages I know: ${(answers.known || []).map(v => label(FAMILIES, v)).join(', ') || 'none / beginner'}`,
            `Top priority: ${answers.priority ? label(PRIORITIES, answers.priority) : 'not specified'}`,
            `Suggested stack: ${top.stack.name} (${top.stack.lang})`,
            `Alternatives considered: ${result.ranked.slice(1, 3).map(r => `${r.stack.name} (${r.stack.lang})`).join(', ') || 'none'}`,
            '',
            'Please:',
            '1. Say whether the suggested stack fits this project; if not, recommend a better one and why.',
            '2. List the MVP features in the order I should build them.',
            '3. Show the project folder structure.',
            '4. Give the exact setup commands and the code for the first files.',
            '5. List the main risks and how to test the project.',
        ];
        const text = lines.join('\n');
        return text.length > maxLength ? text.slice(0, maxLength) : text;
    }

    const api = { TARGETS, VARIANTS, FAMILIES, PRIORITIES, STACKS, recommend, buildPrompt };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.WizardStacks = api;
})(typeof self !== 'undefined' ? self : this);
