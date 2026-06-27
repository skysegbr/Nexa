# Nexa Task Manager

Advanced Nexa example with a local Python API, filters, stats, drawer editing,
dropdown actions, confirmation dialog, toast feedback, and pagination.

Run it from the repository root:

```bash
python3 examples/task-manager/server.py
```

Open:

```text
http://localhost:5050/examples/task-manager/
```

The server serves both the frontend files and the API routes:

```text
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/stats
GET    /api/categories
```
