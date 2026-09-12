"""
Reference Standalone FastMCP Server for Person 1 (Database & MCP Server).
Run this with: python backend/mcp_server_mock.py
Exposes banking tools over FastMCP.
"""
import sys
from fastmcp import FastMCP

# Create the FastMCP instance
mcp = FastMCP("banorte-banking-mcp")

# In-memory mock database
DB = {
    "USR-BANORTE-8842": {
        "client_name": "Alejandro Ramírez",
        "card_name": "Tarjeta Banorte Oro",
        "last4": "8842",
        "total_debt": 38450.00,
        "minimum_payment": 3850.00,
        "due_date": "18 Sep 2026",
        "interest_rate": "64.8% CAT",
        "balance_nomina": 48650.00
    }
}

@mcp.tool()
def get_user_debt(user_id: str = "USR-BANORTE-8842") -> dict:
    """Consulta el estado de deuda crediticia y planes de reestructuración."""
    data = DB.get(user_id, DB["USR-BANORTE-8842"])
    return {
        "user_id": user_id,
        "client_name": data["client_name"],
        "card_name": data["card_name"],
        "card_last4": data["last4"],
        "total_debt": data["total_debt"],
        "minimum_payment": data["minimum_payment"],
        "payment_due_date": data["due_date"],
        "interest_rate_annual": data["interest_rate"],
        "eligible_for_restructure": True,
        "options": [
            {"plan_id": "plan_12m", "months": 12, "monthly_payment": 3480.00, "annual_rate": "24.0%", "total_savings": 8900.00},
            {"plan_id": "plan_24m", "months": 24, "monthly_payment": 1920.00, "annual_rate": "22.5%", "total_savings": 14200.00},
            {"plan_id": "plan_36m", "months": 36, "monthly_payment": 1390.00, "annual_rate": "21.0%", "total_savings": 18500.00}
        ]
    }

@mcp.tool()
def commit_restructure(user_id: str, plan_id: str, term_months: int) -> dict:
    """Aplica y guarda en base de datos la reestructuración de deuda."""
    monthly = 1920.00 if term_months == 24 else (3480.00 if term_months == 12 else 1390.00)
    folio = f"FOL-BNTE-2026-R{abs(hash(user_id + plan_id)) % 100000:05d}"
    if user_id in DB:
        DB[user_id]["total_debt"] = 0.00  # Debt converted to fixed restructuring loan
    return {
        "status": "APROBADO",
        "folio_convenio": folio,
        "message": "Reestructuración aplicada exitosamente.",
        "monthly_payment": monthly,
        "term_months": term_months,
        "next_payment_date": "15 Oct 2026",
        "bank_seal": f"BANORTE-CRYPTO-SHA256-{abs(hash(folio)) & 0xFFFFFFFF:08X}"
    }

@mcp.tool()
def get_account_balance(account_type: str = "all") -> dict:
    """Obtiene los saldos de cuentas del cliente."""
    return {
        "client": "Alejandro Ramírez",
        "accounts": [
            {"type": "nomina", "name": "Débito Enlace Digital", "number": "****1234", "available_balance": 48650.00, "currency": "MXN"},
            {"type": "oro", "name": "Tarjeta Banorte Oro", "number": "****8842", "credit_limit": 80000.00, "available_credit": 41550.00, "current_debt": 38450.00, "currency": "MXN"}
        ]
    }

@mcp.tool()
def validate_clabe(clabe: str) -> dict:
    """Valida la cuenta CLABE mexicana de 18 dígitos."""
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
        "transfer_id": "prep-spei-88392",
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
    """Ejecuta la transferencia SPEI con token dinámico."""
    return {
        "status": "SUCCESS",
        "tracking_key": "BNTE202609118492019",
        "folio_banxico": "07202609118921",
        "execution_timestamp": "11 Sep 2026, 14:35 hrs",
        "message": "Transferencia liquidada exitosamente ante Banxico."
    }

@mcp.tool()
def simulate_investment(amount: float, term_days: int) -> dict:
    """Calcula rendimientos para Pagaré Banorte."""
    gain = round(amount * 0.1125 * (term_days / 360), 2)
    return {
        "amount": amount,
        "term_days": term_days,
        "annual_rate": "11.25%",
        "estimated_gain": gain,
        "total_maturity": round(amount + gain, 2)
    }

if __name__ == "__main__":
    port = 8001
    print(f">> Iniciando Servidor FastMCP de Banorte en puerto {port}...")
    mcp.run(transport="sse")
