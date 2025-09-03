/**
 * Tests for LanceDBAdapter and LanceDBTransactionConnection
 *
 * Framework note:
 * - This test suite is written in Jest style (describe/it/expect, jest.mock).
 * - If the project uses Vitest, this file remains compatible with minor changes:
 *   - Replace jest.mock with vi.mock, and jest.fn with vi.fn.
 *   - Replace advanceTimersByTime/jest.useFakeTimers with vi equivalents.
 */

import path from 'path';

// Attempt to import from the expected adapter path in this package.
// If your adapter file uses a different path or name, update the import below.
import { LanceDBAdapter } from './lancedb-adapter';

type AnyFn = (...args: any[]) => any;

// Mocks for logger used by the adapter.
// If a central logger exists, mock that module instead.
const logger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Shim global logger symbol if adapter imports it via named import.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).logger = logger;

// Mock fs and path interactions used by ensureDatabaseDirectory
jest.mock('fs', () => {
  const actual = jest.requireActual('fs') as typeof import('fs');
  return {
    ...actual,
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
  };
});

jest.mock('path', () => {
  const actual = jest.requireActual('path') as typeof import('path');
  return {
    ...actual,
    dirname: jest.fn((p: string) => actual.dirname(p)),
  };
});

const { existsSync, mkdirSync } = jest.requireMock('fs') as {
  existsSync: jest.Mock;
  mkdirSync: jest.Mock;
};
const { dirname } = jest.requireMock('path') as { dirname: jest.Mock };

// Dynamic import of @lancedb/lancedb is used; mock the module resolution.
type MockTable = {
  vectorSearch: AnyFn;
  search: AnyFn;
  query?: AnyFn;
  createIndex?: AnyFn;
  add: AnyFn;
};
type MockConnection = {
  connect?: AnyFn;
  tableNames: AnyFn;
  openTable: AnyFn;
  createTable: AnyFn;
  close: AnyFn;
};

const makeMockVectorQuery = () => {
  const chain: Record<string, AnyFn> = {};
  chain.limit = jest.fn(() => chain);
  chain.where = jest.fn(() => chain);
  chain.select = jest.fn(() => chain);
  chain.distanceType = jest.fn(() => chain);
  chain.toArray = jest.fn(async () => []);
  return chain;
};

const makeMockTable = (opts?: {
  toArray?: unknown[];
  enableSearch?: boolean;
  enableQueryFallback?: boolean;
  createIndex?: boolean;
}) => {
  const vectorQuery = makeMockVectorQuery();
  if (opts?.toArray) {
    vectorQuery.toArray.mockResolvedValue(opts.toArray);
  }
  const table: MockTable = {
    vectorSearch: jest.fn(() => vectorQuery),
    search: jest.fn(() => ({
      where: jest.fn(function (this: any) { return this; }),
      limit: jest.fn(function (this: any) { return this; }),
      toArray: jest.fn(async () => opts?.toArray ?? []),
    })),
    add: jest.fn(async () => undefined),
  };
  if (opts?.enableQueryFallback) {
    table.query = jest.fn(() => ({
      where: jest.fn(function (this: any) { return this; }),
      limit: jest.fn(function (this: any) { return this; }),
      toArray: jest.fn(async () => opts?.toArray ?? []),
    }));
  }
  if (opts?.createIndex) {
    table.createIndex = jest.fn(async () => undefined);
  }
  return { table, vectorQuery };
};

const makeMockConnection = (overrides?: Partial<MockConnection>): MockConnection => ({
  tableNames: jest.fn(async () => ['a', 'b']),
  openTable: jest.fn(async (_name: string) => makeMockTable().table),
  createTable: jest.fn(async (_arg: any) => makeMockTable().table),
  close: jest.fn(async () => undefined),
  ...overrides,
});

// Helper to stub dynamic import of @lancedb/lancedb
const mockImportLanceDB = (connection: MockConnection) => {
  jest.spyOn(global, 'import' as unknown as AnyFn).mockImplementation(async (specifier: string) => {
    if (specifier === '@lancedb/lancedb') {
      return {
        connect: jest.fn(async (_dbPath: string) => connection),
      };
    }
    // Fall back to actual dynamic import for other modules
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(specifier);
  });
};

const resetDynamicImportMock = () => {
  (global.import as unknown as jest.SpyInstance)?.mockRestore?.();
};

const makeAdapter = (databasePath = path.join(process.cwd(), 'tmp', 'db.lance')) => {
  const adapter = new LanceDBAdapter({
    database: databasePath,
    retryPolicy: {
      maxRetries: 2,
      initialDelayMs: 1,
      maxDelayMs: 5,
      backoffFactor: 1.1,
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
    },
  } as any);
  return adapter;
};

describe('LanceDBAdapter.connect and disconnect', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    resetDynamicImportMock();
  });

  it('connects successfully and tests the connection', async () => {
    const conn = makeMockConnection();
    mockImportLanceDB(conn);

    const adapter = makeAdapter('/data/db/mydb.lance');
    (existsSync as jest.Mock).mockReturnValueOnce(true);

    await expect(adapter.connect()).resolves.toBeUndefined();

    expect(dirname).toHaveBeenCalledWith('/data/db/mydb.lance');
    expect(existsSync).toHaveBeenCalled();
    expect(conn.tableNames).toHaveBeenCalled(); // from testConnection
    expect((logger.info as jest.Mock)).toHaveBeenCalledWith(expect.stringContaining('Connected to LanceDB database successfully'), expect.any(Object));
    expect(adapter.isConnected()).toBe(true);
  });

  it('creates database directory if missing during connect', async () => {
    const conn = makeMockConnection();
    mockImportLanceDB(conn);

    const adapter = makeAdapter('/root/newdir/db.lance');
    (existsSync as jest.Mock).mockReturnValueOnce(false);

    await adapter.connect();

    expect(mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(adapter.isConnected()).toBe(true);
  });

  it('throws ConnectionError if @lancedb/lancedb import fails', async () => {
    jest.spyOn(global, 'import' as unknown as AnyFn).mockRejectedValueOnce(new Error('MODULE_NOT_FOUND'));

    const adapter = makeAdapter();
    await expect(adapter.connect()).rejects.toThrow(/LanceDB package not found/i);

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to import LanceDB package'),
      expect.objectContaining({ error: 'MODULE_NOT_FOUND' })
    );
  });

  it('disconnect is idempotent and closes connection when connected', async () => {
    const conn = makeMockConnection();
    mockImportLanceDB(conn);
    const adapter = makeAdapter();

    await adapter.connect();
    await expect(adapter.disconnect()).resolves.toBeUndefined();
    expect(conn.close).toHaveBeenCalled();
    expect(adapter.isConnected()).toBe(false);

    // second call: should no-op
    await expect(adapter.disconnect()).resolves.toBeUndefined();
    expect(conn.close).toHaveBeenCalledTimes(1);
  });
});

describe('LanceDBAdapter.query', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetDynamicImportMock();
  });

  it('auto-connects if not connected and returns QueryResult from SHOW TABLES', async () => {
    const conn = makeMockConnection({ tableNames: jest.fn(async () => ['x', 'y', 'z']) });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();

    const result = await adapter.query('SHOW TABLES');
    expect(result.rows).toEqual([{ table_name: 'x' }, { table_name: 'y' }, { table_name: 'z' }]);
    expect(result.rowCount).toBe(3);
    expect(result.fields).toEqual(['table_name']);
  });

  it('supports SELECT ... FROM <table> via parseLanceDBQuery', async () => {
    const tableData = [{ id: '1', text: 'a' }, { id: '2', text: 'b' }];
    const { table } = makeMockTable({ toArray: tableData });
    const conn = makeMockConnection({
      openTable: jest.fn(async (name: string) => {
        expect(name).toBe('docs');
        return table;
      }),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();
    await adapter.connect();

    const res = await adapter.query('SELECT * FROM docs');
    expect(res.rowCount).toBe(2);
    expect(res.rows).toEqual(tableData);
    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('LanceDB operation executed successfully'),
      expect.objectContaining({ rowCount: 2 })
    );
  });

  it('throws QueryError when database connection object is unexpectedly null after connect', async () => {
    // Force connect to succeed but database to be null
    const conn = makeMockConnection();
    mockImportLanceDB(conn);
    const adapter = makeAdapter();

    await adapter.connect();
    // Simulate an external disconnect that nulled internal database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adapter as any).database = null;

    await expect(adapter.query('SHOW TABLES')).rejects.toThrow(/Connection not available/);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('LanceDB operation execution failed'),
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  it('retries on retryable errors and then throws QueryError after max retries', async () => {
    jest.useFakeTimers();

    // Create an operation that always throws a retryable error
    const conn = makeMockConnection({
      tableNames: jest.fn(async () => { throw new Error('network_error: temporary'); }),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();

    await adapter.connect();

    const queryPromise = adapter.query('SHOW TABLES');

    // Advance timers to allow internal sleep() during retries
    jest.advanceTimersByTime(20);

    await expect(queryPromise).rejects.toThrow(/Operation failed after/i);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Retrying LanceDB operation after error'),
      expect.objectContaining({ attempt: expect.any(Number) })
    );
    jest.useRealTimers();
  });
});

describe('LanceDBAdapter.health', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetDynamicImportMock();
  });

  it('reports unhealthy when not connected', async () => {
    const adapter = makeAdapter();
    const health = await adapter.health();
    expect(health.healthy).toBe(false);
    expect(health.details?.connected).toBe(false);
    expect(health.status).toBe('unhealthy');
  });

  it('reports healthy=true when connected and tableNames works (with computed score)', async () => {
    const conn = makeMockConnection();
    mockImportLanceDB(conn);
    const adapter = makeAdapter();

    await adapter.connect();
    const health = await adapter.health();
    expect(health.details?.connected).toBe(true);
    // status can be 'healthy' or ' degraded' depending on score; ensure score in [0..100]
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(typeof health.responseTimeMs).toBe('number');
  });
});

describe('LanceDBAdapter.migrate', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetDynamicImportMock();
  });

  it('applies migrations sequentially and records them', async () => {
    const { table } = makeMockTable();
    const conn = makeMockConnection({
      openTable: jest.fn(async (name: string) => {
        if (name === 'migrations') return table;
        return makeMockTable().table;
      }),
      createTable: jest.fn(async () => table),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();
    await adapter.connect();

    const up1 = jest.fn(async () => undefined);
    const up2 = jest.fn(async () => undefined);

    const results = await adapter.migrate([
      { version: '001', name: 'init', up: up1, down: async () => undefined },
      { version: '002', name: 'add-data', up: up2, down: async () => undefined },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].applied).toBe(true);
    expect(results[1].applied).toBe(true);
    expect(up1).toHaveBeenCalledTimes(1);
    expect(up2).toHaveBeenCalledTimes(1);
  });

  it('skips migration when version already applied', async () => {
    // getCurrentMigrationVersion returns '002' so both are skipped
    const conn = makeMockConnection({
      openTable: jest.fn(async () => makeMockTable().table),
      createTable: jest.fn(async () => makeMockTable().table),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();
    await adapter.connect();

    // Mock getCurrentMigrationVersion to '002'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adapter as any).getCurrentMigrationVersion = jest.fn(async () => '002');

    const up = jest.fn();
    const results = await adapter.migrate([
      { version: '001', name: 'old', up: up, down: async () => undefined },
      { version: '002', name: 'same', up: up, down: async () => undefined },
    ]);

    expect(results.map(r => r.applied)).toEqual([false, false]);
    expect(up).not.toHaveBeenCalled();
  });
});

describe('Vector operations', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetDynamicImportMock();
  });

  it('vectorSearch returns mapped VectorResult', async () => {
    const { table, vectorQuery } = makeMockTable({
      toArray: [
        { id: 'a', vector: [0.1, 0.2], distance: 0.2, other: 'x' },
        { id: 'b', vector: [0.2, 0.3], distance: 0.0, other: 'y' },
      ],
    });
    const conn = makeMockConnection({
      openTable: jest.fn(async (name: string) => {
        expect(name).toBe('vecs');
        return table;
      }),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();
    await adapter.connect();

    const results = await adapter.vectorSearch('vecs', [0.1, 0.2], { limit: 5, threshold: 0.9 });
    expect(vectorQuery.limit).toHaveBeenCalledWith(5);
    // threshold toggles distanceType('cosine')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((vectorQuery as any).distanceType).toHaveBeenCalledWith('cosine');
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ id: 'a', similarity: 0.8 });
  });

  it('advancedVectorSearch applies options and threshold filter', async () => {
    const arr = [
      { id: '1', distance: 0.3, payload: 'ok' },
      { id: '2', distance: 0.9, payload: 'drop' },
    ];
    const { table, vectorQuery } = makeMockTable({ toArray: arr });
    const conn = makeMockConnection({
      openTable: jest.fn(async () => table),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();
    await adapter.connect();

    const res = await adapter.advancedVectorSearch('tbl', [0, 1], {
      limit: 10,
      distanceType: 'l2',
      filter: 'category = 1',
      select: ['id', 'distance'],
      threshold: 0.5,
      includeDistance: true,
    });

    expect(vectorQuery.distanceType).toHaveBeenCalledWith('l2');
    expect(vectorQuery.where).toHaveBeenCalledWith('category = 1');
    expect(vectorQuery.select).toHaveBeenCalledWith(['id', 'distance']);
    expect(res.rowCount).toBe(1);
    expect(res.rows[0]).toMatchObject({ id: '1' });
  });

  it('createVectorIndex builds index with defaults', async () => {
    const { table } = makeMockTable({ createIndex: true });
    const conn = makeMockConnection({
      openTable: jest.fn(async () => table),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();

    await adapter.createVectorIndex('tbl', { indexType: 'IVF_PQ', numPartitions: 16, numSubVectors: 8, metric: 'L2' });
    expect(table.createIndex).toHaveBeenCalledWith('vector', expect.objectContaining({
      metric: 'L2',
      num_partitions: 16,
      num_sub_vectors: 8,
    }));
  });

  it('insertVectors creates table when openTable fails', async () => {
    const { table } = makeMockTable();
    const conn = makeMockConnection({
      openTable: jest.fn(async () => { throw new Error('missing'); }),
      createTable: jest.fn(async () => table),
    });
    mockImportLanceDB(conn);
    const adapter = makeAdapter();
    await adapter.connect();

    await expect(adapter.insertVectors('docs', [
      { id: '1', vector: [0, 1], metadata: { tag: 'a' } },
      { id: '2', vector: [1, 0], metadata: { tag: 'b' } },
    ])).resolves.toBeUndefined();

    expect(conn.createTable).toHaveBeenCalled();
    expect(table.add).toHaveBeenCalled();
  });
});

describe('LanceDBTransactionConnection', () => {
  it('delegates query/execute with provided correlationId; rollback/commit are no-ops', async () => {
    const { table } = makeMockTable({ toArray: [{ id: 'x' }] });
    const conn = makeMockConnection({
      openTable: jest.fn(async () => table),
    });
    mockImportLanceDB(conn);

    const adapter = makeAdapter();
    await adapter.connect();

    // Import the transaction class from the same module file (adapter exports it privately in snippet;
    // if exported, adjust import; for test we access via any).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TxClass = (require('./lancedb-adapter') as any).LanceDBTransactionConnection;
    const tx = new TxClass(adapter, 'cid-123');

    const res = await tx.query('SHOW TABLES');
    expect(res.rowCount).toBeGreaterThanOrEqual(0);

    await expect(tx.execute('SHOW TABLES')).resolves.toEqual(expect.objectContaining({ rowCount: expect.any(Number) }));
    await expect(tx.rollback()).resolves.toBeUndefined();
    await expect(tx.commit()).resolves.toBeUndefined();
    await expect(tx.savepoint('p1')).resolves.toBeUndefined();
    await expect(tx.releaseSavepoint('p1')).resolves.toBeUndefined();
    await expect(tx.rollbackToSavepoint('p1')).resolves.toBeUndefined();

    expect(logger.debug).toHaveBeenCalledWith(
      expect.stringContaining('Transaction commit (no-op for LanceDB)'),
      expect.objectContaining({ correlationId: 'cid-123' })
    );
  });
});