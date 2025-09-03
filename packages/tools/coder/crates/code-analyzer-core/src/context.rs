//! Context building for file-aware analysis
//! 
//! Builds comprehensive context about codebases by analyzing file relationships,
//! dependencies, and project structure.

use std::collections::HashMap;
use std::path::Path;

use crate::{
    AnalyzedContext, SymbolReference, ComplexityLevel,
    FileAwareRequest, Result, analysis::FileAnalyzer
};

/// Context builder that analyzes project structure and relationships
pub struct ContextBuilder {
    analyzer: FileAnalyzer,
    max_files: usize,
    max_file_size: u64,
}

impl ContextBuilder {
    /// Create a new context builder
    pub fn new() -> Self {
        Self {
            analyzer: FileAnalyzer::new(),
            max_files: 1000,
            max_file_size: 1024 * 1024, // 1MB
        }
    }

    /// Build context from a file-aware request
    pub fn build_context(&mut self, request: &FileAwareRequest) -> Result<AnalyzedContext> {
        let root_path = Path::new(&request.root_path);
        
        // Discover relevant files
        let relevant_files = if request.files.is_empty() {
            self.discover_files(root_path, request)?
        } else {
            request.files.clone()
        };

        // Analyze files for dependencies and symbols
        let mut dependencies = Vec::new();
        let mut symbols = Vec::new();
        let mut languages = HashMap::new();
        let mut total_lines = 0;
        
        for file_path in &relevant_files {
            if let Ok(analysis) = self.analyzer.analyze_file(file_path) {
                // Extract dependencies
                dependencies.extend(analysis.dependencies);
                
                // Extract symbols
                symbols.extend(analysis.symbols);
                
                // Count language usage
                *languages.entry(analysis.language.clone()).or_insert(0) += 1;
                
                // Count lines
                total_lines += analysis.line_count;
            }
        }

        // Assess complexity
        let complexity = self.assess_complexity(&relevant_files, &symbols, total_lines);
        
        // Generate summary
        let summary = format!(
            "Analyzed {} files across {} languages. Total {} lines of code. Complexity: {:?}",
            relevant_files.len(),
            languages.len(),
            total_lines,
            complexity
        );
        
        Ok(AnalyzedContext {
            relevant_files,
            dependencies,
            symbols,
            summary,
            complexity,
            languages,
            total_lines,
        })
    }
    
    /// Discover relevant files in a directory
    fn discover_files(&self, root_path: &Path, request: &FileAwareRequest) -> Result<Vec<String>> {
        use walkdir::WalkDir;
        
        let mut files = Vec::new();
        let mut file_count = 0;
        
        // Default exclusions
        let exclude_patterns = request.context
            .as_ref()
            .and_then(|c| c.exclude_patterns.as_ref())
            .cloned()
            .unwrap_or_else(|| vec![
                "node_modules".to_string(),
                ".git".to_string(),
                "target".to_string(),
                "dist".to_string(),
                "build".to_string(),
            ]);

        for entry in WalkDir::new(root_path)
            .follow_links(false)
            .max_depth(10)
        {
            if file_count >= self.max_files {
                break;
            }
            
            let entry = entry.map_err(|e| FileAwareError::Io { 
                message: format!("Failed to read directory entry: {}", e),
            })?;
            
            let path = entry.path();
            
            // Skip directories
            if path.is_dir() {
                continue;
            }
            
            // Check exclusions
            let path_str = path.to_string_lossy();
            if exclude_patterns.iter().any(|pattern| path_str.contains(pattern)) {
                continue;
            }
            
            // Check file size
            if let Ok(metadata) = entry.metadata() {
                if metadata.len() > self.max_file_size {
                    continue;
                }
            }

            // Check if it's a source file
            if self.is_source_file(path) {
                files.push(path.to_string_lossy().to_string());
                file_count += 1;
            }
        }
        
        Ok(files)
    }
    
    /// Check if a file is a source code file
    fn is_source_file(&self, path: &Path) -> bool {
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            matches!(ext, 
                "rs" | "ts" | "tsx" | "js" | "jsx" | "py" | "go" | "java" | 
                "cpp" | "c" | "h" | "hpp" | "cs" | "php" | "rb" | "swift" |
                "kt" | "scala" | "clj" | "hs" | "elm" | "vue" | "svelte"
            )
        } else {
            false
        }
    }

    /// Assess the complexity of the analyzed codebase
    fn assess_complexity(&self, files: &[String], symbols: &[SymbolReference], total_lines: usize) -> ComplexityLevel {
        let file_count = files.len();
        let symbol_count = symbols.len();
        
        // Simple heuristic for complexity assessment
        let complexity_score = file_count * 2 + symbol_count + (total_lines / 100);
        
        match complexity_score {
            0..=50 => ComplexityLevel::Low,
            51..=200 => ComplexityLevel::Medium,
            201..=500 => ComplexityLevel::High,
            _ => ComplexityLevel::VeryHigh,
        }
    }
    
    /// Set maximum number of files to analyze
    pub fn with_max_files(mut self, max_files: usize) -> Self {
        self.max_files = max_files;
        self
    }

    /// Set maximum file size to analyze
    pub fn with_max_file_size(mut self, max_size: u64) -> Self {
        self.max_file_size = max_size;
        self
    }
}

impl Default for ContextBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::fs;

    #[test]
    fn test_context_builder_creation() {
        let builder = ContextBuilder::new();
        assert_eq!(builder.max_files, 1000);
    }

    #[test]
    fn test_is_source_file() {
        let builder = ContextBuilder::new();
        assert!(builder.is_source_file(Path::new("test.rs")));
        assert!(builder.is_source_file(Path::new("test.ts")));
        assert!(!builder.is_source_file(Path::new("test.txt")));
    }

    #[test]
    fn test_complexity_assessment() {
        let builder = ContextBuilder::new();
        let files = vec!["file1.rs".to_string(), "file2.rs".to_string()];
        let symbols = vec![];
        
        let complexity = builder.assess_complexity(&files, &symbols, 100);
        assert!(matches!(complexity, ComplexityLevel::Low));
    }

    #[test]
    fn test_discover_files_empty_dir() {
        let temp_dir = TempDir::new().unwrap();
        let builder = ContextBuilder::new();
        
        let request = FileAwareRequest {
            task: "test".to_string(),
            files: vec![],
            root_path: temp_dir.path().to_string_lossy().to_string(),
            context: None,
            options: None,
        };
        
        let files = builder.discover_files(temp_dir.path(), &request).unwrap();
        assert!(files.is_empty());
    }

    #[test]
    fn test_discover_files_with_source() {
        let temp_dir = TempDir::new().unwrap();
        let test_file = temp_dir.path().join("test.rs");
        fs::write(&test_file, "fn main() {}").unwrap();
        
        let builder = ContextBuilder::new();
        let request = FileAwareRequest {
            task: "test".to_string(),
            files: vec![],
            root_path: temp_dir.path().to_string_lossy().to_string(),
            context: None,
            options: None,
        };
        
        let files = builder.discover_files(temp_dir.path(), &request).unwrap();
        assert_eq!(files.len(), 1);
        assert!(files[0].ends_with("test.rs"));
    }
}