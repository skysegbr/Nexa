#!/usr/bin/env bash
# Inicia o servidor de desenvolvimento.
# DEMO — não usar em produção (sem auth, sem hardening).
# Escuta só em localhost; troque para --host 0.0.0.0 se precisar acessar de
# outro dispositivo na rede.
cd "$(dirname "$0")"
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
