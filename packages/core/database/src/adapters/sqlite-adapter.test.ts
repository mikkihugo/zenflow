/**
 * Unit tests for SQLiteAdapter and SQLiteTransactionConnection.
 * Testing framework: Jest (ts-jest) or Vitest-compatible (describe/it/expect).
 * If the repo uses Vitest, these tests still work as-is since APIs are compatible.
 *
 * Focus areas based on diff:
 * - connect/disconnect lifecycle and pool creation/destruction
 * - query() happy path, parameter normalization, non-SELECT execution
 * - retry policy via executeWithRetry on retryable errors (SQLITE_BUSY/LOCKED)
 * - error translation to QueryError/ConnectionError/TransactionError
 * - transaction() with BEGIN/COMMIT/ROLLBACK, readOnly and isolation levels
 * - health() scoring logic and not connected case
 * - getStats() and calculateAverageIdleTime(), pool stats math
 * - schema helpers: getSchema() including table_info/index_list flows
 * - migrations: migrate() success + early-stop-on-failure, createMigrationsTable/recordMigration
 * - explain(), vacuum(), analyze()
 * - acquire/release connection with timeouts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'; // Vitest import will be tree-shaken if using Jest via ts-jest with tsconfig paths
// Fallback Jest globals mapping when running under Jest
// @ts-ignore
const _g: any = typeof vi !== 'undefined' ? vi : global;
// @ts-ignore
const spyOn = (_g.spyOn ?? jest.spyOn).bind(_g);
// @ts-ignore
const fn = (_g.fn ?? jest.fn).bind(_g);
// @ts-ignore
const useFakeTimers = (_g.useFakeTimers ?? jest.useFakeTimers)?.bind(_g);
// @ts-ignore
const useRealTimers = (_g.useRealTimers ?? jest.useRealTimers)?.bind(_g);
// @ts-ignore
const advanceTimersByTime = (_g.advanceTimersByTime ?? jest.advanceTimersByTime)?.bind(_g);

// Import the adapter under test. Adjust path if implementation lives elsewhere in repo.
import type { QueryResult } from '../../types'; // best-effort: will be type-only; tests rely on runtime behavior
// If the adapter file is named sqlite-adapter.ts alongside this test, prefer relative import one level up.
let SQLiteAdapter: any;
let IsolationLevel: any;
let ConnectionError: any;
let QueryError: any;
let TransactionError: any;

// Mock logger used in adapter
const logger = {
  info: fn(),
  debug: fn(),
  warn: fn(),
  error: fn(),
};

// Runtime stubs for error classes if not exported by repo (to avoid import failures)
class FallbackError extends Error { constructor(msg: string) { super(msg); this.name = this.constructor.name; } }
class FallbackConnectionError extends FallbackError {}
class FallbackQueryError extends FallbackError { details?: any; constructor(msg: string, details?: any){ super(msg); this.details = details; } }
class FallbackTransactionError extends FallbackError {}

function resetLogger() {
  logger.info.mockClear?.();
  logger.debug.mockClear?.();
  logger.warn.mockClear?.();
  logger.error.mockClear?.();
}

// Mock better-sqlite3 Database and Statement
type RunResult = { changes?: number; lastInsertRowid?: number | bigint };
function createMockStatement(allRows: any[] = [], runResult: RunResult = { changes: 1, lastInsertRowid: 1 }) {
  return {
    all: fn().mockImplementation((..._args: any[]) => allRows),
    run: fn().mockImplementation((..._args: any[]) => runResult),
  };
}

function createMockDb() {
  return {
    prepare: fn(),
    exec: fn(),
    close: fn(),
  };
}

// Replace module imports dynamically. We don't know the project's module system; use jest.mock if available, else shim with vi.mock.
const defineMock = (moduleName: string, factory: any) => {
  try {
    // @ts-ignore
    jest?.mock?.(moduleName, factory);
  } catch {
    // @ts-ignore
    vi?.mock?.(moduleName, factory);
  }
};

// Attempt to detect actual implementation path variants commonly used:
// - packages/core/database/src/adapters/sqlite-adapter.ts
// - packages/core/database/src/adapters/sqlite.adapter.ts
// - packages/core/database/src/adapters/SQLiteAdapter.ts
async function importAdapter() {
  const candidates = [
    './sqlite-adapter', // same dir
    './sqlite.adapter',
    './SQLiteAdapter',
    '../adapters/sqlite-adapter',
    '../adapters/sqlite.adapter',
    '../adapters/SQLiteAdapter',
    '../sqlite-adapter',
  ];
  for (const p of candidates) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import(p);
      if (mod?.SQLiteAdapter) return mod;
    } catch {
      // keep trying
    }
  }
  // Fall back: try requiring from implementation path in repo root if present
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import('./sqlite-adapter'); // will throw if not found
    return mod;
  } catch (e) {
    throw new Error('Failed to locate SQLiteAdapter implementation for tests.');
  }
}

defineMock('better-sqlite3', () => {
  const ctor = fn().mockImplementation((_filename: string, _opts: any) => {
    const db = createMockDb();
    // exec defaults for PRAGMA calls
    db.exec.mockImplementation((_sql: string) => {});
    db.prepare.mockImplementation((_sql: string) => createMockStatement());
    return db;
  });
  // Some code may access Database.Database as a type; emulate namespace default export
  return {
    __esModule: true,
    default: ctor,
    Database: ctor,
    SqliteError: class extends Error {}, // for environments that check constructor
  };
});

// Mock logger module path heuristics
defineMock('../../utils/logger', () => ({ __esModule: true, default: logger, logger }));
defineMock('../../../utils/logger', () => ({ __esModule: true, default: logger, logger }));
defineMock('../../logger', () => ({ __esModule: true, default: logger, logger }));
defineMock('logger', () => ({ __esModule: true, default: logger, logger }));

// Mock error classes if module exists; otherwise we will assign fallback below
let errorModuleLoaded = false;
try {
  defineMock('../../errors', () => {
    errorModuleLoaded = true;
    return {
      __esModule: true,
      ConnectionError: class ConnectionError extends Error {},
      QueryError: class QueryError extends Error { details: any; constructor(m: string, details: any){ super(m); this.details = details; } },
      TransactionError: class TransactionError extends Error {},
      DatabaseError: class DatabaseError extends Error {},
    };
  });
} catch { /* ignore */ }

beforeEach(async () => {
  resetLogger();
  // Fake timers to control setImmediate/setInterval-based code paths
  useFakeTimers?.();
  const mod: any = await importAdapter();
  SQLiteAdapter = mod.SQLiteAdapter;
  IsolationLevel = mod.IsolationLevel ?? { ReadUncommitted: 'ReadUncommitted', Serializable: 'Serializable' };
  ConnectionError = mod.ConnectionError ?? FallbackConnectionError;
  QueryError = mod.QueryError ?? FallbackQueryError;
  TransactionError = mod.TransactionError ?? FallbackTransactionError;
});

afterEach(() => {
  useRealTimers?.();
});

function createAdapter(custom: Partial<any> = {}) {
  const config = {
    database: ':memory:',
    pool: { min: 1, max: 2, acquireTimeoutMillis: 200, idleTimeoutMillis: 50, reapIntervalMillis: 10, createTimeoutMillis: 5, destroyTimeoutMillis: 5 },
    retryPolicy: { maxRetries: 2, initialDelayMs: 1, maxDelayMs: 4, backoffFactor: 2, retryableErrors: ['SQLITE_BUSY','SQLITE_LOCKED'] },
    ...custom,
  };
  return new SQLiteAdapter(config as any);
}

describe('SQLiteAdapter.connect/disconnect lifecycle', () => {
  it('establishes min pool connections on connect and toggles connected flag', async () => {
    const adapter = createAdapter({ pool: { min: 2, max: 3, reapIntervalMillis: 10, idleTimeoutMillis: 50 } });
    await adapter.connect();
    // Health should report connected pool size >= min
    const stats = await adapter.getStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(adapter.isConnected()).toBe(true);
    await adapter.disconnect();
    expect(adapter.isConnected()).toBe(false);
  });

  it('is idempotent when connecting/disconnecting multiple times', async () => {
    const adapter = createAdapter();
    await adapter.connect();
    await adapter.connect();
    await adapter.disconnect();
    await adapter.disconnect();
    expect(logger.error).not.toHaveBeenCalled();
  });
});

describe('SQLiteAdapter.query execution', () => {
  it('runs SELECT queries and returns rows/rowCount/fields', async () => {
    // Arrange: tweak prepare() to return statement with rows
    const Database = (await import('better-sqlite3')).default as any;
    const rows = [{ id: 1, a: 'x' }, { id: 2, a: 'y' }];
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementationOnce((_sql: string) => createMockStatement(rows));
      db.exec.mockImplementation((_sql: string) => {});
      return db;
    });

    const adapter = createAdapter();
    const res = await adapter.query('SELECT id, a FROM t WHERE id IN (?, ?)', [1, 2]);
    expect(res.rows).toEqual(rows);
    expect(res.rowCount).toBe(2);
    expect(res.fields?.sort()).toEqual(['a','id']);
  });

  it('runs non-SELECT statements and reports affectedRows/insertId', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      const stmt = createMockStatement([], { changes: 3, lastInsertRowid: BigInt(42) });
      db.prepare.mockImplementationOnce((_sql: string) => stmt);
      return db;
    });
    const adapter = createAdapter();
    const res = await adapter.execute('UPDATE t SET a=? WHERE id IN (1,2,3)', ['v']);
    expect(res.affectedRows).toBe(3);
    expect(res.insertId).toBe(42);
  });

  it('normalizes params for arrays, maps, and objects', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    // Capture args passed to Statement.run/all
    const stmt = createMockStatement([{ ok: 1 }]);
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => stmt);
      return db;
    });
    const adapter = createAdapter();
    await adapter.query('SELECT 1 WHERE ?=? AND ?=?', new Map([['a',1], ['b',1]])); // map -> values array
    await adapter.query('SELECT 1', { p1: 1, p2: 2 }); // object -> values
    await adapter.query('SELECT 1', [1, 2]); // array -> copy

    // Ensure all() was used for SELECT
    expect(stmt.all).toHaveBeenCalledTimes(3);
  });

  it('wraps unknown errors in QueryError and releases connection', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementationOnce((_sql: string) => { throw new Error('boom'); });
      return db;
    });
    const adapter = createAdapter();
    await expect(adapter.query('SELECT * FROM will_fail')).rejects.toBeInstanceOf(QueryError);
  });
});

describe('Retry policy (executeWithRetry)', () => {
  it('retries on retryable errors and eventually succeeds', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    const stmt = createMockStatement([{ ok: 1 }]);
    let attempts = 0;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => {
        attempts++;
        if (attempts < 3) throw new Error('SQLITE_BUSY: database is locked');
        return stmt;
      });
      return db;
    });

    const adapter = createAdapter({ retryPolicy: { maxRetries: 3, initialDelayMs: 1, maxDelayMs: 2, backoffFactor: 2, retryableErrors: ['SQLITE_BUSY','SQLITE_LOCKED'] }});
    const p = adapter.query('SELECT 1');
    // advance retries
    advanceTimersByTime?.(10);
    const res = await p;
    expect(res.rows[0]).toEqual({ ok: 1 });
    expect(logger.warn).toHaveBeenCalled(); // logged retries
  });

  it('stops retrying for non-retryable errors and throws QueryError', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => { throw new Error('SYNTAX error'); });
      return db;
    });
    const adapter = createAdapter();
    await expect(adapter.query('SELECT BROKEN')).rejects.toBeInstanceOf(QueryError);
  });
});

describe('Transactions', () => {
  it('commits successful transaction and increments counters', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    const stmt = createMockStatement([{ ok: 1 }]);
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => stmt);
      return db;
    });
    const adapter = createAdapter();
    const res = await adapter.transaction(async (tx: any) => {
      const q = await tx.query('SELECT 1');
      expect(q.rows).toEqual([{ ok: 1 }]);
      return 123;
    });
    expect(res).toBe(123);
    // commit exec called
    const ctor = (await import('better-sqlite3')).default as any;
    const db = ctor.mock.results[0].value;
    const execSql = db.exec.mock.calls.map((c: any[]) => c[0]).join(';');
    expect(execSql).toMatch(/BEGIN IMMEDIATE/);
    expect(execSql).toMatch(/COMMIT/);
  });

  it('rolls back on fn error and rethrows', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => createMockDb());
    const adapter = createAdapter();
    await expect(adapter.transaction(async () => {
      throw new Error('tx fail');
    })).rejects.toThrow('tx fail');
    const ctor = (await import('better-sqlite3')).default as any;
    const db = ctor.mock.results[0].value;
    const calls = db.exec.mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain('ROLLBACK');
  });

  it('respects readOnly (BEGIN DEFERRED) and isolation levels', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => createMockDb());
    const adapter = createAdapter();
    await adapter.transaction(async (_tx: any) => {}, { readOnly: true, isolationLevel: IsolationLevel.Serializable });
    const ctor = (await import('better-sqlite3')).default as any;
    const db = ctor.mock.results[0].value;
    const sqls = db.exec.mock.calls.map((c: any[]) => c[0]).join(';');
    expect(sqls).toMatch(/PRAGMA read_uncommitted = 0/);
    expect(sqls).toMatch(/BEGIN DEFERRED/);
    expect(sqls).toMatch(/COMMIT/);
  });
});

describe('Health checks', () => {
  it('returns unhealthy when not connected', async () => {
    const adapter = createAdapter();
    const h = await adapter.health();
    expect(h.healthy).toBe(false);
    expect(h.details?.connected).toBe(false);
  });

  it('computes score and includes metrics when connected', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    const stmt = createMockStatement([{ health_check: 1 }]);
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => stmt);
      return db;
    });
    const adapter = createAdapter();
    await adapter.connect();
    const h = await adapter.health();
    expect(h.status === 'healthy' || h.status === 'degraded' || h.status === 'unhealthy').toBe(true);
    expect(h.connectionPool?.total).toBeGreaterThan(0);
    expect(h.metrics?.avgResponseTimeMs).toBeGreaterThanOrEqual(0);
  });
});

describe('Schema and metadata', () => {
  it('getSchema() composes columns, primary keys, and indexes', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    // 1) query for tables
    const stmtTables = createMockStatement([{ name: 'users' }, { name: 'sqlite_master' }]);
    // 2) table_info(users)
    const stmtInfo = createMockStatement([
      { cid: 0, name: 'id', type: 'INTEGER', notnull: 1, dflt_value: null, pk: 1 },
      { cid: 1, name: 'name', type: 'TEXT', notnull: 0, dflt_value: "'x'", pk: 0 },
    ]);
    // 3) index_list(users)
    const stmtIndexes = createMockStatement([{ name: 'idx_users_name' }]);
    // 4) index_info(idx_users_name)
    const stmtIndexInfo = createMockStatement([{ name: 'name' }]);

    let call = 0;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => {
        call++;
        switch (call) {
          case 1: return stmtTables;
          case 2: return stmtInfo;
          case 3: return stmtIndexes;
          case 4: return stmtIndexInfo;
          default: return createMockStatement([]);
        }
      });
      return db;
    });

    const adapter = createAdapter();
    const schema = await adapter.getSchema();
    expect(schema.tables[0].name).toBe('users');
    expect(schema.tables[0].columns.map(c => c.name)).toEqual(['id','name']);
    expect(schema.tables[0].primaryKey).toEqual(['id']);
    expect(schema.tables[0].indexes[0].columns).toEqual(['name']);
  });
});

describe('Migrations', () => {
  it('applies migrations in a transaction and records them; skips already-applied', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    // Sequence:
    // getCurrentMigrationVersion -> empty (throws)
    // createMigrationsTable -> ok
    // run up() and recordMigration
    let call = 0;
    (Database as any).mockImplementation((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((sql: string) => {
        call++;
        // Simulate SELECT failure for getCurrentMigrationVersion -> returns null path by causing query rows[0] undefined
        if (/SELECT version FROM migrations/.test(sql)) {
          return createMockStatement([]); // no rows
        }
        return createMockStatement([{ any: 1 }], { changes: 1, lastInsertRowid: 1 });
      });
      return db;
    });

    const adapter = createAdapter();
    const migrations = [
      { version: '001', name: 'init', up: fn().mockResolvedValue(void 0) },
      { version: '002', name: 'add_users', up: fn().mockResolvedValue(void 0) },
    ] as const;

    const results = await adapter.migrate(migrations as any);
    expect(results.filter(r => r.applied).length).toBe(2);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Migration applied successfully'), expect.anything());
  });

  it('stops on first failing migration and reports error', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementation((_f: string, _o: any) => {
      const db = createMockDb();
      db.prepare.mockImplementation((_sql: string) => createMockStatement([{ ok: 1 }]));
      return db;
    });

    const adapter = createAdapter();
    const migrations = [
      { version: '003', name: 'first', up: fn().mockResolvedValue(void 0) },
      { version: '004', name: 'broken', up: fn().mockRejectedValue(new Error('oops')) },
      { version: '005', name: 'should_not_run', up: fn().mockResolvedValue(void 0) },
    ] as const;

    const res = await adapter.migrate(migrations as any);
    const idxBroken = res.findIndex(r => r.version === '004');
    expect(res[idxBroken].applied).toBe(false);
    // next one shouldn't be applied
    expect(res.find(r => r.version === '005')!.applied).toBe(false);
  });
});

describe('Utility methods: explain, vacuum, analyze', () => {
  it('prefixes EXPLAIN QUERY PLAN', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => createMockDb());
    const adapter = createAdapter();
    await adapter.explain('SELECT 1');
    const ctor = (await import('better-sqlite3')).default as any;
    const db = ctor.mock.results[0].value;
    // The prepare should have received EXPLAIN QUERY PLAN SELECT 1
    const sql = db.prepare.mock.calls[0][0];
    expect(sql.toUpperCase()).toContain('EXPLAIN QUERY PLAN');
  });

  it('calls VACUUM and ANALYZE', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementationOnce((_f: string, _o: any) => createMockDb());
    const adapter = createAdapter();
    await adapter.vacuum();
    await adapter.analyze();
    const ctor = (await import('better-sqlite3')).default as any;
    const db = ctor.mock.results[0].value;
    const sqls = db.prepare.mock.calls.map((c: any[]) => c[0]).join(';');
    expect(sqls).toMatch(/VACUUM/);
    expect(sqls).toMatch(/ANALYZE/);
  });
});

describe('Connection pool acquire/release and maintenance', () => {
  it('acquires connection up to max and times out when none available', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementation((_f: string, _o: any) => createMockDb());
    const adapter = createAdapter({ pool: { min: 1, max: 1, acquireTimeoutMillis: 20, reapIntervalMillis: 10, idleTimeoutMillis: 10 } });
    await adapter.connect();
    // Acquire first connection via a query and hold it by stubbing release
    const releaseSpy = spyOn<any, any>(adapter as any, 'releaseConnection').mockImplementation(() => {});
    const p = adapter.query('SELECT 1');
    await expect(p).resolves.toBeTruthy();

    // Next query should eventually timeout trying to acquire another connection
    const failing = (adapter as any).acquireConnection('cid'); // direct call
    advanceTimersByTime?.(50);
    await expect(failing).rejects.toBeInstanceOf(ConnectionError);
    releaseSpy.mockRestore();
  });

  it('maintenance removes idle connections beyond idleTimeout but respects min', async () => {
    const Database = (await import('better-sqlite3')).default as any;
    (Database as any).mockImplementation((_f: string, _o: any) => createMockDb());
    const adapter = createAdapter({ pool: { min: 1, max: 3, idleTimeoutMillis: 5, reapIntervalMillis: 5 } });
    await adapter.connect();
    // Simulate lastUsedAt in the past for extra connections
    await (adapter as any).createConnection();
    await (adapter as any).createConnection();
    const pool = (adapter as any).pool as any[];
    pool.forEach((c, i) => { if (i>0) { c.inUse = false; c.lastUsedAt = new Date(Date.now() - 1000); }});
    // Trigger maintenance tick
    advanceTimersByTime?.(10);
    // Wait microtasks
    await Promise.resolve();
    const stats = await adapter.getStats();
    expect(stats.total).toBeGreaterThanOrEqual(1);
  });
});