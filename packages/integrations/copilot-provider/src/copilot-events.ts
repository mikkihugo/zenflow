/**
 * Copilot Provider Event Bus Integration
 * 
 * Event-driven interface for GitHub Copilot with VS Code OAuth support
 */

import { EventBus, getLogger } from '@claude-zen/foundation';

const logger = getLogger('copilot-events');

export interface CopilotRequest {
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

export interface CopilotResponse {
  correlationId: string;
  text?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CopilotStreamChunk {
  correlationId: string;
  text: string;
  done: boolean;
  error?: string;
}

export async function registerCopilotHandlers(bus = EventBus.getInstance()) {
  const clientCache = new Map<string, Promise<any>>();

  async function getClient(token?: string): Promise<any> {
    const cacheKey = token || 'default';
    
    if (!clientCache.has(cacheKey)) {
      const clientPromise = (async () => {
        // Import Copilot components
        const { CopilotChatClient } = await import('./copilot-chat-client.js');
        const { CopilotAuth } = await import('./copilot-auth.js');
        
        let githubToken = token;
        if (!githubToken) {
          // Use OAuth to get token
          const auth = new CopilotAuth();
          githubToken = await auth.authenticate();
        }
        
        const client = new CopilotChatClient(githubToken);
        
        // Test connection
        const test = await client.testConnection();
        if (!test.success) {
          throw new Error(`Copilot authentication failed: ${test.error}`);
        }
        
        return client;
      })();
      clientCache.set(cacheKey, clientPromise);
    }
    return clientCache.get(cacheKey)!;
  }

  // Copilot chat completion
  bus.on('llm:copilot:chat:request', async (request: unknown) => {
    const req = request as CopilotRequest;
    if (req.stream) {
      // Handle streaming
      try {
        const client = await getClient();
        const stream = await client.createChatCompletionStream({
          messages: req.messages,
          model: req.model,
          temperature: req.temperature,
          max_tokens: req.max_tokens
        });

        for await (const chunk of stream) {
          const msg: CopilotStreamChunk = {
            correlationId: req.correlationId,
            text: chunk.choices?.[0]?.delta?.content || '',
            done: false,
          };
          bus.emit('llm:copilot:chat:stream:chunk', msg);
        }
        
        const finalMsg: CopilotStreamChunk = { 
          correlationId: req.correlationId, 
          text: '', 
          done: true 
        };
        bus.emit('llm:copilot:chat:stream:chunk', finalMsg);
      } catch (error) {
        logger.error('Copilot chat stream error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg: CopilotStreamChunk = {
          correlationId: req.correlationId,
          text: '',
          done: true,
          error: errorMessage,
        };
        bus.emit('llm:copilot:chat:stream:chunk', errorMsg);
      }
    } else {
      // Handle non-streaming
      try {
        const client = await getClient();
        const response = await client.createChatCompletion({
          messages: req.messages,
          model: req.model,
          temperature: req.temperature,
          max_tokens: req.max_tokens
        });

        const msg: CopilotResponse = { 
          correlationId: req.correlationId, 
          text: response.choices[0]?.message?.content || '',
          usage: response.usage
        };
        bus.emit('llm:copilot:chat:response', msg);
      } catch (error) {
        logger.error('Copilot chat error', { error });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const msg: CopilotResponse = { 
          correlationId: req.correlationId, 
          error: errorMessage 
        };
        bus.emit('llm:copilot:chat:response', msg);
      }
    }
  });

  // Copilot models listing
  bus.on('llm:copilot:models:request', async (request: unknown) => {
    const req = request as {
      correlationId: string;
    };
    try {
      const client = await getClient();
      const models = await client.listModels();
      bus.emit('llm:copilot:models:response', {
        correlationId: req.correlationId,
        models
      });
    } catch (error) {
      logger.error('Copilot models error', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      bus.emit('llm:copilot:models:response', {
        correlationId: req.correlationId,
        error: errorMessage
      });
    }
  });

  logger.info('Copilot EventBus handlers registered');
}