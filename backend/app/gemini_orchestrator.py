import json
import asyncio
from typing import Any, AsyncGenerator, Dict, List, Optional
from google import genai
from google.genai import types

from .config import settings
from .mcp_client import mcp_client
from .schemas import A2UIPayload, ChatRequest, ChatResponse, McpToolCallLog
from .tools_registry import TOOL_DECLARATIONS

BANORTE_SYSTEM_PROMPT = """Eres Maya, el agente de Inteligencia Artificial bancario de Banorte ("El Banco Fuerte de México").
Tu objetivo es ayudar a los clientes con sus finanzas mediante un enfoque de Conversational Banking y Generative UI (A2UI).

Reglas de comportamiento y herramientas:
1. Comunícate siempre en español, con un tono formal, empático, claro y seguro.
2. Si el usuario necesita consultar información bancaria, deuda o transferencias, invoca la herramienta MCP adecuada (ej. get_user_debt, get_account_balance, prepare_spei_transfer, etc.).
3. Cuando el usuario exprese intención de reestructurar una deuda o aceptar un plan, ejecuta la herramienta MCP commit_restructure.
4. SIEMPRE que presentes información financiera que requiera interacción o confirmación visual, invoca la herramienta `render_a2ui` indicando el componente adecuado:
   - 'DebtRestructureCard': Cuando consultes o propongas planes de reestructuración de deuda.
   - 'ConfirmationReceipt': Cuando se haya aplicado exitosamente una reestructuración o convenio.
   - 'SpeiConfirmCard': Cuando se prepare una transferencia SPEI para que el usuario confirme con su Token.
   - 'SpeiReceiptCard': Cuando la transferencia SPEI haya sido ejecutada con éxito.
   - 'BanorteBalanceCard': Cuando el usuario pida ver sus saldos y cuentas.
   - 'InvestmentSimulatorCard': Cuando el usuario pregunte por inversiones o Pagaré Banorte.
   - 'SpendingDonutCard' o 'BanorteChartCard': Cuando el usuario consulte sus gastos por categoría, en qué se le fue el dinero o comparativas de gastos.
   - 'FinancialHealthGauge': Cuando el usuario pida conocer su salud financiera, diagnóstico o riesgo de intereses.
   - 'AmortizationScheduleCard': Cuando el usuario pida simular pagos de crédito, amortización capital vs interés o ahorro con pagos anticipados.
5. Los componentes A2UI se renderizan directamente en la pantalla del usuario. Complementa tu respuesta con un mensaje cordial y profesional.
"""

TOOL_STATUS_MESSAGES = {
    "get_user_debt": "Consultando corte de adeudo en core bancario Banorte...",
    "commit_restructure": "Congelando intereses moratorios y aplicando convenio...",
    "get_account_balance": "Consultando saldos consolidados en tiempo real...",
    "validate_clabe": "Validando CLABE interbancaria ante Banco de México...",
    "prepare_spei_transfer": "Preparando orden SPEI y verificando fondos...",
    "execute_spei_transfer": "Liquidando transferencia SPEI ante Banxico...",
    "simulate_investment": "Simulando rendimiento de Pagaré Banorte...",
    "get_spending_analytics": "Analizando categorización de gastos y patrones de consumo...",
    "get_financial_health_score": "Calculando diagnóstico integral de salud financiera 360°...",
    "simulate_amortization_schedule": "Calculando corrida financiera y tabla de amortización...",
    "log_user_friction": "Registrando punto de fricción en memoria cognitiva...",
    "render_a2ui": "Generando interfaz interactiva (A2UI)..."
}

POST_TOOL_STATUS_MESSAGES = {
    "get_user_debt": "Calculando 3 alternativas con tasa preferencial congelada...",
    "commit_restructure": "Generando folio oficial y sello digital criptográfico...",
    "get_account_balance": "Consolidando cuentas de nómina y tarjetas de crédito...",
    "validate_clabe": "CLABE verificada con éxito ante Banxico...",
    "prepare_spei_transfer": "Solicitando confirmación con Token Móvil...",
    "execute_spei_transfer": "Comprobante digital Banxico (CEP) generado...",
    "simulate_investment": "Proyección financiera calculada con éxito...",
    "get_spending_analytics": "Generando métricas y gráficos de distribución de gasto...",
    "get_financial_health_score": "Score y semáforo de riesgo calculados exitosamente...",
    "simulate_amortization_schedule": "Proyección de capital e intereses calculada...",
    "log_user_friction": "Memoria cognitiva actualizada para futuras sesiones..."
}

class GeminiOrchestrator:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiOrchestrator] Warning: could not init genai client: {e}")

    def _build_system_prompt(self, user_id: str = "USR-BANORTE-8842") -> str:
        """Injects persistent user cognitive profile and previous friction points into prompt"""
        prompt = BANORTE_SYSTEM_PROMPT
        profile = mcp_client.get_user_cognitive_profile(user_id)
        if profile and profile.get("memory_summary"):
            prompt += f"""

[MEMORIA Y PERFIL COGNITIVO DEL CLIENTE (SESIONES PREVIAS)]:
- Puntos de dolor anteriores: {profile.get('memory_summary')}
- Sensibilidades detectadas: {profile.get('sensitivities')}
- Tono y estrategia recomendada: {profile.get('recommended_tone')}
- Total de fricciones registradas: {profile.get('total_friction_events', 0)}
*Directriz de empatía*: Utiliza esta memoria para adaptar tu propuesta y tono, sin ser invasivo. Si el cliente mostró estrés por mensualidades altas, ofrece alternativas con cuotas accesibles y destaca la tranquilidad de congelar intereses.
"""
        return prompt

    async def orchestrate(self, request: ChatRequest) -> ChatResponse:
        """
        Main closed-loop execution.
        Executes Gemini with function calling loop or fallback simulator.
        """
        # If live Gemini client is available, run live GenAI loop
        if self.client and self.api_key:
            try:
                return await self._run_gemini_live_loop(request)
            except Exception as e:
                print(f"[GeminiOrchestrator] Live call failed, falling back to smart simulator: {e}")

        # Smart deterministic simulator for hackathon demo reliability
        return await self._run_smart_simulation(request)

    def _get_initial_status(self, request: ChatRequest) -> str:
        if request.action_context:
            action = request.action_context.action
            params = request.action_context.params
            if action in ["commit_restructure", "apply_restructure"]:
                months = params.get("term_months", 24)
                return f"Verificando condiciones de reestructuración ({months} meses)..."
            elif action in ["execute_spei", "confirm_spei"]:
                return "Autenticando Token Móvil y autorizando SPEI..."
            return f"Ejecutando acción '{action}'..."

        msg = request.message.lower()
        if any(k in msg for k in ["deuda", "reestructur", "reestructurar", "convenio", "pagar tarjeta", "no puedo pagar"]):
            return "Identificando cuentas activas y evaluando elegibilidad crediticia..."
        elif any(k in msg for k in ["saldo", "cuanto tengo", "cuentas", "dinero disponible"]):
            return "Consultando saldos consolidados de nómina y tarjetas de crédito..."
        elif any(k in msg for k in ["transfer", "enviar", "mandar", "spei"]):
            return "Validando datos de transferencia interbancaria SPEI..."
        elif any(k in msg for k in ["invertir", "inversión", "pagaré"]):
            return "Calculando proyecciones de inversión en Pagaré Banorte..."
        elif any(k in msg for k in ["gasto", "gasté", "gastos", "categoría", "en qué"]):
            return "Analizando categorización de gastos y distribución de consumo..."
        elif any(k in msg for k in ["salud", "diagnóstico", "score", "semáforo", "salud financiera"]):
            return "Evaluando score de salud financiera 360° y uso de crédito..."
        elif any(k in msg for k in ["amortiza", "tabla de amortización", "capital e interés", "abono"]):
            return "Calculando tabla de amortización y proyección de capital..."
        return f"Maya analizando consulta financiera con {self.model}..."

    def _normalize_a2ui_payload(self, a2ui: Optional[A2UIPayload]) -> Optional[A2UIPayload]:
        if not a2ui or not a2ui.props:
            return a2ui

        props = dict(a2ui.props)
        comp = a2ui.component

        if comp == "BanorteBalanceCard":
            accounts = props.get("accounts", [])
            if isinstance(accounts, list):
                nomina = next((a for a in accounts if a.get("type") == "nomina"), {})
                oro = next((a for a in accounts if a.get("type") == "oro"), {})
                if "nominaBalance" not in props:
                    props["nominaBalance"] = nomina.get("available_balance", 48650.0)
                if "oroBalance" not in props:
                    props["oroBalance"] = oro.get("available_credit", 41550.0)
                if "totalDebt" not in props:
                    props["totalDebt"] = oro.get("current_debt", 38450.0)
            if "clientName" not in props and "client" in props:
                props["clientName"] = props["client"]
            if "nominaBalance" not in props and "nomina_balance" in props:
                props["nominaBalance"] = props["nomina_balance"]
            if "oroBalance" not in props and "oro_balance" in props:
                props["oroBalance"] = props["oro_balance"]
            if "totalDebt" not in props and "total_debt" in props:
                props["totalDebt"] = props["total_debt"]

        elif comp == "DebtRestructureCard":
            if "totalDebt" not in props and "total_debt" in props:
                props["totalDebt"] = props["total_debt"]
            if "cardName" not in props and "card_name" in props:
                props["cardName"] = props["card_name"]
            if "cardLast4" not in props and "card_last4" in props:
                props["cardLast4"] = props["card_last4"]
            if "minimumPayment" not in props and "minimum_payment" in props:
                props["minimumPayment"] = props["minimum_payment"]
            if "dueDate" not in props and "payment_due_date" in props:
                props["dueDate"] = props["payment_due_date"]
            elif "dueDate" not in props and "due_date" in props:
                props["dueDate"] = props["due_date"]
            if "currentRate" not in props and "interest_rate_annual" in props:
                props["currentRate"] = props["interest_rate_annual"]

        elif comp == "ConfirmationReceipt":
            if "monthlyPayment" not in props and "monthly_payment" in props:
                props["monthlyPayment"] = props["monthly_payment"]
            if "termMonths" not in props and "term_months" in props:
                props["termMonths"] = props["term_months"]
            if "nextPaymentDate" not in props and "next_payment_date" in props:
                props["nextPaymentDate"] = props["next_payment_date"]
            if "bankSeal" not in props and "bank_seal" in props:
                props["bankSeal"] = props["bank_seal"]
            if "clientName" not in props and "client_name" in props:
                props["clientName"] = props["client_name"]

        elif comp == "SpeiConfirmCard":
            if "transferId" not in props and "transfer_id" in props:
                props["transferId"] = props["transfer_id"]
            if "beneficiary" not in props and "beneficiary_name" in props:
                props["beneficiary"] = props["beneficiary_name"]
            if "bank" not in props and "recipient_bank" in props:
                props["bank"] = props["recipient_bank"]

        elif comp == "SpeiReceiptCard":
            if "trackingKey" not in props and "tracking_key" in props:
                props["trackingKey"] = props["tracking_key"]
            if "date" not in props and "execution_timestamp" in props:
                props["date"] = props["execution_timestamp"]

        elif comp in ["SpendingDonutCard", "BanorteChartCard"]:
            if "totalSpent" not in props and "total_spent" in props:
                props["totalSpent"] = props["total_spent"]
            if "previousPeriodSpent" not in props and "previous_period_spent" in props:
                props["previousPeriodSpent"] = props["previous_period_spent"]

        elif comp in ["FinancialHealthGauge", "FinancialHealthCard"]:
            if "overallScore" not in props and "overall_score" in props:
                props["overallScore"] = props["overall_score"]
            if "creditUtilizationPct" not in props and "credit_utilization_pct" in props:
                props["creditUtilizationPct"] = props["credit_utilization_pct"]

        elif comp == "AmortizationScheduleCard":
            if "initialDebt" not in props and "initial_debt" in props:
                props["initialDebt"] = props["initial_debt"]
            if "monthlyPayment" not in props and "monthly_payment" in props:
                props["monthlyPayment"] = props["monthly_payment"]
            if "totalInterest" not in props and "total_interest" in props:
                props["totalInterest"] = props["total_interest"]

        return A2UIPayload(component=comp, props=props)

    async def stream_orchestrate(self, request: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Contextual Server-Sent Events (SSE) streaming generator.
        Emits real-time dynamic status updates, MCP execution telemetry, A2UI payloads,
        and narrative text tokens.
        """
        initial_status = self._get_initial_status(request)
        yield {"event": "status", "data": initial_status}
        await asyncio.sleep(0.06)

        # Try live loop with streaming status if client is available
        if self.client and self.api_key:
            try:
                async for event in self._run_gemini_live_stream(request):
                    yield event
                return
            except Exception as e:
                print(f"[GeminiOrchestrator] Live stream failed, falling back to smart simulator: {e}")
                yield {"event": "status", "data": "Activando motor de simulación inteligente Banorte..."}
                await asyncio.sleep(0.05)

        # Fallback to smart simulated stream with event-driven progress
        async for event in self._run_smart_simulation_stream(request):
            yield event

    async def _run_gemini_live_stream(self, request: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        tools = [
            types.Tool(
                function_declarations=[
                    types.FunctionDeclaration(
                        name=t["name"],
                        description=t["description"],
                        parameters=t.get("parameters")
                    )
                    for t in TOOL_DECLARATIONS
                ]
            )
        ]

        contents = []
        for msg in request.history:
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))

        user_prompt = request.message
        if request.action_context:
            user_prompt += (
                f"\n\n[CONTEXTO DE ACCIÓN A2UI]: El usuario ejecutó la acción '{request.action_context.action}' "
                f"en el componente '{request.action_context.source_component}' con los parámetros: "
                f"{json.dumps(request.action_context.params, ensure_ascii=False)}"
            )

        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)]))

        mcp_calls: List[McpToolCallLog] = []
        a2ui_payload: Optional[A2UIPayload] = None
        final_reply = ""

        for step in range(5):
            config = types.GenerateContentConfig(
                system_instruction=self._build_system_prompt(request.user_id or "USR-BANORTE-8842"),
                tools=tools,
                temperature=0.2
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config
            )

            if response.function_calls:
                for fcall in response.function_calls:
                    tool_name = fcall.name
                    tool_args = dict(fcall.args) if fcall.args else {}

                    # Case 1: render_a2ui
                    if tool_name == "render_a2ui":
                        comp = tool_args.get("component", "DebtRestructureCard")
                        yield {"event": "status", "data": f"Generando interfaz interactiva <{comp} /> (A2UI)..."}
                        await asyncio.sleep(0.04)

                        a2ui_payload = self._normalize_a2ui_payload(A2UIPayload(
                            component=comp,
                            props=tool_args.get("props", {})
                        ))
                        yield {"event": "a2ui", "data": a2ui_payload.model_dump()}

                        contents.append(response.candidates[0].content)
                        contents.append(
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_function_response(
                                        name=tool_name,
                                        response={"status": "rendered"}
                                    )
                                ]
                            )
                        )

                    # Case 2: MCP Tool execution
                    else:
                        status_msg = TOOL_STATUS_MESSAGES.get(tool_name, f"Ejecutando herramienta {tool_name}...")
                        yield {"event": "status", "data": status_msg}
                        await asyncio.sleep(0.04)

                        tool_result, log = await mcp_client.execute_tool(tool_name, tool_args)
                        mcp_calls.append(log)

                        yield {"event": "mcp_call", "data": log.model_dump()}

                        post_status = POST_TOOL_STATUS_MESSAGES.get(tool_name, "Procesando respuesta bancaria...")
                        yield {"event": "status", "data": post_status}
                        await asyncio.sleep(0.04)

                        contents.append(response.candidates[0].content)
                        contents.append(
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_function_response(
                                        name=tool_name,
                                        response={"result": tool_result}
                                    )
                                ]
                            )
                        )
            else:
                final_reply = response.text or ""
                break

        if not final_reply and a2ui_payload:
            final_reply = "He generado la interfaz bancaria interactiva a continuación:"

        # Stream text response tokens
        yield {"event": "status", "data": "Maya finalizando respuesta..."}
        words = final_reply.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield {"event": "token", "data": chunk}
            await asyncio.sleep(0.015)

        yield {
            "event": "done",
            "data": {
                "status": "success",
                "reply": final_reply,
                "a2ui": a2ui_payload.model_dump() if a2ui_payload else None,
                "mcp_calls": [c.model_dump() for c in mcp_calls]
            }
        }

    async def _run_smart_simulation_stream(self, request: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        High-fidelity event-driven simulated stream emitting live status and tool telemetry.
        """
        # Run orchestrate logic
        res = await self._run_smart_simulation(request)

        # Emit tool call telemetry with dynamic status messages
        for call in res.mcp_calls:
            tool_msg = TOOL_STATUS_MESSAGES.get(call.tool_name, f"Ejecutando {call.tool_name}...")
            yield {"event": "status", "data": tool_msg}
            await asyncio.sleep(0.05)

            yield {"event": "mcp_call", "data": call.model_dump()}

            post_msg = POST_TOOL_STATUS_MESSAGES.get(call.tool_name, "Actualizando estado de cuenta...")
            yield {"event": "status", "data": post_msg}
            await asyncio.sleep(0.04)

        # Emit A2UI component
        if res.a2ui:
            yield {"event": "status", "data": f"Generando componente visual <{res.a2ui.component} /> (A2UI)..."}
            await asyncio.sleep(0.04)
            yield {"event": "a2ui", "data": res.a2ui.model_dump()}

        # Stream words
        yield {"event": "status", "data": "Maya finalizando respuesta..."}
        words = res.reply.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield {"event": "token", "data": chunk}
            await asyncio.sleep(0.015)

        yield {
            "event": "done",
            "data": {
                "status": "success",
                "reply": res.reply,
                "a2ui": res.a2ui.model_dump() if res.a2ui else None,
                "mcp_calls": [c.model_dump() for c in res.mcp_calls]
            }
        }

    async def _run_gemini_live_loop(self, request: ChatRequest) -> ChatResponse:
        """
        Executes multi-step tool-calling with official google-genai SDK.
        """
        # Convert tool declarations to GenAI Tool objects
        tools = [
            types.Tool(
                function_declarations=[
                    types.FunctionDeclaration(
                        name=t["name"],
                        description=t["description"],
                        parameters=t.get("parameters")
                    )
                    for t in TOOL_DECLARATIONS
                ]
            )
        ]

        # Construct prompt & history
        contents = []
        for msg in request.history:
            role = "user" if msg.role == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))

        user_prompt = request.message
        if request.action_context:
            user_prompt += (
                f"\n\n[CONTEXTO DE ACCIÓN A2UI]: El usuario ejecutó la acción '{request.action_context.action}' "
                f"en el componente '{request.action_context.source_component}' con los parámetros: "
                f"{json.dumps(request.action_context.params, ensure_ascii=False)}"
            )

        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_prompt)]))

        mcp_calls: List[McpToolCallLog] = []
        a2ui_payload: Optional[A2UIPayload] = None
        final_reply = ""

        # Loop up to 5 steps of tool calls
        for step in range(5):
            config = types.GenerateContentConfig(
                system_instruction=self._build_system_prompt(request.user_id or "USR-BANORTE-8842"),
                tools=tools,
                temperature=0.2
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config
            )

            # Check if model made function calls
            has_tool_call = False
            if response.function_calls:
                for fcall in response.function_calls:
                    tool_name = fcall.name
                    tool_args = dict(fcall.args) if fcall.args else {}

                    # Case 1: render_a2ui
                    if tool_name == "render_a2ui":
                        has_tool_call = True
                        a2ui_payload = self._normalize_a2ui_payload(A2UIPayload(
                            component=tool_args.get("component", "DebtRestructureCard"),
                            props=tool_args.get("props", {})
                        ))
                        # Add tool response
                        contents.append(response.candidates[0].content)
                        contents.append(
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_function_response(
                                        name=tool_name,
                                        response={"status": "rendered"}
                                    )
                                ]
                            )
                        )
                    # Case 2: MCP Tool execution
                    else:
                        has_tool_call = True
                        tool_result, log = await mcp_client.execute_tool(tool_name, tool_args)
                        mcp_calls.append(log)

                        # Provide result back to model
                        contents.append(response.candidates[0].content)
                        contents.append(
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_function_response(
                                        name=tool_name,
                                        response=tool_result if isinstance(tool_result, dict) else {"result": tool_result}
                                    )
                                ]
                            )
                        )
                continue

            # Model produced final text
            final_reply = response.text or ""
            break

        if not final_reply and a2ui_payload:
            final_reply = "He generado la interfaz solicitada a continuación:"

        return ChatResponse(
            reply=final_reply,
            a2ui=a2ui_payload,
            mcp_calls=mcp_calls,
            status="success"
        )

    async def summarize_and_close_session(self, user_id: str = "USR-BANORTE-8842", history: Optional[List[Any]] = None) -> Dict[str, Any]:
        """
        Extracts friction points and user sensitivities from the conversation turns,
        updates the persistent cognitive profile in the SQL database, and returns the summary.
        """
        history = history or []
        user_turns = [m.content for m in history if getattr(m, 'role', '') == 'user']
        full_dialogue = "\n".join([f"{getattr(m, 'role', 'USER').upper()}: {getattr(m, 'content', '')}" for m in history])

        memory_summary = ""
        sensitivities = ""
        recommended_tone = "Empático, comprensivo y transparente con cuotas fijas"
        friction_detected = 0

        # Run extraction with Gemini 3.7 Flash if available
        if self.client and self.api_key and user_turns:
            extract_prompt = f"""Analiza la siguiente conversación entre un cliente de Banorte y el asesor bancario Maya.
Identifica si el cliente expresó fricción, estrés financiero, objeciones con pagos altos o dudas sobre el crédito.
Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
{{
  "has_friction": true,
  "friction_category": "HIGH_PAYMENT_STRESS",
  "trigger_snippet": "cita textual breve",
  "memory_summary": "resumen en 1 o 2 oraciones del perfil, preocupaciones y preferencias del cliente para tener en cuenta en la PRÓXIMA sesión",
  "sensitivities": "sensibilidades clave detectadas (ej. mensualidad máxima, liquidez quincenal)",
  "recommended_tone": "tono sugerido para futuras sesiones (ej. empático, directo, enfocado en tranquilidad)"
}}

Diálogo:
{full_dialogue}"""

            try:
                res = self.client.models.generate_content(
                    model=self.model,
                    contents=extract_prompt,
                    config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json")
                )
                data = json.loads(res.text)
                if data.get("has_friction") and data.get("friction_category") != "NONE":
                    mcp_client.log_friction_event(
                        user_id=user_id,
                        category=data.get("friction_category", "GENERAL_HESITATION"),
                        trigger_message=data.get("trigger_snippet", ""),
                        severity="MEDIUM"
                    )
                    friction_detected = 1
                memory_summary = data.get("memory_summary", "")
                sensitivities = data.get("sensitivities", "")
                recommended_tone = data.get("recommended_tone", recommended_tone)
            except Exception as e:
                print(f"[summarize_and_close_session] Gemini extraction error: {e}")

        if not memory_summary:
            has_stress = any(k in full_dialogue.lower() for k in ["pesado", "no me alcanza", "caro", "quincena", "interés", "intereses", "mucho"])
            if has_stress:
                memory_summary = "El cliente mostró sensibilidad a comprometer su liquidez quincenal. Prefiere plazos extendidos y pagos menores a $2,000 MXN."
                sensitivities = "Sensibilidad a mensualidades altas; valora congelar intereses sin penalización."
                friction_detected = 1
            else:
                memory_summary = "Cliente con buen perfil de pago; receptivo a soluciones de banca digital y transferencias SPEI."
                sensitivities = "Valora agilidad y comprobantes digitales claros."

        updated = mcp_client.update_user_cognitive_profile(
            user_id=user_id,
            memory_summary=memory_summary,
            sensitivities=sensitivities,
            recommended_tone=recommended_tone
        )
        return {
            "status": "session_summarized",
            "friction_events_detected": friction_detected,
            "updated_profile": updated,
            "summary": memory_summary
        }

    async def _run_smart_simulation(self, request: ChatRequest) -> ChatResponse:
        """
        Smart offline fallback simulator reproducing the complete multi-step closed loop.
        Handles both debt restructuring and SPEI/Balance flows.
        """
        mcp_calls: List[McpToolCallLog] = []
        user_id = request.user_id or settings.default_user_id

        # Feedback Loop: User clicked an action inside an A2UI component
        if request.action_context:
            action = request.action_context.action
            params = request.action_context.params

            if action in ["commit_restructure", "apply_restructure"]:
                plan_id = params.get("plan_id", "plan_24m")
                term_months = params.get("term_months", 24)
                
                # Execute MCP commit_restructure tool
                res, log = await mcp_client.execute_tool("commit_restructure", {
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "term_months": term_months
                })
                mcp_calls.append(log)

                reply = (
                    f"¡Excelente noticia! He procesado tu solicitud de reestructuración con el folio **{res['folio_convenio']}**.\n\n"
                    f"Tus intereses moratorios quedan congelados a partir de este momento y tu pago mensual fijo será de "
                    f"**${res['monthly_payment']:,.2f} MXN** a un plazo de **{term_months} meses**. "
                    f"A continuación tienes tu comprobante oficial de convenio Banorte."
                )
                a2ui = A2UIPayload(
                    component="ConfirmationReceipt",
                    props={
                        "folio": res["folio_convenio"],
                        "status": res["status"],
                        "monthlyPayment": res["monthly_payment"],
                        "termMonths": term_months,
                        "nextPaymentDate": res["next_payment_date"],
                        "bankSeal": res["bank_seal"],
                        "clientName": "Alejandro Ramírez"
                    }
                )
                return ChatResponse(reply=reply, a2ui=a2ui, mcp_calls=mcp_calls)

            elif action in ["execute_spei", "confirm_spei"]:
                transfer_id = params.get("transfer_id", "prep-spei-101")
                auth_token = params.get("auth_token", "TOKEN-OTP-OK")
                
                res, log = await mcp_client.execute_tool("execute_spei_transfer", {
                    "transfer_id": transfer_id,
                    "auth_token": auth_token
                })
                mcp_calls.append(log)

                amount = params.get("amount", 850.00)
                beneficiary = params.get("beneficiary", "Sofía Mendoza")
                bank = params.get("bank", "BBVA México")
                clabe = params.get("clabe", "012 180 01594839201 9")

                reply = (
                    f"Tu transferencia SPEI por **${amount:,.2f} MXN** a favor de **{beneficiary}** ha sido liquidada "
                    f"exitosamente ante Banco de México con la clave de rastreo oficial **{res['tracking_key']}**."
                )
                a2ui = A2UIPayload(
                    component="SpeiReceiptCard",
                    props={
                        "amount": amount,
                        "beneficiary": beneficiary,
                        "bank": bank,
                        "clabe": clabe,
                        "trackingKey": res["tracking_key"],
                        "date": res["execution_timestamp"]
                    }
                )
                return ChatResponse(reply=reply, a2ui=a2ui, mcp_calls=mcp_calls)

        # Natural language user intents
        msg = request.message.lower()

        # 1. DEBT RESTRUCTURING INTENT (Core hackathon scenario)
        if any(k in msg for k in ["deuda", "reestructur", "reestructurar", "convenio", "pagar tarjeta", "no puedo pagar", "intereses"]):
            res, log = await mcp_client.execute_tool("get_user_debt", {"user_id": user_id})
            mcp_calls.append(log)

            reply = (
                f"Entiendo tu situación, Alejandro. He consultado tu tarjeta **{res['card_name']}** (*{res['card_last4']}). "
                f"Actualmente tienes un saldo de **${res['total_debt']:,.2f} MXN** con una tasa de **{res['interest_rate_annual']}**.\n\n"
                f"Banorte ha diseñado tres alternativas de reestructuración con tasas preferenciales congeladas para ti. "
                f"Por favor selecciona el plan que mejor se adapte a tu presupuesto y presiona **Aplicar plan**:"
            )
            a2ui = A2UIPayload(
                component="DebtRestructureCard",
                props={
                    "totalDebt": res["total_debt"],
                    "cardName": res["card_name"],
                    "cardLast4": res["card_last4"],
                    "minimumPayment": res["minimum_payment"],
                    "dueDate": res["payment_due_date"],
                    "currentRate": res["interest_rate_annual"],
                    "options": res["options"]
                }
            )
            return ChatResponse(reply=reply, a2ui=a2ui, mcp_calls=mcp_calls)

        # 2. BALANCE INQUIRY
        elif any(k in msg for k in ["saldo", "cuanto tengo", "cuentas", "dinero disponible"]):
            res, log = await mcp_client.execute_tool("get_account_balance", {"account_type": "all"})
            mcp_calls.append(log)

            nomina_acc = next((a for a in res["accounts"] if a["type"] == "nomina"), None)
            oro_acc = next((a for a in res["accounts"] if a["type"] == "oro"), None)

            reply = (
                f"Hola {res['client']}. Aquí tienes el resumen actualizado de tus cuentas Banorte en tiempo real:"
            )
            a2ui = A2UIPayload(
                component="BanorteBalanceCard",
                props={
                    "clientName": res["client"],
                    "nominaBalance": nomina_acc["available_balance"] if nomina_acc else 48650.00,
                    "oroBalance": oro_acc["available_credit"] if oro_acc else 41550.00,
                    "totalDebt": oro_acc.get("current_debt", 38450.00) if oro_acc else 38450.00
                }
            )
            return ChatResponse(reply=reply, a2ui=a2ui, mcp_calls=mcp_calls)

        # 3. SPEI TRANSFER INTENT
        elif any(k in msg for k in ["transfer", "enviar", "mandar", "spei", "pago"]):
            beneficiary = "CARLOS GÓMEZ VEGA" if "carlos" in msg else "SOFÍA MENDOZA RÍOS"
            bank = "Santander México" if "carlos" in msg else "BBVA México"
            clabe = "014 180 65502938471 2" if "carlos" in msg else "012 180 01594839201 9"
            
            # Extract amount
            import re
            m = re.search(r'\$?\s*(\d+(?:[.,]\d+)?)', msg)
            amount = float(m.group(1).replace(',', '')) if m else 850.00

            # Step 1: validate_clabe
            res_val, log_val = await mcp_client.execute_tool("validate_clabe", {"clabe": clabe})
            mcp_calls.append(log_val)

            # Step 2: prepare_spei_transfer
            res_prep, log_prep = await mcp_client.execute_tool("prepare_spei_transfer", {
                "beneficiary_name": beneficiary,
                "recipient_bank": bank,
                "clabe": clabe,
                "amount": amount,
                "concept": "Pago por servicios"
            })
            mcp_calls.append(log_prep)

            reply = (
                f"He preparado la orden de transferencia SPEI por **${amount:,.2f} MXN** para **{beneficiary}** en {bank}. "
                f"Por favor verifica los datos en la tarjeta interactiva y presiona **Autorizar con Token Móvil** para finalizar la operación."
            )
            a2ui = A2UIPayload(
                component="SpeiConfirmCard",
                props={
                    "transferId": res_prep["transfer_id"],
                    "amount": amount,
                    "beneficiary": beneficiary,
                    "bank": bank,
                    "clabe": clabe,
                    "concept": "Pago por servicios"
                }
            )
            return ChatResponse(reply=reply, a2ui=a2ui, mcp_calls=mcp_calls)

        # 4. INVESTMENT / PAGARÉ BANORTE
        elif any(k in msg for k in ["invertir", "inversión", "pagaré", "rendimiento"]):
            res, log = await mcp_client.execute_tool("simulate_investment", {"amount": 25000.0, "term_days": 91})
            mcp_calls.append(log)

            reply = (
                f"Pagaré Banorte te ofrece una tasa fija del **{res['annual_rate']}** anual garantizada. "
                f"Puedes ajustar el monto y plazo directamente en el simulador A2UI interactivo:"
            )
            a2ui = A2UIPayload(
                component="InvestmentSimulatorCard",
                props={
                    "initialAmount": res["amount"],
                    "initialTermDays": res["term_days"],
                    "annualRate": res["annual_rate"],
                    "estimatedGain": res["estimated_gain"],
                    "totalMaturity": res["total_maturity"]
                }
            )
            return ChatResponse(reply=reply, a2ui=a2ui, mcp_calls=mcp_calls)

        # General friendly fallback
        reply = (
            "¡Hola, Alejandro! Soy Maya, tu asesora de banca digital Banorte. ¿En qué puedo apoyarte hoy?\n\n"
            "Puedes pedirme:\n"
            "• **Reestructurar tu deuda de tarjeta de crédito** con un plan a tu medida.\n"
            "• **Realizar una transferencia SPEI** en tiempo real.\n"
            "• **Consultar tus saldos** de Nómina y Crédito Oro.\n"
            "• **Simular rendimientos de inversión** en Pagaré Banorte."
        )
        return ChatResponse(reply=reply, a2ui=None, mcp_calls=[])

orchestrator = GeminiOrchestrator()
