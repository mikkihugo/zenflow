/**
 * @fileoverview Claude Code SDK Integration
 *
 * Replaces CLI subprocess calls with the official @anthropic-ai/claude-code SDK
 * for better performance, type safety, and streaming capabilities.
 */

import { query } from '@anthropic-ai/claude-code';
import { getLogger } from '../../config/logging-config';

const logger = getLogger('claude-code-sdk-integration');

export interface ClaudeSDKOptions {
  // Core options
  maxTurns?: number;
  workingDir?: string;
  abortController?: AbortController;

  // System prompts
  customSystemPrompt?: string;
  appendSystemPrompt?: string;

  // Tool configuration
  allowedTools?: string[];
  disallowedTools?: string[];

  // Permission management
  permissionMode?: 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';
  canUseTool?: (
    toolName: string,
    input: Record<string, unknown>
  ) => Promise<any>;

  // Model configuration (use 'sonnet' or 'opus' aliases)
  model?: 'sonnet' | 'opus' | string;
  fallbackModel?: 'sonnet' | 'opus' | string;
  maxThinkingTokens?: number;

  // Session management
  continue?: boolean;
  resume?: string;

  // MCP servers
  mcpServers?: Record<string, any>;

  // Execution environment
  executable?: 'bun' | 'deno' | 'node';
  executableArgs?: string[];
  pathToClaudeCodeExecutable?: string;

  // Streaming and logging
  stderr?: (data: string) => void;
}

export interface ClaudeMessage {
  type: 'text' | 'tool_use' | 'tool_result' | 'result' | 'error';
  content?: string;
  result?: string;
  error?: string;
  toolName?: string;
  toolInput?: any;
  toolResult?: any;
}

/**
 * Execute Claude Code task using the official SDK instead of CLI subprocess
 */
export async function executeClaudeTask(
  prompt: string,
  options: ClaudeSDKOptions = {}
): Promise<ClaudeMessage[]> {
  const {
    maxTurns = 5,
    customSystemPrompt = 'You are Claude Code, helping with development tasks.',
    appendSystemPrompt,
    allowedTools = ['Bash', 'Read', 'Write', 'Edit'],
    disallowedTools,
    workingDir = process.cwd(),
    abortController = new AbortController(),
    permissionMode = 'default',
    canUseTool,
    model,
    fallbackModel,
    maxThinkingTokens,
    continue: continueSession,
    resume,
    mcpServers,
    executable,
    executableArgs,
    pathToClaudeCodeExecutable,
    stderr,
  } = options;

  logger.info(
    `🚀 Executing Claude task with SDK: ${prompt.substring(0, 100)}...`
  );

  const messages: ClaudeMessage[] = [];

  try {
    // Use official Claude Code SDK with comprehensive options
    logger.info(
      `🔧 SDK Options: maxTurns=${maxTurns}, permissionMode=${permissionMode}, allowedTools=${allowedTools?.join(',')}`
    );

    if (stderr) {
      stderr(
        `🚀 Starting Claude Code SDK execution with ${allowedTools?.length || 0} tools`
      );
    }

    for await (const message of query({
      prompt,
      options: {
        abortController,
        maxTurns,
        customSystemPrompt,
        appendSystemPrompt,
        allowedTools,
        disallowedTools,
        cwd: workingDir,
        permissionMode,
        canUseTool,
        model,
        fallbackModel,
        maxThinkingTokens,
        continue: continueSession,
        resume,
        mcpServers,
        executable,
        executableArgs,
        pathToClaudeCodeExecutable,
        stderr: (data: string) => {
          logger.debug(`📡 SDK stderr: ${data}`);
          if (stderr) stderr(data);
        },
      },
    })) {
      // Enhanced logging with JSON serialization like CLI --json mode
      const messageJson = JSON.stringify(message, null, 2);
      logger.debug(`📋 Raw SDK Message:`, messageJson);

      switch (message.type) {
        case 'text':
          logger.info(
            `📝 Text Message (${message.content?.length || 0} chars): ${message.content?.substring(0, 200)}...`
          );
          if (stderr) stderr(`[TEXT] ${message.content?.substring(0, 100)}...`);
          messages.push({ type: 'text', content: message.content });
          break;

        case 'tool_use':
          logger.info(`🔧 Tool Use: ${message.toolName}`);
          logger.debug(
            `🔧 Tool Input JSON:`,
            JSON.stringify(message.toolInput, null, 2)
          );
          if (stderr)
            stderr(
              `[TOOL_USE] ${message.toolName}: ${JSON.stringify(message.toolInput)}`
            );
          messages.push({
            type: 'tool_use',
            toolName: message.toolName,
            toolInput: message.toolInput,
          });
          break;

        case 'tool_result':
          const resultPreview =
            message.toolResult?.toString()?.substring(0, 200) || '';
          logger.info(
            `📊 Tool Result (${message.toolResult?.toString()?.length || 0} chars): ${resultPreview}...`
          );
          logger.debug(
            `📊 Tool Result JSON:`,
            JSON.stringify(message.toolResult, null, 2)
          );
          if (stderr) stderr(`[TOOL_RESULT] ${resultPreview}...`);
          messages.push({
            type: 'tool_result',
            toolResult: message.toolResult,
          });
          break;

        case 'result':
          logger.info(
            `✅ Final Result (${message.result?.length || 0} chars): ${message.result?.substring(0, 200)}...`
          );
          logger.debug(
            `✅ Final Result JSON:`,
            JSON.stringify(message.result, null, 2)
          );
          if (stderr)
            stderr(`[RESULT] ${message.result?.substring(0, 100)}...`);
          messages.push({ type: 'result', result: message.result });
          break;

        case 'error':
          logger.error(`❌ Error: ${message.error}`);
          logger.debug(
            `❌ Error JSON:`,
            JSON.stringify(message.error, null, 2)
          );
          if (stderr) stderr(`[ERROR] ${message.error}`);
          messages.push({ type: 'error', error: message.error });
          break;

        default:
          logger.warn(`🔍 Unknown message type: ${message.type}`);
          logger.debug(`🔍 Unknown message JSON:`, messageJson);
          if (stderr)
            stderr(`[UNKNOWN] ${message.type}: ${JSON.stringify(message)}`);
          messages.push(message as ClaudeMessage);
      }
    }

    logger.info(
      `🎉 Claude task completed successfully with ${messages.length} messages`
    );
    return messages;
  } catch (error) {
    logger.error(`💥 Claude SDK execution failed:`, error);
    throw new Error(`Claude SDK execution failed: ${(error as Error).message}`);
  }
}

/**
 * Execute swarm coordination task with Claude Code SDK
 */
export async function executeSwarmCoordinationTask(
  task: string,
  agents: string[],
  options: Partial<ClaudeSDKOptions> = {}
): Promise<ClaudeMessage[]> {
  const swarmPrompt = `
🐝 SWARM COORDINATION TASK

Task: ${task}

Available Agents: ${agents.join(', ')}

INSTRUCTIONS:
1. Coordinate this task across the available agents
2. Use parallel execution where possible
3. Ensure proper communication between agents
4. Return structured results

Execute this task efficiently using swarm coordination principles.
`;

  return executeClaudeTask(swarmPrompt, {
    maxTurns: 10,
    model: 'opus', // Use Opus for complex swarm coordination
    fallbackModel: 'sonnet', // Fallback to Sonnet if Opus unavailable
    customSystemPrompt:
      'You are Claude Code coordinating a swarm of agents for efficient task execution.',
    allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'MultiEdit'],
    ...options,
  });
}

/**
 * Stream Claude Code responses in real-time with enhanced logging
 */
export async function* streamClaudeTask(
  prompt: string,
  options: ClaudeSDKOptions = {}
): AsyncGenerator<ClaudeMessage> {
  const {
    maxTurns = 5,
    customSystemPrompt = 'You are Claude Code, helping with development tasks.',
    appendSystemPrompt,
    allowedTools = ['Bash', 'Read', 'Write', 'Edit'],
    disallowedTools,
    workingDir = process.cwd(),
    abortController = new AbortController(),
    permissionMode = 'default',
    canUseTool,
    model,
    fallbackModel,
    maxThinkingTokens,
    continue: continueSession,
    resume,
    mcpServers,
    executable,
    executableArgs,
    pathToClaudeCodeExecutable,
    stderr,
  } = options;

  logger.info(`🌊 Streaming Claude task: ${prompt.substring(0, 100)}...`);
  logger.info(
    `🔧 Stream Options: maxTurns=${maxTurns}, permissionMode=${permissionMode}, allowedTools=${allowedTools?.join(',')}`
  );

  let messageCount = 0;

  try {
    for await (const message of query({
      prompt,
      options: {
        abortController,
        maxTurns,
        customSystemPrompt,
        appendSystemPrompt,
        allowedTools,
        disallowedTools,
        cwd: workingDir,
        permissionMode,
        canUseTool,
        model,
        fallbackModel,
        maxThinkingTokens,
        continue: continueSession,
        resume,
        mcpServers,
        executable,
        executableArgs,
        pathToClaudeCodeExecutable,
        stderr: (data: string) => {
          logger.debug(`📡 Stream stderr: ${data}`);
          if (stderr) stderr(data);
        },
      },
    })) {
      messageCount++;

      // Enhanced real-time logging for streaming
      const messageJson = JSON.stringify(message, null, 2);
      logger.debug(`🌊 Stream Message #${messageCount}:`, messageJson);

      switch (message.type) {
        case 'text':
          logger.info(
            `🌊📝 Stream Text #${messageCount}: ${message.content?.substring(0, 100)}...`
          );
          if (stderr)
            stderr(
              `[STREAM ${messageCount}] TEXT: ${message.content?.substring(0, 100)}...`
            );
          break;

        case 'tool_use':
          logger.info(
            `🌊🔧 Stream Tool Use #${messageCount}: ${message.toolName}`
          );
          if (stderr)
            stderr(`[STREAM ${messageCount}] TOOL: ${message.toolName}`);
          break;

        case 'tool_result':
          const resultPreview =
            message.toolResult?.toString()?.substring(0, 100) || '';
          logger.info(
            `🌊📊 Stream Tool Result #${messageCount}: ${resultPreview}...`
          );
          if (stderr)
            stderr(`[STREAM ${messageCount}] RESULT: ${resultPreview}...`);
          break;

        case 'result':
          logger.info(
            `🌊✅ Stream Final Result #${messageCount}: ${message.result?.substring(0, 100)}...`
          );
          if (stderr)
            stderr(
              `[STREAM ${messageCount}] FINAL: ${message.result?.substring(0, 100)}...`
            );
          break;

        case 'error':
          logger.error(`🌊❌ Stream Error #${messageCount}: ${message.error}`);
          if (stderr)
            stderr(`[STREAM ${messageCount}] ERROR: ${message.error}`);
          break;
      }

      yield message as ClaudeMessage;
    }

    logger.info(`🎉 Stream completed with ${messageCount} messages`);
  } catch (error) {
    logger.error(
      `💥 Claude SDK streaming failed after ${messageCount} messages:`,
      error
    );
    throw new Error(`Claude SDK streaming failed: ${(error as Error).message}`);
  }
}

/**
 * Execute multiple Claude tasks in parallel using SDK
 */
export async function executeParallelClaudeTasks(
  tasks: Array<{ prompt: string; options?: ClaudeSDKOptions }>
): Promise<ClaudeMessage[][]> {
  logger.info(`🚀 Executing ${tasks.length} Claude tasks in parallel`);

  const promises = tasks.map(({ prompt, options }) =>
    executeClaudeTask(prompt, options)
  );

  try {
    const results = await Promise.all(promises);
    logger.info(`✅ All ${tasks.length} parallel tasks completed`);
    return results;
  } catch (error) {
    logger.error(`💥 Parallel task execution failed:`, error);
    throw error;
  }
}

/**
 * Helper to abort long-running Claude tasks
 */
export class ClaudeTaskManager {
  private activeTasks = new Map<string, AbortController>();

  async executeTask(
    taskId: string,
    prompt: string,
    options: ClaudeSDKOptions = {}
  ): Promise<ClaudeMessage[]> {
    const abortController = new AbortController();
    this.activeTasks.set(taskId, abortController);

    try {
      const result = await executeClaudeTask(prompt, {
        ...options,
        abortController,
      });

      this.activeTasks.delete(taskId);
      return result;
    } catch (error) {
      this.activeTasks.delete(taskId);
      throw error;
    }
  }

  abortTask(taskId: string): boolean {
    const controller = this.activeTasks.get(taskId);
    if (controller) {
      controller.abort();
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }

  abortAllTasks(): void {
    for (const [taskId, controller] of this.activeTasks) {
      controller.abort();
    }
    this.activeTasks.clear();
  }

  getActiveTasks(): string[] {
    return Array.from(this.activeTasks.keys());
  }
}

// Global task manager instance
export const globalClaudeTaskManager = new ClaudeTaskManager();
