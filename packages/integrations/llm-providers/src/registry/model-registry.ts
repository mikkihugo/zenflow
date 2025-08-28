/**
 * @fileoverview Model Registry
 *
 * Persistent registry that lists models from providers.
 */

import { getLogger} from '@claude-zen/foundation';
import { getDatabaseSystem} from '@claude-zen/infrastructure';

const logger = getLogger('ModelRegistry');

/**
 * Model information
 */
export interface ModelInfo {
  // Identity
  id:string;
  name:string;
  provider:string;
  family?:string;
  version?:string;

  // Core capabilities
  contextWindow:number;
  maxTokens:number;

  // Basic features
  supportsStreaming:boolean;
  supportsVision:boolean;
  supportsToolCalls:boolean;

  // Metadata
  available:boolean;
  lastUpdated:Date;

  // Pricing (if available)
  pricing?:{
    inputTokens:number;
    outputTokens:number;
    currency:string;
};
}

/**
 * Model Registry - Persistent with provider listing
 */
export class ModelRegistry {
  private models = new Map<string, ModelInfo>();
  private databaseSystem:any;

  constructor() {
    this.initialize();
}

  /**
   * Add a model
   */
  addModel(model:ModelInfo): void {
    this.models.set(model.id, model);
    logger.debug(`Added model:${model.id}`);
}

  /**
   * Get a model
   */
  getModel(id:string): ModelInfo | undefined {
    return this.models.get(id);
}

  /**
   * Get all models
   */
  getAllModels():ModelInfo[] {
    return Array.from(this.models.values());
}

  /**
   * Find models by provider
   */
  getModelsByProvider(provider:string): ModelInfo[] {
    return this.getAllModels().filter((m) => m['provider'] === provider);
}

  /**
   * Find models with vision support
   */
  getVisionModels():ModelInfo[] {
    return this.getAllModels().filter((m) => m.supportsVision);
}

  /**
   * Find models with tool calling
   */
  getToolModels():ModelInfo[] {
    return this.getAllModels().filter((m) => m.supportsToolCalls);
}

  /**
   * Find models with streaming support
   */
  getStreamingModels():ModelInfo[] {
    return this.getAllModels().filter((m) => m.supportsStreaming);
}

  /**
   * Find models by context window size
   */
  getModelsByContextSize(minTokens:number): ModelInfo[] {
    return this.getAllModels().filter((m) => m['contextWindow'] >= minTokens);
}

  /**
   * Find models by family
   */
  getModelsByFamily(family:string): ModelInfo[] {
    return this.getAllModels().filter((m) =>
      m.family?.toLowerCase().includes(family.toLowerCase())
    );
}

  /**
   * Recommend model based on requirements
   */
  recommendModel(requirements:{
    task?:'coding' | ' vision' | ' reasoning' | ' writing' | ' analysis' | ' chat';
    minContextTokens?:number;
    needsVision?:boolean;
    needsToolCalls?:boolean;
    needsStreaming?:boolean;
    preferredProviders?:string[];
    excludeProviders?:string[];
    priority?:'speed' | ' quality' | ' balanced' | ' cost';
}):ModelInfo | undefined {
    let candidates = this.getAllModels().filter((m) => m.available);

    // Apply requirements
    if (requirements.minContextTokens) {
      candidates = candidates.filter(
        (m) => m['contextWindow'] >= requirements.minContextTokens!
      );
}
    if (requirements.needsVision) {
      candidates = candidates.filter((m) => m.supportsVision);
}
    if (requirements.needsToolCalls) {
      candidates = candidates.filter((m) => m.supportsToolCalls);
}
    if (requirements.needsStreaming) {
      candidates = candidates.filter((m) => m.supportsStreaming);
}
    if (requirements.preferredProviders?.length) {
      candidates = candidates.filter((m) =>
        requirements.preferredProviders!.includes(m.provider)
      );
}
    if (requirements.excludeProviders?.length) {
      candidates = candidates.filter(
        (m) => !requirements.excludeProviders!.includes(m.provider)
      );
}

    if (candidates['length'] === 0) return undefined;

    // Simple scoring - pick best match
    candidates.sort((a, b) => {
      let scoreA = 0,
        scoreB = 0;

      // Task-specific scoring
      if (requirements['task'] === ' coding' && a.supportsToolCalls)
        scoreA += 20;
      if (requirements['task'] === ' coding' && b.supportsToolCalls)
        scoreB += 20;
      if (requirements['task'] === ' vision' && a.supportsVision) scoreA += 30;
      if (requirements['task'] === ' vision' && b.supportsVision) scoreB += 30;

      // Context size (bigger is better)
      scoreA += Math.min(a['contextWindow'] / 1000, 50);
      scoreB += Math.min(b['contextWindow'] / 1000, 50);

      // Cost preference
      if (requirements['priority'] === ' cost') {
        scoreA -= (a.pricing?.inputTokens || 0) * 10;
        scoreB -= (b.pricing?.inputTokens || 0) * 10;
}

      return scoreB - scoreA;
});

    return candidates[0];
}

  /**
   * Initialize registry
   */
  private async initialize():Promise<void> {
    this['databaseSystem'] = await getDatabaseSystem();
    await this.loadFromDatabase();
    await this.syncFromProviders();
}

  /**
   * Load persisted models from database
   */
  private async loadFromDatabase():Promise<void> {
    try {
      const stored = await this.databaseSystem.query('models');
      for (const model of stored) {
        this.models.set(model.id, model);
}
      logger.info(`Loaded ${stored.length} models from database`);
} catch (error) {
      logger.warn('Could not load from database: ', error);
'}
}

  /**
   * Sync models from providers
   */
  private async syncFromProviders():Promise<void> {
    // List models from each provider
    const providers = [
      'github-copilot',      'github-models',      'anthropic',      'openai',];

    for (const providerId of providers) {
      try {
        const providerModels = await this.listProviderModels(providerId);
        for (const model of providerModels) {
          this.addModel(model);
}
        logger.info(
          `Synced ${providerModels.length} models from ${providerId}`
        );
} catch (error) {
        logger.warn(`Failed to sync models from ${providerId}:`, error);
}
}

    // Persist to database
    await this.saveToDatabase();
}

  /**
   * List models from a provider
   */
  private async listProviderModels(providerId:string): Promise<ModelInfo[]> {
    // This would call the actual provider APIs to list available models
    // For now, return empty array - providers would implement this
    return [];
}

  /**
   * Save models to database
   */
  private async saveToDatabase():Promise<void> {
    try {
      const models = Array.from(this.models.values());
      await this.databaseSystem.upsert('models', models);
      logger.info(`Saved ${models.length} models to database`);
} catch (error) {
      logger.warn('Could not save to database: ', error);
'}
}
}

/**
 * Global registry instance - the only one
 */
export const modelRegistry = new ModelRegistry();

/**
 * Get the model registry
 */
export function getModelRegistry():ModelRegistry {
  return modelRegistry;
}
