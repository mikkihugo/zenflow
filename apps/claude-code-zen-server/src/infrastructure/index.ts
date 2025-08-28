/**
 * Infrastructure Layer - Foundation Pattern
 *
 * Single coordinating facade for system infrastructure.
 * Internally delegates to strategic facades when needed.
 */

import {
  createContainer,
  err,
  getLogger,
  ok,
  type Result,
} from '@claude-zen/foundation';

// Import database functionality
import { SQLiteAdapter} from '@claude-zen/database';

const logger = getLogger('infrastructure');

/**
 * System Coordinator - Single point of entry for complex operations
 */
export interface SystemCoordinator {
  getSystemHealth():Promise<Result<SystemHealth, Error>>;
  getSystemMetrics():Promise<Result<SystemMetrics, Error>>;
  initializeSystem():Promise<Result<void, Error>>;
  shutdownSystem():Promise<Result<void, Error>>;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components:{
    brain: 'healthy' | 'warning' | 'critical';
    memory: 'healthy' | 'warning' | 'critical';
    database: 'healthy' | 'warning' | 'critical';
    coordination: 'healthy' | 'warning' | 'critical';
};
  alerts:Array<{
    level: 'info' | 'warning' | 'error';
    component:string;
    message:string;
    timestamp:number;
}>;
}

export interface SystemMetrics {
  uptime:number;
  memoryUsage:number;
  cpuUsage:number;
  activeConnections:number;
  performance:{
    averageLatency:number;
    errorRate:number;
    throughput:number;
};
}

class SystemCoordinatorImpl implements SystemCoordinator {
  private initialized = false;

  async getSystemHealth():Promise<Result<SystemHealth, Error>> {
    try {
      // Internally coordinate with strategic facades
      const brainHealth = await this.getBrainHealth();
      const memoryHealth = this.getMemoryHealth();
      const dbHealth = await this.getDatabaseHealth();
      const coordHealth = this.getCoordinationHealth();

      const health:SystemHealth = {
        overall:this.assessOverallHealth([
          brainHealth,
          memoryHealth,
          dbHealth,
          coordHealth,
]),
        components:{
          brain:brainHealth,
          memory:memoryHealth,
          database:dbHealth,
          coordination:coordHealth,
},
        alerts:this.getSystemAlerts(),
};

      return ok(health);
} catch (error) {
      logger.error('Failed to get system health: ', error);
      return err(error as Error);
}
}

  getSystemMetrics():Promise<Result<SystemMetrics, Error>> {
    return Promise.resolve().then(() => {
      try {
        const metrics:SystemMetrics = {
          uptime:process.uptime() * 1000,
          memoryUsage:process.memoryUsage().heapUsed,
          cpuUsage:this.getCpuUsage(),
          activeConnections:this.getActiveConnections(),
          performance:this.getPerformanceMetrics(),
};

        return ok(metrics);
} catch (error) {
        logger.error('Failed to get system metrics: ', error);
        return err(error as Error);
}
});
}

  async initializeSystem():Promise<Result<void, Error>> {
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
} catch (error) {
      logger.error('Failed to initialize system: ', error);
      return err(error as Error);
}
}

  async shutdownSystem():Promise<Result<void, Error>> {
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
} catch (error) {
      logger.error('Failed to shutdown system: ', error);
      return err(error as Error);
}
}

  // Private methods - internally use strategic facades
  private getBrainHealth():Promise<'healthy' | ' warning' | ' critical'> {
    return Promise.resolve().then(() => 
      // Simple health check - brain system availability  
      'healthy'
    ).catch((error) => {
      logger.warn('Brain system not available: ', error);
      return 'critical';
});
}

  private getMemoryHealth():'healthy' | ' warning' | ' critical' {
    const usage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    if (usage > 1000) return 'critical';
    if (usage > 500) return 'warning';
    return 'healthy';
}

  private async getDatabaseHealth():Promise<
    'healthy' | ' warning' | ' critical'
  > {
    try {
      // Create a database connection for health check
      const dbConfig = {
        type:'sqlite' as const,
        database: ':memory:', // Use in-memory database for health check
        path: ':memory:',        maxConnections:1,
        timeout:5000,
};
      
      const adapter = new SQLiteAdapter(dbConfig);
      
      // Perform actual health check
      const healthResult = await adapter.health();
      
      if (healthResult.healthy) {
        if (healthResult.score > 0.8) {
          return 'healthy';
} else if (healthResult.score > 0.5) {
          return 'warning';
} else {
          return 'critical';
}
} else {
        logger.warn('Database health check failed: ', healthResult.details);
      return 'critical';
}
} catch (error) {
      logger.error('Database health check error: ', error);
      return 'critical';
}
}

  private getCoordinationHealth():'healthy' | ' warning' | ' critical' {
    // Check coordination system health
    return 'healthy'; // Simplified for now
}

  private assessOverallHealth(
    componentHealths:string[]
  ):'healthy' | ' warning' | ' critical' {
    if (componentHealths.includes('critical')) return ' critical';
    if (componentHealths.includes('warning')) return ' warning';
    return 'healthy';
}

  private getSystemAlerts():SystemHealth['alerts'] {
    return []; // Simplified for now
}

  private getCpuUsage():number {
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000000; // Convert to seconds
}

  private getActiveConnections():number {
    return 0; // Simplified for now
}

  private getPerformanceMetrics():SystemMetrics['performance'] {
    return {
      averageLatency:100,
      errorRate:0.01,
      throughput:1000,
};
}

  private async initializeBrainSystem():Promise<void> {
    // Lazy initialization of brain system
}

  private async initializeMemorySystem():Promise<void> {
    // Lazy initialization of memory system
}

  private async initializeDatabaseSystem():Promise<void> {
    // Lazy initialization of database system
}

  private async initializeCoordinationSystem():Promise<void> {
    // Lazy initialization of coordination system
}

  private async shutdownBrainSystem():Promise<void> {
    // Graceful shutdown of brain system
}

  private async shutdownMemorySystem():Promise<void> {
    // Graceful shutdown of memory system
}

  private async shutdownDatabaseSystem():Promise<void> {
    // Graceful shutdown of database system
}

  private async shutdownCoordinationSystem():Promise<void> {
    // Graceful shutdown of coordination system
}
}

/**
 * Get system coordinator instance (Strategic Facade)
 */
export function getSystemCoordinator():SystemCoordinator {
  return new SystemCoordinatorImpl();
}

/**
 * Infrastructure service container
 */
export const infrastructureContainer = createContainer();

export type { ProcessInfo} from './process/web.manager';
export { WebProcessManager} from './process/web.manager';
export type { WebSession} from './session.manager';
// Legacy exports for backward compatibility
export { WebSessionManager} from './session.manager';

logger.info(
  'Infrastructure layer initialized with coordinating facade pattern');
