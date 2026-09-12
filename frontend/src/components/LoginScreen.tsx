import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';

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
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col justify-between antialiased selection:bg-[#EB0029] selection:text-white">
      {/* 1. Mobile Header (Matches MobileSimulator Top Bar Exactly) */}
      <header className="sticky top-0 z-30 bg-[#EB0029] text-white px-4 pt-3 pb-3.5 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <BanorteLogo className="h-4 w-auto shrink-0" theme="red" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                <ShieldCheck className="h-3 w-3 text-emerald-300" />
                <span>Token 2FA</span>
              </span>
              <div className="h-7 w-7 rounded-full bg-white text-[#EB0029] font-black text-xs grid place-items-center shadow-xs">
                B
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-red-100 font-medium">Banca Móvil Banorte</p>
              <h1 className="text-base font-extrabold tracking-tight">Iniciar Sesión</h1>
            </div>
            <span className="text-[10px] text-red-100 bg-black/10 px-2 py-0.5 rounded-full">
              Acceso Seguro
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center px-3.5 py-6 max-w-md mx-auto w-full">
        <div className="w-full space-y-4">
          {/* Main Login Card - rounded-2xl matching app cards */}
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Bienvenido a Banorte
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Ingresa tus credenciales para acceder a tus cuentas
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="user-input" className="mb-1.5 block text-xs font-bold text-slate-700">
                  Usuario
                </label>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="user-input"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Usuario Banorte"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-input" className="block text-xs font-bold text-slate-700">
                    Contraseña
                  </label>
                </div>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Contraseña"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
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

              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-slate-600">
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

                <a href="#recuperar" onClick={(e) => e.preventDefault()} className="text-xs font-semibold text-[#EB0029] hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button - rounded-xl matching app quick action buttons */}
              <button
                type="submit"
                disabled={isEntering}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-sm font-bold text-white shadow-sm shadow-red-500/15 transition cursor-pointer active:scale-[0.99] disabled:opacity-75 disabled:cursor-wait"
              >
                {isEntering ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Iniciando sesión…</span>
                  </>
                ) : (
                  <>
                    <span>Entrar a mi Banca</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security & Regulatory Footnote - rounded-xl */}
          <div className="rounded-xl bg-white/80 border border-slate-200/80 p-3 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Operación protegida bajo estándares CNBV y Circular 14/2017</span>
          </div>
        </div>
      </main>

      {/* 3. Corporate Minimalist Footer */}
      <footer className="py-4 text-center text-[10px] text-slate-400 font-medium flex flex-col items-center gap-1.5">
        <span>Grupo Financiero Banorte S.A.B. de C.V. Todos los derechos reservados.</span>
        <a
          href="/notebook"
          className="text-slate-400 hover:text-slate-600 underline font-mono text-[10px]"
        >
          [A2UI Component Notebook & Debugger]
        </a>
      </footer>
    </div>
  );
};
