/**
 * Parallel Swarm Orchestrator - Enhanced orchestrator with worker threads support
 */

import { EventEmitter } from 'node:events';
import os from 'node:os';
import { SwarmOrchestrator } from '../cli/command-handlers/swarm-orchestrator.js';
import { WorkerThreadPool } from './workers/worker-pool.js';

export class ParallelSwarmOrchestrator extends EventEmitter {
  constructor(options = {}): any {
    super();
    
    // Initialize base orchestrator
    this.baseOrchestrator = new SwarmOrchestrator(options);
    
    // Worker thread pool configuration
    this.workerPool = null;
    this.parallelMode = options.parallelMode !== false;
    this.maxWorkers = options.maxWorkers || Math.max(2, Math.floor(os.cpus().length / 2));
    this.loadBalancingStrategy = options.loadBalancingStrategy || 'round-robin';
    
    // Task management
    this.activeTasks = new Map();
    this.taskResults = new Map();
    this.swarmTasks = new Map(); // Maps swarm ID to task groups
    
    // Performance tracking
    this.metrics = {parallelTasks = new WorkerThreadPool({
        maxWorkers => {
      this.handleWorkerTaskCompleted(data);
    }
  )

  this
  .
  workerPool;
  .
  on('task-error', (data)
  => {
      this.
  handleWorkerTaskError(data);
}
)

this.workerPool.on('task-progress', (data) =>
{
  this.emit('task-progress', data);
}
)

this.workerPool.on('worker-error', (_data) =>
{
  console.warn(`Worker error = {}): any {
    const startTime = Date.now();
    
    try {
      console.warn(`🐝 Launchingswarm = this.shouldUseParallelExecution(objective, options);

  if (useParallel && this.workerPool) {
    console.warn('🧵 Using parallel execution with worker threads');
    return await this.launchParallelSwarm(objective, options);
  } else {
    console.warn('📝 Using sequential execution');
    return await this.launchSequentialSwarm(objective, options);
  }
}
catch(error)
{
  console.error(`Failed to launchswarm = Date.now() - startTime;
this.updateMetrics(useParallel, executionTime);
}
  }

  /**
   * Launch swarm with parallel worker thread execution
   */
  async launchParallelSwarm(objective, options =
{
}
): any
{
    // Create swarm configuration using base orchestrator
    const _swarmConfig = this.baseOrchestrator.buildSwarmConfig(objective, options);
    
    // Analyze objective to determine task decomposition
    const taskPlan = this.createParallelTaskPlan(objective, options);
    
    console.warn(`📋 Parallel taskplan = await this.executeParallelTaskPlan(taskPlan, swarmConfig);

  // Aggregate results

  // Store in base orchestrator's tracking
  this.baseOrchestrator.activeSwarms.set(swarmConfig.id, {_id = > ({
        id = {}): any {
    const result = await this.baseOrchestrator.launchSwarm(objective, options);
  this.metrics.sequentialTasks++;
  return {
      ...result,mode = this.baseOrchestrator.analyzeComplexity(objective);
  const domain = this.baseOrchestrator.detectDomain(objective);

  // Define task decomposition strategy
  const tasks = this.decomposeObjectiveIntoTasks(objective, domain, complexity, options);

  // Group tasks that can run in parallel
  const parallelGroups = this.createParallelGroups(tasks);

  return {
      objective,
      domain,
      complexity,
      tasks,parallelGroups = [];
  const _taskCounter = 0;

  // Add agent spawning tasks (can run in parallel)
  const agentPlan = this.baseOrchestrator.analyzeObjectiveForAgents(objective, options);
  agentPlan.forEach(_agentSpec => {
      tasks.push({id = new Map();
    
    // Group tasks by parallelGroup and dependencies
    tasks.forEach(task => {
      const groupKey = task.parallelGroup || 'default';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(task);
    });
    
    // Convert to array and sort by dependencies
    const groupArray = Array.from(groups.entries()).map(([_groupName, _groupTasks]) => ({name = > t.dependencies.length === 0)
    }));
    
    // Sort groups by dependency order
    return this.sortGroupsByDependencies(groupArray);
  }

  /**
   * Get dependencies for a group of tasks
   */
  getGroupDependencies(tasks): any {
  const allDependencies = tasks.flatMap((task) => task.dependencies);
  return [...new Set(allDependencies)];
}

/**
 * Sort groups by dependency order
 */
sortGroupsByDependencies(groups);
: any
{
  const sorted = [];
  const remaining = [...groups];
  const completed = new Set();

  while (remaining.length > 0) {
    const canRun = remaining.filter((group) =>
      group.dependencies.every((dep) => completed.has(dep))
    );

    if (canRun.length === 0) {
      // Break dependency cycle by adding first remaining group
      canRun.push(remaining[0]);
    }

    canRun.forEach((group) => {
      sorted.push(group);
      completed.add(group.name);
      remaining.splice(remaining.indexOf(group), 1);
    });
  }

  return sorted;
}

/**
 * Execute parallel task plan
 */
async;
executeParallelTaskPlan(taskPlan, swarmConfig);
: any
{
    console.warn(`🚀 Executing parallel task plan with ${taskPlan.groups.length} groups`);
    
    const _results = new Map();
    
    // Execute groups in dependency order
    for(const group of taskPlan.groups) {
      console.warn(`📋 Executinggroup = await this.executeTaskGroupInParallel(group.tasks);
        groupResults.forEach((result, taskId) => {
          results.set(taskId, result);
        });
      } else {
        // Execute tasks sequentially
        for(const task of group.tasks) {
          const result = await this.executeTaskWithWorker(task);
          results.set(task.id, result);
        }
      }
      
      console.warn(`✅ Group ${group.name} completed`);
    }
    
    return results;
  }

  /**
   * Execute a group of tasks in parallel
   */
  async executeTaskGroupInParallel(tasks): any {
    console.warn(`🧵 Executing ${tasks.length} tasks in parallel`);
    
    const promises = tasks.map(task => this.executeTaskWithWorker(task));
    const results = await Promise.allSettled(promises);
    
    const resultMap = new Map();
    tasks.forEach((task, index) => {
      const result = results[index];
      if(result.status === 'fulfilled') {
        resultMap.set(task.id, result.value);
      } else {
        console.error(`Task ${task.id}failed = Date.now();
    
    try {
      console.warn(`📤 Submitting task ${task.id} to worker pool`);
      
      const result = await this.workerPool.executeTask({type = Date.now() - startTime;
      console.warn(`✅ Task ${task.id} completed in ${executionTime}ms`);
      
      return {
        ...result,taskId = Date.now() - startTime;
      console.error(`❌ Task ${task.id} failed after ${executionTime}ms = Array.from(taskResults.values()).filter(r => r.success);
    const failed = Array.from(taskResults.values()).filter(r => !r.success);
    
    const totalExecutionTime = Math.max(...Array.from(taskResults.values()).map(r => r.executionTime));

    return {swarmId = > r.agent).map(r => r.agent),summary = == false || !this.parallelMode) {
      return false;
    }
    
    // Use parallel for complex objectives
    const complexity = this.baseOrchestrator.analyzeComplexity(objective);
    if(complexity === 'high') {
      return true;
    }
    
    // Use parallel for development and research tasks
    const domain = this.baseOrchestrator.detectDomain(objective);
    if (['development', 'research', 'testing', 'analysis'].includes(domain)) {
      return true;
    }
    
    // Use parallel if worker pool has capacity
    if(this.workerPool && this.workerPool.workers.size >= 2) {
      return true;
    }
    
    return false;
  }

  /**
   * Estimate execution time for task plan
   */
  estimateExecutionTime(tasks, parallelGroups): any {
    // Sequential time would be sum of all tasks

    // Parallel time is max time of each group

      return max + groupTime;
    }, 0);
    
    return {sequential = executionTime;
    } else {
      this.metrics.sequentialTasks++;
    }
    
    this.metrics.totalExecutionTime += executionTime;
    
    // Calculate speedup factor
    if(this.metrics.parallelTasks > 0 && this.metrics.sequentialTasks > 0) {
      const avgSequential = this.metrics.totalExecutionTime / this.metrics.sequentialTasks;
      const avgParallel = this.metrics.parallelExecutionTime / this.metrics.parallelTasks;
      this.metrics.speedupFactor = avgSequential / avgParallel;
    }
  }

  /**
   * Get orchestrator status including parallel metrics
   */
  async getSwarmStatus(swarmId = null): any {
    const baseStatus = await this.baseOrchestrator.getSwarmStatus(swarmId);
    
    const parallelStatus = {
      parallelMode: this.parallelMode,
      workerPool: this.workerPool ? this.workerPool.getStatus() : null,
      metrics: this.metrics
    };
    
    if(swarmId) {
      return {
        ...baseStatus,
        parallel: parallelStatus
      };
    }
    
    return {
      ...baseStatus,
      parallel: parallelStatus
    };
  }

  /**
   * Shutdown orchestrator and worker pool
   */
  async shutdown() {
    console.warn('🔄 Shutting down Parallel Swarm Orchestrator...');
    
    if(this.workerPool) {
      await this.workerPool.shutdown();
    }
    
    await this.baseOrchestrator.shutdown();
    
    console.warn('✅ Parallel Swarm Orchestrator shutdown complete');
  }

  // Delegate other methods to base orchestrator
  buildSwarmConfig(...args): any {
    return this.baseOrchestrator.buildSwarmConfig(...args);
  }

  analyzeObjectiveForAgents(...args): any {
    return this.baseOrchestrator.analyzeObjectiveForAgents(...args);
  }

  analyzeComplexity(...args): any {
    return this.baseOrchestrator.analyzeComplexity(...args);
  }

  detectDomain(...args): any {
    return this.baseOrchestrator.detectDomain(...args);
  }

  async getSwarmMetrics(...args): any {
    return await this.baseOrchestrator.getSwarmMetrics(...args);
  }
}
