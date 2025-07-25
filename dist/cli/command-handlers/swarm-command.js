/**
 * Swarm command - Advanced multi-agent coordination using ruv-swarm library
 */

import { SwarmOrchestrator } from './swarm-orchestrator.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { spawn, execSync } from 'child_process';
import process from 'process';

function showSwarmHelp() {
  console.log(`
🧠 SWARM COMMAND - Multi-Agent AI Coordination

USAGE:
  claude-zen swarm <objective> [options]
  claude-zen swarm <subcommand> [options]

DESCRIPTION:
  Deploy intelligent multi-agent swarms to accomplish complex objectives.
  Agents work in parallel with neural optimization and real-time coordination.

SUBCOMMANDS:
  launch <objective>       Launch swarm with objective
  status [--swarm-id <id>] Show swarm status
  list                     List active swarms
  stop --swarm-id <id>     Stop specific swarm
  spawn --swarm-id <id>    Spawn agent in swarm
  metrics [--swarm-id <id>] Show swarm metrics

OPTIONS:
  --strategy <type>    Execution strategy: research, development, analysis, 
                       testing, optimization, maintenance
  --topology <type>    Coordination topology: hierarchical, mesh, ring, star
  --max-agents <n>     Maximum number of agents (default: 5)
  --parallel           Enable parallel execution (2.8-4.4x speed improvement)
  --monitor            Real-time swarm monitoring
  --background         Run in background with progress tracking
  --analysis           Enable analysis/read-only mode (no code changes)
  --read-only          Enable read-only mode (alias for --analysis)
  --swarm-id <id>      Target swarm ID for subcommands
  --type <type>        Agent type for spawn command
  --output-format <fmt> Output format: json, text (default: text)

EXAMPLES:
  claude-zen swarm "Build a REST API with authentication"
  claude-zen swarm launch "Research cloud architecture patterns" --strategy research
  claude-zen swarm status --swarm-id swarm-123
  claude-zen swarm list --output-format json
  claude-zen swarm spawn --swarm-id swarm-123 --type researcher
  claude-zen swarm "Analyze codebase for security issues" --analysis

AGENT TYPES:
  researcher    Research with web access and data analysis
  coder         Code development with neural patterns
  analyst       Performance analysis and optimization
  coordinator   Multi-agent orchestration
  tester        Comprehensive testing with automation
  optimizer     Performance optimization and bottleneck analysis

ANALYSIS MODE:
  When using --analysis or --read-only flags, the swarm operates in a safe
  read-only mode that prevents all code modifications. Perfect for:
  
  • Code reviews and security audits
  • Architecture analysis and documentation
  • Performance bottleneck identification
  • Technical debt assessment
  • Dependency mapping and analysis
  
  In analysis mode, agents can only read files, search codebases, and
  generate reports - no Write, Edit, or system-modifying operations.
`);
}

export async function swarmCommand(args, flags) {
  const subcommand = args[0];
  const objective = args.slice(1).join(' ').trim();

  // Handle help
  if (flags.help || flags.h || subcommand === 'help' || (!subcommand && !objective)) {
    showSwarmHelp();
    return;
  }

  // Handle subcommands
  if (subcommand && !['launch', 'status', 'spawn', 'stop', 'list', 'metrics'].includes(subcommand)) {
    // If first arg is not a subcommand, treat it as part of objective
    const fullObjective = args.join(' ').trim();
    return await launchSwarmWithObjective(fullObjective, flags);
  }

  try {
    const orchestrator = new SwarmOrchestrator();
    await orchestrator.initialize();

    switch (subcommand) {
      case 'launch':
        if (!objective) {
          printError('Objective required for swarm launch');
          printInfo('Usage: claude-zen swarm launch "Your objective here"');
          return;
        }
        return await launchSwarmWithObjective(objective, flags, orchestrator);

      case 'status':
        return await showSwarmStatus(flags, orchestrator);

      case 'list':
        return await listActiveSwarms(orchestrator, flags);

      case 'stop':
        const swarmId = flags['swarm-id'] || flags.id;
        return await stopSwarm(swarmId, orchestrator);

      case 'metrics':
        return await showSwarmMetrics(flags, orchestrator);

      case 'spawn':
        const targetSwarmId = flags['swarm-id'] || flags.id;
        if (!targetSwarmId) {
          printError('Swarm ID required for spawning agents');
          printInfo('Usage: claude-zen swarm spawn --swarm-id <id> --type <agent-type>');
          return;
        }
        return await spawnAgent(targetSwarmId, flags, orchestrator);

      default:
        // Treat as objective
        const fullObjective2 = (subcommand + ' ' + objective).trim();
        return await launchSwarmWithObjective(fullObjective2, flags, orchestrator);
    }
  } catch (error) {
    printError(`Swarm command failed: ${error.message}`);
    if (flags.debug) {
      console.error(error.stack);
    }
  }
}

/**
 * Launch swarm with objective using SwarmOrchestrator
 */
async function launchSwarmWithObjective(objective, flags = {}, orchestrator = null) {
  if (!objective || !objective.trim()) {
    printError('Objective is required');
    printInfo('Usage: claude-zen swarm "Your objective here"');
    return;
  }

  const orch = orchestrator || new SwarmOrchestrator();
  if (!orchestrator) {
    await orch.initialize();
  }

  // Handle analysis/read-only mode
  const isAnalysisMode = flags.analysis || flags['read-only'];
  
  const swarmOptions = {
    strategy: flags.strategy || 'adaptive',
    topology: flags.topology || flags.mode || 'hierarchical',
    maxAgents: flags['max-agents'] || flags.agents || 5,
    parallel: flags.parallel !== false,
    priority: flags.priority || 'high',
    qualityThreshold: flags['quality-threshold'] || 0.8,
    readOnly: isAnalysisMode,
    enableMonitoring: flags.monitor || flags.monitoring,
    background: flags.background
  };

  printInfo(`🐝 Launching swarm for: "${objective}"`);
  if (isAnalysisMode) {
    printWarning('🔍 Analysis mode: Read-only, no code modifications');
  }

  const result = await orch.launchSwarm(objective, swarmOptions);
  
  printSuccess(`✅ Swarm launched: ${result.swarmId}`);
  printInfo(`👥 Agents: ${result.agents.map(a => a.type).join(', ')}`);
  
  if (flags['output-format'] === 'json') {
    console.log(JSON.stringify(result, null, 2));
  }
  
  // Start monitoring if requested
  if (flags.monitor && !flags.background) {
    await startSwarmMonitoring(result.swarmId, orch);
  }
  
  return result;
}

/**
 * Show swarm status
 */
async function showSwarmStatus(flags, orchestrator) {
  const swarmId = flags['swarm-id'] || flags.id;
  const status = await orchestrator.getSwarmStatus(swarmId);
  
  if (swarmId) {
    // Specific swarm status
    printInfo(`🐝 Swarm Status: ${swarmId}`);
    console.log('━'.repeat(60));
    console.log(`📊 Status: ${status.status}`);
    console.log(`🏗️ Topology: ${status.topology}`);
    console.log(`🎯 Strategy: ${status.strategy}`);
    console.log(`👥 Agents: ${status.agents.length}`);
    
    if (status.agents.length > 0) {
      console.log('\\n🤖 Active Agents:');
      status.agents.forEach((agent, index) => {
        console.log(`  ${index + 1}. ${agent.type}: ${agent.id}`);
        console.log(`     Status: ${agent.status}, Capabilities: ${agent.capabilities?.join(', ') || 'none'}`);
      });
    }
    
    if (status.metrics) {
      console.log('\\n📊 Metrics:');
      console.log(`  Tasks Completed: ${status.metrics.tasksCompleted || 0}`);
      console.log(`  Success Rate: ${status.metrics.successRate || 0}%`);
      console.log(`  Avg Completion Time: ${status.metrics.avgCompletionTime || 0}s`);
    }
  } else {
    // Overall status
    printInfo('🐝 Swarm System Overview');
    console.log('━'.repeat(60));
    console.log(`📊 Total Swarms: ${status.totalSwarms || 0}`);
    console.log(`🤖 Total Agents: ${status.totalAgents || 0}`);
    
    if (status.swarms && Object.keys(status.swarms).length > 0) {
      console.log('\\n🐝 Active Swarms:');
      Object.entries(status.swarms).forEach(([id, swarm]) => {
        console.log(`  • ${id}: ${swarm.objective?.substring(0, 50)}...`);
        console.log(`    Agents: ${swarm.agents?.length || 0}, Status: ${swarm.status || 'unknown'}`);
      });
    }
  }
  
  if (flags['output-format'] === 'json') {
    console.log('\\n' + JSON.stringify(status, null, 2));
  }
}

/**
 * List active swarms
 */
async function listActiveSwarms(orchestrator, flags) {
  const status = await orchestrator.getSwarmStatus();
  
  if (flags['output-format'] === 'json') {
    console.log(JSON.stringify({ swarms: status.swarms || {} }, null, 2));
  } else {
    printInfo('🐝 Active Swarms');
    console.log('━'.repeat(60));
    
    if (!status.swarms || Object.keys(status.swarms).length === 0) {
      console.log('No active swarms found');
    } else {
      Object.entries(status.swarms).forEach(([id, swarm]) => {
        console.log(`🆔 ${id}`);
        console.log(`   Objective: ${swarm.objective || 'N/A'}`);
        console.log(`   Agents: ${swarm.agents?.length || 0}`);
        console.log(`   Status: ${swarm.status || 'unknown'}`);
        console.log(`   Created: ${swarm.created || 'N/A'}`);
        console.log();
      });
    }
  }
}

/**
 * Stop swarm
 */
async function stopSwarm(swarmId, orchestrator) {
  if (!swarmId) {
    printError('Swarm ID is required');
    printInfo('Usage: claude-zen swarm stop --swarm-id <id>');
    return;
  }
  
  // Implementation would go here
  printWarning(`Stop functionality not yet implemented for swarm: ${swarmId}`);
}

/**
 * Show swarm metrics
 */
async function showSwarmMetrics(flags, orchestrator) {
  const swarmId = flags['swarm-id'] || flags.id;
  
  if (swarmId) {
    const metrics = await orchestrator.getSwarmMetrics(swarmId);
    
    if (flags['output-format'] === 'json') {
      console.log(JSON.stringify(metrics, null, 2));
    } else {
      printInfo(`📊 Metrics for Swarm: ${swarmId}`);
      console.log('━'.repeat(60));
      console.log(`Tasks Completed: ${metrics.tasksCompleted || 0}`);
      console.log(`Success Rate: ${metrics.successRate || 0}%`);
      console.log(`Avg Completion Time: ${metrics.avgCompletionTime || 0}s`);
      console.log(`Coordination Efficiency: ${metrics.coordination_efficiency || 0}`);
    }
  } else {
    printInfo('📊 System-wide Metrics');
    console.log('━'.repeat(60));
    // Would show aggregated metrics across all swarms
    console.log('System metrics display not yet implemented');
  }
}

/**
 * Spawn agent in swarm
 */
async function spawnAgent(swarmId, flags, orchestrator) {
  const agentType = flags.type || 'general';
  const agentName = flags.name || `${agentType}-agent`;
  
  const swarm = orchestrator.activeSwarms.get(swarmId);
  if (!swarm) {
    printError(`Swarm ${swarmId} not found`);
    return;
  }

  const agent = await orchestrator.spawnAgent(swarm, { 
    type: agentType, 
    name: agentName 
  });
  
  printSuccess(`🤖 Agent spawned: ${agent.id}`);
  printInfo(`Type: ${agent.type}, Name: ${agent.name}`);
  
  if (flags['output-format'] === 'json') {
    console.log(JSON.stringify({ 
      agent: { 
        id: agent.id, 
        type: agent.type, 
        name: agent.name 
      } 
    }, null, 2));
  }
}

/**
 * Start monitoring for a swarm
 */
async function startSwarmMonitoring(swarmId, orchestrator) {
  printInfo(`📊 Starting monitoring for swarm: ${swarmId}`);
  printInfo('Press Ctrl+C to stop monitoring...');
  
  const interval = setInterval(async () => {
    try {
      const status = await orchestrator.getSwarmStatus(swarmId);
      
      // Clear screen and show status
      process.stdout.write('\\x1b[2J\\x1b[H');
      console.log('🐝 Real-Time Swarm Monitor');
      console.log('━'.repeat(50));
      console.log(`🆔 Swarm: ${swarmId}`);
      console.log(`📊 Status: ${status.status}`);
      console.log(`👥 Agents: ${status.agents?.length || 0}`);
      console.log(`⏰ Updated: ${new Date().toLocaleTimeString()}`);
      console.log('\\nPress Ctrl+C to stop monitoring...');
      
    } catch (error) {
      clearInterval(interval);
      printError(`Monitoring error: ${error.message}`);
    }
  }, 2000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    printInfo('\\n📊 Monitoring stopped');
    process.exit(0);
  });
}