/**
 * Vision-to-Code Service Adapter
 * Provides common functionality for all Vision-to-Code services
 */

const { EventBus } = require('./events/bus');

class VisionServiceAdapter {
  constructor(serviceName, config = {}) {
    this.serviceName = serviceName;
    this.config = config;
    this.eventBus = new EventBus({
      serviceName,
      redis: config.redis
    });
    this.health = {
      status: 'initializing',
      lastCheck: null,
      dependencies: []
    };
  }

  /**
   * Initialize the service adapter
   */
  async initialize() {
    try {
      await this.eventBus.connect();
      this.health.status = 'healthy';
      this.health.lastCheck = new Date().toISOString();
      
      // Subscribe to global events
      await this.subscribeToEvents();
      
      console.log(`✅ ${this.serviceName} adapter initialized`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.serviceName} adapter:`, error);
      this.health.status = 'unhealthy';
      this.health.error = error.message;
      return false;
    }
  }

  /**
   * Subscribe to relevant events for Vision-to-Code workflow
   */
  async subscribeToEvents() {
    // Vision lifecycle events
    await this.eventBus.subscribe('vision.created', this.handleVisionCreated.bind(this));
    await this.eventBus.subscribe('vision.approved', this.handleVisionApproved.bind(this));
    await this.eventBus.subscribe('vision.rejected', this.handleVisionRejected.bind(this));
    
    // Swarm coordination events
    await this.eventBus.subscribe('swarm.created', this.handleSwarmCreated.bind(this));
    await this.eventBus.subscribe('agent.spawned', this.handleAgentSpawned.bind(this));
    await this.eventBus.subscribe('task.completed', this.handleTaskCompleted.bind(this));
    
    // Development events
    await this.eventBus.subscribe('code.generated', this.handleCodeGenerated.bind(this));
    await this.eventBus.subscribe('deployment.requested', this.handleDeploymentRequested.bind(this));
    await this.eventBus.subscribe('deployment.completed', this.handleDeploymentCompleted.bind(this));
  }

  /**
   * Event handlers - override in specific services
   */
  async handleVisionCreated(data) {
    console.log(`${this.serviceName}: Vision created - ${data.visionId}`);
  }

  async handleVisionApproved(data) {
    console.log(`${this.serviceName}: Vision approved - ${data.visionId}`);
  }

  async handleVisionRejected(data) {
    console.log(`${this.serviceName}: Vision rejected - ${data.visionId}`);
  }

  async handleSwarmCreated(data) {
    console.log(`${this.serviceName}: Swarm created - ${data.swarmId}`);
  }

  async handleAgentSpawned(data) {
    console.log(`${this.serviceName}: Agent spawned - ${data.agentId}`);
  }

  async handleTaskCompleted(data) {
    console.log(`${this.serviceName}: Task completed - ${data.taskId}`);
  }

  async handleCodeGenerated(data) {
    console.log(`${this.serviceName}: Code generated - ${data.projectId}`);
  }

  async handleDeploymentRequested(data) {
    console.log(`${this.serviceName}: Deployment requested - ${data.deploymentId}`);
  }

  async handleDeploymentCompleted(data) {
    console.log(`${this.serviceName}: Deployment completed - ${data.deploymentId}`);
  }

  /**
   * Publish events to the event bus
   */
  async publishEvent(eventType, data) {
    try {
      await this.eventBus.publish(eventType, {
        ...data,
        source: this.serviceName,
        timestamp: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:`, error);
      return false;
    }
  }

  /**
   * Get service health status
   */
  getHealthStatus() {
    return {
      service: this.serviceName,
      status: this.health.status,
      lastCheck: this.health.lastCheck,
      dependencies: this.health.dependencies,
      eventBus: this.eventBus.isConnected(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      error: this.health.error || null
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      await this.eventBus.disconnect();
      console.log(`🛑 ${this.serviceName} adapter shutdown complete`);
    } catch (error) {
      console.error(`Error during ${this.serviceName} adapter shutdown:`, error);
    }
  }
}

module.exports = { VisionServiceAdapter };