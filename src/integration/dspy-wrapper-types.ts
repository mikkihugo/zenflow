/**
 * DSPy Wrapper Type Definitions.
 *
 * ⚠️  CRITICAL DSPY TYPE SYSTEM - NEVER REMOVE ⚠️.
 *
 * This module is CENTRAL to the massive DSPy implementation (13+ files):
 * - Re-exports from dspy.ts: GenerationOptions, LMDriver, LMError
 * - Provides compatibility layer between Claude-Zen and dspy.ts v0.1.3 API
 * - Used by: dspy-wrapper.ts, dspy-integration-manager.ts, dspy-enhanced-tools.ts
 * - Supports: dspy-swarm-coordinator.ts, dspy-agent-integration.ts, dspy-enhanced-operations.ts
 * - And 7+ other DSPy system files.
 *
 * Static analysis misses usage because:
 * 1. Type-only imports and re-exports
 * 2. Complex DSPy wrapper architecture
 * 3. Compatibility layer pattern
 * 4. Integration with external dspy.ts package.
 *
 * Comprehensive TypeScript interfaces for the DSPy wrapper system.
 * These types ensure full compatibility between Claude-Zen's expected DSPy interface
 * and the actual dspy.ts v0.1.3 API through the wrapper layer.
 *
 * @usage CRITICAL - Core type definitions for entire DSPy system (13+ files)
 * @reExports dspy.ts package types for compatibility
 * @usedBy dspy-wrapper.ts, dspy-integration-manager.ts, dspy-enhanced-tools.ts, and 10+ other DSPy modules
 */

// ============================================================================
// RE-EXPORT ACTUAL DSPY.TS TYPES
// ============================================================================
/**
 * @file TypeScript type definitions.
 */

export { GenerationOptions, LMDriver, LMError } from 'dspy.ts';

// ============================================================================
// CORE DSPy WRAPPER TYPES
// ============================================================================

/**
 * DSPy program signature parsing result.
 *
 * @example
 */
export interface ParsedSignature {
  inputs: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  raw: string;
}

/**
 * DSPy program definition with metadata and performance tracking.
 *
 * @example
 */
export interface DSPyProgram {
  id: string;
  signature: string;
  description: string;
  examples: DSPyExample[];
  optimized: boolean;
  created: Date;
  lastUsed?: Date;
  performance: DSPyProgramPerformance;
  metadata?: Record<string, any>;
}

/**
 * Training example for DSPy programs.
 *
 * @example
 */
export interface DSPyExample {
  input: Record<string, any>;
  output: Record<string, any>;
  success?: boolean;
  confidence?: number;
  timestamp?: Date;
  metadata?: {
    source?: 'manual' | 'automated' | 'feedback';
    tags?: string[];
    notes?: string;
  };
}

/**
 * Program performance metrics.
 *
 * @example
 */
export interface DSPyProgramPerformance {
  successRate: number;
  averageLatency: number;
  totalExecutions: number;
  lastExecutionTime?: number;
  confidenceScore: number;
  optimizationIterations: number;
  errorRate: number;
}

/**
 * DSPy execution result with comprehensive metadata.
 *
 * @example
 */
export interface DSPyExecutionResult {
  // Dynamic fields based on program signature
  [key: string]: any;

  // Standard metadata fields
  confidence?: number;
  reasoning?: string;
  metadata?: DSPyExecutionMetadata;
}

/**
 * Execution metadata.
 *
 * @example
 */
export interface DSPyExecutionMetadata {
  executionTime: number;
  tokensUsed?: number;
  promptUsed: string;
  responseReceived: string;
  parsedSuccessfully: boolean;
  fallbackUsed?: boolean;
  programId: string;
  timestamp: Date;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * DSPy wrapper configuration options.
 *
 * @example
 */
export interface DSPyConfig {
  // Language Model Configuration
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];

  // Wrapper-specific Configuration
  enableLogging?: boolean;
  optimizationEnabled?: boolean;
  cacheEnabled?: boolean;
  fallbackEnabled?: boolean;

  // Advanced Configuration
  retryAttempts?: number;
  timeoutMs?: number;
  rateLimitRpm?: number;

  // Custom LM Driver
  customLMDriver?: 'claude' | 'openai' | 'dummy' | 'custom';
  lmDriverConfig?: Record<string, any>;
}

/**
 * Optimization configuration.
 *
 * @example
 */
export interface DSPyOptimizationOptions {
  strategy: DSPyOptimizationStrategy;
  maxIterations?: number;
  validationThreshold?: number;
  temperature?: number;
  includeReasoningChain?: boolean;
  crossValidation?: boolean;
  earlyStopping?: boolean;
  customMetrics?: Array<(result: DSPyExecutionResult) => number>;
}

/**
 * Available optimization strategies.
 */
export type DSPyOptimizationStrategy =
  | 'auto' // Automatic strategy selection
  | 'bootstrap' // Bootstrap few-shot examples
  | 'teleprompter' // Teleprompter-style optimization
  | 'manual' // Manual example curation
  | 'gradient' // Gradient-based optimization (future)
  | 'evolutionary'; // Evolutionary optimization (future)

// ============================================================================
// SYSTEM STATISTICS AND MONITORING
// ============================================================================

/**
 * Comprehensive DSPy system statistics.
 *
 * @example
 */
export interface DSPySystemStats {
  // Program Statistics
  programs: {
    total: number;
    optimized: number;
    active: number;
    averagePerformance: number;
  };

  // Execution Statistics
  executions: {
    total: number;
    successful: number;
    failed: number;
    averageLatency: number;
    totalTokensUsed?: number;
  };

  // Time-based Statistics
  timeWindows: {
    lastHour: DSPyExecutionStats;
    lastDay: DSPyExecutionStats;
    lastWeek: DSPyExecutionStats;
  };

  // Resource Usage
  resources: {
    memoryUsage: number;
    cacheSize: number;
    activeSessions: number;
  };

  // System Health
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    lmDriver: 'healthy' | 'degraded' | 'offline';
    optimization: 'active' | 'inactive' | 'error';
    lastUpdate: Date;
  };
}

/**
 * Time-window execution statistics.
 *
 * @example
 */
export interface DSPyExecutionStats {
  executions: number;
  successRate: number;
  averageLatency: number;
  averageConfidence: number;
  errorRate: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * DSPy wrapper specific error types.
 *
 * @example
 */
export class DSPyWrapperError extends Error {
  constructor(
    message: string,
    public code: DSPyErrorCode,
    public override cause?: Error,
    public metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'DSPyWrapperError';
  }
}

export type DSPyErrorCode =
  | 'PROGRAM_NOT_FOUND'
  | 'SIGNATURE_PARSE_ERROR'
  | 'EXECUTION_FAILED'
  | 'OPTIMIZATION_FAILED'
  | 'LM_DRIVER_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'PARSING_ERROR'
  | 'VALIDATION_ERROR';

// ============================================================================
// FACTORY AND UTILITY TYPES
// ============================================================================

/**
 * Factory options for creating DSPy wrappers.
 *
 * @example
 */
export interface DSPyFactoryOptions extends DSPyConfig {
  instanceName?: string;
  sharedCache?: boolean;
  persistExamples?: boolean;
  storageLocation?: string;
}

/**
 * LM Driver factory options.
 *
 * @example
 */
export interface LMDriverFactory {
  type: 'claude' | 'openai' | 'dummy' | 'custom';
  config: Record<string, any>;
  fallbackDriver?: LMDriverFactory;
}

/**
 * Program template for common use cases.
 *
 * @example
 */
export interface DSPyProgramTemplate {
  name: string;
  signature: string;
  description: string;
  category: DSPyProgramCategory;
  examples?: DSPyExample[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedLatency?: number;
}

export type DSPyProgramCategory =
  | 'code_analysis'
  | 'code_generation'
  | 'error_diagnosis'
  | 'task_orchestration'
  | 'swarm_optimization'
  | 'text_processing'
  | 'data_extraction'
  | 'classification'
  | 'summarization'
  | 'translation'
  | 'custom';

// ============================================================================
// ADVANCED FEATURES
// ============================================================================

/**
 * DSPy program composition options.
 *
 * @example
 */
export interface DSPyCompositionOptions {
  mode: 'sequential' | 'parallel' | 'conditional';
  errorHandling: 'fail_fast' | 'continue' | 'retry';
  timeout?: number;
  retryPolicy?: {
    attempts: number;
    backoff: 'linear' | 'exponential';
    baseDelay: number;
  };
}

/**
 * Multi-program execution pipeline.
 *
 * @example
 */
export interface DSPyPipeline {
  id: string;
  name: string;
  programs: Array<{
    program: DSPyProgram;
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
    condition?: (previousResults: DSPyExecutionResult[]) => boolean;
  }>;
  composition: DSPyCompositionOptions;
  metadata?: Record<string, any>;
}

/**
 * Cache configuration and options.
 *
 * @example
 */
export interface DSPyCacheOptions {
  enabled: boolean;
  maxSize: number;
  ttlSeconds: number;
  keyStrategy: 'signature' | 'content' | 'hash';
  persistToDisk: boolean;
  compressionEnabled: boolean;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

/**
 * Claude-Zen specific integration types.
 *
 * @example
 */
export interface ClaudeZenDSPyIntegration {
  // Core Operations Integration
  codeAnalysis: DSPyProgramTemplate;
  codeGeneration: DSPyProgramTemplate;
  errorDiagnosis: DSPyProgramTemplate;

  // Swarm Integration
  agentSelection: DSPyProgramTemplate;
  topologyOptimization: DSPyProgramTemplate;
  taskOrchestration: DSPyProgramTemplate;

  // MCP Tools Integration
  projectAnalysis: DSPyProgramTemplate;
  workflowOptimization: DSPyProgramTemplate;

  // System Configuration
  config: DSPyConfig;
  monitoring: boolean;
  learning: boolean;
}

/**
 * Integration with Claude-Zen's existing systems.
 *
 * @example
 */
export interface DSPySystemIntegration {
  // Logging Integration
  logger?: {
    debug: (message: string, metadata?: any) => void;
    info: (message: string, metadata?: any) => void;
    warn: (message: string, metadata?: any) => void;
    error: (message: string, metadata?: any) => void;
  };

  // Metrics Integration
  metrics?: {
    recordExecution: (
      programId: string,
      latency: number,
      success: boolean,
    ) => void;
    recordOptimization: (programId: string, improvement: number) => void;
    recordError: (error: Error, context: Record<string, any>) => void;
  };

  // Storage Integration
  storage?: {
    saveProgram: (program: DSPyProgram) => Promise<void>;
    loadProgram: (id: string) => Promise<DSPyProgram | null>;
    saveExamples: (programId: string, examples: DSPyExample[]) => Promise<void>;
    loadExamples: (programId: string) => Promise<DSPyExample[]>;
  };
}

// ============================================================================
// NOTE: All types are exported above with their definitions
// No need for duplicate export declarations
// ============================================================================

// Default export for convenience
export default {
  DSPyWrapperError,
  // All other types are available as named exports
};
