/**
 * Agentic Zen Hook System - Main Entry Point
 * 
 * Provides comprehensive hook management for the Claude-Zen ecosystem.
 * Supports LLM, memory, neural, performance, and workflow hooks with
 * advanced pipeline orchestration and metrics collection.
 */

import { HookManager } from './hook-manager';
import { LLMHooks } from './llm-hooks';
import { MemoryHooks } from './memory-hooks';
import { NeuralHooks } from './neural-hooks';
import { PerformanceHooks } from './performance-hooks';
import { WorkflowHooks } from './workflow-hooks';

// Export types
export type {
  AgenticHookType,
  HookRegistration,
  HookFilter,
  HookHandlerResult,
  AgenticHookContext,
  HookPayload,
  HookMetrics,
  LLMHookPayload,
  MemoryHookPayload,
  NeuralHookPayload,
  PerformanceHookPayload,
  WorkflowHookPayload
} from './types';

// Export core modules
export { HookManager } from './hook-manager';
export { LLMHooks } from './llm-hooks';
export { MemoryHooks } from './memory-hooks';
export { NeuralHooks } from './neural-hooks';
export { PerformanceHooks } from './performance-hooks';
export { WorkflowHooks } from './workflow-hooks';

// Initialize logger
const logger = {
  info: (msg: string) => console.log(`[AgenticZenHooks] ${msg}`),
  warn: (msg: string) => console.warn(`[AgenticZenHooks] ${msg}`),
  error: (msg: string) => console.error(`[AgenticZenHooks] ${msg}`),
  debug: (msg: string) => console.debug(`[AgenticZenHooks] ${msg}`)
};

// Global hook manager instance
export const agenticHookManager = new HookManager(logger);

/**
 * Initialize the agentic zen hook system
 */
export async function initializeAgenticFlowHooks(): Promise<void> {
  try {
    logger.info('Initializing Agentic Zen Hook System...');
    
    // Register core hook types
    const llmHooks = new LLMHooks(logger);
    const memoryHooks = new MemoryHooks(logger);
    const neuralHooks = new NeuralHooks(logger);
    const performanceHooks = new PerformanceHooks(logger);
    const workflowHooks = new WorkflowHooks(logger);
    
    // Initialize each hook type
    await llmHooks.initialize();
    await memoryHooks.initialize();
    await neuralHooks.initialize();
    await performanceHooks.initialize();
    await workflowHooks.initialize();
    
    // Set up default pipelines
    await setupDefaultPipelines();
    
    // Start metrics collection
    startMetricsCollection();
    
    logger.info('Agentic Zen Hook System initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize hook system: ${error}`);
    throw error;
  }
}

/**
 * Set up default hook pipelines
 */
async function setupDefaultPipelines(): Promise<void> {
  // LLM call pipeline
  agenticHookManager.register({
    id: 'llm-pre-call-optimization',
    type: 'llm',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      logger.debug('Pre-LLM call optimization');
      return { success: true, modified: false };
    }
  });
  
  // Memory operation pipeline
  agenticHookManager.register({
    id: 'memory-pre-operation-validation',
    type: 'memory',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      logger.debug('Pre-memory operation validation');
      return { success: true, modified: false };
    }
  });
  
  // Workflow execution pipeline
  agenticHookManager.register({
    id: 'workflow-execution-tracking',
    type: 'workflow-step',
    priority: 5,
    enabled: true,
    handler: async (context) => {
      logger.debug('Workflow step execution tracking');
      return { success: true, modified: false };
    }
  });
}

/**
 * Start metrics collection
 */
function startMetricsCollection(): void {
  setInterval(() => {
    const metrics = agenticHookManager.getMetrics();
    logger.debug(`Hook metrics: ${JSON.stringify(metrics, null, 2)}`);
  }, 60000); // Every minute
}

/**
 * Shutdown the hook system gracefully
 */
export async function shutdownAgenticFlowHooks(): Promise<void> {
  try {
    logger.info('Shutting down Agentic Zen Hook System...');
    await agenticHookManager.shutdown();
    logger.info('Hook system shutdown complete');
  } catch (error) {
    logger.error(`Error during hook system shutdown: ${error}`);
    throw error;
  }
}

/**
 * Get current hook system status
 */
export function getHookSystemStatus(): {
  initialized: boolean;
  registeredHooks: number;
  activeHooks: number;
  metrics: any;
} {
  return {
    initialized: true,
    registeredHooks: agenticHookManager.getRegisteredHooks().length,
    activeHooks: agenticHookManager.getRegisteredHooks().filter(h => h.enabled).length,
    metrics: agenticHookManager.getMetrics()
  };
}

/**
 * Create a hook context
 */
export function createHookContext(
  type: string,
  payload: any,
  metadata?: Record<string, any>
): any {
  return {
    timestamp: Date.now(),
    type,
    payload,
    metadata: metadata || {},
    session: {
      id: `session-${Date.now()}`,
      startTime: Date.now()
    }
  };
}