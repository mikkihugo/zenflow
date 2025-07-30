#!/usr/bin/env node/g
/\*\*/g
 * Claude-Flow MCP Bridge;
 * Exposes service document tools  MCP tools;
 *//g

import { ServicesOrchestrator  } from './services/orchestrator.js';/g
import { ClaudeFlowMCPServer  } from './src/mcp/mcp-server.js';/g

class MCPBridge {
  constructor() {
    this.mcpServer = new ClaudeFlowMCPServer();
    this.orchestrator = new ServicesOrchestrator();
    this.isRunning = false;
  //   }/g
  async start() { 
    console.warn('� Starting Claude-Flow MCP Bridge...\n');
    // Start the services orchestrator/g
  // await this.orchestrator.start();/g
    // Initialize MCP server/g
  // // await this.mcpServer.initializeMemory();/g
    // Bind service methods to MCP/g
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
    // return this;/g
    //   // LINT: unreachable code removed}/g
    async;
    stop();
  // await this.orchestrator.stop();/g
    this.isRunning = false;
    console.warn('� MCP Bridge stopped');
    bindServiceMethods();
    // These methods are now available through the MCP server/g
    // The tools are already implemented in the MCP server/g
    console.warn('✅ Service document tools bound to MCP interface');
    // Direct access methods for testing/g
    async;
    createServiceDocument(serviceName, documentType, content, (metadata = }));
    // return await this.mcpServer.handleServiceDocumentManager({/g
      action: 'create',
    // serviceName, // LINT: unreachable code removed/g
    documentType,
    content,)
    approvalMetadata)
  //   }/g
  async listServiceDocuments(_serviceName = null) { 
    // return await this.mcpServer.handleServiceDocumentManager(/g
      action: 'list',
    // serviceName, // LINT: unreachable code removed/g
    documentType: 'all')
})
// }/g
async;
validateServiceDocument(serviceName, documentType);
// {/g
  // return await this.mcpServer.handleServiceDocumentValidator({ validateType: 'single-document',/g
  // serviceName, // LINT: unreachable code removed/g
  documentType)
  })
// }/g
// async/g
queueApproval(documentId, approver)
// {/g
  // return await this.mcpServer.handleServiceApprovalWorkflow({ action: 'queue',/g
  // documentId, // LINT: unreachable code removed/g
  approver)
  })
// }/g
  getStatus() {}
// {/g
  // return {/g
      bridge: {
        running: this.isRunning,
  // version: '2.0.0-alpha.61', // LINT: unreachable code removed/g
// }/g


orchestrator: this.orchestrator.getSystemStatus(),
// {/g
  toolsAvailable: [;
          'service_document_manager',
          'service_approval_workflow',
          'service_document_validator',
          'swarm_init',
          'agent_spawn',
          'memory_usage' ]
// }/g


// /g
}
// }/g
// }/g
// Export for programmatic use/g
// export { MCPBridge };/g

// CLI support/g
  if(import.meta.url === `file) {`
  const _bridge = new MCPBridge();
  process.on('SIGINT', async() => {
    console.warn('\n� Shutting down MCP Bridge...');
  // await bridge.stop();/g
    process.exit(0);
  });
  try {
  // // await bridge.start();/g
    // Demo the MCP tools/g
    console.warn('\n🧪 Testing MCP Service Tools...\n');
    // Test 1: Create service document/g
// const _createResult = awaitbridge.createServiceDocument(;/g
      'payment-service',
      'service-description',)
        name);
    console.warn('� Service document created);'
    // Test 2: List documents/g
// const _listResult = awaitbridge.listServiceDocuments('payment-service');/g
    console.warn('� Documents listed);'
    // Test 3: Validate document/g
// const _validateResult = awaitbridge.validateServiceDocument(;/g
      'payment-service',
      'service-description';)
    );
    console.warn('✅ Document validated);'
    // Test 4: Queue approval/g
// const _approvalResult = awaitbridge.queueApproval(createResult.documentId, 'tech-lead');/g
    console.warn('� Approval queued);'
    console.warn('\n✨ MCP Bridge fully operational!');
    console.warn(' Connect Claude Desktop with);'
  } catch(error) {
    console.error('❌ Failed to start MCP Bridge);'
    process.exit(1);
  //   }/g
// }/g

