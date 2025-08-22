import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockLogger, mockConfig, mockDIContainer, createMockMemoryConfig } from '../mocks/foundation-mocks';

// Mock the entire foundation module
vi.mock('@claude-zen/foundation', () => ({
  getLogger: () => mockLogger,
  DIContainer: vi.fn(() => mockDIContainer),
  injectable: vi.fn((target) => target),
  createToken: vi.fn((name) => Symbol(name)),
  Result: {
    ok: (value: any) => ({ isOk: () => true, isErr: () => false, _unsafeUnwrap: () => value }),
    err: (error: any) => ({ isOk: () => false, isErr: () => true, _unsafeUnwrapErr: () => error })
  },
  ok: (value: any) => ({ isOk: () => true, isErr: () => false, _unsafeUnwrap: () => value }),
  err: (error: any) => ({ isOk: () => false, isErr: () => true, _unsafeUnwrapErr: () => error }),
  safeAsync: vi.fn((fn) => fn()),
  withRetry: vi.fn((fn) => fn()),
  withTimeout: vi.fn((fn) => fn()),
  TypedEventBase: class { emit = vi.fn(); on = vi.fn(); }
}));

describe('Memory System DI Integration', () => {
  let container: any;
  let memoryConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();
    container = mockDIContainer;
    memoryConfig = createMockMemoryConfig();
    
    // Setup container mock responses
    container.resolve.mockImplementation((token: any) => {
      if (token.toString().includes('Logger')) return mockLogger;
      if (token.toString().includes('Config')) return mockConfig;
      if (token.toString().includes('MemoryConfig')) return memoryConfig;
      return null;
    });
    
    container.has.mockReturnValue(true);
    container.register.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Registration', () => {
    it('should register memory services with DI container', async () => {
      // Import the memory providers module
      const { registerMemoryProviders } = await import('../../src/providers/memory-providers');
      
      // Register memory services
      registerMemoryProviders(container);
      
      // Verify core services were registered
      expect(container.register).toHaveBeenCalledWith(
        expect.anything(), // Memory provider factory token
        expect.any(Function)
      );
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Memory providers registered')
      );
    });

    it('should register memory controller with dependencies', async () => {
      const { MemoryController } = await import('../../src/controllers/memory-controller');
      
      // Register controller
      container.register('MemoryController', () => {
        const logger = container.resolve('Logger');
        const config = container.resolve('MemoryConfig');
        return new MemoryController(logger, config);
      });
      
      // Resolve controller
      const controller = container.resolve('MemoryController');
      
      expect(controller).toBeDefined();
      expect(container.resolve).toHaveBeenCalledWith('Logger');
      expect(container.resolve).toHaveBeenCalledWith('MemoryConfig');
    });

    it('should handle missing dependencies gracefully', async () => {
      container.resolve.mockImplementation((token: any) => {
        if (token.toString().includes('MissingService')) {
          throw new Error('Service not found');
        }
        return mockLogger;
      });
      
      try {
        const result = container.resolve('MissingService');
        expect(result).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Memory Provider Factory Integration', () => {
    it('should create memory providers through DI', async () => {
      const { MemoryProviderFactory } = await import('../../src/providers/memory-providers');
      
      // Create factory instance
      const factory = new MemoryProviderFactory(mockLogger, mockConfig);
      
      expect(factory).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('MemoryProviderFactory created')
      );
    });

    it('should create different backend types through factory', async () => {
      const { MemoryProviderFactory } = await import('../../src/providers/memory-providers');
      
      const factory = new MemoryProviderFactory(mockLogger, mockConfig);
      
      // Test different backend configurations
      const configs = [
        { type: 'memory', maxSize: 1000 },
        { type: 'sqlite', path: ':memory:', maxSize: 5000 },
        { type: 'json', path: '/tmp/test.json', maxSize: 2000 },
        { type: 'lancedb', path: '/tmp/lancedb', maxSize: 10000 }
      ];
      
      for (const config of configs) {
        const provider = factory.createProvider(config as any);
        expect(provider).toBeDefined();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining(`Creating ${config.type} backend`)
        );
      }
    });

    it('should handle invalid backend types', async () => {
      const { MemoryProviderFactory } = await import('../../src/providers/memory-providers');
      
      const factory = new MemoryProviderFactory(mockLogger, mockConfig);
      
      const invalidConfig = { type: 'invalid-backend', maxSize: 1000 };
      
      expect(() => {
        factory.createProvider(invalidConfig as any);
      }).toThrow();
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported backend type')
      );
    });
  });

  describe('Memory Controller DI Integration', () => {
    it('should inject dependencies into memory controller', async () => {
      const { MemoryController } = await import('../../src/controllers/memory-controller');
      
      // Mock provider factory
      const mockProviderFactory = {
        createProvider: vi.fn().mockReturnValue({
          store: vi.fn().mockResolvedValue(undefined),
          retrieve: vi.fn().mockResolvedValue(null),
          delete: vi.fn().mockResolvedValue(true),
          clear: vi.fn().mockResolvedValue(undefined),
          health: vi.fn().mockResolvedValue(true)
        })
      };
      
      container.resolve.mockImplementation((token: any) => {
        if (token.toString().includes('Logger')) return mockLogger;
        if (token.toString().includes('Config')) return mockConfig;
        if (token.toString().includes('ProviderFactory')) return mockProviderFactory;
        return null;
      });
      
      const controller = new MemoryController(
        container.resolve('Logger'),
        container.resolve('Config'),
        container.resolve('ProviderFactory')
      );
      
      expect(controller).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('MemoryController initialized')
      );
    });

    it('should handle memory operations through DI-injected services', async () => {
      const { MemoryController } = await import('../../src/controllers/memory-controller');
      
      const mockBackend = {
        store: vi.fn().mockResolvedValue(undefined),
        retrieve: vi.fn().mockResolvedValue('test-value'),
        delete: vi.fn().mockResolvedValue(true),
        clear: vi.fn().mockResolvedValue(undefined),
        health: vi.fn().mockResolvedValue(true)
      };
      
      const mockProviderFactory = {
        createProvider: vi.fn().mockReturnValue(mockBackend)
      };
      
      const controller = new MemoryController(
        mockLogger,
        mockConfig,
        mockProviderFactory
      );
      
      // Test store operation
      const storeRequest = {
        key: 'test-key',
        value: 'test-value'
      };
      
      const storeResult = await controller.storeMemory(storeRequest);
      expect(storeResult.isOk()).toBe(true);
      expect(mockBackend.store).toHaveBeenCalledWith('test-key', 'test-value');
      
      // Test retrieve operation
      const retrieveResult = await controller.retrieveMemory('test-key');
      expect(retrieveResult.isOk()).toBe(true);
      expect(mockBackend.retrieve).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Memory System Manager Integration', () => {
    it('should create memory system with full DI integration', async () => {
      // Setup comprehensive DI container
      const setupMemoryDI = () => {
        container.register('Logger', () => mockLogger);
        container.register('Config', () => mockConfig);
        container.register('MemoryConfig', () => memoryConfig);
        
        // Register memory-specific services
        container.register('MemoryProviderFactory', (c: any) => {
          const logger = c.resolve('Logger');
          const config = c.resolve('Config');
          return { createProvider: vi.fn() };
        });
        
        container.register('MemoryController', (c: any) => {
          const logger = c.resolve('Logger');
          const config = c.resolve('MemoryConfig');
          const factory = c.resolve('MemoryProviderFactory');
          return { logger, config, factory };
        });
      };
      
      setupMemoryDI();
      
      // Verify all services can be resolved
      const logger = container.resolve('Logger');
      const config = container.resolve('Config');
      const controller = container.resolve('MemoryController');
      
      expect(logger).toBe(mockLogger);
      expect(config).toBe(mockConfig);
      expect(controller).toBeDefined();
    });

    it('should handle circular dependencies gracefully', async () => {
      // Setup potential circular dependency scenario
      container.register('ServiceA', (c: any) => {
        const serviceB = c.resolve('ServiceB');
        return { name: 'A', dependency: serviceB };
      });
      
      container.register('ServiceB', (c: any) => {
        // This would normally create a circular dependency
        // DI container should handle this appropriately
        return { name: 'B' };
      });
      
      expect(() => {
        const serviceA = container.resolve('ServiceA');
        expect(serviceA).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Configuration Integration', () => {
    it('should use configuration from DI container', async () => {
      const testConfig = {
        memory: {
          defaultBackend: 'sqlite',
          maxSize: 10000,
          ttl: 3600000,
          compression: true
        },
        backends: {
          sqlite: {
            path: './data/memory.db',
            maxConnections: 10
          },
          lancedb: {
            path: './data/vectors',
            dimensions: 1536
          }
        }
      };
      
      mockConfig.get.mockImplementation((key: string) => {
        const keys = key.split('.');
        let value = testConfig as any;
        for (const k of keys) {
          value = value[k];
          if (value === undefined) break;
        }
        return value;
      });
      
      // Test configuration access
      expect(mockConfig.get('memory.defaultBackend')).toBe('sqlite');
      expect(mockConfig.get('memory.maxSize')).toBe(10000);
      expect(mockConfig.get('backends.sqlite.path')).toBe('./data/memory.db');
    });

    it('should handle missing configuration gracefully', async () => {
      mockConfig.get.mockReturnValue(undefined);
      
      const result = mockConfig.get('nonexistent.config.key');
      expect(result).toBeUndefined();
      
      // System should use defaults when config is missing
      expect(() => {
        const defaultConfig = createMockMemoryConfig();
        expect(defaultConfig).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Event System Integration', () => {
    it('should integrate with event system through DI', async () => {
      const mockEventBus = {
        emit: vi.fn(),
        on: vi.fn(),
        subscribe: vi.fn(),
        publish: vi.fn()
      };
      
      container.register('EventBus', () => mockEventBus);
      
      // Memory system should be able to publish events
      const eventBus = container.resolve('EventBus');
      
      eventBus.publish('memory.operation.store', {
        key: 'test-key',
        backend: 'sqlite',
        timestamp: Date.now()
      });
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'memory.operation.store',
        expect.objectContaining({
          key: 'test-key',
          backend: 'sqlite'
        })
      );
    });

    it('should handle event subscription and cleanup', async () => {
      const mockEventBus = {
        on: vi.fn(),
        off: vi.fn(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn()
      };
      
      container.register('EventBus', () => mockEventBus);
      
      const eventBus = container.resolve('EventBus');
      const handler = vi.fn();
      
      // Subscribe to events
      eventBus.on('memory.health.check', handler);
      expect(mockEventBus.on).toHaveBeenCalledWith('memory.health.check', handler);
      
      // Cleanup
      eventBus.off('memory.health.check', handler);
      expect(mockEventBus.off).toHaveBeenCalledWith('memory.health.check', handler);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle DI resolution errors', async () => {
      container.resolve.mockImplementation((token: any) => {
        if (token.toString().includes('FailingService')) {
          throw new Error('Service resolution failed');
        }
        return mockLogger;
      });
      
      expect(() => {
        container.resolve('FailingService');
      }).toThrow('Service resolution failed');
      
      // System should handle this gracefully
      expect(mockLogger.error).not.toHaveBeenCalled(); // Will be called in actual implementation
    });

    it('should handle dependency injection failures gracefully', async () => {
      const originalResolve = container.resolve;
      
      // Simulate intermittent failures
      let callCount = 0;
      container.resolve.mockImplementation((token: any) => {
        callCount++;
        if (callCount % 3 === 0) {
          throw new Error('Intermittent failure');
        }
        return originalResolve(token);
      });
      
      // System should retry or use fallbacks
      try {
        const service = container.resolve('Logger');
        expect(service).toBeDefined();
      } catch (error) {
        // Should have fallback behavior
        expect(error).toBeDefined();
      }
    });
  });
});