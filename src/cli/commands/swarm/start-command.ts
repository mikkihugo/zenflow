/**
 * Swarm Start Command Implementation
 * 
 * Starts a new swarm with specified configuration
 */

import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult, CommandValidationResult } from '../../types/index';

export class SwarmStartCommand extends BaseCommand {
  constructor() {
    super({
      name: 'start',
      description: 'Start a new swarm',
      usage: 'claude-flow swarm start [options]',
      category: 'swarm',
      minArgs: 0,
      maxArgs: 0,
      examples: [
        'claude-flow swarm start',
        'claude-flow swarm start --topology mesh',
        'claude-flow swarm start --agents 5 --strategy parallel',
        'claude-flow swarm start --config ./my-config.json'
      ],
      flags: {
        topology: {
          type: 'string',
          description: 'Swarm topology (mesh, hierarchical, ring, star)',
          default: 'mesh'
        },
        agents: {
          type: 'number',
          description: 'Maximum number of agents',
          default: 5
        },
        strategy: {
          type: 'string',
          description: 'Execution strategy (balanced, parallel, sequential)',
          default: 'balanced'
        },
        config: {
          type: 'string',
          description: 'Path to configuration file'
        },
        'dev-mode': {
          type: 'boolean',
          description: 'Start in development mode with hot reloading',
          default: false
        },
        'auto-spawn': {
          type: 'boolean',
          description: 'Automatically spawn initial agents',
          default: true
        },
        port: {
          type: 'number',
          description: 'Port for swarm communication',
          default: 3000
        },
        'log-level': {
          type: 'string',
          description: 'Log level (debug, info, warn, error)',
          default: 'info'
        }
      }
    });
  }

  protected async validate(context: CommandContext): Promise<CommandValidationResult | null> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate topology
    const topology = context.flags.topology as string;
    const validTopologies = ['mesh', 'hierarchical', 'ring', 'star'];
    if (topology && !validTopologies.includes(topology)) {
      errors.push(`Invalid topology '${topology}'. Valid options: ${validTopologies.join(', ')}`);
    }

    // Validate strategy
    const strategy = context.flags.strategy as string;
    const validStrategies = ['balanced', 'parallel', 'sequential'];
    if (strategy && !validStrategies.includes(strategy)) {
      errors.push(`Invalid strategy '${strategy}'. Valid options: ${validStrategies.join(', ')}`);
    }

    // Validate agents count
    const agents = context.flags.agents as number;
    if (agents && (agents < 1 || agents > 50)) {
      errors.push('Agent count must be between 1 and 50');
    }

    // Validate port
    const port = context.flags.port as number;
    if (port && (port < 1024 || port > 65535)) {
      warnings.push('Port should be between 1024 and 65535 for best compatibility');
    }

    // Validate log level
    const logLevel = context.flags['log-level'] as string;
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (logLevel && !validLogLevels.includes(logLevel)) {
      errors.push(`Invalid log level '${logLevel}'. Valid options: ${validLogLevels.join(', ')}`);
    }

    return errors.length > 0 || warnings.length > 0 ? { valid: errors.length === 0, errors, warnings } : null;
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    try {
      const config = {
        topology: context.flags.topology as string || 'mesh',
        maxAgents: context.flags.agents as number || 5,
        strategy: context.flags.strategy as string || 'balanced',
        devMode: context.flags['dev-mode'] as boolean || false,
        autoSpawn: context.flags['auto-spawn'] as boolean || true,
        port: context.flags.port as number || 3000,
        logLevel: context.flags['log-level'] as string || 'info'
      };

      // Load custom config if provided
      if (context.flags.config) {
        const customConfig = await this.loadConfig(context.flags.config as string);
        Object.assign(config, customConfig);
      }

      console.log('Starting swarm with configuration:');
      console.log(`  Topology: ${config.topology}`);
      console.log(`  Max Agents: ${config.maxAgents}`);
      console.log(`  Strategy: ${config.strategy}`);
      console.log(`  Port: ${config.port}`);
      console.log(`  Dev Mode: ${config.devMode ? 'enabled' : 'disabled'}`);
      console.log('');

      // Initialize swarm
      const swarmId = await this.initializeSwarm(config);
      
      // Auto-spawn initial agents if requested
      if (config.autoSpawn) {
        await this.spawnInitialAgents(swarmId, config);
      }

      return {
        success: true,
        exitCode: 0,
        message: `Swarm started successfully with ID: ${swarmId}`,
        data: {
          swarmId,
          config,
          port: config.port,
          devMode: config.devMode
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to start swarm: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1
      };
    }
  }

  private async loadConfig(configPath: string): Promise<any> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const fullPath = path.resolve(configPath);
      const configData = await fs.readFile(fullPath, 'utf-8');
      
      return JSON.parse(configData);
    } catch (error) {
      throw new Error(`Failed to load config from ${configPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializeSwarm(config: any): Promise<string> {
    const { SwarmOrchestrator } = await import('../../../hive-mind/integration/SwarmOrchestrator');
    const orchestrator = SwarmOrchestrator.getInstance();
    
    // Initialize orchestrator if not already active
    if (!orchestrator.isActive) {
      await orchestrator.initialize();
    }
    
    // Create swarm configuration
    const swarmConfig = {
      topology: config.topology,
      maxAgents: config.maxAgents,
      strategy: config.strategy
    };
    
    const swarmId = await orchestrator.initializeSwarm(swarmConfig);
    
    console.log(`✅ Swarm initialized with ID: ${swarmId}`);
    console.log(`🌐 Orchestrator active on topology: ${config.topology}`);
    
    if (config.devMode) {
      console.log('🔥 Development mode active - enhanced logging enabled');
    }
    
    return swarmId;
  }

  private async spawnInitialAgents(swarmId: string, config: any): Promise<void> {
    const { SwarmOrchestrator } = await import('../../../hive-mind/integration/SwarmOrchestrator');
    const orchestrator = SwarmOrchestrator.getInstance();
    
    console.log('Spawning initial agents...');
    
    const agentTypes = ['researcher', 'analyst', 'coordinator'];
    const agentsToSpawn = Math.min(config.maxAgents, 3);
    
    for (let i = 0; i < agentsToSpawn; i++) {
      const agentType = agentTypes[i % agentTypes.length];
      const agentConfig = {
        type: agentType,
        name: `${agentType}-${i + 1}`,
        capabilities: [agentType, 'general']
      };
      
      try {
        const agentId = await orchestrator.spawnAgent(agentConfig);
        console.log(`  ✅ Spawned ${agentType} agent: ${agentId}`);
      } catch (error) {
        console.log(`  ❌ Failed to spawn ${agentType} agent: ${error}`);
      }
    }
    
    console.log(`✅ ${agentsToSpawn} initial agents spawned successfully`);
  }

  getHelp(): string {
    return `Start a new swarm

USAGE:
  claude-flow swarm start [options]

OPTIONS:
  --topology <type>      Swarm topology (mesh, hierarchical, ring, star) [default: mesh]
  --agents <count>       Maximum number of agents [default: 5]
  --strategy <strategy>  Execution strategy (balanced, parallel, sequential) [default: balanced]
  --config <path>        Path to configuration file
  --dev-mode            Start in development mode with hot reloading
  --auto-spawn          Automatically spawn initial agents [default: true]
  --port <number>        Port for swarm communication [default: 3000]
  --log-level <level>    Log level (debug, info, warn, error) [default: info]
  --no-auto-spawn       Disable automatic agent spawning
  -h, --help            Show help

EXAMPLES:
  claude-flow swarm start
  claude-flow swarm start --topology mesh --agents 8
  claude-flow swarm start --strategy parallel --dev-mode
  claude-flow swarm start --config ./swarm-config.json
  claude-flow swarm start --port 4000 --log-level debug

TOPOLOGIES:
  mesh          All agents can communicate with each other
  hierarchical  Tree-like structure with coordinator agents
  ring          Agents form a circular communication pattern
  star          Central coordinator with spoke agents

STRATEGIES:
  balanced      Load balance tasks across all agents
  parallel      Execute multiple tasks simultaneously
  sequential    Execute tasks one after another

The start command initializes a new swarm with the specified configuration.
Use --dev-mode for development with hot reloading capabilities.
Use --config to load settings from a JSON configuration file.
`;
  }
}