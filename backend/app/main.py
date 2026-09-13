import asyncio
from collections import defaultdict
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

from .config import settings
from .gemini_orchestrator import orchestrator
from .mcp_client import mcp_client
from .schemas import ChatRequest, ChatResponse, EndSessionRequest
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
current_dir = Path(__file__).resolve().parent.parent.parent
frontend_dist = current_dir / "frontend" / "dist"
static_dir = current_dir / "static"

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="dist-assets")
    if (frontend_dist / "icons").exists():
        app.mount("/icons", StaticFiles(directory=str(frontend_dist / "icons")), name="dist-icons")
elif (current_dir / "frontend" / "public" / "icons").exists():
    app.mount("/icons", StaticFiles(directory=str(current_dir / "frontend" / "public" / "icons")), name="public-icons")

if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/manifest.webmanifest")
@app.get("/manifest.json")
async def serve_manifest():
    """Serves PWA Web App Manifest"""
    for p in [frontend_dist / "manifest.webmanifest", current_dir / "frontend" / "public" / "manifest.webmanifest"]:
        if p.exists():
            return FileResponse(str(p), media_type="application/manifest+json")
    raise HTTPException(status_code=404, detail="Manifest not found")

@app.get("/sw.js")
async def serve_sw():
    """Serves PWA Service Worker with Service-Worker-Allowed header"""
    for p in [frontend_dist / "sw.js", current_dir / "frontend" / "public" / "sw.js"]:
        if p.exists():
            return FileResponse(
                str(p),
                media_type="application/javascript",
                headers={
                    "Service-Worker-Allowed": "/",
                    "Cache-Control": "no-cache"
                }
            )
    raise HTTPException(status_code=404, detail="Service worker not found")

@app.get("/favicon.svg")
async def serve_favicon():
    """Serves SVG Favicon"""
    for p in [frontend_dist / "favicon.svg", current_dir / "frontend" / "public" / "favicon.svg"]:
        if p.exists():
            return FileResponse(str(p), media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Favicon not found")

@app.get("/api/customers")
async def get_customers():
    """Returns list of real customers in the SQLite database"""
    return mcp_client.get_real_customer_list(limit=10)

@app.get("/api/bank/state")
async def get_bank_state(user_id: str = "C001"):
    """Returns real accounts, balances, credit card debts, and audited transactions from SQLite"""
    return mcp_client.get_real_customer_state(user_id)

@app.get("/api/bank/transactions")
async def get_bank_transactions(
    user_id: str = "C001",
    category: str = "",
    merchant: str = "",
    date: str = "",
    month: str = "",
    period: str = "",
    search: str = "",
    target_amount: Optional[float] = None,
    limit: int = 50
):
    """Returns filtered audited transactions from SQLite for interactive widget drill-downs"""
    effective_month = month or period
    items = mcp_client.get_filtered_transactions(
        customer_id=user_id,
        category=category,
        merchant=merchant,
        date_str=date,
        month=effective_month,
        search=search,
        target_amount=target_amount,
        limit=limit
    )
    total_val = round(sum(abs(item["amount"]) for item in items), 2)
    return {
        "user_id": user_id,
        "category": category,
        "month": effective_month or (date[:7] if date else "2026-09"),
        "count": len(items),
        "total_amount": total_val,
        "transactions": items
    }

@app.post("/api/bank/reset")
async def reset_bank_state():
    """Resets mock banking accounts, debts and balances to initial state"""
    result = mcp_client.reset_database()
    return result

@app.get("/api/user/cognitive-profile")
async def get_cognitive_profile(user_id: str = "C001"):
    """Returns the persistent cognitive profile and recorded friction logs for this customer"""
    profile = mcp_client.get_user_cognitive_profile(user_id)
    return profile

@app.post("/api/chat/end-session")
async def end_session(request: EndSessionRequest):
    """Summarizes conversation, registers friction events, and updates cognitive memory profile"""
    result = await orchestrator.summarize_and_close_session(request.user_id, request.history)
    return result

@app.get("/api/chat/history")
async def get_chat_history(user_id: str = "C001", limit: int = 50):
    """Returns persistent sanitized chat history for the customer"""
    history = mcp_client.get_chat_history(user_id, limit=limit)
    return {
        "customer_id": user_id,
        "count": len(history),
        "history": history
    }

@app.delete("/api/chat/history")
async def clear_chat_history(user_id: str = "C001"):
    """Purges chat history for a customer (right to be forgotten / session reset)"""
    result = mcp_client.clear_chat_history(user_id)
    return result

# 7. CROSS-DEVICE CLOUD DASHBOARD SYNCHRONIZATION
dashboard_subscribers: Dict[str, List[asyncio.Queue]] = defaultdict(list)

@app.post("/api/dashboard/widgets")
async def pin_dashboard_widget(request: Request):
    """
    Called by mobile app when user taps 'Enviar a Dashboard Web'.
    Saves widget in SQLite and broadcasts to all connected desktop dashboards in real-time.
    """
    body = await request.json()
    user_id = body.get("user_id") or "C001"
    widget = body.get("widget") or {}
    if not widget:
        raise HTTPException(status_code=400, detail="Widget payload required")

    saved_widget = mcp_client.save_dashboard_widget(user_id, widget)

    # Real-time push to all connected desktop subscribers for this user
    queues = dashboard_subscribers.get(user_id, [])
    for q in list(queues):
        try:
            await q.put(saved_widget)
        except Exception:
            pass

    return {"status": "success", "widget": saved_widget}

@app.get("/api/dashboard/widgets")
async def get_dashboard_widgets(user_id: str = "C001"):
    """Returns all pinned dashboard widgets for customer stored in cloud SQLite"""
    widgets = mcp_client.get_dashboard_widgets(user_id)
    return {
        "user_id": user_id,
        "count": len(widgets),
        "widgets": widgets
    }

@app.delete("/api/dashboard/widgets")
async def delete_dashboard_widget(user_id: str = "C001", widget_id: Optional[str] = None):
    """Removes a pinned widget or clears all widgets for customer"""
    if widget_id:
        mcp_client.delete_dashboard_widget(user_id, widget_id)
    else:
        mcp_client.clear_dashboard_widgets(user_id)
    return {"status": "success"}

@app.get("/api/dashboard/events")
async def dashboard_events(user_id: str = "C001"):
    """
    Server-Sent Events (SSE) stream for Desktop Dashboard.
    Enables instant cross-device projection when mobile phone pins a widget.
    """
    async def event_generator():
        q: asyncio.Queue = asyncio.Queue()
        dashboard_subscribers[user_id].append(q)
        try:
            yield {
                "event": "connected",
                "data": json.dumps({"status": "ready", "user_id": user_id})
            }
            while True:
                try:
                    widget = await asyncio.wait_for(q.get(), timeout=20.0)
                    yield {
                        "event": "widget",
                        "data": json.dumps(widget, ensure_ascii=False)
                    }
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat for cloud proxies / load balancers
                    yield {
                        "event": "ping",
                        "data": "{}"
                    }
        finally:
            if q in dashboard_subscribers[user_id]:
                dashboard_subscribers[user_id].remove(q)

    return EventSourceResponse(event_generator())


from fastapi.responses import FileResponse, RedirectResponse

def is_mobile_user_agent(user_agent: str) -> bool:
    ua = (user_agent or "").lower()
    mobile_indicators = [
        "android", "webos", "iphone", "ipad", "ipod", "blackberry",
        "iemobile", "opera mini", "mobile", "silk", "kindle"
    ]
    return any(ind in ua for ind in mobile_indicators)

@app.get("/")
async def serve_index(request: Request):
    """
    Root route '/':
    - Mobile: default experience (serves mobile banking directly at '/')
    - PC / Desktop: redirects to '/dashboard'
    """
    user_agent = request.headers.get("user-agent", "")
    if not is_mobile_user_agent(user_agent):
        return RedirectResponse(url="/dashboard", status_code=302)

    # On Mobile, serve index.html directly at '/'
    if frontend_dist.exists():
        dist_index = frontend_dist / "index.html"
        if dist_index.exists():
            return FileResponse(str(dist_index))
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {
        "message": "Banorte Orchestrator API is online.",
        "docs": "/docs",
        "chat_endpoint": "POST /api/chat"
    }

@app.get("/dashboard")
async def serve_dashboard():
    """Serves the Banorte Desktop Dashboard for PC (React SPA)"""
    if frontend_dist.exists():
        dist_index = frontend_dist / "index.html"
        if dist_index.exists():
            return FileResponse(str(dist_index))
    portal_file = static_dir / "portal.html"
    if portal_file.exists():
        return FileResponse(str(portal_file))
    raise HTTPException(status_code=404, detail="Dashboard screen file not found")

@app.get("/display")
async def serve_display():
    """Alias to /dashboard for PC"""
    return RedirectResponse(url="/dashboard", status_code=301)

@app.get("/portal")
async def serve_portal():
    """Alias to /dashboard for PC"""
    return RedirectResponse(url="/dashboard", status_code=301)

@app.get("/mobile")
async def serve_mobile():
    """Alias to default root '/' for Mobile"""
    return RedirectResponse(url="/", status_code=301)

@app.get("/notebook")
async def serve_notebook():
    """Serves the A2UI Component Notebook (React SPA)"""
    if frontend_dist.exists():
        dist_index = frontend_dist / "index.html"
        if dist_index.exists():
            return FileResponse(str(dist_index))
    return RedirectResponse(url="/", status_code=302)
