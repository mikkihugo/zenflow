/**
 * @fileoverview MCP Tools Registry
 * Claude Zen CLI command tools for MCP protocol
 * @module MCPToolsRegistry
 */

import { gitTools } from './git-tools.js';

/**
 * Initialize Claude Zen core command tools
 * @returns {Object} Claude Zen command tool definitions
 */
export function initializeClaudeZenTools() {
  return {
    claude_zen_init: {
      name: 'claude_zen_init',
      description: 'Initialize Claude Zen project in directory',
      inputSchema: {
        type: 'object',
        properties: {
          directory: { type: 'string', description: 'Project directory name' },
          force: { type: 'boolean', default: false, description: 'Force overwrite existing files' },
          template: { type: 'string', description: 'Project template to use' }
        }
      }
    },
    claude_zen_status: {
      name: 'claude_zen_status',
      description: 'Get Claude Zen system status and health',
      inputSchema: {
        type: 'object',
        properties: {
          verbose: { type: 'boolean', default: false, description: 'Show detailed status' }
        }
      }
    },
    claude_zen_config: {
      name: 'claude_zen_config',
      description: 'Manage Claude Zen system configuration',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['list', 'get', 'set'], description: 'Configuration action' },
          key: { type: 'string', description: 'Configuration key' },
          value: { type: 'string', description: 'Configuration value (for set action)' }
        },
        required: ['action']
      }
    },
    claude_zen_hive_mind: {
      name: 'claude_zen_hive_mind',
      description: 'Advanced Hive Mind swarm intelligence operations',
      inputSchema: {
        type: 'object',
        properties: {
          subcommand: { type: 'string', enum: ['init', 'spawn', 'status', 'optimize'], description: 'Hive mind operation' },
          objective: { type: 'string', description: 'Task objective for spawn command' },
          options: { type: 'object', description: 'Additional options' }
        },
        required: ['subcommand']
      }
    },
    claude_zen_swarm: {
      name: 'claude_zen_swarm',
      description: 'Launch temporary swarm coordination',
      inputSchema: {
        type: 'object',
        properties: {
          objective: { type: 'string', description: 'Swarm objective/task' },
          topology: { type: 'string', enum: ['hierarchical', 'mesh', 'ring', 'star'], default: 'hierarchical' },
          maxAgents: { type: 'number', default: 8, description: 'Maximum number of agents' }
        },
        required: ['objective']
      }
    },
    claude_zen_agent: {
      name: 'claude_zen_agent',
      description: 'Manage AI agents and hierarchies',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['spawn', 'list', 'status', 'terminate'], description: 'Agent action' },
          type: { type: 'string', description: 'Agent type (for spawn action)' },
          agentId: { type: 'string', description: 'Agent ID (for status/terminate actions)' }
        },
        required: ['action']
      }
    },
    claude_zen_task: {
      name: 'claude_zen_task',
      description: 'Manage tasks and workflows',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['create', 'list', 'status', 'cancel'], description: 'Task action' },
          description: { type: 'string', description: 'Task description (for create action)' },
          taskId: { type: 'string', description: 'Task ID (for status/cancel actions)' }
        },
        required: ['action']
      }
    },
    claude_zen_memory: {
      name: 'claude_zen_memory',
      description: 'Memory management operations',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['search', 'store', 'retrieve', 'cleanup'], description: 'Memory action' },
          query: { type: 'string', description: 'Search query or key' },
          data: { type: 'object', description: 'Data to store' },
          namespace: { type: 'string', default: 'default', description: 'Memory namespace' }
        },
        required: ['action']
      }
    },
    claude_zen_github: {
      name: 'claude_zen_github',
      description: 'GitHub workflow automation',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['analyze', 'pr', 'issue', 'workflow'], description: 'GitHub action' },
          repository: { type: 'string', description: 'Repository name' },
          options: { type: 'object', description: 'Action-specific options' }
        },
        required: ['action']
      }
    },
    claude_zen_hooks: {
      name: 'claude_zen_hooks',
      description: 'Claude Code hooks integration',
      inputSchema: {
        type: 'object',
        properties: {
          hook: { type: 'string', enum: ['pre-command', 'post-command', 'pre-edit', 'post-edit', 'session-end'], description: 'Hook type' },
          file: { type: 'string', description: 'Target file path' },
          command: { type: 'string', description: 'Command being executed' },
          options: { type: 'object', description: 'Hook options' }
        },
        required: ['hook']
      }
    }
  };
}

/**
 * Initialize Product Management tools for planning with queens
 * @returns {Object} Product management tool definitions
 */
export function initializeProductTools() {
  return {
    prd_create: {
      name: 'prd_create',
      description: 'Create Product Requirements Document',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Product title' },
          description: { type: 'string', description: 'Product description' },
          objectives: { type: 'array', description: 'Business objectives' },
          targetAudience: { type: 'string', description: 'Target user audience' },
          requirements: { type: 'array', description: 'Functional requirements' },
          acceptanceCriteria: { type: 'array', description: 'Acceptance criteria' },
          timeline: { type: 'string', description: 'Expected timeline' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'], default: 'P2' }
        },
        required: ['title', 'description', 'objectives']
      }
    },
    prd_update: {
      name: 'prd_update',
      description: 'Update existing PRD',
      inputSchema: {
        type: 'object',
        properties: {
          prdId: { type: 'string', description: 'PRD identifier' },
          updates: { type: 'object', description: 'Fields to update' },
          reason: { type: 'string', description: 'Reason for update' }
        },
        required: ['prdId', 'updates']
      }
    },
    vision_create: {
      name: 'vision_create',
      description: 'Create product vision and strategy',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Vision title' },
          vision: { type: 'string', description: 'Long-term vision statement' },
          mission: { type: 'string', description: 'Mission statement' },
          goals: { type: 'array', description: 'Strategic goals' },
          keyMetrics: { type: 'array', description: 'Success metrics' },
          timeHorizon: { type: 'string', enum: ['1Y', '2Y', '3Y', '5Y'], description: 'Time horizon' },
          stakeholders: { type: 'array', description: 'Key stakeholders' }
        },
        required: ['title', 'vision', 'goals']
      }
    },
    epic_create: {
      name: 'epic_create',
      description: 'Create product epic',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Epic title' },
          description: { type: 'string', description: 'Epic description' },
          businessValue: { type: 'string', description: 'Business value proposition' },
          userStory: { type: 'string', description: 'High-level user story' },
          acceptanceCriteria: { type: 'array', description: 'Epic-level acceptance criteria' },
          estimatedEffort: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], description: 'Effort estimation' },
          priority: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
          dependencies: { type: 'array', description: 'Epic dependencies' },
          tags: { type: 'array', description: 'Epic tags/labels' }
        },
        required: ['title', 'description', 'businessValue']
      }
    },
    feature_create: {
      name: 'feature_create',
      description: 'Create product feature',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Feature title' },
          description: { type: 'string', description: 'Feature description' },
          epicId: { type: 'string', description: 'Parent epic ID' },
          userStories: { type: 'array', description: 'Detailed user stories' },
          acceptanceCriteria: { type: 'array', description: 'Feature acceptance criteria' },
          wireframes: { type: 'array', description: 'Wireframe references' },
          technicalSpecs: { type: 'object', description: 'Technical specifications' },
          estimatedPoints: { type: 'number', description: 'Story points estimation' },
          priority: { type: 'string', enum: ['Must Have', 'Should Have', 'Could Have', 'Wont Have'], default: 'Should Have' },
          release: { type: 'string', description: 'Target release' }
        },
        required: ['title', 'description', 'userStories']
      }
    },
    roadmap_create: {
      name: 'roadmap_create',
      description: 'Create product roadmap',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Roadmap title' },
          timeframe: { type: 'string', enum: ['Quarter', 'Half-Year', 'Annual', 'Multi-Year'], description: 'Roadmap timeframe' },
          quarters: { type: 'array', description: 'Quarterly planning items' },
          milestones: { type: 'array', description: 'Key milestones' },
          themes: { type: 'array', description: 'Strategic themes' },
          risks: { type: 'array', description: 'Identified risks' },
          assumptions: { type: 'array', description: 'Planning assumptions' }
        },
        required: ['title', 'timeframe', 'quarters']
      }
    },
    backlog_manage: {
      name: 'backlog_manage',
      description: 'Manage product backlog',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['create', 'prioritize', 'groom', 'estimate', 'refine'], description: 'Backlog action' },
          items: { type: 'array', description: 'Backlog items' },
          criteria: { type: 'object', description: 'Prioritization criteria' },
          filters: { type: 'object', description: 'Backlog filters' }
        },
        required: ['action']
      }
    },
    stakeholder_analysis: {
      name: 'stakeholder_analysis',
      description: 'Analyze and manage stakeholders',
      inputSchema: {
        type: 'object',
        properties: {
          stakeholders: { type: 'array', description: 'Stakeholder list' },
          analysis: { type: 'string', enum: ['power-interest', 'influence-impact', 'engagement'], description: 'Analysis type' },
          communicationPlan: { type: 'object', description: 'Communication strategy' }
        },
        required: ['stakeholders', 'analysis']
      }
    },
    market_research: {
      name: 'market_research',
      description: 'Conduct market research analysis',
      inputSchema: {
        type: 'object',
        properties: {
          researchType: { type: 'string', enum: ['competitive', 'user', 'market-size', 'trend'], description: 'Research type' },
          scope: { type: 'string', description: 'Research scope' },
          methodology: { type: 'array', description: 'Research methods' },
          timeline: { type: 'string', description: 'Research timeline' }
        },
        required: ['researchType', 'scope']
      }
    },
    kpi_tracking: {
      name: 'kpi_tracking',
      description: 'Track and analyze KPIs',
      inputSchema: {
        type: 'object',
        properties: {
          kpis: { type: 'array', description: 'KPI definitions' },
          period: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly'], description: 'Tracking period' },
          targets: { type: 'object', description: 'KPI targets' },
          analysis: { type: 'string', description: 'Analysis focus' }
        },
        required: ['kpis', 'period']
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
      description: 'Check neural network status (automatic)',
      inputSchema: {
        type: 'object',
        properties: {
          modelId: { type: 'string', description: 'Specific model to check (optional)' }
        }
      },
      handler: async (args, server) => {
        if (!server?.neuralEngine) {
          return { status: 'unavailable', message: 'Neural engine not initialized' };
        }
        
        return {
          status: 'available',
          initialized: server.neuralEngine.isInitialized,
          models: server.neuralEngine.models.size,
          cacheSize: server.neuralEngine.cache.size,
          specificModel: args.modelId ? server.neuralEngine.models.get(args.modelId) : null
        };
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
    },
    neural_inference: {
      name: 'neural_inference',
      description: 'Run neural inference on text (automatic)',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Text to analyze' },
          model: { type: 'string', description: 'Model to use (optional, auto-selects best)' },
          options: { type: 'object', description: 'Inference options' }
        },
        required: ['prompt']
      },
      handler: async (args, server) => {
        if (!server?.neuralEngine) {
          return { result: 'Neural inference unavailable (using fallback)', confidence: 0.1 };
        }
        
        try {
          return await server.neuralEngine.inference(args.prompt, args.model, args.options);
        } catch (error) {
          return { result: `Neural inference failed: ${error.message}`, confidence: 0 };
        }
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
 * Initialize Git tools
 * @returns {Object} Git tool definitions
 */
export function initializeGitTools() {
  return gitTools;
}

/**
 * Combine all tool definitions into a single registry
 * @returns {Object} Complete tools registry
 */
export function initializeAllTools() {
  return {
    ...initializeClaudeZenTools(),
    ...initializeProductTools(),
    ...initializeNeuralTools(),
    ...initializeMemoryTools(),
    ...initializeAgentTools(),
    ...initializeTaskTools(),
    ...initializeSystemTools(),
    ...initializeGitTools()
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
    { name: 'system', description: 'System utilities and features', count: Object.keys(initializeSystemTools()).length },
    { name: 'git', description: 'Git version control operations', count: Object.keys(initializeGitTools()).length }
  ];
}