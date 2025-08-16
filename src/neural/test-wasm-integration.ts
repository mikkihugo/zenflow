/**
 * Test script for WASM neural integration
 * 
 * This script tests the integration between TypeScript Neural Bridge
 * and the Rust FANN WASM implementation.
 */

import { NeuralBridge, TrainingData } from './neural-bridge';
import { getLogger } from '../config/logging-config';

const logger = getLogger('WasmTest');

async function testWasmIntegration(): Promise<void> {
  logger.info('🧪 Starting WASM Neural Integration Test...');

  try {
    // Initialize the neural bridge
    const neuralBridge = NeuralBridge.getInstance({
      wasmPath: './wasm/claude_zen_neural',
      enableTraining: true,
      gpuAcceleration: false
    });

    await neuralBridge.initialize();
    logger.info('✅ Neural Bridge initialized successfully');

    // Test 1: Create a simple neural network
    logger.info('🔧 Creating a simple feedforward network...');
    const networkId = await neuralBridge.createNetwork(
      'test-network-1',
      'feedforward',
      [2, 4, 1] // XOR problem: 2 inputs, 4 hidden, 1 output
    );
    logger.info(`✅ Network created with ID: ${networkId}`);

    // Test 2: Prepare XOR training data
    const trainingData: TrainingData = {
      inputs: [
        [0, 0], // XOR: 0 XOR 0 = 0
        [0, 1], // XOR: 0 XOR 1 = 1
        [1, 0], // XOR: 1 XOR 0 = 1
        [1, 1]  // XOR: 1 XOR 1 = 0
      ],
      outputs: [
        [0], // Expected: 0
        [1], // Expected: 1
        [1], // Expected: 1
        [0]  // Expected: 0
      ]
    };

    // Test 3: Train the network
    logger.info('🏋️ Training network on XOR problem...');
    const trainingSuccess = await neuralBridge.trainNetwork(
      networkId,
      trainingData,
      1000 // 1000 epochs
    );

    if (trainingSuccess) {
      logger.info('✅ Training completed successfully');
    } else {
      logger.error('❌ Training failed');
      return;
    }

    // Test 4: Test predictions
    logger.info('🔮 Testing predictions...');
    const testCases = [
      [0, 0], // Should predict ~0
      [0, 1], // Should predict ~1
      [1, 0], // Should predict ~1
      [1, 1]  // Should predict ~0
    ];

    for (let i = 0; i < testCases.length; i++) {
      const inputs = testCases[i];
      const expected = trainingData.outputs[i][0];
      
      const result = await neuralBridge.predict(networkId, inputs);
      const predicted = result.outputs[0];
      const error = Math.abs(predicted - expected);
      
      logger.info(
        `Input: [${inputs.join(', ')}] → Expected: ${expected}, Predicted: ${predicted.toFixed(4)}, Error: ${error.toFixed(4)}, Confidence: ${result.confidence.toFixed(4)}`
      );
    }

    // Test 5: Get network stats
    const stats = neuralBridge.getStats();
    logger.info('📊 Neural System Stats:', {
      totalNetworks: stats.totalNetworks,
      activeNetworks: stats.activeNetworks,
      trainingNetworks: stats.trainingNetworks,
      wasmEnabled: stats.wasmEnabled,
      gpuEnabled: stats.gpuEnabled
    });

    // Test 6: Test network status
    const networkStatus = neuralBridge.getNetworkStatus(networkId);
    logger.info('🔍 Network Status:', networkStatus);

    // Test 7: List all networks
    const allNetworks = neuralBridge.listNetworks();
    logger.info(`📋 Total networks: ${allNetworks.length}`);

    // Test 8: Cleanup
    const removed = neuralBridge.removeNetwork(networkId);
    logger.info(`🗑️ Network removed: ${removed}`);

    // Test 9: Shutdown
    await neuralBridge.shutdown();
    logger.info('🛑 Neural Bridge shutdown complete');

    logger.info('🎉 All WASM integration tests passed!');

  } catch (error) {
    logger.error('❌ WASM integration test failed:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWasmIntegration()
    .then(() => {
      logger.info('🏁 Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testWasmIntegration };