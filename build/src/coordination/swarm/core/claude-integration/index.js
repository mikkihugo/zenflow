/**
 * @file Claude-integration module exports.
 */
import { getLogger } from '../logging-config.ts';
const logger = getLogger('coordination-swarm-core-claude-integration-index');
/**
 * Main Claude Code integration orchestrator.
 * Coordinates all integration modules for modular, remote-capable setup.
 */
import { ClaudeIntegrationCore } from './core.ts';
import { ClaudeDocsGenerator } from './docs.ts';
import { RemoteWrapperGenerator } from './remote.ts';
class ClaudeIntegrationOrchestrator {
    options;
    core;
    docs;
    remote;
    constructor(options = {}) {
        this.options = {
            autoSetup: options?.autoSetup || false,
            forceSetup: options?.forceSetup || false,
            mergeSetup: options?.mergeSetup || false,
            backupSetup: options?.backupSetup || false,
            noBackup: options?.noBackup || false,
            interactive: options?.interactive !== false, // Default to true
            workingDir: options?.workingDir || process.cwd(),
            packageName: options?.packageName || 'ruv-swarm',
            ...options,
        };
        // Initialize modules
        this.core = new ClaudeIntegrationCore(this.options);
        this.docs = new ClaudeDocsGenerator(this.options);
        this.remote = new RemoteWrapperGenerator(this.options);
    }
    /**
     * Setup complete Claude Code integration.
     */
    async setupIntegration() {
        try {
            const results = {
                timestamp: new Date().toISOString(),
                workingDir: this.options.workingDir || process.cwd(),
                success: true,
                modules: {},
            };
            if (results.modules) {
                results.modules.docs = await this.docs.generateAll({
                    force: this.options.forceSetup ?? false,
                    merge: this.options.mergeSetup ?? false,
                    backup: this.options.backupSetup ?? false,
                    noBackup: this.options.noBackup ?? false,
                    interactive: this.options.interactive ?? true,
                });
            }
            if (results.modules) {
                results.modules.remote = await this.remote.createAll();
            }
            // Step 3: Initialize core integration (if auto setup enabled)
            if (this.options.autoSetup) {
                try {
                    if (results.modules) {
                        results.modules.core = await this.core.initialize();
                    }
                }
                catch (error) {
                    if (results.modules) {
                        results.modules.core = {
                            success: false,
                            error: error.message,
                            manualSetup: true,
                        };
                    }
                }
            }
            else {
                if (results.modules) {
                    results.modules.core = {
                        success: true,
                        manualSetup: true,
                        instructions: [
                            'Run: claude mcp add ruv-swarm npx ruv-swarm mcp start',
                            'Test with: mcp__zen-swarm__agent_spawn',
                        ],
                    };
                }
            }
            if (results?.modules?.core?.manualSetup) {
            }
            else {
            }
            return results;
        }
        catch (error) {
            logger.error('❌ Integration setup failed:', error.message);
            throw error;
        }
    }
    /**
     * Invoke Claude with a prompt using the core module.
     *
     * @param prompt
     */
    async invokeClaudeWithPrompt(prompt) {
        return await this.core.invokeClaudeWithPrompt(prompt);
    }
    /**
     * Check integration status.
     */
    async checkStatus() {
        try {
            const status = {
                claudeAvailable: await this.core.isClaudeAvailable(),
                filesExist: await this.core.checkExistingFiles(),
                workingDir: this.options.workingDir ?? process.cwd(),
                timestamp: new Date().toISOString(),
            };
            return status;
        }
        catch (error) {
            logger.error('❌ Status check failed:', error.message);
            throw error;
        }
    }
    /**
     * Clean up integration files.
     */
    async cleanup() {
        const { promises: fs } = await import('node:fs');
        const path = await import('node:path');
        try {
            // Ensure packageName is properly typed as string
            const packageName = this.options.packageName ?? 'ruv-swarm';
            const filesToRemove = [
                'claude.md',
                '.claude',
                packageName,
                `${packageName}.bat`,
                `${packageName}.ps1`,
                'claude-swarm.sh',
                'claude-swarm.bat',
            ];
            const removedFiles = [];
            for (const file of filesToRemove) {
                try {
                    // Ensure workingDir is defined with fallback and proper typing
                    const workingDir = this.options.workingDir ?? process.cwd();
                    // Ensure file is a string (filter out any undefined values)
                    const fileName = typeof file === 'string' ? file : String(file || '');
                    if (fileName) {
                        const filePath = path.join(workingDir, fileName);
                        await fs.rm(filePath, { recursive: true, force: true });
                        removedFiles.push(fileName);
                    }
                }
                catch {
                    // File doesn't exist, continue
                }
            }
            return { success: true, removedFiles };
        }
        catch (error) {
            logger.error('❌ Cleanup failed:', error.message);
            throw error;
        }
    }
}
// Convenience function for simple setup
async function setupClaudeIntegration(options = {}) {
    const orchestrator = new ClaudeIntegrationOrchestrator(options);
    return await orchestrator.setupIntegration();
}
// Convenience function for Claude invocation
async function invokeClaudeWithSwarm(prompt, options = {}) {
    const orchestrator = new ClaudeIntegrationOrchestrator(options);
    return await orchestrator.invokeClaudeWithPrompt(prompt);
}
export { ClaudeIntegrationOrchestrator, setupClaudeIntegration, invokeClaudeWithSwarm, 
// Export individual modules for advanced usage
ClaudeIntegrationCore, ClaudeDocsGenerator, RemoteWrapperGenerator, };
