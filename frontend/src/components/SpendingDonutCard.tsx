import React from 'react';
import { Chart } from '../visuals/Chart';
import { ActionContext } from '../types/a2ui';

interface CategoryItem {
  name: string;
  amount: number;
  percentage: number;
  color?: string;
  icon?: string;
}

interface SpendingDonutCardProps {
  period?: string;
  totalSpent?: number;
  total_spent?: number;
  previousPeriodSpent?: number;
  previous_period_spent?: number;
  trend_pct?: number;
  categories?: CategoryItem[];
  top_merchants?: Array<{ merchant: string; amount: number; category: string }>;
  summary?: string;
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}

export const SpendingDonutCard: React.FC<SpendingDonutCardProps> = (props) => {
  const rawCats = Array.isArray(props.categories) && props.categories.length > 0 ? props.categories : [
    { name: 'Supermercado', amount: 5420, percentage: 36.5, color: '#EB0029' },
    { name: 'Restaurantes', amount: 3280, percentage: 22.1, color: '#FF5A70' },
    { name: 'Servicios', amount: 2650, percentage: 17.8, color: '#4A5568' },
    { name: 'Transporte', amount: 1950, percentage: 13.1, color: '#718096' },
    { name: 'Entretenimiento', amount: 1550, percentage: 10.5, color: '#CBD5E0' }
  ];

  const cats: CategoryItem[] = rawCats.map((c: any) => ({
    name: String(c?.name || c?.categoria || c?.category || 'Otros'),
    amount: Number(c?.amount ?? c?.monto ?? 0) || 0,
    percentage: Number(c?.percentage ?? c?.porcentaje ?? 0) || 0,
    color: c?.color || '#EB0029',
    icon: c?.icon
  }));

  const totalCalculated = cats.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const chartData = {
    gastos: cats.map(c => ({
      categoria: c.name,
      monto: c.amount,
      porcentaje: c.percentage
    }))
  };

  return (
    <div className="my-3 space-y-3 animate-in fade-in duration-300">
      <Chart
        id="spending-donut"
        chartType="donut"
        title={`Gastos por Categoría · ${props.period || 'Septiembre 2026'}`}
        subtitle={props.summary || "Distribución de tus consumos del periodo en tiempo real"}
        dataPath="/gastos"
        categoryKey="categoria"
        valueKey="monto"
        valueFormat="currency"
        currency="MXN"
        data={chartData}
        height={260}
      />

      {/* Banorte Unified Breakdown Table */}
      <div className="banorte-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#061D3A]">Desglose Detallado de Gastos</h3>
            <p className="text-xs text-[#6D85A1]">Consumos clasificados por categoría y porcentaje de presupuesto</p>
          </div>
          {props.trend_pct !== undefined && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              {props.trend_pct}% vs mes anterior
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1EAF2] bg-[#F6F9FC] text-xs font-bold uppercase tracking-wide text-[#617A96]">
                <th className="py-3 px-4">Categoría / Rubro</th>
                <th className="py-3 px-4 text-center">Distribución</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cats.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: c.color || '#EB0029' }}
                      />
                      <span className="font-bold text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] font-semibold text-slate-700">
                      {c.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black tabular-nums text-slate-900 text-xs">
                    ${(Number(c.amount) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-[10px] font-semibold text-slate-500">MXN</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E1EAF2] bg-[#F6F9FC]/80 font-bold text-xs">
                <td className="py-3 px-4 text-slate-700 uppercase tracking-wide">Total Periodo</td>
                <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">100%</td>
                <td className="py-3 px-4 text-right font-black tabular-nums text-[#061D3A]">
                  ${totalCalculated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-[10px] font-semibold text-slate-500">MXN</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
