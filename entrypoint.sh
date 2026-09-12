#!/bin/bash
set -e

# Iniciar servidor FastMCP bancario en segundo plano (puerto interno 8001)
echo ">> Iniciando FastMCP Banking Server en localhost:8001..."
python backend/mcp_server_mock.py --port 8001 &

# Esperar 2 segundos para asegurar disponibilidad de FastMCP
sleep 2

# Iniciar FastAPI Orchestrator en el puerto provisto por Cloud Run ($PORT o 8080)
PORT_TO_USE="${PORT:-8080}"
echo ">> Iniciando Banorte Orchestrator en el puerto $PORT_TO_USE..."
exec python -m uvicorn backend.app.main:app --host 0.0.0.0 --port "$PORT_TO_USE"
