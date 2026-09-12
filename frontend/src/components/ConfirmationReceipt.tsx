import React from 'react';
import { CheckCircle2, Download, Share2, Shield, Calendar, CreditCard } from 'lucide-react';

interface ConfirmationReceiptProps {
  folio: string;
  status: string;
  monthlyPayment: number;
  termMonths: number;
  nextPaymentDate: string;
  bankSeal: string;
  clientName?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export const ConfirmationReceipt: React.FC<ConfirmationReceiptProps> = ({
  folio = "FOL-BNTE-2026-R88754",
  status = "APROBADO",
  monthlyPayment = 1920.00,
  termMonths = 24,
  nextPaymentDate = "15 Oct 2026",
  bankSeal = "BANORTE-CRYPTO-SHA256-4A91E0",
  clientName = "Roberto Carlos Garza",
  onDownload,
  onShare,
}) => {
  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden my-3 animate-in zoom-in-95 duration-200">
      {/* Green Success Header */}
      <div className="bg-[#008744] text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-100">
              Convenio Bancario Vigente
            </span>
            <h3 className="text-base font-extrabold tracking-tight">Reestructuración Exitosa</h3>
          </div>
        </div>
        <div className="bg-white text-[#008744] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {status}
        </div>
      </div>

      {/* Monthly payment banner */}
      <div className="bg-slate-50 p-5 text-center border-b border-slate-200/70">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Tu nueva cuota fija mensual</span>
        <div className="text-3xl font-black text-[#1C1E21] tabular-nums mt-1">
          ${monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
          <span className="text-sm font-semibold text-slate-500">MXN</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Plan diferido a <strong className="text-slate-800">{termMonths} mensualidades fijas</strong>
        </p>
      </div>

      {/* Convenio details */}
      <div className="p-5 space-y-3 text-xs">
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500">Titular del crédito</span>
          <span className="font-bold text-slate-800">{clientName}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500">Folio oficial de convenio</span>
          <span className="font-mono font-bold text-[#EB0029] tracking-wider">{folio}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500">Primer pago programado</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {nextPaymentDate}
          </span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500">Estado de morosidad</span>
          <span className="font-bold text-emerald-600">Congelado sin recargos</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500">Sello digital Banorte</span>
          <span className="max-w-[180px] truncate font-mono text-[11px] text-slate-600">{bankSeal}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex gap-3">
        <button
          onClick={onDownload || (() => alert(`Comprobante ${folio} descargado en PDF`))}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Descargar Contrato PDF</span>
        </button>
        <button
          onClick={onShare || (() => alert(`Comprobante ${folio} listo para compartir`))}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EB0029] py-3 text-xs font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-[#C70023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] focus-visible:ring-offset-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Compartir</span>
        </button>
      </div>
    </div>
  );
};
