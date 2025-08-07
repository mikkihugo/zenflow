/**
 * @file Complete Auto-Swarm Pipeline Integration Test
 *
 * Tests the full integration pipeline for Sub-task 2.3 requirements
 */

import { jest } from '@jest/globals';

describe('Complete Auto-Swarm Pipeline Integration', () => {
  let mockMemoryStore: any;
  let mockAgui: any;

  beforeEach(() => {
    mockMemoryStore = {
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    };

    mockAgui = {
      askQuestion: vi.fn().mockResolvedValue('1'),
      askBatchQuestions: vi.fn(),
      showProgress: vi.fn(),
      showMessage: vi.fn(),
    };
  });

  it('should complete the full auto-swarm creation pipeline', async () => {
    // Test all the integration points mentioned in the problem statement

    // 1. Test Swarm Coordinator Initialization (FIXED)
    const { createPublicSwarmCoordinator } = await import('../../coordination/public-api');
    const { HiveSwarmCoordinator } = await import('../../coordination/hive-swarm-sync');
    const { EventBus } = await import('../../core/event-bus');

    const eventBus = EventBus.getInstance();
    const swarmCoordinator = await createPublicSwarmCoordinator();
    const hiveSync = new HiveSwarmCoordinator(eventBus);

    expect(swarmCoordinator).toBeDefined();
    expect(hiveSync).toBeDefined();
    expect(typeof swarmCoordinator.initialize).toBe('function');

    // 2. Test Auto-Swarm Factory Configuration (ENHANCED)
    const { AutoSwarmFactory } = await import('../../coordination/discovery/auto-swarm-factory');

    const testDomains = new Map([
      [
        'database',
        {
          name: 'database',
          path: '/project/db',
          files: Array.from({ length: 15 }, (_, i) => `model${i}.ts`),
          confidence: { overall: 0.85, domainClarity: 0.9, consistency: 0.8 },
          suggestedConcepts: ['database', 'models', 'queries'],
          technologies: ['typescript', 'postgresql'],
          relatedDomains: ['api'],
          validations: [],
          research: [],
          refinementHistory: [],
        },
      ],
      [
        'api',
        {
          name: 'api',
          path: '/project/api',
          files: Array.from({ length: 8 }, (_, i) => `route${i}.ts`),
          confidence: { overall: 0.9, domainClarity: 0.95, consistency: 0.85 },
          suggestedConcepts: ['api', 'server', 'endpoints'],
          technologies: ['typescript', 'express'],
          relatedDomains: ['database'],
          validations: [],
          research: [],
          refinementHistory: [],
        },
      ],
    ]);

    // Dynamic resource constraints (as implemented in discover.ts)
    const calculateResourceConstraints = () => {
      const baseCpuLimit = Math.min(8, Math.max(2, testDomains.size * 2));
      const baseMemoryLimit = testDomains.size < 3 ? '2GB' : testDomains.size < 6 ? '4GB' : '8GB';
      const baseMaxAgents = Math.min(10 * testDomains.size, 50);

      return {
        maxTotalAgents: baseMaxAgents,
        memoryLimit: baseMemoryLimit,
        cpuLimit: baseCpuLimit,
      };
    };

    const factory = new AutoSwarmFactory(swarmCoordinator, hiveSync, mockMemoryStore, mockAgui, {
      enableHumanValidation: false,
      maxSwarmsPerDomain: 1,
      resourceConstraints: calculateResourceConstraints(),
    });

    // 3. Test Swarm Creation Pipeline (WORKING)
    const events: any[] = [];
    factory.on('factory:start', (event) => events.push({ type: 'start', ...event }));
    factory.on('swarm:created', (event) => events.push({ type: 'created', ...event }));
    factory.on('swarm:initialized', (event) => events.push({ type: 'initialized', ...event }));
    factory.on('swarm:init-error', (event) => events.push({ type: 'init-error', ...event }));
    factory.on('factory:complete', (event) => events.push({ type: 'complete', ...event }));

    const swarmConfigs = await factory.createSwarmsForDomains(testDomains);

    // 4. Verify Success Criteria
    expect(swarmConfigs.length).toBeGreaterThan(0); // ✓ Swarms created for high-confidence domains

    // ✓ Appropriate topologies selected
    const databaseSwarm = swarmConfigs.find((c) => c.domain === 'database');
    const apiSwarm = swarmConfigs.find((c) => c.domain === 'api');

    expect(databaseSwarm?.topology.type).toBe('hierarchical'); // Database complexity
    expect(apiSwarm?.topology.type).toBe('star'); // Centralized API service

    // ✓ Resource constraints properly enforced
    const totalAgents = swarmConfigs.reduce(
      (sum, config) => sum + config.agents.reduce((agentSum, agent) => agentSum + agent.count, 0),
      0
    );
    expect(totalAgents).toBeLessThanOrEqual(calculateResourceConstraints().maxTotalAgents);

    // ✓ Event system provides proper creation feedback
    expect(events.some((e) => e.type === 'start')).toBe(true);
    expect(events.some((e) => e.type === 'created')).toBe(true);
    expect(events.some((e) => e.type === 'initialized')).toBe(true);
    expect(events.some((e) => e.type === 'complete')).toBe(true);

    // Verify appropriate agent configurations
    expect(databaseSwarm?.agents.some((a) => a.type === 'data-specialist')).toBe(true);
    expect(apiSwarm?.agents.some((a) => a.type === 'api-specialist')).toBe(true);
    expect(swarmConfigs.every((c) => c.agents.some((a) => a.type === 'coordinator'))).toBe(true);

    // 5. Test Expected Swarm Configuration Examples
    // Database domain: Hierarchical topology with specialized data agents
    expect(databaseSwarm?.topology.type).toBe('hierarchical');
    expect(databaseSwarm?.agents.some((a) => a.type === 'data-specialist')).toBe(true);

    // API domain: Star topology with API gateway agent
    expect(apiSwarm?.topology.type).toBe('star');
    expect(apiSwarm?.agents.some((a) => a.type === 'api-specialist')).toBe(true);
  });

  it('should handle error scenarios gracefully', async () => {
    // Test failed swarm creation handling
    const { AutoSwarmFactory } = await import('../../coordination/discovery/auto-swarm-factory');
    const { createPublicSwarmCoordinator } = await import('../../coordination/public-api');
    const { HiveSwarmCoordinator } = await import('../../coordination/hive-swarm-sync');
    const { EventBus } = await import('../../core/event-bus');

    const eventBus = EventBus.getInstance();
    const swarmCoordinator = await createPublicSwarmCoordinator();
    const hiveSync = new HiveSwarmCoordinator(eventBus);

    // Mock coordinator to fail for one domain
    const originalInitialize = swarmCoordinator.initialize;
    swarmCoordinator.initialize = vi.fn().mockImplementation(async (config) => {
      if (config.domain === 'failing-domain') {
        throw new Error('Initialization failed');
      }
      return originalInitialize.call(swarmCoordinator, config);
    });

    const factory = new AutoSwarmFactory(swarmCoordinator, hiveSync, mockMemoryStore, mockAgui, {
      enableHumanValidation: false,
      resourceConstraints: {
        maxTotalAgents: 20,
        memoryLimit: '4GB',
        cpuLimit: 8,
      },
    });

    const testDomains = new Map([
      [
        'good-domain',
        {
          name: 'good-domain',
          path: '/project/good',
          files: ['good.ts'],
          confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
          suggestedConcepts: ['good'],
          technologies: ['typescript'],
          relatedDomains: [],
          validations: [],
          research: [],
          refinementHistory: [],
        },
      ],
      [
        'failing-domain',
        {
          name: 'failing-domain',
          path: '/project/bad',
          files: ['bad.ts'],
          confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
          suggestedConcepts: ['bad'],
          technologies: ['typescript'],
          relatedDomains: [],
          validations: [],
          research: [],
          refinementHistory: [],
        },
      ],
    ]);

    const errorEvents: any[] = [];
    factory.on('swarm:init-error', (event) => errorEvents.push(event));

    // ✓ Failed swarm creation handled gracefully
    const swarmConfigs = await factory.createSwarmsForDomains(testDomains);

    expect(swarmConfigs).toHaveLength(1); // Only successful domain
    expect(swarmConfigs[0].domain).toBe('good-domain');
    expect(errorEvents).toHaveLength(1); // Error event for failed domain
    expect(errorEvents[0].config.domain).toBe('failing-domain');
  });

  it('should validate resource constraints properly', async () => {
    // Test resource constraint validation as mentioned in requirements
    const { AutoSwarmFactory } = await import('../../coordination/discovery/auto-swarm-factory');
    const { createPublicSwarmCoordinator } = await import('../../coordination/public-api');
    const { HiveSwarmCoordinator } = await import('../../coordination/hive-swarm-sync');
    const { EventBus } = await import('../../core/event-bus');

    const eventBus = EventBus.getInstance();
    const swarmCoordinator = await createPublicSwarmCoordinator();
    const hiveSync = new HiveSwarmCoordinator(eventBus);

    // Create factory with very restrictive constraints
    const factory = new AutoSwarmFactory(swarmCoordinator, hiveSync, mockMemoryStore, mockAgui, {
      enableHumanValidation: false,
      resourceConstraints: {
        maxTotalAgents: 2, // Very low limit
        memoryLimit: '1GB',
        cpuLimit: 1,
      },
    });

    const largeDomains = new Map([
      [
        'domain1',
        {
          name: 'domain1',
          path: '/project/domain1',
          files: Array.from({ length: 50 }, (_, i) => `file${i}.ts`),
          confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
          suggestedConcepts: ['complex'],
          technologies: ['typescript'],
          relatedDomains: [],
          validations: [],
          research: [],
          refinementHistory: [],
        },
      ],
      [
        'domain2',
        {
          name: 'domain2',
          path: '/project/domain2',
          files: Array.from({ length: 50 }, (_, i) => `file${i}.ts`),
          confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
          suggestedConcepts: ['complex'],
          technologies: ['typescript'],
          relatedDomains: [],
          validations: [],
          research: [],
          refinementHistory: [],
        },
      ],
    ]);

    // Should throw error due to resource constraints
    await expect(factory.createSwarmsForDomains(largeDomains)).rejects.toThrow('exceeds limit');
  });
});
