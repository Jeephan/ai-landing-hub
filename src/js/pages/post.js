// ============================================================
// 发布需求（招标）表单
// ============================================================

import { el, toast, checkboxChips, radioChips } from "../ui.js";
import { addProject } from "../store.js";
import { TAXONOMY } from "../data.js";
import { navigate } from "../router.js";

const BUDGET_RANGE = {
  lt1: { min: 0, max: 10000 },
  "1-5": { min: 10000, max: 50000 },
  "5-20": { min: 50000, max: 200000 },
  gt20: { min: 200000, max: 500000 }
};

export function renderPost(container) {
  const title = el("input", { type: "text", placeholder: "一句话描述你的 AI 需求，例如：门店智能客服机器人" });
  const typeRadio = radioChips("clientType", TAXONOMY.clientTypes);
  const industry = el("select", {}, [
    el("option", { value: "" }, "请选择行业"),
    ...TAXONOMY.industries.map((i) => el("option", { value: i }, i))
  ]);
  const location = el("input", { type: "text", placeholder: "城市 / 地区，远程可填「远程」" });
  const band = el("select", {}, TAXONOMY.budgetBands.map((b) =>
    el("option", { value: b.key }, b.label)
  ));
  const duration = el("input", { type: "text", placeholder: "例如：2 – 4 周" });
  const skillChecks = checkboxChips("skills", TAXONOMY.skills);
  const description = el("textarea", { placeholder: "详细描述业务场景、现有系统、期望效果、验收标准、是否需要驻场等…" });
  const ownerName = el("input", { type: "text", placeholder: "你的称呼 / 部门" });
  const contact = el("input", { type: "text", placeholder: "微信 / 邮箱，用于开发者联系你" });

  const err = el("div", { class: "form-error" });

  function validate() {
    if (!title.value.trim()) return "请填写需求标题。";
    if (!industry.value) return "请选择所属行业。";
    if (!location.value.trim()) return "请填写所在地区。";
    if (!duration.value.trim()) return "请填写预计周期。";
    if (!skillChecks.getSelected().length) return "请至少选择一个期望技能。";
    if (description.value.trim().length < 20) return "需求描述至少填写 20 个字，便于开发者判断匹配度。";
    if (!ownerName.value.trim()) return "请填写联系人称呼。";
    if (!contact.value.trim()) return "请填写联系方式。";
    return "";
  }

  function submit() {
    const msg = validate();
    err.textContent = msg;
    if (msg) { toast(msg, "error"); return; }
    const range = BUDGET_RANGE[band.value] || { min: 0, max: 0 };
    const project = addProject({
      title: title.value.trim(),
      clientType: typeRadio.getSelected(),
      industry: industry.value,
      location: location.value.trim(),
      band: band.value,
      budgetMin: range.min,
      budgetMax: range.max,
      duration: duration.value.trim(),
      skills: skillChecks.getSelected(),
      description: description.value.trim(),
      ownerName: ownerName.value.trim(),
      contact: contact.value.trim()
    });
    toast("需求已发布（演示数据保存在本地浏览器）", "success");
    navigate(`/project/${project.id}`);
  }

  container.append(
    el("div", { class: "form-shell" }, [
      el("div", { class: "section-head" }, [
        el("div", {}, [el("h2", {}, "发布 AI 需求"), el("p", {}, "填写场景与预算，公开招标给平台上的开发者与团队")])
      ]),
      el("div", { class: "form-card" }, [
        el("div", { class: "form-section-title" }, "基本信息"),
        el("div", { class: "form-grid" }, [
          field("需求标题", title, true),
          field("需求方类型", typeRadio.node, true),
          field("所属行业", industry, true),
          field("所在地区", location, true),
          field("预算区间", band, true),
          field("预计周期", duration, true)
        ]),
        el("div", { class: "form-section-title" }, "期望技能"),
        skillChecks.node,
        el("div", { class: "form-section-title" }, "需求描述"),
        fieldWrap(description, "业务场景、现有系统、期望效果与验收标准"),
        el("div", { class: "form-section-title" }, "联系方式"),
        el("div", { class: "form-grid" }, [
          field("联系人称呼", ownerName, true),
          field("联系方式", contact, true)
        ]),
        err,
        el("div", { class: "flex gap-1 wrap" }, [
          el("button", { class: "btn btn-primary btn-lg", on: { click: submit } }, "公开发布需求"),
          el("a", { class: "btn btn-outline btn-lg", href: "#/projects" }, "取消")
        ]),
        el("p", { class: "text-3", style: "font-size:13px;margin:0" },
          "演示版本不做账号体系：提交内容保存在当前浏览器本地；接入后端后将支持账号发布、投标留言与消息通知。")
      ])
    ])
  );
}

function field(label, input, required) {
  return el("div", { class: "field" }, [
    el("label", {}, required ? `${label} *` : label),
    input
  ]);
}

function fieldWrap(input, placeholder) {
  input.placeholder = placeholder;
  return el("div", { class: "field" }, [input]);
}
