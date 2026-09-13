# Banorte Maya: Conversational Banking and Agentic Generative UI (A2UI)

<div align="center">

![Banorte Maya](https://img.shields.io/badge/Banorte-Maya%20Copilot-EB0029?style=for-the-badge&logoColor=white)
![A2UI Architecture](https://img.shields.io/badge/A2UI-Agentic%20Generative%20UI-061D3A?style=for-the-badge)
![FastMCP Protocol](https://img.shields.io/badge/FastMCP-Banking%20Transport-10B981?style=for-the-badge)
![Gemini 3.7 Flash](https://img.shields.io/badge/AI%20Engine-Gemini%203.7%20Flash-4285F4?style=for-the-badge&logo=google)
![Banxico Circular 14/2017](https://img.shields.io/badge/Banxico-2FA%20Token%20M%C3%B3vil-D97706?style=for-the-badge)

**A next-generation conversational banking web application combining mobile-first touch banking, an enterprise desktop command center, and an autonomous Agentic Visualization Engine powered by Google Gemini and FastMCP.**

[Live Architecture](#-system-architecture) • [Agentic Visualizations](#-agentic-visualization-engine-a2ui) • [Multi-Device Cloud Sync](#-multi-surface-architecture--cross-device-projection) • [FastMCP Banking Core](#-fastmcp-banking-core--telemetry) • [Quickstart](#-quickstart--local-execution)

</div>

---

## 📌 Executive Overview

Traditional banking interfaces force users into one of two extremes:
1. **Rigid static portals:** Dense navigation menus, hidden options, and dozens of clicks just to simulate a loan or understand monthly spending.
2. **Text-only chatbots:** Empty chat boxes that dump long, unreadable paragraphs of numbers, causing prompt paralysis and providing zero actionable controls.

**Banorte Maya** redefines this paradigm by turning banking into an **Agentic Generative UI (A2UI) ecosystem**:
* **Conversational intent triggers rich UI:** Instead of returning plain text, Maya reasons over customer data in SQLite via FastMCP and dynamically returns declarative component schemas that React hydrates into interactive cards, sliders, and charts.
* **Dual-surface design:** Offers a native touch-first mobile experience (PWA ready) and a multi-widget desktop Command Center for power users.
* **Live cloud projection:** With a single voice or text prompt (*"Manda esta gráfica a mi dashboard"*), mobile widgets are instantly projected across devices to desktop screens in real time via cloud Server-Sent Events.

---

## 🏛️ System Architecture

The platform operates on a decoupled four-tier architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   ┌────────────────────────────────┐  ┌────────────────────────────┐   │
│   │   Banorte Móvil PWA (Mobile)   │  │ Power User Command Center  │   │
│   │ (Touch-first, Notch, Biometrics)│  │ (Multi-widget Desktop View)│   │
│   └────────────────┬───────────────┘  └─────────────▲──────────────┘   │
└────────────────────┼────────────────────────────────┼──────────────────┘
                     │ REST / SSE Stream              │ Cloud Projection (SSE)
┌────────────────────▼────────────────────────────────┴──────────────────┐
│                   FASTAPI ORCHESTRATION HIGHWAY                        │
│   - Streaming Tokens & Status Events (SSE /api/chat/stream)            │
│   - Cross-Device Event Broadcaster (/api/dashboard/events)             │
│   - PWA Service Worker & Manifest Host                                 │
│   - PCI-DSS Message Sanitizer & Token Redaction Pipeline               │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ Multi-turn Tool Loop (google-genai SDK)
┌────────────────────▼───────────────────────────────────────────────────┐
│                    INTELLIGENCE & REASONING LAYER                      │
│   - Google Gemini 3.7 Flash Live Agent                                 │
│   - Mexican Banking System Prompt & Strict Identity Binding            │
│   - Autonomous Function Calling over FastMCP Banking Tools             │
│   - Deterministic Offline Fallback Simulator (100% Stage Uptime)       │
└────────────────────┬───────────────────────────────────────────────────┘
                     │ FastMCP Protocol / In-Process SQLite Engine
┌────────────────────▼───────────────────────────────────────────────────┐
│                    CORE BANKING & PERSISTENCE LAYER                    │
│   - FastMCP Official Banking Server (Protocol-decoupled from LLM)      │
│   - SQLite banco_simulado2.db (Accounts, Cards, Ledger, Transactions)  │
│   - Persistent Cognitive Memory & Friction Tracking                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Agentic Visualization Engine (A2UI)

Maya does not dump raw text or static images. When a user asks a financial question, Maya determines the required visual representation and emits an **`A2UIPayload`** containing declarative JSON props. The React frontend dynamic registry compiles these payloads into interactive, living widgets.

### Complete Interactive Component Catalog

| Component | Visual Type | Capabilities & User Interaction |
| :--- | :--- | :--- |
| **`BanorteChartCard` (Sankey)** | **Cash Flow Flowchart** | Renders dynamic nodes and links mapping gross income, account routing, and detailed expense categories. Users can inspect the exact origin and destination of every peso. |
| **`BanorteChartCard` (Heatmap)** | **Daily Calendar Matrix** | Visualizes daily spending frequency and intensity across the month, highlighting spending spikes, weekends, and quiet financial days. |
| **`BanorteChartCard` (Multi-Chart)** | **Donut + Bars + Trend Lines** | Maya can project multiple charts at the same time (for example, a category donut breakdown together with an income-vs-expense historical trend) when the user asks for multi-perspective comparisons. |
| **`InvestmentSimulatorCard`** | **Interactive Yield Slider** | Live simulation of **Pagaré Banorte** at a **11.25% fixed annual rate**. Users drag amount and term sliders (28, 91, 182, 364 days) and observe real-time gross/net maturity gains. |
| **`DebtRestructureCard`** | **Financial Relief Simulator** | Analyzes credit card debt under 64.8% CAT, displays 3 frozen-rate installment options (12, 24, 36 months with up to 55% interest savings), and provides one-touch formalization buttons. |
| **`FinancialHealthGauge`** | **360° Diagnosis Radar** | Comprehensive gauge measuring credit utilization, debt-to-income ratio, monthly savings capacity, and proactive interest-trap warnings. |
| **`AmortizationScheduleCard`** | **Interactive Payment Run** | Full amortization table breaking down fixed monthly payments into principal reduction and declining interest over the life of the agreement. |
| **`SpeiTransferFormCard`** | **Dynamic Transfer Capture** | In-chat interactive form with pre-loaded recipient data, CLABE validation, bank routing, and quick-contact chips (Sofía, Carlos, Mamá). |
| **`SpeiConfirmCard`** | **2FA Transaction Guard** | Summary card enforcing biometric or Token Móvil confirmation before executing money movement. |
| **`ConfirmationReceipt`** | **Cryptographic Digital Receipt** | Formal digital receipt featuring official folio numbers, cryptographic digital seals, and Banxico tracking keys. |

---

## 📱 Multi-Surface Architecture & Cross-Device Projection

The webapp is specifically architected to support two distinct operational surfaces:

### 1. Banorte Móvil PWA (Mobile Surface)
* **Progressive Web App (PWA):** Equipped with `manifest.webmanifest`, app icons, and an active Service Worker (`sw.js`) allowing direct installation on real Android and iOS home screens. HERE WE NEED TO ADD MORE INFO ABOUT THE APP THAT ACTUALLY EXISTS, THE WIDGETS 

### 2. Power User Command Center (Desktop Surface)
* **Panoramic Multi-Widget Workspace:** Designed for laptops and desktop monitors where power users, business owners, and active investors need multiple charts open simultaneously without mobile space constraints.
* **Real-Time Cloud Projection:**
  1. A user conversing with Maya on mobile says: *"Manda esta gráfica a mi dashboard"* or clicks the **Enviar a Dashboard** button.
  2. The orchestrator captures the visual and broadcasts it through FastAPI Server-Sent Events (`/api/dashboard/events`).
  3. The desktop monitor updates instantly in real time without refreshing.

---

## ⚡ FastMCP Banking Core & Telemetry

Security in financial AI requires strict boundaries. Maya implements the **Model Context Protocol (FastMCP)** to isolate the language model from the underlying database:

* **Zero Direct SQL Access:** Gemini never touches raw SQL. It can only call strongly typed, Pydantic-validated tool definitions (`get_account_balance`, `get_user_debt`, `commit_restructure`, `execute_spei_transfer`, etc.).
* **Dual-Transport Architecture:**
  - *Remote Mode:* Connects over HTTP/SSE to a standalone FastMCP daemon on port 8001.
  - *In-Process Mode:* Seamlessly falls back to direct, zero-latency SQLite execution in the same process, guaranteeing 100% demo stability without coordinating multiple terminals.
* **Live FastMCP Telemetry Inspector:**
  - An interactive drawer accessible from the navigation header.
  - Allows judges and engineers to audit live tool names, execution status, latency in milliseconds, and input/output JSON payloads.

---

## 🛡️ Regulatory Security & Privacy Guardrails

Banorte Maya incorporates enterprise-grade financial guardrails:

* **Banxico Circular 14/2017 Compliance (No Text Authorizations):**
  - If a user types *"autorizo la transferencia"*, *"hazlo"* or *"confirmo el pago"* directly in chat, Maya explicitly blocks the transaction.
  - The system enforces physical interaction with the interactive **Autorizar con Token Móvil** button in the A2UI card to validate second-factor biometric authentication.
* **PCI-DSS Sensitive Data Sanitization:**
  - Every message passes through regex sanitizers before persisting to SQLite or reaching the LLM context.
  - Card numbers (15-16 digits) are masked: `**** **** **** 1234`.
  - Mexican CLABEs (18 digits) are masked: `*** *** ********** 1234`.
  - OTP tokens, security codes, and CVVs are completely redacted (`[DATO DE SEGURIDAD REDACTADO]`).
* **Anti-Prompt Injection Guardrails:**
  - Cleans adversarial prompts (*"ignore previous instructions"*, *"system prompt"*) before updating persistent cognitive memory.
* **Right to be Forgotten:**
  - `DELETE /api/chat/history` provides instant, compliant purging of conversation records on demand.

---

## 🚀 Quickstart & Local Execution

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & npm

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/Roger079/hackmty_llamas_2026.git
cd hackmty_llamas_2026
```

Create `.env` in the root directory (or in `backend/`):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.7-flash
HOST=0.0.0.0
PORT=8000
```
*(Note: Even without a Gemini API key, the built-in deterministic simulator will run 100% of all features, charts, and banking tools offline).*

### Step 2: Install and Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Launch the Unified Server
```bash
python backend/run_server.py
```

Open your browser at:
* **Web Application:** `http://localhost:8000`
* **Swagger API Docs:** `http://localhost:8000/docs`
* **FastMCP Tool Registry:** `http://localhost:8000/api/tools`

---

## 👥 Verified Customer Profiles (SQLite banco_simulado2.db)

The bundled database comes pre-seeded with three realistic customer archetypes:

| ID | Name | Segment | Initial State | Key Demo Flow |
| :--- | :--- | :--- | :--- | :--- |
| **`C001`** | **Ana Martínez** | Nómina Digital | Active payroll, liquid savings | SPEI interbank transfers, expense analysis (Sankey, Donut), and mobile-to-desktop projection. |
| **`C002`** | **Carlos Ramírez** | Tarjeta de Crédito | Revolving debt ($28,000 MXN at 64.8% CAT) | Financial relief, frozen rate negotiation (12/24/36 months), and official agreement receipt. |
| **`C003`** | **Silvia Carrasco** | Banca Patrimonial | High liquidity (>$149,000 MXN) | 360° financial health diagnosis and Pagaré Banorte fixed-term investment simulator. |

---

## 🏆 Competitive Differentiators Summary

1. **Agentic Visualizations over Text Walls:** Dynamic Sankey flowcharts, calendar heatmaps, and amortization schedules generated on demand.
2. **Dual-Device Synergy:** Native installable mobile PWA paired with a desktop Command Center linked by real-time cloud projection.
3. **True Transactional Core:** Real atomic SQL transactions, Banxico CEP tracking codes, and cryptographic seals instead of static mock text.
4. **Strict Banking Compliance:** Banxico Circular 14/2017 2FA enforcement and PCI-DSS data sanitization.
5. **Rock-Solid Demo Resilience:** In-process FastMCP fallback and smart deterministic simulation ensure zero stage failure even during venue network drops.

---

*Developed for the Banorte x Tec Hackathon 2026. Powered by Google Gemini 3.7 Flash, FastMCP, FastAPI, React 18, and SQLite.*
