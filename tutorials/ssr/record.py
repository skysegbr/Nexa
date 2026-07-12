#!/usr/bin/env python3
"""Record the SSR video tutorial.

Serves the repo root (the player embeds /examples/ssr/ in an iframe), drives
the live example — opening the raw server-HTML and useHead head-markup
panels, clicking the hydrated buttons — and saves the Playwright screen
recording as ssr-tutorial.webm next to this script.

Requires playwright (`pip install playwright && playwright install chromium`)
— same dependency as the test suite, no Node.

Run from anywhere:
    python3 tutorials/ssr/record.py
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
OUT = TUT_DIR / "ssr-tutorial.webm"


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
        page.goto(f"http://127.0.0.1:{port}/tutorials/ssr/index.html")
        page.wait_for_function("() => typeof window.__setStep === 'function'")

        example = page.frame_locator(".tut-frame")
        example.locator("button:has-text('Add')").wait_for(state="visible")

        def step(n, hold):
            page.evaluate(f"window.__setStep({n})")
            time.sleep(hold)

        body_panel = example.locator("summary:has-text('renderToString')")
        head_panel = example.locator("summary:has-text('renderHeadToString')")

        # 0 — title card
        step(0, 3.5)

        # 1 — renderToString: open the raw server-HTML panel on camera
        step(1, 2.5)
        body_panel.click()
        example.locator("#source").scroll_into_view_if_needed()
        time.sleep(4.5)

        # 2 — useHead: swap panels — close the body string, open the head markup
        step(2, 0.5)
        body_panel.click()
        head_panel.click()
        example.locator("#head-source").scroll_into_view_if_needed()
        time.sleep(6.0)

        # 3 — one component, both sides (close the panel, read the code)
        step(3, 0.5)
        head_panel.click()
        time.sleep(6.0)

        # 4 — hydrate adopts the DOM (status line proves node reuse)
        step(4, 6.5)

        # 5 — alive after hydration: click the hydrated buttons for real
        step(5, 2.0)
        add = example.locator("button:has-text('Add')")
        for _ in range(3):
            add.click()
            time.sleep(0.8)
        time.sleep(1.0)
        example.locator("button:has-text('Reset')").click()
        time.sleep(2.2)

        # 6 — recap card
        step(6, 5.0)

        ctx.close()  # flush the recording
        video_path = Path(page.video.path())
        browser.close()

    server.shutdown()
    shutil.move(video_path, OUT)
    shutil.rmtree(TUT_DIR / "video", ignore_errors=True)
    print(f"saved: {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
