/**
 * Anthropic Claude Provider Implementation
 * High-performance integration with Claude models
 */

import { BaseProvider } from './base-provider.js';
import { 
  AIRequest, 
  AIResponse, 
  ProviderConfig, 
  ProviderCapabilities,
  ProviderError,
  RateLimitError,
  TokenUsage
} from './types.js';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  stream?: boolean;
  system?: string;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseProvider {
  name = 'anthropic';
  version = '2024-07-29';
  
  config: ProviderConfig = {
    enabled: true,
    priority: 1,
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
    imageAnalysis: true,
    functionCalling: true,
    streaming: true,
    embeddings: false,
    contextWindow: 200000,
    maxTokens: 4096,
    supportedLanguages: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 
      'go', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'sql'
    ]
  };

  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';
  private availableModels: string[] = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022', 
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ];

  constructor() {
    super();
    this.pricing = {
      inputTokenPrice: 0.003,  // $3 per 1M tokens for Sonnet
      outputTokenPrice: 0.015, // $15 per 1M tokens for Sonnet
      currency: 'USD'
    };
  }

  async initialize(config: any): Promise<void> {
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!this.apiKey) {
      throw new ProviderError('Anthropic API key is required', this.name, 'MISSING_API_KEY');
    }

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    // Override default config
    this.config = { ...this.config, ...config };

    // Test the connection
    await this.healthCheck();
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    this.validateRequest(request);
    this.emitRequest(request);

    try {
      const anthropicRequest: AnthropicRequest = {
        model: request.model,
        messages: this.convertMessages(request.messages),
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop,
        stream: false
      };

      // Add system message if provided
      if (request.systemPrompt) {
        anthropicRequest.system = request.systemPrompt;
      }

      const response = await this.makeRequest('/messages', anthropicRequest);
      const responseTime = Date.now() - startTime;

      const aiResponse: AIResponse = {
        id: response.id,
        provider: this.name,
        model: request.model,
        content: response.content[0]?.text || '',
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          cost: this.calculateCost({
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens
          })
        },
        finishReason: this.mapStopReason(response.stop_reason),
        responseTime,
        timestamp: new Date(),
        metadata: {
          stopSequence: response.stop_sequence
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
      const anthropicRequest: AnthropicRequest = {
        model: request.model,
        messages: this.convertMessages(request.messages),
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop,
        stream: true
      };

      if (request.systemPrompt) {
        anthropicRequest.system = request.systemPrompt;
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(anthropicRequest)
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
              if (parsed.type === 'content_block_delta') {
                yield parsed.delta?.text || '';
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
    return [...this.availableModels];
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for HTTP-based provider
  }

  private convertMessages(messages: any[]): AnthropicMessage[] {
    return messages
      .filter(msg => msg.role !== 'system') // System messages handled separately
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
  }

  private async makeRequest(endpoint: string, data: any): Promise<AnthropicResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(data)
    });

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
      errorData.error?.message || errorData.message || 'Unknown error',
      this.name,
      errorData.error?.type || 'API_ERROR',
      response.status
    );
  }

  private mapStopReason(reason: string): AIResponse['finishReason'] {
    switch (reason) {
      case 'end_turn': return 'stop';
      case 'max_tokens': return 'length';
      case 'stop_sequence': return 'stop';
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