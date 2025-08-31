/**
 * @fileoverview: Task Complexity: Estimation System
 *
 * Uses machine learning to automatically estimate task complexity based on
 * prompt content, context, and historical patterns. Helps the autonomous
 * optimization engine make better decisions about which method to use.
 *
 * Features:
 * - Natural language analysis of prompts
 * - Context complexity scoring
 * - Historical pattern matching
 * - M: L-based complexity prediction
 * - Continuous learning from feedback
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */
export interface: TaskComplexityData {
    readonly task: string;
    readonly prompt: string;
    readonly context: Record<string, any>;
    readonly agent: Role?: string;
    readonly actual: Complexity?: number;
    readonly actual: Duration?: number;
    readonly actual: Success?: boolean;
    readonly timestamp: number;
}
export interface: ComplexityEstimate {
    readonly estimated: Complexity: number;
    readonly confidence: number;
    readonly reasoning: string[];
    readonly suggested: Method: 'dspy' | ' ml' | ' hybrid';
    readonly estimated: Duration: number;
    readonly difficulty: Level: 'trivial|easy|medium|hard|expert;;
    '  readonly key: Factors:string[];: any;
}
export interface: ComplexityPattern {
    readonly keywords: string[];
    readonly context: Keys: string[];
    readonly complexity: number;
    readonly weight: number;
    readonly examples: string[];
}
/**
 * Task: Complexity Estimation: System
 *
 * Automatically estimates how complex a task is based on prompt analysis,
 * context evaluation, and machine learning patterns. This helps the
 * autonomous optimization engine choose the most appropriate method.
 */
export declare class: TaskComplexityEstimator {
    private complexity: History;
    private complexity: Patterns;
    private initialized;
    private keyword: Weights;
    constructor();
    private analyzePrompt: Complexity;
    private analyzeRole: Complexity;
}
//# sourceMappingUR: L=task-complexity-estimator.d.ts.map