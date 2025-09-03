//! Tree analysis module for file-aware core
//! 
//! Provides abstract syntax tree analysis using tree-sitter for multiple languages

use crate::{Result, FileAwareError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tree_sitter::{Language, Parser, Tree, Node};

/// Tree analyzer for AST operations
#[derive(Debug, Clone)]
pub struct TreeAnalyzer {
    parsers: HashMap<String, Parser>,
}

/// Tree analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeAnalysis {
    pub language: String,
    pub node_count: usize,
    pub depth: usize,
    pub complexity_score: f32,
    pub patterns: Vec<TreePattern>,
    pub issues: Vec<TreeIssue>,
}

/// Tree pattern detected in code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreePattern {
    pub pattern_type: String,
    pub line: usize,
    pub column: usize,
    pub text: String,
    pub confidence: f32,
}

/// Tree issue detected in code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TreeIssue {
    pub issue_type: String,
    pub severity: IssueSeverity,
    pub line: usize,
    pub column: usize,
    pub message: String,
    pub suggestion: Option<String>,
}

/// Issue severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IssueSeverity {
    Error,
    Warning,
    Info,
}

impl TreeAnalyzer {
    /// Create new tree analyzer
    pub fn new() -> Self {
        Self {
            parsers: HashMap::new(),
        }
    }
    
    /// Initialize parser for a specific language
    pub fn initialize_language(&mut self, language: &str) -> Result<()> {
        let lang = match language {
            "rust" => tree_sitter_rust::language(),
            "typescript" => tree_sitter_typescript::language_typescript(),
            "javascript" => tree_sitter_javascript::language(),
            "python" => tree_sitter_python::language(),
            "go" => tree_sitter_go::language(),
            _ => return Err(FileAwareError::ParsingError {
                message: format!("Unsupported language: {}", language),
            }),
        };
        
        let mut parser = Parser::new();
        parser.set_language(&lang).map_err(|e| FileAwareError::ParsingError {
            message: format!("Failed to set language {}: {}", language, e),
        })?;
        
        self.parsers.insert(language.to_string(), parser);
        Ok(())
    }
    
    /// Analyze code using tree-sitter
    pub fn analyze_code(&mut self, code: &str, language: &str) -> Result<TreeAnalysis> {
        if !self.parsers.contains_key(language) {
            self.initialize_language(language)?;
        }
        
        let parser = self.parsers.get_mut(language).ok_or_else(|| FileAwareError::ParsingError {
            message: format!("Parser not found for language: {}", language),
        })?;
        
        let tree = parser.parse(code, None).ok_or_else(|| FileAwareError::ParsingError {
            message: "Failed to parse code".to_string(),
        })?;
        
        let root_node = tree.root_node();
        let node_count = count_nodes(&root_node);
        let depth = calculate_depth(&root_node);
        let complexity_score = calculate_complexity(&root_node, language);
        let patterns = detect_patterns(&root_node, code, language);
        let issues = detect_issues(&root_node, code, language);
        
        Ok(TreeAnalysis {
            language: language.to_string(),
            node_count,
            depth,
            complexity_score,
            patterns,
            issues,
        })
    }
    
    /// Get syntax tree as string
    pub fn get_syntax_tree(&mut self, code: &str, language: &str) -> Result<String> {
        if !self.parsers.contains_key(language) {
            self.initialize_language(language)?;
        }
        
        let parser = self.parsers.get_mut(language).ok_or_else(|| FileAwareError::ParsingError {
            message: format!("Parser not found for language: {}", language),
        })?;
        
        let tree = parser.parse(code, None).ok_or_else(|| FileAwareError::ParsingError {
            message: "Failed to parse code".to_string(),
        })?;
        
        Ok(tree.root_node().to_sexp())
    }
}

impl Default for TreeAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

/// Count total nodes in the tree
fn count_nodes(node: &Node) -> usize {
    let mut count = 1;
    let mut cursor = node.walk();
    
    for child in node.children(&mut cursor) {
        count += count_nodes(&child);
    }
    
    count
}

/// Calculate maximum depth of the tree
fn calculate_depth(node: &Node) -> usize {
    let mut max_depth = 0;
    let mut cursor = node.walk();
    
    for child in node.children(&mut cursor) {
        let child_depth = calculate_depth(&child);
        if child_depth > max_depth {
            max_depth = child_depth;
        }
    }
    
    max_depth + 1
}

/// Calculate complexity score based on AST structure
fn calculate_complexity(node: &Node, language: &str) -> f32 {
    let mut complexity = 0.0;
    let mut cursor = node.walk();
    
    // Basic complexity calculation based on node types
    match node.kind() {
        "if_statement" | "while_statement" | "for_statement" => complexity += 1.0,
        "match_expression" | "switch_statement" => complexity += 0.5,
        "function_declaration" | "method_declaration" => complexity += 0.25,
        _ => {}
    }
    
    // Recursively calculate for children
    for child in node.children(&mut cursor) {
        complexity += calculate_complexity(&child, language);
    }
    
    complexity
}

/// Detect code patterns in the AST
fn detect_patterns(node: &Node, code: &str, language: &str) -> Vec<TreePattern> {
    let mut patterns = Vec::new();
    let mut cursor = node.walk();
    
    // Detect common patterns based on node types
    match node.kind() {
        "function_declaration" | "method_declaration" => {
            let start = node.start_position();
            patterns.push(TreePattern {
                pattern_type: "function_definition".to_string(),
                line: start.row + 1,
                column: start.column + 1,
                text: node.utf8_text(code.as_bytes()).unwrap_or("").to_string(),
                confidence: 1.0,
            });
        }
        "error" => {
            let start = node.start_position();
            patterns.push(TreePattern {
                pattern_type: "syntax_error".to_string(),
                line: start.row + 1,
                column: start.column + 1,
                text: node.utf8_text(code.as_bytes()).unwrap_or("").to_string(),
                confidence: 1.0,
            });
        }
        _ => {}
    }
    
    // Recursively detect patterns in children
    for child in node.children(&mut cursor) {
        patterns.extend(detect_patterns(&child, code, language));
    }
    
    patterns
}

/// Detect issues in the AST
fn detect_issues(node: &Node, code: &str, language: &str) -> Vec<TreeIssue> {
    let mut issues = Vec::new();
    let mut cursor = node.walk();
    
    // Detect syntax errors
    if node.kind() == "ERROR" || node.is_error() {
        let start = node.start_position();
        issues.push(TreeIssue {
            issue_type: "syntax_error".to_string(),
            severity: IssueSeverity::Error,
            line: start.row + 1,
            column: start.column + 1,
            message: "Syntax error detected".to_string(),
            suggestion: Some("Check syntax and fix errors".to_string()),
        });
    }
    
    // Detect missing nodes
    if node.is_missing() {
        let start = node.start_position();
        issues.push(TreeIssue {
            issue_type: "missing_node".to_string(),
            severity: IssueSeverity::Error,
            line: start.row + 1,
            column: start.column + 1,
            message: "Missing required syntax element".to_string(),
            suggestion: Some("Add missing syntax element".to_string()),
        });
    }
    
    // Language-specific issue detection
    if language == "rust" {
        detect_rust_issues(node, code, &mut issues);
    }
    
    // Recursively detect issues in children
    for child in node.children(&mut cursor) {
        issues.extend(detect_issues(&child, code, language));
    }
    
    issues
}

/// Detect Rust-specific issues
fn detect_rust_issues(node: &Node, code: &str, issues: &mut Vec<TreeIssue>) {
    match node.kind() {
        "unsafe_block" => {
            let start = node.start_position();
            issues.push(TreeIssue {
                issue_type: "unsafe_code".to_string(),
                severity: IssueSeverity::Warning,
                line: start.row + 1,
                column: start.column + 1,
                message: "Unsafe code detected - ensure it's necessary".to_string(),
                suggestion: Some("Consider safe alternatives if possible".to_string()),
            });
        }
        "panic" => {
            let start = node.start_position();
            issues.push(TreeIssue {
                issue_type: "panic_usage".to_string(),
                severity: IssueSeverity::Warning,
                line: start.row + 1,
                column: start.column + 1,
                message: "Panic usage detected - consider error handling".to_string(),
                suggestion: Some("Use Result<T, E> for error handling".to_string()),
            });
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_rust_analysis() {
        let mut analyzer = TreeAnalyzer::new();
        let code = r#"
            fn hello_world() {
                println!("Hello, world!");
            }
        "#;
        
        let result = analyzer.analyze_code(code, "rust");
        assert!(result.is_ok());
        
        let analysis = result.unwrap();
        assert_eq!(analysis.language, "rust");
        assert!(analysis.node_count > 0);
        assert!(analysis.depth > 0);
    }
    
    #[test]
    fn test_syntax_tree() {
        let mut analyzer = TreeAnalyzer::new();
        let code = "fn test() {}";
        
        let result = analyzer.get_syntax_tree(code, "rust");
        assert!(result.is_ok());
        
        let tree = result.unwrap();
        assert!(tree.contains("source_file"));
    }
}