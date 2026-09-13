import React, { useState } from 'react';
import { X, ArrowLeft, Send, CheckCircle2, Building2, User, CreditCard, ShieldCheck } from 'lucide-react';

export interface SavedContact {
  id: string;
  name: string;
  bank: string;
  accountType: 'CLABE' | 'Tarjeta' | 'Cuenta Nómina';
  accountNumber: string;
  avatarColor: string;
}

const SAVED_CONTACTS: SavedContact[] = [
  {
    id: 'carlos-ramirez',
    name: 'Carlos Ramírez',
    bank: 'Banorte',
    accountType: 'Cuenta Nómina',
    accountNumber: '•••• 7721',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'silvia-dominguez',
    name: 'Silvia Domínguez',
    bank: 'Banorte',
    accountType: 'Tarjeta',
    accountNumber: '•••• 8359',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'sofia-mendoza',
    name: 'Sofía Mendoza Ríos',
    bank: 'BBVA México',
    accountType: 'CLABE',
    accountNumber: '•••• 9201',
    avatarColor: 'bg-purple-600',
  },
  {
    id: 'roberto-garza',
    name: 'Roberto Garza',
    bank: 'Santander México',
    accountType: 'CLABE',
    accountNumber: '•••• 2301',
    avatarColor: 'bg-red-600',
  },
  {
    id: 'mariana-torres',
    name: 'Mariana Torres',
    bank: 'Banorte',
    accountType: 'Tarjeta',
    accountNumber: '•••• 1205',
    avatarColor: 'bg-amber-600',
  },
];

interface MobileTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteTransfer: (transfer: {
    recipient: string;
    bank: string;
    clabeOrCard: string;
    amount: number;
    concept: string;
  }) => void;
  availableBalance?: number;
}

export const MobileTransferModal: React.FC<MobileTransferModalProps> = ({
  isOpen,
  onClose,
  onExecuteTransfer,
  availableBalance = 27900.0,
}) => {
  const [tab, setTab] = useState<'saved' | 'new'>('saved');
  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'success'>('select');

  // Selected or created recipient
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');

  // Amount & concept
  const [amountStr, setAmountStr] = useState('');
  const [concept, setConcept] = useState('Transferencia');
  const [lastFolio, setLastFolio] = useState('');

  if (!isOpen) return null;

  const handleSelectContact = (contact: SavedContact) => {
    setRecipientName(contact.name);
    setRecipientBank(contact.bank);
    setRecipientAccount(contact.accountNumber);
    setStep('amount');
  };

  const handleNewContactNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientAccount.trim()) return;
    setRecipientBank(recipientBank || 'Banco Destino');
    setStep('amount');
  };

  const amountVal = parseFloat(amountStr) || 0;

  const handleConfirmTransfer = () => {
    const folio = `SPEI-${Date.now().toString().slice(-6)}`;
    setLastFolio(folio);
    onExecuteTransfer({
      recipient: recipientName,
      bank: recipientBank,
      clabeOrCard: recipientAccount,
      amount: amountVal,
      concept: concept || 'Transferencia',
    });
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('select');
    setTab('saved');
    setRecipientName('');
    setRecipientBank('');
    setRecipientAccount('');
    setAmountStr('');
    setConcept('Transferencia');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-t-[32px] bg-white shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {step !== 'select' && step !== 'success' && (
              <button
                type="button"
                onClick={() => setStep(step === 'confirm' ? 'amount' : 'select')}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-base font-extrabold text-slate-900">
              {step === 'success' ? 'Transferencia Exitosa' : 'Transferir Dinero (SPEI)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP 1: SELECT CONTACT (Saved vs New) */}
          {step === 'select' && (
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setTab('saved')}
                  className={`rounded-lg py-2 transition ${
                    tab === 'saved' ? 'bg-white text-[#EB0029] shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Contactos Guardados
                </button>
                <button
                  type="button"
                  onClick={() => setTab('new')}
                  className={`rounded-lg py-2 transition ${
                    tab === 'new' ? 'bg-white text-[#EB0029] shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  + Nuevo Contacto
                </button>
              </div>

              {tab === 'saved' ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Cuentas frecuentes registradas en testing:
                  </p>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                    {SAVED_CONTACTS.map((contact) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => handleSelectContact(contact)}
                        className="w-full flex items-center justify-between p-3.5 text-left hover:bg-red-50/50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full ${contact.avatarColor} text-white font-black text-sm grid place-items-center shadow-xs shrink-0`}>
                            {contact.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{contact.name}</p>
                            <p className="text-xs text-slate-500">
                              {contact.bank} • {contact.accountType} {contact.accountNumber}
                            </p>
                          </div>
                        </div>
                        <Send className="h-4 w-4 text-[#EB0029] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewContactNext} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre del Beneficiario
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Ej. Rodrigo Álvarez Soto"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EB0029] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Número de Tarjeta (16 dígitos) o CLABE (18 dígitos)
                    </label>
                    <div className="relative flex items-center">
                      <CreditCard className="absolute left-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={18}
                        value={recipientAccount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setRecipientAccount(val);
                          // Auto detect bank
                          if (val.startsWith('012')) setRecipientBank('BBVA México');
                          else if (val.startsWith('014')) setRecipientBank('Santander México');
                          else if (val.startsWith('072') || val.startsWith('4152')) setRecipientBank('Banorte');
                          else if (val.startsWith('002')) setRecipientBank('Citibanamex');
                          else if (val.startsWith('638')) setRecipientBank('Nu México');
                        }}
                        placeholder="16 o 18 dígitos"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EB0029] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banco Receptor
                    </label>
                    <div className="relative flex items-center">
                      <Building2 className="absolute left-3 h-4 w-4 text-slate-400" />
                      <select
                        value={recipientBank}
                        onChange={(e) => setRecipientBank(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EB0029] focus:bg-white transition"
                      >
                        <option value="">Selecciona banco receptor</option>
                        <option value="Banorte">Banorte</option>
                        <option value="BBVA México">BBVA México</option>
                        <option value="Santander México">Santander México</option>
                        <option value="Citibanamex">Citibanamex</option>
                        <option value="Nu México">Nu México</option>
                        <option value="Mercado Pago">Mercado Pago</option>
                        <option value="HSBC México">HSBC México</option>
                        <option value="Scotiabank">Scotiabank</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-[#EB0029] py-3 text-xs font-bold text-white hover:bg-[#A5002C] transition shadow-sm cursor-pointer"
                  >
                    Continuar al monto
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: ENTER AMOUNT & CONCEPT */}
          {step === 'amount' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Destinatario:</p>
                  <p className="text-sm font-bold text-slate-900">{recipientName}</p>
                  <p className="text-xs text-slate-500">{recipientBank} • {recipientAccount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-xs font-bold text-[#EB0029] hover:underline"
                >
                  Cambiar
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto a Transferir
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-xl font-bold text-slate-500">$</span>
                  <input
                    type="number"
                    step="any"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-14 py-3.5 text-2xl font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EB0029] transition"
                  />
                  <span className="absolute right-4 text-xs font-bold text-slate-400">MXN</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Saldo disponible en Nómina: <strong className="text-slate-800">${availableBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                </p>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2">
                {[200, 500, 850, 1000, 2500, 5000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setAmountStr(quick.toString())}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-[#EB0029] transition cursor-pointer"
                  >
                    +${quick}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Concepto de Transferencia
                </label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Pago de servicios / Renta"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EB0029] focus:bg-white transition"
                />
              </div>

              <button
                type="button"
                disabled={amountVal <= 0 || amountVal > availableBalance}
                onClick={() => setStep('confirm')}
                className={`w-full rounded-xl py-3 text-xs font-bold text-white transition shadow-sm ${
                  amountVal > 0 && amountVal <= availableBalance
                    ? 'bg-[#EB0029] hover:bg-[#A5002C] cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {amountVal > availableBalance ? 'Saldo insuficiente' : 'Revisar Transferencia'}
              </button>
            </div>
          )}

          {/* STEP 3: CONFIRMATION SUMMARY */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Beneficiario:</span>
                  <span className="font-bold text-slate-900">{recipientName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Banco / Cuenta:</span>
                  <span className="font-bold text-slate-900">{recipientBank} • {recipientAccount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Concepto:</span>
                  <span className="font-bold text-slate-900">{concept}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Comisión SPEI:</span>
                  <span className="font-bold text-emerald-600">$0.00 MXN</span>
                </div>
                <div className="border-t border-red-100 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Total a debitar:</span>
                  <span className="text-xl font-black text-[#EB0029]">${amountVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-[#00A859] shrink-0" />
                <span>Operación protegida con Token Digital Banorte de última generación.</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="w-full rounded-xl bg-[#EB0029] py-3.5 text-xs font-bold text-white hover:bg-[#A5002C] transition shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Confirmar y Enviar Transferencia</span>
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">¡Transferencia Realizada!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se ha enviado exitosamente a {recipientName}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto:</span>
                  <span className="font-bold text-slate-900">${amountVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Folio SPEI:</span>
                  <span className="font-mono font-bold text-[#EB0029]">{lastFolio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destino:</span>
                  <span className="font-medium text-slate-800">{recipientBank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha y Hora:</span>
                  <span className="font-medium text-slate-800">{new Date().toLocaleString('es-MX')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar comprobante
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
