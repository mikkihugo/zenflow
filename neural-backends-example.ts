/**
 * Complete Neural Backend Collection - Local + Optional Paid
 * 
 * Demonstrates running BERT, sentence transformers, and other models
 * locally via ONNX Runtime - completely FREE and private!
 */

// Core neural engines
import { NeuralNetwork } from 'brain.js';
import * as tf from '@tensorflow/tfjs-node';
import { InferenceSession, Tensor } from 'onnxruntime-node';
import { pipeline, env } from '@xenova/transformers';

// Optional paid services (only if user provides API key)
import { OpenAI } from 'openai';

// Types
interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  source: 'local' | 'paid';
  cost: number; // 0 for local, actual cost for paid
}

interface NeuralTask {
  type: 'embedding' | 'classification' | 'generation' | 'vision';
  input: string | string[] | number[][];
  requirements?: {
    quality: 'fast' | 'balanced' | 'high';
    privacy: boolean; // true = local only
    cost: 'free' | 'paid';
  };
}

/**
 * Ultimate Neural Backend Coordinator
 * Local-first with optional paid upgrades
 */
class UltimateNeuralCoordinator {
  private localModels: Map<string, InferenceSession> = new Map();
  private transformersCache: Map<string, any> = new Map();
  private openai?: OpenAI;
  private initialized = false;

  constructor(config: {
    openai?: { apiKey: string; enabled: boolean };
    localModelsPath?: string;
  } = {}) {
    if (config.openai?.apiKey && config.openai.enabled) {
      this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    }
    
    // Disable transformers.js telemetry for privacy
    env.allowRemoteModels = false; // Force local-only mode
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🧠 Initializing Ultimate Neural Coordinator...');
    
    // Pre-load popular local models for fast access
    const popularModels = [
      'sentence-transformers/all-MiniLM-L6-v2',    // Fast BERT
      'sentence-transformers/all-mpnet-base-v2',   // High quality BERT
    ];

    for (const modelName of popularModels) {
      try {
        await this.loadLocalModel(modelName);
        console.log(`✅ Loaded local model: ${modelName}`);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${modelName}:`, error.message);
      }
    }

    this.initialized = true;
    console.log('🚀 Neural Coordinator ready!');
  }

  /**
   * Load BERT/transformer model via ONNX Runtime
   */
  private async loadLocalModel(modelName: string): Promise<InferenceSession> {
    if (this.localModels.has(modelName)) {
      return this.localModels.get(modelName)!;
    }

    try {
      // Option 1: Use transformers.js (easiest)
      const model = await pipeline('feature-extraction', modelName);
      this.transformersCache.set(modelName, model);
      
      console.log(`📦 Loaded via transformers.js: ${modelName}`);
      return model as any; // Simplified for example
      
    } catch (error) {
      // Option 2: Direct ONNX loading (more control)
      const onnxPath = `./models/${modelName.replace('/', '_')}/model.onnx`;
      const session = await InferenceSession.create(onnxPath, {
        executionProviders: ['cpu'] // or 'cuda', 'coreml', 'directml'
      });
      
      this.localModels.set(modelName, session);
      console.log(`🔧 Loaded via ONNX Runtime: ${modelName}`);
      return session;
    }
  }

  /**
   * Smart embedding generation with fallback chain
   */
  async getEmbeddings(texts: string[], requirements?: NeuralTask['requirements']): Promise<EmbeddingResult> {
    const startTime = Date.now();
    
    // 1. Local models first (FREE + PRIVATE)
    if (!requirements?.cost || requirements.cost === 'free' || requirements?.privacy) {
      
      // Try high-quality local model first
      if (requirements?.quality === 'high') {
        try {
          const embeddings = await this.getLocalEmbeddings(
            texts, 
            'sentence-transformers/all-mpnet-base-v2'
          );
          return {
            embeddings,
            model: 'all-mpnet-base-v2',
            source: 'local',
            cost: 0
          };
        } catch (error) {
          console.warn('High-quality local model failed, trying fast model...');
        }
      }
      
      // Try fast local model
      try {
        const embeddings = await this.getLocalEmbeddings(
          texts,
          'sentence-transformers/all-MiniLM-L6-v2'
        );
        return {
          embeddings,
          model: 'all-MiniLM-L6-v2', 
          source: 'local',
          cost: 0
        };
      } catch (error) {
        console.warn('Fast local model failed, trying TensorFlow...');
      }

      // Fallback to TensorFlow.js Universal Sentence Encoder
      try {
        const embeddings = await this.getTensorFlowEmbeddings(texts);
        return {
          embeddings,
          model: 'universal-sentence-encoder',
          source: 'local',
          cost: 0
        };
      } catch (error) {
        console.warn('TensorFlow failed, trying brain.js...');
      }

      // Last resort: brain.js (for simple text features)
      try {
        const embeddings = await this.getBrainJSEmbeddings(texts);
        return {
          embeddings,
          model: 'brain.js-basic',
          source: 'local', 
          cost: 0
        };
      } catch (error) {
        if (requirements?.privacy) {
          throw new Error('All local models failed and privacy mode enabled');
        }
      }
    }

    // 2. Paid models (only if configured and allowed)
    if (this.openai && requirements?.cost === 'paid') {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-large',
          input: texts
        });
        
        const embeddings = response.data.map(item => item.embedding);
        const cost = texts.length * 0.00013 / 1000; // Approximate cost
        
        return {
          embeddings,
          model: 'text-embedding-3-large',
          source: 'paid',
          cost
        };
      } catch (error) {
        console.error('OpenAI embeddings failed:', error);
      }
    }

    throw new Error('All embedding backends failed');
  }

  /**
   * Get embeddings from local BERT/transformer models
   */
  private async getLocalEmbeddings(texts: string[], modelName: string): Promise<number[][]> {
    // Check transformers.js cache first
    if (this.transformersCache.has(modelName)) {
      const model = this.transformersCache.get(modelName);
      const results = await model(texts);
      
      // Handle different return formats
      if (Array.isArray(results)) {
        return results.map(r => Array.from(r.data || r));
      } else {
        return [Array.from(results.data || results)];
      }
    }

    // Use ONNX Runtime directly
    const session = await this.loadLocalModel(modelName);
    const embeddings: number[][] = [];

    for (const text of texts) {
      // Tokenize text (simplified - real implementation would use proper tokenizer)
      const tokens = this.simpleTokenize(text);
      const inputTensor = new Tensor('int64', tokens, [1, tokens.length]);
      
      const feeds = { input_ids: inputTensor };
      const results = await session.run(feeds);
      
      // Extract embeddings from model output
      const embeddingTensor = results.last_hidden_state || results.pooler_output;
      const embedding = Array.from(embeddingTensor.data as Float32Array);
      
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * TensorFlow.js Universal Sentence Encoder
   */
  private async getTensorFlowEmbeddings(texts: string[]): Promise<number[][]> {
    const use = await import('@tensorflow-models/universal-sentence-encoder');
    const model = await use.load();
    
    const embeddings = await model.embed(texts);
    return embeddings.arraySync() as number[][];
  }

  /**
   * brain.js basic text features (simple but always works)
   */
  private async getBrainJSEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map(text => {
      // Create simple character/word frequency features
      const features = new Array(100).fill(0);
      
      // Character frequency features
      for (let i = 0; i < text.length && i < 50; i++) {
        const charCode = text.charCodeAt(i) % 50;
        features[charCode] += 1;
      }
      
      // Word length features  
      const words = text.split(' ');
      features[50] = words.length; // word count
      features[51] = text.length;  // character count
      features[52] = words.reduce((sum, w) => sum + w.length, 0) / words.length; // avg word length
      
      // Normalize features
      const maxVal = Math.max(...features);
      if (maxVal > 0) {
        return features.map(f => f / maxVal);
      }
      return features;
    });
  }

  /**
   * Simple tokenization (real implementation would use proper tokenizer)
   */
  private simpleTokenize(text: string): number[] {
    // This is a simplified tokenizer - real implementation would use
    // the actual tokenizer for the specific model (BERT tokenizer, etc.)
    const tokens = text.toLowerCase()
      .split(/\W+/)
      .filter(t => t.length > 0)
      .map(token => {
        // Simple hash-based token ID (not production ready)
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
          hash = ((hash << 5) - hash + token.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash) % 30000; // Vocab size approximation
      });
    
    return tokens.slice(0, 512); // Max sequence length
  }

  /**
   * Process any neural task with intelligent backend selection
   */
  async processTask(task: NeuralTask): Promise<any> {
    await this.initialize();

    switch (task.type) {
      case 'embedding':
        return this.getEmbeddings(
          Array.isArray(task.input) ? task.input as string[] : [task.input as string],
          task.requirements
        );
        
      case 'classification':
        return this.classify(task.input as string[], task.requirements);
        
      case 'generation':
        return this.generate(task.input as string, task.requirements);
        
      case 'vision':
        return this.processImage(task.input, task.requirements);
        
      default:
        throw new Error(`Unsupported task type: ${task.type}`);
    }
  }

  private async classify(texts: string[], requirements?: NeuralTask['requirements']): Promise<any> {
    // Get embeddings first
    const embeddingResult = await this.getEmbeddings(texts, requirements);
    
    // Use local classification (brain.js, TensorFlow, or neural-ml)
    // Implementation depends on specific classification needs
    console.log('🎯 Classification using embeddings from:', embeddingResult.model);
    return { predictions: [], model: embeddingResult.model };
  }

  private async generate(text: string, requirements?: NeuralTask['requirements']): Promise<any> {
    // Local text generation using transformers.js or TensorFlow.js
    if (requirements?.privacy || !this.openai) {
      // Use local generation models (GPT-2, T5, etc. via transformers.js)
      const generator = await pipeline('text-generation', 'Xenova/gpt2');
      const result = await generator(text, { max_length: 100 });
      return { text: result[0].generated_text, model: 'gpt2-local', cost: 0 };
    }
    
    // Paid generation (OpenAI)
    if (this.openai) {
      const response = await this.openai.completions.create({
        model: 'gpt-3.5-turbo-instruct',
        prompt: text,
        max_tokens: 100
      });
      return { 
        text: response.choices[0].text, 
        model: 'gpt-3.5-turbo-instruct',
        cost: response.usage!.total_tokens * 0.0015 / 1000 
      };
    }

    throw new Error('No generation backend available');
  }

  private async processImage(input: any, requirements?: NeuralTask['requirements']): Promise<any> {
    // Local image processing using TensorFlow.js models or ML5.js
    // Implementation would load models like MobileNet, etc.
    console.log('🖼️ Local image processing');
    return { predictions: [], model: 'mobilenet-local', cost: 0 };
  }

  /**
   * Get information about available backends
   */
  getAvailableBackends(): string[] {
    const backends = [
      'brain.js (always available)',
      'tensorflow.js (local)',
      'transformers.js (local BERT/GPT)',
      'onnx-runtime (local optimized models)',
      'neural-ml (local GPU acceleration)'
    ];

    if (this.openai) {
      backends.push('openai (paid)');
    }

    return backends;
  }

  /**
   * Estimate costs for different backends
   */
  estimateCost(texts: string[], backend: string): number {
    const tokenCount = texts.join(' ').split(' ').length;
    
    switch (backend) {
      case 'local':
        return 0; // Always free
      case 'openai-embedding':
        return tokenCount * 0.00013 / 1000;
      case 'openai-generation':
        return tokenCount * 0.0015 / 1000;
      default:
        return 0;
    }
  }
}

// Example usage
async function demonstrateNeuralBackends() {
  const coordinator = new UltimateNeuralCoordinator({
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      enabled: !!process.env.OPENAI_API_KEY
    }
  });

  console.log('🚀 Available backends:', coordinator.getAvailableBackends());

  // Test local embeddings (FREE)
  const localTask: NeuralTask = {
    type: 'embedding',
    input: ['Hello world', 'Neural networks are amazing'],
    requirements: {
      quality: 'balanced',
      privacy: true, // Force local-only
      cost: 'free'
    }
  };

  try {
    const result = await coordinator.processTask(localTask);
    console.log('✅ Local embeddings result:', {
      model: result.model,
      source: result.source,
      cost: result.cost,
      dimensions: result.embeddings[0].length
    });
  } catch (error) {
    console.error('❌ Local embeddings failed:', error.message);
  }

  // Test paid embeddings (if API key available)
  if (process.env.OPENAI_API_KEY) {
    const paidTask: NeuralTask = {
      type: 'embedding', 
      input: ['Hello world', 'Neural networks are amazing'],
      requirements: {
        quality: 'high',
        privacy: false,
        cost: 'paid'
      }
    };

    try {
      const result = await coordinator.processTask(paidTask);
      console.log('💰 Paid embeddings result:', {
        model: result.model,
        source: result.source,
        cost: result.cost,
        dimensions: result.embeddings[0].length
      });
    } catch (error) {
      console.error('❌ Paid embeddings failed:', error.message);
    }
  }
}

// Run demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateNeuralBackends().catch(console.error);
}

export { UltimateNeuralCoordinator, type NeuralTask, type EmbeddingResult };