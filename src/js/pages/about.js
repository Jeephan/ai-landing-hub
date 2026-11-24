// ============================================================
// 关于平台与开源说明
// ============================================================

import { el, icon } from "../ui.js";

export function renderAbout(container) {
  container.append(
    el("div", { class: "container", style: "padding: 36px 0 60px" }, [
      el("div", { class: "section-head" }, [
        el("div", {}, [el("h2", {}, "关于智汇 AI 对接平台"), el("p", {}, "一个免费、开源、中立的 AI 落地供需对接空间")])
      ]),
      vision(),
      principles(),
      roadmap(),
      openSource()
    ])
  );
}

function vision() {
  return el("section", { class: "card mb-1" }, [
    el("h3", { style: "font-size:18px" }, "我们的愿景"),
    el("p", { class: "text-2" },
      "很多企业、工厂与个人有明确的 AI 想法，却不知道该找什么样的开发者；不少优秀的个人开发者、工作室与专业团队，也缺少稳定的项目来源。本平台希望补上这一段对接链路：需求方公开场景与预算，供给方展示档案与真实案例，双方基于能力与作品直接沟通。"),
    el("p", { class: "text-2", style: "margin:0" },
      "平台不做竞价排名、不抽取交易佣金、不截留联系方式；代码开源，任何人都可以审查、复制并按自己的方式部署。")
  ]);
}

function principles() {
  const items = [
    { icon: "wallet", title: "免费使用", desc: "发布需求、展示档案、浏览案例与对接联系，基础功能永久免费。" },
    { icon: "shield", title: "开源透明", desc: "MIT 协议开源，数据结构、产品决策与路线图公开，接受社区审查。" },
    { icon: "users", title: "中立对接", desc: "不偏袒任何一方，不按付费金额排序，匹配只基于技能、案例与评价。" },
    { icon: "check", title: "案例优先", desc: "鼓励用真实交付结果说话，档案中必须可追溯到具体项目与成果。" }
  ];
  return el("section", { class: "grid grid-3 mt-2" }, items.map((it) =>
    el("div", { class: "principle-card" }, [
      el("div", { class: "pi" }, icon(it.icon)),
      el("h3", { style: "font-size:16px;margin-bottom:8px" }, it.title),
      el("p", { class: "text-2", style: "font-size:14px;margin:0" }, it.desc)
    ])
  ));
}

function roadmap() {
  const phases = [
    { tag: "v0.1 当前版本", title: "前端演示版", items: ["需求与开发者目录展示", "搜索、筛选与排序", "本地发布需求 / 入驻档案", "收藏与投标意向（本地存储）"] },
    { tag: "近期规划", title: "后端与账号体系", items: ["API 与数据库接入（Supabase / Neon）", "注册登录与身份资料", "投标留言、私信与邮件通知", "需求状态流转管理"] },
    { tag: "中期规划", title: "信任与质量体系", items: ["交付后评价与复盘", "案例公开审核", "实名认证与资质展示", "技能标签与能力图谱"] },
    { tag: "远期规划", title: "协作生态", items: ["远程协作与合同模板", "项目里程碑跟踪", "多语言与地区分站", "开放 API 与第三方集成"] }
  ];
  return el("section", { class: "mt-2" }, [
    el("div", { class: "form-section-title mb-1" }, "产品路线图"),
    el("div", { class: "grid grid-2" }, phases.map((ph) =>
      el("div", { class: "card" }, [
        el("span", { class: "badge badge-primary" }, ph.tag),
        el("h3", { style: "font-size:16px;margin:10px 0" }, ph.title),
        el("ul", { style: "margin:0;padding-left:18px;color:var(--text-2);font-size:14px;display:flex;flex-direction:column;gap:6px" },
          ph.items.map((i) => el("li", {}, i)))
      ])
    ))
  ]);
}

function openSource() {
  return el("section", { class: "card mt-2" }, [
    el("h3", { style: "font-size:18px" }, "开源与贡献"),
    el("p", { class: "text-2" },
      "项目以 MIT 许可证发布，允许自由使用、修改与自部署。欢迎通过 Issue 反馈需求场景与体验问题，通过 Pull Request 提交功能改进、案例数据与文案翻译。"),
    el("div", { class: "flex gap-1 wrap mt-1" }, [
      el("a", { class: "btn btn-outline", href: "#/post" }, "发布第一条需求"),
      el("a", { class: "btn btn-outline", href: "#/join" }, "成为入驻开发者")
    ])
  ]);
}
