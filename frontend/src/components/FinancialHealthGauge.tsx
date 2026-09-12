import React from 'react';
import { Chart } from '../visuals/Chart';
import { ActionContext } from '../types/a2ui';

interface FinancialHealthGaugeProps {
  overallScore?: number;
  overall_score?: number;
  maxScore?: number;
  status?: string;
  statusColor?: string;
  status_color?: string;
  metrics?: {
    credit_utilization_pct?: number;
    available_liquidity?: number;
    current_debt?: number;
    savings_capacity_monthly?: number;
  };
  interest_trap_warning?: {
    is_at_risk?: boolean;
    minimum_payment?: number;
    months_to_liquidate_minimum?: number;
    projected_interest_minimum?: number;
    recommendation?: string;
  };
  radar_scores?: Array<{ dimension: string; score: number; benchmark: number }>;
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}

export const FinancialHealthGauge: React.FC<FinancialHealthGaugeProps> = (props) => {
  const score = props.overallScore ?? props.overall_score ?? 64;
  const status = props.status ?? (score < 70 ? 'MODERADO' : 'ÓPTIMO');
  const color = props.statusColor ?? props.status_color ?? (score < 70 ? '#F59E0B' : '#10B981');
  const utilization = props.metrics?.credit_utilization_pct ?? 48.1;

  return (
    <div className="my-3 space-y-3 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xl text-slate-900">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Diagnóstico de Salud Financiera 360°</h3>
            <p className="text-[11px] text-slate-500">Evaluación integral Banorte</p>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full font-mono uppercase tracking-wide border"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}40`
            }}
          >
            {status}
          </span>
        </div>

        <Chart
          id="health-gauge"
          chartType="gauge"
          gaugeMin={0}
          gaugeMax={100}
          gaugeValue={score}
          thresholds={[
            { from: 0, to: 50, status: 'bad', label: 'Riesgo' },
            { from: 50, to: 75, status: 'warning', label: 'Moderado' },
            { from: 75, to: 100, status: 'good', label: 'Excelente' }
          ]}
          valueFormat="number"
          height={180}
        />

        {/* Key Indicators Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Uso de Línea</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{utilization}%</div>
            <span className="text-[10px] text-amber-600 font-medium">Límite rec.: 30%</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Puntualidad</span>
            <div className="text-sm font-bold text-emerald-600 mt-0.5 font-mono">92 pts</div>
            <span className="text-[10px] text-slate-500 font-medium">Historial impecable</span>
          </div>
        </div>

        {/* Warning Banner */}
        {props.interest_trap_warning?.is_at_risk && (
          <div className="mt-3 bg-amber-50/90 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span>⚠️</span> Trampa del Pago Mínimo Detectada
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Si pagas solo el mínimo (${props.interest_trap_warning.minimum_payment?.toLocaleString()} MXN), tardarás{' '}
              <b>{props.interest_trap_warning.months_to_liquidate_minimum} meses</b> y pagarás más de{' '}
              <b>${props.interest_trap_warning.projected_interest_minimum?.toLocaleString()} MXN</b> en intereses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
