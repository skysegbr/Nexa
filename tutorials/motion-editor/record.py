#!/usr/bin/env python3
"""Record the Motion Editor video tutorial.

Serves the repo root (the player embeds /examples/motion-editor/ in an
iframe) and performs the real workflow on camera: start from an empty
stage, draw a rectangle, scrub the playhead and drag it (auto-key), rotate
it with Free Transform at the last frame, play the looping movie, then
show the Behavior panel and the live code export. Saves the Playwright
screen recording as motion-editor-tutorial.webm next to this script.

Requires playwright (`pip install playwright && playwright install chromium`)
— same dependency as the test suite, no Node.

Run from anywhere:
    python3 tutorials/motion-editor/record.py
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
OUT = TUT_DIR / "motion-editor-tutorial.webm"


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
        page.goto(f"http://127.0.0.1:{port}/tutorials/motion-editor/index.html")
        page.wait_for_function("() => typeof window.__setStep === 'function'")

        editor = page.frame_locator(".tut-frame")
        editor.locator(".me-stage").wait_for(state="visible")

        def step(n, hold):
            page.evaluate(f"window.__setStep({n})")
            time.sleep(hold)

        def scrub(ratio):
            ruler = editor.locator(".me-ruler").bounding_box()
            # stay 2px inside the edges — a click on the exact border misses
            x = min(ruler["x"] + ruler["width"] * ratio, ruler["x"] + ruler["width"] - 2)
            page.mouse.click(x, ruler["y"] + ruler["height"] / 2)
            time.sleep(0.4)

        def drag(x0, y0, x1, y1, steps=16):
            page.mouse.move(x0, y0)
            page.mouse.down()
            page.mouse.move(x1, y1, steps=steps)
            page.mouse.up()

        # 0 — title card; under it, clear the starter cast so step 1 opens
        # on an empty stage. Pointer clicks would land on the overlay, so
        # the row ✕ buttons are clicked straight in the iframe's DOM.
        step(0, 0.4)
        frame = page.query_selector(".tut-frame").content_frame()
        for _ in range(3):
            frame.evaluate("() => { const b = document.querySelector('.me-btn-remove'); if (b) b.click(); }")
            time.sleep(0.25)
        time.sleep(2.4)

        # 1 — draw a rectangle on the empty stage (teal fill)
        step(1, 0.8)
        editor.get_by_title("#35e0c2").first.click()
        editor.get_by_title("Rectangle").click()
        time.sleep(0.6)
        stage = editor.locator(".me-stage").bounding_box()
        drag(stage["x"] + 130, stage["y"] + 150, stage["x"] + 215, stage["y"] + 235, steps=14)
        time.sleep(2.8)

        # 2 — scrub to f37, drag the square: auto-key at the playhead
        step(2, 0.8)
        scrub(0.5)
        box = editor.locator(".me-actor-rect-1").bounding_box()
        drag(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2,
             box["x"] + box["width"] / 2 + 260, box["y"] + box["height"] / 2 + 70, steps=22)
        time.sleep(2.8)

        # 3 — last frame + Free Transform: rotate, keyed at the playhead
        step(3, 0.8)
        scrub(1.0)
        editor.get_by_title("Free Transform (rotate/scale)").click()
        editor.locator(".me-actor-rect-1").click(force=True)
        editor.locator(".me-rotate-handle").wait_for(state="visible")
        time.sleep(0.5)
        outline = editor.locator(".me-transform-outline").bounding_box()
        cx = outline["x"] + outline["width"] / 2
        cy = outline["y"] + outline["height"] / 2
        handle = editor.locator(".me-rotate-handle").bounding_box()
        drag(handle["x"] + handle["width"] / 2, handle["y"] + handle["height"] / 2,
             cx + 110, cy + 45, steps=20)
        time.sleep(2.4)

        # 4 — loop on, rewind, play the movie
        step(4, 0.5)
        editor.get_by_title("Select", exact=True).click()
        editor.locator(".me-btn", has_text="loop").click()
        editor.locator(".me-btn", has_text="start").click()
        editor.locator(".me-btn", has_text="play").click()
        time.sleep(4.8)

        # 5 — Behavior panel, then scroll the sidebar to the live export
        step(5, 0.4)
        editor.locator(".me-btn", has_text="stop").click()
        editor.locator(".me-row-name", has_text="Rect 1").click()
        time.sleep(2.6)
        editor.locator(".me-code").scroll_into_view_if_needed()
        time.sleep(2.6)

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
