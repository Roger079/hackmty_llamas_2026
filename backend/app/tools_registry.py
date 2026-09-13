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
        "description": "ADVERTENCIA DE SEGURIDAD BANCARIA: Esta herramienta SOLO puede ser ejecutada mediante el evento interactivo de interfaz (action_context) cuando el usuario pulsa 'Aplicar plan' en DebtRestructureCard. NUNCA la invoques en respuesta a mensajes de texto del usuario (como 'autorizo', 'autorizas', 'acepto', 'sí'). Si el usuario escribe texto en el chat, indícale que debe presionar el botón en la tarjeta A2UI.",
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
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador del cliente autenticado (ej. 'C001', 'C002', 'USR-BANORTE-8842')"
                },
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
        "description": "Prepara una orden de transferencia SPEI calculando comisiones y verificando saldo. Tras ejecutarla, muestra siempre SpeiConfirmCard con render_a2ui e indícale al usuario que debe presionar el botón 'Autorizar con Token Móvil' en la tarjeta interactiva. NUNCA pidas confirmación por chat ni solicites que el usuario escriba su token o 'autorizo'.",
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
        "description": "ADVERTENCIA DE SEGURIDAD CRÍTICA: Esta herramienta SOLO puede ser invocada mediante el evento interactivo de interfaz (action_context) cuando el usuario pulsa 'Autorizar con Token Móvil' en SpeiConfirmCard. NUNCA la invoques en respuesta a mensajes de chat de texto como 'autorizo', 'autorizas' o 'confirmo'. Si el usuario escribe su confirmación en el chat, indícale que debe presionar el botón interactivo en la tarjeta A2UI.",
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
                    "description": "Plazo de la inversión en días (ej. 28, 60, 91, 182, 360)"
                }
            },
            "required": ["amount", "term_days"]
        }
    },
    {
        "name": "get_spending_analytics",
        "description": "Obtiene el análisis de gastos del cliente desglosado por categorías (Supermercado, Restaurantes, Servicios, etc.) y comercios principales en SQLite para gráficos como SpendingDonutCard o BarChart. Acepta cualquier mes o periodo solicitado (ej. 'febrero 2025', 'marzo 2024', 'agosto 2026', 'current_month'). Si el mes solicitado no tiene transacciones registradas, la herramienta calcula y retorna automáticamente los datos del periodo más reciente disponible indicando is_fallback=True.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador del cliente (ej. 'C001', 'C002', 'C003')"
                },
                "period": {
                    "type": "STRING",
                    "description": "Mes o periodo a consultar (ej. 'enero 2025', 'marzo 2024', 'agosto 2026', 'last_month', 'current_month')"
                }
            },
            "required": []
        }
    },
    {
        "name": "get_historical_income_expense_trend",
        "description": "Obtiene una serie mensual comparable de ingresos y gastos para gráficos de barras agrupadas o líneas. Respeta el número de meses solicitado y marca ingresos como estimados si el ledger de demostración no contiene depósitos históricos.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador del cliente"
                },
                "months": {
                    "type": "INTEGER",
                    "description": "Número de meses a comparar, de 1 a 12"
                }
            },
            "required": ["user_id", "months"]
        }
    },
    {
        "name": "get_financial_health_score",
        "description": "Calcula un diagnóstico 360° de salud financiera: score de 0 a 100, semáforo, ratio de uso de crédito (deuda vs límite), riesgo de trampa de intereses en pago mínimo y radar de dimensiones financieras.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador del cliente"
                }
            },
            "required": []
        }
    },
    {
        "name": "simulate_amortization_schedule",
        "description": "Calcula la tabla y curva de amortización mes a mes para crédito o tarjeta (capital vs interés, saldo insoluto, ahorro con pagos anticipados).",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "debt_amount": {
                    "type": "NUMBER",
                    "description": "Monto de la deuda o crédito a simular"
                },
                "annual_rate": {
                    "type": "NUMBER",
                    "description": "Tasa anual ordinaria en porcentaje (ej. 22.5)"
                },
                "term_months": {
                    "type": "INTEGER",
                    "description": "Plazo en meses (ej. 12, 24, 36)"
                },
                "extra_monthly_payment": {
                    "type": "NUMBER",
                    "description": "Abono adicional a capital cada mes"
                }
            },
            "required": ["debt_amount", "term_months"]
        }
    },
    {
        "name": "log_user_friction",
        "description": "Registra en la base de datos bancaria un momento de fricción, duda, molestia o estrés financiero expresado por el cliente (ej. queja de mensualidades altas, objeción de comisiones o CAT, dificultad para llegar a fin de quincena) para adaptar la memoria cognitiva de futuras sesiones.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "friction_category": {
                    "type": "STRING",
                    "enum": [
                        "HIGH_PAYMENT_STRESS",
                        "INTEREST_RATE_OBJECTION",
                        "LIQUIDITY_ANXIETY",
                        "TRANSFER_CONFUSION",
                        "FEE_DISSATISFACTION",
                        "GENERAL_HESITATION"
                    ],
                    "description": "Categoría del punto de fricción detectado"
                },
                "trigger_snippet": {
                    "type": "STRING",
                    "description": "Cita o contexto breve de lo que expresó el cliente"
                },
                "severity": {
                    "type": "STRING",
                    "enum": ["LOW", "MEDIUM", "HIGH"],
                    "description": "Nivel de severidad o estrés del cliente"
                }
            },
            "required": ["friction_category", "trigger_snippet"]
        }
    },

    {
        "name": "add_spei_contact",
        "description": "Registra un nuevo destinatario o contacto para transferencias SPEI en la base de datos bancaria del cliente, respaldado por validación de la CLABE de 18 dígitos y detección de banco receptor.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "ID del cliente autenticado (ej. 'C001', 'C002')"
                },
                "beneficiary_name": {
                    "type": "STRING",
                    "description": "Nombre completo del beneficiario"
                },
                "recipient_bank": {
                    "type": "STRING",
                    "description": "Nombre del banco receptor (ej. 'BBVA México', 'Nu México', 'Banorte')"
                },
                "clabe": {
                    "type": "STRING",
                    "description": "Cuenta CLABE interbancaria de 18 dígitos"
                },
                "alias": {
                    "type": "STRING",
                    "description": "Alias opcional para identificar la cuenta rápidamente"
                }
            },
            "required": ["beneficiary_name", "clabe"]
        }
    },
    # --- HERRAMIENTA DE PERSONA 2: MOTOR A2UI (AGENT-TO-USER INTERFACE) ---
    {
        "name": "render_a2ui",
        "description": "Emite una especificación JSON declarativa para renderizar un componente interactivo o gráfico en el frontend de Banorte (A2UI). Cumple con el Catálogo A2UI Banca Visuals v1.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "component": {
                    "type": "STRING",
                    "description": "Nombre exacto del componente Banorte a renderizar: 'SpeiTransferFormCard' (formulario interactivo para capturar/editar transferencias SPEI antes de autorizar), 'SpeiConfirmCard' (autorización final con Token Móvil), 'SpeiReceiptCard' (comprobante digital con folio CEP), 'Chart', 'KpiCard', 'ProgressIndicator', 'DataTable', 'ComparisonTable', 'Timeline', 'GeoMap', 'SpendingDonutCard', 'FinancialHealthGauge', 'DebtRestructureCard', 'ConfirmationReceipt', 'BanorteBalanceCard', 'BarChart', 'LineChart', 'AreaChart', 'StackedBarChart'"
                },
                "props": {
                    "type": "OBJECT",
                    "description": "Propiedades requeridas por el componente React para su renderizado según el catálogo banca_visuals_catalog.json. Para BanorteChartCard o Chart, incluye chartType ('sankey', 'calendarHeatmap', 'bar', 'line', 'treemap', 'waterfall') y su estructura de datos.",
                    "properties": {}
                }
            },
            "required": ["component", "props"]
        }
    },
    # --- HERRAMIENTA DE GESTIÓN DE WIDGETS EN PANTALLA PRINCIPAL (MAYA BOT) ---
    {
        "name": "manage_home_widgets",
        "description": "Gestiona y personaliza los widgets fijados en la pantalla de inicio ('Para ti') de la banca móvil del cliente. Invocable cuando el cliente solicite por chat agregar, quitar, reordenar o consultar los widgets de su pantalla de inicio o pantalla principal.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "user_id": {
                    "type": "STRING",
                    "description": "Identificador del cliente autenticado (ej. 'C001', 'C002', 'C003')"
                },
                "action": {
                    "type": "STRING",
                    "enum": ["add", "remove", "reorder", "reset", "list"],
                    "description": "Acción sobre los widgets de inicio: 'add' (agregar), 'remove' (quitar), 'reorder' (reordenar), 'reset' (restablecer predeterminados), 'list' (consultar)"
                },
                "widget_type": {
                    "type": "STRING",
                    "description": "Tipo de widget a agregar o remover: 'financial_health', 'spending_donut', 'investment_simulator', 'debt_restructure', 'spei_transfer_form', 'rent_payment', 'weekly_spending', 'investment_quick'"
                },
                "new_order": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Lista ordenada con los nombres o IDs de los widgets para la acción 'reorder' (ej. ['renta', 'inversion', 'gastos'])"
                }
            },
            "required": ["action"]
        }
    }
]
