#!/usr/bin/env python3
"""
Nexa dev server with live reload.

Usage:
  python server.py          # port 8000
  python server.py 3000     # custom port

Serves the current directory via HTTP and sends an SSE event to all
connected browsers whenever a .js/.css/.html/.json file changes.
The browser client (dist/nexa-hmr.js) listens for that event and reloads the page.

No external dependencies — standard Python 3 library only.
"""

import http.server
import json
import sys
import threading
import time
from pathlib import Path

import socket

def _find_free_port(start: int) -> int:
    port = start
    while port < 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("", port)) != 0:
                return port
        port += 1
    raise OSError("No free port found")

_requested_port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
PORT = _requested_port if len(sys.argv) > 1 else _find_free_port(_requested_port)
WATCH_EXTENSIONS = {".js", ".css", ".html", ".json"}
POLL_INTERVAL = 0.5
SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".cache"}

# Thread-safe list of active SSE response writers.
_clients = []
_clients_lock = threading.Lock()


def _broadcast(path):
    payload = json.dumps({"type": "reload", "path": str(path)})
    message = f"data: {payload}\n\n".encode()
    with _clients_lock:
        for send in list(_clients):
            try:
                send(message)
            except Exception:
                pass


def _watch():
    mtimes = {}
    root = Path(".")
    while True:
        for f in root.rglob("*"):
            if f.suffix not in WATCH_EXTENSIONS:
                continue
            if any(part in SKIP_DIRS for part in f.parts):
                continue
            try:
                mtime = f.stat().st_mtime
            except OSError:
                continue
            prev = mtimes.get(f)
            if prev is not None and prev != mtime:
                print(f"[Nexa HMR] changed: {f}", flush=True)
                _broadcast(f)
            mtimes[f] = mtime
        time.sleep(POLL_INTERVAL)


class _Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?")[0] == "/_hmr":
            self._serve_sse()
            return
        super().do_GET()

    def _serve_sse(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        def send(data):
            self.wfile.write(data)
            self.wfile.flush()

        with _clients_lock:
            _clients.append(send)

        try:
            # Keep-alive ping every second so the browser doesn't time out.
            while True:
                time.sleep(1)
                self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except Exception:
            pass
        finally:
            with _clients_lock:
                try:
                    _clients.remove(send)
                except ValueError:
                    pass

    def log_message(self, fmt, *args):
        # Suppress the noisy per-ping SSE log lines.
        if args and "/_hmr" in str(args[0]):
            return
        super().log_message(fmt, *args)


class _Server(http.server.ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        # BrokenPipeError / ConnectionResetError happen when the browser closes
        # a connection before the server finishes sending (normal with HTTP/1.1
        # keep-alive, browser prefetch, or navigating away mid-response).
        # They are harmless — suppress them to keep the terminal clean.
        import sys
        if sys.exc_info()[0] in (BrokenPipeError, ConnectionResetError):
            return
        super().handle_error(request, client_address)


if __name__ == "__main__":
    threading.Thread(target=_watch, daemon=True).start()
    with _Server(("", PORT), _Handler) as httpd:
        print(f"[Nexa HMR] http://localhost:{PORT}", flush=True)
        print("[Nexa HMR] add to your HTML (dev only):", flush=True)
        print('[Nexa HMR]   <script src="/dist/nexa-hmr.js"></script>', flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Nexa HMR] server stopped", flush=True)
