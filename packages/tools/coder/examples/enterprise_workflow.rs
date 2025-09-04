use code_analyzer_core::{
    CodeAnalysisEngine, SPARCIntegration, QualityGateEngine,
    types::*, project_context::ProjectContext
};
use anyhow::Result;
use tracing::{info, warn, error};

/// Enterprise workflow example demonstrating SPARC methodology with quality gates
#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    info!("🚀 Starting Claude Code Zen Enterprise Workflow");
    
    // 1. Initialize the code analysis engine
    let mut analysis_engine = CodeAnalysisEngine::new();
    info!("✅ Code analysis engine initialized");
    
    // 2. Initialize SPARC methodology integration
    let mut sparc_integration = SPARCIntegration::new();
    info!("✅ SPARC methodology integration initialized");
    
    // 3. Initialize quality gates
    let quality_gates = QualityGateEngine::new();
    info!("✅ Quality gates initialized");
    
    // 4. Create a new SPARC project
    let project = sparc_integration.create_project(
        "API Refactor Project",
        "Refactor legacy REST API to use modern patterns and improve performance"
    )?;
    info!("📋 Created SPARC project: {} ({})", project.name, project.id);
    
    // 5. Set up project context
    let context = ProjectContext::new("./src")?;
    info!("📁 Project context initialized for: ./src");
    
    // 6. Run initial quality gates before starting development
    info!("🔍 Running initial quality gates...");
    let quality_result = quality_gates.run_all_gates(&context).await?;
    
    match quality_result.status {
        QualityGateStatus::Passed => {
            info!("✅ Quality gates passed! Score: {:.1}%", quality_result.score);
        }
        QualityGateStatus::Warning => {
            warn!("⚠️  Quality gates warning! Score: {:.1}%", quality_result.score);
            for issue in &quality_result.warnings {
                warn!("  - {}: {}", issue.rule, issue.message);
            }
        }
        QualityGateStatus::Failed => {
            error!("❌ Quality gates failed! Score: {:.1}%", quality_result.score);
            for issue in &quality_result.errors {
                error!("  - {}: {}", issue.rule, issue.message);
            }
            return Err(anyhow::anyhow!("Cannot proceed with failed quality gates"));
        }
        QualityGateStatus::Skipped => {
            info!("⏭️  Quality gates skipped");
        }
    }
    
    // 7. Advance to next SPARC phase (Specification → Pseudocode)
    info!("🔄 Advancing SPARC phase from Specification to Pseudocode...");
    let phase_transition = sparc_integration.advance_phase(&project.id, &context).await?;
    info!("✅ Phase transition completed: {:?} → {:?}", 
          phase_transition.from_phase, phase_transition.to_phase);
    
    // 8. Run comprehensive code analysis
    info!("🔍 Running comprehensive code analysis...");
    let analysis_result = analysis_engine.analyze_project("./src").await?;
    info!("✅ Code analysis completed");
    info!("  - Security issues: {}", analysis_result.security_scan.len());
    info!("  - Quality score: {:.1}%", analysis_result.quality_results.score);
    info!("  - ML confidence: {:.1}%", analysis_result.ml_analysis.confidence_score);
    
    // 9. Check for AI-generated code patterns
    if !analysis_result.ml_analysis.ai_pattern_issues.is_empty() {
        warn!("🤖 AI-generated code patterns detected:");
        for issue in &analysis_result.ml_analysis.ai_pattern_issues {
            warn!("  - {}: {}", issue.rule, issue.message);
            if let Some(suggestion) = &issue.suggestion {
                info!("    💡 Suggestion: {}", suggestion);
            }
        }
    }
    
    // 10. Get project health status
    let health = sparc_integration.get_project_health(&project.id)?;
    info!("📊 Project Health Status:");
    info!("  - Current phase: {:?}", health.current_phase);
    info!("  - Phase progress: {:.1}%", health.phase_progress * 100.0);
    info!("  - Quality score: {:.1}%", health.quality_score * 100.0);
    info!("  - Last updated: {}", health.last_updated);
    
    // 11. Demonstrate quality gate enforcement
    info!("🔒 Demonstrating quality gate enforcement...");
    
    // Simulate code changes that would trigger quality gates
    let test_context = ProjectContext::new("./test-code")?;
    let test_quality_result = quality_gates.run_all_gates(&test_context).await?;
    
    match test_quality_result.status {
        QualityGateStatus::Passed => {
            info!("✅ Test code passes quality gates - can proceed to next phase");
        }
        QualityGateStatus::Warning => {
            warn!("⚠️  Test code has warnings - review before proceeding");
        }
        QualityGateStatus::Failed => {
            error!("❌ Test code fails quality gates - must fix before proceeding");
            return Err(anyhow::anyhow!("Quality gates enforce code standards"));
        }
        QualityGateStatus::Skipped => {
            info!("⏭️  Test code quality gates skipped");
        }
    }
    
    // 12. Show enterprise compliance features
    info!("🏢 Enterprise Compliance Features:");
    info!("  - SPARC methodology enforcement: ✅");
    info!("  - Quality gate integration: ✅");
    info!("  - Security scanning: ✅");
    info!("  - ML pattern detection: ✅");
    info!("  - Audit trail: ✅");
    info!("  - Performance monitoring: ✅");
    
    // 13. Demonstrate rollback capability
    info!("🔄 Demonstrating phase rollback capability...");
    let rollback_transition = sparc_integration.rollback_phase(&project.id).await?;
    info!("✅ Rollback completed: {:?} → {:?}", 
          rollback_transition.from_phase, rollback_transition.to_phase);
    
    // 14. Final project status
    let final_health = sparc_integration.get_project_health(&project.id)?;
    info!("📋 Final Project Status:");
    info!("  - Project: {}", project.name);
    info!("  - Current phase: {:?}", final_health.current_phase);
    info!("  - Overall quality: {:.1}%", final_health.quality_score * 100.0);
    
    info!("🎉 Enterprise workflow demonstration completed successfully!");
    info!("💡 The coder system now provides:");
    info!("   • Automated quality enforcement");
    info!("   • SPARC methodology management");
    info!("   • AI-generated code detection");
    info!("   • Enterprise compliance tracking");
    info!("   • Performance and security monitoring");
    
    Ok(())
}

/// Helper function to demonstrate quality gate configuration
fn demonstrate_quality_gate_config() -> QualityGateConfig {
    QualityGateConfig {
        oxlint_enabled: true,
        eslint_enabled: true,
        custom_rules: vec![
            QualityRule {
                name: "enterprise_naming_convention".to_string(),
                description: "Enforce enterprise naming conventions".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"^[a-z][a-zA-Z0-9]*$".to_string(),
                message: "Use camelCase for variables and functions".to_string(),
                category: RuleCategory::Enterprise,
            },
            QualityRule {
                name: "security_input_validation".to_string(),
                description: "Ensure input validation is present".to_string(),
                severity: RuleSeverity::Error,
                pattern: r"function\s+\w+\([^)]*\)\s*\{[^}]*\}".to_string(),
                message: "Input validation required for all public functions".to_string(),
                category: RuleCategory::Security,
            },
        ],
        thresholds: QualityThresholds {
            max_errors: 0,
            max_warnings: 5,
            min_score: 85.0,
            max_complexity: 8.0,
            max_cognitive_complexity: 12.0,
        },
        ai_pattern_detection: true,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_enterprise_workflow_creation() {
        let engine = CodeAnalysisEngine::new();
        let sparc = SPARCIntegration::new();
        let quality = QualityGateEngine::new();
        
        assert!(engine.analyzer.is_some());
        assert!(sparc.engine.is_some());
        assert!(quality.config.ai_pattern_detection);
    }

    #[test]
    fn test_quality_gate_config() {
        let config = demonstrate_quality_gate_config();
        assert!(config.ai_pattern_detection);
        assert_eq!(config.thresholds.min_score, 85.0);
        assert!(!config.custom_rules.is_empty());
    }
}
