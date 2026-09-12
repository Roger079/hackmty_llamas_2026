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
5. Los componentes A2UI se renderizan directamente en la pantalla del usuario. Complementa tu respuesta con un mensaje cordial y profesional.
"""

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

    async def stream_orchestrate(self, request: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        SSE Streaming generator. Emits tokens, MCP call events, and A2UI payloads.
        """
        yield {"event": "status", "data": "Analizando intención financiera..."}
        await asyncio.sleep(0.08)

        response = await self.orchestrate(request)

        # Emit all MCP tool calls to the stream for the live inspector
        for call in response.mcp_calls:
            yield {
                "event": "mcp_call",
                "data": call.model_dump()
            }
            await asyncio.sleep(0.04)

        # Emit text response tokens
        words = response.reply.split(" ")
        accumulated = ""
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            accumulated += chunk
            yield {
                "event": "token",
                "data": chunk
            }
            await asyncio.sleep(0.02)

        # Emit A2UI payload if generated
        if response.a2ui:
            yield {
                "event": "a2ui",
                "data": response.a2ui.model_dump()
            }

        yield {
            "event": "done",
            "data": {
                "status": "success",
                "reply": response.reply,
                "a2ui": response.a2ui.model_dump() if response.a2ui else None
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
                system_instruction=BANORTE_SYSTEM_PROMPT,
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
                        a2ui_payload = A2UIPayload(
                            component=tool_args.get("component", "DebtRestructureCard"),
                            props=tool_args.get("props", {})
                        )
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
