# Integration Tests for Cross-Crate Workflows

## Overview

This directory contains comprehensive integration tests that validate the interaction between different neuro-divergent crates, ensuring the entire system works cohesively.

## Test Structure

```
tests/integration/
├── mock_implementations.rs    # Mock implementations for testing
├── model_registry.rs         # Model Registry Integration Tests
├── cross_crate_communication.rs # Cross-crate communication tests
├── error_propagation.rs      # Error handling tests
├── performance_integration.rs # Performance tests
├── cli_integration.rs        # CLI integration tests
├── real_world_scenarios.rs   # Real-world scenario tests
└── mod.rs                    # Module organization
```

## Test Categories

### 1. Model Registry Integration (`model_registry.rs`)

Tests for dynamic model discovery, plugin loading, and model serialization/deserialization:

- **Dynamic Model Discovery**: Tests the registry's ability to discover and list available models
- **Plugin Loading**: Tests loading external model plugins from directories
- **Model Serialization/Deserialization**: Tests saving and loading models with metadata
- **Model Factory Integration**: Tests integration between ModelFactory and ModelRegistry
- **Model Versioning**: Tests version compatibility and migration

### 2. Cross-Crate Communication (`cross_crate_communication.rs`)

Tests for Registry ↔ Models interaction, Core ↔ Models data flow, and CLI ↔ All crates:

- **Registry ↔ Models Interaction**: Tests model creation, registration, and retrieval
- **Core ↔ Models Data Flow**: Tests data format conversion between crates
- **End-to-End Workflow Integration**: Tests complete workflows across all crates
- **Concurrent Crate Operations**: Tests thread-safe operations across crates
- **Data Type Compatibility**: Tests type system compatibility

### 3. Error Propagation (`error_propagation.rs`)

Tests for error handling across crate boundaries, graceful degradation, and recovery:

- **Error Propagation Across Crates**: Tests error chains from core → models → registry
- **Graceful Degradation**: Tests fallback mechanisms when components fail
- **Recovery Scenarios**: Tests various failure modes and recovery procedures
- **Error Reporting and Diagnostics**: Tests comprehensive error reporting
- **Error Boundaries and Isolation**: Tests error containment

### 4. Performance Integration (`performance_integration.rs`)

Tests for multi-threaded training, parallel model execution, and memory usage:

- **Multi-Threaded Training**: Tests concurrent model training across threads
- **Parallel Model Execution**: Tests concurrent inference with controlled concurrency
- **Memory Usage Across Pipeline**: Tests memory patterns throughout the workflow
- **Performance Benchmarks**: Tests performance baselines and metrics
- **Scalability Under Load**: Tests system behavior under various load conditions

### 5. CLI Integration (`cli_integration.rs`)

Tests for command execution flow, model training via CLI, and results visualization:

- **CLI Command Execution Flow**: Tests basic CLI functionality
- **Model Training via CLI**: Tests end-to-end training through CLI
- **CLI Results Visualization**: Tests output formatting and visualization
- **CLI Help and Usage**: Tests documentation and help systems
- **CLI Error Handling**: Tests user-friendly error messages

### 6. Real-World Scenarios (`real_world_scenarios.rs`)

Tests for multiple time series forecasting, model ensemble creation, and online learning:

- **Multiple Time Series Forecasting**: Tests handling various data characteristics
- **Model Ensemble Creation**: Tests ensemble strategies and evaluation
- **Online Learning Updates**: Tests streaming data and model adaptation
- **Real-World Production Scenario**: Tests comprehensive production workflow

## Mock Implementations

The `mock_implementations.rs` file provides simplified implementations of the core types and interfaces needed for testing:

- **TimeSeriesData**: Mock time series data with various generation methods
- **ModelRegistry**: Mock registry with model management capabilities
- **BaseModel Trait**: Simplified model interface for testing
- **TrainingData/InferenceData**: Mock data structures
- **Error Types**: Mock error types for testing error propagation

## Running the Tests

### Individual Test Suites

```bash
# Model Registry Integration
cargo test --test model_registry_integration

# Cross-Crate Communication
cargo test --test cross_crate_communication

# Error Propagation
cargo test --test error_propagation

# Performance Integration
cargo test --test performance_integration

# CLI Integration
cargo test --test cli_integration

# Real-World Scenarios
cargo test --test real_world_scenarios
```

### All Integration Tests

```bash
cargo test --test integration
```

### With Verbose Output

```bash
cargo test --test integration -- --nocapture
```

## Test Coverage

The integration tests cover the following integration scenarios specified in the requirements:

- ✅ **End-to-End Forecasting Pipeline** (implemented across all test suites)
  - Data loading (core) → Model creation (registry) → Training (models) → Inference

- ✅ **Model Registry Integration** (dedicated test suite)
  - Dynamic model discovery
  - Plugin loading
  - Model serialization/deserialization

- ✅ **CLI Integration** (dedicated test suite)
  - Command execution flow
  - Model training via CLI
  - Results visualization

- ✅ **Cross-Crate Communication** (dedicated test suite)
  - Registry ↔ Models interaction
  - Core ↔ Models data flow
  - CLI ↔ All crates command flow

- ✅ **Error Propagation** (dedicated test suite)
  - Error handling across crate boundaries
  - Graceful degradation
  - Recovery scenarios

- ✅ **Performance Integration** (dedicated test suite)
  - Multi-threaded training
  - Parallel model execution
  - Memory usage across pipeline

- ✅ **Real-World Scenarios** (dedicated test suite)
  - Multiple time series forecasting
  - Model ensemble creation
  - Online learning updates

## Key Testing Principles

1. **Cross-Crate Validation**: Each test validates interaction between multiple crates
2. **Mock-Based Testing**: Uses mock implementations to test interfaces without dependencies
3. **Async Support**: All tests support async/await patterns for realistic scenarios
4. **Error Testing**: Comprehensive error path testing with realistic error scenarios
5. **Performance Validation**: Tests include performance assertions and benchmarks
6. **Real-World Relevance**: Tests simulate actual usage patterns and workflows

## Future Enhancements

- Add integration with external data sources
- Test distributed training scenarios
- Add benchmarking against reference implementations
- Test deployment and containerization workflows
- Add chaos engineering tests for robustness validation
