import React from 'react';
import { LockKeyhole, Cpu, ChevronDown } from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';

export interface BanortePortalHeaderProps {
  clientName?: string;
  tier?: string;
  hasToken?: boolean;
  mcpCallCount?: number;
  onOpenInspector?: () => void;
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
}

export const BanortePortalHeader: React.FC<BanortePortalHeaderProps> = ({
  clientName = 'Ana Martínez',
  tier = 'Cliente Nómina',
  hasToken = true,
  mcpCallCount = 0,
  onOpenInspector,
  selectedUserId = 'C001',
  onSelectUser,
}) => {
  const initials = clientName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  const currentTier =
    selectedUserId === 'C001'
      ? 'Cliente Nómina'
      : selectedUserId === 'C002'
      ? 'Cliente Clásico'
      : 'Cliente Patrimonial';

  return (
    <header className="sticky top-0 z-40 h-[70px] bg-gradient-to-r from-[#C90032] via-[#EB0029] to-[#D90036] text-white shadow-[0_4px_12px_rgba(137,0,28,0.14)]">
      <div className="mx-auto flex h-full max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Official Banorte Brand logo & Banking subtitle */}
        <div className="flex items-center gap-3 sm:gap-5">
          <BanorteLogo className="h-[27px] w-auto" theme="red" />
          <div className="hidden border-l border-white/20 pl-4 md:block">
            <span className="text-[13px] font-bold text-white tracking-tight">
              Banca en Línea
            </span>
          </div>
        </div>

        {/* Right: Security indicators, MCP telemetry, and Client profile switcher */}
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

          {/* Real SQLite Customer Profile & Switcher */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
            <div className="min-w-0">
              {onSelectUser ? (
                <div className="relative">
                  <select
                    value={selectedUserId}
                    onChange={(e) => onSelectUser(e.target.value)}
                    className="block h-8 max-w-[190px] appearance-none rounded-full border border-white/25 bg-white/10 py-1 pl-3 pr-8 text-left text-[13px] font-bold text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    title="Seleccionar cliente bancario registrado en SQLite"
                  >
                    <option value="C001" className="bg-[#9D0027] text-white">Ana Martínez (Nómina)</option>
                    <option value="C002" className="bg-[#9D0027] text-white">Carlos Ramírez (Deuda)</option>
                    <option value="C003" className="bg-[#9D0027] text-white">Silvia Carrasco (Patrimonial)</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/75"
                  />
                </div>
              ) : (
                <p className="text-[13px] font-bold text-white leading-tight">{clientName}</p>
              )}
              <p className="text-[11px] font-medium text-white/80 leading-tight mt-0.5">
                {currentTier}
              </p>
            </div>
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[13px] font-bold text-[#D00039] shadow-sm"
              aria-label={`Perfil de ${clientName}`}
              title={`Cliente autenticado: ${clientName}`}
            >
              {initials || 'AR'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
