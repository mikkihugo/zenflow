//! RAG (Retrieval-Augmented Generation) engine implementation
//!
//! Provides complete RAG pipeline with document storage, semantic search,
//! context retrieval, and integration with AI reasoning plugins.

use crate::{
    types::*,
    error::VectorError,
    store::VectorStore,
    embeddings::EmbeddingEngine,
};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::Utc;
use std::collections::HashMap;

/// Complete RAG pipeline for retrieval-augmented generation
#[derive(Clone)]
pub struct RAGPipeline {
    store: Arc<VectorStore>,
    embedder: Arc<RwLock<EmbeddingEngine>>,
    config: RAGConfig,
}

/// Configuration for RAG pipeline
#[derive(Debug, Clone)]
pub struct RAGConfig {
    /// Default number of documents to retrieve
    pub default_k: usize,
    /// Minimum similarity threshold
    pub min_similarity: f32,
    /// Maximum context window size in tokens
    pub max_context_tokens: usize,
    /// Context overlap between chunks
    pub chunk_overlap: usize,
    /// Chunk size for document splitting
    pub chunk_size: usize,
    /// Whether to re-rank results
    pub enable_reranking: bool,
}

impl Default for RAGConfig {
    fn default() -> Self {
        Self {
            default_k: 5,
            min_similarity: 0.1,
            max_context_tokens: 4000,
            chunk_overlap: 200,
            chunk_size: 1000,
            enable_reranking: true,
        }
    }
}

impl RAGPipeline {
    /// Create new RAG pipeline
    pub fn new(store: Arc<VectorStore>, embedder: Arc<RwLock<EmbeddingEngine>>) -> Self {
        Self::with_config(store, embedder, RAGConfig::default())
    }
    
    /// Create RAG pipeline with custom configuration
    pub fn with_config(
        store: Arc<VectorStore>, 
        embedder: Arc<RwLock<EmbeddingEngine>>,
        config: RAGConfig
    ) -> Self {
        Self {
            store,
            embedder,
            config,
        }
    }
    
    /// Store document with automatic chunking and embedding
    pub async fn store_document(
        &self,
        id: &str,
        content: &str,
        metadata: Option<DocumentMetadata>
    ) -> Result<(), VectorError> {
        // Split document into chunks if it's too large
        let chunks = self.split_document(content);
        
        let embedder = self.embedder.read().await;
        let base_metadata = metadata.unwrap_or_default();
        
        for (i, chunk) in chunks.iter().enumerate() {
            let chunk_id = if chunks.len() > 1 {
                format!("{}_chunk_{}", id, i)
            } else {
                id.to_string()
            };
            
            // Generate embedding for chunk
            let embedding = embedder.embed_text(chunk).await?;
            
            // Create document with chunk-specific metadata
            let mut chunk_metadata = base_metadata.clone();
            chunk_metadata.fields.insert("chunk_index".to_string(), i.into());
            chunk_metadata.fields.insert("total_chunks".to_string(), chunks.len().into());
            chunk_metadata.fields.insert("parent_document".to_string(), id.into());
            
            let document = Document {
                id: chunk_id,
                content: chunk.clone(),
                embedding,
                metadata: chunk_metadata,
                stored_at: Utc::now(),
            };
            
            self.store.store_document(document).await?;
        }
        
        Ok(())
    }
    
    /// Perform semantic search and return relevant documents
    pub async fn semantic_search(&self, query: &str, k: usize) -> Result<Vec<SearchResult>, VectorError> {
        // Generate query embedding
        let embedder = self.embedder.read().await;
        let query_embedding = embedder.embed_text(query).await?;
        drop(embedder);
        
        // Search for similar documents
        let params = SearchParams {
            limit: k,
            min_score: Some(self.config.min_similarity),
            metric: DistanceMetric::CosineSimilarity,
            ..Default::default()
        };
        
        let mut results = self.store.search_vectors(&query_embedding, &params).await?;
        
        // Re-rank results if enabled
        if self.config.enable_reranking && results.len() > 1 {
            results = self.rerank_results(query, results).await?;
        }
        
        Ok(results)
    }
    
    /// Retrieve context for RAG generation
    pub async fn retrieve_context(&self, query: &str, k: Option<usize>) -> Result<QueryContext, VectorError> {
        let k = k.unwrap_or(self.config.default_k);
        let query_id = Uuid::new_v4();
        
        // Perform semantic search
        let search_results = self.semantic_search(query, k).await?;
        
        // Convert search results to documents
        let documents: Vec<Document> = search_results.into_iter().map(|result| {
            Document {
                id: result.id,
                content: result.content,
                embedding: Vector::new(vec![]), // Embedding not needed for context
                metadata: result.metadata,
                stored_at: Utc::now(),
            }
        }).collect();
        
        // Create query context
        let context = QueryContext {
            query_id,
            query: query.to_string(),
            documents,
            search_params: SearchParams {
                limit: k,
                min_score: Some(self.config.min_similarity),
                metric: DistanceMetric::CosineSimilarity,
                ..Default::default()
            },
            timestamp: Utc::now(),
        };
        
        Ok(context)
    }
    
    /// Format retrieved context for LLM consumption
    pub fn format_context(&self, context: &QueryContext, max_tokens: Option<usize>) -> String {
        let max_tokens = max_tokens.unwrap_or(self.config.max_context_tokens);
        
        let mut formatted_context = String::new();
        formatted_context.push_str(&format!("Query: {}\n\n", context.query));
        formatted_context.push_str("Relevant Documents:\n\n");
        
        let mut current_tokens = self.estimate_tokens(&formatted_context);
        
        for (i, doc) in context.documents.iter().enumerate() {
            let doc_text = format!(
                "Document {}: {}\nSource: {}\n\n{}\n\n---\n\n",
                i + 1,
                doc.id,
                doc.metadata.source.as_deref().unwrap_or("Unknown"),
                doc.content
            );
            
            let doc_tokens = self.estimate_tokens(&doc_text);
            
            // Stop adding documents if we exceed token limit
            if current_tokens + doc_tokens > max_tokens {
                if i == 0 {
                    // Include at least one document, truncating if necessary
                    let truncated = self.truncate_to_tokens(&doc_text, max_tokens - current_tokens);
                    formatted_context.push_str(&truncated);
                }
                break;
            }
            
            formatted_context.push_str(&doc_text);
            current_tokens += doc_tokens;
        }
        
        formatted_context
    }
    
    /// Perform complete RAG workflow: retrieve context + format for generation
    pub async fn rag_retrieve(&self, query: &str, options: Option<RAGOptions>) -> Result<RAGResult, VectorError> {
        let options = options.unwrap_or_default();
        
        // Retrieve context
        let context = self.retrieve_context(query, Some(options.k)).await?;
        
        // Format context for generation
        let formatted_context = self.format_context(&context, Some(options.max_tokens));
        
        // Calculate relevance scores
        let relevance_scores: Vec<f32> = context.documents.iter()
            .enumerate()
            .map(|(i, _)| {
                // Simple relevance scoring based on position
                1.0 - (i as f32 / context.documents.len() as f32) * 0.5
            })
            .collect();
        
        Ok(RAGResult {
            query: context.query.clone(),
            context,
            formatted_context,
            relevance_scores,
            total_documents_found: context.documents.len(),
            processing_time_ms: 0, // TODO: Add timing
        })
    }
    
    /// Split document into chunks
    fn split_document(&self, content: &str) -> Vec<String> {
        if content.len() <= self.config.chunk_size {
            return vec![content.to_string()];
        }
        
        let mut chunks = Vec::new();
        let words: Vec<&str> = content.split_whitespace().collect();
        let mut current_chunk = String::new();
        let mut word_count = 0;
        
        for word in words {
            if current_chunk.len() + word.len() + 1 > self.config.chunk_size && !current_chunk.is_empty() {
                chunks.push(current_chunk.clone());
                
                // Create overlap
                let overlap_words = word_count.saturating_sub(self.config.chunk_overlap / 10);
                current_chunk = words[overlap_words..word_count]
                    .join(" ")
                    .to_string();
            }
            
            if !current_chunk.is_empty() {
                current_chunk.push(' ');
            }
            current_chunk.push_str(word);
            word_count += 1;
        }
        
        if !current_chunk.is_empty() {
            chunks.push(current_chunk);
        }
        
        chunks
    }
    
    /// Re-rank search results using advanced scoring
    async fn rerank_results(&self, query: &str, mut results: Vec<SearchResult>) -> Result<Vec<SearchResult>, VectorError> {
        // Simple re-ranking based on query term overlap
        let query_terms: Vec<&str> = query.to_lowercase().split_whitespace().collect();
        
        for result in &mut results {
            let content_lower = result.content.to_lowercase();
            let term_overlap = query_terms.iter()
                .filter(|term| content_lower.contains(**term))
                .count() as f32 / query_terms.len() as f32;
            
            // Combine similarity score with term overlap
            result.score = result.score * 0.7 + term_overlap * 0.3;
        }
        
        // Sort by adjusted score
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        
        Ok(results)
    }
    
    /// Estimate token count (rough approximation)
    fn estimate_tokens(&self, text: &str) -> usize {
        // Rough approximation: 1 token ≈ 4 characters
        text.len() / 4
    }
    
    /// Truncate text to fit within token limit
    fn truncate_to_tokens(&self, text: &str, max_tokens: usize) -> String {
        let max_chars = max_tokens * 4; // Rough approximation
        if text.len() <= max_chars {
            text.to_string()
        } else {
            format!("{}...", &text[..max_chars.saturating_sub(3)])
        }
    }
}

/// Options for RAG retrieval
#[derive(Debug, Clone)]
pub struct RAGOptions {
    /// Number of documents to retrieve
    pub k: usize,
    /// Maximum context tokens
    pub max_tokens: usize,
    /// Whether to enable re-ranking
    pub enable_reranking: bool,
}

impl Default for RAGOptions {
    fn default() -> Self {
        Self {
            k: 5,
            max_tokens: 4000,
            enable_reranking: true,
        }
    }
}

/// Result of RAG retrieval operation
#[derive(Debug, Clone)]
pub struct RAGResult {
    /// Original query
    pub query: String,
    /// Query context with retrieved documents
    pub context: QueryContext,
    /// Formatted context ready for LLM
    pub formatted_context: String,
    /// Relevance scores for each document
    pub relevance_scores: Vec<f32>,
    /// Total number of documents found
    pub total_documents_found: usize,
    /// Processing time in milliseconds
    pub processing_time_ms: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::embeddings::EmbeddingEngine;
    use crate::store::VectorStore;
    
    async fn create_test_rag() -> RAGPipeline {
        let store = Arc::new(VectorStore::in_memory().await.unwrap());
        let embedder = Arc::new(RwLock::new(EmbeddingEngine::default().await.unwrap()));
        RAGPipeline::new(store, embedder)
    }
    
    #[tokio::test]
    async fn test_document_storage() {
        let rag = create_test_rag().await;
        
        let result = rag.store_document(
            "test1",
            "This is a test document about artificial intelligence",
            None
        ).await;
        
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_semantic_search() {
        let rag = create_test_rag().await;
        
        // Store test document
        rag.store_document(
            "test1", 
            "Artificial intelligence and machine learning are related fields",
            None
        ).await.unwrap();
        
        // Search for similar content
        let results = rag.semantic_search("AI and ML", 5).await.unwrap();
        
        assert!(!results.is_empty());
        assert!(results[0].score > 0.0);
    }
    
    #[tokio::test]
    async fn test_context_retrieval() {
        let rag = create_test_rag().await;
        
        // Store test documents
        rag.store_document(
            "doc1",
            "Machine learning is a subset of artificial intelligence",
            None
        ).await.unwrap();
        
        rag.store_document(
            "doc2", 
            "Deep learning uses neural networks with multiple layers",
            None
        ).await.unwrap();
        
        // Retrieve context
        let context = rag.retrieve_context("What is machine learning?", Some(2)).await.unwrap();
        
        assert_eq!(context.query, "What is machine learning?");
        assert!(!context.documents.is_empty());
    }
    
    #[tokio::test]
    async fn test_rag_workflow() {
        let rag = create_test_rag().await;
        
        // Store test document
        rag.store_document(
            "guide",
            "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to natural intelligence displayed by animals including humans.",
            None
        ).await.unwrap();
        
        // Perform full RAG workflow
        let result = rag.rag_retrieve("What is AI?", None).await.unwrap();
        
        assert!(!result.formatted_context.is_empty());
        assert!(result.formatted_context.contains("Query: What is AI?"));
        assert!(result.total_documents_found > 0);
    }
    
    #[test]
    fn test_document_chunking() {
        let rag = RAGPipeline::new(
            Arc::new(VectorStore::in_memory().await.unwrap()),
            Arc::new(RwLock::new(EmbeddingEngine::default().await.unwrap()))
        );
        
        let long_content = "word ".repeat(300); // 300 words
        let chunks = rag.split_document(&long_content);
        
        assert!(chunks.len() > 1);
        for chunk in &chunks {
            assert!(chunk.len() <= rag.config.chunk_size);
        }
    }
}