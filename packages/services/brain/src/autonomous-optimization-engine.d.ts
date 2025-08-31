/**
 * @fileoverview Autonomous Optimization Engine
 *
 * Intelligent system that automatically chooses the best optimization approach
 * (DSPy vs Smart ML vs Hybrid) based on context, performance history, and
 * continuous learning. Makes autonomous decisions to maximize effectiveness.
 *
 * Features:
 * - Automatic method selection based on performance history
 * - Continuous learning from optimization results
 * - Dynamic switching between DSPy, ML, and hybrid approaches
 * - Performance-driven decision making
 * - Real-time adaptation to changing patterns
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
export interface OptimizationContext {
    readonly task: string;
    readonly basePrompt: string;
    readonly agentRole?: string;
    readonly priority?: 'low' | ' medium' | ' high';
    readonly context?: Record<string, any>;
    readonly expectedComplexity?: number;
    readonly timeConstraint?: number;
}
export interface OptimizationResult {
    readonly optimizedPrompt: string;
    readonly confidence: number;
    readonly method: 'dspy' | 'ml' | 'hybrid' | 'fallback';
    readonly processingTime: number;
    readonly improvementScore: number;
    readonly reasoning: string[];
}
export interface OptimizationFeedback {
    readonly actualSuccessRate: number;
    readonly actualResponseTime: number;
    readonly userSatisfaction: number;
    readonly taskCompleted: boolean;
    readonly errorOccurred: boolean;
}
/**
 * Autonomous Optimization Engine
 *
 * Intelligently decides which optimization method to use based on:
 * - Historical performance of each method
 * - Context of the current request
 * - Time constraints and priorities
 * - Continuous learning from results
 */
export declare class AutonomousOptimizationEngine {
    private smartOptimizer;
    private complexityEstimator;
    private initialized;
    constructor();
    /**
     * Learn from optimization results to improve future decisions
     */
    learnFromFeedback(context: OptimizationContext, result: OptimizationResult, feedback: OptimizationFeedback): Promise<void>;
    catch(error: any): void;
    /**
     * Enable continuous optimization learning
     */
    enableContinuousOptimization(config: {
        learningRate?: number;
        adaptationThreshold?: number;
        evaluationInterval?: number;
        autoTuning?: boolean;
    }): Promise<void>;
    const enhancedScores: any;
    const dspyScore: any;
    ')    const mlScore = this.calculateMethodScore(': any;
    ml: any;
    ', context) + enhancedScores.mlBoost;': any;
    const hybridScore: any;
    '): any;
    logger: any;
    debug(: any, dspyScore: any, toFixed: any): any;
}
//# sourceMappingURL=autonomous-optimization-engine.d.ts.map