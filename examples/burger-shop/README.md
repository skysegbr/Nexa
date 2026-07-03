# Nexa Burger Shop

A multi-page ordering flow example (menu, cart/checkout, order tracking,
admin panel with product + order management) served by a local Python API.
No external dependencies — the backend is `http.server` from the standard
library, same pattern as [`examples/task-manager`](../task-manager).

Run it from the repository root:

```bash
python3 examples/burger-shop/server.py
```

Open:

```text
http://localhost:5051/examples/burger-shop/
```

The server serves both the frontend files and the API routes:

```text
GET    /api/produtos                    list (filters: categoria, apenas_ativos)
GET    /api/produtos/:id                get one
POST   /api/produtos                    create
PATCH  /api/produtos/:id                partial update
DELETE /api/produtos/:id                delete
POST   /api/produtos/:id/imagem         upload image (multipart/form-data)
GET    /api/pedidos                     list (filter: status)
GET    /api/pedidos/:id                 get one
POST   /api/pedidos                     create
PATCH  /api/pedidos/:id/status          update status
```

## Structure

Domain-componentized per [`docs/AI_SPEC.md`](../../docs/AI_SPEC.md) §12 —
one component per file, CSS paired next to its component, static data
in `data.js`, `app.js` only orchestrates:

```text
components/
  ToastCtx.js                 — cross-cutting toast context
  TopBar.js / .css
  CardapioPage.js / .css      — menu browsing
  PedidoPage.js / .css        — cart + checkout
  AcompanharPage.js           — order tracking (no page-specific CSS beyond shared classes)
  EmptyMessage.js / .css      — reused by CardapioPage, PedidoPage, AdminPedidos
  StatusBadge.js / .css       — reused by AcompanharPage, AdminPedidos
  admin/
    AdminPage.js / .css
    AdminProdutos.js / .css
    AdminPedidos.js
```

`EmptyMessage` and `StatusBadge` are a deliberate example of the rule in
AI_SPEC §12: a bit of UI/CSS reused by 2+ components becomes its own
component with paired CSS — it does not sit as a floating class in the
central `styles.css`.
