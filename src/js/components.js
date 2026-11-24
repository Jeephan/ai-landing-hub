// ============================================================
// 复用卡片：需求卡片 / 开发者卡片
// ============================================================

import {
  el, escape, icon, fmtMoney, fmtDate, avatarHTML, starsHTML,
  statusBadge, toast
} from "./ui.js";
import {
  toggleWishProject, toggleWishDev, isWishProject, isWishDev
} from "./store.js";
import { TAXONOMY } from "./data.js";

function excerpt(text, len = 96) {
  const flat = String(text || "").replace(/\s+/g, " ").trim();
  return flat.length > len ? flat.slice(0, len) + "…" : flat;
}

const BUDGET_BAND_LABEL = Object.fromEntries(
  TAXONOMY.budgetBands.map((b) => [b.key, b.label])
);

export function renderProjectCard(project) {
  const saved = isWishProject(project.id);
  const wishBtn = el("button", {
    class: "btn btn-ghost btn-sm",
    title: saved ? "取消收藏" : "收藏",
    "aria-label": "收藏需求",
    on: {
      click: (e) => {
        e.preventDefault();
        const now = toggleWishProject(project.id);
        wishBtn.innerHTML = heartIcon(now);
        toast(now ? "已收藏该需求" : "已取消收藏", now ? "success" : "default");
      }
    }
  }, heartIcon(saved));

  const meta = el("div", { class: "project-meta" }, [
    el("span", { class: "meta-item" }, [icon("map"), project.location]),
    el("span", { class: "meta-item" }, [icon("clock"), project.duration]),
    el("span", { class: "meta-item" }, [icon("wallet"), fmtMoney(project.budgetMin, project.budgetMax)])
  ]);

  const tags = el("div", { class: "card-tags" },
    project.skills.slice(0, 4).map((s) => el("span", { class: "chip" }, s)));

  const card = el("article", { class: "card project-card anim-up" }, [
    el("div", { class: "card-top" }, [
      el("div", {}, [
        el("div", { class: "card-badges mb-1" }, [
          el("span", { class: "badge badge-primary" }, project.clientType),
          el("span", { class: "badge" }, project.industry),
          statusBadge(project.status)
        ]),
        el("h3", {}, el("a", { href: `#/project/${project.id}` }, project.title))
      ]),
      wishBtn
    ]),
    el("p", { class: "project-excerpt" }, excerpt(project.description)),
    tags,
    meta,
    el("div", { class: "card-foot" }, [
      el("span", {}, `发布于 ${fmtDate(project.createdAt)} · ${project.views} 人浏览`),
      el("a", { class: "btn btn-outline btn-sm", href: `#/project/${project.id}` }, "查看详情")
    ])
  ]);
  return card;
}

function heartIcon(filled) {
  const color = filled ? "color:var(--danger)" : "";
  const fill = filled ? "currentColor" : "none";
  return `<span class="icon" style="${color}">
    <svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3 5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7 7-7Z"/></svg>
  </span>`;
}

export function renderDevCard(dev) {
  const saved = isWishDev(dev.id);
  const wishBtn = el("button", {
    class: "btn btn-ghost btn-sm",
    title: saved ? "取消收藏" : "收藏",
    on: {
      click: (e) => {
        e.preventDefault();
        const now = toggleWishDev(dev.id);
        wishBtn.innerHTML = heartIcon(now);
        toast(now ? "已收藏该开发者" : "已取消收藏", now ? "success" : "default");
      }
    }
  }, heartIcon(saved));

  const nameDiv = el("div", { class: "name" }, dev.name);
  if (dev.verified) {
    const v = el("span", { class: "verified", title: "平台认证" });
    v.innerHTML = icon("shield");
    nameDiv.append(v);
  }
  const head = el("div", { class: "dev-head" }, [
    avatarHTML(dev.name, dev.accent || 0),
    el("div", { style: "min-width:0;flex:1" }, [
      nameDiv,
      el("div", { class: "title" }, dev.title)
    ]),
    wishBtn
  ]);

  const stats = el("div", { class: "dev-stats" }, [
    el("div", { class: "ds" }, [el("div", { class: "n" }, `${dev.years} 年`), el("div", { class: "l" }, "从业经验")]),
    el("div", { class: "ds" }, [el("div", { class: "n" }, `${dev.projectsDone}`), el("div", { class: "l" }, "完成项目")]),
    el("div", { class: "ds" }, [el("div", { class: "n" }, starsHTML(dev.rating)), el("div", { class: "l" }, "综合评分")])
  ]);

  const card = el("article", { class: "card dev-card anim-up" }, [
    head,
    el("p", { class: "project-excerpt" }, excerpt(dev.bio, 80)),
    el("div", { class: "card-tags" },
      dev.skills.slice(0, 4).map((s) => el("span", { class: "chip" }, s))),
    stats,
    el("div", { class: "card-foot" }, [
      el("span", { class: "text-3" }, dev.location),
      el("a", { class: "btn btn-outline btn-sm", href: `#/developer/${dev.id}` }, "查看档案")
    ])
  ]);
  return card;
}

export { BUDGET_BAND_LABEL };
