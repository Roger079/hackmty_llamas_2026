import React from 'react';
import { Wallet, CreditCard, ArrowUpRight, Download, Filter, Sparkles } from 'lucide-react';
import heroImage from '../assets/12ui/banorte-hero.png';
import investmentTrend from '../assets/12ui/investment-trend.png';
import restructureShield from '../assets/12ui/restructure-shield.png';

export interface TransactionItem {
  id: string;
  description: string;
  date: string;
  account: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
  category: string;
}

interface AccountData {
  nominaBalance?: number;
  oroBalance?: number;
  totalDebt?: number;
  accountLast4?: string;
  cardLast4?: string;
}

interface BanorteGlobalPositionProps {
  clientName?: string;
  accounts?: AccountData;
  transactions?: TransactionItem[];
  onTriggerMayaPrompt: (prompt: string) => void;
  hasActiveRestructure?: boolean;
}

export const BanorteGlobalPosition: React.FC<BanorteGlobalPositionProps> = ({
  clientName = 'Ana Martínez',
  accounts,
  transactions = [],
  onTriggerMayaPrompt,
  hasActiveRestructure = false,
}) => {
  const nominaBalance = accounts?.nominaBalance ?? 27900.00;
  const cardDebt = accounts?.totalDebt ?? 0.00;
  const accountLast4 = accounts?.accountLast4 || (clientName.includes('Carlos') ? '7721' : clientName.includes('Silvia') ? '8359' : '4582');
  const cardLast4 = accounts?.cardLast4 || (clientName.includes('Carlos') ? '8812' : '');

  return (
    <div className="space-y-5">
      {/* Welcome & Banking Overview Banner */}
      <div
        className="banorte-hero relative z-0 flex min-h-[162px] flex-col justify-center gap-5 bg-cover bg-center p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="relative z-10 max-w-[54%]">
          <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#5D7694]">
            Resumen Integral de Posición Global
          </span>
          <h2 className="mt-2 text-[27px] font-bold leading-none tracking-tight text-[#061D3A]">
            Hola, {clientName.split(' ')[0]}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-[#6D85A1]">
            Último acceso a Banca en Línea: Hoy, 09:14 hrs desde Torreón, Coah.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 sm:mr-16 sm:self-center">
          <button
            type="button"
            onClick={() => onTriggerMayaPrompt('¿Cuánto saldo disponible tengo en mis cuentas?')}
            className="inline-flex min-h-14 min-w-[145px] items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-center text-[13px] font-bold text-[#203956] shadow-[0_4px_12px_rgba(39,67,95,0.10)] backdrop-blur-sm transition hover:bg-white cursor-pointer"
          >
            <span>Consultar saldos</span>
          </button>
          <button
            type="button"
            onClick={() => onTriggerMayaPrompt('¿Cómo reestructurar mi tarjeta Platino?')}
            className="inline-flex min-h-14 min-w-[190px] items-center justify-center gap-1.5 rounded-2xl bg-[#E4003B] px-5 py-3 text-center text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(180,0,45,0.24)] transition hover:bg-[#C70032] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Reestructurar con Maya</span>
          </button>
        </div>
      </div>

      {/* Account KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 1. Debit / Nomina Card */}
        <div className="banorte-card flex min-h-[242px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#CBD9E6]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#203956]">
                {clientName.includes('Silvia')
                  ? 'Cuenta Ahorro Patrimonial'
                  : clientName.includes('Carlos')
                  ? 'Cuenta de Ahorro Banorte'
                  : 'Débito Enlace Nómina'}
              </span>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 font-bold text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-[13px] text-[#6D85A1]">Cuenta: &nbsp;••••&nbsp; {accountLast4}</p>
            <div className="mt-3">
              <span className="text-[13px] font-medium text-[#6D85A1]">Saldo disponible</span>
              <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                ${nominaBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-slate-500">MXN</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
            <button
              type="button"
              onClick={() => onTriggerMayaPrompt('Transfiere $850 a Sofía Mendoza para la cena.')}
              className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
            >
              <span>Transferir por SPEI</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              En Línea
            </span>
          </div>
        </div>

        {/* 2. Credit Card */}
        <div className="banorte-card flex min-h-[242px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#CBD9E6]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#203956]">
                {cardLast4
                  ? (clientName.includes('Carlos') ? 'Tarjeta Banorte Clásica' : 'Tarjeta Banorte Oro')
                  : 'Línea de Crédito Banorte'}
              </span>
              <div className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${cardDebt > 0 ? 'bg-red-50 text-[#EB0029]' : 'bg-emerald-50 text-emerald-600'}`}>
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-[13px] text-[#6D85A1]">
              {cardLast4 ? `Crédito: •••• ${cardLast4}` : 'Sin tarjetas de crédito activas'}
            </p>
            <div className="mt-3">
              <span className="text-[13px] font-medium text-[#6D85A1]">
                {cardDebt > 0 ? 'Saldo total a la fecha' : 'Saldo deudor'}
              </span>
              <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                ${cardDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-slate-500">MXN</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
            <button
              type="button"
              onClick={() => onTriggerMayaPrompt(cardDebt > 0 ? '¿Cómo reestructurar mi tarjeta de crédito?' : '¿Cuáles son mis gastos del mes?')}
              className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
            >
              <span>{cardDebt > 0 ? 'Ver plan de pago fijo' : 'Sin saldo deudor'}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${cardDebt > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {cardDebt > 0 ? 'Vence 27 Sep' : 'Al Corriente'}
            </span>
          </div>
        </div>

        {/* 3. Investment Card */}
        <div className="banorte-card flex min-h-[242px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#CBD9E6]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#203956]">
                {clientName.includes('Silvia') ? 'Pagaré Altos Rendimientos' : 'Pagaré Banorte a Plazo'}
              </span>
              <img src={investmentTrend} alt="" className="h-10 w-10 object-contain" />
            </div>
            <p className="mt-1 text-[13px] text-[#6D85A1]">
              {clientName.includes('Silvia') ? 'Tasa preferencial 9.8% Anual' : 'Tasa garantizada 9.1% Anual'}
            </p>
            <div className="mt-3">
              <span className="text-[13px] font-medium text-[#6D85A1]">
                {clientName.includes('Silvia') ? 'Patrimonio para Inversión' : 'Inversión sugerida'}
              </span>
              <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                {clientName.includes('Silvia') ? '$116,614.10' : '$25,000.00'}{' '}
                <span className="text-xs font-semibold text-slate-500">MXN</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
            <button
              type="button"
              onClick={() => onTriggerMayaPrompt('Quiero simular una inversión a plazo fijo.')}
              className="flex items-center gap-1 text-[13px] font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <span>Simular rendimientos</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {clientName.includes('Silvia') ? '+9.8% Rend.' : '+9.1% Rend.'}
            </span>
          </div>
        </div>
      </div>

      {/* Restructure Callout Banner if eligible */}
      {cardDebt > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#F5B8C6] bg-gradient-to-r from-[#FFF6F8] via-white to-[#FFF6F8] p-4 shadow-[0_4px_12px_rgba(190,25,62,0.05)] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <img src={restructureShield} alt="" className="h-12 w-12 shrink-0 object-contain" />
            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wide text-[#061D3A]">
                Programa de Apoyo y Reestructuración Banorte 2026
              </h4>
              <p className="mt-0.5 text-[13px] text-[#526B87]">
                Tu tarjeta con terminación {cardLast4 ? `(*${cardLast4})` : '(*8812)'} es elegible para congelar intereses moratorios y diferir saldo a cuotas fijas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTriggerMayaPrompt('¿Cómo reestructurar mi tarjeta de crédito?')}
            className="whitespace-nowrap rounded-2xl bg-[#E4003B] px-5 py-3 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#C70032] cursor-pointer"
          >
            Revisar opciones con Maya
          </button>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="banorte-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#061D3A]">Últimos Movimientos de Cuentas</h3>
            <p className="text-[13px] text-[#6D85A1]">Transacciones y transferencias auditadas por SPEI en tiempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Filtrar</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Descargando estado de cuenta en PDF')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Estado de Cuenta</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1EAF2] bg-[#F6F9FC] text-xs font-bold uppercase tracking-wide text-[#617A96]">
                <th className="py-3 px-4">Descripción / Comercio</th>
                <th className="py-3 px-4 hidden sm:table-cell">Cuenta</th>
                <th className="py-3 px-4 hidden md:table-cell">Fecha y Hora</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 sm:hidden">{tx.account} • {tx.date}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 hidden sm:table-cell font-mono text-[11px]">
                      {tx.account}
                    </td>
                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 text-right font-black tabular-nums text-xs">
                      <span className={tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}>
                        {tx.type === 'credit' ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No hay movimientos recientes registrados en la base de datos para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
