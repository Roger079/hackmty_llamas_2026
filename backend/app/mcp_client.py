import copy
import json
import time
import httpx
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from .config import settings
from .schemas import McpToolCallLog
from .security import sanitize_banking_message, sanitize_memory_summary
from backend import mcp_server_mock as srv

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

    def _get_db_conn(self):
        import sqlite3
        from pathlib import Path
        db_path = Path(__file__).resolve().parent.parent / "banco_simulado2.db"
        if db_path.exists():
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            return conn
        return None

    def get_user_cognitive_profile(self, user_id: str = "USR-BANORTE-8842") -> Dict[str, Any]:
        """Retrieves user cognitive profile and friction memory from SQLite (with fallback)"""
        # 1. Try real SQLite database first
        conn = self._get_db_conn()
        if conn:
            try:
                # Resolve customer name from customer table
                cust_row = conn.execute("SELECT first_name, last_name FROM customer WHERE customer_id = ?", (user_id,)).fetchone()
                client_name = f"{cust_row['first_name']} {cust_row['last_name']}" if cust_row else "Alejandro Ramírez"

                row = conn.execute("SELECT * FROM user_cognitive_profile WHERE user_id = ?", (user_id,)).fetchone()
                fric_rows = conn.execute("SELECT id, friction_category, trigger_message, severity, detected_at FROM user_friction_logs WHERE user_id = ? ORDER BY rowid DESC", (user_id,)).fetchall()
                friction_logs = [{
                    "id": str(r["id"] or f"fric-{i+1:02d}"),
                    "category": r["friction_category"],
                    "trigger_message": r["trigger_message"],
                    "severity": r["severity"],
                    "timestamp": r["detected_at"]
                } for i, r in enumerate(fric_rows)]
                total_frictions = len(friction_logs)

                if row:
                    return {
                        "user_id": user_id,
                        "client_name": client_name,
                        "memory_summary": row["memory_summary"] or "",
                        "sensitivities": row["sensitivities"] or "",
                        "visual_preferences": (row["visual_preferences"] if "visual_preferences" in row.keys() else "") or "",
                        "information_preferences": (row["information_preferences"] if "information_preferences" in row.keys() else "") or "",
                        "recommended_tone": row["recommended_tone"] or "Empático y transparente",
                        "total_friction_events": total_frictions,
                        "last_updated": row["last_updated"] or "",
                        "friction_logs": friction_logs
                    }
                else:
                    return {
                        "user_id": user_id,
                        "client_name": client_name,
                        "memory_summary": "",
                        "sensitivities": "",
                        "visual_preferences": "",
                        "information_preferences": "",
                        "recommended_tone": "Empático y transparente",
                        "total_friction_events": 0,
                        "last_updated": "",
                        "friction_logs": []
                    }
            except Exception as e:
                print(f"[get_user_cognitive_profile] SQLite error: {e}")
            finally:
                conn.close()

        # 2. Fallback in-memory
        user = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])
        profile = user.get("cognitive_profile", {
            "memory_summary": "",
            "sensitivities": "",
            "visual_preferences": "",
            "information_preferences": "",
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
        """Logs a friction or stress moment in SQLite and memory"""
        now_str = datetime.now().strftime("%d %b %Y, %H:%M hrs")
        event = {
            "id": f"fric-{int(time.time()) % 100000:05d}",
            "category": category,
            "trigger_message": trigger_message,
            "severity": severity,
            "timestamp": now_str
        }

        # Write to SQLite
        conn = self._get_db_conn()
        if conn:
            try:
                conn.execute("""
                    INSERT INTO user_friction_logs (user_id, friction_category, trigger_message, severity, detected_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, category, trigger_message, severity, now_str))
                conn.commit()
            except Exception as e:
                print(f"[log_friction_event] SQLite error: {e}")
            finally:
                conn.close()

        user = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])
        user.setdefault("friction_logs", []).append(event)
        profile = user.setdefault("cognitive_profile", {})
        profile["total_friction_events"] = len(user.get("friction_logs", []))
        profile["last_updated"] = now_str
        return event

    def update_user_cognitive_profile(
        self,
        user_id: str,
        memory_summary: str,
        sensitivities: str,
        recommended_tone: str,
        visual_preferences: str = "",
        information_preferences: str = ""
    ) -> Dict[str, Any]:
        """Updates user cognitive profile summary directly in SQLite for continuous personalization"""
        now_str = datetime.now().strftime("%d %b %Y, %H:%M hrs")

        conn = self._get_db_conn()
        client_name = "Alejandro Ramírez"
        if conn:
            try:
                cust_row = conn.execute("SELECT first_name, last_name FROM customer WHERE customer_id = ?", (user_id,)).fetchone()
                if cust_row:
                    client_name = f"{cust_row['first_name']} {cust_row['last_name']}"

                conn.execute("""
                    INSERT OR REPLACE INTO user_cognitive_profile (user_id, memory_summary, sensitivities, recommended_tone, visual_preferences, information_preferences, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, memory_summary, sensitivities, recommended_tone, visual_preferences, information_preferences, now_str))
                conn.commit()
            except Exception as e:
                print(f"[update_user_cognitive_profile] SQLite error: {e}")
            finally:
                conn.close()

        user = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])
        profile = user.setdefault("cognitive_profile", {})
        profile["memory_summary"] = memory_summary
        profile["sensitivities"] = sensitivities
        profile["recommended_tone"] = recommended_tone
        if visual_preferences:
            profile["visual_preferences"] = visual_preferences
        if information_preferences:
            profile["information_preferences"] = information_preferences
        profile["last_updated"] = now_str
        return {
            "user_id": user_id,
            "client_name": client_name,
            **profile
        }

    def save_chat_message(
        self,
        customer_id: str,
        role: str,
        content: str,
        a2ui_payload: Optional[Dict[str, Any]] = None,
        session_id: str = "default_session"
    ) -> Dict[str, Any]:
        """Saves a sanitized chat message to SQLite for cross-session persistent memory"""
        sanitized_content = sanitize_banking_message(content)
        a2ui_comp = a2ui_payload.get("component") if a2ui_payload else None
        a2ui_json = json.dumps(a2ui_payload, ensure_ascii=False) if a2ui_payload else None
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = self._get_db_conn()
        msg_id = None
        if conn:
            try:
                cur = conn.cursor()
                cur.execute("""
                    INSERT INTO chat_conversation_history 
                    (session_id, customer_id, role, content, a2ui_component, a2ui_payload_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (session_id, customer_id, role, sanitized_content, a2ui_comp, a2ui_json, now_str))
                conn.commit()
                msg_id = cur.lastrowid
            except Exception as e:
                print(f"[save_chat_message] SQLite error: {e}")
            finally:
                conn.close()

        return {
            "id": f"msg-{msg_id or int(time.time())}",
            "session_id": session_id,
            "customer_id": customer_id,
            "role": role,
            "content": sanitized_content,
            "a2ui": a2ui_payload,
            "created_at": now_str
        }

    def get_chat_history(self, customer_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves persistent sanitized chat history for a customer"""
        conn = self._get_db_conn()
        history = []
        if conn:
            try:
                rows = conn.execute("""
                    SELECT id, session_id, customer_id, role, content, a2ui_component, a2ui_payload_json, created_at
                    FROM chat_conversation_history
                    WHERE customer_id = ?
                    ORDER BY id ASC
                    LIMIT ?
                """, (customer_id, limit)).fetchall()
                for r in rows:
                    row_dict = dict(r)
                    a2ui = None
                    if row_dict.get("a2ui_payload_json"):
                        try:
                            a2ui = json.loads(row_dict["a2ui_payload_json"])
                        except Exception:
                            pass
                    history.append({
                        "id": f"msg-{row_dict['id']}",
                        "role": row_dict["role"],
                        "content": row_dict["content"],
                        "a2ui": a2ui,
                        "timestamp": row_dict["created_at"]
                    })
            except Exception as e:
                print(f"[get_chat_history] SQLite error: {e}")
            finally:
                conn.close()
        return history

    def clear_chat_history(self, customer_id: str) -> Dict[str, Any]:
        """Safely purges chat history for a customer upon request (GDPR / right to be forgotten)"""
        conn = self._get_db_conn()
        deleted = 0
        if conn:
            try:
                cur = conn.cursor()
                cur.execute("DELETE FROM chat_conversation_history WHERE customer_id = ?", (customer_id,))
                deleted = cur.rowcount
                conn.commit()
            except Exception as e:
                print(f"[clear_chat_history] SQLite error: {e}")
            finally:
                conn.close()
        return {"status": "cleared", "customer_id": customer_id, "deleted_count": deleted}

    def get_real_customer_list(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns the real customers from the SQLite database"""
        conn = self._get_db_conn()
        customers = []
        if conn:
            try:
                rows = conn.execute("""
                    SELECT customer_id, first_name, last_name, status
                    FROM customer
                    ORDER BY customer_id ASC
                    LIMIT ?
                """, (limit,)).fetchall()
                for r in rows:
                    d = dict(r)
                    cid = d["customer_id"]
                    tier = "Cliente Nómina" if cid == "C001" else ("Cliente Clásico" if cid == "C002" else ("Cliente Patrimonial" if cid == "C003" else "Cliente Preferente"))
                    customers.append({
                        "customer_id": cid,
                        "name": f"{d['first_name']} {d['last_name']}",
                        "first_name": d["first_name"],
                        "last_name": d["last_name"],
                        "tier": tier,
                        "status": d.get("status", "ACTIVE")
                    })
            except Exception as e:
                print(f"[get_real_customer_list] SQLite error: {e}")
            finally:
                conn.close()
        return customers

    def get_real_customer_state(self, customer_id: str) -> Dict[str, Any]:
        """Queries real SQL views for accounts, cards, and transactions for the specified customer"""
        conn = self._get_db_conn()
        if not conn:
            return {}

        try:
            # 1. Customer name
            cust = conn.execute("SELECT customer_id, first_name, last_name FROM customer WHERE customer_id = ?", (customer_id,)).fetchone()
            client_name = f"{cust['first_name']} {cust['last_name']}" if cust else "Cliente Banorte"
            first_name = cust['first_name'] if cust else "Cliente"

            # 2. Real Accounts
            accounts_rows = conn.execute("SELECT * FROM chatbot_accounts_view WHERE customer_id = ?", (customer_id,)).fetchall()
            accounts_list = [dict(a) for a in accounts_rows]

            # Primary account / totals
            total_available = sum(a.get("available_balance", 0.0) for a in accounts_list)
            primary_account = accounts_list[0] if accounts_list else {}

            # 3. Real Credit Cards
            cards_rows = conn.execute("SELECT * FROM chatbot_credit_card_view WHERE customer_id = ?", (customer_id,)).fetchall()
            cards_list = [dict(c) for c in cards_rows]
            primary_card = cards_list[0] if cards_list else None
            total_debt = sum(c.get("current_balance", 0.0) for c in cards_list)

            # 4. Real Transactions
            tx_rows = conn.execute("""
                SELECT transaction_id, transaction_date, merchant_name, transaction_type, amount, currency, status, account_last4
                FROM chatbot_transactions_view
                WHERE customer_id = ?
                ORDER BY transaction_date DESC
                LIMIT 10
            """, (customer_id,)).fetchall()
            tx_list = []
            for t in tx_rows:
                td = dict(t)
                amt = float(td.get("amount", 0.0))
                tx_list.append({
                    "id": td.get("transaction_id"),
                    "description": td.get("merchant_name") or td.get("transaction_type", "Movimiento"),
                    "date": td.get("transaction_date", ""),
                    "account": f"Cuenta (*{td.get('account_last4', '0000')})",
                    "amount": amt,
                    "type": "credit" if amt > 0 else "debit",
                    "status": td.get("status", "POSTED"),
                    "category": td.get("transaction_type", "Operación")
                })

            return {
                "customer_id": customer_id,
                "client_name": client_name,
                "first_name": first_name,
                "total_available_balance": total_available,
                "accounts": accounts_list,
                "primary_account": primary_account,
                "credit_cards": cards_list,
                "primary_card": primary_card,
                "total_debt": total_debt,
                "transactions": tx_list
            }
        except Exception as e:
            print(f"[get_real_customer_state] SQLite error: {e}")
            return {}
        finally:
            conn.close()

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
        """High-fidelity database execution reading directly from SQLite banco_simulado2.db"""
        user_id = args.get("user_id") or args.get("customer_id") or settings.default_user_id
        user_data = self._mock_db.get(user_id, self._mock_db["USR-BANORTE-8842"])

        if tool_name == "get_user_debt":
            return srv.get_user_debt(user_id)

        elif tool_name == "commit_restructure":
            plan_id = args.get("plan_id", "plan_24m")
            term_months = int(args.get("term_months", 24))
            return srv.commit_restructure(user_id, plan_id, term_months)

        elif tool_name == "get_account_balance":
            bal_data = srv.get_account_balance(user_id)
            accounts = bal_data.get("accounts", [])
            # Also check if user has credit card to add to accounts list for balance card view
            cards = srv.get_user_debt(user_id)
            if cards and cards.get("total_debt", 0) > 0:
                accounts.append({
                    "type": "oro",
                    "name": cards.get("card_name", "Tarjeta Banorte"),
                    "number": f"****{cards.get('card_last4', '')}",
                    "credit_limit": cards.get("credit_limit", 0.0),
                    "available_credit": max(0.0, float(cards.get("credit_limit", 0.0)) - float(cards.get("total_debt", 0.0))),
                    "current_debt": cards.get("total_debt", 0.0),
                    "currency": "MXN"
                })
            cust_p = srv.get_customer_profile(user_id)
            client_name = f"{cust_p.get('first_name', '')} {cust_p.get('last_name', '')}".strip() or "Cliente Banorte"
            return {
                "client": client_name,
                "customer_id": user_id,
                "accounts": accounts
            }

        elif tool_name == "get_customer_profile":
            return srv.get_customer_profile(user_id)

        elif tool_name == "get_recent_transactions":
            limit = int(args.get("limit", 8))
            return srv.get_recent_transactions(user_id, limit)

        elif tool_name == "get_user_cognitive_memory":
            return srv.get_user_cognitive_memory(user_id)

        elif tool_name == "update_user_preferences":
            return srv.update_user_preferences(
                user_id=user_id,
                visual_preferences=args.get("visual_preferences", ""),
                information_preferences=args.get("information_preferences", ""),
                memory_summary=args.get("memory_summary")
            )

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

            amount = float(pending["amount"]) if pending else 850.00
            beneficiary = pending["beneficiary"] if pending else "Destinatario SPEI"
            now_dt = datetime.now()
            now_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
            now_display = now_dt.strftime("%d %b %Y, %H:%M hrs")

            # Persist transaction in real SQLite database
            conn = self._get_db_conn()
            rem_bal = 0.0
            if conn:
                try:
                    # Find customer primary account
                    acc_row = conn.execute("SELECT account_id FROM account WHERE customer_id = ? LIMIT 1", (user_id,)).fetchone()
                    acc_id = acc_row["account_id"] if acc_row else ("A001" if user_id == "C001" else ("A002" if user_id == "C002" else "A003"))

                    conn.execute("BEGIN TRANSACTION")
                    # Insert into bank_transaction
                    tx_id = f"TX{int(time.time()) % 1000000:06d}"
                    conn.execute("""
                        INSERT INTO bank_transaction (transaction_id, account_id, transaction_date, posting_date, transaction_type, merchant_name, amount, currency, channel, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (tx_id, acc_id, now_str, now_str, 'TRANSFER', f"SPEI a {beneficiary}", -amount, 'MXN', 'DIGITAL', 'POSTED'))

                    # Deduct from account_balance
                    conn.execute("""
                        UPDATE account_balance
                        SET available_balance = MAX(0.0, available_balance - ?),
                            ledger_balance = MAX(0.0, ledger_balance - ?),
                            last_update = ?
                        WHERE account_id = ?
                    """, (amount, amount, now_str, acc_id))
                    conn.commit()

                    bal_row = conn.execute("SELECT available_balance FROM account_balance WHERE account_id = ?", (acc_id,)).fetchone()
                    if bal_row:
                        rem_bal = float(bal_row["available_balance"])
                except Exception as e:
                    conn.rollback()
                    print(f"[execute_spei_transfer] SQLite transaction error (rolled back): {e}")
                finally:
                    conn.close()

            return {
                "status": "SUCCESS",
                "tracking_key": tracking_key,
                "amount": amount,
                "beneficiary": beneficiary,
                "folio_banxico": f"0722026{int(time.time()) % 1000000:06d}",
                "execution_timestamp": now_display,
                "remaining_balance": rem_bal,
                "message": f"Transferencia por ${amount:,.2f} MXN liquidada exitosamente por Banco de México (SPEI)."
            }

        elif tool_name == "add_spei_contact":
            b_name = args.get("beneficiary_name", "Beneficiario SPEI")
            clabe = str(args.get("clabe", "")).replace(" ", "")
            alias = args.get("alias") or b_name.split()[0]
            bank = args.get("recipient_bank") or ("BBVA México" if clabe.startswith("012") else ("Nu México" if clabe.startswith("638") else "Institución SPEI"))
            cnt_id = f"cnt-{int(time.time()) % 100000:05d}"
            now_str = datetime.now().strftime("%d %b %Y, %H:%M hrs")

            conn = self._get_db_conn()
            if conn:
                try:
                    conn.execute("BEGIN TRANSACTION")
                    conn.execute("""
                        CREATE TABLE IF NOT EXISTS spei_contacts (
                            id TEXT PRIMARY KEY,
                            user_id TEXT NOT NULL,
                            beneficiary_name TEXT NOT NULL,
                            bank_name TEXT NOT NULL,
                            clabe TEXT NOT NULL,
                            alias TEXT,
                            created_at TEXT
                        )
                    """)
                    conn.execute("""
                        INSERT INTO spei_contacts (id, user_id, beneficiary_name, bank_name, clabe, alias, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (cnt_id, user_id, b_name, bank, clabe, alias, now_str))
                    conn.commit()
                except Exception as e:
                    conn.rollback()
                    print(f"[add_spei_contact] SQLite error (rolled back): {e}")
                finally:
                    conn.close()

            return {
                "status": "SUCCESS",
                "contact_id": cnt_id,
                "beneficiary_name": b_name,
                "bank_name": bank,
                "clabe": clabe,
                "alias": alias,
                "registered_at": now_str,
                "message": f"Contacto {b_name} ({bank}) registrado exitosamente en tu agenda SPEI Banorte."
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
            period = str(args.get("period", "") or "")
            return srv.get_spending_analytics(user_id, period)

        elif tool_name == "get_financial_health_score":
            real_state = self.get_real_customer_state(user_id)
            client_name = real_state.get("client_name") or user_data.get("client_name", "Cliente Banorte")
            debt = float(real_state.get("total_debt", 0.0))
            nomina_bal = float(real_state.get("total_available_balance", 0.0))
            cards = real_state.get("credit_cards", [])
            limit = sum(float(c.get("credit_limit", 0.0)) for c in cards) if cards else 0.0
            utilization = round((debt / limit) * 100, 1) if limit > 0 else 0.0

            if debt > 0:
                min_payment = sum(float(c.get("minimum_payment") or (float(c.get("current_balance", 0.0)) * 0.08)) for c in cards) if cards else 2500.0
                score = 58 if debt > 25000 else 68
                status = "MODERADO"
                status_color = "#F59E0B"
                months_liq = 54
                proj_interest = round(debt * 0.92, 2)
                recom = f"Reestructurar a 24 meses congelará tu tasa al 22.5% y te ahorrará ${round(debt * 0.45, 2):,.2f} MXN en intereses."
            else:
                min_payment = 0.0
                score = 96 if nomina_bal > 50000 else 92
                status = "ÓPTIMO"
                status_color = "#10B981"
                months_liq = 0
                proj_interest = 0.0
                recom = "Excelente disciplina financiera. Tu liquidez está disponible para generar rendimientos en Pagaré Banorte."

            return {
                "client_name": client_name,
                "overall_score": score,
                "max_score": 100,
                "status": status,
                "status_color": status_color,
                "metrics": {
                    "credit_utilization_pct": utilization,
                    "credit_utilization_limit_pct": 30.0,
                    "is_utilization_high": utilization > 30.0,
                    "available_liquidity": nomina_bal,
                    "current_debt": debt,
                    "savings_capacity_monthly": round(nomina_bal * 0.15, 2)
                },
                "radar_scores": [
                    {"dimension": "Capacidad de Ahorro", "score": 85 if debt == 0 else 55, "benchmark": 75},
                    {"dimension": "Nivel de Endeudamiento", "score": 98 if debt == 0 else 45, "benchmark": 80},
                    {"dimension": "Puntualidad en Pagos", "score": 95, "benchmark": 85},
                    {"dimension": "Fondo de Emergencia", "score": 80 if nomina_bal > 20000 else 40, "benchmark": 70},
                    {"dimension": "Inversión & Retiro", "score": 75 if user_id == "C003" else 45, "benchmark": 60}
                ],
                "interest_trap_warning": {
                    "is_at_risk": debt > 0,
                    "minimum_payment": min_payment,
                    "months_to_liquidate_minimum": months_liq,
                    "projected_interest_minimum": proj_interest,
                    "recommendation": recom
                }
            }

        elif tool_name == "simulate_amortization_schedule":
            debt = float(args.get("debt_amount", 0.0))
            if debt <= 0:
                real_state = self.get_real_customer_state(user_id)
                debt = float(real_state.get("total_debt", 0.0))
                if debt <= 0:
                    debt = 28000.0
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

        elif tool_name in ["get_sankey_cashflow", "get_cash_flow_sankey"]:
            uid = args.get("user_id", "C001")
            return self.get_sankey_cashflow(uid)

        elif tool_name in ["get_spending_heatmap", "get_calendar_heatmap"]:
            uid = args.get("user_id", "C001")
            return self.get_spending_heatmap(uid)

        elif tool_name in ["get_historical_spending_trend", "get_monthly_spending_trend"]:
            return [
                {"mes": "Abr 2026", "monto": 7450.00},
                {"mes": "May 2026", "monto": 7100.00},
                {"mes": "Jun 2026", "monto": 7800.00},
                {"mes": "Jul 2026", "monto": 6900.00},
                {"mes": "Ago 2026", "monto": 7200.00},
                {"mes": "Sep 2026", "monto": 6450.00}
            ]

        return {"error": f"Herramienta '{tool_name}' no reconocida por el servidor MCP"}

    def get_sankey_cashflow(self, user_id: str = "C001") -> Dict[str, Any]:
        """Generates authentic multi-stage cash flow graph nodes and links for Sankey diagrams"""
        real_state = self.get_real_customer_state(user_id)
        client_name = real_state.get("client_name") or "Cliente Banorte"
        avail_bal = float(real_state.get("total_available_balance", 27900.0))

        analytics = self._execute_mock("get_spending_analytics", {"user_id": user_id})
        cats = analytics.get("categories", [])
        total_spent = float(analytics.get("total_spent", 6450.0))
        nomina_income = round(avail_bal + total_spent, 2)
        if nomina_income <= total_spent:
            nomina_income = round(total_spent * 1.8, 2)

        fijos_amt = sum(c["amount"] for c in cats if any(k in c["name"].lower() for k in ["super", "servicios", "tarjeta", "renta"]))
        if fijos_amt <= 0:
            fijos_amt = round(total_spent * 0.65, 2)
        var_amt = round(total_spent - fijos_amt, 2)
        if var_amt < 0:
            var_amt = 0.0
            fijos_amt = total_spent
        ahorro_amt = round(nomina_income - total_spent, 2)

        palette_colors = ["#EB0029", "#4A5568", "#FF5A70", "#718096", "#0A5CA8", "#C89319", "#008A5A"]

        nodes = [
            {"id": "nomina", "label": "Ingresos / Nómina Banorte", "color": "#0A5CA8"},
            {"id": "fijos", "label": "Gastos Fijos", "color": "#EB0029"},
            {"id": "variables", "label": "Gastos Variables", "color": "#C89319"},
            {"id": "ahorro", "label": "Remanente / Ahorro", "color": "#008A5A"},
        ]
        links = [
            {"source": "nomina", "target": "fijos", "value": fijos_amt},
            {"source": "nomina", "target": "variables", "value": var_amt},
            {"source": "nomina", "target": "ahorro", "value": ahorro_amt},
        ]

        for idx, c in enumerate(cats):
            c_id = f"cat_{idx}"
            is_fijo = any(k in c["name"].lower() for k in ["super", "servicios", "tarjeta", "renta"])
            parent = "fijos" if is_fijo else "variables"
            nodes.append({
                "id": c_id,
                "label": c["name"],
                "color": c.get("color") or palette_colors[idx % len(palette_colors)]
            })
            links.append({
                "source": parent,
                "target": c_id,
                "value": float(c["amount"])
            })

        nodes.append({"id": "inversion", "label": "Pagaré / Inversión Banorte", "color": "#008A5A"})
        links.append({"source": "ahorro", "target": "inversion", "value": ahorro_amt})

        return {
            "client": client_name,
            "period": analytics.get("period", "Septiembre 2026"),
            "total_income": nomina_income,
            "total_spent": total_spent,
            "net_remainder": ahorro_amt,
            "nodes": nodes,
            "links": links
        }

    def get_spending_heatmap(self, user_id: str = "C001") -> Dict[str, Any]:
        """Generates 30-day daily spend distribution for calendar heatmaps"""
        real_state = self.get_real_customer_state(user_id)
        client_name = real_state.get("client_name") or "Cliente Banorte"
        analytics = self._execute_mock("get_spending_analytics", {"user_id": user_id})
        total_spent = float(analytics.get("total_spent", 6450.0))

        daily = []
        weights = {1: 0.22, 15: 0.28, 5: 0.10, 8: 0.08, 12: 0.07, 18: 0.09, 22: 0.06, 26: 0.05, 29: 0.05}
        for d in range(1, 31):
            date_str = f"2026-09-{d:02d}"
            amt = round(total_spent * weights.get(d, 0.0), 2)
            daily.append({
                "date": date_str,
                "day": d,
                "value": amt
            })

        return {
            "client": client_name,
            "period": "Septiembre 2026",
            "total_spent": total_spent,
            "daily_spending": daily
        }

# Instancia singleton del cliente MCP
mcp_client = McpClient()
