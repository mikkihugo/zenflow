//! Core types and data structures for the vector database system

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Vector embedding representation
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Vector {
    /// Vector dimensions (typically 384, 768, or 1536 for common models)
    pub dimensions: Vec<f32>,
    /// Normalization flag
    pub normalized: bool,
}

impl Vector {
    /// Create new vector from dimensions
    pub fn new(dimensions: Vec<f32>) -> Self {
        Self {
            dimensions,
            normalized: false,
        }
    }
    
    /// Create normalized vector
    pub fn normalized(mut dimensions: Vec<f32>) -> Self {
        let magnitude: f32 = dimensions.iter().map(|x| x * x).sum::<f32>().sqrt();
        if magnitude > 0.0 {
            for dim in &mut dimensions {
                *dim /= magnitude;
            }
        }
        
        Self {
            dimensions,
            normalized: true,
        }
    }
    
    /// Get vector magnitude
    pub fn magnitude(&self) -> f32 {
        self.dimensions.iter().map(|x| x * x).sum::<f32>().sqrt()
    }
    
    /// Calculate cosine similarity with another vector
    pub fn cosine_similarity(&self, other: &Vector) -> f32 {
        if self.dimensions.len() != other.dimensions.len() {
            return 0.0;
        }
        
        let dot_product: f32 = self.dimensions.iter()
            .zip(&other.dimensions)
            .map(|(a, b)| a * b)
            .sum();
        
        let magnitude_a = self.magnitude();
        let magnitude_b = other.magnitude();
        
        if magnitude_a == 0.0 || magnitude_b == 0.0 {
            0.0
        } else {
            dot_product / (magnitude_a * magnitude_b)
        }
    }
    
    /// Calculate L2 (Euclidean) distance
    pub fn l2_distance(&self, other: &Vector) -> f32 {
        if self.dimensions.len() != other.dimensions.len() {
            return f32::INFINITY;
        }
        
        self.dimensions.iter()
            .zip(&other.dimensions)
            .map(|(a, b)| (a - b).powi(2))
            .sum::<f32>()
            .sqrt()
    }
}

/// Document metadata for storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    /// Document type/category
    pub doc_type: Option<String>,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Custom metadata fields
    pub fields: HashMap<String, serde_json::Value>,
    /// Source information
    pub source: Option<String>,
    /// Creation timestamp
    pub created_at: DateTime<Utc>,
    /// Last updated timestamp
    pub updated_at: DateTime<Utc>,
}

impl Default for DocumentMetadata {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            doc_type: None,
            tags: Vec::new(),
            fields: HashMap::new(),
            source: None,
            created_at: now,
            updated_at: now,
        }
    }
}

/// Stored document with vector embedding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    /// Unique document identifier
    pub id: String,
    /// Document content/text
    pub content: String,
    /// Vector embedding of the content
    pub embedding: Vector,
    /// Document metadata
    pub metadata: DocumentMetadata,
    /// Storage timestamp
    pub stored_at: DateTime<Utc>,
}

/// Search result with similarity score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    /// Document ID
    pub id: String,
    /// Similarity score (0.0 to 1.0, higher is more similar)
    pub score: f32,
    /// Document content
    pub content: String,
    /// Document metadata
    pub metadata: DocumentMetadata,
    /// Distance metric used
    pub distance_metric: DistanceMetric,
}

/// Distance/similarity metrics
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum DistanceMetric {
    /// Cosine similarity (0.0 to 1.0, higher = more similar)
    CosineSimilarity,
    /// L2 Euclidean distance (0.0 to inf, lower = more similar)
    L2Distance,
    /// Dot product (higher = more similar)
    DotProduct,
}

/// Database statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseStats {
    /// Total number of documents
    pub total_documents: u64,
    /// Total number of vectors
    pub total_vectors: u64,
    /// Average vector dimension
    pub avg_dimension: usize,
    /// Database size in bytes
    pub size_bytes: u64,
    /// Index statistics
    pub index_stats: IndexStats,
    /// Performance metrics
    pub performance: PerformanceMetrics,
}

/// Index statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexStats {
    /// Number of indexed vectors
    pub indexed_vectors: u64,
    /// Index type (IVF, HNSW, etc.)
    pub index_type: String,
    /// Index size in bytes
    pub index_size_bytes: u64,
    /// Index build time
    pub build_time_ms: u64,
}

/// Performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    /// Average query time in milliseconds
    pub avg_query_time_ms: f64,
    /// Average insertion time in milliseconds
    pub avg_insert_time_ms: f64,
    /// Queries per second
    pub queries_per_second: f64,
    /// Cache hit rate (0.0 to 1.0)
    pub cache_hit_rate: f64,
}

/// Health status for database components
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    /// Vector store health
    pub store_healthy: bool,
    /// Embedding engine health
    pub embedder_healthy: bool,
    /// Overall system health
    pub overall_healthy: bool,
}

/// Query context for RAG operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryContext {
    /// Query ID for tracking
    pub query_id: Uuid,
    /// Original query text
    pub query: String,
    /// Retrieved documents
    pub documents: Vec<Document>,
    /// Search parameters used
    pub search_params: SearchParams,
    /// Query timestamp
    pub timestamp: DateTime<Utc>,
}

/// Search parameters for vector queries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchParams {
    /// Maximum number of results
    pub limit: usize,
    /// Minimum similarity threshold
    pub min_score: Option<f32>,
    /// Distance metric to use
    pub metric: DistanceMetric,
    /// Metadata filters
    pub filters: HashMap<String, serde_json::Value>,
    /// Whether to include document content in results
    pub include_content: bool,
    /// Whether to include metadata in results
    pub include_metadata: bool,
}

impl Default for SearchParams {
    fn default() -> Self {
        Self {
            limit: 10,
            min_score: None,
            metric: DistanceMetric::CosineSimilarity,
            filters: HashMap::new(),
            include_content: true,
            include_metadata: true,
        }
    }
}

/// Batch operation for multiple documents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchOperation {
    /// Operation type
    pub operation: BatchOperationType,
    /// Documents to process
    pub documents: Vec<DocumentInput>,
}

/// Batch operation types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BatchOperationType {
    /// Insert new documents
    Insert,
    /// Update existing documents
    Update,
    /// Delete documents
    Delete,
    /// Upsert (insert or update)
    Upsert,
}

/// Input document for batch operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentInput {
    /// Document ID
    pub id: String,
    /// Document content
    pub content: String,
    /// Optional metadata
    pub metadata: Option<DocumentMetadata>,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_vector_operations() {
        let v1 = Vector::new(vec![1.0, 2.0, 3.0]);
        let v2 = Vector::new(vec![4.0, 5.0, 6.0]);
        
        // Test magnitude
        assert!((v1.magnitude() - 3.7416573867739413).abs() < 1e-6);
        
        // Test cosine similarity
        let similarity = v1.cosine_similarity(&v2);
        assert!(similarity > 0.9); // Should be high similarity
        
        // Test L2 distance
        let distance = v1.l2_distance(&v2);
        assert!(distance > 0.0);
    }
    
    #[test]
    fn test_normalized_vector() {
        let v = Vector::normalized(vec![3.0, 4.0]);
        assert!((v.magnitude() - 1.0).abs() < 1e-6);
        assert!(v.normalized);
    }
    
    #[test]
    fn test_document_metadata() {
        let metadata = DocumentMetadata::default();
        assert!(metadata.tags.is_empty());
        assert!(metadata.fields.is_empty());
    }
    
    #[test]
    fn test_search_params_default() {
        let params = SearchParams::default();
        assert_eq!(params.limit, 10);
        assert_eq!(params.metric, DistanceMetric::CosineSimilarity);
        assert!(params.include_content);
        assert!(params.include_metadata);
    }
}