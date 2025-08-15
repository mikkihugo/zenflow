/**
 * FIXED: Swarm Tools with Real Claude Code SDK Integration
 * 
 * This replaces the fake work simulation with actual Claude Code SDK calls.
 */

import { executeClaudeTask } from '../../../integrations/claude-code/sdk-integration.js';
import { getLogger } from '../../../config/logging-config.js';

const logger = getLogger('swarm-tools-fixed');

/**
 * Execute task using REAL Claude Code SDK instead of fake simulation.
 * This properly delegates to Claude Code to do actual work.
 */
export async function executeTaskWithRealClaude(
  taskStr: string,
  results: any
): Promise<any> {
  const startTime = Date.now();
  logger.info('🚀 EXECUTING WITH REAL CLAUDE CODE SDK...');

  try {
    // Execute task with Claude Code SDK using dangerous permissions for swarm work
    const messages = await executeClaudeTask(taskStr, {
      maxTurns: 10,
      model: 'sonnet',
      customSystemPrompt: `You are Claude Code executing a swarm-coordinated task. 

Task: ${taskStr}

You MUST actually fix/implement/create what is requested. Use your native tools (Read, Write, Edit, MultiEdit, Bash) to do REAL work. Never simulate or fake results.`,
      allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep'],
      permissionMode: 'bypassPermissions', // Allow dangerous operations for swarm work
      workingDir: process.cwd(),
      stderr: (data: string) => {
        logger.debug(`🔧 Claude SDK: ${data}`);
      },
    });

    // Extract actual tools used and results from Claude's execution
    const actualToolsExecuted: string[] = [];
    const actualResults: string[] = [];
    let filesModified = 0;
    let success = true;

    // Parse Claude's actual work from the messages
    for (const message of messages) {
      if (message.type === 'tool_use' && message.toolName) {
        actualToolsExecuted.push(message.toolName);
        if (['Write', 'Edit', 'MultiEdit'].includes(message.toolName)) {
          filesModified++;
          // Track file operations from tool input
          if (message.toolInput?.file_path) {
            results.fileOperations.push(message.toolInput.file_path);
          }
        }
      }
      if (message.type === 'tool_result') {
        // Claude actually executed tools
        actualResults.push(String(message.toolResult || ''));
      }
      if (message.type === 'error') {
        success = false;
        logger.error(`❌ Claude execution error: ${message.error}`);
      }
    }

    const duration = Date.now() - startTime;
    const finalResult = messages.find(m => m.type === 'result');

    const result = {
      summary: finalResult?.result || actualResults.join('; ') || `Executed task: ${taskStr}`,
      capabilities: ['typescript-fixing', 'file-operations', 'real-work'],
      success,
      duration,
      filesModified,
      toolsUsed: actualToolsExecuted,
      messages, // Include full Claude message stream for debugging
    };

    // Update the results object with REAL data from Claude
    results.results.push(result.summary);
    results.toolCalls = actualToolsExecuted;

    if (filesModified > 0) {
      logger.info(
        `✅ REAL Claude execution completed: ${filesModified} files modified in ${duration}ms with tools: ${actualToolsExecuted.join(', ')}`
      );
    } else {
      logger.info(
        `🔄 Claude coordination completed in ${duration}ms - no file changes needed`
      );
    }

    return result;
  } catch (error) {
    logger.error('💥 REAL Claude execution failed:', error);
    return {
      summary: `Claude SDK execution failed: ${(error as Error).message}`,
      capabilities: [],
      success: false,
      duration: Date.now() - startTime,
      filesModified: 0,
      toolsUsed: [],
      error: (error as Error).message,
    };
  }
}

/**
 * Replace the fake implementation with real Claude Code integration
 */
export function patchSwarmToolsWithRealClaude(swarmToolsInstance: any) {
  // Replace the fake executeTaskWithClaude method with the real one
  swarmToolsInstance.executeTaskWithClaude = executeTaskWithRealClaude;
  
  logger.info('🔧 PATCHED: Swarm now uses REAL Claude Code SDK instead of fake simulation');
  
  return swarmToolsInstance;
}