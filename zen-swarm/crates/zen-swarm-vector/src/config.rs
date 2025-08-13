//! Configuration types for zen-swarm-vector

use serde::{Deserialize, Serialize};

/// Configuration for vector database operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorConfig {
    /// Path for vector storage
    pub storage_path: String,
    /// Embedding configuration
    pub embedding_config: EmbeddingConfig,
    /// Maximum number of vectors to store
    pub max_vectors: usize,
}

/// Configuration for embedding generation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingConfig {
    /// Model name for embeddings
    pub model_name: String,
    /// Embedding dimensions
    pub dimensions: usize,
}

impl Default for VectorConfig {
    fn default() -> Self {
        Self {
            storage_path: "./vector_data".to_string(),
            embedding_config: EmbeddingConfig::default(),
            max_vectors: 1000000,
        }
    }
}

impl Default for EmbeddingConfig {
    fn default() -> Self {
        Self {
            model_name: "all-MiniLM-L6-v2".to_string(),
            dimensions: 384,
        }
    }
}