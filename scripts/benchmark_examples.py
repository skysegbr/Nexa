#!/usr/bin/env python3
"""Benchmark example pages: JS payload, request count and load timings.

Serves the repo root with a plain static server, opens each example in
headless chromium (cold cache per run) and records every local response:
bytes and count per resource type, plus navigation timings. External
requests are blocked so runs are deterministic and offline-safe.

Only playwright beyond the standard library (same dependency as
scripts/run_browser_tests.py), keeping the project's no-Node rule intact.

Usage:
    python3 scripts/benchmark_examples.py -o results.json [example ...]

With no positional args, benchmarks every examples/*/index.html.
"""

from __future__ import annotations

import argparse
import http.server
import json
import statistics
import sys
import threading
import time
from functools import partial
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("playwright is required: pip install playwright && playwright install chromium",
          file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parent.parent
RUNS = 3
SETTLE_MS = 1200  # let lazy imports land after the load event


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(root: Path):
    handler = partial(QuietHandler, directory=str(root))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, server.server_address[1]


def bench_page(browser, url: str) -> dict:
    context = browser.new_context()  # fresh context = cold cache
    page = context.new_page()

    resources = []

    def on_response(response):
        try:
            body = response.body()
        except Exception:
            body = b""
        resources.append({"url": response.url, "bytes": len(body),
                          "status": response.status})

    # block anything that isn't our local server
    page.route("**/*", lambda route: route.continue_()
               if "127.0.0.1" in route.request.url else route.abort())
    page.on("response", on_response)
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto(url, wait_until="load", timeout=30_000)
    page.wait_for_timeout(SETTLE_MS)

    timing = page.evaluate("""() => {
        const nav = performance.getEntriesByType('navigation')[0];
        return {
            domContentLoaded: nav.domContentLoadedEventEnd,
            load: nav.loadEventEnd,
        };
    }""")
    context.close()

    def bucket(pred):
        rs = [r for r in resources if pred(r["url"]) and r["status"] == 200]
        return {"count": len(rs), "bytes": sum(r["bytes"] for r in rs)}

    return {
        "js": bucket(lambda u: u.split("?")[0].endswith(".js")),
        "css": bucket(lambda u: u.split("?")[0].endswith(".css")),
        "all": bucket(lambda u: True),
        "components_js": bucket(
            lambda u: "nexa-components" in u and u.split("?")[0].endswith(".js")),
        "timing": timing,
        "errors": errors,
        "js_files": sorted(r["url"].split("/dist/")[-1] for r in resources
                           if "/dist/" in r["url"] and r["url"].split("?")[0].endswith(".js")),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("examples", nargs="*",
                        help="example names (default: all with index.html)")
    parser.add_argument("-o", "--output", required=True, help="output JSON path")
    args = parser.parse_args()

    if args.examples:
        names = args.examples
    else:
        names = sorted(d.name for d in (ROOT / "examples").iterdir()
                       if (d / "index.html").exists())

    server, port = serve(ROOT)
    results = {}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for name in names:
                url = f"http://127.0.0.1:{port}/examples/{name}/"
                runs = []
                for _ in range(RUNS):
                    try:
                        runs.append(bench_page(browser, url))
                    except Exception as e:
                        print(f"  {name}: run failed: {e}", file=sys.stderr)
                if not runs:
                    continue
                # payload is deterministic (take first); timings take the median
                r = runs[0]
                r["timing"] = {
                    k: round(statistics.median(x["timing"][k] for x in runs), 1)
                    for k in r["timing"]
                }
                results[name] = r
                print(f"{name:22s} js {r['js']['count']:3d} req"
                      f" {r['js']['bytes']/1024:8.1f} KB"
                      f"  components {r['components_js']['bytes']/1024:7.1f} KB"
                      f"  load {r['timing']['load']:7.1f} ms"
                      + (f"  ERRORS: {len(r['errors'])}" if r["errors"] else ""))
            browser.close()
    finally:
        server.shutdown()

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"generated": time.strftime("%Y-%m-%d %H:%M:%S"),
                               "runs": RUNS, "results": results}, indent=2))
    print(f"\nwrote {out} ({len(results)} examples)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
