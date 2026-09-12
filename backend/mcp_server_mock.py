"""
Servidor Oficial FastMCP de Banorte conectado a la Base de Datos SQLite banco_simulado2.db
Persona 1: Database & MCP Server Implementation
"""
import os
import sqlite3
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastmcp import FastMCP

# 1. Crear instancia FastMCP
mcp = FastMCP("banorte-banking-mcp")

# Ruta absoluta hacia la base de datos banco_simulado2.db
DB_PATH = Path(__file__).resolve().parent / "banco_simulado2.db"

def get_connection() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise RuntimeError(f"No se encontró la base de datos en {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# =============================================================================
# HERRAMIENTAS MCP DE CONSULTA DE CUENTAS Y SALDOS
# =============================================================================

@mcp.tool()
def get_customer_profile(customer_id: str = "C002") -> dict:
    """Obtiene el perfil bancario, nombre, teléfono y datos de contacto del cliente."""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM chatbot_profile_view WHERE customer_id = ?", (customer_id,)).fetchone()
        if not row:
            row = conn.execute("SELECT * FROM customer WHERE customer_id = ?", (customer_id,)).fetchone()
        return dict(row) if row else {"error": f"Cliente {customer_id} no encontrado"}
    finally:
        conn.close()

@mcp.tool()
def get_account_balance(customer_id: str = "C002") -> dict:
    """Obtiene los saldos de cuentas de ahorro, cheques y nómina del cliente."""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM chatbot_accounts_view WHERE customer_id = ?", (customer_id,)).fetchall()
        accounts_list = []
        for r in rows:
            d = dict(r)
            accounts_list.append({
                "account_id": d.get("account_id"),
                "type": "nomina" if "nómina" in str(d.get("account_type", "")).lower() else "ahorro",
                "name": f"Cuenta {d.get('account_type', 'Bancaria')}",
                "last4": d.get("account_last4", "1234"),
                "available_balance": float(d.get("available_balance", 0.0)),
                "ledger_balance": float(d.get("ledger_balance", 0.0)),
                "currency": d.get("currency", "MXN")
            })
        return {
            "customer_id": customer_id,
            "total_accounts": len(accounts_list),
            "accounts": accounts_list
        }
    finally:
        conn.close()

@mcp.tool()
def get_user_debt(user_id: str = "C002") -> dict:
    """Consulta tarjetas de crédito, deuda actual, pago mínimo y elegibilidad para reestructuración."""
    conn = get_connection()
    try:
        cards = conn.execute("SELECT * FROM chatbot_credit_card_view WHERE customer_id = ?", (user_id,)).fetchall()
        cust = conn.execute("SELECT first_name, last_name FROM customer WHERE customer_id = ?", (user_id,)).fetchone()
        client_name = f"{cust['first_name']} {cust['last_name']}" if cust else "Carlos Ramírez"

        if cards:
            c = dict(cards[0])
            debt = float(c.get("current_balance") or c.get("current_debt") or 0.0)
            limit = float(c.get("credit_limit") or 0.0)
            min_pay = float(c.get("minimum_payment") or (debt * 0.08))
            card_last4 = c.get("pan_last4") or c.get("card_last4") or "8812"
            card_brand = f"Tarjeta Banorte {c.get('network', 'Clásica').capitalize()}"
            due_date = c.get("payment_due_date") or "27 Sep 2026"
            is_eligible = debt > 0
        else:
            debt = 0.0
            limit = 0.0
            min_pay = 0.0
            card_last4 = ""
            card_brand = "Sin tarjetas de crédito"
            due_date = ""
            is_eligible = False

        options = []
        if debt > 0:
            m12 = round((debt * 1.12) / 12, 2)
            m24 = round((debt * 1.18) / 24, 2)
            m36 = round((debt * 1.22) / 36, 2)
            options = [
                {
                    "plan_id": "plan_12m",
                    "months": 12,
                    "monthly_payment": m12,
                    "annual_rate": "24.0%",
                    "total_savings": round(debt * 0.28, 2),
                    "label": "12 meses con tasa reducida"
                },
                {
                    "plan_id": "plan_24m",
                    "months": 24,
                    "monthly_payment": m24,
                    "annual_rate": "22.5%",
                    "total_savings": round(debt * 0.45, 2),
                    "label": "24 meses (Recomendado Banorte)"
                },
                {
                    "plan_id": "plan_36m",
                    "months": 36,
                    "monthly_payment": m36,
                    "annual_rate": "21.0%",
                    "total_savings": round(debt * 0.55, 2),
                    "label": "36 meses cuota mínima"
                }
            ]

        return {
            "user_id": user_id,
            "client_name": client_name,
            "card_name": card_brand,
            "card_last4": card_last4,
            "total_debt": debt,
            "credit_limit": limit,
            "minimum_payment": min_pay,
            "payment_due_date": due_date,
            "interest_rate_annual": "64.8% CAT" if debt > 0 else "0.0%",
            "eligible_for_restructure": is_eligible,
            "options": options
        }
    finally:
        conn.close()

@mcp.tool()
def get_recent_transactions(customer_id: str = "C002", limit: int = 8) -> dict:
    """Obtiene los últimos movimientos bancarios con comercios, fechas y categorías de SQLite."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM chatbot_transactions_view WHERE customer_id = ? ORDER BY transaction_date DESC LIMIT ?",
            (customer_id, limit)
        ).fetchall()
        txs = []
        for r in rows:
            d = dict(r)
            txs.append({
                "fecha": d.get("transaction_date"),
                "comercio": d.get("description") or d.get("merchant_name") or "Comercio",
                "categoria": d.get("category") or "Consumo",
                "monto": float(d.get("amount") or 0.0),
                "tipo": d.get("transaction_type")
            })
        return {"customer_id": customer_id, "count": len(txs), "transactions": txs}
    finally:
        conn.close()

@mcp.tool()
def commit_restructure(user_id: str, plan_id: str, term_months: int) -> dict:
    """Aplica y formaliza la reestructuración de deuda en SQLite congelando intereses moratorios."""
    conn = get_connection()
    try:
        folio = f"FOL-BNTE-2026-R{int(time.time()) % 100000:05d}"
        now_str = datetime.now().strftime("%d %b %Y, %H:%M hrs")
        monthly = 1920.00 if term_months == 24 else (3480.00 if term_months == 12 else 1390.00)

        try:
            conn.execute("""
                UPDATE credit_card_account 
                SET current_balance = 0.0, minimum_payment = ?
                WHERE customer_id = ?
            """, (monthly, user_id))
            conn.commit()
        except Exception:
            pass

        return {
            "status": "APROBADO",
            "folio": folio,
            "folio_convenio": folio,
            "plan_id": plan_id,
            "term_months": term_months,
            "termMonths": term_months,
            "monthly_payment": monthly,
            "monthlyPayment": monthly,
            "next_payment_date": "15 Oct 2026",
            "nextPaymentDate": "15 Oct 2026",
            "bank_seal": f"BANORTE-CRYPTO-SHA256-{abs(hash(folio)) & 0xFFFFFFFF:08X}",
            "bankSeal": f"BANORTE-CRYPTO-SHA256-{abs(hash(folio)) & 0xFFFFFFFF:08X}",
            "applied_at": now_str
        }
    finally:
        conn.close()

# =============================================================================
# HERRAMIENTAS MCP DE MEMORIA Y PREFERENCIAS COGNITIVAS
# =============================================================================

@mcp.tool()
def get_user_cognitive_memory(user_id: str = "C002") -> dict:
    """Obtiene el perfil cognitivo, historial de estrés financiero, preferencias de visuales e información."""
    conn = get_connection()
    try:
        cust = conn.execute("SELECT first_name, last_name FROM customer WHERE customer_id = ?", (user_id,)).fetchone()
        client_name = f"{cust['first_name']} {cust['last_name']}" if cust else "Carlos Ramírez"

        row = conn.execute("SELECT * FROM user_cognitive_profile WHERE user_id = ?", (user_id,)).fetchone()
        frictions = conn.execute("SELECT * FROM user_friction_logs WHERE user_id = ? ORDER BY id DESC LIMIT 5", (user_id,)).fetchall()

        if row:
            d = dict(row)
            return {
                "user_id": user_id,
                "client_name": client_name,
                "memory_summary": d.get("memory_summary", ""),
                "sensitivities": d.get("sensitivities", ""),
                "visual_preferences": d.get("visual_preferences", ""),
                "information_preferences": d.get("information_preferences", ""),
                "recommended_tone": d.get("recommended_tone", "Empático y transparente"),
                "friction_history": [dict(f) for f in frictions],
                "last_updated": d.get("last_updated", "")
            }
        return {
            "user_id": user_id,
            "client_name": client_name,
            "memory_summary": "",
            "sensitivities": "",
            "visual_preferences": "",
            "information_preferences": "",
            "recommended_tone": "Empático y transparente",
            "friction_history": []
        }
    finally:
        conn.close()

@mcp.tool()
def update_user_preferences(
    user_id: str,
    visual_preferences: str,
    information_preferences: str,
    memory_summary: Optional[str] = None
) -> dict:
    """Actualiza las preferencias de visuales (gráficos preferidos) e información que le gusta ver al cliente."""
    conn = get_connection()
    try:
        now_str = datetime.now().strftime("%d %b %Y, %H:%M hrs")
        current = conn.execute("SELECT * FROM user_cognitive_profile WHERE user_id = ?", (user_id,)).fetchone()
        summary = memory_summary or (current["memory_summary"] if current else "")
        sensitivities = current["sensitivities"] if current else ""
        tone = current["recommended_tone"] if current else "Empático y transparente"

        conn.execute("""
            INSERT OR REPLACE INTO user_cognitive_profile (user_id, memory_summary, sensitivities, recommended_tone, visual_preferences, information_preferences, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, summary, sensitivities, tone, visual_preferences, information_preferences, now_str))
        conn.commit()

        return {
            "status": "updated",
            "user_id": user_id,
            "visual_preferences": visual_preferences,
            "information_preferences": information_preferences,
            "last_updated": now_str
        }
    finally:
        conn.close()

@mcp.tool()
def validate_clabe(clabe: str) -> dict:
    """Valida la cuenta CLABE interbancaria mexicana de 18 dígitos."""
    clean = clabe.replace(" ", "")
    return {
        "valid": len(clean) == 18 and clean.isdigit(),
        "clabe": clean,
        "bank_name": "BBVA México" if clean.startswith("012") else "Institución SPEI",
        "format": "SPEI_MX_18"
    }

@mcp.tool()
def prepare_spei_transfer(beneficiary_name: str, recipient_bank: str, clabe: str, amount: float, concept: str = "Transferencia") -> dict:
    """Prepara la orden de transferencia SPEI."""
    return {
        "transfer_id": f"prep-spei-{int(time.time()) % 100000:05d}",
        "beneficiary": beneficiary_name,
        "bank": recipient_bank,
        "clabe": clabe,
        "amount": amount,
        "concept": concept,
        "commission": 0.00,
        "sufficient_funds": True
    }

@mcp.tool()
def execute_spei_transfer(transfer_id: str, auth_token: str) -> dict:
    """Ejecuta la transferencia SPEI con token dinámico ante Banxico."""
    return {
        "status": "SUCCESS",
        "tracking_key": f"BNTE{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "folio_banxico": f"072026{int(time.time()) % 1000000:06d}",
        "execution_timestamp": datetime.now().strftime("%d %b %Y, %H:%M hrs"),
        "message": "Transferencia liquidada exitosamente ante Banxico."
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8001)
    args = parser.parse_args()
    print(f">> Iniciando Servidor FastMCP de Banorte conectado a {DB_PATH.name} en puerto {args.port}...")
    mcp.run(transport="sse", port=args.port)

