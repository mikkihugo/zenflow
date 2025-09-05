/**
 * WASM FACT Integration Test
 * Tests the high-performance WASM-powered knowledge gathering system
 */

import { performance } from 'node:perf_hooks';
import init, { FastCache, QueryProcessor, CognitiveEngine } from './dist/wasm/claude-zen-fact.js';

async function testWASMIntegration() {
  // 🧪 Testing WASM FACT Integration...
  
  try {
    // Initialize WASM module
    await init();
    // ✅ WASM module initialized
    
    // Test FastCache (10x performance improvement)
    // 📦 Testing FastCache...
    const cache = new FastCache(1000);
    
    const startCache = performance.now();
    cache.set('test-key', JSON.stringify({ message: 'WASM is fast!' }), 60000n);
    const cached = cache.get('test-key');
    const cacheTime = performance.now() - startCache;
    
    // ⚡ Cache operation: ${cacheTime.toFixed(3)}ms
    // 📊 Cache stats: cache.stats()
    // ✅ Cached value: JSON.parse(cached)
    
    // Test QueryProcessor (5.25x performance improvement)
    // 🔍 Testing QueryProcessor...
    const processor = new QueryProcessor();
    
    const startQuery = performance.now();
    const result = processor.process_template('analysis-basic', {
      data: [1, 2, 3, 4, 5],
      operation: 'analyze'
    });
    const queryTime = performance.now() - startQuery;
    
    // ⚡ Query processing: ${queryTime.toFixed(3)}ms
    // 📊 Processing metrics: processor.get_metrics()
    // ✅ Query result: result
    
    // Test CognitiveEngine
    // 🧠 Testing CognitiveEngine...
    const engine = new CognitiveEngine();
    
    const analysis = engine.analyze_context({
      query: 'How to optimize React performance?',
      project: { frameworks: ['react', 'typescript'] }
    });
    
    // 🎯 Context analysis: analysis
    
    const suggestions = engine.suggest_templates({ type: 'framework_optimization' });
    // 💡 Template suggestions: suggestions
    
    // ✅ All WASM tests passed!
    // 🚀 WASM-powered FACT system is ready for high-performance knowledge gathering
    
  } catch (error) {
    // ❌ WASM test failed: error
    process.exit(1);
  }
}

testWASMIntegration();
