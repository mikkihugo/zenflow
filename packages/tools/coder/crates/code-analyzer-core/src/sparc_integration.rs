use crate::types::*;
use quality_gates::{QualityGateEngine, QualityGateResult};
use anyhow::{Result, anyhow};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{info, warn, error};

/// SPARC methodology integration for code analysis projects
pub struct SPARCIntegration {
    engine: SparcEngine,
    quality_gates: QualityGateEngine,
    projects: HashMap<String, SparcProject>,
}

impl SPARCIntegration {
    /// Create a new SPARC integration instance
    pub fn new() -> Self {
        Self {
            engine: SparcEngine::new(),
            quality_gates: QualityGateEngine::new(),
            projects: HashMap::new(),
        }
    }

    /// Create a new SPARC project
    pub fn create_project(&mut self, name: &str, description: &str) -> Result<SparcProject> {
        let project = SparcProject {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
            description: description.to_string(),
            current_phase: SparcMethodologyType::Specification,
            priority: ProjectPriority::Medium,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        self.projects.insert(project.id.clone(), project.clone());
        info!("Created SPARC project: {} ({})", name, project.id);
        
        Ok(project)
    }

    /// Get a project by ID
    pub fn get_project(&self, project_id: &str) -> Option<&SparcProject> {
        self.projects.get(project_id)
    }

    /// Advance a project to the next SPARC phase
    pub async fn advance_phase(&mut self, project_id: &str, project_path: &str) -> Result<SparcPhaseTransition> {
        let project = self.projects.get_mut(project_id)
            .ok_or_else(|| anyhow!("Project not found: {}", project_id))?;

        let current_phase = project.current_phase.clone();
        let next_phase = self.engine.get_next_phase(&current_phase)?;

        // Run quality gates before phase transition
        let quality_result = self.quality_gates.run_all_gates(project_path).await?;
        
        if quality_result.status == QualityGateStatus::Failed {
            return Err(anyhow!("Quality gates failed, cannot advance to next phase"));
        }

        // TODO: COORDINATION - Notify SAFe team about phase transition
        // TODO: COORDINATION - Update team Kanban board status
        // TODO: COORDINATION - Trigger team handoff if phase requires different expertise

        // Validate phase transition requirements
        if !self.engine.can_transition_to(&current_phase, &next_phase)? {
            return Err(anyhow!("Cannot transition from {:?} to {:?}", current_phase, next_phase));
        }

        // Update project phase
        project.current_phase = next_phase.clone();
        project.updated_at = chrono::Utc::now();

        let transition = SparcPhaseTransition {
            project_id: project_id.to_string(),
            from_phase: current_phase,
            to_phase: next_phase.clone(),
            quality_result,
            timestamp: chrono::Utc::now(),
        };

        info!("Project {} advanced from {:?} to {:?}", project_id, transition.from_phase, transition.to_phase);
        
        Ok(transition)
    }

    /// Rollback a project to the previous phase
    pub async fn rollback_phase(&mut self, project_id: &str) -> Result<SparcPhaseTransition> {
        let project = self.projects.get_mut(project_id)
            .ok_or_else(|| anyhow!("Project not found: {}", project_id))?;

        let current_phase = project.current_phase.clone();
        let previous_phase = self.engine.get_previous_phase(&current_phase)?;

        // Update project phase
        project.current_phase = previous_phase.clone();
        project.updated_at = chrono::Utc::now();

        let transition = SparcPhaseTransition {
            project_id: project_id.to_string(),
            from_phase: current_phase,
            to_phase: previous_phase.clone(),
            quality_result: QualityGateResult {
                status: QualityGateStatus::Skipped,
                score: 0.0,
                total_issues: 0,
                errors: vec!["Phase rollback requested".to_string()],
                warnings: vec![],
                info: vec![],
                ai_pattern_issues: vec![],
                timestamp: chrono::Utc::now(),
            },
            timestamp: chrono::Utc::now(),
        };

        warn!("Project {} rolled back from {:?} to {:?}", project_id, transition.from_phase, transition.to_phase);
        
        Ok(transition)
    }

    /// Get project metrics and health status
    pub fn get_project_health(&self, project_id: &str) -> Result<ProjectHealth> {
        let project = self.get_project(project_id)
            .ok_or_else(|| anyhow!("Project not found: {}", project_id))?;

        let phase_progress = self.engine.get_phase_progress(&project.current_phase)?;
        let quality_score = self.get_project_quality_score(project_id)?;

        Ok(ProjectHealth {
            project_id: project_id.to_string(),
            current_phase: project.current_phase.clone(),
            phase_progress,
            quality_score,
            last_updated: project.updated_at,
        })
    }

    /// Get quality score for a project
    fn get_project_quality_score(&self, _project_id: &str) -> Result<f64> {
        // TODO: Implement quality score calculation based on quality gate results
        Ok(0.85) // Placeholder
    }

    /// List all projects
    pub fn list_projects(&self) -> Vec<&SparcProject> {
        self.projects.values().collect()
    }

    /// Delete a project
    pub fn delete_project(&mut self, project_id: &str) -> Result<()> {
        if self.projects.remove(project_id).is_some() {
            info!("Deleted SPARC project: {}", project_id);
            Ok(())
        } else {
            Err(anyhow!("Project not found: {}", project_id))
        }
    }
}

impl Default for SPARCIntegration {
    fn default() -> Self {
        Self::new()
    }
}

/// SPARC engine for managing methodology phases
pub struct SparcEngine {
    phase_requirements: HashMap<SparcMethodologyType, Vec<String>>,
    phase_transitions: HashMap<SparcMethodologyType, Vec<SparcMethodologyType>>,
}

impl SparcEngine {
    /// Create a new SPARC engine
    pub fn new() -> Self {
        let mut engine = Self {
            phase_requirements: HashMap::new(),
            phase_transitions: HashMap::new(),
        };

        // Initialize phase requirements and transitions
        engine.initialize_phases();
        engine
    }

    /// Initialize SPARC phases with requirements and transitions
    fn initialize_phases(&mut self) {
        // Phase requirements
        self.phase_requirements.insert(SparcMethodologyType::Specification, vec![
            "Project scope defined".to_string(),
            "Requirements documented".to_string(),
            "Stakeholders identified".to_string(),
        ]);

        self.phase_requirements.insert(SparcMethodologyType::Pseudocode, vec![
            "Algorithm logic defined".to_string(),
            "Data structures specified".to_string(),
            "Interface contracts documented".to_string(),
        ]);

        self.phase_requirements.insert(SparcMethodologyType::Architecture, vec![
            "System design completed".to_string(),
            "Component interactions defined".to_string(),
            "Technology stack selected".to_string(),
        ]);

        self.phase_requirements.insert(SparcMethodologyType::Refinement, vec![
            "Code implementation started".to_string(),
            "Unit tests written".to_string(),
            "Code review completed".to_string(),
        ]);

        self.phase_requirements.insert(SparcMethodologyType::Completion, vec![
            "All tests passing".to_string(),
            "Documentation updated".to_string(),
            "Deployment ready".to_string(),
        ]);

        // Phase transitions
        self.phase_transitions.insert(SparcMethodologyType::Specification, vec![
            SparcMethodologyType::Pseudocode,
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Pseudocode, vec![
            SparcMethodologyType::Architecture,
            SparcMethodologyType::Specification, // Can go back
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Architecture, vec![
            SparcMethodologyType::Refinement,
            SparcMethodologyType::Pseudocode, // Can go back
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Refinement, vec![
            SparcMethodologyType::Completion,
            SparcMethodologyType::Architecture, // Can go back
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Completion, vec![
            SparcMethodologyType::Testing,
            SparcMethodologyType::Refinement, // Can go back
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Testing, vec![
            SparcMethodologyType::Deployment,
            SparcMethodologyType::Completion, // Can go back
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Deployment, vec![
            SparcMethodologyType::Maintenance,
            SparcMethodologyType::Testing, // Can go back
        ]);

        self.phase_transitions.insert(SparcMethodologyType::Maintenance, vec![
            SparcMethodologyType::Specification, // Can start new iteration
        ]);
    }

    /// Get the next available phases for a current phase
    pub fn get_next_phase(&self, current_phase: &SparcMethodologyType) -> Result<SparcMethodologyType> {
        let transitions = self.phase_transitions.get(current_phase)
            .ok_or_else(|| anyhow!("No transitions defined for phase: {:?}", current_phase))?;

        // For now, return the first available transition
        // In a real implementation, you might want to check requirements
        transitions.first()
            .cloned()
            .ok_or_else(|| anyhow!("No next phase available for: {:?}", current_phase))
    }

    /// Get the previous phase for rollback
    pub fn get_previous_phase(&self, current_phase: &SparcMethodologyType) -> Result<SparcMethodologyType> {
        // Find which phase has current_phase as a transition
        for (phase, transitions) in &self.phase_transitions {
            if transitions.contains(current_phase) {
                return Ok(phase.clone());
            }
        }
        
        Err(anyhow!("No previous phase found for: {:?}", current_phase))
    }

    /// Check if a phase transition is allowed
    pub fn can_transition_to(&self, from: &SparcMethodologyType, to: &SparcMethodologyType) -> Result<bool> {
        let transitions = self.phase_transitions.get(from)
            .ok_or_else(|| anyhow!("No transitions defined for phase: {:?}", from))?;

        Ok(transitions.contains(to))
    }

    /// Get progress percentage for a phase
    pub fn get_phase_progress(&self, _phase: &SparcMethodologyType) -> Result<f64> {
        // TODO: Implement phase progress calculation based on requirements completion
        Ok(0.75) // Placeholder
    }
}

impl Default for SparcEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// SPARC phase transition result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparcPhaseTransition {
    pub project_id: String,
    pub from_phase: SparcMethodologyType,
    pub to_phase: SparcMethodologyType,
    pub quality_result: QualityGateResult,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Project health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectHealth {
    pub project_id: String,
    pub current_phase: SparcMethodologyType,
    pub phase_progress: f64,
    pub quality_score: f64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sparc_engine_initialization() {
        let engine = SparcEngine::new();
        assert!(!engine.phase_requirements.is_empty());
        assert!(!engine.phase_transitions.is_empty());
    }

    #[test]
    fn test_phase_transitions() {
        let engine = SparcEngine::new();
        
        let next_phase = engine.get_next_phase(&SparcMethodologyType::Specification).unwrap();
        assert_eq!(next_phase, SparcMethodologyType::Pseudocode);
        
        let can_transition = engine.can_transition_to(
            &SparcMethodologyType::Specification,
            &SparcMethodologyType::Pseudocode
        ).unwrap();
        assert!(can_transition);
    }

    #[tokio::test]
    async fn test_sparc_integration() {
        let mut integration = SPARCIntegration::new();
        
        let project = integration.create_project("Test Project", "A test project").unwrap();
        assert_eq!(project.current_phase, SparcMethodologyType::Specification);
        
        let projects = integration.list_projects();
        assert_eq!(projects.len(), 1);
        assert_eq!(projects[0].name, "Test Project");
    }
}
