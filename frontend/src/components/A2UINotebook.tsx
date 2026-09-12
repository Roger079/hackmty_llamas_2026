import React, { useState } from 'react';
import {
  Code,
  Eye,
  Smartphone,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Terminal,
  Layers,
  Search,
  Filter,
  CreditCard,
  PieChart,
  Send,
  TrendingUp,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';
import { A2UIPayload, ActionContext } from '../types/a2ui';

interface A2UINotebookProps {
  onNavigateHome?: () => void;
}

interface ComponentEntry {
  id: string;
  name: string;
  category: 'cuentas' | 'credito' | 'gastos' | 'spei' | 'inversion';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  payload: A2UIPayload;
}

const NOTEBOOK_COMPONENTS: ComponentEntry[] = [
  {
    id: 'balance-card-nomina',
    name: 'BanorteBalanceCard (Nómina & Débito)',
    category: 'cuentas',
    description: 'Resumen financiero de cuenta de nómina principal con tarjeta de débito asociada y saldo disponible.',
    icon: CreditCard,
    payload: {
      component: 'BanorteBalanceCard',
      props: {
        clientName: 'Ana Martínez',
        primaryAccountName: 'Cuenta Enlace Digital Banorte',
        primaryAccountLast4: '4582',
        primaryAccountBalance: 27900.0,
        secondaryType: 'card',
        cardName: 'Débito Nómina Banorte',
        cardLast4: '9274',
        secondaryBalance: 1450.0,
        status: 'active',
      },
    },
  },
  {
    id: 'balance-card-credito',
    name: 'BanorteBalanceCard (Con Tarjeta de Crédito)',
    category: 'cuentas',
    description: 'Vista de cuentas de cliente con tarjeta de crédito Banorte y saldo deudor en seguimiento.',
    icon: CreditCard,
    payload: {
      component: 'BanorteBalanceCard',
      props: {
        clientName: 'Carlos Ramírez',
        primaryAccountName: 'Cuenta Preferente Banorte',
        primaryAccountLast4: '7721',
        primaryAccountBalance: 4200.0,
        secondaryType: 'card',
        cardName: 'Tarjeta Banorte Clásica',
        cardLast4: '8812',
        totalDebt: 45200.0,
        oroBalance: 12500.0,
      },
    },
  },
  {
    id: 'debt-restructure',
    name: 'DebtRestructureCard (Plan de Reestructura)',
    category: 'credito',
    description: 'Propuesta formal de renegociación de pasivos con opciones de plazo (12, 24, 36 meses), tasa preferencial y ahorro proyectado.',
    icon: Layers,
    payload: {
      component: 'DebtRestructureCard',
      props: {
        totalDebt: 45200.0,
        cardName: 'Tarjeta Banorte Clásica Oro',
        cardLast4: '8812',
        minimumPayment: 3850.0,
        dueDate: '28 Sep 2026',
        currentRate: '68.5% CAT',
        options: [
          {
            plan_id: 'plan_12',
            months: 12,
            monthly_payment: 4150.0,
            annual_rate: '19.5%',
            total_savings: 6200.0,
            label: '12 meses - Mayor rapidez',
          },
          {
            plan_id: 'plan_24',
            months: 24,
            monthly_payment: 2280.0,
            annual_rate: '18.9%',
            total_savings: 9800.0,
            label: '24 meses - Equilibrado',
          },
          {
            plan_id: 'plan_36',
            months: 36,
            monthly_payment: 1580.0,
            annual_rate: '17.9%',
            total_savings: 12400.0,
            label: '36 meses - Menor mensualidad',
          },
        ],
      },
    },
  },
  {
    id: 'spending-donut',
    name: 'SpendingDonutCard (Desglose de Gastos)',
    category: 'gastos',
    description: 'Gráfica interactiva Donut de consumos clasificados por categoría con montos y porcentajes.',
    icon: PieChart,
    payload: {
      component: 'SpendingDonutCard',
      props: {
        title: 'Desglose de Gastos de Agosto 2026',
        totalSpent: 14850.0,
        period: '01 al 31 de Agosto 2026',
        categories: [
          { label: 'Supermercado & Despensa', amount: 5200.0, percentage: 35, color: '#EB0029' },
          { label: 'Servicios & Telefonía', amount: 3100.0, percentage: 21, color: '#004B87' },
          { label: 'Restaurantes & Cafeterías', amount: 2800.0, percentage: 19, color: '#00A859' },
          { label: 'Transporte & Gasolina', amount: 2250.0, percentage: 15, color: '#F7931A' },
          { label: 'Farmacia & Salud', amount: 1500.0, percentage: 10, color: '#7E57C2' },
        ],
      },
    },
  },
  {
    id: 'financial-health',
    name: 'FinancialHealthGauge (Salud Financiera)',
    category: 'gastos',
    description: 'Indicador tipo velocímetro del score de bienestar financiero con nivel de solvencia y recomendaciones.',
    icon: Activity,
    payload: {
      component: 'FinancialHealthGauge',
      props: {
        score: 84,
        tier: 'Saludable',
        summary: 'Tu capacidad de pago y liquidez se encuentran en rango óptimo. Mantienes menos del 30% de tus líneas crediticias en uso.',
        debtRatio: '22%',
        savingsCapacity: '$8,400 MXN / mes',
        emergencyFundMonths: 3.5,
      },
    },
  },
  {
    id: 'spei-transfer-form',
    name: 'SpeiTransferFormCard (Formulario de Envío)',
    category: 'spei',
    description: 'Formulario interactivo para capturar transferencia SPEI inmediata con validación en tiempo real.',
    icon: Send,
    payload: {
      component: 'SpeiTransferFormCard',
      props: {
        defaultRecipient: 'Sofía Mendoza Ríos',
        defaultClabe: '012 180 01594839201 9',
        defaultAmount: 2500.0,
        defaultConcept: 'Pago de colegiatura',
        maxDailyLimit: 50000.0,
      },
    },
  },
  {
    id: 'spei-confirm-card',
    name: 'SpeiConfirmCard (Confirmación SPEI con Token)',
    category: 'spei',
    description: 'Pantalla previa al envío para validar los datos del beneficiario, cuenta CLABE y autorización 2FA.',
    icon: ShieldCheck,
    payload: {
      component: 'SpeiConfirmCard',
      props: {
        recipientName: 'Silvia Carrasco Alvarado',
        recipientBank: 'BBVA Bancomer',
        clabe: '012 180 00456789012 3',
        amount: 3850.0,
        fee: 0.0,
        concept: 'Honorarios profesionales',
        accountDebitLast4: '4582',
        trackingKey: 'BNTE-20260912-77291',
      },
    },
  },
  {
    id: 'spei-receipt-card',
    name: 'SpeiReceiptCard (Comprobante Oficial SPEI)',
    category: 'spei',
    description: 'Recibo oficial emitido con clave de rastreo de Banco de México, sello digital y folio de autorización.',
    icon: Check,
    payload: {
      component: 'SpeiReceiptCard',
      props: {
        folio: 'SPEI-883920194',
        trackingKey: '202609120800123901928301',
        authorizationCode: 'AUTH-9921',
        status: 'Liquidada Exitosamente',
        amount: 3850.0,
        senderName: 'Ana Martínez',
        senderAccount: '•••• 4582',
        recipientName: 'Silvia Carrasco Alvarado',
        recipientBank: 'BBVA Bancomer',
        recipientClabe: '••••••••••• 0123',
        concept: 'Honorarios profesionales',
        timestamp: '12 Sep 2026, 15:28 hrs',
        digitalSeal: 'BANORTE-SHA256-A83F9102B4D',
      },
    },
  },
  {
    id: 'confirmation-receipt',
    name: 'ConfirmationReceipt (Recibo de Convenio)',
    category: 'credito',
    description: 'Comprobante formal emitido tras aceptar una reestructuración de pasivo o liquidación acordada.',
    icon: ShieldCheck,
    payload: {
      component: 'ConfirmationReceipt',
      props: {
        folio: 'FOL-BNTE-2026-R8812',
        status: 'CONVENIO ACTIVADO',
        clientName: 'Carlos Ramírez',
        monthlyPayment: 1580.0,
        termMonths: 36,
        nextPaymentDate: '15 Oct 2026',
        bankSeal: 'BANORTE-CRYPTO-SHA256-VALID',
      },
    },
  },
  {
    id: 'amortization-schedule',
    name: 'AmortizationScheduleCard (Tabla de Amortización)',
    category: 'credito',
    description: 'Tabla desglosada mensual con desglose de amortización a capital, intereses devengados e IVA.',
    icon: FileSpreadsheet,
    payload: {
      component: 'AmortizationScheduleCard',
      props: {
        totalPrincipal: 45200.0,
        monthlyPayment: 1580.0,
        termMonths: 36,
        annualRate: 17.9,
        schedule: [
          { month: 1, payment: 1580, principal: 905, interest: 675, balance: 44295 },
          { month: 2, payment: 1580, principal: 919, interest: 661, balance: 43376 },
          { month: 3, payment: 1580, principal: 932, interest: 648, balance: 42444 },
          { month: 4, payment: 1580, principal: 946, interest: 634, balance: 41498 },
          { month: 5, payment: 1580, principal: 960, interest: 620, balance: 40538 },
          { month: 6, payment: 1580, principal: 975, interest: 605, balance: 39563 },
        ],
      },
    },
  },
  {
    id: 'investment-simulator',
    name: 'InvestmentSimulatorCard (Simulador de Inversión)',
    category: 'inversion',
    description: 'Calculadora interactiva de Pagaré Banorte con ajuste de capital, plazos (28 a 360 días) y cálculo de GAT.',
    icon: TrendingUp,
    payload: {
      component: 'InvestmentSimulatorCard',
      props: {
        initialAmount: 50000.0,
        initialTermDays: 91,
        annualRate: '11.25%',
        estimatedGain: 1412.33,
        totalMaturity: 51412.33,
        productName: 'Pagaré Altos Rendimientos Banorte',
      },
    },
  },
  {
    id: 'banorte-chart-sankey',
    name: 'BanorteChartCard (Flujo de Dinero Sankey)',
    category: 'gastos',
    description: 'Visualización de flujo financiero desde fuentes de ingreso hacia partidas de gasto e inversión.',
    icon: Activity,
    payload: {
      component: 'BanorteChartCard',
      props: {
        chartType: 'sankey',
        title: 'Flujo de Liquidez Banorte',
        data: {
          nodes: [
            { id: 'Ingresos Nómina' },
            { id: 'Cuenta Operativa' },
            { id: 'Ahorro Inversión' },
            { id: 'Gastos Fijos' },
            { id: 'Tarjeta de Crédito' },
          ],
          links: [
            { source: 'Ingresos Nómina', target: 'Cuenta Operativa', value: 27900 },
            { source: 'Cuenta Operativa', target: 'Ahorro Inversión', value: 7000 },
            { source: 'Cuenta Operativa', target: 'Gastos Fijos', value: 14500 },
            { source: 'Cuenta Operativa', target: 'Tarjeta de Crédito', value: 6400 },
          ],
        },
      },
    },
  },
];

export const A2UINotebook: React.FC<A2UINotebookProps> = ({ onNavigateHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [containerWidth, setContainerWidth] = useState<'mobile' | 'wide'>('mobile');
  const [activeTabPerComponent, setActiveTabPerComponent] = useState<Record<string, 'preview' | 'json' | 'edit'>>({});
  const [customPayloads, setCustomPayloads] = useState<Record<string, A2UIPayload>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLogs, setActionLogs] = useState<Array<{ timestamp: string; action: string; data: any }>>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const filteredComponents = NOTEBOOK_COMPONENTS.filter((comp) => {
    const matchesCat = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.payload.component.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAction = async (actionCtx: ActionContext): Promise<boolean> => {
    const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActionLogs((prev) => [
      {
        timestamp: time,
        action: actionCtx.action,
        data: actionCtx.params || (actionCtx as any).data || {},
      },
      ...prev.slice(0, 49),
    ]);
    return true;
  };

  const handleCopyJson = (payload: A2UIPayload, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const handleResetPayload = (id: string) => {
    setCustomPayloads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleJsonEdit = (id: string, text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.component) {
        setCustomPayloads((prev) => ({ ...prev, [id]: parsed }));
      }
    } catch {
      // Allow user to continue editing malformed JSON without crash
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col antialiased selection:bg-[#EB0029] selection:text-white">
      {/* 1. Notebook Top Bar */}
      <header className="sticky top-0 z-40 bg-[#EB0029] text-white px-4 sm:px-6 py-3 shadow-md border-b border-[#C70023]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-xs font-bold text-white transition border border-white/20 cursor-pointer"
                title="Regresar a la aplicación"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Regresar</span>
              </button>
            )}
            <BanorteLogo className="h-5 w-auto shrink-0" theme="red" />
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  A2UI Component Notebook
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.2 text-[9px] font-mono font-bold text-white">
                  v1.2 Debugger
                </span>
              </div>
              <p className="hidden text-[10px] text-red-100 sm:block">
                Visualizador interactivo de todos los componentes declarativos A2UI Banorte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Width Switcher */}
            <div className="flex items-center rounded-xl bg-black/20 p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setContainerWidth('mobile')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  containerWidth === 'mobile'
                    ? 'bg-white text-[#EB0029] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Ver en ancho de Smartphone (390px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Móvil (390px)</span>
              </button>
              <button
                type="button"
                onClick={() => setContainerWidth('wide')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  containerWidth === 'wide'
                    ? 'bg-white text-[#EB0029] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Ver en contenedor amplio (100%)"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>

            {/* Action Console Toggle */}
            <button
              type="button"
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition cursor-pointer ${
                isConsoleOpen || actionLogs.length > 0
                  ? 'bg-white text-slate-900 border-white shadow-xs'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Abrir consola de eventos interactivos A2UI"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-600" />
              <span>Acciones</span>
              {actionLogs.length > 0 && (
                <span className="rounded-full bg-[#EB0029] text-white px-1.5 py-0.2 text-[10px] font-mono font-bold">
                  {actionLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Search & Category Filter Toolbar */}
      <div className="sticky top-[53px] z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos', count: NOTEBOOK_COMPONENTS.length },
              { id: 'cuentas', label: 'Cuentas & Saldos', count: 2 },
              { id: 'credito', label: 'Crédito & Deuda', count: 3 },
              { id: 'gastos', label: 'Analítica & Gastos', count: 3 },
              { id: 'spei', label: 'Transferencias SPEI', count: 3 },
              { id: 'inversion', label: 'Inversiones', count: 1 },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#EB0029] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar componente o prop..."
              className="h-8 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#EB0029] focus:bg-white focus:ring-1 focus:ring-[#EB0029]"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Showcase Canvas */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-slate-900">
              Catálogo de Componentes Visuales ({filteredComponents.length})
            </h1>
            <p className="text-xs text-slate-500">
              Prueba interacciones táctiles, valida respuestas de botón e inspecciona esquemas JSON en vivo.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Modo de vista: {containerWidth === 'mobile' ? 'Simulador Smartphone 390px' : 'Contenedor Completo'}
          </span>
        </div>

        {/* Grid of Components */}
        <div
          className={
            containerWidth === 'mobile'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start'
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'
          }
        >
          {filteredComponents.map((item) => {
            const Icon = item.icon;
            const currentTab = activeTabPerComponent[item.id] || 'preview';
            const activePayload = customPayloads[item.id] || item.payload;
            const isModified = Boolean(customPayloads[item.id]);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition hover:shadow-md flex flex-col"
              >
                {/* Component Card Header */}
                <div className="border-b border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-red-50 text-[#EB0029] grid place-items-center shrink-0 border border-red-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs font-extrabold text-slate-900 truncate">
                          {item.name}
                        </h2>
                        {isModified && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                            Editado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                    </div>
                  </div>

                  {/* Component Tab Toggles */}
                  <div className="flex items-center rounded-lg bg-slate-200/60 p-0.5 text-[11px] shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTabPerComponent((prev) => ({ ...prev, [item.id]: 'preview' }))}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition cursor-pointer ${
                        currentTab === 'preview'
                          ? 'bg-white text-[#EB0029] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ver componente interactivo en vivo"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Vista</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabPerComponent((prev) => ({ ...prev, [item.id]: 'json' }))}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition cursor-pointer ${
                        currentTab === 'json'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ver esquema JSON A2UI"
                    >
                      <Code className="h-3 w-3" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Component Body */}
                <div className="p-4 bg-slate-50/40 flex-1 flex flex-col justify-center">
                  {currentTab === 'preview' ? (
                    <div
                      className={
                        containerWidth === 'mobile'
                          ? 'max-w-[390px] mx-auto w-full transition-all'
                          : 'w-full transition-all'
                      }
                    >
                      <DynamicA2UIRegistry
                        payload={activePayload}
                        onAction={handleAction}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono text-[10px]">A2UIPayload Declarativo</span>
                        <div className="flex items-center gap-1.5">
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleResetPayload(item.id)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-amber-700 hover:bg-amber-50 cursor-pointer"
                              title="Restablecer a valores iniciales"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restablecer</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyJson(activePayload, item.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                            title="Copiar JSON al portapapeles"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={JSON.stringify(activePayload, null, 2)}
                        onChange={(e) => handleJsonEdit(item.id, e.target.value)}
                        rows={14}
                        className="w-full rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 leading-relaxed outline-none border border-slate-800 resize-y"
                        spellCheck={false}
                      />
                    </div>
                  )}
                </div>

                {/* Component Card Footer */}
                <div className="border-t border-slate-100 bg-white px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {item.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Interactivo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. Real-time Action Dispatch Console Drawer */}
      {isConsoleOpen && (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[480px] bg-slate-950 text-white rounded-t-2xl sm:rounded-2xl border border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[380px] animate-in slide-in-from-bottom duration-200">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold tracking-wide uppercase">
                Consola de Despacho de Acciones ({actionLogs.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {actionLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActionLogs([])}
                  className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsConsoleOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
          </header>

          <div className="p-3 overflow-y-auto space-y-2 flex-1 font-mono text-xs">
            {actionLogs.length === 0 ? (
              <p className="text-slate-500 italic text-[11px] p-2 text-center">
                Interactúa con los botones de cualquier componente A2UI para ver los eventos despachados aquí.
              </p>
            ) : (
              actionLogs.map((log, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-black/40 p-2 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">{log.action}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Minimalist Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-[11px] text-slate-400 font-medium">
        Banorte A2UI Architecture · Entorno de pruebas y validación visual
      </footer>
    </div>
  );
};
