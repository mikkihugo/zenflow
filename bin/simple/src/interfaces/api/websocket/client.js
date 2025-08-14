import { EventEmitter } from 'node:events';
export class WebSocketClient extends EventEmitter {
    url;
    options;
    ws = null;
    messageQueue = [];
    reconnectTimer = null;
    heartbeatTimer = null;
    isConnected = false;
    reconnectAttempts = 0;
    constructor(url, options = {}) {
        super();
        this.url = url;
        this.options = {
            reconnect: true,
            reconnectInterval: 1000,
            maxReconnectAttempts: 10,
            timeout: 30000,
            ...options,
        };
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
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.emit('connected');
                    this.startHeartbeat();
                    this.flushMessageQueue();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event['data']);
                        this.emit('message', data);
                    }
                    catch {
                        this.emit('message', event['data']);
                    }
                };
                this.ws.onclose = (event) => {
                    clearTimeout(timeout);
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.emit('disconnected', event['code'], event['reason']);
                    if (this.options.reconnect &&
                        this.reconnectAttempts < this.options.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    }
                };
                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    this.emit('error', error);
                    reject(error);
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.stopHeartbeat();
        if (this.ws && this.isConnected) {
            this.ws.close();
        }
        this.isConnected = false;
    }
    send(data) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        if (this.isConnected && this.ws) {
            try {
                this.ws.send(message);
            }
            catch (error) {
                this.emit('error', error);
                this.queueMessage(message);
            }
        }
        else {
            this.queueMessage(message);
        }
    }
    queueMessage(message) {
        this.messageQueue.push(message);
        if (this.messageQueue.length > 1000) {
            this.messageQueue.shift();
        }
    }
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
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
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected && this.ws) {
                try {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                }
                catch (error) {
                    this.emit('error', error);
                }
            }
        }, 30000);
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
    get connected() {
        return this.isConnected;
    }
    get connectionUrl() {
        return this.url;
    }
    get queuedMessages() {
        return this.messageQueue.length;
    }
}
export default WebSocketClient;
//# sourceMappingURL=client.js.map