import React, { useEffect, useMemo, useState } from 'react';
import { Landmark, TrendingUp, Calendar, ShieldCheck, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface InvestmentSimulatorCardProps {
  initialAmount?: number;
  initialTermDays?: number;
  annualRate?: string | number;
  estimatedGain?: number;
  totalMaturity?: number;
}

const TERM_OPTIONS = [
  { days: 28, label: '28 días', rate: 8.5 },
  { days: 60, label: '60 días', rate: 8.8 },
  { days: 91, label: '91 días', rate: 9.1 },
  { days: 182, label: '182 días', rate: 9.4 },
  { days: 360, label: '360 días', rate: 9.8 },
];

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000];

const money = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

export const InvestmentSimulatorCard: React.FC<InvestmentSimulatorCardProps> = ({
  initialAmount = 25000,
  initialTermDays = 91,
  annualRate = '9.1%',
  estimatedGain,
  totalMaturity,
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [selectedTerm, setSelectedTerm] = useState(initialTermDays);
  const [isContracting, setIsContracting] = useState(false);
  const [contractSuccess, setContractSuccess] = useState(false);

  useEffect(() => setAmount(initialAmount), [initialAmount]);
  useEffect(() => setSelectedTerm(initialTermDays), [initialTermDays]);

  const activeTermConfig = useMemo(() => {
    return TERM_OPTIONS.find((t) => t.days === selectedTerm) || {
      days: selectedTerm,
      label: `${selectedTerm} días`,
      rate: Number.parseFloat(String(annualRate)) || 9.1,
    };
  }, [selectedTerm, annualRate]);

  const rate = activeTermConfig.rate;

  const gain = useMemo(() => {
    if (amount === initialAmount && selectedTerm === initialTermDays && estimatedGain != null) {
      return estimatedGain;
    }
    return amount * (rate / 100) * (selectedTerm / 365);
  }, [amount, estimatedGain, initialAmount, initialTermDays, rate, selectedTerm]);

  const maturity = useMemo(() => {
    if (amount === initialAmount && selectedTerm === initialTermDays && totalMaturity != null) {
      return totalMaturity;
    }
    return amount + gain;
  }, [amount, gain, initialAmount, initialTermDays, totalMaturity, selectedTerm]);

  const handleContract = () => {
    setIsContracting(true);
    setTimeout(() => {
      setIsContracting(false);
      setContractSuccess(true);
      setTimeout(() => setContractSuccess(false), 3500);
    }, 700);
  };

  return (
    <section className="my-3 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-lg border border-slate-100 animate-in fade-in duration-300">
      <header className="flex items-center justify-between bg-[#EB0029] px-5 py-4 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight">Simulador Pagaré Banorte</h3>
            <p className="text-[10px] text-red-100">Rendimiento garantizado con tasa fija</p>
          </div>
        </div>
        <span className="rounded-full bg-[#C89319] px-2.5 py-1 text-[11px] font-bold text-[#3C2800] shadow-2xs">
          Tasa fija {rate.toFixed(1)}% anual
        </span>
      </header>

      <div className="space-y-4 p-5">
        {/* Plazo Selector Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#EB0029]" />
              Elige el plazo de inversión
            </label>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {selectedTerm} días seleccionados
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {TERM_OPTIONS.map((t) => {
              const isSelected = selectedTerm === t.days;
              return (
                <button
                  key={t.days}
                  onClick={() => setSelectedTerm(t.days)}
                  className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-[#EB0029] text-white shadow-md shadow-red-200 scale-102'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span className="text-[11px] leading-tight">{t.days} d</span>
                  <span className={`text-[9px] font-mono ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                    {t.rate}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monto Slider & Quick Presets */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="investment-amount" className="text-xs font-bold text-slate-700">
              Monto a invertir
            </label>
            <div className="flex gap-1">
              {PRESET_AMOUNTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                    amount === p
                      ? 'bg-[#061D3A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ${p >= 1000 ? `${p / 1000}k` : p}
                </button>
              ))}
            </div>
          </div>
          <input
            id="investment-amount"
            type="range"
            min="1000"
            max={Math.max(100000, initialAmount * 2)}
            step="1000"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="mt-3 w-full accent-[#EB0029] cursor-pointer"
          />
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl sm:text-3xl font-black tabular-nums text-[#061D3A]">
              {money(amount)}
            </p>
            <span className="text-xs text-slate-400 font-semibold">Saldo disponible: $27,900.00 MXN</span>
          </div>
        </div>

        {/* Dynamic Calculation Cards */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 border border-slate-200/60">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Ganancia estimada
            </p>
            <p className="mt-1 text-base sm:text-lg font-black text-emerald-600 tabular-nums">
              +{money(gain)}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {( (gain / amount) * 100 ).toFixed(2)}% retorno neto
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Recibes al vencimiento
            </p>
            <p className="mt-1 text-base sm:text-lg font-black text-[#061D3A] tabular-nums">
              {money(maturity)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              En {selectedTerm} días naturales
            </span>
          </div>
        </div>

        {/* Contract / Action Button */}
        {contractSuccess ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ¡Pagaré simulado activado con éxito! Folio #PAG-{Date.now().toString().slice(-6)}
          </div>
        ) : (
          <button
            onClick={handleContract}
            disabled={isContracting}
            className="w-full py-3 px-4 bg-[#EB0029] hover:bg-[#C70023] active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all duration-150"
          >
            {isContracting ? (
              <span className="animate-pulse">Validando términos con Banorte...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Simular Contratación Inmediata</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </>
            )}
          </button>
        )}

        <p className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <TrendingUp className="h-3.5 w-3.5 text-[#C89319] flex-shrink-0" />
          Simulación ilustrativa a {selectedTerm} días al {rate.toFixed(1)}% anual. Protegido por IPAB hasta 400 mil UDIS.
        </p>
      </div>
    </section>
  );
};

export default InvestmentSimulatorCard;
