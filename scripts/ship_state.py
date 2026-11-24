#!/usr/bin/env python3
"""fullstack-ship 状态台账：让上线流程可断点续跑、可审计。

用法：
    python3 scripts/ship_state.py init --project myapp
    python3 scripts/ship_state.py status
    python3 scripts/ship_state.py next
    python3 scripts/ship_state.py pass G1 --note "build ok"
    python3 scripts/ship_state.py block G2 --reason "github 授权超时"
    python3 scripts/ship_state.py grant github-repo-write --scope owner/repo \
        --how "deploy key (write)" --revoke "https://github.com/owner/repo/settings/keys"
    python3 scripts/ship_state.py revoke github-repo-write
    python3 scripts/ship_state.py resource pages-project myapp --url https://x.pages.dev
    python3 scripts/ship_state.py export --format md

状态文件：<root>/.ship/state.json（务必加入 .gitignore）
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone

STAGES = [
    ("G0", "盘点", "preflight 无 error"),
    ("G1", "本地跑通", "构建退出码 0，本地关键功能可用"),
    ("G2", "版本控制", "远端有本分支，自动部署已触发"),
    ("G3", "数据层", "迁移可重放，连接串只在平台侧"),
    ("G4", "部署", "生产 URL 返回 200"),
    ("G5", "域名与证书", "自定义域 HTTPS 可用"),
    ("G6", "验收", "smoke_check 全绿 + 人工核对"),
    ("G7", "交接", "README 部署段 + 台账导出"),
]

GATES_FOR = {
    "G2": ["github-login", "github-repo-create", "github-repo-write"],
    "G3": ["db-login", "db-project", "db-migrate"],
    "G4": ["host-login", "host-git-connect", "host-project"],
    "G5": ["dns-zone", "dns-record"],
}

# 每个阶段的下一步动作提示
NEXT_ACTION = {
    "G0": "跑 preflight.py，确认形态/数据/域名/费用四个问题",
    "G1": "npm ci && npm run build，本地起服务验证核心功能",
    "G2": "git init → 建仓 → 探测推送凭据 → push → 确认远端收到",
    "G3": "先 dry-run 迁移，再执行；凭据只注入平台侧",
    "G4": "按形态选一条部署路径（Git 集成优先，直传兜底）",
    "G5": "读现有 DNS → 加子域 CNAME → 等 SSL 已启用",
    "G6": "smoke_check.py + 人工核对清单",
    "G7": "补 README 部署段 → 导出 access-report.md",
}

DEFAULT = {"version": 1, "project": "", "created_at": "", "updated_at": "",
           "stages": {}, "gates": [], "resources": [], "log": []}


def now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def state_path(root: str) -> str:
    return os.path.join(root, ".ship", "state.json")


def load(root: str, create: bool = False) -> dict:
    p = state_path(root)
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            data = json.load(f)
        for k, v in DEFAULT.items():
            data.setdefault(k, v if not isinstance(v, (dict, list)) else type(v)())
        return data
    if not create:
        sys.exit("未找到状态文件：先执行 `ship_state.py init --project <name>`")
    return dict(json.loads(json.dumps(DEFAULT)))


def save(root: str, data: dict) -> None:
    p = state_path(root)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    data["updated_at"] = now()
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, p)


def ensure_gitignore(root: str) -> bool:
    gi = os.path.join(root, ".gitignore")
    line = ".ship/"
    if not os.path.exists(gi):
        with open(gi, "w", encoding="utf-8") as f:
            f.write(line + "\n")
        return True
    with open(gi, "r", encoding="utf-8") as f:
        content = f.read()
    if line in content.splitlines() or ".ship" in content:
        return False
    with open(gi, "a", encoding="utf-8") as f:
        if not content.endswith("\n"):
            f.write("\n")
        f.write("# fullstack-ship 本地状态台账\n" + line + "\n")
    return True


def stage_of(data: dict, key: str) -> dict:
    s = data["stages"].get(key)
    if s is None:
        s = {"status": "pending", "note": "", "at": ""}
        data["stages"][key] = s
    return s


def cmd_init(args: argparse.Namespace) -> None:
    root = args.root
    data = load(root, create=True)
    if not data.get("project"):
        data["project"] = args.project or os.path.basename(os.path.abspath(root))
    data["created_at"] = data.get("created_at") or now()
    for key, name, gate in STAGES:
        st = stage_of(data, key)
        st.setdefault("name", name)
        st.setdefault("gate", gate)
    ignored = ensure_gitignore(root)
    save(root, data)
    print(f"✅ 已初始化 .ship/state.json（project={data['project']}）")
    print(f"   .gitignore {'已新增' if ignored else '已包含'} .ship/")


def cmd_status(args: argparse.Namespace) -> None:
    data = load(args.root)
    print(f"project: {data['project']}    updated: {data.get('updated_at','-')}")
    print("-" * 56)
    for key, name, gate in STAGES:
        st = data["stages"].get(key, {})
        mark = {"passed": "✅", "blocked": "⛔", "pending": "○"}.get(st.get("status"), "○")
        note = st.get("note") or st.get("reason") or ""
        print(f"{mark} {key} {name:<10} {note}")
    granted = [g for g in data["gates"] if g.get("status") == "granted"]
    blocked = [g for g in data["gates"] if g.get("status") == "blocked"]
    if granted:
        print("\n已授权：")
        for g in granted:
            print(f"  · {g['gate']} scope={g.get('scope','-')} revoke={g.get('revoke','-')}")
    if blocked:
        print("\n待授权（被阻塞）：")
        for g in blocked:
            print(f"  · {g['gate']} {g.get('reason','')}")
    if data["resources"]:
        print("\n资源：")
        for r in data["resources"]:
            print(f"  · {r.get('kind')} {r.get('name')} {r.get('url','')}")


def cmd_next(args: argparse.Namespace) -> None:
    data = load(args.root)
    for key, name, gate in STAGES:
        if data["stages"].get(key, {}).get("status") != "passed":
            print(f"下一个阶段：{key} {name} — {gate}")
            print(f"动作：{NEXT_ACTION[key]}")
            need = GATES_FOR.get(key)
            if need:
                granted = {g["gate"] for g in data["gates"] if g.get("status") == "granted"}
                missing = [g for g in need if g not in granted]
                if missing:
                    print("需要授权：" + "、".join(missing) + "（逐条 JIT 申请，先探测）")
                else:
                    print("授权已齐备，可直接执行。")
            raise SystemExit(1)
    print("🎉 全部阶段已通过。记得导出 access-report.md。")


def cmd_pass(args: argparse.Namespace) -> None:
    data = load(args.root)
    st = stage_of(data, args.stage.upper())
    st.update({"status": "passed", "at": now(), "note": args.note or ""})
    data["log"].append({"at": now(), "event": "pass", "stage": args.stage.upper(), "note": args.note or ""})
    save(args.root, data)
    print(f"✅ {args.stage.upper()} 已标记通过")


def cmd_block(args: argparse.Namespace) -> None:
    data = load(args.root)
    key = args.stage.upper()
    st = stage_of(data, key)
    st.update({"status": "blocked", "at": now(), "reason": args.reason or ""})
    data["log"].append({"at": now(), "event": "block", "stage": key, "reason": args.reason or ""})
    save(args.root, data)
    print(f"⛔ {key} 已标记阻塞：{args.reason or ''}\n   下一步：走降级路径，或在拿到权限后重新 pass")


def cmd_grant(args: argparse.Namespace) -> None:
    data = load(args.root)
    for g in data["gates"]:
        if g["gate"] == args.gate:
            g.update({"status": "granted", "scope": args.scope or g.get("scope", ""),
                      "how": args.how or g.get("how", ""), "revoke": args.revoke or g.get("revoke", ""),
                      "granted_at": now()})
            break
    else:
        data["gates"].append({"gate": args.gate, "scope": args.scope or "", "how": args.how or "",
                              "revoke": args.revoke or "", "granted_at": now(), "status": "granted"})
    data["log"].append({"at": now(), "event": "grant", "gate": args.gate, "scope": args.scope or ""})
    save(args.root, data)
    print(f"🔑 已记账：{args.gate}  scope={args.scope or '-'}")
    if not args.revoke:
        print("   ⚠️ 未提供 --revoke，台账将缺少回收入口")


def cmd_revoke(args: argparse.Namespace) -> None:
    data = load(args.root)
    for g in data["gates"]:
        if g["gate"] == args.gate:
            g["status"] = "revoked"
            g["revoked_at"] = now()
            save(args.root, data)
            print(f"🗑 已记账撤销：{args.gate}")
            return
    sys.exit(f"台账中没有 {args.gate}")


def cmd_resource(args: argparse.Namespace) -> None:
    data = load(args.root)
    data["resources"].append({"kind": args.kind, "name": args.name, "url": args.url or "",
                              "at": now()})
    save(args.root, data)
    print(f"📦 已记录资源：{args.kind}/{args.name}")


def cmd_export(args: argparse.Namespace) -> None:
    data = load(args.root)
    if args.format == "json":
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return
    out = []
    out.append(f"# 上线交接与授权台账 — {data['project']}\n")
    out.append(f"生成时间：{now()}\n")
    out.append("## 阶段\n")
    out.append("| 阶段 | 状态 | 说明 |")
    out.append("| --- | --- | --- |")
    for key, name, _ in STAGES:
        st = data["stages"].get(key, {})
        label = {"passed": "✅ 通过", "blocked": "⛔ 阻塞"}.get(st.get("status"), "○ 未开始")
        note = (st.get("note") or st.get("reason") or "").replace("|", "\\|")
        out.append(f"| {key} {name} | {label} | {note} |")
    out.append("\n## 已授予的权限\n")
    granted = [g for g in data["gates"] if g.get("status") == "granted"]
    if granted:
        out.append("| 权限点 | 范围 | 方式 | 授予时间 | 撤销入口 |")
        out.append("| --- | --- | --- | --- | --- |")
        for g in granted:
            out.append(f"| `{g['gate']}` | {g.get('scope') or '-'} | {g.get('how') or '-'} | "
                       f"{g.get('granted_at','-')} | {g.get('revoke') or '-'} |")
    else:
        out.append("（无）")
    blocked = [g for g in data["gates"] if g.get("status") == "blocked"]
    if blocked:
        out.append("\n## 未获授权 / 已降级\n")
        for g in blocked:
            out.append(f"- `{g['gate']}`：{g.get('reason','')}")
    out.append("\n## 已创建资源\n")
    if data["resources"]:
        for r in data["resources"]:
            out.append(f"- {r.get('kind')} `{r.get('name')}` {r.get('url','')}")
    else:
        out.append("（无）")
    print("\n".join(out))


def main() -> None:
    p = argparse.ArgumentParser(description="fullstack-ship 状态台账")
    p.add_argument("--root", default=".", help="项目根目录（默认当前目录）")
    sub = p.add_subparsers(dest="cmd", required=True)

    i = sub.add_parser("init"); i.add_argument("--project", default=""); i.set_defaults(func=cmd_init)
    sub.add_parser("status").set_defaults(func=cmd_status)
    sub.add_parser("next").set_defaults(func=cmd_next)

    s = sub.add_parser("pass"); s.add_argument("stage"); s.add_argument("--note", default="")
    s.set_defaults(func=cmd_pass)

    b = sub.add_parser("block"); b.add_argument("stage"); b.add_argument("--reason", default="")
    b.set_defaults(func=cmd_block)

    g = sub.add_parser("grant"); g.add_argument("gate"); g.add_argument("--scope", default="")
    g.add_argument("--how", default=""); g.add_argument("--revoke", default="")
    g.set_defaults(func=cmd_grant)

    r = sub.add_parser("revoke"); r.add_argument("gate"); r.set_defaults(func=cmd_revoke)

    res = sub.add_parser("resource"); res.add_argument("kind"); res.add_argument("name")
    res.add_argument("--url", default=""); res.set_defaults(func=cmd_resource)

    e = sub.add_parser("export"); e.add_argument("--format", choices=["md", "json"], default="md")
    e.set_defaults(func=cmd_export)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
