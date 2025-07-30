
/** SQLite-based memory store for MCP server;
/** Provides persistent storage that works with both local and remote npx execution

import { promises as fs  } from 'node:fs';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';
import { createDatabase  } from '.';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// // interface SqliteMemoryStoreOptions {
//   dbName?;
//   directory?;
//   cacheSize?;
//   mmapSize?;
//   maxConnections?;
//   enableCache?;
//   cacheTimeout?;
//   [key = {}) {
    this.options = {dbName = = false
,cacheTimeout = null
this.statements = new Map() {}
this.queryCache = new Map() {}
this.cacheStats =
// {
  hits = false;
// }

/** Determine the best directory for memory storage;
/** Uses .swarm directory in current working directory(consistent with hive-mind approach)

private;
_getMemoryDirectory();
: string
// {
  // Always use .swarm directory in the current working directory
  // This ensures consistency whether running locally or via npx
  // return path.join(process.cwd(), '.swarm');
// }
private;
async;
_directoryExists(dir = await fs.stat(dir);
// return stats.isDirectory();
} /* catch */
// {
  // return false;
// }
// }
// async initialize() { }
: Promise<void>

    if(this.isInitialized) return;
    // ; // LINT: unreachable code removed
    try {
      // Ensure directory exists
// // await fs.mkdir(this.options.directory!, {recursive = path.join(this.options.directory!, this.options.dbName!);
      this.db = // await createDatabase(dbPath);

      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma(`cache_size = -${Math.floor(this.options.cacheSize! / 1024)}`); // Negative for KB
      this.db.pragma(`mmap_size = ${this.options.mmapSize!}`);
      this.db.pragma('temp_store = MEMORY');
      this.db.pragma('optimize');

      // Create tables
      this._createTables();

      // Prepare statements
      this._prepareStatements();

      this.isInitialized = true;

      console.error(;)
        `[${new Date().toISOString()}] INFO [memory-store] Initialized SQLiteat = excluded.value,`
        metadata = excluded.metadata,
        ttl = excluded.ttl,
        expires_at = excluded.expires_at,
        updated_at = strftime('%s', 'now'),
        access_count = memory_entries.access_count + 1;
    `));`

    // Retrieve statement
    this.statements.set(;
      'get',
      this.db.prepare(`;`
      SELECT * FROM memory_entries ;))
      WHERE key = ? AND namespace = ? AND(expires_at IS NULL OR expires_at > strftime('%s', 'now'));
    `));`

    // List statement
    this.statements.set(;
      'list',
      this.db.prepare(`;`
      SELECT * FROM memory_entries ;))
      WHERE namespace = ? AND(expires_at IS NULL OR expires_at > strftime('%s', 'now'));
      ORDER BY updated_at DESC;
      LIMIT ?;
    `));`

    // Delete statement
    this.statements.set(;
      'delete',
      this.db.prepare(`;`
      DELETE FROM memory_entries WHERE key = ? AND namespace = ?;))
    `));`

    // Search statement
    this.statements.set(;
      'search',
      this.db.prepare(`;`
      SELECT * FROM memory_entries ;))
      WHERE namespace = ? AND(key LIKE ? OR value LIKE ?) ;
      AND(expires_at IS NULL OR expires_at > strftime('%s', 'now'));
      ORDER BY access_count DESC, updated_at DESC;
      LIMIT ?;
    `));`

    // Cleanup statement
    this.statements.set(;
      'cleanup',
      this.db.prepare(`;`))
      DELETE FROM memory_entries WHERE expires_at IS NOT NULL AND expires_at <= strftime('%s', 'now');
    `));`

    // Update access statement
    this.statements.set(;
      'updateAccess',
      this.db.prepare(`;`
      UPDATE memory_entries ;))
      SET accessed_at = strftime('%s', 'now'), access_count = access_count + 1;
      WHERE key = ? AND namespace = ?;
    `));`
  //   }

  async store(key = {}): Promise<{success = options.namespace  ?? 'default';
    const _metadata = options.metadata ? JSON.stringify(options.metadata) ;
    const _ttl = options.ttl  ?? null;
    const _expiresAt = ttl ? Math.floor(Date.now() / 1000) +ttl = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      const __result = this.statements;
get('upsert');
run(key, valueStr, namespace, metadata, ttl, expiresAt);

      // Invalidate related cache entries
      this._invalidateCache(`retrieve = {}): Promise<any> {`
// // await this.initialize();
    const _namespace = options.namespace  ?? 'default';
    const _cacheKey = this._getCacheKey('retrieve', key, namespace);

    // Check cache first
    const _cached = this._getFromCache(cacheKey);
  if(cached !== null) {
      // return cached;
    //   // LINT: unreachable code removed}

    try {
      const _row = this.statements.get('get').get(key, namespace);
  if(!row) {
        this._setCache(cacheKey, null, 60000); // Cache null results for 1 minute
        // return null;
    //   // LINT: unreachable code removed}

      // Update access stats
      this.statements.get('updateAccess').run(key, namespace);

      // Try to parse as JSON, fall back to raw string
      let result;
      try {
        result = JSON.parse(row.value);
      } catch {
        result = row.value;
      //       }

      // Cache the result
      this._setCache(cacheKey, result);

      // return result;
    //   // LINT: unreachable code removed} catch(error = {}): Promise<any[]> {
// // await this.initialize();
    const _namespace = options.namespace  ?? 'default';
    const _limit = options.limit  ?? 100;
    const _cacheKey = this._getCacheKey('list', namespace, limit);

    // Check cache first
    const _cached = this._getFromCache(cacheKey);
  if(cached !== null) {
      // return cached;
    //   // LINT: unreachable code removed}

    try {
      const _rows = this.statements.get('list').all(namespace, limit);

      const _result = rows.map((row) => ({ key = {  }): Promise<boolean> {
// // await this.initialize();
    const _namespace = options.namespace  ?? 'default';

    try {
      const _result = this.statements.get('delete').run(key, namespace);

      // Invalidate related cache entries
  if(result.changes > 0) {
        this._invalidateCache(`retrieve = {}): Promise<any[]> {`
// // await this.initialize();
    const _namespace = options.namespace  ?? 'default';
    const _limit = options.limit  ?? 50;
    const _searchPattern = `%${pattern}%`;
    const _cacheKey = this._getCacheKey('search', pattern, namespace, limit);

    // Check cache first
    const _cached = this._getFromCache(cacheKey);
  if(cached !== null) {
      // return cached;
    //   // LINT: unreachable code removed}

    try {
      const _rows = this.statements;
get('search');
all(namespace, searchPattern, searchPattern, limit);

      const _result = rows.map((_row) => ({key = this.statements.get('cleanup').run();
      return result.changes;
    //   // LINT: unreachable code removed} catch(_error = this.queryCache.get(cacheKey);
  if(!cached) {
      this.cacheStats.misses++;
      return null;
    //   // LINT: unreachable code removed}

    if(Date.now() > cached.expires) {
      this.queryCache.delete(cacheKey);
      this.cacheStats.misses++;
      // return null;
    //   // LINT: unreachable code removed}

    this.cacheStats.hits++;
    // return cached.data;
    //   // LINT: unreachable code removed}

  // private _setCache(cacheKey = null) {
    if(!this.options.enableCache) return;
    // ; // LINT: unreachable code removed
    const _ttl = customTTL  ?? this.options.cacheTimeout!;
    const _expires = Date.now() + ttl;

    this.queryCache.set(cacheKey, { data, expires });
    this.cacheStats.size = this.queryCache.size;

    // SimpleLRU = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
      this.cacheStats.size = this.queryCache.size;
    //     }
  //   }

  // private _invalidateCache(pattern = null) ;
  if(pattern) {
      for (const key of this.queryCache.keys()) {
        if(key.includes(pattern)) {
          this.queryCache.delete(key); //         }
      //       }
    //     }
    else {
      this.queryCache.clear(); //     }
    this.cacheStats.size = this.queryCache.size;
  close() {;
  if(this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    //     }
    this.queryCache.clear();
    this.cacheStats = {hits = this.db?.prepare(`;`
        SELECT ;)
          COUNT(*) as total_entries,
          COUNT(DISTINCT namespace) as namespaces,
          SUM(LENGTH(value)) as total_size,
          AVG(access_count) as avg_access_count,
          COUNT(*) FILTER(WHERE expires_at IS NOT NULL AND expires_at > strftime('%s', 'now')) as active_with_ttl,
          COUNT(*) FILTER(WHERE expires_at IS NOT NULL AND expires_at <= strftime('%s', 'now')) as expired;
        FROM memory_entries;
      `).get();`

      // return {entries = > idx.name);
    //   // LINT: unreachable code removed};catch(error = ;

      const _commonQueries = [
        {name = ? AND namespace = ?' },'
        {name = ? ORDER BY updated_at DESC LIMIT ?' },'
        {name = ? AND(key LIKE ? OR value LIKE ?) LIMIT ?' },name = strftime(\'%s\', \'now\')' }
      ];
  for(const query of commonQueries) {
        try {
          const _plan = this.db?.prepare(`EXPLAIN QUERY PLAN ${query.sql}`).all(); plans[query.name] = plan; } catch(_error = error = new SqliteMemoryStore() {;

// export type { SqliteMemoryStore };
// export default SqliteMemoryStore;

}}}}}}}}}}}}})))))
