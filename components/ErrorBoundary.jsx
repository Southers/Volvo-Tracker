/**
 * Error Boundary Component
 * Catches errors and prevents the entire app from crashing
 */
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isDetailsOpen: false,
      isHoveringTryAgain: false,
      isHoveringDashboard: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // TODO: Send to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ isDetailsOpen: !prev.isDetailsOpen }));
  };

  handleDetailsKeyDown = (e) => {
    // Space or Enter to toggle
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.toggleDetails();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#fafafa',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
          <div style={{
            maxWidth: '600px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#0f172a',
                margin: 0
              }}>
                Something went wrong
              </h2>
            </div>

            <p style={{
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              We're sorry, but something unexpected happened. The error has been logged
              and we'll look into it. You can try refreshing the page or going back to the dashboard.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={this.state.isDetailsOpen}
                  aria-controls="error-details"
                  onClick={this.toggleDetails}
                  onKeyDown={this.handleDetailsKeyDown}
                  style={{
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: '#991b1b',
                    marginBottom: this.state.isDetailsOpen ? '12px' : 0,
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.textDecoration = 'underline'}
                  onBlur={(e) => e.target.style.textDecoration = 'none'}
                >
                  {this.state.isDetailsOpen ? '▼' : '▶'} Error Details (Development Only)
                </div>
                {this.state.isDetailsOpen && (
                  <pre
                    id="error-details"
                    style={{
                      overflow: 'auto',
                      fontSize: '12px',
                      color: '#7f1d1d',
                      margin: 0
                    }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleReset}
                onMouseEnter={() => this.setState({ isHoveringTryAgain: true })}
                onMouseLeave={() => this.setState({ isHoveringTryAgain: false })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: this.state.isHoveringTryAgain ? '#1e293b' : '#0f172a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                onMouseEnter={() => this.setState({ isHoveringDashboard: true })}
                onMouseLeave={() => this.setState({ isHoveringDashboard: false })}
                style={{
                  padding: '12px 24px',
                  backgroundColor: this.state.isHoveringDashboard ? '#f8fafc' : 'white',
                  color: '#0f172a',
                  border: `1px solid ${this.state.isHoveringDashboard ? '#cbd5e1' : '#e2e8f0'}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
