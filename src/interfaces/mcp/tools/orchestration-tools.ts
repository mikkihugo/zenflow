const orchestrationTools: MCPTool[] = [
  {
    name: 'workflow_create',
    description: 'Create a new workflow configuration',
    category: 'orchestration',
    version: '1.0.0',
    priority: 1,
    metadata: {
      tags: ['workflow', 'orchestration', 'automation'],
      examples: [
        {
          name: 'Create CI/CD workflow',
          params: { type: 'ci-cd', steps: ['build', 'test', 'deploy'] },
        },
      ],
    },
    permissions: [{ type: 'write', resource: 'workflow' }],
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['ci-cd', 'data-pipeline', 'monitoring'], default: 'ci-cd' },
        steps: { type: 'array', items: { type: 'string' } },
        schedule: { type: 'string' },
      },
      required: ['name', 'steps'],
    },
    handler: async (params: any) => {
      const { name, type = 'ci-cd', steps, schedule } = params;

      const workflowId = `workflow_${Date.now()}`;

      return {
        success: true,
        data: {
          workflowId,
          name,
          type,
          steps,
          schedule,
          status: 'created',
          createdAt: new Date().toISOString(),
          estimatedDuration: `${steps.length * 5} minutes`,
        },
      };
    },
  },

  {
    name: 'deployment_status',
    description: 'Get status of deployments and services',
    category: 'orchestration',
    version: '1.0.0',
    priority: 1,
    metadata: {
      tags: ['deployment', 'status', 'monitoring'],
      examples: [
        {
          name: 'Get deployment status',
          params: { environment: 'production' },
        },
      ],
    },
    permissions: [{ type: 'read', resource: 'deployment' }],
    inputSchema: {
      type: 'object',
      properties: {
        deploymentId: { type: 'string' },
        environment: { type: 'string', enum: ['development', 'staging', 'production'] },
        includeHistory: { type: 'boolean', default: false },
      },
    },
    handler: async (params: any) => {
      const { deploymentId, environment, includeHistory = false } = params;

      const deployments = [
        {
          id: 'deploy_001',
          service: 'api-gateway',
          environment: 'production',
          status: 'running',
          version: 'v1.2.3',
          health: 'healthy',
          uptime: '5d 12h',
        },
        {
          id: 'deploy_002',
          service: 'database',
          environment: 'production',
          status: 'running',
          version: 'v2.1.0',
          health: 'healthy',
          uptime: '12d 8h',
        },
      ];

      let filteredDeployments = deployments;

      if (deploymentId) {
        filteredDeployments = deployments.filter((d) => d.id === deploymentId);
      }

      if (environment) {
        filteredDeployments = filteredDeployments.filter((d) => d.environment === environment);
      }

      return {
        success: true,
        data: {
          deployments: filteredDeployments,
          count: filteredDeployments.length,
          environment,
          history: includeHistory
            ? {
                lastDeployment: '2 hours ago',
                successRate: '98.5%',
                averageDuration: '8 minutes',
              }
            : undefined,
        },
      };
    },
  },

  {
    name: 'service_orchestrate',
    description: 'Orchestrate multiple services in a coordinated manner',
    category: 'orchestration',
    version: '1.0.0',
    priority: 2,
    metadata: {
      tags: ['service', 'coordination', 'microservices'],
      examples: [
        {
          name: 'Orchestrate services',
          params: { services: ['api', 'database', 'cache'], action: 'restart' },
        },
      ],
    },
    permissions: [{ type: 'execute', resource: 'service' }],
    inputSchema: {
      type: 'object',
      properties: {
        services: { type: 'array', items: { type: 'string' } },
        action: { type: 'string', enum: ['start', 'stop', 'restart', 'scale'] },
        parallel: { type: 'boolean', default: false },
        rollback: { type: 'boolean', default: true },
      },
      required: ['services', 'action'],
    },
    handler: async (params: any) => {
      const { services, action, parallel = false, rollback = true } = params;

      const orchestrationId = `orchestration_${Date.now()}`;

      const results = services.map((service: string) => ({
        service,
        action,
        status: 'completed',
        duration: `${Math.floor(Math.random() * 30) + 10}s`,
      }));

      return {
        success: true,
        data: {
          orchestrationId,
          services,
          action,
          parallel,
          rollback,
          results,
          overallStatus: 'completed',
          totalDuration: parallel ? '45s' : `${services.length * 25}s`,
          timestamp: new Date().toISOString(),
        },
      };
    },
  },
];

export default orchestrationTools;
