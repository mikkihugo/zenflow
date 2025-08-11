/**
 * @file Coordination system: core.
 *
 * ⚠️  CORE CLAUDE INTEGRATION - NEVER REMOVE ⚠️.
 *
 * This module is ACTIVELY USED in the test suite and integration system:
 * - src/__tests__/swarm-zen/claude-integration-comprehensive.test.js - 9+ dynamic imports of ClaudeIntegrationCore
 * - src/__tests__/swarm-zen/full-coverage-runner.js - Loads this module for coverage testing
 * - src/__tests__/swarm-zen/integration-features-coverage.test.js - Dynamic import testing.
 *
 * Static analysis misses usage because:
 * 1. Dynamic imports: await import('../src/claude-integration/core')
 * 2. Test file integration patterns
 * 3. Coverage runner module loading.
 *
 * This is the core Claude Code CLI integration module that handles MCP server setup
 * and basic integration functionality.
 * @usage CRITICAL - Core Claude integration used extensively in test infrastructure
 * @dynamicallyImportedBy src/__tests__/swarm-zen/claude-integration-comprehensive.test.js, src/__tests__/swarm-zen/full-coverage-runner.js
 */
interface ClaudeInvokeOptions {
    secure?: boolean;
}
interface ClaudeIntegrationOptions {
    autoSetup?: boolean;
    forceSetup?: boolean;
    workingDir?: string;
}
declare class ClaudeIntegrationCore {
    private _autoSetup;
    private forceSetup;
    private workingDir;
    constructor(options?: ClaudeIntegrationOptions);
    /**
     * Check if Claude CLI is available.
     */
    isClaudeAvailable(): Promise<boolean>;
    /**
     * Add ruv-swarm MCP server to Claude Code.
     */
    addMcpServer(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Check if integration files already exist.
     */
    checkExistingFiles(): Promise<boolean>;
    /**
     * Initialize Claude integration.
     */
    initialize(): Promise<{
        core: {
            success: boolean;
            message: string;
        };
        success: boolean;
    } | {
        success: boolean;
        message: string;
    }>;
    /**
     * Invoke Claude with a prompt (supports both secure and legacy modes).
     *
     * @param prompt
     * @param options.
     * @param options
     */
    invokeClaudeWithPrompt(prompt: string, options?: ClaudeInvokeOptions): Promise<{
        success: boolean;
        message: string;
    }>;
}
export { ClaudeIntegrationCore };
//# sourceMappingURL=core.d.ts.map