/**
 * @fileoverview GitHub Models Database Integration
 *
 * Stores GitHub Models metadata with context sizes and capabilities
 * Updates models hourly from GitHub CLI and API
 */

import { exec} from 'node:child_process';
import { promisify} from 'node:util';
import { getLogger} from '@claude-zen/foundation';
import { ok, err, Result} from '@claude-zen/foundation';

const logger = getLogger('GitHubModelsDB');
const execAsync = promisify(exec);

export interface GitHubModelMetadata {
  id:string;
  name:string;
  provider:string;
  contextWindow:number;
  maxOutputTokens:number;
  category:'low' | ' medium' | ' high' | ' embedding';
  supportsVision:boolean;
  supportsMultimodal:boolean;
  rateLimits:{
    requestsPerMinute:number;
    requestsPerDay:number;
    concurrentRequests:number;
};
  lastUpdated:Date;
}

/**
 * GitHub Models context window sizes based on documentation
 * Most models are limited to 8k/4k (input/output) on free tier
 */
const _MODEL_CONTEXT_SIZES:Record<string, Partial<GitHubModelMetadata>> = {
  // OpenAI Models - Limited context on GitHub
  'openai/gpt-4.1':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'openai/gpt-4.1-mini':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'openai/gpt-4.1-nano':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'openai/gpt-4o':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:true,
    supportsMultimodal:true,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'openai/gpt-4o-mini':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:true,
    supportsMultimodal:true,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'openai/gpt-5':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'openai/gpt-5-chat':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'openai/gpt-5-mini':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'openai/gpt-5-nano':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'openai/o1':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'openai/o1-mini':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'openai/o1-preview':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},

  // Meta Llama Models
  'meta/llama-3.2-11b-vision-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:true,
    supportsMultimodal:true,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'meta/llama-3.2-90b-vision-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:true,
    supportsMultimodal:true,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'meta/llama-3.3-70b-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'meta/llama-4-maverick-17b-128e-instruct-fp8':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'meta/llama-4-scout-17b-16e-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'meta/meta-llama-3-70b-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'meta/meta-llama-3-8b-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'meta/meta-llama-3.1-405b-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'meta/meta-llama-3.1-70b-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'meta/meta-llama-3.1-8b-instruct':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},

  // Mistral Models
  'mistral-ai/codestral-2501':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'mistral-ai/ministral-3b':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'mistral-ai/mistral-large-2407':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'mistral-ai/mistral-large-2411':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'mistral-ai/mistral-medium-2505':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'mistral-ai/mistral-nemo':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'mistral-ai/mistral-small':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'mistral-ai/mistral-small-2503':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},

  // DeepSeek Models
  'deepseek/deepseek-r1':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'deepseek/deepseek-r1-0528':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'deepseek/deepseek-v3':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'deepseek/deepseek-v3-0324':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},

  // XAI Grok Models
  'xai/grok-3':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'xai/grok-3-mini':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},

  // Cohere Models
  'cohere/cohere-command-a':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'cohere/cohere-command-r':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'cohere/cohere-command-r-08-2024':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'cohere/cohere-command-r-plus':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'cohere/cohere-command-r-plus-08-2024':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},

  // AI21 Models
  'ai21-labs/ai21-jamba-1.5-large':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
  'ai21-labs/ai21-jamba-1.5-mini':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'low',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},

  // Other Models
  'core42/jais-30b-chat':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'medium',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:15,
      requestsPerDay:150,
      concurrentRequests:5,
},
},
  'microsoft/mai-ds-r1':{
    contextWindow:8000,
    maxOutputTokens:4000,
    category: 'high',    supportsVision:false,
    supportsMultimodal:false,
    rateLimits:{
      requestsPerMinute:10,
      requestsPerDay:50,
      concurrentRequests:3,
},
},
};

class GitHubModelsDatabase {
  private models:Map<string, GitHubModelMetadata> = new Map();
  private lastUpdate:Date = new Date(0);
  private updateInterval:NodeJS.Timeout | null = null;

  /**
   * Initialize the database and start hourly updates
   */
  async initialize():Promise<void> {
    logger.info(' Initializing GitHub Models Database');

    // Load initial models
    await this.updateModels();

    // Set up hourly updates
    this['updateInterval'] = setInterval(
      () => {
        this.updateModels().catch((error) => {
          logger.error('❌ Failed to update models: ', error);
        });
},
      60 * 60 * 1000
    ); // 1 hour

    logger.info(
      ` GitHub Models Database initialized with ${this.models.size} models`
    );
}

  /**
   * Update models from GitHub CLI and API
   */
  async updateModels():Promise<Result<void, Error>> {
    try {
      logger.info('🔄 Updating GitHub Models from CLI...');

      // Get models from GitHub CLI
      const { stdout} = await execAsync('gh models list');
      const lines = stdout.trim().split('\n');

      const updatedModels = new Map<string, GitHubModelMetadata>();

      for (const line of lines) {
        const [id, name] = line.split('\t');
        if (!id || !name) continue;

        const provider = id.split('/')[0] || ' unknown';
        const metadata = _MODEL_CONTEXT_SIZES[id];

        const model:GitHubModelMetadata = {
          id,
          name,
          provider,
          contextWindow:metadata?.contextWindow || 8000, // GitHub default is 8k
          maxOutputTokens:metadata?.maxOutputTokens || 4000, // GitHub default is 4k
          category:metadata?.category || 'medium',          supportsVision:metadata?.supportsVision || false,
          supportsMultimodal:metadata?.supportsMultimodal || false,
          rateLimits:metadata?.rateLimits || {
            requestsPerMinute:15,
            requestsPerDay:150,
            concurrentRequests:5,
},
          lastUpdated:new Date(),
};

        updatedModels.set(id, model);
}

      this['models'] = updatedModels;
      this['lastUpdate'] = new Date();

      logger.info(` Updated ${this.models.size} GitHub Models`);
      logger.info(` Models by provider:${this.getProviderStats()}`);

      return ok(void 0);
} catch (error) {
      logger.error('❌ Failed to update GitHub Models: ', error);
      return err(
        error instanceof Error ? error:new Error('Failed to update models')
      );
}
}

  /**
   * Get all models
   */
  getAllModels():GitHubModelMetadata[] {
    return Array.from(this.models.values());
}

  /**
   * Get model by ID
   */
  getModel(id:string): GitHubModelMetadata | undefined {
    return this.models.get(id);
}

  /**
   * Get models by provider
   */
  getModelsByProvider(provider:string): GitHubModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model['provider'] === provider
    );
}

  /**
   * Get models by category
   */
  getModelsByCategory(
    category:'low' | 'medium' | 'high' | 'embedding'
  ):GitHubModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model['category'] === category
    );
}

  /**
   * Get models with multimodal support
   */
  getMultimodalModels():GitHubModelMetadata[] {
    return Array.from(this.models.values()).filter(
      (model) => model.supportsMultimodal
    );
}

  /**
   * Get provider statistics
   */
  getProviderStats():string {
    const stats = new Map<string, number>();
    for (const model of this.models.values()) {
      stats.set(model.provider, (stats.get(model.provider) || 0) + 1);
}
    return Array.from(stats.entries())
      .map(([provider, count]) => `${provider}:${count}`)
      .join(',    ');
}

  /**
   * Get database statistics
   */
  getStats() {
    const total = this.models.size;
    const byCategory = {
      low:this.getModelsByCategory('low').length,
      medium:this.getModelsByCategory('medium').length,
      high:this.getModelsByCategory('high').length,
      embedding:this.getModelsByCategory('embedding').length,
};
    const multimodal = this.getMultimodalModels().length;

    return {
      total,
      byCategory,
      multimodal,
      lastUpdate:this.lastUpdate,
      providers:Array.from(
        new Set(Array.from(this.models.values()).map((m) => m.provider))
      ),
};
}

  /**
   * Cleanup
   */
  destroy():void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this['updateInterval'] = null;
}
}
}

// Singleton instance
export const githubModelsDB = new GitHubModelsDatabase();

/**
 * Initialize GitHub Models database with hourly updates
 */
export async function initializeGitHubModelsDB():Promise<void> {
  await githubModelsDB.initialize();
}

/**
 * Get GitHub Models database instance
 */
export function getGitHubModelsDB():GitHubModelsDatabase {
  return githubModelsDB;
}
