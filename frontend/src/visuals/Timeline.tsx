import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import type { TimelineProps, TimelineStep } from './types';
import { resolve, rows } from './utils';

const defaultDemoSteps: TimelineStep[] = [
  {
    label: '1. Solicitud de Operación Autorizada',
    date: '11 Sep 2026 14:20:00',
    status: 'completed',
    description: 'Instrucción capturada y autorizada exitosamente desde Banorte Móvil con Token Digital.',
  },
  {
    label: '2. Validación de Saldo y Firma Banorte',
    date: '11 Sep 2026 14:20:02',
    status: 'completed',
    description: 'Fondos reservados en cuenta de origen y sello criptográfico SHA-256 verificado.',
  },
  {
    label: '3. Procesamiento en Red Banxico / Cámara',
    date: '11 Sep 2026 14:20:05',
    status: 'completed',
    description: 'Clave de rastreo Banxico asignada (Comprobante Electrónico de Pago CEP activo).',
  },
  {
    label: '4. Liquidación y Abono Exitoso',
    date: '11 Sep 2026 14:20:08',
    status: 'completed',
    description: 'Recursos acreditados en destino final. Operación firme y registrada en estado de cuenta.',
  },
];

export function Timeline(p: TimelineProps) {
  const resolvedSteps = (p.steps || (rows(p.data, p.stepsPath) as unknown as TimelineStep[]) || defaultDemoSteps) as TimelineStep[];
  const steps = Array.isArray(resolvedSteps) && resolvedSteps.length > 0 ? resolvedSteps : defaultDemoSteps;
  const title = resolve(p.title, p.data) || 'Rastreo y Estatus de Movimiento';
  const horizontal = p.orientation === 'horizontal';

  const getStepIcon = (status: string, index: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'current':
        return <Activity className="w-4 h-4 text-white animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-white" />;
      default:
        return <span className="text-xs font-bold text-white">{index + 1}</span>;
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-600 ring-4 ring-emerald-50';
      case 'current':
        return 'bg-[#EB0029] ring-4 ring-red-100 shadow-md animate-pulse';
      case 'error':
        return 'bg-rose-600 ring-4 ring-rose-50';
      default:
        return 'bg-slate-400 ring-4 ring-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'current':
        return 'En proceso';
      case 'error':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'current':
        return 'bg-red-50 text-[#EB0029] border-red-200 font-bold';
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 animate-in fade-in zoom-in-95 ${
        p.className || ''
      }`}
    >
      {/* Banorte Brand Header */}
      <div className="bg-gradient-to-r from-[#061D3A] via-slate-900 to-[#061D3A] p-4 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EB0029] flex items-center justify-center shadow-md text-white font-black text-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Auditoría y Rastreo Operativo Banorte
            </span>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          Verificado
        </span>
      </div>

      {/* Steps Container */}
      <div
        className={`p-4 sm:p-5 flex ${
          horizontal
            ? 'flex-row gap-4 overflow-x-auto no-scrollbar items-stretch'
            : 'flex-col gap-4'
        }`}
      >
        {steps.map((s, i) => {
          const stepStatus = s.status || 'completed';
          const isLast = i === steps.length - 1;
          const label = resolve(s.label, p.data);
          const date = resolve(s.date, p.data);
          const description = resolve(s.description, p.data);

          return (
            <div
              key={i}
              className={`relative flex ${
                horizontal ? 'flex-col min-w-[200px] flex-1' : 'flex-row items-start gap-3.5'
              }`}
            >
              {/* Node Marker and Connector */}
              <div className="flex flex-col items-center shrink-0 relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${getBadgeClass(
                    stepStatus
                  )}`}
                >
                  {getStepIcon(stepStatus, i)}
                </div>

                {!isLast && !horizontal && (
                  <div
                    className={`w-0.5 my-1 grow min-h-[36px] ${
                      stepStatus === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              {/* Step Details */}
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#061D3A] tracking-tight">
                    {label}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusPillClass(
                      stepStatus
                    )}`}
                  >
                    {getStatusLabel(stepStatus)}
                  </span>
                </div>

                {date && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 font-mono">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{date}</span>
                  </div>
                )}

                {description && (
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-medium text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#EB0029]" />
          Certificación de liquidación Banco de México (SPEI)
        </span>
        <span className="font-mono text-[10px] text-slate-400">SHA-256 VALIDATED</span>
      </div>
    </div>
  );
}

export default Timeline;
