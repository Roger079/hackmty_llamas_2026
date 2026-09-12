from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

class ActionContext(BaseModel):
    """
    Action event emitted by Person 2's A2UI component when the user interacts
    (e.g., clicks 'Aplicar plan', 'Autorizar SPEI', etc.) and sent back
    to the agent to close the loop.
    """
    action: str = Field(..., description="Action identifier, e.g. 'commit_restructure' or 'execute_spei'")
    params: Dict[str, Any] = Field(default_factory=dict, description="Parameters selected or filled by the user")
    source_component: Optional[str] = Field(None, description="Component that emitted the action")

class A2UIPayload(BaseModel):
    """
    Declarative Agent-to-User Interface (A2UI) specification
    emitted by Gemini via the render_a2ui tool.
    """
    component: str = Field(..., description="Target Banorte UI component name, e.g. 'DebtRestructureCard'")
    props: Dict[str, Any] = Field(default_factory=dict, description="Props required by the React component")
    action_schema: Optional[Dict[str, Any]] = Field(None, description="Metadata on actions this component can fire back")

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user', 'assistant', 'system' or 'tool'")
    content: str = Field(default="", description="Text message content")
    a2ui: Optional[A2UIPayload] = Field(None, description="Attached A2UI component payload if any")

class ChatRequest(BaseModel):
    message: str = Field(default="", description="User input text")
    history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation turns")
    action_context: Optional[ActionContext] = Field(None, description="Feedback loop action from an A2UI component")
    user_id: Optional[str] = Field("C001", description="Authenticated client ID")

class McpToolCallLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any
    latency_ms: float
    timestamp: str

class ChatResponse(BaseModel):
    reply: str
    a2ui: Optional[A2UIPayload] = None
    mcp_calls: List[McpToolCallLog] = Field(default_factory=list)
    status: str = "success"

class StreamEvent(BaseModel):
    event: str  # "token", "mcp_call", "a2ui", "done", "error"
    data: Union[str, Dict[str, Any]]

class UserCognitiveProfile(BaseModel):
    user_id: str
    client_name: str = "Ana Martínez"
    memory_summary: str = Field(default="", description="Resumen consolidado de fricciones e historial previo")
    sensitivities: str = Field(default="", description="Sensibilidades específicas detectadas (ej. pagos mayores a $2,000)")
    recommended_tone: str = Field(default="Empático, directo y enfocado en liquidez", description="Tono y estilo de comunicación recomendado")
    total_friction_events: int = 0
    last_updated: str = ""

class FrictionLogItem(BaseModel):
    id: str
    user_id: str
    friction_category: str  # 'HIGH_PAYMENT_STRESS', 'INTEREST_CONFUSION', 'CANCELLED_TRANSFER', 'FEES_OBJECTION'
    trigger_message: str
    severity: str = "MEDIUM"  # 'LOW', 'MEDIUM', 'HIGH'
    timestamp: str

class EndSessionRequest(BaseModel):
    user_id: str = "C001"
    history: List[ChatMessage] = Field(default_factory=list)

class EndSessionResponse(BaseModel):
    status: str = "success"
    friction_events_detected: int = 0
    updated_profile: UserCognitiveProfile
    summary: str
