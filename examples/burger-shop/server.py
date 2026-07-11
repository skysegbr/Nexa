"""
Nexa Burger Shop — pure Python backend (no external dependencies).
Run: python3 examples/burger-shop/server.py
REST API at http://localhost:5051

DEMO ONLY — NOT FOR PRODUCTION. In-memory store, no authentication, no
input hardening. It exists to exercise the Nexa frontend; serves on
localhost only.
"""

from __future__ import annotations

import json
import mimetypes
import re
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

# ---------------------------------------------------------------------------
# In-memory store
# ---------------------------------------------------------------------------

PRODUTOS: list[dict[str, Any]] = [
    {
        "id": 1, "nome": "Classic Burger",
        "descricao": "Pão brioche, blend 180g, queijo cheddar, alface, tomate e maionese especial",
        "preco": 28.90, "categoria": "lanche", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    },
    {
        "id": 2, "nome": "Double Smash",
        "descricao": "Dois smash patties 90g, queijo americano duplo, cebola caramelizada e molho secreto",
        "preco": 36.90, "categoria": "lanche", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
    },
    {
        "id": 3, "nome": "Bacon Extreme",
        "descricao": "Blend 200g, bacon crocante, queijo prato, barbecue defumado e cebola crispy",
        "preco": 39.90, "categoria": "lanche", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&q=80",
    },
    {
        "id": 4, "nome": "Veggie Delight",
        "descricao": "Hambúrguer de grão-de-bico, rúcula, tomate seco, brie e pesto de manjericão",
        "preco": 32.90, "categoria": "lanche", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80",
    },
    {
        "id": 5, "nome": "Frango Crispy",
        "descricao": "Frango empanado crocante, coleslaw, picles e maionese de mel mostarda",
        "preco": 31.90, "categoria": "lanche", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80",
    },
    {
        "id": 6, "nome": "BBQ Texano",
        "descricao": "Blend defumado 220g, anéis de cebola, queijo gouda, barbecue artesanal",
        "preco": 42.90, "categoria": "lanche", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80",
    },
    {
        "id": 7, "nome": "Batata Frita Clássica",
        "descricao": "Batatas palito crocantes com sal e páprica defumada",
        "preco": 14.90, "categoria": "acompanhamento", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
    },
    {
        "id": 8, "nome": "Onion Rings",
        "descricao": "Anéis de cebola empanados com massa crocante e molho aioli",
        "preco": 16.90, "categoria": "acompanhamento", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80",
    },
    {
        "id": 9, "nome": "Batata Rústica",
        "descricao": "Batata com casca assada com ervas finas e alho",
        "preco": 15.90, "categoria": "acompanhamento", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600&q=80",
    },
    {
        "id": 10, "nome": "Refrigerante Lata",
        "descricao": "Coca-Cola, Guaraná ou Sprite — lata 350ml",
        "preco": 7.90, "categoria": "bebida", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
    },
    {
        "id": 11, "nome": "Milk Shake Artesanal",
        "descricao": "Chocolate, morango ou baunilha — 400ml com chantilly",
        "preco": 22.90, "categoria": "bebida", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80",
    },
    {
        "id": 12, "nome": "Suco Natural",
        "descricao": "Laranja, limão ou maracujá — 500ml",
        "preco": 12.90, "categoria": "bebida", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80",
    },
    {
        "id": 13, "nome": "Água Mineral",
        "descricao": "Garrafa 500ml — com ou sem gás",
        "preco": 5.90, "categoria": "bebida", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
    },
    {
        "id": 14, "nome": "Brownie com Sorvete",
        "descricao": "Brownie quentinho de chocolate com sorvete de creme e calda quente",
        "preco": 19.90, "categoria": "sobremesa", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80",
    },
    {
        "id": 15, "nome": "Cookie Artesanal",
        "descricao": "Cookie de chocolate com gotas de chocolate meio amargo — unidade",
        "preco": 9.90, "categoria": "sobremesa", "ativo": True,
        "imagem_url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    },
]

PEDIDOS: list[dict[str, Any]] = []

STATUSES_VALIDOS = ("recebido", "preparo", "pronto", "entregue", "cancelado")

_next_produto_id = len(PRODUTOS) + 1
_next_pedido_id = 1
_next_item_id = 1

ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def _produto_by_id(produto_id: int) -> dict[str, Any] | None:
    return next((p for p in PRODUTOS if p["id"] == produto_id), None)


def _pedido_by_id(pedido_id: int) -> dict[str, Any] | None:
    return next((p for p in PEDIDOS if p["id"] == pedido_id), None)


# ---------------------------------------------------------------------------
# multipart/form-data — minimal parser (no external deps, no `cgi` module)
# ---------------------------------------------------------------------------

def parse_multipart(content_type: str, body: bytes) -> tuple[dict[str, str], dict[str, dict[str, Any]]]:
    boundary_match = re.search(r'boundary="?([^";]+)"?', content_type)
    if not boundary_match:
        return {}, {}
    boundary = ("--" + boundary_match.group(1)).encode()

    fields: dict[str, str] = {}
    files: dict[str, dict[str, Any]] = {}

    for chunk in body.split(boundary):
        chunk = chunk.strip(b"\r\n")
        if not chunk or chunk == b"--":
            continue
        if b"\r\n\r\n" not in chunk:
            continue
        header_blob, content = chunk.split(b"\r\n\r\n", 1)
        content = content[:-2] if content.endswith(b"\r\n") else content
        headers = header_blob.decode("utf-8", errors="replace")

        name_match = re.search(r'name="([^"]+)"', headers)
        if not name_match:
            continue
        name = name_match.group(1)

        filename_match = re.search(r'filename="([^"]*)"', headers)
        if filename_match and filename_match.group(1):
            content_type_match = re.search(r"Content-Type:\s*(\S+)", headers, re.IGNORECASE)
            files[name] = {
                "filename": filename_match.group(1),
                "content_type": content_type_match.group(1) if content_type_match else "application/octet-stream",
                "content": content,
            }
        else:
            fields[name] = content.decode("utf-8", errors="replace")

    return fields, files


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        print(f"[{self.address_string()}] {format % args}")

    # ------------------------------------------------------------------
    def _send(self, status: int, body: Any, extra_headers: dict | None = None) -> None:
        payload = b"" if body == "" else json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        if payload:
            self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    def _read_body(self) -> bytes:
        length = int(self.headers.get("Content-Length", 0))
        return self.rfile.read(length) if length else b""

    def _read_json(self) -> Any:
        raw = self._read_body()
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
        self.send_response(308)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()

    # ------------------------------------------------------------------
    def do_GET(self) -> None:
        raw_path = self._parsed_url().path

        if raw_path in {"/", "/examples/burger-shop"}:
            self._redirect("/examples/burger-shop/")
            return

        path = raw_path.rstrip("/")
        q = self._query()

        if path == "/api/produtos":
            apenas_ativos = q.get("apenas_ativos", "true") != "false"
            produtos = list(PRODUTOS)
            if apenas_ativos:
                produtos = [p for p in produtos if p["ativo"]]
            categoria = q.get("categoria")
            if categoria:
                produtos = [p for p in produtos if p["categoria"] == categoria]
            produtos.sort(key=lambda p: (p["categoria"], p["nome"]))
            self._send(200, produtos)
            return

        if path.startswith("/api/produtos/"):
            produto_id = int(path.removeprefix("/api/produtos/"))
            produto = _produto_by_id(produto_id)
            if not produto:
                self._send(404, {"detail": "Produto não encontrado"})
                return
            self._send(200, produto)
            return

        if path == "/api/pedidos":
            pedidos = list(PEDIDOS)
            status = q.get("status")
            if status:
                pedidos = [p for p in pedidos if p["status"] == status]
            pedidos.sort(key=lambda p: p["criado_em"], reverse=True)
            self._send(200, pedidos)
            return

        if path.startswith("/api/pedidos/"):
            pedido_id = int(path.removeprefix("/api/pedidos/"))
            pedido = _pedido_by_id(pedido_id)
            if not pedido:
                self._send(404, {"detail": "Pedido não encontrado"})
                return
            self._send(200, pedido)
            return

        self._send_static()

    # ------------------------------------------------------------------
    def do_POST(self) -> None:
        global _next_produto_id, _next_pedido_id, _next_item_id

        path = self._parsed_url().path.rstrip("/")

        if path == "/api/produtos":
            body = self._read_json()
            produto = {
                "id": _next_produto_id,
                "nome": body.get("nome", ""),
                "descricao": body.get("descricao", ""),
                "preco": body.get("preco", 0),
                "categoria": body.get("categoria", "lanche"),
                "imagem_url": body.get("imagem_url", ""),
                "ativo": body.get("ativo", True),
            }
            _next_produto_id += 1
            PRODUTOS.append(produto)
            self._send(201, produto)
            return

        if re.fullmatch(r"/api/produtos/\d+/imagem", path):
            produto_id = int(path.split("/")[3])
            produto = _produto_by_id(produto_id)
            if not produto:
                self._send(404, {"detail": "Produto não encontrado"})
                return

            content_type = self.headers.get("Content-Type", "")
            _fields, files = parse_multipart(content_type, self._read_body())
            file = files.get("file")
            if not file or file["content_type"] not in ("image/jpeg", "image/png", "image/webp"):
                self._send(400, {"detail": "Formato inválido. Use JPEG, PNG ou WebP."})
                return

            ext = file["filename"].rsplit(".", 1)[-1] if "." in file["filename"] else "jpg"
            filename = f"{uuid.uuid4().hex}.{ext}"
            (UPLOAD_DIR / filename).write_bytes(file["content"])

            produto["imagem_url"] = f"/examples/burger-shop/uploads/{filename}"
            self._send(200, produto)
            return

        if path == "/api/pedidos":
            body = self._read_json()
            itens_payload = body.get("itens") or []
            if not itens_payload:
                self._send(422, {"detail": "O pedido deve ter ao menos 1 item"})
                return

            itens = []
            total = 0.0
            for item in itens_payload:
                produto = _produto_by_id(item["produto_id"])
                if not produto or not produto["ativo"]:
                    self._send(404, {"detail": f"Produto {item['produto_id']} não encontrado ou inativo"})
                    return
                quantidade = item["quantidade"]
                itens.append({
                    "id": _next_item_id,
                    "produto_id": produto["id"],
                    "quantidade": quantidade,
                    "preco_unitario": produto["preco"],
                    "produto": produto,
                })
                _next_item_id += 1
                total += produto["preco"] * quantidade

            pedido = {
                "id": _next_pedido_id,
                "nome_cliente": body.get("nome_cliente", ""),
                "observacao": body.get("observacao", ""),
                "status": "recebido",
                "total": round(total, 2),
                "criado_em": datetime.now(timezone.utc).isoformat(),
                "itens": itens,
            }
            _next_pedido_id += 1
            PEDIDOS.append(pedido)
            self._send(201, pedido)
            return

        self._send(404, {"detail": "Not found"})

    # ------------------------------------------------------------------
    def do_PATCH(self) -> None:
        path = self._parsed_url().path.rstrip("/")

        if path.startswith("/api/produtos/"):
            produto_id = int(path.removeprefix("/api/produtos/"))
            produto = _produto_by_id(produto_id)
            if not produto:
                self._send(404, {"detail": "Produto não encontrado"})
                return
            body = self._read_json()
            for key in ("nome", "descricao", "preco", "categoria", "imagem_url", "ativo"):
                if key in body:
                    produto[key] = body[key]
            self._send(200, produto)
            return

        if re.fullmatch(r"/api/pedidos/\d+/status", path):
            pedido_id = int(path.split("/")[3])
            pedido = _pedido_by_id(pedido_id)
            if not pedido:
                self._send(404, {"detail": "Pedido não encontrado"})
                return
            body = self._read_json()
            status = body.get("status")
            if status not in STATUSES_VALIDOS:
                self._send(422, {"detail": f"Status inválido: {status}"})
                return
            pedido["status"] = status
            self._send(200, pedido)
            return

        self._send(404, {"detail": "Not found"})

    # ------------------------------------------------------------------
    def do_DELETE(self) -> None:
        path = self._parsed_url().path.rstrip("/")

        if path.startswith("/api/produtos/"):
            produto_id = int(path.removeprefix("/api/produtos/"))
            produto = _produto_by_id(produto_id)
            if not produto:
                self._send(404, {"detail": "Produto não encontrado"})
                return
            PRODUTOS.remove(produto)
            self._send(204, "")
            return

        self._send(404, {"detail": "Not found"})

    # ------------------------------------------------------------------
    def _send_static(self) -> None:
        raw_path = self._parsed_url().path
        request_path = "/assets/nexa-logo-dark-bg.png" if raw_path == "/favicon.ico" else raw_path

        if request_path.endswith("/"):
            request_path += "index.html"

        rel_path = request_path.lstrip("/")
        target = (ROOT / rel_path).resolve()

        if not target.is_file() or ROOT not in target.parents:
            self._send(404, {"detail": "Not found"})
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


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    server = ReusableHTTPServer(("127.0.0.1", 5051), Handler)
    print("Burger Shop example running at http://localhost:5051/examples/burger-shop/")
    print("Burger Shop API running at http://localhost:5051")
    print("Endpoints:")
    print("  GET    /api/produtos                    list (filters: categoria, apenas_ativos)")
    print("  GET    /api/produtos/:id                get one")
    print("  POST   /api/produtos                    create")
    print("  PATCH  /api/produtos/:id                 partial update")
    print("  DELETE /api/produtos/:id                 delete")
    print("  POST   /api/produtos/:id/imagem          upload image (multipart/form-data)")
    print("  GET    /api/pedidos                      list (filter: status)")
    print("  GET    /api/pedidos/:id                   get one")
    print("  POST   /api/pedidos                      create")
    print("  PATCH  /api/pedidos/:id/status            update status")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
