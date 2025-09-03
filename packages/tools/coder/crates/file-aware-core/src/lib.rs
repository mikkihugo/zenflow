//! File-Aware Core - Pure Rust Implementation
//!
//! Platform-agnostic file analysis and code intelligence core.
//! Designed to be embedded in Node.js, Elixir (via Rustler), Python, or standalone.

#![allow(clippy::module_name_repetitions)]

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

pub mod analysis;
pub mod context;
pub mod dependencies;
pub mod parser;
pub mod patterns;
pub mod symbols;

pub use analysis::FileAnalyzer;
pub use context::ContextBuilder;

/// Error types for file-aware operations
#[derive(thiserror::Error, Debug, Clone, Serialize, Deserialize)]
pub enum FileAwareError {
    #[error("IO error: {message}")]
    Io { message: String },
    
    #[error("Parse error in {file}: {message}")]
    Parse { file: String, message: String },
    
    #[error("Analysis error: {message}")]
    Analysis { message: String },
    
    #[error("Unsupported language: {language}")]
    UnsupportedLanguage { language: String },
}

/// Result type for file-aware operations
pub type Result<T> = std::result::Result<T, FileAwareError>;

/// Request for file-aware analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileAwareRequest {
    /// Task description
    pub task: String,
    
    /// Specific files to analyze (optional - will auto-discover if empty)
    pub files: Vec<String>,
    
    /// Root path for analysis
    pub root_path: String,
    
    /// Analysis context options
    pub context: Option<ContextOptions>,
    
    /// Processing options
    pub options: Option<ProcessingOptions>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextOptions {
    /// Maximum number of files to analyze
    pub max_files: Option<usize>,
    
    /// Include test files
    pub include_tests: Option<bool>,
    
    /// Include documentation files
    pub include_docs: Option<bool>,
    
    /// File patterns to exclude
    pub exclude_patterns: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingOptions {
    /// Enable parallel processing
    pub parallel: Option<bool>,
    
    /// Maximum file size to analyze (in bytes)
    pub max_file_size: Option<u64>,
    
    /// Languages to analyze
    pub languages: Option<Vec<String>>,
}

/// Response from file-aware analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileAwareResponse {
    /// Analysis successful
    pub success: bool,
    
    /// Generated file changes
    pub changes: Vec<FileChange>,
    
    /// Analyzed codebase context
    pub context: AnalyzedContext,
    
    /// Response metadata
    pub metadata: ResponseMetadata,
}

/// A suggested change to a file
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileChange {
    /// Type of change
    pub change_type: ChangeType,
    
    /// File path
    pub path: String,
    
    /// New content (for create/modify)
    pub content: Option<String>,
    
    /// Reasoning for this change
    pub reasoning: String,
    
    /// Line number for the change
    pub line: Option<usize>,
    
    /// Column number for the change
    pub column: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeType {
    Create,
    Modify,
    Delete,
    Rename { new_path: String },
    Move { new_path: String },
}

/// Analyzed codebase context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzedContext {
    /// Files that were analyzed
    pub relevant_files: Vec<String>,
    
    /// File dependencies
    pub dependencies: Vec<FileDependency>,
    
    /// Symbol references
    pub symbols: Vec<SymbolReference>,
    
    /// Analysis summary
    pub summary: String,
    
    /// Assessed complexity level
    pub complexity: ComplexityLevel,
    
    /// Language breakdown
    pub languages: HashMap<String, usize>,
    
    /// Total lines of code analyzed
    pub total_lines: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDependency {
    /// Source file
    pub from: String,
    
    /// Target file/module
    pub to: String,
    
    /// Type of dependency
    pub dependency_type: DependencyType,
    
    /// Line number where dependency occurs
    pub line: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyType {
    Import,
    Include,
    Reference,
    Inheritance,
    Call,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolReference {
    /// Symbol name
    pub name: String,
    
    /// Symbol type
    pub symbol_type: SymbolType,
    
    /// File containing the symbol
    pub file: String,
    
    /// Line number
    pub line: usize,
    
    /// Column number
    pub column: usize,
    
    /// Symbol scope
    pub scope: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SymbolType {
    Function,
    Class,
    Interface,
    Struct,
    Enum,
    Variable,
    Constant,
    Type,
    Module,
    Namespace,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplexityLevel {
    Low,
    Medium,
    High,
    VeryHigh,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseMetadata {
    /// Number of files analyzed
    pub files_analyzed: usize,
    
    /// Analysis execution time (ms)
    pub execution_time_ms: u64,
    
    /// Memory usage during analysis (bytes)
    pub memory_usage_bytes: u64,
    
    /// Warnings encountered
    pub warnings: Vec<String>,
    
    /// Languages detected
    pub languages_detected: Vec<String>,
}

/// Main file-aware analysis engine
pub struct FileAwareCore {
    analyzer: FileAnalyzer,
    context_builder: ContextBuilder,
}

impl FileAwareCore {
    /// Create a new file-aware core instance
    pub fn new() -> Self {
        Self {
            analyzer: FileAnalyzer::new(),
            context_builder: ContextBuilder::new(),
        }
    }
    
    /// Process a file-aware request
    pub fn process_request(&self, request: FileAwareRequest) -> Result<FileAwareResponse> {
        let start_time = std::time::Instant::now();
        
        // Build analysis context
        let context = self.context_builder.build_context(&request)?;
        
        // Generate rule-based changes (no LLM calls here)
        let changes = self.generate_changes(&request, &context)?;
        
        let execution_time = start_time.elapsed().as_millis() as u64;
        
        Ok(FileAwareResponse {
            success: true,
            changes,
            context,
            metadata: ResponseMetadata {
                files_analyzed: context.relevant_files.len(),
                execution_time_ms: execution_time,
                memory_usage_bytes: self.get_memory_usage(),
                warnings: Vec::new(),
                languages_detected: context.languages.keys().cloned().collect(),
            },
        })
    }
    
    /// Generate file changes based on patterns and rules
    fn generate_changes(&self, request: &FileAwareRequest, context: &AnalyzedContext) -> Result<Vec<FileChange>> {
        let mut changes = Vec::new();
        
        // Rule-based change generation
        if context.relevant_files.is_empty() {
            // Create documentation when no files found
            changes.push(FileChange {
                change_type: ChangeType::Create,
                path: "ANALYSIS.md".to_string(),
                content: Some(format!(
                    "# Analysis Results\n\nTask: {}\n\nNo relevant files found for analysis.\n\nSuggestion: Check file patterns and exclusions.",
                    request.task
                )),
                reasoning: "Created analysis documentation for empty result".to_string(),
                line: None,
                column: None,
            });
        } else {
            // Generate context-based suggestions
            if matches!(context.complexity, ComplexityLevel::High | ComplexityLevel::VeryHigh) {
                changes.push(FileChange {
                    change_type: ChangeType::Create,
                    path: "REFACTORING_SUGGESTIONS.md".to_string(),
                    content: Some(format!(
                        "# Refactoring Suggestions\n\nThe codebase has {} complexity with {} files analyzed.\n\nConsider breaking down complex functions and improving modularity.",
                        match context.complexity {
                            ComplexityLevel::High => "high",
                            ComplexityLevel::VeryHigh => "very high",
                            _ => "unknown"
                        },
                        context.relevant_files.len()
                    )),
                    reasoning: "High complexity detected - suggesting refactoring".to_string(),
                    line: None,
                    column: None,
                });
            }
        }
        
        Ok(changes)
    }
    
    /// Get current memory usage
    fn get_memory_usage(&self) -> u64 {
        // Platform-agnostic memory usage estimation
        // In real implementation, would use system-specific methods
        std::mem::size_of::<Self>() as u64 * 1024 // Rough estimate
    }
    
    /// Analyze a single file (public API for external use)
    pub fn analyze_file(&self, file_path: &str, root_path: &str) -> Result<AnalyzedContext> {
        let request = FileAwareRequest {
            task: format!("Analyze file: {}", file_path),
            files: vec![file_path.to_string()],
            root_path: root_path.to_string(),
            context: None,
            options: None,
        };
        
        self.context_builder.build_context(&request)
    }
    
    /// Get supported languages
    pub fn supported_languages() -> Vec<&'static str> {
        vec![
            "rust",
            "typescript", 
            "javascript",
            "python",
            "go",
            "java",
            "cpp",
            "c",
        ]
    }
}

impl Default for FileAwareCore {
    fn default() -> Self {
        Self::new()
    }
}

// Public API functions for external bindings (Rustler, PyO3, etc.)
#[no_mangle]
pub extern "C" fn file_aware_core_new() -> *mut FileAwareCore {
    Box::into_raw(Box::new(FileAwareCore::new()))
}

#[no_mangle]
pub extern "C" fn file_aware_core_free(core: *mut FileAwareCore) {
    if !core.is_null() {
        unsafe {
            drop(Box::from_raw(core));
        }
    }
}

// JSON-based API for easier language bindings
pub fn process_request_json(request_json: &str) -> std::result::Result<String, String> {
    let request: FileAwareRequest = serde_json::from_str(request_json)
        .map_err(|e| format!("Invalid request JSON: {}", e))?;
    
    let core = FileAwareCore::new();
    let response = core.process_request(request)
        .map_err(|e| format!("Analysis failed: {}", e))?;
    
    serde_json::to_string(&response)
        .map_err(|e| format!("Response serialization failed: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_core_creation() {
        let core = FileAwareCore::new();
        assert!(!core.analyzer.get_parsers().is_empty());
    }
    
    #[test]
    fn test_supported_languages() {
        let languages = FileAwareCore::supported_languages();
        assert!(languages.contains(&"rust"));
        assert!(languages.contains(&"typescript"));
    }
    
    #[test]
    fn test_json_api() {
        let request = FileAwareRequest {
            task: "Test analysis".to_string(),
            files: vec!["test.rs".to_string()],
            root_path: "/tmp".to_string(),
            context: None,
            options: None,
        };
        
        let request_json = serde_json::to_string(&request).unwrap();
        let result = process_request_json(&request_json);
        
        assert!(result.is_ok());
    }
}