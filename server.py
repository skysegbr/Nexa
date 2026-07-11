#!/usr/bin/env python3
"""
Nexa dev server with live reload.

Usage:
  python server.py                    # port 8000, localhost only
  python server.py 3000               # custom port
  python server.py --host 0.0.0.0     # expose on the network (e.g. to test
                                      # on a phone) — the whole repo becomes
                                      # readable on the LAN, use with care

Serves the current directory via HTTP and sends an SSE event to all
connected browsers whenever a .js/.css/.html/.json file changes.
The browser client (dist/nexa-hmr.js) listens for that event and reloads the page.

Binds to 127.0.0.1 by default so the served directory (including dotfiles
and Git metadata) is never exposed to the local network by accident.

No external dependencies — standard Python 3 library only.
"""

import argparse
import http.server
import json
import threading
import time
from pathlib import Path

import socket

def _find_free_port(start: int) -> int:
    port = start
    while port < 65535:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
        port += 1
    raise OSError("No free port found")

_parser = argparse.ArgumentParser(description="Nexa dev server with live reload.")
_parser.add_argument("port", nargs="?", type=int, default=None,
                     help="port to listen on (default: first free port from 8000)")
_parser.add_argument("--host", default="127.0.0.1",
                     help="interface to bind (default: 127.0.0.1; "
                          "use 0.0.0.0 to expose on the network)")
_args = _parser.parse_args()
HOST = _args.host
PORT = _args.port if _args.port is not None else _find_free_port(8000)
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
    with _Server((HOST, PORT), _Handler) as httpd:
        print(f"[Nexa HMR] http://localhost:{PORT}", flush=True)
        if HOST not in ("127.0.0.1", "localhost"):
            print(f"[Nexa HMR] WARNING: bound to {HOST} — the whole directory "
                  "is reachable from the network", flush=True)
        print("[Nexa HMR] add to your HTML (dev only):", flush=True)
        print('[Nexa HMR]   <script src="/dist/nexa-hmr.js"></script>', flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Nexa HMR] server stopped", flush=True)
