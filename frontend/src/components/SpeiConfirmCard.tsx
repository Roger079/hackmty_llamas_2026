import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock } from 'lucide-react';
import { ActionContext } from '../types/a2ui';

interface SpeiConfirmCardProps {
  transferId?: string;
  amount: number;
  beneficiary: string;
  bank: string;
  clabe: string;
  concept?: string;
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
  disabled?: boolean;
}

export const SpeiConfirmCard: React.FC<SpeiConfirmCardProps> = ({
  transferId = "prep-spei-101",
  amount = 850.00,
  beneficiary = "SOFÍA MENDOZA RÍOS",
  bank = "BBVA México",
  clabe = "012 180 01594839201 9",
  concept = "Pago por servicios",
  onAction,
  disabled = false,
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleAuthorize = async () => {
    if (disabled || isAuthorizing) return;
    setIsAuthorizing(true);
    try {
      if (onAction) {
        await onAction({
          action: 'execute_spei',
          params: {
            transfer_id: transferId,
            amount,
            beneficiary,
            bank,
            clabe,
            concept,
            auth_token: "OTP-BANORTE-TOKEN-VALID"
          },
          source_component: 'SpeiConfirmCard'
        });
      }
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden my-3 animate-in fade-in">
      <div className="bg-[#EB0029] text-white px-4 py-3 sm:px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="text-xs font-bold uppercase tracking-wide">Confirmar Transferencia SPEI</span>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono text-[10px] text-white">
          Token Móvil
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5 text-xs">
        <div className="text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Monto a Enviar</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums mt-0.5">
            ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs font-semibold text-slate-500">MXN</span>
          </div>
        </div>

        <div className="space-y-2 border-y border-slate-100 py-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Beneficiario:</span>
            <span className="font-bold text-slate-800">{beneficiary}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Banco Receptor:</span>
            <span className="font-semibold text-slate-800">{bank}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cuenta CLABE:</span>
            <span className="font-mono text-slate-800">{clabe}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Concepto:</span>
            <span className="font-medium text-slate-700">{concept}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Comisión Banorte:</span>
            <span className="font-bold text-emerald-600">$0.00 MXN (Sin costo)</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleAuthorize}
            disabled={disabled || isAuthorizing}
            className="w-full py-3 bg-[#EB0029] hover:bg-[#C70023] active:bg-[#9E001B] text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isAuthorizing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validando Token Móvil y enviando a Banxico...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4" />
                <span>Autorizar con Token Móvil</span>
              </>
            )}
          </button>
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-slate-400">
            <Lock className="w-3 h-3" />
            <span>Autenticación de 2 factores encriptada SHA-256</span>
          </p>
        </div>
      </div>
    </div>
  );
};
