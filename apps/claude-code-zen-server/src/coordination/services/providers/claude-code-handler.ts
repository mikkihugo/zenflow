/**
 * Claude Code Handler - Programmatic Integration
 *
 * Based on Cline's ClaudeCodeHandler implementation.
 * Uses runClaudeCode function for streaming responses and proper error handling.
 */

import {
  executeClaudeTask,
  filterMessagesForClaudeCode,
  getLogger,
  type ClaudeSDKOptions,
  type ClaudeMessage
} from '@claude-zen/foundation';

// Simple message types - no external SDK dependency needed
export interface MessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text'; text: string }>;
}

// Stream types (from Cline's stream.ts)
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
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  thoughtsTokenCount?: number;
  totalCost?: number;
}

// Model info types
export interface ModelInfo {
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsCaching?: boolean;
  supportsThinking?: boolean;
}

// Claude Code API types (simplified - versions don't matter)
export const claudeCodeModels = {
  sonnet: {
    name: 'Claude Sonnet',
    contextWindow: 200000,
    maxTokens: 8192,
    supportsCaching: true,
    supportsThinking: true,
  },
  opus: {
    name: 'Claude Opus',
    contextWindow: 200000,
    maxTokens: 4096,
    supportsCaching: true,
    supportsThinking: false,
  },
} as const;

export type ClaudeCodeModelId = keyof typeof claudeCodeModels;
export const claudeCodeDefaultModelId: ClaudeCodeModelId = 'sonnet'; // Use Sonnet as default

// API Handler interface - using our own simple types instead of Anthropic SDK
export interface ApiHandler {
  createMessage(
    systemPrompt: string,
    messages: MessageParam[]
  ): ApiStream;
  getModel(): { id: string; info: ModelInfo };
  getApiStreamUsage?(): Promise<ApiStreamUsageChunk | undefined>;
}

interface ClaudeCodeHandlerOptions {
  claudeCodePath?: string;
  apiModelId?: string;
  thinkingBudgetTokens?: number;
  enableTools?: boolean; // Default false for pure chat
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

// filterMessagesForClaudeCode is now imported from shared SDK integration

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
    messages: Anthropic.Messages.MessageParam[]
  ): ApiStream {
    // Filter out image blocks since Claude Code doesn't support them
    const filteredMessages = filterMessagesForClaudeCode(messages);

    // Create unified prompt from system prompt and messages
    const prompt = [
      systemPrompt,
      ...filteredMessages.map(msg => {
        if (typeof msg.content === 'string') {
          return `${msg.role}: ${msg.content}`;
        } else {
          const textParts = msg.content.filter(c => c.type === 'text').map(c => c.text);
          return `${msg.role}: ${textParts.join(' ')}`;
        }
      })
    ].join('\n\n');

    const claudeOptions: ClaudeSDKOptions = {
      model: this.getModel().id,
      customSystemPrompt: systemPrompt,
      maxThinkingTokens: this.options.thinkingBudgetTokens,
      // Allow tools based on configuration - swarm coordination needs full access
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
        // Based on my tests, subscription usage sets the `apiKeySource` to "none"
        isPaidUsage = chunk.apiKeySource !== 'none';
        continue;
      }

      if (chunk.type === 'assistant' && 'message' in chunk) {
        const message = chunk.message;

        if (message.stop_reason !== null) {
          const content =
            'text' in message.content[0] ? message.content[0] : undefined;

          const isError = content && content.text.startsWith(`API Error`);
          if (isError) {
            // Error messages are formatted as: `API Error: <<status code>> <<json>>`
            const errorMessageStart = content.text.indexOf('{');
            const errorMessage = content.text.slice(errorMessageStart);

            const error = this.attemptParse(errorMessage);
            if (!error) {
              throw new Error(content.text);
            }

            if (error.error.message.includes('Invalid model name')) {
              throw new Error(
                content.text +
                  `\n\nAPI keys and subscription plans allow different models. Make sure the selected model is included in your plan.`
              );
            }

            throw new Error(errorMessage);
          }
        }

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
                `tool_use is not supported yet. Received: ${JSON.stringify(content)}`
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
    } catch (err) {
      return null;
    }
  }

  getModel() {
    const modelId = this.options.apiModelId;
    if (modelId && modelId in claudeCodeModels) {
      const id = modelId as ClaudeCodeModelId;
      return { id, info: claudeCodeModels[id] };
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
