/* eslint-disable @typescript-eslint/naming-convention */
/*
 * REST API Schemas.
 *
 * Consolidated OpenAPI 3.0 schemas from all domains.
 * Provides single source of truth for API documentation and validation.
 *
 * @file REST API schemas for all domains.
 */

// Import domain-specific schemas
export * from './common';

// Simple fallback for MCP server URL
function getMCPServerURL(): string {
  return process.env['MCP_SERVER_URL'] || 'http://localhost:3000';
}

/**
 * Re-export commonly used types.
 * These would normally come from the respective domain packages.
 */
export interface Agent {
  id: string;
  type: 'researcher' | ' coder' | ' analyst' | ' tester' | ' coordinator';
  status: 'idle' | ' busy' | ' error' | ' offline';
  capabilities: string[];
  created: string;
  lastHeartbeat: string;
  taskCount: number;
  workload: number;
}

export interface Task {
  id: string;
  type: string;
  description: string;
  status: 'pending' | ' assigned' | ' in_progress' | ' completed' | ' failed';
  priority: number;
  created: string;
  deadline?: string;
  assignedTo?: string;
}

export interface CoordinationError {
  code: string;
  message: string;
  timestamp: string;
}

export interface SwarmConfig {
  maxAgents: number;
  strategy: 'parallel' | ' sequential' | ' adaptive';
  timeout: number;
  retryAttempts: number;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  requests: {
    total: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  };
}

/**
 * Complete OpenAPI 3.0 Schema Definition
 * Combines all domain schemas into REST API specification.
 */
export const restAPISchema = {
  openapi: '3.0.0',
  info: {
    title: 'Claude Code Zen API',
    version: '1.0.0',
    description:
      'Unified API for coordination, neural networks, memory, and database operations',
    contact: {
      name: 'Claude Code Zen Team',
      url: 'https://github.com/claude-zen-flow',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: getMCPServerURL(),
      description: 'Development server',
    },
    {
      url: 'https://api.claude-zen-flow.com',
      description: 'Production server',
    },
  ],
  paths: {
    // Coordination endpoints
    '/api/v1/coordination/agents': {
      get: {
        tags: ['Agents'],
        summary: 'List all agents',
        description: 'Retrieve a list of all agents in the coordination system',
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['idle', 'busy', 'error', 'offline'],
            },
            description: 'Filter agents by status',
          },
          {
            in: 'query',
            name: 'type',
            schema: {
              type: 'string',
              enum: ['researcher', 'coder', 'analyst', 'tester', 'coordinator'],
            },
            description: 'Filter agents by type',
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            description: 'Maximum number of agents to return',
          },
          {
            in: 'query',
            name: 'offset',
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0,
            },
            description: 'Number of agents to skip',
          },
        ],
        responses: {
          '200': {
            description: 'List of agents',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    agents: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Agent' },
                    },
                    total: { type: 'integer' },
                    offset: { type: 'integer' },
                    limit: { type: 'integer' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Agents'],
        summary: 'Create a new agent',
        description:
          'Create and register a new agent in the coordination system',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'capabilities'],
                properties: {
                  type: {
                    type: 'string',
                    enum: [
                      'researcher',
                      'coder',
                      'analyst',
                      'tester',
                      'coordinator',
                    ],
                  },
                  capabilities: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Agent created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Agent' },
              },
            },
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    // System health endpoints
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System health check',
        description: 'Get overall system health status',
        responses: {
          '200': {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'healthy',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    version: { type: 'string' },
                    uptime: { type: 'number' },
                    environment: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/system/health': {
      get: {
        tags: ['System'],
        summary: 'Detailed health check',
        description: 'Get detailed system health with all services',
        responses: {
          '200': {
            description: 'Detailed system health',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    services: {
                      type: 'object',
                      properties: {
                        coordination: { type: 'string' },
                        neural: { type: 'string' },
                        memory: { type: 'string' },
                        database: { type: 'string' },
                      },
                    },
                    uptime: { type: 'number' },
                    memory: {
                      type: 'object',
                      properties: {
                        rss: { type: 'number' },
                        heapTotal: { type: 'number' },
                        heapUsed: { type: 'number' },
                        external: { type: 'number' },
                      },
                    },
                    version: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  components: {
    schemas: {
      // Common schemas
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'timestamp', 'path', 'method'],
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              path: { type: 'string' },
              method: { type: 'string' },
              traceId: { type: 'string' },
            },
          },
        },
      },

      // Coordination schemas
      Agent: {
        type: 'object',
        required: [
          'id',
          'type',
          'status',
          'capabilities',
          'created',
          'lastHeartbeat',
          'taskCount',
          'workload',
        ],
        properties: {
          id: {
            type: 'string',
            pattern: '^[a-z]+-[0-9a-z]+-[0-9a-z]+$',
            description: 'Unique agent identifier',
            example: 'researcher-1a2b3c-4d5e6f',
          },
          type: {
            type: 'string',
            enum: ['researcher', 'coder', 'analyst', 'tester', 'coordinator'],
            description: 'Agent specialization type',
          },
          status: {
            type: 'string',
            enum: ['idle', 'busy', 'error', 'offline'],
            description: 'Current agent status',
          },
          capabilities: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of agent capabilities',
            example: [
              'code_analysis',
              'bug_detection',
              'performance_optimization',
            ],
          },
          created: {
            type: 'string',
            format: 'date-time',
            description: 'Agent creation timestamp',
          },
          lastHeartbeat: {
            type: 'string',
            format: 'date-time',
            description: 'Last heartbeat timestamp',
          },
          taskCount: {
            type: 'integer',
            minimum: 0,
            description: 'Number of completed tasks',
          },
          workload: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Current workload percentage',
          },
        },
      },

      Task: {
        type: 'object',
        required: [
          'id',
          'type',
          'description',
          'status',
          'priority',
          'created',
        ],
        properties: {
          id: {
            type: 'string',
            pattern: '^task-[a-z]+-[0-9a-z]+-[0-9a-z]+$',
            description: 'Unique task identifier',
          },
          type: {
            type: 'string',
            description: 'Task type/category',
          },
          description: {
            type: 'string',
            maxLength: 500,
            description: 'Task description',
          },
          status: {
            type: 'string',
            enum: ['pending', 'assigned', 'in_progress', 'completed', 'failed'],
            description: 'Current task status',
          },
          priority: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            description: 'Task priority (0-100)',
          },
          created: {
            type: 'string',
            format: 'date-time',
            description: 'Task creation timestamp',
          },
          deadline: {
            type: 'string',
            format: 'date-time',
            description: 'Task deadline',
          },
          assignedTo: {
            type: 'string',
            description: 'ID of assigned agent',
          },
        },
      },
    },
  },
} as const;
