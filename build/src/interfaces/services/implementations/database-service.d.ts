/**
 * Database Service Implementation.
 *
 * Service implementation for database operations, connection management,
 * and data persistence.
 */
/**
 * @file Database service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { DatabaseServiceConfig, ServiceOperationOptions } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Database service implementation.
 *
 * @example
 */
export declare class DatabaseService extends BaseService implements IService {
    private connections;
    private queryCache;
    private migrations;
    private backupTimer?;
    constructor(config: DatabaseServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    private executeQuery;
    private executeTransaction;
    private getConnection;
    private createConnection;
    private closeConnection;
    private runMigrations;
    private rollbackMigration;
    private performBackup;
    private performRestore;
    private getDatabaseStats;
    private clearQueryCache;
    private initializeConnection;
    private closeConnections;
    private simulateQuery;
    private generateMockRows;
    private executeSimpleQuery;
}
export default DatabaseService;
//# sourceMappingURL=database-service.d.ts.map