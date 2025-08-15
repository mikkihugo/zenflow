/**
 * @fileoverview Process Lifecycle Management
 *
 * Extracted from claude-zen-integrated.ts - preserves signal handlers,
 * graceful shutdown patterns, and process management.
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('ProcessLifecycle');

export interface LifecycleHandlers {
  onShutdown?: () => Promise<void>;
  onError?: (error: Error) => Promise<void>;
  onUncaughtException?: (error: Error) => void;
  onUnhandledRejection?: (reason: unknown) => void;
}

export interface ProcessOptions {
  gracefulShutdownTimeout?: number;
  exitOnUncaughtException?: boolean;
  exitOnUnhandledRejection?: boolean;
}

/**
 * Process Lifecycle Manager
 * Preserves signal handling patterns from claude-zen-integrated.ts
 */
export class ProcessLifecycleManager {
  private handlers: LifecycleHandlers;
  private options: Required<ProcessOptions>;
  private isShuttingDown = false;
  private shutdownTimeout?: NodeJS.Timeout;

  constructor(handlers: LifecycleHandlers = {}, options: ProcessOptions = {}) {
    this.handlers = handlers;
    this.options = {
      gracefulShutdownTimeout: options.gracefulShutdownTimeout ?? 30000, // 30 seconds
      exitOnUncaughtException: options.exitOnUncaughtException ?? true,
      exitOnUnhandledRejection: options.exitOnUnhandledRejection ?? true,
    };

    this.setupProcessHandlers();
  }

  /**
   * Setup comprehensive process handlers
   * Preserves patterns from claude-zen-integrated.ts
   */
  private setupProcessHandlers(): void {
    // Graceful shutdown signals - preserved pattern
    process.on('SIGINT', this.handleShutdownSignal.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.handleShutdownSignal.bind(this, 'SIGTERM'));
    process.on('SIGHUP', this.handleShutdownSignal.bind(this, 'SIGHUP'));

    // Error handling
    process.on('uncaughtException', this.handleUncaughtException.bind(this));
    process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));

    logger.info('✅ Process lifecycle handlers registered');
  }

  /**
   * Handle shutdown signals
   * Preserves graceful shutdown pattern from claude-zen-integrated.ts
   */
  private async handleShutdownSignal(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn(`Received ${signal} during shutdown, forcing exit...`);
      process.exit(1);
      return;
    }

    logger.info(`📡 Received ${signal}, initiating graceful shutdown...`);
    this.isShuttingDown = true;

    // Set timeout for forced shutdown
    this.shutdownTimeout = setTimeout(() => {
      logger.error('⏰ Graceful shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, this.options.gracefulShutdownTimeout);

    try {
      // Execute shutdown handler
      if (this.handlers.onShutdown) {
        await this.handlers.onShutdown();
      }

      logger.info('✅ Graceful shutdown completed');

      // Clear timeout and exit cleanly
      if (this.shutdownTimeout) {
        clearTimeout(this.shutdownTimeout);
      }

      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);

      if (this.handlers.onError) {
        try {
          await this.handlers.onError(
            error instanceof Error ? error : new Error(String(error))
          );
        } catch (handlerError) {
          logger.error('❌ Error in shutdown error handler:', handlerError);
        }
      }

      process.exit(1);
    }
  }

  /**
   * Handle uncaught exceptions
   */
  private handleUncaughtException(error: Error): void {
    logger.error('💥 Uncaught exception:', error);

    if (this.handlers.onUncaughtException) {
      try {
        this.handlers.onUncaughtException(error);
      } catch (handlerError) {
        logger.error('❌ Error in uncaught exception handler:', handlerError);
      }
    }

    if (this.options.exitOnUncaughtException) {
      logger.error('🚨 Exiting due to uncaught exception');
      process.exit(1);
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(reason: unknown): void {
    logger.error('🚫 Unhandled promise rejection:', reason);

    if (this.handlers.onUnhandledRejection) {
      try {
        this.handlers.onUnhandledRejection(reason);
      } catch (handlerError) {
        logger.error('❌ Error in unhandled rejection handler:', handlerError);
      }
    }

    if (this.options.exitOnUnhandledRejection) {
      logger.error('🚨 Exiting due to unhandled promise rejection');
      process.exit(1);
    }
  }

  /**
   * Manually trigger graceful shutdown
   */
  async shutdown(): Promise<void> {
    await this.handleShutdownSignal('MANUAL');
  }

  /**
   * Remove all process handlers
   */
  dispose(): void {
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGHUP');
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('unhandledRejection');

    if (this.shutdownTimeout) {
      clearTimeout(this.shutdownTimeout);
    }

    logger.info('✅ Process lifecycle handlers removed');
  }
}

/**
 * Utility function to setup standard process lifecycle
 * Simplified interface for common use cases
 */
export function setupProcessLifecycle(
  shutdownHandler: () => Promise<void>
): ProcessLifecycleManager {
  return new ProcessLifecycleManager({
    onShutdown: shutdownHandler,
    onError: async (error: Error) => {
      logger.error('🔥 Application error during shutdown:', error);
    },
  });
}
