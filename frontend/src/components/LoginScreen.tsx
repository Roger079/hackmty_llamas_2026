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
      {/* 1. Header (Crisp, Institutional Banorte Red) */}
      <header className="sticky top-0 z-30 bg-[#EB0029] text-white px-4 sm:px-8 py-3.5 border-b border-[#C70023]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <BanorteLogo className="h-6 w-auto shrink-0" theme="red" />
            <span className="hidden h-5 w-px bg-white/30 sm:block" />
            <span className="hidden text-xs font-bold uppercase tracking-wider text-white/90 sm:block">
              Banca en Línea
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-white/90">
            <span className="inline-flex items-center gap-1.5 border border-white/30 bg-black/10 px-2.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span>Sitio Seguro</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md space-y-3">
          {/* Main Login Card - Sharp Edges */}
          <div className="bg-white border border-slate-300 shadow-sm p-7 sm:p-9 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                Iniciar Sesión
              </h1>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Ingresa tu usuario y contraseña para acceder a tus cuentas.
              </p>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="user-input" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
                  Usuario
                </label>
                <div className="flex h-11 items-center border border-slate-300 bg-white px-3 transition focus-within:border-[#EB0029] focus-within:ring-1 focus-within:ring-[#EB0029]">
                  <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="user-input"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-input" className="block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Contraseña
                  </label>
                </div>
                <div className="flex h-11 items-center border border-slate-300 bg-white px-3 transition focus-within:border-[#EB0029] focus-within:ring-1 focus-within:ring-[#EB0029]">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="grid h-8 w-8 place-items-center text-slate-400 transition hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberUser}
                    onChange={(event) => setRememberUser(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="grid h-4 w-4 place-items-center border border-slate-400 bg-white text-white peer-checked:border-[#EB0029] peer-checked:bg-[#EB0029]">
                    {rememberUser && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                  Recordar usuario
                </label>

                <a href="#recuperar" onClick={(e) => e.preventDefault()} className="text-xs font-medium text-[#EB0029] hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Submit Button - Sharp, Solid Banorte Red */}
              <button
                type="submit"
                disabled={isEntering}
                className="flex h-11 w-full items-center justify-center gap-2 bg-[#EB0029] hover:bg-[#C70023] text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition cursor-pointer disabled:opacity-75 disabled:cursor-wait"
              >
                {isEntering ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin" />
                    <span>Iniciando sesión…</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security & Regulatory Footnote - Sharp Edges */}
          <div className="bg-white border border-slate-200 p-3 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="h-4 w-4 text-slate-600 shrink-0" />
            <span>Operación protegida bajo estándares de seguridad bancaria CNBV</span>
          </div>
        </div>
      </main>

      {/* 3. Corporate Minimalist Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-[11px] text-slate-500 font-medium">
        Grupo Financiero Banorte S.A.B. de C.V. Todos los derechos reservados.
      </footer>
    </div>
  );
};
