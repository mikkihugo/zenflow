/**
 * @fileoverview Brain Coordinator - Clean Operations Facade Implementation
 *
 * Simplified brain coordinator that uses operations facade for monitoring
 * and avoids complex initialization patterns that cause compilation errors.
 *
 * ARCHITECTURAL PATTERN: Uses strategic facade delegation for monitoring.
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
 * Clean Brain Coordinator implementation using operations facade
 */
export declare class BrainCoordinator {
    private config;
    private initialized;
    private logger;
    private performanceTracker;
    private agentMonitor;
    constructor(config?: BrainConfig);
    /**
     * Initialize the Brain Coordinator
     */
    initialize(): Promise<void>;
}
//# sourceMappingURL=brain-coordinator.d.ts.map