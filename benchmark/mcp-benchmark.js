#!/usr/bin/env node

/**
 * MCP-specific benchmark for Claude Flow
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

const SERVER_URL = process.env.BENCHMARK_URL || 'http://localhost:3000';

async function benchmarkMCP() {
  console.log(`🔧 MCP Benchmark - Testing ${SERVER_URL}\n`);
  
  const mcpRequests = [
    {
      name: 'Initialize',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'benchmark', version: '1.0.0' }
        }
      }
    },
    {
      name: 'List Tools',
      body: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }
    }
  ];
  
  for (const request of mcpRequests) {
    console.log(`Testing MCP ${request.name}...`);
    
    const times = [];
    let errors = 0;
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      
      try {
        const response = await fetch(`${SERVER_URL}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.body)
        });
        
        const end = performance.now();
        
        if (response.ok) {
          const data = await response.json();
          if (!data.error) {
            times.push(end - start);
          } else {
            errors++;
          }
        } else {
          errors++;
        }
      } catch (error) {
        errors++;
      }
    }
    
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      
      console.log(`   ✅ Success: ${times.length}/10`);
      console.log(`   📊 Latency: avg ${Math.round(avg)}ms, min ${Math.round(min)}ms, max ${Math.round(max)}ms`);
      
      if (errors > 0) {
        console.log(`   ❌ Errors: ${errors}`);
      }
    } else {
      console.log(`   ❌ All requests failed`);
    }
    
    console.log('');
  }
  
  // Test tools endpoint
  console.log('Testing MCP Tools List (GET)...');
  
  try {
    const start = performance.now();
    const response = await fetch(`${SERVER_URL}/mcp/tools`);
    const end = performance.now();
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Found ${data.count || 0} tools in ${Math.round(end - start)}ms`);
      
      if (data.tools && data.tools.length > 0) {
        console.log(`   📋 Sample tools: ${data.tools.slice(0, 3).map(t => t.name).join(', ')}`);
      }
    } else {
      console.log(`   ❌ Failed with status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
}

benchmarkMCP().catch(console.error);