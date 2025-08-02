---
applies_to: "src/neural/**/*"
---

# Neural Network System Development Instructions

## Domain Focus
The neural domain handles neural networks, WASM integration, AI computations, pattern recognition, and high-performance machine learning operations. This is claude-code-zen's computational intelligence core.

## Key Subdirectories
```
src/neural/
├── core/              # Neural network core functionality
├── agents/            # Neural-specific agent implementations
├── models/            # Neural network models and presets
├── wasm/             # WASM bindings and Rust integration
│   └── fact-core/    # Rust-based WASM computational core
└── coordination/     # Neural coordination protocols
```

## Architecture Patterns

### Neural Network Operations
- **Use WASM for heavy computation** - always prefer Rust/WASM over JavaScript
- **Leverage existing models** in `src/neural/models/` before creating new ones
- **Follow established training patterns** for consistency
- **Use proper precision handling** for mathematical operations

### WASM Integration
- **Rust core in fact-core/** for performance-critical operations
- **JavaScript bindings** for seamless integration
- **Memory management** between JS and WASM boundaries
- **Error handling** across language boundaries

## Testing Strategy - Classical TDD (Detroit)
Use Classical TDD for neural code - test actual computational results:

```typescript
// Example: Test actual neural network behavior
describe('NeuralNetwork', () => {
  it('should converge on XOR problem', () => {
    const network = new NeuralNetwork([2, 4, 1]);
    const xorData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ];
    
    const result = network.train(xorData, { epochs: 1000 });
    
    // Test actual results, not mocks
    expect(network.predict([0, 0])[0]).toBeCloseTo(0, 1);
    expect(network.predict([1, 1])[0]).toBeCloseTo(0, 1);
    expect(result.finalError).toBeLessThan(0.01);
  });
});
```

## Performance Requirements

### Computational Performance
- **Use WASM for all heavy computation** - avoid pure JavaScript for math
- **Benchmark against performance targets** - maintain computational efficiency
- **Memory optimization** - efficient handling of large datasets
- **Parallel processing** where possible for training operations

### Accuracy Standards
- **Mathematical precision** - use appropriate precision for calculations
- **Numerical stability** - handle edge cases in neural computations
- **Convergence validation** - ensure training algorithms converge properly
- **Result reproducibility** - deterministic behavior where required

## WASM Development Patterns

### Rust Core (fact-core/)
```rust
// Example WASM function signature
#[wasm_bindgen]
pub fn neural_forward_pass(weights: &[f64], inputs: &[f64]) -> Vec<f64> {
    // High-performance computation in Rust
    // Return results to JavaScript
}
```

### JavaScript Integration
```typescript
// Import and use WASM functions
import { neural_forward_pass } from '../wasm/fact-core/pkg';

export class PerformantNeuralNetwork {
  forwardPass(inputs: number[]): number[] {
    // Use WASM for computation
    return neural_forward_pass(this.weights, inputs);
  }
}
```

## Common Neural Patterns

### Network Architecture
```typescript
// Use established network patterns
const network = new NeuralNetwork({
  layers: [inputSize, hiddenSize, outputSize],
  activation: 'relu',
  optimizer: 'adam',
  learningRate: 0.001
});
```

### Training Workflows
```typescript
// Follow established training patterns
const trainer = new NeuralTrainer(network);
const results = await trainer.train({
  data: trainingData,
  epochs: 1000,
  batchSize: 32,
  validationSplit: 0.2
});
```

### WASM Memory Management
```typescript
// Proper memory handling with WASM
class WasmNeuralCompute {
  private wasmMemory: WebAssembly.Memory;
  
  compute(data: Float64Array): Float64Array {
    const inputPtr = this.allocateWasmMemory(data.length);
    const outputPtr = this.wasmModule.neural_compute(inputPtr, data.length);
    const result = this.extractWasmResult(outputPtr);
    this.freeWasmMemory(inputPtr, outputPtr);
    return result;
  }
}
```

## Integration Points

### With Coordination Domain
- **Neural agent coordination** for distributed training
- **Load balancing** for computational tasks
- **Consensus protocols** for distributed neural decisions

### With Memory Domain
- **Neural state persistence** for model checkpoints
- **Pattern storage** for learned behaviors
- **Distributed memory** for large model parameters

## Quality Standards

### Mathematical Accuracy
- **Validate all algorithms** with known test cases
- **Use appropriate precision** for floating-point operations
- **Handle numerical edge cases** properly
- **Benchmark against reference implementations**

### Performance Standards
- **Profile all operations** - identify bottlenecks
- **Use WASM for >10ms operations** - prefer compiled code
- **Memory efficiency** - minimize allocations in hot paths
- **Parallel processing** - utilize available CPU cores

### Code Quality
- **Type safety** - comprehensive TypeScript typing
- **Error handling** - graceful degradation for neural failures
- **Logging** - detailed performance and accuracy metrics
- **Documentation** - explain mathematical concepts and algorithms

## WASM Build and Development

### Setup Requirements
```bash
# Rust toolchain for WASM
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# Build WASM module
cd src/neural/wasm/fact-core
wasm-pack build --target nodejs
```

### Testing WASM Integration
```typescript
// Test WASM bindings
describe('WASM Neural Functions', () => {
  it('should compute matrix multiplication correctly', () => {
    const result = wasmMatrixMultiply(matrixA, matrixB);
    expectArrayNearlyEqual(result, expectedResult, 1e-10);
  });
});
```

## Common Anti-Patterns to Avoid
- **Don't use JavaScript for heavy math** - always prefer WASM
- **Don't ignore numerical precision** - handle floating-point correctly
- **Don't skip performance testing** - benchmark all neural operations
- **Don't hardcode network architectures** - use configurable patterns
- **Don't bypass WASM for computation** - leverage the performance advantage

## Monitoring and Debugging
- **Neural network convergence** - track training progress
- **WASM performance metrics** - monitor computational efficiency
- **Memory usage patterns** - track WASM memory allocation
- **Accuracy validation** - continuous testing against benchmarks

The neural domain requires both mathematical rigor and performance optimization. Always prioritize computational accuracy and efficiency through proper WASM utilization.