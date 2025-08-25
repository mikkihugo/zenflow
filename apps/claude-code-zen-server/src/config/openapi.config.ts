/* eslint-disable @typescript-eslint/naming-convention */
/**
 * OpenAPI 3.0 + Swagger Configuration
 * Complete API documentation for Claude Code Zen
 * Uses foundation package configuration system
 */

// Constants for duplicate strings
const APPLICATION_JSON = 'application/json';
const ERROR_MESSAGE = 'An error occurred';
const API_RESPONSE_REF = '#/components/schemas/ApiResponse';

interface GlobalFoundation {
  foundation: {
    getConfig: () => unknown;
    getVersion: () => string;
  };
}

const { getConfig: getFoundationConfig, getVersion } = (global as GlobalFoundation).foundation;

const config = getFoundationConfig();
const version = getVersion();

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Claude Code Zen API',
      version,
      description: `
        # Claude Code Zen API Documentation
        
        Comprehensive API for the claude-code-zen system featuring:
        
        ## Core Features
        - **Multi-Agent Coordination**: Advanced TypeScript swarm architecture
        - **Neural Intelligence**: DSPy integration with cognitive patterns  
        - **Memory Systems**: Multi-database persistence (SQLite, LanceDB, Kuzu)
        - **Performance Analytics**: Real-time monitoring and prediction
        - **Event-Driven Architecture**: Type-safe event coordination
        - **SPARC Integration**: Systematic architecture development
        
        ## Architecture Overview
        The system uses a hierarchical coordination structure:
        - **Queens**: Top-level strategic coordination
        - **Commanders**: Task planning and resource allocation  
        - **Cubes**: Specialized domain processing
        - **Matrons**: Local agent cluster management
        - **Agents/Drones**: Task execution units
        
        ## Database Integration
        - **SQLite**: Primary structured data storage
        - **LanceDB**: Vector embeddings and similarity search
        - **Kuzu**: Graph database for relationship modeling
        
        ## External Integrations
        - **Claude API**: Primary LLM coordination
        - **Gemini API**: Alternative LLM capabilities
        - **GitHub Copilot**: Code generation assistance
        - **OpenAI**: Additional AI services
        
        ## Security & Performance
        - Rate limiting and request validation
        - Comprehensive error handling
        - Performance monitoring and optimization
        - Graceful degradation patterns
        
        ## Usage Notes
        All endpoints return JSON responses with consistent error formatting.
        Authentication is required for modification operations.
        Read operations are generally public for monitoring purposes.
      `,
      contact: {
        name: 'Claude Code Zen Project',
        email: 'contact@claude-zen.dev',
        url: 'https://github.com/zen-neural/claude-code-zen'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [{
      url: `http://localhost:${config.port || 3000}/api/v1`,
      description: 'Development server'
    }],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            message: {
              type: 'string',
              description: 'Human readable message about the response'
            },
            data: {
              type: 'object',
              description: 'The actual response data'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the response was generated'
            },
            requestId: {
              type: 'string',
              description: 'Unique identifier for request tracing'
            }
          },
          required: ['success', 'message', 'timestamp']
        },
        
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
              description: 'Overall system health status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            version: {
              type: 'string',
              description: 'Current system version'
            },
            uptime: {
              type: 'number',
              description: 'System uptime in seconds'
            },
            components: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'number' }
                  }
                },
                coordination: {
                  type: 'object',
                  properties: {
                    activeAgents: { type: 'number' },
                    queuedTasks: { type: 'number' }
                  }
                }
              }
            }
          },
          required: ['status', 'timestamp', 'version', 'uptime']
        },
        
        TaskmasterTask: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique task identifier'
            },
            type: {
              type: 'string',
              enum: ['coordination', 'analysis', 'generation', 'optimization'],
              description: 'Type of task to be executed'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task execution priority'
            },
            status: {
              type: 'string',
              enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
              description: 'Current task status'
            },
            description: {
              type: 'string',
              description: 'Human-readable task description'
            },
            parameters: {
              type: 'object',
              description: 'Task-specific parameters and configuration'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            },
            estimatedDuration: {
              type: 'number',
              description: 'Estimated completion time in seconds'
            },
            assignedAgents: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of agent IDs assigned to this task'
            }
          },
          required: ['id', 'type', 'priority', 'status', 'description']
        },
        
        Roadmap: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique roadmap identifier'
            },
            title: {
              type: 'string',
              description: 'Roadmap title'
            },
            description: {
              type: 'string',
              description: 'Detailed roadmap description'
            },
            status: {
              type: 'string',
              enum: ['planning', 'in-progress', 'completed', 'on-hold'],
              description: 'Current roadmap status'
            },
            phases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                  dependencies: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'title', 'status', 'phases']
        },
        
        Consultation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique consultation identifier'
            },
            type: {
              type: 'string',
              enum: ['technical', 'strategic', 'architectural', 'performance'],
              description: 'Type of consultation requested'
            },
            title: {
              type: 'string',
              description: 'Consultation title/summary'
            },
            description: {
              type: 'string',
              description: 'Detailed consultation request'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Consultation priority level'
            },
            status: {
              type: 'string',
              enum: ['requested', 'in-progress', 'completed', 'cancelled'],
              description: 'Current consultation status'
            },
            requesterInfo: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                organization: { type: 'string' }
              }
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the consultation is scheduled'
            },
            duration: {
              type: 'number',
              description: 'Expected duration in minutes'
            },
            notes: {
              type: 'string',
              description: 'Additional notes and requirements'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'type', 'title', 'description', 'priority', 'status']
        }
      },
      
      responses: {
        Error: {
          description: 'Error response',
          content: {
            [APPLICATION_JSON]: {
              schema: {
                allOf: [
                  { $ref: API_RESPONSE_REF },
                  {
                    type: 'object',
                    properties: {
                      success: { 
                        type: 'boolean', 
                        example: false 
                      },
                      error: {
                        type: 'object',
                        properties: {
                          code: { type: 'string' },
                          message: { type: 'string' },
                          details: { type: 'object' }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        
        Success: {
          description: 'Success response',
          content: {
            [APPLICATION_JSON]: {
              schema: { $ref: API_RESPONSE_REF }
            }
          }
        },
        
        NotFound: {
          description: 'Resource not found',
          content: {
            [APPLICATION_JSON]: {
              schema: { 
                $ref: API_RESPONSE_REF,
                example: { success: false, message: ERROR_MESSAGE }
              }
            }
          }
        },
        
        ValidationError: {
          description: 'Validation error in request data',
          content: {
            [APPLICATION_JSON]: {
              schema: {
                allOf: [
                  { $ref: API_RESPONSE_REF },
                  {
                    type: 'object',
                    properties: {
                      validationErrors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            field: { type: 'string' },
                            message: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        
        RateLimitExceeded: {
          description: 'Rate limit exceeded',
          content: {
            [APPLICATION_JSON]: {
              schema: { $ref: API_RESPONSE_REF }
            }
          }
        },
        
        InternalServerError: {
          description: 'Internal server error',
          content: {
            [APPLICATION_JSON]: {
              schema: { $ref: API_RESPONSE_REF }
            }
          }
        }
      }
    },
    
    tags: [
      {
        name: 'WorkflowStatus',
        description: 'Workflow status and monitoring endpoints'
      },
      {
        name: 'Health',
        description: 'System health and status checks'
      },
      {
        name: 'Taskmaster',
        description: 'Task management and coordination'
      },
      {
        name: 'Roadmaps',
        description: 'Project roadmap management'
      },
      {
        name: 'Consultations',
        description: 'Consultation request management'
      }
    ]
  },
  
  apis: [
    './src/interfaces/web/api-route-handler.ts',
    './src/interfaces/web/web-api-routes.ts',
    './src/interfaces/api/**/*.ts'
  ]
};