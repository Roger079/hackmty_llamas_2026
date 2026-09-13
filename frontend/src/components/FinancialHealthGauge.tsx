import React from 'react';
import { Chart } from '../visuals/Chart';
import { ActionContext } from '../types/a2ui';

interface FinancialHealthGaugeProps {
  score?: number;
  overallScore?: number;
  overall_score?: number;
  gaugeValue?: number;
  value?: number;
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
  const score = props.overallScore ?? props.overall_score ?? props.score ?? props.gaugeValue ?? props.value ?? 64;
  const status = props.status ?? (score >= 80 ? 'ÓPTIMO' : score >= 60 ? 'MODERADO' : 'RIESGO');
  const badgeStyle = score >= 80
    ? { backgroundColor: '#10B981', color: '#FFFFFF', borderColor: '#059669' }
    : score >= 60
    ? { backgroundColor: '#C89319', color: '#3C2800', borderColor: '#E5B442' }
    : { backgroundColor: '#EB0029', color: '#FFFFFF', borderColor: '#B91C1C' };
  const utilization = props.metrics?.credit_utilization_pct ?? 48.1;

  return (
    <div className="my-3 space-y-3 animate-in fade-in duration-300">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl">
        <div className="flex items-center justify-between bg-[#EB0029] px-5 py-4 text-white">
          <div>
            <h3 className="text-sm font-bold">Diagnóstico de Salud Financiera 360°</h3>
            <p className="text-[11px] text-red-100">Evaluación integral Banorte</p>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full font-mono uppercase tracking-wide border shadow-2xs"
            style={badgeStyle}
          >
            {status}
          </span>
        </div>

        <div className="px-5 pt-3">
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
        <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3 text-xs">
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
    </div>
  );
};
