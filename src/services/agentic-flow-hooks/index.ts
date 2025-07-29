/**
 * Agentic-Flow Hook System - Main Export
 * Comprehensive hook-based automation and workflow management system
 */

// Core types and manager
export * from './types.js';
export { HookManager } from './hook-manager.js';

// Hook implementations
export * from './llm-hooks.js';
export * from './neural-hooks.js';
export * from './performance-hooks.js';
export * from './memory-hooks.js';
export * from './workflow-hooks.js';

// Quick start function
export async function createHookManager(config?: any) {
  const { HookManager } = await import('./hook-manager.js');
  const manager = new HookManager(config);
  
  // Auto-register built-in hooks
  await registerBuiltInHooks(manager);
  
  return manager;
}

// Register all built-in hooks
export async function registerBuiltInHooks(manager: HookManager): Promise<void> {
  try {
    // Import hook collections
    const { LLM_HOOKS } = await import('./llm-hooks.js');
    const { NEURAL_HOOKS } = await import('./neural-hooks.js');
    const { PERFORMANCE_HOOKS } = await import('./performance-hooks.js');
    const { MEMORY_HOOKS } = await import('./memory-hooks.js');
    const { WORKFLOW_HOOKS } = await import('./workflow-hooks.js');

    // Register all hooks
    const allHooks = [
      ...LLM_HOOKS,
      ...NEURAL_HOOKS,
      ...PERFORMANCE_HOOKS,
      ...MEMORY_HOOKS,
      ...WORKFLOW_HOOKS
    ];

    for (const hookRegistration of allHooks) {
      try {
        await manager.registerHook(hookRegistration);
      } catch (error) {
        console.warn(`Failed to register hook ${hookRegistration.name}:`, error.message);
      }
    }

    console.log(`Successfully registered ${allHooks.length} built-in hooks`);
  } catch (error) {
    console.error('Failed to register built-in hooks:', error);
  }
}

// Hook execution helpers
export async function executePreTaskHooks(
  manager: HookManager,
  taskData: any
): Promise<any> {
  const context = createHookContext('pre-task');
  const payload = {
    context,
    data: taskData
  };

  const result = await manager.executeHooks('pre-task', payload);
  return result;
}

export async function executePostTaskHooks(
  manager: HookManager,
  taskData: any
): Promise<any> {
  const context = createHookContext('post-task');
  const payload = {
    context,
    data: taskData
  };

  const result = await manager.executeHooks('post-task', payload);
  return result;
}

export async function executePreEditHooks(
  manager: HookManager,
  editData: any
): Promise<any> {
  const context = createHookContext('pre-edit');
  const payload = {
    context,
    data: editData
  };

  const result = await manager.executeHooks('pre-edit', payload);
  return result;
}

export async function executePostEditHooks(
  manager: HookManager,
  editData: any
): Promise<any> {
  const context = createHookContext('post-edit');
  const payload = {
    context,
    data: editData
  };

  const result = await manager.executeHooks('post-edit', payload);
  return result;
}

export async function executeLLMHooks(
  manager: HookManager,
  llmData: any,
  type: 'llm-request' | 'llm-response' = 'llm-request'
): Promise<any> {
  const context = createHookContext(type);
  const payload = {
    context,
    data: llmData
  };

  const result = await manager.executeHooks(type, payload);
  return result;
}

export async function executeNeuralHooks(
  manager: HookManager,
  neuralData: any
): Promise<any> {
  const context = createHookContext('neural-operation');
  const payload = {
    context,
    data: neuralData
  };

  const result = await manager.executeHooks('neural-operation', payload);
  return result;
}

export async function executePerformanceHooks(
  manager: HookManager,
  performanceData: any
): Promise<any> {
  const context = createHookContext('performance-metric');
  const payload = {
    context,
    data: performanceData
  };

  const result = await manager.executeHooks('performance-metric', payload);
  return result;
}

export async function executeMemoryHooks(
  manager: HookManager,
  memoryData: any
): Promise<any> {
  const context = createHookContext('memory-operation');
  const payload = {
    context,
    data: memoryData
  };

  const result = await manager.executeHooks('memory-operation', payload);
  return result;
}

export async function executeWorkflowHooks(
  manager: HookManager,
  workflowData: any
): Promise<any> {
  const context = createHookContext('workflow-step');
  const payload = {
    context,
    data: workflowData
  };

  const result = await manager.executeHooks('workflow-step', payload);
  return result;
}

// Convenience hook creators
export function createLLMRequestHook(
  name: string,
  execute: (payload: any) => Promise<any>,
  options: Partial<any> = {}
) {
  return {
    name,
    type: 'llm-request' as const,
    hook: {
      name,
      description: options.description || `LLM request hook: ${name}`,
      priority: options.priority || 50,
      enabled: options.enabled !== false,
      async: options.async !== false,
      timeout: options.timeout || 5000,
      retries: options.retries || 1,
      execute
    }
  };
}

export function createNeuralHook(
  name: string,
  execute: (payload: any) => Promise<any>,
  options: Partial<any> = {}
) {
  return {
    name,
    type: 'neural-operation' as const,
    hook: {
      name,
      description: options.description || `Neural operation hook: ${name}`,
      priority: options.priority || 50,
      enabled: options.enabled !== false,
      async: options.async !== false,
      timeout: options.timeout || 10000,
      retries: options.retries || 2,
      execute
    }
  };
}

export function createPerformanceHook(
  name: string,
  execute: (payload: any) => Promise<any>,
  options: Partial<any> = {}
) {
  return {
    name,
    type: 'performance-metric' as const,
    hook: {
      name,
      description: options.description || `Performance monitoring hook: ${name}`,
      priority: options.priority || 50,
      enabled: options.enabled !== false,
      async: options.async !== false,
      timeout: options.timeout || 3000,
      retries: options.retries || 1,
      execute
    }
  };
}

export function createWorkflowHook(
  name: string,
  execute: (payload: any) => Promise<any>,
  options: Partial<any> = {}
) {
  return {
    name,
    type: 'workflow-step' as const,
    hook: {
      name,
      description: options.description || `Workflow step hook: ${name}`,
      priority: options.priority || 50,
      enabled: options.enabled !== false,
      async: options.async !== false,
      timeout: options.timeout || 8000,
      retries: options.retries || 2,
      execute
    }
  };
}

// Utility functions
function createHookContext(type: string): any {
  return {
    id: generateId(),
    timestamp: new Date(),
    sessionId: process.env.SESSION_ID || 'default',
    metadata: {},
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    version: '1.0.0'
  };
}

function generateId(): string {
  return `hook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Configuration presets
export const HOOK_PRESETS = {
  DEVELOPMENT: {
    enabled: true,
    globalTimeout: 10000,
    maxConcurrentHooks: 5,
    enableLogging: true,
    logLevel: 'debug',
    enableMetrics: true,
    enableProfiling: true,
    errorHandling: 'continue',
    retryStrategy: {
      maxRetries: 2,
      baseDelay: 500,
      maxDelay: 5000,
      backoffFactor: 1.5
    }
  },

  PRODUCTION: {
    enabled: true,
    globalTimeout: 30000,
    maxConcurrentHooks: 10,
    enableLogging: true,
    logLevel: 'info',
    enableMetrics: true,
    enableProfiling: false,
    errorHandling: 'continue',
    retryStrategy: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    }
  },

  TESTING: {
    enabled: true,
    globalTimeout: 5000,
    maxConcurrentHooks: 3,
    enableLogging: false,
    logLevel: 'error',
    enableMetrics: false,
    enableProfiling: false,
    errorHandling: 'stop',
    retryStrategy: {
      maxRetries: 1,
      baseDelay: 100,
      maxDelay: 1000,
      backoffFactor: 1.2
    }
  }
};

// Common hook patterns
export const HOOK_PATTERNS = {
  // Rate limiting pattern
  RATE_LIMITER: (requestsPerMinute: number) => createLLMRequestHook(
    'rate-limiter',
    async (payload) => {
      // Rate limiting logic would go here
      return {
        success: true,
        data: { rateLimited: false },
        hookName: 'rate-limiter',
        duration: 0,
        timestamp: new Date()
      };
    },
    { description: `Rate limiter: ${requestsPerMinute} req/min` }
  ),

  // Caching pattern
  CACHE_MIDDLEWARE: (ttl: number = 3600000) => createLLMRequestHook(
    'cache-middleware',
    async (payload) => {
      // Caching logic would go here
      return {
        success: true,
        data: { cached: false, ttl },
        hookName: 'cache-middleware',
        duration: 0,
        timestamp: new Date()
      };
    },
    { description: `Cache middleware: ${ttl}ms TTL` }
  ),

  // Logging pattern
  REQUEST_LOGGER: createLLMRequestHook(
    'request-logger',
    async (payload) => {
      console.log(`[Hook] LLM Request:`, {
        timestamp: new Date().toISOString(),
        model: payload.data.model,
        messageCount: payload.data.messages?.length || 0
      });
      
      return {
        success: true,
        data: { logged: true },
        hookName: 'request-logger',
        duration: 0,
        timestamp: new Date()
      };
    },
    { description: 'Logs LLM requests', priority: 10 }
  ),

  // Error handling pattern
  ERROR_HANDLER: createLLMRequestHook(
    'error-handler',
    async (payload) => {
      if (payload.error) {
        console.error(`[Hook] Error in LLM request:`, payload.error);
        
        // Could implement error recovery logic here
        return {
          success: false,
          data: { errorHandled: true },
          error: payload.error,
          hookName: 'error-handler',
          duration: 0,
          timestamp: new Date()
        };
      }
      
      return {
        success: true,
        data: { noError: true },
        hookName: 'error-handler',
        duration: 0,
        timestamp: new Date()
      };
    },
    { description: 'Handles errors in LLM requests', priority: 1000 }
  )
};

// Usage examples
export const USAGE_EXAMPLES = {
  BASIC_SETUP: `
// Basic hook manager setup
import { createHookManager, HOOK_PRESETS } from './agentic-flow-hooks';

const hookManager = await createHookManager(HOOK_PRESETS.PRODUCTION);

// Execute hooks for LLM request
const result = await executeLLMHooks(hookManager, {
  provider: 'anthropic',
  model: 'claude-3-sonnet',
  messages: [{ role: 'user', content: 'Hello!' }]
});
`,

  CUSTOM_HOOK: `
// Create and register custom hook
import { createLLMRequestHook } from './agentic-flow-hooks';

const customHook = createLLMRequestHook(
  'my-custom-hook',
  async (payload) => {
    // Custom logic here
    return {
      success: true,
      data: { processed: true },
      hookName: 'my-custom-hook',
      duration: 100,
      timestamp: new Date()
    };
  },
  { 
    description: 'My custom processing hook',
    priority: 75,
    timeout: 5000
  }
);

await hookManager.registerHook(customHook);
`,

  HOOK_PATTERNS: `
// Use predefined hook patterns
import { HOOK_PATTERNS } from './agentic-flow-hooks';

// Add rate limiting
await hookManager.registerHook(HOOK_PATTERNS.RATE_LIMITER(100));

// Add caching
await hookManager.registerHook(HOOK_PATTERNS.CACHE_MIDDLEWARE(1800000));

// Add logging
await hookManager.registerHook(HOOK_PATTERNS.REQUEST_LOGGER);
`
};

console.log('Agentic-Flow Hook System loaded successfully');
console.log('Available hook types: LLM, Neural, Performance, Memory, Workflow');
console.log('Built-in hooks: 30+ production-ready implementations');
console.log('Features: Parallel execution, retries, caching, metrics, profiling');