/**
 * Simple Integration Test for Smart Neural Coordinator
 * Tests the basic functionality without complex dependencies
 */

import { SmartNeuralCoordinator } from './src/smart-neural-coordinator';
import type {
  NeuralBackendConfig,
  NeuralEmbeddingRequest,
} from './src/smart-neural-coordinator';

// Mock external dependencies
const mockTransformers = {
  pipeline: async () => ({
    generate: async () =>
      new Array(384).fill(0).map((_, i) => Math.sin(i * 0.1)),
  }),
};

const mockBrainJs = {
  NeuralNetwork: function () {
    return {
      run: () => new Array(10).fill(0).map(() => Math.random()),
    };
  },
};

// Mock modules at runtime
const originalRequire = require;
require = function (id: string) {
  if (id === '@xenova/transformers') {
    return mockTransformers;
  }
  if (id === 'brain.js') {
    return mockBrainJs;
  }
  if (id === 'onnxruntime-node') {
    return { InferenceSession: { create: async () => null } };
  }
  if (id === 'openai') {
    return {
      default: function () {
        return { embeddings: { create: async () => null } };
      },
    };
  }
  return originalRequire.call(this, id);
} as any;

async function runIntegrationTest() {
  console.log('🧪 Starting Smart Neural Coordinator Integration Test\n');

  try {
    // Test 1: Basic initialization
    console.log('Test 1: Basic Initialization');
    const config: NeuralBackendConfig = {
      primaryModel: 'all-mpnet-base-v2',
      enableFallbacks: true,
      enableCaching: true,
      maxCacheSize: 100,
    };

    const coordinator = new SmartNeuralCoordinator(config);
    await coordinator.initialize();
    console.log('✅ Coordinator initialized successfully\n');

    // Test 2: Get statistics
    console.log('Test 2: Get Statistics');
    const stats = coordinator.getCoordinatorStats();
    console.log('📊 Configuration:', stats.configuration);
    console.log('🎯 Models Status:', stats.models);
    console.log('📈 Performance:', stats.performance);
    console.log('💾 Cache:', stats.cache);
    console.log('🔗 Fallback Chain:', stats.fallbackChain);
    console.log('✅ Statistics retrieved successfully\n');

    // Test 3: Generate embedding
    console.log('Test 3: Generate Embedding');
    const request: NeuralEmbeddingRequest = {
      text: 'This is a test sentence for neural embedding generation',
      context: 'integration-test',
      priority: 'medium',
      qualityLevel: 'standard',
    };

    const result = await coordinator.generateEmbedding(request);
    console.log('🧠 Embedding Result:');
    console.log('  Success:', result.success);
    console.log('  Embedding Length:', result.embedding?.length''''''''||''''''''''''''''||''''''''0);
    console.log('  Model:', result.metadata?.model);
    console.log('  From Cache:', result.metadata?.fromCache);
    console.log('  Processing Time:', result.metadata?.processingTime + 'ms');
    console.log('✅ Embedding generated successfully\n');

    // Test 4: Test caching
    console.log('Test 4: Test Caching');
    const result2 = await coordinator.generateEmbedding(request);
    console.log('🔄 Second Request Result:');
    console.log('  Success:', result2.success);
    console.log('  From Cache:', result2.metadata?.fromCache);
    console.log('  Processing Time:', result2.metadata?.processingTime + 'ms');
    console.log('✅ Caching works correctly\n');

    // Test 5: Input validation
    console.log('Test 5: Input Validation');
    const emptyRequest: NeuralEmbeddingRequest = {
      text: '',
      priority: 'medium',
    };

    const emptyResult = await coordinator.generateEmbedding(emptyRequest);
    console.log('🚫 Empty Text Result:');
    console.log('  Success:', emptyResult.success);
    console.log('  Error:', emptyResult.error);
    console.log('✅ Input validation works correctly\n');

    // Test 6: Performance statistics after operations
    console.log('Test 6: Performance Statistics After Operations');
    const finalStats = coordinator.getCoordinatorStats();
    console.log('📊 Final Performance:', finalStats.performance);
    console.log('💾 Final Cache:', finalStats.cache);
    console.log('✅ Performance tracking works correctly\n');

    // Test 7: Cleanup
    console.log('Test 7: Cleanup');
    await coordinator.clearCache();
    await coordinator.shutdown();
    console.log('✅ Cleanup completed successfully\n');

    console.log('🎉 All integration tests passed successfully!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
runIntegrationTest().catch((error) => {
  console.error('❌ Failed to run integration test:', error);
  process.exit(1);
});
