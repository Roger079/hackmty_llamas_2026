import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Code2, Cpu, X, Sparkles } from 'lucide-react';
import { BanortePortalSegmentBar } from './components/BanortePortalSegmentBar';
import { BanortePortalHeader } from './components/BanortePortalHeader';
import { BanorteSubNav, PortalTab } from './components/BanorteSubNav';
import { BanorteGlobalPosition } from './components/BanorteGlobalPosition';
import { BanorteFooter } from './components/BanorteFooter';
import { ChatStream } from './components/ChatStream';
import { McpInspector } from './components/McpInspector';
import { MobileSimulator } from './components/MobileSimulator';
import { A2UIPayload, ActionContext, ChatMessage, McpCallLog } from './types/a2ui';

const USER_ID = 'USR-BANORTE-8842';
const DEFAULT_CLIENT = 'Roberto Carlos Garza';
type InspectorView = 'calls' | 'payload';

const timeNow = () =>
  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hola, bienvenido a Banorte. Soy Maya, tu copiloto financiero inteligente. Puedo ayudarte a consultar tus saldos disponibles, reestructurar tu tarjeta de crédito con tasas fijas congeladas o transferir fondos por SPEI con autorización de Token Móvil.',
      timestamp: timeNow(),
    },
  ]);
  const [clientName, setClientName] = useState(DEFAULT_CLIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [mcpLogs, setMcpLogs] = useState<McpCallLog[]>([]);
  const [lastA2UI, setLastA2UI] = useState<A2UIPayload | null>(null);
  const [isMcpConnected, setIsMcpConnected] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorView, setInspectorView] = useState<InspectorView>('calls');
  const [activeTab, setActiveTab] = useState<PortalTab>('global');
  const [isMayaExpanded, setIsMayaExpanded] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || window.location.pathname.startsWith('/mobile');
  });
  const [bankAccounts, setBankAccounts] = useState<{
    nominaBalance?: number;
    oroBalance?: number;
    totalDebt?: number;
  }>({
    nominaBalance: 48650.00,
    oroBalance: 41550.00,
    totalDebt: 48500.00,
  });

  const inspectorRef = useRef<HTMLElement>(null);
  const closeInspectorRef = useRef<HTMLButtonElement>(null);
  const inspectorTriggerRef = useRef<HTMLElement | null>(null);

  const firstName = useMemo(() => clientName.split(' ')[0] || 'Roberto', [clientName]);
  const hasRestructure = useMemo(() => {
    return bankAccounts.totalDebt === 0 || mcpLogs.some((l) => l.tool_name === 'commit_restructure');
  }, [bankAccounts.totalDebt, mcpLogs]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768 || window.location.pathname.startsWith('/mobile'));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync health & bank state on mount
  useEffect(() => {
    Promise.allSettled([
      fetch('/api/health').then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch('/api/bank/state').then((res) => (res.ok ? res.json() : Promise.reject())),
    ]).then(([health, bank]) => {
      if (health.status === 'fulfilled') {
        setIsMcpConnected(Boolean(health.value.mcp_connected));
      }
      if (bank.status === 'fulfilled') {
        if (bank.value.client_name) {
          setClientName(bank.value.client_name);
        }
        if (bank.value.accounts) {
          const nomina = bank.value.accounts.nomina?.balance ?? 48650.00;
          const oroDebt = bank.value.accounts.oro?.debt ?? 48500.00;
          setBankAccounts({
            nominaBalance: nomina,
            totalDebt: oroDebt,
          });
        }
      }
    });
  }, []);

  const closeInspector = () => {
    setIsInspectorOpen(false);
    window.setTimeout(() => inspectorTriggerRef.current?.focus(), 0);
  };

  const openInspector = (trigger: HTMLElement) => {
    inspectorTriggerRef.current = trigger;
    setIsInspectorOpen(true);
  };

  const handleInspectorTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const nextView: InspectorView =
      event.key === 'ArrowRight'
        ? inspectorView === 'calls'
          ? 'payload'
          : 'calls'
        : inspectorView === 'payload'
        ? 'calls'
        : 'payload';
    setInspectorView(nextView);
    window.setTimeout(() => document.getElementById(`inspector-tab-${nextView}`)?.focus(), 0);
  };

  useEffect(() => {
    if (!isInspectorOpen) return;
    closeInspectorRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeInspector();
      if (event.key !== 'Tab' || !inspectorRef.current) return;
      const focusable = Array.from(
        inspectorRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], textarea, input, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isInspectorOpen]);

  const history = () => messages.map(({ role, content }) => ({ role, content }));

  const appendResponse = (data: {
    reply?: string;
    a2ui?: A2UIPayload | null;
    mcp_calls?: McpCallLog[];
  }) => {
    setMessages((current) => [
      ...current,
      {
        id: `msg-${Date.now()}-${current.length}`,
        role: 'assistant',
        content: data.reply || 'Operación procesada por Maya.',
        a2ui: data.a2ui || undefined,
        timestamp: timeNow(),
      },
    ]);
    if (Array.isArray(data.mcp_calls)) {
      setMcpLogs((current) => [...data.mcp_calls!, ...current]);
    }
    if (data.a2ui) {
      setLastA2UI(data.a2ui);
    }
  };

  const appendConnectionError = (error: unknown) => {
    console.error('Banorte orchestrator request failed:', error);
    setMessages((current) => [
      ...current,
      {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'No pude conectar con el orquestador Banorte. Confirma que el servidor FastAPI esté activo en http://localhost:8000 e inténtalo de nuevo.',
        timestamp: timeNow(),
      },
    ]);
  };

  const postChat = async (payload: Record<string, unknown>) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`POST /api/chat returned ${response.status}`);
    }
    return response.json();
  };

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;
    const requestHistory = history();
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: timeNow() },
    ]);
    setIsLoading(true);

    // On mobile, automatically switch to Maya view so user sees response
    if (window.innerWidth < 1024) {
      setActiveTab('maya');
    }

    try {
      const data = await postChat({ message: text, user_id: USER_ID, history: requestHistory });
      appendResponse(data);
    } catch (error) {
      appendConnectionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionContext: ActionContext): Promise<boolean> => {
    if (isLoading) return false;
    const requestHistory = history();
    const isExploratory = ['query_restructure', 'prepare_spei'].includes(actionContext.action);
    const actionMessage =
      actionContext.action === 'query_restructure'
        ? 'Quiero ver opciones para reestructurar mi tarjeta'
        : actionContext.action === 'prepare_spei'
        ? 'Quiero preparar una transferencia SPEI de $850'
        : actionContext.action.includes('spei')
        ? 'Confirmar transferencia SPEI con Token Móvil'
        : actionContext.action.includes('restructure')
        ? `Aceptar plan de ${actionContext.params.term_months || '24'} meses`.trim()
        : 'Continuar con esta opción';

    setMessages((current) => [
      ...current,
      { id: `action-${Date.now()}`, role: 'user', content: actionMessage, timestamp: timeNow() },
    ]);
    setIsLoading(true);

    try {
      const data = await postChat({
        message: actionMessage,
        ...(isExploratory ? {} : { action_context: actionContext }),
        user_id: USER_ID,
        history: requestHistory,
      });
      appendResponse(data);
      return true;
    } catch (error) {
      appendConnectionError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = () => {
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content:
          'Hola, bienvenido a Banorte. Soy Maya, tu copiloto financiero inteligente. Puedo ayudarte a consultar tus saldos disponibles, reestructurar tu tarjeta de crédito con tasas fijas congeladas o transferir fondos por SPEI con autorización de Token Móvil.',
        timestamp: timeNow(),
      },
    ]);
  };

  const renderInspectorDrawer = () => (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="FastMCP Telemetry Inspector"
    >
      <button
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={closeInspector}
        aria-label="Cerrar inspector"
        tabIndex={-1}
      />
      <section
        ref={inspectorRef}
        className="relative flex h-full w-full max-w-xl flex-col bg-slate-950 text-white shadow-2xl border-l border-slate-800 animate-in slide-in-from-right duration-200"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">FastMCP Telemetry Inspector</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Evidencia en tiempo real de las herramientas bancarias ejecutadas por Maya
            </p>
          </div>
          <button
            ref={closeInspectorRef}
            type="button"
            onClick={closeInspector}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar MCP Inspector"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div
          role="tablist"
          aria-label="Vistas del Inspector"
          className="flex gap-2 border-b border-white/10 px-6 pt-3"
        >
          <button
            id="inspector-tab-calls"
            role="tab"
            aria-controls="inspector-panel"
            aria-selected={inspectorView === 'calls'}
            tabIndex={inspectorView === 'calls' ? 0 : -1}
            onKeyDown={handleInspectorTabKeyDown}
            onClick={() => setInspectorView('calls')}
            className={`min-h-11 border-b-2 px-3 py-2 text-xs font-bold transition ${
              inspectorView === 'calls'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="mr-2 inline h-3.5 w-3.5 text-emerald-400" />
            Llamadas FastMCP ({mcpLogs.length})
          </button>
          <button
            id="inspector-tab-payload"
            role="tab"
            aria-controls="inspector-panel"
            aria-selected={inspectorView === 'payload'}
            tabIndex={inspectorView === 'payload' ? 0 : -1}
            onKeyDown={handleInspectorTabKeyDown}
            onClick={() => setInspectorView('payload')}
            className={`min-h-11 border-b-2 px-3 py-2 text-xs font-bold transition ${
              inspectorView === 'payload'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="mr-2 inline h-3.5 w-3.5 text-amber-400" />
            Último Payload A2UI
          </button>
        </div>

        <div
          id="inspector-panel"
          role="tabpanel"
          aria-labelledby={`inspector-tab-${inspectorView}`}
          className="min-h-0 flex-1 overflow-auto p-6"
        >
          {inspectorView === 'calls' ? (
            <McpInspector
              logs={mcpLogs}
              onClear={() => setMcpLogs([])}
              isConnected={isMcpConnected}
              embedded
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Esquema JSON Declarativo renderizado en Canvas:</span>
                {lastA2UI && (
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(lastA2UI, null, 2))}
                    className="rounded-lg bg-slate-800 px-3 py-1 font-bold text-white hover:bg-slate-700"
                  >
                    Copiar JSON
                  </button>
                )}
              </div>
              <pre className="min-h-[400px] overflow-auto rounded-2xl bg-black/40 p-4 font-mono text-xs leading-5 text-emerald-300 border border-slate-800">
                {lastA2UI
                  ? JSON.stringify(lastA2UI, null, 2)
                  : '// Aún no se ha emitido ningún componente A2UI. Selecciona un plan o envía una consulta en el chat.'}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  if (isMobileViewport) {
    return (
      <div className="relative min-h-screen">
        <MobileSimulator
          clientName={clientName}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onAction={handleAction}
          onResetDemo={handleResetDemo}
          accounts={bankAccounts}
          hasRestructure={hasRestructure}
          mcpLogs={mcpLogs}
          onOpenInspector={() => setIsInspectorOpen(true)}
        />
        {isInspectorOpen && renderInspectorDrawer()}
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[#F3F7FA] text-[#061D3A] flex flex-col justify-between">
      <div>
        {/* 1. Official Banorte Top Segment Bar */}
        <BanortePortalSegmentBar activeSegment="Personas" />

        {/* 2. Official Banorte Header (Banca en Línea) */}
        <BanortePortalHeader
          clientName={clientName}
          tier="Cliente Preferente"
          hasToken
          mcpCallCount={mcpLogs.length}
          onOpenInspector={() => setIsInspectorOpen(true)}
        />

        {/* 3. Operational Subnav Bar */}
        <BanorteSubNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          mayaActive={true}
        />

        {/* 4. Main Banking Canvas */}
        <main className="mx-auto w-full max-w-[1536px] px-4 py-4 sm:px-6 lg:px-8">
          {/* Responsive Layout: Desktop 2-column, Tablet tabbed */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(420px,1fr)]">
            {/* Left 7 Columns: Financial Dashboard (Visible when not expanded, or on mobile when activeTab is not 'maya') */}
            <div
              className={`
                ${isMayaExpanded ? 'hidden' : ''}
                ${activeTab === 'maya' ? 'hidden lg:block' : ''}
              `}
            >
              <BanorteGlobalPosition
                clientName={clientName}
                accounts={bankAccounts}
                onTriggerMayaPrompt={handleSendMessage}
              />
            </div>

            {/* Right 5 Columns: Maya Copiloto Dock (Seamlessly integrated, no overlapping buttons) */}
            <div
              className={`
                ${isMayaExpanded ? 'lg:col-span-2' : ''}
                ${activeTab === 'global' ? 'hidden lg:block' : 'block'}
              `}
            >
              <ChatStream
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                onAction={handleAction}
                clientName={clientName}
                onResetDemo={handleResetDemo}
                onToggleExpand={() => setIsMayaExpanded(!isMayaExpanded)}
                isExpanded={isMayaExpanded}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Maya Copilot Trigger on Tablet (<1024px) */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'maya' ? 'global' : 'maya')}
          className="flex items-center gap-2 rounded-full bg-[#EB0029] text-white px-4 py-3 shadow-2xl font-bold text-xs hover:bg-[#C70023] transition-all cursor-pointer ring-2 ring-white/50"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>{activeTab === 'maya' ? 'Ver Cuentas' : 'Hablar con Maya'}</span>
        </button>
      </div>

      {/* 5. Official Banorte Corporate Legal Footer */}
      <BanorteFooter />

      {/* MCP Inspector Drawer Modal on Desktop */}
      {isInspectorOpen && renderInspectorDrawer()}
    </div>
  );
};
