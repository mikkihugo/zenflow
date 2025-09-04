/**
 * GitHub Models API Client for Enterprise
 * 
 * Provides access to GitHub's legitimate Models API for enterprise customers
 * with OpenAI-compatible interface.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('github-models-client');

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
  top_p?: number;
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

export interface ModelInfo {
  id: string;
  name: string;
  friendly_name: string;
  publisher: string;
  task: string;
  description: string;
  summary: string;
  tags: string[];
}

export class GitHubModelsClient {
  private readonly apiBase = 'https://models.inference.ai.azure.com';
  private readonly githubToken: string;

  constructor(githubToken: string) {
    this.githubToken = githubToken;
  }

  /**
   * List available models
   */
  async listModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.apiBase}/models`, {
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to list models: ${response.status} ${errorText}`);
      throw new Error(`Failed to list models: ${response.status}`);
    }

    const models = await response.json();
    return models.filter((model: ModelInfo) => model.task === 'chat-completion');
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const body = {
      model: request.model || 'gpt-4o-mini',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      stream: false,
      top_p: request.top_p ?? 1.0
    };

    logger.debug(`Sending chat completion request to ${this.apiBase}/chat/completions`);

    const response = await fetch(`${this.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Chat completion failed: ${response.status} ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('GitHub token is invalid or expired');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else {
        throw new Error(`Chat completion failed: ${response.status} ${errorText}`);
      }
    }

    const result = await response.json();
    logger.debug('Chat completion successful');
    
    return result;
  }

  /**
   * Create streaming chat completion
   */
  async *createChatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<any, void, unknown> {
    const body = {
      ...request,
      stream: true
    };

    const response = await fetch(`${this.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Streaming failed: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') return;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data;
            } catch (error) {
              logger.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      const models = await this.listModels();
      return { 
        success: true, 
        models: models.map(m => m.name) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}