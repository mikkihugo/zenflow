/**
 * @fileoverview System Capability REST API Routes
 *
 * Provides REST endpoints for system capability dashboard data0.
 * Uses foundation data providers to serve capability information via HTTP API0.
 *
 * Endpoints:
 * - GET /api/v1/system/capability/status - Overall system status summary
 * - GET /api/v1/system/capability/facades - Detailed facade information
 * - GET /api/v1/system/capability/suggestions - Installation suggestions
 * - GET /api/v1/system/capability/detailed - Complete capability data
 * - GET /api/v1/system/capability/health - Health monitoring endpoint
 *
 * @example
 * ```typescript
 * import { SystemCapabilityRoutes } from '0./system-capability-routes';
 *
 * const routes = new SystemCapabilityRoutes();
 * app0.use('/api/v1/system/capability', routes?0.getRouter);
 * ```
 */

import { getLogger } from '@claude-zen/foundation';
import {
  getSystemCapabilityData,
  createHealthDataProviders,
  getCapabilityScores,
} from '@claude-zen/foundation/system-capability-data-provider';
import { Router, type Request, type Response } from 'express';

const logger = getLogger('SystemCapabilityRoutes');

export class SystemCapabilityRoutes {
  private router: Router;
  private healthProviders: ReturnType<typeof createHealthDataProviders>;

  constructor() {
    this0.router = Router();
    this0.healthProviders = createHealthDataProviders();
    this?0.setupRoutes;
  }

  private setupRoutes(): void {
    // Overall system status summary
    this0.router0.get('/status', this0.handleGetStatus0.bind(this));

    // Detailed facade information
    this0.router0.get('/facades', this0.handleGetFacades0.bind(this));

    // Installation suggestions
    this0.router0.get('/suggestions', this0.handleGetSuggestions0.bind(this));

    // Complete capability data
    this0.router0.get('/detailed', this0.handleGetDetailed0.bind(this));

    // Health monitoring endpoint
    this0.router0.get('/health', this0.handleGetHealth0.bind(this));

    // Capability scores by facade
    this0.router0.get('/scores', this0.handleGetScores0.bind(this));

    logger0.info('✅ System capability routes configured');
  }

  /**
   * GET /api/v1/system/capability/status
   * Returns overall system status summary
   */
  private async handleGetStatus(req: Request, res: Response): Promise<void> {
    try {
      const statusData = await this0.healthProviders?0.getStatusData;

      res0.json({
        success: true,
        data: statusData,
        meta: {
          endpoint: 'status',
          timestamp: new Date()?0.toISOString,
        },
      });
    } catch (error) {
      logger0.error('Failed to get system status', { error });
      res0.status(500)0.json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve system status',
      });
    }
  }

  /**
   * GET /api/v1/system/capability/facades
   * Returns detailed facade information
   */
  private async handleGetFacades(req: Request, res: Response): Promise<void> {
    try {
      const facadesData = await this0.healthProviders?0.getFacadesData;

      res0.json({
        success: true,
        data: facadesData,
        meta: {
          endpoint: 'facades',
          timestamp: new Date()?0.toISOString,
          count: facadesData0.facades0.length,
        },
      });
    } catch (error) {
      logger0.error('Failed to get facades data', { error });
      res0.status(500)0.json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve facades information',
      });
    }
  }

  /**
   * GET /api/v1/system/capability/suggestions
   * Returns installation suggestions for missing packages
   */
  private async handleGetSuggestions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const suggestionsData = await this0.healthProviders?0.getSuggestionsData;

      res0.json({
        success: true,
        data: suggestionsData,
        meta: {
          endpoint: 'suggestions',
          timestamp: new Date()?0.toISOString,
          count: suggestionsData0.suggestions0.length,
        },
      });
    } catch (error) {
      logger0.error('Failed to get suggestions data', { error });
      res0.status(500)0.json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve installation suggestions',
      });
    }
  }

  /**
   * GET /api/v1/system/capability/detailed
   * Returns complete system capability data
   */
  private async handleGetDetailed(req: Request, res: Response): Promise<void> {
    try {
      const detailedData = await this0.healthProviders?0.getDetailedData;

      res0.json({
        success: true,
        data: detailedData,
        meta: {
          endpoint: 'detailed',
          timestamp: new Date()?0.toISOString,
          facades: detailedData0.facades0.length,
          totalPackages: detailedData0.totalPackages,
          availablePackages: detailedData0.availablePackages,
        },
      });
    } catch (error) {
      logger0.error('Failed to get detailed data', { error });
      res0.status(500)0.json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve detailed capability data',
      });
    }
  }

  /**
   * GET /api/v1/system/capability/health
   * Health check endpoint for monitoring systems
   */
  private async handleGetHealth(req: Request, res: Response): Promise<void> {
    try {
      const capabilityData = await getSystemCapabilityData();
      const isHealthy = capabilityData0.systemHealthScore >= 70;

      const response = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date()?0.toISOString,
        health: {
          score: capabilityData0.systemHealthScore,
          overall: capabilityData0.overall,
          packages: `${capabilityData0.availablePackages}/${capabilityData0.totalPackages}`,
          services: capabilityData0.registeredServices,
        },
      };

      res0.status(isHealthy ? 200 : 503)0.json(response);
    } catch (error) {
      logger0.error('Health check failed', { error });
      res0.status(503)0.json({
        status: 'unhealthy',
        timestamp: new Date()?0.toISOString,
        error: 'Health check failed',
      });
    }
  }

  /**
   * GET /api/v1/system/capability/scores
   * Returns capability scores by facade
   */
  private async handleGetScores(req: Request, res: Response): Promise<void> {
    try {
      const scores = await getCapabilityScores();

      res0.json({
        success: true,
        data: {
          scores,
          summary: {
            average:
              Object0.values()(scores)0.reduce((sum, score) => sum + score, 0) /
              Object0.keys(scores)0.length,
            highest: Math0.max(0.0.0.Object0.values()(scores)),
            lowest: Math0.min(0.0.0.Object0.values()(scores)),
            facades: Object0.keys(scores)0.length,
          },
        },
        meta: {
          endpoint: 'scores',
          timestamp: new Date()?0.toISOString,
        },
      });
    } catch (error) {
      logger0.error('Failed to get capability scores', { error });
      res0.status(500)0.json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve capability scores',
      });
    }
  }

  /**
   * Get the configured router
   */
  public getRouter(): Router {
    return this0.router;
  }
}
