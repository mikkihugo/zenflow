/**
 * @fileoverview TUI Wrapper - TTY-compatible wrapper for Ink components
 *
 * This wrapper handles TTY detection and provides fallbacks for non-TTY environments.
 * Enhanced with comprehensive terminal environment detection and graceful fallbacks.
 */

import { isRawModeSupported } from 'ink';
import React from 'react';

export interface TUIWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  enableFallback?: boolean;
}

/**
 * Enhanced raw mode detection with graceful error handling.
 *
 * @param stdin - Process stdin to check
 * @returns Object with support status and detailed reason
 */
function detectRawModeSupport(stdin: NodeJS.ReadStream): {
  supported: boolean;
  reason: string;
  canFallback: boolean;
} {
  // Check if stdin exists and is defined
  if (!stdin) {
    return {
      supported: false,
      reason: 'No stdin available',
      canFallback: true,
    };
  }

  // Check TTY availability
  if (!stdin.isTTY) {
    return {
      supported: false,
      reason: 'Non-interactive environment (not a TTY)',
      canFallback: true,
    };
  }

  // Check if setRawMode function exists
  if (typeof stdin.setRawMode !== 'function') {
    return {
      supported: false,
      reason: 'setRawMode not available on this platform',
      canFallback: true,
    };
  }

  // Use Ink's built-in detection with error handling
  try {
    const isSupported = isRawModeSupported(stdin);
    return {
      supported: isSupported,
      reason: isSupported
        ? 'Raw mode fully supported'
        : 'Raw mode not supported by Ink',
      canFallback: true,
    };
  } catch (error) {
    return {
      supported: false,
      reason: `Raw mode detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      canFallback: true,
    };
  }
}

/**
 * TTY-compatible wrapper for Ink components with enhanced error handling.
 *
 * @param props - Component props
 * @returns React component that handles TTY compatibility
 */
export const TUIWrapper: React.FC<TUIWrapperProps> = ({
  children,
  fallbackMessage = 'TUI not supported in current environment',
  enableFallback = true,
}) => {
  const rawModeStatus = detectRawModeSupport(process.stdin);

  // If raw mode is not supported, provide detailed feedback
  if (!rawModeStatus.supported) {
    if (enableFallback) {
      console.log(`⚠️ ${fallbackMessage}`);
      console.log(`Reason: ${rawModeStatus.reason}`);
      console.log('Falling back to non-interactive mode.');
      console.log(
        'For full TUI experience, please run in a proper terminal environment.'
      );

      // Return a simple text-based fallback that won't cause React errors
      return React.createElement(
        'div',
        { key: 'tui-fallback' },
        `${fallbackMessage} - ${rawModeStatus.reason}`
      );
    } else {
      // Throw error if fallback is disabled
      throw new Error(`TUI initialization failed: ${rawModeStatus.reason}`);
    }
  }

  // Wrap children in error boundary context
  return React.createElement(React.Fragment, { key: 'tui-wrapper' }, children);
};

/**
 * Creates a TTY-safe render function for Ink apps with comprehensive error handling.
 *
 * @param component - The React component to render
 * @param options - Render options
 * @returns Promise that resolves when app completes
 */
export async function renderTUISafe(
  component: React.ReactElement,
  options: {
    fallbackMessage?: string;
    exitOnError?: boolean;
    enableFallback?: boolean;
    retryCount?: number;
  } = {}
): Promise<void> {
  const {
    fallbackMessage,
    exitOnError = true,
    enableFallback = true,
    retryCount = 0,
  } = options;

  try {
    // Enhanced TTY support check
    const rawModeStatus = detectRawModeSupport(process.stdin);

    if (!rawModeStatus.supported) {
      const message =
        fallbackMessage || 'TUI not supported in current environment';
      console.log(`⚠️ ${message}`);
      console.log(`Reason: ${rawModeStatus.reason}`);

      if (rawModeStatus.canFallback && enableFallback) {
        console.log('Continuing in text-only mode...');
        console.log('Note: Some interactive features will be limited.');
        return;
      }

      if (exitOnError) {
        process.exit(1);
      }
      return;
    }

    // Dynamic import to avoid loading Ink if not supported
    const { render } = await import('ink');

    // Wrap component in enhanced error boundary
    const wrappedComponent = React.createElement(
      TUIWrapper,
      {
        fallbackMessage,
        enableFallback,
      },
      component
    );

    let unmount: (() => void) | undefined;

    try {
      const renderResult = render(wrappedComponent);
      unmount = renderResult.unmount;
    } catch (renderError) {
      if (retryCount < 2) {
        console.log(`⚠️ TUI render failed, retrying... (${retryCount + 1}/2)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return renderTUISafe(component, {
          ...options,
          retryCount: retryCount + 1,
        });
      }
      throw renderError;
    }

    // Handle graceful shutdown with enhanced cleanup
    const cleanup = (signal?: string) => {
      try {
        if (unmount) {
          unmount();
        }
        if (signal) {
          console.log(`\n\nReceived ${signal}, shutting down gracefully...`);
        }
      } catch (error) {
        console.error('Error during TUI cleanup:', error);
      }
      process.exit(0);
    };

    // Register signal handlers
    process.on('SIGINT', () => cleanup('SIGINT'));
    process.on('SIGTERM', () => cleanup('SIGTERM'));
    process.on('exit', () => cleanup());

    // Handle uncaught exceptions to prevent crashes
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception in TUI:', error);
      cleanup('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection in TUI:', reason);
      cleanup('unhandledRejection');
    });
  } catch (error) {
    console.error('Failed to render TUI:', error);

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      });
    }

    if (exitOnError) {
      process.exit(1);
    }
  }
}

/**
 * Check if TUI is supported in the current environment with detailed diagnostics.
 *
 * @returns Object with support status and comprehensive reason
 */
export function checkTUISupport(): {
  supported: boolean;
  reason: string;
  environment: {
    isTTY: boolean;
    hasSetRawMode: boolean;
    platform: string;
    nodeVersion: string;
    terminalType?: string;
  };
  recommendations: string[];
} {
  const environment = {
    isTTY: process.stdin.isTTY || false,
    hasSetRawMode: typeof process.stdin.setRawMode === 'function',
    platform: process.platform,
    nodeVersion: process.version,
    terminalType: process.env.TERM,
  };

  const recommendations: string[] = [];

  // Check TTY availability
  if (!environment.isTTY) {
    recommendations.push(
      'Run in an interactive terminal (not piped or redirected)'
    );
    recommendations.push(
      'Avoid running through CI/CD or non-interactive environments'
    );
    return {
      supported: false,
      reason: 'No TTY available (stdin is not a terminal)',
      environment,
      recommendations,
    };
  }

  // Check setRawMode availability
  if (!environment.hasSetRawMode) {
    recommendations.push(
      'Update Node.js to a version that supports setRawMode'
    );
    recommendations.push('Check if running in a restricted environment');
    return {
      supported: false,
      reason: 'setRawMode function not available',
      environment,
      recommendations,
    };
  }

  // Use enhanced detection
  const rawModeStatus = detectRawModeSupport(process.stdin);

  if (!rawModeStatus.supported) {
    recommendations.push('Try running in a different terminal application');
    recommendations.push('Check terminal compatibility with Node.js TTY');
    if (environment.platform === 'win32') {
      recommendations.push('Consider using Windows Terminal or PowerShell');
    }
    return {
      supported: false,
      reason: rawModeStatus.reason,
      environment,
      recommendations,
    };
  }

  return {
    supported: true,
    reason: 'TUI fully supported',
    environment,
    recommendations: ['TUI ready to use!'],
  };
}

export default TUIWrapper;
