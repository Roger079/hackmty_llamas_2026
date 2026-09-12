import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';
import loginLandscape from '../assets/12ui/login-landscape.png';
import { MayaLogo } from './MayaLogo';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const REMEMBERED_USER_KEY = 'banorte-demo-remembered-user';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
    if (!username.trim() || !password.trim()) {
      setError('Escribe cualquier usuario y contraseña para continuar con la demostración.');
      return;
    }

    setError('');
    if (rememberUser) {
      window.localStorage.setItem(REMEMBERED_USER_KEY, username.trim());
    } else {
      window.localStorage.removeItem(REMEMBERED_USER_KEY);
    }
    setIsEntering(true);
    window.setTimeout(() => onLogin(username.trim()), 320);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F2F7FB] text-[#061D3A]">
      <img
        src={loginLandscape}
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] w-full object-cover object-bottom opacity-90"
      />

      <header className="relative z-10 h-16 bg-gradient-to-r from-[#111E2C] to-[#172B3E] text-white shadow-sm md:h-20">
        <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-5">
            <BanorteLogo className="h-6 w-auto sm:h-8" theme="red" />
            <span className="hidden h-9 w-px bg-white/25 sm:block" />
            <span className="hidden text-sm font-bold sm:block">Banca en Línea</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-200 sm:gap-7 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Seguridad
            </span>
            <span className="hidden h-7 w-px bg-white/20 sm:block" />
            <span className="hidden items-center gap-2 sm:inline-flex">
              <Smartphone className="h-4 w-4" />
              Token Móvil
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-[1050px] items-center px-4 py-8 md:min-h-[calc(100svh-80px)] md:px-6 md:py-12">
        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(330px,1.9fr)]">
          <section className="banorte-card p-6 sm:p-9 lg:min-h-[690px] lg:p-12" aria-labelledby="login-title">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <MayaLogo size={42} showStatus label="Maya Copiloto" />
              <div>
                <p className="text-sm font-bold text-[#061D3A]">Maya Copiloto</p>
                <p className="text-xs text-[#6D85A1]">Tu asistente financiero</p>
              </div>
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#617A96]">Bienvenido a</p>
            <h1 id="login-title" className="mt-2 text-3xl font-bold tracking-tight text-[#102B48] sm:text-[36px] sm:leading-tight">
              Banorte Banca en Línea
            </h1>
            <p className="mt-2 text-base text-[#617A96] sm:text-lg">Tu banco, en un solo lugar.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="demo-user" className="mb-2 block text-sm font-bold text-[#123A68]">
                  Usuario
                </label>
                <div className="flex h-14 items-center rounded-xl border border-[#C9D8E6] bg-white px-4 transition focus-within:border-[#E4003B] focus-within:ring-2 focus-within:ring-[#E4003B]/10">
                  <UserRound className="h-5 w-5 shrink-0 text-[#7590AD]" />
                  <input
                    id="demo-user"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-[#061D3A] outline-none placeholder:text-[#8BA0B7]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="demo-password" className="mb-2 block text-sm font-bold text-[#123A68]">
                  Contraseña
                </label>
                <div className="flex h-14 items-center rounded-xl border border-[#C9D8E6] bg-white px-4 transition focus-within:border-[#E4003B] focus-within:ring-2 focus-within:ring-[#E4003B]/10">
                  <LockKeyhole className="h-5 w-5 shrink-0 text-[#7590AD]" />
                  <input
                    id="demo-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-[#061D3A] outline-none placeholder:text-[#8BA0B7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="grid h-10 w-10 place-items-center rounded-lg text-[#617A96] transition hover:bg-slate-100 hover:text-[#061D3A]"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#203956]">
                <input
                  type="checkbox"
                  checked={rememberUser}
                  onChange={(event) => setRememberUser(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="grid h-5 w-5 place-items-center rounded border border-[#8DA5BD] bg-white text-white peer-checked:border-[#E4003B] peer-checked:bg-[#E4003B] peer-focus-visible:ring-2 peer-focus-visible:ring-[#E4003B]/30">
                  {rememberUser && <Check className="h-3.5 w-3.5" />}
                </span>
                Recordar usuario
              </label>

              {error && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isEntering}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#E4003B] to-[#D60035] text-base font-bold text-white shadow-[0_8px_18px_rgba(196,0,48,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(196,0,48,0.26)] disabled:cursor-wait disabled:opacity-70"
              >
                {isEntering ? 'Abriendo tu banca…' : 'Ingresar'}
                {!isEntering && <ArrowRight className="h-5 w-5" />}
              </button>

              <div className="flex gap-3 rounded-xl bg-[#EDF6FF] p-4 text-sm text-[#31577D]">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#1769C2]" />
                <div>
                  <p className="font-bold text-[#164B87]">Solo para demostración</p>
                  <p className="mt-0.5 text-xs leading-5 sm:text-sm">
                    Cualquier usuario y contraseña no vacíos funcionan para ingresar.
                  </p>
                </div>
              </div>
            </form>

            <div className="mt-7 flex items-center gap-4 border-t border-[#DCE7F0] pt-6">
              <ShieldCheck className="h-8 w-8 shrink-0 text-[#5E7E9E]" />
              <div>
                <p className="text-sm font-bold text-[#183A5C]">Tu información está protegida</p>
                <p className="mt-0.5 text-xs text-[#6D85A1]">Demo local: no enviamos ni almacenamos tu contraseña.</p>
              </div>
            </div>
          </section>

          <aside className="banorte-card hidden overflow-hidden lg:flex lg:min-h-[690px] lg:flex-col" aria-label="Presentación de Maya Copiloto">
            <div className="p-10">
              <div className="flex items-center gap-4">
                <MayaLogo size={64} showStatus label="Maya Copiloto" />
                <div>
                  <h2 className="text-2xl font-bold text-[#102B48]">Maya Copiloto</h2>
                  <p className="mt-1 text-base text-[#617A96]">Tu asistente financiero</p>
                </div>
              </div>
              <div className="my-8 h-px bg-[#DCE7F0]" />
              <p className="text-lg leading-7 text-[#526D8A]">
                Hola, soy Maya. Estoy aquí para ayudarte a consultar tus saldos, mover tu dinero y resolver tus dudas, siempre que lo necesites.
              </p>
              <ul className="mt-9 space-y-5 text-sm text-[#526D8A]">
                {['Respuestas claras y confiables', 'Disponible en todo momento', 'Con la seguridad de Banorte'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E5F2FF] text-[#1769C2]">
                      <Check className="h-4 w-4" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto flex min-h-[190px] items-center justify-center bg-gradient-to-t from-[#E8F2FA] to-transparent">
              <MayaLogo size={110} className="bg-transparent opacity-15 grayscale" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
