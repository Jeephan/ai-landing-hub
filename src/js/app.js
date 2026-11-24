// ============================================================
// 应用入口：导航 / 页脚 / 路由注册
// ============================================================

import { el, icon } from "./ui.js";
import { registerRoute, startRouter, currentSection } from "./router.js";
import { renderHome } from "./pages/home.js";
import { renderProjects } from "./pages/projects.js";
import { renderProjectDetail } from "./pages/project-detail.js";
import { renderDevelopers } from "./pages/developers.js";
import { renderDeveloperDetail } from "./pages/developer-detail.js";
import { renderPost } from "./pages/post.js";
import { renderJoin } from "./pages/join.js";
import { renderAbout } from "./pages/about.js";

const app = document.getElementById("app");

// ---------- 导航 ----------
const NAV_LINKS = [
  { href: "#/", label: "首页", section: "" },
  { href: "#/projects", label: "需求大厅", section: "projects" },
  { href: "#/developers", label: "开发者目录", section: "developers" },
  { href: "#/about", label: "关于开源", section: "about" }
];

function buildNav() {
  const links = NAV_LINKS.map((l) =>
    el("a", { href: l.href, dataset: { section: l.section } }, l.label)
  );
  const drawer = el("div", { class: "nav-links", id: "nav-links" }, links);

  const toggle = el("button", {
    class: "nav-toggle", "aria-label": "打开菜单",
    on: { click: () => drawer.classList.toggle("open") }
  }, el("span"));

  const nav = el("nav", { class: "nav" }, [
    el("div", { class: "container nav-inner" }, [
      el("a", { class: "brand", href: "#/" }, [
        el("span", { class: "brand-mark" }, icon("bolt")),
        el("span", {}, ["智汇 AI", el("small", {}, "AI 落地对接平台")])
      ]),
      drawer,
      el("div", { class: "nav-actions" }, [
        el("a", { class: "btn btn-outline btn-sm", href: "#/join" }, "开发者入驻"),
        el("a", { class: "btn btn-primary btn-sm", href: "#/post" }, "发布需求"),
        toggle
      ])
    ])
  ]);

  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) drawer.classList.remove("open");
  });
  return nav;
}

function highlightNav() {
  const section = currentSection();
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.dataset.section === section);
  });
}

// ---------- 页脚 ----------
function buildFooter() {
  const col = (title, links) =>
    el("div", {}, [
      el("h4", {}, title),
      ...links.map(([href, label]) => el("a", { href }, label))
    ]);

  return el("footer", { class: "footer" }, [
    el("div", { class: "container" }, [
      el("div", { class: "footer-grid" }, [
        el("div", {}, [
          el("div", { class: "brand", style: "color:#fff;margin-bottom:12px" }, [
            el("span", { class: "brand-mark" }, icon("bolt")),
            "智汇 AI 对接平台"
          ]),
          el("p", { style: "font-size:13.5px;color:#a7adc4;max-width:280px" },
            "免费开源的 AI 落地供需对接空间：需求方公开招标，开发者与团队展示档案与案例。")
        ]),
        col("平台", [
          ["#/projects", "需求大厅"],
          ["#/developers", "开发者目录"],
          ["#/post", "发布需求"],
          ["#/join", "开发者入驻"]
        ]),
        col("资源", [
          ["#/about", "关于与愿景"],
          ["#/about", "产品路线图"],
          ["#/about", "开源贡献"]
        ]),
        col("原则", [
          ["#/about", "完全免费"],
          ["#/about", "开源透明"],
          ["#/about", "中立对接"]
        ])
      ]),
      el("div", { class: "footer-bottom" }, [
        el("span", "© 2026 智汇 AI 对接平台 · MIT License · 演示数据仅用于展示"),
        el("span", "本站不存储生产密钥，数据层接入规划见 README")
      ])
    ])
  ]);
}

// ---------- 404 ----------
function renderNotFound(container) {
  container.append(
    el("div", { class: "container" }, [
      el("div", { class: "empty", style: "padding:90px 20px" }, [
        el("div", { class: "empty-icon", style: "font-size:28px" }, "404"),
        el("h3", {}, "页面不存在"),
        el("p", {}, "你访问的地址可能已被移动或删除。"),
        el("a", { class: "btn btn-primary mt-1", href: "#/" }, "返回首页")
      ])
    ])
  );
}

// ---------- 启动 ----------
function boot() {
  app.append(buildNav(), el("div", { id: "page" }), buildFooter());
  const page = document.getElementById("page");

  registerRoute("/", () => renderHome(page));
  registerRoute("/projects", () => renderProjects(page));
  registerRoute("/project/:id", (p) => renderProjectDetail(page, p));
  registerRoute("/developers", () => renderDevelopers(page));
  registerRoute("/developer/:id", (p) => renderDeveloperDetail(page, p));
  registerRoute("/post", () => renderPost(page));
  registerRoute("/join", () => renderJoin(page));
  registerRoute("/about", () => renderAbout(page));

  window.addEventListener("hashchange", () => {
    page.innerHTML = "";
    highlightNav();
  });

  startRouter(() => renderNotFound(page));
  highlightNav();
}

boot();
