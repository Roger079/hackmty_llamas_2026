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
import { DataTable } from './DataTable';
import { ComparisonTable } from './ComparisonTable';
import { KpiCard } from './KpiCard';
import { ProgressIndicator } from './ProgressIndicator';
import { Timeline } from './Timeline';
import { GeoMap } from './GeoMap';
import { FinancialHealthGauge } from './FinancialHealthGauge';
import { BarChart } from './BarChart';
import { BarHorizontalChart } from './BarHorizontalChart';
import { GroupedBarChart } from './GroupedBarChart';
import { StackedBarChart } from './StackedBarChart';
import { LineChart } from './LineChart';
import { MultiLineChart } from './MultiLineChart';
import { AreaChart } from './AreaChart';
import { StackedAreaChart } from './StackedAreaChart';
import { ProjectionChart } from './ProjectionChart';

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
  SpendingDonutCard,
  AmortizationScheduleCard,
  BanorteChartCard,
  Chart,
  DataTable,
  ComparisonTable,
  KpiCard,
  ProgressIndicator,
  Timeline,
  GeoMap,
  FinancialHealthGauge,
  BarChart,
  BarHorizontalChart,
  GroupedBarChart,
  StackedBarChart,
  LineChart,
  MultiLineChart,
  AreaChart,
  StackedAreaChart,
  ProjectionChart,
  SankeyChart: BanorteChartCard,
  HeatmapChart: BanorteChartCard,
  CalendarHeatmap: BanorteChartCard,
  AmortizationCard: AmortizationScheduleCard,
  AmortizationSchedule: AmortizationScheduleCard,
  TablaAmortizacionCard: AmortizationScheduleCard,
  TablaAmortizacion: AmortizationScheduleCard,
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
    p.totalDebt = p.totalDebt ?? p.total_debt ?? 28000.00;
    p.cardName = p.cardName ?? p.card_name ?? 'Tarjeta Banorte Mastercard';
    p.cardLast4 = p.cardLast4 ?? p.card_last4 ?? '8812';
    p.minimumPayment = p.minimumPayment ?? p.minimum_payment ?? 2500.00;
    p.dueDate = p.dueDate ?? p.payment_due_date ?? p.due_date ?? '27 Sep 2026';
    p.currentRate = p.currentRate ?? p.interest_rate_annual ?? p.rate ?? '64.8% CAT';
    p.options = (p.options || []).map((opt: any, index: number) => ({
      plan_id: opt.plan_id ?? `plan_${opt.months ?? opt.term_months ?? index}`,
      months: opt.months ?? opt.term_months,
      monthly_payment: opt.monthly_payment,
      annual_rate: opt.annual_rate ?? opt.rate,
      total_savings: opt.total_savings ?? 0,
      label: opt.label,
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
  } else if (comp === 'InvestmentSimulatorCard') {
    p.initialAmount = p.initialAmount ?? p.initial_amount ?? 25000;
    p.initialTermDays = p.initialTermDays ?? p.initial_term_days ?? 91;
    p.annualRate = p.annualRate ?? p.annual_rate ?? '9.1%';
    p.estimatedGain = p.estimatedGain ?? p.estimated_gain;
    p.totalMaturity = p.totalMaturity ?? p.total_maturity;
  } else if (
    ['StackedBarChart', 'BarChart', 'GroupedBarChart', 'LineChart', 'AreaChart', 'StackedAreaChart', 'BanorteChartCard', 'MultiLineChart', 'ProjectionChart', 'Chart', 'SankeyChart', 'HeatmapChart', 'CalendarHeatmap'].includes(comp) ||
    comp.toLowerCase().includes('chart')
  ) {
    if (p.chartType === 'sankey' || comp === 'SankeyChart') {
      p.chartType = 'sankey';
      const nodes = p.nodes || (p.data && typeof p.data === 'object' ? (p.data as any).nodes : undefined);
      const links = p.links || (p.data && typeof p.data === 'object' ? (p.data as any).links : undefined);
      if (nodes || links) {
        p.data = { ...(p.data || {}), nodes: nodes || [], links: links || [] };
        return p;
      }
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
      const chartPalette = ['#E4003B', '#0A5CA8', '#008A5A', '#C89319', '#617A96', '#9AAABD'];

      if (!p.series || !p.series.length) {
        if (numericKeys.length > 1) {
          p.series = numericKeys.map((k, i) => ({
            name: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            dataPath: '/data',
            xKey: p.categoryKey,
            yKey: k,
            color: chartPalette[i % chartPalette.length],
          }));
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
