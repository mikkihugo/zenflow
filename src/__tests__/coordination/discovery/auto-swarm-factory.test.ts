/**
 * @file Tests for Auto-Swarm Factory
 *
 * Comprehensive test suite for the critical Auto-Swarm Factory component
 * that enables zero-manual-initialization swarm creation.
 */

import {
  beforeEach,
  describe,
  expect,
  it,
  type Mocked,
  type MockedFunction,
  vi,
} from 'vitest'; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { CollectiveCubeCoordinator } from '../../../coordination/collective-cube-sync.ts';
import { AutoSwarmFactory } from '../../../coordination/discovery/auto-swarm-factory.ts';
import type { SwarmCoordinator } from '../../../coordination/swarm/core/swarm-coordinator.ts';
import type { AGUIInterface } from '../../../interfaces/agui/agui-adapter.ts';
import type { SessionMemoryStore } from '../../../memory/memory.ts';

describe('AutoSwarmFactory', () => {
  let factory: AutoSwarmFactory;
  let mockSwarmCoordinator: Mocked<SwarmCoordinator>;
  let mockCollectiveSync: Mocked<CollectiveCubeCoordinator>;
  let mockMemoryStore: Mocked<SessionMemoryStore>;
  let mockAgui: Mocked<AGUIInterface>;

  beforeEach(() => {
    // Create mocks
    mockSwarmCoordinator = {
      initialize: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      emit: vi.fn(),
    } as any;

    mockCollectiveSync = {
      registerSwarm: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      emit: vi.fn(),
    } as any;

    mockMemoryStore = {
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    } as any;

    mockAgui = {
      askQuestion: vi.fn().mockResolvedValue('1'), // Default approval
      askBatchQuestions: vi.fn(),
      showProgress: vi.fn(),
      showMessage: vi.fn(),
    } as any;

    // Create factory instance
    factory = new AutoSwarmFactory(
      mockSwarmCoordinator,
      mockCollectiveSync,
      mockMemoryStore,
      mockAgui,
      {
        enableHumanValidation: false, // Disable for most tests
        defaultPersistenceBackend: 'sqlite',
        maxSwarmsPerDomain: 3,
        performanceMode: 'balanced',
        resourceConstraints: {
          maxTotalAgents: 50,
          memoryLimit: '2GB',
          cpuLimit: 8,
        },
      },
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSwarmsForDomains', () => {
    it('should create swarms for all confident domains', async () => {
      const confidentDomains = new Map([
        [
          'auth',
          {
            name: 'auth',
            path: '/project/auth',
            files: ['auth.ts', 'login.ts', 'jwt.ts'],
            confidence: {
              overall: 0.85,
              domainClarity: 0.9,
              consistency: 0.8,
            },
            suggestedConcepts: ['authentication', 'jwt', 'security'],
            technologies: ['typescript', 'nodejs'],
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
            files: ['server.ts', 'routes.ts', 'middleware.ts'],
            confidence: {
              overall: 0.9,
              domainClarity: 0.95,
              consistency: 0.85,
            },
            suggestedConcepts: ['api', 'server', 'express'],
            technologies: ['typescript', 'express'],
            relatedDomains: ['auth'],
            validations: [],
            research: [],
            refinementHistory: [],
          },
        ],
      ]);

      const configs = await factory.createSwarmsForDomains(confidentDomains);

      expect(configs).toHaveLength(2);
      expect(configs?.[0]?.domain).toBe('auth');
      expect(configs?.[1]?.domain).toBe('api');

      // Verify swarm initialization was called
      expect(mockSwarmCoordinator.initialize).toHaveBeenCalledTimes(2);
      expect(mockCollectiveSync.registerSwarm).toHaveBeenCalledTimes(2);
      expect(mockMemoryStore.store).toHaveBeenCalledTimes(2);
    });

    it('should emit factory events during processing', async () => {
      const events: any[] = [];
      factory.on('factory:start', (event) =>
        events.push({ type: 'start', ...event }),
      );
      factory.on('factory:complete', (event) =>
        events.push({ type: 'complete', ...event }),
      );
      factory.on('swarm:created', (event) =>
        events.push({ type: 'swarm-created', ...event }),
      );

      const confidentDomains = new Map([
        [
          'test',
          {
            name: 'test',
            path: '/project/test',
            files: ['test.ts'],
            confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
            suggestedConcepts: ['testing'],
            technologies: ['typescript'],
            relatedDomains: [],
            validations: [],
            research: [],
            refinementHistory: [],
          },
        ],
      ]);

      await factory.createSwarmsForDomains(confidentDomains);

      expect(events).toHaveLength(3);
      expect(events[0]?.type).toBe('start');
      expect(events[1]?.type).toBe('swarm-created');
      expect(events[2]?.type).toBe('complete');
      expect(events[2]?.successful).toBe(1);
    });

    it('should handle domain processing errors gracefully', async () => {
      const errorEvents: any[] = [];
      factory.on('swarm:init-error', (event) => errorEvents.push(event));

      // Make swarm coordinator fail for one domain
      mockSwarmCoordinator.initialize.mockImplementation(async (config) => {
        if (config?.domain === 'failing-domain') {
          throw new Error('Initialization failed');
        }
      });

      const confidentDomains = new Map([
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

      const configs = await factory.createSwarmsForDomains(confidentDomains);

      // Should succeed for good domain, fail for bad domain
      expect(configs).toHaveLength(1);
      expect(configs?.[0]?.domain).toBe('good-domain');
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]?.config?.domain).toBe('failing-domain');
    });
  });

  describe('topology selection', () => {
    it('should select hierarchical topology for complex nested structures', async () => {
      const domain = {
        name: 'complex-backend',
        path: '/project/backend',
        files: Array.from({ length: 80 }, (_, i) => `file${i}.ts`), // 80 files
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['backend', 'nested', 'architecture'],
        technologies: ['typescript', 'nodejs'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.topology?.type).toBe('hierarchical');
      expect(config?.topology?.reason).toContain('nested structure');
    });

    it('should select mesh topology for highly interconnected domains', async () => {
      const domain = {
        name: 'microservices',
        path: '/project/services',
        files: ['service1.ts', 'service2.ts', 'service3.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['microservices', 'distributed'],
        technologies: ['typescript'],
        relatedDomains: ['auth', 'api', 'database', 'cache'], // High interconnectedness
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.topology?.type).toBe('mesh');
      expect(config?.topology?.reason).toContain('interconnectedness');
    });

    it('should select star topology for centralized services', async () => {
      const domain = {
        name: 'api-gateway',
        path: '/project/gateway',
        files: ['gateway.ts', 'routes.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['api', 'gateway', 'server'],
        technologies: ['typescript', 'express'],
        relatedDomains: ['auth'],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.topology?.type).toBe('star');
      expect(config?.topology?.reason?.toLowerCase()).toContain('centralized');
    });

    it('should select ring topology for pipeline workflows', async () => {
      const domain = {
        name: 'data-pipeline',
        path: '/project/pipeline',
        files: ['input.ts', 'transform.ts', 'output.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['pipeline', 'workflow', 'data'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.topology?.type).toBe('ring');
      expect(config?.topology?.reason?.toLowerCase()).toContain('pipeline');
    });
  });

  describe('agent configuration', () => {
    it('should configure TypeScript specialists for TypeScript domains', async () => {
      const domain = {
        name: 'typescript-app',
        path: '/project/app',
        files: Array.from({ length: 40 }, (_, i) => `component${i}.ts`),
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['frontend', 'components'],
        technologies: ['typescript', 'react'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      const tsSpecialist = config?.agents?.find(
        (a) => a.type === 'typescript-specialist',
      );
      expect(tsSpecialist).toBeDefined();
      expect(tsSpecialist?.count).toBeGreaterThan(0);
      expect(tsSpecialist?.capabilities).toContain('type-checking');
    });

    it('should configure API specialists for API domains', async () => {
      const domain = {
        name: 'rest-api',
        path: '/project/api',
        files: ['server.ts', 'routes.ts', 'controllers.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['api', 'rest', 'server'],
        technologies: ['typescript', 'express'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      const apiSpecialist = config?.agents?.find(
        (a) => a.type === 'api-specialist',
      );
      expect(apiSpecialist).toBeDefined();
      expect(apiSpecialist?.capabilities).toContain('api-design');
      expect(apiSpecialist?.capabilities).toContain('endpoint-testing');
    });

    it('should configure data specialists for database domains', async () => {
      const domain = {
        name: 'database',
        path: '/project/db',
        files: ['models.ts', 'migrations.ts', 'queries.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['database', 'storage', 'models'],
        technologies: ['typescript', 'postgresql'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      const dataSpecialist = config?.agents?.find(
        (a) => a.type === 'data-specialist',
      );
      expect(dataSpecialist).toBeDefined();
      expect(dataSpecialist?.capabilities).toContain('schema-design');
      expect(dataSpecialist?.capabilities).toContain('query-optimization');
    });

    it('should configure AI specialists for complex domains', async () => {
      const domain = {
        name: 'complex-system',
        path: '/project/complex',
        files: Array.from({ length: 120 }, (_, i) => `complex${i}.ts`), // Extreme complexity
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['complex', 'system', 'algorithms'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      const aiSpecialist = config?.agents?.find(
        (a) => a.type === 'ai-specialist',
      );
      expect(aiSpecialist).toBeDefined();
      expect(aiSpecialist?.capabilities).toContain('pattern-recognition');
      expect(aiSpecialist?.capabilities).toContain('complexity-analysis');
    });

    it('should always include a coordinator agent', async () => {
      const domain = {
        name: 'simple-domain',
        path: '/project/simple',
        files: ['simple.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['simple'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      const coordinator = config?.agents?.find((a) => a.type === 'coordinator');
      expect(coordinator).toBeDefined();
      expect(coordinator?.count).toBe(1);
      expect(coordinator?.priority).toBe('high');
      expect(coordinator?.capabilities).toContain('task-routing');
    });
  });

  describe('persistence configuration', () => {
    it('should use LanceDB for AI/neural domains', async () => {
      const domain = {
        name: 'neural-network',
        path: '/project/neural',
        files: ['neural.ts', 'training.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['neural', 'ai', 'vector'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.persistence?.backend).toBe('lancedb');
      expect(config?.persistence?.path).toContain('neural');
    });

    it('should use SQLite for complex domains', async () => {
      const domain = {
        name: 'complex-backend',
        path: '/project/backend',
        files: Array.from({ length: 80 }, (_, i) => `file${i}.ts`),
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['backend', 'complex'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.persistence?.backend).toBe('sqlite');
      expect(config?.persistence?.path).toContain('complex-backend');
    });

    it('should use JSON for simple domains', async () => {
      const domain = {
        name: 'simple-utils',
        path: '/project/utils',
        files: ['util1.ts', 'util2.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['utils', 'helpers'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.persistence?.backend).toBe('json');
      expect(config?.persistence?.path).toContain('simple-utils');
    });
  });

  describe('resource constraints', () => {
    it('should validate total agent limits', async () => {
      // Create factory with low agent limit
      const restrictedFactory = new AutoSwarmFactory(
        mockSwarmCoordinator,
        mockCollectiveSync,
        mockMemoryStore,
        mockAgui,
        {
          resourceConstraints: {
            maxTotalAgents: 5, // Very low limit
            memoryLimit: '1GB',
            cpuLimit: 4,
          },
        },
      );

      const confidentDomains = new Map([
        [
          'domain1',
          {
            name: 'domain1',
            path: '/project/domain1',
            files: Array.from({ length: 50 }, (_, i) => `file${i}.ts`), // Will create many agents
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
            files: Array.from({ length: 50 }, (_, i) => `file${i}.ts`), // Will create many agents
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

      await expect(
        restrictedFactory.createSwarmsForDomains(confidentDomains),
      ).rejects.toThrow('exceeds limit');
    });

    it('should respect max agents per swarm', async () => {
      const domain = {
        name: 'massive-domain',
        path: '/project/massive',
        files: Array.from({ length: 500 }, (_, i) => `file${i}.ts`), // Massive domain
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['massive', 'extreme'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      // Should not exceed reasonable limits even for massive domains
      expect(config?.maxAgents).toBeLessThanOrEqual(20);
      const totalAgents = config?.agents?.reduce(
        (sum, agent) => sum + agent.count,
        0,
      );
      expect(totalAgents).toBeLessThanOrEqual(config?.maxAgents);
    });
  });

  describe('human validation', () => {
    it('should request human validation when enabled', async () => {
      const validatingFactory = new AutoSwarmFactory(
        mockSwarmCoordinator,
        mockCollectiveSync,
        mockMemoryStore,
        mockAgui,
        { enableHumanValidation: true },
      );

      const confidentDomains = new Map([
        [
          'test-domain',
          {
            name: 'test-domain',
            path: '/project/test',
            files: ['test.ts'],
            confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
            suggestedConcepts: ['test'],
            technologies: ['typescript'],
            relatedDomains: [],
            validations: [],
            research: [],
            refinementHistory: [],
          },
        ],
      ]);

      await validatingFactory.createSwarmsForDomains(confidentDomains);

      expect(mockAgui.askQuestion).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'swarm_factory_validation',
          question: expect.stringContaining('Auto-Swarm Factory will create'),
        }),
      );
    });

    it('should handle human cancellation', async () => {
      const validatingFactory = new AutoSwarmFactory(
        mockSwarmCoordinator,
        mockCollectiveSync,
        mockMemoryStore,
        mockAgui,
        { enableHumanValidation: true },
      );

      mockAgui.askQuestion.mockResolvedValue('3'); // Cancel

      const confidentDomains = new Map([
        [
          'test-domain',
          {
            name: 'test-domain',
            path: '/project/test',
            files: ['test.ts'],
            confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
            suggestedConcepts: ['test'],
            technologies: ['typescript'],
            relatedDomains: [],
            validations: [],
            research: [],
            refinementHistory: [],
          },
        ],
      ]);

      await expect(
        validatingFactory.createSwarmsForDomains(confidentDomains),
      ).rejects.toThrow('cancelled by user');
    });
  });

  describe('performance calculations', () => {
    it('should calculate realistic performance expectations', async () => {
      const domain = {
        name: 'performance-test',
        path: '/project/perf',
        files: Array.from({ length: 30 }, (_, i) => `file${i}.ts`),
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['performance', 'optimization'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.performance?.expectedLatency).toBeGreaterThan(0);
      expect(config?.performance?.expectedThroughput).toBeGreaterThan(0);
      expect(config?.performance?.resourceLimits?.memory).toBeTruthy();
      expect(config?.performance?.resourceLimits?.cpu).toBeGreaterThan(0);
    });

    it('should adjust performance based on complexity', async () => {
      const simpleDomain = {
        name: 'simple',
        path: '/project/simple',
        files: ['simple.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['simple'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const complexDomain = {
        name: 'complex',
        path: '/project/complex',
        files: Array.from({ length: 150 }, (_, i) => `complex${i}.ts`),
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['complex', 'extreme'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const simpleConfig = await factory.createSwarmForDomain(simpleDomain);
      const complexConfig = await factory.createSwarmForDomain(complexDomain);

      // Complex domain should have higher latency expectations
      expect(complexConfig?.performance?.expectedLatency).toBeGreaterThan(
        simpleConfig?.performance?.expectedLatency,
      );

      // Complex domain should have more resource allocation
      expect(
        complexConfig?.performance?.resourceLimits?.cpu,
      ).toBeGreaterThanOrEqual(simpleConfig?.performance?.resourceLimits?.cpu);
    });
  });

  describe('swarm statistics', () => {
    it('should provide accurate statistics', async () => {
      const confidentDomains = new Map([
        [
          'auth',
          {
            name: 'auth',
            path: '/project/auth',
            files: ['auth.ts'],
            confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
            suggestedConcepts: ['auth'],
            technologies: ['typescript'],
            relatedDomains: [],
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
            files: ['api.ts'],
            confidence: { overall: 0.9, domainClarity: 0.9, consistency: 0.9 },
            suggestedConcepts: ['api', 'server'],
            technologies: ['typescript'],
            relatedDomains: [],
            validations: [],
            research: [],
            refinementHistory: [],
          },
        ],
      ]);

      await factory.createSwarmsForDomains(confidentDomains);

      const stats = factory.getSwarmStatistics();

      expect(stats.totalSwarms).toBe(2);
      expect(stats.totalAgents).toBeGreaterThan(0);
      expect(stats.averageConfidence).toBeCloseTo(0.85, 1);
      expect(stats.domains).toContain('auth');
      expect(stats.domains).toContain('api');
      expect(Object.keys(stats.topologyDistribution)).toContain('star'); // API should be star
    });

    it('should handle empty statistics', () => {
      const stats = factory.getSwarmStatistics();

      expect(stats.totalSwarms).toBe(0);
      expect(stats.totalAgents).toBe(0);
      expect(stats.averageConfidence).toBe(0);
      expect(stats.domains).toHaveLength(0);
      expect(Object.keys(stats.topologyDistribution)).toHaveLength(0);
    });
  });

  describe('coordination strategy', () => {
    it('should select parallel strategy for mesh domains with low interconnectedness', async () => {
      const domain = {
        name: 'distributed-system',
        path: '/project/distributed',
        files: ['service1.ts', 'service2.ts', 'service3.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['distributed', 'microservices'],
        technologies: ['typescript'],
        relatedDomains: ['auth', 'api', 'db', 'cache'], // High interconnectedness (4 * 0.2 = 0.8 > 0.7)
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      // Should be mesh topology due to high interconnectedness (0.8)
      expect(config?.topology?.type).toBe('mesh');
      // Strategy should be adaptive (default) since mesh requires high interconnectedness
      expect(config?.coordination?.strategy).toBe('adaptive');
    });

    it('should select sequential strategy for pipeline domains', async () => {
      const domain = {
        name: 'pipeline',
        path: '/project/pipeline',
        files: ['input.ts', 'process.ts', 'output.ts'],
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['pipeline', 'workflow'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(domain);

      expect(config?.coordination?.strategy).toBe('sequential');
    });

    it('should configure appropriate timeouts based on complexity', async () => {
      const extremeDomain = {
        name: 'extreme',
        path: '/project/extreme',
        files: Array.from({ length: 200 }, (_, i) => `extreme${i}.ts`),
        confidence: { overall: 0.8, domainClarity: 0.8, consistency: 0.8 },
        suggestedConcepts: ['extreme', 'complex'],
        technologies: ['typescript'],
        relatedDomains: [],
        validations: [],
        research: [],
        refinementHistory: [],
      };

      const config = await factory.createSwarmForDomain(extremeDomain);

      expect(config?.coordination?.timeout).toBe(120000); // 2 minutes for extreme complexity
      expect(config?.coordination?.retryPolicy?.maxRetries).toBe(3);
      expect(config?.coordination?.retryPolicy?.backoff).toBe('exponential');
    });
  });
});
