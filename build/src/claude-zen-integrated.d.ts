/**
 * @file Claude-zen-integrated implementation.
 */
/**
 * Claude Code Zen - Integrated Application Entry Point.
 *
 * This file provides the CLI-compatible entry point with command-line argument support.
 * And integrates with HTTP server functionality for development and production use.
 */
interface IntegratedOptions {
    port?: number;
    daemon?: boolean;
    dev?: boolean;
    verbose?: boolean;
}
/**
 * Simplified application class with CLI support (avoiding DI decorators for now).
 *
 * @example
 */
export declare class ClaudeZenIntegrated {
    private options;
    private server?;
    constructor(options?: IntegratedOptions);
    /**
     * Parse command line arguments.
     *
     * @param args
     */
    static parseArgs(args: string[]): IntegratedOptions;
    /**
     * Initialize basic system without DI complexity.
     */
    initialize(): Promise<void>;
    /**
     * Start HTTP server for API access.
     */
    private startServer;
    /**
     * Simplified shutdown.
     */
    shutdown(): Promise<void>;
}
export default ClaudeZenIntegrated;
//# sourceMappingURL=claude-zen-integrated.d.ts.map