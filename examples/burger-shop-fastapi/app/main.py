from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from .database import create_db_and_tables
from .seed import seed
from .routers import produtos, pedidos

# Repo root — three levels up from app/main.py (app/ -> burger-shop-fastapi/ -> examples/ -> Nexa/).
# Mounted read-only so the frontend can import "/dist/nexa.js" straight from
# the monorepo's build output, same as every other examples/* page.
NEXA_DIST = Path(__file__).resolve().parents[3] / "dist"


@asynccontextmanager
async def lifespan(app):
    create_db_and_tables()
    seed()
    yield


app = FastAPI(title="Burguer API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(produtos.router, prefix="/api")
app.include_router(pedidos.router, prefix="/api")

# ─── Static files ────────────────────────────────────────────────────────────
os.makedirs("static/uploads", exist_ok=True)
app.mount("/dist", StaticFiles(directory=str(NEXA_DIST)), name="dist")
app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── SPA fallback — serve index.html para qualquer rota desconhecida ─────────
@app.get("/{full_path:path}", include_in_schema=False)
async def spa_fallback(full_path: str):
    return FileResponse("static/index.html")
