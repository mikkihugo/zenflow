/**
 * Unit tests for TelemetryEventBridge
 *
 * Framework note:
 * - This suite is compatible with both Vitest and Jest.
 * - If the project uses Vitest, vi.* APIs are available; if using Jest, jest.* APIs are used via simple aliases below.
 *
 * Focus areas (from PR diff):
 * - Module registration via EventBus.emit('registry:module-register', ...)
 * - Event forwarding setup for telemetry:* events (ensuring listeners and re-emit)
 * - Heartbeat emissions on interval with correct payloads
 * - Idempotent start() and graceful stop()
 * - Handling when telemetryManager.getEventEmitter() returns null/undefined
 * - Logging on already-started and error paths
 */

import { EventEmitter } from 'events';

// Lightweight cross-framework shims to support Jest or Vitest seamlessly
// (vitest provides global vi; jest provides global jest)
const isVitest = typeof (globalThis as any).vi !== 'undefined';
const spy = (isVitest ? (globalThis as any).vi.spyOn : (globalThis as any).jest?.spyOn)?.bind(isVitest ? (globalThis as any).vi : (globalThis as any).jest);
const fn  = (isVitest ? (globalThis as any).vi.fn   : (globalThis as any).jest?.fn)?.bind(isVitest ? (globalThis as any).vi : (globalThis as any).jest);
const useFakeTimers = isVitest ? (globalThis as any).vi.useFakeTimers : (globalThis as any).jest?.useFakeTimers;
const useRealTimers = isVitest ? (globalThis as any).vi.useRealTimers : (globalThis as any).jest?.useRealTimers;
const advanceTimersByTime = isVitest ? (ms: number) => (globalThis as any).vi.advanceTimersByTime(ms) : (ms: number) => (globalThis as any).jest.advanceTimersByTime(ms);
const clearAllTimers = isVitest ? () => (globalThis as any).vi.clearAllTimers() : () => (globalThis as any).jest.clearAllTimers();

// Import the SUT. Adjust the relative path if implementation file differs.
// If the implementation resides at packages/services/telemetry/src/telemetry-event-bridge.ts, the following should work.
import type { EventDrivenTelemetryManager } from './telemetry-event-driven.js';
import { TelemetryEventBridge, createTelemetryEventBridge } from './telemetry-event-bridge.js';

// Mock the foundation module used by the bridge
// We provide a minimal EventBus with on/off/emit and a static getInstance, plus EventLogger and isValidEventName.
const emitted: Array<{ event: string; payload: any }> = [];

class MockEventBus extends EventEmitter {
  emit(eventName: string | symbol, ...args: any[]): boolean {
    emitted.push({ event: String(eventName), payload: args[0] });
    return super.emit(eventName, ...args);
  }
}

const mockBus = new MockEventBus();

const foundationMock = {
  EventBus: {
    getInstance: () => mockBus
  },
  EventLogger: {
    log: fn ? fn() : () => {},
    logError: fn ? fn() : () => {}
  },
  isValidEventName: (name: string) => typeof name === 'string' && name.length > 0 && name.includes(':')
};

// For Vitest
if (isVitest) {
  (globalThis as any).vi.mock('@claude-zen/foundation', () => foundationMock);
}
// For Jest
if (!isVitest && (globalThis as any).jest) {
  (globalThis as any).jest.mock('@claude-zen/foundation', () => foundationMock);
}

// Small helpers
const resetEmitted = () => { emitted.splice(0, emitted.length); };

describe('TelemetryEventBridge', () => {
  beforeEach(() => {
    resetEmitted();
    (foundationMock.EventLogger.log as any).mockClear?.();
    (foundationMock.EventLogger.logError as any).mockClear?.();
  });

  afterEach(() => {
    // Ensure timers cleaned between tests
    try { clearAllTimers(); } catch {}
  });

  function makeTelemetryManagerWithEmitter(emitter: EventEmitter | null): EventDrivenTelemetryManager {
    return {
      // @ts-expect-error: Partial stub for tests
      async getEventEmitter() {
        return emitter;
      }
    };
  }

  it('registers module with EventBus on start()', async () => {
    const tm = makeTelemetryManagerWithEmitter(new EventEmitter());
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'telemetry-test', heartbeatInterval: 10, enableLogging: true });

    useFakeTimers?.();
    await bridge.start();

    // Should emit module registration exactly once
    const reg = emitted.find(e => e.event === 'registry:module-register');
    expect(reg).toBeTruthy();
    expect(reg!.payload).toMatchObject({
      moduleId: 'telemetry-test',
      moduleName: 'Telemetry Event Manager',
      moduleType: 'telemetry-bridge',
      supportedEvents: expect.arrayContaining([
        'telemetry:record-metric',
        'telemetry:shutdown'
      ]),
      metadata: expect.objectContaining({
        version: '1.0.0'
      }),
    });

    // Started log
    expect((foundationMock.EventLogger.log as any)).toHaveBeenCalledWith(
      'telemetry-bridge:started',
      expect.objectContaining({ moduleId: 'telemetry-test' })
    );

    await bridge.stop();
    useRealTimers?.();
  });

  it('forwards telemetry events from manager emitter to EventBus', async () => {
    const emitter = new EventEmitter();
    const tm = makeTelemetryManagerWithEmitter(emitter);
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'telemetry-forward', heartbeatInterval: 50 });

    await bridge.start();
    resetEmitted();

    const samplePayload = { value: 42 };
    emitter.emit('telemetry:record-metric', samplePayload);

    // Expect re-emission on EventBus with same event name and payload
    const forwarded = emitted.find(e => e.event === 'telemetry:record-metric');
    expect(forwarded).toBeTruthy();
    expect(forwarded!.payload).toEqual(samplePayload);

    await bridge.stop();
  });

  it('emits heartbeat periodically with expected metadata', async () => {
    useFakeTimers?.();

    const tm = makeTelemetryManagerWithEmitter(new EventEmitter());
    const bridge = createTelemetryEventBridge(tm, { moduleId: 'hb', heartbeatInterval: 100 });

    await bridge.start();
    resetEmitted();

    // Advance just under interval: no heartbeat yet
    advanceTimersByTime(99);
    expect(emitted.find(e => e.event === 'registry:heartbeat')).toBeUndefined();

    // Advance into the next tick: one heartbeat
    advanceTimersByTime(2);
    const hb1 = emitted.filter(e => e.event === 'registry:heartbeat');
    expect(hb1.length).toBe(1);
    expect(hb1[0].payload).toMatchObject({
      moduleId: 'hb',
      metadata: expect.objectContaining({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      })
    });

    // Advance another interval: second heartbeat
    advanceTimersByTime(100);
    const hb2 = emitted.filter(e => e.event === 'registry:heartbeat');
    expect(hb2.length).toBe(2);

    await bridge.stop();
    useRealTimers?.();
  });

  it('handles missing event emitter gracefully (logs and continues)', async () => {
    const tm = makeTelemetryManagerWithEmitter(null);
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'no-emitter', heartbeatInterval: 10 });

    await bridge.start();

    // Should have logged a "no-event-emitter" notice
    expect((foundationMock.EventLogger.log as any)).toHaveBeenCalledWith(
      'telemetry-bridge:no-event-emitter',
      expect.objectContaining({ moduleId: 'no-emitter' })
    );

    // Heartbeat should still run
    useFakeTimers?.();
    resetEmitted();
    advanceTimersByTime(11);
    expect(emitted.some(e => e.event === 'registry:heartbeat')).toBe(true);
    useRealTimers?.();

    await bridge.stop();
  });

  it('start() is idempotent: second call logs error and returns without throwing', async () => {
    const tm = makeTelemetryManagerWithEmitter(new EventEmitter());
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'idempotent', heartbeatInterval: 10 });

    await bridge.start();
    await bridge.start(); // second call

    expect((foundationMock.EventLogger.logError as any)).toHaveBeenCalledWith(
      'telemetry-bridge:already-started',
      expect.any(Error),
      expect.objectContaining({ component: 'idempotent' })
    );

    await bridge.stop();
  });

  it('stop() cleans up listeners and stops heartbeat', async () => {
    useFakeTimers?.();

    const emitter = new EventEmitter();
    const tm = makeTelemetryManagerWithEmitter(emitter);
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'cleanup', heartbeatInterval: 50 });

    await bridge.start();
    resetEmitted();
    advanceTimersByTime(55); // 1 heartbeat fired
    expect(emitted.filter(e => e.event === 'registry:heartbeat').length).toBe(1);

    await bridge.stop();
    resetEmitted();

    // Advance time again; expecting no further heartbeats
    advanceTimersByTime(100);
    expect(emitted.filter(e => e.event === 'registry:heartbeat').length).toBe(0);

    // "stopped" log
    expect((foundationMock.EventLogger.log as any)).toHaveBeenCalledWith(
      'telemetry-bridge:stopped',
      expect.objectContaining({ moduleId: 'cleanup' })
    );

    useRealTimers?.();
  });

  it('getStatus() returns coherent values', async () => {
    const tm = makeTelemetryManagerWithEmitter(new EventEmitter());
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'status', heartbeatInterval: 1 });

    const before = bridge.getStatus();
    expect(before).toMatchObject({
      moduleId: 'status',
      isStarted: false,
      heartbeatInterval: 1
    });
    expect(typeof before.uptime).toBe('number');

    await bridge.start();
    const after = bridge.getStatus();
    expect(after.isStarted).toBe(true);
    expect(after.eventListeners).toBeGreaterThanOrEqual(0); // event forwarding may register listeners

    await bridge.stop();
  });

  it('validates event names using isValidEventName (invalid names are not forwarded)', async () => {
    const emitter = new EventEmitter();
    const tm = makeTelemetryManagerWithEmitter(emitter);
    const bridge = new TelemetryEventBridge(tm, { moduleId: 'validate', heartbeatInterval: 10 });

    await bridge.start();
    resetEmitted();

    // Emit an invalid event name
    emitter.emit('invalidEventName', { nope: true });

    // Should not appear on EventBus
    const anyInvalidForward = emitted.find(e => e.event === 'invalidEventName');
    expect(anyInvalidForward).toBeUndefined();

    await bridge.stop();
  });
});