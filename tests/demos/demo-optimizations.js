/**
 * @fileoverview Demo script showing optimized MCP server capabilities
 * Demonstrates the performance improvements and new features
 */

import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

async function demonstrateMCPOptimizations() {
  console.log('🚀 Claude Flow MCP Server Optimization Demo\n');
  
  // Create optimized server instance
  console.log('📡 Creating optimized MCP server...');
  const server = new ClaudeFlowMCPServer({
    batchSize: 15,
    batchTimeout: 100, 
    retryAttempts: 3,
    enableMetricsLogging: false
  });
  
  console.log('✅ Server created with optimizations:');
  console.log(`   - Batch size: ${server.stdioOptimizer.batchSize} messages`);
  console.log(`   - Batch timeout: ${server.stdioOptimizer.batchTimeout}ms`);
  console.log(`   - Retry attempts: ${server.errorHandler.maxRetries}`);
  console.log(`   - Circuit breaker threshold: ${server.errorHandler.circuitBreakerThreshold}`);
  
  // Simulate some message processing
  console.log('\n📨 Simulating message processing...');
  
  // Create test messages
  const testMessages = [
    { message: { jsonrpc: '2.0', method: 'initialize', id: 'init-1', params: {} }, receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'tools/list', id: 'tools-1' }, receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'resources/list', id: 'res-1' }, receivedAt: Date.now() },
    { message: { jsonrpc: '2.0', method: 'resources/read', id: 'read-1', params: { uri: 'performance://summary' } }, receivedAt: Date.now() }
  ];
  
  // Process messages through optimized path
  let processedCount = 0;
  server.stdioOptimizer.on('batch', async (batch) => {
    console.log(`   Processing batch of ${batch.length} messages...`);
    processedCount += batch.length;
    
    // Simulate processing each message in the batch
    for (const item of batch) {
      try {
        const response = await server.handleMessage(item.message);
        console.log(`   ✅ ${item.message.method} -> ${response.result ? 'Success' : 'Response'}`);
      } catch (error) {
        console.log(`   ❌ ${item.message.method} -> Error: ${error.message}`);
      }
    }
  });
  
  // Queue the messages
  server.stdioOptimizer.queueMessages(testMessages);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Show performance metrics
  console.log('\n📊 Performance Metrics:');
  const metrics = server.performanceMetrics.getMetrics();
  console.log(`   Total requests: ${metrics.requests.total}`);
  console.log(`   Success rate: ${(metrics.requests.successful / metrics.requests.total * 100).toFixed(1)}%`);
  console.log(`   Average latency: ${metrics.requests.avgLatency.toFixed(2)}ms`);
  console.log(`   Batches processed: ${metrics.batches.total}`);
  
  // Show stdio optimizer metrics
  console.log('\n📈 Stdio Optimization Metrics:');
  const stdioMetrics = server.stdioOptimizer.getMetrics();
  console.log(`   Messages processed: ${stdioMetrics.messagesProcessed}`);
  console.log(`   Batches processed: ${stdioMetrics.batchesProcessed}`);
  console.log(`   Buffer overflows: ${stdioMetrics.bufferOverflows}`);
  console.log(`   Retry attempts: ${stdioMetrics.retryAttempts}`);
  console.log(`   Connection status: ${stdioMetrics.isConnected ? 'Connected' : 'Disconnected'}`);
  
  // Show error handling status
  console.log('\n🛡️ Error Handling Status:');
  const errorStats = server.errorHandler.getErrorStats();
  console.log(`   Total errors: ${errorStats.totalErrors}`);
  console.log(`   Circuit breaker state: ${errorStats.circuitState}`);
  console.log(`   Success count: ${errorStats.successCount}`);
  
  // Show server status with new optimizations
  console.log('\n🔍 Server Status:');
  const status = server.getStatus();
  console.log(`   Version: ${status.version}`);
  console.log(`   Optimizations: ${Object.keys(status.optimization).filter(k => status.optimization[k]).join(', ')}`);
  console.log(`   Performance: ${status.performance.throughput.toFixed(1)} msg/s, ${status.performance.avgLatency.toFixed(1)}ms avg latency`);
  console.log(`   Stdio: ${status.stdio.queueLength} queued, ${status.stdio.bufferSize} bytes buffered`);
  
  // Show available performance resources
  console.log('\n📋 Available Performance Resources:');
  const resources = server.resources.filter(r => r.uri.startsWith('performance://'));
  resources.forEach(resource => {
    console.log(`   - ${resource.uri}: ${resource.description}`);
  });
  
  // Demonstrate resource reading
  console.log('\n📖 Reading Performance Summary Resource:');
  try {
    const perfSummary = await server.readResource('performance://summary');
    console.log(`   Success rate: ${(perfSummary.overview.successRate * 100).toFixed(1)}%`);
    console.log(`   Throughput: ${perfSummary.overview.throughput.toFixed(1)} messages/second`);
    console.log(`   Connection healthy: ${perfSummary.health.connectionHealthy}`);
    console.log(`   Memory usage: ${(perfSummary.health.memoryUsage / 1024 / 1024).toFixed(1)}MB`);
  } catch (error) {
    console.log(`   Error reading resource: ${error.message}`);
  }
  
  console.log('\n🎉 Demo completed successfully!');
  console.log('\nKey optimization features demonstrated:');
  console.log('✅ Message batching for improved throughput');
  console.log('✅ Connection retry logic for reliability');  
  console.log('✅ Enhanced error handling with circuit breaker');
  console.log('✅ Performance metrics logging and monitoring');
  console.log('✅ Optimized stdio communication handling');
  console.log('✅ Graceful error recovery and retry mechanisms');
  
  // Clean shutdown
  await server.shutdown();
}

// Run demo
demonstrateMCPOptimizations().catch(console.error);