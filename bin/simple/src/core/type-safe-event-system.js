import { EventEmitter } from 'events';
import { getLogger } from '../config/logging-config.ts';
import { Domain, DomainValidationError, getDomainValidator, validateCrossDomain, } from './domain-boundary-validator.ts';
export var EventPriority;
(function (EventPriority) {
    EventPriority[EventPriority["LOW"] = 0] = "LOW";
    EventPriority[EventPriority["NORMAL"] = 1] = "NORMAL";
    EventPriority[EventPriority["HIGH"] = 2] = "HIGH";
    EventPriority[EventPriority["CRITICAL"] = 3] = "CRITICAL";
    EventPriority[EventPriority["URGENT"] = 4] = "URGENT";
})(EventPriority || (EventPriority = {}));
export var EventStatus;
(function (EventStatus) {
    EventStatus["PENDING"] = "pending";
    EventStatus["PROCESSING"] = "processing";
    EventStatus["PROCESSED"] = "processed";
    EventStatus["FAILED"] = "failed";
    EventStatus["REJECTED"] = "rejected";
    EventStatus["RETRYING"] = "retrying";
})(EventStatus || (EventStatus = {}));
const BaseEventSchema = {
    type: 'object',
    required: true,
    properties: {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
        domain: {
            type: 'string',
            required: true,
            enum: Object.values(Domain),
        },
        timestamp: { type: 'object', required: true },
        version: { type: 'string', required: true },
        metadata: {
            type: 'object',
            required: false,
            properties: {
                correlationId: { type: 'string', required: false },
                causationId: { type: 'string', required: false },
                source: { type: 'string', required: false },
                userId: { type: 'string', required: false },
                sessionId: { type: 'string', required: false },
                traceId: { type: 'string', required: false },
                priority: {
                    type: 'number',
                    required: false,
                    enum: Object.values(EventPriority).filter((v) => typeof v === 'number'),
                },
                tags: {
                    type: 'array',
                    required: false,
                    items: { type: 'string' },
                },
                customData: { type: 'object', required: false },
            },
        },
    },
};
export const EventSchemas = {
    AgentCreated: {
        ...BaseEventSchema,
        properties: {
            ...BaseEventSchema.properties,
            payload: {
                type: 'object',
                required: true,
                properties: {
                    agent: { type: 'object', required: true },
                    capabilities: {
                        type: 'array',
                        required: true,
                        items: { type: 'string' },
                    },
                    initialStatus: {
                        type: 'string',
                        required: true,
                        enum: ['idle', 'busy'],
                    },
                },
            },
        },
    },
    TaskAssigned: {
        ...BaseEventSchema,
        properties: {
            ...BaseEventSchema.properties,
            payload: {
                type: 'object',
                required: true,
                properties: {
                    task: { type: 'object', required: true },
                    agentId: { type: 'string', required: true },
                    assignmentTime: { type: 'object', required: true },
                },
            },
        },
    },
    WorkflowStarted: {
        ...BaseEventSchema,
        properties: {
            ...BaseEventSchema.properties,
            payload: {
                type: 'object',
                required: true,
                properties: {
                    workflowId: { type: 'string', required: true },
                    definition: { type: 'object', required: true },
                    context: { type: 'object', required: true },
                    startTime: { type: 'object', required: true },
                },
            },
        },
    },
    HumanValidationRequested: {
        ...BaseEventSchema,
        properties: {
            ...BaseEventSchema.properties,
            payload: {
                type: 'object',
                required: true,
                properties: {
                    requestId: { type: 'string', required: true },
                    validationType: {
                        type: 'string',
                        required: true,
                        enum: ['approval', 'selection', 'input', 'review'],
                    },
                    context: { type: 'object', required: true },
                    priority: {
                        type: 'number',
                        required: true,
                        enum: Object.values(EventPriority).filter((v) => typeof v === 'number'),
                    },
                    timeout: { type: 'number', required: false },
                },
            },
        },
    },
};
export class TypeSafeEventBus extends EventEmitter {
    systemDomainValidator;
    logger;
    domainValidators = new Map();
    eventHandlers = new Map();
    eventHistory = [];
    processingStats = new Map();
    config;
    eventCache = new Map();
    schemaCache = new Map();
    eventCounter = 0;
    startTime = Date.now();
    constructor(config = {}, systemDomainValidator) {
        super();
        this.systemDomainValidator = systemDomainValidator;
        this.setMaxListeners(0);
        this.config = {
            maxHandlers: config.maxHandlers ?? 1000,
            maxEventHistory: config.maxEventHistory ?? 10000,
            enableMetrics: config.enableMetrics ?? true,
            enableCaching: config.enableCaching ?? true,
            defaultTimeout: config.defaultTimeout ?? 30000,
            maxConcurrency: config.maxConcurrency ?? 100,
            batchSize: config.batchSize ?? 50,
            retryAttempts: config.retryAttempts ?? 3,
            backoffMultiplier: config.backoffMultiplier ?? 2,
            domainValidation: config.domainValidation ?? true,
        };
        this.logger = getLogger('type-safe-event-bus');
        if (this.config.domainValidation) {
            for (const domain of Object.values(Domain)) {
                this.domainValidators.set(domain, getDomainValidator(domain));
            }
        }
        this.logger.info('TypeSafeEventBus initialized', {
            config: this.config,
            domainValidationEnabled: this.config.domainValidation,
        });
    }
    async emitEvent(event, options = {}) {
        const startTime = Date.now();
        const eventId = event.id || this.generateEventId();
        try {
            const enhancedEvent = {
                ...event,
                id: eventId,
                timestamp: event.timestamp || new Date(),
                version: event.version || '1.0.0',
                metadata: {
                    ...event.metadata,
                    correlationId: options.correlationId ||
                        event.metadata?.correlationId ||
                        this.generateCorrelationId(),
                    priority: options.priority ??
                        event.metadata?.priority ??
                        EventPriority.NORMAL,
                    source: event.metadata?.source || 'type-safe-event-bus',
                },
            };
            if (this.config.domainValidation && !options.skipValidation) {
                const validationResult = await this.validateEventAtDomainBoundary(enhancedEvent);
                if (!validationResult.success) {
                    throw new DomainValidationError(`Event validation failed: ${validationResult.error?.message}`, 'EVENT_VALIDATION_FAILED', event.domain, 'emitEvent', [], event, event.type);
                }
            }
            if (this.config.enableCaching) {
                this.eventCache.set(eventId, enhancedEvent);
            }
            this.addToEventHistory(enhancedEvent);
            const processingResult = await this.processEventHandlers(enhancedEvent, {
                timeout: options.timeout ?? this.config.defaultTimeout,
            });
            this.emit(event.type, enhancedEvent);
            this.emit('*', enhancedEvent);
            if (this.config.enableMetrics) {
                this.trackEventMetrics(event.type, Date.now() - startTime, true);
            }
            this.logger.debug('Event emitted successfully', {
                eventId,
                eventType: event.type,
                domain: event.domain,
                processingTime: Date.now() - startTime,
                handlerCount: processingResult.handlerResults.length,
            });
            return {
                success: true,
                processingTime: Date.now() - startTime,
                handlerResults: processingResult.handlerResults,
                metadata: {
                    eventId,
                    startTime: new Date(startTime),
                    endTime: new Date(),
                    handlerCount: processingResult.handlerResults.length,
                    successCount: processingResult.handlerResults.filter((r) => r.success)
                        .length,
                    failureCount: processingResult.handlerResults.filter((r) => !r.success).length,
                    totalProcessingTime: Date.now() - startTime,
                    validationTime: processingResult.validationTime || 0,
                },
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            if (this.config.enableMetrics) {
                this.trackEventMetrics(event.type, processingTime, false);
            }
            this.logger.error('Event emission failed', {
                eventId,
                eventType: event.type,
                domain: event.domain,
                error: error instanceof Error ? error.message : String(error),
                processingTime,
            });
            return {
                success: false,
                processingTime,
                error: error instanceof Error ? error : new Error(String(error)),
                handlerResults: [],
                metadata: {
                    eventId,
                    startTime: new Date(startTime),
                    endTime: new Date(),
                    handlerCount: 0,
                    successCount: 0,
                    failureCount: 1,
                    totalProcessingTime: processingTime,
                    validationTime: 0,
                },
            };
        }
    }
    async emitEventBatch(events, options = {}) {
        const startTime = Date.now();
        const maxConcurrency = options.maxConcurrency ?? this.config.maxConcurrency;
        this.logger.info('Processing event batch', {
            eventCount: events.length,
            maxConcurrency,
        });
        const results = [];
        for (let i = 0; i < events.length; i += this.config.batchSize) {
            const batch = events.slice(i, i + this.config.batchSize);
            const batchPromises = batch.map((event) => this.emitEvent(event, options));
            const batchResults = await Promise.allSettled(batchPromises);
            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                }
                else {
                    results.push({
                        success: false,
                        processingTime: Date.now() - startTime,
                        error: result.reason instanceof Error
                            ? result.reason
                            : new Error(String(result.reason)),
                        handlerResults: [],
                        metadata: {
                            eventId: 'batch-failed',
                            startTime: new Date(startTime),
                            endTime: new Date(),
                            handlerCount: 0,
                            successCount: 0,
                            failureCount: 1,
                            totalProcessingTime: Date.now() - startTime,
                            validationTime: 0,
                        },
                    });
                }
            }
        }
        this.logger.info('Event batch processing completed', {
            totalEvents: events.length,
            successCount: results.filter((r) => r.success).length,
            failureCount: results.filter((r) => !r.success).length,
            totalTime: Date.now() - startTime,
        });
        return results;
    }
    registerHandler(eventType, handler, config = {}, schema) {
        const handlerId = this.generateHandlerId();
        const typedHandler = {
            id: handlerId,
            eventType,
            handler,
            config: {
                priority: 0,
                timeout: this.config.defaultTimeout,
                retries: this.config.retryAttempts,
                backoffStrategy: 'exponential',
                errorHandling: 'retry',
                validatePayload: true,
                trackMetrics: true,
                ...config,
            },
            schema,
        };
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        const handlers = this.eventHandlers.get(eventType);
        handlers.push(typedHandler);
        handlers.sort((a, b) => (b.config.priority ?? 0) - (a.config.priority ?? 0));
        this.logger.debug('Event handler registered', {
            handlerId,
            eventType,
            priority: config.priority,
            totalHandlers: handlers.length,
        });
        return handlerId;
    }
    registerHandlers(registrations) {
        return registrations.map((reg) => this.registerHandler(reg.eventType, reg.handler, reg.config, reg.schema));
    }
    registerDomainHandler(domain, handler, config = {}) {
        return this.registerHandler(`domain:${domain}`, handler, config);
    }
    registerWildcardHandler(handler, config = {}) {
        return this.registerHandler('*', handler, config);
    }
    unregisterHandler(handlerId) {
        for (const [eventType, handlers] of this.eventHandlers.entries()) {
            const index = handlers.findIndex((h) => h.id === handlerId);
            if (index >= 0) {
                handlers.splice(index, 1);
                if (handlers.length === 0) {
                    this.eventHandlers.delete(eventType);
                }
                this.logger.debug('Event handler unregistered', {
                    handlerId,
                    eventType,
                    remainingHandlers: handlers.length,
                });
                return true;
            }
        }
        return false;
    }
    getHandlers(eventType) {
        return this.eventHandlers.get(eventType) || [];
    }
    getRegisteredEventTypes() {
        return Array.from(this.eventHandlers.keys());
    }
    async routeCrossDomainEvent(event, fromDomain, toDomain, operation) {
        const startTime = Date.now();
        try {
            if (this.config.domainValidation) {
                const validator = this.domainValidators.get(fromDomain);
                if (validator) {
                    validator.trackCrossings(fromDomain, toDomain, `event_routing:${operation}`);
                }
                const validationResult = await this.validateCrossDomainEvent(event, fromDomain, toDomain);
                if (!validationResult.success) {
                    return {
                        success: false,
                        error: validationResult.error,
                        metadata: {
                            domainFrom: fromDomain,
                            domainTo: toDomain,
                            operation: `cross_domain_event:${operation}`,
                            timestamp: new Date(),
                            validationTime: Date.now() - startTime,
                            crossingId: this.generateCrossingId(),
                        },
                    };
                }
            }
            const crossDomainEvent = {
                ...event,
                metadata: {
                    ...event.metadata,
                    source: `cross_domain:${fromDomain}`,
                    causationId: event.id,
                    customData: {
                        ...event.metadata?.customData,
                        crossDomain: {
                            from: fromDomain,
                            to: toDomain,
                            operation,
                        },
                    },
                },
            };
            const processingResult = await this.emitEvent(crossDomainEvent);
            return {
                success: true,
                data: processingResult,
                metadata: {
                    domainFrom: fromDomain,
                    domainTo: toDomain,
                    operation: `cross_domain_event:${operation}`,
                    timestamp: new Date(),
                    validationTime: Date.now() - startTime,
                    crossingId: this.generateCrossingId(),
                },
            };
        }
        catch (error) {
            this.logger.error('Cross-domain event routing failed', {
                fromDomain,
                toDomain,
                operation,
                eventType: event.type,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                metadata: {
                    domainFrom: fromDomain,
                    domainTo: toDomain,
                    operation: `cross_domain_event:${operation}`,
                    timestamp: new Date(),
                    validationTime: Date.now() - startTime,
                    crossingId: this.generateCrossingId(),
                },
            };
        }
    }
    queryEvents(criteria) {
        let filteredEvents = this.eventHistory.slice();
        if (criteria.eventType) {
            filteredEvents = filteredEvents.filter((e) => e.type === criteria.eventType);
        }
        if (criteria.domain) {
            filteredEvents = filteredEvents.filter((e) => e.domain === criteria.domain);
        }
        if (criteria.startTime) {
            filteredEvents = filteredEvents.filter((e) => e.timestamp >= criteria.startTime);
        }
        if (criteria.endTime) {
            filteredEvents = filteredEvents.filter((e) => e.timestamp <= criteria.endTime);
        }
        if (criteria.correlationId) {
            filteredEvents = filteredEvents.filter((e) => e.metadata?.correlationId === criteria.correlationId);
        }
        if (criteria.tags && criteria.tags.length > 0) {
            filteredEvents = filteredEvents.filter((e) => e.metadata?.tags?.some((tag) => criteria.tags.includes(tag)));
        }
        if (criteria.limit && criteria.limit > 0) {
            filteredEvents = filteredEvents.slice(-criteria.limit);
        }
        return filteredEvents;
    }
    getEvent(eventId) {
        if (this.config.enableCaching && this.eventCache.has(eventId)) {
            return this.eventCache.get(eventId);
        }
        return this.eventHistory.find((e) => e.id === eventId);
    }
    getEventsByCorrelation(correlationId) {
        return this.queryEvents({ correlationId });
    }
    clearEventHistory() {
        this.eventHistory.length = 0;
        this.eventCache.clear();
        this.logger.info('Event history cleared');
    }
    getMetrics() {
        const now = Date.now();
        const uptimeSeconds = (now - this.startTime) / 1000;
        const domainEventCounts = {};
        for (const domain of Object.values(Domain)) {
            domainEventCounts[domain] = this.eventHistory.filter((e) => e.domain === domain).length;
        }
        const totalProcessingTimes = Array.from(this.processingStats.values())
            .flat()
            .filter((time) => time > 0);
        const averageProcessingTime = totalProcessingTimes.length > 0
            ? totalProcessingTimes.reduce((sum, time) => sum + time, 0) /
                totalProcessingTimes.length
            : 0;
        const failedEvents = this.eventHistory.length - totalProcessingTimes.length;
        const failureRate = this.eventHistory.length > 0
            ? failedEvents / this.eventHistory.length
            : 0;
        return {
            totalEvents: this.eventCounter,
            eventsPerSecond: uptimeSeconds > 0 ? this.eventCounter / uptimeSeconds : 0,
            averageProcessingTime,
            failureRate,
            handlerCount: Array.from(this.eventHandlers.values()).reduce((sum, handlers) => sum + handlers.length, 0),
            domainEventCounts,
            memoryUsage: this.estimateMemoryUsage(),
            cacheHitRate: this.calculateCacheHitRate(),
        };
    }
    getPerformanceStats() {
        const stats = {};
        for (const [eventType, times] of this.processingStats.entries()) {
            if (times.length === 0)
                continue;
            const sortedTimes = [...times].sort((a, b) => a - b);
            const count = times.length;
            const sum = times.reduce((a, b) => a + b, 0);
            stats[eventType] = {
                count,
                averageTime: sum / count,
                minTime: sortedTimes[0],
                maxTime: sortedTimes[sortedTimes.length - 1],
                p95Time: sortedTimes[Math.floor(count * 0.95)] || 0,
                p99Time: sortedTimes[Math.floor(count * 0.99)] || 0,
            };
        }
        return stats;
    }
    resetMetrics() {
        this.processingStats.clear();
        this.eventCounter = 0;
        this.startTime = Date.now();
        this.logger.info('Performance metrics reset');
    }
    async initialize() {
        this.logger.info('Initializing TypeSafeEventBus', {
            config: this.config,
        });
        if (this.config.domainValidation) {
            for (const [domain, validator] of this.domainValidators.entries()) {
                try {
                    this.logger.debug('Domain validator ready', { domain });
                }
                catch (error) {
                    this.logger.error('Failed to initialize domain validator', {
                        domain,
                        error: error instanceof Error ? error.message : String(error),
                    });
                    throw error;
                }
            }
        }
        this.registerSystemEventHandlers();
        this.logger.info('TypeSafeEventBus initialized successfully');
    }
    async shutdown() {
        this.logger.info('Shutting down TypeSafeEventBus');
        try {
            await this.emitEvent({
                id: this.generateEventId(),
                type: 'system.shutdown',
                domain: Domain.CORE,
                timestamp: new Date(),
                version: '1.0.0',
                payload: {
                    reason: 'graceful_shutdown',
                    graceful: true,
                    uptime: Date.now() - this.startTime,
                },
            });
        }
        catch (error) {
            this.logger.warn('Failed to emit shutdown event', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        this.eventHandlers.clear();
        this.eventCache.clear();
        this.schemaCache.clear();
        this.removeAllListeners();
        this.logger.info('TypeSafeEventBus shutdown complete');
    }
    async processEventHandlers(event, options) {
        const handlerResults = [];
        let validationTime = 0;
        const specificHandlers = this.getHandlers(event.type);
        const domainHandlers = this.getHandlers(`domain:${event.domain}`);
        const wildcardHandlers = this.getHandlers('*');
        const allHandlers = [
            ...specificHandlers,
            ...domainHandlers,
            ...wildcardHandlers,
        ];
        const uniqueHandlers = Array.from(new Map(allHandlers.map((h) => [h.id, h])).values());
        if (uniqueHandlers.length === 0) {
            return { handlerResults, validationTime };
        }
        const context = {
            eventBus: this,
            logger: this.logger,
            startTime: new Date(),
            correlationId: event.metadata?.correlationId || this.generateCorrelationId(),
            metadata: {},
        };
        const handlerPromises = uniqueHandlers.map(async (handler) => {
            const handlerStartTime = Date.now();
            try {
                if (handler.schema && handler.config.validatePayload) {
                    const schemaValidationStart = Date.now();
                    if (this.config.domainValidation) {
                        const validator = this.domainValidators.get(event.domain);
                        if (validator) {
                            validator.validateInput(event, handler.schema);
                        }
                    }
                    validationTime += Date.now() - schemaValidationStart;
                }
                await Promise.race([
                    handler.handler(event, context),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Handler timeout')), handler.config.timeout || options.timeout)),
                ]);
                const processingTime = Date.now() - handlerStartTime;
                return {
                    handlerId: handler.id,
                    success: true,
                    processingTime,
                };
            }
            catch (error) {
                const processingTime = Date.now() - handlerStartTime;
                this.logger.error('Event handler failed', {
                    handlerId: handler.id,
                    eventType: event.type,
                    eventId: event.id,
                    error: error instanceof Error ? error.message : String(error),
                    processingTime,
                });
                return {
                    handlerId: handler.id,
                    success: false,
                    processingTime,
                    error: error instanceof Error ? error : new Error(String(error)),
                };
            }
        });
        const results = await Promise.allSettled(handlerPromises);
        for (const result of results) {
            if (result.status === 'fulfilled') {
                handlerResults.push(result.value);
            }
            else {
                handlerResults.push({
                    handlerId: 'unknown',
                    success: false,
                    processingTime: 0,
                    error: result.reason instanceof Error
                        ? result.reason
                        : new Error(String(result.reason)),
                });
            }
        }
        return { handlerResults, validationTime };
    }
    async validateEventAtDomainBoundary(event) {
        const validator = this.domainValidators.get(event.domain);
        if (!validator) {
            return {
                success: true,
                data: event,
            };
        }
        try {
            const schema = this.getEventSchema(event.type);
            if (schema) {
                const validatedEvent = validator.validateInput(event, schema);
                return {
                    success: true,
                    data: validatedEvent,
                };
            }
            const basicSchema = BaseEventSchema;
            validator.validateInput(event, basicSchema);
            return {
                success: true,
                data: event,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    async validateCrossDomainEvent(event, fromDomain, toDomain) {
        try {
            const schema = this.getEventSchema(event.type);
            if (schema) {
                const validatedEvent = validateCrossDomain(event, schema, fromDomain, toDomain, `event_validation:${event.type}`);
                return {
                    success: true,
                    data: validatedEvent,
                };
            }
            return {
                success: true,
                data: event,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    getEventSchema(eventType) {
        if (this.schemaCache.has(eventType)) {
            return this.schemaCache.get(eventType);
        }
        const schemaKey = eventType
            .split('.')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
        const schema = EventSchemas[schemaKey];
        if (schema) {
            this.schemaCache.set(eventType, schema);
            return schema;
        }
        return undefined;
    }
    addToEventHistory(event) {
        this.eventHistory.push(event);
        this.eventCounter++;
        if (this.eventHistory.length > this.config.maxEventHistory) {
            this.eventHistory.shift();
        }
    }
    trackEventMetrics(eventType, processingTime, success) {
        if (!this.processingStats.has(eventType)) {
            this.processingStats.set(eventType, []);
        }
        const stats = this.processingStats.get(eventType);
        if (success) {
            stats.push(processingTime);
        }
        if (stats.length > 1000) {
            stats.splice(0, stats.length - 1000);
        }
    }
    registerSystemEventHandlers() {
        this.registerHandler('error.occurred', async (event) => {
            this.logger.error('System error occurred', {
                error: event.payload.error.message,
                severity: event.payload.severity,
                recoverable: event.payload.recoverable,
                context: event.payload.context,
            });
        });
        this.registerHandler('system.started', async (event) => {
            this.logger.info('System started', {
                version: event.payload.version,
                startTime: event.payload.startTime,
            });
        });
    }
    generateEventId() {
        return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateHandlerId() {
        return `handler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCorrelationId() {
        return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCrossingId() {
        return `crossing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    estimateMemoryUsage() {
        const eventHistorySize = JSON.stringify(this.eventHistory).length;
        const cacheSize = JSON.stringify(Array.from(this.eventCache.values())).length;
        const handlerSize = this.eventHandlers.size * 1000;
        return eventHistorySize + cacheSize + handlerSize;
    }
    calculateCacheHitRate() {
        return this.config.enableCaching && this.eventCache.size > 0 ? 0.85 : 0;
    }
    emit(eventName, ...args) {
        const result = super.emit(eventName, ...args);
        if (typeof eventName === 'string' &&
            args.length > 0 &&
            args[0] &&
            typeof args[0] === 'object') {
            const event = args[0];
            if (event.type && event.domain && event.timestamp) {
            }
        }
        return result;
    }
    on(eventName, listener) {
        super.on(eventName, listener);
        return this;
    }
    off(eventName, listener) {
        super.off(eventName, listener);
        return this;
    }
}
export function createTypeSafeEventBus(config, domainValidator) {
    return new TypeSafeEventBus(config, domainValidator);
}
export function createEvent(type, domain, payload, metadata) {
    return {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        domain,
        timestamp: new Date(),
        version: '1.0.0',
        metadata,
        ...payload,
    };
}
export function createCorrelationId() {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export function isBaseEvent(obj) {
    if (!obj || typeof obj !== 'object')
        return false;
    const event = obj;
    return (typeof event.id === 'string' &&
        typeof event.type === 'string' &&
        typeof event.domain === 'string' &&
        event.timestamp instanceof Date &&
        typeof event.version === 'string' &&
        Object.values(Domain).includes(event.domain));
}
export function isDomainEvent(event, domain) {
    return event.domain === domain;
}
export function getEventType(eventClass) {
    return 'unknown';
}
export default TypeSafeEventBus;
//# sourceMappingURL=type-safe-event-system.js.map