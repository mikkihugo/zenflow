//! Bridge module to claude-zen-neural-core
//!
//! This module re-exports the types from the actual FANN implementation
//! to provide a clean interface for the WASM layer.

// Re-export only the types we actually use
pub use claude_zen_neural_core::{
    Network,
    NetworkBuilder,
};