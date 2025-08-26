# DSPy TypeScript Library - Stanford DSPy Complete Port

A complete TypeScript implementation of Stanford's DSPy (Declarative Self-improving Language Programs) framework, integrated with @zen-ai/shared infrastructure for production use.

## 🚀 Overview

This library provides a full production-ready port of Stanford DSPy's sophisticated prompt optimization algorithms, including:

- **LabeledFewShot**: Simple k-shot example selection
- **BootstrapFewShot**: Advanced teacher/student bootstrapping with validation
- **MIPROv2**: Multi-objective instruction proposal with Bayesian optimization
- **Ensemble**: Multi-model combination and optimization strategies

## 📦 Features

### Core Stanford DSPy Algorithms

- ✅ **Complete Teleprompter Architecture** - Abstract base class with full Stanford compatibility
- ✅ **LabeledFewShot** - Random k-shot example selection with seeded reproducibility
- ✅ **BootstrapFewShot** - Sophisticated bootstrapping with teacher models and validation metrics
- ✅ **MIPROv2** - Most advanced Stanford algorithm with instruction proposal and Bayesian optimization
- ✅ **Ensemble** - Multi-teleprompter combination with custom reduction functions

### Production Features

- ✅ **@zen-ai/shared Integration** - LLM, logging, storage, and configuration services
- ✅ **Standalone Operation** - Graceful fallback when shared services unavailable
- ✅ **TypeScript Strict Mode** - Full type safety with ES2022 compilation target
- ✅ **Performance Tracking** - Built-in metrics, logging, and optimization statistics
- ✅ **Seeded Reproducibility** - Deterministic results for consistent testing

### Advanced Capabilities

- ✅ **Program Builder** - Fluent API for creating DSPy programs
- ✅ **Signature System** - Input/output field specifications with type validation
- ✅ **Trace System** - Execution path capture for debugging and analysis
- ✅ **Metric Framework** - Custom evaluation metrics with threshold support
- ✅ **Minibatch Optimization** - Efficient evaluation for large datasets

## 🛠️ Installation

```bash
# Already included in claude-code-zen
# Optional: Install @zen-ai/shared for enhanced features
npm install @zen-ai/shared
```

## 📖 Quick Start

### Basic Usage

```typescript
import {
  LabeledFewShot,
  BootstrapFewShot,
  MIPROv2,
  createProgram,
  createSignature,
  createExamples,
} from '../lib/dspy';

// Create training data
const trainset = createExamples([
  {
    input: { question: 'What is the capital of France?' },
    output: { answer: 'Paris', reasoning: 'Paris is the capital of France.' },
  },
  // ... more examples
]);

// Define task signature
const qaSignature = createSignature(
  'Question Answering',
  { question: 'The question to answer' },
  { answer: 'Direct answer', reasoning: 'Explanation' },
  'Answer questions accurately with clear reasoning.'
);

// Create DSPy program
const program = createProgram().addPredictor('qa', qaSignature).build();

// Optimize with Stanford algorithms
const teleprompter = new MIPROv2({
  auto: 'light',
  metric: (example, prediction, trace) => {
    return prediction.answer && prediction.reasoning ? 1 : 0;
  },
});

const optimized = await teleprompter.compile({
  student: program,
  trainset,
});

// Use optimized program
const result = await optimized.forward({
  question: 'What is TypeScript?',
});

console.log(result.answer); // Optimized answer
console.log(result.reasoning); // Optimized reasoning
```

### Advanced MIPROv2 Usage

```typescript
const mipro = new MIPROv2({
  metric: customMetric,
  auto: 'heavy', // light, medium, heavy
  max_bootstrapped_demos: 4,
  max_labeled_demos: 4,
  verbose: true,
  track_stats: true,
});

const optimized = await mipro.compile({
  student: program,
  trainset,
  valset,
  teacher: teacherProgram,
  minibatch: true,
  minibatch_size: 50,
  program_aware_proposer: true, // Use program structure
  data_aware_proposer: true, // Use training data insights
  tip_aware_proposer: true, // Include prompting tips
  fewshot_aware_proposer: true, // Consider few-shot context
});

// Access optimization statistics
console.log(optimized.score); // Final optimization score
console.log(optimized.total_calls); // LLM calls made
console.log(optimized.trial_logs); // Detailed optimization logs
```

### Ensemble Optimization

```typescript
const ensemble = new Ensemble({
  reduce_fn: (predictions) => {
    // Custom prediction combination logic
    const answers = predictions.map((p) => p.answer);
    const mostCommon = getMostFrequent(answers);
    return {
      answer: mostCommon,
      confidence: getConfidence(predictions),
    };
  },
});

const optimized = await ensemble.compile({
  student: program,
  trainset,
});
```

## 🏗️ Architecture

### Teleprompter Hierarchy

```
Teleprompter (Abstract Base)
├── LabeledFewShot (Simple k-shot)
├── BootstrapFewShot (Teacher/student bootstrapping)
├── MIPROv2 (Advanced multi-objective optimization)
└── Ensemble (Multi-model combination)
```

### Program Structure

```
Module (DSPy Program)
├── Predictors[] (Individual prediction units)
│   ├── Signature (Input/output specification)
│   ├── Demos[] (Few-shot examples)
│   └── Config (Model parameters)
└── forward() (Execution method)
```

### Optimization Workflow

1. **Signature Definition** - Define inputs, outputs, and instructions
2. **Program Creation** - Build predictors with signatures
3. **Training Data** - Provide examples for optimization
4. **Teleprompter Selection** - Choose optimization algorithm
5. **Compilation** - Run optimization process
6. **Deployment** - Use optimized program in production

## 🔧 Configuration

### @zen-ai/shared Integration

```typescript
import { initializeDSPyService } from '../lib/dspy';

// Initialize with shared services
await initializeDSPyService();

// DSPy will automatically use:
// - SharedLLMService for model calls
// - SharedLogger for structured logging
// - SharedStorage for KV persistence
// - SharedConfig for centralized configuration
```

### Standalone Mode

```typescript
// DSPy works standalone with fallback implementations
// No additional configuration required
```

## 📊 Performance & Metrics

### Optimization Metrics

- **Score Tracking** - Optimization score progression
- **LLM Call Counting** - Cost and usage monitoring
- **Minibatch Efficiency** - Evaluation optimization
- **Success Rate** - Task completion metrics

### Monitoring

```typescript
// Enable detailed tracking
const teleprompter = new MIPROv2({
  track_stats: true,
  verbose: true,
  log_dir: './optimization_logs',
});

// Access metrics after optimization
const metrics = {
  score: optimized.score,
  totalCalls: optimized.total_calls,
  promptModelCalls: optimized.prompt_model_total_calls,
  candidatePrograms: optimized.candidate_programs,
  trialLogs: optimized.trial_logs,
};
```

## 🧪 Testing

Run the comprehensive example:

```bash
npx ts-node src/examples/dspy-stanford-example.ts
```

### Custom Metrics

```typescript
const customMetric = (example, prediction, trace) => {
  // Exact match scoring
  if (prediction.answer === example.expected_answer) {
    return 1.0;
  }

  // Partial credit for semantic similarity
  const similarity = calculateSimilarity(
    prediction.answer,
    example.expected_answer
  );
  return similarity > 0.8 ? 0.5 : 0;
};

const teleprompter = new BootstrapFewShot({
  metric: customMetric,
  metric_threshold: 0.8,
});
```

## 🚀 Production Deployment

### Best Practices

1. **Use MIPROv2** for sophisticated optimization
2. **Set appropriate auto mode** (light/medium/heavy)
3. **Enable @zen-ai/shared** for production features
4. **Monitor LLM usage** for cost control
5. **Cache optimized programs** for reuse
6. **Validate metrics** against business objectives

### Scaling Considerations

- **Minibatch evaluation** for large datasets
- **Parallel optimization** with multiple workers
- **Progressive optimization** with staged rollouts
- **A/B testing** with multiple teleprompters

## 📚 Comparison with Stanford DSPy

| Feature              | Stanford DSPy (Python) | This Implementation           |
| -------------------- | ---------------------- | ----------------------------- |
| LabeledFewShot       | ✅                     | ✅ Full compatibility         |
| BootstrapFewShot     | ✅                     | ✅ Complete algorithm         |
| MIPROv2              | ✅                     | ✅ All features ported        |
| Ensemble             | ✅                     | ✅ Custom reduction functions |
| Type Safety          | ❌                     | ✅ Full TypeScript            |
| @zen-ai Integration  | ❌                     | ✅ Production ready           |
| Standalone Operation | ❌                     | ✅ Graceful fallbacks         |

## 🤝 Contributing

This is part of the claude-code-zen project. The DSPy implementation is feature-complete and production-ready.

## 📄 License

MIT License - see claude-code-zen project license.

## 🙏 Acknowledgments

- Stanford NLP Group for the original DSPy framework
- @zen-ai/shared for infrastructure integration
- Claude Code Zen team for TypeScript implementation

---

**Built with ❤️ for the TypeScript community**

_"Bringing Stanford's sophisticated prompt optimization to TypeScript with production-grade reliability."_
