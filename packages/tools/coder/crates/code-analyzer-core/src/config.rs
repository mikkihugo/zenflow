use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use notify::{Watcher, RecursiveMode, Event, EventKind};
use std::sync::mpsc;
use std::time::Duration;
use anyhow::{Result, Context};
use crate::types::{DeliverableType, QualityGateType};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub suspicious_patterns: Vec<String>,
    pub severity_weights: HashMap<String, f64>,
    pub whitelist_patterns: Vec<String>,
    pub custom_rules: Vec<SecurityRule>,
    pub ml_enabled: bool,
    pub confidence_threshold: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityRule {
    pub name: String,
    pub pattern: String,
    pub severity: String,
    pub description: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UrlValidationConfig {
    pub allowed_schemes: Vec<String>,
    pub blocked_domains: Vec<String>,
    pub max_url_length: usize,
    pub require_tls: bool,
    pub custom_validators: Vec<UrlValidator>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UrlValidator {
    pub name: String,
    pub regex: String,
    pub allow: bool,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityConfig {
    pub thresholds: HashMap<String, QualityThreshold>,
    pub deliverable_configs: HashMap<DeliverableType, DeliverableConfig>,
    pub quality_gate_configs: HashMap<QualityGateType, QualityGateConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityThreshold {
    pub min_score: f64,
    pub max_score: f64,
    pub weight: f64,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverableConfig {
    pub required_quality_gates: Vec<QualityGateType>,
    pub custom_validations: Vec<String>,
    pub timeout_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityGateConfig {
    pub criteria: Vec<QualityCriterion>,
    pub auto_approve: bool,
    pub required_reviewers: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityCriterion {
    pub name: String,
    pub threshold: f64,
    pub weight: f64,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparcConfig {
    pub phase_definitions: HashMap<String, PhaseDefinition>,
    pub transition_rules: Vec<TransitionRule>,
    pub quality_requirements: HashMap<String, Vec<String>>,
    pub automation_settings: AutomationSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhaseDefinition {
    pub name: String,
    pub description: String,
    pub required_deliverables: Vec<DeliverableType>,
    pub entry_criteria: Vec<String>,
    pub exit_criteria: Vec<String>,
    pub estimated_duration_hours: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransitionRule {
    pub from_phase: String,
    pub to_phase: String,
    pub required_conditions: Vec<String>,
    pub auto_transition: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationSettings {
    pub auto_validate: bool,
    pub parallel_execution: bool,
    pub max_concurrent_phases: usize,
    pub retry_failed_gates: bool,
    pub notification_channels: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalyzerConfig {
    pub security: SecurityConfig,
    pub url_validation: UrlValidationConfig,
    pub quality: QualityConfig,
    pub sparc: SparcConfig,
    pub version: String,
    pub last_updated: String,
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            suspicious_patterns: vec![
                "admin".to_string(),
                "root".to_string(),
                "system".to_string(),
                "config".to_string(),
                "secret".to_string(),
                "password".to_string(),
                "token".to_string(),
                "api_key".to_string(),
                "private".to_string(),
                "internal".to_string(),
                "test".to_string(),
                "debug".to_string(),
                "../".to_string(),
                "./".to_string(),
                "<script>".to_string(),
                "SELECT ".to_string(),
                "DROP ".to_string(),
                "DELETE ".to_string(),
                "INSERT ".to_string(),
                "UPDATE ".to_string(),
            ],
            severity_weights: HashMap::from([
                ("high".to_string(), 1.0),
                ("medium".to_string(), 0.7),
                ("low".to_string(), 0.3),
            ]),
            whitelist_patterns: vec![],
            custom_rules: vec![],
            ml_enabled: true,
            confidence_threshold: 0.8,
        }
    }
}

impl Default for UrlValidationConfig {
    fn default() -> Self {
        Self {
            allowed_schemes: vec!["https".to_string(), "http".to_string()],
            blocked_domains: vec![],
            max_url_length: 2048,
            require_tls: false,
            custom_validators: vec![],
        }
    }
}

impl Default for QualityConfig {
    fn default() -> Self {
        Self {
            thresholds: HashMap::new(),
            deliverable_configs: HashMap::new(),
            quality_gate_configs: HashMap::new(),
        }
    }
}

impl Default for SparcConfig {
    fn default() -> Self {
        Self {
            phase_definitions: HashMap::new(),
            transition_rules: vec![],
            quality_requirements: HashMap::new(),
            automation_settings: AutomationSettings {
                auto_validate: true,
                parallel_execution: false,
                max_concurrent_phases: 2,
                retry_failed_gates: true,
                notification_channels: vec![],
            },
        }
    }
}

pub struct ConfigManager {
    config: Arc<RwLock<AnalyzerConfig>>,
    config_path: PathBuf,
    _watcher: Option<notify::RecommendedWatcher>,
}

impl ConfigManager {
    pub async fn new(config_dir: &Path) -> Result<Self> {
        let config_path = config_dir.join("analyzer_config.yaml");
        
        let config = if config_path.exists() {
            Self::load_config(&config_path).await?
        } else {
            let default_config = Self::create_default_config();
            Self::save_config(&config_path, &default_config).await?;
            default_config
        };

        let config = Arc::new(RwLock::new(config));
        
        // Note: File watching disabled for now due to API complexity
        // Can be re-enabled when needed with proper async handling
        
        Ok(Self {
            config,
            config_path,
            _watcher: None,
        })
    }

    async fn load_config(path: &Path) -> Result<AnalyzerConfig> {
        let content = tokio::fs::read_to_string(path).await
            .with_context(|| format!("Failed to read config file: {:?}", path))?;
        
        let config: AnalyzerConfig = serde_yaml::from_str(&content)
            .with_context(|| format!("Failed to parse config file: {:?}", path))?;
        
        Ok(config)
    }

    async fn save_config(path: &Path, config: &AnalyzerConfig) -> Result<()> {
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let content = serde_yaml::to_string(config)
            .context("Failed to serialize config")?;
        
        tokio::fs::write(path, content).await
            .with_context(|| format!("Failed to write config file: {:?}", path))?;
        
        Ok(())
    }

    fn create_default_config() -> AnalyzerConfig {
        AnalyzerConfig {
            security: SecurityConfig::default(),
            url_validation: UrlValidationConfig::default(),
            quality: QualityConfig::default(),
            sparc: SparcConfig::default(),
            version: "1.0.0".to_string(),
            last_updated: chrono::Utc::now().to_rfc3339(),
        }
    }

    pub async fn get_security_config(&self) -> SecurityConfig {
        self.config.read().await.security.clone()
    }

    pub async fn get_url_validation_config(&self) -> UrlValidationConfig {
        self.config.read().await.url_validation.clone()
    }

    pub async fn get_quality_config(&self) -> QualityConfig {
        self.config.read().await.quality.clone()
    }

    pub async fn get_sparc_config(&self) -> SparcConfig {
        self.config.read().await.sparc.clone()
    }

    pub async fn update_security_config(&self, security_config: SecurityConfig) -> Result<()> {
        {
            let mut config = self.config.write().await;
            config.security = security_config;
            config.last_updated = chrono::Utc::now().to_rfc3339();
        }
        
        let config = self.config.read().await.clone();
        Self::save_config(&self.config_path, &config).await
    }

    pub async fn reload(&self) -> Result<()> {
        let new_config = Self::load_config(&self.config_path).await?;
        let mut config = self.config.write().await;
        *config = new_config;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_config_creation_and_loading() -> Result<()> {
        let temp_dir = TempDir::new()?;
        let config_manager = ConfigManager::new(temp_dir.path()).await?;
        
        let security_config = config_manager.get_security_config().await;
        assert!(!security_config.suspicious_patterns.is_empty());
        assert!(security_config.ml_enabled);
        
        Ok(())
    }

    #[tokio::test]
    async fn test_config_update() -> Result<()> {
        let temp_dir = TempDir::new()?;
        let config_manager = ConfigManager::new(temp_dir.path()).await?;
        
        let mut security_config = config_manager.get_security_config().await;
        security_config.ml_enabled = false;
        security_config.confidence_threshold = 0.5;
        
        config_manager.update_security_config(security_config.clone()).await?;
        
        let updated_config = config_manager.get_security_config().await;
        assert!(!updated_config.ml_enabled);
        assert_eq!(updated_config.confidence_threshold, 0.5);
        
        Ok(())
    }
}