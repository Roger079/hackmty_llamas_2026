import React from 'react';
import { MapPin, HelpCircle, Shield, PhoneCall } from 'lucide-react';

interface SegmentBarProps {
  activeSegment?: string;
}

export const BanortePortalSegmentBar: React.FC<SegmentBarProps> = ({ activeSegment = 'Personas' }) => {
  const segments = ['Personas', 'PyME', 'Empresas', 'Corporativo', 'Casa de Bolsa'];

  return (
    <nav aria-label="Segmentos institucionales Banorte" className="hidden w-full border-b border-white/10 bg-gradient-to-r from-[#111C29] to-[#172331] text-xs text-slate-300 md:block">
      <div className="mx-auto flex h-[50px] max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Segment Tabs */}
        <div className="flex items-center space-x-1">
          {segments.map((segment) => {
            const isActive = segment === activeSegment;
            return (
              <button
                key={segment}
                type="button"
                className={`relative px-3 py-2 text-[13px] transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white font-bold after:absolute after:inset-x-2 after:-bottom-[5px] after:h-0.5 after:bg-[#EB0029]'
                    : 'font-medium text-[#AAB7C5] hover:text-white'
                }`}
              >
                {segment}
              </button>
            );
          })}
        </div>

        {/* Institutional Utility Links */}
        <div className="flex items-center space-x-5 text-xs font-medium text-[#B6C0CA]">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <MapPin className="h-3 w-3 text-red-500" />
            <span>Sucursales y Cajeros</span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <HelpCircle className="h-3 w-3 text-slate-400" />
            <span>Ayuda</span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <Shield className="h-3 w-3 text-emerald-400" />
            <span>Seguridad</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300 font-mono">
            <PhoneCall className="h-3 w-3 text-slate-400" />
            <span>800 226 6783</span>
          </span>
        </div>
      </div>
    </nav>
  );
};
