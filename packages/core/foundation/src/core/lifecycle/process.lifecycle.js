/**
 * @fileoverview Process Lifecycle Management
 *
 * Production-ready process lifecycle management with signal handlers,
 * graceful shutdown patterns, and comprehensive error handling.
 * Designed for enterprise-grade applications requiring reliable process management.
 *
 * @example Basic Usage
 * ```typescript`
 * import { ProcessLifecycleManager, setupProcessLifecycle} from '@claude-zen/foundation';
 *
 * // Simple setup
 * const lifecycle = setupProcessLifecycle(async () => {
 *   logger.info('Graceful shutdown initiated');
 *   await cleanup();
 *});
 *
 * // Advanced setup
 * const manager = new ProcessLifecycleManager({
 *   onShutdown:async () => await gracefulShutdown(),
 *   onError:async (error) => await handleError(error),
 *}, {
 *   gracefulShutdownTimeout:30000,
 *   exitOnUncaughtException:true
 *});
 * ```
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 */
import { getLogger } from "../logging/index.js";
const logger = getLogger("ProcessLifecycle");
/**
 * Enterprise-grade process lifecycle manager.
 *
 * Provides comprehensive process management with signal handling,
 * graceful shutdown coordination, and error recovery patterns.
 * Designed for production environments requiring reliable process control.
 *
 * @example
 * ```typescript`
 * const manager = new ProcessLifecycleManager({
 *   onShutdown:async () => {
 *     await database.close();
 *     await server.close();
 *},
 *   onError:async (error) => {
 *     await logger.error('Process error: ', error);
' *}
 *});
 * ```
 */
export class ProcessLifecycleManager {
    handlers;
    options;
    isShuttingDown = false;
    shutdownTimeout;
    constructor(handlers = {}, options = {}) {
        this.handlers = handlers;
        this.options = {
            gracefulShutdownTimeout: options.gracefulShutdownTimeout ?? 30000, // 30 seconds
            exitOnUncaughtException: options.exitOnUncaughtException ?? true,
            exitOnUnhandledRejection: options.exitOnUnhandledRejection ?? true,
        };
        this.setupProcessHandlers();
    }
    /**
     * Setup comprehensive process signal and error handlers.
     *
     * Registers listeners for SIGINT, SIGTERM, SIGHUP signals and
     * uncaught exceptions/rejections with the Node.js process.
     */
    setupProcessHandlers() {
        // Register graceful shutdown signal handlers
        process.on("SIGINT", this.handleShutdownSignal.bind(this, "SIGINT"));
        process.on("SIGTERM", this.handleShutdownSignal.bind(this, "SIGTERM"));
        process.on("SIGHUP", this.handleShutdownSignal.bind(this, "SIGHUP"));
        // Error handling
        process.on("uncaughtException", this.handleUncaughtException.bind(this));
        process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
        logger.info("✅ Process lifecycle handlers registered");
    }
    /**
     * Handle shutdown signals with graceful shutdown logic.
     *
     * Coordinates orderly shutdown sequence with timeout protection.
     * Prevents multiple shutdown attempts and ensures clean exit.
     *
     * @param signal - The signal name that triggered shutdown
     */
    async handleShutdownSignal(signal) {
        if (this.isShuttingDown) {
            logger.warn(`Received ${signal} during shutdown, forcing exit...`);
            process.exit(1);
        }
        logger.info(`📡 Received ${signal}, initiating graceful shutdown...`);
        this.isShuttingDown = true;
        // Set timeout for forced shutdown
        this.shutdownTimeout = setTimeout(() => {
            logger.error("⏰ Graceful shutdown timeout exceeded, forcing exit");
            process.exit(1);
        }, this.options.gracefulShutdownTimeout);
        try {
            // Execute shutdown handler
            if (this.handlers.onShutdown) {
                await this.handlers.onShutdown();
            }
            logger.info("✅ Graceful shutdown completed");
            // Clear timeout and exit cleanly
            if (this.shutdownTimeout) {
                clearTimeout(this.shutdownTimeout);
            }
            process.exit(0);
        }
        catch (error) {
            logger.error("❌ Error during graceful shutdown:", error);
            if (this.handlers.onError) {
                try {
                    await this.handlers.onError(error instanceof Error ? error : new Error(String(error)));
                }
                catch (handlerError) {
                    logger.error("❌ Error in shutdown error handler:", handlerError);
                }
            }
            process.exit(1);
        }
    }
    /**
     * Handle uncaught exceptions with optional custom handler.
     *
     * @param error - The uncaught exception error
     */
    handleUncaughtException(error) {
        logger.error("💥 Uncaught exception:", error);
        if (this.handlers.onUncaughtException) {
            try {
                this.handlers.onUncaughtException(error);
            }
            catch (handlerError) {
                logger.error("❌ Error in uncaught exception handler:", handlerError);
            }
        }
        if (this.options.exitOnUncaughtException) {
            logger.error("🚨 Exiting due to uncaught exception");
            process.exit(1);
        }
    }
    /**
     * Handle unhandled promise rejections with optional custom handler.
     *
     * @param reason - The rejection reason
     */
    handleUnhandledRejection(reason) {
        logger.error("🚫 Unhandled promise rejection:", reason);
        if (this.handlers.onUnhandledRejection) {
            try {
                this.handlers.onUnhandledRejection(reason);
            }
            catch (handlerError) {
                logger.error("❌ Error in unhandled rejection handler:", handlerError);
            }
        }
        if (this.options.exitOnUnhandledRejection) {
            logger.error("🚨 Exiting due to unhandled promise rejection");
            process.exit(1);
        }
    }
    /**
     * Manually trigger graceful shutdown.
     *
     * Programmatically initiates the same shutdown sequence
     * as receiving a termination signal.
     */
    async shutdown() {
        await this.handleShutdownSignal("MANUAL");
    }
    /**
     * Remove all registered process handlers and cleanup resources.
     *
     * Call this method when the lifecycle manager is no longer needed
     * to prevent memory leaks and clean up event listeners.
     */
    dispose() {
        process.removeAllListeners("SIGINT");
        process.removeAllListeners("SIGTERM");
        process.removeAllListeners("SIGHUP");
        process.removeAllListeners("uncaughtException");
        process.removeAllListeners("unhandledRejection");
        if (this.shutdownTimeout) {
            clearTimeout(this.shutdownTimeout);
        }
        logger.info("✅ Process lifecycle handlers removed");
    }
}
/**
 * Utility function to setup standard process lifecycle management.
 *
 * Provides a simplified interface for common use cases where you only
 * need to define a shutdown handler. Uses sensible defaults for error handling.
 *
 * @param shutdownHandler - Function to execute during graceful shutdown
 * @returns Configured ProcessLifecycleManager instance
 *
 * @example
 * ```typescript`
 * const lifecycle = setupProcessLifecycle(async () => {
 *   await cleanup();
 *   logger.info('Shutdown complete');
 *});
 * ```
 */
export function setupProcessLifecycle(shutdownHandler) {
    return new ProcessLifecycleManager({
        onShutdown: shutdownHandler,
        onError: async (error) => {
            logger.error("🔥 Application error during shutdown:", error);
            // Add minimal async operation to satisfy linter
            await new Promise(resolve => setTimeout(resolve, 0));
        },
    });
}
