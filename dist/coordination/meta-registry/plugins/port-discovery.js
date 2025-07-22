/**
 * Port Discovery Plugin
 * Automatically discovers and manages available ports for services
 */

import net from 'net';
import { nanoid } from 'nanoid';

export class PortDiscoveryPlugin {
  static metadata = {
    name: 'port-discovery',
    version: '1.0.0',
    description: 'Automatically discovers and manages available ports for services',
    dependencies: [],
    capabilities: ['port-allocation', 'port-monitoring', 'port-cleanup']
  };

  constructor() {
    this.registry = null;
    this.allocatedPorts = new Map();
    this.portRanges = {
      dynamic: { min: 49152, max: 65535 },
      service: { min: 3000, max: 9999 },
      internal: { min: 10000, max: 19999 }
    };
    this.reservations = new Map();
    this.monitors = new Map();
  }

  async initialize(registry, options = {}) {
    this.registry = registry;
    this.options = {
      defaultRange: 'dynamic',
      monitorInterval: 30000,
      autoCleanup: true,
      ...options
    };

    // Register hooks for automatic port management
    registry.pluginSystem.registerHook('beforeRegister', this.handleServiceRegistration.bind(this));
    registry.pluginSystem.registerHook('afterUnregister', this.handleServiceUnregistration.bind(this));

    // Start port monitoring if enabled
    if (this.options.monitorInterval > 0) {
      this.startPortMonitoring();
    }

    // Register plugin services in registry
    await this.registerPluginServices();
  }

  async registerPluginServices() {
    // Register port discovery service
    await this.registry.register('service:port-discovery', {
      plugin: 'port-discovery',
      version: PortDiscoveryPlugin.metadata.version,
      capabilities: PortDiscoveryPlugin.metadata.capabilities,
      ranges: this.portRanges,
      stats: {
        allocated: this.allocatedPorts.size,
        reserved: this.reservations.size,
        monitored: this.monitors.size
      }
    }, {
      tags: ['service', 'plugin', 'port-discovery'],
      ttl: 3600
    });
  }

  // Hook handlers
  async handleServiceRegistration(data) {
    const { key, value, options } = data;
    
    // Check if service needs port allocation
    if (value.needsPort || options.allocatePort) {
      const portConfig = {
        range: options.portRange || this.options.defaultRange,
        preferred: options.preferredPort,
        protocol: options.protocol || 'tcp'
      };

      const port = await this.allocatePort(key, portConfig);
      
      // Add port information to service data
      value.port = port;
      value.endpoint = `${value.host || 'localhost'}:${port}`;
      
      // Update options to include port information
      options.tags = [...(options.tags || []), 'has-port', `port:${port}`];
    }

    return data;
  }

  async handleServiceUnregistration(data) {
    const { key } = data;
    
    // Release allocated port
    if (this.allocatedPorts.has(key)) {
      await this.releasePort(key);
    }

    return data;
  }

  // Port allocation methods
  async allocatePort(serviceKey, config = {}) {
    const range = this.portRanges[config.range] || this.portRanges.dynamic;
    let port = config.preferred;

    // Check if preferred port is available
    if (port && await this.isPortAvailable(port)) {
      await this.reservePort(serviceKey, port, config);
      return port;
    }

    // Find available port in range
    for (let attempt = 0; attempt < 100; attempt++) {
      port = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      
      if (await this.isPortAvailable(port)) {
        await this.reservePort(serviceKey, port, config);
        return port;
      }
    }

    throw new Error(`No available ports in range ${range.min}-${range.max}`);
  }

  async releasePort(serviceKey) {
    const allocation = this.allocatedPorts.get(serviceKey);
    if (!allocation) return false;

    // Stop monitoring
    if (this.monitors.has(allocation.port)) {
      clearInterval(this.monitors.get(allocation.port));
      this.monitors.delete(allocation.port);
    }

    // Remove allocation
    this.allocatedPorts.delete(serviceKey);
    this.reservations.delete(allocation.port);

    // Update registry
    await this.updatePortStatus(allocation.port, 'released');

    return true;
  }

  async reservePort(serviceKey, port, config) {
    const allocation = {
      serviceKey,
      port,
      config,
      allocated: new Date(),
      status: 'allocated'
    };

    this.allocatedPorts.set(serviceKey, allocation);
    this.reservations.set(port, allocation);

    // Start monitoring port usage
    await this.monitorPort(port, serviceKey);

    // Register port in registry
    await this.registry.register(`port:${port}`, {
      port,
      serviceKey,
      status: 'allocated',
      protocol: config.protocol || 'tcp',
      allocated: allocation.allocated,
      range: config.range
    }, {
      tags: ['port', 'allocated', `service:${serviceKey}`],
      ttl: config.ttl || 3600
    });

    return port;
  }

  async isPortAvailable(port, host = 'localhost') {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, host, () => {
        server.once('close', () => resolve(true));
        server.close();
      });

      server.on('error', () => resolve(false));
    });
  }

  // Port monitoring
  startPortMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkAllocatedPorts();
    }, this.options.monitorInterval);
  }

  async monitorPort(port, serviceKey) {
    const monitor = setInterval(async () => {
      const isActive = await this.isPortActive(port);
      await this.updatePortStatus(port, isActive ? 'active' : 'inactive');
      
      // Auto-cleanup inactive ports if enabled
      if (!isActive && this.options.autoCleanup) {
        const allocation = this.allocatedPorts.get(serviceKey);
        if (allocation && allocation.status === 'inactive') {
          const inactiveTime = Date.now() - allocation.lastActive;
          if (inactiveTime > (this.options.cleanupDelay || 300000)) { // 5 minutes
            await this.releasePort(serviceKey);
          }
        }
      }
    }, this.options.monitorInterval);

    this.monitors.set(port, monitor);
  }

  async checkAllocatedPorts() {
    for (const [serviceKey, allocation] of this.allocatedPorts.entries()) {
      const isActive = await this.isPortActive(allocation.port);
      
      if (isActive) {
        allocation.status = 'active';
        allocation.lastActive = Date.now();
      } else {
        allocation.status = 'inactive';
      }

      // Update registry
      await this.updatePortStatus(allocation.port, allocation.status);
    }
  }

  async isPortActive(port, host = 'localhost') {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 1000;

      socket.setTimeout(timeout);
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => resolve(false));
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  async updatePortStatus(port, status) {
    try {
      await this.registry.update(`port:${port}`, {
        status,
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      // Port entry might not exist, ignore
    }
  }

  // Plugin API methods
  async getAvailablePort(range = 'dynamic', protocol = 'tcp') {
    const portRange = this.portRanges[range] || this.portRanges.dynamic;
    
    for (let attempt = 0; attempt < 100; attempt++) {
      const port = Math.floor(Math.random() * (portRange.max - portRange.min + 1)) + portRange.min;
      
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }

    throw new Error(`No available ports in range ${portRange.min}-${portRange.max}`);
  }

  async getPortInfo(port) {
    try {
      const results = await this.registry.discover({
        keyPattern: `^port:${port}$`
      });
      
      return results.length > 0 ? results[0].value : null;
    } catch (error) {
      return null;
    }
  }

  async getAllocatedPorts() {
    return Array.from(this.allocatedPorts.entries()).map(([serviceKey, allocation]) => ({
      serviceKey,
      port: allocation.port,
      status: allocation.status,
      allocated: allocation.allocated,
      config: allocation.config
    }));
  }

  async getPortStats() {
    const allocated = this.allocatedPorts.size;
    const reserved = this.reservations.size;
    const monitored = this.monitors.size;
    
    const byRange = {};
    for (const allocation of this.allocatedPorts.values()) {
      const range = allocation.config.range || 'unknown';
      byRange[range] = (byRange[range] || 0) + 1;
    }

    return {
      allocated,
      reserved,
      monitored,
      byRange,
      ranges: this.portRanges
    };
  }

  // Cleanup
  async cleanup() {
    // Clear all monitoring intervals
    for (const monitor of this.monitors.values()) {
      clearInterval(monitor);
    }
    this.monitors.clear();

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Release all allocated ports
    for (const serviceKey of this.allocatedPorts.keys()) {
      await this.releasePort(serviceKey);
    }
  }
}

export default PortDiscoveryPlugin;