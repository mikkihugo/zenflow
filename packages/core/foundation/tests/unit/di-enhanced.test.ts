/**
 * @fileoverview Enhanced DI Container Features Tests
 * Tests for new singleton, async factory, service discovery, and advanced features
 */

import { beforeEach, describe, expect, it } from 'vitest';

describe('Enhanced DI Container Features', () => {
  let container: any;

  beforeEach(async () => {
    const { createContainer } = await import('../../src/dependency-injection');
    container = createContainer();
  });

  describe('Singleton Support', () => {
    it('should register and resolve singleton services', async () => {
      let instanceCount = 0;

      class TestService {
        id: number;
        constructor() {
          instanceCount++;
          this.id = instanceCount;
        }
      }

      container.registerSingleton('testSingleton', TestService);

      const instance1 = container.resolve<TestService>('testSingleton');
      const instance2 = container.resolve<TestService>('testSingleton');

      expect(instance1).toBe(instance2); // Same instance
      expect(instance1.id).toBe(1);
      expect(instanceCount).toBe(1); // Only created once
    });

    it('should register singleton with factory function', async () => {
      let callCount = 0;

      const factory = () => {
        callCount++;
        return { value: 'factory-' + callCount };
      };

      container.registerSingleton('singletonFactory', factory);

      const instance1 = container.resolve('singletonFactory');
      const instance2 = container.resolve('singletonFactory');

      expect(instance1).toBe(instance2);
      expect(instance1.value).toBe('factory-1');
      expect(callCount).toBe(1);
    });

    it('should register singleton with capabilities and tags', async () => {
      class CacheService {
        name = 'cache';
      }

      container.registerSingleton('cache', CacheService, {
        capabilities: ['storage', 'performance'],
        tags: ['cache', 'singleton'],
      });

      const metadata = container.getServiceMetadata('cache');
      expect(metadata?.type).toBe('singleton');
      expect(metadata?.capabilities).toEqual(['storage', 'performance']);
      expect(metadata?.tags).toEqual(['cache', 'singleton']);
    });
  });

  describe('Async Factory Support', () => {
    it('should register and resolve async factories', async () => {
      const asyncFactory = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { data: 'async-result', timestamp: Date.now() };
      };

      container.registerAsyncFactory('asyncService', asyncFactory);

      const result = await container.resolveAsync('asyncService');

      expect(result.data).toBe('async-result');
      expect(typeof result.timestamp).toBe('number');
    });

    it('should handle async factory errors gracefully', async () => {
      const failingFactory = async () => {
        throw new Error('Async factory failed');
      };

      container.registerAsyncFactory('failingAsync', failingFactory);

      await expect(container.resolveAsync('failingAsync')).rejects.toThrow(
        'Async factory failed'
      );
    });

    it('should register async factory with metadata', async () => {
      const dbFactory = async () => ({ connected: true });

      container.registerAsyncFactory('database', dbFactory, {
        capabilities: ['persistence', 'async'],
        tags: ['database', 'async'],
      });

      const metadata = container.getServiceMetadata('database');
      expect(metadata?.type).toBe('async-factory');
      expect(metadata?.capabilities).toEqual(['persistence', 'async']);
    });
  });

  describe('Service Discovery', () => {
    beforeEach(() => {
      // Register test services with various tags and capabilities
      container.registerInstance(
        'service1',
        { name: 'service1' },
        {
          capabilities: ['read', 'write'],
          tags: ['data', 'primary'],
        }
      );

      container.registerInstance(
        'service2',
        { name: 'service2' },
        {
          capabilities: ['read'],
          tags: ['data', 'secondary'],
        }
      );

      container.registerInstance(
        'service3',
        { name: 'service3' },
        {
          capabilities: ['cache', 'fast'],
          tags: ['cache', 'memory'],
        }
      );
    });

    it('should find services by tags', async () => {
      const dataServices = container.getServicesByTags(['data']);

      expect(dataServices).toHaveLength(2);
      expect(dataServices).toContain('service1');
      expect(dataServices).toContain('service2');
    });

    it('should find services by capabilities', async () => {
      const readServices = container.getServicesByCapabilities(['read']);

      expect(readServices).toHaveLength(2);
      expect(readServices).toContain('service1');
      expect(readServices).toContain('service2');
    });

    it('should resolve all services with specific tags', async () => {
      const allDataServices = container.resolveAll(['data']);

      expect(allDataServices).toHaveLength(2);
      expect(allDataServices[0].name).toMatch(/service[12]/);
      expect(allDataServices[1].name).toMatch(/service[12]/);
    });

    it('should handle empty results for non-existent tags', async () => {
      const nonExistent = container.getServicesByTags(['nonexistent']);
      expect(nonExistent).toEqual([]);
    });
  });

  describe('Conditional Registration', () => {
    it('should register service when condition is true', async () => {
      const condition = () => true;

      container.registerConditional(
        'conditionalTrue',
        () => ({ enabled: true }),
        condition
      );

      expect(container.has('conditionalTrue')).toBe(true);
      const service = container.resolve('conditionalTrue');
      expect(service.enabled).toBe(true);
    });

    it('should not register service when condition is false', async () => {
      const condition = () => false;

      container.registerConditional(
        'conditionalFalse',
        () => ({ enabled: true }),
        condition
      );

      expect(container.has('conditionalFalse')).toBe(false);
    });

    it('should register conditional class when condition is true', async () => {
      class ConditionalClass {
        value = 'conditional';
      }

      container.registerConditional(
        'conditionalClass',
        ConditionalClass,
        () => true
      );

      expect(container.has('conditionalClass')).toBe(true);
      const instance = container.resolve<ConditionalClass>('conditionalClass');
      expect(instance.value).toBe('conditional');
    });
  });

  describe('Service Disposal', () => {
    it('should dispose services that implement dispose method', async () => {
      let disposed = false;

      const disposableService = {
        name: 'disposable',
        dispose: () => {
          disposed = true;
        },
      };

      container.registerInstance('disposableService', disposableService);
      container.resolve('disposableService'); // Trigger registration in disposables

      await container.dispose();

      expect(disposed).toBe(true);
    });

    it('should handle async dispose methods', async () => {
      let asyncDisposed = false;

      const asyncDisposableService = {
        name: 'asyncDisposable',
        dispose: async () => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          asyncDisposed = true;
        },
      };

      container.registerInstance('asyncDisposable', asyncDisposableService);
      container.resolve('asyncDisposable');

      await container.dispose();

      expect(asyncDisposed).toBe(true);
    });

    it('should clear all containers after disposal', async () => {
      container.registerInstance('test', { value: 'test' });

      expect(container.listServices()).toContain('test');

      await container.dispose();

      expect(container.listServices()).toEqual([]);
    });
  });

  describe('Event System Integration', () => {
    it('should emit events for service registration', async () => {
      const events: any[] = [];

      container.on('serviceRegistered', (event: any) => {
        events.push(event);
      });

      container.register('TestClass', class TestClass {});
      container.registerFunction('testFunc', () => ({}));
      container.registerInstance('testInstance', {});

      expect(events).toHaveLength(3);
      expect(events[0]).toEqual({ name: 'TestClass', type: 'class' });
      expect(events[1]).toEqual({ name: 'testFunc', type: 'factory' });
      expect(events[2]).toEqual({ name: 'testInstance', type: 'instance' });
    });

    it('should emit events for service resolution', async () => {
      const resolutionEvents: any[] = [];

      container.on('serviceResolved', (event: any) => {
        resolutionEvents.push(event);
      });

      container.registerInstance('test', { value: 'test' });
      container.resolve('test');

      expect(resolutionEvents).toHaveLength(1);
      expect(resolutionEvents[0].name).toBe('test');
      expect(typeof resolutionEvents[0].resolutionTime).toBe('number');
    });
  });

  describe('Health Monitoring', () => {
    it('should provide container statistics', async () => {
      container.registerInstance('service1', {});
      container.registerInstance('service2', {});

      const _stats = container.getStats();

      expect(stats.totalServices).toBe(2);
      expect(stats.healthyServices).toBe(2);
      expect(stats.unhealthyServices).toBe(0);
      expect(typeof stats.lastHealthCheck).toBe('number');
    });

    it('should start health monitoring', async () => {
      const healthEvents: any[] = [];

      container.on('healthCheck', (event: any) => {
        healthEvents.push(event);
      });

      container.registerInstance('monitored', {});
      container.startHealthMonitoring(10); // 10ms interval

      // Wait for at least one health check
      await new Promise((resolve) => setTimeout(resolve, 25));

      expect(healthEvents.length).toBeGreaterThan(0);
      expect(healthEvents[0].servicesCount).toBe(1);
      expect(typeof healthEvents[0].timestamp).toBe('number');
    });
  });

  describe('Service Introspection', () => {
    it('should list all registered services', async () => {
      container.registerInstance('service1', {});
      container.registerInstance('service2', {});
      container.registerInstance('service3', {});

      const services = container.listServices();

      expect(services).toHaveLength(3);
      expect(services).toContain('service1');
      expect(services).toContain('service2');
      expect(services).toContain('service3');
    });

    it('should get service metadata', async () => {
      container.registerInstance(
        'metadataTest',
        { value: 'test' },
        {
          capabilities: ['testing'],
          tags: ['unit-test'],
        }
      );

      const metadata = container.getServiceMetadata('metadataTest');

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe('metadataTest');
      expect(metadata?.type).toBe('instance');
      expect(metadata?.capabilities).toEqual(['testing']);
      expect(metadata?.tags).toEqual(['unit-test']);
      expect(typeof metadata?.registeredAt).toBe('number');
    });

    it('should return undefined for non-existent service metadata', async () => {
      const metadata = container.getServiceMetadata('nonexistent');
      expect(metadata).toBeUndefined();
    });
  });

  describe('Auto Discovery', () => {
    it('should discover services from patterns', async () => {
      const patterns = ['**/*service.js', '**/*provider.js'];

      const discovered = await container.autoDiscoverServices(patterns, {
        baseDirectory: './src',
        recursive: true,
      });

      expect(Array.isArray(discovered)).toBe(true);
      // Mock implementation returns services for patterns containing 'service')			expect(discovered.length).toBeGreaterThan(0);

      const serviceInfo = discovered[0];
      expect(serviceInfo.type).toBe('class');
      expect(serviceInfo.tags).toContain('discovered');
    });
  });
});
