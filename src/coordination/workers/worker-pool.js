/**
 * WorkerThreadPool - Manages a pool of worker threads for parallel swarm execution
 */

import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WorkerThreadPool extends EventEmitter {
  constructor(options = {}) {
    super();
    this.maxWorkers = options.maxWorkers || Math.max(2, Math.floor(os.cpus().length / 2));
    this.minWorkers = options.minWorkers || 1;
    this.workerScript = options.workerScript || path.join(__dirname, 'swarm-worker.js');
    this.taskQueue = [];
    this.workers = new Map();
    this.workerStats = new Map();
    this.isShuttingDown = false;
    this.taskCounter = 0;
    
    // Load balancing configuration
    this.loadBalancer = {
      strategy: options.loadBalancingStrategy || 'round-robin', // round-robin, least-busy, performance-based
      roundRobinIndex: 0
    };

    // Performance tracking
    this.metrics = {
      tasksCompleted: 0,
      tasksQueued: 0,
      totalExecutionTime: 0,
      averageTaskTime: 0,
      workerUtilization: new Map()
    };
  }

  /**
   * Initialize the worker pool
   */
  async initialize() {
    console.log(`🧵 Initializing worker thread pool with ${this.maxWorkers} max workers`);
    
    // Start with minimum number of workers
    for (let i = 0; i < this.minWorkers; i++) {
      await this.createWorker();
    }

    // Start monitoring worker health
    this.startHealthMonitoring();
    
    console.log(`✅ Worker thread pool initialized with ${this.workers.size} workers`);
    return this;
  }

  /**
   * Create a new worker thread
   */
  async createWorker() {
    if (this.workers.size >= this.maxWorkers) {
      throw new Error('Maximum worker limit reached');
    }

    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    try {
      const worker = new Worker(this.workerScript, {
        workerData: { workerId }
      });

      // Set up worker event handlers
      this.setupWorkerEventHandlers(worker, workerId);

      // Initialize worker stats
      this.workerStats.set(workerId, {
        id: workerId,
        status: 'idle',
        tasksCompleted: 0,
        currentTask: null,
        startTime: Date.now(),
        lastTaskTime: null,
        averageTaskTime: 0,
        errors: 0
      });

      this.workers.set(workerId, worker);
      this.metrics.workerUtilization.set(workerId, 0);

      console.log(`🤖 Worker created: ${workerId}`);
      return workerId;
    } catch (error) {
      console.error(`Failed to create worker: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set up event handlers for a worker
   */
  setupWorkerEventHandlers(worker, workerId) {
    worker.on('message', (message) => {
      this.handleWorkerMessage(workerId, message);
    });

    worker.on('error', (error) => {
      console.error(`Worker ${workerId} error:`, error);
      this.handleWorkerError(workerId, error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${workerId} exited with code ${code}`);
      }
      this.handleWorkerExit(workerId, code);
    });

    worker.on('messageerror', (error) => {
      console.error(`Worker ${workerId} message error:`, error);
      this.updateWorkerStats(workerId, { errors: this.workerStats.get(workerId).errors + 1 });
    });
  }

  /**
   * Handle messages from workers
   */
  handleWorkerMessage(workerId, message) {
    const { type, taskId, result, error, data } = message;

    switch (type) {
      case 'task-completed':
        this.handleTaskCompleted(workerId, taskId, result);
        break;
      case 'task-error':
        this.handleTaskError(workerId, taskId, error);
        break;
      case 'worker-ready':
        this.updateWorkerStats(workerId, { status: 'idle' });
        this.processNextTask();
        break;
      case 'progress-update':
        this.emit('task-progress', { workerId, taskId, progress: data });
        break;
      default:
        console.warn(`Unknown message type from worker ${workerId}:`, type);
    }
  }

  /**
   * Handle task completion
   */
  handleTaskCompleted(workerId, taskId, result) {
    const stats = this.workerStats.get(workerId);
    const executionTime = Date.now() - stats.currentTask?.startTime || 0;

    // Update worker stats
    this.updateWorkerStats(workerId, {
      status: 'idle',
      tasksCompleted: stats.tasksCompleted + 1,
      currentTask: null,
      lastTaskTime: executionTime,
      averageTaskTime: (stats.averageTaskTime * stats.tasksCompleted + executionTime) / (stats.tasksCompleted + 1)
    });

    // Update pool metrics
    this.metrics.tasksCompleted++;
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageTaskTime = this.metrics.totalExecutionTime / this.metrics.tasksCompleted;

    console.log(`✅ Task ${taskId} completed by worker ${workerId} in ${executionTime}ms`);
    
    this.emit('task-completed', { workerId, taskId, result, executionTime });
    this.processNextTask();
  }

  /**
   * Handle task error
   */
  handleTaskError(workerId, taskId, error) {
    const stats = this.workerStats.get(workerId);
    
    this.updateWorkerStats(workerId, {
      status: 'idle',
      currentTask: null,
      errors: stats.errors + 1
    });

    console.error(`❌ Task ${taskId} failed in worker ${workerId}:`, error);
    
    this.emit('task-error', { workerId, taskId, error });
    this.processNextTask();
  }

  /**
   * Handle worker errors
   */
  handleWorkerError(workerId, error) {
    const stats = this.workerStats.get(workerId);
    this.updateWorkerStats(workerId, { 
      status: 'error',
      errors: stats.errors + 1 
    });
    
    this.emit('worker-error', { workerId, error });
    
    // Attempt to restart worker if not shutting down
    if (!this.isShuttingDown) {
      setTimeout(() => this.restartWorker(workerId), 1000);
    }
  }

  /**
   * Handle worker exit
   */
  handleWorkerExit(workerId, code) {
    this.workers.delete(workerId);
    this.workerStats.delete(workerId);
    this.metrics.workerUtilization.delete(workerId);
    
    console.log(`🔄 Worker ${workerId} exited`);
    
    // Restart worker if needed and not shutting down
    if (!this.isShuttingDown && this.workers.size < this.minWorkers) {
      setTimeout(() => this.createWorker(), 1000);
    }
  }

  /**
   * Update worker statistics
   */
  updateWorkerStats(workerId, updates) {
    const current = this.workerStats.get(workerId);
    if (current) {
      this.workerStats.set(workerId, { ...current, ...updates });
    }
  }

  /**
   * Execute a task using worker threads
   */
  async executeTask(task) {
    return new Promise((resolve, reject) => {
      const taskId = `task-${++this.taskCounter}`;
      const taskData = {
        id: taskId,
        ...task,
        createdAt: Date.now()
      };

      // Add task to queue
      this.taskQueue.push({
        ...taskData,
        resolve,
        reject
      });

      this.metrics.tasksQueued++;
      
      // Try to process immediately
      this.processNextTask();
    });
  }

  /**
   * Process next task in queue
   */
  processNextTask() {
    if (this.taskQueue.length === 0) {
      return;
    }

    const availableWorker = this.selectAvailableWorker();
    if (!availableWorker) {
      // Try to scale up if we have capacity
      if (this.workers.size < this.maxWorkers) {
        this.createWorker().then(() => this.processNextTask());
      }
      return;
    }

    const task = this.taskQueue.shift();
    this.metrics.tasksQueued--;
    
    this.assignTaskToWorker(availableWorker, task);
  }

  /**
   * Select an available worker using load balancing strategy
   */
  selectAvailableWorker() {
    const idleWorkers = Array.from(this.workerStats.entries())
      .filter(([workerId, stats]) => stats.status === 'idle')
      .map(([workerId]) => workerId);

    if (idleWorkers.length === 0) {
      return null;
    }

    switch (this.loadBalancer.strategy) {
      case 'round-robin':
        return this.selectRoundRobin(idleWorkers);
      case 'least-busy':
        return this.selectLeastBusy(idleWorkers);
      case 'performance-based':
        return this.selectPerformanceBased(idleWorkers);
      default:
        return idleWorkers[0];
    }
  }

  /**
   * Round-robin worker selection
   */
  selectRoundRobin(idleWorkers) {
    const worker = idleWorkers[this.loadBalancer.roundRobinIndex % idleWorkers.length];
    this.loadBalancer.roundRobinIndex++;
    return worker;
  }

  /**
   * Select least busy worker
   */
  selectLeastBusy(idleWorkers) {
    return idleWorkers.reduce((leastBusy, workerId) => {
      const stats = this.workerStats.get(workerId);
      const leastBusyStats = this.workerStats.get(leastBusy);
      
      return stats.tasksCompleted < leastBusyStats.tasksCompleted ? workerId : leastBusy;
    });
  }

  /**
   * Select worker based on performance metrics
   */
  selectPerformanceBased(idleWorkers) {
    return idleWorkers.reduce((best, workerId) => {
      const stats = this.workerStats.get(workerId);
      const bestStats = this.workerStats.get(best);
      
      // Select worker with best average task time and fewer errors
      const workerScore = (stats.averageTaskTime || Infinity) + (stats.errors * 1000);
      const bestScore = (bestStats.averageTaskTime || Infinity) + (bestStats.errors * 1000);
      
      return workerScore < bestScore ? workerId : best;
    });
  }

  /**
   * Assign task to a specific worker
   */
  assignTaskToWorker(workerId, task) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      task.reject(new Error(`Worker ${workerId} not found`));
      return;
    }

    // Update worker stats
    this.updateWorkerStats(workerId, {
      status: 'busy',
      currentTask: {
        id: task.id,
        startTime: Date.now()
      }
    });

    // Set up task completion handlers
    const onCompleted = (data) => {
      if (data.taskId === task.id) {
        this.off('task-completed', onCompleted);
        this.off('task-error', onError);
        task.resolve(data.result);
      }
    };

    const onError = (data) => {
      if (data.taskId === task.id) {
        this.off('task-completed', onCompleted);
        this.off('task-error', onError);
        task.reject(new Error(data.error));
      }
    };

    this.on('task-completed', onCompleted);
    this.on('task-error', onError);

    // Send task to worker
    worker.postMessage({
      type: 'execute-task',
      task: {
        id: task.id,
        type: task.type,
        data: task.data,
        options: task.options
      }
    });

    console.log(`📤 Task ${task.id} assigned to worker ${workerId}`);
  }

  /**
   * Restart a failed worker
   */
  async restartWorker(workerId) {
    try {
      const worker = this.workers.get(workerId);
      if (worker) {
        worker.terminate();
        this.workers.delete(workerId);
      }
      
      await this.createWorker();
      console.log(`🔄 Worker ${workerId} restarted`);
    } catch (error) {
      console.error(`Failed to restart worker ${workerId}:`, error);
    }
  }

  /**
   * Start health monitoring for workers
   */
  startHealthMonitoring() {
    setInterval(() => {
      if (this.isShuttingDown) return;
      
      for (const [workerId, stats] of this.workerStats.entries()) {
        // Check for stuck tasks with configurable timeout
        const taskTimeout = stats.currentTask.timeout || this.defaultTaskTimeout || 60000; // Default 1 minute
        if (stats.currentTask && Date.now() - stats.currentTask.startTime > taskTimeout) {
          console.warn(`⚠️ Worker ${workerId} appears stuck on task ${stats.currentTask.id}`);
          this.restartWorker(workerId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get pool status and metrics
   */
  getStatus() {
    const workers = Array.from(this.workerStats.values());
    
    return {
      workers: {
        total: this.workers.size,
        idle: workers.filter(w => w.status === 'idle').length,
        busy: workers.filter(w => w.status === 'busy').length,
        error: workers.filter(w => w.status === 'error').length
      },
      queue: {
        pending: this.taskQueue.length
      },
      metrics: {
        ...this.metrics,
        workerStats: Object.fromEntries(this.workerStats)
      },
      loadBalancer: this.loadBalancer
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown() {
    console.log('🔄 Shutting down worker thread pool...');
    this.isShuttingDown = true;

    // Clear task queue
    this.taskQueue.forEach(task => {
      task.reject(new Error('Worker pool shutting down'));
    });
    this.taskQueue = [];

    // Terminate all workers
    const terminationPromises = Array.from(this.workers.values()).map(worker => {
      return new Promise((resolve) => {
        worker.on('exit', resolve);
        worker.postMessage({ type: 'shutdown' });
        setTimeout(() => {
          worker.terminate();
          resolve();
        }, 5000); // Force terminate after 5 seconds
      });
    });

    await Promise.all(terminationPromises);
    
    this.workers.clear();
    this.workerStats.clear();
    this.metrics.workerUtilization.clear();
    
    console.log('✅ Worker thread pool shutdown complete');
  }
}