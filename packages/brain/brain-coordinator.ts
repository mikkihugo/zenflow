/**
 * @file Brain Coordinator - Simple High-Level Interface
 * 
 * Easy-to-use interface for the Brain package that handles:
 * - Prompt optimization using DSPy
 * - Learning from success/failure
 * - Smart caching
 * - Coordination between AI systems
 * 
 * This is the main entry point for using the Brain package.
 */

import { getLogger, type Logger } from '@claude-zen/foundation';
import { DSPyLLMBridge, type CoordinationTask, type CoordinationResult } from './coordination/dspy-llm-bridge';
import { RetrainingMonitor } from './coordination/retraining-monitor';
import { NeuralBridge } from './neural-bridge';
import { PatternRecognitionEngine } from '@claude-zen/adaptive-learning';

export interface BrainConfig {
  sessionId?: string;
  enableLearning?: boolean;
  cacheOptimizations?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface PromptOptimizationRequest {
  task: string;
  basePrompt: string;
  context?: Record<string, any>;
  agentRole?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface PromptOptimizationResult {
  optimizedPrompt: string;
  confidence: number;
  fromCache: boolean;
  processingTime: number;
  method: 'dspy' | 'pattern' | 'fallback';
}

/**
 * Simple Brain Coordinator - Main interface for the Brain package.
 * 
 * Use this class for all AI coordination, prompt optimization, and learning.
 * Handles complexity internally while providing a clean, simple API.
 */
export class BrainCoordinator {
  private logger: Logger;
  private dspyBridge: DSPyLLMBridge | null = null;
  private retrainingMonitor: RetrainingMonitor | null = null;
  private neuralBridge: NeuralBridge | null = null;
  private patternEngine: PatternRecognitionEngine | null = null;
  private initialized = false;
  
  // Simple cache for optimized prompts
  private promptCache = new Map<string, {
    prompt: string;
    confidence: number;
    timestamp: number;
    hitCount: number;
  }>();

  constructor(private config: BrainConfig = {}) {
    this.logger = getLogger('brain-coordinator');
    this.logger.info('🧠 Brain Coordinator created - simple AI coordination interface');
  }

  /**
   * Initialize the Brain Coordinator. Call this once before using.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.debug('Brain Coordinator already initialized');
      return;
    }

    try {
      this.logger.info('🧠 Initializing Brain Coordinator...');

      // Initialize neural bridge for WASM neural networks
      this.neuralBridge = new NeuralBridge();
      await this.neuralBridge.initialize();

      // Initialize DSPy bridge for AI coordination
      this.dspyBridge = new DSPyLLMBridge(this.logger, this.neuralBridge);
      await this.dspyBridge.initialize();

      // Initialize retraining monitor for continuous learning
      if (this.config.enableLearning !== false) {
        this.retrainingMonitor = new RetrainingMonitor(this.logger);
        await this.retrainingMonitor.initialize();
      }

      // Initialize pattern recognition for adaptive learning
      this.patternEngine = new PatternRecognitionEngine({
        enableCaching: true,
        confidenceThreshold: 0.7,
        learningRate: 0.1
      });

      this.initialized = true;
      this.logger.info('✅ Brain Coordinator initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Brain Coordinator:', error);
      throw new Error(`Brain initialization failed: ${error}`);
    }
  }

  /**
   * Optimize a prompt using AI. Simple main method.
   * 
   * @param request - What you want to optimize
   * @returns Optimized prompt with confidence score
   */
  async optimizePrompt(request: PromptOptimizationRequest): Promise<PromptOptimizationResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const cacheKey = this.getCacheKey(request);

    try {
      // Check cache first
      if (this.config.cacheOptimizations !== false) {
        const cached = this.promptCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
          cached.hitCount++;
          this.logger.debug(`📦 Using cached optimization for ${request.task}`);
          
          return {
            optimizedPrompt: cached.prompt,
            confidence: cached.confidence,
            fromCache: true,
            processingTime: Date.now() - startTime,
            method: 'pattern'
          };
        }
      }

      // Try pattern recognition first (faster than DSPy)
      if (this.patternEngine) {
        try {
          const pattern = await this.patternEngine.recognizePattern({
            taskType: request.task,
            contextSize: JSON.stringify(request.context || {}).length,
            agentRole: request.agentRole,
            priority: request.priority
          });

          if (pattern.confidence > 0.7) {
            this.logger.info(`🔍 Pattern-optimized prompt (confidence: ${pattern.confidence})`);
            const enhancedPrompt = this.enhancePromptWithPattern(request.basePrompt, pattern);
            
            // Cache pattern result
            if (this.config.cacheOptimizations !== false) {
              this.promptCache.set(cacheKey, {
                prompt: enhancedPrompt,
                confidence: pattern.confidence,
                timestamp: Date.now(),
                hitCount: 1
              });
            }

            return {
              optimizedPrompt: enhancedPrompt,
              confidence: pattern.confidence,
              fromCache: false,
              processingTime: Date.now() - startTime,
              method: 'pattern'
            };
          }
        } catch (error) {
          this.logger.debug('Pattern recognition failed, trying DSPy:', error);
        }
      }

      // Use DSPy for optimization
      if (this.dspyBridge) {
        const coordinationTask: CoordinationTask = {
          id: `optimize-${request.task}-${Date.now()}`,
          type: 'generation',
          input: `Optimize this prompt: ${request.basePrompt}`,
          context: {
            ...request.context,
            originalPrompt: request.basePrompt,
            taskType: request.task,
            agentRole: request.agentRole
          },
          priority: request.priority || 'medium'
        };

        const result = await this.dspyBridge.processCoordinationTask(coordinationTask, {
          teleprompter: 'MIPROv2',
          hybridMode: true,
          optimizationSteps: 2
        });

        if (result.result) {
          const optimizedPrompt = String(result.result);
          
          // Cache the result
          if (this.config.cacheOptimizations !== false) {
            this.promptCache.set(cacheKey, {
              prompt: optimizedPrompt,
              confidence: result.confidence,
              timestamp: Date.now(),
              hitCount: 1
            });
          }

          this.logger.info(`🧠 Optimized prompt for ${request.task} (confidence: ${result.confidence.toFixed(2)})`);
          
          return {
            optimizedPrompt,
            confidence: result.confidence,
            fromCache: false,
            processingTime: Date.now() - startTime,
            method: 'dspy'
          };
        }
      }

      // Fallback: return original prompt
      this.logger.warn(`⚠️ No optimization available for ${request.task}, using original`);
      
      return {
        optimizedPrompt: request.basePrompt,
        confidence: 0.5,
        fromCache: false,
        processingTime: Date.now() - startTime,
        method: 'fallback'
      };

    } catch (error) {
      this.logger.error(`❌ Prompt optimization failed for ${request.task}:`, error);
      
      // Always return something usable
      return {
        optimizedPrompt: request.basePrompt,
        confidence: 0.3,
        fromCache: false,
        processingTime: Date.now() - startTime,
        method: 'fallback'
      };
    }
  }

  /**
   * Learn from success or failure. Call this after using an optimized prompt.
   * 
   * @param promptResult - The result you got from using the optimized prompt
   * @param success - Whether the prompt worked well (true/false)
   * @param feedback - Optional feedback about what happened
   */
  async learnFromResult(
    promptResult: PromptOptimizationResult, 
    success: boolean, 
    feedback?: string
  ): Promise<void> {
    if (!this.retrainingMonitor) {
      return; // Learning disabled
    }

    try {
      await this.retrainingMonitor.recordPromptFeedback({
        promptHash: this.hashString(promptResult.optimizedPrompt),
        success,
        confidence: promptResult.confidence,
        feedback,
        timestamp: Date.now()
      });

      this.logger.debug(`📊 Recorded learning feedback: ${success ? 'success' : 'failure'}`);
    } catch (error) {
      this.logger.warn('⚠️ Failed to record learning feedback:', error);
    }
  }

  /**
   * Get coordination statistics.
   */
  getStats(): {
    initialized: boolean;
    cacheSize: number;
    cacheHits: number;
    learningEnabled: boolean;
  } {
    const cacheHits = Array.from(this.promptCache.values())
      .reduce((total, entry) => total + entry.hitCount, 0);

    return {
      initialized: this.initialized,
      cacheSize: this.promptCache.size,
      cacheHits,
      learningEnabled: this.retrainingMonitor !== null
    };
  }

  /**
   * Clear the optimization cache.
   */
  clearCache(): void {
    this.promptCache.clear();
    this.logger.info('🗑️ Optimization cache cleared');
  }

  // Private helper methods

  private getCacheKey(request: PromptOptimizationRequest): string {
    return `${request.task}:${this.hashString(request.basePrompt)}:${request.agentRole || 'default'}`;
  }

  private isCacheValid(cached: { timestamp: number; confidence: number }): boolean {
    // Cache valid for 24 hours if confidence > 0.7, otherwise 1 hour
    const maxAge = cached.confidence > 0.7 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    return Date.now() - cached.timestamp < maxAge;
  }

  private enhancePromptWithPattern(basePrompt: string, pattern: any): string {
    let enhancedPrompt = basePrompt;
    
    // Add pattern-based enhancements
    if (pattern.suggestions?.includeExamples) {
      enhancedPrompt += '\n\nInclude specific examples in your analysis.';
    }
    
    if (pattern.suggestions?.emphasizeStructure) {
      enhancedPrompt += '\n\nEnsure your JSON response follows the exact structure specified.';
    }
    
    if (pattern.suggestions?.addContext) {
      enhancedPrompt += '\n\nConsider the broader system context when making recommendations.';
    }
    
    return enhancedPrompt;
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

export default BrainCoordinator;