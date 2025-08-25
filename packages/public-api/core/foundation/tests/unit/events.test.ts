/**
 * @fileoverview Event System Tests
 */

import { describe, it, expect } from 'vitest';

describe('Foundation Events', () => {
  describe('TypedEventBase', () => {
    it('should create event emitter', async () => {
      const { createTypedEventBase } = await import('../../src/events');

      const eventBase = createTypedEventBase();
      expect(eventBase).toBeDefined();
      expect(typeof eventBase.on).toBe('function');
      expect(typeof eventBase.emit).toBe('function');
      expect(typeof eventBase.off).toBe('function');
    });

    it('should handle typed events', async () => {
      const { createTypedEventBase } = await import('../../src/events');

      interface TestEvents {
        message: { text: string; timestamp: number };
      }

      const eventBase = createTypedEventBase<TestEvents>();
      let received: { text: string; timestamp: number } | null = null;

      eventBase.on('message', (data) => {
        received = data;
      });

      const testData = { text: 'hello', timestamp: Date.now() };
      const emitted = eventBase.emit('message', testData);

      expect(emitted).toBe(true);
      expect(received).toEqual(testData);
    });

    it('should handle multiple listeners', async () => {
      const { createTypedEventBase } = await import('../../src/events');

      interface TestEvents {
        test: { value: string };
      }

      const eventBase = createTypedEventBase<TestEvents>();
      const results: string[] = [];

      eventBase.on('test', (data) => {
        results.push(`listener1:${data.value}`);
      });

      eventBase.on('test', (data) => {
        results.push(`listener2:${data.value}`);
      });

      eventBase.emit('test', { value: 'test' });

      expect(results).toHaveLength(2);
      expect(results).toContain('listener1:test');
      expect(results).toContain('listener2:test');
    });

    it('should remove listeners', async () => {
      const { createTypedEventBase } = await import('../../src/events');

      interface TestEvents {
        test: { count: number };
      }

      const eventBase = createTypedEventBase<TestEvents>();
      let callCount = 0;

      const listener = () => {
        callCount++;
      };

      eventBase.on('test', listener);
      eventBase.emit('test', { count: 1 });
      expect(callCount).toBe(1);

      eventBase.off('test', listener);
      eventBase.emit('test', { count: 2 });
      expect(callCount).toBe(1); // Should not increase
    });

    it('should handle event configuration', async () => {
      const { createTypedEventBase } = await import('../../src/events');

      interface TestEvents {
        'config-test': { data: string };
      }

      const eventBase = createTypedEventBase<TestEvents>({
        enableValidation: true,
        enableMetrics: true,
        maxListeners: 3,
      });

      expect(eventBase).toBeDefined();

      // Should accept multiple listeners up to limit
      eventBase.on('config-test', () => {});
      eventBase.on('config-test', () => {});
      eventBase.on('config-test', () => {});

      // Should not throw for normal usage
      expect(() => {
        eventBase.emit('config-test', { data: 'test' });
      }).not.toThrow();
    });
  });
});
