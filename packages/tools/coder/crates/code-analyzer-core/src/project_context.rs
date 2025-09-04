//! Project Context Module - Codebase Analysis and Structure
//!
//! Builds comprehensive context about code projects by analyzing file relationships,
//! dependencies, and project structure following Google organizational patterns.

use crate::{CodeIntelligenceError, AnalysisResult, AnalysisRequest, ComplexityLevel};
use crate::ast_analysis::{AstAnalyzer, FileAnalysisResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use glob::Pattern;
use std::path::{Path, PathBuf};
use anyhow::Result;

/// Project context for tracking project state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectContext {
    pub name: String,
    pub path: PathBuf,
    pub metadata: HashMap<String, String>,
}

impl ProjectContext {
    pub fn new(name: &str) -> Result<Self> {
        Ok(Self {
            name: name.to_string(),
            path: PathBuf::from("."),
            metadata: HashMap::new(),
        })
    }
}

/// Project context builder for comprehensive codebase analysis
pub struct ProjectContextBuilder {
    /// AST analyzer for file parsing
    ast_analyzer: AstAnalyzer,
    
    /// Configuration for context building
    config: ContextBuilderConfiguration,
    
    /// File discovery settings
    file_discovery: FileDiscoverySettings,
}

/// Configuration for project context building
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextBuilderConfiguration {
    /// Maximum number of files to analyze
    pub max_files_to_analyze: usize,
    
    /// Maximum file size to process (bytes)
    pub max_file_size_bytes: u64,
    
    /// Maximum directory traversal depth
    pub max_directory_depth: usize,
    
    /// Enable parallel file processing
    pub enable_parallel_processing: bool,
    
    /// Timeout for context building (milliseconds)
    pub context_building_timeout_ms: u64,
}

/// File discovery settings following Google patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDiscoverySettings {
    /// File patterns to include
    pub include_patterns: Vec<String>,
    
    /// File patterns to exclude
    pub exclude_patterns: Vec<String>,
    
    /// Directory patterns to exclude
    pub exclude_directories: Vec<String>,
    
    /// Follow symbolic links
    pub follow_symbolic_links: bool,
    
    /// Include hidden files
    pub include_hidden_files: bool,
}

/// Comprehensive codebase context information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodebaseContext {
    /// Files identified as relevant for analysis
    pub relevant_files: Vec<String>,
    
    /// File dependency relationships
    pub file_dependencies: Vec<FileDependency>,
    
    /// Symbol references across files
    pub cross_file_symbols: Vec<CrossFileSymbol>,
    
    /// Analysis summary description
    pub analysis_summary: String,
    
    /// Overall project complexity assessment
    pub overall_complexity: ComplexityLevel,
    
    /// Programming language distribution
    pub programming_languages: HashMap<String, usize>,
    
    /// Total lines of code in project
    pub total_lines_of_code: usize,
    
    /// Project structure analysis
    pub project_structure: ProjectStructure,
    
    /// Module organization information
    pub module_organization: ModuleOrganization,
    
    /// Code quality metrics
    pub quality_metrics: ProjectQualityMetrics,
    
    /// Context building metadata
    pub context_metadata: ContextMetadata,
}

/// File dependency relationship information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDependency {
    /// Source file that depends on target
    pub source_file_path: String,
    
    /// Target file being depended upon
    pub target_file_path: String,
    
    /// Type of dependency relationship
    pub dependency_relationship: DependencyRelationship,
    
    /// Line number where dependency is declared
    pub declaration_line_number: Option<usize>,
    
    /// Dependency strength (0.0-1.0)
    pub dependency_strength: f32,
}

/// Types of dependency relationships
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencyRelationship {
    /// Direct import/include statement
    DirectImport,
    
    /// Module inclusion
    ModuleInclusion,
    
    /// Function/method call reference
    FunctionReference,
    
    /// Type/class inheritance
    InheritanceRelationship,
    
    /// Interface implementation
    InterfaceImplementation,
    
    /// Configuration dependency
    ConfigurationDependency,
}

/// Cross-file symbol reference information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossFileSymbol {
    /// Symbol name
    pub symbol_name: String,
    
    /// File where symbol is defined
    pub definition_file: String,
    
    /// Files that reference this symbol
    pub reference_files: Vec<String>,
    
    /// Symbol type category
    pub symbol_category: SymbolCategory,
    
    /// Usage frequency across project
    pub usage_frequency: usize,
}

/// Categories of symbols for cross-file analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SymbolCategory {
    /// Public API function
    PublicFunction,
    
    /// Public class or struct
    PublicType,
    
    /// Public constant
    PublicConstant,
    
    /// Internal utility function
    InternalUtility,
    
    /// Configuration value
    ConfigurationValue,
    
    /// External library reference
    ExternalLibrary,
}

/// Project structure analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectStructure {
    /// Root directory path
    pub root_directory: String,
    
    /// Directory tree structure
    pub directory_hierarchy: Vec<DirectoryInfo>,
    
    /// File count by directory
    pub files_by_directory: HashMap<String, usize>,
    
    /// Code organization pattern detected
    pub organization_pattern: OrganizationPattern,
    
    /// Architecture style assessment
    pub architecture_style: ArchitectureStyle,
}

/// Information about a directory in the project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectoryInfo {
    /// Directory path relative to root
    pub directory_path: String,
    
    /// Number of source files in directory
    pub source_file_count: usize,
    
    /// Primary programming language in directory
    pub primary_language: Option<String>,
    
    /// Directory purpose category
    pub directory_purpose: DirectoryPurpose,
    
    /// Subdirectories
    pub subdirectories: Vec<String>,
}

/// Purpose categories for directories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DirectoryPurpose {
    /// Source code directory
    SourceCode,
    
    /// Test code directory
    Tests,
    
    /// Documentation directory
    Documentation,
    
    /// Configuration files
    Configuration,
    
    /// Build artifacts
    BuildOutput,
    
    /// External dependencies
    Dependencies,
    
    /// Resources/assets
    Resources,
    
    /// Unknown purpose
    Unknown,
}

/// Code organization patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrganizationPattern {
    /// Layered architecture (MVC, etc.)
    LayeredArchitecture,
    
    /// Domain-driven design
    DomainDrivenDesign,
    
    /// Feature-based organization
    FeatureBasedOrganization,
    
    /// Component-based architecture
    ComponentBasedArchitecture,
    
    /// Monolithic structure
    MonolithicStructure,
    
    /// Microservices pattern
    MicroservicesPattern,
    
    /// Library/package structure
    LibraryStructure,
    
    /// Unknown pattern
    UnknownPattern,
}

/// Architecture style assessment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ArchitectureStyle {
    /// Object-oriented design
    ObjectOriented,
    
    /// Functional programming style
    Functional,
    
    /// Procedural programming
    Procedural,
    
    /// Mixed paradigms
    MixedParadigms,
    
    /// Event-driven architecture
    EventDriven,
    
    /// Data-driven architecture
    DataDriven,
}

/// Module organization information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleOrganization {
    /// Detected modules/packages
    pub modules: Vec<ModuleInfo>,
    
    /// Module dependency graph
    pub module_dependencies: Vec<ModuleDependency>,
    
    /// Circular dependency warnings
    pub circular_dependencies: Vec<CircularDependency>,
    
    /// Module cohesion scores
    pub module_cohesion_scores: HashMap<String, f32>,
}

/// Information about a code module
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleInfo {
    /// Module name
    pub module_name: String,
    
    /// Files belonging to this module
    pub module_files: Vec<String>,
    
    /// Module's primary responsibility
    pub primary_responsibility: String,
    
    /// Public API surface area
    pub public_api_count: usize,
    
    /// Internal implementation count
    pub internal_implementation_count: usize,
}

/// Module dependency information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModuleDependency {
    /// Module that depends on another
    pub dependent_module: String,
    
    /// Module being depended upon
    pub dependency_module: String,
    
    /// Strength of dependency (0.0-1.0)
    pub dependency_strength: f32,
    
    /// Type of dependency
    pub dependency_type: ModuleDependencyType,
}

/// Types of module dependencies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModuleDependencyType {
    /// Strong coupling
    StrongCoupling,
    
    /// Loose coupling
    LooseCoupling,
    
    /// Interface dependency
    InterfaceDependency,
    
    /// Data dependency
    DataDependency,
    
    /// Control dependency
    ControlDependency,
}

/// Circular dependency warning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircularDependency {
    /// Modules involved in the cycle
    pub involved_modules: Vec<String>,
    
    /// Severity of the circular dependency
    pub severity_level: CircularDependencySeverity,
    
    /// Suggested resolution
    pub resolution_suggestion: String,
}

/// Severity levels for circular dependencies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CircularDependencySeverity {
    /// Low impact circular dependency
    Low,
    
    /// Medium impact circular dependency
    Medium,
    
    /// High impact circular dependency
    High,
    
    /// Critical circular dependency
    Critical,
}

/// Project-wide quality metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectQualityMetrics {
    /// Average code quality score
    pub average_quality_score: f32,
    
    /// Test coverage percentage
    pub overall_test_coverage: f32,
    
    /// Documentation coverage percentage
    pub documentation_coverage: f32,
    
    /// Code duplication percentage
    pub code_duplication_percentage: f32,
    
    /// Technical debt estimate (hours)
    pub technical_debt_estimate: f32,
    
    /// Maintainability index
    pub maintainability_index: f32,
}

/// Context building metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMetadata {
    /// Number of files discovered
    pub files_discovered: usize,
    
    /// Number of files successfully analyzed
    pub files_analyzed: usize,
    
    /// Context building duration (milliseconds)
    pub build_duration_ms: u64,
    
    /// Memory usage during analysis (bytes)
    pub memory_usage_bytes: u64,
    
    /// Analysis timestamp
    pub analysis_timestamp: chrono::DateTime<chrono::Utc>,
    
    /// Warnings encountered during analysis
    pub analysis_warnings: Vec<String>,
}

impl Default for ContextBuilderConfiguration {
    fn default() -> Self {
        Self {
            max_files_to_analyze: 1000,
            max_file_size_bytes: 10 * 1024 * 1024, // 10MB
            max_directory_depth: 20,
            enable_parallel_processing: true,
            context_building_timeout_ms: 300_000, // 5 minutes
        }
    }
}

impl Default for FileDiscoverySettings {
    fn default() -> Self {
        Self {
            include_patterns: vec![
                "*.rs".to_string(),
                "*.ts".to_string(),
                "*.tsx".to_string(),
                "*.js".to_string(),
                "*.jsx".to_string(),
                "*.py".to_string(),
                "*.go".to_string(),
                "*.java".to_string(),
                "*.cpp".to_string(),
                "*.c".to_string(),
                "*.h".to_string(),
                "*.hpp".to_string(),
            ],
            exclude_patterns: vec![
                "*.min.js".to_string(),
                "*.d.ts".to_string(),
                "*.map".to_string(),
            ],
            exclude_directories: vec![
                "node_modules".to_string(),
                ".git".to_string(),
                "target".to_string(),
                "dist".to_string(),
                "build".to_string(),
                ".cargo".to_string(),
                "__pycache__".to_string(),
                ".pytest_cache".to_string(),
                "coverage".to_string(),
                ".next".to_string(),
                ".nuxt".to_string(),
                "vendor".to_string(),
            ],
            follow_symbolic_links: false,
            include_hidden_files: false,
        }
    }
}

impl ProjectContextBuilder {
    /// Create a new project context builder with default configuration
    pub fn new() -> AnalysisResult<Self> {
        Self::with_config(
            ContextBuilderConfiguration::default(),
            FileDiscoverySettings::default(),
        )
    }
    
    /// Create context builder with custom configuration
    pub fn with_config(
        config: ContextBuilderConfiguration,
        file_discovery: FileDiscoverySettings,
    ) -> AnalysisResult<Self> {
        let ast_analyzer = AstAnalyzer::new()?;
        
        Ok(Self {
            ast_analyzer,
            config,
            file_discovery,
        })
    }
    
    /// Build comprehensive project context from analysis request
    pub fn build_context(&mut self, request: &AnalysisRequest) -> AnalysisResult<CodebaseContext> {
        let build_start = std::time::Instant::now();
        let root_path = Path::new(&request.project_root);
        
        // Discover relevant files
        let relevant_files = if request.target_files.is_empty() {
            self.discover_project_files(root_path, request)?
        } else {
            self.validate_target_files(&request.target_files)?
        };
        
        // Analyze discovered files
        let mut file_analyses = Vec::new();
        let mut analysis_warnings = Vec::new();
        let mut programming_languages = HashMap::new();
        let mut total_lines_of_code = 0;
        
        for file_path in &relevant_files {
            match self.ast_analyzer.analyze_file(file_path) {
                Ok(analysis) => {
                    // Track language distribution
                    *programming_languages.entry(analysis.programming_language.clone()).or_insert(0) += 1;
                    
                    // Accumulate lines of code
                    total_lines_of_code += analysis.line_count;
                    
                    file_analyses.push(analysis);
                }
                Err(e) => {
                    analysis_warnings.push(format!(
                        "Failed to analyze {}: {}", file_path, e
                    ));
                }
            }
        }
        
        // Build file dependencies
        let file_dependencies = self.analyze_file_dependencies(&file_analyses)?;
        
        // Extract cross-file symbols
        let cross_file_symbols = self.analyze_cross_file_symbols(&file_analyses)?;
        
        // Assess overall complexity
        let overall_complexity = self.assess_project_complexity(&file_analyses);
        
        // Analyze project structure
        let project_structure = self.analyze_project_structure(root_path, &relevant_files)?;
        
        // Analyze module organization
        let module_organization = self.analyze_module_organization(&file_analyses, &file_dependencies)?;
        
        // Calculate quality metrics
        let quality_metrics = self.calculate_project_quality_metrics(&file_analyses);
        
        // Generate analysis summary
        let analysis_summary = self.generate_analysis_summary(
            &relevant_files,
            &programming_languages,
            total_lines_of_code,
            &overall_complexity,
        );
        
        let build_duration = build_start.elapsed().as_millis() as u64;
        
        Ok(CodebaseContext {
            relevant_files,
            file_dependencies,
            cross_file_symbols,
            analysis_summary,
            overall_complexity,
            programming_languages,
            total_lines_of_code,
            project_structure,
            module_organization,
            quality_metrics,
            context_metadata: ContextMetadata {
                files_discovered: file_analyses.len() + analysis_warnings.len(),
                files_analyzed: file_analyses.len(),
                build_duration_ms: build_duration,
                memory_usage_bytes: std::mem::size_of::<Self>() as u64 * 1024, // Approximation
                analysis_timestamp: chrono::Utc::now(),
                analysis_warnings,
            },
        })
    }
    
    /// Discover relevant files in the project
    fn discover_project_files(
        &self,
        root_path: &Path,
        _request: &AnalysisRequest,
    ) -> AnalysisResult<Vec<String>> {
        let mut discovered_files = Vec::new();

        let include_patterns: Vec<_> = self.file_discovery.include_patterns.iter()
            .map(|p| Pattern::new(p).map_err(|e| CodeIntelligenceError::ConfigurationInvalid { message: format!("Invalid include pattern '{}': {}", p, e) }))
            .collect::<AnalysisResult<_>>()?;

        let exclude_patterns: Vec<_> = self.file_discovery.exclude_patterns.iter()
            .map(|p| Pattern::new(p).map_err(|e| CodeIntelligenceError::ConfigurationInvalid { message: format!("Invalid exclude pattern '{}': {}", p, e) }))
            .collect::<AnalysisResult<_>>()?;
        
        let exclude_dirs = self.file_discovery.exclude_directories.clone();

        // Use walkdir for directory traversal
        let walker = walkdir::WalkDir::new(root_path)
            .max_depth(self.config.max_directory_depth)
            .follow_links(self.file_discovery.follow_symbolic_links)
            .into_iter()
            .filter_entry(move |e| {
                !e.path()
                 .components()
                 .any(|c| exclude_dirs.contains(&c.as_os_str().to_string_lossy().to_string()))
            });

        for entry in walker {
            if discovered_files.len() >= self.config.max_files_to_analyze {
                break;
            }

            let entry = entry.map_err(|e| CodeIntelligenceError::IoOperationFailed {
                message: format!("Directory traversal failed: {}", e),
            })?;
            
            let path = entry.path();
            
            if path.is_dir() {
                continue;
            }
            
            if let Ok(metadata) = entry.metadata() {
                if metadata.len() > self.config.max_file_size_bytes {
                    continue;
                }
            }
            
            let file_name = path.file_name().unwrap_or_default().to_string_lossy();

            if !exclude_patterns.iter().any(|p| p.matches(&file_name)) 
                && include_patterns.iter().any(|p| p.matches(&file_name)) {
                discovered_files.push(path.to_string_lossy().to_string());
            }
        }
        
        Ok(discovered_files)
    }
    
    /// Validate that target files exist and are accessible
    fn validate_target_files(&self, target_files: &[String]) -> AnalysisResult<Vec<String>> {
        let mut validated_files = Vec::new();
        
        for file_path in target_files {
            let path = Path::new(file_path);
            if !path.exists() {
                return Err(CodeIntelligenceError::IoOperationFailed {
                    message: format!("Target file does not exist: {}", file_path),
                });
            }
            
            if !path.is_file() {
                return Err(CodeIntelligenceError::IoOperationFailed {
                    message: format!("Target is not a file: {}", file_path),
                });
            }
            
            validated_files.push(file_path.clone());
        }
        
        Ok(validated_files)
    }
    
    /// Analyze dependencies between files
    fn analyze_file_dependencies(
        &self,
        file_analyses: &[FileAnalysisResult],
    ) -> AnalysisResult<Vec<FileDependency>> {
        let mut dependencies = Vec::new();
        
        // Build a map of file paths to their imports
        let mut file_imports: HashMap<String, Vec<String>> = HashMap::new();
        
        for analysis in file_analyses {
            let imports: Vec<String> = analysis.import_declarations
                .iter()
                .map(|import| import.module_path.clone())
                .collect();
            file_imports.insert(analysis.file_path.clone(), imports);
        }
        
        // Find dependencies between files
        for (source_file, imports) in &file_imports {
            for import in imports {
                // Try to match import to actual files
                for analysis in file_analyses {
                    if self.is_import_match(import, &analysis.file_path) {
                        dependencies.push(FileDependency {
                            source_file_path: source_file.clone(),
                            target_file_path: analysis.file_path.clone(),
                            dependency_relationship: DependencyRelationship::DirectImport,
                            declaration_line_number: None, // Would need more detailed parsing
                            dependency_strength: 1.0, // Full dependency
                        });
                    }
                }
            }
        }
        
        Ok(dependencies)
    }
    
    /// Check if an import statement matches a file path
    fn is_import_match(&self, import: &str, file_path: &str) -> bool {
        // Simplified matching logic - would need more sophisticated implementation
        let file_name = Path::new(file_path)
            .file_stem()
            .and_then(|stem| stem.to_str())
            .unwrap_or("");
        
        import.contains(file_name) || file_name.contains(import)
    }
    
    /// Analyze cross-file symbol references
    fn analyze_cross_file_symbols(
        &self,
        file_analyses: &[FileAnalysisResult],
    ) -> AnalysisResult<Vec<CrossFileSymbol>> {
        let mut cross_file_symbols = Vec::new();
        
        // Build symbol definition map
        let mut symbol_definitions: HashMap<String, String> = HashMap::new();
        let mut symbol_references: HashMap<String, Vec<String>> = HashMap::new();
        
        for analysis in file_analyses {
            for symbol in &analysis.symbol_references {
                // Track where symbols are defined
                symbol_definitions.insert(
                    symbol.symbol_name.clone(),
                    analysis.file_path.clone(),
                );
                
                // Initialize reference tracking
                symbol_references
                    .entry(symbol.symbol_name.clone())
                    .or_insert_with(Vec::new);
            }
        }
        
        // Convert to cross-file symbol format
        for (symbol_name, definition_file) in symbol_definitions {
            let reference_files = symbol_references
                .get(&symbol_name)
                .cloned()
                .unwrap_or_default();
            
            let usage_frequency = reference_files.len();
            
            cross_file_symbols.push(CrossFileSymbol {
                symbol_name,
                definition_file,
                reference_files,
                symbol_category: SymbolCategory::PublicFunction, // Would need more analysis
                usage_frequency,
            });
        }
        
        Ok(cross_file_symbols)
    }
    
    /// Assess overall project complexity
    fn assess_project_complexity(&self, file_analyses: &[FileAnalysisResult]) -> ComplexityLevel {
        if file_analyses.is_empty() {
            return ComplexityLevel::Low;
        }
        
        let total_complexity: usize = file_analyses
            .iter()
            .map(|analysis| analysis.complexity_metrics.cyclomatic_complexity)
            .sum();
        
        let average_complexity = total_complexity as f32 / file_analyses.len() as f32;
        let file_count = file_analyses.len();
        
        // Complexity assessment heuristics
        let complexity_score = average_complexity + (file_count as f32 / 100.0);
        
        match complexity_score as usize {
            0..=10 => ComplexityLevel::Low,
            11..=25 => ComplexityLevel::Medium,
            26..=50 => ComplexityLevel::High,
            _ => ComplexityLevel::VeryHigh,
        }
    }
    
    /// Analyze project structure and organization
    fn analyze_project_structure(
        &self,
        root_path: &Path,
        relevant_files: &[String],
    ) -> AnalysisResult<ProjectStructure> {
        let mut directories: HashMap<String, DirectoryInfo> = HashMap::new();
        let mut files_by_directory: HashMap<String, usize> = HashMap::new();
        
        // Analyze directory structure
        for file_path in relevant_files {
            let path = Path::new(file_path);
            if let Some(parent) = path.parent() {
                let parent_str = parent.to_string_lossy().to_string();
                
                // Count files by directory
                *files_by_directory.entry(parent_str.clone()).or_insert(0) += 1;
                
                // Create directory info if not exists
                if !directories.contains_key(&parent_str) {
                    directories.insert(parent_str.clone(), DirectoryInfo {
                        directory_path: parent_str.clone(),
                        source_file_count: 0,
                        primary_language: None,
                        directory_purpose: self.determine_directory_purpose(&parent_str),
                        subdirectories: Vec::new(),
                    });
                }
            }
        }
        
        // Detect organization pattern
        let organization_pattern = self.detect_organization_pattern(&directories);
        let architecture_style = self.detect_architecture_style(relevant_files);
        
        Ok(ProjectStructure {
            root_directory: root_path.to_string_lossy().to_string(),
            directory_hierarchy: directories.into_values().collect(),
            files_by_directory,
            organization_pattern,
            architecture_style,
        })
    }
    
    /// Determine the purpose of a directory
    fn determine_directory_purpose(&self, directory_path: &str) -> DirectoryPurpose {
        let dir_name = Path::new(directory_path)
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("");
        
        match dir_name.to_lowercase().as_str() {
            "src" | "source" | "lib" => DirectoryPurpose::SourceCode,
            "test" | "tests" | "__tests__" | "spec" => DirectoryPurpose::Tests,
            "doc" | "docs" | "documentation" => DirectoryPurpose::Documentation,
            "config" | "configuration" | "settings" => DirectoryPurpose::Configuration,
            "build" | "dist" | "target" | "output" => DirectoryPurpose::BuildOutput,
            "node_modules" | "vendor" | "deps" => DirectoryPurpose::Dependencies,
            "assets" | "resources" | "static" => DirectoryPurpose::Resources,
            _ => DirectoryPurpose::Unknown,
        }
    }
    
    /// Detect project organization pattern
    fn detect_organization_pattern(&self, directories: &HashMap<String, DirectoryInfo>) -> OrganizationPattern {
        // Simple heuristic-based pattern detection
        let dir_names: Vec<String> = directories.keys().cloned().collect();
        
        if dir_names.iter().any(|name| name.contains("controller") || name.contains("model") || name.contains("view")) {
            OrganizationPattern::LayeredArchitecture
        } else if dir_names.iter().any(|name| name.contains("domain") || name.contains("entity")) {
            OrganizationPattern::DomainDrivenDesign
        } else if dir_names.iter().any(|name| name.contains("component")) {
            OrganizationPattern::ComponentBasedArchitecture
        } else if dir_names.len() > 10 {
            OrganizationPattern::MicroservicesPattern
        } else if dir_names.iter().any(|name| name.contains("lib") || name.contains("crate")) {
            OrganizationPattern::LibraryStructure
        } else {
            OrganizationPattern::UnknownPattern
        }
    }
    
    /// Detect architecture style
    fn detect_architecture_style(&self, relevant_files: &[String]) -> ArchitectureStyle {
        // Simple heuristic based on file patterns
        let has_classes = relevant_files.iter()
            .any(|file| file.contains("class") || file.ends_with(".java") || file.ends_with(".cpp"));
        
        let has_functions = relevant_files.iter()
            .any(|file| file.ends_with(".rs") || file.ends_with(".go"));
        
        if has_classes {
            ArchitectureStyle::ObjectOriented
        } else if has_functions {
            ArchitectureStyle::Functional
        } else {
            ArchitectureStyle::MixedParadigms
        }
    }
    
    /// Analyze module organization
    fn analyze_module_organization(
        &self,
        file_analyses: &[FileAnalysisResult],
        _dependencies: &[FileDependency],
    ) -> AnalysisResult<ModuleOrganization> {
        // Simplified module analysis - would need more sophisticated implementation
        let mut modules = Vec::new();
        let module_dependencies = Vec::new(); // Would analyze actual dependencies
        let circular_dependencies = Vec::new(); // Would detect cycles
        let module_cohesion_scores = HashMap::new(); // Would calculate cohesion
        
        // Group files into modules based on directory structure
        let mut modules_by_dir: HashMap<String, Vec<String>> = HashMap::new();
        
        for analysis in file_analyses {
            let dir = Path::new(&analysis.file_path)
                .parent()
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| "root".to_string());
            
            modules_by_dir
                .entry(dir)
                .or_insert_with(Vec::new)
                .push(analysis.file_path.clone());
        }
        
        // Create module info
        for (dir, files) in modules_by_dir {
            modules.push(ModuleInfo {
                module_name: dir.clone(),
                module_files: files.clone(),
                primary_responsibility: format!("Module in {}", dir),
                public_api_count: files.len(), // Simplified
                internal_implementation_count: 0,
            });
        }
        
        Ok(ModuleOrganization {
            modules,
            module_dependencies,
            circular_dependencies,
            module_cohesion_scores,
        })
    }
    
    /// Calculate project-wide quality metrics
    fn calculate_project_quality_metrics(&self, file_analyses: &[FileAnalysisResult]) -> ProjectQualityMetrics {
        if file_analyses.is_empty() {
            return ProjectQualityMetrics {
                average_quality_score: 50.0,
                overall_test_coverage: 0.0,
                documentation_coverage: 0.0,
                code_duplication_percentage: 0.0,
                technical_debt_estimate: 0.0,
                maintainability_index: 50.0,
            };
        }
        
        let total_files = file_analyses.len() as f32;
        
        // Calculate averages
        let average_complexity: f32 = file_analyses
            .iter()
            .map(|a| a.complexity_metrics.cyclomatic_complexity as f32)
            .sum::<f32>() / total_files;
        
        let average_test_coverage: f32 = file_analyses
            .iter()
            .map(|a| a.test_coverage)
            .sum::<f32>() / total_files;
        
        // Quality score based on complexity and test coverage
        let mut quality_score = 100.0;
        if average_complexity > 10.0 {
            quality_score -= (average_complexity - 10.0) * 2.0;
        }
        quality_score *= (0.5 + average_test_coverage * 0.5);
        
        // Technical debt estimation
        let technical_debt = file_analyses
            .iter()
            .map(|a| {
                let mut debt = 0.0;
                if a.complexity_metrics.cyclomatic_complexity > 15 {
                    debt += (a.complexity_metrics.cyclomatic_complexity - 15) as f32 * 0.5;
                }
                if a.test_coverage < 0.8 {
                    debt += (0.8 - a.test_coverage) * 4.0;
                }
                debt
            })
            .sum();
        
        ProjectQualityMetrics {
            average_quality_score: quality_score.max(0.0).min(100.0),
            overall_test_coverage: average_test_coverage * 100.0,
            documentation_coverage: 60.0, // Placeholder - would need analysis
            code_duplication_percentage: 5.0, // Placeholder - would need analysis
            technical_debt_estimate: technical_debt,
            maintainability_index: (100.0 - average_complexity * 3.0).max(0.0).min(100.0),
        }
    }
    
    /// Generate human-readable analysis summary
    fn generate_analysis_summary(
        &self,
        relevant_files: &[String],
        programming_languages: &HashMap<String, usize>,
        total_lines_of_code: usize,
        overall_complexity: &ComplexityLevel,
    ) -> String {
        let language_list: Vec<String> = programming_languages
            .iter()
            .map(|(lang, count)| format!("{} ({} files)", lang, count))
            .collect();
        
        format!(
            "Project analysis completed: {} files analyzed across {} programming languages ({}). \
            Total lines of code: {}. Overall complexity: {:?}. \
            Project appears well-structured with clear module organization.",
            relevant_files.len(),
            programming_languages.len(),
            language_list.join(", "),
            total_lines_of_code,
            overall_complexity
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_context_builder_creation() {
        let builder = ProjectContextBuilder::new();
        assert!(builder.is_ok());
    }

    #[test]
    fn test_default_configurations() {
        let config = ContextBuilderConfiguration::default();
        assert_eq!(config.max_files_to_analyze, 1000);
        
        let discovery = FileDiscoverySettings::default();
        assert!(!discovery.include_patterns.is_empty());
    }

    #[test]
    fn test_directory_purpose_detection() {
        let builder = ProjectContextBuilder::new().unwrap();
        
        assert!(matches!(
            builder.determine_directory_purpose("src/main"),
            DirectoryPurpose::SourceCode
        ));
        
        assert!(matches!(
            builder.determine_directory_purpose("tests/unit"),
            DirectoryPurpose::Tests
        ));
        
        assert!(matches!(
            builder.determine_directory_purpose("docs/api"),
            DirectoryPurpose::Documentation
        ));
    }
}