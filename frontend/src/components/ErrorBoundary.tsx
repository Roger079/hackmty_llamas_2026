import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="banorte-card p-5 my-3 border border-amber-200 bg-amber-50/70 text-slate-800 rounded-2xl">
          <div className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>{this.props.fallbackTitle || 'Aviso de visualización temporal'}</span>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Un elemento visual no pudo representarse ({this.state.error?.message}). El resto de la banca continúa operando con normalidad.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reintentar componente</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
