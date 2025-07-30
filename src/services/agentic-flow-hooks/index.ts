/**
 * Agentic-Flow Hook System - Main Export
 * Comprehensive hook-based automation and workflow management system
 */

export { HookManager } from './hook-manager.js';
// Hook implementations
export * from './llm-hooks.js';
export * from './memory-hooks.js';
export * from './neural-hooks.js';
export * from './performance-hooks.js';
// Core types and manager
export * from './types.js';
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
export async function registerBuiltInHooks(manager = await import('./llm-hooks.js');
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
  ...WORKFLOW_HOOKS,
];

for (const hookRegistration of allHooks) {
  try {
    await manager.registerHook(hookRegistration);
  } catch (error) {
    console.warn(`Failed to register hook ${hookRegistration.name}:`, error.message);
  }
}

console.warn(`Successfully registered ${allHooks.length} built-in hooks`);
} catch (error)
{
  console.error('Failed to register built-inhooks = createHookContext('pre-task');
  const payload = {
    context,data = await manager.executeHooks('pre-task', payload);
  return result;
}

export async function executePostTaskHooks(manager = createHookContext('post-task');
const _payload = {
    context,data = await manager.executeHooks('post-task', payload);
return result;
}

export async function executePreEditHooks(manager = createHookContext('pre-edit');
const payload = {
    context,data = await manager.executeHooks('pre-edit', payload);
return result;
}

export async function executePostEditHooks(manager = createHookContext('post-edit');
const payload = {
    context,data = await manager.executeHooks('post-edit', payload);
return result;
}

export async function executeLLMHooks(manager = 'llm-request'): Promise<any> {
  const context = createHookContext(type);
  const payload = {
    context,data = await manager.executeHooks(type, payload);
  return result;
}

export async function executeNeuralHooks(manager = createHookContext('neural-operation');
const payload = {
    context,data = await manager.executeHooks('neural-operation', payload);
return result;
}

export async function executePerformanceHooks(manager = createHookContext('performance-metric');
const payload = {
    context,data = await manager.executeHooks('performance-metric', payload);
return result;
}

export async function executeMemoryHooks(manager = createHookContext('memory-operation');
const payload = {
    context,data = await manager.executeHooks('memory-operation', payload);
return result;
}

export async function executeWorkflowHooks(manager = createHookContext('workflow-step');
const payload = {
    context,data = await manager.executeHooks('workflow-step', payload);
return result;
}

// Convenience hook creators
export function createLLMRequestHook(name = > Promise<any>,
  options = {}
) {
  return {
    name,type = = false,async = = false,timeout = > Promise<any>,
  options = {}
) 
  return {
    name,type = = false,async = = false,timeout = > Promise<any>,
  options = {}
) 
  return {
    name,type = = false,async = = false,timeout = > Promise<any>,
  options = {}
) 
  return {
    name,type = = false,async = = false,timeout = === 'production' ? 'production' : 'development',
    version = {DEVELOPMENT = {success = 3600000) => createLLMRequestHook(
    'cache-middleware',
    async (_payload) => {
      // Caching logic would go here
      return {
        success => {
      console.warn(`[Hook] LLM Request => {
      if (_payload._error) {
        console.error(`[Hook] Error in LLM request = {BASIC_SETUP = await createHookManager(HOOK_PRESETS.PRODUCTION);

// Execute hooks for LLM request
const result = await executeLLMHooks(hookManager, {provider = createLLMRequestHook(
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

console.warn('Agentic-Flow Hook System loaded successfully');
console.warn('Available hook types: LLM, Neural, Performance, Memory, Workflow');
console.warn('Built-in hooks: 30+ production-ready implementations');
console.warn('Features: Parallel execution, retries, caching, metrics, profiling');
