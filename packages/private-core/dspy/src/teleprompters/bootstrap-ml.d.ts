/**
 * @fileoverview BootstrapML - ML-Enhanced Few-Shot Example Selection
 *
 * Advanced ML-enhanced version of Bootstrap teleprompter using battle-tested
 * Rust crates (smartcore, linfa, argmin, statrs) and npm packages for
 * intelligent example selection, diversity sampling, and adaptive bootstrapping.
 *
 * Key ML Enhancements:
 * - Intelligent example selection using clustering and diversity metrics
 * - Similarity-based sampling with vector embeddings
 * - Active learning for optimal example selection
 * - Statistical significance testing for example quality
 * - Adaptive sampling based on performance feedback
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { Teleprompter } from './teleprompter';
import { DSPyModule } from '../primitives/module';
import type { HypothesisTest } from '@claude-zen/neural-ml';
export interface BootstrapMLConfig {
    maxBootstrapExamples: number;
    maxLabeledExamples: number;
    maxRounds: number;
    maxErrors: number;
    useIntelligentSampling: boolean;
    useDiversitySampling: boolean;
    useActiveLearning: boolean;
    useStatisticalValidation: boolean;
    clusteringMethod: 'kmeans|hierarchical|dbscan';
    diversityMetric: 'cosine|euclidean|jaccard|hamming';
    embeddingDimension: number;
    samplingStrategy: 'uniform|weighted|adaptive';
    uncertaintySampling: boolean;
    queryStrategy: 'uncertainty|diversity|expected_error_reduction';
    acquisitionFunction: 'entropy|margin|confidence';
    significanceLevel: number;
    minSampleSize: number;
    bootstrapIterations: number;
    confidenceInterval: number;
    batchSize: number;
    parallelProcessing: boolean;
    cacheEmbeddings: boolean;
    enableProfiler: boolean;
    adaptiveSampling: {
        enabled: boolean;
        learningRate: number;
        decayRate: number;
        minLearningRate: number;
        adaptationThreshold: number;
    };
}
export interface BootstrapMLResult {
    optimizedModule: DSPyModule;
    bootstrappedExamples: any[];
    totalRounds: number;
    finalScore: number;
    exampleQuality: {
        diversityScore: number;
        representativenesScore: number;
        difficultyScore: number;
        statisticalSignificance: number;
    };
    selectionMetrics: {
        clusteringQuality: number;
        samplingEfficiency: number;
        activeLearningGain: number;
        convergenceRate: number;
    };
    executionTime: number;
    memoryUsage: number;
    cacheHitRate: number;
    statisticalAnalysis: {
        confidenceIntervals: Record<string, [number, number]>;
        hypothesisTests: HypothesisTest[];
        effectSizes: Record<string, number>;
        pValues: Record<string, number>;
    };
    optimizationInsights: {
        bestParameters: Record<string, any>;
        convergenceHistory: number[];
        learningCurve: number[];
        featureImportance: Record<string, number>;
    };
}
/**
 * BootstrapML - ML-Enhanced Few-Shot Example Selection
 *
 * Provides intelligent example selection using machine learning techniques
 * for more effective few-shot learning and bootstrapping.
 */
export declare class BootstrapML extends Teleprompter {
    private eventEmitter;
    private config;
    private logger;
    private mlEngine;
    private bayesianOptimizer;
    private patternLearner;
    private statisticalAnalyzer;
    private exampleEmbeddings;
    private clusterAssignments;
    private selectionHistory;
    private performanceHistory;
    private adaptiveWeights;
    constructor(config?: Partial<BootstrapMLConfig>);
    /**
     * Emit events through internal EventEmitter
     */
    private emit;
    /**
     * Initialize ML components with lazy loading
     */
    private initializeMLComponents;
    /**
     * Compile the module with ML-enhanced bootstrapping (base interface)
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
    compileML(student: DSPyModule, teacher?: DSPyModule, trainset?: any[], valset?: any[]): Promise<BootstrapMLResult>;
    /**
     * Generate embeddings for examples using ML engine
     */
    private generateExampleEmbeddings;
    /**
     * Perform clustering on embeddings
     */
    private performClustering;
    /**
     * Intelligent example selection using ML techniques
     */
    private selectExamples;
    /**
     * Active learning-based example selection
     */
    private selectExamplesActiveLearning;
    /**
     * Diversity-based example selection
     */
    private selectExamplesDiversitySampling;
    /**
     * Helper methods for ML operations
     */
    private extractTextFromExample;
    private calculateSimilarity;
    private cosineSimilarity;
    private euclideanDistance;
    /**
     * Generate real text embeddings using simple but effective TF-IDF approach
     */
    private generateTextEmbedding;
    /**
     * Simple hash function for consistent word mapping
     */
    private simpleHash;
    /**
     * Extract bigrams from word array for context features
     */
    private getBigrams;
    private calculateUncertaintyScores;
    private selectRepresentativeFromCluster;
    private selectExamplesIntelligent;
    private selectExamplesRandom;
    private trainRound;
    private evaluate;
    private checkConvergence;
    private updateAdaptiveWeights;
    private performStatisticalValidation;
    private generateOptimizationInsights;
    private calculateAverageDiversityScore;
    private calculateRepresentativenessScore;
    private calculateDifficultyScore;
    private calculateClusteringQuality;
    private calculateSamplingEfficiency;
    private calculateActiveLearningGain;
    private calculateDiversityScore;
    private getMemoryUsage;
    private calculateCacheHitRate;
}
/**
 * Factory function to create BootstrapML teleprompter
 */
export declare function createBootstrapML(config?: Partial<BootstrapMLConfig>): BootstrapML;
//# sourceMappingURL=bootstrap-ml.d.ts.map