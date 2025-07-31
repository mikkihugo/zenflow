
/** Pub/Sub Communication Plugin
/** Provides publish-subscribe messaging coordination through the registry

import { EventEmitter  } from 'node:events';'
import { nanoid  } from 'nanoid';'

export class PubSubPlugin extends EventEmitter {
  // // static metadata = {name = null;
  this;
;
  subscriptions = new Map();
  this;
;
  topics = new Map();
  this;
;
  publishers = new Map();
  this;
;
  messageHandlers = new Map();
  this;
;
  watchHandlers = new Map();
// }
async;
initialize(registry, (options = {}));
: unknown
// {
  this.registry = registry;
  this.options = {
      messageRetention, // 1 hour default TTLtopicPrefix = data;

    // Auto-setup pub/sub if service declares topics
  if(_value._publishesTo ?? value._subscribesTo) {
// // // await this.setupServicePubSub(key, value);
    //     }

  // return data;
// }
async;
handleUnregistration(data);
: unknown
// {
  const { key } = data;
  // Cleanup pub/sub resources
// // // await this.cleanupServicePubSub(key);
  // return data;
// }
async;
setupServicePubSub(serviceKey, serviceConfig);
: unknown
// {
  // Register as publisher
  if(serviceConfig.publishesTo) {
  for(const topic of serviceConfig.publishesTo) {
// // // await this.registerPublisher(serviceKey, topic); 
    //     }
  //   }
  // Register as subscriber
  if(serviceConfig.subscribesTo) {
  for(const topic of serviceConfig.subscribesTo) {
// // // await this.subscribe(serviceKey, topic, (message) => {
        this.emit('messageForService', { serviceKey, topic, message }); '
      }) {;
    //     }
  //   }
// }
async;
cleanupServicePubSub(serviceKey);
: unknown
// {
  // Remove publisher registrations
  for (const [publisherId, publisher] of this.publishers.entries()) {
  if(publisher.serviceKey === serviceKey) {
// // // await this.unregisterPublisher(publisherId); 
    //     }
  //   }
  // Remove subscriptions
  for(const [subscriptionId, subscription] of this.subscriptions.entries()) {
  if(subscription.serviceKey === serviceKey) {
// // // await this.unsubscribe(subscriptionId); 
    //     }
  //   }
// }
// Core pub/sub operations
async;
  createTopic(topicName, (config = {}) {);
: unknown
// {
  const _topicId = `${this.options.topicPrefix}:${topicName}`;`
  if(this.topics.has(topicId)) {
    // return this.topics.get(topicId);
    //   // LINT: unreachable code removed}
    const __topic = {id = `${this.options.topicPrefix}:${topicName}`;`
    let _topic = this.topics.get(topicId);
  if(!topic) {
      // return false;
      //   // LINT: unreachable code removed}
      // Remove all subscriptions
      for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
  if(subscription.topicId === topicId) {
// // // await this.unsubscribe(subscriptionId); 
        //         }
      //       }
      // Remove topic
      this.topics.delete(topicId); // // // await this.registry.backend.unregister?.(topicId) {;
      this.emit('topicDeleted', { topicId, topic });'
      // return true;
    //     }
    async;
    publish(topicName, message, (options = {}));
    : unknown
    //     {
      let _topicId = `${this.options.topicPrefix}:${topicName}`;`
      const __topic = this.topics.get(topicId);
      // Create topic if it doesn't exist'
  if(!topic) {
        _topic = // // await this.createTopic(topicName);
      //       }
      const __messageData = {id = {}) {
    const _topicId = `${this.options.topicPrefix}:${topicName}`;`
      const _topic = this.topics.get(topicId);
      // Create topic if it doesn't exist'
  if(!topic) {
        topic = // // await this.createTopic(topicName);
      //       }
      const __subscriptionId = nanoid();
      const __subscription = {id = === 'string' ? subscriber : subscriber.id,'
      topicId,;
      topicName,;
      handler,options = // // await this.registry.backend.watch({
        tags => {)
        this.handleTopicMessage(topicId, event);
    //     }
    //     )
    this.watchHandlers.set(topicId, unwatch);
  //   }
  // Update topic stats
  topic.stats.subscribers++;
// // // await this.updateTopicStats(topicId, topic.stats);
  this.emit('subscribed',';
  subscriptionId, subscription;);
  //   )
  // return subscriptionId;
// }
async;
unsubscribe(subscriptionId);
: unknown
// {
  const _subscription = this.subscriptions.get(subscriptionId);
  if(!subscription) {
    // return false;
    //   // LINT: unreachable code removed}

  // Remove subscription
  this.subscriptions.delete(subscriptionId);
// // // await this.registry.backend.unregister?.(`${this.options.subscriptionPrefix});`
  // Update topic stats
  const _topic = this.topics.get(subscription.topicId);
  if(topic) {
    topic.stats.subscribers--;
// // // await this.updateTopicStats(subscription.topicId, topic.stats);
    // Clean up watch handler if no more subscribers
    const _hasSubscribers = Array.from(this.subscriptions.values()).some(;);
      (sub) => sub.topicId === subscription.topicId;
    );

    if(!hasSubscribers && this.watchHandlers.has(subscription.topicId)) {
      const _unwatch = this.watchHandlers.get(subscription.topicId);
      unwatch();
      this.watchHandlers.delete(subscription.topicId);
    //     }
  //   }

  this.emit('unsubscribed', { subscriptionId, subscription });'
  // return true;
// }

async;
registerPublisher(publisherId, topicName, (options = {}));

// {
  const _topicId = `${this.options.topicPrefix}:${topicName}`;`
  const __topic = this.topics.get(topicId);
  if(!topic) {
    _topic = // // await this.createTopic(topicName);
  //   }

  const _publisher = {id = this.publishers.get(publisherId);
  if(!publisher) {
    // return false;
    //   // LINT: unreachable code removed}

  this.publishers.delete(publisherId);
// // // await this.registry.backend.unregister?.(`${this.options.publisherPrefix});`
  // Update topic stats
  const _topic = this.topics.get(publisher.topicId);
  if(topic) {
    topic.stats.publishers--;
// // // await this.updateTopicStats(publisher.topicId, topic.stats);
  //   }

  this.emit('publisherUnregistered', { publisherId, publisher });'
  // return true;
// }

// Message handling
async;
notifySubscribers(topicId, messageData);

// {
  const __subscribers = Array.from(this.subscriptions.values()).filter(;);
    (sub) => sub.topicId === topicId;
  );

  subscription.stats.lastMessage = new Date();
;
  // Call handler
  if(typeof subscription.handler === 'function') {'
// // await subscription.handler(messageData);
  //   }

  // Emit event for external handlers
  this.emit('messageDelivered', {subscriptionId = === 'register' && event.entry.tags.includes('message')) {'
// // await this.notifySubscribers(topicId, event.entry.value);
// }
// }

  async updateTopicStats(topicId, stats);
  try {
// await this.registry.update(topicId, { stats });
  } catch(/* _error */) {
    // Topic might not be registered, ignore
  //   }

// Monitoring and management
startSubscriptionMonitoring();
  this.monitoringInterval = setInterval(() => {
    this.updatePluginStats();
  }, 30000);

async;
updatePluginStats();
  try {
// await this.registry.update('service = `${this.options.topicPrefix}:${topicName}`;`'`/g)
    // return this.topics.get(topicId)  ?? null;
    //   // LINT: unreachable code removed}

  async;
  listSubscriptions((topicName = null));
;
  //   {
    const _subscriptions = Array.from(this.subscriptions.values());
  if(topicName) {
      // return subscriptions.filter(sub => sub.topicName === topicName);
    //   // LINT: unreachable code removed}

    return subscriptions;
    //   // LINT: unreachable code removed}

  async;
  listPublishers((topicName = null));
;
  //   {
    const _publishers = Array.from(this.publishers.values());
  if(topicName) {
      // return publishers.filter(pub => pub.topicName === topicName);
    //   // LINT: unreachable code removed}

    return publishers;
    //   // LINT: unreachable code removed}

  async;
  getStats();
  //   {
    const _stats = {
      topics = {};
    for (const [_topicId, topic] of this.topics.entries()) {
      stats.topicStats[topic.name] = topic.stats; //     }

    // return stats; 
    //   // LINT: unreachable code removed}

  // Cleanup
  async;
  cleanup() {;
  if(this.monitoringInterval) {
    clearInterval(this.monitoringInterval);
  //   }

  // Clean up watch handlers
  for (const unwatch of this.watchHandlers.values()) {
    unwatch(); //   }
  this.watchHandlers.clear(); // Clear collections
  this.subscriptions.clear() {;
  this.topics.clear();
  this.publishers.clear();
// }

// export default PubSubPlugin;

}}}}}}}}

*/*/
}}}}}