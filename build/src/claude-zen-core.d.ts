/**
 * @file Claude-zen-core implementation.
 */
/**
 * Main Application class with full DI integration.
 *
 * @example
 */
export declare class ClaudeZenCore {
    private container;
    private orchestrator?;
    private coordinationManager?;
    private learningCoordinator?;
    private multiSystemCoordinator?;
    constructor();
    /**
     * Setup comprehensive DI container with all services.
     */
    private setupDependencyInjection;
    /**
     * Initialize all systems with DI.
     */
    initialize(): Promise<void>;
    /**
     * Demonstrate that all DI-enhanced systems are working together.
     */
    private demonstrateSystemIntegration;
    /**
     * Graceful shutdown with DI cleanup.
     */
    shutdown(): Promise<void>;
}
export default ClaudeZenCore;
//# sourceMappingURL=claude-zen-core.d.ts.map