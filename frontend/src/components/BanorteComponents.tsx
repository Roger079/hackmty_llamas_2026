import React, { useState } from 'react';

/**
 * BANORTE UI COMPONENT SYSTEM — REVAMPED HACKATHON KIT
 * Faithful to official Banorte portal and Maya conversational banking widget.
 */

// 1. BANORTE LOGO
export const BanorteLogo: React.FC<{ className?: string; variant?: 'full' | 'icon'; theme?: 'light' | 'dark' }> = ({
  className = "h-7 w-auto",
  variant = 'full',
  theme = 'light'
}) => {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#1C1E21';

  if (variant === 'icon') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className} fill="none">
        <rect width="48" height="48" rx="12" fill="#EB0029" />
        <g fill="#FFFFFF">
          <path d="M12 34 L21 14 L26 14 L17 34 Z" />
          <path d="M20 34 L29 14 L34 14 L25 34 Z" />
          <polygon points="27,14 36,14 32,22 23,22" opacity="0.95" />
        </g>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 44" fill="none" className={className}>
      <g fill="#EB0029">
        <path d="M6 34 L18 10 L25 10 L13 34 Z" />
        <path d="M17 34 L29 10 L36 10 L24 34 Z" />
        <path d="M28 34 L40 10 L47 10 L35 34 Z" />
        <polygon points="39,10 47,10 41,22 33,22" />
      </g>
      <text
        x="56"
        y="28"
        fontFamily="'Montserrat', 'Helvetica Neue', Arial, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="1.5"
        fill={textColor}
      >
        BAN<tspan fill="#EB0029">O</tspan>RTE
      </text>
    </svg>
  );
};

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
            <svg className="h-6 w-auto" viewBox="0 0 240 44" fill="none">
              <g fill="#FFFFFF">
                <path d="M6 34 L18 10 L25 10 L13 34 Z" />
                <path d="M17 34 L29 10 L36 10 L24 34 Z" />
                <path d="M28 34 L40 10 L47 10 L35 34 Z" />
                <polygon points="39,10 47,10 41,22 33,22" />
              </g>
              <text x="56" y="28" fontFamily="'Montserrat', sans-serif" fontSize="22" fontWeight="800" letterSpacing="1.5" fill="#FFFFFF">
                BANORTE
              </text>
            </svg>
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6" fill="none">
        <g fill="#FFFFFF">
          <path d="M12 34 L21 14 L26 14 L17 34 Z" />
          <path d="M20 34 L29 14 L34 14 L25 34 Z" />
          <polygon points="27,14 36,14 32,22 23,22" opacity="0.95" />
        </g>
      </svg>
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

  const quickPills = [
    "¿Qué puedo hacer aquí?",
    "Internacional base pesos",
    "Consultar un estado de cuenta",
    "Transferencias",
    "Momentos de vida"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white text-slate-800 p-2.5 pr-5 rounded-full shadow-2xl border border-slate-200 hover:scale-105 transition-all cursor-pointer"
      >
        <MayaAvatar size="md" />
        <div className="text-left">
          <span className="text-xs font-bold block text-slate-900">Maya Banorte</span>
          <span className="text-[10px] text-slate-500">Asistente Virtual</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 sm:right-8 z-50 w-full max-w-sm bg-[#4A5568] text-white rounded-t-3xl shadow-2xl border border-slate-600 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#3E4651] border-b border-slate-600">
        <div className="flex items-center gap-2">
          <MayaAvatar size="sm" />
          <div>
            <h4 className="text-xs font-bold text-white">Maya — Asistente Virtual</h4>
            <span className="text-[10px] text-emerald-400 font-mono">En Línea</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onExpandToFull && (
            <button onClick={onExpandToFull} className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" title="Pantalla completa">
              ↗
            </button>
          )}
          <button onClick={onToggle} className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition" title="Minimizar">
            –
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
        <div className="flex items-start gap-3">
          <MayaAvatar size="md" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-white leading-snug">
              ¡Hola! Soy Maya, tu asistente virtual. ¡Chatea conmigo!
            </h3>
          </div>
        </div>

        {/* Intent Pills from Screenshot 2 */}
        <div className="space-y-1.5">
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => onSendPrompt && onSendPrompt(pill)}
              className="w-full text-left px-4 py-2 rounded-xl bg-[#64748B]/60 hover:bg-[#64748B] text-white text-xs font-medium transition cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Widget Input Bar */}
      <div className="p-3 bg-[#3E4651] border-t border-slate-600">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escriba algo..."
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs px-3.5 py-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB0029]"
          />
          <button
            onClick={() => {
              if (inputText.trim() && onSendPrompt) {
                onSendPrompt(inputText.trim());
                setInputText('');
              }
            }}
            className="absolute right-2 text-slate-400 hover:text-[#EB0029] p-1 cursor-pointer transition"
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
}> = ({
  holderName = "Ana Martínez",
  last4 = "4582",
  expiry = "12/28",
  balance = 27900.00,
  cardType = "Débito Nómina",
  isGold = false,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const bgGradient = isGold
    ? "from-[#C59B27] via-[#A68018] to-[#6E540C]"
    : "from-[#EB0029] via-[#C70023] to-[#8C0018]";

  return (
    <div className={`relative w-full max-w-sm h-52 rounded-2xl p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br ${bgGradient}`}>
      <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-4 top-4 opacity-20 font-black text-6xl tracking-widest pointer-events-none">
        ///
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-white/80">{cardType}</span>
          <h4 className="text-sm font-extrabold tracking-widest text-white">BANORTE</h4>
        </div>
        <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 border border-amber-600/30 flex items-center justify-center shadow-inner">
          <div className="w-6 h-4 border border-amber-800/40 rounded-[2px]" />
        </div>
      </div>

      <div className="my-3 relative z-10">
        <div className="text-xs text-white/80 flex items-center gap-2">
          <span>Saldo disponible</span>
          <button
            type="button"
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/90 hover:text-white text-xs underline decoration-dotted cursor-pointer"
          >
            {showBalance ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className="text-2xl font-bold tracking-tight tabular-nums mt-0.5">
          {showBalance ? `$ ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` : "••••••••••"}
        </div>
      </div>

      <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/20">
        <div>
          <div className="text-xs font-mono tracking-widest text-white/90">
            •••• •••• •••• {last4}
          </div>
          <div className="text-[11px] uppercase tracking-wider font-medium text-white/80 truncate max-w-[180px]">
            {holderName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-wider text-white/60">Vence</div>
          <div className="text-xs font-mono font-medium">{expiry}</div>
        </div>
      </div>
    </div>
  );
};
