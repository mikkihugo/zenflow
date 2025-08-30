/**
 * @fileoverview ML Interfaces - Simple TypeScript interfaces for Rust ML capabilities
 *
 * Lightweight interfaces that map to sophisticated Rust implementations.
 * No fancy TypeScript - just efficient type definitions for Rust bindings.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { Logger } from "@claude-zen/foundation";
import { type RustMLConfig } from "./rust-binding";
export interface ConceptDriftDetection {
    driftDetected: boolean;
    driftStrength: number;
    changePoint?: number;
    confidence: number;
}
export interface OnlineLearnerConfig {
    algorithm: string;
    learningRate: number;
    regularization: number;
    adaptiveLearningRate: boolean;
    forgettingFactor: number;
}
/**
 * Simple ML Engine interface - routes to Rust implementation
 */
export interface MLEngine {
    initialize(): Promise<void>;
    optimize(task: OptimizationTask): Promise<OptimizationResult>;
    analyze(data: unknown[]): Promise<StatisticalResult>;
    learn(data: unknown[], target?: unknown[]): Promise<PatternResult>;
    destroy(): Promise<void>;
}
/**
 * Bayesian Optimizer interface - maps to Rust Bayesian optimization
 */
export interface BayesianOptimizer {
    initialize(config: OptimizationBounds): Promise<void>;
    optimize(objective: (params: number[]) => Promise<number>): Promise<OptimizationResult>;
    suggestNext(): Promise<number[]>;
    suggest(): Promise<{
        point: number[];
    }>;
    updateObservation(params: number[], value: number): Promise<void>;
    observe(params: number[], value: number): Promise<void>;
    configure(config: Record<string, unknown>): Promise<void>;
}
/**
 * Multi-objective optimizer interface - maps to Rust NSGA-II implementation
 */
export interface MultiObjectiveOptimizer {
    initialize(config: OptimizationBounds): Promise<void>;
    optimize(objectives: Array<(params: number[]) => Promise<number>>): Promise<ParetoFront>;
    getParetoFront(): Promise<ParetoFront>;
    findParetoFront(solutions?: number[][]): Promise<ParetoFront>;
    configure(config: Record<string, unknown>): Promise<void>;
}
/**
 * Gradient optimizer interface - maps to Rust auto-differentiation
 */
export interface GradientOptimizer {
    initialize(config: Record<string, unknown>): Promise<void>;
    computeGradient(params: number[], objective: (params: number[]) => Promise<number>): Promise<GradientResult>;
    step(gradients: number[]): Promise<number[]>;
}
/**
 * Pattern learner interface - maps to Rust pattern recognition
 */
export interface PatternLearner {
    initialize(config: Record<string, unknown>): Promise<void>;
    learnPatterns(data: unknown[]): Promise<PatternResult>;
    recognizePattern(input: unknown): Promise<PatternResult>;
    trainPatterns(data: unknown[], labels?: unknown[]): Promise<PatternResult>;
    configure(config: Record<string, unknown>): Promise<void>;
    performClustering(data: number[], k: number): Promise<Array<{
        center: number[];
        members: number;
        inertia: number;
    }>>;
    calculateSimilarity(data: number[]): number;
}
/**
 * Online learner interface - maps to Rust online learning
 */
export interface OnlineLearner {
    initialize(config: Record<string, unknown>): Promise<void>;
    configure(config: OnlineLearnerConfig): Promise<void>;
    updateModel(data: unknown, target?: unknown): Promise<void>;
    predict(input: unknown): Promise<unknown>;
    update(features: MLVector, target: number): Promise<void>;
    adaptLearningRate(performance: number): Promise<number>;
    detectDrift(predictions: number[], targets: number[]): Promise<ConceptDriftDetection>;
    reset(keepHistory: boolean): Promise<void>;
    extractFeatures(data: unknown): number[];
    dotProduct(a: number[], b: number[]): number;
    updateWeightsSGD(features: number[], error: number, learningRate: number): void;
    updateWeightsMomentum(features: number[], error: number, learningRate: number): void;
}
/**
 * Statistical analyzer interface - maps to Rust statistical analysis
 */
export interface StatisticalAnalyzer {
    initialize(): Promise<void>;
    analyze(data: number[]): Promise<StatisticalResult>;
    hypothesisTest(data1: number[], data2: number[]): Promise<HypothesisTest>;
    confidenceInterval(data: number[], confidence: number): Promise<[number, number]>;
    tTest(data1: number[], data2: number[]): Promise<HypothesisTest>;
    polynomialRegression(x: number[], y: number[], degree: number): Promise<{
        coefficients: number[];
        rSquared: number;
    }>;
    descriptiveStats(data: number[]): Promise<StatisticalResult>;
}
export type MLVector = Float32Array | number[];
export interface MLDataset {
    features: MLVector[];
    labels: Int32Array;
    featureNames: string[];
    size: number;
    shuffle?(): MLDataset;
    split?(ratio: number): [MLDataset, MLDataset];
}
export interface Pattern {
    pattern: any;
    frequency: number;
    confidence: number;
    id?: string;
    type?: string;
    metadata?: Record<string, any>;
    centroid?: number[] | Float32Array;
}
export interface OptimizationTask {
    algorithm: string;
    parameters: Record<string, any>;
    data: number[];
    target?: number[];
    bounds?: OptimizationBounds;
}
export interface OptimizationBounds {
    lower: number[] | Float32Array;
    upper: number[] | Float32Array;
    constraints?: Array<(params: number[]) => boolean>;
}
export interface OptimizationResult {
    success: boolean;
    bestParams: number[];
    bestValue: number;
    iterations: number;
    convergence: boolean;
    performance: {
        duration_ms: number;
        memory_used: number;
        iterations: number;
    };
}
export interface ParetoFront {
    solutions: Array<{
        params: number[];
        objectives: number[];
        dominationRank: number;
        crowdingDistance: number;
        rank: number;
        solutionIndex?: number;
    }>;
    hypervolume: number;
    generationalDistance: number;
    spacing?: number;
    spread?: number;
}
export interface GradientResult {
    gradients: number[];
    hessian?: number[][];
    convergence: boolean;
    stepSize: number;
}
export interface PatternResult {
    patterns: Array<{
        pattern: any;
        frequency: number;
        confidence: number;
    }>;
    clusters?: Array<{
        center: number[];
        members: number;
        inertia: number;
    }>;
    similarity: number;
}
export interface StatisticalResult {
    mean: number;
    std: number;
    median: number;
    quantiles: number[];
    distribution: string;
    outliers: number[];
    normalityTest: {
        statistic: number;
        pValue: number;
        isNormal: boolean;
    };
}
export interface HypothesisTest {
    statistic: number;
    pValue: number;
    significant: boolean;
    effectSize: number;
    confidenceInterval: [number, number];
    critical?: number;
    testType?: string;
}
/**
 * Simple ML Engine implementation that routes to Rust
 */
export declare class SimpleMLEngine implements MLEngine {
    private rustML;
    private initialized;
    bayesianOptimizer?: BayesianOptimizer;
    multiObjectiveOptimizer?: MultiObjectiveOptimizer;
    patternLearner?: PatternLearner;
    statisticalAnalyzer?: StatisticalAnalyzer;
    onlineLearner?: OnlineLearner;
    constructor(config: RustMLConfig, logger: Logger);
    initialize(): Promise<void>;
    createBayesianOptimizer(bounds: OptimizationBounds): BayesianOptimizer;
    createMultiObjectiveOptimizer(bounds: OptimizationBounds): MultiObjectiveOptimizer;
    createGradientOptimizer(config: any): GradientOptimizer;
    createPatternLearner(config: any): PatternLearner;
    createStatisticalAnalyzer(): StatisticalAnalyzer;
    createOnlineLearner(config: any): OnlineLearner;
    optimize(task: OptimizationTask): Promise<OptimizationResult>;
    analyze(data: number[]): Promise<StatisticalResult>;
    learn(data: any[], target?: any[]): Promise<PatternResult>;
    destroy(): void;
}
/**
 * Factory functions for creating ML components
 */
export declare function createMLEngine(config?: any, logger?: Logger): MLEngine;
export declare function createBayesianOptimizer(config: OptimizationBounds): BayesianOptimizer;
export declare function createMultiObjectiveOptimizer(config: OptimizationBounds): MultiObjectiveOptimizer;
export declare function createGradientOptimizer(config: any): GradientOptimizer;
export declare function createPatternLearner(config: any): PatternLearner;
export declare function createOnlineLearner(config: any): OnlineLearner;
declare const _default: {
    MLEngine: typeof SimpleMLEngine;
    createMLEngine: typeof createMLEngine;
    createBayesianOptimizer: typeof createBayesianOptimizer;
    createStatisticalAnalyzer: any;
    createMultiObjectiveOptimizer: typeof createMultiObjectiveOptimizer;
    createGradientOptimizer: typeof createGradientOptimizer;
    createPatternLearner: typeof createPatternLearner;
    createOnlineLearner: typeof createOnlineLearner;
};
export default _default;
//# sourceMappingURL=ml-interfaces.d.ts.map