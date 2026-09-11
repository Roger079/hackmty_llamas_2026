# 🦅 GUÍA DE IDENTIDAD VISUAL Y DESIGN SYSTEM: BANORTE
> **Especial para Hackathons y Agentes Autónomos de Frontend**  
> *Versión 1.0 — "El Banco Fuerte de México"*  
> Diseñado para que cualquier agente de IA (Claude, GPT, Gemini, Copilot) o desarrollador frontend genere interfaces web y móviles consistentes, accesibles y con fidelidad bancaria profesional.

---

## 📑 ÍNDICE RÁPIDO
1. [Principios de Marca y Personalidad](#1-principios-de-marca-y-personalidad)
2. [Paleta de Color Oficial y Tokens](#2-paleta-de-color-oficial-y-tokens)
3. [Tipografía y Jerarquía Numérica Financiera](#3-tipografía-y-jerarquía-numérica-financiera)
4. [Logo, Isotipo y Assets SVG](#4-logo-isotipo-y-assets-svg)
5. [Tokens de Diseño: Radios, Elevaciones y Espaciados](#5-tokens-de-diseño-radios-elevaciones-y-espaciados)
6. [Componentes Clave de Banca Digital (Specs & Código)](#6-componentes-clave-de-banca-digital)
7. [Voz, Tono y Microcopia Financiera Mexicana](#7-voz-tono-y-microcopia-financiera-mexicana)
8. [Reglas de Oro para el Agente Frontend (Cheat Sheet)](#8-reglas-de-oro-para-el-agente-frontend)

---

## 1. PRINCIPIOS DE MARCA Y PERSONALIDAD

Banorte se distingue como **"El Banco Fuerte de México"**. Es una institución con herencia sólida, pero con una transformación digital moderna, ágil y centrada en el usuario mexicano.

| Pilar | Significado en UI | Qué HACER en Frontend | Qué EVITAR |
| :--- | :--- | :--- | :--- |
| **Solidez & Confianza** | Seguridad bancaria visible | Estados claros de confirmación, autenticación, tokens de seguridad, sellos de transacción. | Elementos flotantes sin anclaje visual, animaciones caóticas o confusas. |
| **Orgullo & Calidez Mexicana** | Trato cercano y empático | Saludos personalizados ("¡Hola, Roberto!"), lenguaje bancario mexicano claro (SPEI, CLABE, CoDi). | Tecnicismos bancarios fríos o anglicismos innecesarios ("Cashback" -> "Recompensa / Puntos"). |
| **Agilidad & Precisión** | Fintech moderna sin fricción | Acciones rápidas ("Transferir en 1 clic"), saldos legibles con números tabulares, micro-interacciones sutiles. | Formularios kilométricos sin división de pasos (steppers). |

---

## 2. PALETA DE COLOR OFICIAL Y TOKENS

### 🔴 Color Primario Institucional (Banorte Red)
El rojo Banorte es el corazón de la identidad visual. Debe usarse estratégicamente: para botones primarios, barras de navegación principales, estados activos y acentos de marca. **No satures la pantalla de rojo**; el fondo debe ser predominantemente blanco o gris perla para que el rojo mantenga su impacto.

| Nombre Token | HEX | RGB | HSL | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| `banorte-red` (Base) | `#EB0029` | `235, 0, 41` | `350°, 100%, 46%` | Botón primario, barra superior, isotipo, llamadas a la acción clave. |
| `banorte-red-hover` | `#C70023` | `199, 0, 35` | `349°, 100%, 39%` | Hover en botones primarios, enlaces activos. |
| `banorte-red-dark` | `#9E001B` | `158, 0, 27` | `350°, 100%, 31%` | Prensado / Active state, bordes de alto contraste. |
| `banorte-red-light` | `#FFF0F2` | `255, 240, 242` | `352°, 100%, 97%` | Fondos de alerta suave, chips activos, badge backgrounds. |
| `banorte-red-subtle` | `#FDE2E4` | `253, 226, 228` | `355°, 89%, 94%` | Bordes sutiles en tarjetas de alerta o foco. |

### ⚫ Paleta Neutral & Superficies
Nunca uses negro puro (`#000000`). Utiliza la gama **Grafito Banorte** para aportar elegancia institucional.

| Token | HEX | Uso |
| :--- | :--- | :--- |
| `surface-canvas` | `#F4F6F9` | Fondo principal de la app o dashboard (Gris financiero fresco). |
| `surface-card` | `#FFFFFF` | Fondo de tarjetas, modales y hojas de navegación. |
| `surface-subtle` | `#EAEFF5` | Fondos de inputs deshabilitados, divisores secundarios. |
| `text-primary` | `#1C1E21` | Títulos principales, saldos bancarios, textos de alta jerarquía. |
| `text-secondary` | `#4A515E` | Subtítulos, etiquetas de campos, fechas de movimientos. |
| `text-muted` | `#7A8290` | Placeholders, textos legales, números de folio secundarios. |
| `border-light` | `#E2E6EC` | Bordes de inputs, líneas divisorias de transacciones. |
| `border-focus` | `#EB0029` | Anillo de foco accesible para accesibilidad y tabs activos. |

### 🟡 Segmentos Especiales (Tarjetas y Niveles)
Para hackathons que incluyan módulos de inversión, nómina o tarjetas especiales:

| Segmento | Color Primario | Color Secundario | Aplicación |
| :--- | :--- | :--- | :--- |
| **Banorte Preferente (Gold)** | `#C59B27` | `#F6E8B7` | Cuentas premium, asesoría privada, tarjetas de oro. |
| **Banorte Platinum / Black** | `#1A1D24` | `#8C96A5` | Tarjetas Infinite, banca patrimonial, temas oscuros de tarjeta. |
| **Nómina Banorte** | `#EB0029` | `#2D3136` | La clásica tarjeta roja de débito y dispersión. |

### 🟢 Colores Semánticos / Feedback
| Semántica | Token | HEX | Uso Financiero |
| :--- | :--- | :--- | :--- |
| **Abono / Éxito** | `success` | `#008744` | Transferencia recibida (`+ $1,500.00`), pago exitoso, validación verde. |
| **Cargo / Alerta** | `danger` | `#D32F2F` | Retiros, fondos insuficientes, error en CLABE. *(Nota: Diferente al rojo Banorte para evitar confundir branding con error)*. |
| **Pendiente / Warning**| `warning` | `#E67E22` | Transferencia en proceso, vencimiento próximo de tarjeta. |
| **Informativo** | `info` | `#0066CC` | Mensajes de soporte, nuevo servicio disponible. |

---

## 3. TIPOGRAFÍA Y JERARQUÍA NUMÉRICA FINANCIERA

### Fuentes Recomendadas
1. **Fuente Oficial de Marca**: *Gotham* o *Helvetica Neue*.
2. **Google Fonts Equivalente (Imprescindible para Hackathon Web)**:
   - **`Montserrat`**: Fuente geométrica moderna muy fiel a la geometría de Banorte.
   - **`Inter`** o **`Plus Jakarta Sans`**: Para legibilidad superior en pantallas móviles y dashboards de alta densidad.
3. **Monospace para Datos Financieros**:
   - **`JetBrains Mono`** o **`Roboto Mono`**: Para números de cuenta CLABE (18 dígitos), códigos de rastreo SPEI y CVV.

```html
<!-- Importación lista para index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Escala Tipográfica
| Nivel | Tamaño | Peso | Line Height | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Display (Saldo Principal)** | `32px` - `40px` | `Bold (700)` | `1.1` | `$ 128,450.50` en la pantalla de inicio. Usar números tabulares. |
| **H1 (Encabezado)** | `24px` - `28px` | `Bold (700)` | `1.25` | "Transferir a otros bancos", "Mis Tarjetas". |
| **H2 (Secciones)** | `18px` - `20px` | `SemiBold (600)` | `1.3` | "Últimos movimientos", "Servicios frecuentes". |
| **Body (Texto regular)** | `14px` - `15px` | `Regular (400)` | `1.5` | Descripciones de conceptos, instrucciones. |
| **Body Bold** | `14px` - `15px` | `Medium / SemiBold`| `1.5` | Nombres de destinatarios, comercios. |
| **Caption / Metadatos** | `12px` | `Regular (400)` | `1.4` | Fecha y hora de transacción, folios, comisiones. |

> ⚠️ **REGLA FINANCIERA DE ORO**: Siempre aplica la propiedad CSS `font-variant-numeric: tabular-nums;` (o clase `tabular-nums` en Tailwind) en todos los montos de dinero para que los números no bailen al cambiar de valor o alinearse verticalmente.

---

## 4. LOGO, ISOTIPO Y ASSETS SVG

El logotipo de Banorte se compone de dos elementos fundamentales:
1. **El Isotipo (Águila / Vuelo Estilizado)**: Formado por trazos diagonales paralelos de color rojo que representan dinamismo y solidez.
2. **El Logotipo Tipográfico**: La palabra **BANORTE** en mayúsculas sostenidas con tipografía geométrica bold.

### Markup SVG Listo para Copiar y Pegar

#### A. Logo Completo Horizontal (Fondo Claro)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 44" fill="none" class="h-8 w-auto">
  <!-- Isotipo Banorte (Alas / Águila geométrica estilizada) -->
  <g fill="#EB0029">
    <path d="M6 34 L18 10 L25 10 L13 34 Z" />
    <path d="M17 34 L29 10 L36 10 L24 34 Z" />
    <path d="M28 34 L40 10 L47 10 L35 34 Z" />
    <polygon points="39,10 47,10 41,22 33,22" />
  </g>
  <!-- Texto Tipográfico BANORTE -->
  <text x="56" y="28" font-family="'Montserrat', 'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="1.5" fill="#1C1E21">
    BAN<tspan fill="#EB0029">O</tspan>RTE
  </text>
</svg>
```

#### B. Isotipo Redondo (Para Favicon, Avatar de Agente o App Icon)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-12 h-12">
  <rect width="48" height="48" rx="12" fill="#EB0029"/>
  <g fill="#FFFFFF">
    <path d="M12 34 L21 14 L26 14 L17 34 Z" />
    <path d="M20 34 L29 14 L34 14 L25 34 Z" />
    <polygon points="27,14 36,14 32,22 23,22" opacity="0.95" />
  </g>
</svg>
```

---

## 5. TOKENS DE DISEÑO: RADIOS, ELEVACIONES Y ESPACIADOS

### Radios de Borde (Border Radius)
* **Botones primarios / Pills**: `rounded-full` (`9999px`) o `rounded-xl` (`12px`) dependiendo de la experiencia (la app Banorte Móvil actual utiliza bordes ligeramente redondeados de `10px - 14px`).
* **Tarjetas de crédito / débito**: `rounded-2xl` (`16px`).
* **Contenedores y Modales**: `rounded-2xl` (`16px` o `20px`).
* **Inputs y selectores**: `rounded-lg` (`8px` o `10px`).

### Sombras y Elevación (Shadow Tokens)
En banca moderna, las sombras duras transmiten desconfianza. Usa sombras difusas con tintes fríos:
```css
/* Sombra de tarjeta bancaria */
box-shadow: 0 4px 20px -2px rgba(28, 30, 33, 0.06), 0 2px 6px -1px rgba(28, 30, 33, 0.04);

/* Sombra de botón flotante / CTA principal */
box-shadow: 0 8px 16px -4px rgba(235, 0, 41, 0.3);

/* Sombra de modal / bottom sheet */
box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.18);
```

---

## 6. COMPONENTES CLAVE DE BANCA DIGITAL

A continuación tienes los snippets funcionales de referencia para que el agente construya interfaces ricas de inmediato (en React + Tailwind CSS).

### 6.1. Tarjeta de Débito/Crédito Banorte (Card Mockup)
Componente icónico que genera alto impacto visual en demos y hackathons.

```tsx
import React, { useState } from 'react';

export const BanorteCard = ({
  holderName = "MARIANA LOPEZ RIVERA",
  last4 = "8842",
  expiry = "08/29",
  balance = 48250.75,
  cardType = "Débito Nómina"
}) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative w-full max-w-sm h-52 rounded-2xl p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br from-[#EB0029] via-[#C70023] to-[#8C0018]">
      {/* Fondo con patrones geométricos sutiles de la marca */}
      <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 opacity-20 font-black text-6xl tracking-widest pointer-events-none">
        ///
      </div>

      {/* Cabecera de la Tarjeta */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-white/80">{cardType}</span>
          <h4 className="text-sm font-bold tracking-widest text-white">BANORTE</h4>
        </div>
        {/* Chip EMV Dorado */}
        <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 border border-amber-600/30 flex items-center justify-center shadow-inner">
          <div className="w-6 h-4 border border-amber-800/40 rounded-[2px]" />
        </div>
      </div>

      {/* Saldo con Toggle de visibilidad */}
      <div className="my-3 relative z-10">
        <div className="text-xs text-white/70 flex items-center gap-2">
          <span>Saldo disponible</span>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/80 hover:text-white transition-opacity text-xs"
          >
            {showBalance ? "👁️ Ocultar" : "👁️‍🗨️ Ver"}
          </button>
        </div>
        <div className="text-2xl font-bold tracking-tight tabular-nums">
          {showBalance ? `$ ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : "••••••••"}
        </div>
      </div>

      {/* Footer de Tarjeta: Número y Titular */}
      <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/15">
        <div>
          <div className="text-xs font-mono tracking-widest text-white/90">
            •••• •••• •••• {last4}
          </div>
          <div className="text-[11px] uppercase tracking-wider font-medium text-white/80 truncate max-w-[180px]">
            {holderName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-white/60">Vence</div>
          <div className="text-xs font-mono font-medium">{expiry}</div>
        </div>
      </div>
    </div>
  );
};
```

---

### 6.2. Botones de Acción Banorte
```html
<!-- 1. Botón Primario (Llamada Principal) -->
<button class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide text-white bg-[#EB0029] hover:bg-[#C70023] active:bg-[#9E001B] shadow-lg shadow-red-500/25 transition-all duration-200 flex items-center justify-center gap-2">
  <span>Transferir Dinero</span>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
</button>

<!-- 2. Botón Secundario (Borde / Outline) -->
<button class="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide text-[#EB0029] bg-white border-2 border-[#EB0029] hover:bg-red-50 active:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2">
  <span>Consultar Movimientos</span>
</button>

<!-- 3. Botón Neutro / Cancelar -->
<button class="px-5 py-3 rounded-xl font-semibold text-sm text-[#4A515E] hover:bg-slate-100 transition-colors">
  Regresar
</button>
```

---

### 6.3. Item de Transacción Bancaria (Movimientos)
```html
<div class="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E6EC] hover:border-slate-300 transition-shadow hover:shadow-sm">
  <div class="flex items-center gap-3.5">
    <!-- Icono de categoría -->
    <div class="w-11 h-11 rounded-full bg-red-50 text-[#EB0029] flex items-center justify-center font-bold text-lg">
      🛒
    </div>
    <div>
      <div class="font-bold text-sm text-[#1C1E21]">Walmart Supercenter</div>
      <div class="text-xs text-[#7A8290]">11 Sep 2026 • Tarjeta Débito *8842</div>
    </div>
  </div>
  <div class="text-right">
    <!-- Cargos en negativo (Grafito o rojo suave), Abonos en verde institucional -->
    <div class="font-bold text-sm text-[#1C1E21] tabular-nums">- $ 1,420.50</div>
    <div class="text-[11px] text-[#008744] font-medium">Aplicado</div>
  </div>
</div>
```

---

### 6.4. Comprobante de Transferencia SPEI (Receipt Card)
Fundamental para flujos donde el agente simula una transferencia o pago exitoso.

```tsx
export const SpeiReceipt = ({
  amount = 1500.00,
  beneficiary = "CARLOS HERNANDEZ TREVIÑO",
  bank = "BBVA Bancomer",
  clabe = "012180015948392019",
  trackingKey = "BNTE01002609110049281745",
  date = "11 de Septiembre 2026, 14:35 hrs"
}) => (
  <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
    {/* Franja de estado exitoso */}
    <div className="bg-[#008744] px-6 py-4 text-white flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">✓</div>
      <div>
        <h3 className="text-sm font-bold tracking-wide uppercase">Transferencia Exitosa</h3>
        <p className="text-xs text-white/90">Envío procesado por SPEI</p>
      </div>
    </div>

    {/* Monto Central */}
    <div className="p-6 text-center border-b border-slate-100">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto enviado</span>
      <div className="text-3xl font-extrabold text-[#1C1E21] mt-1 tabular-nums">
        $ {amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-500">MXN</span>
      </div>
    </div>

    {/* Datos del Comprobante */}
    <div className="p-6 space-y-3.5 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500">Destinatario</span>
        <span className="font-semibold text-slate-800 text-right">{beneficiary}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Banco Receptor</span>
        <span className="font-semibold text-slate-800">{bank}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Cuenta CLABE</span>
        <span className="font-mono text-xs text-slate-800 tracking-wider">{clabe}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Clave de Rastreo</span>
        <span className="font-mono text-xs text-slate-800 tracking-tight">{trackingKey}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Fecha y Hora</span>
        <span className="text-slate-700 text-xs">{date}</span>
      </div>
    </div>

    {/* Pie con botón de compartir */}
    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
      <button className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-100">
        Descargar PDF
      </button>
      <button className="flex-1 py-2.5 rounded-xl bg-[#EB0029] font-semibold text-xs text-white hover:bg-[#C70023]">
        Compartir
      </button>
    </div>
  </div>
);
```

---

## 7. VOZ, TONO Y MICROCOPIA FINANCIERA MEXICANA

Los jueces y usuarios en un hackathon valoran enormemente el realismo bancario en el texto de la interfaz. Usa siempre la terminología correcta del sistema financiero mexicano:

| Concepto Incorrecto / Genérico | Término Oficial Banorte / México |
| :--- | :--- |
| "Número de ruta / Routing number" | **CLABE Interbancaria** (18 dígitos obligatorios) |
| "Envío instantáneo / Wire transfer" | **Transferencia SPEI** |
| "Código de seguridad de tarjeta" | **CVV Dinámico** (generado por Token Celular) |
| "Autenticador / 2FA" | **Token Móvil Banorte** |
| "Cobro por QR" | **CoDi® / Dimo®** |
| "Historial de compras" | **Mis Movimientos** |
| "Account balance" | **Saldo Disponible** o **Saldo Actual** |
| "Retiro sin plástico" | **Retiro sin Tarjeta** |

---

## 8. REGLAS DE ORO PARA EL AGENTE FRONTEND (CHEAT SHEET)

Cuando programes cualquier vista para Banorte:
1. **Regla del 60-30-10 de Color**:
   - **60% Blanco o Gris Claro (`#F4F6F9`)**: Para fondos, tarjetas y amplitud visual.
   - **30% Grafito y Textos Neutros (`#1C1E21`, `#4A515E`)**: Para lectura limpia y estructura.
   - **10% Rojo Banorte (`#EB0029`)**: Para acciones prioritarias, logo, badges de impacto y selected states.
2. **Formato de Moneda**: Siempre prefija con `$`, separa miles con coma `,` y decimales con punto `.`, agregando `MXN` cuando haya contexto multimoneda (ej. `$ 1,250.00 MXN`).
3. **Manejo de Números Tabulares**: Agrega `font-variant-numeric: tabular-nums` o clase `tabular-nums` a saldos, contadores y listas de precios para evitar alineaciones irregulares.
4. **Validaciones Mexicanas**:
   - Las tarjetas bancarias son de **16 dígitos** con formato `XXXX XXXX XXXX XXXX`.
   - Las CLABEs son estrictamente de **18 dígitos**.
   - Los números telefónicos son de **10 dígitos**.
5. **Seguridad Visible**: Muestra siempre un indicador de seguridad (ej. candado SSL, "Sesión protegida", "Token Móvil activo"). Esto eleva drásticamente la credibilidad de la interfaz.

---
*Documento preparado como especificación técnica de UI/UX para Banorte Hackathon.*
