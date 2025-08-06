/**
 * Integration Test Setup - Environment Management
 *
 * Comprehensive setup and teardown for integration tests
 */

import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type {
  DatabaseTestHelper,
  FileSystemTestHelper,
  IntegrationTestConfig,
  NetworkTestHelper,
} from './types';

export class IntegrationTestSetup {
  private config: IntegrationTestConfig;
  private tempDirs: string[] = [];
  private processes: any[] = [];
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
          this.config.environment?.database === 'sqlite' ? join(workDir, 'test.db') : ':memory:',
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

      async seed(data: any[]) {
        data.forEach((item, index) => {
          memoryDb.set(`item-${index}`, item);
        });
      },

      async reset() {
        memoryDb.clear();
      },

      getConnection() {
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
    let db: any = null;

    return {
      async setup() {
        // Import sqlite3 dynamically
        try {
          const sqlite3 = await import('sqlite3');
          db = new sqlite3.Database(dbPath);

          // Create basic tables
          await new Promise<void>((resolve, reject) => {
            db.exec(
              `
              CREATE TABLE IF NOT EXISTS test_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                value TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              );
            `,
              (err: any) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        } catch (_error) {
          console.warn('SQLite not available, falling back to memory database');
          return this.createMemoryDatabaseHelper().setup();
        }
      },

      async cleanup() {
        if (db) {
          await new Promise<void>((resolve) => {
            db.close(() => resolve());
          });
        }
        try {
          await fs.unlink(dbPath);
        } catch (_error) {
          // File might not exist
        }
      },

      async seed(data: any[]) {
        if (!db) return;

        const stmt = db.prepare('INSERT OR REPLACE INTO test_data (key, value) VALUES (?, ?)');

        for (const [index, item] of data.entries()) {
          await new Promise<void>((resolve, reject) => {
            stmt.run(`item-${index}`, JSON.stringify(item), (err: any) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }

        stmt.finalize();
      },

      async reset() {
        if (!db) return;

        await new Promise<void>((resolve, reject) => {
          db.run('DELETE FROM test_data', (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      },

      getConnection() {
        return db;
      },
    };
  }

  private async createPostgresDatabaseHelper(): Promise<DatabaseTestHelper> {
    // This would require a PostgreSQL connection
    // For now, return a mock implementation
    console.warn('PostgreSQL integration not implemented, using memory database');
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
    const mockRequests: any[] = [];
    const mockResponses = new Map<string, any>();

    return {
      async startMockServer(_port?: number): Promise<void> {
        // Mock server is always "running"
      },

      async stopMockServer(): Promise<void> {
        mockRequests.length = 0;
        mockResponses.clear();
      },

      mockRequest(path: string, response: any): void {
        mockResponses.set(path, response);
      },

      captureRequests(): any[] {
        return [...mockRequests];
      },

      clearRequests(): void {
        mockRequests.length = 0;
      },
    };
  }

  private async createLocalhostNetworkHelper(): Promise<NetworkTestHelper> {
    let server: any = null;
    const requests: any[] = [];
    const routes = new Map<string, any>();

    return {
      async startMockServer(port: number = this.getRandomPort()): Promise<void> {
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
          });

          await new Promise<void>((resolve, reject) => {
            server.listen(port, (err: any) => {
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
            server.close(() => resolve());
          });
          server = null;
        }
      },

      mockRequest(path: string, response: any): void {
        routes.set(path, response);
      },

      captureRequests(): any[] {
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
    await Promise.allSettled(this.processes.map((process) => this.stopProcess(process)));
    this.processes = [];
  }

  private async stopProcess(process: any): Promise<void> {
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

        process.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
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

export async function createTestWorkspace(testName: string, config?: IntegrationTestConfig) {
  const setup = new IntegrationTestSetup(config);
  return setup.createIsolatedEnvironment(testName);
}
