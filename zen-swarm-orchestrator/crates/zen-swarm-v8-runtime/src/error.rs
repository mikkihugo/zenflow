//! Error types for V8 runtime

use thiserror::Error;

#[derive(Debug, Error)]
pub enum V8Error {
    #[error("Runtime initialization error: {0}")]
    RuntimeInit(String),
    
    #[error("Runtime error: {0}")]
    Runtime(String),
    
    #[error("Plugin compilation error: {0}")]
    Compilation(String),
    
    #[error("Plugin execution error: {0}")]
    Execution(String),
    
    #[error("Plugin not found: {0}")]
    PluginNotFound(String),
    
    #[error("V8 error: {0}")]
    V8(String),
}