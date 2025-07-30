/**
 * 🚀 CLAUDE ZEN UNIFIED SCHEMA
 * Single source of truth for workflow management APIs
 * Auto-generates CLI/TUI/Web interfaces with proper hierarchy
 */

export interface SchemaCommand {
  description: string;
  category: string;
  priority: number;
  interfaces: {
    cli: boolean;
    web?: {
      enabled: boolean;
      endpoint: string;
      method: string;
    };
    tui?: boolean;
  };
  storage?: string;
  permissions?: string[];
  validation?: {
    required: string[];
    optional?: string[];
  };
}

export interface SchemaMetadata {
  version: string;
  lastUpdated: string;
  categories: string[];
  totalCommands: number;
}

export const CLAUDE_ZEN_SCHEMA: Record<string, SchemaCommand> = {
  // === STRATEGIC VISIONS ===
  // High-level strategic visions that drive product development
  'visions-create': {
    description: 'Create new strategic vision',
    category: 'strategic',
    priority: 1,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/visions', method: 'POST' },
      tui: true,
    },
    storage: 'visions',
    validation: { required: ['title', 'description'] },
  },

  'visions-list': {
    description: 'List all strategic visions',
    category: 'strategic',
    priority: 1,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/visions', method: 'GET' },
      tui: true,
    },
    storage: 'visions',
  },

  // === FOUNDATIONAL ARCHITECTURE DECISIONS ===
  // ADRs are cross-cutting architectural principles that inform ALL other work
  'adrs-create': {
    description: 'Create Architecture Decision Record',
    category: 'architecture',
    priority: 2,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/adrs', method: 'POST' },
      tui: true,
    },
    storage: 'adrs',
    validation: { required: ['title', 'status', 'context'] },
  },

  'adrs-generate': {
    description: 'Auto-generate ADR from context',
    category: 'architecture',
    priority: 2,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/adrs/generate', method: 'POST' },
      tui: false,
    },
    validation: { required: ['context'] },
  },

  // === STRATEGIC PLANNING ===
  'roadmaps-create': {
    description: 'Create strategic roadmap',
    category: 'planning',
    priority: 1,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/roadmaps', method: 'POST' },
      tui: true,
    },
    storage: 'roadmaps',
    validation: { required: ['title', 'timeline'] },
  },

  // === LARGE INITIATIVES ===
  'epics-create': {
    description: 'Create epic initiative',
    category: 'planning',
    priority: 2,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/epics', method: 'POST' },
      tui: true,
    },
    storage: 'epics',
    validation: { required: ['title', 'description', 'roadmap'] },
  },

  // === SPECIFIC CAPABILITIES ===
  'features-create': {
    description: 'Create feature specification',
    category: 'development',
    priority: 3,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/features', method: 'POST' },
      tui: true,
    },
    storage: 'features',
    validation: { required: ['title', 'epic', 'requirements'] },
  },

  // === EXTENDED USER STORIES WITH SPECIFICATIONS ===
  'prds-create': {
    description: 'Create Product Requirement Document',
    category: 'product',
    priority: 3,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/prds', method: 'POST' },
      tui: true,
    },
    storage: 'prds',
    validation: { required: ['title', 'feature', 'acceptance_criteria'] },
  },

  // === IMPLEMENTATION WORK ===
  'tasks-create': {
    description: 'Create implementation task',
    category: 'development',
    priority: 4,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/tasks', method: 'POST' },
      tui: true,
    },
    storage: 'tasks',
    validation: { required: ['title', 'prd', 'estimate'] },
  },

  // === MULTI-SERVICE COORDINATION ===
  'coordination-status': {
    description: 'Check coordination system status',
    category: 'system',
    priority: 1,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/coordination/status', method: 'GET' },
      tui: true,
    },
  },

  // === SWARM INTELLIGENCE ===
  'swarms-create': {
    description: 'Create intelligent swarm',
    category: 'ai',
    priority: 2,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/swarms', method: 'POST' },
      tui: false,
    },
    storage: 'swarms',
    validation: { required: ['type', 'size', 'objective'] },
  },

  // === META REGISTRY SYSTEM ===
  'meta-registry': {
    description: 'Access meta registry information',
    category: 'system',
    priority: 1,
    interfaces: {
      cli: true,
      web: { enabled: true, endpoint: '/api/meta', method: 'GET' },
      tui: true,
    },
  },
};

// === METADATA ===
export const SCHEMA_METADATA: SchemaMetadata = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  categories: ['strategic', 'architecture', 'planning', 'development', 'product', 'system', 'ai'],
  totalCommands: Object.keys(CLAUDE_ZEN_SCHEMA).length,
};

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: string): Record<string, SchemaCommand> {
  return Object.fromEntries(
    Object.entries(CLAUDE_ZEN_SCHEMA).filter(([, cmd]) => cmd.category === category)
  );
}

/**
 * Get web-enabled commands
 */
export function getWebEnabledCommands(): Record<string, SchemaCommand> {
  return Object.fromEntries(
    Object.entries(CLAUDE_ZEN_SCHEMA).filter(([, cmd]) => cmd.interfaces.web?.enabled)
  );
}

/**
 * Get CLI-enabled commands
 */
export function getCLIEnabledCommands(): Record<string, SchemaCommand> {
  return Object.fromEntries(
    Object.entries(CLAUDE_ZEN_SCHEMA).filter(([, cmd]) => cmd.interfaces.cli)
  );
}

/**
 * Validate command arguments
 */
export function validateCommandArgs(
  commandName: string,
  args: Record<string, any>
): {
  valid: boolean;
  missing: string[];
  errors: string[];
} {
  const command = CLAUDE_ZEN_SCHEMA[commandName];
  if (!command) {
    return { valid: false, missing: [], errors: [`Unknown command: ${commandName}`] };
  }

  const validation = command.validation;
  if (!validation) {
    return { valid: true, missing: [], errors: [] };
  }

  const missing: string[] = [];
  const errors: string[] = [];

  // Check required fields
  if (validation.required) {
    for (const field of validation.required) {
      if (!(field in args) || args[field] === undefined || args[field] === null) {
        missing.push(field);
      }
    }
  }

  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors,
  };
}

/**
 * Generate OpenAPI specification
 */
export function generateOpenAPISpec(): any {
  const paths: any = {};

  Object.entries(CLAUDE_ZEN_SCHEMA).forEach(([_cmdName, cmdConfig]) => {
    if (!cmdConfig.interfaces.web?.enabled) return;

    const { endpoint, method } = cmdConfig.interfaces.web;

    if (!paths[endpoint]) {
      paths[endpoint] = {};
    }

    paths[endpoint][method.toLowerCase()] = {
      summary: cmdConfig.description,
      tags: [cmdConfig.category],
      responses: {
        '200': {
          description: 'Success',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    };

    if (cmdConfig.validation?.required) {
      paths[endpoint][method.toLowerCase()].requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: cmdConfig.validation.required,
              properties: cmdConfig.validation.required.reduce((props: any, field: string) => {
                props[field] = { type: 'string' };
                return props;
              }, {}),
            },
          },
        },
      };
    }
  });

  return {
    openapi: '3.0.0',
    info: {
      title: 'Claude Zen API',
      version: SCHEMA_METADATA.version,
      description: 'Auto-generated API from Claude Zen Schema',
    },
    paths,
  };
}

export default CLAUDE_ZEN_SCHEMA;
