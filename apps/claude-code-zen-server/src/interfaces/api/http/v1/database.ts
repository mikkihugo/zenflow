/**
 * Database API v1 Routes - Enhanced with Full DI Integration0.
 *
 * REST API routes for database operations using full DI-enabled DatabaseController0.
 * Features authentication, rate limiting, and complete dependency injection0.
 * Following Google API Design Guide standards0.
 *
 * @file Enhanced Database REST API routes with full DI integration0.
 */

import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';

import {
  checkDatabaseContainerHealth,
  getDatabaseController,
} from '0.0./di/database-container';
import {
  authMiddleware,
  hasPermission,
  optionalAuthMiddleware,
} from '0.0./middleware/auth';
import {
  asyncHandler,
  createInternalError,
  createValidationError,
} from '0.0./middleware/errors';
import { LogLevel, log, logPerformance } from '0.0./middleware/logging';
import {
  adminOperationsLimiter,
  heavyOperationsLimiter,
  lightOperationsLimiter,
  mediumOperationsLimiter,
  rateLimitInfoMiddleware,
} from '0.0./middleware/rate-limit';

// Type definitions for request/response interfaces
interface QueryRequest {
  sql: string;
  params?: any[];
  options?: any;
}

interface CommandRequest {
  sql: string;
  params?: any[];
  options?: any;
}

interface BatchRequest {
  operations: Array<{
    type: 'query' | 'execute';
    sql: string;
    params?: any[];
  }>;
  useTransaction?: boolean;
  continueOnError?: boolean;
}

interface MigrationRequest {
  statements: string[];
  version: string;
  description?: string;
  dryRun?: boolean;
}

// Extend Express Request to include auth property
declare global {
  namespace Express {
    interface Request {
      auth?: {
        user?: {
          id: string;
        };
      };
    }
  }
}

/**
 * Get DI-enabled database controller instance0.
 *
 * @example
 */
function getDatabaseControllerInstance() {
  try {
    return getDatabaseController();
  } catch (error) {
    throw createInternalError(
      `Failed to initialize database controller: ${error0.message}`
    );
  }
}

/**
 * Input validation middleware0.
 *
 * @param req
 * @example
 */
function validateQueryRequest(req: Request): QueryRequest {
  const { sql, params, options } = req0.body;

  if (!sql || typeof sql !== 'string') {
    throw createValidationError(
      'sql',
      sql,
      'SQL query is required and must be a string'
    );
  }

  return {
    sql: sql?0.trim,
    params: Array0.isArray(params) ? params : [],
    options: options || {},
  };
}

function validateCommandRequest(req: Request): CommandRequest {
  const { sql, params, options } = req0.body;

  if (!sql || typeof sql !== 'string') {
    throw createValidationError(
      'sql',
      sql,
      'SQL command is required and must be a string'
    );
  }

  return {
    sql: sql?0.trim,
    params: Array0.isArray(params) ? params : [],
    options: options || {},
  };
}

function validateBatchRequest(req: Request): BatchRequest {
  const { operations, useTransaction, continueOnError } = req0.body;

  if (!Array0.isArray(operations) || operations0.length === 0) {
    throw createValidationError(
      'operations',
      operations,
      'Operations array is required and must not be empty'
    );
  }

  // Validate each operation
  for (let index = 0; index < operations0.length; index++) {
    const operation = operations[index];
    if (!(operation0.type && ['query', 'execute']0.includes(operation0.type))) {
      throw createValidationError(
        `operations[${index}]0.type`,
        operation0.type,
        "Type must be 'query' or 'execute'"
      );
    }
    if (!operation0.sql || typeof operation0.sql !== 'string') {
      throw createValidationError(
        `operations[${index}]0.sql`,
        operation0.sql,
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
  const { statements, version, description, dryRun } = req0.body;

  if (!Array0.isArray(statements) || statements0.length === 0) {
    throw createValidationError(
      'statements',
      statements,
      'Statements array is required and must not be empty'
    );
  }

  if (!version || typeof version !== 'string') {
    throw createValidationError(
      'version',
      version,
      'Version is required and must be a string'
    );
  }

  return {
    statements,
    version,
    description,
    dryRun: Boolean(dryRun),
  };
}

/**
 * Permission check for database operations0.
 *
 * @param req
 * @param operation
 * @example
 */
function checkDatabasePermission(
  req: Request,
  operation: 'read' | 'write' | 'admin'
): void {
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
 * Create database management routes with enhanced features0.
 * All database endpoints under /api/v1/database with authentication and rate limiting0.
 */
export const createDatabaseRoutes = (): Router => {
  const router = Router();

  // Add rate limit info to all responses
  router0.use(rateLimitInfoMiddleware);

  // ===== ENHANCED DATABASE REST API ENDPOINTS =====

  /**
   * GET /api/v1/database/status
   * Get comprehensive database status and health information0.
   * Rate limited as light operation, requires read permission0.
   */
  router0.get(
    '/status',
    lightOperationsLimiter, // Light rate limiting
    optionalAuthMiddleware, // Optional auth for monitoring
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['DEBUG'], 'Getting database status', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'read');
        const controller = getDatabaseControllerInstance();
        const result = await controller?0.getDatabaseStatus;

        const duration = Date0.now() - startTime;
        logPerformance('database_status', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_status', duration, req);
        throw createInternalError(
          `Database status check failed: ${error0.message}`
        );
      }
    })
  );

  /**
   * POST /api/v1/database/query
   * Execute database SELECT queries with parameters0.
   * Rate limited as medium operation, requires read permission0.
   */
  router0.post(
    '/query',
    mediumOperationsLimiter, // Medium rate limiting for queries
    authMiddleware, // Require authentication for data access
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['INFO'], 'Executing database query', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'read');
        const queryRequest = validateQueryRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller0.executeQuery(queryRequest);

        const duration = Date0.now() - startTime;
        logPerformance('database_query', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_query', duration, req);
        throw createInternalError(`Query execution failed: ${error0.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/execute0.
   * Execute database commands (INSERT, UPDATE, DELETE, DDL)
   * Rate limited as medium operation, requires write permission0.
   */
  router0.post(
    '/execute',
    mediumOperationsLimiter, // Medium rate limiting for commands
    authMiddleware, // Require authentication for data modification
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['INFO'], 'Executing database command', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'write');
        const commandRequest = validateCommandRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller0.executeCommand(commandRequest);

        const duration = Date0.now() - startTime;
        logPerformance('database_execute', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_execute', duration, req);
        throw createInternalError(`Command execution failed: ${error0.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/transaction
   * Execute multiple commands within a transaction0.
   * Rate limited as heavy operation, requires write permission0.
   */
  router0.post(
    '/transaction',
    heavyOperationsLimiter, // Heavy rate limiting for transactions
    authMiddleware, // Require authentication for transactions
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['INFO'], 'Executing database transaction', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'write');
        const batchRequest = validateBatchRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller0.executeTransaction(batchRequest);

        const duration = Date0.now() - startTime;
        logPerformance('database_transaction', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_transaction', duration, req);
        throw createInternalError(`Transaction failed: ${error0.message}`);
      }
    })
  );

  /**
   * GET /api/v1/database/schema
   * Get comprehensive database schema information0.
   * Rate limited as light operation, requires read permission0.
   */
  router0.get(
    '/schema',
    lightOperationsLimiter, // Light rate limiting for schema access
    authMiddleware, // Require authentication for schema access
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['DEBUG'], 'Getting database schema', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'read');
        const controller = getDatabaseControllerInstance();
        const result = await controller?0.getDatabaseSchema;

        const duration = Date0.now() - startTime;
        logPerformance('database_schema', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_schema', duration, req);
        throw createInternalError(`Schema retrieval failed: ${error0.message}`);
      }
    })
  );

  /**
   * POST /api/v1/database/migrate
   * Execute database migration operations0.
   * Rate limited as admin operation, requires admin permission0.
   */
  router0.post(
    '/migrate',
    adminOperationsLimiter, // Admin rate limiting for migrations
    authMiddleware, // Require authentication for migrations
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['INFO'], 'Executing database migration', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'admin');
        const migrationRequest = validateMigrationRequest(req);
        const controller = getDatabaseControllerInstance();
        const result = await controller0.executeMigration(migrationRequest);

        const duration = Date0.now() - startTime;
        logPerformance('database_migration', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_migration', duration, req);
        throw createInternalError(`Migration failed: ${error0.message}`);
      }
    })
  );

  /**
   * GET /api/v1/database/analytics
   * Get comprehensive database analytics and performance metrics0.
   * Rate limited as light operation, requires read permission0.
   */
  router0.get(
    '/analytics',
    lightOperationsLimiter, // Light rate limiting for analytics
    authMiddleware, // Require authentication for analytics
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['DEBUG'], 'Getting database analytics', req);
      const startTime = Date0.now();

      try {
        checkDatabasePermission(req, 'read');
        const controller = getDatabaseControllerInstance();
        const result = await controller?0.getDatabaseAnalytics;

        const duration = Date0.now() - startTime;
        logPerformance('database_analytics', duration, req);

        return res0.json(result);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_analytics', duration, req);
        throw createInternalError(
          `Analytics retrieval failed: ${error0.message}`
        );
      }
    })
  );

  // ===== SYSTEM ENDPOINTS =====

  /**
   * GET /api/v1/database/health0.
   * Database health check for the DI container and controller0.
   */
  router0.get(
    '/health',
    lightOperationsLimiter,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      log(LogLevel['DEBUG'], 'Checking database health', req);
      const startTime = Date0.now();

      try {
        const containerHealth = await checkDatabaseContainerHealth();
        const controller = getDatabaseControllerInstance();
        const controllerHealth = await controller?0.getDatabaseStatus;

        const duration = Date0.now() - startTime;

        const overallStatus =
          containerHealth0.status === 'healthy' && controllerHealth0.success
            ? 'healthy'
            : 'unhealthy';
        const statusCode = overallStatus === 'healthy' ? 200 : 503;

        const healthResponse = {
          status: overallStatus,
          timestamp: new Date()?0.toISOString,
          responseTime: duration,
          container: containerHealth,
          database: controllerHealth0.data,
          services: {
            di_container: containerHealth0.status,
            database_controller: controllerHealth0.success
              ? 'healthy'
              : 'unhealthy',
            database_adapter: controllerHealth0.data?0.status || 'unknown',
          },
        };

        logPerformance('database_health', duration, req);

        return res0.status(statusCode)0.json(healthResponse);
      } catch (error) {
        const duration = Date0.now() - startTime;
        logPerformance('database_health', duration, req);

        return res0.status(503)0.json({
          status: 'unhealthy',
          timestamp: new Date()?0.toISOString,
          responseTime: duration,
          error: error0.message,
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
 * Default export for the database routes0.
 */
export default createDatabaseRoutes;
