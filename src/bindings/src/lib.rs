//! zen-neural-stack native bindings
//!
//! This module provides native Rust bindings for zen-neural-stack, enabling high-performance
//! neural AI coordination with zen-swarm orchestration and official A2A protocol for neural agent communication.

#![deny(clippy::all)]
#![allow(clippy::too_many_arguments)]

// Core zen-swarm-orchestrator bindings (always available)
mod zen_orchestrator_binding;

// Optional quantum computing integration
#[cfg(feature = "quantum")]
mod quantum_config;
#[cfg(feature = "quantum")]
mod quantum_provider;

// zen-neural-stack integrations (enabled by default)
#[cfg(feature = "zen-neural")]
use zen_neural as _zen_neural;
#[cfg(feature = "zen-orchestrator")]
use zen_orchestrator as _zen_orchestrator;
#[cfg(feature = "zen-forecasting")]
use zen_forecasting as _zen_forecasting;
#[cfg(feature = "zen-swarm")]
use zen_swarm as _zen_swarm;

// Advanced optional integrations
#[cfg(feature = "zen-compute")]
use zen_compute as _zen_compute;

// Re-export public types
pub use zen_orchestrator_binding::*;

#[cfg(feature = "quantum")]
pub use quantum_config::*;
#[cfg(feature = "quantum")]
pub use quantum_provider::*;

// Re-export zen-neural-stack components when enabled
#[cfg(feature = "zen-neural")]
pub use _zen_neural as zen_neural;
#[cfg(feature = "zen-orchestrator")]
pub use _zen_orchestrator as zen_orchestrator;
#[cfg(feature = "zen-forecasting")]
pub use _zen_forecasting as zen_forecasting;
#[cfg(feature = "zen-swarm")]
pub use _zen_swarm as zen_swarm;
#[cfg(feature = "zen-compute")]
pub use _zen_compute as zen_compute;

// Re-export napi for external use
pub use napi;