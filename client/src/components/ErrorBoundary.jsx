import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030712',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#6366f1', marginBottom: '16px' }}>Oops! Something went wrong.</h1>
          <p style={{ color: '#94a3b8', maxWidth: '500px', marginBottom: '24px' }}>
            We encountered a runtime error. This might be due to a missing dependency or a configuration issue.
          </p>
          <pre style={{
            background: '#0f172a',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.8rem',
            color: '#ff4b4b',
            maxWidth: '100%',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
