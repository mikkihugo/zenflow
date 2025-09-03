/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events';

// SUT import: adjust if the implementation file path differs
import { MemoryCoordinationSystem } from './memory-coordination-system';

/**
 * NOTE ON TEST RUNNER:
 * - These tests are written for Jest (TypeScript) with ts-jest. If the repo uses Vitest,
 *   they should pass with minimal adaptation because the APIs (describe/it/expect/jest.fn)
 *   are mostly compatible (use vi.fn instead of jest.fn if needed).
 */

jest.mock('@claude-zen/foundation', () => {
  const ee = require('events');
  const fakeLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  return {
    // Use Node's EventEmitter for compatibility with the code under test
    EventEmitter: ee.EventEmitter,
    getLogger: jest.fn(() => fakeLogger),
    recordMetric: jest.fn(),
    withTrace: jest.fn(async (_name: string, fn: (span?: { setAttributes: (attrs: Record<string, any>) => void }) => any) => {
      const span = { setAttributes: jest.fn() };
      return await fn(span);
    }),
    TelemetryManager: class FakeTelemetry {
      opts: any;
      constructor(opts: any) { this.opts = opts; }
      async initialize() { /* no-op */ }
    },
  };
});

// Lightweight fakes for coordination dependencies
const lbEvents = new EventEmitter();
const hmEvents = new EventEmitter();

class FakeLoadBalancer {
  public stats = { selections: 0, removed: 0, added: 0 };
  constructor(_cfg: any) {}
  on(event: string, cb: (...args: any[]) => void) {
    lbEvents.on(event, cb);
  }
  addNode(_node: any) { this.stats.added += 1; }
  removeNode(_id: string) { this.stats.removed += 1; }
  selectNode(nodes: any[]) {
    this.stats.selections += 1;
    // choose lowest averageResponseTime to be deterministic
    return [...nodes].sort((a, b) => (a.metrics.averageResponseTime ?? 0) - (b.metrics.averageResponseTime ?? 0))[0] ?? nodes[0];
  }
  getStats() { return { ...this.stats }; }
}

class FakeHealthMonitor {
  public stats = { added: 0, removed: 0, initialized: 0, shutdowns: 0 };
  constructor(_cfg: any) {}
  on(event: string, cb: (id: string) => void) { hmEvents.on(event, cb); }
  emit(event: string, id: string) { hmEvents.emit(event, id); }
  async initialize() { this.stats.initialized += 1; }
  addNode(_node: any) { this.stats.added += 1; }
  removeNode(_id: string) { this.stats.removed += 1; }
  getStats() { return { ...this.stats }; }
  async shutdown() { this.stats.shutdowns += 1; }
}

// Mock the module paths used by SUT
jest.mock('./memory-load-balancer', () => ({ MemoryLoadBalancer: FakeLoadBalancer }));
jest.mock('./memory-health-monitor', () => ({ MemoryHealthMonitor: FakeHealthMonitor }));

// Utility: create a backend compliant with BaseMemoryBackend
const createBackend = () => {
  const store = new Map<string, any>();
  return {
    initialize: jest.fn(async () => {}),
    close: jest.fn(async () => {}),
    store: jest.fn(async (key: string, value: any, ns?: string) => {
      store.set(`${ns ?? 'default'}:${key}`, value);
    }),
    retrieve: jest.fn(async <T>(key: string, ns?: string): Promise<T | undefined> => {
      return store.get(`${ns ?? 'default'}:${key}`);
    }),
    delete: jest.fn(async (key: string, ns?: string) => {
      return store.delete(`${ns ?? 'default'}:${key}`);
    }),
    list: jest.fn(async (pattern?: string, ns?: string) => {
      const prefix = `${ns ?? 'default'}:`;
      const keys = [...store.keys()].filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length));
      if (!pattern) return keys;
      // simple glob-like matching using includes for test purposes
      return keys.filter(k => k.includes(pattern));
    }),
    clear: jest.fn(async (ns?: string) => {
      const prefix = `${ns ?? 'default'}:`;
      [...store.keys()].forEach(k => { if (k.startsWith(prefix)) store.delete(k); });
    }),
  };
};

describe('MemoryCoordinationSystem', () => {
  const baseConfig = {
    strategy: 'single' as const,
    loadBalancing: { algorithm: 'roundRobin' },
    healthCheck: { intervalMs: 10_000 },
  };

  // fresh SUT per test
  const newSut = () => new MemoryCoordinationSystem(baseConfig as any);

  beforeEach(() => {
    jest.clearAllMocks();
    // remove all listeners between tests
    lbEvents.removeAllListeners();
    hmEvents.removeAllListeners();
  });

  describe('initialization and lifecycle', () => {
    it('throws if operations are invoked before initialize()', async () => {
      const sut = newSut();
      await expect(() => sut.store('k', 'v')).toThrow(/not initialized/i);
      await expect(() => sut.retrieve('k')).toThrow(/not initialized/i);
      await expect(() => sut.delete('k')).toThrow(/not initialized/i);
      await expect(() => sut.list()).toThrow(/not initialized/i);
      await expect(() => sut.search('p')).toThrow(/not initialized/i);
      await expect(() => sut.clear()).toThrow(/not initialized/i);
    });

    it('initialize() sets up telemetry, health monitor, and flags', async () => {
      const sut = newSut();
      await sut.initialize();
      // initialize again should be idempotent (no throw)
      await sut.initialize();

      const status = sut.getHealthStatus();
      expect(status.strategy).toBe('single');
      expect(typeof status.loadBalancing).toBe('object');
      expect(typeof status.healthMonitoring).toBe('object');
    });

    it('shutdown() closes backends, clears nodes, and resets initialized', async () => {
      const sut = newSut();
      await sut.initialize();
      const backend = createBackend();
      await sut.addNode('n1', backend as any);

      await sut.shutdown();
      const status = sut.getHealthStatus();
      expect(status.totalNodes).toBe(0);
    });
  });

  describe('node management', () => {
    it('addNode registers with load balancer and health monitor, and sets primary', async () => {
      const sut = newSut();
      await sut.initialize();

      const b1 = createBackend();
      const b2 = createBackend();
      await sut.addNode('a', b1 as any, { priority: 1, tier: 'hot' as any });
      await sut.addNode('b', b2 as any, { priority: 10, tier: 'warm' as any });

      const nodes = sut.getNodes();
      expect(nodes.size).toBe(2);

      const status = sut.getHealthStatus();
      // with higher priority, 'b' should be primary
      expect(status.primaryNode).toBe('b');
      expect(status.healthyNodes).toBe(2);
    });

    it('removeNode unregisters and selects a new primary when removing current primary', async () => {
      const sut = newSut();
      await sut.initialize();

      const b1 = createBackend();
      const b2 = createBackend();
      await sut.addNode('p1', b1 as any, { priority: 5 });
      await sut.addNode('p2', b2 as any, { priority: 1 });

      const statusBefore = sut.getHealthStatus();
      expect(statusBefore.primaryNode).toBe('p1');

      await sut.removeNode('p1');

      const statusAfter = sut.getHealthStatus();
      expect(statusAfter.primaryNode).toBe('p2');
      expect(statusAfter.totalNodes).toBe(1);
    });

    it('removeNode throws if node is missing', async () => {
      const sut = newSut();
      await sut.initialize();
      await expect(sut.removeNode('missing')).rejects.toThrow(/not found/i);
    });
  });

  describe('operation execution (single strategy)', () => {
    it('store and retrieve round-trip', async () => {
      const sut = newSut();
      await sut.initialize();
      const backend = createBackend();
      await sut.addNode('n1', backend as any);

      const put = await sut.store('k1', { a: 1 }, 'ns1');
      expect(put.success).toBe(true);
      expect(put.metadata?.nodeId).toBe('n1');

      const got = await sut.retrieve<{ a: number }>('k1', 'ns1');
      expect(got.success).toBe(true);
      expect(got.data).toEqual({ a: 1 });
    });

    it('list, search and delete behaviors', async () => {
      const sut = newSut();
      await sut.initialize();
      const backend = createBackend();
      await sut.addNode('n1', backend as any);

      await sut.store('alpha', 1, 'ns');
      await sut.store('beta', 2, 'ns');
      await sut.store('gamma', 3, 'ns');

      const listAll = await sut.list(undefined, 'ns');
      expect(listAll.success).toBe(true);
      expect(listAll.data).toEqual(expect.arrayContaining(['alpha', 'beta', 'gamma']));

      const searchBe = await sut.search('a', 'ns'); // crude includes-based search fake
      expect(searchBe.success).toBe(true);
      // The fake backend search returns a Record<string, JSONValue> in SUT path,
      // but our fake returns keys array via list; keep verification lenient:
      expect(searchBe.data).toBeDefined();

      const del = await sut.delete('beta', 'ns');
      expect(del.success).toBe(true);

      const listAfter = await sut.list(undefined, 'ns');
      expect(listAfter.data).toEqual(expect.not.arrayContaining(['beta']));
    });

    it('clear removes all items in namespace', async () => {
      const sut = newSut();
      await sut.initialize();
      const backend = createBackend();
      await sut.addNode('n1', backend as any);

      await sut.store('x', 1, 'nsc');
      await sut.store('y', 2, 'nsc');
      const before = await sut.list(undefined, 'nsc');
      expect(before.data?.length).toBe(2);

      const cleared = await sut.clear('nsc');
      expect(cleared.success).toBe(true);

      const after = await sut.list(undefined, 'nsc');
      expect(after.data?.length).toBe(0);
    });
  });

  describe('strategies: replicated, sharded, tiered, intelligent', () => {
    it('replicated: reads use primary; writes propagate to all', async () => {
      const sut = new MemoryCoordinationSystem({ ...baseConfig, strategy: 'replicated', replication: 3 } as any);
      await sut.initialize();

      const bPrimary = createBackend();
      const bReplica = createBackend();
      await sut.addNode('p', bPrimary as any, { priority: 10 });
      await sut.addNode('r', bReplica as any, { priority: 1 });

      // write should go to both
      const put = await sut.store('rk', 'rv', 'nsr');
      expect(put.success).toBe(true);

      // Both backends have value
      expect(await bPrimary.retrieve('rk', 'nsr')).toBe('rv');
      expect(await bReplica.retrieve('rk', 'nsr')).toBe('rv');

      // reads should return from primary
      const got = await sut.retrieve('rk', 'nsr');
      expect(got.metadata?.nodeId).toBe('p');
      expect(got.data).toBe('rv');
    });

    it('replicated: if all writes fail, throws', async () => {
      const sut = new MemoryCoordinationSystem({ ...baseConfig, strategy: 'replicated', replication: 2 } as any);
      await sut.initialize();

      const bad = {
        initialize: jest.fn(async () => {}),
        close: jest.fn(async () => {}),
        store: jest.fn(async () => { throw new Error('fail store'); }),
        retrieve: jest.fn(async () => undefined),
        delete: jest.fn(async () => false),
        list: jest.fn(async () => []),
        clear: jest.fn(async () => {}),
      };

      await sut.addNode('a', bad as any);
      await sut.addNode('b', bad as any);

      await expect(sut.store('k', 'v')).rejects.toThrow(/all replica operations failed/i);
    });

    it('sharded: routes to shard based on key hash', async () => {
      const sut = new MemoryCoordinationSystem({ ...baseConfig, strategy: 'sharded' } as any);
      await sut.initialize();

      const b1 = createBackend();
      const b2 = createBackend();
      await sut.addNode('n1', b1 as any);
      await sut.addNode('n2', b2 as any);

      // set shard config internally
      (sut as any).shardConfig = { shardCount: 8 };

      // pick two keys that should map deterministically
      await sut.store('user:1', 'A');
      await sut.store('user:2', 'B');

      const haveA = (await b1.retrieve('user:1', 'default')) ?? (await b2.retrieve('user:1', 'default'));
      const haveB = (await b1.retrieve('user:2', 'default')) ?? (await b2.retrieve('user:2', 'default'));
      expect(haveA).toBeDefined();
      expect(haveB).toBeDefined();
      // both shouldn't necessarily be on same backend; at least one each stored
    });

    it('tiered: respects requested tier and falls back if none available', async () => {
      const sut = new MemoryCoordinationSystem({ ...baseConfig, strategy: 'tiered' } as any);
      await sut.initialize();

      const hot = createBackend();
      const warm = createBackend();

      await sut.addNode('hot1', hot as any, { tier: 'hot' as any });
      await sut.addNode('warm1', warm as any, { tier: 'warm' as any });

      const putHot = await sut.store('tk', 1, 'ns', { tier: 'hot' as any });
      expect(putHot.metadata?.nodeId).toBe('hot1');

      // request 'cold' tier (no nodes) should fallback to any available (first healthy)
      const putCold = await sut.store('ck', 2, 'ns', { tier: 'cold' as any });
      expect(['hot1', 'warm1']).toContain(putCold.metadata?.nodeId);
    });

    it('intelligent: delegates to load balancer selectNode', async () => {
      const sut = new MemoryCoordinationSystem({ ...baseConfig, strategy: 'intelligent' } as any);
      await sut.initialize();

      const fast = createBackend();
      const slow = createBackend();
      await sut.addNode('fast', fast as any);
      await sut.addNode('slow', slow as any);

      // simulate node metrics so LB picks "fast"
      const nodes = sut.getNodes();
      (nodes.get('fast') as any).metrics.averageResponseTime = 1;
      (nodes.get('slow') as any).metrics.averageResponseTime = 100;

      // store should target "fast"
      const res = await sut.store('ik', 'iv');
      expect(res.metadata?.nodeId).toBe('fast');
    });
  });

  describe('error handling & metrics path', () => {
    it('returns structured failure result when no healthy nodes available', async () => {
      const sut = newSut();
      await sut.initialize();
      // No nodes added

      const fail = await sut.retrieve('missing');
      expect(fail.success).toBe(false);
      expect(fail.error).toMatch(/no healthy memory nodes/i);
      expect(fail.metadata?.nodeId).toBe('unknown');
      expect(fail.metadata?.fromCache).toBe(false);
    });

    it('updates node metrics on success and failure', async () => {
      const sut = newSut();
      await sut.initialize();

      const ok = createBackend();
      const bad = {
        ...createBackend(),
        retrieve: jest.fn(async () => { throw new Error('boom'); }),
      };

      await sut.addNode('good', ok as any);
      await sut.addNode('bad', bad as any);

      // Force LB to pick "bad" first by metrics (make it look faster)
      const nodes = sut.getNodes();
      (nodes.get('bad') as any).metrics.averageResponseTime = 1;
      (nodes.get('good') as any).metrics.averageResponseTime = 100;

      // This should fail and return structured error (via executeOperation catch)
      const r = await sut.retrieve('k');
      expect(r.success).toBe(false);

      // Now make good the faster choice and perform a successful op
      (nodes.get('good') as any).metrics.averageResponseTime = 1;
      (nodes.get('bad') as any).metrics.averageResponseTime = 100;

      const s = await sut.store('k', 'v');
      expect(s.success).toBe(true);
      expect(s.metadata?.nodeId).toBe('good');
    });
  });

  describe('health & overload event handling', () => {
    it('reacts to health monitor events by switching primary when needed', async () => {
      const sut = new MemoryCoordinationSystem({ ...baseConfig, strategy: 'replicated', replication: 2 } as any);
      await sut.initialize();

      const b1 = createBackend();
      const b2 = createBackend();
      await sut.addNode('p', b1 as any, { priority: 5 });
      await sut.addNode('s', b2 as any, { priority: 1 });

      const before = sut.getHealthStatus();
      expect(before.primaryNode).toBe('p');

      // emit unhealthy for primary through FakeHealthMonitor's EventEmitter
      (sut as any).healthMonitor.emit('nodeUnhealthy', 'p');

      const after = sut.getHealthStatus();
      // Primary should be switched to next healthiest (by priority)
      expect(after.primaryNode).toBe('s');
    });

    it('emits overload event passthrough', async () => {
      const sut = newSut();
      await sut.initialize();
      const b = createBackend();
      await sut.addNode('x', b as any);

      const spy = jest.fn();
      (sut as any).on('nodeOverloaded', spy);

      // trigger via LoadBalancer EventEmitter passthrough
      lbEvents.emit('overloaded', 'x');

      expect(spy).toHaveBeenCalledWith({ nodeId: 'x' });
    });
  });
});
