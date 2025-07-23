/**
 * UNIFIED COMMAND EXECUTOR
 * Single execution engine for CLI/TUI/Web interfaces
 * Routes commands to appropriate handlers with context preservation
 */

import { UNIFIED_COMMAND_SCHEMA } from './unified-command-schema.js';
import { megaswarmOrchestrator } from './megaswarm-orchestrator.js';
import { SwarmOrchestrator } from '../cli/command-handlers/swarm-orchestrator.js';
import { 
  spawnCommand, 
  coordinationAction, 
  analysisAction, 
  trainingAction 
} from '../cli/command-registry.js';
import { printSuccess, printError, printWarning, printInfo } from '../cli/utils.js';

/**
 * Unified command execution with context preservation
 */
export async function executeUnifiedCommand(commandName, args = [], options = {}, context = {}) {
  const schema = UNIFIED_COMMAND_SCHEMA[commandName];
  
  if (!schema) {
    throw new Error(`Unknown command: ${commandName}`);
  }

  const userClientInterface = context.interface || 'cli';
  const startTime = Date.now();

  try {
    printInfo(`⚡ Executing ${commandName} via ${userClientInterface}`);

    // Validate arguments and options against schema
    const validatedArgs = validateArgs(args, schema.args);
    const validatedOptions = validateOptions(options, schema.options);

    // Context preparation for megaswarm commands
    if (schema.spawning?.claudeInstances) {
      return await executeMegaswarmCommand(commandName, validatedArgs, validatedOptions, context);
    }

    // Route to appropriate command handler
    const result = await routeCommand(commandName, validatedArgs, validatedOptions, context);
    
    // Format response based on interface
    const formattedResult = formatResponse(result, userClientInterface, schema);
    
    // Log execution metrics
    const executionTime = Date.now() - startTime;
    printInfo(`✅ ${commandName} completed in ${executionTime}ms via ${userClientInterface}`);

    return formattedResult;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    printError(`❌ ${commandName} failed after ${executionTime}ms: ${error.message}`);
    throw error;
  }
}

/**
 * Execute megaswarm commands with Claude instance spawning
 */
async function executeMegaswarmCommand(commandName, args, options, context) {
  await megaswarmOrchestrator.initialize();

  switch (commandName) {
    case 'megaswarm':
      const objective = args[0];
      if (!objective) {
        throw new Error('Objective required for megaswarm command');
      }
      
      return await megaswarmOrchestrator.launchMegaswarm(objective, {
        instances: options.instances || 5,
        topology: options.topology || 'hierarchical',
        contextMode: options.contextMode || 'hybrid',
        autoScale: options.autoScale !== false,
        persistence: options.persistence !== false,
        monitoring: options.monitoring !== false
      });

    case 'swarm-spawn':
      const swarmId = args[0] || options.swarmId;
      if (!swarmId) {
        throw new Error('Swarm ID required for swarm-spawn command');
      }
      
      return await megaswarmOrchestrator.spawnClaudeInstance(swarmId, {
        role: options.role || 'general',
        contextAccess: options.contextAccess || 'full',
        priority: options.priority || 'medium'
      });

    case 'context-sync':
      // Context synchronization across all active instances
      const syncResult = await megaswarmOrchestrator.syncContextAcrossInstances({
        mode: options.mode || 'incremental',
        broadcast: options.broadcast !== false
      });
      return syncResult;

    default:
      throw new Error(`Unknown megaswarm command: ${commandName}`);
  }
}

/**
 * Route command to appropriate handler
 */
async function routeCommand(commandName, args, options, context) {
  // Map commands to their handlers
  const commandHandlers = {
    swarm: async () => {
      const { swarmCommand } = await import('../cli/command-handlers/swarm-command.js');
      
      // Enhanced swarm command with optional Claude spawning
      if (options.spawnClaude) {
        // Use megaswarm orchestrator for Claude spawning
        await megaswarmOrchestrator.initialize();
        return await megaswarmOrchestrator.launchMegaswarm(args[0], {
          instances: options.maxAgents || 5,
          topology: options.topology || 'hierarchical',
          strategy: options.strategy || 'adaptive'
        });
      } else {
        // Standard swarm execution
        return await swarmCommand(args, options);
      }
    },

    'swarm-status': async () => {
      const swarmId = args[0] || options.swarmId;
      return megaswarmOrchestrator.getStatus(swarmId);
    },

    spawn: async () => {
      return await spawnCommand(args, options);
    },

    coordination: async () => {
      return await coordinationAction(args, options);
    },

    analysis: async () => {
      return await analysisAction(args, options);
    },

    training: async () => {
      return await trainingAction(args, options);
    }
  };

  const handler = commandHandlers[commandName];
  if (!handler) {
    throw new Error(`No handler found for command: ${commandName}`);
  }

  return await handler();
}

/**
 * Validate command arguments against schema
 */
function validateArgs(args, schemaArgs) {
  if (!schemaArgs) return args;
  
  const validated = [];
  
  schemaArgs.forEach((schemaArg, index) => {
    const arg = args[index];
    const isRequired = schemaArg.startsWith('<') && schemaArg.endsWith('>');
    const isOptional = schemaArg.startsWith('[') && schemaArg.endsWith(']');
    
    if (isRequired && (!arg || arg.trim() === '')) {
      throw new Error(`Required argument ${schemaArg} is missing`);
    }
    
    validated.push(arg);
  });
  
  return validated;
}

/**
 * Validate command options against schema
 */
function validateOptions(options, schemaOptions) {
  if (!schemaOptions) return options;
  
  const validated = { ...options };
  
  Object.entries(schemaOptions).forEach(([optName, optConfig]) => {
    const value = options[optName];
    
    // Type validation
    if (value !== undefined && optConfig.type) {
      switch (optConfig.type) {
        case 'number':
          if (isNaN(Number(value))) {
            throw new Error(`Option ${optName} must be a number`);
          }
          validated[optName] = Number(value);
          break;
        
        case 'boolean':
          validated[optName] = Boolean(value);
          break;
        
        case 'string':
          validated[optName] = String(value);
          break;
      }
    }
    
    // Choice validation
    if (value !== undefined && optConfig.choices && !optConfig.choices.includes(value)) {
      throw new Error(`Option ${optName} must be one of: ${optConfig.choices.join(', ')}`);
    }
    
    // Range validation
    if (value !== undefined && optConfig.max && Number(value) > optConfig.max) {
      throw new Error(`Option ${optName} cannot exceed ${optConfig.max}`);
    }
    
    // Apply defaults
    if (value === undefined && optConfig.default !== undefined) {
      validated[optName] = optConfig.default;
    }
  });
  
  return validated;
}

/**
 * Format response based on interface type
 */
function formatResponse(result, clientInterface, schema) {
  switch (clientInterface) {
    case 'web':
      return {
        success: true,
        data: result,
        command: schema.description,
        timestamp: new Date().toISOString(),
        interface: 'web'
      };
    
    case 'tui':
      return {
        ...result,
        displayFormat: 'tui',
        timestamp: new Date().toISOString()
      };
    
    case 'cli':
    default:
      return result;
  }
}

/**
 * Generate help text for unified commands
 */
export function generateUnifiedHelp(commandName = null) {
  if (commandName) {
    const schema = UNIFIED_COMMAND_SCHEMA[commandName];
    if (!schema) {
      return `Unknown command: ${commandName}`;
    }
    
    let help = `${schema.description}\n\n`;
    
    if (schema.args?.length > 0) {
      help += `Arguments:\n`;
      schema.args.forEach(arg => {
        help += `  ${arg}\n`;
      });
      help += '\n';
    }
    
    if (schema.options && Object.keys(schema.options).length > 0) {
      help += `Options:\n`;
      Object.entries(schema.options).forEach(([name, config]) => {
        const alias = config.alias ? `, -${config.alias}` : '';
        const defaultValue = config.default !== undefined ? ` (default: ${config.default})` : '';
        const choices = config.choices ? ` [${config.choices.join('|')}]` : '';
        help += `  --${name}${alias}${choices}${defaultValue}\n`;
        if (config.description) {
          help += `    ${config.description}\n`;
        }
      });
    }
    
    return help;
  }
  
  // Generate overview of all commands
  let help = '🌊 Claude-Zen Unified Commands\n\n';
  
  const categories = {};
  Object.entries(UNIFIED_COMMAND_SCHEMA).forEach(([name, schema]) => {
    if (name.startsWith('__')) return;
    
    const category = schema.category || 'general';
    if (!categories[category]) categories[category] = [];
    categories[category].push({ name, description: schema.description });
  });
  
  Object.entries(categories).forEach(([category, commands]) => {
    help += `${category.toUpperCase()}:\n`;
    commands.forEach(({ name, description }) => {
      help += `  ${name.padEnd(20)} ${description}\n`;
    });
    help += '\n';
  });
  
  return help;
}

export default executeUnifiedCommand;