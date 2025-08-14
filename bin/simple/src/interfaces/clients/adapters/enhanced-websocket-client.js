import { EventEmitter } from 'node:events';
export class EnhancedWebSocketClient extends EventEmitter {
    config;
    name;
    url;
    options;
    ws = null;
    messageQueue = [];
    reconnectTimer = null;
    heartbeatTimer = null;
    _isConnected = false;
    reconnectAttempts = 0;
    connectionId;
    metrics;
    startTime;
    connectionInfo;
    constructor(urlOrConfig, legacyOptions) {
        super();
        if (typeof urlOrConfig === 'string') {
            this.url = urlOrConfig;
            this.options = {
                reconnect: true,
                reconnectInterval: 1000,
                maxReconnectAttempts: 10,
                timeout: 30000,
                ...legacyOptions,
            };
            this.config = this.convertLegacyToUACL(urlOrConfig, this.options);
            this.name = `ws-client-${Date.now()}`;
        }
        else {
            this.config = {
                timeout: 30000,
                reconnection: {
                    enabled: true,
                    maxAttempts: 10,
                    initialDelay: 1000,
                    maxDelay: 30000,
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
                ...urlOrConfig,
            };
            this.url = this.config.url;
            this.name = this.config.name || `ws-client-${Date.now()}`;
            this.options = this.convertUACLToLegacy(this.config);
        }
        this.connectionId = this.generateConnectionId();
        this.startTime = Date.now();
        this.metrics = this.initializeMetrics();
        this.connectionInfo = this.initializeConnectionInfo();
    }
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                const timeout = setTimeout(() => {
                    reject(new Error('WebSocket connection timeout'));
                }, this.options.timeout);
                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    this._isConnected = true;
                    this.reconnectAttempts = 0;
                    this.connectionId = this.generateConnectionId();
                    this.connectionInfo.connectTime = new Date();
                    this.connectionInfo.readyState = (this.ws?.readyState ??
                        WebSocket.CLOSED);
                    this.emit('connected');
                    this.emit('connect');
                    this.startHeartbeat();
                    this.flushMessageQueue();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    this.handleMessage(event);
                };
                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    this._isConnected = false;
                    this.connectionInfo.readyState = (this.ws?.readyState ??
                        WebSocket.CLOSED);
                    this.stopHeartbeat();
                    this.emit('disconnected', event.code, event.reason);
                    this.emit('disconnect', event.code, event.reason);
                    if (this.options.reconnect &&
                        this.reconnectAttempts < this.options.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    }
                };
                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    this.connectionInfo.errors.push({
                        timestamp: new Date(),
                        error: error.toString(),
                        code: 'CONNECTION_ERROR',
                    });
                    this.emit('error', error);
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
                connectionId: this.connectionId,
                readyState: (this.ws?.readyState ??
                    WebSocket.CLOSED),
                queuedMessages: this.messageQueue.length,
                reconnectAttempts: this.reconnectAttempts,
                url: this.url,
                protocol: this.ws?.protocol,
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
        this.options = this.convertUACLToLegacy(this.config);
        this.emit('config-updated', this.config);
    }
    on(event, handler) {
        return super.on(event, handler);
    }
    off(event, handler) {
        if (handler) {
            return super.off(event, handler);
        }
        super.removeAllListeners(event);
        return this;
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
                this.connectionInfo.messagesSent++;
                this.connectionInfo.bytesSent += message.length;
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
    get connected() {
        return this._isConnected;
    }
    get connectionUrl() {
        return this.url;
    }
    get queuedMessages() {
        return this.messageQueue.length;
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
                this.connectionInfo.messagesSent++;
                this.connectionInfo.bytesSent += serialized.length;
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
    getConnectionInfo() {
        return {
            ...this.connectionInfo,
            readyState: (this.ws?.readyState ??
                WebSocket.CLOSED),
            bufferedAmount: this.ws?.bufferedAmount || 0,
            lastActivity: new Date(),
        };
    }
    async getWebSocketMetrics() {
        return {
            connectionsOpened: 1,
            connectionsClosed: 0,
            connectionsActive: this._isConnected ? 1 : 0,
            connectionDuration: Date.now() - this.startTime,
            messagesSent: this.connectionInfo.messagesSent,
            messagesReceived: this.connectionInfo.messagesReceived,
            messagesSentPerSecond: this.connectionInfo.messagesSent /
                ((Date.now() - this.startTime) / 1000),
            messagesReceivedPerSecond: this.connectionInfo.messagesReceived /
                ((Date.now() - this.startTime) / 1000),
            bytesSent: this.connectionInfo.bytesSent,
            bytesReceived: this.connectionInfo.bytesReceived,
            bytesSentPerSecond: this.connectionInfo.bytesSent / ((Date.now() - this.startTime) / 1000),
            bytesReceivedPerSecond: this.connectionInfo.bytesReceived /
                ((Date.now() - this.startTime) / 1000),
            averageLatency: this.connectionInfo.latency || 0,
            p95Latency: this.connectionInfo.latency || 0,
            p99Latency: this.connectionInfo.latency || 0,
            packetLoss: this.connectionInfo.packetLoss || 0,
            connectionErrors: this.connectionInfo.errors.length,
            messageErrors: 0,
            timeoutErrors: 0,
            authenticationErrors: 0,
            messagesQueued: this.messageQueue.length,
            queueSize: this.messageQueue.length,
            queueOverflows: 0,
            timestamp: new Date(),
        };
    }
    get readyState() {
        return this.ws?.readyState || WebSocket.CLOSED;
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
            this.connectionInfo.messagesReceived++;
            this.connectionInfo.lastActivity = new Date();
            if (typeof event.data === 'string') {
                this.connectionInfo.bytesReceived += event.data.length;
            }
            if (this.isHeartbeatResponse(data)) {
                this.emit('heartbeat', data);
                return;
            }
            if (data?.id && data.type === 'response') {
                this.emit(`response:${data?.correlationId || data?.id}`, data);
                return;
            }
            this.emit('message', data);
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
                        connectionId: this.connectionId,
                        messageType: 'response',
                    },
                });
            };
            this.once(`response:${requestId}`, responseHandler);
            this.sendMessage(requestMessage).catch(reject);
        });
    }
    queueMessage(message) {
        this.messageQueue.push(message);
        const maxSize = this.options.maxReconnectAttempts || 1000;
        if (this.messageQueue.length > maxSize) {
            this.messageQueue.shift();
        }
    }
    flushMessageQueue() {
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
    scheduleReconnect() {
        const delay = this.options.reconnectInterval * 2 ** this.reconnectAttempts;
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectAttempts++;
            this.emit('reconnecting', this.reconnectAttempts);
            this.emit('retry', this.reconnectAttempts);
            try {
                await this.connect();
            }
            catch (error) {
                this.emit('reconnectError', error);
                if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
                else {
                    this.emit('reconnectFailed');
                }
            }
        }, delay);
    }
    startHeartbeat() {
        const interval = this.config.heartbeat?.interval || 30000;
        const message = this.config.heartbeat?.message || { type: 'ping' };
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
        if (!this.isConnected)
            return -1;
        return new Promise((resolve) => {
            const startTime = Date.now();
            const pingId = this.generateMessageId();
            const pongHandler = (data) => {
                if (data.id === pingId) {
                    const responseTime = Date.now() - startTime;
                    this.off('message', pongHandler);
                    this.connectionInfo.latency = responseTime;
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
    initializeConnectionInfo() {
        return {
            id: this.connectionId,
            url: this.url,
            readyState: WebSocket.CLOSED,
            bufferedAmount: 0,
            connectTime: new Date(),
            lastActivity: new Date(),
            messagesSent: 0,
            messagesReceived: 0,
            bytesSent: 0,
            bytesReceived: 0,
            authenticated: false,
            errors: [],
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
    convertLegacyToUACL(url, options) {
        return {
            name: `ws-client-${Date.now()}`,
            baseURL: url,
            url: url,
            timeout: options?.timeout ?? undefined,
            reconnection: {
                enabled: options?.reconnect ?? true,
                maxAttempts: options?.maxReconnectAttempts ?? 10,
                initialDelay: options?.reconnectInterval ?? 1000,
                maxDelay: 30000,
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
        };
    }
    convertUACLToLegacy(config) {
        return {
            reconnect: true,
            reconnectInterval: config?.reconnection?.initialDelay || 1000,
            maxReconnectAttempts: config?.reconnection?.maxAttempts || 10,
            timeout: config?.timeout || 30000,
        };
    }
}
export { EnhancedWebSocketClient as WebSocketClient };
export default EnhancedWebSocketClient;
//# sourceMappingURL=enhanced-websocket-client.js.map