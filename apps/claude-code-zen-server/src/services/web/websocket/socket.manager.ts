/**
 * WebSocket Manager - Real-time communication system.
 */
import { getLogger } from '@claude-zen/foundation';
import type { Server as SocketIOServer, Socket } from 'socket.io';

const getVersion = () => '1.0.0';

// Safe access helpers for loosely-typed stats objects
const getNumber = (obj: Record<string, unknown>, key: string, fallback: number): number => {
  const v = obj[key];
  return typeof v === 'number' ? v : fallback;
};
const getString = (obj: Record<string, unknown>, key: string, fallback: string): string => {
  const v = obj[key];
  return typeof v === 'string' ? v : fallback;
};

export interface BroadcastData {
  event: string;
  data: unknown;
  timestamp: string;
}

export interface WebConfig { realTime?: boolean }

export interface WebDataService {
  getSystemStatus(): Promise<Record<string, unknown>>;
  getSwarms(): Promise<unknown[]>;
  getTasks(): Promise<unknown[]>;
  getServiceStats(): Record<string, unknown>;
  getSystemState?(): unknown;
}

export class WebSocketManager {
  private logger = getLogger('WebSocketManager');
  private io: SocketIOServer;
  private config: WebConfig;
  private dataService: WebDataService;
  private broadcastIntervals: NodeJS.Timeout[] = [];

  constructor(io: SocketIOServer, config: WebConfig, dataService: WebDataService) {
    this.io = io;
    this.config = config;
    this.dataService = dataService;
  }

  setupWebSocket(): void {
    if (!this.config.realTime) {
      this.logger.info('Real-time updates disabled');
      return;
    }
    this.setupLogBroadcaster();
    this.io.on('connection', (socket) => {
      this.logger.debug(`Client connected:${socket.id}`);
      socket.emit('connected', {
        sessionId: socket.handshake.headers['x-session-id'] || socket.id,
        timestamp: new Date().toISOString(),
        serverVersion: getVersion(),
      });
  socket.on('subscribe', async (channel: string) => {
        socket.join(channel);
        this.logger.debug(`Client ${socket.id} subscribed to ${channel}`);
        await this.sendChannelData(socket, channel);
      });
      socket.on('unsubscribe', (channel: string) => {
        socket.leave(channel);
        this.logger.debug(`Client ${socket.id} unsubscribed from ${channel}`);
      });
      socket.on('ping', () => { socket.emit('pong', { timestamp: new Date().toISOString() }); });
      socket.on('disconnect', (reason) => {
        this.logger.debug(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });
      socket.on('error', (error) => { this.logger.error(`Socket error for client ${socket.id}:`, error); });
    });
    this.startDataBroadcast();
    this.logger.info('WebSocket manager initialized with real-time updates');
  }

  private async sendChannelData(socket: Socket, channel: string): Promise<void> {
    try {
      switch (channel) {
        case 'system': {
          const status = await this.dataService.getSystemStatus();
          socket.emit('system:initial', { data: status, timestamp: new Date().toISOString() });
          break;
        }
        case 'swarms': {
          const swarms = await this.dataService.getSwarms();
          socket.emit('swarms:initial', { data: swarms, timestamp: new Date().toISOString() });
          break;
        }
        case 'tasks': {
          const tasks = await this.dataService.getTasks();
          socket.emit('tasks:initial', { data: tasks, timestamp: new Date().toISOString() });
          break;
        }
        case 'facades': {
          const facadeStatus = this.getFacadeStatus();
          socket.emit('facades:initial', { data: facadeStatus, timestamp: new Date().toISOString() });
          break;
        }
        case 'swarm-stats': {
          const swarmStats = await this.getSwarmStats();
          socket.emit('swarm-stats:initial', { data: swarmStats, timestamp: new Date().toISOString() });
          break;
        }
        case 'memory': {
          const memoryStatus = this.getMemoryStatus();
          socket.emit('memory:initial', { data: memoryStatus, timestamp: new Date().toISOString() });
          break;
        }
        case 'database': {
          const databaseStatus = this.getDatabaseStatus();
          socket.emit('database:initial', { data: databaseStatus, timestamp: new Date().toISOString() });
          break;
        }
        case 'logs': {
          try {
            const logs: unknown[] = [];
            socket.emit('logs:initial', { data: logs, timestamp: new Date().toISOString() });
          } catch (error) {
            this.logger.debug('Log entries not available: ', error);
          }
          break;
        }
        default:
          this.logger.warn(`Unknown channel subscription:${channel}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send initial data for channel ${channel}:`, error);
    }
  }

  private startDataBroadcast(): void {
    const systemInterval = setInterval(async () => {
      try {
        const status = await this.dataService.getSystemStatus();
        this.broadcast('system:status', status);
      } catch (error) {
        this.logger.error('Failed to broadcast system status: ', error);
      }
    }, 5000);

    const tasksInterval = setInterval(async () => {
      try {
        const tasks = await this.dataService.getTasks();
        this.broadcast('tasks:update', tasks);
      } catch (error) {
        this.logger.error('Failed to broadcast tasks: ', error);
      }
    }, 3000);

    const metricsInterval = setInterval(() => {
      try {
        const stats = this.dataService.getServiceStats();
        this.broadcast('performance:update', stats);
      } catch (error) {
        this.logger.error('Failed to broadcast performance metrics: ', error);
      }
    }, 10000);

    const logsInterval = setInterval(() => {
      try {
        const logs: unknown[] = [];
        if (logs.length > 0) this.broadcastToRoom('logs', 'logs:bulk', logs);
      } catch (error) {
        this.logger.error('Failed to broadcast logs: ', error);
      }
    }, 2000);

  const facadeInterval = setInterval(() => {
      try {
    const facadeStatus = this.getFacadeStatus();
        this.broadcast('facades:status', facadeStatus);
      } catch (error) {
        this.logger.error('Failed to broadcast facade status: ', error);
      }
    }, 15000);

    const swarmStatsInterval = setInterval(async () => {
      try {
        const swarmStats = await this.getSwarmStats();
        this.broadcast('swarm-stats:update', swarmStats);
      } catch (error) {
        this.logger.error('Failed to broadcast swarm stats: ', error);
      }
    }, 8000);

  const memoryInterval = setInterval(() => {
      try {
    const memoryStatus = this.getMemoryStatus();
        this.broadcast('memory:status', memoryStatus);
      } catch (error) {
        this.logger.error('Failed to broadcast memory status: ', error);
      }
    }, 12000);

  const databaseInterval = setInterval(() => {
      try {
    const databaseStatus = this.getDatabaseStatus();
        this.broadcast('database:status', databaseStatus);
      } catch (error) {
        this.logger.error('Failed to broadcast database status: ', error);
      }
    }, 20000);

    this.broadcastIntervals.push(
      systemInterval,
      tasksInterval,
      metricsInterval,
      logsInterval,
      facadeInterval,
      swarmStatsInterval,
      memoryInterval,
      databaseInterval
    );
    this.logger.info('Real-time data broadcasting started');
  }

  broadcast(event: string, data: unknown): void {
    if (!this.config.realTime) return;
    const broadcastData: BroadcastData = { event, data, timestamp: new Date().toISOString() };
    this.io.emit(event, broadcastData);
    this.logger.debug(`Broadcasted event:${event}`);
  }

  broadcastToRoom(room: string, event: string, data: unknown): void {
    if (!this.config.realTime) return;
    const broadcastData: BroadcastData = { event, data, timestamp: new Date().toISOString() };
    this.io.to(room).emit(event, broadcastData);
    this.logger.debug(`Broadcasted event:${event} to room:${room}`);
  }

  getConnectionStats(): { totalConnections: number; connectedClients: string[]; rooms: string[] } {
    const { sockets, adapter } = this.io.sockets;
    const connectedClients = Array.from(sockets.keys());
    const rooms = Array.from(adapter.rooms.keys()).filter((room) => !connectedClients.includes(room));
    return { totalConnections: sockets.size, connectedClients, rooms };
  }

  stopBroadcasting(): void {
    for (const interval of this.broadcastIntervals) clearInterval(interval);
    this.broadcastIntervals = [];
    this.logger.info('Real-time broadcasting stopped');
  }

  private setupLogBroadcaster(): void {
    try {
      import('@claude-zen/foundation')
        .then(({ setLogBroadcaster }) => {
          if (setLogBroadcaster) {
            setLogBroadcaster((event: string, data: unknown) => {
              this.broadcastToRoom('logs', event, data);
            });
            this.logger.debug('Log broadcaster configured for real-time updates');
          }
        })
        .catch((error) => { this.logger.warn('Failed to setup log broadcaster: ', error); });
    } catch (error) {
      this.logger.error('Error setting up log broadcaster: ', error);
    }
  }

  private getFacadeStatus(): Record<string, unknown> {
    try {
      if (this.dataService.getSystemState) {
        const systemState = this.dataService.getSystemState();
        // Safely derive agent count
        let agentsCount = 0;
        if (typeof systemState === 'object' && systemState !== null) {
          const maybeAgents = (systemState as Record<string, unknown>).agents;
          if (Array.isArray(maybeAgents)) agentsCount = maybeAgents.length;
        }
        return {
          overall: 'healthy',
          healthScore: 85,
          facades: {
            foundation: {
              name: 'foundation',
              capability: 'full',
              healthScore: 95,
              packages: { ['@claude-zen/foundation']: { status: 'registered', version: '1.1.1' } },
              features: ['Core utilities', 'Logging', 'Error handling'],
              missingPackages: [],
              registeredServices: ['logger', 'errorHandler'],
            },
            coordination: {
              name: 'coordination',
              capability: agentsCount > 0 ? 'full' : 'partial',
              healthScore: agentsCount > 0 ? 85 : 60,
              packages: { ['@claude-zen/coordination']: { status: 'active', version: '1.0.0' } },
              features: ['Agent management', 'Task coordination', 'Swarm orchestration'],
              missingPackages: [],
              registeredServices: agentsCount > 0 ? ['coordination', 'swarmManager'] : ['coordination'],
            },
          },
          totalPackages: 2,
          availablePackages: 2,
          registeredServices: agentsCount > 0 ? 4 : 3,
          timestamp: new Date().toISOString(),
        };
      }

      const packageInfo = this.getPackageInformation();
      const serviceHealth = this.getServiceHealth();
      // Pull system metrics if needed in future; avoid unused variable for now
      /* const systemMetrics = */ this.dataService.getServiceStats();
      type FacadeInfo = {
        name: string;
        capability: 'full' | 'partial' | 'fallback';
        healthScore: number;
        packages: Record<string, { status: string; version: string | null }>;
        features: string[];
        missingPackages: string[];
        registeredServices: string[];
      };
      const facades: Record<string, FacadeInfo> = {
        foundation: this.getFoundationFacadeStatus(packageInfo, serviceHealth),
        infrastructure: this.getInfrastructureFacadeStatus(packageInfo, serviceHealth),
        intelligence: this.getIntelligenceFacadeStatus(packageInfo, serviceHealth),
        enterprise: this.getEnterpriseFacadeStatus(packageInfo, serviceHealth),
        operations: this.getOperationsFacadeStatus(packageInfo, serviceHealth),
        development: this.getDevelopmentFacadeStatus(packageInfo, serviceHealth),
      };
      const healthScores = Object.values(facades).map((f) => f.healthScore);
      const overallHealth = Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length);
      const totalPackages = Object.values(facades).reduce((total, facade) => total + Object.keys(facade.packages).length, 0);
      const availablePackages = Object.values(facades).reduce((total, facade) =>
        total + Object.values(facade.packages).filter((pkg) => pkg.status === 'registered' || pkg.status === 'active').length, 0);
      const registeredServices = Object.values(facades).reduce((total, facade) => total + facade.registeredServices.length, 0);
      return { overall: overallHealth >= 80 ? 'healthy' : overallHealth >= 60 ? 'partial' : 'degraded', healthScore: overallHealth, facades, totalPackages, availablePackages, registeredServices, timestamp: new Date().toISOString() };
    } catch (error) {
      this.logger.error('Failed to get facade status: ', error);
      return { error: 'Failed to get facade status', overall: 'error', healthScore: 0, facades: {}, timestamp: new Date().toISOString() };
    }
  }

  private getPackageInformation(): Record<string, { available: boolean; version: string | null }> {
    try {
      const info: Record<string, { available: boolean; version: string | null }> = {};
      info['@claude-zen/foundation'] = { available: true, version: '1.1.1' };
      info['@claude-zen/database'] = { available: false, version: null };
      // Event system is now part of foundation
      info['@claude-zen/brain'] = { available: false, version: null };
      info['@claude-zen/coordination'] = { available: true, version: '1.0.0' };
      return info;
    } catch (error) {
      this.logger.error('Failed to get package information: ', error);
      return {};
    }
  }

  private getServiceHealth(): Record<string, { status: string; [k: string]: unknown }> {
    try {
      return {
        logger: { status: 'healthy', uptime: Date.now() - 60000 },
        webSocket: { status: 'healthy', connections: this.getConnectionStats().totalConnections },
        database: { status: 'partial', connections: 0 },
        coordination: { status: 'healthy', activeSwarms: 0 },
      };
    } catch (error) {
      this.logger.error('Failed to get service health: ', error);
      return {};
    }
  }

  private getFoundationFacadeStatus(
    packageInfo: Record<string, { available: boolean; version: string | null }>,
    serviceHealth: Record<string, { status: string; [k: string]: unknown }>
  ): { name: string; capability: 'full' | 'partial' | 'fallback'; healthScore: number; packages: Record<string, { status: string; version: string | null }>; features: string[]; missingPackages: string[]; registeredServices: string[] } {
    const foundationPackages = {
      ['@claude-zen/foundation']: { status: packageInfo['@claude-zen/foundation']?.available ? 'registered' : 'unavailable', version: packageInfo['@claude-zen/foundation']?.version },
    };
    const registeredServices = Object.keys(serviceHealth).filter((s) => ['logger', 'errorHandler', 'typeGuards'].includes(s) && serviceHealth[s].status === 'healthy');
    const healthScore = registeredServices.length >= 1 ? 95 : 50;
    return {
      name: 'foundation',
      capability: healthScore >= 80 ? 'full' : healthScore >= 60 ? 'partial' : 'fallback',
      healthScore,
      packages: foundationPackages,
      features: ['Core utilities', 'Logging', 'Error handling', 'Type-safe primitives'],
      missingPackages: Object.keys(foundationPackages).filter((pkg) => foundationPackages[pkg as keyof typeof foundationPackages].status === 'unavailable'),
      registeredServices: registeredServices.length > 0 ? registeredServices : ['logger'],
    };
  }

  private getInfrastructureFacadeStatus(
    packageInfo: Record<string, { available: boolean; version: string | null }>,
    serviceHealth: Record<string, { status: string; [k: string]: unknown }>
  ): { name: string; capability: 'full' | 'partial' | 'fallback'; healthScore: number; packages: Record<string, { status: string; version: string | null }>; features: string[]; missingPackages: string[]; registeredServices: string[] } {
    const infrastructurePackages = {
      ['@claude-zen/database']: { status: packageInfo['@claude-zen/database']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/database']?.version },
      // Event system is now part of foundation
    };
    const registeredServices = Object.keys(serviceHealth).filter((s) => ['database', 'events', 'otel'].includes(s) && serviceHealth[s].status === 'healthy');
    const healthScore = Math.round((registeredServices.length / 3) * 100);
    return {
      name: 'infrastructure',
      capability: healthScore >= 80 ? 'full' : healthScore >= 40 ? 'partial' : 'fallback',
      healthScore: Math.max(healthScore, 30),
      packages: infrastructurePackages,
      features: ['Database abstraction', 'Event system', 'OpenTelemetry', 'Service container'],
      missingPackages: Object.keys(infrastructurePackages).filter((pkg) => infrastructurePackages[pkg as keyof typeof infrastructurePackages].status === 'fallback'),
      registeredServices: registeredServices.length > 0 ? registeredServices : ['webSocket'],
    };
  }

  private getIntelligenceFacadeStatus(
    packageInfo: Record<string, { available: boolean; version: string | null }>,
    serviceHealth: Record<string, { status: string; [k: string]: unknown }>
  ): { name: string; capability: 'full' | 'partial' | 'fallback'; healthScore: number; packages: Record<string, { status: string; version: string | null }>; features: string[]; missingPackages: string[]; registeredServices: string[] } {
    const intelligencePackages = {
      ['@claude-zen/brain']: { status: packageInfo['@claude-zen/brain']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/brain']?.version },
      ['@claude-zen/neural-ml']: { status: packageInfo['@claude-zen/neural-ml']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/neural-ml']?.version },
    };
    const registeredServices = Object.keys(serviceHealth).filter((s) => ['brain', 'neural', 'ai'].includes(s) && serviceHealth[s].status === 'healthy');
    const healthScore = Math.round((registeredServices.length / 2) * 100);
    return {
      name: 'intelligence',
      capability: healthScore >= 80 ? 'full' : healthScore >= 40 ? 'partial' : 'fallback',
      healthScore: Math.max(healthScore, 20),
      packages: intelligencePackages,
      features: ['Neural coordination', 'Brain systems', 'AI optimization'],
      missingPackages: Object.keys(intelligencePackages).filter((pkg) => intelligencePackages[pkg as keyof typeof intelligencePackages].status === 'fallback'),
      registeredServices: registeredServices.length > 0 ? registeredServices : ['aiPlaceholder'],
    };
  }

  private getEnterpriseFacadeStatus(
    packageInfo: Record<string, { available: boolean; version: string | null }>,
    serviceHealth: Record<string, { status: string; [k: string]: unknown }>
  ): { name: string; capability: 'full' | 'partial' | 'fallback'; healthScore: number; packages: Record<string, { status: string; version: string | null }>; features: string[]; missingPackages: string[]; registeredServices: string[] } {
    const enterprisePackages = {
      ['@claude-zen/coordination']: { status: packageInfo['@claude-zen/coordination']?.available ? 'active' : 'fallback', version: packageInfo['@claude-zen/coordination']?.version },
      ['@claude-zen/workflows']: { status: packageInfo['@claude-zen/workflows']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/workflows']?.version },
    };
    const registeredServices = Object.keys(serviceHealth).filter((s) => ['coordination', 'workflows', 'safe'].includes(s) && serviceHealth[s].status === 'healthy');
    const healthScore = packageInfo['@claude-zen/coordination']?.available ? 60 : 20;
    return {
      name: 'enterprise',
      capability: healthScore >= 80 ? 'full' : healthScore >= 40 ? 'partial' : 'fallback',
      healthScore,
      packages: enterprisePackages,
      features: ['SAFE framework', 'Business workflows', 'Portfolio management'],
      missingPackages: Object.keys(enterprisePackages).filter((pkg) => enterprisePackages[pkg as keyof typeof enterprisePackages].status === 'fallback'),
      registeredServices: registeredServices.length > 0 ? registeredServices : ['coordination'],
    };
  }

  private getOperationsFacadeStatus(
    packageInfo: Record<string, { available: boolean; version: string | null }>,
    serviceHealth: Record<string, { status: string; [k: string]: unknown }>
  ): { name: string; capability: 'full' | 'partial' | 'fallback'; healthScore: number; packages: Record<string, { status: string; version: string | null }>; features: string[]; missingPackages: string[]; registeredServices: string[] } {
    const operationsPackages = {
      ['@claude-zen/system-monitoring']: { status: packageInfo['@claude-zen/system-monitoring']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/system-monitoring']?.version },
    };
    const registeredServices = Object.keys(serviceHealth).filter((s) => ['monitoring', 'loadBalancer', 'chaos'].includes(s) && serviceHealth[s].status === 'healthy');
    const healthScore = serviceHealth.webSocket?.status === 'healthy' ? 45 : 20;
    return {
      name: 'operations',
      capability: healthScore >= 80 ? 'full' : healthScore >= 40 ? 'partial' : 'fallback',
      healthScore,
      packages: operationsPackages,
      features: ['System monitoring', 'Load balancing', 'Performance tracking'],
      missingPackages: Object.keys(operationsPackages).filter((pkg) => operationsPackages[pkg as keyof typeof operationsPackages].status === 'fallback'),
      registeredServices: registeredServices.length > 0 ? registeredServices : ['webSocketMonitoring'],
    };
  }

  private getDevelopmentFacadeStatus(
    packageInfo: Record<string, { available: boolean; version: string | null }>,
    serviceHealth: Record<string, { status: string; [k: string]: unknown }>
  ): { name: string; capability: 'full' | 'partial' | 'fallback'; healthScore: number; packages: Record<string, { status: string; version: string | null }>; features: string[]; missingPackages: string[]; registeredServices: string[] } {
    const developmentPackages = {
      ['@claude-zen/code-analyzer']: { status: packageInfo['@claude-zen/code-analyzer']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/code-analyzer']?.version },
      ['@claude-zen/git-operations']: { status: packageInfo['@claude-zen/git-operations']?.available ? 'registered' : 'fallback', version: packageInfo['@claude-zen/git-operations']?.version },
    };
    const registeredServices = Object.keys(serviceHealth).filter((s) => ['codeAnalyzer', 'gitOps', 'architecture'].includes(s) && serviceHealth[s].status === 'healthy');
    const healthScore = Math.round((registeredServices.length / 3) * 100);
    return {
      name: 'development',
      capability: healthScore >= 80 ? 'full' : healthScore >= 40 ? 'partial' : 'fallback',
      healthScore: Math.max(healthScore, 25),
      packages: developmentPackages,
      features: ['Code analysis', 'Git operations', 'Architecture validation'],
      missingPackages: Object.keys(developmentPackages).filter((pkg) => developmentPackages[pkg as keyof typeof developmentPackages].status === 'fallback'),
      registeredServices: registeredServices.length > 0 ? registeredServices : ['basicDev'],
    };
  }

  private async getSwarmStats(): Promise<Record<string, unknown>> {
    try {
      const swarms = await this.dataService.getSwarms();
      const tasks = await this.dataService.getTasks();
      const systemStats = this.dataService.getServiceStats();
      type Swarm = { status?: string; activeAgents?: number; totalAgents?: number };
      type Task = { status?: string };
      const swarmsArr: Array<Partial<Swarm>> = Array.isArray(swarms) ? (swarms as Array<Partial<Swarm>>) : [];
      const tasksArr: Array<Partial<Task>> = Array.isArray(tasks) ? (tasks as Array<Partial<Task>>) : [];
      const totalSwarms = swarmsArr.length;
      const activeSwarms = swarmsArr.filter((s) => s.status === 'active').length;
      const totalTasks = tasksArr.length;
      const completedTasks = tasksArr.filter((t) => t.status === 'completed').length;
      const tasksInProgress = tasksArr.filter((t) => t.status === 'running' || t.status === 'in_progress').length;
      const successRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
      const activeAgents = swarmsArr.reduce((total: number, swarm) => total + (swarm.activeAgents ?? 0), 0);
      const totalAgents = swarmsArr.reduce((total: number, swarm) => total + (swarm.totalAgents ?? 0), 0);
      return {
        totalSwarms,
        activeSwarms,
        totalAgents,
        activeAgents,
        tasksCompleted: completedTasks,
        tasksInProgress,
        totalTasks,
        averageResponseTime: getNumber(systemStats, 'averageResponseTime', 180),
        successRate: Math.round(successRate * 100) / 100,
        coordinationEfficiency: activeSwarms > 0 ? Math.round((activeAgents / Math.max(totalAgents, 1)) * 100) : 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get swarm stats: ', error);
      return { error: 'Failed to get swarm stats', totalSwarms: 0, activeSwarms: 0, totalAgents: 0, activeAgents: 0, timestamp: new Date().toISOString() };
    }
  }

  private getMemoryStatus(): Record<string, unknown> {
    try {
      const systemStats = this.dataService.getServiceStats();
      const connectionStats = this.getConnectionStats();
      const memoryUsage = process.memoryUsage();
      const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const freeMemoryMB = totalMemoryMB - usedMemoryMB;
      return {
        totalMemory: `${totalMemoryMB}MB`,
        usedMemory: `${usedMemoryMB}MB`,
        freeMemory: `${freeMemoryMB}MB`,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        activeConnections: connectionStats.totalConnections,
        memoryUtilization: Math.round((usedMemoryMB / totalMemoryMB) * 100) / 100,
        cacheEfficiency: getNumber(systemStats, 'cacheHitRate', 0.75),
        processUptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get memory status: ', error);
      return { error: 'Failed to get memory status', totalMemory: '0MB', usedMemory: '0MB', timestamp: new Date().toISOString() };
    }
  }

  private getDatabaseStatus(): Record<string, unknown> {
    try {
      const systemStats = this.dataService.getServiceStats();
      const databases = {
        primary: {
          type: 'sqlite',
          status: 'healthy',
          connections: getNumber(systemStats, 'databaseConnections', 0),
          latency: getString(systemStats, 'databaseLatency', '15ms'),
          queryCount: getNumber(systemStats, 'totalQueries', 0),
          errorRate: getNumber(systemStats, 'databaseErrorRate', 0.02),
        },
        vector: { type: 'lancedb', status: 'partial', connections: 0, latency: '0ms', queryCount: 0, errorRate: 0 },
        graph: { type: 'kuzu', status: 'offline', connections: 0, latency: '0ms', queryCount: 0, errorRate: 0 },
      } as const;
      const totalConnections = Object.values(databases).reduce((sum, db) => sum + db.connections, 0);
      const healthyDatabases = Object.values(databases).filter((db) => db.status === 'healthy').length;
      const healthScore = healthyDatabases / Object.keys(databases).length;
      return {
        databases,
        totalConnections,
        healthyDatabases,
        totalDatabases: Object.keys(databases).length,
        overallLatency: getString(systemStats, 'averageLatency', '18ms'),
        healthScore: Math.round(healthScore * 100) / 100,
        totalQueries: getNumber(systemStats, 'totalQueries', 0),
        successRate: 1 - getNumber(systemStats, 'databaseErrorRate', 0.02),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get database status: ', error);
      return { error: 'Failed to get database status', databases: {}, totalConnections: 0, healthScore: 0, timestamp: new Date().toISOString() };
    }
  }

  shutdown(): void {
    this.stopBroadcasting();
    this.io?.close();
    this.logger.info('WebSocket manager shutdown complete');
  }
}
