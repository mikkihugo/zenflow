/**
 * Swarm command - Advanced multi-agent coordination using ruv-swarm library
 */

import process from 'node:process';
import { ParallelSwarmOrchestrator } from '../../coordination/parallel-swarm-orchestrator.js';
import { printError, printInfo, printSuccess } from '../utils.js';

function _showSwarmHelp() {
  console.warn(`
🧠 SWARM COMMAND - Multi-Agent AI CoordinationUSAGE = args[0];
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
    // Choose orchestrator based on parallel flag
    const useParallel = flags.parallel !== false;
    const orchestrator = useParallel ? 
      new ParallelSwarmOrchestrator({maxWorkers = flags['swarm-id'] || flags.id;
        return await stopSwarm(swarmId, orchestrator);

      case 'metrics':
        return await showSwarmMetrics(flags, orchestrator);

      case 'spawn':
        const targetSwarmId = flags['swarm-id'] || flags.id;
        if(!targetSwarmId) {
          printError('Swarm ID required for spawning agents');
          printInfo('Usage = (subcommand + ' ' + objective).trim();
        return await launchSwarmWithObjective(fullObjective2, flags, orchestrator);
    }
  } catch(error) {
    printError(`Swarm command failed = {}, orchestrator = null): any 
  if (!objective || !objective.trim()) {
    printError('Objective is required');
    printInfo('Usage = flags.parallel !== false;
  const orch = orchestrator || (useParallel ? 
    new ParallelSwarmOrchestrator({maxWorkers = flags.analysis || flags['read-only'];
  
  const swarmOptions = {strategy = = false,priority = await orch.launchSwarm(objective, swarmOptions);
  
  printSuccess(`✅ Swarmlaunched = == 'parallel' && result.parallelExecutionStats) {
    printInfo(`🧵 Parallelexecution = > a.type).join(', ')}`);
  
  if(flags['output-format'] === 'json') {
    console.warn(JSON.stringify(result, null, 2));
  }
  
  // Start monitoring if requested
  if(flags.monitor && !flags.background) {
    await startSwarmMonitoring(result.swarmId, orch);
  }
  
  return result;
}

/**
 * Show swarm status
 */
async function showSwarmStatus(flags = flags['swarm-id'] || flags.id;
  const status = await orchestrator.getSwarmStatus(swarmId);
  
  if(swarmId) {
    // Specific swarm status
    printInfo(`🐝 Swarm Status => 
        console.warn(`  $index + 1. $agent.type: $agent.id`);
        console.warn(`     _Status => {
        console.warn(`  • ${id}: ${swarm.objective?.substring(0, 50)}...`);
        console.warn(`Agents = == 'json') 
    console.warn('\\n' + JSON.stringify(status, null, 2));

/**
 * List active swarms
 */
async function listActiveSwarms(orchestrator = await orchestrator.getSwarmStatus();
  
  if(flags['output-format'] === 'json') {
    console.warn(JSON.stringify({swarms = == 0) {
      console.warn('No active swarms found');
    } else {
      Object.entries(status.swarms).forEach(([id, swarm]) => {
        console.warn(`🆔 ${id}`);
        console.warn(`Objective = flags['swarm-id'] || flags.id;
  
  if(swarmId) {
    const metrics = await orchestrator.getSwarmMetrics(swarmId);
    
    if(flags['output-format'] === 'json') {
      console.warn(JSON.stringify(metrics, null, 2));
    } else {
      printInfo(`📊 Metrics forSwarm = flags.type || 'general';

  const swarm = orchestrator.activeSwarms.get(swarmId);
  if(!swarm) {
    printError(`Swarm ${swarmId} not found`);
    return;
  }

  const agent = await orchestrator.spawnAgent(swarm, {type = == 'json') {
    console.warn(JSON.stringify({agent = setInterval(async () => {
    try {
      const status = await orchestrator.getSwarmStatus(swarmId);
      
      // Clear screen and show status
      process.stdout.write('\\x1b[2J\\x1b[H');
      console.warn('🐝 Real-Time Swarm Monitor');
      console.warn('━'.repeat(50));
      console.warn(`🆔 _Swarm => {
    clearInterval(interval);
    printInfo('\\n📊 Monitoring stopped');
    process.exit(0);
  });
}
