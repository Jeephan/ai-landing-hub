// ============================================================
// 通用 UI 辅助：DOM 构造、转义、图标、格式化、Toast、模态
// ============================================================

import { AVATAR_GRADIENTS } from "./data.js";

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "on" && typeof v === "object" && v !== null) {
      for (const [ev, fn] of Object.entries(v)) {
        if (typeof fn === "function") node.addEventListener(ev, fn);
      }
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "dataset") {
      Object.assign(node.dataset, v);
    } else {
      node.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    if (child.nodeType) {
      node.append(child);
    } else if (typeof child === "string" && child.trim().startsWith("<")) {
      const tpl = document.createElement("template");
      tpl.innerHTML = child.trim();
      while (tpl.content.firstChild) node.append(tpl.content.firstChild);
    } else {
      node.append(document.createTextNode(child));
    }
  }
  return node;
}

export function escape(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- 图标（stroke 风格 SVG） ----------
const ICONS = {
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12h.01"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"/><circle cx="7" cy="7" r="1.2"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3 5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7 7-7Z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
};

export function icon(name, cls = "") {
  const svg = ICONS[name] || ICONS.tag;
  return `<span class="icon ${cls}" aria-hidden="true">${svg}</span>`;
}

// ---------- 格式化 ----------
export function fmtMoney(min, max) {
  const w = (n) => (n >= 10000 ? `${(n / 10000).toFixed(n % 10000 ? 1 : 0)} 万` : `${n} 元`);
  if (!min && !max) return "面议";
  if (min && max) return `${w(min)} – ${w(max)}`;
  return w(min || max);
}

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function initials(name) {
  return String(name || "?").trim().slice(0, 1).toUpperCase();
}

export function avatarHTML(name, accent = 0, size = "") {
  const bg = AVATAR_GRADIENTS[accent % AVATAR_GRADIENTS.length];
  return `<div class="avatar ${size}" style="background:${bg}">${escape(initials(name))}</div>`;
}

export function starsHTML(rating) {
  return `<span class="rating">${icon("star")} ${Number(rating).toFixed(1)}</span>`;
}

const STATUS_MAP = {
  open: { label: "招标中", cls: "badge-success" },
  matched: { label: "已匹配", cls: "badge-primary" },
  closed: { label: "已截止", cls: "badge" }
};
export function statusBadge(status) {
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

// ---------- Toast ----------
export function toast(message, type = "default") {
  const root = document.getElementById("toast-root");
  if (!root) return;
  const node = el("div", { class: `toast toast-${type}` }, message);
  root.append(node);
  setTimeout(() => {
    node.style.opacity = "0";
    node.style.transition = "opacity 0.25s";
    setTimeout(() => node.remove(), 260);
  }, 2600);
}

// ---------- 模态 ----------
export function openModal(contentNode, opts = {}) {
  const root = document.getElementById("modal-root");
  root.innerHTML = "";
  const mask = el("div", { class: "modal-mask", on: { click: (e) => { if (e.target === mask && !opts.locked) closeModal(); } } });
  const modal = el("div", { class: "modal", role: "dialog", "aria-modal": "true" });
  if (opts.title) {
    const head = el("div", { class: "modal-head" });
    head.append(el("h3", {}, opts.title));
    if (!opts.locked) {
      const closeBtn = el("button", { class: "modal-close", "aria-label": "关闭", on: { click: closeModal } }, "×");
      head.append(closeBtn);
    }
    modal.append(head);
  }
  modal.append(contentNode);
  mask.append(modal);
  root.append(mask);
  return { mask, modal };
}

export function closeModal() {
  const root = document.getElementById("modal-root");
  root.innerHTML = "";
}

// ---------- 选项 chips（复选 / 单选） ----------
export function checkboxChips(name, options) {
  const group = el("div", { class: "option-checks", dataset: { name } });
  options.forEach((opt) => {
    const id = `${name}-${opt}`;
    const input = el("input", { type: "checkbox", id, value: opt, name });
    const label = el("label", { for: id }, [input, el("span", { class: "opt" }, opt)]);
    group.append(label);
  });
  return {
    node: group,
    getSelected: () => [...group.querySelectorAll("input:checked")].map((i) => i.value)
  };
}

export function radioChips(name, options) {
  const group = el("div", { class: "option-checks", dataset: { name } });
  options.forEach((opt, idx) => {
    const id = `${name}-${opt}`;
    const input = el("input", { type: "radio", id, value: opt, name });
    if (idx === 0) input.checked = true;
    const label = el("label", { for: id }, [input, el("span", { class: "opt" }, opt)]);
    group.append(label);
  });
  return {
    node: group,
    getSelected: () => (group.querySelector("input:checked") || {}).value || ""
  };
}

// ---------- 其他 ----------
export function debounce(fn, wait = 180) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function plural(n, word) {
  return `${n} ${word}`;
}
