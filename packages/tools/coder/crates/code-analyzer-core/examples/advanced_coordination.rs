//! Example: Advanced Coordination with Workflow Management and Agent Orchestration
//! 
//! This example demonstrates the full coordination system including:
//! - SPARC + SAFe + Team integration
//! - Workflow dependency management
//! - Agent orchestration and task routing
//! - Parallel project execution
//! - Health monitoring and load balancing

use code_analyzer_core::{
    CodeAnalysisEngine, 
    coordination::{
        CoordinatedProject, CoordinatedPhaseTransition, KanbanStatus,
        AgentInfo, AgentStatus, WorkflowStatus, LoadBalancingStrategy
    },
    types::{StoryPriority, StoryStatus}
};
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    println!("🚀 Starting Advanced Coordination Example...");
    println!("Demonstrating Workflow Management + Agent Orchestration\n");

    // Initialize the coordination engine
    let mut engine = CodeAnalysisEngine::new();
    
    // Example: Create multiple coordinated projects with dependencies
    println!("📋 Creating Coordinated Projects with Dependencies...");
    
    // Project 1: Database Schema (no dependencies)
    let db_project = engine.start_coordinated_project(
        "Design Database Schema",
        "Create normalized database schema for user management system",
        "data-team",
        5, // 5 story points
        StoryPriority::High,
    ).await?;
    
    // Project 2: API Design (depends on database schema)
    let api_project = engine.start_coordinated_project(
        "Design REST API",
        "Design RESTful API endpoints for user management",
        "api-team",
        8, // 8 story points
        StoryPriority::High,
    ).await?;
    
    // Project 3: Frontend (depends on API design)
    let frontend_project = engine.start_coordinated_project(
        "Build User Interface",
        "Create React-based user management interface",
        "frontend-team",
        13, // 13 story points
        StoryPriority::Medium,
    ).await?;
    
    println!("✅ Created {} projects", 3);
    println!();

    // Example: Set up workflow dependencies
    println!("🔗 Setting Up Workflow Dependencies...");
    
    // API depends on Database
    engine.coordination_engine.add_workflow_dependency(&api_project.id, &db_project.id)?;
    println!("   📊 API project depends on Database project");
    
    // Frontend depends on API
    engine.coordination_engine.add_workflow_dependency(&frontend_project.id, &api_project.id)?;
    println!("   📊 Frontend project depends on API project");
    
    // Get execution order
    let execution_order = engine.coordination_engine.get_workflow_execution_order()?;
    println!("   📋 Execution order: {:?}", execution_order);
    println!();

    // Example: Queue projects for workflow execution
    println!("📥 Queuing Projects for Workflow Execution...");
    
    engine.coordination_engine.queue_project_for_execution(&db_project.id)?;
    engine.coordination_engine.queue_project_for_execution(&api_project.id)?;
    engine.coordination_engine.queue_project_for_execution(&frontend_project.id)?;
    
    println!("   ✅ All projects queued for execution");
    println!();

    // Example: Start projects in dependency order
    println!("▶️ Starting Projects in Dependency Order...");
    
    // Start database project (no dependencies)
    let started_db = engine.coordination_engine.start_next_workflow_project()?;
    if let Some(project_id) = &started_db {
        println!("   🚀 Started project: {} (Database Schema)", project_id);
    }
    
    // Check workflow status
    let workflow_status = engine.coordination_engine.get_workflow_status();
    println!("   📊 Workflow Status:");
    println!("      Total projects: {}", workflow_status.total_projects);
    println!("      Queued: {}", workflow_status.queued_projects);
    println!("      Running: {}", workflow_status.running_projects);
    println!("      Completed: {}", workflow_status.completed_projects);
    println!("      Available slots: {}/{}", workflow_status.available_slots, workflow_status.parallel_limit);
    println!();

    // Example: Register agents for task execution
    println!("🤖 Registering Agents for Task Execution...");
    
    let db_agent = AgentInfo {
        id: "db-agent-001".to_string(),
        name: "Database Design Agent".to_string(),
        capabilities: vec!["database".to_string(), "schema".to_string(), "normalization".to_string()],
        status: AgentStatus::Available,
        current_load: 0,
        max_load: 3,
    };
    
    let api_agent = AgentInfo {
        id: "api-agent-001".to_string(),
        name: "API Design Agent".to_string(),
        capabilities: vec!["api".to_string(), "rest".to_string(), "design".to_string()],
        status: AgentStatus::Available,
        current_load: 0,
        max_load: 2,
    };
    
    let frontend_agent = AgentInfo {
        id: "frontend-agent-001".to_string(),
        name: "Frontend Development Agent".to_string(),
        capabilities: vec!["react".to_string(), "ui".to_string(), "typescript".to_string()],
        status: AgentStatus::Available,
        current_load: 0,
        max_load: 2,
    };
    
    engine.coordination_engine.register_agent(db_agent)?;
    engine.coordination_engine.register_agent(api_agent)?;
    engine.coordination_engine.register_agent(frontend_agent)?;
    
    println!("   ✅ Registered 3 agents with different capabilities");
    println!();

    // Example: Assign tasks to agents
    println!("📋 Assigning Tasks to Agents...");
    
    let db_task_id = "db-schema-task-001";
    let db_agent_id = engine.coordination_engine.assign_task_to_agent(
        db_task_id,
        &["database".to_string(), "schema".to_string()]
    )?;
    println!("   📊 Database task assigned to agent: {}", db_agent_id);
    
    let api_task_id = "api-design-task-001";
    let api_agent_id = engine.coordination_engine.assign_task_to_agent(
        api_task_id,
        &["api".to_string(), "rest".to_string()]
    )?;
    println!("   📊 API task assigned to agent: {}", api_agent_id);
    
    let frontend_task_id = "frontend-ui-task-001";
    let frontend_agent_id = engine.coordination_engine.assign_task_to_agent(
        frontend_task_id,
        &["react".to_string(), "ui".to_string()]
    )?;
    println!("   📊 Frontend task assigned to agent: {}", frontend_agent_id);
    println!();

    // Example: Monitor agent health
    println!("💓 Monitoring Agent Health...");
    
    let db_health = engine.coordination_engine.get_agent_health(&db_agent_id)?;
    let api_health = engine.coordination_engine.get_agent_health(&api_agent_id)?;
    let frontend_health = engine.coordination_engine.get_agent_health(&frontend_agent_id)?;
    
    println!("   🟢 Database Agent Health:");
    println!("      Status: {:?}", db_health.status);
    println!("      Load: {}/{}", db_health.current_load, db_health.max_load);
    println!("      Health Score: {:.2}", db_health.health_score);
    
    println!("   🟢 API Agent Health:");
    println!("      Status: {:?}", api_health.status);
    println!("      Load: {}/{}", api_health.current_load, api_health.max_load);
    println!("      Health Score: {:.2}", api_health.health_score);
    
    println!("   🟢 Frontend Agent Health:");
    println!("      Status: {:?}", frontend_health.status);
    println!("      Load: {}/{}", frontend_health.current_load, frontend_health.max_load);
    println!("      Health Score: {:.2}", frontend_health.health_score);
    println!();

    // Example: Complete database project and advance workflow
    println!("✅ Completing Database Project and Advancing Workflow...");
    
    // Complete database project
    engine.coordination_engine.complete_workflow_project(&db_project.id)?;
    println!("   🎯 Database project completed");
    
    // Complete database task
    engine.coordination_engine.complete_agent_task(db_task_id)?;
    println!("   🎯 Database task completed");
    
    // Check if API project can now start
    let api_can_start = engine.coordination_engine.can_project_start_in_workflow(&api_project.id);
    println!("   📊 API project can start: {}", api_can_start);
    
    // Start API project
    let started_api = engine.coordination_engine.start_next_workflow_project()?;
    if let Some(project_id) = &started_api {
        println!("   🚀 Started project: {} (API Design)", project_id);
    }
    
    // Check updated workflow status
    let updated_status = engine.coordination_engine.get_workflow_status();
    println!("   📊 Updated Workflow Status:");
    println!("      Queued: {}", updated_status.queued_projects);
    println!("      Running: {}", updated_status.running_projects);
    println!("      Completed: {}", updated_status.completed_projects);
    println!();

    // Example: Advance SPARC phases with team coordination
    println!("🔄 Advancing SPARC Phases with Team Coordination...");
    
    // Advance database project through phases
    let db_transition1 = engine.advance_coordinated_phase(&db_project.id, "/tmp/db-schema").await?;
    println!("   📝 Database: {} → {:?}", db_transition1.sparc_transition.from_phase, db_transition1.sparc_transition.to_phase);
    println!("      Kanban Status: {:?}", db_transition1.kanban_status);
    println!("      Team Notified: {}", db_transition1.team_notified);
    
    let db_transition2 = engine.advance_coordinated_phase(&db_project.id, "/tmp/db-schema").await?;
    println!("   📝 Database: {} → {:?}", db_transition2.sparc_transition.from_phase, db_transition2.sparc_transition.to_phase);
    println!("      Kanban Status: {:?}", db_transition2.kanban_status);
    
    let db_transition3 = engine.advance_coordinated_phase(&db_project.id, "/tmp/db-schema").await?;
    println!("   📝 Database: {} → {:?}", db_transition3.sparc_transition.from_phase, db_transition3.sparc_transition.to_phase);
    println!("      Kanban Status: {:?}", db_transition3.kanban_status);
    
    let db_transition4 = engine.advance_coordinated_phase(&db_project.id, "/tmp/db-schema").await?;
    println!("   📝 Database: {} → {:?}", db_transition4.sparc_transition.from_phase, db_transition4.sparc_transition.to_phase);
    println!("      Kanban Status: {:?}", db_transition4.kanban_status);
    println!();

    // Example: Check team Kanban boards
    println!("📋 Checking Team Kanban Boards...");
    
    let data_team_board = engine.coordination_engine.get_team_kanban_board("data-team")?;
    let api_team_board = engine.coordination_engine.get_team_kanban_board("api-team")?;
    let frontend_team_board = engine.coordination_engine.get_team_kanban_board("frontend-team")?;
    
    println!("   📊 Data Team Board: {} columns", data_team_board.columns.len());
    println!("   📊 API Team Board: {} columns", api_team_board.columns.len());
    println!("   📊 Frontend Team Board: {} columns", frontend_team_board.columns.len());
    println!();

    // Example: Get team assignments
    println!("👥 Team Project Assignments...");
    
    let team_assignments = engine.coordination_engine.get_team_assignments();
    for (project_id, team_id) in team_assignments {
        println!("   📋 Project {} → Team {}", project_id, team_id);
    }
    println!();

    println!("🎉 Advanced Coordination Example Completed!");
    println!();
    println!("📋 Summary of What Was Demonstrated:");
    println!("   • Multi-project coordination with dependencies");
    println!("   • Workflow management and parallel execution");
    println!("   • Agent orchestration and task routing");
    println!("   • Health monitoring and load balancing");
    println!("   • SPARC phase advancement with team coordination");
    println!("   • Kanban workflow visualization");
    println!("   • Dependency resolution and execution ordering");
    println!();
    println!("🔗 Next Steps:");
    println!("   • Implement real agent communication protocols");
    println!("   • Add persistent storage for workflow state");
    println!("   • Integrate with external monitoring systems");
    println!("   • Add advanced load balancing strategies");
    println!("   • Implement team handoff automation");

    Ok(())
}


