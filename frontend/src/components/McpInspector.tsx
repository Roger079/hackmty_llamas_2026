import React from 'react';
import { Terminal, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { McpCallLog } from '../types/a2ui';

interface McpInspectorProps {
  logs: McpCallLog[];
  onClear: () => void;
  isConnected: boolean;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ logs, onClear, isConnected }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col h-full shadow-2xl font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live MCP Call Inspector</h3>
          <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
            {logs.length} llamadas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-slate-400">
            {isConnected ? 'FastMCP Remoto' : 'Motor Mock Integrado'}
          </span>
          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer ml-2"
            title="Limpiar logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic p-4 text-center">
            No se han registrado llamadas a herramientas MCP en esta sesión. Interactúa en el chat para ver las consultas en tiempo real.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{log.tool_name}</span>
                </span>
                <span className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.timestamp} • {log.latency_ms}ms
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">Parámetros enviados:</span>
                <pre className="text-cyan-300 bg-slate-900/80 p-2 rounded-xl mt-0.5 overflow-x-auto text-[10px]">
                  {JSON.stringify(log.arguments, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">Respuesta MCP:</span>
                <pre className="text-emerald-300 bg-slate-900/80 p-2 rounded-xl mt-0.5 overflow-x-auto text-[10px]">
                  {JSON.stringify(log.result, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
