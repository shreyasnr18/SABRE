import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #dc2626',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ color: '#ef4444', margin: '0 0 12px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#ef4444" /> SABRE Runtime Safeguard Triggered
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              An unexpected render exception was caught. The system remained isolated instead of crashing to a blank screen.
            </p>
            <div style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#fca5a5',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              {this.state.error ? this.state.error.toString() : 'Unknown runtime error'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: '#0078d4',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload SABRE Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
