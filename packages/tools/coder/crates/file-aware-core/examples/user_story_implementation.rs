//! Example: User Story Implementation with SAFe-SPARC Integration
//! 
//! Shows how user stories flow from SAFe PI planning through SPARC methodology
//! with quality gates and ML-powered code generation.

use file_aware_core::{SafeSparcIntegration, UserStory, Priority, ImplementationStatus, RiskLevel};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting SAFe-SPARC User Story Implementation Example...");
    
    // Create SAFe-SPARC integration
    let integration = SafeSparcIntegration::new()?;
    
    // Example user story from SAFe PI planning
    let user_story = UserStory {
        id: "US-001".to_string(),
        title: "Implement User Authentication API".to_string(),
        description: "Create a secure REST API endpoint for user authentication with JWT tokens, password hashing, and rate limiting".to_string(),
        acceptance_criteria: vec![
            "API accepts username/password and returns JWT token".to_string(),
            "Passwords are hashed using bcrypt".to_string(),
            "Rate limiting prevents brute force attacks".to_string(),
            "JWT tokens expire after 24 hours".to_string(),
            "API returns appropriate HTTP status codes".to_string(),
        ],
        story_points: 8,
        priority: Priority::High,
        team_id: "backend-team".to_string(),
        objective_id: "OBJ-001".to_string(),
        
        // SPARC integration fields
        sparc_project: None,
        current_phase: file_aware_core::SPARCPhase::Specification,
        implementation_status: ImplementationStatus::NotStarted,
        
        // Quality metrics
        quality_score: 0.0,
        complexity_estimate: 0.0,
        risk_level: RiskLevel::Medium,
        
        // Technical details
        affected_files: vec![
            "src/auth/controller.rs".to_string(),
            "src/auth/service.rs".to_string(),
            "src/auth/model.rs".to_string(),
            "src/middleware/rate_limit.rs".to_string(),
        ],
        dependencies: vec![
            "JWT library".to_string(),
            "bcrypt library".to_string(),
            "Rate limiting middleware".to_string(),
        ],
        estimated_effort: 0.0,
    };
    
    println!("📋 Processing User Story: {}", user_story.title);
    println!("   Story Points: {}", user_story.story_points);
    println!("   Priority: {:?}", user_story.priority);
    println!("   Team: {}", user_story.team_id);
    println!("   Acceptance Criteria: {} items", user_story.acceptance_criteria.len());
    
    // Process user story through SAFe-SPARC integration
    println!("\n🔄 Starting SPARC Implementation...");
    let sparc_project = integration.process_user_story(user_story.clone()).await?;
    
    println!("✅ SPARC Project Created:");
    println!("   Project ID: {}", sparc_project.id);
    println!("   Domain: {}", sparc_project.domain);
    println!("   Complexity: {:?}", sparc_project.complexity);
    println!("   Current Phase: {:?}", sparc_project.current_phase);
    println!("   Estimated Completion: {}", 
        chrono::DateTime::from_timestamp(sparc_project.estimated_completion, 0)
            .unwrap()
            .format("%Y-%m-%d %H:%M:%S"));
    
    // Get implementation progress
    println!("\n📊 Checking Implementation Progress...");
    let progress = integration.get_story_progress(user_story.id.clone()).await?;
    
    println!("📈 Progress Report:");
    println!("   Current Phase: {:?}", progress.current_phase);
    println!("   Phases Completed: {}/{}", progress.phases_completed, progress.total_phases);
    println!("   Overall Quality Score: {:.2}", progress.overall_quality_score);
    println!("   Quality Gates Passed: {}", progress.quality_gates_passed);
    
    // Update story status based on progress
    let new_status = if progress.phases_completed >= 5 {
        ImplementationStatus::Completed
    } else if progress.phases_completed > 0 {
        ImplementationStatus::InProgress
    } else {
        ImplementationStatus::NotStarted
    };
    
    println!("\n🔄 Updating Story Status...");
    integration.update_story_status(user_story.id.clone(), new_status).await?;
    println!("   New Status: {:?}", new_status);
    
    // Show what happens in each SPARC phase
    println!("\n🎯 SPARC Phase Breakdown:");
    println!("   1. Specification: Requirements analysis and quality check");
    println!("   2. Pseudocode: Algorithm design and complexity analysis");
    println!("   3. Architecture: Component design with quality gates");
    println!("   4. Refinement: Code optimization and linting");
    println!("   5. Completion: Production-ready code with final quality gates");
    
    println!("\n🔍 Quality Gates at Each Phase:");
    println!("   • Code quality score ≥ 0.8");
    println!("   • AI mistakes detected and fixed");
    println!("   • Linting issues resolved");
    println!("   • Complexity metrics within thresholds");
    println!("   • Oxlint compliance (zero warnings)");
    
    println!("\n🤖 ML-Powered Analysis:");
    println!("   • Automatic complexity assessment");
    println!("   • AI mistake detection (stubs, lazy patterns)");
    println!("   • Code littering analysis");
    println!("   • Risk factor identification");
    println!("   • Implementation suggestions");
    
    println!("\n💾 Database Integration:");
    println!("   • Phase results stored in @claude-zen/database");
    println!("   • Quality metrics tracking over time");
    println!("   • Progress monitoring and reporting");
    println!("   • Integration with SAFe dashboard");
    
    println!("\n🎉 User Story Implementation Complete!");
    println!("   The file-aware core has:");
    println!("   • Analyzed the user story complexity");
    println!("   • Created a SPARC project for implementation");
    println!("   • Started systematic development with quality gates");
    println!("   • Integrated with SAFe PI planning");
    println!("   • Stored progress in the database");
    
    Ok(())
}
