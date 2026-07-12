#!/usr/bin/env python3
"""Record the nexa-motion video tutorial.

Serves the repo root (the player embeds /examples/nexa-motion/ and, for the
final step, /examples/motion-editor/ in an iframe), drives the live examples
— replaying the intro, jumping scenes with gotoAndPlay, then dragging a
keyframe in the editor — and saves the Playwright screen recording as
nexa-motion-tutorial.webm next to this script.

Requires playwright (`pip install playwright && playwright install chromium`)
— same dependency as the test suite, no Node.

Run from anywhere:
    python3 tutorials/nexa-motion/record.py
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
OUT = TUT_DIR / "nexa-motion-tutorial.webm"


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
        page.goto(f"http://127.0.0.1:{port}/tutorials/nexa-motion/index.html")
        page.wait_for_function("() => typeof window.__setStep === 'function'")

        example = page.frame_locator(".tut-frame")
        example.locator(".fx-deck").wait_for(state="visible")

        def step(n, hold):
            page.evaluate(f"window.__setStep({n})")
            time.sleep(hold)

        # 0 — title card
        step(0, 3.5)

        # 1 — the timeline: restart the movie and let the full intro play
        step(1, 0.3)
        example.locator(".fx-deck-scenes button:has-text('Loading')").click()
        time.sleep(6.0)

        # 2 — easing & stagger: replay the letter cascade on camera
        step(2, 0.3)
        example.locator(".fx-deck-scenes button:has-text('Title cascade')").click()
        time.sleep(4.5)

        # 3 — gotoAndPlay & frame scripts: jump scenes, deck follows
        step(3, 0.5)
        example.locator(".fx-deck-scenes button:has-text('Logo flies in')").click()
        time.sleep(2.6)
        example.locator(".fx-deck-scenes button:has-text('Finale loop')").click()
        time.sleep(2.6)

        # 4 — movie clips: the ring keeps looping after the movie ends
        step(4, 5.5)

        # 5 — the Motion Editor: iframe swaps, play the doc, drag a keyframe
        step(5, 0.5)
        editor = page.frame_locator(".tut-frame")
        editor.locator(".me-stage").wait_for(state="visible")
        editor.locator(".me-btn:has-text('play')").click()
        time.sleep(3.4)

        key = editor.locator(".me-row").first.locator(".me-key").nth(1)
        box = key.bounding_box()
        ruler = editor.locator(".me-ruler").bounding_box()
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()
        page.mouse.move(ruler["x"] + ruler["width"] * 0.85, box["y"] + box["height"] / 2, steps=14)
        page.mouse.up()
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
