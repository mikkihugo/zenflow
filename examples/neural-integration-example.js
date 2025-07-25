#!/usr/bin/env node
/**
 * Example: ruv-FANN Neural Network Integration with Claude Zen
 * 
 * This example demonstrates how to use the ruv-FANN Node.js bindings
 * integrated with the Claude Zen ecosystem.
 */

import {
  ClaudeZenNeuralService,
  initializeNeuralService,
  createNeuralNetwork,
  trainNeuralNetwork,
  predictWithNetwork,
  getNeuralServiceStatus,
  getNeuralBackendInfo
} from '../src/neural/integration.js';

async function main() {
  console.log('🧠 Claude Zen + ruv-FANN Neural Network Example\n');

  try {
    // Initialize the neural service
    console.log('🚀 Initializing neural service...');
    await initializeNeuralService();
    
    const backendInfo = getNeuralBackendInfo();
    console.log(`✓ Using ${backendInfo.backend} backend (${backendInfo.version})`);
    console.log(`  GPU Available: ${backendInfo.gpuAvailable}\n`);

    // Example 1: XOR Problem (Classic neural network test)
    console.log('📋 Example 1: XOR Problem');
    console.log('Creating neural network for XOR problem...');
    
    await createNeuralNetwork('xor-solver', [2, 4, 1], {
      description: 'Solves XOR logical operation',
      purpose: 'classification'
    });

    // Training data for XOR problem
    const xorData = {
      inputs: [
        [0, 0], [0, 1], [1, 0], [1, 1]
      ],
      outputs: [
        [0], [1], [1], [0]
      ]
    };

    console.log('Training network on XOR data...');
    const xorError = await trainNeuralNetwork('xor-solver', xorData, {
      learning_rate: 0.2,
      max_epochs: 500,
      desired_error: 0.1,
      algorithm: 'backpropagation'
    });

    console.log(`✓ Training completed with final error: ${xorError.toFixed(6)}\n`);

    // Test the XOR network
    console.log('Testing XOR network:');
    for (let i = 0; i < xorData.inputs.length; i++) {
      const input = xorData.inputs[i];
      const expected = xorData.outputs[i][0];
      const predicted = predictWithNetwork('xor-solver', input)[0];
      const correct = Math.abs(predicted - expected) < 0.5 ? '✓' : '✗';
      
      console.log(`  ${input[0]} XOR ${input[1]} = ${predicted.toFixed(3)} (expected: ${expected}) ${correct}`);
    }

    // Example 2: Pattern Recognition
    console.log('\n📋 Example 2: Simple Pattern Recognition');
    console.log('Creating neural network for pattern recognition...');
    
    await createNeuralNetwork('pattern-recognizer', [8, 12, 4], {
      description: 'Recognizes simple patterns',
      purpose: 'pattern_recognition'
    });

    // Generate training data for simple patterns
    const patternData = {
      inputs: [
        [1, 1, 0, 0, 0, 0, 0, 0], // Pattern A
        [0, 0, 1, 1, 0, 0, 0, 0], // Pattern B
        [0, 0, 0, 0, 1, 1, 0, 0], // Pattern C
        [0, 0, 0, 0, 0, 0, 1, 1], // Pattern D
        [1, 0, 1, 0, 0, 0, 0, 0], // Variant A
        [0, 1, 0, 1, 0, 0, 0, 0], // Variant B
        [0, 0, 0, 0, 1, 0, 1, 0], // Variant C
        [0, 0, 0, 0, 0, 1, 0, 1], // Variant D
      ],
      outputs: [
        [1, 0, 0, 0], // Class A
        [0, 1, 0, 0], // Class B
        [0, 0, 1, 0], // Class C
        [0, 0, 0, 1], // Class D
        [1, 0, 0, 0], // Class A (variant)
        [0, 1, 0, 0], // Class B (variant)
        [0, 0, 1, 0], // Class C (variant)
        [0, 0, 0, 1], // Class D (variant)
      ]
    };

    console.log('Training pattern recognition network...');
    const patternError = await trainNeuralNetwork('pattern-recognizer', patternData, {
      learning_rate: 0.1,
      max_epochs: 300,
      desired_error: 0.2,
      algorithm: 'backpropagation'
    });

    console.log(`✓ Training completed with final error: ${patternError.toFixed(6)}\n`);

    // Test pattern recognition
    console.log('Testing pattern recognition:');
    const testPattern = [1, 0, 0, 1, 0, 0, 0, 0]; // Mixed pattern
    const patternResult = predictWithNetwork('pattern-recognizer', testPattern);
    const maxIndex = patternResult.indexOf(Math.max(...patternResult));
    const classes = ['A', 'B', 'C', 'D'];
    
    console.log(`  Input pattern: [${testPattern.join(', ')}]`);
    console.log(`  Classification: ${classes[maxIndex]} (confidence: ${(patternResult[maxIndex] * 100).toFixed(1)}%)`);
    console.log(`  Full output: [${patternResult.map(x => x.toFixed(3)).join(', ')}]`);

    // Example 3: Decision Making for Claude Zen
    console.log('\n📋 Example 3: Claude Zen Decision Making');
    console.log('Creating neural network for agent decision making...');
    
    await createNeuralNetwork('decision-engine', [6, 10, 8, 3], {
      description: 'Makes decisions for Claude Zen agents',
      purpose: 'agent_coordination'
    });

    // Simulated decision making data
    const decisionData = {
      inputs: [
        [1.0, 0.8, 0.2, 0.1, 0.9, 0.3], // High priority, low conflict, high resources
        [0.3, 0.6, 0.7, 0.8, 0.4, 0.2], // Low priority, high conflict, medium resources
        [0.8, 0.5, 0.4, 0.3, 0.7, 0.8], // High priority, medium conflict, high resources
        [0.2, 0.3, 0.9, 0.9, 0.1, 0.1], // Low priority, very high conflict, low resources
        [0.9, 0.7, 0.1, 0.0, 0.8, 0.9], // Very high priority, no conflict, high resources
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], // Balanced scenario
      ],
      outputs: [
        [1, 0, 0], // Execute immediately
        [0, 0, 1], // Defer/reject
        [0, 1, 0], // Queue for later
        [0, 0, 1], // Defer/reject
        [1, 0, 0], // Execute immediately
        [0, 1, 0], // Queue for later
      ]
    };

    console.log('Training decision engine...');
    const decisionError = await trainNeuralNetwork('decision-engine', decisionData, {
      learning_rate: 0.15,
      max_epochs: 400,
      desired_error: 0.15,
      algorithm: 'backpropagation'
    });

    console.log(`✓ Training completed with final error: ${decisionError.toFixed(6)}\n`);

    // Test decision making
    console.log('Testing decision engine:');
    const scenarios = [
      { name: 'High Priority Task', input: [0.9, 0.8, 0.3, 0.2, 0.8, 0.7] },
      { name: 'Conflicted Task', input: [0.6, 0.4, 0.8, 0.9, 0.3, 0.2] },
      { name: 'Resource Constrained', input: [0.7, 0.6, 0.4, 0.3, 0.2, 0.1] },
    ];

    const actions = ['Execute Now', 'Queue Later', 'Defer/Reject'];
    
    for (const scenario of scenarios) {
      const decision = predictWithNetwork('decision-engine', scenario.input);
      const actionIndex = decision.indexOf(Math.max(...decision));
      const confidence = (decision[actionIndex] * 100).toFixed(1);
      
      console.log(`  ${scenario.name}:`);
      console.log(`    Decision: ${actions[actionIndex]} (${confidence}% confidence)`);
      console.log(`    Factors: [${scenario.input.map(x => x.toFixed(1)).join(', ')}]`);
    }

    // Show service status
    console.log('\n📊 Neural Service Status:');
    const status = getNeuralServiceStatus();
    console.log(`  Networks created: ${status.networks.length}`);
    console.log(`  Active trainers: ${status.trainers.length}`);
    console.log(`  Backend: ${status.backend?.backend || 'unknown'}`);
    
    console.log('\n  Network Details:');
    status.networks.forEach(net => {
      console.log(`    • ${net.id}: ${net.layers} - ${net.description}`);
    });

    // Performance benchmark
    console.log('\n⚡ Performance Benchmark:');
    const iterations = 1000;
    const testInput = [0.5, 0.5];
    
    console.time('1000 XOR predictions');
    for (let i = 0; i < iterations; i++) {
      predictWithNetwork('xor-solver', testInput);
    }
    console.timeEnd('1000 XOR predictions');

    console.log('\n✅ Example completed successfully!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('  • N-API bindings with WASM fallback');
    console.log('  • Multiple neural network management');
    console.log('  • Training with different algorithms');
    console.log('  • Pattern recognition and classification');
    console.log('  • Claude Zen agent decision making');
    console.log('  • High-performance prediction engine');
    console.log('\n🚀 Ready for integration with Claude Zen ecosystem!');

  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}