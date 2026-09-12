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
  const cats: CategoryItem[] = props.categories && props.categories.length > 0 ? props.categories : [
    { name: 'Supermercado', amount: 5420, percentage: 36.5, color: '#EB0029' },
    { name: 'Restaurantes', amount: 3280, percentage: 22.1, color: '#FF5A70' },
    { name: 'Servicios', amount: 2650, percentage: 17.8, color: '#4A5568' },
    { name: 'Transporte', amount: 1950, percentage: 13.1, color: '#718096' },
    { name: 'Entretenimiento', amount: 1550, percentage: 10.5, color: '#CBD5E0' }
  ];

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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Desglose Detallado</span>
          {props.trend_pct !== undefined && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
              {props.trend_pct}% vs mes anterior
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          {cats.map((c, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || '#EB0029' }} />
                <span className="text-slate-200 font-medium">{c.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-400 text-[11px]">{c.percentage}%</span>
                <span className="text-white font-bold">${c.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
