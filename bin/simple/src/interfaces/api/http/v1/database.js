import { Router, } from 'express';
import { checkDatabaseContainerHealth, getDatabaseController, } from '../di/database-container.ts';
import { authMiddleware, hasPermission, optionalAuthMiddleware, } from '../middleware/auth.ts';
import { asyncHandler, createInternalError, createValidationError, } from '../middleware/errors.ts';
import { LogLevel, log, logPerformance } from '../middleware/logging.ts';
import { adminOperationsLimiter, heavyOperationsLimiter, lightOperationsLimiter, mediumOperationsLimiter, rateLimitInfoMiddleware, } from '../middleware/rate-limit.ts';
function getDatabaseControllerInstance() {
    try {
        return getDatabaseController();
    }
    catch (error) {
        throw createInternalError(`Failed to initialize database controller: ${error.message}`);
    }
}
function validateQueryRequest(req) {
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
function validateCommandRequest(req) {
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
function validateBatchRequest(req) {
    const { operations, useTransaction, continueOnError } = req.body;
    if (!Array.isArray(operations) || operations.length === 0) {
        throw createValidationError('operations', operations, 'Operations array is required and must not be empty');
    }
    for (let index = 0; index < operations.length; index++) {
        const operation = operations[index];
        if (!(operation.type && ['query', 'execute'].includes(operation.type))) {
            throw createValidationError(`operations[${index}].type`, operation.type, "Type must be 'query' or 'execute'");
        }
        if (!operation.sql || typeof operation.sql !== 'string') {
            throw createValidationError(`operations[${index}].sql`, operation.sql, 'SQL is required and must be a string');
        }
    }
    return {
        operations,
        useTransaction: Boolean(useTransaction),
        continueOnError: Boolean(continueOnError),
    };
}
function validateMigrationRequest(req) {
    const { statements, version, description, dryRun } = req.body;
    if (!Array.isArray(statements) || statements.length === 0) {
        throw createValidationError('statements', statements, 'Statements array is required and must not be empty');
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
function checkDatabasePermission(req, operation) {
    const permissionMap = {
        read: 'database:read',
        write: 'database:write',
        admin: 'database:admin',
    };
    const requiredPermission = permissionMap[operation];
    if (!hasPermission(req, requiredPermission)) {
        throw createValidationError('permission', operation, `Insufficient permissions for ${operation} operations`);
    }
}
export const createDatabaseRoutes = () => {
    const router = Router();
    router.use(rateLimitInfoMiddleware);
    router.get('/status', lightOperationsLimiter, optionalAuthMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['DEBUG'], 'Getting database status', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'read');
            const controller = getDatabaseControllerInstance();
            const result = await controller.getDatabaseStatus();
            const duration = Date.now() - startTime;
            logPerformance('database_status', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_status', duration, req);
            throw createInternalError(`Database status check failed: ${error.message}`);
        }
    }));
    router.post('/query', mediumOperationsLimiter, authMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['INFO'], 'Executing database query', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'read');
            const queryRequest = validateQueryRequest(req);
            const controller = getDatabaseControllerInstance();
            const result = await controller.executeQuery(queryRequest);
            const duration = Date.now() - startTime;
            logPerformance('database_query', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_query', duration, req);
            throw createInternalError(`Query execution failed: ${error.message}`);
        }
    }));
    router.post('/execute', mediumOperationsLimiter, authMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['INFO'], 'Executing database command', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'write');
            const commandRequest = validateCommandRequest(req);
            const controller = getDatabaseControllerInstance();
            const result = await controller.executeCommand(commandRequest);
            const duration = Date.now() - startTime;
            logPerformance('database_execute', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_execute', duration, req);
            throw createInternalError(`Command execution failed: ${error.message}`);
        }
    }));
    router.post('/transaction', heavyOperationsLimiter, authMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['INFO'], 'Executing database transaction', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'write');
            const batchRequest = validateBatchRequest(req);
            const controller = getDatabaseControllerInstance();
            const result = await controller.executeTransaction(batchRequest);
            const duration = Date.now() - startTime;
            logPerformance('database_transaction', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_transaction', duration, req);
            throw createInternalError(`Transaction failed: ${error.message}`);
        }
    }));
    router.get('/schema', lightOperationsLimiter, authMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['DEBUG'], 'Getting database schema', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'read');
            const controller = getDatabaseControllerInstance();
            const result = await controller.getDatabaseSchema();
            const duration = Date.now() - startTime;
            logPerformance('database_schema', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_schema', duration, req);
            throw createInternalError(`Schema retrieval failed: ${error.message}`);
        }
    }));
    router.post('/migrate', adminOperationsLimiter, authMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['INFO'], 'Executing database migration', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'admin');
            const migrationRequest = validateMigrationRequest(req);
            const controller = getDatabaseControllerInstance();
            const result = await controller.executeMigration(migrationRequest);
            const duration = Date.now() - startTime;
            logPerformance('database_migration', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_migration', duration, req);
            throw createInternalError(`Migration failed: ${error.message}`);
        }
    }));
    router.get('/analytics', lightOperationsLimiter, authMiddleware, asyncHandler(async (req, res, next) => {
        log(LogLevel['DEBUG'], 'Getting database analytics', req);
        const startTime = Date.now();
        try {
            checkDatabasePermission(req, 'read');
            const controller = getDatabaseControllerInstance();
            const result = await controller.getDatabaseAnalytics();
            const duration = Date.now() - startTime;
            logPerformance('database_analytics', duration, req);
            return res.json(result);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_analytics', duration, req);
            throw createInternalError(`Analytics retrieval failed: ${error.message}`);
        }
    }));
    router.get('/health', lightOperationsLimiter, asyncHandler(async (req, res, next) => {
        log(LogLevel['DEBUG'], 'Checking database health', req);
        const startTime = Date.now();
        try {
            const containerHealth = await checkDatabaseContainerHealth();
            const controller = getDatabaseControllerInstance();
            const controllerHealth = await controller.getDatabaseStatus();
            const duration = Date.now() - startTime;
            const overallStatus = containerHealth.status === 'healthy' && controllerHealth.success
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
                    database_controller: controllerHealth.success
                        ? 'healthy'
                        : 'unhealthy',
                    database_adapter: controllerHealth.data?.status || 'unknown',
                },
            };
            logPerformance('database_health', duration, req);
            return res.status(statusCode).json(healthResponse);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logPerformance('database_health', duration, req);
            return res.status(503).json({
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
    }));
    return router;
};
export default createDatabaseRoutes;
//# sourceMappingURL=database.js.map