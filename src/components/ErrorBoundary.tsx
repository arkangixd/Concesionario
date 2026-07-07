import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear all local storage keys related to the app to force a clean reset
      const keys = [
        'concesionario_users',
        'concesionario_vehicles',
        'concesionario_sales',
        'concesionario_alerts',
        'concesionario_logs',
        'concesionario_currentUser'
      ];
      keys.forEach(k => localStorage.removeItem(k));
      // Reload page
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear local storage", e);
      localStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-950/10 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-950/10 blur-[120px]"></div>
          </div>

          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10 text-center space-y-6">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Algo no salió como se esperaba
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                El sistema detectó un conflicto de datos en el navegador (probablemente debido a una sesión anterior obsoleta).
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/45 border border-white/5 rounded-xl text-left font-mono text-[10px] text-red-300 max-h-24 overflow-y-auto break-all scrollbar-none">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 border border-white/10 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restablecer Datos del Sistema</span>
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
