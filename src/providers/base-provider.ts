/**
 * Base Provider Implementation
 * Abstract base class for all AI providers with common functionality
 */

import { EventEmitter } from 'events';
import { 
  AIRequest, 
  AIResponse, 
  BaseProvider as IBaseProvider,
  ProviderConfig,
  ProviderCapabilities,
  ProviderStatus,
  ProviderMetrics,
  ProviderError,
  TokenUsage,
  PricingInfo
} from './types.js';

export abstract class BaseProvider extends EventEmitter implements IBaseProvider {
  abstract name: string;
  abstract version: string;
  abstract config: ProviderConfig;
  abstract capabilities: ProviderCapabilities;
  protected pricing: PricingInfo = {
    inputTokenPrice: 0,
    outputTokenPrice: 0,
    currency: 'USD'
  };

  protected metrics: ProviderMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    errorsByType: {},
    requestsByModel: {},
    latencyP95: 0,
    latencyP99: 0
  };

  protected responseTimeHistory: number[] = [];
  protected lastHealthCheck: Date = new Date();
  protected isHealthy: boolean = true;

  constructor() {
    super();
    this.setupMetricsTracking();
  }

  // Abstract methods that must be implemented by providers
  abstract initialize(config: any): Promise<void>;
  abstract generateText(request: AIRequest): Promise<AIResponse>;
  abstract generateStream(request: AIRequest): AsyncIterable<string>;
  abstract getModels(): Promise<string[]>;
  abstract cleanup(): Promise<void>;

  // Common functionality for all providers
  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Simple health check - try to get models
      await this.getModels();
      
      const responseTime = Date.now() - startTime;
      this.updateHealthStatus(true, responseTime);
      
      this.emit('health_check', { 
        provider: this.name, 
        healthy: true, 
        responseTime 
      });
      
      return true;
    } catch (error) {
      this.updateHealthStatus(false, 0);
      
      this.emit('health_check', { 
        provider: this.name, 
        healthy: false, 
        error: error.message 
      });
      
      return false;
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - this.lastHealthCheck.getTime();
    
    // Auto health check if it's been too long
    if (timeSinceLastCheck > (this.config.healthCheckInterval || 300000)) {
      await this.healthCheck();
    }

    return {
      name: this.name,
      status: this.isHealthy ? 'healthy' : 'offline',
      lastCheck: this.lastHealthCheck,
      responseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate(),
      requestCount: this.metrics.totalRequests,
      tokenCount: this.metrics.totalTokensUsed,
      cost: this.metrics.totalCost
    };
  }

  async getMetrics(): Promise<ProviderMetrics> {
    // Calculate P95 and P99 latencies
    if (this.responseTimeHistory.length > 0) {
      const sorted = [...this.responseTimeHistory].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p99Index = Math.floor(sorted.length * 0.99);
      
      this.metrics.latencyP95 = sorted[p95Index] || 0;
      this.metrics.latencyP99 = sorted[p99Index] || 0;
    }

    return { ...this.metrics };
  }

  // Protected helper methods
  protected validateRequest(request: AIRequest): void {
    if (!request.messages || request.messages.length === 0) {
      throw new ProviderError('Messages are required', this.name, 'INVALID_REQUEST');
    }
    if (!request.model) {
      throw new ProviderError('Model is required', this.name, 'INVALID_REQUEST');
    }
    if (!this.capabilities.models?.includes(request.model)) {
      throw new ProviderError(`Model ${request.model} not supported`, this.name, 'MODEL_NOT_SUPPORTED');
    }
  }

  protected calculateCost(usage: TokenUsage): number {
    const inputCost = (usage.promptTokens / 1000) * this.pricing.inputTokenPrice;
    const outputCost = (usage.completionTokens / 1000) * this.pricing.outputTokenPrice;
    return inputCost + outputCost;
  }

  protected updateMetrics(request: AIRequest, response: AIResponse, error?: Error): void {
    this.metrics.totalRequests++;
    
    if (error) {
      this.metrics.failedRequests++;
      const errorType = error.constructor.name;
      this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;
    } else {
      this.metrics.successfulRequests++;
      this.metrics.totalTokensUsed += response.usage.totalTokens;
      this.metrics.totalCost += response.usage.cost || 0;
      
      // Track requests by model
      this.metrics.requestsByModel[request.model] = 
        (this.metrics.requestsByModel[request.model] || 0) + 1;
      
      // Update response time tracking
      this.responseTimeHistory.push(response.responseTime);
      
      // Keep only last 1000 response times for memory efficiency
      if (this.responseTimeHistory.length > 1000) {
        this.responseTimeHistory = this.responseTimeHistory.slice(-1000);
      }
      
      // Update average response time
      this.metrics.averageResponseTime = 
        this.responseTimeHistory.reduce((sum, time) => sum + time, 0) / 
        this.responseTimeHistory.length;
    }
  }

  protected updateHealthStatus(healthy: boolean, responseTime: number): void {
    this.isHealthy = healthy;
    this.lastHealthCheck = new Date();
    
    if (healthy && responseTime > 0) {
      this.responseTimeHistory.push(responseTime);
    }
  }

  protected getAverageResponseTime(): number {
    if (this.responseTimeHistory.length === 0) return 0;
    return this.responseTimeHistory.reduce((sum, time) => sum + time, 0) / 
           this.responseTimeHistory.length;
  }

  protected getErrorRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.failedRequests / this.metrics.totalRequests;
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.retryAttempts || 3,
    delay: number = this.config.retryDelay || 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain error types
        if (error instanceof ProviderError && 
            ['INVALID_REQUEST', 'MODEL_NOT_SUPPORTED'].includes(error.code)) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          await this.sleep(delay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupMetricsTracking(): void {
    // Reset metrics periodically to prevent memory leaks
    setInterval(() => {
      // Keep only recent history
      if (this.responseTimeHistory.length > 10000) {
        this.responseTimeHistory = this.responseTimeHistory.slice(-1000);
      }
    }, 3600000); // Every hour
  }

  // Event emission helpers
  protected emitRequest(request: AIRequest): void {
    this.emit('request', {
      type: 'request',
      provider: this.name,
      timestamp: new Date(),
      data: { 
        id: request.id, 
        model: request.model, 
        messageCount: request.messages.length 
      }
    });
  }

  protected emitResponse(response: AIResponse): void {
    this.emit('response', {
      type: 'response',
      provider: this.name,
      timestamp: new Date(),
      data: {
        id: response.id,
        model: response.model,
        usage: response.usage,
        responseTime: response.responseTime
      }
    });
  }

  protected emitError(error: Error, request?: AIRequest): void {
    this.emit('error', {
      type: 'error',
      provider: this.name,
      timestamp: new Date(),
      data: {
        error: error.message,
        requestId: request?.id,
        model: request?.model
      }
    });
  }
}