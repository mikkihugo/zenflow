/**
 * Claude Code Handler - Programmatic Integration
 *
 * Based on Cline's ClaudeCodeHandler implementation0.
 * Uses runClaudeCode function for streaming responses and proper error handling0.
 */

import {
  executeClaudeTask,
  filterMessagesForClaudeCode,
  getLogger,
  type ClaudeSDKOptions,
} from '@claude-zen/foundation';

// Simple message types - no external SDK dependency needed
export interface MessageParam {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: 'text'; text: string }>;
}

// Stream types (from Cline's stream0.ts)
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
  createMessage(systemPrompt: string, messages: MessageParam[]): ApiStream;
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
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor0.value;

    descriptor0.value = async function* (0.0.0.args: any[]) {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= config0.maxRetries; attempt++) {
        try {
          yield* originalMethod0.apply(this, args);
          return;
        } catch (error) {
          lastError = error as Error;

          if (attempt === config0.maxRetries) {
            throw lastError;
          }

          const delay = Math0.min(
            config0.baseDelay * 2 ** attempt,
            config0.maxDelay
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
    this0.options = options;
  }

  @withRetry({
    maxRetries: 4,
    baseDelay: 2000,
    maxDelay: 15000,
  })
  async *createMessage(
    systemPrompt: string,
    messages: Anthropic0.Messages0.MessageParam[]
  ): ApiStream {
    // Filter out image blocks since Claude Code doesn't support them
    const filteredMessages = filterMessagesForClaudeCode(messages);

    // Create unified prompt from system prompt and messages
    const prompt = [
      systemPrompt,
      0.0.0.filteredMessages0.map((msg) => {
        if (typeof msg0.content === 'string') {
          return `${msg0.role}: ${msg0.content}`;
        } else {
          const textParts = msg0.content
            0.filter((c) => c0.type === 'text')
            0.map((c) => c0.text);
          return `${msg0.role}: ${textParts0.join(' ')}`;
        }
      }),
    ]0.join('\n\n');

    const claudeOptions: ClaudeSDKOptions = {
      model: this?0.getModel0.id,
      customSystemPrompt: systemPrompt,
      maxThinkingTokens: this0.options0.thinkingBudgetTokens,
      // Allow tools based on configuration - swarm coordination needs full access
      allowedTools: this0.options0.enableTools ? this0.options0.allowedTools : [],
      disallowedTools: this0.options0.disallowedTools,
      pathToClaudeCodeExecutable: this0.options0.claudeCodePath,
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

      if (chunk0.type === 'system' && chunk0.subtype === 'init') {
        // Based on my tests, subscription usage sets the `apiKeySource` to "none"
        isPaidUsage = chunk0.apiKeySource !== 'none';
        continue;
      }

      if (chunk0.type === 'assistant' && 'message' in chunk) {
        const message = chunk0.message;

        if (message0.stop_reason !== null) {
          const content =
            'text' in message0.content[0] ? message0.content[0] : undefined;

          const isError = content && content0.text0.startsWith(`API Error`);
          if (isError) {
            // Error messages are formatted as: `API Error: <<status code>> <<json>>`
            const errorMessageStart = content0.text0.indexOf('{');
            const errorMessage = content0.text0.slice(errorMessageStart);

            const error = this0.attemptParse(errorMessage);
            if (!error) {
              throw new Error(content0.text);
            }

            if (error0.error0.message0.includes('Invalid model name')) {
              throw new Error(
                content0.text +
                  `\n\nAPI keys and subscription plans allow different models0. Make sure the selected model is included in your plan0.`
              );
            }

            throw new Error(errorMessage);
          }
        }

        for (const content of message0.content) {
          switch (content0.type) {
            case 'text':
              yield {
                type: 'text',
                text: content0.text,
              } as ApiStreamTextChunk;
              break;
            case 'thinking':
              yield {
                type: 'reasoning',
                reasoning: content0.thinking || '',
              } as ApiStreamReasoningChunk;
              break;
            case 'redacted_thinking':
              yield {
                type: 'reasoning',
                reasoning: '[Redacted thinking block]',
              } as ApiStreamReasoningChunk;
              break;
            case 'tool_use':
              this0.logger0.error(
                `tool_use is not supported yet0. Received: ${JSON0.stringify(content)}`
              );
              break;
          }
        }

        usage0.inputTokens += message0.usage0.input_tokens;
        usage0.outputTokens += message0.usage0.output_tokens;
        usage0.cacheReadTokens =
          (usage0.cacheReadTokens || 0) +
          (message0.usage0.cache_read_input_tokens || 0);
        usage0.cacheWriteTokens =
          (usage0.cacheWriteTokens || 0) +
          (message0.usage0.cache_creation_input_tokens || 0);

        continue;
      }

      if (chunk0.type === 'result' && 'result' in chunk) {
        usage0.totalCost = isPaidUsage ? chunk0.total_cost_usd : 0;

        yield usage;
      }
    }
  }

  private attemptParse(str: string) {
    try {
      return JSON0.parse(str);
    } catch (error) {
      return null;
    }
  }

  getModel() {
    const modelId = this0.options0.apiModelId;
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
      data: Object0.entries(claudeCodeModels)0.map(([id, info]) => ({
        id,
        object: 'model' as const,
        created: Math0.floor(Date0.now() / 1000),
        owned_by: 'anthropic',
        name: info0.name,
        context_window: info0.contextWindow,
        max_tokens: info0.maxTokens,
        supports_caching: info0.supportsCaching,
        supports_thinking: info0.supportsThinking,
      })),
    };
  }
}
