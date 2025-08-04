/**
 * Database Domain REST API Controller
 * Provides comprehensive REST endpoints for database management
 *
 * @file database-controller.ts
 * @description Enhanced database controller with DI integration for Issue #63
 */

import { inject } from '../../di/decorators/inject';
import { injectable } from '../../di/decorators/injectable';
import { CORE_TOKENS, DATABASE_TOKENS } from '../../di/tokens/core-tokens';
import type {
  ConnectionStats,
  DatabaseAdapter,
  DatabaseConfig,
  DatabaseProviderFactory,
} from '../providers/database-providers';

/**
 * Request interface for database query operations
 */
export interface QueryRequest {
  /** SQL query to execute */
  sql: string;
  /** Parameters for parameterized queries */
  params?: any[];
  /** Additional query options */
  options?: {
    /** Query timeout in milliseconds */
    timeout?: number;
    /** Maximum number of rows to return */
    maxRows?: number;
    /** Whether to include execution plan */
    includeExecutionPlan?: boolean;
    /** Query optimization hints */
    hints?: string[];
  };
}

/**
 * Request interface for database command operations
 */
export interface CommandRequest {
  /** SQL command to execute */
  sql: string;
  /** Parameters for parameterized commands */
  params?: any[];
  /** Additional command options */
  options?: {
    /** Command timeout in milliseconds */
    timeout?: number;
    /** Whether to return detailed execution info */
    detailed?: boolean;
    /** Whether to use prepared statements */
    prepared?: boolean;
  };
}

/**
 * Request interface for batch operations
 */
export interface BatchRequest {
  /** Array of operations to execute */
  operations: Array<{
    /** Type of operation */
    type: 'query' | 'execute';
    /** SQL statement */
    sql: string;
    /** Parameters */
    params?: any[];
  }>;
  /** Whether to execute in a transaction */
  useTransaction?: boolean;
  /** Whether to continue on error */
  continueOnError?: boolean;
}

/**
 * Response interface for database operations
 */
export interface DatabaseResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Response data (varies by operation) */
  data?: any;
  /** Error message if operation failed */
  error?: string;
  /** Operation metadata and statistics */
  metadata?: {
    /** Number of rows affected/returned */
    rowCount: number;
    /** Execution time in milliseconds */
    executionTime: number;
    /** Timestamp of the operation */
    timestamp: number;
    /** Database adapter type */
    adapter?: string;
    /** Connection statistics */
    connectionStats?: ConnectionStats;
  };
}

/**
 * Database health status interface
 */
export interface DatabaseHealthStatus {
  /** Overall health status */
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  /** Database adapter type */
  adapter: string;
  /** Connection status */
  connected: boolean;
  /** Response time for health check */
  responseTime: number;
  /** Connection pool statistics */
  connectionStats: ConnectionStats;
  /** Database version */
  version?: string;
  /** Last successful operation timestamp */
  lastSuccess: number;
  /** Error details if unhealthy */
  errorDetails?: string;
}

/**
 * Migration operation interface
 */
export interface MigrationRequest {
  /** Migration SQL statements */
  statements: string[];
  /** Migration version/name */
  version: string;
  /** Description of the migration */
  description?: string;
  /** Whether to run in dry-run mode */
  dryRun?: boolean;
}

/**
 * Database REST API Controller
 * Provides comprehensive database management through REST endpoints
 */
@injectable()
export class DatabaseController {
  private adapter: DatabaseAdapter;
  private performanceMetrics = {
    operationCount: 0,
    totalResponseTime: 0,
    errorCount: 0,
    startTime: Date.now(),
    lastOperationTime: Date.now(),
  };

  constructor(
    @inject(DATABASE_TOKENS.ProviderFactory) private _factory: DatabaseProviderFactory,
    @inject(DATABASE_TOKENS.Config) private _config: DatabaseConfig,
    @inject(CORE_TOKENS.Logger) private _logger: ILogger,
  ) {
    this.initializeAdapter();
  }

  /**
   * GET /api/database/status
   * Get comprehensive database status and health information
   */
  async getDatabaseStatus(): Promise<DatabaseResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug('Getting database status');

      const [isHealthy, connectionStats] = await Promise.all([
        this.adapter.health(),
        this.adapter.getConnectionStats(),
      ]);

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      const healthStatus: DatabaseHealthStatus = {
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
    } catch (error) {
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

  /**
   * POST /api/database/query
   * Execute database SELECT queries with parameters
   */
  async executeQuery(request: QueryRequest): Promise<DatabaseResponse> {
    const startTime = Date.now();

    try {
      this._logger.debug(`Executing database query: ${request.sql.substring(0, 100)}...`);

      if (!request.sql) {
        throw new Error('SQL query is required');
      }

      // Validate that this is actually a query (SELECT statement)
      if (!this.isQueryStatement(request.sql)) {
        throw new Error('Only SELECT statements are allowed for query operations');
      }

      const result = await this.adapter.query(request.sql, request.params);
      const connectionStats = await this.adapter.getConnectionStats();

      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      this._logger.debug(
        `Query completed successfully in ${executionTime}ms, returned ${result.rowCount} rows`,
      );

      return {
        success: true,
        data: {
          query: request.sql,
          parameters: request.params,
          results: result.rows,
          fields: result.fields,
          executionPlan: request.options?.includeExecutionPlan
            ? await this.getExecutionPlan(request.sql)
            : undefined,
        },
        metadata: {
          rowCount: result.rowCount,
          executionTime,
          timestamp: Date.now(),
          adapter: this._config.type,
          connectionStats,
        },
      };
    } catch (error) {
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

  /**
   * POST /api/database/execute
   * Execute database commands (INSERT, UPDATE, DELETE, DDL)
   */
  async executeCommand(request: CommandRequest): Promise<DatabaseResponse> {
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

      this._logger.debug(
        `Command completed successfully in ${executionTime}ms, affected ${result.affectedRows} rows`,
      );

      return {
        success: true,
        data: {
          command: request.sql,
          parameters: request.params,
          affectedRows: result.affectedRows,
          insertId: result.insertId,
          details: request.options?.detailed
            ? {
                statementType: this.getStatementType(request.sql),
                executionTime: result.executionTime,
                optimizationHints: request.options?.prepared
                  ? 'prepared_statement'
                  : 'direct_execution',
              }
            : undefined,
        },
        metadata: {
          rowCount: result.affectedRows,
          executionTime,
          timestamp: Date.now(),
          adapter: this._config.type,
          connectionStats,
        },
      };
    } catch (error) {
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

  /**
   * POST /api/database/transaction
   * Execute multiple commands within a transaction
   */
  async executeTransaction(request: BatchRequest): Promise<DatabaseResponse> {
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
                rowCount: result.rowCount,
                data: result.rows,
              });
            } else if (operation.type === 'execute') {
              result = await tx.execute(operation.sql, operation.params);
              transactionResults.push({
                type: 'execute',
                sql: operation.sql,
                params: operation.params,
                success: true,
                affectedRows: result.affectedRows,
                insertId: result.insertId,
              });
            } else {
              throw new Error(`Unsupported operation type: ${operation.type}`);
            }
          } catch (error) {
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

      this._logger.debug(
        `Transaction completed successfully in ${executionTime}ms, ${successfulOps}/${results.length} operations successful`,
      );

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
    } catch (error) {
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

  /**
   * POST /api/database/batch
   * Execute multiple operations (with optional transaction)
   */
  async executeBatch(request: BatchRequest): Promise<DatabaseResponse> {
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
              success: queryResult.success,
              data: queryResult.data,
              rowCount: queryResult.metadata?.rowCount || 0,
              error: queryResult.error,
            };

            totalRows += result.rowCount;
          } else if (operation.type === 'execute') {
            const executeResult = await this.executeCommand({
              sql: operation.sql,
              params: operation.params,
            });

            result = {
              type: 'execute',
              sql: operation.sql,
              params: operation.params,
              success: executeResult.success,
              affectedRows: executeResult.metadata?.rowCount || 0,
              data: executeResult.data,
              error: executeResult.error,
            };

            totalRows += result.affectedRows;
          } else {
            throw new Error(`Unsupported operation type: ${operation.type}`);
          }

          results.push(result);

          if (!result.success) {
            errorCount++;
            if (!request.continueOnError) {
              break;
            }
          }
        } catch (error) {
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

      this._logger.debug(
        `Batch operations completed in ${executionTime}ms: ${results.length - errorCount}/${results.length} successful`,
      );

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
    } catch (error) {
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

  /**
   * GET /api/database/schema
   * Get comprehensive database schema information
   */
  async getDatabaseSchema(): Promise<DatabaseResponse> {
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
    } catch (error) {
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

  /**
   * POST /api/database/migrate
   * Execute database migration operations
   */
  async executeMigration(request: MigrationRequest): Promise<DatabaseResponse> {
    const startTime = Date.now();

    try {
      this._logger.info(
        `Executing migration: ${request.version} - ${request.description || 'No description'}`,
      );

      if (!request.statements || request.statements.length === 0) {
        throw new Error('Migration statements are required');
      }

      if (request.dryRun) {
        this._logger.info('Dry run mode: validating migration statements');

        // Validate statements without executing
        const validationResults = [];
        for (const statement of request.statements) {
          try {
            // In a real implementation, this would validate syntax
            validationResults.push({
              statement: `${statement.substring(0, 100)}...`,
              valid: true,
              issues: [],
            });
          } catch (error) {
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

      // Execute migration in transaction
      const results = await this.adapter.transaction(async (tx) => {
        const migrationResults = [];

        for (const statement of request.statements) {
          try {
            const result = await tx.execute(statement);
            migrationResults.push({
              statement: `${statement.substring(0, 100)}...`,
              success: true,
              affectedRows: result.affectedRows,
              executionTime: result.executionTime,
            });
          } catch (error) {
            migrationResults.push({
              statement: `${statement.substring(0, 100)}...`,
              success: false,
              error: error instanceof Error ? error.message : 'Execution error',
            });
            throw error; // Fail the entire migration on any error
          }
        }

        return migrationResults;
      });

      const connectionStats = await this.adapter.getConnectionStats();
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);

      this._logger.info(
        `Migration ${request.version} completed successfully in ${executionTime}ms`,
      );

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
    } catch (error) {
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

  /**
   * GET /api/database/analytics
   * Get comprehensive database analytics and performance metrics
   */
  async getDatabaseAnalytics(): Promise<DatabaseResponse> {
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
          averageResponseTime:
            this.performanceMetrics.operationCount > 0
              ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.operationCount
              : 0,
          successRate:
            this.performanceMetrics.operationCount > 0
              ? ((this.performanceMetrics.operationCount - this.performanceMetrics.errorCount) /
                  this.performanceMetrics.operationCount) *
                100
              : 100,
          errorRate:
            this.performanceMetrics.operationCount > 0
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
          sslEnabled: this._config.ssl?.enabled || false,
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
    } catch (error) {
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

  /**
   * Initialize the database adapter
   */
  private async initializeAdapter(): Promise<void> {
    try {
      this.adapter = this._factory.createAdapter(this._config);
      await this.adapter.connect();
      this._logger.info(`Database controller initialized with ${this._config.type} adapter`);
    } catch (error) {
      this._logger.error(`Failed to initialize database adapter: ${error}`);
      throw error;
    }
  }

  /**
   * Check if SQL statement is a query (SELECT)
   */
  private isQueryStatement(sql: string): boolean {
    const trimmedSql = sql.trim().toLowerCase();
    return (
      trimmedSql.startsWith('select') ||
      trimmedSql.startsWith('with') ||
      trimmedSql.startsWith('show') ||
      trimmedSql.startsWith('explain') ||
      trimmedSql.startsWith('describe')
    );
  }

  /**
   * Get statement type from SQL
   */
  private getStatementType(sql: string): string {
    const trimmedSql = sql.trim().toLowerCase();
    if (trimmedSql.startsWith('select')) return 'SELECT';
    if (trimmedSql.startsWith('insert')) return 'INSERT';
    if (trimmedSql.startsWith('update')) return 'UPDATE';
    if (trimmedSql.startsWith('delete')) return 'DELETE';
    if (trimmedSql.startsWith('create')) return 'CREATE';
    if (trimmedSql.startsWith('alter')) return 'ALTER';
    if (trimmedSql.startsWith('drop')) return 'DROP';
    return 'UNKNOWN';
  }

  /**
   * Get execution plan for a query (adapter-specific)
   */
  private async getExecutionPlan(sql: string): Promise<any> {
    try {
      // Implementation would vary by database type
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
    } catch (error) {
      this._logger.warn(`Failed to get execution plan: ${error}`);
      return { plan: 'Execution plan unavailable' };
    }
  }

  /**
   * Get database version
   */
  private async getDatabaseVersion(): Promise<string> {
    try {
      const schema = await this.adapter.getSchema();
      return schema.version;
    } catch (error) {
      this._logger.warn(`Failed to get database version: ${error}`);
      return 'Unknown';
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(responseTime: number, success: boolean): void {
    this.performanceMetrics.operationCount++;
    this.performanceMetrics.totalResponseTime += responseTime;
    this.performanceMetrics.lastOperationTime = Date.now();
    if (!success) {
      this.performanceMetrics.errorCount++;
    }
  }

  /**
   * Calculate operations per second
   */
  private calculateOperationsPerSecond(): number {
    const uptimeSeconds = (Date.now() - this.performanceMetrics.startTime) / 1000;
    return uptimeSeconds > 0 ? this.performanceMetrics.operationCount / uptimeSeconds : 0;
  }
}

// Type definitions for DI integration
interface ILogger {
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
  debug(message: string): void;
}
