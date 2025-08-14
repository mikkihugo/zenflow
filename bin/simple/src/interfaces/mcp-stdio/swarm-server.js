import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { getLogger } from '../../config/logging-config.js';
import { SwarmService } from '../../services/coordination/swarm-service.js';
const logger = getLogger('stdio-mcp-server');
export class StdioMCPServer {
    server;
    swarmService;
    transport;
    constructor() {
        this.server = new Server({
            name: 'claude-code-zen-stdio',
            version: '1.0.0-alpha.43',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.swarmService = new SwarmService();
        this.transport = new StdioServerTransport();
        this.setupTools();
    }
    setupTools() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'swarm_init',
                    description: 'Initialize a new swarm with specified topology and configuration',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            topology: {
                                type: 'string',
                                enum: ['mesh', 'hierarchical', 'ring', 'star'],
                                description: 'Swarm topology type',
                            },
                            maxAgents: {
                                type: 'number',
                                minimum: 1,
                                maximum: 100,
                                default: 5,
                                description: 'Maximum number of agents',
                            },
                            strategy: {
                                type: 'string',
                                enum: ['balanced', 'specialized', 'adaptive', 'parallel'],
                                default: 'adaptive',
                                description: 'Distribution strategy',
                            },
                        },
                        required: ['topology'],
                    },
                },
                {
                    name: 'agent_spawn',
                    description: 'Spawn a new agent in the swarm',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            swarmId: {
                                type: 'string',
                                description: 'Swarm ID to spawn agent in',
                            },
                            type: {
                                type: 'string',
                                enum: [
                                    'researcher',
                                    'coder',
                                    'analyst',
                                    'optimizer',
                                    'coordinator',
                                    'tester',
                                ],
                                description: 'Agent type',
                            },
                            name: {
                                type: 'string',
                                description: 'Custom agent name',
                            },
                            capabilities: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Agent capabilities',
                            },
                        },
                        required: ['swarmId', 'type'],
                    },
                },
                {
                    name: 'task_orchestrate',
                    description: 'Orchestrate a task across the swarm',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                minLength: 10,
                                description: 'Task description or instructions',
                            },
                            strategy: {
                                type: 'string',
                                enum: ['parallel', 'sequential', 'adaptive'],
                                default: 'adaptive',
                                description: 'Execution strategy',
                            },
                            priority: {
                                type: 'string',
                                enum: ['low', 'medium', 'high', 'critical'],
                                default: 'medium',
                                description: 'Task priority',
                            },
                            maxAgents: {
                                type: 'number',
                                minimum: 1,
                                maximum: 10,
                                description: 'Maximum agents to use',
                            },
                        },
                        required: ['task'],
                    },
                },
                {
                    name: 'swarm_status',
                    description: 'Get current swarm status and agent information',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            swarmId: {
                                type: 'string',
                                description: 'Specific swarm ID (optional)',
                            },
                            verbose: {
                                type: 'boolean',
                                default: false,
                                description: 'Include detailed agent information',
                            },
                        },
                    },
                },
                {
                    name: 'task_status',
                    description: 'Check progress of running tasks',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            taskId: {
                                type: 'string',
                                description: 'Specific task ID (optional)',
                            },
                            detailed: {
                                type: 'boolean',
                                default: false,
                                description: 'Include detailed progress',
                            },
                        },
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'swarm_init': {
                        const config = {
                            topology: args.topology,
                            maxAgents: args.maxAgents || 5,
                            strategy: args.strategy || 'adaptive',
                        };
                        const result = await this.swarmService.initializeSwarm(config);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'agent_spawn': {
                        const config = {
                            type: args.type,
                            name: args.name,
                            capabilities: args.capabilities || [],
                        };
                        const result = await this.swarmService.spawnAgent(args.swarmId, config);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'task_orchestrate': {
                        const config = {
                            task: args.task,
                            strategy: args.strategy ||
                                'adaptive',
                            priority: args.priority ||
                                'medium',
                            maxAgents: args.maxAgents || 5,
                        };
                        const result = await this.swarmService.orchestrateTask(config);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'swarm_status': {
                        const result = await this.swarmService.getSwarmStatus(args.swarmId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    case 'task_status': {
                        const result = await this.swarmService.getTaskStatus(args.taskId);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                        };
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                logger.error('Tool execution failed', {
                    tool: name,
                    error: error instanceof Error ? error.message : String(error),
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: error instanceof Error ? error.message : String(error),
                                tool: name,
                                success: false,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async start() {
        logger.info('Starting stdio MCP server for Claude Code CLI...');
        try {
            await this.server.connect(this.transport);
            logger.info('✅ stdio MCP server started successfully');
            logger.info('   Protocol: stdio (direct service calls)');
            logger.info('   Performance: Maximum (no HTTP overhead)');
            logger.info('   Target: Claude Code CLI, Gemini CLI, other stdio tools');
        }
        catch (error) {
            logger.error('Failed to start stdio MCP server:', error);
            throw error;
        }
    }
    async stop() {
        logger.info('Stopping stdio MCP server...');
        try {
            await this.swarmService.shutdown();
            logger.info('✅ stdio MCP server stopped successfully');
        }
        catch (error) {
            logger.error('Error stopping stdio MCP server:', error);
            throw error;
        }
    }
    getStatus() {
        return {
            type: 'stdio-mcp',
            protocol: 'stdio',
            performance: 'maximum',
            targets: ['Claude Code CLI', 'Gemini CLI', 'stdio tools'],
            service_stats: this.swarmService.getStats(),
            memory_usage: process.memoryUsage(),
            uptime: process.uptime(),
        };
    }
}
export const stdioMCPServer = new StdioMCPServer();
if (process.argv[1] && process.argv[1].endsWith('swarm-server.ts')) {
    stdioMCPServer.start().catch((error) => {
        logger.error('Failed to start stdio MCP server:', error);
        process.exit(1);
    });
    process.on('SIGINT', async () => {
        logger.info('Received SIGINT, shutting down gracefully...');
        await stdioMCPServer.stop();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM, shutting down gracefully...');
        await stdioMCPServer.stop();
        process.exit(0);
    });
}
export default StdioMCPServer;
//# sourceMappingURL=swarm-server.js.map