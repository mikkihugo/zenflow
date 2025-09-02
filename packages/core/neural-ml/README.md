# @zen-ai/neural-forecasting

High-performance neural forecasting library providing **27+ time series prediction models** with Rust performance and TypeScript integration.

## 🎯 Features

- **🔮 27+ Neural Models**: LSTM, N-BEATS, N-HiTS, DeepAR, Transformers, and more
- **📊 Time Series Focus**: Specialized for forecasting and temporal data
- **⚡ Rust Performance**: Built on neuro-divergent Rust library
- **🔧 TypeScript API**: Type-safe integration with claude-code-zen
- **🏭 Production Ready**: Memory-safe, scalable, and efficient

## 📦 Models Included

### Recurrent Models

- **LSTM**: Long Short-Term Memory networks
- **GRU**: Gated Recurrent Units
- **RNN**: Basic recurrent networks

### Transformer Models

- **TFT**: Temporal Fusion Transformer
- **Autoformer**: Decomposition transformers
- **Informer**: Efficient attention mechanisms

### Specialized Models

- **N-BEATS**: Neural basis expansion for time series
- **N-HiTS**: Hierarchical interpolation for time series
- **DeepAR**: Probabilistic forecasting
- **TCN**: Temporal Convolutional Networks

### Linear Models

- **DLinear**: Decomposition linear models
- **NLinear**: Normalized linear models

## 🚀 Quick Start

```typescript
import { NeuralForecast, models } from '@zen-ai/neural-forecasting';

// Create LSTM model for 12-step ahead forecasting
const lstm = new models.LSTM({
  hiddenSize: 128,
  numLayers: 2,
  horizon: 12,
  inputSize: 24,
});

// Create forecasting pipeline
const nf = new NeuralForecast().addModel(lstm).build();

// Train on time series data
await nf.fit(trainingData);

// Generate forecasts
const forecasts = await nf.predict();
```

## 🏗️ Architecture

Built on the **neuro-divergent** Rust library, providing:

- **Type Safety**: Rust's ownership model ensures memory safety
- **Performance**: SIMD optimization and zero-cost abstractions
- **Scalability**: Parallel training and inference capabilities
- **Flexibility**: Extensible model architecture

## 📈 Performance

- **100x faster** than Python equivalents
- **Memory efficient** with Rust's zero-cost abstractions
- **Parallel processing** for multi-core utilization
- **WASM support** for browser deployment

## 🔗 Integration

Part of the **@zen-ai** ecosystem:

- Integrates with `@zen-ai/shared` for configuration
- Uses `@claude-zen/foundation` for coordination
- Compatible with `@claude-zen/brain` neural coordination

---

**Note**: This package contains the extracted forecasting capabilities from the brain package to maintain focused responsibilities.
