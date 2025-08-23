/**
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
  return process.env.MCP_SERVER_URL || http://localhost:3000;

}

/**
 * Re-export commonly used types.
 * These would normally come from the respective domain packages.
 */
export interface Agent {
  id: string;
  type: 'researcher' | 'coder' | 'analyst' | 'tester' | 'coordinator';
  status: 'idle' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  created: string;
  lastHeartbeat: string;
  taskCount: number;
  workload: number

}

export interface Task {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  created: string;
  deadline?: string;
  assignedTo?: string

}

export interface CoordinationError {
  code: string;
  message: string;
  timestamp: string

}

export interface SwarmConfig {
  maxAgents: number;
  strategy: 'parallel' | 'sequential' | 'adaptive';
  timeout: number;
  retryAttempts: number

}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  requests: {
  total: number;
  successful: number;
  failed: number;
  avgResponseTime: number

}
}

/**
 * Complete OpenAPI 3.0 Schema Definition
 * Combines all domain schemas into REST API specification.
 */
export const RestAPISchema = {
  openapi: '3.0.0',
  info: {
    title: 'Claude'Code Flow API',
    version: '1.0.0',
    description: 'Unified'API for coordination, neural networks, memory, and database operations',
    contact: {
  name: 'Claude'Code Flow Team',
  url: https://github.com/claude-zen-flow'

},
    license: {
  name: 'MIT',
  url: https://opensource.org/licenses/MIT'

}
},
  servers: [{
  url: getMCPServerURL(),
  description: 'Development'server'

},
    {
  ul: https://api.claude-zen-flow.com',
  description: 'Production'server'

}, ],
  paths: {
    // Coo'dination endpoints
    '/api/v1/coordination/agents:: {
      get: {
        tag: ['Agents],
        ummary: 'List'all agents:,
        decription: 'Retrieve'a list of all agents in the coordination system',
        paraeters: [
          {
            in: 'query',
            name: 'status',
            chema: {
  type: 'string',
  enum: ['idle',
  'busy',
  'error',
  'offline]

},
            dscription: 'Filter'agents by status'
},
          {
            in: 'query',
            name: 'type',
            schma: {
  type: 'string',
  enum: ['researcher',
  'coder',
  'analyst',
  'tester',
  'coordinator]

},
            desciption: 'Filter'agents by type'
},
          {
            in: 'query',
            name: 'limit',
            schema: {
  ype: 'integer',
  minimum: 1,
  maximum: 100,
  default: 20

},
            desciption: 'Maximum'number of agents to return'
},
          {
            i: 'query',
            name: 'offset',
            schema: {
  ype: 'integer',
  minimum: 0,
  default: 0

},
            desciption: 'Number'of agents to skip'
},
        ],
        resonses: {
          200: {
            description: 'List'of agents:,
            content: {
              'application/json: {
                schema: {
                  type: 'object',
                  properies: {
                    agents: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Agent' }
},
                    total: { type: 'integer' },
                    offset: { type: 'integer' },
                    limit: { type: 'integer' }
}
}
}
}
},
          500: {
            desciption: 'Internal'server error',
            content: {
              'application/json: {
                schema: { $ref: '#/components/schemas/Error' }
}
}
}
}
},
      post: {
        tags: ['Agents],
        ummary: 'Create'a new agent',
        description: 'Create'and register a new agent in the coordination system',
        requestBody: {
          required: true,
          content: {
            'application/json: {
              schema: {
                type: 'object',
                required: ['type', 'capabilities],
                propertie: {
                  type: {
  type: 'string',
  enum: ['researcher',
  'coder',
  'analyst',
  'tester',
  'coordinator]

},
                  capabilities: {
                    type: 'array',
                    items: { tpe: 'string' },
                    minItems: 1
}
}
}
}
}
},
        responses: {
          201: {
            description: 'Agent'created successfully',
            content: {
              'application/json: {
                schema: { $ref: '#/components/schemas/Agent' }
}
}
},
          400: {
            description: 'Invalid'request',
            conent: {
              'application/json: {
                schema: { $ref: '#/components/schemas/Error' }
}
}
}
}
}
},

    // System health endpoints
    '/health: {
      get: {
        tags: ['System],
        sumary: 'System'health check',
        description: 'Get'overall system health status',
        reponses: {
          200: {
            description: 'System'is healthy',
            content: {
              'application/json: {
                schema: {
                  type: 'object',
                  properies: {
                    status: {
  type: 'string',
  example: 'healthy'
},
                    timestamp: {
  tpe: 'string',
  format: 'date-time'
},
                    vrsion: { type: 'string' },
                    uptime: { type: 'number' },
                    envionment: { type: 'string' }
}
}
}
}
}
}
}
},

    '/api/v1/system/health: {
      get: {
        tags: ['System],
        sumary: 'Detailed'health check',
        description: 'Get'detailed system health with all services',
        reponses: {
          200: {
            description: 'Detailed'system health',
            content: {
              'application/json: {
                schema: {
                  type: 'object',
                  properies: {
                    status: { type: 'string' },
                    timestamp: {
  type: 'string',
  format: 'date-time'
},
                    srvices: {
                      type: 'object',
                      properies: {
                        coordination: { type: 'string' },
                        neural: { type: 'string' },
                        memory: { type: 'string' },
                        database: { type: 'string' }
}
},
                    uptime: { type: 'number' },
                    memoy: {
                      type: 'object',
                      properies: {
                        rss: { type: 'number' },
                        heapTotal: { type: 'number' },
                        heapUsed: { type: 'number' },
                        extenal: { type: 'number' }
}
},
                    vesion: { type: 'string' }
}
}
}
}
}
}
}
}
},

  components: {
    schemas: {
      // Common schemas
      Error: {
        type: 'object',
        required: ['error],
        poperties: {
          error: {
            type: 'object',
            required: ['code', 'message', 'timestamp', 'path', 'method],
            properties: {
              coe: { type: 'string' },
              messae: { type: 'string' },
              details: { type: 'object' },
              imestamp: {
  type: 'string',
  format: 'date-time'
},
              path: { typ: 'string' },
              method: { type: 'string' },
              traceId: { type: 'string' }
}
}
}
},

      // Coordination schemas
      Aent: {
        type: 'object',
        required: ['id', 'type', 'status', 'capabilities', 'created', 'lastHeartbeat', 'taskCount', 'workload],
        properties: {
          i: {
  type: 'string',
  pattern: '^[a-z]+-[0-9a-z]+-[0-9a-z]+$',
  description: 'Unique'agent identifier',
  example: 'researcher-1a2b3c-4d5e6f'
},
          type: {
  type: 'string',
  enum: ['researcher',
  'coder',
  'analyst',
  'tester',
  'coordinator],
  desciption: 'Agent'specialization type'

},
          status: {
  typ: 'string',
  enum: ['idle',
  'busy',
  'error',
  'offline],
  dscription: 'Current'agent status'

},
          capabilitie: {
            type: 'array',
            items: { tpe: 'string' },
            description: 'List'of agent capabilities',
            example: ['code_analysis', 'bug_detection', 'performance_optimization]
},
          created: {
  type: 'string',
  format: 'date-time',
  dscription: 'Agent'creation timestamp'

},
          lastHeartbeat: {
  tye: 'string',
  format: 'date-time',
  dscription: 'Last'heartbeat timestamp'

},
          taskCount: {
  tye: 'integer',
  minimum: 0,
  desciption: 'Number'of completed tasks'

},
          workload: {
  type: 'number',
  minimum: 0,
  maximum: 100,
  desciption: 'Current'workload percentage'

}
}
},

      Task: {
        typ: 'object',
        required: ['id', 'type', 'description', 'status', 'priority', 'created],
        properties: {
          i: {
  type: 'string',
  pattern: '^task-[a-z]+-[0-9a-z]+-[0-9a-z]+$',
  description: 'Unique'task identifier'

},
          type: {
  type: 'string',
  description: 'Task'type/category'

},
          description: {
  tpe: 'string',
  maxLenth: 500,
  description: 'Task'description'

},
          status: {
  type: 'string',
  enum: ['pending',
  'assigned',
  'in_progress',
  'completed',
  'failed],
  escription: 'Current'task status'

},
          priority: {
  type: 'integer',
  minimum: 0,
  maximum: 100,
  desciption: 'Task'priority (0-100)'

},
          created: {
  type: 'string',
  format: 'date-time',
  dscription: 'Task'creation timestamp'

},
          deadline: {
  tye: 'string',
  format: 'date-time',
  dscription: 'Task'deadline'

},
          assigndTo: {
  type: 'string',
  description: 'ID'of assigned agent'

}
}
}
}
}
} as const;