/**
 * @file Claude-integration module exports.
 */
/**
 * Main Claude Code integration orchestrator.
 * Coordinates all integration modules for modular, remote-capable setup.
 */
import { ClaudeIntegrationCore } from './core.ts';
import { ClaudeDocsGenerator } from './docs.ts';
import { RemoteWrapperGenerator } from './remote.ts';
interface ClaudeIntegrationOptions {
    autoSetup?: boolean;
    forceSetup?: boolean;
    mergeSetup?: boolean;
    backupSetup?: boolean;
    noBackup?: boolean;
    interactive?: boolean;
    workingDir?: string;
    packageName?: string;
    [key: string]: any;
}
interface SetupResults {
    timestamp: string;
    workingDir: string;
    success: boolean;
    modules: {
        docs?: any;
        remote?: any;
        core?: any;
    };
}
declare class ClaudeIntegrationOrchestrator {
    options: ClaudeIntegrationOptions;
    core: ClaudeIntegrationCore;
    docs: ClaudeDocsGenerator;
    remote: RemoteWrapperGenerator;
    constructor(options?: ClaudeIntegrationOptions);
    /**
     * Setup complete Claude Code integration.
     */
    setupIntegration(): Promise<SetupResults>;
    /**
     * Invoke Claude with a prompt using the core module.
     *
     * @param prompt
     */
    invokeClaudeWithPrompt(prompt: string): Promise<any>;
    /**
     * Check integration status.
     */
    checkStatus(): Promise<any>;
    /**
     * Clean up integration files.
     */
    cleanup(): Promise<{
        success: boolean;
        removedFiles: string[];
    }>;
}
declare function setupClaudeIntegration(options?: ClaudeIntegrationOptions): Promise<SetupResults>;
declare function invokeClaudeWithSwarm(prompt: string, options?: ClaudeIntegrationOptions): Promise<any>;
export { ClaudeIntegrationOrchestrator, setupClaudeIntegration, invokeClaudeWithSwarm, ClaudeIntegrationCore, ClaudeDocsGenerator, RemoteWrapperGenerator, };
//# sourceMappingURL=index.d.ts.map