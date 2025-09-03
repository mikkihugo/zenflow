/**
 * API Route Handler - RESTful API endpoints.
 *
 * Handles all REST API routes for the web dashboard including system status,
 * swarm management, task operations, and command execution.
 */

// Foundation imports
import { getLogger } from '@claude-zen/foundation';
import { getEventBus, type CorrelatedPayload } from '../events/event-bus';

import type { Express, Request, Response } from 'express';

import type { WebSocketCoordinator } from './websocket';

const { getVersion } = (global as { foundation?: { getVersion: () => string } })
  .foundation || { getVersion: () => '1.0.0' };

export interface ApiConfig {
  prefix: string;
  enableCors?: boolean;
}

export interface SystemStatus {
  status: string;
  version: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    external?: number;
    rss?: number;
    usagePercent?: number;
  };
  environment: string;
  metrics?: {
    cpu: NodeJS.CpuUsage;
    loadAverage: number[];
    version: string;
    platform: string;
    arch: string;
    nodeVersion: string;
    pid: number;
    ppid: number;
  };
}

export interface SwarmInfo {
  id: string;
  name: string;
  status: string;
  agents: number;
}

export interface TaskInfo {
  id: string;
  title: string;
  status: string;
  priority: string;
}

/**
 * Handles RESTful API routes for web interface.
 */
export class ApiRouteHandler {
  private logger = getLogger('ApiRoutes');
  private bus = getEventBus();

  constructor(
    private app: Express,
    private webSocket: WebSocketCoordinator,
    private config: ApiConfig
  ) {
    this.setupRoutes();
  }

  /**
   * Setup all API routes.
   */
  private setupRoutes(): void {
    const api = this.config.prefix;

    // Health check endpoint
    this.app.get(`${api  }/health`, this.handleHealth.bind(this));

    // System status endpoint
    this.app.get(`${api  }/status`, this.handleSystemStatus.bind(this));

    // Swarm management endpoints
    this.app.get(`${api  }/swarms`, this.handleGetSwarms.bind(this));
    this.app.post(`${api  }/swarms`, this.handleCreateSwarm.bind(this));

    // Task management endpoints
    this.app.get(`${api  }/tasks`, this.handleGetTasks.bind(this));
    this.app.post(`${api  }/tasks`, this.handleCreateTask.bind(this));

    // Document management endpoints
    this.app.get(`${api  }/documents`, this.handleGetDocuments.bind(this));

    // Command execution endpoint
    this.app.post(`${api  }/execute`, this.handleExecuteCommand.bind(this));

    // Settings management endpoints
    this.app.get(`${api  }/settings`, this.handleGetSettings.bind(this));
    this.app.post(`${api  }/settings`, this.handleUpdateSettings.bind(this));

    // Logs management endpoint
    this.app.get(`${api  }/logs`, this.handleGetLogs.bind(this));

    this.logger.info(`API routes initialized with prefix:${  api}`);
  }

  /**
   * Health check handler.
   */
  private handleHealth(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: getVersion(),
      uptime: process.uptime(),
    });
  }

  /**
   * System status handler.
   */
  private handleSystemStatus(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(2000, res, 'Status request timed out');
    const handler = this.correlatedHandler('taskmaster:system:status:response', correlationId, cancel, (payload) => {
      res.json(payload);
    });
    this.bus.on('taskmaster:system:status:response', handler);
    this.bus.emit('taskmaster:system:status:request', { correlationId });
  }

  /**
   * Get swarms handler.
   */
  private handleGetSwarms(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(3000, res, 'Swarms request timed out');
    const handler = this.correlatedHandler('taskmaster:swarms:list:response', correlationId, cancel, (payload: CorrelatedPayload<{ swarms: unknown }>) => {
      res.json(payload.swarms ?? []);
    });
    this.bus.on('taskmaster:swarms:list:response', handler);
    this.bus.emit('taskmaster:swarms:list:request', { correlationId });
  }

  /**
   * Create swarm handler.
   */
  private async handleCreateSwarm(req: Request, res: Response): Promise<void> {
    try {
      const swarm = await this.createSwarm(req.body);
      this.webSocket.broadcast('swarm:created', swarm);
      res.json(swarm);
    } catch (error) {
      this.logger.error('Failed to create swarm: ', error);
      res.status(500).json({ error: 'Failed to create swarm' });
    }
  }

  /**
   * Get tasks handler.
   */
  private handleGetTasks(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(3000, res, 'Tasks request timed out');
    const handler = this.correlatedHandler('taskmaster:tasks:list:response', correlationId, cancel, (payload: CorrelatedPayload<{ tasks: unknown }>) => {
      res.json(payload.tasks ?? []);
    });
    this.bus.on('taskmaster:tasks:list:response', handler);
    this.bus.emit('taskmaster:tasks:list:request', { correlationId });
  }

  /**
   * Create task handler.
   */
  private handleCreateTask(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(4000, res, 'Create task timed out');
    const handler = this.correlatedHandler('taskmaster:tasks:create:response', correlationId, cancel, (payload: CorrelatedPayload<{ task: unknown }>) => {
      this.webSocket.broadcast('task:created', payload.task);
      res.json(payload.task);
    });
    this.bus.on('taskmaster:tasks:create:response', handler);
    this.bus.emit('taskmaster:tasks:create:request', { correlationId, input: req.body });
  }

  /**
   * Get documents handler.
   */
  private handleGetDocuments(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(3000, res, 'Documents request timed out');
    const handler = this.correlatedHandler('taskmaster:documents:list:response', correlationId, cancel, (payload: CorrelatedPayload<{ documents: unknown }>) => {
      res.json(payload.documents ?? []);
    });
    this.bus.on('taskmaster:documents:list:response', handler);
    this.bus.emit('taskmaster:documents:list:request', { correlationId });
  }

  /**
   * Execute command handler.
   */
  private handleExecuteCommand(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(5000, res, 'Execute command timed out');
    const handler = this.correlatedHandler('taskmaster:execute:response', correlationId, cancel, (payload) => {
      res.json(payload.result ?? payload);
    });
    this.bus.on('taskmaster:execute:response', handler);
    this.bus.emit('taskmaster:execute:request', { correlationId, input: req.body });
  }

  /**
   * Get settings handler.
   */
  private handleGetSettings(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(2000, res, 'Settings request timed out');
    const handler = this.correlatedHandler('taskmaster:settings:get:response', correlationId, cancel, (payload: CorrelatedPayload<{ settings: unknown }>) => {
      res.json(payload.settings ?? {});
    });
    this.bus.on('taskmaster:settings:get:response', handler);
    this.bus.emit('taskmaster:settings:get:request', { correlationId });
  }

  /**
   * Update settings handler.
   */
  private handleUpdateSettings(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(4000, res, 'Update settings timed out');
    const handler = this.correlatedHandler('taskmaster:settings:update:response', correlationId, cancel, (payload: CorrelatedPayload<{ settings: unknown }>) => {
      this.webSocket.broadcast('settings:updated', payload.settings);
      res.json(payload.settings ?? {});
    });
    this.bus.on('taskmaster:settings:update:response', handler);
    this.bus.emit('taskmaster:settings:update:request', { correlationId, input: req.body });
  }

  /**
   * Get logs handler.
   */
  private handleGetLogs(req: Request, res: Response): void {
    const correlationId = this.newCorrelationId();
    const cancel = this.setTimeoutOrFail(3000, res, 'Logs request timed out');
    const handler = this.correlatedHandler('taskmaster:logs:list:response', correlationId, cancel, (payload: CorrelatedPayload<{ logs: unknown }>) => {
      res.json(payload.logs ?? []);
    });
    this.bus.on('taskmaster:logs:list:response', handler);
    const { limit = 100, offset = 0 } = req.query;
    this.bus.emit('taskmaster:logs:list:request', { correlationId, limit: Number(limit), offset: Number(offset) });
  }

  // Helper utilities for correlation-based responses
  private newCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private setTimeoutOrFail(ms: number, res: Response, message: string): () => void {
    const timer = setTimeout(() => {
      this.logger.warn(message);
      res.status(504).json({ error: message });
    }, ms);
    return () => clearTimeout(timer);
  }

  private correlatedHandler<T extends CorrelatedPayload>(
    event: string,
    correlationId: string,
    cancel: () => void,
    onMatch: (payload: T) => void
  ) {
  const fn = (...args: unknown[]) => {
      const payload = (args[0] ?? {}) as T;
      if ((payload as CorrelatedPayload)?.correlationId !== correlationId) return;
      cancel();
      this.bus.off(event, fn);
      onMatch(payload);
    };
    return fn;
  }
}
