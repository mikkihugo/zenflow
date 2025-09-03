//! SAFE 6.0 and SPARC Methodology Integration for File-Aware Core
//! 
//! Integrates SAFe 6.0 Program Increment planning with SPARC 5-phase development methodology
//! for enterprise-scale code analysis and quality management.

use crate::{Result, FileAwareError, FileAnalyzer, CodeMLModel, DatabaseManager};
use crate::sparc_integration::{SPARCProject, SPARCPhase, ProjectComplexity};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// TaskMaster integration for enterprise approvals
pub struct TaskMaster {
    pub api_endpoint: String,
    pub api_key: String,
    pub approval_workflow: ApprovalWorkflow,
}

impl TaskMaster {
    pub fn new(api_endpoint: String, api_key: String) -> Self {
        Self {
            api_endpoint,
            api_key,
            approval_workflow: ApprovalWorkflow::default(),
        }
    }
    
    /// Request approval for high-risk user stories
    pub async fn request_approval(&self, request: ApprovalRequest) -> Result<ApprovalResponse> {
        // Implementation would call TaskMaster API
        // For now, return a mock approval
        Ok(ApprovalResponse {
            request_id: request.id.clone(),
            approved: true,
            approver: "System".to_string(),
            approval_time: chrono::Utc::now().timestamp(),
            comments: "Auto-approved for development".to_string(),
        })
    }
}

/// Approval workflow configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalWorkflow {
    pub auto_approval_threshold: RiskLevel,
    pub manual_approval_threshold: RiskLevel,
    pub escalation_threshold: RiskLevel,
}

impl Default for ApprovalWorkflow {
    fn default() -> Self {
        Self {
            auto_approval_threshold: RiskLevel::Low,
            manual_approval_threshold: RiskLevel::Medium,
            escalation_threshold: RiskLevel::High,
        }
    }
}

/// Approval request for user stories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalRequest {
    pub id: String,
    pub user_story_id: String,
    pub risk_level: RiskLevel,
    pub complexity: ProjectComplexity,
    pub estimated_effort: u32,
    pub business_value: BusinessValue,
    pub justification: String,
}

/// Approval response from TaskMaster
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalResponse {
    pub request_id: String,
    pub approved: bool,
    pub approver: String,
    pub approval_time: i64,
    pub comments: String,
}

/// User story with comprehensive validation and constraints
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStory {
    pub id: String,
    pub title: String,
    pub description: String,
    pub acceptance_criteria: Vec<String>,
    pub business_value: BusinessValue,
    pub priority: Priority,
    pub complexity: ProjectComplexity,
    pub estimated_effort: u32,
    pub actual_effort: Option<u32>,
    pub status: ImplementationStatus,
    pub assignee: Option<String>,
    pub team: String,
    pub dependencies: Vec<String>,
    pub risks: Vec<Risk>,
    pub quality_gates: Vec<QualityGate>,
    pub sparc_project: Option<SPARCProject>,
    pub metadata: HashMap<String, serde_json::Value>,
}

impl UserStory {
    /// Create a new user story with validation
    pub fn new(
        id: String,
        title: String,
        description: String,
        business_value: BusinessValue,
        priority: Priority,
        complexity: ProjectComplexity,
        team: String,
    ) -> Result<Self> {
        // Validate user story parameters
        if id.is_empty() {
            return Err(FileAwareError::Analysis { 
                message: "User story ID cannot be empty".to_string() 
            });
        }
        
        if title.is_empty() {
            return Err(FileAwareError::Analysis { 
                message: "User story title cannot be empty".to_string() 
            });
        }
        
        if description.is_empty() {
            return Err(FileAwareError::Analysis { 
                message: "User story description cannot be empty".to_string() 
            });
        }
        
        if team.is_empty() {
            return Err(FileAwareError::Analysis { 
                message: "User story team cannot be empty".to_string() 
            });
        }
        
        Ok(Self {
            id,
            title,
            description,
            acceptance_criteria: Vec::new(),
            business_value,
            priority,
            complexity,
            estimated_effort: 0,
            actual_effort: None,
            status: ImplementationStatus::NotStarted,
            assignee: None,
            team,
            dependencies: Vec::new(),
            risks: Vec::new(),
            quality_gates: Vec::new(),
            sparc_project: None,
            metadata: HashMap::new(),
        })
    }
    
    /// Validate user story constraints
    pub fn validate_constraints(&self) -> Result<()> {
        // Check if story can be implemented with current team capacity
        if self.estimated_effort > 40 { // Max 40 story points
            return Err(FileAwareError::Analysis {
                message: "User story is too large. Consider breaking it down.".to_string()
            });
        }
        
        // Check if dependencies are valid
        for dependency in &self.dependencies {
            if dependency.is_empty() {
                return Err(FileAwareError::Analysis {
                    message: "Dependency ID cannot be empty".to_string()
                });
            }
        }
        
        // Check if risks are properly assessed
        for risk in &self.risks {
            if risk.description.is_empty() {
                return Err(FileAwareError::Analysis {
                    message: "Risk description cannot be empty".to_string()
                });
            }
        }
        
        Ok(())
    }
    
    /// Check if story requires TaskMaster approval
    pub fn requires_approval(&self) -> bool {
        matches!(self.risk_level(), RiskLevel::High | RiskLevel::Critical)
    }
    
    /// Get risk level based on complexity and business value
    pub fn risk_level(&self) -> RiskLevel {
        match (self.complexity, self.business_value) {
            (ProjectComplexity::Enterprise, BusinessValue::Critical) => RiskLevel::Critical,
            (ProjectComplexity::Complex, BusinessValue::High) => RiskLevel::High,
            (ProjectComplexity::High, BusinessValue::Medium) => RiskLevel::Medium,
            _ => RiskLevel::Low,
        }
    }
    
    /// Add dependency to user story
    pub fn add_dependency(&mut self, dependency_id: String) -> Result<()> {
        if dependency_id.is_empty() {
            return Err(FileAwareError::Analysis {
                message: "Dependency ID cannot be empty".to_string()
            });
        }
        
        if dependency_id == self.id {
            return Err(FileAwareError::Analysis {
                message: "User story cannot depend on itself".to_string()
            });
        }
        
        if !self.dependencies.contains(&dependency_id) {
            self.dependencies.push(dependency_id);
        }
        
        Ok(())
    }
    
    /// Add risk assessment
    pub fn add_risk(&mut self, risk: Risk) -> Result<()> {
        if risk.description.is_empty() {
            return Err(FileAwareError::Analysis {
                message: "Risk description cannot be empty".to_string()
            });
        }
        
        self.risks.push(risk);
        Ok(())
    }
    
    /// Add quality gate
    pub fn add_quality_gate(&mut self, quality_gate: QualityGate) -> Result<()> {
        if quality_gate.name.is_empty() {
            return Err(FileAwareError::Analysis {
                message: "Quality gate name cannot be empty".to_string()
            });
        }
        
        self.quality_gates.push(quality_gate);
        Ok(())
    }
    
    /// Check if all quality gates are passed
    pub fn quality_gates_passed(&self) -> bool {
        self.quality_gates.iter().all(|gate| gate.status == QualityGateStatus::Passed)
    }
    
    /// Get story progress percentage
    pub fn progress_percentage(&self) -> f32 {
        match self.status {
            ImplementationStatus::NotStarted => 0.0,
            ImplementationStatus::InProgress => 25.0,
            ImplementationStatus::InReview => 75.0,
            ImplementationStatus::Completed => 100.0,
            ImplementationStatus::Blocked => 0.0,
            ImplementationStatus::Cancelled => 0.0,
        }
    }
}

/// Business value levels with validation and calculation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum BusinessValue {
    Low,
    Medium,
    High,
    Critical,
    Strategic,
}

impl BusinessValue {
    /// Get business value score
    pub fn score(&self) -> f32 {
        match self {
            BusinessValue::Low => 1.0,
            BusinessValue::Medium => 3.0,
            BusinessValue::High => 5.0,
            BusinessValue::Critical => 8.0,
            BusinessValue::Strategic => 13.0,
        }
    }
    
    /// Calculate business value based on factors
    pub fn calculate(
        revenue_impact: f32,
        customer_satisfaction: f32,
        strategic_alignment: f32,
        compliance_requirement: bool,
    ) -> Self {
        let mut score = revenue_impact + customer_satisfaction + strategic_alignment;
        
        if compliance_requirement {
            score += 2.0; // Compliance adds significant value
        }
        
        match score {
            s if s < 3.0 => BusinessValue::Low,
            s if s < 6.0 => BusinessValue::Medium,
            s if s < 9.0 => BusinessValue::High,
            s if s < 12.0 => BusinessValue::Critical,
            _ => BusinessValue::Strategic,
        }
    }
    
    /// Validate business value constraints
    pub fn validate_constraints(&self, team_capacity: u32, timeline_days: u32) -> Result<bool> {
        match self {
            BusinessValue::Critical | BusinessValue::Strategic => {
                if team_capacity < 5 {
                    return Err(FileAwareError::Analysis {
                        message: "Critical/Strategic stories require team capacity >= 5".to_string()
                    });
                }
                if timeline_days < 30 {
                    return Err(FileAwareError::Analysis {
                        message: "Critical/Strategic stories require timeline >= 30 days".to_string()
                    });
                }
            }
            BusinessValue::High => {
                if team_capacity < 3 {
                    return Err(FileAwareError::Analysis {
                        message: "High value stories require team capacity >= 3".to_string()
                    });
                }
                if timeline_days < 14 {
                    return Err(FileAwareError::Analysis {
                        message: "High value stories require timeline >= 14 days".to_string()
                    });
                }
            }
            _ => {
                // Low and Medium value stories have minimal constraints
            }
        }
        
        Ok(true)
    }
}

/// Priority levels with validation and calculation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
    Blocker,
}

impl Priority {
    /// Get priority score
    pub fn score(&self) -> f32 {
        match self {
            Priority::Low => 1.0,
            Priority::Medium => 2.0,
            Priority::High => 4.0,
            Priority::Critical => 8.0,
            Priority::Blocker => 16.0,
        }
    }
    
    /// Calculate priority based on business value and urgency
    pub fn calculate(business_value: &BusinessValue, urgency_days: u32) -> Self {
        let value_score = business_value.score();
        let urgency_score = match urgency_days {
            d if d <= 1 => 5.0,   // Today
            d if d <= 3 => 4.0,   // This week
            d if d <= 7 => 3.0,   // This sprint
            d if d <= 14 => 2.0,  // This PI
            _ => 1.0,             // Future
        };
        
        let total_score = value_score + urgency_score;
        
        match total_score {
            s if s < 4.0 => Priority::Low,
            s if s < 7.0 => Priority::Medium,
            s if s < 10.0 => Priority::High,
            s if s < 15.0 => Priority::Critical,
            _ => Priority::Blocker,
        }
    }
    
    /// Validate priority constraints
    pub fn validate_constraints(&self, team_capacity: u32) -> Result<bool> {
        match self {
            Priority::Blocker | Priority::Critical => {
                if team_capacity < 3 {
                    return Err(FileAwareError::Analysis {
                        message: "Blocker/Critical priority requires team capacity >= 3".to_string()
                    });
                }
            }
            Priority::High => {
                if team_capacity < 2 {
                    return Err(FileAwareError::Analysis {
                        message: "High priority requires team capacity >= 2".to_string()
                    });
                }
            }
            _ => {
                // Low and Medium priority have minimal constraints
            }
        }
        
        Ok(true)
    }
}

/// Implementation status with validation and automation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ImplementationStatus {
    NotStarted,
    InProgress,
    InReview,
    Completed,
    Blocked,
    Cancelled,
}

impl ImplementationStatus {
    /// Check if status transition is valid
    pub fn can_transition_to(&self, target_status: &ImplementationStatus) -> bool {
        match (self, target_status) {
            (ImplementationStatus::NotStarted, ImplementationStatus::InProgress) => true,
            (ImplementationStatus::InProgress, ImplementationStatus::InReview) => true,
            (ImplementationStatus::InProgress, ImplementationStatus::Blocked) => true,
            (ImplementationStatus::InReview, ImplementationStatus::Completed) => true,
            (ImplementationStatus::InReview, ImplementationStatus::InProgress) => true,
            (ImplementationStatus::Blocked, ImplementationStatus::InProgress) => true,
            (_, ImplementationStatus::Cancelled) => true, // Can cancel from any status
            _ => false,
        }
    }
    
    /// Get status requirements
    pub fn requirements(&self) -> Vec<String> {
        match self {
            ImplementationStatus::NotStarted => vec![
                "Story is defined and ready for development".to_string(),
            ],
            ImplementationStatus::InProgress => vec![
                "Development work has started".to_string(),
                "Story is assigned to a developer".to_string(),
            ],
            ImplementationStatus::InReview => vec![
                "Development work is completed".to_string(),
                "Code review is in progress".to_string(),
                "All quality gates are passed".to_string(),
            ],
            ImplementationStatus::Completed => vec![
                "Code review is completed".to_string(),
                "All acceptance criteria are met".to_string(),
                "Story is deployed to production".to_string(),
            ],
            ImplementationStatus::Blocked => vec![
                "Blocking issue is identified".to_string(),
                "Blocking issue is documented".to_string(),
            ],
            ImplementationStatus::Cancelled => vec![
                "Cancellation reason is documented".to_string(),
                "Stakeholder approval is obtained".to_string(),
            ],
        }
    }
}

/// Risk levels with validation and calculation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

impl RiskLevel {
    /// Get risk score
    pub fn score(&self) -> f32 {
        match self {
            RiskLevel::Low => 1.0,
            RiskLevel::Medium => 3.0,
            RiskLevel::High => 6.0,
            RiskLevel::Critical => 10.0,
        }
    }
    
    /// Calculate risk level based on factors
    pub fn calculate(
        technical_complexity: f32,
        team_experience: f32,
        external_dependencies: f32,
        timeline_pressure: f32,
    ) -> Self {
        let risk_score = technical_complexity + team_experience + external_dependencies + timeline_pressure;
        
        match risk_score {
            s if s < 5.0 => RiskLevel::Low,
            s if s < 10.0 => RiskLevel::Medium,
            s if s < 15.0 => RiskLevel::High,
            _ => RiskLevel::Critical,
        }
    }
}

/// Risk assessment for user stories
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

impl Risk {
    /// Calculate risk exposure
    pub fn exposure(&self) -> f32 {
        self.probability * self.impact
    }
    
    /// Check if risk requires immediate attention
    pub fn requires_attention(&self) -> bool {
        self.exposure() > 0.5 || matches!(self.risk_level, RiskLevel::High | RiskLevel::Critical)
    }
}

/// Quality gate for user stories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityGate {
    pub name: String,
    pub description: String,
    pub criteria: Vec<String>,
    pub status: QualityGateStatus,
    pub required: bool,
}

/// Quality gate status
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum QualityGateStatus {
    NotStarted,
    InProgress,
    Passed,
    Failed,
    Skipped,
}
