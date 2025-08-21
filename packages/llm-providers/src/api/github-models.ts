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
 *   token: process.env.GITHUB_TOKEN,
 *   model: 'gpt-4o'  // GitHub hosts multiple models
 * });
 * 
 * const response = await github.execute({
 *   messages: [{ role: 'user', content: 'Create a React authentication system' }]
 * });
 * ```
 */

import { getLogger } from '@claude-zen/foundation/logging';
import type { CLIProvider, CLIRequest, CLIResponse, CLIResult, CLIError, SwarmAgentRole, CLIProviderCapabilities } from '../types/cli-providers';
import { CLI_ERROR_CODES } from '../types/cli-providers';
import { Result, ok, err } from '@claude-zen/foundation';

const logger = getLogger('GitHubModelsAPI');

export interface GitHubModelsOptions {
  token: string;
  model?: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'claude-3-5-sonnet' | 'llama-3-70b';
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
export class GitHubModelsAPI implements CLIProvider {
  readonly id = 'github-models-api';
  readonly name = 'GitHub Models API';
  
  private options: Required<GitHubModelsOptions>;

  constructor(options: GitHubModelsOptions) {
    this.options = {
      model: 'gpt-4o',
      baseURL: 'https://models.inference.ai.azure.com',
      maxTokens: 4096,
      temperature: 0.7,
      ...options,
    };
  }

  /**
   * Execute development task using GitHub Models API
   */
  async execute(request: CLIRequest): Promise<CLIResult> {
    try {
      logger.info(`Executing GitHub Models API request with model: ${this.options.model}`);

      const response = await fetch(`${this.options.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.options.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: request.messages,
          max_tokens: this.options.maxTokens,
          temperature: this.options.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return ok({
        content,
        metadata: {
          model: this.options.model,
          provider: 'github-models',
          tokens: data.usage?.total_tokens,
          executionTime: Date.now()
        }
      });
    } catch (error) {
      logger.error('GitHub Models API execution failed:', error);
      return err({
        code: CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          provider: 'github-models',
          executionTime: Date.now()
        },
        cause: error instanceof Error ? error : undefined
      });
    }
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): CLIProviderCapabilities {
    return {
      features: {
        fileOperations: false,     // API only, no file access
        webAccess: false,          // No web browsing
        codeExecution: false,      // No code execution
        imageGeneration: false,    // Text only
        multimodal: false,         // Text only for now
        streaming: false,          // No streaming support yet
        customTools: false,        // No custom tools
        contextWindow: true,       // Large context window
        reasoning: true,           // Advanced reasoning
        coding: true,              // Excellent for coding
        planning: true,            // Good for planning
      },
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'claude-3-5-sonnet', 'llama-3-70b'],
      maxTokens: this.options.maxTokens,
      contextWindow: 128000,     // Varies by model
      pricing: {
        inputTokens: 0.00025,    // Approximate, varies by model
        outputTokens: 0.001,     // Approximate, varies by model
        currency: 'USD'
      }
    };
  }

  /**
   * Set agent role (not applicable for API)
   */
  setRole(_role: string): Result<void, CLIError> {
    logger.debug('Role setting not applicable for GitHub Models API');
    return ok(undefined);
  }

  /**
   * Get current role (not applicable for API)
   */
  getRole(): SwarmAgentRole | undefined {
    return undefined;
  }

  /**
   * Complete method for simple text completion
   */
  async complete(prompt: string, options?: Partial<CLIRequest>): Promise<Result<string, CLIError>> {
    const result = await this.execute({
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });
    
    if (result.isErr()) {
      return err(result.error);
    }
    
    return ok(result.value.content);
  }

  /**
   * Execute task method
   */
  async executeTask(prompt: string, options?: Record<string, unknown>): Promise<Result<unknown, CLIError>> {
    const result = await this.execute({
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });
    
    if (result.isErr()) {
      return err(result.error);
    }
    
    return ok(result.value);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number; currentRole?: string } {
    return {
      requestCount: 0,
      lastRequestTime: 0,
    };
  }
}

/**
 * Create GitHub Models API provider instance
 */
export function createGitHubModelsProvider(options: GitHubModelsOptions): GitHubModelsAPI {
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
    messages: [{ role: 'user', content: prompt }]
  });
  
  if (response.isErr()) {
    throw new Error(`GitHub Models task failed: ${response.error.message}`);
  }
  
  return response.value.content;
}