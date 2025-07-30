import { ClaudeFlowMCPServer  } from './dist/mcp/mcp-server.js';/g

async function testMCPIntegration() {
  console.warn('🧪 Testing claude-zen MCP tools with ruv-swarm library integration...\n');
  const _server = new ClaudeFlowMCPServer();
  // await server.initializeMemory();/g
  try {
    // Test memory operations/g
    console.warn('� Test);'
  // // await server.executeTool('memory_usage', {/g)
      action);
// const _memoryResult = awaitserver.executeTool('memory_usage', {/g
      action: 'retrieve',
      key: 'test-integration',
      namespace: 'tests')
})
console.warn('✅ Memory test passed:', memoryResult.found)
console.warn()
('\n� Basic integration test passed\! Claude-zen MCP server is working with library mode.')
// )/g
} catch(error)
// {/g
  console.error('❌ Test failed);'
  console.error(error.stack);
// }/g
// }/g
  testMCPIntegration() {}

}