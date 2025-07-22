/**
 * Pub/Sub Communication Plugin
 * Provides publish-subscribe messaging coordination through the registry
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

export class PubSubPlugin extends EventEmitter {
  static metadata = {
    name: 'pubsub',
    version: '1.0.0',
    description: 'Publish-subscribe messaging coordination through registry',
    dependencies: [],
    capabilities: ['publishing', 'subscribing', 'topic-management', 'message-routing']
  };

  constructor() {
    super();
    this.registry = null;
    this.subscriptions = new Map();
    this.topics = new Map();
    this.publishers = new Map();
    this.messageHandlers = new Map();
    this.watchHandlers = new Map();
  }

  async initialize(registry, options = {}) {
    this.registry = registry;
    this.options = {
      messageRetention: 3600, // 1 hour default TTL
      topicPrefix: 'topic',
      subscriptionPrefix: 'subscription',
      publisherPrefix: 'publisher',
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    };

    // Register plugin hooks
    registry.pluginSystem.registerHook('beforeRegister', this.handleRegistration.bind(this));
    registry.pluginSystem.registerHook('afterUnregister', this.handleUnregistration.bind(this));

    // Register plugin services
    await this.registerPluginServices();

    // Start subscription monitoring
    this.startSubscriptionMonitoring();
  }

  async registerPluginServices() {
    // Register pub/sub service
    await this.registry.register('service:pubsub', {
      plugin: 'pubsub',
      version: PubSubPlugin.metadata.version,
      capabilities: PubSubPlugin.metadata.capabilities,
      stats: {
        topics: this.topics.size,
        subscriptions: this.subscriptions.size,
        publishers: this.publishers.size
      }
    }, {
      tags: ['service', 'plugin', 'pubsub'],
      ttl: 3600
    });
  }

  // Hook handlers
  async handleRegistration(data) {
    const { key, value, options } = data;
    
    // Auto-setup pub/sub if service declares topics
    if (value.publishesTo || value.subscribesTo) {
      await this.setupServicePubSub(key, value);
    }

    return data;
  }

  async handleUnregistration(data) {
    const { key } = data;
    
    // Cleanup pub/sub resources
    await this.cleanupServicePubSub(key);

    return data;
  }

  async setupServicePubSub(serviceKey, serviceConfig) {
    // Register as publisher
    if (serviceConfig.publishesTo) {
      for (const topic of serviceConfig.publishesTo) {
        await this.registerPublisher(serviceKey, topic);
      }
    }

    // Register as subscriber
    if (serviceConfig.subscribesTo) {
      for (const topic of serviceConfig.subscribesTo) {
        await this.subscribe(serviceKey, topic, (message) => {
          this.emit('messageForService', { serviceKey, topic, message });
        });
      }
    }
  }

  async cleanupServicePubSub(serviceKey) {
    // Remove publisher registrations
    for (const [publisherId, publisher] of this.publishers.entries()) {
      if (publisher.serviceKey === serviceKey) {
        await this.unregisterPublisher(publisherId);
      }
    }

    // Remove subscriptions
    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      if (subscription.serviceKey === serviceKey) {
        await this.unsubscribe(subscriptionId);
      }
    }
  }

  // Core pub/sub operations
  async createTopic(topicName, config = {}) {
    const topicId = `${this.options.topicPrefix}:${topicName}`;
    
    if (this.topics.has(topicId)) {
      return this.topics.get(topicId);
    }

    const topic = {
      id: topicId,
      name: topicName,
      config: {
        persistent: false,
        ordered: false,
        partitioned: false,
        maxSubscribers: -1,
        messageRetention: this.options.messageRetention,
        ...config
      },
      created: new Date(),
      stats: {
        messages: 0,
        subscribers: 0,
        publishers: 0
      }
    };

    this.topics.set(topicId, topic);

    // Register topic in registry
    await this.registry.register(topicId, topic, {
      tags: ['topic', 'pubsub', `name:${topicName}`],
      ttl: topic.config.messageRetention
    });

    this.emit('topicCreated', { topicId, topic });
    return topic;
  }

  async deleteTopic(topicName) {
    const topicId = `${this.options.topicPrefix}:${topicName}`;
    const topic = this.topics.get(topicId);
    
    if (!topic) {
      return false;
    }

    // Remove all subscriptions
    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      if (subscription.topicId === topicId) {
        await this.unsubscribe(subscriptionId);
      }
    }

    // Remove topic
    this.topics.delete(topicId);
    await this.registry.backend.unregister?.(topicId);

    this.emit('topicDeleted', { topicId, topic });
    return true;
  }

  async publish(topicName, message, options = {}) {
    const topicId = `${this.options.topicPrefix}:${topicName}`;
    let topic = this.topics.get(topicId);

    // Create topic if it doesn't exist
    if (!topic) {
      topic = await this.createTopic(topicName);
    }

    const messageId = nanoid();
    const messageData = {
      id: messageId,
      topicId,
      topicName,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        publisher: options.publisher,
        headers: options.headers || {},
        sequenceNumber: ++topic.stats.messages
      }
    };

    // Store message in registry
    await this.registry.register(`message:${messageId}`, messageData, {
      tags: ['message', 'pubsub', `topic:${topicName}`],
      ttl: options.ttl || topic.config.messageRetention
    });

    // Notify subscribers
    await this.notifySubscribers(topicId, messageData);

    // Update topic stats
    topic.stats.messages++;
    await this.updateTopicStats(topicId, topic.stats);

    this.emit('messagePublished', { topicName, messageId, messageData });
    return messageId;
  }

  async subscribe(subscriber, topicName, handler, options = {}) {
    const topicId = `${this.options.topicPrefix}:${topicName}`;
    let topic = this.topics.get(topicId);

    // Create topic if it doesn't exist
    if (!topic) {
      topic = await this.createTopic(topicName);
    }

    const subscriptionId = nanoid();
    const subscription = {
      id: subscriptionId,
      subscriber,
      serviceKey: typeof subscriber === 'string' ? subscriber : subscriber.id,
      topicId,
      topicName,
      handler,
      options: {
        durable: false,
        autoAck: true,
        maxMessages: -1,
        ...options
      },
      created: new Date(),
      stats: {
        messagesReceived: 0,
        lastMessage: null
      }
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Register subscription in registry
    await this.registry.register(`${this.options.subscriptionPrefix}:${subscriptionId}`, {
      id: subscriptionId,
      subscriber: subscription.serviceKey,
      topicName,
      options: subscription.options,
      created: subscription.created
    }, {
      tags: ['subscription', 'pubsub', `topic:${topicName}`, `subscriber:${subscription.serviceKey}`],
      ttl: options.ttl || 3600
    });

    // Set up message watching for this topic
    if (!this.watchHandlers.has(topicId)) {
      const unwatch = await this.registry.backend.watch({
        tags: ['message', `topic:${topicName}`]
      }, (event) => {
        this.handleTopicMessage(topicId, event);
      });
      
      this.watchHandlers.set(topicId, unwatch);
    }

    // Update topic stats
    topic.stats.subscribers++;
    await this.updateTopicStats(topicId, topic.stats);

    this.emit('subscribed', { subscriptionId, subscription });
    return subscriptionId;
  }

  async unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    // Remove subscription
    this.subscriptions.delete(subscriptionId);
    await this.registry.backend.unregister?.(`${this.options.subscriptionPrefix}:${subscriptionId}`);

    // Update topic stats
    const topic = this.topics.get(subscription.topicId);
    if (topic) {
      topic.stats.subscribers--;
      await this.updateTopicStats(subscription.topicId, topic.stats);

      // Clean up watch handler if no more subscribers
      const hasSubscribers = Array.from(this.subscriptions.values())
        .some(sub => sub.topicId === subscription.topicId);
      
      if (!hasSubscribers && this.watchHandlers.has(subscription.topicId)) {
        const unwatch = this.watchHandlers.get(subscription.topicId);
        unwatch();
        this.watchHandlers.delete(subscription.topicId);
      }
    }

    this.emit('unsubscribed', { subscriptionId, subscription });
    return true;
  }

  async registerPublisher(publisherId, topicName, options = {}) {
    const topicId = `${this.options.topicPrefix}:${topicName}`;
    let topic = this.topics.get(topicId);

    if (!topic) {
      topic = await this.createTopic(topicName);
    }

    const publisher = {
      id: publisherId,
      serviceKey: publisherId,
      topicId,
      topicName,
      options,
      registered: new Date(),
      stats: {
        messagesPublished: 0,
        lastMessage: null
      }
    };

    this.publishers.set(publisherId, publisher);

    // Register publisher in registry
    await this.registry.register(`${this.options.publisherPrefix}:${publisherId}`, {
      id: publisherId,
      publisher: publisherId,
      topicName,
      options,
      registered: publisher.registered
    }, {
      tags: ['publisher', 'pubsub', `topic:${topicName}`, `publisher:${publisherId}`],
      ttl: options.ttl || 3600
    });

    // Update topic stats
    topic.stats.publishers++;
    await this.updateTopicStats(topicId, topic.stats);

    this.emit('publisherRegistered', { publisherId, publisher });
    return publisher;
  }

  async unregisterPublisher(publisherId) {
    const publisher = this.publishers.get(publisherId);
    if (!publisher) {
      return false;
    }

    this.publishers.delete(publisherId);
    await this.registry.backend.unregister?.(`${this.options.publisherPrefix}:${publisherId}`);

    // Update topic stats
    const topic = this.topics.get(publisher.topicId);
    if (topic) {
      topic.stats.publishers--;
      await this.updateTopicStats(publisher.topicId, topic.stats);
    }

    this.emit('publisherUnregistered', { publisherId, publisher });
    return true;
  }

  // Message handling
  async notifySubscribers(topicId, messageData) {
    const subscribers = Array.from(this.subscriptions.values())
      .filter(sub => sub.topicId === topicId);

    const notifications = subscribers.map(async (subscription) => {
      try {
        // Update subscription stats
        subscription.stats.messagesReceived++;
        subscription.stats.lastMessage = new Date();

        // Call handler
        if (typeof subscription.handler === 'function') {
          await subscription.handler(messageData);
        }

        // Emit event for external handlers
        this.emit('messageDelivered', {
          subscriptionId: subscription.id,
          subscriber: subscription.serviceKey,
          message: messageData
        });
      } catch (error) {
        this.emit('deliveryError', {
          subscriptionId: subscription.id,
          subscriber: subscription.serviceKey,
          message: messageData,
          error
        });
      }
    });

    await Promise.allSettled(notifications);
  }

  async handleTopicMessage(topicId, event) {
    if (event.type === 'register' && event.entry.tags.includes('message')) {
      await this.notifySubscribers(topicId, event.entry.value);
    }
  }

  async updateTopicStats(topicId, stats) {
    try {
      await this.registry.update(topicId, { stats });
    } catch (error) {
      // Topic might not be registered, ignore
    }
  }

  // Monitoring and management
  startSubscriptionMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.updatePluginStats();
    }, 30000);
  }

  async updatePluginStats() {
    try {
      await this.registry.update('service:pubsub', {
        stats: {
          topics: this.topics.size,
          subscriptions: this.subscriptions.size,
          publishers: this.publishers.size,
          lastUpdate: new Date().toISOString()
        }
      });
    } catch (error) {
      // Service might not be registered, ignore
    }
  }

  // Query methods
  async listTopics() {
    return Array.from(this.topics.values());
  }

  async getTopicInfo(topicName) {
    const topicId = `${this.options.topicPrefix}:${topicName}`;
    return this.topics.get(topicId) || null;
  }

  async listSubscriptions(topicName = null) {
    const subscriptions = Array.from(this.subscriptions.values());
    
    if (topicName) {
      return subscriptions.filter(sub => sub.topicName === topicName);
    }
    
    return subscriptions;
  }

  async listPublishers(topicName = null) {
    const publishers = Array.from(this.publishers.values());
    
    if (topicName) {
      return publishers.filter(pub => pub.topicName === topicName);
    }
    
    return publishers;
  }

  async getStats() {
    const stats = {
      topics: this.topics.size,
      subscriptions: this.subscriptions.size,
      publishers: this.publishers.size,
      messageHandlers: this.watchHandlers.size
    };

    // Topic-level stats
    stats.topicStats = {};
    for (const [topicId, topic] of this.topics.entries()) {
      stats.topicStats[topic.name] = topic.stats;
    }

    return stats;
  }

  // Cleanup
  async cleanup() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Clean up watch handlers
    for (const unwatch of this.watchHandlers.values()) {
      unwatch();
    }
    this.watchHandlers.clear();

    // Clear collections
    this.subscriptions.clear();
    this.topics.clear();
    this.publishers.clear();
  }
}

export default PubSubPlugin;