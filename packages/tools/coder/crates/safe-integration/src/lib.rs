//! SAFe Integration Module
//! 
//! Integrates SAFe 6.0 Program Increment planning with SPARC methodology.
//! Manages user stories, team coordination, and quality gates at the user story level.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// Import SPARC methodology types
use sparc_methodology::{
    SPARCPhase, ProjectComplexity, SPARCProject, SparcEngine,
    QualityMetrics, ComplexityMetrics, Risk, RiskLevel,
};

/// SAFe 6.0 Program Increment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgramIncrement {
    pub id: String,
    pub name: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub teams: Vec<Team>,
    pub objectives: Vec<Objective>,
    pub user_stories: Vec<UserStory>,
    pub status: PIStatus,
}

/// PI status tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PIStatus {
    Planning,
    Active,
    Review,
    Retrospective,
    Complete,
}

/// SAFe team configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Team {
    pub id: String,
    pub name: String,
    pub capacity: TeamCapacity,
    pub members: Vec<TeamMember>,
    pub velocity: f32,
    pub current_sprint: Option<Sprint>,
}

/// Team capacity and constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamCapacity {
    pub story_points_per_sprint: u32,
    pub available_hours_per_day: f32,
    pub team_size: usize,
    pub expertise_areas: Vec<String>,
}

/// Team member information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamMember {
    pub id: String,
    pub name: String,
    pub role: TeamRole,
    pub expertise: Vec<String>,
    pub availability: f32, // 0.0 to 1.0
}

/// Team roles in SAFe
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TeamRole {
    Developer,
    Tester,
    DevOps,
    ProductOwner,
    ScrumMaster,
    Architect,
    Designer,
}

/// Sprint configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sprint {
    pub id: String,
    pub name: String,
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub goal: String,
    pub committed_stories: Vec<String>, // User story IDs
    pub completed_stories: Vec<String>, // User story IDs
}

/// SAFe objective
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Objective {
    pub id: String,
    pub name: String,
    pub description: String,
    pub business_value: BusinessValue,
    pub acceptance_criteria: Vec<String>,
    pub dependencies: Vec<String>,
    pub status: ObjectiveStatus,
}

/// Business value assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BusinessValue {
    Low,
    Medium,
    High,
    Critical,
}

/// Objective status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ObjectiveStatus {
    NotStarted,
    InProgress,
    Blocked,
    Complete,
}

/// User story with SPARC integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStory {
    pub id: String,
    pub title: String,
    pub description: String,
    pub acceptance_criteria: Vec<String>,
    pub story_points: u32,
    pub priority: StoryPriority,
    pub status: StoryStatus,
    
    // SPARC methodology integration
    pub sparc_project: Option<SPARCProject>,
    pub current_sparc_phase: Option<SPARCPhase>,
    
    // Quality gates and validation
    pub quality_gates: Vec<QualityGate>,
    pub quality_metrics: QualityMetrics,
    
    // Dependencies and risks
    pub dependencies: Vec<String>,
    pub risks: Vec<Risk>,
    
    // Team assignment
    pub assigned_team: Option<String>,
    pub assigned_member: Option<String>,
    
    // Timeline and estimation
    pub estimated_completion: Option<DateTime<Utc>>,
    pub actual_completion: Option<DateTime<Utc>>,
    
    // Metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Story priority levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StoryPriority {
    Critical,
    High,
    Medium,
    Low,
    NiceToHave,
}

/// Story status tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StoryStatus {
    Backlog,
    Ready,
    InProgress,
    Review,
    Done,
    Blocked,
}

/// Quality gate for user stories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityGate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub criteria: Vec<QualityCriteria>,
    pub status: GateStatus,
    pub required_for_completion: bool,
}

/// Quality criteria for gates
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityCriteria {
    pub name: String,
    pub description: String,
    pub metric: String,
    pub threshold: f32,
    pub current_value: Option<f32>,
    pub passed: Option<bool>,
}

/// Gate status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GateStatus {
    NotStarted,
    InProgress,
    Passed,
    Failed,
    Blocked,
}

/// SAFe-SPARC integration engine
pub struct SafeSparcIntegration {
    sparc_engine: SparcEngine,
    program_increments: HashMap<String, ProgramIncrement>,
    teams: HashMap<String, Team>,
}

impl SafeSparcIntegration {
    /// Create a new SAFe-SPARC integration engine
    pub fn new() -> Self {
        Self {
            sparc_engine: SparcEngine::new(),
            program_increments: HashMap::new(),
            teams: HashMap::new(),
        }
    }
    
    /// Create a new user story with SPARC project
    pub fn create_user_story(
        &mut self,
        title: String,
        description: String,
        story_points: u32,
        priority: StoryPriority,
        complexity: ProjectComplexity,
    ) -> Result<UserStory, SafeSparcError> {
        let id = Uuid::new_v4().to_string();
        
        // Create SPARC project for the user story
        let sparc_project = self.sparc_engine.create_project(
            title.clone(),
            "user_story".to_string(),
            complexity,
        )?;
        
        let user_story = UserStory {
            id: id.clone(),
            title,
            description,
            acceptance_criteria: Vec::new(),
            story_points,
            priority,
            status: StoryStatus::Backlog,
            sparc_project: Some(sparc_project),
            current_sparc_phase: Some(SPARCPhase::Specification),
            quality_gates: Vec::new(),
            quality_metrics: QualityMetrics::default(),
            dependencies: Vec::new(),
            risks: Vec::new(),
            assigned_team: None,
            assigned_member: None,
            estimated_completion: None,
            actual_completion: None,
            metadata: HashMap::new(),
        };
        
        Ok(user_story)
    }
    
    /// Start SPARC implementation for a user story
    pub fn start_sparc_implementation(
        &mut self,
        story_id: &str,
        program_increment_id: &str,
    ) -> Result<SPARCPhase, SafeSparcError> {
        let pi = self.program_increments.get_mut(program_increment_id)
            .ok_or_else(|| SafeSparcError::ProgramIncrementNotFound {
                id: program_increment_id.to_string(),
            })?;
        
        let story = pi.user_stories.iter_mut()
            .find(|s| s.id == story_id)
            .ok_or_else(|| SafeSparcError::UserStoryNotFound {
                id: story_id.to_string(),
            })?;
        
        // Update story status
        story.status = StoryStatus::InProgress;
        
        // TODO: COORDINATION - Assign story to appropriate team based on capabilities
        // TODO: COORDINATION - Update team Kanban board (move to "In Progress")
        // TODO: COORDINATION - Notify team members about new story assignment
        // TODO: COORDINATION - Check team capacity and adjust if needed
        
        // Get current SPARC phase
        if let Some(sparc_project) = &mut story.sparc_project {
            let current_phase = sparc_project.current_phase.clone();
            story.current_sparc_phase = Some(current_phase.clone());
            Ok(current_phase)
        } else {
            Err(SafeSparcError::SPARCProjectNotFound {
                story_id: story_id.to_string(),
            })
        }
    }
    
    /// Advance SPARC phase for a user story
    pub fn advance_sparc_phase(
        &mut self,
        story_id: &str,
        program_increment_id: &str,
    ) -> Result<SPARCPhase, SafeSparcError> {
        let pi = self.program_increments.get_mut(program_increment_id)
            .ok_or_else(|| SafeSparcError::ProgramIncrementNotFound {
                id: program_increment_id.to_string(),
            })?;
        
        let story = pi.user_stories.iter_mut()
            .find(|s| s.id == story_id)
            .ok_or_else(|| SafeSparcError::UserStoryNotFound {
                id: story_id.to_string(),
            })?;
        
        if let Some(sparc_project) = &mut story.sparc_project {
            let next_phase = sparc_project.advance_phase()?;
            story.current_sparc_phase = Some(next_phase.clone());
            
            // Update story status based on SPARC phase
            story.status = match next_phase {
                SPARCPhase::Completion => StoryStatus::Review,
                SPARCPhase::Testing => StoryStatus::Review,
                SPARCPhase::Deployment => StoryStatus::Done,
                _ => StoryStatus::InProgress,
            };
            
            Ok(next_phase)
        } else {
            Err(SafeSparcError::SPARCProjectNotFound {
                story_id: story_id.to_string(),
            })
        }
    }
    
    /// Analyze user story complexity
    pub fn analyze_story_complexity(&self, story: &UserStory) -> StoryComplexityAnalysis {
        let mut analysis = StoryComplexityAnalysis {
            overall_complexity: ProjectComplexity::Simple,
            risk_factors: Vec::new(),
            team_requirements: Vec::new(),
            timeline_estimate: 0,
            quality_concerns: Vec::new(),
        };
        
        // Analyze story points
        analysis.overall_complexity = match story.story_points {
            1..=3 => ProjectComplexity::Simple,
            4..=8 => ProjectComplexity::Moderate,
            9..=13 => ProjectComplexity::High,
            14..=21 => ProjectComplexity::Complex,
            _ => ProjectComplexity::Enterprise,
        };
        
        // Analyze dependencies
        if !story.dependencies.is_empty() {
            analysis.risk_factors.push("High dependency count".to_string());
        }
        
        // Analyze acceptance criteria complexity
        if story.acceptance_criteria.len() > 5 {
            analysis.risk_factors.push("Complex acceptance criteria".to_string());
        }
        
        // Estimate timeline based on complexity
        analysis.timeline_estimate = analysis.overall_complexity.estimated_completion_days();
        
        // Identify quality concerns
        if story.quality_metrics.overall_score < 70.0 {
            analysis.quality_concerns.push("Low quality metrics".to_string());
        }
        
        analysis
    }
    
    /// Estimate story completion time
    pub fn estimate_story_completion(
        &self,
        story: &UserStory,
        team: &Team,
    ) -> Result<DateTime<Utc>, SafeSparcError> {
        let complexity_analysis = self.analyze_story_complexity(story);
        let base_days = complexity_analysis.timeline_estimate as i64;
        
        // Adjust based on team capacity and velocity
        let adjusted_days = (base_days as f32 * (1.0 / team.velocity)) as i64;
        
        let completion_date = Utc::now() + chrono::Duration::days(adjusted_days);
        Ok(completion_date)
    }
    
    /// Get user story status with SPARC integration
    pub fn get_story_status(
        &self,
        story_id: &str,
        program_increment_id: &str,
    ) -> Result<StoryStatusWithSPARC, SafeSparcError> {
        let pi = self.program_increments.get(program_increment_id)
            .ok_or_else(|| SafeSparcError::ProgramIncrementNotFound {
                id: program_increment_id.to_string(),
            })?;
        
        let story = pi.user_stories.iter()
            .find(|s| s.id == story_id)
            .ok_or_else(|| SafeSparcError::UserStoryNotFound {
                id: story_id.to_string(),
            })?;
        
        Ok(StoryStatusWithSPARC {
            story_status: story.status.clone(),
            sparc_phase: story.current_sparc_phase.clone(),
            quality_gates: story.quality_gates.clone(),
            quality_metrics: story.quality_metrics.clone(),
            estimated_completion: story.estimated_completion,
            actual_completion: story.actual_completion,
        })
    }
}

/// Story complexity analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoryComplexityAnalysis {
    pub overall_complexity: ProjectComplexity,
    pub risk_factors: Vec<String>,
    pub team_requirements: Vec<String>,
    pub timeline_estimate: u32,
    pub quality_concerns: Vec<String>,
}

/// Story status with SPARC integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoryStatusWithSPARC {
    pub story_status: StoryStatus,
    pub sparc_phase: Option<SPARCPhase>,
    pub quality_gates: Vec<QualityGate>,
    pub quality_metrics: QualityMetrics,
    pub estimated_completion: Option<DateTime<Utc>>,
    pub actual_completion: Option<DateTime<Utc>>,
}

/// SAFe-SPARC integration errors
#[derive(Error, Debug)]
pub enum SafeSparcError {
    #[error("Program increment not found: {id}")]
    ProgramIncrementNotFound { id: String },
    
    #[error("User story not found: {id}")]
    UserStoryNotFound { id: String },
    
    #[error("SPARC project not found for story: {story_id}")]
    SPARCProjectNotFound { story_id: String },
    
    #[error("Team not found: {id}")]
    TeamNotFound { id: String },
    
    #[error("SAFe integration error: {message}")]
    Integration { message: String },
    
    #[error("SPARC methodology error: {0}")]
    SparcMethodology(#[from] sparc_methodology::SparcError),
}
