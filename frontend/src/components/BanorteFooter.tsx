import React from 'react';
import { ShieldCheck, Phone, ExternalLink } from 'lucide-react';

export const BanorteFooter: React.FC = () => {
  return (
    <footer className="mt-12 w-full bg-[#1C1E21] text-slate-400 text-xs border-t border-slate-800">
      <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Regulatory Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              Unidad Especializada de Atención (UNE)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Av. Paseo de la Reforma 505, Piso 43, Cuauhtémoc, CDMX. Teléfono: <strong className="text-white">800 627 2292</strong> o correo <span className="text-red-400">une@banorte.com</span>.
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              CONDUSEF
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros. Centro de Atención: <strong className="text-white">01 800 999 8080</strong> o <strong className="text-white">55 53 40 09 99</strong>.
            </p>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              Protección al Ahorro (IPAB)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Los productos bancarios a la vista y a plazo de Banco Mercantil del Norte están garantizados por el IPAB hasta por 400,000 UDIS por persona.
            </p>
          </div>
        </div>

        {/* Links Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="hover:text-white transition-colors cursor-pointer">Aviso de Privacidad</span>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones</span>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Tasas y Comisiones (CAT)</span>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Buró de Entidades Financieras</span>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">Seguridad contra Fraude</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Portal protegido con cifrado TLS 1.3 / AES-256</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-[11px] text-slate-400">
          © 2026 Grupo Financiero Banorte, S.A.B. de C.V. Todos los derechos reservados. Banco Mercantil del Norte, S.A., Institución de Banca Múltiple.
        </div>
      </div>
    </footer>
  );
};
