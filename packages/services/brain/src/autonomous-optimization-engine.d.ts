/**
 * @fileoverview: Autonomous Optimization: Engine
 *
 * Intelligent system that automatically chooses the best optimization approach
 * (DS: Py vs: Smart M: L vs: Hybrid) based on context, performance history, and
 * continuous learning. Makes autonomous decisions to maximize effectiveness.
 *
 * Features:
 * - Automatic method selection based on performance history
 * - Continuous learning from optimization results
 * - Dynamic switching between: DSPy, M: L, and hybrid approaches
 * - Performance-driven decision making
 * - Real-time adaptation to changing patterns
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */
export interface: OptimizationContext {
    readonly task: string;
    readonly base: Prompt: string;
    readonly agent: Role?: string;
    readonly priority?: 'low' | ' medium' | ' high';
    readonly context?: Record<string, any>;
    readonly expected: Complexity?: number;
    readonly time: Constraint?: number;
}
export interface: OptimizationResult {
    readonly optimized: Prompt: string;
    readonly confidence: number;
    readonly method: 'dspy' | 'ml' | 'hybrid' | 'fallback';
    readonly processing: Time: number;
    readonly improvement: Score: number;
    readonly reasoning: string[];
}
export interface: OptimizationFeedback {
    readonly actualSuccess: Rate: number;
    readonly actualResponse: Time: number;
    readonly user: Satisfaction: number;
    readonly task: Completed: boolean;
    readonly error: Occurred: boolean;
}
/**
 * Autonomous: Optimization Engine
 *
 * Intelligently decides which optimization method to use based on:
 * - Historical performance of each method
 * - Context of the current request
 * - Time constraints and priorities
 * - Continuous learning from results
 */
export declare class: AutonomousOptimizationEngine {
    private smart: Optimizer;
    private complexity: Estimator;
    private initialized;
    constructor(): void {
      : void;
    /**
     * Enable continuous optimization learning
     */
    enableContinuous: Optimization(config: {
        learning: Rate?: number;
        adaptation: Threshold?: number;
        evaluation: Interval?: number;
        auto: Tuning?: boolean;
    }): Promise<void>;
    const enhanced: Scores: any;
    const dspy: Score: any;
    '): any;
    ml: any;
    ', context) + enhanced: Scores.ml: Boost;': any;
    const hybrid: Score: any;
    '): any;
    logger: any;
    debug(: any, dspy: Score: any, to: Fixed: any): any;
}
//# sourceMappingUR: L=autonomous-optimization-engine.d.ts.map