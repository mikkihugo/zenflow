/**
 * OpenAI Provider Implementation
 * Integration with OpenAI GPT models including GPT-4, GPT-3.5, and function calling
 */

import { BaseProvider } from './base-provider.js';
import { 
  AIRequest, 
  AIResponse, 
  ProviderConfig, 
  ProviderCapabilities,
  ProviderError,
  RateLimitError,
  TokenUsage,
  Message,
  FunctionCall
} from './types.js';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
  functions?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  function_call?: 'auto' | 'none' | { name: string };
}

interface OpenAIResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      function_call?: {
        name: string;
        arguments: string;
      };
    };
    finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseProvider {
  name = 'openai';
  version = '2024-07-29';
  
  config: ProviderConfig = {
    enabled: true,
    priority: 2,
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
    imageGeneration: true,
    imageAnalysis: true,
    functionCalling: true,
    streaming: true,
    embeddings: true,
    contextWindow: 128000,
    maxTokens: 4096,
    supportedLanguages: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 
      'go', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'sql',
      'html', 'css', 'xml', 'json', 'yaml', 'markdown'
    ]
  };

  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private availableModels: string[] = [
    'gpt-4-turbo-preview',
    'gpt-4-0125-preview',
    'gpt-4-1106-preview',
    'gpt-4',
    'gpt-4-0613',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-1106'
  ];

  constructor() {
    super();
    this.pricing = {
      inputTokenPrice: 0.01,   // $10 per 1M tokens for GPT-4
      outputTokenPrice: 0.03,  // $30 per 1M tokens for GPT-4
      currency: 'USD'
    };
  }

  async initialize(config: any): Promise<void> {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new ProviderError('OpenAI API key is required', this.name, 'MISSING_API_KEY');
    }

    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    // Update pricing based on model
    if (config.model?.includes('gpt-3.5')) {
      this.pricing = {
        inputTokenPrice: 0.0005,  // $0.50 per 1M tokens
        outputTokenPrice: 0.0015, // $1.50 per 1M tokens
        currency: 'USD'
      };
    }

    this.config = { ...this.config, ...config };
    await this.healthCheck();
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    this.validateRequest(request);
    this.emitRequest(request);

    try {
      const openaiRequest: OpenAIRequest = {
        model: request.model,
        messages: this.convertMessages(request.messages, request.systemPrompt),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        stop: request.stop,
        stream: false
      };

      // Add function calling if functions are provided
      if (request.functions && request.functions.length > 0) {
        openaiRequest.functions = request.functions.map(fn => ({
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters
        }));
        openaiRequest.function_call = 'auto';
      }

      const response = await this.makeRequest('/chat/completions', openaiRequest);
      const responseTime = Date.now() - startTime;

      const choice = response.choices[0];
      const usage: TokenUsage = {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        cost: this.calculateCost({
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        })
      };

      const aiResponse: AIResponse = {
        id: response.id,
        provider: this.name,
        model: request.model,
        content: choice.message.content || '',
        usage,
        finishReason: choice.finish_reason,
        functionCall: choice.message.function_call ? {
          name: choice.message.function_call.name,
          arguments: choice.message.function_call.arguments
        } : undefined,
        responseTime,
        timestamp: new Date(),
        metadata: {
          created: response.created,
          object: response.object
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
      const openaiRequest: OpenAIRequest = {
        model: request.model,
        messages: this.convertMessages(request.messages, request.systemPrompt),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        stop: request.stop,
        stream: true
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(openaiRequest)
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
              const delta = parsed.choices[0]?.delta;
              if (delta?.content) {
                yield delta.content;
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
      return response.data
        .filter((model: any) => this.availableModels.includes(model.id))
        .map((model: any) => model.id);
    } catch (error) {
      // Fallback to static list if API call fails
      return [...this.availableModels];
    }
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for HTTP-based provider
  }

  private convertMessages(messages: Message[], systemPrompt?: string): OpenAIMessage[] {
    const result: OpenAIMessage[] = [];

    // Add system message first if provided
    if (systemPrompt) {
      result.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Convert other messages
    for (const msg of messages) {
      if (msg.role === 'system' && !systemPrompt) {
        result.push({
          role: 'system',
          content: msg.content
        });
      } else if (msg.role === 'function') {
        result.push({
          role: 'function',
          name: msg.name,
          content: msg.content
        });
      } else {
        const openaiMsg: OpenAIMessage = {
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        };

        if (msg.functionCall) {
          openaiMsg.function_call = {
            name: msg.functionCall.name,
            arguments: msg.functionCall.arguments
          };
        }

        result.push(openaiMsg);
      }
    }

    return result;
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
      errorData.error?.message || errorData.message || 'Unknown error',
      this.name,
      errorData.error?.type || 'API_ERROR',
      response.status
    );
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