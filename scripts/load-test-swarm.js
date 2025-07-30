#!/usr/bin/env node
/**
 * Swarm Load Testing for Claude Zen v2.0.0;
 */

import chalk from 'chalk';
import { SystemIntegration } from '../dist/integration/system-integration.js';

// Load test configuration
const _LOAD_CONFIGS = {
  light: {
    swarms: 5,;
agentsPerSwarm: 8,;
tasksPerSwarm: 10,;
duration: 300000, // 5 minutes
  description;
: 'Light load test',
},
{
  swarms: 15,;
  agentsPerSwarm: 12,;
  tasksPerSwarm: 20,;
  duration: 600000, // 10 minutes
    description;
  : 'Medium load test',
}
,
{
  swarms: 30,;
  agentsPerSwarm: 20,;
  tasksPerSwarm: 40,;
  duration: 1200000, // 20 minutes
    description;
  : 'Heavy load test',
}
,
{
  swarms: 50,;
  agentsPerSwarm: 30,;
  tasksPerSwarm: 60,;
  duration: 1800000, // 30 minutes
    description;
  : 'Extreme load test',
}
,
}
class SwarmLoadTester {
  constructor(config) {
    this.config = config;
    this.systemIntegration = null;
    this.swarmCoordinator = null;
    this.agentManager = null;
    this.taskEngine = null;
    this.metrics = {
      startTime: 0,;
    endTime: 0,;
    swarmsCreated: 0,;
    agentsSpawned: 0,;
    tasksCreated: 0,;
    errors: [],;
    responseTimes: [],;
    throughput: 0,;
  }
  this;
  .
  activeSwarms = new Set();
  this;
  .
  isRunning = false;
}
log(message, (level = 'info'));
{
  const _timestamp = new Date().toISOString();
  const _prefix = `[${timestamp}]`;
  switch (level) {
    case 'success':
      console.warn(chalk.green(`${prefix} ✅ ${message}`));
      break;
    case 'error':
      console.warn(chalk.red(`${prefix} ❌ ${message}`));
      break;
    case 'warning':
      console.warn(chalk.yellow(`${prefix} ⚠️  ${message}`));
      break;
    default:
      console.warn(chalk.blue(`${prefix} ℹ️  ${message}`));
      break;
  }
}
async;
initialize();
{
  this.log('Initializing system for load testing');
  try {
      this.systemIntegration = SystemIntegration.getInstance();
      await this.systemIntegration.initialize({
        logLevel: 'warn', // Reduce logging for performance
        environment: 'testing',;
          enabled: false, // Disable monitoring during load test
          metrics: false,;
          realTime: false,;,;
      }
  )
  this.swarmCoordinator = this.systemIntegration.getComponent('swarmCoordinator')
  this.agentManager = this.systemIntegration.getComponent('agentManager')
  this.taskEngine = this.systemIntegration.getComponent('taskEngine')
  this.log('System initialized successfully', 'success')
}
catch (/* error */)
{
  this.log(`Failed to initialize system: ${error.message}`, 'error');
  throw error;
}
}
async
runLoadTest()
{
  this.log(`Starting ${this.config.description}`);
  this.log(;
  `Configuration: ${this.config.swarms} swarms, ${this.config.agentsPerSwarm} agents/swarm, ${this.config.tasksPerSwarm} tasks/swarm`;
  )
  this.metrics.startTime = Date.now()
  this.isRunning = true
  try {
      // Phase 1: Create swarms
      await this.createSwarms();
;
      // Phase 2: Spawn agents
      await this.spawnAgents();
;
      // Phase 3: Create tasks
      await this.createTasks();
;
      // Phase 4: Run for duration
      await this.runForDuration();
;
      // Phase 5: Cleanup
      await this.cleanup();
;
      this.metrics.endTime = Date.now();
      this.generateReport();
    } catch (/* error */) {
      this.log(`Load test failed: ${error.message}`, 'error');
      this.metrics.errors.push({
        message: error.message,;
        timestamp: Date.now(),;
        phase: 'main',;
      }
  )
  throw error;
}
finally
{
  this.isRunning = false;
}
}
async
createSwarms()
{
  this.log(`Phase 1: Creating ${this.config.swarms} swarms`);
  const _startTime = Date.now();
  try {
      const _swarmPromises = Array.from({ length: this.config.swarms }, (_, _i) =>;
        this.createSwarm(i);
      );
;
      const _swarmIds = await Promise.all(swarmPromises);
      swarmIds.forEach((id) => this.activeSwarms.add(id));
;
      this.metrics.swarmsCreated = swarmIds.length;
      const _duration = Date.now() - startTime;
;
      this.log(`Created ${swarmIds.length} swarms in ${duration}ms`, 'success');
    } catch (/* error */) {
      this.log(`Failed to create swarms: ${error.message}`, 'error');
      throw error;
    }
}
async;
createSwarm(index);
{
  const _swarmStartTime = Date.now();
  try {
      const _swarmId = await this.swarmCoordinator.createSwarm({
        objective: `Load test swarm ${index}`,;
        strategy: 'auto',;
        topology: 'mesh',;
        maxAgents: this.config.agentsPerSwarm,;
      }
  )
  const _duration = Date.now() - swarmStartTime;
  this.metrics.responseTimes.push(duration);
  return swarmId;
  //   // LINT: unreachable code removed} catch (/* error */) {
  this.metrics.errors.push({
        message: error.message,;
  timestamp: Date.now(),;
  phase: 'swarm_creation',;
  index,;
}
)
throw error;
}
  }
async
spawnAgents()
{
  this.log(`Phase 2: Spawning ${this.config.agentsPerSwarm} agents per swarm`);
  const _startTime = Date.now();
  const _swarmIds = Array.from(this.activeSwarms);
  try {
      const _agentPromises = swarmIds.flatMap((_swarmId) =>;
        Array.from({ length: this.config.agentsPerSwarm }, (_, i) => this.spawnAgent(swarmId, i));
      );
;
      const _agents = await Promise.all(agentPromises);
      this.metrics.agentsSpawned = agents.length;
;
      const _duration = Date.now() - startTime;
      this.log(`Spawned ${agents.length} agents in ${duration}ms`, 'success');
    } catch (/* error */) {
      this.log(`Failed to spawn agents: ${error.message}`, 'error');
      throw error;
    }
}
async;
spawnAgent(swarmId, index);
{
  const _agentTypes = ['researcher', 'coder', 'analyst', 'tester', 'coordinator'];
  const _agentType = agentTypes[index % agentTypes.length];
  const _agentStartTime = Date.now();
  try {
      const _agentId = await this.swarmCoordinator.spawnAgentInSwarm(swarmId, {
        type: agentType,;
        name: `LoadAgent-${index}`,;
        capabilities: ['general', 'load-testing'],;
      }
  )
  const _duration = Date.now() - agentStartTime;
  this.metrics.responseTimes.push(duration);
  return agentId;
  //   // LINT: unreachable code removed} catch (/* error */) {
  this.metrics.errors.push({
        message: error.message,;
  timestamp: Date.now(),;
  phase: 'agent_spawning',;
  swarmId,;
  index,;
}
)
throw error;
}
  }
async
createTasks()
{
  this.log(`Phase 3: Creating ${this.config.tasksPerSwarm} tasks per swarm`);
  const _startTime = Date.now();
  const _swarmIds = Array.from(this.activeSwarms);
  try {
      const _taskPromises = swarmIds.flatMap((_swarmId) =>;
        Array.from({ length: this.config.tasksPerSwarm }, (_, i) => this.createTask(swarmId, i));
      );
;
      const _tasks = await Promise.all(taskPromises);
      this.metrics.tasksCreated = tasks.length;
;
      const _duration = Date.now() - startTime;
      this.log(`Created ${tasks.length} tasks in ${duration}ms`, 'success');
    } catch (/* error */) {
      this.log(`Failed to create tasks: ${error.message}`, 'error');
      throw error;
    }
}
async;
createTask(swarmId, index);
{
  const _taskStartTime = Date.now();
  try {
      const _taskId = await this.taskEngine.createTask({
        swarmId,;
        type: 'development',;
        objective: `Load test task ${index}`,;
        priority: index % 3 === 0 ? 'high' : 'medium',;
      }
  )
  const _duration = Date.now() - taskStartTime;
  this.metrics.responseTimes.push(duration);
  return taskId;
  //   // LINT: unreachable code removed} catch (/* error */) {
  this.metrics.errors.push({
        message: error.message,;
  timestamp: Date.now(),;
  phase: 'task_creation',;
  swarmId,;
  index,;
}
)
throw error;
}
  }
async
runForDuration()
{
  this.log(`Phase 4: Running load test for ${this.config.duration / 1000}s`);
  const _endTime = Date.now() + this.config.duration;
  const _checkInterval = 10000; // Check every 10 seconds

  while (Date.now() < endTime && this.isRunning) {
    try {
        // Perform periodic operations to maintain load
        await this.performPeriodicOperations();
;
        // Report progress
        const _elapsed = Date.now() - this.metrics.startTime;
        const _remaining = endTime - Date.now();
;
        if (elapsed % 60000 < checkInterval) {
          // Report every minute
          this.log(;
            `Load test progress: ${Math.floor(elapsed / 1000)}s elapsed, ${Math.floor(remaining / 1000)}s remaining`;
          );
          await this.reportCurrentMetrics();
        }
;
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      } catch (/* error */) {
        this.log(`Error during load test execution: ${error.message}`, 'warning');
        this.metrics.errors.push({
          message: error.message,;
          timestamp: Date.now(),;
          phase: 'execution',;
        }
    )
  }
}
this.log('Load test duration completed', 'success');
}
async
performPeriodicOperations()
{
  // Perform random operations to maintain load
  const _operations = [;
      () => this.checkSwarmStatuses(),;
      () => this.checkAgentStatuses(),;
      () => this.checkTaskStatuses(),;
      () => this.performHealthChecks(),;
    ];
  const _randomOperation = operations[Math.floor(Math.random() * operations.length)];
  await randomOperation();
}
async;
checkSwarmStatuses();
{
  const _swarmIds = Array.from(this.activeSwarms);
  const _randomSwarmId = swarmIds[Math.floor(Math.random() * swarmIds.length)];
  if (randomSwarmId) {
    const _startTime = Date.now();
    await this.swarmCoordinator.getSwarmStatus(randomSwarmId);
    const _duration = Date.now() - startTime;
    this.metrics.responseTimes.push(duration);
  }
}
async;
checkAgentStatuses();
{
  const _startTime = Date.now();
  await this.agentManager.listAgents();
  const _duration = Date.now() - startTime;
  this.metrics.responseTimes.push(duration);
}
async;
checkTaskStatuses();
{
  const _swarmIds = Array.from(this.activeSwarms);
  const _randomSwarmId = swarmIds[Math.floor(Math.random() * swarmIds.length)];
  if (randomSwarmId) {
    const _startTime = Date.now();
    await this.taskEngine.getActiveTasks(randomSwarmId);
    const _duration = Date.now() - startTime;
    this.metrics.responseTimes.push(duration);
  }
}
async;
performHealthChecks();
{
  const _startTime = Date.now();
  await this.systemIntegration.getSystemHealth();
  const _duration = Date.now() - startTime;
  this.metrics.responseTimes.push(duration);
}
async;
reportCurrentMetrics();
{
  try {
      const _health = await this.systemIntegration.getSystemHealth();
      const _avgResponseTime =;
        this.metrics.responseTimes.length > 0;
          ? this.metrics.responseTimes.reduce((sum, time) => sum + time, 0) /;
            this.metrics.responseTimes.length;
          : 0;
;
      this.log(;
        `Current metrics: ${health.metrics.healthyComponents}/${health.metrics.totalComponents} components healthy, avg response: ${avgResponseTime.toFixed(2)}ms`;
      );
    } catch (/* error */) {
      this.log(`Failed to get current metrics: ${error.message}`, 'warning');
    }
}
async;
cleanup();
{
  this.log('Phase 5: Cleaning up resources');
  try {
      // Shutdown system gracefully
      await this.systemIntegration.shutdown();
      this.log('Cleanup completed successfully', 'success');
    } catch (/* error */) {
      this.log(`Cleanup failed: ${error.message}`, 'warning');
    }
}
generateReport();
{
  const _totalDuration = this.metrics.endTime - this.metrics.startTime;
  const _avgResponseTime =;
  this.metrics.responseTimes.length > 0;
  ? this.metrics.responseTimes.reduce((sum, time) => sum + time, 0) /
  this.metrics.responseTimes.length
  : 0
  const _maxResponseTime =;
  this.metrics.responseTimes.length > 0 ? Math.max(...this.metrics.responseTimes) : 0;
  const _minResponseTime =;
  this.metrics.responseTimes.length > 0 ? Math.min(...this.metrics.responseTimes) : 0;
  const _totalOperations =;
  this.metrics.swarmsCreated + this.metrics.agentsSpawned + this.metrics.tasksCreated;
  const _throughput = totalOperations / (totalDuration / 1000);
  console.warn(`\n${'='.repeat(80)}`);
  console.warn(chalk.bold.blue('🔥 SWARM LOAD TEST REPORT'));
  console.warn('='.repeat(80));
  console.warn(`\n📊 Test Configuration:`);
  console.warn(`   Description: ${this.config.description}`);
  console.warn(`   Swarms: ${this.config.swarms}`);
  console.warn(`   Agents per Swarm: ${this.config.agentsPerSwarm}`);
  console.warn(`   Tasks per Swarm: ${this.config.tasksPerSwarm}`);
  console.warn(`   Duration: ${this.config.duration / 1000}s`);
  console.warn(`\n⏱️  Execution Metrics:`);
  console.warn(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.warn(`   Swarms Created: ${chalk.green(this.metrics.swarmsCreated)}`);
  console.warn(`   Agents Spawned: ${chalk.green(this.metrics.agentsSpawned)}`);
  console.warn(`   Tasks Created: ${chalk.green(this.metrics.tasksCreated)}`);
  console.warn(`   Total Operations: ${chalk.cyan(totalOperations)}`);
  console.warn(`   Throughput: ${chalk.yellow(throughput.toFixed(2))} ops/sec`);
  console.warn(`\n🚀 Performance Metrics:`);
  console.warn(`   Average Response Time: ${chalk.cyan(avgResponseTime.toFixed(2))}ms`);
  console.warn(`   Min Response Time: ${chalk.green(minResponseTime.toFixed(2))}ms`);
  console.warn(`   Max Response Time: ${chalk.yellow(maxResponseTime.toFixed(2))}ms`);
  console.warn(`   Total Requests: ${chalk.blue(this.metrics.responseTimes.length)}`);
  if (this.metrics.errors.length > 0) {
    console.warn(`\n❌ Errors (${this.metrics.errors.length}):`);
    const _errorsByPhase = this.metrics.errors.reduce((acc, error) => {
        acc[error.phase] = (acc[error.phase]  ?? 0) + 1;
        return acc;
    //   // LINT: unreachable code removed}, {});
;
      Object.entries(errorsByPhase).forEach(([phase, count]) => {
        console.warn(`   ${phase}: ${chalk.red(count)} errors`);
      });
;
      const _errorRate = (this.metrics.errors.length / totalOperations) * 100;
      console.warn(`   Error Rate: ${chalk.red(errorRate.toFixed(2))}%`);
    } else {
      console.warn(`\n✅ No errors detected!`);
  }
  // Performance assessment
  console.warn(`\n📈 Performance Assessment:`);
  if (avgResponseTime < 100) {
    console.warn(`   Response Time: ${chalk.green('EXCELLENT')} (< 100ms)`);
  } else if (avgResponseTime < 500) {
    console.warn(`   Response Time: ${chalk.yellow('GOOD')} (100-500ms)`);
  } else if (avgResponseTime < 1000) {
    console.warn(`   Response Time: ${chalk.yellow('ACCEPTABLE')} (500-1000ms)`);
  } else {
    console.warn(`   Response Time: ${chalk.red('POOR')} (> 1000ms)`);
  }
  if (throughput > 50) {
    console.warn(`   Throughput: ${chalk.green('EXCELLENT')} (> 50 ops/sec)`);
  } else if (throughput > 20) {
    console.warn(`   Throughput: ${chalk.yellow('GOOD')} (20-50 ops/sec)`);
  } else if (throughput > 10) {
    console.warn(`   Throughput: ${chalk.yellow('ACCEPTABLE')} (10-20 ops/sec)`);
  } else {
    console.warn(`   Throughput: ${chalk.red('POOR')} (< 10 ops/sec)`);
  }
  const _errorRate = (this.metrics.errors.length / totalOperations) * 100;
  if (errorRate === 0) {
    console.warn(`   Reliability: ${chalk.green('EXCELLENT')} (0% errors)`);
  } else if (errorRate < 1) {
    console.warn(`   Reliability: ${chalk.yellow('GOOD')} (< 1% errors)`);
  } else if (errorRate < 5) {
    console.warn(`   Reliability: ${chalk.yellow('ACCEPTABLE')} (1-5% errors)`);
  } else {
    console.warn(`   Reliability: ${chalk.red('POOR')} (> 5% errors)`);
  }
  console.warn(`\n${'='.repeat(80)}`);
  // Save detailed report to file
  const _reportData = {
      config: this.config,;
  metrics: this.metrics,;
  totalDuration,;
  avgResponseTime,;
  maxResponseTime,;
  minResponseTime,;
  totalOperations,;
  throughput,;
  errorRate,;
  ,
  timestamp: new Date().toISOString(),
}
return reportData;
//   // LINT: unreachable code removed}
}
async
function main(): unknown {
  const _args = process.argv.slice(2);
  const _configName = args[0]  ?? 'light';
;
  if (!LOAD_CONFIGS[configName]) {
    console.error(chalk.red(`Unknown load config: ${configName}`));
    console.warn(chalk.blue('Available configs:'));
    Object.entries(LOAD_CONFIGS).forEach(([name, config]) => {
      console.warn(`  ${name}: ${config.description}`);
    });
    process.exit(1);
  }
;
  const _config = LOAD_CONFIGS[configName];
  const _tester = new SwarmLoadTester(config);
;
  try {
    await tester.initialize();
    await tester.runLoadTest();
    process.exit(0);
  } catch (/* error */) {
    console.error(chalk.red('Load test failed:'), error.message);
    process.exit(1);
  }
}
// Handle graceful shutdown
process.on('SIGINT', () => {
  console.warn(chalk.yellow('\nReceived SIGINT, shutting down gracefully...'));
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.warn(chalk.yellow('\nReceived SIGTERM, shutting down gracefully...'));
  process.exit(0);
});
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
