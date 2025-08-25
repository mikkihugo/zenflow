/**
 * @fileoverview MIPROv2ML - ML-Enhanced Multi-stage Instruction and Prefix Optimization
 *
 * Advanced ML-enhanced version of MIPROv2 teleprompter using battle-tested
 * Rust crates (smartcore, linfa-bayes, argmin) and npm packages for
 * sophisticated Bayesian optimization, multi-objective optimization,
 * and statistical analysis.
 *
 * Key ML Enhancements:
 * - Bayesian optimization with Gaussian Process regression
 * - Multi-objective optimization (accuracy vs speed vs memory)
 * - Pattern recognition for optimization trajectory analysis
 * - Concept drift detection for adaptive learning
 * - Statistical significance testing for convergence
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { Teleprompter } from './teleprompter';
import { DSPyModule } from '../primitives/module';
import type { OptimizationResult, ParetoFront, Pattern, HypothesisTest, StatisticalResult } from '@claude-zen/neural-ml';
export interface MIPROv2MLConfig {
    maxIterations: number;
    populationSize: number;
    convergenceThreshold: number;
    useBayesianOptimization: boolean;
    useMultiObjectiveOptimization: boolean;
    usePatternAnalysis: boolean;
    useStatisticalValidation: boolean;
    acquisitionFunction: 'expected_improvement|upper_confidence_bound|probability_improvement';
    kernelType: 'rbf|matern|linear';
    explorationWeight: number;
    objectives: Array<'accuracy|speed|memory|robustness'>;
    objectiveWeights?: number[];
    paretoFrontSize: number;
    patternTypes: Array<'sequential|cyclical|convergence|divergence'>;
    patternMinSupport: number;
    patternConfidenceThreshold: number;
    significanceLevel: number;
    minimumSampleSize: number;
    statisticalTests: Array<'t_test|anova|regression'>;
    timeoutMs: number;
    memoryLimitMb: number;
    maxConcurrency: number;
}
export interface MIPROv2MLResult {
    optimizedModule: DSPyModule;
    finalAccuracy: number;
    convergenceRate: number;
    totalIterations: number;
    bayesianResults?: OptimizationResult;
    paretoFront?: ParetoFront;
    detectedPatterns: Pattern[];
    statisticalSignificance: HypothesisTest[];
    optimizationHistory: Array<{
        iteration: number;
        parameters: Record<string, any>;
        accuracy: number;
        speed: number;
        memory: number;
        timestamp: Date;
    }>;
    recommendations: string[];
    insights: string[];
    totalOptimizationTime: number;
    memoryUsage: number;
    convergenceAnalysis: StatisticalResult;
}
/**
 * MIPROv2ML - Advanced ML-Enhanced Multi-stage Instruction and Prefix Optimization
 *
 * This teleprompter extends the original MIPROv2 with sophisticated ML capabilities
 * using battle-tested Rust crates and npm packages for optimization and analysis.
 */
export declare class MIPROv2ML extends Teleprompter {
    private eventEmitter;
    private logger;
    private config;
    private initialized;
    private mlEngine?;
    private bayesianOptimizer?;
    private multiObjectiveOptimizer?;
    private patternLearner?;
    private statisticalAnalyzer?;
    private optimizationHistory;
    private currentIteration;
    private startTime?;
    constructor(config?: Partial<MIPROv2MLConfig>);
    /**
     * Initialize ML components with battle-tested libraries
     */
    initialize(): Promise<void>;
    /**
     * Emit events through internal EventEmitter
     */
    private emit;
    /**
     * Compile the module with base interface compatibility
     */
    compile(student: DSPyModule, config: {
        trainset: any[];
        teacher?: DSPyModule | null;
        valset?: any[] | null;
        [key: string]: any;
    }): Promise<DSPyModule>;
    /**
     * ML-enhanced compilation with detailed results
     */
    compileML(student: DSPyModule, options?: any): Promise<MIPROv2MLResult>;
    /**
     * Multi-objective optimization using battle-tested algorithms
     */
    private performMultiObjectiveOptimization;
    /**
     * Bayesian optimization for fine-tuning using Gaussian Process
     */
    private performBayesianOptimization;
    /**
     * Analyze optimization patterns using clustering and pattern recognition
     */
    private analyzeOptimizationPatterns;
    /**
     * Statistical validation using t-tests, ANOVA, and regression analysis
     */
    private performStatisticalValidation;
    private selectBestSolution;
    private evaluateAccuracy;
    private evaluateSpeed;
    private evaluateMemoryUsage;
    private paramsToConfig;
    private createOptimizedModule;
    private evaluateFinalPerformance;
    private generateRecommendations;
    private generateInsights;
    private getCurrentMemoryUsage;
    private analyzeConvergence;
}
/**
 * Factory function to create MIPROv2ML with sensible defaults
 */
export declare function createMIPROv2ML(config?: Partial<MIPROv2MLConfig>): MIPROv2ML;
//# sourceMappingURL=miprov2-ml.d.ts.map