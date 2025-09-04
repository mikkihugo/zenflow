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
  announceErrors?: boolean; // Screen reader announcements
  focusManagement?: boolean; // Automatic focus management
  keyboardNavigation?: boolean; // Enhanced keyboard navigation
}

class ErrorBoundaryManager {
  private static instance: ErrorBoundaryManager;
  private errorCount = 0;
  private lastError: ErrorInfo | null = null;
  private config: ErrorBoundaryConfig = {
    announceErrors: true,
    focusManagement: true,
    keyboardNavigation: true
  };

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

    // Accessibility: Announce errors to screen readers
    if (this.config.announceErrors && typeof window !== 'undefined') {
      this.announceError(errorInfo);
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

  private announceError(errorInfo: ErrorInfo): void {
    // Create a live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    const message = `Application error occurred: ${errorInfo.error.message}. Error recovery options are available.`;
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove the announcement after screen readers have processed it
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
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

  /**
   * Focus management utility for accessibility
   * Moves focus to the error boundary fallback component
   */
  focusErrorFallback(elementId = 'error-boundary-fallback'): void {
    if (!this.config.focusManagement) return;
    
    setTimeout(() => {
      const errorElement = document.getElementById(elementId) ||
                          document.querySelector('[role="alert"]') ||
                          document.querySelector('.error-boundary-fallback');
      
      if (errorElement && errorElement instanceof HTMLElement) {
        errorElement.focus();
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  /**
   * Keyboard navigation enhancement
   * Sets up global keyboard handlers for error recovery
   */
  setupKeyboardNavigation(): () => void {
    if (!this.config.keyboardNavigation) return () => {};
    
    const handleKeydown = (event: KeyboardEvent) => {
      // Global keyboard shortcuts for error recovery
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            // Ctrl/Cmd + R: Reload page (but let default behavior handle it)
            break;
          case 'Escape':
            // Escape: Clear error state if configured
            if (this.config.onError) {
              event.preventDefault();
              this.reset();
            }
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
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
 * Accessibility-enhanced error handler for Svelte components
 * Includes screen reader announcements and focus management
 */
export function createAccessibleErrorHandler(componentName: string, options: {
  announceError?: boolean;
  focusOnError?: boolean;
  retryCallback?: () => void;
} = {}) {
  const errorBoundary = ErrorBoundaryManager.getInstance();
  const { announceError = true, focusOnError = true, retryCallback } = options;
  
  return (error: Error): void => {
    const errorInfo = errorBoundary.handleError(error, componentName);
    
    // Accessibility enhancements
    if (focusOnError) {
      errorBoundary.focusErrorFallback();
    }
    
    if (announceError) {
      errorBoundary.announceError(errorInfo);
    }
    
    // Set up retry callback if provided
    if (retryCallback) {
      const retryHandler = () => {
        try {
          retryCallback();
          errorBoundary.reset();
        } catch (retryError) {
          errorBoundary.handleError(retryError as Error, `${componentName}:Retry`);
        }
      };
      
      // Store retry handler for use by fallback component
      (errorInfo as any).retryHandler = retryHandler;
    }
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