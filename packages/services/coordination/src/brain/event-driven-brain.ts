/**
 * @fileoverview Event-Driven Brain Integration
 * 
 * Brain system that coordinates with DSPy via events instead of direct calls.
 * Provides ML-powered coordination through event architecture.
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import type {
  DspyOptimizationRequest,
  DspyOptimizationResult,
  DspyLlmRequest,
  DspyLlmResponse
} from '../dspy/event-driven-dspy.js';

const logger = getLogger('EventDrivenBrain');

/**
 * Brain prediction request interface
 */
export interface BrainPredictionRequest {
  requestId: string;
  domain: string;
  context: {
    complexity: number;
    priority: string;
    timeLimit?: number;
  };
  useAdvancedOptimization?: boolean;
  prompt?: string;
  data?: any;
}

/**
 * Brain prediction result interface
 */
export interface BrainPredictionResult {
  requestId: string;
  predictions: any[];
  confidence: number;
  strategy: 'dspy' | 'neural' | 'hybrid' | 'basic';
  optimizationUsed?: boolean;
  metadata?: any;
  timestamp: Date;
}

/**
 * Event-driven brain system for ML coordination
 */
export class EventDrivenBrain extends EventBus {
  private activePredictions = new Map<string, BrainPredictionRequest>();
  private predictionHistory = new Map<string, BrainPredictionResult[]>();
  private dspySystemAvailable = false;
  private llmSystemAvailable = false;

  constructor() {
    super();
    this.setupEventHandlers();
    this.detectAvailableSystems();
    logger.info('Event-driven Brain system initialized');
  }

  /**
   * Setup event handlers for Brain coordination
   */
  private setupEventHandlers(): void {
    // Handle prediction requests
    this.on('brain:predict-request', this.handlePredictionRequest.bind(this));
    
    // Handle DSPy optimization results
    this.on('dspy:optimization-complete', this.handleDspyResult.bind(this));
    
    // Handle DSPy LLM requests (Brain coordinates LLM calls)
    this.on('dspy:llm-request', this.handleDspyLlmRequest.bind(this));
    
    // Handle LLM responses for DSPy
    this.on('llm:inference-response', this.handleLlmResponse.bind(this));
    
    // System availability detection
    this.on('system:dspy-available', () => { this.dspySystemAvailable = true; });
    this.on('system:llm-available', () => { this.llmSystemAvailable = true; });
  }

  /**
   * Detect available systems for coordination
   */
  private detectAvailableSystems(): void {
    // Emit detection events
    this.emit('brain:system-detection', { timestamp: new Date() });
    
    // Assume systems are available if they respond within 1 second
    setTimeout(() => {
      logger.info(`Brain systems detected - DSPy: ${this.dspySystemAvailable}, LLM: ${this.llmSystemAvailable}`);
    }, 1000);
  }

  /**
   * Handle brain prediction requests
   */
  private async handlePredictionRequest(request: BrainPredictionRequest): Promise<void> {
    const requestId = request.requestId || `brain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullRequest: BrainPredictionRequest = {
      ...request,
      requestId,
      useAdvancedOptimization: request.useAdvancedOptimization !== false // Default to true
    };

    this.activePredictions.set(requestId, fullRequest);
    logger.info(`Brain prediction requested: ${request.domain} - complexity ${request.context.complexity}`);

    try {
      // Determine prediction strategy based on complexity and available systems
      const strategy = this.selectPredictionStrategy(request);
      let predictions: any[] = [];
      let optimizationUsed = false;

      switch (strategy) {
        case 'dspy':
          ({ predictions, optimizationUsed } = await this.predictViaDSPy(request));
          break;
        case 'neural':
          predictions = await this.predictViaNeural(request);
          break;
        case 'hybrid':
          ({ predictions, optimizationUsed } = await this.predictViaHybrid(request));
          break;
        default:
          predictions = await this.predictViaBasic(request);
          break;
      }

      const result: BrainPredictionResult = {
        requestId,
        predictions,
        confidence: this.calculateConfidence(predictions, strategy),
        strategy,
        optimizationUsed,
        timestamp: new Date()
      };

      // Store in history
      if (!this.predictionHistory.has(request.domain)) {
        this.predictionHistory.set(request.domain, []);
      }
      this.predictionHistory.get(request.domain)!.push(result);

      // Emit result
      this.emit('brain:prediction-complete', result);
      
    } catch (error) {
      logger.error(`Brain prediction failed: ${error}`);
      this.emit('brain:prediction-error', { requestId, error: error.message });
    } finally {
      this.activePredictions.delete(requestId);
    }
  }

  /**
   * Select optimal prediction strategy
   */
  private selectPredictionStrategy(request: BrainPredictionRequest): 'dspy' | 'neural' | 'hybrid' | 'basic' {
    const { complexity, priority, timeLimit } = request.context;
    
    // High complexity + available DSPy = DSPy strategy
    if (complexity > 0.7 && this.dspySystemAvailable) {
      return 'dspy';
    }
    
    // Medium complexity + both systems = Hybrid
    if (complexity > 0.5 && this.dspySystemAvailable && this.llmSystemAvailable) {
      return 'hybrid';
    }
    
    // Low complexity or time constraints = Basic
    if (complexity < 0.3 || (timeLimit && timeLimit < 5000)) {
      return 'basic';
    }
    
    return 'neural';
  }

  /**
   * Predict via DSPy optimization
   */
  private async predictViaDSPy(request: BrainPredictionRequest): Promise<{ predictions: any[]; optimizationUsed: boolean }> {
    return new Promise((resolve, reject) => {
      const dspyRequest: DspyOptimizationRequest = {
        requestId: request.requestId,
        prompt: request.prompt || '',
        context: request.context,
        useOptimization: request.useAdvancedOptimization !== false
      };

      const timeout = setTimeout(() => {
        reject(new Error('DSPy prediction timeout'));
      }, request.context.timeLimit || 30000);

      const handler = (result: DspyOptimizationResult) => {
        if (result.requestId === request.requestId) {
          clearTimeout(timeout);
          this.off('dspy:optimization-complete', handler);
          resolve({
            predictions: result.predictions || [],
            optimizationUsed: result.optimizationUsed || false
          });
        }
      };

      this.on('dspy:optimization-complete', handler);
      this.emit('dspy:optimization-request', dspyRequest);
    });
  }

  /**
   * Predict via neural networks
   */
  private async predictViaNeural(request: BrainPredictionRequest): Promise<any[]> {
    // Placeholder for neural network predictions
    logger.info(`Neural prediction for ${request.domain}`);
    return [{ type: 'neural', confidence: 0.8, result: 'neural-prediction' }];
  }

  /**
   * Predict via hybrid approach
   */
  private async predictViaHybrid(request: BrainPredictionRequest): Promise<{ predictions: any[]; optimizationUsed: boolean }> {
    // Combine DSPy and neural approaches
    const [dspyResult, neuralResult] = await Promise.allSettled([
      this.predictViaDSPy(request),
      this.predictViaNeural(request)
    ]);

    const predictions: any[] = [];
    let optimizationUsed = false;

    if (dspyResult.status === 'fulfilled') {
      predictions.push(...dspyResult.value.predictions);
      optimizationUsed = dspyResult.value.optimizationUsed;
    }

    if (neuralResult.status === 'fulfilled') {
      predictions.push(...neuralResult.value);
    }

    return { predictions, optimizationUsed };
  }

  /**
   * Basic prediction fallback
   */
  private async predictViaBasic(request: BrainPredictionRequest): Promise<any[]> {
    logger.info(`Basic prediction for ${request.domain}`);
    return [{ type: 'basic', confidence: 0.6, result: 'basic-prediction' }];
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(predictions: any[], strategy: string): number {
    if (!predictions || predictions.length === 0) return 0;
    
    const baseConfidence = predictions.reduce((sum, pred) => {
      return sum + (pred.confidence || 0.5);
    }, 0) / predictions.length;

    // Adjust based on strategy
    const strategyMultiplier = {
      dspy: 1.2,
      hybrid: 1.1,
      neural: 1.0,
      basic: 0.8
    };

    return Math.min(1.0, baseConfidence * (strategyMultiplier[strategy] || 1.0));
  }

  /**
   * Handle DSPy optimization results
   */
  private handleDspyResult(result: DspyOptimizationResult): void {
    logger.info(`DSPy optimization complete: ${result.requestId}`);
    // Result is handled by the prediction promise handler
  }

  /**
   * Handle DSPy LLM requests
   */
  private handleDspyLlmRequest(request: DspyLlmRequest): void {
    logger.info(`DSPy LLM request: ${request.requestId}`);
    // Forward to LLM system
    this.emit('llm:inference-request', request);
  }

  /**
   * Handle LLM responses
   */
  private handleLlmResponse(response: DspyLlmResponse): void {
    logger.info(`LLM response received: ${response.requestId}`);
    // Forward back to DSPy system
    this.emit('dspy:llm-response', response);
  }

  /**
   * Get prediction history for a domain
   */
  public getPredictionHistory(domain: string): BrainPredictionResult[] {
    return this.predictionHistory.get(domain) || [];
  }

  /**
   * Get system status
   */
  public getSystemStatus(): {
    dspyAvailable: boolean;
    llmAvailable: boolean;
    activePredictions: number;
    totalHistoryEntries: number;
  } {
    let totalHistoryEntries = 0;
    for (const entries of this.predictionHistory.values()) {
      totalHistoryEntries += entries.length;
    }

    return {
      dspyAvailable: this.dspySystemAvailable,
      llmAvailable: this.llmSystemAvailable,
      activePredictions: this.activePredictions.size,
      totalHistoryEntries
    };
  }
}

export default EventDrivenBrain;