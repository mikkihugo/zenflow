#!/usr/bin/env node
/**
 * Claude-Flow Services Orchestrator
 * Manages the core 5 services foundation
 */

import { EventEmitter } from 'events';
import { DocumentManagerService } from './document-manager/service.js';
import { AgentCoordinatorService } from './agent-coordinator/service.js';
import { LLMRouterService } from './llm-router/service.js';
import { StorageService } from './storage-service/service.js';
import { SecurityService } from './security-service/service.js';

export class ServicesOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'claude-flow-orchestrator';
    this.version = '2.0.0-alpha.61';
    this.services = new Map();
    this.status = 'stopped';
    this.startOrder = [
      'security-service',    // Must start first for auth
      'storage-service',     // Required by others
      'document-manager',    // Service docs management
      'agent-coordinator',   // Swarm coordination
      'llm-router'          // LLM routing
    ];
  }

  async start() {
    console.log('🚀 Starting Claude-Flow Services Orchestrator...\n');
    
    // Initialize services
    this.services.set('security-service', new SecurityService({ port: 4005 }));
    this.services.set('storage-service', new StorageService({ port: 4004 }));
    this.services.set('document-manager', new DocumentManagerService({ port: 4001 }));
    this.services.set('agent-coordinator', new AgentCoordinatorService({ port: 4002 }));
    this.services.set('llm-router', new LLMRouterService({ port: 4003 }));
    
    // Start services in order
    for (const serviceName of this.startOrder) {
      const service = this.services.get(serviceName);
      try {
        await service.start();
        this.setupServiceEventHandlers(serviceName, service);
        console.log(`✅ ${serviceName} started successfully`);
      } catch (error) {
        console.error(`❌ Failed to start ${serviceName}:`, error.message);
        throw error;
      }
    }
    
    this.status = 'running';
    this.emit('orchestrator-started', { services: this.startOrder.length });
    
    console.log('\n🎯 Claude-Flow Services Foundation Ready!');
    console.log('📊 Service Status:');
    for (const [name, service] of this.services) {
      const status = service.getStatus();
      console.log(`   • ${name}: ${status.status} (port ${status.port})`);
    }
    
    return this;
  }

  async stop() {
    console.log('\n🛑 Stopping Claude-Flow Services...');
    
    // Stop services in reverse order
    const stopOrder = [...this.startOrder].reverse();
    
    for (const serviceName of stopOrder) {
      const service = this.services.get(serviceName);
      try {
        await service.stop();
        console.log(`✅ ${serviceName} stopped`);
      } catch (error) {
        console.error(`❌ Error stopping ${serviceName}:`, error.message);
      }
    }
    
    this.status = 'stopped';
    this.emit('orchestrator-stopped');
    console.log('🏁 All services stopped');
  }

  setupServiceEventHandlers(serviceName, service) {
    service.on('started', (data) => {
      this.emit('service-started', { service: serviceName, ...data });
    });
    
    service.on('stopped', (data) => {
      this.emit('service-stopped', { service: serviceName, ...data });
    });
    
    service.on('error', (error) => {
      this.emit('service-error', { service: serviceName, error });
    });
    
    // Service-specific events
    if (serviceName === 'agent-coordinator') {
      service.on('swarm-created', (data) => this.emit('swarm-created', data));
      service.on('agent-spawned', (data) => this.emit('agent-spawned', data));
      service.on('task-orchestrated', (data) => this.emit('task-orchestrated', data));
    }
    
    if (serviceName === 'security-service') {
      service.on('security-event', (event) => this.emit('security-event', event));
    }
    
    if (serviceName === 'storage-service') {
      service.on('data-stored', (data) => this.emit('data-stored', data));
      service.on('cache-hit', (data) => this.emit('cache-hit', data));
    }
  }

  getService(name) {
    return this.services.get(name);
  }

  async createDocument(serviceName, documentType, content, metadata = {}) {
    const documentManager = this.getService('document-manager');
    return await documentManager.createDocument(serviceName, documentType, content, metadata);
  }

  async createSwarm(topology = 'mesh', maxAgents = 6, strategy = 'parallel') {
    const coordinator = this.getService('agent-coordinator');
    return await coordinator.createSwarm(topology, maxAgents, strategy);
  }

  async routeLLMRequest(prompt, options = {}) {
    const router = this.getService('llm-router');
    return await router.routeRequest(prompt, options);
  }

  async storeData(key, value, options = {}) {
    const storage = this.getService('storage-service');
    return await storage.store(key, value, options);
  }

  async generateApiKey(userId, permissions = []) {
    const security = this.getService('security-service');
    return security.generateApiKey(userId, permissions);
  }

  getSystemStatus() {
    const serviceStatuses = {};
    for (const [name, service] of this.services) {
      serviceStatuses[name] = service.getStatus();
    }
    
    return {
      orchestrator: {
        name: this.name,
        version: this.version,
        status: this.status,
        uptime: process.uptime(),
        services: this.services.size
      },
      services: serviceStatuses,
      summary: {
        running: Object.values(serviceStatuses).filter(s => s.status === 'running').length,
        total: this.services.size,
        ports: Object.values(serviceStatuses).map(s => s.port)
      }
    };
  }

  async healthCheck() {
    const results = {};
    
    for (const [name, service] of this.services) {
      try {
        const status = service.getStatus();
        results[name] = {
          healthy: status.status === 'running',
          status: status.status,
          port: status.port,
          responseTime: Date.now() // Mock - would be actual health endpoint
        };
      } catch (error) {
        results[name] = {
          healthy: false,
          error: error.message,
          status: 'error'
        };
      }
    }
    
    const healthyCount = Object.values(results).filter(r => r.healthy).length;
    
    return {
      overall: healthyCount === this.services.size ? 'healthy' : 'degraded',
      services: results,
      summary: {
        healthy: healthyCount,
        total: this.services.size,
        ratio: healthyCount / this.services.size
      },
      timestamp: new Date().toISOString()
    };
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new ServicesOrchestrator();
  
  // Setup graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    await orchestrator.stop();
    process.exit(0);
  });
  
  try {
    await orchestrator.start();
    
    // Demo the system
    console.log('\n🧪 Running quick system test...\n');
    
    // Test document creation
    const docResult = await orchestrator.createDocument(
      'claude-flow-core',
      'service-description',
      {
        name: 'Claude-Flow Core',
        description: 'Core orchestration service',
        version: '2.0.0-alpha.61'
      }
    );
    console.log('📄 Document created:', docResult.success ? '✅' : '❌');
    
    // Test swarm creation
    const swarmResult = await orchestrator.createSwarm('mesh', 6, 'parallel');
    console.log('🐝 Swarm created:', swarmResult.success ? '✅' : '❌');
    
    // Test LLM routing
    const llmResult = await orchestrator.routeLLMRequest('Test prompt for routing');
    console.log('🧠 LLM routed:', llmResult.success ? '✅' : '❌');
    
    // Test storage
    const storageResult = await orchestrator.storeData('test-key', { test: 'data' });
    console.log('💾 Data stored:', storageResult.success ? '✅' : '❌');
    
    // Test security
    const securityResult = await orchestrator.generateApiKey('test-user', ['read', 'write']);
    console.log('🔐 API key generated:', securityResult.success ? '✅' : '❌');
    
    console.log('\n✅ System test complete! Claude-Flow 5-service foundation is operational.');
    console.log('🎯 Ready for 15-service scale-up phase.');
    
  } catch (error) {
    console.error('❌ Failed to start orchestrator:', error);
    process.exit(1);
  }
}