# DSPy Library - Distributed System Programming

**Pure TypeScript implementation of DSPy methodology for AI prompt optimization and neural coordination.**

## Overview

This library provides a complete DSPy (Distributed System Programming) implementation with:

- **Prompt Optimization**: Systematic refinement using feedback loops
- **Few-Shot Learning**: Automatic example selection and optimization  
- **Neural Pipeline Integration**: Distributed coordination across agent swarms
- **Zero Dependencies**: Pure TypeScript, no external npm packages
- **Performance Tracking**: Multi-metric evaluation (accuracy, latency, cost)

## Quick Start

```typescript
import { DSPyEngine } from '@zen-ai/claude-code-zen/lib/dspy';

// Initialize engine
const engine = new DSPyEngine({
  optimization: {
    maxIterations: 10,
    convergenceThreshold: 0.95
  },
  swarmCoordination: {
    enabled: true,
    agentPoolSize: 4
  }
});

// Optimize prompts
const result = await engine.optimizePrompt(
  'Analyze code quality and provide recommendations',
  examples
);

console.log(`Optimized prompt: ${result.optimizedPrompt}`);
console.log(`Performance: ${result.metrics.accuracy}%`);
```

## Core Features

### Prompt Optimization
- Iterative refinement with feedback loops
- Multi-metric optimization (accuracy, speed, cost)
- Version control and rollback capabilities

### Few-Shot Learning
- Automatic example selection
- Cross-domain pattern transfer
- Real-time adaptation

### Swarm Coordination
- Distributed optimization across agent swarms
- Load balancing and failover
- Neural pattern recognition

## Architecture

The DSPy engine integrates with claude-code-zen's 3-layer architecture:
- **SQLite**: Persistent optimization history
- **LanceDB**: Vector similarity for example selection  
- **Kuzu**: Graph relationships for pattern analysis

## Usage Examples

### Basic Optimization
```typescript
const optimizedPrompt = await engine.optimizePrompt(
  'Generate unit tests for JavaScript functions',
  trainingExamples
);
```

### Advanced Configuration
```typescript
const engine = new DSPyEngine({
  optimization: {
    algorithm: 'gradient-descent',
    learningRate: 0.01,
    batchSize: 32
  },
  evaluation: {
    metrics: ['accuracy', 'latency', 'token_efficiency'],
    validationSplit: 0.2
  }
});
```

### Integration with Swarms
```typescript
// Use with existing swarm coordination
const swarmOptimizedResult = await engine.optimizeWithSwarm({
  taskType: 'code-analysis',
  swarmTopology: 'hierarchical',
  agents: swarmCommander.getActiveAgents()
});
```

## API Reference

### DSPyEngine

Main engine class for prompt optimization and coordination.

#### Constructor Options
- `optimization`: Optimization algorithm configuration
- `swarmCoordination`: Swarm integration settings
- `evaluation`: Performance evaluation metrics
- `storage`: Database backend configuration

#### Methods
- `optimizePrompt(task, examples)`: Optimize prompts for given task
- `evaluatePerformance(prompt, testSet)`: Evaluate prompt performance
- `getOptimizationHistory()`: Retrieve optimization history
- `exportModel()`: Export trained model for reuse

## Integration Notes

This library is designed as a **reusable component** that can be:
- Extracted as standalone npm package
- Used in other TypeScript projects
- Integrated with different AI frameworks
- Extended with custom optimization algorithms

## License

MIT - See LICENSE file for details.