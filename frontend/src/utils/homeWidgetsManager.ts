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
  if (
    norm.includes('donut') ||
    norm.includes('dona') ||
    norm.includes('gasto') ||
    norm.includes('spending') ||
    norm.includes('pay') ||
    norm.includes('pie') ||
    norm.includes('pastel') ||
    norm.includes('grafic') ||
    norm.includes('grafica') ||
    norm.includes('grafico') ||
    norm.includes('chart') ||
    norm.includes('categoria') ||
    norm.includes('consumo')
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
            { label: 'Supermercado & Despensa', amount: 5200.0, percentage: 35, color: '#EB0029' },
            { label: 'Servicios & Telefonía', amount: 3100.0, percentage: 21, color: '#004B87' },
            { label: 'Restaurantes & Cafeterías', amount: 2800.0, percentage: 19, color: '#00A859' },
            { label: 'Transporte & Gasolina', amount: 2250.0, percentage: 15, color: '#F7931A' },
            { label: 'Farmacia & Salud', amount: 1500.0, percentage: 10, color: '#7E57C2' },
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
  }
): MobileWidgetItem[] {
  let current = loadHomeWidgets(userId);

  if (action === 'reset') {
    current = DEFAULT_HOME_WIDGETS;
    saveHomeWidgets(userId, current);
    return current;
  }

  if (action === 'remove') {
    const target = (params.widgetType || params.widgetId || '').toLowerCase().trim();
    current = current.filter((w) => {
      const idMatch = w.id.toLowerCase().includes(target);
      const keyMatch = (w.builtInKey || '').toLowerCase().includes(target);
      const titleMatch = w.title.toLowerCase().includes(target);
      const compMatch = (w.payload?.component || '').toLowerCase().includes(target);
      return !(idMatch || keyMatch || titleMatch || compMatch);
    });
    saveHomeWidgets(userId, current);
    return current;
  }

  if (action === 'add') {
    const target = params.widgetType || params.widgetId || '';
    let item: MobileWidgetItem | null = null;
    if (params.payload) {
      item = {
        id: `widget-${Date.now()}`,
        type: 'a2ui',
        title: params.title || params.payload.component,
        subtitle: 'Fijado por Maya',
        colSpan: 2,
        payload: params.payload,
      };
    } else {
      item = createWidgetItem(target);
    }

    if (item) {
      const alreadyIndex = current.findIndex(
        (w) =>
          (w.builtInKey && item?.builtInKey && w.builtInKey === item.builtInKey) ||
          (w.payload?.component && item?.payload?.component && w.payload.component === item.payload.component)
      );
      if (alreadyIndex >= 0) {
        const found = current[alreadyIndex];
        current = [found, ...current.filter((_, idx) => idx !== alreadyIndex)];
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
            (w.payload?.component || '').toLowerCase().includes(t)
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
