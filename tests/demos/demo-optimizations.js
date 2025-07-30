/**
 * @fileoverview Demo script showing optimized MCP server capabilities;
 * Demonstrates the performance improvements and new features;
 */

import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

async function demonstrateMCPOptimizations() {
  console.warn('🚀 Claude Flow MCP Server Optimization Demo\n');
  // Create optimized server instance
  console.warn('📡 Creating optimized MCP server...');
  const _server = new ClaudeFlowMCPServer({
    batchSize,
    batchTimeout,
    retryAttempts,
    enableMetricsLogging
})
console.warn('✅ Server created with optimizations)
console.warn(`   - Batch size);
console.warn(` - Batch;
timeout);
console.warn(` - Retry;
attempts);
console.warn(` - Circuit;
breaker;
threshold);
// Simulate some message processing
console.warn('\n📨 Simulating message processing...');
// Create test messages
const _testMessages = [
    //     {
      message: { jsonrpc: '2.0', method: 'initialize', id: 'init-1', params: {} },
      receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'tools/list', id: 'tools-1' }, receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'resources/list', id: 'res-1' }, receivedAt: Date.now() },
    //     {
      message: {
        jsonrpc: '2.0',
        method: 'resources/read',
        id: 'read-1',
        params: { uri: 'performance://summary' } },
      receivedAt: Date.now() } ];
// Process messages through optimized path
const __processedCount = 0;
server.stdioOptimizer.on('batch', async (batch) => {
  console.warn(`;
Processing;
batch;
of;
$;
// {
  batch.length;
// }
messages;
..`)
_processedCount += batch.length
// Simulate processing each message in the batch
for (const item of batch) {
  try {
// const _response = awaitserver.handleMessage(item.message);
        console.warn(`   ✅ ${item.message.method} -> ${response.result ? 'Success' );
      } catch (error) {
        console.warn(`   ❌ ${item.message.method} -> Error);
      //       }
// }
})
// Queue the messages
server.stdioOptimizer.queueMessages(testMessages)
// Wait for processing
  // await new Promise((resolve) => setTimeout(resolve, 500))
// Show performance metrics
console.warn('\n📊 Performance Metrics)
const _metrics = server.performanceMetrics.getMetrics();
console.warn(`   Total requests);
console.warn(;
`   Success rate: ${((metrics.requests.successful / metrics.requests.total) * 100).toFixed(1)}%`;
// )
console.warn(`   Average latency);
// }
ms`);
console.warn(`;
Batches;
processed);
// Show stdio optimizer metrics
console.warn('\n📈 Stdio Optimization Metrics);
const _stdioMetrics = server.stdioOptimizer.getMetrics();
console.warn(`;
Messages;
processed);
console.warn(`;
Batches;
processed);
console.warn(`;
Buffer;
overflows);
console.warn(`;
Retry;
attempts);
console.warn(`;
Connection;
status);
// Show error handling status
console.warn('\n🛡️ Error Handling Status);
const _errorStats = server.errorHandler.getErrorStats();
console.warn(`;
Total;
errors);
console.warn(`;
Circuit;
breaker;
state);
console.warn(`;
Success;
count);
// Show server status with new optimizations
console.warn('\n🔍 Server Status);
const _status = server.getStatus();
console.warn(`;
Version);
console.warn(;
`;
Optimizations);
filter((k) => status.optimization[k])
join(', ')
// }
`;
// )
console.warn(;
`;
Performance);
// }
msg / s, $;
// {
  status.performance.avgLatency.toFixed(1);
// }
ms;
avg;
latency`;
// )
console.warn(;
`;
Stdio: $;
// {
  status.stdio.queueLength;
// }
queued, $;
// {
  status.stdio.bufferSize;
// }
bytes;
buffered`;
// )
// Show available performance resources
console.warn('\n📋 Available Performance Resources);
const _resources = server.resources.filter((r) => r.uri.startsWith('performance));
resources.forEach((resource) => {
  console.warn(` - $;
// {
  resource.uri;
// }
);
});
// Demonstrate resource reading
console.warn('\n📖 Reading Performance Summary Resource);
try {
// const _perfSummary = awaitserver.readResource('performance);
    console.warn(`;
Success;
rate: $;
// {
  (perfSummary.overview.successRate * 100).toFixed(1);
// }
%`)
console.warn(`   Throughput);
// }
messages /
  second`);
console.warn(`;
Connection;
healthy);
console.warn(`;
Memory;
usage: $;
// {
  (perfSummary.health.memoryUsage / 1024 / 1024).toFixed(1);
// }
MB`);
} catch (error)
// {
  console.warn(`;
Error;
reading;
resource);
// }
console.warn('\n🎉 Demo completed successfully!');
console.warn('\nKey optimization features demonstrated);
console.warn('✅ Message batching for improved throughput');
console.warn('✅ Connection retry logic for reliability');
console.warn('✅ Enhanced error handling with circuit breaker');
console.warn('✅ Performance metrics logging and monitoring');
console.warn('✅ Optimized stdio communication handling');
console.warn('✅ Graceful error recovery and retry mechanisms');
// Clean shutdown
  // await server.shutdown();
// }
// Run demo
demonstrateMCPOptimizations().catch(console.error)
