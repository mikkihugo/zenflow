/**
 * @fileoverview Claude Code SDK Integration - Enhanced Version
 *
 * Enhanced implementation addressing code review findings:
 * - Refactored large functions into smaller, focused methods
 * - Extracted shared permission handling utility
 * - Added comprehensive input validation
 * - Made timeout and retry values configurable
 * - Added initialization guards for global instances
 */

// Import Claude Code SDK directly from the compiled module to avoid type issues
// @ts-ignore - bypassing problematic type definitions
import { query } from '@anthropic-ai/claude-code/sdk.mjs';
import { getLogger } from './logging';

const logger = getLogger('claude-code-sdk-integration');

// Configuration constants for timeout and retry behavior
export const DEFAULT_TIMEOUTS = {
  task: 1800000, // 30 minutes default for complex tasks
  stream: 1800000, // 30 minutes for streaming complex workflows
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
} as const;

// Define our own types to avoid dependency issues with @anthropic-ai/sdk
// These match the Claude Code SDK interface without requiring the full Anthropic SDK

export type PermissionResult =
  | {
      behavior: 'allow'
      updatedInput: Record<string, unknown>
    }
  | {
      behavior: 'deny'
      message: string
    }

export type CanUseTool = (
  toolName: string,
  input: Record<string, unknown>,
) => Promise<PermissionResult>

export type PermissionMode =
  | 'default'
  | 'acceptEdits'
  | 'bypassPermissions'
  | 'plan'

export type McpServerConfig = {
  type?: 'stdio' | 'sse' | 'http'
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
}

export interface BaseClaudeCodeOptions {
  abortController?: AbortController
  allowedTools?: string[]
  appendSystemPrompt?: string
  customSystemPrompt?: string
  cwd?: string
  disallowedTools?: string[]
  executable?: 'bun' | 'deno' | 'node'
  executableArgs?: string[]
  maxThinkingTokens?: number
  maxTurns?: number
  mcpServers?: Record<string, McpServerConfig>
  pathToClaudeCodeExecutable?: string
  permissionMode?: PermissionMode
  permissionPromptToolName?: string
  continue?: boolean
  resume?: string
  model?: string
  fallbackModel?: string
  stderr?: (data: string) => void
  canUseTool?: CanUseTool
}

export interface ClaudeSDKOptions extends BaseClaudeCodeOptions {
  // v1.0.82 Enhanced Features (built on top of Claude Code SDK)
  // Additional directories for file search and custom paths  
  additionalDirectories?: string[];
  
  // Enhanced cancellation support
  onCancel?: () => void;
  timeoutMs?: number;
  
  // Session support
  sessionId?: string;
  trackPermissionDenials?: boolean;
  
  // Advanced slash command processing
  enableSlashCommands?: boolean;
  customSlashCommands?: Record<string, string>;
  
  // Streaming request cancellation
  streamCancellationToken?: AbortController;
  
  // Alias working directory to match our interface
  workingDir?: string;
}

// Define our own message types to avoid SDK dependency issues
export interface ClaudeAssistantMessage {
  type: 'assistant'
  message: {
    content?: Array<{ 
      type: string; 
      text?: string; 
      tool_use?: {
        id: string;
        name: string;
        input: Record<string, unknown>;
      };
      tool_result?: {
        tool_use_id: string;
        content?: unknown;
        is_error?: boolean;
      };
    }>
  }
  parent_tool_use_id: string | null
  session_id: string
}

export interface ClaudeUserMessage {
  type: 'user'
  message: {
    role: 'user';
    content: string | Array<{
      type: 'text' | 'image';
      text?: string;
      source?: {
        type: 'base64';
        media_type: string;
        data: string;
      };
    }>;
  }
  parent_tool_use_id: string | null
  session_id: string
}

export interface ClaudeResultMessage {
  type: 'result'
  subtype: 'success' | 'error_max_turns' | 'error_during_execution'
  duration_ms: number
  duration_api_ms: number
  is_error: boolean
  num_turns: number
  session_id: string
  total_cost_usd: number
  usage: {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
  }
  permission_denials: Array<{
    tool_name: string
    tool_use_id: string
    tool_input: Record<string, unknown>
  }>
  result?: string
}

export interface ClaudeSystemMessage {
  type: 'system'
  subtype: 'init'
  apiKeySource: string
  cwd: string
  session_id: string
  tools: string[]
  mcp_servers: Array<{
    name: string
    status: string
  }>
  model: string
  permissionMode: PermissionMode
  slash_commands: string[]
}

export type ClaudeMessage = 
  | ClaudeAssistantMessage 
  | ClaudeUserMessage 
  | ClaudeResultMessage 
  | ClaudeSystemMessage
  | {
      type: 'enhanced_text' | 'enhanced_error'
      content?: string
      error?: string
      originalMessage?: ClaudeMessage
    }

// Input validation utilities
export function validateTaskInputs(prompt: string, options: ClaudeSDKOptions = {}): void {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }
  if (prompt.length > 100000) {
    throw new Error('Prompt exceeds maximum length of 100,000 characters');
  }
  if (options.timeoutMs && (options.timeoutMs < 1000 || options.timeoutMs > 3600000)) {
    throw new Error('Timeout must be between 1 second and 1 hour');
  }
  if (options.maxTurns !== undefined && (options.maxTurns < 1 || options.maxTurns > 100)) {
    throw new Error('Max turns must be between 1 and 100');
  }
  if (options.additionalDirectories?.some(dir => !dir || typeof dir !== 'string')) {
    throw new Error('Additional directories must be non-empty strings');
  }
}

// Shared permission handling utility
export async function createPermissionHandler(
  canUseTool?: CanUseTool,
  trackPermissionDenials = false,
  sessionId?: string
): Promise<CanUseTool> {
  if (!canUseTool) {
    return async () => ({ behavior: 'allow', updatedInput: {} });
  }

  return async (toolName: string, input: Record<string, unknown>): Promise<PermissionResult> => {
    try {
      const result = await canUseTool(toolName, input);
      
      // Convert boolean to PermissionResult if needed
      if (typeof result === 'boolean') {
        if (result) {
          return { behavior: 'allow', updatedInput: input };
        } else {
          if (trackPermissionDenials && sessionId) {
            logger.warn(`🚫 Permission denied for tool: ${toolName}`, { sessionId, toolName, input });
            // Access global task manager safely
            const taskManager = getGlobalClaudeTaskManager();
            if (taskManager) {
              taskManager.trackPermissionDenial(sessionId);
            }
          }
          return { behavior: 'deny', message: `Permission denied for tool: ${toolName}` };
        }
      }
      return result;
    } catch (error) {
      if (trackPermissionDenials && sessionId) {
        logger.error(`❌ Permission check error for tool: ${toolName}`, { sessionId, error });
      }
      return { behavior: 'deny', message: `Permission check error: ${(error as Error).message}` };
    }
  };
}

// Setup cancellation utilities
export function setupCancellation(
  options: {
    abortController?: AbortController;
    streamCancellationToken?: AbortController;
    timeoutMs?: number;
    onCancel?: () => void;
  }
): {
  controller: AbortController;
  timeoutId?: NodeJS.Timeout;
  cleanup: () => void;
} {
  const controller = options.streamCancellationToken || options.abortController || new AbortController();
  let timeoutId: NodeJS.Timeout | undefined;
  
  // Setup timeout cancellation if specified
  if (options.timeoutMs && options.timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      logger.warn(`⏰ Task timeout after ${options.timeoutMs}ms - cancelling`);
      controller.abort();
      if (options.onCancel) options.onCancel();
    }, options.timeoutMs);
  }
  
  // Setup cancellation event listener
  if (options.onCancel) {
    controller.signal.addEventListener('abort', () => {
      logger.info('🛑 Task cancellation requested');
      options.onCancel!();
    });
  }

  return {
    controller,
    timeoutId,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}

// Message processing utilities
export function processClaudeMessage(message: any, messageCount: number, stderr?: (data: string) => void): ClaudeMessage {
  const messageJson = JSON.stringify(message, null, 2);
  logger.debug(`📋 Raw SDK Message #${messageCount}:`, messageJson);

  // Handle actual SDK message types
  switch (message.type) {
    case 'assistant':
      logger.info(`📝 Assistant Message #${messageCount}: ${message.message.content?.length || 0} items`);
      if (stderr) stderr(`[MSG ${messageCount}] ASSISTANT: ${message.message.content?.length || 0} items`);
      break;

    case 'user':
      logger.info(`👤 User Message #${messageCount}`);
      if (stderr) stderr(`[MSG ${messageCount}] USER: Message received`);
      break;

    case 'result':
      if (message.subtype === 'success') {
        logger.info(`✅ Final Result: ${message.result?.substring(0, 200)}...`);
        logger.debug(`✅ Result details:`, {
          duration_ms: message.duration_ms,
          num_turns: message.num_turns,
          total_cost_usd: message.total_cost_usd,
          usage: message.usage,
          permission_denials: message.permission_denials?.length || 0
        });
        if (stderr) stderr(`[RESULT] ${message.result?.substring(0, 100)}...`);
      } else {
        logger.error(`❌ Result Error: ${message.subtype}`);
        if (stderr) stderr(`[ERROR] ${message.subtype}`);
      }
      break;

    case 'system':
      if (message.subtype === 'init') {
        logger.info(`🔧 System Init: ${message.model} in ${message.cwd}`);
        logger.debug(`🔧 Tools available:`, message.tools);
        if (stderr) stderr(`[SYSTEM] Model: ${message.model}, Tools: ${message.tools.length}`);
      }
      break;

    default:
      const unknownMessage = message as { type: string; [key: string]: unknown };
      logger.warn(`🔍 Unknown message type: ${unknownMessage.type}`);
      logger.debug(`🔍 Unknown message JSON:`, messageJson);
      if (stderr) stderr(`[UNKNOWN] ${unknownMessage.type}: ${JSON.stringify(message)}`);
      break;
  }

  return message as ClaudeMessage;
}

// Core SDK options preparation
export function prepareSdkOptions(options: ClaudeSDKOptions, permissionHandler: CanUseTool, controller: AbortController) {
  const {
    maxTurns = 5,
    customSystemPrompt = 'You are Claude Code, helping with development tasks.',
    appendSystemPrompt,
    allowedTools = ['Bash', 'Read', 'Write', 'Edit'],
    disallowedTools,
    cwd = options.workingDir || process.cwd(),
    permissionMode = 'default',
    model,
    fallbackModel,
    maxThinkingTokens,
    continue: continueSession,
    resume,
    mcpServers,
    executable,
    executableArgs,
    pathToClaudeCodeExecutable,
    additionalDirectories = [],
    stderr,
  } = options;

  // If allowedTools is empty array, enable dangerous mode (all tools allowed) - for coder role only
  const isDangerousMode = Array.isArray(allowedTools) && allowedTools.length === 0;
  const finalPermissionMode = isDangerousMode ? 'bypassPermissions' : permissionMode;
  
  if (isDangerousMode) {
    logger.info('🔥 DANGEROUS MODE: Bypassing all permissions - coder role has full system access');
  }

  return {
    abortController: controller,
    maxTurns,
    customSystemPrompt,
    appendSystemPrompt,
    allowedTools: isDangerousMode ? undefined : allowedTools, // undefined means all tools
    disallowedTools: isDangerousMode ? undefined : disallowedTools,
    cwd,
    permissionMode: finalPermissionMode,
    canUseTool: isDangerousMode ? undefined : permissionHandler, // bypass permission checks
    model,
    fallbackModel,
    maxThinkingTokens,
    continue: continueSession,
    resume,
    mcpServers,
    executable,
    executableArgs,
    pathToClaudeCodeExecutable,
    additionalDirectories,
    stderr: (data: string) => {
      logger.debug(`📡 SDK stderr: ${data}`);
      if (stderr) stderr(data);
    },
  };
}

/**
 * Execute Claude Code task using the official SDK - Enhanced Implementation
 */
export async function executeClaudeTask(
  prompt: string,
  options: ClaudeSDKOptions = {}
): Promise<ClaudeMessage[]> {
  // Validate inputs first
  validateTaskInputs(prompt, options);

  const {
    timeoutMs = DEFAULT_TIMEOUTS.task,
    sessionId,
    trackPermissionDenials = false,
    canUseTool,
    onCancel,
    abortController,
    streamCancellationToken,
    stderr,
    additionalDirectories = [],
    allowedTools = ['Bash', 'Read', 'Write', 'Edit'],
  } = options;

  logger.info(
    `🚀 Executing Claude task with SDK: ${prompt.substring(0, 100)}...`
  );

  const messages: ClaudeMessage[] = [];
  
  // Setup cancellation handling
  const { controller, cleanup } = setupCancellation({
    abortController,
    streamCancellationToken,
    timeoutMs,
    onCancel,
  });
  
  // Setup permission handler
  const permissionHandler = await createPermissionHandler(
    canUseTool,
    trackPermissionDenials,
    sessionId
  );

  try {
    // Use official Claude Code SDK with comprehensive options
    logger.info(
      `🔧 SDK Options: maxTurns=${options.maxTurns || 5}, permissionMode=${options.permissionMode || 'default'}, allowedTools=${allowedTools?.join(',')}, additionalDirs=${additionalDirectories?.length || 0}, sessionId=${sessionId || 'none'}`
    );

    if (stderr) {
      stderr(
        `🚀 Starting Claude Code SDK execution with ${allowedTools?.length || 0} tools, ${additionalDirectories?.length || 0} additional directories`
      );
    }

    const sdkOptions = prepareSdkOptions(options, permissionHandler, controller);

    for await (const message of query({
      prompt,
      options: sdkOptions,
    })) {
      const processedMessage = processClaudeMessage(message, messages.length + 1, stderr);
      messages.push(processedMessage);
    }

    logger.info(
      `🎉 Claude task completed successfully with ${messages.length} messages`
    );
    return messages;
  } catch (error) {
    // Handle cancellation gracefully
    if (controller.signal.aborted) {
      logger.warn(`🛑 Claude task was cancelled`, { sessionId });
      throw new Error('Claude task was cancelled');
    }
    logger.error(`💥 Claude SDK execution failed:`, error);
    throw new Error(`Claude SDK execution failed: ${(error as Error).message}`);
  } finally {
    // Clean up resources
    cleanup();
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

NSTRUCTIONS:
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

// Streaming message processing utilities
export function processStreamMessage(message: any, messageCount: number, stderr?: (data: string) => void): ClaudeMessage {
  const messageJson = JSON.stringify(message, null, 2);
  logger.debug(`🌊 Stream Message #${messageCount}:`, messageJson);

  // Handle actual SDK message types for streaming
  switch (message.type) {
    case 'assistant':
      logger.info(`🌊📝 Stream Assistant #${messageCount}: ${message.message.content?.length || 0} items`);
      if (stderr) stderr(`[STREAM ${messageCount}] ASSISTANT: ${message.message.content?.length || 0} items`);
      break;

    case 'user':
      logger.info(`🌊👤 Stream User #${messageCount}`);
      if (stderr) stderr(`[STREAM ${messageCount}] USER`);
      break;

    case 'result':
      if (message.subtype === 'success') {
        logger.info(`🌊✅ Stream Result #${messageCount}: ${message.result?.substring(0, 100)}...`);
        if (stderr) stderr(`[STREAM ${messageCount}] RESULT: ${message.result?.substring(0, 100)}...`);
      } else {
        logger.error(`🌊❌ Stream Error #${messageCount}: ${message.subtype}`);
        if (stderr) stderr(`[STREAM ${messageCount}] ERROR: ${message.subtype}`);
      }
      break;

    case 'system':
      if (message.subtype === 'init') {
        logger.info(`🌊🔧 Stream System #${messageCount}: ${message.model}`);
        if (stderr) stderr(`[STREAM ${messageCount}] SYSTEM: ${message.model}`);
      }
      break;

    default:
      const unknownMessage = message as { type: string; [key: string]: unknown };
      logger.warn(`🌊🔍 Stream Unknown #${messageCount}: ${unknownMessage.type}`);
      if (stderr) stderr(`[STREAM ${messageCount}] UNKNOWN: ${unknownMessage.type}`);
      break;
  }

  return message as ClaudeMessage;
}

/**
 * Stream Claude Code responses in real-time - Enhanced Implementation
 */
export async function* streamClaudeTask(
  prompt: string,
  options: ClaudeSDKOptions = {}
): AsyncGenerator<ClaudeMessage> {
  // Validate inputs first
  validateTaskInputs(prompt, options);

  const {
    timeoutMs = DEFAULT_TIMEOUTS.stream,
    sessionId,
    trackPermissionDenials = false,
    canUseTool,
    onCancel,
    abortController,
    streamCancellationToken,
    stderr,
    additionalDirectories = [],
    allowedTools = ['Bash', 'Read', 'Write', 'Edit'],
  } = options;

  logger.info(`🌊 Streaming Claude task: ${prompt.substring(0, 100)}...`);
  logger.info(
    `🔧 Stream Options: maxTurns=${options.maxTurns || 5}, permissionMode=${options.permissionMode || 'default'}, allowedTools=${allowedTools?.join(',')}, additionalDirs=${additionalDirectories?.length || 0}, sessionId=${sessionId || 'none'}`
  );

  let messageCount = 0;
  
  // Setup cancellation handling for streaming
  const { controller, cleanup } = setupCancellation({
    abortController,
    streamCancellationToken,
    timeoutMs,
    onCancel,
  });
  
  // Setup permission handler
  const permissionHandler = await createPermissionHandler(
    canUseTool,
    trackPermissionDenials,
    sessionId
  );

  try {
    const sdkOptions = prepareSdkOptions(options, permissionHandler, controller);

    for await (const message of query({
      prompt,
      options: sdkOptions,
    })) {
      messageCount++;
      const processedMessage = processStreamMessage(message, messageCount, stderr);
      yield processedMessage;
    }

    logger.info(`🎉 Stream completed with ${messageCount} messages`);
  } catch (error) {
    // Handle cancellation gracefully
    if (controller.signal.aborted) {
      logger.warn(`🛑 Stream was cancelled after ${messageCount} messages`, { sessionId });
      throw new Error('Claude stream was cancelled');
    }
    logger.error(
      `💥 Claude SDK streaming failed after ${messageCount} messages:`,
      error
    );
    throw new Error(`Claude SDK streaming failed: ${(error as Error).message}`);
  } finally {
    // Clean up resources
    cleanup();
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
 * v1.0.82: Enhanced task manager with cancellation support and session tracking
 */
export class ClaudeTaskManager {
  private activeTasks = new Map<string, {
    controller: AbortController;
    sessionId?: string;
    startTime: number;
    timeoutId?: NodeJS.Timeout;
  }>();
  private permissionDenials = new Map<string, number>();
  private completedTasks = new Map<string, {
    endTime: number;
    duration: number;
    messageCount: number;
    success: boolean;
  }>();

  async executeTask(
    taskId: string,
    prompt: string,
    options: ClaudeSDKOptions = {}
  ): Promise<ClaudeMessage[]> {
    const abortController = new AbortController();
    const startTime = Date.now();
    const sessionId = options.sessionId || `session-${taskId}`;
    
    // Setup timeout if specified
    let timeoutId: NodeJS.Timeout | undefined;
    if (options.timeoutMs && options.timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        logger.warn(`⏰ Task ${taskId} timeout after ${options.timeoutMs}ms`);
        this.abortTask(taskId);
      }, options.timeoutMs);
    }

    this.activeTasks.set(taskId, {
      controller: abortController,
      sessionId,
      startTime,
      timeoutId,
    });

    try {
      const result = await executeClaudeTask(prompt, {
        ...options,
        abortController,
        sessionId,
        trackPermissionDenials: true,
        onCancel: () => {
          logger.info(`🛑 Task ${taskId} cancelled by user`);
          if (options.onCancel) options.onCancel();
        },
      });

      const endTime = Date.now();
      this.activeTasks.delete(taskId);
      
      // Track completion metrics
      this.completedTasks.set(taskId, {
        endTime,
        duration: endTime - startTime,
        messageCount: result.length,
        success: true,
      });

      return result;
    } catch (error) {
      const endTime = Date.now();
      this.activeTasks.delete(taskId);
      
      // Track failure metrics
      this.completedTasks.set(taskId, {
        endTime,
        duration: endTime - startTime,
        messageCount: 0,
        success: false,
      });
      
      throw error;
    } finally {
      // Clean up timeout
      const task = this.activeTasks.get(taskId);
      if (task?.timeoutId) {
        clearTimeout(task.timeoutId);
      }
    }
  }

  abortTask(taskId: string, reason = 'Manual cancellation'): boolean {
    const task = this.activeTasks.get(taskId);
    if (task) {
      logger.info(`🛑 Aborting task ${taskId}: ${reason}`);
      task.controller.abort();
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      this.activeTasks.delete(taskId);
      return true;
    }
    return false;
  }

  abortAllTasks(reason = 'Bulk cancellation'): void {
    logger.info(`🛑 Aborting all ${this.activeTasks.size} active tasks: ${reason}`);
    for (const [taskId, task] of Array.from(this.activeTasks)) {
      logger.debug(`🛑 Aborting task ${taskId}: ${reason}`);
      task.controller.abort();
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
    }
    this.activeTasks.clear();
  }

  getActiveTasks(): Array<{
    taskId: string;
    sessionId?: string;
    duration: number;
  }> {
    const now = Date.now();
    return Array.from(this.activeTasks.entries()).map(([taskId, task]) => ({
      taskId,
      sessionId: task.sessionId,
      duration: now - task.startTime,
    }));
  }

  // v1.0.82: Permission denial tracking
  trackPermissionDenial(sessionId: string): void {
    const current = this.permissionDenials.get(sessionId) || 0;
    this.permissionDenials.set(sessionId, current + 1);
  }

  getPermissionDenials(sessionId?: string): number | Map<string, number> {
    if (sessionId) {
      return this.permissionDenials.get(sessionId) || 0;
    }
    return new Map(this.permissionDenials);
  }

  // v1.0.82: Task completion metrics
  getTaskMetrics(taskId?: string) {
    if (taskId) {
      return this.completedTasks.get(taskId);
    }
    
    const tasks = Array.from(this.completedTasks.values());
    const successCount = tasks.filter(t => t.success).length;
    const avgDuration = tasks.length > 0 
      ? tasks.reduce((sum, t) => sum + t.duration, 0) / tasks.length 
      : 0;
    
    return {
      totalTasks: tasks.length,
      successRate: tasks.length > 0 ? successCount / tasks.length : 0,
      averageDuration: avgDuration,
      activeCount: this.activeTasks.size,
    };
  }

  // v1.0.82: Session support
  clearSession(sessionId: string): void {
    // Abort any active tasks for this session
    for (const [taskId, task] of Array.from(this.activeTasks)) {
      if (task.sessionId === sessionId) {
        this.abortTask(taskId, `Session ${sessionId} cleared`);
      }
    }
    
    // Clear permission denials for this session
    this.permissionDenials.delete(sessionId);
  }
}

// Enhanced global instances with initialization guards
let _globalClaudeTaskManager: ClaudeTaskManager | null = null;
let _globalSlashCommandProcessor: SlashCommandProcessor | null = null;
let _globalDirectorySearchHelper: DirectorySearchHelper | null = null;
let _globalSessionManager: SessionManager | null = null;

export function getGlobalClaudeTaskManager(): ClaudeTaskManager {
  if (!_globalClaudeTaskManager) {
    _globalClaudeTaskManager = new ClaudeTaskManager();
    logger.info('🌍 Initialized global Claude task manager');
  }
  return _globalClaudeTaskManager;
}

export function getGlobalSlashCommandProcessor(): SlashCommandProcessor {
  if (!_globalSlashCommandProcessor) {
    _globalSlashCommandProcessor = new SlashCommandProcessor();
    logger.info('🌍 Initialized global slash command processor');
  }
  return _globalSlashCommandProcessor;
}

export function getGlobalDirectorySearchHelper(): DirectorySearchHelper {
  if (!_globalDirectorySearchHelper) {
    _globalDirectorySearchHelper = new DirectorySearchHelper();
    logger.info('🌍 Initialized global directory search helper');
  }
  return _globalDirectorySearchHelper;
}

export function getGlobalSessionManager(): SessionManager {
  if (!_globalSessionManager) {
    _globalSessionManager = new SessionManager();
    logger.info('🌍 Initialized global session manager');
  }
  return _globalSessionManager;
}

// Cleanup function for global instances
export function cleanupGlobalInstances(): void {
  if (_globalClaudeTaskManager) {
    _globalClaudeTaskManager.abortAllTasks('Global cleanup');
  }
  if (_globalSessionManager) {
    _globalSessionManager.cleanupInactiveSessions(0); // Clean all
  }
  
  _globalClaudeTaskManager = null;
  _globalSlashCommandProcessor = null;
  _globalDirectorySearchHelper = null;
  _globalSessionManager = null;
  
  logger.info('🧹 Cleaned up all global instances');
}

/**
 * v1.0.82: Enhanced slash command processing utilities
 */
export class SlashCommandProcessor {
  private customCommands = new Map<string, string>();
  
  constructor(customCommands: Record<string, string> = {}) {
    Object.entries(customCommands).forEach(([name, content]) => {
      this.customCommands.set(name, content);
    });
  }

  processSlashCommands(prompt: string): string {
    // Process built-in slash commands
    let processedPrompt = prompt;
    
    // Handle @-mentions in slash command arguments (v1.0.82 feature)
    processedPrompt = this.processAtMentions(processedPrompt);
    
    // Process custom slash commands
    for (const [name, content] of Array.from(this.customCommands)) {
      const slashPattern = new RegExp(`/${name}\\b`, 'g');
      processedPrompt = processedPrompt.replace(slashPattern, content);
    }
    
    return processedPrompt;
  }
  
  private processAtMentions(prompt: string): string {
    // v1.0.82: Support @-mentions in slash command arguments
    // This would typically integrate with file system to resolve paths
    return prompt.replace(/@([^\s]+)/g, (match, path) => {
      // For now, just preserve the mention - in real implementation,
      // this would resolve the file path and potentially read the content
      logger.debug(`📎 Processing @-mention: ${path}`);
      return match;
    });
  }
  
  addCustomCommand(name: string, content: string): void {
    this.customCommands.set(name, content);
    logger.info(`➕ Added custom slash command: /${name}`);
  }
  
  removeCustomCommand(name: string): boolean {
    const removed = this.customCommands.delete(name);
    if (removed) {
      logger.info(`➖ Removed custom slash command: /${name}`);
    }
    return removed;
  }
  
  getAvailableCommands(): string[] {
    return Array.from(this.customCommands.keys());
  }
}

/**
 * v1.0.82: Utility functions for additional directories support
 */
export class DirectorySearchHelper {
  private additionalPaths: Set<string> = new Set();
  
  constructor(additionalDirectories: string[] = []) {
    additionalDirectories.forEach(dir => this.additionalPaths.add(dir));
  }
  
  addDirectory(path: string): void {
    this.additionalPaths.add(path);
    logger.info(`📁 Added additional search directory: ${path}`);
  }
  
  removeDirectory(path: string): boolean {
    const removed = this.additionalPaths.delete(path);
    if (removed) {
      logger.info(`📁 Removed additional search directory: ${path}`);
    }
    return removed;
  }
  
  getSearchPaths(): string[] {
    return Array.from(this.additionalPaths);
  }
  
  // This would integrate with Claude Code's file search capabilities
  expandSearchScope(baseSearchPaths: string[]): string[] {
    return [...baseSearchPaths, ...this.getSearchPaths()];
  }
}

/**
 * v1.0.82: Session management utilities
 */
export class SessionManager {
  private sessions = new Map<string, {
    id: string;
    startTime: number;
    lastActivity: number;
    taskCount: number;
    permissionDenials: number;
  }>();
  
  createSession(sessionId?: string): string {
    const id = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    this.sessions.set(id, {
      id,
      startTime: now,
      lastActivity: now,
      taskCount: 0,
      permissionDenials: 0,
    });
    
    logger.info(`🎬 Created new session: ${id}`);
    return id;
  }
  
  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      session.taskCount++;
    }
  }
  
  trackPermissionDenial(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.permissionDenials++;
    }
  }
  
  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }
  
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
  
  endSession(sessionId: string): boolean {
    const removed = this.sessions.delete(sessionId);
    if (removed) {
      logger.info(`🎬 Ended session: ${sessionId}`);
      // Also clean up any active tasks for this session
      globalClaudeTaskManager.clearSession(sessionId);
    }
    return removed;
  }
  
  cleanupInactiveSessions(inactiveThresholdMs = 30 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [id, session] of Array.from(this.sessions)) {
      if (now - session.lastActivity > inactiveThresholdMs) {
        this.endSession(id);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`🧹 Cleaned up ${cleaned} inactive sessions`);
    }
    
    return cleaned;
  }
}

/**
 * Filter messages for Claude Code compatibility
 * Removes unsupported content like images and ensures text content
 */
export function filterMessagesForClaudeCode(
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string }> }>
): Array<{ role: string; content: string | Array<{ type: string; text?: string }> }> {
  return messages.map((message) => {
    if (Array.isArray(message.content)) {
      // Filter out image blocks since Claude Code doesn't support them
      const textContent = message.content.filter(
        (content: any) => content.type === 'text'
      );
      return {
        ...message,
        content:
          textContent.length > 0
            ? textContent
            : [{ type: 'text' as const, text: 'Empty message' }],
      };
    }
    return message;
  });
}

// Backward compatibility - expose the same global instances as before
export const globalClaudeTaskManager = getGlobalClaudeTaskManager();
export const globalSlashCommandProcessor = getGlobalSlashCommandProcessor();
export const globalDirectorySearchHelper = getGlobalDirectorySearchHelper();
export const globalSessionManager = getGlobalSessionManager();
