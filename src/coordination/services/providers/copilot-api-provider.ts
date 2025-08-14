/**
 * @fileoverview Simple Copilot API Provider stub
 * 
 * Minimal implementation to satisfy import requirements.
 * Full implementation would require GitHub Copilot API integration.
 */

export interface CopilotApiConfig {
  githubToken: string;
  accountType?: 'enterprise' | 'individual';
  verbose?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Simple stub implementation of Copilot API Provider
 * 
 * @class CopilotApiProvider
 */
export class CopilotApiProvider {
  private config: CopilotApiConfig;

  constructor(config: CopilotApiConfig) {
    this.config = config;
  }

  /**
   * Create chat completion (stub implementation)
   * 
   * @param options - Chat completion options
   * @returns Promise<ChatCompletionResponse>
   * @throws Error indicating this is a stub
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    throw new Error('CopilotApiProvider is a stub implementation. Full GitHub Copilot API integration required.');
  }
}