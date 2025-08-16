//! Re-exports from the existing FANN core implementation
//! 
//! This module provides a bridge to the actual FANN implementation located in
//! src/neural/rust/core/, exposing the types and functionality needed for WASM bindings.

// Re-export the existing FANN implementation
// Path should match your actual FANN core structure
pub use claude_zen_neural::*;

// If the core module is structured differently, we'll need to adjust these re-exports
// Based on the lib.rs we saw earlier, these should be available:
pub use claude_zen_neural::{
    Network,
    NetworkBuilder, 
    NetworkError,
    TrainingData,
    TrainingAlgorithm,
    ActivationFunction,
    Layer,
    Neuron,
    Connection,
};

// Additional types that might be useful for WASM integration
pub use claude_zen_neural::training::{
    TrainingState,
    TrainingError,
    ParallelTrainingOptions,
};

// Cascade training if needed
#[cfg(feature = "cascade")]
pub use claude_zen_neural::cascade::{
    CascadeConfig,
    CascadeNetwork,
    CascadeTrainer,
    CascadeError,
};

// Error handling
pub use claude_zen_neural::errors::{
    RuvFannError,
    ErrorCategory,
    ValidationError,
};