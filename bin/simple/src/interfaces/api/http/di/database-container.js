import { getLogger } from '../../../../config/logging-config.ts';
const logger = getLogger('interfaces-api-http-di-database-container');
class ConsoleLogger {
    debug(_message, _meta) {
        if (process.env['NODE_ENV'] === 'development') {
        }
    }
    info(_message, _meta) { }
    warn(message, meta) {
        logger.warn(`[WARN] ${message}`, meta || '');
    }
    error(message, meta) {
        logger.error(`[ERROR] ${message}`, meta || '');
    }
}
class MockDatabaseAdapter {
    config;
    isConnected = false;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        this.isConnected = true;
    }
    async disconnect() {
        this.isConnected = false;
    }
    async health() {
        return this.isConnected;
    }
    async getConnectionStats() {
        return {
            active: this.isConnected ? 1 : 0,
            idle: 0,
            max: this.config.pool?.max || 5,
            failed: 0,
        };
    }
    async query(sql, _params) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
        if (sql.toLowerCase().includes('select')) {
            return {
                rows: [
                    { id: 1, name: 'Sample Data', created_at: new Date().toISOString() },
                    { id: 2, name: 'Another Row', created_at: new Date().toISOString() },
                ],
                fields: [
                    { name: 'id', type: 'integer' },
                    { name: 'name', type: 'text' },
                    { name: 'created_at', type: 'timestamp' },
                ],
                rowCount: 2,
            };
        }
        return {
            rows: [],
            fields: [],
            rowCount: 0,
        };
    }
    async execute(_sql, _params) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
        return {
            affectedRows: 1,
            insertId: Date.now(),
            executionTime: Math.random() * 5,
        };
    }
    async transaction(fn) {
        return fn(this);
    }
    async getSchema() {
        return {
            tables: [
                {
                    name: 'users',
                    columns: [
                        { name: 'id', type: 'integer', primaryKey: true },
                        { name: 'name', type: 'text', nullable: false },
                        { name: 'email', type: 'text', nullable: true },
                        { name: 'created_at', type: 'timestamp', nullable: false },
                    ],
                    indexes: [
                        { name: 'users_pkey', columns: ['id'], unique: true },
                        { name: 'users_email_idx', columns: ['email'], unique: false },
                    ],
                },
            ],
            views: [],
            version: '3.0.0',
        };
    }
}
class MockDatabaseProviderFactory {
    createAdapter(config) {
        return new MockDatabaseAdapter(config);
    }
}
class SimplifiedDatabaseController {
    adapter;
    logger;
    config;
    performanceMetrics = {
        operationCount: 0,
        totalResponseTime: 0,
        errorCount: 0,
        startTime: Date.now(),
        lastOperationTime: Date.now(),
    };
    constructor() {
        this.logger = new ConsoleLogger();
        this.config = {
            type: 'sqlite',
            database: ':memory:',
            pool: { min: 1, max: 5, idle: 30 },
        };
        const factory = new MockDatabaseProviderFactory();
        this.adapter = factory.createAdapter(this.config);
        this.adapter.connect();
    }
    async getDatabaseStatus() {
        const startTime = Date.now();
        try {
            this.logger.debug('Getting database status');
            const [isHealthy, connectionStats] = await Promise.all([
                this.adapter.health(),
                this.adapter.getConnectionStats(),
            ]);
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            const healthStatus = {
                status: isHealthy ? 'healthy' : 'critical',
                adapter: this.config.type,
                connected: isHealthy,
                responseTime: executionTime,
                connectionStats,
                lastSuccess: this.performanceMetrics.lastOperationTime,
                version: '3.0.0',
            };
            return {
                success: true,
                data: healthStatus,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Failed to get database status: ${error}`);
            return {
                success: false,
                error: `Failed to get database status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    async executeQuery(request) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Executing database query: ${request.sql.substring(0, 100)}...`);
            if (!request.sql) {
                throw new Error('SQL query is required');
            }
            if (!this.isQueryStatement(request.sql)) {
                throw new Error('Only SELECT statements are allowed for query operations');
            }
            const result = await this.adapter.query(request.sql, request.params);
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this.logger.debug(`Query completed successfully in ${executionTime}ms, returned ${result?.rowCount} rows`);
            return {
                success: true,
                data: {
                    query: request.sql,
                    parameters: request.params,
                    results: result?.rows,
                    fields: result?.fields,
                },
                metadata: {
                    rowCount: result?.rowCount,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Query execution failed: ${error}`);
            return {
                success: false,
                error: `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    async executeCommand(request) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Executing database command: ${request.sql.substring(0, 100)}...`);
            if (!request.sql) {
                throw new Error('SQL command is required');
            }
            const result = await this.adapter.execute(request.sql, request.params);
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this.logger.debug(`Command completed successfully in ${executionTime}ms, affected ${result?.affectedRows} rows`);
            return {
                success: true,
                data: {
                    command: request.sql,
                    parameters: request.params,
                    affectedRows: result?.affectedRows,
                    insertId: result?.insertId,
                },
                metadata: {
                    rowCount: result?.affectedRows,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Command execution failed: ${error}`);
            return {
                success: false,
                error: `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    async executeTransaction(request) {
        const startTime = Date.now();
        try {
            this.logger.debug(`Executing transaction with ${request.operations.length} operations`);
            if (!request.operations || request.operations.length === 0) {
                throw new Error('At least one operation is required for transaction');
            }
            const results = await this.adapter.transaction(async (tx) => {
                const transactionResults = [];
                for (const operation of request.operations) {
                    try {
                        let result;
                        if (operation.type === 'query') {
                            result = await tx.query(operation.sql, operation.params);
                            transactionResults.push({
                                type: 'query',
                                sql: operation.sql,
                                params: operation.params,
                                success: true,
                                rowCount: result?.rowCount,
                                data: result?.rows,
                            });
                        }
                        else if (operation.type === 'execute') {
                            result = await tx.execute(operation.sql, operation.params);
                            transactionResults.push({
                                type: 'execute',
                                sql: operation.sql,
                                params: operation.params,
                                success: true,
                                affectedRows: result?.affectedRows,
                                insertId: result?.insertId,
                            });
                        }
                        else {
                            throw new Error(`Unsupported operation type: ${operation.type}`);
                        }
                    }
                    catch (error) {
                        const errorResult = {
                            type: operation.type,
                            sql: operation.sql,
                            params: operation.params,
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                        };
                        transactionResults.push(errorResult);
                        if (!request.continueOnError) {
                            throw error;
                        }
                    }
                }
                return transactionResults;
            });
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            const totalRows = results.reduce((sum, r) => sum + (r.rowCount || r.affectedRows || 0), 0);
            const successfulOps = results.filter((r) => r.success).length;
            this.logger.debug(`Transaction completed successfully in ${executionTime}ms, ${successfulOps}/${results.length} operations successful`);
            return {
                success: true,
                data: {
                    results,
                    summary: {
                        totalOperations: request.operations.length,
                        successfulOperations: successfulOps,
                        failedOperations: results.length - successfulOps,
                        totalRowsAffected: totalRows,
                    },
                },
                metadata: {
                    rowCount: totalRows,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Transaction failed: ${error}`);
            return {
                success: false,
                error: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    async getDatabaseSchema() {
        const startTime = Date.now();
        try {
            this.logger.debug('Getting database schema information');
            const schema = await this.adapter.getSchema();
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            const schemaStats = {
                totalTables: schema.tables.length,
                totalViews: schema.views.length,
                totalColumns: schema.tables.reduce((sum, table) => sum + table.columns.length, 0),
                totalIndexes: schema.tables.reduce((sum, table) => sum + table.indexes.length, 0),
            };
            this.logger.debug(`Schema retrieved successfully in ${executionTime}ms`);
            return {
                success: true,
                data: {
                    schema,
                    statistics: schemaStats,
                    version: schema.version,
                    adapter: this.config.type,
                },
                metadata: {
                    rowCount: schema.tables.length,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Failed to get schema: ${error}`);
            return {
                success: false,
                error: `Failed to get schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    async executeMigration(request) {
        const startTime = Date.now();
        try {
            this.logger.info(`Executing migration: ${request.version} - ${request.description || 'No description'}`);
            if (!request.statements || request.statements.length === 0) {
                throw new Error('Migration statements are required');
            }
            if (request.dryRun) {
                this.logger.info('Dry run mode: validating migration statements');
                const validationResults = [];
                for (const statement of request.statements) {
                    try {
                        validationResults.push({
                            statement: `${statement.substring(0, 100)}...`,
                            valid: true,
                            issues: [],
                        });
                    }
                    catch (error) {
                        validationResults.push({
                            statement: `${statement.substring(0, 100)}...`,
                            valid: false,
                            issues: [
                                error instanceof Error ? error.message : 'Validation error',
                            ],
                        });
                    }
                }
                const executionTime = Date.now() - startTime;
                return {
                    success: true,
                    data: {
                        dryRun: true,
                        version: request.version,
                        description: request.description,
                        validationResults,
                        totalStatements: request.statements.length,
                        validStatements: validationResults.filter((r) => r.valid)
                            .length,
                    },
                    metadata: {
                        rowCount: 0,
                        executionTime,
                        timestamp: Date.now(),
                        adapter: this.config.type,
                    },
                };
            }
            const results = await this.adapter.transaction(async (tx) => {
                const migrationResults = [];
                for (const statement of request.statements) {
                    try {
                        const result = await tx.execute(statement);
                        migrationResults.push({
                            statement: `${statement.substring(0, 100)}...`,
                            success: true,
                            affectedRows: result?.affectedRows,
                            executionTime: result?.executionTime,
                        });
                    }
                    catch (error) {
                        migrationResults.push({
                            statement: `${statement.substring(0, 100)}...`,
                            success: false,
                            error: error instanceof Error ? error.message : 'Execution error',
                        });
                        throw error;
                    }
                }
                return migrationResults;
            });
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this.logger.info(`Migration ${request.version} completed successfully in ${executionTime}ms`);
            return {
                success: true,
                data: {
                    version: request.version,
                    description: request.description,
                    results,
                    totalStatements: request.statements.length,
                    successfulStatements: results.length,
                },
                metadata: {
                    rowCount: results.reduce((sum, r) => sum + (r.affectedRows || 0), 0),
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Migration failed: ${error}`);
            return {
                success: false,
                error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    async getDatabaseAnalytics() {
        const startTime = Date.now();
        try {
            this.logger.debug('Getting database analytics');
            const [connectionStats, isHealthy] = await Promise.all([
                this.adapter.getConnectionStats(),
                this.adapter.health(),
            ]);
            const analytics = {
                adapter: this.config.type,
                health: {
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    uptime: Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000),
                    lastOperation: this.performanceMetrics.lastOperationTime,
                },
                performance: {
                    totalOperations: this.performanceMetrics.operationCount,
                    averageResponseTime: this.performanceMetrics.operationCount > 0
                        ? this.performanceMetrics.totalResponseTime /
                            this.performanceMetrics.operationCount
                        : 0,
                    successRate: this.performanceMetrics.operationCount > 0
                        ? ((this.performanceMetrics.operationCount -
                            this.performanceMetrics.errorCount) /
                            this.performanceMetrics.operationCount) *
                            100
                        : 100,
                    errorRate: this.performanceMetrics.operationCount > 0
                        ? (this.performanceMetrics.errorCount /
                            this.performanceMetrics.operationCount) *
                            100
                        : 0,
                    operationsPerSecond: this.calculateOperationsPerSecond(),
                },
                connections: connectionStats,
                configuration: {
                    type: this.config.type,
                    host: this.config.host,
                    port: this.config.port,
                    database: this.config.database,
                    poolConfig: this.config.pool,
                    sslEnabled: this.config.ssl?.enabled,
                },
            };
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: analytics,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this.logger.error(`Failed to get analytics: ${error}`);
            return {
                success: false,
                error: `Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this.config.type,
                },
            };
        }
    }
    isQueryStatement(sql) {
        const trimmedSql = sql.trim().toLowerCase();
        return (trimmedSql.startsWith('select') ||
            trimmedSql.startsWith('with') ||
            trimmedSql.startsWith('show') ||
            trimmedSql.startsWith('explain') ||
            trimmedSql.startsWith('describe'));
    }
    updateMetrics(responseTime, success) {
        this.performanceMetrics.operationCount++;
        this.performanceMetrics.totalResponseTime += responseTime;
        this.performanceMetrics.lastOperationTime = Date.now();
        if (!success) {
            this.performanceMetrics.errorCount++;
        }
    }
    calculateOperationsPerSecond() {
        const uptimeSeconds = (Date.now() - this.performanceMetrics.startTime) / 1000;
        return uptimeSeconds > 0
            ? this.performanceMetrics.operationCount / uptimeSeconds
            : 0;
    }
}
let databaseController;
export function getDatabaseController() {
    if (!databaseController) {
        databaseController = new SimplifiedDatabaseController();
    }
    return databaseController;
}
export function resetDatabaseContainer() {
    databaseController = undefined;
}
export async function checkDatabaseContainerHealth() {
    const errors = [];
    const services = {
        logger: false,
        config: false,
        factory: false,
        controller: false,
    };
    try {
        const controller = getDatabaseController();
        try {
            const result = await controller.getDatabaseStatus();
            services.controller = result?.success;
            services.logger = true;
            services.config = true;
            services.factory = true;
        }
        catch (error) {
            errors.push(`Controller: ${error.message}`);
        }
    }
    catch (error) {
        errors.push(`Container: ${error.message}`);
    }
    const allHealthy = Object.values(services).every(Boolean);
    return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        services,
        errors,
    };
}
//# sourceMappingURL=database-container.js.map