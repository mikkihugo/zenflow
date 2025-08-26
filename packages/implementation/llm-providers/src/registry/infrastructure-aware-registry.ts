/**
 * @fileoverview Infrastructure-Aware Model Registry
 * 
 * Tier 1 compliant model registry that uses infrastructure facades
 * for database operations while preserving rich provider metadata.
 * 
 * ✅ TIER 1 COMPLIANT - Uses only strategic facades
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';

import type {
  BaseModelInfo,
  RichModelInfo,
} from '../types/enhanced-models';

const logger = getLogger('InfrastructureAwareRegistry');'

/**
 * Model cache interface for infrastructure database
 */
interface ModelCacheEntry {
  modelId: string;
  providerType: string;
  baseInfo: BaseModelInfo;
  richMetadata: Record<string, unknown>;
  lastUpdated: string; // ISO date string
  version: number;
}

/**
 * Provider sync status
 */
interface ProviderSyncStatus {
  providerId: string;
  lastSync: string; // ISO date string
  modelCount: number;
  errors: string[];
}

/**
 * Infrastructure-aware model registry events
 */
export interface InfrastructureAwareRegistryEvents {
  'models:cached': { count: number; provider: string };'
  'models:synced': { provider: string; changes: number };'
  'cache:updated': { totalModels: number };'
  'provider:error': { provider: string; error: string };'
}

/**
 * Model Registry using infrastructure database system
 * 
 * This is the correct Tier 1 approach:
 * - Uses @claude-zen/infrastructure facade for database operations
 * - Preserves rich provider metadata in structured cache
 * - Provides unified interface while respecting tier boundaries
 */
export class InfrastructureAwareModelRegistry extends TypedEventBase<InfrastructureAwareRegistryEvents> {
  private databaseSystem: any; // Will be typed by infrastructure facade
  private modelCache = new Map<string, RichModelInfo>();

  /**
   * Initialize with infrastructure database system
   */
  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Infrastructure-Aware Model Registry...');'
    
    try {
      // ✅ TIER 1 COMPLIANT: Use infrastructure facade
      this.databaseSystem = await getDatabaseSystem();
      
      // Setup model cache table/collection
      await this.setupModelCache();
      
      // Load existing cached models
      await this.loadFromCache();
      
      this.initialized = true;
      logger.info('✅ Infrastructure-Aware Model Registry initialized');'
    } catch (error) {
      logger.error('❌ Failed to initialize registry:', error);'
      
      // Graceful degradation - fall back to in-memory only
      logger.warn('🔄 Falling back to in-memory operation');'
      this.initialized = true;
    }
  }

  /**
   * Setup model cache in infrastructure database
   */
  private async setupModelCache(): Promise<void> {
    if (!this.databaseSystem) return;

    try {
      // Setup model cache table/collection structure
      await this.databaseSystem.createCollection('model_cache', {'
        indexes: [
          { fields: ['modelId'], unique: true },
          { fields: ['providerType'] },
          { fields: ['lastUpdated'] },
          { fields: ['baseInfo.provider'] },
          { fields: ['baseInfo.family'] },
        ]
      });

      // Setup provider sync status table
      await this.databaseSystem.createCollection('provider_sync_status', {'
        indexes: [
          { fields: ['providerId'], unique: true },
          { fields: ['lastSync'] },
        ]
      });

      logger.info('📊 Model cache storage initialized');'
    } catch (error) {
      logger.warn('Could not setup model cache storage:', error);'
    }
  }

  /**
   * Load models from infrastructure database cache
   */
  private async loadFromCache(): Promise<void> {
    if (!this.databaseSystem) return;

    try {
      const cachedModels = await this.databaseSystem.query('model_cache', {'
        orderBy: [{ field: 'lastUpdated', direction: 'desc' }]'
      });

      for (const cached of cachedModels) {
        const richModel: RichModelInfo = {
          ...cached.baseInfo,
          providerMetadata: cached.richMetadata,
          providerType: cached.providerType,
        };
        
        this.modelCache.set(cached.modelId, richModel);
      }

      logger.info(`📚 Loaded ${cachedModels.length} models from cache`);`
    } catch (error) {
      logger.warn('Could not load from cache:', error);'
    }
  }

  /**
   * Sync provider models and cache in infrastructure database
   */
  async syncProvider(
    providerId: string, 
    providerModels: any[], 
    transformer: (model: any) => RichModelInfo
  ): Promise<void> {
    logger.info(`🔄 Syncing $providerIdmodels...`);`
    
    const transformedModels = providerModels.map(transformer);
    let changesCount = 0;
    
    // Update in-memory cache
    for (const model of transformedModels) {
      const existing = this.modelCache.get(model.id);
      if (!existing || existing.lastUpdated < model.lastUpdated) {
        this.modelCache.set(model.id, model);
        changesCount++;
      }
    }

    // Update infrastructure database cache
    if (this.databaseSystem) {
      try {
        const cacheEntries: ModelCacheEntry[] = transformedModels.map(model => ({
          modelId: model.id,
          providerType: model.providerType,
          baseInfo: {
            id: model.id,
            name: model.name,
            provider: model.provider,
            family: model.family,
            version: model.version,
            contextWindow: model.contextWindow,
            maxTokens: model.maxTokens,
            supportsStreaming: model.supportsStreaming,
            supportsVision: model.supportsVision,
            supportsToolCalls: model.supportsToolCalls,
            available: model.available,
            lastUpdated: model.lastUpdated,
            pricing: model.pricing,
          },
          richMetadata: model.providerMetadata as Record<string, unknown>,
          lastUpdated: model.lastUpdated.toISOString(),
          version: 1,
        }));

        // Batch upsert to infrastructure database
        await this.databaseSystem.batchUpsert('model_cache', cacheEntries, {'
          conflictField: 'modelId''
        });

        // Update sync status
        const syncStatus: ProviderSyncStatus = {
          providerId,
          lastSync: new Date().toISOString(),
          modelCount: transformedModels.length,
          errors: [],
        };
        
        await this.databaseSystem.upsert('provider_sync_status', syncStatus, {'
          conflictField: 'providerId''
        });

        this.syncStatus.set(providerId, syncStatus);

      } catch (error) {
        logger.error(`Database sync failed for ${providerId}:`, error);`
        
        // Track error in sync status
        const errorStatus: ProviderSyncStatus = {
          providerId,
          lastSync: new Date().toISOString(),
          modelCount: transformedModels.length,
          errors: [error instanceof Error ? error.message : String(error)],
        };
        this.syncStatus.set(providerId, errorStatus);
        
        this.emit('provider:error', { '
          provider: providerId, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.emit('models:synced', { provider: providerId, changes: changesCount });'
    logger.info(`✅ Synced $transformedModels.lengthmodels for ${providerId} (${changesCount} changes)`);`
  }

  /**
   * Get all models (basic info)
   */
  getAllModels(): BaseModelInfo[] 
    return Array.from(this.modelCache.values()).map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      family: model.family,
      version: model.version,
      contextWindow: model.contextWindow,
      maxTokens: model.maxTokens,
      supportsStreaming: model.supportsStreaming,
      supportsVision: model.supportsVision,
      supportsToolCalls: model.supportsToolCalls,
      available: model.available,
      lastUpdated: model.lastUpdated,
      pricing: model.pricing,
    }));

  /**
   * Get all rich models
   */
  getAllRichModels(): RichModelInfo[] 
    return Array.from(this.modelCache.values());

  /**
   * Get rich model by ID
   */
  getRichModel(modelId: string): RichModelInfo | undefined 
    return this.modelCache.get(modelId);

  /**
   * Query models with advanced filtering
   */
  async queryModels(query: ModelQuery): Promise<RichModelInfo[]> 
    // If we have database system, use it for complex queries
    if (this.databaseSystem && this.shouldUseDatabaseQuery(query)) {
      return this.queryFromDatabase(query);
    }

    // Otherwise, use in-memory filtering
    return this.queryFromMemory(query);

  /**
   * Determine if query should use database vs memory
   */
  private shouldUseDatabaseQuery(query: ModelQuery): boolean 
    // Use database for complex queries or when dealing with large datasets
    return (
      this.modelCache.size > 1000 ||
      query.customFilter !== undefined ||
      query.sortBy !== undefined
    );

  /**
   * Query from infrastructure database
   */
  private async queryFromDatabase(query: ModelQuery): Promise<RichModelInfo[]> 
    try {
      const dbQuery: any = {};
      
      // Build database query
      if (query.provider) {
        dbQuery['baseInfo.provider'] = query.provider;'
      }
      if (query.family) {
        dbQuery['baseInfo.family'] = { $regex: query.family, $options: 'i' };'
      }
      if (query.minContextWindow) {
        dbQuery['baseInfo.contextWindow'] = { $gte: query.minContextWindow };'
      }
      if (query.requiresVision !== undefined) {
        dbQuery['baseInfo.supportsVision'] = query.requiresVision;'
      }
      if (query.requiresToolCalls !== undefined) {
        dbQuery['baseInfo.supportsToolCalls'] = query.requiresToolCalls;'
      }
      if (query.requiresStreaming !== undefined) {
        dbQuery['baseInfo.supportsStreaming'] = query.requiresStreaming;'
      }

      const _options: any = {};
      if (query.sortBy) {
        const _sortField = `baseInfo.${query.sortBy}`;`
        options.orderBy = [{ 
          field: sortField, 
          direction: query.sortOrder === 'desc' ? 'desc' : 'asc' '
        }];
      }
      if (query.limit) {
        options.limit = query.limit;
      }

      const results = await this.databaseSystem.query('model_cache', dbQuery, options);'
      
      return results.map((cached: ModelCacheEntry) => ({
        ...cached.baseInfo,
        providerMetadata: cached.richMetadata,
        providerType: cached.providerType,
      }));
      
    } catch (error) {
      logger.warn('Database query failed, falling back to memory:', error);'
      return this.queryFromMemory(query);
    }
  }

  /**
   * Query from in-memory cache
   */
  private queryFromMemory(query: ModelQuery): RichModelInfo[] {
    let models = Array.from(this.modelCache.values());

    // Apply filters
    if (query.provider) {
      models = models.filter(m => m.provider === query.provider);
    }
    if (query.family) {
      models = models.filter(m => 
        m.family?.toLowerCase().includes(query.family!.toLowerCase())
      );
    }
    if (query.minContextWindow) {
      models = models.filter(m => m.contextWindow >= query.minContextWindow!);
    }
    if (query.requiresVision !== undefined) {
      models = models.filter(m => m.supportsVision === query.requiresVision);
    }
    if (query.requiresToolCalls !== undefined) {
      models = models.filter(m => m.supportsToolCalls === query.requiresToolCalls);
    }
    if (query.requiresStreaming !== undefined) {
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
          case 'contextWindow':'
            aVal = a.contextWindow;
            bVal = b.contextWindow;
            break;
          case 'cost':'
            aVal = a.pricing?.inputTokens || 0;
            bVal = b.pricing?.inputTokens || 0;
            break;
          case 'updated':'
            aVal = a.lastUpdated.getTime();
            bVal = b.lastUpdated.getTime();
            break;
          default:
            return 0;
        }
        
        return query.sortOrder === 'desc' ? bVal - aVal : aVal - bVal;'
      });
    }

    // Apply limit
    if (query.limit) {
      models = models.slice(0, query.limit);
    }

    return models;
  }

  /**
   * Get provider sync status
   */
  getProviderSyncStatus(): Array<ProviderSyncStatus> {
    return Array.from(this.syncStatus.values());
  }

  /**
   * Smart model recommendation using infrastructure database
   */
  async recommendModel(requirements: TaskRequirements): Promise<ModelRecommendation | undefined> {
    // Convert requirements to query
    const query: ModelQuery = {
      provider: requirements.preferredProviders?.[0],
      minContextWindow: requirements.minContextTokens,
      requiresVision: requirements.needsVision,
      requiresToolCalls: requirements.needsToolCalls,
      requiresStreaming: requirements.needsStreaming,
      customFilter: requirements.customFilter,
      sortBy: 'contextWindow',
      sortOrder: 'desc',
      limit: 10,
    };

    const candidates = await this.queryModels(query);
    
    if (candidates.length === 0) {
      return undefined;
    }

    // Simple scoring for now - could be enhanced with ML
    const scored = candidates.map(model => ({
      model,
      score: this.calculateTaskScore(model, requirements),
    }));

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];

    return {
      modelId: best.model.id,
      confidence: Math.min(best.score / 100, 1.0),
      reasoning: [`Selected $best.model.namefor ${requirements.task} task`],`
      alternatives: scored.slice(1, 3).map(s => ({
        modelId: s.model.id,
        reason: `Alternative with ${s.model.contextWindow} context`,`
        tradeoff: 'Different performance characteristics',
      })),
    };
  }

  /**
   * Calculate task-specific score
   */
  private calculateTaskScore(model: RichModelInfo, requirements: TaskRequirements): number {
    let score = 50;

    // Task-specific scoring
    if (requirements.task === 'coding' && model.supportsToolCalls) score += 20;'
    if (requirements.task === 'vision' && model.supportsVision) score += 30;'
    
    // Context requirements
    if (requirements.minContextTokens && model.contextWindow >= requirements.minContextTokens) {
      score += 15;
    }

    // Priority adjustments
    if (requirements.priority === 'quality' && model.family?.includes('gpt-4')) {'
      score += 20;
    }

    return score;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): 
    totalModels: number;
    providers: number;
    lastUpdate: Date | null;
    memoryUsage: number;{
    const lastUpdate = Math.max(...Array.from(this.modelCache.values())
      .map(m => m.lastUpdated.getTime()));

    return {
      totalModels: this.modelCache.size,
      providers: new Set(Array.from(this.modelCache.values()).map(m => m.provider)).size,
      lastUpdate: lastUpdate ? new Date(lastUpdate) : null,
      memoryUsage: this.modelCache.size * 2048, // Rough estimate
    };
  }

/**
 * Create infrastructure-aware registry service
 */
export async function _createInfrastructureAwareModelRegistry(): Promise<InfrastructureAwareModelRegistry> {
  const registry = new InfrastructureAwareModelRegistry();
  await registry.initialize();
  return registry;
}