/**
 * @fileoverview GitHub Copilot Chat API Integration
 *
 * GitHub Copilot Chat API provides access to GitHub's Copilot AI models.
 *
 * IMPORTANT: This is DIFFERENT from GitHub Models API:
 * - GitHub Models API: Uses PAT tokens (ghp_xxx) at models.inference.ai.azure.com
 * - GitHub Copilot API: Uses OAuth tokens (gho_xxx) at api.githubcopilot.com
 *
 * References:
 * - https://aider.chat/docs/llms/github.html
 * - https://dev.to/ericc/i-turned-github-copilot-into-openai-api-compatible-provider-1fb8
 *
 * AUTHENTICATION:
 * - Uses GitHub OAuth tokens (gho_xxx format) - NOT Personal Access Tokens
 * - Requires VSCode-style authentication flow with GitHub Copilot subscription
 * - DIFFERENT from GitHub Models API (which uses PAT tokens)
 * - REQUIRED HEADER: Copilot-Integration-Id: vscode-chat
 *
 * @example Basic Usage
 * ```typescript
 * // IMPORTANT: Requires GitHub Copilot OAuth token (gho_xxx), not PAT (ghp_xxx)
 * const copilot = new GitHubCopilotAPI({
 *   token: process.env.GITHUB_COPILOT_TOKEN,  // Must be gho_xxx OAuth token
 *   model: 'gpt-4'
 * });
 *
 * // Automatically includes required Copilot-Integration-Id: vscode-chat header
 * const response = await copilot.execute({
 *   messages: [{ role: 'user', content: 'Write a React component for user authentication' }]
 * });
 * ```
 *
 * @example Token Setup
 * ```bash
 * # Save OAuth token to config file:
 * echo '{"access_token": "gho_your_oauth_token_here"}' > ~/.claude-zen/copilot-token.json
 *
 * # Or set environment variable:
 * export GITHUB_COPILOT_TOKEN=gho_your_oauth_token_here
 * ```
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { ok, err } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation/logging';

import type {
  APIProvider,
  APIRequest,
  APIResult,
  APIProviderCapabilities,
} from '../types/api-providers';
import { API_ERROR_CODES } from '../types/api-providers';

import {
  githubCopilotDB,
  initializeGitHubCopilotDB,
} from './github-copilot-db';

const logger = getLogger('GitHubCopilotAPI');

/**
 * Load GitHub Copilot OAuth token from config file
 *
 * NOTE: GitHub Copilot requires OAuth tokens (gho_xxx), NOT Personal Access Tokens
 * This is different from GitHub Models API which uses regular PAT tokens
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
      logger.info(
        '✅ Loaded GitHub Copilot OAuth token from ~/.claude-zen/copilot-token.json'
      );
      return config.access_token;
    }
  } catch (error) {
    logger.warn('Failed to load Copilot OAuth token from config:', error);
  }

  // Fallback to environment variables (should be OAuth token, not PAT)
  const token = process.env.GITHUB_COPILOT_TOKEN'' | '''' | '''';
  if (token && !token.startsWith('gho_')) {
    logger.warn(
      '⚠️ Token may not be a valid GitHub Copilot OAuth token. Expected format: gho_xxx'
    );
  }
  return token;
}

export interface GitHubCopilotOptions {
  token: string;
  model?: string; // Dynamic based on available models from API
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * GitHub Copilot Chat API Provider - Real conversational AI
 *
 * Uses GitHub's Copilot models for development conversations.
 * Best for code completion, debugging, and development assistance.
 */
export class GitHubCopilotAPI implements APIProvider {
  readonly id = 'github-copilot-api';
  readonly name = 'GitHub Copilot Chat API';
  readonly type = 'api' as const;

  private options: Required<GitHubCopilotOptions>;

  constructor(options: GitHubCopilotOptions) {
    this.options = {
      model: 'gpt-4.1', // Updated default to gpt-4.1 (primary model)
      baseURL: 'https://api.githubcopilot.com',
      maxTokens: 16384, // Updated to realistic Copilot limits
      temperature: 0.7,
      stream: false,
      ...options,
    };

    // Initialize database on first use
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await initializeGitHubCopilotDB();
    } catch (error) {
      logger.warn('Failed to initialize GitHub Copilot database:', error);
    }
  }

  /**
   * Execute chat request using GitHub Copilot API
   */
  async execute(request: APIRequest): Promise<APIResult> {
    try {
      logger.info(
        `Executing GitHub Copilot API request with model: ${this.options.model}`
      );

      const response = await fetch(`${this.options.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          'Content-Type': 'application/json',
          'Copilot-Integration-Id': 'vscode-chat',
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: request.messages,
          max_tokens: this.options.maxTokens,
          temperature: this.options.temperature,
          stream: this.options.stream,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          `GitHub Copilot API error: ${response.status} ${response.statusText} - ${errorText}`
        );

        return err({
          code: API_ERROR_CODES.MODEL_ERROR,
          message: `GitHub Copilot API error: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          },
        });
      }

      const data = await response.json();
      const content =
        data.choices?.[0]?.message?.content'' | '''' | '''No response content';

      logger.info(
        `GitHub Copilot API response received: ${content.length} characters`
      );

      return ok({
        success: true,
        content,
        metadata: {
          provider: this.id,
          model: this.options.model,
          tokens: data.usage?.total_tokens,
          finishReason: data.choices?.[0]?.finish_reason,
          copilotRequestId: response.headers.get('x-request-id'),
        },
      });
    } catch (error) {
      logger.error('GitHub Copilot API execution failed:', error);

      return err({
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: `GitHub Copilot API network error: ${error}`,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): APIProviderCapabilities {
    const models = githubCopilotDB.getAllModels();
    const chatModels = models.filter((m) => m.type === 'chat');
    const hasVision = models.some((m) => m.supportsVision);
    const maxContext = Math.max(
      ...chatModels.map((m) => m.contextWindow),
      128000
    );
    const maxOutput = Math.max(
      ...chatModels.map((m) => m.maxOutputTokens),
      16384
    );

    return {
      models: chatModels.map((m) => m.id),
      maxTokens: maxOutput,
      contextWindow: maxContext,
      features: {
        streaming: true, // Copilot supports streaming
        multimodal: hasVision, // Based on available models
        reasoning: true, // Excellent reasoning (o3, Claude, etc.)
        coding: true, // Excellent for coding
        planning: true, // Good for planning
        imageGeneration: false, // No image generation
        webAccess: false, // No web access
        customTools: true, // Supports tool calls
      },
      pricing: {
        inputTokens: 0.003, // GitHub Copilot pricing (approximate)
        outputTokens: 0.006, // GitHub Copilot pricing (approximate)
        currency: 'USD',
      },
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: 0, // Would track in real implementation
      lastRequestTime: Date.now(),
    };
  }

  /**
   * List available models from GitHub Copilot database (updated hourly)
   */
  async listModels(): Promise<string[]> {
    try {
      // Get models from database (updated hourly from Copilot API)
      const models = githubCopilotDB.getChatModels(); // Only chat models for conversations

      if (models.length === 0) {
        logger.warn('📋 No models in database, forcing update...');
        await githubCopilotDB.updateModels();
        const updatedModels = githubCopilotDB.getChatModels();
        return updatedModels.map((m) => m.id);
      }

      const modelIds = models.map((m) => m.id);
      const stats = githubCopilotDB.getStats();
      const primaryModels = githubCopilotDB.getPrimaryModels();

      logger.info(
        `📋 GitHub Copilot models from database: ${modelIds.length} chat models`
      );
      logger.info(
        `🎯 Primary models: ${primaryModels.map((m) => m.id).join(', ')}`
      );
      logger.info(`🖼️ Vision models: ${stats.vision}`);
      logger.info(
        `📊 By category: versatile:${stats.byCategory.versatile}, lightweight:${stats.byCategory.lightweight}, powerful:${stats.byCategory.powerful}`
      );
      logger.info(`🔄 Last updated: ${stats.lastUpdate.toISOString()}`);

      return modelIds;
    } catch (error) {
      logger.error(
        'Failed to list GitHub Copilot models from database:',
        error
      );

      // Emergency fallback with real context sizes
      const emergencyModels = [
        'gpt-4.1', // 128k context, 16k output, vision
        'gpt-5', // 128k context, 64k output, vision
        'claude-sonnet-4', // 128k context, 16k output, vision
        'claude-3.7-sonnet', // 200k context, 16k output, vision
        'o3-mini', // 200k context, 100k output
        'o4-mini', // 128k context, 16k output, vision
        'gemini-2.5-pro', // 128k context, 64k output, vision
      ];

      logger.info(
        `📋 Using emergency fallback: ${emergencyModels.length} models (high limits)`
      );
      return emergencyModels;
    }
  }

  /**
   * Health check for the provider
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.options.baseURL}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          'Copilot-Integration-Id': 'vscode-chat',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create GitHub Copilot provider instance
 */
export function createGitHubCopilotProvider(
  options?: Partial<GitHubCopilotOptions>
): GitHubCopilotAPI {
  const token = loadCopilotToken();

  const defaultOptions: GitHubCopilotOptions = {
    token,
    model: 'gpt-4',
    ...options,
  };

  if (!defaultOptions.token) {
    throw new Error(`
      GitHub Copilot OAuth token required. This is different from GitHub PAT tokens.
      
      Setup options:
      1. Save OAuth token to ~/.claude-zen/copilot-token.json: {"access_token": "gho_xxx"}
      2. Set GITHUB_COPILOT_TOKEN environment variable with OAuth token (gho_xxx format)
      
      Note: Personal Access Tokens (ghp_xxx) won't work for Copilot API.
      You need VSCode-style OAuth tokens obtained through GitHub Copilot subscription.
    `);
  }

  return new GitHubCopilotAPI(defaultOptions);
}

/**
 * Execute GitHub Copilot task with automatic provider creation
 */
export async function executeGitHubCopilotTask(
  prompt: string,
  options: {
    token: string;
    model?: 'gpt-4''' | '''gpt-4-turbo''' | '''gpt-3.5-turbo''' | '''claude-3-sonnet';
  } = { token: '' }
): Promise<string> {
  const provider = createGitHubCopilotProvider(options);

  const result = await provider.execute({
    messages: [{ role: 'user', content: prompt }],
  });

  if (result.isOk()) {
    return result.value.content;
  } else {
    throw new Error(`GitHub Copilot task failed: ${result.error.message}`);
  }
}

/**
 * GitHub Copilot API configuration and metadata
 */
export const gitHubCopilotConfig = {
  name: 'GitHub Copilot Chat API',
  description: 'GitHub Copilot conversational AI for development assistance',
  version: '1.0.0',
  capabilities: {
    conversational: true,
    codeCompletion: true,
    agentic: true,
    fileOperations: false,
  },
  authentication: {
    type: 'oauth-bearer-token',
    tokenFormat: 'gho_xxx (OAuth token, NOT PAT)',
    requirements: [
      'GitHub Copilot subscription',
      'VSCode-style OAuth flow',
      'OAuth token (gho_xxx format)',
    ],
    requiredHeaders: {
      'Copilot-Integration-Id': 'vscode-chat',
    },
    note: 'Different from GitHub Models API - requires OAuth tokens, not PAT tokens',
  },
  endpoints: {
    chat: 'https://api.githubcopilot.com/chat/completions',
    models: 'https://api.githubcopilot.com/models',
  },
};
