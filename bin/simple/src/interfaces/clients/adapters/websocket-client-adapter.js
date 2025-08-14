import { getLogger } from '../config/logging-config';
const logger = getLogger('interfaces-clients-adapters-websocket-client-adapter');
import { EventEmitter } from 'node:events';
export class WebSocketClientAdapter extends EventEmitter {
    config;
    name;
    ws = null;
    messageQueue = [];
    reconnectTimer = null;
    heartbeatTimer = null;
    _isConnected = false;
    reconnectAttempts = 0;
    _connectionId;
    metrics;
    startTime;
    constructor(config) {
        super();
        this.config = {
            timeout: 30000,
            reconnection: {
                enabled: true,
                maxAttempts: 10,
                interval: 1000,
                backoff: 'exponential',
            },
            heartbeat: {
                enabled: true,
                interval: 30000,
                message: { type: 'ping' },
            },
            messageQueue: {
                enabled: true,
                maxSize: 1000,
            },
            ...config,
        };
        this.name = config?.name || `ws-client-${Date.now()}`;
        this._connectionId = this.generateConnectionId();
        this.startTime = Date.now();
        this.metrics = this.initializeMetrics();
    }
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                const url = this.buildConnectionUrl();
                const protocols = this.config.protocols || [];
                this.ws = new WebSocket(url, protocols);
                if (this.config.binaryType) {
                    if (this.ws.binaryType !== undefined) {
                        this.ws.binaryType = this.config.binaryType;
                    }
                }
                const timeout = setTimeout(() => {
                    reject(new Error('WebSocket connection timeout'));
                }, this.config.connectionTimeout || this.config.timeout);
                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    this._isConnected = true;
                    this.reconnectAttempts = 0;
                    this._connectionId = this.generateConnectionId();
                    this.emit('connect');
                    this.emit('connected');
                    this.startHeartbeat();
                    this.flushMessageQueue();
                    this.updateMetrics(true, Date.now() - this.startTime);
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    this.handleMessage(event);
                };
                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    this._isConnected = false;
                    this.stopHeartbeat();
                    this.emit('disconnect', event.code, event.reason);
                    this.emit('disconnected', event.code, event.reason);
                    if (this.shouldReconnect(event)) {
                        this.scheduleReconnect();
                    }
                };
                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    this.emit('error', error);
                    this.updateMetrics(false, Date.now() - this.startTime);
                    reject(error);
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async disconnect() {
        return new Promise((resolve) => {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.stopHeartbeat();
            if (this.ws && this._isConnected) {
                this.ws.onclose = () => {
                    this._isConnected = false;
                    this.emit('disconnect');
                    resolve();
                };
                this.ws.close();
            }
            else {
                this._isConnected = false;
                resolve();
            }
        });
    }
    isConnected() {
        return this._isConnected && this.ws?.readyState === WebSocket.OPEN;
    }
    async healthCheck() {
        const responseTime = await this.measurePingTime();
        return {
            name: this.name,
            status: this._isConnected ? 'healthy' : 'disconnected',
            lastCheck: new Date(),
            responseTime,
            errorRate: this.calculateErrorRate(),
            uptime: Date.now() - this.startTime,
            metadata: {
                connectionId: this._connectionId,
                readyState: this.ws?.readyState || -1,
                queuedMessages: this.messageQueue.length,
                reconnectAttempts: this.reconnectAttempts,
            },
        };
    }
    async getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date(),
        };
    }
    async get(endpoint, options) {
        return this.sendRequest('GET', endpoint, undefined, options);
    }
    async post(endpoint, data, options) {
        return this.sendRequest('POST', endpoint, data, options);
    }
    async put(endpoint, data, options) {
        return this.sendRequest('PUT', endpoint, data, options);
    }
    async delete(endpoint, options) {
        return this.sendRequest('DELETE', endpoint, undefined, options);
    }
    updateConfig(config) {
        Object.assign(this.config, config);
        this.emit('config-updated', this.config);
    }
    on(event, handler) {
        super.on(event, handler);
    }
    off(event, handler) {
        if (handler) {
            super.off(event, handler);
        }
        else {
            super.removeAllListeners(event);
        }
    }
    async destroy() {
        await this.disconnect();
        this.removeAllListeners();
        this.messageQueue = [];
        this.metrics = this.initializeMetrics();
    }
    send(data) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        if (this._isConnected && this.ws) {
            try {
                this.ws.send(message);
                this.updateMetrics(true, 0);
            }
            catch (error) {
                this.emit('error', error);
                this.queueMessage(message);
                this.updateMetrics(false, 0);
            }
        }
        else {
            this.queueMessage(message);
        }
    }
    async sendMessage(message, _options) {
        const messageWithId = {
            id: this.generateMessageId(),
            timestamp: Date.now(),
            ...message,
        };
        const serialized = JSON.stringify(messageWithId);
        if (this._isConnected && this.ws) {
            try {
                this.ws.send(serialized);
                this.updateMetrics(true, 0);
            }
            catch (error) {
                this.emit('error', error);
                if (this.config.messageQueue?.enabled) {
                    this.queueMessage(serialized);
                }
                this.updateMetrics(false, 0);
                throw error;
            }
        }
        else if (this.config.messageQueue?.enabled) {
            this.queueMessage(serialized);
        }
        else {
            throw new Error('WebSocket not connected and queuing is disabled');
        }
    }
    get connectionUrl() {
        return this.config.url;
    }
    get queuedMessages() {
        return this.messageQueue.length;
    }
    get readyState() {
        return this.ws?.readyState || WebSocket.CLOSED;
    }
    get connectionId() {
        return this._connectionId;
    }
    buildConnectionUrl() {
        let url = this.config.url;
        if (this.config.authentication?.query) {
            const params = new URLSearchParams(this.config.authentication.query);
            const separator = url.includes('?') ? '&' : '?';
            url += separator + params.toString();
        }
        if (this.config.authentication?.type === 'query' &&
            this.config.authentication.token) {
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}token=${this.config.authentication.token}`;
        }
        return url;
    }
    handleMessage(event) {
        try {
            let data;
            if (typeof event.data === 'string') {
                try {
                    data = JSON.parse(event.data);
                }
                catch {
                    data = event.data;
                }
            }
            else {
                data = event.data;
            }
            if (this.isHeartbeatResponse(data)) {
                this.emit('heartbeat', data);
                return;
            }
            this.emit('message', data, {
                messageType: typeof event.data === 'string' ? 'text' : 'binary',
                timestamp: Date.now(),
                connectionId: this._connectionId,
            });
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    async sendRequest(method, endpoint, data, options) {
        const requestId = this.generateMessageId();
        const startTime = Date.now();
        const requestMessage = {
            id: requestId,
            type: 'request',
            data: {
                method,
                endpoint,
                body: data,
                headers: options?.headers,
            },
            timestamp: startTime,
        };
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.off(`response:${requestId}`, responseHandler);
                reject(new Error('Request timeout'));
            }, options?.timeout || this.config.timeout || 30000);
            const responseHandler = (responseData) => {
                clearTimeout(timeout);
                const duration = Date.now() - startTime;
                resolve({
                    data: responseData?.data,
                    status: responseData?.status || 200,
                    statusText: responseData?.statusText || 'OK',
                    headers: responseData?.headers || {},
                    config: options || {},
                    metadata: {
                        requestId,
                        duration,
                        connectionId: this._connectionId,
                        messageType: 'response',
                    },
                });
            };
            this.once(`response:${requestId}`, responseHandler);
            this.sendMessage(requestMessage).catch(reject);
        });
    }
    queueMessage(message) {
        if (!this.config.messageQueue?.enabled)
            return;
        this.messageQueue.push(message);
        const maxSize = this.config.messageQueue.maxSize || 1000;
        if (this.messageQueue.length > maxSize) {
            this.messageQueue.shift();
        }
    }
    flushMessageQueue() {
        if (!this.config.messageQueue?.enabled)
            return;
        while (this.messageQueue.length > 0 && this._isConnected) {
            const message = this.messageQueue.shift();
            if (message) {
                try {
                    this.ws?.send(message);
                }
                catch (error) {
                    this.emit('error', error);
                    this.messageQueue.unshift(message);
                    break;
                }
            }
        }
    }
    shouldReconnect(event) {
        return (this.config.reconnection?.enabled === true &&
            this.reconnectAttempts < (this.config.reconnection.maxAttempts || 10) &&
            event.code !== 1000);
    }
    scheduleReconnect() {
        if (!this.config.reconnection?.enabled)
            return;
        const baseInterval = this.config.reconnection.interval || 1000;
        const maxInterval = this.config.reconnection.maxInterval || 30000;
        let delay;
        if (this.config.reconnection.backoff === 'exponential') {
            delay = Math.min(baseInterval * 2 ** this.reconnectAttempts, maxInterval);
        }
        else {
            delay = baseInterval;
        }
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectAttempts++;
            this.emit('reconnecting', this.reconnectAttempts);
            try {
                await this.connect();
                this.emit('reconnected');
            }
            catch (error) {
                this.emit('reconnectError', error);
                if (this.reconnectAttempts < (this.config.reconnection?.maxAttempts || 10)) {
                    this.scheduleReconnect();
                }
                else {
                    this.emit('reconnectFailed');
                }
            }
        }, delay);
    }
    startHeartbeat() {
        if (!this.config.heartbeat?.enabled)
            return;
        const interval = this.config.heartbeat.interval || 30000;
        const message = this.config.heartbeat.message || { type: 'ping' };
        this.heartbeatTimer = setInterval(() => {
            if (this._isConnected && this.ws) {
                try {
                    this.ws.send(JSON.stringify(message));
                }
                catch (error) {
                    this.emit('error', error);
                }
            }
        }, interval);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    isHeartbeatResponse(data) {
        return (data &&
            (data.type === 'pong' ||
                data.type === 'heartbeat' ||
                data.type === 'ping'));
    }
    async measurePingTime() {
        if (!this._isConnected)
            return -1;
        return new Promise((resolve) => {
            const startTime = Date.now();
            const pingId = this.generateMessageId();
            const pongHandler = (data) => {
                if (data.id === pingId) {
                    const responseTime = Date.now() - startTime;
                    this.off('message', pongHandler);
                    resolve(responseTime);
                }
            };
            this.on('message', pongHandler);
            this.send({ type: 'ping', id: pingId });
            setTimeout(() => {
                this.off('message', pongHandler);
                resolve(-1);
            }, 5000);
        });
    }
    calculateErrorRate() {
        if (this.metrics.requestCount === 0)
            return 0;
        return this.metrics.errorCount / this.metrics.requestCount;
    }
    generateConnectionId() {
        return `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateMessageId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    initializeMetrics() {
        return {
            name: this.name,
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            p95Latency: 0,
            p99Latency: 0,
            throughput: 0,
            timestamp: new Date(),
        };
    }
    updateMetrics(success, duration) {
        this.metrics.requestCount++;
        if (success) {
            this.metrics.successCount++;
        }
        else {
            this.metrics.errorCount++;
        }
        if (duration > 0) {
            const totalLatency = this.metrics.averageLatency * (this.metrics.requestCount - 1);
            this.metrics.averageLatency =
                (totalLatency + duration) / this.metrics.requestCount;
        }
        const uptime = (Date.now() - this.startTime) / 1000;
        this.metrics.throughput = this.metrics.requestCount / Math.max(uptime, 1);
    }
}
export class WebSocketClientFactory {
    clients = new Map();
    async create(config) {
        const client = new WebSocketClientAdapter(config);
        await client.connect();
        return client;
    }
    async createMultiple(configs) {
        return Promise.all(configs.map((config) => this.create(config)));
    }
    get(name) {
        return this.clients.get(name);
    }
    list() {
        return Array.from(this.clients.values());
    }
    has(name) {
        return this.clients.has(name);
    }
    async remove(name) {
        const client = this.clients.get(name);
        if (client) {
            await client.destroy();
            this.clients.delete(name);
            return true;
        }
        return false;
    }
    async healthCheckAll() {
        const results = new Map();
        for (const [name, client] of this.clients) {
            try {
                const status = await client.healthCheck();
                results?.set(name, status);
            }
            catch (error) {
                results?.set(name, {
                    name,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    responseTime: -1,
                    errorRate: 1,
                    uptime: 0,
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
            }
        }
        return results;
    }
    async getMetricsAll() {
        const results = new Map();
        for (const [name, client] of this.clients) {
            try {
                const metrics = await client.getMetrics();
                results?.set(name, metrics);
            }
            catch (_error) {
                results?.set(name, {
                    name,
                    requestCount: 0,
                    successCount: 0,
                    errorCount: 1,
                    averageLatency: -1,
                    p95Latency: -1,
                    p99Latency: -1,
                    throughput: 0,
                    timestamp: new Date(),
                });
            }
        }
        return results;
    }
    async shutdown() {
        const shutdownPromises = Array.from(this.clients.values()).map((client) => client.destroy().catch((error) => {
            logger.error(`Error shutting down WebSocket client:`, error);
        }));
        await Promise.all(shutdownPromises);
        this.clients.clear();
    }
    getActiveCount() {
        return this.clients.size;
    }
}
export async function createWebSocketClient(config) {
    const factory = new WebSocketClientFactory();
    return await factory.create(config);
}
export default WebSocketClientAdapter;
//# sourceMappingURL=websocket-client-adapter.js.map