/**
 * Real Database Provider Factory using actual database implementations
 *
 * Updated to use real SQLite, LanceDB, and Kuzu adapters with no mocks
 */
export interface DatabaseConfig {
    type: 'sqlite' | 'lancedb' | 'kuzu' | 'postgresql' | 'mysql';
    database: string;
    options?: any;
    [key: string]: any;
}
export declare class DatabaseProviderFactory {
    private logger;
    private config;
    constructor(logger: any, config: any);
    createAdapter(config: DatabaseConfig): Promise<any>;
}
export { DatabaseConfig };
//# sourceMappingURL=database-providers.d.ts.map