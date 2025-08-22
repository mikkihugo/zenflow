/**
 * @fileoverview Task Complexity Estimation System
 *
 * Uses machine learning to automatically estimate task complexity based on
 * prompt content, context, and historical patterns. Helps the autonomous
 * optimization engine make better decisions about which method to use.
 *
 * Features:
 * - Natural language analysis of prompts
 * - Context complexity scoring
 * - Historical pattern matching
 * - ML-based complexity prediction
 * - Continuous learning from feedback
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
export interface TaskComplexityData {
  readonly task: string;
  readonly prompt: string;
  readonly context: Record<string, any>;
  readonly agentRole?: string;
  readonly actualComplexity?: number;
  readonly actualDuration?: number;
  readonly actualSuccess?: boolean;
  readonly timestamp: number;
}
export interface ComplexityEstimate {
  readonly estimatedComplexity: number;
  readonly confidence: number;
  readonly reasoning: string[];
  readonly suggestedMethod: 'dspy | ml' | 'hybrid';
  readonly estimatedDuration: number;
  readonly difficultyLevel: 'trivial | easy' | 'medium' | 'hard' | 'expert';
  readonly keyFactors: string[];
}
export interface ComplexityPattern {
  readonly keywords: string[];
  readonly contextKeys: string[];
  readonly complexity: number;
  readonly weight: number;
  readonly examples: string[];
}
/**
 * Task Complexity Estimation System
 *
 * Automatically estimates how complex a task is based on prompt analysis,
 * context evaluation, and machine learning patterns. This helps the
 * autonomous optimization engine choose the most appropriate method.
 */
export declare class TaskComplexityEstimator {
  private complexityHistory;
  private complexityPatterns;
  private initialized;
  private readonly maxHistorySize;
  private complexityRegressor?;
  private patternClusters?;
  private keywordWeights;
  constructor();
  /**
   * Initialize the complexity estimation system
   */
  initialize(): Promise<void>;
  /**
   * Estimate the complexity of a task
   */
  estimateComplexity(
    task: string,
    prompt: string,
    context?: Record<string, any>,
    agentRole?: string
  ): Promise<ComplexityEstimate>;
  /**
   * Learn from actual task outcomes to improve estimates
   */
  learnFromOutcome(
    task: string,
    prompt: string,
    context: Record<string, any>,
    actualComplexity: number,
    actualDuration: number,
    actualSuccess: boolean,
    agentRole?: string
  ): Promise<void>;
  /**
   * Get complexity estimation statistics
   */
  getComplexityStats(): {
    totalEstimations: number;
    averageComplexity: number;
    accuracyRate: number;
    patternCount: number;
    topComplexityFactors: string[];
  };
  private analyzePromptComplexity;
  private analyzeContextComplexity;
  private matchComplexityPatterns;
  private analyzeRoleComplexity;
  private suggestOptimizationMethod;
  private estimateDurationFromComplexity;
  private mapComplexityToDifficulty;
  private extractKeyFactors;
  private initializeComplexityPatterns;
  private initializeKeywordWeights;
  private updateComplexityModels;
  private updateKeywordWeights;
  private extractNumericalFeatures;
  private getSimpleComplexityEstimate;
}
export default TaskComplexityEstimator;
//# sourceMappingURL=task-complexity-estimator.d.ts.map
