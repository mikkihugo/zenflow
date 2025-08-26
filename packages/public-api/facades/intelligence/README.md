# @claude-zen/intelligence

**Strategic Intelligence Interface Delegation Package**

Provides unified access to all AI/Neural/ML systems through runtime delegation patterns. Part of the Strategic Architecture v2.0.0 four-layer delegation system.

## Overview

The Intelligence package consolidates access to all AI, Neural, and ML systems in the Claude Code Zen ecosystem through a strategic interface delegation pattern. Instead of importing multiple AI packages directly, applications can use this single package to access all intelligence functionality.

## Architecture

**Strategic Layer: Intelligence (AI/Neural/ML)**

- Position: Layer 2 of 4 in the strategic architecture
- Role: Unified AI/Neural/ML system coordination
- Pattern: Runtime delegation with lazy loading

## Delegated Systems

### 🧠 Brain System (`@claude-zen/brain`)

Neural coordination, brain functionality, and AI processing:

- `BrainCoordinator` - Main neural coordination
- `SmartNeuralCoordinator` - Advanced neural coordination
- `NeuralOrchestrator` - Neural process orchestration
- `TaskComplexityEstimator` - Task complexity analysis

### 🛡️ AI Safety System (`@claude-zen/ai-safety`)

AI safety protocols, deception detection, and safety monitoring:

- `SafetyOrchestrator` - Main safety coordination
- `AIDeceptionDetector` - AI deception detection
- `NeuralDeceptionDetector` - Neural-based detection
- `LogBasedDeceptionDetector` - Log analysis detection

### 🔬 Neural ML System (`@claude-zen/neural-ml`)

ML integration, adaptive learning, and neural forecasting:

- `MLInterfaces` - ML interface abstraction
- `AdaptiveLearningEngine` - Adaptive learning algorithms
- `NeuralForecaster` - Neural forecasting models
- `RustBinding` - High-performance Rust integration

### 🎯 DSPy System (`@claude-zen/dspy`)

DSPy Stanford framework, optimization, and teleprompters:

- `DSPyFramework` - Main DSPy framework
- `OptimizationEngine` - Optimization algorithms
- `Teleprompter` - DSPy teleprompter functionality
- `BootstrapML` - Bootstrap ML optimization

### 📚 Fact System (`@claude-zen/fact-system`)

Fact-based reasoning and knowledge management:

- `FactEngine` - Fact processing engine
- `ReasoningEngine` - Logic reasoning system
- `KnowledgeManager` - Knowledge graph management
- `WasmFactTools` - High-performance WASM tools

## Usage

### Basic Usage

```typescript
import { intelligenceSystem } from '@claude-zen/intelligence';

// Access brain system
const brain = await intelligenceSystem.brain();
const coordinator = await brain.getBrainCoordinator({
  autonomous: { enabled: true, learningRate: 0.1 },
});

// Access safety system
const safety = await intelligenceSystem.safety();
const detector = await safety.getDeceptionDetector({
  detectionSensitivity: 'high',
});

// Access neural ML system
const neuralML = await intelligenceSystem.neuralML();
const learner = await neuralML.getAdaptiveLearningEngine({
  learningRate: 0.05,
  optimization: 'accuracy',
});
```

### Unified Intelligence System

```typescript
import { IntelligenceSystem } from '@claude-zen/intelligence';

const intelligence = new IntelligenceSystem({
  brain: {
    autonomous: { enabled: true, learningRate: 0.1 },
    enableGPU: true,
    neuralNetworkType: 'transformer',
  },
  safety: {
    enableDeceptionDetection: true,
    detectionSensitivity: 'high',
    safetyThreshold: 0.95,
  },
  neuralML: {
    enableAdaptiveLearning: true,
    enableForecasting: true,
    optimization: 'balanced',
  },
  dspy: {
    enableOptimization: true,
    optimizationStrategy: 'bootstrap-finetune',
    maxIterations: 100,
  },
  factSystem: {
    enableReasoning: true,
    enableWasmTools: true,
    reasoningDepth: 5,
  },
});

await intelligence.initialize();

// Get system status
const status = await intelligence.getStatus();
console.log('Intelligence systems:', status);

// Get performance metrics
const metrics = await intelligence.getMetrics();
console.log('Performance metrics:', metrics);
```

### Individual System Access

```typescript
import {
  getBrainCoordinator,
  getSafetyOrchestrator,
  getAdaptiveLearningEngine,
  getDSPyFramework,
  getFactEngine,
} from '@claude-zen/intelligence';

// Direct access to specific systems
const brain = await getBrainCoordinator({ enableGPU: true });
const safety = await getSafetyOrchestrator({
  detectionSensitivity: 'critical',
});
const ml = await getAdaptiveLearningEngine({ learningRate: 0.02 });
const dspy = await getDSPyFramework({ optimizationStrategy: 'copro' });
const facts = await getFactEngine({ enableReasoning: true });
```

## Configuration

### IntelligenceSystemConfig

```typescript
interface IntelligenceSystemConfig {
  brain?: {
    autonomous?: {
      enabled?: boolean;
      learningRate?: number;
      adaptationThreshold?: number;
    };
    enableMetrics?: boolean;
    enableGPU?: boolean;
    neuralNetworkType?: 'feedforward' | 'recurrent' | 'transformer';
    maxConcurrentTasks?: number;
  };

  safety?: {
    enableDeceptionDetection?: boolean;
    enableNeuralSafety?: boolean;
    enableLogAnalysis?: boolean;
    safetyThreshold?: number;
    detectionSensitivity?: 'low' | 'medium' | 'high' | 'critical';
  };

  neuralML?: {
    enableAdaptiveLearning?: boolean;
    enableForecasting?: boolean;
    enableRustBinding?: boolean;
    learningRate?: number;
    forecastHorizon?: number;
    modelType?: 'neural' | 'statistical' | 'hybrid';
    optimization?: 'speed' | 'accuracy' | 'balanced';
  };

  dspy?: {
    enableOptimization?: boolean;
    enableTeleprompting?: boolean;
    optimizationStrategy?:
      | 'bootstrap'
      | 'copro'
      | 'mipro'
      | 'bootstrap-finetune';
    maxIterations?: number;
    learningRate?: number;
    validationSplit?: number;
  };

  factSystem?: {
    enableReasoning?: boolean;
    enableWasmTools?: boolean;
    enableKnowledgeGraph?: boolean;
    reasoningDepth?: number;
    confidenceThreshold?: number;
    maxFacts?: number;
  };
}
```

## Runtime Delegation

The Intelligence package uses runtime delegation to prevent circular dependencies and enable lazy loading:

- **Lazy Loading**: Systems are only loaded when first accessed
- **Runtime Imports**: Dynamic imports prevent build-time circular dependencies
- **Error Handling**: Graceful handling when optional systems are unavailable
- **Singleton Pattern**: Global access with consistent instances

## Performance

- **Lazy Loading**: Only load systems that are actually used
- **Runtime Delegation**: Avoid circular dependency build issues
- **Professional Caching**: Singleton pattern for efficient resource usage
- **Strategic Access**: Unified interface reduces complexity

## Dependencies

### Core Dependencies

- `@claude-zen/foundation` - Core utilities and logging

### Peer Dependencies (Optional)

- `@claude-zen/brain` - Neural coordination (required)
- `@claude-zen/ai-safety` - Safety protocols (optional)
- `@claude-zen/neural-ml` - ML integration (optional)
- `@claude-zen/dspy` - DSPy framework (optional)
- `@claude-zen/fact-system` - Fact-based reasoning (optional)

## Integration

Part of the Strategic Architecture v2.0.0:

1. **Foundation** (`@claude-zen/foundation`) - Infrastructure
2. **Intelligence** (`@claude-zen/intelligence`) - AI/Neural/ML ← **This Package**
3. **Enterprise** (`@claude-zen/enterprise`) - Business Processes
4. **Operations** (`@claude-zen/operations`) - Monitoring/Performance

## Examples

See the `examples/` directory for complete usage examples including:

- Basic intelligence system setup
- Advanced neural coordination
- Safety monitoring integration
- ML model training workflows
- DSPy optimization patterns
- Fact-based reasoning systems

## License

MIT - See LICENSE file for details

## Contributing

See CONTRIBUTING.md for development guidelines and architectural patterns.
