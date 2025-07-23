/**
 * Claude Code Provider for AI Service
 * Uses Claude Code CLI for AI generation without API keys
 * Based on claude-task-master implementation
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Claude Code module will be loaded dynamically if needed
let claudeCodeModule = null;

export class ClaudeCodeProvider {
  constructor(config = {}) {
    this.config = {
      modelId: config.modelId || 'sonnet',
      maxTurns: config.maxTurns || 5,
      maxThinkingTokens: config.maxThinkingTokens || 32000,
      customSystemPrompt: config.customSystemPrompt,
      appendSystemPrompt: config.appendSystemPrompt,
      permissionMode: config.permissionMode || 'default',
      allowedTools: config.allowedTools,
      disallowedTools: config.disallowedTools,
      pathToClaudeCodeExecutable: config.pathToClaudeCodeExecutable || 'claude',
      cwd: config.cwd || process.cwd(),
      mcpServers: config.mcpServers,
      ...config
    };
    
    // Track session state
    this.sessionId = null;
    this.conversationHistory = [];
  }

  async isAvailable() {
    try {
      await execAsync('which claude');
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateText(prompt, options = {}) {
    const mergedConfig = { ...this.config, ...options };
    
    // If Claude Code module is available, use it
    if (claudeCodeModule) {
      return this.generateWithModule(prompt, mergedConfig);
    }
    
    // Otherwise, use CLI directly
    return this.generateWithCLI(prompt, mergedConfig);
  }
  
  async generateWithModule(prompt, config) {
    try {
      const { claudeCode } = claudeCodeModule;
      const settings = {
        pathToClaudeCodeExecutable: config.pathToClaudeCodeExecutable,
        customSystemPrompt: config.customSystemPrompt,
        maxTurns: config.maxTurns,
        maxThinkingTokens: config.maxThinkingTokens,
        cwd: config.cwd,
        permissionMode: config.permissionMode,
        allowedTools: config.allowedTools,
        disallowedTools: config.disallowedTools
      };
      
      const result = await claudeCode({
        model: config.modelId,
        message: prompt,
        ...settings
      });
      
      // Store session info if available
      if (result.sessionId) {
        this.sessionId = result.sessionId;
      }
      
      return result.content || result.text || result;
    } catch (error) {
      console.warn('Claude Code module failed, falling back to CLI:', error.message);
      return this.generateWithCLI(prompt, config);
    }
  }
  
  async generateWithCLI(prompt, config) {
    return new Promise((resolve, reject) => {
      // Build Claude command with appropriate flags
      const args = [];
      
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
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: config.cwd,
        env: { ...process.env }
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
            reject(new Error('Claude Code authentication required. Please run: claude login'));
          } else {
            reject(new Error(`Claude process exited with code ${code}: ${error}`));
          }
        } else {
          // Return the text output directly since we're not using JSON format
          resolve(output.trim());
        }
      });

      // Write the prompt to stdin
      claudeProcess.stdin.write(fullPrompt);
      claudeProcess.stdin.end();
    });
  }

  async generateWithContext(prompt, context = {}) {
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
  async generateForTask(taskType, data, options = {}) {
    const taskPrompts = {
      'parse-prd': `Analyze the following PRD and generate structured tasks:\n\n${data}`,
      'expand-task': `Break down the following task into subtasks:\n\n${data}`,
      'analyze-complexity': `Analyze the complexity of the following project/task:\n\n${data}`,
      'suggest-next': `Based on the current project state, suggest the next task to work on:\n\n${data}`,
      'code-review': `Review the following code changes and provide feedback:\n\n${data}`,
      'architecture': `Analyze the architecture implications of:\n\n${data}`
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
export async function createClaudeCodeProvider(config = {}) {
  const provider = new ClaudeCodeProvider(config);
  
  if (!await provider.isAvailable()) {
    throw new Error('Claude Code CLI is not available. Please install and authenticate Claude Code first.');
  }
  
  return provider;
}