/**
 * Database API v1 Routes - Enhanced with Full DI Integration.
 *
 * REST API routes for database operations using full DI-enabled DatabaseController.
 * Features authentication, rate limiting, and complete dependency injection.
 * Following Google API Design Guide standards.
 *
 * @file Enhanced Database REST API routes with full DI integration.
 */
import { Router } from 'express';
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
 * Create database management routes with enhanced features.
 * All database endpoints under /api/v1/database with authentication and rate limiting.
 */
export declare const createDatabaseRoutes: () => Router;
/**
 * Default export for the database routes.
 */
export default createDatabaseRoutes;
//# sourceMappingURL=database.d.ts.map