import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Bug, X, Send } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  showReportButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  isReporting: boolean;
  reportSent: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isReporting: false,
      reportSent: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    this.props.onRetry?.();
  };

  handleReportError = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    this.setState({ isReporting: true });

    try {
      // In a real app, send to error tracking service
      const errorReport = {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Error report submitted:', errorReport);
      this.setState({ reportSent: true, isReporting: false });
    } catch {
      this.setState({ isReporting: false });
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails, isReporting, reportSent } = this.state;
    const { children, fallback, showReportButton = true } = this.props;

    if (!hasError) {
      return children;
    }

    // Custom fallback if provided
    if (fallback) {
      return fallback;
    }

    const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[400px] flex items-center justify-center p-6"
      >
        <div className="glass rounded-2xl p-8 max-w-lg w-full text-center shadow-elevated">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-full blur-xl opacity-30" />
            <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            Something went wrong
          </h2>

          {/* Description */}
          <p className="text-stone-500 mb-6">
            We apologize for the inconvenience. An unexpected error has occurred.
            {error && (
              <span className="block mt-2 text-sm text-red-500 font-medium">
                {error.message}
              </span>
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleRetry}
              className="btn-vibrant flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </motion.button>

            {showReportButton && !reportSent && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleReportError}
                disabled={isReporting}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                {isReporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isReporting ? 'Sending...' : 'Report Issue'}</span>
              </motion.button>
            )}

            {reportSent && (
              <span className="flex items-center justify-center gap-2 px-6 py-3 text-emerald-600 font-medium">
                <RefreshCw className="w-4 h-4" />
                Report sent!
              </span>
            )}
          </div>

          {/* Developer Details Toggle */}
          {isDev && (
            <div className="border-t border-stone-200 pt-4">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-2 mx-auto text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                <Bug className="w-4 h-4" />
                {showDetails ? 'Hide Details' : 'Show Developer Details'}
                {showDetails ? <X className="w-3 h-3" /> : null}
              </button>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-left"
                >
                  <div className="bg-stone-900 rounded-xl p-4 overflow-auto max-h-64">
                    <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">
                      {error?.stack || error?.toString()}
                    </pre>
                    {errorInfo?.componentStack && (
                      <>
                        <div className="my-2 border-t border-stone-700" />
                        <pre className="text-xs text-orange-300 font-mono whitespace-pre-wrap">
                          Component Stack:{errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwError = React.useCallback((err: Error | unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error(String(err)));
    }
  }, []);

  return { error, resetError, throwError };
}

// Error boundary wrapper for async errors
export const AsyncErrorBoundary: React.FC<{
  children: ReactNode;
  error: Error | null;
  onRetry: () => void;
  showReportButton?: boolean;
}> = ({ children, error, onRetry, showReportButton }) => {
  if (error) {
    return (
      <ErrorBoundary
        fallback={
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[400px] flex items-center justify-center p-6"
          >
            <div className="glass rounded-2xl p-8 max-w-lg w-full text-center shadow-elevated">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-full blur-xl opacity-30" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-stone-500 mb-6">
                {error.message}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="btn-vibrant flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </motion.button>
            </div>
          </motion.div>
        }
        showReportButton={showReportButton}
      >
        {null}
      </ErrorBoundary>
    );
  }

  return children;
};
