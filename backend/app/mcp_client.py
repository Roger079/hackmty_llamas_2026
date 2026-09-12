import copy
import time
import httpx
from datetime import datetime
from typing import Any, Dict, Optional, Tuple
from .config import settings
from .schemas import McpToolCallLog

INITIAL_MOCK_DB = {
    "USR-BANORTE-8842": {
        "client_name": "Alejandro Ramírez",
        "accounts": {
            "nomina": {"name": "Débito Enlace Digital", "last4": "1234", "balance": 48650.00},
            "oro": {
                "name": "Tarjeta Banorte Oro",
                "last4": "8842",
                "credit_limit": 80000.00,
                "debt": 38450.00,
                "minimum_payment": 3850.00,
                "due_date": "18 Sep 2026",
                "rate": "64.8% CAT"
            }
        },
        "restructures": [],
        "transactions": [
            {"id": "tx-101", "title": "OXXO San Pedro", "date": "11 Sep", "amount": 185.00, "type": "withdrawal", "category": "Tienda", "icon": "shopping-bag"},
            {"id": "tx-102", "title": "Nómina Quincenal Banorte", "date": "10 Sep", "amount": 28400.00, "type": "deposit", "category": "Sueldo", "icon": "arrow-down-left"},
            {"id": "tx-103", "title": "Starbucks San Jerónimo", "date": "08 Sep", "amount": 142.00, "type": "withdrawal", "category": "Cafetería", "icon": "coffee"}
        ],
        "friction_logs": [
            {
                "id": "fric-01",
                "category": "HIGH_PAYMENT_STRESS",
                "trigger_message": "Se me hace muy pesado pagar casi 4 mil pesos al mes de tarjeta de crédito, me quedo sin quincena",
                "severity": "HIGH",
                "timestamp": "10 Sep 2026, 18:22 hrs"
            }
        ],
        "cognitive_profile": {
            "memory_summary": "El cliente expresó preocupación por mensualidades superiores a $2,000 MXN en tarjeta de crédito. Prefiere plazos extendidos (24-36 meses) para proteger su liquidez quincenal.",
            "sensitivities": "Sensible a montos fijos altos; valora la certidumbre de pagos fijos y congelamiento de intereses.",
            "recommended_tone": "Empático, comprensivo, transparente con las cuotas y enfocado en la tranquilidad financiera.",
            "total_friction_events": 1,
            "last_updated": "10 Sep 2026, 18:25 hrs"
        }
    }
}

class McpClient:
    """
    Client for Person 1's FastMCP Banking Server.
    Attempts live transport over HTTP/SSE, with automatic fallback
    to local SQLite/in-memory mock database for 100% test reliability.
    """

    def __init__(self, server_url: Optional[str] = None):
        self.server_url = server_url or settings.mcp_server_url
        self.is_connected = False
        self._pending_transfers: Dict[str, Dict[str, Any]] = {}
        self._mock_db = copy.deepcopy(INITIAL_MOCK_DB)

    def reset_database(self) -> Dict[str, Any]:
        """Resets mock database back to initial state for testing/demo restarts"""
        self._mock_db = copy.deepcopy(INITIAL_MOCK_DB)
        self._pending_transfers.clear()
        return {"status": "reset_successful", "client": "USR-BANORTE-8842"}

    def get_user_cognitive_profile(self, user_id: str = "USR-BANORTE-8842") -> Dict[str, Any]:
        """Retrieves user cognitive profile and friction memory for prompt injection"""
        user = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])
        profile = user.get("cognitive_profile", {
            "memory_summary": "",
            "sensitivities": "",
            "recommended_tone": "Empático y transparente",
            "total_friction_events": 0,
            "last_updated": ""
        })
        return {
            "user_id": user_id,
            "client_name": user.get("client_name", "Alejandro Ramírez"),
            **profile
        }

    def log_friction_event(self, user_id: str, category: str, trigger_message: str, severity: str = "MEDIUM") -> Dict[str, Any]:
        """Logs a friction or stress moment in the banking database"""
        user = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])
        event = {
            "id": f"fric-{int(time.time()) % 100000:05d}",
            "category": category,
            "trigger_message": trigger_message,
            "severity": severity,
            "timestamp": datetime.now().strftime("%d %b %Y, %H:%M hrs")
        }
        user.setdefault("friction_logs", []).append(event)
        
        # Increment total friction events
        profile = user.setdefault("cognitive_profile", {})
        profile["total_friction_events"] = len(user.get("friction_logs", []))
        profile["last_updated"] = event["timestamp"]
        return event

    def update_user_cognitive_profile(self, user_id: str, memory_summary: str, sensitivities: str, recommended_tone: str) -> Dict[str, Any]:
        """Updates user cognitive profile summary for continuous learning"""
        user = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])
        now_str = datetime.now().strftime("%d %b %Y, %H:%M hrs")
        profile = user.setdefault("cognitive_profile", {})
        profile["memory_summary"] = memory_summary
        profile["sensitivities"] = sensitivities
        profile["recommended_tone"] = recommended_tone
        profile["last_updated"] = now_str
        return {
            "user_id": user_id,
            "client_name": user.get("client_name", "Alejandro Ramírez"),
            **profile
        }

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Tuple[Any, McpToolCallLog]:
        """
        Executes an MCP tool either remotely on Person 1's server or via mock fallback.
        Returns the result and an McpToolCallLog instance.
        """
        start_time = time.perf_counter()
        result = None
        used_remote = False

        # 1. Attempt remote execution if MCP server is reachable
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.post(
                    f"{self.server_url.rstrip('/')}/call",
                    json={"name": tool_name, "arguments": arguments}
                )
                if resp.status_code == 200:
                    result = resp.json()
                    used_remote = True
                    self.is_connected = True
        except Exception:
            # Server not running yet or transport unreachable; fallback to mock
            self.is_connected = False

        # 2. Mock fallback execution
        if not used_remote:
            result = self._execute_mock(tool_name, arguments)

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        log = McpToolCallLog(
            tool_name=tool_name,
            arguments=arguments,
            result=result,
            latency_ms=latency_ms,
            timestamp=datetime.now().strftime("%H:%M:%S")
        )
        return result, log

    def _execute_mock(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """High-fidelity fallback mimicking Person 1's database tables"""
        user_id = args.get("user_id", settings.default_user_id)
        user_data = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])

        if tool_name == "get_user_debt":
            oro = user_data["accounts"]["oro"]
            return {
                "user_id": user_id,
                "client_name": user_data["client_name"],
                "card_name": oro["name"],
                "card_last4": oro["last4"],
                "total_debt": oro["debt"],
                "minimum_payment": oro["minimum_payment"],
                "payment_due_date": oro["due_date"],
                "interest_rate_annual": oro["rate"],
                "eligible_for_restructure": True,
                "options": [
                    {
                        "plan_id": "plan_12m",
                        "months": 12,
                        "monthly_payment": 3480.00,
                        "annual_rate": "24.0%",
                        "total_savings": 8900.00,
                        "label": "12 meses con tasa reducida"
                    },
                    {
                        "plan_id": "plan_24m",
                        "months": 24,
                        "monthly_payment": 1920.00,
                        "annual_rate": "22.5%",
                        "total_savings": 14200.00,
                        "label": "24 meses (Recomendado Banorte)"
                    },
                    {
                        "plan_id": "plan_36m",
                        "months": 36,
                        "monthly_payment": 1390.00,
                        "annual_rate": "21.0%",
                        "total_savings": 18500.00,
                        "label": "36 meses cuota mínima"
                    }
                ]
            }

        elif tool_name == "commit_restructure":
            plan_id = args.get("plan_id", "plan_24m")
            term_months = int(args.get("term_months", 24))
            folio = f"FOL-BNTE-2026-R{int(time.time()) % 100000:05d}"
            
            # Update user debt in mock DB
            monthly = 1920.00 if term_months == 24 else (3480.00 if term_months == 12 else 1390.00)
            user_data["accounts"]["oro"]["debt"] = 0.00
            user_data["accounts"]["oro"]["minimum_payment"] = monthly
            user_data["accounts"]["oro"]["due_date"] = "15 Oct 2026"
            
            restructure_record = {
                "folio": folio,
                "plan_id": plan_id,
                "term_months": term_months,
                "monthly_payment": monthly,
                "status": "APROBADO_ACTIVO",
                "applied_at": datetime.now().isoformat()
            }
            user_data["restructures"].append(restructure_record)

            # Record into transactions
            new_tx = {
                "id": f"tx-{int(time.time())}",
                "title": f"Convenio Restructuración ({folio})",
                "date": "Hoy",
                "amount": 38450.00,
                "type": "deposit",
                "category": "Convenio Tarjeta Oro",
                "icon": "file-check"
            }
            user_data.setdefault("transactions", []).insert(0, new_tx)

            return {
                "status": "APROBADO",
                "folio_convenio": folio,
                "message": "Reestructuración aplicada exitosamente. Intereses moratorios congelados.",
                "monthly_payment": monthly,
                "term_months": term_months,
                "next_payment_date": "15 Oct 2026",
                "bank_seal": f"BANORTE-CRYPTO-SHA256-{hash(folio) & 0xFFFFFFFF:08X}"
            }

        elif tool_name == "get_account_balance":
            acc_type = args.get("account_type", "all")
            nomina = user_data["accounts"]["nomina"]
            oro = user_data["accounts"]["oro"]
            return {
                "client": user_data["client_name"],
                "accounts": [
                    {
                        "type": "nomina",
                        "name": nomina["name"],
                        "number": f"****{nomina['last4']}",
                        "available_balance": nomina["balance"],
                        "currency": "MXN"
                    },
                    {
                        "type": "oro",
                        "name": oro["name"],
                        "number": f"****{oro['last4']}",
                        "credit_limit": oro["credit_limit"],
                        "available_credit": max(0.0, oro["credit_limit"] - oro["debt"]),
                        "current_debt": oro["debt"],
                        "currency": "MXN"
                    }
                ]
            }

        elif tool_name == "validate_clabe":
            clabe = str(args.get("clabe", "")).replace(" ", "")
            is_valid = len(clabe) == 18 and clabe.isdigit()
            bank_code = clabe[:3] if len(clabe) >= 3 else ""
            banks = {"012": "BBVA México", "014": "Santander México", "072": "Banorte", "002": "Banamex", "127": "Azteca"}
            return {
                "valid": is_valid,
                "clabe": clabe,
                "bank_name": banks.get(bank_code, "Institución Financiera SPEI"),
                "format": "SPEI_MX_18"
            }

        elif tool_name == "prepare_spei_transfer":
            amount = float(args.get("amount", 0))
            nomina = user_data["accounts"]["nomina"]
            sufficient = nomina["balance"] >= amount
            transfer_id = f"prep-spei-{int(time.time())}"
            self._pending_transfers[transfer_id] = {
                "amount": amount,
                "beneficiary": args.get("beneficiary_name", "Beneficiario"),
                "bank": args.get("recipient_bank", "Institución SPEI"),
                "clabe": args.get("clabe", "")
            }
            return {
                "transfer_id": transfer_id,
                "beneficiary": args.get("beneficiary_name"),
                "bank": args.get("recipient_bank"),
                "clabe": args.get("clabe"),
                "amount": amount,
                "concept": args.get("concept", "Transferencia Banorte Móvil"),
                "commission": 0.00,
                "sufficient_funds": sufficient,
                "available_after": round(nomina["balance"] - amount, 2) if sufficient else nomina["balance"]
            }

        elif tool_name == "execute_spei_transfer":
            tracking_key = f"BNTE2026{int(time.time()) % 100000000:08d}"
            transfer_id = args.get("transfer_id", "")
            pending = self._pending_transfers.get(transfer_id)
            if not pending and self._pending_transfers:
                pending = list(self._pending_transfers.values())[-1]

            amount = pending["amount"] if pending else 850.00
            beneficiary = pending["beneficiary"] if pending else "Destinatario SPEI"

            # Mutate state: deduct from nomina balance
            nomina = user_data["accounts"]["nomina"]
            nomina["balance"] = max(0.00, round(nomina["balance"] - amount, 2))

            # Record into transactions
            new_tx = {
                "id": f"tx-{int(time.time())}",
                "title": f"SPEI a {beneficiary}",
                "date": "Hoy",
                "amount": amount,
                "type": "withdrawal",
                "category": "Transferencia SPEI",
                "icon": "arrow-up-right"
            }
            user_data.setdefault("transactions", []).insert(0, new_tx)

            return {
                "status": "SUCCESS",
                "tracking_key": tracking_key,
                "amount": amount,
                "beneficiary": beneficiary,
                "folio_banxico": f"0722026{int(time.time()) % 1000000:06d}",
                "execution_timestamp": datetime.now().strftime("%d %b %Y, %H:%M hrs"),
                "remaining_balance": nomina["balance"],
                "message": f"Transferencia por ${amount:,.2f} MXN liquidada exitosamente por Banco de México (SPEI)."
            }

        elif tool_name == "simulate_investment":
            amount = float(args.get("amount", 25000))
            term_days = int(args.get("term_days", 91))
            rate = 0.1125  # 11.25% fixed annual rate
            gain = round(amount * rate * (term_days / 360), 2)
            total = round(amount + gain, 2)
            return {
                "amount": amount,
                "term_days": term_days,
                "annual_rate": "11.25%",
                "estimated_gain": gain,
                "total_maturity": total
            }

        elif tool_name == "get_spending_analytics":
            period = args.get("period", "current_month")
            return {
                "period": "Septiembre 2026",
                "total_spent": 14850.00,
                "previous_period_spent": 16200.00,
                "trend_pct": -8.3,
                "currency": "MXN",
                "categories": [
                    {"name": "Supermercado & Despensa", "amount": 5420.00, "percentage": 36.5, "color": "#EB0029", "icon": "shopping-cart"},
                    {"name": "Restaurantes & Cafés", "amount": 3280.00, "percentage": 22.1, "color": "#FF5A70", "icon": "utensils"},
                    {"name": "Servicios & Hogar", "amount": 2650.00, "percentage": 17.8, "color": "#4A5568", "icon": "zap"},
                    {"name": "Transporte & Gasolina", "amount": 1950.00, "percentage": 13.1, "color": "#718096", "icon": "car"},
                    {"name": "Entretenimiento & Streaming", "amount": 1550.00, "percentage": 10.5, "color": "#CBD5E0", "icon": "film"}
                ],
                "top_merchants": [
                    {"merchant": "HEB Valle Oriente", "amount": 2850.00, "category": "Supermercado"},
                    {"merchant": "Costco Cumbres", "amount": 2570.00, "category": "Supermercado"},
                    {"merchant": "Gasolinera Oxxo Gas", "amount": 1450.00, "category": "Transporte"},
                    {"merchant": "Restaurante La Torrada", "amount": 1280.00, "category": "Restaurantes"}
                ],
                "historical_spending_6m": [
                    {"month": "Abr", "amount": 15400.00},
                    {"month": "May", "amount": 16800.00},
                    {"month": "Jun", "amount": 14200.00},
                    {"month": "Jul", "amount": 17100.00},
                    {"month": "Ago", "amount": 16200.00},
                    {"month": "Sep", "amount": 14850.00}
                ],
                "summary": "Tus gastos disminuyeron un 8.3% respecto a agosto. Tu principal rubro es Supermercado ($5,420 MXN)."
            }

        elif tool_name == "get_financial_health_score":
            oro = user_data["accounts"]["oro"]
            nomina = user_data["accounts"]["nomina"]
            debt = oro["debt"]
            limit = oro["credit_limit"]
            utilization = round((debt / limit) * 100, 1) if limit > 0 else 0.0

            # Score calculation (100 base, deductions for debt utilization)
            score = 64 if debt > 20000 else 88
            status = "MODERADO" if score < 75 else "ÓPTIMO"
            status_color = "#F59E0B" if score < 75 else "#10B981"

            return {
                "client_name": user_data["client_name"],
                "overall_score": score,
                "max_score": 100,
                "status": status,
                "status_color": status_color,
                "metrics": {
                    "credit_utilization_pct": utilization,
                    "credit_utilization_limit_pct": 30.0,
                    "is_utilization_high": utilization > 30.0,
                    "available_liquidity": nomina["balance"],
                    "current_debt": debt,
                    "savings_capacity_monthly": 4200.00
                },
                "radar_scores": [
                    {"dimension": "Capacidad de Ahorro", "score": 68, "benchmark": 75},
                    {"dimension": "Nivel de Endeudamiento", "score": 45, "benchmark": 80},
                    {"dimension": "Puntualidad en Pagos", "score": 92, "benchmark": 85},
                    {"dimension": "Fondo de Emergencia", "score": 55, "benchmark": 70},
                    {"dimension": "Inversión & Retiro", "score": 40, "benchmark": 60}
                ],
                "interest_trap_warning": {
                    "is_at_risk": debt > 0,
                    "minimum_payment": oro["minimum_payment"],
                    "months_to_liquidate_minimum": 64 if debt > 0 else 0,
                    "projected_interest_minimum": 36200.00 if debt > 0 else 0.0,
                    "recommendation": "Reestructurar a 24 meses te ahorra $21,400 MXN en intereses."
                }
            }

        elif tool_name == "simulate_amortization_schedule":
            debt = float(args.get("debt_amount", 38450.0))
            months = int(args.get("term_months", 24))
            annual_rate = float(args.get("annual_rate", 22.5)) / 100.0
            extra = float(args.get("extra_monthly_payment", 0.0))

            monthly_rate = annual_rate / 12.0
            factor = (1 + monthly_rate) ** months
            fixed_monthly = round(debt * (monthly_rate * factor) / (factor - 1), 2)

            balance = debt
            schedule = []
            total_interest = 0.0
            total_principal = 0.0

            for m in range(1, months + 1):
                interest = round(balance * monthly_rate, 2)
                actual_payment = min(fixed_monthly + extra, balance + interest)
                principal = round(actual_payment - interest, 2)
                balance = max(0.0, round(balance - principal, 2))
                total_interest += interest
                total_principal += principal
                schedule.append({
                    "month": m,
                    "payment": actual_payment,
                    "principal": principal,
                    "interest": interest,
                    "remaining_balance": balance
                })
                if balance <= 0:
                    break

            return {
                "initial_debt": debt,
                "term_months": months,
                "annual_rate_pct": round(annual_rate * 100, 2),
                "monthly_payment": fixed_monthly,
                "extra_monthly_payment": extra,
                "total_principal": round(total_principal, 2),
                "total_interest": round(total_interest, 2),
                "total_cost": round(total_principal + total_interest, 2),
                "schedule_preview": schedule[:6],
                "months_to_payoff": len(schedule)
            }

        elif tool_name == "log_user_friction":
            category = args.get("friction_category", "GENERAL_HESITATION")
            trigger = args.get("trigger_snippet", "Duda o estrés financiero expresado por el cliente")
            severity = args.get("severity", "MEDIUM")
            event = self.log_friction_event("USR-BANORTE-8842", category, trigger, severity)
            return {
                "status": "logged",
                "friction_event_id": event["id"],
                "category": category,
                "message": "Punto de fricción registrado en perfil de memoria para adaptación continua."
            }

        elif tool_name == "get_user_cognitive_profile":
            uid = args.get("user_id", "USR-BANORTE-8842")
            return self.get_user_cognitive_profile(uid)

        return {"error": f"Herramienta '{tool_name}' no reconocida por el servidor MCP"}

# Instancia singleton del cliente MCP
mcp_client = McpClient()
