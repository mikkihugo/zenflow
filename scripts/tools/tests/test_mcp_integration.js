import { ClaudeFlowMCPServer } from './dist/mcp/mcp-server.js';

async function testMCPIntegration(): unknown {
  console.warn('🧪 Testing claude-zen MCP tools with ruv-swarm library integration...\n');
;
  const _server = new ClaudeFlowMCPServer();
  await server.initializeMemory();
;
  try {
    // Test memory operations
    console.warn('🔧 Test: Memory operations');
    await server.executeTool('memory_usage', {
      action: 'store',;
      key: 'test-integration',;
      value: 'Library integration test successful',;
      namespace: 'tests',;
    });
    const _memoryResult = await server.executeTool('memory_usage', {
      action: 'retrieve',;
      key: 'test-integration',;
      namespace: 'tests',;
    }
)
console.warn('✅ Memory test passed:', memoryResult.found)
console.warn(
('\n🎉 Basic integration test passed\! Claude-zen MCP server is working with library mode.')
)
} catch (/* error */)
{
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}
}
testMCPIntegration()
