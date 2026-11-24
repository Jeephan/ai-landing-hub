// ============================================================
// 需求详情
// ============================================================

import { el, icon, fmtMoney, fmtDate, statusBadge, openModal, closeModal, toast, escape } from "../ui.js";
import { getProject, getDevelopers, toggleWishProject, isWishProject, addInterest } from "../store.js";
import { renderDevCard } from "../components.js";

export function renderProjectDetail(container, params) {
  const project = getProject(params.id);
  if (!project) {
    container.append(notFound());
    return;
  }

  const saved = isWishProject(project.id);
  const wishBtn = el("button", { class: "btn btn-outline", on: { click: () => {
    const now = toggleWishProject(project.id);
    wishBtn.innerHTML = heartHTML(now);
    toast(now ? "已收藏该需求" : "已取消收藏", now ? "success" : "default");
  } } }, heartHTML(saved));

  const bidBtn = el("button", { class: "btn btn-primary", on: { click: () => openBidModal(project) } }, [icon("send"), "提交投标意向"]);

  const main = el("div", { class: "detail-main" }, [
    el("div", { class: "card-badges mb-1" }, [
      el("span", { class: "badge badge-primary" }, project.clientType),
      el("span", { class: "badge" }, project.industry),
      statusBadge(project.status)
    ]),
    el("h1", {}, project.title),
    el("div", { class: "project-meta mb-1" }, [
      el("span", { class: "meta-item" }, [icon("map"), project.location]),
      el("span", { class: "meta-item" }, [icon("clock"), project.duration]),
      el("span", { class: "meta-item" }, [icon("wallet"), fmtMoney(project.budgetMin, project.budgetMax)])
    ]),
    el("div", { class: "detail-desc mt-2" }, project.description.split(/\n+/).map((p) => el("p", {}, p))),
    el("div", { class: "card-tags mt-2" }, project.skills.map((s) => el("span", { class: "chip" }, s)))
  ]);

  const side = el("aside", { class: "side-card" }, [
    el("h3", { style: "margin:0;font-size:16px" }, "需求信息"),
    sideRow("预算区间", fmtMoney(project.budgetMin, project.budgetMax)),
    sideRow("预计周期", project.duration),
    sideRow("所在地区", project.location),
    sideRow("报名截止", project.deadline || "协商确定"),
    sideRow("需求方", project.ownerName),
    el("div", { class: "side-divider" }),
    sideRow("联系方式", project.contact),
    el("div", { class: "flex gap-1 wrap" }, [wishBtn, bidBtn])
  ]);

  const related = relatedDevelopers(project);

  container.append(
    el("div", { class: "container", style: "padding: 10px 0 60px" }, [
      breadcrumb(project.title),
      el("div", { class: "detail-layout" }, [main, side]),
      related
    ])
  );
}

function sideRow(k, v) {
  return el("div", { class: "side-row" }, [el("span", { class: "k" }, k), el("span", { class: "v" }, v)]);
}

function breadcrumb(title) {
  return el("nav", { class: "breadcrumb" }, [
    el("a", { href: "#/" }, "首页"),
    " / ",
    el("a", { href: "#/projects" }, "需求大厅"),
    " / ",
    el("span", { class: "text-2" }, title)
  ]);
}

function heartHTML(filled) {
  const color = filled ? "color:var(--danger)" : "";
  const fill = filled ? "currentColor" : "none";
  return `<span class="icon" style="${color}"><svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3 5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 7.5 3 5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7 7-7Z"/></svg></span> ${filled ? "已收藏" : "收藏"}`;
}

function openBidModal(project) {
  const nameInput = el("input", { type: "text", placeholder: "你的称呼 / 团队名称" });
  const contactInput = el("input", { type: "text", placeholder: "微信 / 邮箱（用于需求方联系你）" });
  const msgInput = el("textarea", { placeholder: "简要说明你的相关经验、可投入时间与报价思路…", style: "min-height:120px" });
  const err = el("div", { class: "form-error" });

  const form = el("div", { class: "flex", style: "flex-direction:column;gap:14px;margin-top:10px" }, [
    fieldWrap("称呼 / 团队", nameInput),
    fieldWrap("联系方式", contactInput),
    fieldWrap("自荐留言", msgInput),
    err,
    el("button", { class: "btn btn-primary btn-block", on: { click: () => {
      const name = nameInput.value.trim();
      const contact = contactInput.value.trim();
      const message = msgInput.value.trim();
      if (!name || !contact || !message) {
        err.textContent = "请填写称呼、联系方式与自荐留言。";
        return;
      }
      addInterest({ projectId: project.id, projectTitle: project.title, name, contact, message });
      closeModal();
      toast("投标意向已提交（演示：保存在本地浏览器）", "success");
    } } }, "提交意向")
  ]);

  openModal(form, { title: `投标意向 · ${project.title.slice(0, 18)}${project.title.length > 18 ? "…" : ""}` });
}

function fieldWrap(label, input) {
  return el("div", { class: "field" }, [el("label", {}, label), input]);
}

function relatedDevelopers(project) {
  const matched = getDevelopers()
    .filter((d) => d.skills.some((s) => project.skills.includes(s)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  if (!matched.length) return null;
  return el("section", { style: "margin-top:36px" }, [
    el("div", { class: "section-head" }, [
      el("div", {}, [el("h2", { style: "font-size:21px" }, "相关开发者"), el("p", {}, "技能方向与本需求匹配的团队与个人")])
    ]),
    el("div", { class: "grid grid-3" }, matched.map(renderDevCard))
  ]);
}

function notFound() {
  return el("div", { class: "container" }, [
    el("div", { class: "empty" }, [
      el("div", { class: "empty-icon" }, icon("search")),
      el("h3", {}, "需求不存在或已被移除"),
      el("a", { class: "btn btn-primary mt-1", href: "#/projects" }, "返回需求大厅")
    ])
  ]);
}
