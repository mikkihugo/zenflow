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
import type { DSPyLLMBridge } from './coordination/dspy-llm-bridge';
export interface OptimizationContext {
  readonly task: string;
  readonly basePrompt: string;
  readonly agentRole?: string;
  readonly priority?: 'low|medium|high';
  readonly context?: Record<string, any>;
  readonly expectedComplexity?: number;
  readonly timeConstraint?: number;
}
export interface OptimizationResult {
  readonly optimizedPrompt: string;
  readonly confidence: number;
  readonly method: 'dspy|ml|hybrid|fallback';
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
  private dspyBridge;
  private smartOptimizer;
  private complexityEstimator;
  private initialized;
  private methodPerformance;
  private optimizationHistory;
  private readonly learningRate;
  private readonly adaptationThreshold;
  private readonly minDataPoints;
  constructor();
  /**
   * Initialize the autonomous engine
   */
  initialize(dspyBridge?: DSPyLLMBridge): Promise<void>;
  /**
   * Autonomously optimize prompt using the best method for the context
   */
  autonomousOptimize(context: OptimizationContext): Promise<OptimizationResult>;
  /**
   * Learn from optimization results to improve future decisions
   */
  learnFromFeedback(
    context: OptimizationContext,
    result: OptimizationResult,
    feedback: OptimizationFeedback
  ): Promise<void>;
  /**
   * Record optimization result for continuous learning
   */
  recordOptimizationResult(result: {
    context: OptimizationContext;
    actualPerformance: number;
    actualSuccessRate: number;
    actualDuration: number;
    feedback?: string;
  }): Promise<void>;
  /**
   * Enable continuous optimization learning
   */
  enableContinuousOptimization(config: {
    learningRate?: number;
    adaptationThreshold?: number;
    evaluationInterval?: number;
    autoTuning?: boolean;
  }): Promise<void>;
  /**
   * Get autonomous optimization insights
   */
  getAutonomousInsights(): {
    bestMethod: string;
    methodRankings: Array<{
      method: string;
      score: number;
      trend: string;
    }>;
    adaptationRate: number;
    totalOptimizations: number;
    learningEffectiveness: number;
  };
  private selectOptimalMethod;
  private calculateMethodScore;
  private executeOptimization;
  private executeDSPyOptimization;
  private executeMLOptimization;
  private executeHybridOptimization;
  private initializeMethodPerformance;
  private recordOptimization;
  private updateMethodPerformance;
  private updateMethodPerformanceFromFeedback;
  private adaptSelectionStrategy;
  /**
   * Infer actual task complexity from optimization results
   */
  private inferActualComplexity;
  /**
   * Analyze context to determine inherent complexity
   */
  private analyzeContextComplexity;
}
export default AutonomousOptimizationEngine;
//# sourceMappingURL=autonomous-optimization-engine.d.ts.map
