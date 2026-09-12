import React from 'react';
import { Sparkles, Shield, User } from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';

interface BanorteHeaderProps {
  clientName?: string;
  tier?: string;
  hasToken?: boolean;
}

export const BanorteHeader: React.FC<BanorteHeaderProps> = ({
  clientName = "Alejandro Ramírez",
  tier = "Preferente",
  hasToken = true
}) => {
  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl px-6 py-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <BanorteLogo className="h-7 w-auto" theme="dark" />
        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-tight">Conversational Banking</span>
          <span className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-500/30 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-400" />
            A2UI + FastMCP
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasToken && (
          <div className="flex items-center gap-1.5 bg-slate-800/80 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">Token Móvil Activo</span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
          <div className="w-7 h-7 rounded-full bg-[#EB0029] text-white flex items-center justify-center font-bold text-xs">
            AR
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white">{clientName}</div>
            <div className="text-[10px] text-amber-400 font-semibold">{tier}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
