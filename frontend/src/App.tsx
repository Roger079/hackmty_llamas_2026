import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Code2, Cpu, X, Sparkles } from 'lucide-react';
import { BanortePortalHeader } from './components/BanortePortalHeader';
import { BanorteSubNav, PortalTab } from './components/BanorteSubNav';
import { BanorteGlobalPosition, TransactionItem } from './components/BanorteGlobalPosition';
import { BanorteFooter } from './components/BanorteFooter';
import { ChatStream } from './components/ChatStream';
import { McpInspector } from './components/McpInspector';
import { MobileSimulator } from './components/MobileSimulator';
import { PowerUserDashboard } from './components/PowerUserDashboard';
import { LoginScreen } from './components/LoginScreen';
import { A2UINotebook } from './components/A2UINotebook';
import { ErrorBoundary } from './components/ErrorBoundary';
import { A2UIPayload, ActionContext, ChatMessage, McpCallLog, UserCognitiveProfile } from './types/a2ui';
import { executeHomeWidgetsAction } from './utils/homeWidgetsManager';

const DEFAULT_USER_ID = 'C001';
const DEFAULT_CLIENT = 'Ana Martínez';
type InspectorView = 'calls' | 'payload';

const timeNow = () =>
  new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('banorte_demo_logged_in') === 'true';
  });
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_USER_ID;
    return window.sessionStorage.getItem('banorte_demo_user_id') || DEFAULT_USER_ID;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hola, Ana. Bienvenida a Banorte. Soy Maya, tu copiloto financiero inteligente conectado a tu banca en línea en tiempo real. ¿En qué puedo apoyarte hoy?',
      timestamp: timeNow(),
    },
  ]);
  const [clientName, setClientName] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_CLIENT;
    const uid = window.sessionStorage.getItem('banorte_demo_user_id');
    if (uid === 'C002') return 'Carlos Ramírez';
    if (uid === 'C003') return 'Silvia Carrasco Alvarado';
    return DEFAULT_CLIENT;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mcpLogs, setMcpLogs] = useState<McpCallLog[]>([]);
  const [lastA2UI, setLastA2UI] = useState<A2UIPayload | null>(null);
  const [isMcpConnected, setIsMcpConnected] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorView, setInspectorView] = useState<InspectorView>('calls');
  const [activeTab, setActiveTab] = useState<PortalTab>('global');
  const [isMayaExpanded, setIsMayaExpanded] = useState(false);

  const checkIsMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return isMobileUA || window.innerWidth < 768;
  };

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const p = window.location.pathname;
    if (p === '/' || p === '') {
      if (!checkIsMobileDevice()) {
        try {
          window.history.replaceState({}, '', '/dashboard');
        } catch (_) {}
        return '/dashboard';
      }
      return '/';
    }
    return p;
  });

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const p = window.location.pathname;
    if (p.startsWith('/dashboard') || p.startsWith('/display') || p.startsWith('/portal')) return false;
    if (p.startsWith('/mobile')) return true;
    return checkIsMobileDevice();
  });

  const handleNavigateView = (view: 'mobile' | 'dashboard') => {
    const target = view === 'mobile' ? '/' : '/dashboard';
    window.history.pushState({}, '', target);
    setCurrentPath(target);
    setIsMobileViewport(view === 'mobile');
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p);
      if (p.startsWith('/dashboard') || p.startsWith('/display') || p.startsWith('/portal')) {
        setIsMobileViewport(false);
      } else if (p.startsWith('/mobile')) {
        setIsMobileViewport(true);
      } else {
        if (!checkIsMobileDevice()) {
          window.history.replaceState({}, '', '/dashboard');
          setCurrentPath('/dashboard');
          setIsMobileViewport(false);
        } else {
          setIsMobileViewport(true);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [bankAccounts, setBankAccounts] = useState<{
    nominaBalance?: number;
    oroBalance?: number;
    totalDebt?: number;
    accountLast4?: string;
    cardLast4?: string;
  }>({
    nominaBalance: 27900.00,
    oroBalance: 0.00,
    totalDebt: 0.00,
    accountLast4: '4582',
    cardLast4: '',
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [cognitiveProfile, setCognitiveProfile] = useState<UserCognitiveProfile | null>(null);

  const inspectorRef = useRef<HTMLElement>(null);
  const closeInspectorRef = useRef<HTMLButtonElement>(null);
  const inspectorTriggerRef = useRef<HTMLElement | null>(null);

  const firstName = useMemo(() => clientName.split(' ')[0] || 'Ana', [clientName]);
  const hasRestructure = useMemo(() => {
    return bankAccounts.totalDebt === 0 || mcpLogs.some((l) => l.tool_name === 'commit_restructure');
  }, [bankAccounts.totalDebt, mcpLogs]);

  useEffect(() => {
    const handleResize = () => {
      const p = window.location.pathname;
      if (p.startsWith('/dashboard') || p.startsWith('/display') || p.startsWith('/portal')) {
        setIsMobileViewport(false);
      } else if (p.startsWith('/mobile')) {
        setIsMobileViewport(true);
      } else {
        setIsMobileViewport(checkIsMobileDevice());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync health & MCP status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((health) => {
        setIsMcpConnected(Boolean(health.mcp_connected || health.status === 'healthy'));
      })
      .catch(() => setIsMcpConnected(false));
  }, []);

  // Sync persistent chat history & real customer SQL financial state whenever selected customer changes
  useEffect(() => {
    // 1. Fetch persistent chat history from SQLite for selected customer
    fetch(`/api/chat/history?user_id=${selectedUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && data.history && data.history.length > 0) {
          setMessages(data.history);
          const lastWithA2UI = [...data.history].reverse().find((m) => m.a2ui);
          if (lastWithA2UI) setLastA2UI(lastWithA2UI.a2ui);
        } else {
          const defaultGreetingName =
            selectedUserId === 'C001'
              ? 'Ana'
              : selectedUserId === 'C002'
              ? 'Carlos'
              : selectedUserId === 'C003'
              ? 'Silvia'
              : 'Cliente';
          setMessages([
            {
              id: 'welcome-1',
              role: 'assistant',
              content: `Hola, ${defaultGreetingName}. Bienvenido a Banorte. Soy Maya, tu copiloto financiero inteligente con memoria segura en SQLite. ¿En qué puedo apoyarte hoy?`,
              timestamp: timeNow(),
            },
          ]);
          setLastA2UI(null);
        }
      })
      .catch((err) => console.warn('Could not load persistent chat history:', err));

    // 2. Fetch real customer financial state directly from SQLite views via /api/bank/state
    refreshBankState(selectedUserId);

    // 3. Fetch cognitive memory profile from SQLite
    fetch(`/api/user/cognitive-profile?user_id=${selectedUserId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((prof) => {
        if (prof && prof.user_id) {
          setCognitiveProfile(prof);
        }
      })
      .catch((err) => console.warn('Could not load cognitive profile:', err));
  }, [selectedUserId]);

  const refreshBankState = async (userId: string) => {
    try {
      const res = await fetch(`/api/bank/state?user_id=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.client_name) {
        setClientName(data.client_name);
      }
      const accLast4 = data.primary_account?.account_last4 || (data.accounts?.[0]?.account_last4 ?? '0000');
      const cardLast4 = data.primary_card?.pan_last4 || (data.credit_cards?.[0]?.pan_last4 ?? '');
      setBankAccounts({
        nominaBalance: data.total_available_balance ?? 0.00,
        totalDebt: data.total_debt ?? 0.00,
        accountLast4: accLast4,
        cardLast4: cardLast4,
      });
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.warn('Could not load bank state from SQLite:', err);
    }
  };

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

  const history = () => messages.map(({ role, content, a2ui }) => ({ role, content, a2ui }));

  const applyHomeWidgetAction = (call: McpCallLog) => {
    if (call.tool_name !== 'manage_home_widgets' || !call.arguments) return;
    executeHomeWidgetsAction(selectedUserId, call.arguments.action, {
      widgetType: call.arguments.widget_type,
      newOrder: call.arguments.new_order,
      payload: call.arguments.payload,
      title: call.arguments.title,
      replace: call.arguments.replace,
      removeCurrentVisual: call.arguments.remove_current_visual,
    });
  };

  const applyHomeWidgetActions = (calls?: McpCallLog[]) => {
    calls?.forEach(applyHomeWidgetAction);
  };

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
      applyHomeWidgetActions(data.mcp_calls);
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

  const streamChat = async (payload: Record<string, unknown>) => {
    const assistantMsgId = `stream-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: timeNow(),
      },
    ]);

    const updateAssistantMessage = (reply: string, a2ui?: A2UIPayload | null) => {
      setMessages((current) =>
        current.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: reply,
                a2ui: a2ui || m.a2ui,
              }
            : m
        )
      );
      if (a2ui) setLastA2UI(a2ui);
    };

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        const fallbackData = await postChat(payload);
        applyHomeWidgetActions(fallbackData.mcp_calls);
        updateAssistantMessage(fallbackData.reply, fallbackData.a2ui);
        return fallbackData;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullReply = '';
      let capturedA2UI: A2UIPayload | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // EventSourceResponse uses CRLF framing in this environment. Accept both
        // SSE wire formats so a completed response always updates the placeholder.
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataLines: string[] = [];
          for (const line of block.split('\n')) {
            if (line.startsWith('data:')) {
              dataLines.push(line.slice(5).trimStart());
            }
          }
          if (!eventMatch || dataLines.length === 0) continue;

          const event = eventMatch[1].trim();
          const rawData = dataLines.join('\n');
          let dataJson: any = null;
          try {
            dataJson = JSON.parse(rawData);
          } catch {
            dataJson = rawData;
          }

          if (event === 'token' && typeof dataJson === 'string') {
            fullReply += dataJson;
            updateAssistantMessage(fullReply, capturedA2UI);
          } else if (event === 'mcp_call' && dataJson) {
            setMcpLogs((current) => [dataJson, ...current]);
            applyHomeWidgetAction(dataJson);
          } else if (event === 'a2ui' && dataJson) {
            capturedA2UI = dataJson;
            updateAssistantMessage(fullReply, dataJson);
          } else if (event === 'done' && dataJson) {
            if (Array.isArray(dataJson.mcp_calls)) {
              for (const call of dataJson.mcp_calls) {
                applyHomeWidgetAction(call);
              }
            }
            if (dataJson.reply && (!fullReply || fullReply.trim().length === 0)) {
              fullReply = dataJson.reply;
            }
            if (dataJson.a2ui) {
              capturedA2UI = dataJson.a2ui;
            }
            updateAssistantMessage(
              fullReply || dataJson.reply || 'Operación completada por Maya Banorte.',
              capturedA2UI || dataJson.a2ui
            );
          }
        }
      }

      if (!fullReply.trim()) {
        const fallbackData = await postChat(payload);
        applyHomeWidgetActions(fallbackData.mcp_calls);
        updateAssistantMessage(fallbackData.reply, fallbackData.a2ui);
        return fallbackData;
      }

      return { reply: fullReply, a2ui: capturedA2UI };
    } catch (err) {
      console.warn('Streaming failed, falling back to POST /api/chat:', err);
      try {
        const fallbackData = await postChat(payload);
        applyHomeWidgetActions(fallbackData.mcp_calls);
        updateAssistantMessage(fallbackData.reply, fallbackData.a2ui);
        return fallbackData;
      } catch (fallbackErr) {
        console.error('All chat attempts failed:', fallbackErr);
        updateAssistantMessage('No pude conectar con el asistente Banorte. Verifica la conexión e inténtalo de nuevo.');
      }
    }
  };

  // Global listener for interactive widgets dispatching banorte:ask-maya
  useEffect(() => {
    const handleAskMayaEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      const prompt = customEvent.detail?.prompt;
      if (prompt) {
        if (window.innerWidth < 1024) {
          setActiveTab('maya');
        }
        handleSendMessage(prompt);
      }
    };
    window.addEventListener('banorte:ask-maya', handleAskMayaEvent);
    return () => window.removeEventListener('banorte:ask-maya', handleAskMayaEvent);
  }, [selectedUserId, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;
    const requestHistory = history();
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: timeNow() },
    ]);
    setIsLoading(true);

    if (window.innerWidth < 1024) {
      setActiveTab('maya');
    }

    try {
      await streamChat({ message: text, user_id: selectedUserId, history: requestHistory, surface: 'mobile' });
      refreshBankState(selectedUserId);
    } catch (error) {
      appendConnectionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionContext: ActionContext): Promise<boolean> => {
    if (isLoading) return false;
    const requestHistory = history();
    const isFormSubmission = actionContext.source_component === 'SpeiTransferFormCard';
    const isExploratory = !isFormSubmission && ['query_restructure'].includes(actionContext.action);

    let actionMessage = 'Continuar con esta opción';
    if (actionContext.action === 'query_restructure') {
      actionMessage = 'Quiero ver opciones para reestructurar mi tarjeta';
    } else if (isFormSubmission) {
      const amt = Number(actionContext.params?.amount || 850);
      const ben = actionContext.params?.beneficiary_name || 'destinatario';
      actionMessage = `Revisar y autorizar transferencia SPEI de $${amt.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN a ${ben}`;
    } else if (actionContext.action === 'prepare_spei') {
      actionMessage = 'Quiero preparar una transferencia SPEI';
    } else if (actionContext.action.includes('spei')) {
      actionMessage = 'Confirmar transferencia SPEI con Token Móvil';
    } else if (actionContext.action.includes('restructure')) {
      actionMessage = `Aceptar plan de ${actionContext.params?.term_months || '24'} meses`.trim();
    }

    setMessages((current) => [
      ...current,
      { id: `action-${Date.now()}`, role: 'user', content: actionMessage, timestamp: timeNow() },
    ]);
    setIsLoading(true);

    try {
      await streamChat({
        message: actionMessage,
        ...(isExploratory ? {} : { action_context: actionContext }),
        user_id: selectedUserId,
        history: requestHistory,
        surface: 'mobile',
      });
      refreshBankState(selectedUserId);
      return true;
    } catch (error) {
      appendConnectionError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      await fetch(`/api/chat/history?user_id=${selectedUserId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Could not clear remote chat history:', err);
    }
    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content:
          'Hola, bienvenido a Banorte. Soy Maya, tu copiloto financiero inteligente. Tu historial ha sido limpiado de forma segura conforme a la política de privacidad Banorte.',
        timestamp: timeNow(),
      },
    ]);
    setLastA2UI(null);
  };

  const handleLogin = (rawUsername: string) => {
    const clean = (rawUsername || '').trim().toLowerCase();
    let newUserId = 'C001';
    let newName = 'Ana Martínez';

    if (clean.includes('carlos')) {
      newUserId = 'C002';
      newName = 'Carlos Ramírez';
    } else if (clean.includes('silvia')) {
      newUserId = 'C003';
      newName = 'Silvia Carrasco Alvarado';
    } else {
      newUserId = 'C001';
      newName = 'Ana Martínez';
    }

    setSelectedUserId(newUserId);
    setClientName(newName);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('banorte_demo_logged_in', 'true');
      window.sessionStorage.setItem('banorte_demo_user_id', newUserId);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('banorte_demo_logged_in');
      window.sessionStorage.removeItem('banorte_demo_user_id');
    }
    setIsAuthenticated(false);
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

  if (currentPath.startsWith('/notebook')) {
    return (
      <A2UINotebook
        onNavigateHome={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentPath.startsWith('/dashboard')) {
    return (
      <PowerUserDashboard
        initialUserId={selectedUserId}
        onNavigateHome={() => handleNavigateView('mobile')}
        onLogout={handleLogout}
      />
    );
  }

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
          transactions={transactions}
          hasRestructure={hasRestructure}
          mcpLogs={mcpLogs}
          onOpenInspector={() => setIsInspectorOpen(true)}
          userId={selectedUserId}
          onLogout={handleLogout}
          onNavigateDisplay={() => handleNavigateView('dashboard')}
        />
        {isInspectorOpen && renderInspectorDrawer()}
      </div>
    );
  }


  return (
    <div className="app-shell min-h-screen bg-[#F3F7FA] text-[#061D3A] flex flex-col justify-between">
      <div>
        {/* Official Banorte Header (Banca en Línea) */}
        <BanortePortalHeader
          clientName={clientName}
          tier="Cliente Preferente"
          hasToken
          selectedUserId={selectedUserId}
          onSelectUser={(newId) => {
            setSelectedUserId(newId);
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('banorte_demo_user_id', newId);
            }
          }}
          onLogout={handleLogout}
          onNavigateMobile={() => handleNavigateView('mobile')}
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
              <ErrorBoundary fallbackTitle="Panel de Control Financiero">
                <BanorteGlobalPosition
                  clientName={clientName}
                  selectedUserId={selectedUserId}
                  accounts={bankAccounts}
                  transactions={transactions}
                  cognitiveProfile={cognitiveProfile}
                  activeTab={activeTab}
                  onSelectTab={(tab) => setActiveTab(tab)}
                  onTriggerMayaPrompt={handleSendMessage}
                  onAction={handleAction}
                  hasActiveRestructure={hasRestructure}
                />
              </ErrorBoundary>
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
                userId={selectedUserId}
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
