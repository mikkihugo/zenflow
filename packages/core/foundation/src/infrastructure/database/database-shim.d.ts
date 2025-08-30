// Temporary type shim for '@claude-zen/database' to allow foundation to build
// during local development and in CI where build order may compile foundation first.
// The actual runtime implementation is provided by the @claude-zen/database package.

declare module '@claude-zen/database' {
  // Core factories and providers (values)
  export const createDatabase: (...args: any[]) => Promise<any>;
  export const createKeyValueStorage: (...args: any[]) => Promise<any>;
  export const createDatabaseAccess: (...args: any[]) => any;
  export class DatabaseProvider {
    constructor(...args: any[])
  }
  export class DatabaseEventCoordinator {
    constructor(...args: any[])
  }
  export class SQLiteAdapter {
    constructor(...args: any[])
  }

  // Types (erased at runtime)
  export type DatabaseConfig = any;
  export type DatabaseConnection = any;
  export type KeyValueStorage = any;
  export type VectorStorage = any;
  export type GraphStorage = any;
}
