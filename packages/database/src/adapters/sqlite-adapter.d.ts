/**
 * Real SQLite Database Adapter
 *
 * Real SQLite adapter using better-sqlite3 for structured document storage
 */
export interface SQLiteConfig {
    type: 'sqlite';
    database: string;
    options?: {
        readonly?: boolean;
        fileMustExist?: boolean;
        timeout?: number;
    };
}
export declare class SQLiteAdapter {
    private db;
    private config;
    private connected;
    constructor(config: SQLiteConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any>;
    execute(sql: string, params?: any[]): Promise<any>;
    transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    getSchema(): Promise<any>;
    getConnectionStats(): Promise<any>;
    private initializeTables;
    /**
     * Run database migrations to add missing columns
     */
    private runMigrations;
}
//# sourceMappingURL=sqlite-adapter.d.ts.map