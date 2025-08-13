//! Error types for zen-swarm-vector

use thiserror::Error;

/// Vector database error types
#[derive(Debug, Error)]
pub enum VectorError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Vector dimension mismatch: expected {expected}, got {actual}")]
    DimensionMismatch { expected: usize, actual: usize },
    
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Embedding error: {0}")]
    Embedding(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
}