/**
 * @fileoverview React Error Boundary for TUI Components
 *
 * Provides comprehensive error handling for React components in the TUI,
 * preventing crashes and providing useful error information.
 */

import { Box, Text } from 'ink';
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo?: React.ErrorInfo }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

/**
 * Default error display component for TUI.
 */
const DefaultErrorDisplay: React.FC<{
  error: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
  showDetails?: boolean;
}> = ({ error, errorInfo, errorId, showDetails = false }) => (
  <Box flexDirection="column" padding={1}>
    <Box borderStyle="single" borderColor="red" padding={1}>
      <Box flexDirection="column">
        <Text bold color="red">
          🚨 TUI Error
        </Text>
        <Text color="red">{error.message}</Text>
        {showDetails && (
          <>
            <Box marginTop={1}>
              <Text dimColor>Error ID: {errorId}</Text>
            </Box>
            {error.stack && (
              <Box marginTop={1}>
                <Text dimColor>Stack Trace:</Text>
                <Text wrap="wrap">
                  {error.stack.split('\n').slice(0, 5).join('\n')}
                </Text>
              </Box>
            )}
            {errorInfo?.componentStack && (
              <Box marginTop={1}>
                <Text dimColor>Component Stack:</Text>
                <Text wrap="wrap">
                  {errorInfo.componentStack.split('\n').slice(0, 3).join('\n')}
                </Text>
              </Box>
            )}
          </>
        )}
        <Box marginTop={1}>
          <Text dimColor>
            Press 'r' to retry, 'q' to quit, or 'Esc' to return to menu
          </Text>
        </Box>
      </Box>
    </Box>
  </Box>
);

/**
 * React Error Boundary for TUI components.
 *
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application.
 */
export class TUIErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID for tracking
    const errorId = `tui-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details
    console.error('TUI Error Boundary caught an error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      errorId: this.state.errorId,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
          />
        );
      }

      // Use default error display
      return (
        <DefaultErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }

  /**
   * Reset error boundary state (useful for retry functionality).
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: '',
    });
  };
}

/**
 * Hook for resetting error boundary from child components.
 */
export function useErrorBoundaryReset(): () => void {
  const [, setResetCount] = React.useState(0);

  return React.useCallback(() => {
    setResetCount((count) => count + 1);
  }, []);
}

/**
 * Higher-order component to wrap components with error boundary.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <TUIErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </TUIErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default TUIErrorBoundary;
