# ruv-FANN Node.js Bindings

High-performance Node.js bindings for the ruv-FANN neural network library with automatic WASM fallback.

## Features

- 🚀 **High Performance**: Native N-API bindings for maximum speed
- 🌐 **Universal Compatibility**: Automatic WASM fallback for any platform
- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- 🧠 **Complete API**: Full access to ruv-FANN's neural network capabilities
- ⚡ **GPU Ready**: GPU acceleration support when available
- 📦 **Easy Integration**: Drop-in replacement with automatic backend selection

## Installation

```bash
npm install @claude-zen/ruv-fann-bindings
```

## Quick Start

```javascript
import { NeuralNetwork, NetworkTrainer, init } from '@claude-zen/ruv-fann-bindings';

// Initialize the module (detects and loads best backend)
await init();

// Create a neural network with 2 inputs, 4 hidden neurons, 1 output
const network = new NeuralNetwork([2, 4, 1]);

// Run the network
const output = network.run([0.5, 0.8]);
console.log('Output:', output); // [0.234...]

// Train on XOR problem
const trainer = new NetworkTrainer(network);
const finalError = await trainer.train(
  [[0,0], [0,1], [1,0], [1,1]], // inputs
  [[0],   [1],   [1],   [0]],   // expected outputs (XOR)
  {
    learning_rate: 0.1,
    max_epochs: 1000,
    desired_error: 0.01,
    algorithm: 'backpropagation'
  }
);

console.log('Training completed with error:', finalError);
```

## API Reference

### NeuralNetwork

Main class for creating and managing feedforward neural networks.

#### Constructor

```typescript
new NeuralNetwork(layers: number[])
```

Creates a new neural network with specified layer sizes.

**Parameters:**
- `layers`: Array of layer sizes including input and output layers

**Example:**
```javascript
// Network with 3 inputs, 5 hidden neurons, 2 outputs
const network = new NeuralNetwork([3, 5, 2]);
```

#### Methods

##### `run(input: number[]): number[]`

Runs the network with input data and returns the output.

```javascript
const output = network.run([0.1, 0.5, 0.9]);
```

##### `trainOn(input: number[], target: number[]): number`

Trains the network on a single input/output pair. Returns the training error.

```javascript
const error = network.trainOn([0.1, 0.5], [0.8]);
```

##### `getInfo(): string`

Returns network information as a JSON string.

```javascript
const info = JSON.parse(network.getInfo());
console.log(info);
// {
//   "num_layers": 3,
//   "num_input": 2,
//   "num_output": 1,
//   "type": "feedforward"
// }
```

##### `save(filename: string): void`

Saves the network to a file (when IO feature is enabled).

```javascript
network.save('./my_network.fann');
```

##### `static load(filename: string): NeuralNetwork`

Loads a network from a file.

```javascript
const network = NeuralNetwork.load('./my_network.fann');
```

### NetworkTrainer

Advanced trainer for neural networks with batch training capabilities.

#### Constructor

```typescript
new NetworkTrainer(network: NeuralNetwork)
```

#### Methods

##### `train(inputs: number[][], outputs: number[][], config: TrainingConfig): Promise<number>`

Trains the network with provided data and configuration.

```javascript
const config = {
  learning_rate: 0.1,
  max_epochs: 1000,
  desired_error: 0.01,
  algorithm: 'backpropagation'
};

const error = await trainer.train(trainingInputs, trainingOutputs, config);
```

### TrainingConfig

Configuration object for training operations.

```typescript
interface TrainingConfig {
  learning_rate: number;    // Learning rate (e.g., 0.1)
  max_epochs: number;       // Maximum training epochs
  desired_error: number;    // Target error to stop training
  algorithm: string;        // Training algorithm name
}
```

### Utility Functions

#### `getVersion(): string`

Returns the version of the ruv-FANN bindings.

#### `isGpuAvailable(): boolean`

Checks if GPU acceleration is available.

#### `getActivationFunctions(): string[]`

Returns array of supported activation function names.

#### `getBackendInfo(): object`

Returns information about the current backend being used.

```javascript
const info = getBackendInfo();
console.log(info);
// {
//   backend: 'native' | 'wasm',
//   version: '1.0.0',
//   gpuAvailable: true,
//   activationFunctions: ['sigmoid', 'tanh', ...]
// }
```

#### `init(): Promise<void>`

Initializes the module and selects the best available backend. Call this before using other functions.

## Backend Selection

The library automatically selects the best available backend:

1. **Native N-API bindings** (preferred for maximum performance)
2. **WASM fallback** (universal compatibility)

The selection is transparent to your code - the same API works with both backends.

### Checking Current Backend

```javascript
import { getBackendInfo } from '@claude-zen/ruv-fann-bindings';

const info = getBackendInfo();
console.log(`Using ${info.backend} backend`);
```

## Advanced Features

### GPU Acceleration

When available, GPU acceleration can be utilized:

```javascript
if (isGpuAvailable()) {
  console.log('🚀 GPU acceleration available!');
  // GPU will be used automatically when beneficial
}
```

### WASM Fallback

You can explicitly use the WASM fallback:

```javascript
import { wasmFallback } from '@claude-zen/ruv-fann-bindings';

await wasmFallback.init();
const network = wasmFallback.createNetwork([2, 4, 1]);
```

### Custom Activation Functions

The library supports multiple activation functions:

```javascript
const functions = getActivationFunctions();
console.log('Available activation functions:', functions);
// ['linear', 'sigmoid', 'tanh', 'relu', ...]
```

## Error Handling

The library provides comprehensive error handling:

```javascript
try {
  const network = new NeuralNetwork([2, 4, 1]);
  const output = network.run([0.5]); // Wrong input size
} catch (error) {
  console.error('Network error:', error.message);
}
```

## Performance Tips

1. **Use native bindings when possible** - they provide significantly better performance
2. **Batch operations** - use `NetworkTrainer.train()` for multiple training samples
3. **GPU acceleration** - enable when available for large networks
4. **Pre-compile** - build native bindings during deployment for production use

## Building from Source

```bash
# Clone the repository
git clone https://github.com/mikkihugo/claude-code-zen.git
cd claude-code-zen/src/bindings

# Build native bindings and WASM fallback
./build.sh

# Run tests
npm test
```

## Requirements

- **Node.js**: 16.0 or higher
- **Rust**: 1.70 or higher (for building native bindings)
- **Platform**: Linux, macOS, or Windows

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please see the main repository's contributing guidelines.

## Support

- 📚 [Documentation](https://github.com/mikkihugo/claude-code-zen)
- 🐛 [Issues](https://github.com/mikkihugo/claude-code-zen/issues)
- 💬 [Discussions](https://github.com/mikkihugo/claude-code-zen/discussions)