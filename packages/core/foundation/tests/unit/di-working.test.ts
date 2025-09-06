/**
 * @fileoverview Dependency Injection Working Tests
 *
 * Tests only the methods that actually exist in the DI container
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createContainer } from '../../src/dependency-injection';

describe('Dependency Injection - Working Methods Only', () => {
  const TEST_SERVICE_NAME = 'test-service';
  const META_SERVICE_NAME = 'meta-service';
  const FACTORY_SERVICE_NAME = 'factory-service';
  let container: ReturnType<typeof createContainer>;

  beforeEach(() => {
    container = createContainer();
  });

  describe('Service Registration and Resolution', () => {
    it('should register and resolve instance services', () => {
      const testService = { name: 'test', value: 42, type: 'instance' };
      container.registerInstance(TEST_SERVICE_NAME, testService);

      expect(container.has(TEST_SERVICE_NAME)).toBe(true);

      const resolved = container.resolve(TEST_SERVICE_NAME);
      expect(resolved).toBe(testService);
      expect(resolved.name).toBe('test');
      expect(resolved.value).toBe(42);
    });

    it('should register instance with metadata', () => {
      const service = { data: 'metadata-test' };
      const metadata = {
        capabilities: ['testing', 'metadata'],
        tags: ['unit-test', 'core'],
      };

      container.registerInstance(META_SERVICE_NAME, service, metadata);

      expect(container.has(META_SERVICE_NAME)).toBe(true);
      const resolved = container.resolve(META_SERVICE_NAME);
      expect(resolved).toBe(service);
    });

    it('should register and resolve function services', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { created: Date.now(), callCount, type: 'factory' };
      };

      container.registerFunction(FACTORY_SERVICE_NAME, factory);

      expect(container.has(FACTORY_SERVICE_NAME)).toBe(true);

      const resolved1 = container.resolve(FACTORY_SERVICE_NAME);
      const resolved2 = container.resolve(FACTORY_SERVICE_NAME);

      // Function should be called each time
      expect(resolved1.callCount).toBe(1);
      expect(resolved2.callCount).toBe(2);
      expect(resolved1).not.toBe(resolved2);
    });

    it('should register function with metadata', () => {
      const factory = () => ({ type: 'factory-with-meta' });
      const metadata = { capabilities: ['creation'], tags: ['factory'] };

      container.registerFunction('factory-meta', factory, metadata);

      expect(container.has('factory-meta')).toBe(true);
      const resolved = container.resolve('factory-meta');
      expect(resolved.type).toBe('factory-with-meta');
    });

    it('should register and resolve class services', () => {
      class TestClass {
        public readonly type = 'class';
        public readonly id = Math.random();
        public getValue() {
          return 'class-value';
        }
      }

      container.register('class-service', TestClass);

      expect(container.has('class-service')).toBe(true);

      const resolved = container.resolve('class-service');
      expect(resolved).toBeInstanceOf(TestClass);
      expect(resolved.type).toBe('class');
      expect(resolved.getValue()).toBe('class-value');
    });

    it('should register class with metadata', () => {
      class MetaClass {
        public readonly name = 'meta-class';
      }

      const metadata = { capabilities: ['instantiation'], tags: ['class'] };
      container.register('meta-class', MetaClass, metadata);

      expect(container.has('meta-class')).toBe(true);
      const resolved = container.resolve('meta-class');
      expect(resolved.name).toBe('meta-class');
    });
  });

  describe('Container State Management', () => {
    it('should track service existence correctly', () => {
      expect(container.has('non-existent')).toBe(false);

      container.registerInstance('exists', { value: true });
      expect(container.has('exists')).toBe(true);

      expect(container.has('still-missing')).toBe(false);
    });

    it('should handle service replacement', () => {
      const original = { version: 1 };
      const replacement = { version: 2 };

      container.registerInstance('replaceable', original);
      expect(container.resolve('replaceable').version).toBe(1);

      container.registerInstance('replaceable', replacement);
      expect(container.resolve('replaceable').version).toBe(2);
    });

    it('should handle many services efficiently', () => {
      const serviceCount = 50;

      // Register many services
      for (let i = 0; i < serviceCount; i++) {
        container.registerInstance(`service-${  i}`, {
          id: i,
          name: `service-${  i}`,
          data: `data-${  i}`,
        });
      }

      // Verify all are registered and resolvable
      for (let i = 0; i < serviceCount; i++) {
        const serviceName = `service-${  i}`;
        expect(container.has(serviceName)).toBe(true);

        const resolved = container.resolve(serviceName);
        expect(resolved.id).toBe(i);
        expect(resolved.name).toBe(serviceName);
        expect(resolved.data).toBe(`data-${  i}`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw for non-existent services', () => {
      expect(() => {
        container.resolve('does-not-exist');
      }).toThrow();
    });

    it('should handle function errors gracefully', () => {
      const errorFunction = () => {
        throw new Error('Function failed to create service');
      };

      container.registerFunction('error-function', errorFunction);

      expect(() => {
        container.resolve('error-function');
      }).toThrow('Function failed to create service');
    });

    it('should handle class instantiation errors', () => {
      class ErrorClass {
        constructor() {
          throw new Error('Constructor failed');
        }
      }

      container.register('error-class', ErrorClass);

      expect(() => {
        container.resolve('error-class');
      }).toThrow('Constructor failed');
    });
  });

  describe('Complex Usage Patterns', () => {
    it('should support service composition', () => {
      // Register a config service
      container.registerInstance('app-config', {
        api: { baseUrl: 'https://api.example.com' },
        features: { logging: true, caching: false },
      });

      // Register a dependent service
      container.registerFunction('api-service', () => {
        const config = container.resolve('app-config');
        return {
          baseUrl: config.api.baseUrl,
          request: (path: string) => (config.api.baseUrl) + path,
          isLoggingEnabled: () => config.features.logging,
        };
      });

      const apiService = container.resolve('api-service');
      expect(apiService.baseUrl).toBe('https://api.example.com');
      expect(apiService.request('/users')).toBe(
        'https://api.example.com/users'
      );
      expect(apiService.isLoggingEnabled()).toBe(true);
    });

    it('should handle circular references in data', () => {
      const serviceA = { name: 'A', ref: null as any };
      const serviceB = { name: 'B', ref: null as any };

      // Set up circular references
      serviceA.ref = serviceB;
      serviceB.ref = serviceA;

      container.registerInstance('circular-a', serviceA);
      container.registerInstance('circular-b', serviceB);

      const resolvedA = container.resolve('circular-a');
      const resolvedB = container.resolve('circular-b');

      expect(resolvedA.name).toBe('A');
      expect(resolvedB.name).toBe('B');
      expect(resolvedA.ref).toBe(serviceB);
      expect(resolvedB.ref).toBe(serviceA);
    });
  });

  describe('Type Safety', () => {
    interface TypedService {
      getValue(): string;
      getCount(): number;
    }

    it('should maintain type safety through resolution', () => {
      const typedService: TypedService = {
        getValue: () => 'typed-value',
        getCount: () => 123,
      };

      container.registerInstance('typed-service', typedService);

      const resolved = container.resolve<TypedService>('typed-service');
      expect(resolved.getValue()).toBe('typed-value');
      expect(resolved.getCount()).toBe(123);
    });
  });
});
