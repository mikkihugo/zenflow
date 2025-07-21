"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRouter = void 0;
/**
 * Inter-agent messaging system
 */
const types_js_1 = require("../utils/types.js");
const helpers_js_1 = require("../utils/helpers.js");
/**
 * Message router for inter-agent communication
 */
class MessageRouter {
    constructor(config, eventBus, logger) {
        this.config = config;
        this.eventBus = eventBus;
        this.logger = logger;
        this.queues = new Map(); // agentId -> queue
        this.pendingResponses = new Map();
        this.messageCount = 0;
    }
    async initialize() {
        this.logger.info('Initializing message router');
        // Set up periodic cleanup
        setInterval(() => this.cleanup(), 60000); // Every minute
    }
    async shutdown() {
        this.logger.info('Shutting down message router');
        // Reject all pending responses
        for (const [id, pending] of this.pendingResponses) {
            pending.reject(new Error('Message router shutdown'));
            clearTimeout(pending.timeout);
        }
        this.queues.clear();
        this.pendingResponses.clear();
    }
    async send(from, to, payload) {
        const message = {
            id: (0, helpers_js_1.generateId)('msg'),
            type: 'agent-message',
            payload,
            timestamp: new Date(),
            priority: 0,
        };
        await this.sendMessage(from, to, message);
    }
    async sendWithResponse(from, to, payload, timeoutMs) {
        const message = {
            id: (0, helpers_js_1.generateId)('msg'),
            type: 'agent-request',
            payload,
            timestamp: new Date(),
            priority: 1,
        };
        // Create response promise
        const responsePromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingResponses.delete(message.id);
                reject(new Error(`Message response timeout: ${message.id}`));
            }, timeoutMs || this.config.messageTimeout);
            this.pendingResponses.set(message.id, {
                resolve: resolve,
                reject,
                timeout: timeout,
            });
        });
        // Send message
        await this.sendMessage(from, to, message);
        // Wait for response
        return await responsePromise;
    }
    async broadcast(from, payload) {
        const message = {
            id: (0, helpers_js_1.generateId)('broadcast'),
            type: 'broadcast',
            payload,
            timestamp: new Date(),
            priority: 0,
        };
        // Send to all agents
        const agents = Array.from(this.queues.keys()).filter(id => id !== from);
        await Promise.all(agents.map(to => this.sendMessage(from, to, message)));
    }
    subscribe(agentId, handler) {
        const queue = this.ensureQueue(agentId);
        queue.handlers.set((0, helpers_js_1.generateId)('handler'), handler);
    }
    unsubscribe(agentId, handlerId) {
        const queue = this.queues.get(agentId);
        if (queue) {
            queue.handlers.delete(handlerId);
        }
    }
    async sendResponse(originalMessageId, response) {
        const pending = this.pendingResponses.get(originalMessageId);
        if (!pending) {
            this.logger.warn('No pending response found', { messageId: originalMessageId });
            return;
        }
        clearTimeout(pending.timeout);
        this.pendingResponses.delete(originalMessageId);
        pending.resolve(response);
    }
    async getHealthStatus() {
        const totalQueues = this.queues.size;
        let totalMessages = 0;
        let totalHandlers = 0;
        for (const queue of this.queues.values()) {
            totalMessages += queue.messages.length;
            totalHandlers += queue.handlers.size;
        }
        return {
            healthy: true,
            metrics: {
                activeQueues: totalQueues,
                pendingMessages: totalMessages,
                registeredHandlers: totalHandlers,
                pendingResponses: this.pendingResponses.size,
                totalMessagesSent: this.messageCount,
            },
        };
    }
    async sendMessage(from, to, message) {
        this.logger.debug('Sending message', {
            from,
            to,
            messageId: message.id,
            type: message.type,
        });
        // Ensure destination queue exists
        const queue = this.ensureQueue(to);
        // Add to queue
        queue.messages.push(message);
        this.messageCount++;
        // Emit event
        this.eventBus.emit(types_js_1.SystemEvents.MESSAGE_SENT, { from, to, message });
        // Process message immediately if handlers exist
        if (queue.handlers.size > 0) {
            await this.processMessage(to, message);
        }
    }
    async processMessage(agentId, message) {
        const queue = this.queues.get(agentId);
        if (!queue) {
            return;
        }
        // Remove message from queue
        const index = queue.messages.indexOf(message);
        if (index !== -1) {
            queue.messages.splice(index, 1);
        }
        // Call all handlers
        const handlers = Array.from(queue.handlers.values());
        await Promise.all(handlers.map(handler => {
            try {
                handler(message);
            }
            catch (error) {
                this.logger.error('Message handler error', {
                    agentId,
                    messageId: message.id,
                    error,
                });
            }
        }));
        // Emit received event
        this.eventBus.emit(types_js_1.SystemEvents.MESSAGE_RECEIVED, {
            from: '', // Would need to track this
            to: agentId,
            message,
        });
    }
    ensureQueue(agentId) {
        if (!this.queues.has(agentId)) {
            this.queues.set(agentId, {
                messages: [],
                handlers: new Map(),
            });
        }
        return this.queues.get(agentId);
    }
    async performMaintenance() {
        this.logger.debug('Performing message router maintenance');
        this.cleanup();
    }
    cleanup() {
        const now = Date.now();
        // Clean up old messages
        for (const [agentId, queue] of this.queues) {
            const filtered = queue.messages.filter(msg => {
                const age = now - msg.timestamp.getTime();
                const maxAge = msg.expiry
                    ? msg.expiry.getTime() - msg.timestamp.getTime()
                    : this.config.messageTimeout;
                if (age > maxAge) {
                    this.logger.warn('Dropping expired message', {
                        agentId,
                        messageId: msg.id,
                        age,
                    });
                    return false;
                }
                return true;
            });
            queue.messages = filtered;
            // Remove empty queues
            if (queue.messages.length === 0 && queue.handlers.size === 0) {
                this.queues.delete(agentId);
            }
        }
        // Clean up timed out responses
        for (const [id, pending] of this.pendingResponses) {
            // This is handled by the timeout, but double-check
            clearTimeout(pending.timeout);
            pending.reject(new Error('Response timeout during cleanup'));
        }
        this.pendingResponses.clear();
    }
}
exports.MessageRouter = MessageRouter;
