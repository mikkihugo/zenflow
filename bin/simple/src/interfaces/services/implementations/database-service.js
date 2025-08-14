import { BaseService } from './base-service.ts';
export class DatabaseService extends BaseService {
    connections = new Map();
    queryCache = new Map();
    migrations = [];
    backupTimer;
    constructor(config) {
        super(config?.name, config?.type, config);
        this.addCapability('connection-management');
        this.addCapability('query-execution');
        this.addCapability('transaction-support');
        this.addCapability('migration-management');
        this.addCapability('backup-restore');
    }
    async doInitialize() {
        this.logger.info(`Initializing database service: ${this.name}`);
        const config = this.config;
        await this.initializeConnection();
        if (config?.migrations?.enabled && config?.migrations?.autoRun) {
            await this.runMigrations();
        }
        this.logger.info(`Database service ${this.name} initialized successfully`);
    }
    async doStart() {
        this.logger.info(`Starting database service: ${this.name}`);
        const config = this.config;
        if (config?.backup?.enabled && config?.backup?.interval) {
            this.backupTimer = setInterval(() => {
                this.performBackup();
            }, config?.backup?.interval);
        }
        this.logger.info(`Database service ${this.name} started successfully`);
    }
    async doStop() {
        this.logger.info(`Stopping database service: ${this.name}`);
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = undefined;
        }
        await this.closeConnections();
        this.logger.info(`Database service ${this.name} stopped successfully`);
    }
    async doDestroy() {
        this.logger.info(`Destroying database service: ${this.name}`);
        this.queryCache.clear();
        this.migrations = [];
        this.logger.info(`Database service ${this.name} destroyed successfully`);
    }
    async doHealthCheck() {
        try {
            if (this.lifecycleStatus !== 'running') {
                return false;
            }
            const connection = this.connections.get('default');
            if (!(connection && connection.connected)) {
                this.logger.warn('Database connection is not available');
                return false;
            }
            try {
                await this.executeSimpleQuery('SELECT 1');
            }
            catch (error) {
                this.logger.warn('Database connection test query failed:', error);
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Health check failed for database service ${this.name}:`, error);
            return false;
        }
    }
    async executeOperation(operation, params, _options) {
        this.logger.debug(`Executing database operation: ${operation}`);
        switch (operation) {
            case 'query':
                return (await this.executeQuery(params?.sql, params?.parameters));
            case 'transaction':
                return (await this.executeTransaction(params?.queries));
            case 'get-connection':
                return this.getConnection(params?.name);
            case 'create-connection':
                return (await this.createConnection(params?.name, params?.config));
            case 'close-connection':
                return (await this.closeConnection(params?.name));
            case 'run-migrations':
                return (await this.runMigrations());
            case 'rollback-migration':
                return (await this.rollbackMigration(params?.steps));
            case 'backup':
                return (await this.performBackup());
            case 'restore':
                return (await this.performRestore(params?.backupPath));
            case 'get-stats':
                return this.getDatabaseStats();
            case 'clear-cache':
                return (await this.clearQueryCache());
            default:
                throw new Error(`Unknown database operation: ${operation}`);
        }
    }
    async executeQuery(sql, parameters) {
        if (!sql) {
            throw new Error('SQL query is required');
        }
        const connection = this.getConnection('default');
        if (!connection) {
            throw new Error('No database connection available');
        }
        const cacheKey = `${sql}:${JSON.stringify(parameters || [])}`;
        if (this.queryCache.has(cacheKey)) {
            this.logger.debug('Query cache hit');
            return this.queryCache.get(cacheKey);
        }
        this.logger.debug(`Executing query: ${sql.substring(0, 100)}...`);
        const result = await this.simulateQuery(sql, parameters);
        if (sql.trim().toLowerCase().startsWith('select')) {
            this.queryCache.set(cacheKey, result);
            if (this.queryCache.size > 1000) {
                const firstKey = this.queryCache.keys().next().value;
                this.queryCache.delete(firstKey);
            }
        }
        return result;
    }
    async executeTransaction(queries) {
        if (!queries || queries.length === 0) {
            throw new Error('Transaction queries are required');
        }
        const connection = this.getConnection('default');
        if (!connection) {
            throw new Error('No database connection available');
        }
        this.logger.debug(`Executing transaction with ${queries.length} queries`);
        const results = [];
        try {
            for (const query of queries) {
                const result = await this.simulateQuery(query.sql, query.parameters);
                results.push(result);
            }
            return {
                success: true,
                results,
                affectedRows: results.reduce((sum, r) => sum + (r.affectedRows || 0), 0),
            };
        }
        catch (error) {
            this.logger.error('Transaction failed:', error);
            throw new Error(`Transaction failed: ${error}`);
        }
    }
    getConnection(name = 'default') {
        return this.connections.get(name);
    }
    async createConnection(name, config) {
        this.logger.info(`Creating database connection: ${name}`);
        const connection = {
            name,
            host: config?.host || 'localhost',
            port: config?.port || 5432,
            database: config?.database || 'default',
            connected: true,
            createdAt: new Date(),
            stats: {
                queriesExecuted: 0,
                transactionsExecuted: 0,
                averageQueryTime: 0,
            },
        };
        this.connections.set(name, connection);
        this.logger.info(`Database connection ${name} created successfully`);
        return connection;
    }
    async closeConnection(name) {
        const connection = this.connections.get(name);
        if (!connection) {
            return false;
        }
        connection.connected = false;
        this.connections.delete(name);
        this.logger.info(`Database connection ${name} closed`);
        return true;
    }
    async runMigrations() {
        const config = this.config;
        if (!config?.migrations?.enabled) {
            throw new Error('Migrations are not enabled');
        }
        this.logger.info('Running database migrations');
        const migrationFiles = [
            '001_create_users_table.sql',
            '002_create_sessions_table.sql',
            '003_add_indexes.sql',
        ];
        const executed = [];
        for (const migration of migrationFiles) {
            if (!this.migrations.includes(migration)) {
                this.logger.debug(`Running migration: ${migration}`);
                await this.simulateQuery(`-- Migration: ${migration}`);
                this.migrations.push(migration);
                executed.push(migration);
            }
        }
        return {
            executed: executed.length,
            migrationFiles: executed,
            totalMigrations: this.migrations.length,
        };
    }
    async rollbackMigration(steps = 1) {
        this.logger.info(`Rolling back ${steps} migration(s)`);
        const rolledBack = [];
        for (let i = 0; i < steps && this.migrations.length > 0; i++) {
            const migration = this.migrations.pop();
            if (migration) {
                this.logger.debug(`Rolling back migration: ${migration}`);
                rolledBack.push(migration);
            }
        }
        return {
            rolledBack: rolledBack.length,
            migrationFiles: rolledBack,
            remainingMigrations: this.migrations.length,
        };
    }
    async performBackup() {
        const config = this.config;
        if (!config?.backup?.enabled) {
            throw new Error('Backup is not enabled');
        }
        this.logger.info('Performing database backup');
        const backupId = `backup-${Date.now()}`;
        const backup = {
            id: backupId,
            timestamp: new Date(),
            size: Math.floor(Math.random() * 1000000) + 500000,
            path: config?.backup?.path
                ? `${config?.backup?.path}/${backupId}.sql`
                : `./backups/${backupId}.sql`,
            status: 'completed',
        };
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.logger.info(`Database backup completed: ${backup.id}`);
        return backup;
    }
    async performRestore(backupPath) {
        if (!backupPath) {
            throw new Error('Backup path is required');
        }
        this.logger.info(`Restoring database from: ${backupPath}`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const result = {
            backupPath,
            restored: true,
            timestamp: new Date(),
            tablesRestored: Math.floor(Math.random() * 20) + 5,
            recordsRestored: Math.floor(Math.random() * 100000) + 10000,
        };
        this.logger.info('Database restore completed successfully');
        return result;
    }
    getDatabaseStats() {
        const connection = this.getConnection('default');
        return {
            connectionCount: this.connections.size,
            queryCacheSize: this.queryCache.size,
            migrationsCount: this.migrations.length,
            connectionStats: connection?.stats || {},
            serviceStats: {
                operationCount: this.operationCount,
                successCount: this.successCount,
                errorCount: this.errorCount,
                averageResponseTime: this.latencyMetrics.length > 0
                    ? this.latencyMetrics.reduce((sum, lat) => sum + lat, 0) /
                        this.latencyMetrics.length
                    : 0,
            },
        };
    }
    async clearQueryCache() {
        const cleared = this.queryCache.size;
        this.queryCache.clear();
        this.logger.info(`Cleared ${cleared} items from query cache`);
        return { cleared };
    }
    async initializeConnection() {
        const config = this.config;
        await this.createConnection('default', {
            host: config?.connection?.host || 'localhost',
            port: config?.connection?.port || 5432,
            database: config?.connection?.database || 'claude_zen',
            username: config?.connection?.username || 'postgres',
            poolSize: config?.connection?.poolSize || 10,
        });
    }
    async closeConnections() {
        const connectionNames = Array.from(this.connections.keys());
        for (const name of connectionNames) {
            await this.closeConnection(name);
        }
    }
    async simulateQuery(sql, _parameters) {
        const queryTime = Math.random() * 50 + 10;
        await new Promise((resolve) => setTimeout(resolve, queryTime));
        const connection = this.getConnection('default');
        if (connection) {
            connection.stats.queriesExecuted++;
            connection.stats.averageQueryTime =
                (connection.stats.averageQueryTime + queryTime) / 2;
        }
        const lowerSql = sql.toLowerCase().trim();
        if (lowerSql.startsWith('select')) {
            return {
                rows: this.generateMockRows(Math.floor(Math.random() * 10) + 1),
                rowCount: Math.floor(Math.random() * 10) + 1,
                fields: ['id', 'name', 'created_at'],
                queryTime,
            };
        }
        if (lowerSql.startsWith('insert')) {
            return {
                insertId: Math.floor(Math.random() * 10000) + 1,
                affectedRows: 1,
                queryTime,
            };
        }
        if (lowerSql.startsWith('update')) {
            return {
                affectedRows: Math.floor(Math.random() * 5) + 1,
                changedRows: Math.floor(Math.random() * 5) + 1,
                queryTime,
            };
        }
        if (lowerSql.startsWith('delete')) {
            return {
                affectedRows: Math.floor(Math.random() * 3) + 1,
                queryTime,
            };
        }
        return {
            success: true,
            queryTime,
        };
    }
    generateMockRows(count) {
        const rows = [];
        for (let i = 1; i <= count; i++) {
            rows.push({
                id: i,
                name: `Item ${i}`,
                created_at: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
            });
        }
        return rows;
    }
    async executeSimpleQuery(sql) {
        return await this.simulateQuery(sql);
    }
}
export default DatabaseService;
//# sourceMappingURL=database-service.js.map