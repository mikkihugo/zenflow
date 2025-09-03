use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};
use crate::config::{SecurityConfig, SecurityRule};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternMatch {
    pub pattern: String,
    pub confidence: f64,
    pub severity: String,
    pub context: String,
    pub rule_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningData {
    pub pattern: String,
    pub is_malicious: bool,
    pub context: String,
    pub feedback_timestamp: chrono::DateTime<chrono::Utc>,
    pub user_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternStats {
    pub total_matches: u64,
    pub false_positives: u64,
    pub true_positives: u64,
    pub confidence_score: f64,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

pub struct MLPatternEngine {
    security_config: Arc<RwLock<SecurityConfig>>,
    pattern_stats: Arc<RwLock<HashMap<String, PatternStats>>>,
    learning_data: Arc<RwLock<Vec<LearningData>>>,
    compiled_patterns: Arc<RwLock<HashMap<String, regex::Regex>>>,
}

impl MLPatternEngine {
    pub fn new(security_config: SecurityConfig) -> Result<Self> {
        let compiled_patterns = Self::compile_patterns(&security_config)?;
        
        Ok(Self {
            security_config: Arc::new(RwLock::new(security_config)),
            pattern_stats: Arc::new(RwLock::new(HashMap::new())),
            learning_data: Arc::new(RwLock::new(Vec::new())),
            compiled_patterns: Arc::new(RwLock::new(compiled_patterns)),
        })
    }

    pub async fn analyze_content(&self, content: &str, context: &str) -> Result<Vec<PatternMatch>> {
        let security_config = self.security_config.read().await;
        let compiled_patterns = self.compiled_patterns.read().await;
        let mut matches = Vec::new();

        // Check against suspicious patterns
        for pattern in &security_config.suspicious_patterns {
            if let Some(regex) = compiled_patterns.get(pattern) {
                if let Some(mat) = regex.find(content) {
                    let confidence = self.calculate_confidence(pattern, context).await;
                    
                    if confidence >= security_config.confidence_threshold {
                        matches.push(PatternMatch {
                            pattern: pattern.clone(),
                            confidence,
                            severity: self.determine_severity(pattern, &security_config).await,
                            context: context.to_string(),
                            rule_name: None,
                        });
                    }
                }
            } else if content.contains(pattern) {
                // Simple string matching for non-regex patterns
                let confidence = self.calculate_confidence(pattern, context).await;
                
                if confidence >= security_config.confidence_threshold {
                    matches.push(PatternMatch {
                        pattern: pattern.clone(),
                        confidence,
                        severity: self.determine_severity(pattern, &security_config).await,
                        context: context.to_string(),
                        rule_name: None,
                    });
                }
            }
        }

        // Check against custom rules
        for rule in &security_config.custom_rules {
            if !rule.enabled {
                continue;
            }

            if let Some(regex) = compiled_patterns.get(&rule.pattern) {
                if let Some(_mat) = regex.find(content) {
                    let confidence = self.calculate_rule_confidence(rule, context).await;
                    
                    if confidence >= security_config.confidence_threshold {
                        matches.push(PatternMatch {
                            pattern: rule.pattern.clone(),
                            confidence,
                            severity: rule.severity.clone(),
                            context: context.to_string(),
                            rule_name: Some(rule.name.clone()),
                        });
                    }
                }
            }
        }

        // Update statistics
        self.update_pattern_stats(&matches).await?;

        Ok(matches)
    }

    pub async fn add_feedback(&self, pattern: &str, is_malicious: bool, context: &str, user_id: Option<String>) -> Result<()> {
        let learning_data = LearningData {
            pattern: pattern.to_string(),
            is_malicious,
            context: context.to_string(),
            feedback_timestamp: chrono::Utc::now(),
            user_id,
        };

        {
            let mut learning_data_guard = self.learning_data.write().await;
            learning_data_guard.push(learning_data);
        }

        // Update pattern statistics based on feedback
        self.update_confidence_scores(pattern, is_malicious).await?;

        // Trigger retraining if we have enough new data
        if self.should_retrain().await? {
            self.retrain_patterns().await?;
        }

        Ok(())
    }

    pub async fn update_patterns(&self, new_config: SecurityConfig) -> Result<()> {
        let compiled_patterns = Self::compile_patterns(&new_config)?;
        
        {
            let mut security_config = self.security_config.write().await;
            *security_config = new_config;
        }
        
        {
            let mut patterns = self.compiled_patterns.write().await;
            *patterns = compiled_patterns;
        }

        Ok(())
    }

    async fn calculate_confidence(&self, pattern: &str, context: &str) -> f64 {
        let stats = self.pattern_stats.read().await;
        
        if let Some(pattern_stats) = stats.get(pattern) {
            let historical_accuracy = if pattern_stats.total_matches > 0 {
                pattern_stats.true_positives as f64 / pattern_stats.total_matches as f64
            } else {
                0.5 // Default confidence for new patterns
            };

            // Context-based adjustments
            let context_multiplier = match context {
                ctx if ctx.contains("test") || ctx.contains("example") => 0.3,
                ctx if ctx.contains("production") || ctx.contains("main") => 1.2,
                ctx if ctx.contains("config") || ctx.contains("secret") => 1.5,
                _ => 1.0,
            };

            // Pattern-specific adjustments
            let pattern_multiplier = match pattern {
                p if p.contains("SELECT") || p.contains("DROP") => 1.3, // SQL injection patterns
                p if p.contains("<script>") => 1.4, // XSS patterns
                p if p.contains("../") || p.contains("./") => 1.2, // Path traversal
                p if p.contains("admin") || p.contains("root") => 0.8, // Common but often legitimate
                _ => 1.0,
            };

            (historical_accuracy * context_multiplier * pattern_multiplier).min(1.0)
        } else {
            // New pattern, calculate initial confidence
            self.calculate_initial_confidence(pattern, context).await
        }
    }

    async fn calculate_rule_confidence(&self, rule: &SecurityRule, context: &str) -> f64 {
        let base_confidence = self.calculate_confidence(&rule.pattern, context).await;
        
        // Adjust based on rule severity
        let severity_multiplier = match rule.severity.as_str() {
            "high" => 1.2,
            "medium" => 1.0,
            "low" => 0.8,
            _ => 1.0,
        };

        (base_confidence * severity_multiplier).min(1.0)
    }

    async fn calculate_initial_confidence(&self, pattern: &str, context: &str) -> f64 {
        // Simple heuristic-based initial confidence calculation
        let mut confidence = 0.5; // Base confidence

        // Pattern complexity bonus
        if pattern.len() > 10 {
            confidence += 0.1;
        }

        // Special character patterns (likely regex) get higher confidence
        if pattern.contains(['*', '+', '?', '^', '$', '\\', '|']) {
            confidence += 0.2;
        }

        // Security-related keywords boost confidence
        let security_keywords = ["password", "token", "secret", "key", "admin", "root"];
        if security_keywords.iter().any(|&keyword| pattern.to_lowercase().contains(keyword)) {
            confidence += 0.15;
        }

        // Context adjustments
        if context.contains("security") || context.contains("auth") {
            confidence += 0.1;
        }

        confidence.min(1.0)
    }

    async fn determine_severity(&self, pattern: &str, config: &SecurityConfig) -> String {
        // Check if pattern has an explicit severity weight
        for (severity, _weight) in &config.severity_weights {
            if pattern.to_lowercase().contains(&severity.to_lowercase()) {
                return severity.clone();
            }
        }

        // Determine severity based on pattern characteristics
        match pattern {
            p if p.contains("DROP") || p.contains("DELETE") || p.contains("<script>") => "high".to_string(),
            p if p.contains("SELECT") || p.contains("INSERT") || p.contains("UPDATE") => "medium".to_string(),
            p if p.contains("admin") || p.contains("root") || p.contains("password") => "medium".to_string(),
            p if p.contains("../") || p.contains("./") => "medium".to_string(),
            p if p.contains("test") || p.contains("debug") => "low".to_string(),
            _ => "medium".to_string(),
        }
    }

    async fn update_pattern_stats(&self, matches: &[PatternMatch]) -> Result<()> {
        let mut stats = self.pattern_stats.write().await;
        
        for pattern_match in matches {
            let entry = stats.entry(pattern_match.pattern.clone()).or_insert(PatternStats {
                total_matches: 0,
                false_positives: 0,
                true_positives: 0,
                confidence_score: pattern_match.confidence,
                last_updated: chrono::Utc::now(),
            });

            entry.total_matches += 1;
            entry.last_updated = chrono::Utc::now();
            
            // Update confidence score using exponential moving average
            entry.confidence_score = entry.confidence_score * 0.9 + pattern_match.confidence * 0.1;
        }

        Ok(())
    }

    async fn update_confidence_scores(&self, pattern: &str, is_malicious: bool) -> Result<()> {
        let mut stats = self.pattern_stats.write().await;
        
        if let Some(pattern_stats) = stats.get_mut(pattern) {
            if is_malicious {
                pattern_stats.true_positives += 1;
            } else {
                pattern_stats.false_positives += 1;
            }
            
            // Recalculate confidence based on updated statistics
            pattern_stats.confidence_score = if pattern_stats.total_matches > 0 {
                pattern_stats.true_positives as f64 / pattern_stats.total_matches as f64
            } else {
                0.5
            };
            
            pattern_stats.last_updated = chrono::Utc::now();
        }

        Ok(())
    }

    async fn should_retrain(&self) -> Result<bool> {
        let learning_data = self.learning_data.read().await;
        
        // Retrain if we have at least 50 new feedback entries
        // or if the last retraining was more than 7 days ago
        let feedback_threshold = 50;
        let time_threshold = chrono::Duration::days(7);
        
        if learning_data.len() >= feedback_threshold {
            return Ok(true);
        }

        if let Some(latest_feedback) = learning_data.iter().max_by_key(|d| d.feedback_timestamp) {
            if chrono::Utc::now() - latest_feedback.feedback_timestamp > time_threshold {
                return Ok(true);
            }
        }

        Ok(false)
    }

    async fn retrain_patterns(&self) -> Result<()> {
        let learning_data = self.learning_data.read().await;
        let mut new_patterns = Vec::new();
        
        // Analyze feedback to identify new patterns
        let mut pattern_feedback: HashMap<String, (u32, u32)> = HashMap::new(); // (true_pos, false_pos)
        
        for data in learning_data.iter() {
            let entry = pattern_feedback.entry(data.pattern.clone()).or_insert((0, 0));
            if data.is_malicious {
                entry.0 += 1; // true positive
            } else {
                entry.1 += 1; // false positive
            }
        }

        // Generate new patterns based on successful patterns
        for (pattern, (true_pos, false_pos)) in pattern_feedback {
            let accuracy = true_pos as f64 / (true_pos + false_pos) as f64;
            
            if accuracy > 0.8 && true_pos >= 5 {
                // This pattern is performing well, consider adding variations
                new_patterns.extend(self.generate_pattern_variations(&pattern));
            }
        }

        // Update security config with new patterns
        {
            let mut config = self.security_config.write().await;
            config.suspicious_patterns.extend(new_patterns.clone());
            config.suspicious_patterns.sort();
            config.suspicious_patterns.dedup();
        }

        // Recompile patterns
        let security_config = self.security_config.read().await;
        let compiled_patterns = Self::compile_patterns(&security_config)?;
        
        {
            let mut patterns = self.compiled_patterns.write().await;
            *patterns = compiled_patterns;
        }

        // Clear processed learning data (keep last 1000 entries for future reference)
        {
            let mut learning_data_guard = self.learning_data.write().await;
            if learning_data_guard.len() > 1000 {
                learning_data_guard.drain(0..learning_data_guard.len() - 1000);
            }
        }

        tracing::info!("Retrained ML patterns, added {} new patterns", new_patterns.len());
        Ok(())
    }

    fn generate_pattern_variations(&self, pattern: &str) -> Vec<String> {
        let mut variations = Vec::new();
        
        // Generate case variations
        variations.push(pattern.to_lowercase());
        variations.push(pattern.to_uppercase());
        
        // Generate simple regex variations for exact patterns
        if !pattern.contains(['*', '+', '?', '^', '$', '\\', '|']) {
            variations.push(format!("(?i){}", regex::escape(pattern))); // Case insensitive
            variations.push(format!(r"\b{}\b", regex::escape(pattern))); // Word boundaries
        }

        // Remove duplicates and original pattern
        variations.retain(|v| v != pattern);
        variations.sort();
        variations.dedup();
        
        variations
    }

    fn compile_patterns(security_config: &SecurityConfig) -> Result<HashMap<String, regex::Regex>> {
        let mut compiled = HashMap::new();
        
        // Compile custom rules first
        for rule in &security_config.custom_rules {
            if rule.enabled {
                match regex::Regex::new(&rule.pattern) {
                    Ok(regex) => {
                        compiled.insert(rule.pattern.clone(), regex);
                    },
                    Err(e) => {
                        tracing::warn!("Failed to compile regex pattern '{}': {}", rule.pattern, e);
                    }
                }
            }
        }

        // Try to compile suspicious patterns as regex, fallback to string matching
        for pattern in &security_config.suspicious_patterns {
            // Only compile patterns that look like regex
            if pattern.contains(['*', '+', '?', '^', '$', '\\', '|', '(', ')', '[', ']', '{', '}']) {
                match regex::Regex::new(pattern) {
                    Ok(regex) => {
                        compiled.insert(pattern.clone(), regex);
                    },
                    Err(e) => {
                        tracing::debug!("Pattern '{}' is not a valid regex, using string matching: {}", pattern, e);
                    }
                }
            }
        }

        Ok(compiled)
    }

    pub async fn get_pattern_stats(&self) -> HashMap<String, PatternStats> {
        self.pattern_stats.read().await.clone()
    }

    pub async fn export_learning_data(&self) -> Vec<LearningData> {
        self.learning_data.read().await.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::SecurityConfig;

    #[tokio::test]
    async fn test_pattern_analysis() -> Result<()> {
        let security_config = SecurityConfig::default();
        let engine = MLPatternEngine::new(security_config)?;
        
        let test_content = "SELECT * FROM users WHERE password = 'admin123'";
        let matches = engine.analyze_content(test_content, "database_query").await?;
        
        assert!(!matches.is_empty());
        assert!(matches.iter().any(|m| m.pattern.contains("SELECT")));
        assert!(matches.iter().any(|m| m.pattern.contains("password")));
        
        Ok(())
    }

    #[tokio::test]
    async fn test_feedback_learning() -> Result<()> {
        let security_config = SecurityConfig::default();
        let engine = MLPatternEngine::new(security_config)?;
        
        // Add positive feedback
        engine.add_feedback("admin", true, "user_input", Some("test_user".to_string())).await?;
        
        // Add negative feedback
        engine.add_feedback("test", false, "unit_test", Some("test_user".to_string())).await?;
        
        let learning_data = engine.export_learning_data().await;
        assert_eq!(learning_data.len(), 2);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_confidence_calculation() -> Result<()> {
        let security_config = SecurityConfig::default();
        let engine = MLPatternEngine::new(security_config)?;
        
        let confidence = engine.calculate_confidence("SELECT", "production_database").await;
        assert!(confidence > 0.0 && confidence <= 1.0);
        
        Ok(())
    }
}