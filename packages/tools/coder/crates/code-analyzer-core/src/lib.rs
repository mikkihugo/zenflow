//! Core code analysis and intelligence engine for Claude Code Zen
//! 
//! This crate provides comprehensive code analysis capabilities including:
//! - AST parsing and semantic analysis
//! - Security vulnerability scanning
//! - Code quality metrics and complexity analysis
//! - SPARC methodology integration
//! - SAFe 6.0 user story management
//! - Quality gate enforcement
//! - Machine learning integration for code pattern recognition

use anyhow::Result;
use thiserror::Error;
use serde::{Deserialize, Serialize};
use chrono;
use serde_json;

/// Code intelligence error types
#[derive(Debug, Error)]
pub enum CodeIntelligenceError {
    #[error("Analysis failed: {message}")]
    Analysis { message: String },
    #[error("Parse error: {message}")]
    Parse { message: String },
    #[error("IO error: {source}")]
    Io { source: std::io::Error },
}

/// File-aware error types 
#[derive(Debug, Error)]
pub enum FileAwareError {
    #[error("Analysis failed: {message}")]
    Analysis { message: String },
    #[error("File system error: {message}")]
    FileSystem { message: String },
    #[error("Database error: {message}")]
    DatabaseError { message: String },
}

/// Analysis request type
#[derive(Debug, Clone)]
pub struct AnalysisRequest {
    pub file_path: String,
    pub language: Option<String>,
    pub options: std::collections::HashMap<String, String>,
}

/// Complexity level enum
#[derive(Debug, Clone, PartialEq)]
pub enum ComplexityLevel {
    Low,
    Medium,
    High,
    VeryHigh,
}

/// Core analysis result type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub file_path: String,
    pub metrics: std::collections::HashMap<String, f64>,
    pub issues: Vec<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

pub mod analysis;
pub mod ast_analysis;
pub mod config;
pub mod context;
pub mod data_persistence;
pub mod database;
pub mod dependencies;
pub mod enterprise_types;
pub mod knowledge_integration;
pub mod machine_learning;
pub mod memory_integration;
pub mod memory_management;
pub mod ml;
pub mod ml_patterns;
pub mod parser;
pub mod patterns;
pub mod project_context;
pub mod schema_validation;
pub mod sparc_integration;
pub mod symbols;
pub mod testing_framework;
pub mod tree;
pub mod tsos_integration;
pub mod types;

// Re-export main types for easy access
pub use analysis::FileAnalyzer;
pub use ast_analysis::{AstAnalyzer, FileAnalysisResult, AnalysisMetrics};
pub use config::{ConfigManager, SecurityConfig, SparcConfig};
// Re-export types from types.rs - removed MLProjectAnalysis and MLPrediction as they're defined in this file
// pub use types::{MLProjectAnalysis, MLPrediction};
pub use data_persistence::{DataManager, StorageConfiguration};
pub use dependencies::{DependencyAnalyzer, DependencyGraph};
pub use enterprise_types::*;
pub use machine_learning::{CodeIntelligenceModel, PredictionResult, ModelInsights};
pub use memory_integration::MemoryIntegration;
pub use memory_management::{CacheManager, CacheConfig};
pub use ml::{CodeMLModel, MLPredictor, TrainingData};
pub use ml_patterns::{MLPatternEngine, PatternMatch};
pub use patterns::PatternDetector;
pub use project_context::{ProjectContextBuilder, CodebaseContext};
pub use schema_validation::{Schema, ValidationResult};
pub use sparc_integration::{SPARCIntegration, SparcEngine};
pub use symbols::SymbolAnalyzer;
pub use testing_framework::{ComprehensiveTestingFramework, TestSuite, TestCase};
pub use tsos_integration::{TsosIntegrationEngine, TaskExecution, TaskDefinition};
pub use types::*;

// Import quality gates from the quality-gates crate
use quality_gates::{QualityGateEngine, QualityGateConfig, QualityGateResult, QualityGateStatus};

/// Main code analysis engine that orchestrates all analysis capabilities
pub struct CodeAnalysisEngine {
    analyzer: analysis::FileAnalyzer,
    quality_gates: QualityGateEngine,
    sparc_integration: sparc_integration::SPARCIntegration,
    ml_model: Option<MLProjectAnalysis>,
    // coordination_engine: coordination::CoordinationEngine,
}

impl CodeAnalysisEngine {
    /// Create a new code analysis engine
    pub fn new() -> Self {
        let ml_model = MLProjectAnalysis::default();
        
        Self {
            analyzer: analysis::FileAnalyzer::new(),
            quality_gates: QualityGateEngine::new(),
            sparc_integration: sparc_integration::SPARCIntegration::new(),
            ml_model: Some(ml_model),
            // coordination_engine: coordination::CoordinationEngine::new(),
        }
    }

    /// Create a new engine with custom ML model
    pub fn with_ml_model(_ml_model: MLProjectAnalysis) -> Self {
        Self {
            analyzer: analysis::FileAnalyzer::new(),
            quality_gates: QualityGateEngine::new(),
            sparc_integration: sparc_integration::SPARCIntegration::new(),
            ml_model: Some(_ml_model),
            // coordination_engine: coordination::CoordinationEngine::new(),
        }
    }

    /// Run comprehensive code analysis on a project
    pub async fn analyze_project(&self, project_path: &str) -> Result<ProjectAnalysisResult, Box<dyn std::error::Error>> {
        let context = project_context::ProjectContext::new(project_path)?;
        
        // Run all analysis components
        let code_analysis = AnalysisResult {
            file_path: project_path.to_string(),
            metrics: std::collections::HashMap::new(),
            issues: Vec::new(),
            timestamp: chrono::Utc::now(),
        };
        let security_scan = Vec::new(); // Placeholder for security issues
        let quality_results = self.quality_gates.run_all_gates(project_path).await?;
        
        // ML analysis if model is available
        let ml_analysis = self.ml_model.clone().unwrap_or_default();

        Ok(ProjectAnalysisResult {
            code_analysis,
            security_scan,
            quality_results,
            ml_analysis,
            context,
            timestamp: chrono::Utc::now(),
        })
    }

    // Coordination methods commented out until coordination module is implemented
    // /// Start a new coordinated project with SPARC, SAFe, and team integration
    // pub async fn start_coordinated_project(
    //     &mut self,
    //     project_name: &str,
    //     description: &str,
    //     team_id: &str,
    //     story_points: u32,
    //     priority: StoryPriority,
    // ) -> Result<coordination::CoordinatedProject, Box<dyn std::error::Error>> {
    //     let project = self.coordination_engine.start_coordinated_project(project_name, description, team_id, story_points, priority).await?;
        
    //     // Emit event for coordination
    //     self.emit_event(EventType::CoordinatedProjectStarted, &project).await?;
        
    //     Ok(project)
    // }

    // /// Advance a coordinated project through phases with team coordination
    // pub async fn advance_coordinated_phase(
    //     &mut self,
    //     project_id: &str,
    //     project_path: &str,
    // ) -> Result<coordination::CoordinatedPhaseTransition, Box<dyn std::error::Error>> {
    //     let transition = self.coordination_engine.advance_coordinated_phase(project_id, project_path).await?;
        
    //     // Emit event for coordination
    //     self.emit_event(EventType::CoordinatedPhaseAdvanced, &transition).await?;
        
    //     Ok(transition)
    // }

    // /// Get team Kanban board status
    // pub async fn get_team_kanban_status(&self, team_id: &str) -> Result<coordination::KanbanBoard, Box<dyn std::error::Error>> {
    //     // TODO: Implement team Kanban board retrieval
    //     // For now, return a default board
    //     Ok(coordination::KanbanBoard::new())
    // }

    /// Start a new SPARC project with quality gates
    pub async fn start_sparc_project(&mut self, project_name: &str, description: &str) -> Result<types::SparcProject, Box<dyn std::error::Error>> {
        let project = self.sparc_integration.create_project(project_name, description)?;
        
        // Event emission commented out until EventType and EventData are available
        // self.emit_event(EventType::SparcPhaseComplete, &project).await?;
        
        Ok(project)
    }

    /// Run quality gates and return results
    pub async fn run_quality_gates(&self, project_path: &str) -> Result<QualityGateResult, Box<dyn std::error::Error>> {
        let result = self.quality_gates.run_all_gates(project_path).await?;
        
        // Event emission commented out until EventType and EventData are available
        // self.emit_event(EventType::QualityGateResult, &result).await?;
        
        Ok(result)
    }

    // Event emission methods commented out until EventType and EventData are available
    // /// Emit events for external coordination
    // async fn emit_event(&self, event_type: EventType, payload: &impl serde::Serialize) -> Result<(), Box<dyn std::error::Error>> {
    //     let event_data = EventData {
    //         event_type,
    //         payload: serde_json::to_value(payload)?,
    //         timestamp: chrono::Utc::now(),
    //         source: "code-analysis-engine".to_string(),
    //     };
        
    //     // TODO: Integrate with EventBus for external coordination
    //     // For now, log the event
    //     tracing::info!("Event emitted: {:?}", event_data);
        
    //     Ok(())
    // }
}

impl Default for CodeAnalysisEngine {
    fn default() -> Self {
        Self::new()
    }
}

// Result types for comprehensive analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectAnalysisResult {
    pub code_analysis: AnalysisResult,
    pub security_scan: Vec<SecurityIssue>,
    pub quality_results: QualityGateResult,
    pub ml_analysis: MLProjectAnalysis,
    pub context: project_context::ProjectContext,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MLProjectAnalysis {
    pub predictions: Vec<MLPrediction>,
    pub confidence_score: f64,
    pub model_version: String,
    pub analysis_metadata: std::collections::HashMap<String, serde_json::Value>,
}

// Missing types needed for compilation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolReference {
    pub name: String,
    pub location: String,
    pub symbol_type: SymbolType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SymbolType {
    Function,
    Variable,
    Class,
    Module,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzedContext {
    pub name: String,
    pub data: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileAwareRequest {
    pub file_path: String,
    pub operation: String,
    pub parameters: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDependency {
    pub path: String,
    pub dependency_type: DependencyType,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyType {
    Import,
    Include,
    Require,
    Reference,
}

#[derive(Debug, Clone)]
pub struct DatabaseManager {
    pub connection_string: String,
    pub pool_size: usize,
}

impl DatabaseManager {
    pub fn new(connection_string: String) -> Self {
        Self {
            connection_string,
            pool_size: 10,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfiguration {
    pub model_name: String,
    pub parameters: std::collections::HashMap<String, serde_json::Value>,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MLPrediction {
    pub confidence: f64,
    pub prediction: String,
    pub metadata: std::collections::HashMap<String, serde_json::Value>,
}

// Result type
pub type CodeAnalysisResult<T> = Result<T, FileAwareError>;