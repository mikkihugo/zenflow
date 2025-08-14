/**
 * @file Strategy Pattern Tests
 * Hybrid TDD approach: London TDD for coordination logic, Classical TDD for algorithms
 */

import {
  HierarchicalStrategy,
  MeshStrategy,
  RingStrategy,
  StarStrategy,
  StrategyFactory,
  SwarmCoordinator,
} from '../../coordination/swarm/core/strategy.ts';

// Mock agent type for testing
interface MockAgent {
  id: string;
  capabilities: string[];
  status: 'idle' | 'busy';
}

describe('Strategy Pattern Implementation', () => {
  // Classical TDD - Test actual strategy algorithms and results
  describe('Strategy Algorithms (Classical TDD)', () => {
    const mockAgents: MockAgent[] = [
      { id: 'agent-1', capabilities: ['task-a', 'task-b'], status: 'idle' },
      { id: 'agent-2', capabilities: ['task-b', 'task-c'], status: 'idle' },
      { id: 'agent-3', capabilities: ['task-a', 'task-c'], status: 'idle' },
    ];

    const mockContext: CoordinationContext = {
      swarmId: 'test-swarm',
      timestamp: new Date(),
      resources: { cpu: 0.8, memory: 0.7, network: 0.6, storage: 0.9 },
      constraints: {
        maxLatency: 500,
        minReliability: 0.9,
        resourceLimits: { cpu: 1.0, memory: 1.0, network: 1.0, storage: 1.0 },
        securityLevel: 'medium',
      },
      history: [],
    };

    describe('MeshStrategy', () => {
      let strategy: MeshStrategy;

      beforeEach(() => {
        strategy = new MeshStrategy();
      });

      it('should create full mesh connections for all agents', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        expect(result?.success).toBe(true);
        expect(result?.topology).toBe('mesh');
        expect(result?.connections).toBeDefined();

        // Verify full connectivity: each agent connects to all others
        Object.entries(result?.connections!).forEach(
          ([agentId, connections]) => {
            expect(connections).toHaveLength(mockAgents.length - 1);
            expect(connections).not.toContain(agentId); // Agent doesn't connect to itself
          }
        );
      });

      it('should calculate performance metrics accurately', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        expect(result?.performance).toBeDefined();
        expect(result?.performance?.executionTime).toBeGreaterThan(0);
        expect(result?.performance?.coordinationEfficiency).toBeGreaterThan(0);
        expect(result?.performance?.coordinationEfficiency).toBeLessThanOrEqual(
          1
        );
      });

      it('should have appropriate latency for mesh topology', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        // Mesh should have low latency but scale with agent count
        expect(result?.latency).toBeGreaterThan(50); // Base latency
        expect(result?.latency).toBeLessThan(200); // Should be reasonable for 3 agents
      });

      it('should generate recommendations for large swarms', async () => {
        const largeAgentSet = Array.from({ length: 25 }, (_, i) => ({
          id: `agent-${i}`,
          capabilities: ['task-a'],
          status: 'idle' as const,
        }));

        const result = await strategy.coordinate(largeAgentSet, mockContext);

        expect(result?.recommendations).toBeDefined();
        expect(result?.recommendations?.length).toBeGreaterThan(0);
        expect(result?.recommendations?.[0]).toContain('hierarchical');
      });
    });

    describe('HierarchicalStrategy', () => {
      let strategy: HierarchicalStrategy;

      beforeEach(() => {
        strategy = new HierarchicalStrategy();
      });

      it('should create hierarchical leadership structure', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        expect(result?.success).toBe(true);
        expect(result?.topology).toBe('hierarchical');
        expect(result?.leadership).toBeDefined();
        expect(result?.leadership?.leaders.length).toBeGreaterThan(0);
        expect(result?.leadership?.hierarchy).toBeDefined();
        expect(result?.leadership?.maxDepth).toBeGreaterThan(0);
      });

      it('should select leaders based on capabilities', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        // The agent with most capabilities should be selected as leader
        const topAgent = mockAgents.reduce((best, current) =>
          current?.capabilities.length > best.capabilities.length
            ? current
            : best
        );

        expect(result?.leadership?.leaders).toContain(topAgent.id);
      });

      it('should have latency proportional to hierarchy depth', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        const expectedMinLatency = 50 + result?.leadership?.maxDepth * 25;
        expect(result?.latency).toBeGreaterThanOrEqual(expectedMinLatency);
      });
    });

    describe('RingStrategy', () => {
      let strategy: RingStrategy;

      beforeEach(() => {
        strategy = new RingStrategy();
      });

      it('should create circular connections', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        expect(result?.success).toBe(true);
        expect(result?.topology).toBe('ring');
        expect(result?.connections).toBeDefined();

        // Each agent should connect to exactly one other agent
        Object.values(result?.connections!).forEach((connections) => {
          expect(connections).toHaveLength(1);
        });

        // Verify circular nature - should be able to traverse all agents
        const visited = new Set<string>();
        let current = mockAgents[0]?.id;

        while (!visited.has(current)) {
          visited.add(current);
          current = result?.connections?.[current][0] as any;
        }

        expect(visited.size).toBe(mockAgents.length);
      });

      it('should have latency proportional to ring size', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        const expectedLatency = 50 + mockAgents.length * 10;
        expect(result?.latency).toBe(expectedLatency);
      });
    });

    describe('StarStrategy', () => {
      let strategy: StarStrategy;

      beforeEach(() => {
        strategy = new StarStrategy();
      });

      it('should select hub based on capabilities', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        expect(result?.success).toBe(true);
        expect(result?.topology).toBe('star');
        expect(result?.leadership).toBeDefined();
        expect(result?.leadership?.leaders).toHaveLength(1);

        // Hub should be the agent with most capabilities
        const expectedHub = mockAgents.reduce((best, current) =>
          current?.capabilities.length > best.capabilities.length
            ? current
            : best
        );

        expect(result?.leadership?.leaders[0]).toBe(expectedHub.id);
      });

      it('should create star topology connections', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        const hub = result?.leadership?.leaders[0];
        const nonHubAgents = mockAgents.filter((a) => a.id !== hub);

        // Hub connects to all others
        expect(result?.connections?.[hub]).toHaveLength(nonHubAgents.length);

        // Others connect only to hub
        nonHubAgents.forEach((agent) => {
          expect(result?.connections?.[agent.id]).toEqual([hub]);
        });
      });

      it('should have low latency due to centralized communication', async () => {
        const result = await strategy.coordinate(mockAgents, mockContext);

        expect(result?.latency).toBe(30); // Fixed low latency for star topology
      });
    });
  });

  // London TDD - Test strategy coordination and interactions
  describe('Strategy Coordination (London TDD)', () => {
    let swarmCoordinator: SwarmCoordinator;
    let mockStrategy: vi.Mocked<any>;

    beforeEach(() => {
      mockStrategy = {
        coordinate: vi.fn(),
        getMetrics: vi.fn(),
        getTopologyType: vi.fn(),
        validateContext: vi.fn(),
        optimize: vi.fn(),
      };

      swarmCoordinator = new SwarmCoordinator(mockStrategy);
    });

    it('should delegate coordination to the active strategy', async () => {
      const mockAgents: MockAgent[] = [
        { id: 'agent-1', capabilities: [], status: 'idle' },
      ];
      const mockResult = {
        topology: 'mesh' as SwarmTopology,
        performance: {
          executionTime: 100,
          messageCount: 2,
          coordinationEfficiency: 0.9,
          resourceUtilization: {
            cpu: 0.1,
            memory: 0.1,
            network: 0.1,
            storage: 0.1,
          },
        },
        latency: 50,
        success: true,
      };

      mockStrategy.coordinate.mockResolvedValue(mockResult);

      const result = await swarmCoordinator.executeCoordination(mockAgents);

      expect(mockStrategy.coordinate).toHaveBeenCalledTimes(1);
      expect(mockStrategy.coordinate).toHaveBeenCalledWith(
        mockAgents,
        expect.objectContaining({
          swarmId: expect.any(String),
          timestamp: expect.any(Date),
          resources: expect.any(Object),
          constraints: expect.any(Object),
        })
      );
      expect(result).toEqual(mockResult);
    });

    it('should switch strategies correctly', () => {
      const newMockStrategy = {
        coordinate: vi.fn(),
        getMetrics: vi.fn(),
        getTopologyType: vi.fn().mockReturnValue('hierarchical'),
        validateContext: vi.fn(),
        optimize: vi.fn(),
      };

      swarmCoordinator.setStrategy(newMockStrategy);

      expect(swarmCoordinator.getStrategy()).toBe(newMockStrategy);
    });

    it('should record coordination history', async () => {
      const mockAgents: MockAgent[] = [
        { id: 'agent-1', capabilities: [], status: 'idle' },
      ];
      mockStrategy.coordinate.mockResolvedValue({
        topology: 'mesh' as SwarmTopology,
        performance: {
          executionTime: 100,
          messageCount: 2,
          coordinationEfficiency: 0.9,
          resourceUtilization: {
            cpu: 0.1,
            memory: 0.1,
            network: 0.1,
            storage: 0.1,
          },
        },
        latency: 50,
        success: true,
      });

      await swarmCoordinator.executeCoordination(mockAgents);

      const history = swarmCoordinator.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]?.action).toBe('coordinate');
      expect(history[0]?.result).toBe('success');
    });

    it('should handle coordination failures gracefully', async () => {
      const mockAgents: MockAgent[] = [
        { id: 'agent-1', capabilities: [], status: 'idle' },
      ];
      const error = new Error('Coordination failed');
      mockStrategy.coordinate.mockRejectedValue(error);

      await expect(
        swarmCoordinator.executeCoordination(mockAgents)
      ).rejects.toThrow('Coordination failed');

      const history = swarmCoordinator.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]?.result).toBe('failure');
    });

    it('should optimize strategy periodically', async () => {
      const mockAgents: MockAgent[] = [
        { id: 'agent-1', capabilities: [], status: 'idle' },
      ];
      mockStrategy.coordinate.mockResolvedValue({
        topology: 'mesh' as SwarmTopology,
        performance: {
          executionTime: 100,
          messageCount: 2,
          coordinationEfficiency: 0.9,
          resourceUtilization: {
            cpu: 0.1,
            memory: 0.1,
            network: 0.1,
            storage: 0.1,
          },
        },
        latency: 50,
        success: true,
      });

      // Execute 10 coordinations to trigger optimization
      for (let i = 0; i < 10; i++) {
        await swarmCoordinator.executeCoordination(mockAgents);
      }

      expect(mockStrategy.optimize).toHaveBeenCalled();
    });
  });

  describe('StrategyFactory (Classical TDD)', () => {
    it('should create correct strategy instances', () => {
      const meshStrategy = StrategyFactory.createStrategy('mesh');
      const hierarchicalStrategy =
        StrategyFactory.createStrategy('hierarchical');
      const ringStrategy = StrategyFactory.createStrategy('ring');
      const starStrategy = StrategyFactory.createStrategy('star');

      expect(meshStrategy).toBeInstanceOf(MeshStrategy);
      expect(hierarchicalStrategy).toBeInstanceOf(HierarchicalStrategy);
      expect(ringStrategy).toBeInstanceOf(RingStrategy);
      expect(starStrategy).toBeInstanceOf(StarStrategy);
    });

    it('should throw error for unknown topology', () => {
      expect(() => {
        StrategyFactory.createStrategy('unknown' as SwarmTopology);
      }).toThrow('Unknown topology: unknown');
    });

    it('should return all available strategies', () => {
      const strategies = StrategyFactory.getAllStrategies();

      expect(strategies).toHaveLength(4);
      expect(strategies.some((s) => s instanceof MeshStrategy)).toBe(true);
      expect(strategies.some((s) => s instanceof HierarchicalStrategy)).toBe(
        true
      );
      expect(strategies.some((s) => s instanceof RingStrategy)).toBe(true);
      expect(strategies.some((s) => s instanceof StarStrategy)).toBe(true);
    });
  });

  describe('Auto-Strategy Selection (Hybrid TDD)', () => {
    let swarmCoordinator: SwarmCoordinator;

    beforeEach(() => {
      const initialStrategy = new MeshStrategy();
      swarmCoordinator = new SwarmCoordinator(initialStrategy);
    });

    it('should select optimal strategy based on agent count and context', async () => {
      // Mock different scenarios
      const smallSwarmAgents = Array.from({ length: 5 }, (_, i) => ({
        id: `agent-${i}`,
        capabilities: ['task-a'],
        status: 'idle' as const,
      }));

      const largeSwarmAgents = Array.from({ length: 60 }, (_, i) => ({
        id: `agent-${i}`,
        capabilities: ['task-a'],
        status: 'idle' as const,
      }));

      const highNetworkContext: CoordinationContext = {
        swarmId: 'test',
        timestamp: new Date(),
        resources: { cpu: 0.8, memory: 0.8, network: 0.9, storage: 0.8 },
        constraints: {
          maxLatency: 100,
          minReliability: 0.95,
          resourceLimits: { cpu: 1.0, memory: 1.0, network: 1.0, storage: 1.0 },
          securityLevel: 'high',
        },
        history: [],
      };

      const lowNetworkContext: CoordinationContext = {
        ...highNetworkContext,
        resources: { cpu: 0.8, memory: 0.8, network: 0.3, storage: 0.8 },
      };

      // Test auto-selection logic
      const smallSwarmStrategy = await swarmCoordinator.autoSelectStrategy(
        smallSwarmAgents,
        highNetworkContext
      );
      const largeSwarmStrategy = await swarmCoordinator.autoSelectStrategy(
        largeSwarmAgents,
        highNetworkContext
      );
      const lowNetworkStrategy = await swarmCoordinator.autoSelectStrategy(
        smallSwarmAgents,
        lowNetworkContext
      );

      // Verify appropriate strategy selection
      expect(smallSwarmStrategy.getTopologyType()).toBe('star'); // Small swarms benefit from star
      expect(largeSwarmStrategy.getTopologyType()).toBe('mesh'); // Large swarms with good network use mesh
      expect(lowNetworkStrategy.getTopologyType()).toBe('hierarchical'); // Low network uses hierarchical
    });
  });

  describe('Strategy Validation (London TDD)', () => {
    it('should validate context before coordination', async () => {
      const strategy = new MeshStrategy();
      const mockAgents: MockAgent[] = [
        { id: 'agent-1', capabilities: [], status: 'idle' },
      ];

      const invalidContext: CoordinationContext = {
        swarmId: 'test',
        timestamp: new Date(),
        resources: { cpu: 0.1, memory: 0.1, network: 0.1, storage: 0.1 }, // Low network for mesh
        constraints: {
          maxLatency: 50, // Too low for mesh
          minReliability: 0.9,
          resourceLimits: { cpu: 1.0, memory: 1.0, network: 1.0, storage: 1.0 },
          securityLevel: 'medium',
        },
        history: [],
      };

      await expect(
        strategy.coordinate(mockAgents, invalidContext)
      ).rejects.toThrow('Invalid coordination context for mesh strategy');
    });
  });

  describe('Performance Benchmarks (Classical TDD)', () => {
    it('should meet performance requirements for different topologies', async () => {
      const agents = Array.from({ length: 10 }, (_, i) => ({
        id: `agent-${i}`,
        capabilities: ['task-a'],
        status: 'idle' as const,
      }));

      const context: CoordinationContext = {
        swarmId: 'benchmark',
        timestamp: new Date(),
        resources: { cpu: 0.8, memory: 0.8, network: 0.8, storage: 0.8 },
        constraints: {
          maxLatency: 1000,
          minReliability: 0.9,
          resourceLimits: { cpu: 1.0, memory: 1.0, network: 1.0, storage: 1.0 },
          securityLevel: 'medium',
        },
        history: [],
      };

      // Test all strategies for performance
      const strategies = StrategyFactory.getAllStrategies();

      for (const strategy of strategies) {
        const startTime = Date.now();
        const result = await strategy.coordinate(agents, context);
        const actualExecutionTime = Date.now() - startTime;

        // Performance assertions
        expect(result?.success).toBe(true);
        expect(actualExecutionTime).toBeLessThan(1000); // Should complete within 1 second
        expect(result?.performance?.coordinationEfficiency).toBeGreaterThan(
          0.5
        );
        expect(result?.latency).toBeLessThan(500); // Reasonable latency
      }
    });
  });
});
