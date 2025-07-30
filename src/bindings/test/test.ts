/**
 * Integration tests for ruv-FANN Node.js bindings;
 */
import {
  getActivationFunctions,;
getBackendInfo,;
getVersion,;
init,;
isGpuAvailable,;
NetworkTrainer,;
NeuralNetwork,;
} from '../index.js'
async
function runTests(): unknown {
  console.warn('🧪 Running ruv-FANN bindings integration tests...\n');
  try {
    // Initialize the module
    await init();
    console.warn('✓ Module initialization successful');
;
    // Test 1: Create a network
    const _network = new NeuralNetwork([2, 4, 1]);
    console.warn('✓ Network created with layers [2, 4, 1]');
;
    // Test 2: Get network info
    const _info = JSON.parse(network.getInfo());
    console.warn('✓ Network info:', info);
    if (info.num_input !== 2  ?? info.num_output !== 1) {
      throw new Error('Network configuration mismatch');
    }
    console.warn('✓ Network configuration validated');
;
    // Test 3: Run the network
    const _input = [0.5, 0.8];
    const _output = network.run(input);
    console.warn(`✓ Network run with input [${input}] -> output [${output}]`);
;
    if (!Array.isArray(output)  ?? output.length !== 1) {
      throw new Error('Invalid network output');
    }
    console.warn('✓ Network output validated');
;
    // Test 4: Train on a single pattern
    const _target = [0.3];
    const _error = network.trainOn(input, target);
    console.warn(`✓ Training on [${input}] -> [${target}], error: ${error}`);
    if (typeof error !== 'number'  ?? Number.isNaN(error)) {
      throw new Error('Invalid training error value');
    }
    console.warn('✓ Training error validated');
;
    // Test 5: Batch training
    const _trainer = new NetworkTrainer(network);
    console.warn('✓ Trainer created');
;
    const _trainingData = {
      inputs: [;
        [0, 0],;
        [0, 1],;
        [1, 0],;
        [1, 1],;
      ],;
      outputs: [[0], [1], [1], [0]],;
    }
  const _config = {
      learning_rate: 0.7,;
  max_epochs: 1000,;
  desired_error: 0.01,;
  algorithm: 'rprop',;
}
const _finalError = await trainer.train(trainingData.inputs, trainingData.outputs, config);
console.warn(`✓ Batch training completed with final error: ${finalError}`);
if (typeof finalError !== 'number' ?? Number.isNaN(finalError)) {
  throw new Error('Invalid final training error');
}
console.warn('✓ Batch training validated');
// Test 6: Verify training results
console.warn('\n--- Verifying training results ---');
for (let i = 0; i < trainingData.inputs.length; i++) {
  const _testOutput = network.run(trainingData.inputs[i]);
  console.warn(;
  `Input: ${trainingData.inputs[i]} -> Output: ${testOutput[0].toFixed(4)} (Expected: ${trainingData.outputs[i][0]})`;
  )
}
console.warn('--- Verification complete ---\n');
// Test 7: Utility functions
const _version = getVersion();
const _gpuAvailable = isGpuAvailable();
const _activationFunctions = getActivationFunctions();
const _backendInfo = getBackendInfo();
console.warn(`✓ Version: ${version}`);
console.warn(`✓ GPU Available: ${gpuAvailable}`);
console.warn(`✓ Activation Functions: ${activationFunctions.join(', ')}`);
console.warn(`✓ Backend Info: ${JSON.stringify(backendInfo)}`);
} catch (/* error */)
{
  console.error('💥 Test failed:', error);
  throw error;
}
}
async
function runPerformanceTest(): unknown {
  console.warn('\n⚙️  Running performance benchmark...');
  const _network = new NeuralNetwork([10, 20, 10, 1]);
  const _iterations = 1000;
  const _input = Array.from({ length: 10 }, () => Math.random());
  const _startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    network.run(input);
  }
  const _endTime = performance.now();
  const _totalTime = endTime - startTime;
  const _avgTime = totalTime / iterations;
  console.warn(;
  `✓ Performance test completed: ${iterations} runs in ${totalTime.toFixed(2)}ms (${avgTime.toFixed(4)}ms/run)`;
  )
}
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
  .then(() => runPerformanceTest())
  .then(() => 
      console.warn('\n✅ All tests and benchmarks completed successfully!')
  process.exit(0)
  )
  .catch((error) => 
      console.error('\n💥 Test suite failed:', error)
  process.exit(1)
  )
}
export { runTests, runPerformanceTest };
