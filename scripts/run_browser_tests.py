#!/usr/bin/env python3
"""Run the Nexa browser test suite headlessly.

The suite itself stays exactly as it is — tests/index.html imports
dist/nexa.js and asserts against the real DOM, no test framework, no build
step. This script only automates what a human would do by hand: serve the
repo root, open tests/ in a browser, and read the results.

The only dependency beyond the standard library is playwright
(`pip install playwright && playwright install chromium`), keeping the
project's no-Node rule intact.

Usage:
    python3 scripts/run_browser_tests.py [repo-root] [--browser chromium|firefox|webkit]

Exit code 0 when every test passes, 1 otherwise.
"""

from __future__ import annotations

import argparse
import http.server
import sys
import threading
from functools import partial
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print(
        "playwright is required: pip install playwright && playwright install chromium",
        file=sys.stderr,
    )
    sys.exit(2)

RESULTS_TIMEOUT_MS = 30_000
BROWSERS = ("chromium", "firefox", "webkit")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):  # silence per-request logging
        pass


def serve(root: Path) -> tuple[http.server.ThreadingHTTPServer, int]:
    handler = partial(QuietHandler, directory=str(root))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, server.server_address[1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("root", nargs="?", default=".",
                        help="repo root to serve (default: current directory)")
    parser.add_argument("--browser", choices=BROWSERS, default="chromium",
                        help="playwright browser to run the suite in "
                             "(default: chromium; install it first with "
                             "`playwright install <browser>`)")
    args = parser.parse_args()
    root = Path(args.root).resolve()

    if not (root / "tests" / "index.html").exists():
        print(f"tests/index.html not found under {root}", file=sys.stderr)
        return 2

    server, port = serve(root)

    try:
        with sync_playwright() as p:
            browser = getattr(p, args.browser).launch()
            page = browser.new_page()

            # Surface page-level errors (module parse failures, unhandled
            # rejections) that would otherwise leave the run hanging silently.
            page.on("pageerror", lambda e: print(f"page error: {e}", file=sys.stderr))

            page.goto(f"http://127.0.0.1:{port}/tests/")
            page.wait_for_function(
                "() => window.__nexaTestResults !== undefined",
                timeout=RESULTS_TIMEOUT_MS,
            )
            results = page.evaluate("() => window.__nexaTestResults")
            browser.close()
    finally:
        server.shutdown()

    passed = [r for r in results if r["status"] == "pass"]
    failed = [r for r in results if r["status"] != "pass"]

    for r in results:
        mark = "✓" if r["status"] == "pass" else "✗"
        suffix = f" — {r['error']}" if r.get("error") else ""
        print(f"{mark} {r['name']}{suffix}")

    print(f"\n{len(passed)}/{len(results)} passed ({args.browser})")
    return 0 if not failed and results else 1


if __name__ == "__main__":
    sys.exit(main())
