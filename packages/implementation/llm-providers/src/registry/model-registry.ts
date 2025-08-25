/**
 * @fileoverview Models Registry with Dependency Injection
 *
 * DI-based registry for managing LLM providers and their available models.
 * Follows dependency injection patterns for easy testing and configuration.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation/logging';

import type {
  APIProvider,
  APIProviderCapabilities,
} from '../types/api-providers';
import type {
  CLIProvider,
  CLIProviderCapabilities,
} from '../types/cli-providers';

const logger = getLogger('ModelRegistry');'

/**
 * Model information interface
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  contextWindow: number;
  maxTokens: number;
  pricing?: {
    inputTokens: number;
    outputTokens: number;
    currency: string;
  };
  available: boolean;
}

/**
 * Registry configuration interface
 */
export interface ModelRegistryConfig {
  autoDiscovery: boolean;
  refreshInterval?: number;
  enableCache: boolean;
}

/**
 * Model Registry with Dependency Injection
 *
 * Manages registration and discovery of LLM providers and their models.
 * Uses DI pattern for flexible configuration and testing.
 */
export class ModelRegistry extends TypedEventBase {
  private providers = new Map<string, CLIProvider|APIProvider>();
  private models = new Map<string, ModelInfo>();
  private registryConfig: ModelRegistryConfig;

  constructor(config: Partial<ModelRegistryConfig> = {}) {
    super();

    this.registryConfig = {
      autoDiscovery: true,
      refreshInterval: 60000, // 1 minute
      enableCache: true,
      ...config,
    };

    logger.info('🏭 ModelRegistry initialized with DI pattern');'

    if (this.registryConfig.autoDiscovery) {
      this.startAutoDiscovery();
    }
  }

  /**
   * Register a provider with the registry
   */
  registerProvider(provider: CLIProvider|APIProvider): void {
    logger.info(`📝 Registering provider: ${provider.name} (${provider.id})`);`

    this.providers.set(provider.id, provider);
    this.loadProviderModels(provider);

    this.emit('provider:registered', { providerId: provider.id, provider });'
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(providerId: string): void {
    logger.info(`🗑️ Unregistering provider: ${providerId}`);`

    const provider = this.providers.get(providerId);
    if (provider) {
      // Remove all models from this provider
      for (const [modelId, model] of this.models.entries()) {
        if (model.provider === providerId) {
          this.models.delete(modelId);
        }
      }

      this.providers.delete(providerId);
      this.emit('provider:unregistered', { providerId, provider });'
    }
  }

  /**
   * Get provider by ID
   */
  getProvider(providerId: string): CLIProvider|APIProvider|undefined {
    return this.providers.get(providerId);
  }

  /**
   * List all registered providers
   */
  listProviders(): (CLIProvider|APIProvider)[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): ModelInfo|undefined {
    return this.models.get(modelId);
  }

  /**
   * List all available models
   */
  listModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }

  /**
   * Find models by capability
   */
  findModelsByCapability(capability: string): ModelInfo[] {
    return Array.from(this.models.values()).filter((model) =>
      model.capabilities.includes(capability)
    );
  }

  /**
   * Find models by provider
   */
  findModelsByProvider(providerId: string): ModelInfo[] {
    return Array.from(this.models.values()).filter(
      (model) => model.provider === providerId
    );
  }

  /**
   * Get best model for a specific use case
   */
  getBestModel(criteria: {
    capability?: string;
    maxCost?: number;
    minContextWindow?: number;
    provider?: string;
  }): ModelInfo|undefined {
    let candidates = Array.from(this.models.values()).filter(
      (model) => model.available
    );

    // Filter by criteria
    if (criteria.capability) {
      candidates = candidates.filter((model) =>
        model.capabilities.includes(criteria.capability!)
      );
    }

    if (criteria.provider) {
      candidates = candidates.filter(
        (model) => model.provider === criteria.provider
      );
    }

    if (criteria.minContextWindow) {
      candidates = candidates.filter(
        (model) => model.contextWindow >= criteria.minContextWindow!
      );
    }

    if (criteria.maxCost && candidates.length > 0) {
      candidates = candidates.filter((model) => {
        if (!model.pricing) return true;
        return model.pricing.outputTokens <= criteria.maxCost!;
      });
    }

    // Sort by context window (larger is better) and cost (lower is better)
    candidates.sort((a, b) => {
      const aScore = a.contextWindow - (a.pricing?.outputTokens||0) * 1000;
      const bScore = b.contextWindow - (b.pricing?.outputTokens||0) * 1000;
      return bScore - aScore;
    });

    return candidates[0];
  }

  /**
   * Load models from a provider's capabilities'
   */
  private loadProviderModels(provider: CLIProvider | APIProvider): void {
    try {
      const capabilities = provider.getCapabilities();

      for (const modelId of capabilities.models) {
        const modelInfo: ModelInfo = {
          id: `${provider.id}:${modelId}`,`
          name: modelId,
          provider: provider.id,
          capabilities: this.extractCapabilities(capabilities),
          contextWindow: capabilities.contextWindow,
          maxTokens: capabilities.maxTokens,
          pricing: capabilities.pricing,
          available: true,
        };

        this.models.set(modelInfo.id, modelInfo);
        logger.info(
          `📊 Registered model: ${modelInfo.name} from ${provider.name}``
        );
      }

      this.emit('models:loaded', {'
        providerId: provider.id,
        modelCount: capabilities.models.length,
      });
    } catch (error) {
      logger.error(
        `Failed to load models from provider ${provider.id}:`,`
        error
      );
    }
  }

  /**
   * Extract capability strings from provider capabilities
   */
  private extractCapabilities(
    capabilities: CLIProviderCapabilities|APIProviderCapabilities
  ): string[] {
    const caps: string[] = [];

    for (const [key, value] of Object.entries(capabilities.features)) {
      if (value === true) {
        caps.push(key);
      }
    }

    return caps;
  }

  /**
   * Start auto-discovery of providers
   */
  private startAutoDiscovery(): void {
    if (this.registryConfig.refreshInterval) {
      setInterval(() => {
        this.refreshAvailability();
      }, this.registryConfig.refreshInterval);
    }
  }

  /**
   * Refresh model availability
   */
  private async refreshAvailability(): Promise<void> {
    logger.debug('🔄 Refreshing model availability...');'

    for (const [providerId, provider] of this.providers.entries()) {
      try {
        // Check if provider has healthCheck method
        if (
          'healthCheck' in provider &&'
          typeof provider.healthCheck === 'function''
        ) {
          const isHealthy = await provider.healthCheck();

          // Update all models from this provider
          for (const [modelId, model] of this.models.entries()) {
            if (model.provider === providerId) {
              const wasAvailable = model.available;
              model.available = isHealthy;

              if (wasAvailable !== isHealthy) {
                this.emit('model:availability-changed', {'
                  modelId,
                  available: isHealthy,
                });
              }
            }
          }
        }
      } catch (error) {
        logger.warn(`Health check failed for provider ${providerId}:`, error);`
      }
    }
  }

  /**
   * Export registry state for debugging
   */
  getRegistryState(): {
    providers: string[];
    models: string[];
    config: ModelRegistryConfig;
  } {
    return {
      providers: Array.from(this.providers.keys()),
      models: Array.from(this.models.keys()),
      config: this.registryConfig,
    };
  }
}

/**
 * DI Factory for ModelRegistry
 */
export class ModelRegistryFactory {
  private static instance: ModelRegistry;

  /**
   * Create or get singleton instance
   */
  static getInstance(config?: Partial<ModelRegistryConfig>): ModelRegistry {
    if (!this.instance) {
      this.instance = new ModelRegistry(config);
    }
    return this.instance;
  }

  /**
   * Create new instance (for testing)
   */
  static createInstance(config?: Partial<ModelRegistryConfig>): ModelRegistry {
    return new ModelRegistry(config);
  }

  /**
   * Reset singleton (for testing)
   */
  static reset(): void {
    this.instance = undefined;
  }
}

/**
 * DI Service for automatic provider registration
 */
export class ModelRegistryService {
  constructor(
    private registry: ModelRegistry,
    private providers: (CLIProvider|APIProvider)[]
  ) {}

  /**
   * Initialize the service by registering all providers
   */
  initialize(): void {
    logger.info('🚀 Initializing ModelRegistryService...');'

    for (const provider of this.providers) {
      this.registry.registerProvider(provider);
    }

    logger.info(
      `✅ ModelRegistryService initialized with ${this.providers.length} providers``
    );
  }

  /**
   * Get the registry instance
   */
  getRegistry(): ModelRegistry {
    return this.registry;
  }
}

/**
 * Export factory function for easy DI setup
 */
export function createModelRegistryService(
  providers: (CLIProvider | APIProvider)[],
  config?: Partial<ModelRegistryConfig>
): ModelRegistryService {
  const registry = ModelRegistryFactory.createInstance(config);
  return new ModelRegistryService(registry, providers);
}
