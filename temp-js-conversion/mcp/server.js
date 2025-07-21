"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = void 0;
const errors_js_1 = require("../utils/errors.js");
const stdio_js_1 = require("./transports/stdio.js");
const http_js_1 = require("./transports/http.js");
const tools_js_1 = require("./tools.js");
const router_js_1 = require("./router.js");
const session_manager_js_1 = require("./session-manager.js");
const auth_js_1 = require("./auth.js");
const load_balancer_js_1 = require("./load-balancer.js");
const claude_flow_tools_js_1 = require("./claude-flow-tools.js");
const swarm_tools_js_1 = require("./swarm-tools.js");
const ruv_swarm_tools_js_1 = require("./ruv-swarm-tools.js");
const node_os_1 = require("node:os");
const node_perf_hooks_1 = require("node:perf_hooks");
/**
 * MCP server implementation
 */
class MCPServer {
    constructor(config, eventBus, logger, orchestrator, // Reference to orchestrator instance
    swarmCoordinator, // Reference to swarm coordinator instance
    agentManager, // Reference to agent manager instance
    resourceManager, // Reference to resource manager instance
    messagebus, // Reference to message bus instance
    monitor) {
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
        this.serverInfo = {
            name: 'Claude-Flow MCP Server',
            version: '1.0.0',
        };
        this.supportedProtocolVersion = {
            major: 2024,
            minor: 11,
            patch: 5,
        };
        this.serverCapabilities = {
            logging: {
                level: 'info',
            },
            tools: {
                listChanged: true,
            },
            resources: {
                listChanged: false,
                subscribe: false,
            },
            prompts: {
                listChanged: false,
            },
        };
        // Initialize transport
        this.transport = this.createTransport();
        // Initialize tool registry
        this.toolRegistry = new tools_js_1.ToolRegistry(logger);
        // Initialize session manager
        this.sessionManager = new session_manager_js_1.SessionManager(config, logger);
        // Initialize auth manager
        this.authManager = new auth_js_1.AuthManager(config.auth || { enabled: false, method: 'token' }, logger);
        // Initialize load balancer if enabled
        if (config.loadBalancer?.enabled) {
            this.loadBalancer = new load_balancer_js_1.LoadBalancer(config.loadBalancer, logger);
            this.requestQueue = new load_balancer_js_1.RequestQueue(1000, 30000, logger);
        }
        // Initialize request router
        this.router = new router_js_1.RequestRouter(this.toolRegistry, logger);
    }
    async start() {
        if (this.running) {
            throw new errors_js_1.MCPError('MCP server already running');
        }
        this.logger.info('Starting MCP server', { transport: this.config.transport });
        try {
            // Set up request handler
            this.transport.onRequest(async (request) => {
                return await this.handleRequest(request);
            });
            // Start transport
            await this.transport.start();
            // Register built-in tools
            this.registerBuiltInTools();
            this.running = true;
            this.logger.info('MCP server started successfully');
        }
        catch (error) {
            this.logger.error('Failed to start MCP server', error);
            throw new errors_js_1.MCPError('Failed to start MCP server', { error });
        }
    }
    async stop() {
        if (!this.running) {
            return;
        }
        this.logger.info('Stopping MCP server');
        try {
            // Stop transport
            await this.transport.stop();
            // Clean up session manager
            if (this.sessionManager && 'destroy' in this.sessionManager) {
                this.sessionManager.destroy();
            }
            // Clean up all sessions
            for (const session of this.sessionManager.getActiveSessions()) {
                this.sessionManager.removeSession(session.id);
            }
            this.running = false;
            this.currentSession = undefined;
            this.logger.info('MCP server stopped');
        }
        catch (error) {
            this.logger.error('Error stopping MCP server', error);
            throw error;
        }
    }
    registerTool(tool) {
        this.toolRegistry.register(tool);
        this.logger.info('Tool registered', { name: tool.name });
    }
    async getHealthStatus() {
        try {
            const transportHealth = await this.transport.getHealthStatus();
            const registeredTools = this.toolRegistry.getToolCount();
            const { totalRequests, successfulRequests, failedRequests } = this.router.getMetrics();
            const sessionMetrics = this.sessionManager.getSessionMetrics();
            const metrics = {
                registeredTools,
                totalRequests,
                successfulRequests,
                failedRequests,
                totalSessions: sessionMetrics.total,
                activeSessions: sessionMetrics.active,
                authenticatedSessions: sessionMetrics.authenticated,
                expiredSessions: sessionMetrics.expired,
                ...transportHealth.metrics,
            };
            if (this.loadBalancer) {
                const lbMetrics = this.loadBalancer.getMetrics();
                metrics.rateLimitedRequests = lbMetrics.rateLimitedRequests;
                metrics.averageResponseTime = lbMetrics.averageResponseTime;
                metrics.requestsPerSecond = lbMetrics.requestsPerSecond;
                metrics.circuitBreakerTrips = lbMetrics.circuitBreakerTrips;
            }
            const status = {
                healthy: this.running && transportHealth.healthy,
                metrics,
            };
            if (transportHealth.error !== undefined) {
                status.error = transportHealth.error;
            }
            return status;
        }
        catch (error) {
            return {
                healthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    getMetrics() {
        const routerMetrics = this.router.getMetrics();
        const sessionMetrics = this.sessionManager.getSessionMetrics();
        const lbMetrics = this.loadBalancer?.getMetrics();
        return {
            totalRequests: routerMetrics.totalRequests,
            successfulRequests: routerMetrics.successfulRequests,
            failedRequests: routerMetrics.failedRequests,
            averageResponseTime: lbMetrics?.averageResponseTime || 0,
            activeSessions: sessionMetrics.active,
            toolInvocations: {}, // TODO: Implement tool-specific metrics
            errors: {}, // TODO: Implement error categorization
            lastReset: lbMetrics?.lastReset || new Date(),
        };
    }
    getSessions() {
        return this.sessionManager.getActiveSessions();
    }
    getSession(sessionId) {
        return this.sessionManager.getSession(sessionId);
    }
    terminateSession(sessionId) {
        this.sessionManager.removeSession(sessionId);
        if (this.currentSession?.id === sessionId) {
            this.currentSession = undefined;
        }
    }
    async handleRequest(request) {
        this.logger.debug('Handling MCP request', {
            id: request.id,
            method: request.method,
        });
        try {
            // Handle initialization request separately
            if (request.method === 'initialize') {
                return await this.handleInitialize(request);
            }
            // Get or create session
            const session = this.getOrCreateSession();
            // Check if session is initialized for non-initialize requests
            if (!session.isInitialized) {
                return {
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                        code: -32002,
                        message: 'Server not initialized',
                    },
                };
            }
            // Update session activity
            this.sessionManager.updateActivity(session.id);
            // Check load balancer constraints
            if (this.loadBalancer) {
                const allowed = await this.loadBalancer.shouldAllowRequest(session, request);
                if (!allowed) {
                    return {
                        jsonrpc: '2.0',
                        id: request.id,
                        error: {
                            code: -32000,
                            message: 'Rate limit exceeded or circuit breaker open',
                        },
                    };
                }
            }
            // Record request start
            const requestMetrics = this.loadBalancer?.recordRequestStart(session, request);
            try {
                // Process request through router
                const result = await this.router.route(request);
                const response = {
                    jsonrpc: '2.0',
                    id: request.id,
                    result,
                };
                // Record success
                if (requestMetrics) {
                    this.loadBalancer?.recordRequestEnd(requestMetrics, response);
                }
                return response;
            }
            catch (error) {
                // Record failure
                if (requestMetrics) {
                    this.loadBalancer?.recordRequestEnd(requestMetrics, undefined, error);
                }
                throw error;
            }
        }
        catch (error) {
            this.logger.error('Error handling MCP request', {
                id: request.id,
                method: request.method,
                error,
            });
            return {
                jsonrpc: '2.0',
                id: request.id,
                error: this.errorToMCPError(error),
            };
        }
    }
    async handleInitialize(request) {
        try {
            const params = request.params;
            if (!params) {
                return {
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                        code: -32602,
                        message: 'Invalid params',
                    },
                };
            }
            // Create session
            const session = this.sessionManager.createSession(this.config.transport);
            this.currentSession = session;
            // Initialize session
            this.sessionManager.initializeSession(session.id, params);
            // Prepare response
            const result = {
                protocolVersion: this.supportedProtocolVersion,
                capabilities: this.serverCapabilities,
                serverInfo: this.serverInfo,
                instructions: 'Claude-Flow MCP Server ready for tool execution',
            };
            this.logger.info('Session initialized', {
                sessionId: session.id,
                clientInfo: params.clientInfo,
                protocolVersion: params.protocolVersion,
            });
            return {
                jsonrpc: '2.0',
                id: request.id,
                result,
            };
        }
        catch (error) {
            this.logger.error('Error during initialization', error);
            return {
                jsonrpc: '2.0',
                id: request.id,
                error: this.errorToMCPError(error),
            };
        }
    }
    getOrCreateSession() {
        if (this.currentSession) {
            return this.currentSession;
        }
        // For stdio transport, create a default session
        const session = this.sessionManager.createSession(this.config.transport);
        this.currentSession = session;
        return session;
    }
    createTransport() {
        switch (this.config.transport) {
            case 'stdio':
                return new stdio_js_1.StdioTransport(this.logger);
            case 'http':
                return new http_js_1.HttpTransport(this.config.host || 'localhost', this.config.port || 3000, this.config.tlsEnabled || false, this.logger);
            default:
                throw new errors_js_1.MCPError(`Unknown transport type: ${this.config.transport}`);
        }
    }
    registerBuiltInTools() {
        // System information tool
        this.registerTool({
            name: 'system/info',
            description: 'Get system information',
            inputSchema: {
                type: 'object',
                properties: {},
            },
            handler: async () => {
                return {
                    version: '1.0.0',
                    platform: (0, node_os_1.platform)(),
                    arch: (0, node_os_1.arch)(),
                    runtime: 'Node.js',
                    uptime: node_perf_hooks_1.performance.now(),
                };
            },
        });
        // Health check tool
        this.registerTool({
            name: 'system/health',
            description: 'Get system health status',
            inputSchema: {
                type: 'object',
                properties: {},
            },
            handler: async () => {
                return await this.getHealthStatus();
            },
        });
        // List tools
        this.registerTool({
            name: 'tools/list',
            description: 'List all available tools',
            inputSchema: {
                type: 'object',
                properties: {},
            },
            handler: async () => {
                return this.toolRegistry.listTools();
            },
        });
        // Tool schema
        this.registerTool({
            name: 'tools/schema',
            description: 'Get schema for a specific tool',
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
                required: ['name'],
            },
            handler: async (input) => {
                const tool = this.toolRegistry.getTool(input.name);
                if (!tool) {
                    throw new Error(`Tool not found: ${input.name}`);
                }
                return {
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                };
            },
        });
        // Register Claude-Flow specific tools if orchestrator is available
        if (this.orchestrator) {
            const claudeFlowTools = (0, claude_flow_tools_js_1.createClaudeFlowTools)(this.logger);
            for (const tool of claudeFlowTools) {
                // Wrap the handler to inject orchestrator context
                const originalHandler = tool.handler;
                tool.handler = async (input, context) => {
                    const claudeFlowContext = {
                        ...context,
                        orchestrator: this.orchestrator,
                    };
                    return await originalHandler(input, claudeFlowContext);
                };
                this.registerTool(tool);
            }
            this.logger.info('Registered Claude-Flow tools', { count: claudeFlowTools.length });
        }
        else {
            this.logger.warn('Orchestrator not available - Claude-Flow tools not registered');
        }
        // Register Swarm-specific tools if swarm components are available
        if (this.swarmCoordinator || this.agentManager || this.resourceManager) {
            const swarmTools = (0, swarm_tools_js_1.createSwarmTools)(this.logger);
            for (const tool of swarmTools) {
                // Wrap the handler to inject swarm context
                const originalHandler = tool.handler;
                tool.handler = async (input, context) => {
                    const swarmContext = {
                        ...context,
                        swarmCoordinator: this.swarmCoordinator,
                        agentManager: this.agentManager,
                        resourceManager: this.resourceManager,
                        messageBus: this.messagebus,
                        monitor: this.monitor,
                    };
                    return await originalHandler(input, swarmContext);
                };
                this.registerTool(tool);
            }
            this.logger.info('Registered Swarm tools', { count: swarmTools.length });
        }
        else {
            this.logger.warn('Swarm components not available - Swarm tools not registered');
        }
        // Register ruv-swarm MCP tools if available
        this.registerRuvSwarmTools();
    }
    /**
     * Register ruv-swarm MCP tools if available
     */
    async registerRuvSwarmTools() {
        try {
            // Check if ruv-swarm is available
            const available = await (0, ruv_swarm_tools_js_1.isRuvSwarmAvailable)(this.logger);
            if (!available) {
                this.logger.info('ruv-swarm not available - skipping ruv-swarm MCP tools registration');
                return;
            }
            // Initialize ruv-swarm integration
            const workingDirectory = process.cwd();
            const integration = await (0, ruv_swarm_tools_js_1.initializeRuvSwarmIntegration)(workingDirectory, this.logger);
            if (!integration.success) {
                this.logger.warn('Failed to initialize ruv-swarm integration', { error: integration.error });
                return;
            }
            // Create ruv-swarm tools
            const ruvSwarmTools = (0, ruv_swarm_tools_js_1.createRuvSwarmTools)(this.logger);
            for (const tool of ruvSwarmTools) {
                // Wrap the handler to inject ruv-swarm context
                const originalHandler = tool.handler;
                tool.handler = async (input, context) => {
                    const ruvSwarmContext = {
                        ...context,
                        workingDirectory,
                        sessionId: `mcp-session-${Date.now()}`,
                        swarmId: process.env.CLAUDE_SWARM_ID || `mcp-swarm-${Date.now()}`
                    };
                    return await originalHandler(input, ruvSwarmContext);
                };
                this.registerTool(tool);
            }
            this.logger.info('Registered ruv-swarm MCP tools', {
                count: ruvSwarmTools.length,
                integration: integration.data
            });
        }
        catch (error) {
            this.logger.error('Error registering ruv-swarm MCP tools', error);
        }
    }
    errorToMCPError(error) {
        if (error instanceof errors_js_1.MCPMethodNotFoundError) {
            return {
                code: -32601,
                message: (error instanceof Error ? error.message : String(error)),
                data: error.details,
            };
        }
        if (error instanceof errors_js_1.MCPError) {
            return {
                code: -32603,
                message: (error instanceof Error ? error.message : String(error)),
                data: error.details,
            };
        }
        if (error instanceof Error) {
            return {
                code: -32603,
                message: (error instanceof Error ? error.message : String(error)),
            };
        }
        return {
            code: -32603,
            message: 'Internal error',
            data: error,
        };
    }
}
exports.MCPServer = MCPServer;
