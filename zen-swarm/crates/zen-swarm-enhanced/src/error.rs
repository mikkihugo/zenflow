//! Enhanced orchestrator error types

use thiserror::Error;

#[derive(Debug, Error)]
pub enum EnhancedError {
    #[error("Vector database error: {0}")]
    VectorError(#[from] zen_swarm_vector::VectorError),
    
    #[error("Runtime error: {0}")]
    RuntimeError(#[from] zen_swarm_v8_runtime::V8Error),
    
    #[error("Swarm error: {0}")]
    SwarmError(String),
    
    #[error("Plugin not found: {0}")]
    PluginNotFound(String),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Configuration error: {0}")]
    Config(String),
}