import React from 'react';
import { CheckCircle2, Download, Share2 } from 'lucide-react';

interface SpeiReceiptCardProps {
  amount: number;
  beneficiary: string;
  bank: string;
  clabe: string;
  trackingKey: string;
  date?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export const SpeiReceiptCard: React.FC<SpeiReceiptCardProps> = ({
  amount = 850.00,
  beneficiary = "SOFÍA MENDOZA RÍOS",
  bank = "BBVA México",
  clabe = "012 180 01594839201 9",
  trackingKey = "BNTE202609118492019",
  date = "11 Sep 2026, 14:35 hrs",
  onDownload,
  onShare,
}) => {
  return (
    <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-3 animate-in zoom-in-95 duration-200">
      <div className="bg-[#008744] text-white px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide">Transferencia SPEI Exitosa</h4>
          <p className="text-[10px] text-white/90">Banxico CEP oficial validado</p>
        </div>
      </div>

      <div className="p-5 text-center border-b border-slate-100 bg-slate-50/50">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Monto enviado</span>
        <div className="text-3xl font-black text-[#1C1E21] tabular-nums mt-1">
          ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
          <span className="text-xs font-medium text-slate-500">MXN</span>
        </div>
      </div>

      <div className="p-5 space-y-2.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Destinatario</span>
          <span className="font-bold text-slate-800">{beneficiary}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Banco Receptor</span>
          <span className="font-semibold text-slate-800">{bank}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Cuenta CLABE</span>
          <span className="font-mono text-slate-800 text-[11px]">{clabe}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Clave de Rastreo Banxico</span>
          <span className="font-mono text-slate-800 text-[11px] font-bold">{trackingKey}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Fecha y Hora</span>
          <span className="text-slate-700 text-[11px]">{date}</span>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button
          onClick={onDownload || (() => alert(`Comprobante ${trackingKey} descargado`))}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar PDF</span>
        </button>
        <button
          onClick={onShare || (() => alert(`Comprobante compartido`))}
          className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#EB0029] py-3 text-xs font-bold text-white shadow-md shadow-red-500/20 transition hover:bg-[#C70023] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0029] focus-visible:ring-offset-2 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir</span>
        </button>
      </div>
    </div>
  );
};
