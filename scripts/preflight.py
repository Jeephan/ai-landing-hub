#!/usr/bin/env python3
"""fullstack-ship G0 体检：项目形态、git 状态、密钥泄露、平台连通性。

只读，不改任何文件；不打印任何疑似密钥的内容，只报文件名与行号。

用法：
    python3 scripts/preflight.py --root . 
    python3 scripts/preflight.py --root . --json
    python3 scripts/preflight.py --root . --skip-network

退出码：0 = 无 error（可能有 warning）；1 = 有 error，禁止进入 G1 之后的阶段。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import time

SECRET_PATTERNS = [
    ("stripe_live", re.compile(r"\bsk_live_[A-Za-z0-9]{8,}")),
    ("stripe_test", re.compile(r"\bsk_test_[A-Za-z0-9]{8,}")),
    ("supabase_service_role", re.compile(r"\bservice_role\b")),
    ("private_key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("aws_key_id", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("github_pat", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}")),
    ("openai_key", re.compile(r"\bsk-[A-Za-z0-9]{20,}")),
    ("generic_db_url", re.compile(r"postgres(?:ql)?://[^\s:@]+:[^\s@]+@")),
]

TEXT_EXT = {".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".html", ".css",
            ".md", ".txt", ".yml", ".yaml", ".toml", ".py", ".go", ".rs", ".sh",
            ".env", ".example", ".ini", ".conf", ""}
SKIP_DIR = {"node_modules", ".git", "dist", "build", ".venv", "venv", "__pycache__",
            ".next", ".ship", "coverage", "vendor", "target", "scripts"}

PLATFORMS = [
    ("github", "github.com", 443),
    ("github_ssh_443", "ssh.github.com", 443),
    ("cloudflare_api", "api.cloudflare.com", 443),
    ("vercel_api", "api.vercel.com", 443),
    ("supabase_api", "api.supabase.com", 443),
]


def run(cmd: list[str], cwd: str, timeout: int = 20) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout + p.stderr).strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return 127, ""


def sh(cmd: str) -> str | None:
    return shutil.which(cmd)


def detect_stack(root: str) -> dict:
    info: dict = {"kinds": [], "build_command": None, "output_dir": None}
    pkg = os.path.join(root, "package.json")
    if os.path.exists(pkg):
        info["kinds"].append("node")
        try:
            with open(pkg, "r", encoding="utf-8") as f:
                data = json.load(f)
            scripts = data.get("scripts", {}) or {}
            if "build" in scripts:
                info["build_command"] = scripts["build"]
            info["package_manager"] = ("pnpm" if os.path.exists(os.path.join(root, "pnpm-lock.yaml"))
                                       else "yarn" if os.path.exists(os.path.join(root, "yarn.lock"))
                                       else "npm")
            info["node_spec"] = (data.get("engines") or {}).get("node")
        except Exception as e:  # noqa: BLE001
            info["package_json_error"] = str(e)
    for f, kind in (("requirements.txt", "python"), ("pyproject.toml", "python"),
                    ("go.mod", "go"), ("Cargo.toml", "rust"), ("Dockerfile", "docker"),
                    ("wrangler.toml", "cloudflare-worker"), ("wrangler.jsonc", "cloudflare-worker"),
                    ("vercel.json", "vercel")):
        if os.path.exists(os.path.join(root, f)):
            info["kinds"].append(kind)
    # 猜测产物目录
    for d in ("dist", "build", "out", "public", ".next/static"):
        if os.path.isdir(os.path.join(root, d)):
            info["output_dir"] = d
            break
    return info


def git_info(root: str) -> dict:
    out: dict = {}
    code, _ = run(["git", "rev-parse", "--is-inside-work-tree"], root)
    if code != 0:
        out["is_repo"] = False
        return out
    out["is_repo"] = True
    for key, args in (("branch", ["git", "branch", "--show-current"]),
                      ("remote", ["git", "remote", "get-url", "origin"]),
                      ("dirty", ["git", "status", "--porcelain"]),
                      ("commits", ["git", "rev-list", "--count", "HEAD"])):
        code, stdout = run(args, root)
        if code != 0:
            continue
        if key == "dirty":
            out["dirty_files"] = len([l for l in stdout.splitlines() if l.strip()]) if stdout else 0
        else:
            out[key] = stdout.splitlines()[0] if stdout else ""
    return out


def gitignored(root: str) -> dict:
    path = os.path.join(root, ".gitignore")
    needed = [".env", "node_modules", "dist", ".ship"]
    if not os.path.exists(path):
        return {"exists": False, "missing": needed}
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        lines = [l.strip() for l in f if l.strip() and not l.startswith("#")]
    missing = [n for n in needed if not any(n in l for l in lines)]
    return {"exists": True, "missing": missing}


def tracked_env(root: str) -> list[str]:
    code, stdout = run(["git", "ls-files"], root)
    if code != 0:
        return []
    hits = []
    for line in stdout.splitlines():
        base = os.path.basename(line)
        if base == ".env" or base.startswith(".env.") and not base.endswith((".example", ".sample")):
            hits.append(line)
    return hits


def scan_secrets(root: str) -> list[dict]:
    findings: list[dict] = []
    code, stdout = run(["git", "ls-files"], root)
    files = [l for l in stdout.splitlines() if l.strip()] if code == 0 else []
    if not files:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIR]
            files.extend(os.path.relpath(os.path.join(dirpath, f), root) for f in filenames)
    for rel in files:
        p = os.path.join(root, rel)
        if not os.path.isfile(p):
            continue
        if os.path.splitext(rel)[1].lower() not in TEXT_EXT:
            continue
        if os.path.getsize(p) > 512 * 1024:
            continue
        try:
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                for no, line in enumerate(f, 1):
                    for kind, pat in SECRET_PATTERNS:
                        if pat.search(line):
                            findings.append({"file": rel, "line": no, "kind": kind})
        except OSError:
            continue
    return findings


def netcheck(host: str, port: int, timeout: float = 3.0) -> dict:
    t0 = time.time()
    try:
        s = socket.create_connection((host, port), timeout=timeout)
        s.close()
        return {"ok": True, "ms": round((time.time() - t0) * 1000)}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "ms": round((time.time() - t0) * 1000), "err": type(e).__name__}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--skip-network", action="store_true")
    args = ap.parse_args()

    root = os.path.abspath(args.root)
    errors: list[str] = []
    warnings: list[str] = []
    result: dict = {"root": root}

    if not os.path.isdir(root):
        sys.exit(f"目录不存在：{root}")

    tool = {}
    for name in ("git", "node", "npm", "python3"):
        path = sh(name)
        tool[name] = path
        if name in ("git", "node") and not path:
            errors.append(f"缺少必需工具：{name}")
    versions = {}
    for name, flag in (("git", "--version"), ("node", "-v"), ("npm", "-v"), ("python3", "-V")):
        if tool.get(name):
            code, out = run([name, flag], root)
            if code == 0 and out:
                versions[name] = out.splitlines()[0]
    result["tools"] = versions

    stack = detect_stack(root)
    result["stack"] = stack
    if not stack["kinds"]:
        warnings.append("未识别到项目类型（没有 package.json / requirements.txt / go.mod 等）")
    if stack.get("kinds") and "node" in stack["kinds"] and not stack.get("build_command"):
        warnings.append("package.json 里没有 build 脚本，云端可能无法构建")
    if not stack.get("node_spec") and "node" in (stack.get("kinds") or []):
        warnings.append("未声明 engines.node，云端与本地 Node 版本可能不一致")

    g = git_info(root)
    result["git"] = g
    if not g.get("is_repo"):
        warnings.append("当前目录不是 git 仓库（G2 需要先 git init）")
    else:
        if not g.get("remote"):
            warnings.append("没有 origin 远端")
        if g.get("dirty_files"):
            warnings.append(f"有 {g['dirty_files']} 个未提交改动")

    ig = gitignored(root)
    result["gitignore"] = ig
    if not ig["exists"]:
        warnings.append(".gitignore 不存在，dist/.env/node_modules 可能被提交")
    elif ig["missing"]:
        warnings.append("建议补进 .gitignore：" + "、".join(ig["missing"]))

    env_files = tracked_env(root)
    result["tracked_env"] = env_files
    if env_files:
        errors.append("这些 .env 文件已被 git 跟踪，必须移出版本库：" + "、".join(env_files))

    secrets = scan_secrets(root)
    result["secret_findings"] = secrets
    if secrets:
        for s in secrets[:10]:
            errors.append(f"疑似密钥：{s['file']}:{s['line']}（{s['kind']}）")
        if len(secrets) > 10:
            errors.append(f"...另有 {len(secrets) - 10} 处疑似密钥")

    if not args.skip_network:
        net = {}
        for label, host, port in PLATFORMS:
            net[label] = netcheck(host, port)
        result["network"] = net
        if not net["github"]["ok"] and not net["github_ssh_443"]["ok"]:
            warnings.append("GitHub 443 与 ssh.github.com:443 都不可达，G2 会阻塞")
        elif not net["github"]["ok"] and net["github_ssh_443"]["ok"]:
            warnings.append("github.com:443 不通但 ssh.github.com:443 通 → push 需走 443")

    result["errors"] = errors
    result["warnings"] = warnings
    result["gate_g0"] = "fail" if errors else "pass"

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"项目根：{root}")
        print("工具：" + "、".join(f"{k} {v}" for k, v in versions.items()))
        print("形态：" + ("、".join(stack["kinds"]) or "未识别")
                + (f" · 构建 `{stack['build_command']}`" if stack.get("build_command") else "")
                + (f" · 产物 {stack['output_dir']}" if stack.get("output_dir") else ""))
        print(f"Git：{'是' if g.get('is_repo') else '否'}"
              + (f" · 分支 {g.get('branch')}" if g.get("branch") else "")
              + (f" · 远端 {g.get('remote')}" if g.get("remote") else ""))
        if result.get("network"):
            print("连通性：" + "、".join(
                f"{k}{'✅' if v['ok'] else '❌'}" for k, v in result["network"].items()))
        for w in warnings:
            print(f"⚠️  {w}")
        for e in errors:
            print(f"❌  {e}")
        print(f"\nG0 门禁：{'通过' if not errors else '未通过'}")

    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()
