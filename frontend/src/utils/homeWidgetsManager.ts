import { A2UIPayload } from '../types/a2ui';

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

export const DEFAULT_HOME_WIDGETS: MobileWidgetItem[] = [
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

const cloneDefaultWidgets = (): MobileWidgetItem[] => DEFAULT_HOME_WIDGETS.map((widget) => ({ ...widget }));

const widgetIdentity = (widget: MobileWidgetItem): string => {
  if (widget.type === 'built_in') return `builtin:${widget.builtInKey || widget.id}`;
  const payload = widget.payload;
  return `a2ui:${payload?.component || widget.id}:${payload?.props?.chartType || payload?.props?.id || ''}`;
};

export function getHomeWidgetsStorageKey(uid: string): string {
  return `banorte_home_widgets_${uid || 'default'}`;
}

export function loadHomeWidgets(uid: string): MobileWidgetItem[] {
  try {
    const raw = localStorage.getItem(getHomeWidgetsStorageKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error loading home widgets:', err);
  }
  return DEFAULT_HOME_WIDGETS;
}

const HOME_WIDGETS_CHANNEL = 'banorte_home_widgets_channel';

export function notifyHomeWidgetsChanged(uid: string, widgets: MobileWidgetItem[]): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('banorte_home_widgets_updated', {
        detail: { userId: uid, widgets },
      })
    );
  }
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const ch = new BroadcastChannel(HOME_WIDGETS_CHANNEL);
      ch.postMessage({ userId: uid, widgets });
      ch.close();
    } catch {
      // ignore
    }
  }
}

export function saveHomeWidgets(uid: string, widgets: MobileWidgetItem[]): void {
  try {
    localStorage.setItem(getHomeWidgetsStorageKey(uid), JSON.stringify(widgets));
    notifyHomeWidgetsChanged(uid, widgets);
  } catch (err) {
    console.warn('Error saving home widgets:', err);
  }
}

export function subscribeToHomeWidgets(
  uid: string,
  callback: (widgets: MobileWidgetItem[]) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail || !detail.userId || detail.userId === uid) {
      callback(detail?.widgets || loadHomeWidgets(uid));
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === getHomeWidgetsStorageKey(uid) && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) callback(parsed);
      } catch {
        // ignore
      }
    }
  };

  window.addEventListener('banorte_home_widgets_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  let ch: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      ch = new BroadcastChannel(HOME_WIDGETS_CHANNEL);
      ch.onmessage = (event) => {
        if (!event.data?.userId || event.data.userId === uid) {
          if (Array.isArray(event.data.widgets)) {
            callback(event.data.widgets);
          }
        }
      };
    } catch {
      // ignore
    }
  }

  return () => {
    window.removeEventListener('banorte_home_widgets_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (ch) ch.close();
  };
}

export function createWidgetItem(widgetType: string): MobileWidgetItem | null {
  const norm = widgetType.toLowerCase().replace(/[\s_-]+/g, '');
  if (norm.includes('salud') || norm.includes('health') || norm.includes('score') || norm.includes('semaforo')) {
    return {
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
    };
  }
  if (norm.includes('sankey') || norm.includes('flujo') || norm.includes('cashflow') || norm.includes('flujodinero')) {
    return {
      id: `sankey-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Flujo de Dinero (Sankey)',
      subtitle: 'Entradas vs Gastos',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-sankey-chart',
          chartType: 'sankey',
          title: 'Flujo de Dinero Banorte',
          subtitle: 'Ingresos vs Gastos y Ahorro',
          height: 280,
          data: {
            nodes: [
              { id: 'Nomina', name: 'Nómina Banorte', color: '#004B87' },
              { id: 'Otros', name: 'Otros Ingresos', color: '#00A859' },
              { id: 'TotalIngresos', name: 'Ingresos Totales', color: '#1B365D' },
              { id: 'Super', name: 'Supermercado', color: '#EB0029' },
              { id: 'Renta', name: 'Renta / Servicios', color: '#D97706' },
              { id: 'Restaurantes', name: 'Restaurantes', color: '#8B5CF6' },
              { id: 'Ahorro', name: 'Ahorro / Pagaré', color: '#10B981' },
            ],
            links: [
              { source: 'Nomina', target: 'TotalIngresos', value: 38500 },
              { source: 'Otros', target: 'TotalIngresos', value: 6500 },
              { source: 'TotalIngresos', target: 'Super', value: 12400 },
              { source: 'TotalIngresos', target: 'Renta', value: 14200 },
              { source: 'TotalIngresos', target: 'Restaurantes', value: 5800 },
              { source: 'TotalIngresos', target: 'Ahorro', value: 12600 },
            ],
          },
        },
      },
    };
  }
  if (norm.includes('heatmap') || norm.includes('calendario') || norm.includes('frecuencia') || norm.includes('calendar')) {
    return {
      id: `heatmap-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Frecuencia de Gastos Diarios',
      subtitle: 'Mapa de calor mensual',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-heatmap-chart',
          chartType: 'calendarHeatmap',
          title: 'Frecuencia de Gastos Diarios',
          subtitle: 'Intensidad de compras últimos 30 días',
          height: 240,
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
          ],
        },
      },
    };
  }
  if (norm.includes('barra') || norm.includes('barchart') || norm.includes('barras')) {
    return {
      id: `bar-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Gastos por Categoría (Barras)',
      subtitle: 'Comparativa mensual',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-bar-chart',
          chartType: 'bar',
          title: 'Gastos por Categoría',
          subtitle: 'Distribución en MXN',
          height: 260,
          data: [
            { category: 'Supermercado', amount: 5200 },
            { category: 'Servicios', amount: 3100 },
            { category: 'Restaurantes', amount: 2800 },
            { category: 'Transporte', amount: 2250 },
            { category: 'Farmacia', amount: 1500 },
          ],
        },
      },
    };
  }
  if (norm.includes('linea') || norm.includes('tendencia') || norm.includes('linechart') || norm.includes('evolucion')) {
    return {
      id: `line-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Evolución de Saldo y Gastos',
      subtitle: 'Tendencia mensual',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-line-chart',
          chartType: 'line',
          title: 'Evolución de Saldo y Gastos',
          subtitle: 'Histórico quincenal',
          height: 260,
          data: [
            { period: '15 Ago', balance: 34500, spending: 12000 },
            { period: '30 Ago', balance: 39800, spending: 14500 },
            { period: '15 Sep', balance: 42100, spending: 11200 },
          ],
        },
      },
    };
  }
  if (norm.includes('treemap') || norm.includes('arbol')) {
    return {
      id: `treemap-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Mapa de Gastos Banorte',
      subtitle: 'Distribución proporcional',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-treemap-chart',
          chartType: 'treemap',
          title: 'Mapa de Gastos Banorte',
          subtitle: 'Distribución de egresos',
          height: 260,
          data: [
            { name: 'Vivienda y Renta', value: 14200, category: 'Fijos' },
            { name: 'Supermercado', value: 12400, category: 'Fijos' },
            { name: 'Restaurantes', value: 5800, category: 'Variables' },
            { name: 'Transporte', value: 3200, category: 'Variables' },
            { name: 'Suscripciones', value: 1200, category: 'Servicios' },
          ],
        },
      },
    };
  }
  if (norm.includes('waterfall') || norm.includes('cascada')) {
    return {
      id: `waterfall-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Conciliación Financiera (Waterfall)',
      subtitle: 'Ingresos vs Gastos vs Saldo Neto',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-waterfall-chart',
          chartType: 'waterfall',
          title: 'Flujo Neto Mensual',
          subtitle: 'Conciliación de entradas y salidas',
          height: 260,
          data: [
            { category: 'Ingresos Nómina', amount: 38500, type: 'income' },
            { category: 'Renta', amount: -14200, type: 'expense' },
            { category: 'Supermercado', amount: -6200, type: 'expense' },
            { category: 'Servicios', amount: -3100, type: 'expense' },
            { category: 'Inversión Ahorro', amount: -5000, type: 'investment' },
            { category: 'Saldo Neto', amount: 10000, type: 'total' },
          ],
        },
      },
    };
  }
  if (
    norm.includes('donut') ||
    norm.includes('dona') ||
    norm.includes('pie') ||
    norm.includes('pastel') ||
    norm.includes('spendingdonut')
  ) {
    return {
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
            { name: 'Supermercado & Despensa', label: 'Supermercado & Despensa', amount: 5200.0, percentage: 35, color: '#EB0029' },
            { name: 'Servicios & Telefonía', label: 'Servicios & Telefonía', amount: 3100.0, percentage: 21, color: '#004B87' },
            { name: 'Restaurantes & Cafeterías', label: 'Restaurantes & Cafeterías', amount: 2800.0, percentage: 19, color: '#00A859' },
            { name: 'Transporte & Gasolina', label: 'Transporte & Gasolina', amount: 2250.0, percentage: 15, color: '#F7931A' },
            { name: 'Farmacia & Salud', label: 'Farmacia & Salud', amount: 1500.0, percentage: 10, color: '#7E57C2' },
          ],
        },
      },
    };
  }
  if (norm.includes('pagare') || norm.includes('simulador') || norm.includes('inversioncalc') || norm.includes('investmentsimulator')) {
    return {
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
    };
  }
  if (norm.includes('reestructur') || norm.includes('deuda') || norm.includes('convenio') || norm.includes('debt')) {
    return {
      id: `debt-restructure-${Date.now()}`,
      type: 'a2ui',
      title: 'Plan de Reestructuración Banorte',
      subtitle: 'Tasa fija preferencial',
      category: 'Crédito',
      colSpan: 2,
      payload: {
        component: 'DebtRestructureCard',
        props: {
          totalDebt: 45200.0,
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
    };
  }
  if (norm.includes('spei') || norm.includes('transferencia') || norm.includes('transferform')) {
    return {
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
    };
  }
  if (norm.includes('semana') || norm.includes('weekly') || norm.includes('gastossemana')) {
    return {
      id: `weekly-spending-${Date.now()}`,
      type: 'built_in',
      builtInKey: 'weekly_spending',
      title: 'Gastos de la semana',
      subtitle: 'Tendencia de los últimos 7 días',
      category: 'Finanzas',
      colSpan: 2,
    };
  }
  if (norm.includes('renta') || norm.includes('pago') || norm.includes('rent')) {
    return {
      id: `rent-payment-${Date.now()}`,
      type: 'built_in',
      builtInKey: 'rent_payment',
      title: 'Pago recurrente',
      subtitle: 'Renta mensual',
      category: 'Pagos',
      colSpan: 1,
    };
  }
  if (norm.includes('inversion') || norm.includes('fondo') || norm.includes('investmentquick')) {
    return {
      id: `investment-quick-${Date.now()}`,
      type: 'built_in',
      builtInKey: 'investment_quick',
      title: 'Fondo de inversión',
      subtitle: 'Mi inversión al día',
      category: 'Inversión',
      colSpan: 1,
    };
  }

  // Generic chart fallback
  if (norm.includes('chart') || norm.includes('grafic') || norm.includes('banortechartcard')) {
    return {
      id: `sankey-chart-${Date.now()}`,
      type: 'a2ui',
      title: 'Flujo de Dinero (Sankey)',
      subtitle: 'Entradas vs Gastos',
      category: 'Finanzas',
      colSpan: 2,
      payload: {
        component: 'BanorteChartCard',
        props: {
          id: 'widget-sankey-chart',
          chartType: 'sankey',
          title: 'Flujo de Dinero Banorte',
          subtitle: 'Ingresos vs Gastos y Ahorro',
          height: 280,
          data: {
            nodes: [
              { id: 'Nomina', name: 'Nómina Banorte', color: '#004B87' },
              { id: 'Otros', name: 'Otros Ingresos', color: '#00A859' },
              { id: 'TotalIngresos', name: 'Ingresos Totales', color: '#1B365D' },
              { id: 'Super', name: 'Supermercado', color: '#EB0029' },
              { id: 'Renta', name: 'Renta / Servicios', color: '#D97706' },
              { id: 'Restaurantes', name: 'Restaurantes', color: '#8B5CF6' },
              { id: 'Ahorro', name: 'Ahorro / Pagaré', color: '#10B981' },
            ],
            links: [
              { source: 'Nomina', target: 'TotalIngresos', value: 38500 },
              { source: 'Otros', target: 'TotalIngresos', value: 6500 },
              { source: 'TotalIngresos', target: 'Super', value: 12400 },
              { source: 'TotalIngresos', target: 'Renta', value: 14200 },
              { source: 'TotalIngresos', target: 'Restaurantes', value: 5800 },
              { source: 'TotalIngresos', target: 'Ahorro', value: 12600 },
            ],
          },
        },
      },
    };
  }
  return null;
}

export function executeHomeWidgetsAction(
  userId: string,
  action: 'add' | 'remove' | 'reorder' | 'reset',
  params: {
    widgetId?: string;
    widgetType?: string;
    newOrder?: string[];
    payload?: A2UIPayload;
    title?: string;
    replace?: boolean;
    removeCurrentVisual?: boolean;
  }
): MobileWidgetItem[] {
  let current = loadHomeWidgets(userId);

  if (action === 'reset') {
    current = cloneDefaultWidgets();
    saveHomeWidgets(userId, current);
    return current;
  }

  if (action === 'remove') {
    if (params.removeCurrentVisual) {
      const visualIndex = current.findIndex(
        (widget) => widget.type === 'a2ui' || widget.builtInKey === 'weekly_spending'
      );
      if (visualIndex >= 0) current = current.filter((_, index) => index !== visualIndex);
      saveHomeWidgets(userId, current);
      return current;
    }
    const target = (params.widgetType || params.widgetId || '').toLowerCase().trim();
    current = current.filter((w) => {
      const idMatch = w.id.toLowerCase().includes(target);
      const keyMatch = (w.builtInKey || '').toLowerCase().includes(target);
      const titleMatch = w.title.toLowerCase().includes(target);
      const compMatch = (w.payload?.component || '').toLowerCase().includes(target);
      const chartTypeMatch = String(w.payload?.props?.chartType || '').toLowerCase().includes(target);
      return !(idMatch || keyMatch || titleMatch || compMatch || chartTypeMatch);
    });
    saveHomeWidgets(userId, current);
    return current;
  }

  if (action === 'add') {
    const target = params.widgetType || params.widgetId || '';
    let item: MobileWidgetItem | null = null;
    if (params.payload) {
      const chartType = params.payload.props?.chartType;
      const autoTitle = params.title || params.payload.props?.title || (
        chartType === 'sankey' ? 'Flujo de Dinero (Sankey)' :
        chartType === 'calendarHeatmap' ? 'Frecuencia de Gastos Diarios' :
        chartType === 'bar' ? 'Gastos por Categoría' :
        chartType === 'line' ? 'Evolución de Saldo y Gastos' :
        chartType === 'treemap' ? 'Mapa de Gastos Banorte' :
        chartType === 'waterfall' ? 'Conciliación Financiera (Waterfall)' :
        (params.payload.component === 'SpendingDonutCard' ? 'Desglose de Gastos' : params.payload.component)
      );

      item = {
        id: `widget-${Date.now()}`,
        type: 'a2ui',
        title: autoTitle,
        subtitle: 'Fijado por Maya',
        category: 'Finanzas',
        colSpan: 2,
        payload: params.payload,
      };
    } else {
      item = createWidgetItem(target);
    }

    if (item) {
      if (params.replace && params.payload) {
        // A replacement targets the current visual slot, not merely another
        // widget of the same component type. Prefer an existing A2UI visual;
        // otherwise replace the default spending visual on the mobile home.
        const visualIndex = current.findIndex(
          (widget) => widget.type === 'a2ui' || widget.builtInKey === 'weekly_spending'
        );
        if (visualIndex >= 0) {
          const replaced = current[visualIndex];
          current = [
            { ...item, id: replaced.id, subtitle: 'Actualizado por Maya' },
            ...current.filter((_, index) => index !== visualIndex),
          ];
          saveHomeWidgets(userId, current);
          return current;
        }
      }

      const alreadyIndex = current.findIndex(
        (widget) => widgetIdentity(widget) === widgetIdentity(item!)
      );
      if (alreadyIndex >= 0) {
        const found = current[alreadyIndex];
        const updated = params.payload
          ? { ...item, id: found.id, subtitle: 'Actualizado por Maya' }
          : found;
        current = [updated, ...current.filter((_, idx) => idx !== alreadyIndex)];
      } else {
        current = [item, ...current];
      }
      saveHomeWidgets(userId, current);
    }
    return current;
  }

  if (action === 'reorder') {
    const order = params.newOrder || [];
    if (order.length > 0) {
      const sorted: MobileWidgetItem[] = [];
      const remaining = [...current];

      for (const token of order) {
        const t = token.toLowerCase().trim();
        const foundIdx = remaining.findIndex((w) => {
          return (
            w.id.toLowerCase().includes(t) ||
            (w.builtInKey || '').toLowerCase().includes(t) ||
            w.title.toLowerCase().includes(t) ||
            (w.payload?.component || '').toLowerCase().includes(t) ||
            String(w.payload?.props?.chartType || '').toLowerCase().includes(t)
          );
        });
        if (foundIdx >= 0) {
          sorted.push(remaining[foundIdx]);
          remaining.splice(foundIdx, 1);
        }
      }
      current = [...sorted, ...remaining];
      saveHomeWidgets(userId, current);
    }
    return current;
  }

  return current;
}
