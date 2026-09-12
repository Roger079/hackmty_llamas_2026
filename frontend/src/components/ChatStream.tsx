import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage, ActionContext } from '../types/a2ui';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';

interface ChatStreamProps {
  messages: ChatMessage[];
  isLoading: boolean;
  liveStatus?: string;
  onSendMessage: (text: string) => void;
  onAction: (actionCtx: ActionContext) => void;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  isLoading,
  liveStatus,
  onSendMessage,
  onAction,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    { label: "💳 Reestructurar deuda", prompt: "Tengo una deuda en mi tarjeta de crédito Banorte y quiero ver opciones de reestructuración." },
    { label: "💰 Consultar saldos", prompt: "¿Cuánto saldo disponible tengo en mis cuentas?" },
    { label: "⚡ SPEI $850 a Sofía", prompt: "Transfiere $850 a Sofía Mendoza para la cena." },
    { label: "📈 Simular Pagaré", prompt: "Quiero invertir $25,000 en Pagaré Banorte." }
  ];

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EB0029] to-[#FF4D6D] flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Maya — Asistente Bancario Banorte</h3>
              <span className="text-[10px] bg-red-900/40 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-medium">
                A2UI Gen
              </span>
            </div>
            <p className="text-xs text-slate-400">Impulsado por Model Context Protocol (MCP) y A2UI</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[#EB0029] flex items-center justify-center text-white shrink-0 text-xs font-bold shadow-md shadow-red-600/30">
                M
              </div>
            )}

            <div className={`max-w-xl space-y-2.5 ${msg.role === 'user' ? 'w-auto' : 'flex-1'}`}>
              {msg.content && (
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#EB0029] text-white rounded-tr-none shadow-md shadow-red-900/20 font-medium'
                      : 'bg-slate-800/95 border border-slate-700/80 rounded-tl-none text-slate-200 shadow-lg'
                  }`}
                >
                  {msg.content}
                </div>
              )}

              {/* Dynamic A2UI Component Render */}
              {msg.a2ui && (
                <DynamicA2UIRegistry
                  payload={msg.a2ui}
                  onAction={onAction}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 animate-pulse bg-slate-800/60 rounded-xl border border-slate-700/50 w-fit">
            <div className="w-2 h-2 rounded-full bg-[#EB0029] animate-ping" />
            <span className="font-medium">{liveStatus || "Maya consultando herramientas bancarias y generando interfaz..."}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe tu consulta (ej. 'Quiero reestructurar mi tarjeta')..."
          disabled={isLoading}
          className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm px-4 py-3.5 pr-24 rounded-2xl border border-slate-700 focus:outline-none focus:border-[#EB0029] focus:ring-1 focus:ring-[#EB0029] transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="absolute right-2 px-4 py-2 rounded-xl bg-[#EB0029] hover:bg-[#C70023] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
        >
          <span>Enviar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
