import React, { useState } from 'react';
import { X, ArrowLeft, Zap, Wifi, Droplets, Flame, ShieldCheck, CheckCircle2, Calendar, Sparkles, RefreshCw } from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Luz' | 'Internet' | 'Agua' | 'Gas' | 'Peaje';
  serviceCode: string;
  referenceNumber: string;
  amount: number;
  dueDate: string;
  icon: 'zap' | 'wifi' | 'droplets' | 'flame';
  autoPay: boolean;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'cfe',
    name: 'CFE Suministrador de Servicios',
    category: 'Luz',
    serviceCode: '00321 - CFE Básico',
    referenceNumber: '0103 4819 2810 4',
    amount: 850.0,
    dueDate: '18 Sep 2026',
    icon: 'zap',
    autoPay: false,
  },
  {
    id: 'telmex',
    name: 'Telmex / Infinitum Fibra',
    category: 'Internet',
    serviceCode: '00104 - Telmex Hogar',
    referenceNumber: '871 720 4819 2',
    amount: 649.0,
    dueDate: '22 Sep 2026',
    icon: 'wifi',
    autoPay: true,
  },
  {
    id: 'agua',
    name: 'Agua y Saneamiento',
    category: 'Agua',
    serviceCode: '00540 - SIMAS / Agua',
    referenceNumber: '4820 9182 3',
    amount: 320.0,
    dueDate: '25 Sep 2026',
    icon: 'droplets',
    autoPay: false,
  },
  {
    id: 'naturgy',
    name: 'Naturgy México (Gas Natural)',
    category: 'Gas',
    serviceCode: '00219 - Gas Hogar',
    referenceNumber: '9281 0381 8',
    amount: 410.0,
    dueDate: '28 Sep 2026',
    icon: 'flame',
    autoPay: false,
  },
];

interface MobileBillPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePayment: (payment: {
    serviceName: string;
    reference: string;
    amount: number;
    autoPayEnabled: boolean;
    folio: string;
  }) => void;
  onOpenMayaChat: (message: string) => void;
  availableBalance?: number;
}

export const MobileBillPayModal: React.FC<MobileBillPayModalProps> = ({
  isOpen,
  onClose,
  onExecutePayment,
  onOpenMayaChat,
  availableBalance = 27900.0,
}) => {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [step, setStep] = useState<'catalog' | 'confirm' | 'success'>('catalog');
  const [enableRecurring, setEnableRecurring] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    serviceName: string;
    amount: number;
    folio: string;
    autoPay: boolean;
  } | null>(null);

  if (!isOpen && !isClosing) return null;

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    setEnableRecurring(service.autoPay);
    setStep('confirm');
  };

  const handleConfirmPay = () => {
    if (!selectedService) return;
    const folio = `SERV-${Math.floor(100000 + Math.random() * 900000)}`;
    const receipt = {
      serviceName: selectedService.name,
      amount: selectedService.amount,
      folio,
      autoPay: enableRecurring,
    };
    setLastReceipt(receipt);
    onExecutePayment({
      serviceName: selectedService.name,
      reference: selectedService.referenceNumber,
      amount: selectedService.amount,
      autoPayEnabled: enableRecurring,
      folio,
    });
    setStep('success');
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setSelectedService(null);
      setStep('catalog');
      onClose();
    }, 240);
  };

  const resetAndClose = () => {
    setSelectedService(null);
    setStep('catalog');
    onClose();
  };

  const renderIcon = (type: ServiceItem['icon']) => {
    switch (type) {
      case 'zap':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'wifi':
        return <Wifi className="h-5 w-5 text-blue-500" />;
      case 'droplets':
        return <Droplets className="h-5 w-5 text-cyan-500" />;
      case 'flame':
        return <Flame className="h-5 w-5 text-orange-500" />;
    }
  };

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg overflow-hidden rounded-t-[32px] bg-white shadow-2xl flex flex-col max-h-[90vh] ${
          isClosing ? 'animate-modal-sheet-down' : 'animate-modal-sheet'
        }`}
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
            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => setStep('catalog')}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {step === 'success' ? 'Pago Aplicado' : 'Pago de Servicios'}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {step === 'success'
                  ? 'Comprobante digital Banorte'
                  : 'CFE, Telmex, Agua y Domiciliación recurrente'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STEP 1: SERVICE CATALOG */}
          {step === 'catalog' && (
            <div key="step-catalog" className="space-y-4 animate-tab-inner">
              {/* Maya Assistant Shortcut */}
              <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-rose-500/5 to-white p-3.5 border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#EB0029] text-white grid place-items-center shadow-xs shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">¿Deseas pagar con Maya?</p>
                    <p className="text-[10px] text-slate-500">
                      Maya puede revisar tus recibos pendientes y domiciliarlos por voz o chat.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetAndClose();
                    onOpenMayaChat('Quiero pagar un servicio (luz CFE, agua o internet) o programar un pago automático');
                  }}
                  className="rounded-lg bg-[#EB0029] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#C70023] transition cursor-pointer shrink-0 shadow-xs"
                >
                  Abrir en Chat
                </button>
              </div>

              {/* Service List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-700">Tus recibos frecuentes</span>
                  <span className="text-[10px] text-slate-400">Toca para pagar</span>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:bg-red-50/40 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200/80 grid place-items-center shrink-0 group-hover:border-red-200 group-hover:bg-white transition">
                          {renderIcon(service.icon)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{service.name}</p>
                          <p className="text-[10px] text-slate-400">
                            Ref: {service.referenceNumber} • Vence: {service.dueDate}
                          </p>
                          {service.autoPay && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5">
                              <RefreshCw className="h-2.5 w-2.5" /> Domiciliado activo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 tabular-nums">
                          ${service.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] font-bold text-[#EB0029] group-hover:underline">
                          Pagar ahora →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring debit info card */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
                <Calendar className="h-4 w-4 text-[#EB0029] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Domiciliación Banorte sin costo</span>
                  <span className="text-[10px] text-slate-500 leading-snug">
                    Evita cortes por olvido domiciliando tus pagos. Los cargos se aplican en la fecha límite con aviso preventivo vía SMS y notificación móvil.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIRM PAYMENT & RECURRING TOGGLE */}
          {step === 'confirm' && selectedService && (
            <div key="step-confirm" className="space-y-4 animate-tab-inner">
              <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 space-y-3">
                <div className="flex items-center gap-3 border-b border-red-100/70 pb-3">
                  <div className="h-10 w-10 rounded-2xl bg-white border border-red-100 grid place-items-center shrink-0">
                    {renderIcon(selectedService.icon)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedService.name}</p>
                    <p className="text-[11px] text-slate-500">{selectedService.serviceCode}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Referencia de recibo:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedService.referenceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Fecha límite de pago:</span>
                  <span className="font-bold text-slate-800">{selectedService.dueDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Cuenta de cargo:</span>
                  <span className="font-bold text-slate-800">Nómina Banorte Fácil (•••• 7721)</span>
                </div>
                <div className="border-t border-red-100 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Total a pagar:</span>
                  <span className="text-xl font-black text-[#EB0029]">
                    ${selectedService.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              {/* Recurring Auto-Pay Toggle Switch */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-[#EB0029]" />
                    <span>Domiciliar pago recurrente</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Pagar automáticamente cada mes antes de la fecha de corte.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableRecurring(!enableRecurring)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
                    enableRecurring ? 'bg-[#EB0029] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-[#00A859] shrink-0" />
                <span>Autorización blindada con Token Celular Banorte.</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmPay}
                className="w-full rounded-xl bg-[#EB0029] py-3.5 text-xs font-bold text-white hover:bg-[#C70023] transition shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="h-4 w-4" />
                <span>Confirmar Pago de ${selectedService.amount.toFixed(2)} MXN</span>
              </button>
            </div>
          )}

          {/* STEP 3: SUCCESS RECEIPT */}
          {step === 'success' && lastReceipt && (
            <div key="step-success" className="text-center py-4 space-y-4 animate-tab-inner">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">¡Pago de Servicio Exitoso!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tu recibo de {lastReceipt.serviceName} ha sido liquidado correctamente.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto pagado:</span>
                  <span className="font-bold text-slate-900">
                    ${lastReceipt.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Folio de Operación:</span>
                  <span className="font-mono font-bold text-[#EB0029]">{lastReceipt.folio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Servicio:</span>
                  <span className="font-medium text-slate-800">{lastReceipt.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Domiciliación:</span>
                  <span className={`font-bold ${lastReceipt.autoPay ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {lastReceipt.autoPay ? 'Activada (Cobro mensual automático)' : 'No activada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha y Hora:</span>
                  <span className="font-medium text-slate-800">{new Date().toLocaleString('es-MX')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
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
export default MobileBillPayModal;
