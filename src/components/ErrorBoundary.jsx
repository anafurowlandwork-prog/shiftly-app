import React from 'react';
import { RefreshCw, ArrowRight, Home, ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#09090b',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: '#0052ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px rgba(0, 82, 255, 0.4)'
          }}>
            <ShieldAlert size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Shiftly Quick Recovery
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#a1a1aa', textAlign: 'center', maxWidth: '320px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            A temporary screen glitch occurred. Tap below to refresh and continue smoothly.
          </p>

          <button
            onClick={this.handleReset}
            style={{
              background: '#0052ff',
              color: '#ffffff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 82, 255, 0.3)'
            }}
          >
            <RefreshCw size={18} /> Continue to Booking
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
