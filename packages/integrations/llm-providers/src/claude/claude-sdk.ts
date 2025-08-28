/**
 * @fileoverview Claude Code SDK Integration - Refactored Clean Version
 *
 * Refactored from 1,400+ line monolithic file into focused, maintainable modules.
 * This is the main orchestration layer that coordinates between specialized modules.
 *
 * CLEAN ARCHITECTURE:
 * - Types:./types['ts'] - All type definitions
 * - Utils:./utils['ts'] - Pure utility functions
 * - Permissions:./permission-handler['ts'] - Security & access control
 * - Messages:./message-processor['ts'] - Message handling & transformation
 * - SDK Core:This file - Main orchestration & API
 */

import { query} from '@anthropic-ai/claude-code/sdk.mjs';
import { getLogger, withRetry, withTimeout} from '@claude-zen/foundation';

import { createPermissionHandler} from './permission-handler';
import {
  type ClaudeMessage,
  type ClaudeSDKOptions,
  DEFAULT_SDK_OPTIONS,
} from './types';
import { resolveWorkingDirectory, validateTaskInputs} from './utils';

export * from './message-processor';
export * from './permission-handler';
// Re-export types for consumers
export type * from './types';
export * from './utils';

// Import from message processor
import {
  processClaudeMessage,
  validateProcessedMessage,
} from './message-processor';

const logger = getLogger('claude-sdk');

// =============================================================================
// Global State Management (Simplified)
// =============================================================================

let globalTaskManager:ClaudeTaskManager | null = null;

// =============================================================================
// Main SDK Functions
// =============================================================================

/**
 * Execute a Claude task with comprehensive error handling and validation
 */
export async function executeClaudeTask(
  prompt:string,
  options:ClaudeSDKOptions = {}
):Promise<ClaudeMessage[]> {
  // Validate inputs
  validateTaskInputs(prompt, options);

  // Merge with defaults
  const config = { ...DEFAULT_SDK_OPTIONS, ...options};

  // Resolve working directory
  const workingDirectory = resolveWorkingDirectory(config.workingDirectory);

  // Create permission handler
  const permissionHandler = await createPermissionHandler(
    config.permissionMode,
    config.customPermissionHandler
  );

  // Setup cancellation
  const controller = new AbortController();
  const __timeoutId = setTimeout(() => {
    controller.abort();
}, config.timeout);

  try {
    logger.info(`Executing Claude task with model:${config.model}`);
    logger.debug(`Working directory:${workingDirectory}`);

    // Prepare SDK options
    const sdkOptions = {
      model:config.model,
      maxTokens:config.maxTokens,
      temperature:config.temperature,
      topP:config.topP,
      stream:config.stream,
      workingDirectory,
      systemPrompt:config.systemPrompt,
      signal:controller.signal,
      canUseTool:permissionHandler,
      dangerouslySkipPermissions:config.dangerouslySkipPermissions,
};

    // Execute with retry logic using foundation's withRetry
    const retryOptions = {
      attempts:config.retries,
      delay:config.retryDelay,
      factor:2,
      maxDelay:config['retryDelay'] * 8,
      shouldRetry:(error: Error) => {
        const message = error.message.toLowerCase();
        return (
          message.includes('timeout') ||
          message.includes('network') ||
          message.includes('connection') ||
          message.includes('econnreset') ||
          message.includes('rate limit')
        );
},
};

    const executeWithRetry = async () =>
      await withRetry(
        async () =>
          await query([{ role: 'user', content:prompt}], sdkOptions),
        retryOptions
      );

    // Use foundation's timeout protection
    const retryResult = await executeWithRetry();
    if (
      retryResult &&
      typeof retryResult === 'object' &&
      'isErr' in retryResult &&
      retryResult.isErr()
    ) {
      throw retryResult.error;
}

    const resultValue =
      retryResult && typeof retryResult === 'object' && ' value' in retryResult
        ? retryResult.value
        :retryResult;
    const result = await withTimeout(
      () => Promise.resolve(resultValue),
      config.timeout,
      `Claude SDK request timed out after ${config.timeout}ms`
    );

    // Extract actual result if wrapped in Result type - handle neverthrow Result type
    let actualResult:unknown;
    if (result && typeof result === 'object' && ' isOk' in result) {
      // This is a Result type from neverthrow
      if (result.isOk()) {
        actualResult = result.value;
} else {
        throw new Error(`Claude SDK error:${  result.error}`);
}
} else {
      actualResult = result;
}

    // Process messages
    const messages = Array.isArray(actualResult)
      ? actualResult
      :[actualResult];
    const processedMessages = messages.map((msg:unknown, index:number) =>
      processClaudeMessage(msg, index)
    );

    // Validate all messages
    const validMessages = processedMessages.filter(validateProcessedMessage);

    if (validMessages['length'] === 0) {
      throw new Error('No valid messages returned from Claude SDK');
}

    logger.info(
      `Task completed successfully, returned ${
        validMessages['length'] 
} messages`
    );
    return validMessages;
} catch (error) {
    logger.error('Claude task execution failed: ', error);
    throw new Error(
      `Claude task failed:${
        error instanceof Error ? error['message'] : ' Unknown error'}`
    );
} finally {
    clearTimeout(_timeoutId);
}
}

/**
 * Execute swarm coordination task (simplified for foundation)
 */
export function executeSwarmCoordinationTask(
  prompt:string,
  options:ClaudeSDKOptions = {}
):Promise<ClaudeMessage[]> {
  logger.info('Executing swarm coordination task');

  // Add swarm-specific system prompt
  const swarmOptions = {
    ...options,
    systemPrompt:(
      `${options.systemPrompt || ''}\n\nYou are coordinating with a swarm system. Focus on clear, actionable responses.`
    ).trim(),
};

  return executeClaudeTask(prompt, swarmOptions);
}

/**
 * Stream Claude task (simplified implementation for foundation)
 */
export async function streamClaudeTask(
  prompt:string,
  options:ClaudeSDKOptions = {},
  onMessage?:(message: ClaudeMessage) => void
):Promise<ClaudeMessage[]> {
  logger.info('Starting Claude task streaming');

  const streamOptions = {
    ...options,
    stream:true,
};

  // For foundation, we'll simulate streaming by executing normally
  // and calling onMessage for each result
  const messages = await executeClaudeTask(prompt, streamOptions);

  if (onMessage) {
    for (const message of messages) {
      onMessage(message);
}
}

  return messages;
}

/**
 * Execute multiple Claude tasks in parallel
 */
export async function executeParallelClaudeTasks(
  tasks:Array<{ prompt: string; options?: ClaudeSDKOptions}>,
  globalOptions:ClaudeSDKOptions = {}
):Promise<ClaudeMessage[][]> {
  logger.info(`Executing ${  tasks['length']} Claude tasks in parallel`);

  if (tasks['length'] === 0) {
    return [];
}

  if (tasks['length'] > 10) {
    logger.warn('Executing many tasks in parallel, consider batching');
}

  const taskPromises = tasks.map(async (task, index) => {
    const taskOptions = { ...globalOptions, ...task['options']};
    logger.debug(`Starting parallel task ${  index + 1}/${  tasks.length}`);

    try {
      return await executeClaudeTask(task.prompt, taskOptions);
} catch (error) {
      logger.error(`Parallel task ${  index + 1} failed:`, error);
      // Return error message instead of throwing
      return [
        {
          type:'system' as const,
          content:
            `Task failed:${
            error instanceof Error ? error['message'] : ' Unknown error'}`,
          timestamp:Date.now(),
          metadata:{
            level:'error' as const,
            source: 'parallel-execution',            taskIndex:index,
},
},
];
}
});

  const results = await Promise.all(taskPromises);
  logger.info(`Completed ${  results['length']} parallel tasks`);

  return results;
}

// =============================================================================
// Task Manager (Simplified)
// =============================================================================

export class ClaudeTaskManager {
  private sessionId:string;
  private history:ClaudeMessage[] = [];

  constructor(options:ClaudeSDKOptions = {}) {
    this['sessionId'] = options[' sessionId'] || `session_${  Date.now()}`;
    logger.debug(`Created task manager with session:${  this.sessionId}`);
}

  async executeTask(
    prompt:string,
    options:ClaudeSDKOptions = {}
  ):Promise<ClaudeMessage[]> {
    const taskOptions = {
      ...options,
      sessionId:this.sessionId,
};

    const messages = await executeClaudeTask(prompt, taskOptions);

    if (taskOptions['preserveHistory'] !== false) {
      this.history.push(...messages);
}

    return messages;
}

  getHistory():ClaudeMessage[] {
    return [...this.history];
}

  clearHistory():void {
    this['history'] = [];
    logger.debug(`Cleared history for session:${  this.sessionId}`);
}

  getSessionId():string {
    return this.sessionId;
}
}

/**
 * Get or create global task manager
 */
export function getGlobalClaudeTaskManager():ClaudeTaskManager {
  if (!globalTaskManager) {
    globalTaskManager = new ClaudeTaskManager();
    logger.debug('Created global Claude task manager');
}
  return globalTaskManager;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Filter messages for Claude Code compatibility
 */
export function filterMessagesForClaudeCode(
  messages:ClaudeMessage[]
):ClaudeMessage[] {
  return messages.filter((msg) => {
    // Filter out system messages that might confuse Claude Code
    if (msg['type'] === ' system' && msg.metadata?.source === ' internal') {
      return false;
}

    // Ensure content is not empty
    return msg['content'] && msg.content.trim()[' length'] > 0;
});
}

/**
 * Cleanup global instances
 */
export function cleanupGlobalInstances():void {
  if (globalTaskManager) {
    globalTaskManager.clearHistory();
    globalTaskManager = null;
    logger.debug('Cleaned up global Claude task manager');
}
}

// =============================================================================
// Process Lifecycle Integration
// =============================================================================

// Cleanup on process exit
process.on('exit', cleanupGlobalInstances);
process.on('SIGINT', cleanupGlobalInstances);
process.on('SIGTERM', cleanupGlobalInstances);
