import React, { useState } from 'react';
import { Chart } from '../visuals/Chart';
import { ActionContext } from '../types/a2ui';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, Award } from 'lucide-react';

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
  const [showFactors, setShowFactors] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

  const score = props.overallScore ?? props.overall_score ?? props.score ?? props.gaugeValue ?? props.value ?? 64;
  const status = props.status ?? (score >= 80 ? 'ÓPTIMO' : score >= 60 ? 'MODERADO' : 'RIESGO');
  const badgeStyle = score >= 80
    ? { backgroundColor: '#10B981', color: '#FFFFFF', borderColor: '#059669' }
    : score >= 60
    ? { backgroundColor: '#C89319', color: '#3C2800', borderColor: '#E5B442' }
    : { backgroundColor: '#EB0029', color: '#FFFFFF', borderColor: '#B91C1C' };
  const utilization = props.metrics?.credit_utilization_pct ?? 48.1;
  const liquidity = props.metrics?.available_liquidity ?? 27900;
  const savings = props.metrics?.savings_capacity_monthly ?? 4200;

  const factors = [
    {
      id: 'utilization',
      name: 'Uso de Crédito',
      value: `${utilization}%`,
      status: utilization <= 30 ? 'Óptimo' : utilization <= 50 ? 'Moderado' : 'Elevado',
      statusColor: utilization <= 30 ? 'text-emerald-600' : utilization <= 50 ? 'text-amber-600' : 'text-red-600',
      tip: 'Mantén tu saldo bajo el 30% de tu límite para sumar hasta +25 pts a tu score.',
    },
    {
      id: 'punctuality',
      name: 'Puntualidad en Pagos',
      value: '98 pts',
      status: 'Excelente',
      statusColor: 'text-emerald-600',
      tip: '12 meses consecutivos con pagos antes de tu fecha límite.',
    },
    {
      id: 'liquidity',
      name: 'Respaldo de Liquidez',
      value: `$${liquidity.toLocaleString('es-MX')} MXN`,
      status: 'Favorable',
      statusColor: 'text-emerald-600',
      tip: 'Cuentas con más de 1.8 meses de gasto corriente protegido en cuentas a la vista.',
    },
    {
      id: 'savings',
      name: 'Capacidad de Ahorro',
      value: `$${savings.toLocaleString('es-MX')}/mes`,
      status: 'En meta',
      statusColor: 'text-emerald-600',
      tip: 'Equivale al 15% de tus ingresos netos mensuales.',
    },
  ];

  const handleAskMayaAdvice = () => {
    const prompt = `Maya, mi puntaje de salud financiera es ${score}/100 (${status}). ¿Cuáles son los 3 pasos más rápidos para subirlo a 80+ puntos este mes?`;
    try {
      window.dispatchEvent(
        new CustomEvent('banorte:ask-maya', {
          detail: { prompt, score, status },
        })
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-3 space-y-3 animate-in fade-in duration-300">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#EB0029] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">Diagnóstico de Salud Financiera 360°</h3>
              <p className="text-[11px] text-red-100">Evaluación algorítmica integral Banorte</p>
            </div>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full font-mono uppercase tracking-wide border shadow-2xs"
            style={badgeStyle}
          >
            {status}
          </span>
        </div>

        <div className="px-5 pt-3 pb-5">
          {/* Main Gauge Chart */}
          <Chart
            id="health-gauge"
            chartType="gauge"
            gaugeMin={0}
            gaugeMax={100}
            gaugeValue={score}
            thresholds={[
              { from: 0, to: 50, status: 'bad', label: 'Riesgo' },
              { from: 50, to: 75, status: 'warning', label: 'Moderado' },
              { from: 75, to: 100, status: 'good', label: 'Excelente' },
            ]}
            valueFormat="number"
            height={180}
          />

          {/* Interactive Key Indicators Grid */}
          <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3 text-xs">
            <div
              onClick={() => {
                setShowFactors(true);
                setSelectedFactor('utilization');
              }}
              className="bg-slate-50 hover:bg-red-50/40 p-2.5 rounded-xl border border-slate-200/70 hover:border-red-200 cursor-pointer transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Uso de Línea</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{utilization}%</div>
              <span className="text-[10px] text-amber-600 font-medium">Límite rec.: 30%</span>
            </div>

            <div
              onClick={() => {
                setShowFactors(true);
                setSelectedFactor('punctuality');
              }}
              className="bg-slate-50 hover:bg-emerald-50/40 p-2.5 rounded-xl border border-slate-200/70 hover:border-emerald-200 cursor-pointer transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Puntualidad</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5 font-mono">98 pts</div>
              <span className="text-[10px] text-slate-500 font-medium">Historial impecable</span>
            </div>
          </div>

          {/* Warning Banner if applicable */}
          {props.interest_trap_warning?.is_at_risk && (
            <div className="mt-3 bg-amber-50/90 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Trampa del Pago Mínimo Detectada</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Si pagas solo el mínimo (${props.interest_trap_warning.minimum_payment?.toLocaleString()} MXN), tardarás{' '}
                <b>{props.interest_trap_warning.months_to_liquidate_minimum} meses</b> y pagarás más de{' '}
                <b>${props.interest_trap_warning.projected_interest_minimum?.toLocaleString()} MXN</b> en intereses.
              </p>
            </div>
          )}

          {/* Collapsible Factor Breakdown Toggle */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowFactors(!showFactors)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-[#061D3A] py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#EB0029]" />
                Auditoría detallada de 4 factores de crédito
              </span>
              {showFactors ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showFactors && (
              <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {factors.map((f) => {
                  const isHighlighted = selectedFactor === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFactor(f.id)}
                      className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                        isHighlighted
                          ? 'border-[#EB0029] bg-red-50/30 shadow-2xs'
                          : 'border-slate-100 bg-slate-50/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{f.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900">{f.value}</span>
                          <span className={`text-[10px] font-semibold ${f.statusColor}`}>
                            {f.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{f.tip}</p>
                    </div>
                  );
                })}

                {/* Maya Advice Button */}
                <button
                  onClick={handleAskMayaAdvice}
                  className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-[#EB0029] border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pide a Maya un plan para elevar tu score</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthGauge;
