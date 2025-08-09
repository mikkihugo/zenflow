/**
 * Database Test Helper - Database Testing Utilities
 *
 * Comprehensive database testing support for integration tests
 */

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (tx: DatabaseConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export interface DatabaseTestHelper {
  setup(): Promise<void>;
  cleanup(): Promise<void>;
  seed(data: any[]): Promise<void>;
  reset(): Promise<void>;
  getConnection(): DatabaseConnection;
  createSchema(schema: string): Promise<void>;
  insertTestData(table: string, data: any[]): Promise<void>;
  truncateTable(table: string): Promise<void>;
  runMigrations(migrations: string[]): Promise<void>;
}

export class SQLiteDatabaseTestHelper implements DatabaseTestHelper {
  private dbPath: string;
  private db: any = null;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || join(tmpdir(), `test-${Date.now()}.db`);
  }

  async setup(): Promise<void> {
    try {
      // Try to import sqlite3
      const { default: sqlite3 } = await import('sqlite3');

      this.db = new sqlite3.Database(this.dbPath);

      // Enable foreign keys
      await this.execute('PRAGMA foreign_keys = ON');

      // Create basic test schema
      await this.createDefaultSchema();
    } catch (_error) {
      console.warn('SQLite not available, using in-memory fallback');
      this.db = new MemoryDatabase();
    }
  }

  async cleanup(): Promise<void> {
    if (this.db) {
      await this.db.close?.();
      this.db = null;
    }

    try {
      await fs.unlink(this.dbPath);
    } catch (_error) {
      // File might not exist
    }
  }

  async seed(data: any[]): Promise<void> {
    const tableName = 'test_data';
    await this.insertTestData(tableName, data);
  }

  async reset(): Promise<void> {
    if (!this.db) return;

    // Get all table names
    const tables = await this.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );

    // Truncate all tables
    for (const table of tables) {
      await this.truncateTable(table.name);
    }
  }

  getConnection(): DatabaseConnection {
    const self = this;

    return {
      async query(sql: string, params: any[] = []): Promise<any> {
        return self.query(sql, params);
      },

      async execute(sql: string, params: any[] = []): Promise<void> {
        return self.execute(sql, params);
      },

      async transaction<T>(callback: (tx: DatabaseConnection) => Promise<T>): Promise<T> {
        await self.execute('BEGIN TRANSACTION');
        try {
          const result = await callback(this);
          await self.execute('COMMIT');
          return result;
        } catch (error) {
          await self.execute('ROLLBACK');
          throw error;
        }
      },

      async close(): Promise<void> {
        return self.cleanup();
      },
    };
  }

  async createSchema(schema: string): Promise<void> {
    const statements = schema.split(';').filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await this.execute(statement);
      }
    }
  }

  async insertTestData(table: string, data: any[]): Promise<void> {
    if (data.length === 0) return;

    const columns = Object.keys(data?.[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    for (const row of data) {
      const values = columns.map((col) => row[col]);
      await this.execute(sql, values);
    }
  }

  async truncateTable(table: string): Promise<void> {
    await this.execute(`DELETE FROM ${table}`);
    await this.execute(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
  }

  async runMigrations(migrations: string[]): Promise<void> {
    // Create migrations table if it doesn't exist
    await this.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const [index, migration] of migrations.entries()) {
      const migrationName = `migration_${index.toString().padStart(3, '0')}`;

      // Check if migration already executed
      const existing = await this.query('SELECT id FROM migrations WHERE name = ?', [
        migrationName,
      ]);

      if (existing.length === 0) {
        await this.execute(migration);
        await this.execute('INSERT INTO migrations (name) VALUES (?)', [migrationName]);
      }
    }
  }

  private async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: any, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  private async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async createDefaultSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS test_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS test_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS test_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        owner_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES test_users(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_test_data_key ON test_data(key);
      CREATE INDEX IF NOT EXISTS idx_test_users_email ON test_users(email);
      CREATE INDEX IF NOT EXISTS idx_test_projects_owner ON test_projects(owner_id);
    `;

    await this.createSchema(schema);
  }
}

export class MemoryDatabaseTestHelper implements DatabaseTestHelper {
  private storage = new Map<string, Map<string, any>>();
  private sequences = new Map<string, number>();

  async setup(): Promise<void> {
    this.storage.clear();
    this.sequences.clear();
    this.createDefaultTables();
  }

  async cleanup(): Promise<void> {
    this.storage.clear();
    this.sequences.clear();
  }

  async seed(data: any[]): Promise<void> {
    await this.insertTestData('test_data', data);
  }

  async reset(): Promise<void> {
    this.storage.clear();
    this.sequences.clear();
    this.createDefaultTables();
  }

  getConnection(): DatabaseConnection {
    const self = this;

    return {
      async query(sql: string, params: any[] = []): Promise<any> {
        return self.query(sql, params);
      },

      async execute(sql: string, params: any[] = []): Promise<void> {
        return self.execute(sql, params);
      },

      async transaction<T>(callback: (tx: DatabaseConnection) => Promise<T>): Promise<T> {
        // Memory database doesn't need transactions for testing
        return callback(this);
      },

      async close(): Promise<void> {
        return self.cleanup();
      },
    };
  }

  async createSchema(schema: string): Promise<void> {
    // Parse basic CREATE TABLE statements
    const tableMatches = schema.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/gi);
    if (tableMatches) {
      for (const match of tableMatches) {
        const tableName = match?.replace(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+/i, '');
        if (!this.storage.has(tableName)) {
          this.storage.set(tableName, new Map());
          this.sequences.set(tableName, 0);
        }
      }
    }
  }

  async insertTestData(table: string, data: any[]): Promise<void> {
    if (!this.storage.has(table)) {
      this.storage.set(table, new Map());
      this.sequences.set(table, 0);
    }

    const tableData = this.storage.get(table)!;

    for (const row of data) {
      const id = this.getNextId(table);
      const record = { id, ...row, created_at: new Date().toISOString() };
      tableData?.set(id.toString(), record);
    }
  }

  async truncateTable(table: string): Promise<void> {
    if (this.storage.has(table)) {
      this.storage.get(table)?.clear();
      this.sequences.set(table, 0);
    }
  }

  async runMigrations(migrations: string[]): Promise<void> {
    // Simple migration runner for memory database
    for (const migration of migrations) {
      await this.execute(migration);
    }
  }

  private async query(sql: string, params: any[] = []): Promise<any[]> {
    // Simple SQL parser for memory database
    const upperSql = sql.toUpperCase().trim();

    if (upperSql.startsWith('SELECT')) {
      return this.handleSelect(sql, params);
    }

    return [];
  }

  private async execute(sql: string, params: any[] = []): Promise<void> {
    const upperSql = sql.toUpperCase().trim();

    if (upperSql.startsWith('INSERT')) {
      this.handleInsert(sql, params);
    } else if (upperSql.startsWith('UPDATE')) {
      this.handleUpdate(sql, params);
    } else if (upperSql.startsWith('DELETE')) {
      this.handleDelete(sql, params);
    } else if (upperSql.startsWith('CREATE TABLE')) {
      this.handleCreateTable(sql);
    }
  }

  private handleSelect(sql: string, _params: any[]): any[] {
    // Very basic SELECT implementation
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) return [];

    const tableName = tableMatch?.[1];
    const tableData = this.storage.get(tableName);
    if (!tableData) return [];

    return Array.from(tableData?.values());
  }

  private handleInsert(sql: string, params: any[]): void {
    const tableMatch = sql.match(/INSERT INTO\s+(\w+)/i);
    if (!tableMatch) return;

    const tableName = tableMatch?.[1];
    if (!this.storage.has(tableName)) {
      this.storage.set(tableName, new Map());
      this.sequences.set(tableName, 0);
    }

    const tableData = this.storage.get(tableName)!;
    const id = this.getNextId(tableName);

    // Simple parameter binding
    const columnsMatch = sql.match(/\(([^)]+)\)/);
    if (columnsMatch) {
      const columns = columnsMatch?.[1]?.split(',').map((col) => col.trim());
      const record: any = { id };

      columns.forEach((col, index) => {
        if (params?.[index] !== undefined) {
          record[col] = params?.[index];
        }
      });

      record.created_at = new Date().toISOString();
      tableData?.set(id.toString(), record);
    }
  }

  private handleUpdate(sql: string, _params: any[]): void {
    // Basic UPDATE implementation
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) return;

    const tableName = tableMatch?.[1];
    const tableData = this.storage.get(tableName);
    if (!tableData) return;

    // For simplicity, update all records
    for (const [key, record] of tableData?.entries()) {
      record.updated_at = new Date().toISOString();
      tableData?.set(key, record);
    }
  }

  private handleDelete(sql: string, _params: any[]): void {
    const tableMatch = sql.match(/DELETE FROM\s+(\w+)/i);
    if (!tableMatch) return;

    const tableName = tableMatch?.[1];
    const tableData = this.storage.get(tableName);
    if (tableData) {
      tableData?.clear();
    }
  }

  private handleCreateTable(sql: string): void {
    const tableMatch = sql.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch?.[1];
      if (!this.storage.has(tableName)) {
        this.storage.set(tableName, new Map());
        this.sequences.set(tableName, 0);
      }
    }
  }

  private createDefaultTables(): void {
    const tables = ['test_data', 'test_users', 'test_projects'];
    for (const table of tables) {
      this.storage.set(table, new Map());
      this.sequences.set(table, 0);
    }
  }

  private getNextId(table: string): number {
    const current = this.sequences.get(table) || 0;
    const next = current + 1;
    this.sequences.set(table, next);
    return next;
  }
}

// Memory database implementation for fallback
class MemoryDatabase {
  private helper: MemoryDatabaseTestHelper;

  constructor() {
    this.helper = new MemoryDatabaseTestHelper();
    this.helper.setup();
  }

  all(sql: string, params: any[], callback: (err: any, rows: any[]) => void): void {
    this.helper
      .getConnection()
      .query(sql, params)
      .then((rows) => callback(null, rows))
      .catch((err) => callback(err, []));
  }

  run(sql: string, params: any[], callback: (err: any) => void): void {
    this.helper
      .getConnection()
      .execute(sql, params)
      .then(() => callback(null))
      .catch((err) => callback(err));
  }

  async close(): Promise<void> {
    await this.helper.cleanup();
  }
}

// Factory functions
export function createSQLiteTestHelper(dbPath?: string): DatabaseTestHelper {
  return new SQLiteDatabaseTestHelper(dbPath);
}

export function createMemoryTestHelper(): DatabaseTestHelper {
  return new MemoryDatabaseTestHelper();
}
