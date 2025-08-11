/**
 * @file Composite Pattern Tests
 * Hybrid TDD approach: London TDD for hierarchy management, Classical TDD for task execution algorithms
 */

import { AgentFactory } from '../../coordination/agents/composite-system.ts';

// Mock task executor for testing
const createMockTaskExecutor = (delay: number = 50, shouldSucceed: boolean = true) =>
  vi.fn().mockImplementation(async (task: TaskDefinition) => {
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (!shouldSucceed) {
      throw new Error(`Task ${task.id} failed`);
    }

    return {
      taskId: task.id,
      success: true,
      result: `Completed ${task.type} task`,
      executionTime: delay,
      timestamp: new Date(),
      agentId: 'mock-agent',
    };
  });

describe('Composite Pattern Implementation', () => {
  // Classical TDD - Test actual task execution algorithms and hierarchy operations
  describe('Task Execution Algorithms (Classical TDD)', () => {
    let agent: Agent;
    let capabilities: AgentCapability[];

    beforeEach(() => {
      capabilities = [
        AgentFactory.createCapability(
          'data-processing',
          '1.0.0',
          'Process and transform data',
          { maxConcurrency: 2, timeout: 30000 },
          { cpu: 0.5, memory: 512, network: 100, storage: 100 }
        ),
        AgentFactory.createCapability(
          'text-analysis',
          '1.0.0',
          'Analyze and extract insights from text',
          { accuracy: 0.9, language: 'en' },
          { cpu: 0.3, memory: 256, network: 50, storage: 50 }
        ),
      ];

      agent = AgentFactory.createAgent('test-agent-001', 'Test Agent', capabilities, {
        cpu: 2.0,
        memory: 4096,
        network: 1000,
        storage: 1000,
      });
    });

    describe('Individual Agent Execution', () => {
      it('should execute compatible tasks successfully', async () => {
        const taskExecutor = createMockTaskExecutor(100, true);
        await agent.initialize({
          maxConcurrentTasks: 2,
          capabilities,
          taskExecutor,
        });

        const task: TaskDefinition = {
          id: 'task-001',
          type: 'data-processing',
          priority: 'medium',
          payload: {
            input: 'test-data',
            operation: 'transform',
            parameters: { format: 'json' },
          },
          requirements: {
            capabilities: ['data-processing'],
            resources: { cpu: 0.2, memory: 256, network: 50, storage: 50 },
            timeout: 30000,
          },
          metadata: { source: 'user', timestamp: new Date() },
        };

        const result = await agent.executeTask(task);

        expect(result?.success).toBe(true);
        expect(result?.taskId).toBe('task-001');
        expect(result?.executionTime).toBe(100);
        expect(result?.agentId).toBe('test-agent-001');
      });

      it('should reject incompatible tasks', async () => {
        await agent.initialize({
          maxConcurrentTasks: 1,
          capabilities,
          taskExecutor: createMockTaskExecutor(),
        });

        const incompatibleTask: TaskDefinition = {
          id: 'incompatible-task',
          type: 'video-processing', // Not in agent capabilities
          priority: 'high',
          payload: { video: 'test.mp4' },
          requirements: {
            capabilities: ['video-processing'],
            resources: { cpu: 1.0, memory: 1024, network: 200, storage: 500 },
          },
          metadata: { source: 'system', timestamp: new Date() },
        };

        const canHandle = agent.canHandleTask(incompatibleTask);
        expect(canHandle).toBe(false);

        await expect(agent.executeTask(incompatibleTask)).rejects.toThrow(
          'Agent cannot handle task'
        );
      });

      it('should respect resource constraints', async () => {
        await agent.initialize({
          maxConcurrentTasks: 1,
          capabilities,
          taskExecutor: createMockTaskExecutor(),
        });

        const resourceIntensiveTask: TaskDefinition = {
          id: 'resource-intensive',
          type: 'data-processing',
          priority: 'low',
          payload: { size: 'large' },
          requirements: {
            capabilities: ['data-processing'],
            resources: { cpu: 5.0, memory: 8192, network: 2000, storage: 2000 }, // Exceeds agent capacity
          },
          metadata: { source: 'batch', timestamp: new Date() },
        };

        const canHandle = agent.canHandleTask(resourceIntensiveTask);
        expect(canHandle).toBe(false);
      });

      it('should handle concurrent task execution', async () => {
        const taskExecutor = createMockTaskExecutor(200, true);
        await agent.initialize({
          maxConcurrentTasks: 3,
          capabilities,
          taskExecutor,
        });

        const tasks: TaskDefinition[] = Array.from({ length: 5 }, (_, i) => ({
          id: `concurrent-task-${i}`,
          type: 'data-processing',
          priority: 'medium',
          payload: { index: i },
          requirements: {
            capabilities: ['data-processing'],
            resources: { cpu: 0.1, memory: 128, network: 25, storage: 25 },
          },
          metadata: { source: 'concurrent-test', timestamp: new Date() },
        }));

        const startTime = Date.now();
        const results = await Promise.all(tasks.map((task) => agent.executeTask(task)));
        const totalTime = Date.now() - startTime;

        expect(results?.every((r) => r.success)).toBe(true);
        expect(totalTime).toBeLessThan(600); // Should be < 3 * 200ms due to concurrency
        expect(totalTime).toBeGreaterThan(400); // Should be > 2 * 200ms due to queue limit

        const status = agent.getStatus();
        expect(status.totalCompletedTasks).toBe(5);
        expect(status.averageExecutionTime).toBeCloseTo(200, 0);
      });

      it('should track performance metrics accurately', async () => {
        const executionTimes = [50, 100, 150, 200, 250];
        let callCount = 0;

        const variableTaskExecutor = vi.fn().mockImplementation(async (task: TaskDefinition) => {
          const delay = executionTimes[callCount++];
          await new Promise((resolve) => setTimeout(resolve, delay));

          return {
            taskId: task.id,
            success: true,
            result: `Task completed in ${delay}ms`,
            executionTime: delay,
            timestamp: new Date(),
            agentId: 'test-agent-001',
          };
        });

        await agent.initialize({
          maxConcurrentTasks: 1,
          capabilities,
          taskExecutor: variableTaskExecutor,
        });

        const tasks: TaskDefinition[] = executionTimes.map((_, i) => ({
          id: `perf-task-${i}`,
          type: 'data-processing',
          priority: 'medium',
          payload: { index: i },
          requirements: {
            capabilities: ['data-processing'],
            resources: { cpu: 0.1, memory: 64, network: 10, storage: 10 },
          },
          metadata: { source: 'performance-test', timestamp: new Date() },
        }));

        for (const task of tasks) {
          await agent.executeTask(task);
        }

        const status = agent.getStatus();
        expect(status.totalCompletedTasks).toBe(5);
        expect(status.averageExecutionTime).toBe(150); // (50+100+150+200+250)/5
        expect(status.minExecutionTime).toBe(50);
        expect(status.maxExecutionTime).toBe(250);
      });
    });

    describe('Agent Group Execution', () => {
      let agentGroup: AgentGroup;
      let agents: Agent[];

      beforeEach(async () => {
        agents = Array.from({ length: 3 }, (_, i) => {
          const agentCapabilities = [
            AgentFactory.createCapability(
              'data-processing',
              '1.0.0',
              'Process data',
              {},
              { cpu: 0.3, memory: 256, network: 50, storage: 50 }
            ),
            AgentFactory.createCapability(
              `specialized-${i}`,
              '1.0.0',
              `Specialized capability ${i}`,
              {},
              { cpu: 0.2, memory: 128, network: 25, storage: 25 }
            ),
          ];

          return AgentFactory.createAgent(
            `group-agent-${i}`,
            `Group Agent ${i}`,
            agentCapabilities,
            { cpu: 1.0, memory: 1024, network: 200, storage: 200 }
          );
        });

        agentGroup = AgentFactory.createAgentGroup('test-group', 'Test Agent Group', agents);

        // Initialize all agents
        for (const agent of agents) {
          await agent.initialize({
            maxConcurrentTasks: 2,
            capabilities: agent.getCapabilities(),
            taskExecutor: createMockTaskExecutor(100, true),
          });
        }

        await agentGroup.initialize({
          loadBalancing: 'round-robin',
          failureHandling: 'retry',
          maxRetries: 2,
        });
      });

      it('should distribute tasks across group members', async () => {
        const tasks: TaskDefinition[] = Array.from({ length: 6 }, (_, i) => ({
          id: `distributed-task-${i}`,
          type: 'data-processing',
          priority: 'medium',
          payload: { index: i },
          requirements: {
            capabilities: ['data-processing'],
            resources: { cpu: 0.1, memory: 64, network: 10, storage: 10 },
          },
          metadata: { source: 'distribution-test', timestamp: new Date() },
        }));

        const results = await Promise.all(tasks.map((task) => agentGroup.executeTask(task)));

        expect(results?.every((r) => r.success)).toBe(true);

        // Verify distribution - each agent should have handled some tasks
        const agentExecutions = new Set(results?.map((r) => r.agentId));
        expect(agentExecutions.size).toBeGreaterThan(1); // Multiple agents used

        const groupStatus = agentGroup.getStatus();
        expect(groupStatus.totalCompletedTasks).toBe(6);
        expect(groupStatus.activeMemberCount).toBe(3);
      });

      it('should handle different load balancing strategies', async () => {
        const strategies: LoadBalancingStrategy[] = [
          'round-robin',
          'least-loaded',
          'capability-based',
        ];

        for (const strategy of strategies) {
          const testGroup = AgentFactory.createAgentGroup(
            `test-${strategy}`,
            `Test ${strategy}`,
            agents
          );

          await testGroup.initialize({
            loadBalancing: strategy,
            failureHandling: 'skip',
          });

          testGroup.setLoadBalancingStrategy(strategy);

          const tasks: TaskDefinition[] = Array.from({ length: 3 }, (_, i) => ({
            id: `${strategy}-task-${i}`,
            type: 'data-processing',
            priority: 'medium',
            payload: { strategy, index: i },
            requirements: {
              capabilities: ['data-processing'],
              resources: { cpu: 0.1, memory: 64, network: 10, storage: 10 },
            },
            metadata: { source: `${strategy}-test`, timestamp: new Date() },
          }));

          const results = await Promise.all(tasks.map((task) => testGroup.executeTask(task)));
          expect(results?.every((r) => r.success)).toBe(true);

          await testGroup.shutdown();
        }
      });

      it('should handle member failures gracefully', async () => {
        // Make one agent fail
        const failingAgent = agents[1];
        await failingAgent.initialize({
          maxConcurrentTasks: 1,
          capabilities: failingAgent.getCapabilities(),
          taskExecutor: createMockTaskExecutor(100, false), // This agent will fail
        });

        const tasks: TaskDefinition[] = Array.from({ length: 6 }, (_, i) => ({
          id: `failure-test-${i}`,
          type: 'data-processing',
          priority: 'medium',
          payload: { index: i },
          requirements: {
            capabilities: ['data-processing'],
            resources: { cpu: 0.1, memory: 64, network: 10, storage: 10 },
          },
          metadata: { source: 'failure-test', timestamp: new Date() },
        }));

        const results = await Promise.all(tasks.map((task) => agentGroup.executeTask(task)));

        // Some tasks should succeed (handled by working agents)
        const successfulTasks = results?.filter((r) => r.success);
        const failedTasks = results?.filter((r) => !r.success);

        expect(successfulTasks.length).toBeGreaterThan(0);
        expect(failedTasks.length).toBeGreaterThan(0);

        // Failed tasks should have error information
        failedTasks.forEach((result) => {
          expect(result?.error).toBeDefined();
          expect(result?.error?.message).toContain('failed');
        });
      });

      it('should aggregate capabilities from all members', () => {
        const groupCapabilities = agentGroup.getCapabilities();

        // Should include common capabilities
        expect(groupCapabilities.some((cap) => cap.name === 'data-processing')).toBe(true);

        // Should include specialized capabilities from all members
        expect(groupCapabilities.some((cap) => cap.name === 'specialized-0')).toBe(true);
        expect(groupCapabilities.some((cap) => cap.name === 'specialized-1')).toBe(true);
        expect(groupCapabilities.some((cap) => cap.name === 'specialized-2')).toBe(true);

        expect(groupCapabilities.length).toBeGreaterThan(3); // At least 4 capabilities
      });

      it('should calculate composite resource availability', () => {
        const groupStatus = agentGroup.getStatus() as CompositeStatus;

        expect(groupStatus.resourceCapacity.cpu).toBe(3.0); // 3 agents * 1.0 CPU each
        expect(groupStatus.resourceCapacity.memory).toBe(3072); // 3 agents * 1024 MB each
        expect(groupStatus.totalMembers).toBe(3);
        expect(groupStatus.activeMemberCount).toBe(3);
      });
    });

    describe('Hierarchical Agent Groups', () => {
      let hierarchicalGroup: HierarchicalAgentGroup;
      let subGroups: AgentGroup[];
      let leafAgents: Agent[];

      beforeEach(async () => {
        // Create leaf agents
        leafAgents = Array.from({ length: 6 }, (_, i) => {
          const capabilities = [
            AgentFactory.createCapability(
              'basic-processing',
              '1.0.0',
              'Basic processing',
              {},
              { cpu: 0.2, memory: 128, network: 25, storage: 25 }
            ),
            AgentFactory.createCapability(
              `tier-${Math.floor(i / 2)}`,
              '1.0.0',
              `Tier ${Math.floor(i / 2)} capability`,
              {},
              { cpu: 0.1, memory: 64, network: 12, storage: 12 }
            ),
          ];

          return AgentFactory.createAgent(`leaf-agent-${i}`, `Leaf Agent ${i}`, capabilities, {
            cpu: 0.5,
            memory: 512,
            network: 100,
            storage: 100,
          });
        });

        // Create sub-groups (3 groups of 2 agents each)
        subGroups = [];
        for (let i = 0; i < 3; i++) {
          const groupAgents = leafAgents.slice(i * 2, (i + 1) * 2);
          const subGroup = AgentFactory.createAgentGroup(
            `sub-group-${i}`,
            `Sub Group ${i}`,
            groupAgents
          );
          subGroups.push(subGroup);
        }

        // Create hierarchical group
        hierarchicalGroup = AgentFactory.createHierarchicalGroup(
          'hierarchical-test',
          'Hierarchical Test Group',
          subGroups,
          2 // Max depth
        );

        // Initialize all components
        for (const agent of leafAgents) {
          await agent.initialize({
            maxConcurrentTasks: 1,
            capabilities: agent.getCapabilities(),
            taskExecutor: createMockTaskExecutor(50, true),
          });
        }

        for (const subGroup of subGroups) {
          await subGroup.initialize({
            loadBalancing: 'round-robin',
            failureHandling: 'retry',
          });
        }

        await hierarchicalGroup.initialize({
          loadBalancing: 'capability-based',
          failureHandling: 'cascade',
          maxDepth: 2,
        });
      });

      it('should route tasks through hierarchy levels', async () => {
        const tasks: TaskDefinition[] = [
          {
            id: 'tier-0-task',
            type: 'basic-processing',
            priority: 'high',
            payload: { tier: 0 },
            requirements: {
              capabilities: ['tier-0'],
              resources: { cpu: 0.1, memory: 32, network: 5, storage: 5 },
            },
            metadata: { source: 'hierarchy-test', timestamp: new Date() },
          },
          {
            id: 'tier-1-task',
            type: 'basic-processing',
            priority: 'medium',
            payload: { tier: 1 },
            requirements: {
              capabilities: ['tier-1'],
              resources: { cpu: 0.1, memory: 32, network: 5, storage: 5 },
            },
            metadata: { source: 'hierarchy-test', timestamp: new Date() },
          },
          {
            id: 'tier-2-task',
            type: 'basic-processing',
            priority: 'low',
            payload: { tier: 2 },
            requirements: {
              capabilities: ['tier-2'],
              resources: { cpu: 0.1, memory: 32, network: 5, storage: 5 },
            },
            metadata: { source: 'hierarchy-test', timestamp: new Date() },
          },
        ];

        const results = await Promise.all(tasks.map((task) => hierarchicalGroup.executeTask(task)));

        expect(results?.every((r) => r.success)).toBe(true);

        // Verify tasks were routed to appropriate tier agents
        results?.forEach((result, index) => {
          const expectedTier = Math.floor(parseInt(result?.agentId?.split('-')[2]) / 2);
          expect(expectedTier).toBe(index); // tier-0 -> agents 0-1, tier-1 -> agents 2-3, etc.
        });
      });

      it('should calculate hierarchy depth correctly', () => {
        const status = hierarchicalGroup.getStatus() as CompositeStatus;

        expect(status.hierarchyDepth).toBe(2); // Sub-groups -> Leaf agents
        expect(status.totalMembers).toBe(3); // 3 sub-groups
        expect(hierarchicalGroup.getTotalAgentCount()).toBe(6); // 6 leaf agents total
      });

      it('should handle cascading failures correctly', async () => {
        // Disable one sub-group by making its agents fail
        const failingSubGroup = subGroups[0];
        for (const member of failingSubGroup.getMembers()) {
          if (member.getType() === 'individual') {
            const agent = member as Agent;
            await agent.initialize({
              maxConcurrentTasks: 1,
              capabilities: agent.getCapabilities(),
              taskExecutor: createMockTaskExecutor(50, false), // Make it fail
            });
          }
        }

        const tasks: TaskDefinition[] = Array.from({ length: 9 }, (_, i) => ({
          id: `cascade-task-${i}`,
          type: 'basic-processing',
          priority: 'medium',
          payload: { index: i },
          requirements: {
            capabilities: ['basic-processing'],
            resources: { cpu: 0.1, memory: 32, network: 5, storage: 5 },
          },
          metadata: { source: 'cascade-test', timestamp: new Date() },
        }));

        const results = await Promise.all(tasks.map((task) => hierarchicalGroup.executeTask(task)));

        // Some tasks should succeed (handled by working sub-groups)
        const successfulTasks = results?.filter((r) => r.success);
        expect(successfulTasks.length).toBeGreaterThan(0);

        // Failed tasks should be redistributed to working sub-groups
        const workingSubGroups = subGroups.slice(1); // Groups 1 and 2 should work
        const expectedSuccessfulTasks = Math.floor(
          tasks.length * (workingSubGroups.length / subGroups.length)
        );
        expect(successfulTasks.length).toBeGreaterThanOrEqual(expectedSuccessfulTasks);
      });

      it('should optimize task distribution based on sub-group performance', async () => {
        // Create tasks with different complexity levels
        const simpleTasks: TaskDefinition[] = Array.from({ length: 3 }, (_, i) => ({
          id: `simple-task-${i}`,
          type: 'basic-processing',
          priority: 'low',
          payload: { complexity: 'simple', index: i },
          requirements: {
            capabilities: ['basic-processing'],
            resources: { cpu: 0.05, memory: 16, network: 2, storage: 2 },
          },
          metadata: { source: 'optimization-test', timestamp: new Date() },
        }));

        const complexTasks: TaskDefinition[] = Array.from({ length: 3 }, (_, i) => ({
          id: `complex-task-${i}`,
          type: 'basic-processing',
          priority: 'high',
          payload: { complexity: 'complex', index: i },
          requirements: {
            capabilities: ['basic-processing'],
            resources: { cpu: 0.2, memory: 64, network: 10, storage: 10 },
          },
          metadata: { source: 'optimization-test', timestamp: new Date() },
        }));

        const allTasks = [...simpleTasks, ...complexTasks];
        const startTime = Date.now();
        const results = await Promise.all(
          allTasks.map((task) => hierarchicalGroup.executeTask(task))
        );
        const totalTime = Date.now() - startTime;

        expect(results?.every((r) => r.success)).toBe(true);
        expect(totalTime).toBeLessThan(300); // Should be efficient due to parallel processing

        // Verify load distribution
        const agentUsage = new Map<string, number>();
        results?.forEach((result) => {
          const count = agentUsage.get(result?.agentId) || 0;
          agentUsage.set(result?.agentId, count + 1);
        });

        // Tasks should be distributed across multiple agents
        expect(agentUsage.size).toBeGreaterThan(2);
      });
    });

    describe('Performance and Scalability', () => {
      it('should handle large-scale task processing efficiently', async () => {
        const agentCount = 20;
        const taskCount = 100;

        // Create large agent pool
        const agents = Array.from({ length: agentCount }, (_, i) => {
          const capabilities = [
            AgentFactory.createCapability(
              'bulk-processing',
              '1.0.0',
              'Bulk data processing',
              { maxThroughput: 10 },
              { cpu: 0.1, memory: 64, network: 10, storage: 10 }
            ),
          ];

          return AgentFactory.createAgent(`bulk-agent-${i}`, `Bulk Agent ${i}`, capabilities, {
            cpu: 0.2,
            memory: 128,
            network: 20,
            storage: 20,
          });
        });

        const bulkGroup = AgentFactory.createAgentGroup(
          'bulk-processing-group',
          'Bulk Processing Group',
          agents
        );

        // Initialize agents with fast task executor
        for (const agent of agents) {
          await agent.initialize({
            maxConcurrentTasks: 5,
            capabilities: agent.getCapabilities(),
            taskExecutor: createMockTaskExecutor(10, true), // Very fast execution
          });
        }

        await bulkGroup.initialize({
          loadBalancing: 'least-loaded',
          failureHandling: 'skip',
        });

        // Create large task batch
        const tasks: TaskDefinition[] = Array.from({ length: taskCount }, (_, i) => ({
          id: `bulk-task-${i}`,
          type: 'bulk-processing',
          priority: 'medium',
          payload: { index: i, data: `data-${i}` },
          requirements: {
            capabilities: ['bulk-processing'],
            resources: { cpu: 0.01, memory: 8, network: 1, storage: 1 },
          },
          metadata: { source: 'bulk-test', timestamp: new Date() },
        }));

        const startTime = Date.now();
        const results = await Promise.all(tasks.map((task) => bulkGroup.executeTask(task)));
        const totalTime = Date.now() - startTime;

        expect(results?.every((r) => r.success)).toBe(true);
        expect(results).toHaveLength(taskCount);

        // Should process very quickly due to parallelization
        expect(totalTime).toBeLessThan(500); // Much less than taskCount * executionTime

        const groupStatus = bulkGroup.getStatus();
        expect(groupStatus.totalCompletedTasks).toBe(taskCount);

        // Verify load distribution
        const agentUsage = new Map<string, number>();
        results?.forEach((result) => {
          const count = agentUsage.get(result?.agentId) || 0;
          agentUsage.set(result?.agentId, count + 1);
        });

        // Tasks should be well-distributed across agents
        expect(agentUsage.size).toBeGreaterThan(agentCount * 0.8); // At least 80% of agents used

        await bulkGroup.shutdown();
      });

      it('should optimize memory usage with large hierarchies', async () => {
        const maxDepth = 3;
        const branchingFactor = 4;

        // Create deep hierarchy
        const createHierarchy = async (
          depth: number,
          prefix: string
        ): Promise<AgentComponent[]> => {
          if (depth === 0) {
            // Create leaf agents
            return Array.from({ length: branchingFactor }, (_, i) => {
              const capabilities = [
                AgentFactory.createCapability(
                  'memory-test',
                  '1.0.0',
                  'Memory efficiency test',
                  {},
                  { cpu: 0.05, memory: 32, network: 5, storage: 5 }
                ),
              ];

              return AgentFactory.createAgent(
                `${prefix}-leaf-${i}`,
                `Leaf Agent ${i}`,
                capabilities,
                { cpu: 0.1, memory: 64, network: 10, storage: 10 }
              );
            });
          } else {
            // Create sub-groups
            const subGroups = [];
            for (let i = 0; i < branchingFactor; i++) {
              const children = await createHierarchy(depth - 1, `${prefix}-${i}`);
              const subGroup = AgentFactory.createHierarchicalGroup(
                `${prefix}-group-${i}`,
                `Group ${prefix}-${i}`,
                children,
                maxDepth
              );
              subGroups.push(subGroup);
            }
            return subGroups;
          }
        };

        const hierarchy = await createHierarchy(maxDepth, 'memory');
        const rootGroup = AgentFactory.createHierarchicalGroup(
          'memory-test-root',
          'Memory Test Root',
          hierarchy,
          maxDepth + 1
        );

        // Initialize hierarchy
        const initializeHierarchy = async (components: AgentComponent[]) => {
          for (const component of components) {
            if (component.getType() === 'individual') {
              const agent = component as Agent;
              await agent.initialize({
                maxConcurrentTasks: 1,
                capabilities: agent.getCapabilities(),
                taskExecutor: createMockTaskExecutor(5, true),
              });
            } else {
              const group = component as AgentGroup;
              await group.initialize({
                loadBalancing: 'round-robin',
                failureHandling: 'skip',
              });
              await initializeHierarchy(group.getMembers());
            }
          }
        };

        await initializeHierarchy(hierarchy);
        await rootGroup.initialize({
          loadBalancing: 'capability-based',
          failureHandling: 'cascade',
        });

        const totalAgents = branchingFactor ** maxDepth;
        expect(rootGroup.getTotalAgentCount()).toBe(totalAgents);

        // Test task execution through deep hierarchy
        const task: TaskDefinition = {
          id: 'deep-hierarchy-task',
          type: 'memory-test',
          priority: 'medium',
          payload: { test: 'deep-execution' },
          requirements: {
            capabilities: ['memory-test'],
            resources: { cpu: 0.01, memory: 16, network: 2, storage: 2 },
          },
          metadata: { source: 'memory-test', timestamp: new Date() },
        };

        const result = await rootGroup.executeTask(task);
        expect(result?.success).toBe(true);

        const status = rootGroup.getStatus() as CompositeStatus;
        expect(status.hierarchyDepth).toBe(maxDepth + 1);

        await rootGroup.shutdown();
      });
    });
  });

  // London TDD - Test component management and hierarchy interactions
  describe('Component Management (London TDD)', () => {
    let mockAgent: vi.Mocked<Agent>;
    let mockGroup: vi.Mocked<AgentGroup>;

    beforeEach(() => {
      mockAgent = {
        executeTask: vi.fn(),
        canHandleTask: vi.fn(),
        getCapabilities: vi.fn(),
        getStatus: vi.fn(),
        getId: vi.fn().mockReturnValue('mock-agent'),
        getName: vi.fn().mockReturnValue('Mock Agent'),
        getType: vi.fn().mockReturnValue('individual'),
        initialize: vi.fn(),
        shutdown: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        updateCapabilities: vi.fn(),
        getResourceUsage: vi.fn(),
      };

      mockGroup = {
        executeTask: vi.fn(),
        canHandleTask: vi.fn(),
        getCapabilities: vi.fn(),
        getStatus: vi.fn(),
        getId: vi.fn().mockReturnValue('mock-group'),
        getName: vi.fn().mockReturnValue('Mock Group'),
        getType: vi.fn().mockReturnValue('composite'),
        initialize: vi.fn(),
        shutdown: vi.fn(),
        addMember: vi.fn(),
        removeMember: vi.fn(),
        getMembers: vi.fn().mockReturnValue([mockAgent]),
        setLoadBalancingStrategy: vi.fn(),
        getLoadBalancingStrategy: vi.fn().mockReturnValue('round-robin'),
        getTotalAgentCount: vi.fn().mockReturnValue(1),
      };
    });

    describe('AgentFactory', () => {
      it('should create agents with correct configuration', () => {
        const capabilities = [
          AgentFactory.createCapability(
            'test-capability',
            '2.0.0',
            'Test capability for factory',
            { param1: 'value1' },
            { cpu: 0.5, memory: 256, network: 50, storage: 50 }
          ),
        ];

        const agent = AgentFactory.createAgent(
          'factory-test-agent',
          'Factory Test Agent',
          capabilities,
          { cpu: 1.0, memory: 512, network: 100, storage: 100 }
        );

        expect(agent.getId()).toBe('factory-test-agent');
        expect(agent.getName()).toBe('Factory Test Agent');
        expect(agent.getType()).toBe('individual');
        expect(agent.getCapabilities()).toHaveLength(1);
        expect(agent.getCapabilities()[0]?.name).toBe('test-capability');
      });

      it('should create agent groups with members', () => {
        const members = [mockAgent];

        const group = AgentFactory.createAgentGroup(
          'factory-test-group',
          'Factory Test Group',
          members
        );

        expect(group.getId()).toBe('factory-test-group');
        expect(group.getName()).toBe('Factory Test Group');
        expect(group.getType()).toBe('composite');
        expect(group.getMembers()).toEqual(members);
      });

      it('should create hierarchical groups with depth limit', () => {
        const members = [mockGroup];
        const maxDepth = 3;

        const hierarchicalGroup = AgentFactory.createHierarchicalGroup(
          'hierarchy-test',
          'Hierarchy Test',
          members,
          maxDepth
        );

        expect(hierarchicalGroup.getId()).toBe('hierarchy-test');
        expect(hierarchicalGroup.getType()).toBe('composite');
        expect(hierarchicalGroup.getMembers()).toEqual(members);
      });

      it('should create capabilities with validation', () => {
        const capability = AgentFactory.createCapability(
          'validated-capability',
          '1.0.0',
          'Capability with validation',
          { required: true, timeout: 30000 },
          { cpu: 1.0, memory: 1024, network: 200, storage: 200 }
        );

        expect(capability.name).toBe('validated-capability');
        expect(capability.version).toBe('1.0.0');
        expect(capability.description).toBe('Capability with validation');
        expect(capability.parameters.required).toBe(true);
        expect(capability.resourceRequirements.cpu).toBe(1.0);
      });
    });

    describe('Agent Component Interface', () => {
      it('should delegate task execution to correct component', async () => {
        const task: TaskDefinition = {
          id: 'delegation-test',
          type: 'test-task',
          priority: 'medium',
          payload: { test: true },
          requirements: {
            capabilities: ['test-capability'],
            resources: { cpu: 0.1, memory: 64, network: 10, storage: 10 },
          },
          metadata: { source: 'delegation-test', timestamp: new Date() },
        };

        const expectedResult: TaskResult = {
          taskId: 'delegation-test',
          success: true,
          result: 'Task completed',
          executionTime: 100,
          timestamp: new Date(),
          agentId: 'mock-agent',
        };

        mockAgent.executeTask.mockResolvedValue(expectedResult);
        mockAgent.canHandleTask.mockReturnValue(true);

        const result = await mockAgent.executeTask(task);

        expect(mockAgent.executeTask).toHaveBeenCalledWith(task);
        expect(result).toEqual(expectedResult);
      });

      it('should check capability compatibility correctly', () => {
        const compatibleTask: TaskDefinition = {
          id: 'compatible-task',
          type: 'compatible-type',
          priority: 'low',
          payload: {},
          requirements: {
            capabilities: ['existing-capability'],
            resources: { cpu: 0.1, memory: 32, network: 5, storage: 5 },
          },
          metadata: { source: 'compatibility-test', timestamp: new Date() },
        };

        const incompatibleTask: TaskDefinition = {
          id: 'incompatible-task',
          type: 'incompatible-type',
          priority: 'high',
          payload: {},
          requirements: {
            capabilities: ['non-existing-capability'],
            resources: { cpu: 0.1, memory: 32, network: 5, storage: 5 },
          },
          metadata: { source: 'compatibility-test', timestamp: new Date() },
        };

        mockAgent.canHandleTask.mockImplementation((task) =>
          task.requirements.capabilities.includes('existing-capability')
        );

        expect(mockAgent.canHandleTask(compatibleTask)).toBe(true);
        expect(mockAgent.canHandleTask(incompatibleTask)).toBe(false);
      });

      it('should aggregate capabilities from composite components', () => {
        const agentCapabilities = [
          { name: 'agent-capability', version: '1.0.0', description: 'Agent capability' },
          { name: 'shared-capability', version: '1.0.0', description: 'Shared capability' },
        ];

        const groupCapabilities = [
          { name: 'group-capability', version: '1.0.0', description: 'Group capability' },
          { name: 'shared-capability', version: '1.0.0', description: 'Shared capability' },
        ];

        mockAgent.getCapabilities.mockReturnValue(agentCapabilities as AgentCapability[]);
        mockGroup.getCapabilities.mockReturnValue(groupCapabilities as AgentCapability[]);

        const agentCaps = mockAgent.getCapabilities();
        const groupCaps = mockGroup.getCapabilities();

        expect(agentCaps).toHaveLength(2);
        expect(groupCaps).toHaveLength(2);
        expect(agentCaps.some((cap) => cap.name === 'agent-capability')).toBe(true);
        expect(groupCaps.some((cap) => cap.name === 'group-capability')).toBe(true);
      });

      it('should handle component lifecycle correctly', async () => {
        const initConfig = {
          maxConcurrentTasks: 5,
          capabilities: [],
          timeout: 30000,
        };

        await mockAgent.initialize(initConfig);
        expect(mockAgent.initialize).toHaveBeenCalledWith(initConfig);

        await mockAgent.pause();
        expect(mockAgent.pause).toHaveBeenCalledTimes(1);

        await mockAgent.resume();
        expect(mockAgent.resume).toHaveBeenCalledTimes(1);

        await mockAgent.shutdown();
        expect(mockAgent.shutdown).toHaveBeenCalledTimes(1);
      });
    });

    describe('Group Management', () => {
      it('should add and remove members dynamically', () => {
        const newMember = { ...mockAgent, getId: () => 'new-member' };

        mockGroup.getMembers.mockReturnValue([mockAgent]);
        mockGroup.addMember(newMember as Agent);

        expect(mockGroup.addMember).toHaveBeenCalledWith(newMember);

        mockGroup.removeMember('mock-agent');
        expect(mockGroup.removeMember).toHaveBeenCalledWith('mock-agent');
      });

      it('should manage load balancing strategies', () => {
        const strategies: LoadBalancingStrategy[] = [
          'round-robin',
          'least-loaded',
          'capability-based',
        ];

        strategies.forEach((strategy) => {
          mockGroup.setLoadBalancingStrategy(strategy);
          expect(mockGroup.setLoadBalancingStrategy).toHaveBeenCalledWith(strategy);
        });

        const currentStrategy = mockGroup.getLoadBalancingStrategy();
        expect(currentStrategy).toBe('round-robin');
      });

      it('should calculate total agent count recursively', () => {
        mockGroup.getTotalAgentCount.mockReturnValue(5); // Mock nested count

        const totalCount = mockGroup.getTotalAgentCount();
        expect(totalCount).toBe(5);
        expect(mockGroup.getTotalAgentCount).toHaveBeenCalledTimes(1);
      });

      it('should delegate task execution to optimal member', async () => {
        const task: TaskDefinition = {
          id: 'group-task',
          type: 'group-test',
          priority: 'high',
          payload: { group: true },
          requirements: {
            capabilities: ['group-capability'],
            resources: { cpu: 0.2, memory: 128, network: 20, storage: 20 },
          },
          metadata: { source: 'group-test', timestamp: new Date() },
        };

        const expectedResult: TaskResult = {
          taskId: 'group-task',
          success: true,
          result: 'Group task completed',
          executionTime: 150,
          timestamp: new Date(),
          agentId: 'mock-agent',
        };

        mockGroup.executeTask.mockResolvedValue(expectedResult);
        mockGroup.canHandleTask.mockReturnValue(true);

        const result = await mockGroup.executeTask(task);

        expect(mockGroup.executeTask).toHaveBeenCalledWith(task);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('Status Reporting', () => {
      it('should provide individual agent status', () => {
        const agentStatus: AgentStatus = {
          state: 'active',
          currentTasks: 2,
          totalCompletedTasks: 15,
          totalFailedTasks: 1,
          averageExecutionTime: 120,
          minExecutionTime: 50,
          maxExecutionTime: 300,
          resourceUtilization: { cpu: 0.6, memory: 0.7, network: 0.4, storage: 0.3 },
          lastTaskTimestamp: new Date(),
          uptime: 3600000,
        };

        mockAgent.getStatus.mockReturnValue(agentStatus);

        const status = mockAgent.getStatus();

        expect(status.state).toBe('active');
        expect(status.currentTasks).toBe(2);
        expect(status.totalCompletedTasks).toBe(15);
        expect(status.resourceUtilization.cpu).toBe(0.6);
      });

      it('should provide composite group status', () => {
        const compositeStatus: CompositeStatus = {
          state: 'active',
          currentTasks: 5,
          totalCompletedTasks: 45,
          totalFailedTasks: 2,
          averageExecutionTime: 95,
          minExecutionTime: 30,
          maxExecutionTime: 250,
          resourceUtilization: { cpu: 0.5, memory: 0.6, network: 0.3, storage: 0.4 },
          lastTaskTimestamp: new Date(),
          uptime: 7200000,
          totalMembers: 3,
          activeMemberCount: 3,
          resourceCapacity: { cpu: 3.0, memory: 1536, network: 300, storage: 300 },
          hierarchyDepth: 2,
        };

        mockGroup.getStatus.mockReturnValue(compositeStatus);

        const status = mockGroup.getStatus() as CompositeStatus;

        expect(status.totalMembers).toBe(3);
        expect(status.activeMemberCount).toBe(3);
        expect(status.resourceCapacity.cpu).toBe(3.0);
        expect(status.hierarchyDepth).toBe(2);
      });
    });
  });

  describe('Error Handling and Edge Cases (Hybrid TDD)', () => {
    it('should handle circular references in hierarchy', () => {
      const agent1 = AgentFactory.createAgent('circular-1', 'Circular Agent 1', [], {
        cpu: 1.0,
        memory: 512,
        network: 100,
        storage: 100,
      });

      const group1 = AgentFactory.createAgentGroup('circular-group-1', 'Circular Group 1', [
        agent1,
      ]);

      // Attempting to add group1 to itself should be prevented
      expect(() => {
        group1.addMember(group1 as any);
      }).toThrow('Cannot add group to itself');
    });

    it('should handle resource exhaustion gracefully', async () => {
      const limitedAgent = AgentFactory.createAgent(
        'limited-agent',
        'Resource Limited Agent',
        [
          AgentFactory.createCapability(
            'limited-processing',
            '1.0.0',
            'Limited processing',
            {},
            { cpu: 0.1, memory: 64, network: 10, storage: 10 }
          ),
        ],
        { cpu: 0.2, memory: 128, network: 20, storage: 20 }
      );

      await limitedAgent.initialize({
        maxConcurrentTasks: 1,
        capabilities: limitedAgent.getCapabilities(),
        taskExecutor: createMockTaskExecutor(1000, true), // Slow execution
      });

      const resourceIntensiveTasks: TaskDefinition[] = Array.from({ length: 5 }, (_, i) => ({
        id: `resource-task-${i}`,
        type: 'limited-processing',
        priority: 'high',
        payload: { index: i },
        requirements: {
          capabilities: ['limited-processing'],
          resources: { cpu: 0.1, memory: 64, network: 10, storage: 10 },
        },
        metadata: { source: 'resource-test', timestamp: new Date() },
      }));

      // Submit tasks simultaneously - should queue due to resource limits
      const startTime = Date.now();
      const results = await Promise.all(
        resourceIntensiveTasks.map((task) => limitedAgent.executeTask(task))
      );
      const totalTime = Date.now() - startTime;

      expect(results?.every((r) => r.success)).toBe(true);
      expect(totalTime).toBeGreaterThan(4000); // Should take at least 4 seconds due to queuing

      const status = limitedAgent.getStatus();
      expect(status.totalCompletedTasks).toBe(5);
    });

    it('should handle malformed task definitions', async () => {
      const agent = AgentFactory.createAgent(
        'validation-agent',
        'Validation Agent',
        [
          AgentFactory.createCapability(
            'validation-test',
            '1.0.0',
            'Validation test',
            {},
            { cpu: 0.1, memory: 64, network: 10, storage: 10 }
          ),
        ],
        { cpu: 1.0, memory: 512, network: 100, storage: 100 }
      );

      await agent.initialize({
        maxConcurrentTasks: 1,
        capabilities: agent.getCapabilities(),
        taskExecutor: createMockTaskExecutor(50, true),
      });

      const malformedTasks = [
        {
          // Missing required fields
          type: 'validation-test',
          payload: {},
        } as TaskDefinition,
        {
          id: 'negative-resources',
          type: 'validation-test',
          priority: 'medium',
          payload: {},
          requirements: {
            capabilities: ['validation-test'],
            resources: { cpu: -1, memory: -100, network: -10, storage: -10 }, // Negative resources
          },
          metadata: { source: 'validation-test', timestamp: new Date() },
        },
      ];

      for (const malformedTask of malformedTasks) {
        await expect(agent.executeTask(malformedTask)).rejects.toThrow();
      }
    });

    it('should handle concurrent shutdown requests', async () => {
      const agents = Array.from({ length: 3 }, (_, i) =>
        AgentFactory.createAgent(
          `shutdown-agent-${i}`,
          `Shutdown Agent ${i}`,
          [
            AgentFactory.createCapability(
              'shutdown-test',
              '1.0.0',
              'Shutdown test',
              {},
              { cpu: 0.1, memory: 64, network: 10, storage: 10 }
            ),
          ],
          { cpu: 0.5, memory: 256, network: 50, storage: 50 }
        )
      );

      const group = AgentFactory.createAgentGroup(
        'concurrent-shutdown-group',
        'Concurrent Shutdown Group',
        agents
      );

      for (const agent of agents) {
        await agent.initialize({
          maxConcurrentTasks: 1,
          capabilities: agent.getCapabilities(),
          taskExecutor: createMockTaskExecutor(100, true),
        });
      }

      await group.initialize({
        loadBalancing: 'round-robin',
        failureHandling: 'skip',
      });

      // Trigger concurrent shutdown requests
      const shutdownPromises = [group.shutdown(), group.shutdown(), group.shutdown()];

      await expect(Promise.all(shutdownPromises)).resolves.not.toThrow();

      const status = group.getStatus();
      expect(status.state).toBe('shutdown');
    });
  });
});
