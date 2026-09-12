# 🎨 Banorte Frontend Workspace — Person 4 Guide

Welcome to the **Banorte Frontend UI** repository. This folder is a completely independent, modern React + Vite + Tailwind CSS workspace dedicated to **Person 4 (Frontend Developer)** in collaboration with **Person 2 (A2UI Components)**.

You do **NOT** need to touch Python or backend files. The backend exposes standard REST and SSE endpoints that this frontend calls.

---

## ⚡ Quick Start

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install Node dependencies
npm install

# 3. Run development server (with auto proxy to http://localhost:8000)
npm run dev
```

Your Vite development server will start at `http://localhost:5173`.

---

## 🔌 Connecting to Person 3's Backend

`vite.config.ts` is pre-configured to proxy all `/api/*` requests to Person 3's FastAPI orchestrator running on `http://localhost:8000`.

### 1. Chat & Tool Calling Loop
```ts
// Send a user prompt or action to Maya
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Tengo una deuda con mi tarjeta de crédito y quiero reestructurarla",
    user_id: "USR-BANORTE-8842",
    history: []
  })
});
const data = await response.json();
// data = { reply: string, a2ui?: { component: string, props: object }, mcp_calls: [...] }
```

### 2. Closed-Loop Feedback Dispatcher
When a user clicks an action inside a component (e.g., clicking *"Aplicar plan"* on `<DebtRestructureCard />`):
```ts
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Confirmar reestructuración",
    action_context: {
      action: "commit_restructure",
      params: {
        plan_id: "plan_24m",
        term_months: 24,
        monthly_payment: 1920.00
      },
      source_component: "DebtRestructureCard"
    },
    user_id: "USR-BANORTE-8842"
  })
});
// The backend calls Person 1's database commit tool and returns ConfirmationReceipt!
```

---

## 🧩 Component Directory Structure

```
frontend/src/
├── components/
│   ├── BanortePortalHeader.tsx  # Authentic red top bar from official Banorte site
│   ├── BanorteLogo.tsx          # Official SVG Banorte logos
│   ├── ChatStream.tsx           # Conversational message list & prompt pills
│   ├── DynamicA2UIRegistry.tsx  # Maps A2UI JSON payload to React components
│   ├── DebtRestructureCard.tsx  # Interactive credit card restructuring selector
│   ├── ConfirmationReceipt.tsx  # Official bank seal agreement receipt
│   ├── SpeiConfirmCard.tsx      # Token Móvil SPEI confirmation card
│   ├── SpeiReceiptCard.tsx      # Official Banxico CEP voucher
│   ├── BanorteBalanceCard.tsx   # Multi-account balance overview
│   └── McpInspector.tsx         # Live debug modal showing MCP tool executions
├── types/
│   └── a2ui.ts                  # TypeScript interfaces for A2UI, messages, and actions
├── App.tsx                      # Main MayaUI shell
└── main.tsx
```

---

## 🎨 Design Tokens (Banorte Visual Identity)
* **Banorte Red Primary:** `#EB0029` (Hover: `#C70023`, Active: `#9E001B`)
* **Maya Widget Slate:** `#4A5568` (Header: `#3E4651`, Pills: `#64748B`)
* **Surfaces:** `#FFFFFF` (Cards), `#F4F6F9` (Canvas), `#EAEFF5` (Dividers)
* **Typography:** Montserrat for body & headings, `tabular-nums` for all currency amounts.
