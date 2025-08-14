import { getLogger } from '../logging-config.ts';
const logger = getLogger('coordination-swarm-core-claude-integration-index');
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
            autoSetup: options?.autoSetup,
            forceSetup: options?.forceSetup,
            mergeSetup: options?.mergeSetup,
            backupSetup: options?.backupSetup,
            noBackup: options?.noBackup,
            interactive: options?.interactive !== false,
            workingDir: options?.workingDir || process.cwd(),
            packageName: options?.packageName || 'ruv-swarm',
            ...options,
        };
        this.core = new ClaudeIntegrationCore(this.options);
        this.docs = new ClaudeDocsGenerator(this.options);
        this.remote = new RemoteWrapperGenerator(this.options);
    }
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
            else if (results.modules) {
                results.modules.core = {
                    success: true,
                    manualSetup: true,
                    instructions: [
                        'Run: claude mcp add ruv-swarm npx ruv-swarm mcp start',
                        'Test with: mcp__zen-swarm__agent_spawn',
                    ],
                };
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
    async invokeClaudeWithPrompt(prompt) {
        return await this.core.invokeClaudeWithPrompt(prompt);
    }
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
    async cleanup() {
        const { promises: fs } = await import('node:fs');
        const path = await import('node:path');
        try {
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
                    const workingDir = this.options.workingDir ?? process.cwd();
                    const fileName = typeof file === 'string' ? file : String(file || '');
                    if (fileName) {
                        const filePath = path.join(workingDir, fileName);
                        await fs.rm(filePath, { recursive: true, force: true });
                        removedFiles.push(fileName);
                    }
                }
                catch {
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
async function setupClaudeIntegration(options = {}) {
    const orchestrator = new ClaudeIntegrationOrchestrator(options);
    return await orchestrator.setupIntegration();
}
async function invokeClaudeWithSwarm(prompt, options = {}) {
    const orchestrator = new ClaudeIntegrationOrchestrator(options);
    return await orchestrator.invokeClaudeWithPrompt(prompt);
}
export { ClaudeIntegrationOrchestrator, setupClaudeIntegration, invokeClaudeWithSwarm, ClaudeIntegrationCore, ClaudeDocsGenerator, RemoteWrapperGenerator, };
//# sourceMappingURL=index.js.map