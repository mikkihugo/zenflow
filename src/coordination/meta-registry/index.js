/**
 * Ultra-Modular Meta Registry System
 * 
 * A universal coordination substrate that can be ANYTHING:
 * - JSON file
 * - Redis cluster
 * - Consul service mesh
 * - etcd distributed store
 * - Custom P2P network
 * - Blockchain registry
 * - In-memory cache
 * - Database records
 * 
 * The registry abstraction makes ALL backend types possible through plugins
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

/**
 * Base Registry Interface
 * All registry implementations must conform to this interface
 */
export class RegistryInterface {
  /**
   * Register an entity in the registry
   * @param {string} key - Unique identifier
   * @param {Object} value - Entity data
   * @param {Object} options - Registration options (TTL, tags, etc.)
   * @returns {Promise<string>} - Registration ID
   */
  async register(key, value, options = {}) {
    throw new Error('register() must be implemented by registry backend');
  }

  /**
   * Discover entities in the registry
   * @param {Object} query - Discovery query (tags, patterns, etc.)
   * @param {Object} options - Discovery options
   * @returns {Promise<Array>} - Discovered entities
   */
  async discover(query, options = {}) {
    throw new Error('discover() must be implemented by registry backend');
  }

  /**
   * Update entity in registry
   * @param {string} key - Entity key
   * @param {Object} updates - Update data
   * @param {Object} options - Update options
   * @returns {Promise<boolean>} - Success status
   */
  async update(key, updates, options = {}) {
    throw new Error('update() must be implemented by registry backend');
  }

  /**
   * Remove entity from registry
   * @param {string} key - Entity key
   * @param {Object} options - Removal options
   * @returns {Promise<boolean>} - Success status
   */
  async unregister(key, options = {}) {
    throw new Error('unregister() must be implemented by registry backend');
  }

  /**
   * Watch for changes in the registry
   * @param {Object} query - Watch query
   * @param {Function} callback - Change callback
   * @param {Object} options - Watch options
   * @returns {Function} - Unwatch function
   */
  async watch(query, callback, options = {}) {
    throw new Error('watch() must be implemented by registry backend');
  }

  /**
   * Get registry health/status
   * @returns {Promise<Object>} - Health status
   */
  async health() {
    throw new Error('health() must be implemented by registry backend');
  }

  /**
   * Close registry connections
   * @returns {Promise<void>}
   */
  async close() {
    throw new Error('close() must be implemented by registry backend');
  }
}

/**
 * Plugin System for Registry Extensions
 * Allows modular coordination patterns
 */
export class RegistryPluginSystem extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map();
    this.hooks = new Map();
    this.middleware = [];
  }

  /**
   * Register a plugin
   * @param {string} name - Plugin name
   * @param {Object} plugin - Plugin implementation
   * @param {Object} options - Plugin options
   */
  registerPlugin(name, plugin, options = {}) {
    if (!plugin.initialize || typeof plugin.initialize !== 'function') {
      throw new Error(`Plugin '${name}' must have an initialize() method`);
    }

    this.plugins.set(name, {
      instance: plugin,
      options,
      initialized: false,
      metadata: plugin.metadata || {}
    });

    this.emit('pluginRegistered', { name, plugin, options });
  }

  /**
   * Initialize a plugin
   * @param {string} name - Plugin name
   * @param {Object} registry - Registry instance
   * @param {Object} context - Initialization context
   */
  async initializePlugin(name, registry, context = {}) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin '${name}' not found`);
    }

    if (!plugin.initialized) {
      await plugin.instance.initialize(registry, { ...plugin.options, ...context });
      plugin.initialized = true;
      this.emit('pluginInitialized', { name, plugin });
    }
  }

  /**
   * Register a hook for plugin lifecycle events
   * @param {string} event - Hook event (beforeRegister, afterDiscover, etc.)
   * @param {Function} handler - Hook handler
   */
  registerHook(event, handler) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event).push(handler);
  }

  /**
   * Execute hooks for an event
   * @param {string} event - Hook event
   * @param {Object} data - Hook data
   * @returns {Promise<Object>} - Modified data
   */
  async executeHooks(event, data) {
    const hooks = this.hooks.get(event) || [];
    let result = data;

    for (const hook of hooks) {
      try {
        result = await hook(result) || result;
      } catch (error) {
        this.emit('hookError', { event, error, data });
      }
    }

    return result;
  }

  /**
   * Add middleware for registry operations
   * @param {Function} middleware - Middleware function
   */
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Execute middleware stack
   * @param {string} operation - Operation name
   * @param {Array} args - Operation arguments
   * @param {Function} next - Next function
   * @returns {Promise<any>} - Operation result
   */
  async executeMiddleware(operation, args, next) {
    let index = 0;

    const dispatch = async (i) => {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;

      const middleware = this.middleware[i];
      if (i === this.middleware.length) {
        return next(...args);
      }

      return middleware(operation, args, () => dispatch(i + 1));
    };

    return dispatch(0);
  }

  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {Object|null} - Plugin instance
   */
  getPlugin(name) {
    const plugin = this.plugins.get(name);
    return plugin?.instance || null;
  }

  /**
   * List all plugins
   * @returns {Array} - Plugin list
   */
  listPlugins() {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      metadata: plugin.metadata,
      initialized: plugin.initialized,
      options: plugin.options
    }));
  }
}

/**
 * Universal Meta Registry
 * The core orchestration system that ties everything together
 */
export class MetaRegistry extends EventEmitter {
  constructor(backend, options = {}) {
    super();
    this.backend = backend;
    this.options = options;
    this.pluginSystem = new RegistryPluginSystem();
    this.coordinators = new Map();
    this.swarms = new Map();
    this.id = nanoid();
    this.state = 'initialized';
    
    // Bind plugin system events
    this.pluginSystem.on('pluginRegistered', (event) => {
      this.emit('pluginRegistered', event);
    });
    
    this.pluginSystem.on('pluginInitialized', (event) => {
      this.emit('pluginInitialized', event);
    });
  }

  /**
   * Initialize the meta registry
   * @param {Object} config - Configuration
   * @returns {Promise<void>}
   */
  async initialize(config = {}) {
    this.state = 'initializing';
    
    try {
      // Initialize backend
      if (this.backend.initialize) {
        await this.backend.initialize(config);
      }

      // Initialize plugins
      for (const [name] of this.pluginSystem.plugins) {
        await this.pluginSystem.initializePlugin(name, this, config);
      }

      this.state = 'ready';
      this.emit('ready', { id: this.id, config });
    } catch (error) {
      this.state = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Register entity through plugin system
   * @param {string} key - Entity key
   * @param {Object} value - Entity value
   * @param {Object} options - Registration options
   * @returns {Promise<string>} - Registration ID
   */
  async register(key, value, options = {}) {
    const data = await this.pluginSystem.executeHooks('beforeRegister', {
      key, value, options, registry: this
    });

    const result = await this.pluginSystem.executeMiddleware(
      'register',
      [data.key, data.value, data.options],
      async (k, v, o) => this.backend.register(k, v, o)
    );

    await this.pluginSystem.executeHooks('afterRegister', {
      key: data.key, value: data.value, options: data.options, result, registry: this
    });

    this.emit('registered', { key: data.key, value: data.value, result });
    return result;
  }

  /**
   * Discover entities through plugin system
   * @param {Object} query - Discovery query
   * @param {Object} options - Discovery options
   * @returns {Promise<Array>} - Discovered entities
   */
  async discover(query, options = {}) {
    const data = await this.pluginSystem.executeHooks('beforeDiscover', {
      query, options, registry: this
    });

    const result = await this.pluginSystem.executeMiddleware(
      'discover',
      [data.query, data.options],
      async (q, o) => this.backend.discover(q, o)
    );

    await this.pluginSystem.executeHooks('afterDiscover', {
      query: data.query, options: data.options, result, registry: this
    });

    this.emit('discovered', { query: data.query, result });
    return result;
  }

  /**
   * Create swarm coordinator
   * @param {string} swarmId - Swarm identifier
   * @param {Object} config - Swarm configuration
   * @returns {Promise<Object>} - Swarm coordinator
   */
  async createSwarmCoordinator(swarmId, config = {}) {
    const coordinator = new SwarmCoordinator(swarmId, this, config);
    await coordinator.initialize();
    
    this.coordinators.set(swarmId, coordinator);
    this.swarms.set(swarmId, {
      id: swarmId,
      coordinator,
      config,
      created: new Date(),
      agents: new Map()
    });

    this.emit('swarmCreated', { swarmId, coordinator, config });
    return coordinator;
  }

  /**
   * Get swarm coordinator
   * @param {string} swarmId - Swarm identifier
   * @returns {Object|null} - Swarm coordinator
   */
  getSwarmCoordinator(swarmId) {
    return this.coordinators.get(swarmId) || null;
  }

  /**
   * List all swarms
   * @returns {Array} - Swarm list
   */
  listSwarms() {
    return Array.from(this.swarms.values()).map(swarm => ({
      id: swarm.id,
      config: swarm.config,
      created: swarm.created,
      agentCount: swarm.agents.size
    }));
  }

  /**
   * Use plugin
   * @param {string} name - Plugin name
   * @param {Object} plugin - Plugin implementation
   * @param {Object} options - Plugin options
   * @returns {MetaRegistry} - This instance (for chaining)
   */
  use(name, plugin, options = {}) {
    this.pluginSystem.registerPlugin(name, plugin, options);
    return this;
  }

  /**
   * Get registry status
   * @returns {Promise<Object>} - Status information
   */
  async status() {
    const backendHealth = await this.backend.health?.() || { status: 'unknown' };
    
    return {
      id: this.id,
      state: this.state,
      backend: backendHealth,
      plugins: this.pluginSystem.listPlugins(),
      swarms: this.listSwarms(),
      uptime: process.uptime()
    };
  }

  /**
   * Close the registry
   * @returns {Promise<void>}
   */
  async close() {
    this.state = 'closing';
    
    // Close all swarm coordinators
    for (const coordinator of this.coordinators.values()) {
      await coordinator.close?.();
    }

    // Close backend
    await this.backend.close?.();
    
    this.state = 'closed';
    this.emit('closed');
  }
}

/**
 * Swarm Coordinator for distributed agent management
 */
export class SwarmCoordinator extends EventEmitter {
  constructor(swarmId, registry, config = {}) {
    super();
    this.swarmId = swarmId;
    this.registry = registry;
    this.config = config;
    this.agents = new Map();
    this.topology = config.topology || 'mesh';
    this.state = 'created';
  }

  /**
   * Initialize swarm coordinator
   * @returns {Promise<void>}
   */
  async initialize() {
    this.state = 'initializing';
    
    // Register swarm in meta registry
    await this.registry.register(`swarm:${this.swarmId}`, {
      id: this.swarmId,
      topology: this.topology,
      config: this.config,
      state: this.state,
      created: new Date().toISOString()
    }, {
      tags: ['swarm', 'coordinator'],
      ttl: this.config.ttl || 3600
    });

    this.state = 'ready';
    this.emit('ready');
  }

  /**
   * Register agent in swarm
   * @param {string} agentId - Agent identifier
   * @param {Object} agentInfo - Agent information
   * @returns {Promise<void>}
   */
  async registerAgent(agentId, agentInfo) {
    const agent = {
      id: agentId,
      ...agentInfo,
      swarmId: this.swarmId,
      registered: new Date().toISOString()
    };

    this.agents.set(agentId, agent);

    // Register agent in meta registry
    await this.registry.register(`agent:${agentId}`, agent, {
      tags: ['agent', `swarm:${this.swarmId}`],
      ttl: this.config.agentTtl || 300
    });

    this.emit('agentRegistered', { agentId, agent });
  }

  /**
   * Discover other swarms
   * @param {Object} query - Discovery query
   * @returns {Promise<Array>} - Discovered swarms
   */
  async discoverSwarms(query = {}) {
    return this.registry.discover({
      tags: ['swarm'],
      ...query
    });
  }

  /**
   * Discover agents in swarm or across swarms
   * @param {Object} query - Discovery query
   * @returns {Promise<Array>} - Discovered agents
   */
  async discoverAgents(query = {}) {
    const defaultQuery = query.swarmId ? 
      { tags: ['agent', `swarm:${query.swarmId}`] } :
      { tags: ['agent'] };
    
    return this.registry.discover({
      ...defaultQuery,
      ...query
    });
  }

  /**
   * Send message to agents
   * @param {Object} message - Message to send
   * @param {Object} options - Send options
   * @returns {Promise<void>}
   */
  async broadcast(message, options = {}) {
    const agents = options.agents || Array.from(this.agents.keys());
    const messageId = nanoid();
    
    for (const agentId of agents) {
      await this.registry.register(`message:${messageId}:${agentId}`, {
        id: messageId,
        from: this.swarmId,
        to: agentId,
        message,
        timestamp: new Date().toISOString()
      }, {
        tags: ['message', `agent:${agentId}`],
        ttl: options.ttl || 60
      });
    }

    this.emit('messageSent', { messageId, message, agents });
  }

  /**
   * Listen for messages
   * @param {Function} callback - Message callback
   * @returns {Function} - Unlisten function
   */
  async listen(callback) {
    return this.registry.backend.watch({
      tags: [`swarm:${this.swarmId}`, 'message']
    }, callback);
  }

  /**
   * Get swarm statistics
   * @returns {Object} - Swarm statistics
   */
  getStats() {
    return {
      swarmId: this.swarmId,
      topology: this.topology,
      state: this.state,
      agentCount: this.agents.size,
      agents: Array.from(this.agents.values())
    };
  }

  /**
   * Close swarm coordinator
   * @returns {Promise<void>}
   */
  async close() {
    this.state = 'closing';
    
    // Unregister all agents
    for (const agentId of this.agents.keys()) {
      await this.registry.backend.unregister?.(`agent:${agentId}`);
    }

    // Unregister swarm
    await this.registry.backend.unregister?.(`swarm:${this.swarmId}`);
    
    this.state = 'closed';
    this.emit('closed');
  }
}

export default MetaRegistry;