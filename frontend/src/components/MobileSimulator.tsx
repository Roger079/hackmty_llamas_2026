import React, { useState } from 'react';
import {
  Home,
  MessageCircle,
  CreditCard,
  Send,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  WalletCards,
  FileText,
  Cpu,
} from 'lucide-react';
import { ChatStream } from './ChatStream';
import { ActionContext, ChatMessage, McpCallLog } from '../types/a2ui';
import banorteLogo from '../assets/12ui/banorte-logo.png';
import { TransactionItem } from './BanorteGlobalPosition';

interface MobileSimulatorProps {
  clientName: string;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onAction: (actionCtx: ActionContext) => Promise<boolean>;
  onResetDemo?: () => void;
  accounts?: {
    nominaBalance?: number;
    oroBalance?: number;
    totalDebt?: number;
    accountLast4?: string;
    cardLast4?: string;
  };
  transactions?: TransactionItem[];
  hasRestructure?: boolean;
  mcpLogs?: McpCallLog[];
  onOpenInspector?: () => void;
}

type MobileTab = 'home' | 'maya' | 'cards' | 'activity';

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  clientName,
  messages,
  isLoading,
  onSendMessage,
  onAction,
  onResetDemo,
  accounts,
  transactions = [],
  hasRestructure = false,
  mcpLogs = [],
  onOpenInspector,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [showCvv, setShowCvv] = useState(false);

  const nominaBalance = accounts?.nominaBalance ?? 27900.0;
  const platinoDebt = accounts?.totalDebt ?? 0.0;
  const accountLast4 = accounts?.accountLast4 || (clientName.includes('Carlos') ? '7721' : clientName.includes('Silvia') ? '8359' : '4582');
  const cardLast4 = accounts?.cardLast4 || (clientName.includes('Carlos') ? '8812' : '');
  const firstName = clientName.split(' ')[0] || 'Ana';

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col justify-between antialiased pb-16">
      {/* 1. Mobile Header (Clean, Authentic Banorte Red) */}
      <header className="sticky top-0 z-30 bg-[#EB0029] text-white px-4 pt-3 pb-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <img src={banorteLogo} alt="Banorte" className="h-4 w-auto shrink-0 object-contain" />
          <div className="flex items-center gap-2">
            {onOpenInspector && (
              <button
                type="button"
                onClick={onOpenInspector}
                className="inline-flex items-center gap-1 rounded-full bg-black/20 hover:bg-black/30 px-2 py-0.5 text-[10px] font-semibold transition border border-white/20 cursor-pointer"
                title="Abrir telemetría FastMCP"
              >
                <Cpu className="h-3 w-3 text-emerald-300" />
                <span>MCP</span>
                <span className="rounded-full bg-white/25 px-1 py-0.1 text-[9px] font-mono font-bold">
                  {mcpLogs.length}
                </span>
              </button>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              <span>Token</span>
            </span>
            <div className="h-7 w-7 rounded-full bg-white text-[#EB0029] font-black text-xs grid place-items-center shadow-xs">
              {firstName[0] || 'R'}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-red-100 font-medium">Banca Móvil Banorte</p>
            <h1 className="text-base font-extrabold tracking-tight">Hola, {firstName}</h1>
          </div>
          <span className="text-[10px] text-red-100 bg-black/10 px-2 py-0.5 rounded-full">
            Cliente Preferente
          </span>
        </div>
      </header>

      {/* 2. Main Mobile Body Content */}
      <main className="flex-1 px-3.5 py-4 max-w-lg mx-auto w-full">
        {/* TAB 1: HOME (Accounts, Quick Actions, Debt Alert, Movements) */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Account Card */}
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {clientName.includes('Silvia') ? 'Ahorro Patrimonial' : clientName.includes('Carlos') ? 'Ahorro Banorte' : 'Débito Nómina'} • {accountLast4}
                </span>
                <WalletCards className="h-4 w-4 text-[#EB0029]" />
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
                ${nominaBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                <span className="text-xs font-semibold text-slate-500 ml-1">MXN</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-600">Saldo disponible</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('maya');
                    onSendMessage('Transfiere $850 a Sofía Mendoza por SPEI');
                  }}
                  className="text-xs font-bold text-[#EB0029] hover:underline"
                >
                  Transferir SPEI &gt;
                </button>
              </div>
            </div>

            {/* Fast Action Roundels */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-700">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('maya');
                  onSendMessage('Transfiere $850 a Sofía Mendoza por SPEI');
                }}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <Send className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>SPEI</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <CreditCard className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('maya')}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <Sparkles className="h-4 w-4 text-[#EB0029] mb-1" />
                <span>Maya Copiloto</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('maya');
                  onSendMessage('Quiero simular una inversión en Pagaré Banorte');
                }}
                className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition"
              >
                <TrendingUp className="h-4 w-4 text-emerald-600 mb-1" />
                <span>Inversión</span>
              </button>
            </div>

            {/* Credit Card / Status Banner */}
            {platinoDebt > 0 ? (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 text-white shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                      {clientName.includes('Carlos') ? 'Tarjeta Banorte Clásica' : 'Tarjeta Banorte Oro'}
                    </span>
                    <span className="font-mono text-xs text-slate-400">•••• {cardLast4 || '8812'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                    {hasRestructure ? 'Tasa Fija 22.5%' : '64.8% CAT'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Saldo actual exigible</span>
                  <div className="text-xl font-black tabular-nums">
                    ${platinoDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-xs font-semibold">MXN</span>
                  </div>
                </div>

                {hasRestructure ? (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-600/50 p-2.5 text-[11px] text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Convenio activo: Intereses moratorios congelados.</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('maya');
                      onSendMessage('¿Cómo reestructurar mi tarjeta de crédito?');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Reestructurar con Maya</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Cuentas al Corriente
                  </span>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">Sin saldos deudores vencidos</p>
                </div>
                <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                  100% Sano
                </span>
              </div>
            )}

            {/* Recent Activity List */}
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Movimientos Recientes</span>
                <span className="text-[10px] text-slate-400">Auditado SPEI</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {transactions && transactions.length > 0 ? (
                  transactions.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-b-0">
                      <div>
                        <p className="font-bold text-slate-900">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                      <span className={`font-bold tabular-nums ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === 'credit' ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-[11px] text-center py-2">Sin movimientos recientes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MAYA COPILOTO (The Full, Interactive A2UI Chat Experience on Mobile) */}
        {activeTab === 'maya' && (
          <div className="w-full">
            <ChatStream
              messages={messages}
              isLoading={isLoading}
              onSendMessage={onSendMessage}
              onAction={onAction}
              clientName={clientName}
              onResetDemo={onResetDemo}
            />
          </div>
        )}

        {/* TAB 3: TARJETAS (Interactive Digital Card with CVV Dinámico) */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#1C1E21] to-[#343B45] p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {cardLast4 ? (clientName.includes('Carlos') ? 'Tarjeta Digital Clásica' : 'Tarjeta Digital Oro') : 'Tarjeta Digital Enlace Débito'}
                </span>
                <span className="text-xs font-mono font-bold">BANORTE</span>
              </div>

              <div className="font-mono text-lg tracking-widest text-slate-100">
                •••• •••• •••• {cardLast4 || accountLast4}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Titular</span>
                  <span className="font-bold">{clientName}</span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block uppercase">CVV Dinámico</span>
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="font-mono font-black text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    {showCvv ? '842' : '•••'}
                    {showCvv ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2.5 shadow-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Límite de Crédito:</span>
                <span className="font-bold">$80,000.00 MXN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saldo Exigible:</span>
                <span className="font-bold tabular-nums">
                  ${platinoDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha de Corte:</span>
                <span className="font-bold text-[#EB0029]">18 Sep 2026</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('maya');
                onSendMessage('¿Cómo reestructurar mi tarjeta Platino?');
              }}
              className="w-full py-3 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Ver opciones de reestructuración en Maya</span>
            </button>
          </div>
        )}

        {/* TAB 4: MOVIMIENTOS */}
        {activeTab === 'activity' && (
          <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200 space-y-3">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Historial Completo de Movimientos
            </h2>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Depósito Nómina Banorte</p>
                  <p className="text-[10px] text-slate-400">Hoy, 08:30 hrs • SPEI</p>
                </div>
                <span className="font-bold text-emerald-600">+$14,250.00 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Transferencia SPEI a Sofía</p>
                  <p className="text-[10px] text-slate-400">Ayer, 20:15 hrs • BBVA</p>
                </div>
                <span className="font-bold text-slate-900">-$850.00 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Walmart Supercenter</p>
                  <p className="text-[10px] text-slate-400">10 Sep, 17:42 hrs • Platino *4892</p>
                </div>
                <span className="font-bold text-slate-900">-$1,840.50 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Netflix México</p>
                  <p className="text-[10px] text-slate-400">08 Sep, 12:00 hrs • Cargo Automático</p>
                </div>
                <span className="font-bold text-slate-900">-$219.00 MXN</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Native Mobile Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200/90 py-2 px-6 flex justify-around text-[10px] font-bold text-slate-500 z-40 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center cursor-pointer transition ${
            activeTab === 'home' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <Home className="h-4 w-4 mb-0.5" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center cursor-pointer transition ${
            activeTab === 'cards' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <CreditCard className="h-4 w-4 mb-0.5" />
          <span>Tarjetas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('maya')}
          className={`flex flex-col items-center cursor-pointer transition relative ${
            activeTab === 'maya' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <MessageCircle className="h-4 w-4 mb-0.5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#EB0029]" />
          </div>
          <span>Maya</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex flex-col items-center cursor-pointer transition ${
            activeTab === 'activity' ? 'text-[#EB0029]' : 'hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 mb-0.5" />
          <span>Movimientos</span>
        </button>
      </nav>
    </div>
  );
};
