/**
 * Provider Manager
 * Central coordination system for multi-LLM provider management
 */

import { EventEmitter } from 'events';
import { 
  AIRequest, 
  AIResponse, 
  BaseProvider,
  ProviderConfig,
  ProviderStatus,
  ProviderMetrics,
  LoadBalancingStrategy,
  ProviderError,
  RateLimitError,
  QuotaExceededError
} from './types.js';

// Import all providers
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';
import { CohereProvider } from './cohere.js';
import { GoogleProvider } from './google.js';
import { OllamaProvider } from './ollama.js';

interface ProviderInstance {
  provider: BaseProvider;
  config: ProviderConfig;
  status: ProviderStatus;
  metrics: ProviderMetrics;
  circuitBreakerOpen: boolean;
  circuitBreakerOpenTime?: Date;
}

interface ProviderManagerConfig {
  loadBalancing: LoadBalancingStrategy;
  healthCheckInterval: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  enableCaching: boolean;
  cacheTimeout: number;
  enableFallback: boolean;
  fallbackOrder: string[];
  globalTimeout: number;
}

interface CacheEntry {
  response: AIResponse;
  timestamp: Date;
  hash: string;
}

export class ProviderManager extends EventEmitter {
  private providers: Map<string, ProviderInstance> = new Map();
  private requestCache: Map<string, CacheEntry> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private requestQueue: Array<{ request: AIRequest; resolve: Function; reject: Function }> = [];
  private processingQueue = false;

  private config: ProviderManagerConfig = {
    loadBalancing: { type: 'least_latency' },
    healthCheckInterval: 300000, // 5 minutes
    circuitBreakerThreshold: 0.5, // 50% error rate
    circuitBreakerTimeout: 60000, // 1 minute
    enableCaching: true,
    cacheTimeout: 3600000, // 1 hour
    enableFallback: true,
    fallbackOrder: ['anthropic', 'openai', 'cohere', 'google', 'ollama'],
    globalTimeout: 30000 // 30 seconds
  };

  constructor(config?: Partial<ProviderManagerConfig>) {
    super();
    this.config = { ...this.config, ...config };
    this.setupHealthChecking();
    this.setupCacheCleanup();
  }

  // Provider Registration
  async registerProvider(
    name: string, 
    providerClass: new() => BaseProvider, 
    config: any
  ): Promise<void> {
    try {
      const provider = new providerClass();
      await provider.initialize(config);

      const providerInstance: ProviderInstance = {
        provider,
        config: provider.config,
        status: await provider.getStatus(),
        metrics: await provider.getMetrics(),
        circuitBreakerOpen: false
      };

      // Set up event listeners
      provider.on('request', (event) => this.emit('provider_request', { provider: name, ...event }));
      provider.on('response', (event) => this.emit('provider_response', { provider: name, ...event }));
      provider.on('error', (event) => this.emit('provider_error', { provider: name, ...event }));
      provider.on('health_check', (event) => this.emit('provider_health', { provider: name, ...event }));

      this.providers.set(name, providerInstance);
      this.emit('provider_registered', { name, provider: providerInstance });

      console.log(`Provider ${name} registered successfully`);
    } catch (error) {
      console.error(`Failed to register provider ${name}:`, error);
      throw error;
    }
  }

  // Auto-register all built-in providers
  async initializeBuiltInProviders(configs: Record<string, any> = {}): Promise<void> {
    const providerClasses = {
      anthropic: AnthropicProvider,
      openai: OpenAIProvider,
      cohere: CohereProvider,
      google: GoogleProvider,
      ollama: OllamaProvider
    };

    for (const [name, ProviderClass] of Object.entries(providerClasses)) {
      try {
        if (configs[name]) {
          await this.registerProvider(name, ProviderClass, configs[name]);
        }
      } catch (error) {
        console.warn(`Skipping provider ${name}: ${error.message}`);
      }
    }
  }

  // Main generation method with intelligent routing
  async generateText(request: AIRequest): Promise<AIResponse> {
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getCachedResponse(request);
      if (cached) {
        this.emit('cache_hit', { requestId: request.id, provider: 'cache' });
        return cached;
      }
    }

    // Add timeout to request
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.config.globalTimeout);
    });

    try {
      const result = await Promise.race([
        this.executeRequest(request),
        timeoutPromise
      ]);

      // Cache successful responses
      if (this.config.enableCaching) {
        this.cacheResponse(request, result);
      }

      return result;
    } catch (error) {
      this.emit('request_failed', { 
        requestId: request.id, 
        error: error.message 
      });
      throw error;
    }
  }

  // Streaming generation with provider selection
  async *generateStream(request: AIRequest): AsyncIterable<string> {
    const provider = await this.selectProvider(request);
    
    if (!provider) {
      throw new ProviderError('No available providers', 'manager', 'NO_PROVIDERS');
    }

    try {
      yield* provider.provider.generateStream(request);
    } catch (error) {
      // Try fallback for streaming
      if (this.config.enableFallback) {
        const fallbackProvider = await this.selectFallbackProvider(request, provider.provider.name);
        if (fallbackProvider) {
          yield* fallbackProvider.provider.generateStream(request);
          return;
        }
      }
      throw error;
    }
  }

  // Provider selection logic
  private async selectProvider(request: AIRequest): Promise<ProviderInstance | null> {
    // Filter available providers
    const availableProviders = Array.from(this.providers.values()).filter(p => 
      p.config.enabled && 
      !p.circuitBreakerOpen &&
      p.provider.capabilities.models?.includes(request.model)
    );

    if (availableProviders.length === 0) {
      return null;
    }

    // Apply load balancing strategy
    switch (this.config.loadBalancing.type) {
      case 'round_robin':
        return this.selectRoundRobin(availableProviders);
      
      case 'least_latency':
        return this.selectLeastLatency(availableProviders);
      
      case 'least_cost':
        return this.selectLeastCost(availableProviders);
      
      case 'weighted':
        return this.selectWeighted(availableProviders, this.config.loadBalancing.weights || {});
      
      case 'priority':
        return this.selectByPriority(availableProviders, this.config.loadBalancing.priorities || {});
      
      default:
        return availableProviders[0];
    }
  }

  private async executeRequest(request: AIRequest): Promise<AIResponse> {
    const provider = await this.selectProvider(request);
    
    if (!provider) {
      throw new ProviderError('No available providers', 'manager', 'NO_PROVIDERS');
    }

    try {
      const response = await provider.provider.generateText(request);
      
      // Update circuit breaker status
      this.updateCircuitBreaker(provider, false);
      
      return response;
    } catch (error) {
      // Update circuit breaker status
      this.updateCircuitBreaker(provider, true);
      
      // Try fallback if enabled
      if (this.config.enableFallback && 
          !(error instanceof RateLimitError) && 
          !(error instanceof QuotaExceededError)) {
        
        const fallbackProvider = await this.selectFallbackProvider(request, provider.provider.name);
        if (fallbackProvider) {
          return await fallbackProvider.provider.generateText(request);
        }
      }
      
      throw error;
    }
  }

  private async selectFallbackProvider(
    request: AIRequest, 
    excludeProvider: string
  ): Promise<ProviderInstance | null> {
    for (const providerName of this.config.fallbackOrder) {
      if (providerName === excludeProvider) continue;
      
      const provider = this.providers.get(providerName);
      if (provider && 
          provider.config.enabled && 
          !provider.circuitBreakerOpen &&
          provider.provider.capabilities.models?.includes(request.model)) {
        return provider;
      }
    }
    return null;
  }

  // Load balancing strategies
  private selectRoundRobin(providers: ProviderInstance[]): ProviderInstance {
    // Simple round-robin implementation
    const index = Math.floor(Math.random() * providers.length);
    return providers[index];
  }

  private selectLeastLatency(providers: ProviderInstance[]): ProviderInstance {
    return providers.reduce((best, current) => 
      current.metrics.averageResponseTime < best.metrics.averageResponseTime ? current : best
    );
  }

  private selectLeastCost(providers: ProviderInstance[]): ProviderInstance {
    return providers.reduce((best, current) => {
      const currentCostPerToken = current.metrics.totalCost / Math.max(current.metrics.totalTokensUsed, 1);
      const bestCostPerToken = best.metrics.totalCost / Math.max(best.metrics.totalTokensUsed, 1);
      return currentCostPerToken < bestCostPerToken ? current : best;
    });
  }

  private selectWeighted(providers: ProviderInstance[], weights: Record<string, number>): ProviderInstance {
    const weightedProviders = providers.filter(p => weights[p.provider.name] > 0);
    if (weightedProviders.length === 0) return providers[0];

    const totalWeight = weightedProviders.reduce((sum, p) => sum + (weights[p.provider.name] || 1), 0);
    let random = Math.random() * totalWeight;

    for (const provider of weightedProviders) {
      random -= weights[provider.provider.name] || 1;
      if (random <= 0) return provider;
    }

    return weightedProviders[0];
  }

  private selectByPriority(providers: ProviderInstance[], priorities: Record<string, number>): ProviderInstance {
    return providers.reduce((best, current) => {
      const currentPriority = priorities[current.provider.name] || 0;
      const bestPriority = priorities[best.provider.name] || 0;
      return currentPriority > bestPriority ? current : best;
    });
  }

  // Circuit breaker logic
  private updateCircuitBreaker(provider: ProviderInstance, isError: boolean): void {
    if (isError) {
      const errorRate = provider.metrics.failedRequests / Math.max(provider.metrics.totalRequests, 1);
      
      if (errorRate >= this.config.circuitBreakerThreshold) {
        provider.circuitBreakerOpen = true;
        provider.circuitBreakerOpenTime = new Date();
        
        this.emit('circuit_breaker_opened', { 
          provider: provider.provider.name, 
          errorRate 
        });
        
        // Schedule circuit breaker reset
        setTimeout(() => {
          provider.circuitBreakerOpen = false;
          provider.circuitBreakerOpenTime = undefined;
          
          this.emit('circuit_breaker_closed', { 
            provider: provider.provider.name 
          });
        }, this.config.circuitBreakerTimeout);
      }
    }
  }

  // Caching
  private getCachedResponse(request: AIRequest): AIResponse | null {
    const hash = this.hashRequest(request);
    const cached = this.requestCache.get(hash);
    
    if (cached && Date.now() - cached.timestamp.getTime() < this.config.cacheTimeout) {
      return { ...cached.response, id: request.id }; // Update ID for new request
    }
    
    if (cached) {
      this.requestCache.delete(hash);
    }
    
    return null;
  }

  private cacheResponse(request: AIRequest, response: AIResponse): void {
    const hash = this.hashRequest(request);
    this.requestCache.set(hash, {
      response: { ...response },
      timestamp: new Date(),
      hash
    });
  }

  private hashRequest(request: AIRequest): string {
    // Create hash from request content (excluding ID and timestamp)
    const hashContent = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      systemPrompt: request.systemPrompt
    };
    
    return Buffer.from(JSON.stringify(hashContent)).toString('base64');
  }

  // Health checking
  private setupHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [name, provider] of this.providers) {
        try {
          const isHealthy = await provider.provider.healthCheck();
          provider.status = await provider.provider.getStatus();
          provider.metrics = await provider.provider.getMetrics();
          
          if (!isHealthy && provider.config.enabled) {
            this.emit('provider_unhealthy', { name, provider });
          }
        } catch (error) {
          this.emit('health_check_error', { name, error: error.message });
        }
      }
    }, this.config.healthCheckInterval);
  }

  private setupCacheCleanup(): void {
    // Clean up expired cache entries every hour
    setInterval(() => {
      const now = Date.now();
      for (const [hash, entry] of this.requestCache) {
        if (now - entry.timestamp.getTime() >= this.config.cacheTimeout) {
          this.requestCache.delete(hash);
        }
      }
    }, 3600000);
  }

  // Status and metrics
  async getProviderStatuses(): Promise<Record<string, ProviderStatus>> {
    const statuses: Record<string, ProviderStatus> = {};
    
    for (const [name, provider] of this.providers) {
      statuses[name] = await provider.provider.getStatus();
    }
    
    return statuses;
  }

  async getProviderMetrics(): Promise<Record<string, ProviderMetrics>> {
    const metrics: Record<string, ProviderMetrics> = {};
    
    for (const [name, provider] of this.providers) {
      metrics[name] = await provider.provider.getMetrics();
    }
    
    return metrics;
  }

  getAvailableModels(): string[] {
    const models = new Set<string>();
    
    for (const provider of this.providers.values()) {
      if (provider.config.enabled && !provider.circuitBreakerOpen) {
        for (const model of provider.provider.capabilities.models || []) {
          models.add(model);
        }
      }
    }
    
    return Array.from(models);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    for (const provider of this.providers.values()) {
      await provider.provider.cleanup();
    }
    
    this.providers.clear();
    this.requestCache.clear();
  }
}