//! FACT Storage Abstraction Layer
//!
//! Provides a unified interface for different storage backends:
//! - Sled: Pure Rust embedded database (current)
//! - Mnesia: Erlang/Elixir integration via Rustler (future)

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

pub mod sled_storage;

#[cfg(feature = "mnesia")]
pub mod mnesia_storage;

/// FACT storage abstraction trait
#[async_trait::async_trait]
pub trait FactStorage: Send + Sync {
  /// Store FACT data for a tool
  async fn store_fact(&self, key: &FactKey, data: &FactData) -> Result<()>;

  /// Retrieve FACT data for a tool
  async fn get_fact(&self, key: &FactKey) -> Result<Option<FactData>>;

  /// Check if FACT data exists for a tool
  async fn exists(&self, key: &FactKey) -> Result<bool>;

  /// Delete FACT data for a tool
  async fn delete_fact(&self, key: &FactKey) -> Result<()>;

  /// List all tools in an ecosystem
  async fn list_tools(&self, ecosystem: &str) -> Result<Vec<FactKey>>;

  /// Search tools by prefix
  async fn search_tools(&self, prefix: &str) -> Result<Vec<FactKey>>;

  /// Get storage statistics
  async fn stats(&self) -> Result<StorageStats>;

  /// Compact/optimize storage
  async fn compact(&self) -> Result<()>;

  /// Close storage connection
  async fn close(&self) -> Result<()>;
}

/// FACT storage key structure
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct FactKey {
  pub tool: String,
  pub version: String,
  pub ecosystem: String,
}

impl FactKey {
  pub fn new(tool: String, version: String, ecosystem: String) -> Self {
    Self { tool, version, ecosystem }
  }

  /// Generate storage key string
  pub fn storage_key(&self) -> String {
    format!("fact:{}:{}:{}", self.ecosystem, self.tool, self.version)
  }

  /// Parse storage key string back to FactKey
  pub fn from_storage_key(key: &str) -> Result<Self> {
    let parts: Vec<&str> = key.split(':').collect();
    if parts.len() != 4 || parts[0] != "fact" {
      anyhow::bail!("Invalid storage key format: {}", key);
    }

    Ok(Self {
      ecosystem: parts[1].to_string(),
      tool: parts[2].to_string(),
      version: parts[3].to_string(),
    })
  }
}

/// FACT data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactData {
  pub tool: String,
  pub version: String,
  pub ecosystem: String,
  pub documentation: String,
  pub snippets: Vec<FactSnippet>,
  pub examples: Vec<FactExample>,
  pub best_practices: Vec<FactBestPractice>,
  pub troubleshooting: Vec<FactTroubleshooting>,
  pub github_sources: Vec<FactGitHubSource>,
  pub dependencies: Vec<String>,
  pub tags: Vec<String>,
  pub last_updated: SystemTime,
  pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactSnippet {
  pub title: String,
  pub code: String,
  pub language: String,
  pub description: String,
  pub file_path: String,
  pub line_number: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactExample {
  pub title: String,
  pub code: String,
  pub explanation: String,
  pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactBestPractice {
  pub practice: String,
  pub rationale: String,
  pub example: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactTroubleshooting {
  pub issue: String,
  pub solution: String,
  pub references: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactGitHubSource {
  pub repo: String,
  pub stars: u32,
  pub last_update: String,
}

/// Storage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageStats {
  pub total_entries: u64,
  pub total_size_bytes: u64,
  pub ecosystems: std::collections::HashMap<String, u64>,
  pub last_compaction: Option<SystemTime>,
}

/// Storage configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageConfig {
  pub backend: StorageBackend,
  pub path: Option<String>,
  pub compression: bool,
  pub cache_size_mb: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StorageBackend {
  Sled,
  #[cfg(feature = "mnesia")]
  Mnesia,
}

impl Default for StorageConfig {
  fn default() -> Self {
    Self {
      backend: StorageBackend::Sled,
      path: None, // Use default path
      compression: true,
      cache_size_mb: 100,
    }
  }
}

/// Create storage instance based on configuration
pub async fn create_storage(
  config: StorageConfig,
) -> Result<Box<dyn FactStorage>> {
  match config.backend {
    StorageBackend::Sled => {
      let storage = sled_storage::SledStorage::new(config).await?;
      Ok(Box::new(storage))
    }
    #[cfg(feature = "mnesia")]
    StorageBackend::Mnesia => {
      let storage = mnesia_storage::MnesiaStorage::new(config).await?;
      Ok(Box::new(storage))
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_fact_key_storage() {
    let key = FactKey::new(
      "phoenix".to_string(),
      "1.7.0".to_string(),
      "beam".to_string(),
    );
    let storage_key = key.storage_key();
    assert_eq!(storage_key, "fact:beam:phoenix:1.7.0");

    let parsed_key = FactKey::from_storage_key(&storage_key).unwrap();
    assert_eq!(parsed_key, key);
  }

  #[test]
  fn test_invalid_storage_key() {
    assert!(FactKey::from_storage_key("invalid:key").is_err());
    assert!(FactKey::from_storage_key("fact:beam:phoenix").is_err()); // Missing version
  }
}
