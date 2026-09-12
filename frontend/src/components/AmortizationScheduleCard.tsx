import React, { useState } from 'react';
import { TrendingDown, ChevronRight } from 'lucide-react';
import { ActionContext } from '../types/a2ui';

export interface AmortizationScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remaining_balance?: number;
  remainingBalance?: number;
}

export interface AmortizationScheduleCardProps {
  initialDebt?: number;
  initial_debt?: number;
  termMonths?: number;
  term_months?: number;
  annualRatePct?: number;
  annual_rate_pct?: number;
  monthlyPayment?: number;
  monthly_payment?: number;
  totalPrincipal?: number;
  total_principal?: number;
  totalInterest?: number;
  total_interest?: number;
  totalCost?: number;
  total_cost?: number;
  schedulePreview?: AmortizationScheduleRow[];
  schedule_preview?: AmortizationScheduleRow[];
  monthsToPayoff?: number;
  months_to_payoff?: number;
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
  disabled?: boolean;
}

const fmt = (val?: number) =>
  (val ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export const AmortizationScheduleCard: React.FC<AmortizationScheduleCardProps> = (props) => {
  const [showAll, setShowAll] = useState(false);

  const initialDebt = props.initialDebt ?? props.initial_debt ?? 28000;
  const termMonths = props.termMonths ?? props.term_months ?? 24;
  const annualRate = props.annualRatePct ?? props.annual_rate_pct ?? 22.5;
  const monthlyPayment = props.monthlyPayment ?? props.monthly_payment ?? 1450.0;
  const totalInterest = props.totalInterest ?? props.total_interest ?? 6800.0;
  const totalPrincipal = props.totalPrincipal ?? props.total_principal ?? initialDebt;
  const rawSchedule = props.schedulePreview ?? props.schedule_preview ?? [];

  // If no schedule provided, compute a preview client-side
  const schedule: AmortizationScheduleRow[] = rawSchedule.length > 0 ? rawSchedule : Array.from({ length: Math.min(termMonths, 6) }, (_, idx) => {
    const m = idx + 1;
    const monthlyRate = (annualRate / 100) / 12;
    const approxInterest = (initialDebt * (1 - (idx / termMonths))) * monthlyRate;
    const approxPrincipal = monthlyPayment - approxInterest;
    const rem = Math.max(0, initialDebt - approxPrincipal * m);
    return {
      month: m,
      payment: monthlyPayment,
      principal: Math.round(approxPrincipal * 100) / 100,
      interest: Math.round(approxInterest * 100) / 100,
      remaining_balance: Math.round(rem * 100) / 100
    };
  });

  const displayedRows = showAll ? schedule : schedule.slice(0, 5);

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-[#EB0029] p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-100">
                Corrida Financiera Banorte
              </span>
              <h3 className="text-sm font-bold leading-snug">Tabla de Amortización Proyectada</h3>
            </div>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
            {termMonths} meses
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/70 p-3 text-xs">
        <div>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Monto Deuda</span>
          <span className="text-xs font-bold text-slate-900 font-mono">{fmt(initialDebt)}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Mensualidad Fija</span>
          <span className="text-xs font-bold text-emerald-700 font-mono">{fmt(monthlyPayment)}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Tasa Anual</span>
          <span className="text-xs font-bold text-slate-900 font-mono">{annualRate}% fija</span>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="p-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="py-1.5 px-2">Mes</th>
                <th className="py-1.5 px-2 text-right">Pago</th>
                <th className="py-1.5 px-2 text-right">Capital</th>
                <th className="py-1.5 px-2 text-right">Interés</th>
                <th className="py-1.5 px-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {displayedRows.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2 font-medium text-slate-700">Mes {row.month}</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">{fmt(row.payment)}</td>
                  <td className="py-2 px-2 text-right text-emerald-600">+{fmt(row.principal)}</td>
                  <td className="py-2 px-2 text-right text-amber-600">-{fmt(row.interest)}</td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {fmt(row.remaining_balance ?? row.remainingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedule.length > 5 && (
          <div className="mt-2 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] font-semibold text-[#EB0029] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              {showAll ? 'Mostrar menos' : `Ver todos los ${schedule.length} meses`}
              <ChevronRight className={`h-3 w-3 transition-transform ${showAll ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>
        )}

        {/* Total Cost Summary */}
        <div className="mt-3 rounded-xl bg-red-50/60 border border-red-100 p-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-[11px]">Total de intereses a liquidar:</span>
            <span className="font-bold font-mono text-red-700">{fmt(totalInterest)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-900 font-bold mt-1 pt-1 border-t border-red-200/50">
            <span className="text-[11px]">Costo total del plan:</span>
            <span className="font-mono text-slate-900">{fmt(totalPrincipal + totalInterest)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationScheduleCard;
