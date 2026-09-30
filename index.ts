import { join, normalize, sep } from "path";

const PORT = parseInt(process.env.PORT || "8080", 10);
const PUBLIC_DIR = join(import.meta.dir, "docs");

console.log(`Serving ${PUBLIC_DIR} at http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const pathname = decodeURIComponent(new URL(req.url).pathname);
    const target = normalize(join(PUBLIC_DIR, pathname));
    if (target !== PUBLIC_DIR && !target.startsWith(PUBLIC_DIR + sep)) {
      return new Response("403 Forbidden", { status: 403 });
    }

    for (const path of [target, join(target, "index.html")]) {
      const file = Bun.file(path);
      if (await file.exists()) {
        // text/plain so sample sources render in the browser instead of downloading
        const type = file.type.startsWith("application/octet-stream") ? "text/plain;charset=utf-8" : file.type;
        return new Response(file, { headers: { "Content-Type": type, "Cache-Control": "no-cache" } });
      }
    }
    // SPA fallback for clean URLs only; missing assets are real 404s
    if (!pathname.includes(".")) return new Response(Bun.file(join(PUBLIC_DIR, "index.html")));
    return new Response("404 Not Found", { status: 404 });
  },
});
