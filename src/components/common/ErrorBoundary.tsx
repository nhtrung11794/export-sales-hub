'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, maxWidth: 640, margin: '40px auto', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--accent-danger)', borderRadius: 14, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <AlertTriangle size={28} color="var(--accent-danger)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fca5a5' }}>
              {this.props.fallbackTitle || 'Đã xảy ra lỗi khi tải khu vực này'}
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.86rem', lineHeight: 1.5, marginBottom: 16 }}>
            {this.state.error?.message || 'Lỗi không xác định.'}
          </p>
          {this.state.error?.stack && (
            <pre style={{ background: '#0f172a', padding: 12, borderRadius: 8, fontSize: '.72rem', color: '#94a3b8', overflowX: 'auto', maxHeight: 200, marginBottom: 20 }}>
              {this.state.error.stack}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.84rem' }}
          >
            <RefreshCw size={15} /> Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
