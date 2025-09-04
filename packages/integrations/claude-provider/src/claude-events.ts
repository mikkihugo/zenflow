/**
 * Claude Provider Event Bus Integration
 * 
 * Event-driven interface for Claude Code SDK with context7 MCP integration
 */

import { EventBus, getLogger } from '@claude-zen/foundation';
import { ClaudeProvider, type ClaudeCompletionRequest } from './claude-provider.js';

const logger = getLogger('claude-events');

export interface ClaudeRequest {
  correlationId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ClaudeResponse {
  correlationId: string;
  text?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ClaudeStreamChunk {
  correlationId: string;
  text: string;
  done: boolean;
  error?: string;
}

export async function registerClaudeHandlers(bus = EventBus.getInstance()) {
  const providerCache = new Map<string, Promise<ClaudeProvider>>();

  async function getProvider(config?: any): Promise<ClaudeProvider> {
    const cacheKey = JSON.stringify(config || { default: true });
    
    if (!providerCache.has(cacheKey)) {
      const providerPromise = (async () => {
        const provider = new ClaudeProvider({
          useOAuth: true,
          ...config
        });
        await provider.initialize();
        return provider;
      })();
      providerCache.set(cacheKey, providerPromise);
    }
    return providerCache.get(cacheKey)!;
  }

  // Claude chat completion (non-stream)
  bus.on('llm:claude:chat:request', async (request: unknown) => {
    const req = request as ClaudeRequest;
    if (req.stream) {
      // Handle streaming
      try {
        const provider = await getProvider();
        const streamRequest: ClaudeCompletionRequest = {
          messages: req.messages,
          ...(req.model ? { model: req.model } : {}),
          ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
          ...(req.max_tokens !== undefined ? { max_tokens: req.max_tokens } : {}),
          stream: true
        };

        const stream = provider.createMessageStream(streamRequest);
        for await (const chunk of stream) {
          const msg: ClaudeStreamChunk = {
            correlationId: req.correlationId,
            text: chunk.content?.[0]?.text || '',
            done: false,
          };
          bus.emit('llm:claude:chat:stream:chunk', msg);
        }
        
        const finalMsg: ClaudeStreamChunk = { 
          correlationId: req.correlationId, 
          text: '', 
          done: true 
        };
        bus.emit('llm:claude:chat:stream:chunk', finalMsg);
      } catch (error) {
        logger.error('Claude chat stream error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg: ClaudeStreamChunk = {
          correlationId: req.correlationId,
          text: '',
          done: true,
          error: errorMessage,
        };
        bus.emit('llm:claude:chat:stream:chunk', errorMsg);
      }
    } else {
      // Handle non-streaming
      try {
        const provider = await getProvider();
        const chatRequest: ClaudeCompletionRequest = {
          messages: req.messages,
          ...(req.model ? { model: req.model } : {}),
          ...(req.temperature !== undefined ? { temperature: req.temperature } : {}),
          ...(req.max_tokens !== undefined ? { max_tokens: req.max_tokens } : {}),
          stream: false
        };

        const response = await provider.createChatCompletion(chatRequest);
        const msg: ClaudeResponse = { 
          correlationId: req.correlationId, 
          text: response.choices[0]?.message?.content || '',
          usage: response.usage
        };
        bus.emit('llm:claude:chat:response', msg);
      } catch (error) {
        logger.error('Claude chat error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const msg: ClaudeResponse = { 
          correlationId: req.correlationId, 
          error: errorMessage 
        };
        bus.emit('llm:claude:chat:response', msg);
      }
    }
  });

  // Claude context7 tools execution
  bus.on('llm:claude:context7:tool:request', async (request: unknown) => {
    const req = request as {
      correlationId: string;
      toolName: string;
      parameters: any;
    };
    try {
      const provider = await getProvider();
      const result = await provider.executeContext7Tool(req.toolName, req.parameters);
      bus.emit('llm:claude:context7:tool:response', {
        correlationId: req.correlationId,
        result
      });
    } catch (error) {
      logger.error('Claude context7 tool error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      bus.emit('llm:claude:context7:tool:response', {
        correlationId: req.correlationId,
        error: errorMessage
      });
    }
  });

  // Claude context7 resources
  bus.on('llm:claude:context7:resources:request', async (request: unknown) => {
    const req = request as {
      correlationId: string;
    };
    try {
      const provider = await getProvider();
      const resources = await provider.getContext7Resources();
      bus.emit('llm:claude:context7:resources:response', {
        correlationId: req.correlationId,
        resources
      });
    } catch (error) {
      logger.error('Claude context7 resources error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      bus.emit('llm:claude:context7:resources:response', {
        correlationId: req.correlationId,
        error: errorMessage
      });
    }
  });

  logger.info('Claude EventBus handlers registered');
}