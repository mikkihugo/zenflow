/**
 * @fileoverview MCP Tools Registry
 * Centralized tool definitions and schema management for MCP server
 * @module MCPToolsRegistry
 */

/**
 * Initialize swarm coordination tools
 * @returns {Object} Swarm coordination tool definitions
 */
export function initializeSwarmTools() {
  return {
    swarm_init: {
      name: 'swarm_init',
      description: 'Initialize swarm with topology and configuration',
      inputSchema: {
        type: 'object',
        properties: {
          topology: { type: 'string', enum: ['hierarchical', 'mesh', 'ring', 'star'] },
          maxAgents: { type: 'number', default: 8 },
          strategy: { type: 'string', default: 'auto' }
        },
        required: ['topology']
      }
    },
    agent_spawn: {
      name: 'agent_spawn',
      description: 'Create specialized AI agents',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['coordinator', 'researcher', 'coder', 'analyst', 'architect', 'tester', 'reviewer', 'optimizer', 'documenter', 'monitor', 'specialist'] },
          name: { type: 'string' },
          capabilities: { type: 'array' },
          swarmId: { type: 'string' }
        },
        required: ['type']
      }
    },
    task_orchestrate: {
      name: 'task_orchestrate',
      description: 'Orchestrate complex task workflows',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string' },
          strategy: { type: 'string', enum: ['parallel', 'sequential', 'adaptive', 'balanced'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          dependencies: { type: 'array' }
        },
        required: ['task']
      }
    },
    swarm_status: {
      name: 'swarm_status',
      description: 'Monitor swarm health and performance',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' }
        }
      }
    },
    swarm_monitor: {
      name: 'swarm_monitor',
      description: 'Real-time swarm monitoring with performance metrics',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          interval: { type: 'number', default: 5000 },
          metrics: { type: 'array', default: ['performance', 'coordination', 'workload'] }
        }
      }
    }
  };
}

/**
 * Initialize neural network tools
 * @returns {Object} Neural network tool definitions
 */
export function initializeNeuralTools() {
  return {
    neural_status: {
      name: 'neural_status',
      description: 'Check neural network status',
      inputSchema: {
        type: 'object',
        properties: {
          modelId: { type: 'string' }
        }
      }
    },
    neural_train: {
      name: 'neural_train',
      description: 'Train neural patterns with WASM SIMD acceleration',
      inputSchema: {
        type: 'object',
        properties: {
          pattern_type: { type: 'string', enum: ['coordination', 'optimization', 'prediction'] },
          training_data: { type: 'string' },
          epochs: { type: 'number', default: 50 }
        },
        required: ['pattern_type', 'training_data']
      }
    },
    neural_patterns: {
      name: 'neural_patterns',
      description: 'Analyze cognitive patterns',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['analyze', 'learn', 'predict'] },
          operation: { type: 'string' },
          outcome: { type: 'string' },
          metadata: { type: 'object' }
        },
        required: ['action']
      }
    }
  };
}

/**
 * Initialize memory management tools
 * @returns {Object} Memory management tool definitions
 */
export function initializeMemoryTools() {
  return {
    memory_usage: {
      name: 'memory_usage',
      description: 'Manage shared memory across agents',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['store', 'retrieve', 'delete', 'list', 'search'] },
          key: { type: 'string' },
          value: { type: 'string' },
          namespace: { type: 'string', default: 'default' },
          ttl: { type: 'number' }
        },
        required: ['action']
      }
    },
    benchmark_run: {
      name: 'benchmark_run',
      description: 'Performance benchmarks with detailed metrics',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['coordination', 'memory', 'neural', 'full'] },
          iterations: { type: 'number', default: 100 },
          parallel: { type: 'boolean', default: false }
        },
        required: ['type']
      }
    }
  };
}

/**
 * Initialize agent management tools
 * @returns {Object} Agent management tool definitions
 */
export function initializeAgentTools() {
  return {
    agent_list: {
      name: 'agent_list',
      description: 'List all agents with their status',
      inputSchema: {
        type: 'object',
        properties: {
          swarmId: { type: 'string' },
          status: { type: 'string', enum: ['active', 'idle', 'busy', 'error'] },
          type: { type: 'string' }
        }
      }
    },
    agent_metrics: {
      name: 'agent_metrics',
      description: 'Get detailed agent performance metrics',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          timeframe: { type: 'string', enum: ['1h', '24h', '7d'], default: '1h' },
          metrics: { type: 'array', default: ['performance', 'workload', 'success_rate'] }
        }
      }
    }
  };
}

/**
 * Initialize task management tools
 * @returns {Object} Task management tool definitions
 */
export function initializeTaskTools() {
  return {
    task_status: {
      name: 'task_status',
      description: 'Monitor task execution status',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          detailed: { type: 'boolean', default: false }
        }
      }
    },
    task_results: {
      name: 'task_results',
      description: 'Retrieve task execution results',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          format: { type: 'string', enum: ['json', 'summary', 'detailed'], default: 'json' }
        },
        required: ['taskId']
      }
    }
  };
}

/**
 * Initialize system tools
 * @returns {Object} System tool definitions
 */
export function initializeSystemTools() {
  return {
    features_detect: {
      name: 'features_detect',
      description: 'Detect available features and capabilities',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['neural', 'coordination', 'memory', 'all'], default: 'all' }
        }
      }
    }
  };
}

/**
 * Combine all tool definitions into a single registry
 * @returns {Object} Complete tools registry
 */
export function initializeAllTools() {
  return {
    ...initializeSwarmTools(),
    ...initializeNeuralTools(),
    ...initializeMemoryTools(),
    ...initializeAgentTools(),
    ...initializeTaskTools(),
    ...initializeSystemTools()
  };
}

/**
 * Get tool schema by name
 * @param {string} toolName - Name of the tool
 * @returns {Object|null} Tool schema or null if not found
 */
export function getToolSchema(toolName) {
  const allTools = initializeAllTools();
  return allTools[toolName] || null;
}

/**
 * Validate tool arguments against schema
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Arguments to validate
 * @returns {Object} Validation result
 */
export function validateToolArgs(toolName, args) {
  const schema = getToolSchema(toolName);
  
  if (!schema) {
    return {
      valid: false,
      error: `Unknown tool: ${toolName}`
    };
  }

  // Basic validation - in production, use a proper JSON schema validator
  const required = schema.inputSchema.required || [];
  const properties = schema.inputSchema.properties || {};
  
  for (const field of required) {
    if (!(field in args)) {
      return {
        valid: false,
        error: `Missing required field: ${field}`
      };
    }
  }

  // Type validation for known properties
  for (const [key, value] of Object.entries(args)) {
    if (properties[key]) {
      const prop = properties[key];
      
      if (prop.enum && !prop.enum.includes(value)) {
        return {
          valid: false,
          error: `Invalid value for ${key}: must be one of [${prop.enum.join(', ')}]`
        };
      }
      
      if (prop.type === 'number' && typeof value !== 'number') {
        return {
          valid: false,
          error: `Invalid type for ${key}: expected number, got ${typeof value}`
        };
      }
      
      if (prop.type === 'string' && typeof value !== 'string') {
        return {
          valid: false,
          error: `Invalid type for ${key}: expected string, got ${typeof value}`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Get tool categories
 * @returns {Array} Array of tool categories
 */
export function getToolCategories() {
  return [
    { name: 'swarm', description: 'Swarm coordination and management', count: Object.keys(initializeSwarmTools()).length },
    { name: 'neural', description: 'Neural network operations', count: Object.keys(initializeNeuralTools()).length },
    { name: 'memory', description: 'Memory management operations', count: Object.keys(initializeMemoryTools()).length },
    { name: 'agent', description: 'Agent lifecycle management', count: Object.keys(initializeAgentTools()).length },
    { name: 'task', description: 'Task orchestration and monitoring', count: Object.keys(initializeTaskTools()).length },
    { name: 'system', description: 'System utilities and features', count: Object.keys(initializeSystemTools()).length }
  ];
}