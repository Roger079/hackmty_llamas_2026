import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Banorte AI Orchestrator"
    app_version: str = "1.0.0"
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    mcp_server_url: str = os.getenv("MCP_SERVER_URL", "http://localhost:8001/mcp")
    default_user_id: str = os.getenv("DEFAULT_USER_ID", "USR-BANORTE-8842")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
