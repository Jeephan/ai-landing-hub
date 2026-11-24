// ============================================================
// 开发者入驻 / 档案提交
// ============================================================

import { el, toast, checkboxChips, radioChips } from "../ui.js";
import { addDeveloper } from "../store.js";
import { TAXONOMY } from "../data.js";
import { navigate } from "../router.js";

const SERVICE_OPTIONS = [
  "需求拆解与原型", "后端 API 与系统集成", "前端 / 可视化",
  "模型训练与微调", "工作流自动化", "上线后迭代维护"
];

export function renderJoin(container) {
  const name = el("input", { type: "text", placeholder: "姓名或工作室 / 团队名称" });
  const typeRadio = radioChips("devType", TAXONOMY.devTypes);
  const title = el("input", { type: "text", placeholder: "例如：全栈大模型应用工程师" });
  const location = el("input", { type: "text", placeholder: "城市 / 地区，可远程请注明" });
  const years = el("input", { type: "number", min: 0, placeholder: "从业年限" });
  const skillChecks = checkboxChips("skills", TAXONOMY.skills);
  const serviceChecks = checkboxChips("services", SERVICE_OPTIONS);
  const bio = el("textarea", { placeholder: "介绍你的背景、擅长场景、合作风格与交付习惯…" });
  const contact = el("input", { type: "text", placeholder: "微信 / 邮箱 / 作品集链接" });
  const err = el("div", { class: "form-error" });

  const caseBlocks = [];
  const caseList = el("div", { class: "flex", style: "flex-direction:column;gap:14px" });

  function addCaseBlock(initial = {}) {
    const cTitle = el("input", { type: "text", placeholder: "案例标题", value: initial.title || "" });
    const cIndustry = el("select", {}, [
      el("option", { value: "" }, "所属行业"),
      ...TAXONOMY.industries.map((i) => el("option", { value: i }, i))
    ]);
    if (initial.industry) cIndustry.value = initial.industry;
    const cYear = el("input", { type: "number", min: 2000, max: 2026, placeholder: "年份", value: initial.year || "" });
    const cSummary = el("textarea", { placeholder: "项目背景、你负责的部分与做法…", style: "min-height:80px" });
    cSummary.value = initial.summary || "";
    const cTags = el("input", { type: "text", placeholder: "标签，用逗号分隔，例如：RAG, Agent, CRM 对接", value: (initial.tags || []).join(", ") });
    const removeBtn = el("button", { class: "btn btn-danger-soft btn-sm", on: { click: () => {
      block.remove();
      const idx = caseBlocks.indexOf(ref);
      if (idx >= 0) caseBlocks.splice(idx, 1);
    } } }, "移除案例");

    const block = el("div", { class: "case-block" }, [
      el("div", { class: "flex-between" }, [el("span", { class: "text-2", style: "font-weight:600" }, "案例作品"), removeBtn]),
      el("div", { class: "form-grid" }, [
        field("案例标题", cTitle),
        field("所属行业", cIndustry),
        field("年份", cYear),
        field("标签（逗号分隔）", cTags)
      ]),
      fieldWrap(cSummary)
    ]);
    const ref = { cTitle, cIndustry, cYear, cSummary, cTags };
    caseBlocks.push(ref);
    caseList.append(block);
  }

  addCaseBlock();

  function collectCases() {
    return caseBlocks.map((c) => ({
      title: c.cTitle.value.trim(),
      industry: c.cIndustry.value,
      year: Number(c.cYear.value) || new Date().getFullYear(),
      summary: c.cSummary.value.trim(),
      tags: c.cTags.value.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      result: "详见合作沟通"
    })).filter((c) => c.title && c.summary);
  }

  function validate() {
    if (!name.value.trim()) return "请填写名称 / 机构名。";
    if (!title.value.trim()) return "请填写一句话头衔。";
    if (!location.value.trim()) return "请填写所在地区。";
    if (!skillChecks.getSelected().length) return "请至少选择一个擅长技能。";
    if (bio.value.trim().length < 20) return "个人简介至少填写 20 个字。";
    if (!contact.value.trim()) return "请填写联系方式。";
    return "";
  }

  function submit() {
    const msg = validate();
    err.textContent = msg;
    if (msg) { toast(msg, "error"); return; }
    const dev = addDeveloper({
      name: name.value.trim(),
      devType: typeRadio.getSelected(),
      title: title.value.trim(),
      location: location.value.trim(),
      years: Number(years.value) || 0,
      skills: skillChecks.getSelected(),
      services: serviceChecks.getSelected(),
      bio: bio.value.trim(),
      contact: contact.value.trim(),
      cases: collectCases(),
      accent: Math.floor(Math.random() * 8)
    });
    toast("档案已提交（演示：保存在本地浏览器）", "success");
    navigate(`/developer/${dev.id}`);
  }

  container.append(
    el("div", { class: "form-shell" }, [
      el("div", { class: "section-head" }, [
        el("div", {}, [el("h2", {}, "开发者入驻"), el("p", {}, "完善档案与案例作品，承接匹配的 AI 落地项目")])
      ]),
      el("div", { class: "form-card" }, [
        el("div", { class: "form-section-title" }, "身份信息"),
        el("div", { class: "form-grid" }, [
          field("名称 / 机构名 *", name),
          field("身份类型 *", typeRadio.node),
          field("一句话头衔 *", title),
          field("所在地区 *", location),
          field("从业年限", years),
          field("联系方式 *", contact)
        ]),
        el("div", { class: "form-section-title" }, "擅长技能"),
        skillChecks.node,
        el("div", { class: "form-section-title" }, "服务方式"),
        serviceChecks.node,
        el("div", { class: "form-section-title" }, "个人简介"),
        fieldWrap(bio, "背景、擅长场景、合作风格与交付习惯"),
        el("div", { class: "form-section-title" }, "案例作品"),
        caseList,
        el("div", {}, el("button", { class: "btn btn-outline btn-sm", on: { click: () => addCaseBlock() } }, "+ 添加案例")),
        err,
        el("div", { class: "flex gap-1 wrap" }, [
          el("button", { class: "btn btn-primary btn-lg", on: { click: submit } }, "提交入驻档案"),
          el("a", { class: "btn btn-outline btn-lg", href: "#/developers" }, "取消")
        ]),
        el("p", { class: "text-3", style: "font-size:13px;margin:0" },
          "演示版本不做实名认证与审核流程；接入后端后将增加资质校验、评价体系与案例公开审核。")
      ])
    ])
  );
}

function field(label, input) {
  return el("div", { class: "field" }, [el("label", {}, label), input]);
}

function fieldWrap(input, placeholder) {
  if (placeholder) input.placeholder = placeholder;
  return el("div", { class: "field" }, [input]);
}
