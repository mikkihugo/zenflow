/**
 * GitHub Models API Client for Enterprise
 * 
 * Provides access to GitHub's official Models API (models.github.ai)
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

export interface GitHubModel {
  id: string;
  name: string;
  publisher: string;
  summary: string;
  rate_limit_tier: string;
  supported_input_modalities: string[];
  supported_output_modalities: string[];
  tags: string[];
  registry: string;
  version: string;
  capabilities: string[];
  limits: {
    max_input_tokens: number;
    max_output_tokens: number;
  };
  html_url: string;
}

export class GitHubModelsClient {
  private readonly apiBase = 'https://models.github.ai';
  private readonly githubToken: string;

  constructor(githubToken: string) {
    this.githubToken = githubToken;
  }

  /**
   * List available models from GitHub Models API
   */
  async listModels(): Promise<GitHubModel[]> {
    logger.debug(`Fetching models from ${this.apiBase}/v1/models`);
    
    const response = await fetch(`${this.apiBase}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-Code-Zen/1.0.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Failed to list models: ${response.status} ${errorText}`);
      throw new Error(`Failed to list models: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    logger.debug(`Retrieved ${result.data?.length || 0} models`);
    
    return result.data || [];
  }

  /**
   * Create chat completion using GitHub Models API
   * Note: This may not be available yet, endpoint returns 404 currently
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const body = {
      model: request.model || 'openai/gpt-4.1',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      stream: false,
      top_p: request.top_p ?? 1.0
    };

    logger.debug(`Sending chat completion request to ${this.apiBase}/v1/chat/completions`);

    const response = await fetch(`${this.apiBase}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-Code-Zen/1.0.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Chat completion failed: ${response.status} ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('GitHub token is invalid or expired');
      } else if (response.status === 403) {
        throw new Error('Access forbidden - may require additional GitHub Models API access');
      } else if (response.status === 404) {
        throw new Error('Chat completions endpoint not available yet - only models listing is supported');
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
   * Try the inference endpoint (as hinted in the code)
   */
  async createInference(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const body = {
      model: request.model || 'openai/gpt-4.1',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      stream: false,
      top_p: request.top_p ?? 1.0
    };

    logger.debug(`Sending inference request to ${this.apiBase}/inference`);

    const response = await fetch(`${this.apiBase}/inference`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-Code-Zen/1.0.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Inference failed: ${response.status} ${errorText}`);
      
      if (response.status === 401) {
        throw new Error('GitHub token is invalid or expired');
      } else if (response.status === 403) {
        throw new Error('Access forbidden - may require additional GitHub Models API access');
      } else if (response.status === 404) {
        throw new Error('Inference endpoint not available yet');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else {
        throw new Error(`Inference failed: ${response.status} ${errorText}`);
      }
    }

    const result = await response.json();
    logger.debug('Inference successful');
    
    return result;
  }

  /**
   * Test the connection to GitHub Models API
   */
  async testConnection(): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      const models = await this.listModels();
      return { 
        success: true, 
        models: models.map(m => m.id).slice(0, 10) // Return first 10 model IDs
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Test inference capability (may not work yet)
   */
  async testInference(): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const response = await this.createInference({
        messages: [{ role: 'user', content: 'Hello, test message' }],
        model: 'openai/gpt-4.1',
        max_tokens: 20
      });
      
      return {
        success: true,
        response: response.choices[0]?.message.content || 'No response content'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}