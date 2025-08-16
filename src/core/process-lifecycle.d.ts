/**
 * @fileoverview Process Lifecycle Management
 *
 * Extracted from claude-zen-integrated.ts - preserves signal handlers,
 * graceful shutdown patterns, and process management.
 */
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
export declare class ProcessLifecycleManager {
    private handlers;
    private options;
    private isShuttingDown;
    private shutdownTimeout?;
    constructor(handlers?: LifecycleHandlers, options?: ProcessOptions);
    /**
     * Setup comprehensive process handlers
     * Preserves patterns from claude-zen-integrated.ts
     */
    private setupProcessHandlers;
    /**
     * Handle shutdown signals
     * Preserves graceful shutdown pattern from claude-zen-integrated.ts
     */
    private handleShutdownSignal;
    /**
     * Handle uncaught exceptions
     */
    private handleUncaughtException;
    /**
     * Handle unhandled promise rejections
     */
    private handleUnhandledRejection;
    /**
     * Manually trigger graceful shutdown
     */
    shutdown(): Promise<void>;
    /**
     * Remove all process handlers
     */
    dispose(): void;
}
/**
 * Utility function to setup standard process lifecycle
 * Simplified interface for common use cases
 */
export declare function setupProcessLifecycle(shutdownHandler: () => Promise<void>): ProcessLifecycleManager;
//# sourceMappingURL=process-lifecycle.d.ts.map