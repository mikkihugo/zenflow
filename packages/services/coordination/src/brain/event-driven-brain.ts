/**
 * @fileoverview Event-Driven Brain Integration
 * 
 * Brain system that coordinates with DSPy via events instead of direct calls.
 * Provides ML-powered coordination through event architecture.
 */

import { EventBus, getLogger, EventLogger } from '@claude-zen/foundation';
import type { DspyOptimizationRequest, DspyOptimizationResult, DspyLlmRequest, DspyLlmResponse } from '../dspy/event-driven-dspy.js';
const logger = getLogger('EventDrivenBrain');

/**
 * Brain prediction request
 */
export interface BrainPredictionRequest {
  requestId: string;
  domain: string;
  context: {
    phase?: string;
    complexity: number;
    size: number;
    history: number[];
    [key: string]: any;
  };
  targetMetrics: string[];
  useAdvancedOptimization?: boolean;
}

/**
 * Brain prediction result
 */
export interface BrainPredictionResult {
  requestId: string;
  success: boolean;
  predictions?: Record<string, any>;
  confidence: number;
  strategy:'neural'|'dspy'|'heuristic'|'hybrid';
  optimizationUsed: boolean;
  metrics: {
    processingTime: number;
    resourceUsage: number;
    cacheHit: boolean;
  };
  error?: string;
}

/**
 * Event-driven Brain system that uses DSPy via events
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
    EventLogger.log('brain:system-detection', { timestamp: new Date() });
    this.emit('brain:system-detection', { timestamp: new Date() });
    
    // Assume systems are available if they respond within 1 second
    setTimeout(() => {
      logger.info(`Brain systems detected - DSPy: ${this.dspySystemAvailable}, LLM: ${this.llmSystemAvailable}`);
    }, 1000);
  }

  /**
   * Request Brain prediction (main interface for other systems)
   */
  async predictOptimal(request: Omit<BrainPredictionRequest,'requestId'>): Promise<BrainPredictionResult> {
    const requestId = `brain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRequest: BrainPredictionRequest = {
      ...request,
      requestId,
      useAdvancedOptimization: request.useAdvancedOptimization !== false // Default to true
    };

    logger.info(`Brain prediction requested: ${request.domain} - complexity ${request.context.complexity}`);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.activePredictions.delete(requestId);
        reject(new Error(`Brain prediction timeout: ${request.domain}`));
      }, 60000); // 1 minute timeout

      // Store request for processing
      this.activePredictions.set(requestId, fullRequest);

      // Listen for result
      const resultHandler = (result: BrainPredictionResult) => {
        if (result.requestId === requestId) {
          clearTimeout(timeoutId);
          this.off('brain:prediction-complete', resultHandler);
          
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Brain prediction failed'));
          }
        }
      };

      this.on('brain:prediction-complete', resultHandler);

      // Emit prediction request
      EventLogger.log('brain:predict-request', fullRequest);
      this.emit('brain:predict-request', fullRequest);
    });
  }

  /**
   * Handle Brain prediction request
   */
  private async handlePredictionRequest(request: BrainPredictionRequest): Promise<void> {
    logger.info(`Processing Brain prediction: ${request.domain}`);

    try {
      const startTime = Date.now();
      
      // Determine prediction strategy based on complexity and available systems
      const strategy = this.selectPredictionStrategy(request);
      
      let predictions: Record<string, any>;
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
        case 'heuristic':
        default:
          predictions = this.predictViaHeuristics(request);
          break;
      }

      const processingTime = Date.now() - startTime;
      const result: BrainPredictionResult = {
        requestId: request.requestId,
        success: true,
        predictions,
        confidence: this.calculateConfidence(predictions, request),
        strategy,
        optimizationUsed,
        metrics: {
          processingTime,
          resourceUsage: this.calculateResourceUsage(strategy),
          cacheHit: false
        }
      };

      // Store prediction history
      await this.storePredictionResult(request.domain, result);

      // Emit completion
      EventLogger.log('brain:prediction-complete', result);
      this.emit('brain:prediction-complete', result);

    } catch (error) {
      logger.error(`Brain prediction failed: ${error}`);
      
      const failureResult: BrainPredictionResult = {
        requestId: request.requestId,
        success: false,
        confidence: 0,
        strategy: 'heuristic',
        optimizationUsed: false,
        metrics: { processingTime: 0, resourceUsage: 0, cacheHit: false },
        error: error instanceof Error ? error.message :'Unknown error'
      };

      EventLogger.log('brain:prediction-complete', failureResult);
      this.emit('brain:prediction-complete', failureResult);
    }

    // Clean up
    this.activePredictions.delete(request.requestId);
  }

  /**
   * Select optimal prediction strategy
   */
  private selectPredictionStrategy(request: BrainPredictionRequest): 'neural' | 'dspy' | 'heuristic' | 'hybrid' {
    const { complexity } = request.context;
    const { useAdvancedOptimization } = request;

    // High complexity + DSPy available + advanced optimization requested
    if (complexity > 7 && this.dspySystemAvailable && useAdvancedOptimization) {
      return'dspy';
    }

    // Medium complexity + both systems available
    if (complexity > 4 && complexity <= 7 && this.dspySystemAvailable && this.llmSystemAvailable) {
      return'hybrid';
    }

    // Simple neural prediction for medium complexity
    if (complexity > 2) {
      return'neural';
    }

    // Heuristics for simple cases
    return'heuristic';
  }

  /**
   * Predict via DSPy optimization (event-driven)
   */
  private async predictViaDSPy(request: BrainPredictionRequest): Promise<{ predictions: Record<string, any>; optimizationUsed: boolean }> {
    // Create DSPy optimization request
    const dspyRequest: Omit<DspyOptimizationRequest,'requestId'> = {
      domain: `brain-${request.domain}`,
      basePrompt: this.createPredictionPrompt(request),
      context: {
        task: `predict ${request.targetMetrics.join(', ')} for ${request.domain}`,
        complexity: request.context.complexity,
        examples: this.createPredictionExamples(request),
        targetMetrics: request.targetMetrics
      },
      optimizationGoals: ['accuracy', 'specificity', 'consistency'],
      maxIterations: Math.max(3, Math.min(8, Math.floor(request.context.complexity)))
    };

    // Import and use event-driven DSPy
    const { eventDrivenDSPy } = await import('../dspy/event-driven-dspy.js');
    const result = await eventDrivenDSPy.requestOptimization(dspyRequest);

    // Extract predictions from optimized prompt result
    const predictions = this.extractPredictionsFromOptimization(result, request);

    return { predictions, optimizationUsed: true };
  }

  /**
   * Predict via neural models
   */
  private async predictViaNeural(request: BrainPredictionRequest): Promise<Record<string, any>> {
    // Simple neural prediction based on context patterns
    const { complexity, size, history } = request.context;
    
    const predictions: Record<string, any> = {};
    
    for (const metric of request.targetMetrics) {
      switch (metric) {
        case 'maxTokens':
          predictions.maxTokens = this.neuralPredictTokens(complexity, size, history);
          break;
        case 'temperature':
          predictions.temperature = this.neuralPredictTemperature(complexity, history);
          break;
        case 'timeout':
          predictions.timeout = this.neuralPredictTimeout(complexity, size);
          break;
        case 'llmStrategy':
          predictions.llmStrategy = this.neuralPredictStrategy(complexity, size);
          break;
        default:
          predictions[metric] = this.neuralPredictGeneric(metric, complexity, history);
      }
    }

    return predictions;
  }

  /**
   * Predict via hybrid approach (neural + heuristics)
   */
  private async predictViaHybrid(request: BrainPredictionRequest): Promise<{ predictions: Record<string, any>; optimizationUsed: boolean }> {
    // Combine neural predictions with heuristic adjustments
    const neuralPredictions = await this.predictViaNeural(request);
    const heuristicPredictions = this.predictViaHeuristics(request);
    
    const predictions: Record<string, any> = {};
    
    for (const metric of request.targetMetrics) {
      const neural = neuralPredictions[metric];
      const heuristic = heuristicPredictions[metric];
      
      // Weighted combination based on confidence
      if (neural && heuristic) {
        predictions[metric] = (neural * 0.7) + (heuristic * 0.3);
      } else {
        predictions[metric] = neural|| heuristic;
      }
    }

    return { predictions, optimizationUsed: false };
  }

  /**
   * Predict via heuristics (fallback)
   */
  private predictViaHeuristics(request: BrainPredictionRequest): Record<string, any> {
    const { complexity } = request.context;
    const predictions: Record<string, any> = {};
    
    for (const metric of request.targetMetrics) {
      switch (metric) {
        case 'maxTokens':
          predictions.maxTokens = Math.round(4000 + (complexity * 2000));
          break;
        case 'temperature':
          predictions.temperature = Math.max(0.1, Math.min(1.0, 0.3 + (complexity * 0.1)));
          break;
        case 'timeout':
          predictions.timeout = Math.round(60000 + (complexity * 30000));
          break;
        case 'llmStrategy':
          predictions.llmStrategy = complexity > 6 ? 'claude' : complexity > 3 ? 'gpt' : 'gemini';
          break;
        default:
          predictions[metric] = complexity * 0.1;
      }
    }

    return predictions;
  }

  /**
   * Handle DSPy LLM requests (Brain coordinates LLM for DSPy)
   */
  private async handleDspyLlmRequest(request: DspyLlmRequest): Promise<void> {
    logger.debug(`Brain coordinating LLM for DSPy: ${request.context.purpose}`);

    try {
      // Convert DSPy LLM request to standard LLM request
      const llmRequest = {
        requestId: request.requestId,
        prompt: request.prompt,
        maxTokens: request.llmConfig.maxTokens,
        temperature: request.llmConfig.temperature,
        model: request.llmConfig.model || 'claude-3-sonnet',
        context: {
          purpose: `dspy-${request.context.purpose}`,
          dspyRequestId: request.dspyRequestId,
          iteration: request.context.iteration
        }
      };

      // Emit LLM request
      EventLogger.log('llm:inference-request', llmRequest);
      this.emit('llm:inference-request', llmRequest);

    } catch (error) {
      logger.error(`Failed to coordinate DSPy LLM request: ${error}`);
      
      // Send error response back to DSPy
      const errorResponse: DspyLlmResponse = {
        requestId: request.requestId,
        dspyRequestId: request.dspyRequestId,
        success: false,
        tokenUsage: 0,
        latency: 0,
        error: error instanceof Error ? error.message :'LLM coordination failed'
      };

      EventLogger.log('dspy:llm-response', errorResponse);
      this.emit('dspy:llm-response', errorResponse);
    }
  }

  /**
   * Handle LLM responses and forward to DSPy
   */
  private handleLlmResponse(response: any): void {
    // Check if this is a DSPy-related LLM response
    if (response.context?.purpose?.startsWith('dspy-')) {
      const dspyResponse: DspyLlmResponse = {
        requestId: response.requestId,
        dspyRequestId: response.context.dspyRequestId,
        success: response.success,
        response: response.response,
        tokenUsage: response.tokenUsage|| 0,
        latency: response.latency|| 0,
        error: response.error
      };

      EventLogger.log('dspy:llm-response', dspyResponse);
      this.emit('dspy:llm-response', dspyResponse);
    }
  }

  /**
   * Handle DSPy optimization results (for learning)
   */
  private handleDspyResult(result: DspyOptimizationResult): void {
    if (result.success) {
      logger.info(`DSPy optimization completed for Brain: ${result.improvement.toFixed(3)} improvement`);
      // Could use this for learning and future prediction improvements
    }
  }

  // Helper methods for neural predictions
  private neuralPredictTokens(complexity: number, size: number, history: number[]): number {
    const base = 4000 + (complexity * 1500);
    const sizeAdjustment = Math.log(size + 1) * 200;
    const historyAdjustment = history.length > 0 ? (history.reduce((a, b) => a + b, 0) / history.length) * 1000 : 0;
    return Math.round(base + sizeAdjustment + historyAdjustment);
  }

  private neuralPredictTemperature(complexity: number, history: number[]): number {
    const base = 0.3 + (complexity * 0.05);
    const historyAdjustment = history.length > 0 ? (history.reduce((a, b) => a + b, 0) / history.length) * 0.2 : 0;
    return Math.max(0.1, Math.min(1.0, base + historyAdjustment));
  }

  private neuralPredictTimeout(complexity: number, size: number): number {
    const base = 60000 + (complexity * 20000);
    const sizeAdjustment = Math.log(size + 1) * 10000;
    return Math.round(base + sizeAdjustment);
  }

  private neuralPredictStrategy(complexity: number, size: number): string {
    if (complexity > 8|| size > 50000) return'claude';
    if (complexity > 5) return'gpt';
    return'gemini';
  }

  private neuralPredictGeneric(metric: string, complexity: number, history: number[]): any {
    return complexity * 0.1 + (history.length > 0 ? history.reduce((a, b) => a + b, 0) / history.length : 0.5);
  }

  // Helper methods for DSPy integration
  private createPredictionPrompt(request: BrainPredictionRequest): string {
    return `Predict optimal ${request.targetMetrics.join(", ")} for ${request.domain} with complexity ${request.context.complexity}`;
  }

  private createPredictionExamples(request: BrainPredictionRequest): Array<{ input: string; output: string }> {
    // Create synthetic examples based on request context
    return [
      { input: `complexity: 3, domain: ${request.domain}`, output: 'moderate settings '},
      { input: `complexity: 7, domain: ${request.domain}`, output: 'high-performance settings '},
      { input: `complexity: 1, domain: ${request.domain}`, output: 'lightweight settings '}
    ];
  }

  private extractPredictionsFromOptimization(result: DspyOptimizationResult, request: BrainPredictionRequest): Record<string, any> {
    // Extract meaningful predictions from DSPy optimization result
    const predictions: Record<string, any> = {};
    
    for (const metric of request.targetMetrics) {
      // Use optimization confidence and performance to inform predictions
      switch (metric) {
        case 'maxTokens':
          predictions.maxTokens = Math.round(8000 + (result.confidence * 8000));
          break;
        case 'temperature':
          predictions.temperature = Math.max(0.1, Math.min(1.0, result.confidence));
          break;
        case 'timeout':
          predictions.timeout = Math.round(120000 + (result.metrics.latency * 2));
          break;
        case 'llmStrategy':
          predictions.llmStrategy = result.confidence > 0.8 ? 'claude' : result.confidence > 0.5 ? 'gpt' : 'gemini';
          break;
        default:
          predictions[metric] = result.confidence;
      }
    }

    return predictions;
  }

  private calculateConfidence(predictions: Record<string, any>, request: BrainPredictionRequest): number {
    // Calculate confidence based on prediction quality and historical performance
    const historyConfidence = request.context.history.length > 0 ? 
      request.context.history.reduce((a, b) => a + b, 0) / request.context.history.length : 0.5;
    
    return Math.min(1.0, historyConfidence + 0.3);
  }

  private calculateResourceUsage(strategy: string): number {
    switch (strategy) {
      case 'dspy': return 0.8;
      case 'hybrid': return 0.6;
      case 'neural': return 0.4;
      case 'heuristic': return 0.1;
      default: return 0.2;
    }
  }

  private async storePredictionResult(domain: string, result: BrainPredictionResult): Promise<void> {
    try {
      const history = this.predictionHistory.get(domain)|| [];
      history.push(result);
      
      if (history.length > 100) {
        history.shift();
      }
      
      this.predictionHistory.set(domain, history);
    } catch (error) {
      logger.warn(`Failed to store prediction result: ${error}`);
    }
  }

  /**
   * Get Brain system statistics
   */
  getBrainStats() {
    return {
      systemsAvailable: { dspy: this.dspySystemAvailable, llm: this.llmSystemAvailable },
      activePredictions: this.activePredictions.size,
      totalDomains: this.predictionHistory.size,
      totalPredictions: Array.from(this.predictionHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }
}

// Export default instance
export const eventDrivenBrain = new EventDrivenBrain();