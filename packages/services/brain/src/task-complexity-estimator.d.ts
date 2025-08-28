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
    readonly suggestedMethod: 'dspy' | ' ml' | ' hybrid';
    readonly estimatedDuration: number;
    readonly difficultyLevel: 'trivial|easy|medium|hard|expert;;
    '  readonly keyFactors:string[];: any;
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
    private keywordWeights;
    constructor();
    private analyzePromptComplexity;
    private analyzeRoleComplexity;
}
//# sourceMappingURL=task-complexity-estimator.d.ts.map