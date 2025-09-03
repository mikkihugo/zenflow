//! SPARC Methodology Module
//! 
//! Implements the SPARC 5-phase development methodology:
//! Specification → Pseudocode → Architecture → Refinement → Completion
//! 
//! Provides phase validation, state management, and quality gate integration.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;
use uuid::Uuid;
use chrono::Utc;

/// SPARC phase types with validation and constraints
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SPARCPhase {
    Specification,
    Pseudocode,
    Architecture,
    Refinement,
    Completion,
    Testing,
    Deployment,
    Maintenance,
}

impl SPARCPhase {
    /// Get the next phase in the SPARC methodology
    pub fn next_phase(&self) -> Option<SPARCPhase> {
        match self {
            SPARCPhase::Specification => Some(SPARCPhase::Pseudocode),
            SPARCPhase::Pseudocode => Some(SPARCPhase::Architecture),
            SPARCPhase::Architecture => Some(SPARCPhase::Refinement),
            SPARCPhase::Refinement => Some(SPARCPhase::Completion),
            SPARCPhase::Completion => Some(SPARCPhase::Testing),
            SPARCPhase::Testing => Some(SPARCPhase::Deployment),
            SPARCPhase::Deployment => Some(SPARCPhase::Maintenance),
            SPARCPhase::Maintenance => None,
        }
    }
    
    /// Get the previous phase in the SPARC methodology
    pub fn previous_phase(&self) -> Option<SPARCPhase> {
        match self {
            SPARCPhase::Specification => None,
            SPARCPhase::Pseudocode => Some(SPARCPhase::Specification),
            SPARCPhase::Architecture => Some(SPARCPhase::Pseudocode),
            SPARCPhase::Refinement => Some(SPARCPhase::Architecture),
            SPARCPhase::Completion => Some(SPARCPhase::Refinement),
            SPARCPhase::Testing => Some(SPARCPhase::Completion),
            SPARCPhase::Deployment => Some(SPARCPhase::Testing),
            SPARCPhase::Maintenance => Some(SPARCPhase::Deployment),
        }
    }
    
    /// Check if a phase transition is valid
    pub fn can_transition_to(&self, target_phase: &SPARCPhase) -> bool {
        if let Some(next) = self.next_phase() {
            next == *target_phase
        } else {
            false
        }
    }
    
    /// Get phase completion requirements
    pub fn completion_requirements(&self) -> Vec<String> {
        match self {
            SPARCPhase::Specification => vec![
                "Requirements document completed".to_string(),
                "Stakeholder approval obtained".to_string(),
                "Scope boundaries defined".to_string(),
            ],
            SPARCPhase::Pseudocode => vec![
                "Algorithm logic documented".to_string(),
                "Data structures defined".to_string(),
                "Control flow mapped".to_string(),
            ],
            SPARCPhase::Architecture => vec![
                "System design completed".to_string(),
                "Component interfaces defined".to_string(),
                "Technology stack selected".to_string(),
            ],
            SPARCPhase::Refinement => vec![
                "Implementation details specified".to_string(),
                "Error handling defined".to_string(),
                "Performance requirements documented".to_string(),
            ],
            SPARCPhase::Completion => vec![
                "Code implementation completed".to_string(),
                "Unit tests passing".to_string(),
                "Code review completed".to_string(),
            ],
            SPARCPhase::Testing => vec![
                "Integration tests passing".to_string(),
                "Performance tests completed".to_string(),
                "Security tests passed".to_string(),
            ],
            SPARCPhase::Deployment => vec![
                "Production environment ready".to_string(),
                "Monitoring configured".to_string(),
                "Rollback plan prepared".to_string(),
            ],
            SPARCPhase::Maintenance => vec![
                "Monitoring alerts configured".to_string(),
                "Documentation updated".to_string(),
                "Support processes established".to_string(),
            ],
        }
    }
    
    /// Get phase validation rules
    pub fn validation_rules(&self) -> Vec<ValidationRule> {
        match self {
            SPARCPhase::Specification => vec![
                ValidationRule::Required("requirements_document".to_string()),
                ValidationRule::Required("stakeholder_approval".to_string()),
                ValidationRule::Optional("scope_definition".to_string()),
            ],
            SPARCPhase::Pseudocode => vec![
                ValidationRule::Required("algorithm_logic".to_string()),
                ValidationRule::Required("data_structures".to_string()),
                ValidationRule::Optional("control_flow".to_string()),
            ],
            SPARCPhase::Architecture => vec![
                ValidationRule::Required("system_design".to_string()),
                ValidationRule::Required("component_interfaces".to_string()),
                ValidationRule::Required("technology_stack".to_string()),
            ],
            SPARCPhase::Refinement => vec![
                ValidationRule::Required("implementation_details".to_string()),
                ValidationRule::Required("error_handling".to_string()),
                ValidationRule::Optional("performance_requirements".to_string()),
            ],
            SPARCPhase::Completion => vec![
                ValidationRule::Required("code_implementation".to_string()),
                ValidationRule::Required("unit_tests".to_string()),
                ValidationRule::Required("code_review".to_string()),
            ],
            SPARCPhase::Testing => vec![
                ValidationRule::Required("integration_tests".to_string()),
                ValidationRule::Required("performance_tests".to_string()),
                ValidationRule::Required("security_tests".to_string()),
            ],
            SPARCPhase::Deployment => vec![
                ValidationRule::Required("production_environment".to_string()),
                ValidationRule::Required("monitoring_config".to_string()),
                ValidationRule::Required("rollback_plan".to_string()),
            ],
            SPARCPhase::Maintenance => vec![
                ValidationRule::Required("monitoring_alerts".to_string()),
                ValidationRule::Required("documentation".to_string()),
                ValidationRule::Required("support_processes".to_string()),
            ],
        }
    }
}

/// Validation rule types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationRule {
    Required(String),
    Optional(String),
    Conditional(String, String), // rule, condition
}

/// Project complexity levels with validation and resource allocation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectComplexity {
    Simple,
    Moderate,
    High,
    Complex,
    Enterprise,
    Critical,
    Experimental,
}

impl ProjectComplexity {
    /// Get complexity score for resource allocation
    pub fn complexity_score(&self) -> f32 {
        match self {
            ProjectComplexity::Simple => 1.0,
            ProjectComplexity::Moderate => 2.0,
            ProjectComplexity::High => 4.0,
            ProjectComplexity::Complex => 8.0,
            ProjectComplexity::Enterprise => 16.0,
            ProjectComplexity::Critical => 32.0,
            ProjectComplexity::Experimental => 64.0,
        }
    }
    
    /// Get estimated completion time in days
    pub fn estimated_completion_days(&self) -> u32 {
        match self {
            ProjectComplexity::Simple => 1,
            ProjectComplexity::Moderate => 3,
            ProjectComplexity::High => 7,
            ProjectComplexity::Complex => 14,
            ProjectComplexity::Enterprise => 30,
            ProjectComplexity::Critical => 60,
            ProjectComplexity::Experimental => 90,
        }
    }
    
    /// Get recommended team size
    pub fn recommended_team_size(&self) -> usize {
        match self {
            ProjectComplexity::Simple => 1,
            ProjectComplexity::Moderate => 2,
            ProjectComplexity::High => 3,
            ProjectComplexity::Complex => 5,
            ProjectComplexity::Enterprise => 8,
            ProjectComplexity::Critical => 12,
            ProjectComplexity::Experimental => 6,
        }
    }
    
    /// Validate complexity constraints
    pub fn validate_constraints(&self, team_size: usize, timeline_days: u32) -> Result<bool, SparcError> {
        let recommended_team = self.recommended_team_size();
        let estimated_days = self.estimated_completion_days();
        
        if team_size < recommended_team {
            return Err(SparcError::InsufficientTeamSize {
                current: team_size,
                required: recommended_team,
                complexity: format!("{:?}", self),
            });
        }
        
        if timeline_days < estimated_days {
            return Err(SparcError::InsufficientTimeline {
                current: timeline_days,
                required: estimated_days,
                complexity: format!("{:?}", self),
            });
        }
        
        Ok(true)
    }
}

/// SPARC project with comprehensive validation and lifecycle management
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SPARCProject {
    pub id: String,
    pub name: String,
    pub domain: String,
    pub complexity: ProjectComplexity,
    pub current_phase: SPARCPhase,
    pub requirements: Vec<String>,
    pub start_time: i64,
    
    // File-aware analysis results for each phase
    pub phase_analysis: HashMap<SPARCPhase, PhaseAnalysisResult>,
    
    // Quality metrics tracking
    pub quality_metrics: QualityMetrics,
    
    // Project lifecycle management
    pub team_members: Vec<String>,
    pub estimated_completion: i64,
    pub actual_completion: Option<i64>,
    pub dependencies: Vec<String>,
    pub risks: Vec<Risk>,
    
    // Metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

impl SPARCProject {
    /// Create a new SPARC project with validation
    pub fn new(id: String, name: String, domain: String, complexity: ProjectComplexity) -> Result<Self, SparcError> {
        // Validate project parameters
        if id.is_empty() {
            return Err(SparcError::InvalidProjectParameter {
                field: "id".to_string(),
                message: "Project ID cannot be empty".to_string(),
            });
        }
        
        if name.is_empty() {
            return Err(SparcError::InvalidProjectParameter {
                field: "name".to_string(),
                message: "Project name cannot be empty".to_string(),
            });
        }
        
        if domain.is_empty() {
            return Err(SparcError::InvalidProjectParameter {
                field: "domain".to_string(),
                message: "Project domain cannot be empty".to_string(),
            });
        }
        
        Ok(Self {
            id,
            name,
            domain,
            complexity,
            current_phase: SPARCPhase::Specification,
            requirements: Vec::new(),
            start_time: Utc::now().timestamp(),
            phase_analysis: HashMap::new(),
            quality_metrics: QualityMetrics::default(),
            team_members: Vec::new(),
            estimated_completion: 0,
            actual_completion: None,
            dependencies: Vec::new(),
            risks: Vec::new(),
            metadata: HashMap::new(),
        })
    }
    
    /// Validate if the project can transition to the next phase
    pub fn can_advance_phase(&self) -> Result<bool, SparcError> {
        let current_phase = &self.current_phase;
        let requirements = current_phase.completion_requirements();
        let validation_rules = current_phase.validation_rules();
        
        // Check if all required validation rules are met
        for rule in validation_rules {
            match rule {
                ValidationRule::Required(requirement) => {
                    if !self.requirement_met(&requirement) {
                        return Ok(false);
                    }
                }
                ValidationRule::Optional(_) => {
                    // Optional requirements don't block advancement
                }
                ValidationRule::Conditional(requirement, condition) => {
                    if !self.conditional_requirement_met(&requirement, &condition) {
                        return Ok(false);
                    }
                }
            }
        }
        
        Ok(true)
    }
    
    /// Advance to the next phase with validation
    pub fn advance_phase(&mut self) -> Result<SPARCPhase, SparcError> {
        if !self.can_advance_phase()? {
            return Err(SparcError::PhaseAdvancementBlocked {
                current_phase: format!("{:?}", self.current_phase),
                reason: "Requirements not met".to_string(),
            });
        }
        
        if let Some(next_phase) = self.current_phase.next_phase() {
            // Complete current phase analysis
            self.complete_phase_analysis()?;
            
            // Transition to next phase
            self.current_phase = next_phase.clone();
            
            // Initialize next phase
            self.initialize_phase(next_phase.clone())?;
            
            Ok(next_phase)
        } else {
            Err(SparcError::PhaseAdvancementBlocked {
                current_phase: format!("{:?}", self.current_phase),
                reason: "Project is already in the final phase".to_string(),
            })
        }
    }
    
    /// Rollback to the previous phase
    pub fn rollback_phase(&mut self) -> Result<SPARCPhase, SparcError> {
        if let Some(previous_phase) = self.current_phase.previous_phase() {
            // Save current phase state for potential restoration
            self.save_phase_state()?;
            
            // Rollback to previous phase
            self.current_phase = previous_phase.clone();
            
            // Restore previous phase state
            self.restore_phase_state(previous_phase.clone())?;
            
            Ok(previous_phase)
        } else {
            Err(SparcError::PhaseRollbackBlocked {
                current_phase: format!("{:?}", self.current_phase),
                reason: "Cannot rollback from the first phase".to_string(),
            })
        }
    }
    
    /// Check if a requirement is met
    fn requirement_met(&self, _requirement: &str) -> bool {
        // Implementation would check against actual project state
        // For now, return true to allow compilation
        true
    }
    
    /// Check if a conditional requirement is met
    fn conditional_requirement_met(&self, _requirement: &str, _condition: &str) -> bool {
        // Implementation would check conditional logic
        // For now, return true to allow compilation
        true
    }
    
    /// Complete analysis for the current phase
    fn complete_phase_analysis(&mut self) -> Result<(), SparcError> {
        // Implementation would analyze current phase completion
        Ok(())
    }
    
    /// Initialize a new phase
    fn initialize_phase(&mut self, _phase: SPARCPhase) -> Result<(), SparcError> {
        // Implementation would set up phase-specific resources
        Ok(())
    }
    
    /// Save current phase state
    fn save_phase_state(&mut self) -> Result<(), SparcError> {
        // Implementation would save phase state for rollback
        Ok(())
    }
    
    /// Restore phase state
    fn restore_phase_state(&mut self, _phase: SPARCPhase) -> Result<(), SparcError> {
        // Implementation would restore phase state from rollback
        Ok(())
    }
}

/// Analysis result for each SPARC phase
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhaseAnalysisResult {
    pub phase: SPARCPhase,
    pub success: bool,
    pub code_quality_score: f32,
    pub complexity_metrics: ComplexityMetrics,
    pub suggestions: Vec<String>,
    pub completion_time: i64,
}

/// Quality metrics for tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityMetrics {
    pub overall_score: f32,
    pub code_quality: f32,
    pub test_coverage: f32,
    pub documentation: f32,
    pub performance: f32,
    pub security: f32,
}

impl Default for QualityMetrics {
    fn default() -> Self {
        Self {
            overall_score: 0.0,
            code_quality: 0.0,
            test_coverage: 0.0,
            documentation: 0.0,
            performance: 0.0,
            security: 0.0,
        }
    }
}

/// Complexity metrics for analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplexityMetrics {
    pub cyclomatic_complexity: u32,
    pub cognitive_complexity: u32,
    pub nesting_depth: u32,
    pub function_count: u32,
    pub line_count: u32,
}

/// Risk assessment for SPARC projects
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Risk {
    pub id: String,
    pub description: String,
    pub risk_level: RiskLevel,
    pub probability: f32, // 0.0 to 1.0
    pub impact: f32,      // 0.0 to 1.0
    pub mitigation_strategy: String,
    pub contingency_plan: String,
}

/// Risk levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// SPARC methodology errors
#[derive(Error, Debug)]
pub enum SparcError {
    #[error("Invalid project parameter '{field}': {message}")]
    InvalidProjectParameter { field: String, message: String },
    
    #[error("Phase advancement blocked for {current_phase}: {reason}")]
    PhaseAdvancementBlocked { current_phase: String, reason: String },
    
    #[error("Phase rollback blocked for {current_phase}: {reason}")]
    PhaseRollbackBlocked { current_phase: String, reason: String },
    
    #[error("Insufficient team size: {current} < {required} for {complexity} complexity")]
    InsufficientTeamSize { current: usize, required: usize, complexity: String },
    
    #[error("Insufficient timeline: {current} days < {required} days for {complexity} complexity")]
    InsufficientTimeline { current: u32, required: u32, complexity: String },
    
    #[error("SPARC methodology error: {message}")]
    Methodology { message: String },
}

/// SPARC methodology engine
pub struct SparcEngine {
    projects: HashMap<String, SPARCProject>,
}

impl SparcEngine {
    /// Create a new SPARC engine
    pub fn new() -> Self {
        Self {
            projects: HashMap::new(),
        }
    }
    
    /// Create a new SPARC project
    pub fn create_project(
        &mut self,
        name: String,
        domain: String,
        complexity: ProjectComplexity,
    ) -> Result<SPARCProject, SparcError> {
        let id = Uuid::new_v4().to_string();
        let project = SPARCProject::new(id.clone(), name, domain, complexity)?;
        
        self.projects.insert(id.clone(), project.clone());
        Ok(project)
    }
    
    /// Get a project by ID
    pub fn get_project(&self, id: &str) -> Option<&SPARCProject> {
        self.projects.get(id)
    }
    
    /// Get all projects
    pub fn get_all_projects(&self) -> Vec<&SPARCProject> {
        self.projects.values().collect()
    }
    
    /// Advance a project to the next phase
    pub fn advance_project_phase(&mut self, project_id: &str) -> Result<SPARCPhase, SparcError> {
        let project = self.projects.get_mut(project_id)
            .ok_or_else(|| SparcError::Methodology {
                message: format!("Project {} not found", project_id),
            })?;
        
        project.advance_phase()
    }
}
