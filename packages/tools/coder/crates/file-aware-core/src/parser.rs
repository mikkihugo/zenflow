//! Language parsers and AST utilities

pub use crate::analysis::{FileAnalyzer, FunctionInfo, ImportInfo, ComplexityMetrics};

// Re-export tree-sitter types for convenience
pub use tree_sitter::{Language, Parser, Tree, Node, Query, QueryCursor};

/// Language detection utilities
pub fn detect_language_from_path(path: &str) -> Option<&'static str> {
    if let Some(ext) = std::path::Path::new(path).extension().and_then(|e| e.to_str()) {
        match ext {
            "rs" => Some("rust"),
            "ts" | "tsx" => Some("typescript"),
            "js" | "jsx" => Some("javascript"),
            "py" => Some("python"),
            "go" => Some("go"),
            _ => None,
        }
    } else {
        None
    }
}

/// Get supported file extensions
pub fn supported_extensions() -> &'static [&'static str] {
    &["rs", "ts", "tsx", "js", "jsx", "py", "go"]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_language_detection() {
        assert_eq!(detect_language_from_path("test.rs"), Some("rust"));
        assert_eq!(detect_language_from_path("test.ts"), Some("typescript"));
        assert_eq!(detect_language_from_path("test.txt"), None);
    }
}