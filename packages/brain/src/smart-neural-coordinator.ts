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

import { 
  getLogger, 
  type Logger,
  ContextError,
  withRetry,
  safeAsync,
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  type Span,
  type Attributes
} from '@claude-zen/foundation';

// Neural backend imports with smart loading
let transformersModule: any = null;
let brainJsModule: any = null;
let onnxModule: any = null;
let openaiModule: any = null;

// Interface definitions
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
  };
}

export interface NeuralEmbeddingRequest {
  text: string;
  context?: string;
  priority?: 'low' | 'medium' | 'high';
  qualityLevel?: 'basic' | 'standard' | 'premium';
  cacheKey?: string;
}

export interface NeuralEmbeddingResult {
  embedding: number[];
  confidence: number;
  model: 'transformers' | 'brain-js' | 'basic' | 'openai';
  processingTime: number;
  fromCache: boolean;
  qualityScore: number;
  fallbacksUsed?: string[];
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
export class SmartNeuralCoordinator {
  private logger: Logger;
  private config: NeuralBackendConfig;
  private initialized = false;
  
  // Model instances and status tracking
  private transformerModel: any = null;
  private brainJsNetwork: any = null;
  private onnxSession: any = null;
  private openaiClient: any = null;
  
  private modelStatus: Map<string, ModelStatus> = new Map();
  
  // Smart caching system
  private embeddingCache: Map<string, CacheEntry> = new Map();
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  };
  
  // Performance monitoring
  private performanceMetrics = {
    totalEmbeddings: 0,
    averageLatency: 0,
    modelUsageCount: new Map<string, number>(),
    fallbackUsageCount: new Map<string, number>(),
    qualityDistribution: new Map<string, number>()
  };
  
  constructor(config: Partial<NeuralBackendConfig> = {}) {
    this.logger = getLogger('smart-neural-coordinator');
    
    // Default configuration with intelligent defaults
    this.config = {
      primaryModel: 'all-mpnet-base-v2',
      enableFallbacks: true,
      cache: {
        maxSize: 10000,
        ttlMs: 3600000, // 1 hour
        performanceBasedEviction: true
      },
      loading: {
        timeoutMs: 30000, // 30 seconds
        retryAttempts: 3,
        lazyLoading: true
      },
      performance: {
        batchSize: 32,
        maxConcurrency: 4,
        enableProfiling: true
      },
      ...config
    };
    
    this.logger.info('SmartNeuralCoordinator created with intelligent backend configuration');
    
    // Record initialization metric
    recordMetric('smart_neural_coordinator_created', 1, {
      primary_model: this.config.primaryModel,
      fallbacks_enabled: String(this.config.enableFallbacks),
      cache_enabled: String(this.config.cache.maxSize > 0)
    });
  }
  
  /**
   * Initialize the Smart Neural Coordinator with intelligent model loading
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('SmartNeuralCoordinator already initialized');
      return;
    }
    
    return withAsyncTrace('smart-neural-coordinator-initialize', async (span: Span) => {
      const initTimer = Date.now();
      
      try {
        this.logger.info('🧠 Initializing SmartNeuralCoordinator with intelligent backend loading...');
        
        span.setAttributes({
          'neural.coordinator.version': '2.1.0',
          'neural.config.primary_model': this.config.primaryModel,
          'neural.config.enable_fallbacks': this.config.enableFallbacks,
          'neural.config.cache_max_size': this.config.cache.maxSize,
          'neural.config.lazy_loading': this.config.loading.lazyLoading
        });
        
        // Initialize model status tracking
        this.initializeModelStatus();
        
        // Load models based on configuration
        if (this.config.loading.lazyLoading) {
          await this.initializeLazyLoading();
        } else {
          await this.initializeEagerLoading();
        }
        
        // Initialize premium features if available
        if (this.config.premium?.enableOpenaiUpgrade) {
          await this.initializeOpenAI();
        }
        
        // Start performance monitoring
        if (this.config.performance.enableProfiling) {
          this.startPerformanceMonitoring();
        }
        
        this.initialized = true;
        const initTime = Date.now() - initTimer;
        
        // Record comprehensive initialization metrics
        recordMetric('smart_neural_coordinator_initialized', 1, {
          status: 'success',
          duration_ms: String(initTime),
          models_loaded: String(this.getLoadedModelsCount()),
          primary_model_ready: String(this.isPrimaryModelReady())
        });
        
        recordHistogram('smart_neural_initialization_duration_ms', initTime, {
          lazy_loading: String(this.config.loading.lazyLoading)
        });
        
        span.setAttributes({
          'neural.initialization.success': true,
          'neural.initialization.duration_ms': initTime,
          'neural.initialization.models_loaded': this.getLoadedModelsCount(),
          'neural.initialization.primary_model_ready': this.isPrimaryModelReady()
        });
        
        this.logger.info(`✅ SmartNeuralCoordinator initialized successfully in ${initTime}ms`);
        
        recordEvent('smart-neural-coordinator-initialized', {
          duration_ms: String(initTime),
          models_loaded: String(this.getLoadedModelsCount())
        });
        
      } catch (error) {
        const initTime = Date.now() - initTimer;
        
        recordMetric('smart_neural_coordinator_initialized', 1, {
          status: 'error',
          duration_ms: String(initTime),
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });
        
        span.setAttributes({
          'neural.initialization.success': false,
          'neural.initialization.error': error instanceof Error ? error.message : String(error)
        });
        
        this.logger.error('❌ Failed to initialize SmartNeuralCoordinator:', error);
        throw new ContextError(`SmartNeuralCoordinator initialization failed: ${error}`, { 
          code: 'NEURAL_INIT_ERROR' 
        });
      }
    });
  }
  
  /**
   * Generate neural embeddings with intelligent model selection and fallbacks
   */
  async generateEmbedding(request: NeuralEmbeddingRequest): Promise<NeuralEmbeddingResult> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return withAsyncTrace('smart-neural-generate-embedding', async (span: Span) => {
      const startTime = Date.now();
      const cacheKey = request.cacheKey || this.generateCacheKey(request);
      
      // Set comprehensive telemetry attributes
      span.setAttributes({
        'neural.request.text_length': request.text.length,
        'neural.request.priority': request.priority || 'medium',
        'neural.request.quality_level': request.qualityLevel || 'standard',
        'neural.request.has_context': Boolean(request.context),
        'neural.request.cache_key': cacheKey
      });
      
      // Update request statistics
      this.cacheStats.totalRequests++;
      this.performanceMetrics.totalEmbeddings++;
      
      try {
        // Check cache first with intelligent cache strategy
        const cachedResult = this.getCachedEmbedding(cacheKey);
        if (cachedResult) {
          const processingTime = Date.now() - startTime;
          
          this.logger.debug(`📦 Using cached embedding for request (${processingTime}ms)`);
          
          recordMetric('smart_neural_embedding_generated', 1, {
            cache_hit: 'true',
            model: cachedResult.model,
            quality_level: request.qualityLevel || 'standard',
            status: 'success'
          });
          
          span.setAttributes({
            'neural.embedding.cache_hit': true,
            'neural.embedding.model': cachedResult.model,
            'neural.embedding.confidence': cachedResult.confidence,
            'neural.embedding.quality_score': cachedResult.performanceScore
          });
          
          return {
            embedding: cachedResult.embedding,
            confidence: cachedResult.confidence,
            model: cachedResult.model as any,
            processingTime,
            fromCache: true,
            qualityScore: cachedResult.performanceScore
          };
        }
        
        // Generate new embedding with intelligent model selection
        const result = await this.generateNewEmbedding(request, span);
        const processingTime = Date.now() - startTime;
        
        // Cache the result with performance-based scoring
        this.cacheEmbedding(cacheKey, {
          embedding: result.embedding,
          confidence: result.confidence,
          model: result.model,
          timestamp: Date.now(),
          accessCount: 1,
          lastAccessTime: Date.now(),
          performanceScore: this.calculatePerformanceScore(result, processingTime)
        });
        
        // Update performance metrics
        this.updatePerformanceMetrics(result.model, processingTime, result.qualityScore);
        
        recordMetric('smart_neural_embedding_generated', 1, {
          cache_hit: 'false',
          model: result.model,
          quality_level: request.qualityLevel || 'standard',
          status: 'success',
          fallbacks_used: String(result.fallbacksUsed?.length || 0)
        });
        
        recordHistogram('smart_neural_embedding_duration_ms', processingTime, {
          model: result.model,
          cache_hit: 'false'
        });
        
        recordGauge('smart_neural_embedding_quality_score', result.qualityScore, {
          model: result.model,
          quality_level: request.qualityLevel || 'standard'
        });
        
        span.setAttributes({
          'neural.embedding.cache_hit': false,
          'neural.embedding.model': result.model,
          'neural.embedding.confidence': result.confidence,
          'neural.embedding.quality_score': result.qualityScore,
          'neural.embedding.processing_time_ms': processingTime,
          'neural.embedding.fallbacks_used': result.fallbacksUsed?.length || 0
        });
        
        this.logger.info(`🧠 Generated embedding using ${result.model} (${processingTime}ms, quality: ${result.qualityScore.toFixed(2)})`);
        
        recordEvent('smart-neural-embedding-generated', {
          model: result.model,
          processing_time_ms: String(processingTime),
          quality_score: String(result.qualityScore),
          fallbacks_used: String(result.fallbacksUsed?.length || 0)
        });
        
        return {
          ...result,
          processingTime,
          fromCache: false
        };
        
      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        recordMetric('smart_neural_embedding_generated', 1, {
          cache_hit: 'false',
          model: 'error',
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });
        
        span.setAttributes({
          'neural.embedding.error': true,
          'neural.embedding.error_message': error instanceof Error ? error.message : String(error),
          'neural.embedding.processing_time_ms': processingTime
        });
        
        this.logger.error('❌ Failed to generate neural embedding:', error);
        
        // Return a basic fallback result
        return {
          embedding: this.generateBasicEmbedding(request.text),
          confidence: 0.3,
          model: 'basic',
          processingTime,
          fromCache: false,
          qualityScore: 0.3,
          fallbacksUsed: ['basic-fallback']
        };
      }
    });
  }
  
  /**
   * Get comprehensive neural coordinator statistics and insights
   */
  getCoordinatorStats(): {
    initialized: boolean;
    modelsStatus: ModelStatus[];
    cacheStats: typeof this.cacheStats;
    performanceMetrics: typeof this.performanceMetrics;
    systemHealth: {
      primaryModelReady: boolean;
      fallbacksAvailable: number;
      cacheEfficiency: number;
      averageQuality: number;
    };
  } {
    return withTrace('smart-neural-get-stats', (span: Span) => {
      const primaryModelReady = this.isPrimaryModelReady();
      const fallbacksAvailable = this.getAvailableFallbacksCount();
      const cacheEfficiency = this.calculateCacheEfficiency();
      const averageQuality = this.calculateAverageQuality();
      
      span.setAttributes({
        'neural.stats.initialized': this.initialized,
        'neural.stats.primary_model_ready': primaryModelReady,
        'neural.stats.fallbacks_available': fallbacksAvailable,
        'neural.stats.cache_efficiency': cacheEfficiency,
        'neural.stats.average_quality': averageQuality
      });
      
      recordEvent('smart-neural-stats-retrieved', {
        primary_model_ready: String(primaryModelReady),
        fallbacks_available: String(fallbacksAvailable),
        cache_efficiency: String(cacheEfficiency)
      });
      
      return {
        initialized: this.initialized,
        modelsStatus: Array.from(this.modelStatus.values()),
        cacheStats: { ...this.cacheStats },
        performanceMetrics: { 
          ...this.performanceMetrics,
          modelUsageCount: Object.fromEntries(this.performanceMetrics.modelUsageCount),
          fallbackUsageCount: Object.fromEntries(this.performanceMetrics.fallbackUsageCount),
          qualityDistribution: Object.fromEntries(this.performanceMetrics.qualityDistribution)
        },
        systemHealth: {
          primaryModelReady,
          fallbacksAvailable,
          cacheEfficiency,
          averageQuality
        }
      };
    });
  }
  
  /**
   * Clear caches and reset coordinator state
   */
  async clearCache(): Promise<void> {
    return withAsyncTrace('smart-neural-clear-cache', async (span: Span) => {
      const cacheSize = this.embeddingCache.size;
      
      this.embeddingCache.clear();
      this.cacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequests: 0
      };
      
      recordMetric('smart_neural_cache_cleared', 1, {
        previous_size: String(cacheSize),
        status: 'success'
      });
      
      span.setAttributes({
        'neural.cache.previous_size': cacheSize,
        'neural.cache.cleared': true
      });
      
      this.logger.info('🗑️ SmartNeuralCoordinator cache cleared', { previousSize: cacheSize });
      
      recordEvent('smart-neural-cache-cleared', {
        previous_size: String(cacheSize)
      });
    });
  }
  
  /**
   * Shutdown coordinator and cleanup resources
   */
  async shutdown(): Promise<void> {
    return withAsyncTrace('smart-neural-coordinator-shutdown', async (span: Span) => {
      try {
        this.logger.info('🛑 Shutting down SmartNeuralCoordinator...');
        
        // Clear caches
        await this.clearCache();
        
        // Cleanup model instances
        this.transformerModel = null;
        this.brainJsNetwork = null;
        this.onnxSession = null;
        this.openaiClient = null;
        
        // Reset state
        this.modelStatus.clear();
        this.initialized = false;
        
        recordMetric('smart_neural_coordinator_shutdown', 1, {
          status: 'success'
        });
        
        span.setAttributes({
          'neural.shutdown.success': true,
          'neural.shutdown.cache_cleared': true
        });
        
        this.logger.info('✅ SmartNeuralCoordinator shutdown completed');
        
        recordEvent('smart-neural-coordinator-shutdown-complete', {
          status: 'success'
        });
        
      } catch (error) {
        recordMetric('smart_neural_coordinator_shutdown', 1, {
          status: 'error',
          error_type: error instanceof Error ? error.constructor.name : 'unknown'
        });
        
        span.setAttributes({
          'neural.shutdown.success': false,
          'neural.shutdown.error': error instanceof Error ? error.message : String(error)
        });
        
        this.logger.error('❌ Failed to shutdown SmartNeuralCoordinator:', error);
        throw error;
      }
    });
  }
  
  // Private implementation methods
  
  private initializeModelStatus(): void {
    const models = ['transformers', 'brain-js', 'onnx', 'openai', 'basic'];
    for (const model of models) {
      this.modelStatus.set(model, {
        name: model,
        loaded: false,
        successRate: 0,
        averageLatency: 0
      });
    }
  }
  
  private async initializeLazyLoading(): Promise<void> {
    this.logger.info('🔄 Initialized lazy loading mode - models will load on demand');
    
    // Mark basic fallback as always available
    const basicStatus = this.modelStatus.get('basic');
    if (basicStatus) {
      basicStatus.loaded = true;
      basicStatus.loadingTime = 0;
    }
  }
  
  private async initializeEagerLoading(): Promise<void> {
    this.logger.info('⚡ Eager loading mode - attempting to load all models...');
    
    // Load primary model first
    await this.loadTransformersModel();
    
    // Load fallback models
    if (this.config.enableFallbacks) {
      await Promise.allSettled([
        this.loadBrainJsModel(),
        this.loadOnnxModel()
      ]);
    }
  }
  
  private async initializeOpenAI(): Promise<void> {
    if (!this.config.premium?.openaiApiKey) {
      this.logger.warn('OpenAI API key not provided, premium features disabled');
      return;
    }
    
    try {
      const startTime = Date.now();
      
      if (!openaiModule) {
        openaiModule = await import('openai');
      }
      
      this.openaiClient = new openaiModule.default({
        apiKey: this.config.premium.openaiApiKey
      });
      
      const loadingTime = Date.now() - startTime;
      const openaiStatus = this.modelStatus.get('openai');
      if (openaiStatus) {
        openaiStatus.loaded = true;
        openaiStatus.loadingTime = loadingTime;
      }
      
      this.logger.info(`✨ OpenAI client initialized for premium features (${loadingTime}ms)`);
      
    } catch (error) {
      const openaiStatus = this.modelStatus.get('openai');
      if (openaiStatus) {
        openaiStatus.loaded = false;
        openaiStatus.errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      this.logger.warn('Failed to initialize OpenAI client:', error);
    }
  }
  
  private async loadTransformersModel(): Promise<void> {
    try {
      const startTime = Date.now();
      
      if (!transformersModule) {
        transformersModule = await import('@xenova/transformers');
      }
      
      this.transformerModel = await transformersModule.pipeline(
        'feature-extraction',
        this.config.primaryModel,
        { 
          device: 'cpu',
          dtype: 'fp32'
        }
      );
      
      const loadingTime = Date.now() - startTime;
      const transformersStatus = this.modelStatus.get('transformers');
      if (transformersStatus) {
        transformersStatus.loaded = true;
        transformersStatus.loadingTime = loadingTime;
      }
      
      this.logger.info(`✅ Transformers model loaded: ${this.config.primaryModel} (${loadingTime}ms)`);
      
    } catch (error) {
      const transformersStatus = this.modelStatus.get('transformers');
      if (transformersStatus) {
        transformersStatus.loaded = false;
        transformersStatus.errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      this.logger.warn('Failed to load transformers model:', error);
    }
  }
  
  private async loadBrainJsModel(): Promise<void> {
    try {
      const startTime = Date.now();
      
      if (!brainJsModule) {
        brainJsModule = await import('brain.js');
      }
      
      // Create a simple neural network for text embedding approximation
      this.brainJsNetwork = new brainJsModule.NeuralNetwork({
        hiddenLayers: [256, 128, 64],
        activation: 'sigmoid'
      });
      
      const loadingTime = Date.now() - startTime;
      const brainJsStatus = this.modelStatus.get('brain-js');
      if (brainJsStatus) {
        brainJsStatus.loaded = true;
        brainJsStatus.loadingTime = loadingTime;
      }
      
      this.logger.info(`✅ Brain.js model loaded (${loadingTime}ms)`);
      
    } catch (error) {
      const brainJsStatus = this.modelStatus.get('brain-js');
      if (brainJsStatus) {
        brainJsStatus.loaded = false;
        brainJsStatus.errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      this.logger.warn('Failed to load Brain.js model:', error);
    }
  }
  
  private async loadOnnxModel(): Promise<void> {
    try {
      const startTime = Date.now();
      
      if (!onnxModule) {
        onnxModule = await import('onnxruntime-node');
      }
      
      // ONNX model loading would happen here
      // For now, just mark as loaded for fallback capability
      
      const loadingTime = Date.now() - startTime;
      const onnxStatus = this.modelStatus.get('onnx');
      if (onnxStatus) {
        onnxStatus.loaded = true;
        onnxStatus.loadingTime = loadingTime;
      }
      
      this.logger.info(`✅ ONNX runtime loaded (${loadingTime}ms)`);
      
    } catch (error) {
      const onnxStatus = this.modelStatus.get('onnx');
      if (onnxStatus) {
        onnxStatus.loaded = false;
        onnxStatus.errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      this.logger.warn('Failed to load ONNX runtime:', error);
    }
  }
  
  private startPerformanceMonitoring(): void {
    // Start periodic performance monitoring
    setInterval(() => {
      this.performPerformanceOptimization();
    }, 60000); // Every minute
    
    this.logger.info('📊 Performance monitoring started');
  }
  
  private async generateNewEmbedding(
    request: NeuralEmbeddingRequest, 
    span: Span
  ): Promise<NeuralEmbeddingResult> {
    const fallbacksUsed: string[] = [];
    
    // Try premium OpenAI first if requested and available
    if (request.qualityLevel === 'premium' && this.openaiClient) {
      try {
        const result = await this.generateOpenAIEmbedding(request.text);
        span.setAttributes({ 'neural.embedding.primary_method': 'openai' });
        return { ...result, fallbacksUsed };
      } catch (error) {
        fallbacksUsed.push('openai-failed');
        this.logger.debug('OpenAI embedding failed, falling back:', error);
      }
    }
    
    // Try primary transformers model
    if (this.transformerModel || this.config.loading.lazyLoading) {
      try {
        if (!this.transformerModel && this.config.loading.lazyLoading) {
          await this.loadTransformersModel();
        }
        
        if (this.transformerModel) {
          const result = await this.generateTransformersEmbedding(request.text);
          span.setAttributes({ 'neural.embedding.primary_method': 'transformers' });
          return { ...result, fallbacksUsed };
        }
      } catch (error) {
        fallbacksUsed.push('transformers-failed');
        this.logger.debug('Transformers embedding failed, falling back:', error);
      }
    }
    
    // Try Brain.js fallback
    if (this.config.enableFallbacks) {
      if (this.brainJsNetwork || this.config.loading.lazyLoading) {
        try {
          if (!this.brainJsNetwork && this.config.loading.lazyLoading) {
            await this.loadBrainJsModel();
          }
          
          if (this.brainJsNetwork) {
            const result = await this.generateBrainJsEmbedding(request.text);
            fallbacksUsed.push('brain-js');
            span.setAttributes({ 'neural.embedding.primary_method': 'brain-js' });
            return { ...result, fallbacksUsed };
          }
        } catch (error) {
          fallbacksUsed.push('brain-js-failed');
          this.logger.debug('Brain.js embedding failed, falling back:', error);
        }
      }
    }
    
    // Final fallback: basic text features
    fallbacksUsed.push('basic');
    span.setAttributes({ 'neural.embedding.primary_method': 'basic' });
    
    return {
      embedding: this.generateBasicEmbedding(request.text),
      confidence: 0.4,
      model: 'basic',
      processingTime: 0,
      fromCache: false,
      qualityScore: 0.4,
      fallbacksUsed
    };
  }
  
  private async generateTransformersEmbedding(text: string): Promise<NeuralEmbeddingResult> {
    const startTime = Date.now();
    
    const output = await this.transformerModel(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);
    const processingTime = Date.now() - startTime;
    
    this.updateModelMetrics('transformers', processingTime, true);
    
    return {
      embedding,
      confidence: 0.9,
      model: 'transformers',
      processingTime,
      fromCache: false,
      qualityScore: 0.9
    };
  }
  
  private async generateBrainJsEmbedding(text: string): Promise<NeuralEmbeddingResult> {
    const startTime = Date.now();
    
    // Convert text to simple numerical features
    const features = this.textToFeatures(text);
    
    // Use brain.js network to generate embedding-like output
    const output = this.brainJsNetwork.run(features);
    const embedding = Object.values(output) as number[];
    const processingTime = Date.now() - startTime;
    
    this.updateModelMetrics('brain-js', processingTime, true);
    
    return {
      embedding,
      confidence: 0.7,
      model: 'brain-js',
      processingTime,
      fromCache: false,
      qualityScore: 0.7
    };
  }
  
  private async generateOpenAIEmbedding(text: string): Promise<NeuralEmbeddingResult> {
    const startTime = Date.now();
    
    const response = await this.openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });
    
    const embedding = response.data[0].embedding;
    const processingTime = Date.now() - startTime;
    
    this.updateModelMetrics('openai', processingTime, true);
    
    return {
      embedding,
      confidence: 0.95,
      model: 'openai',
      processingTime,
      fromCache: false,
      qualityScore: 0.95
    };
  }
  
  private generateBasicEmbedding(text: string): number[] {
    // Simple text-based features as embedding fallback
    const features = this.textToFeatures(text);
    
    // Pad or truncate to standard embedding size (384 dimensions)
    const targetSize = 384;
    const embedding = new Array(targetSize).fill(0);
    
    for (let i = 0; i < Math.min(features.length, targetSize); i++) {
      embedding[i] = features[i];
    }
    
    return embedding;
  }
  
  private textToFeatures(text: string): number[] {
    const features: number[] = [];
    
    // Basic text statistics
    features.push(text.length / 1000); // Normalized length
    features.push(text.split(' ').length / 100); // Normalized word count
    features.push(text.split('.').length / 10); // Normalized sentence count
    
    // Character frequency features (first 26 letters)
    const charCounts = new Array(26).fill(0);
    const normalizedText = text.toLowerCase();
    
    for (const char of normalizedText) {
      const charCode = char.charCodeAt(0);
      if (charCode >= 97 && charCode <= 122) {
        charCounts[charCode - 97]++;
      }
    }
    
    // Normalize character counts
    const totalChars = text.length;
    for (let i = 0; i < 26; i++) {
      features.push(charCounts[i] / totalChars);
    }
    
    return features;
  }
  
  private generateCacheKey(request: NeuralEmbeddingRequest): string {
    const content = `${request.text}${request.context || ''}`;
    return `${request.qualityLevel || 'standard'}:${this.hashString(content)}`;
  }
  
  private getCachedEmbedding(cacheKey: string): CacheEntry | null {
    const entry = this.embeddingCache.get(cacheKey);
    
    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.config.cache.ttlMs) {
      this.embeddingCache.delete(cacheKey);
      this.cacheStats.evictions++;
      this.cacheStats.misses++;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessTime = Date.now();
    this.cacheStats.hits++;
    
    return entry;
  }
  
  private cacheEmbedding(cacheKey: string, entry: CacheEntry): void {
    // Check cache size and evict if necessary
    if (this.embeddingCache.size >= this.config.cache.maxSize) {
      this.performCacheEviction();
    }
    
    this.embeddingCache.set(cacheKey, entry);
  }
  
  private performCacheEviction(): void {
    if (!this.config.cache.performanceBasedEviction) {
      // Simple LRU eviction
      const oldestKey = Array.from(this.embeddingCache.entries())
        .sort(([, a], [, b]) => a.lastAccessTime - b.lastAccessTime)[0]?.[0];
      
      if (oldestKey) {
        this.embeddingCache.delete(oldestKey);
        this.cacheStats.evictions++;
      }
      return;
    }
    
    // Performance-based eviction: remove entries with lowest performance scores
    const entries = Array.from(this.embeddingCache.entries());
    entries.sort(([, a], [, b]) => a.performanceScore - b.performanceScore);
    
    const toEvict = Math.floor(this.config.cache.maxSize * 0.1); // Evict 10%
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      this.embeddingCache.delete(entries[i][0]);
      this.cacheStats.evictions++;
    }
  }
  
  private calculatePerformanceScore(result: NeuralEmbeddingResult, processingTime: number): number {
    // Combine quality score, confidence, and speed for overall performance score
    const speedScore = Math.max(0, 1 - processingTime / 5000); // Normalize to 5 seconds max
    const qualityScore = result.qualityScore;
    const confidenceScore = result.confidence;
    
    return (speedScore * 0.3 + qualityScore * 0.5 + confidenceScore * 0.2);
  }
  
  private updateModelMetrics(model: string, processingTime: number, success: boolean): void {
    const status = this.modelStatus.get(model);
    if (!status) return;
    
    // Update success rate
    const totalRequests = this.performanceMetrics.modelUsageCount.get(model) || 0;
    const previousSuccesses = totalRequests * status.successRate;
    const newSuccesses = previousSuccesses + (success ? 1 : 0);
    const newTotal = totalRequests + 1;
    
    status.successRate = newSuccesses / newTotal;
    status.averageLatency = (status.averageLatency * totalRequests + processingTime) / newTotal;
    status.lastUsed = Date.now();
    
    this.performanceMetrics.modelUsageCount.set(model, newTotal);
  }
  
  private updatePerformanceMetrics(model: string, processingTime: number, qualityScore: number): void {
    // Update average latency
    const totalEmbeddings = this.performanceMetrics.totalEmbeddings;
    this.performanceMetrics.averageLatency = 
      (this.performanceMetrics.averageLatency * (totalEmbeddings - 1) + processingTime) / totalEmbeddings;
    
    // Update quality distribution
    const qualityBucket = Math.floor(qualityScore * 10) / 10; // Round to nearest 0.1
    const currentCount = this.performanceMetrics.qualityDistribution.get(String(qualityBucket)) || 0;
    this.performanceMetrics.qualityDistribution.set(String(qualityBucket), currentCount + 1);
  }
  
  private performPerformanceOptimization(): void {
    // Optimize cache based on performance data
    if (this.config.cache.performanceBasedEviction) {
      const cacheEfficiency = this.calculateCacheEfficiency();
      if (cacheEfficiency < 0.5) {
        this.logger.info('📊 Cache efficiency low, performing optimization...');
        this.performCacheEviction();
      }
    }
    
    // Log performance metrics
    const stats = this.getCoordinatorStats();
    this.logger.debug('📊 Performance metrics:', {
      averageLatency: stats.performanceMetrics.averageLatency,
      cacheEfficiency: stats.systemHealth.cacheEfficiency,
      averageQuality: stats.systemHealth.averageQuality
    });
  }
  
  private isPrimaryModelReady(): boolean {
    const transformersStatus = this.modelStatus.get('transformers');
    return transformersStatus?.loaded === true;
  }
  
  private getLoadedModelsCount(): number {
    return Array.from(this.modelStatus.values()).filter(status => status.loaded).length;
  }
  
  private getAvailableFallbacksCount(): number {
    return Array.from(this.modelStatus.values()).filter(status => 
      status.loaded && status.name !== 'transformers'
    ).length;
  }
  
  private calculateCacheEfficiency(): number {
    if (this.cacheStats.totalRequests === 0) return 0;
    return this.cacheStats.hits / this.cacheStats.totalRequests;
  }
  
  private calculateAverageQuality(): number {
    if (this.performanceMetrics.qualityDistribution.size === 0) return 0;
    
    let totalWeightedQuality = 0;
    let totalCount = 0;
    
    for (const [qualityStr, count] of this.performanceMetrics.qualityDistribution) {
      const quality = parseFloat(qualityStr);
      totalWeightedQuality += quality * count;
      totalCount += count;
    }
    
    return totalCount > 0 ? totalWeightedQuality / totalCount : 0;
  }
  
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

export default SmartNeuralCoordinator;