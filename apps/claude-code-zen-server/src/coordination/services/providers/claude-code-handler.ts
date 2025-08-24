/**
 * @file Claude Code Handler - Programmatic Integration
 *
 * Provides a handler for Claude Code integration that supports the ApiHandler interface.
 * This allows the coordination system to use Claude Code programmatically.
 */

import { getLogger } from '@claude-zen/foundation';

// Type definitions for Claude Code integration
export interface ClaudeCodeModel {
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsCaching: boolean;
  supportsThinking: boolean;
}

export const claudeCodeModels = {
  sonnet: {
    name: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    maxTokens: 8192,
    supportsCaching: true,
    supportsThinking: true,
  },
  haiku: {
    name: 'Claude 3.5 Haiku',
    contextWindow: 200000,
    maxTokens: 8192,
    supportsCaching: true,
    supportsThinking: false,
  },
} as const;

// Message parameter types
export interface MessageParam {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string }>;
}

// API Stream types
export interface ApiStreamTextChunk {
  type: 'text';
  text: string;
}

export interface ApiStreamReasoningChunk {
  type: 'reasoning';
  reasoning: string;
}

export interface ApiStreamUsageChunk {
  type: 'usage';
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalCost?: number;
}

export type ApiStreamChunk =
  | ApiStreamTextChunk
  | ApiStreamReasoningChunk
  | ApiStreamUsageChunk;

export type ApiStream = AsyncGenerator<ApiStreamChunk, void, unknown>;

export interface ModelInfo {
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsCaching: boolean;
  supportsThinking: boolean;
}

export type ClaudeCodeModelId = keyof typeof claudeCodeModels;
export const claudeCodeDefaultModelId: ClaudeCodeModelId = 'sonnet';

// API Handler interface
export interface ApiHandler {
  createMessage(systemPrompt: string, messages: MessageParam[]): ApiStream;
  getModel(): { id: string; info: ModelInfo };
  getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>;
}

interface ClaudeCodeHandlerOptions {
  claudeCodePath?: string;
  apiModelId?: string;
  thinkingBudgetTokens?: number;
  enableTools?: boolean;
  allowedTools?: string[];
  disallowedTools?: string[];
}

/**
 * Retry decorator for robust API handling
 */
export function withRetry(config: {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function* (...args: any[]) {
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

// Mock functions for Claude Code integration
function filterMessagesForClaudeCode(messages: MessageParam[]): MessageParam[] {
  return messages.filter(
    (msg) =>
      typeof msg.content === 'string' ||
      (Array.isArray(msg.content) && msg.content.some((c) => c.type === 'text'))
  );
}

async function executeClaudeTask(prompt: string, options: any): Promise<any[]> {
  // Mock implementation - would integrate with actual Claude Code
  return [
    {
      type: 'assistant',
      message: {
        content: [
          {
            type: 'text',
            text: 'Mock response from Claude Code',
          },
        ],
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          cache_read_input_tokens: 0,
          cache_creation_input_tokens: 0,
        },
      },
    },
  ];
}

/**
 * Claude Code Handler - Programmatic Integration
 */
export class ClaudeCodeHandler implements ApiHandler {
  private options: ClaudeCodeHandlerOptions;
  private logger = getLogger('ClaudeCodeHandler');

  constructor(options: ClaudeCodeHandlerOptions) {
    this.options = options;
  }

  @withRetry({
    maxRetries: 4,
    baseDelay: 2000,
    maxDelay: 15000,
  })
  async *createMessage(
    systemPrompt: string,
    messages: MessageParam[]
  ): ApiStream {
    // Filter out image blocks since Claude Code doesn't support them
    const filteredMessages = filterMessagesForClaudeCode(messages);

    // Create unified prompt from system prompt and messages
    const prompt = [
      systemPrompt,
      ...filteredMessages.map((msg) => {
        if (typeof msg.content === 'string') {
          return `${msg.role}: ${msg.content}`;
        } else {
          const textParts = msg.content
            .filter((c) => c.type === 'text')
            .map((c) => c.text);
          return `${msg.role}: ${textParts.join(' ')}`;
        }
      }),
    ].join('\n\n');

    const claudeOptions = {
      model: this.getModel().id,
      customSystemPrompt: systemPrompt,
      maxThinkingTokens: this.options.thinkingBudgetTokens,
      allowedTools: this.options.enableTools ? this.options.allowedTools : [],
      disallowedTools: this.options.disallowedTools,
      pathToClaudeCodeExecutable: this.options.claudeCodePath,
    };

    // Execute Claude task and convert results to streaming format
    const usage: ApiStreamUsageChunk = {
      type: 'usage',
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    };

    let isPaidUsage = true;
    const claudeMessages = await executeClaudeTask(prompt, claudeOptions);

    for (const chunk of claudeMessages) {
      if (typeof chunk === 'string') {
        yield {
          type: 'text',
          text: chunk,
        } as ApiStreamTextChunk;
        continue;
      }

      if (chunk.type === 'system' && chunk.subtype === 'init') {
        isPaidUsage = chunk.apiKeySource !== 'none';
        continue;
      }

      if (chunk.type === 'assistant' && 'message' in chunk) {
        const message = chunk.message;

        for (const content of message.content) {
          switch (content.type) {
            case 'text':
              yield {
                type: 'text',
                text: content.text,
              } as ApiStreamTextChunk;
              break;
            case 'thinking':
              yield {
                type: 'reasoning',
                reasoning: content.thinking || '',
              } as ApiStreamReasoningChunk;
              break;
            case 'redacted_thinking':
              yield {
                type: 'reasoning',
                reasoning: '[Redacted thinking block]',
              } as ApiStreamReasoningChunk;
              break;
            case 'tool_use':
              this.logger.error(
                'tool_use is not supported yet. Received: ' +
                  JSON.stringify(content)
              );
              break;
          }
        }

        usage.inputTokens += message.usage.input_tokens;
        usage.outputTokens += message.usage.output_tokens;
        usage.cacheReadTokens =
          (usage.cacheReadTokens || 0) +
          (message.usage.cache_read_input_tokens || 0);
        usage.cacheWriteTokens =
          (usage.cacheWriteTokens || 0) +
          (message.usage.cache_creation_input_tokens || 0);
        continue;
      }

      if (chunk.type === 'result' && 'result' in chunk) {
        usage.totalCost = isPaidUsage ? chunk.total_cost_usd : 0;
        yield usage;
      }
    }
  }

  private attemptParse(str: string) {
    try {
      return JSON.parse(str);
    } catch (error) {
      return null;
    }
  }

  getModel() {
    const modelId = this.options.apiModelId;
    if (modelId && modelId in claudeCodeModels) {
      const id = modelId as ClaudeCodeModelId;
      return {
        id,
        info: claudeCodeModels[id],
      };
    }
    return {
      id: claudeCodeDefaultModelId,
      info: claudeCodeModels[claudeCodeDefaultModelId],
    };
  }

  /**
   * Get all available Claude Code models
   */
  getModels() {
    return {
      object: 'list' as const,
      data: Object.entries(claudeCodeModels).map(([id, info]) => ({
        id,
        object: 'model' as const,
        created: Math.floor(Date.now() / 1000),
        owned_by: 'anthropic',
        name: info.name,
        context_window: info.contextWindow,
        max_tokens: info.maxTokens,
        supports_caching: info.supportsCaching,
        supports_thinking: info.supportsThinking,
      })),
    };
  }
}
