/**
 * Integration Test Setup - Environment Management
 *
 * Comprehensive setup and teardown for integration tests
 */

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// Database type definitions for testing - avoiding problematic imports
type BetterSQLiteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): BetterSQLiteStatement;
  close(): void;
};

type BetterSQLiteStatement = {
  run(...params: any[]): { changes: number; lastInsertRowid: number };
  finalize(): void;
};

// Simple base entity interface for testing
interface BaseDocumentEntity {
  id: string;
  type: string;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

// Type definitions for integration test configuration and helpers

/**
 * Configuration for integration test environment setup
 */
export interface IntegrationTestConfig {
  /** Environment configuration for different components */
  environment?: {
    /** Database type to use for testing */
    database?: 'memory' | 'sqlite' | 'postgres';
    /** Filesystem type to use for testing */
    filesystem?: 'mock' | 'temp' | 'real';
    /** Network configuration for testing */
    network?: 'mock' | 'localhost' | 'integration';
  };
  /** List of services to start during test setup */
  services?: string[];
  /** Cleanup strategy after tests */
  cleanup?: 'aggressive' | 'manual' | 'graceful';
  /** Timeout for test operations in milliseconds */
  timeout?: number;
  /** Additional custom configuration */
  [key: string]: string | number | boolean | object | null | undefined;
}

/**
 * Database helper interface for test operations
 */
export interface DatabaseTestHelper {
  /** Initialize the database for testing */
  setup(): Promise<void>;
  /** Clean up database resources */
  cleanup(): Promise<void>;
  /** Seed the database with test data */
  seed(data: Record<string, any>[]): Promise<void>;
  /** Reset database to initial state */
  reset(): Promise<void>;
  /** Get database connection for direct operations */
  getConnection(): BetterSQLiteDatabase | MemoryDatabase | PostgresConnection | null;
  /** Execute a query and return results */
  query?(sql: string, params?: (string | number | boolean | null)[]): Promise<Record<string, any>[]>;
  /** Insert data into the database */
  insert?(table: string, data: Record<string, any>): Promise<void>;
  /** Update data in the database */
  update?(table: string, data: Record<string, any>, where: Record<string, any>): Promise<void>;
  /** Delete data from the database */
  delete?(table: string, where: Record<string, any>): Promise<void>;
  /** Begin a transaction */
  beginTransaction?(): Promise<void>;
  /** Commit a transaction */
  commitTransaction?(): Promise<void>;
  /** Rollback a transaction */
  rollbackTransaction?(): Promise<void>;
}

/**
 * Filesystem helper interface for test operations
 */
export interface FileSystemTestHelper {
  /** Create a temporary directory for testing */
  createTempDir(): Promise<string>;
  /** Create a file with specified content */
  createFile(path: string, content: string): Promise<void>;
  /** Clean up filesystem resources */
  cleanup(): Promise<void>;
  /** Mock the filesystem for testing */
  mockFileSystem(): void;
  /** Restore original filesystem state */
  restoreFileSystem(): void;
  /** Read file content */
  readFile?(path: string): Promise<string>;
  /** Check if file exists */
  fileExists?(path: string): Promise<boolean>;
  /** Create directory recursively */
  createDirectory?(path: string): Promise<void>;
  /** Remove file or directory */
  remove?(path: string): Promise<void>;
  /** Copy file from source to destination */
  copyFile?(source: string, destination: string): Promise<void>;
  /** Move/rename file */
  moveFile?(source: string, destination: string): Promise<void>;
  /** List directory contents */
  listDirectory?(path: string): Promise<string[]>;
  /** Get file stats */
  getFileStats?(path: string): Promise<{ size: number; isFile: boolean; isDirectory: boolean; modified: Date }>;
}

/**
 * Network helper interface for test operations
 */
export interface NetworkTestHelper {
  /** Start a mock server for testing */
  startMockServer(port?: number): Promise<void>;
  /** Stop the mock server */
  stopMockServer(): Promise<void>;
  /** Mock a specific request/response */
  mockRequest(path: string, response: Record<string, any> | string | number | boolean | null): void;
  /** Capture all requests made during testing */
  captureRequests(): Array<{
    method?: string;
    url?: string;
    headers?: Record<string, string | string[] | undefined>;
    timestamp: number;
    data?: Record<string, any>;
  }>;
  /** Clear captured requests */
  clearRequests(): void;
  /** Make HTTP request to test endpoints */
  makeRequest?(method: string, url: string, data?: Record<string, any> | string, headers?: Record<string, string>): Promise<{
    status: number;
    headers: Record<string, string>;
    data: Record<string, any> | string | null;
  }>;
  /** Mock HTTP status responses */
  mockStatus?(path: string, status: number): void;
  /** Mock HTTP headers */
  mockHeaders?(path: string, headers: Record<string, string>): void;
  /** Mock network delays */
  mockDelay?(path: string, delayMs: number): void;
  /** Mock network errors */
  mockError?(path: string, error: Error): void;
  /** Get server port */
  getPort?(): number;
  /** Check if server is running */
  isRunning?(): boolean;
}

/**
 * Process interface for better type safety
 */
interface ManagedProcess {
  kill?: (signal?: NodeJS.Signals) => boolean;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  pid?: number;
}

/**
 * Memory database interface for type safety
 */
interface MemoryDatabase {
  get(key: string): any;
  set(key: string, value: any): void;
  delete(key: string): boolean;
  has(key: string): boolean;
  clear(): void;
  size(): number;
}

/**
 * PostgreSQL connection interface for type safety
 */
interface PostgresConnection {
  query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }>;
  end(): Promise<void>;
  connect(): Promise<void>;
}

/**
 * SQLite database interface for type safety (legacy sqlite3)
 */
interface SQLiteDatabase {
  exec(sql: string, callback: (err: Error | null) => void): void;
  run(sql: string, ...params: any[]): void;
  prepare(sql: string): SQLiteStatement;
  close(callback?: () => void): void;
}

interface SQLiteStatement {
  run(...params: any[]): void;
  finalize(): void;
}

/**
 * HTTP Server interface for network testing
 */
interface HTTPServer {
  listen(port: number, callback: (err?: Error) => void): void;
  close(callback?: () => void): void;
}

export class IntegrationTestSetup {
  private config: IntegrationTestConfig;
  private tempDirs: string[] = [];
  private processes: ManagedProcess[] = [];
  private cleanupCallbacks: Array<() => Promise<void>> = [];

  constructor(config: IntegrationTestConfig = {}) {
    this.config = {
      environment: {
        database: 'memory',
        filesystem: 'temp',
        network: 'mock',
      },
      services: [],
      cleanup: 'aggressive',
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Setup the complete test environment
   */
  async setup(): Promise<{
    database: DatabaseTestHelper;
    filesystem: FileSystemTestHelper;
    network: NetworkTestHelper;
  }> {
    try {
      const database = await this.setupDatabase();
      const filesystem = await this.setupFileSystem();
      const network = await this.setupNetwork();

      // Start required services
      if (this.config.services && this.config.services.length > 0) {
        await this.startServices();
      }

      return { database, filesystem, network };
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Clean up the test environment
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = [
      ...this.cleanupCallbacks.map((callback) => callback()),
      this.stopServices(),
      this.cleanupTempDirs(),
    ];

    await Promise.allSettled(cleanupPromises);

    this.cleanupCallbacks = [];
    this.tempDirs = [];
    this.processes = [];
  }

  /**
   * Create isolated test environment
   *
   * @param testName
   */
  async createIsolatedEnvironment(testName: string): Promise<{
    workDir: string;
    configPath: string;
    envVars: Record<string, string>;
  }> {
    const workDir = await this.createTempDir(`test-${testName}`);
    const configPath = join(workDir, 'test-config.json');

    const envVars = {
      NODE_ENV: 'test',
      TEST_WORK_DIR: workDir,
      TEST_CONFIG_PATH: configPath,
      TEST_NAME: testName,
    };

    // Create basic test configuration
    const testConfig = {
      name: testName,
      workDir,
      database: {
        type: this.config.environment?.database || 'memory',
        path:
          this.config.environment?.database === 'sqlite'
            ? join(workDir, 'test.db')
            : ':memory:',
      },
      filesystem: {
        root: workDir,
        type: this.config.environment?.filesystem || 'temp',
      },
      network: {
        type: this.config.environment?.network || 'mock',
        port: this.getRandomPort(),
      },
    };

    await fs.writeFile(configPath, JSON.stringify(testConfig, null, 2));

    this.addCleanupCallback(async () => {
      await this.removeDir(workDir);
    });

    return { workDir, configPath, envVars };
  }

  private async setupDatabase(): Promise<DatabaseTestHelper> {
    const dbType = this.config.environment?.database || 'memory';

    switch (dbType) {
      case 'memory':
        return this.createMemoryDatabaseHelper();

      case 'sqlite':
        return await this.createSqliteDatabaseHelper();

      case 'postgres':
        return await this.createPostgresDatabaseHelper();

      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }

  private async setupFileSystem(): Promise<FileSystemTestHelper> {
    const fsType = this.config.environment?.filesystem || 'temp';

    switch (fsType) {
      case 'mock':
        return this.createMockFileSystemHelper();

      case 'temp':
        return await this.createTempFileSystemHelper();

      case 'real':
        return this.createRealFileSystemHelper();

      default:
        throw new Error(`Unsupported filesystem type: ${fsType}`);
    }
  }

  private async setupNetwork(): Promise<NetworkTestHelper> {
    const networkType = this.config.environment?.network || 'mock';

    switch (networkType) {
      case 'mock':
        return this.createMockNetworkHelper();

      case 'localhost':
        return await this.createLocalhostNetworkHelper();

      case 'integration':
        return await this.createIntegrationNetworkHelper();

      default:
        throw new Error(`Unsupported network type: ${networkType}`);
    }
  }

  private createMemoryDatabaseHelper(): DatabaseTestHelper {
    const memoryDb = new Map<string, any>();

    return {
      async setup() {
        memoryDb.clear();
      },

      async cleanup() {
        memoryDb.clear();
      },

      async seed(data: Record<string, any>[]) {
        data?.forEach((item, index) => {
          memoryDb.set(`item-${index}`, item);
        });
      },

      async reset() {
        memoryDb.clear();
      },

      getConnection(): MemoryDatabase {
        return {
          get: (key: string) => memoryDb.get(key),
          set: (key: string, value: any) => memoryDb.set(key, value),
          delete: (key: string) => memoryDb.delete(key),
          has: (key: string) => memoryDb.has(key),
          clear: () => memoryDb.clear(),
          size: () => memoryDb.size,
        };
      },
    };
  }

  private async createSqliteDatabaseHelper(): Promise<DatabaseTestHelper> {
    const dbPath = join(await this.createTempDir('db'), 'test.db');
    let db: BetterSQLiteDatabase | SQLiteDatabase | null = null;
    let isBetterSqlite = false;

    return {
      async setup() {
        // Try better-sqlite3 first, then fall back to sqlite3
        try {
          const Database = (await import('better-sqlite3')).default;
          db = new Database(dbPath) as BetterSQLiteDatabase;
          isBetterSqlite = true;

          // Create basic tables with better-sqlite3
          (db as BetterSQLiteDatabase).exec(`
            CREATE TABLE IF NOT EXISTS test_data (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              key TEXT UNIQUE,
              value TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
        } catch (_betterSqliteError) {
          try {
            // Fall back to sqlite3
            const sqlite3 = await import('sqlite3');
            db = new sqlite3.Database(dbPath) as SQLiteDatabase;
            isBetterSqlite = false;

            // Create basic tables with sqlite3
            await new Promise<void>((resolve, reject) => {
              (db as SQLiteDatabase).exec(
                `
                CREATE TABLE IF NOT EXISTS test_data (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  key TEXT UNIQUE,
                  value TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
              `,
                (err: Error | null) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          } catch (_sqliteError) {
            console.warn('No SQLite libraries available, falling back to memory database');
            return this.createMemoryDatabaseHelper().setup();
          }
        }
      },

      async cleanup() {
        if (db) {
          if (isBetterSqlite) {
            (db as BetterSQLiteDatabase).close();
          } else {
            await new Promise<void>((resolve) => {
              (db as SQLiteDatabase).close(() => resolve());
            });
          }
        }
        try {
          await fs.unlink(dbPath);
        } catch (_error) {
          // File might not exist
        }
      },

      async seed(data: Record<string, any>[]) {
        if (!db) return;

        if (isBetterSqlite) {
          const stmt = (db as BetterSQLiteDatabase).prepare(
            'INSERT OR REPLACE INTO test_data (key, value) VALUES (?, ?)'
          );

          for (const [index, item] of (data || []).entries()) {
            stmt.run(`item-${index}`, JSON.stringify(item));
          }

          stmt.finalize();
        } else {
          const stmt = (db as SQLiteDatabase).prepare(
            'INSERT OR REPLACE INTO test_data (key, value) VALUES (?, ?)'
          );

          for (const [index, item] of (data || []).entries()) {
            await new Promise<void>((resolve, reject) => {
              stmt.run(`item-${index}`, JSON.stringify(item), (err: Error | null) => {
                if (err) reject(err);
                else resolve();
              });
            });
          }

          stmt.finalize();
        }
      },

      async reset() {
        if (!db) return;

        if (isBetterSqlite) {
          (db as BetterSQLiteDatabase).prepare('DELETE FROM test_data').run();
        } else {
          await new Promise<void>((resolve, reject) => {
            (db as SQLiteDatabase).run('DELETE FROM test_data', (err: Error | null) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      },

      getConnection(): BetterSQLiteDatabase | SQLiteDatabase | null {
        return db;
      },
    };
  }

  private async createPostgresDatabaseHelper(): Promise<DatabaseTestHelper> {
    // This would require a PostgreSQL connection
    // For now, return a mock implementation
    console.warn(
      'PostgreSQL integration not implemented, using memory database'
    );
    return this.createMemoryDatabaseHelper();
  }

  private createMockFileSystemHelper(): FileSystemTestHelper {
    const mockFs = new Map<string, string>();

    return {
      async createTempDir(): Promise<string> {
        const tempPath = `/mock/temp/${Date.now()}`;
        mockFs.set(`${tempPath}/`, '');
        return tempPath;
      },

      async createFile(path: string, content: string): Promise<void> {
        mockFs.set(path, content);
      },

      async cleanup(): Promise<void> {
        mockFs.clear();
      },

      mockFileSystem(): void {
        // Already mocked
      },

      restoreFileSystem(): void {
        // Nothing to restore
      },
    };
  }

  private async createTempFileSystemHelper(): Promise<FileSystemTestHelper> {
    const tempPaths: string[] = [];

    return {
      async createTempDir(): Promise<string> {
        const tempPath = await this.createTempDir('fs-helper');
        tempPaths.push(tempPath);
        return tempPath;
      },

      async createFile(path: string, content: string): Promise<void> {
        await fs.writeFile(path, content, 'utf8');
      },

      async cleanup(): Promise<void> {
        await Promise.allSettled(tempPaths.map((path) => this.removeDir(path)));
        tempPaths.length = 0;
      },

      mockFileSystem(): void {
        // Real filesystem, no mocking needed
      },

      restoreFileSystem(): void {
        // Real filesystem, no restoration needed
      },
    };
  }

  private createRealFileSystemHelper(): FileSystemTestHelper {
    return {
      async createTempDir(): Promise<string> {
        return await this.createTempDir('real-fs');
      },

      async createFile(path: string, content: string): Promise<void> {
        await fs.writeFile(path, content, 'utf8');
      },

      async cleanup(): Promise<void> {
        // Cleanup handled by main cleanup
      },

      mockFileSystem(): void {
        console.warn('Cannot mock real filesystem');
      },

      restoreFileSystem(): void {
        console.warn('Real filesystem, nothing to restore');
      },
    };
  }

  private createMockNetworkHelper(): NetworkTestHelper {
    const mockRequests: Array<{
      method?: string;
      url?: string;
      headers?: Record<string, string | string[] | undefined>;
      timestamp: number;
      data?: Record<string, any>;
    }> = [];
    const mockResponses = new Map<string, Record<string, any> | string | number | boolean | null>();

    return {
      async startMockServer(_port?: number): Promise<void> {
        // Mock server is always "running"
      },

      async stopMockServer(): Promise<void> {
        mockRequests.length = 0;
        mockResponses.clear();
      },

      mockRequest(path: string, response: Record<string, any> | string | number | boolean | null): void {
        mockResponses.set(path, response);
      },

      captureRequests(): Array<{
        method?: string;
        url?: string;
        headers?: Record<string, string | string[] | undefined>;
        timestamp: number;
        data?: Record<string, any>;
      }> {
        return [...mockRequests];
      },

      clearRequests(): void {
        mockRequests.length = 0;
      },
    };
  }

  private async createLocalhostNetworkHelper(): Promise<NetworkTestHelper> {
    let server: HTTPServer | null = null;
    const requests: Array<{
      method?: string;
      url?: string;
      headers: Record<string, string | string[] | undefined>;
      timestamp: number;
      data?: Record<string, any>;
    }> = [];
    const routes = new Map<string, Record<string, any> | string | number | boolean | null>();

    return {
      async startMockServer(
        port: number = this.getRandomPort()
      ): Promise<void> {
        try {
          const http = await import('node:http');

          server = http.createServer((req, res) => {
            const requestData = {
              method: req.method,
              url: req.url,
              headers: req.headers,
              timestamp: Date.now(),
            };

            requests.push(requestData);

            const response = routes.get(req.url || '/');
            if (response) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response));
            } else {
              res.writeHead(404);
              res.end('Not Found');
            }
          }) as HTTPServer;

          await new Promise<void>((resolve, reject) => {
            server!.listen(port, (err?: Error) => {
              if (err) reject(err);
              else resolve();
            });
          });
        } catch (_error) {
          console.warn('HTTP server not available, using mock network');
        }
      },

      async stopMockServer(): Promise<void> {
        if (server) {
          await new Promise<void>((resolve) => {
            server!.close(() => resolve());
          });
          server = null;
        }
      },

      mockRequest(path: string, response: Record<string, any> | string | number | boolean | null): void {
        routes.set(path, response);
      },

      captureRequests(): Array<{
        method?: string;
        url?: string;
        headers: Record<string, string | string[] | undefined>;
        timestamp: number;
        data?: Record<string, any>;
      }> {
        return [...requests];
      },

      clearRequests(): void {
        requests.length = 0;
      },
    };
  }

  private async createIntegrationNetworkHelper(): Promise<NetworkTestHelper> {
    // For integration tests, we might want to test against real services
    console.warn('Integration network helper not fully implemented');
    return this.createMockNetworkHelper();
  }

  private async startServices(): Promise<void> {
    // Service startup logic would go here
    // This is a placeholder for starting required services like databases, message queues, etc.
  }

  private async stopServices(): Promise<void> {
    await Promise.allSettled(
      this.processes.map((process) => this.stopProcess(process))
    );
    this.processes = [];
  }

  private async stopProcess(process: ManagedProcess): Promise<void> {
    if (process?.kill) {
      process.kill('SIGTERM');

      // Wait for graceful shutdown
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (process.kill) {
            process.kill('SIGKILL');
          }
          resolve();
        }, 5000);

        if (process.on) {
          process.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        } else {
          // If we can't listen for exit, just wait for timeout
          setTimeout(() => {
            clearTimeout(timeout);
            resolve();
          }, 1000);
        }
      });
    }
  }

  private async createTempDir(prefix: string = 'test'): Promise<string> {
    const tempPath = join(
      tmpdir(),
      `claude-zen-flow-${prefix}-${Date.now()}-${Math.random().toString(36)}`
    );
    await fs.mkdir(tempPath, { recursive: true });
    this.tempDirs.push(tempPath);
    return tempPath;
  }

  private async removeDir(path: string): Promise<void> {
    try {
      await fs.rm(path, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to remove directory ${path}:`, error);
    }
  }

  private async cleanupTempDirs(): Promise<void> {
    if (this.config.cleanup === 'manual') {
      return;
    }

    await Promise.allSettled(this.tempDirs.map((dir) => this.removeDir(dir)));

    this.tempDirs.length = 0;
  }

  private addCleanupCallback(callback: () => Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  private getRandomPort(): number {
    return Math.floor(Math.random() * (65535 - 3000) + 3000);
  }
}

// Global integration test setup instance
export const integrationTestSetup = new IntegrationTestSetup();

// Convenience functions
export async function setupTestEnvironment(config?: IntegrationTestConfig) {
  const setup = new IntegrationTestSetup(config);
  return setup.setup();
}

export async function createTestWorkspace(
  testName: string,
  config?: IntegrationTestConfig
) {
  const setup = new IntegrationTestSetup(config);
  return setup.createIsolatedEnvironment(testName);
}
