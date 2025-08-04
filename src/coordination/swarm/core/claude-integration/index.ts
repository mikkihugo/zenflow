/**
 * Main Claude Code integration orchestrator
 * Coordinates all integration modules for modular, remote-capable setup
 */

import { ClaudeIntegrationCore } from './core.js';
import { ClaudeDocsGenerator } from './docs.js';
import { RemoteWrapperGenerator } from './remote.js';

class ClaudeIntegrationOrchestrator {
  constructor(options = {}) {
    this.options = {
      autoSetup: options.autoSetup || false,
      forceSetup: options.forceSetup || false,
      mergeSetup: options.mergeSetup || false,
      backupSetup: options.backupSetup || false,
      noBackup: options.noBackup || false,
      interactive: options.interactive !== false, // Default to true
      workingDir: options.workingDir || process.cwd(),
      packageName: options.packageName || 'ruv-swarm',
      ...options,
    };

    // Initialize modules
    this.core = new ClaudeIntegrationCore(this.options);
    this.docs = new ClaudeDocsGenerator(this.options);
    this.remote = new RemoteWrapperGenerator(this.options);
  }

  /**
   * Setup complete Claude Code integration
   */
  async setupIntegration() {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        workingDir: this.options.workingDir,
        success: true,
        modules: {},
      };
      results.modules.docs = await this.docs.generateAll({
        force: this.options.forceSetup,
        merge: this.options.mergeSetup,
        backup: this.options.backupSetup,
        noBackup: this.options.noBackup,
        interactive: this.options.interactive,
      });
      results.modules.remote = await this.remote.createAll();

      // Step 3: Initialize core integration (if auto setup enabled)
      if (this.options.autoSetup) {
        try {
          results.modules.core = await this.core.initialize();
        } catch (error) {
          results.modules.core = {
            success: false,
            error: error.message,
            manualSetup: true,
          };
        }
      } else {
        results.modules.core = {
          success: true,
          manualSetup: true,
          instructions: [
            'Run: claude mcp add ruv-swarm npx ruv-swarm mcp start',
            'Test with: mcp__zen-swarm__agent_spawn',
          ],
        };
      }
      if (results.modules.core.manualSetup) {
      } else {
      }

      return results;
    } catch (error) {
      console.error('❌ Integration setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Invoke Claude with a prompt using the core module
   */
  async invokeClaudeWithPrompt(prompt) {
    return await this.core.invokeClaudeWithPrompt(prompt);
  }

  /**
   * Check integration status
   */
  async checkStatus() {
    try {
      const status = {
        claudeAvailable: await this.core.isClaudeAvailable(),
        filesExist: await this.core.checkExistingFiles(),
        workingDir: this.options.workingDir,
        timestamp: new Date().toISOString(),
      };

      return status;
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      throw error;
    }
  }

  /**
   * Clean up integration files
   */
  async cleanup() {
    const { promises: fs } = await import('node:fs');
    const path = await import('node:path');

    try {
      const filesToRemove = [
        'claude.md',
        '.claude',
        this.options.packageName,
        `${this.options.packageName}.bat`,
        `${this.options.packageName}.ps1`,
        'claude-swarm.sh',
        'claude-swarm.bat',
      ];

      const removedFiles = [];

      for (const file of filesToRemove) {
        try {
          const filePath = path.join(this.options.workingDir, file);
          await fs.rm(filePath, { recursive: true, force: true });
          removedFiles.push(file);
        } catch {
          // File doesn't exist, continue
        }
      }
      return { success: true, removedFiles };
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
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

export {
  ClaudeIntegrationOrchestrator,
  setupClaudeIntegration,
  invokeClaudeWithSwarm,
  // Export individual modules for advanced usage
  ClaudeIntegrationCore,
  ClaudeDocsGenerator,
  RemoteWrapperGenerator,
};
