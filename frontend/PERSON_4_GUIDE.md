# 🎨 Guía de Person 4: Visual Frontend Developer (MayaUI)
> **HackMTY 2026 — Banorte Autonomous Banking Assistant**  
> **Rol:** Desarrollador Frontend Visual (React 18 + Vite + Tailwind CSS)  
> **Enfoque:** Experiencia visual, diseño, maquetación MayaUI y flujo interactivo del usuario.

---

## 🧭 1. Tu Rol y Límites del Equipo (¿Quién hace qué?)

Para que no te preocupes por cosas fuera de tu área, el equipo está dividido con contratos claros:

| Miembro | Rol | Qué hace | ¿Tienes que tocarlo tú? |
| :--- | :--- | :--- | :--- |
| **Person 1** | Base de Datos & FastMCP | Servidor FastMCP, SQLite, lógica bancaria real (saldos, reestructuración, SPEI). | ❌ **No**. Corre en backend. |
| **Person 2** | Diseñador de Componentes A2UI | Código visual JSX/CSS de las tarjetas individuales (`DebtRestructureCard`, `ConfirmationReceipt`, etc.). | 🤝 **Colaboras**. Tú integras sus componentes en tu maquetación. |
| **Person 3** | Orquestador, JSON Engine & Highway | Servidor FastAPI, Gemini 2.5 Flash, **diseño de esquemas JSON**, validación, e intérprete dinámico (`DynamicA2UIRegistry.tsx`). | ❌ **No**. Person 3 te da los endpoints listos y maneja el JSON. |
| **Person 4 (TÚ)** | **Visual Frontend Developer** | **MayaUI**, estructura visual, layouts responsivos, chat streaming, manejo de clics de usuario y loop de retroalimentación. | 🎯 **Tu dominio absoluto (`frontend/`).** |

> **Cero Python requerido:** No necesitas instalar Python ni tocar código backend. Person 3 ya dejó configurado el proxy en Vite para que todas tus llamadas a `/api/*` se conecten automáticamente al backend en `http://localhost:8000`.

---

## ⚡ 2. Inicio Rápido (Setup en 60 segundos)

### Requisitos
* **Node.js** v18 o superior instalado.

### Pasos
```bash
# 1. Ve a la carpeta frontend
cd frontend

# 2. Instala dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

El servidor abrirá en: **`http://localhost:5173`**.

Cualquier cambio que guardes en `src/` se reflejará al instante gracias a Hot Module Replacement (HMR).

---

## 📋 3. Checklist de Tareas para Person 4

Aquí está tu lista de tareas priorizada para tener la UI lista para los jueces:

### ✅ Tarea 1: Perfeccionar la Shell de MayaUI (`src/App.tsx`)
- [ ] Asegurar la barra superior oficial Banorte (`BanortePortalHeader.tsx`) con el rojo `#EB0029` y tipografía corporativa.
- [ ] Maquetar la vista principal **MayaUI** en pantalla completa:
  - Header con saludo bancario personalizado (*"Hola, Roberto"*, avatar de Maya con indicador de estado verde).
  - Canvas central con historial de chat y tarjetas interactivas embebidas.
  - Input inferior limpio con botón de envío y accesos rápidos (pills / sugerencias).

### ✅ Tarea 2: Conectar el Chat con el Backend (`POST /api/chat`)
- [ ] Conectar el input del usuario para enviar mensajes a `/api/chat`.
- [ ] Mostrar el estado de carga animado (*"Maya está consultando tus finanzas..."*).
- [ ] Renderizar la respuesta textual y, si viene un componente A2UI en el JSON, pasarlo a `<DynamicA2UIRegistry />`.

### ✅ Tarea 3: Cerrar el Loop de Retroalimentación (Action Dispatcher)
- [ ] Cuando el usuario hace clic en una acción dentro de una tarjeta (por ejemplo, *"Aplicar reestructuración a 24 meses"* o *"Confirmar SPEI"*):
  - Capturar el evento `onAction(actionName, params)`.
  - Enviar una nueva petición a `POST /api/chat` incluyendo el `action_context`.
  - Renderizar la tarjeta de confirmación o recibo oficial que responde el orquestador.

### ✅ Tarea 4: Drawer / Modal del "MCP Inspector"
- [ ] Integrar un botón discreto pero visible (ej. esquina superior derecha o flotante) para abrir el `<McpInspector />`.
- [ ] Los jueces del hackathon adoran ver las llamadas a herramientas en tiempo real (`get_user_debt`, `commit_restructure`, `execute_spei_transfer`).

### ✅ Tarea 5: Responsividad y Acceso a la Vista Móvil
- [ ] Asegurar que la UI se vea impecable tanto en desktop (pantalla de presentación) como en pantallas móviles.
- [ ] Agregar un botón o badge de *"Ver Simulador Móvil Banorte"* con link a `/mobile` para mostrar la app bancaria en tiempo real.

---

## 🔌 4. Contrato de API (Cheat Sheet para Person 4)

No tienes que adivinar cómo comunicarte con el backend de Person 3. Aquí están los formatos exactos:

### 1. Enviar mensaje de usuario
```ts
// POST /api/chat
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
```

**Respuesta que recibes de Person 3:**
```json
{
  "reply": "He analizado tu cuenta Platino... te muestro 3 opciones de reestructuración con tasa fija.",
  "a2ui": {
    "component": "DebtRestructureCard",
    "props": {
      "card_name": "Tarjeta Banorte Platino **** 4892",
      "total_debt": 48500.00,
      "options": [
        { "term_months": 12, "monthly_payment": 4520.00, "rate": "16.5%" },
        { "term_months": 24, "monthly_payment": 2480.00, "rate": "17.0%", "recommended": true },
        { "term_months": 36, "monthly_payment": 1810.00, "rate": "17.5%" }
      ]
    }
  },
  "mcp_calls": [
    { "tool": "get_user_debt", "duration_ms": 42, "status": "success" }
  ]
}
```

### 2. Cerrar el Loop al dar clic en una tarjeta
Cuando el usuario selecciona un plan y presiona el botón en la tarjeta de Person 2:
```ts
// POST /api/chat (con action_context)
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Acepto el plan de 24 meses",
    action_context: {
      action: "commit_restructure",
      params: {
        plan_id: "plan_24m",
        term_months: 24,
        monthly_payment: 2480.00
      },
      source_component: "DebtRestructureCard"
    },
    user_id: "USR-BANORTE-8842"
  })
});
// ¡El backend ejecutará la transacción real y te devolverá el ConfirmationReceipt!
```

---

## 🎨 5. Tokens de Diseño Banorte (Paleta Oficial)

Usa estas clases de Tailwind y variables para que la interfaz sea 100% fiel a la identidad visual de Banorte:

| Elemento | Color Hex | Clase Tailwind sugerida | Uso |
| :--- | :--- | :--- | :--- |
| **Banorte Red** | `#EB0029` | `bg-[#EB0029]`, `text-[#EB0029]` | Botones primarios, acentos, barra superior portal. |
| **Banorte Red Hover** | `#C70023` | `hover:bg-[#C70023]` | Estados hover de botones primarios. |
| **Maya Slate** | `#4A5568` | `bg-[#4A5568]`, `text-[#4A5568]` | Barra superior del widget de Maya, burbujas secundarias. |
| **Maya Slate Dark** | `#3E4651` | `bg-[#3E4651]` | Cabecera oscura corporativa de Maya. |
| **Canvas Background** | `#F4F6F9` | `bg-[#F4F6F9]` | Fondo general del viewport. |
| **Card Surface** | `#FFFFFF` | `bg-white border border-slate-200` | Tarjetas de conversación y componentes A2UI. |
| **Text Main** | `#1A202C` | `text-slate-900` | Textos y números principales. |
| **Success Emerald**| `#10B981` | `text-emerald-600 bg-emerald-50` | Sellos bancarios, confirmaciones y recibos. |

### Reglas Tipográficas:
* Para montos de dinero: siempre usa números tabulares (`tabular-nums font-semibold font-mono` o Montserrat numérico).
* Formato de moneda mexicano: `$48,500.00 MXN`.

---

## 🎭 6. Demo Script para el Hackathon (Lo que los jueces verán)

Tú vas a lucir el proyecto en la pantalla principal. Este es el flujo que debes tener listo para la presentación:

1. **Pantalla Inicial:** Se ve el portal Banorte con MayaUI abierto. Arriba dice *"Roberto Carlos Garza — Cliente Preferente"*.
2. **Primer Mensaje:** Clic en la sugerencia: *"¿Cómo reestructurar mi tarjeta Platino?"*.
3. **Maya Responde:** Mensaje cálido + se despliega interactivamente la tarjeta `<DebtRestructureCard />` con las 3 opciones calculadas.
4. **Interacción en Vivo:** El presentador hace clic en el plan de 24 meses (*$2,480.00 MXN*) y presiona *"Reestructurar Ahora"*.
5. **Confirmación Inmediata:** La UI procesa la acción y renderiza `<ConfirmationReceipt />` con folio bancario, sello digital y desglose de ahorro.
6. **Muestra Técnica (Jueces):** Abres el botón **MCP Inspector** y muestras cómo el modelo autónomo ejecutó las herramientas de Person 1 y Person 3 sin intervención humana.

---

¡Éxito Person 4! Tienes todo el frontend preparado para hacer brillar el proyecto en el escenario. 🚀
