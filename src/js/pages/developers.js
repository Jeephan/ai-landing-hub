// ============================================================
// 开发者目录：搜索 + 类型/技能/地区筛选 + 排序
// ============================================================

import { el, icon, debounce } from "../ui.js";
import { getDevelopers } from "../store.js";
import { renderDevCard } from "../components.js";
import { TAXONOMY } from "../data.js";

const filters = { q: "", devType: "", skill: "", location: "", sort: "rating" };

export function renderDevelopers(container) {
  const locations = [...new Set(getDevelopers().map((d) => d.location))];

  const searchInput = el("input", {
    type: "search", placeholder: "姓名、头衔、地区、技能…",
    on: { input: debounce((e) => { filters.q = e.target.value.trim(); refresh(); }, 160) }
  });
  const searchField = el("div", { class: "field" }, [
    el("label", {}, "搜索开发者"),
    searchInput
  ]);

  const typeField = selectField("身份类型", "devType", TAXONOMY.devTypes);
  const skillField = selectField("技能方向", "skill", TAXONOMY.skills);
  const locField = selectField("所在地区", "location", locations);
  const sortField = el("div", { class: "field" }, [
    el("label", {}, "排序"),
    el("select", { on: { change: (e) => { filters.sort = e.target.value; refresh(); } } }, [
      el("option", { value: "rating" }, "综合评分最高"),
      el("option", { value: "years" }, "从业年限最长"),
      el("option", { value: "projects" }, "完成项目最多")
    ])
  ]);

  const resultBar = el("div", { class: "result-bar" });
  const listWrap = el("div", { id: "dev-list" });

  function refresh() {
    const list = applyFilters(getDevelopers());
    resultBar.innerHTML = "";
    resultBar.append(
      el("span", {}, `共 ${list.length} 位开发者 / 团队`),
      el("span", { class: "text-3" }, "演示数据保存在本地浏览器")
    );
    listWrap.innerHTML = "";
    if (!list.length) {
      listWrap.append(emptyState());
    } else {
      listWrap.append(el("div", { class: "grid grid-3" }, list.map(renderDevCard)));
    }
  }

  container.append(
    el("div", { class: "container", style: "padding: 30px 0 60px" }, [
      el("div", { class: "section-head", style: "margin-bottom:20px" }, [
        el("div", {}, [el("h2", {}, "开发者目录"), el("p", {}, "个人开发者、独立工作室与专业企业团队，附案例作品")])
      ]),
      el("div", { class: "toolbar" }, [searchField, typeField, skillField, locField, sortField]),
      resultBar,
      listWrap
    ])
  );
  refresh();

  function selectField(label, key, options) {
    const field = el("div", { class: "field" }, [
      el("label", {}, label),
      el("select", { on: { change: (e) => { filters[key] = e.target.value; refresh(); } } }, [
        el("option", { value: "" }, "全部"),
        ...options.map((o) => el("option", { value: o }, o))
      ])
    ]);
    return field;
  }
}

function applyFilters(list) {
  let out = list.filter((d) => {
    if (filters.devType && d.devType !== filters.devType) return false;
    if (filters.skill && !d.skills.includes(filters.skill)) return false;
    if (filters.location && d.location !== filters.location) return false;
    if (filters.q) {
      const hay = `${d.name} ${d.title} ${d.bio} ${d.location} ${d.skills.join(" ")}`.toLowerCase();
      if (!hay.includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });
  switch (filters.sort) {
    case "years": out.sort((a, b) => b.years - a.years); break;
    case "projects": out.sort((a, b) => b.projectsDone - a.projectsDone); break;
    default: out.sort((a, b) => b.rating - a.rating);
  }
  return out;
}

function emptyState() {
  return el("div", { class: "empty" }, [
    el("div", { class: "empty-icon" }, icon("users")),
    el("h3", {}, "没有匹配的开发者"),
    el("p", {}, "试试调整筛选条件，或者成为第一位入驻的开发者。"),
    el("a", { class: "btn btn-primary mt-1", href: "#/join" }, "开发者入驻")
  ]);
}
