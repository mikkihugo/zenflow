/*
  Framework: Vitest 3.x (describe/it/expect/vi).
  Suite validates: KuzuAdapter & KuzuTransactionConnection
  Notes:
  - We mock dynamic import('kuzu'), Node fs (node:fs), and logger module used by adapter.
  - We assert happy paths, failure conditions, retries, and Cypher generation for graph helpers.
*/

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import path from 'node:path'

// Mock logger module used by adapter to silence logs and allow call assertions if needed
vi.mock('../logger.js', () => {
  const logger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
  return { getLogger: () => logger, default: logger }
})

// Mock node:fs (adapter imports { existsSync, mkdirSync } from 'node:fs')
vi.mock('node:fs', () => {
  return {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
})

// Dynamic kuzu module factory; set per-test before importing adapter
let __kuzuFactory__: () => any = () => ({ Database: class {}, Connection: class {} })
vi.mock('kuzu', () => __kuzuFactory__())

// Helper: create kuzu driver mocks
function createKuzuMocks(opts?: {
  isSuccess?: boolean
  rows?: unknown[]
  columnNames?: string[]
  columnDataTypes?: string[]
  queryImpl?: (sql: string) => Promise<unknown>
}) {
  const rows = opts?.rows ?? [{ id: 1 }]
  const isSuccess = opts?.isSuccess ?? true
  const columnNames = opts?.columnNames ?? ['id']
  const columnDataTypes = opts?.columnDataTypes ?? ['INT64']

  const result = {
    isSuccess: vi.fn().mockReturnValue(isSuccess),
    getAll: vi.fn().mockResolvedValue(rows),
    getColumnNames: vi.fn().mockReturnValue(columnNames),
    getColumnDataTypes: vi.fn().mockReturnValue(columnDataTypes),
    close: vi.fn().mockResolvedValue(undefined),
    getErrorMessage: vi.fn().mockReturnValue('MOCK_ERROR'),
  }

  const connection = {
    query: vi.fn().mockImplementation(async (sql: string) => {
      if (opts?.queryImpl) return opts.queryImpl(sql)
      return result
    }),
    close: vi.fn().mockResolvedValue(undefined),
  }

  const database = {
    close: vi.fn().mockResolvedValue(undefined),
  }

  // Constructors
  const Database = vi.fn().mockImplementation(function (this: unknown, _p: string) { return database })
  const Connection = vi.fn().mockImplementation(function (this: unknown, _db: unknown) { return connection })

  return { Database, Connection, connection, database, result }
}

// Utility to import the adapter after mocks are registered
async function loadAdapter() {
  // Important: dynamic import picks up current mocks
  const mod = await import('./kuzu-adapter')
  return mod as unknown as { KuzuAdapter: new (config: any) => any }
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('KuzuAdapter.connect/disconnect', () => {
  it('connects successfully: ensures dir, imports kuzu, creates DB/connection, tests query', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(false) // dir missing -> should mkdir

    const kuzu = createKuzuMocks()
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: path.join('tmp', 'test.db') })

    await adapter.connect()

    expect(fs.existsSync).toHaveBeenCalled()
    expect(fs.mkdirSync).toHaveBeenCalled()
    expect(kuzu.Database).toHaveBeenCalledTimes(1)
    expect(kuzu.Connection).toHaveBeenCalledTimes(1)
    expect(kuzu.connection.query).toHaveBeenCalled() // testConnection
    expect(adapter.isConnected()).toBe(true)

    await adapter.disconnect()
    expect(kuzu.connection.close).toHaveBeenCalledTimes(1)
    expect(kuzu.database.close).toHaveBeenCalledTimes(1)
    expect(adapter.isConnected()).toBe(false)
  })

  it('throws ConnectionError when kuzu import fails', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)
    // Simulate import('kuzu') throwing MODULE_NOT_FOUND
    __kuzuFactory__ = () => { throw new Error('MODULE_NOT_FOUND: kuzu') }

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://fail.db' })

    await expect(adapter.connect()).rejects.toThrow(/Kuzu package not found|Failed to connect to Kuzu|Failed to create Kuzu database/)
  })

  it('throws ConnectionError if creating DB/connection fails', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks()
    // Force Connection constructor to throw
    const BadConnectionCtor = vi.fn().mockImplementation(() => { throw new Error('CONNECT_FAIL') })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: BadConnectionCtor })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://bad.db' })

    await expect(adapter.connect()).rejects.toThrow(/Failed to create Kuzu database|connect to Kuzu/)
  })

  it('disconnect is idempotent when not connected', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    // Kuzu mocked but not used
    __kuzuFactory__ = () => createKuzuMocks()

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://none.db' })

    await adapter.disconnect()
    expect(adapter.isConnected()).toBe(false)
  })
})

describe('KuzuAdapter.query/execute', () => {
  it('executes a successful query and maps result into QueryResult shape', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({
      rows: [{ id: 1 }, { id: 2 }],
      columnNames: ['id'],
      columnDataTypes: ['INT64'],
    })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://ok.db' })

    const res = await adapter.query<{ id: number }>('MATCH (n) RETURN n.id as id LIMIT 2')
    expect(res.rows).toHaveLength(2)
    expect(res.fields).toEqual(['id'])
    expect(typeof res.executionTimeMs).toBe('number')
    expect(res.metadata?.columnDataTypes).toEqual(['INT64'])

    const res2 = await adapter.execute('RETURN 1')
    expect(res2.rowCount).toBeDefined()
  })

  it('wraps failures from result.isSuccess false into QueryError', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ isSuccess: false })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://fail.db' })

    await expect(adapter.query('RETURN broken()')).rejects.toThrow(/Kuzu query execution failed|Unknown query error/)
  })

  it('throws QueryError when connection is unexpectedly unavailable', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks()
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://weird.db' })

    await adapter.connect()
    // Force connection to null to simulate unexpected state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).connection = null

    await expect(adapter.query('RETURN 1')).rejects.toThrow(/Connection not available/)
  })

  it('explain() prefixes query with EXPLAIN', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks()
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://exp.db' })

    // Spy on adapter.query to capture cypher
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    await adapter.explain('MATCH (n) RETURN n')
    const cypher = spyQuery.mock.calls[0][0] as string
    expect(cypher.startsWith('EXPLAIN ')).toBe(true)
  })
})

describe('KuzuAdapter.transaction', () => {
  it('executes provided function with a transaction-like connection and returns result', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks()
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://tx.db' })

    const result = await adapter.transaction(async (tx: any) => {
      const r = await tx.query('RETURN 1 as x')
      return r.rowCount
    })

    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('wraps errors thrown inside transaction into TransactionError', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks()
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://tx-err.db' })

    await expect(adapter.transaction(async () => {
      throw new Error('boom')
    })).rejects.toThrow(/Transaction failed/)
  })
})

describe('KuzuAdapter.health and getStats', () => {
  it('returns unhealthy when not connected', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    __kuzuFactory__ = () => createKuzuMocks()

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://h.db' })
    const h = await adapter.health()
    expect(h.healthy).toBe(false)
    expect(h.details?.connected).toBe(false)
  })

  it('returns healthy/degraded based on response time and error rate after successful query', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ rows: [{ ok: 1 }] })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://h2.db' })

    await adapter.query('RETURN 1 as health_check')
    const h = await adapter.health()
    expect(h.details?.connected).toBe(true)
    expect(typeof h.score).toBe('number')
    expect(h.metrics?.avgResponseTimeMs).toBeGreaterThanOrEqual(0)
  })

  it('getStats reflects connection lifecycle and error count', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks()
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://s.db' })

    await adapter.connect()
    const stats = await adapter.getStats()
    expect(stats.total).toBe(1)
    expect(stats.active).toBe(1)
    expect(stats.destroyed).toBeGreaterThanOrEqual(0)
    await adapter.disconnect()
    const stats2 = await adapter.getStats()
    expect(stats2.active).toBe(0)
  })
})

describe('Schema & migrations helpers', () => {
  it('getCurrentMigrationVersion returns latest version or null on failure', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    // Success path: return one row with version
    const kuzu1 = createKuzuMocks({
      queryImpl: async (sql: string) => {
        if (sql.includes('ORDER BY m.version')) {
          return {
            isSuccess: () => true,
            getAll: async () => [{ version: '20240101010101' }],
            getColumnNames: () => ['version'],
            getColumnDataTypes: () => ['STRING'],
            close: async () => {},
            getErrorMessage: () => '',
          }
        }
        return createKuzuMocks().result
      },
    })
    __kuzuFactory__ = () => ({ Database: kuzu1.Database, Connection: kuzu1.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter1 = new KuzuAdapter({ database: 'mem://m1.db' })
    const v = await adapter1.getCurrentMigrationVersion()
    expect(v).toBe('20240101010101')

    // Error path -> null
    const kuzu2 = createKuzuMocks({
      queryImpl: async () => { throw new Error('no migrations') },
    })
    __kuzuFactory__ = () => ({ Database: kuzu2.Database, Connection: kuzu2.Connection })
    const adapter2 = new KuzuAdapter({ database: 'mem://m2.db' })
    const v2 = await adapter2.getCurrentMigrationVersion()
    expect(v2).toBeNull()
  })

  it('migrate applies new migrations, records them, and stops on first failure', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({
      queryImpl: async () => createKuzuMocks().result,
    })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://mig.db' })

    // Spy on adapter.query to observe recordMigration call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    const migrations = [
      { version: '001', name: 'init', up: async () => {} },
      { version: '002', name: 'second', up: async () => { throw new Error('boom') } },
      { version: '003', name: 'skipped', up: async () => {} },
    ] as const

    const results = await adapter.migrate(migrations)

    expect(results).toHaveLength(2) // stops on failure
    expect(results[0].applied).toBe(true)
    expect(results[1].applied).toBe(false)

    const recorded = spyQuery.mock.calls.find(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('CREATE (:Migration')
    )
    expect(recorded).toBeTruthy()
  })
})

describe('Graph DDL/DML helpers generate expected Cypher', () => {
  it('createNodeTable builds correct Cypher with/without PK', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ queryImpl: async () => createKuzuMocks().result })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://ddl.db' })

    // Spy to capture Cypher
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    await adapter.createNodeTable('User', { id: 'string', age: 'int' }, 'id')
    const cypher = spyQuery.mock.calls[0][0] as string
    expect(cypher).toMatch(/CREATE NODE TABLE IF NOT EXISTS User/i)
    expect(cypher).toMatch(/id STRING/)
    expect(cypher).toMatch(/age INT/)
    expect(cypher).toMatch(/PRIMARY KEY \(id\)/)

    await adapter.createNodeTable('Thing', { key: 'string' })
    const cypher2 = spyQuery.mock.calls[1][0] as string
    expect(cypher2).toMatch(/CREATE NODE TABLE IF NOT EXISTS Thing/)
    expect(cypher2).not.toMatch(/PRIMARY KEY/)
  })

  it('createRelationshipTable builds correct Cypher with properties', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ queryImpl: async () => createKuzuMocks().result })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://ddl-rel.db' })

    // Spy query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    await adapter.createRelationshipTable('LIKES', 'User', 'Post', { weight: 'double' })
    const cypher = spyQuery.mock.calls[0][0] as string
    expect(cypher).toMatch(/CREATE REL TABLE IF NOT EXISTS LIKES \(FROM User TO Post, weight DOUBLE\)/)

    await adapter.createRelationshipTable('FOLLOWS', 'User', 'User')
    const cypher2 = spyQuery.mock.calls[1][0] as string
    expect(cypher2).toMatch(/CREATE REL TABLE IF NOT EXISTS FOLLOWS \(FROM User TO User\)/)
  })

  it('insertNodes composes CREATE with parameterized props', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ queryImpl: async () => createKuzuMocks().result })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://nodeins.db' })

    // Spy query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    await adapter.insertNodes('User', [{ id: 1, name: 'Alice' }])
    const cypher = spyQuery.mock.calls[0][0] as string
    const params = spyQuery.mock.calls[0][1] as Record<string, unknown>
    expect(cypher).toMatch(/CREATE \(:User \{id:param0, name:param1\}\)/)
    expect(params).toEqual({ param0: 1, param1: 'Alice' })
  })

  it('insertRelationships composes MATCH and CREATE pattern with/without properties', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ queryImpl: async () => createKuzuMocks().result })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://relins.db' })

    // Spy query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    await adapter.insertRelationships('LIKES', [
      { from: { id: 1 }, to: { id: 2 }, properties: { since: '2024-01-01' } },
      { from: { id: 2 }, to: { id: 3 } },
    ])

    const cypher1 = (spyQuery.mock.calls[0][0] as string).replace(/\s+/g, ' ')
    expect(cypher1).toContain('MATCH (from), (to)')
    expect(cypher1).toContain('CREATE (from)-[:LIKES {since:"2024-01-01"}]->(to)')

    const cypher2 = (spyQuery.mock.calls[1][0] as string).replace(/\s+/g, ' ')
    expect(cypher2).toContain('MATCH (from), (to)')
    expect(cypher2).toContain('CREATE (from)-[:LIKES]->(to)')
  })

  it('graphTraversal builds Cypher with optional hop limits and returnPath flag', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    const kuzu = createKuzuMocks({ queryImpl: async () => createKuzuMocks().result })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })
    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({ database: 'mem://trav.db' })

    // Spy query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const realQuery = (adapter as any).query.bind(adapter)
    const spyQuery = vi.fn(realQuery)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(adapter as any).query = spyQuery

    await adapter.graphTraversal({ id: 'A' }, 'LIKES', { id: 'B' }, { maxHops: 3, returnPath: true })
    const cypher = (spyQuery.mock.calls[0][0] as string).replace(/\s+/g, ' ')
    expect(cypher).toContain('MATCH path = (start {id:"A"})-[r:LIKES*1..3]-(end {id:"B"}) RETURN path, start, end, r')
  })
})

describe('executeWithRetry policy (integration via query)', () => {
  it('retries on retryable errors up to maxRetries and then throws QueryError', async () => {
    const fs = await import('node:fs')
    fs.existsSync.mockReturnValue(true)

    let attempts = 0
    const kuzu = createKuzuMocks({
      queryImpl: async () => {
        attempts++
        throw new Error('NETWORK_ERROR: temporary')
      },
    })
    __kuzuFactory__ = () => ({ Database: kuzu.Database, Connection: kuzu.Connection })

    const { KuzuAdapter } = await loadAdapter()
    const adapter = new KuzuAdapter({
      database: 'mem://retry.db',
      retryPolicy: { maxRetries: 2, initialDelayMs: 1, maxDelayMs: 5, backoffFactor: 1.1, retryableErrors: ['NETWORK_ERROR'] }
    })

    await expect(adapter.query('RETURN 1')).rejects.toThrow(/Operation failed after 2 retries|Kuzu query execution failed/)
    expect(attempts).toBeGreaterThanOrEqual(3) // initial attempt + 2 retries
  })
})