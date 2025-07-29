/**
 * Cohere Provider Implementation
 * Integration with Cohere's Command and Embed models
 */

import { BaseProvider } from './base-provider.js';
import { 
  AIRequest, 
  AIResponse, 
  ProviderConfig, 
  ProviderCapabilities,
  ProviderError,
  RateLimitError
} from './types.js';

interface CohereRequest {
  model: string;
  message: string;
  chat_history?: Array<{
    role: 'USER' | 'CHATBOT';
    message: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  p?: number;
  k?: number;
  stop_sequences?: string[];
  stream?: boolean;
}

interface CohereResponse {
  response_id: string;
  text: string;
  generation_id: string;
  token_count: {
    prompt_tokens: number;
    response_tokens: number;
    total_tokens: number;
    billed_tokens: number;
  };
  finish_reason: 'COMPLETE' | 'MAX_TOKENS' | 'STOP_SEQUENCE';
}

export class CohereProvider extends BaseProvider {
  name = 'cohere';
  version = '2024-07-29';
  
  config: ProviderConfig = {
    enabled: true,
    priority: 3,
    failover: true,
    loadBalancing: true,
    caching: true,
    retryAttempts: 3,
    retryDelay: 1000,
    healthCheck: true,
    healthCheckInterval: 300000
  };

  capabilities: ProviderCapabilities = {
    textGeneration: true,
    codeGeneration: true,
    imageGeneration: false,
    imageAnalysis: false,
    functionCalling: false,
    streaming: true,
    embeddings: true,
    contextWindow: 128000,
    maxTokens: 4000,
    supportedLanguages: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 
      'go', 'php', 'ruby', 'swift', 'kotlin', 'scala'
    ]
  };

  private apiKey: string;
  private baseUrl: string = 'https://api.cohere.ai/v1';
  private availableModels: string[] = [
    'command-r-plus',
    'command-r',
    'command',
    'command-nightly',
    'command-light',
    'command-light-nightly'
  ];

  constructor() {
    super();
    this.pricing = {
      inputTokenPrice: 0.0015,  // $1.50 per 1M tokens
      outputTokenPrice: 0.002,  // $2.00 per 1M tokens
      currency: 'USD'
    };
  }

  async initialize(config: any): Promise<void> {
    this.apiKey = config.apiKey || process.env.COHERE_API_KEY;
    if (!this.apiKey) {
      throw new ProviderError('Cohere API key is required', this.name, 'MISSING_API_KEY');
    }

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    this.config = { ...this.config, ...config };
    await this.healthCheck();
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    this.validateRequest(request);
    this.emitRequest(request);

    try {
      const cohereRequest: CohereRequest = {
        model: request.model,
        message: this.extractUserMessage(request.messages),
        chat_history: this.convertToChatHistory(request.messages),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        p: request.topP,
        stop_sequences: request.stop,
        stream: false
      };

      const response = await this.makeRequest('/chat', cohereRequest);
      const responseTime = Date.now() - startTime;

      const aiResponse: AIResponse = {
        id: response.response_id,
        provider: this.name,
        model: request.model,
        content: response.text,
        usage: {
          promptTokens: response.token_count.prompt_tokens,
          completionTokens: response.token_count.response_tokens,
          totalTokens: response.token_count.total_tokens,
          cost: this.calculateCost({
            promptTokens: response.token_count.prompt_tokens,
            completionTokens: response.token_count.response_tokens,
            totalTokens: response.token_count.total_tokens
          })
        },
        finishReason: this.mapFinishReason(response.finish_reason),
        responseTime,
        timestamp: new Date(),
        metadata: {
          generationId: response.generation_id,
          billedTokens: response.token_count.billed_tokens
        }
      };

      this.updateMetrics(request, aiResponse);
      this.emitResponse(aiResponse);

      return aiResponse;
    } catch (error) {
      this.updateMetrics(request, null, error);
      this.emitError(error, request);
      throw this.handleError(error);
    }
  }

  async *generateStream(request: AIRequest): AsyncIterable<string> {
    this.validateRequest(request);
    this.emitRequest(request);

    try {
      const cohereRequest: CohereRequest = {
        model: request.model,
        message: this.extractUserMessage(request.messages),
        chat_history: this.convertToChatHistory(request.messages),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        p: request.topP,
        stop_sequences: request.stop,
        stream: true
      };

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(cohereRequest)
      });

      if (!response.ok) {
        throw await this.createErrorFromResponse(response);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new ProviderError('No response body', this.name);
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                yield parsed.text;
              }
            } catch (e) {
              // Ignore parsing errors for streaming
            }
          }
        }
      }
    } catch (error) {
      this.emitError(error, request);
      throw this.handleError(error);
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await this.makeRequest('/models', null, 'GET');
      return response.models
        .filter((model: any) => model.name && this.availableModels.includes(model.name))
        .map((model: any) => model.name);
    } catch (error) {
      return [...this.availableModels];
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for HTTP-based provider
  }

  private extractUserMessage(messages: any[]): string {
    // Get the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content;
      }
    }
    return '';
  }

  private convertToChatHistory(messages: any[]): Array<{ role: 'USER' | 'CHATBOT'; message: string }> {
    const history = [];
    
    // Skip the last user message (it's sent as the main message)
    const messagesToProcess = messages.slice(0, -1);
    
    for (const msg of messagesToProcess) {
      if (msg.role === 'user') {
        history.push({
          role: 'USER',
          message: msg.content
        });
      } else if (msg.role === 'assistant') {
        history.push({
          role: 'CHATBOT',
          message: msg.content
        });
      }
    }
    
    return history;
  }

  private async makeRequest(endpoint: string, data: any, method: string = 'POST'): Promise<any> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && method === 'POST') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (!response.ok) {
      throw await this.createErrorFromResponse(response);
    }

    return response.json();
  }

  private async createErrorFromResponse(response: Response): Promise<Error> {
    const text = await response.text();
    let errorData: any = {};

    try {
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = { message: text };
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      return new RateLimitError(this.name, retryAfter ? parseInt(retryAfter) : undefined);
    }

    return new ProviderError(
      errorData.message || 'Unknown error',
      this.name,
      'API_ERROR',
      response.status
    );
  }

  private mapFinishReason(reason: string): AIResponse['finishReason'] {
    switch (reason) {
      case 'COMPLETE': return 'stop';
      case 'MAX_TOKENS': return 'length';
      case 'STOP_SEQUENCE': return 'stop';
      default: return 'stop';
    }
  }

  private handleError(error: any): Error {
    if (error instanceof ProviderError) {
      return error;
    }

    return new ProviderError(
      error.message || 'Unknown error occurred',
      this.name,
      'UNKNOWN_ERROR'
    );
  }
}