from typing import Any, Dict, List

# Declaración de herramientas para Gemini en formato Google GenAI / OpenAI compatible
TOOL_DECLARATIONS: List[Dict[str, Any]] = [
    # --- HERRAMIENTAS DE PERSONA 1: BANCA & MCP (DATABASE ACTIONS) ---
    {
        "name": "get_user_debt",
        "description": "Consulta el estado de deuda crediticia de tarjetas de crédito Banorte del cliente, incluyendo saldo total, pago mínimo, tasa de interés anual ordinaria, fecha límite de pago y elegibilidad para reestructuración de pasivos.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador único del cliente autenticado (ej. 'USR-BANORTE-8842')"
                }
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "commit_restructure",
        "description": "Aplica y guarda en la base de datos bancaria el plan de reestructuración de deuda seleccionado por el cliente, congelando intereses moratorios y generando un nuevo calendario de pagos fijos.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador único del cliente"
                },
                "plan_id": {
                    "type": "STRING",
                    "description": "Identificador del plan elegido (ej. 'plan_12m', 'plan_24m', 'plan_36m')"
                },
                "term_months": {
                    "type": "INTEGER",
                    "description": "Plazo convenido en meses (12, 24 o 36)"
                }
            },
            "required": ["user_id", "plan_id", "term_months"]
        }
    },
    {
        "name": "get_account_balance",
        "description": "Obtiene los saldos disponibles y retenidos de las cuentas de débito, crédito e inversión del cliente Banorte.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "account_type": {
                    "type": "STRING",
                    "enum": ["all", "nomina", "oro", "inversion"],
                    "description": "Tipo de cuenta a consultar o 'all' para todas las cuentas."
                }
            },
            "required": []
        }
    },
    {
        "name": "validate_clabe",
        "description": "Valida la estructura de una cuenta CLABE interbancaria mexicana de 18 dígitos y detecta el banco emisor.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "clabe": {
                    "type": "STRING",
                    "description": "CLABE interbancaria de 18 dígitos numéricos"
                }
            },
            "required": ["clabe"]
        }
    },
    {
        "name": "prepare_spei_transfer",
        "description": "Prepara una transferencia SPEI calculando comisiones, verificando saldo suficiente y generando el identificador de autorización preliminar.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "beneficiary_name": {
                    "type": "STRING",
                    "description": "Nombre completo del beneficiario"
                },
                "recipient_bank": {
                    "type": "STRING",
                    "description": "Nombre de la institución bancaria receptora (ej. 'BBVA México', 'Santander')"
                },
                "clabe": {
                    "type": "STRING",
                    "description": "Cuenta CLABE o número de tarjeta receptora (18 o 16 dígitos)"
                },
                "amount": {
                    "type": "NUMBER",
                    "description": "Monto en MXN a transferir"
                },
                "concept": {
                    "type": "STRING",
                    "description": "Concepto o motivo del pago (máx 35 caracteres)"
                }
            },
            "required": ["beneficiary_name", "recipient_bank", "clabe", "amount"]
        }
    },
    {
        "name": "execute_spei_transfer",
        "description": "Ejecuta de manera definitiva la transferencia SPEI mediante autenticación del Token Móvil Banorte y genera la Clave de Rastreo Banxico oficial.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "transfer_id": {
                    "type": "STRING",
                    "description": "ID de la transferencia previamente preparada"
                },
                "auth_token": {
                    "type": "STRING",
                    "description": "Código o token dinámico de seguridad"
                }
            },
            "required": ["transfer_id", "auth_token"]
        }
    },
    {
        "name": "simulate_investment",
        "description": "Calcula el rendimiento y ganancia estimada para Pagaré Banorte a plazo fijo.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "amount": {
                    "type": "NUMBER",
                    "description": "Monto en MXN a invertir"
                },
                "term_days": {
                    "type": "INTEGER",
                    "enum": [28, 60, 91, 182, 360],
                    "description": "Plazo de la inversión en días"
                }
            },
            "required": ["amount", "term_days"]
        }
    },

    # --- HERRAMIENTA DE PERSONA 2: MOTOR A2UI (AGENT-TO-USER INTERFACE) ---
    {
        "name": "render_a2ui",
        "description": "Emite una especificación JSON declarativa para que el frontend de Banorte renderice un componente enriquecido e interactivo dentro del chat (A2UI). Úsala para presentar tarjetas de reestructuración de deuda, comprobantes de pago, tarjetas de saldo o simuladores financieros.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "component": {
                    "type": "STRING",
                    "enum": [
                        "DebtRestructureCard",
                        "ConfirmationReceipt",
                        "SpeiConfirmCard",
                        "SpeiReceiptCard",
                        "BanorteBalanceCard",
                        "InvestmentSimulatorCard"
                    ],
                    "description": "Nombre exacto del componente Banorte a renderizar"
                },
                "props": {
                    "type": "OBJECT",
                    "description": "Propiedades que el componente React requiere para su renderizado",
                    "properties": {}
                }
            },
            "required": ["component", "props"]
        }
    }
]
