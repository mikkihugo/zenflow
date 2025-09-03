//! AST Analysis Module - Tree-sitter Based Code Parsing
//!
//! Provides comprehensive Abstract Syntax Tree analysis using tree-sitter
//! for multi-language code parsing and analysis following Google standards.

use crate::{CodeIntelligenceError, AnalysisResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tree_sitter::{Language, Parser, Query, QueryCursor, Tree};

/// Primary AST analyzer for multi-language code analysis
pub struct AstAnalyzer {
    /// Language-specific parsers
    parsers: HashMap<String, Parser>,
    
    /// Available tree-sitter languages  
    languages: HashMap<String, Language>,
    
    /// Analysis configuration
    config: AnalyzerConfiguration,
}

/// AST analyzer configuration following Google config patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzerConfiguration {
    /// Maximum file size to analyze (bytes)
    pub max_file_size_bytes: usize,
    
    /// Parse timeout per file (milliseconds)  
    pub parse_timeout_ms: u64,
    
    /// Enable detailed symbol extraction
    pub enable_symbol_extraction: bool,
    
    /// Enable complexity metrics calculation
    pub enable_complexity_metrics: bool,
    
    /// Maximum nesting depth to analyze
    pub max_nesting_depth: usize,
}

/// Comprehensive file analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileAnalysisResult {
    /// Path to the analyzed file
    pub file_path: String,
    
    /// Detected programming language
    pub programming_language: String,
    
    /// Total lines of code
    pub line_count: usize,
    
    /// Number of symbols (functions, classes, etc.)
    pub symbol_count: usize,
    
    /// Estimated test coverage percentage (0.0-1.0)
    pub test_coverage: f32,
    
    /// Complexity metrics for the file
    pub complexity_metrics: ComplexityMetrics,
    
    /// Extracted symbol references
    pub symbol_references: Vec<SymbolReference>,
    
    /// Detected imports and dependencies
    pub import_declarations: Vec<ImportDeclaration>,
    
    /// Parse tree statistics
    pub parse_statistics: ParseStatistics,
    
    /// Analysis timestamp
    pub analysis_timestamp: chrono::DateTime<chrono::Utc>,
}

/// Code complexity metrics following industry standards
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplexityMetrics {
    /// Cyclomatic complexity score
    pub cyclomatic_complexity: usize,
    
    /// Maximum nesting depth in the file
    pub max_nesting_depth: usize,
    
    /// Halstead complexity metrics
    pub halstead_metrics: HalsteadMetrics,
    
    /// Lines of code (excluding comments and blanks)
    pub logical_lines_of_code: usize,
    
    /// Comment to code ratio
    pub comment_ratio: f32,
    
    /// Function length distribution
    pub function_lengths: Vec<usize>,
}

/// Halstead complexity metrics for code analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HalsteadMetrics {
    /// Number of distinct operators
    pub distinct_operators: usize,
    
    /// Number of distinct operands
    pub distinct_operands: usize,
    
    /// Total operators
    pub total_operators: usize,
    
    /// Total operands
    pub total_operands: usize,
    
    /// Program vocabulary
    pub vocabulary: usize,
    
    /// Program length
    pub length: usize,
    
    /// Calculated volume
    pub volume: f32,
    
    /// Difficulty level
    pub difficulty: f32,
    
    /// Programming effort
    pub effort: f32,
    
    /// Time required to program
    pub time_seconds: f32,
    
    /// Number of delivered bugs (estimate)
    pub bugs_estimate: f32,
}

/// Symbol reference information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolReference {
    /// Symbol name
    pub symbol_name: String,
    
    /// Type of symbol
    pub symbol_type: SymbolType,
    
    /// File containing the symbol
    pub containing_file: String,
    
    /// Line number (1-indexed)
    pub line_number: usize,
    
    /// Column number (1-indexed)
    pub column_number: usize,
    
    /// Scope or namespace
    pub scope_path: String,
    
    /// Symbol visibility (public, private, etc.)
    pub visibility: SymbolVisibility,
    
    /// Documentation comment if available
    pub documentation: Option<String>,
}

/// Types of code symbols
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SymbolType {
    /// Function or method
    Function,
    
    /// Class definition
    Class,
    
    /// Interface definition
    Interface,
    
    /// Struct definition
    Struct,
    
    /// Enum definition
    Enum,
    
    /// Variable declaration
    Variable,
    
    /// Constant definition
    Constant,
    
    /// Type alias
    TypeAlias,
    
    /// Module definition
    Module,
    
    /// Namespace definition
    Namespace,
    
    /// Trait definition (Rust-specific)
    Trait,
    
    /// Implementation block
    Implementation,
}

/// Symbol visibility levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SymbolVisibility {
    /// Public symbol
    Public,
    
    /// Private symbol
    Private,
    
    /// Protected symbol
    Protected,
    
    /// Internal visibility
    Internal,
    
    /// Package-private
    Package,
}

/// Import declaration information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportDeclaration {
    /// Module or package being imported
    pub module_path: String,
    
    /// Specific symbols being imported
    pub imported_symbols: Vec<String>,
    
    /// Import alias if any
    pub alias: Option<String>,
    
    /// Whether this is a wildcard import
    pub is_wildcard: bool,
    
    /// Line number of the import
    pub line_number: usize,
}

/// Parse tree statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseStatistics {
    /// Total nodes in the parse tree
    pub total_nodes: usize,
    
    /// Parse tree depth
    pub tree_depth: usize,
    
    /// Number of syntax errors
    pub syntax_error_count: usize,
    
    /// Parse time in milliseconds
    pub parse_time_ms: u64,
    
    /// Whether parsing was successful
    pub parse_successful: bool,
}

/// Analysis metrics aggregated across multiple files
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AnalysisMetrics {
    /// Total files analyzed
    pub total_files_analyzed: usize,
    
    /// Successfully parsed files
    pub successfully_parsed_files: usize,
    
    /// Files with parse errors
    pub files_with_errors: usize,
    
    /// Average complexity per file
    pub average_complexity: f32,
    
    /// Total lines of code across all files
    pub total_lines_of_code: usize,
    
    /// Language distribution
    pub language_distribution: HashMap<String, usize>,
    
    /// Analysis duration
    pub total_analysis_time_ms: u64,
}

impl Default for AnalyzerConfiguration {
    fn default() -> Self {
        Self {
            max_file_size_bytes: 10 * 1024 * 1024, // 10MB
            parse_timeout_ms: 10_000, // 10 seconds
            enable_symbol_extraction: true,
            enable_complexity_metrics: true,
            max_nesting_depth: 20,
        }
    }
}

impl AstAnalyzer {
    /// Create a new AST analyzer with default configuration
    pub fn new() -> AnalysisResult<Self> {
        Self::with_config(AnalyzerConfiguration::default())
    }
    
    /// Create AST analyzer with custom configuration
    pub fn with_config(config: AnalyzerConfiguration) -> AnalysisResult<Self> {
        let mut analyzer = Self {
            parsers: HashMap::new(),
            languages: HashMap::new(),
            config,
        };
        
        analyzer.initialize_languages()?;
        Ok(analyzer)
    }
    
    /// Initialize tree-sitter languages and parsers
    fn initialize_languages(&mut self) -> AnalysisResult<()> {
        // Initialize supported languages
        self.add_language("rust", tree_sitter_rust::language())?;
        self.add_language("typescript", tree_sitter_typescript::language_typescript())?;
        self.add_language("javascript", tree_sitter_javascript::language())?;
        self.add_language("python", tree_sitter_python::language())?;
        self.add_language("go", tree_sitter_go::language())?;
        
        Ok(())
    }
    
    /// Add a language parser to the analyzer
    fn add_language(&mut self, name: &str, language: Language) -> AnalysisResult<()> {
        let mut parser = Parser::new();
        parser.set_language(&language)
            .map_err(|e| CodeIntelligenceError::ConfigurationInvalid {
                message: format!("Failed to set language {}: {}", name, e),
            })?;
        
        self.parsers.insert(name.to_string(), parser);
        self.languages.insert(name.to_string(), language);
        Ok(())
    }
    
    /// Analyze a single file and return comprehensive results
    pub fn analyze_file(&mut self, file_path: &str) -> AnalysisResult<FileAnalysisResult> {
        let analysis_start = std::time::Instant::now();
        
        // Detect language from file extension
        let language = self.detect_language(file_path)?;
        
        // Read file contents
        let source_code = std::fs::read_to_string(file_path)
            .map_err(|e| CodeIntelligenceError::IoOperationFailed {
                message: format!("Failed to read file {}: {}", file_path, e),
            })?;
        
        // Check file size limits
        if source_code.len() > self.config.max_file_size_bytes {
            return Err(CodeIntelligenceError::ResourceLimitExceeded {
                message: format!(
                    "File {} exceeds maximum size limit ({} bytes)", 
                    file_path, 
                    self.config.max_file_size_bytes
                ),
            });
        }
        
        // Parse the source code
        let parse_result = self.parse_source_code(&language, &source_code)?;
        
        // Extract analysis results
        let line_count = source_code.lines().count();
        let symbol_references = if self.config.enable_symbol_extraction {
            self.extract_symbols(&parse_result.tree, &language, &source_code)?
        } else {
            Vec::new()
        };
        
        let complexity_metrics = if self.config.enable_complexity_metrics {
            self.calculate_complexity_metrics(&parse_result.tree, &source_code)?
        } else {
            ComplexityMetrics::default()
        };
        
        let import_declarations = self.extract_imports(&parse_result.tree, &language, &source_code)?;
        let test_coverage = self.estimate_test_coverage(&symbol_references, &source_code);
        
        let analysis_time = analysis_start.elapsed().as_millis() as u64;
        
        Ok(FileAnalysisResult {
            file_path: file_path.to_string(),
            programming_language: language,
            line_count,
            symbol_count: symbol_references.len(),
            test_coverage,
            complexity_metrics,
            symbol_references,
            import_declarations,
            parse_statistics: ParseStatistics {
                total_nodes: Self::count_tree_nodes(&parse_result.tree),
                tree_depth: Self::calculate_tree_depth(&parse_result.tree),
                syntax_error_count: parse_result.error_count,
                parse_time_ms: parse_result.parse_time_ms,
                parse_successful: parse_result.error_count == 0,
            },
            analysis_timestamp: chrono::Utc::now(),
        })
    }
    
    /// Detect programming language from file extension
    fn detect_language(&self, file_path: &str) -> AnalysisResult<String> {
        let path = std::path::Path::new(file_path);
        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .ok_or_else(|| CodeIntelligenceError::UnsupportedLanguage {
                language: "unknown".to_string(),
            })?;
        
        let language = match extension {
            "rs" => "rust",
            "ts" | "tsx" => "typescript",
            "js" | "jsx" => "javascript",
            "py" => "python",
            "go" => "go",
            _ => return Err(CodeIntelligenceError::UnsupportedLanguage {
                language: extension.to_string(),
            }),
        };
        
        if !self.parsers.contains_key(language) {
            return Err(CodeIntelligenceError::UnsupportedLanguage {
                language: language.to_string(),
            });
        }
        
        Ok(language.to_string())
    }
    
    /// Parse source code using appropriate tree-sitter parser
    fn parse_source_code(&mut self, language: &str, source_code: &str) -> AnalysisResult<ParseResult> {
        let parse_start = std::time::Instant::now();
        
        let parser = self.parsers.get_mut(language)
            .ok_or_else(|| CodeIntelligenceError::UnsupportedLanguage {
                language: language.to_string(),
            })?;
        
        let tree = parser.parse(source_code, None)
            .ok_or_else(|| CodeIntelligenceError::ParseError {
                file_path: "source".to_string(),
                message: "Failed to parse source code".to_string(),
            })?;
        
        let parse_time = parse_start.elapsed().as_millis() as u64;
        let error_count = Self::count_syntax_errors(&tree);
        
        Ok(ParseResult {
            tree,
            error_count,
            parse_time_ms: parse_time,
        })
    }
    
    /// Extract symbol information from parse tree
    fn extract_symbols(
        &self, 
        tree: &Tree, 
        language: &str, 
        source_code: &str
    ) -> AnalysisResult<Vec<SymbolReference>> {
        let mut symbols = Vec::new();
        
        // Create language-specific queries for symbol extraction
        let query_text = match language {
            "rust" => r#"
                (function_item name: (identifier) @function)
                (struct_item name: (type_identifier) @struct)
                (enum_item name: (type_identifier) @enum)
                (impl_item type: (type_identifier) @impl)
                (trait_item name: (type_identifier) @trait)
            "#,
            "typescript" | "javascript" => r#"
                (function_declaration name: (identifier) @function)
                (class_declaration name: (type_identifier) @class)
                (interface_declaration name: (type_identifier) @interface)
                (method_definition name: (property_identifier) @method)
            "#,
            "python" => r#"
                (function_definition name: (identifier) @function)
                (class_definition name: (identifier) @class)
            "#,
            _ => return Ok(symbols), // Unsupported language for symbol extraction
        };
        
        let language_obj = self.languages.get(language)
            .ok_or_else(|| CodeIntelligenceError::UnsupportedLanguage {
                language: language.to_string(),
            })?;
        
        let query = Query::new(*language_obj, query_text)
            .map_err(|e| CodeIntelligenceError::ParseError {
                file_path: "query".to_string(),
                message: format!("Invalid query: {}", e),
            })?;
        
        let mut cursor = QueryCursor::new();
        let matches = cursor.matches(&query, tree.root_node(), source_code.as_bytes());
        
        for match_ in matches {
            for capture in match_.captures {
                let node = capture.node;
                let start_point = node.start_position();
                let text = node.utf8_text(source_code.as_bytes())
                    .unwrap_or("unnamed");
                
                let symbol_type = match query.capture_names()[capture.index as usize] {
                    "function" => SymbolType::Function,
                    "class" => SymbolType::Class,
                    "struct" => SymbolType::Struct,
                    "enum" => SymbolType::Enum,
                    "interface" => SymbolType::Interface,
                    "trait" => SymbolType::Trait,
                    "impl" => SymbolType::Implementation,
                    "method" => SymbolType::Function,
                    _ => SymbolType::Function,
                };
                
                symbols.push(SymbolReference {
                    symbol_name: text.to_string(),
                    symbol_type,
                    containing_file: "current".to_string(),
                    line_number: start_point.row + 1,
                    column_number: start_point.column + 1,
                    scope_path: "global".to_string(),
                    visibility: SymbolVisibility::Public,
                    documentation: None,
                });
            }
        }
        
        Ok(symbols)
    }
    
    /// Calculate complexity metrics for the parsed code
    fn calculate_complexity_metrics(&self, tree: &Tree, source_code: &str) -> AnalysisResult<ComplexityMetrics> {
        let mut cyclomatic_complexity = 1; // Base complexity
        let mut max_nesting_depth = 0;
        let mut function_lengths = Vec::new();
        
        // Calculate cyclomatic complexity by counting decision points
        self.traverse_tree_for_complexity(tree.root_node(), &mut cyclomatic_complexity, &mut max_nesting_depth, 0);
        
        // Calculate Halstead metrics
        let halstead_metrics = self.calculate_halstead_metrics(source_code);
        
        // Calculate comment ratio
        let total_lines = source_code.lines().count();
        let comment_lines = source_code.lines()
            .filter(|line| line.trim().starts_with("//") || line.trim().starts_with('#'))
            .count();
        let comment_ratio = if total_lines > 0 { 
            comment_lines as f32 / total_lines as f32 
        } else { 
            0.0 
        };
        
        // Count logical lines of code (non-empty, non-comment)
        let logical_lines_of_code = source_code.lines()
            .filter(|line| {
                let trimmed = line.trim();
                !trimmed.is_empty() && !trimmed.starts_with("//") && !trimmed.starts_with('#')
            })
            .count();
        
        Ok(ComplexityMetrics {
            cyclomatic_complexity,
            max_nesting_depth,
            halstead_metrics,
            logical_lines_of_code,
            comment_ratio,
            function_lengths,
        })
    }
    
    /// Traverse parse tree to calculate complexity metrics
    fn traverse_tree_for_complexity(
        &self,
        node: tree_sitter::Node,
        complexity: &mut usize,
        max_depth: &mut usize,
        current_depth: usize,
    ) {
        // Update maximum nesting depth
        *max_depth = (*max_depth).max(current_depth);
        
        // Count decision points that increase cyclomatic complexity
        match node.kind() {
            "if_expression" | "if_statement" | "while_statement" | "for_statement" | 
            "loop_statement" | "match_expression" | "switch_statement" |
            "conditional_expression" | "logical_and" | "logical_or" => {
                *complexity += 1;
            }
            _ => {}
        }
        
        // Recursively traverse child nodes
        let mut cursor = node.walk();
        for child in node.children(&mut cursor) {
            self.traverse_tree_for_complexity(
                child, 
                complexity, 
                max_depth, 
                current_depth + 1
            );
        }
    }
    
    /// Calculate Halstead complexity metrics
    fn calculate_halstead_metrics(&self, source_code: &str) -> HalsteadMetrics {
        // Simplified Halstead metrics calculation
        // In a real implementation, this would parse operators and operands properly
        
        let operators: Vec<&str> = vec!["+", "-", "*", "/", "=", "==", "!=", "<", ">", "<=", ">="];
        let mut operator_counts = HashMap::new();
        let mut operand_counts = HashMap::new();
        
        // Simple token-based counting (approximation)
        let tokens: Vec<&str> = source_code
            .split_whitespace()
            .collect();
        
        for token in tokens {
            if operators.contains(&token) {
                *operator_counts.entry(token.to_string()).or_insert(0) += 1;
            } else if !token.is_empty() {
                *operand_counts.entry(token.to_string()).or_insert(0) += 1;
            }
        }
        
        let distinct_operators = operator_counts.len();
        let distinct_operands = operand_counts.len();
        let total_operators: usize = operator_counts.values().sum();
        let total_operands: usize = operand_counts.values().sum();
        
        let vocabulary = distinct_operators + distinct_operands;
        let length = total_operators + total_operands;
        
        let volume = if vocabulary > 0 {
            length as f32 * (vocabulary as f32).log2()
        } else {
            0.0
        };
        
        let difficulty = if distinct_operands > 0 {
            (distinct_operators as f32 / 2.0) * (total_operands as f32 / distinct_operands as f32)
        } else {
            0.0
        };
        
        let effort = volume * difficulty;
        let time_seconds = effort / 18.0; // Stroud number
        let bugs_estimate = volume / 3000.0; // Empirical constant
        
        HalsteadMetrics {
            distinct_operators,
            distinct_operands,
            total_operators,
            total_operands,
            vocabulary,
            length,
            volume,
            difficulty,
            effort,
            time_seconds,
            bugs_estimate,
        }
    }
    
    /// Extract import declarations from parse tree
    fn extract_imports(
        &self,
        tree: &Tree,
        language: &str,
        source_code: &str,
    ) -> AnalysisResult<Vec<ImportDeclaration>> {
        let mut imports = Vec::new();
        
        // Simple regex-based import extraction for now
        // In a real implementation, this would use proper AST traversal
        let import_regex = match language {
            "rust" => regex::Regex::new(r"use\s+([^;]+);").unwrap(),
            "typescript" | "javascript" => regex::Regex::new(r#"import\s+.*from\s+['"]([^'"]+)['"]"#).unwrap(),
            "python" => regex::Regex::new(r"from\s+(\S+)\s+import|import\s+(\S+)").unwrap(),
            _ => return Ok(imports),
        };
        
        for (line_num, line) in source_code.lines().enumerate() {
            if let Some(captures) = import_regex.captures(line) {
                let module_path = captures.get(1)
                    .map(|m| m.as_str().to_string())
                    .unwrap_or_else(|| "unknown".to_string());
                
                imports.push(ImportDeclaration {
                    module_path,
                    imported_symbols: Vec::new(), // Would need more sophisticated parsing
                    alias: None,
                    is_wildcard: line.contains("*"),
                    line_number: line_num + 1,
                });
            }
        }
        
        Ok(imports)
    }
    
    /// Estimate test coverage based on symbol analysis
    fn estimate_test_coverage(&self, symbols: &[SymbolReference], source_code: &str) -> f32 {
        if symbols.is_empty() {
            return 0.0;
        }
        
        // Simple heuristic: check for test-related patterns
        let test_patterns = ["test", "spec", "#[test]", "describe", "it("];
        let test_indicators = test_patterns.iter()
            .map(|pattern| source_code.matches(pattern).count())
            .sum::<usize>();
        
        // Rough estimation: more test patterns = higher coverage
        let coverage_estimate = (test_indicators as f32 / symbols.len() as f32).min(1.0);
        coverage_estimate
    }
    
    /// Count total nodes in parse tree
    fn count_tree_nodes(tree: &Tree) -> usize {
        Self::count_nodes_recursive(tree.root_node())
    }
    
    /// Recursively count nodes in tree
    fn count_nodes_recursive(node: tree_sitter::Node) -> usize {
        let mut count = 1; // Count current node
        let mut cursor = node.walk();
        
        for child in node.children(&mut cursor) {
            count += Self::count_nodes_recursive(child);
        }
        
        count
    }
    
    /// Calculate maximum depth of parse tree
    fn calculate_tree_depth(tree: &Tree) -> usize {
        Self::calculate_depth_recursive(tree.root_node(), 0)
    }
    
    /// Recursively calculate tree depth
    fn calculate_depth_recursive(node: tree_sitter::Node, current_depth: usize) -> usize {
        let mut max_depth = current_depth;
        let mut cursor = node.walk();
        
        for child in node.children(&mut cursor) {
            let child_depth = Self::calculate_depth_recursive(child, current_depth + 1);
            max_depth = max_depth.max(child_depth);
        }
        
        max_depth
    }
    
    /// Count syntax errors in parse tree
    fn count_syntax_errors(tree: &Tree) -> usize {
        Self::count_errors_recursive(tree.root_node())
    }
    
    /// Recursively count syntax errors
    fn count_errors_recursive(node: tree_sitter::Node) -> usize {
        let mut error_count = if node.is_error() || node.is_missing() { 1 } else { 0 };
        let mut cursor = node.walk();
        
        for child in node.children(&mut cursor) {
            error_count += Self::count_errors_recursive(child);
        }
        
        error_count
    }
    
    /// Get list of supported languages
    pub fn get_supported_languages(&self) -> Vec<String> {
        self.parsers.keys().cloned().collect()
    }
}

/// Parse result container
#[derive(Debug)]
struct ParseResult {
    tree: Tree,
    error_count: usize,
    parse_time_ms: u64,
}

impl Default for ComplexityMetrics {
    fn default() -> Self {
        Self {
            cyclomatic_complexity: 1,
            max_nesting_depth: 0,
            halstead_metrics: HalsteadMetrics::default(),
            logical_lines_of_code: 0,
            comment_ratio: 0.0,
            function_lengths: Vec::new(),
        }
    }
}

impl Default for HalsteadMetrics {
    fn default() -> Self {
        Self {
            distinct_operators: 0,
            distinct_operands: 0,
            total_operators: 0,
            total_operands: 0,
            vocabulary: 0,
            length: 0,
            volume: 0.0,
            difficulty: 0.0,
            effort: 0.0,
            time_seconds: 0.0,
            bugs_estimate: 0.0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyzer_creation() {
        let analyzer = AstAnalyzer::new();
        assert!(analyzer.is_ok());
    }

    #[test]
    fn test_language_detection() {
        let analyzer = AstAnalyzer::new().unwrap();
        assert_eq!(analyzer.detect_language("test.rs").unwrap(), "rust");
        assert_eq!(analyzer.detect_language("test.ts").unwrap(), "typescript");
        assert_eq!(analyzer.detect_language("test.py").unwrap(), "python");
    }

    #[test]
    fn test_supported_languages() {
        let analyzer = AstAnalyzer::new().unwrap();
        let languages = analyzer.get_supported_languages();
        assert!(languages.contains(&"rust".to_string()));
        assert!(languages.contains(&"typescript".to_string()));
    }
}