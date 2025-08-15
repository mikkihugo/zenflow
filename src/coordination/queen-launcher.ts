/**
 * @fileoverview Queen Commander Launcher
 *
 * Launches the QueenCommander system to spawn and coordinate multiple
 * Claude CLI agent processes for true parallel swarm execution.
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2025-08-14
 */

import { parseArgs } from 'node:util';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ILogger } from '../core/logger.js';
import type { DIContainer } from '../di/index.js';
import { QueenCommander } from './agents/queen-coordinator.js';
import { getLogger } from '../config/logging-config';

export interface QueenCommanderLaunchConfig {
  maxQueens?: number;
  topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
  strategy?: 'balanced' | 'specialized' | 'adaptive';
  agents?: number;
  autoScale?: boolean;
  claudeCliPath?: string;
}

/**
 * Initialize .claude-zen directory structure for Queen Commander instances
 * Supports multiple concurrent instances with unique session IDs
 */
function initializeQueenDirectories(sessionId: string): {
  baseDir: string;
  tempDir: string;
  logDir: string;
  agentsDir: string;
  servicesDir: string;
  collectiveDir: string;
  cubesDir: string;
  domainsDir: string;
} {
  const baseDir = './.claude-zen';
  const sessionDir = join(baseDir, 'sessions', sessionId);

  const directories = {
    baseDir,
    // Queen-specific directories
    tempDir: join(sessionDir, 'tmp', 'queens'),
    logDir: join(sessionDir, 'logs', 'queens'),
    agentsDir: join(sessionDir, 'agents', 'claude-cli'),
    servicesDir: join(sessionDir, 'services'),

    // THE COLLECTIVE integration directories
    collectiveDir: join(baseDir, 'collective'),
    cubesDir: join(baseDir, 'collective', 'cubes'),
    domainsDir: join(baseDir, 'collective', 'domains'),
  };

  // Create all required directories including THE COLLECTIVE structure
  const collectiveSubDirs = [
    join(directories.cubesDir, 'dev-cube'),
    join(directories.cubesDir, 'ops-cube'),
    join(directories.cubesDir, 'security-cube'),
    join(directories.domainsDir, 'discovered'),
    join(directories.domainsDir, 'services'),
    join(directories.collectiveDir, 'registry'),
    join(directories.collectiveDir, 'memory'),
    join(directories.collectiveDir, 'coordination'),
  ];

  [...Object.values(directories), ...collectiveSubDirs].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  return directories;
}

/**
 * Parse command line arguments for Queen Commander mode
 */
function parseQueenCommanderArgs(): QueenCommanderLaunchConfig {
  const { values } = parseArgs({
    options: {
      agents: {
        type: 'string',
        default: '5',
      },
      topology: {
        type: 'string',
        default: 'mesh',
      },
      strategy: {
        type: 'string',
        default: 'adaptive',
      },
      'max-queens': {
        type: 'string',
        default: '50',
      },
      'auto-scale': {
        type: 'boolean',
        default: true,
      },
      'claude-cli': {
        type: 'string',
        default: 'claude',
      },
    },
    allowPositionals: true,
  });

  return {
    maxQueens: parseInt(values['max-queens'] || '50', 10),
    topology: (values.topology as any) || 'mesh',
    strategy: (values.strategy as any) || 'adaptive',
    agents: parseInt(values.agents || '5', 10),
    autoScale: values['auto-scale'] ?? true,
    claudeCliPath: values['claude-cli'] || 'claude',
  };
}

/**
 * Launch Queen Commander with spawned Claude CLI agent processes
 */
export async function launchQueenCommander(
  container: DIContainer,
  logger: ILogger
): Promise<void> {
  const config = parseQueenCommanderArgs();

  // Generate unique session ID for this Queen Commander instance
  const sessionId = `queen-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  // Initialize directory structure for this instance
  const dirs = initializeQueenDirectories(sessionId);

  logger.info('👑 Launching Queen Commander swarm mode', {
    sessionId,
    agents: config.agents,
    topology: config.topology,
    strategy: config.strategy,
    maxQueens: config.maxQueens,
    autoScale: config.autoScale,
    directories: dirs,
  });

  try {
    // Get required services from DI container
    const eventBus = container.resolve('EventBus');
    const memoryCoordinator = container.resolve('MemoryCoordinator');

    // Initialize THE COLLECTIVE integration
    logger.info('🧠 Initializing THE COLLECTIVE integration...');
    const { CollectiveCubeSync } = await import('../collective-cube-sync.js');
    const { DevCubeMatron } = await import('../cubes/dev-cube-matron.js');
    const { OpsCubeMatron } = await import('../cubes/ops-cube-matron.js');
    const { AgentRegistry } = await import('../agents/agent-registry.js');

    // Initialize agent registry for queen coordination
    const agentRegistry = new AgentRegistry(memoryCoordinator, eventBus);
    await agentRegistry.initialize();

    // Initialize COLLECTIVE cube system
    const collectiveSync = new CollectiveCubeSync(eventBus, logger);
    await collectiveSync.initialize({
      cubeTypes: ['dev-cube', 'ops-cube'],
      autoDiscovery: true,
      domainMapping: {
        development: 'dev-cube',
        operations: 'ops-cube',
        security: 'security-cube',
      },
      collectiveDir: dirs.collectiveDir,
    });

    // Initialize cube matrons that will coordinate queens
    const devCubeMatron = new DevCubeMatron(
      'dev-cube-matron',
      eventBus,
      logger
    );
    const opsCubeMatron = new OpsCubeMatron(
      'ops-cube-matron',
      eventBus,
      logger
    );

    await devCubeMatron.initialize();
    await opsCubeMatron.initialize();

    logger.info('✅ THE COLLECTIVE integration initialized', {
      registryActive: true,
      cubesActive: ['dev-cube', 'ops-cube'],
      collectiveDir: dirs.collectiveDir,
    });

    // Initialize Queen Commander with COLLECTIVE integration
    const queenCommander = new QueenCommander(
      {
        maxQueens: config.maxQueens,
        defaultTimeout: 30000,
        heartbeatInterval: 10000,
        healthCheckInterval: 30000,
        autoRestart: true,
        resourceLimits: {
          memory: 512 * 1024 * 1024, // 512MB per agent
          cpu: 1.0,
          disk: 1024 * 1024 * 1024, // 1GB
        },
        queenDefaults: {
          autonomyLevel: 0.7,
          learningEnabled: true,
          adaptationEnabled: true,
          borgProtocol: true,
        },
        environmentDefaults: {
          runtime: 'claude', // Use Claude CLI instead of deno
          workingDirectory: dirs.agentsDir,
          tempDirectory: dirs.tempDir,
          logDirectory: dirs.logDir,
          collectiveDir: dirs.collectiveDir,
          cubesDir: dirs.cubesDir,
        },
      },
      logger,
      eventBus,
      memoryCoordinator
    );

    // Initialize the Queen Commander
    await queenCommander.initialize();

    // Create agent pool for the swarm
    const poolId = await queenCommander.createAgentPool(
      'swarm-agents',
      'coder', // Use the coder template as default
      {
        minSize: config.agents || 5,
        maxSize: Math.max(config.agents || 5, 20),
        autoScale: config.autoScale,
        scaleUpThreshold: 0.8,
        scaleDownThreshold: 0.3,
      }
    );

    logger.info('🎯 Queen Commander swarm pool created', {
      poolId,
      minAgents: config.agents,
      topology: config.topology,
    });

    // Setup event handlers for coordination
    queenCommander.on('agent:created', (data) => {
      logger.info('👥 Agent spawned in swarm', {
        agentId: data.agent.id,
        name: data.agent.name,
        type: data.agent.type,
      });
    });

    queenCommander.on('agent:started', (data) => {
      logger.info('🚀 Agent started in swarm', {
        agentId: data.agent.id,
        name: data.agent.name,
      });
    });

    queenCommander.on('pool:scaled', (data) => {
      logger.info('📈 Swarm pool scaled', {
        poolId: data.pool.id,
        fromSize: data.fromSize,
        toSize: data.toSize,
      });
    });

    // Setup graceful shutdown
    const shutdownHandler = async () => {
      logger.info('🛑 Shutting down Queen Commander swarm...');
      await queenCommander.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);

    // Show status
    const stats = queenCommander.getSystemStats();
    logger.info('👑 Queen Commander swarm operational', {
      totalAgents: stats.totalAgents,
      activeAgents: stats.activeAgents,
      healthyAgents: stats.healthyAgents,
      pools: stats.pools,
      averageHealth: Math.round(stats.averageHealth * 100) / 100,
    });

    logger.info(
      '🎯 Queen Commander mode ready - agents are spawning Claude CLI processes'
    );
    logger.info(
      '💡 Each agent runs as a separate Claude CLI instance with coordination'
    );
  } catch (error) {
    logger.error('❌ Failed to launch Queen Commander', error);
    throw error;
  }
}

/**
 * Create a Claude CLI agent template that spawns actual claude processes
 */
export function createClaudeCliAgentTemplate() {
  return {
    name: 'Claude CLI Agent',
    type: 'claude-cli-agent',
    capabilities: {
      codeGeneration: true,
      codeReview: true,
      testing: true,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: true,
      fileSystem: true,
      terminalAccess: true,
      languages: ['typescript', 'javascript', 'python', 'rust', 'go'],
      frameworks: ['node', 'deno', 'react', 'vue', 'svelte'],
      domains: ['web-development', 'backend', 'api-design', 'data-analysis'],
      tools: ['claude-cli', 'git', 'editor', 'debugger', 'linter'],
      maxConcurrentTasks: 3,
      maxMemoryUsage: 512 * 1024 * 1024,
      maxExecutionTime: 1800000, // 30 minutes
      reliability: 0.95,
      speed: 0.8,
      quality: 0.95,
    },
    config: {
      autonomyLevel: 0.8,
      learningEnabled: true,
      adaptationEnabled: true,
      maxTasksPerHour: 20,
      maxConcurrentTasks: 3,
      timeoutThreshold: 1800000,
      reportingInterval: 60000,
      heartbeatInterval: 15000,
      permissions: [
        'file-read',
        'file-write',
        'terminal-access',
        'dangerous-permissions', // For --dangerously-skip-permissions
      ],
      trustedAgents: [],
      expertise: {
        coding: 0.95,
        analysis: 0.9,
        coordination: 0.85,
      },
      preferences: {
        outputFormat: 'json',
        dangerousPermissions: true,
        sessionManagement: true,
      },
    },
    environment: {
      runtime: 'claude',
      version: 'latest',
      workingDirectory: './.claude-zen/agents/claude-cli',
      tempDirectory: './.claude-zen/tmp/claude-cli',
      logDirectory: './.claude-zen/logs/claude-cli',
      apiEndpoints: {},
      credentials: {},
      availableTools: [
        'claude',
        '--dangerously-skip-permissions',
        '--output-format',
        'json',
      ],
      toolConfigs: {
        claude: {
          outputFormat: 'json',
          dangerousPermissions: true,
          sessionId: 'auto-generate-uuid',
        },
      },
    },
    startupScript: './scripts/start-claude-cli-agent.ts',
  };
}
