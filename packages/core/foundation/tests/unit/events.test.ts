/**
 * @fileoverview Event System Tests
 */

import { describe, expect, it } from 'vitest';

describe('Foundation Events', () => {
  describe('EventBus', () => {
    it('should create event bus', async () => {
      const { EventBus } = await import('../../src/events');

      const eventBus = new EventBus();
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.emit).toBe('function');
      expect(typeof eventBus.off).toBe('function');
    });

    it('should handle typed events', async () => {
      const { EventBus } = await import('../../src/events');

      interface TestEvents {
        message: { text: string; timestamp: number };
      }

      const eventBus = new EventBus<TestEvents>();
      let received: { text: string; timestamp: number } | null = null;

      eventBus.on('message', (data) => {
        received = data;
      });

      const testData = { text: 'hello', timestamp: Date.now() };
      const emitted = eventBus.emit('message', testData);

      expect(emitted).toBe(true);
      expect(received).toEqual(testData);
    });

    it('should handle multiple listeners', async () => {
      const { EventBus } = await import('../../src/events');

      interface TestEvents {
        test: { value: string };
      }

      const eventBus = new EventBus<TestEvents>();
      const results: string[] = [];

      eventBus.on('test', (data) => {
        results.push('listener1:' + data.value);
      });

      eventBus.on('test', (data) => {
        results.push('listener2:' + data.value);
      });

      eventBus.emit('test', { value: 'test' });

      expect(results).toHaveLength(2);
      expect(results).toContain('listener1:test');
      expect(results).toContain('listener2:test');
    });

    it('should remove listeners', async () => {
      const { EventBus } = await import('../../src/events');

      interface TestEvents {
        test: { count: number };
      }

      const eventBus = new EventBus<TestEvents>();
      let callCount = 0;

      const listener = () => {
        callCount++;
      };

      eventBus.on('test', listener);
      eventBus.emit('test', { count: 1 });
      expect(callCount).toBe(1);

      eventBus.off('test', listener);
      eventBus.emit('test', { count: 2 });
      expect(callCount).toBe(1); // Should not increase
    });

    it('should handle event configuration', async () => {
      const { EventBus } = await import('../../src/events');

      interface TestEvents {
        'config-test': { data: string };
      }

      const eventBus = new EventBus<TestEvents>({
        enableMetrics: true,
        maxListeners: 3,
      });

      expect(eventBus).toBeDefined();

      // Should accept multiple listeners up to limit
      eventBus.on('config-test', () => {});
      eventBus.on('config-test', () => {});
      eventBus.on('config-test', () => {});

      // Should not throw for normal usage
      expect(() => {
        eventBus.emit('config-test', { data: 'test' });
      }).not.toThrow();
    });
  });
});
