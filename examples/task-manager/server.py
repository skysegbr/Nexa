"""
Nexa Task Manager — pure Python backend (no external dependencies).
Run: python server.py
REST API at http://localhost:5050
"""

from __future__ import annotations

import json
import mimetypes
import time
import uuid
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------

TASKS: list[dict[str, Any]] = [
    {
        "id": "1",
        "title": "Explore the Nexa framework",
        "description": "Read the documentation and understand the available hooks.",
        "priority": "high",
        "status": "done",
        "category": "learning",
        "createdAt": int(time.time()) - 86400,
    },
    {
        "id": "2",
        "title": "Create reusable form component",
        "description": "Use useForm with validateOnBlur and setFieldError.",
        "priority": "high",
        "status": "in-progress",
        "category": "dev",
        "createdAt": int(time.time()) - 3600,
    },
    {
        "id": "3",
        "title": "Write integration tests",
        "description": "",
        "priority": "medium",
        "status": "todo",
        "category": "dev",
        "createdAt": int(time.time()) - 1800,
    },
    {
        "id": "4",
        "title": "Review colleague's pull request",
        "description": "PR #42 — refactoring of the authentication module.",
        "priority": "medium",
        "status": "todo",
        "category": "review",
        "createdAt": int(time.time()) - 600,
    },
    {
        "id": "5",
        "title": "Update project README",
        "description": "Add section about new components.",
        "priority": "low",
        "status": "todo",
        "category": "docs",
        "createdAt": int(time.time()),
    },
]

CATEGORIES = [
    {"value": "dev", "label": "Development"},
    {"value": "docs", "label": "Documentation"},
    {"value": "learning", "label": "Learning"},
    {"value": "review", "label": "Review"},
    {"value": "other", "label": "Other"},
]

STATS_CACHE: dict[str, Any] = {}
ROOT = Path(__file__).resolve().parents[2]


def compute_stats() -> dict[str, Any]:
    total = len(TASKS)
    done = sum(1 for t in TASKS if t["status"] == "done")
    in_progress = sum(1 for t in TASKS if t["status"] == "in-progress")
    todo = sum(1 for t in TASKS if t["status"] == "todo")
    by_priority = {
        "high": sum(1 for t in TASKS if t["priority"] == "high"),
        "medium": sum(1 for t in TASKS if t["priority"] == "medium"),
        "low": sum(1 for t in TASKS if t["priority"] == "low"),
    }
    completion = round((done / total * 100) if total else 0)
    return {
        "total": total,
        "done": done,
        "inProgress": in_progress,
        "todo": todo,
        "byPriority": by_priority,
        "completion": completion,
    }


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        print(f"[{self.address_string()}] {format % args}")

    # ------------------------------------------------------------------
    def _send(self, status: int, body: Any, extra_headers: dict | None = None) -> None:
        payload = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(payload)

    def _read_json(self) -> Any:
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        return json.loads(raw) if raw else {}

    def _parsed_url(self):
        return urlparse(self.path)

    def _query(self) -> dict[str, str]:
        parsed = parse_qs(self._parsed_url().query)
        return {k: v[0] for k, v in parsed.items()}

    # ------------------------------------------------------------------
    def do_OPTIONS(self) -> None:
        self._send(204, "")

    def _redirect(self, location: str) -> None:
        payload = b""
        self.send_response(308)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.send_header("Location", location)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()

    def do_GET(self) -> None:
        raw_path = self._parsed_url().path

        if raw_path in {"/", "/examples/task-manager"}:
            self._redirect("/examples/task-manager/")
            return

        path = raw_path.rstrip("/")

        if path == "/api/tasks":
            q = self._query()
            tasks = list(TASKS)

            status_filter = q.get("status")
            if status_filter and status_filter != "all":
                tasks = [t for t in tasks if t["status"] == status_filter]

            priority_filter = q.get("priority")
            if priority_filter and priority_filter != "all":
                tasks = [t for t in tasks if t["priority"] == priority_filter]

            category_filter = q.get("category")
            if category_filter and category_filter != "all":
                tasks = [t for t in tasks if t["category"] == category_filter]

            search = q.get("search", "").lower()
            if search:
                tasks = [
                    t
                    for t in tasks
                    if search in t["title"].lower()
                    or search in (t["description"] or "").lower()
                ]

            sort = q.get("sort", "createdAt")
            reverse = q.get("order", "desc") == "desc"
            tasks.sort(key=lambda t: t.get(sort, ""), reverse=reverse)

            page = int(q.get("page", 1))
            per_page = int(q.get("perPage", 10))
            total = len(tasks)
            start = (page - 1) * per_page
            self._send(
                200,
                {
                    "tasks": tasks[start : start + per_page],
                    "total": total,
                    "page": page,
                    "perPage": per_page,
                    "totalPages": max(1, -(-total // per_page)),
                },
            )
            return

        if path == "/api/stats":
            self._send(200, compute_stats())
            return

        if path == "/api/categories":
            self._send(200, CATEGORIES)
            return

        # Single task
        task_id = path.removeprefix("/api/tasks/")
        if path.startswith("/api/tasks/") and task_id:
            task = next((t for t in TASKS if t["id"] == task_id), None)
            if task:
                self._send(200, task)
            else:
                self._send(404, {"error": "Task not found"})
            return

        self._send_static()

    def do_POST(self) -> None:
        path = self._parsed_url().path.rstrip("/")

        if path == "/api/tasks":
            body = self._read_json()
            title = (body.get("title") or "").strip()
            if not title:
                self._send(400, {"error": "title is required"})
                return
            duplicate = next((t for t in TASKS if t["title"].lower() == title.lower()), None)
            if duplicate:
                self._send(409, {"error": "A task with this title already exists"})
                return
            task = {
                "id": str(uuid.uuid4())[:8],
                "title": title,
                "description": (body.get("description") or "").strip(),
                "priority": body.get("priority", "medium"),
                "status": "todo",
                "category": body.get("category", "other"),
                "createdAt": int(time.time()),
            }
            TASKS.append(task)
            self._send(201, task)
            return

        self._send(404, {"error": "Not found"})

    def _send_static(self) -> None:
        raw_path = self._parsed_url().path
        request_path = "/assets/nexa-logo-dark-bg.png" if raw_path == "/favicon.ico" else raw_path

        if request_path.endswith("/"):
            request_path += "index.html"

        rel_path = request_path.lstrip("/")
        target = (ROOT / rel_path).resolve()

        if not target.is_file() or ROOT not in target.parents:
            self._send(404, {"error": "Not found"})
            return

        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        payload = target.read_bytes()
        self.send_response(200)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_PUT(self) -> None:
        path = self._parsed_url().path.rstrip("/")
        task_id = path.removeprefix("/api/tasks/")

        if path.startswith("/api/tasks/") and task_id:
            task = next((t for t in TASKS if t["id"] == task_id), None)
            if not task:
                self._send(404, {"error": "Task not found"})
                return
            body = self._read_json()
            title = (body.get("title") or "").strip()
            if not title:
                self._send(400, {"error": "title is required"})
                return
            duplicate = next(
                (t for t in TASKS if t["title"].lower() == title.lower() and t["id"] != task_id),
                None,
            )
            if duplicate:
                self._send(409, {"error": "A task with this title already exists"})
                return
            task.update(
                {
                    "title": title,
                    "description": (body.get("description") or "").strip(),
                    "priority": body.get("priority", task["priority"]),
                    "category": body.get("category", task["category"]),
                }
            )
            self._send(200, task)
            return

        self._send(404, {"error": "Not found"})

    def do_PATCH(self) -> None:
        path = self._parsed_url().path.rstrip("/")
        task_id = path.removeprefix("/api/tasks/")

        if path.startswith("/api/tasks/") and task_id:
            task = next((t for t in TASKS if t["id"] == task_id), None)
            if not task:
                self._send(404, {"error": "Task not found"})
                return
            body = self._read_json()
            for key in ("title", "description", "priority", "status", "category"):
                if key in body:
                    task[key] = body[key]
            self._send(200, task)
            return

        self._send(404, {"error": "Not found"})

    def do_DELETE(self) -> None:
        path = self._parsed_url().path.rstrip("/")
        task_id = path.removeprefix("/api/tasks/")

        if path.startswith("/api/tasks/") and task_id:
            index = next((i for i, t in enumerate(TASKS) if t["id"] == task_id), None)
            if index is None:
                self._send(404, {"error": "Task not found"})
                return
            TASKS.pop(index)
            self._send(200, {"ok": True})
            return

        self._send(404, {"error": "Not found"})


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    server = ReusableHTTPServer(("0.0.0.0", 5050), Handler)
    print("Task Manager example running at http://localhost:5050/examples/task-manager/")
    print("Task Manager API running at http://localhost:5050")
    print("Endpoints:")
    print("  GET    /api/tasks          list (filters: status, priority, category, search, sort, order, page, perPage)")
    print("  POST   /api/tasks          create")
    print("  GET    /api/tasks/:id      get one")
    print("  PUT    /api/tasks/:id      replace")
    print("  PATCH  /api/tasks/:id      partial update")
    print("  DELETE /api/tasks/:id      delete")
    print("  GET    /api/stats          summary counts")
    print("  GET    /api/categories     list categories")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
