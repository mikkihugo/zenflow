//! Bun-based JavaScript/TypeScript runtime using external processes
//! 
//! This provides much better performance than embedded JS engines:
//! - Bun: 4x faster than Node.js, native TypeScript
//! - Deno: Fallback option, also native TypeScript
//! - Process isolation: More stable than embedded engines

use crate::{V8Error, config::RuntimeConfig};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::Arc,
};
use tokio::{
    fs,
    process::Command as TokioCommand,
    sync::RwLock,
};
use tracing::{info, warn};
use uuid::Uuid;

/// Node.js v24+ runtime for TypeScript execution
pub struct NodeRuntime {
    config: RuntimeConfig,
    plugins: Arc<RwLock<HashMap<String, AIPlugin>>>,
    runtime_type: RuntimeType,
    temp_dir: PathBuf,
}

/// Node.js runtime - v24+ only (native TypeScript support)
#[derive(Debug, Clone)]
pub enum RuntimeType {
    Node24, // Node.js v24+ with native TS support (REQUIRED)
}

impl NodeRuntime {
    /// Create new Bun runtime with automatic runtime detection
    pub async fn new() -> Result<Self, V8Error> {
        let config = RuntimeConfig::default();
        Self::with_config(config).await
    }

    /// Create new Bun runtime with configuration
    pub async fn with_config(config: RuntimeConfig) -> Result<Self, V8Error> {
        let runtime_type = Self::detect_best_runtime().await?;
        let temp_dir = Self::create_temp_dir().await?;

        info!("Initialized Node.js v24+ runtime (native TypeScript) at {:?}", temp_dir);

        Ok(Self {
            config,
            plugins: Arc::new(RwLock::new(HashMap::new())),
            runtime_type,
            temp_dir,
        })
    }

    /// Detect Node.js v24+ runtime (REQUIRED)
    async fn detect_best_runtime() -> Result<RuntimeType, V8Error> {
        // Check for Node.js v24+ (REQUIRED)
        if let Some(version) = Self::get_node_version().await {
            if version >= 24 {
                return Ok(RuntimeType::Node24);
            } else {
                return Err(V8Error::Runtime(format!(
                    "Node.js v{} found, but v24+ is required for native TypeScript support. Please upgrade Node.js.",
                    version
                )));
            }
        }

        Err(V8Error::Runtime(
            "Node.js v24+ is required for native TypeScript support. Please install Node.js v24+.".to_string()
        ))
    }

    /// Get Node.js major version number
    async fn get_node_version() -> Option<u32> {
        let output = Command::new("node").arg("--version").output().ok()?;
        if !output.status.success() {
            return None;
        }

        let version_str = String::from_utf8_lossy(&output.stdout);
        let version_str = version_str.trim().strip_prefix('v')?;
        let major_version = version_str.split('.').next()?.parse().ok()?;
        Some(major_version)
    }

    /// Check if a runtime is available
    async fn check_runtime_available(cmd: &str, args: &[&str]) -> bool {
        match Command::new(cmd).args(args).output() {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }

    /// Create temporary directory for plugin files
    async fn create_temp_dir() -> Result<PathBuf, V8Error> {
        let temp_dir = std::env::temp_dir().join(format!("zen-swarm-{}", Uuid::new_v4()));
        fs::create_dir_all(&temp_dir).await
            .map_err(|e| V8Error::Runtime(format!("Failed to create temp dir: {}", e)))?;
        Ok(temp_dir)
    }

    /// Load TypeScript plugin from source code
    pub async fn load_typescript_plugin(&self, name: &str, source: &str) -> Result<AIPlugin, V8Error> {
        let plugin_id = Uuid::new_v4();
        let plugin_path = self.temp_dir.join(format!("{}.ts", name));
        
        // Write TypeScript source to file
        fs::write(&plugin_path, source).await
            .map_err(|e| V8Error::Runtime(format!("Failed to write plugin file: {}", e)))?;

        // Test plugin execution
        let test_result = self.execute_plugin_file(&plugin_path, "test", &serde_json::json!({})).await?;
        
        let plugin = AIPlugin {
            id: plugin_id.to_string(),
            name: name.to_string(),
            source_path: plugin_path,
            last_executed: std::time::SystemTime::now(),
            test_result: Some(test_result),
            runtime_type: self.runtime_type.clone(),
        };

        // Store plugin
        {
            let mut plugins = self.plugins.write().await;
            plugins.insert(name.to_string(), plugin.clone());
        }

        info!("Loaded TypeScript plugin '{}' using {:?} runtime", name, self.runtime_type);
        Ok(plugin)
    }

    /// Execute plugin function with arguments
    pub async fn execute_plugin(&self, plugin_name: &str, function: &str, args: &serde_json::Value) -> Result<serde_json::Value, V8Error> {
        let plugin = {
            let plugins = self.plugins.read().await;
            plugins.get(plugin_name)
                .ok_or_else(|| V8Error::Runtime(format!("Plugin not found: {}", plugin_name)))?
                .clone()
        };

        self.execute_plugin_file(&plugin.source_path, function, args).await
    }

    /// Execute plugin file with function call
    async fn execute_plugin_file(&self, plugin_path: &Path, function: &str, args: &serde_json::Value) -> Result<serde_json::Value, V8Error> {
        let wrapper_code = format!(r#"
            // Import the plugin
            import * as plugin from "./{}";
            
            // Execute the function
            const args = {};
            let result;
            
            if (typeof plugin.{} === 'function') {{
                result = await plugin.{}(args);
            }} else if (typeof plugin.default?{} === 'function') {{
                result = await plugin.default.{}(args);
            }} else {{
                throw new Error(`Function '{}' not found in plugin`);
            }}
            
            // Output result as JSON
            console.log(JSON.stringify(result));
        "#,
            plugin_path.file_name().unwrap().to_string_lossy(),
            args,
            function,
            function,
            function,
            function,
            function
        );

        let wrapper_path = self.temp_dir.join(format!("wrapper_{}.ts", Uuid::new_v4()));
        fs::write(&wrapper_path, wrapper_code).await
            .map_err(|e| V8Error::Runtime(format!("Failed to write wrapper: {}", e)))?;

        let output = {
            // Node.js v24+ with native TypeScript support
            TokioCommand::new("node")
                .args(&["--enable-source-maps", "--experimental-strip-types"])
                .arg(&wrapper_path)
                .current_dir(&self.temp_dir)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .output()
                .await
        }.map_err(|e| V8Error::Runtime(format!("Failed to execute plugin: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(V8Error::Runtime(format!("Plugin execution failed: {}", stderr)));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        serde_json::from_str(stdout.trim())
            .map_err(|e| V8Error::Runtime(format!("Failed to parse plugin output: {}", e)))
    }

    /// Get plugin by name
    pub async fn get_plugin(&self, name: &str) -> Option<AIPlugin> {
        let plugins = self.plugins.read().await;
        plugins.get(name).cloned()
    }

    /// Get runtime statistics
    pub async fn stats(&self) -> RuntimeStats {
        let plugins = self.plugins.read().await;
        RuntimeStats {
            runtime_type: format!("{:?}", self.runtime_type),
            loaded_plugins: plugins.len(),
            temp_dir: self.temp_dir.clone(),
            total_executions: 0, // TODO: Track executions
        }
    }

    /// Shutdown runtime and cleanup
    pub async fn shutdown(&self) -> Result<(), V8Error> {
        // Clean up temporary directory
        if let Err(e) = fs::remove_dir_all(&self.temp_dir).await {
            warn!("Failed to cleanup temp dir: {}", e);
        }

        info!("Bun runtime shutdown complete");
        Ok(())
    }
}

/// AI Plugin representation
#[derive(Debug, Clone)]
pub struct AIPlugin {
    pub id: String,
    pub name: String,
    pub source_path: PathBuf,
    pub last_executed: std::time::SystemTime,
    pub test_result: Option<serde_json::Value>,
    pub runtime_type: RuntimeType,
}

/// Runtime statistics  
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RuntimeStats {
    pub runtime_type: String,
    pub loaded_plugins: usize,
    pub temp_dir: PathBuf,
    pub total_executions: u64,
}

impl Default for RuntimeStats {
    fn default() -> Self {
        Self {
            runtime_type: "Unknown".to_string(),
            loaded_plugins: 0,
            temp_dir: PathBuf::new(),
            total_executions: 0,
        }
    }
}