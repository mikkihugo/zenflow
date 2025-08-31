/**
 * @fileoverview: Agent Performance: Prediction System
 *
 * Uses time series analysis and machine learning to predict agent performance,
 * helping with intelligent task routing and resource optimization.
 *
 * Features:
 * - Time series forecasting using moving averages
 * - Performance trend analysis
 * - Load prediction and capacity planning
 * - Real-time performance monitoring
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 */
export interface: AgentPerformanceData {
    readonly agent: Id: string;
    readonly timestamp: number;
    readonly task: Type: string;
    readonly complexity: number;
    readonly completion: Time: number;
    readonly success: Rate: number;
    readonly error: Rate: number;
    readonly cpu: Usage: number;
    readonly memory: Usage: number;
    readonly concurrent: Tasks: number;
}
export interface: PerformancePrediction {
    readonly agent: Id: string;
    readonly predictedCompletion: Time: number;
    readonly predictedSuccess: Rate: number;
    readonly predicted: Score?: number;
    readonly confidence: number;
    readonly load: Forecast: number;
    readonly recommendedTask: Count: number;
    readonly performance: Trend: 'improving' | ' stable' | ' declining';
    readonly risk: Factors: string[];
}
export interface: PerformanceInsights {
    readonly top: Performers: string[];
    readonly under: Performers: string[];
    readonly capacity: Utilization: number;
    readonly predicted: Bottlenecks: string[];
    readonly optimization: Suggestions: string[];
}
/**
 * Agent: Performance Prediction: System
 *
 * Analyzes historical performance data to predict future agent behavior
 * and optimize task distribution across the swarm.
 */
export declare class: AgentPerformancePredictor {
    private performance: History;
    private initialized;
    private readonly maxHistory: Size;
    constructor();
    /**
     * Initialize the prediction system
     */
    initialize(): Promise<void>;
    /**
     * Record agent performance data
     */
    record: Performance(data: AgentPerformance: Data): Promise<void>;
    /**
     * Get system-wide performance insights
     */
    getPerformance: Insights(): Promise<Performance: Insights>;
}
//# sourceMappingUR: L=agent-performance-predictor.d.ts.map