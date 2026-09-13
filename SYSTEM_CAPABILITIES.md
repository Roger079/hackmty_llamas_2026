# Banorte Maya: Conversational Banking & Generative UI (A2UI)
## Complete Capabilities, Technical Architecture & Competitive Differentiators

> **One-Sentence Thesis:** An enterprise-grade, regulation-compliant Conversational Banking ecosystem that transforms traditional static banking into an autonomous, generative experience—coupling multi-turn cognitive AI with real-time FastMCP core banking, interactive Generative UI (A2UI), biometric 2FA guardrails, and cross-device cloud projection between mobile and desktop command centers.

---

## Complete Capabilities, Technical Architecture & Architectural Differentiators

Maya (mAIa) is an autonomous, multimodal Conversational Banking and Agentic Generative UI (A2UI) platform built specifically for Grupo Financiero Banorte. This document details the end-to-end system capabilities, runtime data flows, architectural contracts, security guardrails, and deterministic resilience mechanisms.

---

## 📑 Document Structure
1. [Core System Capabilities (What the Platform Does)](#1-core-system-capabilities-what-the-platform-does)
2. [Deep-Dive Architecture & Data Flows](#2-deep-dive-architecture--data-flows)
3. [Architectural Differentiators: Traditional Banking vs. Banorte Maya](#3-architectural-differentiators-traditional-banking-vs-banorte-maya)
4. [Agent Operational Blueprint: How an AI Operates This System](#4-agent-operational-blueprint-how-an-ai-operates-this-system)

---

## 1. Core Architectural Philosophy

Unlike typical hackathon chatbots that simply wrap an LLM prompt around mock text, **Banorte Maya** is built on a **four-layer decoupled architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION SURFACES                         │
│   ┌────────────────────────────────┐  ┌────────────────────────────┐   │
│   │ Banorte Móvil PWA (Mobile App) │  │ Power User Command Center  │   │
│   │ (Touch-first, Notch, Biometrics)│  │ (Multi-widget Desktop View)│   │
│   └────────────────┬───────────────┘  └─────────────▲──────────────┘   │
└────────────────────┼────────────────────────────────┼──────────────────┘
                     │ REST / SSE Stream              │ Cloud Projection (SSE)
┌────────────────────▼────────────────────────────────┴──────────────────┐
│                   FASTAPI ORCHESTRATION HIGHWAY                        │
│   - Streaming Tokens & Status Messages (SSE /api/chat/stream)          │
│   - Cross-Device Event Broadcaster (/api/dashboard/events)             │
│   - PWA Service Worker & Manifest Host                                 │
│   - PCI-DSS Message Sanitizer & Security Pipeline                      │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ Multi-turn Tool Loop (google-genai SDK)
┌────────────────────▼───────────────────────────────────────────────────┐
│                    INTELLIGENCE & REASONING LAYER                      │
│   - Google Gemini 3.7 Flash Live Agent                                 │
│   - Strict Banking Domain System Prompts (Mexican Spanish)             │
│   - Autonomous Function Calling over FastMCP Tools                     │
│   - Smart Deterministic Offline Fallback Simulator                     │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ MCP Tool Calls / In-Process FastMCP
┌────────────────────▼───────────────────────────────────────────────────┐
│                    CORE BANKING & PERSISTENCE LAYER                    │
│   - FastMCP Official Banking Server (Protocol-decoupled from LLM)      │
│   - SQLite banco_simulado2.db (Accounts, Credit, Ledger, Transactions) │
│   - Cognitive Memory & Friction Logs (Continuous personalization)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Feature Inventory

### 2.1. Conversational Copilot (Maya) & Intent Engine
* **Context-Aware Banking Identity:** Maya automatically addresses authenticated clients by their real legal name (e.g., *Ana Martínez*, *Carlos Ramírez*, *Silvia Carrasco*) extracted from SQLite views.
* **Mexican Spanish Banking Terminology:** Native vocabulary (e.g., *nómina, saldo disponible, CAT, CLABE interbancaria, corte de tarjeta, pagaré, abono, SPEI, token móvil*).
* **Pure-Text Fallback for Casual Queries:** Unprompted greetings (*"hola"*, *"buenos días"*) and informational questions (*"Háblame sobre el dashboard"*) return clean, human conversational text without forcing unneeded UI cards.
* **Out-of-Domain Guardrails:** Automatically deflects off-topic queries (recipes, jokes, poetry, sports, politics, general coding) back to Banorte financial services.

### 2.2. Interactive Generative UI (A2UI) Component Catalog
Maya doesn't just reply with markdown text; she dynamically emits declarative **A2UI payloads** rendered into interactive React components:

| A2UI Component | Purpose & Interactive Features |
| :--- | :--- |
| **`BanorteBalanceCard`** | Displays consolidated payroll, savings, and credit accounts with masked numbers (`**** 1234`), real available balances, and interactive action buttons (*Transferir*, *Ver movimientos*). |
| **`DebtRestructureCard`** | Displays credit card balance, minimum payment, payment due date, and **3 frozen-rate installment options** (12, 24, 36 months) with calculated interest savings. |
| **`SpeiTransferFormCard`** | In-chat transfer form with pre-filled recipient, bank, CLABE, amount, and quick-contact pills (*Sofía*, *Carlos*, *Mamá*). |
| **`SpeiConfirmCard`** | Transaction summary requiring explicit **2FA Token Móvil authorization** before funds move. |
| **`ConfirmationReceipt`** | Formal digital receipt with official folio (`CONV-BNTE-...` or `SPEI-BNTE-...`), cryptographic hash seal (`0x...`), and download/share actions. |
| **`InvestmentSimulatorCard`** | Interactive investment simulator for **Pagaré Banorte** at **11.25% annual fixed rate** with sliders for amount and term days (28, 91, 182, 364 days). |
| **`FinancialHealthGauge`** | 360° financial diagnosis gauge (0-100 score) evaluating credit utilization, debt-to-income ratio, monthly savings capacity, and interest trap warnings. |
| **`AmortizationScheduleCard`** | Detailed monthly amortization table breaking down fixed payments into principal amortization and declining interest. |
| **`BanorteChartCard`** | Multi-type visual analytics engine supporting **8 chart variants**: Donut, Grouped Bar, Stacked Bar, Line/Trend, **Sankey Cash Flow Diagram**, **Daily Calendar Heatmap**, Treemap, and Waterfall. |

### 2.3. End-to-End SPEI Interbank Transfer Pipeline
* **Algorithmic CLABE Validation:** Validates 18-digit Mexican interbank CLABEs, verifies length, digit composition, and automatically resolves issuing bank codes (e.g., `012` -> BBVA, `014` -> Santander, `072` -> Banorte, `002` -> Banamex).
* **Two-Phase Commit:**
  1. `prepare_spei_transfer`: Verifies balance sufficiency, reserves transaction ID, and generates `SpeiConfirmCard`.
  2. `execute_spei_transfer`: Executes strict atomic database transaction (`BEGIN TRANSACTION`), records entry in `bank_transaction`, deducts balance from `account_balance`, and generates Banxico CEP tracking key (`BNTE2026...`).

### 2.4. Debt Restructuring & Financial Relief Engine
* **Automatic CAT & Interest Calculation:** Evaluates active credit card debt against 64.8% CAT revolving interest.
* **Frozen Rate Restructuring (Convenio Banorte):**
  - **12 Months:** 24.0% fixed rate (28% interest savings).
  - **24 Months (Recommended):** 22.5% fixed rate (45% interest savings).
  - **36 Months:** 21.0% fixed rate (55% interest savings, minimal monthly payment).
* **Cryptographic Sello Digital:** Produces verifiable digital signature stamp and immutable agreement folio in SQLite.

### 2.5. Multi-Surface Architecture & Cross-Device Cloud Projection
* **Two Specialized Frontends in One:**
  1. **Mobile Shell (`Banorte Móvil`):** Native app simulator with iPhone frame, dynamic island/notch, battery/WiFi indicators, bottom navigation bar, and installable PWA manifest.
  2. **Power User Command Center (`Web Dashboard`):** Full-screen multi-widget workspace for laptops and desktop monitors, showing multiple financial charts simultaneously.
* **Instant Cross-Device Projection (Cloud Push):**
  - A user conversing with Maya on their smartphone can say *"Manda esta gráfica a mi dashboard"* or tap **Enviar a Dashboard**.
  - FastAPI receives the widget and broadcasts it in real-time via **Server-Sent Events (SSE)** (`/api/dashboard/events`).
  - The desktop monitor renders the widget instantly without page reload.
* **Progressive Web App (PWA):**
  - Includes `manifest.webmanifest`, app icons (192px and 512px), and a dedicated Service Worker (`sw.js`) enabling homescreen installation on Android/iOS.

### 2.6. FastMCP Core Banking Protocol & Dual-Transport Engine
* **Model Context Protocol Implementation:** Exposes standard FastMCP banking tools (`get_account_balance`, `get_user_debt`, `commit_restructure`, `get_recent_transactions`, `execute_spei_transfer`, `get_spending_analytics`, etc.).
* **Decoupled Security:** The LLM never sees SQL code; it can only invoke strictly typed, schema-validated MCP tool signatures.
* **Dual Transport Architecture:**
  - *Remote Mode:* Connects via HTTP/SSE to an external FastMCP server on port 8001.
  - *In-Process Mode:* If port 8001 is offline, it seamlessly falls back to direct SQLite access with zero latency, eliminating multi-process fragility.
* **FastMCP Telemetry Inspector:**
  - Discrete header button opening a live sliding telemetry drawer.
  - Shows real-time tool names, execution status, latency in milliseconds, arguments, and full JSON payloads for judges and developers.

### 2.7. Persistent Cognitive Memory & Friction Tracking
* **SQLite Cognitive Store (`user_cognitive_profile`):**
  - Records user sensitivities (e.g., *"Anxious about payments over $2,000 MXN"*), preferred communication tone (*"Empático y enfocado en liquidez"*), and visual preferences.
  - Persists across browser refreshes and sessions.
* **Friction Event Logging (`user_friction_log`):**
  - Automatically flags stress signals (*HIGH_PAYMENT_STRESS*, *OVERDUE_PANIC*, *INTEREST_CONFUSION*) and adapts future explanations accordingly.
* **Right to be Forgotten (GDPR / LFPDPPP):**
  - `DELETE /api/chat/history` completely purges conversation tables on request.

### 2.8. Regulatory Security, PCI-DSS & 2FA Token Móvil Guardrails
* **PCI-DSS Compliance ([`security.py`](file:///c:/Users/rogel/OneDrive/Documents/GitHub/hackmty_llamas_2026/backend/app/security.py)):**
  - **Card PAN Masking:** Automatically transforms 15-16 digit card numbers into `**** **** **** 1234`.
  - **CLABE Masking:** Obfuscates 18-digit CLABEs into `*** *** ********** 1234`.
  - **OTP & CVV Redaction:** Instantly scrubs one-time passwords, security codes, and CVVs before persisting to database or sending to LLM context.
  - **Anti-Prompt Injection:** Neutralizes jailbreaks and instruction override attempts (*"ignore all previous instructions"*) before consolidating memory.
* **Banxico Circular 14/2017 Enforcement:**
  - **No Text Authorizations:** If a user types *"autorizo la transferencia"*, *"hazlo"* or *"confirmo el pago"* in the chat, Maya refuses and enforces clicking the interactive **Autorizar con Token Móvil** biometric button.

### 2.9. High-Fidelity Deterministic Simulator (100% Offline Resilience)
* If the Gemini API key is missing, network WiFi fails on stage, or Google API quotas hit `429 Too Many Requests`, the backend automatically switches to `_run_smart_simulation`.
* **Zero Demo Breakage:** The simulator reproduces the exact multi-step tool calls, data queries, math calculations, and A2UI payloads deterministically. The judges will never see an error screen.

---

## 3. Architectural Differentiators: Traditional Banking vs. Banorte Maya

| Feature / Dimension | Traditional Banking Chatbots | Banorte Maya (A2UI & FastMCP) | Value for Banorte & Users |
| :--- | :--- | :--- | :--- |
| **Real Transactional Core** | Static synthetic notes only; no balance deductions or interbank routing. | Full SQLite banking core (`BEGIN TRANSACTION`, balance deductions, CEP receipts). | Proves real viability for production core integration. |
| **Multi-Surface & Cloud Sync** | Single static web page; no cross-device concept. | **Native Mobile PWA + Command Center Desktop** with real-time SSE widget projection. | Addresses both retail mobile users and Power Users managing complex portfolios. |
| **Generative UI (A2UI)** | Plain HTML tables, generic forms, or text walls. | Declarative A2UI catalog: Sankey, Calendar Heatmaps, Donut, Bar, Amortization, Gauges. | Drastically reduces cognitive load and turns financial data into actionable visuals. |
| **Regulatory 2FA Guardrail** | Allows direct text confirmation or bypasses auth entirely. | **Enforces Banxico Circular 14/2017**: blocks chat text authorizations; mandates Token Móvil. | Critical compliance requirement for any regulated financial institution. |
| **PCI-DSS Data Sanitization** | Raw text saved directly into database or sent to LLM. | Pre-storage regex masking of PANs, CLABEs, and automatic redaction of CVVs and OTPs. | Protects client privacy and prevents credential leakage into LLM training contexts. |
| **Protocol Visibility** | Tool calls hidden in private logs without inspection. | **Live FastMCP Telemetry Inspector** drawer in the UI displaying latency and tool payloads. | Allows technical auditors to verify protocol integrity with a single click. |
| **Stage & Offline Reliability** | Crashes if external APIs or network connectivity fail. | **Smart Deterministic Offline Fallback**: 100% features work without internet or API keys. | Zero risk of downtime during critical operations or presentations. |

---

## 4. Agent Operational Blueprint: How an AI Operates This System

When an autonomous AI agent interacts with or extends this codebase, it must follow these **architectural contracts**:

### Contract 1: The Human-In-The-Loop (HITL) Action Context
Interactive cards emit an `ActionContext` when tapped:
```json
{
  "action": "commit_restructure",
  "params": { "plan_id": "plan_24m", "term_months": 24 },
  "source_component": "DebtRestructureCard"
}
```
* The orchestrator intercepts `request.action_context` **first** before evaluating natural language text.
* The agent must execute the corresponding FastMCP mutation tool (`commit_restructure` or `execute_spei_transfer`) and return the resulting `ConfirmationReceipt`.

### Contract 2: The A2UI Payload Schema
To render UI elements, the agent must return an `A2UIPayload` conforming to:
```python
A2UIPayload(
    component="SpendingDonutCard",  # Registered React component name
    props={ ... },                  # Data matching component prop types
    action_schema={ ... }          # Action metadata for interactive buttons
)
```
Multiple components can be returned simultaneously using the `a2uis` list (e.g., Donut Chart + Historical Bar Trend).

### Contract 3: Surface-Aware Widget Routing
* If `request.surface == "dashboard"`, responses must prioritize data-dense analytics and command center components.
* If user asks to *"mandar al dashboard"* or *"proyectar"*, the orchestrator persists the widget to the user's dashboard registry and pushes it to desktop subscribers via SSE.

### Contract 4: Data Sanitization Rule
* Never bypass `sanitize_banking_message()` when persisting messages.
* Never store full 16-digit PANs or 18-digit CLABEs in plaintext logs or chat history.

---

*Authored for the Banorte × Tec Hackathon 2026. Built with FastAPI, FastMCP, React 18, Tailwind CSS, Google Gemini 3.7 Flash, and SQLite.*
