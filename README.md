# 🦅 Banorte Conversational Banking: A2UI + FastMCP Architecture

> **HackMTY 2026 — Team Llamas**  
> **Person 3: Orchestrator & Frontend Shell Integrator**

This repository implements a **closed-loop conversational banking system** powered by Gemini, FastMCP, and Agent-to-User Interface (A2UI) generative components.

---

## 🔁 Closed-Loop Architecture

```
[ User ] 
   │
   ▼
[ Person 3: Frontend Shell ] ──(POST /api/chat)──► [ Person 3: FastAPI & Gemini ]
                                                          │              ▲
                                      Calls MCP Tools     │              │ Sends Action Context
                                      (get_debt / apply)  ▼              │ (User clicked plan)
                                              [ Person 1: MCP Server ]   │
                                                          │              │
                                      Emits A2UI Payload  │              │
                                                          ▼              │
                                              [ Person 2: A2UI Engine ] ─┘
                                              (Renderer + Banorte UI)
```

1. **User expresses intent** (e.g., *"Tengo una deuda con mi tarjeta y quiero reestructurarla"*).
2. **FastAPI & Gemini Orchestrator** detects the intent and queries Person 1's banking data via MCP (`get_user_debt`).
3. **Gemini emits an A2UI JSON payload** via the `render_a2ui` tool with the component specification (`DebtRestructureCard`).
4. **Person 2's A2UI Engine & Renderer** mounts the interactive Banorte React component within the chat stream.
5. **User clicks an action button** (e.g. *"Aplicar plan a 24 meses"*).
6. **Frontend Feedback Loop Dispatcher** captures the event and sends it back to `POST /api/chat` as `action_context`.
7. **Gemini executes the real database commit tool** (`commit_restructure`) via MCP, freezing moratorium interest and generating a legal agreement folio.
8. **Confirmation A2UI component** (`ConfirmationReceipt`) is rendered with the official bank seal and contract details.

---

## 📦 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI server with /api/chat & /api/chat/stream
│   │   ├── config.py                # Environment configuration & settings
│   │   ├── schemas.py               # Pydantic models (ChatRequest, ActionContext, A2UIPayload)
│   │   ├── mcp_client.py            # FastMCP client with seamless local mock fallback
│   │   ├── gemini_orchestrator.py   # Multi-step Gemini function calling loop & simulator
│   │   └── tools_registry.py        # Person 1 MCP tools + Person 2 A2UI tool definitions
│   ├── mcp_server_mock.py           # Standalone reference FastMCP server for Person 1
│   └── run_server.py                # Main backend launcher (python backend/run_server.py)
├── frontend/                        # Modular React 18 + Vite codebase for Person 2 & 3
│   ├── src/
│   │   ├── components/
│   │   │   ├── BanorteHeader.tsx
│   │   │   ├── BanorteLogo.tsx
│   │   │   ├── ChatStream.tsx
│   │   │   ├── DynamicA2UIRegistry.tsx  # Maps A2UI JSON to React components
│   │   │   ├── DebtRestructureCard.tsx  # Interactive debt relief selector
│   │   │   ├── ConfirmationReceipt.tsx  # Official restructuring receipt
│   │   │   ├── SpeiConfirmCard.tsx      # Token-authorized SPEI transfer card
│   │   │   ├── SpeiReceiptCard.tsx      # Banxico CEP transfer voucher
│   │   │   ├── BanorteBalanceCard.tsx   # Multi-account balance card
│   │   │   └── McpInspector.tsx         # Live debugging panel for MCP calls
│   │   ├── types/a2ui.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── static/
│   └── index.html                   # Zero-dependency browser client served directly by FastAPI
├── visuals/                         # Design guide, tokens, component library & prototype
├── CONTRACTS.md                     # Interface contracts & questions for Person 1 and Person 2
├── requirements.txt
└── .env.example
```

---

## ⚡ Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If no `GEMINI_API_KEY` is provided, the orchestrator automatically runs in smart simulation mode, providing 100% test reliability with live MCP and A2UI loops!)*

### 3. Start the FastAPI Orchestrator
```bash
python backend/run_server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!

### 4. Optional: Run Person 1's Reference FastMCP Server
In a separate terminal:
```bash
python backend/mcp_server_mock.py
```

---

## 🧪 Interactive Demo Scenarios

Once the app is open at `http://localhost:8000`:
1. **Debt Restructuring (Closed Loop):**
   - Click the prompt chip: `💳 Reestructurar deuda`.
   - Maya calls `get_user_debt` via MCP and renders `<DebtRestructureCard />`.
   - Select the 24-month plan ($1,920.00/mo) and click **"Aplicar plan"**.
   - The feedback loop dispatches `commit_restructure`, updates database balances, and renders `<ConfirmationReceipt />` with folio `FOL-BNTE-2026-R88895`.
2. **SPEI Transfer with Token Móvil:**
   - Click `⚡ Transferir $850 SPEI`.
   - Maya calls `validate_clabe` + `prepare_spei_transfer` and renders `<SpeiConfirmCard />`.
   - Click **"Autorizar con Token Móvil"**.
   - The loop calls `execute_spei_transfer`, updates the live smartphone card balance, and outputs `<SpeiReceiptCard />` with Banxico tracking key.
3. **Live MCP Inspector:**
   - Switch to the **"Inspector MCP"** tab to see real-time tool calls, latency in milliseconds, parameters, and return payloads!
4. **A2UI JSON Spec:**
   - Switch to the **"A2UI JSON Spec"** tab to see the declarative JSON payload emitted by the model.

---

## 🤝 Team Alignment & Questions
See [CONTRACTS.md](file:///c:/Users/rogel/OneDrive/Documents/GitHub/hackmty_llamas_2026/CONTRACTS.md) for the exact questions and contract definitions to share with **Person 1** and **Person 2**.
