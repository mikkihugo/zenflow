/**
 * @fileoverview DSPy-Brain ML Bridge - Seamless Integration
 *
 * Creates seamless integration bridge between DSPy teleprompters and Brain's ML capabilities.
 * This bridge allows DSPy optimizers to leverage Brain's neural networks, WASM acceleration,
 * and advanced ML features while maintaining clean separation of concerns.
 *
 * Architecture:
 * - DSPy teleprompters request ML optimization via this bridge
 * - Bridge translates DSPy optimization problems to Brain ML tasks
 * - Brain processes using neural networks, Rust acceleration, statistical analysis
 * - Results are translated back to DSPy optimization format
 *
 * Key Features:
 * - 🧠 Neural network coordination via Brain package
 * - ⚡ WASM acceleration for performance-critical operations
 * - 📊 Statistical analysis using battle-tested Rust crates
 * - 🎯 Multi-objective optimization (accuracy, speed, memory)
 * - 🔄 Adaptive learning with concept drift detection
 * - 📈 Bayesian optimization with Gaussian Process regression
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
export interface DSPyOptimizationTask {
	type: "teleprompter_optimization";
	teleprompterType: "miprov2|copro|bootstrap|grpo";
	objective: "accuracy|speed|memory|multi_objective";
	parameters: DSPyParameters;
	constraints: OptimizationConstraints;
	dataset: TrainingDataset;
	evaluationMetrics: string[];
}
export interface DSPyParameters {
	instructions: string[];
	prefixes: string[];
	demonstrations: any[];
	populationSize: number;
	maxIterations: number;
	learningRate?: number;
	regularization?: number;
}
export interface OptimizationConstraints {
	maxExecutionTime: number;
	maxMemoryUsage: number;
	minAccuracy: number;
	maxLatency: number;
}
export interface TrainingDataset {
	examples: Example[];
	validationSplit: number;
	testSplit: number;
}
export interface Example {
	input: Record<string, any>;
	output: Record<string, any>;
	metadata?: Record<string, any>;
}
export interface DSPyOptimizationResult {
	success: boolean;
	optimizedParameters: DSPyParameters;
	metrics: OptimizationMetrics;
	neuralAnalysis: NeuralAnalysis;
	convergenceInfo: ConvergenceInfo;
	recommendations: OptimizationRecommendations;
}
export interface OptimizationMetrics {
	accuracy: number;
	speed: number;
	memoryUsage: number;
	convergenceTime: number;
	iterationsUsed: number;
	paretoOptimality?: number;
}
export interface NeuralAnalysis {
	patternRecognition: PatternResult[];
	conceptDrift: DriftDetection;
	statisticalSignificance: StatisticalTest;
	neuralPredictions: PredictionResult[];
}
export interface ConvergenceInfo {
	converged: boolean;
	convergenceIteration: number;
	finalLoss: number;
	lossTrajectory: number[];
	gradientNorm: number;
}
export interface OptimizationRecommendations {
	suggestedParameters: Partial<DSPyParameters>;
	alternativeObjectives: string[];
	performanceBottlenecks: string[];
	nextOptimizationSteps: string[];
}
interface PatternResult {
	pattern: string;
	confidence: number;
	impact: number;
}
interface DriftDetection {
	driftDetected: boolean;
	driftMagnitude: number;
	recommendedAdaptation: string;
}
interface StatisticalTest {
	testType: string;
	pValue: number;
	significant: boolean;
	confidenceInterval: [number, number];
}
interface PredictionResult {
	parameter: string;
	predictedValue: number;
	confidence: number;
	reasoning: string;
}
/**
 * DSPy-Brain ML Bridge - Seamless Integration
 *
 * Provides seamless integration between DSPy teleprompters and Brain's ML capabilities.
 * Acts as a translation layer that allows DSPy optimizers to leverage advanced
 * neural networks, WASM acceleration, and statistical analysis.
 */
export declare class DSPyBrainMLBridge extends TypedEventBase {
	private logger;
	private brainCoordinator;
	private initialized;
	private optimizationHistory;
	constructor();
	/**
	 * Initialize the bridge with Brain coordinator integration.
	 */
	initialize(): Promise<void>;
	/**
	 * Optimize DSPy teleprompter using Brain's ML capabilities.
	 *
	 * @param task - DSPy optimization task
	 * @returns Optimization result with neural analysis
	 */
	optimizeTeleprompter(
		task: DSPyOptimizationTask,
	): Promise<DSPyOptimizationResult>;
	/**
	 * Get intelligent teleprompter recommendations based on task characteristics.
	 *
	 * @param taskDescription - Description of the optimization task
	 * @returns Recommended teleprompter and configuration
	 */
	getIntelligentTeleprompterRecommendation(taskDescription: string): Promise<{
		recommendedTeleprompter: string;
		confidence: number;
		reasoning: string;
		suggestedConfig: Partial<DSPyParameters>;
		mlEnhanced: boolean;
	}>;
	/**
	 * Convert DSPy optimization task to Brain prompt request format.
	 */
	private translateDSPyToBrainRequest;
	/**
	 * Convert Brain optimization result to DSPy format.
	 */
	private translateBrainToDSPyResult;
	/**
	 * Analyze task characteristics for intelligent recommendation.
	 */
	private analyzeTaskCharacteristics;
	/**
	 * Get historical performance data for ML recommendation.
	 */
	private getHistoricalPerformance;
	/**
	 * Generate ML-based teleprompter recommendation.
	 */
	private generateMLRecommendation;
	private estimateComplexity;
	private estimateDataSize;
	private estimateAccuracyRequirement;
	private estimateSpeedRequirement;
	private identifyDomain;
	/**
	 * Get optimization history for analysis.
	 */
	getOptimizationHistory(): Map<string, DSPyOptimizationResult>;
	/**
	 * Clear optimization history.
	 */
	clearHistory(): void;
	/**
	 * Get bridge status and metrics.
	 */
	getStatus(): {
		initialized: boolean;
		brainCoordinatorActive: boolean;
		totalOptimizations: number;
		averageOptimizationTime: number;
		successRate: number;
	};
	/**
	 * Cleanup resources.
	 */
	destroy(): Promise<void>;
}
export declare function createDSPyBrainMLBridge(): DSPyBrainMLBridge;
export default DSPyBrainMLBridge;
//# sourceMappingURL=dspy-brain-ml-bridge.d.ts.map
