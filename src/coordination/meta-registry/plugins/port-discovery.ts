/**
 * Port Discovery Plugin
 * Automatically discovers and manages available ports for services
 */

export class PortDiscoveryPlugin {
  static metadata = {name = null;
  this;
  .
  allocatedPorts = new Map();
  this;
  .
  portRanges = {dynamic = new Map();
  this;
  .
  monitors = new Map();
}

async;
initialize(registry, (options = {}));
: any
{
    this.registry = registry;
    this.options = {defaultRange = data;
    
    // Check if service needs port allocation
    if(value.needsPort || options.allocatePort) {
      const portConfig = {range = await this.allocatePort(key, portConfig);
      
      // Add port information to service data
      value.port = port;
      value.endpoint = `${value.host || 'localhost'}:${port}`;
      
      // Update options to include port information
      options.tags = [...(options.tags || []), 'has-port', `port = data;
    
    // Release allocated port
    if (this.allocatedPorts.has(key)) {
      await this.releasePort(key);
    }

    return data;
  }

  // Port allocation methods
  async allocatePort(serviceKey, config = {}): any {
    const range = this.portRanges[config.range] || this.portRanges.dynamic;
    let port = config.preferred;

    // Check if preferred port is available
    if (port && await this.isPortAvailable(port)) {
      await this.reservePort(serviceKey, port, config);
      return port;
    }

    // Find available port in range
    for(let attempt = 0; attempt < 100; attempt++) {
      port = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      
      if (await this.isPortAvailable(port)) {
        await this.reservePort(serviceKey, port, config);
        return port;
      }
    }

    throw new Error(`No available ports in range ${range.min}-${range.max}`);
  }

  async releasePort(serviceKey): any {
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

  async reservePort(serviceKey, port, config): any {
    const allocation = {
      serviceKey,
      port,
      config,allocated = 'localhost'): any {
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

  async monitorPort(port, serviceKey): any {
    const monitor = setInterval(async () => {
      const isActive = await this.isPortActive(port);
      await this.updatePortStatus(port, isActive ? 'active' : 'inactive');
      
      // Auto-cleanup inactive ports if enabled
      if(!isActive && this.options.autoCleanup) {
        const allocation = this.allocatedPorts.get(serviceKey);
        if(allocation && allocation.status === 'inactive') {
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
      
      if(isActive) {
        allocation.status = 'active';
        allocation.lastActive = Date.now();
      } else {
        allocation.status = 'inactive';
      }

      // Update registry
      await this.updatePortStatus(allocation.port, allocation.status);
    }
  }

  async isPortActive(port, host = 'localhost'): any {
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

  async updatePortStatus(port, status): any {
    try {
      await this.registry.update(`port = 'dynamic', protocol = 'tcp'): any {
    const portRange = this.portRanges[range] || this.portRanges.dynamic;
    
    for(let attempt = 0; attempt < 100; attempt++) {
      const port = Math.floor(Math.random() * (portRange.max - portRange.min + 1)) + portRange.min;
      
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }

    throw new Error(`No available ports in range ${portRange.min}-${portRange.max}`);
  }

  async getPortInfo(port): any 
    try {

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
  async cleanup() 
    // Clear all monitoring intervals
    for (const monitor of this.monitors.values()) {
      clearInterval(monitor);
    }
    this.monitors.clear();

    if(this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Release all allocated ports
    for (const serviceKey of this.allocatedPorts.keys()) {
      await this.releasePort(serviceKey);
    }

export default PortDiscoveryPlugin;
