/**
 * @fileoverview Intelligence Orchestrator - Event-Driven AI Coordination
 *
 * Modern event-driven intelligence coordination system using foundation EventBus.
 * Orchestrates AI operations, prompt optimization, and performance monitoring
 * through comprehensive event broadcasting and subscription patterns.
 *
 * ARCHITECTURAL PATTERN:Foundation EventBus with typed event coordination.
 */
/**
 * Brain configuration interface
 */
export interface BrainConfig {
  sessionId?: string;
  enableLearning?: boolean;
  cacheOptimizations?: boolean;
  logLevel?: string;
  autonomous?: {
    enabled?: boolean;
    learningRate?: number;
    adaptationThreshold?: number;
  };
  neural?: {
    rustAcceleration?: boolean;
    gpuAcceleration?: boolean;
    parallelProcessing?: number;
  };
}
/**
 * Prompt optimization interfaces
 */
export interface PromptOptimizationRequest {
  task: string;
  basePrompt: string;
  context?: Record<string, unknown>;
}
export interface PromptOptimizationResult {
  strategy: string;
  prompt: string;
  confidence: number;
}
/**
 * Brain metrics interface
 */
export interface BrainMetrics {
  initialized: boolean;
  performanceTracker: boolean;
  agentMonitor: boolean;
  sessionId?: string;
}
/**
 * Brain status interface
 */
export interface BrainStatus {
  initialized: boolean;
  sessionId?: string;
  enableLearning?: boolean;
  performanceTracker: boolean;
  agentMonitor: boolean;
}
/**
 * Optimization strategy interface
 */
export interface OptimizationStrategy {
  strategy: string;
  confidence: number;
  parameters?: Record<string, unknown>;
}
/**
 * Intelligence event types for foundation EventBus with enhanced ML coordination
 */
export interface IntelligenceEvents {
  'intelligence:initialized': {
    sessionId?: string;
    config: BrainConfig;
    timestamp: number;
  };
  'intelligence:shutdown': {
    sessionId?: string;
    timestamp: number;
  };
  'intelligence:prompt_optimized': {
    request: PromptOptimizationRequest;
    result: PromptOptimizationResult;
    duration: number;
    timestamp: number;
  };
  'intelligence:performance_tracked': {
    metrics: BrainMetrics;
    timestamp: number;
  };
  'intelligence:error': {
    error: string;
    context: Record<string, unknown>;
    timestamp: number;
  };
  'brain:analyze_request': {
    requestId: string;
    task: string;
    complexity: number;
    context: Record<string, unknown>;
    timestamp: number;
  };
  'brain:strategy_decided': {
    requestId: string;
    strategy:
      | 'dspy_optimization'
      | ' direct_training'
      | ' hybrid_workflow'
      | ' inference_only';
    reasoning: string;
    confidence: number;
    timestamp: number;
  };
  'brain:mode_activated': {
    mode: 'dspy' | ' training' | ' inference' | ' validation' | ' coordination';
    previousMode?: string;
    requestId: string;
    timestamp: number;
  };
  'brain:workflow_planned': {
    requestId: string;
    workflowSteps: string[];
    estimatedDuration: number;
    resourceRequirements: Record<string, unknown>;
    timestamp: number;
  };
  'brain:dspy_initiated': {
    requestId: string;
    optimizationType: string;
    promptComplexity: number;
    expectedIterations: number;
    timestamp: number;
  };
  'brain:training_initiated': {
    requestId: string;
    modelType: string;
    datasetSize: number;
    epochs: number;
    sparc_phase: string;
    timestamp: number;
  };
  'brain:validation_initiated': {
    requestId: string;
    validationType: string;
    modelId: string;
    testDataSize: number;
    timestamp: number;
  };
  'brain:hybrid_workflow_started': {
    requestId: string;
    workflowType: string;
    phases: string[];
    coordination: Record<string, unknown>;
    timestamp: number;
  };
  'brain:progress_update': {
    requestId: string;
    phase: string;
    progress: number;
    currentStep: string;
    nextStep?: string;
    timestamp: number;
  };
  'brain:decision_refined': {
    requestId: string;
    originalStrategy: string;
    refinedStrategy: string;
    refinementReason: string;
    timestamp: number;
  };
  'brain:insights_discovered': {
    requestId: string;
    insights: string[];
    patterns: Record<string, unknown>;
    learningValue: number;
    timestamp: number;
  };
  'brain:workflow_completed': {
    requestId: string;
    finalStrategy: string;
    duration: number;
    success: boolean;
    results: Record<string, unknown>;
    timestamp: number;
  };
  'brain:bottleneck_detected': {
    requestId?: string;
    bottleneckType: string;
    severity: 'low' | ' medium' | ' high' | ' critical';
    recommendations: string[];
    timestamp: number;
  };
  'brain:performance_analyzed': {
    analysisId: string;
    systemPerformance: Record<string, number>;
    mlPerformance: Record<string, number>;
    optimizationOpportunities: string[];
    timestamp: number;
  };
  'brain:ml_request_analyzed': {
    requestId: string;
    mlType: 'training' | ' inference' | ' optimization' | ' validation';
    complexity: number;
    resourceEstimate: Record<string, number>;
    timestamp: number;
  };
  'brain:ml_coordination_active': {
    requestId: string;
    coordinationType: string;
    activeSystems: string[];
    eventFlow: string[];
    timestamp: number;
  };
}
/**
 * Intelligence Orchestrator - Event-driven AI coordination system
 *
 * Extends foundation EventBus to provide comprehensive AI coordination
 * with event broadcasting for all intelligence operations.
 */
export declare class IntelligenceOrchestrator extends EventBus<IntelligenceEvents> {
  private config;
  private initialized;
  private performanceTracker;
  private agentMonitor;
  constructor(config?: BrainConfig);
}
//# sourceMappingURL=brain-coordinator.d.ts.map
