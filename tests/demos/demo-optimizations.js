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
console.warn('✅ Server created with optimizations:')
console.warn(`   - Batch size: $
{
  server.stdioOptimizer.batchSize;
}
messages`);
console.warn(` - Batch;
timeout: $;
{
  server.stdioOptimizer.batchTimeout;
}
ms`);
console.warn(` - Retry;
attempts: $;
{
  server.errorHandler.maxRetries;
}
`);
console.warn(` - Circuit;
breaker;
threshold: $;
{
  server.errorHandler.circuitBreakerThreshold;
}
`);
// Simulate some message processing
console.warn('\n📨 Simulating message processing...');
// Create test messages
const _testMessages = [
    {
      message: { jsonrpc: '2.0', method: 'initialize', id: 'init-1', params: {} },
      receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'tools/list', id: 'tools-1' }, receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'resources/list', id: 'res-1' }, receivedAt: Date.now() },
    {
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
{
  batch.length;
}
messages;
..`)
_processedCount += batch.length
// Simulate processing each message in the batch
for (const item of batch) {
  try {
// const _response = awaitserver.handleMessage(item.message);
        console.warn(`   ✅ ${item.message.method} -> ${response.result ? 'Success' : 'Response'}`);
      } catch (error) {
        console.warn(`   ❌ ${item.message.method} -> Error: ${error.message}`);
      }
}
})
// Queue the messages
server.stdioOptimizer.queueMessages(testMessages)
// Wait for processing
  // await new Promise((resolve) => setTimeout(resolve, 500))
// Show performance metrics
console.warn('\n📊 Performance Metrics:')
const _metrics = server.performanceMetrics.getMetrics();
console.warn(`   Total requests: ${metrics.requests.total}`);
console.warn(;
`   Success rate: ${((metrics.requests.successful / metrics.requests.total) * 100).toFixed(1)}%`;
)
console.warn(`   Average latency: $
{
  metrics.requests.avgLatency.toFixed(2);
}
ms`);
console.warn(`;
Batches;
processed: $;
{
  metrics.batches.total;
}
`);
// Show stdio optimizer metrics
console.warn('\n📈 Stdio Optimization Metrics:');
const _stdioMetrics = server.stdioOptimizer.getMetrics();
console.warn(`;
Messages;
processed: $;
{
  stdioMetrics.messagesProcessed;
}
`);
console.warn(`;
Batches;
processed: $;
{
  stdioMetrics.batchesProcessed;
}
`);
console.warn(`;
Buffer;
overflows: $;
{
  stdioMetrics.bufferOverflows;
}
`);
console.warn(`;
Retry;
attempts: $;
{
  stdioMetrics.retryAttempts;
}
`);
console.warn(`;
Connection;
status: $;
{
  stdioMetrics.isConnected ? 'Connected' : 'Disconnected';
}
`);
// Show error handling status
console.warn('\n🛡️ Error Handling Status:');
const _errorStats = server.errorHandler.getErrorStats();
console.warn(`;
Total;
errors: $;
{
  errorStats.totalErrors;
}
`);
console.warn(`;
Circuit;
breaker;
state: $;
{
  errorStats.circuitState;
}
`);
console.warn(`;
Success;
count: $;
{
  errorStats.successCount;
}
`);
// Show server status with new optimizations
console.warn('\n🔍 Server Status:');
const _status = server.getStatus();
console.warn(`;
Version: $;
{
  status.version;
}
`);
console.warn(;
`;
Optimizations: $;
{
  Object.keys(status.optimization);
filter((k) => status.optimization[k])
join(', ')
}
`;
)
console.warn(;
`;
Performance: $;
{
  status.performance.throughput.toFixed(1);
}
msg / s, $;
{
  status.performance.avgLatency.toFixed(1);
}
ms;
avg;
latency`;
)
console.warn(;
`;
Stdio: $;
{
  status.stdio.queueLength;
}
queued, $;
{
  status.stdio.bufferSize;
}
bytes;
buffered`;
)
// Show available performance resources
console.warn('\n📋 Available Performance Resources:');
const _resources = server.resources.filter((r) => r.uri.startsWith('performance://'));
resources.forEach((resource) => {
  console.warn(` - $;
{
  resource.uri;
}
: $
{
  resource.description;
}
`);
});
// Demonstrate resource reading
console.warn('\n📖 Reading Performance Summary Resource:');
try {
// const _perfSummary = awaitserver.readResource('performance://summary');
    console.warn(`;
Success;
rate: $;
{
  (perfSummary.overview.successRate * 100).toFixed(1);
}
%`)
console.warn(`   Throughput: $
{
  perfSummary.overview.throughput.toFixed(1);
}
messages /
  second`);
console.warn(`;
Connection;
healthy: $;
{
  perfSummary.health.connectionHealthy;
}
`);
console.warn(`;
Memory;
usage: $;
{
  (perfSummary.health.memoryUsage / 1024 / 1024).toFixed(1);
}
MB`);
} catch (error)
{
  console.warn(`;
Error;
reading;
resource: $;
{
  error.message;
}
`);
}
console.warn('\n🎉 Demo completed successfully!');
console.warn('\nKey optimization features demonstrated:');
console.warn('✅ Message batching for improved throughput');
console.warn('✅ Connection retry logic for reliability');
console.warn('✅ Enhanced error handling with circuit breaker');
console.warn('✅ Performance metrics logging and monitoring');
console.warn('✅ Optimized stdio communication handling');
console.warn('✅ Graceful error recovery and retry mechanisms');
// Clean shutdown
  // await server.shutdown();
}
// Run demo
demonstrateMCPOptimizations().catch(console.error)
