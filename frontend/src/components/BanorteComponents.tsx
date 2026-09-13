import React, { useState } from 'react';
import { BanorteLogo as BrandLogo } from './BanorteLogo';

/**
 * BANORTE UI COMPONENT SYSTEM — REVAMPED HACKATHON KIT
 * Faithful to official Banorte portal and Maya conversational banking widget.
 */

// 1. BANORTE LOGO
export const BanorteLogo = BrandLogo;

// 2. OFFICIAL BANORTE PORTAL TOP HEADER
export const BanortePortalHeader: React.FC<{
  activeNav?: string;
  onBancaEnLineaClick?: () => void;
}> = ({
  activeNav = 'Personal',
  onBancaEnLineaClick
}) => {
  const navItems = [
    { label: 'Personal', hasDropdown: true },
    { label: 'Preferente', hasDropdown: true },
    { label: 'VA', isExternal: true },
    { label: 'Casa de Bolsa', hasDropdown: true },
    { label: 'PyME', hasDropdown: true },
    { label: 'Empresas', hasDropdown: true },
    { label: 'Gobierno', hasDropdown: true },
  ];

  return (
    <header className="w-full bg-[#EB0029] text-white px-4 sm:px-8 py-2.5 shadow-md select-none sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo & Nav items */}
        <div className="flex items-center gap-6 lg:gap-8">
          <a href="/" className="flex items-center gap-2 cursor-pointer">
            <BrandLogo className="h-6 w-auto" theme="red" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-1 py-1 px-2 rounded hover:bg-black/10 transition cursor-pointer ${
                  activeNav === item.label ? 'bg-black/20 font-bold' : 'text-white/95'
                }`}
              >
                <span>{item.label}</span>
                {item.hasDropdown && <span className="text-[10px] opacity-75">▾</span>}
                {item.isExternal && <span className="text-[10px] opacity-75">↗</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="px-4 py-1.5 rounded-full bg-white text-[#EB0029] hover:bg-red-50 text-xs font-bold transition shadow-sm cursor-pointer">
            Hazte cliente
          </button>
          <button
            onClick={onBancaEnLineaClick}
            className="px-4 py-1.5 rounded-lg bg-[#EB0029] border border-white hover:bg-white hover:text-[#EB0029] text-white text-xs font-bold transition cursor-pointer"
          >
            Banca en línea
          </button>
          <button className="p-2 rounded-full hover:bg-black/10 text-white transition cursor-pointer" title="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

// 3. MAYA CIRCULAR AVATAR (Official badge from Screenshot 2)
export const MayaAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-14 h-14"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-[#EB0029] flex items-center justify-center text-white shadow-lg shadow-red-500/30 shrink-0 border-2 border-white`}>
      <BrandLogo variant="icon" theme="red" className="h-[58%] w-[58%]" alt="" />
    </div>
  );
};

// 4. MAYA FLOATING CHAT WIDGET (Faithful to Screenshot 2)
export const MayaChatWidget: React.FC<{
  isOpen?: boolean;
  onToggle?: () => void;
  onSendPrompt?: (prompt: string) => void;
  onExpandToFull?: () => void;
}> = ({
  isOpen = true,
  onToggle,
  onSendPrompt,
  onExpandToFull
}) => {
  const [inputText, setInputText] = useState('');
  const dispatchPrompt = (prompt: string) => {
    const value = prompt.trim();
    if (!value) return;
    onSendPrompt?.(value);
    onExpandToFull?.();
  };
  const submitInput = () => {
    if (!inputText.trim()) return;
    dispatchPrompt(inputText);
    setInputText('');
  };

  const quickPills = [
    "Muéstrame mi gráfica de gastos semanales",
    "Compara mis gastos con el mes pasado",
    "¿Cómo va mi fondo de inversión?",
    "Consultar un estado de cuenta",
    "Transferencias"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        aria-label="Abrir Maya, asistente virtual"
        className="fixed bottom-20 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border-2 border-white bg-[#EB0029] p-2 pr-4 text-white shadow-[0_16px_42px_rgba(151,0,32,0.36)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(151,0,32,0.45)] cursor-pointer sm:bottom-6 sm:right-6"
      >
        <MayaAvatar size="md" />
        <div className="min-w-0 text-left leading-tight">
          <span className="block text-sm font-black tracking-tight text-white">Maya</span>
          <span className="block max-w-[205px] truncate text-[10px] font-bold text-white drop-shadow-sm">Pregúntame por una gráfica de tus gastos</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-hidden rounded-t-[28px] border border-red-900/20 bg-white text-slate-900 shadow-[0_18px_55px_rgba(110,0,24,0.32)] animate-in slide-in-from-bottom duration-300 sm:bottom-5 sm:right-6 sm:rounded-[28px]">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-white/20 bg-[#EB0029] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MayaAvatar size="sm" />
          <div>
            <h4 className="text-xs font-bold text-white">Maya — Asistente Virtual</h4>
            <span className="text-[10px] font-mono text-amber-200">En línea</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onExpandToFull && (
            <button onClick={onExpandToFull} className="rounded p-1 text-white/80 transition hover:bg-white/15 hover:text-white" title="Pantalla completa">
              ↗
            </button>
          )}
          <button onClick={onToggle} className="rounded p-1 text-white/80 transition hover:bg-white/15 hover:text-white" title="Minimizar">
            –
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="max-h-[420px] space-y-4 overflow-y-auto bg-gradient-to-b from-red-50 to-white p-4">
        <div className="flex items-start gap-3">
          <MayaAvatar size="md" />
          <div className="flex-1">
            <h3 className="text-base font-bold leading-snug text-slate-900">
              ¡Hola! Soy Maya, tu asistente virtual. ¡Chatea conmigo!
            </h3>
          </div>
        </div>

        {/* Intent Pills from Screenshot 2 */}
        <div className="space-y-1.5">
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => dispatchPrompt(pill)}
              className="w-full rounded-xl border border-red-100 bg-white px-4 py-2 text-left text-xs font-semibold text-[#A5002C] shadow-sm transition hover:border-[#EB0029] hover:bg-red-50 cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Widget Input Bar */}
      <div className="border-t border-red-100 bg-white p-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitInput();
              }
            }}
            placeholder="Escriba algo..."
            className="w-full rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-2.5 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EB0029]"
          />
          <button
            onClick={submitInput}
            className="absolute right-2 p-1 text-[#EB0029] transition hover:text-[#A5002C] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. BANORTE CARD MOCKUP (Conmigo, Nómina, Oro)
export const BanorteCard: React.FC<{
  holderName?: string;
  last4?: string;
  expiry?: string;
  balance?: number;
  cardType?: string;
  isGold?: boolean;
  size?: 'default' | 'large';
  className?: string;
}> = ({
  holderName = "Ana Martínez",
  last4 = "4582",
  expiry = "12/28",
  balance = 27900.00,
  cardType = "Débito Nómina",
  isGold = false,
  size = 'default',
  className = 'shadow-xl',
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const bgGradient = isGold
    ? "from-[#C59B27] via-[#A68018] to-[#6E540C]"
    : "from-[#EB0029] via-[#C70023] to-[#8C0018]";

  return (
    <div className={`relative w-full ${size === 'large' ? 'h-60 max-w-none rounded-[1.65rem] p-7' : 'max-w-sm h-52 rounded-2xl p-6'} text-white overflow-hidden bg-gradient-to-br ${bgGradient} ${className}`}>
      <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-5 top-5 opacity-[0.18] pointer-events-none" aria-hidden="true">
        <BrandLogo variant="icon" theme="red" className="h-14 w-14" alt="" />
      </div>

      <div className="relative z-10">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-white/80">{cardType}</span>
          <BrandLogo className="mt-1 h-4 w-auto" theme="red" />
        </div>
      </div>

      <div className="absolute right-20 top-[5.75rem] z-10 flex h-7 w-10 items-center justify-center rounded-md border border-amber-600/30 bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 shadow-inner">
        <div className="h-4 w-6 rounded-[2px] border border-amber-800/40" />
      </div>

      <div className="mt-14 mb-3 relative z-10">
        <div className="text-xs text-white/80">Saldo disponible</div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowBalance((visible) => !visible);
          }}
          className="mt-0.5 block cursor-pointer text-left text-2xl font-bold tracking-tight tabular-nums text-white transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
          aria-pressed={showBalance}
        >
          {showBalance ? `$ ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : "••••••••••"}
        </button>
      </div>

      <div className="absolute bottom-4 left-7 right-7 z-10 flex items-end justify-between border-t border-white/20 pt-2">
        <div>
          <div className="text-xs font-mono tracking-widest text-white/90">
            •••• •••• •••• {last4}
          </div>
          <div className="text-[11px] uppercase tracking-wider font-medium text-white/80 truncate max-w-[180px]">
            {holderName}
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 self-end text-right">
          <span className="text-[9px] uppercase tracking-wider text-white/60">Vence</span>
          <span className="text-xs font-mono font-medium">{expiry}</span>
        </div>
      </div>
    </div>
  );
};
