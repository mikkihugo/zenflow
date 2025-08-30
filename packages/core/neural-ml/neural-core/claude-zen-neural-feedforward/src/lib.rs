//! Pure Rust implementation of the Fast Artificial Neural Network (FANN) library
//!
//! This crate provides a modern, safe, and efficient implementation of neural networks
//! inspired by the original FANN library, with support for generic floating-point types.
//! Includes full cascade correlation support for dynamic network topology optimization.

// Re-export main types
pub use activation::ActivationFunction;
pub use connection::Connection;
pub use layer::Layer;
pub use network::{Network, NetworkBuilder, NetworkError};
pub use neuron::Neuron;

// Re-export training types
pub use training_types::{
  IncrementalBackprop, ParallelTrainingOptions,
  TrainingAlgorithm as TrainingAlgorithmTrait, TrainingData, TrainingError,
  TrainingState,
};

// Re-export training with battle-tested crates
pub use training::ModernTrainer;

#[cfg(feature = "burn-backend")]
pub use training::{BurnNeuralNet, BurnTrainer};

#[cfg(feature = "smartcore-backend")]
pub use training::{SmartCoreClassifierType, SmartCoreTrainer};

/// Enumeration of available training algorithms
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TrainingAlgorithm {
  IncrementalBackprop,
  BatchBackprop,
  Batch,           // Alias for BatchBackprop
  Backpropagation, // Alias for IncrementalBackprop
  RProp,
  QuickProp,
}

// Re-export cascade training types
pub use cascade::{
  CascadeConfig, CascadeError, CascadeNetwork, CascadeTrainer,
};

// Re-export comprehensive error handling
pub use errors::{ErrorCategory, RuvFannError, ValidationError};

// Modules
pub mod activation;
pub mod cascade;
pub mod connection;
pub mod errors;
pub mod integration;
pub mod layer;
pub mod memory_manager;
pub mod network;
pub mod neuron;
pub mod training;
pub mod training_types;

// Optional I/O module
#[cfg(feature = "io")]
pub mod io;

// SIMD acceleration module (CPU optimizations)
#[cfg(feature = "parallel")]
pub mod simd;

// WASM API module (WebAssembly integration)
#[cfg(feature = "wasm")]
pub mod wasm_api;
#[cfg(feature = "wasm")]
pub use wasm_api::{WasmNetwork, get_active_network_count, get_wasm_info};

// Automatic optimization selection
pub mod optimization_selector;
pub use optimization_selector::{
  OptimizationSelector, OptimizationStrategy, ResourceState, TaskMetrics,
  auto_select_strategy, record_optimization_performance,
};

// Tests are in individual modules

// Mock types for testing
pub mod network_types;
