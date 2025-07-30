/**
 * Agentic-Flow Hook System Types;
 * Comprehensive type system for hook-based automation and workflow management;
 */
export // interface HookContext {id = > Promise<HookResult> | HookResult
// // }
export // interface HookCondition {type = > boolean
// // }
export // interface HookGroup {name = > Promise<HookResult> | HookResult
// // }
export // interface PostTaskHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
export // interface PreEditHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
export // interface PostEditHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
export // interface PreSearchHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
export // interface LLMHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
export // interface NeuralHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
// export // interface PerformanceHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
// export // interface MemoryHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
// export // interface WorkflowHook extends Hook {execute = > Promise<HookResult> | HookResult
// // }
// Payload types for different hook types
// export // interface PreTaskPayload extends HookPayload {data = | 'parallel' // Execute all hooks simultaneously
// | 'sequential'    // Execute hooks one after another
//   | 'priority'      // Execute by priority order
//   | 'conditional'   // Execute based on conditions
//   | 'pipeline'      // Pass result from one hook to next
//   | 'tree' // Execute in tree structure based on dependencies
// 
// // Hook registration and management
// export interface HookRegistration {name = | 'pre-task'
// | 'post-task'
// | 'pre-edit'
// | 'post-edit'
// | 'pre-search'
// | 'post-search'
// | 'pre-command'
// | 'post-command'
// | 'llm-request'
// | 'llm-response'
// | 'neural-operation'
// | 'performance-metric'
// | 'memory-operation'
// | 'workflow-step'
// | 'session-start'
// | 'session-end'
// | 'error-handler'
// | 'notification'
// | 'custom'
// // Hook execution context and state
// export interface HookExecutionContext {
//   // executionId: string
//   // hookType: HookType
//   // startTime: Date
//   endTime?;
//   duration?;
//   hooksExecuted;
//   hooksSkipped;
//   hooksFailed;
//   results: Record<string, HookResult>;
//   // totalHooks: number
//   // strategy: HookExecutionStrategy
//   metadata: Record<string, any>;
// // }
// Hook metrics and monitoring
// export // interface HookMetrics {
//   // totalExecutions: number
//   // successfulExecutions: number
//   // failedExecutions: number
//   // averageExecutionTime: number
//   // p95ExecutionTime: number
//   // p99ExecutionTime: number
//   // errorRate: number
//   lastExecution?;
//   executionHistory: Array<{
//     // timestamp: Date
//     // duration: number
//     // success: boolean
//     error?;
//   }>;
// }
// Hook lifecycle events
// export // interface HookLifecycleEvent {
//   type: 'registered' | 'unregistered' | 'enabled' | 'disabled' | 'executed' | 'failed';
//   // hookName: string
//   // timestamp: Date
//   data?;
//   error?;
// // }
// Hook storage and persistence
// export // interface HookStorage {
//   saveHook(registration): Promise<void>;
//   loadHook(name): Promise<HookRegistration | null>;
//   listHooks(type?): Promise<HookRegistration[]>;
//   deleteHook(name): Promise<void>;
//   saveMetrics(hookName, metrics): Promise<void>;
//   loadMetrics(hookName): Promise<HookMetrics | null>;
// // }
// Hook validation and security
// export // interface HookValidator {
//   validateHook(hook): Promise<ValidationResult>;
//   validatePayload(payload): Promise<ValidationResult>;
//   checkPermissions(hookName, context): Promise<boolean>;
// // }
// export // interface ValidationResult {
//   // valid: boolean
//   errors;
//   warnings;
//   suggestions;
// // }
// Hook debugging and profiling
// export // interface HookProfiler {
//   startProfiling(hookName); // Returns profile ID
//   stopProfiling(profileId);
//   getProfile(hookName): HookProfile | null;
// // }
// export // interface HookProfile {
//   // hookName: string
//   // executionTime: number
//   memoryUsage: {
//     // start: number
//     // end: number
//     // peak: number
//   };
  // cpuUsage: number
  // ioOperations: number
  // networkCalls: number
  // databaseQueries: number
  // cacheHits: number
  // cacheMisses: number
// }
// Advanced hook features
// export // interface ConditionalHook extends Hook {
//   conditions;
//   fallbackHook?;
// // }
// export // interface ScheduledHook extends Hook {
//   schedule: {
//     type: 'cron' | 'interval' | 'once';
//     // expression: string
//     timezone?;
//     startDate?;
//     endDate?;
//   };
// }
// export // interface DependentHook extends Hook {
//   dependencies: Array<{
//     // hookName: string
//     condition: 'success' | 'failure' | 'completion';
//     timeout?;
//   }>;
// }
// Hook composition and chaining
// export // interface HookChain {
//   // name: string
//   // description: string
//   hooks: Array<{
//     // hookName: string
//     input?;
//     outputMapping?: Record<string, string>;
//     errorHandling?: 'continue' | 'stop' | 'retry' | 'fallback';
//     fallbackHook?;
//   }>;
  // strategy: HookExecutionStrategy
  // timeout: number
// }
// Hook templating and configuration
// export // interface HookTemplate {
//   // name: string
//   // description: string
//   // version: string
//   parameters: Array<{
//     // name: string
//     type: 'string' | 'number' | 'boolean' | 'object' | 'array';
//     // required: boolean
//     default?;
//     // description: string
//   }>;
  // template: Hook
// }
// export // interface HookConfiguration {
//   // globalConfig: HookManagerConfig
//   hookConfigs: Record<string, Partial<Hook>>;
//   groupConfigs: Record<string, Partial<HookGroup>>;
//   templates;
//   customTypes: Record<string, any>;
// // }


}}