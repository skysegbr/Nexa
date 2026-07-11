#!/usr/bin/env python3
"""Record the basic-example video tutorial.

Serves the repo root (the player embeds /examples/basic/ in an iframe),
drives the live example with real clicks — counter and theme toggle — and
saves the Playwright screen recording as basic-tutorial.webm next to this
script.

Requires playwright (`pip install playwright && playwright install chromium`)
— same dependency as the test suite, no Node.

Run from anywhere:
    python3 tutorials/basic/record.py
"""

import http.server
import shutil
import sys
import threading
import time
from functools import partial
from pathlib import Path

from playwright.sync_api import sync_playwright

TUT_DIR = Path(__file__).resolve().parent
REPO = TUT_DIR.parents[1]
OUT = TUT_DIR / "basic-tutorial.webm"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    handler = partial(QuietHandler, directory=str(REPO))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    port = server.server_address[1]

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=str(TUT_DIR / "video"),
            record_video_size={"width": 1280, "height": 720},
        )
        page = ctx.new_page()
        page.on("pageerror", lambda e: print(f"page error: {e}", file=sys.stderr))
        page.goto(f"http://127.0.0.1:{port}/tutorials/basic/index.html")
        page.wait_for_function("() => typeof window.__setStep === 'function'")

        example = page.frame_locator(".tut-frame")
        example.locator("button:has-text('Add')").wait_for(state="visible")

        def step(n, hold):
            page.evaluate(f"window.__setStep({n})")
            time.sleep(hold)

        # 0 — title card
        step(0, 3.5)

        # 1 — the entry point (read the HTML)
        step(1, 6.0)

        # 2 — components are plain functions
        step(2, 7.0)

        # 3 — state: click Add for real, counter reacts
        step(3, 2.5)
        add = example.locator("button:has-text('Add')")
        for _ in range(4):
            add.click()
            time.sleep(0.8)
        time.sleep(2.0)

        # 4 — theming: flip to dark, then back to light
        step(4, 2.5)
        example.locator("[aria-label='Switch to dark theme']").click()
        time.sleep(2.8)
        example.locator("[aria-label='Switch to light theme']").click()
        time.sleep(2.2)

        # 5 — recap card
        step(5, 5.0)

        ctx.close()  # flush the recording
        video_path = Path(page.video.path())
        browser.close()

    server.shutdown()
    shutil.move(video_path, OUT)
    shutil.rmtree(TUT_DIR / "video", ignore_errors=True)
    print(f"saved: {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
