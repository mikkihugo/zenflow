/**
 * Multi-LLM Provider Type Definitions
 * Comprehensive type system for AI provider integration
 */

export interface AIProvider {
  name: string;
  version: string;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  capabilities: ProviderCapabilities;
  rateLimits: RateLimits;
  pricing: PricingInfo;
}

export interface ProviderCapabilities {
  textGeneration: boolean;
  codeGeneration: boolean;
  imageGeneration: boolean;
  imageAnalysis: boolean;
  functionCalling: boolean;
  streaming: boolean;
  embeddings: boolean;
  contextWindow: number;
  maxTokens: number;
  supportedLanguages: string[];
}

export interface RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsPerDay?: number;
  tokensPerDay?: number;
  concurrent: number;
}

export interface PricingInfo {
  inputTokenPrice: number;  // per 1K tokens
  outputTokenPrice: number; // per 1K tokens
  currency: string;
  minimumCharge?: number;
}

export interface AIRequest {
  id: string;
  provider: string;
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  stop?: string[];
  stream?: boolean;
  functions?: Function[];
  systemPrompt?: string;
  metadata?: Record<string, any>;
  timeout?: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface Function {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AIResponse {
  id: string;
  provider: string;
  model: string;
  content: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
  functionCall?: FunctionCall;
  metadata?: Record<string, any>;
  responseTime: number;
  timestamp: Date;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  failover: boolean;
  loadBalancing: boolean;
  caching: boolean;
  retryAttempts: number;
  retryDelay: number;
  healthCheck: boolean;
  healthCheckInterval: number;
  customHeaders?: Record<string, string>;
  customParams?: Record<string, any>;
}

export interface ProviderStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  requestCount: number;
  tokenCount: number;
  cost: number;
}

export interface LoadBalancingStrategy {
  type: 'round_robin' | 'least_latency' | 'least_cost' | 'weighted' | 'priority';
  weights?: Record<string, number>;
  priorities?: Record<string, number>;
}

export interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  errorsByType: Record<string, number>;
  requestsByModel: Record<string, number>;
  latencyP95: number;
  latencyP99: number;
}

export interface ProviderEvent {
  type: 'request' | 'response' | 'error' | 'health_check';
  provider: string;
  timestamp: Date;
  data: any;
}

export abstract class BaseProvider {
  abstract name: string;
  abstract version: string;
  abstract config: ProviderConfig;
  abstract capabilities: ProviderCapabilities;

  abstract initialize(config: any): Promise<void>;
  abstract generateText(request: AIRequest): Promise<AIResponse>;
  abstract generateStream(request: AIRequest): AsyncIterable<string>;
  abstract getModels(): Promise<string[]>;
  abstract getStatus(): Promise<ProviderStatus>;
  abstract healthCheck(): Promise<boolean>;
  abstract getMetrics(): Promise<ProviderMetrics>;
  abstract cleanup(): Promise<void>;

  protected validateRequest(request: AIRequest): void {
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages are required');
    }
    if (!request.model) {
      throw new Error('Model is required');
    }
  }

  protected calculateCost(usage: TokenUsage, pricing: PricingInfo): number {
    const inputCost = (usage.promptTokens / 1000) * pricing.inputTokenPrice;
    const outputCost = (usage.completionTokens / 1000) * pricing.outputTokenPrice;
    return inputCost + outputCost;
  }
}

// Provider-specific error types
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, provider, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
  retryAfter?: number;
}

export class QuotaExceededError extends ProviderError {
  constructor(provider: string) {
    super(`Quota exceeded for ${provider}`, provider, 'QUOTA_EXCEEDED');
  }
}

export class ModelNotAvailableError extends ProviderError {
  constructor(provider: string, model: string) {
    super(`Model ${model} not available for ${provider}`, provider, 'MODEL_NOT_AVAILABLE');
  }
}