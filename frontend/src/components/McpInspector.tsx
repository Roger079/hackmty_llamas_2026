import React, { useState } from 'react';
import { Terminal, Clock, CheckCircle2, Trash2, Copy, Check, Filter } from 'lucide-react';
import { McpCallLog } from '../types/a2ui';

interface McpInspectorProps {
  logs: McpCallLog[];
  onClear: () => void;
  isConnected: boolean;
  embedded?: boolean;
}

export const McpInspector: React.FC<McpInspectorProps> = ({
  logs,
  onClear,
  isConnected,
  embedded = false,
}) => {
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);
  const [filterTool, setFilterTool] = useState<string>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const uniqueTools = Array.from(
    new Set(logs.map((l) => (l as any).tool_name || (l as any).tool || 'tool'))
  );

  const filteredLogs = logs.filter((log) => {
    if (filterTool === 'all') return true;
    const name = (log as any).tool_name || (log as any).tool;
    return name === filterTool;
  });

  return (
    <div
      className={`${
        embedded ? '' : 'rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl'
      } flex h-full flex-col font-mono text-xs text-slate-200`}
    >
      {/* Top Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold text-white">Live FastMCP Inspector</h3>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
            {logs.length} llamada{logs.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="text-slate-300 font-semibold">
              {isConnected ? 'FastMCP Remoto' : 'Motor MCP Integrado'}
            </span>
          </span>

          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-slate-400 transition hover:bg-red-950 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Limpiar registro de llamadas"
              aria-label="Limpiar logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tool Filter pills if multiple tools exist */}
      {uniqueTools.length > 1 && (
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <Filter className="h-3 w-3 text-slate-500 shrink-0" />
          <button
            onClick={() => setFilterTool('all')}
            className={`rounded-lg px-2.5 py-1 font-bold transition ${
              filterTool === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({logs.length})
          </button>
          {uniqueTools.map((tool) => (
            <button
              key={tool}
              onClick={() => setFilterTool(tool)}
              className={`rounded-lg px-2.5 py-1 font-bold transition ${
                filterTool === tool
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      )}

      {/* Logs Feed */}
      <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
            <Terminal className="mx-auto mb-2 h-6 w-6 text-slate-600" />
            <p className="font-sans text-xs">
              No hay llamadas MCP registradas en esta vista.
            </p>
            <p className="mt-1 font-sans text-[11px] text-slate-600">
              Usa los botones rápidos del chat o pide una reestructuración para ver la telemetría en tiempo real.
            </p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const toolName = (log as any).tool_name || (log as any).tool || 'unknown_tool';
            const latency = (log as any).latency_ms ?? (log as any).duration_ms ?? 35;
            const argsId = `args-${idx}`;
            const resId = `res-${idx}`;
            const argsStr = JSON.stringify(log.arguments || {}, null, 2);
            const resStr = JSON.stringify(log.result || {}, null, 2);

            return (
              <div
                key={idx}
                className="space-y-2.5 rounded-2xl border border-slate-800/90 bg-slate-900/90 p-4 shadow-md transition hover:border-slate-700"
              >
                {/* Log Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{toolName}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        latency < 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      <Clock className="mr-1 inline h-2.5 w-2.5" />
                      {latency}ms
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {log.timestamp || 'reciente'}
                    </span>
                  </div>
                </div>

                {/* Arguments */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Parámetros de entrada:</span>
                    <button
                      onClick={() => copyToClipboard(argsStr, argsId)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                      title="Copiar parámetros JSON"
                    >
                      {copiedIdx === argsId ? (
                        <Check className="h-2.5 w-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-2.5 w-2.5" />
                      )}
                      <span>{copiedIdx === argsId ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl bg-slate-950 p-2.5 text-[11px] text-cyan-300 border border-slate-800/60">
                    {argsStr}
                  </pre>
                </div>

                {/* Result */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Respuesta FastMCP:</span>
                    <button
                      onClick={() => copyToClipboard(resStr, resId)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                      title="Copiar resultado JSON"
                    >
                      {copiedIdx === resId ? (
                        <Check className="h-2.5 w-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-2.5 w-2.5" />
                      )}
                      <span>{copiedIdx === resId ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <pre className="max-h-48 overflow-x-auto overflow-y-auto rounded-xl bg-slate-950 p-2.5 text-[11px] text-emerald-300 border border-slate-800/60">
                    {resStr}
                  </pre>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
