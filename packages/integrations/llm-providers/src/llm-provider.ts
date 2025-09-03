import { getLogger } from '@claude-zen/foundation';
import { ModelRegistry } from './registry/model-registry.js';

// Import individual LLM provider packages
import { ClaudeProvider, ClaudeAuth, createClaudeClient } from '@claude-zen/claude-provider';
import { CopilotProvider } from '@claude-zen/copilot-provider';
import { GitHubModelsProvider } from '@claude-zen/github-models-provider';

const logger = getLogger('llm-provider');

export enum LLMProviderType {
  GITHUB_COPILOT = 'github-copilot',
  GITHUB_MODELS = 'github-models',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  CURSOR = 'cursor'
}

export interface LLMProviderConfig {
  type: LLMProviderType;
  token?: string;
  apiKey?: string;
  endpoint?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LlmProvider {
  private config: LLMProviderConfig;
  private githubSetup?: GithubModelsSetup;
  private claudeProvider?: ClaudeProvider;
  private copilotProvider?: CopilotProvider;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  /**
   * Initialize the specified LLM provider
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing LLM provider: ${this.config.type}`);

    switch (this.config.type) {
      case LLMProviderType.GITHUB_COPILOT:
        this.copilotProvider = new CopilotProvider({
          token: this.config.token
        });
        await this.copilotProvider.initialize();
        break;
      
      case LLMProviderType.GITHUB_MODELS:
        this.githubSetup = new GithubModelsSetup(this.config.token);
        await this.githubSetup.initialize();
        break;
      
      case LLMProviderType.CLAUDE:
        this.claudeProvider = new ClaudeProvider({
          apiKey: this.config.apiKey,
          baseURL: this.config.endpoint,
          mode: 'both' // Support both API and SDK modes
        });
        await this.claudeProvider.initialize();
        break;
      
      case LLMProviderType.GEMINI:
        // TODO: Implement Gemini provider  
        throw new Error('Gemini provider not implemented yet');
      
      case LLMProviderType.CURSOR:
        // TODO: Implement Cursor provider
        throw new Error('Cursor provider not implemented yet');
      
      default:
        throw new Error(`Unsupported provider type: ${this.config.type}`);
    }

    logger.info(`LLM provider ${this.config.type} initialized successfully`);
  }

  /**
   * Create chat completion using the configured provider
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.isInitialized()) {
      throw new Error('Provider not initialized. Call initialize() first.');
    }

    switch (this.config.type) {
      case LLMProviderType.GITHUB_COPILOT:
        return await this.copilotProvider!.createChatCompletion(request);
      
      case LLMProviderType.GITHUB_MODELS:
        const modelsClient = this.githubSetup!.getModelsClient();
        return await modelsClient.createChatCompletion(request);
      
      case LLMProviderType.CLAUDE:
        return await this.claudeProvider!.createChatCompletion(request);
      
      default:
        throw new Error(`Chat completion not implemented for provider: ${this.config.type}`);
    }
  }

  /**
   * Create streaming chat completion
   */
  async *createChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<any, void, unknown> {
    if (!this.isInitialized()) {
      throw new Error('Provider not initialized. Call initialize() first.');
    }

    switch (this.config.type) {
      case LLMProviderType.GITHUB_COPILOT:
        yield* this.copilotProvider!.createChatCompletionStream(request);
        break;
      
      case LLMProviderType.GITHUB_MODELS:
        const modelsClient = this.githubSetup!.getModelsClient();
        yield* modelsClient.createChatCompletionStream(request);
        break;
      
      default:
        throw new Error(`Streaming not implemented for provider: ${this.config.type}`);
    }
  }

  /**
   * List available models for the provider
   */
  async listModels(): Promise<Array<{ id: string; name: string; description?: string }>> {
    if (!this.isInitialized()) {
      throw new Error('Provider not initialized. Call initialize() first.');
    }

    switch (this.config.type) {
      case LLMProviderType.GITHUB_COPILOT:
        const copilotModels = await this.copilotProvider!.listModels();
        return copilotModels.map(m => ({ id: m.id, name: m.name || m.id }));
      
      case LLMProviderType.GITHUB_MODELS:
        const modelsClient = this.githubSetup!.getModelsClient();
        const githubModels = await modelsClient.listModels();
        return githubModels.map(m => ({ id: m.id, name: m.friendly_name, description: m.summary }));
      
      default:
        throw new Error(`List models not implemented for provider: ${this.config.type}`);
    }
  }

  /**
   * Test connection to the provider
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized()) {
      return { success: false, error: 'Provider not initialized' };
    }

    try {
      switch (this.config.type) {
        case LLMProviderType.GITHUB_COPILOT:
          return await this.copilotProvider!.testConnection();
        
        case LLMProviderType.GITHUB_MODELS:
          const testResults = await this.githubSetup!.testConnection();
          return { success: testResults.models.success, error: testResults.models.error };
        
        default:
          return { success: false, error: `Test connection not implemented for provider: ${this.config.type}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if the provider is initialized
   */
  private isInitialized(): boolean {
    switch (this.config.type) {
      case LLMProviderType.GITHUB_COPILOT:
        return !!this.copilotProvider;
      case LLMProviderType.GITHUB_MODELS:
        return !!this.githubSetup;
      case LLMProviderType.CLAUDE:
        return !!this.claudeProvider;
      default:
        return false;
    }
  }

  /**
   * Get the provider type
   */
  getProviderType(): LLMProviderType {
    return this.config.type;
  }

  /**
   * Execute a generic operation (for backward compatibility)
   */
  async execute(): Promise<void> {
    await this.initialize();
    const testResult = await this.testConnection();
    
    if (!testResult.success) {
      throw new Error(`Provider execution failed: ${testResult.error}`);
    }
    
    logger.info(`Provider ${this.config.type} is ready for use`);
  }
}
