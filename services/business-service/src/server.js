/**
 * Business Service - Vision Management API
 * Handles strategic vision creation, approval, and roadmap generation
 */

import BaseServer from '../../shared/base-server.js';
import visionRoutes from './routes/visions.js';
import roadmapRoutes from './routes/roadmaps.js';
import { EventBus } from '../../shared/events/bus.js';

class BusinessService extends BaseServer {
  constructor(config = {}) {
    super({
      name: 'business-service',
      port: process.env.BUSINESS_SERVICE_PORT || 3001,
      ...config
    });

    // Initialize event bus
    this.eventBus = new EventBus({
      serviceName: 'business-service',
      redis: config.redis
    });

    // Service-specific dependencies
    this.dependencies = {
      coreService: process.env.CORE_SERVICE_URL || 'http://localhost:3002',
      swarmService: process.env.SWARM_SERVICE_URL || 'http://localhost:3003',
      geminiApiKey: process.env.GEMINI_API_KEY
    };
  }

  /**
   * Set up service-specific routes
   */
  setupRoutes() {
    // API prefix
    const apiPrefix = '/api/v1';

    // Vision management routes
    this.app.use(`${apiPrefix}/visions`, visionRoutes(this));

    // Roadmap routes
    this.app.use(`${apiPrefix}/visions`, roadmapRoutes(this));

    // Service info endpoint
    this.app.get(`${apiPrefix}/info`, (req, res) => {
      res.json({
        service: 'business-service',
        version: '1.0.0',
        description: 'Vision management and strategic planning service',
        endpoints: {
          visions: {
            create: 'POST /api/v1/visions',
            get: 'GET /api/v1/visions/:id',
            list: 'GET /api/v1/visions',
            update: 'PUT /api/v1/visions/:id',
            approve: 'PUT /api/v1/visions/:id/approve',
            reject: 'PUT /api/v1/visions/:id/reject'
          },
          roadmaps: {
            get: 'GET /api/v1/visions/:id/roadmap',
            update: 'PUT /api/v1/visions/:id/roadmap'
          }
        }
      });
    });
  }

  /**
   * Check service readiness
   */
  async checkReadiness() {
    try {
      // Check Redis connection
      await this.eventBus.ping();

      // Check Gemini API availability
      if (!this.dependencies.geminiApiKey) {
        console.warn('Gemini API key not configured');
      }

      return true;
    } catch (error) {
      console.error('Readiness check failed:', error);
      return false;
    }
  }

  /**
   * Get custom metrics
   */
  getCustomMetrics() {
    return {
      visions: {
        total: 0, // Would query from database
        pending: 0,
        approved: 0,
        rejected: 0
      },
      events: {
        published: this.eventBus.getMetrics().published,
        errors: this.eventBus.getMetrics().errors
      }
    };
  }

  /**
   * Start the service
   */
  async start() {
    // Connect to event bus
    await this.eventBus.connect();

    // Start server
    await super.start();
  }

  /**
   * Stop the service
   */
  async stop() {
    // Disconnect from event bus
    await this.eventBus.disconnect();

    // Stop server
    await super.stop();
  }
}

export default BusinessService;

// Start service if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const service = new BusinessService();
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await service.stop();
    process.exit(0);
  });

  // Start service
  service.start().catch((error) => {
    console.error('Failed to start Business Service:', error);
    process.exit(1);
  });
}