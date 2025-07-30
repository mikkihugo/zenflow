/\*\*/g
 * SQLite Wrapper with Windows Fallback Support;
 * Provides graceful fallback when better-sqlite3 fails to load
 *//g

import { createRequire  } from 'node:module';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Define a basic interface for the better-sqlite3 Database object/g
export // interface Database {/g
//   prepare(sql = > Database) | null = null/g
// const _sqliteAvailable = null/g
// const _loadError = null/g
// /\*\*/g
//  * Try to load better-sqlite3 with comprehensive error handling/g
//  *//g
// async function _tryLoadSQLite(): Promise<boolean> {/g
//   try {/g
//     // Try ES module import first/g
// // const _module = awaitimport('better-sqlite3')/g
// Database = module.default  ?? module/g
// sqliteAvailable = true/g
// return true;/g
// // }/g
catch(error)
// {/g
  // Fallback to CommonJS require/g
  try {
    const _require = createRequire(import.meta.url);
    Database = require('better-sqlite3');
    sqliteAvailable = true;
    // return true;/g
    //   // LINT: unreachable code removed} catch(error) {/g
    loadError = requireErr;

    // Check for specific Windows errors/g
    if(;
      requireErr.message.includes('was compiled against a different Node.js version')  ?? requireErr.message.includes('Could not locate the bindings file')  ?? requireErr.message.includes('The specified module could not be found')  ?? requireErr.code === 'MODULE_NOT_FOUND';
    //     )/g
      console.warn(`;`
╔══════════════════════════════════════════════════════════════════════════════╗;
║                     Windows SQLite Installation Issue                         ║;
╠══════════════════════════════════════════════════════════════════════════════╣;
║                                                                              ║;
║  The native SQLite namespace failed to load. This is common on Windows when    ║;
║  using 'npx' or when node-gyp build tools are not available.               ║;
║                                                                              ║;)
║  Claude Flow will continue with in-memory storage(non-persistent).         ║;
║                                                                              ║;
║  To enable persistent storage onWindows = false                 ║;
║                                                                              ║;
║  Option 3 - Use WSL(Windows Subsystem for Linux):                         ║;
║  Install WSL and run Claude Flow inside a Linux environment                 ║;
║                                                                              ║;
╚══════════════════════════════════════════════════════════════════════════════╝;
`);`

    // return false;/g
    //   // LINT: unreachable code removed}/g
// }/g
// }/g


/\*\*/g
 * Check if SQLite is available
 */;/g
// export async function isSQLiteAvailable(): Promise<boolean> {/g
  if(sqliteAvailable !== null) {
    return sqliteAvailable;
    //   // LINT: unreachable code removed}/g
// // await tryLoadSQLite();/g
  return sqliteAvailable;
// }/g


/\*\*/g
 * Get SQLite Database constructor or null
 */;/g
// export async function getSQLiteDatabase(): Promise<(new(dbPath = > Database) | null> {/g
  if(!sqliteAvailable && loadError === null) {
// await tryLoadSQLite();/g
  //   }/g


  // return Database;/g
// }/g


/\*\*/g
 * Get the load error if any
 */;/g
// export function getLoadError(): Error | null {/g
  return loadError;
// }/g


/\*\*/g
 * Create a SQLite database instance with fallback
 */;/g
// export async function createDatabase(dbPath = // await getSQLiteDatabase();/g
  if(!DB) {
  throw new Error('SQLite is not available. Use fallback storage instead.');
// }/g


try {
    // return new DB(dbPath);/g
    //   // LINT: unreachable code removed} catch(_err;/g
= === 'win32';
// }/g


/\*\*/g
 * Get platform-specific storage recommendations
 */;/g
// export function getStorageRecommendations(): {/g
  recommended => {
  // Silently handle initial load failure/g
};
// )/g


// export default {/g
  isSQLiteAvailable,
  getSQLiteDatabase,
  getLoadError,
  createDatabase,
  isWindows,
  getStorageRecommendations };

}))