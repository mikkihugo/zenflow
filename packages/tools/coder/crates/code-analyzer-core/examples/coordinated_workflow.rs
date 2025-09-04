//! Example: Coordinated Workflow with SPARC, SAFe, and Teamwork Integration
//! 
//! This example demonstrates how the coordination engine integrates:
//! - SPARC 5-phase methodology
//! - SAFe 6.0 Program Increment planning
//! - Team coordination and Kanban workflows
//! - Quality gates and phase transitions

use code_analyzer_core::{
    CodeAnalysisEngine, 
    coordination::{CoordinatedProject, CoordinatedPhaseTransition, KanbanStatus},
    types::{StoryPriority, StoryStatus}
};
use anyhow::Result;

#[tokio::main]
async fn main() -> Result<()> {
    println!("🚀 Starting Coordinated Workflow Example...");
    println!("Integrating SPARC, SAFe, and Teamwork Coordination\n");

    // Initialize the coordination engine
    let mut engine = CodeAnalysisEngine::new();
    
    // Example: Start a coordinated project
    println!("📋 Starting Coordinated Project...");
    let project = engine.start_coordinated_project(
        "Implement User Authentication System",
        "Build secure user authentication with OAuth2, JWT tokens, and role-based access control",
        "backend-team",
        8, // 8 story points
        StoryPriority::High,
    ).await?;
    
    println!("✅ Project created: {}", project.name);
    println!("   Team: {}", project.team_id);
    println!("   Current SPARC Phase: {:?}", project.sparc_project.current_phase);
    println!("   Kanban Status: {:?}", project.kanban_status);
    println!("   User Story Status: {:?}", project.user_story.status);
    println!();

    // Example: Advance through SPARC phases with team coordination
    println!("🔄 Advancing Through SPARC Phases...");
    
    // Phase 1: Specification -> Pseudocode
    println!("📝 Phase 1: Specification → Pseudocode");
    let transition1 = engine.advance_coordinated_phase(&project.id, "/tmp/auth-system").await?;
    println!("   ✅ Advanced to: {:?}", transition1.sparc_transition.to_phase);
    println!("   📊 Kanban Status: {:?}", transition1.kanban_status);
    println!("   👥 Team Notified: {}", transition1.team_notified);
    println!("   🔄 Handoff Required: {}", transition1.handoff_required);
    println!();

    // Phase 2: Pseudocode -> Architecture
    println!("🏗️ Phase 2: Pseudocode → Architecture");
    let transition2 = engine.advance_coordinated_phase(&project.id, "/tmp/auth-system").await?;
    println!("   ✅ Advanced to: {:?}", transition2.sparc_transition.to_phase);
    println!("   📊 Kanban Status: {:?}", transition2.kanban_status);
    println!("   👥 Team Notified: {}", transition2.team_notified);
    println!("   🔄 Handoff Required: {}", transition2.handoff_required);
    println!();

    // Phase 3: Architecture -> Refinement
    println!("🔧 Phase 3: Architecture → Refinement");
    let transition3 = engine.advance_coordinated_phase(&project.id, "/tmp/auth-system").await?;
    println!("   ✅ Advanced to: {:?}", transition3.sparc_transition.to_phase);
    println!("   📊 Kanban Status: {:?}", transition3.kanban_status);
    println!("   👥 Team Notified: {}", transition3.team_notified);
    println!("   🔄 Handoff Required: {}", transition3.handoff_required);
    println!();

    // Phase 4: Refinement -> Completion
    println!("🎯 Phase 4: Refinement → Completion");
    let transition4 = engine.advance_coordinated_phase(&project.id, "/tmp/auth-system").await?;
    println!("   ✅ Advanced to: {:?}", transition4.sparc_transition.to_phase);
    println!("   📊 Kanban Status: {:?}", transition4.kanban_status);
    println!("   👥 Team Notified: {}", transition4.team_notified);
    println!("   🔄 Handoff Required: {}", transition4.handoff_required);
    println!();

    // Example: Check team Kanban board
    println!("📋 Checking Team Kanban Board...");
    let kanban_board = engine.get_team_kanban_status("backend-team").await?;
    println!("   ✅ Kanban board retrieved for backend-team");
    println!("   📊 Board columns: {:?}", kanban_board.columns.keys().collect::<Vec<_>>());
    println!();

    // Example: Quality gates integration
    println!("🔍 Running Quality Gates...");
    let quality_result = engine.run_quality_gates("/tmp/auth-system").await?;
    println!("   ✅ Quality gates completed");
    println!("   📊 Status: {:?}", quality_result.status);
    println!("   ⚠️ Issues: {}", quality_result.total_issues);
    println!("   🎯 AI Pattern Issues: {}", quality_result.ai_pattern_issues.len());
    println!();

    println!("🎉 Coordinated Workflow Example Completed!");
    println!();
    println!("📋 Summary of What Was Demonstrated:");
    println!("   • SPARC methodology phase transitions");
    println!("   • SAFe user story management");
    println!("   • Team coordination and Kanban workflows");
    println!("   • Quality gate integration");
    println!("   • Event-driven coordination");
    println!("   • Phase-to-Kanban status mapping");
    println!("   • Team notification and handoff management");
    println!();
    println!("🔗 Next Steps:");
    println!("   • Implement agent orchestration for task execution");
    println!("   • Add team capacity and velocity tracking");
    println!("   • Integrate with external EventBus for real coordination");
    println!("   • Add team dashboard and reporting");

    Ok(())
}


