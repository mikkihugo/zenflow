/**
 * @fileoverview Agent Performance Prediction System
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
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
export interface AgentPerformanceData {
	readonly agentId: string;
	readonly timestamp: number;
	readonly taskType: string;
	readonly complexity: number;
	readonly completionTime: number;
	readonly successRate: number;
	readonly errorRate: number;
	readonly cpuUsage: number;
	readonly memoryUsage: number;
	readonly concurrentTasks: number;
}
export interface PerformancePrediction {
	readonly agentId: string;
	readonly predictedCompletionTime: number;
	readonly predictedSuccessRate: number;
	readonly predictedScore?: number;
	readonly confidence: number;
	readonly loadForecast: number;
	readonly recommendedTaskCount: number;
	readonly performanceTrend:
		| "improving"
		| "stable"
		| "declining"
		| stable
		| declining;
	readonly riskFactors: string[];
}
export interface PerformanceInsights {
	readonly topPerformers: string[];
	readonly underPerformers: string[];
	readonly capacityUtilization: number;
	readonly predictedBottlenecks: string[];
	readonly optimizationSuggestions: string[];
}
/**
 * Agent Performance Prediction System
 *
 * Analyzes historical performance data to predict future agent behavior
 * and optimize task distribution across the swarm.
 */
export declare class AgentPerformancePredictor {
	private performanceHistory;
	private performanceTrends;
	private initialized;
	private readonly maxHistorySize;
	private readonly predictionWindow;
	constructor();
	/**
	 * Initialize the prediction system
	 */
	initialize(): Promise<void>;
	/**
	 * Record agent performance data
	 */
	recordPerformance(data: AgentPerformanceData): Promise<void>;
	/**
	 * Predict agent performance for a given task
	 */
	predictPerformance(
		agentId: string,
		taskType: string,
		complexity: number,
	): Promise<PerformancePrediction>;
	/**
	 * Get system-wide performance insights
	 */
	getPerformanceInsights(): Promise<PerformanceInsights>;
	/**
	 * Update performance data for continuous learning
	 */
	updatePerformanceData(data: {
		agentId: string;
		taskType: string;
		duration: number;
		success: boolean;
		efficiency: number;
		complexity?: number;
		resourceUsage?: number;
		errorCount?: number;
	}): Promise<void>;
	/**
	 * Get performance statistics for an agent
	 */
	getAgentStats(agentId: string): {
		totalTasks: number;
		averageSuccessRate: number;
		averageCompletionTime: number;
		performanceTrend: string;
		dataPoints: number;
	};
	private predictTimeSeriesValue;
	private predictSuccessRate;
	private analyzePerformanceTrend;
	private forecastAgentLoad;
	private calculatePredictionConfidence;
	private calculateOptimalTaskCount;
	private identifyRiskFactors;
	private updatePerformanceTrends;
	private getDefaultPrediction;
	private calculateCapacityUtilization;
	private predictBottlenecks;
	private generateOptimizationSuggestions;
}
export default AgentPerformancePredictor;
//# sourceMappingURL=agent-performance-predictor.d.ts.map
