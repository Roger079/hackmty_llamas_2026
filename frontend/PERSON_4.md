# 👤 PERSON 4: Visual Frontend Lead Guide (MayaUI)

Welcome to the team! As **Person 4**, you own the entire **Frontend UI & Presentation Layer** in `frontend/`.

> **Quick Summary:** You build and polish the visual web experience (**MayaUI**). You do **NOT** need to touch Python, SQLite, or design JSON schemas. Your playground is modern React, Vite, and Tailwind CSS.

---

## 🛑 1. Your Boundaries (What You Do vs What You Don't)

| What You DO 🎯 | What You DON'T Need To Worry About 🛡️ |
| :--- | :--- |
| **Own the `frontend/` directory** | **No Python setup**: Backend is already built and proxied. |
| **MayaUI visual shell & layouts** (`App.tsx`, `ChatStream.tsx`) | **No database/SQL**: Person 1 handles all data tables & FastMCP tools. |
| **Look & feel**: Match official Banorte banking identity (`#EB0029`, clean white/slate canvas) | **No JSON schema authoring**: Person 3 handles all JSON schemas, validations, and the dynamic component interpreter (`DynamicA2UIRegistry.tsx`). |
| **Closed-loop user action wiring**: Dispatching button clicks from cards to `/api/chat` | **No AI prompts**: Person 3 manages Gemini 2.5 Flash orchestration. |
| **Presentation polish**: Make it look like a multi-million-dollar production banking app for the hackathon judges! | **No component invention**: Person 2 designs the JSX/CSS cards; you assemble them into MayaUI. |

---

## ⚡ 2. 60-Second Quickstart

```bash
# 1. Enter the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Your app will run at: **`http://localhost:5173`**  
*(Vite is already configured to proxy `/api/*` requests directly to `http://localhost:8000`)*.

### 🌐 Can you test everything offline? YES!
You do **NOT** need an active internet connection, a paid Gemini API key, or Person 1's server running to build and test:
- **No Gemini API Key needed:** If no key is set or you are offline, the orchestrator automatically falls back to our **smart simulation engine**.
- **No database server needed:** The backend includes a mock financial database (`USR-BANORTE-8842` / Alejandro Ramírez).
- **All 4 interactive flows work offline right now:**
  1. Debt Restructuring (`"quiero reestructurar mi tarjeta"`) ➔ renders `<DebtRestructureCard />`.
  2. Plan Confirmation click (`"commit_restructure"`) ➔ renders `<ConfirmationReceipt />` with folio and seal.
  3. Balance Inquiry (`"cuanto saldo tengo"`) ➔ renders `<BanorteBalanceCard />`.
  4. SPEI Transfer (`"transferir 500 pesos"`) ➔ renders `<SpeiConfirmCard />` and `<SpeiReceiptCard />`.

---

## 📂 3. Your File Map

Everything you care about is inside `frontend/src/`:

```
frontend/src/
├── App.tsx                      # ⭐ YOUR MAIN CANVAS: The MayaUI full-page experience
├── components/
│   ├── BanorteHeader.tsx        # Official Banorte red (#EB0029) top navigation bar
│   ├── ChatStream.tsx           # Conversational message list, bubbles & quick suggestions
│   ├── DynamicA2UIRegistry.tsx  # (Managed by Person 3) Maps backend JSON -> React components
│   ├── McpInspector.tsx         # Live debug drawer showing backend tool executions
│   ├── DebtRestructureCard.tsx  # Interactive credit card restructuring selector
│   ├── ConfirmationReceipt.tsx  # Official bank seal agreement receipt
│   ├── SpeiConfirmCard.tsx      # Token Móvil SPEI confirmation card
│   └── SpeiReceiptCard.tsx      # Official Banxico CEP voucher
├── types/
│   └── a2ui.ts                  # TypeScript types for messages, actions & A2UI payloads
└── index.css                    # Tailwind & typography configuration
```

---

## 🎯 4. Your Exact Tasks for the Hackathon

### 🥇 Priority 1: Perfect the MayaUI Experience (`App.tsx`)
Make **MayaUI** look stunning and brand-accurate:
- **Header:** Authentic Banorte branding (`#EB0029` red bar, customer greeting *"Roberto Carlos Garza — Cliente Preferente"*, security badge).
- **Maya Welcome:** Clean avatar, status indicator (*"En línea • Copiloto Inteligente"*).
- **Chat Feed:** Clean message bubbles, smooth scroll to bottom on new message.
- **Pill Suggestions:** Quick action buttons below the input (e.g., *"¿Cómo reestructurar mi tarjeta?"*, *"Transferir por SPEI"*, *"Consultar saldo"*).

### 🥈 Priority 2: Closed-Loop Action Dispatcher
When a user clicks an action inside an interactive card (like selecting a 24-month restructuring plan and clicking *"Reestructurar Ahora"*):
- The component calls `onAction({ action, params, source_component })`.
- You send this payload to `POST /api/chat`.
- The backend executes the real database change via FastMCP and returns the updated status + `<ConfirmationReceipt />`!

### 🥉 Priority 3: MCP Inspector Drawer
- Keep the **"MCP Inspector"** button easily accessible (e.g., in the header or floating pill).
- When judges ask *"Is this actually calling real tools or just an LLM hallucinating?"*, click the Inspector to show the live tool calls (`get_user_debt`, `commit_restructure`, etc.) with millisecond execution times.

### 📱 Priority 4: Responsive View & Mobile App Link
- Ensure the layout looks great on laptop presentation screens and tablets.
- Add a convenient link/tab to `/mobile` (our companion smartphone simulator).

---

## 🔌 5. API Cheat Sheet (Connecting to Person 3's Backend)

### 1. Sending a Chat Message
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Quiero reestructurar mi deuda",
    user_id: "USR-BANORTE-8842",
    history: []
  })
});

const data = await response.json();
// data = {
//   reply: "He encontrado tu tarjeta Banorte Platino...",
//   a2ui: { component: "DebtRestructureCard", props: { ... } },
//   mcp_calls: [ { tool: "get_user_debt", status: "success" } ]
// }
```

### 2. Sending a User Action from an Interactive Card
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Confirmar plan seleccionado",
    action_context: {
      action: "commit_restructure",
      params: { plan_id: "plan_24m", term_months: 24, monthly_payment: 2480.00 },
      source_component: "DebtRestructureCard"
    },
    user_id: "USR-BANORTE-8842"
  })
});
// Response includes confirmation text + ConfirmationReceipt A2UI component!
```

---

## 🎨 6. Banorte Visual Design Tokens

| Token | Hex Code | Tailwind Suggestion | Where to Use |
| :--- | :--- | :--- | :--- |
| **Banorte Red** | `#EB0029` | `bg-[#EB0029]`, `text-[#EB0029]` | Top header bar, primary action buttons |
| **Banorte Red Hover** | `#C70023` | `hover:bg-[#C70023]` | Primary button hover |
| **Maya Slate** | `#4A5568` | `bg-[#4A5568]` | Maya header, bot avatar background |
| **Canvas Background** | `#F4F6F9` | `bg-[#F4F6F9]` | Main background for the full-page app |
| **Card Surface** | `#FFFFFF` | `bg-white border border-slate-200` | Chat bubbles, interactive cards |
| **Primary Text** | `#1A202C` | `text-slate-900` | Headings, amounts, important labels |
| **Bank Success Green** | `#10B981` | `text-emerald-600 bg-emerald-50` | Seals, confirmed transactions, receipts |

---

## 🏆 7. Hackathon Demo Flow (What to Practice)

1. **Step 1:** Open `http://localhost:5173` on the big screen.
2. **Step 2:** Click prompt pill: *"¿Cómo reestructurar mi tarjeta Platino?"*.
3. **Step 3:** Watch Maya reply and render `<DebtRestructureCard />` with real user debt.
4. **Step 4:** Select the **24-month plan** and click **"Aplicar Reestructuración"**.
5. **Step 5:** Watch the closed-loop trigger: `<ConfirmationReceipt />` appears with bank seal & folio.
6. **Step 6:** Open **MCP Inspector** and show judges the autonomous tool calls.

---

*You've got this, Person 4! The backend and component engine are ready for you. Let's win this hackathon!* 🚀
