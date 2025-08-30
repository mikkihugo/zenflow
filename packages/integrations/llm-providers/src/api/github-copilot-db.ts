/**
 * @fileoverview GitHub Copilot Models Database Integration
 *
 * Stores GitHub Copilot model metadata with real context sizes and capabilities
 * Updates models hourly from GitHub Copilot API
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { err, ok, Result } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('GitHubCopilotDB');

export interface GitHubCopilotModelMetadata {
  id: string;
  name: string;
  vendor: string;
  family: string;
  version: string;
  contextWindow: number;
  maxOutputTokens: number;
  maxPromptTokens: number;
  category: 'versatile' | ' lightweight' | ' powerful';
  supportsVision: boolean;
  supportsToolCalls: boolean;
  supportsStreaming: boolean;
  supportsParallelToolCalls: boolean;
  supportsStructuredOutputs: boolean;
  modelPickerEnabled: boolean;
  preview: boolean;
  tokenizer: string;
  type: 'chat' | ' embeddings';
  visionLimits?: {
    maxImageSize: number;
    maxImages: number;
    supportedFormats: string[];
  };
  thinkingBudget?: {
    min: number;
    max: number;
  };
  lastUpdated: Date;
}

/**
 * Load GitHub Copilot OAuth token from config file
 */
function loadCopilotToken(): string {
  try {
    const configPath = path.join(
      os.homedir(),
      '.claude-zen',
      'copilot-token.json'
    );
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.access_token;
    }
  } catch (error) {
    logger.warn('Failed to load Copilot OAuth token from config: ', error);
  }

  return process.env['GITHUB_COPILOT_TOKEN'] || '';
}

class GitHubCopilotDatabase {
  private models: Map<string, GitHubCopilotModelMetadata> = new Map();
  private token: string;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastUpdate: Date = new Date();

  constructor() {
    this['token'] = loadCopilotToken();
  }

  /**
   * Initialize the database and start hourly updates
   */
  async initialize(): Promise<void> {
    logger.info(' Initializing GitHub Copilot Models Database');

    if (!this.token) {
      logger.warn(
        '⚠️ No GitHub Copilot token available, skipping model updates'
      );
      return;
    }

    // Load initial models
    await this.updateModels();

    // Set up hourly updates
    this['updateInterval'] = setInterval(
      () => {
        this.updateModels().catch((error) => {
          logger.error('❌ Failed to update Copilot models: ', error);
        });
      },
      60 * 60 * 1000
    ); // 1 hour

    logger.info(
      ` GitHub Copilot Models Database initialized with ${this.models.size} models`
    );
  }

  /**
   * Update models from GitHub Copilot API
   */
  async updateModels(): Promise<Result<void, Error>> {
    try {
      if (!this.token) {
        return err(new Error('No GitHub Copilot token available'));
      }

      logger.info('🔄 Updating GitHub Copilot Models from API...');

      const response = await this.fetchModelsFromAPI();
      if (response.isErr()) {
        return response;
      }

      const data = response.value;
      const updatedModels = this.processModelsData(data);

      this.updateInternalState(updatedModels);
      this.logUpdateResults();

      return ok(void 0);
    } catch (error) {
      logger.error('❌ Failed to update GitHub Copilot Models: ', error);
      return err(
        error instanceof Error ? error : new Error('Failed to update models')
      );
    }
  }

  /**
   * Fetch models data from GitHub Copilot API
   */
  private async fetchModelsFromAPI(): Promise<Result<unknown, Error>> {
    const response = await fetch('https://api.githubcopilot.com/models', {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Copilot-Integration-Id': ' vscode-chat',
      },
    });

    if (!response.ok) {
      return err(
        new Error(
          `API request failed:${response.status} ${response.statusText}`
        )
      );
    }

    const data = await response.json();
    return ok(data);
  }

  /**
   * Process raw models data into structured metadata
   */
  private processModelsData(data: unknown): Map<string, GitHubCopilotModelMetadata> {
    const updatedModels = new Map<string, GitHubCopilotModelMetadata>();
    const dataArray = (data as { data?: unknown[] })['data'] || [];

    for (const modelData of dataArray) {
      const model = this.createModelMetadata(modelData);
      updatedModels.set(model.id, model);
    }

    return updatedModels;
  }

  /**
   * Create model metadata from raw model data
   */
  private createModelMetadata(modelData: Record<string, unknown>): GitHubCopilotModelMetadata {
    const { capabilities = {} } = modelData;
    const capabilitiesTyped = capabilities as Record<string, unknown>;
    const { limits = {}, supports = {} } = capabilitiesTyped;
    const limitsTyped = limits as Record<string, unknown>;
    const supportsTyped = supports as Record<string, unknown>;
    const { vision } = limitsTyped;

    const model: GitHubCopilotModelMetadata = {
      id: modelData.id as string,
      name: modelData.name as string,
      vendor: (modelData['vendor'] as string) || ' Unknown',
      family: (capabilitiesTyped?.family as string) || 'unknown',
      version: (modelData['version'] as string) || (modelData.id as string),
      contextWindow: (limitsTyped['max_context_window_tokens'] as number) || 128000,
      maxOutputTokens: (limitsTyped['max_output_tokens'] as number) || 4096,
      maxPromptTokens: (limitsTyped['max_prompt_tokens'] as number) || 128000,
      category: (modelData['model_picker_category'] as string) || ' versatile',
      supportsVision: !!vision,
      supportsToolCalls: !!supportsTyped.tool_calls,
      supportsStreaming: !!supportsTyped.streaming,
      supportsParallelToolCalls: !!supportsTyped.parallel_tool_calls,
      supportsStructuredOutputs: !!supportsTyped.structured_outputs,
      modelPickerEnabled: !!modelData.model_picker_enabled,
      preview: !!modelData.preview,
      tokenizer: (capabilitiesTyped?.tokenizer as string) || 'unknown',
      type: (capabilitiesTyped?.type as string) || 'chat',
      lastUpdated: new Date(),
    };

    this.addVisionLimits(model, vision as Record<string, unknown>);
    this.addThinkingBudget(model, supportsTyped);

    return model;
  }

  /**
   * Add vision limits if available
   */
  private addVisionLimits(model: GitHubCopilotModelMetadata, vision: Record<string, unknown>): void {
    if (vision) {
      model['visionLimits'] = {
        maxImageSize: (vision['max_prompt_image_size'] as number) || 0,
        maxImages: (vision['max_prompt_images'] as number) || 0,
        supportedFormats: (vision['supported_media_types'] as string[]) || [],
      };
    }
  }

  /**
   * Add thinking budget if available
   */
  private addThinkingBudget(model: GitHubCopilotModelMetadata, supports: Record<string, unknown>): void {
    if (supports['max_thinking_budget'] || supports.min_thinking_budget) {
      model['thinkingBudget'] = {
        min: (supports['min_thinking_budget'] as number) || 0,
        max: (supports['max_thinking_budget'] as number) || 0,
      };
    }
  }

  /**
   * Update internal state with new models
   */
  private updateInternalState(updatedModels: Map<string, GitHubCopilotModelMetadata>): void {
    this['models'] = updatedModels;
    this['lastUpdate'] = new Date();
  }

  /**
   * Log update results
   */
  private logUpdateResults(): void {
    logger.info(` Updated ${this.models.size} GitHub Copilot Models`);
    logger.info(` Models by vendor:${this.getVendorStats()}`);
    logger.info(
      `🎯 Primary models:${this.getPrimaryModels()
        .map((m) => m.id)
        .join(',    ')}`
    );
  }

  /**
   * Get all models
   */
  getAllModels(): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values());
  }

  /**
   * Get model by ID
   */
  getModel(id: string): GitHubCopilotModelMetadata | undefined {
    return this.models.get(id);
  }

  /**
   * Get models by vendor
   */
  getModelsByVendor(vendor: string): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values()).filter((model) =>
      model.vendor.toLowerCase().includes(vendor.toLowerCase())
    );
  }

  /**
   * Get models by category
   */
  getModelsByCategory(
    category: 'versatile' | ' lightweight' | ' powerful'
  ): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model['category'] === category
    );
  }

  /**
   * Get primary models (enabled in model picker)
   */
  getPrimaryModels(): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model.modelPickerEnabled
    );
  }

  /**
   * Get models with vision support
   */
  getVisionModels(): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model.supportsVision
    );
  }

  /**
   * Get chat models only
   */
  getChatModels(): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model['type'] === ' chat'
    );
  }

  /**
   * Get embedding models only
   */
  getEmbeddingModels(): GitHubCopilotModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model['type'] === 'embeddings'
    );
  }

  /**
   * Get vendor statistics
   */
  getVendorStats(): string {
    const stats = new Map<string, number>();
    for (const model of this.models.values()) {
      stats.set(model.vendor, (stats.get(model.vendor) || 0) + 1);
    }
    return Array.from(stats.entries())
      .map(([vendor, count]) => `${vendor}:${count}`)
      .join(',    ');
  }

  /**
   * Get context window analysis
   */
  getContextAnalysis() {
    const analysis = new Map<number, number>();
    for (const model of this.models.values()) {
      if (model['type'] === ' chat') {
        analysis.set(
          model.contextWindow,
          (analysis.get(model.contextWindow) || 0) + 1
        );
      }
    }
    return Array.from(analysis.entries()).sort(([a], [b]) => b - a);
  }

  /**
   * Get database statistics
   */
  getStats() {
    const total = this.models.size;
    const chatModels = this.getChatModels();
    const embeddingModels = this.getEmbeddingModels();
    const visionModels = this.getVisionModels();
    const primaryModels = this.getPrimaryModels();

    const byCategory = {
      versatile: this.getModelsByCategory('versatile').length,
      lightweight: this.getModelsByCategory('lightweight').length,
      powerful: this.getModelsByCategory('powerful').length,
    };

    return {
      total,
      chat: chatModels.length,
      embeddings: embeddingModels.length,
      vision: visionModels.length,
      primary: primaryModels.length,
      byCategory,
      lastUpdate: this.lastUpdate,
      vendors: Array.from(
        new Set(Array.from(this.models.values()).map((m) => m.vendor))
      ),
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this['updateInterval'] = null;
    }
  }
}

// Singleton instance
export const githubCopilotDB = new GitHubCopilotDatabase();

/**
 * Initialize GitHub Copilot Models database with hourly updates
 */
export async function initializeGitHubCopilotDB(): Promise<void> {
  await githubCopilotDB.initialize();
}

/**
 * Get GitHub Copilot Models database instance
 */
export function getGitHubCopilotDB(): GitHubCopilotDatabase {
  return githubCopilotDB;
}
