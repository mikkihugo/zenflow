/**
 * MCP Interface.
 *
 * Claude Desktop remote interface for coordinating with MCP tools.
 * Handles communication with Claude Code via MCP protocol.
 */
/**
 * @file Interface implementation: mcp-interface
 */



import { EventEmitter } from 'node:events';
import { createLogger } from './mcp-logger';

const logger = createLogger('MCPInterface');

export interface MCPInterfaceConfig {
  serverUrl?: string;
  toolPrefix?: string;
  reconnectInterval?: number;
  maxRetries?: number;
}

export interface MCPMessage {
  id: string;
  method: string;
  params?: any;
  result?: any;
  error?: any;
}

export class MCPInterface extends EventEmitter {
  private config: MCPInterfaceConfig;
  private isConnected: boolean = false;
  private reconnectTimer?: NodeJS.Timeout;
  private retryCount: number = 0;

  constructor(config: MCPInterfaceConfig = {}) {
    super();
    this.config = {
      serverUrl: 'stdio',
      toolPrefix: 'mcp__claude-zen__',
      reconnectInterval: 5000,
      maxRetries: 3,
      ...config,
    };
  }

  /**
   * Initialize MCP connection.
   */
  async start(): Promise<void> {
    logger.info('Starting MCP interface...');

    try {
      await this.connect();
      this.setupEventHandlers();
      logger.info('MCP interface started successfully');
    } catch (error) {
      logger.error('Failed to start MCP interface:', error);
      throw error;
    }
  }

  /**
   * Stop MCP interface.
   */
  async stop(): Promise<void> {
    logger.info('Stopping MCP interface...');

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    await this.disconnect();
    logger.info('MCP interface stopped');
  }

  /**
   * Send tool call to Claude Code via MCP.
   *
   * @param name
   * @param args
   */
  async callTool(name: string, args: any): Promise<any> {
    const toolName = `${this.config.toolPrefix}${name}`;

    logger.debug(`Calling MCP tool: ${toolName}`, args);

    const message: MCPMessage = {
      id: `mcp_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    return await this.sendMessage(message);
  }

  /**
   * List available MCP tools.
   */
  async listTools(): Promise<string[]> {
    const message: MCPMessage = {
      id: `mcp_list_${Date.now()}`,
      method: 'tools/list',
    };

    const response = await this.sendMessage(message);
    return response?.tools?.map((tool: any) => tool.name) || [];
  }

  private async connect(): Promise<void> {
    // MCP connection logic - stdio or server-based
    this.isConnected = true;
    this.retryCount = 0;
    this.emit('connected');
  }

  private async disconnect(): Promise<void> {
    this.isConnected = false;
    this.emit('disconnected');
  }

  private async sendMessage(message: MCPMessage): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MCP interface not connected');
    }

    // Send message via MCP protocol
    logger.debug('Sending MCP message:', message);

    // Simulate response for now
    return {
      id: message.id,
      result: { success: true },
    };
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      logger.error('MCP interface error:', error);
      this.handleReconnect();
    });
  }

  private handleReconnect(): void {
    if (this.retryCount >= (this.config.maxRetries || 3)) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.retryCount++;
    this.reconnectTimer = setTimeout(() => {
      logger.info(`Attempting to reconnect (${this.retryCount}/${this.config.maxRetries})...`);
      this.connect().catch(() => this.handleReconnect());
    }, this.config.reconnectInterval);
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

/**
 * Create and configure MCP interface instance.
 *
 * @param config
 */
export function createMCPInterface(config?: MCPInterfaceConfig): MCPInterface {
  return new MCPInterface(config);
}

export default MCPInterface;
