/**
 * Integration tests for ruv-FANN Node.js bindings
 */

import { 
  NeuralNetwork, 
  NetworkTrainer, 
  getVersion, 
  isGpuAvailable, 
  getActivationFunctions,
  getBackendInfo,
  init 
} from '../index.js';

async function runTests() {
  console.log('🧪 Running ruv-FANN bindings integration tests...\n');

  try {
    // Initialize the module
    await init();
    console.log('✓ Module initialization successful');

    // Test 1: Basic network creation
    console.log('\n📋 Test 1: Basic network creation');
    const network = new NeuralNetwork([2, 4, 1]);
    console.log('✓ Network created with layers [2, 4, 1]');

    // Test 2: Network information
    console.log('\n📋 Test 2: Network information');
    const info = JSON.parse(network.getInfo());
    console.log('✓ Network info:', info);
    
    if (info.num_input !== 2 || info.num_output !== 1) {
      throw new Error('Network configuration mismatch');
    }
    console.log('✓ Network configuration validated');

    // Test 3: Basic network run
    console.log('\n📋 Test 3: Basic network run');
    const input = [0.5, 0.8];
    const output = network.run(input);
    console.log(`✓ Network run with input [${input}] -> output [${output}]`);
    
    if (!Array.isArray(output) || output.length !== 1) {
      throw new Error('Invalid network output');
    }
    console.log('✓ Network output validated');

    // Test 4: Training on single pattern
    console.log('\n📋 Test 4: Training on single pattern');
    const target = [0.3];
    const error = network.trainOn(input, target);
    console.log(`✓ Training error: ${error}`);
    
    if (typeof error !== 'number' || isNaN(error)) {
      throw new Error('Invalid training error value');
    }
    console.log('✓ Training error validated');

    // Test 5: Trainer creation and batch training
    console.log('\n📋 Test 5: Trainer creation and batch training');
    const trainer = new NetworkTrainer(network);
    console.log('✓ Trainer created');

    const trainingData = {
      inputs: [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]],
      outputs: [[0.0], [1.0], [1.0], [0.0]] // XOR problem
    };

    const config = {
      learning_rate: 0.1,
      max_epochs: 100,
      desired_error: 0.1,
      algorithm: 'backpropagation'
    };

    const finalError = await trainer.train(trainingData.inputs, trainingData.outputs, config);
    console.log(`✓ Batch training completed with final error: ${finalError}`);
    
    if (typeof finalError !== 'number' || isNaN(finalError)) {
      throw new Error('Invalid final training error');
    }
    console.log('✓ Batch training validated');

    // Test 6: Test after training
    console.log('\n📋 Test 6: Test network after training');
    for (let i = 0; i < trainingData.inputs.length; i++) {
      const testOutput = network.run(trainingData.inputs[i]);
      console.log(`  Input: [${trainingData.inputs[i]}] -> Output: [${testOutput[0].toFixed(3)}] (Expected: [${trainingData.outputs[i]}])`);
    }
    console.log('✓ Post-training test completed');

    // Test 7: Utility functions
    console.log('\n📋 Test 7: Utility functions');
    const version = getVersion();
    const gpuAvailable = isGpuAvailable();
    const activationFunctions = getActivationFunctions();
    const backendInfo = getBackendInfo();

    console.log(`✓ Version: ${version}`);
    console.log(`✓ GPU Available: ${gpuAvailable}`);
    console.log(`✓ Activation Functions: ${activationFunctions.join(', ')}`);
    console.log(`✓ Backend Info:`, backendInfo);

    // Test 8: Error handling
    console.log('\n📋 Test 8: Error handling');
    try {
      // Test invalid input size
      network.run([1.0]); // Should fail - network expects 2 inputs
      throw new Error('Should have thrown error for invalid input size');
    } catch (error) {
      if (error.message.includes('Should have thrown')) {
        throw error;
      }
      console.log('✓ Error handling for invalid input size works');
    }

    try {
      // Test invalid network configuration
      new NeuralNetwork([]); // Should fail - empty layers
      throw new Error('Should have thrown error for empty layers');
    } catch (error) {
      if (error.message.includes('Should have thrown')) {
        throw error;
      }
      console.log('✓ Error handling for invalid network configuration works');
    }

    console.log('\n🎉 All tests passed successfully!');
    console.log(`\n📊 Backend Summary:`);
    console.log(`   Backend: ${backendInfo.backend}`);
    console.log(`   Version: ${backendInfo.version}`);
    console.log(`   GPU: ${backendInfo.gpuAvailable ? 'Available' : 'Not Available'}`);
    console.log(`   Functions: ${backendInfo.activationFunctions.length} activation functions`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Performance benchmark test
async function runPerformanceTest() {
  console.log('\n🚀 Running performance benchmark...');

  await init();
  const network = new NeuralNetwork([10, 20, 10, 1]);
  
  const iterations = 1000;
  const input = Array.from({length: 10}, () => Math.random());
  
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    network.run(input);
  }
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`✓ Performance test completed:`);
  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average per run: ${avgTime.toFixed(4)}ms`);
  console.log(`  Runs per second: ${(1000 / avgTime).toFixed(0)}`);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => runPerformanceTest())
    .then(() => {
      console.log('\n✅ All tests and benchmarks completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

export { runTests, runPerformanceTest };