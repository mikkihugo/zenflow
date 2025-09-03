/**
 * @fileoverview Comprehensive Event System Tests
 *
 * Targeted tests to improve coverage of src/events/event-bus.ts
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { EventBus } from '../../src/events';

describe('Event System - Comprehensive Coverage', () => {
  describe('EventBus Advanced Features', () => {
    interface TestEvents {
      data: { value: number };
      message: { text: string; id: string };
      error: { error: Error; context?: string };
      status: { status: 'online' | 'offline'; timestamp: number };
    }

    let eventBus: EventBus<TestEvents>;

    beforeEach(() => {
      eventBus = new EventBus<TestEvents>();
    });

    describe('Event Configuration', () => {
      it('should create with default configuration', () => {
        const defaultEventBus = new EventBus<TestEvents>();
        expect(defaultEventBus).toBeDefined();
      });

      it('should create with custom configuration', () => {
        const configuredEventBus = new EventBus<TestEvents>({
          enableMiddleware: true,
          enableMetrics: true,
          maxListeners: 10,
        });
        expect(configuredEventBus).toBeDefined();
      });

      it('should create with middleware disabled', () => {
        const noMiddlewareEventBus = new EventBus<TestEvents>({
          enableMiddleware: false,
          enableMetrics: false,
          maxListeners: 1000,
        });
        expect(noMiddlewareEventBus).toBeDefined();
      });
    });

    describe('Listener Management', () => {
      it('should add multiple listeners to same event', () => {
        const results: number[] = [];

        eventBus.on('data', (data) => {
          results.push(data.value * 2);
        });
        eventBus.on('data', (data) => {
          results.push(data.value + 1);
        });
        eventBus.on('data', (data) => {
          results.push(data.value - 1);
        });

        eventBus.emit('data', { value: 10 });

        expect(results).toHaveLength(3);
        expect(results).toContain(20); // * 2
        expect(results).toContain(11); // + 1
        expect(results).toContain(9); // - 1
      });

      it('should handle listener removal correctly', () => {
        let callCount = 0;

        const listener = () => {
          callCount++;
        };

        eventBus.on('status', listener);
        eventBus.emit('status', { status: 'online', timestamp: Date.now() });
        expect(callCount).toBe(1);

        eventBus.off('status', listener);
        eventBus.emit('status', { status: 'offline', timestamp: Date.now() });
        expect(callCount).toBe(1); // Should not increase
      });

      it('should handle removing non-existent listeners', () => {
        const listener = () => {};

        // Should not throw when removing listener that was never added
        expect(() => {
          eventBus.off('data', listener);
        }).not.toThrow();
      });

      it('should handle once listeners correctly', () => {
        let callCount = 0;
        let lastValue: number | undefined;

        eventBus.once('data', (data) => {
          callCount++;
          lastValue = data.value;
        });

        // First emit should trigger listener
        eventBus.emit('data', { value: 42 });
        expect(callCount).toBe(1);
        expect(lastValue).toBe(42);

        // Second emit should NOT trigger listener
        eventBus.emit('data', { value: 100 });
        expect(callCount).toBe(1); // Still 1
        expect(lastValue).toBe(42); // Still original value
      });

      it('should handle multiple once listeners', () => {
        const results: string[] = [];

        eventBus.once('message', (msg) => results.push('A:' + msg.text));
        eventBus.once('message', (msg) => results.push('B:' + msg.text));

        eventBus.emit('message', { text: 'test', id: '1' });

        expect(results).toHaveLength(2);
        expect(results).toContain('A:test');
        expect(results).toContain('B:test');

        // Second emit should not trigger any listeners
        results.length = 0;
        eventBus.emit('message', { text: 'test2', id: '2' });
        expect(results).toHaveLength(0);
      });
    });

    describe('Event Emission', () => {
      it('should return false when no listeners exist', () => {
        const result = eventBus.emit('data', { value: 123 });
        expect(result).toBe(false);
      });

      it('should return true when listeners exist and are called', () => {
        eventBus.on('data', () => {});
        const result = eventBus.emit('data', { value: 123 });
        expect(result).toBe(true);
      });

      it('should handle mixed regular and once listeners', () => {
        const results: string[] = [];

        eventBus.on('message', (msg) => results.push('regular:' + msg.text));
        eventBus.once('message', (msg) => results.push('once:' + msg.text));

        // First emit
        eventBus.emit('message', { text: 'first', id: '1' });
        expect(results).toEqual(['regular:first', 'once:first']);

        // Second emit - only regular listener should fire
        results.length = 0;
        eventBus.emit('message', { text: 'second', id: '2' });
        expect(results).toEqual(['regular:second']);
      });
    });

    describe('Error Handling in Listeners', () => {
      it('should continue calling other listeners if one throws', () => {
        const results: number[] = [];

        eventBus.on('data', () => {
          throw new Error('First listener error');
        });
        eventBus.on('data', (data) => {
          results.push(data.value);
        });
        eventBus.on('data', () => {
          throw new Error('Third listener error');
        });
        eventBus.on('data', (data) => {
          results.push(data.value * 2);
        });

        // Should not throw and should still call non-throwing listeners
        expect(() => {
          eventBus.emit('data', { value: 5 });
        }).not.toThrow();

        expect(results).toEqual([5, 10]);
      });
    });

    describe('Complex Event Data', () => {
      it('should handle error events with complex data', () => {
        let capturedError: Error | undefined;
        let capturedContext: string | undefined;

        eventBus.on('error', (errorData) => {
          capturedError = errorData.error;
          capturedContext = errorData.context;
        });

        const testError = new Error('Test error message');
        eventBus.emit('error', { error: testError, context: 'test-context' });

        expect(capturedError).toBe(testError);
        expect(capturedContext).toBe('test-context');
      });

      it('should handle events with optional properties', () => {
        let capturedData: { error: Error; context?: string } | undefined;

        eventBus.on('error', (errorData) => {
          capturedData = errorData;
        });

        // Emit without optional context
        const testError = new Error('No context');
        eventBus.emit('error', { error: testError });

        expect(capturedData?.error).toBe(testError);
        expect(capturedData?.context).toBeUndefined();
      });
    });

    describe('Event System State', () => {
      it('should handle rapid event emissions', () => {
        const results: number[] = [];

        eventBus.on('data', (data) => {
          results.push(data.value);
        });

        // Emit many events rapidly
        for (let i = 0; i < 100; i++) {
          eventBus.emit('data', { value: i });
        }

        expect(results).toHaveLength(100);
        expect(results[0]).toBe(0);
        expect(results[99]).toBe(99);
      });

      it('should handle event emissions during listener execution', () => {
        const results: string[] = [];

        eventBus.on('message', (msg) => {
          results.push('outer:' + msg.text);

          // Emit another event during listener execution
          if (msg.text === 'trigger') {
            eventBus.emit('message', { text: 'inner', id: 'inner' });
          }
        });

        eventBus.emit('message', { text: 'trigger', id: 'outer' });

        expect(results).toEqual(['outer:trigger', 'outer:inner']);
      });
    });

    describe('Listener Cleanup', () => {
      it('should properly clean up once listeners after execution', () => {
        let executed = false;
        const listener = () => {
          executed = true;
        };

        eventBus.once('data', listener);

        // Emit to trigger once listener
        eventBus.emit('data', { value: 1 });
        expect(executed).toBe(true);

        // Try to remove already-cleaned-up listener
        expect(() => {
          eventBus.off('data', listener);
        }).not.toThrow();
      });
    });

    describe('Multiple Event Types', () => {
      it('should handle multiple different event types simultaneously', () => {
        const dataResults: number[] = [];
        const messageResults: string[] = [];
        const statusResults: string[] = [];

        eventBus.on('data', (data) => dataResults.push(data.value));
        eventBus.on('message', (msg) => messageResults.push(msg.text));
        eventBus.on('status', (status) => statusResults.push(status.status));

        // Emit different types of events
        eventBus.emit('data', { value: 42 });
        eventBus.emit('message', { text: 'hello', id: '1' });
        eventBus.emit('status', { status: 'online', timestamp: Date.now() });
        eventBus.emit('data', { value: 100 });

        expect(dataResults).toEqual([42, 100]);
        expect(messageResults).toEqual(['hello']);
        expect(statusResults).toEqual(['online']);
      });
    });
  });
});
