/**
 * @fileoverview Provider Database Registry - Rich Metadata Hub
 * 
 * Central registry that manages all provider-specific databases
 * while preserving their rich metadata capabilities.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation/logging';

import type {
  ProviderDatabase,
  RichModelInfo,
  BaseModelInfo,
  ModelQuery,
  ModelComparison,
  ProviderMetadata,
} from '../types/enhanced-models';

import { githubCopilotDB } from '../api/github-copilot-db';
import { githubModelsDB } from '../api/github-models-db';

const logger = getLogger('ProviderDatabaseRegistry');

/**
 * Provider Database Registry Events
 */
export interface ProviderDatabaseRegistryEvents {
  'database:registered': { providerId: string; modelCount: number };
  'database:updated': { providerId: string; modelCount: number };
  'models:changed': { providerId: string; added: number; removed: number };
}

/**
 * Central registry for all provider-specific databases
 */
export class ProviderDatabaseRegistry extends TypedEventBase<ProviderDatabaseRegistryEvents> {
  private databases = new Map<string, ProviderDatabase>();
  private modelCache = new Map<string, RichModelInfo>();
  private lastRefresh = new Map<string, Date>();

  constructor() {
    super();
    this.initializeBuiltinDatabases();
  }

  /**
   * Initialize built-in provider databases
   */
  private initializeBuiltinDatabases(): void {
    // Register GitHub Copilot DB
    this.registerDatabase('github-copilot', {
      getAllModels: () => githubCopilotDB.getAllModels(),
      getModel: (id: string) => githubCopilotDB.getModel(id),
      getModelsByCategory: (category: string) => 
        githubCopilotDB.getAllModels().filter(m => m.category === category),
      getProviderType: () => 'github-copilot',
      getLastUpdated: () => new Date(),
      updateModels: () => githubCopilotDB.updateModels().then(() => undefined),
      
      toRichModelInfo: (model) => ({
        // Base fields
        id: model.id,
        name: model.name,
        provider: 'github-copilot',
        family: model.family,
        version: model.version,
        contextWindow: model.contextWindow,
        maxTokens: model.maxOutputTokens,
        supportsStreaming: model.supportsStreaming,
        supportsVision: model.supportsVision,
        supportsToolCalls: model.supportsToolCalls,
        available: !model.preview, // Preview models may not be available
        lastUpdated: model.lastUpdated,
        
        // Rich metadata preservation
        providerMetadata: model,
        providerType: 'github-copilot',
      }),
      
      toBaseModelInfo: (model) => ({
        id: model.id,
        name: model.name,
        provider: 'github-copilot',
        family: model.family,
        version: model.version,
        contextWindow: model.contextWindow,
        maxTokens: model.maxOutputTokens,
        supportsStreaming: model.supportsStreaming,
        supportsVision: model.supportsVision,
        supportsToolCalls: model.supportsToolCalls,
        available: !model.preview,
        lastUpdated: model.lastUpdated,
      }),
    });

    // Register GitHub Models DB
    this.registerDatabase('github-models', {
      getAllModels: () => githubModelsDB.getAllModels(),
      getModel: (id: string) => githubModelsDB.getModel(id),
      getModelsByCategory: (category: string) => 
        githubModelsDB.getAllModels().filter(m => m.category === category),
      getProviderType: () => 'github-models',
      getLastUpdated: () => new Date(),
      updateModels: () => githubModelsDB.updateModels().then(() => undefined),
      
      toRichModelInfo: (model) => ({
        // Base fields
        id: model.id,
        name: model.name,
        provider: 'github-models',
        family: model.provider, // GitHub Models uses provider as family
        contextWindow: model.contextWindow,
        maxTokens: model.maxOutputTokens,
        supportsStreaming: true, // GitHub Models API supports streaming
        supportsVision: model.supportsVision,
        supportsToolCalls: false, // GitHub Models API doesn't support tools
        available: true,
        lastUpdated: model.lastUpdated,
        
        // Rich metadata preservation
        providerMetadata: model,
        providerType: 'github-models',
      }),
      
      toBaseModelInfo: (model) => ({
        id: model.id,
        name: model.name,
        provider: 'github-models',
        family: model.provider,
        contextWindow: model.contextWindow,
        maxTokens: model.maxOutputTokens,
        supportsStreaming: true,
        supportsVision: model.supportsVision,
        supportsToolCalls: false,
        available: true,
        lastUpdated: model.lastUpdated,
      }),
    });

    logger.info(`✅ Initialized ${this.databases.size} provider databases`);
  }

  /**
   * Register a new provider database
   */
  registerDatabase(providerId: string, database: ProviderDatabase): void {
    this.databases.set(providerId, database);
    const modelCount = database.getAllModels().length;
    
    this.emit('database:registered', { providerId, modelCount });
    logger.info(`📊 Registered ${providerId} database with ${modelCount} models`);
  }

  /**
   * Get all available provider databases
   */
  getProviderDatabases(): Array<{ id: string; type: string; modelCount: number }> {
    return Array.from(this.databases.entries()).map(([id, db]) => ({
      id,
      type: db.getProviderType(),
      modelCount: db.getAllModels().length,
    }));
  }

  /**
   * Get provider database by ID
   */
  getProviderDatabase(providerId: string): ProviderDatabase | undefined {
    return this.databases.get(providerId);
  }

  /**
   * Get all models with rich metadata preserved
   */
  getAllRichModels(): RichModelInfo[] {
    const allModels: RichModelInfo[] = [];
    
    for (const [providerId, db] of this.databases) {
      const models = db.getAllModels();
      for (const model of models) {
        allModels.push(db.toRichModelInfo(model));
      }
    }
    
    return allModels;
  }

  /**
   * Get model with rich metadata by ID
   */
  getRichModel(modelId: string): RichModelInfo | undefined {
    // Try cache first
    if (this.modelCache.has(modelId)) {
      return this.modelCache.get(modelId);
    }

    // Parse provider from model ID (format: provider:model)
    const [providerId, id] = modelId.includes(':') 
      ? modelId.split(':', 2) 
      : [this.guessProvider(modelId), modelId];

    const db = this.databases.get(providerId);
    if (!db) {
      return undefined;
    }

    const model = db.getModel(id);
    if (!model) {
      return undefined;
    }

    const richModel = db.toRichModelInfo(model);
    this.modelCache.set(modelId, richModel);
    return richModel;
  }

  /**
   * Query models with advanced filtering
   */
  queryModels(query: ModelQuery): RichModelInfo[] {
    let models = this.getAllRichModels();

    // Apply filters
    if (query.provider) {
      models = models.filter(m => m.provider === query.provider);
    }
    
    if (query.family) {
      models = models.filter(m => m.family?.toLowerCase().includes(query.family!.toLowerCase()));
    }
    
    if (query.minContextWindow) {
      models = models.filter(m => m.contextWindow >= query.minContextWindow!);
    }
    
    if (query.requiresVision) {
      models = models.filter(m => m.supportsVision === query.requiresVision);
    }
    
    if (query.requiresToolCalls) {
      models = models.filter(m => m.supportsToolCalls === query.requiresToolCalls);
    }
    
    if (query.requiresStreaming) {
      models = models.filter(m => m.supportsStreaming === query.requiresStreaming);
    }
    
    if (query.customFilter) {
      models = models.filter(query.customFilter);
    }

    // Apply sorting
    if (query.sortBy) {
      models.sort((a, b) => {
        let aVal: number;
        let bVal: number;
        
        switch (query.sortBy) {
          case 'contextWindow':
            aVal = a.contextWindow;
            bVal = b.contextWindow;
            break;
          case 'cost':
            aVal = a.pricing?.inputTokens || 0;
            bVal = b.pricing?.inputTokens || 0;
            break;
          case 'updated':
            aVal = a.lastUpdated.getTime();
            bVal = b.lastUpdated.getTime();
            break;
          default:
            return 0;
        }
        
        return query.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }

    // Apply limit
    if (query.limit) {
      models = models.slice(0, query.limit);
    }

    return models;
  }

  /**
   * Get type-safe provider-specific metadata
   */
  getProviderMetadata<P extends string>(
    modelId: string
  ): ProviderMetadata<P> | undefined {
    const richModel = this.getRichModel(modelId);
    return richModel?.providerMetadata as ProviderMetadata<P>;
  }

  /**
   * Update all provider databases
   */
  async updateAllDatabases(): Promise<void> {
    const updatePromises = Array.from(this.databases.entries()).map(
      async ([providerId, db]) => {
        try {
          await db.updateModels();
          this.lastRefresh.set(providerId, new Date());
          const modelCount = db.getAllModels().length;
          
          this.emit('database:updated', { providerId, modelCount });
          logger.info(`🔄 Updated ${providerId} database (${modelCount} models)`);
        } catch (error) {
          logger.error(`Failed to update ${providerId} database:`, error);
        }
      }
    );

    await Promise.all(updatePromises);
    this.modelCache.clear(); // Clear cache after updates
  }

  /**
   * Guess provider from model ID patterns
   */
  private guessProvider(modelId: string): string {
    if (modelId.startsWith('gpt-') || modelId.includes('openai')) {
      return 'github-copilot'; // Copilot has OpenAI models
    }
    if (modelId.includes('llama') || modelId.includes('mistral')) {
      return 'github-models'; // Models API has these
    }
    return 'github-copilot'; // Default fallback
  }
}

/**
 * Singleton instance
 */
export const providerDatabaseRegistry = new ProviderDatabaseRegistry();