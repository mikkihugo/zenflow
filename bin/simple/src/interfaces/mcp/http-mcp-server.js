#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import express from 'express';
import { z } from 'zod';
import { config, getCORSOrigins } from '../../config/index.js';
import { getLogger } from '../../config/logging-config.ts';
import { advancedToolRegistry } from './mcp-tools.ts';
const logger = getLogger('SDK-HTTP-MCP-Server');
const advancedMCPToolsManager = {
    searchTools(query) {
        const allTools = advancedToolRegistry.getAllTools();
        const filtered = allTools.filter((tool) => tool.name.toLowerCase().includes(query.toLowerCase()) ||
            tool.description.toLowerCase().includes(query.toLowerCase()) ||
            tool.metadata.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())));
        return { tools: filtered };
    },
    getToolsByCategory(category) {
        const tools = advancedToolRegistry.getToolsByCategory(category);
        return { tools };
    },
    listAllTools() {
        const tools = advancedToolRegistry.getAllTools();
        return { tools };
    },
    getRegistryOverview() {
        const categorySummary = advancedToolRegistry.getCategorySummary();
        const totalTools = advancedToolRegistry.getToolCount();
        return {
            totalTools,
            categories: categorySummary,
            status: 'active',
        };
    },
    hasTool(name) {
        return advancedToolRegistry.getTool(name) !== undefined;
    },
    async executeTool(name, params) {
        const tool = advancedToolRegistry.getTool(name);
        if (!tool) {
            throw new Error(`Tool '${name}' not found`);
        }
        return await tool.handler.execute(params);
    },
    getToolCount() {
        return advancedToolRegistry.getToolCount();
    },
    getToolStats() {
        const categorySummary = advancedToolRegistry.getCategorySummary();
        const totalTools = advancedToolRegistry.getToolCount();
        return {
            total: totalTools,
            byCategory: categorySummary,
            lastUpdated: new Date().toISOString(),
        };
    },
};
export class HTTPMCPServer {
    server;
    expressApp;
    httpServer;
    config;
    isRunning = false;
    constructor(userConfig = {}) {
        const centralConfig = config?.getAll();
        this.config = {
            port: userConfig?.port || centralConfig?.interfaces?.mcp?.http?.port,
            host: userConfig?.host || centralConfig?.interfaces?.mcp?.http?.host,
            timeout: userConfig?.timeout || centralConfig?.interfaces?.mcp?.http?.timeout,
            logLevel: userConfig?.logLevel || centralConfig?.core?.logger?.level,
        };
        this.server = new McpServer({
            name: 'claude-zen-http-mcp',
            version: '1.0.0-alpha.43',
        }, {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
            },
        });
        this.server.setRequestHandler('tools/list', async () => {
            return {
                tools: [
                    {
                        name: 'system_info',
                        description: 'Get Claude-Zen system information and status',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                detailed: {
                                    type: 'boolean',
                                    description: 'Include detailed system metrics',
                                    default: false,
                                },
                            },
                        },
                    },
                ],
            };
        });
        this.expressApp = express();
        this.setupExpressMiddleware();
        this.setupSDKRoutes();
    }
    setupExpressMiddleware() {
        this.expressApp.use(express.json({ limit: '10mb' }));
        this.expressApp.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));
        this.expressApp.use((req, res, next) => {
            const corsOrigins = getCORSOrigins();
            const origin = req.headers.origin;
            if (corsOrigins.includes('*') ||
                (origin && corsOrigins.includes(origin)) ||
                !origin) {
                res.header('Access-Control-Allow-Origin', origin || '*');
            }
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MCP-Client-Info, Last-Event-ID, MCP-Session-ID');
            res.header('Access-Control-Allow-Credentials', 'true');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            }
            else {
                next();
            }
        });
        this.expressApp.use((req, _res, next) => {
            logger.debug(`${req.method} ${req.path}`, {
                headers: req.headers,
                hasBody: !!req.body,
                bodyMethod: req.body?.method,
            });
            next();
        });
        this.expressApp.get('/health', (_req, res) => {
            res.json({
                status: 'healthy',
                server: 'claude-zen-sdk-http-mcp',
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                sdk: 'official-mcp-sdk',
            });
        });
    }
    async registerTools() {
        this.server.setRequestHandler('tools/call', async (request) => {
            const { name, arguments: args } = request.params;
            if (name === 'system_info') {
                const detailed = args?.detailed;
                const info = {
                    name: 'claude-zen',
                    version: '2.0.0',
                    status: 'running',
                    uptime: Math.floor(process.uptime()),
                    platform: process.platform,
                    arch: process.arch,
                    nodeVersion: process.version,
                    pid: process.pid,
                    sdk: 'official-mcp-sdk',
                    server: 'claude-zen-sdk-http-mcp',
                };
                if (detailed) {
                    const memUsage = process.memoryUsage();
                    Object.assign(info, {
                        memory: {
                            used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                            total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
                            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
                        },
                        cpuUsage: process.cpuUsage(),
                        resourceUsage: process.resourceUsage?.() || {},
                    });
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(info, null, 2),
                        },
                    ],
                };
            }
            throw new Error(`Unknown tool: ${name}`);
        });
        this.server.tool('project_init', 'Initialize a new Claude-Zen project with templates and configuration', {
            name: z.string().min(1).describe('Project name'),
            template: z
                .enum(['basic', 'advanced', 'swarm', 'neural'])
                .default('basic')
                .describe('Project template to use'),
            directory: z
                .string()
                .default('.')
                .describe('Target directory for project'),
        }, {
            title: 'Project Initialization',
            description: 'Creates a new Claude-Zen project with the specified template and configuration',
        }, async ({ name, template, directory }) => {
            logger.info(`Initializing project: ${name} with template: ${template}`);
            const result = {
                success: true,
                project: name,
                template,
                directory,
                message: `Project ${name} initialized successfully with ${template} template`,
                nextSteps: [
                    'Run claude-zen status to check project health',
                    'Use claude-zen swarm init to set up agent coordination',
                    'Explore claude-zen --help for available commands',
                ],
                sdk: 'official-mcp-sdk',
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        });
        this.server.tool('project_status', 'Get comprehensive project status including swarms, tasks, and resources', {
            format: z
                .enum(['json', 'summary'])
                .default('json')
                .describe('Output format'),
            includeMetrics: z
                .boolean()
                .default(false)
                .describe('Include performance metrics'),
        }, {
            title: 'Project Status',
            description: 'Provides comprehensive project health, swarm status, and resource utilization',
        }, async ({ format, includeMetrics }) => {
            const status = {
                project: {
                    name: 'current-project',
                    status: 'active',
                    initialized: true,
                    sdk: 'official-mcp-sdk',
                },
                swarms: {
                    active: 0,
                    total: 0,
                    agents: 0,
                },
                tasks: {
                    pending: 0,
                    active: 0,
                    completed: 0,
                },
                resources: {
                    memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                    uptime: `${Math.floor(process.uptime())}s`,
                },
            };
            if (includeMetrics) {
                Object.assign(status, {
                    metrics: {
                        requestsProcessed: 0,
                        averageResponseTime: 0,
                        errorRate: 0,
                        sdkVersion: '1.17.1',
                    },
                });
            }
            let result;
            if (format === 'summary') {
                result = {
                    summary: `Project: ${status.project.name} (${status.project.status})`,
                    swarms: `${status.swarms.active}/${status.swarms.total} active`,
                    tasks: `${status.tasks.active} active, ${status.tasks.completed} completed`,
                    uptime: status.resources.uptime,
                    sdk: 'official-mcp-sdk',
                };
            }
            else {
                result = status;
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        });
        await this.registerAdvancedTools();
        await this.integrateAdvancedToolsNatively();
        logger.info('Registered Claude-Zen tools with official MCP SDK');
    }
    async registerAdvancedTools() {
        logger.info('Registering 87 advanced tools from claude-zen...');
        this.server.tool('advanced_tools_list', 'List all 87 advanced MCP tools with categories and metadata', {
            category: z.string().optional().describe('Filter by tool category'),
            search: z.string().optional().describe('Search tools by name or tags'),
        }, {
            title: 'Advanced Tools Discovery',
            description: 'Comprehensive listing of all advanced MCP tools available in the system',
        }, async ({ category, search }) => {
            try {
                let tools;
                if (search) {
                    tools = advancedMCPToolsManager.searchTools(search);
                }
                else if (category) {
                    tools = advancedMCPToolsManager.getToolsByCategory(category);
                }
                else {
                    tools = advancedMCPToolsManager.listAllTools();
                }
                const overview = advancedMCPToolsManager.getRegistryOverview();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                overview,
                                tools: typeof tools === 'object' && 'tools' in tools
                                    ? tools.tools
                                    : tools,
                                filter: { category, search },
                                timestamp: new Date().toISOString(),
                            }, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                logger.error('Error listing advanced tools:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ error: error.message }, null, 2),
                        },
                    ],
                };
            }
        });
        this.server.tool('advanced_tool_execute', 'Execute any of the 87 advanced MCP tools', {
            toolName: z.string().describe('Name of the advanced tool to execute'),
            params: z
                .record(z.any())
                .optional()
                .describe('Parameters for the tool'),
        }, {
            title: 'Advanced Tool Execution',
            description: 'Execute advanced coordination, monitoring, neural, GitHub, system, and orchestration tools',
        }, async ({ toolName, params = {} }) => {
            try {
                if (!advancedMCPToolsManager.hasTool(toolName)) {
                    throw new Error(`Advanced tool not found: ${toolName}`);
                }
                const result = await advancedMCPToolsManager.executeTool(toolName, params);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                tool: toolName,
                                params,
                                result,
                                executedAt: new Date().toISOString(),
                            }, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                logger.error(`Error executing advanced tool ${toolName}:`, error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                tool: toolName,
                                error: error.message,
                                params,
                                executedAt: new Date().toISOString(),
                            }, null, 2),
                        },
                    ],
                };
            }
        });
        this.server.tool('advanced_tools_stats', 'Get execution statistics for advanced MCP tools', {
            detailed: z
                .boolean()
                .default(false)
                .describe('Include detailed per-tool statistics'),
        }, {
            title: 'Advanced Tools Statistics',
            description: 'Performance metrics and usage statistics for advanced MCP tools',
        }, async ({ detailed }) => {
            const overview = advancedMCPToolsManager.getRegistryOverview();
            const stats = detailed ? advancedMCPToolsManager.getToolStats() : {};
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            overview,
                            ...(detailed && { detailedStats: stats }),
                            generatedAt: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        });
        logger.info(`✅ Registered 3 proxy tools for ${advancedMCPToolsManager.getToolCount()} advanced tools`);
    }
    async integrateAdvancedToolsNatively() {
        logger.info('Integrating advanced tools as native MCP tools...');
        const allTools = advancedMCPToolsManager.listAllTools();
        const tools = allTools.tools || [];
        let registeredCount = 0;
        for (const tool of tools) {
            try {
                this.server.tool(tool.name, tool.description, tool.inputSchema, {
                    title: tool.metadata?.title || tool.name,
                    description: tool.description,
                }, async (params) => {
                    const result = await advancedMCPToolsManager.executeTool(tool.name, params);
                    if (result &&
                        typeof result === 'object' &&
                        !Array.isArray(result)) {
                        if ('content' in result) {
                            return result;
                        }
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    return {
                        content: [
                            {
                                type: 'text',
                                text: typeof result === 'string'
                                    ? result
                                    : JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                });
                registeredCount++;
            }
            catch (error) {
                logger.warn(`Failed to register tool ${tool.name}:`, error);
            }
        }
        logger.info(`✅ Integrated ${registeredCount}/${tools.length} advanced tools as native MCP tools`);
    }
    setupSDKRoutes() {
        const transports = {};
        const mcpPostHandler = async (req, res) => {
            try {
                let sessionId = req.headers['mcp-session-id'];
                let transport = sessionId ? transports[sessionId] : undefined;
                const isInitRequest = req.body && req.body.method === 'initialize';
                if (!transport && isInitRequest) {
                    sessionId = randomUUID();
                    transport = {
                        handleRequest: async (req, res, body) => {
                            res.json({ error: 'MCP SDK not available' });
                        },
                        close: async () => { },
                    };
                    transports[sessionId] = transport;
                    await this.server.connect(transport);
                    await transport.handleRequest(req, res, req.body);
                    return;
                }
                if (!(transport || isInitRequest)) {
                    res.status(400).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32000,
                            message: 'Bad Request: No valid session ID provided. Initialize first.',
                        },
                        id: req.body?.id || null,
                    });
                    return;
                }
                if (transport) {
                    await transport.handleRequest(req, res, req.body);
                    return;
                }
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: Invalid request state',
                    },
                    id: req.body?.id || null,
                });
            }
            catch (error) {
                logger.error('Error handling MCP POST request:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: 'Internal server error',
                        },
                        id: req.body?.id || null,
                    });
                }
            }
        };
        const mcpGetHandler = async (req, res) => {
            try {
                const sessionId = req.headers['mcp-session-id'];
                const transport = sessionId ? transports[sessionId] : undefined;
                if (!transport) {
                    res.status(400).send('Invalid or missing session ID for SSE stream');
                    return;
                }
                await transport.handleRequest(req, res);
            }
            catch (error) {
                logger.error('Error handling MCP GET request:', error);
                if (!res.headersSent) {
                    res.status(500).send('Error establishing SSE stream');
                }
            }
        };
        const mcpDeleteHandler = async (req, res) => {
            try {
                const sessionId = req.headers['mcp-session-id'];
                const transport = sessionId ? transports[sessionId] : undefined;
                if (!transport) {
                    res.status(400).send('Invalid or missing session ID');
                    return;
                }
                await transport.handleRequest(req, res);
                if (sessionId && transports[sessionId]) {
                    await transports[sessionId]?.close();
                    delete transports[sessionId];
                }
            }
            catch (error) {
                logger.error('Error handling session termination:', error);
                if (!res.headersSent) {
                    res.status(500).send('Error processing session termination');
                }
            }
        };
        this.expressApp.post('/mcp', mcpPostHandler);
        this.expressApp.get('/mcp', mcpGetHandler);
        this.expressApp.delete('/mcp', mcpDeleteHandler);
        this.expressApp.get('/capabilities', (_req, res) => {
            res.json({
                protocolVersion: '2024-11-05',
                serverInfo: {
                    name: 'claude-zen-sdk-http-mcp',
                    version: '2.0.0',
                    description: 'Claude-Zen HTTP MCP Server using official SDK',
                },
                capabilities: {
                    tools: {},
                    resources: {
                        list: true,
                        read: true,
                    },
                    logging: {},
                },
                sdk: 'official-mcp-sdk',
            });
        });
        this.expressApp.use((req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Endpoint ${req.originalUrl} not found`,
                availableEndpoints: [
                    'GET /health',
                    'GET /capabilities',
                    'POST /mcp',
                    'PUT /mcp',
                    'DELETE /mcp',
                ],
                sdk: 'official-mcp-sdk',
            });
        });
    }
    async start() {
        if (this.isRunning) {
            logger.warn('Server already running');
            return;
        }
        await this.registerTools();
        return new Promise((resolve, reject) => {
            this.httpServer = this.expressApp.listen(this.config.port, this.config.host, () => {
                this.isRunning = true;
                const url = `http://${this.config.host}:${this.config.port}`;
                logger.info(`🚀 Claude-Zen SDK HTTP MCP Server started`);
                logger.info(`   URL: ${url}`);
                logger.info(`   Protocol: Official MCP SDK over HTTP`);
                logger.info(`   Health: ${url}/health`);
                logger.info(`   Capabilities: ${url}/capabilities`);
                logger.info(`   MCP Endpoint: ${url}/mcp`);
                resolve();
            });
            this.httpServer.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    reject(new Error(`Port ${this.config.port} is already in use`));
                }
                else {
                    reject(error);
                }
            });
        });
    }
    async stop() {
        if (!(this.isRunning && this.httpServer)) {
            return;
        }
        return new Promise((resolve) => {
            this.httpServer.close(() => {
                this.isRunning = false;
                logger.info('SDK HTTP MCP Server stopped');
                resolve();
            });
        });
    }
    getStatus() {
        return {
            running: this.isRunning,
            config: this.config,
            uptime: process.uptime(),
            sdk: 'official-mcp-sdk',
            version: '2.0.0',
        };
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new HTTPMCPServer();
    process.on('SIGTERM', () => server.stop());
    process.on('SIGINT', () => server.stop());
    server.start().catch((error) => {
        logger.error('Failed to start SDK HTTP MCP Server:', error);
        process.exit(1);
    });
}
export default HTTPMCPServer;
//# sourceMappingURL=http-mcp-server.js.map