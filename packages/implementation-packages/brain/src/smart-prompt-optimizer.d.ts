/**
 * @fileoverview Smart Prompt Optimization System
 *
 * Uses ML-powered analysis to optimize prompts based on historical performance,
 * context analysis, and regression modeling for continuous improvement.
 *
 * Features:
 * - Historical performance analysis using regression
 * - Context-aware optimization patterns
 * - Continuous learning from prompt success/failure
 * - Statistical significance testing
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
export interface PromptAnalysisData {
  readonly originalPrompt: string;
  readonly optimizedPrompt: string;
  readonly contextSize: number;
  readonly taskComplexity: number;
  readonly agentType: string;
  readonly successRate: number;
  readonly responseTime: number;
  readonly userSatisfaction: number;
  readonly timestamp: number;
  readonly metadata?: {
    domain?: string;
    complexity?: number;
    taskType?: string;
  };
  readonly context?: string;
  readonly metrics?: Record<string, number>;
}
export interface OptimizationPattern {
  readonly patternType:
    | 'length_optimization | structure_enhancement' | 'context_addition''' | '''clarity_improvement';
  readonly confidence: number;
  readonly improvement: number;
  readonly applicableContexts: string[];
  readonly examples: string[];
}
export interface SmartOptimizationResult {
  readonly optimizedPrompt: string;
  readonly confidence: number;
  readonly improvementFactor: number;
  readonly appliedPatterns: OptimizationPattern[];
  readonly reasoning: string[];
  readonly statisticalSignificance: number;
}
/**
 * Smart Prompt Optimization System
 *
 * Uses machine learning to continuously improve prompt optimization
 * based on historical performance data and statistical analysis.
 */
export declare class SmartPromptOptimizer {
  private performanceHistory;
  private optimizationPatterns;
  private initialized;
  constructor();
  /**
   * Initialize the optimization system
   */
  initialize(): Promise<void>;
  /**
   * Optimize a prompt using ML-powered analysis
   */
  optimizePrompt(
    originalPrompt: string,
    context?: {
      taskComplexity?: number;
      agentType?: string;
      expectedResponseTime?: number;
      domainSpecific?: boolean;
    }
  ): Promise<SmartOptimizationResult>;
  /**
   * Learn from prompt performance feedback
   */
  learnFromPerformance(analysisData: PromptAnalysisData): Promise<void>;
  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    totalOptimizations: number;
    averageImprovement: number;
    patternCount: number;
    successRate: number;
    recentTrend: number;
  };
  private initializeBaselinePatterns;
  private extractPromptFeatures;
  private findSimilarPrompts;
  private calculateFeatureSimilarity;
  private performRegressionAnalysis;
  private generateOptimizationPatterns;
  private applyOptimizations;
  private calculateOptimizationConfidence;
  private predictImprovementFactor;
  private generateOptimizationReasoning;
  private calculateStatisticalSignificance;
  private updateOptimizationPatterns;
  /**
   * Calculate complexity score based on prompt features
   */
  private calculateFeatureComplexity;
}
export default SmartPromptOptimizer;
//# sourceMappingURL=smart-prompt-optimizer.d.ts.map
