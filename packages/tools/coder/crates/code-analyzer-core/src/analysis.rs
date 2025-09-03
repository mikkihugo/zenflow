//! File analysis implementation using tree-sitter

use crate::{Result, FileAwareError};
use std::collections::HashMap;
use std::path::Path;
use tree_sitter::{Language, Parser, Query, QueryCursor, Tree};

/// Multi-language file analyzer
pub struct FileAnalyzer {
    parsers: HashMap<String, Parser>,
    languages: HashMap<String, Language>,
}

impl FileAnalyzer {
    pub fn new() -> Self {
        let mut analyzer = Self {
            parsers: HashMap::new(),
            languages: HashMap::new(),
        };
        
        analyzer.initialize_languages();
        analyzer
    }
    
    fn initialize_languages(&mut self) {
        // Initialize tree-sitter languages
        self.add_language("rust", tree_sitter_rust::language());
        self.add_language("typescript", tree_sitter_typescript::language_typescript());
        self.add_language("javascript", tree_sitter_javascript::language());
        self.add_language("python", tree_sitter_python::language());
        self.add_language("go", tree_sitter_go::language());
    }
    
    fn add_language(&mut self, name: &str, language: Language) {
        let mut parser = Parser::new();
        if parser.set_language(&language).is_ok() {
            self.parsers.insert(name.to_string(), parser);
            self.languages.insert(name.to_string(), language);
        }
    }
    
    /// Detect language from file extension
    pub fn detect_language(&self, path: &Path) -> Option<String> {
        let extension = path.extension()?.to_str()?;
        match extension {
            "rs" => Some("rust".to_string()),
            "ts" | "tsx" => Some("typescript".to_string()),
            "js" | "jsx" => Some("javascript".to_string()),
            "py" => Some("python".to_string()),
            "go" => Some("go".to_string()),
            _ => None,
        }
    }
    
    /// Parse file content and return AST
    pub fn parse_file(&mut self, content: &str, language: &str) -> Result<Tree> {
        let parser = self.parsers.get_mut(language)
            .ok_or_else(|| FileAwareError::UnsupportedLanguage { 
                language: language.to_string() 
            })?;
        
        parser.parse(content, None)
            .ok_or_else(|| FileAwareError::Parse {
                file: "unknown".to_string(),
                message: "Failed to parse file content".to_string(),
            })
    }
    
    /// Extract functions from AST
    pub fn extract_functions(&self, tree: &Tree, language: &str, content: &str) -> Result<Vec<FunctionInfo>> {
        let mut functions = Vec::new();
        
        // Language-specific function extraction
        match language {
            "rust" => {
                if let Ok(query) = Query::new(
                    &self.languages["rust"],
                    "(function_item name: (identifier) @name) @function"
                ) {
                    let mut cursor = QueryCursor::new();
                    let matches = cursor.matches(&query, tree.root_node(), content.as_bytes());
                    
                    for m in matches {
                        for capture in m.captures {
                            if capture.index == 0 { // name capture
                                let name = capture.node.utf8_text(content.as_bytes())
                                    .unwrap_or("unknown").to_string();
                                let start_pos = capture.node.start_position();
                                
                                functions.push(FunctionInfo {
                                    name,
                                    line: start_pos.row + 1,
                                    column: start_pos.column + 1,
                                    language: language.to_string(),
                                });
                            }
                        }
                    }
                }
            }
            "typescript" | "javascript" => {
                if let Ok(query) = Query::new(
                    &self.languages[language],
                    "(function_declaration name: (identifier) @name) @function"
                ) {
                    let mut cursor = QueryCursor::new();
                    let matches = cursor.matches(&query, tree.root_node(), content.as_bytes());
                    
                    for m in matches {
                        for capture in m.captures {
                            if capture.index == 0 {
                                let name = capture.node.utf8_text(content.as_bytes())
                                    .unwrap_or("unknown").to_string();
                                let start_pos = capture.node.start_position();
                                
                                functions.push(FunctionInfo {
                                    name,
                                    line: start_pos.row + 1,
                                    column: start_pos.column + 1,
                                    language: language.to_string(),
                                });
                            }
                        }
                    }
                }
            }
            _ => {} // Add more languages as needed
        }
        
        Ok(functions)
    }
    
    /// Extract imports/dependencies from AST
    pub fn extract_imports(&self, tree: &Tree, language: &str, content: &str) -> Result<Vec<ImportInfo>> {
        let mut imports = Vec::new();
        
        match language {
            "rust" => {
                if let Ok(query) = Query::new(
                    &self.languages["rust"],
                    "(use_declaration argument: (scoped_use_list path: (_) @path))"
                ) {
                    let mut cursor = QueryCursor::new();
                    let matches = cursor.matches(&query, tree.root_node(), content.as_bytes());
                    
                    for m in matches {
                        for capture in m.captures {
                            let import_path = capture.node.utf8_text(content.as_bytes())
                                .unwrap_or("unknown").to_string();
                            let start_pos = capture.node.start_position();
                            
                            imports.push(ImportInfo {
                                path: import_path,
                                line: start_pos.row + 1,
                                import_type: ImportType::Use,
                            });
                        }
                    }
                }
            }
            "typescript" | "javascript" => {
                if let Ok(query) = Query::new(
                    &self.languages[language],
                    "(import_statement source: (string) @source)"
                ) {
                    let mut cursor = QueryCursor::new();
                    let matches = cursor.matches(&query, tree.root_node(), content.as_bytes());
                    
                    for m in matches {
                        for capture in m.captures {
                            let import_path = capture.node.utf8_text(content.as_bytes())
                                .unwrap_or("unknown")
                                .trim_matches('"')
                                .trim_matches('\'')
                                .to_string();
                            let start_pos = capture.node.start_position();
                            
                            imports.push(ImportInfo {
                                path: import_path,
                                line: start_pos.row + 1,
                                import_type: ImportType::Import,
                            });
                        }
                    }
                }
            }
            _ => {}
        }
        
        Ok(imports)
    }
    
    /// Calculate basic complexity metrics
    pub fn calculate_complexity(&self, tree: &Tree, language: &str, content: &str) -> Result<ComplexityMetrics> {
        let node_count = self.count_nodes(tree.root_node());
        let depth = self.calculate_depth(tree.root_node());
        let cyclomatic = self.calculate_cyclomatic_complexity(tree, language, content)?;
        
        Ok(ComplexityMetrics {
            node_count,
            depth,
            cyclomatic_complexity: cyclomatic,
            lines_of_code: content.lines().count(),
        })
    }
    
    fn count_nodes(&self, node: tree_sitter::Node) -> usize {
        let mut count = 1;
        let mut cursor = node.walk();
        
        if cursor.goto_first_child() {
            loop {
                count += self.count_nodes(cursor.node());
                if !cursor.goto_next_sibling() {
                    break;
                }
            }
        }
        
        count
    }
    
    fn calculate_depth(&self, node: tree_sitter::Node) -> usize {
        let mut max_depth = 0;
        let mut cursor = node.walk();
        
        if cursor.goto_first_child() {
            loop {
                let child_depth = self.calculate_depth(cursor.node());
                max_depth = max_depth.max(child_depth);
                if !cursor.goto_next_sibling() {
                    break;
                }
            }
        }
        
        max_depth + 1
    }
    
    fn calculate_cyclomatic_complexity(&self, tree: &Tree, language: &str, content: &str) -> Result<usize> {
        // Basic cyclomatic complexity calculation
        let decision_patterns = match language {
            "rust" => vec![
                "(if_expression)",
                "(match_expression)", 
                "(while_expression)",
                "(for_expression)",
                "(loop_expression)",
            ],
            "typescript" | "javascript" => vec![
                "(if_statement)",
                "(switch_statement)",
                "(while_statement)", 
                "(for_statement)",
                "(for_in_statement)",
                "(conditional_expression)",
            ],
            _ => vec![],
        };
        
        let mut complexity = 1; // Base complexity
        
        for pattern in decision_patterns {
            if let Ok(query) = Query::new(&self.languages[language], pattern) {
                let mut cursor = QueryCursor::new();
                let matches = cursor.matches(&query, tree.root_node(), content.as_bytes());
                complexity += matches.count();
            }
        }
        
        Ok(complexity)
    }
    
    /// Analyze a single file and return comprehensive analysis
    pub fn analyze_file(&mut self, file_path: &str) -> Result<FileAnalysisResult> {
        use std::fs;
        
        let path = Path::new(file_path);
        let content = fs::read_to_string(path)
            .map_err(|e| FileAwareError::Io { 
                message: format!("Failed to read file {}: {}", file_path, e) 
            })?;
        
        let language = self.detect_language(path)
            .ok_or_else(|| FileAwareError::UnsupportedLanguage { 
                language: path.extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("unknown")
                    .to_string() 
            })?;
        
        let tree = self.parse_file(&content, &language)?;
        let functions = self.extract_functions(&tree, &language, &content)?;
        let imports = self.extract_imports(&tree, &language, &content)?;
        let complexity = self.calculate_complexity(&tree, &language, &content)?;
        
        // Convert to expected types
        let dependencies = imports.into_iter().map(|import| {
            crate::FileDependency {
                from: file_path.to_string(),
                to: import.path,
                dependency_type: match import.import_type {
                    ImportType::Import => crate::DependencyType::Import,
                    ImportType::Use => crate::DependencyType::Import,
                    ImportType::Include => crate::DependencyType::Include,
                    ImportType::Require => crate::DependencyType::Import,
                },
                line: Some(import.line),
            }
        }).collect();
        
        let symbols = functions.into_iter().map(|func| {
            crate::SymbolReference {
                name: func.name,
                symbol_type: crate::SymbolType::Function,
                file: file_path.to_string(),
                line: func.line,
                column: func.column,
                scope: "global".to_string(), // Simplified for now
            }
        }).collect();
        
        Ok(FileAnalysisResult {
            language,
            dependencies,
            symbols,
            line_count: complexity.lines_of_code,
            complexity_metrics: complexity,
        })
    }

    /// Get available parsers (for testing)
    pub fn get_parsers(&self) -> &HashMap<String, Parser> {
        &self.parsers
    }
}

impl Default for FileAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct FunctionInfo {
    pub name: String,
    pub line: usize,
    pub column: usize,
    pub language: String,
}

#[derive(Debug, Clone)]
pub struct ImportInfo {
    pub path: String,
    pub line: usize,
    pub import_type: ImportType,
}

#[derive(Debug, Clone)]
pub enum ImportType {
    Import,
    Use,
    Include,
    Require,
}

#[derive(Debug, Clone)]
pub struct ComplexityMetrics {
    pub node_count: usize,
    pub depth: usize,
    pub cyclomatic_complexity: usize,
    pub lines_of_code: usize,
}

#[derive(Debug, Clone)]
pub struct FileAnalysisResult {
    pub language: String,
    pub dependencies: Vec<crate::FileDependency>,
    pub symbols: Vec<crate::SymbolReference>,
    pub line_count: usize,
    pub complexity_metrics: ComplexityMetrics,
}