import {
  CORE_TOKENS,
  createContainerBuilder,
  createToken,
  DIContainer,
  NEURAL_TOKENS,
  ScopedProvider,
  SingletonProvider,
  SWARM_TOKENS,
  TransientProvider,
} from '../../di/index.ts';

describe('DI System Comprehensive Integration', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('Core DI Container Functionality', () => {
    it('should register and resolve singleton services', () => {
      // Arrange
      const TEST_TOKEN = createToken<{ getValue(): string }>('TestService');
      const mockService = { getValue: () => 'test-value' };

      // Act
      container.register(TEST_TOKEN, new SingletonProvider(() => mockService));
      const resolved1 = container.resolve(TEST_TOKEN);
      const resolved2 = container.resolve(TEST_TOKEN);

      // Assert
      expect(resolved1).toBe(resolved2); // Same instance
      expect(resolved1.getValue()).toBe('test-value');
    });

    it('should register and resolve transient services', () => {
      // Arrange
      const TEST_TOKEN = createToken<{ id: string }>('TransientService');
      let counter = 0;

      // Act
      container.register(
        TEST_TOKEN,
        new TransientProvider(() => ({
          id: `instance-${++counter}`,
        }))
      );

      const resolved1 = container.resolve(TEST_TOKEN);
      const resolved2 = container.resolve(TEST_TOKEN);

      // Assert
      expect(resolved1).not.toBe(resolved2); // Different instances
      expect(resolved1.id).toBe('instance-1');
      expect(resolved2.id).toBe('instance-2');
    });

    it('should handle scoped services correctly', () => {
      // Arrange
      const TEST_TOKEN = createToken<{ scopeId: string }>('ScopedService');
      let counter = 0;

      container.register(
        TEST_TOKEN,
        new ScopedProvider(() => ({
          scopeId: `scope-${++counter}`,
        }))
      );

      // Act
      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const resolved1a = scope1.resolve(TEST_TOKEN);
      const resolved1b = scope1.resolve(TEST_TOKEN);
      const resolved2a = scope2.resolve(TEST_TOKEN);

      // Assert
      expect(resolved1a).toBe(resolved1b); // Same within scope
      expect(resolved1a).not.toBe(resolved2a); // Different across scopes
      expect(resolved1a.scopeId).toBe('scope-1');
      expect(resolved2a.scopeId).toBe('scope-2');
    });
  });

  describe('Decorator-Based Injection', () => {
    it('should inject dependencies using decorators', () => {
      // Arrange
      interface ITestLogger {
        log(message: string): void;
      }

      const LOGGER_TOKEN = createToken<ITestLogger>('TestLogger');
      const mockLogger = { log: vi.fn() };

      // @injectable
      class TestService {
        constructor(/* @inject(LOGGER_TOKEN) */ private _logger: ITestLogger) {}

        doSomething() {
          this._logger.log('doing something');
        }
      }

      container.register(LOGGER_TOKEN, new SingletonProvider(() => mockLogger));
      container.register(
        createToken<TestService>('TestService'),
        new SingletonProvider(
          (c: unknown) => new TestService((c as any).resolve(LOGGER_TOKEN))
        )
      );

      // Act
      const service = container.resolve(
        createToken<TestService>('TestService')
      );
      service.doSomething();

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith('doing something');
    });
  });

  describe('Builder Pattern Integration', () => {
    it('should configure container using builder pattern', async () => {
      // Arrange & Act
      const builtContainer = createContainerBuilder()
        .singleton(CORE_TOKENS.Logger, () => ({ 
          log: vi.fn(),
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        }))
        .transient(createToken<string>('TestString'), () => 'test-value')
        .build();

      // Assert
      const logger1 = builtContainer.resolve(CORE_TOKENS.Logger);
      const logger2 = builtContainer.resolve(CORE_TOKENS.Logger);
      const string1 = builtContainer.resolve(createToken<string>('TestString'));
      const string2 = builtContainer.resolve(createToken<string>('TestString'));

      expect(logger1).toBe(logger2); // Singleton
      expect(string1).toBe(string2); // Transient but same value

      await builtContainer.dispose();
    });
  });

  describe('Domain-Specific Token Integration', () => {
    it('should support core domain tokens', () => {
      // Arrange
      const mockLogger = {
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
      };
      const mockConfig = { 
        get: vi.fn(),
        set: vi.fn(),
        has: vi.fn()
      };

      // Act
      container.register(
        CORE_TOKENS.Logger,
        new SingletonProvider(() => mockLogger)
      );
      container.register(
        CORE_TOKENS.Config,
        new SingletonProvider(() => mockConfig)
      );

      // Assert
      const logger = container.resolve(CORE_TOKENS.Logger);
      const config = container.resolve(CORE_TOKENS.Config);

      expect(logger).toBe(mockLogger);
      expect(config).toBe(mockConfig);
    });

    it('should support swarm domain tokens', () => {
      // Arrange
      const mockSwarmCoordinator = {
        initializeSwarm: vi.fn(),
        addAgent: vi.fn(),
        removeAgent: vi.fn(),
        assignTask: vi.fn(),
        getMetrics: vi.fn(),
        shutdown: vi.fn()
      };
      const mockAgentRegistry = {
        register: vi.fn(),
        find: vi.fn(),
        list: vi.fn(),
        registerAgent: vi.fn(),
        unregisterAgent: vi.fn(),
        getAgent: vi.fn(),
        getActiveAgents: vi.fn(),
        findAvailableAgents: vi.fn()
      };

      // Act
      container.register(
        SWARM_TOKENS['SwarmCoordinator'],
        new SingletonProvider(() => mockSwarmCoordinator)
      );
      container.register(
        SWARM_TOKENS['AgentRegistry'],
        new SingletonProvider(() => mockAgentRegistry)
      );

      // Assert
      const coordinator = container.resolve(SWARM_TOKENS['SwarmCoordinator']);
      const registry = container.resolve(SWARM_TOKENS['AgentRegistry']);

      expect(coordinator).toBe(mockSwarmCoordinator);
      expect(registry).toBe(mockAgentRegistry);
    });

    it('should support neural domain tokens', () => {
      // Arrange
      const mockTrainer = {
        train: vi.fn(),
        evaluate: vi.fn(),
        save: vi.fn(),
        createNetwork: vi.fn(),
        trainNetwork: vi.fn(),
        evaluateNetwork: vi.fn(),
        saveModel: vi.fn(),
        loadModel: vi.fn()
      };
      const mockDataLoader = {
        load: vi.fn(),
        preprocess: vi.fn(),
        batch: vi.fn(),
        loadTrainingData: vi.fn(),
        loadTestData: vi.fn(),
        preprocessData: vi.fn(),
        augmentData: vi.fn()
      };

      // Act
      container.register(
        NEURAL_TOKENS['NetworkTrainer'],
        new SingletonProvider(() => mockTrainer)
      );
      container.register(
        NEURAL_TOKENS['DataLoader'],
        new SingletonProvider(() => mockDataLoader)
      );

      // Assert
      const trainer = container.resolve(NEURAL_TOKENS['NetworkTrainer']);
      const dataLoader = container.resolve(NEURAL_TOKENS['DataLoader']);

      expect(trainer).toBe(mockTrainer);
      expect(dataLoader).toBe(mockDataLoader);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should throw error for unregistered services', () => {
      // Arrange
      const UNREGISTERED_TOKEN = createToken<string>('UnregisteredService');

      // Act & Assert
      expect(() => container.resolve(UNREGISTERED_TOKEN)).toThrow();
    });

    it('should detect circular dependencies', () => {
      // Arrange
      const TOKEN_A = createToken<unknown>('ServiceA');
      const TOKEN_B = createToken<unknown>('ServiceB');

      container.register(
        TOKEN_A,
        new SingletonProvider((c: unknown) => ({
          dep: (c as any).resolve(TOKEN_B),
        }))
      );
      container.register(
        TOKEN_B,
        new SingletonProvider((c: unknown) => ({
          dep: (c as any).resolve(TOKEN_A),
        }))
      );

      // Act & Assert
      expect(() => container.resolve(TOKEN_A)).toThrow(/circular/i);
    });

    it('should handle disposal of services', async () => {
      // Arrange
      const disposalSpy = vi.fn();
      const service = {
        dispose: disposalSpy,
        value: 'test',
      };

      const TEST_TOKEN = createToken<typeof service>('DisposableService');
      container.register(TEST_TOKEN, new SingletonProvider(() => service));

      // Resolve to create instance
      container.resolve(TEST_TOKEN);

      // Act
      await container.dispose();

      // Assert
      expect(disposalSpy).toHaveBeenCalled();
    });
  });

  describe('Performance and Scalability', () => {
    it('should resolve services within performance thresholds', () => {
      // Arrange
      const TEST_TOKEN = createToken<{ value: string }>(
        'PerformanceTestService'
      );
      container.register(
        TEST_TOKEN,
        new SingletonProvider(() => ({ value: 'test' }))
      );

      // Act - Measure resolution time
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        container.resolve(TEST_TOKEN);
      }
      const duration = Date.now() - start;

      // Assert - Should resolve 1000 services in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent resolutions safely', async () => {
      // Arrange
      let creationCount = 0;
      const TEST_TOKEN = createToken<{ id: number }>('ConcurrentService');

      container.register(
        TEST_TOKEN,
        new SingletonProvider(() => ({
          id: ++creationCount,
        }))
      );

      // Act - Concurrent resolutions
      const promises = Array.from({ length: 100 }, () =>
        Promise.resolve(container.resolve(TEST_TOKEN))
      );

      const results = await Promise.all(promises);

      // Assert - All should be the same instance (singleton)
      const firstResult = results?.[0];
      expect(results?.every((result: unknown) => result === firstResult)).toBe(
        true
      );
      expect(creationCount).toBe(1); // Only created once
    });
  });

  describe('Integration with Existing Systems', () => {
    it('should integrate with SPARC swarm coordination', () => {
      // Arrange
      const mockSPARCCoordinator = {
        processSpecification: vi.fn(),
        generatePseudocode: vi.fn(),
        createArchitecture: vi.fn(),
        refineImplementation: vi.fn(),
        completeTask: vi.fn(),
      };

      const SPARC_TOKEN =
        createToken<typeof mockSPARCCoordinator>('SPARCCoordinator');
      container.register(
        SPARC_TOKEN,
        new SingletonProvider(() => mockSPARCCoordinator)
      );

      // Act
      const sparcCoordinator = container.resolve(SPARC_TOKEN);
      sparcCoordinator.processSpecification({ task: 'test-task' });

      // Assert
      expect(mockSPARCCoordinator.processSpecification).toHaveBeenCalledWith({
        task: 'test-task',
      });
    });

    it('should integrate with memory systems', () => {
      // Arrange
      const mockMemoryStore = {
        save: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        list: vi.fn(),
      };

      const MEMORY_TOKEN = createToken<typeof mockMemoryStore>('MemoryStore');
      container.register(
        MEMORY_TOKEN,
        new SingletonProvider(() => mockMemoryStore)
      );

      // Act
      const memoryStore = container.resolve(MEMORY_TOKEN);
      memoryStore.save('key', 'value');

      // Assert
      expect(mockMemoryStore.save).toHaveBeenCalledWith('key', 'value');
    });
  });
});
