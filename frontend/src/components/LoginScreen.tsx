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
} from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';
import { MayaLogo } from './MayaLogo';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const REMEMBERED_USER_KEY = 'banorte-remembered-user';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Ana');
  const [password, setPassword] = useState('••••••••');
  const [rememberUser, setRememberUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_USER_KEY);
    if (remembered) {
      setUsername(remembered);
      setRememberUser(true);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalUser = username.trim() || 'Ana';

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
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Main Login Card */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            {/* Maya Welcome Badge */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
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
                Ingresa tus credenciales para acceder a tus cuentas Banorte
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
              <div>
                <label htmlFor="user-input" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Usuario
                </label>
                <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50/40 px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="user-input"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Usuario Banorte"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-input" className="block text-xs font-bold text-slate-700">
                    Contraseña
                  </label>
                </div>
                <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50/40 px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Contraseña"
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
                  Recordar usuario
                </label>

                <span className="text-[11px] font-medium text-[#EB0029] hover:underline cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </span>
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
        Grupo Financiero Banorte S.A.B. de C.V. Todos los derechos reservados.
      </footer>
    </div>
  );
};
