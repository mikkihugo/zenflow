/**
 * Smart Neural Strategy - Single Primary Model + Intelligent Fallbacks
 * 
 * Instead of loading multiple heavy models, we use:
 * 1. ONE primary model for 90% of tasks
 * 2. Lightweight fallbacks for edge cases
 * 3. Optional paid upgrade path
 */

import { pipeline, env } from '@xenova/transformers';
import { OpenAI } from 'openai';

interface SmartNeuralConfig {
  primaryModel: 'fast' | 'balanced' | 'quality';
  allowPaid: boolean;
  openaiKey?: string;
  cacheSize: number;
}

/**
 * Optimized Neural Coordinator - Single Model Focus
 */
class SmartNeuralCoordinator {
  private primaryModel: any = null;
  private modelName: string;
  private fallbackModel: any = null;
  private openai?: OpenAI;
  private embeddingCache = new Map<string, number[]>();
  private initialized = false;

  constructor(private config: SmartNeuralConfig) {
    // Select THE BEST single model based on user preference
    this.modelName = this.selectOptimalModel(config.primaryModel);
    
    if (config.allowPaid && config.openaiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiKey });
    }

    // Configure transformers.js for optimal performance
    env.allowRemoteModels = true; // Allow downloading models
    env.allowLocalModels = true;  // Cache locally
  }

  /**
   * Select the single best model based on user requirements
   */
  private selectOptimalModel(preference: 'fast' | 'balanced' | 'quality'): string {
    const modelMap = {
      // Fast: Prioritize speed over quality
      fast: 'sentence-transformers/all-MiniLM-L6-v2',      // 90MB, 2-5s load, quality 8/10
      
      // Balanced: Best quality/speed tradeoff (RECOMMENDED)
      balanced: 'sentence-transformers/all-mpnet-base-v2',  // 420MB, 5-10s load, quality 9/10
      
      // Quality: Best local quality (heavy)
      quality: 'sentence-transformers/all-mpnet-base-v2'    // Same as balanced - it's the best local option
    };

    return modelMap[preference];
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log(`🧠 Loading primary model: ${this.modelName}`);
    const startTime = Date.now();

    try {
      // Load primary model
      this.primaryModel = await pipeline('feature-extraction', this.modelName);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Primary model loaded in ${loadTime}ms`);

      // Pre-warm with a test embedding to avoid first-call delay
      await this.primaryModel('test');
      console.log('🔥 Model pre-warmed and ready');

    } catch (error) {
      console.error('❌ Primary model failed to load:', error);
      
      // Fallback to ultra-light model
      console.log('🔄 Loading lightweight fallback...');
      this.fallbackModel = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2');
      console.log('✅ Fallback model loaded');
    }

    this.initialized = true;
  }

  /**
   * Get embeddings with smart caching and fallback logic
   */
  async getEmbeddings(texts: string[], options?: {
    quality?: 'fast' | 'best';
    useCache?: boolean;
  }): Promise<{
    embeddings: number[][];
    model: string;
    source: 'cache' | 'local' | 'paid';
    latency: number;
  }> {
    await this.initialize();
    const startTime = Date.now();

    // 1. Check cache first (instant)
    if (options?.useCache !== false) {
      const cachedResults = this.getCachedEmbeddings(texts);
      if (cachedResults.length === texts.length) {
        return {
          embeddings: cachedResults,
          model: 'cached',
          source: 'cache',
          latency: Date.now() - startTime
        };
      }
    }

    // 2. Use paid model for best quality (if available and requested)
    if (options?.quality === 'best' && this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-large',
          input: texts
        });

        const embeddings = response.data.map(item => item.embedding);
        this.cacheEmbeddings(texts, embeddings);

        return {
          embeddings,
          model: 'text-embedding-3-large',
          source: 'paid',
          latency: Date.now() - startTime
        };
      } catch (error) {
        console.warn('OpenAI failed, falling back to local model');
      }
    }

    // 3. Use primary local model
    try {
      const model = this.primaryModel || this.fallbackModel;
      if (!model) throw new Error('No model available');

      const results = await model(texts);
      const embeddings = this.normalizeEmbeddingResults(results);
      
      this.cacheEmbeddings(texts, embeddings);

      return {
        embeddings,
        model: this.modelName,
        source: 'local',
        latency: Date.now() - startTime
      };

    } catch (error) {
      // 4. Ultra-lightweight fallback - simple text features
      console.warn('All models failed, using basic text features');
      const embeddings = texts.map(text => this.createBasicTextFeatures(text));
      
      return {
        embeddings,
        model: 'basic-features',
        source: 'local',
        latency: Date.now() - startTime
      };
    }
  }

  /**
   * Normalize different embedding result formats
   */
  private normalizeEmbeddingResults(results: any): number[][] {
    if (!results) return [];
    
    // Handle single text input
    if (!Array.isArray(results)) {
      return [Array.from(results.data || results)];
    }
    
    // Handle multiple texts
    return results.map(result => {
      if (result.data) return Array.from(result.data);
      if (Array.isArray(result)) return result;
      return Array.from(result);
    });
  }

  /**
   * Smart caching system
   */
  private getCachedEmbeddings(texts: string[]): number[][] {
    const results: number[][] = [];
    for (const text of texts) {
      const cached = this.embeddingCache.get(text);
      if (cached) {
        results.push(cached);
      } else {
        break; // Cache miss - need to compute
      }
    }
    return results;
  }

  private cacheEmbeddings(texts: string[], embeddings: number[][]): void {
    if (texts.length !== embeddings.length) return;
    
    for (let i = 0; i < texts.length; i++) {
      if (this.embeddingCache.size >= this.config.cacheSize) {
        // Remove oldest entry (simple LRU)
        const firstKey = this.embeddingCache.keys().next().value;
        this.embeddingCache.delete(firstKey);
      }
      this.embeddingCache.set(texts[i], embeddings[i]);
    }
  }

  /**
   * Ultra-lightweight text features as last resort
   */
  private createBasicTextFeatures(text: string): number[] {
    const features = new Array(384).fill(0); // Match common embedding dimensions
    
    // Character frequency
    for (let i = 0; i < text.length && i < 200; i++) {
      const charCode = text.charCodeAt(i) % 200;
      features[charCode] += 1;
    }
    
    // Word statistics
    const words = text.split(/\s+/);
    features[200] = words.length;
    features[201] = text.length;
    features[202] = words.reduce((sum, w) => sum + w.length, 0) / words.length || 0;
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(features.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? features.map(f => f / magnitude) : features;
  }

  /**
   * Batch processing for efficiency
   */
  async processTextsBatch(texts: string[], batchSize = 32): Promise<number[][]> {
    const allEmbeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const result = await this.getEmbeddings(batch, { useCache: true });
      allEmbeddings.push(...result.embeddings);
    }
    
    return allEmbeddings;
  }

  /**
   * Get model information and performance stats
   */
  getModelInfo(): {
    primaryModel: string;
    memoryUsage: string;
    cacheSize: number;
    hasPaidBackup: boolean;
  } {
    return {
      primaryModel: this.modelName,
      memoryUsage: this.getMemoryUsageEstimate(),
      cacheSize: this.embeddingCache.size,
      hasPaidBackup: !!this.openai
    };
  }

  private getMemoryUsageEstimate(): string {
    const modelSizes: Record<string, string> = {
      'sentence-transformers/all-MiniLM-L6-v2': '90MB',
      'sentence-transformers/all-mpnet-base-v2': '420MB',
    };
    
    const baseMemory = modelSizes[this.modelName] || '100MB';
    const cacheMemory = Math.round(this.embeddingCache.size * 0.002); // ~2KB per cached embedding
    
    return `${baseMemory} + ${cacheMemory}MB cache`;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.embeddingCache.clear();
    this.primaryModel = null;
    this.fallbackModel = null;
    console.log('🧹 Neural coordinator cleaned up');
  }
}

// Recommended configurations for different use cases
export const NEURAL_CONFIGS = {
  // For web applications - prioritize speed
  web: {
    primaryModel: 'fast' as const,
    allowPaid: false,
    cacheSize: 1000
  },
  
  // For desktop applications - balanced performance
  desktop: {
    primaryModel: 'balanced' as const,
    allowPaid: true,
    cacheSize: 5000
  },
  
  // For servers - best quality
  server: {
    primaryModel: 'quality' as const,
    allowPaid: true,
    cacheSize: 10000
  }
} satisfies Record<string, SmartNeuralConfig>;

// Example usage
async function demonstrateSmartStrategy() {
  console.log('🚀 Demonstrating Smart Neural Strategy');
  
  // Create coordinator with balanced config
  const coordinator = new SmartNeuralCoordinator({
    ...NEURAL_CONFIGS.desktop,
    openaiKey: process.env.OPENAI_API_KEY
  });

  // Test embedding performance
  const testTexts = [
    'Neural networks are transforming AI',
    'BERT embeddings provide semantic understanding',
    'Local models offer privacy and cost benefits'
  ];

  console.log('📊 Performance comparison:');

  // Test 1: Local model
  const localResult = await coordinator.getEmbeddings(testTexts, { quality: 'fast' });
  console.log(`Local: ${localResult.latency}ms, source: ${localResult.source}, model: ${localResult.model}`);

  // Test 2: Cached (should be instant)
  const cachedResult = await coordinator.getEmbeddings(testTexts, { useCache: true });
  console.log(`Cached: ${cachedResult.latency}ms, source: ${cachedResult.source}`);

  // Test 3: Paid model (if available)
  if (process.env.OPENAI_API_KEY) {
    const paidResult = await coordinator.getEmbeddings(testTexts, { quality: 'best' });
    console.log(`Paid: ${paidResult.latency}ms, source: ${paidResult.source}, model: ${paidResult.model}`);
  }

  // Show model info
  console.log('📋 Model info:', coordinator.getModelInfo());

  await coordinator.cleanup();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSmartStrategy().catch(console.error);
}

export { SmartNeuralCoordinator, NEURAL_CONFIGS };