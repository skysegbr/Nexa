#!/usr/bin/env python3
"""Record the useForm video tutorial.

Serves the repo root (so the tutorial page imports /dist/nexa.js directly),
drives the page step by step with real typing and clicks, and saves the
Playwright screen recording as useform-tutorial.webm next to this script.

Requires playwright (`pip install playwright && playwright install chromium`)
— same dependency as the test suite, no Node.

Run from anywhere:
    python3 tutorials/useform/record.py
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
OUT = TUT_DIR / "useform-tutorial.webm"


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
        page.goto(f"http://127.0.0.1:{port}/tutorials/useform/index.html")
        page.wait_for_function("() => typeof window.__setStep === 'function'")

        def step(n, hold):
            page.evaluate(f"window.__setStep({n})")
            time.sleep(hold)

        # 0 — title card
        step(0, 3.5)

        # 1 — the hook (read the code)
        step(1, 6.5)

        # 2 — wiring fields: type for real, state panel reacts
        step(2, 2.5)
        page.click("#nome")
        page.type("#nome", "Ana Souza", delay=70)
        time.sleep(1.2)
        page.click("#email")
        page.type("#email", "ana@exemplo", delay=70)  # incomplete on purpose
        time.sleep(2.5)

        # 3 — validation: blur the invalid email → error appears
        step(3, 2.5)
        page.click("#nome")  # blur email → validateOnBlur kicks in
        time.sleep(3.0)
        page.click("#email")
        page.type("#email", ".com", delay=90)
        page.click("#nome")  # blur again → error clears
        time.sleep(2.0)
        page.click("#notas")
        page.type("#notas", "Quero testar o useForm!", delay=55)
        time.sleep(2.5)

        # 4 — submit: first blocked (clear notes), then success
        step(4, 2.5)
        page.fill("#notas", "")
        page.click("button[type=submit]")
        time.sleep(3.0)  # blocked: errors marked, submitCount++
        page.click("#notas")
        page.type("#notas", "Quero testar o useForm!", delay=55)
        page.click("button[type=submit]")
        time.sleep(3.5)  # success message + reset

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
