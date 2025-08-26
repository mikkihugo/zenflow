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
} from '../types/api-providers';
import type {
  CLIProvider,
} from '../types/cli-providers';

const logger = getLogger('ModelRegistry');

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

    logger.info('🏭 ModelRegistry initialized with DI pattern');

    if (this.registryConfig.autoDiscovery) {
      this.startAutoDiscovery();
    }
  }

  /**
   * Register a provider with the registry
   */
  registerProvider(_provider: CLIProvider|APIProvider): void {
    logger.info(`📝 Registering provider: ${provider.name} (${provider.id})`);`

    this.providers.set(provider.id, provider);
    this.loadProviderModels(provider);

    this.emit('provider:registered', { providerId: provider.id, provider });
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(providerId: string): void {
    logger.info(`🗑️ Unregistering provider: ${{providerId}}`);`

    const provider = this.providers.get(providerId);
    if (provider) {
      // Remove all models from this provider
      for (const [modelId, model] of this.models.entries()) {
        if (model.provider === providerId) {
          this.models.delete(modelId);
        }
      }

      this.providers.delete(providerId);
      this.emit('provider:unregistered', { providerId, provider });
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
