/**
 * @fileoverview GitHub Models API Integration
 *
 * GitHub Models API provides access to various AI models hosted by GitHub.
 * This is REAL API access, not just command suggestions.
 *
 * AVAILABLE NOW: https://docs.github.com/en/github-models
 *
 * @example Basic Usage
 * ```typescript
 * const github = new GitHubModelsAPI({
 *   token: process.env['GITHUB_TOKEN'],
 *   model: 'gpt-4o'  // GitHub hosts multiple models
 * })
 *
 * const response = await github.execute({
 *   messages: [{ role: 'user', content: 'Create a React authentication system' }]
 * })
 * ```
 */

import { getLogger, ok, err } from '@claude-zen/foundation';

import type {
  APIProvider,
  APIRequest,
  APIResult,
  APIProviderCapabilities,
} from '../types/api-providers';
import { API_ERROR_CODES } from '../types/api-providers';

import { initializeGitHubModelsDB, githubModelsDB } from './github-models-db';

const logger = getLogger('GitHubModelsAPI');

export interface GitHubModelsOptions {
  token: string;
  model?:
    | 'openai/gpt-4.1'
    | 'openai/gpt-4o'
    | 'openai/gpt-5'
    | 'openai/o1'
    | 'meta/llama-3.3-70b-instruct'
    | 'mistral-ai/mistral-large-2411'
    | 'deepseek/deepseek-r1'
    | 'xai/grok-3';
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * GitHub Models API Provider - Real agentic development
 *
 * Uses GitHub's hosted AI models for development tasks.
 * Perfect for code generation, architecture design, and development planning.
 */
export class GitHubModelsAPI implements APIProvider {
  readonly id = 'github-models-api';
  readonly name = 'GitHub Models API';
  readonly type = 'api' as const;

  private options: Required<GitHubModelsOptions>;

  constructor(options: GitHubModelsOptions) {
    this['options'] = {
      model: 'openai/gpt-4.1',
      baseURL: 'https://models.github.ai',
      maxTokens: 4000, // GitHub Models limit: 4k output tokens
      temperature: 0.7,
      ...options,
    };

    // Initialize database on first use
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await initializeGitHubModelsDB();
    } catch (error) {
      logger.warn('Failed to initialize GitHub Models database:', error);
    }
  }

  /**
   * Execute development task using GitHub Models API
   */
  async execute(request: APIRequest): Promise<APIResult> {
    try {
      logger.info(
        `Executing GitHub Models API request with model: ${this.options.model}`
      );

      const response = await fetch(
        `${this.options.baseURL}/inference/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.options.token}`,
          },
          body: JSON.stringify({
            model: this.options.model,
            messages: request.messages,
            max_tokens: this.options.maxTokens,
            temperature: this.options.temperature,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitHub Models API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return ok({
        content,
        metadata: {
          model: this.options.model,
          provider: 'github-models',
          tokens: data.usage?.total_tokens,
          executionTime: Date.now(),
        },
      });
    } catch (error) {
      logger.error('GitHub Models API execution failed:', error);
      return err({
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: error instanceof Error ? error['message'] : 'Unknown error',
        details: {
          provider: 'github-models',
          executionTime: Date.now(),
        },
        ...(error instanceof Error && { cause: error }),
      });
    }
  }

  /**
   * Get detailed model information from catalog
   */
  async getModelDetails(modelId?: string) {
    try {
      const catalogEndpoint = 'https://models.github.ai/catalog/models';
      const response = await fetch(catalogEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.options.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (response.ok) {
        const models = await response.json();
        
        if (modelId) {
          // Return specific model details
          const model = models.find((m: any) => m.id === modelId);
          return model || null;
        }
        
        // Return all model details with context sizes and limits
        return models.map((model: any) => ({
          id: model.id,
          name: model.name,
          publisher: model.publisher,
          summary: model.summary,
          maxInputTokens: model.limits?.max_input_tokens || 0,
          maxOutputTokens: model.limits?.max_output_tokens || 0,
          rateLimitTier: model.rate_limit_tier,
          supportedInputModalities: model.supported_input_modalities || [],
          supportedOutputModalities: model.supported_output_modalities || [],
          capabilities: model.capabilities || [],
          tags: model.tags || [],
          version: model.version,
          htmlUrl: model.html_url,
        }));
      }
    } catch (error) {
      logger.error('Failed to get model details from catalog:', error);
    }
    return null;
  }

  /**
   * Get provider capabilities based on real catalog data
   */
  async getCapabilities(): Promise<APIProviderCapabilities> {
    try {
      const modelDetails = await this.getModelDetails();
      
      if (modelDetails && Array.isArray(modelDetails)) {
        const hasStreaming = modelDetails.some((m: any) => m.capabilities?.includes('streaming'));
        const hasMultimodal = modelDetails.some((m: any) => m.supportedInputModalities?.includes('image'));
        const hasReasoning = modelDetails.some((m: any) => m.capabilities?.includes('reasoning'));
        const hasToolCalling = modelDetails.some((m: any) => m.capabilities?.includes('tool-calling'));
        
        const maxInputTokens = Math.max(...modelDetails.map((m: any) => m.maxInputTokens || 0));
        const maxOutputTokens = Math.max(...modelDetails.map((m: any) => m.maxOutputTokens || 0));
        
        return {
          features: {
            streaming: hasStreaming,
            multimodal: hasMultimodal,
            reasoning: hasReasoning,
            coding: true, // Many models support coding
            planning: true, // Most models support planning
            imageGeneration: false, // No image generation
            webAccess: false, // No web browsing
            customTools: hasToolCalling,
          },
          models: modelDetails.map((m: any) => m.id),
          maxTokens: maxOutputTokens,
          contextWindow: maxInputTokens,
          pricing: {
            inputTokens: 0.00025, // Approximate, varies by model
            outputTokens: 0.001, // Approximate, varies by model
            currency: 'USD',
          },
        };
      }
    } catch (error) {
      logger.error('Failed to get capabilities from catalog:', error);
    }

    // Fallback to basic capabilities
    const models = githubModelsDB.getAllModels();
    const hasMultimodal = models.some((m) => m.supportsMultimodal);

    return {
      features: {
        streaming: false,
        multimodal: hasMultimodal,
        reasoning: true,
        coding: true,
        planning: true,
        imageGeneration: false,
        webAccess: false,
        customTools: false,
      },
      models: models.map((m) => m.id),
      maxTokens: 4000,
      contextWindow: 8000,
      pricing: {
        inputTokens: 0.00025,
        outputTokens: 0.001,
        currency: 'USD',
      },
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: 0,
      lastRequestTime: Date.now(),
    };
  }

  /**
   * List available models from GitHub Models API (real-time)
   */
  async listModels(): Promise<string[]> {
    try {
      // Use the correct GitHub Models catalog endpoint
      const catalogEndpoint = 'https://models.github.ai/catalog/models';
      
      logger.info(`🔍 Calling GitHub Models catalog: ${catalogEndpoint}`);
      const response = await fetch(catalogEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.options.token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (response.ok) {
        const models = await response.json();
        
        if (Array.isArray(models) && models.length > 0) {
          // Extract model IDs from catalog response
          const modelIds = models
            .map(model => model.id || model.name)
            .filter(Boolean);

          logger.info(`📋 GitHub Models from catalog API: ${modelIds.length} models`);
          logger.info(`🎯 First few models: ${modelIds.slice(0, 5).join(', ')}${modelIds.length > 5 ? '...' : ''}`);
          
          return modelIds;
        }
      } else {
        logger.warn(`GitHub Models catalog returned ${response.status}: ${response.statusText}`);
      }

      // Try legacy endpoints as fallback
      const legacyEndpoints = [
        `${this.options.baseURL}/models`,
        `${this.options.baseURL}/inference/models`
      ];

      for (const endpoint of legacyEndpoints) {
        try {
          logger.info(`🔍 Trying fallback endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${this.options.token}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
            },
          });

          if (response.ok) {
            const data = await response.json();
            let modelIds: string[] = [];

            if (Array.isArray(data)) {
              modelIds = data.map(model => model.id || model.name).filter(Boolean);
            } else if (data.data && Array.isArray(data.data)) {
              modelIds = data.data.map(model => model.id || model.name).filter(Boolean);
            }

            if (modelIds.length > 0) {
              logger.info(`📋 GitHub Models from fallback (${endpoint}): ${modelIds.length} models`);
              return modelIds;
            }
          }
        } catch (endpointError) {
          logger.warn(`Failed to fetch from ${endpoint}:`, endpointError);
          continue;
        }
      }

      // Final database fallback
      logger.info('📋 Falling back to database for GitHub Models...');
      const models = githubModelsDB.getAllModels();
      if (models.length > 0) {
        const modelIds = models.map((m) => m.id);
        logger.info(`📋 GitHub Models from database: ${modelIds.length} models`);
        return modelIds;
      }
    } catch (error) {
      logger.error('Failed to list GitHub Models from all sources:', error);
    }

    // Known working models from successful API tests (final fallback)
    const workingModels = [
      'openai/gpt-4.1',
      'openai/gpt-4o', 
      'openai/gpt-4o-mini',
      'openai/o1',
      'meta/llama-3.3-70b-instruct',
      'mistral-ai/mistral-large-2411',
      'deepseek/deepseek-r1',
    ];

    logger.info(`📋 Using known working models (final fallback): ${workingModels.length} models`);
    return workingModels;
  }

  /**
   * Health check for the provider
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Health check with auth for GitHub Models
      const response = await fetch(`${this.options.baseURL}/inference/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.options.token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create GitHub Models API provider instance
 */
export function createGitHubModelsProvider(
  options: GitHubModelsOptions
): GitHubModelsAPI {
  return new GitHubModelsAPI(options);
}

/**
 * Execute task with GitHub Models API
 */
export async function executeGitHubModelsTask(
  prompt: string,
  options: GitHubModelsOptions
): Promise<string> {
  const provider = createGitHubModelsProvider(options);
  const response = await provider.execute({
    messages: [{ role: 'user', content: prompt }],
  });

  if (response.isErr()) {
    throw new Error(`GitHub Models task failed: ${response.error.message}`);
  }

  return response.value.content;
}

/**
 * GitHub Models API configuration and metadata
 */
export const gitHubModelsConfig = {
  name: 'GitHub Models API',
  description: 'Access to GitHub Models marketplace - various AI models',
  version: '1.0.0',
  capabilities: {
    conversational: true,
    multimodal: true,
    reasoning: true,
    coding: true,
    planning: true,
  },
  authentication: {
    type: 'bearer-token',
    tokenFormat: 'ghp_xxx (Personal Access Token)',
    scopes: ['models'],
    requiredHeaders: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },
  endpoints: {
    chat: 'https://models.github.ai/inference/chat/completions',
    models: 'https://models.github.ai/models',
  },
  modelFormat:
    'provider/model-name (e.g., openai/gpt-4.1, anthropic/claude-3-5-sonnet)',
};
