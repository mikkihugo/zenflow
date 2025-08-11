/**
 * @file Mcp-client adapter implementation.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-clients-adapters-mcp-client-adapter');
/**
 * MCP Client Adapter - UACL Implementation.
 *
 * Converts the existing MCP client to implement the UACL IClient interface.
 * Supports both stdio and HTTP MCP protocols with unified configuration.
 */
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { ClientError, ConnectionError, TimeoutError, } from '../core/interfaces.ts';
/**
 * MCP Client Adapter - Implements UACL IClient interface.
 *
 * @example
 */
export class MCPClientAdapter extends EventEmitter {
    config;
    name;
    _mcpConfig;
    _isConnected = false;
    _process;
    _tools = new Map();
    _pendingRequests = new Map();
    // Metrics tracking
    _metrics = {
        name: '',
        requestCount: 0,
        successCount: 0,
        errorCount: 0,
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        throughput: 0,
        timestamp: new Date(),
    };
    _latencyHistory = [];
    _lastMetricsUpdate = Date.now();
    _messageId = 0;
    constructor(config) {
        super();
        this._mcpConfig = { ...config };
        this.config = { ...config };
        this.name = config?.name;
        this._metrics.name = config?.name;
    }
    /**
     * Connect to MCP server.
     */
    async connect() {
        if (this._isConnected) {
            return;
        }
        try {
            if (this._mcpConfig.protocol === 'stdio') {
                await this._connectStdio();
            }
            else if (this._mcpConfig.protocol === 'http') {
                await this._connectHTTP();
            }
            else {
                throw new Error(`Unsupported protocol: ${this._mcpConfig.protocol}`);
            }
            this._isConnected = true;
            // Auto-discover tools if enabled
            if (this._mcpConfig.tools?.discovery !== false) {
                await this._discoverTools();
            }
            this.emit('connect', { client: this.name });
        }
        catch (error) {
            throw new ConnectionError(this.name, error);
        }
    }
    /**
     * Connect via stdio protocol.
     */
    async _connectStdio() {
        if (!this._mcpConfig.command || this._mcpConfig.command.length === 0) {
            throw new Error('Command required for stdio protocol');
        }
        const [command, ...args] = this._mcpConfig.command;
        this._process = spawn(command, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        // Handle process events
        if (this._process) {
            this._process.on('error', (error) => {
                this.emit('error', new ConnectionError(this.name, error));
            });
            this._process.on('exit', (code, signal) => {
                this._isConnected = false;
                this.emit('disconnect', { client: this.name, code, signal });
            });
            // Setup message handling
            if (this._process.stdout) {
                this._process.stdout.on('data', (data) => {
                    this._handleStdioMessage(data.toString());
                });
            }
            if (this._process.stderr) {
                this._process.stderr.on('data', (data) => {
                    logger.warn(`MCP stderr [${this.name}]:`, data.toString());
                });
            }
        }
        // Send initialization message
        await this._sendMessage({
            jsonrpc: '2.0',
            id: this._nextMessageId(),
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                },
                clientInfo: {
                    name: 'claude-zen-mcp-client',
                    version: '1.0.0',
                },
            },
        });
    }
    /**
     * Connect via HTTP protocol.
     */
    async _connectHTTP() {
        if (!this._mcpConfig.url) {
            throw new Error('URL required for HTTP protocol');
        }
        // Test connection with health check
        const response = await fetch(`${this._mcpConfig.url}/health`, {
            method: 'GET',
            headers: this._getAuthHeaders(),
            signal: AbortSignal.timeout(this._mcpConfig.timeout || 10000),
        });
        if (!response?.ok) {
            throw new Error(`HTTP connection failed: ${response?.status} ${response?.statusText}`);
        }
    }
    /**
     * Disconnect from MCP server.
     */
    async disconnect() {
        if (!this._isConnected) {
            return;
        }
        try {
            // Clean up pending requests
            for (const [_id, pending] of this._pendingRequests) {
                clearTimeout(pending.timeout);
                pending.reject(new Error('Client disconnecting'));
            }
            this._pendingRequests.clear();
            if (this._mcpConfig.protocol === 'stdio' && this._process) {
                // Send shutdown notification
                try {
                    await this._sendMessage({
                        jsonrpc: '2.0',
                        method: 'notifications/shutdown',
                    });
                }
                catch {
                    // Ignore errors during shutdown
                }
                // Kill process
                this._process.kill(this._mcpConfig.stdio?.killSignal || 'SIGTERM');
                // Force kill if not terminated within timeout
                const killTimeout = this._mcpConfig.stdio?.killTimeout || 5000;
                setTimeout(() => {
                    if (this._process && !this._process.killed) {
                        this._process.kill('SIGKILL');
                    }
                }, killTimeout);
            }
            this._isConnected = false;
            this.emit('disconnect', { client: this.name });
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Check if connected.
     */
    isConnected() {
        return this._isConnected;
    }
    /**
     * Perform health check.
     */
    async healthCheck() {
        const startTime = Date.now();
        let status = 'unhealthy';
        let responseTime = 0;
        try {
            if (this._mcpConfig.protocol === 'stdio') {
                // Send ping message for stdio
                await this._sendMessage({
                    jsonrpc: '2.0',
                    id: this._nextMessageId(),
                    method: 'ping',
                });
                status = 'healthy';
            }
            else {
                // HTTP health check
                const response = await fetch(`${this._mcpConfig.url}/health`, {
                    signal: AbortSignal.timeout(this._mcpConfig.health?.timeout || 5000),
                });
                status = response?.ok ? 'healthy' : 'degraded';
            }
            responseTime = Date.now() - startTime;
        }
        catch (_error) {
            status = 'unhealthy';
            responseTime = Date.now() - startTime;
        }
        return {
            name: this.name,
            status,
            lastCheck: new Date(),
            responseTime,
            errorRate: this._calculateErrorRate(),
            uptime: Date.now() - this._lastMetricsUpdate,
            metadata: {
                protocol: this._mcpConfig.protocol,
                toolCount: this._tools.size,
                processId: this._process?.pid,
            },
        };
    }
    /**
     * Get performance metrics.
     */
    async getMetrics() {
        this._updateMetrics();
        return { ...this._metrics };
    }
    /**
     * Execute MCP tool (mapped to POST request).
     *
     * @param toolName
     * @param parameters
     * @param options
     */
    async post(toolName, parameters, options) {
        const startTime = Date.now();
        try {
            const tool = this._tools.get(toolName);
            if (!tool) {
                throw new Error(`Tool not found: ${toolName}`);
            }
            const result = await this._executeToolCall(toolName, parameters || {}, options);
            const responseTime = Date.now() - startTime;
            this._recordLatency(responseTime);
            this._metrics.successCount++;
            this._metrics.requestCount++;
            return {
                data: result,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: options || {},
                timestamp: new Date(),
                metadata: {
                    tool: toolName,
                    responseTime,
                    protocol: this._mcpConfig.protocol,
                },
            };
        }
        catch (error) {
            this._metrics.errorCount++;
            this._metrics.requestCount++;
            throw error;
        }
    }
    /**
     * Get available tools (mapped to GET request).
     *
     * @param endpoint
     * @param options
     */
    async get(endpoint, options) {
        if (endpoint === '/tools') {
            const tools = Array.from(this._tools.values());
            return {
                data: tools,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: options || {},
                timestamp: new Date(),
                metadata: { endpoint },
            };
        }
        if (endpoint === '/status') {
            const status = await this.healthCheck();
            return {
                data: status,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: options || {},
                timestamp: new Date(),
                metadata: { endpoint },
            };
        }
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
    /**
     * Not supported for MCP - throws error.
     */
    async put() {
        throw new Error('PUT not supported for MCP client');
    }
    /**
     * Not supported for MCP - throws error.
     */
    async delete() {
        throw new Error('DELETE not supported for MCP client');
    }
    /**
     * Update configuration.
     *
     * @param config
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        Object.assign(this._mcpConfig, config);
    }
    /**
     * Cleanup and destroy client.
     */
    async destroy() {
        await this.disconnect();
        this.removeAllListeners();
    }
    /**
     * Execute MCP tool call.
     *
     * @param toolName
     * @param parameters
     * @param options
     */
    async _executeToolCall(toolName, parameters, options) {
        const message = {
            jsonrpc: '2.0',
            id: this._nextMessageId(),
            method: 'tools/call',
            params: {
                name: toolName,
                arguments: parameters,
            },
        };
        const timeout = options?.timeout || this._mcpConfig.tools?.timeout || 30000;
        return this._sendMessage(message, timeout);
    }
    /**
     * Discover available tools from server.
     */
    async _discoverTools() {
        try {
            const response = await this._sendMessage({
                jsonrpc: '2.0',
                id: this._nextMessageId(),
                method: 'tools/list',
            });
            if (response?.tools) {
                this._tools.clear();
                for (const tool of response?.tools) {
                    this._tools.set(tool.name, tool);
                }
            }
        }
        catch (error) {
            logger.warn(`Failed to discover tools for ${this.name}:`, error);
        }
    }
    /**
     * Send message to MCP server.
     *
     * @param message
     * @param timeout
     */
    async _sendMessage(message, timeout = 30000) {
        if (!this._isConnected) {
            throw new ConnectionError(this.name);
        }
        if (this._mcpConfig.protocol === 'stdio') {
            return this._sendStdioMessage(message, timeout);
        }
        else {
            return this._sendHTTPMessage(message, timeout);
        }
    }
    /**
     * Send message via stdio.
     *
     * @param message
     * @param timeout
     */
    async _sendStdioMessage(message, timeout) {
        return new Promise((resolve, reject) => {
            if (!this._process?.stdin) {
                reject(new Error('Process stdin not available'));
                return;
            }
            const messageStr = `${JSON.stringify(message)}\n`;
            if (message.id !== undefined) {
                // Setup response handler
                const timeoutHandle = setTimeout(() => {
                    this._pendingRequests.delete(message.id);
                    reject(new TimeoutError(this.name, timeout));
                }, timeout);
                this._pendingRequests.set(message.id, {
                    resolve,
                    reject,
                    timeout: timeoutHandle,
                });
            }
            this._process.stdin.write(messageStr, (error) => {
                if (error) {
                    if (message.id !== undefined) {
                        this._pendingRequests.delete(message.id);
                    }
                    reject(new ClientError('Failed to send message', 'SEND_ERROR', this.name));
                }
                else if (message.id === undefined) {
                    // Notification - resolve immediately
                    resolve(undefined);
                }
            });
        });
    }
    /**
     * Send message via HTTP.
     *
     * @param message
     * @param timeout
     */
    async _sendHTTPMessage(message, timeout) {
        const response = await fetch(`${this._mcpConfig.url}/mcp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this._getAuthHeaders(),
            },
            body: JSON.stringify(message),
            signal: AbortSignal.timeout(timeout),
        });
        if (!response?.ok) {
            throw new ClientError(`HTTP request failed: ${response?.status} ${response?.statusText}`, 'HTTP_ERROR', this.name);
        }
        const result = await response?.json();
        if (result?.error) {
            throw new ClientError(`MCP error: ${result?.error?.message}`, 'MCP_ERROR', this.name);
        }
        return result?.result;
    }
    /**
     * Handle stdio messages.
     *
     * @param data
     */
    _handleStdioMessage(data) {
        const lines = data.trim().split('\n');
        for (const line of lines) {
            if (!line.trim())
                continue;
            try {
                const message = JSON.parse(line);
                if (message.id !== undefined && this._pendingRequests.has(message.id)) {
                    const pending = this._pendingRequests.get(message.id);
                    this._pendingRequests.delete(message.id);
                    clearTimeout(pending.timeout);
                    if (message.error) {
                        pending.reject(new ClientError(`MCP error: ${message.error.message}`, 'MCP_ERROR', this.name));
                    }
                    else {
                        pending.resolve(message.result);
                    }
                }
            }
            catch (error) {
                logger.warn(`Failed to parse MCP message [${this.name}]: ${line}`, error);
            }
        }
    }
    /**
     * Get authentication headers for HTTP.
     */
    _getAuthHeaders() {
        const headers = {};
        if (this._mcpConfig.authentication) {
            switch (this._mcpConfig.authentication.type) {
                case 'bearer':
                    if (this._mcpConfig.authentication.token) {
                        headers['Authorization'] = `Bearer ${this._mcpConfig.authentication.token}`;
                    }
                    break;
                case 'basic':
                    if (this._mcpConfig.authentication.username && this._mcpConfig.authentication.password) {
                        const credentials = btoa(`${this._mcpConfig.authentication.username}:${this._mcpConfig.authentication.password}`);
                        headers['Authorization'] = `Basic ${credentials}`;
                    }
                    break;
                case 'apikey':
                    if (this._mcpConfig.authentication.apiKey) {
                        const headerName = this._mcpConfig.authentication.apiKeyHeader || 'X-API-Key';
                        headers[headerName] = this._mcpConfig.authentication.apiKey;
                    }
                    break;
            }
        }
        return headers;
    }
    /**
     * Generate next message ID.
     */
    _nextMessageId() {
        return ++this._messageId;
    }
    /**
     * Record latency for metrics.
     *
     * @param latency
     */
    _recordLatency(latency) {
        this._latencyHistory.push(latency);
        // Keep only last 1000 measurements
        if (this._latencyHistory.length > 1000) {
            this._latencyHistory = this._latencyHistory.slice(-1000);
        }
    }
    /**
     * Calculate error rate.
     */
    _calculateErrorRate() {
        if (this._metrics.requestCount === 0)
            return 0;
        return this._metrics.errorCount / this._metrics.requestCount;
    }
    /**
     * Update metrics.
     */
    _updateMetrics() {
        const now = Date.now();
        const timeDiff = (now - this._lastMetricsUpdate) / 1000; // seconds
        // Calculate throughput
        this._metrics.throughput = timeDiff > 0 ? this._metrics.requestCount / timeDiff : 0;
        // Calculate latencies
        if (this._latencyHistory.length > 0) {
            const sorted = [...this._latencyHistory].sort((a, b) => a - b);
            this._metrics.averageLatency = sorted.reduce((a, b) => a + b) / sorted.length;
            this._metrics.p95Latency = sorted[Math.floor(sorted.length * 0.95)] || 0;
            this._metrics.p99Latency = sorted[Math.floor(sorted.length * 0.99)] || 0;
        }
        this._metrics.timestamp = new Date();
        this._lastMetricsUpdate = now;
    }
}
/**
 * MCP Client Factory - Creates and manages MCP clients.
 *
 * @example
 */
export class MCPClientFactory {
    _clients = new Map();
    /**
     * Create new MCP client.
     *
     * @param config
     */
    async create(config) {
        const client = new MCPClientAdapter(config);
        this._clients.set(config?.name, client);
        return client;
    }
    /**
     * Create multiple MCP clients.
     *
     * @param configs
     */
    async createMultiple(configs) {
        const clients = [];
        for (const config of configs) {
            const client = await this.create(config);
            clients.push(client);
        }
        return clients;
    }
    /**
     * Get client by name.
     *
     * @param name
     */
    get(name) {
        return this._clients.get(name);
    }
    /**
     * List all clients.
     */
    list() {
        return Array.from(this._clients.values());
    }
    /**
     * Check if client exists.
     *
     * @param name
     */
    has(name) {
        return this._clients.has(name);
    }
    /**
     * Remove client.
     *
     * @param name
     */
    async remove(name) {
        const client = this._clients.get(name);
        if (!client)
            return false;
        await client.destroy();
        return this._clients.delete(name);
    }
    /**
     * Health check all clients.
     */
    async healthCheckAll() {
        const results = new Map();
        for (const [name, client] of this._clients) {
            try {
                const status = await client.healthCheck();
                results?.set(name, status);
            }
            catch (error) {
                results?.set(name, {
                    name,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    responseTime: 0,
                    errorRate: 1,
                    uptime: 0,
                    metadata: { error: error.message },
                });
            }
        }
        return results;
    }
    /**
     * Get metrics for all clients.
     */
    async getMetricsAll() {
        const results = new Map();
        for (const [name, client] of this._clients) {
            try {
                const metrics = await client.getMetrics();
                results?.set(name, metrics);
            }
            catch (error) {
                // Skip failed metrics
                logger.warn(`Failed to get metrics for ${name}:`, error);
            }
        }
        return results;
    }
    /**
     * Shutdown all clients.
     */
    async shutdown() {
        const shutdownPromises = Array.from(this._clients.values()).map((client) => client
            .destroy()
            .catch((error) => logger.warn(`Error shutting down client ${client.name}:`, error)));
        await Promise.all(shutdownPromises);
        this._clients.clear();
    }
    /**
     * Get active client count.
     */
    getActiveCount() {
        return this._clients.size;
    }
}
/**
 * Helper function to create MCP client configurations from legacy format.
 *
 * @param name
 * @param legacyConfig
 * @param legacyConfig.url
 * @param legacyConfig.type
 * @param legacyConfig.command
 * @param legacyConfig.timeout
 * @param legacyConfig.capabilities
 * @example
 */
export function createMCPConfigFromLegacy(name, legacyConfig) {
    const protocol = legacyConfig?.command ? 'stdio' : 'http';
    return {
        name,
        baseURL: legacyConfig?.url || '',
        protocol,
        command: legacyConfig?.command || undefined,
        url: legacyConfig?.url || undefined,
        timeout: legacyConfig?.timeout || 30000,
        authentication: { type: 'custom' },
        tools: {
            timeout: 30000,
            retries: 3,
            discovery: true,
        },
        server: {
            name,
            version: '1.0.0',
            capabilities: legacyConfig?.capabilities || [],
        },
        stdio: {
            encoding: 'utf8',
            killSignal: 'SIGTERM',
            killTimeout: 5000,
        },
        monitoring: {
            enabled: true,
            metricsInterval: 60000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
        },
    };
}
