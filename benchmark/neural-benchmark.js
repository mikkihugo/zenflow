#!/usr/bin/env node

/**
 * Neural engine benchmark for Claude Flow
 */

import { performance } from 'perf_hooks';
import { NeuralEngine } from '../src/neural/neural-engine.js';

async function benchmarkNeural() {
  console.log('🧠 Neural Engine Benchmark\n');
  
  let neuralEngine;
  
  try {
    // Test 1: Initialization time
    console.log('Testing neural engine initialization...');
    const initStart = performance.now();
    
    neuralEngine = new NeuralEngine();
    await neuralEngine.initialize();
    
    const initEnd = performance.now();
    const initTime = initEnd - initStart;
    
    console.log(`   ✅ Initialized in ${Math.round(initTime)}ms`);
    console.log(`   📊 Models loaded: ${neuralEngine.models?.size || 0}`);
    console.log(`   💾 Cache size: ${neuralEngine.cache?.size || 0}`);
    console.log('');
    
    // Test 2: Model loading (if available)
    console.log('Testing model operations...');
    
    const availableModels = Array.from(neuralEngine.models?.keys() || []);
    if (availableModels.length > 0) {
      console.log(`   📋 Available models: ${availableModels.join(', ')}`);
      
      // Test inference on first available model
      const testModel = availableModels[0];
      console.log(`   🔍 Testing inference with model: ${testModel}`);
      
      const inferencePromises = [];
      const testPrompts = [
        'function hello() {',
        'const data = ',
        'if (condition) {',
        '# TODO: implement',
        'SELECT * FROM'
      ];
      
      for (const prompt of testPrompts) {
        const start = performance.now();
        
        inferencePromises.push(
          neuralEngine.generateCode(prompt, { model: testModel })
            .then(result => ({
              prompt: prompt.substring(0, 20) + '...',
              time: performance.now() - start,
              success: !!result,
              length: result ? result.length : 0
            }))
            .catch(error => ({
              prompt: prompt.substring(0, 20) + '...',
              time: performance.now() - start,
              success: false,
              error: error.message
            }))
        );
      }
      
      const results = await Promise.all(inferencePromises);
      
      console.log('   📊 Inference Results:');
      results.forEach((result, i) => {
        if (result.success) {
          console.log(`      ${i + 1}. "${result.prompt}" → ${Math.round(result.time)}ms (${result.length} chars)`);
        } else {
          console.log(`      ${i + 1}. "${result.prompt}" → ${Math.round(result.time)}ms (failed: ${result.error})`);
        }
      });
      
      const successful = results.filter(r => r.success);
      if (successful.length > 0) {
        const avgTime = successful.reduce((sum, r) => sum + r.time, 0) / successful.length;
        const avgLength = successful.reduce((sum, r) => sum + r.length, 0) / successful.length;
        
        console.log(`   ✅ Average inference: ${Math.round(avgTime)}ms, ${Math.round(avgLength)} chars`);
        console.log(`   📈 Success rate: ${successful.length}/${results.length} (${Math.round(successful.length / results.length * 100)}%)`);
      }
    } else {
      console.log('   ⚠️ No models available for testing');
    }
    
    console.log('');
    
    // Test 3: Memory usage
    console.log('Testing memory usage...');
    
    const memoryBefore = process.memoryUsage();
    
    // Run multiple inferences to test memory
    const memoryTestPromises = [];
    for (let i = 0; i < 20; i++) {
      memoryTestPromises.push(
        neuralEngine.generateCode(`test prompt ${i}`)
          .catch(() => null)
      );
    }
    
    await Promise.all(memoryTestPromises);
    
    const memoryAfter = process.memoryUsage();
    const memoryDelta = (memoryAfter.heapUsed - memoryBefore.heapUsed) / 1024 / 1024;
    
    console.log(`   💾 Memory delta: ${Math.round(memoryDelta * 100) / 100}MB`);
    console.log(`   📊 Cache hits: ${neuralEngine.metrics?.cacheHits || 0}`);
    console.log(`   📊 Cache misses: ${neuralEngine.metrics?.cacheMisses || 0}`);
    
    // Test 4: Concurrent inference
    console.log('\nTesting concurrent inference...');
    
    const concurrencyLevels = [1, 5, 10];
    
    for (const concurrency of concurrencyLevels) {
      const concurrentStart = performance.now();
      const concurrentPromises = [];
      
      for (let i = 0; i < concurrency; i++) {
        concurrentPromises.push(
          neuralEngine.generateCode(`concurrent test ${i}`)
            .then(() => true)
            .catch(() => false)
        );
      }
      
      const concurrentResults = await Promise.all(concurrentPromises);
      const concurrentEnd = performance.now();
      const concurrentTime = concurrentEnd - concurrentStart;
      
      const successful = concurrentResults.filter(Boolean).length;
      const throughput = (successful / concurrentTime) * 1000;
      
      console.log(`   📊 Concurrency ${concurrency}: ${successful}/${concurrency} successful, ${Math.round(throughput * 100) / 100} req/s`);
    }
    
  } catch (error) {
    console.error('❌ Neural benchmark failed:', error);
  }
  
  console.log('\n🧠 Neural Engine Benchmark Complete');
}

benchmarkNeural().catch(console.error);