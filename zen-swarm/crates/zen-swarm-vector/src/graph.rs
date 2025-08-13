//! File-based Graph Neural Network implementation for document relationships
//! 
//! This module provides graph-based analysis of code relationships, imports,
//! and semantic connections between documents. All graphs are stored as files
//! for easy inspection and version control.

use crate::{VectorError, types::*};
use petgraph::{Graph, Directed, NodeIndex};
use serde::{Serialize, Deserialize};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::Arc,
};
use tokio::fs;

/// Node in the document relationship graph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentNode {
    pub id: String,
    pub file_path: PathBuf,
    pub doc_type: DocumentType,
    pub metadata: HashMap<String, String>,
    pub embedding_vector: Option<Vec<f32>>,
}

/// Edge representing relationship between documents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentEdge {
    pub relationship_type: RelationshipType,
    pub strength: f32,  // 0.0 - 1.0
    pub metadata: HashMap<String, String>,
}

/// Types of relationships between documents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    Imports,         // File imports another
    References,      // File references another
    Extends,         // Class/interface extension
    Implements,      // Interface implementation  
    Calls,           // Function calls
    Depends,         // General dependency
    Similar,         // Semantic similarity
    Parent,          // Directory parent
    Child,           // Directory child
}

/// File-based graph storage for document relationships
pub struct FileBasedGraph {
    graph: Graph<DocumentNode, DocumentEdge, Directed>,
    node_index_map: HashMap<String, NodeIndex>,
    storage_path: PathBuf,
}

impl FileBasedGraph {
    /// Create new file-based graph
    pub fn new<P: AsRef<Path>>(storage_path: P) -> Self {
        Self {
            graph: Graph::new(),
            node_index_map: HashMap::new(),
            storage_path: storage_path.as_ref().to_path_buf(),
        }
    }

    /// Load graph from file
    pub async fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Self, VectorError> {
        let content = fs::read(path).await
            .map_err(|e| VectorError::Storage(format!("Failed to read graph file: {}", e)))?;
        
        let graph_data: SerializableGraph = bincode::deserialize(&content)
            .map_err(|e| VectorError::Storage(format!("Failed to deserialize graph: {}", e)))?;
        
        let mut instance = Self::new(graph_data.storage_path);
        instance.graph = graph_data.graph;
        
        // Rebuild node index map
        for node_index in instance.graph.node_indices() {
            if let Some(node) = instance.graph.node_weight(node_index) {
                instance.node_index_map.insert(node.id.clone(), node_index);
            }
        }
        
        Ok(instance)
    }

    /// Save graph to file
    pub async fn save_to_file(&self) -> Result<(), VectorError> {
        let graph_data = SerializableGraph {
            graph: self.graph.clone(),
            storage_path: self.storage_path.clone(),
        };
        
        let serialized = bincode::serialize(&graph_data)
            .map_err(|e| VectorError::Storage(format!("Failed to serialize graph: {}", e)))?;
        
        fs::write(&self.storage_path, serialized).await
            .map_err(|e| VectorError::Storage(format!("Failed to write graph file: {}", e)))?;
        
        Ok(())
    }

    /// Add document node to graph
    pub fn add_document(&mut self, doc: DocumentNode) -> NodeIndex {
        if let Some(&existing_index) = self.node_index_map.get(&doc.id) {
            // Update existing node
            if let Some(node) = self.graph.node_weight_mut(existing_index) {
                *node = doc;
            }
            existing_index
        } else {
            // Add new node
            let node_index = self.graph.add_node(doc.clone());
            self.node_index_map.insert(doc.id.clone(), node_index);
            node_index
        }
    }

    /// Add relationship edge between documents
    pub fn add_relationship(
        &mut self, 
        source_id: &str, 
        target_id: &str, 
        edge: DocumentEdge
    ) -> Result<(), VectorError> {
        let source_index = self.node_index_map.get(source_id)
            .ok_or_else(|| VectorError::Query(format!("Source node not found: {}", source_id)))?;
        
        let target_index = self.node_index_map.get(target_id)
            .ok_or_else(|| VectorError::Query(format!("Target node not found: {}", target_id)))?;
        
        self.graph.add_edge(*source_index, *target_index, edge);
        Ok(())
    }

    /// Find documents similar to given document
    pub fn find_similar_documents(&self, doc_id: &str, max_results: usize) -> Vec<SimilarDocument> {
        let mut results = Vec::new();
        
        if let Some(&node_index) = self.node_index_map.get(doc_id) {
            if let Some(source_node) = self.graph.node_weight(node_index) {
                if let Some(source_embedding) = &source_node.embedding_vector {
                    for (other_id, &other_index) in &self.node_index_map {
                        if other_id == doc_id { continue; }
                        
                        if let Some(other_node) = self.graph.node_weight(other_index) {
                            if let Some(other_embedding) = &other_node.embedding_vector {
                                let similarity = cosine_similarity(source_embedding, other_embedding);
                                
                                results.push(SimilarDocument {
                                    id: other_id.clone(),
                                    file_path: other_node.file_path.clone(),
                                    similarity_score: similarity,
                                    doc_type: other_node.doc_type.clone(),
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // Sort by similarity and take top results
        results.sort_by(|a, b| b.similarity_score.partial_cmp(&a.similarity_score).unwrap());
        results.truncate(max_results);
        results
    }

    /// Get direct dependencies of a document
    pub fn get_dependencies(&self, doc_id: &str) -> Vec<String> {
        let mut dependencies = Vec::new();
        
        if let Some(&node_index) = self.node_index_map.get(doc_id) {
            for edge_ref in self.graph.edges(node_index) {
                let edge = edge_ref.weight();
                match edge.relationship_type {
                    RelationshipType::Imports | 
                    RelationshipType::References | 
                    RelationshipType::Depends => {
                        if let Some(target_node) = self.graph.node_weight(edge_ref.target()) {
                            dependencies.push(target_node.id.clone());
                        }
                    }
                    _ => {}
                }
            }
        }
        
        dependencies
    }

    /// Export graph to DOT format for visualization
    pub async fn export_to_dot<P: AsRef<Path>>(&self, output_path: P) -> Result<(), VectorError> {
        use std::fmt::Write;
        
        let mut dot_content = String::new();
        writeln!(dot_content, "digraph DocumentGraph {{")?;
        writeln!(dot_content, "  rankdir=LR;")?;
        
        // Add nodes
        for node_index in self.graph.node_indices() {
            if let Some(node) = self.graph.node_weight(node_index) {
                writeln!(dot_content, "  \"{}\" [label=\"{}\\n{:?}\"];", 
                    node.id, 
                    node.file_path.file_name().unwrap_or_default().to_string_lossy(),
                    node.doc_type
                )?;
            }
        }
        
        // Add edges
        for edge_ref in self.graph.edge_references() {
            let source = self.graph.node_weight(edge_ref.source()).unwrap();
            let target = self.graph.node_weight(edge_ref.target()).unwrap();
            let edge = edge_ref.weight();
            
            writeln!(dot_content, "  \"{}\" -> \"{}\" [label=\"{:?}\" weight=\"{:.2}\"];",
                source.id,
                target.id, 
                edge.relationship_type,
                edge.strength
            )?;
        }
        
        writeln!(dot_content, "}}")?;
        
        fs::write(output_path, dot_content).await
            .map_err(|e| VectorError::Storage(format!("Failed to write DOT file: {}", e)))?;
        
        Ok(())
    }

    /// Get graph statistics
    pub fn stats(&self) -> GraphStats {
        GraphStats {
            node_count: self.graph.node_count(),
            edge_count: self.graph.edge_count(),
            storage_path: self.storage_path.clone(),
        }
    }
}

/// Serializable version of the graph for file storage
/// Using petgraph's built-in serde support (feature "serde-1")
#[derive(Serialize, Deserialize)]
struct SerializableGraph {
    graph: Graph<DocumentNode, DocumentEdge, Directed>,
    storage_path: PathBuf,
}

/// Similar document result
#[derive(Debug, Clone)]
pub struct SimilarDocument {
    pub id: String,
    pub file_path: PathBuf,
    pub similarity_score: f32,
    pub doc_type: DocumentType,
}

/// Graph statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphStats {
    pub node_count: usize,
    pub edge_count: usize,
    pub storage_path: PathBuf,
}

/// Calculate cosine similarity between two vectors
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() { return 0.0; }
    
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot_product / (norm_a * norm_b)
    }
}

impl std::fmt::Error for VectorError {
    fn fmt(&self, _f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        Ok(())
    }
}