import React, { useRef, useState, useEffect } from 'react';
import {
  Home,
  CreditCard,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  ReceiptText,
  BarChart3,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  ChevronDown,
  Zap,
  LayoutDashboard,
} from 'lucide-react';
import { ChatStream } from './ChatStream';
import { ActionContext, ChatMessage, McpCallLog } from '../types/a2ui';
import { BanorteLogo } from './BanorteLogo';
import { BanorteCard, MayaChatWidget } from './BanorteComponents';
import { TransactionItem } from './BanorteGlobalPosition';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';
import {
  MobileWidgetItem,
  loadHomeWidgets,
  subscribeToHomeWidgets,
} from '../utils/homeWidgetsManager';
import { MobileTransferModal } from './MobileTransferModal';
import { MobileBillPayModal } from './MobileBillPayModal';

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
  userId?: string;
  onLogout?: () => void;
  onNavigateDisplay?: () => void;
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
  userId = 'C001',
  onLogout,
  onNavigateDisplay,
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [showCvv, setShowCvv] = useState(false);
  const [isMayaWidgetOpen, setIsMayaWidgetOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);
  const [isRentConfirmationOpen, setIsRentConfirmationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBillPayModalOpen, setIsBillPayModalOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  const cardRailRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  // Scroll listener for dynamic Maya FAB collapse/expansion (iOS / Instagram style)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || document.documentElement.scrollTop;
          const delta = currentY - lastScrollYRef.current;
          if (delta > 15 && currentY > 50) {
            setIsScrollingDown(true);
          } else if (delta < -15 || currentY < 30) {
            setIsScrollingDown(false);
          }
          lastScrollYRef.current = Math.max(0, currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Home Screen Widgets (Managed exclusively via Maya Chatbot, persistent by userId)
  const [homeWidgets, setHomeWidgets] = useState<MobileWidgetItem[]>(() => loadHomeWidgets(userId));

  useEffect(() => {
    setHomeWidgets(loadHomeWidgets(userId));
    const unsubscribe = subscribeToHomeWidgets(userId, (updated) => {
      setHomeWidgets(updated);
    });
    return unsubscribe;
  }, [userId]);

  // Global listener for interactive widgets dispatching banorte:ask-maya
  useEffect(() => {
    const handleAskMayaEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      const prompt = customEvent.detail?.prompt;
      if (prompt) {
        setActiveTab('maya');
        onSendMessage(prompt);
      }
    };
    window.addEventListener('banorte:ask-maya', handleAskMayaEvent);
    return () => window.removeEventListener('banorte:ask-maya', handleAskMayaEvent);
  }, [onSendMessage]);

  const nominaBalance = accounts?.nominaBalance ?? 27900.0;
  const platinoDebt = accounts?.totalDebt ?? 0.0;
  const accountLast4 = accounts?.accountLast4 || (clientName.includes('Carlos') ? '7721' : clientName.includes('Silvia') ? '8359' : '4582');
  const cardLast4 = accounts?.cardLast4 || (clientName.includes('Carlos') ? '8812' : '9274');
  const firstName = clientName.split(' ')[0] || 'Ana';
  const mobileCards = [
    { cardType: clientName.includes('Silvia') ? 'Débito Patrimonial' : 'Débito Nómina', last4: accountLast4, balance: nominaBalance, isGold: false },
    { cardType: 'Tarjeta Digital', last4: cardLast4, balance: Math.max(0, 80000 - platinoDebt), isGold: false },
    { cardType: 'Tarjeta Oro', last4: clientName.includes('Carlos') ? '1436' : '6648', balance: 45200, isGold: true },
  ];

  const selectMobileCard = (index: number) => {
    setSelectedCard(index);
    const card = cardRailRef.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const updateSelectedCardFromScroll = () => {
    const rail = cardRailRef.current;
    if (!rail) return;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    const closestIndex = Array.from(rail.children).reduce((bestIndex, child, index) => {
      const best = rail.children[bestIndex] as HTMLElement;
      const current = child as HTMLElement;
      return Math.abs(current.offsetLeft + current.offsetWidth / 2 - center) < Math.abs(best.offsetLeft + best.offsetWidth / 2 - center)
        ? index
        : bestIndex;
    }, 0);
    setSelectedCard(closestIndex);
  };



  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col justify-between antialiased relative">
      {/* Red Canvas Bleed behind & above the banner for native iOS app feel */}
      <div className="absolute -top-[100vh] inset-x-0 h-[100vh] bg-[#EB0029] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-64 bg-[#EB0029] -z-10 pointer-events-none" />

      {/* 1. Mobile Header (Clean, Authentic Banorte Red) */}
      <header className="sticky top-0 z-30 bg-[#EB0029] text-white px-4 pt-3.5 pb-3.5 shadow-sm">
        <div className="max-w-[430px] mx-auto flex items-center justify-between">
          <BanorteLogo className="h-4 w-auto shrink-0" theme="red" />

          {/* User Profile Avatar with Dropdown Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              className="h-8 w-8 rounded-full bg-white text-[#EB0029] font-black text-xs grid place-items-center shadow-xs cursor-pointer hover:ring-2 hover:ring-white/60 transition active:scale-95"
              aria-label="Abrir menú de usuario"
              aria-expanded={isProfileMenuOpen}
            >
              {firstName[0] || 'R'}
            </button>

            {/* Profile Dropdown Popover */}
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-50 w-64 overflow-hidden rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-[#EB0029] p-3.5 text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-white text-[#EB0029] font-black text-sm grid place-items-center shadow-xs shrink-0">
                        {firstName[0] || 'R'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black">{clientName}</p>
                        <p className="text-[10px] text-red-100 font-medium">Cliente Preferente</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-red-100 font-mono">
                      No. Cliente: {userId} • Cuenta: •••• {accountLast4}
                    </p>
                  </div>

                  <div className="p-1.5 divide-y divide-slate-100 text-xs">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveTab('home');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition cursor-pointer font-medium text-slate-700"
                      >
                        <User className="h-4 w-4 text-slate-500" />
                        <span>Mi Perfil Banorte</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsTransferModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition cursor-pointer font-medium text-slate-700"
                      >
                        <Send className="h-4 w-4 text-slate-500" />
                        <span>Transferencias SPEI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveTab('maya');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition cursor-pointer font-medium text-slate-700"
                      >
                        <Sparkles className="h-4 w-4 text-[#EB0029]" />
                        <span>Chatear con Maya</span>
                      </button>
                      {onNavigateDisplay && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onNavigateDisplay();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-50 transition cursor-pointer font-medium text-slate-700"
                        >
                          <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          <span>Abrir Dashboard Desktop</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onLogout) {
                            onLogout();
                          } else {
                            window.location.reload();
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-red-50 text-[#EB0029] transition cursor-pointer font-bold"
                      >
                        <LogOut className="h-4 w-4 text-[#EB0029]" />
                        <span>Salir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[430px] mx-auto mt-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-red-100 font-medium">Banca Móvil Banorte</p>
            <h1 className="text-base font-extrabold tracking-tight">Hola, {firstName}</h1>
          </div>
          <span className="text-[10px] text-red-100 bg-black/10 px-2 py-0.5 rounded-full font-semibold">
            Cliente Preferente
          </span>
        </div>
      </header>

      {/* 2. Main Mobile Body Content (Optimized for iPhone 15 Pro Max: max-w-[430px]) */}
      <main className="flex-1 px-4 py-4 max-w-[430px] mx-auto w-full pb-28">
        {/* TAB 1: HOME (Accounts, Quick Actions, Debt Alert, Movements) */}
        {activeTab === 'home' && (
          <div key="tab-home" className="space-y-4 animate-tab-view">
            {/* Card-first banking area: Perfectly centered swipeable products with NO right-side barrier */}
            <section aria-label="Tus tarjetas" className="relative -mx-4 overflow-hidden py-1">
              <div
                ref={cardRailRef}
                onScroll={updateSelectedCardFromScroll}
                className="card-rail isolate flex snap-x snap-mandatory gap-3.5 overflow-x-auto py-2 scroll-smooth no-scrollbar"
                style={{
                  paddingLeft: 'calc((100% - min(348px, calc(100vw - 2.5rem))) / 2)',
                  paddingRight: 'calc((100% - min(348px, calc(100vw - 2.5rem))) / 2)',
                  scrollPaddingLeft: 'calc((100% - min(348px, calc(100vw - 2.5rem))) / 2)',
                  scrollPaddingRight: 'calc((100% - min(348px, calc(100vw - 2.5rem))) / 2)',
                }}
              >
                {mobileCards.map((card, index) => (
                  <div
                    key={`${card.cardType}-${card.last4}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectMobileCard(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectMobileCard(index);
                      }
                    }}
                    className={`relative w-[min(348px,calc(100vw-2.5rem))] shrink-0 snap-center text-left transition-all duration-300 ${
                      selectedCard === index ? 'z-10 scale-100 opacity-100' : 'z-0 scale-[0.95] opacity-75'
                    }`}
                    aria-pressed={selectedCard === index}
                  >
                    <BanorteCard
                      size="large"
                      holderName={clientName}
                      last4={card.last4}
                      balance={card.balance}
                      cardType={card.cardType}
                      isGold={card.isGold}
                      className={selectedCard === index ? 'shadow-md ring-1 ring-black/[0.04]' : 'shadow-none'}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 mt-1 text-[10px] font-semibold text-slate-500">
                <span>Desliza para ver tus tarjetas</span>
                <span className="text-[#EB0029] font-bold">{selectedCard + 1} de {mobileCards.length}</span>
              </div>
              <div className="mt-1.5 flex justify-center gap-1.5" aria-label="Selector de tarjeta">
                {mobileCards.map((card, index) => (
                  <button
                    key={card.last4}
                    type="button"
                    onClick={() => selectMobileCard(index)}
                    aria-label={`Seleccionar tarjeta ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      selectedCard === index ? 'w-5 bg-[#EB0029]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Action rail, separated from the card products. */}
            <div className="border-t border-slate-200/80 pt-3.5">
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex flex-col items-center rounded-xl bg-white p-2 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <Send className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span className="truncate w-full">Transferir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBillPayModalOpen(true)}
                  className="flex flex-col items-center rounded-xl bg-white p-2 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <Zap className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span className="truncate w-full">Servicios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cards')}
                  className="flex flex-col items-center rounded-xl bg-white p-2 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <CreditCard className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span className="truncate w-full">Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('maya');
                    onSendMessage('Muéstrame las opciones de mi fondo de inversión');
                  }}
                  className="flex flex-col items-center rounded-xl bg-white p-2 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <Landmark className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span className="truncate w-full">Inversión</span>
                </button>
              </div>
            </div>

            {/* Adaptive widgets: dynamic home screen widgets managed exclusively by Maya */}
            <section className="space-y-3" aria-label="Widgets para ti">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Para ti</h2>
                  <p className="text-[10px] text-slate-500">
                    Acciones frecuentes y vistas fijadas por Maya
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[10px] font-bold text-[#EB0029]">
                    <Sparkles className="h-3 w-3 text-[#EB0029]" />
                    <span>Maya</span>
                  </span>
                </div>
              </div>

              {/* Widgets Grid */}
              <div className="grid grid-cols-2 gap-3">
                {homeWidgets.map((widget) => {
                  const isFullWidth =
                    widget.colSpan === 2 || (widget.builtInKey === 'rent_payment' && isRentConfirmationOpen);

                  return (
                    <div
                      key={widget.id}
                      className={`${isFullWidth ? 'col-span-2' : 'col-span-1'} transition-all duration-200`}
                    >
                      {/* Built-in: Weekly Spending */}
                      {widget.type === 'built_in' && widget.builtInKey === 'weekly_spending' && (
                        <article className="min-h-[224px] overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xs">
                          <div className="flex items-center justify-between bg-[#EB0029] px-3 py-2 text-white">
                            <div>
                              <p className="text-[10px] font-extrabold">{widget.title}</p>
                              <p className="text-[9px] text-red-100">{widget.subtitle || 'Tendencia de los últimos 7 días'}</p>
                            </div>
                            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold">-10.4%</span>
                          </div>
                          <div className="p-3.5">
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500">Total semanal</p>
                                <p className="text-xl font-black tabular-nums text-slate-900">
                                  $4,280 <span className="text-[10px] font-bold text-slate-500">MXN</span>
                                </p>
                              </div>
                              <span className="rounded-full bg-[#FFF3D1] px-2 py-1 text-[10px] font-bold text-[#8A5B00]">
                                vs. semana previa
                              </span>
                            </div>
                            <svg
                              viewBox="0 0 292 120"
                              className="mt-3 h-28 w-full overflow-visible"
                              role="img"
                              aria-label="Tendencia semanal de gastos a la baja"
                            >
                              <defs>
                                <linearGradient id="spending-fill" x1="0" x2="0" y1="0" y2="1">
                                  <stop stopColor="#EB0029" stopOpacity="0.25" />
                                  <stop offset="1" stopColor="#EB0029" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M8 96 L8 70 L54 52 L100 76 L146 24 L192 56 L238 82 L284 42 L284 96 Z"
                                fill="url(#spending-fill)"
                              />
                              <path
                                d="M8 70 L54 52 L100 76 L146 24 L192 56 L238 82 L284 42"
                                fill="none"
                                stroke="#EB0029"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {[
                                ['L', 8, 70],
                                ['M', 54, 52],
                                ['M', 100, 76],
                                ['J', 146, 24],
                                ['V', 192, 56],
                                ['S', 238, 82],
                                ['D', 284, 42],
                              ].map(([label, cx, cy], labelIdx) => (
                                <g key={`${label}-${labelIdx}`}>
                                  <circle
                                    cx={cx as number}
                                    cy={cy as number}
                                    r="3"
                                    fill="white"
                                    stroke="#EB0029"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={cx as number}
                                    y="114"
                                    textAnchor="middle"
                                    fill="#64748B"
                                    fontSize="9"
                                    fontWeight="700"
                                  >
                                    {label}
                                  </text>
                                </g>
                              ))}
                              <circle cx="284" cy="42" r="5" fill="#C89319" stroke="white" strokeWidth="3" />
                            </svg>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('maya');
                                onSendMessage('Maya, analicemos mi gasto semanal de $4,280 MXN (-10.4% vs semana previa). ¿En qué rubros gasté más y cuál es mi proyección de cierre de mes?');
                              }}
                              className="w-full mt-2.5 py-1.5 px-2 bg-red-50 hover:bg-red-100 text-[#EB0029] rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition border border-red-100 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Auditar semana con Maya</span>
                            </button>
                          </div>
                        </article>
                      )}

                      {/* Built-in: Rent Recurring Payment */}
                      {widget.type === 'built_in' && widget.builtInKey === 'rent_payment' && (
                        <div
                          className={`overflow-hidden rounded-2xl border border-red-100 bg-white text-left shadow-xs transition hover:border-[#EB0029] ${
                            isRentConfirmationOpen ? 'col-span-2' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setIsRentConfirmationOpen((open) => !open)}
                            className="w-full text-left cursor-pointer"
                          >
                            <div className="flex items-center justify-between bg-[#EB0029] px-3 py-2 text-white">
                              <span className="text-[10px] font-bold">{widget.title}</span>
                              <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold">Mensual</span>
                            </div>
                            <div className="p-3">
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-[#EB0029]">
                                <ReceiptText className="h-4 w-4" />
                              </div>
                              <p className="mt-2 text-xs font-extrabold text-slate-900">Renta</p>
                              <p className="mt-0.5 text-[10px] leading-snug text-slate-500">$12,800 MXN · día 15</p>
                              <span className="mt-2 inline-block text-[10px] font-bold text-[#EB0029]">
                                {isRentConfirmationOpen ? 'Revisar pago' : 'Pagar ahora'}{' '}
                                <ChevronRight className="inline h-3 w-3" />
                              </span>
                            </div>
                          </button>
                          {isRentConfirmationOpen && (
                            <div className="border-t border-red-100 bg-red-50 p-3">
                              <p className="mb-2 text-[10px] font-medium text-[#8C0018]">
                                Confirma monto y destinatario antes de continuar.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('maya');
                                  onSendMessage('Quiero confirmar el pago de mi renta por $12,800 MXN');
                                }}
                                className="w-full rounded-lg bg-[#EB0029] py-2 text-xs font-bold text-white cursor-pointer"
                              >
                                Confirmar pago con Maya
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Built-in: Investment Quick Card */}
                      {widget.type === 'built_in' && widget.builtInKey === 'investment_quick' && (
                        <article className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xs">
                          <div className="bg-[#EB0029] px-3 py-2 text-white">
                            <p className="text-[10px] font-extrabold">{widget.title}</p>
                          </div>
                          <div className="p-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0F4] text-[#EB0029]">
                              <BarChart3 className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-xs font-extrabold text-slate-900">Mi inversión</p>
                            <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                              {widget.subtitle || 'Rendimiento al día'}
                            </p>
                            <p className="mt-2 text-sm font-black text-[#8A5B00]">+6.8%</p>
                          </div>
                        </article>
                      )}

                      {/* A2UI Dynamic Registered Components */}
                      {widget.type === 'a2ui' && widget.payload && (
                        <div className="overflow-hidden rounded-2xl">
                          <DynamicA2UIRegistry payload={widget.payload} onAction={onAction} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Empty state when all widgets are removed */}
              {homeWidgets.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 text-center space-y-3 shadow-xs">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-[#EB0029]">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Sin widgets en pantalla principal</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Pídele a Maya en el chat que agregue o personalice tus widgets de inicio.</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('maya');
                        onSendMessage('Maya, agrega el widget de gastos y mi inversión a la pantalla de inicio');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#EB0029] hover:bg-[#C70023] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Pedir a Maya</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

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

        {/* TAB 3: TARJETAS (All cards that appear on the initial page) */}
        {activeTab === 'cards' && (
          <div key="tab-cards" className="space-y-6 animate-tab-view">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Mis Tarjetas Banorte</h2>
                <p className="text-[11px] text-slate-500">
                  {mobileCards.length} tarjetas activas asociadas a tu cuenta
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                Todas Activas
              </span>
            </div>

            {/* List of All Cards that appear on initial page */}
            <div className="space-y-5">
              {mobileCards.map((card, idx) => {
                const cvvs = ['714', '842', '390'];
                return (
                  <div key={`${card.cardType}-${card.last4}`} className="space-y-2">
                    <BanorteCard
                      size="large"
                      holderName={clientName}
                      last4={card.last4}
                      balance={card.balance}
                      cardType={card.cardType}
                      isGold={card.isGold}
                      className="shadow-md"
                    />

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 text-[11px] block">{card.cardType}</span>
                          <span className="text-[10px] text-slate-400 font-mono">•••• {card.last4}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">CVV Dinámico:</span>
                          <button
                            type="button"
                            onClick={() => setShowCvv((prev) => !prev)}
                            className="font-mono font-black text-[#EB0029] flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                          >
                            {showCvv ? cvvs[idx] : '•••'}
                            {showCvv ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                        <span>Vigencia: 12/28</span>
                        <span>Límite: ${card.isGold ? '120,000' : '80,000'} MXN</span>
                        <span className="text-emerald-600 font-bold">Activa</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {platinoDebt > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('maya');
                  onSendMessage('¿Cómo reestructurar mi tarjeta de crédito?');
                }}
                className="w-full py-3 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Ver opciones de reestructuración en Maya</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 4: MOVIMIENTOS */}
        {activeTab === 'activity' && (
          <div key="tab-activity" className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200 space-y-3 animate-tab-view">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Historial Completo de Movimientos
            </h2>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Depósito Nómina Banorte</p>
                  <p className="text-[10px] text-slate-400">Hoy, 08:30 hrs • SPEI</p>
                </div>
                <span className="font-bold text-emerald-600">+${nominaBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Walmart Supercenter</p>
                  <p className="text-[10px] text-slate-400">Ayer, 18:45 hrs • Compra T. Débito</p>
                </div>
                <span className="font-bold text-slate-900">-$2,500.00 MXN</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Starbucks Galerías</p>
                  <p className="text-[10px] text-slate-400">10 Sep, 11:20 hrs • Compra T. Crédito</p>
                </div>
                <span className="font-bold text-slate-900">-$145.00 MXN</span>
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

      {/* SPEI Transfer Modal */}
      <MobileTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        availableBalance={nominaBalance}
        onExecuteTransfer={(transfer) => {
          onSendMessage(
            `Transfiere $${transfer.amount} a ${transfer.recipient} por SPEI (${transfer.bank} • ${transfer.clabeOrCard}) con concepto: ${transfer.concept}`
          );
        }}
      />

      {/* Services Bill Payment Modal */}
      <MobileBillPayModal
        isOpen={isBillPayModalOpen}
        onClose={() => setIsBillPayModalOpen(false)}
        availableBalance={nominaBalance}
        onExecutePayment={(payment) => {
          onSendMessage(
            `Pagué el servicio de ${payment.serviceName} por $${payment.amount} MXN (Referencia: ${payment.reference}, Folio: ${payment.folio}).`
          );
        }}
        onOpenMayaChat={(msg) => {
          setIsBillPayModalOpen(false);
          setActiveTab('maya');
          onSendMessage(msg);
        }}
      />

      {/* Scroll-Reactive Maya Floating Action Button */}
      <MayaChatWidget
        isOpen={isMayaWidgetOpen}
        isCompact={isScrollingDown}
        onToggle={() => setIsMayaWidgetOpen((open) => !open)}
        onSendPrompt={onSendMessage}
        onExpandToFull={() => {
          setIsMayaWidgetOpen(false);
          setActiveTab('maya');
        }}
      />

      {/* 3. Bottom Native Mobile Navigation Bar - Authentic Banorte Red Banner */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 inset-x-0 bg-[#EB0029] border-t border-red-600/30 text-white z-40 shadow-[0_-4px_24px_rgba(235,0,41,0.22)] rounded-t-2xl"
      >
        <div className="max-w-[430px] mx-auto grid grid-cols-3 items-center px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-all group"
          >
            <div
              className={`flex flex-col items-center justify-center w-[96px] py-1.5 px-2 rounded-xl transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-white text-[#EB0029] shadow-sm font-black scale-105'
                  : 'text-white/80 group-hover:text-white font-medium hover:bg-white/10'
              }`}
            >
              <Home className="h-6 w-6 mb-0.5 shrink-0" />
              <span className="text-[11px] leading-tight tracking-tight">Inicio</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className="flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-all group"
          >
            <div
              className={`flex flex-col items-center justify-center w-[96px] py-1.5 px-2 rounded-xl transition-all duration-200 ${
                activeTab === 'cards'
                  ? 'bg-white text-[#EB0029] shadow-sm font-black scale-105'
                  : 'text-white/80 group-hover:text-white font-medium hover:bg-white/10'
              }`}
            >
              <CreditCard className="h-6 w-6 mb-0.5 shrink-0" />
              <span className="text-[11px] leading-tight tracking-tight">Tarjetas</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className="flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-all group"
          >
            <div
              className={`flex flex-col items-center justify-center w-[96px] py-1.5 px-2 rounded-xl transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-white text-[#EB0029] shadow-sm font-black scale-105'
                  : 'text-white/80 group-hover:text-white font-medium hover:bg-white/10'
              }`}
            >
              <FileText className="h-6 w-6 mb-0.5 shrink-0" />
              <span className="text-[11px] leading-tight tracking-tight">Movimientos</span>
            </div>
          </button>
        </div>
      </nav>

      {/* 4. Fullscreen Maya Chat Screen Takeover with Smooth Slide-Up & Retraction Exit */}
      <div
        className={`fixed inset-0 z-50 bg-white flex flex-col h-full w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          activeTab === 'maya'
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <ChatStream
          className="flex-1 w-full flex flex-col h-full overflow-hidden"
          messages={messages}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onAction={onAction}
          clientName={clientName}
          onResetDemo={onResetDemo}
          userId={userId}
          onMinimize={() => setActiveTab('home')}
        />
      </div>
    </div>
  );
};
