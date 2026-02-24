import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-lg bg-white border border-red-200 rounded-xl p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">{this.state.errorMessage}</p>
            <button
              onClick={this.handleRetry}
              className="h-10 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
