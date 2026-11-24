// ============================================================
// 构建：把 src/ 组装到 dist/（零依赖，Node 内置模块）
// 输出：dist/index.html、dist/css、dist/js、_redirects、404.html
// ============================================================

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "css"), { recursive: true });
fs.mkdirSync(path.join(dist, "js", "pages"), { recursive: true });

// HTML
fs.copyFileSync(path.join(src, "index.html"), path.join(dist, "index.html"));
fs.copyFileSync(path.join(src, "index.html"), path.join(dist, "404.html"));

// CSS
fs.copyFileSync(path.join(src, "css", "styles.css"), path.join(dist, "css", "styles.css"));

// JS（递归拷贝，保留 pages 子目录）
function copyJsDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(toPath, { recursive: true });
      copyJsDir(fromPath, toPath);
    } else if (entry.name.endsWith(".js")) {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}
copyJsDir(path.join(src, "js"), path.join(dist, "js"));

// SPA 深链兜底（Cloudflare Pages / Netlify 等）
fs.writeFileSync(path.join(dist, "_redirects"), "/*    /index.html   200\n");

// 产物体积统计
function sizeDir(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    total += entry.isDirectory() ? sizeDir(p) : fs.statSync(p).size;
  }
  return total;
}

const kb = (sizeDir(dist) / 1024).toFixed(1);
console.log(`✅ 构建完成 → dist/（${kb} KB）`);
for (const f of ["index.html", "404.html", "_redirects", "css/styles.css"]) {
  console.log(`   · ${f}`);
}
