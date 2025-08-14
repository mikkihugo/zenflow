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
    async stop() {
        logger.info('Stopping MCP interface...');
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        await this.disconnect();
        logger.info('MCP interface stopped');
    }
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
    async listTools() {
        const message = {
            id: `mcp_list_${Date.now()}`,
            method: 'tools/list',
        };
        const response = await this.sendMessage(message);
        return response?.tools?.map((tool) => tool.name) || [];
    }
    async connect() {
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
        logger.debug('Sending MCP message:', message);
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
export function createMCPInterface(config) {
    return new MCPInterface(config);
}
export default MCPInterface;
//# sourceMappingURL=mcp-interface.js.map