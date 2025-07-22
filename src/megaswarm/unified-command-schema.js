/**
 * MEGASWARM: Unified Command Schema with Auto-Generated APIs
 * Single source of truth for CLI/TUI/Web interfaces
 * Context-preserving multi-Claude orchestration
 */

export const UNIFIED_COMMAND_SCHEMA = {
  // === MEGASWARM COMMANDS ===
  megaswarm: {
    description: '🌊 Launch massive context-preserving Claude swarm',
    category: 'orchestration',
    args: ['<objective>'],
    options: {
      instances: { 
        type: 'number', 
        default: 5, 
        max: 50, 
        description: 'Number of Claude instances to spawn' 
      },
      topology: { 
        type: 'string', 
        choices: ['mesh', 'hierarchical', 'ring', 'star', 'hybrid'], 
        default: 'hierarchical',
        description: 'Swarm topology for coordination'
      },
      contextMode: { 
        type: 'string', 
        choices: ['shared', 'distributed', 'hybrid'], 
        default: 'hybrid',
        description: 'Context preservation strategy'
      },
      autoScale: { 
        type: 'boolean', 
        default: true,
        description: 'Enable automatic scaling based on workload'
      },
      persistence: { 
        type: 'boolean', 
        default: true,
        description: 'Enable cross-session context persistence'
      },
      monitoring: { 
        type: 'boolean', 
        default: true,
        description: 'Enable real-time swarm monitoring'
      }
    },
    interfaces: {
      cli: { enabled: true, priority: 'high' },
      tui: { enabled: true, tab: 'megaswarm', hotkey: 'M', icon: '🌊' },
      web: { enabled: true, endpoint: '/api/megaswarm', method: 'POST' }
    },
    spawning: {
      claudeInstances: true,
      contextSharing: true,
      realTimeCoordination: true
    }
  },

  // === SWARM COORDINATION ===
  'swarm-spawn': {
    description: '🐝 Spawn coordinated Claude instance in active swarm',
    category: 'coordination',
    args: ['[swarm-id]'],
    options: {
      role: { 
        type: 'string', 
        choices: ['coordinator', 'researcher', 'coder', 'analyst', 'architect', 'tester', 'optimizer'], 
        default: 'general',
        description: 'Specialized role for the spawned instance'
      },
      contextAccess: { 
        type: 'string', 
        choices: ['full', 'filtered', 'readonly'], 
        default: 'full',
        description: 'Level of context access for the instance'
      },
      priority: { 
        type: 'string', 
        choices: ['low', 'medium', 'high', 'critical'], 
        default: 'medium',
        description: 'Task priority level'
      }
    },
    interfaces: {
      cli: { enabled: true, priority: 'high' },
      tui: { enabled: true, tab: 'swarm', hotkey: 's' },
      web: { enabled: true, endpoint: '/api/swarm/spawn', method: 'POST' }
    }
  },

  // === CONTEXT MANAGEMENT ===
  'context-sync': {
    description: '💾 Synchronize context across all Claude instances',
    category: 'context',
    args: [],
    options: {
      mode: { 
        type: 'string', 
        choices: ['full', 'incremental', 'priority'], 
        default: 'incremental',
        description: 'Synchronization mode'
      },
      broadcast: { 
        type: 'boolean', 
        default: true,
        description: 'Broadcast context updates to all instances'
      }
    },
    interfaces: {
      cli: { enabled: true, priority: 'medium' },
      tui: { enabled: true, tab: 'context', hotkey: 'C' },
      web: { enabled: true, endpoint: '/api/context/sync', method: 'POST' }
    }
  },

  // === ENHANCED EXISTING COMMANDS ===
  swarm: {
    description: '🐝 Multi-agent swarm orchestration with Claude spawning',
    category: 'orchestration',
    args: ['<objective>'],
    options: {
      strategy: { 
        type: 'string', 
        choices: ['research', 'development', 'analysis', 'testing', 'optimization'], 
        default: 'adaptive',
        description: 'Execution strategy'
      },
      maxAgents: { 
        type: 'number', 
        default: 5, 
        max: 20,
        alias: 'agents',
        description: 'Maximum number of agents'
      },
      topology: { 
        type: 'string', 
        choices: ['hierarchical', 'mesh', 'ring', 'star', 'hybrid'], 
        default: 'hierarchical',
        description: 'Coordination topology'
      },
      parallel: { 
        type: 'boolean', 
        default: true,
        description: 'Enable parallel execution'
      },
      monitor: { 
        type: 'boolean', 
        default: true,
        description: 'Enable real-time monitoring'
      },
      spawnClaude: { 
        type: 'boolean', 
        default: false,
        description: 'Spawn new Claude instances for agents'
      },
      contextPreservation: { 
        type: 'boolean', 
        default: true,
        description: 'Preserve context across instances'
      }
    },
    interfaces: {
      cli: { enabled: true, priority: 'high' },
      tui: { enabled: true, tab: 'swarm', hotkey: 's', icon: '🐝' },
      web: { enabled: true, endpoint: '/api/swarm', method: 'POST' }
    }
  },

  // === MONITORING & STATUS ===
  'swarm-status': {
    description: '📊 Real-time swarm status and metrics',
    category: 'monitoring',
    args: ['[swarm-id]'],
    options: {
      detailed: { 
        type: 'boolean', 
        default: false,
        description: 'Show detailed metrics'
      },
      watch: { 
        type: 'boolean', 
        default: false,
        description: 'Watch mode with live updates'
      },
      format: { 
        type: 'string', 
        choices: ['table', 'json', 'yaml'], 
        default: 'table',
        description: 'Output format'
      }
    },
    interfaces: {
      cli: { enabled: true, priority: 'medium' },
      tui: { enabled: true, tab: 'status', hotkey: 'S' },
      web: { enabled: true, endpoint: '/api/swarm/status/:id?', method: 'GET' }
    }
  },

  // === API AUTO-GENERATION METADATA ===
  __meta: {
    apiVersion: '2.0.0',
    autoGenerate: {
      enabled: true,
      baseUrl: '/api/v2',
      authentication: 'optional',
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000 // requests per window
      }
    },
    contextSharing: {
      enabled: true,
      strategy: 'hybrid',
      persistence: 'sqlite',
      encryption: false // TODO: implement encryption
    },
    spawning: {
      maxInstances: 50,
      defaultTimeout: 300000, // 5 minutes
      healthCheck: true
    }
  }
};

/**
 * Generate meow CLI configuration from unified schema
 */
export function generateMeowConfig(schema) {
  const commands = Object.entries(schema)
    .filter(([key]) => !key.startsWith('__'))
    .map(([name, config]) => ({
      name,
      description: config.description,
      category: config.category || 'general'
    }));

  const flags = {};
  
  // Generate unified flags from all commands
  Object.entries(schema).forEach(([cmdName, cmdConfig]) => {
    if (cmdName.startsWith('__')) return;
    
    Object.entries(cmdConfig.options || {}).forEach(([optName, optConfig]) => {
      const flagName = `${cmdName}-${optName}`;
      flags[flagName] = {
        type: optConfig.type,
        default: optConfig.default,
        alias: optConfig.alias,
        choices: optConfig.choices
      };
    });
  });

  return { commands, flags };
}

/**
 * Auto-generate Express API routes from schema
 */
export function generateAPIRoutes(schema, express) {
  const router = express.Router();
  
  Object.entries(schema).forEach(([cmdName, cmdConfig]) => {
    if (cmdName.startsWith('__') || !cmdConfig.interfaces?.web?.enabled) return;
    
    const { endpoint, method } = cmdConfig.interfaces.web;
    const httpMethod = method.toLowerCase();
    
    // Auto-generate route handler
    router[httpMethod](endpoint, async (req, res) => {
      try {
        const args = req.body.args || [];
        const options = { ...req.body.options, ...req.query };
        
        // Execute unified command
        const result = await executeUnifiedCommand(cmdName, args, options, {
          interface: 'web',
          requestId: req.headers['x-request-id'],
          userId: req.headers['x-user-id']
        });
        
        res.json({
          success: true,
          command: cmdName,
          result,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          command: cmdName,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  // Auto-generate OpenAPI documentation endpoint
  router.get('/schema', (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'Claude-Zen Megaswarm API',
        version: schema.__meta?.apiVersion || '2.0.0'
      },
      paths: generateOpenAPIPaths(schema)
    });
  });
  
  return router;
}

/**
 * Generate OpenAPI paths from schema
 */
function generateOpenAPIPaths(schema) {
  const paths = {};
  
  Object.entries(schema).forEach(([cmdName, cmdConfig]) => {
    if (cmdName.startsWith('__') || !cmdConfig.interfaces?.web?.enabled) return;
    
    const { endpoint, method } = cmdConfig.interfaces.web;
    
    if (!paths[endpoint]) paths[endpoint] = {};
    
    paths[endpoint][method.toLowerCase()] = {
      summary: cmdConfig.description,
      tags: [cmdConfig.category || 'general'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                args: { type: 'array', items: { type: 'string' } },
                options: generateOptionsSchema(cmdConfig.options)
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
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  result: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    };
  });
  
  return paths;
}

/**
 * Generate JSON Schema for command options
 */
function generateOptionsSchema(options) {
  if (!options) return { type: 'object' };
  
  const properties = {};
  const required = [];
  
  Object.entries(options).forEach(([name, config]) => {
    properties[name] = {
      type: config.type,
      default: config.default,
      description: config.description
    };
    
    if (config.choices) {
      properties[name].enum = config.choices;
    }
    
    if (config.required) {
      required.push(name);
    }
  });
  
  return {
    type: 'object',
    properties,
    required
  };
}

export default UNIFIED_COMMAND_SCHEMA;