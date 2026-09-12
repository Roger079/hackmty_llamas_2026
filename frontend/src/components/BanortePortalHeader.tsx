import React from 'react';
import { LockKeyhole, Cpu } from 'lucide-react';
import banorteLogo from '../assets/12ui/banorte-logo.png';

export interface BanortePortalHeaderProps {
  clientName?: string;
  tier?: string;
  hasToken?: boolean;
  mcpCallCount?: number;
  onOpenInspector?: () => void;
}

export const BanortePortalHeader: React.FC<BanortePortalHeaderProps> = ({
  clientName = 'Roberto Carlos Garza',
  tier = 'Cliente Preferente',
  hasToken = true,
  mcpCallCount = 0,
  onOpenInspector,
}) => {
  const initials = clientName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-[70px] bg-gradient-to-r from-[#C90032] via-[#EB0029] to-[#D90036] text-white shadow-[0_4px_12px_rgba(137,0,28,0.14)]">
      <div className="mx-auto flex h-full max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo & subtle subtitle */}
        <div className="flex items-center gap-3 sm:gap-5">
          <img src={banorteLogo} alt="Banorte" className="h-[27px] w-auto object-contain" />
          <div className="hidden border-l border-white/20 pl-4 md:block">
            <span className="text-[13px] font-bold text-white tracking-tight">
              Banca en Línea
            </span>
          </div>
        </div>

        {/* Right: Security indicators, MCP telemetry, and Client profile */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* FastMCP Inspector discrete badge */}
          {onOpenInspector && (
            <button
              type="button"
              onClick={onOpenInspector}
              className="inline-flex h-9 items-center gap-1.5 rounded-2xl border border-white/30 bg-[#9D0027]/25 px-3 text-[13px] font-bold text-white transition hover:bg-[#9D0027]/40 cursor-pointer"
              title="Abrir telemetría de herramientas FastMCP"
            >
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">MCP</span>
              <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                {mcpCallCount}
              </span>
            </button>
          )}

          {/* Token Móvil status */}
          {hasToken && (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-white/10 px-3 text-[13px] font-bold text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <LockKeyhole className="h-3 w-3" />
              <span className="hidden sm:inline">Token Móvil</span>
            </span>
          )}

          {/* User profile avatar */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
            <div className="hidden text-right lg:block">
              <p className="text-[13px] font-bold text-white leading-tight">{clientName}</p>
              <p className="text-xs font-medium text-white/90 leading-tight">{tier}</p>
            </div>
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[13px] font-bold text-[#D00039]"
              aria-label={`Perfil de ${clientName}`}
              title={clientName}
            >
              {initials || 'RC'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
