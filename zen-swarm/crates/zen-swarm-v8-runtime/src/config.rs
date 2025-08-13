//! Configuration for Node.js v24+ runtime

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Configuration for the Node.js runtime
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeConfig {
    /// Temporary directory for plugin files
    pub temp_dir: Option<PathBuf>,
    /// Maximum plugin execution time in seconds
    pub max_execution_time: u64,
    /// Maximum memory per plugin in MB
    pub max_memory_mb: u64,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            temp_dir: None, // Will use system temp dir
            max_execution_time: 30, // 30 seconds
            max_memory_mb: 256, // 256MB per plugin
        }
    }
}