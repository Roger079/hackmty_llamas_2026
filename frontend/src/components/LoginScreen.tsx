import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';
import loginLandscape from '../assets/12ui/login-landscape.png';

interface LoginScreenProps { onLogin: (username: string) => void; }
const REMEMBERED_USER_KEY = 'banorte-remembered-user';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('Ana');
  const [password, setPassword] = useState('••••••••');
  const [rememberUser, setRememberUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_USER_KEY);
    if (remembered) setUsername(remembered);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalUser = username.trim() || 'Ana';
    if (rememberUser) window.localStorage.setItem(REMEMBERED_USER_KEY, finalUser);
    else window.localStorage.removeItem(REMEMBERED_USER_KEY);
    setIsEntering(true);
    window.setTimeout(() => onLogin(finalUser), 250);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 antialiased selection:bg-[#EB0029] selection:text-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative isolate overflow-hidden bg-[#B40028] px-5 pb-24 pt-5 text-white lg:min-h-screen lg:px-[clamp(2rem,5vw,6rem)] lg:py-[clamp(2.5rem,6vw,6rem)]">
        <img src={loginLandscape} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35 mix-blend-screen" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#8C0018] via-[#C7002A]/95 to-[#EB0029]/85" />
        <div className="absolute -bottom-32 -right-20 -z-10 h-80 w-80 rounded-full border border-white/15 bg-white/10" />
        <div className="absolute -left-24 top-1/3 -z-10 h-56 w-56 rounded-full border border-white/10" />

        <div className="mx-auto flex max-w-xl items-center justify-between lg:mx-0">
          <BanorteLogo className="h-5 w-auto" theme="red" />
          <span className="text-[10px] font-bold tracking-wide text-white/85 lg:hidden">Banca Móvil</span>
        </div>

        <div className="mx-auto mt-10 max-w-xl lg:mx-0 lg:mt-[clamp(7rem,17vh,12rem)]">
          <h1 className="max-w-md text-3xl font-black leading-[1.04] tracking-tight lg:text-5xl">Tu dinero, en movimiento.</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-red-50/90 lg:text-base">Todo lo que necesitas para administrar tu banca, en un solo lugar.</p>
        </div>
      </section>

      <main className="relative -mt-16 flex min-h-[calc(100vh-180px)] items-start justify-center px-4 pb-7 lg:mt-0 lg:min-h-screen lg:items-center lg:bg-white lg:px-[clamp(2rem,7vw,8rem)]">
        <div className="w-full max-w-md rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(31,47,68,0.16)] lg:rounded-none lg:border-0 lg:p-0 lg:shadow-none">
          <div className="mb-7">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#EB0029]">Acceso a tu cuenta</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#061D3A]">Iniciar sesión</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Ingresa tus datos para continuar a tu banca.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="user-input" className="mb-1.5 block text-xs font-bold text-slate-700">Usuario</label>
              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                <input id="user-input" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Usuario Banorte" className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal" />
              </div>
            </div>
            <div>
              <label htmlFor="password-input" className="mb-1.5 block text-xs font-bold text-slate-700">Contraseña</label>
              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 transition focus-within:border-[#EB0029] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EB0029]/10">
                <LockKeyhole className="h-4 w-4 shrink-0 text-slate-400" />
                <input id="password-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:text-slate-700 cursor-pointer" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-slate-600">
                <input type="checkbox" checked={rememberUser} onChange={(event) => setRememberUser(event.target.checked)} className="peer sr-only" />
                <span className="grid h-4 w-4 place-items-center rounded-md border border-slate-300 bg-white text-white peer-checked:border-[#EB0029] peer-checked:bg-[#EB0029]">{rememberUser && <Check className="h-3 w-3 stroke-[3]" />}</span>Recordar usuario
              </label>
              <a href="#recuperar" onClick={(event) => event.preventDefault()} className="font-semibold text-[#EB0029] hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" disabled={isEntering} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#EB0029] text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-[#C70023] active:bg-[#A5001C] active:scale-[0.99] disabled:cursor-wait disabled:opacity-75 cursor-pointer">
              {isEntering ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /><span>Iniciando sesión…</span></> : <><span>Entrar a mi Banca</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          <p className="mt-7 border-t border-slate-100 pt-4 text-center text-[10px] leading-relaxed text-slate-400">Grupo Financiero Banorte S.A.B. de C.V. Todos los derechos reservados.</p>
        </div>
      </main>
    </div>
  );
};
