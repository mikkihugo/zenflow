//! Code Mesh Core - High-performance distributed swarm intelligence library
//!
//! This library provides the core functionality for distributed code execution,
//! neural mesh computing, and WASM-powered swarm intelligence.

#![allow(clippy::module_name_repetitions)]

pub mod auth;
pub mod llm;

// Re-export commonly used types
pub use auth::*;
pub use llm::*;

/// Core result type for code mesh operations
pub type Result<T> = std::result::Result<T, CodeMeshError>;

/// Main error type for code mesh operations
#[derive(thiserror::Error, Debug)]
pub enum CodeMeshError {
    #[error("Authentication error: {message}")]
    Auth { message: String },
    
    #[error("LLM error: {message}")]
    Llm { message: String },
    
    #[error("IO error: {message}")]
    Io { message: String },
    
    #[error("Network error: {message}")]
    Network { message: String },
    
    #[error("Parse error: {message}")]
    Parse { message: String },
    
    #[error("Configuration error: {message}")]
    Config { message: String },
}

/// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Initialize the code mesh core library
pub fn init() -> Result<()> {
    // Initialize logging, configuration, etc.
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_init() {
        assert!(init().is_ok());
    }
    
    #[test]
    fn test_version() {
        assert!(!VERSION.is_empty());
    }
}
