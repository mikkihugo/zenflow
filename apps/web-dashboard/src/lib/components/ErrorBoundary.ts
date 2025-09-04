import type { SvelteComponent } from 'svelte';

/**
 * Enterprise-grade error boundary utility for Claude Code Zen
 * Provides comprehensive error handling with TaskMaster integration
 */

export interface ErrorInfo {
  error: Error;
  timestamp: string;
  componentStack?: string;
  userAgent: string;
  url: string;
  userId?: string;
}

export interface ErrorBoundaryConfig {
  fallbackComponent?: typeof SvelteComponent;
  onError?: (errorInfo: ErrorInfo) => void;
  enableTaskMasterReporting?: boolean;
  enableTelemetry?: boolean;
}

class ErrorBoundaryManager {
  private static instance: ErrorBoundaryManager;
  private errorCount = 0;
  private lastError: ErrorInfo | null = null;
  private config: ErrorBoundaryConfig = {};

  static getInstance(): ErrorBoundaryManager {
    if (!ErrorBoundaryManager.instance) {
      ErrorBoundaryManager.instance = new ErrorBoundaryManager();
    }
    return ErrorBoundaryManager.instance;
  }

  configure(config: ErrorBoundaryConfig): void {
    this.config = { ...this.config, ...config };
  }

  handleError(error: Error, component?: string): ErrorInfo {
    const errorInfo: ErrorInfo = {
      error,
      timestamp: new Date().toISOString(),
      componentStack: component,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errorCount++;
    this.lastError = errorInfo;

    // Call custom error handler if provided
    if (this.config.onError) {
      this.config.onError(errorInfo);
    }

    // Report to TaskMaster if enabled
    if (this.config.enableTaskMasterReporting) {
      this.reportToTaskMaster(errorInfo);
    }

    // Send telemetry if enabled
    if (this.config.enableTelemetry) {
      this.sendTelemetry(errorInfo);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.log('Component:', component);
      console.log('Timestamp:', errorInfo.timestamp);
      console.log('URL:', errorInfo.url);
      console.groupEnd();
    }

    return errorInfo;
  }

  private async reportToTaskMaster(errorInfo: ErrorInfo): Promise<void> {
    try {
      // TaskMaster integration for enterprise error tracking
      const response = await fetch('/api/taskmaster/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'frontend-error',
          severity: 'high',
          message: errorInfo.error.message,
          stack: errorInfo.error.stack,
          component: errorInfo.componentStack,
          timestamp: errorInfo.timestamp,
          metadata: {
            url: errorInfo.url,
            userAgent: errorInfo.userAgent,
            errorCount: this.errorCount,
          },
        }),
      });

      if (!response.ok) {
        console.warn('Failed to report error to TaskMaster:', response.statusText);
      }
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError);
    }
  }

  private async sendTelemetry(errorInfo: ErrorInfo): Promise<void> {
    try {
      // Send to monitoring/telemetry service
      const response = await fetch('/api/telemetry/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'frontend_error',
          properties: {
            error_message: errorInfo.error.message,
            error_stack: errorInfo.error.stack,
            component: errorInfo.componentStack,
            timestamp: errorInfo.timestamp,
            url: errorInfo.url,
            user_agent: errorInfo.userAgent,
          },
        }),
      });

      if (!response.ok) {
        console.warn('Failed to send error telemetry:', response.statusText);
      }
    } catch (telemetryError) {
      console.warn('Telemetry reporting failed:', telemetryError);
    }
  }

  getErrorStats(): { count: number; lastError: ErrorInfo | null } {
    return {
      count: this.errorCount,
      lastError: this.lastError,
    };
  }

  reset(): void {
    this.errorCount = 0;
    this.lastError = null;
  }
}

/**
 * Hook for Svelte components to handle errors
 * Usage in component script:
 * 
 * import { createErrorHandler } from '$lib/components/ErrorBoundary';
 * const handleError = createErrorHandler('ComponentName');
 * 
 * // In component code:
 * try {
 *   // risky operation
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function createErrorHandler(componentName: string) {
  const errorBoundary = ErrorBoundaryManager.getInstance();
  
  return (error: Error): void => {
    errorBoundary.handleError(error, componentName);
  };
}

/**
 * Global error handler setup
 * Call this in app initialization
 */
export function setupGlobalErrorHandling(config?: ErrorBoundaryConfig): void {
  const errorBoundary = ErrorBoundaryManager.getInstance();
  
  if (config) {
    errorBoundary.configure(config);
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorBoundary.handleError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      'Global'
    );
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    errorBoundary.handleError(
      new Error(`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`),
      'Global'
    );
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      errorBoundary.handleError(
        new Error(`Resource failed to load: ${(event.target as any)?.src || 'unknown'}`),
        'Resource'
      );
    }
  }, true);
}

export const errorBoundary = ErrorBoundaryManager.getInstance();