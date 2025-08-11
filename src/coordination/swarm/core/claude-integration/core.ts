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

import { getLogger } from '../../../config/logging-config';

const logger = getLogger('coordination-swarm-core-claude-integration-core');

/**
 * Core Claude Code integration module.
 * Handles MCP server setup and basic integration.
 */

import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

interface ClaudeInvokeOptions {
  secure?: boolean;
}

interface ClaudeIntegrationOptions {
  autoSetup?: boolean;
  forceSetup?: boolean;
  workingDir?: string;
}

class ClaudeIntegrationCore {
  private _autoSetup: boolean;
  private forceSetup: boolean;
  private workingDir: string;

  constructor(options: ClaudeIntegrationOptions = {}) {
    this._autoSetup = options?.autoSetup;
    this.forceSetup = options?.forceSetup;
    this.workingDir = options?.workingDir || process.cwd();
  }

  /**
   * Check if Claude CLI is available.
   */
  async isClaudeAvailable() {
    try {
      execSync('claude --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add ruv-swarm MCP server to Claude Code.
   */
  async addMcpServer() {
    if (!(await this.isClaudeAvailable())) {
      throw new Error(
        'Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code',
      );
    }

    try {
      // Add ruv-swarm MCP server using stdio (no port needed)
      const mcpCommand = 'claude mcp add ruv-swarm npx ruv-swarm mcp start';
      execSync(mcpCommand, { stdio: 'inherit', cwd: this.workingDir });
      return {
        success: true,
        message: 'Added ruv-swarm MCP server to Claude Code (stdio)',
      };
    } catch (error) {
      throw new Error(`Failed to add MCP server: ${(error as Error).message}`);
    }
  }

  /**
   * Check if integration files already exist.
   */
  async checkExistingFiles() {
    try {
      await fs.access(path.join(this.workingDir, 'claude.md'));
      await fs.access(path.join(this.workingDir, '.claude/commands'));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize Claude integration.
   */
  async initialize() {
    // Check if files exist (unless force setup)
    if (!this.forceSetup && (await this.checkExistingFiles())) {
      return { success: true, message: 'Integration files already exist' };
    }

    try {
      const results = {
        core: await this.addMcpServer(),
        success: true,
      };
      return results;
    } catch (error) {
      logger.error(
        '❌ Failed to initialize Claude integration:',
        (error as Error).message,
      );
      throw error;
    }
  }

  /**
   * Invoke Claude with a prompt (supports both secure and legacy modes).
   *
   * @param prompt
   * @param options.
   * @param options
   */
  async invokeClaudeWithPrompt(
    prompt: string,
    options: ClaudeInvokeOptions = {},
  ) {
    if (!(prompt && prompt.trim())) {
      throw new Error('No prompt provided');
    }

    if (!(await this.isClaudeAvailable())) {
      throw new Error('Claude Code CLI not found');
    }

    // Default behavior for backward compatibility (legacy mode)
    const addPermissions = options?.secure !== true;
    const permissions = addPermissions ? ' --dangerously-skip-permissions' : '';
    const claudeCommand = `claude "${prompt.trim()}"${permissions}`;

    try {
      execSync(claudeCommand, { stdio: 'inherit', cwd: this.workingDir });
      return { success: true, message: 'Claude invocation completed' };
    } catch (error) {
      throw new Error(`Claude invocation failed: ${(error as Error).message}`);
    }
  }
}

export { ClaudeIntegrationCore };
