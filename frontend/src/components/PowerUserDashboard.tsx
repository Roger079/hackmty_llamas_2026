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
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { BanortePortalHeader } from './BanortePortalHeader';
import { BanorteLogo } from './BanorteLogo';
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
  fetchCloudPinnedWidgets,
  removeCloudPinnedWidget,
  clearCloudPinnedWidgets,
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
  const [isDockExpanded, setIsDockExpanded] = useState(false);
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

  // Default widgets are Bar Chart, Heatmap, and Waterfall
  const getDefaultWidgetsForUser = (): DashboardWidgetItem[] => [
    {
      id: 'default-dash-bar-chart',
      title: 'Gastos por Categoría (Barras)',
      component: 'BanorteChartCard',
      source: 'system',
      chartType: 'bar',
      colorTheme: '#EB0029',
      pinnedAt: '09:00',
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-dash-bar-chart',
          chartType: 'bar',
          title: 'Gastos por Categoría',
          subtitle: 'Septiembre 2026 · Distribución en MXN',
          height: 260,
          categoryKey: 'category',
          valueKey: 'amount',
          data: [
            { category: 'Supermercado', label: 'Supermercado', amount: 5200, value: 5200, color: '#EB0029' },
            { category: 'Servicios', label: 'Servicios', amount: 3100, value: 3100, color: '#004B87' },
            { category: 'Restaurantes', label: 'Restaurantes', amount: 2800, value: 2800, color: '#D97706' },
            { category: 'Transporte', label: 'Transporte', amount: 2250, value: 2250, color: '#8B5CF6' },
            { category: 'Farmacia', label: 'Farmacia', amount: 1500, value: 1500, color: '#10B981' },
          ],
        },
      },
    },
    {
      id: 'default-dash-heatmap-chart',
      title: 'Frecuencia de Gastos Diarios (Heatmap)',
      component: 'BanorteChartCard',
      source: 'system',
      chartType: 'calendarHeatmap',
      colorTheme: '#EB0029',
      pinnedAt: '09:00',
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-dash-heatmap-chart',
          chartType: 'calendarHeatmap',
          title: 'Frecuencia de Gastos Diarios',
          subtitle: 'Septiembre 2026 · Intensidad de consumos',
          height: 250,
          dateKey: 'date',
          valueKey: 'value',
          data: [
            { date: '2026-09-01', value: 450, count: 2 },
            { date: '2026-09-02', value: 1200, count: 4 },
            { date: '2026-09-03', value: 320, count: 1 },
            { date: '2026-09-04', value: 2800, count: 5 },
            { date: '2026-09-05', value: 950, count: 3 },
            { date: '2026-09-06', value: 150, count: 1 },
            { date: '2026-09-07', value: 4100, count: 6 },
            { date: '2026-09-08', value: 800, count: 2 },
            { date: '2026-09-09', value: 1450, count: 3 },
            { date: '2026-09-10', value: 3100, count: 5 },
            { date: '2026-09-11', value: 620, count: 2 },
            { date: '2026-09-12', value: 1890, count: 4 },
            { date: '2026-09-13', value: 380, count: 1 },
            { date: '2026-09-14', value: 920, count: 2 },
            { date: '2026-09-15', value: 5400, count: 7 },
            { date: '2026-09-16', value: 1100, count: 3 },
            { date: '2026-09-17', value: 750, count: 2 },
            { date: '2026-09-18', value: 2400, count: 4 },
            { date: '2026-09-19', value: 1350, count: 3 },
            { date: '2026-09-20', value: 290, count: 1 },
            { date: '2026-09-21', value: 820, count: 2 },
            { date: '2026-09-22', value: 1640, count: 3 },
            { date: '2026-09-23', value: 410, count: 1 },
            { date: '2026-09-24', value: 1980, count: 4 },
            { date: '2026-09-25', value: 2200, count: 4 },
            { date: '2026-09-26', value: 680, count: 2 },
            { date: '2026-09-27', value: 310, count: 1 },
            { date: '2026-09-28', value: 3800, count: 5 },
          ],
        },
      },
    },
    {
      id: 'default-dash-waterfall-chart',
      title: 'Conciliación Financiera (Waterfall)',
      component: 'BanorteChartCard',
      source: 'system',
      chartType: 'waterfall',
      colorTheme: '#0A5CA8',
      pinnedAt: '09:00',
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-dash-waterfall-chart',
          chartType: 'waterfall',
          title: 'Conciliación Financiera (Waterfall)',
          subtitle: 'Septiembre 2026 · Flujo neto de efectivo',
          height: 260,
          categoryKey: 'etapa',
          valueKey: 'monto',
          data: [
            { etapa: 'Ingresos Nómina', category: 'Ingresos Nómina', monto: 38500, amount: 38500 },
            { etapa: 'Renta', category: 'Renta', monto: -14200, amount: -14200 },
            { etapa: 'Supermercado', category: 'Supermercado', monto: -6200, amount: -6200 },
            { etapa: 'Servicios', category: 'Servicios', monto: -3100, amount: -3100 },
            { etapa: 'Inversión Ahorro', category: 'Inversión Ahorro', monto: -5000, amount: -5000 },
            { etapa: 'Saldo Neto', category: 'Saldo Neto', monto: 10000, amount: 10000 },
          ],
        },
      },
    },
  ];

  const refreshBankState = async (userId: string) => {
    try {
      const res = await fetch(`/api/bank/state?user_id=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.client_name) setClientName(data.client_name);
      const accLast4 = data.primary_account?.account_last4 || (data.accounts?.[0]?.account_last4 ?? '0000');
      const cardLast4 = data.primary_card?.pan_last4 || (data.credit_cards?.[0]?.pan_last4 ?? '');
      setBankAccounts({
        nominaBalance: data.total_available_balance ?? 27900.0,
        totalDebt: data.total_debt ?? 0.0,
        accountLast4: accLast4,
        cardLast4: cardLast4,
      });
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.warn('Could not load bank state in PowerUserDashboard:', err);
    }
  };

  // Sync customer state from SQLite
  useEffect(() => {
    // 1. Bank State
    refreshBankState(selectedUserId);

    // 2. Load widgets explicitly pinned or sent by the user (localStorage first, then cloud sync)
    const stored = getPinnedWidgets(selectedUserId);
    if (stored && stored.length > 0) {
      setWidgets(stored);
    } else {
      const defaults = getDefaultWidgetsForUser();
      setWidgets(defaults);
      savePinnedWidgets(selectedUserId, defaults);
    }
    fetchCloudPinnedWidgets(selectedUserId)
      .then((cloudWidgets) => {
        if (cloudWidgets && cloudWidgets.length > 0) {
          setWidgets(cloudWidgets);
        }
      })
      .catch(() => {});


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
    clearCloudPinnedWidgets(selectedUserId);
    showToast('✓ Widgets retirados del Command Center');
  };


  // Remove Widget
  const handleRemoveWidget = (widgetId: string) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.id !== widgetId);
      savePinnedWidgets(selectedUserId, updated);
      return updated;
    });
    removeCloudPinnedWidget(selectedUserId, widgetId);
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

      case 'bar':
        newWidget = {
          id: `w-bar-${Date.now()}`,
          title: 'Gastos por Categoría (Barras)',
          component: 'BanorteChartCard',
          source: 'studio',
          chartType: 'bar',
          colorTheme: '#EB0029',
          pinnedAt: timestamp,
          payload: {
            component: 'BanorteChartCard',
            props: {
              id: `bar-${Date.now()}`,
              chartType: 'bar',
              title: 'Gastos por Categoría',
              subtitle: 'Septiembre 2026 · Distribución en MXN',
              height: 260,
              categoryKey: 'category',
              valueKey: 'amount',
              data: [
                { category: 'Supermercado', label: 'Supermercado', amount: 5200, value: 5200, color: '#EB0029' },
                { category: 'Servicios', label: 'Servicios', amount: 3100, value: 3100, color: '#004B87' },
                { category: 'Restaurantes', label: 'Restaurantes', amount: 2800, value: 2800, color: '#D97706' },
                { category: 'Transporte', label: 'Transporte', amount: 2250, value: 2250, color: '#8B5CF6' },
                { category: 'Farmacia', label: 'Farmacia', amount: 1500, value: 1500, color: '#10B981' },
              ],
            },
          },
        };
        break;

      case 'heatmap':
        newWidget = {
          id: `w-heatmap-${Date.now()}`,
          title: 'Frecuencia de Gastos Diarios (Heatmap)',
          component: 'BanorteChartCard',
          source: 'studio',
          chartType: 'calendarHeatmap',
          colorTheme: '#EB0029',
          pinnedAt: timestamp,
          payload: {
            component: 'BanorteChartCard',
            props: {
              id: `heatmap-${Date.now()}`,
              chartType: 'calendarHeatmap',
              title: 'Frecuencia de Gastos Diarios',
              subtitle: 'Septiembre 2026 · Intensidad de consumos',
              height: 250,
              dateKey: 'date',
              valueKey: 'value',
              data: [
                { date: '2026-09-01', value: 450, count: 2 },
                { date: '2026-09-02', value: 1200, count: 4 },
                { date: '2026-09-03', value: 320, count: 1 },
                { date: '2026-09-04', value: 2800, count: 5 },
                { date: '2026-09-05', value: 950, count: 3 },
                { date: '2026-09-06', value: 150, count: 1 },
                { date: '2026-09-07', value: 4100, count: 6 },
                { date: '2026-09-08', value: 800, count: 2 },
                { date: '2026-09-09', value: 1450, count: 3 },
                { date: '2026-09-10', value: 3100, count: 5 },
                { date: '2026-09-11', value: 620, count: 2 },
                { date: '2026-09-12', value: 1890, count: 4 },
                { date: '2026-09-13', value: 380, count: 1 },
                { date: '2026-09-14', value: 920, count: 2 },
                { date: '2026-09-15', value: 5400, count: 7 },
                { date: '2026-09-16', value: 1100, count: 3 },
                { date: '2026-09-17', value: 750, count: 2 },
                { date: '2026-09-18', value: 2400, count: 4 },
                { date: '2026-09-19', value: 1350, count: 3 },
                { date: '2026-09-20', value: 290, count: 1 },
                { date: '2026-09-21', value: 820, count: 2 },
                { date: '2026-09-22', value: 1640, count: 3 },
                { date: '2026-09-23', value: 410, count: 1 },
                { date: '2026-09-24', value: 1980, count: 4 },
                { date: '2026-09-25', value: 2200, count: 4 },
                { date: '2026-09-26', value: 680, count: 2 },
                { date: '2026-09-27', value: 310, count: 1 },
                { date: '2026-09-28', value: 3800, count: 5 },
              ],
            },
          },
        };
        break;

      case 'waterfall':
        newWidget = {
          id: `w-waterfall-${Date.now()}`,
          title: 'Conciliación Financiera (Waterfall)',
          component: 'BanorteChartCard',
          source: 'studio',
          chartType: 'waterfall',
          colorTheme: '#0A5CA8',
          pinnedAt: timestamp,
          payload: {
            component: 'BanorteChartCard',
            props: {
              id: `waterfall-${Date.now()}`,
              chartType: 'waterfall',
              title: 'Conciliación Financiera (Waterfall)',
              subtitle: 'Septiembre 2026 · Flujo neto de efectivo',
              height: 260,
              categoryKey: 'etapa',
              valueKey: 'monto',
              data: [
                { etapa: 'Ingresos Nómina', category: 'Ingresos Nómina', monto: 38500, amount: 38500 },
                { etapa: 'Renta', category: 'Renta', monto: -14200, amount: -14200 },
                { etapa: 'Supermercado', category: 'Supermercado', monto: -6200, amount: -6200 },
                { etapa: 'Servicios', category: 'Servicios', monto: -3100, amount: -3100 },
                { etapa: 'Inversión Ahorro', category: 'Inversión Ahorro', monto: -5000, amount: -5000 },
                { etapa: 'Saldo Neto', category: 'Saldo Neto', monto: 10000, amount: 10000 },
              ],
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
    broadcastWidgetToDashboard(selectedUserId, newWidget);
    setIsAddMenuOpen(false);
    showToast(`✓ Widget añadido: ${newWidget.title}`);
  };

  // Handle Action Triggered from inside Widgets or Maya Studio Dock
  const handleAction = async (actionCtx: ActionContext): Promise<boolean> => {
    setIsLoading(true);
    try {
      let actionLabel = `Acción: ${actionCtx.action}`;
      if (actionCtx.source_component === 'SpeiTransferFormCard' || actionCtx.action === 'prepare_spei') {
        const amt = Number(actionCtx.params?.amount || 850);
        const ben = actionCtx.params?.beneficiary_name || 'destinatario';
        actionLabel = `Revisar y autorizar transferencia SPEI de $${amt.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a ${ben}`;
      } else if (actionCtx.action.includes('spei')) {
        actionLabel = 'Autorizar transferencia SPEI con Token Móvil';
      } else if (actionCtx.action.includes('restructure')) {
        actionLabel = `Aceptar plan de ${actionCtx.params?.term_months || '24'} meses`.trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `usr-act-${Date.now()}`,
          role: 'user',
          content: actionLabel,
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: actionLabel,
          user_id: selectedUserId,
          action_context: actionCtx,
          surface: 'dashboard',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-act-${Date.now()}`,
            role: 'assistant',
            content: data.reply || 'Operación completada por Maya.',
            a2ui: data.a2ui,
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        if (data.a2ui) {
          const newWidgetItem: DashboardWidgetItem = {
            id: `dock-widget-${Date.now()}`,
            title: data.a2ui.props?.title || `${data.a2ui.component}`,
            component: data.a2ui.component,
            payload: data.a2ui,
            source: 'studio',
            pinnedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          };
          setWidgets((prev) => {
            const updated = [newWidgetItem, ...prev];
            savePinnedWidgets(selectedUserId, updated);
            return updated;
          });
          broadcastWidgetToDashboard(selectedUserId, newWidgetItem);
        }

        if (actionCtx.action === 'execute_spei') {
          const amt = Number(actionCtx.params?.amount || 850);
          const ben = actionCtx.params?.beneficiary || 'Sofía Mendoza';
          const newTx: TransactionItem = {
            id: `tx-spei-${Date.now()}`,
            date: 'Hoy',
            description: `SPEI a ${ben}`,
            account: 'Débito Enlace',
            amount: -amt,
            type: 'debit',
            status: 'Liquidado',
            category: 'Transferencias',
          };
          setTransactions((prev) => [newTx, ...prev]);
        }

        await refreshBankState(selectedUserId);
        showToast(`✓ Operación completada con éxito`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('handleAction failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Direct to SpeiConfirmCard: Immediately presents the confirmation card with Token Móvil button
  const handleQuick1ClickSpei = async (
    beneficiary = "SOFÍA MENDOZA RÍOS",
    bank = "BBVA México",
    clabe = "012 180 01594839201 9",
    amount = 850.0,
    concept = "Pago por servicios"
  ) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Revisar y preparar orden SPEI de $${amount} a ${beneficiary}`,
          user_id: selectedUserId,
          action_context: {
            action: 'prepare_spei',
            source_component: 'SpeiTransferFormCard',
            params: {
              beneficiary_name: beneficiary,
              recipient_bank: bank,
              clabe: clabe.replace(/\s/g, ''),
              amount: amount,
              concept: concept,
            },
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const confirmPayload: A2UIPayload = data.a2ui || {
          component: 'SpeiConfirmCard',
          props: {
            transferId: `prep-spei-${Date.now()}`,
            amount: amount,
            beneficiary: beneficiary,
            bank: bank,
            clabe: clabe,
            concept: concept,
          },
        };

        setMessages((prev) => [
          ...prev,
          {
            id: `usr-${Date.now()}`,
            role: 'user',
            content: `Preparar transferencia de $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN para ${beneficiary}`,
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `asst-${Date.now()}`,
            role: 'assistant',
            content: data.reply || `He preparado tu orden SPEI por **$${amount.toFixed(2)} MXN** a favor de **${beneficiary}**. Presiona **Autorizar con Token Móvil** para confirmar la transferencia.`,
            a2ui: confirmPayload,
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        const confirmWidget: DashboardWidgetItem = {
          id: `dock-widget-${Date.now()}`,
          title: `Confirmar SPEI · $${amount.toFixed(2)} MXN`,
          component: 'SpeiConfirmCard',
          payload: confirmPayload,
          source: 'studio',
          pinnedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        };

        setWidgets((prev) => {
          const updated = [confirmWidget, ...prev];
          savePinnedWidgets(selectedUserId, updated);
          return updated;
        });
        broadcastWidgetToDashboard(selectedUserId, confirmWidget);

        showToast(`✓ Tarjeta SPEI lista para autorizar con Token Móvil`);
      }
    } catch (err) {
      console.error('1-Click SpeiConfirmCard failed:', err);
      showToast('❌ Error al generar la confirmación SPEI');
    } finally {
      setIsLoading(false);
    }
  };

  // Global listener for interactive widgets dispatching banorte:ask-maya
  useEffect(() => {
    const handleAskMayaEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      const prompt = customEvent.detail?.prompt;
      if (prompt) {
        setIsDockCollapsed(false);
        handleSendMessage(prompt);
      }
    };
    window.addEventListener('banorte:ask-maya', handleAskMayaEvent);
    return () => window.removeEventListener('banorte:ask-maya', handleAskMayaEvent);
  }, [selectedUserId, isLoading]);

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
          surface: 'dashboard',
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
            broadcastWidgetToDashboard(selectedUserId, newWidgetItem);
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
        {/* Official Banorte Header (with User Switcher) */}
        <BanortePortalHeader
          clientName={clientName}
          minimal
          selectedUserId={selectedUserId}
          onSelectUser={(newId) => setSelectedUserId(newId)}
          onLogout={onLogout}
        />

        {/* Dashboard controls */}
        <div className="sticky top-[70px] z-30 w-full border-b border-[#E1EAF2] bg-white shadow-xs px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="mx-auto flex max-w-[1536px] flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-black tracking-[0.12em] text-[#061D3A]">DASHBOARD</h1>
              <p className="mt-0.5 text-[11px] font-medium text-[#6D85A1]">{widgets.length} widgets activos</p>
            </div>

            {/* Top Command Actions */}
            <div className="flex items-center gap-2">
              {/* 1-Click Fast SPEI Action Button */}
              <button
                type="button"
                onClick={() => handleQuick1ClickSpei("SOFÍA MENDOZA RÍOS", "BBVA México", "012 180 01594839201 9", 850.0, "Pago inmediato")}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-black shadow-xs transition cursor-pointer disabled:opacity-50"
                title="Enviar $850.00 MXN a Sofía Mendoza en 1 solo clic sin confirmaciones adicionales"
              >
                <Send className="h-3.5 w-3.5" />
                <span>⚡ Enviar $850 SPEI (1 Clic)</span>
              </button>

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
                        onClick={() => {
                          setIsAddMenuOpen(false);
                          handleQuick1ClickSpei("SOFÍA MENDOZA RÍOS", "BBVA México", "012 180 01594839201 9", 850.0, "Pago servicios");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 flex items-center gap-2 cursor-pointer border-b border-slate-100 mb-1"
                      >
                        <Send className="h-4 w-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-emerald-700">⚡ SPEI 1-Clic Instantáneo</div>
                          <div className="text-[10px] text-slate-400">Enviar $850 a Sofía en un toque</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('bar')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4 text-[#EB0029]" />
                        <div>
                          <div className="font-bold text-slate-800">Gastos por Categoría (Barras)</div>
                          <div className="text-[10px] text-slate-400">Comparativa mensual de gastos</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('heatmap')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Activity className="h-4 w-4 text-rose-500" />
                        <div>
                          <div className="font-bold text-slate-800">Frecuencia Diaria (Heatmap)</div>
                          <div className="text-[10px] text-slate-400">Mapa de calor últimos 30 días</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddWidgetFromCatalog('waterfall')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <TrendingUp className="h-4 w-4 text-blue-700" />
                        <div>
                          <div className="font-bold text-slate-800">Conciliación (Waterfall)</div>
                          <div className="text-[10px] text-slate-400">Ingresos vs Gastos vs Saldo Neto</div>
                        </div>
                      </button>
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
                <div className="banorte-card flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-[#CBD9E6] bg-white p-0 shadow-xs transition hover:-translate-y-0.5 hover:border-[#64748B]">
                  <div className="flex items-center justify-between bg-[#343B45] px-5 py-3 text-white">
                      <span className="text-[13px] font-bold">
                        {isSilvia
                          ? 'Cuenta Ahorro Patrimonial'
                          : isCarlos
                          ? 'Cuenta de Ahorro Banorte'
                          : 'Débito Enlace Nómina'}
                      </span>
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/90">
                        <Wallet className="h-4 w-4" />
                      </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
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
                  <div className="mx-5 mt-4 flex items-center justify-between border-t border-[#E6EDF4] pb-5 pt-4">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Transfiere $850 a Sofía Mendoza para la cena.')}
                      className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
                    >
                      <span>Transferir por SPEI</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuick1ClickSpei("SOFÍA MENDOZA RÍOS", "BBVA México", "012 180 01594839201 9", 850.0, "Cena")}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                      title="Enviar $850.00 MXN a Sofía en 1 Clic"
                    >
                      <Send className="h-3 w-3" />
                      <span>⚡ $850 a Sofía (1 Clic)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Línea de Crédito Banorte */}
                <div className="banorte-card flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-[#CBD9E6] bg-white p-0 shadow-xs transition hover:-translate-y-0.5 hover:border-[#64748B]">
                  <div className="flex items-center justify-between bg-[#343B45] px-5 py-3 text-white">
                      <span className="text-[13px] font-bold">
                        {bankAccounts.cardLast4
                          ? isCarlos
                            ? 'Tarjeta Banorte Clásica'
                            : 'Tarjeta Banorte Oro'
                          : 'Línea de Crédito Banorte'}
                      </span>
                      <div
                        className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/90"
                      >
                        <CreditCard className="h-4 w-4" />
                      </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
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
                  <div className="mx-5 mt-4 flex items-center justify-between border-t border-[#E6EDF4] pb-5 pt-4">
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
                <div className="banorte-card flex min-h-[230px] flex-col overflow-hidden rounded-2xl border border-[#CBD9E6] bg-white p-0 shadow-xs transition hover:-translate-y-0.5 hover:border-[#64748B]">
                  <div className="flex items-center justify-between bg-[#343B45] px-5 py-3 text-white">
                      <span className="text-[13px] font-bold">
                        {isSilvia ? 'Pagaré Altos Rendimientos' : 'Pagaré Banorte a Plazo'}
                      </span>
                      <img src={investmentTrend} alt="" className="h-8 w-8 object-contain opacity-90" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
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
                  <div className="mx-5 mt-4 flex items-center justify-between border-t border-[#E6EDF4] pb-5 pt-4">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Quiero simular una inversión a plazo fijo.')}
                      className="flex items-center gap-1 text-[13px] font-bold text-[#8A5B00] hover:underline cursor-pointer"
                    >
                      <span>Simular rendimientos</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <span className="rounded-lg bg-[#FFF5DC] px-3 py-1.5 text-xs font-semibold text-[#8A5B00]">
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
            {!isDockCollapsed && !isDockExpanded && (
              <div className="space-y-4">
                <div className="banorte-card rounded-2xl border border-[#CBD9E6] bg-white shadow-sm flex flex-col h-[760px] overflow-hidden">
                  {/* Dock Header */}
                  <div className="flex items-center justify-between border-b border-red-900/20 bg-[#EB0029] p-3.5 text-white">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white ring-2 ring-white/50">
                        <BanorteLogo variant="icon" className="h-5 w-5" alt="" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">Maya Copiloto</div>
                        <span className="text-[10px] text-red-100 font-medium">
                          Asistente de Composición
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsDockExpanded(true)}
                        className="rounded-lg p-1 text-white/80 transition hover:bg-white/15 hover:text-white cursor-pointer"
                        title="Expandir Maya a pantalla completa"
                        aria-label="Expandir Maya"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDockCollapsed(true)}
                        className="rounded-lg p-1 text-white/80 transition hover:bg-white/15 hover:text-white cursor-pointer"
                        title="Ocultar dock"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Prompts Bar */}
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleQuick1ClickSpei("SOFÍA MENDOZA RÍOS", "BBVA México", "012 180 01594839201 9", 850.0, "Cena")}
                      disabled={isLoading}
                      className="shrink-0 rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-emerald-800 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Enviar $850 a Sofía en 1 Clic"
                    >
                      <Send className="h-3 w-3" />
                      <span>⚡ SPEI 1-Clic</span>
                    </button>
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

      {isDockExpanded && (
        <div className="fixed inset-0 z-50 bg-[#F3F7FA] p-3 sm:p-5">
          <ChatStream
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onAction={handleAction}
            clientName={clientName}
            userId={selectedUserId}
            isExpanded
            onToggleExpand={() => setIsDockExpanded(false)}
            className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
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
      )}

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
