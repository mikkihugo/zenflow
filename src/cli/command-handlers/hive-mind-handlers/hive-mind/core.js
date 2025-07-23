/**
 * Hive Mind Core System
 * Central orchestration and coordination logic
 */

import EventEmitter from 'events';
import { MCPToolWrapper } from './mcp-wrapper.js';
import { PerformanceOptimizer } from './performance-optimizer.js';

/**
 * HiveMindCore - Main orchestration class
 */
export class HiveMindCore extends EventEmitter {
  constructor(metaRegistryManager, config = {}) {
    super();

    this.metaRegistryManager = metaRegistryManager;
    this.defaultRegistry = null;
    this.hierarchicalTaskManagerPlugin = null;

    this.config = {
      objective: '',
      name: `hive-${Date.now()}`,
      queenType: 'strategic',
      maxWorkers: 8,
      consensusAlgorithm: 'majority',
      autoScale: true,
      encryption: false,
      topology: 'hierarchical',
      memorySize: 100, // MB
      taskTimeout: 60, // minutes
      ...config,
    };

    this.state = {
      status: 'initializing',
      swarmId: null,
      queen: null,
      // Workers, tasks, memory, decisions are now managed by ruv-swarm and accessed via mcpWrapper
      metrics: {
        tasksCreated: 0,
        tasksCompleted: 0,
        decisionsReached: 0,
        memoryUsage: 0,
      },
    };

    this.mcpWrapper = new MCPToolWrapper({
      parallel: true,
      timeout: this.config.taskTimeout * 60 * 1000,
    });
    this.mcpWrapper.initialize();

    // Initialize performance optimizer
    this.performanceOptimizer = new PerformanceOptimizer({
      enableAsyncQueue: true,
      enableBatchProcessing: true,
      enableAutoTuning: true,
      asyncQueueConcurrency: Math.min(this.config.maxWorkers * 2, 20),
      batchMaxSize: 50,
      metricsInterval: 30000,
    });

    this._initializeEventHandlers();
    this._initializePerformanceMonitoring();
  }

  /**
   * Initialize event handlers
   */
  _initializeEventHandlers() {
    this.on('task:created', (task) => {
      this.state.metrics.tasksCreated++;
      this._checkAutoScale();
    });

    this.on('task:completed', (task) => {
      this.state.metrics.tasksCompleted++;
      this._updatePerformanceMetrics();
    });

    this.on('task:failed', (data) => {
      console.warn(`Task failed: ${data.task.id}`, data.error);
      this._handleTaskFailure(data.task, data.error);
    });

    this.on('decision:reached', (decision) => {
      this.state.metrics.decisionsReached++;
    });

    this.on('worker:idle', (workerId) => {
      this._assignNextTask(workerId);
    });

    this.on('error', (error) => {
      console.error('Hive Mind Error:', error);
      this._handleError(error);
    });
  }

  /**
   * Initialize performance monitoring
   */
  _initializePerformanceMonitoring() {
    // Listen to performance optimizer events
    this.performanceOptimizer.on('auto_tune', (data) => {
      console.log(`Performance auto-tuned: ${data.type} = ${data.newValue}`);
      this.emit('performance:auto_tuned', data);
    });

    this.performanceOptimizer.on('error', (error) => {
      console.error('Performance optimizer error:', error);
      this.emit('error', { type: 'performance_optimizer_error', error });
    });

    // Periodic performance reporting
    setInterval(() => {
      const stats = this.performanceOptimizer.getPerformanceStats();
      this.emit('performance:stats', stats);

      // Log performance warnings
      if (parseFloat(stats.asyncQueue.utilization) > 90) {
        console.warn('High async queue utilization:', stats.asyncQueue.utilization + '%');
      }

      if (parseFloat(stats.asyncQueue.successRate) < 95) {
        console.warn('Low async operation success rate:', stats.asyncQueue.successRate + '%');
      }
    }, 60000); // Every minute
  }

  /**
   * Handle task failure with recovery logic
   */
  _handleTaskFailure(task, error) {
    // Update metrics
    this.state.metrics.tasksFailed = (this.state.metrics.tasksFailed || 0) + 1;

    // Attempt task retry for recoverable failures
    if (task.retryCount < 2 && this._isRecoverableError(error)) {
      task.retryCount = (task.retryCount || 0) + 1;
      task.status = 'pending';

      // Find another worker for retry
      setTimeout(() => {
        const worker = this._findBestWorker(task);
        if (worker) {
          this._assignTask(worker.id, task.id);
        }
      }, 5000); // Wait 5 seconds before retry

      console.log(`Retrying task ${task.id} (attempt ${task.retryCount})`);
    }
  }

  /**
   * Check if error is recoverable
   */
  _isRecoverableError(error) {
    const recoverableErrors = ['timeout', 'network', 'temporary', 'connection'];

    return recoverableErrors.some((type) => error.message.toLowerCase().includes(type));
  }

  /**
   * Initialize the hive mind swarm
   */
  async initialize() {
    try {
      this.state.status = 'initializing';

      // Get default registry and hierarchical task manager plugin
      this.defaultRegistry = this.metaRegistryManager.getRegistry('default');
      if (!this.defaultRegistry) {
        throw new Error('Default MetaRegistry not found.');
      }
      this.hierarchicalTaskManagerPlugin = this.defaultRegistry.pluginSystem.getPlugin('hierarchical-task-manager');
      if (!this.hierarchicalTaskManagerPlugin) {
        throw new Error('HierarchicalTaskManagerPlugin not found in MetaRegistry.');
      }

      // Initialize ruv-swarm via mcpWrapper
      await this.mcpWrapper.initialize();

      // Initialize swarm with MCP tools (now directly using ruv-swarm via mcpWrapper)
      const swarmInitResult = await this.mcpWrapper.executeTool('swarm_init', {
        topology: this._determineTopology(),
        maxAgents: this.config.maxWorkers + 1, // +1 for queen
        swarmId: this.config.name,
      });

      this.state.swarmId = swarmInitResult.swarmId;

      // Store initial configuration in memory (via mcpWrapper, which uses ruv-swarm's memory)
      await this.mcpWrapper.executeTool('memory_usage', {
        action: 'store',
        namespace: this.state.swarmId,
        key: 'config',
        value: this.config,
        type: 'system',
      });

      this.state.status = 'ready';
      this.emit('initialized', { swarmId: this.state.swarmId });

      return this.state.swarmId;
    } catch (error) {
      this.state.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Determine optimal topology based on objective
   */
  _determineTopology() {
    // If user explicitly provided topology, use it
    if (this.config.topology) {
      return this.config.topology;
    }
    
    const objective = this.config.objective.toLowerCase();

    // Heuristic topology selection
    if (objective.includes('research') || objective.includes('analysis')) {
      return 'mesh'; // Peer-to-peer for collaborative research
    } else if (objective.includes('build') || objective.includes('develop')) {
      return 'hierarchical'; // Clear command structure for development
    } else if (objective.includes('monitor') || objective.includes('maintain')) {
      return 'ring'; // Circular for continuous monitoring
    } else if (objective.includes('coordinate') || objective.includes('orchestrate')) {
      return 'star'; // Centralized for coordination
    }

    return 'hierarchical'; // Default
  }

  /**
   * Spawn the queen coordinator
   */
  async spawnQueen(queenData) {
    const spawnResult = await this.mcpWrapper.executeTool('agent_spawn', {
      type: 'coordinator',
      name: 'Queen Coordinator',
      swarmId: this.state.swarmId,
      role: 'queen',
      capabilities: ['coordination', 'planning', 'decision-making'],
    });

    this.state.queen = {
      id: queenData.id,
      agentId: spawnResult.agentId,
      type: 'coordinator',
      status: 'active',
      decisions: 0,
      tasks: 0,
    };

    // Store queen info in memory (via mcpWrapper, which uses ruv-swarm's memory)
    await this.mcpWrapper.executeTool('memory_usage', {
      action: 'store',
      namespace: this.state.swarmId,
      key: 'queen',
      value: this.state.queen,
      type: 'system',
    });

    this.emit('queen:spawned', this.state.queen);
    return this.state.queen;
  }

  /**
   * Spawn worker agents with batch optimization
   */
  async spawnWorkers(workerTypes) {
    const startTime = Date.now();

    try {
      // Batch spawn agents in parallel with optimized chunking
      const groupedTypes = this._groupAgentTypes(workerTypes);
      const allResults = [];

      for (const group of groupedTypes) {
        const batch = group.map((type) => ({
          tool: 'agent_spawn',
          params: {
            type,
            swarmId: this.state.swarmId,
            timestamp: Date.now(),
            batchId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          },
        }));

        const groupResults = await this.mcpWrapper.executeParallel(batch);
        allResults.push(...groupResults);

        // Store agent information in memory (via mcpWrapper)
        for (const result of groupResults) {
          if (result && result.agentId && !result.error) {
            await this.mcpWrapper.executeTool('memory_usage', {
              action: 'store',
              namespace: this.state.swarmId,
              key: `agent-${result.agentId}`,
              value: {
                id: result.agentId,
                type: result.type,
                status: result.status || 'active',
                createdAt: Date.now(),
              },
              type: 'agent',
            });
          }
        }
      }

      // Track spawn performance
      const spawnTime = Date.now() - startTime;
      this._trackSpawnPerformance(workerTypes.length, spawnTime);

      // Store worker info in memory (via mcpWrapper)
      await this.mcpWrapper.executeTool('memory_usage', {
        action: 'store',
        namespace: this.state.swarmId,
        key: 'workers',
        value: allResults.map(r => ({ id: r.agentId, type: r.type, status: r.status })),
        type: 'system',
      });

      this.emit('workers:spawned', {
        count: allResults.length,
        batchSize: allResults.length,
        spawnTime: Date.now() - startTime,
        workers: allResults,
      });

      return allResults;
    } catch (error) {
      this.emit('error', {
        type: 'spawn_batch_failed',
        error,
        workerTypes,
        spawnTime: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Create and distribute task with performance optimization
   */
  async createTask(description, priority = 5, metadata = {}) {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 11); // Use substring instead of substr
    const taskId = `task-${timestamp}-${randomPart}`;
    const createdAt = Date.now();

    const task = {
      id: taskId,
      swarmId: this.state.swarmId,
      description,
      priority,
      status: 'pending',
      createdAt: new Date(createdAt).toISOString(),
      assignedTo: null,
      result: null,
      metadata: {
        estimatedDuration: this._estimateTaskDuration(description),
        complexity: this._analyzeTaskComplexity(description),
        ...metadata,
      },
    };

    // Parallel operations: task storage, orchestration, and worker finding
    const [orchestrateResult] = await this.mcpWrapper.executeParallel([
      {
        tool: 'task_orchestrate',
        params: {
          task: description,
          strategy: 'adaptive',
          taskId,
          priority,
          estimatedDuration: task.metadata.estimatedDuration,
        },
      },
    ]);

    task.orchestrationId = orchestrateResult.taskId;

    this.emit('task:created', task);

    // Assign task if worker available (ruv-swarm handles assignment internally)
    console.log(`[HiveMindCore] Task ${taskId} created and orchestrated. RuvSwarm will handle assignment.`);

    return task;
  }

  /**
   * Estimate task duration based on description analysis
   */
  _estimateTaskDuration(description) {
    const words = description.toLowerCase().split(/\s+/);
    const complexityKeywords = {
      simple: ['list', 'show', 'display', 'get', 'read'],
      medium: ['create', 'update', 'modify', 'change', 'build'],
      complex: ['analyze', 'optimize', 'refactor', 'implement', 'design'],
    };

    let score = 1;
    for (const word of words) {
      if (complexityKeywords.complex.includes(word)) score += 3;
      else if (complexityKeywords.medium.includes(word)) score += 2;
      else if (complexityKeywords.simple.includes(word)) score += 1;
    }

    return Math.min(score * 5000, 60000); // Cap at 1 minute
  }

  /**
   * Analyze task complexity
   */
  _analyzeTaskComplexity(description) {
    const words = description.toLowerCase().split(/\s+/);
    const indicators = {
      high: ['optimize', 'refactor', 'architecture', 'design', 'algorithm'],
      medium: ['implement', 'build', 'create', 'develop', 'integrate'],
      low: ['list', 'show', 'get', 'read', 'display'],
    };

    for (const [level, keywords] of Object.entries(indicators)) {
      if (keywords.some((keyword) => words.includes(keyword))) {
        return level;
      }
    }

    return 'medium';
  }

  /**
   * Find best worker for task (optimized async version)
   */
  _findBestWorkerAsync(task) {
    // Ruv-swarm handles worker assignment internally via task orchestration
    console.warn('[HiveMindCore] _findBestWorkerAsync is deprecated. RuvSwarm handles worker assignment.');
    return null;
  }

  /**
   * Synchronous version for backward compatibility
   */
  _findBestWorker(task) {
    // Ruv-swarm handles worker assignment internally via task orchestration
    console.warn('[HiveMindCore] _findBestWorker is deprecated. RuvSwarm handles worker assignment.');
    return null;
  }

  /**
   * Assign task to worker
   */
  async _assignTask(workerId, taskId) {
    // Ruv-swarm handles task assignment internally
    console.warn('[HiveMindCore] _assignTask is deprecated. RuvSwarm handles task assignment.');
  }

  /**
   * Execute task with performance optimization
   */
  _executeTask(workerId, taskId) {
    // Ruv-swarm handles task execution internally
    console.warn('[HiveMindCore] _executeTask is deprecated. RuvSwarm handles task execution.');
  }

  /**
   * Assign next task to idle worker
   */
  _assignNextTask(workerId) {
    // Ruv-swarm handles task assignment internally
    console.warn('[HiveMindCore] _assignNextTask is deprecated. RuvSwarm handles task assignment.');
  }

  /**
   * Build consensus for decision
   */
  async buildConsensus(topic, options) {
    const decision = {
      id: `decision-${Date.now()}`,
      swarmId: this.state.swarmId,
      topic,
      options,
      votes: new Map(),
      algorithm: this.config.consensusAlgorithm,
      status: 'voting',
      createdAt: new Date().toISOString(),
    };

    this.state.decisions.set(decision.id, decision);

    // Simulate voting process
    const workers = Array.from(this.state.workers.values());
    const votes = {};

    // Each worker votes
    workers.forEach((worker) => {
      const vote = options[Math.floor(Math.random() * options.length)];
      votes[worker.id] = vote;
      decision.votes.set(worker.id, vote);
    });

    // Queen gets weighted vote
    const queenVote = options[Math.floor(Math.random() * options.length)];
    votes['queen'] = queenVote;
    decision.votes.set('queen', queenVote);

    // Calculate consensus
    const result = this._calculateConsensus(decision);
    decision.result = result.decision;
    decision.confidence = result.confidence;
    decision.status = 'completed';

    // Convert Map to plain object for proper JSON serialization
    const decisionForStorage = {
      ...decision,
      votes: decision.votes instanceof Map ? Object.fromEntries(decision.votes) : decision.votes,
    };

    // Store decision in memory (via mcpWrapper, which uses ruv-swarm's memory)
    await this.mcpWrapper.executeTool('memory_usage', {
      action: 'store',
      namespace: this.state.swarmId,
      key: `decision-${decision.id}`,
      value: decisionForStorage,
      type: 'consensus',
    });

    this.emit('decision:reached', decision);
    return decision;
  }

  /**
   * Calculate consensus based on algorithm
   */
  _calculateConsensus(decision) {
    const votes = Array.from(decision.votes.values());
    const voteCount = {};

    // Count votes
    votes.forEach((vote) => {
      voteCount[vote] = (voteCount[vote] || 0) + 1;
    });

    switch (decision.algorithm) {
      case 'majority':
        // Simple majority
        const sorted = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
        const winner = sorted[0];
        return {
          decision: winner[0],
          confidence: winner[1] / votes.length,
        };

      case 'weighted':
        // Weight queen vote more heavily
        const queenVote = decision.votes.get('queen');
        voteCount[queenVote] = (voteCount[queenVote] || 0) + 2; // Queen counts as 3 votes

        const weightedSorted = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
        const weightedWinner = weightedSorted[0];
        return {
          decision: weightedWinner[0],
          confidence: weightedWinner[1] / (votes.length + 2),
        };

      case 'byzantine':
        // Requires 2/3 majority
        const byzantineSorted = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
        const byzantineWinner = byzantineSorted[0];
        const byzantineConfidence = byzantineWinner[1] / votes.length;

        if (byzantineConfidence >= 0.67) {
          return {
            decision: byzantineWinner[0],
            confidence: byzantineConfidence,
          };
        } else {
          return {
            decision: 'no_consensus',
            confidence: 0,
          };
        }

      default:
        return {
          decision: 'unknown',
          confidence: 0,
        };
    }
  }

  /**
   * Check if auto-scaling is needed
   */
  async _checkAutoScale() {
    if (!this.config.autoScale) return;

    const pendingTasks = (await this.mcpWrapper.executeTool('swarm_status', { swarmId: this.state.swarmId })).tasks.pending;

    const idleWorkers = (await this.mcpWrapper.executeTool('swarm_status', { swarmId: this.state.swarmId })).agents.idle;

    // Scale up if too many pending tasks
    if (pendingTasks > idleWorkers * 2 && this.state.workers.size < this.config.maxWorkers) {
      const newWorkerType = this._determineWorkerType();
      await this.spawnWorkers([newWorkerType]);
      console.log(`Auto-scaled: Added ${newWorkerType} worker`);
    }

    // Scale down if too many idle workers
    if (idleWorkers > pendingTasks + 2 && this.state.workers.size > 2) {
      // TODO: Implement worker removal
    }
  }

  /**
   * Determine worker type for auto-scaling
   */
  _determineWorkerType() {
    // Analyze pending tasks to determine needed worker type
    const pendingTasks = (await this.mcpWrapper.executeTool('swarm_status', { swarmId: this.state.swarmId })).tasks.pending;

    const typeScores = {};

    // Analyze pending tasks to determine needed worker type (simulated for now)
    // In a real scenario, ruv-swarm's neural capabilities would inform this.
    typeScores.coder = 1; // Default to coder for now

    // Return type with highest score
    const sorted = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'coder'; // Default to coder
  }

  /**
   * Update performance metrics
   */
  async _updatePerformanceMetrics() {
    // Calculate performance metrics
    const completionRate = this.state.metrics.tasksCompleted / this.state.metrics.tasksCreated;
    const avgTasksPerWorker = this.state.metrics.tasksCompleted / this.state.workers.size;

    // Store metrics in memory (via mcpWrapper, which uses ruv-swarm's memory)
    await this.mcpWrapper.executeTool('memory_usage', {
      action: 'store',
      namespace: this.state.swarmId,
      key: 'metrics',
      value: {
        ...this.state.metrics,
        completionRate,
        avgTasksPerWorker,
        timestamp: Date.now(),
      },
      type: 'metrics',
    });

    // Analyze performance if needed
    if (this.state.metrics.tasksCompleted % 10 === 0) {
      await this.mcpWrapper.analyzePerformance(this.state.swarmId);
    }
  }

  /**
   * Handle errors
   */
  _handleError(error) {
    // Log error to memory (via mcpWrapper, which uses ruv-swarm's memory)
    this.mcpWrapper.executeTool('memory_usage', {
      action: 'store',
      namespace: this.state.swarmId,
      key: `error-${Date.now()}`,
      value: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      },
      type: 'error',
    }).catch(console.error);
  }

  /**
   * Get current status with performance metrics
   */
  getStatus() {
    const swarmStatus = await this.mcpWrapper.executeTool('swarm_status', { swarmId: this.state.swarmId });

    return {
      swarmId: this.state.swarmId,
      status: this.state.status,
      queen: this.state.queen,
      workers: swarmStatus.agents.filter(a => a.role === 'worker'), // Filter for workers
      tasks: swarmStatus.tasks,
      metrics: {
        ...this.state.metrics,
        averageTaskTime: swarmStatus.metrics.averageTaskTime,
        workerEfficiency: swarmStatus.metrics.workerEfficiency,
        throughput: swarmStatus.metrics.throughput,
      },
      decisions: swarmStatus.decisions.total,
      performance: this.performanceOptimizer.getPerformanceStats(),
    };
  }

  /**
   * Calculate average task completion time
   */
  _calculateAverageTaskTime(tasks) {
    // Ruv-swarm handles this internally
    console.warn('[HiveMindCore] _calculateAverageTaskTime is deprecated. RuvSwarm handles this.');
    return 0;
  }

  /**
   * Calculate worker efficiency
   */
  _calculateWorkerEfficiency(workers) {
    // Ruv-swarm handles this internally
    console.warn('[HiveMindCore] _calculateWorkerEfficiency is deprecated. RuvSwarm handles this.');
    return 0;
  }

  /**
   * Calculate system throughput (tasks per minute)
   */
  _calculateThroughput(tasks) {
    // Ruv-swarm handles this internally
    console.warn('[HiveMindCore] _calculateThroughput is deprecated. RuvSwarm handles this.');
    return 0;
  }

  /**
   * Shutdown hive mind with cleanup
   */
  async shutdown() {
    this.state.status = 'shutting_down';

    try {
      // Generate final performance report
      const performanceReport = this.performanceOptimizer.generatePerformanceReport();

      // Save final state and performance report (via mcpWrapper, which uses ruv-swarm's memory)
      await this.mcpWrapper.executeTool('memory_usage', {
        action: 'store',
        namespace: this.state.swarmId,
        key: 'final_state',
        value: this.getStatus(),
        type: 'system',
      });
      await this.mcpWrapper.executeTool('memory_usage', {
        action: 'store',
        namespace: this.state.swarmId,
        key: 'final_performance_report',
        value: performanceReport,
        type: 'metrics',
      });

      // Close performance optimizer
      await this.performanceOptimizer.close();

      // Destroy swarm (via mcpWrapper, which uses ruv-swarm's destroySwarm)
      await this.mcpWrapper.executeTool('swarm_destroy', { swarmId: this.state.swarmId });

      this.state.status = 'shutdown';
      this.emit('shutdown', { performanceReport });
    } catch (error) {
      this.emit('error', { type: 'shutdown_failed', error });
      throw error;
    }
  }

  /**
   * Get performance insights and recommendations
   */
  getPerformanceInsights() {
    return this.performanceOptimizer.generatePerformanceReport();
  }
}
