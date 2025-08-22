/**
 * OpenAPI 3.0 + Swagger Configuration
 * Complete API documentation for Claude Code Zen
 */

export const swaggerOptions = {
  definition: {
    openapi: '3..0',
    info: {
      title: 'Claude Code Zen API',
      version: '1..0',
      description: `
# Claude Code Zen API

Comprehensive API for the Claude Code Zen platform, providing:
- AI Governance Unit (AGU) workflow management
- Development roadmap planning
- Expert consultation system (Matron)
- Real-time system health monitoring
- WebSocket communication

## Features
- ✅ RESTful API design
- ✅ Real-time WebSocket support  
- ✅ Comprehensive error handling
- ✅ Rate limiting & security
- ✅ Request validation
- ✅ OpenAPI 3.0 documentation

## Authentication
Currently using development mode. Production will implement JWT authentication.

## Rate Limiting
- 100 requests per minute per P
- 429 status code returned when exceeded

## Error Handling
All errors follow consistent format:
\`\`\`json
{
  "success": false,
  "error: Error Type",
  "message: Detailed error message",
  "timestamp: 2024-01-15T1:30:00Z"
}
\`\`\`
      `,
      contact: {
        name: 'Claude Code Zen Team',
        url: 'https://github.com/zen-neural/claude-code-zen',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.claudecodezen.com/api',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            data: {
              type: 'object',
              description: 'Response data (when successful)',
            },
            error: {
              type: 'string',
              description: 'Error type (when failed)',
            },
            message: {
              type: 'string',
              description: 'Human-readable message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'SO timestamp of response',
            },
          },
          required: ['success, timestamp'],
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy, degraded', 'unhealthy'],
              description: 'Overall system health status',
            },
            uptime: {
              type: 'number',
              description: 'System uptime in seconds',
            },
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number, description: Used memory in MB' },
                total: { type: 'number, description: Total memory in MB' },
              },
            },
            version: {
              type: 'string',
              description: 'API version',
            },
            environment: {
              type: 'string',
              enum: ['development, staging', 'production'],
              description: 'Current environment',
            },
          },
          required: ['status, uptime', 'version'],
        },
        Workflow: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique workflow identifier',
              example: 'wf-001',
            },
            title: {
              type: 'string',
              description: 'Workflow title',
              example: 'Authentication System Review',
            },
            description: {
              type: 'string',
              description: 'Detailed workflow description',
            },
            status: {
              type: 'string',
              enum: [
                'pending_approval',
                'in_review',
                'approved',
                'rejected',
                'completed',
              ],
              description: 'Current workflow status',
            },
            priority: {
              type: 'string',
              enum: ['low, medium', 'high, critical'],
              description: 'Workflow priority level',
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Submission timestamp',
            },
            submittedBy: {
              type: 'string',
              description: 'User who submitted the workflow',
            },
            estimatedEffort: {
              type: 'string',
              description: 'Estimated effort required',
              example: '2-3 days',
            },
            riskLevel: {
              type: 'string',
              enum: ['low, medium', 'high'],
              description: 'Associated risk level',
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of dependencies',
            },
          },
          required: ['id, title', 'status, priority', 'submittedAt'],
        },
        Roadmap: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique roadmap identifier',
              example: 'rm-001',
            },
            title: {
              type: 'string',
              description: 'Roadmap title',
            },
            description: {
              type: 'string',
              description: 'Roadmap description',
            },
            status: {
              type: 'string',
              enum: ['planning, active', 'on_hold, completed', 'cancelled'],
              description: 'Current roadmap status',
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Completion percentage',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Roadmap start date',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Roadmap end date',
            },
            owner: {
              type: 'string',
              description: 'Roadmap owner/team',
            },
            milestones: {
              type: 'number',
              description: 'Total number of milestones',
            },
            completedMilestones: {
              type: 'number',
              description: 'Number of completed milestones',
            },
          },
          required: ['id, title', 'status, progress'],
        },
        Consultation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique consultation identifier',
              example: 'cons-001',
            },
            title: {
              type: 'string',
              description: 'Consultation title',
            },
            description: {
              type: 'string',
              description: 'Detailed consultation description',
            },
            expert: {
              type: 'string',
              description: 'Expert name and credentials',
            },
            expertise: {
              type: 'array',
              items: { type: 'string' },
              description: 'Expert areas of expertise',
            },
            status: {
              type: 'string',
              enum: ['pending, in_progress', 'completed, cancelled'],
              description: 'Consultation status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Completion timestamp',
            },
            recommendation: {
              type: 'string',
              description: 'Expert recommendation',
            },
            confidence: {
              type: 'string',
              enum: ['low, medium', 'high'],
              nullable: true,
              description: 'Confidence level in recommendation',
            },
            followUpRequired: {
              type: 'boolean',
              description: 'Whether follow-up is needed',
            },
          },
          required: ['id, title', 'expert, status', 'createdAt'],
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              enum: [false],
              description: 'Always false for errors',
            },
            error: {
              type: 'string',
              description: 'Error type or category',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
            details: {
              type: 'object',
              description: 'Additional error details (development only)',
              additionalProperties: true,
            },
          },
          required: ['success, error', 'message, timestamp'],
        },
      },
      responses: {
        Success: {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResponse' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Not Found',
                message: 'The requested resource was not found',
                timestamp: '2024-01-15T1:30:00Z',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Validation Error',
                message: 'Invalid request parameters',
                timestamp: '2024-01-15T1:30:00Z',
              },
            },
          },
        },
        RateLimitExceeded: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                timestamp: '2024-01-15T1:30:00Z',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: 'Internal Server Error',
                message: 'Something went wrong',
                timestamp: '2024-01-15T1:30:00Z',
              },
            },
          },
        },
      },
      parameters: {
        WorkflowStatus: {
          name: 'status',
          in: 'query',
          description: 'Filter workflows by status',
          required: false,
          schema: {
            type: 'string',
            enum: [
              'pending_approval',
              'in_review',
              'approved',
              'rejected',
              'completed',
            ],
          },
        },
        WorkflowPriority: {
          name: 'priority',
          in: 'query',
          description: 'Filter workflows by priority',
          required: false,
          schema: {
            type: 'string',
            enum: ['low, medium', 'high, critical'],
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'System health and monitoring endpoints',
      },
      {
        name: 'AGU',
        description: 'AI Governance Unit workflow management',
      },
      {
        name: 'Roadmap',
        description: 'Development roadmap planning and tracking',
      },
      {
        name: 'Matron',
        description: 'Expert consultation and advisory system',
      },
      {
        name: 'WebSocket',
        description: 'Real-time communication endpoints',
      },
    ],
  },
  apis: [
    "./src/interfaces/web/web-api-routes',
    "./src/interfaces/web/swagger-docs',
  ],
};

export const swaggerUiOptions = {
  customSiteTitle: 'Claude Code Zen API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
};
