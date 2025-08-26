/**
 * @fileoverview Enhanced Model Registry - Rich Metadata + Unified Interface
 * 
 * Next-generation model registry that preserves rich provider-specific metadata
 * while providing powerful unified querying and intelligent model selection.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation/logging';
import type {
  RichModelInfo,
} from '../types/enhanced-models';

import { 
  type ProviderDatabaseRegistryEvents, 
  providerDatabaseRegistry
} from './provider-database-registry';

const logger = getLogger('EnhancedModelRegistry');'

/**
 * Enhanced Model Registry Events
 */
export interface EnhancedModelRegistryEvents extends ProviderDatabaseRegistryEvents {
  'models:indexed': { totalModels: number; providers: string[] };'
  'model:recommended': { modelId: string; task: string; confidence: number };'
  'comparison:generated': { models: string[]; bestMatch: string };'
}

/**
 * Task requirements for intelligent model selection
 */
export interface TaskRequirements {
  // Task type
  task: 'coding' | 'vision' | 'reasoning' | 'writing' | 'analysis' | 'chat;
  
  // Context requirements
  contextSize?: 'small' | 'medium' | 'large' | 'xlarge;
  minContextTokens?: number;
  
  // Quality vs speed tradeoff
  priority: 'speed' | 'quality' | 'balanced' | 'cost;
  
  // Feature requirements
  needsVision?: boolean;
  needsToolCalls?: boolean;
  needsStreaming?: boolean;
  needsStructuredOutput?: boolean;
  
  // Budget constraints
  maxCostPerRequest?: number;
  
  // Provider preferences
  preferredProviders?: string[];
  excludeProviders?: string[];
  
  // Custom requirements
  customFilter?: (model: RichModelInfo) => boolean;
}

/**
 * Enhanced Model Registry with rich metadata preservation
 */
export class EnhancedModelRegistry extends TypedEventBase<EnhancedModelRegistryEvents> {

  constructor() {
    super();
    this.setupRegistryForwarding();
  }

  /**
   * Forward provider database registry events
   */
  private setupRegistryForwarding(): void {
    providerDatabaseRegistry.on('database:registered', (_data) => {'
      this.emit('database:registered', data);'
    });
    
    providerDatabaseRegistry.on('database:updated', (_data) => {'
      this.emit('database:updated', data);'
      this.indexed = false; // Force re-indexing
    });
    
    providerDatabaseRegistry.on('models:changed', (_data) => {'
      this.emit('models:changed', data);'
      this.indexed = false; // Force re-indexing
    });
  }

  /**
   * Initialize the enhanced registry
   */
  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Enhanced Model Registry...');'
    
    // Update all provider databases
    await providerDatabaseRegistry.updateAllDatabases();
    
    // Index all models
    await this.indexModels();
    
    logger.info('✅ Enhanced Model Registry initialized successfully');'
  }

  /**
   * Index all models for faster querying
   */
  private async indexModels(): Promise<void> {
    const allModels = providerDatabaseRegistry.getAllRichModels();
    const providers = [...new Set(allModels.map(m => m.provider))];
    
    this.indexed = true;
    this.indexedAt = new Date();
    
    this.emit('models:indexed', { '
      totalModels: allModels.length, 
      providers 
    });
    
    logger.info(`📊 Indexed ${allModels.length} models from ${providers.length} providers`);`
  }

  /**
   * Get all models (basic info for compatibility)
   */
  getAllModels(): BaseModelInfo[] {
    return providerDatabaseRegistry.getAllRichModels().map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
      family: m.family,
      version: m.version,
      contextWindow: m.contextWindow,
      maxTokens: m.maxTokens,
      supportsStreaming: m.supportsStreaming,
      supportsVision: m.supportsVision,
      supportsToolCalls: m.supportsToolCalls,
      available: m.available,
      lastUpdated: m.lastUpdated,
      pricing: m.pricing,
    }));
  }

  /**
   * Get all models with rich metadata
   */
  getAllRichModels(): RichModelInfo[] {
    return providerDatabaseRegistry.getAllRichModels();
  }

  /**
   * Get model by ID with rich metadata
   */
  getRichModel(modelId: string): RichModelInfo | undefined {
    return providerDatabaseRegistry.getRichModel(modelId);
  }

  /**
   * Get basic model info by ID (compatibility)
   */
  getModel(modelId: string): BaseModelInfo | undefined {
    const richModel = this.getRichModel(modelId);
    if (!richModel) return undefined;
    
    return {
      id: richModel.id,
      name: richModel.name,
      provider: richModel.provider,
      family: richModel.family,
      version: richModel.version,
      contextWindow: richModel.contextWindow,
      maxTokens: richModel.maxTokens,
      supportsStreaming: richModel.supportsStreaming,
      supportsVision: richModel.supportsVision,
      supportsToolCalls: richModel.supportsToolCalls,
      available: richModel.available,
      lastUpdated: richModel.lastUpdated,
      pricing: richModel.pricing,
    };
  }

  /**
   * Advanced model querying
   */
  queryModels(query: ModelQuery): RichModelInfo[] {
    return providerDatabaseRegistry.queryModels(query);
  }

  /**
   * Get type-safe provider-specific metadata
   */
  getProviderMetadata<P extends string>(
    modelId: string
  ): ProviderMetadata<P> | undefined {
    return providerDatabaseRegistry.getProviderMetadata<P>(modelId);
  }

  /**
   * Get GitHub Copilot specific metadata (type-safe)
   */
  getCopilotMetadata(modelId: string): GitHubCopilotModelMetadata | undefined {
    const metadata = this.getProviderMetadata<'github-copilot'>(modelId);'
    return metadata as GitHubCopilotModelMetadata | undefined;
  }

  /**
   * Get GitHub Models specific metadata (type-safe)
   */
  getGitHubModelsMetadata(modelId: string): GitHubModelMetadata | undefined {
    const metadata = this.getProviderMetadata<'github-models'>(modelId);'
    return metadata as GitHubModelMetadata | undefined;
  }

  /**
   * Intelligent model recommendation based on task requirements
   */
  async recommendModel(requirements: TaskRequirements): Promise<ModelRecommendation | undefined> {
    const allModels = this.getAllRichModels();
    
    // Apply hard requirements
    let candidates = allModels.filter(model => {
      // Context requirements
      if (requirements.minContextTokens && model.contextWindow < requirements.minContextTokens) {
        return false;
      }
      
      // Feature requirements
      if (requirements.needsVision && !model.supportsVision) return false;
      if (requirements.needsToolCalls && !model.supportsToolCalls) return false;
      if (requirements.needsStreaming && !model.supportsStreaming) return false;
      
      // Provider preferences
      if (requirements.preferredProviders?.length && 
          !requirements.preferredProviders.includes(model.provider)) return false;
      if (requirements.excludeProviders?.includes(model.provider)) return false;
      
      // Custom filter
      if (requirements.customFilter && !requirements.customFilter(model)) return false;
      
      return model.available;
    });

    if (candidates.length === 0) {
      logger.warn('No models found matching requirements');'
      return undefined;
    }

    // Score models based on task and priority
    const scoredModels = candidates.map(model => ({
      model,
      score: this.calculateModelScore(model, requirements),
    }));

    // Sort by score
    scoredModels.sort((a, b) => b.score - a.score);
    
    const bestModel = scoredModels[0];
    const alternatives = scoredModels.slice(1, 4).map(scored => ({
      modelId: scored.model.id,
      reason: this.getAlternativeReason(scored.model, requirements),
      tradeoff: this.getTradeoffAnalysis(bestModel.model, scored.model),
    }));

    const recommendation: ModelRecommendation = {
      modelId: bestModel.model.id,
      confidence: Math.min(bestModel.score / 100, 1.0),
      reasoning: this.generateReasoning(bestModel.model, requirements),
      alternatives,
    };

    this.emit('model:recommended', {'
      modelId: recommendation.modelId,
      task: requirements.task,
      confidence: recommendation.confidence,
    });

    return recommendation;
  }

  /**
   * Compare multiple models side-by-side
   */
  compareModels(modelIds: string[]): ModelComparison | undefined {
    const models = modelIds
      .map(id => this.getRichModel(id))
      .filter((m): m is RichModelInfo => m !== undefined);
      
    if (models.length === 0) {
      return undefined;
    }

    const contextWindowComparison = Object.fromEntries(
      models.map(m => [m.id, m.contextWindow])
    );
    
    const costComparison = Object.fromEntries(
      models.map(m => [m.id, m.pricing?.inputTokens || 0])
    );
    
    const featureMatrix = Object.fromEntries(
      models.map(m => [m.id, {
        vision: m.supportsVision,
        toolCalls: m.supportsToolCalls,
        streaming: m.supportsStreaming,
      }])
    );

    const comparison: ModelComparison = {
      models,
      contextWindowComparison,
      costComparison,
      featureMatrix,
      bestForTask: {
        coding: this.findBestForTask(models, 'coding'),
        vision: this.findBestForTask(models, 'vision'),
        longContext: this.findBestForContextWindow(models),
        costEffective: this.findMostCostEffective(models),
      },
    };

    this.emit('comparison:generated', {'
      models: modelIds,
      bestMatch: comparison.bestForTask.coding,
    });

    return comparison;
  }

  /**
   * Calculate model score for task requirements
   */
  private calculateModelScore(model: RichModelInfo, requirements: TaskRequirements): number {
    let score = 50; // Base score

    // Task-specific scoring
    switch (requirements.task) {
      case 'coding':'
        if (model.supportsToolCalls) score += 20;
        if (model.family?.toLowerCase().includes('gpt')) score += 15;'
        break;
      case 'vision':'
        if (model.supportsVision) score += 30;
        else score -= 50; // Heavy penalty for no vision
        break;
      case 'reasoning':'
        if (model.contextWindow > 100000) score += 20;
        if (model.family?.toLowerCase().includes('gpt-4')) score += 15;'
        break;
    }

    // Priority-based scoring
    switch (requirements.priority) {
      case 'speed':'
        if (model.family?.toLowerCase().includes('mini')) score += 15;'
        break;
      case 'quality':'
        if (model.family?.toLowerCase().includes('gpt-4')) score += 20;'
        break;
      case 'cost':'
        const cost = model.pricing?.inputTokens || 1;
        score += Math.max(0, 20 - cost * 10);
        break;
    }

    // Context size scoring
    if (requirements.contextSize) {
      const contextScore = this.getContextScore(model.contextWindow, requirements.contextSize);
      score += contextScore;
    }

    return Math.max(0, score);
  }

  /**
   * Get context score based on requirements
   */
  private getContextScore(contextWindow: number, requirement: string): number {
    switch (requirement) {
      case 'small': return contextWindow >= 4000 ? 10 : -10;'
      case 'medium': return contextWindow >= 16000 ? 15 : -5;'
      case 'large': return contextWindow >= 100000 ? 20 : -10;'
      case 'xlarge': return contextWindow >= 1000000 ? 25 : -20;'
      default: return 0;
    }
  }

  /**
   * Generate reasoning for model recommendation
   */
  private generateReasoning(model: RichModelInfo, requirements: TaskRequirements): string[] {
    const reasons: string[] = [];
    
    reasons.push(`Selected $model.namefrom $model.provider`);`
    
    if (requirements.needsVision && model.supportsVision) {
      reasons.push('Supports vision processing as required');'
    }
    
    if (requirements.needsToolCalls && model.supportsToolCalls) {
      reasons.push('Has tool calling capabilities');'
    }
    
    if (model.contextWindow > 100000) {
      reasons.push(`Large context window (${model.contextWindow.toLocaleString()} tokens)`);`
    }
    
    if (requirements.priority === 'quality' && model.family?.includes('gpt-4')) {'
      reasons.push('High-quality model optimized for complex tasks');'
    }
    
    return reasons;
  }

  /**
   * Helper methods for model comparison
   */
  private findBestForTask(models: RichModelInfo[], task: string): string {
    // Simple heuristic - in production, this would be more sophisticated
    return models[0]?.id || ';
  }

  private findBestForContextWindow(models: RichModelInfo[]): string {
    return models.sort((a, b) => b.contextWindow - a.contextWindow)[0]?.id || ';
  }

  private findMostCostEffective(models: RichModelInfo[]): string {
    return models.sort((a, b) => 
      (a.pricing?.inputTokens || 0) - (b.pricing?.inputTokens || 0)
    )[0]?.id || ';
  }

  private getAlternativeReason(model: RichModelInfo, requirements: TaskRequirements): string {
    return `Alternative with ${model.contextWindow.toLocaleString()} token context`;`
  }

  private getTradeoffAnalysis(best: RichModelInfo, alternative: RichModelInfo): string 
    if (best.contextWindow > alternative.contextWindow) {
      return 'Smaller context window but potentially faster;
    }
    return 'Different capabilities and performance characteristics;
}

/**
 * Enhanced registry singleton
 */
export const enhancedModelRegistry = new EnhancedModelRegistry();

/**
 * Create enhanced model registry service (DI-friendly)
 */
export function createEnhancedModelRegistryService(): EnhancedModelRegistry {
  return new EnhancedModelRegistry();
}