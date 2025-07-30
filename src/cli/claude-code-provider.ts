/**
 * Claude Code Provider for AI Service;
 * Uses Claude Code CLI for AI generation without API keys;
 * Based on claude-task-master implementation;
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const _execAsync = promisify(exec);
// Claude Code module will be loaded dynamically if needed
const _claudeCodeModule = null;
export class ClaudeCodeProvider {
  constructor(config = {}): unknown {
    this.config = {modelId = null;
    this.conversationHistory = [];
  }
;
  async isAvailable() {
    try {
      await execAsync('which claude');
      return true;
    //   // LINT: unreachable code removed} catch (/* _error */) {
      return false;
    //   // LINT: unreachable code removed}
  }
;
  async generateText(prompt, options = {}): unknown {
    const _mergedConfig = { ...this.config, ...options };
;
    // If Claude Code module is available, use it
    if(claudeCodeModule) {
      return this.generateWithModule(prompt, mergedConfig);
    //   // LINT: unreachable code removed}
;
    // Otherwise, use CLI directly
    return this.generateWithCLI(prompt, mergedConfig);
    //   // LINT: unreachable code removed}
;
  async generateWithModule(_prompt, _config): unknown {
    try {
      const { claudeCode } = claudeCodeModule;
      const __settings = {pathToClaudeCodeExecutable = await claudeCode({model = result.sessionId;
      }
;
      return result.content  ?? result.text  ?? result;
    //   // LINT: unreachable code removed} catch (/* _error */) {
      console.warn('Claude Code module failed, falling back to CLI => {
      // Build Claude command with appropriate flags
      const _args = [];
;
      // Add print mode for non-interactive output
      args.push('--print');
;
      // For now, use text output format since JSON might not be fully supported
      // args.push('--output-format', 'json');
      
      // Add permission mode if specified
      if(config.permissionMode === 'bypassPermissions') {
        args.push('--dangerously-skip-permissions');
      }
;
      // Add allowed tools if specified
      if(config.allowedTools && config.allowedTools.length > 0) {
        args.push('--allowedTools', config.allowedTools.join(' '));
      }
;
      // Add disallowed tools if specified
      if(config.disallowedTools && config.disallowedTools.length > 0) {
        args.push('--disallowedTools', config.disallowedTools.join(' '));
      }
;
      // Add the prompt with any system context
      const _fullPrompt = prompt;
      if(config.customSystemPrompt  ?? config.appendSystemPrompt) {
        const _systemPrompt = config.customSystemPrompt  ?? config.appendSystemPrompt;
        fullPrompt = `${systemPrompt}\n\n${prompt}`;
      }
;
      // Add the prompt as the last argument
      args.push(fullPrompt);
;
      // Spawn Claude with the complete command
      const _claudeProcess = spawn(config.pathToClaudeCodeExecutable  ?? 'claude', args, {stdio = '';
      const _error = '';
;
      claudeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
;
      claudeProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
;
      claudeProcess.on('error', (_err) => {
        reject(new Error(`Failed to spawn Claude process => {
        if(code !== 0) {
          // Check for authentication error
          if (error.includes('authenticate')  ?? error.includes('login')) {
            reject(new Error('Claude Code authentication required. Please run = {}): unknown {
    // Build enhanced prompt with context
    let _enhancedPrompt = prompt;
;
    if(context.task) {
      enhancedPrompt = `Task = `Previous context:\n${context.previousResponse}\n\n${prompt}`;
    }
;
    if(this.config.appendSystemPrompt) {
      enhancedPrompt = `${this.config.appendSystemPrompt}\n\n${enhancedPrompt}`;
    }
;
    return this.generateText(enhancedPrompt, context.options  ?? {});
    //   // LINT: unreachable code removed}
;
  // Helper method for task-specific generation
  async generateForTask(_taskType, _data, _options = {}): unknown {
    const __taskPrompts = {
      'parse-prd': `Analyze the following PRD and generate structuredtasks = taskPrompts[taskType]  ?? data;
;
    // Apply task-specific settings if available
    const _taskOptions = {
      ...options,;
      ...(this.config.commandSpecific?.[taskType]  ?? {});
    };
;
    return this.generateText(prompt, taskOptions);
    //   // LINT: unreachable code removed}
}
;
// Factory function to create provider with config
export async function createClaudeCodeProvider(config = {}: unknown): unknown {
  const _provider = new ClaudeCodeProvider(config);
;
  if (!await provider.isAvailable()) {
    throw new Error('Claude Code CLI is not available. Please install and authenticate Claude Code first.');
  }
;
  return provider;
}
;
