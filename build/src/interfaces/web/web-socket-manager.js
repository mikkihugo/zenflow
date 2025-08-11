/**
 * WebSocket Manager - Real-time communication system.
 *
 * Handles WebSocket connections, real-time data broadcasting,
 * and client event management for the web dashboard.
 */
/**
 * @file Web-socket management system.
 */
import { getLogger } from '../../config/logging-config.ts';
export class WebSocketManager {
    logger = getLogger('WebSocket');
    io;
    config;
    dataService;
    broadcastIntervals = [];
    constructor(io, config, dataService) {
        this.io = io;
        this.config = config;
        this.dataService = dataService;
    }
    /**
     * Setup WebSocket event handlers.
     */
    setupWebSocket() {
        if (!this.config.realTime) {
            this.logger.info('Real-time updates disabled');
            return;
        }
        this.io.on('connection', (socket) => {
            this.logger.debug(`Client connected: ${socket.id}`);
            // Send initial connection data
            socket.emit('connected', {
                sessionId: socket.handshake.headers['x-session-id'] || socket.id,
                timestamp: new Date().toISOString(),
                serverVersion: '2.0.0-alpha.73',
            });
            // Handle client subscription events
            socket.on('subscribe', (channel) => {
                socket.join(channel);
                this.logger.debug(`Client ${socket.id} subscribed to ${channel}`);
                // Send initial data for the subscribed channel
                this.sendChannelData(socket, channel);
            });
            socket.on('unsubscribe', (channel) => {
                socket.leave(channel);
                this.logger.debug(`Client ${socket.id} unsubscribed from ${channel}`);
            });
            // Handle ping for connection keep-alive
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: new Date().toISOString() });
            });
            socket.on('disconnect', (reason) => {
                this.logger.debug(`Client disconnected: ${socket.id}, reason: ${reason}`);
            });
            socket.on('error', (error) => {
                this.logger.error(`Socket error for client ${socket.id}:`, error);
            });
        });
        // Start real-time data broadcasting
        this.startDataBroadcast();
        this.logger.info('WebSocket manager initialized with real-time updates');
    }
    /**
     * Send initial data for a specific channel.
     *
     * @param socket
     * @param channel
     */
    async sendChannelData(socket, channel) {
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
                default:
                    this.logger.warn(`Unknown channel subscription: ${channel}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send initial data for channel ${channel}:`, error);
        }
    }
    /**
     * Start broadcasting real-time data updates.
     */
    startDataBroadcast() {
        // System status updates every 5 seconds
        const systemInterval = setInterval(async () => {
            try {
                const status = await this.dataService.getSystemStatus();
                this.broadcast('system:status', status);
            }
            catch (error) {
                this.logger.error('Failed to broadcast system status:', error);
            }
        }, 5000);
        // Task updates every 3 seconds
        const tasksInterval = setInterval(async () => {
            try {
                const tasks = await this.dataService.getTasks();
                this.broadcast('tasks:update', tasks);
            }
            catch (error) {
                this.logger.error('Failed to broadcast tasks:', error);
            }
        }, 3000);
        // Performance metrics every 10 seconds
        const metricsInterval = setInterval(() => {
            try {
                const stats = this.dataService.getServiceStats();
                this.broadcast('performance:update', stats);
            }
            catch (error) {
                this.logger.error('Failed to broadcast performance metrics:', error);
            }
        }, 10000);
        // Store intervals for cleanup
        this.broadcastIntervals.push(systemInterval, tasksInterval, metricsInterval);
        this.logger.info('Real-time data broadcasting started');
    }
    /**
     * Broadcast message to all connected clients.
     *
     * @param event
     * @param data
     */
    broadcast(event, data) {
        if (!this.config.realTime)
            return;
        const broadcastData = {
            event,
            data,
            timestamp: new Date().toISOString(),
        };
        this.io.emit(event, broadcastData);
        this.logger.debug(`Broadcasted event: ${event}`);
    }
    /**
     * Broadcast to specific room/channel.
     *
     * @param room
     * @param event
     * @param data
     */
    broadcastToRoom(room, event, data) {
        if (!this.config.realTime)
            return;
        const broadcastData = {
            event,
            data,
            timestamp: new Date().toISOString(),
        };
        this.io.to(room).emit(event, broadcastData);
        this.logger.debug(`Broadcasted event: ${event} to room: ${room}`);
    }
    /**
     * Get connected client statistics.
     */
    getConnectionStats() {
        const sockets = this.io.sockets.sockets;
        const connectedClients = Array.from(sockets.keys());
        const rooms = Array.from(this.io.sockets.adapter.rooms.keys()).filter((room) => !connectedClients.includes(room)); // Filter out client IDs
        return {
            totalConnections: sockets.size,
            connectedClients,
            rooms,
        };
    }
    /**
     * Stop all broadcasting intervals.
     */
    stopBroadcasting() {
        this.broadcastIntervals.forEach((interval) => clearInterval(interval));
        this.broadcastIntervals = [];
        this.logger.info('Real-time broadcasting stopped');
    }
    /**
     * Shutdown WebSocket manager.
     */
    shutdown() {
        this.stopBroadcasting();
        this.io.close();
        this.logger.info('WebSocket manager shutdown complete');
    }
}
