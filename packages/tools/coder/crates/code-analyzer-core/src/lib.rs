//! Advanced Code Intelligence Platform
//!
//! A comprehensive code analysis engine following Google TypeScript standards.
//! Provides multi-language AST parsing, ML-powered insights, and enterprise-grade
//! code intelligence capabilities.
//!
//! ## Features
//! 
//! - Multi-language support (Rust, TypeScript, JavaScript, Python, Go)
//! - Tree-sitter based AST parsing
//! - Machine learning powered code analysis
//! - Enterprise methodology integration (SAFe 6.0, SPARC)
//! - Database persistence with multiple backends
//! - Memory management and caching
//! - Knowledge graph integration
//!
//! ## Usage
//!
//! ```rust
//! use code_analyzer_core::CodeIntelligenceEngine;
//! 
//! let mut engine = CodeIntelligenceEngine::new();
//! let request = AnalysisRequest {
//!     task_description: "Analyze code quality".to_string(),
//!     target_files: vec!["src/main.rs".to_string()],
//!     project_root: ".".to_string(),
//!     analysis_options: None,
//!     processing_config: None,
//! };
//! 
//! let response = engine.analyze_code(request)?;
//! println!("Analysis completed with {} improvements", response.code_improvements.len());
//! ```

#![allow(clippy::module_name_repetitions)]
#![deny(missing_docs)]
#![deny(unsafe_code)]

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

// Module declarations following Google package organization
pub mod ast_analysis;
pub mod project_context;
pub mod machine_learning;
pub mod data_persistence;
pub mod memory_management;
pub mod sparc_integration;
pub mod sparc_types;
pub mod sparc_production_types;
pub mod sparc_missing_types;
pub mod tsos_integration;
pub mod testing_framework;
pub mod config;
pub mod ml_patterns;
pub mod schema_validation;
pub mod enterprise_types;

// Public API exports following Google naming conventions
pub use ast_analysis::{AstAnalyzer, FileAnalysisResult, AnalysisMetrics};
pub use project_context::{ProjectContextBuilder, CodebaseContext};
pub use machine_learning::{CodeIntelligenceModel, PredictionResult, ModelInsights};
pub use data_persistence::{DataManager, StorageConfiguration};
pub use memory_management::CacheManager;
pub use sparc_integration::{SparcMethodologyEngine, SparcProject, SparcPhase};
pub use tsos_integration::{TsosIntegrationEngine, TaskExecution, TaskDefinition};
pub use testing_framework::{ComprehensiveTestingFramework, TestSuite, TestCase, TestSuiteReport};

/// Standard error types for all code intelligence operations
/// Following Google error handling patterns with structured error information
#[derive(thiserror::Error, Debug, Clone, Serialize, Deserialize)]
pub enum CodeIntelligenceError {
    /// Input/output operations failed
    #[error("IO operation failed: {message}")]
    IoOperationFailed { message: String },
    
    /// Code parsing encountered errors
    #[error("Parse error in file {file_path}: {message}")]
    ParseError { file_path: String, message: String },
    
    /// Analysis processing failed
    #[error("Analysis failed: {message}")]
    AnalysisFailed { message: String },
    
    /// Unsupported programming language
    #[error("Language not supported: {language}")]
    UnsupportedLanguage { language: String },
    
    /// Authentication or authorization failed
    #[error("Authentication failed: {message}")]
    AuthenticationFailed { message: String },
    
    /// Database operations failed
    #[error("Database operation failed: {message}")]
    DatabaseOperationFailed { message: String },
    
    /// Machine learning model errors
    #[error("ML model error: {message}")]
    MachineLearningError { message: String },
    
    /// Configuration validation failed
    #[error("Configuration invalid: {message}")]
    ConfigurationInvalid { message: String },
    
    /// Resource limits exceeded
    #[error("Resource limit exceeded: {message}")]
    ResourceLimitExceeded { message: String },
    
    /// External service integration failed
    #[error("External service error: {message}")]
    ExternalServiceError { message: String },
}

/// Standard result type for all code intelligence operations
pub type AnalysisResult<T> = std::result::Result<T, CodeIntelligenceError>;

/// Comprehensive analysis request following Google API design patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisRequest {
    /// Human-readable task description
    pub task_description: String,
    
    /// Specific files to analyze (empty means auto-discover)
    pub target_files: Vec<String>,
    
    /// Root directory for analysis scope
    pub project_root: String,
    
    /// Optional analysis configuration
    pub analysis_options: Option<AnalysisOptions>,
    
    /// Optional processing configuration  
    pub processing_config: Option<ProcessingConfiguration>,
}

/// Analysis configuration options following Google config patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisOptions {
    /// Maximum number of files to process
    pub max_file_count: Option<usize>,
    
    /// Include test files in analysis
    pub include_test_files: Option<bool>,
    
    /// Include documentation files
    pub include_documentation: Option<bool>,
    
    /// File path patterns to exclude
    pub exclusion_patterns: Option<Vec<String>>,
    
    /// Analysis depth level (1-5, higher = more thorough)
    pub analysis_depth: Option<u8>,
    
    /// Enable ML-powered insights
    pub enable_ml_analysis: Option<bool>,
    
    /// Generate refactoring suggestions
    pub generate_suggestions: Option<bool>,
}

/// Processing configuration following Google standards
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingConfiguration {
    /// Enable parallel processing
    pub enable_parallel_processing: Option<bool>,
    
    /// Maximum file size to process (bytes)
    pub max_file_size_bytes: Option<u64>,
    
    /// Target programming languages
    pub target_languages: Option<Vec<String>>,
    
    /// Timeout per file (milliseconds)
    pub per_file_timeout_ms: Option<u64>,
    
    /// Memory limit (bytes)
    pub memory_limit_bytes: Option<u64>,
    
    /// Cache processing results
    pub enable_caching: Option<bool>,
}

/// Comprehensive analysis response with detailed results and metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResponse {
    /// Whether analysis completed successfully
    pub analysis_successful: bool,
    
    /// Generated code improvements and suggestions
    pub code_improvements: Vec<CodeImprovement>,
    
    /// Analyzed project context and structure
    pub project_context: CodebaseContext,
    
    /// Response metadata and metrics
    pub response_metadata: ResponseMetadata,
    
    /// ML model insights and predictions
    pub ml_insights: Option<ModelInsights>,
    
    /// Quality assessment results
    pub quality_assessment: QualityAssessment,
}

/// Code improvement suggestion following Google action-oriented patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeImprovement {
    /// Type of improvement recommended
    pub improvement_type: ImprovementType,
    
    /// Target file path
    pub target_file_path: String,
    
    /// New or modified content (for applicable improvements)
    pub suggested_content: Option<String>,
    
    /// Detailed reasoning for the improvement
    pub improvement_rationale: String,
    
    /// Priority level (1-5, higher = more important)
    pub priority_level: u8,
    
    /// Estimated impact score (0.0-1.0)
    pub impact_score: f32,
    
    /// Implementation difficulty (1-5, higher = more difficult)
    pub implementation_difficulty: u8,
    
    /// Line number for targeted improvements
    pub target_line_number: Option<usize>,
    
    /// Column number for precise targeting
    pub target_column_number: Option<usize>,
    
    /// Related improvements (by ID)
    pub related_improvements: Vec<String>,
}

/// Types of code improvements following Google action patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImprovementType {
    /// Create a new file
    CreateNewFile,
    
    /// Modify existing file content
    ModifyExistingFile,
    
    /// Delete unnecessary file
    DeleteFile,
    
    /// Rename file for better clarity
    RenameFile { 
        /// New file path
        new_file_path: String 
    },
    
    /// Move file to better location
    MoveFile { 
        /// New directory path
        new_directory_path: String 
    },
    
    /// Extract method from large function
    ExtractMethod {
        /// Suggested method name
        method_name: String,
        /// Method parameters
        parameters: Vec<String>,
    },
    
    /// Refactor function for better design
    RefactorFunction {
        /// Original function name
        original_name: String,
        /// Suggested new name
        suggested_name: String,
    },
    
    /// Add missing unit tests
    AddUnitTests {
        /// Test file path
        test_file_path: String,
        /// Functions to test
        functions_to_test: Vec<String>,
    },
    
    /// Optimize performance bottleneck
    OptimizePerformance {
        /// Performance issue type
        issue_type: String,
        /// Expected improvement percentage
        expected_improvement: f32,
    },
    
    /// Reduce cyclomatic complexity
    ReduceComplexity {
        /// Current complexity score
        current_complexity: u32,
        /// Target complexity score
        target_complexity: u32,
    },
    
    /// Add missing documentation
    AddDocumentation {
        /// Documentation type
        doc_type: DocumentationType,
        /// Suggested content
        content: String,
    },
    
    /// Fix security vulnerability
    FixSecurityIssue {
        /// Vulnerability type
        vulnerability_type: String,
        /// Severity level
        severity_level: SecuritySeverity,
    },
}

/// Documentation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DocumentationType {
    /// Function/method documentation
    FunctionDocumentation,
    /// Class documentation
    ClassDocumentation,
    /// Module documentation
    ModuleDocumentation,
    /// API documentation
    ApiDocumentation,
    /// README file
    ReadmeDocumentation,
}

/// Security severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SecuritySeverity {
    /// Low impact security issue
    Low,
    /// Medium impact security issue
    Medium,
    /// High impact security issue
    High,
    /// Critical security vulnerability
    Critical,
}

/// Project complexity assessment levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplexityLevel {
    /// Low complexity - easy to maintain
    Low,
    /// Medium complexity - manageable
    Medium,
    /// High complexity - requires attention
    High,
    /// Very high complexity - needs refactoring
    VeryHigh,
}

/// Response metadata with comprehensive metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMetadata {
    /// Total number of files analyzed
    pub files_analyzed_count: usize,
    
    /// Analysis execution time in milliseconds
    pub execution_time_ms: u64,
    
    /// Peak memory usage during analysis (bytes)
    pub peak_memory_usage_bytes: u64,
    
    /// Warnings encountered during analysis
    pub analysis_warnings: Vec<String>,
    
    /// Programming languages detected
    pub detected_languages: Vec<String>,
    
    /// Analysis engine version
    pub engine_version: String,
    
    /// Analysis timestamp
    pub analysis_timestamp: chrono::DateTime<chrono::Utc>,
    
    /// Configuration used for analysis
    pub analysis_configuration: AnalysisOptions,
}

/// Comprehensive quality assessment results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityAssessment {
    /// Overall quality score (0.0-100.0)
    pub overall_quality_score: f32,
    
    /// Code maintainability index
    pub maintainability_index: f32,
    
    /// Average cyclomatic complexity
    pub average_complexity: f32,
    
    /// Test coverage percentage
    pub test_coverage_percentage: f32,
    
    /// Documentation coverage percentage
    pub documentation_coverage_percentage: f32,
    
    /// Number of code smells detected
    pub code_smells_count: usize,
    
    /// Number of security issues
    pub security_issues_count: usize,
    
    /// Performance bottlenecks detected
    pub performance_bottlenecks_count: usize,
    
    /// Technical debt estimation (hours)
    pub technical_debt_hours: f32,
}

/// Analysis statistics across multiple files
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ProjectStatistics {
    /// Total files processed
    pub total_files_processed: usize,
    
    /// Total lines of code
    pub total_lines_of_code: usize,
    
    /// Total functions/methods found
    pub total_functions_count: usize,
    
    /// Average cyclomatic complexity
    pub average_complexity_score: f32,
    
    /// Average test coverage
    pub average_test_coverage: f32,
    
    /// Language distribution
    pub language_distribution: HashMap<String, usize>,
    
    /// File size distribution
    pub file_size_distribution: HashMap<String, usize>, // size ranges -> count
    
    /// Complexity distribution
    pub complexity_distribution: HashMap<String, usize>, // complexity ranges -> count
}

/// Individual file quality report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileQualityReport {
    /// File path being analyzed
    pub file_path: String,
    
    /// Overall quality score for this file
    pub file_quality_score: f32,
    
    /// Cyclomatic complexity for this file
    pub file_complexity: usize,
    
    /// Number of functions in this file
    pub function_count: usize,
    
    /// Lines of code in this file
    pub lines_of_code: usize,
    
    /// Improvement suggestions for this file
    pub improvement_suggestions: Vec<String>,
    
    /// Code smells detected in this file
    pub detected_code_smells: Vec<CodeSmell>,
    
    /// Security issues in this file
    pub security_issues: Vec<SecurityIssue>,
}

/// Code smell detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSmell {
    /// Type of code smell
    pub smell_type: String,
    
    /// Description of the issue
    pub description: String,
    
    /// Line number where smell occurs
    pub line_number: usize,
    
    /// Severity of the smell
    pub severity: SmellSeverity,
    
    /// Suggested fix
    pub suggested_fix: String,
}

/// Code smell severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SmellSeverity {
    /// Minor code smell - nice to fix
    Minor,
    /// Moderate code smell - should fix
    Moderate,
    /// Major code smell - must fix
    Major,
}

/// Security issue detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityIssue {
    /// Type of security issue
    pub issue_type: String,
    
    /// Detailed description
    pub description: String,
    
    /// Line number where issue occurs
    pub line_number: usize,
    
    /// Security severity
    pub severity: SecuritySeverity,
    
    /// Remediation suggestion
    pub remediation: String,
    
    /// OWASP classification if applicable
    pub owasp_category: Option<String>,
}

/// Primary code intelligence engine implementing Google-style patterns
pub struct CodeIntelligenceEngine {
    /// AST analyzer for code parsing
    ast_analyzer: AstAnalyzer,
    
    /// Project context builder
    context_builder: ProjectContextBuilder,
    
    /// Machine learning model for insights
    ml_model: CodeIntelligenceModel,
    
    /// Data persistence manager
    data_manager: DataManager,
    
    /// Memory management system
    memory_manager: CacheManager,
    
    /// Engine configuration
    engine_config: EngineConfiguration,
}

/// Engine configuration following Google config patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EngineConfiguration {
    /// Enable debug logging
    pub debug_logging_enabled: bool,
    
    /// Maximum concurrent processing threads
    pub max_worker_threads: usize,
    
    /// Default analysis timeout (ms)
    pub default_timeout_ms: u64,
    
    /// Cache retention policy
    pub cache_retention_hours: u32,
    
    /// ML model configuration
    pub ml_model_config: ModelConfiguration,
    
    /// Database configuration
    pub database_config: StorageConfiguration,
}

/// ML model configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfiguration {
    /// Model inference timeout
    pub inference_timeout_ms: u64,
    
    /// Confidence threshold for predictions
    pub confidence_threshold: f32,
    
    /// Enable ensemble models
    pub enable_ensemble: bool,
    
    /// Model cache size
    pub model_cache_size_mb: u32,
}

impl CodeIntelligenceEngine {
    /// Create a new code intelligence engine with default configuration
    /// Following Google constructor patterns with comprehensive setup
    pub fn new() -> AnalysisResult<Self> {
        let engine_config = EngineConfiguration::default();
        Self::with_configuration(engine_config)
    }
    
    /// Create engine with custom configuration
    pub fn with_configuration(config: EngineConfiguration) -> AnalysisResult<Self> {
        let ast_analyzer = AstAnalyzer::new()?;
        let context_builder = ProjectContextBuilder::new()?;
        let ml_model = CodeIntelligenceModel::initialize(config.ml_model_config.clone())?;
        let data_manager = DataManager::new(config.database_config.clone())
            .map_err(|e| CodeIntelligenceError::DatabaseOperationFailed { message: format!("{:?}", e) })?;
        let cache_config = crate::memory_management::CacheConfig {
            max_size_entries: 10000, // A reasonable default for analysis results
            default_ttl_seconds: config.cache_retention_hours as u64 * 3600,
            compression_enabled: false,
        };
        let memory_manager = CacheManager::initialize(cache_config)
            .map_err(|e| CodeIntelligenceError::ConfigurationInvalid { message: format!("Cache manager init failed: {:?}", e) })?;
        
        Ok(Self {
            ast_analyzer,
            context_builder,
            ml_model,
            data_manager,
            memory_manager,
            engine_config: config,
        })
    }
    
    /// Process a comprehensive code analysis request
    /// Returns detailed analysis results with ML-powered insights
    pub fn analyze_code(&mut self, request: AnalysisRequest) -> AnalysisResult<AnalysisResponse> {
        let analysis_start_time = std::time::Instant::now();
        
        // Validate request
        self.validate_analysis_request(&request)?;
        
        // Build project context
        let project_context = self.context_builder
            .build_context(&request)
            .map_err(|e| CodeIntelligenceError::AnalysisFailed { 
                message: format!("Context building failed: {}", e) 
            })?;
        
        // Perform detailed file analysis
        let mut file_analyses = Vec::new();
        let mut analysis_warnings = Vec::new();
        
        for file_path in &project_context.relevant_files {
            match self.ast_analyzer.analyze_file(file_path) {
                Ok(analysis) => file_analyses.push(analysis),
                Err(e) => {
                    analysis_warnings.push(format!(
                        "Failed to analyze {}: {}", file_path, e
                    ));
                }
            }
        }
        
        // Generate ML-powered insights
        let ml_insights = if request.analysis_options
            .as_ref()
            .map(|opts| opts.enable_ml_analysis.unwrap_or(true))
            .unwrap_or(true) 
        {
            Some(self.ml_model.generate_insights(&file_analyses, &project_context)?)
        } else {
            None
        };
        
        // Generate code improvements
        let code_improvements = self.generate_code_improvements(
            &request, 
            &project_context, 
            &file_analyses,
            ml_insights.as_ref()
        )?;
        
        // Calculate quality assessment
        let quality_assessment = self.calculate_quality_assessment(&file_analyses)?;
        
        // Prepare response metadata
        let execution_time = analysis_start_time.elapsed().as_millis() as u64;
        let response_metadata = ResponseMetadata {
            files_analyzed_count: project_context.relevant_files.len(),
            execution_time_ms: execution_time,
            peak_memory_usage_bytes: self.get_peak_memory_usage(),
            analysis_warnings,
            detected_languages: project_context.programming_languages.keys().cloned().collect(),
            engine_version: env!("CARGO_PKG_VERSION").to_string(),
            analysis_timestamp: chrono::Utc::now(),
            analysis_configuration: request.analysis_options.unwrap_or_default(),
        };
        
        Ok(AnalysisResponse {
            analysis_successful: true,
            code_improvements,
            project_context,
            response_metadata,
            ml_insights,
            quality_assessment,
        })
    }
    
    /// Validate analysis request for completeness and correctness
    fn validate_analysis_request(&self, request: &AnalysisRequest) -> AnalysisResult<()> {
        if request.task_description.trim().is_empty() {
            return Err(CodeIntelligenceError::ConfigurationInvalid {
                message: "Task description cannot be empty".to_string(),
            });
        }
        
        if request.project_root.trim().is_empty() {
            return Err(CodeIntelligenceError::ConfigurationInvalid {
                message: "Project root path cannot be empty".to_string(),
            });
        }
        
        // Validate project root exists
        if !std::path::Path::new(&request.project_root).exists() {
            return Err(CodeIntelligenceError::ConfigurationInvalid {
                message: format!("Project root path does not exist: {}", request.project_root),
            });
        }
        
        Ok(())
    }
    
    /// Generate comprehensive code improvements using multiple strategies
    fn generate_code_improvements(
        &self,
        request: &AnalysisRequest,
        context: &CodebaseContext,
        file_analyses: &[FileAnalysisResult],
        ml_insights: Option<&ModelInsights>,
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        // Rule-based improvements
        improvements.extend(self.generate_rule_based_improvements(context, file_analyses)?);
        
        // ML-powered improvements
        if let Some(insights) = ml_insights {
            improvements.extend(self.generate_ml_based_improvements(insights)?);
        }
        
        // Complexity-based improvements
        improvements.extend(self.generate_complexity_improvements(file_analyses)?);
        
        // Security-focused improvements
        improvements.extend(self.generate_security_improvements(file_analyses)?);
        
        // Performance improvements
        improvements.extend(self.generate_performance_improvements(file_analyses)?);
        
        // Sort by priority and impact
        improvements.sort_by(|a, b| {
            b.priority_level.cmp(&a.priority_level)
                .then(b.impact_score.partial_cmp(&a.impact_score).unwrap_or(std::cmp::Ordering::Equal))
        });
        
        Ok(improvements)
    }
    
    /// Generate rule-based code improvements
    fn generate_rule_based_improvements(
        &self,
        context: &CodebaseContext,
        file_analyses: &[FileAnalysisResult],
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        // Check for empty project
        if context.relevant_files.is_empty() {
            improvements.push(CodeImprovement {
                improvement_type: ImprovementType::CreateNewFile,
                target_file_path: "README.md".to_string(),
                suggested_content: Some(format!(
                    "# Project Analysis Results\n\n\
                    Task: {}\n\n\
                    No source files found for analysis.\n\n\
                    ## Suggestions\n\
                    - Add source code files to the project\n\
                    - Check file exclusion patterns\n\
                    - Verify project structure\n",
                    "Analysis"
                )),
                improvement_rationale: "Project appears empty - created README with analysis results".to_string(),
                priority_level: 3,
                impact_score: 0.5,
                implementation_difficulty: 1,
                target_line_number: None,
                target_column_number: None,
                related_improvements: Vec::new(),
            });
        }
        
        // Check for high overall complexity
        if matches!(context.overall_complexity, ComplexityLevel::High | ComplexityLevel::VeryHigh) {
            improvements.push(CodeImprovement {
                improvement_type: ImprovementType::CreateNewFile,
                target_file_path: "REFACTORING_PLAN.md".to_string(),
                suggested_content: Some(format!(
                    "# Refactoring Plan\n\n\
                    The codebase has {} complexity with {} files analyzed.\n\n\
                    ## Priority Actions\n\
                    1. Break down complex functions\n\
                    2. Improve modularity\n\
                    3. Add unit tests\n\
                    4. Extract common utilities\n\n\
                    ## Metrics\n\
                    - Files: {}\n\
                    - Total LOC: {}\n",
                    match context.overall_complexity {
                        ComplexityLevel::High => "high",
                        ComplexityLevel::VeryHigh => "very high", 
                        _ => "elevated"
                    },
                    context.relevant_files.len(),
                    context.relevant_files.len(),
                    context.total_lines_of_code
                )),
                improvement_rationale: "High complexity detected - created refactoring plan".to_string(),
                priority_level: 4,
                impact_score: 0.8,
                implementation_difficulty: 3,
                target_line_number: None,
                target_column_number: None,
                related_improvements: Vec::new(),
            });
        }
        
        // Analyze individual files for improvements
        for analysis in file_analyses {
            improvements.extend(self.analyze_file_for_improvements(analysis)?);
        }
        
        Ok(improvements)
    }
    
    /// Analyze individual file for specific improvements
    fn analyze_file_for_improvements(
        &self,
        analysis: &FileAnalysisResult
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        // Check for high cyclomatic complexity
        if analysis.complexity_metrics.cyclomatic_complexity > 15 {
            improvements.push(CodeImprovement {
                improvement_type: ImprovementType::ReduceComplexity {
                    current_complexity: analysis.complexity_metrics.cyclomatic_complexity as u32,
                    target_complexity: 10,
                },
                target_file_path: analysis.file_path.clone(),
                suggested_content: Some(format!(
                    "// TODO: Reduce cyclomatic complexity from {} to 10 or below\n\
                    // Consider:\n\
                    // 1. Extract methods for complex logic\n\
                    // 2. Use early returns to reduce nesting\n\
                    // 3. Break down large functions\n\
                    // 4. Apply strategy pattern for complex conditionals",
                    analysis.complexity_metrics.cyclomatic_complexity
                )),
                improvement_rationale: format!(
                    "High cyclomatic complexity ({}) exceeds recommended threshold (10)",
                    analysis.complexity_metrics.cyclomatic_complexity
                ),
                priority_level: 4,
                impact_score: 0.7,
                implementation_difficulty: 3,
                target_line_number: Some(1),
                target_column_number: Some(1),
                related_improvements: Vec::new(),
            });
        }
        
        // Check for low test coverage
        if analysis.test_coverage < 0.6 && analysis.symbol_count > 0 {
            improvements.push(CodeImprovement {
                improvement_type: ImprovementType::AddUnitTests {
                    test_file_path: format!("tests/{}_test.rs", 
                        std::path::Path::new(&analysis.file_path)
                            .file_stem()
                            .and_then(|s| s.to_str())
                            .unwrap_or("unnamed")
                    ),
                    functions_to_test: analysis.symbol_references
                        .iter()
                        .filter(|s| matches!(s.symbol_type, crate::ast_analysis::SymbolType::Function))
                        .map(|s| s.symbol_name.clone())
                        .collect(),
                },
                target_file_path: analysis.file_path.clone(),
                suggested_content: Some(format!(
                    "#[cfg(test)]\n\
                    mod tests {{\n    \
                        use super::*;\n\n    \
                        // TODO: Add tests for {} functions\n    \
                        // Current test coverage: {:.1}%\n    \
                        // Target: 80%+\n\
                    }}",
                    analysis.symbol_count,
                    analysis.test_coverage * 100.0
                )),
                improvement_rationale: format!(
                    "Low test coverage ({:.1}%) - should be 80% or higher",
                    analysis.test_coverage * 100.0
                ),
                priority_level: 3,
                impact_score: 0.6,
                implementation_difficulty: 2,
                target_line_number: None,
                target_column_number: None,
                related_improvements: Vec::new(),
            });
        }
        
        // Check for very long functions (estimated)
        if analysis.symbol_count > 0 {
            let avg_lines_per_symbol = analysis.line_count as f32 / analysis.symbol_count as f32;
            if avg_lines_per_symbol > 50.0 {
                improvements.push(CodeImprovement {
                    improvement_type: ImprovementType::ExtractMethod {
                        method_name: "extract_large_function_logic".to_string(),
                        parameters: vec!["context".to_string(), "config".to_string()],
                    },
                    target_file_path: analysis.file_path.clone(),
                    suggested_content: Some(
                        "// Consider extracting large functions into smaller, focused methods\n\
                        // Benefits:\n\
                        // - Improved readability\n\
                        // - Better testability\n\
                        // - Easier maintenance\n\
                        // - Single responsibility principle".to_string()
                    ),
                    improvement_rationale: format!(
                        "Functions are quite large (avg {:.1} lines) - consider extraction",
                        avg_lines_per_symbol
                    ),
                    priority_level: 3,
                    impact_score: 0.5,
                    implementation_difficulty: 2,
                    target_line_number: None,
                    target_column_number: None,
                    related_improvements: Vec::new(),
                });
            }
        }
        
        Ok(improvements)
    }
    
    /// Generate ML-based improvements using model insights
    fn generate_ml_based_improvements(
        &self,
        insights: &ModelInsights
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        // Process each ML prediction
        for prediction in &insights.predictions {
            if prediction.confidence > 0.7 {
                let improvement = CodeImprovement {
                    improvement_type: match prediction.prediction_type.as_str() {
                        "refactor_suggestion" => ImprovementType::RefactorFunction {
                            original_name: prediction.target_entity.clone(),
                            suggested_name: format!("{}_improved", prediction.target_entity),
                        },
                        "performance_optimization" => ImprovementType::OptimizePerformance {
                            issue_type: "ML-identified bottleneck".to_string(),
                            expected_improvement: prediction.confidence * 30.0, // Estimated percentage
                        },
                        "security_issue" => ImprovementType::FixSecurityIssue {
                            vulnerability_type: prediction.target_entity.clone(),
                            severity_level: if prediction.confidence > 0.9 {
                                SecuritySeverity::High
                            } else if prediction.confidence > 0.8 {
                                SecuritySeverity::Medium  
                            } else {
                                SecuritySeverity::Low
                            },
                        },
                        _ => ImprovementType::ModifyExistingFile,
                    },
                    target_file_path: prediction.file_path.clone(),
                    suggested_content: Some(prediction.suggested_action.clone()),
                    improvement_rationale: format!(
                        "ML model detected: {} (confidence: {:.1}%)",
                        prediction.description, prediction.confidence * 100.0
                    ),
                    priority_level: if prediction.confidence > 0.9 { 5 } 
                                   else if prediction.confidence > 0.8 { 4 }
                                   else { 3 },
                    impact_score: prediction.confidence,
                    implementation_difficulty: prediction.implementation_complexity.unwrap_or(2),
                    target_line_number: prediction.line_number,
                    target_column_number: prediction.column_number,
                    related_improvements: Vec::new(),
                };
                improvements.push(improvement);
            }
        }
        
        Ok(improvements)
    }
    
    /// Generate complexity-focused improvements
    fn generate_complexity_improvements(
        &self,
        file_analyses: &[FileAnalysisResult]
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        for analysis in file_analyses {
            // Check for deep nesting
            if analysis.complexity_metrics.max_nesting_depth > 5 {
                improvements.push(CodeImprovement {
                    improvement_type: ImprovementType::RefactorFunction {
                        original_name: "deeply_nested_function".to_string(),
                        suggested_name: "refactored_function".to_string(),
                    },
                    target_file_path: analysis.file_path.clone(),
                    suggested_content: Some(
                        "// Reduce nesting depth using:\n\
                        // 1. Early returns/continues\n\
                        // 2. Guard clauses\n\
                        // 3. Extract nested logic to separate functions\n\
                        // 4. Use functional programming patterns".to_string()
                    ),
                    improvement_rationale: format!(
                        "Deep nesting detected (depth: {}) - exceeds recommended limit (4)",
                        analysis.complexity_metrics.max_nesting_depth
                    ),
                    priority_level: 3,
                    impact_score: 0.6,
                    implementation_difficulty: 3,
                    target_line_number: None,
                    target_column_number: None,
                    related_improvements: Vec::new(),
                });
            }
        }
        
        Ok(improvements)
    }
    
    /// Generate security-focused improvements
    fn generate_security_improvements(
        &self,
        file_analyses: &[FileAnalysisResult]
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        // Check for potential security patterns
        for analysis in file_analyses {
            // Look for unsafe patterns (simplified heuristic)
            if analysis.file_path.ends_with(".rs") && analysis.line_count > 100 {
                // This is a simplified check - in reality would use AST analysis
                improvements.push(CodeImprovement {
                    improvement_type: ImprovementType::FixSecurityIssue {
                        vulnerability_type: "Potential unsafe code patterns".to_string(),
                        severity_level: SecuritySeverity::Medium,
                    },
                    target_file_path: analysis.file_path.clone(),
                    suggested_content: Some(
                        "// Security review recommendations:\n\
                        // 1. Audit all unsafe blocks\n\
                        // 2. Validate all external inputs\n\
                        // 3. Use safe string handling\n\
                        // 4. Implement proper error handling\n\
                        // 5. Review dependency security".to_string()
                    ),
                    improvement_rationale: "Large file may contain security vulnerabilities - needs review".to_string(),
                    priority_level: 4,
                    impact_score: 0.7,
                    implementation_difficulty: 2,
                    target_line_number: Some(1),
                    target_column_number: None,
                    related_improvements: Vec::new(),
                });
            }
        }
        
        Ok(improvements)
    }
    
    /// Generate performance-focused improvements
    fn generate_performance_improvements(
        &self,
        file_analyses: &[FileAnalysisResult]
    ) -> AnalysisResult<Vec<CodeImprovement>> {
        let mut improvements = Vec::new();
        
        // Look for performance optimization opportunities
        for analysis in file_analyses {
            // Check for very large files (potential performance impact)
            if analysis.line_count > 1000 {
                improvements.push(CodeImprovement {
                    improvement_type: ImprovementType::OptimizePerformance {
                        issue_type: "Large file size".to_string(),
                        expected_improvement: 15.0, // Estimated percentage
                    },
                    target_file_path: analysis.file_path.clone(),
                    suggested_content: Some(
                        "// Performance optimization strategies:\n\
                        // 1. Split large file into modules\n\
                        // 2. Profile critical code paths\n\
                        // 3. Consider lazy loading\n\
                        // 4. Optimize data structures\n\
                        // 5. Cache expensive computations".to_string()
                    ),
                    improvement_rationale: format!(
                        "Large file ({} lines) may impact performance - consider optimization",
                        analysis.line_count
                    ),
                    priority_level: 2,
                    impact_score: 0.4,
                    implementation_difficulty: 3,
                    target_line_number: None,
                    target_column_number: None,
                    related_improvements: Vec::new(),
                });
            }
        }
        
        Ok(improvements)
    }
    
    /// Calculate comprehensive quality assessment
    fn calculate_quality_assessment(
        &self,
        file_analyses: &[FileAnalysisResult]
    ) -> AnalysisResult<QualityAssessment> {
        if file_analyses.is_empty() {
            return Ok(QualityAssessment {
                overall_quality_score: 50.0,
                maintainability_index: 50.0,
                average_complexity: 0.0,
                test_coverage_percentage: 0.0,
                documentation_coverage_percentage: 0.0,
                code_smells_count: 0,
                security_issues_count: 0,
                performance_bottlenecks_count: 0,
                technical_debt_hours: 0.0,
            });
        }
        
        let total_files = file_analyses.len() as f32;
        let total_complexity: f32 = file_analyses.iter()
            .map(|a| a.complexity_metrics.cyclomatic_complexity as f32)
            .sum();
        let average_complexity = total_complexity / total_files;
        
        let average_test_coverage: f32 = file_analyses.iter()
            .map(|a| a.test_coverage)
            .sum::<f32>() / total_files;
        
        // Quality score calculation (simplified algorithm)
        let mut quality_score = 100.0;
        
        // Penalize high complexity
        if average_complexity > 10.0 {
            quality_score -= (average_complexity - 10.0) * 3.0;
        }
        
        // Reward good test coverage
        quality_score = quality_score * (0.5 + average_test_coverage * 0.5);
        
        // Count code smells (simplified)
        let code_smells_count = file_analyses.iter()
            .map(|a| {
                let mut smells = 0;
                if a.complexity_metrics.cyclomatic_complexity > 15 { smells += 1; }
                if a.complexity_metrics.max_nesting_depth > 5 { smells += 1; }
                if a.test_coverage < 0.5 { smells += 1; }
                smells
            })
            .sum();
        
        // Estimate technical debt (simplified calculation)
        let technical_debt_hours = file_analyses.iter()
            .map(|a| {
                let mut debt = 0.0;
                if a.complexity_metrics.cyclomatic_complexity > 15 {
                    debt += (a.complexity_metrics.cyclomatic_complexity - 15) as f32 * 0.5;
                }
                if a.test_coverage < 0.8 {
                    debt += (0.8 - a.test_coverage) * 4.0; // 4 hours per 10% missing coverage
                }
                debt
            })
            .sum();
        
        Ok(QualityAssessment {
            overall_quality_score: quality_score.max(0.0).min(100.0),
            maintainability_index: (100.0 - average_complexity * 5.0).max(0.0).min(100.0),
            average_complexity,
            test_coverage_percentage: average_test_coverage * 100.0,
            documentation_coverage_percentage: 50.0, // Placeholder - would need real analysis
            code_smells_count,
            security_issues_count: file_analyses.len() / 5, // Rough estimate
            performance_bottlenecks_count: file_analyses.iter()
                .filter(|a| a.line_count > 1000)
                .count(),
            technical_debt_hours,
        })
    }
    
    /// Get current peak memory usage
    fn get_peak_memory_usage(&self) -> u64 {
        // Placeholder implementation - would use system-specific memory tracking
        std::mem::size_of::<Self>() as u64 * 1024
    }
    
    /// Analyze a single file for quality assessment
    pub fn analyze_single_file(&mut self, file_path: &str) -> AnalysisResult<FileQualityReport> {
        let analysis = self.ast_analyzer.analyze_file(file_path)?;
        
        let quality_score = self.calculate_file_quality_score(&analysis);
        let improvement_suggestions = self.generate_file_improvement_suggestions(&analysis);
        let code_smells = self.detect_code_smells(&analysis);
        let security_issues = self.detect_security_issues(&analysis);
        
        Ok(FileQualityReport {
            file_path: file_path.to_string(),
            file_quality_score: quality_score,
            file_complexity: analysis.complexity_metrics.cyclomatic_complexity,
            function_count: analysis.symbol_count,
            lines_of_code: analysis.line_count,
            improvement_suggestions,
            detected_code_smells: code_smells,
            security_issues,
        })
    }
    
    /// Calculate quality score for a single file
    fn calculate_file_quality_score(&self, analysis: &FileAnalysisResult) -> f32 {
        let mut score = 100.0;
        
        // Penalize high complexity
        if analysis.complexity_metrics.cyclomatic_complexity > 10 {
            score -= (analysis.complexity_metrics.cyclomatic_complexity - 10) as f32 * 2.0;
        }
        
        // Penalize deep nesting
        if analysis.complexity_metrics.max_nesting_depth > 4 {
            score -= (analysis.complexity_metrics.max_nesting_depth - 4) as f32 * 5.0;
        }
        
        // Penalize low test coverage
        score *= (0.3 + analysis.test_coverage * 0.7);
        
        // Penalize very long files
        if analysis.line_count > 500 {
            score *= 0.9;
        }
        
        score.max(0.0).min(100.0)
    }
    
    /// Generate improvement suggestions for a single file
    fn generate_file_improvement_suggestions(&self, analysis: &FileAnalysisResult) -> Vec<String> {
        let mut suggestions = Vec::new();
        
        if analysis.complexity_metrics.cyclomatic_complexity > 10 {
            suggestions.push("Consider breaking down complex functions into smaller, focused functions".to_string());
        }
        
        if analysis.complexity_metrics.max_nesting_depth > 4 {
            suggestions.push("Reduce nesting depth by using early returns and guard clauses".to_string());
        }
        
        if analysis.test_coverage < 0.8 {
            suggestions.push("Increase test coverage to 80% or higher".to_string());
        }
        
        if analysis.line_count > 500 {
            suggestions.push("Consider splitting this large file into smaller, focused modules".to_string());
        }
        
        if analysis.symbol_count == 0 {
            suggestions.push("File appears to have no functions or classes - verify completeness".to_string());
        }
        
        if suggestions.is_empty() {
            suggestions.push("Code quality looks excellent! Keep up the good practices.".to_string());
        }
        
        suggestions
    }
    
    /// Detect code smells in a file
    fn detect_code_smells(&self, analysis: &FileAnalysisResult) -> Vec<CodeSmell> {
        let mut smells = Vec::new();
        
        // Long file smell
        if analysis.line_count > 1000 {
            smells.push(CodeSmell {
                smell_type: "Long File".to_string(),
                description: format!("File has {} lines, which exceeds recommended limit of 500", analysis.line_count),
                line_number: 1,
                severity: SmellSeverity::Major,
                suggested_fix: "Split into smaller, focused modules".to_string(),
            });
        }
        
        // High complexity smell
        if analysis.complexity_metrics.cyclomatic_complexity > 15 {
            smells.push(CodeSmell {
                smell_type: "High Complexity".to_string(),
                description: format!("Cyclomatic complexity is {}, exceeding recommended limit of 10", 
                    analysis.complexity_metrics.cyclomatic_complexity),
                line_number: 1,
                severity: SmellSeverity::Major,
                suggested_fix: "Break down complex functions into smaller ones".to_string(),
            });
        }
        
        // Deep nesting smell
        if analysis.complexity_metrics.max_nesting_depth > 5 {
            smells.push(CodeSmell {
                smell_type: "Deep Nesting".to_string(),
                description: format!("Maximum nesting depth is {}, exceeding recommended limit of 4", 
                    analysis.complexity_metrics.max_nesting_depth),
                line_number: 1,
                severity: SmellSeverity::Moderate,
                suggested_fix: "Use early returns and extract nested logic".to_string(),
            });
        }
        
        smells
    }
    
    /// Detect potential security issues
    fn detect_security_issues(&self, analysis: &FileAnalysisResult) -> Vec<SecurityIssue> {
        let mut issues = Vec::new();
        
        // Large files might contain security vulnerabilities (heuristic)
        if analysis.line_count > 1000 {
            issues.push(SecurityIssue {
                issue_type: "Large File Security Review".to_string(),
                description: "Large files require thorough security review".to_string(),
                line_number: 1,
                severity: SecuritySeverity::Low,
                remediation: "Conduct security code review focusing on input validation and error handling".to_string(),
                owasp_category: None,
            });
        }
        
        // Files with no test coverage might have unverified security behavior
        if analysis.test_coverage < 0.3 {
            issues.push(SecurityIssue {
                issue_type: "Insufficient Test Coverage".to_string(),
                description: "Low test coverage may hide security vulnerabilities".to_string(),
                line_number: 1,
                severity: SecuritySeverity::Medium,
                remediation: "Implement comprehensive unit tests including security test cases".to_string(),
                owasp_category: Some("A06:2021 – Vulnerable and Outdated Components".to_string()),
            });
        }
        
        issues
    }
    
    /// Get comprehensive project statistics
    pub fn get_project_statistics(&mut self, file_paths: &[String]) -> AnalysisResult<ProjectStatistics> {
        let mut stats = ProjectStatistics::default();
        let mut language_counts = HashMap::new();
        let mut complexity_sum = 0.0;
        let mut test_coverage_sum = 0.0;
        
        for file_path in file_paths {
            match self.ast_analyzer.analyze_file(file_path) {
                Ok(analysis) => {
                    stats.total_files_processed += 1;
                    stats.total_lines_of_code += analysis.line_count;
                    stats.total_functions_count += analysis.symbol_count;
                    
                    complexity_sum += analysis.complexity_metrics.cyclomatic_complexity as f32;
                    test_coverage_sum += analysis.test_coverage;
                    
                    // Track language distribution
                    *language_counts.entry(analysis.programming_language.clone()).or_insert(0) += 1;
                    
                    // Track file size distribution
                    let size_category = match analysis.line_count {
                        0..=100 => "Small (0-100)",
                        101..=300 => "Medium (101-300)", 
                        301..=500 => "Large (301-500)",
                        _ => "Very Large (500+)",
                    };
                    *stats.file_size_distribution.entry(size_category.to_string()).or_insert(0) += 1;
                    
                    // Track complexity distribution
                    let complexity_category = match analysis.complexity_metrics.cyclomatic_complexity {
                        0..=5 => "Low (0-5)",
                        6..=10 => "Medium (6-10)",
                        11..=15 => "High (11-15)",
                        _ => "Very High (15+)",
                    };
                    *stats.complexity_distribution.entry(complexity_category.to_string()).or_insert(0) += 1;
                }
                Err(_) => {
                    // Skip files that couldn't be analyzed
                    continue;
                }
            }
        }
        
        // Calculate averages
        if stats.total_files_processed > 0 {
            stats.average_complexity_score = complexity_sum / stats.total_files_processed as f32;
            stats.average_test_coverage = test_coverage_sum / stats.total_files_processed as f32;
        }
        
        stats.language_distribution = language_counts;
        
        Ok(stats)
    }
    
    /// Get list of supported programming languages
    pub fn get_supported_languages() -> Vec<&'static str> {
        vec![
            "rust",
            "typescript",
            "javascript", 
            "python",
            "go",
            "java",
            "cpp",
            "c",
            "csharp",
            "php",
            "ruby",
            "swift",
            "kotlin",
            "scala",
        ]
    }
}

// Default implementations following Google standards
impl Default for AnalysisOptions {
    fn default() -> Self {
        Self {
            max_file_count: Some(1000),
            include_test_files: Some(true),
            include_documentation: Some(true),
            exclusion_patterns: Some(vec![
                "node_modules".to_string(),
                ".git".to_string(),
                "target".to_string(),
                "dist".to_string(),
                "build".to_string(),
                ".cargo".to_string(),
                "__pycache__".to_string(),
                ".pytest_cache".to_string(),
                "coverage".to_string(),
            ]),
            analysis_depth: Some(3),
            enable_ml_analysis: Some(true),
            generate_suggestions: Some(true),
        }
    }
}

impl Default for ProcessingConfiguration {
    fn default() -> Self {
        Self {
            enable_parallel_processing: Some(true),
            max_file_size_bytes: Some(10 * 1024 * 1024), // 10MB
            target_languages: None, // All supported languages
            per_file_timeout_ms: Some(30_000), // 30 seconds
            memory_limit_bytes: Some(1024 * 1024 * 1024), // 1GB
            enable_caching: Some(true),
        }
    }
}

impl Default for EngineConfiguration {
    fn default() -> Self {
        Self {
            debug_logging_enabled: false,
            max_worker_threads: num_cpus::get(),
            default_timeout_ms: 120_000, // 2 minutes
            cache_retention_hours: 24,
            ml_model_config: ModelConfiguration::default(),
            database_config: StorageConfiguration {
                primary_storage_path: std::path::PathBuf::from("./data"),
                backup_storage_path: std::path::PathBuf::from("./backup"),
                cache_storage_path: std::path::PathBuf::from("./cache"),
                compression_enabled: true,
                backup_interval_hours: 24,
                max_storage_size_gb: 10,
                retention_policy_days: 30,
                encryption_enabled: false,
                replication_factor: 1,
            },
        }
    }
}

impl Default for ModelConfiguration {
    fn default() -> Self {
        Self {
            inference_timeout_ms: 10_000, // 10 seconds
            confidence_threshold: 0.7,
            enable_ensemble: true,
            model_cache_size_mb: 512,
        }
    }
}

// C FFI exports for external language bindings
#[no_mangle]
pub extern "C" fn code_intelligence_engine_new() -> *mut CodeIntelligenceEngine {
    match CodeIntelligenceEngine::new() {
        Ok(engine) => Box::into_raw(Box::new(engine)),
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub unsafe extern "C" fn code_intelligence_engine_free(engine: *mut CodeIntelligenceEngine) {
    if !engine.is_null() {
        drop(Box::from_raw(engine));
    }
}

/// JSON-based API for easier language bindings
pub fn analyze_code_from_json(request_json: &str) -> std::result::Result<String, String> {
    let request: AnalysisRequest = serde_json::from_str(request_json)
        .map_err(|e| format!("Invalid request JSON: {}", e))?;
    
    let mut engine = CodeIntelligenceEngine::new()
        .map_err(|e| format!("Engine initialization failed: {}", e))?;
        
    let response = engine.analyze_code(request)
        .map_err(|e| format!("Analysis failed: {}", e))?;
    
    serde_json::to_string(&response)
        .map_err(|e| format!("Response serialization failed: {}", e))
}

// Legacy compatibility aliases
pub type FileAwareError = CodeIntelligenceError;
pub type FileAwareRequest = AnalysisRequest; 
pub type FileAwareResponse = AnalysisResponse;
pub type FileAwareCore = CodeIntelligenceEngine;
pub type Result<T> = AnalysisResult<T>;
pub type AnalyzedContext = CodebaseContext;
pub type FileChange = CodeImprovement;
pub type ChangeType = ImprovementType;

// Re-export commonly used types for convenience
pub use chrono::{DateTime, Utc};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_engine_creation() {
        let engine = CodeIntelligenceEngine::new();
        assert!(engine.is_ok());
    }

    #[test] 
    fn test_analysis_request_validation() {
        let request = AnalysisRequest {
            task_description: "Test analysis".to_string(),
            target_files: vec!["test.rs".to_string()],
            project_root: std::env::current_dir().unwrap().to_string_lossy().to_string(),
            analysis_options: None,
            processing_config: None,
        };
        
        let engine = CodeIntelligenceEngine::new().unwrap();
        let validation_result = engine.validate_analysis_request(&request);
        assert!(validation_result.is_ok());
    }

    #[test]
    fn test_supported_languages() {
        let languages = CodeIntelligenceEngine::get_supported_languages();
        assert!(languages.contains(&"rust"));
        assert!(languages.contains(&"typescript"));
        assert!(languages.contains(&"python"));
        assert!(languages.len() >= 10);
    }

    #[test]
    fn test_json_api() {
        let request = AnalysisRequest {
            task_description: "Test JSON API".to_string(),
            target_files: vec![],
            project_root: std::env::current_dir().unwrap().to_string_lossy().to_string(),
            analysis_options: Some(AnalysisOptions::default()),
            processing_config: Some(ProcessingConfiguration::default()),
        };
        
        let request_json = serde_json::to_string(&request).unwrap();
        let result = analyze_code_from_json(&request_json);
        
        // Should succeed even with empty file list
        assert!(result.is_ok());
    }

    #[test]
    fn test_default_configurations() {
        let analysis_opts = AnalysisOptions::default();
        assert_eq!(analysis_opts.max_file_count, Some(1000));
        assert_eq!(analysis_opts.include_test_files, Some(true));
        
        let processing_config = ProcessingConfiguration::default(); 
        assert_eq!(processing_config.enable_parallel_processing, Some(true));
        assert!(processing_config.max_file_size_bytes.is_some());
        
        let engine_config = EngineConfiguration::default();
        assert_eq!(engine_config.debug_logging_enabled, false);
        assert!(engine_config.max_worker_threads > 0);
    }
}