/**
 * Claude Code Provider for AI Service
 * Uses Claude Code CLI for AI generation without API keys
 * Based on claude-task-master implementation
 */

import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface ClaudeCodeConfig {
  modelId?: string;
  pathToClaudeCodeExecutable?: string;
  customSystemPrompt?: string;
  appendSystemPrompt?: string;
  permissionMode?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  commandSpecific?: Record<string, any>;
}

// Claude Code module will be loaded dynamically if needed
const claudeCodeModule: any = null;

export class ClaudeCodeProvider {
  private config: ClaudeCodeConfig;
  private conversationHistory: any[];

  constructor(config: ClaudeCodeConfig = {}) {
    this.config = { 
      modelId: 'claude-3-5-sonnet-20241022',
      ...config 
    };
    this.conversationHistory = [];
  }

  async isAvailable(): Promise<boolean> {
    try {
      await execAsync('which claude');
      return true;
    } catch (_error) {
      return false;
    }
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    const mergedConfig = { ...this.config, ...options };

    // If Claude Code module is available, use it
    if (claudeCodeModule) {
      return this.generateWithModule(prompt, mergedConfig);
    }

    // Otherwise, use CLI directly
    return this.generateWithCLI(prompt, mergedConfig);
  }

  private async generateWithModule(prompt: string, config: ClaudeCodeConfig): Promise<string> {
    try {
      const { claudeCode } = claudeCodeModule;
      const settings = {
        pathToClaudeCodeExecutable: config.pathToClaudeCodeExecutable || 'claude',
        modelId: config.modelId
      };
      
      const result = await claudeCode({
        model: config.modelId,
        prompt,
        settings
      });

      if (result?.sessionId) {
        this.conversationHistory.push({
          sessionId: result.sessionId,
          prompt,
          response: result.content || result.text || result
        });
      }

      return result.content || result.text || result;
    } catch (_error) {
      console.warn('Claude Code module failed, falling back to CLI');
      return this.generateWithCLI(prompt, config);
    }
  }

  private async generateWithCLI(prompt: string, config: ClaudeCodeConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build Claude command with appropriate flags
      const args: string[] = [];

      // Add print mode for non-interactive output
      args.push('--print');

      // For now, use text output format since JSON might not be fully supported
      // args.push('--output-format', 'json');

      // Add permission mode if specified
      if (config.permissionMode === 'bypassPermissions') {
        args.push('--dangerously-skip-permissions');
      }

      // Add allowed tools if specified
      if (config.allowedTools && config.allowedTools.length > 0) {
        args.push('--allowedTools', config.allowedTools.join(' '));
      }

      // Add disallowed tools if specified
      if (config.disallowedTools && config.disallowedTools.length > 0) {
        args.push('--disallowedTools', config.disallowedTools.join(' '));
      }

      // Add the prompt with any system context
      let fullPrompt = prompt;
      if (config.customSystemPrompt || config.appendSystemPrompt) {
        const systemPrompt = config.customSystemPrompt || config.appendSystemPrompt;
        fullPrompt = `${systemPrompt}\n\n${prompt}`;
      }

      // Add the prompt as the last argument
      args.push(fullPrompt);

      // Spawn Claude with the complete command
      const claudeProcess = spawn(config.pathToClaudeCodeExecutable || 'claude', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';

      claudeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      claudeProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      claudeProcess.on('error', (err) => {
        reject(new Error(`Failed to spawn Claude process: ${err.message}`));
      });

      claudeProcess.on('close', (code) => {
        if (code !== 0) {
          // Check for authentication error
          if (error.includes('authenticate') || error.includes('login')) {
            reject(new Error('Claude Code authentication required. Please run `claude auth login` first.'));
          } else {
            reject(new Error(`Claude process exited with code ${code}: ${error}`));
          }
        } else {
          resolve(output.trim());
        }
      });
    });
  }

  // Enhanced context-aware generation
  async generateWithContext(prompt: string, context: any = {}): Promise<string> {
    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    
    if (context.task) {
      enhancedPrompt = `Task: ${context.task}\n\n${prompt}`;
    }
    
    if (context.previousResponse) {
      enhancedPrompt = `Previous context:\n${context.previousResponse}\n\n${prompt}`;
    }
    
    if (this.config.appendSystemPrompt) {
      enhancedPrompt = `${this.config.appendSystemPrompt}\n\n${enhancedPrompt}`;
    }

    return this.generateText(enhancedPrompt, context.options || {});
  }

  // Helper method for task-specific generation
  async generateForTask(taskType: string, data: string, options: any = {}): Promise<string> {
    const taskPrompts: Record<string, string> = {
      'parse-prd': `Analyze the following PRD and generate structured tasks:\n\n${data}`,
      'code-review': `Review the following code and provide feedback:\n\n${data}`,
      'documentation': `Generate documentation for:\n\n${data}`
    };

    const prompt = taskPrompts[taskType] || data;

    // Apply task-specific settings if available
    const taskOptions = {
      ...options,
      ...(this.config.commandSpecific?.[taskType] || {})
    };

    return this.generateText(prompt, taskOptions);
  }
}

// Factory function to create provider with config
export async function createClaudeCodeProvider(config: ClaudeCodeConfig = {}): Promise<ClaudeCodeProvider> {
  const provider = new ClaudeCodeProvider(config);

  if (!await provider.isAvailable()) {
    throw new Error('Claude Code CLI is not available. Please install and authenticate Claude Code first.');
  }

  return provider;
}