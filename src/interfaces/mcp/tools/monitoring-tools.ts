const monitoringTools: MCPTool[] = [
  {
    name: 'swarm_status',
    description: 'Get comprehensive status of all active swarms',
    category: 'monitoring',
    version: '1.0.0',
    priority: 1,
    metadata: {
      tags: ['swarm', 'status', 'monitoring'],
      examples: [
        {
          name: 'Get swarm status',
          params: { detailed: true },
        },
      ],
    },
    permissions: [{ type: 'read', resource: 'swarm' }],
    inputSchema: {
      type: 'object',
      properties: {
        swarmId: { type: 'string' },
        detailed: { type: 'boolean', default: false },
        includeMetrics: { type: 'boolean', default: true },
      },
    },
    handler: async (params: unknown) => {
      const { swarmId, detailed = false, includeMetrics = true } = params;

      return {
        success: true,
        data: {
          swarms: swarmId
            ? [
                {
                  id: swarmId,
                  status: 'active',
                  agents: 5,
                  topology: 'hierarchical',
                  uptime: '2h 15m',
                },
              ]
            : [
                {
                  id: 'swarm_001',
                  status: 'active',
                  agents: 5,
                  topology: 'hierarchical',
                  uptime: '2h 15m',
                },
                {
                  id: 'swarm_002',
                  status: 'idle',
                  agents: 3,
                  topology: 'mesh',
                  uptime: '45m',
                },
              ],
          metrics: includeMetrics
            ? {
                totalSwarms: 2,
                activeAgents: 8,
                averageResponseTime: '50ms',
                throughput: '120 tasks/min',
              }
            : undefined,
          detailed: detailed
            ? {
                lastUpdate: new Date().toISOString(),
                healthScore: 0.95,
              }
            : undefined,
        },
      };
    },
  },

  {
    name: 'agent_metrics',
    description: 'Get performance metrics for agents',
    category: 'monitoring',
    version: '1.0.0',
    priority: 1,
    metadata: {
      tags: ['agent', 'metrics', 'performance'],
      examples: [
        {
          name: 'Get agent metrics',
          params: { timeRange: '1h' },
        },
      ],
    },
    permissions: [{ type: 'read', resource: 'agent' }],
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string' },
        timeRange: { type: 'string', default: '1h' },
        includeHistory: { type: 'boolean', default: false },
      },
    },
    handler: async (params: unknown) => {
      const { agentId, timeRange = '1h', includeHistory = false } = params;

      return {
        success: true,
        data: {
          agents: agentId
            ? [
                {
                  id: agentId,
                  type: 'researcher',
                  status: 'active',
                  tasksCompleted: 15,
                  averageTaskTime: '2.5m',
                  successRate: '94%',
                },
              ]
            : [
                {
                  id: 'agent_001',
                  type: 'researcher',
                  status: 'active',
                  tasksCompleted: 15,
                  averageTaskTime: '2.5m',
                  successRate: '94%',
                },
                {
                  id: 'agent_002',
                  type: 'coder',
                  status: 'active',
                  tasksCompleted: 8,
                  averageTaskTime: '5.2m',
                  successRate: '100%',
                },
              ],
          timeRange,
          history: includeHistory
            ? {
                timestamps: ['14:00', '14:15', '14:30', '14:45', '15:00'],
                values: [85, 92, 88, 94, 90],
              }
            : undefined,
        },
      };
    },
  },

  {
    name: 'task_status',
    description: 'Monitor task execution status and progress',
    category: 'monitoring',
    version: '1.0.0',
    priority: 1,
    metadata: {
      tags: ['task', 'status', 'progress'],
      examples: [
        {
          name: 'Get task status',
          params: { status: 'running' },
        },
      ],
    },
    permissions: [{ type: 'read', resource: 'task' }],
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string' },
        status: {
          type: 'string',
          enum: ['pending', 'running', 'completed', 'failed'],
        },
        includeDetails: { type: 'boolean', default: false },
      },
    },
    handler: async (params: unknown) => {
      const { taskId, status, includeDetails = false } = params;

      const tasks = [
        {
          id: 'task_001',
          name: 'Analyze codebase',
          status: 'running',
          progress: 65,
          assignee: 'agent_001',
          startTime: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'task_002',
          name: 'Generate tests',
          status: 'completed',
          progress: 100,
          assignee: 'agent_002',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          completedTime: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'task_003',
          name: 'Review documentation',
          status: 'pending',
          progress: 0,
          assignee: null,
        },
      ];

      let filteredTasks = tasks;

      if (taskId) {
        filteredTasks = tasks.filter((t) => t.id === taskId);
      }

      if (status) {
        filteredTasks = filteredTasks.filter((t) => t.status === status);
      }

      return {
        success: true,
        data: {
          tasks: filteredTasks,
          summary: {
            total: tasks.length,
            pending: tasks.filter((t) => t.status === 'pending').length,
            running: tasks.filter((t) => t.status === 'running').length,
            completed: tasks.filter((t) => t.status === 'completed').length,
            failed: tasks.filter((t) => t.status === 'failed').length,
          },
          details: includeDetails
            ? {
                averageExecutionTime: '4.2m',
                successRate: '92%',
                queueDepth: 3,
              }
            : undefined,
        },
      };
    },
  },
];

export default monitoringTools;
