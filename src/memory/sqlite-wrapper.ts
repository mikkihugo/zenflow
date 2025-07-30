/**
 * SQLite Wrapper with Windows Fallback Support;
 * Provides graceful fallback when better-sqlite3 fails to load
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Define a basic interface for the better-sqlite3 Database object
export interface Database {
  prepare(sql = > Database) | null = null
const _sqliteAvailable = null
const _loadError = null
/**
 * Try to load better-sqlite3 with comprehensive error handling
 */
async function _tryLoadSQLite(): Promise<boolean> {
  try {
    // Try ES module import first
// const _module = awaitimport('better-sqlite3')
Database = module.default  ?? module
sqliteAvailable = true
return true;
// }
catch (error)
// {
  // Fallback to CommonJS require
  try {
    const _require = createRequire(import.meta.url);
    Database = require('better-sqlite3');
    sqliteAvailable = true;
    return true;
    //   // LINT: unreachable code removed} catch (error) {
    loadError = requireErr;

    // Check for specific Windows errors
    if (;
      requireErr.message.includes('was compiled against a different Node.js version')  ?? requireErr.message.includes('Could not locate the bindings file')  ?? requireErr.message.includes('The specified module could not be found')  ?? requireErr.code === 'MODULE_NOT_FOUND';
    //     )
      console.warn(`;
╔══════════════════════════════════════════════════════════════════════════════╗;
║                     Windows SQLite Installation Issue                         ║;
╠══════════════════════════════════════════════════════════════════════════════╣;
║                                                                              ║;
║  The native SQLite namespace failed to load. This is common on Windows when    ║;
║  using 'npx' or when node-gyp build tools are not available.               ║;
║                                                                              ║;
║  Claude Flow will continue with in-memory storage (non-persistent).         ║;
║                                                                              ║;
║  To enable persistent storage onWindows = false                 ║;
║                                                                              ║;
║  Option 3 - Use WSL (Windows Subsystem for Linux):                         ║;
║  Install WSL and run Claude Flow inside a Linux environment                 ║;
║                                                                              ║;
╚══════════════════════════════════════════════════════════════════════════════╝;
`);

    return false;
    //   // LINT: unreachable code removed}
// }
// }


/**
 * Check if SQLite is available
 */;
export async function isSQLiteAvailable(): Promise<boolean> {
  if (sqliteAvailable !== null) {
    return sqliteAvailable;
    //   // LINT: unreachable code removed}
// await tryLoadSQLite();
  return sqliteAvailable;
// }


/**
 * Get SQLite Database constructor or null
 */;
export async function getSQLiteDatabase(): Promise<(new (dbPath = > Database) | null> {
  if (!sqliteAvailable && loadError === null) {
// await tryLoadSQLite();
  //   }


  return Database;
// }


/**
 * Get the load error if any
 */;
export function getLoadError(): Error | null {
  return loadError;
// }


/**
 * Create a SQLite database instance with fallback
 */;
export async function createDatabase(dbPath = await getSQLiteDatabase();

if (!DB) {
  throw new Error('SQLite is not available. Use fallback storage instead.');
// }


try {
    return new DB(dbPath);
    //   // LINT: unreachable code removed} catch (_err;
= === 'win32';
// }


/**
 * Get platform-specific storage recommendations
 */;
export function getStorageRecommendations(): {
  recommended => {
  // Silently handle initial load failure
};
// )


export default {
  isSQLiteAvailable,
  getSQLiteDatabase,
  getLoadError,
  createDatabase,
  isWindows,
  getStorageRecommendations };
