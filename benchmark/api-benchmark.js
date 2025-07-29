#!/usr/bin/env node

/**
 * API-specific benchmark for Claude Flow
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

const SERVER_URL = process.env.BENCHMARK_URL || 'http://localhost:3000';

async function benchmarkAPI() {
  console.log(`🚀 API Benchmark - Testing ${SERVER_URL}\n`);
  
  const endpoints = [
    { path: '/', name: 'Root', method: 'GET' },
    { path: '/health', name: 'Health Check', method: 'GET' },
    { path: '/config', name: 'Configuration', method: 'GET' },
    { path: '/api/schema', name: 'API Schema', method: 'GET' },
    { path: '/docs', name: 'Documentation', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    
    const times = [];
    let errors = 0;
    
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      
      try {
        const response = await fetch(`${SERVER_URL}${endpoint.path}`, {
          method: endpoint.method
        });
        
        const end = performance.now();
        
        if (response.ok) {
          times.push(end - start);
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
      const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
      
      console.log(`   ✅ Success: ${times.length}/20`);
      console.log(`   📊 Latency: avg ${Math.round(avg)}ms, min ${Math.round(min)}ms, max ${Math.round(max)}ms, p95 ${Math.round(p95)}ms`);
      
      if (errors > 0) {
        console.log(`   ❌ Errors: ${errors}`);
      }
    } else {
      console.log(`   ❌ All requests failed`);
    }
    
    console.log('');
  }
}

benchmarkAPI().catch(console.error);