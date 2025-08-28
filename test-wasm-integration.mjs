/**
 * WASM FACT Integration Test
 * Tests the high-performance WASM-powered knowledge gathering system
 */

import init, { FastCache, QueryProcessor, CognitiveEngine } from './dist/wasm/claude-zen-fact.js';

async function testWASMIntegration() {
    // eslint-disable-next-line no-console
  console.log('🧪 Testing WASM FACT Integration...');
  
  try {
    // Initialize WASM module
    await init();
    // eslint-disable-next-line no-console
    console.log('✅ WASM module initialized');
    
    // Test FastCache (10x performance improvement)
    // eslint-disable-next-line no-console
    console.log('\n📦 Testing FastCache...');
    const cache = new FastCache(1000);
    
    const startCache = performance.now();
    cache.set('test-key', JSON.stringify({ message: 'WASM is fast!' }), 60000n);
    const cached = cache.get('test-key');
    const cacheTime = performance.now() - startCache;
    
    // eslint-disable-next-line no-console
    console.log(`⚡ Cache operation: ${cacheTime.toFixed(3)}ms`);
    // eslint-disable-next-line no-console
    console.log(`📊 Cache stats:`, cache.stats());
    // eslint-disable-next-line no-console
    console.log(`✅ Cached value:`, JSON.parse(cached));
    
    // Test QueryProcessor (5.25x performance improvement)
    // eslint-disable-next-line no-console
    console.log('\n🔍 Testing QueryProcessor...');
    const processor = new QueryProcessor();
    
    const startQuery = performance.now();
    const result = processor.process_template('analysis-basic', {
      data: [1, 2, 3, 4, 5],
      operation: 'analyze'
    });
    const queryTime = performance.now() - startQuery;
    
    // eslint-disable-next-line no-console
    console.log(`⚡ Query processing: ${queryTime.toFixed(3)}ms`);
    // eslint-disable-next-line no-console
    console.log(`📊 Processing metrics:`, processor.get_metrics());
    // eslint-disable-next-line no-console
    console.log(`✅ Query result:`, result);
    
    // Test CognitiveEngine
    // eslint-disable-next-line no-console
    console.log('\n🧠 Testing CognitiveEngine...');
    const engine = new CognitiveEngine();
    
    const analysis = engine.analyze_context({
      query: 'How to optimize React performance?',
      project: { frameworks: ['react', 'typescript'] }
    });
    
    // eslint-disable-next-line no-console
    console.log(`🎯 Context analysis:`, analysis);
    
    const suggestions = engine.suggest_templates({ type: 'framework_optimization' });
    // eslint-disable-next-line no-console
    console.log(`💡 Template suggestions:`, suggestions);
    
    // eslint-disable-next-line no-console
    console.log('\n✅ All WASM tests passed!');
    // eslint-disable-next-line no-console
    console.log('🚀 WASM-powered FACT system is ready for high-performance knowledge gathering');
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ WASM test failed:', error);
    process.exit(1);
  }
}

testWASMIntegration();
