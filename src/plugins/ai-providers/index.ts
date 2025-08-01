/**
 * AI Provider Plugin System
 * Pluggable AI/LLM providers with automatic fallback and load balancing
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class AIProviderPlugin extends BasePlugin {
  private providers = new Map();
  private providerConfig: any = null;
  private activeProvider: string | null = null;

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('AI Provider Plugin initialized');
    await this.loadProviderConfig();
    await this.initializeProviders();
    if (this.config.settings?.defaultProvider) {
      await this.setActiveProvider(this.config.settings.defaultProvider);
    }
  }

  async onStart(): Promise<void> {
    this.context.logger.info('AI Provider Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('AI Provider Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  private async loadProviderConfig(): Promise<void> {
    try {
      // Load configuration from context or use defaults
      this.providerConfig = this.config.settings?.providers || {
        providers: {
          'claude': { enabled: true, priority: 1 },
          'openai': { enabled: false, priority: 2 },
          'gemini': { enabled: false, priority: 3 }
        }
      };
    } catch (error) {
      this.context.logger.error('Failed to load provider config', error);
      throw error;
    }
  }

  private async initializeProviders(): Promise<void> {
    for (const [name, config] of Object.entries(this.providerConfig.providers)) {
      if ((config as any).enabled) {
        try {
          const provider = await this.createProvider(name, config);
          if (provider) {
            this.providers.set(name, {
              instance: provider,
              healthy: true,
              errorCount: 0,
              lastUsed: 0
            });
          }
        } catch (error) {
          this.context.logger.warn(`Failed to initialize provider ${name}`, error);
        }
      }
    }
  }

  private async createProvider(name: string, config: any): Promise<any> {
    switch (name) {
      case 'claude':
        return this.createClaudeProvider(config);
      case 'openai':
        return this.createOpenAIProvider(config);
      case 'gemini':
        return this.createGeminiProvider(config);
      default:
        throw new Error(`Unknown provider: ${name}`);
    }
  }

  private async createClaudeProvider(config: any): Promise<any> {
    // Claude provider implementation
    return {
      generateText: async (prompt: string) => {
        return `Claude response to: ${prompt}`;
      },
      healthCheck: async () => true
    };
  }

  private async createOpenAIProvider(config: any): Promise<any> {
    // OpenAI provider implementation
    return {
      generateText: async (prompt: string) => {
        return `OpenAI response to: ${prompt}`;
      },
      healthCheck: async () => true
    };
  }

  private async createGeminiProvider(config: any): Promise<any> {
    // Gemini provider implementation
    return {
      generateText: async (prompt: string) => {
        return `Gemini response to: ${prompt}`;
      },
      healthCheck: async () => true
    };
  }

  async setActiveProvider(providerName: string): Promise<void> {
    if (!this.providers.has(providerName)) {
      const availableProviders = Array.from(this.providers.keys());
      if (availableProviders.length > 0) {
        this.activeProvider = availableProviders[0];
        this.context.logger.warn(`Provider ${providerName} not available, using ${this.activeProvider} instead`);
        return;
      } else {
        this.context.logger.warn(`No providers available, ${providerName} requested but not found`);
        this.activeProvider = null;
        return;
      }
    }

    this.activeProvider = providerName;
    this.context.logger.info(`Active AI provider set to ${providerName}`);
  }

  async generateText(prompt: string, options: any = {}): Promise<string> {
    // Try active provider first
    if (this.activeProvider && this.providers.has(this.activeProvider)) {
      try {
        const result = await this.tryProvider(this.activeProvider, 'generateText', prompt, options);
        if (result) return result;
      } catch (error) {
        this.context.logger.warn(`${this.activeProvider} failed`, error);
      }
    }

    // Try fallback providers
    return await this.tryFallbackProviders('generateText', prompt, options);
  }

  private async tryFallbackProviders(method: string, ...args: any[]): Promise<any> {
    const sortedProviders = Array.from(this.providers.entries())
      .filter(([_, info]) => info.healthy)
      .sort(([a], [b]) => {
        const priorityA = this.providerConfig.providers[a]?.priority ?? 999;
        const priorityB = this.providerConfig.providers[b]?.priority ?? 999;
        return priorityA - priorityB;
      });

    for (const [name, info] of sortedProviders) {
      try {
        const result = await this.tryProvider(name, method, ...args);
        if (result) {
          this.context.logger.info(`Fallback successful with ${name}`);
          return result;
        }
      } catch (error) {
        this.context.logger.warn(`${name} fallback failed`, error);
      }
    }

    throw new Error('All providers failed');
  }

  private async tryProvider(providerName: string, method: string, ...args: any[]): Promise<any> {
    const providerInfo = this.providers.get(providerName);
    if (!providerInfo || !providerInfo.healthy) {
      return null;
    }

    const provider = providerInfo.instance;
    if (!provider[method]) {
      this.context.logger.warn(`Provider ${providerName} doesn't support method ${method}`);
      return null;
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Provider timeout')), this.config.settings?.timeout || 30000);
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

  async cleanup(): Promise<void> {
    // Clean up any active connections
    for (const [name, info] of this.providers) {
      if (info.instance.cleanup) {
        try {
          await info.instance.cleanup();
        } catch (error) {
          this.context.logger.warn(`Warning: Failed to cleanup provider ${name}`, error);
        }
      }
    }

    this.providers.clear();
    this.context.logger.info('AI Provider Plugin cleaned up');
  }
}

export default AIProviderPlugin;