//! Secure Quantum Computing Configuration
//! 
//! This module provides secure credential management for quantum computing providers.
//! All sensitive information is loaded from environment variables or secure config files.

use std::env;
use std::path::Path;
use serde::{Deserialize, Serialize};

/// Secure quantum provider configuration
#[derive(Debug, Clone)]
pub struct QuantumConfig {
    /// IBM Quantum token (loaded securely)
    pub ibm_token: Option<String>,
    /// IBM Quantum hub (optional)
    pub ibm_hub: Option<String>,
    /// IBM Quantum group (optional) 
    pub ibm_group: Option<String>,
    /// IBM Quantum project (optional)
    pub ibm_project: Option<String>,
    /// Default quantum backend
    pub default_backend: String,
    /// Maximum circuit depth
    pub max_circuit_depth: u32,
    /// Simulation shots
    pub simulation_shots: u32,
}

/// Quantum job configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumJobConfig {
    /// Number of shots to run
    pub shots: u32,
    /// Backend to use
    pub backend: String,
    /// Job priority (if supported)
    pub priority: Option<u8>,
    /// Maximum execution time
    pub max_execution_time: Option<u32>,
}

/// Quantum circuit representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumCircuit {
    /// OpenQASM 3.0 circuit definition
    pub qasm: String,
    /// Number of qubits
    pub num_qubits: u32,
    /// Number of classical bits
    pub num_cbits: u32,
    /// Circuit depth
    pub depth: u32,
    /// Circuit metadata
    pub metadata: std::collections::HashMap<String, String>,
}

/// Quantum job result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantumJobResult {
    /// Job ID
    pub job_id: String,
    /// Job status
    pub status: String,
    /// Result data (counts, statevector, etc.)
    pub result: Option<serde_json::Value>,
    /// Execution time
    pub execution_time: Option<f64>,
    /// Error message if failed
    pub error: Option<String>,
    /// Metadata
    pub metadata: std::collections::HashMap<String, serde_json::Value>,
}

impl QuantumConfig {
    /// Load quantum configuration securely from environment variables
    /// Supports GitHub Actions secrets and local development
    pub fn from_env() -> Result<Self, String> {
        // Try multiple environment variable names for flexibility
        let ibm_token = env::var("IBM_QUANTUM_TOKEN")
            .or_else(|_| env::var("IBM_QUANTUM_API_TOKEN"))
            .or_else(|_| env::var("QUANTUM_TOKEN"))
            .or_else(|_| env::var("SECRETS_IBM_QUANTUM_TOKEN")) // GitHub Actions format
            .ok();
        
        // Validate that we have at least one provider configured
        if ibm_token.is_none() {
            return Err("No quantum provider configured. Set IBM_QUANTUM_TOKEN environment variable or GitHub secret.".to_string());
        }
        
        Ok(Self {
            ibm_token,
            ibm_hub: env::var("IBM_QUANTUM_HUB")
                .or_else(|_| env::var("SECRETS_IBM_QUANTUM_HUB"))
                .ok(),
            ibm_group: env::var("IBM_QUANTUM_GROUP")
                .or_else(|_| env::var("SECRETS_IBM_QUANTUM_GROUP"))
                .ok(),
            ibm_project: env::var("IBM_QUANTUM_PROJECT")
                .or_else(|_| env::var("SECRETS_IBM_QUANTUM_PROJECT"))
                .ok(),
            default_backend: env::var("QUANTUM_DEFAULT_BACKEND")
                .unwrap_or_else(|_| "ibmq_qasm_simulator".to_string()),
            max_circuit_depth: env::var("QUANTUM_MAX_CIRCUIT_DEPTH")
                .unwrap_or_else(|_| "100".to_string())
                .parse()
                .unwrap_or(100),
            simulation_shots: env::var("QUANTUM_SIMULATION_SHOTS")
                .unwrap_or_else(|_| "1024".to_string())
                .parse()
                .unwrap_or(1024),
        })
    }
    
    /// Load configuration from a secure local file
    pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Self, String> {
        let config_content = std::fs::read_to_string(path)
            .map_err(|e| format!("Failed to read quantum config file: {e}"))?;
            
        // Parse as TOML or JSON
        if config_content.trim().starts_with('[') || config_content.contains('=') {
            // TOML format
            toml::from_str(&config_content)
                .map_err(|e| format!("Failed to parse quantum config TOML: {e}"))
        } else {
            // JSON format
            serde_json::from_str(&config_content)
                .map_err(|e| format!("Failed to parse quantum config JSON: {e}"))
        }
    }
    
    /// Get IBM Quantum token securely
    pub fn get_ibm_token(&self) -> Result<&str, String> {
        self.ibm_token.as_deref()
            .ok_or_else(|| "IBM Quantum token not configured".to_string())
    }
    
    /// Check if IBM Quantum is available
    pub fn has_ibm_quantum(&self) -> bool {
        self.ibm_token.is_some()
    }
    
    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        if !self.has_ibm_quantum() {
            return Err("No quantum providers configured".to_string());
        }
        
        if self.max_circuit_depth == 0 {
            return Err("Invalid max_circuit_depth: must be > 0".to_string());
        }
        
        if self.simulation_shots == 0 {
            return Err("Invalid simulation_shots: must be > 0".to_string());
        }
        
        Ok(())
    }
}

impl Default for QuantumConfig {
    fn default() -> Self {
        Self {
            ibm_token: None,
            ibm_hub: None,
            ibm_group: None,
            ibm_project: None,
            default_backend: "ibmq_qasm_simulator".to_string(),
            max_circuit_depth: 100,
            simulation_shots: 1024,
        }
    }
}

impl Default for QuantumJobConfig {
    fn default() -> Self {
        Self {
            shots: 1024,
            backend: "ibmq_qasm_simulator".to_string(),
            priority: None,
            max_execution_time: Some(300), // 5 minutes
        }
    }
}

// Add missing serde implementation for QuantumConfig (for file loading)
impl Serialize for QuantumConfig {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("QuantumConfig", 6)?;
        // Don't serialize the actual token for security
        state.serialize_field("has_ibm_token", &self.ibm_token.is_some())?;
        state.serialize_field("ibm_hub", &self.ibm_hub)?;
        state.serialize_field("ibm_group", &self.ibm_group)?;
        state.serialize_field("ibm_project", &self.ibm_project)?;
        state.serialize_field("default_backend", &self.default_backend)?;
        state.serialize_field("max_circuit_depth", &self.max_circuit_depth)?;
        state.serialize_field("simulation_shots", &self.simulation_shots)?;
        state.end()
    }
}

impl<'de> Deserialize<'de> for QuantumConfig {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        // This is for loading from config files - tokens should come from env vars
        #[derive(Deserialize)]
        struct ConfigFile {
            ibm_hub: Option<String>,
            ibm_group: Option<String>,
            ibm_project: Option<String>,
            default_backend: Option<String>,
            max_circuit_depth: Option<u32>,
            simulation_shots: Option<u32>,
        }
        
        let config_file = ConfigFile::deserialize(deserializer)?;
        
        Ok(Self {
            // Always load from environment variables (supports GitHub secrets)
            ibm_token: env::var("IBM_QUANTUM_TOKEN")
                .or_else(|_| env::var("SECRETS_IBM_QUANTUM_TOKEN"))
                .ok(),
            ibm_hub: config_file.ibm_hub,
            ibm_group: config_file.ibm_group,
            ibm_project: config_file.ibm_project,
            default_backend: config_file.default_backend
                .unwrap_or_else(|| "ibmq_qasm_simulator".to_string()),
            max_circuit_depth: config_file.max_circuit_depth.unwrap_or(100),
            simulation_shots: config_file.simulation_shots.unwrap_or(1024),
        })
    }
}