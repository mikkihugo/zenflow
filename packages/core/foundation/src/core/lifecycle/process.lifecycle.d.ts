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
/**
 * Lifecycle event handlers for process management.
 *
 * Defines callback functions for various process lifecycle events,
 * enabling custom behavior during shutdown, errors, and exceptions.
 */
export interface LifecycleHandlers {
    /** Handler for graceful shutdown operations */
    onShutdown?: () => Promise<void>;
    /** Handler for errors during shutdown */
    onError?: (error: Error) => Promise<void>;
    /** Handler for uncaught exceptions */
    onUncaughtException?: (error: Error) => void;
    /** Handler for unhandled promise rejections */
    onUnhandledRejection?: (reason: unknown) => void;
}
/**
 * Configuration options for process management.
 *
 * Controls behavior of the process lifecycle manager including
 * timeout durations and exit strategies for different error conditions.
 */
export interface ProcessOptions {
    /** Timeout in milliseconds for graceful shutdown (default:30000) */
    gracefulShutdownTimeout?: number;
    /** Whether to exit process on uncaught exceptions (default:true) */
    exitOnUncaughtException?: boolean;
    /** Whether to exit process on unhandled rejections (default:true) */
    exitOnUnhandledRejection?: boolean;
}
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
export declare class ProcessLifecycleManager {
    private handlers;
    private options;
    private isShuttingDown;
    private shutdownTimeout?;
    constructor(handlers?: LifecycleHandlers, options?: ProcessOptions);
    /**
     * Setup comprehensive process signal and error handlers.
     *
     * Registers listeners for SIGINT, SIGTERM, SIGHUP signals and
     * uncaught exceptions/rejections with the Node.js process.
     */
    private setupProcessHandlers;
    /**
     * Handle shutdown signals with graceful shutdown logic.
     *
     * Coordinates orderly shutdown sequence with timeout protection.
     * Prevents multiple shutdown attempts and ensures clean exit.
     *
     * @param signal - The signal name that triggered shutdown
     */
    private handleShutdownSignal;
    /**
     * Handle uncaught exceptions with optional custom handler.
     *
     * @param error - The uncaught exception error
     */
    private handleUncaughtException;
    /**
     * Handle unhandled promise rejections with optional custom handler.
     *
     * @param reason - The rejection reason
     */
    private handleUnhandledRejection;
    /**
     * Manually trigger graceful shutdown.
     *
     * Programmatically initiates the same shutdown sequence
     * as receiving a termination signal.
     */
    shutdown(): Promise<void>;
    /**
     * Remove all registered process handlers and cleanup resources.
     *
     * Call this method when the lifecycle manager is no longer needed
     * to prevent memory leaks and clean up event listeners.
     */
    dispose(): void;
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
export declare function setupProcessLifecycle(shutdownHandler: () => Promise<void>): ProcessLifecycleManager;
//# sourceMappingURL=process.lifecycle.d.ts.map