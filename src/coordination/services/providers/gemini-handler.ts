/**
 * Gemini Handler - Direct API Integration
 *
 * Uses @google/genai SDK directly with OAuth credentials from ~/.gemini/oauth_creds.json
 * Provides streaming responses and structured output support.
 */

import type { Anthropic } from '@anthropic-ai/sdk';
import {
  type GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

// Stream types (matching ClaudeCodeHandler)
export type ApiStream = AsyncGenerator<ApiStreamChunk>;

export interface ApiStreamChunk {
  type: 'text' | 'reasoning' | 'usage';
}

export interface ApiStreamTextChunk extends ApiStreamChunk {
  type: 'text';
  text: string;
}

export interface ApiStreamReasoningChunk extends ApiStreamChunk {
  type: 'reasoning';
  reasoning: string;
}

export interface ApiStreamUsageChunk extends ApiStreamChunk {
  type: 'usage';
  inputTokens: number;
  outputTokens: number;
  totalCost?: number;
}

// Model info types
export interface ModelInfo {
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsStreaming?: boolean;
  supportsJson?: boolean;
}

// Gemini models available
export const geminiModels = {
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    contextWindow: 1000000, // 1M tokens
    maxTokens: 8192,
    supportsStreaming: true,
    supportsJson: true,
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    contextWindow: 1000000, // 1M tokens
    maxTokens: 8192,
    supportsStreaming: true,
    supportsJson: true,
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    contextWindow: 2000000, // 2M tokens
    maxTokens: 8192,
    supportsStreaming: true,
    supportsJson: true,
  },
} as const;

export type GeminiModelId = keyof typeof geminiModels;
export const geminiDefaultModelId: GeminiModelId = 'gemini-2.5-flash'; // Fast and efficient

// API Handler interface
export interface ApiHandler {
  createMessage(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[]
  ): ApiStream;
  getModel(): { id: string; info: ModelInfo };
  getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>;
}

// OAuth credentials structure (from Gemini CLI)
interface GeminiOAuthCredentials {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  scope: string;
  expiry_date?: number;
  id_token?: string;
}

interface GeminiHandlerOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  enableJson?: boolean;
  // Environment-based configuration
  useVertexAI?: boolean;
  apiKey?: string;
  projectId?: string;
  location?: string;
}

/**
 * Retry decorator for robust API handling
 */
export function withRetry(config: {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}) {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function* (...args: unknown[]) {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
          yield* originalMethod.apply(this, args);
          return;
        } catch (error) {
          lastError = error as Error;

          if (attempt === config.maxRetries) {
            throw lastError;
          }

          // Check if we should retry (rate limits, server errors)
          const shouldRetry =
            error instanceof Error &&
            (error.message.includes('429') ||
              error.message.includes('5') ||
              error.message.includes('quota'));

          if (!shouldRetry) {
            throw lastError;
          }

          const delay = Math.min(
            config.baseDelay * 2 ** attempt,
            config.maxDelay
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

/**
 * Convert Anthropic messages to Gemini format
 */
function convertMessagesToGemini(
  systemPrompt: string,
  messages: Anthropic.Messages.MessageParam[]
) {
  const contents = [];

  // Add system prompt as first user message if provided
  if (systemPrompt.trim()) {
    contents.push({
      role: 'user',
      parts: [
        {
          text: `System: ${systemPrompt}\n\nPlease follow the above system instructions for all responses.`,
        },
      ],
    });

    // Add a brief model acknowledgment
    contents.push({
      role: 'model',
      parts: [
        { text: 'I understand. I will follow those system instructions.' },
      ],
    });
  }

  // Convert messages
  for (const message of messages) {
    const role = message.role === 'assistant' ? 'model' : 'user';

    let text = '';
    if (typeof message.content === 'string') {
      text = message.content;
    } else if (Array.isArray(message.content)) {
      // Extract text from content blocks, skip images
      text = message.content
        .filter((c: unknown) => c.type === 'text')
        .map((c: unknown) => (c as any).text)
        .join('\n');
    }

    if (text.trim()) {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  return contents;
}

/**
 * Gemini Handler - Direct API Integration
 */
export class GeminiHandler implements ApiHandler {
  private genai: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private options: GeminiHandlerOptions;

  constructor(options: GeminiHandlerOptions = {}) {
    this.options = {
      modelId: options.modelId || geminiDefaultModelId,
      temperature: options.temperature || 0.1,
      maxTokens: options.maxTokens || 8192,
      enableJson: options.enableJson,
    };
  }

  /**
   * Load OAuth credentials from Gemini CLI
   */
  private async loadCredentials(): Promise<GeminiOAuthCredentials> {
    try {
      const credPath = join(homedir(), '.gemini', 'oauth_creds.json');
      const credData = await readFile(credPath, 'utf-8');
      return JSON.parse(credData) as GeminiOAuthCredentials;
    } catch (error) {
      throw new Error(
        `Failed to load Gemini credentials: ${error instanceof Error ? error.message : error}\n` +
          'Run "gemini" CLI first to authenticate with Google.'
      );
    }
  }

  /**
   * Initialize Gemini client with flexible authentication
   */
  private async initializeClient() {
    if (this.genai && this.model) return;

    let apiKey: string;

    // Determine authentication method
    if (this.options.apiKey) {
      // Direct API key provided in options
      apiKey = this.options.apiKey;
    } else if (process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
      // Environment variable API key
      apiKey =
        process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '';
    } else if (process.env.GEMINI_API_KEY) {
      // Gemini-specific environment variable
      apiKey = process.env.GEMINI_API_KEY;
    } else {
      // Fall back to OAuth credentials from Gemini CLI
      const creds = await this.loadCredentials();

      // Check if token is expired
      if (creds.expiry_date && Date.now() > creds.expiry_date) {
        throw new Error(
          'Gemini OAuth token has expired. Run "gemini" CLI to refresh authentication.'
        );
      }

      apiKey = creds.access_token;
    }

    // Initialize GoogleGenerativeAI
    this.genai = new GoogleGenerativeAI(apiKey);

    // Create generative model
    this.model = this.genai.getGenerativeModel({
      model: this.options.modelId || geminiDefaultModelId,
      generationConfig: {
        temperature: this.options.temperature,
        maxOutputTokens: this.options.maxTokens,
        ...(this.options.enableJson && {
          responseMimeType: 'application/json',
        }),
      },
    });
  }

  @withRetry({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  })
  async *createMessage(
    systemPrompt: string,
    messages: Anthropic.Messages.MessageParam[]
  ): ApiStream {
    await this.initializeClient();

    if (!this.model) {
      throw new Error('Failed to initialize Gemini model');
    }

    const contents = convertMessagesToGemini(systemPrompt, messages);

    try {
      // Use streaming API
      const result = await this.model.generateContentStream({ contents });

      let fullText = '';
      let inputTokens = 0;
      let outputTokens = 0;

      for await (const chunk of result.stream) {
        const text = chunk.text();

        if (text) {
          fullText += text;
          yield {
            type: 'text',
            text: text,
          } as ApiStreamTextChunk;
        }
      }

      // Get final response for usage data
      const response = await result.response;

      // Calculate approximate token usage (Gemini doesn't provide exact counts in streaming)
      inputTokens = Math.ceil(
        contents.reduce((acc, c) => acc + (c.parts[0].text?.length || 0), 0) / 4
      );
      outputTokens = Math.ceil(fullText.length / 4);

      yield {
        type: 'usage',
        inputTokens,
        outputTokens,
        totalCost: 0, // Gemini CLI is free tier
      } as ApiStreamUsageChunk;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Handle common Gemini errors
      if (errorMessage.includes('API_KEY_INVALID')) {
        throw new Error(
          'Gemini authentication failed. Run "gemini" CLI to re-authenticate.'
        );
      }

      if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error(
          'Gemini rate limit exceeded. Please wait a moment before retrying.'
        );
      }

      if (errorMessage.includes('QUOTA_EXCEEDED')) {
        throw new Error(
          'Gemini quota exceeded. You may have hit daily limits.'
        );
      }

      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }

  getModel() {
    const modelId = this.options.modelId || geminiDefaultModelId;
    return {
      id: modelId,
      info: geminiModels[modelId as GeminiModelId],
    };
  }

  /**
   * Get all available Gemini models
   */
  getModels() {
    return {
      object: 'list' as const,
      data: Object.entries(geminiModels).map(([id, info]) => ({
        id,
        object: 'model' as const,
        created: Math.floor(Date.now() / 1000),
        owned_by: 'google',
        name: info.name,
        context_window: info.contextWindow,
        max_tokens: info.maxTokens,
        supports_streaming: info.supportsStreaming,
        supports_json: info.supportsJson,
      })),
    };
  }

  /**
   * Test connection and authentication
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.initializeClient();

      if (!this.model) return false;

      // Test with a simple prompt
      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Say "test successful" and nothing else.' }],
          },
        ],
      });

      const text = result.response.text();
      return text.toLowerCase().includes('test successful');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}
