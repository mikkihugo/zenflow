/**
 * @fileoverview Shared Type Definitions for Swarm Operations
 *
 * Common types used across all interfaces (stdio MCP, HTTP API, HTTP MCP)
 * to ensure consistency in swarm coordination functionality.
 */
// Validation schemas (for API endpoints)
export const SwarmConfigSchema = {
    type: 'object',
    properties: {
        topology: {
            type: 'string',
            enum: ['mesh', 'hierarchical', 'ring', 'star'],
        },
        maxAgents: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 5,
        },
        strategy: {
            type: 'string',
            enum: ['balanced', 'specialized', 'adaptive', 'parallel'],
            default: 'adaptive',
        },
    },
    required: ['topology'],
    additionalProperties: false,
};
export const AgentConfigSchema = {
    type: 'object',
    properties: {
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
        },
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
        },
        capabilities: {
            type: 'array',
            items: { type: 'string' },
        },
        cognitive_pattern: {
            type: 'string',
            enum: [
                'convergent',
                'divergent',
                'lateral',
                'systems',
                'critical',
                'adaptive',
            ],
            default: 'adaptive',
        },
    },
    required: ['type'],
    additionalProperties: false,
};
export const TaskOrchestrationSchema = {
    type: 'object',
    properties: {
        task: {
            type: 'string',
            minLength: 10,
            maxLength: 1000,
        },
        strategy: {
            type: 'string',
            enum: ['parallel', 'sequential', 'adaptive'],
            default: 'adaptive',
        },
        priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        maxAgents: {
            type: 'number',
            minimum: 1,
            maximum: 10,
            default: 5,
        },
    },
    required: ['task'],
    additionalProperties: false,
};
//# sourceMappingURL=swarm-types.js.map