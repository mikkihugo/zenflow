//! Interactive onboarding and setup for zen-swarm CLI
//!
//! Provides guided initialization, configuration setup, and user-friendly
//! introduction to zen-swarm capabilities.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{self, Write};
use crate::config::Config;
use crate::output::{OutputHandler, StatusLevel};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnboardingConfig {
    pub user_name: Option<String>,
    pub project_name: Option<String>,
    pub default_topology: String,
    pub max_agents: usize,
    pub enable_monitoring: bool,
    pub enable_persistence: bool,
    pub preferred_backends: Vec<String>,
}

impl Default for OnboardingConfig {
    fn default() -> Self {
        Self {
            user_name: None,
            project_name: None,
            default_topology: "mesh".to_string(),
            max_agents: 10,
            enable_monitoring: true,
            enable_persistence: false,
            preferred_backends: vec!["memory".to_string()],
        }
    }
}

#[derive(thiserror::Error, Debug)]
pub enum OnboardingError {
    #[error("User input error: {0}")]
    InputError(String),
    
    #[error("Configuration validation failed: {0}")]
    ValidationError(String),
    
    #[error("Setup failed: {0}")]
    SetupError(String),
}

/// Interactive onboarding flow for new users
pub struct OnboardingWizard<'a> {
    output: &'a OutputHandler,
    config: OnboardingConfig,
}

impl<'a> OnboardingWizard<'a> {
    pub fn new(output: &'a OutputHandler) -> Self {
        Self {
            output,
            config: OnboardingConfig::default(),
        }
    }
    
    /// Run the complete onboarding flow
    pub fn run_onboarding(&mut self) -> Result<OnboardingConfig> {
        self.output.section("Welcome to Zen Swarm! 🐝");
        self.output.info("Let's set up your distributed neural computing environment.\n");
        
        // Step 1: Basic user information
        self.collect_user_info()?;
        
        // Step 2: Project configuration
        self.configure_project()?;
        
        // Step 3: Swarm topology selection
        self.select_topology()?;
        
        // Step 4: Backend preferences
        self.configure_backends()?;
        
        // Step 5: Advanced features
        self.configure_advanced_features()?;
        
        // Step 6: Summary and confirmation
        self.show_summary()?;
        
        Ok(self.config.clone())
    }
    
    fn collect_user_info(&mut self) -> Result<()> {
        self.output.section("User Information");
        
        if let Ok(name) = self.prompt_user("Enter your name (optional): ") {
            if !name.trim().is_empty() {
                self.config.user_name = Some(name.trim().to_string());
            }
        }
        
        Ok(())
    }
    
    fn configure_project(&mut self) -> Result<()> {
        self.output.section("Project Configuration");
        
        let project_name = self.prompt_user("Project name (default: my-zen-swarm): ")?;
        self.config.project_name = if project_name.trim().is_empty() {
            Some("my-zen-swarm".to_string())
        } else {
            Some(project_name.trim().to_string())
        };
        
        Ok(())
    }
    
    fn select_topology(&mut self) -> Result<()> {
        self.output.section("Swarm Topology Selection");
        
        self.output.info("Available topologies:");
        self.output.list(&[
            "1. mesh - Fully connected (best for small teams)",
            "2. hierarchical - Tree structure (scalable)",
            "3. ring - Circular connection (reliable)",
            "4. star - Central coordination (simple)"
        ], false);
        
        let choice = self.prompt_user("Select topology (1-4, default: 1): ")?;
        
        self.config.default_topology = match choice.trim() {
            "2" => "hierarchical".to_string(),
            "3" => "ring".to_string(), 
            "4" => "star".to_string(),
            _ => "mesh".to_string(),
        };
        
        self.output.success(&format!("Selected topology: {}", self.config.default_topology));
        
        Ok(())
    }
    
    fn configure_backends(&mut self) -> Result<()> {
        self.output.section("Backend Configuration");
        
        self.output.info("Available backends:");
        self.output.list(&[
            "1. memory - In-memory (fast, temporary)",
            "2. sqlite - SQLite database (persistent, local)",
            "3. postgres - PostgreSQL (persistent, distributed)",
            "4. redis - Redis cache (fast, shared)"
        ], false);
        
        let choice = self.prompt_user("Select backend (1-4, default: 1): ")?;
        
        let backend = match choice.trim() {
            "2" => "sqlite",
            "3" => "postgres", 
            "4" => "redis",
            _ => "memory",
        };
        
        self.config.preferred_backends = vec![backend.to_string()];
        
        if backend != "memory" {
            self.config.enable_persistence = true;
        }
        
        self.output.success(&format!("Selected backend: {}", backend));
        
        Ok(())
    }
    
    fn configure_advanced_features(&mut self) -> Result<()> {
        self.output.section("Advanced Features");
        
        // Max agents configuration
        let max_agents = self.prompt_user("Maximum agents (default: 10): ")?;
        if let Ok(num) = max_agents.trim().parse::<usize>() {
            if num > 0 && num <= 1000 {
                self.config.max_agents = num;
            }
        }
        
        // Monitoring
        let monitoring = self.prompt_user("Enable monitoring? (Y/n): ")?;
        self.config.enable_monitoring = !matches!(monitoring.trim().to_lowercase().as_str(), "n" | "no");
        
        Ok(())
    }
    
    fn show_summary(&mut self) -> Result<()> {
        self.output.section("Configuration Summary");
        
        let summary_data = vec![
            ("User".to_string(), self.config.user_name.clone().unwrap_or("Anonymous".to_string())),
            ("Project".to_string(), self.config.project_name.clone().unwrap_or("Unnamed".to_string())),
            ("Topology".to_string(), self.config.default_topology.clone()),
            ("Max Agents".to_string(), self.config.max_agents.to_string()),
            ("Backend".to_string(), self.config.preferred_backends.join(", ")),
            ("Monitoring".to_string(), if self.config.enable_monitoring { "Enabled" } else { "Disabled" }.to_string()),
            ("Persistence".to_string(), if self.config.enable_persistence { "Enabled" } else { "Disabled" }.to_string()),
        ];
        
        self.output.key_value(&summary_data);
        
        let confirm = self.prompt_user("\nProceed with this configuration? (Y/n): ")?;
        
        if matches!(confirm.trim().to_lowercase().as_str(), "n" | "no") {
            return Err(OnboardingError::SetupError("Configuration cancelled by user".to_string()).into());
        }
        
        self.output.success("Configuration confirmed! 🎉");
        
        Ok(())
    }
    
    fn prompt_user(&self, prompt: &str) -> Result<String> {
        print!("{}", prompt);
        io::stdout().flush()?;
        
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        
        Ok(input.trim_end_matches('\n').to_string())
    }
}

/// Quick setup for users who want minimal configuration
pub fn quick_setup(output: &OutputHandler) -> Result<OnboardingConfig> {
    output.section("Quick Setup");
    output.info("Setting up zen-swarm with recommended defaults...");
    
    let config = OnboardingConfig {
        user_name: None,
        project_name: Some("zen-swarm-project".to_string()),
        default_topology: "mesh".to_string(),
        max_agents: 10,
        enable_monitoring: true,
        enable_persistence: false,
        preferred_backends: vec!["memory".to_string()],
    };
    
    output.success("Quick setup complete! Use 'zen-swarm init' for custom configuration.");
    
    Ok(config)
}

/// Apply onboarding configuration to system config
pub fn apply_onboarding_config(onboarding_config: &OnboardingConfig, system_config: &mut Config) -> Result<()> {
    // Apply swarm configuration
    system_config.swarm.default_topology = onboarding_config.default_topology.clone();
    system_config.swarm.max_agents = onboarding_config.max_agents;
    
    // Apply persistence configuration
    if let Some(backend) = onboarding_config.preferred_backends.first() {
        system_config.persistence.backend = backend.clone();
        
        match backend.as_str() {
            "sqlite" => {
                system_config.persistence.connection = "zen-swarm.db".to_string();
                system_config.persistence.encryption = false;
            },
            "postgres" => {
                system_config.persistence.connection = "postgresql://localhost/zenswarm".to_string();
                system_config.persistence.encryption = true;
            },
            "redis" => {
                system_config.persistence.connection = "redis://localhost:6379".to_string();
                system_config.persistence.encryption = false;
            },
            _ => {
                system_config.persistence.connection = ":memory:".to_string();
                system_config.persistence.encryption = false;
            }
        }
    }
    
    // Apply monitoring configuration
    system_config.monitoring.enabled = onboarding_config.enable_monitoring;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::output::OutputFormat;
    
    #[test]
    fn test_default_onboarding_config() {
        let config = OnboardingConfig::default();
        assert_eq!(config.default_topology, "mesh");
        assert_eq!(config.max_agents, 10);
        assert!(config.enable_monitoring);
        assert!(!config.enable_persistence);
    }
    
    #[test]
    fn test_quick_setup() {
        let output = OutputHandler::new(OutputFormat::Plain);
        let config = quick_setup(&output).unwrap();
        
        assert!(config.project_name.is_some());
        assert_eq!(config.default_topology, "mesh");
        assert!(config.enable_monitoring);
    }
    
    #[test]
    fn test_apply_onboarding_config() {
        let onboarding_config = OnboardingConfig {
            default_topology: "hierarchical".to_string(),
            max_agents: 20,
            preferred_backends: vec!["sqlite".to_string()],
            enable_monitoring: false,
            ..Default::default()
        };
        
        let mut system_config = Config::default();
        apply_onboarding_config(&onboarding_config, &mut system_config).unwrap();
        
        assert_eq!(system_config.swarm.default_topology, "hierarchical");
        assert_eq!(system_config.swarm.max_agents, 20);
        assert_eq!(system_config.persistence.backend, "sqlite");
        assert!(!system_config.monitoring.enabled);
    }
}