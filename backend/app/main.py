import json
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

from .config import settings
from .gemini_orchestrator import orchestrator
from .mcp_client import mcp_client
from .schemas import ChatRequest, ChatResponse
from .tools_registry import TOOL_DECLARATIONS

app = FastAPI(
    title="Banorte AI Conversational Banking Orchestrator",
    description="Person 3: Orchestrator & Frontend Shell Integrator connecting FastMCP banking data to A2UI React components",
    version=settings.app_version
)

# Enable CORS for local development (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. ORCHESTRATOR CHAT ENDPOINT (JSON)
@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main communication highway endpoint:
    Takes user input or A2UI component action context,
    runs the Gemini tool-calling loop over MCP banking tools,
    and returns a narrative reply plus an A2UI component payload.
    """
    try:
        response = await orchestrator.orchestrate(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in orchestrator loop: {str(e)}")

# 2. ORCHESTRATOR STREAMING SSE ENDPOINT
@app.post("/api/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """
    Server-Sent Events (SSE) streaming endpoint:
    Yields live tokens, MCP execution logs, and A2UI JSON payload.
    """
    async def event_generator():
        async for item in orchestrator.stream_orchestrate(request):
            yield {
                "event": item["event"],
                "data": json.dumps(item["data"], ensure_ascii=False)
            }

    return EventSourceResponse(event_generator())

# 3. HEALTH & STATUS
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "gemini_model": settings.gemini_model,
        "has_gemini_key": bool(settings.gemini_api_key),
        "mcp_server_url": settings.mcp_server_url,
        "mcp_connected": mcp_client.is_connected
    }

# 4. TOOLS REGISTRY INSPECTION
@app.get("/api/tools")
async def get_tools():
    """Returns the tools exposed to Gemini (Person 1 MCP + Person 2 A2UI)"""
    return {
        "count": len(TOOL_DECLARATIONS),
        "tools": TOOL_DECLARATIONS
    }

# 5. MCP CONNECTION STATUS
@app.get("/api/mcp/status")
async def mcp_status():
    return {
        "url": settings.mcp_server_url,
        "connected": mcp_client.is_connected,
        "mock_fallback_active": not mcp_client.is_connected
    }

# 6. STATIC FILES & ROOT SPA SERVING
# Base directory pointing to static frontend assets
current_dir = Path(__file__).resolve().parent.parent.parent
static_dir = current_dir / "static"
if not static_dir.exists():
    static_dir.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/api/bank/state")
async def get_bank_state():
    """Returns current financial state from the mock bank DB for real-time live sync"""
    user_id = settings.default_user_id
    user_data = mcp_client._mock_db.get(user_id, mcp_client._mock_db["USR-BANORTE-8842"])
    return {
        "user_id": user_id,
        "client_name": user_data["client_name"],
        "accounts": user_data["accounts"],
        "restructures": user_data.get("restructures", [])
    }

@app.get("/")
async def serve_index():
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {
        "message": "Banorte Orchestrator API is online.",
        "docs": "/docs",
        "chat_endpoint": "POST /api/chat"
    }

@app.get("/mobile")
async def serve_mobile():
    mobile_file = static_dir / "mobile.html"
    if mobile_file.exists():
        return FileResponse(str(mobile_file))
    raise HTTPException(status_code=404, detail="Mobile screen file not found")

@app.get("/portal")
async def serve_portal():
    portal_file = static_dir / "portal.html"
    if portal_file.exists():
        return FileResponse(str(portal_file))
    raise HTTPException(status_code=404, detail="Portal screen file not found")
