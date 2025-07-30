/**
 * WorkerThreadPool - Manages a pool of worker threads for parallel swarm execution
 */

import { EventEmitter } from 'node:events';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WorkerThreadPool extends EventEmitter {
  constructor(options = {}): any {
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
      strategy = {tasksCompleted = 0; i < this.minWorkers; i++) 
      await this.createWorker();

    // Start monitoring worker health
    this.startHealthMonitoring();
    
    console.warn(`✅ Worker thread pool initialized with ${this.workers.size} workers`);
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
      const _worker = new Worker(this.workerScript, {
        workerData => {
      this.handleWorkerMessage(workerId, message);
    }
    )

    worker.on('error', (error) => 
      console.error(`Worker $workerIderror => {
      if(code !== 0) {
        console.error(`Worker ${workerId} exited with code ${code}`);
      this.handleWorkerExit(workerId, code);
  }
  )

  worker;
  .
  on('messageerror', (error)
  => 
  console;
  .
  error(`Worker $workerIdmessageerror = message;

  switch(_type) {
    case 'task-completed':
        this.handleTaskCompleted(workerId, taskId, result)
    break;
    case 'task-error':
        this.handleTaskError(workerId, taskId, error)
    break;
    case 'worker-ready': {
        this.updateWorkerStats(workerId,
    {
      status = this.workerStats.get(workerId);
      const executionTime = Date.now() - stats.currentTask?.startTime || 0;

      // Update worker stats
      this.updateWorkerStats(workerId, {status = executionTime;
      this.metrics.averageTaskTime = this.metrics.totalExecutionTime / this.metrics.tasksCompleted;

      console.warn(`✅ Task ${taskId} completed by worker ${workerId} in ${executionTime}ms`);

      this.emit('task-completed', { workerId, taskId, result, executionTime });
      this.processNextTask();
    }
    }

    /**
     * Handle task error
     */
    handleTaskError(workerId, taskId, error);
    : any
    {
      const _stats = this.workerStats.get(workerId);

      this.updateWorkerStats(workerId, {status = this.workerStats.get(workerId);
      this.updateWorkerStats(workerId, {status = > this.restartWorker(workerId), 1000);
    }

  /**
   * Handle worker exit
   */
  handleWorkerExit(workerId, _code): any 
    this.workers.delete(workerId);
    this.workerStats.delete(workerId);
    this.metrics.workerUtilization.delete(workerId);

    console.warn(`🔄 Worker ${workerId} exited`);

    // Restart worker if needed and not shutting down
    if (!this.isShuttingDown && this.workers.size < this.minWorkers) {
      setTimeout(() => this.createWorker(), 1000);
    }

  /**
   * Update worker statistics
   */
  updateWorkerStats(workerId, updates): any {
    const current = this.workerStats.get(workerId);
    if (current) {
      this.workerStats.set(workerId, { ...current, ...updates });
    }
  }

  /**
   * Execute a task using worker threads
   */
  async executeTask(_task): any {
    return new Promise((_resolve, _reject) => {
      const _taskId = `task-${++this.taskCounter}`;

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
      .filter(([_workerId, stats]) => stats.status === 'idle')
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
      default = idleWorkers[this.loadBalancer.roundRobinIndex % idleWorkers.length];
    this.loadBalancer.roundRobinIndex++;
    return worker;
    }

    /**
     * Select least busy worker
     */
    selectLeastBusy(idleWorkers);
    : any
    return idleWorkers.reduce((leastBusy, workerId) => {
      const stats = this.workerStats.get(workerId);
      const leastBusyStats = this.workerStats.get(leastBusy);
      
      return stats.tasksCompleted < leastBusyStats.tasksCompleted ? workerId => {
      const stats = this.workerStats.get(workerId);
      const bestStats = this.workerStats.get(best);
      
      // Select worker with best average task time and fewer errors
      const workerScore = (stats.averageTaskTime || Infinity) + (stats.errors * 1000);
      const bestScore = (bestStats.averageTaskTime || Infinity) + (bestStats.errors * 1000);
      
      return workerScore < bestScore ?workerId = this.workers.get(workerId);
    if(!worker) {
      task.reject(new Error(`Worker ${workerId} not found`));
      return;
    }

    // Update worker stats
    this.updateWorkerStats(workerId, {status = (data) => {
      if(data.taskId === task.id) {
        this.off('task-completed', onCompleted);
        this.off('task-error', onError);
        task.resolve(data.result);
      }
    };

    const onError = (data) => {
      if(data.taskId === task.id) {
        this.off('task-completed', onCompleted);
        this.off('task-error', onError);
        task.reject(new Error(data.error));
      }
    };

    this.on('task-completed', onCompleted);
    this.on('task-error', onError);

    // Send task to worker
    worker.postMessage({type = this.workers.get(workerId);
      if(worker) {
        worker.terminate();
        this.workers.delete(workerId);
      }
      
      await this.createWorker();
      console.warn(`🔄 Worker ${workerId} restarted`);
    } catch(error) 
      console.error(`Failed to restart worker $workerId:`, error);
  }

  /**
   * Start health monitoring for workers
   */
  startHealthMonitoring() {
    setInterval(() => {
      if (this._isShuttingDown) return;

    for (const [workerId, stats] of this.workerStats.entries()) {
      // Check for stuck tasks with configurable timeout
      const taskTimeout = stats.currentTask.timeout || this.defaultTaskTimeout || 60000; // Default 1 minute
      if (stats.currentTask && Date.now() - stats.currentTask.startTime > taskTimeout) {
        console.warn(`⚠️ Worker ${workerId} appears stuck on task ${stats.currentTask.id}`);
        this.restartWorker(workerId);
      }
    }
    , 30000) // Check every 30 seconds
  }

  /**
   * Get pool status and metrics
   */
  getStatus() {
    const workers = Array.from(this.workerStats.values());

    return {workers = > w.status === 'idle').length,busy = > w.status === 'busy').length,error = > w.status === 'error').length
      },queue = true;

    // Clear task queue
    this.taskQueue.forEach((task) => {
      task.reject(new Error('Worker pool shutting down'));
    });
    this.taskQueue = [];

    // Terminate all workers
    const _terminationPromises = Array.from(this.workers.values()).map((worker) => {
      return new Promise((resolve) => {
        worker.on('exit', resolve);
        worker.postMessage({ type => {
          worker.terminate();
        resolve();
      }, 5000); // Force terminate after 5 seconds
    });
  }
  )

  await;
  Promise;
  .
  all(terminationPromises);

  this;
  .
  workers;
  .
  clear();
  this;
  .
  workerStats;
  .
  clear();
  this;
  .
  metrics;
  .
  workerUtilization;
  .
  clear();

  console;
  .
  warn('✅ Worker thread pool shutdown complete');
}
}
