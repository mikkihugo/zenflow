/**
 * Conversation MCP Tools.
 *
 * MCP tools for managing ag2.ai-inspired multi-agent conversations.
 */
/**
 * @file Mcp-tools implementation.
 */
import { ConversationMemoryFactory } from './memory.ts';
import { ConversationOrchestratorImpl } from './orchestrator.ts';
/**
 * MCP tools for conversation management.
 *
 * @example
 */
export class ConversationMCPTools {
    orchestrator;
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
    }
    /**
     * Get all conversation MCP tools.
     */
    getTools() {
        return [
            {
                name: 'conversation_create',
                description: 'Create a new multi-agent conversation session',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: 'Conversation title' },
                        description: { type: 'string', description: 'Optional conversation description' },
                        pattern: {
                            type: 'string',
                            enum: ['code-review', 'problem-solving', 'brainstorming', 'planning'],
                            description: 'Conversation pattern to use',
                        },
                        goal: { type: 'string', description: 'Conversation goal' },
                        domain: {
                            type: 'string',
                            description: 'Domain context (e.g., backend, frontend, devops)',
                        },
                        participants: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    type: { type: 'string' },
                                    swarmId: { type: 'string' },
                                    instance: { type: 'number' },
                                },
                                required: ['id', 'type', 'swarmId', 'instance'],
                            },
                            description: 'Initial participant agents',
                        },
                        constraints: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Conversation constraints',
                        },
                        timeout: { type: 'number', description: 'Optional timeout in milliseconds' },
                    },
                    required: ['title', 'pattern', 'goal', 'domain', 'participants'],
                },
            },
            {
                name: 'conversation_join',
                description: 'Add an agent to an existing conversation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string', description: 'Conversation ID' },
                        agent: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                type: { type: 'string' },
                                swarmId: { type: 'string' },
                                instance: { type: 'number' },
                            },
                            required: ['id', 'type', 'swarmId', 'instance'],
                        },
                    },
                    required: ['conversationId', 'agent'],
                },
            },
            {
                name: 'conversation_send_message',
                description: 'Send a message in a conversation',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string', description: 'Conversation ID' },
                        fromAgent: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                type: { type: 'string' },
                                swarmId: { type: 'string' },
                                instance: { type: 'number' },
                            },
                            required: ['id', 'type', 'swarmId', 'instance'],
                        },
                        toAgent: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                type: { type: 'string' },
                                swarmId: { type: 'string' },
                                instance: { type: 'number' },
                            },
                            description: 'Target agent (optional for broadcast)',
                        },
                        messageType: {
                            type: 'string',
                            enum: [
                                'task_request',
                                'task_response',
                                'question',
                                'answer',
                                'suggestion',
                                'critique',
                                'agreement',
                                'disagreement',
                                'clarification',
                                'summary',
                                'decision',
                            ],
                            description: 'Type of message',
                        },
                        text: { type: 'string', description: 'Message text content' },
                        code: { type: 'string', description: 'Optional code content' },
                        data: { type: 'object', description: 'Optional structured data' },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                            default: 'medium',
                            description: 'Message priority',
                        },
                        requiresResponse: {
                            type: 'boolean',
                            default: false,
                            description: 'Whether message requires a response',
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Message tags',
                        },
                    },
                    required: ['conversationId', 'fromAgent', 'messageType', 'text'],
                },
            },
            {
                name: 'conversation_get_history',
                description: 'Get conversation message history',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string', description: 'Conversation ID' },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of messages to return',
                            default: 50,
                        },
                        messageType: { type: 'string', description: 'Filter by message type' },
                        fromAgent: { type: 'string', description: 'Filter by sender agent ID' },
                    },
                    required: ['conversationId'],
                },
            },
            {
                name: 'conversation_terminate',
                description: 'Terminate a conversation and get outcomes',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string', description: 'Conversation ID' },
                        reason: { type: 'string', description: 'Optional termination reason' },
                    },
                    required: ['conversationId'],
                },
            },
            {
                name: 'conversation_search',
                description: 'Search conversations by criteria',
                inputSchema: {
                    type: 'object',
                    properties: {
                        agentId: { type: 'string', description: 'Filter by participant agent ID' },
                        pattern: { type: 'string', description: 'Filter by conversation pattern' },
                        domain: { type: 'string', description: 'Filter by domain' },
                        status: {
                            type: 'string',
                            enum: ['initializing', 'active', 'paused', 'completed', 'terminated', 'error'],
                            description: 'Filter by conversation status',
                        },
                        outcome: { type: 'string', description: 'Filter by outcome type' },
                        startDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Start date for date range filter',
                        },
                        endDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'End date for date range filter',
                        },
                        limit: { type: 'number', default: 20, description: 'Maximum results to return' },
                        offset: { type: 'number', default: 0, description: 'Results offset for pagination' },
                    },
                },
            },
            {
                name: 'conversation_get_patterns',
                description: 'Get available conversation patterns',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'conversation_moderate',
                description: 'Moderate a conversation (pause, resume, remove participant)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        conversationId: { type: 'string', description: 'Conversation ID' },
                        action: {
                            type: 'string',
                            enum: ['pause', 'resume', 'mute', 'unmute', 'warn', 'remove'],
                            description: 'Moderation action',
                        },
                        targetAgent: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                type: { type: 'string' },
                                swarmId: { type: 'string' },
                                instance: { type: 'number' },
                            },
                            description: 'Target agent for action (if applicable)',
                        },
                        reason: { type: 'string', description: 'Reason for moderation action' },
                        duration: {
                            type: 'number',
                            description: 'Duration in milliseconds (for temporary actions)',
                        },
                    },
                    required: ['conversationId', 'action', 'reason'],
                },
            },
        ];
    }
    /**
     * Handle conversation MCP tool calls.
     *
     * @param name
     * @param args
     */
    async handleToolCall(name, args) {
        switch (name) {
            case 'conversation_create':
                return this.createConversation(args);
            case 'conversation_join':
                return this.joinConversation(args);
            case 'conversation_send_message':
                return this.sendMessage(args);
            case 'conversation_get_history':
                return this.getHistory(args);
            case 'conversation_terminate':
                return this.terminateConversation(args);
            case 'conversation_search':
                return this.searchConversations(args);
            case 'conversation_get_patterns':
                return this.getPatterns();
            case 'conversation_moderate':
                return this.moderateConversation(args);
            default:
                throw new Error(`Unknown conversation tool: ${name}`);
        }
    }
    async createConversation(args) {
        const config = {
            title: args.title,
            description: args.description,
            pattern: args.pattern,
            context: {
                goal: args.goal,
                domain: args.domain,
                constraints: args.constraints || [],
                resources: [],
                expertise: [],
            },
            initialParticipants: args.participants,
            timeout: args.timeout,
        };
        const session = await this.orchestrator.createConversation(config);
        return {
            conversationId: session.id,
            title: session.title,
            status: session.status,
            participants: session.participants.length,
            startTime: session.startTime.toISOString(),
            message: `Created conversation "${session.title}" with ${session.participants.length} participants`,
        };
    }
    async joinConversation(args) {
        await this.orchestrator.joinConversation(args.conversationId, args.agent);
        return {
            success: true,
            message: `Agent ${args.agent.id} joined conversation ${args.conversationId}`,
        };
    }
    async sendMessage(args) {
        const message = {
            id: '', // Will be generated
            conversationId: args.conversationId,
            fromAgent: args.fromAgent,
            toAgent: args.toAgent,
            timestamp: new Date(),
            content: {
                text: args.text,
                code: args.code,
                data: args.data,
            },
            messageType: args.messageType,
            metadata: {
                priority: args.priority || 'medium',
                requiresResponse: args.requiresResponse || false,
                context: { goal: '', domain: '', constraints: [], resources: [], expertise: [] },
                tags: args.tags || [],
            },
        };
        await this.orchestrator.sendMessage(message);
        return {
            success: true,
            messageId: message.id,
            timestamp: message.timestamp.toISOString(),
            message: 'Message sent successfully',
        };
    }
    async getHistory(args) {
        const messages = await this.orchestrator.getConversationHistory(args.conversationId);
        let filteredMessages = messages;
        if (args.messageType) {
            filteredMessages = filteredMessages.filter((m) => m.messageType === args.messageType);
        }
        if (args.fromAgent) {
            filteredMessages = filteredMessages.filter((m) => m.fromAgent.id === args.fromAgent);
        }
        const limit = args.limit || 50;
        const recentMessages = filteredMessages.slice(-limit);
        return {
            conversationId: args.conversationId,
            messageCount: recentMessages.length,
            totalMessages: messages.length,
            messages: recentMessages.map((m) => ({
                id: m.id,
                fromAgent: m.fromAgent.id,
                toAgent: m.toAgent?.id,
                messageType: m.messageType,
                text: m.content.text,
                timestamp: m.timestamp.toISOString(),
                priority: m.metadata.priority,
                requiresResponse: m.metadata.requiresResponse,
                tags: m.metadata.tags,
            })),
        };
    }
    async terminateConversation(args) {
        const outcomes = await this.orchestrator.terminateConversation(args.conversationId, args.reason);
        return {
            conversationId: args.conversationId,
            status: 'completed',
            outcomesCount: outcomes.length,
            outcomes: outcomes.map((o) => ({
                type: o.type,
                confidence: o.confidence,
                contributors: o.contributors.map((c) => c.id),
                timestamp: o.timestamp.toISOString(),
            })),
            reason: args.reason,
            message: 'Conversation terminated successfully',
        };
    }
    async searchConversations(args) {
        const query = {
            agentId: args.agentId,
            pattern: args.pattern,
            domain: args.domain,
            status: args.status,
            outcome: args.outcome,
            limit: args.limit || 20,
            offset: args.offset || 0,
        };
        if (args.startDate && args.endDate) {
            query.dateRange = {
                start: new Date(args.startDate),
                end: new Date(args.endDate),
            };
        }
        // For this example, we'll create a mock memory instance
        const memory = await ConversationMemoryFactory.createWithJSON();
        const conversations = await memory.searchConversations(query);
        return {
            query: args,
            resultsCount: conversations.length,
            conversations: conversations.map((c) => ({
                id: c.id,
                title: c.title,
                status: c.status,
                participantCount: c.participants.length,
                messageCount: c.messages.length,
                startTime: c.startTime.toISOString(),
                endTime: c.endTime?.toISOString(),
                domain: c.context.domain,
                outcomesCount: c.outcomes.length,
            })),
        };
    }
    async getPatterns() {
        return {
            patterns: [
                {
                    name: 'code-review',
                    description: 'Multi-agent code review process',
                    roles: ['author', 'reviewer', 'moderator'],
                    estimatedDuration: '30-60 minutes',
                    participantRange: '2-5 agents',
                },
                {
                    name: 'problem-solving',
                    description: 'Collaborative problem-solving session',
                    roles: ['analyst', 'solver', 'validator'],
                    estimatedDuration: '60-120 minutes',
                    participantRange: '3-8 agents',
                },
                {
                    name: 'brainstorming',
                    description: 'Creative brainstorming and ideation',
                    roles: ['facilitator', 'contributor', 'evaluator'],
                    estimatedDuration: '45-90 minutes',
                    participantRange: '3-10 agents',
                },
                {
                    name: 'planning',
                    description: 'Project and task planning session',
                    roles: ['planner', 'analyst', 'reviewer'],
                    estimatedDuration: '60-180 minutes',
                    participantRange: '2-6 agents',
                },
            ],
        };
    }
    async moderateConversation(args) {
        const action = {
            type: args.action,
            target: args.targetAgent,
            reason: args.reason,
            duration: args.duration,
        };
        await this.orchestrator.moderateConversation(args.conversationId, action);
        return {
            success: true,
            action: args.action,
            conversationId: args.conversationId,
            targetAgent: args.targetAgent?.id,
            reason: args.reason,
            message: `Moderation action "${args.action}" applied successfully`,
        };
    }
    /**
     * Static method for backward compatibility.
     *
     * @deprecated Use instance method getTools() instead.
     */
    static getToolsStatic() {
        // Return a basic tool set without orchestrator dependency
        return [
            {
                name: 'conversation_create',
                description: 'Create a new multi-agent conversation session',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', description: 'Conversation title' },
                        pattern: { type: 'string', description: 'Conversation pattern' },
                    },
                    required: ['title', 'pattern'],
                },
            },
        ];
    }
}
/**
 * Factory for creating conversation MCP tools.
 *
 * @example
 */
export class ConversationMCPToolsFactory {
    static async create() {
        const memory = await ConversationMemoryFactory.createWithJSON();
        const orchestrator = new ConversationOrchestratorImpl(memory);
        return new ConversationMCPTools(orchestrator);
    }
}
