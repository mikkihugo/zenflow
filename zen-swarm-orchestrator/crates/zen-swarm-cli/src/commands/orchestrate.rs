use anyhow::{Context, Result};
use chrono::Utc;
use indicatif::ProgressBar;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::time::Duration;
use uuid::Uuid;

use crate::config::Config;
use crate::output::{OutputHandler, StatusLevel};

/// Task orchestration utilities using HashMap for coordination metadata
mod orchestration_utils {
    use super::*;
    
    /// Use HashMap for task execution metadata and performance tracking
    pub fn create_task_metadata(
        task: &Task,
        execution_time_ms: u64,
        resource_usage: Vec<(String, f64)>,
        agent_assignments: Vec<String>,
    ) -> HashMap<String, String> {
        let mut metadata = HashMap::new();
        
        // Core task information
        metadata.insert("task_id".to_string(), task.id.clone());
        metadata.insert("strategy".to_string(), format!("{:?}", task.strategy));
        metadata.insert("priority".to_string(), task.priority.to_string());
        metadata.insert("status".to_string(), format!("{:?}", task.status));
        metadata.insert("created_at".to_string(), task.created_at.to_rfc3339());
        
        // Execution metrics
        metadata.insert("execution_time_ms".to_string(), execution_time_ms.to_string());
        metadata.insert("assigned_agents_count".to_string(), agent_assignments.len().to_string());
        metadata.insert("assigned_agents".to_string(), agent_assignments.join(","));
        
        // Resource utilization
        for (resource, usage) in resource_usage {
            metadata.insert(format!("resource_{}", resource), usage.to_string());
        }
        
        // Subtask summary
        metadata.insert("subtasks_total".to_string(), task.subtasks.len().to_string());
        let completed_subtasks = task.subtasks.iter()
            .filter(|st| matches!(st.status, TaskStatus::Completed))
            .count();
        metadata.insert("subtasks_completed".to_string(), completed_subtasks.to_string());
        
        metadata
    }
    
    /// Use HashMap for orchestration strategy configuration
    pub fn create_strategy_config(
        strategy: &TaskStrategy,
        max_agents: usize,
        timeout_seconds: u64,
        retry_attempts: u32,
    ) -> HashMap<String, String> {
        let mut config = HashMap::new();
        
        config.insert("strategy".to_string(), format!("{:?}", strategy));
        config.insert("max_agents".to_string(), max_agents.to_string());
        config.insert("timeout_seconds".to_string(), timeout_seconds.to_string());
        config.insert("retry_attempts".to_string(), retry_attempts.to_string());
        
        // Strategy-specific configuration
        match strategy {
            TaskStrategy::Parallel => {
                config.insert("parallelism".to_string(), "full".to_string());
                config.insert("coordination_overhead".to_string(), "high".to_string());
            },
            TaskStrategy::Sequential => {
                config.insert("parallelism".to_string(), "none".to_string());
                config.insert("coordination_overhead".to_string(), "low".to_string());
            },
            TaskStrategy::Pipeline => {
                config.insert("parallelism".to_string(), "staged".to_string());
                config.insert("coordination_overhead".to_string(), "medium".to_string());
            },
            TaskStrategy::Adaptive => {
                config.insert("parallelism".to_string(), "dynamic".to_string());
                config.insert("coordination_overhead".to_string(), "variable".to_string());
            },
        }
        
        config
    }
    
    /// Use HashMap for task coordination state tracking across agents
    pub fn create_coordination_state(
        task_id: &str,
        active_agents: Vec<&str>,
        pending_operations: Vec<String>,
        completed_phases: Vec<String>,
    ) -> HashMap<String, String> {
        let mut state = HashMap::new();
        
        state.insert("task_id".to_string(), task_id.to_string());
        state.insert("coordination_timestamp".to_string(), Utc::now().to_rfc3339());
        state.insert("active_agents".to_string(), active_agents.join(","));
        state.insert("active_agent_count".to_string(), active_agents.len().to_string());
        
        // Operation tracking
        state.insert("pending_operations".to_string(), pending_operations.join(";"));
        state.insert("pending_count".to_string(), pending_operations.len().to_string());
        state.insert("completed_phases".to_string(), completed_phases.join(";"));
        state.insert("completed_phases_count".to_string(), completed_phases.len().to_string());
        
        // Coordination health indicators
        let health_score = if active_agents.is_empty() {
            0.0
        } else {
            let completion_ratio = completed_phases.len() as f64 / (completed_phases.len() + pending_operations.len()).max(1) as f64;
            completion_ratio * 100.0
        };
        state.insert("coordination_health_score".to_string(), format!("{:.1}", health_score));
        
        state
    }
    
    /// Use HashMap for performance analytics and optimization insights
    pub fn analyze_task_performance(
        tasks: &[Task],
        execution_metadata: &[HashMap<String, String>],
    ) -> HashMap<String, String> {
        let mut analytics = HashMap::new();
        
        // Basic statistics
        analytics.insert("total_tasks".to_string(), tasks.len().to_string());
        analytics.insert("analysis_timestamp".to_string(), Utc::now().to_rfc3339());
        
        // Strategy effectiveness analysis
        let mut strategy_performance: HashMap<String, (u32, f64)> = HashMap::new();
        for (task, metadata) in tasks.iter().zip(execution_metadata.iter()) {
            let strategy_key = format!("{:?}", task.strategy);
            let execution_time = metadata.get("execution_time_ms")
                .and_then(|t| t.parse::<f64>().ok())
                .unwrap_or(0.0);
            
            let (count, total_time) = strategy_performance.get(&strategy_key).unwrap_or(&(0, 0.0));
            strategy_performance.insert(strategy_key, (count + 1, total_time + execution_time));
        }
        
        // Store strategy insights
        for (strategy, (count, total_time)) in strategy_performance {
            let avg_time = if count > 0 { total_time / count as f64 } else { 0.0 };
            analytics.insert(format!("strategy_{}_count", strategy), count.to_string());
            analytics.insert(format!("strategy_{}_avg_time_ms", strategy), format!("{:.1}", avg_time));
        }
        
        // Success rate analysis
        let completed_tasks = tasks.iter().filter(|t| matches!(t.status, TaskStatus::Completed)).count();
        let success_rate = if tasks.is_empty() { 0.0 } else { (completed_tasks as f64 / tasks.len() as f64) * 100.0 };
        analytics.insert("success_rate_percent".to_string(), format!("{:.1}", success_rate));
        
        analytics
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub description: String,
    pub strategy: OrchestrationStrategy,
    pub status: TaskStatus,
    pub priority: u8,
    pub assigned_agents: Vec<String>,
    pub subtasks: Vec<SubTask>,
    pub results: Vec<TaskResult>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub started_at: Option<chrono::DateTime<chrono::Utc>>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub timeout_seconds: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrchestrationStrategy {
    Parallel,
    Sequential,
    Adaptive,
    Consensus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed(String),
    Timeout,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubTask {
    pub id: String,
    pub description: String,
    pub assigned_agent: String,
    pub status: TaskStatus,
    pub result: Option<TaskResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub agent_id: String,
    pub subtask_id: Option<String>,
    pub success: bool,
    pub output: serde_json::Value,
    pub execution_time_ms: u64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Execute the orchestrate command
pub async fn execute(
    config: &Config,
    output: &OutputHandler,
    strategy: String,
    task: String,
    max_agents: Option<usize>,
    timeout: Option<u64>,
    priority: u8,
    watch: bool,
) -> Result<()> {
    output.section("Orchestrating Task");

    // Parse orchestration strategy
    let strategy_enum = match strategy.to_lowercase().as_str() {
        "parallel" => OrchestrationStrategy::Parallel,
        "sequential" => OrchestrationStrategy::Sequential,
        "adaptive" => OrchestrationStrategy::Adaptive,
        "consensus" => OrchestrationStrategy::Consensus,
        _ => {
            output.error(&format!(
                "Invalid strategy '{}'. Valid options: parallel, sequential, adaptive, consensus",
                strategy
            ));
            return Err(anyhow::anyhow!("Invalid orchestration strategy"));
        }
    };

    // Load task description (from file or direct input)
    let task_description = if Path::new(&task).exists() {
        output.info(&format!("Loading task from file: {}", task));
        std::fs::read_to_string(&task).context("Failed to read task file")?
    } else {
        task.clone()
    };

    // Validate priority
    if priority == 0 || priority > 10 {
        output.warning("Priority should be between 1 and 10. Using default priority 5.");
    }
    let priority = priority.clamp(1, 10);

    // Load current swarm and available agents
    let swarm_config = load_current_swarm(output).await?;
    let available_agents = get_available_agents(&swarm_config).await?;

    if available_agents.is_empty() {
        output
            .error("No available agents in the swarm. Spawn agents first with 'ruv-swarm spawn'.");
        return Err(anyhow::anyhow!("No available agents"));
    }

    // Determine agents to use
    let agents_to_use = if let Some(max) = max_agents {
        available_agents.into_iter().take(max).collect()
    } else {
        available_agents
    };

    // Create task
    let task_obj = Task {
        id: Uuid::new_v4().to_string(),
        description: task_description.clone(),
        strategy: strategy_enum.clone(),
        status: TaskStatus::Pending,
        priority,
        assigned_agents: agents_to_use.iter().map(|a| a.id.clone()).collect(),
        subtasks: Vec::new(),
        results: Vec::new(),
        created_at: Utc::now(),
        started_at: None,
        completed_at: None,
        timeout_seconds: timeout,
    };

    // Display task configuration
    output.section("Task Configuration");
    output.key_value(&[
        ("Task ID".to_string(), task_obj.id.clone()),
        ("Strategy".to_string(), format!("{:?}", task_obj.strategy)),
        ("Priority".to_string(), task_obj.priority.to_string()),
        ("Agents".to_string(), agents_to_use.len().to_string()),
        (
            "Timeout".to_string(),
            timeout
                .map(|t| format!("{}s", t))
                .unwrap_or_else(|| "None".to_string()),
        ),
    ]);

    output.info("Task Description:");
    output.list(&[&task_description], false);

    output.section("Assigned Agents");
    let agent_list: Vec<String> = agents_to_use
        .iter()
        .map(|a| format!("{} ({})", a.name, a.agent_type))
        .collect();
    output.list(&agent_list, false);

    // Start orchestration
    let spinner = output.spinner("Analyzing task and planning execution...");

    // Decompose task into subtasks based on strategy
    let subtasks = decompose_task(&task_obj, &agents_to_use, &strategy_enum).await?;

    if let Some(pb) = spinner {
        pb.finish_with_message(format!("Created {} subtasks", subtasks.len()));
    }

    // Show subtask breakdown
    output.section("Task Breakdown");
    for (i, subtask) in subtasks.iter().enumerate() {
        output.info(&format!(
            "{}. {} → {}",
            i + 1,
            subtask.description,
            agents_to_use
                .iter()
                .find(|a| a.id == subtask.assigned_agent)
                .map(|a| &a.name)
                .unwrap_or(&"Unknown".to_string())
        ));
    }

    // Execute task
    if watch {
        execute_with_monitoring(task_obj, subtasks, agents_to_use, config, output).await
    } else {
        execute_background(task_obj, subtasks, agents_to_use, config, output).await
    }
}

async fn decompose_task(
    task: &Task,
    agents: &[crate::commands::spawn::Agent],
    strategy: &OrchestrationStrategy,
) -> Result<Vec<SubTask>> {
    let mut subtasks = Vec::new();

    // Simulate task decomposition based on strategy
    match strategy {
        OrchestrationStrategy::Parallel => {
            // Divide task among all agents
            for (i, agent) in agents.iter().enumerate() {
                subtasks.push(SubTask {
                    id: Uuid::new_v4().to_string(),
                    description: format!("Parallel subtask {} for {}", i + 1, task.description),
                    assigned_agent: agent.id.clone(),
                    status: TaskStatus::Pending,
                    result: None,
                });
            }
        }
        OrchestrationStrategy::Sequential => {
            // Create a chain of subtasks
            for (i, agent) in agents.iter().enumerate() {
                subtasks.push(SubTask {
                    id: Uuid::new_v4().to_string(),
                    description: format!("Step {} of {}", i + 1, task.description),
                    assigned_agent: agent.id.clone(),
                    status: TaskStatus::Pending,
                    result: None,
                });
            }
        }
        OrchestrationStrategy::Adaptive => {
            // Start with exploration phase
            let explorers = agents.iter().take(3).collect::<Vec<_>>();
            for (i, agent) in explorers.iter().enumerate() {
                subtasks.push(SubTask {
                    id: Uuid::new_v4().to_string(),
                    description: format!("Explore approach {} for {}", i + 1, task.description),
                    assigned_agent: agent.id.clone(),
                    status: TaskStatus::Pending,
                    result: None,
                });
            }
        }
        OrchestrationStrategy::Consensus => {
            // All agents work on the same task
            for agent in agents {
                subtasks.push(SubTask {
                    id: Uuid::new_v4().to_string(),
                    description: format!("Provide solution for: {}", task.description),
                    assigned_agent: agent.id.clone(),
                    status: TaskStatus::Pending,
                    result: None,
                });
            }
        }
    }

    Ok(subtasks)
}

async fn execute_with_monitoring(
    mut task: Task,
    mut subtasks: Vec<SubTask>,
    agents: Vec<crate::commands::spawn::Agent>,
    config: &Config,
    output: &OutputHandler,
) -> Result<()> {
    output.section("Executing Task");

    task.started_at = Some(Utc::now());
    task.status = TaskStatus::Running;
    task.subtasks = subtasks.clone();

    // Create progress bar
    let progress = output.progress_bar(subtasks.len() as u64, "Executing subtasks");

    // Execute based on strategy
    match &task.strategy {
        OrchestrationStrategy::Parallel => {
            // Execute all subtasks in parallel
            let mut handles = Vec::new();

            for subtask in &mut subtasks {
                let subtask_clone = subtask.clone();
                let agent = agents
                    .iter()
                    .find(|a| a.id == subtask.assigned_agent)
                    .cloned();

                if let Some(agent) = agent {
                    let handle =
                        tokio::spawn(async move { execute_subtask(subtask_clone, agent).await });
                    handles.push((subtask.id.clone(), handle));
                }
            }

            // Wait for all to complete
            for (subtask_id, handle) in handles {
                match handle.await {
                    Ok(Ok(result)) => {
                        if let Some(subtask) = subtasks.iter_mut().find(|s| s.id == subtask_id) {
                            subtask.status = TaskStatus::Completed;
                            subtask.result = Some(result.clone());
                            task.results.push(result);
                        }
                    }
                    _ => {
                        if let Some(subtask) = subtasks.iter_mut().find(|s| s.id == subtask_id) {
                            subtask.status = TaskStatus::Failed("Execution error".to_string());
                        }
                    }
                }

                if let Some(pb) = &progress {
                    pb.inc(1);
                }
            }
        }
        OrchestrationStrategy::Sequential => {
            // Execute subtasks one by one
            for subtask in &mut subtasks {
                let agent = agents
                    .iter()
                    .find(|a| a.id == subtask.assigned_agent)
                    .cloned();

                if let Some(agent) = agent {
                    match execute_subtask(subtask.clone(), agent).await {
                        Ok(result) => {
                            subtask.status = TaskStatus::Completed;
                            subtask.result = Some(result.clone());
                            task.results.push(result);
                        }
                        Err(e) => {
                            subtask.status = TaskStatus::Failed(e.to_string());
                            // Stop on first failure in sequential mode
                            break;
                        }
                    }
                }

                if let Some(pb) = &progress {
                    pb.inc(1);
                }
            }
        }
        OrchestrationStrategy::Adaptive => {
            // Execute exploration phase first
            let exploration_count = 3.min(subtasks.len());
            let mut best_approach = None;

            for subtask in subtasks.iter_mut().take(exploration_count) {
                let agent = agents
                    .iter()
                    .find(|a| a.id == subtask.assigned_agent)
                    .cloned();

                if let Some(agent) = agent {
                    if let Ok(result) = execute_subtask(subtask.clone(), agent).await {
                        subtask.status = TaskStatus::Completed;
                        subtask.result = Some(result.clone());
                        task.results.push(result);

                        // Determine best approach (simplified)
                        if best_approach.is_none() {
                            best_approach = Some(subtask.id.clone());
                        }
                    }
                }

                if let Some(pb) = &progress {
                    pb.inc(1);
                }
            }

            // Execute remaining tasks with best approach
            // (Simplified - in real implementation would adapt based on results)
            for subtask in subtasks.iter_mut().skip(exploration_count) {
                let agent = agents
                    .iter()
                    .find(|a| a.id == subtask.assigned_agent)
                    .cloned();

                if let Some(agent) = agent {
                    if let Ok(result) = execute_subtask(subtask.clone(), agent).await {
                        subtask.status = TaskStatus::Completed;
                        subtask.result = Some(result.clone());
                        task.results.push(result);
                    }
                }

                if let Some(pb) = &progress {
                    pb.inc(1);
                }
            }
        }
        OrchestrationStrategy::Consensus => {
            // Execute all subtasks and build consensus
            let mut all_results = Vec::new();

            for subtask in &mut subtasks {
                let agent = agents
                    .iter()
                    .find(|a| a.id == subtask.assigned_agent)
                    .cloned();

                if let Some(agent) = agent {
                    if let Ok(result) = execute_subtask(subtask.clone(), agent).await {
                        subtask.status = TaskStatus::Completed;
                        subtask.result = Some(result.clone());
                        all_results.push(result);
                    }
                }

                if let Some(pb) = &progress {
                    pb.inc(1);
                }
            }

            // Build consensus result
            if !all_results.is_empty() {
                let consensus_result = build_consensus(&all_results);
                task.results.push(consensus_result);
            }
        }
    }

    if let Some(pb) = progress {
        pb.finish_with_message("Task execution complete");
    }

    // Update task status
    task.completed_at = Some(Utc::now());
    task.status = if subtasks
        .iter()
        .any(|s| matches!(s.status, TaskStatus::Failed(_)))
    {
        TaskStatus::Failed("Some subtasks failed".to_string())
    } else {
        TaskStatus::Completed
    };

    // Save task results
    save_task_results(&task, output).await?;

    // Display results
    display_task_results(&task, &subtasks, output);

    Ok(())
}

async fn execute_background(
    mut task: Task,
    subtasks: Vec<SubTask>,
    agents: Vec<crate::commands::spawn::Agent>,
    config: &Config,
    output: &OutputHandler,
) -> Result<()> {
    task.started_at = Some(Utc::now());
    task.status = TaskStatus::Running;
    task.subtasks = subtasks;

    // Save task for background execution
    save_task(&task).await?;

    output.success(&format!(
        "Task '{}' submitted for background execution",
        task.id
    ));

    output.info("Monitor task progress with:");
    output.list(
        &[
            format!("ruv-swarm monitor --filter task:{}", task.id),
            format!("ruv-swarm status --detailed"),
        ],
        false,
    );

    Ok(())
}

async fn execute_subtask(
    subtask: SubTask,
    agent: crate::commands::spawn::Agent,
) -> Result<TaskResult> {
    // Simulate subtask execution
    let start_time = std::time::Instant::now();

    // Simulate work based on agent type
    let duration = match agent.agent_type.as_str() {
        "researcher" => Duration::from_millis(1500),
        "coder" => Duration::from_millis(2000),
        "analyst" => Duration::from_millis(1800),
        _ => Duration::from_millis(1000),
    };

    tokio::time::sleep(duration).await;

    let execution_time = start_time.elapsed().as_millis() as u64;

    Ok(TaskResult {
        agent_id: agent.id,
        subtask_id: Some(subtask.id),
        success: true,
        output: serde_json::json!({
            "description": subtask.description,
            "agent_type": agent.agent_type,
            "execution_time_ms": execution_time,
            "result": "Simulated result"
        }),
        execution_time_ms: execution_time,
        timestamp: Utc::now(),
    })
}

fn build_consensus(results: &[TaskResult]) -> TaskResult {
    // Simplified consensus building
    TaskResult {
        agent_id: "consensus".to_string(),
        subtask_id: None,
        success: true,
        output: serde_json::json!({
            "consensus": "Combined result from all agents",
            "agent_count": results.len(),
            "agreement_level": 0.85
        }),
        execution_time_ms: results.iter().map(|r| r.execution_time_ms).sum::<u64>()
            / results.len() as u64,
        timestamp: Utc::now(),
    }
}

async fn save_task(task: &Task) -> Result<()> {
    let tasks_dir = directories::ProjectDirs::from("com", "ruv-fann", "ruv-swarm")
        .map(|dirs| dirs.data_local_dir().join("tasks"))
        .unwrap_or_else(|| Path::new("./tasks").to_path_buf());

    std::fs::create_dir_all(&tasks_dir)?;

    let task_file = tasks_dir.join(format!("{}.json", task.id));
    let content = serde_json::to_string_pretty(task)?;
    std::fs::write(task_file, content)?;

    Ok(())
}

async fn save_task_results(task: &Task, output: &OutputHandler) -> Result<()> {
    let results_dir = directories::ProjectDirs::from("com", "ruv-fann", "ruv-swarm")
        .map(|dirs| dirs.data_local_dir().join("results"))
        .unwrap_or_else(|| Path::new("./results").to_path_buf());

    std::fs::create_dir_all(&results_dir)?;

    let result_file = results_dir.join(format!("{}.json", task.id));
    let content = serde_json::to_string_pretty(task)?;
    std::fs::write(&result_file, content)?;

    output.info(&format!("Results saved to {:?}", result_file));

    Ok(())
}

fn display_task_results(task: &Task, subtasks: &[SubTask], output: &OutputHandler) {
    output.section("Task Results");

    let duration = task
        .completed_at
        .zip(task.started_at)
        .map(|(end, start)| end - start)
        .map(|d| format!("{}s", d.num_seconds()))
        .unwrap_or_else(|| "N/A".to_string());

    output.key_value(&[
        ("Task ID".to_string(), task.id.clone()),
        ("Status".to_string(), format!("{:?}", task.status)),
        ("Duration".to_string(), duration),
        ("Subtasks".to_string(), subtasks.len().to_string()),
        (
            "Successful".to_string(),
            subtasks
                .iter()
                .filter(|s| matches!(s.status, TaskStatus::Completed))
                .count()
                .to_string(),
        ),
    ]);

    if !task.results.is_empty() {
        output.section("Execution Summary");

        let avg_time = task
            .results
            .iter()
            .map(|r| r.execution_time_ms)
            .sum::<u64>()
            / task.results.len() as u64;
        let success_rate = task.results.iter().filter(|r| r.success).count() as f32
            / task.results.len() as f32
            * 100.0;

        output.key_value(&[
            (
                "Average Execution Time".to_string(),
                format!("{}ms", avg_time),
            ),
            ("Success Rate".to_string(), format!("{:.1}%", success_rate)),
        ]);
    }
}

async fn load_current_swarm(output: &OutputHandler) -> Result<crate::commands::init::SwarmInit> {
    let config_dir = directories::ProjectDirs::from("com", "ruv-fann", "ruv-swarm")
        .map(|dirs| dirs.data_local_dir().to_path_buf())
        .unwrap_or_else(|| Path::new(".").to_path_buf());

    let current_file = config_dir.join("current-swarm.json");

    if !current_file.exists() {
        output.error("No active swarm found. Run 'ruv-swarm init' first.");
        return Err(anyhow::anyhow!("No active swarm"));
    }

    let content = std::fs::read_to_string(current_file)?;
    serde_json::from_str(&content).context("Failed to parse swarm configuration")
}

async fn get_available_agents(
    swarm_config: &crate::commands::init::SwarmInit,
) -> Result<Vec<crate::commands::spawn::Agent>> {
    let agents_file = get_agents_file(swarm_config)?;

    if agents_file.exists() {
        let content = std::fs::read_to_string(&agents_file)?;
        let agents: Vec<crate::commands::spawn::Agent> =
            serde_json::from_str(&content).unwrap_or_default();

        // Filter for available agents (Ready or Idle status)
        Ok(agents
            .into_iter()
            .filter(|a| {
                matches!(
                    a.status,
                    crate::commands::spawn::AgentStatus::Ready
                        | crate::commands::spawn::AgentStatus::Idle
                )
            })
            .collect())
    } else {
        Ok(Vec::new())
    }
}

fn get_agents_file(swarm_config: &crate::commands::init::SwarmInit) -> Result<std::path::PathBuf> {
    let config_dir = directories::ProjectDirs::from("com", "ruv-fann", "ruv-swarm")
        .map(|dirs| dirs.data_local_dir().to_path_buf())
        .unwrap_or_else(|| Path::new(".").to_path_buf());

    Ok(config_dir.join(format!("agents-{}.json", swarm_config.swarm_id)))
}
