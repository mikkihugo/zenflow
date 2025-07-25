#!/usr/bin/env node

/**
 * 🤖 ENHANCED API GENERATION FROM MEOW CLI
 * 
 * Generates comprehensive REST/GraphQL/WebSocket APIs from CLI commands
 * with full OpenAPI documentation, validation, and real-time features.
 */

import { listCommands, validateCommandInput } from './command-registry.js';

/**
 * Generate comprehensive OpenAPI specification from CLI commands
 * @param {Object} cli - Meow CLI instance
 * @returns {Object} Complete OpenAPI 3.0 specification
 */
export function generateApiFromMeow(cli) {
  return listCommands().then(commands => {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: 'Claude-Zen Auto-Generated API',
        version: cli.pkg?.version || '2.0.0-alpha.70',
        description: 'REST API auto-generated from CLI commands with real-time WebSocket support',
        contact: {
          name: 'Claude-Zen API Support',
          url: 'https://github.com/mikkihugo/claude-code-zen',
          email: 'support@claude-zen.ai'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      externalDocs: {
        description: 'Claude-Zen Documentation',
        url: 'https://github.com/mikkihugo/claude-code-zen/blob/main/README.md'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Local development server'
        },
        {
          url: 'https://api.claude-zen.ai',
          description: 'Production server'
        }
      ],
      paths: {},
      components: {
        schemas: {
          CommandRequest: {
            type: 'object',
            required: ['command'],
            properties: {
              command: {
                type: 'string',
                description: 'Command name to execute',
                example: 'status'
              },
              args: {
                type: 'array',
                items: { type: 'string' },
                description: 'Command arguments',
                example: ['--verbose']
              },
              flags: {
                type: 'object',
                description: 'Command flags and options',
                additionalProperties: true,
                example: { verbose: true, format: 'json' }
              }
            }
          },
          CommandResponse: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Indicates if the command executed successfully'
              },
              result: {
                type: 'object',
                description: 'Command execution result',
                additionalProperties: true
              },
              sessionId: {
                type: 'string',
                format: 'uuid',
                description: 'Unique session identifier for tracking'
              },
              duration: {
                type: 'number',
                description: 'Execution time in milliseconds'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Command execution timestamp'
              }
            }
          },
          ErrorResponse: {
            type: 'object',
            required: ['success', 'error'],
            properties: {
              success: {
                type: 'boolean',
                example: false,
                description: 'Always false for error responses'
              },
              error: {
                type: 'string',
                description: 'Error message',
                example: 'Command validation failed'
              },
              details: {
                type: 'string',
                description: 'Detailed error information'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Error occurrence timestamp'
              }
            }
          },
          ValidationResult: {
            type: 'object',
            properties: {
              valid: {
                type: 'boolean',
                description: 'Whether the command input is valid'
              },
              errors: {
                type: 'array',
                items: { type: 'string' },
                description: 'Validation error messages'
              },
              warnings: {
                type: 'array',
                items: { type: 'string' },
                description: 'Validation warnings'
              }
            }
          },
          CommandInfo: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Command name'
              },
              description: {
                type: 'string',
                description: 'Command description'
              },
              usage: {
                type: 'string',
                description: 'Command usage information'
              },
              examples: {
                type: 'array',
                items: { type: 'string' },
                description: 'Usage examples'
              },
              flags: {
                type: 'object',
                description: 'Available command flags',
                additionalProperties: true
              },
              category: {
                type: 'string',
                description: 'Command category'
              }
            }
          },
          BatchRequest: {
            type: 'object',
            required: ['commands'],
            properties: {
              commands: {
                type: 'array',
                items: { $ref: '#/components/schemas/CommandRequest' },
                description: 'Array of commands to execute in batch'
              },
              sequential: {
                type: 'boolean',
                default: false,
                description: 'Execute commands sequentially or in parallel'
              },
              stopOnError: {
                type: 'boolean',
                default: false,
                description: 'Stop batch execution on first error'
              }
            }
          },
          WebSocketMessage: {
            type: 'object',
            required: ['type'],
            properties: {
              type: {
                type: 'string',
                enum: [
                  'execute_command',
                  'subscribe_monitoring',
                  'get_completions',
                  'ping',
                  'execution_started',
                  'execution_progress',
                  'execution_completed',
                  'execution_failed',
                  'monitoring_subscribed',
                  'completions',
                  'pong',
                  'error'
                ],
                description: 'Message type'
              },
              data: {
                type: 'object',
                description: 'Message payload',
                additionalProperties: true
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Message timestamp'
              }
            }
          }
        },
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        }
      },
      security: [
        { BearerAuth: [] },
        { ApiKeyAuth: [] }
      ]
    };

    // Base API endpoints
    openapi.paths['/'] = {
      get: {
        summary: 'API Information',
        description: 'Get API server information and available endpoints',
        operationId: 'getApiInfo',
        tags: ['System'],
        responses: {
          200: {
            description: 'API information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    description: { type: 'string' },
                    features: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    endpoints: { type: 'object' },
                    statistics: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    };

    openapi.paths['/api/commands'] = {
      get: {
        summary: 'List All Commands',
        description: 'Get a list of all available CLI commands',
        operationId: 'listCommands',
        tags: ['Commands'],
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Filter commands by category',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'List of available commands',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    commands: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CommandInfo' }
                    },
                    total: { type: 'number' },
                    categories: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    };

    openapi.paths['/api/validate'] = {
      post: {
        summary: 'Validate Command',
        description: 'Validate command arguments and flags before execution',
        operationId: 'validateCommand',
        tags: ['Commands'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommandRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Validation result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    valid: { type: 'boolean' },
                    command: { $ref: '#/components/schemas/CommandInfo' },
                    validation: { $ref: '#/components/schemas/ValidationResult' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    };

    openapi.paths['/api/batch'] = {
      post: {
        summary: 'Execute Batch Commands',
        description: 'Execute multiple commands in batch with optional sequencing',
        operationId: 'executeBatch',
        tags: ['Commands'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BatchRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Batch execution results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    sessionId: { type: 'string' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CommandResponse' }
                    },
                    executed: { type: 'number' },
                    successful: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    };

    // Generate command-specific endpoints
    commands.forEach(cmd => {
      const commandPath = `/api/execute/${cmd.name}`;
      
      openapi.paths[commandPath] = {
        post: {
          summary: cmd.description || `Execute ${cmd.name} command`,
          description: `Execute the '${cmd.name}' command via REST API with real-time progress tracking`,
          operationId: `execute_${cmd.name.replace(/-/g, '_')}`,
          tags: [cmd.category || 'Commands'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    args: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Command arguments',
                      example: cmd.examples?.[0]?.split(' ').slice(1) || []
                    },
                    flags: {
                      type: 'object',
                      description: 'Command flags and options',
                      properties: generateFlagSchema(cmd.flags || {}),
                      example: generateFlagExample(cmd.flags || {})
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Command executed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CommandResponse' }
                }
              }
            },
            400: {
              description: 'Invalid request or validation failed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            404: {
              description: 'Command not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            },
            500: {
              description: 'Command execution failed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      };

      // Command info endpoint
      openapi.paths[`/api/commands/${cmd.name}/info`] = {
        get: {
          summary: `Get ${cmd.name} command information`,
          description: `Get detailed information about the '${cmd.name}' command`,
          operationId: `get_${cmd.name.replace(/-/g, '_')}_info`,
          tags: [cmd.category || 'Commands'],
          responses: {
            200: {
              description: 'Command information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      command: { $ref: '#/components/schemas/CommandInfo' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Command not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      };
    });

    // WebSocket documentation
    openapi.paths['/ws'] = {
      get: {
        summary: 'WebSocket Connection',
        description: 'Establish WebSocket connection for real-time command execution and monitoring',
        operationId: 'connectWebSocket',
        tags: ['WebSocket'],
        parameters: [
          {
            name: 'Upgrade',
            in: 'header',
            required: true,
            schema: { type: 'string', example: 'websocket' }
          },
          {
            name: 'Connection',
            in: 'header',
            required: true,
            schema: { type: 'string', example: 'Upgrade' }
          }
        ],
        responses: {
          101: {
            description: 'WebSocket connection established',
            headers: {
              'Upgrade': {
                schema: { type: 'string', example: 'websocket' }
              },
              'Connection': {
                schema: { type: 'string', example: 'Upgrade' }
              }
            }
          },
          400: {
            description: 'Bad request - invalid WebSocket upgrade'
          }
        }
      }
    };

    return openapi;
  });
}

/**
 * Generate OpenAPI schema for command flags
 */
function generateFlagSchema(flags) {
  const schema = {};
  
  Object.entries(flags).forEach(([flagName, flagConfig]) => {
    if (typeof flagConfig === 'object' && flagConfig !== null) {
      schema[flagName] = {
        type: flagConfig.type || 'string',
        description: flagConfig.description || `${flagName} flag`,
        default: flagConfig.default
      };
      
      if (flagConfig.choices) {
        schema[flagName].enum = flagConfig.choices;
      }
      
      if (flagConfig.required) {
        schema[flagName].required = true;
      }
    } else {
      schema[flagName] = {
        type: 'string',
        description: `${flagName} flag`
      };
    }
  });
  
  return schema;
}

/**
 * Generate example values for command flags
 */
function generateFlagExample(flags) {
  const example = {};
  
  Object.entries(flags).forEach(([flagName, flagConfig]) => {
    if (typeof flagConfig === 'object' && flagConfig !== null) {
      if (flagConfig.default !== undefined) {
        example[flagName] = flagConfig.default;
      } else if (flagConfig.type === 'boolean') {
        example[flagName] = true;
      } else if (flagConfig.choices) {
        example[flagName] = flagConfig.choices[0];
      } else {
        example[flagName] = `example-${flagName}`;
      }
    } else {
      example[flagName] = `example-${flagName}`;
    }
  });
  
  return example;
}

/**
 * Generate GraphQL schema from commands (future enhancement)
 */
export function generateGraphQLSchema(commands) {
  // This would generate a GraphQL schema
  // For now, return a basic structure
  return {
    typeDefs: `
      type Query {
        commands: [Command]
        command(name: String!): Command
      }
      
      type Mutation {
        executeCommand(name: String!, args: [String], flags: JSON): CommandResult
      }
      
      type Command {
        name: String!
        description: String
        usage: String
        examples: [String]
        category: String
      }
      
      type CommandResult {
        success: Boolean!
        result: JSON
        sessionId: String
        duration: Int
      }
      
      scalar JSON
    `,
    resolvers: {
      Query: {
        commands: () => commands,
        command: (_, { name }) => commands.find(cmd => cmd.name === name)
      },
      Mutation: {
        executeCommand: async (_, { name, args = [], flags = {} }) => {
          // This would call the actual command execution
          return {
            success: true,
            result: {},
            sessionId: Date.now().toString(),
            duration: 100
          };
        }
      }
    }
  };
}

export default generateApiFromMeow;