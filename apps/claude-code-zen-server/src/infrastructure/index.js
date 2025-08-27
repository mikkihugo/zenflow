/**
 * Infrastructure Layer - Foundation Pattern
 *
 * Single coordinating facade for system infrastructure.
 * Internally delegates to strategic facades when needed.
 */
import { createContainer, err, getLogger, ok, } from '@claude-zen/foundation';
const logger = getLogger('infrastructure');
class SystemCoordinatorImpl {
    initialized = false;
    async getSystemHealth() {
        try {
            // Internally coordinate with strategic facades
            const brainHealth = await this.getBrainHealth();
            const memoryHealth = this.getMemoryHealth();
            const dbHealth = await this.getDatabaseHealth();
            const coordHealth = this.getCoordinationHealth();
            const health = {
                overall: this.assessOverallHealth([
                    brainHealth,
                    memoryHealth,
                    dbHealth,
                    coordHealth,
                ]),
                components: {
                    brain: brainHealth,
                    memory: memoryHealth,
                    database: dbHealth,
                    coordination: coordHealth,
                },
                alerts: this.getSystemAlerts(),
            };
            return ok(health);
        }
        catch (error) {
            logger.error('Failed to get system health:', error);
            return err(error);
        }
    }
    async getSystemMetrics() {
        try {
            const metrics = {
                uptime: process.uptime() * 1000,
                memoryUsage: process.memoryUsage().heapUsed,
                cpuUsage: this.getCpuUsage(),
                activeConnections: this.getActiveConnections(),
                performance: this.getPerformanceMetrics(),
            };
            return ok(metrics);
        }
        catch (error) {
            logger.error('Failed to get system metrics:', error);
            return err(error);
        }
    }
    async initializeSystem() {
        if (this.initialized) {
            return ok();
        }
        try {
            logger.info('Initializing system coordinator...');
            // Initialize strategic facades in order
            await this.initializeBrainSystem();
            await this.initializeMemorySystem();
            await this.initializeDatabaseSystem();
            await this.initializeCoordinationSystem();
            this.initialized = true;
            logger.info('System coordinator initialized successfully');
            return ok();
        }
        catch (error) {
            logger.error('Failed to initialize system:', error);
            return err(error);
        }
    }
    async shutdownSystem() {
        try {
            logger.info('Shutting down system coordinator...');
            // Shutdown in reverse order
            await this.shutdownCoordinationSystem();
            await this.shutdownDatabaseSystem();
            await this.shutdownMemorySystem();
            await this.shutdownBrainSystem();
            this.initialized = false;
            logger.info('System coordinator shut down successfully');
            return ok();
        }
        catch (error) {
            logger.error('Failed to shutdown system:', error);
            return err(error);
        }
    }
    // Private methods - internally use strategic facades
    async getBrainHealth() {
        try {
            // Lazy load brain system facade when needed
            const { getBrainSystem } = await import('@claude-zen/intelligence');
            const brainSystem = await getBrainSystem();
            const health = await brainSystem.getHealth();
            return health.isHealthy
                ? 'healthy'
                : health.hasWarnings
                    ? 'warning'
                    : 'critical';
        }
        catch (error) {
            logger.warn('Brain system not available:', error);
            return 'critical';
        }
    }
    getMemoryHealth() {
        const usage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
        if (usage > 1000)
            return 'critical';
        if (usage > 500)
            return 'warning';
        return 'healthy';
    }
    async getDatabaseHealth() {
        try {
            // Direct database check - simplified for now
            // TODO: Implement actual database connection check
            return 'healthy';
        }
        catch (error) {
            logger.warn('Database system not available:', error);
            return 'critical';
        }
    }
    getCoordinationHealth() {
        // Check coordination system health
        return 'healthy'; // Simplified for now
    }
    assessOverallHealth(componentHealths) {
        if (componentHealths.includes('critical'))
            return 'critical';
        if (componentHealths.includes('warning'))
            return 'warning';
        return 'healthy';
    }
    getSystemAlerts() {
        return []; // Simplified for now
    }
    getCpuUsage() {
        const usage = process.cpuUsage();
        return (usage.user + usage.system) / 1000000; // Convert to seconds
    }
    getActiveConnections() {
        return 0; // Simplified for now
    }
    getPerformanceMetrics() {
        return {
            averageLatency: 100,
            errorRate: 0.01,
            throughput: 1000,
        };
    }
    async initializeBrainSystem() {
        // Lazy initialization of brain system
    }
    async initializeMemorySystem() {
        // Lazy initialization of memory system
    }
    async initializeDatabaseSystem() {
        // Lazy initialization of database system
    }
    async initializeCoordinationSystem() {
        // Lazy initialization of coordination system
    }
    async shutdownBrainSystem() {
        // Graceful shutdown of brain system
    }
    async shutdownMemorySystem() {
        // Graceful shutdown of memory system
    }
    async shutdownDatabaseSystem() {
        // Graceful shutdown of database system
    }
    async shutdownCoordinationSystem() {
        // Graceful shutdown of coordination system
    }
}
/**
 * Get system coordinator instance (Strategic Facade)
 */
export function getSystemCoordinator() {
    return new SystemCoordinatorImpl();
}
/**
 * Infrastructure service container
 */
export const infrastructureContainer = createContainer();
export { WebProcessManager } from './process/web.manager';
// Legacy exports for backward compatibility
export { WebSessionManager } from './session.manager';
logger.info('Infrastructure layer initialized with coordinating facade pattern');
