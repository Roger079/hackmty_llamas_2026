import React from 'react';
import { CreditCard, Wallet, ArrowUpRight, Landmark, TrendingUp } from 'lucide-react';
import { ActionContext } from '../types/a2ui';

export interface BanorteBalanceCardProps {
  clientName?: string;
  nominaBalance?: number;
  oroBalance?: number;
  totalDebt?: number;
  primaryAccountName?: string;
  primaryAccountLast4?: string;
  primaryAccountBalance?: number;
  secondaryType?: 'card' | 'account' | 'investment';
  secondaryAccountName?: string;
  secondaryAccountLast4?: string;
  secondaryAccountBalance?: number;
  cardName?: string;
  cardLast4?: string;
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
}

export const BanorteBalanceCard: React.FC<BanorteBalanceCardProps> = ({
  clientName = "Cliente Banorte",
  nominaBalance,
  oroBalance,
  totalDebt,
  primaryAccountName,
  primaryAccountLast4,
  primaryAccountBalance,
  secondaryType,
  secondaryAccountName,
  secondaryAccountLast4,
  secondaryAccountBalance,
  cardName,
  cardLast4,
  onAction,
}) => {
  // Infer customer context if specific props are omitted
  const isSilvia = clientName.includes('Silvia');
  const isCarlos = clientName.includes('Carlos');

  // 1. Primary Account Values
  const effectivePrimaryName = primaryAccountName || (isSilvia ? 'Cuenta Ahorro' : isCarlos ? 'Cuenta de Ahorro' : 'Débito Nómina');
  const effectivePrimaryLast4 = primaryAccountLast4 || (isSilvia ? '8359' : isCarlos ? '7721' : '4582');
  const effectivePrimaryBal = primaryAccountBalance ?? nominaBalance ?? (isSilvia ? 116614.10 : isCarlos ? 52700.00 : 27900.00);

  // 2. Debt / Credit Card Determination
  const effectiveDebt = totalDebt ?? (isCarlos ? 28000.00 : 0.00);
  const hasCardDebt = effectiveDebt > 0;
  const effectiveCardName = cardName || (isCarlos ? 'Tarjeta Banorte Mastercard' : 'Tarjeta Banorte');
  const effectiveCardLast4 = cardLast4 || (isCarlos ? '8812' : '');

  // 3. Secondary Account Values (e.g. Silvia's second account A004 Cheques)
  const hasSecondAccount = Boolean(secondaryAccountName || isSilvia);
  const effectiveSecName = secondaryAccountName || (isSilvia ? 'Cuenta Cheques' : 'Segunda Cuenta');
  const effectiveSecLast4 = secondaryAccountLast4 || (isSilvia ? '6574' : '0000');
  const effectiveSecBal = secondaryAccountBalance ?? (isSilvia ? 32689.41 : 0.00);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs text-slate-900 space-y-4 my-3">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EB0029] flex items-center justify-center font-black text-sm text-white shadow-xs">B</div>
          <div>
            <h4 className="text-xs font-bold text-[#061D3A]">Resumen de Cuentas Banorte</h4>
            <p className="text-[11px] text-slate-500">{clientName}</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
          En Línea • SPEI Activo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Box 1: Primary Account */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 uppercase font-semibold">
              {effectivePrimaryName} (*{effectivePrimaryLast4})
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#061D3A] tabular-nums mt-1">
            ${effectivePrimaryBal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs font-medium text-slate-500">MXN</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Disponible para transferir</span>
        </div>

        {/* Box 2: Conditional on customer products */}
        {hasCardDebt ? (
          // A) Credit Card with active debt (e.g. Carlos)
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-700 uppercase font-semibold">
                {effectiveCardName} (*{effectiveCardLast4})
              </span>
              <div className="h-7 w-7 rounded-lg bg-red-50 text-[#EB0029] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#061D3A] tabular-nums mt-1">
              ${(oroBalance ?? 72000.00).toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-medium text-slate-500">MXN</span>
            </div>
            <span className="text-[11px] text-[#EB0029] font-semibold">
              Deuda actual: ${effectiveDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        ) : hasSecondAccount ? (
          // B) Second deposit account (e.g. Silvia with Cheques)
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600 uppercase font-semibold">
                {effectiveSecName} (*{effectiveSecLast4})
              </span>
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#061D3A] tabular-nums mt-1">
              ${effectiveSecBal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-medium text-slate-500">MXN</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Saldo en cheques disponible</span>
          </div>
        ) : (
          // C) Investment option for debt-free single account client (e.g. Ana)
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-700 uppercase font-semibold">
                Pagaré Banorte Plazo Fijo
              </span>
              <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#061D3A] tabular-nums mt-1">
              9.10% <span className="text-xs font-medium text-slate-500">Rendimiento Anual</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Sin adeudos de crédito • Ahorro seguro</span>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 pt-1">
        {hasCardDebt ? (
          <button
            onClick={() => onAction && onAction({ action: 'query_restructure', params: {}, source_component: 'BanorteBalanceCard' })}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#EB0029] py-3 text-center text-xs font-bold text-white transition hover:bg-[#C70023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] cursor-pointer shadow-xs"
          >
            <span>Reestructurar Tarjeta</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onAction && onAction({ action: 'simulate_investment', params: { amount: effectivePrimaryBal > 50000 ? 50000 : 15000 }, source_component: 'BanorteBalanceCard' })}
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-center text-xs font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simular Inversión</span>
          </button>
        )}
        <button
          onClick={() => onAction && onAction({ action: 'prepare_spei', params: { amount: 850 }, source_component: 'BanorteBalanceCard' })}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 cursor-pointer"
        >
          <span>Enviar SPEI</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
