# Claude-Zen Neural WASM API

This directory contains the WebAssembly (WASM) bindings for the claude-zen neural network system. It bridges the existing Rust FANN (Fast Artificial Neural Network) implementation to TypeScript through modern wasm-bindgen patterns.

## 🎯 Purpose

The WASM API enables:
- **High-performance neural computation** in the browser and Node.js
- **Type-safe integration** between Rust neural networks and TypeScript
- **Zero-copy data transfer** using Float32Array for maximum efficiency
- **Automatic memory management** with Rust's Drop trait

## 🏗️ Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   TypeScript        │    │     WASM API         │    │   Rust FANN Core    │
│   Neural Bridge     │◄──►│   (this directory)   │◄──►│   ../core/          │
│                     │    │                      │    │                     │
│ • neural-bridge.ts  │    │ • lib.rs            │    │ • Network           │
│ • Float32Array      │    │ • WasmNetwork       │    │ • Training          │
│ • async/await       │    │ • Error handling     │    │ • Algorithms        │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## 🚀 Building

### Prerequisites

1. **Rust** (latest stable)
2. **wasm-pack** (for generating WASM + TypeScript bindings)
   ```bash
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   ```

### Build Commands

```bash
# Quick build (development)
./build.sh

# Or use npm scripts from project root:
npm run build:neural-wasm      # Production build
npm run build:neural-wasm:dev  # Development build

# Manual wasm-pack commands:
wasm-pack build --target web --out-dir pkg                    # Production
wasm-pack build --dev --target web --out-dir pkg --scope      # Development
```

### Build Output

The build generates:
- `pkg/claude_zen_neural.js` - WASM module loader
- `pkg/claude_zen_neural_bg.wasm` - Compiled neural network binary
- `pkg/claude_zen_neural.d.ts` - TypeScript type definitions
- Copies to `../../wasm/` for integration

## 🔧 API Reference

### WasmNetwork Class

```typescript
// Create a neural network
const network = new WasmNetwork([2, 4, 1]); // 2 inputs, 4 hidden, 1 output

// Train the network
const trainingError = await network.train(inputs, outputs, 1000);

// Make predictions
const predictions = await network.predict([0.5, 0.7]);

// Get network configuration
const layers = await network.get_layers();

// Adjust learning parameters
await network.set_learning_rate(0.01);
const currentRate = await network.get_learning_rate();
```

### Error Handling

```typescript
try {
  const network = new WasmNetwork([2, 4, 1]);
  const result = await network.predict([0.5, 0.7]);
} catch (error) {
  console.error('Neural network error:', error);
}
```

## 🧪 Testing

```bash
# Test the WASM integration
npm run test:neural-wasm

# Or run the test directly:
npx tsx ../test-wasm-integration.ts
```

The test creates a simple XOR network to verify:
- ✅ Network creation and initialization
- ✅ Training with FANN algorithms
- ✅ Prediction accuracy
- ✅ Memory management
- ✅ Error handling

## 🔗 Integration with claude-code-zen

### Neural Bridge Integration

The WASM API is consumed by `../neural-bridge.ts`:

```typescript
import { NeuralBridge } from './neural-bridge';

// Initialize with WASM support
const bridge = NeuralBridge.getInstance({
  wasmPath: './wasm/claude_zen_neural',
  enableTraining: true
});

await bridge.initialize();

// Create and train networks
const networkId = await bridge.createNetwork('my-net', 'feedforward', [784, 128, 10]);
await bridge.trainNetwork(networkId, trainingData, 1000);
```

### DSPy Coordination Integration

The neural system integrates with DSPy coordination:

```typescript
// coordination/swarm/core/claude-integration/core.ts
const coordinationSuccessRate = await neuralBridge.predict(
  'coordination-model', 
  [agentPerformance, taskComplexity, resourceAvailability]
);

// Feedback loop: retrain based on actual coordination success
if (actualSuccess !== predictedSuccess) {
  await neuralBridge.trainNetwork(
    'coordination-model',
    { inputs: [[...inputs]], outputs: [[actualSuccess]] },
    100
  );
}
```

## 🎛️ Configuration

### Cargo.toml Features

```toml
[features]
default = ["console_error_panic_hook"]
cascade = ["claude-zen-neural/cascade"]  # Enable cascade training
```

### Build Optimization

The build is optimized for:
- **Size**: `opt-level = "s"` for smaller WASM files
- **Performance**: LTO and single codegen unit
- **Debugging**: Source maps in development builds

## 📊 Performance

### Memory Usage
- **Minimal overhead**: Direct Float32Array access
- **Zero-copy transfers**: Arrays passed by reference
- **Automatic cleanup**: Rust Drop trait handles deallocation

### Computational Performance
- **Native speed**: Compiled Rust performance
- **SIMD optimization**: Modern CPU instructions
- **Parallel training**: Multi-threaded where possible

## 🔍 Debugging

### Console Output
```typescript
// Enable detailed logging
wasm_logger::init(wasm_logger::Config::default());
```

### Browser DevTools
- WASM appears as "claude_zen_neural_bg.wasm" in Network tab
- Memory usage visible in Performance tab
- Console errors show Rust panic information

## 🚀 Next Steps

1. **Build the WASM module**: `./build.sh`
2. **Run integration tests**: `npm run test:neural-wasm`
3. **Connect to DSPy coordination**: See `../coordination/`
4. **Scale with more neural models**: Add to `../models/`

## 🤝 Contributing

When modifying the WASM API:

1. **Keep the interface stable**: TypeScript depends on these exports
2. **Add comprehensive tests**: Both Rust and integration tests
3. **Update documentation**: Especially if API changes
4. **Profile performance**: Use `wasm-pack build --profiling`

## 📚 Resources

- [wasm-bindgen Book](https://rustwasm.github.io/wasm-bindgen/)
- [FANN Library Documentation](http://leenissen.dk/fann/wp/)
- [WebAssembly Reference](https://webassembly.org/)
- [claude-code-zen Neural Architecture](../README.md)