/* 
  Tests for packages/services/telemetry/src/index.ts

  Test Runner: Vitest (preferred) or Jest-compatible APIs.
  - If using Vitest: keep "import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'"
  - If using Jest: change to "import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'"
*/
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// IMPORTANT: We mock the modules that index.ts re-exports to avoid depending on their implementations.
vi.mock('./telemetry-event-driven.js', () => {
  const createEventDrivenTelemetryManager = vi.fn(() => ({ _tag: 'MockManager', id: 'mgr-1' }));
  const getEventDrivenTelemetry = vi.fn(() => ({ _tag: 'MockTelemetryAPI' }));
  const initializeEventDrivenTelemetry = vi.fn(async () => ({ initialized: true }));
  const shutdownEventDrivenTelemetry = vi.fn(async () => ({ shutdown: true }));
  class EventDrivenTelemetryManager {
    constructor() { this.kind = 'MockEDTM'; }
  }
  return {
    __esModule: true,
    createEventDrivenTelemetryManager,
    getEventDrivenTelemetry,
    initializeEventDrivenTelemetry,
    shutdownEventDrivenTelemetry,
    EventDrivenTelemetryManager,
  };
});

vi.mock('./telemetry-event-bridge.js', () => {
  class TelemetryEventBridge {
    constructor(cfg?: any){ this.cfg = cfg ?? { mocked: true }; }
  }
  const createTelemetryEventBridge = vi.fn((cfg?: any) => new TelemetryEventBridge(cfg));
  const getDefaultTelemetryBridgeConfig = vi.fn(() => ({ channel: 'mock', reliability: 'at-least-once' }));
  return {
    __esModule: true,
    TelemetryEventBridge,
    createTelemetryEventBridge,
    getDefaultTelemetryBridgeConfig,
  };
});

// Import after mocks so re-exports bind to mocked modules
import * as TelemetryIndex from './index.ts';

describe('telemetry index re-exports and factories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.resetModules();
  });

  it('re-exports createEventDrivenTelemetryManager and returns mocked manager', () => {
    expect(typeof TelemetryIndex.createEventDrivenTelemetryManager).toBe('function');
    const mgr = TelemetryIndex.createEventDrivenTelemetryManager();
    expect(mgr).toEqual({ _tag: 'MockManager', id: 'mgr-1' });
  });

  it('re-exports EventDrivenTelemetryManager class identity from telemetry-event-driven', async () => {
    // Validate identity passthrough by constructing and checking known property
    const Inst = TelemetryIndex.EventDrivenTelemetryManager as any;
    const inst = new Inst();
    expect(inst.kind).toBe('MockEDTM');
  });

  it('re-exports getEventDrivenTelemetry/initialize/shutdown functions as pass-throughs', async () => {
    const api = TelemetryIndex.getEventDrivenTelemetry();
    expect(api).toEqual({ _tag: 'MockTelemetryAPI' });

    const init = await TelemetryIndex.initializeEventDrivenTelemetry();
    expect(init).toEqual({ initialized: true });

    const shut = await TelemetryIndex.shutdownEventDrivenTelemetry();
    expect(shut).toEqual({ shutdown: true });
  });

  it('createTelemetryManager ignores config and delegates to createEventDrivenTelemetryManager', async () => {
    const sentinel = { any: 'config' };
    const mgr = TelemetryIndex.createTelemetryManager(sentinel as any);
    expect(mgr).toEqual({ _tag: 'MockManager', id: 'mgr-1' });

    // Ensure delegate called once and never with config (since underlying factory takes no args)
    const ted = await import('./telemetry-event-driven.js');
    expect((ted as any).createEventDrivenTelemetryManager).toHaveBeenCalledTimes(1);
    expect((ted as any).createEventDrivenTelemetryManager).toHaveBeenCalledWith();
  });

  it('createTelemetryAccess returns a facade with captured-config factory and lifecycle exports', () => {
    const cap = { cap: 'TURED' };
    const access = TelemetryIndex.createTelemetryAccess(cap as any);
    // surface API
    expect(access).toHaveProperty('createTelemetryManager');
    expect(access).toHaveProperty('getEventDrivenTelemetry', TelemetryIndex.getEventDrivenTelemetry);
    expect(access).toHaveProperty('initializeEventDrivenTelemetry', TelemetryIndex.initializeEventDrivenTelemetry);
    expect(access).toHaveProperty('shutdownEventDrivenTelemetry', TelemetryIndex.shutdownEventDrivenTelemetry);

    // When calling the facade's createTelemetryManager, it should call our module-level createTelemetryManager with captured config
    const spy = vi.spyOn(TelemetryIndex, 'createTelemetryManager');
    // Make spy return a distinct object so we can assert flow unambiguously
    const distinct = { _tag: 'SpyManager', id: 'mgr-2' };
    spy.mockReturnValue(distinct as any);

    const mgr = access.createTelemetryManager();
    expect(mgr).toBe(distinct);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(cap);

    spy.mockRestore();
  });

  it('re-exports event bridge symbols intact', () => {
    expect(TelemetryIndex).toHaveProperty('TelemetryEventBridge');
    expect(TelemetryIndex).toHaveProperty('createTelemetryEventBridge');
    expect(TelemetryIndex).toHaveProperty('getDefaultTelemetryBridgeConfig');

    const { TelemetryEventBridge, createTelemetryEventBridge, getDefaultTelemetryBridgeConfig } = TelemetryIndex as any;
    const cfg = getDefaultTelemetryBridgeConfig();
    expect(cfg).toEqual({ channel: 'mock', reliability: 'at-least-once' });

    const bridge = createTelemetryEventBridge(cfg);
    expect(bridge).toBeInstanceOf(TelemetryEventBridge);
    expect(bridge.cfg).toEqual(cfg);
  });

  it('createTelemetryAccess produces a fresh facade object each call (no shared mutation)', () => {
    const a = TelemetryIndex.createTelemetryAccess();
    const b = TelemetryIndex.createTelemetryAccess();
    expect(a).not.toBe(b);
    // Mutate a and ensure b unaffected
    (a as any).x = 1;
    expect((b as any).x).toBeUndefined();
  });

  it('defensive: createTelemetryManager handles undefined input', () => {
    const mgr = TelemetryIndex.createTelemetryManager(undefined);
    expect(mgr).toEqual({ _tag: 'MockManager', id: 'mgr-1' });
  });
});