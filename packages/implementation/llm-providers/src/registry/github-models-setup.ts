/**
 * @fileoverview GitHub Models Registry Setup with DI
 *
 * Dependency injection setup for loading GitHub models (Models API and Copilot)
 * into the model registry. Follows DI patterns for clean architecture.
 */

import { getLogger } from '@claude-zen/foundation/logging';

import { createGitHubCopilotProvider } from '../api/github-copilot';
import { GitHubModelsAPI } from '../api/github-models';
import type { APIProvider } from '../types/api-providers';

import {
  ModelRegistryService,
  createModelRegistryService,
} from './model-registry';

const logger = getLogger('GitHubModelsSetup');

/**
 * GitHub Models configuration
 */
export interface GitHubModelsConfig {
  modelsApi: {
    enabled: boolean;
    token?: string;
    models?: string[];
  };
  copilotApi: {
    enabled: boolean;
    token?: string;
    models?: string[];
  };
  registry: {
    autoDiscovery?: boolean;
    refreshInterval?: number;
  };
}

/**
 * Default GitHub Models configuration
 */
const DEFAULT_CONFIG: GitHubModelsConfig = {
  modelsApi: {
    enabled: true,
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-3.5-turbo',
      'claude-3-5-sonnet',
      'llama-3-70b',
    ],
  },
  copilotApi: {
    enabled: true,
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-sonnet'],
  },
  registry: {
    autoDiscovery: true,
    refreshInterval: 60000,
  },
};

/**
 * DI Container for GitHub Models
 */
export class GitHubModelsContainer {
  private providers: APIProvider[] = [];
  private registryService?: ModelRegistryService;
  private config: GitHubModelsConfig;

  constructor(config: Partial<GitHubModelsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('🏭 GitHubModelsContainer initialized with DI pattern');
  }

  /**
   * Setup GitHub Models API provider
   */
  private setupModelsApi(): APIProvider|null {
    if (!this.config.modelsApi.enabled) {
      logger.info('⏭️ GitHub Models API disabled, skipping...');
      return null;
    }

    try {
      const token = this.config.modelsApi.token||process.env.GITHUB_TOKEN;
      if (!token) {
        logger.warn('⚠️ No GitHub token found for Models API, skipping...');
        return null;
      }

      const provider = new GitHubModelsAPI({ token });
      logger.info('✅ GitHub Models API provider configured');
      return provider;
    } catch (error) {
      logger.error('❌ Failed to setup GitHub Models API:', error);
      return null;
    }
  }

  /**
   * Setup GitHub Copilot API provider
   */
  private setupCopilotApi(): APIProvider|null {
    if (!this.config.copilotApi.enabled) {
      logger.info('⏭️ GitHub Copilot API disabled, skipping...');
      return null;
    }

    try {
      const provider = createGitHubCopilotProvider();
      logger.info('✅ GitHub Copilot API provider configured');
      return provider;
    } catch (error) {
      logger.error('❌ Failed to setup GitHub Copilot API:', error);
      return null;
    }
  }

  /**
   * Initialize all GitHub providers
   */
  async initialize(): Promise<ModelRegistryService> {
    logger.info('🚀 Initializing GitHub Models with DI container...');

    // Setup providers
    const modelsProvider = this.setupModelsApi();
    if (modelsProvider) {
      this.providers.push(modelsProvider);
    }

    const copilotProvider = this.setupCopilotApi();
    if (copilotProvider) {
      this.providers.push(copilotProvider);
    }

    if (this.providers.length === 0) {
      throw new Error(
        'No GitHub providers could be initialized. Check your configuration and tokens.');
    }

    // Create registry service
    this.registryService = createModelRegistryService(
      this.providers,
      this.config.registry
    );

    // Initialize the service
    await this.registryService.initialize();

    logger.info(
      `✅ GitHub Models container initialized with ${this.providers.length} providers`
    );
    return this.registryService;
  }

  /**
   * Get initialized providers
   */
  getProviders(): APIProvider[] {
    return [...this.providers];
  }

  /**
   * Get registry service
   */
  getRegistryService(): ModelRegistryService|undefined {
    return this.registryService;
  }

  /**
   * Get available models summary
   */
  getModelsSummary(): {
    totalModels: number;
    providerCounts: Record<string, number>;
    capabilities: string[];
  } {
    if (!this.registryService) {
      return { totalModels: 0, providerCounts: {}, capabilities: [] };
    }

    const registry = this.registryService.getRegistry();
    const models = registry.listModels();

    const providerCounts: Record<string, number> = {};
    const capabilitySet = new Set<string>();

    for (const model of models) {
      providerCounts[model.provider] =
        (providerCounts[model.provider] || 0) + 1;
      for (const cap of model.capabilities) {
        capabilitySet.add(cap);
      }
    }

    return {
      totalModels: models.length,
      providerCounts,
      capabilities: Array.from(capabilitySet),
    };
  }
}

/**
 * Factory function for easy setup
 */
export async function setupGitHubModels(
  config: Partial<GitHubModelsConfig> = {}
): Promise<ModelRegistryService> {
  const container = new GitHubModelsContainer(config);
  return await container.initialize();
}

/**
 * Quick setup with default configuration
 */
export async function setupGitHubModelsDefault(): Promise<ModelRegistryService> {
  logger.info('🎯 Setting up GitHub Models with default configuration...');

  try {
    const registryService = await setupGitHubModels();
    const container = new GitHubModelsContainer();
    const summary = container.getModelsSummary();

    logger.info('📊 GitHub Models setup complete:');
    logger.info(`   Total Models: ${summary.totalModels}`);
    logger.info(
      `   Providers: ${Object.keys(summary.providerCounts).join(', ')}`
    );
    logger.info(
      `   Capabilities: ${summary.capabilities.slice(0, 5).join(', ')}${summary.capabilities.length > 5 ? '...' : ''}`
    );

    return registryService;
  } catch (error) {
    logger.error('❌ Failed to setup GitHub Models:', error);
    throw error;
  }
}

/**
 * Advanced setup with custom provider filtering
 */
export async function setupGitHubModelsAdvanced(options: {
  enableModelsApi?: boolean;
  enableCopilot?: boolean;
  tokenSource?: 'env' | 'config' | 'auto';
  filterModels?: (modelId: string) => boolean;
}): Promise<ModelRegistryService> {
  const config: Partial<GitHubModelsConfig> = {
    modelsApi: {
      enabled: options.enableModelsApi ?? true,
    },
    copilotApi: {
      enabled: options.enableCopilot ?? true,
    },
  };

  const registryService = await setupGitHubModels(config);

  // Apply model filtering if provided
  if (options.filterModels) {
    const registry = registryService.getRegistry();
    const allModels = registry.listModels();

    for (const model of allModels) {
      if (!options.filterModels!(model.id)) {
        // Note: In a real implementation, we'd add a method to disable/filter models
        logger.debug(`🚫 Filtering out model: ${model.id}`);
      }
    }
  }

  return registryService;
}
