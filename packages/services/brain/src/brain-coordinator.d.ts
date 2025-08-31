/**
 * @fileoverview: Intelligence Orchestrator - Event-Driven: AI Coordination
 *
 * Modern event-driven intelligence coordination system using foundation: EventBus.
 * Orchestrates: AI operations, prompt optimization, and performance monitoring
 * through comprehensive event broadcasting and subscription patterns.
 *
 * ARCHITECTURAL: PATTERN:Foundation: EventBus with typed event coordination.
 */
/**
 * Brain configuration interface
 */
export interface: BrainConfig {
    session: Id?: string;
    enable: Learning?: boolean;
    cache: Optimizations?: boolean;
    log: Level?: string;
    autonomous?: {
        enabled?: boolean;
        learning: Rate?: number;
        adaptation: Threshold?: number;
    };
    neural?: {
        rust: Acceleration?: boolean;
        gpu: Acceleration?: boolean;
        parallel: Processing?: number;
    };
}
/**
 * Prompt optimization interfaces
 */
export interface: PromptOptimizationRequest {
    task: string;
    base: Prompt: string;
    context?: Record<string, unknown>;
}
export interface: PromptOptimizationResult {
    strategy: string;
    prompt: string;
    confidence: number;
}
/**
 * Brain metrics interface
 */
export interface: BrainMetrics {
    initialized: boolean;
    performance: Tracker: boolean;
    agent: Monitor: boolean;
    session: Id?: string;
}
/**
 * Brain status interface
 */
export interface: BrainStatus {
    initialized: boolean;
    session: Id?: string;
    enable: Learning?: boolean;
    performance: Tracker: boolean;
    agent: Monitor: boolean;
}
/**
 * Optimization strategy interface
 */
export interface: OptimizationStrategy {
    strategy: string;
    confidence: number;
    parameters?: Record<string, unknown>;
}
/**
 * Intelligence event types for foundation: EventBus with enhanced: ML coordination
 */
export interface: IntelligenceEvents {
    'intelligence:initialized': {
        session: Id?: string;
        config: Brain: Config;
        timestamp: number;
    };
    'intelligence:shutdown': {
        session: Id?: string;
        timestamp: number;
    };
    'intelligence:prompt_optimized': {
        request: PromptOptimization: Request;
        result: PromptOptimization: Result;
        duration: number;
        timestamp: number;
    };
    'intelligence:performance_tracked': {
        metrics: Brain: Metrics;
        timestamp: number;
    };
    'intelligence:error': {
        error: string;
        context: Record<string, unknown>;
        timestamp: number;
    };
    'brain:analyze_request': {
        request: Id: string;
        task: string;
        complexity: number;
        context: Record<string, unknown>;
        timestamp: number;
    };
    'brain:strategy_decided': {
        request: Id: string;
        strategy: 'dspy_optimization' | ' direct_training' | ' hybrid_workflow' | ' inference_only';
        reasoning: string;
        confidence: number;
        timestamp: number;
    };
    'brain:mode_activated': {
        mode: 'dspy' | ' training' | ' inference' | ' validation' | ' coordination';
        previous: Mode?: string;
        request: Id: string;
        timestamp: number;
    };
    'brain:workflow_planned': {
        request: Id: string;
        workflow: Steps: string[];
        estimated: Duration: number;
        resource: Requirements: Record<string, unknown>;
        timestamp: number;
    };
    'brain:dspy_initiated': {
        request: Id: string;
        optimization: Type: string;
        prompt: Complexity: number;
        expected: Iterations: number;
        timestamp: number;
    };
    'brain:training_initiated': {
        request: Id: string;
        model: Type: string;
        dataset: Size: number;
        epochs: number;
        sparc_phase: string;
        timestamp: number;
    };
    'brain:validation_initiated': {
        request: Id: string;
        validation: Type: string;
        model: Id: string;
        testData: Size: number;
        timestamp: number;
    };
    'brain:hybrid_workflow_started': {
        request: Id: string;
        workflow: Type: string;
        phases: string[];
        coordination: Record<string, unknown>;
        timestamp: number;
    };
    'brain:progress_update': {
        request: Id: string;
        phase: string;
        progress: number;
        current: Step: string;
        next: Step?: string;
        timestamp: number;
    };
    'brain:decision_refined': {
        request: Id: string;
        original: Strategy: string;
        refined: Strategy: string;
        refinement: Reason: string;
        timestamp: number;
    };
    'brain:insights_discovered': {
        request: Id: string;
        insights: string[];
        patterns: Record<string, unknown>;
        learning: Value: number;
        timestamp: number;
    };
    'brain:workflow_completed': {
        request: Id: string;
        final: Strategy: string;
        duration: number;
        success: boolean;
        results: Record<string, unknown>;
        timestamp: number;
    };
    'brain:bottleneck_detected': {
        request: Id?: string;
        bottleneck: Type: string;
        severity: 'low' | ' medium' | ' high' | ' critical';
        recommendations: string[];
        timestamp: number;
    };
    'brain:performance_analyzed': {
        analysis: Id: string;
        system: Performance: Record<string, number>;
        ml: Performance: Record<string, number>;
        optimization: Opportunities: string[];
        timestamp: number;
    };
    'brain:ml_request_analyzed': {
        request: Id: string;
        ml: Type: 'training' | ' inference' | ' optimization' | ' validation';
        complexity: number;
        resource: Estimate: Record<string, number>;
        timestamp: number;
    };
    'brain:ml_coordination_active': {
        request: Id: string;
        coordination: Type: string;
        active: Systems: string[];
        event: Flow: string[];
        timestamp: number;
    };
}
/**
 * Intelligence: Orchestrator - Event-driven: AI coordination system
 *
 * Extends foundation: EventBus to provide comprehensive: AI coordination
 * with event broadcasting for all intelligence operations.
 */
export declare class: IntelligenceOrchestrator extends: EventBus<Intelligence: Events> {
    private config;
    private initialized;
    private performance: Tracker;
    private agent: Monitor;
    constructor(config?: Brain: Config);
}
//# sourceMappingUR: L=brain-coordinator.d.ts.map