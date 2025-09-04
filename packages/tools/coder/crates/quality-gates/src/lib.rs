//! Quality Gates Module
//! 
//! Enforces code quality standards using Oxlint and ESLint integration.
//! Provides quality gate validation and enforcement for the code analysis pipeline.

use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use anyhow::{Result, anyhow};
use regex::Regex;
use std::fs;
use tracing::{info, warn, error};

/// Configuration for quality gate enforcement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityGateConfig {
    pub oxlint_enabled: bool,
    pub eslint_enabled: bool,
    pub custom_rules: Vec<QualityRule>,
    pub thresholds: QualityThresholds,
    pub ai_pattern_detection: bool,
}

/// Quality rule definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityRule {
    pub name: String,
    pub description: String,
    pub severity: RuleSeverity,
    pub pattern: String,
    pub message: String,
    pub category: RuleCategory,
}

/// Rule severity levels
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RuleSeverity {
    Error,
    Warning,
    Info,
}

/// Rule categories for better organization
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RuleCategory {
    Security,
    Performance,
    Maintainability,
    Readability,
    AIGenerated,
    Enterprise,
    Compliance,
}

/// Quality thresholds for enforcement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityThresholds {
    pub max_errors: usize,
    pub max_warnings: usize,
    pub min_score: f64,
    pub max_complexity: f64,
    pub max_cognitive_complexity: f64,
}

/// Quality gate result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityGateResult {
    pub status: QualityGateStatus,
    pub score: f64,
    pub total_issues: usize,
    pub errors: Vec<QualityIssue>,
    pub warnings: Vec<QualityIssue>,
    pub info: Vec<QualityIssue>,
    pub ai_pattern_issues: Vec<QualityIssue>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Quality gate status
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum QualityGateStatus {
    Passed,
    Failed,
    Warning,
    Skipped,
}

/// Individual quality issue
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityIssue {
    pub rule: String,
    pub message: String,
    pub severity: RuleSeverity,
    pub category: RuleCategory,
    pub file_path: Option<String>,
    pub line_number: Option<usize>,
    pub column: Option<usize>,
    pub code_snippet: Option<String>,
    pub suggestion: Option<String>,
}

/// Quality gate engine for enforcing code quality standards
pub struct QualityGateEngine {
    config: QualityGateConfig,
    ai_pattern_rules: Vec<QualityRule>,
    enterprise_rules: Vec<QualityRule>,
}

impl QualityGateEngine {
    /// Create a new quality gate engine with default configuration
    pub fn new() -> Self {
        let mut engine = Self {
            config: QualityGateConfig::default(),
            ai_pattern_rules: Vec::new(),
            enterprise_rules: Vec::new(),
        };

        // Initialize AI pattern detection rules
        engine.initialize_ai_pattern_rules();
        
        // Initialize enterprise compliance rules
        engine.initialize_enterprise_rules();

        engine
    }

    /// Initialize AI-generated code pattern detection rules
    fn initialize_ai_pattern_rules(&mut self) {
        self.ai_pattern_rules = vec![
            // Common AI-generated code smells
            QualityRule {
                name: "ai_placeholder_comments".to_string(),
                description: "Detect placeholder comments that indicate incomplete AI-generated code".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"(?i)(TODO|FIXME|HACK|XXX|PLACEHOLDER|STUB|TEMP|DUMMY).*".to_string(),
                message: "AI-generated placeholder detected - implement real functionality".to_string(),
                category: RuleCategory::AIGenerated,
            },
            QualityRule {
                name: "ai_unused_parameters".to_string(),
                description: "Detect unused parameters prefixed with underscore".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"_\w+\s*:".to_string(),
                message: "Unused parameter detected - implement or remove if not needed".to_string(),
                category: RuleCategory::AIGenerated,
            },
            QualityRule {
                name: "ai_magic_numbers".to_string(),
                description: "Detect magic numbers without constants".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"\b[0-9]{2,}\b".to_string(),
                message: "Magic number detected - define as named constant".to_string(),
                category: RuleCategory::AIGenerated,
            },
            QualityRule {
                name: "ai_long_functions".to_string(),
                description: "Detect functions longer than 50 lines".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"fn\s+\w+.*\{[\s\S]{0,1000}".to_string(),
                message: "Function is too long - consider breaking into smaller functions".to_string(),
                category: RuleCategory::AIGenerated,
            },
            QualityRule {
                name: "ai_nested_conditionals".to_string(),
                description: "Detect deeply nested conditional statements".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"if.*\{[\s\S]*if.*\{[\s\S]*if.*\{".to_string(),
                message: "Deeply nested conditionals detected - consider refactoring".to_string(),
                category: RuleCategory::AIGenerated,
            },
            // Additional AI pattern detection rules
            QualityRule {
                name: "ai_generic_names".to_string(),
                description: "Detect overly generic variable/function names".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"\b(data|value|result|temp|var|obj|item|thing|stuff)\b".to_string(),
                message: "Generic name detected - use descriptive names".to_string(),
                category: RuleCategory::AIGenerated,
            },
            QualityRule {
                name: "ai_empty_catch_blocks".to_string(),
                description: "Detect empty catch blocks that ignore errors".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"catch\s*\([^)]*\)\s*\{\s*\}".to_string(),
                message: "Empty catch block detected - handle errors properly".to_string(),
                category: RuleCategory::AIGenerated,
            },
            QualityRule {
                name: "ai_hardcoded_paths".to_string(),
                description: "Detect hardcoded file paths".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"['\x22](/[^'\x22]+|C:\\[^'\x22]+|\.\\[^'\x22]+)".to_string(),
                message: "Hardcoded path detected - use configuration or environment variables".to_string(),
                category: RuleCategory::AIGenerated,
            },
        ];
    }

    /// Initialize enterprise compliance rules
    fn initialize_enterprise_rules(&mut self) {
        self.enterprise_rules = vec![
            // Security rules
            QualityRule {
                name: "security_hardcoded_secrets".to_string(),
                description: "Detect hardcoded secrets and credentials".to_string(),
                severity: RuleSeverity::Error,
                pattern: r"(?i)(password|secret|key|token|credential)\s*[:=]\s*['\x22][^'\x22]+['\x22]".to_string(),
                message: "Hardcoded secret detected - use environment variables or secure storage".to_string(),
                category: RuleCategory::Security,
            },
            QualityRule {
                name: "security_sql_injection".to_string(),
                description: "Detect potential SQL injection vulnerabilities".to_string(),
                severity: RuleSeverity::Error,
                pattern: r"(?i)SELECT.*\+.*\w+|INSERT.*\+.*\w+|UPDATE.*\+.*\w+".to_string(),
                message: "Potential SQL injection detected - use parameterized queries".to_string(),
                category: RuleCategory::Security,
            },
            QualityRule {
                name: "security_unsafe_eval".to_string(),
                description: "Detect unsafe eval() usage".to_string(),
                severity: RuleSeverity::Error,
                pattern: r"eval\s*\(".to_string(),
                message: "Unsafe eval() detected - use safer alternatives".to_string(),
                category: RuleCategory::Security,
            },
            
            // Performance rules
            QualityRule {
                name: "performance_n_plus_one".to_string(),
                description: "Detect potential N+1 query patterns".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"(?i)for.*in.*query|forEach.*query".to_string(),
                message: "Potential N+1 query pattern detected - consider batch operations".to_string(),
                category: RuleCategory::Performance,
            },
            QualityRule {
                name: "performance_memory_leak".to_string(),
                description: "Detect potential memory leak patterns".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"(?i)setInterval|setTimeout.*function".to_string(),
                message: "Potential memory leak detected - ensure proper cleanup".to_string(),
                category: RuleCategory::Performance,
            },
            
            // Maintainability rules
            QualityRule {
                name: "maintainability_duplicate_code".to_string(),
                description: "Detect duplicate code blocks".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r"(\w+\s*\{[^}]{10,}\})[\s\S]*\1".to_string(),
                message: "Duplicate code detected - consider extracting to function".to_string(),
                category: RuleCategory::Maintainability,
            },
            QualityRule {
                name: "maintainability_long_file".to_string(),
                description: "Detect files longer than 500 lines".to_string(),
                severity: RuleSeverity::Warning,
                pattern: r".*".to_string(), // Will be checked by file analysis
                message: "File is too long - consider splitting into smaller modules".to_string(),
                category: RuleCategory::Maintainability,
            },
        ];
    }

    /// Run all quality gates on a project
    pub async fn run_all_gates(&self, project_path: &str) -> Result<QualityGateResult> {
        let mut all_issues = Vec::new();
        let mut total_score = 100.0;

        // Run Oxlint if enabled
        if self.config.oxlint_enabled {
            match self.run_oxlint(project_path).await {
                Ok(issues) => all_issues.extend(issues),
                Err(e) => {
                    warn!("Oxlint failed: {}", e);
                    all_issues.push(QualityIssue {
                        rule: "oxlint_error".to_string(),
                        message: format!("Oxlint execution failed: {}", e),
                        severity: RuleSeverity::Error,
                        category: RuleCategory::Compliance,
                        file_path: None,
                        line_number: None,
                        column: None,
                        code_snippet: None,
                        suggestion: None,
                    });
                }
            }
        }

        // Run ESLint if enabled
        if self.config.eslint_enabled {
            match self.run_eslint(project_path).await {
                Ok(issues) => all_issues.extend(issues),
                Err(e) => {
                    warn!("ESLint failed: {}", e);
                    all_issues.push(QualityIssue {
                        rule: "eslint_error".to_string(),
                        message: format!("ESLint execution failed: {}", e),
                        severity: RuleSeverity::Error,
                        category: RuleCategory::Compliance,
                        file_path: None,
                        line_number: None,
                        column: None,
                        code_snippet: None,
                        suggestion: None,
                    });
                }
            }
        }

        // Run custom pattern detection
        let custom_issues = self.run_custom_pattern_detection(project_path).await?;
        all_issues.extend(custom_issues);

        // Run AI pattern detection
        if self.config.ai_pattern_detection {
            let ai_issues = self.run_ai_pattern_detection(project_path).await?;
            all_issues.extend(ai_issues);
        }

        // Calculate score and determine status
        let errors: Vec<_> = all_issues.iter()
            .filter(|issue| issue.severity == RuleSeverity::Error)
            .cloned()
            .collect();

        let warnings: Vec<_> = all_issues.iter()
            .filter(|issue| issue.severity == RuleSeverity::Warning)
            .cloned()
            .collect();

        let info: Vec<_> = all_issues.iter()
            .filter(|issue| issue.severity == RuleSeverity::Info)
            .cloned()
            .collect();

        let ai_pattern_issues: Vec<_> = all_issues.iter()
            .filter(|issue| issue.category == RuleCategory::AIGenerated)
            .cloned()
            .collect();

        // Calculate score based on issues
        if !errors.is_empty() {
            total_score -= (errors.len() * 20) as f64;
        }
        if !warnings.is_empty() {
            total_score -= (warnings.len() * 5) as f64;
        }
        total_score = total_score.max(0.0);

        // Determine status
        let status = if !errors.is_empty() && total_score < self.config.thresholds.min_score {
            QualityGateStatus::Failed
        } else if !warnings.is_empty() || total_score < self.config.thresholds.min_score {
            QualityGateStatus::Warning
        } else {
            QualityGateStatus::Passed
        };

        Ok(QualityGateResult {
            status,
            score: total_score,
            total_issues: all_issues.len(),
            errors,
            warnings,
            info,
            ai_pattern_issues,
            timestamp: chrono::Utc::now(),
        })
    }

    /// Run Oxlint for Rust code analysis
    async fn run_oxlint(&self, project_path: &str) -> Result<Vec<QualityIssue>> {
        let output = Command::new("oxlint")
            .arg(project_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()?;

        let mut issues = Vec::new();
        
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            for line in stderr.lines() {
                if let Some(issue) = self.parse_oxlint_output(line) {
                    issues.push(issue);
                }
            }
        }

        Ok(issues)
    }

    /// Run ESLint for JavaScript/TypeScript code analysis
    async fn run_eslint(&self, project_path: &str) -> Result<Vec<QualityIssue>> {
        let output = Command::new("npx")
            .arg("eslint")
            .arg("--format=json")
            .arg(project_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()?;

        let mut issues = Vec::new();
        
        if !output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if let Some(issue) = self.parse_eslint_output(line) {
                    issues.push(issue);
                }
            }
        }

        Ok(issues)
    }

    /// Run custom pattern detection rules
    async fn run_custom_pattern_detection(&self, project_path: &str) -> Result<Vec<QualityIssue>> {
        let mut issues = Vec::new();
        
        // Walk through project files and apply custom rules
        for entry in walkdir::WalkDir::new(project_path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
        {
            let file_path = entry.path();
            if let Some(extension) = file_path.extension() {
                let ext = extension.to_string_lossy();
                if matches!(ext.as_ref(), "rs" | "ts" | "js" | "tsx" | "jsx") {
                    if let Ok(content) = fs::read_to_string(file_path) {
                        for rule in &self.config.custom_rules {
                            if let Some(issue) = self.apply_rule(&content, rule, file_path) {
                                issues.push(issue);
                            }
                        }
                    }
                }
            }
        }

        Ok(issues)
    }

    /// Run AI pattern detection
    async fn run_ai_pattern_detection(&self, project_path: &str) -> Result<Vec<QualityIssue>> {
        let mut issues = Vec::new();
        
        for entry in walkdir::WalkDir::new(project_path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
        {
            let file_path = entry.path();
            if let Some(extension) = file_path.extension() {
                let ext = extension.to_string_lossy();
                if matches!(ext.as_ref(), "rs" | "ts" | "js" | "tsx" | "jsx") {
                    if let Ok(content) = fs::read_to_string(file_path) {
                        for rule in &self.ai_pattern_rules {
                            if let Some(issue) = self.apply_rule(&content, rule, file_path) {
                                issues.push(issue);
                            }
                        }
                    }
                }
            }
        }

        Ok(issues)
    }

    /// Apply a quality rule to content
    fn apply_rule(&self, content: &str, rule: &QualityRule, file_path: &std::path::Path) -> Option<QualityIssue> {
        let regex = Regex::new(&rule.pattern).ok()?;
        
        if regex.is_match(content) {
            Some(QualityIssue {
                rule: rule.name.clone(),
                message: rule.message.clone(),
                severity: rule.severity.clone(),
                category: rule.category.clone(),
                file_path: Some(file_path.to_string_lossy().to_string()),
                line_number: None, // Could be enhanced to find line numbers
                column: None,
                code_snippet: None,
                suggestion: Some(format!("Review and fix: {}", rule.description)),
            })
        } else {
            None
        }
    }

    /// Parse Oxlint output with proper format parsing
    fn parse_oxlint_output(&self, line: &str) -> Option<QualityIssue> {
        // Parse Oxlint output format: file:line:col: message [rule]
        let parts: Vec<&str> = line.split(':').collect();
        
        if parts.len() >= 4 {
            let file_path = parts[0].trim();
            let line_number = parts[1].trim().parse::<usize>().ok();
            let column = parts[2].trim().parse::<usize>().ok();
            
            // Extract message and rule
            let message_part = parts[3..].join(":").trim().to_string();
            let (message, rule) = if message_part.contains('[') {
                let bracket_start = message_part.rfind('[').unwrap();
                let bracket_end = message_part.rfind(']').unwrap_or(bracket_start);
                if bracket_end > bracket_start {
                    let msg = message_part[..bracket_start].trim();
                    let rule_name = message_part[bracket_start + 1..bracket_end].trim();
                    (msg.to_string(), rule_name.to_string())
                } else {
                    (message_part.to_string(), "oxlint_rule".to_string())
                }
            } else {
                (message_part.to_string(), "oxlint_issue".to_string())
            };
            
            Some(QualityIssue {
                rule,
                message,
                severity: RuleSeverity::Warning, // Oxlint doesn't have severity levels
                category: RuleCategory::Compliance,
                file_path: Some(file_path.to_string()),
                line_number,
                column,
                code_snippet: None,
                suggestion: Some("Review and fix the identified issue".to_string()),
            })
        } else {
            // Fallback for malformed output
            Some(QualityIssue {
                rule: "oxlint_issue".to_string(),
                message: line.to_string(),
                severity: RuleSeverity::Warning,
                category: RuleCategory::Compliance,
                file_path: None,
                line_number: None,
                column: None,
                code_snippet: None,
                suggestion: None,
            })
        }
    }

    /// Parse ESLint output with proper JSON parsing
    fn parse_eslint_output(&self, line: &str) -> Option<QualityIssue> {
        // ESLint outputs JSON, so we parse it properly
        if let Ok(json_value) = serde_json::from_str::<serde_json::Value>(line) {
            // Extract issue details from ESLint JSON format
            if let Some(file_path) = json_value.get("filePath").and_then(|v| v.as_str()) {
                let line_number = json_value.get("line").and_then(|v| v.as_u64()).map(|n| n as usize);
                let column = json_value.get("column").and_then(|v| v.as_u64()).map(|n| n as usize);
                let message = json_value.get("message").and_then(|v| v.as_str()).unwrap_or("ESLint issue");
                let rule = json_value.get("ruleId").and_then(|v| v.as_str()).unwrap_or("eslint_rule");
                let severity = if json_value.get("severity").and_then(|v| v.as_u64()) == Some(2) {
                    RuleSeverity::Error
                } else {
                    RuleSeverity::Warning
                };
                
                Some(QualityIssue {
                    rule: rule.to_string(),
                    message: message.to_string(),
                    severity,
                    category: RuleCategory::Compliance,
                    file_path: Some(file_path.to_string()),
                    line_number,
                    column,
                    code_snippet: None,
                    suggestion: Some("Review and fix the ESLint issue".to_string()),
                })
            } else {
                None
            }
        } else {
            // Fallback for non-JSON lines
            Some(QualityIssue {
                rule: "eslint_issue".to_string(),
                message: line.to_string(),
                severity: RuleSeverity::Warning,
                category: RuleCategory::Compliance,
                file_path: None,
                line_number: None,
                column: None,
                code_snippet: None,
                suggestion: None,
            })
        }
    }
}

impl Default for QualityGateEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl Default for QualityGateConfig {
    fn default() -> Self {
        Self {
            oxlint_enabled: true,
            eslint_enabled: true,
            custom_rules: Vec::new(),
            thresholds: QualityThresholds::default(),
            ai_pattern_detection: true,
        }
    }
}

impl Default for QualityThresholds {
    fn default() -> Self {
        Self {
            max_errors: 0,
            max_warnings: 10,
            min_score: 80.0,
            max_complexity: 10.0,
            max_cognitive_complexity: 15.0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quality_rule_creation() {
        let rule = QualityRule {
            name: "test_rule".to_string(),
            description: "Test rule".to_string(),
            severity: RuleSeverity::Warning,
            pattern: r"test".to_string(),
            message: "Test message".to_string(),
            category: RuleCategory::Maintainability,
        };

        assert_eq!(rule.name, "test_rule");
        assert_eq!(rule.severity, RuleSeverity::Warning);
    }

    #[test]
    fn test_ai_pattern_rules_initialization() {
        let engine = QualityGateEngine::new();
        assert!(!engine.ai_pattern_rules.is_empty());
        
        let placeholder_rule = engine.ai_pattern_rules.iter()
            .find(|r| r.name == "ai_placeholder_comments")
            .expect("Should have placeholder rule");
        
        assert_eq!(placeholder_rule.category, RuleCategory::AIGenerated);
    }

    #[test]
    fn test_enterprise_rules_initialization() {
        let engine = QualityGateEngine::new();
        assert!(!engine.enterprise_rules.is_empty());
        
        let security_rule = engine.enterprise_rules.iter()
            .find(|r| r.category == RuleCategory::Security)
            .expect("Should have security rules");
        
        assert_eq!(security_rule.severity, RuleSeverity::Error);
    }

    #[tokio::test]
    async fn test_quality_gate_engine_creation() {
        let engine = QualityGateEngine::new();
        assert!(engine.config.ai_pattern_detection);
        assert!(engine.config.oxlint_enabled);
        assert!(engine.config.eslint_enabled);
    }
}
