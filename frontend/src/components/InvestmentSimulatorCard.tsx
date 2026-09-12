import React, { useMemo, useState } from 'react';
import { Landmark, TrendingUp } from 'lucide-react';

interface InvestmentSimulatorCardProps {
  initialAmount?: number;
  initialTermDays?: number;
  annualRate?: string | number;
  estimatedGain?: number;
  totalMaturity?: number;
}

const money = (value: number) => value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export const InvestmentSimulatorCard: React.FC<InvestmentSimulatorCardProps> = ({ initialAmount = 25000, initialTermDays = 91, annualRate = '9.1%', estimatedGain, totalMaturity }) => {
  const [amount, setAmount] = useState(initialAmount);
  const rate = Number.parseFloat(String(annualRate)) || 9.1;
  const gain = useMemo(() => amount === initialAmount && estimatedGain != null ? estimatedGain : amount * (rate / 100) * (initialTermDays / 365), [amount, estimatedGain, initialAmount, initialTermDays, rate]);
  const maturity = amount === initialAmount && totalMaturity != null ? totalMaturity : amount + gain;

  return (
    <section className="my-3 overflow-hidden rounded-2xl bg-white text-slate-900 shadow-[0_14px_38px_rgba(15,23,42,0.12)]">
      <header className="flex items-center justify-between bg-[#EB0029] px-5 py-4 text-white"><div className="flex items-center gap-2"><Landmark className="h-5 w-5" /><h3 className="text-sm font-bold">Pagaré Banorte</h3></div><span className="rounded-full bg-[#C89319] px-2.5 py-1 text-[11px] font-bold text-[#3C2800]">Tasa fija {annualRate}</span></header>
      <div className="space-y-5 p-5">
        <div><label htmlFor="investment-amount" className="text-xs font-bold text-slate-700">Monto a invertir</label><input id="investment-amount" type="range" min="5000" max="100000" step="5000" value={amount} onChange={(event) => setAmount(Number(event.target.value))} className="mt-3 w-full accent-[#EB0029]" /><p className="mt-2 text-2xl font-black tabular-nums">{money(amount)}</p></div>
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4"><div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Ganancia estimada</p><p className="mt-1 font-bold text-emerald-700 tabular-nums">+{money(gain)}</p></div><div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Recibes al vencimiento</p><p className="mt-1 font-bold tabular-nums">{money(maturity)}</p></div></div>
        <p className="flex items-center gap-2 text-xs text-slate-500"><TrendingUp className="h-4 w-4 text-[#C89319]" />Simulación ilustrativa a {initialTermDays} días. El rendimiento final está sujeto a contratación.</p>
      </div>
    </section>
  );
};
