/**
 * @fileoverview TUI Wrapper - TTY-compatible wrapper for Ink components
 *
 * This wrapper handles TTY detection and provides fallbacks for non-TTY environments.
 */

import { isRawModeSupported } from 'ink';
import React from 'react';

export interface TUIWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * TTY-compatible wrapper for Ink components.
 *
 * @param props - Component props
 * @returns React component that handles TTY compatibility
 */
export const TUIWrapper: React.FC<TUIWrapperProps> = ({
  children,
  fallbackMessage = 'TUI not supported in current environment',
}) => {
  // Check if raw mode (TTY) is supported
  if (!isRawModeSupported(process.stdin)) {
    console.log(`⚠️ ${fallbackMessage}`);
    console.log('Raw mode is required for interactive TUI components.');
    console.log('Please run in a proper terminal environment.');

    // Return a simple text-based fallback
    return React.createElement('div', {}, fallbackMessage);
  }

  return React.createElement(React.Fragment, {}, children);
};

/**
 * Creates a TTY-safe render function for Ink apps.
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
  } = {}
): Promise<void> {
  const { fallbackMessage, exitOnError = true } = options;

  try {
    // Check TTY support first
    if (!isRawModeSupported(process.stdin)) {
      console.log(
        `⚠️ ${fallbackMessage || 'TUI not supported in current environment'}`
      );
      console.log('This requires a proper terminal with TTY support.');

      if (exitOnError) {
        process.exit(1);
      }
      return;
    }

    // Dynamic import to avoid loading Ink if not supported
    const { render } = await import('ink');

    // Wrap component in error boundary
    const wrappedComponent = React.createElement(
      TUIWrapper,
      {
        fallbackMessage,
      },
      component
    );

    const { unmount } = render(wrappedComponent);

    // Handle graceful shutdown
    const cleanup = () => {
      try {
        unmount();
      } catch (error) {
        console.error('Error during TUI cleanup:', error);
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  } catch (error) {
    console.error('Failed to render TUI:', error);

    if (exitOnError) {
      process.exit(1);
    }
  }
}

/**
 * Check if TUI is supported in the current environment.
 *
 * @returns Object with support status and reason
 */
export function checkTUISupport(): {
  supported: boolean;
  reason: string;
} {
  if (!process.stdin.isTTY) {
    return {
      supported: false,
      reason: 'No TTY available (stdin is not a terminal)',
    };
  }

  if (!isRawModeSupported(process.stdin)) {
    return {
      supported: false,
      reason: 'Raw mode not supported on current stdin',
    };
  }

  return {
    supported: true,
    reason: 'TUI fully supported',
  };
}

export default TUIWrapper;
