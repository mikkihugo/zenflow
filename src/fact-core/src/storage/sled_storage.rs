//! Sled-based FACT storage implementation
//!
//! Fast, pure-Rust embedded database for FACT knowledge storage.

use super::{FactData, FactKey, FactStorage, StorageConfig, StorageStats};
use anyhow::{Context, Result};
use sled::Db;
use std::path::PathBuf;
use std::time::SystemTime;
use tracing::{debug, info, warn};

/// Sled storage implementation
pub struct SledStorage {
  db: Db,
  config: StorageConfig,
}

impl SledStorage {
  /// Create new Sled storage instance
  pub async fn new(config: StorageConfig) -> Result<Self> {
    let db_path = match &config.path {
      Some(path) => PathBuf::from(path),
      None => {
        // Default path in user's data directory
        let mut path = dirs::data_dir()
          .or_else(|| dirs::home_dir())
          .unwrap_or_else(|| PathBuf::from("."));
        path.push("fact-tools");
        path.push("storage");
        path
      }
    };

    info!("Opening FACT storage at: {:?}", db_path);

    let db = sled::Config::new()
            .path(&db_path)
            .compression_factor(if config.compression { 4 } else { 1 })
            .cache_capacity((config.cache_size_mb * 1024 * 1024) as u64) // Convert MB to bytes
            .open()
            .context("Failed to open Sled database")?;

    // Create indexes for efficient querying
    db.open_tree("ecosystem_index")
      .context("Failed to create ecosystem index")?;

    info!("FACT storage initialized successfully");

    Ok(Self { db, config })
  }
}

#[async_trait::async_trait]
impl FactStorage for SledStorage {
  async fn store_fact(&self, key: &FactKey, data: &FactData) -> Result<()> {
    let storage_key = key.storage_key();
    let serialized_data =
      serde_json::to_vec(data).context("Failed to serialize FACT data")?;

    // Store main data
    self
      .db
      .insert(&storage_key, serialized_data)
      .context("Failed to store FACT data")?;

    // Update ecosystem index
    let ecosystem_tree = self
      .db
      .open_tree("ecosystem_index")
      .context("Failed to open ecosystem index")?;

    let ecosystem_key = format!("{}:{}", key.ecosystem, key.tool);
    ecosystem_tree
      .insert(&ecosystem_key, key.version.as_bytes())
      .context("Failed to update ecosystem index")?;

    debug!("Stored FACT data for {}@{}", key.tool, key.version);
    Ok(())
  }

  async fn get_fact(&self, key: &FactKey) -> Result<Option<FactData>> {
    let storage_key = key.storage_key();

    match self
      .db
      .get(&storage_key)
      .context("Failed to retrieve FACT data")?
    {
      Some(data) => {
        let fact_data: FactData = serde_json::from_slice(&data)
          .context("Failed to deserialize FACT data")?;
        debug!("Retrieved FACT data for {}@{}", key.tool, key.version);
        Ok(Some(fact_data))
      }
      None => {
        debug!("No FACT data found for {}@{}", key.tool, key.version);
        Ok(None)
      }
    }
  }

  async fn exists(&self, key: &FactKey) -> Result<bool> {
    let storage_key = key.storage_key();
    Ok(
      self
        .db
        .contains_key(&storage_key)
        .context("Failed to check FACT data existence")?,
    )
  }

  async fn delete_fact(&self, key: &FactKey) -> Result<()> {
    let storage_key = key.storage_key();

    // Remove main data
    self
      .db
      .remove(&storage_key)
      .context("Failed to delete FACT data")?;

    // Remove from ecosystem index
    let ecosystem_tree = self
      .db
      .open_tree("ecosystem_index")
      .context("Failed to open ecosystem index")?;

    let ecosystem_key = format!("{}:{}", key.ecosystem, key.tool);
    ecosystem_tree
      .remove(&ecosystem_key)
      .context("Failed to update ecosystem index")?;

    info!("Deleted FACT data for {}@{}", key.tool, key.version);
    Ok(())
  }

  async fn list_tools(&self, ecosystem: &str) -> Result<Vec<FactKey>> {
    let ecosystem_tree = self
      .db
      .open_tree("ecosystem_index")
      .context("Failed to open ecosystem index")?;

    let mut tools = Vec::new();
    let prefix = format!("{}:", ecosystem);

    for result in ecosystem_tree.scan_prefix(&prefix) {
      let (key, version) = result.context("Failed to scan ecosystem index")?;
      let key_str =
        std::str::from_utf8(&key).context("Invalid UTF-8 in ecosystem key")?;
      let version_str =
        std::str::from_utf8(&version).context("Invalid UTF-8 in version")?;

      if let Some(tool_name) = key_str.strip_prefix(&prefix) {
        tools.push(FactKey::new(
          tool_name.to_string(),
          version_str.to_string(),
          ecosystem.to_string(),
        ));
      }
    }

    debug!("Found {} tools in {} ecosystem", tools.len(), ecosystem);
    Ok(tools)
  }

  async fn search_tools(&self, prefix: &str) -> Result<Vec<FactKey>> {
    let mut tools = Vec::new();
    let search_prefix = format!("fact:{}", prefix);

    for result in self.db.scan_prefix(&search_prefix) {
      let (key, _) = result.context("Failed to scan storage")?;
      let key_str =
        std::str::from_utf8(&key).context("Invalid UTF-8 in storage key")?;

      if let Ok(fact_key) = FactKey::from_storage_key(key_str) {
        tools.push(fact_key);
      }
    }

    debug!("Found {} tools matching prefix '{}'", tools.len(), prefix);
    Ok(tools)
  }

  async fn stats(&self) -> Result<StorageStats> {
    let mut total_entries = 0u64;
    let mut total_size = 0u64;
    let mut ecosystems = std::collections::HashMap::new();

    // Scan all FACT entries
    for result in self.db.scan_prefix("fact:") {
      let (key, value) = result.context("Failed to scan storage for stats")?;
      let key_str =
        std::str::from_utf8(&key).context("Invalid UTF-8 in storage key")?;

      if let Ok(fact_key) = FactKey::from_storage_key(key_str) {
        total_entries += 1;
        total_size += key.len() as u64 + value.len() as u64;

        *ecosystems.entry(fact_key.ecosystem).or_insert(0) += 1;
      }
    }

    Ok(StorageStats {
      total_entries,
      total_size_bytes: total_size,
      ecosystems,
      last_compaction: None, // Sled handles compaction automatically
    })
  }

  async fn compact(&self) -> Result<()> {
    // Sled doesn't expose manual compaction, but we can flush
    self.db.flush().context("Failed to flush database")?;
    info!("Database flushed (Sled handles compaction automatically)");
    Ok(())
  }

  async fn close(&self) -> Result<()> {
    self
      .db
      .flush()
      .context("Failed to flush database before close")?;
    info!("FACT storage closed successfully");
    Ok(())
  }
}

impl Drop for SledStorage {
  fn drop(&mut self) {
    if let Err(e) = self.db.flush() {
      warn!("Failed to flush database during drop: {}", e);
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::tempdir;

  async fn create_test_storage() -> SledStorage {
    let temp_dir = tempdir().unwrap();
    let config = StorageConfig {
      backend: super::super::StorageBackend::Sled,
      path: Some(temp_dir.path().to_string_lossy().to_string()),
      compression: false,
      cache_size_mb: 10,
    };

    SledStorage::new(config).await.unwrap()
  }

  fn create_test_fact_data(tool: &str, version: &str) -> FactData {
    FactData {
      tool: tool.to_string(),
      version: version.to_string(),
      ecosystem: "beam".to_string(),
      documentation: "Test documentation".to_string(),
      snippets: vec![],
      examples: vec![],
      best_practices: vec![],
      troubleshooting: vec![],
      github_sources: vec![],
      dependencies: vec![],
      tags: vec!["test".to_string()],
      last_updated: SystemTime::now(),
      source: "test".to_string(),
    }
  }

  #[tokio::test]
  async fn test_store_and_retrieve() {
    let storage = create_test_storage().await;
    let key = FactKey::new(
      "phoenix".to_string(),
      "1.7.0".to_string(),
      "beam".to_string(),
    );
    let data = create_test_fact_data("phoenix", "1.7.0");

    // Store data
    storage.store_fact(&key, &data).await.unwrap();

    // Retrieve data
    let retrieved = storage.get_fact(&key).await.unwrap();
    assert!(retrieved.is_some());
    let retrieved_data = retrieved.unwrap();
    assert_eq!(retrieved_data.tool, "phoenix");
    assert_eq!(retrieved_data.version, "1.7.0");
  }

  #[tokio::test]
  async fn test_exists_and_delete() {
    let storage = create_test_storage().await;
    let key = FactKey::new(
      "ecto".to_string(),
      "3.10.0".to_string(),
      "beam".to_string(),
    );
    let data = create_test_fact_data("ecto", "3.10.0");

    // Initially doesn't exist
    assert!(!storage.exists(&key).await.unwrap());

    // Store and check existence
    storage.store_fact(&key, &data).await.unwrap();
    assert!(storage.exists(&key).await.unwrap());

    // Delete and check non-existence
    storage.delete_fact(&key).await.unwrap();
    assert!(!storage.exists(&key).await.unwrap());
  }

  #[tokio::test]
  async fn test_list_tools_by_ecosystem() {
    let storage = create_test_storage().await;

    // Store multiple tools
    let tools =
      vec![("phoenix", "1.7.0"), ("ecto", "3.10.0"), ("plug", "1.14.0")];

    for (tool, version) in &tools {
      let key =
        FactKey::new(tool.to_string(), version.to_string(), "beam".to_string());
      let data = create_test_fact_data(tool, version);
      storage.store_fact(&key, &data).await.unwrap();
    }

    // List tools in beam ecosystem
    let beam_tools = storage.list_tools("beam").await.unwrap();
    assert_eq!(beam_tools.len(), 3);

    let tool_names: Vec<String> =
      beam_tools.iter().map(|k| k.tool.clone()).collect();
    assert!(tool_names.contains(&"phoenix".to_string()));
    assert!(tool_names.contains(&"ecto".to_string()));
    assert!(tool_names.contains(&"plug".to_string()));
  }

  #[tokio::test]
  async fn test_storage_stats() {
    let storage = create_test_storage().await;

    // Store some test data
    let key1 = FactKey::new(
      "phoenix".to_string(),
      "1.7.0".to_string(),
      "beam".to_string(),
    );
    let key2 = FactKey::new(
      "tokio".to_string(),
      "1.0.0".to_string(),
      "rust".to_string(),
    );

    storage
      .store_fact(&key1, &create_test_fact_data("phoenix", "1.7.0"))
      .await
      .unwrap();
    storage
      .store_fact(&key2, &create_test_fact_data("tokio", "1.0.0"))
      .await
      .unwrap();

    let stats = storage.stats().await.unwrap();
    assert_eq!(stats.total_entries, 2);
    assert_eq!(stats.ecosystems.len(), 2);
    assert_eq!(*stats.ecosystems.get("beam").unwrap(), 1);
    assert_eq!(*stats.ecosystems.get("rust").unwrap(), 1);
  }
}
