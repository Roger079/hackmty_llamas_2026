import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  RotateCcw,
  Sparkles,
  Columns2,
  Square,
  X,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Sliders,
  CreditCard,
  Wallet,
  Activity,
  Download,
  Filter,
  Palette,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Send,
} from 'lucide-react';
import { BanortePortalSegmentBar } from './BanortePortalSegmentBar';
import { BanortePortalHeader } from './BanortePortalHeader';
import { ErrorBoundary } from './ErrorBoundary';
import { McpInspector } from './McpInspector';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';
import { SpendingDonutCard } from './SpendingDonutCard';
import { FinancialHealthGauge } from './FinancialHealthGauge';
import { DebtRestructureCard } from './DebtRestructureCard';
import { InvestmentSimulatorCard } from './InvestmentSimulatorCard';
import { BanorteChartCard } from './BanorteChartCard';
import { ChatStream } from './ChatStream';
import { TransactionItem } from './BanorteGlobalPosition';
import investmentTrend from '../assets/12ui/investment-trend.png';
import {
  A2UIPayload,
  ActionContext,
  ChatMessage,

  DashboardWidgetItem,
  McpCallLog,
  UserCognitiveProfile,
} from '../types/a2ui';
import {
  getPinnedWidgets,
  savePinnedWidgets,
  subscribeToDashboardSync,
  broadcastWidgetToDashboard,
} from '../utils/dashboardSync';

interface PowerUserDashboardProps {
  initialUserId?: string;
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

export const PowerUserDashboard: React.FC<PowerUserDashboardProps> = ({
  initialUserId = 'C001',
  onNavigateHome,
  onLogout,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId);
  const [clientName, setClientName] = useState<string>('Ana Martínez');
  const [bankAccounts, setBankAccounts] = useState<{
    nominaBalance?: number;
    oroBalance?: number;
    totalDebt?: number;
    accountLast4?: string;
    cardLast4?: string;
  }>({
    nominaBalance: 27900.0,
    oroBalance: 0.0,
    totalDebt: 0.0,
    accountLast4: '4582',
    cardLast4: '',
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [cognitiveProfile, setCognitiveProfile] = useState<UserCognitiveProfile | null>(null);

  // Inspector & Telemetry
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [mcpLogs, setMcpLogs] = useState<McpCallLog[]>([]);

  // Layout & Dock States
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [columnsLayout, setColumnsLayout] = useState<'two' | 'one'>('two');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat in the Maya dock
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: 'Hola. Soy **Maya** y puedo ayudarte a componer y analizar tu Dashboard. Pídeme proyecciones o gráficos avanzados para montarlos aquí.',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Widgets State
  const [widgets, setWidgets] = useState<DashboardWidgetItem[]>([]);

  const isCarlos = selectedUserId === 'C002' || clientName.includes('Carlos');
  const isSilvia = selectedUserId === 'C003' || clientName.includes('Silvia');
  const isAna = !isCarlos && !isSilvia;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  // Default widgets are empty until the user specifically adds or pins them
  const getDefaultWidgetsForUser = (): DashboardWidgetItem[] => [];

  // Sync customer state from SQLite
  useEffect(() => {
    // 1. Bank State
    fetch(`/api/bank/state?user_id=${selectedUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.client_name) setClientName(data.client_name);
        const accLast4 = data.primary_account?.account_last4 || (data.accounts?.[0]?.account_last4 ?? '0000');
        const cardLast4 = data.primary_card?.pan_last4 || (data.credit_cards?.[0]?.pan_last4 ?? '');
        const updatedAccounts = {
          nominaBalance: data.total_available_balance ?? 27900.0,
          totalDebt: data.total_debt ?? 0.0,
          accountLast4: accLast4,
          cardLast4: cardLast4,
        };
        setBankAccounts(updatedAccounts);
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }

        // 2. Load only widgets explicitly pinned or sent by the user
        const stored = getPinnedWidgets(selectedUserId);
        setWidgets(stored);
      })
      .catch((err) => {
        console.warn('Could not load bank state in PowerUserDashboard:', err);
        const stored = getPinnedWidgets(selectedUserId);
        setWidgets(stored);
      });


    // 3. Cognitive Profile
    fetch(`/api/user/cognitive-profile?user_id=${selectedUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((prof) => {
        if (prof?.user_id) setCognitiveProfile(prof);
      })
      .catch(() => {});

    // 4. Persistent Chat History for Maya Dock
    fetch(`/api/chat/history?user_id=${selectedUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.history?.length > 0) {
          setMessages(data.history);
        } else {
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: 'Hola. Soy **Maya** y puedo ayudarte a componer y analizar tu Dashboard. Pídeme proyecciones o gráficos avanzados para montarlos aquí.',
              timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      })
      .catch(() => {});
  }, [selectedUserId]);

  // Subscribe to real-time BroadcastChannel from mobile chatbot
  useEffect(() => {
    const unsubscribe = subscribeToDashboardSync(selectedUserId, (newWidget) => {
      setWidgets((prev) => {
        const filtered = prev.filter((w) => w.id !== newWidget.id);
        const updated = [{ ...newWidget, source: 'mobile' as const }, ...filtered];
        savePinnedWidgets(selectedUserId, updated);
        return updated;
      });
      showToast(`📱 Widget recibido desde Banca Móvil: "${newWidget.title}"`);
    });

    return () => unsubscribe();
  }, [selectedUserId]);

  // Clear all custom widgets
  const handleClearWidgets = () => {
    setWidgets([]);
    savePinnedWidgets(selectedUserId, []);
    showToast('✓ Widgets retirados del Command Center');
  };


  // Remove Widget
  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== widgetId);
      savePinnedWidgets(selectedUserId, updated);
      return updated;
    });
    showToast('Widget retirado del Command Center');
  };

  // Change Chart Type in Place
  const handleToggleChartType = (widgetId: string, newType: 'bar' | 'line' | 'sankey') => {
    setWidgets((prev) => {
      const updated = prev.map((w) => {
        if (w.id === widgetId) {
          const updatedPayload = {
            ...w.payload,
            props: {
              ...w.payload.props,
              chartType: newType,
            },
          };
          return {
            ...w,
            chartType: newType,
            payload: updatedPayload,
          };
        }
        return w;
      });
      savePinnedWidgets(selectedUserId, updated);
      return updated;
    });
    showToast(`Visualización cambiada a ${newType.toUpperCase()}`);
  };

  // Change Color Theme in Place
  const handleChangeColorTheme = (widgetId: string, colorHex: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => {
        if (w.id === widgetId) {
          const updatedPayload = { ...w.payload };
          if (updatedPayload.props?.data?.series?.[0]) {
            updatedPayload.props.data.series[0].color = colorHex;
          }
          if (updatedPayload.props?.colorPositive) {
            updatedPayload.props.colorPositive = colorHex;
          }
          return {
            ...w,
            colorTheme: colorHex,
            payload: updatedPayload,
          };
        }
        return w;
      });
      savePinnedWidgets(selectedUserId, updated);
      return updated;
    });
    showToast('Color de serie actualizado');
  };

  // Add Widget from Catalog Menu
  const handleAddWidgetFromCatalog = (type: string) => {
    const timestamp = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    let newWidget: DashboardWidgetItem;

    switch (type) {
      case 'sankey':
        newWidget = {
          id: `w-sankey-${Date.now()}`,
          title: 'Flujo de Efectivo Sankey Banorte',
          component: 'BanorteChartCard',
          source: 'studio',
          chartType: 'sankey',
          colorTheme: '#EB0029',
          pinnedAt: timestamp,
          payload: {
            component: 'BanorteChartCard',
            props: {
              id: `sankey-${Date.now()}`,
              chartType: 'sankey',
              title: 'Flujo de Dinero: Cuentas y Destinos',
              valueFormat: 'currency',
              currency: 'MXN',
              data: {
                nodes: [
                  { id: 'nomina', label: 'Nómina Banorte', color: '#061D3A' },
                  { id: 'cuenta', label: 'Cuenta Principal', color: '#EB0029' },
                  { id: 'servicios', label: 'Servicios', color: '#C89319' },
                  { id: 'ahorro', label: 'Ahorro e inversión', color: '#008A5A' },
                ],
                links: [
                  { source: 'nomina', target: 'cuenta', value: 25000 },
                  { source: 'cuenta', target: 'servicios', value: 4500 },
                  { source: 'cuenta', target: 'ahorro', value: 20500 },
                ],
              },
            },
          },
        };
        break;

      case 'donut':
        newWidget = {
          id: `w-donut-${Date.now()}`,
          title: 'Desglose de Gastos por Categoría',
          component: 'SpendingDonutCard',
          source: 'studio',
          pinnedAt: timestamp,
          payload: {
            component: 'SpendingDonutCard',
            props: {
              period: 'Septiembre 2026',
              totalSpent: 7890.0,
              previousPeriodSpent: 8400.0,
              trend_pct: -6.1,
              summary: 'Monitoreo de categorías de consumo quincenal.',
              categories: [
                { name: 'Supermercado', amount: 3200.0, percentage: 40.5, color: '#EB0029' },
                { name: 'Servicios Básicos', amount: 2100.0, percentage: 26.6, color: '#4A5568' },
                { name: 'Entretenimiento', amount: 1500.0, percentage: 19.0, color: '#FF5A70' },
                { name: 'Transporte', amount: 1090.0, percentage: 13.9, color: '#718096' },
              ],
            },
          },
        };
        break;

      case 'investment':
        newWidget = {
          id: `w-inv-${Date.now()}`,
          title: 'Simulador de Rendimientos Pagaré Banorte',
          component: 'InvestmentSimulatorCard',
          source: 'studio',
          pinnedAt: timestamp,
          payload: {
            component: 'InvestmentSimulatorCard',
            props: {
              initialAmount: 40000,
              initialTermDays: 91,
              annualRate: '9.8%',
            },
          },
        };
        break;

      case 'health':
        newWidget = {
          id: `w-health-${Date.now()}`,
          title: 'Score Financiero y Capacidad de Endeudamiento',
          component: 'FinancialHealthGauge',
          source: 'studio',
          pinnedAt: timestamp,
          payload: {
            component: 'FinancialHealthGauge',
            props: {
              overallScore: 82,
              status: 'EXCELENTE',
              statusColor: '#008A5A',
              metrics: {
                credit_utilization_pct: 22.4,
                available_liquidity: bankAccounts.nominaBalance ?? 27900.0,
                current_debt: bankAccounts.totalDebt ?? 0.0,
                savings_capacity_monthly: 6500.0,
              },
            },
          },
        };
        break;

      case 'restructure':
        newWidget = {
          id: `w-restructure-${Date.now()}`,
          title: 'Plan de Reestructuración a Plazo Fijo',
          component: 'DebtRestructureCard',
          source: 'studio',
          pinnedAt: timestamp,
          payload: {
            component: 'DebtRestructureCard',
            props: {
              totalDebt: (bankAccounts.totalDebt ?? 0) > 0 ? (bankAccounts.totalDebt ?? 35000.0) : 35000.0,
              cardName: 'Tarjeta Banorte Clásica',


              cardLast4: bankAccounts.cardLast4 || '8812',
              minimumPayment: 2100.0,
              dueDate: '27 Sep 2026',
              currentRate: '64.8% CAT',
            },
          },
        };
        break;

      default:
        return;
    }

    setWidgets((prev) => {
      const updated = [newWidget, ...prev];
      savePinnedWidgets(selectedUserId, updated);
      return updated;
    });
    setIsAddMenuOpen(false);
    showToast(`✓ Widget añadido: ${newWidget.title}`);
  };

  // Handle Action Triggered from inside Widgets
  const handleAction = async (actionCtx: ActionContext): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Acción ejecutada desde Command Center: ${actionCtx.action}`,
          user_id: selectedUserId,
          action_context: actionCtx,
        }),
      });

      if (res.ok) {
        showToast(`✓ Operación "${actionCtx.action}" registrada con éxito`);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Send message in Maya Studio Dock
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: selectedUserId,
        }),
      });

      if (!response.ok || !response.body) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMsgId = `asst-${Date.now()}`;
      let accumulatedText = '';
      let emittedA2UI: A2UIPayload | undefined = undefined;

      const initialAsstMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, initialAsstMsg]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataLines: string[] = [];
          for (const line of block.split('\n')) {
            if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trimStart());
            }
          }
          if (!eventMatch || dataLines.length === 0) continue;

          const event = eventMatch[1].trim();
          const rawData = dataLines.join('\n');
          let dataJson: any = null;
          try {
            dataJson = JSON.parse(rawData);
          } catch {
            dataJson = rawData;
          }

          if (event === 'token' && typeof dataJson === 'string') {
            accumulatedText += dataJson;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
              )
            );
          } else if (event === 'a2ui' && dataJson) {
            const a2ui = dataJson as A2UIPayload;
            emittedA2UI = a2ui;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, a2ui } : m
              )
            );

            // Auto-pin new widget to Command Center if requested
            const newWidgetItem: DashboardWidgetItem = {
              id: `dock-widget-${Date.now()}`,
              title: a2ui.props?.title || `${a2ui.component}`,
              component: a2ui.component,
              payload: a2ui,
              source: 'studio',
              pinnedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            };

            setWidgets((prev) => {
              const updated = [newWidgetItem, ...prev];
              savePinnedWidgets(selectedUserId, updated);
              return updated;
            });
            showToast(`✨ Widget anclado al Command Center desde Maya Studio`);
          } else if (event === 'done' && dataJson) {
            if (dataJson.reply && (!accumulatedText || accumulatedText.trim().length === 0)) {
              accumulatedText = dataJson.reply;
            }
            if (dataJson.a2ui) {
              emittedA2UI = dataJson.a2ui;
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: accumulatedText, a2ui: emittedA2UI || m.a2ui }
                  : m
              )
            );
          }
        }
      }

      // Fallback to /api/chat if streaming returned empty
      if (!accumulatedText.trim()) {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, user_id: selectedUserId }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: fallbackData.reply || '', a2ui: fallbackData.a2ui }
                : m
            )
          );
        }
      }
    } catch (err) {
      console.warn('Error in Maya Studio chat:', err);
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, user_id: selectedUserId }),
        });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}`,
              role: 'assistant',
              content: fallbackData.reply || 'Operación procesada por Maya.',
              a2ui: fallbackData.a2ui,
              timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (fallbackErr) {
        console.error('All chat attempts failed in dock:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] text-[#061D3A] flex flex-col justify-between antialiased">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="flex items-center gap-2.5 rounded-xl bg-[#061D3A] text-white px-4 py-3 shadow-xl border border-slate-700 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {isClearConfirmationOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="clear-widgets-title">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <h2 id="clear-widgets-title" className="text-base font-extrabold text-[#061D3A]">¿Limpiar widgets?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Se retirarán los {widgets.length} widgets personalizados de este Dashboard.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setIsClearConfirmationOpen(false)} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={() => { handleClearWidgets(); setIsClearConfirmationOpen(false); }} className="rounded-xl bg-[#EB0029] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#C70023]">Limpiar widgets</button>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* 1. Official Banorte Top Segment Bar */}
        <BanortePortalSegmentBar activeSegment="Personas" />

        {/* 2. Official Banorte Header (with User Switcher) */}
        <BanortePortalHeader
          clientName={clientName}
          minimal
          selectedUserId={selectedUserId}
          onSelectUser={(newId) => setSelectedUserId(newId)}
          onLogout={onLogout}
        />

        {/* 3. Dashboard controls */}
        <div className="sticky top-[70px] z-30 w-full border-b border-[#E1EAF2] bg-white shadow-xs px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="mx-auto flex max-w-[1536px] flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-black tracking-[0.12em] text-[#061D3A]">DASHBOARD</h1>
              <p className="mt-0.5 text-[11px] font-medium text-[#6D85A1]">{widgets.length} widgets activos</p>
            </div>

            {/* Top Command Actions */}
            <div className="flex items-center gap-2">
              {/* Add Widget Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Agregar Widget</span>
                </button>

                {isAddMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                      Catálogo de Componentes A2UI
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('sankey')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4 text-[#EB0029]" />
                        <div>
                          <div className="font-bold text-slate-800">Flujo Sankey Banorte</div>
                          <div className="text-[10px] text-slate-400">Diagrama de ingresos y destinos</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('donut')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <PieChart className="h-4 w-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-slate-800">Desglose de Gastos Donut</div>
                          <div className="text-[10px] text-slate-400">Distribución por categoría</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('investment')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-bold text-slate-800">Simulador Pagaré Banorte</div>
                          <div className="text-[10px] text-slate-400">Con sliders interactivos</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('health')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Activity className="h-4 w-4 text-amber-500" />
                        <div>
                          <div className="font-bold text-slate-800">Salud Financiera & Buró</div>
                          <div className="text-[10px] text-slate-400">Score y alerta de intereses</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('restructure')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="font-bold text-slate-800">Reestructuración a Plazo</div>
                          <div className="text-[10px] text-slate-400">Convenio a tasa preferencial</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Widgets Button */}
              {widgets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearConfirmationOpen(true)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="Limpiar widgets personalizados"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Limpiar Widgets</span>
                </button>
              )}


              {/* Grid Layout Toggle */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setColumnsLayout('two')}
                  className={`p-1 rounded-lg transition cursor-pointer ${
                    columnsLayout === 'two' ? 'bg-[#EB0029] text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista en 2 columnas (Alta densidad)"
                >
                  <Columns2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setColumnsLayout('one')}
                  className={`p-1 rounded-lg transition cursor-pointer ${
                    columnsLayout === 'one' ? 'bg-[#EB0029] text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Vista en 1 columna (Análisis completo)"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Toggle Assistant Dock */}
              <button
                type="button"
                onClick={() => setIsDockCollapsed(!isDockCollapsed)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  isDockCollapsed
                    ? 'bg-[#061D3A] text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={isDockCollapsed ? 'Mostrar Maya' : 'Ocultar Maya para pantalla completa'}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{isDockCollapsed ? 'Abrir Asistente' : 'Ocultar Asistente'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Main Banking Workspace */}
        <main className="mx-auto w-full max-w-[1536px] px-4 py-5 sm:px-6 lg:px-8">
          <div
            className={`grid gap-5 transition-all duration-300 ${
              isDockCollapsed
                ? 'grid-cols-1'
                : 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]'
            }`}
          >
            {/* LEFT COLUMN: The Modular Power User Command Center */}
            <div className="space-y-5">
              {/* 1. The 3 Official Banorte Financial Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* 1. Débito Enlace Nómina */}
                <div className="banorte-card flex min-h-[230px] flex-col justify-between p-5 rounded-2xl bg-white border border-[#CBD9E6] shadow-xs transition hover:-translate-y-0.5 hover:border-slate-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#203956]">
                        {isSilvia
                          ? 'Cuenta Ahorro Patrimonial'
                          : isCarlos
                          ? 'Cuenta de Ahorro Banorte'
                          : 'Débito Enlace Nómina'}
                      </span>
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 font-bold text-emerald-600">
                        <Wallet className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6D85A1]">
                      Cuenta: &nbsp;••••&nbsp; {bankAccounts.accountLast4 || '4582'}
                    </p>
                    <div className="mt-3">
                      <span className="text-[13px] font-medium text-[#6D85A1]">Saldo disponible</span>
                      <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                        ${(bankAccounts.nominaBalance ?? 27900.0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                        <span className="text-xs font-semibold text-slate-500">MXN</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Transfiere $850 a Sofía Mendoza para la cena.')}
                      className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
                    >
                      <span>Transferir por SPEI</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Línea de Crédito Banorte */}
                <div className="banorte-card flex min-h-[230px] flex-col justify-between p-5 rounded-2xl bg-white border border-[#CBD9E6] shadow-xs transition hover:-translate-y-0.5 hover:border-slate-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#203956]">
                        {bankAccounts.cardLast4
                          ? isCarlos
                            ? 'Tarjeta Banorte Clásica'
                            : 'Tarjeta Banorte Oro'
                          : 'Línea de Crédito Banorte'}
                      </span>
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${
                          (bankAccounts.totalDebt ?? 0) > 0 ? 'bg-red-50 text-[#EB0029]' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6D85A1]">
                      {bankAccounts.cardLast4 ? `Crédito: •••• ${bankAccounts.cardLast4}` : 'Sin tarjetas de crédito activas'}
                    </p>
                    <div className="mt-3">
                      <span className="text-[13px] font-medium text-[#6D85A1]">
                        {(bankAccounts.totalDebt ?? 0) > 0 ? 'Saldo total a la fecha' : 'Saldo deudor'}
                      </span>
                      <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                        ${(bankAccounts.totalDebt ?? 0.0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                        <span className="text-xs font-semibold text-slate-500">MXN</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleSendMessage(
                          (bankAccounts.totalDebt ?? 0) > 0
                            ? '¿Cómo reestructurar mi tarjeta de crédito?'
                            : '¿Cuáles son mis gastos del mes?'
                        )
                      }
                      className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
                    >
                      <span>{(bankAccounts.totalDebt ?? 0) > 0 ? 'Ver plan de pago fijo' : 'Sin saldo deudor'}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. Pagaré Banorte a Plazo */}
                <div className="banorte-card flex min-h-[230px] flex-col justify-between p-5 rounded-2xl bg-white border border-[#CBD9E6] shadow-xs transition hover:-translate-y-0.5 hover:border-slate-300">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#203956]">
                        {isSilvia ? 'Pagaré Altos Rendimientos' : 'Pagaré Banorte a Plazo'}
                      </span>
                      <img src={investmentTrend} alt="" className="h-10 w-10 object-contain" />
                    </div>
                    <p className="mt-1 text-[13px] text-[#6D85A1]">
                      {isSilvia ? 'Tasa preferencial 9.8% Anual' : 'Tasa garantizada 9.1% Anual'}
                    </p>
                    <div className="mt-3">
                      <span className="text-[13px] font-medium text-[#6D85A1]">
                        {isSilvia ? 'Patrimonio para Inversión' : 'Inversión sugerida'}
                      </span>
                      <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                        {isSilvia ? '$116,614.10' : '$25,000.00'}{' '}
                        <span className="text-xs font-semibold text-slate-500">MXN</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Quiero simular una inversión a plazo fijo.')}
                      className="flex items-center gap-1 text-[13px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      <span>Simular rendimientos</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {isSilvia ? '+9.8% Rend.' : '+9.1% Rend.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Modular Widgets Canvas (Only populated when user requests or sends widgets) */}
              {widgets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold text-[#061D3A] uppercase tracking-wide">
                      Widgets Personalizados ({widgets.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsClearConfirmationOpen(true)}
                      className="text-[11px] font-bold text-slate-500 hover:text-[#EB0029] transition cursor-pointer"
                    >
                      Limpiar Widgets
                    </button>
                  </div>
                  <div
                    className={`grid gap-4 ${
                      columnsLayout === 'two' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >

                  {widgets.map((widget) => {
                    const isChart =
                      widget.component === 'BanorteChartCard' ||
                      widget.component === 'Chart' ||
                      widget.payload.props?.chartType;

                    return (
                      <div
                        key={widget.id}
                        className="banorte-card rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:border-[#CBD9E6] flex flex-col justify-between"
                      >
                        {/* Widget Header & In-Place Editing Tools */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-extrabold text-[#061D3A]">
                              {widget.title}
                            </h3>
                            {widget.source === 'mobile' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <Smartphone className="h-3 w-3" />
                                <span>Desde Móvil</span>
                              </span>
                            ) : widget.source === 'studio' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                <Sparkles className="h-3 w-3" />
                                <span>Maya</span>
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                Sistema
                              </span>
                            )}
                          </div>

                          {/* In-Place Controls: Visual Type & Palette */}
                          <div className="flex items-center gap-1.5">
                            {isChart && (
                              <>
                                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChartType(widget.id, 'bar')}
                                    className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                                      widget.chartType === 'bar'
                                        ? 'bg-white text-[#EB0029] shadow-2xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Visualizar como Barras"
                                  >
                                    Barras
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChartType(widget.id, 'line')}
                                    className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                                      widget.chartType === 'line'
                                        ? 'bg-white text-[#EB0029] shadow-2xs'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Visualizar como Líneas"
                                  >
                                    Líneas
                                  </button>
                                </div>

                                {/* Color Swatches */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleChangeColorTheme(widget.id, '#EB0029')}
                                    className="h-3.5 w-3.5 rounded-full bg-[#EB0029] border border-white shadow-2xs hover:scale-110 transition cursor-pointer"
                                    title="Color Institucional Banorte"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleChangeColorTheme(widget.id, '#008A5A')}
                                    className="h-3.5 w-3.5 rounded-full bg-[#008A5A] border border-white shadow-2xs hover:scale-110 transition cursor-pointer"
                                    title="Color Inversión Esmeralda"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleChangeColorTheme(widget.id, '#061D3A')}
                                    className="h-3.5 w-3.5 rounded-full bg-[#061D3A] border border-white shadow-2xs hover:scale-110 transition cursor-pointer"
                                    title="Color Azul Marino"
                                  />
                                </div>
                              </>
                            )}

                            {/* Remove Widget Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveWidget(widget.id)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-[#EB0029] transition cursor-pointer"
                              title="Retirar widget del dashboard"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Widget Body */}
                        <div className="flex-1">
                          <ErrorBoundary fallbackTitle={`Widget ${widget.title}`}>
                            <DynamicA2UIRegistry
                              payload={widget.payload}
                              onAction={handleAction}
                              disabled={isLoading}
                            />
                          </ErrorBoundary>
                        </div>

                        {/* Widget Footer Status */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                          <span>Actualizado {widget.pinnedAt}</span>
                          <span className="font-mono">{widget.component}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



              {/* Transactions Audit Table (Always synchronized with SQLite) */}
              <div className="banorte-card rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#061D3A]">
                      Auditoría de Movimientos y Transferencias SPEI
                    </h3>
                    <p className="text-xs text-[#6D85A1]">
                      Registros inmutables en SQLite consultados por FastMCP
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert('Descarga de auditoría en formato Excel/CSV iniciada')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>Exportar</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E1EAF2] bg-[#F6F9FC] text-xs font-bold uppercase tracking-wide text-[#617A96]">
                        <th className="py-2.5 px-4">Concepto / Destino</th>
                        <th className="py-2.5 px-4">Fecha y Hora</th>
                        <th className="py-2.5 px-4 text-right">Monto</th>
                        <th className="py-2.5 px-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-800">{tx.description}</div>
                            <div className="text-[10px] text-slate-400">{tx.account}</div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">{tx.date}</td>
                          <td className="py-2.5 px-4 text-right font-bold tabular-nums">
                            <span className={tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}>
                              {tx.type === 'credit' ? '+' : ''}$
                              {Math.abs(Number(tx.amount) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Maya Dock */}
            {!isDockCollapsed && (
              <div className="space-y-4">
                <div className="banorte-card rounded-2xl border border-[#CBD9E6] bg-white shadow-sm flex flex-col h-[760px] overflow-hidden">
                  {/* Dock Header */}
                  <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-xl bg-[#EB0029] text-white flex items-center justify-center font-black text-xs shadow-xs">
                        M
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">Maya</div>
                        <span className="text-[10px] text-emerald-300 font-medium">
                          Asistente de Composición
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDockCollapsed(true)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                      title="Ocultar dock"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quick Prompts Bar */}
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Quiero hacer una transferencia SPEI')}
                      className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-red-300 transition cursor-pointer"
                    >
                      + Formulario SPEI
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Agrega un análisis de flujo de efectivo Sankey')}
                      className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-red-300 transition cursor-pointer"
                    >
                      + Flujo Sankey
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Simula una inversión en pagaré a 90 días')}
                      className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-red-300 transition cursor-pointer"
                    >
                      + Pagaré
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Muestra mis gastos por categoría en un gráfico donut')}
                      className="shrink-0 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-700 hover:border-red-300 transition cursor-pointer"
                    >
                      + Donut Gastos
                    </button>
                  </div>

                  {/* Embedded Chat Stream */}
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <ChatStream
                      messages={messages}
                      isLoading={isLoading}
                      onSendMessage={handleSendMessage}
                      onAction={handleAction}
                      clientName={clientName}
                      userId={selectedUserId}
                      className="flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white"
                      hideHeader={true}
                      onResetDemo={() => {
                        setMessages([
                          {
                            id: `rst-${Date.now()}`,
                            role: 'assistant',
                            content: 'Historial de Maya restablecido. ¿Qué componente deseas montar en el Dashboard?',
                            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                          },
                        ]);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FastMCP Inspector Drawer */}
      {isInspectorOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950 p-6 text-white shadow-2xl border-l border-slate-800 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold">Telemetría FastMCP</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsInspectorOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <McpInspector
            logs={mcpLogs}
            onClear={() => setMcpLogs([])}
            isConnected={true}
            embedded
          />
        </div>
      )}

    </div>
  );
};
