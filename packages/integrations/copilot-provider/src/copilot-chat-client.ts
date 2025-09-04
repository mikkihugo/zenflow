/**
 * GitHub Copilot Chat Client
 * 
 * Provides chat completions using the GitHub Copilot API
 * with proper authentication and streaming support.
 */

import { getLogger } from '@claude-zen/foundation';
import { CopilotTokenManager } from './copilot-token-manager.js';

const logger = getLogger('copilot-chat-client');

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

export class CopilotChatClient {
  private tokenManager: CopilotTokenManager;
  private githubToken: string;

  constructor(githubToken: string) {
    this.tokenManager = new CopilotTokenManager();
    this.githubToken = githubToken;
  }

  /**
   * List available models
   */
  async listModels(): Promise<Array<{ id: string; object: string; created: number }>> {
    const copilotToken = await this.tokenManager.getCopilotToken(this.githubToken);
    
    const response = await fetch('https://api.githubcopilot.com/models', {
      headers: {
        'Authorization': `Bearer ${copilotToken.token}`,
        'Accept': 'application/json',
        'User-Agent': 'GitHubCopilotChat/0.22.4 (claude-zen-compatible)',
        'Editor-Version': 'vscode/1.96.0',
        'Editor-Plugin-Version': 'copilot-chat/0.22.4',
        'Openai-Organization': 'github-copilot'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.tokenManager.resetCopilotToken();
        throw new Error('Copilot authentication failed - token may be expired');
      }
      throw new Error(`Failed to list models: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Create chat completion
   */
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const copilotToken = await this.tokenManager.getCopilotToken(this.githubToken);

    if (!copilotToken.chat_enabled) {
      throw new Error('Copilot Chat is not enabled for this account');
    }

    // Use the appropriate endpoint based on token metadata
    const endpoint = copilotToken.endpoints?.api || 'https://api.githubcopilot.com';
    const url = `${endpoint}/chat/completions`;

    const body = {
      model: request.model || 'gpt-4',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 2048,
      stream: request.stream ?? false,
      top_p: request.top_p ?? 1.0
    };

    logger.debug(`Sending chat completion request to ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${copilotToken.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GitHubCopilotChat/0.22.4 (claude-zen-compatible)',
        'Editor-Version': 'vscode/1.96.0',
        'Editor-Plugin-Version': 'copilot-chat/0.22.4',
        'Openai-Organization': 'github-copilot',
        'Openai-Intent': 'conversation-panel'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Chat completion failed: ${response.status} ${errorText}`);
      
      if (response.status === 401) {
        this.tokenManager.resetCopilotToken();
        throw new Error('Copilot authentication failed - token may be expired');
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
    const copilotToken = await this.tokenManager.getCopilotToken(this.githubToken);

    if (!copilotToken.chat_enabled) {
      throw new Error('Copilot Chat is not enabled for this account');
    }

    const endpoint = copilotToken.endpoints?.api || 'https://api.githubcopilot.com';
    const url = `${endpoint}/chat/completions`;

    const body = {
      ...request,
      stream: true
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${copilotToken.token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'User-Agent': 'GitHubCopilotChat/0.22.4 (claude-zen-compatible)',
        'Editor-Version': 'vscode/1.96.0',
        'Editor-Plugin-Version': 'copilot-chat/0.22.4',
        'Openai-Organization': 'github-copilot',
        'Openai-Intent': 'conversation-panel'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.tokenManager.resetCopilotToken();
        throw new Error('Copilot authentication failed');
      }
      throw new Error(`Streaming failed: ${response.status}`);
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
        models: models.map(m => m.id) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}