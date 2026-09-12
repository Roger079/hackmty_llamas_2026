import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { ActionContext, ChatMessage } from '../types/a2ui';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';
import mayaAvatar from '../assets/12ui/maya-avatar.png';
import mayaMessage from '../assets/12ui/maya-message.png';

interface ChatStreamProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onAction: (actionCtx: ActionContext) => Promise<boolean>;
  clientName: string;
  onResetDemo?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

const quickPrompts = [
  '¿Cómo reestructurar mi tarjeta Platino?',
  '¿Cuánto saldo disponible tengo en mis cuentas?',
  'Transfiere $850 a Sofía Mendoza por SPEI',
  'Quiero simular una inversión a plazo fijo',
];

const renderInlineMarkdown = (raw: string): React.ReactNode => {
  // Tokenize by code blocks, bold, and italics
  const tokens = raw.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length > 1) {
      return (
        <code
          key={i}
          className="font-mono text-[11px] bg-slate-100/90 text-[#9D0027] font-bold px-1.5 py-0.5 rounded-md border border-slate-200/80 shadow-2xs mx-0.5 inline-block"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length > 3) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={i} className="italic text-slate-600">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{token}</React.Fragment>;
  });
};

const MessageText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  // Pre-process: split concatenated bullets (e.g. "* Monto: ... * Destino: ...") onto separate lines
  const normalized = text
    .replace(/:\s*\*\s+/g, ':\n* ')
    .replace(/([^\n])\s*\*\s+([A-ZÁÉÍÓÚÑa-z])/g, '$1\n* $2')
    .replace(/([^\n])\s*(\d+\.\s+[A-ZÁÉÍÓÚÑ])/g, '$1\n\n$2');

  const lines = normalized.split('\n');

  return (
    <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal divider
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="border-t border-slate-200 my-2.5" />;
        }

        // Heading 3 / Section Header (### Title)
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-[12px] font-extrabold text-[#061D3A] uppercase tracking-wide mt-3 mb-1 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB0029] inline-block shrink-0" />
              <span>{renderInlineMarkdown(trimmed.slice(4))}</span>
            </h4>
          );
        }

        // Heading 2 / 1 (## Title or # Title)
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const content = trimmed.replace(/^#+\s*/, '');
          return (
            <h3
              key={idx}
              className="text-xs font-black text-[#061D3A] mt-3 mb-1.5 pb-0.5 border-b border-slate-100"
            >
              {renderInlineMarkdown(content)}
            </h3>
          );
        }

        // Numbered list item (1. Item, 2. Item)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const [, num, itemContent] = numberedMatch;
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-0.5">
              <span className="font-bold text-[#EB0029] shrink-0 text-xs tabular-nums">
                {num}.
              </span>
              <div className="flex-1 leading-snug">{renderInlineMarkdown(itemContent)}</div>
            </div>
          );
        }

        // Bullet point item (* Item, - Item, • Item)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB0029]/70 mt-1.5 shrink-0" />
              <div className="flex-1 leading-snug">{renderInlineMarkdown(content)}</div>
            </div>
          );
        }

        // Standard text paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onAction,
  clientName,
  onResetDemo,
  onToggleExpand,
  isExpanded = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = scrollAreaRef.current;
    if (area) {
      area.scrollTo({
        top: area.scrollHeight,
        behavior: messages.length > 1 ? 'smooth' : 'auto',
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <section
      className="banorte-card flex h-[calc(100svh-204px)] min-h-[700px] w-full min-w-0 flex-col overflow-hidden bg-white"
      aria-label="Conversación con Maya Copiloto"
    >
      {/* Zen Header: Clean, light, airy, institutional and calm */}
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#E1EAF2] bg-white px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <img src={mayaAvatar} alt="" className="h-10 w-10 shrink-0 object-contain" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold tracking-tight text-[#061D3A]">
                Maya Copiloto
              </h2>
              <span className="hidden rounded-lg bg-[#F1F5F8] px-2 py-0.5 text-[11px] font-medium text-[#526B87] sm:inline-block">
                IA Bancaria
              </span>
            </div>
            <p className="truncate text-xs text-[#6D85A1]">
              Sesión protegida para {clientName.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Minimalist Controls: Generous, comfortable spacing (gap-2) and subtle ghost buttons */}
        <div className="flex items-center gap-2">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              title={isExpanded ? 'Vista dividida con dashboard' : 'Expandir a pantalla completa'}
              aria-label={isExpanded ? 'Acoplar vista' : 'Expandir vista'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}

          {onResetDemo && (
            <button
              type="button"
              onClick={onResetDemo}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
              title="Reiniciar conversación"
              aria-label="Reiniciar conversación"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Messages Feed: Generous, comfortable whitespace */}
      <div
        ref={scrollAreaRef}
        className="chat-scroll min-h-0 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-[#FBFDFE] to-white p-4 sm:p-5"
        aria-live="polite"
      >
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex transition-all duration-150 ${isUser ? 'justify-end' : 'items-start gap-2.5'}`}
            >
              {!isUser && (
                <img src={mayaMessage} alt="" className="mt-0.5 h-9 w-9 shrink-0 object-contain" />
              )}
              <div className={`space-y-2.5 ${isUser ? 'max-w-[85%] sm:max-w-[78%]' : 'min-w-0 max-w-2xl flex-1'}`}>
                <div
                  className={`break-words text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'rounded-2xl rounded-br-xs bg-[#EB0029] px-4 py-2.5 text-white font-medium shadow-xs'
                      : 'rounded-2xl border border-[#E1EAF2] bg-white p-4 text-[#526B87] shadow-[0_5px_14px_rgba(39,67,95,0.08)]'
                  }`}
                >
                  <MessageText text={message.content} />
                </div>

                {message.a2ui && (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <DynamicA2UIRegistry payload={message.a2ui} onAction={onAction} disabled={isLoading} />
                  </div>
                )}

                <time
                  className={`block text-[10px] text-slate-400 ${isUser ? 'text-right pr-1' : 'pl-1'}`}
                >
                  {message.timestamp}
                </time>
              </div>
            </div>
          );
        })}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-600 animate-in fade-in duration-100" role="status">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EB0029] text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs flex items-center gap-2">
              <span className="maya-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="font-medium text-slate-600 text-xs">
                Consultando finanzas con FastMCP…
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer: Zen Prompt Chips & Input */}
      <footer className="shrink-0 border-t border-[#E1EAF2] bg-white p-3.5 sm:p-4">
        {/* Subtle, non-intrusive suggested prompts with comfortable breathing room */}
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSendMessage(prompt)}
              disabled={isLoading}
              className="inline-flex shrink-0 items-center rounded-2xl border border-[#E6EDF4] bg-white px-3.5 py-2 text-[11px] font-semibold text-[#68819D] shadow-sm transition hover:border-[#CBD9E6] hover:text-[#061D3A] disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Form input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2.5 rounded-2xl border border-[#E1EAF2] bg-white p-2 shadow-[inset_0_1px_2px_rgba(39,67,95,0.03)] transition-all focus-within:border-[#E4003B] focus-within:ring-2 focus-within:ring-[#E4003B]/10"
        >
          <label htmlFor="maya-message" className="sr-only">
            Escribe tu consulta para Maya
          </label>
          <textarea
            id="maya-message"
            rows={1}
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            placeholder="Pregúntale a Maya sobre tus cuentas o pagos…"
            disabled={isLoading}
            className="max-h-24 min-h-8 min-w-0 flex-1 resize-none bg-transparent px-2.5 py-1 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4003B] text-white shadow-sm transition hover:bg-[#C70032] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            aria-label="Enviar mensaje"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-[#8EA0B4]">
          Operación protegida con cifrado SSL bancario de 256 bits y Token Móvil.
        </p>
      </footer>
    </section>
  );
};
