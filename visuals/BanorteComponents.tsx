import React, { useState } from 'react';

/**
 * BANORTE UI COMPONENTS - HACKATHON KIT
 * Pre-built, accessible and brand-compliant React components styled with Tailwind CSS.
 */

// 1. BANORTE LOGO
interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark';
}

export const BanorteLogo: React.FC<LogoProps> = ({ 
  className = "h-8 w-auto", 
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

// 2. BANORTE BUTTON
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  isLoading?: boolean;
}

export const BanorteButton: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "text-white bg-[#EB0029] hover:bg-[#C70023] active:bg-[#9E001B] shadow-lg shadow-red-500/25",
    secondary: "text-[#EB0029] bg-white border-2 border-[#EB0029] hover:bg-red-50 active:bg-red-100",
    ghost: "text-[#4A515E] hover:bg-slate-100 active:bg-slate-200",
    gold: "text-white bg-gradient-to-r from-[#C59B27] to-[#A98218] hover:brightness-105 shadow-lg shadow-amber-600/25"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};

// 3. BANORTE CARD MOCKUP
interface CardMockupProps {
  holderName?: string;
  last4?: string;
  expiry?: string;
  balance?: number;
  cardType?: string;
  isGold?: boolean;
}

export const BanorteCard: React.FC<CardMockupProps> = ({
  holderName = "MARIANA LOPEZ RIVERA",
  last4 = "8842",
  expiry = "08/29",
  balance = 48250.75,
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
      <div className="absolute right-4 top-4 opacity-15 font-black text-6xl tracking-widest pointer-events-none">
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
            className="text-white/90 hover:text-white text-xs underline decoration-dotted"
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

// 4. SPEI RECEIPT
interface ReceiptProps {
  amount: number;
  beneficiary: string;
  bank: string;
  clabe: string;
  trackingKey: string;
  date?: string;
  onShare?: () => void;
  onDownload?: () => void;
}

export const SpeiReceipt: React.FC<ReceiptProps> = ({
  amount,
  beneficiary,
  bank,
  clabe,
  trackingKey,
  date = "11 Sep 2026, 14:35 hrs",
  onShare,
  onDownload,
}) => (
  <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
    <div className="bg-[#008744] px-6 py-4 text-white flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">✓</div>
      <div>
        <h3 className="text-sm font-bold tracking-wide uppercase">Transferencia Exitosa</h3>
        <p className="text-xs text-white/90">Envío confirmado por SPEI</p>
      </div>
    </div>

    <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monto enviado</span>
      <div className="text-3xl font-extrabold text-[#1C1E21] mt-1 tabular-nums">
        $ {amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-sm font-medium text-slate-500">MXN</span>
      </div>
    </div>

    <div className="p-6 space-y-3.5 text-sm">
      <div className="flex justify-between items-start gap-4">
        <span className="text-slate-500">Destinatario</span>
        <span className="font-semibold text-slate-800 text-right">{beneficiary}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Banco Receptor</span>
        <span className="font-semibold text-slate-800">{bank}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Cuenta CLABE</span>
        <span className="font-mono text-xs text-slate-800 tracking-wider">{clabe}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Clave de Rastreo</span>
        <span className="font-mono text-xs text-slate-800 tracking-tight">{trackingKey}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500">Fecha y Hora</span>
        <span className="text-slate-700 text-xs">{date}</span>
      </div>
    </div>

    <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
      <button 
        type="button"
        onClick={onDownload}
        className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
      >
        Descargar Comprobante
      </button>
      <button 
        type="button"
        onClick={onShare}
        className="flex-1 py-2.5 rounded-xl bg-[#EB0029] font-semibold text-xs text-white hover:bg-[#C70023] cursor-pointer transition-colors"
      >
        Compartir
      </button>
    </div>
  </div>
);
