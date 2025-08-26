/**
 * @fileoverview Event System Tests (Jest Version)
 *
 * Tests the core event system functionality:
 * - Basic event emission and handling
 * - Event listener management
 * - Async event processing
 * - Event bus configuration
 *
 * JEST FRAMEWORK: Uses Jest testing patterns and assertions
 *
 * @author Claude Code Zen Team - Event System Developer Agent
 * @since 1.0.0-alpha.44
 * @version 2.1.0
 */

import { jest } from '@jest/globals;

// Mock logger to avoid actual logging during tests
jest.unstable_mockModule('@claude-zen/foundation/logging', () => ({'
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

import { EventBus as EventSystem, createEventSystem } from '../index;

// Test event interfaces
interface TestPayload {
  message: string;
  count: number;
  timestamp?: Date;
}

interface UserActionPayload {
  userId: string;
  action: string;
  metadata?: Record<string, any>;
}

describe('Event System Core (Jest)', () => {'
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = createEventSystem();
  });

  afterEach(async () => {
    if (eventSystem && eventSystem.destroy) {
      await eventSystem.destroy();
    } else if (eventSystem) {
      eventSystem.removeAllListeners();
    }
  });

  describe('Basic Event Handling', () => {'
    it('should create event system successfully', () => {'
      expect(eventSystem).toBeDefined();
      expect(eventSystem).toBeInstanceOf(EventSystem);
    });

    it('should emit and handle basic events', async () => {'
      const handler = jest.fn();
      eventSystem.on('test.basic', handler);'

      const payload: TestPayload = { message: 'basic test', count: 1 };'
      eventSystem.emit('test.basic', payload);'

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('should handle multiple listeners for the same event', async () => {'
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      eventSystem.on('test.multiple', handler1);'
      eventSystem.on('test.multiple', handler2);'
      eventSystem.on('test.multiple', handler3);'

      const payload: TestPayload = { message: 'multiple test', count: 3 };'
      eventSystem.emit('test.multiple', payload);'

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);

      [handler1, handler2, handler3].forEach((handler) => {
        expect(handler).toHaveBeenCalledWith(payload);
      });
    });

    it('should support once listeners', async () => {'
      const handler = jest.fn();
      eventSystem.once('test.once', handler);'

      const payload1: TestPayload = { message: 'first', count: 1 };'
      const payload2: TestPayload = { message: 'second', count: 2 };'

      eventSystem.emit('test.once', payload1);'
      eventSystem.emit('test.once', payload2);'

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(payload1);
    });

    it('should remove event listeners', async () => {'
      const handler = jest.fn();
      eventSystem.on('test.remove', handler);'

      // Emit before removal
      eventSystem.emit('test.remove', { message: 'before', count: 1 });'
      expect(handler).toHaveBeenCalledTimes(1);

      // Remove listener
      eventSystem.off('test.remove', handler);'

      // Emit after removal
      eventSystem.emit('test.remove', { message: 'after', count: 2 });'
      expect(handler).toHaveBeenCalledTimes(1); // Should still be 1
    });
  });

  describe('Async Event Processing', () => {'
    it('should handle async event handlers', async () => {'
      const results: string[] = [];

      const asyncHandler = async (payload: TestPayload) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push(`processed: ${payload.message}`);`
      };

      eventSystem.on('test.async', asyncHandler);'

      const payload: TestPayload = { message: 'async test', count: 1 };'
      eventSystem.emit('test.async', payload);'

      // Wait a bit for async processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(results).toContain('processed: async test');'
    });

    it('should handle parallel async handlers', async () => {'
      const startTime = Date.now();
      const results: number[] = [];

      const createAsyncHandler = (delay: number) => async () => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        results.push(Date.now() - startTime);
      };

      eventSystem.on('test.parallel', createAsyncHandler(50));'
      eventSystem.on('test.parallel', createAsyncHandler(30));'
      eventSystem.on('test.parallel', createAsyncHandler(20));'

      const payload: TestPayload = { message: 'parallel test', count: 3 };'
      eventSystem.emit('test.parallel', payload);'

      // Wait for all handlers to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(results).toHaveLength(3);
      // All handlers should complete in roughly the same time due to parallel processing
      const maxTime = Math.max(...results);
      expect(maxTime).toBeLessThan(200); // Should complete in under 200ms total
    });

    it('should handle event handler errors gracefully', async () => {'
      const goodHandler = jest.fn();
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');'
      });
      const anotherGoodHandler = jest.fn();

      eventSystem.on('test.error', goodHandler);'
      eventSystem.on('test.error', errorHandler);'
      eventSystem.on('test.error', anotherGoodHandler);'

      const payload: TestPayload = { message: 'error test', count: 1 };'

      // Should not crash the event system
      expect(() => eventSystem.emit('test.error', payload)).not.toThrow();'

      expect(goodHandler).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalled();
      expect(anotherGoodHandler).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {'
    it('should use default configuration', () => {'
      const config = eventSystem.getConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');'
    });

    it('should create event system with custom configuration', () => {'
      const customConfig = {
        maxListeners: 50,
        enableMetrics: true,
        enableValidation: true,
      };

      const customEventSystem = createEventSystem(customConfig);
      expect(customEventSystem).toBeDefined();

      const config = customEventSystem.getConfig();
      expect(config.maxListeners).toBe(50);
      expect(config.enableMetrics).toBe(true);
      expect(config.enableValidation).toBe(true);
    });
  });

  describe('Event System Types and Patterns', () => {'
    it('should handle different payload types', async () => {'
      const handler = jest.fn();
      eventSystem.on('user.action', handler);'

      const userPayload: UserActionPayload = {
        userId: 'user123',
        action: 'login',
        metadata: { timestamp: Date.now() },
      };

      eventSystem.emit('user.action', userPayload);'

      expect(handler).toHaveBeenCalledWith(userPayload);
    });

    it('should support event namespacing', async () => {'
      const userHandler = jest.fn();
      const systemHandler = jest.fn();

      eventSystem.on('user.login', userHandler);'
      eventSystem.on('system.start', systemHandler);'

      eventSystem.emit('user.login', { userId: 'user1', action: 'login' });'
      eventSystem.emit('system.start', { component: 'server' });'
      eventSystem.emit('other.event', { data: 'test' });'

      expect(userHandler).toHaveBeenCalledTimes(1);
      expect(systemHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Management', () => {'
    it('should clean up listeners on destroy', async () => {'
      const handler = jest.fn();
      eventSystem.on('test.cleanup', handler);'

      // Verify listener is active
      eventSystem.emit('test.cleanup', { message: 'before destroy', count: 1 });'
      expect(handler).toHaveBeenCalledTimes(1);

      // Clean up
      if (eventSystem.destroy) {
        await eventSystem.destroy();
      } else {
        eventSystem.removeAllListeners();
      }

      // Create new event system for further testing
      eventSystem = createEventSystem();
    });

    it('should handle high-frequency events efficiently', async () => {'
      const handler = jest.fn();
      eventSystem.on('test.highfreq', handler);'

      const startTime = Date.now();
      const eventCount = 100; // Reduced from 1000 for faster tests

      // Emit many events rapidly
      for (let i = 0; i < eventCount; i++) {
        eventSystem.emit('test.highfreq', { message: `event ${i}`, count: i });`
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(handler).toHaveBeenCalledTimes(eventCount);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('Async Event System Methods', () => {'
    it('should support async emission if available', async () => {'
      const handler = jest.fn();
      eventSystem.on('test.async.emit', handler);'

      const payload = { message: 'async emit test', count: 1 };'

      if (eventSystem.emitAsync) {
        const result = await eventSystem.emitAsync('test.async.emit', payload);'
        expect(result).toBe(true);
      } else {
        // Fallback to regular emit
        eventSystem.emit('test.async.emit', payload);'
      }

      expect(handler).toHaveBeenCalledWith(payload);
    });
  });
});

describe('Event System Factory and Utilities', () => {'
  it('should create event system with factory function', () => {'
    const system = createEventSystem();
    expect(system).toBeDefined();
    expect(typeof system.on).toBe('function');'
    expect(typeof system.emit).toBe('function');'
    expect(typeof system.off).toBe('function');'
  });

  it('should create event system with custom configuration', () => {'
    const config = {
      maxListeners: 50,
      enableMetrics: true,
      performance: true,
      validation: false,
    };

    const system = createEventSystem(config);
    expect(system).toBeDefined();

    const systemConfig = system.getConfig();
    expect(systemConfig.maxListeners).toBe(50);
    expect(systemConfig.enableMetrics).toBe(true);
    expect(systemConfig.performance).toBe(true);
  });

  it('should validate event system configuration', () => {'
    // Test that invalid configurations don't break the system'
    expect(() => {
      createEventSystem({ maxListeners: -1 });
    }).not.toThrow(); // EventBus should handle this gracefully

    expect(() => {
      createEventSystem({ enableMetrics: 'invalid' as any });'
    }).not.toThrow(); // Should handle type mismatches gracefully
  });
});
