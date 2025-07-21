"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBus = void 0;
const type_guards_js_1 = require("../utils/type-guards.js");
/**
 * Advanced messaging and communication layer for swarm coordination
 */
const node_events_1 = require("node:events");
const helpers_js_1 = require("../utils/helpers.js");
/**
 * Advanced message bus with support for multiple communication patterns
 */
class MessageBus extends node_events_1.EventEmitter {
    constructor(config, logger, eventBus) {
        super();
        // Core messaging components
        this.channels = new Map();
        this.queues = new Map();
        this.subscriptions = new Map();
        this.routingRules = new Map();
        // Message tracking
        this.messageStore = new Map();
        this.deliveryReceipts = new Map();
        this.acknowledgments = new Map();
        this.logger = logger;
        this.eventBus = eventBus;
        this.config = {
            strategy: 'event-driven',
            enablePersistence: true,
            enableReliability: true,
            enableOrdering: false,
            enableFiltering: true,
            maxMessageSize: 1024 * 1024, // 1MB
            maxQueueSize: 10000,
            messageRetention: 86400000, // 24 hours
            acknowledgmentTimeout: 30000,
            retryAttempts: 3,
            backoffMultiplier: 2,
            compressionEnabled: false,
            encryptionEnabled: false,
            metricsEnabled: true,
            debugMode: false,
            ...config
        };
        this.router = new MessageRouter(this.config, this.logger);
        this.deliveryManager = new DeliveryManager(this.config, this.logger);
        this.retryManager = new RetryManager(this.config, this.logger);
        this.metrics = new MessageBusMetrics();
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.eventBus.on('agent:connected', (data) => {
            if ((0, type_guards_js_1.hasAgentId)(data)) {
                this.handleAgentConnected(data.agentId);
            }
        });
        this.eventBus.on('agent:disconnected', (data) => {
            if ((0, type_guards_js_1.hasAgentId)(data)) {
                this.handleAgentDisconnected(data.agentId);
            }
        });
        this.deliveryManager.on('delivery:success', (data) => {
            this.handleDeliverySuccess(data);
        });
        this.deliveryManager.on('delivery:failure', (data) => {
            this.handleDeliveryFailure(data);
        });
        this.retryManager.on('retry:exhausted', (data) => {
            this.handleRetryExhausted(data);
        });
    }
    async initialize() {
        this.logger.info('Initializing message bus', {
            strategy: this.config.strategy,
            persistence: this.config.enablePersistence,
            reliability: this.config.enableReliability
        });
        // Initialize components
        await this.router.initialize();
        await this.deliveryManager.initialize();
        await this.retryManager.initialize();
        // Create default channels
        await this.createDefaultChannels();
        // Start metrics collection
        if (this.config.metricsEnabled) {
            this.startMetricsCollection();
        }
        this.emit('messagebus:initialized');
    }
    async shutdown() {
        this.logger.info('Shutting down message bus');
        // Stop metrics collection
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        // Shutdown components
        await this.retryManager.shutdown();
        await this.deliveryManager.shutdown();
        await this.router.shutdown();
        // Persist any remaining messages if enabled
        if (this.config.enablePersistence) {
            await this.persistMessages();
        }
        this.emit('messagebus:shutdown');
    }
    // === MESSAGE OPERATIONS ===
    async sendMessage(type, content, sender, receivers, options = {}) {
        const messageId = (0, helpers_js_1.generateId)('msg');
        const now = new Date();
        const receiversArray = Array.isArray(receivers) ? receivers : [receivers];
        const message = {
            id: messageId,
            type,
            sender,
            receivers: receiversArray,
            content: await this.processContent(content),
            metadata: {
                correlationId: options.correlationId,
                replyTo: options.replyTo,
                ttl: options.ttl,
                compressed: this.config.compressionEnabled,
                encrypted: this.config.encryptionEnabled,
                size: this.calculateSize(content),
                contentType: this.detectContentType(content),
                encoding: 'utf-8',
                route: [sender.id]
            },
            timestamp: now,
            expiresAt: options.ttl ? new Date(now.getTime() + options.ttl) : undefined,
            priority: options.priority || 'normal',
            reliability: options.reliability || 'best-effort'
        };
        // Validate message
        this.validateMessage(message);
        // Store message if persistence is enabled
        if (this.config.enablePersistence) {
            this.messageStore.set(messageId, message);
        }
        // Route and deliver message
        await this.routeMessage(message, options.channel);
        this.metrics.recordMessageSent(message);
        this.logger.debug('Message sent', {
            messageId,
            type,
            sender: sender.id,
            receivers: receiversArray.map(r => r.id),
            size: message.metadata.size
        });
        this.emit('message:sent', { message });
        return messageId;
    }
    async broadcastMessage(type, content, sender, options = {}) {
        const channel = options.channel ?
            this.channels.get(options.channel) :
            this.getDefaultBroadcastChannel();
        if (!channel) {
            throw new Error('No broadcast channel available');
        }
        // Get all participants as receivers
        let receivers = channel.participants.filter(p => p.id !== sender.id);
        // Apply filter if provided
        if (options.filter) {
            receivers = await this.filterReceivers(receivers, options.filter, { type, content });
        }
        return this.sendMessage(type, content, sender, receivers, {
            priority: options.priority,
            ttl: options.ttl,
            channel: channel.id
        });
    }
    async subscribeToTopic(topic, subscriber, options = {}) {
        const subscriptionId = (0, helpers_js_1.generateId)('sub');
        const subscription = {
            id: subscriptionId,
            topic,
            subscriber,
            filter: options.filter,
            ackRequired: options.ackRequired || false,
            qos: options.qos || 0,
            createdAt: new Date()
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.logger.info('Topic subscription created', {
            subscriptionId,
            topic,
            subscriber: subscriber.id,
            qos: subscription.qos
        });
        this.emit('subscription:created', { subscription });
        return subscriptionId;
    }
    async unsubscribeFromTopic(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error(`Subscription ${subscriptionId} not found`);
        }
        this.subscriptions.delete(subscriptionId);
        this.logger.info('Topic subscription removed', {
            subscriptionId,
            topic: subscription.topic,
            subscriber: subscription.subscriber.id
        });
        this.emit('subscription:removed', { subscription });
    }
    async acknowledgeMessage(messageId, agentId) {
        const message = this.messageStore.get(messageId);
        if (!message) {
            throw new Error(`Message ${messageId} not found`);
        }
        const ack = {
            messageId,
            agentId,
            timestamp: new Date(),
            status: 'acknowledged'
        };
        this.acknowledgments.set(`${messageId}:${agentId.id}`, ack);
        this.logger.debug('Message acknowledged', {
            messageId,
            agentId: agentId.id
        });
        this.emit('message:acknowledged', { messageId, agentId });
        // Check if all receivers have acknowledged
        this.checkAllAcknowledgments(message);
    }
    // === CHANNEL MANAGEMENT ===
    async createChannel(name, type, config = {}) {
        const channelId = (0, helpers_js_1.generateId)('channel');
        const channel = {
            id: channelId,
            name,
            type,
            participants: [],
            config: {
                persistent: true,
                ordered: false,
                reliable: true,
                maxParticipants: 1000,
                maxMessageSize: this.config.maxMessageSize,
                maxQueueDepth: this.config.maxQueueSize,
                retentionPeriod: this.config.messageRetention,
                accessControl: {
                    readPermission: 'participants',
                    writePermission: 'participants',
                    adminPermission: 'creator',
                    allowedSenders: [],
                    allowedReceivers: [],
                    bannedAgents: []
                },
                ...config
            },
            statistics: this.createChannelStatistics(),
            filters: [],
            middleware: []
        };
        this.channels.set(channelId, channel);
        this.logger.info('Channel created', {
            channelId,
            name,
            type,
            config: channel.config
        });
        this.emit('channel:created', { channel });
        return channelId;
    }
    async joinChannel(channelId, agentId) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            throw new Error(`Channel ${channelId} not found`);
        }
        // Check access permissions
        if (!this.canJoinChannel(channel, agentId)) {
            throw new Error(`Agent ${agentId.id} not allowed to join channel ${channelId}`);
        }
        // Check capacity
        if (channel.participants.length >= channel.config.maxParticipants) {
            throw new Error(`Channel ${channelId} is at capacity`);
        }
        // Add participant if not already present
        if (!channel.participants.some(p => p.id === agentId.id)) {
            channel.participants.push(agentId);
            channel.statistics.participantCount = channel.participants.length;
        }
        this.logger.info('Agent joined channel', {
            channelId,
            agentId: agentId.id,
            participantCount: channel.participants.length
        });
        this.emit('channel:joined', { channelId, agentId });
    }
    async leaveChannel(channelId, agentId) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            throw new Error(`Channel ${channelId} not found`);
        }
        // Remove participant
        channel.participants = channel.participants.filter(p => p.id !== agentId.id);
        channel.statistics.participantCount = channel.participants.length;
        this.logger.info('Agent left channel', {
            channelId,
            agentId: agentId.id,
            participantCount: channel.participants.length
        });
        this.emit('channel:left', { channelId, agentId });
    }
    // === QUEUE MANAGEMENT ===
    async createQueue(name, type, config = {}) {
        const queueId = (0, helpers_js_1.generateId)('queue');
        const queue = {
            id: queueId,
            name,
            type,
            messages: [],
            config: {
                maxSize: this.config.maxQueueSize,
                persistent: this.config.enablePersistence,
                ordered: this.config.enableOrdering,
                durability: 'memory',
                deliveryMode: 'at-least-once',
                retryPolicy: {
                    maxAttempts: this.config.retryAttempts,
                    initialDelay: 1000,
                    maxDelay: 30000,
                    backoffMultiplier: this.config.backoffMultiplier,
                    jitter: true
                },
                ...config
            },
            subscribers: [],
            statistics: this.createQueueStatistics()
        };
        this.queues.set(queueId, queue);
        this.logger.info('Queue created', {
            queueId,
            name,
            type,
            config: queue.config
        });
        this.emit('queue:created', { queue });
        return queueId;
    }
    async enqueueMessage(queueId, message) {
        const queue = this.queues.get(queueId);
        if (!queue) {
            throw new Error(`Queue ${queueId} not found`);
        }
        // Check queue capacity
        if (queue.messages.length >= queue.config.maxSize) {
            if (queue.config.deadLetterQueue) {
                await this.sendToDeadLetterQueue(queue.config.deadLetterQueue, message, 'queue_full');
                return;
            }
            else {
                throw new Error(`Queue ${queueId} is full`);
            }
        }
        // Insert message based on queue type
        this.insertMessageInQueue(queue, message);
        queue.statistics.depth = queue.messages.length;
        queue.statistics.enqueueRate++;
        this.logger.debug('Message enqueued', {
            queueId,
            messageId: message.id,
            queueDepth: queue.messages.length
        });
        this.emit('message:enqueued', { queueId, message });
        // Process queue for delivery
        await this.processQueue(queue);
    }
    async dequeueMessage(queueId, subscriberId) {
        const queue = this.queues.get(queueId);
        if (!queue) {
            throw new Error(`Queue ${queueId} not found`);
        }
        const subscriber = queue.subscribers.find(s => s.id === subscriberId);
        if (!subscriber) {
            throw new Error(`Subscriber ${subscriberId} not found in queue ${queueId}`);
        }
        // Find next eligible message
        let message = null;
        let messageIndex = -1;
        for (let i = 0; i < queue.messages.length; i++) {
            const msg = queue.messages[i];
            // Check if message matches subscriber filter
            if (subscriber.filter && !this.matchesFilter(msg, subscriber.filter)) {
                continue;
            }
            message = msg;
            messageIndex = i;
            break;
        }
        if (!message) {
            return null;
        }
        // Remove message from queue (for at-least-once, remove after ack)
        if (queue.config.deliveryMode === 'at-most-once') {
            queue.messages.splice(messageIndex, 1);
        }
        queue.statistics.depth = queue.messages.length;
        queue.statistics.dequeueRate++;
        subscriber.lastActivity = new Date();
        this.logger.debug('Message dequeued', {
            queueId,
            messageId: message.id,
            subscriberId,
            queueDepth: queue.messages.length
        });
        this.emit('message:dequeued', { queueId, message, subscriberId });
        return message;
    }
    // === ROUTING AND DELIVERY ===
    async routeMessage(message, preferredChannel) {
        // Apply routing rules
        const route = await this.router.calculateRoute(message, preferredChannel);
        // Update message route
        message.metadata.route = [...(message.metadata.route || []), ...route.hops];
        // Deliver to targets
        for (const target of route.targets) {
            await this.deliverMessage(message, target);
        }
    }
    async deliverMessage(message, target) {
        try {
            await this.deliveryManager.deliver(message, target);
            this.metrics.recordDeliverySuccess(message);
        }
        catch (error) {
            this.metrics.recordDeliveryFailure(message);
            // Handle delivery failure based on reliability level
            if (message.reliability !== 'best-effort') {
                await this.retryManager.scheduleRetry(message, target, error);
            }
        }
    }
    // === UTILITY METHODS ===
    validateMessage(message) {
        if (message.metadata.size > this.config.maxMessageSize) {
            throw new Error(`Message size ${message.metadata.size} exceeds limit ${this.config.maxMessageSize}`);
        }
        if (message.expiresAt && message.expiresAt <= new Date()) {
            throw new Error('Message has already expired');
        }
        if (message.receivers.length === 0) {
            throw new Error('Message must have at least one receiver');
        }
    }
    async processContent(content) {
        let processed = content;
        // Compress if enabled
        if (this.config.compressionEnabled) {
            processed = await this.compress(processed);
        }
        // Encrypt if enabled
        if (this.config.encryptionEnabled) {
            processed = await this.encrypt(processed);
        }
        return processed;
    }
    calculateSize(content) {
        return JSON.stringify(content).length;
    }
    detectContentType(content) {
        if (typeof content === 'string')
            return 'text/plain';
        if (typeof content === 'object')
            return 'application/json';
        if (Buffer.isBuffer(content))
            return 'application/octet-stream';
        return 'application/unknown';
    }
    async filterReceivers(receivers, filter, context) {
        // Placeholder for receiver filtering logic
        return receivers;
    }
    canJoinChannel(channel, agentId) {
        const acl = channel.config.accessControl;
        // Check banned list
        if (acl.bannedAgents.some(banned => banned.id === agentId.id)) {
            return false;
        }
        // Check allowed list (if specified)
        if (acl.allowedSenders.length > 0) {
            return acl.allowedSenders.some(allowed => allowed.id === agentId.id);
        }
        return true;
    }
    matchesFilter(message, filter) {
        return filter.conditions.every(condition => {
            const fieldValue = this.getFieldValue(message, condition.field);
            return this.evaluateCondition(fieldValue, condition.operator, condition.value);
        });
    }
    getFieldValue(message, field) {
        const parts = field.split('.');
        let value = message;
        for (const part of parts) {
            value = value?.[part];
        }
        return value;
    }
    evaluateCondition(fieldValue, operator, compareValue) {
        switch (operator) {
            case 'eq': return fieldValue === compareValue;
            case 'ne': return fieldValue !== compareValue;
            case 'gt': return fieldValue > compareValue;
            case 'lt': return fieldValue < compareValue;
            case 'contains': return String(fieldValue).includes(String(compareValue));
            case 'matches': return new RegExp(compareValue).test(String(fieldValue));
            case 'in': return Array.isArray(compareValue) && compareValue.includes(fieldValue);
            default: return false;
        }
    }
    insertMessageInQueue(queue, message) {
        switch (queue.type) {
            case 'fifo':
                queue.messages.push(message);
                break;
            case 'lifo':
                queue.messages.unshift(message);
                break;
            case 'priority':
                this.insertByPriority(queue.messages, message);
                break;
            case 'delay':
                this.insertByTimestamp(queue.messages, message);
                break;
            default:
                queue.messages.push(message);
        }
    }
    insertByPriority(messages, message) {
        const priorityOrder = { 'critical': 0, 'high': 1, 'normal': 2, 'low': 3 };
        const messagePriority = priorityOrder[message.priority];
        let insertIndex = messages.length;
        for (let i = 0; i < messages.length; i++) {
            const currentPriority = priorityOrder[messages[i].priority];
            if (messagePriority < currentPriority) {
                insertIndex = i;
                break;
            }
        }
        messages.splice(insertIndex, 0, message);
    }
    insertByTimestamp(messages, message) {
        const targetTime = message.expiresAt || message.timestamp;
        let insertIndex = messages.length;
        for (let i = 0; i < messages.length; i++) {
            const currentTime = messages[i].expiresAt || messages[i].timestamp;
            if (targetTime <= currentTime) {
                insertIndex = i;
                break;
            }
        }
        messages.splice(insertIndex, 0, message);
    }
    async processQueue(queue) {
        // Process messages for subscribers
        for (const subscriber of queue.subscribers) {
            if (subscriber.prefetchCount > 0) {
                // Deliver up to prefetch count
                for (let i = 0; i < subscriber.prefetchCount; i++) {
                    const message = await this.dequeueMessage(queue.id, subscriber.id);
                    if (!message)
                        break;
                    await this.deliverMessageToSubscriber(message, subscriber);
                }
            }
        }
    }
    async deliverMessageToSubscriber(message, subscriber) {
        try {
            // Deliver message to subscriber
            this.emit('message:delivered', {
                message,
                subscriber: subscriber.agent
            });
            // Handle acknowledgment if required
            if (subscriber.ackMode === 'auto') {
                await this.acknowledgeMessage(message.id, subscriber.agent);
            }
        }
        catch (error) {
            this.logger.error('Failed to deliver message to subscriber', {
                messageId: message.id,
                subscriberId: subscriber.id,
                error
            });
        }
    }
    checkAllAcknowledgments(message) {
        const requiredAcks = message.receivers.length;
        const receivedAcks = message.receivers.filter(receiver => this.acknowledgments.has(`${message.id}:${receiver.id}`)).length;
        if (receivedAcks === requiredAcks) {
            this.emit('message:fully-acknowledged', { message });
            // Clean up acknowledgments
            message.receivers.forEach(receiver => {
                this.acknowledgments.delete(`${message.id}:${receiver.id}`);
            });
        }
    }
    async createDefaultChannels() {
        // System broadcast channel
        await this.createChannel('system-broadcast', 'broadcast', {
            persistent: true,
            reliable: true,
            maxParticipants: 10000
        });
        // Agent coordination channel
        await this.createChannel('agent-coordination', 'multicast', {
            persistent: true,
            reliable: true,
            ordered: true
        });
        // Task distribution channel
        await this.createChannel('task-distribution', 'topic', {
            persistent: true,
            reliable: false
        });
    }
    getDefaultBroadcastChannel() {
        return Array.from(this.channels.values())
            .find(channel => channel.type === 'broadcast');
    }
    createChannelStatistics() {
        return {
            messagesTotal: 0,
            messagesDelivered: 0,
            messagesFailed: 0,
            bytesTransferred: 0,
            averageLatency: 0,
            throughput: 0,
            errorRate: 0,
            participantCount: 0,
            lastActivity: new Date()
        };
    }
    createQueueStatistics() {
        return {
            depth: 0,
            enqueueRate: 0,
            dequeueRate: 0,
            throughput: 0,
            averageWaitTime: 0,
            subscriberCount: 0,
            deadLetterCount: 0
        };
    }
    startMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
        }, 10000); // Every 10 seconds
    }
    updateMetrics() {
        // Update channel statistics
        for (const channel of this.channels.values()) {
            // Calculate throughput, latency, etc.
            this.updateChannelStatistics(channel);
        }
        // Update queue statistics
        for (const queue of this.queues.values()) {
            this.updateQueueStatistics(queue);
        }
        // Emit metrics event
        this.emit('metrics:updated', { metrics: this.getMetrics() });
    }
    updateChannelStatistics(channel) {
        // Placeholder for channel statistics calculation
        channel.statistics.lastActivity = new Date();
    }
    updateQueueStatistics(queue) {
        // Placeholder for queue statistics calculation
        queue.statistics.depth = queue.messages.length;
    }
    handleAgentConnected(agentId) {
        this.logger.info('Agent connected to message bus', { agentId: agentId.id });
        this.emit('agent:connected', { agentId });
    }
    handleAgentDisconnected(agentId) {
        this.logger.info('Agent disconnected from message bus', { agentId: agentId.id });
        // Remove from all channels
        for (const channel of this.channels.values()) {
            channel.participants = channel.participants.filter(p => p.id !== agentId.id);
        }
        // Remove subscriptions
        for (const [subId, subscription] of this.subscriptions) {
            if (subscription.subscriber.id === agentId.id) {
                this.subscriptions.delete(subId);
            }
        }
        this.emit('agent:disconnected', { agentId });
    }
    handleDeliverySuccess(data) {
        this.metrics.recordDeliverySuccess(data.message);
    }
    handleDeliveryFailure(data) {
        this.metrics.recordDeliveryFailure(data.message);
    }
    handleRetryExhausted(data) {
        this.logger.error('Message delivery retry exhausted', {
            messageId: data.message.id,
            target: data.target
        });
        // Send to dead letter queue if configured
        this.sendToDeadLetterQueue('system-dlq', data.message, 'retry_exhausted');
    }
    async sendToDeadLetterQueue(queueId, message, reason) {
        try {
            message.metadata.deadLetterReason = reason;
            message.metadata.deadLetterTimestamp = new Date();
            await this.enqueueMessage(queueId, message);
        }
        catch (error) {
            this.logger.error('Failed to send message to dead letter queue', {
                messageId: message.id,
                queueId,
                reason,
                error
            });
        }
    }
    async compress(content) {
        // Placeholder for compression
        return content;
    }
    async encrypt(content) {
        // Placeholder for encryption
        return content;
    }
    async persistMessages() {
        // Placeholder for message persistence
        this.logger.info('Persisting messages', { count: this.messageStore.size });
    }
    // === PUBLIC API ===
    getChannel(channelId) {
        return this.channels.get(channelId);
    }
    getAllChannels() {
        return Array.from(this.channels.values());
    }
    getQueue(queueId) {
        return this.queues.get(queueId);
    }
    getAllQueues() {
        return Array.from(this.queues.values());
    }
    getSubscription(subscriptionId) {
        return this.subscriptions.get(subscriptionId);
    }
    getAllSubscriptions() {
        return Array.from(this.subscriptions.values());
    }
    getMetrics() {
        return {
            channels: this.channels.size,
            queues: this.queues.size,
            subscriptions: this.subscriptions.size,
            storedMessages: this.messageStore.size,
            deliveryReceipts: this.deliveryReceipts.size,
            acknowledgments: this.acknowledgments.size,
            busMetrics: this.metrics.getMetrics()
        };
    }
    getMessage(messageId) {
        return this.messageStore.get(messageId);
    }
    async addChannelFilter(channelId, filter) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            throw new Error(`Channel ${channelId} not found`);
        }
        channel.filters.push(filter);
        channel.filters.sort((a, b) => a.priority - b.priority);
    }
    async addChannelMiddleware(channelId, middleware) {
        const channel = this.channels.get(channelId);
        if (!channel) {
            throw new Error(`Channel ${channelId} not found`);
        }
        channel.middleware.push(middleware);
        channel.middleware.sort((a, b) => a.order - b.order);
    }
}
exports.MessageBus = MessageBus;
class MessageRouter {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    async initialize() {
        this.logger.debug('Message router initialized');
    }
    async shutdown() {
        this.logger.debug('Message router shutdown');
    }
    async calculateRoute(message, preferredChannel) {
        const targets = [];
        const hops = [];
        // Simple routing - direct to receivers
        for (const receiver of message.receivers) {
            targets.push({
                type: 'agent',
                id: receiver.id
            });
            hops.push(receiver.id);
        }
        return {
            targets,
            hops,
            cost: targets.length
        };
    }
}
class DeliveryManager extends node_events_1.EventEmitter {
    constructor(config, logger) {
        super();
        this.config = config;
        this.logger = logger;
    }
    async initialize() {
        this.logger.debug('Delivery manager initialized');
    }
    async shutdown() {
        this.logger.debug('Delivery manager shutdown');
    }
    async deliver(message, target) {
        // Simulate delivery
        this.logger.debug('Delivering message', {
            messageId: message.id,
            target: target.id,
            type: target.type
        });
        // Emit delivery success
        this.emit('delivery:success', { message, target });
    }
}
class RetryManager extends node_events_1.EventEmitter {
    constructor(config, logger) {
        super();
        this.config = config;
        this.logger = logger;
        this.retryQueue = [];
    }
    async initialize() {
        this.startRetryProcessor();
        this.logger.debug('Retry manager initialized');
    }
    async shutdown() {
        if (this.retryInterval) {
            clearInterval(this.retryInterval);
        }
        this.logger.debug('Retry manager shutdown');
    }
    async scheduleRetry(message, target, error) {
        const existingEntry = this.retryQueue.find(entry => entry.message.id === message.id && entry.target.id === target.id);
        if (existingEntry) {
            existingEntry.attempts++;
        }
        else {
            this.retryQueue.push({ message, target, attempts: 1 });
        }
        this.logger.debug('Retry scheduled', {
            messageId: message.id,
            target: target.id,
            error: (error instanceof Error ? error.message : String(error))
        });
    }
    startRetryProcessor() {
        this.retryInterval = setInterval(() => {
            this.processRetries();
        }, 5000); // Process retries every 5 seconds
    }
    async processRetries() {
        const now = Date.now();
        const toRetry = this.retryQueue.filter(entry => {
            const delay = this.calculateDelay(entry.attempts);
            return now >= entry.message.timestamp.getTime() + delay;
        });
        for (const entry of toRetry) {
            if (entry.attempts >= this.config.retryAttempts) {
                // Remove from retry queue and emit exhausted event
                this.retryQueue = this.retryQueue.filter(r => r !== entry);
                this.emit('retry:exhausted', entry);
            }
            else {
                // Retry delivery
                try {
                    // Simulate retry delivery
                    this.logger.debug('Retrying message delivery', {
                        messageId: entry.message.id,
                        attempt: entry.attempts
                    });
                    // Remove from retry queue on success
                    this.retryQueue = this.retryQueue.filter(r => r !== entry);
                }
                catch (error) {
                    // Keep in retry queue for next attempt
                    this.logger.warn('Retry attempt failed', {
                        messageId: entry.message.id,
                        attempt: entry.attempts,
                        error: (error instanceof Error ? error.message : String(error))
                    });
                }
            }
        }
    }
    calculateDelay(attempts) {
        const baseDelay = 1000; // 1 second
        return Math.min(baseDelay * Math.pow(this.config.backoffMultiplier, attempts - 1), 30000 // Max 30 seconds
        );
    }
}
class MessageBusMetrics {
    constructor() {
        this.messagesSent = 0;
        this.messagesDelivered = 0;
        this.messagesFailed = 0;
        this.bytesTransferred = 0;
        this.deliveryLatencies = [];
    }
    recordMessageSent(message) {
        this.messagesSent++;
        this.bytesTransferred += message.metadata.size;
    }
    recordDeliverySuccess(message) {
        this.messagesDelivered++;
        const latency = Date.now() - message.timestamp.getTime();
        this.deliveryLatencies.push(latency);
        // Keep only last 1000 latencies
        if (this.deliveryLatencies.length > 1000) {
            this.deliveryLatencies.shift();
        }
    }
    recordDeliveryFailure(message) {
        this.messagesFailed++;
    }
    getMetrics() {
        const avgLatency = this.deliveryLatencies.length > 0 ?
            this.deliveryLatencies.reduce((sum, lat) => sum + lat, 0) / this.deliveryLatencies.length : 0;
        return {
            messagesSent: this.messagesSent,
            messagesDelivered: this.messagesDelivered,
            messagesFailed: this.messagesFailed,
            bytesTransferred: this.bytesTransferred,
            averageLatency: avgLatency,
            successRate: this.messagesSent > 0 ? (this.messagesDelivered / this.messagesSent) * 100 : 100
        };
    }
}
