//! Memory and Cache Management for Code Intelligence
//!
//! Provides a simple, effective, application-level cache manager for storing
//! frequently accessed data like ASTs, analysis results, and ML model outputs.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

/// Memory management errors following Google standards
#[derive(Error, Debug)]
pub enum MemoryManagementError {
    #[error("Memory allocation failed: {size_requested} bytes - {reason}")]
    AllocationError { size_requested: usize, reason: String },
    
    #[error("Memory deallocation failed: {0}")]
    CacheError(String),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

/// Configuration for the application cache.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    pub max_size_entries: usize,
    pub default_ttl_seconds: u64,
    pub compression_enabled: bool,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            max_size_entries: 1000,
            default_ttl_seconds: 3600, // 1 hour
            compression_enabled: false,
        }
    }
}

/// An entry in the cache, with metadata for TTL and LRU eviction.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub data: serde_json::Value,
    pub created_at: u64,
    pub accessed_at: u64,
    pub access_count: u64,
    pub ttl_seconds: u64,
}

/// A simple, in-memory, thread-safe LRU cache manager.
#[derive(Debug)]
pub struct CacheManager {
    data: dashmap::DashMap<String, CacheEntry>,
    access_order: parking_lot::Mutex<Vec<String>>,
    config: CacheConfig,
}

impl CacheManager {
    /// Initializes a new CacheManager with the given configuration.
    pub fn initialize(config: CacheConfig) -> std::result::Result<Self, MemoryManagementError> {
        Ok(Self {
            data: dashmap::DashMap::with_capacity(config.max_size_entries),
            access_order: parking_lot::Mutex::new(Vec::with_capacity(config.max_size_entries)),
            config,
        })
    }

    /// Stores a value in the cache.
    pub async fn store(&self, key: &str, data: serde_json::Value) -> std::result::Result<(), MemoryManagementError> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

        if self.data.len() >= self.config.max_size_entries {
            self.evict_oldest().await?;
        }

        let entry = CacheEntry {
            data,
            created_at: now,
            accessed_at: now,
            access_count: 1,
            ttl_seconds: self.config.default_ttl_seconds,
        };

        self.data.insert(key.to_string(), entry);
        self.access_order.lock().push(key.to_string());

        Ok(())
    }

    /// Retrieves a value from the cache.
    pub async fn retrieve(&self, key: &str) -> std::result::Result<Option<serde_json::Value>, MemoryManagementError> {
        if let Some(mut entry) = self.data.get_mut(key) {
            let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

            if now.saturating_sub(entry.created_at) > entry.ttl_seconds {
                // Entry has expired. We'll remove it and return None.
                self.data.remove(key);
                // Also remove from access_order
                let mut order = self.access_order.lock();
                if let Some(pos) = order.iter().position(|k| k == key) {
                    order.remove(pos);
                }
                return Ok(None);
            }

            // Update metadata for LRU
            entry.accessed_at = now;
            entry.access_count += 1;
            
            let mut order = self.access_order.lock();
            if let Some(pos) = order.iter().position(|k| k == key) {
                let k = order.remove(pos);
                order.push(k);
            }

            return Ok(Some(entry.data.clone()));
        }

        Ok(None)
    }

    /// Evicts the least recently used item from the cache.
    async fn evict_oldest(&self) -> std::result::Result<(), MemoryManagementError> {
        let mut order = self.access_order.lock();
        if !order.is_empty() {
            let oldest_key = order.remove(0);
            self.data.remove(&oldest_key);
        }
        Ok(())
    }

    /// Clears all expired entries from the cache.
    pub async fn cleanup_expired(&self) -> std::result::Result<usize, MemoryManagementError> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        let mut cleaned_count = 0;

        // We need to collect keys to remove to avoid modifying the map while iterating.
        let expired_keys: Vec<String> = self.data
            .iter()
            .filter(|entry| now.saturating_sub(entry.value().created_at) > entry.value().ttl_seconds)
            .map(|entry| entry.key().clone())
            .collect();

        let mut order = self.access_order.lock();
        for key in expired_keys {
            self.data.remove(&key);
            if let Some(pos) = order.iter().position(|k| k == &key) {
                order.remove(pos);
            }
            cleaned_count += 1;
        }

        Ok(cleaned_count)
    }
}