import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { captureException } from '../utils/errorTracking';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Report error to monitoring service
    captureException(error, {
      type: 'REACT_ERROR_BOUNDARY',
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    // Force page reload to ensure clean recovery from persistent errors
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-slate-500 mb-6 text-center max-w-md">
            {this.props.fallbackMessage || 'Ocorreu um erro inesperado. Tente novamente.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw size={18} />
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
