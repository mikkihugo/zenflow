/**
 * MCP Interface.
 *
 * Claude Desktop remote interface for coordinating with MCP tools.
 * Handles communication with Claude Code via MCP protocol.
 */
/**
 * @file Interface implementation: mcp-interface.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('MCPInterface');
export class MCPInterface extends EventEmitter {
    config;
    isConnected = false;
    reconnectTimer;
    retryCount = 0;
    constructor(config = {}) {
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
    async start() {
        logger.info('Starting MCP interface...');
        try {
            await this.connect();
            this.setupEventHandlers();
            logger.info('MCP interface started successfully');
        }
        catch (error) {
            logger.error('Failed to start MCP interface:', error);
            throw error;
        }
    }
    /**
     * Stop MCP interface.
     */
    async stop() {
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
    async callTool(name, args) {
        const toolName = `${this.config.toolPrefix}${name}`;
        logger.debug(`Calling MCP tool: ${toolName}`, args);
        const message = {
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
    async listTools() {
        const message = {
            id: `mcp_list_${Date.now()}`,
            method: 'tools/list',
        };
        const response = await this.sendMessage(message);
        return response?.tools?.map((tool) => tool.name) || [];
    }
    async connect() {
        // MCP connection logic - stdio or server-based
        this.isConnected = true;
        this.retryCount = 0;
        this.emit('connected');
    }
    async disconnect() {
        this.isConnected = false;
        this.emit('disconnected');
    }
    async sendMessage(message) {
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
    setupEventHandlers() {
        this.on('error', (error) => {
            logger.error('MCP interface error:', error);
            this.handleReconnect();
        });
    }
    handleReconnect() {
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
    get connected() {
        return this.isConnected;
    }
}
/**
 * Create and configure MCP interface instance.
 *
 * @param config
 * @example
 */
export function createMCPInterface(config) {
    return new MCPInterface(config);
}
export default MCPInterface;
