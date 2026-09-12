# 🦅 Banorte Closed-Loop Architecture: 4-Person Team Integration Contracts

This document establishes the clear division of ownership and API contracts for our 4-person hackathon team.

---

## 👥 Team Roles & Ownership

| Role | Person | What They Own | Workspace Directory |
| :--- | :--- | :--- | :--- |
| **Database & MCP Server** | **Person 1** | FastMCP server, SQLite / financial tables, data query & mutation tools. | `backend/mcp_server_mock.py` / Person 1 repo |
| **A2UI Visual Components** | **Person 2** | Visual React JSX/CSS component designs (`DebtRestructureCard`, `ConfirmationReceipt`, etc.). | `frontend/src/components/` & `visuals/` |
| **Orchestrator & JSON Highway** | **Person 3 (You)** | FastAPI backend, Gemini multi-step tool loop, FastMCP client, SSE streaming, **A2UI JSON schemas, validation & dynamic interpreter (`DynamicA2UIRegistry.tsx`)**. | `backend/` & `frontend/src/components/DynamicA2UIRegistry.tsx` |
| **Visual Frontend Developer** | **Person 4** | React/Vite shell, UI layout, styling, responsiveness, MayaUI & Portal presentation. | `frontend/` |

---

## 🔁 The 4-Way Architecture Loop

```
[ User ]
   │
   ▼
[ Person 4: Frontend Shell (React/Vite) ] ──(POST /api/chat)──► [ Person 3: FastAPI & Gemini ]
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

---

## 🙋 Questions & Contract for Person 1 (Database & MCP Server)
1. **Endpoint & Transport:**
   *"What is the exact endpoint/transport URL for the MCP server (e.g., `http://localhost:8001/mcp` or SSE `http://localhost:8001/sse`)?"*  
   - Default: `MCP_SERVER_URL=http://localhost:8001/mcp` in `backend/.env`.
2. **Tool Signatures:**
   - `get_user_debt(user_id: str)`
   - `commit_restructure(user_id: str, plan_id: str, term_months: int)`
   - `get_account_balance(account_type: str)`
   - `prepare_spei_transfer(beneficiary_name: str, recipient_bank: str, clabe: str, amount: float, concept: str)`
   - `execute_spei_transfer(transfer_id: str, auth_token: str)`
3. **Mock Client ID:** `USR-BANORTE-8842` (Alejandro Ramírez).

---

## 🙋 Questions & Contract for Person 2 (A2UI Engine)
1. **Tool Schema for `render_a2ui`:**
   ```json
   {
     "component": "DebtRestructureCard",
     "props": { ... }
   }
   ```
2. **Exported Components:**
   - `<DebtRestructureCard totalDebt cardName cardLast4 minimumPayment dueDate currentRate options onAction />`
   - `<ConfirmationReceipt folio status monthlyPayment termMonths nextPaymentDate bankSeal clientName />`
   - `<SpeiConfirmCard transferId amount beneficiary bank clabe concept onAction />`
   - `<SpeiReceiptCard amount beneficiary bank clabe trackingKey date />`
   - `<BanorteBalanceCard clientName nominaBalance oroBalance totalDebt onAction />`
3. **Action Callback Signature:**
   ```ts
   onAction({
     action: "commit_restructure",
     params: { plan_id: "plan_24m", term_months: 24, monthly_payment: 1920.00 },
     source_component: "DebtRestructureCard"
   });
   ```

---

## 💻 Instructions for Person 4 (Visual Frontend Developer)
* **Workspace:** Everything in `frontend/`. Person 4 does **NOT** need Python.
* **Running the app:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  Runs at `http://localhost:5173`.
* **API Connection:** `vite.config.ts` automatically proxies `/api/*` requests to Person 3's FastAPI orchestrator at `http://localhost:8000`.
* **Endpoints available to Person 4:**
  - `POST /api/chat`: Send user message or component action context. Returns `{ reply, a2ui, mcp_calls }`.
  - `POST /api/chat/stream`: SSE stream yielding `status`, `token`, `mcp_call`, `a2ui`, `done`.
  - `GET /api/bank/state`: Real-time state of accounts and agreements for live sync.
  - `GET /api/health`: Server & MCP health status.
