/**
 * Comprehensive DI Container Tests
 * Testing all aspects of the dependency injection system
 */

import {
  CircularDependencyError,
  CORE_TOKENS,
  createToken,
  DIContainer,
  type IConfig,
  type ILogger,
  inject,
  injectable,
  ScopedProvider,
  ServiceNotFoundError,
  SingletonProvider,
  SWARM_TOKENS,
  TransientProvider,
} from '../../../di/index';

describe('DI Container - Core Functionality', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('Service Registration', () => {
    it('should register and resolve singleton services', () => {
      const token = createToken<string>('TestService');
      const value = 'test-singleton-value';

      container.register(token, new SingletonProvider(() => value));

      const resolved1 = container.resolve(token);
      const resolved2 = container.resolve(token);

      expect(resolved1).toBe(value);
      expect(resolved2).toBe(value);
      expect(resolved1).toBe(resolved2); // Same instance
    });

    it('should register and resolve transient services', () => {
      const token = createToken<{ id: number }>('TransientService');
      let id = 0;

      container.register(token, new TransientProvider(() => ({ id: ++id })));

      const resolved1 = container.resolve(token);
      const resolved2 = container.resolve(token);

      expect(resolved1.id).toBe(1);
      expect(resolved2.id).toBe(2);
      expect(resolved1).not.toBe(resolved2); // Different instances
    });

    it('should register and resolve scoped services', () => {
      const token = createToken<{ id: number }>('ScopedService');
      let id = 0;

      container.register(token, new ScopedProvider(() => ({ id: ++id })));

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const resolved1a = scope1.resolve(token);
      const resolved1b = scope1.resolve(token);
      const resolved2 = scope2.resolve(token);

      expect(resolved1a.id).toBe(1);
      expect(resolved1b.id).toBe(1);
      expect(resolved2.id).toBe(2);
      expect(resolved1a).toBe(resolved1b); // Same instance in scope
      expect(resolved1a).not.toBe(resolved2); // Different instances across scopes
    });

    it('should throw error when resolving unregistered service', () => {
      const token = createToken<string>('UnregisteredService');

      expect(() => container.resolve(token)).toThrow(ServiceNotFoundError);
    });

    it('should check if service is registered', () => {
      const token = createToken<string>('TestService');

      expect(container.isRegistered(token)).toBe(false);

      container.register(token, new SingletonProvider(() => 'test'));

      expect(container.isRegistered(token)).toBe(true);
    });
  });

  describe('Circular Dependency Detection', () => {
    it('should detect circular dependencies', () => {
      const tokenA = createToken<ServiceA>('ServiceA');
      const tokenB = createToken<ServiceB>('ServiceB');

      class ServiceA {
        constructor(public serviceB: ServiceB) {}
      }

      class ServiceB {
        constructor(public serviceA: ServiceA) {}
      }

      container.register(tokenA, new SingletonProvider((c) => new ServiceA(c.resolve(tokenB))));
      container.register(tokenB, new SingletonProvider((c) => new ServiceB(c.resolve(tokenA))));

      expect(() => container.resolve(tokenA)).toThrow(CircularDependencyError);
    });

    it('should handle deep dependency chains without false positives', () => {
      const tokenA = createToken<ServiceA>('ServiceA');
      const tokenB = createToken<ServiceB>('ServiceB');
      const tokenC = createToken<ServiceC>('ServiceC');

      class ServiceA {
        constructor(public serviceB: ServiceB) {}
      }

      class ServiceB {
        constructor(public serviceC: ServiceC) {}
      }

      class ServiceC {}

      container.register(tokenA, new SingletonProvider((c) => new ServiceA(c.resolve(tokenB))));
      container.register(tokenB, new SingletonProvider((c) => new ServiceB(c.resolve(tokenC))));
      container.register(tokenC, new SingletonProvider(() => new ServiceC()));

      const serviceA = container.resolve(tokenA);

      expect(serviceA).toBeInstanceOf(ServiceA);
      expect(serviceA.serviceB).toBeInstanceOf(ServiceB);
      expect(serviceA.serviceB.serviceC).toBeInstanceOf(ServiceC);
    });
  });

  describe('Scoped Containers', () => {
    it('should create and manage scopes', () => {
      const token = createToken<{ scopeId: string }>('ScopedService');

      container.register(token, new ScopedProvider(() => ({ scopeId: Math.random().toString() })));

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const service1 = scope1.resolve(token);
      const service2 = scope2.resolve(token);

      expect(service1.scopeId).not.toBe(service2.scopeId);
    });

    it('should dispose scopes properly', async () => {
      const token = createToken<MockDisposableService>('DisposableService');

      class MockDisposableService {
        disposed = false;
      }

      const disposeFn = jest.fn(async (instance: MockDisposableService) => {
        instance.disposed = true;
      });

      container.register(token, new ScopedProvider(() => new MockDisposableService(), disposeFn));

      const scope = container.createScope();
      const service = scope.resolve(token);

      await scope.dispose();

      expect(disposeFn).toHaveBeenCalledWith(service);
      expect(service.disposed).toBe(true);
    });
  });

  describe('Container Disposal', () => {
    it('should dispose singleton instances', async () => {
      const token = createToken<MockDisposableService>('DisposableService');

      class MockDisposableService {
        disposed = false;
      }

      const disposeFn = jest.fn(async (instance: MockDisposableService) => {
        instance.disposed = true;
      });

      container.register(
        token,
        new SingletonProvider(() => new MockDisposableService(), disposeFn)
      );

      const service = container.resolve(token);

      await container.dispose();

      expect(disposeFn).toHaveBeenCalledWith(service);
      expect(service.disposed).toBe(true);
    });
  });

  describe('Performance and Configuration', () => {
    it('should handle container configuration options', () => {
      const containerWithOptions = new DIContainer({
        enableCircularDependencyDetection: false,
        maxResolutionDepth: 10,
        enablePerformanceMetrics: true,
      });

      expect(containerWithOptions).toBeInstanceOf(DIContainer);
    });

    it('should resolve services quickly (performance test)', () => {
      const token = createToken<string>('PerformanceTest');
      container.register(token, new SingletonProvider(() => 'test-value'));

      const startTime = Date.now();

      // Resolve 1000 times
      for (let i = 0; i < 1000; i++) {
        container.resolve(token);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should resolve 1000 services in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});

describe('DI Container - Integration with Core Tokens', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  afterEach(async () => {
    await container.dispose();
  });

  it('should work with core system tokens', () => {
    // Mock logger implementation
    class MockLogger implements ILogger {
      debug = jest.fn();
      info = jest.fn();
      warn = jest.fn();
      error = jest.fn();
    }

    // Mock config implementation
    class MockConfig implements IConfig {
      private data = new Map();

      get<T>(key: string, defaultValue?: T): T {
        return this.data.has(key) ? this.data.get(key) : defaultValue;
      }

      set(key: string, value: any): void {
        this.data.set(key, value);
      }

      has(key: string): boolean {
        return this.data.has(key);
      }
    }

    container.register(CORE_TOKENS.Logger, new SingletonProvider(() => new MockLogger()));
    container.register(CORE_TOKENS.Config, new SingletonProvider(() => new MockConfig()));

    const logger = container.resolve(CORE_TOKENS.Logger);
    const config = container.resolve(CORE_TOKENS.Config);

    expect(logger).toBeInstanceOf(MockLogger);
    expect(config).toBeInstanceOf(MockConfig);

    // Test functionality
    logger.info('Test message');
    config.set('test', 'value');

    expect(logger.info).toHaveBeenCalledWith('Test message');
    expect(config.get('test')).toBe('value');
  });

  it('should work with swarm tokens', () => {
    class MockSwarmCoordinator {
      async initializeSwarm(options: any): Promise<void> {}
      async addAgent(config: any): Promise<string> {
        return 'agent-1';
      }
      async removeAgent(agentId: string): Promise<void> {}
      async assignTask(task: any): Promise<string> {
        return 'task-1';
      }
      getMetrics(): any {
        return {};
      }
      async shutdown(): Promise<void> {}
    }

    container.register(
      SWARM_TOKENS.SwarmCoordinator,
      new SingletonProvider(() => new MockSwarmCoordinator())
    );

    const coordinator = container.resolve(SWARM_TOKENS.SwarmCoordinator);

    expect(coordinator).toBeInstanceOf(MockSwarmCoordinator);
  });
});
