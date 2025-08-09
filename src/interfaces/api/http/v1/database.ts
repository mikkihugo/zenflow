/**
 * Database API v1 Routes - Enhanced with Full DI Integration.
 *
 * REST API routes for database operations using full DI-enabled DatabaseController.
 * Features authentication, rate limiting, and complete dependency injection.
 * Following Google API Design Guide standards.
 *
 * @file Enhanced Database REST API routes with full DI integration
 */

import { type Request, type Response, Router } from 'express';
// Import interfaces from the simplified database controller
import type {
  BatchRequest,
  CommandRequest,
  MigrationRequest,
  QueryRequest,
} from '../di/database-container';
import { checkDatabaseContainerHealth, getDatabaseController } from '../di/database-container';
import { authMiddleware, hasPermission, optionalAuthMiddleware } from '../middleware/auth';
import { asyncHandler, createInternalError, createValidationError } from '../middleware/errors';
import { LogLevel, log, logPerformance } from '../middleware/logging';
import {
  adminOperationsLimiter,
  heavyOperationsLimiter,
  lightOperationsLimiter,
  mediumOperationsLimiter,
  rateLimitInfoMiddleware,
} from '../middleware/rate-limit';

/**
 * Get DI-enabled database controller instance.
 */
function getDatabaseControllerInstance() {
  try {
    return getDatabaseController();
  } catch (error) {
    throw createInternalError(`Failed to initialize database controller: ${error.message}`);
  }
}

/**
 * Input validation middleware.
 *
 * @param req
 */
function validateQueryRequest(req: Request): QueryRequest {
  const { sql, params, options } = req.body;

  if (!sql || typeof sql !== 'string') {
    throw createValidationError('sql', sql, 'SQL query is required and must be a string');
  }

  return {
    sql: sql.trim(),
    params: Array.isArray(params) ? params : [],
    options: options || {},
  };
}

function validateCommandRequest(req: Request): CommandRequest {
  const { sql, params, options } = req.body;

  if (!sql || typeof sql !== 'string') {
    throw createValidationError('sql', sql, 'SQL command is required and must be a string');
  }

  return {
    sql: sql.trim(),
    params: Array.isArray(params) ? params : [],
    options: options || {},
  };
}

function validateBatchRequest(req: Request): BatchRequest {
  const { operations, useTransaction, continueOnError } = req.body;

  if (!Array.isArray(operations) || operations.length === 0) {
    throw createValidationError(
      'operations',
      operations,
      'Operations array is required and must not be empty'
    );
  }

  // Validate each operation
  for (let index = 0; index < operations.length; index++) {
    const operation = operations[index];
    if (!operation.type || !['query', 'execute'].includes(operation.type)) {
      throw createValidationError(
        `operations[${index}].type`,
        operation.type,
        "Type must be 'query' or 'execute'"
      );
    }
    if (!operation.sql || typeof operation.sql !== 'string') {
      throw createValidationError(
        `operations[${index}].sql`,
        operation.sql,
        'SQL is required and must be a string'
      );
    }
  }

  return {
    operations,
    useTransaction: Boolean(useTransaction),
    continueOnError: Boolean(continueOnError),
  };
}

function validateMigrationRequest(req: Request): MigrationRequest {
  const { statements, version, description, dryRun } = req.body;

  if (!Array.isArray(statements) || statements.length === 0) {
    throw createValidationError(
      'statements',
      statements,
      'Statements array is required and must not be empty'
    );
  }

  if (!version || typeof version !== 'string') {
    throw createValidationError('version', version, 'Version is required and must be a string');
  }

  return {
    statements,
    version,
    description,
    dryRun: Boolean(dryRun),
  };
}

/**
 * Permission check for database operations.
 *
 * @param req
 * @param operation
 */
function checkDatabasePermission(req: Request, operation: 'read' | 'write' | 'admin'): void {
  const permissionMap = {
    read: 'database:read',
    write: 'database:write',
    admin: 'database:admin',
  };

  const requiredPermission = permissionMap[operation];
  if (!hasPermission(req, requiredPermission)) {
    throw createValidationError(
      'permission',
      operation,
      `Insufficient permissions for ${operation} operations`
    );
  }
}

/**
 * Create database management routes with enhanced features.
 * All database endpoints under /api/v1/database with authentication and rate limiting.
 */
export const createDatabaseRoutes = (): Router => {
  const router = Router();

  // Add rate limit info to all responses
  router.use(rateLimitInfoMiddleware);

  // ===== ENHANCED DATABASE REST API ENDPOINTS =====

  /**
   * GET /api/v1/database/status
   * Get comprehensive database status and health information.
   * Rate limited as light operation, requires read permission.
   */
  router.get(
    '/status',
    lightOperationsLimiter, // Light rate limiting
    optionalAuthMiddleware, // Optional auth for monitoring
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting database status', req);
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'read');
        const controller = getDatabaseControllerInstance();
        const result = await controller.getDatabaseStatus();

        const duration = Date.now() - startTime;
        logPerformance('database_status', duration, req, {
          success: result?.success,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_status', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Database status check failed: ${error.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/query
   * Execute database SELECT queries with parameters.
   * Rate limited as medium operation, requires read permission.
   */
  router.post(
    '/query',
    mediumOperationsLimiter, // Medium rate limiting for queries
    authMiddleware, // Require authentication for data access
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Executing database query', req, {
        sqlLength: req.body.sql?.length,
        hasParams: Array.isArray(req.body.params) && req.body.params.length > 0,
        userId: req.auth?.user?.id,
      });
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'read');
        const queryRequest = validateQueryRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller.executeQuery(queryRequest);

        const duration = Date.now() - startTime;
        logPerformance('database_query', duration, req, {
          success: result?.success,
          rowCount: result?.metadata?.rowCount,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_query', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Query execution failed: ${error.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/execute.
   * Execute database commands (INSERT, UPDATE, DELETE, DDL)
   * Rate limited as medium operation, requires write permission.
   */
  router.post(
    '/execute',
    mediumOperationsLimiter, // Medium rate limiting for commands
    authMiddleware, // Require authentication for data modification
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Executing database command', req, {
        sqlLength: req.body.sql?.length,
        hasParams: Array.isArray(req.body.params) && req.body.params.length > 0,
        userId: req.auth?.user?.id,
      });
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'write');
        const commandRequest = validateCommandRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller.executeCommand(commandRequest);

        const duration = Date.now() - startTime;
        logPerformance('database_execute', duration, req, {
          success: result?.success,
          rowCount: result?.metadata?.rowCount,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_execute', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Command execution failed: ${error.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/transaction
   * Execute multiple commands within a transaction.
   * Rate limited as heavy operation, requires write permission.
   */
  router.post(
    '/transaction',
    heavyOperationsLimiter, // Heavy rate limiting for transactions
    authMiddleware, // Require authentication for transactions
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Executing database transaction', req, {
        operationCount: req.body.operations?.length,
        useTransaction: req.body.useTransaction,
        userId: req.auth?.user?.id,
      });
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'write');
        const batchRequest = validateBatchRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller.executeTransaction(batchRequest);

        const duration = Date.now() - startTime;
        logPerformance('database_transaction', duration, req, {
          success: result?.success,
          operationCount: batchRequest.operations.length,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_transaction', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Transaction failed: ${error.message}`);
      }
    })
  );

  /**
   * GET /api/v1/database/schema
   * Get comprehensive database schema information.
   * Rate limited as light operation, requires read permission.
   */
  router.get(
    '/schema',
    lightOperationsLimiter, // Light rate limiting for schema access
    authMiddleware, // Require authentication for schema access
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting database schema', req, {
        userId: req.auth?.user?.id,
      });
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'read');
        const controller = getDatabaseControllerInstance();
        const result = await controller.getDatabaseSchema();

        const duration = Date.now() - startTime;
        logPerformance('database_schema', duration, req, {
          success: result?.success,
          tableCount: result?.metadata?.rowCount,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_schema', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Schema retrieval failed: ${error.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/migrate
   * Execute database migration operations.
   * Rate limited as admin operation, requires admin permission.
   */
  router.post(
    '/migrate',
    adminOperationsLimiter, // Admin rate limiting for migrations
    authMiddleware, // Require authentication for migrations
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.INFO, 'Executing database migration', req, {
        version: req.body.version,
        statementCount: req.body.statements?.length,
        dryRun: req.body.dryRun,
        userId: req.auth?.user?.id,
      });
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'admin');
        const migrationRequest = validateMigrationRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller.executeMigration(migrationRequest);

        const duration = Date.now() - startTime;
        logPerformance('database_migration', duration, req, {
          success: result?.success,
          version: migrationRequest.version,
          statementCount: migrationRequest.statements.length,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_migration', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Migration failed: ${error.message}`);
      }
    })
  );

  /**
   * GET /api/v1/database/analytics
   * Get comprehensive database analytics and performance metrics.
   * Rate limited as light operation, requires read permission.
   */
  router.get(
    '/analytics',
    lightOperationsLimiter, // Light rate limiting for analytics
    authMiddleware, // Require authentication for analytics
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Getting database analytics', req, {
        userId: req.auth?.user?.id,
      });
      const startTime = Date.now();

      try {
        checkDatabasePermission(req, 'read');
        const controller = getDatabaseControllerInstance();
        const result = await controller.getDatabaseAnalytics();

        const duration = Date.now() - startTime;
        logPerformance('database_analytics', duration, req, {
          success: result?.success,
          adapter: result?.metadata?.adapter,
          userId: req.auth?.user?.id,
        });

        res.json(result);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_analytics', duration, req, {
          success: false,
          error: error.message,
          userId: req.auth?.user?.id,
        });
        throw createInternalError(`Analytics retrieval failed: ${error.message}`);
      }
    })
  );

  // ===== SYSTEM ENDPOINTS =====

  /**
   * GET /api/v1/database/health.
   * Database health check for the DI container and controller.
   */
  router.get(
    '/health',
    lightOperationsLimiter,
    asyncHandler(async (req: Request, res: Response) => {
      log(LogLevel.DEBUG, 'Checking database health', req);
      const startTime = Date.now();

      try {
        const containerHealth = await checkDatabaseContainerHealth();
        const controller = getDatabaseControllerInstance();
        const controllerHealth = await controller.getDatabaseStatus();

        const duration = Date.now() - startTime;

        const overallStatus =
          containerHealth.status === 'healthy' && controllerHealth.success
            ? 'healthy'
            : 'unhealthy';
        const statusCode = overallStatus === 'healthy' ? 200 : 503;

        const healthResponse = {
          status: overallStatus,
          timestamp: new Date().toISOString(),
          responseTime: duration,
          container: containerHealth,
          database: controllerHealth.data,
          services: {
            di_container: containerHealth.status,
            database_controller: controllerHealth.success ? 'healthy' : 'unhealthy',
            database_adapter: controllerHealth.data?.status || 'unknown',
          },
        };

        logPerformance('database_health', duration, req, {
          status: overallStatus,
          containerHealthy: containerHealth.status === 'healthy',
          controllerHealthy: controllerHealth.success,
        });

        res.status(statusCode).json(healthResponse);
      } catch (error) {
        const duration = Date.now() - startTime;
        logPerformance('database_health', duration, req, {
          success: false,
          error: error.message,
        });

        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          responseTime: duration,
          error: error.message,
          services: {
            di_container: 'unknown',
            database_controller: 'unknown',
            database_adapter: 'unknown',
          },
        });
      }
    })
  );

  return router;
};

/**
 * Default export for the database routes.
 */
export default createDatabaseRoutes;
