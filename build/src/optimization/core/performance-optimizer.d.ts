/**
 * Core Performance Optimizer.
 * Orchestrates optimization across all system domains.
 */
/**
 * @file Performance-optimizer implementation.
 */
import { EventEmitter } from 'node:events';
import type { DataOptimizer, NeuralOptimizer, OptimizationResult, PerformanceMetrics, SwarmOptimizer, WasmOptimizer } from '../interfaces/optimization-interfaces.ts';
export interface PerformanceOptimizerConfig {
    enabled: boolean;
    optimizationInterval: number;
    aggressiveness: 'conservative' | 'moderate' | 'aggressive';
    targetMetrics: {
        latency: number;
        throughput: number;
        memoryUsage: number;
        cpuUsage: number;
    };
    domains: {
        neural: boolean;
        swarm: boolean;
        data: boolean;
        wasm: boolean;
    };
}
export interface OptimizationPlan {
    id: string;
    domain: 'neural' | 'swarm' | 'data' | 'wasm' | 'system';
    actions: OptimizationAction[];
    estimatedImpact: number;
    executionOrder: number;
    dependencies: string[];
}
export interface OptimizationAction {
    id: string;
    type: string;
    target: string;
    parameters: Record<string, any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration: number;
}
export interface SystemPerformanceState {
    overall: PerformanceMetrics;
    neural: PerformanceMetrics;
    swarm: PerformanceMetrics;
    data: PerformanceMetrics;
    wasm: PerformanceMetrics;
    lastOptimization: Date;
    optimizationCount: number;
}
export declare class PerformanceOptimizer extends EventEmitter {
    private config;
    private optimizers;
    private performanceHistory;
    private activeOptimizations;
    private isOptimizing;
    constructor(config?: Partial<PerformanceOptimizerConfig>, optimizers?: {
        neural?: NeuralOptimizer;
        swarm?: SwarmOptimizer;
        data?: DataOptimizer;
        wasm?: WasmOptimizer;
    });
    /**
     * Start continuous performance optimization.
     */
    startOptimization(): Promise<void>;
    /**
     * Stop continuous optimization.
     */
    stopOptimization(): void;
    /**
     * Perform immediate comprehensive optimization.
     */
    optimizeNow(): Promise<OptimizationResult[]>;
    /**
     * Get current system performance state.
     */
    getPerformanceState(): Promise<SystemPerformanceState>;
    /**
     * Register a domain optimizer.
     *
     * @param domain
     * @param optimizer
     */
    registerOptimizer(domain: string, optimizer: any): void;
    /**
     * Generate optimization plan based on current performance.
     *
     * @param currentMetrics
     */
    private generateOptimizationPlan;
    /**
     * Execute a specific optimization plan.
     *
     * @param plan
     */
    private executeOptimizationPlan;
    /**
     * Execute a specific optimization action.
     *
     * @param optimizer
     * @param action
     */
    private executeOptimizationAction;
    /**
     * Schedule next optimization cycle.
     */
    private scheduleOptimization;
    /**
     * Perform optimization cycle.
     */
    private optimizationCycle;
    /**
     * Check if optimization is needed.
     *
     * @param metrics
     */
    private needsOptimization;
    /**
     * Identify performance bottlenecks.
     *
     * @param metrics
     */
    private identifyBottlenecks;
    /**
     * Create optimization plan for bottleneck.
     *
     * @param bottleneck
     */
    private createOptimizationPlan;
    /**
     * Sort optimization plans by priority and dependencies.
     *
     * @param plans
     */
    private sortOptimizationPlans;
    /**
     * Calculate performance improvement.
     *
     * @param before
     * @param after
     */
    private calculateImprovement;
    /**
     * Get current performance metrics.
     */
    private getCurrentPerformanceMetrics;
    /**
     * Get domain-specific metrics.
     *
     * @param _domain
     */
    private getDomainMetrics;
    /**
     * Assess current performance across all domains.
     */
    private assessCurrentPerformance;
}
//# sourceMappingURL=performance-optimizer.d.ts.map