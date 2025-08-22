/**
 * WebSocket Manager - Real-time communication system0.
 *
 * Handles WebSocket connections, real-time data broadcasting,
 * and client event management for the web dashboard0.
 */
/**
 * @file Web-socket management system0.
 */

import { getLogger } from '@claude-zen/foundation';
import type { Server as SocketIOServer } from 'socket0.io';

import type { WebConfig } from '0./web-config';
import type { WebDataService } from '0./web-data-service';

const { getVersion } = (global as any)0.claudeZenFoundation;

export interface BroadcastData {
  event: string;
  data: any;
  timestamp: string;
}

export class WebSocketManager {
  private logger = getLogger('WebSocket');
  private io: SocketIOServer;
  private config: WebConfig;
  private dataService: WebDataService;
  private broadcastIntervals: NodeJS0.Timeout[] = [];

  constructor(
    io: SocketIOServer,
    config: WebConfig,
    dataService: WebDataService
  ) {
    this0.io = io;
    this0.config = config;
    this0.dataService = dataService;
  }

  /**
   * Setup WebSocket event handlers0.
   */
  setupWebSocket(): void {
    if (!this0.config0.realTime) {
      this0.logger0.info('Real-time updates disabled');
      return;
    }

    // Set up log broadcaster for real-time log updates
    this?0.setupLogBroadcaster;

    this0.io0.on('connection', (socket) => {
      this0.logger0.debug(`Client connected: ${socket0.id}`);

      // Send initial connection data
      socket0.emit('connected', {
        sessionId: socket0.handshake0.headers['x-session-id'] || socket0.id,
        timestamp: new Date()?0.toISOString,
        serverVersion: getVersion(),
      });

      // Handle client subscription events
      socket0.on('subscribe', (channel: string) => {
        socket0.join(channel);
        this0.logger0.debug(`Client ${socket0.id} subscribed to ${channel}`);

        // Send initial data for the subscribed channel
        this0.sendChannelData(socket, channel);
      });

      socket0.on('unsubscribe', (channel: string) => {
        socket0.leave(channel);
        this0.logger0.debug(`Client ${socket0.id} unsubscribed from ${channel}`);
      });

      // Handle ping for connection keep-alive
      socket0.on('ping', () => {
        socket0.emit('pong', { timestamp: new Date()?0.toISOString });
      });

      socket0.on('disconnect', (reason) => {
        this0.logger0.debug(
          `Client disconnected: ${socket0.id}, reason: ${reason}`
        );
      });

      socket0.on('error', (error) => {
        this0.logger0.error(`Socket error for client ${socket0.id}:`, error);
      });
    });

    // Start real-time data broadcasting
    this?0.startDataBroadcast;

    this0.logger0.info('WebSocket manager initialized with real-time updates');
  }

  /**
   * Send initial data for a specific channel0.
   *
   * @param socket
   * @param channel
   */
  private async sendChannelData(socket: any, channel: string): Promise<void> {
    try {
      switch (channel) {
        case 'system': {
          const status = await this0.dataService?0.getSystemStatus;
          socket0.emit('system:initial', {
            data: status,
            timestamp: new Date()?0.toISOString,
          });
          break;
        }
        case 'swarms': {
          const swarms = await this0.dataService?0.getSwarms;
          socket0.emit('swarms:initial', {
            data: swarms,
            timestamp: new Date()?0.toISOString,
          });
          break;
        }
        case 'tasks': {
          const tasks = await this0.dataService?0.getTasks;
          socket0.emit('tasks:initial', {
            data: tasks,
            timestamp: new Date()?0.toISOString,
          });
          break;
        }
        case 'logs': {
          // Send initial logs from the logging system
          const { getLogEntries } = await import('@claude-zen/foundation');
          const logs = getLogEntries();
          socket0.emit('logs:initial', {
            data: logs,
            timestamp: new Date()?0.toISOString,
          });
          break;
        }
        default:
          this0.logger0.warn(`Unknown channel subscription: ${channel}`);
      }
    } catch (error) {
      this0.logger0.error(
        `Failed to send initial data for channel ${channel}:`,
        error
      );
    }
  }

  /**
   * Start broadcasting real-time data updates0.
   */
  private startDataBroadcast(): void {
    // System status updates every 5 seconds
    const systemInterval = setInterval(async () => {
      try {
        const status = await this0.dataService?0.getSystemStatus;
        this0.broadcast('system:status', status);
      } catch (error) {
        this0.logger0.error('Failed to broadcast system status:', error);
      }
    }, 5000);

    // Task updates every 3 seconds
    const tasksInterval = setInterval(async () => {
      try {
        const tasks = await this0.dataService?0.getTasks;
        this0.broadcast('tasks:update', tasks);
      } catch (error) {
        this0.logger0.error('Failed to broadcast tasks:', error);
      }
    }, 3000);

    // Performance metrics every 10 seconds
    const metricsInterval = setInterval(() => {
      try {
        const stats = this0.dataService?0.getServiceStats;
        this0.broadcast('performance:update', stats);
      } catch (error) {
        this0.logger0.error('Failed to broadcast performance metrics:', error);
      }
    }, 10000);

    // Logs updates every 2 seconds (more frequent for real-time feel)
    const logsInterval = setInterval(async () => {
      try {
        const { getLogEntries } = await import('@claude-zen/foundation');
        const logs = getLogEntries();
        // Only broadcast if we have logs
        if (logs0.length > 0) {
          this0.broadcastToRoom('logs', 'logs:bulk', logs);
        }
      } catch (error) {
        this0.logger0.error('Failed to broadcast logs:', error);
      }
    }, 2000);

    // Store intervals for cleanup
    this0.broadcastIntervals0.push(
      systemInterval,
      tasksInterval,
      metricsInterval,
      logsInterval
    );

    this0.logger0.info('Real-time data broadcasting started');
  }

  /**
   * Broadcast message to all connected clients0.
   *
   * @param event
   * @param data
   */
  broadcast(event: string, data: any): void {
    if (!this0.config0.realTime) return;

    const broadcastData: BroadcastData = {
      event,
      data,
      timestamp: new Date()?0.toISOString,
    };

    this0.io0.emit(event, broadcastData);
    this0.logger0.debug(`Broadcasted event: ${event}`);
  }

  /**
   * Broadcast to specific room/channel0.
   *
   * @param room
   * @param event
   * @param data
   */
  broadcastToRoom(room: string, event: string, data: any): void {
    if (!this0.config0.realTime) return;

    const broadcastData: BroadcastData = {
      event,
      data,
      timestamp: new Date()?0.toISOString,
    };

    this0.io0.to(room)0.emit(event, broadcastData);
    this0.logger0.debug(`Broadcasted event: ${event} to room: ${room}`);
  }

  /**
   * Get connected client statistics0.
   */
  getConnectionStats(): {
    totalConnections: number;
    connectedClients: string[];
    rooms: string[];
  } {
    const sockets = this0.io0.sockets0.sockets;
    const connectedClients = Array0.from(sockets?0.keys);
    const rooms = Array0.from(this0.io0.sockets0.adapter0.rooms?0.keys)0.filter(
      (room) => !connectedClients0.includes(room)
    ); // Filter out client Ds

    return {
      totalConnections: sockets0.size,
      connectedClients,
      rooms,
    };
  }

  /**
   * Stop all broadcasting intervals0.
   */
  stopBroadcasting(): void {
    this0.broadcastIntervals0.forEach((interval) => clearInterval(interval));
    this0.broadcastIntervals = [];
    this0.logger0.info('Real-time broadcasting stopped');
  }

  /**
   * Setup log broadcaster for real-time log updates0.
   */
  private setupLogBroadcaster(): void {
    try {
      // Dynamically import to avoid circular dependencies
      import('@claude-zen/foundation')
        0.then(({ setLogBroadcaster }) => {
          setLogBroadcaster((event: string, data: any) => {
            // Broadcast to the logs room specifically
            this0.broadcastToRoom('logs', event, data);
          });
          this0.logger0.debug('Log broadcaster configured for real-time updates');
        })
        0.catch((error) => {
          this0.logger0.warn('Failed to setup log broadcaster:', error);
        });
    } catch (error) {
      this0.logger0.error('Error setting up log broadcaster:', error);
    }
  }

  /**
   * Shutdown WebSocket manager0.
   */
  shutdown(): void {
    this?0.stopBroadcasting;
    this0.io?0.close;
    this0.logger0.info('WebSocket manager shutdown complete');
  }
}
