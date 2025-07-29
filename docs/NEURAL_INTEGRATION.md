# Neural Network Integration Guide

This guide explains how neural networks are integrated into the Claude Code Flow system and how to use them effectively.

## Overview

The neural network integration provides AI-powered decision making and code generation capabilities through the ruv-FANN (Fast Artificial Neural Network) framework. The system supports both native Rust bindings and WASM fallbacks, with intelligent caching and performance optimization.

## Architecture

### Core Components

1. **NeuralEngine** (`/src/neural/neural-engine.js`)
   - Main interface for neural network operations
   - Handles model loading, inference, and caching
   - Provides fallback mechanisms for reliability

2. **Bindings** (`/src/neural/bindings.js`)
   - Loads native or WASM neural network bindings
   - Falls back to stub implementation if needed
   - Supports multiple binding sources

3. **Real FANN Integration** (`/src/neural/real-fann-integration.js`)
   - Actual neural network implementation
   - Preprocessing and postprocessing logic
   - Model-specific inference handling

4. **Native FANN Bindings** (`/src/neural/native-fann-bindings.js`)
   - Direct integration with Rust ruv-FANN binary
   - High-performance native execution
   - GPU and SIMD support detection

## Usage Examples

### Basic Neural Inference

```javascript
import { NeuralEngine } from './src/neural/neural-engine.js';

const engine = new NeuralEngine();
await engine.initialize();

// Simple inference
const result = await engine.infer('Create a function to sort an array', {
    temperature: 0.7,
    model: 'code-completion-base'
});

console.log(result.text); // Generated code
console.log(result.confidence); // Confidence score
```

### Integration with Queens

Queens (specialized AI agents) can use neural networks for enhanced decision-making:

```javascript
import { CodeQueen } from './src/queens/code-queen.js';

const codeQueen = new CodeQueen();

// Process a task - neural networks are used automatically for complex tasks
const result = await codeQueen.process({
    id: 'task-1',
    type: 'code-generation',
    prompt: 'Create a machine learning pipeline for image classification'
});
```

### Architecture Analysis with Neural Networks

The ArchitectAdvisor Queen uses neural networks to provide intelligent architectural recommendations:

```javascript
import { ArchitectAdvisor } from './src/queens/architect-advisor.js';

const architect = new ArchitectAdvisor();

const result = await architect.process({
    id: 'arch-1',
    type: 'architecture-analysis',
    prompt: 'Design architecture for a real-time chat application with 1M users'
});

// Result includes neural-enhanced recommendations
console.log(result.recommendation.architecture); // e.g., 'microservices'
console.log(result.metadata.neuralContribution); // Neural network contribution
```

## Available Models

The system includes several pre-configured neural models:

- **code-completion-base**: General code generation
- **bug-detection**: Identifies potential bugs and issues
- **refactoring-suggest**: Suggests code improvements
- **test-generation**: Generates test cases
- **architecture-advisor**: Architectural pattern matching

## Performance Optimization

### Caching

The neural engine includes intelligent caching:

```javascript
// First call - runs inference
const result1 = await engine.infer('Sort array function');

// Second call - uses cache (much faster)
const result2 = await engine.infer('Sort array function');
console.log(result2.fromCache); // true
```

### Batch Processing

For multiple inferences, use batch processing:

```javascript
const prompts = [
    'Create a REST API endpoint',
    'Write a database query function',
    'Generate error handling code'
];

const results = await engine.batchInference(prompts, {
    temperature: 0.8
});
```

## Fallback Mechanisms

The system includes multiple fallback layers:

1. **Native Bindings** (fastest)
   - Requires compiled ruv-FANN binary
   - Full GPU and SIMD support

2. **WASM Bindings** (portable)
   - Works in any JavaScript environment
   - Good performance, no compilation needed

3. **Stub Implementation** (development)
   - Always available
   - Simulates neural behavior for testing

## Advanced Features

### Custom Model Loading

```javascript
// Load a custom neural model
await engine.loadModel('/path/to/custom-model.fann');

// Use the custom model
const result = await engine.infer('Your prompt', {
    model: 'custom-model'
});
```

### GPU Acceleration

```javascript
// Check GPU availability
const stats = engine.getStats();
if (stats.gpuEnabled) {
    console.log('GPU acceleration is active');
}
```

### Memory Management

```javascript
// Get memory usage
const memory = await engine.getMemoryUsage();
console.log(`Total allocated: ${memory.totalAllocated}`);

// Free unused memory
await engine.freeMemory();
```

## Building Native Bindings

To enable native neural network support:

```bash
# Build ruv-FANN
cd ruv-FANN
cargo build --release

# The neural engine will automatically detect and use the binary
```

## Testing Neural Integration

Run the test scripts to verify neural integration:

```bash
# Basic neural engine test
node test-neural-integration.js

# Architecture advisor demo
node examples/neural-architecture-advisor.js
```

## Best Practices

1. **Use appropriate models**: Select models based on task type
2. **Manage temperature**: Lower values (0.3-0.5) for deterministic tasks, higher (0.7-0.9) for creative tasks
3. **Cache strategically**: Reuse results for similar prompts
4. **Monitor performance**: Check processing times and cache hit rates
5. **Fallback gracefully**: Always handle cases where neural networks are unavailable

## Troubleshooting

### Neural bindings not loading
- Check if ruv-FANN is built: `cd ruv-FANN && cargo build --release`
- Verify binary exists: `ls ruv-FANN/target/release/ruv-fann`
- Check logs for specific errors

### Poor performance
- Enable caching if not already active
- Use batch inference for multiple prompts
- Check if GPU acceleration is available
- Monitor memory usage and free if needed

### Inconsistent results
- Adjust temperature parameter
- Use more specific prompts
- Check model suitability for task type

## Future Enhancements

- Additional specialized models
- Online learning capabilities
- Distributed inference
- Model fine-tuning APIs
- WebGPU support for browser environments