#!/usr/bin/env bash
# Inicia o servidor de desenvolvimento
cd "$(dirname "$0")"
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
