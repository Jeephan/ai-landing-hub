#!/usr/bin/env python3
"""fullstack-ship G6 验收：状态码 / TLS / 标题 / 关键资源 / 耗时。

用法：
    python3 scripts/smoke_check.py https://example.com
    python3 scripts/smoke_check.py https://example.com --expect-title-contains MyApp
    python3 scripts/smoke_check.py https://example.com --max-ms 1500 --json

退出码：0 = 全部通过；1 = 有检查项失败。
注：本机若在代理 / fake-ip 环境下，对云平台域名可能假性失败，以浏览器实际访问为准。
"""
from __future__ import annotations

import argparse
import json
import re
import socket
import ssl
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlsplit

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"


def fetch(url: str, timeout: float, method: str = "GET") -> dict:
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA,
                                                              "Accept": "*/*"})
    ctx = ssl.create_default_context()
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            body = resp.read(200_000) if method == "GET" else b""
            return {"ok": True, "status": resp.status, "ms": round((time.time() - t0) * 1000),
                    "final_url": resp.geturl(), "headers": dict(resp.headers), "body": body}
    except urllib.error.HTTPError as e:
        return {"ok": False, "status": e.code, "ms": round((time.time() - t0) * 1000),
                "error": f"HTTP {e.code}"}
    except ssl.SSLError as e:
        return {"ok": False, "status": 0, "ms": round((time.time() - t0) * 1000),
                "error": f"TLS 错误：{e.reason or e}", "tls_fail": True}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "status": 0, "ms": round((time.time() - t0) * 1000),
                "error": f"{type(e).__name__}: {e}"}


def decode(body: bytes, headers: dict) -> str:
    ctype = headers.get("Content-Type", "") or headers.get("content-type", "")
    m = re.search(r"charset=([A-Za-z0-9_-]+)", ctype)
    enc = m.group(1) if m else "utf-8"
    try:
        return body.decode(enc, errors="replace")
    except LookupError:
        return body.decode("utf-8", errors="replace")


def tls_probe(url: str, timeout: float = 8.0) -> dict:
    """独立做一次 TLS 握手，拿协议版本和证书到期时间（不依赖 urllib 内部对象）。"""
    parts = urlsplit(url)
    if parts.scheme != "https":
        return {"ok": False, "error": "非 HTTPS"}
    host, port = parts.hostname, parts.port or 443
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((host, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as tls:
                cert = tls.getpeercert() or {}
                not_after = cert.get("notAfter", "")
                days = None
                if not_after:
                    days = int((ssl.cert_time_to_seconds(not_after) - time.time()) // 86400)
                return {"ok": True, "version": tls.version(), "not_after": not_after,
                        "days_left": days, "host": host}
    except ssl.SSLError as e:
        return {"ok": False, "error": f"TLS 错误：{e.reason or e}"}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}


def parse_html(text: str) -> dict:
    title_m = re.search(r"<title[^>]*>(.*?)</title>", text, re.S | re.I)
    title = re.sub(r"\s+", " ", title_m.group(1)).strip() if title_m else ""
    assets = []
    for pat in (r'<script[^>]+src="([^"]+)"', r'<link[^>]+href="([^"]+)"'):
        for u in re.findall(pat, text, re.I):
            if u.startswith("data:"):
                continue
            if not u.lower().endswith((".js", ".css", ".svg", ".png", ".webp", ".ico", ".woff2")):
                continue
            assets.append(u)
    metas = {}
    for name, content in re.findall(r'<meta[^>]+name="([^"]+)"[^>]+content="([^"]*)"', text, re.I):
        metas[name.lower()] = content
    return {"title": title, "assets": assets[:12], "metas": metas}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--expect-status", type=int, default=200)
    ap.add_argument("--expect-title-contains", default="")
    ap.add_argument("--max-ms", type=int, default=0, help="首页耗时上限，0 为不检查")
    ap.add_argument("--timeout", type=float, default=15.0)
    ap.add_argument("--max-assets", type=int, default=6)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    checks: list[dict] = []
    report: dict = {"url": args.url}

    r = fetch(args.url, args.timeout)
    report.update({"status": r.get("status", 0), "ms": r.get("ms", 0),
                   "final_url": r.get("final_url", args.url)})
    checks.append({"name": "可访问", "pass": r["ok"] and r.get("status") == args.expect_status,
                   "detail": f"status={r.get('status')} {r.get('error','')}"})
    if not r["ok"]:
        report["checks"] = checks
        report["gate_g6"] = "fail"
        print(json.dumps(report, ensure_ascii=False, indent=2) if args.json
              else f"❌ {args.url} 无法访问：{r.get('error')}")
        sys.exit(1)

    report["tls"] = tls_probe(r.get("final_url") or args.url, args.timeout)
    tls = report["tls"]
    if tls.get("ok"):
        detail = f"{tls['version']} · 证书 {tls.get('days_left')} 天后到期"
        checks.append({"name": "HTTPS 与证书", "pass": tls.get("days_left") is None or tls["days_left"] > 0,
                       "detail": detail})
    else:
        checks.append({"name": "HTTPS 与证书", "pass": False, "detail": tls.get("error", "握手失败")})

    html = decode(r.get("body") or b"", r.get("headers") or {})
    parsed = parse_html(html)
    report["title"] = parsed["title"]
    checks.append({"name": "标题非空", "pass": bool(parsed["title"]),
                   "detail": parsed["title"] or "缺少 <title>"})
    if args.expect_title_contains:
        checks.append({"name": "标题包含关键词",
                       "pass": args.expect_title_contains.lower() in parsed["title"].lower(),
                       "detail": f"期望包含 {args.expect_title_contains!r}（不区分大小写）"})

    if args.max_ms:
        checks.append({"name": f"耗时 < {args.max_ms}ms", "pass": 0 < r["ms"] <= args.max_ms,
                       "detail": f"{r['ms']}ms"})

    # 关键资源
    asset_results = []
    for a in parsed["assets"][: args.max_assets]:
        u = urljoin(r.get("final_url") or args.url, a)
        ar = fetch(u, args.timeout, method="GET")
        asset_results.append({"url": u, "status": ar.get("status"), "ok": ar["ok"],
                              "error": ar.get("error", ""), "ms": ar.get("ms", 0)})
    report["assets"] = asset_results
    bad = [a for a in asset_results if not a["ok"]]
    if asset_results:
        checks.append({"name": "关键资源可加载", "pass": not bad,
                       "detail": f"{len(asset_results) - len(bad)}/{len(asset_results)} 成功"
                                 + (f"，失败：" + "；".join(f"{b['url']}（{b.get('error') or b.get('status')}）"
                                                            for b in bad[:3]) if bad else "")})

    # 敏感信息痕迹（只看首页正文，不做深度爬取）
    leaks = [k for k in ("service" + "_role", "sk_live_", "PRIVATE KEY", "SUPABASE_SERVICE") if k in html]
    checks.append({"name": "首页无密钥痕迹", "pass": not leaks,
                   "detail": "干净" if not leaks else f"命中：{leaks}"})

    report["checks"] = checks
    report["gate_g6"] = "pass" if all(c["pass"] for c in checks) else "fail"

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"{args.url} → {report['status']} · {report['ms']}ms · 标题：{report['title'] or '(无)'}")
        for c in checks:
            print(f"{'✅' if c['pass'] else '❌'} {c['name']}：{c['detail']}")
        print(f"\nG6 门禁：{'通过' if report['gate_g6'] == 'pass' else '未通过'}")

    sys.exit(0 if report["gate_g6"] == "pass" else 1)


if __name__ == "__main__":
    main()
