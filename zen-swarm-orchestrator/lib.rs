//! # Zen Orchestrator  
//!
//! Distributed orchestration engine that runs INSIDE THE COLLECTIVE (zen-code).
//! This crate provides the "hive intelligence" that coordinates neural networks,
//! forecasting models, and CUDA computation within THE COLLECTIVE infrastructure.
//!
//! ## Architecture
//!
//! zen-orchestrator is a library component of THE COLLECTIVE that provides:
//! - Multi-agent coordination within the hive
//! - Neural network orchestration (zen-neural integration)
//! - Forecasting pipeline management (zen-forecasting integration)  
//! - GPU compute coordination (zen-compute integration)
//! - Intelligent task distribution and load balancing
//!
//! ## Features
//!
//! - **Swarm Orchestration**: Coordinate multiple autonomous agents
//! - **Neural Integration**: Deep integration with zen-neural networks
//! - **MCP Protocol**: Model Context Protocol support for agent communication
//! - **WASM Support**: Browser-based agent execution
//! - **Distributed Computing**: Multi-node agent coordination
//! - **Performance Monitoring**: Real-time metrics and benchmarking
//!
//! ## Architecture
//!
//! The orchestrator is built around several key components:
//!
//! - **Agent Management**: Spawn, coordinate, and monitor autonomous agents
//! - **Task Distribution**: Intelligent workload distribution across agents
//! - **Memory Persistence**: Cross-session state management
//! - **Neural Coordination**: Integration with zen-neural training and inference
//! - **Transport Layer**: Multiple communication protocols (WebSocket, shared memory)
//!
//! ## Quick Start
//!
//! ```rust
//! use zen_orchestrator::{SwarmOrchestrator, AgentConfig};
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     // Create orchestrator
//!     let mut orchestrator = SwarmOrchestrator::new().await?;
//!     
//!     // Configure agents
//!     let config = AgentConfig::default()
//!         .with_neural_capabilities(true)
//!         .with_forecasting_models(true);
//!     
//!     // Spawn agent swarm
//!     let swarm_id = orchestrator.spawn_swarm(config).await?;
//!     
//!     // Execute coordinated tasks
//!     let results = orchestrator.execute_task(swarm_id, "train_neural_network").await?;
//!     
//!     Ok(())
//! }
//! ```

#![warn(missing_docs)]
#![cfg_attr(docsrs, feature(doc_cfg))]

// Re-export core orchestration types
pub use swarm::{SwarmOrchestrator, SwarmConfig, SwarmError, SwarmResult};
pub use agent::{Agent, AgentConfig, AgentType, AgentStatus, AgentError};
pub use task::{Task, TaskResult, TaskStatus, TaskError, TaskQueue};
pub use topology::{SwarmTopology, NetworkGraph, TopologyError};

// Re-export coordination and MCP types
pub use coordination::{CoordinationProtocol, MessagePassing, EventBus};
pub use mcp::{MCPServer, MCPClient, MCPProtocol, MCPError};

// Re-export neural integration
pub use neural_integration::{
    NeuralCoordinator, TrainingOrchestrator, InferenceEngine,
    NeuralIntegrationError, ModelRegistry
};

// Re-export performance and benchmarking
pub use performance::{
    PerformanceMonitor, BenchmarkSuite, MetricsCollector,
    PerformanceMetrics, BenchmarkResult
};

// Core modules
pub mod swarm;
pub mod agent;
pub mod task;
pub mod topology;
pub mod coordination;
pub mod neural_integration;
pub mod performance;

// Protocol implementations
pub mod mcp;
pub mod transport;
pub mod persistence;

// A2A protocol implementation
pub mod a2a;

// WASM support
#[cfg(feature = "wasm")]
#[cfg_attr(docsrs, doc(cfg(feature = "wasm")))]
pub mod wasm;

// GPU acceleration
#[cfg(feature = "gpu")]
#[cfg_attr(docsrs, doc(cfg(feature = "gpu")))]
pub mod gpu;

// Distributed coordination
#[cfg(feature = "distributed")]
#[cfg_attr(docsrs, doc(cfg(feature = "distributed")))]
pub mod distributed;

// ML training integration
#[cfg(feature = "ml-training")]
#[cfg_attr(docsrs, doc(cfg(feature = "ml-training")))]
pub mod ml_training;

// Common error types and result helpers
pub mod error;
pub use error::{OrchestratorError, OrchestratorResult};

// Utility functions and helpers
pub mod utils;

// Version and metadata
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const PACKAGE_NAME: &str = env!("CARGO_PKG_NAME");

/// Library information and capabilities
pub mod info {
    //! Library metadata and feature detection
    
    /// Get the orchestrator version
    pub fn version() -> &'static str {
        super::VERSION
    }
    
    /// Get the package name
    pub fn name() -> &'static str {
        super::PACKAGE_NAME
    }
    
    /// Check if WASM support is available
    #[cfg(feature = "wasm")]
    pub fn has_wasm_support() -> bool { true }
    #[cfg(not(feature = "wasm"))]
    pub fn has_wasm_support() -> bool { false }
    
    /// Check if GPU support is available
    #[cfg(feature = "gpu")]
    pub fn has_gpu_support() -> bool { true }
    #[cfg(not(feature = "gpu"))]
    pub fn has_gpu_support() -> bool { false }
    
    /// Check if distributed coordination is available
    #[cfg(feature = "distributed")]
    pub fn has_distributed_support() -> bool { true }
    #[cfg(not(feature = "distributed"))]
    pub fn has_distributed_support() -> bool { false }
    
    /// Check if ML training integration is available
    #[cfg(feature = "ml-training")]
    pub fn has_ml_training_support() -> bool { true }
    #[cfg(not(feature = "ml-training"))]
    pub fn has_ml_training_support() -> bool { false }
}

// Prelude for common imports
pub mod prelude {
    //! Common imports for everyday use
    
    pub use crate::{
        SwarmOrchestrator, SwarmConfig, SwarmResult,
        Agent, AgentConfig, AgentType,
        Task, TaskResult, TaskStatus,
        SwarmTopology, OrchestratorError, OrchestratorResult
    };
    
    #[cfg(feature = "wasm")]
    pub use crate::wasm::*;
    
    #[cfg(feature = "gpu")]
    pub use crate::gpu::*;
    
    #[cfg(feature = "distributed")]
    pub use crate::distributed::*;
    
    #[cfg(feature = "ml-training")]
    pub use crate::ml_training::*;
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_version_info() {
        assert!(!info::version().is_empty());
        assert!(!info::name().is_empty());
    }
    
    #[test]
    fn test_feature_detection() {
        // These should not panic
        let _ = info::has_wasm_support();
        let _ = info::has_gpu_support();
        let _ = info::has_distributed_support();
        let _ = info::has_ml_training_support();
    }
}