/**
 * GitHub Models Provider
 * 
 * Complete provider for GitHub Models API integration
 */

import { getLogger } from '@claude-zen/foundation';
import { GitHubModelsClient, type GitHubModel, type ChatCompletionRequest, type ChatCompletionResponse } from './github-models-client.js';
import { GitHubModelsAuth, type GitHubModelsAuthOptions } from './github-models-auth.js';

const logger = getLogger('github-models-provider');

export interface GitHubModelsProviderOptions extends GitHubModelsAuthOptions {
  /**
   * Auto-initialize the provider on construction
   */
  autoInitialize?: boolean;
}

export class GitHubModelsProvider {
  private auth: GitHubModelsAuth;
  private client?: GitHubModelsClient;
  private initialized = false;

  constructor(options: GitHubModelsProviderOptions = {}) {
    this.auth = new GitHubModelsAuth(options);
    
    if (options.autoInitialize && options.token) {
      this.initialize().catch(error => {
        logger.error('Auto-initialization failed:', error);
      });
    }
  }

  /**
   * Initialize the provider
   */
  async initialize(): Promise<void> {
    const token = this.auth.getToken();
    if (!token) {
      throw new Error('No GitHub token provided. Set token via setToken() or constructor options.');
    }

    logger.info('Initializing GitHub Models provider');

    // Validate token
    const validation = await this.auth.validateToken();
    if (!validation.valid) {
      throw new Error(`Token validation failed: ${validation.error}`);
    }

    logger.info(`GitHub Models provider initialized for user: ${validation.user}`);

    // Check Models API access
    const accessCheck = await this.auth.checkModelsAccess();
    if (accessCheck.hasAccess) {
      logger.info('User has access to GitHub Models API');
    } else {
      logger.warn(`Limited access to GitHub Models API: ${accessCheck.error}`);
    }

    // Initialize client
    this.client = new GitHubModelsClient(token);
    this.initialized = true;
  }

  /**
   * Set GitHub token
   */
  setToken(token: string): void {
    this.auth.setToken(token);
    this.initialized = false; // Require re-initialization
  }

  /**
   * Get the Models client instance
   */
  getClient(): GitHubModelsClient {
    if (!this.initialized || !this.client) {
      throw new Error('Provider not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * List available models
   */
  async listModels(): Promise<GitHubModel[]> {
    const client = this.getClient();
    return await client.listModels();
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const client = this.getClient();
    return await client.createChatCompletion(request);
  }

  /**
   * Try inference endpoint
   */
  async createInference(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const client = this.getClient();
    return await client.createInference(request);
  }

  /**
   * Test connection to GitHub Models API
   */
  async testConnection(): Promise<{
    auth: { valid: boolean; user?: string; error?: string };
    models: { success: boolean; models?: string[]; error?: string };
    inference?: { success: boolean; response?: string; error?: string };
  }> {
    const results: any = {
      auth: { valid: false },
      models: { success: false }
    };

    // Test authentication
    results.auth = await this.auth.validateToken();

    // Test models access if auth is valid
    if (results.auth.valid && this.client) {
      results.models = await this.client.testConnection();
      
      // Test inference if models work
      if (results.models.success) {
        results.inference = await this.client.testInference();
      }
    }

    return results;
  }

  /**
   * Get provider status
   */
  getStatus(): {
    initialized: boolean;
    hasToken: boolean;
    hasClient: boolean;
  } {
    return {
      initialized: this.initialized,
      hasToken: !!this.auth.getToken(),
      hasClient: !!this.client
    };
  }
}

export default GitHubModelsProvider;