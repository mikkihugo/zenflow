import { getLogger } from '../../../config/logging-config';
const logger = getLogger('coordination-swarm-core-claude-integration-core');
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
class ClaudeIntegrationCore {
    _autoSetup;
    forceSetup;
    workingDir;
    constructor(options = {}) {
        this._autoSetup = options?.autoSetup;
        this.forceSetup = options?.forceSetup;
        this.workingDir = options?.workingDir || process.cwd();
    }
    async isClaudeAvailable() {
        try {
            execSync('claude --version', { stdio: 'ignore' });
            return true;
        }
        catch {
            return false;
        }
    }
    async addMcpServer() {
        if (!(await this.isClaudeAvailable())) {
            throw new Error('Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code');
        }
        try {
            const mcpCommand = 'claude mcp add ruv-swarm npx ruv-swarm mcp start';
            execSync(mcpCommand, { stdio: 'inherit', cwd: this.workingDir });
            return {
                success: true,
                message: 'Added ruv-swarm MCP server to Claude Code (stdio)',
            };
        }
        catch (error) {
            throw new Error(`Failed to add MCP server: ${error.message}`);
        }
    }
    async checkExistingFiles() {
        try {
            await fs.access(path.join(this.workingDir, 'claude.md'));
            await fs.access(path.join(this.workingDir, '.claude/commands'));
            return true;
        }
        catch {
            return false;
        }
    }
    async initialize() {
        if (!this.forceSetup && (await this.checkExistingFiles())) {
            return { success: true, message: 'Integration files already exist' };
        }
        try {
            const results = {
                core: await this.addMcpServer(),
                success: true,
            };
            return results;
        }
        catch (error) {
            logger.error('❌ Failed to initialize Claude integration:', error.message);
            throw error;
        }
    }
    async invokeClaudeWithPrompt(prompt, options = {}) {
        if (!(prompt && prompt.trim())) {
            throw new Error('No prompt provided');
        }
        if (!(await this.isClaudeAvailable())) {
            throw new Error('Claude Code CLI not found');
        }
        const addPermissions = options?.secure !== true;
        const permissions = addPermissions ? ' --dangerously-skip-permissions' : '';
        const claudeCommand = `claude "${prompt.trim()}"${permissions}`;
        try {
            execSync(claudeCommand, { stdio: 'inherit', cwd: this.workingDir });
            return { success: true, message: 'Claude invocation completed' };
        }
        catch (error) {
            throw new Error(`Claude invocation failed: ${error.message}`);
        }
    }
}
export { ClaudeIntegrationCore };
//# sourceMappingURL=core.js.map