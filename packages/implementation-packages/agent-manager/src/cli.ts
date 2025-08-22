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

import { Command } from 'commander';
import { AgentManager } from './agent-manager';
import { getLogger } from '@claude-zen/foundation';
import type { CognitiveArchetype, SwarmTopology } from './types';

const logger = getLogger('agent-manager-cli');
const program = new Command();

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
      const manager = await getManager();

      let cognitiveTypes: CognitiveArchetype[];
      let topology: SwarmTopology;
      let recommendation: any = null;

      if (options.manual) {
        // Manual configuration mode
        console.log('⚙️ Using manual configuration...');

        cognitiveTypes = options.cognitive
          ? (options.cognitive
              .split(',')
              .map((type: string) => type.trim()) as CognitiveArchetype[])
          : ['researcher', 'coder'];
        topology = options.topology||'mesh';

        // Validate manual inputs
        const validTypes: CognitiveArchetype[] = [
          'researcher',
          'coder',
          'analyst',
          'architect',
        ];
        for (const type of cognitiveTypes) {
          if (!validTypes.includes(type)) {
            console.error(
              `❌ Invalid cognitive type: ${type}. Valid types: ${validTypes.join(', ')}`
            );
            process.exit(1);
          }
        }

        const validTopologies: SwarmTopology[] = [
          'mesh',
          'hierarchical',
          'ring',
          'star',
        ];
        if (!validTopologies.includes(topology)) {
          console.error(
            `❌ Invalid topology: ${topology}. Valid topologies: ${validTopologies.join(', ')}`
          );
          process.exit(1);
        }
      } else {
        // Intelligent configuration mode (default)
        console.log(
          '🧠 Analyzing task and repository for optimal swarm configuration...'
        );

        try {
          const { generateIntelligentConfig, analyzeRepository } = await import(
            './intelligent-config'
          );

          // Analyze repository if requested or auto-detect
          let repoAnalysis;
          if (options.analyzeRepo) {
            console.log('🔍 Performing repository analysis...');
            repoAnalysis = await analyzeRepository();
            console.log(
              `📊 Repository: ${repoAnalysis.projectType} (${repoAnalysis.complexity} complexity)`
            );
          }

          // Generate intelligent configuration
          recommendation = await generateIntelligentConfig(
            options.task,
            repoAnalysis
          );

          // Apply user overrides if provided
          cognitiveTypes = options.cognitive
            ? (options.cognitive
                .split(',')
                .map((type: string) => type.trim()) as CognitiveArchetype[])
            : recommendation.cognitiveTypes;
          topology = options.topology||recommendation.topology;

          // Display recommendation
          console.log('\n🎯 Intelligent Configuration:');
          console.log(
            `   🧠 Cognitive Types: ${recommendation.cognitiveTypes.join(', ')}`
          );
          console.log(`   🔗 Topology: ${recommendation.topology}`);
          console.log(`   👥 Agent Count: ${recommendation.agentCount}`);
          console.log(`   📈 Confidence: ${recommendation.confidence}%`);

          console.log('\n💭 Reasoning:');
          console.log(
            `   📝 Task Analysis: ${recommendation.reasoning.taskAnalysis}`
          );
          console.log(
            `   🧩 Cognitive Choice: ${recommendation.reasoning.cognitiveRationale}`
          );
          console.log(
            `   🔗 Topology Choice: ${recommendation.reasoning.topologyRationale}`
          );
          if (repoAnalysis) {
            console.log(
              `   📁 Repository Influence: ${recommendation.reasoning.repositoryInfluence}`
            );
          }

          if (options.cognitive||options.topology) {
            console.log('\n⚠️  User overrides applied to intelligent configuration'
            );
          }
        } catch (error) {
          console.warn(
            `⚠️ Intelligent configuration failed, using fallback: ${error instanceof Error ? error.message : error}`
          );
          cognitiveTypes = ['researcher', 'coder'];
          topology = 'mesh';
        }
      }

      console.log('\n✨ Creating ephemeral swarm...');

      const swarm = await AgentManager.createSwarm({
        task: options.task,
        cognitiveTypes,
        topology,
        maxDuration: parseInt(options.duration),
        persistent: options.persistent,
        neuralAcceleration: options.neural,
        maxTurns: parseInt(options.maxTurns),
      });

      console.log('\n🎉 Swarm created successfully!');
      console.log(`\n📋 Swarm Details:`);
      console.log(`   🆔 ID: ${swarm.id}`);
      console.log(`   🎯 Task: ${swarm.task}`);
      console.log(
        `   🧠 Cognitive Types: ${swarm.agents.map((a) => a.archetype).join(', ')}`
      );
      console.log(`   🔗 Topology: ${swarm.topology}`);
      console.log(`   ⏰ Expires: ${swarm.expiresAt.toLocaleString()}`);
      console.log(`   💾 Persistent: ${swarm.persistent ? '✅ Yes' : '❌ No'}`);

      if (options.neural) {
        console.log('   🧠 Neural acceleration: ✅ Enabled');
      }

      // Display agent details
      console.log('\n👥 Cognitive Agents:');
      for (const agent of swarm.agents) {
        console.log(`   🤖 ${agent.archetype.toUpperCase()} Agent`);
        console.log(`      🆔 ID: ${agent.id}`);
        console.log(
          `      ⚡ Decision Speed: ${agent.cognition.decisionSpeed}ms`
        );
        console.log(
          `      🧩 Patterns: ${agent.cognition.patterns.join(', ')}`
        );
        console.log(
          `      💪 Strengths: ${agent.cognition.strengths.join(', ')}`
        );
        console.log('');
      }

      console.log('💡 Next steps:');
      console.log(
        `   agent-manager exec ${swarm.id}     # Execute swarm coordination`
      );
      console.log(
        `   agent-manager list                  # View all active swarms`
      );
      console.log(
        `   agent-manager dissolve ${swarm.id}  # Clean up when done`
      );
    } catch (error) {
      console.error(
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

      console.log(`⚡ Executing swarm coordination: ${swarmId}`);

      const result = await manager.executeSwarm(swarmId, {
        maxTurns: parseInt(options.maxTurns),
      });

      console.log('\n🎉 Swarm execution completed!');
      console.log(`\n📊 Execution Results:`);
      console.log(`   ⏱️  Duration: ${result.duration}ms`);
      console.log(
        `   ${result.success ? '✅' : '❌'} Success: ${result.success}`
      );
      console.log(
        `   🤝 Consensus: ${result.coordination.consensusReached ? '✅ Reached' : '❌ Not reached'}`
      );
      console.log(
        `   🔢 Total Decisions: ${result.coordination.totalDecisions}`
      );

      if (result.neuralMetrics) {
        console.log(`\n🧠 Neural Acceleration:`);
        console.log(
          `   🔧 WASM calls: ${result.neuralMetrics.wasmCallsExecuted}`
        );
        console.log(
          `   🚀 Acceleration gain: ${result.neuralMetrics.accelerationGain}x faster`
        );
      }

      console.log('\n👥 Agent Performance:');
      for (const agentResult of result.agentResults) {
        console.log(`   🤖 ${agentResult.archetype.toUpperCase()}`);
        console.log(`      🧠 Decisions: ${agentResult.decisions}`);
        console.log(
          `      ⚡ Avg decision time: ${agentResult.averageDecisionTime}ms`
        );
        console.log(`      💡 Insights: ${agentResult.insights.length}`);
      }

      if (result.coordination.emergentInsights.length > 0) {
        console.log('\n💡 Emergent Insights:');
        for (const insight of result.coordination.emergentInsights) {
          console.log(`   ✨ ${insight}`);
        }
      }
    } catch (error) {
      console.error(
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
        console.log('📭 No active swarms');
        return;
      }

      console.log(`🐝 Active Swarms (${swarms.length}):\n`);

      for (const swarm of swarms) {
        console.log(`📋 ${swarm.id}`);
        console.log(`  Task: ${swarm.task}`);
        console.log(`  Status: ${swarm.status}`);
        console.log(
          `  Agents: ${swarm.agents.length} (${swarm.agents.map((a) => a.archetype).join(', ')})`
        );
        console.log(`  Topology: ${swarm.topology}`);
        console.log(`  Created: ${swarm.created.toLocaleString()}`);
        console.log(`  Expires: ${swarm.expiresAt.toLocaleString()}`);
        console.log(`  Persistent: ${swarm.persistent ? 'Yes' : 'No'}`);

        if (options.detailed) {
          console.log(`  Performance:`);
          console.log(`    Decisions: ${swarm.performance.decisions}`);
          console.log(
            `    Avg Decision Time: ${swarm.performance.averageDecisionTime}ms`
          );
          console.log(
            `    Coordination Events: ${swarm.performance.coordinationEvents}`
          );
          console.log(
            `    Claude Interactions: ${swarm.performance.claudeInteractions}`
          );
          console.log(
            `    Last Activity: ${swarm.performance.lastActivity.toLocaleString()}`
          );
        }

        console.log('');
      }
    } catch (error) {
      console.error(
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

      console.log(`🗑️ Dissolving swarm: ${swarmId}`);

      await manager.dissolveSwarm(swarmId);

      console.log('✅ Swarm dissolved successfully!');
    } catch (error) {
      console.error(
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

      console.log(`⏸️ Pausing swarm: ${swarmId}`);

      await manager.pauseSwarm(swarmId);

      console.log('✅ Swarm paused successfully!');
      console.log('💡 The swarm can be resumed after Claude CLI restart');
    } catch (error) {
      console.error(
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

      console.log(`▶️ Resuming swarm: ${swarmId}`);

      await manager.resumeSwarm(swarmId);

      console.log('✅ Swarm resumed successfully!');
    } catch (error) {
      console.error(
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

      console.log('📊 AgentManager Performance Metrics\n');

      console.log(`⏰ Uptime: ${Math.round(manager.getUptime() / 1000)}s`);
      console.log(`🐝 Active Swarms: ${manager.getSwarmCount()}`);
      console.log(`📈 Total Swarms Created: ${metrics.totalSwarms}`);
      console.log(`⚡ Average Decision Time: ${metrics.averageDecisionTime}ms`);
      console.log(
        `✅ Successful Coordinations: ${metrics.successfulCoordinations}`
      );
      console.log(`🔄 Sessions Restored: ${metrics.sessionsRestored}`);

      if (swarms.length > 0) {
        console.log('\n🧠 Cognitive Distribution:');
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
          console.log(`  • ${archetype}: ${count} agents`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to get metrics:',
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
      console.log('🧠 Analyzing task for optimal swarm configuration...\n');

      const { generateIntelligentConfig, analyzeRepository } = await import(
        './intelligent-config'
      );

      // Analyze repository if requested
      let repoAnalysis;
      if (options.analyzeRepo) {
        console.log('🔍 Performing repository analysis...');
        repoAnalysis = await analyzeRepository();
        console.log(
          `📊 Repository: ${repoAnalysis.projectType} (${repoAnalysis.complexity} complexity)`
        );
        console.log(
          `🔧 Technologies: ${repoAnalysis.technologies.slice(0, 5).join(', ')}`
        );
        console.log(`📝 Has Tests: ${repoAnalysis.hasTests ? 'Yes' : 'No'}`);
        console.log(`📚 Has Docs: ${repoAnalysis.hasDocs ? 'Yes' : 'No'}\n`);
      }

      // Generate recommendation
      const recommendation = await generateIntelligentConfig(
        task,
        repoAnalysis
      );

      console.log('🎯 Recommended Configuration:');
      console.log(
        `   🧠 Cognitive Types: ${recommendation.cognitiveTypes.join(', ')}`
      );
      console.log(`   🔗 Topology: ${recommendation.topology}`);
      console.log(`   👥 Agent Count: ${recommendation.agentCount}`);
      console.log(`   📈 Confidence: ${recommendation.confidence}%\n`);

      if (options.detailed) {
        console.log('💭 Detailed Reasoning:');
        console.log(
          `   📝 Task Analysis: ${recommendation.reasoning.taskAnalysis}`
        );
        console.log(
          `   🧩 Cognitive Rationale: ${recommendation.reasoning.cognitiveRationale}`
        );
        console.log(
          `   🔗 Topology Rationale: ${recommendation.reasoning.topologyRationale}`
        );
        console.log(
          `   👥 Agent Count Rationale: ${recommendation.reasoning.agentCountRationale}`
        );
        if (repoAnalysis) {
          console.log(
            `   📁 Repository Influence: ${recommendation.reasoning.repositoryInfluence}`
          );
        }
      }

      console.log('\n💡 To create this swarm:');
      console.log(
        `   agent-manager create --task "${task}" ${recommendation.cognitiveTypes.length > 2 ? '--analyze-repo' : ''}`
      );
    } catch (error) {
      console.error(
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

      console.log('🏥 AgentManager Health Check\n');

      // Basic health checks
      console.log('✅ AgentManager: Operational');
      console.log(
        `✅ Foundation Logger: ${logger ? 'Available' : 'Unavailable'}`
      );

      // Check WASM neural availability
      try {
        const { isWasmNeuralAvailable } = await import('./wasm-loader');
        const wasmAvailable = await isWasmNeuralAvailable();
        console.log(
          wasmAvailable
            ? '✅ WASM Neural: Available'
            : '⚠️  WASM Neural: Not Available (optional)'
        );
      } catch {
        console.log('⚠️  WASM Neural: Not Available (optional)');
      }

      const uptime = manager.getUptime();
      const activeSwarms = manager.getSwarmCount();

      console.log(`✅ Uptime: ${Math.round(uptime / 1000)}s`);
      console.log(`✅ Active Swarms: ${activeSwarms}`);

      if (activeSwarms > 0) {
        const swarms = manager.getActiveSwarms();
        const healthySwarms = swarms.filter(
          (s) => s.status === 'active'
        ).length;
        console.log(`✅ Healthy Swarms: ${healthySwarms}/${activeSwarms}`);
      }

      console.log('\n💚 System Status: Healthy');
    } catch (error) {
      console.error(
        '❌ Health check failed:',
        error instanceof Error ? error.message : error
      );
      console.log('\n💔 System Status: Unhealthy');
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
      console.error(
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
    console.log('🔗 AgentManager MCP Integration\n');
    console.log('To integrate with Claude Code:');
    console.log(
      '  claude mcp add agent-manager npx @claude-zen/agent-manager mcpserver\n'
    );
    console.log('Available MCP tools:');
    console.log(
      '  • create_swarm       - Create ephemeral swarms with cognitive diversity'
    );
    console.log(
      '  • execute_swarm      - Execute swarm coordination with <100ms decisions'
    );
    console.log(
      '  • list_swarms        - List active swarms with performance metrics'
    );
    console.log(
      '  • dissolve_swarm     - Dissolve swarms and clean up resources'
    );
    console.log(
      '  • pause_swarm        - Pause for Claude CLI session restart'
    );
    console.log('  • resume_swarm       - Resume after session restart');
    console.log(
      '  • get_metrics        - Performance metrics and cognitive distribution'
    );
    console.log(
      '  • health_check       - System health status and WASM availability'
    );
    console.log('\nExample usage in Claude Code:');
    console.log(
      '  "Create a swarm with researcher and coder agents for security analysis"'
    );
    console.log('  "List all active swarms with detailed metrics"');
    console.log('  "Execute swarm coordination with neural acceleration"');
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
      console.error(
        '❌ Failed to start MCP server:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (globalManager) {
    await globalManager.shutdown();
  }
  process.exit(0);
});

program.parse();
