import React, { useState } from 'react';
import { ShieldCheck, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RestructureOption, ActionContext } from '../types/a2ui';

interface DebtRestructureCardProps {
  totalDebt: number;
  cardName: string;
  cardLast4: string;
  minimumPayment: number;
  dueDate: string;
  currentRate: string;
  options: RestructureOption[];
  onAction?: (actionCtx: ActionContext) => void;
  disabled?: boolean;
}

export const DebtRestructureCard: React.FC<DebtRestructureCardProps> = ({
  totalDebt = 38450.00,
  cardName = "Tarjeta Banorte Oro",
  cardLast4 = "8842",
  minimumPayment = 3850.00,
  dueDate = "18 Sep 2026",
  currentRate = "64.8% CAT",
  options = [],
  onAction,
  disabled = false,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    options.length > 1 ? options[1].plan_id : (options[0]?.plan_id || 'plan_24m')
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedOption = options.find(opt => opt.plan_id === selectedPlanId);

  const handleApply = () => {
    if (!selectedOption || disabled || isSubmitting) return;
    setIsSubmitting(true);

    if (onAction) {
      onAction({
        action: 'commit_restructure',
        params: {
          plan_id: selectedOption.plan_id,
          term_months: selectedOption.months,
          monthly_payment: selectedOption.monthly_payment,
          card_last4: cardLast4
        },
        source_component: 'DebtRestructureCard'
      });
    }
  };

  return (
    <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-3">
      {/* Banorte Card Header */}
      <div className="bg-gradient-to-r from-[#EB0029] to-[#C70023] text-white p-5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-100 block">
              Programa de Apoyo y Reestructuración Banorte
            </span>
            <h3 className="text-lg font-extrabold tracking-tight mt-0.5">{cardName}</h3>
            <p className="text-xs font-mono text-red-100">•••• •••• •••• {cardLast4}</p>
          </div>
          <div className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/30">
            Elegible
          </div>
        </div>

        {/* Debt summary strip */}
        <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-red-100 uppercase tracking-wider block">Deuda total actual</span>
            <span className="text-2xl font-extrabold tracking-tight tabular-nums">
              ${totalDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-medium">MXN</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-red-100 uppercase tracking-wider block">Tasa actual ordinaria</span>
            <span className="text-base font-bold text-amber-300 tabular-nums">{currentRate}</span>
            <span className="block text-[10px] text-red-200">Vence: {dueDate}</span>
          </div>
        </div>
      </div>

      {/* Plans selector */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-[#EB0029]" />
          <span>Selecciona tu nuevo esquema de pagos fijos:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => {
            const isSelected = opt.plan_id === selectedPlanId;
            return (
              <div
                key={opt.plan_id}
                onClick={() => !disabled && setSelectedPlanId(opt.plan_id)}
                className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all relative ${
                  isSelected
                    ? 'border-[#EB0029] bg-red-50/60 shadow-md ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-[#EB0029]">
                    <CheckCircle2 className="w-4 h-4 fill-[#EB0029] text-white" />
                  </div>
                )}
                <div className="text-xs font-bold text-slate-800">{opt.months} Meses</div>
                <div className="text-xl font-black text-[#1C1E21] tabular-nums mt-1">
                  ${opt.monthly_payment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-500">mensuales fijos</div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tasa fija:</span>
                    <span className="font-bold text-emerald-600">{opt.annual_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ahorro:</span>
                    <span className="font-semibold text-slate-700">~${opt.total_savings.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits reminder */}
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-emerald-900 flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold">Intereses congelados de inmediato:</span> Al aplicar este plan,
            se suspenden cobros moratorios y mantienes un historial crediticio sano ante Buró de Crédito.
          </div>
        </div>

        {/* Action Button: Closes the loop */}
        <button
          onClick={handleApply}
          disabled={disabled || isSubmitting}
          className="w-full py-4 rounded-2xl bg-[#EB0029] hover:bg-[#C70023] active:bg-[#9E001B] text-white font-bold text-sm tracking-wide shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Aplicando reestructuración en base de datos...</span>
            </>
          ) : (
            <>
              <span>Aplicar plan a {selectedOption?.months} meses</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-400 text-center">
          Operación bancaria regulada por la CNBV y Banxico. Sujeto a términos y condiciones Banorte.
        </p>
      </div>
    </div>
  );
};
