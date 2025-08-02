/**
 * Swarm Coordination Performance Benchmarks
 * Comprehensive performance testing for swarm operations
 */

import { SwarmCoordinator } from '../../coordination/swarm/core/swarm-coordinator';
import { AgentManager } from '../../coordination/agents/agent-manager';
import { TaskOrchestrator } from '../../coordination/orchestrator';
import { PerformanceMeasurement } from '../helpers/performance-measurement';
import { CoordinationTestHelpers } from '../helpers/coordination-test-helpers';

describe('Swarm Coordination Performance Benchmarks', () => {
  let swarmCoordinator: SwarmCoordinator;
  let agentManager: AgentManager;
  let taskOrchestrator: TaskOrchestrator;
  let performance: PerformanceMeasurement;
  let testHelpers: CoordinationTestHelpers;
  
  const PERFORMANCE_TARGETS = {
    swarmInitialization: 2000, // 2 seconds
    agentSpawning: 500, // 500ms per agent
    taskDistribution: 1000, // 1 second for 100 tasks
    messageLatency: 50, // 50ms max
    throughput: 1000, // 1000 operations per second
    memoryUsage: 100 * 1024 * 1024 // 100MB max
  };

  beforeAll(async () => {
    performance = new PerformanceMeasurement();
    testHelpers = new CoordinationTestHelpers();
    
    await testHelpers.initializePerformanceEnvironment();
  });

  beforeEach(async () => {
    swarmCoordinator = new SwarmCoordinator({
      maxAgents: 100,
      topology: 'mesh',
      enableMetrics: true
    });
    
    agentManager = new AgentManager({
      poolSize: 50,
      autoScaling: true,
      performanceTracking: true
    });
    
    taskOrchestrator = new TaskOrchestrator({
      maxConcurrentTasks: 200,
      loadBalancing: true,
      queueOptimization: true
    });
  });

  afterEach(async () => {
    await swarmCoordinator.shutdown();
    await agentManager.cleanup();
    await taskOrchestrator.stop();
  });

  describe('Swarm Initialization Performance', () => {
    it('should initialize large swarms within performance targets', async () => {
      const swarmSizes = [10, 25, 50, 100];
      const initializationTimes: number[] = [];
      
      for (const size of swarmSizes) {
        performance.start(`swarm-init-${size}`);
        
        await swarmCoordinator.initializeSwarm({
          topology: 'mesh',
          agentCount: size,
          enableOptimizations: true
        });
        
        performance.end(`swarm-init-${size}`);
        
        const initTime = performance.getDuration(`swarm-init-${size}`);
        initializationTimes.push(initTime);
        
        // Each size should meet target
        expect(initTime).toBeLessThan(PERFORMANCE_TARGETS.swarmInitialization);
        
        await swarmCoordinator.teardownSwarm();
      }
      
      // Initialization time should scale reasonably
      const timePerAgent = initializationTimes.map((time, i) => time / swarmSizes[i]);
      const avgTimePerAgent = timePerAgent.reduce((a, b) => a + b, 0) / timePerAgent.length;
      
      expect(avgTimePerAgent).toBeLessThan(50); // 50ms per agent max
    });

    it('should handle concurrent swarm initialization requests', async () => {
      const concurrentSwarms = 5;
      const swarmPromises: Promise<any>[] = [];
      
      performance.start('concurrent-swarm-init');
      
      for (let i = 0; i < concurrentSwarms; i++) {
        const swarmPromise = swarmCoordinator.initializeSwarm({
          swarmId: `concurrent-swarm-${i}`,
          topology: 'hierarchical',
          agentCount: 20
        });
        swarmPromises.push(swarmPromise);
      }
      
      const results = await Promise.all(swarmPromises);
      
      performance.end('concurrent-swarm-init');
      
      // All swarms should initialize successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.agentCount).toBe(20);
      });
      
      const totalTime = performance.getDuration('concurrent-swarm-init');
      expect(totalTime).toBeLessThan(PERFORMANCE_TARGETS.swarmInitialization * 2);
    });
  });

  describe('Agent Management Performance', () => {
    beforeEach(async () => {
      await swarmCoordinator.initializeSwarm({
        topology: 'mesh',
        agentCount: 50
      });
    });

    it('should spawn agents rapidly with optimal resource usage', async () => {
      const agentTypes = ['coordinator', 'worker', 'analyst', 'monitor'];
      const spawnTimes: number[] = [];
      
      for (let i = 0; i < 20; i++) {
        const agentType = agentTypes[i % agentTypes.length];
        
        performance.start(`agent-spawn-${i}`);
        
        const agent = await agentManager.spawnAgent({
          type: agentType,
          capabilities: testHelpers.getCapabilitiesForType(agentType),
          priority: 'normal'
        });
        
        performance.end(`agent-spawn-${i}`);
        
        const spawnTime = performance.getDuration(`agent-spawn-${i}`);
        spawnTimes.push(spawnTime);
        
        expect(agent.id).toBeDefined();
        expect(agent.status).toBe('active');
        expect(spawnTime).toBeLessThan(PERFORMANCE_TARGETS.agentSpawning);
      }
      
      const avgSpawnTime = spawnTimes.reduce((a, b) => a + b, 0) / spawnTimes.length;
      expect(avgSpawnTime).toBeLessThan(PERFORMANCE_TARGETS.agentSpawning / 2);
    });

    it('should handle agent lifecycle operations efficiently', async () => {
      const agents = [];
      
      // Spawn multiple agents
      performance.start('bulk-agent-spawn');
      
      for (let i = 0; i < 30; i++) {
        const agent = await agentManager.spawnAgent({
          type: 'worker',
          capabilities: ['execution', 'analysis']
        });
        agents.push(agent);
      }
      
      performance.end('bulk-agent-spawn');
      
      // Update agent configurations
      performance.start('bulk-agent-update');
      
      const updatePromises = agents.map(agent => 
        agentManager.updateAgent(agent.id, {
          capabilities: [...agent.capabilities, 'monitoring'],
          priority: 'high'
        })
      );
      
      await Promise.all(updatePromises);
      
      performance.end('bulk-agent-update');
      
      // Terminate agents
      performance.start('bulk-agent-terminate');
      
      const terminatePromises = agents.map(agent => 
        agentManager.terminateAgent(agent.id, { graceful: true })
      );
      
      await Promise.all(terminatePromises);
      
      performance.end('bulk-agent-terminate');
      
      const spawnTime = performance.getDuration('bulk-agent-spawn');
      const updateTime = performance.getDuration('bulk-agent-update');
      const terminateTime = performance.getDuration('bulk-agent-terminate');
      
      expect(spawnTime / agents.length).toBeLessThan(PERFORMANCE_TARGETS.agentSpawning);
      expect(updateTime).toBeLessThan(2000); // 2 seconds for 30 updates
      expect(terminateTime).toBeLessThan(1500); // 1.5 seconds for 30 terminations
    });

    it('should auto-scale agent pool based on workload', async () => {
      const initialAgentCount = await agentManager.getActiveAgentCount();
      
      // Simulate high workload
      performance.start('auto-scaling-test');
      
      const heavyWorkload = Array.from({ length: 100 }, (_, i) => ({
        id: `heavy-task-${i}`,
        type: 'computation',
        complexity: 'high',
        estimatedDuration: 5000
      }));
      
      await taskOrchestrator.submitTasks(heavyWorkload);
      
      // Wait for auto-scaling to kick in
      await testHelpers.waitForCondition(
        () => agentManager.getActiveAgentCount() > initialAgentCount,
        5000
      );
      
      const scaledAgentCount = await agentManager.getActiveAgentCount();
      expect(scaledAgentCount).toBeGreaterThan(initialAgentCount);
      
      // Complete tasks and wait for scale-down
      await taskOrchestrator.waitForCompletion();
      
      await testHelpers.waitForCondition(
        () => agentManager.getActiveAgentCount() <= initialAgentCount + 5,
        10000
      );
      
      performance.end('auto-scaling-test');
      
      const scalingTime = performance.getDuration('auto-scaling-test');
      expect(scalingTime).toBeLessThan(15000); // 15 seconds max for complete cycle
    });
  });

  describe('Task Distribution Performance', () => {
    beforeEach(async () => {
      await swarmCoordinator.initializeSwarm({
        topology: 'hierarchical',
        agentCount: 25
      });
    });

    it('should distribute tasks efficiently across agent topology', async () => {
      const taskBatches = [10, 50, 100, 200];
      const distributionTimes: number[] = [];
      
      for (const batchSize of taskBatches) {
        const tasks = Array.from({ length: batchSize }, (_, i) => ({
          id: `dist-task-${batchSize}-${i}`,
          type: 'analysis',
          priority: i % 3 === 0 ? 'high' : 'normal',
          estimatedDuration: 1000 + Math.random() * 2000
        }));
        
        performance.start(`task-distribution-${batchSize}`);
        
        const distributionResult = await taskOrchestrator.distributeTasks(tasks);
        
        performance.end(`task-distribution-${batchSize}`);
        
        const distTime = performance.getDuration(`task-distribution-${batchSize}`);
        distributionTimes.push(distTime);
        
        expect(distributionResult.success).toBe(true);
        expect(distributionResult.distributedTasks).toBe(batchSize);
        expect(distTime).toBeLessThan(PERFORMANCE_TARGETS.taskDistribution);
      }
      
      // Distribution should scale sub-linearly
      const efficiency = distributionTimes.map((time, i) => taskBatches[i] / time);
      const avgEfficiency = efficiency.reduce((a, b) => a + b, 0) / efficiency.length;
      
      expect(avgEfficiency).toBeGreaterThan(50); // 50 tasks per second minimum
    });

    it('should optimize task routing based on agent capabilities', async () => {
      // Create specialized agents
      const specialists = [
        { type: 'data_analyst', capabilities: ['data_analysis', 'statistics'] },
        { type: 'ml_engineer', capabilities: ['machine_learning', 'model_training'] },
        { type: 'coordinator', capabilities: ['coordination', 'supervision'] }
      ];
      
      for (const spec of specialists) {
        await agentManager.spawnAgent(spec);
      }
      
      const specializedTasks = [
        { id: 'data-task-1', type: 'data_analysis', requiredCapabilities: ['data_analysis'] },
        { id: 'ml-task-1', type: 'model_training', requiredCapabilities: ['machine_learning'] },
        { id: 'coord-task-1', type: 'coordination', requiredCapabilities: ['coordination'] }
      ];
      
      performance.start('capability-based-routing');
      
      const routingResult = await taskOrchestrator.distributeTasks(specializedTasks, {
        routingStrategy: 'capability_match',
        optimizeForLatency: true
      });
      
      performance.end('capability-based-routing');
      
      expect(routingResult.success).toBe(true);
      expect(routingResult.optimalMatches).toBe(specializedTasks.length);
      
      const routingTime = performance.getDuration('capability-based-routing');
      expect(routingTime).toBeLessThan(200); // 200ms for capability matching
    });

    it('should handle task priority queuing with minimal latency', async () => {
      const priorityLevels = ['low', 'normal', 'high', 'critical'];
      const tasksPerPriority = 25;
      
      const allTasks = priorityLevels.flatMap(priority => 
        Array.from({ length: tasksPerPriority }, (_, i) => ({
          id: `${priority}-task-${i}`,
          type: 'processing',
          priority,
          submissionTime: Date.now()
        }))
      );
      
      // Shuffle tasks to test priority sorting
      const shuffledTasks = testHelpers.shuffleArray(allTasks);
      
      performance.start('priority-queue-processing');
      
      await taskOrchestrator.submitTasks(shuffledTasks);
      
      // Track task execution order
      const executionOrder: any[] = [];
      
      taskOrchestrator.on('task_started', (task) => {
        executionOrder.push({
          id: task.id,
          priority: task.priority,
          startTime: Date.now()
        });
      });
      
      await taskOrchestrator.waitForCompletion();
      
      performance.end('priority-queue-processing');
      
      // Verify priority ordering
      const criticalTasks = executionOrder.filter(t => t.priority === 'critical');
      const highTasks = executionOrder.filter(t => t.priority === 'high');
      const normalTasks = executionOrder.filter(t => t.priority === 'normal');
      const lowTasks = executionOrder.filter(t => t.priority === 'low');
      
      // Critical tasks should start before others
      if (criticalTasks.length > 0 && highTasks.length > 0) {
        expect(criticalTasks[0].startTime).toBeLessThanOrEqual(highTasks[0].startTime);
      }
      
      const totalTime = performance.getDuration('priority-queue-processing');
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 100 tasks
    });
  });

  describe('Communication Performance', () => {
    beforeEach(async () => {
      await swarmCoordinator.initializeSwarm({
        topology: 'mesh',
        agentCount: 20
      });
    });

    it('should maintain low latency for inter-agent communication', async () => {
      const agents = await agentManager.getAllActiveAgents();
      const messagingPairs = testHelpers.generatePairs(agents, 10);
      
      const latencies: number[] = [];
      
      for (const [sender, receiver] of messagingPairs) {
        const message = {
          id: `latency-test-${Date.now()}`,
          type: 'ping',
          content: { timestamp: Date.now() },
          requireAck: true
        };
        
        performance.start(`message-latency-${sender.id}-${receiver.id}`);
        
        const result = await swarmCoordinator.sendMessage(sender.id, receiver.id, message);
        
        performance.end(`message-latency-${sender.id}-${receiver.id}`);
        
        const latency = performance.getDuration(`message-latency-${sender.id}-${receiver.id}`);
        latencies.push(latency);
        
        expect(result.success).toBe(true);
        expect(latency).toBeLessThan(PERFORMANCE_TARGETS.messageLatency);
      }
      
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);
      const p95Latency = testHelpers.calculatePercentile(latencies, 95);
      
      expect(avgLatency).toBeLessThan(PERFORMANCE_TARGETS.messageLatency / 2);
      expect(p95Latency).toBeLessThan(PERFORMANCE_TARGETS.messageLatency);
    });

    it('should handle broadcast message distribution efficiently', async () => {
      const agents = await agentManager.getAllActiveAgents();
      const broadcastSizes = [5, 10, 15, 20];
      
      for (const size of broadcastSizes) {
        const targetAgents = agents.slice(0, size);
        const broadcastMessage = {
          id: `broadcast-test-${size}`,
          type: 'system_announcement',
          content: { announcement: `Test broadcast to ${size} agents` }
        };
        
        performance.start(`broadcast-${size}`);
        
        const result = await swarmCoordinator.broadcastMessage(
          targetAgents.map(a => a.id),
          broadcastMessage
        );
        
        performance.end(`broadcast-${size}`);
        
        const broadcastTime = performance.getDuration(`broadcast-${size}`);
        
        expect(result.success).toBe(true);
        expect(result.deliveredCount).toBe(size);
        expect(broadcastTime).toBeLessThan(PERFORMANCE_TARGETS.messageLatency * 2);
      }
    });

    it('should optimize message routing in different topologies', async () => {
      const topologies = ['mesh', 'ring', 'star', 'hierarchical'];
      const routingPerformance: Record<string, number> = {};
      
      for (const topology of topologies) {
        await swarmCoordinator.teardownSwarm();
        await swarmCoordinator.initializeSwarm({
          topology,
          agentCount: 15
        });
        
        const agents = await agentManager.getAllActiveAgents();
        const testPairs = testHelpers.generatePairs(agents, 5);
        
        performance.start(`routing-${topology}`);
        
        const routingPromises = testPairs.map(([sender, receiver]) => 
          swarmCoordinator.sendMessage(sender.id, receiver.id, {
            id: `routing-test-${topology}`,
            type: 'test_message',
            content: { test: true }
          })
        );
        
        await Promise.all(routingPromises);
        
        performance.end(`routing-${topology}`);
        
        const routingTime = performance.getDuration(`routing-${topology}`);
        routingPerformance[topology] = routingTime / testPairs.length;
      }
      
      // Verify each topology performs within bounds
      Object.values(routingPerformance).forEach(avgTime => {
        expect(avgTime).toBeLessThan(PERFORMANCE_TARGETS.messageLatency * 3);
      });
      
      // Mesh should be fastest for small networks
      expect(routingPerformance.mesh).toBeLessThan(routingPerformance.ring);
    });
  });

  describe('Memory and Resource Performance', () => {
    it('should maintain memory efficiency under sustained load', async () => {
      const initialMemory = process.memoryUsage();
      
      await swarmCoordinator.initializeSwarm({
        topology: 'hierarchical',
        agentCount: 50
      });
      
      performance.start('sustained-load-test');
      
      // Run sustained operations for 30 seconds
      const endTime = Date.now() + 30000;
      let operationCount = 0;
      
      while (Date.now() < endTime) {
        // Spawn and terminate agents
        const agent = await agentManager.spawnAgent({
          type: 'temporary_worker',
          capabilities: ['temp_processing']
        });
        
        // Submit and complete a task
        await taskOrchestrator.submitTask({
          id: `sustained-task-${operationCount}`,
          type: 'quick_processing',
          agentId: agent.id
        });
        
        await agentManager.terminateAgent(agent.id);
        operationCount++;
        
        // Periodic memory check
        if (operationCount % 10 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
          expect(memoryIncrease).toBeLessThan(PERFORMANCE_TARGETS.memoryUsage);
        }
      }
      
      performance.end('sustained-load-test');
      
      const finalMemory = process.memoryUsage();
      const totalMemoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const throughput = operationCount / 30; // operations per second
      
      expect(totalMemoryIncrease).toBeLessThan(PERFORMANCE_TARGETS.memoryUsage);
      expect(throughput).toBeGreaterThan(10); // At least 10 ops/sec
    });

    it('should efficiently clean up resources after swarm shutdown', async () => {
      const preInitMemory = process.memoryUsage();
      
      // Initialize large swarm
      await swarmCoordinator.initializeSwarm({
        topology: 'mesh',
        agentCount: 30
      });
      
      // Perform intensive operations
      const agents = await agentManager.getAllActiveAgents();
      const intensiveTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `intensive-task-${i}`,
        type: 'memory_intensive',
        data: new Array(1000).fill(`data-${i}`)
      }));
      
      await taskOrchestrator.submitTasks(intensiveTasks);
      await taskOrchestrator.waitForCompletion();
      
      const preShutdownMemory = process.memoryUsage();
      
      // Shutdown swarm
      performance.start('resource-cleanup');
      
      await swarmCoordinator.shutdown({ force: false, timeout: 10000 });
      
      performance.end('resource-cleanup');
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Wait for cleanup
      await testHelpers.wait(2000);
      
      const postShutdownMemory = process.memoryUsage();
      
      const cleanupTime = performance.getDuration('resource-cleanup');
      const memoryReclaimed = preShutdownMemory.heapUsed - postShutdownMemory.heapUsed;
      const memoryRetained = postShutdownMemory.heapUsed - preInitMemory.heapUsed;
      
      expect(cleanupTime).toBeLessThan(15000); // 15 seconds max cleanup
      expect(memoryReclaimed).toBeGreaterThan(0); // Should reclaim some memory
      expect(memoryRetained).toBeLessThan(50 * 1024 * 1024); // 50MB max retained
    });
  });

  describe('Scalability Performance', () => {
    it('should demonstrate linear scalability up to target limits', async () => {
      const scalingSizes = [10, 20, 40, 80];
      const scalingMetrics: any[] = [];
      
      for (const size of scalingSizes) {
        performance.start(`scaling-test-${size}`);
        
        await swarmCoordinator.initializeSwarm({
          topology: 'hierarchical',
          agentCount: size
        });
        
        // Submit proportional workload
        const tasks = Array.from({ length: size * 2 }, (_, i) => ({
          id: `scale-task-${size}-${i}`,
          type: 'standard_processing'
        }));
        
        const taskStartTime = Date.now();
        await taskOrchestrator.submitTasks(tasks);
        await taskOrchestrator.waitForCompletion();
        const taskCompletionTime = Date.now() - taskStartTime;
        
        performance.end(`scaling-test-${size}`);
        
        const totalTime = performance.getDuration(`scaling-test-${size}`);
        
        scalingMetrics.push({
          size,
          initTime: totalTime - taskCompletionTime,
          taskTime: taskCompletionTime,
          throughput: tasks.length / (taskCompletionTime / 1000)
        });
        
        await swarmCoordinator.teardownSwarm();
      }
      
      // Analyze scaling characteristics
      for (let i = 1; i < scalingMetrics.length; i++) {
        const prev = scalingMetrics[i - 1];
        const curr = scalingMetrics[i];
        
        const sizeRatio = curr.size / prev.size;
        const timeRatio = curr.initTime / prev.initTime;
        const throughputRatio = curr.throughput / prev.throughput;
        
        // Initialization should scale sub-linearly (better than O(n))
        expect(timeRatio).toBeLessThan(sizeRatio * 1.5);
        
        // Throughput should improve with more agents
        expect(throughputRatio).toBeGreaterThan(0.8);
      }
    });

    it('should handle peak load scenarios gracefully', async () => {
      await swarmCoordinator.initializeSwarm({
        topology: 'mesh',
        agentCount: 40,
        enableAutoScaling: true
      });
      
      // Simulate peak load burst
      const peakTasks = Array.from({ length: 500 }, (_, i) => ({
        id: `peak-task-${i}`,
        type: 'burst_processing',
        priority: i < 50 ? 'high' : 'normal',
        arrivalTime: Date.now() + (i * 10) // Staggered arrival
      }));
      
      performance.start('peak-load-handling');
      
      // Submit tasks in batches to simulate burst
      const batchSize = 50;
      for (let i = 0; i < peakTasks.length; i += batchSize) {
        const batch = peakTasks.slice(i, i + batchSize);
        await taskOrchestrator.submitTasks(batch);
        
        if (i < peakTasks.length - batchSize) {
          await testHelpers.wait(100); // 100ms between batches
        }
      }
      
      const queueMetrics = await taskOrchestrator.getQueueMetrics();
      expect(queueMetrics.pendingTasks).toBeGreaterThan(0);
      
      await taskOrchestrator.waitForCompletion();
      
      performance.end('peak-load-handling');
      
      const peakHandlingTime = performance.getDuration('peak-load-handling');
      const finalMetrics = await taskOrchestrator.getQueueMetrics();
      
      expect(finalMetrics.pendingTasks).toBe(0);
      expect(finalMetrics.completedTasks).toBe(peakTasks.length);
      expect(peakHandlingTime).toBeLessThan(60000); // 60 seconds max
      
      // System should remain stable
      const systemHealth = await swarmCoordinator.getHealthMetrics();
      expect(systemHealth.overallHealth).toBeGreaterThan(0.8);
    });
  });
});
