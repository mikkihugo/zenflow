/**
 * Google Vertex AI Provider Implementation
 * Integration with Google's Gemini models via Vertex AI
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

interface GoogleRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface GoogleResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: 'model';
    };
    finishReason: 'FINISH_REASON_STOP' | 'FINISH_REASON_MAX_TOKENS' | 'FINISH_REASON_SAFETY' | 'FINISH_REASON_RECITATION';
    index: number;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleProvider extends BaseProvider {
  name = 'google';
  version = '2024-07-29';
  
  config: ProviderConfig = {
    enabled: true,
    priority: 4,
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
    embeddings: true,
    contextWindow: 1000000, // Gemini Pro has 1M context
    maxTokens: 8192,
    supportedLanguages: [
      'javascript', 'typescript', 'python', 'java', 'cpp', 'rust', 
      'go', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'sql',
      'html', 'css', 'xml', 'json', 'yaml', 'markdown'
    ]
  };

  private apiKey: string;
  private projectId: string;
  private location: string = 'us-central1';
  private baseUrl: string;
  private availableModels: string[] = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-1.0-pro-vision'
  ];

  constructor() {
    super();
    this.pricing = {
      inputTokenPrice: 0.00125,  // $1.25 per 1M tokens for Gemini Pro
      outputTokenPrice: 0.00375, // $3.75 per 1M tokens for Gemini Pro
      currency: 'USD'
    };
  }

  async initialize(config: any): Promise<void> {
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
    this.projectId = config.projectId || process.env.GOOGLE_PROJECT_ID;
    
    if (!this.apiKey) {
      throw new ProviderError('Google API key is required', this.name, 'MISSING_API_KEY');
    }
    
    if (!this.projectId) {
      throw new ProviderError('Google Project ID is required', this.name, 'MISSING_PROJECT_ID');
    }

    this.location = config.location || this.location;
    this.baseUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models`;

    this.config = { ...this.config, ...config };
    await this.healthCheck();
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    this.validateRequest(request);
    this.emitRequest(request);

    try {
      const googleRequest: GoogleRequest = {
        contents: this.convertMessages(request.messages),
        generationConfig: {
          temperature: request.temperature,
          topP: request.topP,
          topK: request.topK,
          maxOutputTokens: request.maxTokens,
          stopSequences: request.stop
        }
      };

      // Add system instruction if provided
      if (request.systemPrompt) {
        googleRequest.systemInstruction = {
          parts: [{ text: request.systemPrompt }]
        };
      }

      const response = await this.makeRequest(
        `/${request.model}:generateContent`,
        googleRequest
      );
      
      const responseTime = Date.now() - startTime;

      if (!response.candidates || response.candidates.length === 0) {
        throw new ProviderError('No response generated', this.name, 'NO_RESPONSE');
      }

      const candidate = response.candidates[0];
      const content = candidate.content.parts.map(p => p.text).join('');

      const aiResponse: AIResponse = {
        id: `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        provider: this.name,
        model: request.model,
        content,
        usage: {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
          cost: this.calculateCost({
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount
          })
        },
        finishReason: this.mapFinishReason(candidate.finishReason),
        responseTime,
        timestamp: new Date(),
        metadata: {
          candidateIndex: candidate.index
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
      const googleRequest: GoogleRequest = {
        contents: this.convertMessages(request.messages),
        generationConfig: {
          temperature: request.temperature,
          topP: request.topP,
          topK: request.topK,
          maxOutputTokens: request.maxTokens,
          stopSequences: request.stop
        }
      };

      if (request.systemPrompt) {
        googleRequest.systemInstruction = {
          parts: [{ text: request.systemPrompt }]
        };
      }

      const response = await fetch(
        `${this.baseUrl}/${request.model}:streamGenerateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(googleRequest)
        }
      );

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
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.candidates && parsed.candidates[0]?.content?.parts) {
                for (const part of parsed.candidates[0].content.parts) {
                  if (part.text) {
                    yield part.text;
                  }
                }
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

  private convertMessages(messages: any[]): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    const result = [];
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        // System messages are handled separately in Google's API
        continue;
      }
      
      result.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }
    
    return result;
  }

  private async makeRequest(endpoint: string, data: any): Promise<GoogleResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
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
      errorData.error?.code || 'API_ERROR',
      response.status
    );
  }

  private mapFinishReason(reason: string): AIResponse['finishReason'] {
    switch (reason) {
      case 'FINISH_REASON_STOP': return 'stop';
      case 'FINISH_REASON_MAX_TOKENS': return 'length';
      case 'FINISH_REASON_SAFETY': return 'content_filter';
      case 'FINISH_REASON_RECITATION': return 'content_filter';
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