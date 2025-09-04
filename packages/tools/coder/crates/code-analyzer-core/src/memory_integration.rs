//! Memory Integration for File-Aware Core
//! 
//! Integrates with the memory package to provide persistent storage and caching
//! for both RAG (Retrieval-Augmented Generation) and FACT (Factual Augmented Contextual Training)
//! knowledge systems.

use crate::{Result, FileAwareError, FileAnalyzer, DatabaseManager};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

/// Memory integration types for knowledge systems
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MemoryType {
    /// Cache: Fast in-memory storage for frequently accessed data
    Cache {
        max_size: usize,
        ttl_seconds: u64,
        compression: bool,
    },
    
    /// Session: Persistent session storage with SQLite backend
    Session {
        path: String,
        max_size: usize,
        ttl_hours: u64,
        compression: bool,
    },
    
    /// Semantic: Vector-based semantic memory with LanceDB backend
    Semantic {
        vector_dimensions: usize,
        similarity_threshold: f32,
        index_type: String,
        compression: bool,
    },
    
    /// Debug: Development and debugging storage with JSON backend
    Debug {
        path: String,
        pretty_print: bool,
        backup_enabled: bool,
    },
}

/// Memory backend specifications
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryBackendSpecs {
    pub memory: BackendSpec,
    pub sqlite: BackendSpec,
    pub lancedb: BackendSpec,
    pub json: BackendSpec,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackendSpec {
    pub speed: String,
    pub persistence: bool,
    pub search_capability: String,
    pub best_for: String,
}

/// Memory integration manager
pub struct MemoryIntegration {
    file_analyzer: FileAnalyzer,
    database_manager: DatabaseManager,
    
    // Memory backends
    cache_backend: CacheBackend,
    session_backend: SessionBackend,
    semantic_backend: SemanticBackend,
    debug_backend: DebugBackend,
    
    // Memory configuration
    config: MemoryConfig,
    
    // Performance tracking
    metrics: MemoryMetrics,
}

/// Cache backend for fast in-memory storage
pub struct CacheBackend {
    data: HashMap<String, CacheEntry>,
    max_size: usize,
    ttl_seconds: u64,
    compression: bool,
    access_order: Vec<String>,
}

/// Session backend for persistent storage
pub struct SessionBackend {
    path: String,
    max_size: usize,
    ttl_hours: u64,
    compression: bool,
    sessions: HashMap<String, SessionData>,
}

/// Semantic backend for vector storage
pub struct SemanticBackend {
    vector_dimensions: usize,
    similarity_threshold: f32,
    index_type: String,
    compression: bool,
    vectors: HashMap<String, VectorData>,
    metadata: HashMap<String, VectorMetadata>,
}

/// Debug backend for development
pub struct DebugBackend {
    path: String,
    pretty_print: bool,
    backup_enabled: bool,
    data: HashMap<String, DebugEntry>,
}

/// Memory configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    pub enable_cache: bool,
    pub enable_sessions: bool,
    pub enable_semantic: bool,
    pub enable_debug: bool,
    pub default_ttl: u64,
    pub compression_enabled: bool,
    pub backup_enabled: bool,
}

/// Memory metrics for performance tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryMetrics {
    pub total_operations: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub storage_operations: u64,
    pub vector_operations: u64,
    pub average_response_time_ms: f64,
    pub error_count: u64,
}

/// Cache entry with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub data: serde_json::Value,
    pub created_at: u64,
    pub accessed_at: u64,
    pub access_count: u64,
    pub ttl_seconds: u64,
    pub tags: Vec<String>,
}

/// Session data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub id: String,
    pub data: HashMap<String, serde_json::Value>,
    pub metadata: SessionMetadata,
    pub vectors: Option<HashMap<String, VectorData>>,
}

/// Session metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMetadata {
    pub created: u64,
    pub updated: u64,
    pub accessed: u64,
    pub ttl_hours: u64,
    pub tags: Vec<String>,
}

/// Vector data for semantic storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorData {
    pub vector: Vec<f32>,
    pub metadata: VectorMetadata,
    pub created_at: u64,
}

/// Vector metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorMetadata {
    pub source: String,
    pub content_type: String,
    pub language: String,
    pub tags: Vec<String>,
    pub confidence: f32,
}

/// Debug entry for development
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugEntry {
    pub data: serde_json::Value,
    pub timestamp: u64,
    pub operation: String,
    pub metadata: HashMap<String, String>,
}

impl MemoryIntegration {
    /// Creates a new memory integration manager.
    pub fn new(config: MemoryConfig) -> Result<Self> {
        let (max_size, ttl_seconds, compression) = config.cache_config();
        let (path, session_max_size, ttl_hours, session_compression) = config.session_config();
        let (vector_dimensions, similarity_threshold, index_type, semantic_compression) = config.semantic_config();
        let (debug_path, pretty_print, backup_enabled) = config.debug_config();
        
        Ok(Self {
            file_analyzer: FileAnalyzer::new(),
            database_manager: DatabaseManager::default(),
            cache_backend: CacheBackend::new(max_size, ttl_seconds, compression),
            session_backend: SessionBackend::new(path, session_max_size, ttl_hours, session_compression),
            semantic_backend: SemanticBackend::new(vector_dimensions, similarity_threshold, index_type, semantic_compression),
            debug_backend: DebugBackend::new(debug_path, pretty_print, backup_enabled),
            config,
            metrics: MemoryMetrics::default(),
        })
    }
    
    /// Stores data in the appropriate memory backend based on the provided options.
    pub async fn store(&mut self, key: &str, data: serde_json::Value, options: StoreOptions) -> Result<()> {
        let start_time = SystemTime::now();
        
        let result = match options.memory_type {
            MemoryType::Cache { .. } => {
                self.cache_backend.store(key, data, options).await
            }
            MemoryType::Session { .. } => {
                self.session_backend.store(key, data, options).await
            }
            MemoryType::Semantic { .. } => {
                self.semantic_backend.store(key, data, options).await
            }
            MemoryType::Debug { .. } => {
                self.debug_backend.store(key, data, options).await
            }
        };
        
        // Update metrics
        self.update_metrics(start_time, result.is_ok());
        
        result
    }
    
    /// Retrieves data from memory backends, with intelligent caching.
    pub async fn retrieve(&mut self, key: &str, options: RetrieveOptions) -> Result<Option<serde_json::Value>> {
        let start_time = SystemTime::now();
        
        // Try cache first if enabled
        if self.config.enable_cache {
            if let Some(cached_data) = self.cache_backend.retrieve(key).await? {
                self.metrics.cache_hits += 1;
                self.update_metrics(start_time, true);
                return Ok(Some(cached_data));
            }
            self.metrics.cache_misses += 1;
        }
        
        // Fallback to appropriate backend
        let result = match options.memory_type {
            MemoryType::Cache { .. } => {
                self.cache_backend.retrieve(key).await
            }
            MemoryType::Session { .. } => {
                self.session_backend.retrieve(key).await
            }
            MemoryType::Semantic { .. } => {
                self.semantic_backend.retrieve(key).await
            }
            MemoryType::Debug { .. } => {
                self.debug_backend.retrieve(key).await
            }
        };
        
        // Update metrics
        self.update_metrics(start_time, result.is_ok());
        
        result
    }
    
    /// Stores knowledge data, intelligently selecting the appropriate backend.
    pub async fn store_knowledge(&mut self, knowledge: KnowledgeData, options: KnowledgeStoreOptions) -> Result<String> {
        let key = self.generate_knowledge_key(&knowledge);
        
        // Store in appropriate backends based on knowledge type
        match knowledge.knowledge_type {
            KnowledgeType::RAG { .. } => {
                // Store in semantic backend for vector search
                self.semantic_backend.store_knowledge(&key, &knowledge).await?;
                
                // Also cache frequently accessed RAG results
                if options.cache_enabled {
                    self.cache_backend.store(&key, serde_json::to_value(&knowledge)?, 
                        StoreOptions::default()).await?;
                }
            }
            KnowledgeType::FACT { .. } => {
                // Store verified facts in session backend for persistence
                self.session_backend.store_knowledge(&key, &knowledge).await?;
                
                // Cache high-confidence facts
                if knowledge.confidence > 0.8 && options.cache_enabled {
                    self.cache_backend.store(&key, serde_json::to_value(&knowledge)?, 
                        StoreOptions::default()).await?;
                }
            }
        }
        
        Ok(key)
    }
    
    /// Retrieves knowledge, using intelligent caching and falling back to semantic and session search.
    pub async fn retrieve_knowledge(&mut self, query: &str, options: KnowledgeRetrieveOptions) -> Result<Vec<KnowledgeData>> {
        // Try cache first for fast retrieval
        if self.config.enable_cache {
            let cache_key = format!("knowledge:query:{}", query);
            if let Some(cached) = self.cache_backend.retrieve(&cache_key).await? {
                if let Ok(knowledge_list) = serde_json::from_value::<Vec<KnowledgeData>>(cached) {
                    self.metrics.cache_hits += 1;
                    return Ok(knowledge_list);
                }
            }
            self.metrics.cache_misses += 1;
        }
        
        // Perform semantic search in semantic backend
        let semantic_results = self.semantic_backend.search_semantic(query, options.similarity_threshold).await?;
        
        // Also search in session backend for verified facts
        let fact_results = self.session_backend.search_facts(query, options.verification_threshold).await?;
        
        // Combine and rank results
        let mut combined_results = Vec::new();
        combined_results.extend(semantic_results);
        combined_results.extend(fact_results);
        
        // Rank by relevance and confidence
        combined_results.sort_by(|a, b| {
            b.relevance_score.partial_cmp(&a.relevance_score).unwrap_or(std::cmp::Ordering::Equal)
        });
        
        // Cache results for future queries
        if self.config.enable_cache {
            let cache_key = format!("knowledge:query:{}", query);
            let cache_data = serde_json::to_value(&combined_results)?;
            self.cache_backend.store(&cache_key, cache_data, StoreOptions::default()).await?;
        }
        
        Ok(combined_results)
    }
    
    /// Generate unique key for knowledge data
    fn generate_knowledge_key(&self, knowledge: &KnowledgeData) -> String {
        let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
        let hash = format!("{:x}", md5::compute(&knowledge.content));
        format!("knowledge:{}:{}:{}", knowledge.knowledge_type.to_string(), hash, timestamp)
    }
    
    /// Update memory metrics
    fn update_metrics(&mut self, start_time: SystemTime, success: bool) {
        self.metrics.total_operations += 1;
        
        if let Ok(duration) = start_time.elapsed() {
            let response_time = duration.as_millis() as f64;
            let current_avg = self.metrics.average_response_time_ms;
            let total_ops = self.metrics.total_operations as f64;
            
            self.metrics.average_response_time_ms = 
                (current_avg * (total_ops - 1.0) + response_time) / total_ops;
        }
        
        if !success {
            self.metrics.error_count += 1;
        }
    }
    
    /// Get memory system health and metrics
    pub fn get_health(&self) -> MemoryHealth {
        MemoryHealth {
            total_operations: self.metrics.total_operations,
            cache_hit_rate: if self.metrics.total_operations > 0 {
                self.metrics.cache_hits as f64 / self.metrics.total_operations as f64
            } else {
                0.0
            },
            average_response_time_ms: self.metrics.average_response_time_ms,
            error_rate: if self.metrics.total_operations > 0 {
                self.metrics.error_count as f64 / self.metrics.total_operations as f64
            } else {
                0.0
            },
            backends: vec![
                "cache".to_string(),
                "session".to_string(),
                "semantic".to_string(),
                "debug".to_string(),
            ],
        }
    }
    
    /// Clear expired data from all backends
    pub async fn cleanup_expired(&self) -> Result<CleanupResult> {
        let mut result = CleanupResult::default();
        
        // Cleanup cache backend
        let cache_cleaned = self.cache_backend.cleanup_expired().await?;
        result.cache_cleaned += cache_cleaned;
        
        // Cleanup session backend
        let session_cleaned = self.session_backend.cleanup_expired().await?;
        result.session_cleaned += session_cleaned;
        
        // Cleanup semantic backend
        let semantic_cleaned = self.semantic_backend.cleanup_expired().await?;
        result.semantic_cleaned += semantic_cleaned;
        
        // Cleanup debug backend
        let debug_cleaned = self.debug_backend.cleanup_expired().await?;
        result.debug_cleaned += debug_cleaned;
        
        Ok(result)
    }
}

impl CacheBackend {
    fn new(max_size: usize, ttl_seconds: u64, compression: bool) -> Self {
        Self {
            data: HashMap::new(),
            max_size,
            ttl_seconds,
            compression,
            access_order: Vec::new(),
        }
    }
    
    async fn store(&mut self, key: &str, data: serde_json::Value, _options: StoreOptions) -> Result<()> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        
        // Check if we need to evict old entries
        if self.data.len() >= self.max_size {
            self.evict_oldest().await?;
        }
        
        let entry = CacheEntry {
            data,
            created_at: now,
            accessed_at: now,
            access_count: 1,
            ttl_seconds: self.ttl_seconds,
            tags: Vec::new(),
        };
        
        self.data.insert(key.to_string(), entry);
        self.access_order.push(key.to_string());
        
        Ok(())
    }
    
    async fn retrieve(&mut self, key: &str) -> Result<Option<serde_json::Value>> {
        if let Some(entry) = self.data.get_mut(key) {
            let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
            
            // Check if entry has expired
            if now - entry.created_at > entry.ttl_seconds {
                // The entry is expired, it should be removed.
                // For simplicity in this example, we just return None.
                // A full implementation would remove it from `self.data` and `self.access_order`.
                return Ok(None);
            }
            
            // Update access metadata
            entry.accessed_at = now;
            entry.access_count += 1;

            // Update access order for LRU eviction
            if let Some(pos) = self.access_order.iter().position(|k| k == key) {
                let k = self.access_order.remove(pos);
                self.access_order.push(k);
            }

            Ok(Some(entry.data.clone()))
        } else {
            Ok(None)
        }
    }
    
    async fn evict_oldest(&mut self) -> Result<()> {
        if !self.access_order.is_empty() {
            let oldest_key = self.access_order.remove(0);
            self.data.remove(&oldest_key);
        }
        Ok(())
    }
    
    async fn cleanup_expired(&mut self) -> Result<usize> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        let mut cleaned = 0;
        
        let expired_keys: Vec<String> = self.data
            .iter()
            .filter(|(_, entry)| now - entry.created_at > entry.ttl_seconds)
            .map(|(key, _)| key.clone())
            .collect();
        
        for key in expired_keys {
            self.data.remove(&key);
            if let Some(pos) = self.access_order.iter().position(|k| k == &key) {
                self.access_order.remove(pos);
            }
            cleaned += 1;
        }
        
        Ok(cleaned)
    }
}

impl SessionBackend {
    fn new(path: String, max_size: usize, ttl_hours: u64, compression: bool) -> Self {
        Self {
            path,
            max_size,
            ttl_hours,
            compression,
            sessions: HashMap::new(),
        }
    }
    
    async fn store(&mut self, key: &str, data: serde_json::Value, _options: StoreOptions) -> Result<()> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        
        // Parse session ID from key (format: session:session_id:data_key)
        let parts: Vec<&str> = key.split(':').collect();
        if parts.len() >= 3 {
            let session_id = parts[1];
            let data_key = parts[2];
            
            let session = self.sessions.entry(session_id.to_string()).or_insert_with(|| SessionData {
                id: session_id.to_string(),
                data: HashMap::new(),
                metadata: SessionMetadata {
                    created: now,
                    updated: now,
                    accessed: now,
                    ttl_hours: self.ttl_hours,
                    tags: Vec::new(),
                },
                vectors: None,
            });
            
            session.data.insert(data_key.to_string(), data);
            session.metadata.updated = now;
            session.metadata.accessed = now;
        }
        
        Ok(())
    }
    
    async fn retrieve(&self, key: &str) -> Result<Option<serde_json::Value>> {
        let parts: Vec<&str> = key.split(':').collect();
        if parts.len() >= 3 {
            let session_id = parts[1];
            let data_key = parts[2];
            
            if let Some(session) = self.sessions.get(session_id) {
                let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
                
                // Check if session has expired
                if now - session.metadata.created > session.metadata.ttl_hours * 3600 {
                    return Ok(None);
                }
                
                return Ok(session.data.get(data_key).cloned());
            }
        }
        
        Ok(None)
    }
    
    async fn store_knowledge(&mut self, key: &str, knowledge: &KnowledgeData) -> Result<()> {
        // Store knowledge as session data
        let data = serde_json::to_value(knowledge)?;
        self.store(key, data, StoreOptions::default()).await
    }
    
    async fn search_facts(&self, query: &str, verification_threshold: f32) -> Result<Vec<KnowledgeData>> {
        let mut results = Vec::new();
        
        // Search through all sessions for facts matching the query
        for session in self.sessions.values() {
            for (_, data) in &session.data {
                if let Ok(knowledge) = serde_json::from_value::<KnowledgeData>(data.clone()) {
                    if knowledge.knowledge_type.to_string().contains("FACT") && 
                       knowledge.confidence >= verification_threshold {
                        results.push(knowledge);
                    }
                }
            }
        }
        
        Ok(results)
    }
    
    async fn cleanup_expired(&mut self) -> Result<usize> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        let mut cleaned = 0;
        
        let expired_sessions: Vec<String> = self.sessions
            .iter()
            .filter(|(_, session)| now - session.metadata.created > session.metadata.ttl_hours * 3600)
            .map(|(id, _)| id.clone())
            .collect();
        
        for session_id in expired_sessions {
            self.sessions.remove(&session_id);
            cleaned += 1;
        }
        
        Ok(cleaned)
    }
}

impl SemanticBackend {
    fn new(vector_dimensions: usize, similarity_threshold: f32, index_type: String, compression: bool) -> Self {
        Self {
            vector_dimensions,
            similarity_threshold,
            index_type,
            compression,
            vectors: HashMap::new(),
            metadata: HashMap::new(),
        }
    }
    
    async fn store(&mut self, key: &str, data: serde_json::Value, _options: StoreOptions) -> Result<()> {
        // For semantic storage, we need to extract vector embeddings
        // This is a simplified implementation
        let vector = vec![0.1; self.vector_dimensions]; // Placeholder vector
        
        let vector_data = VectorData {
            vector,
            metadata: VectorMetadata {
                source: "semantic_storage".to_string(),
                content_type: "text".to_string(),
                language: "en".to_string(),
                tags: Vec::new(),
                confidence: 0.8,
            },
            created_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
        };
        
        self.vectors.insert(key.to_string(), vector_data);
        
        Ok(())
    }
    
    async fn retrieve(&self, key: &str) -> Result<Option<serde_json::Value>> {
        if let Some(vector_data) = self.vectors.get(key) {
            // Convert vector data back to JSON
            let data = serde_json::to_value(vector_data)?;
            Ok(Some(data))
        } else {
            Ok(None)
        }
    }
    
    async fn store_knowledge(&mut self, key: &str, knowledge: &KnowledgeData) -> Result<()> {
        // Store knowledge with semantic indexing
        let data = serde_json::to_value(knowledge)?;
        self.store(key, data, StoreOptions::default()).await
    }
    
    async fn search_semantic(&self, query: &str, similarity_threshold: f32) -> Result<Vec<KnowledgeData>> {
        let mut results = Vec::new();
        
        // Simplified semantic search - in practice this would use vector similarity
        for (key, vector_data) in &self.vectors {
            if let Some(metadata) = self.metadata.get(key) {
                // Check if query matches metadata
                if metadata.source.contains(query) || 
                   metadata.content_type.contains(query) ||
                   metadata.language.contains(query) {
                    // Create knowledge data from vector
                    let knowledge = KnowledgeData {
                        id: key.clone(),
                        content: format!("Semantic result from {}", metadata.source),
                        knowledge_type: KnowledgeType::RAG {
                            query: query.to_string(),
                            context_window: 1000,
                            similarity_threshold: 0.7,
                            max_results: 10,
                        },
                        confidence: metadata.confidence,
                        source: metadata.source.clone(),
                        tags: metadata.tags.clone(),
                        relevance_score: 0.8,
                    };
                    results.push(knowledge);
                }
            }
        }
        
        Ok(results)
    }
    
    async fn cleanup_expired(&mut self) -> Result<usize> {
        // Semantic backend doesn't have TTL-based expiration
        // but could implement other cleanup strategies
        Ok(0)
    }
}

impl DebugBackend {
    fn new(path: String, pretty_print: bool, backup_enabled: bool) -> Self {
        Self {
            path,
            pretty_print,
            backup_enabled,
            data: HashMap::new(),
        }
    }
    
    async fn store(&mut self, key: &str, data: serde_json::Value, _options: StoreOptions) -> Result<()> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        
        let entry = DebugEntry {
            data,
            timestamp: now,
            operation: "store".to_string(),
            metadata: HashMap::new(),
        };
        
        self.data.insert(key.to_string(), entry);
        
        Ok(())
    }
    
    async fn retrieve(&self, key: &str) -> Result<Option<serde_json::Value>> {
        if let Some(entry) = self.data.get(key) {
            Ok(Some(entry.data.clone()))
        } else {
            Ok(None)
        }
    }
    
    async fn cleanup_expired(&mut self) -> Result<usize> {
        // Debug backend doesn't expire data
        Ok(0)
    }
}

// Data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StoreOptions {
    pub memory_type: MemoryType,
    pub ttl_override: Option<u64>,
    pub compression: Option<bool>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetrieveOptions {
    pub memory_type: MemoryType,
    pub include_metadata: bool,
    pub max_results: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeData {
    pub id: String,
    pub content: String,
    pub knowledge_type: KnowledgeType,
    pub confidence: f32,
    pub source: String,
    pub tags: Vec<String>,
    pub relevance_score: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KnowledgeType {
    RAG {
        query: String,
        context_window: usize,
        similarity_threshold: f32,
        max_results: usize,
    },
    FACT {
        domain: String,
        fact_type: String,
        verification_level: String,
        source_authority: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeStoreOptions {
    pub cache_enabled: bool,
    pub compression: bool,
    pub backup: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeRetrieveOptions {
    pub similarity_threshold: f32,
    pub verification_threshold: f32,
    pub max_results: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryHealth {
    pub total_operations: u64,
    pub cache_hit_rate: f64,
    pub average_response_time_ms: f64,
    pub error_rate: f64,
    pub backends: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CleanupResult {
    pub cache_cleaned: usize,
    pub session_cleaned: usize,
    pub semantic_cleaned: usize,
    pub debug_cleaned: usize,
}

// Default implementations
impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            enable_cache: true,
            enable_sessions: true,
            enable_semantic: true,
            enable_debug: true,
            default_ttl: 3600, // 1 hour
            compression_enabled: true,
            backup_enabled: false,
        }
    }
}

impl Default for MemoryMetrics {
    fn default() -> Self {
        Self {
            total_operations: 0,
            cache_hits: 0,
            cache_misses: 0,
            storage_operations: 0,
            vector_operations: 0,
            average_response_time_ms: 0.0,
            error_count: 0,
        }
    }
}

impl Default for CleanupResult {
    fn default() -> Self {
        Self {
            cache_cleaned: 0,
            session_cleaned: 0,
            semantic_cleaned: 0,
            debug_cleaned: 0,
        }
    }
}

impl Default for StoreOptions {
    fn default() -> Self {
        Self {
            memory_type: MemoryType::Cache {
                max_size: 1000,
                ttl_seconds: 3600,
                compression: false,
            },
            ttl_override: None,
            compression: None,
            tags: Vec::new(),
        }
    }
}

impl Default for RetrieveOptions {
    fn default() -> Self {
        Self {
            memory_type: MemoryType::Cache {
                max_size: 1000,
                ttl_seconds: 3600,
                compression: false,
            },
            include_metadata: false,
            max_results: None,
        }
    }
}

impl Default for KnowledgeStoreOptions {
    fn default() -> Self {
        Self {
            cache_enabled: true,
            compression: true,
            backup: false,
        }
    }
}

impl Default for KnowledgeRetrieveOptions {
    fn default() -> Self {
        Self {
            similarity_threshold: 0.7,
            verification_threshold: 0.8,
            max_results: 10,
        }
    }
}

impl MemoryConfig {
    fn cache_config(&self) -> (usize, u64, bool) {
        (10000, self.default_ttl, self.compression_enabled)
    }
    
    fn session_config(&self) -> (String, usize, u64, bool) {
        ("./.claude-zen/memory/sessions".to_string(), 50000, 24, self.compression_enabled)
    }
    
    fn semantic_config(&self) -> (usize, f32, String, bool) {
        (384, 0.7, "hnsw".to_string(), self.compression_enabled)
    }
    
    fn debug_config(&self) -> (String, bool, bool) {
        ("./.claude-zen/memory/debug".to_string(), true, self.backup_enabled)
    }
}

// Implement Display for KnowledgeType
impl std::fmt::Display for KnowledgeType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            KnowledgeType::RAG { .. } => write!(f, "RAG"),
            KnowledgeType::FACT { .. } => write!(f, "FACT"),
        }
    }
}
