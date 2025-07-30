/**
 * AI Provider Plugin (TypeScript)
 * Comprehensive multi-model AI/LLM provider support with production features
 */

import { BasePlugin } from '../base-plugin.js';
import {
  PluginManifest,
  PluginConfig,
  PluginContext,
  JSONObject
} from '../../types/plugin.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';
import { performance } from 'perf_hooks';

// Provider interfaces
interface AIProviderResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model: string;
  [key: string]: any;
}

interface StreamingResponse {
  [Symbol.asyncIterator](): AsyncIterableIterator<string>;
}

interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage?: any;
}

interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  [key: string]: any;
}

// Base provider abstract class
abstract class BaseProvider {
  protected config: ProviderConfig;
  public readonly name: string;
  public isReady: boolean = false;
  public supportsStreaming: boolean = false;
  public supportsEmbeddings: boolean = false;
  public supportsStructured: boolean = true;
  public supportsVision: boolean = false;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.name = this.constructor.name.replace('Provider', '').toLowerCase();
  }

  abstract initialize(): Promise<void>;
  abstract generateText(prompt: string, options?: JSONObject): Promise<AIProviderResponse>;
  abstract generateStructured(prompt: string, schema: JSONObject, options?: JSONObject): Promise<any>;
  
  async createEmbedding(text: string, options?: JSONObject): Promise<EmbeddingResponse> {
    throw new Error(`Provider ${this.name} does not support embeddings`);
  }

  async streamText(prompt: string, options?: JSONObject): Promise<StreamingResponse> {
    throw new Error(`Provider ${this.name} does not support streaming`);
  }

  async cleanup(): Promise<void> {
    this.isReady = false;
  }

  protected parseJSONResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Claude Provider Implementation
class ClaudeProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';
  private model: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.supportsStreaming = true;
    this.supportsVision = true;
    this.apiKey = config.claudeApiKey || config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = config.claudeModel || config.model || 'claude-3-sonnet-20240229';
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }
    this.isReady = true;
  }

  async generateText(prompt: string, options: JSONObject = {}): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens
      },
      model: data.model,
      stopReason: data.stop_reason
    };
  }

  async generateStructured(prompt: string, schema: JSONObject, options: JSONObject = {}): Promise<any> {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
    const response = await this.generateText(structuredPrompt, options);
    const parsed = this.parseJSONResponse(response.text);
    
    if (!parsed) {
      throw new Error('Failed to parse structured response from Claude');
    }
    
    return parsed;
  }

  async streamText(prompt: string, options: JSONObject = {}): Promise<StreamingResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Claude streaming error: ${response.status}`);
    }

    return this.parseStream(response.body!);
  }

  private async* parseStream(stream: ReadableStream): AsyncIterableIterator<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta?.text) {
                yield parsed.delta.text;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// OpenAI Provider Implementation
class OpenAIProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private embeddingModel: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.supportsStreaming = true;
    this.supportsEmbeddings = true;
    this.supportsVision = true;
    this.apiKey = config.openaiApiKey || config.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = config.openaiBaseUrl || 'https://api.openai.com/v1';
    this.model = config.openaiModel || config.model || 'gpt-4-turbo-preview';
    this.embeddingModel = config.embeddingModel || 'text-embedding-3-small';
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    this.isReady = true;
  }

  async generateText(prompt: string, options: JSONObject = {}): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens
      },
      model: data.model,
      finishReason: data.choices[0].finish_reason
    };
  }

  async generateStructured(prompt: string, schema: JSONObject, options: JSONObject = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        response_format: { type: 'json_object' },
        tools: [{
          type: 'function',
          function: {
            name: 'respond',
            description: 'Respond with structured data',
            parameters: schema
          }
        }],
        tool_choice: { type: 'function', function: { name: 'respond' } }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices[0].message.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      return JSON.parse(toolCall.function.arguments);
    }

    const parsed = this.parseJSONResponse(data.choices[0].message.content);
    if (!parsed) {
      throw new Error('Failed to parse structured response from OpenAI');
    }
    
    return parsed;
  }

  async createEmbedding(text: string, options: JSONObject = {}): Promise<EmbeddingResponse> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.embeddingModel || this.embeddingModel,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI embeddings error: ${response.status}`);
    }

    const data = await response.json();
    return {
      embedding: data.data[0].embedding,
      model: data.model,
      usage: data.usage
    };
  }

  async streamText(prompt: string, options: JSONObject = {}): Promise<StreamingResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI streaming error: ${response.status}`);
    }

    return this.parseStream(response.body!);
  }

  private async* parseStream(stream: ReadableStream): AsyncIterableIterator<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices[0]?.delta?.content) {
                yield parsed.choices[0].delta.content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Main AI Provider Plugin Class
export class AIProviderPlugin extends BasePlugin {
  private providers: Map<string, BaseProvider> = new Map();
  private activeProvider?: BaseProvider;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private rateLimiter: Map<number, { requests: number; tokens: number }> = new Map();
  private requestQueue: Array<() => void> = [];
  private activeRequests: number = 0;
  
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalTokensUsed: 0,
    averageLatency: 0,
    providerUsage: new Map<string, number>()
  };

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  protected async onInitialize(): Promise<void> {
    this.context.apis.logger.info('Initializing AI Provider Plugin', { 
      provider: this.config.settings.provider || 'claude',
      enableCache: this.config.settings.caching?.enabled || true
    });

    // Create directories for cache and logs
    if (this.config.settings.caching?.enabled) {
      await mkdir(this.config.settings.caching.path || './.hive-mind/ai-cache', { recursive: true });
    }
    if (this.config.settings.logging?.enabled) {
      await mkdir(this.config.settings.logging.path || './.hive-mind/ai-logs', { recursive: true });
    }

    // Initialize providers
    await this.initializeProviders();

    // Set active provider
    const primaryProvider = this.config.settings.provider || 'claude';
    this.activeProvider = this.providers.get(primaryProvider);
    
    if (!this.activeProvider) {
      throw new Error(`Failed to initialize primary provider: ${primaryProvider}`);
    }

    // Load cache if enabled
    if (this.config.settings.caching?.enabled) {
      await this.loadCache();
    }

    // Start rate limiter if enabled
    if (this.config.settings.rateLimiting?.enabled) {
      this.startRateLimiter();
    }

    this.context.apis.logger.info('AI Provider Plugin initialized', {
      providersCount: this.providers.size,
      activeProvider: this.activeProvider.name
    });
  }

  protected async onStart(): Promise<void> {
    // Register APIs
    await this.registerAPI('ai-provider', {
      name: 'ai-provider',
      version: this.manifest.version,
      description: 'Multi-model AI provider with text generation, embeddings, and streaming',
      methods: [
        {
          name: 'generateText',
          description: 'Generate text using the active AI provider',
          parameters: [
            { name: 'prompt', type: 'string', required: true, description: 'The input prompt' },
            { name: 'options', type: 'object', required: false, description: 'Generation options' }
          ],
          returns: { type: 'object', description: 'Generated text response' },
          async: true,
          permissions: ['ai:generate'],
          public: true,
          authenticated: false,
          timeout: 30000,
          caching: true,
          cacheTTL: 3600,
          examples: [{
            name: 'Basic text generation',
            description: 'Generate a simple response',
            request: { prompt: 'What is TypeScript?' },
            response: { text: 'TypeScript is a strongly typed programming language...' }
          }]
        },
        {
          name: 'generateStructured',
          description: 'Generate structured data matching a JSON schema',
          parameters: [
            { name: 'prompt', type: 'string', required: true, description: 'The input prompt' },
            { name: 'schema', type: 'object', required: true, description: 'JSON schema for the response' },
            { name: 'options', type: 'object', required: false, description: 'Generation options' }
          ],
          returns: { type: 'object', description: 'Structured data matching the schema' },
          async: true,
          permissions: ['ai:generate'],
          public: true,
          authenticated: false,
          timeout: 30000,
          caching: true,
          cacheTTL: 3600,
          examples: []
        },
        {
          name: 'createEmbedding',
          description: 'Create vector embeddings for text',
          parameters: [
            { name: 'text', type: 'string', required: true, description: 'Text to embed' },
            { name: 'options', type: 'object', required: false, description: 'Embedding options' }
          ],
          returns: { type: 'object', description: 'Vector embedding response' },
          async: true,
          permissions: ['ai:embed'],
          public: true,
          authenticated: false,
          timeout: 15000,
          caching: true,
          cacheTTL: 86400,
          examples: []
        }
      ]
    });

    // Register hooks
    await this.registerHook('pre-task', async (context) => {
      // Could enhance tasks with AI capabilities
      return {
        success: true,
        continue: true,
        stop: false,
        skip: false,
        executionTime: 0,
        resourcesUsed: await this.getResourceUsage()
      };
    });
  }

  protected async onStop(): Promise<void> {
    // Stop rate limiter
    this.requestQueue = [];
    
    // Persist cache
    if (this.config.settings.caching?.enabled) {
      await this.persistCache();
    }
  }

  protected async onDestroy(): Promise<void> {
    // Cleanup all providers
    for (const [name, provider] of this.providers) {
      try {
        await provider.cleanup();
      } catch (error) {
        this.context.apis.logger.error(`Failed to cleanup provider ${name}`, error);
      }
    }

    this.providers.clear();
    this.cache.clear();
    this.rateLimiter.clear();
  }

  // Public API methods
  async generateText(prompt: string, options: JSONObject = {}): Promise<AIProviderResponse> {
    return this.executeWithRetry(async () => {
      const startTime = performance.now();
      const requestId = crypto.randomBytes(8).toString('hex');
      
      try {
        // Check cache
        const cacheKey = this.getCacheKey('text', prompt, options);
        if (this.config.settings.caching?.enabled && !options.noCache) {
          const cached = await this.getFromCache(cacheKey);
          if (cached) {
            this.metrics.cacheHits++;
            this.emit('cache_hit', { requestId, type: 'text' });
            return cached;
          }
          this.metrics.cacheMisses++;
        }
        
        // Rate limiting
        await this.checkRateLimit();
        
        // Execute request
        this.emit('request_start', { requestId, type: 'text', provider: this.activeProvider!.name });
        
        const result = await this.activeProvider!.generateText(prompt, options);
        
        // Update metrics
        const latency = performance.now() - startTime;
        this.updateMetrics(result, latency);
        
        // Cache result
        if (this.config.settings.caching?.enabled && !options.noCache) {
          await this.saveToCache(cacheKey, result);
        }
        
        // Log request
        if (this.config.settings.logging?.enabled) {
          await this.logRequest({
            requestId,
            type: 'text',
            prompt: this.config.settings.logging.includePrompts ? prompt : '[REDACTED]',
            options,
            result: { ...result, text: result.text.substring(0, 100) + '...' },
            latency,
            timestamp: new Date().toISOString()
          });
        }
        
        this.emit('request_complete', { requestId, type: 'text', latency });
        return result;
        
      } catch (error) {
        this.metrics.failedRequests++;
        this.emit('request_error', { requestId, error: error.message });
        throw error;
      }
    });
  }

  async generateStructured(prompt: string, schema: JSONObject, options: JSONObject = {}): Promise<any> {
    return this.executeWithRetry(async () => {
      const startTime = performance.now();
      const requestId = crypto.randomBytes(8).toString('hex');
      
      try {
        // Check cache
        const cacheKey = this.getCacheKey('structured', prompt, { schema, ...options });
        if (this.config.settings.caching?.enabled && !options.noCache) {
          const cached = await this.getFromCache(cacheKey);
          if (cached) {
            this.metrics.cacheHits++;
            this.emit('cache_hit', { requestId, type: 'structured' });
            return cached;
          }
          this.metrics.cacheMisses++;
        }
        
        // Rate limiting
        await this.checkRateLimit();
        
        // Execute request
        this.emit('request_start', { requestId, type: 'structured', provider: this.activeProvider!.name });
        
        const result = await this.activeProvider!.generateStructured(prompt, schema, options);
        
        // Validate against schema (basic validation)
        this.validateSchema(result, schema);
        
        // Update metrics
        const latency = performance.now() - startTime;
        this.updateMetrics({ text: JSON.stringify(result), usage: result.usage }, latency);
        
        // Cache result
        if (this.config.settings.caching?.enabled && !options.noCache) {
          await this.saveToCache(cacheKey, result);
        }
        
        this.emit('request_complete', { requestId, type: 'structured', latency });
        return result;
        
      } catch (error) {
        this.metrics.failedRequests++;
        this.emit('request_error', { requestId, error: error.message });
        throw error;
      }
    });
  }

  async createEmbedding(text: string, options: JSONObject = {}): Promise<EmbeddingResponse> {
    if (!this.activeProvider!.supportsEmbeddings) {
      throw new Error(`Provider ${this.activeProvider!.name} does not support embeddings`);
    }
    
    return this.executeWithRetry(async () => {
      const result = await this.activeProvider!.createEmbedding(text, options);
      this.emit('embedding_created', { dimensions: result.embedding.length });
      return result;
    });
  }

  async streamText(prompt: string, options: JSONObject = {}): Promise<StreamingResponse> {
    const requestId = crypto.randomBytes(8).toString('hex');
    
    try {
      // Rate limiting
      await this.checkRateLimit();
      
      // Check if provider supports streaming
      if (!this.activeProvider!.supportsStreaming) {
        // Fallback to non-streaming
        const result = await this.generateText(prompt, options);
        return this.createStreamFromText(result.text);
      }
      
      this.emit('stream_start', { requestId, provider: this.activeProvider!.name });
      
      const stream = await this.activeProvider!.streamText(prompt, options);
      
      // Wrap stream to track metrics
      return this.wrapStream(stream, requestId);
      
    } catch (error) {
      this.emit('stream_error', { requestId, error: error.message });
      throw error;
    }
  }

  // Provider management methods
  async getProviderStatus(): Promise<JSONObject> {
    const providers: JSONObject = {};
    
    for (const [name, provider] of this.providers) {
      providers[name] = {
        status: provider.isReady ? 'ready' : 'not_ready',
        capabilities: {
          streaming: provider.supportsStreaming,
          embeddings: provider.supportsEmbeddings,
          structured: provider.supportsStructured,
          vision: provider.supportsVision
        }
      };
    }
    
    return {
      activeProvider: this.activeProvider?.name || null,
      providers,
      metrics: {
        ...this.metrics,
        providerUsage: Object.fromEntries(this.metrics.providerUsage)
      },
      rateLimits: Object.fromEntries(this.rateLimiter),
      cache: {
        size: this.cache.size,
        hitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
      }
    };
  }

  // Private helper methods
  private async initializeProviders(): Promise<void> {
    const providerClasses = {
      claude: ClaudeProvider,
      openai: OpenAIProvider
      // Add more providers as needed
    };
    
    // Initialize primary provider
    const primaryProvider = this.config.settings.provider || 'claude';
    const PrimaryClass = providerClasses[primaryProvider as keyof typeof providerClasses];
    
    if (PrimaryClass) {
      try {
        const provider = new PrimaryClass(this.config.settings);
        await provider.initialize();
        this.providers.set(primaryProvider, provider);
      } catch (error) {
        this.context.apis.logger.warn(`Failed to initialize ${primaryProvider}`, { error: error.message });
      }
    }
    
    // Initialize fallback providers
    const fallbackProviders = this.config.settings.fallbackProviders || [];
    for (const fallbackName of fallbackProviders) {
      if (this.providers.has(fallbackName)) continue;
      
      const FallbackClass = providerClasses[fallbackName as keyof typeof providerClasses];
      if (FallbackClass) {
        try {
          const provider = new FallbackClass(this.config.settings);
          await provider.initialize();
          this.providers.set(fallbackName, provider);
        } catch (error) {
          this.context.apis.logger.warn(`Failed to initialize fallback ${fallbackName}`, { error: error.message });
        }
      }
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxAttempts = this.config.settings.retryAttempts || 3;
    const retryDelay = this.config.settings.retryDelay || 1000;
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        if (this.activeProvider) {
          return await operation();
        }
      } catch (error) {
        lastError = error as Error;
        this.context.apis.logger.warn(`Attempt ${attempt + 1} failed`, { error: error.message });
        
        if (attempt < maxAttempts) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
          
          // Try fallback provider if available
          if (attempt > 0) {
            const fallbackProviders = this.config.settings.fallbackProviders || [];
            if (fallbackProviders.length > 0) {
              const fallbackIndex = (attempt - 1) % fallbackProviders.length;
              const fallbackName = fallbackProviders[fallbackIndex];
              const fallbackProvider = this.providers.get(fallbackName);
              
              if (fallbackProvider) {
                this.context.apis.logger.info(`Switching to fallback provider: ${fallbackName}`);
                this.activeProvider = fallbackProvider;
              }
            }
          }
        }
      }
    }
    
    throw lastError! || new Error('All retry attempts failed');
  }

  private async checkRateLimit(): Promise<void> {
    const rateLimitConfig = this.config.settings.rateLimiting;
    if (!rateLimitConfig?.enabled) return;
    
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    if (!this.rateLimiter.has(minute)) {
      this.rateLimiter.set(minute, { requests: 0, tokens: 0 });
      
      // Clean old entries
      for (const [key] of this.rateLimiter) {
        if (key < minute - 1) {
          this.rateLimiter.delete(key);
        }
      }
    }
    
    const currentMinute = this.rateLimiter.get(minute)!;
    
    // Check concurrent requests
    if (this.activeRequests >= (rateLimitConfig.concurrentRequests || 5)) {
      await new Promise<void>(resolve => {
        this.requestQueue.push(resolve);
      });
    }
    
    // Check rate limits
    if (currentMinute.requests >= (rateLimitConfig.requestsPerMinute || 60)) {
      const waitTime = (minute + 1) * 60000 - now;
      this.context.apis.logger.info(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkRateLimit();
    }
    
    currentMinute.requests++;
    this.activeRequests++;
  }

  private releaseRateLimit(): void {
    this.activeRequests--;
    if (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve?.();
    }
  }

  private updateMetrics(result: AIProviderResponse, latency: number): void {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    
    if (result.usage) {
      this.metrics.totalTokensUsed += (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0);
    }
    
    // Update average latency
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.successfulRequests - 1) + latency) / 
      this.metrics.successfulRequests;
    
    // Update provider usage
    const providerName = this.activeProvider!.name;
    this.metrics.providerUsage.set(
      providerName,
      (this.metrics.providerUsage.get(providerName) || 0) + 1
    );
    
    this.releaseRateLimit();
  }

  private getCacheKey(type: string, prompt: string, options: JSONObject): string {
    const hash = crypto.createHash('sha256');
    hash.update(type);
    hash.update(prompt);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  private async getFromCache(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const ttl = this.config.settings.caching?.ttl || 3600000;
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private async saveToCache(key: string, data: any): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Enforce max size
    const maxSize = this.config.settings.caching?.maxSize || 100;
    if (this.cache.size > maxSize) {
      const oldest = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      this.cache.delete(oldest[0]);
    }
    
    // Persist cache
    await this.persistCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const cachePath = join(this.config.settings.caching?.path || './.hive-mind/ai-cache', 'cache.json');
      const data = await readFile(cachePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Load valid entries
      const now = Date.now();
      const ttl = this.config.settings.caching?.ttl || 3600000;
      
      for (const [key, value] of Object.entries(parsed)) {
        const cached = value as { data: any; timestamp: number };
        if (now - cached.timestamp <= ttl) {
          this.cache.set(key, cached);
        }
      }
      
      this.context.apis.logger.info(`Loaded ${this.cache.size} cached entries`);
    } catch (error) {
      // No cache file, that's OK
    }
  }

  private async persistCache(): Promise<void> {
    try {
      const cachePath = join(this.config.settings.caching?.path || './.hive-mind/ai-cache', 'cache.json');
      const data = Object.fromEntries(this.cache);
      await writeFile(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      this.context.apis.logger.error('Failed to persist cache', error);
    }
  }

  private async logRequest(logEntry: JSONObject): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logPath = join(this.config.settings.logging?.path || './.hive-mind/ai-logs', `requests-${date}.jsonl`);
      await writeFile(logPath, JSON.stringify(logEntry) + '\n', { flag: 'a' });
    } catch (error) {
      this.context.apis.logger.error('Failed to log request', error);
    }
  }

  private validateSchema(data: any, schema: JSONObject): void {
    // Basic schema validation - could use a proper validator like ajv
    if (schema.type === 'object' && schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propSchema = prop as JSONObject;
        if (propSchema.required && !(key in data)) {
          throw new Error(`Missing required property: ${key}`);
        }
      }
    }
  }

  private createStreamFromText(text: string): StreamingResponse {
    async function* textGenerator() {
      const words = text.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
      }
    }
    return textGenerator();
  }

  private wrapStream(stream: StreamingResponse, requestId: string): StreamingResponse {
    const self = this;
    let totalTokens = 0;
    
    async function* wrappedGenerator() {
      try {
        for await (const chunk of stream) {
          totalTokens += chunk.length;
          yield chunk;
        }
        self.emit('stream_complete', { requestId, totalTokens });
      } catch (error) {
        self.emit('stream_error', { requestId, error: error.message });
        throw error;
      }
    }
    
    return wrappedGenerator();
  }

  private startRateLimiter(): void {
    // Clean up old rate limit entries every minute
    setInterval(() => {
      const now = Date.now();
      const currentMinute = Math.floor(now / 60000);
      
      for (const [minute] of this.rateLimiter) {
        if (minute < currentMinute - 1) {
          this.rateLimiter.delete(minute);
        }
      }
    }, 60000);
  }
}

export default AIProviderPlugin;