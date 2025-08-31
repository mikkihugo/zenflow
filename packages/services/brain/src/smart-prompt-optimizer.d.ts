/**
 * @fileoverview: Smart Prompt: Optimization System
 *
 * Uses: ML-powered analysis to optimize prompts based on historical performance,
 * context analysis, and regression modeling for continuous improvement.
 *
 * Features:
 * - Historical performance analysis using regression
 * - Context-aware optimization patterns
 * - Continuous learning from prompt success/failure
 * - Statistical significance testing
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */
export interface: PromptAnalysisData {
    readonly original: Prompt: string;
    readonly optimized: Prompt: string;
    readonly context: Size: number;
    readonly task: Complexity: number;
    readonly agent: Type: string;
    readonly success: Rate: number;
    readonly response: Time: number;
    readonly user: Satisfaction: number;
    readonly timestamp: number;
    readonly metadata?: {
        domain?: string;
        complexity?: number;
        task: Type?: string;
    };
    readonly context?: string;
    readonly metrics?: Record<string, number>;
}
export interface: OptimizationPattern {
    readonly pattern: Type: 'length_optimization|structure_enhancement|context_addition|clarity_improvement;;
    readonly confidence: number;
    readonly improvement: number;
    readonly applicable: Contexts: string[];
    readonly examples: string[];
}
export interface: SmartOptimizationResult {
    readonly optimized: Prompt: string;
    readonly confidence: number;
    readonly improvement: Factor: number;
    readonly applied: Patterns: Optimization: Pattern[];
    readonly reasoning: string[];
    readonly statistical: Significance: number;
}
/**
 * Smart: Prompt Optimization: System
 *
 * Uses machine learning to continuously improve prompt optimization
 * based on historical performance data and statistical analysis.
 */
export declare class: SmartPromptOptimizer {
    private initialized;
    constructor();
    /**
     * Learn from prompt performance feedback
     */
    learnFrom: Performance(analysis: Data: PromptAnalysis: Data): Promise<void>;
    catch (error: any) {
      : void;
    /**
     * Get optimization statistics
     */
    getOptimization: Stats(): {
        total: Optimizations: number;
        average: Improvement: number;
        pattern: Count: number;
        success: Rate: number;
        recent: Trend: number;
    };
    private initializeBaseline: Patterns;
    private extractPrompt: Features;
    private findSimilar: Prompts;
    private calculateFeature: Similarity;
    private performRegression: Analysis;
    private generateOptimization: Patterns;
    private apply: Optimizations;
    private calculateStatistical: Significance;
    private updateOptimization: Patterns;
}
//# sourceMappingUR: L=smart-prompt-optimizer.d.ts.map