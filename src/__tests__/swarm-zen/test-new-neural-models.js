/**
 * Test script for new neural models
 * Tests GNN, ResNet, and VAE implementations
 */

import {
  createNeuralModel,
  MODEL_PRESETS,
} from '../src/neural-models/index.js';

async function testGNNModel() {
  try {
    // Create GNN with social network preset
    const gnn = await createNeuralModel(
      'gnn',
      MODEL_PRESETS.gnn.social_network
    );

    // Create sample graph data
    const graphData = {
      nodes: new Float32Array(10 * 128), // 10 nodes, 128 features each
      edges: new Float32Array(15 * 64), // 15 edges, 64 features each
      adjacency: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 5],
        [1, 6],
        [2, 7],
        [3, 8],
        [4, 9],
        [5, 6],
        [6, 7],
        [7, 8],
        [8, 9],
        [9, 5],
      ],
    };

    // Initialize random node features
    for (let i = 0; i < graphData.nodes.length; i++) {
      graphData.nodes[i] = Math.random();
    }
    graphData.nodes.shape = [10, 128];
    const _output = await gnn.forward(graphData, false);
    const trainingData = [
      {
        graphs: graphData,
        targets: {
          taskType: 'node_classification',
          labels: new Float32Array(10).fill(0),
        },
      },
    ];

    const _result = await gnn.train(trainingData, { epochs: 2, batchSize: 1 });
  } catch (error) {
    console.error('  ❌ GNN test failed:', error);
  }
}

async function testResNetModel() {
  try {
    // Create ResNet with resnet18 preset
    const resnet = await createNeuralModel('resnet', {
      ...MODEL_PRESETS.resnet.resnet18,
      inputDimensions: 784,
      outputDimensions: 10,
    });

    // Create sample data (batch of MNIST-like images)
    const batchSize = 4;
    const inputData = new Float32Array(batchSize * 784);
    for (let i = 0; i < inputData.length; i++) {
      inputData[i] = Math.random();
    }
    inputData.shape = [batchSize, 784];
    const _output = await resnet.forward(inputData, false);
    const targets = new Float32Array(batchSize * 10);
    for (let i = 0; i < batchSize; i++) {
      targets[i * 10 + Math.floor(Math.random() * 10)] = 1; // One-hot encoding
    }
    targets.shape = [batchSize, 10];

    const trainingData = [
      {
        inputs: inputData,
        targets,
      },
    ];

    const _result = await resnet.train(trainingData, {
      epochs: 2,
      batchSize: 2,
    });
  } catch (error) {
    console.error('  ❌ ResNet test failed:', error);
  }
}

async function testVAEModel() {
  try {
    // Create VAE with mnist preset
    const vae = await createNeuralModel('vae', MODEL_PRESETS.vae.mnist_vae);

    // Create sample data
    const batchSize = 4;
    const inputData = new Float32Array(batchSize * 784);
    for (let i = 0; i < inputData.length; i++) {
      inputData[i] = Math.random(); // Random pixel values
    }
    inputData.shape = [batchSize, 784];
    const _output = await vae.forward(inputData, false);
    const _generated = await vae.generate(2);
    const sample1 = inputData.slice(0, 784);
    const sample2 = inputData.slice(784, 1568);
    sample1.shape = [1, 784];
    sample2.shape = [1, 784];

    const _interpolations = await vae.interpolate(sample1, sample2, 5);
    const trainingData = [
      {
        inputs: inputData,
      },
    ];

    const _result = await vae.train(trainingData, { epochs: 2, batchSize: 2 });
  } catch (error) {
    console.error('  ❌ VAE test failed:', error);
  }
}

async function runAllTests() {
  await testGNNModel();
  await testResNetModel();
  await testVAEModel();
}

// Run tests
runAllTests().catch(console.error);
