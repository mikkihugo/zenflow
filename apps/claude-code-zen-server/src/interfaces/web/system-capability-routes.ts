/**
 * @fileoverview System Capability REST API Routes
 *
 * Provides REST endpoints for system capability dashboard data.
 * Uses foundation data providers to serve capability information via HTTP API.
 *
 * Endpoints:
 * - GET /api/v1/system/capability/status - Overall system status summary
 * - GET /api/v1/system/capability/facades - Detailed facade information
 * - GET /api/v1/system/capability/suggestions - Installation suggestions
 * - GET /api/v1/system/capability/detailed - Complete capability data
 * - GET /api/v1/system/capability/health - Health monitoring endpoint
 *
 * @example
 * ``'typescript
 * import(/system-capability-routes);
 *
 * const routes = new SystemCapabilityRoutes();
 * app.use('/api/v1/system/capability, routes?.getRouter)';' * '`'
 */

import { getLogger } from @claude-zen/foundation'';
import {
  getSystemCapabilityData,
  createHealthDataProviders,
  getCapabilityScores'

} from '@claude-zen/foundation/system-capability-data-provider';
import {
  Router,
  type Request,
  type Response
} from 'express';

const logger = getLogger(SystemCapabilityRoutes);

export class SystemCapabilityRoutes { private router: Router; private healthProviders: ReturnType<typeof createHealthDataProviders>; constructor() {
  this.router = Router(); this.healthProviders = createHealthDataProviders(); this.setupRoutes

} private setupRoutes(): void  {
  // Overall system status summary this.router.get('/status',
  this.handleGetStatus.bind(this))'; // Detailed facade information this.router.get('/facades',
  this.handleGetFacades.bind(this))'; // Installation suggestions this.router.get('/suggestions',
  this.handleGetSuggestions.bind(this))'; // Complete capability data this.router.get('/detailed',
  this.handleGetDetailed.bind(this))'; // Health monitoring endpoint this.router.get('/health',
  this.handleGetHealth.bind(this))'; // Capability scores by facade this.router.get('/scores',
  this.handleGetScores.bind(this))'; logger.info('✅ System capability routes configured)'

} /** * GET /api/v1/system/capability/status * Returns overall system status summary */ private async handleGetStatus(req: Request, res: Response: Promise<void> { try { const statusData = await this.healthProviders?.getStatusData() res.json(
  { success: true,
  data: statusData,
  met: {
  endpoint: 'status'; timestamp: new Date(
)?.toISOString

}
})
} catch (error) { logger.error('Failed to get system status', { error })'; res.status(500'.json({
  success: false,
  rror: 'Internal'server error'; message: 'Failed to retrieve system status'
})
} } /** * GET /api/v1/system/capability/facades * Returns detailed facade information */ private async handleGetFacades(req: Request, res: Response): Promise<void>  { try { const facadesData = await this.healthProviders?.getFacadesData() res.json(
  { success: true,
  data: facadesData,
  met: {
  endpoint: 'facades'; timestamp: new Date(
)?.toISOString,
  count: facadesData.facades.length

}'
})'
} catch (error) { logger.error('Failed to get facades data', { error })'; res.status(500'.json({
  success: false,
  rror: 'Internal'server error'; message: 'Failed to retrieve facades information'
})
} } /** * GET /api/v1/system/capability/suggestions * Returns installation suggestions for missing packages */ private async handleGetSuggestions(req: Request, res: Response ): Promise<void>  { try { const suggestionsData = await this.healthProviders?.getSuggestionsData() res.json(
  { success: true,
  data: suggestionsData,
  met: {
  endpoint: 'suggestions'; timestamp: new Date(
)?.toISOString,
  count: suggestionsData.suggestions.length

}'
})'
} catch (error) { logger.error('Failed to get suggestions data', { error })'; res.status(500'.json({
  success: false,
  rror: 'Internal'server error'; message: 'Failed to retrieve installation suggestions'
})
} } /** * GET /api/v1/system/capability/detailed * Returns complete system capability data */ private async handleGetDetailed(req: Request, res: Response): Promise<void>  { try { const detailedData = await this.healthProviders?.getDetailedData() res.json(
  { success: true,
  data: detailedData,
  met: {
  endpoint: 'detailed'; timestamp: new Date(
)?.toISOString,
  facades: detailedData.facades.length,
  totalPackages: detailedData.totalPackages,
  availablePackages: detailedData.availablePackages

}'
})'
} catch (error) { logger.error('Failed to get detailed data', { error })'; res.status(500'.json({
  success: false,
  rror: 'Internal'server error'; message: 'Failed to retrieve detailed capability data'
})
} } /** * GET /api/v1/system/capability/health * Health check endpoint for monitoring systems */ private async handleGetHealth(req: Request, res: Response): Promise<void>  { 'ry { const capabilityData = await getSystemCapabilityData()'; const isHealthy = 'capabilityData.systemHealthScore'>= 70'; const response = { status: isHealthy ? 'healthy : degraded, timestamp: new Date()?.toISOString, health: { score: capabilityData.systemHealthScore, overall: capabilityData.overall,` packages: '' + capabilityData.availablePackages + '/${capabilityData.totalPackages}', services: capabilityData.registeredServices
}, `'; res.status(isHealthy ? 200 : 503).json(response)
} catch (error) { logger.error('Health check failed', { error })'; res.status(503'.json({
  status: 'unhealthy',
  timestamp: new Date()?.toISOString',
  error: 'Health'check failed'

})
} } /** * GET /api/v1/system/capability/scores * Returns capability scores by facade */ private async handleGetScores(req: Request, res: Response): Promise<void>  { try { const scores = await getCapabilityScores(); res.json(
  { success: true,
  data: { scores,
  summary: {
  average: Object.values(
)(scores).reduce((sum,
  score) => sum + score,
  0) / Object.keys(scores).length,
  highest: Math.max(...Object.values()(scores)),
  lowest: Math.min(...Object.values()(scores)),
  facades: Object.keys(scores).length

}
}, meta: {
  endpoint: 'scores'; timestamp: new Date()?.toISOString

}
})
} catch (error) { logger.error('Failed to get capability scores', { error })'; res.status(
  500'.json({
  success: false,
  rror: 'Internal'server error'; message: Failed to retrieve capability scores

}
)
} } /** * Get the configured router */ public getRouter(): Router  { return this.router
}
}`