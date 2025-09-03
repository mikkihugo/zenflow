/**
 * Model Registry - Centralized model information and routing
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('model-registry');

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'github-copilot' | 'github-models' | 'claude' | 'gemini';
  type: 'chat' | 'completion' | 'embedding';
  capabilities: string[];
  limits?: {
    max_tokens?: number;
    context_window?: number;
  };
}

export class ModelRegistry {
  private models: Map<string, ModelInfo> = new Map();
  private initialized = false;

  constructor() {
    this.registerBuiltinModels();
  }

  /**
   * Register built-in model definitions
   */
  private registerBuiltinModels(): void {
    // GitHub Copilot Models
    this.registerModel({
      id: 'github-copilot/gpt-4o',
      name: 'GPT-4o (GitHub Copilot)',
      provider: 'github-copilot',
      type: 'chat',
      capabilities: ['chat', 'code', 'multimodal'],
      limits: { max_tokens: 4096, context_window: 128000 }
    });

    // GitHub Models
    this.registerModel({
      id: 'openai/gpt-4.1',
      name: 'OpenAI GPT-4.1',
      provider: 'github-models',
      type: 'chat',
      capabilities: ['chat', 'reasoning', 'multimodal'],
      limits: { max_tokens: 32768, context_window: 1048576 }
    });

    this.registerModel({
      id: 'openai/gpt-5',
      name: 'OpenAI GPT-5',
      provider: 'github-models',
      type: 'chat',
      capabilities: ['reasoning', 'logic', 'multimodal'],
      limits: { max_tokens: 100000, context_window: 200000 }
    });

    // Claude Models
    this.registerModel({
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      provider: 'claude',
      type: 'chat',
      capabilities: ['chat', 'reasoning', 'code', 'analysis'],
      limits: { max_tokens: 8192, context_window: 200000 }
    });

    // Gemini Models  
    this.registerModel({
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash Experimental',
      provider: 'gemini',
      type: 'chat',
      capabilities: ['chat', 'multimodal', 'code'],
      limits: { max_tokens: 8192, context_window: 1000000 }
    });

    logger.info(`Registered ${this.models.size} built-in models`);
  }

  /**
   * Register a new model
   */
  registerModel(model: ModelInfo): void {
    this.models.set(model.id, model);
    logger.debug(`Registered model: ${model.id} (${model.provider})`);
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): ModelInfo | undefined {
    return this.models.get(modelId);
  }

  /**
   * Get all models for a provider
   */
  getModelsByProvider(provider: string): ModelInfo[] {
    return Array.from(this.models.values())
      .filter(model => model.provider === provider);
  }

  /**
   * Get all models
   */
  getAllModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }

  /**
   * Find the appropriate provider for a model
   */
  getProviderForModel(modelId: string): string | undefined {
    const model = this.getModel(modelId);
    return model?.provider;
  }

  /**
   * Check if a model supports a capability
   */
  modelSupports(modelId: string, capability: string): boolean {
    const model = this.getModel(modelId);
    return model?.capabilities.includes(capability) ?? false;
  }

  /**
   * Get models by capability
   */
  getModelsByCapability(capability: string): ModelInfo[] {
    return Array.from(this.models.values())
      .filter(model => model.capabilities.includes(capability));
  }

  async execute(): Promise<void> {
    if (!this.initialized) {
      this.initialized = true;
      logger.info('Model registry initialized');
    }
  }
}
