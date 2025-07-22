/**
 * Event Bus for Vision-to-Code Services
 * Implements pub/sub pattern using Redis for inter-service communication
 */

import Redis from 'ioredis';
import { EventEmitter } from 'events';
import crypto from 'crypto';

class EventBus extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      serviceName: config.serviceName || 'unknown-service',
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 2,
        keyPrefix: 'event_bus:',
        ...config.redis
      },
      channels: {
        global: 'vision_to_code:events',
        service: `vision_to_code:${config.serviceName}:events`
      },
      ...config
    };

    // Redis clients (one for pub, one for sub)
    this.publisher = null;
    this.subscriber = null;
    
    // Event metrics
    this.metrics = {
      published: 0,
      received: 0,
      errors: 0
    };

    // Subscription handlers
    this.handlers = new Map();
    
    // Dead letter queue for failed events
    this.dlqKey = `${this.config.redis.keyPrefix}dlq:${this.config.serviceName}`;
  }

  /**
   * Connect to Redis
   */
  async connect() {
    // Create publisher client
    this.publisher = new Redis(this.config.redis);
    
    // Create subscriber client
    this.subscriber = new Redis(this.config.redis);

    // Set up error handlers
    this.publisher.on('error', (err) => {
      console.error('Publisher error:', err);
      this.emit('error', err);
    });

    this.subscriber.on('error', (err) => {
      console.error('Subscriber error:', err);
      this.emit('error', err);
    });

    // Subscribe to channels
    await this.subscriber.subscribe(
      this.config.channels.global,
      this.config.channels.service
    );

    // Handle incoming messages
    this.subscriber.on('message', async (channel, message) => {
      await this.handleMessage(channel, message);
    });

    console.log(`Event bus connected for ${this.config.serviceName}`);
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.subscriber) {
      await this.subscriber.unsubscribe();
      await this.subscriber.quit();
    }
    
    if (this.publisher) {
      await this.publisher.quit();
    }

    console.log(`Event bus disconnected for ${this.config.serviceName}`);
  }

  /**
   * Publish an event
   */
  async publish(eventType, payload, options = {}) {
    const event = {
      event_id: `evt_${crypto.randomBytes(8).toString('hex')}`,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      source_service: this.config.serviceName,
      correlation_id: options.correlationId || payload.vision_id || payload.workflow_id,
      payload,
      metadata: {
        version: '1.0',
        retry_count: 0,
        ...options.metadata
      }
    };

    try {
      // Publish to global channel
      await this.publisher.publish(
        this.config.channels.global,
        JSON.stringify(event)
      );

      // Also publish to specific service channels if targets specified
      if (options.targets && Array.isArray(options.targets)) {
        for (const target of options.targets) {
          await this.publisher.publish(
            `vision_to_code:${target}:events`,
            JSON.stringify(event)
          );
        }
      }

      this.metrics.published++;
      this.emit('event:published', event);

      return event.event_id;
    } catch (error) {
      this.metrics.errors++;
      console.error('Failed to publish event:', error);
      
      // Store in dead letter queue
      await this.storeInDLQ(event, error);
      
      throw error;
    }
  }

  /**
   * Subscribe to event types
   */
  subscribe(eventTypes, handler) {
    if (!Array.isArray(eventTypes)) {
      eventTypes = [eventTypes];
    }

    eventTypes.forEach(eventType => {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType).push(handler);
    });

    return () => {
      // Return unsubscribe function
      eventTypes.forEach(eventType => {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
          const index = handlers.indexOf(handler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      });
    };
  }

  /**
   * Handle incoming message
   */
  async handleMessage(channel, message) {
    try {
      const event = JSON.parse(message);
      this.metrics.received++;

      // Skip events from self unless explicitly subscribed
      if (event.source_service === this.config.serviceName && 
          !this.config.processSelfEvents) {
        return;
      }

      // Get handlers for this event type
      const handlers = this.handlers.get(event.event_type) || [];
      const globalHandlers = this.handlers.get('*') || [];
      const allHandlers = [...handlers, ...globalHandlers];

      if (allHandlers.length === 0) {
        return; // No handlers for this event
      }

      // Execute handlers
      const results = await Promise.allSettled(
        allHandlers.map(handler => handler(event))
      );

      // Check for failures
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.error(`${failures.length} handlers failed for event ${event.event_id}`);
        
        // Retry logic
        if (event.metadata.retry_count < 3) {
          event.metadata.retry_count++;
          setTimeout(() => {
            this.publisher.publish(channel, JSON.stringify(event));
          }, Math.pow(2, event.metadata.retry_count) * 1000);
        } else {
          // Max retries exceeded, store in DLQ
          await this.storeInDLQ(event, failures[0].reason);
        }
      }

      this.emit('event:processed', event);
    } catch (error) {
      this.metrics.errors++;
      console.error('Failed to handle message:', error);
      
      // Try to store the raw message in DLQ
      await this.publisher.rpush(this.dlqKey, message);
    }
  }

  /**
   * Store failed event in dead letter queue
   */
  async storeInDLQ(event, error) {
    const dlqEntry = {
      event,
      error: error.message || error,
      failed_at: new Date().toISOString(),
      service: this.config.serviceName
    };

    await this.publisher.rpush(this.dlqKey, JSON.stringify(dlqEntry));
  }

  /**
   * Process dead letter queue
   */
  async processDLQ(handler) {
    const entries = await this.publisher.lrange(this.dlqKey, 0, -1);
    
    for (const entry of entries) {
      try {
        const dlqEntry = JSON.parse(entry);
        const result = await handler(dlqEntry);
        
        if (result === true) {
          // Remove from DLQ if successfully processed
          await this.publisher.lrem(this.dlqKey, 1, entry);
        }
      } catch (error) {
        console.error('Failed to process DLQ entry:', error);
      }
    }
  }

  /**
   * Get event bus metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      handlers: this.handlers.size,
      dlq_size: 0 // Would query in production
    };
  }

  /**
   * Ping Redis connection
   */
  async ping() {
    return await this.publisher.ping();
  }

  /**
   * Create a typed event emitter for specific event types
   */
  createTypedEmitter(eventTypes) {
    const emitter = new EventEmitter();
    
    this.subscribe(eventTypes, (event) => {
      emitter.emit(event.event_type, event);
    });

    return emitter;
  }
}

// Event type constants
export const EVENT_TYPES = {
  // Vision events
  VISION_CREATED: 'vision:created',
  VISION_UPDATED: 'vision:updated',
  VISION_APPROVED: 'vision:approved',
  VISION_REJECTED: 'vision:rejected',
  VISION_ARCHIVED: 'vision:archived',
  
  // Workflow events
  WORKFLOW_REGISTERED: 'workflow:registered',
  WORKFLOW_STARTED: 'workflow:started',
  WORKFLOW_PROGRESS: 'workflow:progress',
  WORKFLOW_COMPLETED: 'workflow:completed',
  WORKFLOW_FAILED: 'workflow:failed',
  
  // Technical planning events
  TECHNICAL_PLAN_READY: 'technical:plan:ready',
  TECHNICAL_PLAN_UPDATED: 'technical:plan:updated',
  
  // Implementation events
  IMPLEMENTATION_STARTED: 'implementation:started',
  IMPLEMENTATION_PROGRESS: 'implementation:progress',
  IMPLEMENTATION_COMPLETED: 'implementation:completed',
  
  // Agent events
  AGENT_SPAWNED: 'agent:spawned',
  AGENT_TASK_ASSIGNED: 'agent:task:assigned',
  AGENT_TASK_COMPLETED: 'agent:task:completed',
  AGENT_TERMINATED: 'agent:terminated',
  
  // Squad events
  SQUAD_FORMED: 'squad:formed',
  SQUAD_TASK_ASSIGNED: 'squad:task:assigned',
  SQUAD_TASK_COMPLETED: 'squad:task:completed',
  SQUAD_DISBANDED: 'squad:disbanded'
};

export { EventBus };