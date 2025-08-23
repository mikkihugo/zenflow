#!/usr/bin/env node
/**
 * @fileoverview AgentManager CLI - Command-line interface for ephemeral swarm orchestration
 *
 * Provides a ruvswarm-like CLI for creating, managing, and executing ephemeral swarms
 * with cognitive diversity and WASM neural acceleration.
 *
 * @example
 * ```bash
 * # Create a swarm for code analysis
 * agent-manager create --task "analyze security vulnerabilities" \
 *   --cognitive researcher,coder,analyst \
 *   --topology hierarchical \
 *   --neural
 *
 * # Execute a swarm
 * agent-manager exec swarm-123 --max-turns 50
 *
 * # List active swarms
 * agent-manager list
 *
 * # Dissolve a swarm
 * agent-manager dissolve swarm-123
 * ```
 */

import { getLogger } from '@claude-zen/foundation';
import { Command } from 'commander';

import { AgentManager } from './agent-manager';
import type { CognitiveArchetype, SwarmTopology } from './types';

const logger = getLogger('agent-manager-cli');
const program = new Command();

/**
 * Validate cognitive types against allowed types
 */
function validateCognitiveTypes(cognitiveTypes: CognitiveArchetype[]): void {
  const validTypes: CognitiveArchetype[] = [
    'researcher',
    'coder',
    'analyst',
    'architect',
  ];
  
  for (const type of cognitiveTypes) {
    if (!validTypes.includes(type)) {
      logger.error(`❌ Invalid cognitive type: ${type}. Valid types: ${validTypes.join(', ')}`);
      process.exit(1);
    }
  }
}

/**
 * Validate topology against allowed topologies
 */
function validateTopology(topology: SwarmTopology): void {
  const validTopologies: SwarmTopology[] = [
    'mesh',
    'hierarchical',
    'ring',
    'star',
  ];
  
  if (!validTopologies.includes(topology)) {
    logger.error(`❌ Invalid topology: ${topology}. Valid topologies: ${validTopologies.join(', ')}`);
    process.exit(1);
  }
}

/**
 * Process manual configuration from CLI options
 */
function processManualConfiguration(options: any): {
  cognitiveTypes: CognitiveArchetype[];
  topology: SwarmTopology;
} {
  logger.info('⚙️ Using manual configuration...');

  const cognitiveTypes = options.cognitive
    ? (options.cognitive
        .split(',')
        .map((type: string) => type.trim()) as CognitiveArchetype[])
    : ['researcher', 'coder'];
  
  const topology = options.topology || 'mesh';

  validateCognitiveTypes(cognitiveTypes);
  validateTopology(topology);

  return { cognitiveTypes, topology };
}

/**
 * Process intelligent configuration using repository analysis
 */
async function processIntelligentConfiguration(options: any): Promise<{
  cognitiveTypes: CognitiveArchetype[];
  topology: SwarmTopology;
  recommendation: any;
}> {
  logger.info('🧠 Using intelligent configuration...');
  
  const { getIntelligentSwarmConfig } = await import('./intelligent-config');
  const recommendation = await getIntelligentSwarmConfig(
    options.task,
    options.analyzeRepo ? undefined : false
  );

  logger.info('🎯 Intelligent Swarm Recommendation:');
  logger.info(`├── Task: ${options.task}`);
  logger.info(`├── Cognitive Types: ${recommendation.cognitiveTypes.join(', ')}`);
  logger.info(`├── Topology: ${recommendation.topology}`);
  logger.info(`├── Agent Count: ${recommendation.agentCount}`);
  logger.info('└── Reasoning:');
  logger.info(`    ├── Task Analysis: ${recommendation.reasoning.taskAnalysis}`);
  logger.info(`    ├── Cognitive Rationale: ${recommendation.reasoning.cognitiveRationale}`);
  logger.info(`    ├── Topology Rationale: ${recommendation.reasoning.topologyRationale}`);
  logger.info(`    └── Agent Count Rationale: ${recommendation.reasoning.agentCountRationale}`);

  return {
    cognitiveTypes: recommendation.cognitiveTypes,
    topology: recommendation.topology,
    recommendation
  };
}

// Global AgentManager instance
let globalManager: AgentManager|null = null;

async function getManager(): Promise<AgentManager> {
  if (!globalManager) {
    globalManager = new AgentManager();
    await globalManager.initialize();
  }
  return globalManager;
}

program
  .name('agent-manager')
  .description(
    '🐝 Ephemeral swarm orchestrator for cognitive diversity and task coordination'
  )
  .version('1.0.0');

/**
 * Create a new ephemeral swarm with intelligent configuration
 */
program
  .command('create')
  .description('🚀 Create a new ephemeral swarm with intelligent configuration')
  .requiredOption('-t, --task <task>', '🎯 Task description for the swarm')
  .option(
    '-c, --cognitive <types>',
    '🧠 Override cognitive types (researcher,coder,analyst,architect)'
  )
  .option(
    '--topology <topology>',
    '🔗 Override coordination topology (mesh,hierarchical,ring,star)'
  )
  .option('-d, --duration <ms>', '⏰ Max duration in milliseconds', '3600000')
  .option('--neural', '🧠 Enable WASM neural acceleration')
  .option('--no-persistent', '💾 Disable session persistence (auto-dissolve)')
  .option('--max-turns <turns>', '🔄 Maximum Claude SDK interactions', '50')
  .option(
    '--manual',
    '⚙️ Skip intelligent configuration and use manual settings'
  )
  .option(
    '--analyze-repo',
    '🔍 Force repository analysis (default: auto-detect)'
  )
  .action(async (options) => {
    try {
      const _manager = await getManager();

      let cognitiveTypes: CognitiveArchetype[];
      let topology: SwarmTopology;
      let _recommendation: any = null;

      if (options.manual) {
        ({ cognitiveTypes, topology } = processManualConfiguration(options));
      } else {
        ({ cognitiveTypes, topology, recommendation: _recommendation } = await processIntelligentConfiguration(options));
        
        // Apply user overrides if provided
        if (options.cognitive) {
          cognitiveTypes = options.cognitive
            .split(',')
            .map((type: string) => type.trim()) as CognitiveArchetype[];
          validateCognitiveTypes(cognitiveTypes);
        }
        if (options.topology) {
          topology = options.topology;
          validateTopology(topology);
        }
        
        if (options.cognitive || options.topology) {
          logger.info('⚠️  User overrides applied to intelligent configuration');
        }
      }

      logger.info('✨ Creating ephemeral swarm...');

      const swarm = await AgentManager.createSwarm({
        task: options.task,
        cognitiveTypes,
        topology,
        maxDuration: parseInt(options.duration),
        persistent: options.persistent,
        neuralAcceleration: options.neural,
        maxTurns: parseInt(options.maxTurns),
      });

      logger.info('🎉 Swarm created successfully!');
      logger.info('📋 Swarm Details:');
      logger.info(`   🆔 ID: ${swarm.id}`);
      logger.info(`   🎯 Task: ${swarm.task}`);
      logger.info(
        `   🧠 Cognitive Types: ${swarm.agents.map((a) => a.archetype).join(', ')}`
      );
      logger.info(`   🔗 Topology: ${swarm.topology}`);
      logger.info(`   ⏰ Expires: ${swarm.expiresAt.toLocaleString()}`);
      logger.info(`   💾 Persistent: ${swarm.persistent ? '✅ Yes' : '❌ No'}`);

      if (options.neural) {
        logger.info('   🧠 Neural acceleration: ✅ Enabled');
      }

      // Display agent details
      logger.info('👥 Cognitive Agents:');
      for (const agent of swarm.agents) {
        logger.info(`   🤖 ${agent.archetype.toUpperCase()} Agent`);
        logger.info(`      🆔 ID: ${agent.id}`);
        logger.info(
          `      ⚡ Decision Speed: ${agent.cognition.decisionSpeed}ms`
        );
        logger.info(
          `      🧩 Patterns: ${agent.cognition.patterns.join(', ')}`
        );
        logger.info(
          `      💪 Strengths: ${agent.cognition.strengths.join(', ')}`
        );
      }

      logger.info('💡 Next steps:');
      logger.info(
        `   agent-manager exec ${swarm.id}     # Execute swarm coordination`
      );
      logger.info(
        `   agent-manager list                  # View all active swarms`
      );
      logger.info(
        `   agent-manager dissolve ${swarm.id}  # Clean up when done`
      );
    } catch (error) {
      logger.error(
        '❌ Failed to create swarm:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Execute a swarm
 */
program
  .command('exec <swarmId>')
  .description('⚡ Execute coordination for an existing swarm')
  .option(
    '--max-turns <turns>',
    '🔄 Maximum Claude SDK interactions for this execution',
    '50'
  )
  .action(async (swarmId: string, options) => {
    try {
      const manager = await getManager();

      logger.info(`⚡ Executing swarm coordination: ${swarmId}`);

      const result = await manager.executeSwarm(swarmId, {
        maxTurns: parseInt(options.maxTurns),
      });

      logger.info('\n🎉 Swarm execution completed!');
      logger.info(`\n📊 Execution Results:`);
      logger.info(`   ⏱️  Duration: ${result.duration}ms`);
      logger.info(
        `   ${result.success ? '✅' : '❌'} Success: ${result.success}`
      );
      logger.info(
        `   🤝 Consensus: ${result.coordination.consensusReached ? '✅ Reached' : '❌ Not reached'}`
      );
      logger.info(
        `   🔢 Total Decisions: ${result.coordination.totalDecisions}`
      );

      if (result.neuralMetrics) {
        logger.info(`\n🧠 Neural Acceleration:`);
        logger.info(
          `   🔧 WASM calls: ${result.neuralMetrics.wasmCallsExecuted}`
        );
        logger.info(
          `   🚀 Acceleration gain: ${result.neuralMetrics.accelerationGain}x faster`
        );
      }

      logger.info('\n👥 Agent Performance:');
      for (const agentResult of result.agentResults) {
        logger.info(`   🤖 ${agentResult.archetype.toUpperCase()}`);
        logger.info(`      🧠 Decisions: ${agentResult.decisions}`);
        logger.info(
          `      ⚡ Avg decision time: ${agentResult.averageDecisionTime}ms`
        );
        logger.info(`      💡 Insights: ${agentResult.insights.length}`);
      }

      if (result.coordination.emergentInsights.length > 0) {
        logger.info('\n💡 Emergent Insights:');
        for (const insight of result.coordination.emergentInsights) {
          logger.info(`   ✨ ${insight}`);
        }
      }
    } catch (error) {
      logger.error(
        '❌ Failed to execute swarm:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * List active swarms
 */
program
  .command('list')
  .alias('ls')
  .description('List all active ephemeral swarms')
  .option('--detailed', 'Show detailed information')
  .action(async (options) => {
    try {
      logger.debug('CLI list command executed', {
        workingDirectory: process.cwd(),
      });
      const manager = await getManager();
      logger.debug('About to call getActiveSwarms()');
      const swarms = manager.getActiveSwarms();
      logger.debug('getActiveSwarms() completed', {
        swarmCount: swarms.length,
      });

      if (swarms.length === 0) {
        logger.info('📭 No active swarms');
        return;
      }

      logger.info(`🐝 Active Swarms (${swarms.length}):\n`);

      for (const swarm of swarms) {
        logger.info(`📋 ${swarm.id}`);
        logger.info(`  Task: ${swarm.task}`);
        logger.info(`  Status: ${swarm.status}`);
        logger.info(
          `  Agents: ${swarm.agents.length} (${swarm.agents.map((a) => a.archetype).join(', ')})`
        );
        logger.info(`  Topology: ${swarm.topology}`);
        logger.info(`  Created: ${swarm.created.toLocaleString()}`);
        logger.info(`  Expires: ${swarm.expiresAt.toLocaleString()}`);
        logger.info(`  Persistent: ${swarm.persistent ? 'Yes' : 'No'}`);

        if (options.detailed) {
          logger.info(`  Performance:`);
          logger.info(`    Decisions: ${swarm.performance.decisions}`);
          logger.info(
            `    Avg Decision Time: ${swarm.performance.averageDecisionTime}ms`
          );
          logger.info(
            `    Coordination Events: ${swarm.performance.coordinationEvents}`
          );
          logger.info(
            `    Claude Interactions: ${swarm.performance.claudeInteractions}`
          );
          logger.info(
            `    Last Activity: ${swarm.performance.lastActivity.toLocaleString()}`
          );
        }

        logger.info('');
      }
    } catch (error) {
      logger.error(
        '❌ Failed to list swarms:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Dissolve a swarm
 */
program
  .command('dissolve <swarmId>')
  .alias('destroy')
  .description('Dissolve an ephemeral swarm and clean up resources')
  .action(async (swarmId: string) => {
    try {
      const manager = await getManager();

      logger.info(`🗑️ Dissolving swarm: ${swarmId}`);

      await manager.dissolveSwarm(swarmId);

      logger.info('✅ Swarm dissolved successfully!');
    } catch (error) {
      logger.error(
        '❌ Failed to dissolve swarm:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Pause a swarm (for session restart)
 */
program
  .command('pause <swarmId>')
  .description('Pause a swarm for Claude CLI session restart')
  .action(async (swarmId: string) => {
    try {
      const manager = await getManager();

      logger.info(`⏸️ Pausing swarm: ${swarmId}`);

      await manager.pauseSwarm(swarmId);

      logger.info('✅ Swarm paused successfully!');
      logger.info('💡 The swarm can be resumed after Claude CLI restart');
    } catch (error) {
      logger.error(
        '❌ Failed to pause swarm:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Resume a swarm (after session restart)
 */
program
  .command('resume <swarmId>')
  .description('Resume a paused swarm after Claude CLI session restart')
  .action(async (swarmId: string) => {
    try {
      const manager = await getManager();

      logger.info(`▶️ Resuming swarm: ${swarmId}`);

      await manager.resumeSwarm(swarmId);

      logger.info('✅ Swarm resumed successfully!');
    } catch (error) {
      logger.error(
        '❌ Failed to resume swarm:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Show performance metrics
 */
program
  .command('metrics')
  .alias('stats')
  .description('Show AgentManager performance metrics')
  .action(async () => {
    try {
      const manager = await getManager();
      const metrics = manager.getPerformanceMetrics();
      const swarms = manager.getActiveSwarms();

      logger.info('📊 AgentManager Performance Metrics\n');

      logger.info(`⏰ Uptime: ${Math.round(manager.getUptime() / 1000)}s`);
      logger.info(`🐝 Active Swarms: ${manager.getSwarmCount()}`);
      logger.info(`📈 Total Swarms Created: ${metrics.totalSwarms}`);
      logger.info(`⚡ Average Decision Time: ${metrics.averageDecisionTime}ms`);
      logger.info(
        `✅ Successful Coordinations: ${metrics.successfulCoordinations}`
      );
      logger.info(`🔄 Sessions Restored: ${metrics.sessionsRestored}`);

      if (swarms.length > 0) {
        logger.info('\n🧠 Cognitive Distribution:');
        const archetypeCounts = new Map<string, number>();
        for (const swarm of swarms) {
          for (const agent of swarm.agents) {
            archetypeCounts.set(
              agent.archetype,
              (archetypeCounts.get(agent.archetype)||0) + 1
            );
          }
        }

        for (const [archetype, count] of archetypeCounts) {
          logger.info(`  • ${archetype}: ${count} agents`);
        }
      }
    } catch (error) {
      logger.error('❌ Failed to get metrics:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Analyze task and recommend optimal swarm configuration
 */
program
  .command('analyze <task>')
  .description('🔍 Analyze task and recommend optimal swarm configuration')
  .option('--analyze-repo', '🔍 Include repository analysis')
  .option('--detailed', '📝 Show detailed reasoning')
  .action(async (task: string, options) => {
    try {
      logger.info('🧠 Analyzing task for optimal swarm configuration...\n');

      const { generateIntelligentConfig, analyzeRepository } = await import(
        './intelligent-config'
      );

      // Analyze repository if requested
      let repoAnalysis;
      if (options.analyzeRepo) {
        logger.info('🔍 Performing repository analysis...');
        repoAnalysis = await analyzeRepository();
        logger.info(
          `📊 Repository: ${repoAnalysis.projectType} (${repoAnalysis.complexity} complexity)`
        );
        logger.info(
          `🔧 Technologies: ${repoAnalysis.technologies.slice(0, 5).join(', ')}`
        );
        logger.info(`📝 Has Tests: ${repoAnalysis.hasTests ? 'Yes' : 'No'}`);
        logger.info(`📚 Has Docs: ${repoAnalysis.hasDocs ? 'Yes' : 'No'}\n`);
      }

      // Generate recommendation
      const recommendation = await generateIntelligentConfig(
        task,
        repoAnalysis
      );

      logger.info('🎯 Recommended Configuration:');
      logger.info(
        `   🧠 Cognitive Types: ${recommendation.cognitiveTypes.join(', ')}`
      );
      logger.info(`   🔗 Topology: ${recommendation.topology}`);
      logger.info(`   👥 Agent Count: ${recommendation.agentCount}`);
      logger.info(`   📈 Confidence: ${recommendation.confidence}%\n`);

      if (options.detailed) {
        logger.info('💭 Detailed Reasoning:');
        logger.info(
          `   📝 Task Analysis: ${recommendation.reasoning.taskAnalysis}`
        );
        logger.info(
          `   🧩 Cognitive Rationale: ${recommendation.reasoning.cognitiveRationale}`
        );
        logger.info(
          `   🔗 Topology Rationale: ${recommendation.reasoning.topologyRationale}`
        );
        logger.info(
          `   👥 Agent Count Rationale: ${recommendation.reasoning.agentCountRationale}`
        );
        if (repoAnalysis) {
          logger.info(
            `   📁 Repository Influence: ${recommendation.reasoning.repositoryInfluence}`
          );
        }
      }

      logger.info('\n💡 To create this swarm:');
      logger.info(
        `   agent-manager create --task "${task}" ${recommendation.cognitiveTypes.length > 2 ? '--analyze-repo' : ''}`
      );
    } catch (error) {
      logger.error(
        '❌ Failed to analyze task:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Health check
 */
program
  .command('health')
  .description('Check AgentManager health and system status')
  .action(async () => {
    try {
      const manager = await getManager();

      logger.info('🏥 AgentManager Health Check\n');

      // Basic health checks
      logger.info('✅ AgentManager: Operational');
      logger.info(
        `✅ Foundation Logger: ${logger ? 'Available' : 'Unavailable'}`
      );

      // Check WASM neural availability
      try {
        const { isWasmNeuralAvailable } = await import('./wasm-loader');
        const wasmAvailable = await isWasmNeuralAvailable();
        logger.info(
          wasmAvailable
            ? '✅ WASM Neural: Available'
            : '⚠️  WASM Neural: Not Available (optional)'
        );
      } catch {
        logger.info('⚠️  WASM Neural: Not Available (optional)');
      }

      const uptime = manager.getUptime();
      const activeSwarms = manager.getSwarmCount();

      logger.info(`✅ Uptime: ${Math.round(uptime / 1000)}s`);
      logger.info(`✅ Active Swarms: ${activeSwarms}`);

      if (activeSwarms > 0) {
        const swarms = manager.getActiveSwarms();
        const healthySwarms = swarms.filter(
          (s) => s.status === 'active'
        ).length;
        logger.info(`✅ Healthy Swarms: ${healthySwarms}/${activeSwarms}`);
      }

      logger.info('\n💚 System Status: Healthy');
    } catch (error) {
      logger.error(
        '❌ Health check failed:',
        error instanceof Error ? error.message : error
      );
      logger.info('\n💔 System Status: Unhealthy');
      process.exit(1);
    }
  });

/**
 * MCP Server commands
 */
const mcpCommand = program
  .command('mcp')
  .description('MCP (Model Context Protocol) server operations');

mcpCommand
  .command('start')
  .description('Start the stdio MCP server for Claude Code integration')
  .action(async () => {
    try {
      const { AgentManagerMCPServer } = await import('./mcp-server');
      const server = new AgentManagerMCPServer();
      await server.start();
      // The server runs indefinitely on stdio
    } catch (error) {
      logger.error(
        '❌ Failed to start MCP server:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

mcpCommand
  .command('info')
  .description('Show MCP integration information')
  .action(() => {
    logger.info('🔗 AgentManager MCP Integration\n');
    logger.info('To integrate with Claude Code:');
    logger.info(
      '  claude mcp add agent-manager npx @claude-zen/agent-manager mcpserver\n'
    );
    logger.info('Available MCP tools:');
    logger.info(
      '  • create_swarm       - Create ephemeral swarms with cognitive diversity'
    );
    logger.info(
      '  • execute_swarm      - Execute swarm coordination with <100ms decisions'
    );
    logger.info(
      '  • list_swarms        - List active swarms with performance metrics'
    );
    logger.info(
      '  • dissolve_swarm     - Dissolve swarms and clean up resources'
    );
    logger.info(
      '  • pause_swarm        - Pause for Claude CLI session restart'
    );
    logger.info('  • resume_swarm       - Resume after session restart');
    logger.info(
      '  • get_metrics        - Performance metrics and cognitive distribution'
    );
    logger.info(
      '  • health_check       - System health status and WASM availability'
    );
    logger.info('\nExample usage in Claude Code:');
    logger.info(
      '  "Create a swarm with researcher and coder agents for security analysis"'
    );
    logger.info('  "List all active swarms with detailed metrics"');
    logger.info('  "Execute swarm coordination with neural acceleration"');
  });

/**
 * Convenient MCP server command (shorter alias)
 */
program
  .command('mcpserver')
  .description('Start the MCP server (convenient alias for "mcp start")')
  .action(async () => {
    try {
      const { AgentManagerMCPServer } = await import('./mcp-server');
      const server = new AgentManagerMCPServer();
      await server.start();
      // The server runs indefinitely on stdio
    } catch (error) {
      logger.error(
        '❌ Failed to start MCP server:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n🛑 Received SIGINT, shutting down gracefully...');
  if (globalManager) {
    await globalManager.shutdown();
  }
  process.exit(0);
});

program.parse();
