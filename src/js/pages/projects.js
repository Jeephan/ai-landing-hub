// ============================================================
// 需求大厅：搜索 + 多维筛选 + 排序
// ============================================================

import { el, icon, debounce, escape } from "../ui.js";
import { getProjects } from "../store.js";
import { renderProjectCard } from "../components.js";
import { TAXONOMY } from "../data.js";
import { currentParams } from "../router.js";

const filters = { q: "", clientType: "", industry: "", band: "", skill: "", status: "", sort: "latest" };

export function renderProjects(container) {
  const params = currentParams();
  if (params.skill) filters.skill = params.skill;

  const toolbar = buildToolbar(refresh);
  const listWrap = el("div", { id: "project-list" });
  const resultBar = el("div", { class: "result-bar" });

  function refresh() {
    const list = applyFilters(getProjects());
    resultBar.innerHTML = "";
    resultBar.append(
      el("span", {}, `共 ${list.length} 条需求`),
      el("span", { class: "text-3" }, "演示数据保存在本地浏览器")
    );
    listWrap.innerHTML = "";
    if (!list.length) {
      listWrap.append(emptyState());
    } else {
      const grid = el("div", { class: "grid grid-3" }, list.map(renderProjectCard));
      listWrap.append(grid);
    }
  }

  container.append(
    el("div", { class: "container", style: "padding: 30px 0 60px" }, [
      el("div", { class: "section-head", style: "margin-bottom:20px" }, [
        el("div", {}, [el("h2", {}, "需求大厅"), el("p", {}, "公开招标的 AI 落地项目，按场景与预算筛选")])
      ]),
      toolbar,
      resultBar,
      listWrap
    ])
  );
  refresh();
}

function buildToolbar(refresh) {
  const select = (label, key, options, allLabel = "全部") => {
    const field = el("div", { class: "field" }, [
      el("label", {}, label),
      el("select", { on: { change: (e) => { filters[key] = e.target.value; refresh(); } } }, [
        el("option", { value: "" }, allLabel),
        ...options.map((o) => el("option", { value: o }, o))
      ])
    ]);
    const sel = field.querySelector("select");
    sel.value = filters[key];
    return field;
  };

  const searchField = el("div", { class: "field" }, [
    el("label", {}, "搜索关键词"),
    el("input", {
      type: "search", placeholder: "标题、场景、地区、技能…",
      on: { input: debounce((e) => { filters.q = e.target.value.trim(); refresh(); }, 160) }
    })
  ]);

  const bandField = select("预算区间", "band", TAXONOMY.budgetBands.map((b) => b.label));
  bandField.querySelector("select").innerHTML =
    `<option value="">全部</option>` +
    TAXONOMY.budgetBands.map((b) => `<option value="${b.key}">${b.label}</option>`).join("");
  bandField.querySelector("select").value = filters.band;
  bandField.querySelector("select").addEventListener("change", (e) => { filters.band = e.target.value; refresh(); });

  const sortField = el("div", { class: "field" }, [
    el("label", {}, "排序"),
    el("select", { on: { change: (e) => { filters.sort = e.target.value; refresh(); } } }, [
      el("option", { value: "latest" }, "最新发布"),
      el("option", { value: "budget-desc" }, "预算从高到低"),
      el("option", { value: "budget-asc" }, "预算从低到高"),
      el("option", { value: "views" }, "最多浏览")
    ])
  ]);

  return el("div", { class: "toolbar" }, [
    searchField,
    select("需求方类型", "clientType", TAXONOMY.clientTypes),
    select("所属行业", "industry", TAXONOMY.industries),
    bandField,
    select("期望技能", "skill", TAXONOMY.skills),
    select("状态", "status", TAXONOMY.statuses.map((s) => s.label)),
    sortField
  ]);
}

function applyFilters(list) {
  let out = list.filter((p) => {
    if (filters.clientType && p.clientType !== filters.clientType) return false;
    if (filters.industry && p.industry !== filters.industry) return false;
    if (filters.skill && !p.skills.includes(filters.skill)) return false;
    if (filters.status) {
      const label = TAXONOMY.statuses.find((s) => s.key === filters.status)?.label;
      const statusLabel = TAXONOMY.statuses.find((s) => s.key === p.status)?.label;
      if (label && statusLabel !== label) return false;
    }
    if (filters.band) {
      const band = TAXONOMY.budgetBands.find((b) => b.key === filters.band);
      if (band && !(p.budgetMax >= band.min && p.budgetMin <= band.max)) return false;
    }
    if (filters.q) {
      const hay = `${p.title} ${p.description} ${p.location} ${p.skills.join(" ")} ${p.industry}`.toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "budget-desc":
      out.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0));
      break;
    case "budget-asc":
      out.sort((a, b) => (a.budgetMin || 0) - (b.budgetMin || 0));
      break;
    case "views":
      out.sort((a, b) => b.views - a.views);
      break;
    default:
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return out;
}

function emptyState() {
  return el("div", { class: "empty" }, [
    el("div", { class: "empty-icon" }, icon("search")),
    el("h3", {}, "没有匹配的需求"),
    el("p", {}, "试试调整筛选条件，或者发布第一条需求。"),
    el("a", { class: "btn btn-primary mt-1", href: "#/post" }, "发布 AI 需求")
  ]);
}
