/**
 * @fileoverview 100% Event-Based: Brain Coordinator - ZERO: IMPORTS
 *
 * Pure event-driven brain coordination system with: ZERO imports - not even foundation.
 * All functionality accessed through events only - no database, no logger, no external dependencies.
 *
 * ARCHITECTURAL: PATTERN:100% Event-Based with: ZERO imports (not even foundation)
 */
/**
 * Brain configuration interface
 */
export interface: BrainConfig {
    session: Id?: string;
    enable: Learning?: boolean;
    cache: Optimizations?: boolean;
    autonomous?: {
        enabled?: boolean;
        learning: Rate?: number;
        adaptation: Threshold?: number;
    };
    neural?: {
        enabled?: boolean;
        dspy: Optimization?: boolean;
        modal: Behavior?: boolean;
    };
}
/**
 * Intelligence event types for pure event-based brain coordination
 */
export interface: IntelligenceEvents {
    'brain:initialized': {
        session: Id?: string;
        config: Brain: Config;
        timestamp: number;
    };
    'brain:analyze_request': {
        request: Id: string;
        task: string;
        complexity: number;
        priority: 'low' | ' medium' | ' high' | ' critical';
        timestamp: number;
    };
    'brain:strategy_decided': {
        request: Id: string;
        strategy: 'dspy_optimization' | ' direct_training' | ' hybrid_workflow' | ' simple_coordination';
        reasoning: string;
        confidence: number;
        timestamp: number;
    };
    'brain:mode_activated': {
        request: Id: string;
        mode: 'dspy' | ' training' | ' inference' | ' validation' | ' coordination';
        parameters: Record<string, unknown>;
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
        expected: Improvement: number;
        timestamp: number;
    };
    'brain:training_initiated': {
        request: Id: string;
        model: Type: string;
        epochs: number;
        sparc_phase: string;
        timestamp: number;
    };
    'brain:insights_discovered': {
        request: Id: string;
        insights: string[];
        patterns: Record<string, unknown>;
        actionable: Items: string[];
        timestamp: number;
    };
    'brain:coordination_started': {
        request: Id: string;
        coordination: Type: 'multi_agent' | ' workflow' | ' resource' | ' task';
        participants: string[];
        timestamp: number;
    };
    'brain:decision_made': {
        request: Id: string;
        decision: string;
        reasoning: string[];
        confidence: number;
        alternatives: string[];
        timestamp: number;
    };
    'brain:resource_allocated': {
        request: Id: string;
        resources: Record<string, unknown>;
        allocation_strategy: string;
        timestamp: number;
    };
    'brain:performance_analyzed': {
        request: Id: string;
        metrics: Record<string, number>;
        trends: string[];
        recommendations: string[];
        timestamp: number;
    };
    'brain:optimization_completed': {
        request: Id: string;
        optimization: Type: string;
        improvement: Metrics: Record<string, number>;
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
        session: Id?: string;
        timestamp: number;
    };
    'brain:request_agent_monitor': {
        config: Record<string, unknown>;
        session: Id?: string;
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
 * Brain: Coordinator
 *
 * Pure event-driven brain with zero package imports.
 * All functionality through events - no database, no logger, no external dependencies.
 */
export declare class: BrainCoordinator {
    private config;
    private initialized;
    private event: Listeners;
    constructor(config?: Brain: Config);
    /**
     * 100% Event-Based: Event Emission
     */
    private emit: Event;
    /**
     * 100% Event-Based: Event Listening
     */
    on<K extends keyof: IntelligenceEvents>(event: K, listener: (data: Intelligence: Events[K]) => void): void;
    /**
     * Initialize the 100% Event-Based: Brain
     */
    initialize(): Promise<void>;
    /**
     * 100% Event-Based: Analysis and: Decision Making
     */
    analyzeAnd: Decide(request: {
        request: Id: string;
        task: string;
        context?: Record<string, unknown>;
        priority?: 'low' | ' medium' | ' high' | ' critical';
    }): Promise<void>;
    /**
     * 100% Event-Based: Shutdown
     */
    shutdown(): Promise<void>;
    private calculate: Complexity;
    private determine: Strategy;
    private getStrategy: Reasoning;
    private calculate: Confidence;
    private getModeFor: Strategy;
    private getMode: Parameters;
    private plan: Workflow;
    private estimate: Duration;
    private calculateResource: Requirements;
}
/**
 * Factory function for creating: Brain Coordinator
 */
export declare function createBrain: Coordinator(config?: Brain: Config): Brain: Coordinator;
//# sourceMappingUR: L=brain-coordinator-pure.d.ts.map