import React, { useRef, useState, useEffect } from 'react';
import {
  Home,
  CreditCard,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Cpu,
  Landmark,
  ReceiptText,
  BarChart3,
  LogOut,
  Code,
  SlidersHorizontal,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  RotateCcw,
  Columns2,
  X,
  PieChart,
  Activity,
  Layers,
  TrendingUp,
  Search,
} from 'lucide-react';
import { ChatStream } from './ChatStream';
import { ActionContext, A2UIPayload, ChatMessage, McpCallLog } from '../types/a2ui';
import { BanorteLogo } from './BanorteLogo';
import { BanorteCard, MayaChatWidget } from './BanorteComponents';
import { TransactionItem } from './BanorteGlobalPosition';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';
import { subscribeToDashboardSync } from '../utils/dashboardSync';

interface MobileSimulatorProps {
  clientName: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onAction: (actionCtx: ActionContext) => Promise<boolean>;
  onResetDemo?: () => void;
  accounts?: {
    nominaBalance?: number;
    oroBalance?: number;
    totalDebt?: number;
    accountLast4?: string;
    cardLast4?: string;
  };
  transactions?: TransactionItem[];
  hasRestructure?: boolean;
  mcpLogs?: McpCallLog[];
  onOpenInspector?: () => void;
  userId?: string;
  onLogout?: () => void;
}

export interface MobileWidgetItem {
  id: string;
  type: 'built_in' | 'a2ui';
  builtInKey?: 'weekly_spending' | 'rent_payment' | 'investment_quick';
  title: string;
  subtitle?: string;
  category?: 'Finanzas' | 'Pagos' | 'Inversión' | 'Crédito';
  colSpan: 1 | 2;
  payload?: A2UIPayload;
}

const DEFAULT_HOME_WIDGETS: MobileWidgetItem[] = [
  {
    id: 'weekly-spending-default',
    type: 'built_in',
    builtInKey: 'weekly_spending',
    title: 'Gastos de la semana',
    subtitle: 'Tendencia de los últimos 7 días',
    category: 'Finanzas',
    colSpan: 2,
  },
  {
    id: 'rent-payment-default',
    type: 'built_in',
    builtInKey: 'rent_payment',
    title: 'Pago recurrente',
    subtitle: 'Renta mensual',
    category: 'Pagos',
    colSpan: 1,
  },
  {
    id: 'investment-quick-default',
    type: 'built_in',
    builtInKey: 'investment_quick',
    title: 'Fondo de inversión',
    subtitle: 'Mi inversión al día',
    category: 'Inversión',
    colSpan: 1,
  },
];

const getHomeWidgetsStorageKey = (uid: string) => `banorte_home_widgets_${uid || 'default'}`;

const loadHomeWidgets = (uid: string): MobileWidgetItem[] => {
  try {
    const raw = localStorage.getItem(getHomeWidgetsStorageKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error loading home widgets from localStorage:', err);
  }
  return DEFAULT_HOME_WIDGETS;
};

interface CatalogWidgetDef {
  key: string;
  title: string;
  subtitle: string;
  category: 'Finanzas' | 'Pagos' | 'Inversión' | 'Crédito';
  icon: React.ComponentType<{ className?: string }>;
  defaultColSpan: 1 | 2;
  description: string;
  createItem: (context: { clientName: string; platinoDebt: number }) => MobileWidgetItem;
}

const WIDGET_CATALOG: CatalogWidgetDef[] = [
  {
    key: 'weekly_spending',
    title: 'Gastos de la semana',
    subtitle: 'Tendencia de los últimos 7 días',
    category: 'Finanzas',
    icon: BarChart3,
    defaultColSpan: 2,
    description: 'Gráfica interactiva de curva de gastos con comparativa semanal.',
    createItem: () => ({
      id: `weekly-spending-${Date.now()}`,
      type: 'built_in',
      builtInKey: 'weekly_spending',
      title: 'Gastos de la semana',
      subtitle: 'Tendencia de los últimos 7 días',
      category: 'Finanzas',
      colSpan: 2,
    }),
  },
  {
    key: 'rent_payment',
    title: 'Pago recurrente (Renta)',
    subtitle: '$12,800 MXN · día 15',
    category: 'Pagos',
    icon: ReceiptText,
    defaultColSpan: 1,
    description: 'Acceso directo para pagar la renta mensual con confirmación en dos pasos.',
    createItem: () => ({
      id: `rent-payment-${Date.now()}`,
      type: 'built_in',
      builtInKey: 'rent_payment',
      title: 'Pago recurrente',
      subtitle: 'Renta mensual',
      category: 'Pagos',
      colSpan: 1,
    }),
  },
  {
    key: 'investment_quick',
    title: 'Fondo de inversión',
    subtitle: 'Mi inversión (+6.8%)',
    category: 'Inversión',
    icon: Landmark,
    defaultColSpan: 1,
    description: 'Monitoreo de rendimientos diarios en tus fondos de inversión Banorte.',
    createItem: () => ({
      id: `investment-quick-${Date.now()}`,
      type: 'built_in',
      builtInKey: 'investment_quick',
      title: 'Fondo de inversión',
      subtitle: 'Mi inversión al día',
      category: 'Inversión',
      colSpan: 1,
    }),
  },
  {
    key: 'financial_health',
    title: 'Semáforo de Salud Financiera',
    subtitle: 'Score de solvencia y liquidez',
    category: 'Finanzas',
    icon: Activity,
    defaultColSpan: 2,
    description: 'Velocímetro con índice de solvencia, uso de líneas de crédito y capacidad de ahorro.',
    createItem: () => ({
      id: `financial-health-${Date.now()}`,
      type: 'a2ui',
      title: 'Salud Financiera Banorte',
      subtitle: 'Score de solvencia y liquidez',
      category: 'Finanzas',
      colSpan: 2,
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
    }),
  },
  {
    key: 'spending_donut',
    title: 'Desglose de Gastos (Donut)',
    subtitle: 'Consumos por categorías',
    category: 'Finanzas',
    icon: PieChart,
    defaultColSpan: 2,
    description: 'Distribución porcentual y en montos de tus gastos en supermercados, servicios y entretenimiento.',
    createItem: () => ({
      id: `spending-donut-${Date.now()}`,
      type: 'a2ui',
      title: 'Desglose de Gastos',
      subtitle: 'Consumos por categoría',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'SpendingDonutCard',
        props: {
          title: 'Desglose de Gastos Mensual',
          totalSpent: 14850.0,
          period: 'Últimos 30 días',
          categories: [
            { label: 'Supermercado & Despensa', amount: 5200.0, percentage: 35, color: '#EB0029' },
            { label: 'Servicios & Telefonía', amount: 3100.0, percentage: 21, color: '#004B87' },
            { label: 'Restaurantes & Cafeterías', amount: 2800.0, percentage: 19, color: '#00A859' },
            { label: 'Transporte & Gasolina', amount: 2250.0, percentage: 15, color: '#F7931A' },
            { label: 'Farmacia & Salud', amount: 1500.0, percentage: 10, color: '#7E57C2' },
          ],
        },
      },
    }),
  },
  {
    key: 'investment_simulator',
    title: 'Simulador de Pagaré Banorte',
    subtitle: 'Calculadora interactiva de GAT',
    category: 'Inversión',
    icon: TrendingUp,
    defaultColSpan: 2,
    description: 'Simula diferentes plazos y montos con rendimientos a tasa fija garantizada.',
    createItem: () => ({
      id: `investment-sim-${Date.now()}`,
      type: 'a2ui',
      title: 'Simulador de Pagaré Banorte',
      subtitle: 'Calculadora de inversión',
      category: 'Inversión',
      colSpan: 2,
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
    }),
  },
  {
    key: 'spei_transfer_form',
    title: 'Transferencia Rápida SPEI',
    subtitle: 'Envío de dinero al instante',
    category: 'Pagos',
    icon: Send,
    defaultColSpan: 2,
    description: 'Formulario para enviar dinero de inmediato con comprobación de cuenta CLABE.',
    createItem: () => ({
      id: `spei-form-${Date.now()}`,
      type: 'a2ui',
      title: 'Transferencia Rápida SPEI',
      subtitle: 'Envío de dinero al instante',
      category: 'Pagos',
      colSpan: 2,
      payload: {
        component: 'SpeiTransferFormCard',
        props: {
          defaultRecipient: 'Sofía Mendoza Ríos',
          defaultClabe: '012 180 01594839201 9',
          defaultAmount: 850.0,
          defaultConcept: 'Pago de servicios',
          maxDailyLimit: 50000.0,
        },
      },
    }),
  },
  {
    key: 'debt_restructure_plan',
    title: 'Plan de Reestructuración',
    subtitle: 'Opciones de pago a tasa fija',
    category: 'Crédito',
    icon: Layers,
    defaultColSpan: 2,
    description: 'Alternativas de 12, 24 y 36 meses para congelar intereses moratorios y reducir mensualidades.',
    createItem: ({ platinoDebt }) => ({
      id: `debt-restructure-${Date.now()}`,
      type: 'a2ui',
      title: 'Plan de Reestructuración Banorte',
      subtitle: 'Tasa fija preferencial',
      category: 'Crédito',
      colSpan: 2,
      payload: {
        component: 'DebtRestructureCard',
        props: {
          totalDebt: platinoDebt > 0 ? platinoDebt : 45200.0,
          cardName: 'Tarjeta Banorte',
          cardLast4: '8812',
          minimumPayment: 3850.0,
          dueDate: '28 Sep 2026',
          currentRate: '68.5% CAT',
          options: [
            { plan_id: 'plan_12', months: 12, monthly_payment: 4150.0, annual_rate: '19.5%', total_savings: 6200.0, label: '12 meses - Mayor rapidez' },
            { plan_id: 'plan_24', months: 24, monthly_payment: 2280.0, annual_rate: '18.9%', total_savings: 9800.0, label: '24 meses - Equilibrado' },
            { plan_id: 'plan_36', months: 36, monthly_payment: 1580.0, annual_rate: '17.9%', total_savings: 12400.0, label: '36 meses - Menor mensualidad' },
          ],
        },
      },
    }),
  },
];

type MobileTab = 'home' | 'maya' | 'cards' | 'activity';

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  clientName,
  messages,
  isLoading,
  onSendMessage,
  onAction,
  onResetDemo,
  accounts,
  transactions = [],
  hasRestructure = false,
  mcpLogs = [],
  onOpenInspector,
  userId = 'C001',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [showCvv, setShowCvv] = useState(false);
  const [isMayaWidgetOpen, setIsMayaWidgetOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);
  const [isRentConfirmationOpen, setIsRentConfirmationOpen] = useState(false);
  const cardRailRef = useRef<HTMLDivElement>(null);

  // Home Screen Widget Customization State
  const [homeWidgets, setHomeWidgets] = useState<MobileWidgetItem[]>(() => loadHomeWidgets(userId));
  const [isEditingWidgets, setIsEditingWidgets] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string>('Todos');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Re-sync when userId changes
  useEffect(() => {
    setHomeWidgets(loadHomeWidgets(userId));
  }, [userId]);

  // Persist to localStorage whenever widgets change
  useEffect(() => {
    try {
      localStorage.setItem(getHomeWidgetsStorageKey(userId), JSON.stringify(homeWidgets));
    } catch (err) {
      console.warn('Error saving home widgets to localStorage:', err);
    }
  }, [homeWidgets, userId]);

  // Sync with pinned widgets broadcast from Maya/Studio
  useEffect(() => {
    const unsubscribe = subscribeToDashboardSync(userId, (incomingWidget) => {
      setHomeWidgets((prev) => {
        const alreadyHas = prev.some(
          (w) =>
            w.id === incomingWidget.id ||
            (w.payload?.component === incomingWidget.payload?.component && w.title === incomingWidget.title)
        );
        if (alreadyHas) return prev;
        const newItem: MobileWidgetItem = {
          id: incomingWidget.id || `pinned-${Date.now()}`,
          type: 'a2ui',
          title: incomingWidget.title || 'Widget fijado',
          subtitle: 'Fijado desde Maya',
          category: 'Finanzas',
          colSpan: 2,
          payload: incomingWidget.payload,
        };
        return [newItem, ...prev];
      });
    });
    return unsubscribe;
  }, [userId]);

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homeWidgets.length) return;
    const copy = [...homeWidgets];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setHomeWidgets(copy);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setHomeWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const handleToggleColSpan = (widgetId: string) => {
    setHomeWidgets((prev) =>
      prev.map((w) => {
        if (w.id === widgetId) {
          return { ...w, colSpan: w.colSpan === 2 ? 1 : 2 };
        }
        return w;
      })
    );
  };

  const handleResetDefaultWidgets = () => {
    setHomeWidgets(DEFAULT_HOME_WIDGETS);
  };

  const handleAddFromCatalog = (def: CatalogWidgetDef) => {
    const newItem = def.createItem({ clientName, platinoDebt });
    setHomeWidgets((prev) => [...prev, newItem]);
  };

  const filteredCatalog = WIDGET_CATALOG.filter((item) => {
    const matchesCat = catalogFilter === 'Todos' || item.category === catalogFilter;
    const matchesQuery =
      !catalogSearch ||
      item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const nominaBalance = accounts?.nominaBalance ?? 27900.0;
  const platinoDebt = accounts?.totalDebt ?? 0.0;
  const accountLast4 = accounts?.accountLast4 || (clientName.includes('Carlos') ? '7721' : clientName.includes('Silvia') ? '8359' : '4582');
  const cardLast4 = accounts?.cardLast4 || (clientName.includes('Carlos') ? '8812' : '9274');
  const firstName = clientName.split(' ')[0] || 'Ana';
  const mobileCards = [
    { cardType: clientName.includes('Silvia') ? 'Débito Patrimonial' : 'Débito Nómina', last4: accountLast4, balance: nominaBalance, isGold: false },
    { cardType: 'Tarjeta Digital', last4: cardLast4, balance: Math.max(0, 80000 - platinoDebt), isGold: false },
    { cardType: 'Tarjeta Oro', last4: clientName.includes('Carlos') ? '1436' : '6648', balance: 45200, isGold: true },
  ];

  const selectMobileCard = (index: number) => {
    setSelectedCard(index);
    const card = cardRailRef.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const updateSelectedCardFromScroll = () => {
    const rail = cardRailRef.current;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    const closestIndex = Array.from(rail.children).reduce((bestIndex, child, index) => {
      const best = rail.children[bestIndex] as HTMLElement;
      const current = child as HTMLElement;
      return Math.abs(current.offsetLeft + current.offsetWidth / 2 - center) < Math.abs(best.offsetLeft + best.offsetWidth / 2 - center)
        ? index
        : bestIndex;
    }, 0);
    setSelectedCard(closestIndex);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col justify-between antialiased pb-16">
      {/* 1. Mobile Header (Clean, Authentic Banorte Red) */}
      <header className="sticky top-0 z-30 bg-[#EB0029] text-white px-4 pt-3 pb-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <BanorteLogo className="h-4 w-auto shrink-0" theme="red" />
          <div className="flex items-center gap-2">
            <a
              href="/notebook"
              className="inline-flex items-center gap-1 rounded-full bg-black/20 hover:bg-black/30 px-2 py-0.5 text-[10px] font-semibold transition border border-white/20 cursor-pointer text-white"
              title="Abrir A2UI Component Notebook"
            >
              <Code className="h-3 w-3 text-amber-300" />
              <span>UI</span>
            </a>
            {onOpenInspector && (
              <button
                type="button"
                onClick={onOpenInspector}
                className="inline-flex items-center gap-1 rounded-full bg-black/20 hover:bg-black/30 px-2 py-0.5 text-[10px] font-semibold transition border border-white/20 cursor-pointer"
                title="Abrir telemetría FastMCP"
              >
                <Cpu className="h-3 w-3 text-emerald-300" />
                <span>MCP</span>
                <span className="rounded-full bg-white/25 px-1 py-0.1 text-[9px] font-mono font-bold">
                  {mcpLogs.length}
                </span>
              </button>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              <span>Token</span>
            </span>
            <div className="h-7 w-7 rounded-full bg-white text-[#EB0029] font-black text-xs grid place-items-center shadow-xs">
              {firstName[0] || 'R'}
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 rounded-full bg-black/20 hover:bg-black/30 px-2 py-1 text-[10px] font-semibold transition border border-white/20 cursor-pointer text-white"
                title="Cerrar sesión demo"
              >
                <LogOut className="h-3 w-3" />
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-red-100 font-medium">Banca Móvil Banorte</p>
            <h1 className="text-base font-extrabold tracking-tight">Hola, {firstName}</h1>
          </div>
          <span className="text-[10px] text-red-100 bg-black/10 px-2 py-0.5 rounded-full">
            Cliente Preferente
          </span>
        </div>
      </header>

      {/* 2. Main Mobile Body Content */}
      <main className="flex-1 px-3.5 py-4 max-w-lg mx-auto w-full">
        {/* TAB 1: HOME (Accounts, Quick Actions, Debt Alert, Movements) */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Card-first banking area: swipeable products keep the active card centered and substantial on a phone. */}
            <section aria-label="Tus tarjetas" className="-mx-3.5 overflow-hidden pb-1">
              <div ref={cardRailRef} onScroll={updateSelectedCardFromScroll} className="card-rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-2 pb-3 pt-1">
                {mobileCards.map((card, index) => (
                  <button
                    key={`${card.cardType}-${card.last4}`}
                    type="button"
                    onClick={() => selectMobileCard(index)}
                    className={`w-[calc(100vw-1.25rem)] max-w-[30rem] shrink-0 snap-center text-left transition duration-300 ${selectedCard === index ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-70'}`}
                    aria-pressed={selectedCard === index}
                  >
                    <BanorteCard size="large" holderName={clientName} last4={card.last4} balance={card.balance} cardType={card.cardType} isGold={card.isGold} />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between px-4 text-[10px] font-semibold text-slate-500">
                <span>Desliza para ver tus tarjetas</span>
                <span className="text-[#EB0029]">{selectedCard + 1} de {mobileCards.length}</span>
              </div>
              <div className="mt-1.5 flex justify-center gap-1.5" aria-label="Selector de tarjeta">
                {mobileCards.map((card, index) => <span key={card.last4} className={`h-1.5 rounded-full transition-all ${selectedCard === index ? 'w-5 bg-[#EB0029]' : 'w-1.5 bg-slate-300'}`} />)}
              </div>
            </section>

            {/* Action rail, separated from the card products. */}
            <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('maya');
                  onSendMessage('Transfiere $850 a Sofía Mendoza por SPEI');
                }}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <Send className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>Transferir</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <CreditCard className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>Mis tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('maya');
                  onSendMessage('Muéstrame las opciones de mi fondo de inversión');
                }}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <Landmark className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>Inversiones</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('maya');
                  onSendMessage('Quiero simular una inversión en Pagaré Banorte');
                }}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <ReceiptText className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>Pagar servicio</span>
              </button>
            </div>
            </div>

            {/* Adaptive widgets: dynamic, customizable home screen widgets with reordering, deletion, and catalog */}
            <section className="space-y-3" aria-label="Widgets adaptables">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Para ti</h2>
                  <p className="text-[10px] text-slate-500">
                    {isEditingWidgets ? 'Personalizando módulos de inicio' : 'Acciones frecuentes y vistas fijadas'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {isEditingWidgets ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsAddWidgetModalOpen(true)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#EB0029] px-2.5 py-1 text-[11px] font-bold transition border border-red-200 cursor-pointer shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetDefaultWidgets}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 text-[11px] font-semibold transition cursor-pointer"
                        title="Restablecer predeterminados"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingWidgets(false)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#EB0029] hover:bg-[#C70023] text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Listo</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingWidgets(true)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 text-[10px] font-bold transition cursor-pointer border border-slate-200 shadow-2xs"
                    >
                      <SlidersHorizontal className="h-3 w-3 text-[#EB0029]" />
                      <span>Personalizar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Mode Advice Bar */}
              {isEditingWidgets && (
                <div className="flex items-center justify-between bg-red-50/80 border border-red-200/80 rounded-xl px-3 py-2 text-[11px] text-red-950 animate-in fade-in duration-150">
                  <span>Reordena con <b>↑/↓</b>, cambia ancho (<b>1/2 col</b>) o quita con <b>✕</b>.</span>
                  <button
                    type="button"
                    onClick={() => setIsAddWidgetModalOpen(true)}
                    className="text-[#EB0029] font-bold underline hover:opacity-80 shrink-0 ml-2 cursor-pointer"
                  >
                    + Catálogo
                  </button>
                </div>
              )}

              {/* Widgets Grid */}
              <div className="grid grid-cols-2 gap-3">
                {homeWidgets.map((widget, index) => {
                  const isFullWidth =
                    widget.colSpan === 2 || (widget.builtInKey === 'rent_payment' && isRentConfirmationOpen);

                  return (
                    <div
                      key={widget.id}
                      className={`${isFullWidth ? 'col-span-2' : 'col-span-1'} transition-all duration-200 ${
                        isEditingWidgets
                          ? 'ring-2 ring-red-400/40 rounded-2xl p-1 bg-red-50/20 border border-dashed border-red-300'
                          : ''
                      }`}
                    >
                      {/* Widget Edit Bar */}
                      {isEditingWidgets && (
                        <div className="mb-1.5 flex items-center justify-between rounded-xl bg-slate-900 px-2.5 py-1.5 text-white text-[11px] shadow-xs">
                          <span className="font-bold text-slate-200 truncate max-w-[110px]">{widget.title}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveWidget(index, 'up')}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-slate-700 disabled:opacity-25 transition cursor-pointer"
                              title="Mover arriba"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveWidget(index, 'down')}
                              disabled={index === homeWidgets.length - 1}
                              className="p-1 rounded hover:bg-slate-700 disabled:opacity-25 transition cursor-pointer"
                              title="Mover abajo"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleColSpan(widget.id)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title={widget.colSpan === 2 ? 'Reducir a 1 columna' : 'Expandir a 2 columnas'}
                            >
                              <Columns2 className="h-2.5 w-2.5 text-amber-300" />
                              <span>{widget.colSpan === 2 ? '2 col' : '1 col'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveWidget(widget.id)}
                              className="p-1 rounded hover:bg-red-600/80 text-red-300 hover:text-white transition cursor-pointer"
                              title="Eliminar de inicio"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Built-in: Weekly Spending */}
                      {widget.type === 'built_in' && widget.builtInKey === 'weekly_spending' && (
                        <article className="min-h-[224px] overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xs">
                          <div className="flex items-center justify-between bg-[#EB0029] px-3 py-2 text-white">
                            <div>
                              <p className="text-[10px] font-extrabold">{widget.title}</p>
                              <p className="text-[9px] text-red-100">{widget.subtitle || 'Tendencia de los últimos 7 días'}</p>
                            </div>
                            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold">-10.4%</span>
                          </div>
                          <div className="p-3.5">
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500">Total semanal</p>
                                <p className="text-xl font-black tabular-nums text-slate-900">
                                  $4,280 <span className="text-[10px] font-bold text-slate-500">MXN</span>
                                </p>
                              </div>
                              <span className="rounded-full bg-[#FFF3D1] px-2 py-1 text-[10px] font-bold text-[#8A5B00]">
                                vs. semana previa
                              </span>
                            </div>
                            <svg
                              viewBox="0 0 292 120"
                              className="mt-3 h-28 w-full overflow-visible"
                              role="img"
                              aria-label="Tendencia semanal de gastos a la baja"
                            >
                              <defs>
                                <linearGradient id="spending-fill" x1="0" x2="0" y1="0" y2="1">
                                  <stop stopColor="#EB0029" stopOpacity="0.25" />
                                  <stop offset="1" stopColor="#EB0029" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M8 96 L8 70 L54 52 L100 76 L146 24 L192 56 L238 82 L284 42 L284 96 Z"
                                fill="url(#spending-fill)"
                              />
                              <path
                                d="M8 70 L54 52 L100 76 L146 24 L192 56 L238 82 L284 42"
                                fill="none"
                                stroke="#EB0029"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {[
                                ['L', 8, 70],
                                ['M', 54, 52],
                                ['M', 100, 76],
                                ['J', 146, 24],
                                ['V', 192, 56],
                                ['S', 238, 82],
                                ['D', 284, 42],
                              ].map(([label, cx, cy], labelIdx) => (
                                <g key={`${label}-${labelIdx}`}>
                                  <circle
                                    cx={cx as number}
                                    cy={cy as number}
                                    r="3"
                                    fill="white"
                                    stroke="#EB0029"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={cx as number}
                                    y="114"
                                    textAnchor="middle"
                                    fill="#64748B"
                                    fontSize="9"
                                    fontWeight="700"
                                  >
                                    {label}
                                  </text>
                                </g>
                              ))}
                              <circle cx="284" cy="42" r="5" fill="#C89319" stroke="white" strokeWidth="3" />
                            </svg>
                          </div>
                        </article>
                      )}

                      {/* Built-in: Rent Recurring Payment */}
                      {widget.type === 'built_in' && widget.builtInKey === 'rent_payment' && (
                        <div
                          className={`overflow-hidden rounded-2xl border border-red-100 bg-white text-left shadow-xs transition hover:border-[#EB0029] ${
                            isRentConfirmationOpen ? 'col-span-2' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setIsRentConfirmationOpen((open) => !open)}
                            className="w-full text-left cursor-pointer"
                          >
                            <div className="flex items-center justify-between bg-[#EB0029] px-3 py-2 text-white">
                              <span className="text-[10px] font-bold">{widget.title}</span>
                              <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold">Mensual</span>
                            </div>
                            <div className="p-3">
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-[#EB0029]">
                                <ReceiptText className="h-4 w-4" />
                              </div>
                              <p className="mt-2 text-xs font-extrabold text-slate-900">Renta</p>
                              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">$12,800 MXN · día 15</p>
                              <span className="mt-2 inline-block text-[10px] font-bold text-[#EB0029]">
                                {isRentConfirmationOpen ? 'Revisar pago' : 'Pagar ahora'}{' '}
                                <ChevronRight className="inline h-3 w-3" />
                              </span>
                            </div>
                          </button>
                          {isRentConfirmationOpen && (
                            <div className="border-t border-red-100 bg-red-50 p-3">
                              <p className="mb-2 text-[10px] font-medium text-[#8C0018]">
                                Confirma monto y destinatario antes de continuar.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('maya');
                                  onSendMessage('Quiero confirmar el pago de mi renta por $12,800 MXN');
                                }}
                                className="w-full rounded-lg bg-[#EB0029] py-2 text-xs font-bold text-white cursor-pointer"
                              >
                                Confirmar pago con Maya
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Built-in: Investment Quick Card */}
                      {widget.type === 'built_in' && widget.builtInKey === 'investment_quick' && (
                        <article className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xs">
                          <div className="bg-[#EB0029] px-3 py-2 text-white">
                            <p className="text-[10px] font-extrabold">{widget.title}</p>
                          </div>
                          <div className="p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F4] text-[#EB0029]">
                              <BarChart3 className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-xs font-extrabold text-slate-900">Mi inversión</p>
                            <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                              {widget.subtitle || 'Rendimiento al día'}
                            </p>
                            <p className="mt-2 text-sm font-black text-[#8A5B00]">+6.8%</p>
                          </div>
                        </article>
                      )}

                      {/* A2UI Dynamic Registered Components */}
                      {widget.type === 'a2ui' && widget.payload && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                          <DynamicA2UIRegistry payload={widget.payload} onAction={onAction} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state when all widgets are removed */}
              {homeWidgets.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center space-y-3 shadow-xs">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-[#EB0029]">
                    <SlidersHorizontal className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Sin widgets en pantalla principal</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Personaliza tu espacio agregando los módulos que más utilizas.</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddWidgetModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#EB0029] hover:bg-[#C70023] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Abrir Catálogo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaultWidgets}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restablecer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Add Widget Button in Edit Mode */}
              {isEditingWidgets && homeWidgets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddWidgetModalOpen(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-red-200 bg-red-50/40 hover:bg-red-50 text-[#EB0029] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar nuevo widget desde el catálogo</span>
                </button>
              )}
            </section>

            {/* Credit Card / Status Banner */}
            {platinoDebt > 0 ? (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                      {clientName.includes('Carlos') ? 'Tarjeta Banorte Clásica' : 'Tarjeta Banorte Oro'}
                    </span>
                    <span className="font-mono text-xs text-slate-400">•••• {cardLast4 || '8812'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                    {hasRestructure ? 'Tasa Fija 22.5%' : '64.8% CAT'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Saldo actual exigible</span>
                  <div className="text-xl font-black tabular-nums">
                    ${platinoDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-xs font-semibold">MXN</span>
                  </div>
                </div>

                {hasRestructure ? (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-600/50 p-2.5 text-[11px] text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Convenio activo: Intereses moratorios congelados.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('maya');
                      onSendMessage('¿Cómo reestructurar mi tarjeta de crédito?');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Reestructurar con Maya</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Cuentas al Corriente
                  </span>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">Sin saldos deudores vencidos</p>
                </div>
                <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                  100% Sano
                </span>
              </div>
            )}

            {/* Recent Activity List */}
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Movimientos Recientes</span>
                <span className="text-[10px] text-slate-400">Auditado SPEI</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
                      <div>
                        <p className="font-bold text-slate-900">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                      <span className={`font-bold tabular-nums ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === 'credit' ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-[11px] text-center py-2">Sin movimientos recientes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MAYA COPILOTO (The Full, Interactive A2UI Chat Experience on Mobile) */}
        {activeTab === 'maya' && (
          <div className="w-full">
            <ChatStream
              messages={messages}
              isLoading={isLoading}
              onSendMessage={onSendMessage}
              onAction={onAction}
              clientName={clientName}
              onResetDemo={onResetDemo}
              userId={userId}
            />
          </div>
        )}

        {/* TAB 3: TARJETAS (Interactive Digital Card with CVV Dinámico) */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#1C1E21] to-[#343B45] p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {cardLast4 ? (clientName.includes('Carlos') ? 'Tarjeta Digital Clásica' : 'Tarjeta Digital Oro') : 'Tarjeta Digital Enlace Débito'}
                </span>
                <span className="text-xs font-mono font-bold">BANORTE</span>
              </div>

              <div className="font-mono text-lg tracking-widest text-slate-100">
                •••• •••• •••• {cardLast4 || accountLast4}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Titular</span>
                  <span className="font-bold">{clientName}</span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block uppercase">CVV Dinámico</span>
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="font-mono font-black text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    {showCvv ? '842' : '•••'}
                    {showCvv ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2.5 shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Límite de Crédito:</span>
                <span className="font-bold">$80,000.00 MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Exigible:</span>
                <span className="font-bold tabular-nums">
                  ${platinoDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Corte:</span>
                <span className="font-bold text-[#EB0029]">18 Sep 2026</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('maya');
                onSendMessage('¿Cómo reestructurar mi tarjeta Platino?');
              }}
              className="w-full py-3 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Ver opciones de reestructuración en Maya</span>
            </button>
          </div>
        )}

        {/* TAB 4: MOVIMIENTOS */}
        {activeTab === 'activity' && (
          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200 space-y-3">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Historial Completo de Movimientos
            </h2>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Depósito Nómina Banorte</p>
                  <p className="text-[10px] text-slate-400">Hoy, 08:30 hrs • SPEI</p>
                </div>
                <span className="font-bold text-emerald-600">+$14,250.00 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Transferencia SPEI a Sofía</p>
                  <p className="text-[10px] text-slate-400">Ayer, 20:15 hrs • BBVA</p>
                </div>
                <span className="font-bold text-slate-900">-$850.00 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Walmart Supercenter</p>
                  <p className="text-[10px] text-slate-400">10 Sep, 17:42 hrs • Platino *4892</p>
                </div>
                <span className="font-bold text-slate-900">-$1,840.50 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Netflix México</p>
                  <p className="text-[10px] text-slate-400">08 Sep, 12:00 hrs • Cargo Automático</p>
                </div>
                <span className="font-bold text-slate-900">-$219.00 MXN</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Catálogo de Widgets Banorte */}
        {isAddWidgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between bg-[#EB0029] px-4 py-3 text-white">
                <div>
                  <h3 className="text-sm font-black tracking-tight">Catálogo de Widgets Banorte</h3>
                  <p className="text-[10px] text-red-100">Personaliza tu pantalla principal con módulos interactivos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddWidgetModalOpen(false)}
                  className="rounded-full p-1.5 text-white hover:bg-black/20 transition cursor-pointer"
                  title="Cerrar catálogo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search & Category Filter Pills */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/80 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Buscar widget (ej. gastos, inversión, deuda)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#EB0029] focus:ring-1 focus:ring-[#EB0029]"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
                  {['Todos', 'Finanzas', 'Pagos', 'Inversión', 'Crédito'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCatalogFilter(cat)}
                      className={`rounded-full px-2.5 py-1 font-bold transition cursor-pointer shrink-0 ${
                        catalogFilter === cat
                          ? 'bg-[#EB0029] text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Catalog List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100">
                {filteredCatalog.map((item) => {
                  const IconComp = item.icon;
                  const isAlreadyAdded = homeWidgets.some(
                    (w) =>
                      (w.builtInKey && w.builtInKey === item.key) ||
                      (w.payload?.component &&
                        item.createItem({ clientName, platinoDebt }).payload?.component === w.payload?.component)
                  );

                  return (
                    <div
                      key={item.key}
                      className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-red-50 text-[#EB0029] mt-0.5 shadow-2xs">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                              {item.category}
                            </span>
                            <span className="rounded-full bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 text-[9px] font-semibold text-[#8A5B00]">
                              {item.defaultColSpan === 2 ? '2 col' : '1 col'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.description}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddFromCatalog(item)}
                        className="shrink-0 rounded-lg bg-[#EB0029] hover:bg-[#C70023] text-white px-2.5 py-1.5 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{isAlreadyAdded ? '+ Agregar' : 'Agregar'}</span>
                      </button>
                    </div>
                  );
                })}

                {filteredCatalog.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No se encontraron widgets con ese criterio.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Widgets en inicio: <b className="text-slate-800">{homeWidgets.length}</b>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddWidgetModalOpen(false)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {activeTab !== 'maya' && (
        <MayaChatWidget
          isOpen={isMayaWidgetOpen}
          onToggle={() => setIsMayaWidgetOpen((open) => !open)}
          onSendPrompt={onSendMessage}
          onExpandToFull={() => {
            setIsMayaWidgetOpen(false);
            setActiveTab('maya');
          }}
        />
      )}

      {/* 3. Bottom Native Mobile Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/90 py-2 px-6 flex justify-around text-[10px] font-bold text-slate-500 z-40 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center cursor-pointer transition ${
            activeTab === 'home' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <Home className="h-4 w-4 mb-0.5" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center cursor-pointer transition ${
            activeTab === 'cards' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <CreditCard className="h-4 w-4 mb-0.5" />
          <span>Tarjetas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex flex-col items-center cursor-pointer transition ${
            activeTab === 'activity' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 mb-0.5" />
          <span>Movimientos</span>
        </button>
      </nav>
    </div>
  );
};
