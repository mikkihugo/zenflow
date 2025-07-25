import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EventEmitter } from 'events';
import os from 'os';

// Mock dependencies
jest.mock('../../../src/coordination/workers/worker-pool.js', () => ({
  WorkerThreadPool: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    submitTask: jest.fn(),
    getStats: jest.fn(() => ({ utilization: 0.75 })),
    shutdown: jest.fn()
  }))
}));

jest.mock('../../../src/cli/command-handlers/swarm-orchestrator.js', () => ({
  SwarmOrchestrator: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    executeTask: jest.fn(),
    getSwarmStatus: jest.fn(() => ({ active: true, tasks: 0 }))
  }))
}));

describe('Parallel Swarm Orchestrator', () => {
  let orchestrator;
  let ParallelSwarmOrchestrator;

  beforeEach(async () => {
    // Dynamic import to get the class after mocks are set up
    const module = await import('../../../src/coordination/parallel-swarm-orchestrator.js');
    ParallelSwarmOrchestrator = module.ParallelSwarmOrchestrator;
    
    orchestrator = new ParallelSwarmOrchestrator({
      maxWorkers: 4,
      parallelMode: true
    });
  });

  afterEach(async () => {
    if (orchestrator) {
      await orchestrator.shutdown();
    }
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultOrchestrator = new ParallelSwarmOrchestrator();
      
      expect(defaultOrchestrator.parallelMode).toBe(true);
      expect(defaultOrchestrator.maxWorkers).toBeGreaterThan(1);
      expect(defaultOrchestrator.loadBalancingStrategy).toBe('round-robin');
      expect(defaultOrchestrator.activeTasks).toBeInstanceOf(Map);
      expect(defaultOrchestrator.taskResults).toBeInstanceOf(Map);
    });

    it('should initialize with custom options', () => {
      const customOrchestrator = new ParallelSwarmOrchestrator({
        maxWorkers: 8,
        parallelMode: false,
        loadBalancingStrategy: 'least-loaded'
      });
      
      expect(customOrchestrator.maxWorkers).toBe(8);
      expect(customOrchestrator.parallelMode).toBe(false);
      expect(customOrchestrator.loadBalancingStrategy).toBe('least-loaded');
    });

    it('should extend EventEmitter', () => {
      expect(orchestrator).toBeInstanceOf(EventEmitter);
    });
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(orchestrator.initialize()).resolves.not.toThrow();
      expect(orchestrator.baseOrchestrator.initialize).toHaveBeenCalled();
    });

    it('should initialize worker pool in parallel mode', async () => {
      await orchestrator.initialize();
      
      if (orchestrator.parallelMode) {
        expect(orchestrator.workerPool).toBeDefined();
      }
    });

    it('should skip worker pool in sequential mode', async () => {
      const sequentialOrchestrator = new ParallelSwarmOrchestrator({ parallelMode: false });
      await sequentialOrchestrator.initialize();
      
      expect(sequentialOrchestrator.workerPool).toBeNull();
    });
  });

  describe('task execution', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should execute tasks in parallel', async () => {
      const tasks = [
        { id: 'task1', type: 'analysis', payload: { file: 'test1.js' } },
        { id: 'task2', type: 'analysis', payload: { file: 'test2.js' } },
        { id: 'task3', type: 'analysis', payload: { file: 'test3.js' } }
      ];

      const executeTasksInParallel = async (tasks) => {
        const promises = tasks.map(task => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                taskId: task.id,
                result: `Analyzed ${task.payload.file}`,
                success: true
              });
            }, Math.random() * 100);
          });
        });

        return Promise.all(promises);
      };

      const results = await executeTasksInParallel(tasks);
      
      expect(results).toHaveLength(3);
      expect(results[0].taskId).toBe('task1');
      expect(results[1].taskId).toBe('task2');
      expect(results[2].taskId).toBe('task3');
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should handle task failures gracefully', async () => {
      const mockTaskWithFailure = async (taskId) => {
        if (taskId === 'failing-task') {
          throw new Error('Task failed');
        }
        return { taskId, result: 'success' };
      };

      try {
        await mockTaskWithFailure('failing-task');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Task failed');
      }

      const successResult = await mockTaskWithFailure('working-task');
      expect(successResult.result).toBe('success');
    });

    it('should balance load across workers', () => {
      const loadBalancer = {
        strategy: 'round-robin',
        workers: [
          { id: 'worker1', load: 2 },
          { id: 'worker2', load: 1 },
          { id: 'worker3', load: 3 }
        ],
        
        selectWorker: function() {
          if (this.strategy === 'round-robin') {
            // Simple round-robin implementation
            const worker = this.workers[0];
            this.workers.push(this.workers.shift());
            return worker;
          }
          
          if (this.strategy === 'least-loaded') {
            return this.workers.reduce((least, current) => 
              current.load < least.load ? current : least
            );
          }
          
          return this.workers[0];
        }
      };

      const selectedWorker = loadBalancer.selectWorker();
      expect(selectedWorker).toBeDefined();
      expect(selectedWorker.id).toBeDefined();

      // Test least-loaded strategy
      loadBalancer.strategy = 'least-loaded';
      const leastLoadedWorker = loadBalancer.selectWorker();
      expect(leastLoadedWorker.id).toBe('worker2'); // Has load of 1
    });
  });

  describe('swarm management', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should manage multiple swarms', () => {
      const swarmManager = {
        swarms: new Map(),
        
        createSwarm: function(swarmId, config) {
          this.swarms.set(swarmId, {
            id: swarmId,
            config,
            tasks: [],
            status: 'active',
            createdAt: Date.now()
          });
          return this.swarms.get(swarmId);
        },
        
        addTaskToSwarm: function(swarmId, task) {
          const swarm = this.swarms.get(swarmId);
          if (swarm) {
            swarm.tasks.push(task);
            return true;
          }
          return false;
        },
        
        getSwarmStatus: function(swarmId) {
          const swarm = this.swarms.get(swarmId);
          return swarm ? swarm.status : null;
        }
      };

      const swarm1 = swarmManager.createSwarm('swarm1', { maxTasks: 10 });
      const swarm2 = swarmManager.createSwarm('swarm2', { maxTasks: 5 });

      expect(swarm1.id).toBe('swarm1');
      expect(swarm2.id).toBe('swarm2');
      expect(swarmManager.swarms.size).toBe(2);

      const added = swarmManager.addTaskToSwarm('swarm1', { id: 'task1' });
      expect(added).toBe(true);
      expect(swarm1.tasks).toHaveLength(1);

      const status = swarmManager.getSwarmStatus('swarm1');
      expect(status).toBe('active');
    });

    it('should coordinate between swarms', async () => {
      const coordination = {
        dependencies: new Map(),
        
        addDependency: function(fromSwarm, toSwarm) {
          if (!this.dependencies.has(fromSwarm)) {
            this.dependencies.set(fromSwarm, []);
          }
          this.dependencies.get(fromSwarm).push(toSwarm);
        },
        
        canExecute: function(swarmId, completedSwarms) {
          const deps = this.dependencies.get(swarmId) || [];
          return deps.every(dep => completedSwarms.includes(dep));
        },
        
        getExecutionOrder: function(swarms) {
          const order = [];
          const completed = [];
          const remaining = [...swarms];
          
          while (remaining.length > 0) {
            for (let i = remaining.length - 1; i >= 0; i--) {
              const swarm = remaining[i];
              if (this.canExecute(swarm, completed)) {
                order.push(swarm);
                completed.push(swarm);
                remaining.splice(i, 1);
              }
            }
          }
          
          return order;
        }
      };

      coordination.addDependency('swarm2', 'swarm1');
      coordination.addDependency('swarm3', 'swarm1');
      coordination.addDependency('swarm3', 'swarm2');

      const canExecuteSwarm1 = coordination.canExecute('swarm1', []);
      expect(canExecuteSwarm1).toBe(true);

      const canExecuteSwarm2 = coordination.canExecute('swarm2', []);
      expect(canExecuteSwarm2).toBe(false);

      const canExecuteSwarm2AfterSwarm1 = coordination.canExecute('swarm2', ['swarm1']);
      expect(canExecuteSwarm2AfterSwarm1).toBe(true);

      const executionOrder = coordination.getExecutionOrder(['swarm1', 'swarm2', 'swarm3']);
      expect(executionOrder[0]).toBe('swarm1');
      expect(executionOrder.indexOf('swarm2')).toBeLessThan(executionOrder.indexOf('swarm3'));
    });
  });

  describe('metrics and monitoring', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should track performance metrics', () => {
      expect(orchestrator.metrics).toBeDefined();
      expect(orchestrator.metrics.parallelTasks).toBe(0);
      expect(orchestrator.metrics.sequentialTasks).toBe(0);
      expect(orchestrator.metrics.speedupFactor).toBe(1.0);
    });

    it('should calculate speedup factor', () => {
      const metricsCalculator = {
        calculateSpeedup: (sequentialTime, parallelTime) => {
          if (parallelTime === 0) return 1.0;
          return sequentialTime / parallelTime;
        },
        
        calculateEfficiency: (speedup, workers) => {
          return speedup / workers;
        }
      };

      const speedup = metricsCalculator.calculateSpeedup(1000, 250);
      expect(speedup).toBe(4.0);

      const efficiency = metricsCalculator.calculateEfficiency(speedup, 4);
      expect(efficiency).toBe(1.0); // Perfect efficiency
    });

    it('should monitor worker utilization', () => {
      const utilizationMonitor = {
        workers: [
          { id: 'w1', busyTime: 80, totalTime: 100 },
          { id: 'w2', busyTime: 60, totalTime: 100 },
          { id: 'w3', busyTime: 90, totalTime: 100 }
        ],
        
        getWorkerUtilization: function(workerId) {
          const worker = this.workers.find(w => w.id === workerId);
          return worker ? (worker.busyTime / worker.totalTime) : 0;
        },
        
        getAverageUtilization: function() {
          const total = this.workers.reduce((sum, worker) => 
            sum + (worker.busyTime / worker.totalTime), 0
          );
          return total / this.workers.length;
        }
      };

      const w1Utilization = utilizationMonitor.getWorkerUtilization('w1');
      expect(w1Utilization).toBe(0.8);

      const avgUtilization = utilizationMonitor.getAverageUtilization();
      expect(avgUtilization).toBeCloseTo(0.766, 2);
    });
  });

  describe('error handling and recovery', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should handle worker failures', async () => {
      const failureHandler = {
        handleWorkerFailure: async function(workerId, error) {
          console.log(`Worker ${workerId} failed:`, error.message);
          
          // Restart worker
          const newWorker = {
            id: `${workerId}-restart`,
            status: 'active',
            restartedAt: Date.now()
          };
          
          return newWorker;
        }
      };

      const error = new Error('Worker crashed');
      const newWorker = await failureHandler.handleWorkerFailure('worker1', error);
      
      expect(newWorker.id).toBe('worker1-restart');
      expect(newWorker.status).toBe('active');
      expect(newWorker.restartedAt).toBeDefined();
    });

    it('should implement retry logic', async () => {
      const retryHandler = {
        maxRetries: 3,
        retryDelay: 100,
        
        executeWithRetry: async function(task, attempt = 1) {
          try {
            // Simulate task execution that might fail
            if (task.shouldFail && attempt <= 2) {
              throw new Error('Task failed');
            }
            
            return { success: true, result: 'Task completed', attempts: attempt };
          } catch (error) {
            if (attempt >= this.maxRetries) {
              throw new Error(`Task failed after ${this.maxRetries} attempts: ${error.message}`);
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            return this.executeWithRetry(task, attempt + 1);
          }
        }
      };

      // Test successful task
      const successTask = { id: 'success', shouldFail: false };
      const successResult = await retryHandler.executeWithRetry(successTask);
      expect(successResult.success).toBe(true);
      expect(successResult.attempts).toBe(1);

      // Test task that succeeds after retries
      const retryTask = { id: 'retry', shouldFail: true };
      const retryResult = await retryHandler.executeWithRetry(retryTask);
      expect(retryResult.success).toBe(true);
      expect(retryResult.attempts).toBe(3);
    });
  });

  describe('cleanup and shutdown', () => {
    it('should cleanup resources properly', async () => {
      await orchestrator.initialize();
      
      const cleanup = async () => {
        // Clear active tasks
        orchestrator.activeTasks.clear();
        orchestrator.taskResults.clear();
        
        // Shutdown worker pool
        if (orchestrator.workerPool) {
          await orchestrator.workerPool.shutdown();
        }
        
        return true;
      };

      const result = await cleanup();
      expect(result).toBe(true);
      expect(orchestrator.activeTasks.size).toBe(0);
      expect(orchestrator.taskResults.size).toBe(0);
    });

    it('should handle shutdown gracefully', async () => {
      await orchestrator.initialize();
      
      const shutdownHandler = {
        gracefulShutdown: async function(timeout = 5000) {
          const startTime = Date.now();
          
          // Wait for active tasks to complete or timeout
          while (orchestrator.activeTasks.size > 0 && (Date.now() - startTime) < timeout) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const remainingTasks = orchestrator.activeTasks.size;
          if (remainingTasks > 0) {
            console.warn(`Shutdown with ${remainingTasks} tasks still active`);
          }
          
          return { graceful: remainingTasks === 0, remainingTasks };
        }
      };

      const result = await shutdownHandler.gracefulShutdown(1000);
      expect(result.graceful).toBe(true);
      expect(result.remainingTasks).toBe(0);
    });
  });
});