/**
 * Agentic-Flow Hook System Types
 * Comprehensive type system for hook-based automation and workflow management
 */

export interface HookContext {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  version: string;
}

export interface HookPayload {
  context: HookContext;
  data: any;
  previousResult?: any;
  error?: Error;
}

export interface HookResult {
  success: boolean;
  data?: any;
  error?: Error;
  metadata?: Record<string, any>;
  duration: number;
  hookName: string;
  timestamp: Date;
}

export interface Hook {
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  async: boolean;
  timeout: number;
  retries: number;
  conditions?: HookCondition[];
  execute: (payload: HookPayload) => Promise<HookResult> | HookResult;
}

export interface HookCondition {
  type: 'equals' | 'contains' | 'regex' | 'function' | 'exists' | 'greater' | 'less';
  field: string;
  value?: any;
  function?: (payload: HookPayload) => boolean;
}

export interface HookGroup {
  name: string;
  description: string;
  hooks: Hook[];
  execution: 'parallel' | 'sequential' | 'conditional';
  stopOnError: boolean;
  timeout: number;
}

// Specific hook types for different lifecycle events
export interface PreTaskHook extends Hook {
  execute: (payload: PreTaskPayload) => Promise<HookResult> | HookResult;
}

export interface PostTaskHook extends Hook {
  execute: (payload: PostTaskPayload) => Promise<HookResult> | HookResult;
}

export interface PreEditHook extends Hook {
  execute: (payload: PreEditPayload) => Promise<HookResult> | HookResult;
}

export interface PostEditHook extends Hook {
  execute: (payload: PostEditPayload) => Promise<HookResult> | HookResult;
}

export interface PreSearchHook extends Hook {
  execute: (payload: PreSearchPayload) => Promise<HookResult> | HookResult;
}

export interface LLMHook extends Hook {
  execute: (payload: LLMPayload) => Promise<HookResult> | HookResult;
}

export interface NeuralHook extends Hook {
  execute: (payload: NeuralPayload) => Promise<HookResult> | HookResult;
}

export interface PerformanceHook extends Hook {
  execute: (payload: PerformancePayload) => Promise<HookResult> | HookResult;
}

export interface MemoryHook extends Hook {
  execute: (payload: MemoryPayload) => Promise<HookResult> | HookResult;
}

export interface WorkflowHook extends Hook {
  execute: (payload: WorkflowPayload) => Promise<HookResult> | HookResult;
}

// Payload types for different hook types
export interface PreTaskPayload extends HookPayload {
  data: {
    taskId: string;
    taskType: string;
    description: string;
    dependencies: string[];
    expectedDuration?: number;
    resources?: Record<string, any>;
  };
}

export interface PostTaskPayload extends HookPayload {
  data: {
    taskId: string;
    taskType: string;
    description: string;
    result: any;
    duration: number;
    success: boolean;
    resources?: Record<string, any>;
  };
}

export interface PreEditPayload extends HookPayload {
  data: {
    filePath: string;
    oldContent: string;
    newContent: string;
    editType: 'create' | 'update' | 'delete';
    editor: string;
    reason?: string;
  };
}

export interface PostEditPayload extends HookPayload {
  data: {
    filePath: string;
    oldContent: string;
    newContent: string;
    editType: 'create' | 'update' | 'delete';
    success: boolean;
    duration: number;
    changes: {
      linesAdded: number;
      linesRemoved: number;
      linesModified: number;
    };
  };
}

export interface PreSearchPayload extends HookPayload {
  data: {
    query: string;
    searchType: 'text' | 'code' | 'files' | 'semantic';
    scope: string[];
    filters?: Record<string, any>;
    cacheKey?: string;
  };
}

export interface LLMPayload extends HookPayload {
  data: {
    provider: string;
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    parameters: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    };
    requestType: 'generation' | 'completion' | 'embedding' | 'analysis';
  };
}

export interface NeuralPayload extends HookPayload {
  data: {
    operation: 'training' | 'inference' | 'optimization' | 'evaluation';
    model: string;
    inputData: any;
    parameters?: Record<string, any>;
    gpuEnabled: boolean;
    batchSize?: number;
  };
}

export interface PerformancePayload extends HookPayload {
  data: {
    metric: 'latency' | 'throughput' | 'memory' | 'cpu' | 'error_rate';
    value: number;
    threshold?: number;
    component: string;
    operation: string;
    timestamp: Date;
  };
}

export interface MemoryPayload extends HookPayload {
  data: {
    operation: 'store' | 'retrieve' | 'update' | 'delete' | 'search';
    key: string;
    value?: any;
    namespace?: string;
    ttl?: number;
    metadata?: Record<string, any>;
  };
}

export interface WorkflowPayload extends HookPayload {
  data: {
    workflowId: string;
    stepId: string;
    stepType: string;
    stepData: any;
    workflowContext: Record<string, any>;
    stepIndex: number;
    totalSteps: number;
  };
}

// Hook manager configuration
export interface HookManagerConfig {
  enabled: boolean;
  globalTimeout: number;
  maxConcurrentHooks: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableProfiling: boolean;
  errorHandling: 'continue' | 'stop' | 'retry';
  retryStrategy: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
  };
}

// Hook execution strategies
export type HookExecutionStrategy = 
  | 'parallel'      // Execute all hooks simultaneously
  | 'sequential'    // Execute hooks one after another
  | 'priority'      // Execute by priority order
  | 'conditional'   // Execute based on conditions
  | 'pipeline'      // Pass result from one hook to next
  | 'tree'          // Execute in tree structure based on dependencies

// Hook registration and management
export interface HookRegistration {
  name: string;
  type: HookType;
  hook: Hook;
  group?: string;
  dependencies?: string[];
  replacements?: string[]; // Hooks this one replaces
}

export type HookType = 
  | 'pre-task'
  | 'post-task'
  | 'pre-edit'
  | 'post-edit'
  | 'pre-search'
  | 'post-search'
  | 'pre-command'
  | 'post-command'
  | 'llm-request'
  | 'llm-response'
  | 'neural-operation'
  | 'performance-metric'
  | 'memory-operation'
  | 'workflow-step'
  | 'session-start'
  | 'session-end'
  | 'error-handler'
  | 'notification'
  | 'custom';

// Hook execution context and state
export interface HookExecutionContext {
  executionId: string;
  hookType: HookType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  hooksExecuted: string[];
  hooksSkipped: string[];
  hooksFailed: string[];
  results: Record<string, HookResult>;
  totalHooks: number;
  strategy: HookExecutionStrategy;
  metadata: Record<string, any>;
}

// Hook metrics and monitoring
export interface HookMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  errorRate: number;
  lastExecution?: Date;
  executionHistory: Array<{
    timestamp: Date;
    duration: number;
    success: boolean;
    error?: string;
  }>;
}

// Hook lifecycle events
export interface HookLifecycleEvent {
  type: 'registered' | 'unregistered' | 'enabled' | 'disabled' | 'executed' | 'failed';
  hookName: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}

// Hook storage and persistence
export interface HookStorage {
  saveHook(registration: HookRegistration): Promise<void>;
  loadHook(name: string): Promise<HookRegistration | null>;
  listHooks(type?: HookType): Promise<HookRegistration[]>;
  deleteHook(name: string): Promise<void>;
  saveMetrics(hookName: string, metrics: HookMetrics): Promise<void>;
  loadMetrics(hookName: string): Promise<HookMetrics | null>;
}

// Hook validation and security
export interface HookValidator {
  validateHook(hook: Hook): Promise<ValidationResult>;
  validatePayload(payload: HookPayload): Promise<ValidationResult>;
  checkPermissions(hookName: string, context: HookContext): Promise<boolean>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Hook debugging and profiling
export interface HookProfiler {
  startProfiling(hookName: string): string; // Returns profile ID
  stopProfiling(profileId: string): HookProfile;
  getProfile(hookName: string): HookProfile | null;
}

export interface HookProfile {
  hookName: string;
  executionTime: number;
  memoryUsage: {
    start: number;
    end: number;
    peak: number;
  };
  cpuUsage: number;
  ioOperations: number;
  networkCalls: number;
  databaseQueries: number;
  cacheHits: number;
  cacheMisses: number;
}

// Advanced hook features
export interface ConditionalHook extends Hook {
  conditions: HookCondition[];
  fallbackHook?: string;
}

export interface ScheduledHook extends Hook {
  schedule: {
    type: 'cron' | 'interval' | 'once';
    expression: string;
    timezone?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface DependentHook extends Hook {
  dependencies: Array<{
    hookName: string;
    condition: 'success' | 'failure' | 'completion';
    timeout?: number;
  }>;
}

// Hook composition and chaining
export interface HookChain {
  name: string;
  description: string;
  hooks: Array<{
    hookName: string;
    input?: any;
    outputMapping?: Record<string, string>;
    errorHandling?: 'continue' | 'stop' | 'retry' | 'fallback';
    fallbackHook?: string;
  }>;
  strategy: HookExecutionStrategy;
  timeout: number;
}

// Hook templating and configuration
export interface HookTemplate {
  name: string;
  description: string;
  version: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    default?: any;
    description: string;
  }>;
  template: Hook;
}

export interface HookConfiguration {
  globalConfig: HookManagerConfig;
  hookConfigs: Record<string, Partial<Hook>>;
  groupConfigs: Record<string, Partial<HookGroup>>;
  templates: HookTemplate[];
  customTypes: Record<string, any>;
}