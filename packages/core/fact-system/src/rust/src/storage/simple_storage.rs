//! Simple file-based FACT storage
//!
//! Uses global ~/.claude-zen/facts/ directory for shared facts across projects
//! Facts are public information so global storage makes sense

use super::{FactStorage, FactKey, FactData, StorageStats, StorageConfig};
use anyhow::{Result, Context};
use std::path::PathBuf;
use std::collections::HashMap;
use std::time::SystemTime;
use tokio::fs;

/// Simple file-based FACT storage implementation
pub struct SimpleFactStorage {
  /// Global facts directory (~/.claude-zen/facts/)
  facts_dir: PathBuf,
}

impl SimpleFactStorage {
  pub async fn new(config: StorageConfig) -> Result<Self> {
    let facts_dir = PathBuf::from(&config.global_facts_dir);
    
    // Ensure the facts directory exists
    fs::create_dir_all(&facts_dir)
      .await
      .with_context(|| format!("Failed to create facts directory: {:?}", facts_dir))?;
    
    log::info!("Initialized global facts storage at: {:?}", facts_dir);
    
    Ok(Self { facts_dir })
  }

  /// Get file path for a fact key
  fn get_fact_file_path(&self, key: &FactKey) -> PathBuf {
    // Store facts as: ~/.claude-zen/facts/ecosystem/tool/version.bin
    self.facts_dir
      .join(&key.ecosystem)
      .join(&key.tool)
      .join(format!("{}.bin", key.version))
  }

  /// Get directory path for tool versions
  #[allow(dead_code)]
  fn get_tool_dir_path(&self, ecosystem: &str, tool: &str) -> PathBuf {
    self.facts_dir.join(ecosystem).join(tool)
  }

  /// Get directory path for ecosystem
  fn get_ecosystem_dir_path(&self, ecosystem: &str) -> PathBuf {
    self.facts_dir.join(ecosystem)
  }
}

#[async_trait::async_trait]
impl FactStorage for SimpleFactStorage {
  async fn store_fact(&self, key: &FactKey, data: &FactData) -> Result<()> {
    let file_path = self.get_fact_file_path(key);
    
    // Ensure parent directory exists
    if let Some(parent) = file_path.parent() {
      fs::create_dir_all(parent).await
        .with_context(|| format!("Failed to create directory: {:?}", parent))?;
    }

    // Serialize fact data using bincode for efficiency
    let serialized = bincode::serialize(data)
      .context("Failed to serialize fact data")?;

    // Write to file
    fs::write(&file_path, serialized).await
      .with_context(|| format!("Failed to write fact file: {:?}", file_path))?;

    log::debug!("Stored fact: {} at {:?}", key.storage_key(), file_path);
    Ok(())
  }

  async fn get_fact(&self, key: &FactKey) -> Result<Option<FactData>> {
    let file_path = self.get_fact_file_path(key);
    
    // Check if file exists
    if !file_path.exists() {
      return Ok(None);
    }

    // Read and deserialize
    let data = fs::read(&file_path).await
      .with_context(|| format!("Failed to read fact file: {:?}", file_path))?;

    let fact_data = bincode::deserialize(&data)
      .context("Failed to deserialize fact data")?;

    log::debug!("Retrieved fact: {} from {:?}", key.storage_key(), file_path);
    Ok(Some(fact_data))
  }

  async fn exists(&self, key: &FactKey) -> Result<bool> {
    let file_path = self.get_fact_file_path(key);
    Ok(file_path.exists())
  }

  async fn delete_fact(&self, key: &FactKey) -> Result<()> {
    let file_path = self.get_fact_file_path(key);
    
    if file_path.exists() {
      fs::remove_file(&file_path).await
        .with_context(|| format!("Failed to delete fact file: {:?}", file_path))?;
      
      log::debug!("Deleted fact: {} at {:?}", key.storage_key(), file_path);
    }

    Ok(())
  }

  async fn list_tools(&self, ecosystem: &str) -> Result<Vec<FactKey>> {
    let ecosystem_dir = self.get_ecosystem_dir_path(ecosystem);
    let mut tools = Vec::new();

    if !ecosystem_dir.exists() {
      return Ok(tools);
    }

    let mut entries = fs::read_dir(&ecosystem_dir).await
      .with_context(|| format!("Failed to read ecosystem directory: {:?}", ecosystem_dir))?;

    while let Some(entry) = entries.next_entry().await? {
      let path = entry.path();
      if path.is_dir() {
        let tool_name = path.file_name()
          .and_then(|n| n.to_str())
          .unwrap_or("")
          .to_string();

        // Get all versions for this tool
        if let Ok(mut version_entries) = fs::read_dir(&path).await {
          while let Some(version_entry) = version_entries.next_entry().await? {
            let version_path = version_entry.path();
            if let Some(file_name) = version_path.file_name().and_then(|n| n.to_str()) {
              if file_name.ends_with(".bin") {
                let version = file_name.strip_suffix(".bin").unwrap_or("").to_string();
                tools.push(FactKey::new(tool_name.clone(), version, ecosystem.to_string()));
              }
            }
          }
        }
      }
    }

    Ok(tools)
  }

  async fn search_tools(&self, prefix: &str) -> Result<Vec<FactKey>> {
    let mut matching_tools = Vec::new();

    // Search through all ecosystems
    if !self.facts_dir.exists() {
      return Ok(matching_tools);
    }

    let mut ecosystem_entries = fs::read_dir(&self.facts_dir).await?;

    while let Some(ecosystem_entry) = ecosystem_entries.next_entry().await? {
      let ecosystem_path = ecosystem_entry.path();
      if ecosystem_path.is_dir() {
        let ecosystem_name = ecosystem_path.file_name()
          .and_then(|n| n.to_str())
          .unwrap_or("")
          .to_string();

        let tools = self.list_tools(&ecosystem_name).await?;
        for tool in tools {
          if tool.tool.starts_with(prefix) {
            matching_tools.push(tool);
          }
        }
      }
    }

    Ok(matching_tools)
  }

  async fn stats(&self) -> Result<StorageStats> {
    let mut total_entries = 0u64;
    let mut total_size_bytes = 0u64;
    let mut ecosystems = HashMap::new();

    if !self.facts_dir.exists() {
      return Ok(StorageStats {
        total_entries: 0,
        total_size_bytes: 0,
        ecosystems,
        last_compaction: None,
      });
    }

    let mut ecosystem_entries = fs::read_dir(&self.facts_dir).await?;

    while let Some(ecosystem_entry) = ecosystem_entries.next_entry().await? {
      let ecosystem_path = ecosystem_entry.path();
      if ecosystem_path.is_dir() {
        let ecosystem_name = ecosystem_path.file_name()
          .and_then(|n| n.to_str())
          .unwrap_or("")
          .to_string();

        let tools = self.list_tools(&ecosystem_name).await?;
        let ecosystem_count = tools.len() as u64;
        
        ecosystems.insert(ecosystem_name, ecosystem_count);
        total_entries += ecosystem_count;

        // Calculate size for this ecosystem
        for tool in tools {
          let file_path = self.get_fact_file_path(&tool);
          if let Ok(metadata) = file_path.metadata() {
            total_size_bytes += metadata.len();
          }
        }
      }
    }

    Ok(StorageStats {
      total_entries,
      total_size_bytes,
      ecosystems,
      last_compaction: Some(SystemTime::now()),
    })
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::tempdir;

  #[tokio::test]
  async fn test_simple_storage() {
    let temp_dir = tempdir().unwrap();
    let config = StorageConfig {
      global_facts_dir: temp_dir.path().to_string_lossy().to_string(),
    };

    let storage = SimpleFactStorage::new(config).await.unwrap();
    
    let key = FactKey::new(
      "phoenix".to_string(),
      "1.7.0".to_string(), 
      "beam".to_string(),
    );

    let fact_data = FactData {
      tool: "phoenix".to_string(),
      version: "1.7.0".to_string(),
      ecosystem: "beam".to_string(),
      documentation: "Phoenix web framework".to_string(),
      snippets: vec![],
      examples: vec![],
      best_practices: vec![],
      troubleshooting: vec![],
      github_sources: vec![],
      dependencies: vec![],
      tags: vec!["web".to_string(), "framework".to_string()],
      last_updated: SystemTime::now(),
      source: "test".to_string(),
    };

    // Test store and retrieve
    storage.store_fact(&key, &fact_data).await.unwrap();
    assert!(storage.exists(&key).await.unwrap());
    
    let retrieved = storage.get_fact(&key).await.unwrap().unwrap();
    assert_eq!(retrieved.tool, "phoenix");
    assert_eq!(retrieved.version, "1.7.0");
    
    // Test list tools
    let tools = storage.list_tools("beam").await.unwrap();
    assert_eq!(tools.len(), 1);
    assert_eq!(tools[0].tool, "phoenix");
    
    // Test stats
    let stats = storage.stats().await.unwrap();
    assert_eq!(stats.total_entries, 1);
    assert_eq!(stats.ecosystems.get("beam"), Some(&1));
  }
}