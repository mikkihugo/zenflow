/**
 * @fileoverview Refactored Command Registry
 * Clean, maintainable command registration system with proper separation of concerns
 * @module CommandRegistryRefactored
 */

import meow from 'meow';
import { loadCommands, createHelpText } from './core/command-loader.js';

/**
 * Global command router instance
 */
let commandRouter = null;

/**
 * Initialize command registry
 * @returns {Promise<void>}
 */
export async function initializeCommandRegistry() {
  if (!commandRouter) {
    commandRouter = await loadCommands();
  }
}

/**
 * Create meow CLI with clean configuration
 * @returns {Object} Meow CLI instance
 */
export async function createMeowCLI() {
  await initializeCommandRegistry();
  
  const helpText = createHelpText(commandRouter);
  
  return meow(helpText, {
    importMeta: import.meta,
    flags: {
      help: {
        type: 'boolean',
        shortFlag: 'h'
      },
      version: {
        type: 'boolean',
        shortFlag: 'v'
      },
      verbose: {
        type: 'boolean',
        default: false
      },
      nonInteractive: {
        type: 'boolean',
        default: false
      }
    }
  });
}

/**
 * Execute a command with proper error handling
 * @param {string} name - Command name
 * @param {Array} args - Command arguments
 * @param {Object} flags - Command flags
 * @returns {Promise<any>} Command result
 */
export async function executeCommand(name, args = [], flags = {}) {
  await initializeCommandRegistry();
  
  if (!commandRouter.has(name)) {
    throw new Error(`Unknown command: ${name}. Use 'claude-zen --help' to see available commands.`);
  }

  try {
    return await commandRouter.execute(name, args, flags);
  } catch (error) {
    // Enhanced error reporting
    console.error(`❌ Command '${name}' failed: ${error.message}`);
    
    if (flags.verbose) {
      console.error('Stack trace:', error.stack);
    }
    
    // Suggest help for command
    console.error(`💡 For help with this command, run: claude-zen help ${name}`);
    
    throw error;
  }
}

/**
 * Show help for a specific command
 * @param {string} name - Command name
 * @returns {Promise<void>}
 */
export async function showCommandHelp(name) {
  await initializeCommandRegistry();
  
  const help = commandRouter.getHelp(name);
  
  if (!help) {
    console.error(`❌ Unknown command: ${name}`);
    console.log('\nAvailable commands:');
    listCommands();
    return;
  }

  console.log(`
${help.name} - ${help.description}

Usage:
  ${help.usage}

Examples:
${help.examples.map(example => `  claude-zen ${example}`).join('\n')}
`);

  if (help.aliases.length > 0) {
    console.log(`Aliases: ${help.aliases.join(', ')}`);
  }
}

/**
 * List all available commands
 * @param {boolean} includeHidden - Include hidden commands
 * @returns {Promise<void>}
 */
export async function listCommands(includeHidden = false) {
  await initializeCommandRegistry();
  
  const commands = commandRouter.list(includeHidden);
  
  console.log('\nAvailable commands:');
  for (const cmd of commands) {
    console.log(`  ${cmd.name.padEnd(15)} ${cmd.description}`);
  }
}

/**
 * Check if command exists
 * @param {string} name - Command name
 * @returns {Promise<boolean>} Whether command exists
 */
export async function hasCommand(name) {
  await initializeCommandRegistry();
  return commandRouter.has(name);
}

/**
 * Get command configuration
 * @param {string} name - Command name
 * @returns {Promise<Object|null>} Command configuration
 */
export async function getCommand(name) {
  await initializeCommandRegistry();
  return commandRouter.get(name);
}

/**
 * Register a new command (for plugins/extensions)
 * @param {string} name - Command name
 * @param {Object} config - Command configuration
 * @returns {Promise<void>}
 */
export async function registerCommand(name, config) {
  await initializeCommandRegistry();
  commandRouter.register(name, config);
}

/**
 * Legacy compatibility exports
 * Maintains compatibility with existing code while using new architecture
 */

// Legacy command registry map for backward compatibility
export const commandRegistry = new Map();

// Populate legacy registry on access
Object.defineProperty(commandRegistry, 'get', {
  value: async function(name) {
    return await getCommand(name);
  }
});

Object.defineProperty(commandRegistry, 'has', {
  value: async function(name) {
    return await hasCommand(name);
  }
});

Object.defineProperty(commandRegistry, 'set', {
  value: async function(name, config) {
    return await registerCommand(name, config);
  }
});

/**
 * Legacy function exports for backward compatibility
 */
export async function registerCoreCommands() {
  await initializeCommandRegistry();
  console.log('✅ Core commands loaded');
}

// Re-export everything for maximum compatibility
export {
  executeCommand as execute,
  listCommands as list,
  hasCommand as has,
  getCommand as get,
  registerCommand as register,
  showCommandHelp as help
};

/**
 * Get registry statistics
 * @returns {Promise<Object>} Registry statistics
 */
export async function getRegistryStats() {
  await initializeCommandRegistry();
  
  const commands = commandRouter.list(true);
  const categories = {
    core: 0,
    coordination: 0,
    management: 0,
    development: 0,
    other: 0
  };

  for (const cmd of commands) {
    if (['init', 'start', 'status', 'config'].includes(cmd.name)) {
      categories.core++;
    } else if (['hive-mind', 'swarm', 'agent', 'task'].includes(cmd.name)) {
      categories.coordination++;
    } else if (['memory', 'mcp', 'monitor', 'security', 'backup'].includes(cmd.name)) {
      categories.management++;
    } else if (['github', 'deploy', 'workflow', 'analytics'].includes(cmd.name)) {
      categories.development++;
    } else {
      categories.other++;
    }
  }

  return {
    totalCommands: commands.length,
    categories,
    aliasCount: commands.reduce((count, cmd) => count + cmd.aliases.length, 0)
  };
}

/**
 * Generate API endpoints from command registry
 * @returns {Promise<Object>} Generated endpoints configuration
 */
export async function generateAPIEndpoints() {
  await initializeCommandRegistry();
  
  const commands = commandRouter.list(true);
  const endpoints = {};
  const openApiPaths = {};
  
  commands.forEach(cmd => {
    const endpoint = `/api/execute/${cmd.name}`;
    
    // REST endpoint configuration
    endpoints[endpoint] = {
      method: 'POST',
      command: cmd.name,
      description: cmd.description,
      usage: cmd.usage,
      examples: cmd.examples || [],
      validation: cmd.validation || {},
      category: cmd.category || 'general',
      flags: cmd.flags || {},
      aliases: cmd.aliases || []
    };
    
    // OpenAPI path specification
    openApiPaths[endpoint] = {
      post: {
        summary: cmd.description,
        description: `Execute the '${cmd.name}' command via API`,
        operationId: `execute_${cmd.name.replace(/-/g, '_')}`,
        tags: [cmd.category || 'general'],
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
                    properties: generateFlagSchema(cmd.flags || {})
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
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    result: { type: 'object', description: 'Command execution result' },
                    sessionId: { type: 'string', format: 'uuid' },
                    duration: { type: 'number', description: 'Execution time in milliseconds' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid request or command validation failed',
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
  });
  
  return {
    endpoints,
    openApiPaths,
    totalEndpoints: Object.keys(endpoints).length,
    categories: getCategoryCounts(commands),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generate OpenAPI flag schema from command flags
 */
function generateFlagSchema(flags) {
  const schema = {};
  
  Object.entries(flags).forEach(([flagName, flagConfig]) => {
    if (typeof flagConfig === 'object') {
      schema[flagName] = {
        type: flagConfig.type || 'string',
        description: flagConfig.description || `${flagName} flag`,
        default: flagConfig.default
      };
      
      if (flagConfig.choices) {
        schema[flagName].enum = flagConfig.choices;
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
 * Get command counts by category
 */
function getCategoryCounts(commands) {
  const categories = {};
  
  commands.forEach(cmd => {
    const category = cmd.category || 'general';
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return categories;
}

/**
 * Validate command arguments and flags
 * @param {string} commandName - Command name
 * @param {Array} args - Command arguments  
 * @param {Object} flags - Command flags
 * @returns {Promise<Object>} Validation result
 */
export async function validateCommandInput(commandName, args = [], flags = {}) {
  await initializeCommandRegistry();
  
  const command = await getCommand(commandName);
  if (!command) {
    return {
      valid: false,
      errors: [`Command '${commandName}' not found`],
      warnings: []
    };
  }
  
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };
  
  // Validate arguments
  if (command.validation) {
    const { minArgs, maxArgs, requiredArgs } = command.validation;
    
    if (minArgs && args.length < minArgs) {
      validation.valid = false;
      validation.errors.push(`Minimum ${minArgs} arguments required, got ${args.length}`);
    }
    
    if (maxArgs && args.length > maxArgs) {
      validation.valid = false;
      validation.errors.push(`Maximum ${maxArgs} arguments allowed, got ${args.length}`);
    }
    
    if (requiredArgs) {
      requiredArgs.forEach((reqArg, index) => {
        if (!args[index] || args[index].trim() === '') {
          validation.valid = false;
          validation.errors.push(`Required argument '${reqArg}' at position ${index + 1} is missing`);
        }
      });
    }
  }
  
  // Validate flags
  if (command.flags) {
    Object.entries(flags).forEach(([flagName, flagValue]) => {
      if (!command.flags[flagName]) {
        validation.warnings.push(`Unknown flag '${flagName}' for command '${commandName}'`);
        return;
      }
      
      const flagConfig = command.flags[flagName];
      
      // Type validation
      if (flagConfig.type === 'boolean' && typeof flagValue !== 'boolean') {
        validation.valid = false;
        validation.errors.push(`Flag '${flagName}' must be a boolean`);
      }
      
      if (flagConfig.type === 'number' && isNaN(Number(flagValue))) {
        validation.valid = false;
        validation.errors.push(`Flag '${flagName}' must be a number`);
      }
      
      // Choice validation
      if (flagConfig.choices && !flagConfig.choices.includes(flagValue)) {
        validation.valid = false;
        validation.errors.push(`Flag '${flagName}' must be one of: ${flagConfig.choices.join(', ')}`);
      }
    });
    
    // Required flags validation
    Object.entries(command.flags).forEach(([flagName, flagConfig]) => {
      if (flagConfig.required && !(flagName in flags)) {
        validation.valid = false;
        validation.errors.push(`Required flag '${flagName}' is missing`);
      }
    });
  }
  
  return validation;
}