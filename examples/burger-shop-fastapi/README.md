# Nexa Burger Shop — FastAPI backend

Same ordering flow as [`examples/burger-shop`](../burger-shop) (menu,
cart/checkout, order tracking, admin panel with product CRUD + image
upload), but backed by a real **FastAPI + SQLModel + SQLite** app instead of
a dependency-free `http.server` script — for when you want the pattern this
app would actually ship with in production.

Unlike the rest of `examples/`, this one has its own dependencies (managed
with [`uv`](https://docs.astral.sh/uv/)):

```bash
cd examples/burger-shop-fastapi
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# or: ./run.sh
```

Open:

```text
http://localhost:8000/
```

`app/main.py` mounts the monorepo's own `dist/` at `/dist`, so the frontend
imports `/dist/nexa.js` and `/dist/nexa-components.js` directly — no CDN,
no copy of the framework living inside the example.

```text
GET    /api/produtos/                    list (filters: categoria, apenas_ativos)
GET    /api/produtos/:id                 get one
POST   /api/produtos/                    create
PATCH  /api/produtos/:id                 partial update
DELETE /api/produtos/:id                 delete
POST   /api/produtos/:id/imagem          upload image (multipart/form-data)
GET    /api/pedidos/                     list (filter: status)
GET    /api/pedidos/:id                  get one
POST   /api/pedidos/                     create
PATCH  /api/pedidos/:id/status           update status
```

## Structure

Frontend is identical to `examples/burger-shop` — same
domain-componentized layout, same `EmptyMessage`/`StatusBadge` extraction
for CSS reused by 2+ components (see that example's README for the
rationale). Only the backend differs:

```text
app/
  main.py           — FastAPI app, CORS, static/dist mounts, SPA fallback
  database.py       — SQLModel engine (SQLite file: burguer.db)
  models.py         — Produto / Pedido / ItemPedido SQLModel tables
  seed.py           — seeds the product catalog on first run
  routers/
    produtos.py     — CRUD + image upload
    pedidos.py      — create, list, status transitions
static/             — same frontend as examples/burger-shop
```

`burguer.db`, `.venv/`, and `static/uploads/*` are gitignored — they're
generated at runtime.
