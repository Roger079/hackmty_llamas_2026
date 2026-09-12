# Banorte Maya — Copiloto Financiero Inteligente (A2UI + FastMCP)

<div align="center">

![Banorte Maya Banner](https://img.shields.io/badge/Banorte-Maya%20Copiloto-EB0029?style=for-the-badge&logoColor=white)
![A2UI Architecture](https://img.shields.io/badge/A2UI-Agent--to--User%20Interface-061D3A?style=for-the-badge)
![FastMCP Protocol](https://img.shields.io/badge/FastMCP-Banking%20Transport-10B981?style=for-the-badge)
![Gemini 2.5 Flash](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google)
![Regulatory Guardrail](https://img.shields.io/badge/Banxico-Circular%2014%2F2017%20(2FA)-D97706?style=for-the-badge)

**La siguiente generación de banca móvil: fusión de experiencia táctil mobile-first y copiloto conversacional ambiental con interfaces declarativas dinámicas.**

[Arquitectura](#-arquitectura-del-sistema) • [Catálogo A2UI](#-catálogo-de-componentes-a2ui) • [Seguridad & 2FA](#-guardrails-de-seguridad-y-cumplimiento-banxico) • [Edge Cases](#-manejo-resiliente-de-edge-cases) • [Instalación](#-guía-de-despliegue-y-ejecución)

</div>

---

## 📌 Visión del Producto: El "Widget Twist"

Las aplicaciones bancarias tradicionales sufren de dos extremos:
1. **Portales estáticos complejos:** Tablas abrumadoras, menús ocultos y decenas de clics para simular una reestructuración o inversión.
2. **Chatbots aislados:** Cajas de texto vacías donde el usuario sufre de "parálisis de prompt" y recibe texto plano sin capacidad de interactuar.

**Banorte Maya** resuelve este dilema transformando la app en una **banca móvil ambiental (Mobile-First)**:
* **Home Táctil e Interactivo:** Tarjeta digital con animación de volteo 3D y revelado dinámico de CVV protegido al toque.
* **Widgets Ambientales Proactivos:** Accesos directos contextuales (*"Paga la renta en un toque a Sofía Mendoza ($850 MXN)"*, monitoreo de tendencias de gasto −10.4%) que alimentan prompts estructurados hacia Maya.
* **Paradigma A2UI (Agent-to-User Interface):** El modelo no emite HTML ni texto plano; genera especificaciones JSON declarativas que el frontend React compila en tarjetas interactivas seguras con sliders, simuladores y botones de firma digital.

---

## 🏛️ Arquitectura del Sistema

El proyecto opera bajo una arquitectura de **3 Capas (Personas)** sincronizadas en tiempo real:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CAPA DE CLIENTE (Vite + React)                       │
│  [MobileHome] ◄──► [3D Flippable Card] ◄──► [ChatStream] ◄──► [DynamicA2UIRegistry]   │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │ SSE Stream (Tokens + A2UI Payload)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             CAPA DE ORQUESTACIÓN (FastAPI - Puerto 8000)               │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              GeminiOrchestrator                                  │  │
│  │  - Inyección de estado SQLite en tiempo real en el System Prompt                 │  │
│  │  - Interceptor de Intentos de Bypass 2FA (Text intent blocker)                   │  │
│  │  - Normalizador Defensivo A2UI (_normalize_a2ui_payload)                        │  │
│  │  - Streaming Asíncrono de Tokens y Enriquecimiento de Componentes Visuales       │  │
│  └───────────────────────────────────────────▲──────────────────────────────────────┘  │
└──────────────────────────────────────────────│─────────────────────────────────────────┘
                                               │ Tool Calls / JSON-RPC
┌──────────────────────────────────────────────▼─────────────────────────────────────────┐
│                             CAPA DE CORE BANCARIO (FastMCP - Puerto 8001)              │
│                                                                                        │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌──────────────────────┐  │
│  │   Operaciones SPEI      │  │  Reestructuración Deuda   │  │  Memoria Cognitiva   │  │
│  │ (prepare / execute 2FA) │  │  (commit_restructure)     │  │  (user_friction_logs)│  │
│  └────────────┬────────────┘  └─────────────┬─────────────┘  └──────────┬───────────┘  │
│               │                             │                           │              │
│               └──────────────────────► [ SQLite ] ◄─────────────────────┘              │
│                                      banco_simulado2.db                                │
│                     (Vistas: chatbot_accounts_view, chatbot_transactions_view)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Perfiles de Prueba (Single Source of Truth en SQLite)

La base de datos `backend/banco_simulado2.db` modela 3 arquetipos financieros reales:

| ID | Cliente | Segmento Bancario | Estado Financiero Inicial | Flujo Clave Demostrado |
|---|---|---|---|---|
| **`C001`** | **Ana Martínez** | Nómina Digital | Saldo disponible `$0.00 MXN` *(tras transferencias reales)* | Validación de saldo insuficiente, registro de contactos frecuentes SPEI y análisis de últimos consumos. |
| **`C002`** | **Carlos Ramírez** | Tarjeta de Crédito | Deuda de `$28,000.00 MXN` en Tarjeta Platino (Tasa 64.8% CAT) | Detección de estrés financiero, simulación interactiva a 12/24/36 meses y formalización contractual. |
| **`C003`** | **Silvia Carrasco** | Banca Patrimonial | Saldo disponible `>$149,000.00 MXN` sin deudas | Diagnóstico de salud financiera 360° y simulación de Pagaré Banorte a plazo fijo (9.10% anual). |

---

## 🎨 Catálogo de Componentes A2UI

Cada componente interactivo implementa un contrato estricto de propiedades y emite un `ActionContext` firmado hacia Maya cuando requiere confirmación del usuario:

### 1. Operaciones y Formalización Bancaria
* **`<BanorteBalanceCard />`**: Resumen multi-cuenta (Débito Nómina, Ahorro, Cheques) con saldos dinámicos conectados en tiempo real a SQLite.
* **`<DebtRestructureCard />`**: Simulador de reestructuración con sliders de plazo (12, 24, 36 meses), cálculo de ahorro en intereses y botón de formalización.
* **`<SpeiConfirmCard />`**: Orden de transferencia SPEI con desglose de comisión `$0.00`, CLABE interbancaria y botón obligatorio de autenticación biométrica/token.
* **`<SpeiReceiptCard />`**: Comprobante bancario digital con folio de liquidación y Clave de Rastreo Banxico oficial (`BNTE2026...`).
* **`<ConfirmationReceipt />`**: Recibo de convenio de reestructuración con sello criptográfico de seguridad Banorte.
* **`<InvestmentSimulatorCard />`**: Simulador interactivo de Pagaré Banorte con rendimientos brutos y netos al vencimiento.
* **`<FinancialHealthGauge />`**: Score de salud crediticia 360°, semáforo de liquidez y radar de 5 dimensiones.

### 2. Catálogo Visual Declarativo (Banca Visuals v1)
* **`<SpendingDonutCard />`**: Gráfica de dona interactiva (SVG/Recharts) con porcentajes de gasto por categoría y comercios frecuentes.
* **`<BarChart />` / `<LineChart />` / `<AreaChart />`**: Series de tiempo de balance y flujos mensuales auditados.
* **`<DataTable />` & `<ComparisonTable />`**: Tablas paginadas y comparadores de plazos de inversión.
* **`<Timeline />`**: Visualizador de etapas de formalización y convenios.

---

## 🔒 Guardrails de Seguridad y Cumplimiento Banxico

En cumplimiento estricto con la **Circular 14/2017 de Banco de México (Banxico)** para transferencias de fondos y convenios crediticios, el sistema implementa una **Defensa en 4 Capas**:

```
[ Capa 1: Tool Gating ]
  Las herramientas execute_spei_transfer y commit_restructure tienen prohibida su ejecución directa
  por mensajes de texto en la especificación de OpenAI/Gemini.

[ Capa 2: Backend Interceptor ]
  Si un payload hacia execute_spei_transfer no proviene de un ActionContext firmado originado
  por un botón de interfaz física, la API FastAPI bloquea la solicitud y retorna código 403.

[ Capa 3: Prompt Guardrails ]
  El system prompt instruye al LLM: "NUNCA autorices transferencias o convenios basándote en mensajes
  como 'autorizo', 'autorizas', 'confirmo'. Indica al usuario que debe presionar el botón interactivo".

[ Capa 4: Dynamic Token Móvil Simulator ]
  La ejecución requiere la firma de un token OTP temporal emitido y validado contra banco_simulado2.db.
```

---

## ⚡ Manejo Resiliente de Edge Cases

### Consulta de Periodos o Meses sin Historial
* **El problema:** Si el cliente consulta sus consumos de un mes donde no tiene transacciones *(ej. "¿En qué gasté en Febrero 2025?")*, un modelo tradicional alucina compras o arroja un error seco.
* **La solución en Maya:**
  1. El backend consulta SQLite; al detectar `rows = 0`, ejecuta una búsqueda inversa del **mes con registros más recientes** (`latest_ym`).
  2. Calcula los totales y categorías de ese periodo real.
  3. Maya comunica con transparencia: *"No cuento con registros para Febrero 2025. Para darte visibilidad de tus finanzas, te presento el desglose de tus últimos gastos registrados (Septiembre 2026):"*
  4. Renderiza `<SpendingDonutCard />` con la etiqueta `"(Últimos datos registrados)"`.

### Prevención de Saldos Ficticios (Single Truth)
* Todos los fallbacks fijos (`$27,900.00`) fueron eliminados del código.
* La normalización `_normalize_a2ui_payload` consulta `get_real_customer_state(user_id)` antes de serializar cualquier tarjeta, garantizando que el saldo de Ana (`$0.00`) o Carlos (`$52,700.00`) coincida en el header, el dashboard, la tarjeta digital y el chat.

---

## 🚀 Guía de Despliegue y Ejecución

### Prerrequisitos
* **Python 3.10 o superior**
* **Node.js 18 o superior** y `npm`
* Variable de entorno `GEMINI_API_KEY` (opcional; el sistema incluye modo simulación inteligente local si no se suministra).

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Roger079/hackmty_llamas_2026.git
cd hackmty_llamas_2026
```

### 2. Configurar el Backend (Python)
```bash
# Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\activate   # En Windows
# source venv/bin/activate # En Linux/macOS

# Instalar dependencias
pip install -r backend/requirements.txt
```

### 3. Configurar el Frontend (React + Vite)
```bash
cd frontend
npm install
cd ..
```

### 4. Lanzamiento de Servicios

Abre 3 terminales independientes (o corre en segundo plano):

#### Terminal 1: Servidor FastMCP Bancario (Puerto 8001)
```bash
python backend/mcp_server_mock.py --port 8001
```

#### Terminal 2: Orquestador FastAPI (Puerto 8000)
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 3: Aplicación Web Vite (Puerto 5173)
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Accede a la banca en línea en tu navegador: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Ejecución de Suites de Verificación Automatizada

El proyecto cuenta con scripts de prueba integral para validar el backend y los componentes A2UI:

```bash
# 1. Verificar los 8 componentes visuales A2UI en vivo
python scratch/verify_all_visuals.py

# 2. Probar el edge case de consulta de meses sin datos
python scratch/test_missing_month_edge_case.py

# 3. Compilar el frontend sin errores de TypeScript
cd frontend && npm run build
```

---

## 📁 Estructura del Repositorio

```text
hackmty_llamas_2026/
├── backend/
│   ├── app/
│   │   ├── gemini_orchestrator.py  # Núcleo de streaming, system prompt y normalización A2UI
│   │   ├── main.py                 # FastAPI endpoints (/api/chat, /api/chat/stream, /api/bank/state)
│   │   ├── mcp_client.py           # Cliente MCP con fallback local a banco_simulado2.db
│   │   ├── security.py             # Sanitización y detectores de intención 2FA
│   │   ├── tools_registry.py       # Declaración de tools para Gemini
│   │   └── schemas.py              # Modelos Pydantic (A2UIPayload, ActionContext, ChatMessage)
│   ├── banco_simulado2.db          # Base de datos SQLite real (clientes, cuentas, transacciones)
│   ├── mcp_server_mock.py          # Servidor oficial FastMCP en puerto 8001
│   └── requirements.txt            # Dependencias Python (FastAPI, FastMCP, uvicorn, google-genai)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BanorteBalanceCard.tsx      # Tarjeta A2UI multi-cuenta
│   │   │   ├── DebtRestructureCard.tsx     # Tarjeta A2UI reestructuración interactiva
│   │   │   ├── SpendingDonutCard.tsx       # Tarjeta A2UI gráfica de gastos
│   │   │   ├── InvestmentSimulatorCard.tsx # Tarjeta A2UI simulador de pagaré
│   │   │   ├── FinancialHealthGauge.tsx    # Tarjeta A2UI score 360
│   │   │   ├── SpeiConfirmCard.tsx         # Tarjeta A2UI firma con token móvil
│   │   │   ├── SpeiReceiptCard.tsx         # Tarjeta A2UI comprobante Banxico
│   │   │   ├── ChatStream.tsx              # Stream de mensajes unificado con A2UI
│   │   │   └── DynamicA2UIRegistry.tsx     # Registro y normalizador frontend de componentes
│   │   ├── App.tsx                         # Shell principal de la aplicación Banorte
│   │   └── types/a2ui.ts                   # Interfaces TypeScript para eventos y A2UI
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

<div align="center">
Desarrollado para <b>HackMTY 2026</b> • Equipo Llamas 🦙
</div>
