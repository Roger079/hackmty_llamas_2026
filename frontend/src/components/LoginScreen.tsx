import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  UserRound,
  Sparkles,
  Wallet,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';
import { MayaLogo } from './MayaLogo';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const REMEMBERED_USER_KEY = 'banorte-demo-remembered-user';

const DEMO_USERS = [
  {
    id: 'C001',
    firstName: 'Ana',
    fullName: 'Ana Martínez',
    product: 'Débito Nómina Banorte',
    balance: '$27,900.00 MXN',
    badge: 'Nómina & SPEI',
    icon: Wallet,
    color: 'border-red-100 hover:border-[#EB0029] bg-white',
    avatarBg: 'bg-red-50 text-[#EB0029]',
  },
  {
    id: 'C002',
    firstName: 'Carlos',
    fullName: 'Carlos Ramírez',
    product: 'Tarjeta Banorte Clásica',
    balance: '$45,200.00 MXN',
    badge: 'Línea de Crédito',
    icon: CreditCard,
    color: 'border-slate-200/80 hover:border-slate-400 bg-white',
    avatarBg: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'C003',
    firstName: 'Silvia',
    fullName: 'Silvia Carrasco Alvarado',
    product: 'Ahorro Patrimonial & Inversión',
    balance: '$116,614.10 MXN',
    badge: 'Patrimonial',
    icon: TrendingUp,
    color: 'border-amber-100 hover:border-amber-400 bg-white',
    avatarBg: 'bg-amber-50 text-amber-700',
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Ana');
  const [password, setPassword] = useState('••••••••');
  const [rememberUser, setRememberUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState<string>('Ana');

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_USER_KEY);
    if (remembered) {
      setUsername(remembered);
      setSelectedDemoUser(remembered);
      setRememberUser(true);
    }
  }, []);

  const handleSelectDemoUser = (name: string) => {
    setSelectedDemoUser(name);
    setUsername(name);
    setPassword('••••••••');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalUser = username.trim() || selectedDemoUser || 'Ana';

    if (rememberUser) {
      window.localStorage.setItem(REMEMBERED_USER_KEY, finalUser);
    } else {
      window.localStorage.removeItem(REMEMBERED_USER_KEY);
    }

    setIsEntering(true);
    window.setTimeout(() => {
      onLogin(finalUser);
    }, 280);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col justify-between antialiased selection:bg-[#EB0029] selection:text-white">
      {/* 1. Mobile Header (Clean, Authentic Banorte Red Identity) */}
      <header className="sticky top-0 z-30 bg-[#EB0029] text-white px-4 sm:px-6 py-3 shadow-md">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-3">
            <BanorteLogo className="h-5 w-auto shrink-0" theme="red" />
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <span className="hidden text-xs font-semibold text-red-100 sm:block">Banca Móvil</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              <span>Token 2FA Activo</span>
            </span>
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5 text-[10px] text-red-100">
              <Smartphone className="h-3 w-3" />
              <span>Banca Digital</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Main Login Card */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-5">
            {/* Maya Welcome Badge */}
            <div className="flex items-center gap-3 pb-1 border-b border-slate-100">
              <MayaLogo size={42} showStatus label="Maya Copiloto" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900">Maya Copiloto</h2>
                  <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.2 text-[9px] font-bold text-[#EB0029]">
                    IA Banorte
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Bienvenido a tu banca móvil inteligente</p>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Iniciar Sesión
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Selecciona uno de los 3 usuarios demo o escribe tu primer nombre:
              </p>
            </div>

            {/* 3 Quick Demo User Buttons */}
            <div className="space-y-2" aria-label="Usuarios Demo de Demostración">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Perfiles de Demo (1 Toque)</span>
                <span className="text-[#EB0029] font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Rápido
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_USERS.map((user) => {
                  const isSelected = selectedDemoUser.toLowerCase() === user.firstName.toLowerCase();
                  const Icon = user.icon;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectDemoUser(user.firstName)}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition cursor-pointer relative ${
                        isSelected
                          ? 'border-[#EB0029] bg-red-50/50 shadow-2xs ring-1 ring-[#EB0029]'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#EB0029] text-white flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                      <div className={`h-7 w-7 rounded-xl flex items-center justify-center mb-2 ${user.avatarBg}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 leading-none">{user.firstName}</span>
                      <span className="text-[10px] text-slate-500 mt-1 font-medium truncate w-full">{user.badge}</span>
                      <span className="text-[10px] font-bold text-slate-700 mt-0.5 tabular-nums truncate w-full">{user.balance}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
              <div>
                <label htmlFor="demo-user" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nombre de usuario
                </label>
                <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50/40 px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="demo-user"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setSelectedDemoUser(event.target.value);
                    }}
                    placeholder="Ana, Carlos o Silvia"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="demo-password" className="block text-xs font-bold text-slate-700">
                    Contraseña
                  </label>
                  <span className="text-[10px] text-emerald-600 font-semibold">Cualquiera funciona</span>
                </div>
                <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50/40 px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="demo-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Escribe lo que gustes..."
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberUser}
                    onChange={(event) => setRememberUser(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="grid h-4 w-4 place-items-center rounded-md border border-slate-300 bg-white text-white peer-checked:border-[#EB0029] peer-checked:bg-[#EB0029]">
                    {rememberUser && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                  Recordar en este equipo
                </label>

                <span className="text-[11px] font-bold text-[#EB0029]">Demo Hackathon</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isEntering}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#EB0029] hover:bg-[#C70023] text-sm font-bold text-white shadow-md shadow-red-500/20 transition cursor-pointer hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-wait"
              >
                {isEntering ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Iniciando sesión segura…</span>
                  </>
                ) : (
                  <>
                    <span>Entrar a mi Banca Banorte</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security & Regulatory Footnote */}
          <div className="rounded-2xl bg-white/70 border border-slate-200/60 p-3.5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Autenticación 2FA conforme a Circular 14/2017 de Banco de México</span>
          </div>
        </div>
      </main>

      {/* 3. Corporate Minimalist Footer */}
      <footer className="py-3 text-center text-[10px] text-slate-400">
        Grupo Financiero Banorte S.A.B. de C.V. · HackMTY 2026
      </footer>
    </div>
  );
};
