//! Integration tests for cross-crate workflows in neuro-divergent
//!
//! These tests validate the interaction between different neuro-divergent crates,
//! ensuring the entire system works cohesively.

mod cli_integration;
mod cross_crate_communication;
mod error_propagation;
mod mock_implementations;
mod model_registry;
mod performance_integration;
mod real_world_scenarios;

pub use cli_integration::*;
pub use cross_crate_communication::*;
pub use error_propagation::*;
pub use mock_implementations::*;
pub use model_registry::*;
pub use performance_integration::*;
pub use real_world_scenarios::*;
