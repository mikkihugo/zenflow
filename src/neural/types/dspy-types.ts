/**
 * @fileoverview DSPy Type Definitions for Claude Code Zen
 * 
 * Comprehensive type definitions for DSPy integration with claude-code-zen's
 * swarm coordination system. These types enable advanced prompt optimization,
 * example generation, and neural learning capabilities.
 */

/**
 * Core DSPy Program Interface
 */
export interface DSPyProgram {
  id: string;
  name: string;
  signature: string;
  prompt: string;
  examples?: DSPyExample[];
  metrics: DSPyMetrics;
  created_at: string;
  updated_at: string;
}

/**
 * DSPy Training Example
 */
export interface DSPyExample {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  score?: number;
  metadata?: Record<string, unknown>;
}

/**
 * DSPy Performance Metrics
 */
export interface DSPyMetrics {
  accuracy: number;
  latency: number;
  cost: number;
  iterations: number;
  token_efficiency: number;
  last_updated: string;
}

/**
 * DSPy Optimization Result
 */
export interface DSPyOptimizationResult {
  program: DSPyProgram;
  originalMetrics: DSPyMetrics;
  optimizedMetrics: DSPyMetrics;
  improvement: number;
  timestamp: string;
}

/**
 * DSPy Configuration
 */
export interface DSPyConfig {
  maxRounds: number;
  fewShotExamples: number;
  optimizationStrategy: 'conservative' | 'aggressive' | 'adaptive';
  swarmCoordination: boolean;
  neuralEnhancement: boolean;
  crossSessionLearning: boolean;
}

/**
 * DSPy Pattern for Learning
 */
export interface DSPyPattern {
  id: string;
  type: 'prompt-template' | 'example-structure' | 'optimization-strategy';
  pattern: string;
  effectiveness: number;
  usageCount: number;
  lastUsed: string;
  contexts: string[];
}

/**
 * DSPy Agent Specialization Types
 */
export type DSPyAgentSpecialization = 
  | 'prompt-optimizer' 
  | 'example-generator' 
  | 'metric-analyzer' 
  | 'pipeline-tuner' 
  | 'neural-enhancer';

/**
 * DSPy Task Configuration
 */
export interface DSPyTaskConfig {
  programId: string;
  dataset: DSPyExample[];
  optimization: {
    rounds: number;
    strategy: DSPyConfig['optimizationStrategy'];
    parallelization: boolean;
    crossSessionLearning: boolean;
  };
  persistence: {
    saveIntermediateResults: boolean;
    learnFromFailures: boolean;
    shareKnowledge: boolean;
  };
}

/**
 * DSPy Engine Interface - Native claude-code-zen implementation
 */
export interface DSPyEngine {
  initialize(config: DSPyConfig): Promise<void>;
  optimizeProgram(program: DSPyProgram, dataset: DSPyExample[]): Promise<DSPyOptimizationResult>;
  generateExamples(signature: string, count: number): Promise<DSPyExample[]>;
  evaluateProgram(program: DSPyProgram, testSet: DSPyExample[]): Promise<DSPyMetrics>;
  shutdown(): Promise<void>;
}

/**
 * DSPy Factory Function Type
 */
export type DSPyEngineFactory = (config: DSPyConfig) => Promise<DSPyEngine>;

/**
 * DSPy Shared FACT System Interface
 */
export interface DSPySharedFACTSystem {
  learnFromFactAccess(factId: string, hierarchyLevel: string, success: boolean): Promise<void>;
  optimizeFactRetrieval(query: string, hierarchyLevel: string): Promise<unknown[]>;
  getConfidenceScore(factId: string, context: string): Promise<number>;
  adaptToUsagePatterns(): Promise<void>;
}