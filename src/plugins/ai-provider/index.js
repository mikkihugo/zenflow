/**
 * AI Provider Plugin
 * Comprehensive multi-model AI/LLM provider support with production features
 */

import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { performance } from 'perf_hooks';

export class AIProviderPlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      provider: 'claude',
      maxTokens: 4000,
      temperature: 0.7,
      topP: 0.9,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        tokensPerMinute: 100000,
        concurrentRequests: 5
      },
      caching: {
        enabled: true,
        ttl: 3600000, // 1 hour
        maxSize: 100,
        path: path.join(process.cwd(), '.hive-mind', 'ai-cache')
      },
      logging: {
        enabled: true,
        includePrompts: false,
        path: path.join(process.cwd(), '.hive-mind', 'ai-logs')
      },
      fallbackProviders: ['ollama', 'local'], // Fallback order
      streaming: true,
      ...config
    };
    
    this.providers = new Map();
    this.activeProvider = null;
    this.cache = new Map();
    this.rateLimiter = new Map();
    this.requestQueue = [];
    this.activeRequests = 0;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTokensUsed: 0,
      averageLatency: 0,
      providerUsage: new Map()
    };
    
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log(`🧠 AI Provider Plugin initializing with ${this.config.provider}`);
      
      // Create directories
      if (this.config.caching.enabled) {
        await mkdir(this.config.caching.path, { recursive: true });
      }
      if (this.config.logging.enabled) {
        await mkdir(this.config.logging.path, { recursive: true });
      }
      
      // Initialize all available providers
      await this.initializeProviders();
      
      // Set active provider
      this.activeProvider = this.providers.get(this.config.provider);
      if (!this.activeProvider) {
        throw new Error(`Failed to initialize primary provider: ${this.config.provider}`);
      }
      
      // Load cache
      if (this.config.caching.enabled) {
        await this.loadCache();
      }
      
      // Start rate limiter
      if (this.config.rateLimiting.enabled) {
        this.startRateLimiter();
      }
      
      this.isInitialized = true;
      console.log(`✅ AI Provider Plugin initialized with ${this.providers.size} providers`);
      this.emit('initialized', { providers: Array.from(this.providers.keys()) });
      
    } catch (error) {
      console.error('❌ Failed to initialize AI Provider Plugin:', error);
      throw error;
    }
  }

  async initializeProviders() {
    const providerClasses = {
      claude: ClaudeProvider,
      openai: OpenAIProvider,
      ollama: OllamaProvider,
      local: LocalProvider,
      huggingface: HuggingFaceProvider,
      cohere: CohereProvider,
      anthropic: ClaudeProvider, // Alias
      gemini: GeminiProvider,
      mistral: MistralProvider
    };
    
    // Initialize primary provider
    const PrimaryClass = providerClasses[this.config.provider];
    if (PrimaryClass) {
      try {
        const provider = new PrimaryClass(this.config);
        await provider.initialize();
        this.providers.set(this.config.provider, provider);
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${this.config.provider}:`, error.message);
      }
    }
    
    // Initialize fallback providers
    for (const fallbackName of this.config.fallbackProviders) {
      if (this.providers.has(fallbackName)) continue;
      
      const FallbackClass = providerClasses[fallbackName];
      if (FallbackClass) {
        try {
          const provider = new FallbackClass(this.config);
          await provider.initialize();
          this.providers.set(fallbackName, provider);
        } catch (error) {
          console.warn(`⚠️ Failed to initialize fallback ${fallbackName}:`, error.message);
        }
      }
    }
  }

  async generateText(prompt, options = {}) {
    return this.executeWithRetry(async () => {
      const startTime = performance.now();
      const requestId = crypto.randomBytes(8).toString('hex');
      
      try {
        // Check cache
        const cacheKey = this.getCacheKey('text', prompt, options);
        if (this.config.caching.enabled && !options.noCache) {
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
        this.emit('request_start', { requestId, type: 'text', provider: this.activeProvider.name });
        
        const result = await this.activeProvider.generateText(prompt, {
          ...this.config,
          ...options,
          requestId
        });
        
        // Update metrics
        const latency = performance.now() - startTime;
        this.updateMetrics(result, latency);
        
        // Cache result
        if (this.config.caching.enabled && !options.noCache) {
          await this.saveToCache(cacheKey, result);
        }
        
        // Log request
        if (this.config.logging.enabled) {
          await this.logRequest({
            requestId,
            type: 'text',
            prompt: this.config.logging.includePrompts ? prompt : '[REDACTED]',
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

  async generateStructured(prompt, schema, options = {}) {
    return this.executeWithRetry(async () => {
      const startTime = performance.now();
      const requestId = crypto.randomBytes(8).toString('hex');
      
      try {
        // Check cache
        const cacheKey = this.getCacheKey('structured', prompt, { schema, ...options });
        if (this.config.caching.enabled && !options.noCache) {
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
        this.emit('request_start', { requestId, type: 'structured', provider: this.activeProvider.name });
        
        const result = await this.activeProvider.generateStructured(prompt, schema, {
          ...this.config,
          ...options,
          requestId
        });
        
        // Validate against schema
        this.validateSchema(result, schema);
        
        // Update metrics
        const latency = performance.now() - startTime;
        this.updateMetrics(result, latency);
        
        // Cache result
        if (this.config.caching.enabled && !options.noCache) {
          await this.saveToCache(cacheKey, result);
        }
        
        // Log request
        if (this.config.logging.enabled) {
          await this.logRequest({
            requestId,
            type: 'structured',
            prompt: this.config.logging.includePrompts ? prompt : '[REDACTED]',
            schema,
            options,
            result: { type: 'structured', keys: Object.keys(result) },
            latency,
            timestamp: new Date().toISOString()
          });
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

  async streamText(prompt, options = {}) {
    const requestId = crypto.randomBytes(8).toString('hex');
    
    try {
      // Rate limiting
      await this.checkRateLimit();
      
      // Check if provider supports streaming
      if (!this.activeProvider.supportsStreaming) {
        // Fallback to non-streaming
        const result = await this.generateText(prompt, options);
        return this.createStreamFromText(result.text);
      }
      
      this.emit('stream_start', { requestId, provider: this.activeProvider.name });
      
      const stream = await this.activeProvider.streamText(prompt, {
        ...this.config,
        ...options,
        requestId
      });
      
      // Wrap stream to track metrics
      return this.wrapStream(stream, requestId);
      
    } catch (error) {
      this.emit('stream_error', { requestId, error: error.message });
      throw error;
    }
  }

  async analyzeCode(code, analysisType = 'general', options = {}) {
    const analysisPrompts = {
      general: this.buildGeneralAnalysisPrompt,
      security: this.buildSecurityAnalysisPrompt,
      performance: this.buildPerformanceAnalysisPrompt,
      architecture: this.buildArchitectureAnalysisPrompt,
      testing: this.buildTestingAnalysisPrompt,
      documentation: this.buildDocumentationAnalysisPrompt
    };
    
    const promptBuilder = analysisPrompts[analysisType] || analysisPrompts.general;
    const prompt = promptBuilder.call(this, code);
    
    const schema = {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        score: { type: 'number', minimum: 0, maximum: 100 },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              type: { type: 'string' },
              message: { type: 'string' },
              line: { type: 'number' },
              suggestion: { type: 'string' }
            }
          }
        },
        metrics: {
          type: 'object',
          properties: {
            complexity: { type: 'number' },
            maintainability: { type: 'number' },
            testability: { type: 'number' },
            readability: { type: 'number' }
          }
        },
        suggestions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
              example: { type: 'string' }
            }
          }
        }
      }
    };
    
    return this.generateStructured(prompt, schema, options);
  }

  async generateCode(specification, language = 'javascript', options = {}) {
    const prompt = this.buildCodeGenerationPrompt(specification, language);
    
    const schema = {
      type: 'object',
      properties: {
        code: { type: 'string' },
        language: { type: 'string' },
        explanation: { type: 'string' },
        dependencies: { type: 'array', items: { type: 'string' } },
        usage: { type: 'string' },
        tests: { type: 'string' }
      }
    };
    
    return this.generateStructured(prompt, schema, options);
  }

  async refactorCode(code, refactorType = 'general', options = {}) {
    const refactorPrompts = {
      general: 'Refactor this code for better readability and maintainability',
      performance: 'Optimize this code for better performance',
      modernize: 'Modernize this code using latest language features',
      simplify: 'Simplify this code and reduce complexity',
      patterns: 'Apply design patterns to improve this code structure',
      functional: 'Refactor this code to be more functional',
      async: 'Convert synchronous operations to async where appropriate'
    };
    
    const instruction = refactorPrompts[refactorType] || refactorPrompts.general;
    const prompt = `${instruction}:\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide the refactored code with explanations.`;
    
    const schema = {
      type: 'object',
      properties: {
        refactoredCode: { type: 'string' },
        changes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              before: { type: 'string' },
              after: { type: 'string' }
            }
          }
        },
        improvements: { type: 'array', items: { type: 'string' } },
        tradeoffs: { type: 'array', items: { type: 'string' } }
      }
    };
    
    return this.generateStructured(prompt, schema, options);
  }

  async explainCode(code, targetAudience = 'developer', options = {}) {
    const audiencePrompts = {
      beginner: 'Explain this code in simple terms for someone new to programming',
      developer: 'Explain this code for a software developer',
      architect: 'Explain this code focusing on architectural decisions and patterns',
      manager: 'Explain this code in business terms focusing on functionality',
      student: 'Explain this code as if teaching a computer science student'
    };
    
    const instruction = audiencePrompts[targetAudience] || audiencePrompts.developer;
    const prompt = `${instruction}:\n\n\`\`\`\n${code}\n\`\`\``;
    
    const schema = {
      type: 'object',
      properties: {
        overview: { type: 'string' },
        purpose: { type: 'string' },
        keyComponents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              importance: { type: 'string' }
            }
          }
        },
        flowExplanation: { type: 'string' },
        technicalDetails: { type: 'string' },
        usageExample: { type: 'string' },
        relatedConcepts: { type: 'array', items: { type: 'string' } }
      }
    };
    
    return this.generateStructured(prompt, schema, options);
  }

  // Advanced features
  async createEmbedding(text, options = {}) {
    if (!this.activeProvider.supportsEmbeddings) {
      throw new Error(`Provider ${this.activeProvider.name} does not support embeddings`);
    }
    
    return this.executeWithRetry(async () => {
      const result = await this.activeProvider.createEmbedding(text, options);
      this.emit('embedding_created', { dimensions: result.embedding.length });
      return result;
    });
  }

  async semanticSearch(query, documents, options = {}) {
    const queryEmbedding = await this.createEmbedding(query, options);
    const documentEmbeddings = await Promise.all(
      documents.map(doc => this.createEmbedding(doc.text || doc, options))
    );
    
    // Calculate cosine similarity
    const similarities = documentEmbeddings.map((docEmb, index) => ({
      document: documents[index],
      similarity: this.cosineSimilarity(queryEmbedding.embedding, docEmb.embedding)
    }));
    
    // Sort by similarity
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities;
  }

  async summarize(text, options = {}) {
    const { maxLength = 200, style = 'concise' } = options;
    
    const stylePrompts = {
      concise: 'Provide a concise summary',
      detailed: 'Provide a detailed summary',
      bullet: 'Provide a bullet-point summary',
      technical: 'Provide a technical summary',
      executive: 'Provide an executive summary'
    };
    
    const prompt = `${stylePrompts[style] || stylePrompts.concise} of the following text (max ${maxLength} words):\n\n${text}`;
    
    const result = await this.generateText(prompt, {
      ...options,
      maxTokens: Math.min(maxLength * 1.5, this.config.maxTokens)
    });
    
    return result.text;
  }

  async translate(text, targetLanguage, sourceLanguage = 'auto', options = {}) {
    const prompt = sourceLanguage === 'auto'
      ? `Translate the following text to ${targetLanguage}:\n\n${text}`
      : `Translate the following text from ${sourceLanguage} to ${targetLanguage}:\n\n${text}`;
    
    const result = await this.generateText(prompt, options);
    return result.text;
  }

  // Helper methods
  async executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Try with current provider
        if (this.activeProvider) {
          return await operation();
        }
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt < this.config.retryAttempts) {
          // Wait before retry
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * Math.pow(2, attempt))
          );
          
          // Try fallback provider if available
          if (attempt > 0 && this.config.fallbackProviders.length > 0) {
            const fallbackIndex = (attempt - 1) % this.config.fallbackProviders.length;
            const fallbackName = this.config.fallbackProviders[fallbackIndex];
            const fallbackProvider = this.providers.get(fallbackName);
            
            if (fallbackProvider) {
              console.log(`🔄 Switching to fallback provider: ${fallbackName}`);
              this.activeProvider = fallbackProvider;
            }
          }
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  async checkRateLimit() {
    if (!this.config.rateLimiting.enabled) return;
    
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    if (!this.rateLimiter.has(minute)) {
      this.rateLimiter.set(minute, {
        requests: 0,
        tokens: 0
      });
      
      // Clean old entries
      for (const [key, value] of this.rateLimiter) {
        if (key < minute - 1) {
          this.rateLimiter.delete(key);
        }
      }
    }
    
    const currentMinute = this.rateLimiter.get(minute);
    
    // Check concurrent requests
    if (this.activeRequests >= this.config.rateLimiting.concurrentRequests) {
      await new Promise(resolve => {
        this.requestQueue.push(resolve);
      });
    }
    
    // Check rate limits
    if (currentMinute.requests >= this.config.rateLimiting.requestsPerMinute) {
      const waitTime = (minute + 1) * 60000 - now;
      console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkRateLimit();
    }
    
    currentMinute.requests++;
    this.activeRequests++;
  }

  releaseRateLimit() {
    this.activeRequests--;
    if (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve();
    }
  }

  updateMetrics(result, latency) {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    
    if (result.usage) {
      this.metrics.totalTokensUsed += (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0);
      
      // Update rate limiter
      const minute = Math.floor(Date.now() / 60000);
      const currentMinute = this.rateLimiter.get(minute);
      if (currentMinute) {
        currentMinute.tokens += (result.usage.inputTokens || 0) + (result.usage.outputTokens || 0);
      }
    }
    
    // Update average latency
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.successfulRequests - 1) + latency) / 
      this.metrics.successfulRequests;
    
    // Update provider usage
    const providerName = this.activeProvider.name;
    this.metrics.providerUsage.set(
      providerName,
      (this.metrics.providerUsage.get(providerName) || 0) + 1
    );
    
    this.releaseRateLimit();
  }

  getCacheKey(type, prompt, options) {
    const hash = crypto.createHash('sha256');
    hash.update(type);
    hash.update(prompt);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  async getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.config.caching.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  async saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Enforce max size
    if (this.cache.size > this.config.caching.maxSize) {
      const oldest = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
      this.cache.delete(oldest[0]);
    }
    
    // Persist cache
    await this.persistCache();
  }

  async loadCache() {
    try {
      const cachePath = path.join(this.config.caching.path, 'cache.json');
      const data = await readFile(cachePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Load valid entries
      const now = Date.now();
      for (const [key, value] of Object.entries(parsed)) {
        if (now - value.timestamp <= this.config.caching.ttl) {
          this.cache.set(key, value);
        }
      }
      
      console.log(`📦 Loaded ${this.cache.size} cached entries`);
    } catch (error) {
      // No cache file, that's OK
    }
  }

  async persistCache() {
    try {
      const cachePath = path.join(this.config.caching.path, 'cache.json');
      const data = Object.fromEntries(this.cache);
      await writeFile(cachePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  async logRequest(logEntry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logPath = path.join(this.config.logging.path, `requests-${date}.jsonl`);
      await writeFile(logPath, JSON.stringify(logEntry) + '\n', { flag: 'a' });
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  }

  validateSchema(data, schema) {
    // Basic schema validation
    if (schema.type === 'object' && schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.required && !(key in data)) {
          throw new Error(`Missing required property: ${key}`);
        }
      }
    }
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  createStreamFromText(text) {
    // Create a simple async generator from text
    async function* textGenerator() {
      const words = text.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming
      }
    }
    return textGenerator();
  }

  wrapStream(stream, requestId) {
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

  startRateLimiter() {
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

  // Prompt builders
  buildGeneralAnalysisPrompt(code) {
    return `Analyze this code comprehensively:

\`\`\`
${code}
\`\`\`

Provide a detailed analysis including:
1. Overall code quality and structure
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Maintainability and readability
6. Testing recommendations
7. Specific improvement suggestions`;
  }

  buildSecurityAnalysisPrompt(code) {
    return `Perform a security analysis of this code:

\`\`\`
${code}
\`\`\`

Identify:
1. Security vulnerabilities (injection, XSS, etc.)
2. Authentication/authorization issues
3. Data validation problems
4. Sensitive data exposure
5. Cryptographic weaknesses
6. Security best practices violations
7. Remediation recommendations`;
  }

  buildPerformanceAnalysisPrompt(code) {
    return `Analyze the performance characteristics of this code:

\`\`\`
${code}
\`\`\`

Evaluate:
1. Time complexity of algorithms
2. Space complexity and memory usage
3. Potential bottlenecks
4. Database query efficiency
5. Caching opportunities
6. Async operation optimization
7. Performance improvement suggestions`;
  }

  buildArchitectureAnalysisPrompt(code) {
    return `Analyze the architectural aspects of this code:

\`\`\`
${code}
\`\`\`

Assess:
1. Design patterns used
2. SOLID principles adherence
3. Coupling and cohesion
4. Modularity and reusability
5. Scalability considerations
6. Architectural improvements
7. Refactoring recommendations`;
  }

  buildTestingAnalysisPrompt(code) {
    return `Analyze the testability and testing needs of this code:

\`\`\`
${code}
\`\`\`

Evaluate:
1. Current test coverage
2. Testability of the code
3. Unit test recommendations
4. Integration test needs
5. Edge cases to test
6. Mock/stub requirements
7. Testing strategy suggestions`;
  }

  buildDocumentationAnalysisPrompt(code) {
    return `Analyze the documentation needs of this code:

\`\`\`
${code}
\`\`\`

Assess:
1. Current documentation quality
2. Missing documentation
3. API documentation needs
4. Code comments effectiveness
5. Usage examples needed
6. Architecture documentation
7. Documentation improvements`;
  }

  buildCodeGenerationPrompt(specification, language) {
    return `Generate ${language} code based on this specification:

${specification}

Requirements:
1. Use modern ${language} best practices
2. Include comprehensive error handling
3. Add appropriate comments
4. Make it production-ready
5. Include type annotations where applicable
6. Follow standard naming conventions
7. Include usage examples`;
  }

  async getProviderStatus() {
    const providers = {};
    
    for (const [name, provider] of this.providers) {
      providers[name] = {
        status: provider.isReady ? 'ready' : 'not_ready',
        capabilities: {
          streaming: provider.supportsStreaming || false,
          embeddings: provider.supportsEmbeddings || false,
          structured: provider.supportsStructured || false,
          vision: provider.supportsVision || false
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
      },
      config: {
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        timeout: this.config.timeout
      }
    };
  }

  async cleanup() {
    try {
      // Stop rate limiter
      this.requestQueue = [];
      
      // Persist cache
      if (this.config.caching.enabled) {
        await this.persistCache();
      }
      
      // Cleanup all providers
      for (const [name, provider] of this.providers) {
        if (provider.cleanup) {
          await provider.cleanup();
        }
      }
      
      this.providers.clear();
      this.cache.clear();
      this.rateLimiter.clear();
      
      console.log('🧠 AI Provider Plugin cleaned up');
    } catch (error) {
      console.error('Error during AI Provider cleanup:', error);
    }
  }
}

/**
 * Base Provider Class
 */
class BaseProvider {
  constructor(config) {
    this.config = config;
    this.name = this.constructor.name.replace('Provider', '').toLowerCase();
    this.isReady = false;
    this.supportsStreaming = false;
    this.supportsEmbeddings = false;
    this.supportsStructured = true;
    this.supportsVision = false;
  }

  async validateConfig() {
    // Override in subclasses
    return true;
  }

  async initialize() {
    try {
      await this.validateConfig();
      this.isReady = true;
    } catch (error) {
      console.error(`Failed to initialize ${this.name} provider:`, error);
      throw error;
    }
  }

  parseJSONResponse(text) {
    try {
      // Try to extract JSON from various response formats
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async cleanup() {
    this.isReady = false;
  }
}

/**
 * Claude Provider - Full Implementation
 */
class ClaudeProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.supportsStreaming = true;
    this.supportsEmbeddings = false; // Claude doesn't have direct embeddings
    this.supportsVision = true;
    this.apiKey = config.claudeApiKey || process.env.ANTHROPIC_API_KEY;
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = config.claudeModel || 'claude-3-sonnet-20240229';
  }

  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Set ANTHROPIC_API_KEY or provide claudeApiKey in config');
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`🤖 Claude provider ready (model: ${this.model})`);
  }

  async makeRequest(endpoint, body) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await this.makeRequest('/messages', {
        model: options.model || this.model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        top_p: options.topP || this.config.topP,
        stream: false
      });

      return {
        text: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        },
        model: response.model,
        stopReason: response.stop_reason
      };
    } catch (error) {
      console.error('Claude generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
    
    const response = await this.generateText(structuredPrompt, options);
    const parsed = this.parseJSONResponse(response.text);
    
    if (!parsed) {
      throw new Error('Failed to parse structured response from Claude');
    }
    
    return parsed;
  }

  async streamText(prompt, options = {}) {
    const body = {
      model: options.model || this.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      stream: true
    };

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Claude streaming error: ${response.status}`);
    }

    return this.parseStream(response.body);
  }

  async* parseStream(stream) {
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

/**
 * OpenAI Provider - Full Implementation
 */
class OpenAIProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.supportsStreaming = true;
    this.supportsEmbeddings = true;
    this.supportsVision = true;
    this.apiKey = config.openaiApiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = config.openaiBaseUrl || 'https://api.openai.com/v1';
    this.model = config.openaiModel || 'gpt-4-turbo-preview';
    this.embeddingModel = config.embeddingModel || 'text-embedding-3-small';
  }

  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY or provide openaiApiKey in config');
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`🤖 OpenAI provider ready (model: ${this.model})`);
  }

  async makeRequest(endpoint, body) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await this.makeRequest('/chat/completions', {
        model: options.model || this.model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        top_p: options.topP || this.config.topP,
        stream: false
      });

      return {
        text: response.choices[0].message.content,
        usage: {
          inputTokens: response.usage.prompt_tokens,
          outputTokens: response.usage.completion_tokens
        },
        model: response.model,
        finishReason: response.choices[0].finish_reason
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const response = await this.makeRequest('/chat/completions', {
      model: options.model || this.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
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
    });

    if (response.choices[0].message.tool_calls) {
      const toolCall = response.choices[0].message.tool_calls[0];
      return JSON.parse(toolCall.function.arguments);
    }

    // Fallback to parsing
    const parsed = this.parseJSONResponse(response.choices[0].message.content);
    if (!parsed) {
      throw new Error('Failed to parse structured response from OpenAI');
    }
    
    return parsed;
  }

  async createEmbedding(text, options = {}) {
    const response = await this.makeRequest('/embeddings', {
      model: options.embeddingModel || this.embeddingModel,
      input: text
    });

    return {
      embedding: response.data[0].embedding,
      model: response.model,
      usage: response.usage
    };
  }

  async streamText(prompt, options = {}) {
    const body = {
      model: options.model || this.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      stream: true
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`OpenAI streaming error: ${response.status}`);
    }

    return this.parseStream(response.body);
  }

  async* parseStream(stream) {
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

/**
 * Ollama Provider - Full Implementation
 */
class OllamaProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.supportsStreaming = true;
    this.supportsEmbeddings = true;
    this.baseUrl = config.ollamaBaseUrl || 'http://localhost:11434';
    this.model = config.ollamaModel || 'llama2';
    this.embeddingModel = config.ollamaEmbeddingModel || 'nomic-embed-text';
  }

  async validateConfig() {
    // Check if Ollama is running
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Ollama server not accessible');
      }
      const data = await response.json();
      this.availableModels = data.models || [];
      
      // Check if requested model is available
      const hasModel = this.availableModels.some(m => m.name === this.model);
      if (!hasModel && this.availableModels.length > 0) {
        console.warn(`Model ${this.model} not found. Available models:`, this.availableModels.map(m => m.name));
      }
    } catch (error) {
      throw new Error(`Cannot connect to Ollama at ${this.baseUrl}: ${error.message}`);
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`🦙 Ollama provider ready (model: ${this.model})`);
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model || this.model,
          prompt: prompt,
          stream: false,
          options: {
            num_predict: options.maxTokens || this.config.maxTokens,
            temperature: options.temperature || this.config.temperature,
            top_p: options.topP || this.config.topP
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        text: data.response,
        usage: {
          inputTokens: data.prompt_eval_count || 0,
          outputTokens: data.eval_count || 0
        },
        model: data.model,
        totalDuration: data.total_duration,
        loadDuration: data.load_duration,
        evalDuration: data.eval_duration
      };
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nJSON Response:`;
    
    const response = await this.generateText(structuredPrompt, options);
    const parsed = this.parseJSONResponse(response.text);
    
    if (!parsed) {
      throw new Error('Failed to parse structured response from Ollama');
    }
    
    return parsed;
  }

  async createEmbedding(text, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.embeddingModel || this.embeddingModel,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      embedding: data.embedding,
      model: data.model
    };
  }

  async streamText(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || this.model,
        prompt: prompt,
        stream: true,
        options: {
          num_predict: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama streaming error: ${response.status}`);
    }

    return this.parseStream(response.body);
  }

  async* parseStream(stream) {
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
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                yield parsed.response;
              }
              if (parsed.done) {
                return;
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

/**
 * Local Provider - For local models via transformers.js or ONNX
 */
class LocalProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.modelPath = config.localModelPath || './models';
    this.modelName = config.localModelName || 'Xenova/LaMini-Flan-T5-783M';
    this.pipeline = null;
  }

  async validateConfig() {
    // Check if we can import transformers.js
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.localURL = this.modelPath;
      env.allowRemoteModels = false;
      this.pipelineFactory = pipeline;
    } catch (error) {
      throw new Error('Local provider requires @xenova/transformers. Install with: npm install @xenova/transformers');
    }
  }

  async initialize() {
    await super.initialize();
    
    try {
      // Initialize the pipeline
      this.pipeline = await this.pipelineFactory('text2text-generation', this.modelName);
      console.log(`🏠 Local provider ready (model: ${this.modelName})`);
    } catch (error) {
      console.error('Failed to load local model:', error);
      throw error;
    }
  }

  async generateText(prompt, options = {}) {
    if (!this.pipeline) {
      throw new Error('Local model not initialized');
    }

    try {
      const result = await this.pipeline(prompt, {
        max_length: options.maxTokens || 512,
        temperature: options.temperature || this.config.temperature,
        top_p: options.topP || this.config.topP,
        do_sample: true
      });

      return {
        text: result[0].generated_text,
        usage: {
          inputTokens: prompt.length / 4, // Approximate
          outputTokens: result[0].generated_text.length / 4
        },
        model: this.modelName
      };
    } catch (error) {
      console.error('Local generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with JSON: ${JSON.stringify(schema)}`;
    const response = await this.generateText(structuredPrompt, options);
    
    const parsed = this.parseJSONResponse(response.text);
    if (!parsed) {
      // Fallback to simple structure
      return this.generateFallbackStructure(schema);
    }
    
    return parsed;
  }

  generateFallbackStructure(schema) {
    if (schema.type === 'object' && schema.properties) {
      const result = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (prop.type === 'string') {
          result[key] = 'Generated response';
        } else if (prop.type === 'number') {
          result[key] = 5;
        } else if (prop.type === 'array') {
          result[key] = ['Item 1', 'Item 2'];
        } else if (prop.type === 'object') {
          result[key] = {};
        }
      }
      return result;
    }
    return {};
  }

  async cleanup() {
    if (this.pipeline) {
      // Clean up model resources
      this.pipeline = null;
    }
    await super.cleanup();
  }
}

/**
 * HuggingFace Provider
 */
class HuggingFaceProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.huggingfaceApiKey || process.env.HUGGINGFACE_API_KEY;
    this.model = config.huggingfaceModel || 'meta-llama/Llama-2-7b-chat-hf';
    this.baseUrl = 'https://api-inference.huggingface.co/models';
  }

  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('HuggingFace API key not configured. Set HUGGINGFACE_API_KEY or provide huggingfaceApiKey in config');
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`🤗 HuggingFace provider ready (model: ${this.model})`);
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: options.maxTokens || this.config.maxTokens,
            temperature: options.temperature || this.config.temperature,
            top_p: options.topP || this.config.topP,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;

      return {
        text: generatedText,
        usage: {
          inputTokens: prompt.length / 4,
          outputTokens: generatedText.length / 4
        },
        model: this.model
      };
    } catch (error) {
      console.error('HuggingFace generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with JSON: ${JSON.stringify(schema, null, 2)}`;
    const response = await this.generateText(structuredPrompt, options);
    
    const parsed = this.parseJSONResponse(response.text);
    if (!parsed) {
      throw new Error('Failed to parse structured response from HuggingFace');
    }
    
    return parsed;
  }
}

/**
 * Cohere Provider
 */
class CohereProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.supportsStreaming = true;
    this.apiKey = config.cohereApiKey || process.env.COHERE_API_KEY;
    this.model = config.cohereModel || 'command';
    this.baseUrl = 'https://api.cohere.ai/v1';
  }

  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('Cohere API key not configured. Set COHERE_API_KEY or provide cohereApiKey in config');
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`🌊 Cohere provider ready (model: ${this.model})`);
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Cohere-Version': '2022-12-06'
        },
        body: JSON.stringify({
          model: options.model || this.model,
          prompt: prompt,
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          p: options.topP || this.config.topP,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cohere API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      return {
        text: data.generations[0].text,
        usage: {
          inputTokens: prompt.length / 4,
          outputTokens: data.generations[0].text.length / 4
        },
        model: this.model,
        likelihood: data.generations[0].likelihood
      };
    } catch (error) {
      console.error('Cohere generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
    const response = await this.generateText(structuredPrompt, options);
    
    const parsed = this.parseJSONResponse(response.text);
    if (!parsed) {
      throw new Error('Failed to parse structured response from Cohere');
    }
    
    return parsed;
  }
}

/**
 * Google Gemini Provider
 */
class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.supportsStreaming = true;
    this.supportsVision = true;
    this.apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    this.model = config.geminiModel || 'gemini-pro';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Set GEMINI_API_KEY or provide geminiApiKey in config');
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`♊ Gemini provider ready (model: ${this.model})`);
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: options.temperature || this.config.temperature,
              topP: options.topP || this.config.topP,
              maxOutputTokens: options.maxTokens || this.config.maxTokens
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      return {
        text: text,
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0
        },
        model: this.model,
        finishReason: data.candidates[0].finishReason
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
    const response = await this.generateText(structuredPrompt, options);
    
    const parsed = this.parseJSONResponse(response.text);
    if (!parsed) {
      throw new Error('Failed to parse structured response from Gemini');
    }
    
    return parsed;
  }
}

/**
 * Mistral Provider
 */
class MistralProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.supportsStreaming = true;
    this.apiKey = config.mistralApiKey || process.env.MISTRAL_API_KEY;
    this.model = config.mistralModel || 'mistral-medium';
    this.baseUrl = 'https://api.mistral.ai/v1';
  }

  async validateConfig() {
    if (!this.apiKey) {
      throw new Error('Mistral API key not configured. Set MISTRAL_API_KEY or provide mistralApiKey in config');
    }
  }

  async initialize() {
    await super.initialize();
    console.log(`🌪️ Mistral provider ready (model: ${this.model})`);
  }

  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model || this.model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          top_p: options.topP || this.config.topP,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${error}`);
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
    } catch (error) {
      console.error('Mistral generation error:', error);
      throw error;
    }
  }

  async generateStructured(prompt, schema, options = {}) {
    const structuredPrompt = `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`;
    const response = await this.generateText(structuredPrompt, options);
    
    const parsed = this.parseJSONResponse(response.text);
    if (!parsed) {
      throw new Error('Failed to parse structured response from Mistral');
    }
    
    return parsed;
  }
}

export default AIProviderPlugin;