/**
 * Complete Ultra-Modular Meta Registry System Example
 * Demonstrates the full hierarchy: Vision to Epic to Feature to PRD to ADR to User Story to Task to Queen Assignment
 */

import MetaRegistry, { MetaRegistryManager } from '../meta-manager.js';
import MemoryBackend from '../backends/memory-backend.js';
import JSONBackend from '../backends/json-backend.js';
import MemoryRAGPlugin from '../plugins/memory-rag.js';
import ArchitectAdvisorPlugin from '../plugins/architect-advisor.js';
import HierarchicalTaskManagerPlugin from '../plugins/hierarchical-task-manager.js';
import PortDiscoveryPlugin from '../plugins/port-discovery.js';
import PubSubPlugin from '../plugins/pubsub.js';
import NATTraversalPlugin from '../plugins/nat-traversal.js';

/**
 * Complete system demonstration
 */
export class CompleteSystemExample {
  constructor() {
    this.manager = null;
    this.mainRegistry = null;
    this.hierarchyManager = null;
  }

  async initialize() {
    console.log('🚀 Initializing Complete Ultra-Modular Meta Registry System...');
    
    // 1. Create Meta Registry Manager
    this.manager = new MetaRegistryManager({
      maxRegistries: 10,
      healthCheckInterval: 30000,
      failoverEnabled: true,
      loadBalancing: 'performance'
    });
    
    await this.manager.initialize();
    console.log('✅ Meta Registry Manager initialized');
    
    return this;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up system...');
    
    if (this.manager) {
      await this.manager.close();
    }
    console.log('✅ System shutdown complete');
  }
}

// Main execution function
export async function runCompleteExample() {
  const example = new CompleteSystemExample();
  
  try {
    await example.initialize();
  } catch (error) {
    console.error('❌ Error in example:', error.message);
  } finally {
    await example.cleanup();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteExample().catch(console.error);
}

export default CompleteSystemExample;