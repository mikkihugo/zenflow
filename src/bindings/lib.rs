//! zen-code native bindings
//!
//! This module provides native Rust bindings for zen-code, enabling high-performance
//! integration with zen-orchestrator and other Rust-based components.

#![deny(clippy::all)]
#![allow(clippy::too_many_arguments)]

// zen-orchestrator binding (minimal version for initial testing)
mod zen_orchestrator_binding_minimal;
pub use zen_orchestrator_binding_minimal::*;

// Re-export napi for external use if needed
pub use napi;