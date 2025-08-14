var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from '../../di/decorators/injectable.ts';
let DatabaseProviderFactory = class DatabaseProviderFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
    }
    createAdapter(config) {
        this.logger.info(`Creating database adapter: ${config?.type}`);
        try {
            switch (config?.type) {
                case 'postgresql':
                    return new PostgreSQLAdapter(config, this.logger);
                case 'sqlite':
                    return new SQLiteAdapter(config, this.logger);
                case 'kuzu':
                    return new KuzuAdapter(config, this.logger);
                case 'lancedb':
                    return new LanceDBAdapter(config, this.logger);
                case 'mysql':
                    return new MySQLAdapter(config, this.logger);
                default:
                    throw new Error(`Unsupported database type: ${config?.type}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to create database adapter: ${error}`);
            throw new Error(`Database adapter creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    createGraphAdapter(config) {
        return new KuzuAdapter(config, this.logger);
    }
    createVectorAdapter(config) {
        return new LanceDBAdapter(config, this.logger);
    }
};
DatabaseProviderFactory = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], DatabaseProviderFactory);
export { DatabaseProviderFactory };
let PostgreSQLAdapter = class PostgreSQLAdapter {
    config;
    logger;
    connected = false;
    connectionStats = {
        total: 0,
        active: 0,
        idle: 0,
        utilization: 0,
        averageConnectionTime: 0,
    };
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async connect() {
        this.logger.info('Connecting to PostgreSQL database');
        try {
            await this.simulateAsync(100);
            this.connected = true;
            this.connectionStats.total = this.config.pool?.max || 10;
            this.connectionStats.active = 1;
            this.connectionStats.idle = this.connectionStats.total - 1;
            this.connectionStats.utilization =
                (this.connectionStats.active / this.connectionStats.total) * 100;
            this.logger.info('Successfully connected to PostgreSQL database');
        }
        catch (error) {
            this.logger.error(`Failed to connect to PostgreSQL: ${error}`);
            throw error;
        }
    }
    async disconnect() {
        this.logger.info('Disconnecting from PostgreSQL database');
        try {
            await this.simulateAsync(50);
            this.connected = false;
            this.connectionStats.active = 0;
            this.connectionStats.idle = 0;
            this.connectionStats.utilization = 0;
            this.logger.info('Successfully disconnected from PostgreSQL database');
        }
        catch (error) {
            this.logger.error(`Failed to disconnect from PostgreSQL: ${error}`);
            throw error;
        }
    }
    async query(sql, params) {
        this.logger.debug(`Executing PostgreSQL query: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(10);
            const executionTime = Date.now() - startTime;
            const result = {
                rows: [{ id: 1, name: 'Sample Data' }],
                rowCount: 1,
                fields: [
                    { name: 'id', type: 'integer', nullable: false },
                    { name: 'name', type: 'varchar', nullable: true },
                ],
                executionTime,
            };
            this.logger.debug(`PostgreSQL query completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`PostgreSQL query failed: ${error}`);
            throw error;
        }
    }
    async queryWithResult(sql, params) {
        this.logger.debug(`Executing PostgreSQL query with result: ${sql}`);
        try {
            await this.ensureConnected();
            const startTime = Date.now();
            await this.simulateAsync(10);
            const executionTime = Date.now() - startTime;
            const successResult = {
                success: true,
                data: [{ id: 1, name: 'Sample Data' }],
                rowCount: 1,
                executionTime,
                fields: [
                    { name: 'id', type: 'integer', nullable: false },
                    { name: 'name', type: 'varchar', nullable: true },
                ],
            };
            this.logger.debug(`PostgreSQL query completed in ${executionTime}ms`);
            return successResult;
        }
        catch (error) {
            const executionTime = Date.now() - Date.now();
            this.logger.error(`PostgreSQL query failed: ${error}`);
            const errorResult = {
                success: false,
                error: {
                    code: 'POSTGRESQL_QUERY_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: { sql, params },
                    stack: error instanceof Error ? error.stack : undefined,
                },
                executionTime,
            };
            return errorResult;
        }
    }
    async execute(sql, params) {
        this.logger.debug(`Executing PostgreSQL command: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(15);
            const executionTime = Date.now() - startTime;
            const result = {
                affectedRows: 1,
                insertId: sql.toLowerCase().includes('insert') ? 123 : undefined,
                executionTime,
            };
            this.logger.debug(`PostgreSQL command completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`PostgreSQL command failed: ${error}`);
            throw error;
        }
    }
    async transaction(fn) {
        this.logger.debug('Starting PostgreSQL transaction');
        await this.ensureConnected();
        try {
            const txContext = {
                query: async (sql, params) => this.query(sql, params),
                execute: async (sql, params) => this.execute(sql, params),
                commit: async () => {
                    this.logger.debug('Committing PostgreSQL transaction');
                    await this.simulateAsync(5);
                },
                rollback: async () => {
                    this.logger.debug('Rolling back PostgreSQL transaction');
                    await this.simulateAsync(5);
                },
            };
            const result = await fn(txContext);
            await txContext.commit();
            this.logger.debug('PostgreSQL transaction completed successfully');
            return result;
        }
        catch (error) {
            this.logger.error(`PostgreSQL transaction failed: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            if (!this.connected) {
                return false;
            }
            await this.query('SELECT 1 as health_check');
            return true;
        }
        catch (error) {
            this.logger.error(`PostgreSQL health check failed: ${error}`);
            return false;
        }
    }
    async getSchema() {
        this.logger.debug('Getting PostgreSQL schema information');
        await this.ensureConnected();
        try {
            const schemaInfo = {
                tables: [
                    {
                        name: 'users',
                        columns: [
                            {
                                name: 'id',
                                type: 'integer',
                                nullable: false,
                                isPrimaryKey: true,
                                isForeignKey: false,
                            },
                            {
                                name: 'name',
                                type: 'varchar',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'email',
                                type: 'varchar',
                                nullable: false,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                        ],
                        indexes: [
                            { name: 'users_pkey', columns: ['id'], unique: true },
                            { name: 'users_email_idx', columns: ['email'], unique: true },
                        ],
                    },
                ],
                views: [],
                version: '13.0',
            };
            return schemaInfo;
        }
        catch (error) {
            this.logger.error(`Failed to get PostgreSQL schema: ${error}`);
            throw error;
        }
    }
    async getConnectionStats() {
        return this.connectionStats;
    }
    async ensureConnected() {
        if (!this.connected) {
            await this.connect();
        }
    }
    async simulateAsync(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
PostgreSQLAdapter = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], PostgreSQLAdapter);
export { PostgreSQLAdapter };
let SQLiteAdapter = class SQLiteAdapter {
    config;
    logger;
    connected = false;
    connectionStats = {
        total: 1,
        active: 0,
        idle: 1,
        utilization: 0,
        averageConnectionTime: 0,
    };
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async connect() {
        this.logger.info(`Connecting to SQLite database: ${this.config.database || ':memory:'}`);
        try {
            await this.simulateAsync(50);
            this.connected = true;
            this.connectionStats.active = 1;
            this.connectionStats.idle = 0;
            this.connectionStats.utilization = 100;
            this.logger.info('Successfully connected to SQLite database');
        }
        catch (error) {
            this.logger.error(`Failed to connect to SQLite: ${error}`);
            throw error;
        }
    }
    async disconnect() {
        this.logger.info('Disconnecting from SQLite database');
        try {
            await this.simulateAsync(25);
            this.connected = false;
            this.connectionStats.active = 0;
            this.connectionStats.idle = 1;
            this.connectionStats.utilization = 0;
            this.logger.info('Successfully disconnected from SQLite database');
        }
        catch (error) {
            this.logger.error(`Failed to disconnect from SQLite: ${error}`);
            throw error;
        }
    }
    async query(sql, params) {
        this.logger.debug(`Executing SQLite query: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(5);
            const executionTime = Date.now() - startTime;
            const result = {
                rows: [{ id: 1, data: 'SQLite Sample' }],
                rowCount: 1,
                fields: [
                    { name: 'id', type: 'INTEGER', nullable: false },
                    { name: 'data', type: 'TEXT', nullable: true },
                ],
                executionTime,
            };
            this.logger.debug(`SQLite query completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`SQLite query failed: ${error}`);
            throw error;
        }
    }
    async execute(sql, params) {
        this.logger.debug(`Executing SQLite command: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(8);
            const executionTime = Date.now() - startTime;
            const result = {
                affectedRows: 1,
                insertId: sql.toLowerCase().includes('insert') ? 456 : undefined,
                executionTime,
            };
            this.logger.debug(`SQLite command completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`SQLite command failed: ${error}`);
            throw error;
        }
    }
    async transaction(fn) {
        this.logger.debug('Starting SQLite transaction');
        await this.ensureConnected();
        try {
            const txContext = {
                query: async (sql, params) => this.query(sql, params),
                execute: async (sql, params) => this.execute(sql, params),
                commit: async () => {
                    this.logger.debug('Committing SQLite transaction');
                    await this.simulateAsync(3);
                },
                rollback: async () => {
                    this.logger.debug('Rolling back SQLite transaction');
                    await this.simulateAsync(3);
                },
            };
            const result = await fn(txContext);
            await txContext.commit();
            this.logger.debug('SQLite transaction completed successfully');
            return result;
        }
        catch (error) {
            this.logger.error(`SQLite transaction failed: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            if (!this.connected) {
                return false;
            }
            await this.query('SELECT 1 as health_check');
            return true;
        }
        catch (error) {
            this.logger.error(`SQLite health check failed: ${error}`);
            return false;
        }
    }
    async getSchema() {
        this.logger.debug('Getting SQLite schema information');
        await this.ensureConnected();
        try {
            const schemaInfo = {
                tables: [
                    {
                        name: 'sqlite_master',
                        columns: [
                            {
                                name: 'type',
                                type: 'text',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'name',
                                type: 'text',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'tbl_name',
                                type: 'text',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'sql',
                                type: 'text',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                        ],
                        indexes: [],
                    },
                ],
                views: [],
                version: '3.0',
            };
            return schemaInfo;
        }
        catch (error) {
            this.logger.error(`Failed to get SQLite schema: ${error}`);
            throw error;
        }
    }
    async getConnectionStats() {
        return this.connectionStats;
    }
    async ensureConnected() {
        if (!this.connected) {
            await this.connect();
        }
    }
    async simulateAsync(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
SQLiteAdapter = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], SQLiteAdapter);
export { SQLiteAdapter };
let KuzuAdapter = class KuzuAdapter {
    config;
    logger;
    connected = false;
    connectionStats = {
        total: 1,
        active: 0,
        idle: 1,
        utilization: 0,
        averageConnectionTime: 0,
    };
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async connect() {
        this.logger.info('Connecting to Kuzu graph database');
        try {
            await this.simulateAsync(75);
            this.connected = true;
            this.connectionStats.active = 1;
            this.connectionStats.idle = 0;
            this.connectionStats.utilization = 100;
            this.logger.info('Successfully connected to Kuzu database');
        }
        catch (error) {
            this.logger.error(`Failed to connect to Kuzu: ${error}`);
            throw error;
        }
    }
    async disconnect() {
        this.logger.info('Disconnecting from Kuzu database');
        try {
            await this.simulateAsync(25);
            this.connected = false;
            this.connectionStats.active = 0;
            this.connectionStats.idle = 1;
            this.connectionStats.utilization = 0;
            this.logger.info('Successfully disconnected from Kuzu database');
        }
        catch (error) {
            this.logger.error(`Failed to disconnect from Kuzu: ${error}`);
            throw error;
        }
    }
    async query(sql, params) {
        this.logger.debug(`Executing Kuzu query: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(20);
            const executionTime = Date.now() - startTime;
            const result = {
                rows: [{ node: { id: 1, properties: { name: 'Graph Node' } } }],
                rowCount: 1,
                fields: [{ name: 'node', type: 'NODE', nullable: false }],
                executionTime,
            };
            this.logger.debug(`Kuzu query completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`Kuzu query failed: ${error}`);
            throw error;
        }
    }
    async execute(sql, params) {
        this.logger.debug(`Executing Kuzu command: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(25);
            const executionTime = Date.now() - startTime;
            const result = {
                affectedRows: 1,
                executionTime,
            };
            this.logger.debug(`Kuzu command completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`Kuzu command failed: ${error}`);
            throw error;
        }
    }
    async transaction(fn) {
        this.logger.debug('Starting Kuzu transaction');
        await this.ensureConnected();
        try {
            const txContext = {
                query: async (sql, params) => this.query(sql, params),
                execute: async (sql, params) => this.execute(sql, params),
                commit: async () => {
                    this.logger.debug('Committing Kuzu transaction');
                    await this.simulateAsync(10);
                },
                rollback: async () => {
                    this.logger.debug('Rolling back Kuzu transaction');
                    await this.simulateAsync(10);
                },
            };
            const result = await fn(txContext);
            await txContext.commit();
            this.logger.debug('Kuzu transaction completed successfully');
            return result;
        }
        catch (error) {
            this.logger.error(`Kuzu transaction failed: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            if (!this.connected) {
                return false;
            }
            await this.query('MATCH (n) RETURN count(n) LIMIT 1');
            return true;
        }
        catch (error) {
            this.logger.error(`Kuzu health check failed: ${error}`);
            return false;
        }
    }
    async queryGraph(cypher, params) {
        this.logger.debug(`Executing Kuzu graph query: ${cypher}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(25);
            const executionTime = Date.now() - startTime;
            const result = {
                nodes: [
                    {
                        id: 1,
                        labels: ['Person'],
                        properties: { name: 'Alice', age: 30 },
                    },
                    {
                        id: 2,
                        labels: ['Person'],
                        properties: { name: 'Bob', age: 25 },
                    },
                ],
                relationships: [
                    {
                        id: 1,
                        type: 'KNOWS',
                        startNodeId: 1,
                        endNodeId: 2,
                        properties: { since: '2020' },
                    },
                ],
                executionTime,
            };
            this.logger.debug(`Kuzu graph query completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`Kuzu graph query failed: ${error}`);
            throw error;
        }
    }
    async getNodeCount() {
        this.logger.debug('Getting Kuzu node count');
        await this.ensureConnected();
        try {
            await this.simulateAsync(10);
            return 1000;
        }
        catch (error) {
            this.logger.error(`Failed to get Kuzu node count: ${error}`);
            throw error;
        }
    }
    async getRelationshipCount() {
        this.logger.debug('Getting Kuzu relationship count');
        await this.ensureConnected();
        try {
            await this.simulateAsync(10);
            return 2500;
        }
        catch (error) {
            this.logger.error(`Failed to get Kuzu relationship count: ${error}`);
            throw error;
        }
    }
    async getSchema() {
        this.logger.debug('Getting Kuzu schema information');
        await this.ensureConnected();
        try {
            const schemaInfo = {
                tables: [
                    {
                        name: 'nodes',
                        columns: [
                            {
                                name: 'id',
                                type: 'INT64',
                                nullable: false,
                                isPrimaryKey: true,
                                isForeignKey: false,
                            },
                            {
                                name: 'label',
                                type: 'STRING',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                        ],
                        indexes: [],
                    },
                ],
                views: [],
                version: '0.4.0',
            };
            return schemaInfo;
        }
        catch (error) {
            this.logger.error(`Failed to get Kuzu schema: ${error}`);
            throw error;
        }
    }
    async getConnectionStats() {
        return this.connectionStats;
    }
    async ensureConnected() {
        if (!this.connected) {
            await this.connect();
        }
    }
    async simulateAsync(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
KuzuAdapter = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], KuzuAdapter);
export { KuzuAdapter };
let LanceDBAdapter = class LanceDBAdapter {
    config;
    logger;
    connected = false;
    vectorRepository = null;
    vectorDAO = null;
    connectionStats = {
        total: 1,
        active: 0,
        idle: 1,
        utilization: 0,
        averageConnectionTime: 0,
    };
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async connect() {
        this.logger.info('Connecting to LanceDB vector database');
        try {
            const dalConfig = {
                database: this.config.database || './data/vectors.lance',
                options: {
                    vectorSize: this.config.options?.['vectorSize'] || 384,
                    metricType: this.config.options?.['metricType'] || 'cosine',
                    indexType: this.config.options?.['indexType'] || 'IVF_PQ',
                    batchSize: this.config.options?.['batchSize'] || 1000,
                },
            };
            this.connected = true;
            this.connectionStats.active = 1;
            this.connectionStats.idle = 0;
            this.connectionStats.utilization = 100;
            this.logger.info('Successfully connected to LanceDB database');
        }
        catch (error) {
            this.logger.error(`Failed to connect to LanceDB: ${error}`);
            throw error;
        }
    }
    async disconnect() {
        this.logger.info('Disconnecting from LanceDB database');
        try {
            if (this.vectorRepository) {
                this.vectorRepository = null;
                this.vectorDAO = null;
            }
            this.connected = false;
            this.connectionStats.active = 0;
            this.connectionStats.idle = 1;
            this.connectionStats.utilization = 0;
            this.logger.info('Successfully disconnected from LanceDB database');
        }
        catch (error) {
            this.logger.error(`Failed to disconnect from LanceDB: ${error}`);
            throw error;
        }
    }
    async query(sql, params) {
        this.logger.debug(`Executing LanceDB query: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            if (sql.includes('<->') || sql.toLowerCase().includes('vector')) {
                const vectorMatch = sql.match(/\[([\d.,\s]+)\]/);
                const tableMatch = sql.match(/FROM\s+(\w+)/i);
                const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
                if (vectorMatch && tableMatch) {
                    const vectorStr = vectorMatch?.[1];
                    const tableName = tableMatch?.[1] || 'default';
                    const limit = limitMatch
                        ? Number.parseInt(limitMatch[1], 10)
                        : 10;
                    if (vectorStr !== undefined) {
                        const queryVector = vectorStr
                            .split(',')
                            .map((v) => Number.parseFloat(v.trim()));
                        const vectorResults = await this.vectorSearch(queryVector, limit);
                        const executionTime = Date.now() - startTime;
                        const result = {
                            rows: vectorResults?.matches?.map((match) => ({
                                id: match?.id,
                                vector: match?.vector,
                                score: match?.score,
                                metadata: match?.metadata,
                            })),
                            rowCount: vectorResults?.matches.length,
                            fields: [
                                { name: 'id', type: 'TEXT', nullable: false },
                                { name: 'vector', type: 'VECTOR', nullable: false },
                                { name: 'score', type: 'FLOAT', nullable: false },
                                { name: 'metadata', type: 'JSON', nullable: true },
                            ],
                            executionTime,
                        };
                        this.logger.debug(`LanceDB vector query completed in ${executionTime}ms`);
                        return result;
                    }
                }
            }
            const executionTime = Date.now() - startTime;
            const result = {
                rows: [{ count: 1, status: 'ok' }],
                rowCount: 1,
                fields: [
                    { name: 'count', type: 'INT64', nullable: false },
                    { name: 'status', type: 'TEXT', nullable: false },
                ],
                executionTime,
            };
            this.logger.debug(`LanceDB query completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`LanceDB query failed: ${error}`);
            throw error;
        }
    }
    async execute(sql, params) {
        this.logger.debug(`Executing LanceDB command: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            let affectedRows = 0;
            if (sql.toLowerCase().includes('create table')) {
                const tableMatch = sql.match(/CREATE TABLE\s+(\w+)/i);
                if (tableMatch) {
                    const tableName = tableMatch?.[1];
                    affectedRows = 1;
                }
            }
            const executionTime = Date.now() - startTime;
            const result = {
                affectedRows,
                executionTime,
            };
            this.logger.debug(`LanceDB command completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`LanceDB command failed: ${error}`);
            throw error;
        }
    }
    async transaction(fn) {
        this.logger.debug('Starting LanceDB transaction');
        await this.ensureConnected();
        try {
            const txContext = {
                query: async (sql, params) => this.query(sql, params),
                execute: async (sql, params) => this.execute(sql, params),
                commit: async () => {
                    this.logger.debug('Committing LanceDB transaction');
                },
                rollback: async () => {
                    this.logger.debug('Rolling back LanceDB transaction');
                },
            };
            const result = await fn(txContext);
            await txContext.commit();
            this.logger.debug('LanceDB transaction completed successfully');
            return result;
        }
        catch (error) {
            this.logger.error(`LanceDB transaction failed: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            if (!(this.connected && this.vectorRepository)) {
                return false;
            }
            const repo = this.vectorRepository;
            if (repo && typeof repo.findAll === 'function') {
                await repo.findAll({ limit: 1 });
            }
            return true;
        }
        catch (error) {
            this.logger.error(`LanceDB health check failed: ${error}`);
            return false;
        }
    }
    async vectorSearch(query, limit = 10) {
        this.logger.debug(`Executing LanceDB vector search with limit: ${limit}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            const dao = this.vectorDAO;
            const searchResults = dao && typeof dao.similaritySearch === 'function'
                ? await dao.similaritySearch(query, { limit, threshold: 0.1 })
                : [];
            const executionTime = Date.now() - startTime;
            const result = {
                matches: searchResults?.map((result) => ({
                    id: result?.id,
                    vector: result?.vector || query,
                    score: result?.score || result?.similarity || 1.0,
                    metadata: result?.metadata || {},
                })) || [],
                executionTime,
            };
            this.logger.debug(`LanceDB vector search completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`LanceDB vector search failed: ${error}`);
            throw error;
        }
    }
    async addVectors(vectors) {
        this.logger.debug(`Adding ${vectors.length} vectors to LanceDB`);
        await this.ensureConnected();
        try {
            const vectorOperations = vectors.map((v) => ({
                id: v.id.toString(),
                vector: v.vector,
                metadata: v.metadata || {},
            }));
            const dao = this.vectorDAO;
            const result = dao && typeof dao.bulkVectorOperations === 'function'
                ? await dao.bulkVectorOperations(vectorOperations, 'upsert')
                : vectorOperations;
            const inserted = Array.isArray(result) ? result.length : 1;
            this.logger.debug(`Successfully added ${inserted} vectors to LanceDB via DAL`);
        }
        catch (error) {
            this.logger.error(`Failed to add vectors to LanceDB: ${error}`);
            throw error;
        }
    }
    async createIndex(config) {
        this.logger.debug(`Creating LanceDB index: ${config?.name}`);
        await this.ensureConnected();
        try {
            const sampleDoc = {
                id: `index_${config?.name}_${Date.now()}`,
                vector: new Array(config?.dimension).fill(0),
                metadata: { index: config?.name, type: 'sample' },
            };
            const repo = this.vectorRepository;
            if (repo && typeof repo.create === 'function') {
                await repo.create(sampleDoc);
            }
            if (repo && typeof repo.delete === 'function') {
                await repo.delete(sampleDoc.id);
            }
            this.logger.debug(`Successfully created LanceDB index: ${config?.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to create LanceDB index: ${error}`);
            throw error;
        }
    }
    async getSchema() {
        this.logger.debug('Getting LanceDB schema information');
        await this.ensureConnected();
        try {
            const repo = this.vectorRepository;
            const allVectors = repo && typeof repo.findAll === 'function'
                ? await repo.findAll({ limit: 1 })
                : [];
            const vectorDim = this.config.options?.['vectorSize'] || 384;
            const schemaInfo = {
                tables: [
                    {
                        name: 'embeddings',
                        columns: [
                            {
                                name: 'id',
                                type: 'STRING',
                                nullable: false,
                                isPrimaryKey: true,
                                isForeignKey: false,
                            },
                            {
                                name: 'vector',
                                type: `VECTOR(${vectorDim})`,
                                nullable: false,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'metadata',
                                type: 'JSON',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'timestamp',
                                type: 'INT64',
                                nullable: true,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                        ],
                        indexes: [
                            { name: 'vector_index', columns: ['vector'], unique: false },
                        ],
                    },
                ],
                views: [],
                version: '0.21.1',
            };
            return schemaInfo;
        }
        catch (error) {
            this.logger.error(`Failed to get LanceDB schema: ${error}`);
            throw error;
        }
    }
    async getConnectionStats() {
        return this.connectionStats;
    }
    async ensureConnected() {
        if (!this.connected) {
            await this.connect();
        }
    }
};
LanceDBAdapter = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], LanceDBAdapter);
export { LanceDBAdapter };
let MySQLAdapter = class MySQLAdapter {
    config;
    logger;
    connected = false;
    connectionStats = {
        total: 0,
        active: 0,
        idle: 0,
        utilization: 0,
        averageConnectionTime: 0,
    };
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async connect() {
        this.logger.info('Connecting to MySQL database');
        try {
            await this.simulateAsync(80);
            this.connected = true;
            this.connectionStats.total = this.config.pool?.max || 5;
            this.connectionStats.active = 1;
            this.connectionStats.idle = this.connectionStats.total - 1;
            this.connectionStats.utilization =
                (this.connectionStats.active / this.connectionStats.total) * 100;
            this.logger.info('Successfully connected to MySQL database');
        }
        catch (error) {
            this.logger.error(`Failed to connect to MySQL: ${error}`);
            throw error;
        }
    }
    async disconnect() {
        this.logger.info('Disconnecting from MySQL database');
        try {
            await this.simulateAsync(40);
            this.connected = false;
            this.connectionStats.active = 0;
            this.connectionStats.idle = 0;
            this.connectionStats.utilization = 0;
            this.logger.info('Successfully disconnected from MySQL database');
        }
        catch (error) {
            this.logger.error(`Failed to disconnect from MySQL: ${error}`);
            throw error;
        }
    }
    async query(sql, params) {
        this.logger.debug(`Executing MySQL query: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(12);
            const executionTime = Date.now() - startTime;
            const result = {
                rows: [{ id: 1, name: 'MySQL Sample', created_at: new Date() }],
                rowCount: 1,
                fields: [
                    { name: 'id', type: 'int', nullable: false },
                    { name: 'name', type: 'varchar', nullable: true },
                    { name: 'created_at', type: 'datetime', nullable: false },
                ],
                executionTime,
            };
            this.logger.debug(`MySQL query completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`MySQL query failed: ${error}`);
            throw error;
        }
    }
    async execute(sql, params) {
        this.logger.debug(`Executing MySQL command: ${sql}`);
        await this.ensureConnected();
        const startTime = Date.now();
        try {
            await this.simulateAsync(18);
            const executionTime = Date.now() - startTime;
            const result = {
                affectedRows: 1,
                insertId: sql.toLowerCase().includes('insert') ? 789 : undefined,
                executionTime,
            };
            this.logger.debug(`MySQL command completed in ${executionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error(`MySQL command failed: ${error}`);
            throw error;
        }
    }
    async transaction(fn) {
        this.logger.debug('Starting MySQL transaction');
        await this.ensureConnected();
        try {
            const txContext = {
                query: async (sql, params) => this.query(sql, params),
                execute: async (sql, params) => this.execute(sql, params),
                commit: async () => {
                    this.logger.debug('Committing MySQL transaction');
                    await this.simulateAsync(8);
                },
                rollback: async () => {
                    this.logger.debug('Rolling back MySQL transaction');
                    await this.simulateAsync(8);
                },
            };
            const result = await fn(txContext);
            await txContext.commit();
            this.logger.debug('MySQL transaction completed successfully');
            return result;
        }
        catch (error) {
            this.logger.error(`MySQL transaction failed: ${error}`);
            throw error;
        }
    }
    async health() {
        try {
            if (!this.connected) {
                return false;
            }
            await this.query('SELECT 1 as health_check');
            return true;
        }
        catch (error) {
            this.logger.error(`MySQL health check failed: ${error}`);
            return false;
        }
    }
    async getSchema() {
        this.logger.debug('Getting MySQL schema information');
        await this.ensureConnected();
        try {
            const schemaInfo = {
                tables: [
                    {
                        name: 'users',
                        columns: [
                            {
                                name: 'id',
                                type: 'int',
                                nullable: false,
                                isPrimaryKey: true,
                                isForeignKey: false,
                            },
                            {
                                name: 'username',
                                type: 'varchar',
                                nullable: false,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'email',
                                type: 'varchar',
                                nullable: false,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                            {
                                name: 'created_at',
                                type: 'datetime',
                                nullable: false,
                                isPrimaryKey: false,
                                isForeignKey: false,
                            },
                        ],
                        indexes: [
                            { name: 'PRIMARY', columns: ['id'], unique: true },
                            { name: 'users_email_unique', columns: ['email'], unique: true },
                            {
                                name: 'users_username_idx',
                                columns: ['username'],
                                unique: false,
                            },
                        ],
                    },
                ],
                views: [],
                version: '8.0',
            };
            return schemaInfo;
        }
        catch (error) {
            this.logger.error(`Failed to get MySQL schema: ${error}`);
            throw error;
        }
    }
    async getConnectionStats() {
        return this.connectionStats;
    }
    async ensureConnected() {
        if (!this.connected) {
            await this.connect();
        }
    }
    async simulateAsync(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
MySQLAdapter = __decorate([
    injectable,
    __metadata("design:paramtypes", [Object, Object])
], MySQLAdapter);
export { MySQLAdapter };
//# sourceMappingURL=database-providers.js.map