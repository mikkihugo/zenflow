/**
 * Agentic Zen Hook System - Type Definitions
 * 
 * Comprehensive type definitions for the Claude-Zen hook system.
 * Provides type safety for LLM, memory, neural, performance, and workflow hooks.
 */

// Core hook types
export type AgenticHookType = 
  | 'llm'
  | 'memory'
  | 'neural'
  | 'performance-metric'
  | 'workflow-start'
  | 'workflow-step'
  | 'workflow-complete'
  | 'workflow-error';

// Base hook context
export interface AgenticHookContext {
  timestamp: number;
  type: AgenticHookType;
  payload: HookPayload;
  metadata: Record<string, any>;
  session: {
    id: string;
    startTime: number;
  };
}

// Hook payloads for different types
export type HookPayload = 
  | LLMHookPayload
  | MemoryHookPayload
  | NeuralHookPayload
  | PerformanceHookPayload
  | WorkflowHookPayload;

// LLM Hook Types
export interface LLMHookPayload {
  provider: string;
  model: string;
  prompt: string;
  parameters?: Record<string, any>;
  response?: string;
  tokens?: {
    input: number;
    output: number;
  };
  duration?: number;
}

// Memory Hook Types
export interface MemoryHookPayload {
  operation: 'read' | 'write' | 'delete' | 'search';
  key?: string;
  value?: any;
  query?: string;
  results?: any[];
  performance?: {
    duration: number;
    memoryUsage: number;
  };
}

// Neural Hook Types
export interface NeuralHookPayload {
  operation: 'train' | 'predict' | 'optimize';
  model?: string;
  data?: any;
  results?: any;
  metrics?: {
    accuracy?: number;
    loss?: number;
    performance?: number;
  };
}

// Performance Hook Types
export interface PerformanceHookPayload {
  metric: string;
  value: number;
  unit: string;
  context: Record<string, any>;
  timestamp: number;
}

// Workflow Hook Types
export interface WorkflowHookPayload {
  workflow: string;
  step?: string;
  action: string;
  data?: any;
  result?: any;
  error?: string;
}

// Hook registration interface
export interface HookRegistration {
  id: string;
  type: AgenticHookType;
  priority: number;
  enabled: boolean;
  filter?: HookFilter;
  handler: HookHandler;
  metadata?: Record<string, any>;
}

// Hook filter for conditional execution
export interface HookFilter {
  conditions?: Record<string, any>;
  patterns?: string[];
  excludePatterns?: string[];
}

// Hook handler function
export type HookHandler = (context: AgenticHookContext) => Promise<HookHandlerResult>;

// Hook handler result
export interface HookHandlerResult {
  success: boolean;
  modified: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// Hook metrics
export interface HookMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime?: number;
  errorRate: number;
}

// Hook pipeline definition
export interface HookPipeline {
  id: string;
  name: string;
  description: string;
  hooks: string[]; // Hook IDs in execution order
  parallel?: boolean;
  enabled: boolean;
}

// Provider integration configuration
export interface ProviderConfig {
  name: string;
  type: 'llm' | 'memory' | 'neural';
  configuration: Record<string, any>;
  enabled: boolean;
}

// Self-improvement configuration
export interface SelfImprovementConfig {
  enabled: boolean;
  learningRate: number;
  patternStore: PatternStore;
  trainingState: TrainingState;
}

// Pattern store for learning
export interface PatternStore {
  patterns: Pattern[];
  maxPatterns: number;
  persistenceEnabled: boolean;
}

// Individual pattern
export interface Pattern {
  id: string;
  type: string;
  context: Record<string, any>;
  outcome: 'success' | 'failure';
  confidence: number;
  timestamp: number;
}

// Training state
export interface TrainingState {
  epoch: number;
  accuracy: number;
  loss: number;
  lastTrainingTime: number;
  trainingData: any[];
}