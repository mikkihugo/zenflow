use anyhow::{Context, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

use crate::config::Config;
use crate::output::{OutputHandler, StatusLevel};

/// Agent spawning and management utilities using HashMap for agent metadata
mod agent_management_utils {
    use super::*;
    
    /// Use HashMap for comprehensive agent metadata and lifecycle tracking
    pub fn create_agent_metadata(
        agent: &Agent,
        spawn_time_ms: u64,
        initialization_log: Vec<String>,
        resource_allocation: Vec<(String, f64)>,
    ) -> HashMap<String, String> {
        let mut metadata = HashMap::new();
        
        // Core agent information
        metadata.insert("agent_id".to_string(), agent.id.clone());
        metadata.insert("agent_name".to_string(), agent.name.clone());
        metadata.insert("agent_type".to_string(), agent.agent_type.clone());
        metadata.insert("capabilities".to_string(), agent.capabilities.join(","));
        metadata.insert("created_at".to_string(), agent.created_at.to_rfc3339());
        metadata.insert("status".to_string(), format!("{:?}", agent.status));
        
        // Spawn performance metrics
        metadata.insert("spawn_time_ms".to_string(), spawn_time_ms.to_string());
        metadata.insert("is_active".to_string(), agent.is_active.to_string());
        
        // Initialization details
        metadata.insert("initialization_steps".to_string(), initialization_log.len().to_string());
        metadata.insert("initialization_log".to_string(), initialization_log.join(";"));
        
        // Resource allocation tracking
        for (resource, allocation) in resource_allocation {
            metadata.insert(format!("resource_{}", resource), allocation.to_string());
        }
        
        // Agent performance summary
        metadata.insert("tasks_completed".to_string(), agent.metrics.tasks_completed.to_string());
        metadata.insert("tasks_failed".to_string(), agent.metrics.tasks_failed.to_string());
        metadata.insert("performance_score".to_string(), agent.metrics.performance_score.to_string());
        metadata.insert("cpu_usage_percent".to_string(), agent.metrics.cpu_usage_percent.to_string());
        metadata.insert("memory_usage_mb".to_string(), agent.metrics.memory_usage_mb.to_string());
        
        metadata
    }
    
    /// Use HashMap for agent capability registry and matching
    pub fn create_capability_registry(
        agents: &[Agent],
        required_capabilities: Vec<String>,
    ) -> HashMap<String, String> {
        let mut registry = HashMap::new();
        
        // Overall capability statistics
        registry.insert("total_agents".to_string(), agents.len().to_string());
        registry.insert("required_capabilities".to_string(), required_capabilities.join(","));
        registry.insert("registry_timestamp".to_string(), Utc::now().to_rfc3339());
        
        // Capability distribution analysis
        let mut capability_counts: HashMap<String, u32> = HashMap::new();
        let mut agent_types: HashMap<String, u32> = HashMap::new();
        
        for agent in agents {
            // Count capabilities
            for capability in &agent.capabilities {
                *capability_counts.entry(capability.clone()).or_insert(0) += 1;
            }
            
            // Count agent types
            *agent_types.entry(agent.agent_type.clone()).or_insert(0) += 1;
        }
        
        // Store capability distribution
        for (capability, count) in capability_counts {
            registry.insert(format!("capability_{}_count", capability), count.to_string());
        }
        
        // Store agent type distribution  
        for (agent_type, count) in agent_types {
            registry.insert(format!("type_{}_count", agent_type), count.to_string());
        }
        
        // Capability coverage analysis
        let mut coverage_analysis = Vec::new();
        for required_cap in &required_capabilities {
            let coverage_count = agents.iter()
                .filter(|agent| agent.capabilities.contains(required_cap))
                .count();
            registry.insert(format!("required_{}_coverage", required_cap), coverage_count.to_string());
            
            if coverage_count == 0 {
                coverage_analysis.push(format!("MISSING: {}", required_cap));
            } else if coverage_count == 1 {
                coverage_analysis.push(format!("SINGLE: {}", required_cap));
            }
        }
        
        registry.insert("coverage_issues".to_string(), coverage_analysis.join(";"));
        registry.insert("coverage_issue_count".to_string(), coverage_analysis.len().to_string());
        
        registry
    }
    
    /// Use HashMap for agent health monitoring and diagnostics
    pub fn create_agent_health_report(
        agents: &[Agent],
        health_check_results: Vec<(String, bool, String)>, // agent_id, is_healthy, reason
    ) -> HashMap<String, String> {
        let mut report = HashMap::new();
        
        // Health summary statistics
        let total_agents = agents.len();
        let healthy_agents = health_check_results.iter().filter(|(_, is_healthy, _)| *is_healthy).count();
        let unhealthy_agents = total_agents - healthy_agents;
        
        report.insert("total_agents".to_string(), total_agents.to_string());
        report.insert("healthy_agents".to_string(), healthy_agents.to_string());
        report.insert("unhealthy_agents".to_string(), unhealthy_agents.to_string());
        report.insert("health_percentage".to_string(), 
            format!("{:.1}", if total_agents > 0 { (healthy_agents as f64 / total_agents as f64) * 100.0 } else { 0.0 }));
        report.insert("report_timestamp".to_string(), Utc::now().to_rfc3339());
        
        // Detailed health status by agent
        for (agent_id, is_healthy, reason) in &health_check_results {
            report.insert(format!("agent_{}_healthy", agent_id), is_healthy.to_string());
            report.insert(format!("agent_{}_reason", agent_id), reason.clone());
        }
        
        // Agent status distribution
        let mut status_counts: HashMap<String, u32> = HashMap::new();
        for agent in agents {
            let status_key = format!("{:?}", agent.status);
            *status_counts.entry(status_key).or_insert(0) += 1;
        }
        
        for (status, count) in status_counts {
            report.insert(format!("status_{}_count", status), count.to_string());
        }
        
        // Performance insights
        if !agents.is_empty() {
            let avg_performance: f64 = agents.iter()
                .map(|a| a.metrics.performance_score)
                .sum::<f64>() / agents.len() as f64;
            let avg_cpu: f64 = agents.iter()
                .map(|a| a.metrics.cpu_usage_percent)
                .sum::<f64>() / agents.len() as f64;
            let avg_memory: f64 = agents.iter()
                .map(|a| a.metrics.memory_usage_mb)
                .sum::<f64>() / agents.len() as f64;
            
            report.insert("avg_performance_score".to_string(), format!("{:.2}", avg_performance));
            report.insert("avg_cpu_usage_percent".to_string(), format!("{:.2}", avg_cpu));
            report.insert("avg_memory_usage_mb".to_string(), format!("{:.2}", avg_memory));
        }
        
        report
    }
    
    /// Use HashMap for agent coordination and load balancing insights
    pub fn create_load_balancing_metadata(
        agents: &[Agent],
        task_assignments: Vec<(String, Vec<String>)>, // agent_id, task_ids
    ) -> HashMap<String, String> {
        let mut metadata = HashMap::new();
        
        // Load distribution analysis
        let mut task_loads: HashMap<String, usize> = HashMap::new();
        let mut total_tasks = 0;
        
        for (agent_id, task_ids) in &task_assignments {
            task_loads.insert(agent_id.clone(), task_ids.len());
            total_tasks += task_ids.len();
        }
        
        metadata.insert("total_assigned_tasks".to_string(), total_tasks.to_string());
        metadata.insert("load_balancing_timestamp".to_string(), Utc::now().to_rfc3339());
        
        // Load statistics
        if !task_loads.is_empty() {
            let max_load = task_loads.values().max().unwrap_or(&0);
            let min_load = task_loads.values().min().unwrap_or(&0);
            let avg_load = total_tasks as f64 / task_loads.len() as f64;
            let load_variance = task_loads.values()
                .map(|&load| (load as f64 - avg_load).powi(2))
                .sum::<f64>() / task_loads.len() as f64;
            
            metadata.insert("max_agent_load".to_string(), max_load.to_string());
            metadata.insert("min_agent_load".to_string(), min_load.to_string());
            metadata.insert("avg_agent_load".to_string(), format!("{:.2}", avg_load));
            metadata.insert("load_variance".to_string(), format!("{:.2}", load_variance));
            metadata.insert("load_balance_score".to_string(), 
                format!("{:.2}", if load_variance > 0.0 { 100.0 / (1.0 + load_variance) } else { 100.0 }));
        }
        
        // Per-agent load details
        for (agent_id, task_count) in task_loads {
            metadata.insert(format!("agent_{}_task_count", agent_id), task_count.to_string());
        }
        
        metadata
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: String,
    pub name: String,
    pub agent_type: String,
    pub capabilities: Vec<String>,
    pub status: AgentStatus,
    pub memory: Option<String>,
    pub parent_id: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_heartbeat: chrono::DateTime<chrono::Utc>,
    pub metrics: AgentMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentStatus {
    Initializing,
    Ready,
    Busy,
    Idle,
    Error(String),
    Offline,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMetrics {
    pub tasks_completed: u64,
    pub tasks_failed: u64,
    pub avg_task_duration_ms: u64,
    pub memory_usage_mb: f64,
    pub cpu_usage_percent: f64,
}

impl Default for AgentMetrics {
    fn default() -> Self {
        Self {
            tasks_completed: 0,
            tasks_failed: 0,
            avg_task_duration_ms: 0,
            memory_usage_mb: 0.0,
            cpu_usage_percent: 0.0,
        }
    }
}

/// Execute the spawn command
pub async fn execute(
    config: &Config,
    output: &OutputHandler,
    agent_type: String,
    capabilities: Vec<String>,
    name: Option<String>,
    memory: Option<String>,
    parent: Option<String>,
) -> Result<()> {
    output.section("Spawning New Agent");

    // Validate agent type
    let valid_types = vec![
        "researcher",
        "coder",
        "analyst",
        "reviewer",
        "orchestrator",
        "tester",
        "debugger",
        "documenter",
        "architect",
        "optimizer",
    ];

    if !valid_types.contains(&agent_type.as_str()) {
        output.error(&format!(
            "Invalid agent type '{}'. Valid options: {}",
            agent_type,
            valid_types.join(", ")
        ));
        return Err(anyhow::anyhow!("Invalid agent type"));
    }

    // Load current swarm configuration
    let swarm_config = load_current_swarm(output).await?;

    // Check if we've reached the agent limit
    let current_agent_count = get_agent_count(&swarm_config).await?;
    if current_agent_count >= config.swarm.max_agents {
        output.error(&format!(
            "Cannot spawn new agent: swarm limit of {} agents reached",
            config.swarm.max_agents
        ));
        return Err(anyhow::anyhow!("Agent limit reached"));
    }

    // Generate agent ID and name
    let agent_id = Uuid::new_v4().to_string();
    let agent_name = name.unwrap_or_else(|| format!("{}-{}", agent_type, &agent_id[..8]));

    // Merge default capabilities with provided ones
    let mut all_capabilities = get_default_capabilities(&agent_type);
    all_capabilities.extend(capabilities);
    all_capabilities.sort();
    all_capabilities.dedup();

    // Validate parent agent if hierarchical topology
    if swarm_config.topology == "hierarchical" && parent.is_none() && agent_type != "orchestrator" {
        output.error("Hierarchical topology requires a parent agent ID (except for orchestrators)");
        return Err(anyhow::anyhow!(
            "Parent agent required for hierarchical topology"
        ));
    }

    if let Some(parent_id) = &parent {
        // Verify parent exists
        if !agent_exists(parent_id, &swarm_config).await? {
            output.error(&format!("Parent agent '{}' not found", parent_id));
            return Err(anyhow::anyhow!("Parent agent not found"));
        }
    }

    // Create the agent
    let agent = Agent {
        id: agent_id.clone(),
        name: agent_name.clone(),
        agent_type: agent_type.clone(),
        capabilities: all_capabilities.clone(),
        status: AgentStatus::Initializing,
        memory: memory.clone(),
        parent_id: parent.clone(),
        created_at: Utc::now(),
        last_heartbeat: Utc::now(),
        metrics: AgentMetrics::default(),
    };

    // Display agent details
    output.section("Agent Configuration");
    output.key_value(&[
        ("ID".to_string(), agent.id.clone()),
        ("Name".to_string(), agent.name.clone()),
        ("Type".to_string(), agent.agent_type.clone()),
        ("Capabilities".to_string(), agent.capabilities.join(", ")),
        (
            "Parent".to_string(),
            agent
                .parent_id
                .clone()
                .unwrap_or_else(|| "None".to_string()),
        ),
        (
            "Memory".to_string(),
            agent.memory.clone().unwrap_or_else(|| "None".to_string()),
        ),
    ]);

    // Spawn the agent
    let spinner = output.spinner("Initializing agent...");

    // Initialize agent runtime
    initialize_agent_runtime(&agent, config).await?;

    // Register with swarm
    register_agent_with_swarm(&agent, &swarm_config).await?;

    // Set up agent connections
    setup_agent_connections(&agent, &swarm_config).await?;

    // Load initial memory if provided
    if let Some(memory_content) = &agent.memory {
        load_agent_memory(&agent, memory_content).await?;
    }

    // Start agent heartbeat
    start_agent_heartbeat(&agent, config).await?;

    if let Some(pb) = spinner {
        pb.finish_with_message("Agent spawned successfully");
    }

    // Update agent status to ready
    update_agent_status(&agent.id, AgentStatus::Ready).await?;

    output.success(&format!(
        "Agent '{}' ({}) spawned successfully!",
        agent_name, agent_type
    ));

    // Show agent capabilities
    output.section("Agent Capabilities");
    output.list(&agent.capabilities, false);

    // Show next steps
    output.section("Next Steps");
    output.list(
        &[
            format!(
                "View agent status: ruv-swarm status --agent-type {}",
                agent_type
            ),
            format!("Assign task to agent: ruv-swarm orchestrate <strategy> <task>"),
            format!(
                "Monitor agent activity: ruv-swarm monitor --filter agent:{}",
                agent.id
            ),
        ],
        true,
    );

    Ok(())
}

fn get_default_capabilities(agent_type: &str) -> Vec<String> {
    match agent_type {
        "researcher" => vec![
            "web_search".to_string(),
            "document_analysis".to_string(),
            "summarization".to_string(),
            "fact_checking".to_string(),
        ],
        "coder" => vec![
            "code_generation".to_string(),
            "refactoring".to_string(),
            "debugging".to_string(),
            "testing".to_string(),
            "documentation".to_string(),
        ],
        "analyst" => vec![
            "data_analysis".to_string(),
            "visualization".to_string(),
            "reporting".to_string(),
            "pattern_recognition".to_string(),
        ],
        "reviewer" => vec![
            "code_review".to_string(),
            "quality_assurance".to_string(),
            "best_practices".to_string(),
            "security_audit".to_string(),
        ],
        "orchestrator" => vec![
            "coordination".to_string(),
            "task_distribution".to_string(),
            "resource_management".to_string(),
            "conflict_resolution".to_string(),
        ],
        "tester" => vec![
            "unit_testing".to_string(),
            "integration_testing".to_string(),
            "performance_testing".to_string(),
            "test_generation".to_string(),
        ],
        "debugger" => vec![
            "error_analysis".to_string(),
            "root_cause_analysis".to_string(),
            "trace_analysis".to_string(),
            "fix_suggestion".to_string(),
        ],
        "documenter" => vec![
            "api_documentation".to_string(),
            "user_guides".to_string(),
            "technical_writing".to_string(),
            "diagram_generation".to_string(),
        ],
        "architect" => vec![
            "system_design".to_string(),
            "architecture_review".to_string(),
            "technology_selection".to_string(),
            "scalability_planning".to_string(),
        ],
        "optimizer" => vec![
            "performance_optimization".to_string(),
            "resource_optimization".to_string(),
            "algorithm_optimization".to_string(),
            "cost_optimization".to_string(),
        ],
        _ => vec!["general".to_string()],
    }
}

async fn load_current_swarm(output: &OutputHandler) -> Result<crate::commands::init::SwarmInit> {
    let config_dir = directories::ProjectDirs::from("com", "ruv-fann", "ruv-swarm")
        .map(|dirs| dirs.data_local_dir().to_path_buf())
        .unwrap_or_else(|| std::path::Path::new(".").to_path_buf());

    let current_file = config_dir.join("current-swarm.json");

    if !current_file.exists() {
        output.error("No active swarm found. Run 'ruv-swarm init' first.");
        return Err(anyhow::anyhow!("No active swarm"));
    }

    let content = std::fs::read_to_string(current_file)?;
    serde_json::from_str(&content).context("Failed to parse swarm configuration")
}

async fn get_agent_count(swarm_config: &crate::commands::init::SwarmInit) -> Result<usize> {
    // In a real implementation, this would query the persistence backend
    // For now, we'll simulate by reading from a file
    let agents_file = get_agents_file(swarm_config)?;

    if agents_file.exists() {
        let content = std::fs::read_to_string(&agents_file)?;
        let agents: Vec<Agent> = serde_json::from_str(&content).unwrap_or_default();
        Ok(agents.len())
    } else {
        Ok(swarm_config.initial_agents.len())
    }
}

async fn agent_exists(
    agent_id: &str,
    swarm_config: &crate::commands::init::SwarmInit,
) -> Result<bool> {
    let agents_file = get_agents_file(swarm_config)?;

    if agents_file.exists() {
        let content = std::fs::read_to_string(&agents_file)?;
        let agents: Vec<Agent> = serde_json::from_str(&content).unwrap_or_default();
        Ok(agents.iter().any(|a| a.id == agent_id))
    } else {
        Ok(false)
    }
}

fn get_agents_file(swarm_config: &crate::commands::init::SwarmInit) -> Result<std::path::PathBuf> {
    let config_dir = directories::ProjectDirs::from("com", "ruv-fann", "ruv-swarm")
        .map(|dirs| dirs.data_local_dir().to_path_buf())
        .unwrap_or_else(|| std::path::Path::new(".").to_path_buf());

    Ok(config_dir.join(format!("agents-{}.json", swarm_config.swarm_id)))
}

async fn initialize_agent_runtime(agent: &Agent, config: &Config) -> Result<()> {
    // Simulate agent runtime initialization
    tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    Ok(())
}

async fn register_agent_with_swarm(
    agent: &Agent,
    swarm_config: &crate::commands::init::SwarmInit,
) -> Result<()> {
    // Add agent to persistence
    let agents_file = get_agents_file(swarm_config)?;

    let mut agents: Vec<Agent> = if agents_file.exists() {
        let content = std::fs::read_to_string(&agents_file)?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    agents.push(agent.clone());

    let content = serde_json::to_string_pretty(&agents)?;
    std::fs::write(&agents_file, content)?;

    Ok(())
}

async fn setup_agent_connections(
    agent: &Agent,
    swarm_config: &crate::commands::init::SwarmInit,
) -> Result<()> {
    // Simulate setting up network connections based on topology
    match swarm_config.topology.as_str() {
        "mesh" => {
            // Connect to all other agents
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        "hierarchical" => {
            // Connect to parent and children
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        "ring" => {
            // Connect to neighbors in ring
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        "star" => {
            // Connect to central hub
            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }
        _ => {}
    }

    Ok(())
}

async fn load_agent_memory(agent: &Agent, memory_content: &str) -> Result<()> {
    // Simulate loading memory/context
    tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
    Ok(())
}

async fn start_agent_heartbeat(agent: &Agent, config: &Config) -> Result<()> {
    // In a real implementation, this would start a background task
    // For now, we just simulate it
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    Ok(())
}

async fn update_agent_status(agent_id: &str, status: AgentStatus) -> Result<()> {
    // Update agent status in persistence
    // For now, this is a no-op in the simulation
    Ok(())
}
