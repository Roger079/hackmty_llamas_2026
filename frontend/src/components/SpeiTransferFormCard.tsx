import React, { useState } from 'react';
import {
  Send,
  UserCheck,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ActionContext } from '../types/a2ui';

export interface SpeiContact {
  id: string;
  name: string;
  bank: string;
  clabe: string;
  alias?: string;
  avatarColor?: string;
}

export interface SpeiTransferFormCardProps {
  initialBeneficiary?: string;
  initialBank?: string;
  initialClabe?: string;
  initialAmount?: number;
  initialConcept?: string;
  availableBalance?: number;
  contacts?: SpeiContact[];
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
  disabled?: boolean;
}

const DEFAULT_CONTACTS: SpeiContact[] = [
  {
    id: 'c-1',
    name: 'SOFÍA MENDOZA RÍOS',
    bank: 'BBVA México',
    clabe: '012 180 01594839201 9',
    alias: 'Sofía Mendoza',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'c-2',
    name: 'DR. ARISMENDI MÉNDEZ',
    bank: 'Banorte',
    clabe: '072 180 00249581940 2',
    alias: 'Dr. Arismendi',
    avatarColor: 'bg-[#EB0029]',
  },
  {
    id: 'c-3',
    name: 'COLEGIATURA CAMPUS MTY',
    bank: 'Santander México',
    clabe: '014 180 00194827501 3',
    alias: 'Colegiatura Tec',
    avatarColor: 'bg-emerald-600',
  },
];

const detectBankFromClabe = (rawClabe: string): string => {
  const clean = rawClabe.replace(/\D/g, '');
  if (clean.length < 3) return '';
  const code = clean.slice(0, 3);
  switch (code) {
    case '002':
      return 'Citibanamex';
    case '012':
      return 'BBVA México';
    case '014':
      return 'Santander México';
    case '021':
      return 'HSBC México';
    case '044':
      return 'Scotiabank Inverlat';
    case '058':
      return 'Banregio';
    case '072':
      return 'Banorte';
    case '127':
      return 'Banco Azteca';
    case '137':
      return 'Bancoppel';
    case '638':
      return 'Nu México (STP)';
    case '646':
      return 'STP';
    case '659':
      return 'OXXO Premia / STP';
    default:
      return 'Banco Receptor Interbancario';
  }
};

const formatClabe = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 18);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 17));
  if (digits.length > 17) parts.push(digits.slice(17, 18));
  return parts.join(' ');
};

export const SpeiTransferFormCard: React.FC<SpeiTransferFormCardProps> = ({
  initialBeneficiary = 'SOFÍA MENDOZA RÍOS',
  initialBank = 'BBVA México',
  initialClabe = '012 180 01594839201 9',
  initialAmount = 850.0,
  initialConcept = 'Pago por servicios',
  availableBalance = 27900.0,
  contacts = DEFAULT_CONTACTS,
  onAction,
  disabled = false,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<string>('c-1');
  const [beneficiary, setBeneficiary] = useState<string>(initialBeneficiary);
  const [bank, setBank] = useState<string>(initialBank);
  const [clabe, setClabe] = useState<string>(initialClabe);
  const [amount, setAmount] = useState<number | string>(initialAmount || 850);
  const [concept, setConcept] = useState<string>(initialConcept);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  const isOverBalance = numAmount > availableBalance;
  const cleanDigits = clabe.replace(/\D/g, '');
  const isClabeValid = cleanDigits.length === 18 || cleanDigits.length === 16;
  const canSubmit = !disabled && !isSubmitting && numAmount > 0 && !isOverBalance && isClabeValid && beneficiary.trim().length > 2;

  const handleSelectContact = (contact: SpeiContact) => {
    setSelectedContactId(contact.id);
    setBeneficiary(contact.name);
    setBank(contact.bank);
    setClabe(contact.clabe);
  };

  const handleCustomMode = () => {
    setSelectedContactId('new');
    setBeneficiary('');
    setBank('');
    setClabe('');
  };

  const handleClabeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatClabe(raw);
    setClabe(formatted);
    const detected = detectBankFromClabe(raw);
    if (detected && (!bank || bank === 'Banco Receptor Interbancario')) {
      setBank(detected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    if (onAction) {
      const success = await onAction({
        action: 'prepare_spei',
        params: {
          beneficiary_name: beneficiary.trim(),
          recipient_bank: bank.trim() || 'Banco Receptor',
          clabe: cleanDigits,
          amount: Number(numAmount),
          concept: concept.trim() || 'Transferencia SPEI',
        },
        source_component: 'SpeiTransferFormCard',
      });
      if (!success) setIsSubmitting(false);
    }
  };

  return (
    <div className="banorte-card rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden my-3 animate-in fade-in zoom-in-95 duration-150">
      {/* 1. Header institucional */}
      <div className="bg-gradient-to-r from-[#EB0029] to-[#C70023] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold leading-tight">
              Transferencia Interbancaria SPEI
            </h3>
            <p className="text-[10px] text-red-100 font-medium">
              Envío inmediato 24/7 sin comisiones Banorte
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-red-100/90 block font-semibold">
            Saldo disponible
          </span>
          <span className="text-xs sm:text-sm font-black tabular-nums">
            ${availableBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 2. Form Body */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs text-slate-800">
        {/* Contacts selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-[#EB0029]" />
              <span>Selecciona un destinatario rápido:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">1-toque</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {contacts.map((c) => {
              const isSelected = selectedContactId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectContact(c)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#EB0029] bg-red-50/70 text-slate-900 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.avatarColor || 'bg-slate-500'}`} />
                    <span className="font-bold text-[11px] truncate">{c.alias || c.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium truncate">{c.bank}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleCustomMode}
              className={`p-2 rounded-xl text-left border border-dashed transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedContactId === 'new'
                  ? 'border-[#EB0029] bg-red-50/70 text-[#EB0029] font-bold'
                  : 'border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[11px]">Otro Destino</span>
            </button>
          </div>
        </div>

        {/* Inputs row: Beneficiary & Bank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nombre del Beneficiario
            </label>
            <input
              type="text"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Ej. Sofía Mendoza Ríos"
              required
              disabled={disabled || isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#EB0029] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Banco Receptor
            </label>
            <div className="relative">
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ej. BBVA México, Banorte, Nu..."
                required
                disabled={disabled || isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#EB0029] focus:outline-none transition pr-8"
              />
              <Building2 className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* CLABE input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Cuenta CLABE (18 dígitos) o Tarjeta Débito (16 dígitos)
            </label>
            {isClabeValid && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>CLABE verificada</span>
              </span>
            )}
          </div>
          <input
            type="text"
            value={clabe}
            onChange={handleClabeChange}
            placeholder="012 180 01594839201 9"
            required
            disabled={disabled || isSubmitting}
            className={`w-full rounded-xl border px-3 py-2 text-xs font-mono font-bold transition focus:outline-none ${
              isClabeValid
                ? 'border-emerald-300 bg-emerald-50/30 text-slate-900 focus:border-emerald-500'
                : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#EB0029]'
            }`}
          />
        </div>

        {/* Monto & Quick Amount Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Monto a Transferir (MXN)
            </label>
            <span className="text-[10px] text-slate-400">Sin comisiones</span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={disabled || isSubmitting}
              className={`w-full rounded-xl border pl-8 pr-16 py-2 text-sm font-black tabular-nums transition focus:outline-none ${
                isOverBalance
                  ? 'border-amber-400 bg-amber-50/50 text-amber-900 focus:border-amber-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#EB0029] focus:bg-white'
              }`}
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">MXN</span>
          </div>

          {/* Quick Amount Pills */}
          <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
            {[200, 500, 1000, 2500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition cursor-pointer"
              >
                +${amt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(availableBalance)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[10px] font-bold text-[#EB0029] border border-red-200 transition cursor-pointer"
            >
              Todo el Saldo
            </button>
          </div>

          {isOverBalance && (
            <p className="mt-1.5 text-[11px] font-bold text-amber-700 flex items-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                El monto (${numAmount.toLocaleString('es-MX')}) supera tu saldo disponible ($
                {availableBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN).
              </span>
            </p>
          )}
        </div>

        {/* Concepto */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Concepto del Pago (Máx 35 caracteres)
            </label>
            <span className="text-[10px] text-slate-400">{concept.length}/35</span>
          </div>
          <input
            type="text"
            maxLength={35}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Ej. Pago servicios, comida, etc."
            required
            disabled={disabled || isSubmitting}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#EB0029] focus:outline-none transition"
          />

          <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
            {['Comida', 'Servicios', 'Renta', 'Préstamo', 'Abono'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setConcept(item)}
                className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-600 transition cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-0.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Paso 1 de 2: Revisión de Orden</span>
            </span>
            <span className="font-bold text-emerald-700">Comisión: $0.00 MXN</span>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-[#EB0029] hover:bg-[#C70023] active:bg-[#9E001B] text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generando orden de autorización...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Revisar y Continuar a Token Móvil</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
