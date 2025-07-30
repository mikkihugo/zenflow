/**
 * SQLite Wrapper with Windows Fallback Support
 * Provides graceful fallback when better-sqlite3 fails to load
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a basic interface for the better-sqlite3 Database object
export interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): Database;
  pragma(sql: string): any;
  close(): void;
  // Add other methods as needed based on usage
}

export interface Statement {
  run(...params: any[]): { changes: number; lastInsertRowid: number };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

let Database: (new (dbPath: string) => Database) | null = null;
let sqliteAvailable: boolean | null = null;
let loadError: Error | null = null;

/**
 * Try to load better-sqlite3 with comprehensive error handling
 */
async function tryLoadSQLite(): Promise<boolean> {
  try {
    // Try ES module import first
    const module = await import('better-sqlite3');
    Database = module.default || module;
    sqliteAvailable = true;
    return true;
  } catch (importErr: any) {
    // Fallback to CommonJS require
    try {
      const require = createRequire(import.meta.url);
      Database = require('better-sqlite3');
      sqliteAvailable = true;
      return true;
    } catch (requireErr: any) {
      loadError = requireErr;
      
      // Check for specific Windows errors
      if (requireErr.message.includes('was compiled against a different Node.js version') ||
          requireErr.message.includes('Could not locate the bindings file') ||
          requireErr.message.includes('The specified module could not be found') ||
          requireErr.code === 'MODULE_NOT_FOUND') {
        
        console.warn(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                     Windows SQLite Installation Issue                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  The native SQLite module failed to load. This is common on Windows when    ║
║  using 'npx' or when node-gyp build tools are not available.               ║
║                                                                              ║
║  Claude Flow will continue with in-memory storage (non-persistent).         ║
║                                                                              ║
║  To enable persistent storage on Windows:                                    ║
║                                                                              ║
║  Option 1 - Install Windows Build Tools:                                    ║
║  > npm install --global windows-build-tools                                 ║
║  > npm install claude-zen@alpha                                           ║
║                                                                              ║
║  Option 2 - Use Pre-built Binaries:                                        ║
║  > npm config set python python3                                           ║
║  > npm install claude-zen@alpha --build-from-source=false                 ║
║                                                                              ║
║  Option 3 - Use WSL (Windows Subsystem for Linux):                         ║
║  Install WSL and run Claude Flow inside a Linux environment                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);
      }
      
      return false;
    }
  }
}

/**
 * Check if SQLite is available
 */
export async function isSQLiteAvailable(): Promise<boolean> {
  if (sqliteAvailable !== null) {
    return sqliteAvailable;
  }
  
  await tryLoadSQLite();
  return sqliteAvailable;
}

/**
 * Get SQLite Database constructor or null
 */
export async function getSQLiteDatabase(): Promise<(new (dbPath: string) => Database) | null> {
  if (!sqliteAvailable && loadError === null) {
    await tryLoadSQLite();
  }
  
  return Database;
}

/**
 * Get the load error if any
 */
export function getLoadError(): Error | null {
  return loadError;
}

/**
 * Create a SQLite database instance with fallback
 */
export async function createDatabase(dbPath: string): Promise<Database> {
  const DB = await getSQLiteDatabase();
  
  if (!DB) {
    throw new Error('SQLite is not available. Use fallback storage instead.');
  }
  
  try {
    return new DB(dbPath);
  } catch (err: any) {
    // Additional Windows-specific error handling
    if (err.message.includes('EPERM') || err.message.includes('access denied')) {
      throw new Error(`Cannot create database at ${dbPath}. Permission denied. Try using a different directory or running with administrator privileges.`);
    }
    throw err;
  }
}

/**
 * Check if running on Windows
 */
export function isWindows(): boolean {
  return (process as any).platform === 'win32';
}

/**
 * Get platform-specific storage recommendations
 */
export function getStorageRecommendations(): {
  recommended: string;
  reason: string;
  alternatives: string[];
} {
  if (isWindows()) {
    return {
      recommended: 'in-memory',
      reason: 'Windows native module compatibility',
      alternatives: [
        'Install Windows build tools for SQLite support',
        'Use WSL (Windows Subsystem for Linux)',
        'Use Docker container with Linux'
      ]
    };
  }
  
  return {
    recommended: 'sqlite',
    reason: 'Best performance and persistence',
    alternatives: ['in-memory for testing']
  };
}

// Pre-load SQLite on module import
tryLoadSQLite().catch(() => {
  // Silently handle initial load failure
});

export default {
  isSQLiteAvailable,
  getSQLiteDatabase,
  getLoadError,
  createDatabase,
  isWindows,
  getStorageRecommendations
};