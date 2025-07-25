/**
 * NAT Traversal Plugin
 * Provides NAT/firewall traversal capabilities for distributed coordination
 */

import dgram from 'dgram';
import net from 'net';
import { nanoid } from 'nanoid';

export class NATTraversalPlugin {
  static metadata = {
    name: 'nat-traversal',
    version: '1.0.0',
    description: 'NAT/firewall traversal for distributed coordination',
    dependencies: [],
    capabilities: ['hole-punching', 'relay-coordination', 'upnp-mapping', 'stun-discovery']
  };

  constructor() {
    this.registry = null;
    this.stunServers = [
      'stun.l.google.com:19302',
      'stun1.l.google.com:19302',
      'stun2.l.google.com:19302'
    ];
    this.relayNodes = new Map();
    this.natMappings = new Map();
    this.holePunches = new Map();
    this.upnpClient = null;
  }

  async initialize(registry, options = {}) {
    this.registry = registry;
    this.options = {
      enableSTUN: true,
      enableUPnP: true,
      enableRelay: true,
      relayPort: 0, // Auto-assign
      stunTimeout: 5000,
      holePunchRetries: 3,
      relayTTL: 3600,
      ...options
    };

    // Register plugin hooks
    registry.pluginSystem.registerHook('beforeRegister', this.handleServiceRegistration.bind(this));
    registry.pluginSystem.registerHook('afterUnregister', this.handleServiceUnregistration.bind(this));

    // Initialize NAT traversal capabilities
    await this.initializeTraversalCapabilities();

    // Register plugin services
    await this.registerPluginServices();
  }

  async initializeTraversalCapabilities() {
    // Discover external IP via STUN
    if (this.options.enableSTUN) {
      try {
        this.externalIP = await this.discoverExternalIP();
      } catch (error) {
        console.warn('STUN discovery failed:', error.message);
      }
    }

    // Initialize UPnP if available
    if (this.options.enableUPnP) {
      try {
        await this.initializeUPnP();
      } catch (error) {
        console.warn('UPnP initialization failed:', error.message);
      }
    }

    // Start relay service if enabled
    if (this.options.enableRelay) {
      await this.startRelayService();
    }
  }

  async registerPluginServices() {
    // Register NAT traversal service
    await this.registry.register('service:nat-traversal', {
      plugin: 'nat-traversal',
      version: NATTraversalPlugin.metadata.version,
      capabilities: NATTraversalPlugin.metadata.capabilities,
      externalIP: this.externalIP,
      relayPort: this.relayPort,
      stats: {
        mappings: this.natMappings.size,
        holePunches: this.holePunches.size,
        relayNodes: this.relayNodes.size
      }
    }, {
      tags: ['service', 'plugin', 'nat-traversal'],
      ttl: 3600
    });
  }

  // Hook handlers
  async handleServiceRegistration(data) {
    const { key, value, options } = data;
    
    // Auto-setup NAT traversal if service needs external connectivity
    if (value.needsExternalAccess || options.enableNATTraversal) {
      await this.setupServiceNATTraversal(key, value, options);
    }

    return data;
  }

  async handleServiceUnregistration(data) {
    const { key } = data;
    
    // Cleanup NAT traversal resources
    await this.cleanupServiceNATTraversal(key);

    return data;
  }

  async setupServiceNATTraversal(serviceKey, serviceConfig, options) {
    const traversalConfig = {
      port: serviceConfig.port,
      protocol: serviceConfig.protocol || 'tcp',
      publicAccess: options.publicAccess || false,
      relayEnabled: options.enableRelay !== false,
      ...options.natTraversal
    };

    // Create port mapping
    if (traversalConfig.port) {
      const mapping = await this.createPortMapping(
        serviceKey,
        traversalConfig.port,
        traversalConfig.protocol
      );
      
      if (mapping) {
        serviceConfig.externalPort = mapping.externalPort;
        serviceConfig.externalIP = mapping.externalIP;
        options.tags = [...(options.tags || []), 'nat-mapped', `external:${mapping.externalPort}`];
      }
    }

    // Setup relay if requested
    if (traversalConfig.relayEnabled) {
      const relay = await this.setupRelay(serviceKey, traversalConfig);
      if (relay) {
        serviceConfig.relayEndpoint = `${this.externalIP}:${this.relayPort}`;
        options.tags = [...(options.tags || []), 'relay-enabled'];
      }
    }
  }

  async cleanupServiceNATTraversal(serviceKey) {
    // Remove port mappings
    for (const [mappingId, mapping] of this.natMappings.entries()) {
      if (mapping.serviceKey === serviceKey) {
        await this.removePortMapping(mappingId);
      }
    }

    // Remove relay configurations
    for (const [relayId, relay] of this.relayNodes.entries()) {
      if (relay.serviceKey === serviceKey) {
        await this.removeRelay(relayId);
      }
    }

    // Clean up hole punches
    for (const [punchId, punch] of this.holePunches.entries()) {
      if (punch.serviceKey === serviceKey) {
        this.holePunches.delete(punchId);
      }
    }
  }

  // STUN implementation
  async discoverExternalIP() {
    return new Promise((resolve, reject) => {
      const socket = dgram.createSocket('udp4');
      const stunServer = this.stunServers[0].split(':');
      const host = stunServer[0];
      const port = parseInt(stunServer[1]);

      // STUN binding request
      const transactionId = Buffer.allocUnsafe(12);
      for (let i = 0; i < 12; i++) {
        transactionId[i] = Math.floor(Math.random() * 256);
      }

      const request = Buffer.alloc(20);
      request.writeUInt16BE(0x0001, 0); // Message Type: Binding Request
      request.writeUInt16BE(0x0000, 2); // Message Length
      request.writeUInt32BE(0x2112A442, 4); // Magic Cookie
      transactionId.copy(request, 8);

      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('STUN timeout'));
      }, this.options.stunTimeout);

      socket.on('message', (msg, rinfo) => {
        clearTimeout(timeout);
        
        try {
          // Parse STUN response
          if (msg.length >= 20 && msg.readUInt16BE(0) === 0x0101) {
            const length = msg.readUInt16BE(2);
            let offset = 20;
            
            while (offset < 20 + length) {
              const type = msg.readUInt16BE(offset);
              const attrLength = msg.readUInt16BE(offset + 2);
              
              if (type === 0x0001) { // MAPPED-ADDRESS
                const family = msg.readUInt8(offset + 5);
                if (family === 0x01) { // IPv4
                  const port = msg.readUInt16BE(offset + 6);
                  const ip = Array.from(msg.slice(offset + 8, offset + 12)).join('.');
                  socket.close();
                  resolve(ip);
                  return;
                }
              }
              
              offset += 4 + attrLength;
              if (attrLength % 4 !== 0) {
                offset += 4 - (attrLength % 4);
              }
            }
          }
          
          socket.close();
          reject(new Error('Invalid STUN response'));
        } catch (error) {
          socket.close();
          reject(error);
        }
      });

      socket.send(request, 0, request.length, port, host);
    });
  }

  // Port mapping management
  async createPortMapping(serviceKey, internalPort, protocol = 'tcp') {
    const mappingId = nanoid();
    let externalPort = internalPort;

    // Try UPnP mapping first
    if (this.upnpClient) {
      try {
        externalPort = await this.createUPnPMapping(internalPort, protocol);
      } catch (error) {
        console.warn('UPnP mapping failed:', error.message);
      }
    }

    const mapping = {
      id: mappingId,
      serviceKey,
      internalPort,
      externalPort,
      externalIP: this.externalIP,
      protocol,
      created: new Date(),
      method: this.upnpClient ? 'upnp' : 'manual'
    };

    this.natMappings.set(mappingId, mapping);

    // Register mapping in registry
    await this.registry.register(`nat-mapping:${mappingId}`, mapping, {
      tags: ['nat-mapping', 'port-mapping', `service:${serviceKey}`],
      ttl: this.options.relayTTL
    });

    return mapping;
  }

  async removePortMapping(mappingId) {
    const mapping = this.natMappings.get(mappingId);
    if (!mapping) return false;

    // Remove UPnP mapping if applicable
    if (mapping.method === 'upnp' && this.upnpClient) {
      try {
        await this.removeUPnPMapping(mapping.externalPort, mapping.protocol);
      } catch (error) {
        console.warn('UPnP removal failed:', error.message);
      }
    }

    this.natMappings.delete(mappingId);
    await this.registry.backend.unregister?.(`nat-mapping:${mappingId}`);

    return true;
  }

  // Hole punching
  async performHolePunching(localEndpoint, remoteEndpoint, options = {}) {
    const punchId = nanoid();
    const punch = {
      id: punchId,
      localEndpoint,
      remoteEndpoint,
      status: 'attempting',
      attempts: 0,
      maxAttempts: this.options.holePunchRetries,
      created: new Date()
    };

    this.holePunches.set(punchId, punch);

    try {
      const success = await this.executeHolePunch(punch, options);
      punch.status = success ? 'success' : 'failed';
      punch.completed = new Date();

      // Register result in registry
      await this.registry.register(`hole-punch:${punchId}`, punch, {
        tags: ['hole-punch', punch.status],
        ttl: 300
      });

      return success;
    } catch (error) {
      punch.status = 'error';
      punch.error = error.message;
      return false;
    }
  }

  async executeHolePunch(punch, options) {
    const { protocol = 'udp' } = options;
    
    if (protocol === 'udp') {
      return this.executeUDPHolePunch(punch);
    } else if (protocol === 'tcp') {
      return this.executeTCPHolePunch(punch);
    }
    
    throw new Error(`Unsupported protocol for hole punching: ${protocol}`);
  }

  async executeUDPHolePunch(punch) {
    return new Promise((resolve) => {
      const socket = dgram.createSocket('udp4');
      const [remoteHost, remotePort] = punch.remoteEndpoint.split(':');
      
      let attempts = 0;
      const maxAttempts = punch.maxAttempts;
      
      const attemptPunch = () => {
        if (attempts >= maxAttempts) {
          socket.close();
          resolve(false);
          return;
        }

        punch.attempts = ++attempts;
        
        // Send punch packet
        const message = Buffer.from(`PUNCH:${punch.id}:${Date.now()}`);
        socket.send(message, parseInt(remotePort), remoteHost);
        
        setTimeout(attemptPunch, 1000);
      };

      socket.on('message', (msg, rinfo) => {
        if (msg.toString().startsWith('PUNCH_ACK:')) {
          socket.close();
          resolve(true);
        }
      });

      attemptPunch();
    });
  }

  async executeTCPHolePunch(punch) {
    // TCP hole punching is more complex and less reliable
    // This is a simplified implementation
    return new Promise((resolve) => {
      const [remoteHost, remotePort] = punch.remoteEndpoint.split(':');
      let attempts = 0;
      const maxAttempts = punch.maxAttempts;

      const attemptConnection = () => {
        if (attempts >= maxAttempts) {
          resolve(false);
          return;
        }

        punch.attempts = ++attempts;
        
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.connect(parseInt(remotePort), remoteHost, () => {
          socket.destroy();
          resolve(true);
        });

        socket.on('error', () => {
          setTimeout(attemptConnection, 1000);
        });

        socket.on('timeout', () => {
          socket.destroy();
          setTimeout(attemptConnection, 1000);
        });
      };

      attemptConnection();
    });
  }

  // Relay service
  async startRelayService() {
    if (this.relayServer) return;

    this.relayServer = dgram.createSocket('udp4');
    
    this.relayServer.on('message', (msg, rinfo) => {
      this.handleRelayMessage(msg, rinfo);
    });

    this.relayServer.bind(this.options.relayPort);
    
    this.relayServer.on('listening', () => {
      const address = this.relayServer.address();
      this.relayPort = address.port;
    });
  }

  async setupRelay(serviceKey, config) {
    if (!this.relayServer) {
      await this.startRelayService();
    }

    const relayId = nanoid();
    const relay = {
      id: relayId,
      serviceKey,
      config,
      created: new Date(),
      stats: {
        messagesRelayed: 0,
        bytesRelayed: 0
      }
    };

    this.relayNodes.set(relayId, relay);

    // Register relay in registry
    await this.registry.register(`relay:${relayId}`, relay, {
      tags: ['relay', 'nat-traversal', `service:${serviceKey}`],
      ttl: this.options.relayTTL
    });

    return relay;
  }

  async removeRelay(relayId) {
    const relay = this.relayNodes.get(relayId);
    if (!relay) return false;

    this.relayNodes.delete(relayId);
    await this.registry.backend.unregister?.(`relay:${relayId}`);

    return true;
  }

  handleRelayMessage(message, rinfo) {
    // Basic relay message handling
    // In a real implementation, this would route messages between peers
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'relay') {
        const targetRelay = this.relayNodes.get(data.relayId);
        if (targetRelay) {
          targetRelay.stats.messagesRelayed++;
          targetRelay.stats.bytesRelayed += message.length;
          
          // Forward message logic would go here
          this.registry.emit('relayMessage', { data, rinfo, relay: targetRelay });
        }
      }
    } catch (error) {
      // Invalid message format, ignore
    }
  }

  // UPnP placeholder methods
  async initializeUPnP() {
    // UPnP implementation would go here
    // This would typically use a library like node-upnp-client
    this.upnpClient = null; // Placeholder
  }

  async createUPnPMapping(port, protocol) {
    // UPnP port mapping implementation
    throw new Error('UPnP not implemented in this example');
  }

  async removeUPnPMapping(port, protocol) {
    // UPnP port mapping removal
    throw new Error('UPnP not implemented in this example');
  }

  // Query and management methods
  async getTraversalInfo() {
    return {
      externalIP: this.externalIP,
      relayPort: this.relayPort,
      capabilities: NATTraversalPlugin.metadata.capabilities,
      stats: {
        mappings: this.natMappings.size,
        relayNodes: this.relayNodes.size,
        holePunches: this.holePunches.size
      }
    };
  }

  async listMappings() {
    return Array.from(this.natMappings.values());
  }

  async listRelays() {
    return Array.from(this.relayNodes.values());
  }

  // Cleanup
  async cleanup() {
    // Close relay server
    if (this.relayServer) {
      this.relayServer.close();
    }

    // Remove all port mappings
    for (const mappingId of this.natMappings.keys()) {
      await this.removePortMapping(mappingId);
    }

    // Clear collections
    this.relayNodes.clear();
    this.natMappings.clear();
    this.holePunches.clear();
  }
}

export default NATTraversalPlugin;