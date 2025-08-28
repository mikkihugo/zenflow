/**
 * @fileoverview Neural ML Integration for claude-code-zen
 *
 * Integrates advanced ML capabilities from the Rust package with the existing
 * neural-bridge system. Provides high-level interfaces for DSPy teleprompter
 * optimization and neural coordination.
 *
 * Features:
 * - DSPy MIPROv2ML, COPROML, GRPOML teleprompter support
 * - Bayesian optimization for hyperparameter tuning
 * - Multi-objective optimization for competing objectives
 * - Online learning with concept drift detection
 * - Pattern recognition for optimization insights
 * - Seamless integration with existing neural-bridge
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { type ConceptDriftAlert, type MLResult, type OptimizationPoint, type Pattern, type Solution} from "./wasm-bindings";
export interface MLTrainingProgressEvent {
    trainingId:string;
    epoch:number;
    loss:number;
    accuracy:number;
    validationLoss?:number;
    validationAccuracy?:number;
    timestamp:number;
    sparc_phase:'specification' | ' pseudocode' | ' architecture' | ' refinement' | ' completion';
}
export interface MLInferenceResultEvent {
    inferenceId:string;
    model:string;
    inputSize:number;
    outputSize:number;
    processingTime:number;
    confidence:number;
    timestamp:number;
    result:any;
}
export interface MLWorkflowStateEvent {
    workflowId:string;
    state:'initiated' | ' training' | ' validating' | ' optimizing' | ' deploying' | ' completed' | ' failed';
    sparc_phase:'specification' | ' pseudocode' | ' architecture' | ' refinement' | ' completion';
    taskmaster_approval_required:boolean;
    timestamp:number;
    metadata:any;
}
export interface MLPerformanceMetricsEvent {
    metricId:string;
    cpu_usage:number;
    memory_usage:number;
    gpu_usage?:number;
    throughput:number;
    latency:number;
    error_rate:number;
    timestamp:number;
}
export interface MLModelValidationEvent {
    modelId:string;
    validation_type:'unit_test' | ' integration_test' | ' performance_test' | ' a_b_test';
    status:'passed' | ' failed' | ' warning';
    metrics:Record<string, number>;
    thresholds:Record<string, number>;
    sparc_phase:'specification' | ' pseudocode' | ' architecture' | ' refinement' | ' completion';
    timestamp:number;
}
export interface DSPyOptimizationConfig {
    teleprompter_type:"mipro|copro|grpo";
    use_ml_enhancement:boolean;
    max_iterations:number;
    population_size?:number;
    learning_rate?:number;
    gradient_steps?:number;
    bayesian_acquisition:"ei|pi|ucb|poi";
    multi_objective_weights?:number[];
    drift_detection:boolean;
    pattern_analysis:boolean;
    memory_limit_mb:number;
    timeout_ms:number;
}
export interface DSPyOptimizationResult {
    optimized_parameters:Record<string, any>;
    performance_metrics:{
        accuracy:number;
        f1_score:number;
        precision:number;
        recall:number;
        loss:number;
        convergence_rate:number;
        iterations_used:number;
};
    optimization_history:OptimizationPoint[];
    pareto_front?:Solution[];
    detected_patterns?:Pattern[];
    drift_alerts?:ConceptDriftAlert[];
    recommendations:string[];
}
export interface NeuralCoordinationConfig {
    enable_learning:boolean;
    enable_adaptation:boolean;
    enable_prediction:boolean;
    coordination_strategy:"centralized|distributed|hierarchical";
    ml_backend:"rust_wasm|fallback_js";
    performance_tracking:boolean;
    real_time_optimization:boolean;
}
export interface CoordinationMetrics {
    agent_performance:Record<string, number>;
    coordination_efficiency:number;
    learning_progress:number;
    adaptation_rate:number;
    prediction_accuracy:number;
    resource_utilization:number;
    bottleneck_detection:string[];
}
/**
 * Advanced ML-Enhanced Neural Coordinator
 *
 * Integrates Rust-based ML algorithms with the neural coordination system
 * to provide intelligent optimization, learning, and adaptation capabilities.
 */
export declare class MLNeuralCoordinator extends TypedEventBase {
    private logger;
    private config;
    private initialized;
    private bayesianOptimizer;
    private gradientOptimizer;
    private multiObjectiveOptimizer;
    private onlineLearner;
    private patternRecognizer;
    private embeddingModel;
    private similarityCalculator;
    private clusteringAlgorithm;
    private optimizationHistory;
    private coordinationMetrics;
    private activeOptimizations;
    private activeTrainingJobs;
    private activeInferences;
    private workflowStates;
    private performanceMetrics;
    private validationResults;
    constructor(config:NeuralCoordinationConfig);
    /**
     * Initialize the ML coordination system
     */
    initialize():Promise<MLResult<void>>;
    /**
     * Optimize DSPy teleprompters using advanced ML techniques
     */
    optimizeDSPyTeleprompter(teleprompter_config:DSPyOptimizationConfig, training_data:any[], validation_data:any[]): Promise<MLResult<DSPyOptimizationResult>>;
    /**
     * Optimize MIPROv2 with ML enhancement (Bayesian + Multi-Objective)
     */
    private optimizeMIPROML;
    /**
     * Optimize COPRO with ML enhancement (Bayesian + Online Learning)
     */
    private optimizeCOPROML;
    /**
     * Optimize GRPO with ML enhancement (Gradient + Pattern Recognition)
     */
    private optimizeGRPOML;
    /**
     * Get current coordination metrics with ML insights
     */
    getCoordinationMetrics():Promise<MLResult<CoordinationMetrics>>;
    /**
     * Predict coordination performance for given parameters
     */
    predictCoordinationPerformance(coordination_params:Record<string, number>):Promise<MLResult<{
        predicted_efficiency:number;
        confidence:number;
}>>;
    /**
     * Adapt coordination strategy based on current performance
     */
    adaptCoordinationStrategy():Promise<MLResult<{
        new_strategy:string;
        adaptations:string[];
}>>;
    private initializeLearningAlgorithms;
    private initializePredictionAlgorithms;
    private initializeAdaptationAlgorithms;
    private selectBestParetoSolution;
    private analyzeOptimizationPatterns;
    private convertSolutionsToPoints;
    private generateOptimizationRecommendations;
    private generateCOPRORecommendations;
    private generateGRPORecommendations;
    private extractFeaturesFromData;
    private extractTargetFromData;
    private generateMockInputs;
    private generateMockGradients;
    private calculateConvergenceRate;
    private calculateCoordinationEfficiency;
    private calculateLearningProgress;
    private calculateAdaptationRate;
    private calculatePredictionAccuracy;
    private calculateResourceUtilization;
    private detectBottlenecks;
    /**
     * Start performance monitoring for enterprise coordination
     */
    private startPerformanceMonitoring;
    /**
     * Start ML training job with SPARC methodology integration
     */
    startTrainingJob(modelId:string, config:any, sparc_phase?:'specification' | ' pseudocode' | ' architecture' | ' refinement' | ' completion'): Promise<string>;
    /**
     * Update training progress with enterprise event emission
     */
    updateTrainingProgress(trainingId:string, epoch:number, loss:number, accuracy:number, validationLoss?:number, validationAccuracy?:number): void;
    /**
     * Execute ML inference with comprehensive event tracking
     */
    executeInference(modelId:string, input:any, options?:{
        timeout?:number;
        confidence_threshold?:number;
}):Promise<MLInferenceResultEvent>;
    /**
     * Run model validation with SPARC quality gates
     */
    validateModel(modelId:string, validationType:'unit_test' | ' integration_test' | ' performance_test' | ' a_b_test', sparc_phase:' specification' | ' pseudocode' | ' architecture' | ' refinement' | ' completion', testData:any[]): Promise<MLModelValidationEvent>;
    /**
     * Request TaskMaster approval for ML operations
     */
    requestTaskMasterApproval(workflowId:string, operation:string, metadata:any): Promise<boolean>;
    /**
     * Get enterprise coordination metrics
     */
    getEnterpriseMetrics():{
        active_training_jobs:number;
        active_inferences:number;
        workflow_states:number;
        recent_validations:number;
        average_performance:Partial<MLPerformanceMetricsEvent>;
};
    private calculateThroughput;
    private calculateAverageLatency;
    private calculateErrorRate;
    private isTrainingCompleted;
    private completeTrainingJob;
    private performInference;
    private performValidation;
    private getValidationThresholds;
}
/**
 * Factory function to create ML Neural Coordinator with sensible defaults
 */
export declare function createMLNeuralCoordinator(overrides?:Partial<NeuralCoordinationConfig>): MLNeuralCoordinator;
/**
 * Utility function to create DSPy optimization configuration with ML enhancement
 */
export declare function createDSPyMLConfig(teleprompter_type:"mipro|copro|grpo", overrides?:Partial<DSPyOptimizationConfig>): DSPyOptimizationConfig;
//# sourceMappingURL=neural-ml-integration.d.ts.map