/**
 * AI Provider Plugin (TypeScript)
 * Comprehensive multi-model AI/LLM provider support with production features
 */

import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';

// Provider interfaces
interface AIProviderResponse {text = false
public
supportsStreaming = false
public
supportsEmbeddings = false
public
supportsStructured = true;
public
supportsVision = false;

constructor(config);
{
  this.config = config;
  this.name = this.constructor.name.replace('Provider', '').toLowerCase();
}

abstract;
initialize();
: Promise<void>
abstract;
generateText(prompt = false;
}

  protected parseJSONResponse(text): any
{
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (_error) {
    return null;
  }
}
}

// Claude Provider Implementation
class ClaudeProvider extends BaseProvider {
  private apiKey = 'https = true;
  this;
  .
  supportsVision = true;
  this;
  .
  apiKey = config.claudeApiKey || config.apiKey || process.env.ANTHROPIC_API_KEY || '';
  this;
  .
  model = config.claudeModel || config.model || 'claude-3-sonnet-20240229';
}

async;
initialize();
: Promise<void>
{
  if (!this.apiKey) {
    throw new Error('Claude API key not configured');
  }
  this.isReady = true;
}

async;
generateText(prompt, (options = {}));
: Promise<AIProviderResponse>
{
    const response = await fetch(`${this.baseUrl}/messages`, {method = await response.json();
    return {
      text = {}): Promise<any> {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching thisschema = await this.generateText(structuredPrompt, options);
    const parsed = this.parseJSONResponse(response.text);
    
    if (!parsed) {
      throw new Error('Failed to parse structured response from Claude');
    }
    
    return parsed;
  }

  async streamText(prompt = {}): Promise<StreamingResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {method = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data = line.slice(6);
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
  private apiKey = true;
    this.supportsEmbeddings = true;
    this.supportsVision = true;
    this.apiKey = config.openaiApiKey || config.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = config.openaiBaseUrl || 'https = config.openaiModel || config.model || 'gpt-4-turbo-preview';
    this.embeddingModel = config.embeddingModel || 'text-embedding-3-small';
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    this.isReady = true;
  }

  async generateText(prompt, options = {}): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {method = await response.json();
    return {
      text = {}): Promise<any> {
    const response = await fetch(`$this.baseUrl/chat/completions`, {method = await response.json();
    
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

  async createEmbedding(text = {}): Promise<EmbeddingResponse> {
    const response = await fetch(`$this.baseUrl/embeddings`, {method = await response.json();
    return {
      embedding = {}): Promise<StreamingResponse> {
    const response = await fetch(`$this.baseUrl/chat/completions`, {method = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data = line.slice(6);
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
  private providers = new Map();
  private activeProvider?: BaseProvider;
  private cache = new Map();
  private rateLimiter = new Map();
  private requestQueue = > void> = [];
  private activeRequests = 0;
  
  private metrics = {
    totalRequests,successfulRequests = this.config.settings.provider || 'claude';
    this.activeProvider = this.providers.get(primaryProvider);
    
    if (!this.activeProvider) {
      throw new Error(`Failed to initialize primary _provider => {
      // Could enhance tasks with AI capabilities
      return {success = [];
    
    // Persist cache
    if (this.config.settings.caching?.enabled) {
      await this.persistCache();
    }
  }

  protected async onDestroy(): Promise<void> 
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

  // Public API methods
  async generateText(prompt = {}): Promise<AIProviderResponse> 
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
            this.emit('cache_hit', { requestId,type = await this.activeProvider?.generateText(prompt, options);
        
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
            type = {}): Promise<any> {
    return this.executeWithRetry(async () => {
      const startTime = performance.now();
      let requestId = crypto.randomBytes(8).toString('hex');
      
      try {
        // Check cache
        const cacheKey = this.getCacheKey('structured', prompt, { schema, ...options });
        if (this.config.settings.caching?.enabled && !options.noCache) {
          const cached = await this.getFromCache(cacheKey);
          if (cached) {
            this.metrics.cacheHits++;
            this.emit('cache_hit', { requestId,type = await this.activeProvider?.generateStructured(prompt, schema, options);
        
        // Validate against schema (basic validation)
        this.validateSchema(result, schema);
        
        // Update metrics
        const _latency = performance.now() - startTime;
        this.updateMetrics({ text = {}): Promise<EmbeddingResponse> {
    if (!this._activeProvider!._supportsEmbeddings) {
      throw new Error(`Provider ${this.activeProvider?.name} does not support embeddings`);
    }
    
    return this.executeWithRetry(async () => {
      const _result = await this.activeProvider?.createEmbedding(text, options);
      this.emit('embedding_created', { dimensions = {}): Promise<StreamingResponse> {
    const requestId = crypto.randomBytes(8).toString('hex');
    
    try {
      // Rate limiting
      await this.checkRateLimit();
      
      // Check if provider supports streaming
      if (!this.activeProvider?.supportsStreaming) {
        // Fallback to non-streaming
        const result = await this.generateText(prompt, options);
        return this.createStreamFromText(result.text);
      }
      
      this.emit('stream_start', { requestId,provider = await this.activeProvider?.streamText(prompt, options);
      
      // Wrap stream to track metrics
      return this.wrapStream(stream, requestId);
      
    } catch (error) {
      this.emit('stream_error', { requestId, error = {};
    
    for (const [name, _provider] of this.providers) {
      providers[name] = {
        status = {claude = this.config.settings.provider || 'claude';
    const PrimaryClass = providerClasses[primaryProvider as keyof typeof providerClasses];
    
    if (PrimaryClass) {
      try {
        const provider = new PrimaryClass(this.config.settings);
        await provider.initialize();
        this.providers.set(primaryProvider, provider);
      } catch (error) {
        this.context.apis.logger.warn(`Failed to initialize ${primaryProvider}`, {error = this.config.settings.fallbackProviders || [];
    for (const fallbackName of fallbackProviders) {
      if (this.providers.has(fallbackName)) continue;
      
      const FallbackClass = providerClasses[fallbackName as keyof typeof providerClasses];
      if (FallbackClass) {
        try {
          const provider = new FallbackClass(this.config.settings);
          await provider.initialize();
          this.providers.set(fallbackName, provider);
        } catch (error) {
          this.context.apis.logger.warn(`Failed to initialize fallback ${fallbackName}`, {error = > Promise<T>): Promise<T> {
    const maxAttempts = this.config.settings.retryAttempts || 3;
    const retryDelay = this.config.settings.retryDelay || 1000;
    let _lastError = 0; attempt <= maxAttempts; attempt++) 
      try {
        if (this.activeProvider) {
          return await operation();
        }
      } catch (error) {
        _lastError = error as Error;
        this.context.apis.logger.warn(`Attempt ${attempt + 1} failed`, {error = > 
            setTimeout(resolve, retryDelay * 2 ** attempt)
          );
          
          // Try fallback provider if available
          if (attempt > 0) {
            const fallbackProviders = this.config.settings.fallbackProviders || [];
            if (fallbackProviders.length > 0) {
              const fallbackIndex = (attempt - 1) % fallbackProviders.length;
              const fallbackName = fallbackProviders[fallbackIndex];
              const fallbackProvider = this.providers.get(fallbackName);
              
              if (fallbackProvider) {
                this.context.apis.logger.info(`Switching to fallbackprovider = fallbackProvider;
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
      this.rateLimiter.set(minute, {requests = this.rateLimiter.get(minute)!;
    
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

  private releaseRateLimit(): void 
    this.activeRequests--;
    if (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve?.();
    }

  private updateMetrics(result = (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0);
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

  private getCacheKey(type = crypto.createHash('sha256');
    hash.update(type);
    hash.update(prompt);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  private async getFromCache(key = this.cache.get(key);
    if (!cached) return null;
    
    const ttl = this.config.settings.caching?.ttl || 3600000;
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private async saveToCache(key = this.config.settings.caching?.maxSize || 100;
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
        const cached = value as {data = ttl) {
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

  private async logRequest(logEntry = new Date().toISOString().split('T')[0];
      const logPath = join(this.config.settings.logging?.path || './.hive-mind/ai-logs', `requests-${date}.jsonl`);
      await writeFile(logPath, JSON.stringify(logEntry) + '\n', {flag = == 'object' && schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        const propSchema = prop as JSONObject;
        if (propSchema.required && !(key in data)) {
          throw new Error(`Missing requiredproperty = text.split(' ');
      for (const word of words) {
        yield `${word} `;
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
      }
    }
    return textGenerator();
  }

  private wrapStream(stream = this;
    let totalTokens = 0;
    
    async function* _wrappedGenerator() {
      try {
        for await (const chunk of stream) {
          totalTokens += chunk.length;
          yield chunk;
        }
        self.emit('stream_complete', { requestId, totalTokens });
      } catch (error) {
        self.emit('stream_error', { requestId, error => {
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
