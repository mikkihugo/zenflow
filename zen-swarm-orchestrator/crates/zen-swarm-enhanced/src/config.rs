//! Enhanced orchestrator configuration

use zen_swarm_vector::VectorConfig;
use zen_swarm_v8_runtime::RuntimeConfig;
use serde::{Deserialize, Serialize};

/// Configuration for the enhanced orchestrator
#[derive(Debug, Clone)]
pub struct OrchestratorConfig {
    /// Vector database configuration
    pub vector_config: VectorConfig,
    /// V8 runtime configuration  
    pub runtime_config: RuntimeConfig,
    /// Database path for coordination data
    pub database_path: String,
    /// Maximum number of concurrent agents
    pub max_agents: usize,
}

impl Default for OrchestratorConfig {
    fn default() -> Self {
        Self {
            vector_config: VectorConfig::default(),
            runtime_config: RuntimeConfig::default(),
            database_path: "./orchestrator.db".to_string(),
            max_agents: 1000,
        }
    }
}

/// Statistics for the orchestrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrchestratorStats {
    pub swarm_stats: SwarmStats,
    pub vector_stats: zen_swarm_vector::DatabaseStats,
    pub runtime_stats: zen_swarm_v8_runtime::RuntimeStats,
    pub metrics: MetricsData,
}

/// Swarm statistics placeholder
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmStats {
    pub active_agents: usize,
    pub total_tasks: usize,
    pub completed_tasks: usize,
}

/// Metrics data placeholder
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricsData {
    pub uptime_seconds: u64,
    pub total_operations: u64,
}