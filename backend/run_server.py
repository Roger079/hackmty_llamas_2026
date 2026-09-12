"""
FastAPI Server Launcher for Banorte AI Orchestrator (Person 3)
Run with: python backend/run_server.py
"""
import sys
import uvicorn
from pathlib import Path

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.config import settings

if __name__ == "__main__":
    print("============================================================")
    print("  BANORTE AI CONVERSATIONAL BANKING ORCHESTRATOR")
    print("  Person 3: Orchestrator & Frontend Shell Integrator")
    print("============================================================")
    print(f"  * Host: {settings.host}")
    print(f"  * Port: {settings.port}")
    print(f"  * MCP Target: {settings.mcp_server_url}")
    print(f"  * Gemini Model: {settings.gemini_model}")
    print(f"  * Gemini Key Present: {bool(settings.gemini_api_key)}")
    print(f"  * Web UI: http://localhost:{settings.port}")
    print(f"  * API Docs: http://localhost:{settings.port}/docs")
    print("============================================================")

    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=False
    )
