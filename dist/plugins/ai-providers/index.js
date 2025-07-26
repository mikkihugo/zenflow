/**
 * AI Provider Plugin System
 * Pluggable AI/LLM providers with automatic fallback and load balancing
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export class AIProviderPlugin {
  constructor(config = {}) {
    this.config = {
      configFile: path.join(process.cwd(), '.hive-mind', 'ai-providers.json'),
      defaultProvider: 'claude',
      fallbackChain: ['claude', 'google', 'openrouter'],
      retryAttempts: 2,
      timeout: 30000,
      loadBalancing: false,
      ...config
    };
    
    this.providers = new Map();
    this.providerConfig = null;
    this.activeProvider = null;
  }

  async initialize() {
    console.log('🤖 AI Provider Plugin initialized');
    
    // Load provider configuration
    await this.loadProviderConfig();
    
    // Initialize available providers
    await this.initializeProviders();
    
    // Set default active provider
    await this.setActiveProvider(this.config.defaultProvider);
  }

  async loadProviderConfig() {
    try {
      const content = await readFile(this.config.configFile, 'utf8');
      this.providerConfig = JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Create default configuration
        this.providerConfig = {
          providers: {
            claude: {
              enabled: true,
              priority: 1,
              type: 'claude-code',
              config: {
                modelId: 'sonnet',
                maxTurns: 5,
                permissionMode: 'default'
              }
            },
            openrouter: {
              enabled: false,
              priority: 2,
              type: 'openrouter',
              config: {
                baseUrl: 'https://openrouter.ai/api/v1',
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                maxTokens: 4000,
                temperature: 0.7
              }
            },
            google: {
              enabled: true,
              priority: 3,
              type: 'google-ai',
              config: {
                model: 'gemini-2.5-flash-latest',
                safetySettings: 'default'
              }
            },
          },
          defaultProvider: 'claude',
          fallbackEnabled: true,
          loadBalancing: {
            enabled: false,
            strategy: 'round-robin', // round-robin, least-loaded, random
            healthCheck: true
          }
        };
        await this.saveProviderConfig();
      } else {
        throw error;
      }
    }
  }

  async saveProviderConfig() {
    await writeFile(this.config.configFile, JSON.stringify(this.providerConfig, null, 2));
  }

  async initializeProviders() {
    for (const [name, config] of Object.entries(this.providerConfig.providers)) {
      if (!config.enabled) continue;
      
      try {
        const provider = await this.createProvider(name, config);
        if (provider) {
          this.providers.set(name, {
            instance: provider,
            config: config,
            healthy: true,
            lastUsed: null,
            errorCount: 0
          });
          console.log(`✅ ${name} provider initialized`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${name} provider: ${error.message}`);
      }
    }
  }

  async createProvider(name, config) {
    switch (config.type) {
      case 'claude-code':
        return await this.createClaudeProvider(config.config);
      case 'openrouter':
        return await this.createOpenRouterProvider(config.config);
      case 'google-ai':
        return await this.createGoogleProvider(config.config);
      default:
        throw new Error(`Unknown provider type: ${config.type}`);
    }
  }

  async createClaudeProvider(config) {
    try {
      const { createClaudeCodeProvider } = await import('../../cli/claude-code-provider.js');
      return await createClaudeCodeProvider(config);
    } catch (error) {
      console.warn('Claude Code provider not available:', error.message);
      return null;
    }
  }

  async createOpenRouterProvider(config) {
    try {
      // OpenRouter uses OpenAI-compatible API
      const { OpenAI } = await import('openai');
      
      const openrouter = new OpenAI({
        baseURL: config.baseUrl || 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || config.apiKey || 'free',
        timeout: this.config.timeout,
        defaultHeaders: {
          'HTTP-Referer': 'https://claude-zen.ai',
          'X-Title': 'Claude Zen'
        }
      });

      return {
        type: 'openrouter',
        async generateText(prompt, options = {}) {
          const response = await openrouter.chat.completions.create({
            model: config.model || 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || config.maxTokens || 4000,
            temperature: options.temperature || config.temperature || 0.7,
            timeout: options.timeout || config.timeout
          });
          
          return response.choices[0].message.content;
        },

        async generateEmbedding(text) {
          // Use a free embedding model on OpenRouter
          const response = await openrouter.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text
          });
          
          return response.data[0].embedding;
        },

        async healthCheck() {
          try {
            // Simple health check with minimal request
            await openrouter.chat.completions.create({
              model: config.model || 'meta-llama/llama-3.1-8b-instruct:free',
              messages: [{ role: 'user', content: 'hi' }],
              max_tokens: 1
            });
            return true;
          } catch (error) {
            return false;
          }
        },

        async getAvailableModels() {
          try {
            const response = await fetch('https://openrouter.ai/api/v1/models', {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || config.apiKey || 'free'}`
              }
            });
            const data = await response.json();
            return data.data.filter(model => model.pricing.prompt === '0' || model.id.includes('free'));
          } catch (error) {
            console.warn('Failed to fetch OpenRouter models:', error.message);
            return [];
          }
        }
      };
    } catch (error) {
      console.warn('OpenRouter provider not available:', error.message);
      return null;
    }
  }

  async createGoogleProvider(config) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      
      const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY || config.apiKey
      );

      return {
        type: 'google-ai',
        async generateText(prompt, options = {}) {
          const modelName = options.modelType === 'pro' ? 
            'gemini-2.5-pro-latest' : 
            config.model || 'gemini-2.5-flash-latest';
            
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        },

        async healthCheck() {
          try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-latest' });
            await model.generateContent('test');
            return true;
          } catch (error) {
            return false;
          }
        }
      };
    } catch (error) {
      console.warn('Google AI provider not available:', error.message);
      return null;
    }
  }


  async setActiveProvider(providerName) {
    if (!this.providers.has(providerName)) {
      // Try to find an available provider instead of throwing
      const availableProviders = Array.from(this.providers.keys());
      if (availableProviders.length > 0) {
        this.activeProvider = availableProviders[0];
        console.log(`⚠️ Provider ${providerName} not available, using ${this.activeProvider} instead`);
        return;
      } else {
        console.warn(`⚠️ No providers available, ${providerName} requested but not found`);
        this.activeProvider = null;
        return;
      }
    }
    
    this.activeProvider = providerName;
    console.log(`🎯 Active AI provider: ${providerName}`);
  }

  async generateText(prompt, options = {}) {
    // Try active provider first
    if (this.activeProvider && this.providers.has(this.activeProvider)) {
      try {
        const result = await this.tryProvider(this.activeProvider, 'generateText', prompt, options);
        if (result) return result;
      } catch (error) {
        console.warn(`❌ ${this.activeProvider} failed: ${error.message}`);
        this.markProviderUnhealthy(this.activeProvider);
      }
    }

    // Fallback chain if active provider fails
    if (this.providerConfig.fallbackEnabled) {
      return await this.executeWithFallback('generateText', prompt, options);
    }

    throw new Error('All AI providers failed');
  }

  async generateEmbedding(text, options = {}) {
    // Try active provider first
    if (this.activeProvider && this.providers.has(this.activeProvider)) {
      try {
        const result = await this.tryProvider(this.activeProvider, 'generateEmbedding', text, options);
        if (result) return result;
      } catch (error) {
        console.warn(`❌ ${this.activeProvider} embedding failed: ${error.message}`);
      }
    }

    // Fallback for embedding generation
    return await this.executeWithFallback('generateEmbedding', text, options);
  }

  async executeWithFallback(method, ...args) {
    const sortedProviders = Array.from(this.providers.entries())
      .filter(([_, info]) => info.healthy)
      .sort(([, a], [, b]) => {
        const priorityA = this.providerConfig.providers[a.config]?.priority || 999;
        const priorityB = this.providerConfig.providers[b.config]?.priority || 999;
        return priorityA - priorityB;
      });

    for (const [name, info] of sortedProviders) {
      try {
        const result = await this.tryProvider(name, method, ...args);
        if (result) {
          console.log(`✅ Fallback successful with ${name}`);
          return result;
        }
      } catch (error) {
        console.warn(`❌ ${name} fallback failed: ${error.message}`);
        this.markProviderUnhealthy(name);
      }
    }

    throw new Error(`All providers failed for method: ${method}`);
  }

  async tryProvider(providerName, method, ...args) {
    const providerInfo = this.providers.get(providerName);
    if (!providerInfo || !providerInfo.healthy) {
      return null;
    }

    const provider = providerInfo.instance;
    if (!provider[method]) {
      console.warn(`⚠️ Provider ${providerName} doesn't support method: ${method}`);
      return null;
    }

    // Execute with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Provider timeout')), this.config.timeout);
    });

    try {
      const result = await Promise.race([
        provider[method](...args),
        timeoutPromise
      ]);

      // Update provider stats
      providerInfo.lastUsed = Date.now();
      providerInfo.errorCount = Math.max(0, providerInfo.errorCount - 1);
      
      return result;
    } catch (error) {
      providerInfo.errorCount++;
      throw error;
    }
  }

  markProviderUnhealthy(providerName) {
    const providerInfo = this.providers.get(providerName);
    if (providerInfo) {
      providerInfo.errorCount++;
      if (providerInfo.errorCount >= 3) {
        providerInfo.healthy = false;
        console.warn(`⚠️ Provider ${providerName} marked as unhealthy`);
      }
    }
  }

  async runHealthChecks() {
    const healthResults = {};
    
    for (const [name, info] of this.providers) {
      try {
        if (info.instance.healthCheck) {
          const isHealthy = await info.instance.healthCheck();
          info.healthy = isHealthy;
          healthResults[name] = { healthy: isHealthy, errorCount: info.errorCount };
        } else {
          healthResults[name] = { healthy: info.healthy, errorCount: info.errorCount };
        }
      } catch (error) {
        info.healthy = false;
        healthResults[name] = { healthy: false, error: error.message };
      }
    }
    
    return healthResults;
  }

  async getProviderStats() {
    const stats = {};
    
    for (const [name, info] of this.providers) {
      stats[name] = {
        type: info.instance.type,
        healthy: info.healthy,
        errorCount: info.errorCount,
        lastUsed: info.lastUsed,
        priority: this.providerConfig.providers[name]?.priority || 999,
        enabled: this.providerConfig.providers[name]?.enabled || false
      };
    }
    
    return {
      activeProvider: this.activeProvider,
      providers: stats,
      fallbackEnabled: this.providerConfig.fallbackEnabled,
      totalProviders: this.providers.size
    };
  }

  async switchProvider(providerName) {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider ${providerName} not available`);
    }

    await this.setActiveProvider(providerName);
    
    // Update config
    this.providerConfig.defaultProvider = providerName;
    await this.saveProviderConfig();
    
    return `Switched to ${providerName} provider`;
  }

  async enableProvider(providerName) {
    if (this.providerConfig.providers[providerName]) {
      this.providerConfig.providers[providerName].enabled = true;
      await this.saveProviderConfig();
      
      // Try to initialize the provider
      const config = this.providerConfig.providers[providerName];
      try {
        const provider = await this.createProvider(providerName, config);
        if (provider) {
          this.providers.set(providerName, {
            instance: provider,
            config: config,
            healthy: true,
            lastUsed: null,
            errorCount: 0
          });
          console.log(`✅ ${providerName} provider enabled and initialized`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${providerName}: ${error.message}`);
      }
      
      return `Provider ${providerName} enabled`;
    }
    
    throw new Error(`Provider ${providerName} not found in configuration`);
  }

  async disableProvider(providerName) {
    if (this.providerConfig.providers[providerName]) {
      this.providerConfig.providers[providerName].enabled = false;
      await this.saveProviderConfig();
      
      // Remove from active providers
      this.providers.delete(providerName);
      
      // Switch to another provider if this was active
      if (this.activeProvider === providerName) {
        const availableProviders = Array.from(this.providers.keys());
        if (availableProviders.length > 0) {
          await this.setActiveProvider(availableProviders[0]);
        } else {
          this.activeProvider = null;
        }
      }
      
      return `Provider ${providerName} disabled`;
    }
    
    throw new Error(`Provider ${providerName} not found in configuration`);
  }

  async cleanup() {
    // Clean up any active connections
    for (const [name, info] of this.providers) {
      if (info.instance.cleanup) {
        try {
          await info.instance.cleanup();
        } catch (error) {
          console.warn(`Warning: ${name} cleanup failed:`, error.message);
        }
      }
    }
    
    this.providers.clear();
    console.log('🤖 AI Provider Plugin cleaned up');
  }
}

export default AIProviderPlugin;