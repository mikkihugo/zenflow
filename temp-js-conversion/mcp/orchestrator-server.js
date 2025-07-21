"use strict";
/**
 * MCP (Model Context Protocol) Orchestrator Server Implementation
 * CLI-integrated server with full Claude Flow orchestration capabilities
 * Uses official TypeScript SDK with OAuth2 support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = exports.MCPOrchestratorServer = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const zod_1 = require("zod");
const node_crypto_1 = require("node:crypto");
const express_1 = require("express");
const cors_1 = require("cors");
const node_os_1 = require("node:os");
const node_perf_hooks_1 = require("node:perf_hooks");
const claude_flow_tools_js_1 = require("./claude-flow-tools.js");
const swarm_tools_js_1 = require("./swarm-tools.js");
const ruv_swarm_tools_js_1 = require("./ruv-swarm-tools.js");
// OAuth2 support
const oauth2_server_1 = require("@node-oauth/oauth2-server");
const { Request: OAuth2Request, Response: OAuth2Response } = oauth2_server_1.default;
/**
 * MCP Orchestrator Server with full Claude Flow integration
 */
class MCPOrchestratorServer {
    constructor(config, eventBus, logger, orchestrator, swarmCoordinator, agentManager, resourceManager, messagebus, monitor) {
        this.config = config;
        this.eventBus = eventBus;
        this.logger = logger;
        this.orchestrator = orchestrator;
        this.swarmCoordinator = swarmCoordinator;
        this.agentManager = agentManager;
        this.resourceManager = resourceManager;
        this.messagebus = messagebus;
        this.monitor = monitor;
        this.running = false;
        this.requestCount = 0;
        this.startTime = Date.now();
        this.serverInfo = {
            name: 'Claude-Flow MCP Orchestrator',
            version: '2.0.0-alpha.61',
        };
        this.sessionId = `orchestrator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Initialize MCP Server with official SDK
        this.server = new mcp_js_1.McpServer({
            name: this.serverInfo.name,
            version: this.serverInfo.version
        });
        // Initialize OAuth2 if enabled
        if (this.config.auth?.enabled && this.config.auth.method === 'oauth2') {
            this.initializeOAuth2();
        }
        this.initializeServer();
    }
    initializeOAuth2() {
        if (!this.config.auth?.oauth2) {
            this.logger.warn('OAuth2 enabled but no OAuth2 configuration provided');
            return;
        }
        // Simple in-memory model for OAuth2 (production should use persistent storage)
        const oauth2Model = {
            async getAccessToken(accessToken) {
                // In production, query from database
                return {
                    accessToken,
                    accessTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour
                    client: { id: this.config.auth.oauth2.clientId },
                    user: { id: 'system' }
                };
            },
            async getClient(clientId, clientSecret) {
                const oauth2Config = this.config.auth.oauth2;
                if (clientId === oauth2Config.clientId &&
                    (!clientSecret || clientSecret === oauth2Config.clientSecret)) {
                    return {
                        id: clientId,
                        redirectUris: [oauth2Config.redirectUri],
                        grants: ['authorization_code', 'client_credentials', 'refresh_token']
                    };
                }
                return null;
            },
            async saveToken(token, client, user) {
                // In production, save to database
                return {
                    accessToken: token.accessToken,
                    accessTokenExpiresAt: token.accessTokenExpiresAt,
                    refreshToken: token.refreshToken,
                    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                    client,
                    user
                };
            },
            async getAuthorizationCode(authorizationCode) {
                // In production, query from database
                return null;
            },
            async saveAuthorizationCode(code, client, user) {
                // In production, save to database
                return code;
            },
            async revokeAuthorizationCode(code) {
                // In production, delete from database
                return true;
            },
            async revokeToken(token) {
                // In production, delete from database
                return true;
            }
        };
        this.oauth2Server = new oauth2_server_1.default({
            model: oauth2Model,
            accessTokenLifetime: 3600, // 1 hour
            refreshTokenLifetime: 1209600, // 2 weeks
            allowBearerTokensInQueryString: true
        });
        this.logger.info('OAuth2 server initialized', {
            clientId: this.config.auth.oauth2.clientId,
            redirectUri: this.config.auth.oauth2.redirectUri
        });
    }
    initializeServer() {
        // Register system tools
        this.registerSystemTools();
        // Register orchestration tools if available
        if (this.orchestrator) {
            this.registerOrchestrationTools();
        }
        // Register swarm tools if available
        if (this.swarmCoordinator || this.agentManager) {
            this.registerSwarmTools();
        }
        // Register ruv-swarm tools if available
        this.registerRuvSwarmTools();
    }
    registerSystemTools() {
        // System information tool
        this.server.registerTool("system_info", {
            title: "System Information",
            description: "Get system information",
            inputSchema: {}
        }, async () => ({
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        version: this.serverInfo.version,
                        platform: (0, node_os_1.platform)(),
                        arch: (0, node_os_1.arch)(),
                        runtime: 'Node.js',
                        uptime: node_perf_hooks_1.performance.now(),
                        sessionId: this.sessionId
                    }, null, 2)
                }]
        }));
        // Health check tool
        this.server.registerTool("health_check", {
            title: "Health Check",
            description: "Get system health status",
            inputSchema: {}
        }, async () => {
            const health = await this.getHealthStatus();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(health, null, 2)
                    }]
            };
        });
        // List tools
        this.server.registerTool("list_tools", {
            title: "List Tools",
            description: "List all available tools",
            inputSchema: {}
        }, async () => {
            // This would need to be implemented based on the official SDK's tool listing
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            tools: ["system_info", "health_check", "list_tools"],
                            count: 3
                        }, null, 2)
                    }]
            };
        });
    }
    registerOrchestrationTools() {
        if (!this.orchestrator)
            return;
        const claudeFlowTools = (0, claude_flow_tools_js_1.createClaudeFlowTools)(this.logger);
        for (const tool of claudeFlowTools) {
            this.server.registerTool(tool.name, {
                title: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema || {}
            }, async (input) => {
                const claudeFlowContext = {
                    orchestrator: this.orchestrator,
                };
                const result = await tool.handler(input, claudeFlowContext);
                return {
                    content: [{
                            type: "text",
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                        }]
                };
            });
        }
        this.logger.info('Registered Claude-Flow orchestration tools', { count: claudeFlowTools.length });
    }
    registerSwarmTools() {
        if (!this.swarmCoordinator && !this.agentManager)
            return;
        const swarmTools = (0, swarm_tools_js_1.createSwarmTools)(this.logger);
        for (const tool of swarmTools) {
            this.server.registerTool(tool.name, {
                title: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema || {}
            }, async (input) => {
                const swarmContext = {
                    swarmCoordinator: this.swarmCoordinator,
                    agentManager: this.agentManager,
                    resourceManager: this.resourceManager,
                    messageBus: this.messagebus,
                    monitor: this.monitor,
                };
                const result = await tool.handler(input, swarmContext);
                return {
                    content: [{
                            type: "text",
                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                        }]
                };
            });
        }
        this.logger.info('Registered Swarm coordination tools', { count: swarmTools.length });
    }
    async registerRuvSwarmTools() {
        try {
            const available = await (0, ruv_swarm_tools_js_1.isRuvSwarmAvailable)(this.logger);
            if (!available) {
                this.logger.info('ruv-swarm not available - skipping ruv-swarm tools registration');
                return;
            }
            const workingDirectory = process.cwd();
            const integration = await (0, ruv_swarm_tools_js_1.initializeRuvSwarmIntegration)(workingDirectory, this.logger);
            if (!integration.success) {
                this.logger.warn('Failed to initialize ruv-swarm integration', { error: integration.error });
                return;
            }
            const ruvSwarmTools = (0, ruv_swarm_tools_js_1.createRuvSwarmTools)(this.logger);
            for (const tool of ruvSwarmTools) {
                this.server.registerTool(tool.name, {
                    title: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema || {}
                }, async (input) => {
                    const ruvSwarmContext = {
                        workingDirectory,
                        sessionId: this.sessionId,
                        swarmId: process.env.CLAUDE_SWARM_ID || `orchestrator-swarm-${Date.now()}`
                    };
                    const result = await tool.handler(input, ruvSwarmContext);
                    return {
                        content: [{
                                type: "text",
                                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                            }]
                    };
                });
            }
            this.logger.info('Registered ruv-swarm tools', {
                count: ruvSwarmTools.length,
                integration: integration.data
            });
        }
        catch (error) {
            this.logger.error('Error registering ruv-swarm tools', error);
        }
    }
    async start() {
        if (this.running) {
            throw new Error('MCP Orchestrator server already running');
        }
        this.logger.info('Starting MCP Orchestrator server', {
            transport: this.config.transport,
            remoteUrl: this.config.remoteUrl,
            auth: this.config.auth?.enabled ? this.config.auth.method : 'disabled'
        });
        try {
            // If remoteUrl is provided, start as a bridge client
            if (this.config.remoteUrl) {
                await this.startBridge();
            }
            else {
                // Normal server startup
                if (this.config.transport === 'stdio') {
                    await this.startStdio();
                }
                else if (this.config.transport === 'http') {
                    await this.startHttp();
                }
                else if (this.config.transport === 'sse') {
                    await this.startSSE();
                }
                else if (this.config.transport === 'websocket') {
                    await this.startWebSocket();
                }
                else {
                    throw new Error(`Unknown transport type: ${this.config.transport}`);
                }
            }
            this.running = true;
            this.logger.info('MCP Orchestrator server started successfully');
        }
        catch (error) {
            this.logger.error('Failed to start MCP Orchestrator server', error);
            throw error;
        }
    }
    async stop() {
        if (!this.running) {
            return;
        }
        this.logger.info('Stopping MCP Orchestrator server');
        try {
            // The official SDK handles cleanup automatically
            this.running = false;
            this.logger.info('MCP Orchestrator server stopped');
        }
        catch (error) {
            this.logger.error('Error stopping MCP Orchestrator server', error);
            throw error;
        }
    }
    async startBridge() {
        if (!this.config.remoteUrl) {
            throw new Error('Remote URL is required for bridge mode');
        }
        this.logger.info('Starting MCP bridge client', {
            remoteUrl: this.config.remoteUrl,
            auth: this.config.auth?.enabled ? this.config.auth.method : 'disabled'
        });
        try {
            // For now, we'll create a simple bridge that connects to the remote server
            // and exposes it via stdio for Claude.ai
            // Create a bridge server that will proxy requests to the remote server
            const bridgeServer = new mcp_js_1.McpServer({
                name: 'claude-flow-bridge',
                version: this.serverInfo.version
            });
            // Register a bridge tool that forwards requests to the remote server
            bridgeServer.registerTool("bridge_request", {
                title: "Bridge Request",
                description: "Bridge requests to remote MCP server",
                inputSchema: {
                    method: zod_1.z.string().describe("MCP method"),
                    params: zod_1.z.any().optional().describe("Method parameters")
                }
            }, async ({ method, params }) => {
                try {
                    // Make HTTP request to remote server
                    const response = await fetch(this.config.remoteUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(this.config.auth?.token && { 'Authorization': `Bearer ${this.config.auth.token}` })
                        },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: Date.now(),
                            method,
                            params
                        })
                    });
                    const result = await response.json();
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify(result, null, 2)
                            }]
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: {
                                        code: -32603,
                                        message: `Bridge error: ${error instanceof Error ? error.message : 'Unknown error'}`
                                    }
                                }, null, 2)
                            }]
                    };
                }
            });
            // Start stdio transport for Claude.ai
            const transport = new stdio_js_1.StdioServerTransport();
            await bridgeServer.connect(transport);
            this.logger.info('MCP bridge client connected via stdio');
        }
        catch (error) {
            this.logger.error('Failed to start MCP bridge client', error);
            throw error;
        }
    }
    async startStdio() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        this.logger.info('MCP Orchestrator server connected via stdio');
    }
    async startHttp() {
        const app = (0, express_1.default)();
        // Configure CORS
        app.use((0, cors_1.default)({
            origin: '*',
            exposedHeaders: ['Mcp-Session-Id'],
            allowedHeaders: ['Content-Type', 'mcp-session-id', 'MCP-Protocol-Version', 'Authorization']
        }));
        app.use(express_1.default.json());
        // OAuth2 endpoints if enabled
        if (this.oauth2Server) {
            this.setupOAuth2Routes(app);
        }
        // Store transports by session ID
        const transports = {};
        // Main MCP endpoint
        app.all('/mcp', async (req, res) => {
            try {
                // Handle OAuth2 authentication if enabled
                if (this.config.auth?.enabled && this.config.auth.method === 'oauth2') {
                    await this.authenticateOAuth2(req, res);
                }
                const sessionId = req.headers['mcp-session-id'];
                let transport;
                if (sessionId && transports[sessionId]) {
                    transport = transports[sessionId];
                }
                else {
                    transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                        sessionIdGenerator: () => (0, node_crypto_1.randomUUID)(),
                        onsessioninitialized: (sessionId) => {
                            transports[sessionId] = transport;
                        },
                        enableDnsRebindingProtection: false
                    });
                    transport.onclose = () => {
                        if (transport.sessionId) {
                            delete transports[transport.sessionId];
                        }
                    };
                    await this.server.connect(transport);
                }
                this.requestCount++;
                await transport.handleRequest(req, res, req.body);
            }
            catch (error) {
                this.logger.error('Error handling MCP request', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: 'Internal server error',
                        },
                        id: null,
                    });
                }
            }
        });
        // Health check endpoint
        app.get('/health', async (req, res) => {
            const health = await this.getHealthStatus();
            res.json({
                ...health,
                server_type: 'orchestrator',
                timestamp: new Date().toISOString(),
                transport: 'http'
            });
        });
        // Start HTTP server
        const port = this.config.port || 3000;
        const host = this.config.host || 'localhost';
        app.listen(port, host, () => {
            this.logger.info(`MCP Orchestrator server listening on ${host}:${port}`);
        });
        this.httpApp = app;
    }
    async startSSE() {
        const app = (0, express_1.default)();
        // Configure CORS for SSE
        app.use((0, cors_1.default)({
            origin: '*',
            exposedHeaders: ['Mcp-Session-Id'],
            allowedHeaders: ['Content-Type', 'mcp-session-id', 'MCP-Protocol-Version', 'Authorization']
        }));
        app.use(express_1.default.json());
        // Store transports by session ID
        const sseTransports = {};
        const streamableTransports = {};
        // OAuth2 endpoints if enabled
        if (this.oauth2Server) {
            this.setupOAuth2Routes(app);
        }
        // SSE endpoint for legacy clients
        app.get('/sse', async (req, res) => {
            try {
                // Handle OAuth2 authentication if enabled
                if (this.config.auth?.enabled && this.config.auth.method === 'oauth2') {
                    await this.authenticateOAuth2(req, res);
                }
                // Create SSE transport for legacy clients
                const transport = new sse_js_1.SSEServerTransport('/messages', res);
                sseTransports[transport.sessionId] = transport;
                res.on("close", () => {
                    delete sseTransports[transport.sessionId];
                });
                await this.server.connect(transport);
                this.requestCount++;
            }
            catch (error) {
                this.logger.error('SSE connection error', error);
                res.status(500).send('SSE connection failed');
            }
        });
        // Message endpoint for SSE clients
        app.post('/messages', async (req, res) => {
            try {
                const sessionId = req.query.sessionId;
                const transport = sseTransports[sessionId];
                if (transport) {
                    await transport.handlePostMessage(req, res, req.body);
                }
                else {
                    res.status(400).send('No transport found for sessionId');
                }
            }
            catch (error) {
                this.logger.error('SSE message error', error);
                res.status(500).send('Message handling failed');
            }
        });
        // Modern Streamable HTTP endpoint (backwards compatibility)
        app.all('/mcp', async (req, res) => {
            try {
                // Handle OAuth2 authentication if enabled
                if (this.config.auth?.enabled && this.config.auth.method === 'oauth2') {
                    await this.authenticateOAuth2(req, res);
                }
                const sessionId = req.headers['mcp-session-id'];
                let transport;
                if (sessionId && streamableTransports[sessionId]) {
                    transport = streamableTransports[sessionId];
                }
                else {
                    transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                        sessionIdGenerator: () => (0, node_crypto_1.randomUUID)(),
                        onsessioninitialized: (sessionId) => {
                            streamableTransports[sessionId] = transport;
                        },
                        enableDnsRebindingProtection: false
                    });
                    transport.onclose = () => {
                        if (transport.sessionId) {
                            delete streamableTransports[transport.sessionId];
                        }
                    };
                    await this.server.connect(transport);
                }
                this.requestCount++;
                await transport.handleRequest(req, res, req.body);
            }
            catch (error) {
                this.logger.error('Error handling MCP request', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: 'Internal server error',
                        },
                        id: null,
                    });
                }
            }
        });
        // Health check endpoint
        app.get('/health', async (req, res) => {
            const health = await this.getHealthStatus();
            res.json({
                ...health,
                server_type: 'orchestrator',
                transport: 'sse',
                timestamp: new Date().toISOString()
            });
        });
        // Start SSE server
        const port = this.config.port || 3000;
        const host = this.config.host || 'localhost';
        app.listen(port, host, () => {
            this.logger.info(`MCP Orchestrator SSE server listening on ${host}:${port}`);
            this.logger.info(`SSE endpoint: http://${host}:${port}/sse`);
            this.logger.info(`Messages endpoint: http://${host}:${port}/messages`);
        });
        this.httpApp = app;
    }
    async startWebSocket() {
        // WebSocket transport is not yet implemented in the official SDK
        // For now, fall back to HTTP with WebSocket upgrade support
        this.logger.warn('WebSocket transport not yet available in official SDK, falling back to HTTP');
        await this.startHttp();
    }
    setupOAuth2Routes(app) {
        if (!this.oauth2Server)
            return;
        // Authorization endpoint
        app.get('/oauth2/authorize', async (req, res) => {
            try {
                const request = new OAuth2Request(req);
                const response = new OAuth2Response(res);
                // Simple authenticate handler - in production, implement proper user authentication
                const authenticateHandler = {
                    handle: () => ({ id: 'system' })
                };
                await this.oauth2Server.authorize(request, response, {
                    authenticateHandler
                });
            }
            catch (error) {
                this.logger.error('OAuth2 authorization error', error);
                res.status(400).json({ error: 'authorization_failed' });
            }
        });
        // Token endpoint
        app.post('/oauth2/token', async (req, res) => {
            try {
                const request = new OAuth2Request(req);
                const response = new OAuth2Response(res);
                const token = await this.oauth2Server.token(request, response);
                res.json(token);
            }
            catch (error) {
                this.logger.error('OAuth2 token error', error);
                res.status(400).json({ error: 'token_failed' });
            }
        });
        this.logger.info('OAuth2 routes configured', {
            authorize: '/oauth2/authorize',
            token: '/oauth2/token'
        });
    }
    async authenticateOAuth2(req, res) {
        if (!this.oauth2Server)
            return;
        try {
            const request = new OAuth2Request(req);
            const response = new OAuth2Response(res);
            const token = await this.oauth2Server.authenticate(request, response);
            // Token is valid, continue with request
            req.oauth = { token };
        }
        catch (error) {
            this.logger.warn('OAuth2 authentication failed', error);
            res.status(401).json({
                jsonrpc: '2.0',
                error: {
                    code: -32001,
                    message: 'Unauthorized',
                },
                id: null,
            });
            throw error;
        }
    }
    async getHealthStatus() {
        try {
            const uptime = Date.now() - this.startTime;
            const metrics = {
                uptime,
                requestCount: this.requestCount,
                sessionCount: 1, // Simplified for now
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                cpuUsage: process.cpuUsage().user / 1000000,
            };
            return {
                healthy: this.running,
                metrics,
            };
        }
        catch (error) {
            return {
                healthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    getSessions() {
        // Simplified session management
        return [{
                id: this.sessionId,
                createdAt: new Date().toISOString(),
                isActive: this.running
            }];
    }
    terminateSession(sessionId) {
        this.logger.info('Terminating session', { sessionId });
        // In the official SDK, session termination is handled automatically
    }
}
exports.MCPOrchestratorServer = MCPOrchestratorServer;
exports.MCPServer = MCPOrchestratorServer;
// CLI entry point for direct execution
async function main() {
    const args = process.argv.slice(2);
    // Simple argument parsing
    const port = args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) || 3000 : 3000;
    const transport = args.includes('--transport') ? args[args.indexOf('--transport') + 1] : 'http';
    console.log(`Starting MCP Orchestrator Server on port ${port} with ${transport} transport`);
    const config = {
        transport: transport,
        port,
        host: '0.0.0.0',
        auth: {
            enabled: false,
            method: 'token',
            tokens: []
        }
    };
    // Simple logger
    const logger = {
        info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
        error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
        warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
        debug: (msg, meta) => console.log(`[DEBUG] ${msg}`, meta || '')
    };
    // Simple event bus
    const eventBus = {
        emit: (event, data) => console.log(`[EVENT] ${event}`, data || ''),
        on: (event, handler) => { },
        off: (event, handler) => { }
    };
    const server = new MCPOrchestratorServer(config, eventBus, logger);
    try {
        await server.start();
        console.log(`✅ MCP Orchestrator Server started successfully on port ${port}`);
        // Keep alive
        process.on('SIGINT', async () => {
            console.log('Shutting down...');
            await server.stop();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
