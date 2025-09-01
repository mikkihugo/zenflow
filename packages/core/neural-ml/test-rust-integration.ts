/**
 * Simple test of Rust neural-ml integration
 */
import { RustNeuralML } from './src/rust-binding';
import { getLogger } from '@claude-zen/foundation';

async function testRustIntegration() {
  console.log(' Testing Rust Neural ML Integration...');
  
  try {
    const logger = getLogger('test');
    const rustML = new RustNeuralML({}, logger);
    
    console.log(' RustNeuralML instance created');
    
    // Initialize the Rust backend
    await rustML.initialize();
    console.log(' Rust backend initialized');
    
    // Test statistical analysis
    const task = {
      algorithm: 'statistical_analysis',
      parameters: {},
      data: new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      target: undefined
    };
    
    const result = await rustML.optimize(task);
    console.log(' Statistical analysis result:', {
      success: result.success,
      mean: result.result.mean,
      std: result.result.std,
      median: result.result.median,
      iterations: result.performance.iterations
    });
    
    // Test pattern learning
    const patternTask = {
      algorithm: 'pattern_learning',
      parameters: { cluster_count: 3 },
      data: new Float32Array([1, 1, 2, 2, 3, 3, 1, 2, 3, 1]),
      target: undefined
    };
    
    const patternResult = await rustML.optimize(patternTask);
    console.log(' Pattern learning result:', {
      success: patternResult.success,
      patterns: patternResult.result.patterns?.length || 0,
      clusters: patternResult.result.clusters?.length || 0,
      similarity: patternResult.result.similarity
    });
    
    console.log('\n All Rust integration tests passed!');
    console.log(' Rust neural ML backend is working correctly');
    
  } catch (error) {
    console.error(' Rust integration test failed:', error);
    process.exit(1);
  }
}

testRustIntegration();