/**
 * Ollama Provider Implementation
 * Integration with local Ollama models for self-hosted AI
 */

import { BaseProvider } from './base-provider.js';
import { 
  AIRequest, 
  AIResponse, 
  ProviderConfig, 
  ProviderCapabilities,
  ProviderError
} from './types.js';

interface OllamaRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export class OllamaProvider extends BaseProvider {
  name = 'ollama';
  version = '2024-07-29';
  
  config: ProviderConfig = {
    enabled: true,
    priority: 5,
    failover: true,
    loadBalancing: true,
    caching: true,
    retryAttempts: 2, // Lower retry for local service
    retryDelay: 500,
    healthCheck: true,
    healthCheckInterval: 60000 // More frequent for local service
  };

  capabilities: ProviderCapabilities = {
    textGeneration: true,
    codeGeneration: true,
    imageGeneration: false,
    imageAnalysis: false,
    functionCalling: false,
    streaming: true,
    embeddings: true,
    contextWindow: 32000, // Varies by model
    maxTokens: 4096,
    supportedLanguages: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 
      'go', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'sql'
    ]
  };

  private baseUrl: string = 'http://localhost:11434';
  private availableModels: string[] = [];
  private modelCache: Map<string, OllamaModel> = new Map();

  constructor() {
    super();
    this.pricing = {
      inputTokenPrice: 0,  // Free for local models
      outputTokenPrice: 0,
      currency: 'USD'
    };
  }

  async initialize(config: any): Promise<void> {
    this.baseUrl = config.baseUrl || config.endpoint || this.baseUrl;
    this.config = { ...this.config, ...config };

    // Test connection and load available models
    await this.loadAvailableModels();
    await this.healthCheck();
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    this.validateRequest(request);
    this.emitRequest(request);

    try {
      const ollamaRequest: OllamaRequest = {
        model: request.model,
        messages: this.convertMessages(request.messages, request.systemPrompt),
        stream: false,
        options: {
          temperature: request.temperature,
          top_p: request.topP,
          top_k: request.topK,
          num_predict: request.maxTokens,
          stop: request.stop
        }
      };

      const response = await this.makeRequest('/api/chat', ollamaRequest);
      const responseTime = Date.now() - startTime;

      // Estimate token counts (Ollama doesn't always provide exact counts)
      const promptTokens = response.prompt_eval_count || this.estimateTokens(request.messages.map(m => m.content).join(' '));
      const completionTokens = response.eval_count || this.estimateTokens(response.message.content);

      const aiResponse: AIResponse = {
        id: `ollama-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        provider: this.name,
        model: request.model,
        content: response.message.content,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          cost: 0 // Free for local models
        },
        finishReason: 'stop', // Ollama doesn't provide detailed finish reasons
        responseTime,
        timestamp: new Date(),
        metadata: {
          totalDuration: response.total_duration,
          loadDuration: response.load_duration,
          promptEvalDuration: response.prompt_eval_duration,
          evalDuration: response.eval_duration
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
      const ollamaRequest: OllamaRequest = {
        model: request.model,
        messages: this.convertMessages(request.messages, request.systemPrompt),
        stream: true,
        options: {
          temperature: request.temperature,
          top_p: request.topP,
          top_k: request.topK,
          num_predict: request.maxTokens,
          stop: request.stop
        }
      };

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ollamaRequest)
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
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                yield parsed.message.content;
              }
              if (parsed.done) {
                return;
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
      await this.loadAvailableModels();
      return [...this.availableModels];
    } catch (error) {
      // Return cached models if API call fails
      return [...this.availableModels];
    }
  }

  async cleanup(): Promise<void> {
    this.modelCache.clear();
  }

  // Ollama-specific methods
  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: modelName })
      });

      if (!response.ok) {
        throw new ProviderError(`Failed to pull model ${modelName}`, this.name);
      }

      // Refresh available models
      await this.loadAvailableModels();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: modelName })
      });

      if (!response.ok) {
        throw new ProviderError(`Failed to delete model ${modelName}`, this.name);
      }

      // Refresh available models
      await this.loadAvailableModels();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async loadAvailableModels(): Promise<void> {
    try {
      const response = await this.makeRequest('/api/tags', null, 'GET');
      const models = response.models || [];
      
      this.availableModels = models.map((model: OllamaModel) => model.name);
      
      // Cache model details
      for (const model of models) {
        this.modelCache.set(model.name, model);
      }
    } catch (error) {
      // If we can't load models, keep existing cache
      if (this.availableModels.length === 0) {
        throw new ProviderError('Cannot connect to Ollama service', this.name, 'CONNECTION_ERROR');
      }
    }
  }

  private convertMessages(messages: any[], systemPrompt?: string): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const result = [];

    // Add system message first if provided
    if (systemPrompt) {
      result.push({
        role: 'system' as const,
        content: systemPrompt
      });
    }

    // Convert other messages
    for (const msg of messages) {
      if (msg.role === 'system' && !systemPrompt) {
        result.push({
          role: 'system' as const,
          content: msg.content
        });
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        result.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    return result;
  }

  private async makeRequest(endpoint: string, data: any, method: string = 'POST'): Promise<any> {
    const options: RequestInit = {
      method,
      headers: {
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
    
    if (response.status === 404) {
      return new ProviderError('Ollama service not found', this.name, 'SERVICE_NOT_FOUND', 404);
    }

    return new ProviderError(
      text || 'Unknown error',
      this.name,
      'API_ERROR',
      response.status
    );
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  private handleError(error: any): Error {
    if (error instanceof ProviderError) {
      return error;
    }

    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return new ProviderError(
        'Cannot connect to Ollama service. Make sure Ollama is running.',
        this.name,
        'CONNECTION_ERROR'
      );
    }

    return new ProviderError(
      error.message || 'Unknown error occurred',
      this.name,
      'UNKNOWN_ERROR'
    );
  }
}