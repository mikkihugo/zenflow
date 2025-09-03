//! Code pattern detection and analysis

use serde::{Deserialize, Serialize};
use regex::Regex;

/// Code pattern detector
#[derive(Debug)]
pub struct PatternDetector {
    patterns: Vec<CodePattern>,
}

impl PatternDetector {
    pub fn new() -> Self {
        Self {
            patterns: Self::default_patterns(),
        }
    }

    /// Get default code patterns to detect
    fn default_patterns() -> Vec<CodePattern> {
        vec![
            CodePattern {
                name: "TODO comment".to_string(),
                regex: Regex::new(r"(?i)todo:?").unwrap(),
                severity: PatternSeverity::Info,
                language: None,
            },
            CodePattern {
                name: "FIXME comment".to_string(),
                regex: Regex::new(r"(?i)fixme:?").unwrap(),
                severity: PatternSeverity::Warning,
                language: None,
            },
            CodePattern {
                name: "Console log".to_string(),
                regex: Regex::new(r"console\.(log|debug|info|warn|error)").unwrap(),
                severity: PatternSeverity::Info,
                language: Some("javascript".to_string()),
            },
        ]
    }

    /// Detect patterns in code content
    pub fn detect_patterns(&self, content: &str, language: Option<&str>) -> Vec<PatternMatch> {
        let mut matches = Vec::new();

        for (line_no, line) in content.lines().enumerate() {
            for pattern in &self.patterns {
                // Check language filter
                if let Some(pattern_lang) = &pattern.language {
                    if let Some(lang) = language {
                        if pattern_lang != lang {
                            continue;
                        }
                    }
                }

                // Check for matches
                for m in pattern.regex.find_iter(line) {
                    matches.push(PatternMatch {
                        pattern_name: pattern.name.clone(),
                        line: line_no + 1,
                        column: m.start() + 1,
                        matched_text: m.as_str().to_string(),
                        severity: pattern.severity.clone(),
                    });
                }
            }
        }

        matches
    }
}

impl Default for PatternDetector {
    fn default() -> Self {
        Self::new()
    }
}

/// A code pattern to detect
#[derive(Debug, Clone)]
pub struct CodePattern {
    pub name: String,
    pub regex: Regex,
    pub severity: PatternSeverity,
    pub language: Option<String>,
}

/// A detected pattern match
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternMatch {
    pub pattern_name: String,
    pub line: usize,
    pub column: usize,
    pub matched_text: String,
    pub severity: PatternSeverity,
}

/// Severity levels for detected patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternSeverity {
    Info,
    Warning,
    Error,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pattern_detector() {
        let detector = PatternDetector::new();
        let content = "// TODO: implement this\nconsole.log('test');";
        let matches = detector.detect_patterns(content, Some("javascript"));
        
        assert_eq!(matches.len(), 2);
        assert_eq!(matches[0].pattern_name, "TODO comment");
        assert_eq!(matches[1].pattern_name, "Console log");
    }
}