"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTransport = void 0;
/**
 * HTTP transport for MCP
 */
const express_1 = require("express");
const node_http_1 = require("node:http");
const ws_1 = require("ws");
const cors_1 = require("cors");
const helmet_1 = require("helmet");
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const errors_js_1 = require("../../utils/errors.js");
/**
 * HTTP transport implementation
 */
class HttpTransport {
    constructor(host, port, tlsEnabled, logger, config) {
        this.host = host;
        this.port = port;
        this.tlsEnabled = tlsEnabled;
        this.logger = logger;
        this.config = config;
        this.messageCount = 0;
        this.notificationCount = 0;
        this.running = false;
        this.connections = new Set();
        this.activeWebSockets = new Set();
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    async start() {
        if (this.running) {
            throw new errors_js_1.MCPTransportError('Transport already running');
        }
        this.logger.info('Starting HTTP transport', {
            host: this.host,
            port: this.port,
            tls: this.tlsEnabled,
        });
        try {
            // Create HTTP server
            this.server = (0, node_http_1.createServer)(this.app);
            // Create WebSocket server
            this.wss = new ws_1.WebSocketServer({
                server: this.server,
                path: '/ws'
            });
            this.setupWebSocketHandlers();
            // Start server
            await new Promise((resolve, reject) => {
                this.server.listen(this.port, this.host, () => {
                    this.logger.info(`HTTP server listening on ${this.host}:${this.port}`);
                    resolve();
                });
                this.server.on('error', reject);
            });
            this.running = true;
            this.logger.info('HTTP transport started');
        }
        catch (error) {
            throw new errors_js_1.MCPTransportError('Failed to start HTTP transport', { error });
        }
    }
    async stop() {
        if (!this.running) {
            return;
        }
        this.logger.info('Stopping HTTP transport');
        this.running = false;
        // Close all WebSocket connections
        for (const ws of this.activeWebSockets) {
            try {
                ws.close();
            }
            catch {
                // Ignore errors
            }
        }
        this.activeWebSockets.clear();
        this.connections.clear();
        // Close WebSocket server
        if (this.wss) {
            this.wss.close();
            this.wss = undefined;
        }
        // Shutdown HTTP server
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(() => resolve());
            });
            this.server = undefined;
        }
        this.logger.info('HTTP transport stopped');
    }
    onRequest(handler) {
        this.requestHandler = handler;
    }
    onNotification(handler) {
        this.notificationHandler = handler;
    }
    async getHealthStatus() {
        return {
            healthy: this.running,
            metrics: {
                messagesReceived: this.messageCount,
                notificationsSent: this.notificationCount,
                activeConnections: this.connections.size,
                activeWebSockets: this.activeWebSockets.size,
            },
        };
    }
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS middleware
        if (this.config?.corsEnabled) {
            const origins = this.config.corsOrigins || ['*'];
            this.app.use((0, cors_1.default)({
                origin: origins,
                credentials: true,
                maxAge: 86400, // 24 hours
            }));
        }
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.text());
    }
    setupRoutes() {
        // Get current file directory for static files
        const __filename = typeof import.meta?.url !== 'undefined'
            ? (0, node_url_1.fileURLToPath)(import.meta.url)
            : __filename || __dirname + '/http.ts';
        const __dirname = (0, node_path_1.dirname)(__filename);
        const consoleDir = (0, node_path_1.join)(__dirname, '../../ui/console');
        // Serve static files for the web console
        this.app.use('/console', express_1.default.static(consoleDir));
        // Web console route
        this.app.get('/', (req, res) => {
            res.redirect('/console');
        });
        this.app.get('/console', (req, res) => {
            res.sendFile((0, node_path_1.join)(consoleDir, 'index.html'));
        });
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        // MCP JSON-RPC endpoint
        this.app.post('/rpc', async (req, res) => {
            await this.handleJsonRpcRequest(req, res);
        });
        // Handle preflight requests
        this.app.options('*', (req, res) => {
            res.status(204).end();
        });
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });
        // Error handler
        this.app.use((err, req, res, next) => {
            this.logger.error('Express error', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        });
    }
    setupWebSocketHandlers() {
        if (!this.wss)
            return;
        this.wss.on('connection', (ws, req) => {
            this.activeWebSockets.add(ws);
            this.logger.info('WebSocket client connected', {
                totalClients: this.activeWebSockets.size,
            });
            ws.on('close', () => {
                this.activeWebSockets.delete(ws);
                this.logger.info('WebSocket client disconnected', {
                    totalClients: this.activeWebSockets.size,
                });
            });
            ws.on('error', (error) => {
                this.logger.error('WebSocket error', error);
                this.activeWebSockets.delete(ws);
            });
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.id === undefined) {
                        // Notification from client
                        await this.handleNotificationMessage(message);
                    }
                    else {
                        // Request from client
                        const response = await this.handleRequestMessage(message);
                        ws.send(JSON.stringify(response));
                    }
                }
                catch (error) {
                    this.logger.error('Error processing WebSocket message', error);
                    // Send error response if it was a request
                    try {
                        const parsed = JSON.parse(data.toString());
                        if (parsed.id !== undefined) {
                            ws.send(JSON.stringify({
                                jsonrpc: '2.0',
                                id: parsed.id,
                                error: {
                                    code: -32603,
                                    message: 'Internal error',
                                },
                            }));
                        }
                    }
                    catch {
                        // Ignore parse errors for error responses
                    }
                }
            });
        });
    }
    async handleJsonRpcRequest(req, res) {
        // Check content type
        if (!req.is('application/json')) {
            res.status(400).json({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32600,
                    message: 'Invalid content type - expected application/json',
                },
            });
            return;
        }
        // Check authorization if authentication is enabled
        if (this.config?.auth?.enabled) {
            const authResult = await this.validateAuth(req);
            if (!authResult.valid) {
                res.status(401).json({
                    error: authResult.error || 'Unauthorized'
                });
                return;
            }
        }
        try {
            const mcpMessage = req.body;
            // Validate JSON-RPC format
            if (!mcpMessage.jsonrpc || mcpMessage.jsonrpc !== '2.0') {
                res.status(400).json({
                    jsonrpc: '2.0',
                    id: mcpMessage.id || null,
                    error: {
                        code: -32600,
                        message: 'Invalid request - missing or invalid jsonrpc version',
                    },
                });
                return;
            }
            if (!mcpMessage.method) {
                res.status(400).json({
                    jsonrpc: '2.0',
                    id: mcpMessage.id || null,
                    error: {
                        code: -32600,
                        message: 'Invalid request - missing method',
                    },
                });
                return;
            }
            this.messageCount++;
            // Check if this is a notification (no id) or request
            if (mcpMessage.id === undefined) {
                // Handle notification
                await this.handleNotificationMessage(mcpMessage);
                // Notifications don't get responses
                res.status(204).end();
            }
            else {
                // Handle request
                const response = await this.handleRequestMessage(mcpMessage);
                res.json(response);
            }
        }
        catch (error) {
            this.logger.error('Error handling JSON-RPC request', error);
            res.status(500).json({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: error instanceof Error ? error.message : String(error),
                },
            });
        }
    }
    async handleRequestMessage(request) {
        if (!this.requestHandler) {
            return {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                    code: -32603,
                    message: 'No request handler registered',
                },
            };
        }
        try {
            return await this.requestHandler(request);
        }
        catch (error) {
            this.logger.error('Request handler error', { request, error });
            return {
                jsonrpc: '2.0',
                id: request.id,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: error instanceof Error ? error.message : String(error),
                },
            };
        }
    }
    async handleNotificationMessage(notification) {
        if (!this.notificationHandler) {
            this.logger.warn('Received notification but no handler registered', {
                method: notification.method,
            });
            return;
        }
        try {
            await this.notificationHandler(notification);
        }
        catch (error) {
            this.logger.error('Notification handler error', { notification, error });
            // Notifications don't send error responses
        }
    }
    async validateAuth(req) {
        const auth = req.headers.authorization;
        if (!auth) {
            return { valid: false, error: 'Authorization header required' };
        }
        // Extract token from Authorization header
        const tokenMatch = auth.match(/^Bearer\s+(.+)$/i);
        if (!tokenMatch) {
            return { valid: false, error: 'Invalid authorization format - use Bearer token' };
        }
        const token = tokenMatch[1];
        // Validate against configured tokens
        if (this.config?.auth?.tokens && this.config.auth.tokens.length > 0) {
            const isValid = this.config.auth.tokens.includes(token);
            if (!isValid) {
                return { valid: false, error: 'Invalid token' };
            }
        }
        return { valid: true };
    }
    async connect() {
        // For HTTP transport, connect is handled by start()
        if (!this.running) {
            await this.start();
        }
    }
    async disconnect() {
        // For HTTP transport, disconnect is handled by stop()
        await this.stop();
    }
    async sendRequest(request) {
        // HTTP transport is server-side, it doesn't send requests
        throw new Error('HTTP transport does not support sending requests');
    }
    async sendNotification(notification) {
        // Broadcast notification to all connected WebSocket clients
        const message = JSON.stringify(notification);
        for (const ws of this.activeWebSockets) {
            try {
                if (ws.readyState === ws_1.WebSocket.OPEN) {
                    ws.send(message);
                }
            }
            catch (error) {
                this.logger.error('Failed to send notification to WebSocket', error);
            }
        }
        this.notificationCount++;
    }
}
exports.HttpTransport = HttpTransport;
