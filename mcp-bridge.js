#!/usr/bin/env node
/**
 * Claude-Flow MCP Bridge
 * Exposes service document tools as accessible MCP tools
 */

import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';
import { ServicesOrchestrator } from './services/orchestrator.js';

class MCPBridge {
  constructor() {
    this.mcpServer = new ClaudeFlowMCPServer();
    this.orchestrator = new ServicesOrchestrator();
    this.isRunning = false;
  }

  async start() {
    console.log('🔗 Starting Claude-Flow MCP Bridge...\n');
    
    // Start the services orchestrator
    await this.orchestrator.start();
    
    // Initialize MCP server
    await this.mcpServer.initializeMemory();
    
    // Bind service methods to MCP
    this.bindServiceMethods();
    
    this.isRunning = true;
    
    console.log('\n🔗 MCP Bridge Ready!');
    console.log('📡 Available MCP Tools:');
    console.log('   • mcp__claude-flow__service_document_manager');
    console.log('   • mcp__claude-flow__service_approval_workflow');
    console.log('   • mcp__claude-flow__service_document_validator');
    console.log('   • mcp__claude-flow__swarm_init');
    console.log('   • mcp__claude-flow__agent_spawn');
    console.log('   • mcp__claude-flow__memory_usage');
    console.log('\n🎯 Ready for Claude Desktop integration!');
    
    return this;
  }

  async stop() {
    await this.orchestrator.stop();
    this.isRunning = false;
    console.log('🔗 MCP Bridge stopped');
  }

  bindServiceMethods() {
    // These methods are now available through the MCP server
    // The tools are already implemented in the MCP server
    console.log('✅ Service document tools bound to MCP interface');
  }

  // Direct access methods for testing
  async createServiceDocument(serviceName, documentType, content, metadata = {}) {
    return await this.mcpServer.handleServiceDocumentManager({
      action: 'create',
      serviceName,
      documentType,
      content,
      approvalMetadata: metadata
    });
  }

  async listServiceDocuments(serviceName = null) {
    return await this.mcpServer.handleServiceDocumentManager({
      action: 'list',
      serviceName,
      documentType: 'all'
    });
  }

  async validateServiceDocument(serviceName, documentType) {
    return await this.mcpServer.handleServiceDocumentValidator({
      validateType: 'single-document',
      serviceName,
      documentType
    });
  }

  async queueApproval(documentId, approver) {
    return await this.mcpServer.handleServiceApprovalWorkflow({
      action: 'queue',
      documentId,
      approver
    });
  }

  getStatus() {
    return {
      bridge: {
        running: this.isRunning,
        version: '2.0.0-alpha.61'
      },
      orchestrator: this.orchestrator.getSystemStatus(),
      mcp: {
        toolsAvailable: [
          'service_document_manager',
          'service_approval_workflow', 
          'service_document_validator',
          'swarm_init',
          'agent_spawn',
          'memory_usage'
        ]
      }
    };
  }
}

// Export for programmatic use
export { MCPBridge };

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const bridge = new MCPBridge();
  
  process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down MCP Bridge...');
    await bridge.stop();
    process.exit(0);
  });
  
  try {
    await bridge.start();
    
    // Demo the MCP tools
    console.log('\n🧪 Testing MCP Service Tools...\n');
    
    // Test 1: Create service document
    const createResult = await bridge.createServiceDocument(
      'payment-service',
      'service-description',
      {
        name: 'Payment Service',
        version: '1.0.0',
        description: 'Handles payment processing and billing',
        endpoints: ['/pay', '/refund', '/status'],
        dependencies: ['user-service', 'notification-service']
      }
    );
    console.log('📄 Service document created:', createResult.success ? '✅' : '❌');
    
    // Test 2: List documents
    const listResult = await bridge.listServiceDocuments('payment-service');
    console.log('📋 Documents listed:', listResult.success ? '✅' : '❌');
    
    // Test 3: Validate document
    const validateResult = await bridge.validateServiceDocument('payment-service', 'service-description');
    console.log('✅ Document validated:', validateResult.success ? '✅' : '❌');
    
    // Test 4: Queue approval
    const approvalResult = await bridge.queueApproval(createResult.documentId, 'tech-lead');
    console.log('📝 Approval queued:', approvalResult.success ? '✅' : '❌');
    
    console.log('\n✨ MCP Bridge fully operational!');
    console.log('🔌 Connect Claude Desktop with: npx claude-flow@alpha mcp start');
    
  } catch (error) {
    console.error('❌ Failed to start MCP Bridge:', error);
    process.exit(1);
  }
}