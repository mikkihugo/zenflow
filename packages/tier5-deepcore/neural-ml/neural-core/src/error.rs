/*!
 * Error types for neural-ml optimization module
 */

use thiserror::Error;

/// Result type for neural operations
pub type Result<T> = std::result::Result<T, NeuralError>;

/// Neural ML optimization errors
#[derive(Error, Debug)]
pub enum NeuralError {
    /// Optimization backend errors
    #[error("Optimization error: {0}")]
    OptimizationError(String),

    /// GPU acceleration errors
    #[error("GPU error: {0}")]
    GpuError(String),

    /// SIMD acceleration errors
    #[error("SIMD error: {0}")]
    SimdError(String),

    /// Configuration errors
    #[error("Configuration error: {0}")]
    ConfigError(String),

    /// I/O errors
    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),

    /// Generic errors
    #[error("Neural error: {0}")]
    Other(String),
}

impl From<String> for NeuralError {
    fn from(msg: String) -> Self {
        NeuralError::Other(msg)
    }
}

impl From<&str> for NeuralError {
    fn from(msg: &str) -> Self {
        NeuralError::Other(msg.to_string())
    }
}