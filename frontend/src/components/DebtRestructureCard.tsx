import React, { useState } from 'react';
import { ShieldCheck, Calendar, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { RestructureOption, ActionContext } from '../types/a2ui';

interface DebtRestructureCardProps {
  totalDebt?: number;
  cardName?: string;
  cardLast4?: string;
  minimumPayment?: number;
  dueDate?: string;
  currentRate?: string;
  options?: RestructureOption[];
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
  disabled?: boolean;
}

const defaultOptions: RestructureOption[] = [
  { plan_id: 'plan_12m', months: 12, monthly_payment: 3450.0, annual_rate: '16.5%', total_savings: 8200 },
  { plan_id: 'plan_24m', months: 24, monthly_payment: 2480.0, annual_rate: '17.0%', total_savings: 14600, label: 'Recomendado por Maya' },
  { plan_id: 'plan_36m', months: 36, monthly_payment: 1810.0, annual_rate: '17.5%', total_savings: 18900 },
];

export const DebtRestructureCard: React.FC<DebtRestructureCardProps> = ({
  totalDebt = 28000.0,
  cardName = 'Tarjeta Banorte Mastercard',
  cardLast4 = '8812',
  minimumPayment = 2500.0,
  dueDate = '27 Sep 2026',
  currentRate = '64.8% CAT',
  options = defaultOptions,
  onAction,
  disabled = false,
}) => {
  const effectiveOptions = options.length > 0 ? options : defaultOptions;
  const initialPlan =
    effectiveOptions.find((o) => o.months === 24)?.plan_id ||
    effectiveOptions[1]?.plan_id ||
    effectiveOptions[0]?.plan_id;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlan);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedOption = effectiveOptions.find((opt) => opt.plan_id === selectedPlanId);

  const handleApply = async () => {
    if (!selectedOption || disabled || isSubmitting) return;
    setIsSubmitting(true);

    if (onAction) {
      const succeeded = await onAction({
        action: 'commit_restructure',
        params: {
          plan_id: selectedOption.plan_id,
          term_months: selectedOption.months,
          monthly_payment: selectedOption.monthly_payment,
          card_last4: cardLast4,
        },
        source_component: 'DebtRestructureCard',
      });
      if (!succeeded) setIsSubmitting(false);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      {/* Banorte Card Header */}
      <div className="bg-[#EB0029] p-4 sm:p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-red-100">
              Programa de Reestructuración Financiera
            </span>
            <h3 className="mt-0.5 text-base sm:text-lg font-extrabold tracking-tight">{cardName}</h3>
            <p className="font-mono text-xs text-red-100">•••• •••• •••• {cardLast4}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Elegible</span>
          </div>
        </div>

        {/* Debt summary strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-3">
          <div>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-red-100">
              Deuda total actual
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight tabular-nums">
              ${totalDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold">MXN</span>
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-medium uppercase tracking-wider text-red-100">
              Tasa ordinaria
            </span>
            <span className="text-base font-bold tabular-nums text-amber-300">
              {currentRate}
            </span>
            <span className="block text-[10px] text-red-100">Vence: {dueDate}</span>
          </div>
        </div>
      </div>

      {/* Plans selector: Zen stacked list, comfortable and never cramped */}
      <div className="space-y-3.5 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Calendar className="h-4 w-4 text-[#EB0029]" />
          <span>Selecciona tu nuevo esquema de pagos fijos:</span>
        </div>

        <div role="radiogroup" aria-label="Plazo de reestructuración" className="flex flex-col gap-2.5">
          {effectiveOptions.map((opt) => {
            const isSelected = opt.plan_id === selectedPlanId;
            const isRecommended = opt.months === 24 || opt.label?.toLowerCase().includes('recomenda');

            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled || isSubmitting}
                key={opt.plan_id}
                onClick={() => !disabled && setSelectedPlanId(opt.plan_id)}
                className={`group relative cursor-pointer rounded-xl p-3.5 text-left border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-[#EB0029] bg-red-50/50 shadow-xs ring-1 ring-[#EB0029]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Zen Custom Radio Bullet */}
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'border-[#EB0029] bg-[#EB0029]'
                          : 'border-slate-300 group-hover:border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {opt.months} Meses
                        </span>
                        {isRecommended && (
                          <span className="rounded-full bg-[#EB0029]/10 text-[#EB0029] px-2 py-0.2 text-[10px] font-bold">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Tasa fija anual: <strong className="text-emerald-700 font-semibold">{opt.annual_rate}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm sm:text-base font-black tabular-nums text-slate-900">
                      ${opt.monthly_payment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500">al mes</div>
                  </div>
                </div>

                {opt.total_savings > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Ahorro estimado en intereses:</span>
                    <span className="font-semibold text-emerald-600">
                      ~${opt.total_savings.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Benefits reminder */}
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="leading-relaxed text-[11px]">
            <strong className="font-bold text-emerald-900">Intereses congelados de inmediato:</strong> Al aplicar
            este plan, se suspenden cobros moratorios y se reporta cumplimiento positivo ante Buró de Crédito.
          </div>
        </div>

        {/* Action Button: Closes the loop */}
        <button
          onClick={handleApply}
          disabled={disabled || isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#EB0029] py-3.5 text-xs sm:text-sm font-bold tracking-wide text-white shadow-sm transition-all hover:bg-[#C70023] active:bg-[#9E001B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Aplicando reestructuración en FastMCP…</span>
            </>
          ) : (
            <>
              <span>Reestructurar Ahora ({selectedOption?.months} meses)</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400">
          Operación regulada por la CNBV y Banco de México. Sujeto a convenio digital Banorte.
        </p>
      </div>
    </div>
  );
};
