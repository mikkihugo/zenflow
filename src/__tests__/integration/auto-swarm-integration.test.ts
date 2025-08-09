describe('Auto-Swarm Integration', () => {
  it('should be able to import all required swarm components', async () => {
    // Test dynamic imports used in discover.ts
    const { AutoSwarmFactory } = await import('../../coordination/discovery/auto-swarm-factory');
    const { HiveSwarmCoordinator } = await import('../../coordination/hive-swarm-sync');
    const { createPublicSwarmCoordinator } = await import('../../coordination/public-api');

    expect(AutoSwarmFactory).toBeDefined();
    expect(HiveSwarmCoordinator).toBeDefined();
    expect(createPublicSwarmCoordinator).toBeDefined();
  });

  it('should be able to create auto-swarm factory with all dependencies', async () => {
    const { AutoSwarmFactory } = await import('../../coordination/discovery/auto-swarm-factory');
    const { HiveSwarmCoordinator } = await import('../../coordination/hive-swarm-sync');
    const { createPublicSwarmCoordinator } = await import('../../coordination/public-api');
    const { EventBus } = await import('../../core/event-bus');

    // Mock required dependencies
    const mockMemoryStore = {
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    } as any;

    const mockAgui = {
      askQuestion: vi.fn().mockResolvedValue('1'),
      askBatchQuestions: vi.fn(),
      showProgress: vi.fn(),
      showMessage: vi.fn(),
    } as any;

    // Create all required infrastructure
    const eventBus = EventBus.getInstance();
    const swarmCoordinator = await createPublicSwarmCoordinator();
    const hiveSync = new HiveSwarmCoordinator(eventBus);

    // Create factory (this should work without errors)
    const factory = new AutoSwarmFactory(swarmCoordinator, hiveSync, mockMemoryStore, mockAgui, {
      enableHumanValidation: false,
      resourceConstraints: {
        maxTotalAgents: 10,
        memoryLimit: '2GB',
        cpuLimit: 4,
      },
    });

    expect(factory).toBeDefined();

    // Test event handling
    let eventFired = false;
    factory.on('factory:start', () => {
      eventFired = true;
    });

    // Create a simple test domain
    const testDomains = new Map([
      [
        'test-domain',
        {
          name: 'test-domain',
          path: '/test',
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

    const configs = await factory.createSwarmsForDomains(testDomains);

    expect(configs).toHaveLength(1);
    expect(eventFired).toBe(true);
  });
});
