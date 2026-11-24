// ============================================================
// 开发者档案详情
// ============================================================

import { el, icon, avatarHTML, starsHTML, openModal, closeModal, toast } from "../ui.js";
import { getDeveloper, toggleWishDev, isWishDev, addInterest } from "../store.js";

export function renderDeveloperDetail(container, params) {
  const dev = getDeveloper(params.id);
  if (!dev) {
    container.append(notFound());
    return;
  }

  const saved = isWishDev(dev.id);
  const wishBtn = el("button", { class: "btn btn-outline", on: { click: () => {
    const now = toggleWishDev(dev.id);
    wishBtn.innerHTML = heartHTML(now);
    toast(now ? "已收藏该开发者" : "已取消收藏", now ? "success" : "default");
  } } }, heartHTML(saved));
  const contactBtn = el("button", { class: "btn btn-primary", on: { click: () => openContactModal(dev) } }, [icon("send"), "联系合作"]);

  const stats = el("div", { class: "dev-stats", style: "margin:18px 0" }, [
    stat(`${dev.years} 年`, "从业经验"),
    stat(`${dev.projectsDone}`, "完成项目"),
    stat(starsHTML(dev.rating), "综合评分"),
    stat(dev.devType, "身份类型")
  ]);

  const main = el("div", { class: "detail-main" }, [
    el("div", { class: "flex gap-2 wrap", style: "align-items:flex-start" }, [
      avatarHTML(dev.name, dev.accent || 0, "avatar-lg"),
      el("div", { style: "min-width:0;flex:1" }, [
        el("div", { class: "flex gap-1 wrap", style: "align-items:center" }, [
          el("h1", { style: "font-size:24px;margin:0" }, dev.name),
          dev.verified ? el("span", { class: "badge badge-primary" }, [icon("shield"), "平台认证"]) : null
        ]),
        el("div", { class: "text-2", style: "font-size:15px;margin:4px 0" }, dev.title),
        el("div", { class: "text-3", style: "font-size:13.5px" }, [icon("map"), " ", dev.location].join(""))
      ])
    ]),
    stats,
    el("div", { class: "detail-desc" }, el("p", {}, dev.bio)),
    el("div", { class: "form-section-title mt-2" }, "擅长技能"),
    el("div", { class: "card-tags mt-1" }, dev.skills.map((s) => el("span", { class: "chip" }, s))),
    el("div", { class: "form-section-title mt-2" }, "服务方式"),
    el("div", { class: "card-tags mt-1" }, dev.services.map((s) => el("span", { class: "chip", style: "background:var(--primary-soft);color:var(--primary-dark)" }, s))),
    casesSection(dev.cases || [])
  ]);

  const side = el("aside", { class: "side-card" }, [
    el("h3", { style: "margin:0;font-size:16px" }, "档案信息"),
    sideRow("身份类型", dev.devType),
    sideRow("从业年限", `${dev.years} 年`),
    sideRow("完成项目", `${dev.projectsDone} 个`),
    sideRow("综合评分", Number(dev.rating).toFixed(1)),
    sideRow("所在地区", dev.location),
    el("div", { class: "side-divider" }),
    sideRow("对接方式", dev.contact),
    el("div", { class: "flex gap-1 wrap" }, [wishBtn, contactBtn])
  ]);

  container.append(
    el("div", { class: "container", style: "padding: 10px 0 60px" }, [
      breadcrumb(dev.name),
      el("div", { class: "detail-layout" }, [main, side])
    ])
  );
}

function stat(n, l) {
  return el("div", { class: "ds" }, [el("div", { class: "n" }, n), el("div", { class: "l" }, l)]);
}

function sideRow(k, v) {
  return el("div", { class: "side-row" }, [el("span", { class: "k" }, k), el("span", { class: "v" }, v)]);
}

function casesSection(cases) {
  if (!cases.length) return el("div", { class: "text-3 mt-2" }, "暂未上传案例作品。");
  return el("section", { style: "margin-top:28px" }, [
    el("div", { class: "form-section-title" }, "案例作品"),
    el("div", { class: "grid grid-2 mt-1" }, cases.map((c) =>
      el("div", { class: "case-card" }, [
        el("div", { class: "case-top" }, [
          el("h4", {}, c.title),
          el("span", { class: "badge" }, `${c.industry} · ${c.year}`)
        ]),
        el("p", { class: "text-2", style: "font-size:14px;margin:0" }, c.summary),
        el("div", { class: "card-tags" }, (c.tags || []).map((t) => el("span", { class: "chip" }, t))),
        el("div", { class: "case-result" }, `交付结果：${c.result}`)
      ])
    ))
  ]);
}

function breadcrumb(name) {
  return el("nav", { class: "breadcrumb" }, [
    el("a", { href: "#/" }, "首页"),
    " / ",
    el("a", { href: "#/developers" }, "开发者目录"),
    " / ",
    el("span", { class: "text-2" }, name)
  ]);
}

function heartHTML(filled) {
  const color = filled ? "color:var(--danger)" : "";
  const fill = filled ? "currentColor" : "none";
  return `<span class="icon" style="${color}"><svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3 5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7 7-7Z"/></svg></span> ${filled ? "已收藏" : "收藏"}`;
}

function openContactModal(dev) {
  const nameInput = el("input", { type: "text", placeholder: "你的称呼 / 公司" });
  const contactInput = el("input", { type: "text", placeholder: "微信 / 邮箱" });
  const msgInput = el("textarea", { placeholder: "简单介绍合作背景、预算范围与期望时间…", style: "min-height:120px" });
  const err = el("div", { class: "form-error" });

  const form = el("div", { class: "flex", style: "flex-direction:column;gap:14px;margin-top:10px" }, [
    fieldWrap("称呼 / 公司", nameInput),
    fieldWrap("联系方式", contactInput),
    fieldWrap("合作留言", msgInput),
    err,
    el("button", { class: "btn btn-primary btn-block", on: { click: () => {
      const name = nameInput.value.trim();
      const contact = contactInput.value.trim();
      const message = msgInput.value.trim();
      if (!name || !contact || !message) {
        err.textContent = "请填写称呼、联系方式与合作留言。";
        return;
      }
      addInterest({ developerId: dev.id, developerName: dev.name, name, contact, message });
      closeModal();
      toast("合作意向已提交（演示：保存在本地浏览器）", "success");
    } } }, "提交合作意向")
  ]);
  openModal(form, { title: `联系 · ${dev.name}` });
}

function fieldWrap(label, input) {
  return el("div", { class: "field" }, [el("label", {}, label), input]);
}

function notFound() {
  return el("div", { class: "container" }, [
    el("div", { class: "empty" }, [
      el("div", { class: "empty-icon" }, icon("users")),
      el("h3", {}, "开发者不存在或已被移除"),
      el("a", { class: "btn btn-primary mt-1", href: "#/developers" }, "返回开发者目录")
    ])
  ]);
}
