/**
 * @fileoverview WASM TypeScript bindings for neural-ml Rust package
 *
 * Provides TypeScript interfaces and wrapper classes for accessing
 * advanced ML capabilities implemented in Rust via WASM.
 *
 * Features:
 * - Bayesian Optimization with Gaussian Processes
 * - Automatic Differentiation and Gradient Optimization
 * - Multi-Objective Pareto Optimization (NSGA-II)
 * - Online Learning with Concept Drift Detection
 * - Pattern Recognition and Text Embeddings
 * - Comprehensive Error Handling and Performance Metrics
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
export interface MLResult<T> {
    success:boolean;
    data?:T;
    error?:string;
    metrics?:PerformanceMetrics;
}
export interface PerformanceMetrics {
    execution_time_ms:number;
    memory_usage_bytes:number;
    iterations:number;
    convergence_rate?:number;
    accuracy?:number;
    loss?:number;
    custom_metrics:Record<string, number>;
}
export interface OptimizationConfig {
    max_iterations:number;
    tolerance:number;
    timeout_ms:number;
    memory_limit_mb?:number;
    parallel_jobs?:number;
}
export interface BayesianConfig extends OptimizationConfig {
    kernel_type: 'rbf|matern|polynomial|linear';
    kernel_params:Record<string, number>;
    acquisition_type: 'ei|pi|ucb|poi';
    acquisition_params:Record<string, number>;
    noise_level:number;
}
export interface OptimizationPoint {
    parameters:number[];
    objective:number;
    constraints?:number[];
    timestamp?:number;
}
export interface OptimizationBounds {
    lower:number[];
    upper:number[];
}
export interface GradientConfig extends OptimizationConfig {
    optimizer_type: 'sgd|adam|rmsprop|adagrad';
    learning_rate:number;
    momentum?:number;
    beta1?:number;
    beta2?:number;
    epsilon?:number;
    weight_decay?:number;
}
export interface TensorShape {
    dimensions:number[];
    total_elements:number;
}
export interface ComputationNode {
    id:string;
    operation:string;
    inputs:string[];
    shape:TensorShape;
    requires_grad:boolean;
}
export interface MultiObjectiveConfig extends OptimizationConfig {
    population_size:number;
    mutation_rate:number;
    crossover_rate:number;
    selection_pressure:number;
    diversity_threshold:number;
}
export interface Solution {
    parameters:number[];
    objectives:number[];
    constraints:number[];
    rank:number;
    crowding_distance:number;
    dominated_count:number;
}
export interface ParetoFront {
    solutions:Solution[];
    hypervolume:number;
    diversity_metric:number;
    convergence_metric:number;
}
export interface OnlineLearningConfig {
    learning_rate:number;
    drift_detection_method: 'page_hinkley|adwin|ddm|eddm|ks_test';
    drift_threshold:number;
    adaptation_rate:number;
    buffer_size:number;
    batch_size:number;
}
export interface ConceptDriftAlert {
    detected:boolean;
    drift_type: 'gradual|sudden|recurring|incremental';
    confidence:number;
    affected_features:number[];
    timestamp:number;
}
export interface LearningUpdate {
    loss:number;
    accuracy:number;
    learning_rate:number;
    drift_score:number;
    buffer_utilization:number;
}
export interface PatternConfig {
    pattern_types:'sequential|temporal|frequency|structural|behavioral|optimization'[];
    min_support:number;
    min_confidence:number;
    max_pattern_length:number;
    enable_normalization:boolean;
}
export interface EmbeddingConfig {
    vocab_size:number;
    min_df:number;
    max_df:number;
    max_features?:number;
    ngram_range:[number, number];
    normalize:boolean;
}
export interface SimilarityConfig {
    metric: 'cosine|euclidean|manhattan|jaccard|mahalanobis';
    threshold:number;
    normalize_inputs:boolean;
}
export interface ClusteringConfig {
    algorithm: 'kmeans|dbscan|hierarchical';
    n_clusters?:number;
    eps?:number;
    min_samples?:number;
    linkage?: 'single|complete|average|ward';
    distance_metric?:string;
}
export interface Pattern {
    id:string;
    pattern_type:string;
    sequence:number[];
    support:number;
    confidence:number;
    lift:number;
    metadata:Record<string, any>;
}
export interface ClusterResult {
    labels:number[];
    centroids?:number[][];
    inertia?:number;
    silhouette_score?:number;
    n_clusters:number;
}
/**
 * Bayesian Optimization wrapper for WASM integration
 */
export declare class BayesianOptimizer {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:BayesianConfig): Promise<MLResult<void>>;
    optimize(objective_data:OptimizationPoint[], bounds:OptimizationBounds, num_suggestions?:number): Promise<MLResult<OptimizationPoint[]>>;
    predict(parameters:number[]): Promise<MLResult<{
        mean:number;
        variance:number;
}>>;
    getMetrics():MLResult<PerformanceMetrics>;
}
/**
 * Gradient-based optimization wrapper for WASM integration
 */
export declare class GradientOptimizer {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:GradientConfig): Promise<MLResult<void>>;
    addComputationNode(node:ComputationNode): Promise<MLResult<void>>;
    forward(inputs:Record<string, number[]>):Promise<MLResult<Record<string, number[]>>>;
    backward(loss_gradients:Record<string, number[]>):Promise<MLResult<Record<string, number[]>>>;
    updateParameters():Promise<MLResult<void>>;
}
/**
 * Multi-objective optimization wrapper for WASM integration
 */
export declare class MultiObjectiveOptimizer {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:MultiObjectiveConfig): Promise<MLResult<void>>;
    optimize(bounds:OptimizationBounds, num_objectives:number): Promise<MLResult<ParetoFront>>;
    evaluatePopulation(population:Solution[]): Promise<MLResult<Solution[]>>;
    calculateHypervolume(solutions:Solution[], reference_point:number[]): Promise<MLResult<number>>;
}
/**
 * Online learning wrapper for WASM integration
 */
export declare class OnlineLearner {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:OnlineLearningConfig): Promise<MLResult<void>>;
    processStream(features:number[], target:number): Promise<MLResult<LearningUpdate>>;
    detectDrift():Promise<MLResult<ConceptDriftAlert>>;
    predict(features:number[]): Promise<MLResult<number>>;
    adaptLearningRate():Promise<MLResult<number>>;
}
/**
 * Pattern recognition wrapper for WASM integration
 */
export declare class PatternRecognizer {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:PatternConfig): Promise<MLResult<void>>;
    extractPatterns(data:number[][]): Promise<MLResult<Pattern[]>>;
    detectTrends(data:number[]): Promise<MLResult<{
        trend:string;
        strength:number;
        significance:number;
}>>;
    detectPeriodicity(data:number[]): Promise<MLResult<{
        periods:number[];
        strengths:number[];
}>>;
}
/**
 * Text embedding model wrapper for WASM integration
 */
export declare class EmbeddingModel {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:EmbeddingConfig): Promise<MLResult<void>>;
    fitVocabulary(documents:string[]): Promise<MLResult<void>>;
    transform(documents:string[]): Promise<MLResult<number[][]>>;
    fitTransform(documents:string[]): Promise<MLResult<number[][]>>;
    getVocabularySize():MLResult<number>;
}
/**
 * Similarity metrics calculator wrapper for WASM integration
 */
export declare class SimilarityCalculator {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:SimilarityConfig): Promise<MLResult<void>>;
    calculate(vector1:number[], vector2:number[]): Promise<MLResult<number>>;
    calculateMatrix(vectors:number[][]): Promise<MLResult<number[][]>>;
    findSimilar(query_vector:number[], candidate_vectors:number[][], top_k?:number): Promise<MLResult<{
        indices:number[];
        similarities:number[];
}>>;
}
/**
 * Clustering algorithm wrapper for WASM integration
 */
export declare class ClusteringAlgorithm {
    private wasmInstance;
    private initialized;
    constructor();
    initialize(config:ClusteringConfig): Promise<MLResult<void>>;
    fit(data:number[][]): Promise<MLResult<ClusterResult>>;
    predict(data:number[][]): Promise<MLResult<number[]>>;
    fitPredict(data:number[][]): Promise<MLResult<ClusterResult>>;
    evaluateCluster(data:number[][], labels:number[]): Promise<MLResult<{
        silhouette_score:number;
        inertia?:number;
}>>;
}
/**
 * Initialize the WASM module and check if it's ready
 */
export declare function initializeWASM():Promise<MLResult<void>>;
/**
 * Check if WASM module is available and ready
 */
export declare function isWASMReady():boolean;
/**
 * Get available ML algorithms and their capabilities
 */
export declare function getAvailableAlgorithms():Promise<MLResult<Record<string, string[]>>>;
/**
 * Validate configuration objects before passing to WASM
 */
export declare function validateConfig<T extends Record<string, any>>(config:T, requiredFields:string[]): MLResult<void>;
/**
 * Create default configurations for different algorithms
 */
export declare const DefaultConfigs:{
    bayesian:() => BayesianConfig;
    gradient:() => GradientConfig;
    multiObjective:() => MultiObjectiveConfig;
    onlineLearning:() => OnlineLearningConfig;
    pattern:() => PatternConfig;
    embedding:() => EmbeddingConfig;
    similarity:() => SimilarityConfig;
    clustering:() => ClusteringConfig;
};
export { BayesianOptimizer, GradientOptimizer, MultiObjectiveOptimizer, OnlineLearner, PatternRecognizer, EmbeddingModel, SimilarityCalculator, ClusteringAlgorithm};
//# sourceMappingURL=wasm-bindings.d.ts.map