/**
 * @fileoverview Smart Neural Coordinator - Intelligent Neural Backend System
 *
 * Advanced neural backend system with intelligent model selection, fallback chains,
 * and performance optimization. Implements single primary model strategy with
 * smart caching and graceful degradation.
 *
 * Key Features:
 * - Single primary model (all-mpnet-base-v2) for optimal quality/performance balance
 * - Intelligent fallback chain (transformers → brain.js → basic features)
 * - Smart caching system with performance-based eviction
 * - Optional OpenAI upgrade for premium quality
 * - Graceful degradation if models fail to load
 * - Comprehensive performance monitoring and telemetry
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
export interface NeuralBackendConfig {
    /** Primary model strategy */
    primaryModel: 'all-mpnet-base-v2' | 'all-MiniLM-L6-v2' | 'custom';
    /** Enable smart fallback chain */
    enableFallbacks: boolean;
    /** Cache configuration */
    cache: {
        maxSize: number;
        ttlMs: number;
        performanceBasedEviction: boolean;
    };
    /** Model loading configuration */
    loading: {
        timeoutMs: number;
        retryAttempts: number;
        lazyLoading: boolean;
    };
    /** Optional premium features */
    premium?: {
        openaiApiKey?: string;
        enableOpenaiUpgrade: boolean;
        qualityThreshold: number;
    };
    /** Performance optimization */
    performance: {
        batchSize: number;
        maxConcurrency: number;
        enableProfiling: boolean;
        thresholds?: {
            maxLatency: number;
            minConfidence: number;
            maxRetries: number;
        };
    };
}
/**
 * Phase 1: Embedding Generation
 */
export interface NeuralEmbeddingRequest {
    text: string;
    context?: string;
    priority?: 'low' | 'medium' | 'high';
    qualityLevel?: 'basic' | 'standard' | 'premium';
    cacheKey?: string;
}
export interface NeuralEmbeddingResult {
    success: boolean;
    embedding: number[];
    confidence: number;
    model: 'transformers' | 'brain-js' | 'basic' | 'openai';
    processingTime: number;
    fromCache: boolean;
    qualityScore: number;
    fallbacksUsed?: string[];
    error?: string;
    metadata: {
        model: string;
        processingTime: number;
        fromCache: boolean;
        priority?: 'low' | 'medium' | 'high';
        qualityLevel?: 'basic' | 'standard' | 'premium';
        context?: string;
        confidence: number;
        qualityScore: number;
    };
}
/**
 * Phase 2: Classification Phase
 */
export interface NeuralClassificationRequest {
    text: string;
    taskType: 'sentiment' | 'intent' | 'category' | 'toxicity' | 'language' | 'custom';
    categories?: string[];
    context?: string;
    priority?: 'low' | 'medium' | 'high';
    qualityLevel?: 'basic' | 'standard' | 'premium';
    confidenceThreshold?: number;
    cacheKey?: string;
}
export interface NeuralClassificationResult {
    success: boolean;
    classification: {
        label: string;
        confidence: number;
        scores: Record<string, number>;
    };
    model: 'transformers' | 'brain-js' | 'basic' | 'openai';
    processingTime: number;
    fromCache: boolean;
    qualityScore: number;
    fallbacksUsed?: string[];
    error?: string;
    metadata: {
        taskType: string;
        model: string;
        processingTime: number;
        fromCache: boolean;
        priority?: 'low' | 'medium' | 'high';
        qualityLevel?: 'basic' | 'standard' | 'premium';
        context?: string;
        confidenceThreshold?: number;
        qualityScore: number;
    };
}
/**
 * Phase 3: Generation Phase
 */
export interface NeuralGenerationRequest {
    prompt: string;
    taskType: 'completion' | 'summarization' | 'translation' | 'paraphrase' | 'creative' | 'code' | 'custom';
    maxLength?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    context?: string;
    priority?: 'low' | 'medium' | 'high';
    qualityLevel?: 'basic' | 'standard' | 'premium';
    cacheKey?: string;
    stopSequences?: string[];
}
export interface NeuralGenerationResult {
    success: boolean;
    generated: {
        text: string;
        finishReason: 'completed' | 'length' | 'stop_sequence' | 'error';
        tokensGenerated: number;
        alternatives?: string[];
    };
    model: 'transformers' | 'brain-js' | 'basic' | 'openai';
    processingTime: number;
    fromCache: boolean;
    qualityScore: number;
    fallbacksUsed?: string[];
    error?: string;
    metadata: {
        taskType: string;
        model: string;
        processingTime: number;
        fromCache: boolean;
        priority?: 'low' | 'medium' | 'high';
        qualityLevel?: 'basic' | 'standard' | 'premium';
        context?: string;
        parameters: {
            maxLength?: number;
            temperature?: number;
            topP?: number;
            topK?: number;
        };
        qualityScore: number;
    };
}
/**
 * Phase 4: Vision Phase
 */
export interface NeuralVisionRequest {
    image: string | Buffer | ArrayBuffer;
    taskType: 'describe' | 'ocr' | 'classify' | 'detect_objects' | 'analyze_scene' | 'custom';
    prompt?: string;
    context?: string;
    priority?: 'low' | 'medium' | 'high';
    qualityLevel?: 'basic' | 'standard' | 'premium';
    maxTokens?: number;
    cacheKey?: string;
}
export interface NeuralVisionResult {
    success: boolean;
    vision: {
        description?: string;
        objects?: Array<{
            name: string;
            confidence: number;
            boundingBox?: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        }>;
        text?: string;
        classification?: {
            label: string;
            confidence: number;
            scores: Record<string, number>;
        };
        analysis?: Record<string, any>;
    };
    model: 'transformers' | 'brain-js' | 'basic' | 'openai';
    processingTime: number;
    fromCache: boolean;
    qualityScore: number;
    fallbacksUsed?: string[];
    error?: string;
    metadata: {
        taskType: string;
        model: string;
        processingTime: number;
        fromCache: boolean;
        priority?: 'low' | 'medium' | 'high';
        qualityLevel?: 'basic' | 'standard' | 'premium';
        context?: string;
        imageInfo?: {
            format: string;
            size: number;
            dimensions?: {
                width: number;
                height: number;
            };
        };
        qualityScore: number;
    };
}
/**
 * Phase 5: Other Neural Tasks
 */
export interface NeuralTaskRequest {
    taskType: 'question_answering' | 'similarity' | 'clustering' | 'anomaly_detection' | 'feature_extraction' | 'custom';
    input: {
        text?: string;
        texts?: string[];
        question?: string;
        context?: string;
        data?: any[];
        reference?: string;
    };
    parameters?: {
        threshold?: number;
        topK?: number;
        algorithm?: string;
        metric?: 'cosine' | 'euclidean' | 'manhattan' | 'jaccard';
        clusterCount?: number;
        [key: string]: any;
    };
    priority?: 'low' | 'medium' | 'high';
    qualityLevel?: 'basic' | 'standard' | 'premium';
    cacheKey?: string;
}
export interface NeuralTaskResult {
    success: boolean;
    result: {
        answer?: {
            text: string;
            confidence: number;
            span?: {
                start: number;
                end: number;
            };
        };
        similarity?: {
            score: number;
            metric: string;
            comparison: string;
        };
        clusters?: Array<{
            id: number;
            centroid: number[];
            members: any[];
            size: number;
        }>;
        anomalies?: Array<{
            index: number;
            score: number;
            data: any;
        }>;
        features?: {
            numerical: number[];
            categorical: Record<string, any>;
            engineered: Record<string, number>;
        };
        custom?: Record<string, any>;
    };
    model: 'transformers' | 'brain-js' | 'basic' | 'openai';
    processingTime: number;
    fromCache: boolean;
    qualityScore: number;
    fallbacksUsed?: string[];
    error?: string;
    metadata: {
        taskType: string;
        model: string;
        processingTime: number;
        fromCache: boolean;
        priority?: 'low' | 'medium' | 'high';
        qualityLevel?: 'basic' | 'standard' | 'premium';
        parameters?: Record<string, any>;
        qualityScore: number;
    };
}
export interface CacheEntry {
    embedding: number[];
    confidence: number;
    model: string;
    timestamp: number;
    accessCount: number;
    lastAccessTime: number;
    performanceScore: number;
}
export interface ModelStatus {
    name: string;
    loaded: boolean;
    loading: boolean;
    error: string | null;
    loadingTime?: number;
    errorMessage?: string;
    lastUsed?: number;
    successRate: number;
    averageLatency: number;
}
/**
 * Smart Neural Coordinator - Intelligent neural backend system
 *
 * Provides high-quality neural embeddings through intelligent model selection,
 * smart caching, and graceful fallback chains. Optimized for production use
 * with comprehensive monitoring and telemetry integration.
 *
 * @example
 * ```typescript
 * const coordinator = new SmartNeuralCoordinator({
 *   primaryModel: 'all-mpnet-base-v2',
 *   enableFallbacks: true,
 *   cache: { maxSize: 10000, ttlMs: 3600000, performanceBasedEviction: true }
 * });
 *
 * await coordinator.initialize();
 *
 * const result = await coordinator.generateEmbedding({
 *   text: "Machine learning is transforming software development",
 *   qualityLevel: 'standard',
 *   priority: 'high'
 * });
 *
 * console.log(`Embedding: ${result.embedding.length}D, Quality: ${result.qualityScore}`);
 * ```
 */
export declare class SmartNeuralCoordinator {
    private logger;
    private config;
    private initialized;
    private transformerModel;
    private brainJsNetwork;
    private onnxSession;
    private openaiClient;
    private modelStatus;
    private embeddingCache;
    private cacheStats;
    private performanceMetrics;
    constructor(config?: Partial<NeuralBackendConfig>);
    /**
     * Initialize the Smart Neural Coordinator with intelligent model loading
     */
    initialize(): Promise<void>;
    /**
     * Generate neural embeddings with intelligent model selection and fallbacks
     */
    generateEmbedding(request: NeuralEmbeddingRequest): Promise<NeuralEmbeddingResult>;
    /**
     * Classify text using intelligent model selection and fallback chains
     */
    classifyText(request: NeuralClassificationRequest): Promise<NeuralClassificationResult>;
    /**
     * Generate text using intelligent model selection and fallback chains
     */
    generateText(request: NeuralGenerationRequest): Promise<NeuralGenerationResult>;
    /**
     * Process images using intelligent model selection and fallback chains
     */
    processImage(request: NeuralVisionRequest): Promise<NeuralVisionResult>;
    /**
     * Perform various neural tasks using intelligent model selection and fallback chains
     */
    performNeuralTask(request: NeuralTaskRequest): Promise<NeuralTaskResult>;
    /**
     * Get comprehensive neural coordinator statistics and insights
     */
    getCoordinatorStats(): {
        initialized: boolean;
        configuration: {
            primaryModel: string;
            enableFallbacks: boolean;
            enableCaching: boolean;
            maxCacheSize: number;
            performanceThresholds?: {
                maxLatency: number;
                minAccuracy: number;
            };
        };
        models: {
            primary: {
                status: 'ready' | 'loading' | 'error' | 'not_loaded';
                model?: string;
                lastUsed?: number;
            };
            fallbacks: ModelStatus[];
        };
        performance: {
            totalRequests: number;
            successfulRequests: number;
            failedRequests: number;
            averageLatency: number;
            minLatency: number;
            maxLatency: number;
        };
        cache: {
            size: number;
            hits: number;
            misses: number;
            evictions: number;
        };
        fallbackChain: string[];
        systemHealth: {
            primaryModelReady: boolean;
            fallbacksAvailable: number;
            cacheEfficiency: number;
            averageQuality: number;
        };
    };
    /**
     * Clear caches and reset coordinator state
     */
    clearCache(): Promise<void>;
    /**
     * Shutdown coordinator and cleanup resources
     */
    shutdown(): Promise<void>;
    private initializeModelStatus;
    private initializeLazyLoading;
    private initializeEagerLoading;
    private initializeOpenAI;
    private loadTransformersModel;
    private loadBrainJsModel;
    private loadOnnxModel;
    private startPerformanceMonitoring;
    private generateNewEmbedding;
    private generateTransformersEmbedding;
    private generateBrainJsEmbedding;
    private generateOpenAIEmbedding;
    private generateBasicEmbedding;
    private textToFeatures;
    private generateCacheKey;
    private getCachedEmbedding;
    private cacheEmbedding;
    private performCacheEviction;
    private calculatePerformanceScore;
    private updateModelMetrics;
    private updatePerformanceMetrics;
    private performPerformanceOptimization;
    private isPrimaryModelReady;
    private getLoadedModelsCount;
    private getAvailableFallbacksCount;
    private calculateCacheEfficiency;
    private calculateAverageQuality;
    private hashString;
    private generateClassificationCacheKey;
    private getCachedClassification;
    private cacheClassification;
    private generateNewClassification;
    private generateTransformersClassification;
    private generateBrainJsClassification;
    private generateOpenAIClassification;
    private generateBasicClassification;
    private generateGenerationCacheKey;
    private getCachedGeneration;
    private cacheGeneration;
    private generateNewText;
    private generateVisionCacheKey;
    private analyzeImageInput;
    private hashImageData;
    private validateNeuralTaskRequest;
    private generateNeuralTaskCacheKey;
    private createClassificationErrorResult;
    private createGenerationErrorResult;
    private createVisionErrorResult;
    private createNeuralTaskErrorResult;
    private basicSentimentAnalysis;
    private basicLanguageDetection;
    private basicToxicityDetection;
    private classifySentiment;
    private classifyIntent;
    private classifyCategory;
    private classifyToxicity;
    private classifyLanguage;
    private classifyCustom;
    private convertToClassification;
    private buildClassificationSystemPrompt;
    private parseOpenAIClassificationResponse;
    private generateTransformersText;
    private generateBrainJsText;
    private generateOpenAIText;
    private generateBasicText;
    private createClassificationCacheResult;
    private recordClassificationMetrics;
    private recordClassificationError;
    private createClassificationFallbackResult;
    private getCachedVision;
    private cacheVision;
    private processNewImage;
    private createVisionCacheResult;
    private recordVisionMetrics;
    private recordVisionError;
    private createVisionFallbackResult;
    private getCachedNeuralTask;
    private cacheNeuralTask;
    private executeNewNeuralTask;
    private createNeuralTaskCacheResult;
    private recordNeuralTaskMetrics;
    private recordNeuralTaskError;
    private createNeuralTaskFallbackResult;
    private createGenerationCacheResult;
    private recordGenerationMetrics;
    private recordGenerationError;
    private createGenerationFallbackResult;
}
export default SmartNeuralCoordinator;
//# sourceMappingURL=smart-neural-coordinator.d.ts.map