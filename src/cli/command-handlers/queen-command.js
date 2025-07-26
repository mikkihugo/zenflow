/**
 * @fileoverview Queen command handler for Multi-Queen Architecture
 * Manages CodeQueen, DebugQueen and their collaboration
 * @module QueenCommand
 */

import chalk from 'chalk';
import { performance } from 'perf_hooks';
import { QueenCoordinator } from '../../queens/queen-coordinator.js';
import { CodeQueen } from '../../queens/code-queen.js';
import { DebugQueen } from '../../queens/debug-queen.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';

let queenCoordinator = null;

/**
 * Queen command handler - manages multi-queen architecture
 * @param {string[]} args - Command arguments
 * @param {Object} flags - Command flags
 * @returns {Promise<void>}
 */
export async function queenCommand(args, flags) {
  const subcommand = args[0];
  const remainingArgs = args.slice(1);

  console.log(chalk.cyan('👑 Multi-Queen Architecture System'));
  console.log(chalk.gray('Specialized AI Queens working together'));
  console.log();

  try {
    // Initialize coordinator if not already done
    if (!queenCoordinator) {
      console.log(chalk.yellow('🔄 Initializing Queen Coordinator...'));
      queenCoordinator = new QueenCoordinator({
        maxConcurrentTasks: 20,
        enableLoadBalancing: true,
        consensusThreshold: 0.7,
        healthCheckInterval: 30000
      });
      await queenCoordinator.start();
      console.log(chalk.green('✅ Queen Coordinator initialized'));
      console.log();
    }

    switch (subcommand) {
      case 'status':
        await handleQueenStatus(remainingArgs, flags);
        break;
      
      case 'list':
        await handleQueenList(remainingArgs, flags);
        break;
      
      case 'task':
        await handleQueenTask(remainingArgs, flags);
        break;
      
      case 'collaborate':
        await handleQueenCollaborate(remainingArgs, flags);
        break;
      
      case 'metrics':
        await handleQueenMetrics(remainingArgs, flags);
        break;
      
      case 'health':
        await handleQueenHealth(remainingArgs, flags);
        break;
      
      case 'help':
      default:
        showQueenHelp();
        break;
    }
  } catch (error) {
    console.error(chalk.red('❌ Queen command failed:'), error.message);
    if (flags.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Handle queen status subcommand
 * @param {string[]} args - Arguments
 * @param {Object} flags - Flags
 */
async function handleQueenStatus(args, flags) {
  console.log(chalk.cyan('👑 Queen System Status'));
  console.log();
  
  const isRunning = queenCoordinator.isRunning();
  const queueStatus = queenCoordinator.getQueueStatus();
  const metrics = queenCoordinator.getMetrics();
  
  // Overall Status
  console.log(chalk.bold('🏛️ Coordinator Status:'));
  console.log(`   Running: ${isRunning ? chalk.green('✅ Active') : chalk.red('❌ Stopped')}`);
  console.log(`   Total Tasks: ${chalk.cyan(metrics.totalTasks)}`);
  console.log(`   Completed: ${chalk.green(metrics.completedTasks)}`);
  console.log(`   Failed: ${metrics.failedTasks > 0 ? chalk.red(metrics.failedTasks) : chalk.gray(metrics.failedTasks)}`);
  console.log(`   Success Rate: ${chalk.cyan((metrics.completedTasks / Math.max(1, metrics.totalTasks) * 100).toFixed(1))}%`);
  console.log();
  
  // Queue Status
  console.log(chalk.bold('📋 Task Queue:'));
  console.log(`   Pending: ${chalk.yellow(queueStatus.pending)}`);
  console.log(`   Active: ${chalk.blue(queueStatus.active)}`);
  console.log(`   Completed: ${chalk.green(queueStatus.completed)}`);
  console.log(`   Failed: ${queueStatus.failed > 0 ? chalk.red(queueStatus.failed) : chalk.gray(queueStatus.failed)}`);
  console.log();
  
  // Performance Metrics
  if (metrics.averageProcessingTime > 0) {
    console.log(chalk.bold('⚡ Performance:'));
    console.log(`   Average Processing Time: ${chalk.cyan(metrics.averageProcessingTime.toFixed(2))}ms`);
    console.log(`   Consensus Rate: ${chalk.cyan((metrics.consensusRate * 100).toFixed(1))}%`);
    console.log(`   Throughput: ${chalk.cyan(metrics.throughput.toFixed(2))} tasks/min`);
    console.log();
  }
  
  // Queen Utilization
  console.log(chalk.bold('👑 Queen Utilization:'));
  for (const [queenName, utilization] of Object.entries(metrics.queenUtilization)) {
    const utilizationPercent = (utilization * 100).toFixed(1);
    let color = chalk.green;
    if (utilization > 0.8) color = chalk.red;
    else if (utilization > 0.6) color = chalk.yellow;
    
    console.log(`   ${queenName}: ${color(utilizationPercent + '%')}`);
  }
}

/**
 * Handle queen list subcommand
 * @param {string[]} args - Arguments
 * @param {Object} flags - Flags
 */
async function handleQueenList(args, flags) {
  console.log(chalk.cyan('👑 Available Queens'));
  console.log();
  
  const queens = queenCoordinator.getQueens();
  
  for (const [name, queen] of Object.entries(queens)) {
    const metrics = queen.getMetrics();
    const isHealthy = queen.isHealthy();
    const workload = queen.getWorkload();
    
    console.log(chalk.bold(`👑 ${name}`));
    console.log(`   Specialty: ${chalk.cyan(queen.getSpecialty())}`);
    console.log(`   Status: ${isHealthy ? chalk.green('✅ Healthy') : chalk.red('❌ Unhealthy')}`);
    console.log(`   Workload: ${workload > 0.8 ? chalk.red((workload * 100).toFixed(1) + '%') : 
                             workload > 0.6 ? chalk.yellow((workload * 100).toFixed(1) + '%') : 
                             chalk.green((workload * 100).toFixed(1) + '%')}`);
    
    if (metrics.tasksProcessed > 0) {
      console.log(`   Tasks Processed: ${chalk.cyan(metrics.tasksProcessed)}`);
      console.log(`   Average Confidence: ${chalk.cyan((metrics.averageConfidence * 100).toFixed(1))}%`);
      console.log(`   Average Processing Time: ${chalk.cyan(metrics.averageProcessingTime.toFixed(2))}ms`);
      console.log(`   Success Rate: ${chalk.cyan((metrics.successRate * 100).toFixed(1))}%`);
      
      if (metrics.collaborations > 0) {
        console.log(`   Collaborations: ${chalk.cyan(metrics.collaborations)}`);
        console.log(`   Consensus Rate: ${chalk.cyan((metrics.consensusReached / metrics.collaborations * 100).toFixed(1))}%`);
      }
    } else {
      console.log(`   ${chalk.gray('No tasks processed yet')}`);
    }
    console.log();
  }
}

/**
 * Handle queen task subcommand
 * @param {string[]} args - Arguments
 * @param {Object} flags - Flags
 */
async function handleQueenTask(args, flags) {
  const prompt = args.join(' ');
  
  if (!prompt) {
    console.error(chalk.red('❌ Task prompt required'));
    console.log(chalk.cyan('Usage: queen task "your task description here"'));
    console.log(chalk.gray('Example: queen task "create a function to validate email addresses"'));
    return;
  }
  
  console.log(chalk.yellow('🎯 Submitting task to Queen Coordinator...'));
  console.log(chalk.gray(`Task: ${prompt}`));
  console.log();
  
  const startTime = performance.now();
  
  try {
    // Submit task
    const taskId = await queenCoordinator.submitTask(prompt, {
      type: flags.type || 'code-generation',
      priority: flags.priority || 'medium',
      context: {
        language: flags.language,
        framework: flags.framework,
        code: flags.code
      }
    });
    
    console.log(chalk.blue(`📝 Task submitted with ID: ${taskId}`));
    
    // Wait for completion
    console.log(chalk.yellow('⏳ Waiting for queen to process task...'));
    const result = await queenCoordinator.waitForTask(taskId, 60000); // 60 second timeout
    
    const totalTime = performance.now() - startTime;
    
    console.log(chalk.green('✅ Task completed successfully'));
    console.log();
    
    // Display results
    if (result.decision) {
      // Consensus result
      console.log(chalk.cyan('👑 Queen Consensus Result:'));
      console.log(chalk.bold(`Decision: ${result.decision}`));
      console.log(`Confidence: ${chalk.cyan((result.confidence * 100).toFixed(1))}%`);
      console.log(`Method: ${chalk.cyan(result.method)}`);
      console.log(`Participants: ${chalk.cyan(result.participants)} queens`);
      console.log(`Processing Time: ${chalk.cyan(result.processingTime.toFixed(2))}ms`);
      console.log();
      console.log(chalk.cyan('📝 Reasoning:'));
      console.log(result.reasoning);
      
      if (result.dissenting && result.dissenting.length > 0) {
        console.log();
        console.log(chalk.yellow('⚠️ Dissenting Opinions:'));
        result.dissenting.forEach(dissent => {
          console.log(`   ${dissent.queenName}: ${dissent.recommendation} (${(dissent.confidence * 100).toFixed(1)}%)`);
        });
      }
    } else {
      // Single queen result
      console.log(chalk.cyan('👑 Queen Result:'));
      console.log(chalk.bold(`Queen: ${result.queenName}`));
      console.log(`Confidence: ${chalk.cyan((result.confidence * 100).toFixed(1))}%`);
      console.log(`Processing Time: ${chalk.cyan(result.processingTime.toFixed(2))}ms`);
      console.log();
      console.log(chalk.cyan('📝 Recommendation:'));
      console.log(result.recommendation);
      console.log();
      console.log(chalk.cyan('🧠 Reasoning:'));
      console.log(result.reasoning);
      
      if (result.alternatives && result.alternatives.length > 0) {
        console.log();
        console.log(chalk.yellow('💡 Alternatives:'));
        result.alternatives.forEach((alt, index) => {
          console.log(`   ${index + 1}. ${alt}`);
        });
      }
      
      if (result.metadata) {
        console.log();
        console.log(chalk.gray('📊 Metadata:'));
        console.log(chalk.gray(`   ${JSON.stringify(result.metadata, null, 2)}`));
      }
    }
    
    console.log();
    console.log(chalk.gray(`📈 Total Time: ${totalTime.toFixed(2)}ms`));
    
  } catch (error) {
    console.error(chalk.red('❌ Task failed:'), error.message);
    
    if (error.message.includes('timed out')) {
      console.log(chalk.yellow('💡 Try reducing task complexity or increasing timeout'));
    }
  }
}

/**
 * Handle queen collaborate subcommand
 * @param {string[]} args - Arguments
 * @param {Object} flags - Flags
 */
async function handleQueenCollaborate(args, flags) {
  const prompt = args.join(' ');
  
  if (!prompt) {
    console.error(chalk.red('❌ Collaboration prompt required'));
    console.log(chalk.cyan('Usage: queen collaborate "complex task requiring multiple queens"'));
    console.log(chalk.gray('Example: queen collaborate "review and fix this code for bugs and performance"'));
    return;
  }
  
  console.log(chalk.yellow('🤝 Initiating Queen Collaboration...'));
  console.log(chalk.gray(`Task: ${prompt}`));
  console.log();
  
  const startTime = performance.now();
  
  try {
    // Get available queens
    const queens = Object.values(queenCoordinator.getQueens());
    
    if (queens.length < 2) {
      console.log(chalk.yellow('⚠️ Only one queen available, cannot collaborate'));
      console.log(chalk.gray('Falling back to single queen execution...'));
    } else {
      console.log(chalk.blue(`👑 ${queens.length} queens available for collaboration`));
    }
    
    // Create collaboration task
    const task = {
      id: `collab_${Date.now()}`,
      type: flags.type || 'code-generation',
      prompt,
      priority: 'high', // Collaboration tasks get high priority
      context: {
        language: flags.language,
        framework: flags.framework,
        code: flags.code
      }
    };
    
    // Execute with consensus
    console.log(chalk.yellow('⏳ Queens collaborating on task...'));
    const consensus = await queenCoordinator.executeTask(task, true); // Require consensus
    
    const totalTime = performance.now() - startTime;
    
    console.log(chalk.green('✅ Queen collaboration completed'));
    console.log();
    
    // Display consensus results
    console.log(chalk.cyan('🏛️ Queen Consensus:'));
    console.log(chalk.bold(`Decision: ${consensus.decision}`));
    console.log(`Confidence: ${chalk.cyan((consensus.confidence * 100).toFixed(1))}%`);
    console.log(`Method: ${chalk.cyan(consensus.method)}`);
    console.log(`Participants: ${chalk.cyan(consensus.participants)} queens`);
    console.log(`Processing Time: ${chalk.cyan(consensus.processingTime.toFixed(2))}ms`);
    console.log();
    
    console.log(chalk.cyan('🧠 Collective Reasoning:'));
    console.log(consensus.reasoning);
    
    if (consensus.dissenting && consensus.dissenting.length > 0) {
      console.log();
      console.log(chalk.yellow('⚠️ Dissenting Views:'));
      consensus.dissenting.forEach(dissent => {
        console.log(`   👑 ${dissent.queenName}: ${dissent.recommendation}`);
        console.log(`      Confidence: ${(dissent.confidence * 100).toFixed(1)}%`);
        console.log(`      Reasoning: ${dissent.reasoning}`);
        console.log();
      });
    }
    
    console.log();
    console.log(chalk.gray(`🕒 Total Collaboration Time: ${totalTime.toFixed(2)}ms`));
    
  } catch (error) {
    console.error(chalk.red('❌ Collaboration failed:'), error.message);
  }
}

/**
 * Handle queen metrics subcommand
 * @param {string[]} args - Arguments
 * @param {Object} flags - Flags
 */
async function handleQueenMetrics(args, flags) {
  console.log(chalk.cyan('📊 Queen Performance Metrics'));
  console.log();
  
  const metrics = queenCoordinator.getMetrics();
  const queens = queenCoordinator.getQueens();
  
  // Overall System Metrics
  console.log(chalk.bold('🏛️ System Metrics:'));
  console.log(`   Total Tasks: ${chalk.cyan(metrics.totalTasks)}`);
  console.log(`   Success Rate: ${chalk.green((metrics.completedTasks / Math.max(1, metrics.totalTasks) * 100).toFixed(1))}%`);
  console.log(`   Average Processing Time: ${chalk.cyan(metrics.averageProcessingTime.toFixed(2))}ms`);
  console.log(`   Consensus Rate: ${chalk.cyan((metrics.consensusRate * 100).toFixed(1))}%`);
  console.log(`   Current Throughput: ${chalk.cyan(metrics.throughput.toFixed(2))} tasks/min`);
  console.log();
  
  // Individual Queen Metrics
  console.log(chalk.bold('👑 Individual Queen Performance:'));
  for (const [name, queen] of Object.entries(queens)) {
    const queenMetrics = queen.getMetrics();
    
    console.log(chalk.bold(`   ${name}:`));
    console.log(`     Tasks Processed: ${chalk.cyan(queenMetrics.tasksProcessed)}`);
    
    if (queenMetrics.tasksProcessed > 0) {
      console.log(`     Average Confidence: ${chalk.cyan((queenMetrics.averageConfidence * 100).toFixed(1))}%`);
      console.log(`     Average Processing Time: ${chalk.cyan(queenMetrics.averageProcessingTime.toFixed(2))}ms`);
      console.log(`     Success Rate: ${chalk.green((queenMetrics.successRate * 100).toFixed(1))}%`);
      console.log(`     Specialty Match Rate: ${chalk.cyan((queenMetrics.specialtyMatch * 100).toFixed(1))}%`);
      
      if (queenMetrics.collaborations > 0) {
        console.log(`     Collaborations: ${chalk.cyan(queenMetrics.collaborations)}`);
        console.log(`     Consensus Contribution: ${chalk.cyan((queenMetrics.consensusReached / queenMetrics.collaborations * 100).toFixed(1))}%`);
      }
      
      // Performance rating
      let rating = '🔴 Needs Improvement';
      const avgTime = queenMetrics.averageProcessingTime;
      const confidence = queenMetrics.averageConfidence;
      
      if (avgTime < 1000 && confidence > 0.8) rating = '🟢 Excellent';
      else if (avgTime < 2000 && confidence > 0.7) rating = '🟡 Good';
      else if (avgTime < 5000 && confidence > 0.6) rating = '🟠 Fair';
      
      console.log(`     Performance Rating: ${rating}`);
    } else {
      console.log(chalk.gray('     No tasks processed yet'));
    }
    console.log();
  }
  
  // Utilization Chart
  console.log(chalk.bold('📈 Current Utilization:'));
  for (const [queenName, utilization] of Object.entries(metrics.queenUtilization)) {
    const percent = Math.round(utilization * 100);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    const color = percent > 80 ? chalk.red : percent > 60 ? chalk.yellow : chalk.green;
    
    console.log(`   ${queenName.padEnd(12)} ${color(bar)} ${color(percent + '%')}`);
  }
}

/**
 * Handle queen health subcommand
 * @param {string[]} args - Arguments
 * @param {Object} flags - Flags
 */
async function handleQueenHealth(args, flags) {
  console.log(chalk.cyan('🏥 Queen Health Check'));
  console.log();
  
  const queens = queenCoordinator.getQueens();
  let healthyCount = 0;
  let totalCount = 0;
  
  for (const [name, queen] of Object.entries(queens)) {
    totalCount++;
    const isHealthy = queen.isHealthy();
    const workload = queen.getWorkload();
    const metrics = queen.getMetrics();
    
    if (isHealthy) {
      healthyCount++;
    }
    
    console.log(chalk.bold(`👑 ${name}`));
    console.log(`   Health Status: ${isHealthy ? chalk.green('✅ Healthy') : chalk.red('❌ Unhealthy')}`);
    console.log(`   Current Workload: ${workload > 0.9 ? chalk.red((workload * 100).toFixed(1) + '%') : 
                                      workload > 0.8 ? chalk.yellow((workload * 100).toFixed(1) + '%') : 
                                      chalk.green((workload * 100).toFixed(1) + '%')}`);
    
    // Health indicators
    const indicators = [];
    if (metrics.averageConfidence > 0.8) indicators.push(chalk.green('High Confidence'));
    else if (metrics.averageConfidence > 0.6) indicators.push(chalk.yellow('Medium Confidence'));
    else if (metrics.averageConfidence > 0) indicators.push(chalk.red('Low Confidence'));
    
    if (metrics.averageProcessingTime > 0) {
      if (metrics.averageProcessingTime < 1000) indicators.push(chalk.green('Fast Response'));
      else if (metrics.averageProcessingTime < 3000) indicators.push(chalk.yellow('Moderate Response'));
      else indicators.push(chalk.red('Slow Response'));
    }
    
    if (workload < 0.5) indicators.push(chalk.green('Low Load'));
    else if (workload < 0.8) indicators.push(chalk.yellow('Moderate Load'));
    else indicators.push(chalk.red('High Load'));
    
    if (indicators.length > 0) {
      console.log(`   Indicators: ${indicators.join(', ')}`);
    }
    
    // Recommendations
    const recommendations = [];
    if (workload > 0.9) recommendations.push('Reduce workload');
    if (metrics.averageProcessingTime > 5000) recommendations.push('Investigate performance issues');
    if (metrics.averageConfidence < 0.5) recommendations.push('Review model performance');
    
    if (recommendations.length > 0) {
      console.log(`   ${chalk.yellow('⚠️ Recommendations:')} ${recommendations.join(', ')}`);
    }
    
    console.log();
  }
  
  // Overall System Health
  const healthPercentage = (healthyCount / totalCount * 100).toFixed(1);
  console.log(chalk.bold('🏥 Overall System Health:'));
  console.log(`   Healthy Queens: ${chalk.green(healthyCount)}/${totalCount}`);
  console.log(`   System Health: ${healthPercentage}%`);
  
  let systemStatus = chalk.green('🟢 Excellent');
  if (healthPercentage < 100) systemStatus = chalk.yellow('🟡 Good');
  if (healthPercentage < 80) systemStatus = chalk.orange('🟠 Fair');
  if (healthPercentage < 60) systemStatus = chalk.red('🔴 Poor');
  
  console.log(`   Status: ${systemStatus}`);
}

/**
 * Show queen command help
 */
function showQueenHelp() {
  console.log(chalk.bold('👑 Multi-Queen Architecture Commands'));
  console.log();
  console.log(chalk.cyan('Usage:'));
  console.log('  queen <subcommand> [options]');
  console.log();
  console.log(chalk.cyan('Commands:'));
  console.log('  status             📊 Show queen system status');
  console.log('  list               👑 List all available queens and their details');
  console.log('  task <prompt>      🎯 Submit a task to the best available queen');
  console.log('  collaborate <prompt> 🤝 Submit a task requiring queen collaboration');
  console.log('  metrics            📈 Show detailed performance metrics');
  console.log('  health             🏥 Check queen health and get recommendations');
  console.log();
  console.log(chalk.cyan('Task Options:'));
  console.log('  --type <type>          Task type (code-generation, bug-detection, refactoring, etc.)');
  console.log('  --language <lang>      Programming language context');
  console.log('  --framework <name>     Framework context (react, vue, angular, etc.)');
  console.log('  --priority <level>     Task priority (low, medium, high, critical)');
  console.log('  --code <code>          Code context for analysis tasks');
  console.log('  --verbose              Show detailed output');
  console.log();
  console.log(chalk.cyan('Available Queens:'));
  console.log('  👑 CodeQueen           Specializes in code generation and refactoring');
  console.log('  👑 DebugQueen          Specializes in bug detection and security analysis');
  console.log('  👑 TestQueen           Specializes in test generation (coming soon)');
  console.log('  👑 ArchitectureQueen   Specializes in system design (coming soon)');
  console.log();
  console.log(chalk.cyan('Examples:'));
  console.log('  queen task "create a REST API endpoint for user authentication"');
  console.log('  queen task "analyze this code for security vulnerabilities" --type bug-detection');
  console.log('  queen collaborate "review and optimize this React component" --language typescript');
  console.log('  queen status');
  console.log('  queen metrics');
  console.log('  queen health');
  console.log();
  console.log(chalk.cyan('Collaboration Features:'));
  console.log('  • Multiple queens work together on complex tasks');
  console.log('  • Democratic consensus with confidence weighting');
  console.log('  • Automatic load balancing and health monitoring');
  console.log('  • Specialized expertise routing');
  console.log();
  console.log(chalk.gray('🤖 Powered by Multi-Queen Intelligence Architecture'));
}