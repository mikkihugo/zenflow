/**
 * AI Provider Plugin
 * Comprehensive multi-model AI/LLM provider support with production features
 */

import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { BasePlugin } from '../base-plugin.js';
import type { 
  PluginContext, 
  PluginManifest, 
  PluginConfig
} from '../types.js';
import type { HealthStatus } from '../types.js';

// AI Provider Config Interface
interface AIProviderConfig extends PluginConfig {
  caching?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  rateLimiting?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    maxLogs?: number;
    path?: string;
  };
  providers: Record<string, ProviderConfig>;
  defaultProvider: string;
  autoEnhance?: boolean;
  queryExpansion?: boolean;
  fallbackProviders?: string[];
  provider?: string;
}

// Provider interfaces
interface AIProviderResponse {
  text: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  metadata?: Record<string, any>;
}

interface StructuredResponse<T = any> {
  data: T;
  text?: string;
  model?: string;
  usage?: Record<string, any>;
}

interface StreamChunk {
  text: string;
  done: boolean;
  metadata?: Record<string, any>;
}

interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

// Base provider class
export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected name: string;
  
  public readonly supportsStreaming: boolean = false;
  public readonly supportsEmbeddings: boolean = false;
  public readonly supportsStructured: boolean = false;
  public readonly supportsVision: boolean = false;
  
  constructor(config: ProviderConfig) {
    this.config = config;
    this.name = this.constructor.name.replace('Provider', '').toLowerCase();
  }
  
  public getName(): string {
    return this.name;
  }
  
  abstract initialize(): Promise<void>;
  abstract generateText(prompt: string, options?: any): Promise<AIProviderResponse>;
  
  generateStream?(prompt: string, options?: any): AsyncGenerator<StreamChunk, void, unknown>;
  async generateStructured?<T>(prompt: string, schema: any, options?: any): Promise<StructuredResponse<T>>;
  async generateEmbeddings?(texts: string[]): Promise<number[][]>;
  
  public parseJSONResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      return null;
    }
  }
}

// Claude Provider Implementation
class ClaudeProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';
  
  public readonly supportsStreaming = true;
  public readonly supportsStructured = true;
  public readonly supportsVision = true;
  
  constructor(config: ProviderConfig) {
    super(config);
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || '';
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }
  
  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }
  }
  
  async generateText(prompt: string, options: any = {}): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        temperature: options.temperature || this.config.temperature || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    
    return {
      text: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      metadata: data
    };
  }
  
  async *generateStream(prompt: string, options: any = {}): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        temperature: options.temperature || this.config.temperature || 0.7,
        stream: true
      })
    });
    
    if (!response.ok || !response.body) {
      throw new Error(`Claude streaming API error: ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { text: '', done: true };
            return;
          }
          
          try {
            const parsed = JSON.parse(data) as any;
            if (parsed.delta?.text) {
              yield { text: parsed.delta.text, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
  
  async generateStructured<T>(prompt: string, schema: any, options: any = {}): Promise<StructuredResponse<T>> {
    const structuredPrompt = `${prompt}\n\nPlease respond with valid JSON that matches this schema:\n${JSON.stringify(schema, null, 2)}`;
    
    const response = await this.generateText(structuredPrompt, options);
    const data = this.parseJSONResponse(response.text);
    
    if (!data) {
      throw new Error('Failed to parse structured response from Claude');
    }
    
    return {
      data,
      text: response.text,
      model: response.model,
      usage: response.usage
    };
  }
}

// OpenAI Provider Implementation
class OpenAIProvider extends BaseProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  
  public readonly supportsStreaming = true;
  public readonly supportsEmbeddings = true;
  public readonly supportsStructured = true;
  
  constructor(config: ProviderConfig) {
    super(config);
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }
  
  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }
  
  async generateText(prompt: string, options: any = {}): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        temperature: options.temperature || this.config.temperature || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    
    return {
      text: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens
      },
      metadata: data
    };
  }
  
  async *generateStream(prompt: string, options: any = {}): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        temperature: options.temperature || this.config.temperature || 0.7,
        stream: true
      })
    });
    
    if (!response.ok || !response.body) {
      throw new Error(`OpenAI streaming API error: ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { text: '', done: true };
            return;
          }
          
          try {
            const parsed = JSON.parse(data) as any;
            if (parsed.choices[0]?.delta?.content) {
              yield { text: parsed.choices[0].delta.content, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
  
  async generateStructured<T>(prompt: string, schema: any, options: any = {}): Promise<StructuredResponse<T>> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        temperature: options.temperature || this.config.temperature || 0.7,
        functions: [{
          name: 'respond',
          description: 'Respond with structured data',
          parameters: schema
        }],
        function_call: { name: 'respond' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const result = await response.json() as any;
    const functionCall = result.choices[0].message.function_call;
    const data = JSON.parse(functionCall.arguments);
    
    return {
      data,
      text: result.choices[0].message.content,
      model: result.model,
      usage: {
        promptTokens: result.usage?.prompt_tokens,
        completionTokens: result.usage?.completion_tokens,
        totalTokens: result.usage?.total_tokens
      }
    };
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: texts
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI Embeddings API error: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    return data.data.map((item: any) => item.embedding);
  }
}

// Ollama Provider Implementation
class OllamaProvider extends BaseProvider {
  private baseUrl = 'http://localhost:11434';
  
  public readonly supportsStreaming = true;
  public readonly supportsEmbeddings = true;
  
  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }
  
  async initialize(): Promise<void> {
    // Check if Ollama is running
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Ollama is not running');
      }
    } catch (error) {
      throw new Error(`Failed to connect to Ollama at ${this.baseUrl}`);
    }
  }
  
  async generateText(prompt: string, options: any = {}): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || this.config.temperature || 0.7,
          num_predict: options.maxTokens || this.config.maxTokens || 4096
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    
    return {
      text: data.response,
      model: data.model,
      metadata: data
    };
  }
  
  async *generateStream(prompt: string, options: any = {}): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        prompt,
        stream: true,
        options: {
          temperature: options.temperature || this.config.temperature || 0.7,
          num_predict: options.maxTokens || this.config.maxTokens || 4096
        }
      })
    });
    
    if (!response.ok || !response.body) {
      throw new Error(`Ollama streaming API error: ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line) as any;
          yield {
            text: data.response || '',
            done: data.done || false,
            metadata: data
          };
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: text
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ollama Embeddings API error: ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      embeddings.push(data.embedding);
    }
    
    return embeddings;
  }
}

// Main AI Provider Plugin
export class AIProviderPlugin extends BasePlugin {
  private providers = new Map<string, BaseProvider>();
  private activeProvider: string;
  private cache = new Map<string, { response: any; timestamp: number }>();
  private requestLog: any[] = [];
  private rateLimiter = {
    requests: new Map<string, number[]>(),
    concurrent: new Map<string, number>()
  };
  declare public config: AIProviderConfig;
  
  constructor(manifest: PluginManifest, config: AIProviderConfig, context: PluginContext) {
    super(manifest, config, context);
    
    const defaultConfig: AIProviderConfig = {
      enabled: true,
      priority: 50,
      settings: {},
      caching: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 1000
      },
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000 // 1 minute
      },
      logging: {
        enabled: true,
        level: 'info',
        maxLogs: 1000,
        path: './logs/ai-provider.log'
      },
      providers: {},
      defaultProvider: 'claude',
      autoEnhance: false,
      queryExpansion: false,
      fallbackProviders: []
    };
    
    this.config = { ...defaultConfig, ...config };
    this.activeProvider = this.config.defaultProvider;
  }
  
  async onInitialize(): Promise<void> {
    // Initialize providers based on configuration
    if (this.config.providers?.claude) {
      this.providers.set('claude', new ClaudeProvider(this.config.providers.claude));
    }
    if (this.config.providers?.openai) {
      this.providers.set('openai', new OpenAIProvider(this.config.providers.openai));
    }
    if (this.config.providers?.ollama) {
      this.providers.set('ollama', new OllamaProvider(this.config.providers.ollama));
    }
    
    // Initialize active provider
    const provider = this.providers.get(this.activeProvider);
    if (provider) {
      await provider.initialize();
    }
    
    // Register MCP tools
    this.context?.mcp?.registerTool('ai_generate_text', {
      description: 'Generate text using AI provider',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          provider: { type: 'string' },
          options: { type: 'object' }
        },
        required: ['prompt']
      },
      handler: async (args) => {
        return await this.generateText(args.prompt, args.provider, args.options);
      }
    });
    
    this.context?.mcp?.registerTool('ai_generate_structured', {
      description: 'Generate structured JSON output',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          schema: { type: 'object' },
          provider: { type: 'string' }
        },
        required: ['prompt', 'schema']
      },
      handler: async (args) => {
        return await this.generateStructured(args.prompt, args.schema, args.provider);
      }
    });
    
    this.context?.mcp?.registerTool('ai_provider_status', {
      description: 'Get AI provider status and capabilities',
      inputSchema: {
        type: 'object',
        properties: {
          provider: { type: 'string' }
        }
      },
      handler: async (args) => {
        return this.getProviderStatus(args.provider);
      }
    });
    
    // Register hooks
    this.context?.hooks?.register('task_enhance', async (task) => {
      if (this.config.autoEnhance) {
        const enhanced = await this.enhanceTask(task);
        return { ...task, ...enhanced };
      }
      return task;
    });
    
    this.context?.hooks?.register('pre_search', async (query) => {
      if (this.config.queryExpansion) {
        return await this.expandQuery(query);
      }
      return query;
    });
    
    // Start background tasks
    if (this.config.caching?.enabled) {
      this.startCacheCleanup();
    }
    
    if (this.config.rateLimiting?.enabled) {
      this.startRateLimitCleanup();
    }
  }
  
  async onStart(): Promise<void> {
    this.emit('provider:ready', { provider: this.activeProvider });
  }
  
  async onStop(): Promise<void> {
    // Clean up resources
    this.cache.clear();
    this.rateLimiter.requests.clear();
    this.rateLimiter.concurrent.clear();
  }
  
  async onDestroy(): Promise<void> {
    // Final cleanup
    this.providers.clear();
    this.requestLog = [];
  }
  
  async onHealthCheck(): Promise<Partial<HealthStatus>> {
    const issues: Array<{
      component: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      timestamp?: Date;
    }> = [];
    const provider = this.providers.get(this.activeProvider);
    
    if (!provider) {
      issues.push({
        component: 'ai-provider',
        severity: 'critical',
        message: `Active provider '${this.activeProvider}' not found`,
        timestamp: new Date()
      });
    }
    
    // Check provider health
    try {
      await provider?.generateText('Test', { maxTokens: 1 });
    } catch (error) {
      issues.push({
        component: 'ai-provider',
        severity: 'high',
        message: `Provider health check failed: ${error}`,
        timestamp: new Date()
      });
    }
    
    return {
      issues
    };
  }
  
  async onGetMetrics(): Promise<Record<string, any>> {
    return {
      providers: Array.from(this.providers.keys()),
      activeProvider: this.activeProvider,
      totalRequests: this.requestLog.length,
      cacheSize: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      averageLatency: this.calculateAverageLatency(),
      requestsPerMinute: this.calculateRequestRate(),
      tokenUsage: this.calculateTokenUsage()
    };
  }
  
  async onValidateConfiguration(config: AIProviderConfig): Promise<string[]> {
    const errors: string[] = [];
    
    if (config.provider && !['claude', 'openai', 'ollama'].includes(config.provider)) {
      errors.push(`Invalid provider: ${config.provider}`);
    }
    
    if (config.caching?.ttl && config.caching.ttl < 0) {
      errors.push('Cache TTL must be positive');
    }
    
    if (config.rateLimiting && typeof config.rateLimiting === 'object') {
      const rateLimiting = config.rateLimiting as { requestsPerMinute?: number };
      if (rateLimiting.requestsPerMinute && rateLimiting.requestsPerMinute < 1) {
        errors.push('Rate limit must be at least 1 request per minute');
      }
    }
    
    return errors;
  }
  
  // Public API methods
  async generateText(prompt: string, providerName?: string, options?: any): Promise<AIProviderResponse> {
    const provider = this.getProvider(providerName);
    const cacheKey = this.getCacheKey('text', prompt, providerName, options);
    
    // Check cache
    if (this.config.caching?.enabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    // Check rate limits
    await this.checkRateLimit(provider.getName());
    
    const startTime = performance.now();
    
    try {
      const response = await provider.generateText(prompt, options);
      
      // Log request
      this.logRequest({
        type: 'text',
        provider: provider.getName(),
        prompt: prompt.substring(0, 100),
        response: response.text.substring(0, 100),
        latency: performance.now() - startTime,
        tokens: response.usage?.totalTokens
      });
      
      // Cache response
      if (this.config.caching?.enabled) {
        this.addToCache(cacheKey, response);
      }
      
      this.emit('generation:complete', { provider: provider.getName(), type: 'text' });
      
      return response;
    } catch (error) {
      this.emit('generation:error', { provider: provider.getName(), error });
      
      // Try fallback provider
      if (this.config.fallbackProviders?.length) {
        for (const fallbackName of this.config.fallbackProviders) {
          if (fallbackName !== provider.getName()) {
            try {
              return await this.generateText(prompt, fallbackName, options);
            } catch {
              // Continue to next fallback
            }
          }
        }
      }
      
      throw error;
    }
  }
  
  async *generateStream(prompt: string, providerName?: string, options?: any): AsyncGenerator<StreamChunk, void, unknown> {
    const provider = this.getProvider(providerName);
    
    if (!provider.supportsStreaming) {
      throw new Error(`Provider ${provider.getName()} does not support streaming`);
    }
    
    await this.checkRateLimit(provider.getName());
    
    const startTime = performance.now();
    let totalText = '';
    
    try {
      for await (const chunk of provider.generateStream!(prompt, options)) {
        totalText += chunk.text;
        yield chunk;
      }
      
      this.logRequest({
        type: 'stream',
        provider: provider.getName(),
        prompt: prompt.substring(0, 100),
        response: totalText.substring(0, 100),
        latency: performance.now() - startTime
      });
      
      this.emit('generation:complete', { provider: provider.getName(), type: 'stream' });
    } catch (error) {
      this.emit('generation:error', { provider: provider.getName(), error });
      throw error;
    }
  }
  
  async generateStructured<T>(prompt: string, schema: any, providerName?: string, options?: any): Promise<StructuredResponse<T>> {
    const provider = this.getProvider(providerName);
    
    if (!provider.supportsStructured) {
      // Fallback to text generation with JSON parsing
      const response = await this.generateText(
        `${prompt}\n\nRespond with valid JSON matching this schema: ${JSON.stringify(schema)}`,
        providerName,
        options
      );
      
      const data = provider.parseJSONResponse(response.text);
      if (!data) {
        throw new Error('Failed to parse structured response');
      }
      
      return {
        data,
        text: response.text,
        model: response.model,
        usage: response.usage
      };
    }
    
    const cacheKey = this.getCacheKey('structured', prompt, providerName, { schema, ...options });
    
    if (this.config.caching?.enabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    await this.checkRateLimit(provider.getName());
    
    const response = await provider.generateStructured!<T>(prompt, schema, options);
    
    if (this.config.caching?.enabled) {
      this.addToCache(cacheKey, response);
    }
    
    return response;
  }
  
  getProviderStatus(providerName?: string): any {
    const provider = providerName ? this.providers.get(providerName) : this.providers.get(this.activeProvider);
    
    if (!provider) {
      return { error: `Provider '${providerName || this.activeProvider}' not found` };
    }
    
    return {
      name: provider.getName(),
      active: provider.getName() === this.activeProvider,
      capabilities: {
        streaming: provider.supportsStreaming,
        embeddings: provider.supportsEmbeddings,
        structured: provider.supportsStructured,
        vision: provider.supportsVision
      },
      config: {
        model: provider['config'].model,
        maxTokens: provider['config'].maxTokens,
        temperature: provider['config'].temperature
      }
    };
  }
  
  // Private methods
  private getProvider(name?: string): BaseProvider {
    const providerName = name || this.activeProvider;
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    
    return provider;
  }
  
  private getCacheKey(type: string, prompt: string, provider?: string, options?: any): string {
    const data = JSON.stringify({ type, prompt, provider: provider || this.activeProvider, options });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    const ttl = (this.config.caching?.ttl || 3600) * 1000;
    
    if (age > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.response;
  }
  
  private addToCache(key: string, response: any): void {
    // Limit cache size
    const maxSize = this.config.caching?.maxSize || 1000;
    if (this.cache.size >= maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }
  
  private async checkRateLimit(provider: string): Promise<void> {
    if (!this.config.rateLimiting?.enabled) return;
    
    const now = Date.now();
    const window = 60000; // 1 minute
    const limit = (this.config.rateLimiting as any)?.requestsPerMinute || this.config.rateLimiting?.maxRequests || 60;
    const concurrentLimit = (this.config.rateLimiting as any)?.concurrent || 10;
    
    // Check requests per minute
    const requests = this.rateLimiter.requests.get(provider) || [];
    const recentRequests = requests.filter(time => now - time < window);
    
    if (recentRequests.length >= limit) {
      const oldestRequest = recentRequests[0];
      const waitTime = window - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }
    
    // Check concurrent requests
    const concurrent = this.rateLimiter.concurrent.get(provider) || 0;
    if (concurrent >= concurrentLimit) {
      throw new Error(`Concurrent request limit exceeded. Maximum: ${concurrentLimit}`);
    }
    
    // Update rate limiter
    recentRequests.push(now);
    this.rateLimiter.requests.set(provider, recentRequests);
    this.rateLimiter.concurrent.set(provider, concurrent + 1);
    
    // Decrement concurrent count after request
    setTimeout(() => {
      const current = this.rateLimiter.concurrent.get(provider) || 1;
      this.rateLimiter.concurrent.set(provider, Math.max(0, current - 1));
    }, 0);
  }
  
  private logRequest(data: any): void {
    this.requestLog.push({
      ...data,
      timestamp: Date.now()
    });
    
    // Limit log size
    const maxLogs = this.config.logging?.maxLogs || 1000;
    if (this.requestLog.length > maxLogs) {
      this.requestLog.shift();
    }
    
    // Write to file if configured
    if (this.config.logging?.path) {
      // TODO: Implement file logging
    }
  }
  
  private calculateCacheHitRate(): number {
    // TODO: Implement cache hit tracking
    return 0;
  }
  
  private calculateAverageLatency(): number {
    if (this.requestLog.length === 0) return 0;
    
    const totalLatency = this.requestLog.reduce((sum, req) => sum + (req.latency || 0), 0);
    return totalLatency / this.requestLog.length;
  }
  
  private calculateRequestRate(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestLog.filter(req => req.timestamp > oneMinuteAgo);
    return recentRequests.length;
  }
  
  private calculateTokenUsage(): any {
    const usage: any = {};
    
    for (const req of this.requestLog) {
      if (req.tokens) {
        usage[req.provider] = (usage[req.provider] || 0) + req.tokens;
      }
    }
    
    return usage;
  }
  
  private async enhanceTask(task: any): Promise<any> {
    try {
      const prompt = `Enhance this task description for clarity and completeness: ${task.description}`;
      const response = await this.generateText(prompt, undefined, { maxTokens: 200 });
      
      return {
        enhancedDescription: response.text,
        originalDescription: task.description
      };
    } catch {
      return {};
    }
  }
  
  private async expandQuery(query: string): Promise<string> {
    try {
      const prompt = `Expand this search query with related terms and synonyms: ${query}`;
      const response = await this.generateText(prompt, undefined, { maxTokens: 100 });
      
      return `${query} ${response.text}`;
    } catch {
      return query;
    }
  }
  
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const ttl = (this.config.caching?.ttl || 3600) * 1000;
      
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }
  
  private startRateLimitCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const window = 60000;
      
      for (const [provider, requests] of this.rateLimiter.requests.entries()) {
        const recentRequests = requests.filter(time => now - time < window);
        if (recentRequests.length === 0) {
          this.rateLimiter.requests.delete(provider);
        } else {
          this.rateLimiter.requests.set(provider, recentRequests);
        }
      }
    }, 10000); // Run every 10 seconds
  }
  
  // Static metadata
  static readonly metadata: PluginManifest = {
    name: 'ai-provider',
    version: '1.0.0',
    description: 'Comprehensive AI/LLM provider plugin with multi-model support',
    author: 'Claude Code Flow',
    capabilities: ['ai', 'generation', 'streaming', 'embeddings'],
    configuration: {
      providers: {
        type: 'object',
        properties: {
          claude: {
            type: 'object',
            properties: {
              apiKey: { type: 'string' },
              model: { type: 'string' },
              maxTokens: { type: 'number' },
              temperature: { type: 'number' }
            }
          },
          openai: {
            type: 'object',
            properties: {
              apiKey: { type: 'string' },
              model: { type: 'string' },
              maxTokens: { type: 'number' },
              temperature: { type: 'number' }
            }
          },
          ollama: {
            type: 'object',
            properties: {
              baseUrl: { type: 'string' },
              model: { type: 'string' },
              maxTokens: { type: 'number' },
              temperature: { type: 'number' }
            }
          }
        }
      },
      caching: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          ttl: { type: 'number', default: 3600 },
          maxSize: { type: 'number', default: 1000 }
        }
      },
      rateLimiting: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          requestsPerMinute: { type: 'number', default: 60 },
          concurrent: { type: 'number', default: 10 }
        }
      },
      fallbackProviders: {
        type: 'array',
        items: { type: 'string' }
      },
      logging: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean', default: true },
          path: { type: 'string' },
          maxLogs: { type: 'number', default: 1000 }
        }
      }
    }
  };
}

export default AIProviderPlugin;