//! Advanced neural network models and optimization algorithms
//!
//! This module contains sophisticated neural architectures and optimization
//! techniques for high-performance machine learning applications.

// Temporarily disabled modules due to dependency issues
// pub mod blocks;
// pub mod nbeats;
// pub mod nbeatsx; 
// pub mod nhits;

pub mod optimization;

// Re-export key types and functions
pub use optimization::{
    GeneticOptimizer, ParticleSwarmOptimizer, HyperparameterOptimizer,
    OptimizationResult, Individual, Particle
};