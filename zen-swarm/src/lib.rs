//! # Zen Orchestrator  
//!
//! Distributed orchestration engine that runs INSIDE THE COLLECTIVE (zen-code).
//! This crate provides the A2A protocol for zen-swarm daemon communication.

#![warn(missing_docs)]

// A2A protocol implementation
pub mod a2a;

// Re-export A2A types for easy access
pub use a2a::*;

/// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Package name
pub const PACKAGE_NAME: &str = env!("CARGO_PKG_NAME");