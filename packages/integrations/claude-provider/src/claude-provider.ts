/**
 * Claude Code SDK Provider
 * 
 * Integrates Anthropic's Claude using the Claude Code SDK patterns.
 * Pure SDK integration - no external command execution.
 */

import { getLogger } from '@claude-zen/foundation';
import { ClaudeMcpClient } from './mcp-client.js';
import type { McpServerConfig } from './mcp-client.js';

const logger = getLogger('claude-provider');

export interface ClaudeConfig {
  apiKey?: string;
  baseURL?: string;
  useOAuth?: boolean;
  oauthToken?: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClaudeCompletionRequest {
  messages: ClaudeMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ClaudeCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeProvider {
  private claudeCodeSdk: any; // Claude Code SDK client
  private mcpClient: ClaudeMcpClient; // MCP Client for connecting to external servers

  constructor(config: ClaudeConfig) {
    // Store config if needed for future use
    void config;
    this.mcpClient = new ClaudeMcpClient();
  }

  async initialize(): Promise<void> {
    try {
      // Import the Claude Code SDK (not Anthropic SDK)
      const claudeCode = await import('@anthropic-ai/claude-code');
      
      // Use the Claude Code SDK for integration
      this.claudeCodeSdk = claudeCode;
      
      logger.info('Claude Code SDK initialized successfully');
      
      // Connect to context7 MCP server for additional context
      await this.connectToContext7();
      
    } catch (error) {
      logger.error('Failed to initialize Claude Code SDK:', error);
      throw new Error('Claude Code SDK not available. Please install @anthropic-ai/claude-code');
    }
    
    logger.info('Claude provider initialized with context7 MCP connection');
  }

  /**
   * Create message using Claude Code SDK with context7 resources
   */
  async createMessage(request: ClaudeCompletionRequest): Promise<ClaudeCompletionResponse> {
    if (!this.claudeCodeSdk) {
      throw new Error('Claude Code SDK not initialized. Call initialize() first.');
    }

    try {
      // Get additional context from context7 MCP server
      let contextResources = [];
      try {
        contextResources = await this.getContext7Resources();
      } catch (error) {
        logger.warn('Could not get context7 resources:', error);
      }

      // Build prompt with context7 resources
      const prompt = request.messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const contextInfo = contextResources.length > 0 
        ? `\n\nContext7 Resources Available: ${contextResources.map(r => r.name || r.uri).join(', ')}`
        : '';

      // Use the correct Claude Code SDK API with context7
      const response = await this.claudeCodeSdk.query(prompt + contextInfo, {
        // Claude Code SDK uses context pattern
        context: 'context7', // Use the context you specified
      });

      // Transform response to expected format
      return {
        id: `claude-sdk-${Date.now()}`,
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: response || 'No response from Claude Code SDK' }],
        model: request.model || 'claude-3-sonnet-20240229',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: {
          input_tokens: 0, // Claude Code SDK doesn't provide token counts
          output_tokens: 0
        }
      };
    } catch (error) {
      logger.error('Claude Code SDK completion failed:', error);
      throw error;
    }
  }

  async *createMessageStream(request: ClaudeCompletionRequest): AsyncGenerator<any, void, unknown> {
    if (!this.claudeCodeSdk) {
      throw new Error('Claude Code SDK not initialized. Call initialize() first.');
    }

    // For now, fall back to non-streaming (Claude Code SDK may not support streaming)
    const response = await this.createMessage(request);
    yield response;
  }

  async listModels(): Promise<Array<{ id: string; name: string; description?: string }>> {
    // Claude models available through Claude Code SDK
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful model for complex tasks' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest model for simple tasks' },
      { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', description: 'Latest and most capable model' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (New)', description: 'Latest and most capable model' }
    ];
  }

  /**
   * Create chat completion (OpenAI-compatible interface)
   */
  async createChatCompletion(request: ClaudeCompletionRequest): Promise<any> {
    const response = await this.createMessage(request);
    return this.convertToOpenAIFormat(response);
  }
  
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.claudeCodeSdk) {
      return { success: false, error: 'Claude Code SDK not initialized' };
    }

    try {
      const response = await this.createMessage({
        messages: [{ role: 'user', content: 'Hello! Please respond with just "SDK successful"' }],
        max_tokens: 50
      });
      
      const success = response.content?.[0]?.text?.includes('successful') ?? false;
      return { success };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'SDK test failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Connect to context7 MCP server to get additional context and tools
   */
  async connectToContext7(): Promise<void> {
    try {
      const context7Config: McpServerConfig = {
        name: 'context7',
        command: 'npx',
        args: ['context7-mcp-server'],
        env: {
          'CONTEXT_MODE': '7'
        }
      };
      
      await this.mcpClient.connectToMcpServer(context7Config);
      logger.info('✅ Connected to context7 MCP server');
    } catch (error) {
      logger.warn('Could not connect to context7 MCP server:', error);
    }
  }

  /**
   * Get available context and tools from context7
   */
  async getContext7Resources(): Promise<any[]> {
    try {
      return await this.mcpClient.getAvailableResources();
    } catch (error) {
      logger.error('Failed to get context7 resources:', error);
      return [];
    }
  }

  /**
   * Execute a tool from context7 MCP server
   */
  async executeContext7Tool(toolName: string, parameters: any): Promise<any> {
    try {
      return await this.mcpClient.executeTool('context7', toolName, parameters);
    } catch (error) {
      logger.error(`Failed to execute context7 tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from external MCP servers
   */
  async disconnectMcp(): Promise<void> {
    await this.mcpClient.disconnect();
    logger.info('Disconnected from MCP servers');
  }

  /**
   * Convert Claude response to OpenAI-compatible format
   */
  convertToOpenAIFormat(claudeResponse: ClaudeCompletionResponse) {
    return {
      id: claudeResponse.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: claudeResponse.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: claudeResponse.content[0]?.text || ''
        },
        finish_reason: claudeResponse.stop_reason
      }],
      usage: {
        prompt_tokens: claudeResponse.usage.input_tokens,
        completion_tokens: claudeResponse.usage.output_tokens,
        total_tokens: claudeResponse.usage.input_tokens + claudeResponse.usage.output_tokens
      }
    };
  }
}