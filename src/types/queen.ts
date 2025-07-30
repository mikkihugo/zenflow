/**
 * Queen System Types
 * Multi-Queen hive architecture with distributed decision-making
 */

import type { Identifiable, JSONObject, TypedEventEmitter } from './core.js';

// =============================================================================
// QUEEN CORE TYPES
// =============================================================================

export type QueenType =
  | 'code-queen' // Code generation and optimization
  | 'debug-queen' // Debugging and error analysis
  | 'architect-queen' // System architecture and design
  | 'vision-queen' // Visual processing and design conversion
  | 'neural-queen' // Neural network operations (Rust-based)
  | 'hive-queen' // Hive coordination and management
  | 'memory-queen' // Memory and persistence management
  | 'security-queen' // Security analysis and enforcement
  | 'performance-queen' // Performance analysis and optimization
  | 'test-queen'; // Testing and quality assurance

export type QueenStatus =
  | 'initializing'
  | 'active'
  | 'busy'
  | 'idle'
  | 'overloaded'
  | 'offline'
  | 'error';

export type TaskType =
  | 'code-generation'
  | 'bug-detection'
  | 'refactoring'
  | 'test-generation'
  | 'documentation'
  | 'architecture-review'
  | 'performance-analysis'
  | 'security-audit'
  | 'vision-processing'
  | 'neural-training'
  | 'memory-optimization'
  | 'coordination';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ConsensusMethod = 'majority' | 'weighted' | 'expert' | 'unanimous';

// =============================================================================
// TASK DEFINITIONS
// =============================================================================

export interface Task extends Identifiable {type = ============================================================================
// CONSENSUS SYSTEM
// =============================================================================

export interface Consensus extends Identifiable {taskId = ============================================================================
// QUEEN DEFINITION
// =============================================================================

export interface QueenCapabilities {taskTypes = ============================================================================
// QUEEN EVENTS
// =============================================================================

export interface QueenEvents {
  'task-assigned': (task = > void;
  'task-started': (taskId = > void;
  'task-progress': (taskId = > void;
  'task-completed': (taskId = > void;
  'task-failed': (taskId = > void;
  'collaboration-request': (task = > void;
  'collaboration-response': (taskId = > void;
  'consensus-reached': (consensus = > void;
  'learning-update': (pattern = > void;
  'metrics-updated': (metrics = > void;
  'state-changed': (oldState = > void;
  'health-warning': (issue = > void;
  'shutdown': () => void;
  'error': (error = > void;
  [event = > void;
}

// =============================================================================
// QUEEN INTERFACE
// =============================================================================

export interface Queen extends TypedEventEmitter<QueenEvents>, Identifiable {
  // Basic properties
  readonlyname = ============================================================================
// SPECIALIZED QUEEN TYPES
// =============================================================================

export interface CodeQueen extends Queen {
  generateCode(spec = ============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    [component: string]: {
      status: 'healthy' | 'degraded' | 'critical';
      message?: string;
      metrics?: JSONObject;
    };
  };
  recommendations?: string[];
  lastCheck: Date;
}

export interface DetailedQueenMetrics extends QueenMetrics {
  timeSeriesData: {
    timestamp: Date;
    metrics: Partial<QueenMetrics>;
  }[];
  distributionData: {
    taskTypeDistribution: Record<TaskType, number>;
    processingTimeDistribution: number[];
    confidenceDistribution: number[];
    qualityDistribution: number[];
  };
  comparisonData: {
    peerComparison: Record<string, number>;
    historicalComparison: Record<string, number>;
    benchmarkComparison: Record<string, number>;
  };
}

export interface DiagnosticResult {
  overall: 'pass' | 'warn' | 'fail';
  tests: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
    details?: JSONObject;
  }[];
  recommendations: string[];
  estimatedFixTime?: number;
  autoFixAvailable?: boolean;
}

// Code generation types
export interface CodeGenerationSpec {
  language: string;
  framework?: string;
  description: string;
  requirements: string[];
  constraints: string[];
  examples?: string[];
  style?: JSONObject;
}

export interface CodeResult {
  code: string;
  explanation: string;
  tests?: string;
  documentation?: string;
  dependencies?: string[];
  confidence: number;
  quality: QualityAnalysis;
}

export interface RefactoringOptions {
  target: 'readability' | 'performance' | 'maintainability' | 'testability';
  preserveBehavior: boolean;
  modernize: boolean;
  addComments: boolean;
  addTypes: boolean;
}

export interface OptimizationTarget {
  type: 'speed' | 'memory' | 'size' | 'readability';
  constraints: string[];
  acceptableTradeoffs: string[];
}

export interface QualityAnalysis {
  score: number;
  metrics: {
    complexity: number;
    maintainability: number;
    readability: number;
    testability: number;
    performance: number;
    security: number;
  };
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    line?: number;
    suggestion?: string;
  }[];
  recommendations: string[];
}

// Bug analysis types
export interface BugAnalysis {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  root_cause: string;
  impact: string;
  affected_components: string[];
  reproduction_steps: string[];
  evidence: JSONObject[];
  confidence: number;
}

export interface FixSuggestion {
  approach: string;
  changes: {
    file: string;
    line?: number;
    oldCode?: string;
    newCode: string;
    explanation: string;
  }[];
  tests: string[];
  validation_steps: string[];
  risk_assessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
  confidence: number;
}

// Architecture types
export interface ArchitectureAnalysis {
  overview: string;
  patterns: string[];
  antipatterns: string[];
  dependencies: {
    internal: string[];
    external: string[];
    circular: string[];
  };
  metrics: {
    complexity: number;
    coupling: number;
    cohesion: number;
    maintainability: number;
  };
  recommendations: string[];
}

export interface ArchitectureRecommendation {
  priority: Priority;
  category: string;
  recommendation: string;
  rationale: string;
  implementation_steps: string[];
  estimated_effort: string;
  benefits: string[];
  risks: string[];
  alternatives: string[];
}

export interface ArchitecturalDecision {
  title: string;
  context: string;
  decision: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'deprecated';
  consequences: string[];
  alternatives: string[];
  assumptions: string[];
  constraints: string[];
}

export interface PatternValidation {
  valid: boolean;
  pattern: string;
  compliance: number;
  violations: string[];
  recommendations: string[];
  examples: string[];
}

// Vision processing types
export interface VisionContext {
  type: 'ui-mockup' | 'diagram' | 'screenshot' | 'design' | 'chart';
  target_platform: string;
  style_preferences: JSONObject;
  constraints: string[];
}

export interface VisionResult {
  interpretation: string;
  components: {
    type: string;
    properties: JSONObject;
    children?: VisionResult['components'];
  }[];
  layout: JSONObject;
  styling: JSONObject;
  confidence: number;
  suggestions: string[];
}

export interface DesignAnalysis {
  style: {
    colors: string[];
    fonts: string[];
    spacing: JSONObject;
    layout_type: string;
  };
  components: {
    type: string;
    count: number;
    variations: string[];
  }[];
  patterns: string[];
  accessibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  responsive: {
    breakpoints: number[];
    behavior: string[];
  };
}

export interface ComparisonResult {
  similarity: number;
  differences: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  recommendations: string[];
}

// Neural network types
export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
  validation_split: number;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  metadata: JSONObject;
}

export interface ModelResult {
  model_id: string;
  accuracy: number;
  loss: number;
  training_time: number;
  parameters: number;
  size: number;
  metrics: JSONObject;
  hyperparameters: JSONObject;
}

export interface InferenceResult {
  prediction: number[] | JSONObject;
  confidence: number;
  processing_time: number;
  model_version: string;
  metadata: JSONObject;
}

export interface OptimizationResult {
  best_params: JSONObject;
  best_score: number;
  optimization_history: {
    params: JSONObject;
    score: number;
    iteration: number;
  }[];
  time_taken: number;
}
