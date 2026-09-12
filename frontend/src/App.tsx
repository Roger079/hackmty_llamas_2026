import React, { useState, useEffect } from 'react';
import { MessageSquare, Cpu, Code2, RefreshCw } from 'lucide-react';
import { BanorteHeader } from './components/BanorteHeader';
import { ChatStream } from './components/ChatStream';
import { McpInspector } from './components/McpInspector';
import { ChatMessage, ActionContext, McpCallLog, A2UIPayload } from './types/a2ui';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'mcp' | 'schema'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: '¡Hola, Alejandro! 👋 Soy **Maya**, tu copiloto financiero inteligente de Banorte.\n\nPuedo consultar tus estados de cuenta, transferir por SPEI o ayudarte a reestructurar tu tarjeta de crédito con tasas preferenciales generando interfaces bancarias interactivas directamente aquí.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mcpLogs, setMcpLogs] = useState<McpCallLog[]>([]);
  const [lastA2UI, setLastA2UI] = useState<A2UIPayload | null>(null);
  const [isMcpConnected, setIsMcpConnected] = useState(false);

  // Check MCP connection on mount
  useEffect(() => {
    fetch('/api/mcp/status')
      .then(res => res.json())
      .then(data => setIsMcpConnected(data.connected))
      .catch(() => setIsMcpConnected(false));
  }, []);

  // Send message to FastAPI Orchestrator
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: 'USR-BANORTE-8842',
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Append assistant message with A2UI component
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply,
        a2ui: data.a2ui || undefined,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Record MCP calls
      if (data.mcp_calls && Array.isArray(data.mcp_calls)) {
        setMcpLogs(prev => [...data.mcp_calls, ...prev]);
      }

      if (data.a2ui) {
        setLastA2UI(data.a2ui);
      }
    } catch (err) {
      console.error("Error communicating with orchestrator:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Ocurrió un error al contactar al orquestador de Banorte. Verifica que el servidor FastAPI esté en ejecución.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch Action from an A2UI Component (The Closed Loop Feedback Dispatcher)
  const handleAction = async (actionCtx: ActionContext) => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[ACCIÓN CONFIRMADA]: Ejecutar ${actionCtx.action}`,
          action_context: actionCtx,
          user_id: 'USR-BANORTE-8842',
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        a2ui: data.a2ui || undefined,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.mcp_calls && Array.isArray(data.mcp_calls)) {
        setMcpLogs(prev => [...data.mcp_calls, ...prev]);
      }

      if (data.a2ui) {
        setLastA2UI(data.a2ui);
      }
    } catch (err) {
      console.error("Error in action feedback loop:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col items-center p-3 sm:p-6 antialiased">
      <div className="w-full max-w-7xl space-y-4">
        {/* Banorte Header Shell */}
        <BanorteHeader clientName="Alejandro Ramírez" tier="Preferente" hasToken={true} />

        {/* Tab switcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#EB0029] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Maya • Chat A2UI</span>
            </button>
            <button
              onClick={() => setActiveTab('mcp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'mcp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Inspector MCP</span>
              <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {mcpLogs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'schema'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>A2UI JSON Spec</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Orquestador:</span>
            <span className="font-mono text-emerald-300">FastAPI Activo</span>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="min-h-[680px]">
          {activeTab === 'chat' && (
            <ChatStream
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onAction={handleAction}
            />
          )}

          {activeTab === 'mcp' && (
            <McpInspector
              logs={mcpLogs}
              onClear={() => setMcpLogs([])}
              isConnected={isMcpConnected}
            />
          )}

          {activeTab === 'schema' && (
            <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>Último Payload A2UI Emitido por el Agente</span>
                </h3>
                {lastA2UI && (
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(lastA2UI, null, 2))}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                  >
                    Copiar JSON
                  </button>
                )}
              </div>
              <pre className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-emerald-300 overflow-y-auto">
                {lastA2UI
                  ? JSON.stringify(lastA2UI, null, 2)
                  : '// Aún no se ha emitido ningún componente A2UI. Envía una consulta en el chat.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
