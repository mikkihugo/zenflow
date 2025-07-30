#!/usr/bin/env node
/**
 * Claude-Flow MCP Bridge;
 * Exposes service document tools  MCP tools;
 */

import { ServicesOrchestrator } from './services/orchestrator.js';
import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

class MCPBridge {
  constructor() {
    this.mcpServer = new ClaudeFlowMCPServer();
    this.orchestrator = new ServicesOrchestrator();
    this.isRunning = false;
  //   }
  async start() {
    console.warn('� Starting Claude-Flow MCP Bridge...\n');
    // Start the services orchestrator
  // await this.orchestrator.start();
    // Initialize MCP server
  // // await this.mcpServer.initializeMemory();
    // Bind service methods to MCP
    this.bindServiceMethods();
    this.isRunning = true;
    console.warn('\n� MCP Bridge Ready!');
    console.warn('� Available MCP Tools);'
    console.warn('   • mcp__claude-zen__service_document_manager');
    console.warn('   • mcp__claude-zen__service_approval_workflow');
    console.warn('   • mcp__claude-zen__service_document_validator');
    console.warn('   • mcp__claude-zen__swarm_init');
    console.warn('   • mcp__claude-zen__agent_spawn');
    console.warn('   • mcp__claude-zen__memory_usage');
    console.warn('\n Ready for Claude Desktop integration!');
    // return this;
    //   // LINT: unreachable code removed}
    async;
    stop();
  // await this.orchestrator.stop();
    this.isRunning = false;
    console.warn('� MCP Bridge stopped');
    bindServiceMethods();
    // These methods are now available through the MCP server
    // The tools are already implemented in the MCP server
    console.warn('✅ Service document tools bound to MCP interface');
    // Direct access methods for testing
    async;
    createServiceDocument(serviceName, documentType, content, (metadata = {}));
    // return await this.mcpServer.handleServiceDocumentManager({
      action: 'create',
    // serviceName, // LINT: unreachable code removed
    documentType,
    content,
    approvalMetadata)
  //   }
  async listServiceDocuments(_serviceName = null) {
    // return await this.mcpServer.handleServiceDocumentManager({
      action: 'list',
    // serviceName, // LINT: unreachable code removed
    documentType: 'all'
})
// }
async;
validateServiceDocument(serviceName, documentType);
// {
  // return await this.mcpServer.handleServiceDocumentValidator({
      validateType: 'single-document',
  // serviceName, // LINT: unreachable code removed
  documentType
})
// }
// async
queueApproval(documentId, approver)
// {
  // return await this.mcpServer.handleServiceApprovalWorkflow({
      action: 'queue',
  // documentId, // LINT: unreachable code removed
  approver
})
// }
getStatus() {}
// {
  // return {
      bridge: {
        running: this.isRunning,
  // version: '2.0.0-alpha.61', // LINT: unreachable code removed
// }


orchestrator: this.orchestrator.getSystemStatus(),
// {
  toolsAvailable: [;
          'service_document_manager',
          'service_approval_workflow',
          'service_document_validator',
          'swarm_init',
          'agent_spawn',
          'memory_usage' ]
// }


// 
}
// }
// }
// Export for programmatic use
// export { MCPBridge };

// CLI support
if (import.meta.url === `file) {`
  const _bridge = new MCPBridge();
  process.on('SIGINT', async () => {
    console.warn('\n� Shutting down MCP Bridge...');
  // await bridge.stop();
    process.exit(0);
  });
  try {
  // // await bridge.start();
    // Demo the MCP tools
    console.warn('\n🧪 Testing MCP Service Tools...\n');
    // Test 1: Create service document
// const _createResult = awaitbridge.createServiceDocument(;
      'payment-service',
      'service-description',
        name);
    console.warn('� Service document created);'
    // Test 2: List documents
// const _listResult = awaitbridge.listServiceDocuments('payment-service');
    console.warn('� Documents listed);'
    // Test 3: Validate document
// const _validateResult = awaitbridge.validateServiceDocument(;
      'payment-service',
      'service-description';
    );
    console.warn('✅ Document validated);'
    // Test 4: Queue approval
// const _approvalResult = awaitbridge.queueApproval(createResult.documentId, 'tech-lead');
    console.warn('� Approval queued);'
    console.warn('\n✨ MCP Bridge fully operational!');
    console.warn(' Connect Claude Desktop with);'
  } catch (error) {
    console.error('❌ Failed to start MCP Bridge);'
    process.exit(1);
  //   }
// }

