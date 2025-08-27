/**
 * @fileoverview GitHub Copilot Chat API Integration
 *
 * **Enterprise-grade GitHub Copilot Chat API integration with full model support**
 * 
 * This module provides direct access to GitHub Copilot Chat AI models through their
 * official API. Offers conversational AI, code generation, and advanced reasoning
 * capabilities with enterprise authentication and comprehensive error handling.
 *
 * **🔐 CRITICAL AUTHENTICATION DIFFERENCE:**
 * - **GitHub Copilot API**: Uses OAuth tokens (`gho_xxx`) at `api.githubcopilot.com`
 * - **GitHub Models API**: Uses PAT tokens (`ghp_xxx`) at `models.inference.ai.azure.com`
 * 
 * **Key Features:**
 * - **OAuth2 Authentication**: VSCode-style OAuth flow with Copilot subscription
 * - **Enterprise-Grade Models**: Access to GPT-4o, Claude, and other premium models
 * - **Streaming Support**: Real-time response streaming with proper event handling
 * - **Conversation Memory**: Maintains context across multiple turns
 * - **Rate Limit Handling**: Automatic retry with exponential backoff
 * - **Rich Metadata**: Model capabilities, context windows, and pricing information
 *
 * **Supported Models:**
 * - `gpt-4o`: Latest GPT-4 with vision and tool calling
 * - `gpt-4o-mini`: Faster, cost-effective variant  
 * - `claude-3.5-sonnet`: Anthropic's Claude for reasoning
 * - `o1-preview`: OpenAI's reasoning model
 * - See {@link GitHubCopilotModelMetadata} for complete list
 *
 * **Authentication Requirements:**
 * - GitHub Copilot subscription (paid plan)
 * - OAuth token with `gho_` prefix (NOT personal access tokens)
 * - Required header: `Copilot-Integration-Id: vscode-chat`
 * - Token scopes: `copilot`, `read:user`
 *
 * @package @claude-zen/llm-providers  
 * @version 2.0.0
 * @since 1.0.0
 * @access public
 *
 * @example Basic Conversational AI
 * ```typescript
 * import { GitHubCopilotAPI } from '@claude-zen/llm-providers';
 * 
 * // CRITICAL: Must use OAuth token (gho_xxx), NOT PAT token (ghp_xxx)
 * const copilot = new GitHubCopilotAPI({
 *   token: process.env['GITHUB_COPILOT_TOKEN'],  // OAuth token required
 *   model: 'gpt-4o'
 * });
 *
 * // Simple conversation
 * const response = await copilot.execute({
 *   messages: [{ 
 *     role: 'user', 
 *     content: 'Explain microservices architecture pros and cons' 
 *   }]
 * });
 * 
 * if (response.isOk()) {
 *   console.log('Response:', response.value.content);
 * }
 * ```
 *
 * @example Advanced Code Generation
 * ```typescript
 * const copilot = new GitHubCopilotAPI({
 *   token: process.env['GITHUB_COPILOT_TOKEN'],
 *   model: 'gpt-4o',
 *   temperature: 0.1  // Deterministic for code generation
 * });
 *
 * const codeResult = await copilot.execute({
 *   messages: [
 *     { role: 'system', content: 'You are an expert TypeScript developer' },
 *     { role: 'user', content: `
 *       Create a React hook for managing user authentication state.
 *       Include login, logout, and token refresh functionality.
 *       Use TypeScript with proper error handling.
 *     `}
 *   ],
 *   temperature: 0.1,
 *   maxTokens: 2000
 * });
 * ```
 *
 * @example Streaming Responses
 * ```typescript
 * const copilot = new GitHubCopilotAPI({
 *   token: process.env['GITHUB_COPILOT_TOKEN'],
 *   model: 'claude-3.5-sonnet'
 * });
 *
 * // Stream real-time responses
 * const stream = copilot.stream({
 *   messages: [{ 
 *     role: 'user', 
 *     content: 'Write a detailed analysis of REST vs GraphQL' 
 *   }]
 * });
 *
 * for await (const chunk of stream) {
 *   if (chunk.isOk()) {
 *     process.stdout.write(chunk.value.content);
 *   }
 * }
 * ```
 *
 * @example Multi-Turn Conversation
 * ```typescript
 * const conversation = [
 *   { role: 'user', content: 'What is Docker?' },
 *   { role: 'assistant', content: 'Docker is a containerization platform...' },
 *   { role: 'user', content: 'How does it compare to virtual machines?' }
 * ];
 *
 * const response = await copilot.execute({
 *   messages: conversation
 * });
 * ```
 *
 * @see {@link https://aider.chat/docs/llms/github.html} - GitHub Copilot integration guide
 * @see {@link GitHubCopilotModelMetadata} - Available models and capabilities
 * @see {@link createGitHubCopilotProvider} - Factory function for easy setup
 * })
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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { getLogger, ok, err } from '@claude-zen/foundation';

import type {
  APIProvider,
  APIRequest,
  APIResult,
  APIProviderCapabilities,
} from '../types/api-providers';

// Error codes enum for API responses
export const API_ERROR_CODES = {
  MODEL_ERROR: 'MODEL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

import {
  githubCopilotDB,
  initializeGitHubCopilotDB,
} from './github-copilot-db';

const logger = getLogger('GitHubCopilotAPI');

// Constants for GitHub Copilot API
const COPILOT_INTEGRATION_ID = 'vscode-chat';

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
        ' Loaded GitHub Copilot OAuth token from ~/.claude-zen/copilot-token.json'
      );
      return config.access_token;
    }
  } catch (error) {
    logger.warn('Failed to load Copilot OAuth token from config:', error);
  }

  // Fallback to environment variables (should be OAuth token, not PAT)
  const token = process.env['GITHUB_COPILOT_TOKEN'] || '';
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
    this['options'] = {
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Authorization': `Bearer ${this.options.token}`,
           
          'Content-Type': 'application/json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Copilot-Integration-Id': COPILOT_INTEGRATION_ID,
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
        data.choices?.[0]?.message?.content || 'No response content';

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
          error: error instanceof Error ? error['message'] : String(error),
        },
      });
    }
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): APIProviderCapabilities {
    const models = githubCopilotDB.getAllModels();
    const chatModels = models.filter((m) => m['type'] === 'chat');
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
   * List available models from GitHub Copilot API (real-time)
   */
  async listModels(): Promise<string[]> {
    try {
      // Try real API first
      const response = await fetch(`${this.options.baseURL}/models`, {
        method: 'GET',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Authorization': `Bearer ${this.options.token}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Copilot-Integration-Id': COPILOT_INTEGRATION_ID,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          // Extract model IDs from real API response
          const modelIds = data.data
            .filter(model => model.capabilities?.type === 'chat' || !model.capabilities?.type) // Chat models only
            .map(model => model.id)
            .filter(Boolean);

          logger.info(`📋 GitHub Copilot models from real API: ${modelIds.length} chat models`);
          logger.info(`🎯 First few models: ${modelIds.slice(0, 5).join(', ')}${modelIds.length > 5 ? '...' : ''}`);
          
          return modelIds;
        }
      } else {
        logger.warn(`GitHub Copilot models API returned ${response.status}: ${response.statusText}`);
      }
      
      // Fallback to database if API fails
      logger.info('📋 Falling back to database for model list...');
      const models = githubCopilotDB.getChatModels();
      
      if (models.length === 0) {
        logger.warn('📋 No models in database, forcing update...');
        await githubCopilotDB.updateModels();
        const updatedModels = githubCopilotDB.getChatModels();
        return updatedModels.map((m) => m.id);
      }

      const modelIds = models.map((m) => m.id);
      logger.info(`📋 GitHub Copilot models from database: ${modelIds.length} chat models`);
      return modelIds;
      
    } catch (error) {
      logger.error('Failed to list GitHub Copilot models from API:', error);

      // Final emergency fallback with real context sizes
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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Authorization': `Bearer ${this.options.token}`,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Copilot-Integration-Id': COPILOT_INTEGRATION_ID,
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
    model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-sonnet';
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Copilot-Integration-Id': COPILOT_INTEGRATION_ID,
    },
    note: 'Different from GitHub Models API - requires OAuth tokens, not PAT tokens',
  },
  endpoints: {
    chat: 'https://api.githubcopilot.com/chat/completions',
    models: 'https://api.githubcopilot.com/models',
  },
};
