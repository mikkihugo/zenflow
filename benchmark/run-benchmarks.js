#!/usr/bin/env node

/**
 * 🚀 CLAUDE FLOW BENCHMARK SUITE
 * Comprehensive performance testing for unified server
 */

import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

class BenchmarkRunner extends EventEmitter {
  constructor() {
    super();
    this.results = {
      server_startup: null,
      api_latency: [],
      mcp_latency: [],
      websocket_latency: [],
      neural_inference: [],
      concurrent_requests: [],
      memory_usage: [],
      timestamp: new Date().toISOString()
    };
    this.serverProcess = null;
    this.serverPort = 3001; // Use different port for testing
  }

  async runAllBenchmarks() {
    console.log('🚀 Starting Claude Flow Benchmark Suite...\n');
    
    try {
      // 1. Server startup benchmark
      await this.benchmarkServerStartup();
      
      // 2. API latency benchmark
      await this.benchmarkAPILatency();
      
      // 3. MCP latency benchmark  
      await this.benchmarkMCPLatency();
      
      // 4. Concurrent requests benchmark
      await this.benchmarkConcurrentRequests();
      
      // 5. Memory usage benchmark
      await this.benchmarkMemoryUsage();
      
      // 6. Neural inference benchmark (if available)
      await this.benchmarkNeuralInference();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Benchmark suite failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  async benchmarkServerStartup() {
    console.log('⏱️  Benchmarking server startup time...');
    
    const startTime = performance.now();
    
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['src/unified-server.js', '--port', this.serverPort], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('All components active and ready')) {
          const endTime = performance.now();
          const startupTime = endTime - startTime;
          
          this.results.server_startup = {
            time_ms: Math.round(startupTime),
            status: 'success'
          };
          
          console.log(`   ✅ Server started in ${Math.round(startupTime)}ms\n`);
          
          // Wait a bit for server to be fully ready
          setTimeout(resolve, 1000);
        }
      });
      
      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });
      
      this.serverProcess.on('error', reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);
    });
  }

  async benchmarkAPILatency() {
    console.log('⏱️  Benchmarking API latency...');
    
    const endpoints = [
      { path: '/', name: 'root' },
      { path: '/health', name: 'health' },
      { path: '/config', name: 'config' },
      { path: '/api/schema', name: 'schema' }
    ];
    
    for (const endpoint of endpoints) {
      const times = [];
      
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        
        try {
          const response = await fetch(`http://localhost:${this.serverPort}${endpoint.path}`);
          const end = performance.now();
          
          if (response.ok) {
            times.push(end - start);
          }
        } catch (error) {
          console.warn(`   ⚠️ ${endpoint.name} request failed:`, error.message);
        }
      }
      
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);
        
        this.results.api_latency.push({
          endpoint: endpoint.name,
          avg_ms: Math.round(avg * 100) / 100,
          min_ms: Math.round(min * 100) / 100,
          max_ms: Math.round(max * 100) / 100,
          samples: times.length
        });
        
        console.log(`   📊 ${endpoint.name}: avg ${Math.round(avg)}ms (min: ${Math.round(min)}ms, max: ${Math.round(max)}ms)`);
      }
    }
    
    console.log('');
  }

  async benchmarkMCPLatency() {
    console.log('⏱️  Benchmarking MCP latency...');
    
    const mcpRequests = [
      {
        name: 'tools_list',
        body: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        }
      },
      {
        name: 'initialize',
        body: {
          jsonrpc: '2.0',
          id: 2,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'benchmark', version: '1.0.0' }
          }
        }
      }
    ];
    
    for (const request of mcpRequests) {
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        
        try {
          const response = await fetch(`http://localhost:${this.serverPort}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.body)
          });
          
          const end = performance.now();
          
          if (response.ok) {
            times.push(end - start);
          }
        } catch (error) {
          console.warn(`   ⚠️ MCP ${request.name} failed:`, error.message);
        }
      }
      
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        
        this.results.mcp_latency.push({
          request: request.name,
          avg_ms: Math.round(avg * 100) / 100,
          samples: times.length
        });
        
        console.log(`   📊 MCP ${request.name}: avg ${Math.round(avg)}ms`);
      }
    }
    
    console.log('');
  }

  async benchmarkConcurrentRequests() {
    console.log('⏱️  Benchmarking concurrent requests...');
    
    const concurrencyLevels = [1, 5, 10, 20, 50];
    
    for (const concurrency of concurrencyLevels) {
      const promises = [];
      const startTime = performance.now();
      
      for (let i = 0; i < concurrency; i++) {
        promises.push(
          fetch(`http://localhost:${this.serverPort}/health`)
            .then(res => res.ok ? 1 : 0)
            .catch(() => 0)
        );
      }
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const successful = results.reduce((a, b) => a + b, 0);
      const totalTime = endTime - startTime;
      const avgLatency = totalTime / concurrency;
      const requestsPerSecond = (successful / totalTime) * 1000;
      
      this.results.concurrent_requests.push({
        concurrency,
        successful,
        total_time_ms: Math.round(totalTime),
        avg_latency_ms: Math.round(avgLatency * 100) / 100,
        requests_per_second: Math.round(requestsPerSecond * 100) / 100
      });
      
      console.log(`   📊 Concurrency ${concurrency}: ${successful}/${concurrency} successful, ${Math.round(requestsPerSecond)} req/s`);
    }
    
    console.log('');
  }

  async benchmarkMemoryUsage() {
    console.log('⏱️  Benchmarking memory usage...');
    
    const initialMemory = process.memoryUsage();
    
    // Stress test with multiple requests
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(
        fetch(`http://localhost:${this.serverPort}/health`)
          .then(res => res.json())
          .catch(() => null)
      );
    }
    
    await Promise.all(promises);
    
    const finalMemory = process.memoryUsage();
    
    this.results.memory_usage = {
      initial_mb: Math.round(initialMemory.heapUsed / 1024 / 1024 * 100) / 100,
      final_mb: Math.round(finalMemory.heapUsed / 1024 / 1024 * 100) / 100,
      delta_mb: Math.round((finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024 * 100) / 100
    };
    
    console.log(`   📊 Memory: ${this.results.memory_usage.initial_mb}MB → ${this.results.memory_usage.final_mb}MB (Δ ${this.results.memory_usage.delta_mb}MB)\n`);
  }

  async benchmarkNeuralInference() {
    console.log('⏱️  Benchmarking neural inference (if available)...');
    
    try {
      // Try to call a neural endpoint if it exists
      const response = await fetch(`http://localhost:${this.serverPort}/health`);
      const data = await response.json();
      
      if (data.components && data.components.neural === 'running') {
        console.log('   ✅ Neural engine detected, running inference benchmark...');
        
        // Add neural-specific benchmarks here when neural endpoints are available
        this.results.neural_inference = {
          status: 'detected_but_no_endpoints',
          message: 'Neural engine running but no inference endpoints found'
        };
      } else {
        this.results.neural_inference = {
          status: 'not_available',
          message: 'Neural engine not running'
        };
        console.log('   ⚠️ Neural engine not available for benchmarking');
      }
    } catch (error) {
      this.results.neural_inference = {
        status: 'error',
        message: error.message
      };
      console.log('   ❌ Neural benchmark failed:', error.message);
    }
    
    console.log('');
  }

  generateReport() {
    console.log('📊 BENCHMARK RESULTS SUMMARY');
    console.log('================================\n');
    
    // Server startup
    if (this.results.server_startup) {
      console.log(`🚀 Server Startup: ${this.results.server_startup.time_ms}ms`);
    }
    
    // API Performance
    console.log('\n📡 API Performance:');
    this.results.api_latency.forEach(result => {
      console.log(`   ${result.endpoint}: ${result.avg_ms}ms avg`);
    });
    
    // MCP Performance
    console.log('\n🔧 MCP Performance:');
    this.results.mcp_latency.forEach(result => {
      console.log(`   ${result.request}: ${result.avg_ms}ms avg`);
    });
    
    // Concurrency
    console.log('\n🏃 Concurrency Performance:');
    const bestConcurrency = this.results.concurrent_requests
      .sort((a, b) => b.requests_per_second - a.requests_per_second)[0];
    if (bestConcurrency) {
      console.log(`   Peak: ${bestConcurrency.requests_per_second} req/s at ${bestConcurrency.concurrency} concurrent`);
    }
    
    // Memory
    console.log('\n💾 Memory Usage:');
    console.log(`   Memory delta: ${this.results.memory_usage.delta_mb}MB`);
    
    // Neural
    console.log('\n🧠 Neural Engine:');
    console.log(`   Status: ${this.results.neural_inference.status}`);
    
    // Save results to file
    const fs = await import('node:fs/promises');
    const reportPath = `benchmark-results-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Full results saved to: ${reportPath}`);
  }

  async cleanup() {
    if (this.serverProcess) {
      console.log('\n🛑 Cleaning up test server...');
      this.serverProcess.kill('SIGTERM');
      
      // Wait for process to exit
      await new Promise((resolve) => {
        this.serverProcess.on('exit', resolve);
        setTimeout(resolve, 5000); // Force cleanup after 5s
      });
    }
  }
}

// Run benchmarks if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new BenchmarkRunner();
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Benchmark interrupted, cleaning up...');
    await runner.cleanup();
    process.exit(0);
  });
  
  runner.runAllBenchmarks().catch(console.error);
}

export default BenchmarkRunner;