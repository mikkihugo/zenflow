//! Types for V8 runtime system

use serde::{Deserialize, Serialize};

/// Runtime configuration
#[derive(Debug, Clone)]
pub struct RuntimeConfig {
    pub max_heap_size: usize,
    pub sandbox_config: SandboxConfig,
    pub compiler_config: CompilerConfig,
}

/// Sandbox configuration  
#[derive(Debug, Clone)]
pub struct SandboxConfig {
    pub enable_filesystem: bool,
    pub enable_network: bool,
    pub timeout_ms: u64,
}

/// TypeScript compiler configuration
#[derive(Debug, Clone)]
pub struct CompilerConfig {
    pub target: String,
    pub module: String,
    pub strict: bool,
}

/// Runtime statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeStats {
    pub active_isolates: usize,
    pub loaded_plugins: usize,
    pub total_memory_usage: usize,
    pub config: RuntimeConfig,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            max_heap_size: 512 * 1024 * 1024, // 512MB
            sandbox_config: SandboxConfig::default(),
            compiler_config: CompilerConfig::default(),
        }
    }
}

impl Default for SandboxConfig {
    fn default() -> Self {
        Self {
            enable_filesystem: false,
            enable_network: false,
            timeout_ms: 5000,
        }
    }
}

impl Default for CompilerConfig {
    fn default() -> Self {
        Self {
            target: "ES2020".to_string(),
            module: "CommonJS".to_string(),
            strict: true,
        }
    }
}

// Make RuntimeConfig serializable for RuntimeStats
impl Serialize for RuntimeConfig {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("RuntimeConfig", 3)?;
        state.serialize_field("max_heap_size", &self.max_heap_size)?;
        state.serialize_field("timeout_ms", &self.sandbox_config.timeout_ms)?;
        state.serialize_field("strict_mode", &self.compiler_config.strict)?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for RuntimeConfig {
    fn deserialize<D>(_deserializer: D) -> Result<RuntimeConfig, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        Ok(RuntimeConfig::default())
    }
}