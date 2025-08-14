var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject } from '../../di/decorators/inject.ts';
import { injectable } from '../../di/decorators/injectable.ts';
import { CORE_TOKENS, DATABASE_TOKENS } from '../../di/tokens/core-tokens.ts';
let DatabaseController = class DatabaseController {
    _factory;
    _config;
    _logger;
    adapter;
    performanceMetrics = {
        operationCount: 0,
        totalResponseTime: 0,
        errorCount: 0,
        startTime: Date.now(),
        lastOperationTime: Date.now(),
    };
    constructor(_factory, _config, _logger) {
        this._factory = _factory;
        this._config = _config;
        this._logger = _logger;
        this.initializeAdapter();
    }
    async getDatabaseStatus() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting database status');
            const [isHealthy, connectionStats] = await Promise.all([
                this.adapter.health(),
                this.adapter.getConnectionStats(),
            ]);
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            const healthStatus = {
                status: isHealthy ? 'healthy' : 'critical',
                adapter: this._config.type,
                connected: isHealthy,
                responseTime: executionTime,
                connectionStats,
                lastSuccess: this.performanceMetrics.lastOperationTime,
                version: await this.getDatabaseVersion(),
            };
            return {
                success: true,
                data: healthStatus,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get database status: ${error}`);
            return {
                success: false,
                error: `Failed to get database status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async executeQuery(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing database query: ${request.sql.substring(0, 100)}...`);
            if (!request.sql) {
                throw new Error('SQL query is required');
            }
            if (this.isCypherQuery(request.sql) && this.isGraphAdapter()) {
                this._logger.debug('Detected Cypher query, routing to graph adapter');
                return this.routeToGraphQuery({
                    cypher: request.sql,
                    params: request.params,
                    options: {
                        timeout: request.options?.timeout,
                        maxNodes: undefined,
                        maxRelationships: undefined,
                        includeExecutionPlan: request.options?.includeExecutionPlan,
                    },
                });
            }
            if (!this.isQueryStatement(request.sql)) {
                throw new Error('Only SELECT statements are allowed for query operations');
            }
            const result = await this.adapter.query(request.sql, request.params);
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.debug(`Query completed successfully in ${executionTime}ms, returned ${result?.rowCount} rows`);
            return {
                success: true,
                data: {
                    query: request.sql,
                    parameters: request.params,
                    results: result?.rows,
                    fields: result?.fields,
                    executionPlan: request.options?.includeExecutionPlan
                        ? await this.getExecutionPlan(request.sql)
                        : undefined,
                },
                metadata: {
                    rowCount: result?.rowCount,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Query execution failed: ${error}`);
            return {
                success: false,
                error: `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async executeCommand(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing database command: ${request.sql.substring(0, 100)}...`);
            if (!request.sql) {
                throw new Error('SQL command is required');
            }
            const result = await this.adapter.execute(request.sql, request.params);
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.debug(`Command completed successfully in ${executionTime}ms, affected ${result?.affectedRows} rows`);
            return {
                success: true,
                data: {
                    command: request.sql,
                    parameters: request.params,
                    affectedRows: result?.affectedRows,
                    insertId: result?.insertId,
                    details: request.options?.detailed
                        ? {
                            statementType: this.getStatementType(request.sql),
                            executionTime: result?.executionTime,
                            optimizationHints: request.options?.prepared
                                ? 'prepared_statement'
                                : 'direct_execution',
                        }
                        : undefined,
                },
                metadata: {
                    rowCount: result?.affectedRows,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Command execution failed: ${error}`);
            return {
                success: false,
                error: `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async executeTransaction(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing transaction with ${request.operations.length} operations`);
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
                                error: undefined,
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
                                error: undefined,
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
                            rowCount: undefined,
                            data: undefined,
                            affectedRows: undefined,
                            insertId: undefined,
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
            this._logger.debug(`Transaction completed successfully in ${executionTime}ms, ${successfulOps}/${results.length} operations successful`);
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
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Transaction failed: ${error}`);
            return {
                success: false,
                error: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async executeBatch(request) {
        if (request.useTransaction) {
            return this.executeTransaction(request);
        }
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing batch operations: ${request.operations.length} operations`);
            const results = [];
            let errorCount = 0;
            let totalRows = 0;
            for (const operation of request.operations) {
                try {
                    let result;
                    if (operation.type === 'query') {
                        const queryResult = await this.executeQuery({
                            sql: operation.sql,
                            params: operation.params,
                        });
                        result = {
                            type: 'query',
                            sql: operation.sql,
                            params: operation.params,
                            success: queryResult?.success,
                            data: queryResult?.data,
                            rowCount: queryResult?.metadata?.rowCount || 0,
                            error: queryResult?.error,
                        };
                        totalRows += result?.rowCount;
                    }
                    else if (operation.type === 'execute') {
                        const executeResult = await this.executeCommand({
                            sql: operation.sql,
                            params: operation.params,
                        });
                        result = {
                            type: 'execute',
                            sql: operation.sql,
                            params: operation.params,
                            success: executeResult?.success,
                            affectedRows: executeResult?.metadata?.rowCount || 0,
                            data: executeResult?.data,
                            error: executeResult?.error,
                        };
                        totalRows += result?.affectedRows;
                    }
                    else {
                        throw new Error(`Unsupported operation type: ${operation.type}`);
                    }
                    results.push(result);
                    if (!result?.success) {
                        errorCount++;
                        if (!request.continueOnError) {
                            break;
                        }
                    }
                }
                catch (error) {
                    errorCount++;
                    results.push({
                        type: operation.type,
                        sql: operation.sql,
                        params: operation.params,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    if (!request.continueOnError) {
                        break;
                    }
                }
            }
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, errorCount === 0);
            this._logger.debug(`Batch operations completed in ${executionTime}ms: ${results.length - errorCount}/${results.length} successful`);
            return {
                success: errorCount === 0,
                data: {
                    results,
                    summary: {
                        totalOperations: request.operations.length,
                        successfulOperations: results.length - errorCount,
                        failedOperations: errorCount,
                        totalRowsAffected: totalRows,
                    },
                },
                metadata: {
                    rowCount: totalRows,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Batch operations failed: ${error}`);
            return {
                success: false,
                error: `Batch operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async getDatabaseSchema() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting database schema information');
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
            this._logger.debug(`Schema retrieved successfully in ${executionTime}ms`);
            return {
                success: true,
                data: {
                    schema,
                    statistics: schemaStats,
                    version: schema.version,
                    adapter: this._config.type,
                },
                metadata: {
                    rowCount: schema.tables.length,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get schema: ${error}`);
            return {
                success: false,
                error: `Failed to get schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async executeMigration(request) {
        const startTime = Date.now();
        try {
            this._logger.info(`Executing migration: ${request.version} - ${request.description || 'No description'}`);
            if (!request.statements || request.statements.length === 0) {
                throw new Error('Migration statements are required');
            }
            if (request.dryRun) {
                this._logger.info('Dry run mode: validating migration statements');
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
                            issues: [error instanceof Error ? error.message : 'Validation error'],
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
                        validStatements: validationResults.filter((r) => r.valid).length,
                    },
                    metadata: {
                        rowCount: 0,
                        executionTime,
                        timestamp: Date.now(),
                        adapter: this._config.type,
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
            this._logger.info(`Migration ${request.version} completed successfully in ${executionTime}ms`);
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
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Migration failed: ${error}`);
            return {
                success: false,
                error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async getDatabaseAnalytics() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting database analytics');
            const [connectionStats, isHealthy] = await Promise.all([
                this.adapter.getConnectionStats(),
                this.adapter.health(),
            ]);
            const analytics = {
                adapter: this._config.type,
                health: {
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    uptime: Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000),
                    lastOperation: this.performanceMetrics.lastOperationTime,
                },
                performance: {
                    totalOperations: this.performanceMetrics.operationCount,
                    averageResponseTime: this.performanceMetrics.operationCount > 0
                        ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.operationCount
                        : 0,
                    successRate: this.performanceMetrics.operationCount > 0
                        ? ((this.performanceMetrics.operationCount - this.performanceMetrics.errorCount) /
                            this.performanceMetrics.operationCount) *
                            100
                        : 100,
                    errorRate: this.performanceMetrics.operationCount > 0
                        ? (this.performanceMetrics.errorCount / this.performanceMetrics.operationCount) * 100
                        : 0,
                    operationsPerSecond: this.calculateOperationsPerSecond(),
                },
                connections: connectionStats,
                configuration: {
                    type: this._config.type,
                    host: this._config.host,
                    port: this._config.port,
                    database: this._config.database,
                    poolConfig: this._config.pool,
                    sslEnabled: this._config.ssl?.enabled,
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
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get analytics: ${error}`);
            return {
                success: false,
                error: `Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async initializeAdapter() {
        try {
            this.adapter = this._factory.createAdapter(this._config);
            await this.adapter.connect();
            this._logger.info(`Database controller initialized with ${this._config.type} adapter`);
        }
        catch (error) {
            this._logger.error(`Failed to initialize database adapter: ${error}`);
            throw error;
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
    getStatementType(sql) {
        const trimmedSql = sql.trim().toLowerCase();
        if (trimmedSql.startsWith('select'))
            return 'SELECT';
        if (trimmedSql.startsWith('insert'))
            return 'INSERT';
        if (trimmedSql.startsWith('update'))
            return 'UPDATE';
        if (trimmedSql.startsWith('delete'))
            return 'DELETE';
        if (trimmedSql.startsWith('create'))
            return 'CREATE';
        if (trimmedSql.startsWith('alter'))
            return 'ALTER';
        if (trimmedSql.startsWith('drop'))
            return 'DROP';
        return 'UNKNOWN';
    }
    async getExecutionPlan(sql) {
        try {
            switch (this._config.type) {
                case 'postgresql':
                    return await this.adapter.query(`EXPLAIN ANALYZE ${sql}`);
                case 'mysql':
                    return await this.adapter.query(`EXPLAIN FORMAT=JSON ${sql}`);
                case 'sqlite':
                    return await this.adapter.query(`EXPLAIN QUERY PLAN ${sql}`);
                default:
                    return { plan: 'Execution plans not supported for this adapter' };
            }
        }
        catch (error) {
            this._logger.warn(`Failed to get execution plan: ${error}`);
            return { plan: 'Execution plan unavailable' };
        }
    }
    async getDatabaseVersion() {
        try {
            const schema = await this.adapter.getSchema();
            return schema.version;
        }
        catch (error) {
            this._logger.warn(`Failed to get database version: ${error}`);
            return 'Unknown';
        }
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
        return uptimeSeconds > 0 ? this.performanceMetrics.operationCount / uptimeSeconds : 0;
    }
    async executeGraphQuery(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing graph query: ${request.cypher.substring(0, 100)}...`);
            if (!request.cypher) {
                throw new Error('Cypher query is required');
            }
            if (!this.isGraphAdapter()) {
                throw new Error('Graph operations not supported by current database adapter');
            }
            const graphAdapter = this.adapter;
            const result = await graphAdapter.queryGraph(request.cypher, request.params);
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            this._logger.debug(`Graph query completed successfully in ${executionTime}ms, returned ${result?.nodes.length} nodes and ${result?.relationships.length} relationships`);
            return {
                success: true,
                data: {
                    query: request.cypher,
                    parameters: request.params,
                    nodes: result?.nodes,
                    relationships: result?.relationships,
                    nodeCount: result?.nodes.length,
                    relationshipCount: result?.relationships.length,
                },
                metadata: {
                    rowCount: result?.nodes.length + result?.relationships.length,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Graph query execution failed: ${error}`);
            return {
                success: false,
                error: `Graph query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async getGraphSchema() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting graph schema information');
            if (!this.isGraphAdapter()) {
                throw new Error('Graph schema not available for current database adapter');
            }
            const schema = await this.adapter.getSchema();
            const graphAdapter = this.adapter;
            const [nodeCount, relationshipCount] = await Promise.all([
                graphAdapter.getNodeCount(),
                graphAdapter.getRelationshipCount(),
            ]);
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            const graphSchema = {
                schema,
                graphStatistics: {
                    totalNodes: nodeCount,
                    totalRelationships: relationshipCount,
                    nodeTypes: this.extractNodeTypes(schema),
                    relationshipTypes: this.extractRelationshipTypes(schema),
                    averageConnections: relationshipCount > 0 ? (relationshipCount * 2) / nodeCount : 0,
                },
                adapter: this._config.type,
                version: schema.version,
            };
            this._logger.debug(`Graph schema retrieved successfully in ${executionTime}ms`);
            return {
                success: true,
                data: graphSchema,
                metadata: {
                    rowCount: nodeCount + relationshipCount,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get graph schema: ${error}`);
            return {
                success: false,
                error: `Failed to get graph schema: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async getGraphAnalytics() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting graph analytics');
            if (!this.isGraphAdapter()) {
                throw new Error('Graph analytics not available for current database adapter');
            }
            const graphAdapter = this.adapter;
            const [nodeCount, relationshipCount, connectionStats, isHealthy] = await Promise.all([
                graphAdapter.getNodeCount(),
                graphAdapter.getRelationshipCount(),
                this.adapter.getConnectionStats(),
                this.adapter.health(),
            ]);
            const analytics = {
                adapter: this._config.type,
                health: {
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    uptime: Math.floor((Date.now() - this.performanceMetrics.startTime) / 1000),
                    lastOperation: this.performanceMetrics.lastOperationTime,
                },
                graphStatistics: {
                    totalNodes: nodeCount,
                    totalRelationships: relationshipCount,
                    averageConnections: nodeCount > 0 ? (relationshipCount * 2) / nodeCount : 0,
                    graphDensity: nodeCount > 1 ? relationshipCount / ((nodeCount * (nodeCount - 1)) / 2) : 0,
                    connectivity: {
                        nodesWithConnections: nodeCount > 0 ? Math.min(relationshipCount, nodeCount) : 0,
                        isolatedNodes: Math.max(0, nodeCount - relationshipCount),
                        connectionRatio: nodeCount > 0 ? relationshipCount / nodeCount : 0,
                    },
                },
                performance: {
                    totalOperations: this.performanceMetrics.operationCount,
                    averageResponseTime: this.performanceMetrics.operationCount > 0
                        ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.operationCount
                        : 0,
                    successRate: this.performanceMetrics.operationCount > 0
                        ? ((this.performanceMetrics.operationCount - this.performanceMetrics.errorCount) /
                            this.performanceMetrics.operationCount) *
                            100
                        : 100,
                    errorRate: this.performanceMetrics.operationCount > 0
                        ? (this.performanceMetrics.errorCount / this.performanceMetrics.operationCount) * 100
                        : 0,
                    operationsPerSecond: this.calculateOperationsPerSecond(),
                },
                connections: connectionStats,
                configuration: {
                    type: this._config.type,
                    database: this._config.database,
                    options: this._config.options,
                },
            };
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: analytics,
                metadata: {
                    rowCount: nodeCount + relationshipCount,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Failed to get graph analytics: ${error}`);
            return {
                success: false,
                error: `Failed to get graph analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    async executeGraphBatch(request) {
        const startTime = Date.now();
        try {
            this._logger.debug(`Executing graph batch operations: ${request.operations.length} operations`);
            if (!this.isGraphAdapter()) {
                throw new Error('Graph batch operations not supported by current database adapter');
            }
            if (!request.operations || request.operations.length === 0) {
                throw new Error('At least one graph operation is required');
            }
            const graphAdapter = this.adapter;
            const results = [];
            let errorCount = 0;
            let totalNodes = 0;
            let totalRelationships = 0;
            for (const operation of request.operations) {
                try {
                    const result = await graphAdapter.queryGraph(operation.cypher, operation.params);
                    results.push({
                        cypher: operation.cypher,
                        params: operation.params,
                        success: true,
                        nodeCount: result?.nodes.length,
                        relationshipCount: result?.relationships.length,
                        data: request.includeData
                            ? { nodes: result?.nodes, relationships: result?.relationships }
                            : undefined,
                        error: undefined,
                    });
                    totalNodes += result?.nodes.length;
                    totalRelationships += result?.relationships.length;
                }
                catch (error) {
                    errorCount++;
                    results.push({
                        cypher: operation.cypher,
                        params: operation.params,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        nodeCount: undefined,
                        relationshipCount: undefined,
                        data: undefined,
                    });
                    if (!request.continueOnError) {
                        break;
                    }
                }
            }
            const connectionStats = await this.adapter.getConnectionStats();
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, errorCount === 0);
            this._logger.debug(`Graph batch operations completed in ${executionTime}ms: ${results.length - errorCount}/${results.length} successful`);
            return {
                success: errorCount === 0,
                data: {
                    results,
                    summary: {
                        totalOperations: request.operations.length,
                        successfulOperations: results.length - errorCount,
                        failedOperations: errorCount,
                        totalNodesProcessed: totalNodes,
                        totalRelationshipsProcessed: totalRelationships,
                    },
                },
                metadata: {
                    rowCount: totalNodes + totalRelationships,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                    connectionStats,
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error(`Graph batch operations failed: ${error}`);
            return {
                success: false,
                error: `Graph batch operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: this._config.type,
                },
            };
        }
    }
    isGraphAdapter() {
        return this._config.type === 'kuzu';
    }
    isCypherQuery(sql) {
        const trimmedSql = sql.trim().toLowerCase();
        return (trimmedSql.startsWith('match') ||
            trimmedSql.startsWith('create') ||
            trimmedSql.startsWith('merge') ||
            trimmedSql.startsWith('unwind') ||
            trimmedSql.startsWith('call') ||
            trimmedSql.startsWith('return') ||
            trimmedSql.includes(' return ') ||
            trimmedSql.includes(' match ') ||
            trimmedSql.includes(' create ') ||
            trimmedSql.includes(' merge '));
    }
    async routeToGraphQuery(request) {
        const graphResponse = await this.executeGraphQuery(request);
        if (graphResponse?.success && graphResponse?.data) {
            return {
                ...graphResponse,
                data: {
                    query: request.cypher,
                    parameters: request.params,
                    results: [
                        ...graphResponse?.data?.nodes?.map((node) => ({ type: 'node', ...node })),
                        ...graphResponse?.data?.relationships?.map((rel) => ({ type: 'relationship', ...rel })),
                    ],
                    fields: [
                        { name: 'type', type: 'string', nullable: false },
                        { name: 'id', type: 'string', nullable: false },
                        { name: 'data', type: 'object', nullable: true },
                    ],
                    nodeCount: graphResponse?.data?.nodeCount,
                    relationshipCount: graphResponse?.data?.relationshipCount,
                },
            };
        }
        return graphResponse;
    }
    extractNodeTypes(_schema) {
        return ['Person', 'Organization', 'Location', 'Event'];
    }
    extractRelationshipTypes(_schema) {
        return ['KNOWS', 'WORKS_FOR', 'LOCATED_IN', 'PARTICIPATED_IN'];
    }
    async vectorSearch(request) {
        const startTime = Date.now();
        try {
            this._logger.debug('Executing vector similarity search', {
                vectorDim: request.vector.length,
                limit: request.limit,
            });
            if (!this.isVectorAdapter(this.adapter)) {
                throw new Error('Current database adapter does not support vector operations');
            }
            const vectorAdapter = this.adapter;
            const result = await vectorAdapter.vectorSearch(request.vector, request.limit || 10);
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: {
                    matches: result?.matches,
                    executionTime: result?.executionTime,
                    query: {
                        vectorDim: request.vector.length,
                        limit: request.limit || 10,
                        metric: request.metric || 'cosine',
                    },
                },
                metadata: {
                    rowCount: result?.matches.length,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error('Vector search failed:', error);
            return {
                success: false,
                error: `Vector search operation failed: ${error.message}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
    }
    async addVectors(request) {
        const startTime = Date.now();
        try {
            this._logger.debug('Adding vectors to database', {
                count: request.vectors.length,
            });
            if (!this.isVectorAdapter(this.adapter)) {
                throw new Error('Current database adapter does not support vector operations');
            }
            const vectorAdapter = this.adapter;
            const vectorData = request.vectors.map((v) => ({
                id: v.id,
                vector: v.vector,
                metadata: v.metadata || undefined,
            }));
            await vectorAdapter.addVectors(vectorData);
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: {
                    inserted: request.vectors.length,
                    table: request.table || 'embeddings',
                },
                metadata: {
                    rowCount: request.vectors.length,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error('Vector insertion failed:', error);
            return {
                success: false,
                error: `Vector insertion operation failed: ${error.message}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
    }
    async getVectorStats() {
        const startTime = Date.now();
        try {
            this._logger.debug('Getting vector database statistics');
            if (!this.isVectorAdapter(this.adapter)) {
                throw new Error('Current database adapter does not support vector operations');
            }
            let schema;
            let connectionStats;
            if ('getSchema' in this.adapter) {
                schema = await this.adapter.getSchema();
            }
            else {
                schema = { tables: [], views: [], version: '1.0' };
            }
            if ('getConnectionStats' in this.adapter) {
                connectionStats = await this.adapter.getConnectionStats();
            }
            else {
                connectionStats = { total: 1, active: 1, idle: 0 };
            }
            const vectorTables = schema.tables.filter((table) => table.columns.some((col) => col.type.includes('VECTOR')));
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: {
                    vectorTables: vectorTables.length,
                    tables: vectorTables.map((table) => ({
                        name: table.name,
                        vectorColumns: table.columns.filter((col) => col.type.includes('VECTOR')),
                        indexes: table.indexes,
                    })),
                    connectionStats,
                    capabilities: {
                        vectorSearch: true,
                        similarityMetrics: ['cosine', 'euclidean', 'dot'],
                        indexTypes: ['IVF_PQ', 'HNSW', 'FLAT'],
                    },
                },
                metadata: {
                    rowCount: vectorTables.length,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error('Vector stats retrieval failed:', error);
            return {
                success: false,
                error: `Vector statistics retrieval failed: ${error.message}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
    }
    async createVectorIndex(request) {
        const startTime = Date.now();
        try {
            this._logger.debug('Creating vector index', {
                name: request.name,
                dimension: request.dimension,
            });
            if (!this.isVectorAdapter(this.adapter)) {
                throw new Error('Current database adapter does not support vector operations');
            }
            const vectorAdapter = this.adapter;
            const indexConfig = {
                name: request.name,
                dimension: request.dimension,
                metric: request.metric,
                type: request.type || undefined,
            };
            await vectorAdapter.createIndex(indexConfig);
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, true);
            return {
                success: true,
                data: {
                    indexName: request.name,
                    dimension: request.dimension,
                    metric: request.metric,
                    type: request.type || 'auto',
                },
                metadata: {
                    rowCount: 1,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateMetrics(executionTime, false);
            this._logger.error('Vector index creation failed:', error);
            return {
                success: false,
                error: `Vector index creation failed: ${error.message}`,
                metadata: {
                    rowCount: 0,
                    executionTime,
                    timestamp: Date.now(),
                    adapter: 'lancedb',
                },
            };
        }
    }
    isVectorAdapter(adapter) {
        return 'vectorSearch' in adapter && 'addVectors' in adapter && 'createIndex' in adapter;
    }
};
DatabaseController = __decorate([
    injectable,
    __param(0, inject(DATABASE_TOKENS.ProviderFactory)),
    __param(1, inject(DATABASE_TOKENS.Config)),
    __param(2, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Function, Object, Object])
], DatabaseController);
export { DatabaseController };
//# sourceMappingURL=database-controller.js.map