// ============================================================
// 轻量 hash 路由：#/projects、#/project/:id 等
// ============================================================

const routes = [];

export function registerRoute(pattern, handler) {
  // 把 /project/:id 转成正则
  const parts = pattern.split("/").filter(Boolean);
  const regexParts = parts.map((p) =>
    p.startsWith(":") ? `(?<${p.slice(1)}>[^/]+)` : escapeRegExp(p)
  );
  const regex = new RegExp(`^/${regexParts.join("/")}?$`);
  routes.push({ regex, handler });
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function currentPath() {
  const hash = location.hash.replace(/^#/, "");
  return hash.split("?")[0] || "/";
}

export function currentParams() {
  const hash = location.hash.replace(/^#/, "");
  const q = hash.split("?")[1] || "";
  return Object.fromEntries(new URLSearchParams(q));
}

export function navigate(path) {
  if (currentPath() === path) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    location.hash = path;
  }
}

export function startRouter(renderNotFound) {
  function resolve() {
    const path = currentPath();
    for (const route of routes) {
      const m = path.match(route.regex);
      if (m) {
        route.handler(m.groups || {});
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
    }
    renderNotFound();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  window.addEventListener("hashchange", resolve);
  resolve();
}

// 导航高亮所需：返回当前路径首段
export function currentSection() {
  const path = currentPath();
  const seg = path.split("/")[1] || "";
  return seg;
}
