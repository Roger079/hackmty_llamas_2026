import React from 'react';
import { A2UIPayload, ActionContext } from '../types/a2ui';
import { DebtRestructureCard } from './DebtRestructureCard';
import { ConfirmationReceipt } from './ConfirmationReceipt';
import { SpeiConfirmCard } from './SpeiConfirmCard';
import { SpeiReceiptCard } from './SpeiReceiptCard';
import { BanorteBalanceCard } from './BanorteBalanceCard';
import { InvestmentSimulatorCard } from './InvestmentSimulatorCard';
import { SpendingDonutCard } from './SpendingDonutCard';
import { AmortizationScheduleCard } from './AmortizationScheduleCard';
import { BanorteChartCard } from './BanorteChartCard';
import { Chart } from './Chart';
import { SpeiTransferFormCard } from './SpeiTransferFormCard';
import { FinancialHealthGauge } from './FinancialHealthGauge';
import { Timeline } from './Timeline';

interface DynamicA2UIRegistryProps {
  payload: A2UIPayload;
  onAction: (actionCtx: ActionContext) => Promise<boolean>;
  disabled?: boolean;
}

/**
 * Auto-discover and register ALL .tsx component files in this folder using Vite.
 */
const componentModules = import.meta.glob<{ [key: string]: any }>('./*.tsx', { eager: true });
const componentRegistry: Record<string, React.ComponentType<any>> = {
  DebtRestructureCard,
  ConfirmationReceipt,
  SpeiConfirmCard,
  SpeiReceiptCard,
  SpeiTransferFormCard,
  SpeiFormCard: SpeiTransferFormCard,
  SpeiTransferForm: SpeiTransferFormCard,
  FormularioSpeiCard: SpeiTransferFormCard,
  TransferenciaSpeiCard: SpeiTransferFormCard,
  BanorteBalanceCard,
  InvestmentSimulatorCard,
  InvestmentSimulator: InvestmentSimulatorCard,
  InvestmentCard: InvestmentSimulatorCard,
  PagareBanorteCard: InvestmentSimulatorCard,
  PagareBanorte: InvestmentSimulatorCard,
  PagareCard: InvestmentSimulatorCard,
  SimuladorInversionCard: InvestmentSimulatorCard,
  SimuladorInversion: InvestmentSimulatorCard,
  SimuladorPagareCard: InvestmentSimulatorCard,
  SimuladorPagare: InvestmentSimulatorCard,
  FinancialHealthGauge,
  FinancialHealthCard: FinancialHealthGauge,
  SaludFinancieraGauge: FinancialHealthGauge,
  SaludFinancieraCard: FinancialHealthGauge,
  DiagnosticoFinancieroCard: FinancialHealthGauge,
  SpendingDonutCard,
  AmortizationScheduleCard,
  BanorteChartCard,
  Chart,
  SankeyChart: BanorteChartCard,
  HeatmapChart: BanorteChartCard,
  CalendarHeatmap: BanorteChartCard,
  AmortizationCard: AmortizationScheduleCard,
  AmortizationSchedule: AmortizationScheduleCard,
  TablaAmortizacionCard: AmortizationScheduleCard,
  TablaAmortizacion: AmortizationScheduleCard,
  BarChartCard: BanorteChartCard,
  GraficaBarrasCard: BanorteChartCard,
  GraficaBarras: BanorteChartCard,
  GroupedBarChart: BanorteChartCard,
  StackedBarChart: BanorteChartCard,
  // Common LLM alias mappings
  AccountsSummaryCard: BanorteBalanceCard,
  BanorteAccountSummary: BanorteBalanceCard,
  AccountSummary: BanorteBalanceCard,
  ResumenCuentasCard: BanorteBalanceCard,
  ResumenCuentas: BanorteBalanceCard,
  SpendingBreakdownCard: SpendingDonutCard,
  DetailedBreakdownCard: SpendingDonutCard,
  DesgloseGastosCard: SpendingDonutCard,
  DesgloseDetalladoCard: SpendingDonutCard,
  DesgloseDetallado: SpendingDonutCard,
  ExpensesBreakdownCard: SpendingDonutCard,
  Timeline,
  TransactionTimeline: Timeline,
  SpeiTimeline: Timeline,
  TimelineCard: Timeline,
  RastreoTimeline: Timeline,
  LineaTiempo: Timeline,
};

// Register any other discovered components
for (const path in componentModules) {
  const mod = componentModules[path];
  const name = path.replace(/^\.\//, '').replace(/\.tsx$/, '');

  if (['DynamicA2UIRegistry', 'BanorteHeader', 'BanorteLogo', 'ChatStream', 'McpInspector', 'BanorteComponents'].includes(name)) {
    continue;
  }

  const Component = mod[name] || mod.default || Object.values(mod).find(v => typeof v === 'function');
  if (Component && typeof Component === 'function' && !componentRegistry[name]) {
    componentRegistry[name] = Component;
  }
}

/**
 * Defensive property normalizer ensuring components receive both camelCase,
 * snake_case, and accounts array data regardless of how Gemini formats the payload.
 */
function normalizeProps(component?: string, rawProps?: Record<string, any>): Record<string, any> {
  const p = { ...(rawProps || {}) };
  const comp = String(component || '');

  if (comp === 'BanorteBalanceCard' || comp.includes('Balance') || comp.includes('Account') || comp.includes('Cuentas')) {
    const accounts = Array.isArray(p.accounts) ? p.accounts : [];
    const firstAcc = accounts[0];
    const cardAcc = accounts.find((a: any) => a.type === 'oro' || a.current_debt > 0);
    const secAcc = accounts.length > 1 ? accounts[1] : null;

    p.clientName = p.clientName || p.client || p.client_name;
    p.primaryAccountName = p.primaryAccountName || p.primary_account_name || firstAcc?.name;
    p.primaryAccountLast4 = p.primaryAccountLast4 || p.primary_account_last4 || firstAcc?.last4 || firstAcc?.account_last4;
    p.primaryAccountBalance = p.primaryAccountBalance ?? p.primary_account_balance ?? p.nominaBalance ?? p.nomina_balance ?? firstAcc?.available_balance;
    p.nominaBalance = p.primaryAccountBalance;

    if (cardAcc && cardAcc.current_debt > 0) {
      p.secondaryType = 'card';
      p.cardName = p.cardName || p.card_name || cardAcc.name;
      p.cardLast4 = p.cardLast4 || p.card_last4 || cardAcc.number?.replace(/\*/g, '');
      p.totalDebt = p.totalDebt ?? p.total_debt ?? cardAcc.current_debt;
      p.oroBalance = p.oroBalance ?? p.oro_balance ?? cardAcc.available_credit;
    } else if (secAcc) {
      p.secondaryType = 'account';
      p.secondaryAccountName = p.secondaryAccountName || p.secondary_account_name || secAcc.name;
      p.secondaryAccountLast4 = p.secondaryAccountLast4 || p.secondary_account_last4 || secAcc.last4 || secAcc.account_last4;
      p.secondaryAccountBalance = p.secondaryAccountBalance ?? p.secondary_account_balance ?? secAcc.available_balance;
      p.totalDebt = 0;
    } else {
      p.totalDebt = p.totalDebt ?? p.total_debt ?? 0;
    }
  } else if (comp === 'SpendingDonutCard' || comp.includes('Spending') || comp.includes('Desglose') || comp.includes('Breakdown') || comp.includes('Gastos')) {
    if (!p.categories && Array.isArray(p.items)) {
      p.categories = p.items;
    }
  } else if (comp === 'DebtRestructureCard') {
    p.totalDebt = Number(p.totalDebt ?? p.total_debt ?? 28000.00);
    p.cardName = p.cardName ?? p.card_name ?? 'Tarjeta Banorte Mastercard';
    p.cardLast4 = p.cardLast4 ?? p.card_last4 ?? '8812';
    p.minimumPayment = Number(p.minimumPayment ?? p.minimum_payment ?? 2500.00);
    p.dueDate = p.dueDate ?? p.payment_due_date ?? p.due_date ?? '27 Sep 2026';
    p.currentRate = p.currentRate ?? p.interest_rate_annual ?? p.rate ?? '64.8% CAT';

    let rawOpts = p.options;
    if (rawOpts && typeof rawOpts === 'object' && !Array.isArray(rawOpts)) {
      rawOpts = Object.values(rawOpts);
    }
    if (!Array.isArray(rawOpts) || rawOpts.length === 0) {
      rawOpts = [
        { plan_id: 'plan_12m', months: 12, monthly_payment: 3450.0, annual_rate: '16.5%', total_savings: 8200 },
        { plan_id: 'plan_24m', months: 24, monthly_payment: 2480.0, annual_rate: '17.0%', total_savings: 14600, label: 'Recomendado por Maya' },
        { plan_id: 'plan_36m', months: 36, monthly_payment: 1810.0, annual_rate: '17.5%', total_savings: 18900 },
      ];
    }
    p.options = rawOpts.map((opt: any, index: number) => {
      const m = Number(opt.months ?? opt.term_months ?? opt.meses ?? (12 * (index + 1)));
      const mp = Number(opt.monthly_payment ?? opt.pago_mensual ?? Math.round(Number(p.totalDebt || 28000) / m * 1.15));
      return {
        plan_id: String(opt.plan_id ?? `plan_${m}m`),
        months: m,
        monthly_payment: mp,
        annual_rate: String(opt.annual_rate ?? opt.tasa ?? opt.rate ?? '16.5%'),
        total_savings: Number(opt.total_savings ?? opt.ahorro_total ?? 0),
        label: opt.label ? String(opt.label) : undefined,
      };
    });
  } else if (comp === 'Timeline' || comp.includes('Timeline') || comp.includes('Rastreo')) {
    p.title = p.title || p.titulo || 'Rastreo y Estatus de Movimiento';
    let rawSteps = p.steps || p.items || p.stages || p.movimientos || p.pasos;
    if (rawSteps && typeof rawSteps === 'object' && !Array.isArray(rawSteps)) {
      rawSteps = Object.values(rawSteps);
    }
    if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
      rawSteps = [
        { label: '1. Solicitud Autorizada', date: '11 Sep 2026 14:20:00', status: 'completed', description: 'Autorización exitosa con Token Digital Banorte Móvil.' },
        { label: '2. Validación de Fondos Banorte', date: '11 Sep 2026 14:20:02', status: 'completed', description: 'Fondos verificados y firma digital criptográfica SHA-256 generada.' },
        { label: '3. Transmisión a Red Banxico (SPEI)', date: '11 Sep 2026 14:20:05', status: 'completed', description: 'Mensaje procesado por Banco de México con clave de rastreo 202609118812BNTE.' },
        { label: '4. Liquidado en Banco Receptor', date: '11 Sep 2026 14:20:08', status: 'completed', description: 'Abono exitoso reflejado en la cuenta del destinatario con comprobante CEP.' },
      ];
    }
    p.steps = rawSteps.map((s: any, idx: number) => ({
      label: String(s.label ?? s.title ?? s.name ?? `Paso ${idx + 1}`),
      date: s.date ?? s.fecha ?? s.timestamp ?? '',
      status: s.status ?? s.estatus ?? 'completed',
      description: s.description ?? s.detalle ?? s.desc ?? '',
    }));
  } else if (comp === 'ConfirmationReceipt') {
    p.folio = p.folio || p.folio_convenio || 'FOL-BNTE-2026-R8812';
    p.status = p.status || 'APROBADO';
    p.monthlyPayment = p.monthlyPayment ?? p.monthly_payment ?? 1376.67;
    p.termMonths = p.termMonths ?? p.term_months ?? 24;
    p.nextPaymentDate = p.nextPaymentDate || p.next_payment_date || '15 Oct 2026';
    p.bankSeal = p.bankSeal || p.bank_seal || 'BANORTE-CRYPTO-SHA256-VALID';
    p.clientName = p.clientName || p.client_name || 'Carlos Ramírez';
  } else if (comp === 'SpeiConfirmCard') {
    p.transferId = p.transferId || p.transfer_id || 'prep-spei-101';
    p.beneficiary = p.beneficiary || p.beneficiary_name || 'SOFÍA MENDOZA RÍOS';
    p.bank = p.bank || p.recipient_bank || 'BBVA México';
    p.clabe = p.clabe || '012 180 01594839201 9';
  } else if (comp === 'SpeiReceiptCard') {
    p.trackingKey = p.trackingKey || p.tracking_key || 'BNTE202609118492019';
    p.date = p.date || p.execution_timestamp || '11 Sep 2026, 23:45 hrs';
  } else if (comp === 'FinancialHealthGauge' || comp.includes('Health') || comp.includes('Salud') || comp.includes('Diagnostico')) {
    const rawScore = p.overallScore ?? p.overall_score ?? p.score ?? p.gaugeValue ?? p.value;
    if (rawScore != null) {
      p.overallScore = Number(rawScore);
      p.overall_score = Number(rawScore);
      p.score = Number(rawScore);
      p.gaugeValue = Number(rawScore);
    }
  } else if (comp === 'InvestmentSimulatorCard' || comp.includes('Investment') || comp.includes('Pagare') || comp.includes('Inversion')) {
    p.initialAmount = p.initialAmount ?? p.initial_amount ?? p.amount ?? 25000;
    p.initialTermDays = p.initialTermDays ?? p.initial_term_days ?? p.term_days ?? p.term ?? 91;
    p.annualRate = p.annualRate ?? p.annual_rate ?? '11.25%';
    p.estimatedGain = p.estimatedGain ?? p.estimated_gain;
    p.totalMaturity = p.totalMaturity ?? p.total_maturity;
  } else if (
    ['StackedBarChart', 'BarChart', 'GroupedBarChart', 'LineChart', 'AreaChart', 'StackedAreaChart', 'BanorteChartCard', 'MultiLineChart', 'ProjectionChart', 'Chart', 'SankeyChart', 'HeatmapChart', 'CalendarHeatmap'].includes(comp) ||
    comp.toLowerCase().includes('chart')
  ) {
    if (p.chartType === 'sankey' || comp === 'SankeyChart') {
      p.chartType = 'sankey';
      let nodes = p.nodes || (p.data && typeof p.data === 'object' ? ((p.data as any).nodes || (p.data as any).data?.nodes) : undefined);
      let links = p.links || (p.data && typeof p.data === 'object' ? ((p.data as any).links || (p.data as any).data?.links) : undefined);

      if (!Array.isArray(nodes) || nodes.length === 0 || !Array.isArray(links) || links.length === 0) {
        const rawCats = p.categories || (p.data && typeof p.data === 'object' ? ((p.data as any).categories || (p.data as any).data) : undefined);
        if (Array.isArray(rawCats) && rawCats.length > 0) {
          const totalSpent = rawCats.reduce((s: number, c: any) => s + (Number(c.amount || c.value || 0)), 0);
          const fijosAmt = rawCats.filter((c: any) => /super|servicios|tarjeta|renta/i.test(c.name || '')).reduce((s: number, c: any) => s + (Number(c.amount || c.value || 0)), 0) || Math.round(totalSpent * 0.55);
          const varAmt = Math.max(totalSpent - fijosAmt, 0);
          const ahorroAmt = Math.round(Math.max(totalSpent * 0.18, 15500));

          nodes = [
            { id: 'nomina', label: 'Ingresos / Nómina Banorte', color: '#0A5CA8' },
            { id: 'fijos', label: 'Gastos Fijos', color: '#EB0029' },
            { id: 'variables', label: 'Gastos Variables', color: '#C89319' },
            { id: 'ahorro', label: 'Remanente / Ahorro', color: '#008A5A' },
            ...rawCats.map((c: any, i: number) => ({
              id: `cat_${i}`,
              label: c.name || `Categoría ${i + 1}`,
              color: c.color || '#EB0029'
            })),
            { id: 'inversion', label: 'Pagaré / Inversión Banorte', color: '#008A5A' }
          ];

          links = [
            { source: 'nomina', target: 'fijos', value: fijosAmt },
            { source: 'nomina', target: 'variables', value: varAmt },
            { source: 'nomina', target: 'ahorro', value: ahorroAmt },
            ...rawCats.map((c: any, i: number) => {
              const isFijo = /super|servicios|tarjeta|renta/i.test(c.name || '');
              return {
                source: isFijo ? 'fijos' : 'variables',
                target: `cat_${i}`,
                value: Number(c.amount || c.value || 1000)
              };
            }),
            { source: 'ahorro', target: 'inversion', value: ahorroAmt }
          ];
        } else {
          nodes = [
            { id: 'nomina', label: 'Ingresos / Nómina Banorte', color: '#0A5CA8' },
            { id: 'fijos', label: 'Gastos Fijos', color: '#EB0029' },
            { id: 'variables', label: 'Gastos Variables', color: '#C89319' },
            { id: 'ahorro', label: 'Remanente / Ahorro', color: '#008A5A' },
            { id: 'cat_0', label: 'Supermercado & Despensa', color: '#EB0029' },
            { id: 'cat_1', label: 'Compras & Tiendas', color: '#4A5568' },
            { id: 'cat_2', label: 'Servicios & Pagos', color: '#FF5A70' },
            { id: 'cat_3', label: 'Renta & Vivienda', color: '#718096' },
            { id: 'cat_4', label: 'Transporte & Movilidad', color: '#C89319' },
            { id: 'cat_5', label: 'Restaurantes & Cafés', color: '#008A5A' },
            { id: 'inversion', label: 'Pagaré Banorte (11.25%)', color: '#008A5A' },
          ];
          links = [
            { source: 'nomina', target: 'fijos', value: 43610.63 },
            { source: 'nomina', target: 'variables', value: 59964.38 },
            { source: 'nomina', target: 'ahorro', value: 15536.25 },
            { source: 'fijos', target: 'cat_0', value: 31965.14 },
            { source: 'fijos', target: 'cat_2', value: 11645.49 },
            { source: 'variables', target: 'cat_1', value: 28974.62 },
            { source: 'variables', target: 'cat_3', value: 15244.84 },
            { source: 'variables', target: 'cat_4', value: 12820.02 },
            { source: 'variables', target: 'cat_5', value: 2924.90 },
            { source: 'ahorro', target: 'inversion', value: 15536.25 },
          ];
        }
      }

      p.nodes = nodes;
      p.links = links;
      p.data = { ...(p.data || {}), nodes, links };
      return p;
    } else if (p.chartType === 'calendarHeatmap' || p.chartType === 'heatmap' || comp === 'CalendarHeatmap' || comp === 'HeatmapChart') {
      p.chartType = 'calendarHeatmap';
      const daily = p.daily_spending || p.days || (p.data && typeof p.data === 'object' ? ((p.data as any).daily_spending || (p.data as any).days || (p.data as any).data) : undefined);
      if (Array.isArray(daily) && daily.length > 0) {
        p.data = { data: daily };
        p.dataPath = '/data';
        p.dateKey = p.dateKey || 'date';
        p.valueKey = p.valueKey || 'value';
        return p;
      }
    }

    const chartPalette = ['#EB0029', '#0A5CA8', '#008A5A', '#C89319', '#617A96', '#9AAABD'];

    // CASE 1: ApexCharts / Highcharts format: categories: ["Abr", "May", ...], series: [{ name: "Ingresos", data: [...] }, ...]
    if (
      Array.isArray(p.categories) &&
      typeof p.categories[0] === 'string' &&
      Array.isArray(p.series) &&
      p.series.length > 0 &&
      Array.isArray(p.series[0]?.data)
    ) {
      const catNames: string[] = p.categories;
      const rows = catNames.map((catName, idx) => {
        const row: Record<string, any> = { name: catName, mes: catName, label: catName, x: catName };
        p.series.forEach((s: any) => {
          const metricKey = (s.name || 'valor').toLowerCase().replace(/\s+/g, '_');
          row[metricKey] = s.data?.[idx] ?? 0;
        });
        return row;
      });

      p.data = { data: rows };
      p.dataPath = '/data';
      p.categoryKey = 'name';
      if (p.series.length > 1) {
        p.chartType = p.chartType === 'line' ? 'line' : 'groupedBar';
      } else {
        p.chartType = p.chartType || 'bar';
      }
      p.series = p.series.map((s: any, idx: number) => ({
        name: s.name,
        dataPath: '/data',
        xKey: 'name',
        yKey: (s.name || 'valor').toLowerCase().replace(/\s+/g, '_'),
        color: s.color || chartPalette[idx % chartPalette.length],
      }));
      return p;
    }

    let rawList: any[] = [];
    if (Array.isArray(p.data)) {
      rawList = p.data;
    } else if (p.data && typeof p.data === 'object') {
      rawList = p.data.data || p.data.items || p.data.rows || p.data.list || p.data.months || p.data.categories || p.data.values || [];
    } else if (Array.isArray(p.items)) {
      rawList = p.items;
    } else if (Array.isArray(p.rows)) {
      rawList = p.rows;
    } else if (Array.isArray(p.categories)) {
      rawList = p.categories;
    } else if (Array.isArray(p.months)) {
      rawList = p.months;
    }

    if (rawList.length > 0) {
      p.data = { data: rawList };
      p.dataPath = '/data';

      const firstRow = rawList[0] || {};
      const keys = Object.keys(firstRow);

      if (!p.categoryKey) {
        const catKey = keys.find(k => typeof firstRow[k] === 'string' && !['color', 'status'].includes(k)) ||
                       keys.find(k => ['month', 'mes', 'label', 'category', 'categoria', 'name', 'fecha', 'periodo', 'concepto'].includes(k.toLowerCase())) ||
                       keys[0] || 'label';
        p.categoryKey = catKey;
      }

      const numericKeys = keys.filter(k => k !== p.categoryKey && (typeof firstRow[k] === 'number' || (!isNaN(Number(firstRow[k])) && firstRow[k] !== '')));

      if (!p.series || !p.series.length) {
        // If single bar chart of categorical spending, prefer 'amount' or 'monto' over percentage
        const preferredKey = numericKeys.find(k => ['amount', 'monto', 'total', 'saldo', 'value'].includes(k.toLowerCase())) || numericKeys[0];
        if (p.chartType === 'bar' && preferredKey) {
          p.valueKey = preferredKey;
          p.series = [{
            name: p.title || 'Monto',
            dataPath: '/data',
            xKey: p.categoryKey,
            yKey: preferredKey,
            color: '#EB0029'
          }];
        } else if (numericKeys.length > 1) {
          p.series = numericKeys.map((k, i) => {
            let labelName = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const lowKey = k.toLowerCase();
            if (lowKey === 'percentage' || lowKey === 'porcentaje') {
              labelName = 'Porcentaje (%)';
            } else if (lowKey === 'tasa_interes' || lowKey === 'tasa') {
              labelName = 'Tasa Interés (%)';
            } else if (lowKey === 'cat_promedio' || lowKey === 'cat') {
              labelName = 'CAT Promedio (%)';
            } else if (lowKey === 'tasa_pagare') {
              labelName = 'Rendimiento Pagaré (%)';
            } else if (lowKey === 'amount' || lowKey === 'monto') {
              labelName = 'Monto (MXN)';
            }
            return {
              name: labelName,
              dataPath: '/data',
              xKey: p.categoryKey,
              yKey: k,
              color: chartPalette[i % chartPalette.length],
            };
          });
        } else if (numericKeys.length === 1) {
          p.valueKey = numericKeys[0];
          p.series = [{
            name: p.title || 'Monto',
            dataPath: '/data',
            xKey: p.categoryKey,
            yKey: numericKeys[0],
            color: '#EB0029'
          }];
        }
      }

      if (Array.isArray(p.series)) {
        p.series = p.series.map((s: any) => ({
          ...s,
          xKey: s.xKey || p.categoryKey || 'mes'
        }));
      }
    }
  }

  return p;
}

/**
 * Sleek Light Banorte Card for any unmapped or brand-new components.
 */
const GenericBanorteCard: React.FC<{
  componentName: string;
  props: Record<string, any>;
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}> = ({ componentName, props, onAction, disabled }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-slate-900 space-y-4 my-3 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EB0029] flex items-center justify-center font-black text-sm text-white shadow-xs">B</div>
          <div>
            <h4 className="text-xs font-bold text-[#061D3A]">{componentName.replace(/([A-Z])/g, ' $1').trim()}</h4>
            <p className="text-[11px] text-slate-500">Componente Dinámico A2UI • Banorte</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
          Auto-Registrado
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {Object.entries(props).map(([key, val]) => {
          if (typeof val === 'object' || Array.isArray(val) || val === null || val === undefined) return null;
          return (
            <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="text-sm font-bold text-[#061D3A] mt-0.5">{String(val)}</div>
            </div>
          );
        })}
      </div>

      {props.action && (
        <button
          disabled={disabled}
          onClick={() =>
            onAction &&
            onAction({
              action: props.action,
              params: props,
              source_component: componentName,
            })
          }
          className="w-full py-3 bg-[#EB0029] hover:bg-[#C70023] text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
        >
          {props.actionLabel || `Confirmar ${componentName}`}
        </button>
      )}
    </div>
  );
};

export const DynamicA2UIRegistry: React.FC<DynamicA2UIRegistryProps> = ({
  payload,
  onAction,
  disabled = false,
}) => {
  if (!payload || typeof payload !== 'object') return null;
  const comp = payload.component || 'GenericBanorteCard';
  const rawProps = payload.props || {};
  const normalized = normalizeProps(comp, rawProps);
  const ComponentToRender = componentRegistry[comp];

  if (ComponentToRender) {
    return <ComponentToRender {...normalized} onAction={onAction} disabled={disabled} />;
  }

  return (
    <GenericBanorteCard
      componentName={comp}
      props={normalized}
      onAction={onAction}
      disabled={disabled}
    />
  );
};
