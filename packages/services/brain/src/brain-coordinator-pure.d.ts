/**
 * @fileoverview 100% Event-Based Brain Coordinator - ZERO IMPORTS
 *
 * Pure event-driven brain coordination system with ZERO imports - not even foundation.
 * All functionality accessed through events only - no database, no logger, no external dependencies.
 *
 * ARCHITECTURAL PATTERN:100% Event-Based with ZERO imports (not even foundation)
 */
/**
 * Brain configuration interface
 */
export interface BrainConfig {
    sessionId?: string;
    enableLearning?: boolean;
    cacheOptimizations?: boolean;
    autonomous?: {
        enabled?: boolean;
        learningRate?: number;
        adaptationThreshold?: number;
    };
    neural?: {
        enabled?: boolean;
        dspyOptimization?: boolean;
        modalBehavior?: boolean;
    };
}
/**
 * Intelligence event types for pure event-based brain coordination
 */
export interface IntelligenceEvents {
    'brain:initialized': {
        sessionId?: string;
        config: BrainConfig;
        timestamp: number;
    };
    'brain:analyze_request': {
        requestId: string;
        task: string;
        complexity: number;
        priority: 'low' | ' medium' | ' high' | ' critical';
        timestamp: number;
    };
    'brain:strategy_decided': {
        requestId: string;
        strategy: 'dspy_optimization' | ' direct_training' | ' hybrid_workflow' | ' simple_coordination';
        reasoning: string;
        confidence: number;
        timestamp: number;
    };
    'brain:mode_activated': {
        requestId: string;
        mode: 'dspy' | ' training' | ' inference' | ' validation' | ' coordination';
        parameters: Record<string, unknown>;
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
        expectedImprovement: number;
        timestamp: number;
    };
    'brain:training_initiated': {
        requestId: string;
        modelType: string;
        epochs: number;
        sparc_phase: string;
        timestamp: number;
    };
    'brain:insights_discovered': {
        requestId: string;
        insights: string[];
        patterns: Record<string, unknown>;
        actionableItems: string[];
        timestamp: number;
    };
    'brain:coordination_started': {
        requestId: string;
        coordinationType: 'multi_agent' | ' workflow' | ' resource' | ' task';
        participants: string[];
        timestamp: number;
    };
    'brain:decision_made': {
        requestId: string;
        decision: string;
        reasoning: string[];
        confidence: number;
        alternatives: string[];
        timestamp: number;
    };
    'brain:resource_allocated': {
        requestId: string;
        resources: Record<string, unknown>;
        allocation_strategy: string;
        timestamp: number;
    };
    'brain:performance_analyzed': {
        requestId: string;
        metrics: Record<string, number>;
        trends: string[];
        recommendations: string[];
        timestamp: number;
    };
    'brain:optimization_completed': {
        requestId: string;
        optimizationType: string;
        improvementMetrics: Record<string, number>;
        timestamp: number;
    };
    'brain:status_update': {
        status: 'active' | ' learning' | ' optimizing' | ' idle' | ' error';
        details: Record<string, unknown>;
        timestamp: number;
    };
    'brain:error': {
        error: string;
        context: Record<string, unknown>;
        timestamp: number;
    };
    'brain:request_performance_tracker': {
        config: Record<string, unknown>;
        sessionId?: string;
        timestamp: number;
    };
    'brain:request_agent_monitor': {
        config: Record<string, unknown>;
        sessionId?: string;
        timestamp: number;
    };
    'brain:log': {
        level: 'debug' | ' info' | ' warn' | ' error';
        message: string;
        data?: Record<string, unknown>;
        timestamp: number;
    };
}
/**
 * Brain Coordinator
 *
 * Pure event-driven brain with zero package imports.
 * All functionality through events - no database, no logger, no external dependencies.
 */
export declare class BrainCoordinator {
    private config;
    private initialized;
    private eventListeners;
    constructor(config?: BrainConfig);
    /**
     * 100% Event-Based Event Emission
     */
    private emitEvent;
    /**
     * 100% Event-Based Event Listening
     */
    on<K extends keyof IntelligenceEvents>(event: K, listener: (data: IntelligenceEvents[K]) => void): void;
    /**
     * Initialize the 100% Event-Based Brain
     */
    initialize(): Promise<void>;
    /**
     * 100% Event-Based Analysis and Decision Making
     */
    analyzeAndDecide(request: {
        requestId: string;
        task: string;
        context?: Record<string, unknown>;
        priority?: 'low' | ' medium' | ' high' | ' critical';
    }): Promise<void>;
    /**
     * 100% Event-Based Shutdown
     */
    shutdown(): Promise<void>;
    private calculateComplexity;
    private determineStrategy;
    private getStrategyReasoning;
    private calculateConfidence;
    private getModeForStrategy;
    private getModeParameters;
    private planWorkflow;
    private estimateDuration;
    private calculateResourceRequirements;
}
/**
 * Factory function for creating Brain Coordinator
 */
export declare function createBrainCoordinator(config?: BrainConfig): BrainCoordinator;
//# sourceMappingURL=brain-coordinator-pure.d.ts.map