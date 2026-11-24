// ============================================================
// 首页
// ============================================================

import { el, icon, escape } from "../ui.js";
import { getProjects, getDevelopers } from "../store.js";
import { renderProjectCard, renderDevCard } from "../components.js";
import { TAXONOMY } from "../data.js";

export function renderHome(container) {
  const projects = getProjects();
  const devs = getDevelopers();
  const openProjects = projects.filter((p) => p.status === "open");
  const featuredProjects = [...openProjects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const featuredDevs = [...devs].sort((a, b) => b.rating - a.rating || b.projectsDone - a.projectsDone).slice(0, 4);
  const totalCases = devs.reduce((s, d) => s + d.projectsDone, 0);

  container.append(
    hero(projects.length, devs.length, TAXONOMY.industries.length, totalCases),
    categoriesStrip(),
    section({
      title: "最新招标需求",
      desc: "来自企业、个人与工厂的真实 AI 落地场景",
      action: { href: "#/projects", label: "查看全部需求" },
      grid: renderGrid(featuredProjects.map(renderProjectCard), 2)
    }),
    section({
      title: "推荐开发者与团队",
      desc: "个人开发者、独立工作室与专业企业团队，附真实案例",
      action: { href: "#/developers", label: "浏览全部开发者" },
      grid: renderGrid(featuredDevs.map(renderDevCard), 2)
    }),
    howItWorks(),
    principles(),
    ctaBand()
  );
}

function hero(pCount, dCount, industryCount, caseCount) {
  return el("section", { class: "hero" }, [
    el("div", { class: "container hero-grid" }, [
      el("div", {}, [
        el("div", { class: "hero-eyebrow anim-up" }, [
          el("span", { class: "dot" }),
          "免费开源 · 对接不抽佣 · 可自部署"
        ]),
        el("h1", { class: "anim-up-1" }, [
          "让每一个 AI 想法，",
          el("br"),
          "都找到",
          el("span", { class: "grad-text" }, "合适的落地开发者")
        ]),
        el("p", { class: "hero-sub anim-up-2" },
          "企业、个人与工厂在这里公开招标 AI 需求；个人开发者、工作室与专业团队展示档案与案例作品。需求与能力直接对接，平台保持中立，不做竞价排名。"),
        el("div", { class: "hero-cta anim-up-3" }, [
          el("a", { class: "btn btn-primary btn-lg", href: "#/post" }, [icon("bolt"), "发布 AI 需求"]),
          el("a", { class: "btn btn-outline btn-lg", href: "#/developers" }, "浏览开发者")
        ]),
        el("div", { class: "hero-stats" }, [
          stat(pCount, "在招需求"),
          stat(dCount, "入驻开发者"),
          stat(industryCount, "覆盖行业"),
          stat(caseCount, "累计交付案例")
        ])
      ]),
      heroPanel()
    ])
  ]);
}

function stat(num, label) {
  return el("div", { class: "stat" }, [
    el("div", { class: "num" }, [String(num), el("em", {}, "+")]),
    el("div", { class: "label" }, label)
  ]);
}

function heroPanel() {
  const recent = getProjects().slice(0, 3);
  const items = recent.map((p) =>
    el("a", { class: "mini-card", href: `#/project/${p.id}` }, [
      el("div", { class: "avatar", style: "background:var(--grad-soft);color:var(--primary-dark);width:40px;height:40px;border-radius:12px" }, icon("briefcase")),
      el("div", { style: "min-width:0" }, [
        el("div", { style: "font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" }, p.title),
        el("div", { class: "text-3", style: "font-size:12.5px" }, `${p.industry} · ${p.location} · ${p.duration}`)
      ])
    ])
  );
  return el("aside", { class: "hero-panel anim-up-2" }, [
    el("div", { class: "panel-head" }, [
      el("h3", {}, "需求动态"),
      el("span", { class: "badge badge-primary" }, "实时更新")
    ]),
    ...items
  ]);
}

function categoriesStrip() {
  const chips = TAXONOMY.skills.map((s) =>
    el("a", { class: "chip", href: `#/projects?skill=${encodeURIComponent(s)}` }, s)
  );
  return el("section", { class: "section", style: "padding-top:20px" }, [
    el("div", { class: "container" }, [
      el("div", { class: "flex wrap gap-2" }, chips)
    ])
  ]);
}

function section({ title, desc, action, grid }) {
  return el("section", { class: "section" }, [
    el("div", { class: "container" }, [
      el("div", { class: "section-head" }, [
        el("div", {}, [el("h2", {}, title), el("p", {}, desc)]),
        action ? el("a", { class: "btn btn-outline", href: action.href }, action.label) : null
      ]),
      grid
    ])
  ]);
}

function renderGrid(children, cols) {
  const grid = el("div", { class: `grid grid-${cols}` }, children);
  return grid;
}

function howItWorks() {
  const steps = [
    { num: "1", title: "发布需求", desc: "企业、个人或工厂描述 AI 应用场景、期望技能、预算区间与交付周期，公开发布招标。" },
    { num: "2", title: "开发者自荐", desc: "个人开发者、工作室与专业团队浏览需求，结合自身档案与案例提交投标意向。" },
    { num: "3", title: "洽谈交付", desc: "双方直接对接方案、报价与排期；平台不抽佣、不截留联系方式，交付质量由案例与评价沉淀。" }
  ];
  return el("section", { class: "section" }, [
    el("div", { class: "container" }, [
      el("div", { class: "section-head" }, [
        el("div", {}, [el("h2", {}, "三步完成对接"), el("p", {}, "流程简单透明，供需双方直接沟通")])
      ]),
      el("div", { class: "grid grid-3" }, steps.map((s) =>
        el("div", { class: "step-card" }, [
          el("div", { class: "step-num" }, s.num),
          el("h3", {}, s.title),
          el("p", {}, s.desc)
        ])
      ))
    ])
  ]);
}

function principles() {
  const items = [
    { icon: "wallet", title: "完全免费", desc: "发布需求、展示档案、查看联系方式与对接联系，平台基础功能一律不收费。" },
    { icon: "shield", title: "开源透明", desc: "代码以 MIT 协议开源，数据结构与产品路线图公开，任何人都可以复制并自部署。" },
    { icon: "users", title: "中立对接", desc: "不做竞价排名、不抽取交易佣金，供需双方基于案例与能力自由选择。" },
    { icon: "check", title: "案例说话", desc: "开发者档案以真实项目案例、交付结果与评价为主要参考，避免空泛自我介绍。" }
  ];
  return el("section", { class: "section", style: "padding-top:0" }, [
    el("div", { class: "container" }, [
      el("div", { class: "grid grid-3" }, items.map((it) =>
        el("div", { class: "principle-card" }, [
          el("div", { class: "pi" }, icon(it.icon)),
          el("h3", { style: "font-size:16px;margin-bottom:8px" }, it.title),
          el("p", { class: "text-2", style: "font-size:14px;margin:0" }, it.desc)
        ])
      ))
    ])
  ]);
}

function ctaBand() {
  return el("section", { class: "section" }, [
    el("div", { class: "container" }, [
      el("div", { class: "band" }, [
        el("div", {}, [
          el("h2", {}, "准备好把 AI 想法落地了吗？"),
          el("p", {}, "发布一条需求，让合适的开发者主动找到你；或者完善档案，承接与你能力匹配的项目。")
        ]),
        el("div", { class: "flex gap-1 wrap" }, [
          el("a", { class: "btn btn-white btn-lg", href: "#/post" }, "我要发布需求"),
          el("a", { class: "btn btn-lg", style: "background:rgba(255,255,255,0.16);color:#fff", href: "#/join" }, "开发者入驻")
        ])
      ])
    ])
  ]);
}
