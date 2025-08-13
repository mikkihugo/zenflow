//! # zen-swarm-vector
//!
//! High-performance vector database and RAG engine for zen-orchestrator.
//! 
//! Provides LanceDB integration, semantic search, embedding generation,
//! and retrieval-augmented generation capabilities with full async support.
//!
//! ## Features
//!
//! - **LanceDB Integration**: High-performance vector storage with ACID properties
//! - **Semantic Search**: Cosine similarity, dot product, and L2 distance
//! - **Embedding Generation**: Built-in embedding models with tokenization
//! - **RAG Engine**: Complete retrieval-augmented generation pipeline
//! - **Async Streaming**: Stream-based operations for large datasets
//! - **WASM Support**: Browser and edge deployment capabilities
//!
//! ## Example
//!
//! ```rust
//! use zen_swarm_vector::{VectorStore, EmbeddingEngine, RAGPipeline};
//!
//! #[tokio::main]
//! async fn main() -> anyhow::Result<()> {
//!     // Initialize vector store
//!     let store = VectorStore::new("./vector_data").await?;
//!     
//!     // Initialize embedding engine
//!     let embedder = EmbeddingEngine::default().await?;
//!     
//!     // Create RAG pipeline
//!     let rag = RAGPipeline::new(store, embedder);
//!     
//!     // Store document with automatic embedding
//!     rag.store_document("doc1", "This is a sample document about AI").await?;
//!     
//!     // Perform semantic search
//!     let results = rag.semantic_search("artificial intelligence", 5).await?;
//!     
//!     for result in results {
//!         println!("Document: {}, Score: {:.4}", result.id, result.score);
//!     }
//!     
//!     Ok(())
//! }
//! ```

pub mod config;
pub mod embeddings;
pub mod error;
pub mod graph;  // File-based graph neural networks for document relationships
pub mod lancedb;
pub mod rag;
pub mod search;
pub mod store;
pub mod types;

pub use config::*;
pub use embeddings::*;
pub use error::*;
pub use graph::*;  // Export file-based graph functionality
pub use lancedb::*;
pub use rag::*;
pub use search::*;
pub use store::*;
pub use types::*;

use std::sync::Arc;
use tokio::sync::RwLock;

/// Main vector database interface combining LanceDB storage with RAG capabilities
#[derive(Clone)]
pub struct VectorDatabase {
    store: Arc<VectorStore>,
    embedder: Arc<RwLock<EmbeddingEngine>>,
    rag_engine: Arc<RAGPipeline>,
}

impl VectorDatabase {
    /// Create new vector database instance
    pub async fn new(config: VectorConfig) -> Result<Self, VectorError> {
        let store = Arc::new(VectorStore::new(&config.storage_path).await?);
        let embedder = Arc::new(RwLock::new(EmbeddingEngine::from_config(&config.embedding_config).await?));
        let rag_engine = Arc::new(RAGPipeline::new(store.clone(), embedder.clone()));
        
        Ok(Self {
            store,
            embedder,
            rag_engine,
        })
    }
    
    /// Get vector store reference
    pub fn store(&self) -> &Arc<VectorStore> {
        &self.store
    }
    
    /// Get embedding engine reference
    pub fn embedder(&self) -> &Arc<RwLock<EmbeddingEngine>> {
        &self.embedder
    }
    
    /// Get RAG engine reference
    pub fn rag_engine(&self) -> &Arc<RAGPipeline> {
        &self.rag_engine
    }
    
    /// Perform semantic search across all documents
    pub async fn search(&self, query: &str, limit: usize) -> Result<Vec<SearchResult>, VectorError> {
        self.rag_engine.semantic_search(query, limit).await
    }
    
    /// Store document with metadata and automatic embedding generation
    pub async fn store_document(&self, id: &str, content: &str, metadata: Option<DocumentMetadata>) -> Result<(), VectorError> {
        self.rag_engine.store_document(id, content, metadata).await
    }
    
    /// Get database statistics
    pub async fn stats(&self) -> Result<DatabaseStats, VectorError> {
        self.store.stats().await
    }
    
    /// Health check for all components
    pub async fn health_check(&self) -> Result<HealthStatus, VectorError> {
        let store_healthy = self.store.health_check().await?;
        let embedder_healthy = {
            let embedder = self.embedder.read().await;
            embedder.health_check().await?
        };
        
        Ok(HealthStatus {
            store_healthy,
            embedder_healthy,
            overall_healthy: store_healthy && embedder_healthy,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_vector_database_creation() {
        let config = VectorConfig::default();
        let db = VectorDatabase::new(config).await;
        assert!(db.is_ok());
    }
    
    #[tokio::test]
    async fn test_semantic_search_pipeline() {
        let config = VectorConfig::default();
        let db = VectorDatabase::new(config).await.unwrap();
        
        // Store a test document
        db.store_document("test1", "This is about artificial intelligence and machine learning", None).await.unwrap();
        
        // Search for similar content
        let results = db.search("AI and ML topics", 5).await.unwrap();
        
        assert!(!results.is_empty());
        assert_eq!(results[0].id, "test1");
    }
}