/**
 * Parallel Swarm Orchestrator - Enhanced orchestrator with worker threads support
 */

import { WorkerThreadPool } from './workers/worker-pool.js';
import { SwarmOrchestrator } from '../cli/command-handlers/swarm-orchestrator.js';
import { EventEmitter } from 'events';
import os from 'os';

export class ParallelSwarmOrchestrator extends EventEmitter {
  constructor(options = {}) {
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
    this.metrics = {
      parallelTasks: 0,
      sequentialTasks: 0,
      totalExecutionTime: 0,
      parallelExecutionTime: 0,
      speedupFactor: 1.0,
      averageWorkerUtilization: 0
    };
  }

  /**
   * Initialize the parallel orchestrator
   */
  async initialize() {
    console.log('🚀 Initializing Parallel Swarm Orchestrator...');
    
    // Initialize base orchestrator
    await this.baseOrchestrator.initialize();
    
    // Initialize worker pool if parallel mode is enabled
    if (this.parallelMode) {
      this.workerPool = new WorkerThreadPool({
        maxWorkers: this.maxWorkers,
        minWorkers: Math.min(2, this.maxWorkers),
        loadBalancingStrategy: this.loadBalancingStrategy
      });
      
      await this.workerPool.initialize();
      
      // Set up worker pool event handlers
      this.setupWorkerPoolEventHandlers();
      
      console.log(`✅ Parallel mode enabled with ${this.workerPool.workers.size} workers`);
    } else {
      console.log('📝 Sequential mode - no worker threads');
    }
    
    console.log('✅ Parallel Swarm Orchestrator initialized');
    return this;
  }

  /**
   * Set up event handlers for worker pool
   */
  setupWorkerPoolEventHandlers() {
    this.workerPool.on('task-completed', (data) => {
      this.handleWorkerTaskCompleted(data);
    });

    this.workerPool.on('task-error', (data) => {
      this.handleWorkerTaskError(data);
    });

    this.workerPool.on('task-progress', (data) => {
      this.emit('task-progress', data);
    });

    this.workerPool.on('worker-error', (data) => {
      console.warn(`Worker error: ${data.error}`);
    });
  }

  /**
   * Enhanced swarm launch with parallel execution
   */
  async launchSwarm(objective, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🐝 Launching swarm: "${objective}"`);
      
      // Determine execution strategy
      const useParallel = this.shouldUseParallelExecution(objective, options);
      
      if (useParallel && this.workerPool) {
        console.log('🧵 Using parallel execution with worker threads');
        return await this.launchParallelSwarm(objective, options);
      } else {
        console.log('📝 Using sequential execution');
        return await this.launchSequentialSwarm(objective, options);
      }
      
    } catch (error) {
      console.error(`Failed to launch swarm: ${error.message}`);
      throw error;
    } finally {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(useParallel, executionTime);
    }
  }

  /**
   * Launch swarm with parallel worker thread execution
   */
  async launchParallelSwarm(objective, options = {}) {
    // Create swarm configuration using base orchestrator
    const swarmConfig = this.baseOrchestrator.buildSwarmConfig(objective, options);
    
    // Analyze objective to determine task decomposition
    const taskPlan = this.createParallelTaskPlan(objective, options);
    
    console.log(`📋 Parallel task plan: ${taskPlan.tasks.length} tasks, ${taskPlan.parallelGroups} parallel groups`);
    
    // Execute tasks in parallel groups
    const results = await this.executeParallelTaskPlan(taskPlan, swarmConfig);
    
    // Aggregate results
    const swarmResult = this.aggregateSwarmResults(swarmConfig, taskPlan, results);
    
    // Store in base orchestrator's tracking
    this.baseOrchestrator.activeSwarms.set(swarmConfig.id, {
      _id: swarmConfig.id,
      _config: swarmConfig,
      status: 'completed',
      results: swarmResult
    });
    
    console.log(`✅ Parallel swarm completed: ${swarmConfig.id}`);
    
    return {
      swarmId: swarmConfig.id,
      mode: 'parallel',
      taskPlan,
      results: swarmResult,
      agents: taskPlan.tasks.map(task => ({
        id: task.agentId || `agent-${task.id}`,
        type: task.agentType || 'worker',
        name: task.name || task.type
      })),
      status: 'completed',
      parallelExecutionStats: {
        totalTasks: taskPlan.tasks.length,
        parallelGroups: taskPlan.parallelGroups,
        workersUsed: this.workerPool.getStatus().workers.total
      }
    };
  }

  /**
   * Launch swarm with sequential execution (fallback)
   */
  async launchSequentialSwarm(objective, options = {}) {
    const result = await this.baseOrchestrator.launchSwarm(objective, options);
    this.metrics.sequentialTasks++;
    return {
      ...result,
      mode: 'sequential'
    };
  }

  /**
   * Create parallel task execution plan
   */
  createParallelTaskPlan(objective, options) {
    const complexity = this.baseOrchestrator.analyzeComplexity(objective);
    const domain = this.baseOrchestrator.detectDomain(objective);
    
    // Define task decomposition strategy
    const tasks = this.decomposeObjectiveIntoTasks(objective, domain, complexity, options);
    
    // Group tasks that can run in parallel
    const parallelGroups = this.createParallelGroups(tasks);
    
    return {
      objective,
      domain,
      complexity,
      tasks,
      parallelGroups: parallelGroups.length,
      groups: parallelGroups,
      estimatedExecutionTime: this.estimateExecutionTime(tasks, parallelGroups)
    };
  }

  /**
   * Decompose objective into parallelizable tasks
   */
  decomposeObjectiveIntoTasks(objective, domain, complexity, options) {
    const tasks = [];
    let taskCounter = 0;

    // Add agent spawning tasks (can run in parallel)
    const agentPlan = this.baseOrchestrator.analyzeObjectiveForAgents(objective, options);
    agentPlan.forEach(agentSpec => {
      tasks.push({
        id: `task-${++taskCounter}`,
        type: 'agent-spawn',
        agentType: agentSpec.type,
        name: `Spawn ${agentSpec.name}`,
        data: {
          agentType: agentSpec.type,
          agentConfig: {
            name: agentSpec.name,
            capabilities: agentSpec.capabilities,
            priority: agentSpec.priority
          }
        },
        dependencies: [],
        parallelGroup: 'agent-spawning',
        estimatedTime: 500
      });
    });

    // Add domain-specific tasks based on objective
    switch (domain) {
      case 'development':
        tasks.push(
          {
            id: `task-${++taskCounter}`,
            type: 'code-analysis',
            name: 'Analyze existing codebase',
            data: { codebase: 'current', analysisOptions: { includeComplexity: true } },
            dependencies: [],
            parallelGroup: 'analysis',
            estimatedTime: 2000
          },
          {
            id: `task-${++taskCounter}`,
            type: 'performance-optimization',
            name: 'Identify performance bottlenecks',
            data: { target: 'application', metrics: ['cpu', 'memory', 'io'] },
            dependencies: [],
            parallelGroup: 'analysis',
            estimatedTime: 1500
          },
          {
            id: `task-${++taskCounter}`,
            type: 'task-coordination',
            name: 'Coordinate development workflow',
            data: {
              subtasks: ['design', 'implement', 'test', 'deploy'],
              strategy: options.strategy || 'agile'
            },
            dependencies: ['agent-spawning'],
            parallelGroup: 'coordination',
            estimatedTime: 1000
          }
        );
        break;

      case 'research':
        tasks.push(
          {
            id: `task-${++taskCounter}`,
            type: 'research-task',
            name: 'Gather research data',
            data: { topic: objective, depth: 'comprehensive', sources: ['academic', 'industry'] },
            dependencies: [],
            parallelGroup: 'research',
            estimatedTime: 3000
          },
          {
            id: `task-${++taskCounter}`,
            type: 'neural-analysis',
            name: 'Analyze research patterns',
            data: { data: 'research-data', analysisType: 'pattern-recognition' },
            dependencies: [],
            parallelGroup: 'analysis',
            estimatedTime: 2000
          }
        );
        break;

      case 'testing':
        tasks.push(
          {
            id: `task-${++taskCounter}`,
            type: 'testing-task',
            name: 'Run comprehensive tests',
            data: { testType: 'full-suite', target: 'application', testConfig: { coverage: true } },
            dependencies: [],
            parallelGroup: 'testing',
            estimatedTime: 4000
          },
          {
            id: `task-${++taskCounter}`,
            type: 'performance-optimization',
            name: 'Optimize test performance',
            data: { target: 'test-suite', metrics: ['execution-time', 'resource-usage'] },
            dependencies: [],
            parallelGroup: 'optimization',
            estimatedTime: 1500
          }
        );
        break;

      default:
        // Generic tasks for unknown domains
        tasks.push(
          {
            id: `task-${++taskCounter}`,
            type: 'task-coordination',
            name: 'Coordinate generic workflow',
            data: { subtasks: ['analyze', 'execute', 'validate'], strategy: 'balanced' },
            dependencies: ['agent-spawning'],
            parallelGroup: 'coordination',
            estimatedTime: 1200
          }
        );
    }

    return tasks;
  }

  /**
   * Create parallel execution groups from tasks
   */
  createParallelGroups(tasks) {
    const groups = new Map();
    
    // Group tasks by parallelGroup and dependencies
    tasks.forEach(task => {
      const groupKey = task.parallelGroup || 'default';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(task);
    });
    
    // Convert to array and sort by dependencies
    const groupArray = Array.from(groups.entries()).map(([groupName, groupTasks]) => ({
      name: groupName,
      tasks: groupTasks,
      dependencies: this.getGroupDependencies(groupTasks),
      canRunInParallel: groupTasks.length > 1 || groupTasks.some(t => t.dependencies.length === 0)
    }));
    
    // Sort groups by dependency order
    return this.sortGroupsByDependencies(groupArray);
  }

  /**
   * Get dependencies for a group of tasks
   */
  getGroupDependencies(tasks) {
    const allDependencies = tasks.flatMap(task => task.dependencies);
    return [...new Set(allDependencies)];
  }

  /**
   * Sort groups by dependency order
   */
  sortGroupsByDependencies(groups) {
    const sorted = [];
    const remaining = [...groups];
    const completed = new Set();
    
    while (remaining.length > 0) {
      const canRun = remaining.filter(group => 
        group.dependencies.every(dep => completed.has(dep))
      );
      
      if (canRun.length === 0) {
        // Break dependency cycle by adding first remaining group
        canRun.push(remaining[0]);
      }
      
      canRun.forEach(group => {
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
  async executeParallelTaskPlan(taskPlan, swarmConfig) {
    console.log(`🚀 Executing parallel task plan with ${taskPlan.groups.length} groups`);
    
    const results = new Map();
    
    // Execute groups in dependency order
    for (const group of taskPlan.groups) {
      console.log(`📋 Executing group: ${group.name} (${group.tasks.length} tasks)`);
      
      if (group.canRunInParallel && group.tasks.length > 1) {
        // Execute tasks in parallel
        const groupResults = await this.executeTaskGroupInParallel(group.tasks);
        groupResults.forEach((result, taskId) => {
          results.set(taskId, result);
        });
      } else {
        // Execute tasks sequentially
        for (const task of group.tasks) {
          const result = await this.executeTaskWithWorker(task);
          results.set(task.id, result);
        }
      }
      
      console.log(`✅ Group ${group.name} completed`);
    }
    
    return results;
  }

  /**
   * Execute a group of tasks in parallel
   */
  async executeTaskGroupInParallel(tasks) {
    console.log(`🧵 Executing ${tasks.length} tasks in parallel`);
    
    const promises = tasks.map(task => this.executeTaskWithWorker(task));
    const results = await Promise.allSettled(promises);
    
    const resultMap = new Map();
    tasks.forEach((task, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        resultMap.set(task.id, result.value);
      } else {
        console.error(`Task ${task.id} failed:`, result.reason);
        resultMap.set(task.id, { 
          success: false, 
          error: result.reason.message,
          task: task.name 
        });
      }
    });
    
    return resultMap;
  }

  /**
   * Execute a single task using worker thread
   */
  async executeTaskWithWorker(task) {
    const startTime = Date.now();
    
    try {
      console.log(`📤 Submitting task ${task.id} to worker pool`);
      
      const result = await this.workerPool.executeTask({
        type: task.type,
        data: task.data,
        options: { timeout: task.estimatedTime * 2 }
      });
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ Task ${task.id} completed in ${executionTime}ms`);
      
      return {
        ...result,
        taskId: task.id,
        taskName: task.name,
        executionTime
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Task ${task.id} failed after ${executionTime}ms:`, error.message);
      
      return {
        success: false,
        error: error.message,
        taskId: task.id,
        taskName: task.name,
        executionTime
      };
    }
  }

  /**
   * Aggregate results from parallel execution
   */
  aggregateSwarmResults(swarmConfig, taskPlan, taskResults) {
    const successful = Array.from(taskResults.values()).filter(r => r.success);
    const failed = Array.from(taskResults.values()).filter(r => !r.success);
    
    const totalExecutionTime = Math.max(...Array.from(taskResults.values()).map(r => r.executionTime));
    const avgExecutionTime = Array.from(taskResults.values()).reduce((sum, r) => sum + r.executionTime, 0) / taskResults.size;
    
    return {
      swarmId: swarmConfig.id,
      objective: swarmConfig.objective,
      totalTasks: taskPlan.tasks.length,
      successfulTasks: successful.length,
      failedTasks: failed.length,
      successRate: (successful.length / taskPlan.tasks.length) * 100,
      totalExecutionTime,
      avgExecutionTime,
      parallelGroups: taskPlan.parallelGroups,
      results: Object.fromEntries(taskResults),
      agents: successful.filter(r => r.agent).map(r => r.agent),
      summary: `Completed ${successful.length}/${taskPlan.tasks.length} tasks successfully`
    };
  }

  /**
   * Determine if parallel execution should be used
   */
  shouldUseParallelExecution(objective, options) {
    // Don't use parallel if explicitly disabled
    if (options.parallel === false || !this.parallelMode) {
      return false;
    }
    
    // Use parallel for complex objectives
    const complexity = this.baseOrchestrator.analyzeComplexity(objective);
    if (complexity === 'high') {
      return true;
    }
    
    // Use parallel for development and research tasks
    const domain = this.baseOrchestrator.detectDomain(objective);
    if (['development', 'research', 'testing', 'analysis'].includes(domain)) {
      return true;
    }
    
    // Use parallel if worker pool has capacity
    if (this.workerPool && this.workerPool.workers.size >= 2) {
      return true;
    }
    
    return false;
  }

  /**
   * Estimate execution time for task plan
   */
  estimateExecutionTime(tasks, parallelGroups) {
    // Sequential time would be sum of all tasks
    const sequentialTime = tasks.reduce((sum, task) => sum + task.estimatedTime, 0);
    
    // Parallel time is max time of each group
    const parallelTime = parallelGroups.reduce((max, group) => {
      const groupTime = group.canRunInParallel ? 
        Math.max(...group.tasks.map(t => t.estimatedTime)) :
        group.tasks.reduce((sum, t) => sum + t.estimatedTime, 0);
      return max + groupTime;
    }, 0);
    
    return {
      sequential: sequentialTime,
      parallel: parallelTime,
      speedupFactor: sequentialTime / parallelTime
    };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(wasParallel, executionTime) {
    if (wasParallel) {
      this.metrics.parallelTasks++;
      this.metrics.parallelExecutionTime += executionTime;
    } else {
      this.metrics.sequentialTasks++;
    }
    
    this.metrics.totalExecutionTime += executionTime;
    
    // Calculate speedup factor
    if (this.metrics.parallelTasks > 0 && this.metrics.sequentialTasks > 0) {
      const avgSequential = this.metrics.totalExecutionTime / this.metrics.sequentialTasks;
      const avgParallel = this.metrics.parallelExecutionTime / this.metrics.parallelTasks;
      this.metrics.speedupFactor = avgSequential / avgParallel;
    }
  }

  /**
   * Get orchestrator status including parallel metrics
   */
  async getSwarmStatus(swarmId = null) {
    const baseStatus = await this.baseOrchestrator.getSwarmStatus(swarmId);
    
    const parallelStatus = {
      parallelMode: this.parallelMode,
      workerPool: this.workerPool ? this.workerPool.getStatus() : null,
      metrics: this.metrics
    };
    
    if (swarmId) {
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
    console.log('🔄 Shutting down Parallel Swarm Orchestrator...');
    
    if (this.workerPool) {
      await this.workerPool.shutdown();
    }
    
    await this.baseOrchestrator.shutdown();
    
    console.log('✅ Parallel Swarm Orchestrator shutdown complete');
  }

  // Delegate other methods to base orchestrator
  buildSwarmConfig(...args) {
    return this.baseOrchestrator.buildSwarmConfig(...args);
  }

  analyzeObjectiveForAgents(...args) {
    return this.baseOrchestrator.analyzeObjectiveForAgents(...args);
  }

  analyzeComplexity(...args) {
    return this.baseOrchestrator.analyzeComplexity(...args);
  }

  detectDomain(...args) {
    return this.baseOrchestrator.detectDomain(...args);
  }

  async getSwarmMetrics(...args) {
    return await this.baseOrchestrator.getSwarmMetrics(...args);
  }
}