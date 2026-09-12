import React from 'react';
import { CreditCard, Wallet, ArrowUpRight } from 'lucide-react';
import { ActionContext } from '../types/a2ui';

interface BanorteBalanceCardProps {
  clientName?: string;
  nominaBalance: number;
  oroBalance: number;
  totalDebt?: number;
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
}

export const BanorteBalanceCard: React.FC<BanorteBalanceCardProps> = ({
  clientName = "Roberto Carlos Garza",
  nominaBalance = 48650.00,
  oroBalance = 41550.00,
  totalDebt = 38450.00,
  onAction,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-white space-y-4 my-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EB0029] flex items-center justify-center font-black text-sm">B</div>
          <div>
            <h4 className="text-xs font-bold text-white">Resumen de Cuentas Banorte</h4>
            <p className="text-[11px] text-slate-300">{clientName}</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
          En Línea • SPEI Activo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nomina Card */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 uppercase font-semibold">Débito Nómina (*1234)</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white tabular-nums mt-1">
            ${nominaBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs font-medium text-slate-400">MXN</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Disponible para transferir</span>
        </div>

        {/* Oro Card */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 uppercase font-semibold">Crédito Oro (*8842)</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-200 tabular-nums mt-1">
            ${oroBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs font-medium text-slate-400">MXN</span>
          </div>
          <span className="text-[11px] text-slate-300">Deuda actual: ${totalDebt.toLocaleString('es-MX')} MXN</span>
        </div>
      </div>

      <div className="flex gap-2.5 pt-1">
        <button
          onClick={() => onAction && onAction({ action: 'query_restructure', params: {}, source_component: 'BanorteBalanceCard' })}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#EB0029] py-3 text-center text-xs font-bold text-white transition hover:bg-[#C70023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
        >
          <span>Reestructurar Tarjeta</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onAction && onAction({ action: 'prepare_spei', params: { amount: 850 }, source_component: 'BanorteBalanceCard' })}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-xs font-bold text-slate-200 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
        >
          <span>Enviar SPEI</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
