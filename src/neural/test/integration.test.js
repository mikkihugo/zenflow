/**
 * Integration test for Claude Zen Neural Service
 */

import {
  ClaudeZenNeuralService,
  neuralService,
  initializeNeuralService,
  createNeuralNetwork,
  getNeuralNetwork,
  trainNeuralNetwork,
  predictWithNetwork,
  getNeuralServiceStatus
} from '../integration.js';

async function runNeuralServiceTests() {
  console.log('🧠 Testing Claude Zen Neural Service Integration...\n');

  try {
    // Test 1: Service initialization
    console.log('📋 Test 1: Service initialization');
    await initializeNeuralService();
    console.log('✓ Neural service initialized successfully');

    const status = getNeuralServiceStatus();
    console.log('✓ Service status:', status.backend?.backend);

    // Test 2: Network creation through service
    console.log('\n📋 Test 2: Network creation through service');
    const network = await createNeuralNetwork('xor-network', [2, 4, 1], {
      description: 'XOR problem solver',
      purpose: 'testing'
    });
    console.log('✓ Network created through service');

    // Test 3: Network retrieval
    console.log('\n📋 Test 3: Network retrieval');
    const retrievedNetwork = getNeuralNetwork('xor-network');
    if (!retrievedNetwork) {
      throw new Error('Failed to retrieve network');
    }
    console.log('✓ Network retrieved successfully');

    // Test 4: Service-managed training
    console.log('\n📋 Test 4: Service-managed training');
    const trainingData = {
      inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
      outputs: [[0], [1], [1], [0]]
    };

    const config = {
      learning_rate: 0.1,
      max_epochs: 100,
      desired_error: 0.1
    };

    const error = await trainNeuralNetwork('xor-network', trainingData, config);
    console.log(`✓ Training completed with error: ${error}`);

    // Test 5: Prediction through service
    console.log('\n📋 Test 5: Prediction through service');
    const testInputs = [[0, 0], [0, 1], [1, 0], [1, 1]];
    const expectedOutputs = [[0], [1], [1], [0]];

    for (let i = 0; i < testInputs.length; i++) {
      const prediction = predictWithNetwork('xor-network', testInputs[i]);
      console.log(`  Input: [${testInputs[i]}] -> Prediction: [${prediction[0].toFixed(3)}] (Expected: [${expectedOutputs[i]}])`);
    }
    console.log('✓ Predictions completed');

    // Test 6: Service status and metadata
    console.log('\n📋 Test 6: Service status and metadata');
    const finalStatus = getNeuralServiceStatus();
    console.log('✓ Service status:');
    console.log(`  - Initialized: ${finalStatus.initialized}`);
    console.log(`  - Backend: ${finalStatus.backend?.backend}`);
    console.log(`  - Networks: ${finalStatus.networks.length}`);
    console.log(`  - Trainers: ${finalStatus.trainers.length}`);

    if (finalStatus.networks.length > 0) {
      console.log('✓ Network metadata:');
      finalStatus.networks.forEach(net => {
        console.log(`    - ${net.id}: ${net.layers} (${net.description || 'no description'})`);
      });
    }

    // Test 7: Multiple networks
    console.log('\n📋 Test 7: Multiple networks');
    await createNeuralNetwork('simple-classifier', [3, 5, 2], {
      description: 'Simple classifier',
      purpose: 'classification'
    });

    await createNeuralNetwork('regression-model', [4, 8, 4, 1], {
      description: 'Regression model',
      purpose: 'regression'
    });

    const multiStatus = getNeuralServiceStatus();
    console.log(`✓ Multiple networks created: ${multiStatus.networks.length} total`);

    // Test 8: Error handling
    console.log('\n📋 Test 8: Error handling');
    try {
      await createNeuralNetwork('xor-network', [2, 1]); // Duplicate ID
      throw new Error('Should have failed for duplicate network ID');
    } catch (error) {
      if (error.message.includes('Should have failed')) {
        throw error;
      }
      console.log('✓ Duplicate network ID error handling works');
    }

    try {
      predictWithNetwork('non-existent', [1, 2]); // Non-existent network
      throw new Error('Should have failed for non-existent network');
    } catch (error) {
      if (error.message.includes('Should have failed')) {
        throw error;
      }
      console.log('✓ Non-existent network error handling works');
    }

    // Test 9: Service class instantiation
    console.log('\n📋 Test 9: Service class instantiation');
    const customService = new ClaudeZenNeuralService();
    await customService.initialize();
    await customService.createNetwork('custom-net', [2, 3, 1]);
    const customStatus = customService.getStatus();
    console.log(`✓ Custom service instance created with ${customStatus.networks.length} network(s)`);

    customService.dispose();
    console.log('✓ Custom service disposed');

    console.log('\n🎉 All neural service integration tests passed!');

    // Performance test
    console.log('\n🚀 Running neural service performance test...');
    const perfStart = performance.now();
    
    for (let i = 0; i < 100; i++) {
      predictWithNetwork('xor-network', [Math.random(), Math.random()]);
    }
    
    const perfEnd = performance.now();
    const perfTime = perfEnd - perfStart;
    console.log(`✓ Performance test: 100 predictions in ${perfTime.toFixed(2)}ms (${(100 / perfTime * 1000).toFixed(0)} predictions/sec)`);

  } catch (error) {
    console.error('\n❌ Neural service test failed:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Integration test with claude-zen components
async function runClaudeZenIntegrationTest() {
  console.log('\n🔗 Testing integration with claude-zen components...');

  try {
    // Initialize neural service
    await initializeNeuralService();

    // Create a network for decision making
    await createNeuralNetwork('decision-maker', [5, 10, 3], {
      description: 'Claude Zen decision maker',
      purpose: 'agent_coordination'
    });

    // Simulate agent coordination data
    const coordinationData = {
      inputs: [
        [1, 0, 0, 0, 1], // High priority task, no conflicts
        [0, 1, 1, 0, 0], // Medium priority, some conflicts
        [0, 0, 1, 1, 1], // Low priority, high conflicts
        [1, 1, 0, 0, 0], // High priority, medium conflicts
      ],
      outputs: [
        [1, 0, 0], // Execute immediately
        [0, 1, 0], // Queue for later
        [0, 0, 1], // Reject/defer
        [1, 0, 0], // Execute immediately
      ]
    };

    // Train the decision maker
    const trainingError = await trainNeuralNetwork('decision-maker', coordinationData, {
      learning_rate: 0.2,
      max_epochs: 200,
      desired_error: 0.05
    });

    console.log(`✓ Decision maker trained with error: ${trainingError}`);

    // Test decision making
    const testScenario = [0, 1, 0, 1, 0]; // Medium priority, medium conflicts
    const decision = predictWithNetwork('decision-maker', testScenario);
    console.log(`✓ Decision for scenario ${testScenario}: [${decision.map(x => x.toFixed(3)).join(', ')}]`);

    console.log('✓ Claude Zen integration test completed successfully');

  } catch (error) {
    console.error('❌ Claude Zen integration test failed:', error.message);
    throw error;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runNeuralServiceTests()
    .then(() => runClaudeZenIntegrationTest())
    .then(() => {
      console.log('\n✅ All neural service tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Neural service test suite failed:', error);
      process.exit(1);
    });
}

export { runNeuralServiceTests, runClaudeZenIntegrationTest };