import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Search, Sparkles, Calendar, Tag, CreditCard, 
  ShoppingBag, Utensils, Home, Zap, Car, Film, 
  Wallet, CheckCircle2, ChevronRight, RefreshCw, AlertCircle 
} from 'lucide-react';
import { 
  fetchTransactionsForDrilldown, 
  TransactionDrilldownItem, 
  DrilldownSummary,
  formatMonthLabel,
  parseMonthString
} from '../utils/transactionDrilldownService';

export interface InteractiveDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  color?: string;
  category?: string;
  date?: string;
  month?: string;
  period?: string;
  targetAmount?: number;
  initialTransactions?: TransactionDrilldownItem[];
  onAskMaya?: (prompt: string) => void;
}

export const InteractiveDrilldownModal: React.FC<InteractiveDrilldownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  color = '#EB0029',
  category,
  date,
  month,
  period,
  targetAmount,
  initialTransactions,
  onAskMaya,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drilldownData, setDrilldownData] = useState<DrilldownSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'CARD' | 'MOBILE_APP'>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionDrilldownItem | null>(null);

  const effectiveMonth = month || parseMonthString(period || date || subtitle || '2026-09');

  // Freeze background page scroll while modal is active so it stays anchored to the current viewport
  useEffect(() => {
    if (!isOpen && !isClosing) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    const originalOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTx(null);
      setSearchQuery('');
      setChannelFilter('all');
      return;
    }

    if (initialTransactions && initialTransactions.length > 0) {
      const total = targetAmount || initialTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
      setDrilldownData({
        title,
        subtitle: subtitle || `${initialTransactions.length} movimientos vinculados`,
        color,
        category,
        date,
        month: effectiveMonth,
        totalAmount: total,
        transactionCount: initialTransactions.length,
        transactions: initialTransactions,
      });
      return;
    }

    setLoading(true);
    fetchTransactionsForDrilldown({
      category: category || title,
      costName: title,
      date,
      month: effectiveMonth,
      period,
      targetAmount,
      color,
    })
      .then((res) => {
        setDrilldownData(res);
      })
      .catch((err) => {
        console.error('[InteractiveDrilldownModal] Error loading drilldown:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, title, category, date, effectiveMonth, period, targetAmount, color, initialTransactions, subtitle]);

  if (!isOpen && !isClosing) return null;
  if (typeof document === 'undefined') return null;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240);
  };

  const getCategoryIcon = (desc: string, cat: string) => {
    const text = `${desc} ${cat}`.toLowerCase();
    if (text.includes('super') || text.includes('costco') || text.includes('soriana') || text.includes('heb') || text.includes('oxxo')) {
      return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
    }
    if (text.includes('restauran') || text.includes('comida') || text.includes('starbucks') || text.includes('uber eats') || text.includes('tim hortons')) {
      return <Utensils className="w-4 h-4 text-amber-600" />;
    }
    if (text.includes('renta') || text.includes('mantenimiento') || text.includes('depa')) {
      return <Home className="w-4 h-4 text-indigo-600" />;
    }
    if (text.includes('cfe') || text.includes('telmex') || text.includes('agua') || text.includes('gas') || text.includes('servicio')) {
      return <Zap className="w-4 h-4 text-cyan-600" />;
    }
    if (text.includes('gasolina') || text.includes('transporte') || text.includes('uber') || text.includes('tag')) {
      return <Car className="w-4 h-4 text-orange-600" />;
    }
    if (text.includes('netflix') || text.includes('spotify') || text.includes('cine') || text.includes('entretenimiento')) {
      return <Film className="w-4 h-4 text-purple-600" />;
    }
    if (text.includes('nomina') || text.includes('bono') || text.includes('ahorro') || text.includes('pagare') || text.includes('ingreso')) {
      return <Wallet className="w-4 h-4 text-[#EB0029]" />;
    }
    return <CreditCard className="w-4 h-4 text-slate-600" />;
  };

  const filteredTransactions = (drilldownData?.transactions || []).filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (channelFilter === 'all') return true;
    return tx.channel === channelFilter;
  });

  const totalFilteredAmount = filteredTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const displayTotal = (searchQuery.trim() !== '' || channelFilter !== 'all')
    ? totalFilteredAmount
    : (targetAmount != null && targetAmount > 0 ? targetAmount : (drilldownData?.totalAmount || totalFilteredAmount));

  const periodName = date || formatMonthLabel(drilldownData?.month || effectiveMonth);

  const quickCategoryPrompts = [
    {
      id: 'opt',
      label: '⚡ Reducir 15%',
      prompt: `Maya, he gastado $${displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN en ${title} durante ${periodName}. Diseña un plan de ahorro para recortar este gasto un 15% el próximo mes.`,
    },
    {
      id: 'hormiga',
      label: '🔎 Auditar Gastos Hormiga',
      prompt: `Maya, analiza mis ${filteredTransactions.length} movimientos de ${title} en ${periodName} ($${displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN). Detecta gastos hormiga recurrentes y cobros duplicados.`,
    },
    {
      id: 'trend',
      label: '📊 Comparar vs Mes Anterior',
      prompt: `Maya, evalúa la tendencia de mi gasto en ${title} de ${periodName} ($${displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN). ¿Cómo se compara con meses anteriores y qué alertas sugieres?`,
    },
    {
      id: 'pagare',
      label: '💰 Invertir en Pagaré',
      prompt: `Maya, si ahorro un 20% de lo que gasto en ${title} ($${Math.round(displayTotal * 0.2).toLocaleString('es-MX')} MXN al mes) e invierto en Pagaré Banorte al 9.8%, ¿cuánto acumularé en 1 año?`,
    },
  ];

  const handleTriggerMaya = (customPrompt?: string) => {
    let promptText = customPrompt;

    if (!promptText) {
      if (selectedTx) {
        promptText = `Maya, analiza mi cargo de $${Math.abs(selectedTx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN en "${selectedTx.description}" del ${selectedTx.date} (${selectedTx.account}). ¿Es un gasto recurrente y cómo puedo optimizarlo o recortarlo?`;
      } else {
        promptText = `Maya, analicemos mi gasto en ${title} correspondiente a ${periodName} ($${displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN). ¿Cómo puedo optimizar este rubro el próximo mes?`;
      }
    }

    if (onAskMaya) {
      onAskMaya(promptText);
    }

    try {
      window.dispatchEvent(
        new CustomEvent('banorte:ask-maya', {
          detail: { 
            prompt: promptText, 
            category: title, 
            amount: displayTotal, 
            month: effectiveMonth,
            transaction: selectedTx ? {
              description: selectedTx.description,
              amount: selectedTx.amount,
              date: selectedTx.date,
              account: selectedTx.account,
              channel: selectedTx.channel
            } : undefined
          },
        })
      );
    } catch {
      // ignore
    }

    handleClose();
  };

  const modalContent = (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity p-0 sm:p-4 touch-none overscroll-none ${
        isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100dvh',
        width: '100vw',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl overflow-hidden rounded-t-[32px] sm:rounded-[28px] bg-white shadow-2xl flex flex-col max-h-[85dvh] border border-slate-100 touch-auto ${
          isClosing ? 'animate-modal-sheet-down' : 'animate-modal-sheet'
        }`}
      >
        {/* iOS Handle Indicator for Mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 pt-3 sm:pt-5 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full ring-4 ring-red-50 flex-shrink-0"
              style={{ backgroundColor: color || '#EB0029' }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Auditoría Mensual Banorte
                </span>
                {date ? (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-[#EB0029]" /> {date}
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-50 text-[#EB0029] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-100">
                    <Calendar className="w-2.5 h-2.5" /> {formatMonthLabel(drilldownData?.month || effectiveMonth)}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#061D3A] tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Cerrar detalle"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metric Overview Card */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-gradient-to-br from-slate-900 via-[#061D3A] to-slate-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
            <div 
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ backgroundColor: color || '#EB0029' }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  {date ? `Gasto Total del ${date}` : `Gasto en ${formatMonthLabel(drilldownData?.month || effectiveMonth)}`}
                </span>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5 tabular-nums">
                  ${displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-bold text-slate-400 ml-1.5">MXN</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-sm">
                  <Tag className="w-3 h-3 text-red-400" />
                  {filteredTransactions.length} movimiento{filteredTransactions.length === 1 ? '' : 's'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {date ? `Auditoría del día` : `Periodo: ${formatMonthLabel(drilldownData?.month || effectiveMonth)}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls: Search & Tabs */}
        <div className="px-6 py-2 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por comercio o concepto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white focus:ring-2 focus:ring-[#EB0029]/20 focus:border-[#EB0029] border border-transparent rounded-xl outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                channelFilter === 'all'
                  ? 'bg-white text-[#061D3A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setChannelFilter('CARD')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                channelFilter === 'CARD'
                  ? 'bg-white text-[#061D3A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setChannelFilter('MOBILE_APP')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                channelFilter === 'MOBILE_APP'
                  ? 'bg-white text-[#061D3A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              SPEI
            </button>
          </div>
        </div>

        {/* Quick Suggestion Prompts for Maya */}
        <div className="px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#EB0029]" />
            Preguntas clave:
          </span>
          {quickCategoryPrompts.map((qp) => (
            <button
              key={qp.id}
              type="button"
              onClick={() => handleTriggerMaya(qp.prompt)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-[#EB0029] hover:border-red-200 border border-transparent text-[11px] font-semibold text-slate-600 transition cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 min-h-[220px] max-h-[380px] chat-scroll">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EB0029]" />
              <span className="text-xs font-medium">Cargando movimientos de {formatMonthLabel(effectiveMonth)}...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No se encontraron movimientos para este periodo</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Prueba restableciendo los filtros o buscando otro comercio.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isSelected = selectedTx?.id === tx.id;
              const isPositive = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(isSelected ? null : tx)}
                  className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'border-[#EB0029] bg-red-50/40 shadow-sm scale-[1.01]'
                      : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/80 hover:scale-[1.008]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200/50">
                        {getCategoryIcon(tx.description, tx.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-[#061D3A] truncate">
                            {tx.description}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 font-semibold rounded bg-slate-100 text-slate-500 uppercase flex-shrink-0">
                            {tx.channel === 'MOBILE_APP' ? 'SPEI' : 'Tarjeta'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 truncate">
                          <span className="font-medium text-slate-600">{tx.date}</span>
                          <span>•</span>
                          <span className="truncate">{tx.account}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-black tabular-nums block ${
                          isPositive ? 'text-emerald-600' : 'text-[#EB0029]'
                        }`}
                      >
                        {isPositive ? '+' : '-'} $
                        {Math.abs(tx.amount).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        {tx.status === 'POSTED' ? 'Aplicado' : tx.status}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-1 pt-2 border-t border-red-200/60 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
                      <span className="text-[10px] font-bold text-red-700 w-full mb-0.5">
                        Consultar a Maya sobre este movimiento:
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerMaya(
                            `Maya, analiza si el cargo de $${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN en "${tx.description}" (${tx.date}) es una suscripción recurrente y qué alternativas tengo para gestionarlo.`
                          );
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-[10px] font-bold text-slate-700 hover:text-[#EB0029] transition shadow-2xs"
                      >
                        🔁 ¿Es cargo recurrente?
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerMaya(
                            `Maya, busca en mi historial todos los pagos realizados a "${tx.description}". ¿Cuánto he pagado en total este año y con qué frecuencia suelo comprar ahí?`
                          );
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-[10px] font-bold text-slate-700 hover:text-[#EB0029] transition shadow-2xs"
                      >
                        📊 Historial con comercio
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerMaya(
                            `Maya, si evito compras como "${tx.description}" ($${Math.abs(tx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN) y las destino a mi ahorro, ¿cuánto acumularé en 6 meses con rendimiento Banorte?`
                          );
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-[10px] font-bold text-slate-700 hover:text-[#EB0029] transition shadow-2xs"
                      >
                        💡 Simular ahorro
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Interactive Maya AI Advisory Footer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-50/90 via-white to-red-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#EB0029] text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              {selectedTx ? (
                <>
                  <p className="text-xs font-bold text-[#061D3A] truncate">
                    Auditar &ldquo;{selectedTx.description}&rdquo; con Maya
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    ${Math.abs(selectedTx.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN · {selectedTx.date} · {selectedTx.account}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-[#061D3A] truncate">
                    ¿Optimizar este gasto de {formatMonthLabel(effectiveMonth)} con Maya?
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    Recibe análisis de patrones, reducción del 15% y proyecciones
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTriggerMaya()}
            className="px-3.5 py-2 rounded-xl bg-[#EB0029] hover:bg-[#C70023] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all flex-shrink-0 cursor-pointer"
          >
            <span>{selectedTx ? 'Preguntar por cargo' : 'Consultar'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default InteractiveDrilldownModal;
