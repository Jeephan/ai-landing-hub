// ============================================================
// 主题管理：深色 / 浅色，本地记忆，缺省跟随系统
// ============================================================

const KEY = "alh:theme:v1";

export function getTheme() {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "dark" || t === "light") return t;
  } catch (e) {
    /* 隐私模式下忽略读取异常 */
  }
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch (e) {
    /* 隐私模式下忽略写入异常 */
  }
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
