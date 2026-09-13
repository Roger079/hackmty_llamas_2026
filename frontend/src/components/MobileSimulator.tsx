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
          if (currentY > lastScrollYRef.current + 10 && currentY > 40) {
            setIsScrollingDown(true);
          } else if (currentY < lastScrollYRef.current - 10) {
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

  // 1. FULLSCREEN MAYA SCREEN TAKEOVER
  // When activeTab === 'maya', Maya takes over the ENTIRE viewport on iPhone 15 Pro Max
  if (activeTab === 'maya') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col h-full w-full overflow-hidden">
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
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col justify-between antialiased">
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
          <div className="space-y-4">
            {/* Card-first banking area: Perfectly centered swipeable products with NO right-side barrier */}
            <section aria-label="Tus tarjetas" className="relative -mx-4 overflow-hidden py-1">
              <div
                ref={cardRailRef}
                onScroll={updateSelectedCardFromScroll}
                className="card-rail isolate flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-2 scroll-smooth no-scrollbar"
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
                    className={`relative w-[calc(100vw-2.5rem)] max-w-[390px] shrink-0 snap-center text-left transition duration-300 ${
                      selectedCard === index ? 'z-10 scale-100 opacity-100' : 'z-0 scale-[0.96] opacity-75'
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
                  <span
                    key={card.last4}
                    className={`h-1.5 rounded-full transition-all ${
                      selectedCard === index ? 'w-5 bg-[#EB0029]' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* Action rail, separated from the card products. */}
            <div className="border-t border-slate-200/80 pt-3.5">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <Send className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span>Transferir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cards')}
                  className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <CreditCard className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span>Mis tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('maya');
                    onSendMessage('Muéstrame las opciones de mi fondo de inversión');
                  }}
                  className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <Landmark className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span>Inversiones</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('maya');
                    onSendMessage('Quiero simular una inversión en Pagaré Banorte');
                  }}
                  className="flex flex-col items-center rounded-xl bg-white p-2.5 shadow-xs border border-slate-100 hover:bg-slate-50 transition cursor-pointer active:scale-95"
                >
                  <ReceiptText className="h-4 w-4 text-[#EB0029] mb-1" />
                  <span>Pagar servicio</span>
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
        className="fixed bottom-0 inset-x-0 bg-[#EB0029] border-t border-red-600/30 text-white z-40 shadow-[0_-4px_24px_rgba(235,0,41,0.22)] rounded-t-2xl pb-6 pt-2.5 px-6"
      >
        <div className="max-w-[430px] mx-auto flex justify-around items-center">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center min-w-[72px] py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-[#EB0029] shadow-sm font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            <Home className="h-6 w-6 mb-1 shrink-0" />
            <span className="text-xs leading-none">Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex flex-col items-center justify-center min-w-[72px] py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white text-[#EB0029] shadow-sm font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            <CreditCard className="h-6 w-6 mb-1 shrink-0" />
            <span className="text-xs leading-none">Tarjetas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center justify-center min-w-[72px] py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-white text-[#EB0029] shadow-sm font-extrabold'
                : 'text-white/80 hover:text-white hover:bg-white/10 font-bold'
            }`}
          >
            <FileText className="h-6 w-6 mb-1 shrink-0" />
            <span className="text-xs leading-none">Movimientos</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
