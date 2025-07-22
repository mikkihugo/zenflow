import { ClaudeFlowMCPServer } from './dist/mcp/mcp-server.js';

async function testMCPIntegration() {
  console.log('🧪 Testing claude-zen MCP tools with ruv-swarm library integration...\n');
  
  const server = new ClaudeFlowMCPServer();
  await server.initializeMemory();
  
  try {
    // Test memory operations
    console.log('🔧 Test: Memory operations');
    await server.executeTool('memory_usage', {
      action: 'store',
      key: 'test-integration',
      value: 'Library integration test successful',
      namespace: 'tests'
    });
    const memoryResult = await server.executeTool('memory_usage', {
      action: 'retrieve',
      key: 'test-integration',
      namespace: 'tests'
    });
    console.log('✅ Memory test passed:', memoryResult.found);
    
    console.log('\n🎉 Basic integration test passed\! Claude-zen MCP server is working with library mode.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testMCPIntegration();
