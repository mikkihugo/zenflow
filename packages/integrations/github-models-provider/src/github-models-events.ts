/**
 * GitHub Models Provider Event Bus Integration
 * 
 * Event-driven interface for GitHub Models API
 */

import { EventBus, getLogger } from '@claude-zen/foundation';

const logger = getLogger('github-models-events');

export interface GitHubModelsRequest {
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

export interface GitHubModelsResponse {
  correlationId: string;
  text?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GitHubModelsStreamChunk {
  correlationId: string;
  text: string;
  done: boolean;
  error?: string;
}

export async function registerGitHubModelsHandlers(bus = EventBus.getInstance()) {
  const providerCache = new Map<string, Promise<any>>();

  async function getProvider(token?: string): Promise<any> {
    const cacheKey = token || 'default';
    
    if (!providerCache.has(cacheKey)) {
      const providerPromise = (async () => {
        const { GitHubModelsProvider } = await import('./github-models-provider.js');
        
        const provider = new GitHubModelsProvider({ 
          token,
          autoInitialize: !!token 
        });
        
        if (token) {
          await provider.initialize();
        }
        
        return provider;
      })();
      providerCache.set(cacheKey, providerPromise);
    }
    return providerCache.get(cacheKey)!;
  }

  // GitHub Models chat completion
  bus.on('llm:github-models:chat:request', async (request: GitHubModelsRequest) => {
    if (request.stream) {
      // Handle streaming
      try {
        const provider = await getProvider();
        const stream = await provider.createChatCompletionStream({
          messages: request.messages,
          model: request.model || 'gpt-4o-mini',
          temperature: request.temperature,
          max_tokens: request.max_tokens
        });

        for await (const chunk of stream) {
          const msg: GitHubModelsStreamChunk = {
            correlationId: request.correlationId,
            text: chunk.choices?.[0]?.delta?.content || '',
            done: false,
          };
          bus.emit('llm:github-models:chat:stream:chunk', msg);
        }
        
        const finalMsg: GitHubModelsStreamChunk = { 
          correlationId: request.correlationId, 
          text: '', 
          done: true 
        };
        bus.emit('llm:github-models:chat:stream:chunk', finalMsg);
      } catch (error) {
        logger.error('GitHub Models chat stream error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg: GitHubModelsStreamChunk = {
          correlationId: request.correlationId,
          text: '',
          done: true,
          error: errorMessage,
        };
        bus.emit('llm:github-models:chat:stream:chunk', errorMsg);
      }
    } else {
      // Handle non-streaming
      try {
        const provider = await getProvider();
        const response = await provider.createChatCompletion({
          messages: request.messages,
          model: request.model || 'gpt-4o-mini',
          temperature: request.temperature,
          max_tokens: request.max_tokens
        });

        const msg: GitHubModelsResponse = { 
          correlationId: request.correlationId, 
          text: response.choices[0]?.message?.content || '',
          usage: response.usage
        };
        bus.emit('llm:github-models:chat:response', msg);
      } catch (error) {
        logger.error('GitHub Models chat error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const msg: GitHubModelsResponse = { 
          correlationId: request.correlationId, 
          error: errorMessage 
        };
        bus.emit('llm:github-models:chat:response', msg);
      }
    }
  });

  // GitHub Models listing
  bus.on('llm:github-models:models:request', async (request: {
    correlationId: string;
  }) => {
    try {
      const provider = await getProvider();
      const models = await provider.listModels();
      bus.emit('llm:github-models:models:response', {
        correlationId: request.correlationId,
        models
      });
    } catch (error) {
      logger.error('GitHub Models list error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      bus.emit('llm:github-models:models:response', {
        correlationId: request.correlationId,
        error: errorMessage
      });
    }
  });

  logger.info('GitHub Models EventBus handlers registered');
}