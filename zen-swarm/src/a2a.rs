//! Agent-to-Agent (A2A) Communication Protocol
//!
//! The A2A protocol enables zen-swarm repository daemons to communicate
//! with zen-orchestrator (running inside THE COLLECTIVE). This is the
//! gateway protocol that connects distributed repository daemons to
//! THE COLLECTIVE's centralized intelligence services.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use chrono::{DateTime, Utc};

/// A2A messages sent from zen-swarm daemons to zen-orchestrator
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum A2AMessage {
    /// Repository daemon registration
    SwarmRegistration {
        swarm_id: String,
        repository_path: String,
        capabilities: Vec<String>,
        daemon_port: u16,
    },
    
    /// LLM intelligence request from repository daemon
    IntelligenceRequest {
        request_id: String,
        swarm_id: String,
        task_description: String,
        preferred_llm: String,
        context: RepositoryContext,
        priority: Priority,
    },
    
    /// Repository intelligence sharing
    RepositoryIntelligence {
        swarm_id: String,
        patterns: Vec<CodePattern>,
        optimizations: Vec<BuildOptimization>,
        domain_knowledge: HashMap<String, String>,
    },
    
    /// Task coordination request
    TaskCoordination {
        task_id: String,
        requesting_swarm: String,
        task_type: TaskType,
        requirements: TaskRequirements,
    },
    
    /// Heartbeat from repository daemon
    SwarmHeartbeat {
        swarm_id: String,
        timestamp: DateTime<Utc>,
        status: SwarmStatus,
        metrics: SwarmMetrics,
    },
    
    /// Service discovery - what capabilities are available
    CapabilityDiscovery {
        request_id: String,
        requesting_swarm: String,
        requested_capabilities: Vec<String>,
    },
}

/// Repository context provided with requests
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepositoryContext {
    pub working_directory: String,
    pub relevant_files: Vec<String>,
    pub build_system: Option<String>,
    pub test_framework: Option<String>,
    pub domain_area: Option<String>,
}

/// Priority levels for requests
#[derive(Debug, Clone, Serialize, Deserialize, PartialOrd, Ord, PartialEq, Eq)]
pub enum Priority {
    Low,
    Normal,
    High,
    Critical,
}

/// Code patterns discovered by repository daemons
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodePattern {
    pub pattern_id: String,
    pub pattern_type: String,
    pub description: String,
    pub confidence: f32,
    pub usage_frequency: u32,
}

/// Build optimizations found by repository daemons
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildOptimization {
    pub optimization_id: String,
    pub optimization_type: String,
    pub description: String,
    pub performance_gain: f32,
    pub success_rate: f32,
}

/// Task types that can be coordinated
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TaskType {
    LLMInference,
    NeuralTraining,
    CodeGeneration,
    RepositoryAnalysis,
    CrossRepoPatternSharing,
}

/// Task requirements specification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRequirements {
    pub compute_resources: Option<ComputeRequirements>,
    pub llm_models: Vec<String>,
    pub neural_capabilities: Vec<String>,
    pub estimated_duration_ms: Option<u64>,
}

/// Compute resource requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputeRequirements {
    pub cpu_cores: Option<u32>,
    pub memory_gb: Option<f32>,
    pub gpu_memory_gb: Option<f32>,
    pub storage_gb: Option<f32>,
}

/// Status of a repository daemon
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SwarmStatus {
    Healthy,
    Degraded { issues: Vec<String> },
    Unhealthy { errors: Vec<String> },
    Busy { active_tasks: u32 },
}

/// Performance metrics from repository daemons
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwarmMetrics {
    pub tasks_processed: u64,
    pub average_response_time_ms: f64,
    pub error_rate: f32,
    pub cpu_usage: f32,
    pub memory_usage: f32,
    pub disk_usage: f32,
}

/// A2A responses sent from zen-orchestrator back to zen-swarm daemons
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum A2AResponse {
    /// Registration acknowledgment
    RegistrationAck {
        swarm_id: String,
        assigned_capabilities: Vec<String>,
        collective_endpoints: HashMap<String, String>,
    },
    
    /// Intelligence response with LLM result
    IntelligenceResponse {
        request_id: String,
        result: IntelligenceResult,
        model_used: String,
        provider: String,
        processing_time_ms: u64,
    },
    
    /// Available capabilities announcement
    CapabilitiesAnnouncement {
        request_id: String,
        available_llms: Vec<AvailableLLM>,
        neural_services: Vec<NeuralService>,
        compute_resources: ComputeAvailability,
    },
    
    /// Cross-repository patterns to apply
    PatternSharing {
        patterns: Vec<SharedPattern>,
        from_repositories: Vec<String>,
        confidence_threshold: f32,
    },
    
    /// Task coordination response
    TaskCoordinationResponse {
        task_id: String,
        assigned_resources: Vec<String>,
        estimated_completion: DateTime<Utc>,
        dependencies: Vec<String>,
    },
    
    /// Error response
    Error {
        request_id: Option<String>,
        error_code: String,
        message: String,
        retry_after_ms: Option<u64>,
    },
}

/// Intelligence processing result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelligenceResult {
    pub content: String,
    pub reasoning: Option<String>,
    pub confidence: f32,
    pub sources: Vec<String>,
    pub token_usage: TokenUsage,
}

/// Token usage tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

/// Available LLM information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailableLLM {
    pub model_id: String,
    pub provider: String,
    pub capabilities: Vec<String>,
    pub cost_per_token: Option<f64>,
    pub rate_limit: Option<u32>,
    pub current_load: f32,
}

/// Neural service information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeuralService {
    pub service_id: String,
    pub service_type: String,
    pub capabilities: Vec<String>,
    pub availability: f32,
}

/// Compute resource availability
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputeAvailability {
    pub cpu_cores_available: u32,
    pub memory_gb_available: f32,
    pub gpu_memory_gb_available: f32,
    pub storage_gb_available: f32,
}

/// Patterns shared from other repositories
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedPattern {
    pub pattern_id: String,
    pub pattern_type: String,
    pub description: String,
    pub source_repository: String,
    pub success_rate: f32,
    pub adaptation_notes: String,
}

/// A2A server that runs inside zen-orchestrator (THE COLLECTIVE)
#[derive(Debug)]
pub struct A2AServer {
    /// Server configuration
    config: A2AServerConfig,
    
    /// Registered repository daemons
    registered_swarms: Arc<RwLock<HashMap<String, RegisteredSwarm>>>,
    
    /// THE COLLECTIVE service endpoints
    collective_services: Arc<CollectiveServices>,
    
    /// Message processing channels
    message_sender: mpsc::UnboundedSender<A2AMessage>,
    response_channels: Arc<RwLock<HashMap<String, mpsc::UnboundedSender<A2AResponse>>>>,
}

/// Configuration for A2A server
#[derive(Debug, Clone)]
pub struct A2AServerConfig {
    pub server_id: String,
    pub listen_port: u16,
    pub max_connections: u32,
    pub heartbeat_timeout_sec: u64,
    pub message_timeout_ms: u64,
}

/// Information about registered repository daemon
#[derive(Debug, Clone)]
pub struct RegisteredSwarm {
    pub swarm_id: String,
    pub repository_path: String,
    pub capabilities: Vec<String>,
    pub daemon_port: u16,
    pub last_heartbeat: DateTime<Utc>,
    pub status: SwarmStatus,
    pub metrics: SwarmMetrics,
}

/// THE COLLECTIVE services interface - zen-orchestrator is PART OF zen-code binary
/// 
/// TWO-BINARY ARCHITECTURE:
/// zen-code binary (THE COLLECTIVE + zen-orchestrator + neural + web) ↔ zen-swarm binary (daemon)
/// 
/// zen-orchestrator is compiled INTO zen-code binary as coordination layer
/// Provides A2A protocol communication with zen-swarm daemons
pub struct CollectiveServices {
    /// LLM routing and management - BRIDGE TO zen-code infrastructure
    llm_coordinator: Arc<dyn LLMCoordinator>,
    
    /// Neural network services - DIRECT library integration for performance
    neural_services: Arc<dyn NeuralServices>,
    
    /// Cross-repository intelligence
    intelligence_hub: Arc<dyn IntelligenceHub>,
    
    /// Direct zen-neural network access - HIGH PERFORMANCE PATH
    zen_neural: Arc<zen_neural::NeuralNetwork>,
    
    /// Direct zen-forecasting engine access - TIME SERIES OPTIMIZED
    zen_forecasting: Arc<zen_forecasting::ForecastingEngine>,
    
    /// Direct zen-compute acceleration access - GPU/WASM OPTIMIZED
    zen_compute: Arc<zen_compute::ComputeEngine>,
    
    /// DIRECT access to zen-code's unified Cozy + Lance database system
    /// Cozy: Documents, ACID transactions, graph-like queries (.zen/collective/cozy/)
    /// Lance: Vector embeddings, similarity search (.zen/collective/lance/)
    collective_database: Arc<dyn ExistingCollectiveDatabase>,
}

impl std::fmt::Debug for CollectiveServices {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("CollectiveServices")
            .field("llm_coordinator", &"Arc<dyn LLMCoordinator> (bridge to zen-code)")
            .field("neural_services", &"Arc<dyn NeuralServices> (direct integration)")
            .field("intelligence_hub", &"Arc<dyn IntelligenceHub>")
            .field("zen_neural", &"Arc<zen_neural::NeuralNetwork> (direct)")
            .field("zen_forecasting", &"Arc<zen_forecasting::ForecastingEngine> (direct)")
            .field("zen_compute", &"Arc<zen_compute::ComputeEngine> (direct)")
            .field("collective_database", &"Arc<dyn ExistingCollectiveDatabase> (zen-code's Cozy+Lance)")
            .finish()
    }
}

/// LLM coordination interface - BRIDGE to zen-code's existing infrastructure
/// DO NOT reimplement - leverage existing multi-provider routing system
pub trait LLMCoordinator: Send + Sync {
    /// Route LLM request to zen-code's existing infrastructure
    /// Uses zen-code's sophisticated multi-provider routing (Claude, Gemini, GitHub Models, Copilot)
    fn route_llm_request(&self, request: A2AMessage) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<IntelligenceResult, A2AError>> + Send + '_>>;
    
    /// Get available models from zen-code's LLM stats service
    fn get_available_models(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<AvailableLLM>, A2AError>> + Send + '_>>;
    
    /// Get LLM system health from zen-code's internal monitoring
    fn get_llm_system_health(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<ZenCodeLLMHealth, A2AError>> + Send + '_>>;
}

/// Neural services interface - DIRECT library integration in zen-code binary
/// zen-orchestrator (part of zen-code) provides high-performance neural capabilities
pub trait NeuralServices: Send + Sync {
    /// Execute coordinated neural task (combines multiple libraries as needed)
    fn execute_neural_task(&self, task: NeuralTaskRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<TaskResult, A2AError>> + Send + '_>>;
    
    /// Get available neural capabilities from ALL integrated libraries
    fn get_neural_capabilities(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<NeuralService>, A2AError>> + Send + '_>>;
    
    /// DIRECT zen-neural network inference (fastest path)
    fn zen_neural_forward(&self, input: &[f32], network_config: Option<serde_json::Value>) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<f32>, A2AError>> + Send + '_>>;
    
    /// DIRECT zen-forecasting time series prediction
    fn zen_forecasting_predict(&self, time_series: &[f64], horizon: usize, model_config: Option<serde_json::Value>) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<ForecastResult, A2AError>> + Send + '_>>;
    
    /// DIRECT zen-compute GPU/WASM acceleration
    fn zen_compute_execute(&self, task: ComputeTaskRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<ComputeResult, A2AError>> + Send + '_>>;
    
    /// Get neural processing health and performance metrics
    fn get_neural_health(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<NeuralHealthStatus, A2AError>> + Send + '_>>;
    
    /// DIRECT zen-compute for GPU/WASM acceleration
    fn execute_zen_compute(&self, task: zen_compute::ComputeTask) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<zen_compute::ComputeResult, A2AError>> + Send + '_>>;
    
    /// DIRECT access to THE COLLECTIVE's database query system
    fn database_query(&self, query: CollectiveQuery) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<CollectiveResult, A2AError>> + Send + '_>>;
    
    /// DIRECT access to THE COLLECTIVE's vector search (LanceDB)
    fn vector_search(&self, query: &[f32], collection: &str, top_k: usize) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<VectorMatch>, A2AError>> + Send + '_>>;
    
    /// Access THE COLLECTIVE's unified Cozy + Lance system
    fn cozy_query(&self, request: CozyQueryRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<CozyResponse, A2AError>> + Send + '_>>;
    
    /// Vector search via THE COLLECTIVE's Lance system
    fn lance_search(&self, request: LanceSearchRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<LanceSearchResponse, A2AError>> + Send + '_>>;
}

/// Intelligence hub interface - using boxed futures for dyn compatibility
pub trait IntelligenceHub: Send + Sync {
    fn share_repository_intelligence(&self, intelligence: A2AMessage) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<(), A2AError>> + Send + '_>>;
    fn get_cross_repo_patterns(&self, domain: &str) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<Vec<SharedPattern>, A2AError>> + Send + '_>>;
}

/// Task execution result - enhanced for hybrid architecture
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub task_id: String,
    pub success: bool,
    pub result_data: serde_json::Value,
    pub processing_time_ms: u64,
    pub execution_path: ExecutionPath,
    pub resource_usage: ResourceUsage,
}

/// Execution path taken for the task
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExecutionPath {
    /// Direct zen-neural library access (fastest)
    DirectZenNeural,
    /// Direct zen-forecasting library access
    DirectZenForecasting,
    /// Direct zen-compute library access
    DirectZenCompute,
    /// Lance vector database query
    LanceVectorDB,
    /// Bridge to zen-code LLM infrastructure
    ZenCodeLLMBridge,
    /// Coordinated multi-library execution
    HybridExecution,
}

/// Resource usage tracking for performance optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub cpu_time_ms: u64,
    pub memory_mb: f32,
    pub gpu_time_ms: Option<u64>,
    pub vector_operations: Option<u32>,
    pub neural_forward_passes: Option<u32>,
}

/// Bridge to zen-code LLM health system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZenCodeLLMHealth {
    pub overall_health: String,
    pub active_providers: Vec<String>,
    pub system_throughput: f32,
    pub average_latency_ms: f32,
    pub error_rate: f32,
}

/// Interface for zen-orchestrator PLUGIN to access THE COLLECTIVE's unified database
/// THE COLLECTIVE = zen-code with unified Cozy + Lance system
/// - Cozy: Documents, ACID transactions, graph-like queries (npm: cozy-client)
/// - Lance: Vector embeddings, similarity search (Node.js bindings)
/// zen-orchestrator PLUGIN uses this unified system via TypeScript bridge
pub trait ExistingCollectiveDatabase: Send + Sync {
    /// Query THE COLLECTIVE's unified Cozy database (documents, ACID, graph-like)
    fn cozy_query(&self, request: CozyQueryRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<CozyResponse, A2AError>> + Send + '_>>;
    
    /// Execute ACID transactions on THE COLLECTIVE's Cozy database
    fn cozy_transaction(&self, request: CozyTransactionRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<CozyTransactionResponse, A2AError>> + Send + '_>>;
    
    /// Vector search on THE COLLECTIVE's Lance database
    fn lance_search(&self, request: LanceSearchRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<LanceSearchResponse, A2AError>> + Send + '_>>;
    
    /// Store vectors in THE COLLECTIVE's Lance database
    fn lance_store(&self, request: LanceStoreRequest) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<LanceStoreResponse, A2AError>> + Send + '_>>;
    
    /// Get health of THE COLLECTIVE's unified Cozy + Lance system
    fn database_health(&self) -> std::pin::Pin<Box<dyn std::future::Future<Output = Result<UnifiedDatabaseHealth, A2AError>> + Send + '_>>;
}

/// Cozy query request for THE COLLECTIVE's unified document database
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyQueryRequest {
    pub doc_type: String,                    // Document type/collection
    pub selector: serde_json::Value,         // CouchDB-style selector
    pub fields: Option<Vec<String>>,         // Fields to return
    pub sort: Option<Vec<serde_json::Value>>, // Sort specification
    pub limit: Option<u32>,
    pub skip: Option<u32>,
    pub bookmark: Option<String>,            // For pagination
}

/// Cozy transaction request for ACID operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyTransactionRequest {
    pub operations: Vec<CozyOperation>,
    pub atomic: bool,                        // Ensure ACID compliance
}

/// Individual Cozy operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyOperation {
    pub operation_type: String,              // "create", "update", "delete", "find"
    pub doc_type: String,
    pub data: serde_json::Value,
    pub selector: Option<serde_json::Value>,  // For updates/deletes
}

/// Lance vector search request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceSearchRequest {
    pub collection: String,
    pub query_vector: Vec<f32>,
    pub limit: u32,
    pub metric_type: Option<String>,         // "cosine", "euclidean", "dot"
    pub filter: Option<serde_json::Value>,   // Metadata filter
}

/// Lance vector store request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceStoreRequest {
    pub collection: String,
    pub vectors: Vec<LanceVector>,
}

/// Lance vector with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceVector {
    pub id: String,
    pub embedding: Vec<f32>,
    pub metadata: serde_json::Value,
}

/// Database adapter types supported by zen-code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseAdapterType {
    PostgreSQL,
    MySQL,
    SQLite,
    Cozy,       // THE COLLECTIVE's unified document + ACID + graph database
    Lance,      // THE COLLECTIVE's unified vector database
    CozyLance,  // THE COLLECTIVE's unified Cozy + Lance system
    LanceDB,   // Vector database
}

/// Cozy response from THE COLLECTIVE's document database
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyResponse {
    pub success: bool,
    pub documents: Vec<CozyDocument>,
    pub total_count: u64,
    pub bookmark: Option<String>,            // For pagination
    pub execution_time_ms: u64,
    pub error: Option<String>,
}

/// Cozy document structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyDocument {
    pub id: String,
    pub doc_type: String,
    pub data: serde_json::Value,
    pub metadata: CozyDocumentMetadata,
}

/// Cozy document metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyDocumentMetadata {
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub version: String,
    pub tags: Vec<String>,
}

/// Cozy transaction response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyTransactionResponse {
    pub success: bool,
    pub operations_completed: u32,
    pub operations_failed: u32,
    pub execution_time_ms: u64,
    pub error: Option<String>,
}

/// Lance search response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceSearchResponse {
    pub success: bool,
    pub matches: Vec<LanceSearchMatch>,
    pub execution_time_ms: u64,
    pub error: Option<String>,
}

/// Lance search match result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceSearchMatch {
    pub id: String,
    pub score: f32,
    pub metadata: serde_json::Value,
    pub embedding: Option<Vec<f32>>,
}

/// Lance store response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceStoreResponse {
    pub success: bool,
    pub stored_count: u32,
    pub execution_time_ms: u64,
    pub error: Option<String>,
}

/// Unified health status for THE COLLECTIVE's Cozy + Lance system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedDatabaseHealth {
    pub overall_status: String,              // "healthy", "degraded", "error"
    pub cozy_status: CozyHealth,
    pub lance_status: LanceHealth,
    pub unified_performance: UnifiedPerformanceMetrics,
}

/// Cozy database health
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyHealth {
    pub status: String,
    pub total_documents: u64,
    pub collections_count: u32,
    pub average_query_time_ms: f64,
    pub transaction_success_rate: f32,
    pub storage_size_mb: f64,
}

/// Lance database health
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceHealth {
    pub status: String,
    pub total_vectors: u64,
    pub collections_count: u32,
    pub average_search_time_ms: f64,
    pub index_health: String,
    pub storage_size_mb: f64,
}

/// Unified performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedPerformanceMetrics {
    pub total_operations: u64,
    pub operations_per_second: f64,
    pub error_rate: f32,
    pub memory_usage_mb: f64,
    pub disk_usage_mb: f64,
}

/// Transaction execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionResult {
    pub success: bool,
    pub operations_executed: usize,
    pub total_affected_rows: i64,
    pub execution_time_ms: u64,
    pub rollback_reason: Option<String>,
}

/// Cozy query parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyQuery {
    pub selector: serde_json::Value,  // CouchDB-style selector
    pub limit: Option<u32>,
    pub skip: Option<u32>,
    pub sort: Option<Vec<serde_json::Value>>,
    pub fields: Option<Vec<String>>,
}

/// Document query result from Cozy (via zen-code npm bridge)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentResult {
    pub documents: Vec<CozyDocument>,
    pub total_count: u64,
    pub execution_time_ms: u64,
    pub has_more: bool,
    pub bookmark: Option<String>,  // For pagination
}

/// Cozy document structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyDocument {
    pub id: String,
    pub doc_type: String,
    pub data: serde_json::Value,
    pub metadata: CozyMetadata,
}

/// Cozy document metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CozyMetadata {
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub version: String,
    pub tags: Vec<String>,
}

/// Vector search match result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorMatch {
    pub id: String,
    pub score: f32,
    pub metadata: serde_json::Value,
    pub vector: Option<Vec<f32>>,
}

/// Database health response matching THE COLLECTIVE's existing API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseHealthResponse {
    pub success: bool,
    pub data: Option<DatabaseHealth>,
    pub error: Option<String>,
    pub metadata: DatabaseMetadata,
}

/// Database health data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseHealth {
    pub status: String,
    pub adapters: Vec<AdapterHealth>,
    pub connection_stats: Vec<PoolHealth>,
    pub performance: PerformanceStats,
}

/// Performance statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceStats {
    pub total_operations: u64,
    pub average_response_time: f64,
    pub success_rate: f64,
    pub error_rate: f64,
    pub operations_per_second: f64,
}

/// Database metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseMetadata {
    pub row_count: u32,
    pub execution_time: u64,
    pub timestamp: u64,
    pub adapter: String,
}

/// Individual adapter health
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdapterHealth {
    pub adapter_type: String,
    pub status: String,
    pub connection_count: u32,
    pub query_count: u64,
    pub error_rate: f32,
}

/// Connection pool health
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoolHealth {
    pub adapter: String,
    pub total_connections: u32,
    pub active_connections: u32,
    pub idle_connections: u32,
    pub utilization_percent: f32,
}

/// A2A protocol errors
#[derive(Debug, thiserror::Error)]
pub enum A2AError {
    #[error("Swarm registration failed: {0}")]
    RegistrationFailed(String),
    
    #[error("LLM request failed: {0}")]
    LLMRequestFailed(String),
    
    #[error("Neural service unavailable: {0}")]
    NeuralServiceUnavailable(String),
    
    #[error("Invalid message format: {0}")]
    InvalidMessageFormat(String),
    
    #[error("Timeout occurred: {0}")]
    Timeout(String),
    
    #[error("Internal server error: {0}")]
    InternalError(String),
}

pub type A2AResult<T> = Result<T, A2AError>;

impl A2AServer {
    /// Create new A2A server
    pub fn new(config: A2AServerConfig, collective_services: CollectiveServices) -> Self {
        let (message_sender, _message_receiver) = mpsc::unbounded_channel();
        
        Self {
            config,
            registered_swarms: Arc::new(RwLock::new(HashMap::new())),
            collective_services: Arc::new(collective_services),
            message_sender,
            response_channels: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Start the A2A server
    pub async fn start(&self) -> A2AResult<()> {
        tracing::info!("🌐 Starting A2A server on port {}", self.config.listen_port);
        
        // Start message processing loop
        self.start_message_processor().await;
        
        // Start heartbeat monitoring
        self.start_heartbeat_monitor().await;
        
        tracing::info!("✅ A2A server started successfully");
        Ok(())
    }
    
    /// Handle incoming A2A message from repository daemon
    pub async fn handle_message(&self, message: A2AMessage) -> A2AResult<A2AResponse> {
        tracing::debug!("📥 Received A2A message: {:?}", message);
        
        let message_clone = message.clone();
        match message {
            A2AMessage::SwarmRegistration { swarm_id, repository_path, capabilities, daemon_port } => {
                self.handle_swarm_registration(swarm_id, repository_path, capabilities, daemon_port).await
            }
            
            A2AMessage::IntelligenceRequest { request_id, swarm_id: _, task_description: _, preferred_llm: _, context: _, priority: _ } => {
                // Route to LLM coordinator
                let result = self.collective_services.llm_coordinator
                    .route_llm_request(message_clone)
                    .await?;
                
                Ok(A2AResponse::IntelligenceResponse {
                    request_id,
                    result,
                    model_used: "routed-model".to_string(),
                    provider: "collective".to_string(),
                    processing_time_ms: 100,
                })
            }
            
            A2AMessage::CapabilityDiscovery { request_id, requesting_swarm: _, requested_capabilities: _ } => {
                // Get available capabilities from THE COLLECTIVE
                let available_llms = self.collective_services.llm_coordinator.get_available_models().await?;
                let neural_services = self.collective_services.neural_services.get_neural_capabilities().await?;
                
                Ok(A2AResponse::CapabilitiesAnnouncement {
                    request_id,
                    available_llms,
                    neural_services,
                    compute_resources: ComputeAvailability {
                        cpu_cores_available: 16,
                        memory_gb_available: 64.0,
                        gpu_memory_gb_available: 24.0,
                        storage_gb_available: 1000.0,
                    },
                })
            }
            
            A2AMessage::SwarmHeartbeat { swarm_id, timestamp: _, status, metrics } => {
                // Update registered swarm status
                self.update_swarm_status(&swarm_id, status, metrics).await?;
                
                Ok(A2AResponse::RegistrationAck {
                    swarm_id,
                    assigned_capabilities: vec!["llm_routing".to_string()],
                    collective_endpoints: HashMap::new(),
                })
            }
            
            _ => {
                Ok(A2AResponse::Error {
                    request_id: None,
                    error_code: "UNSUPPORTED_MESSAGE".to_string(),
                    message: "Message type not supported".to_string(),
                    retry_after_ms: None,
                })
            }
        }
    }
    
    /// Handle swarm registration
    async fn handle_swarm_registration(
        &self,
        swarm_id: String,
        repository_path: String,
        capabilities: Vec<String>,
        daemon_port: u16,
    ) -> A2AResult<A2AResponse> {
        tracing::info!("📝 Registering swarm: {} at {}", swarm_id, repository_path);
        
        let registered_swarm = RegisteredSwarm {
            swarm_id: swarm_id.clone(),
            repository_path: repository_path.clone(),
            capabilities: capabilities.clone(),
            daemon_port,
            last_heartbeat: Utc::now(),
            status: SwarmStatus::Healthy,
            metrics: SwarmMetrics {
                tasks_processed: 0,
                average_response_time_ms: 0.0,
                error_rate: 0.0,
                cpu_usage: 0.0,
                memory_usage: 0.0,
                disk_usage: 0.0,
            },
        };
        
        self.registered_swarms.write().await.insert(swarm_id.clone(), registered_swarm);
        
        Ok(A2AResponse::RegistrationAck {
            swarm_id,
            assigned_capabilities: capabilities,
            collective_endpoints: self.get_collective_endpoints().await,
        })
    }
    
    /// Update swarm status from heartbeat
    async fn update_swarm_status(&self, swarm_id: &str, status: SwarmStatus, metrics: SwarmMetrics) -> A2AResult<()> {
        if let Some(swarm) = self.registered_swarms.write().await.get_mut(swarm_id) {
            swarm.last_heartbeat = Utc::now();
            swarm.status = status;
            swarm.metrics = metrics;
        }
        Ok(())
    }
    
    /// Get THE COLLECTIVE service endpoints
    async fn get_collective_endpoints(&self) -> HashMap<String, String> {
        let mut endpoints = HashMap::new();
        endpoints.insert("llm_coordinator".to_string(), "http://localhost:8080/llm".to_string());
        endpoints.insert("neural_services".to_string(), "http://localhost:8080/neural".to_string());
        endpoints.insert("intelligence_hub".to_string(), "http://localhost:8080/intelligence".to_string());
        endpoints
    }
    
    /// Start message processing background task
    async fn start_message_processor(&self) {
        tracing::debug!("🔄 Starting A2A message processor");
        // Message processing implementation would go here
    }
    
    /// Start heartbeat monitoring background task
    async fn start_heartbeat_monitor(&self) {
        let registered_swarms = self.registered_swarms.clone();
        let timeout_sec = self.config.heartbeat_timeout_sec;
        
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(30));
            
            loop {
                interval.tick().await;
                
                let mut swarms = registered_swarms.write().await;
                let now = Utc::now();
                
                swarms.retain(|swarm_id, swarm| {
                    let elapsed = now.signed_duration_since(swarm.last_heartbeat);
                    if elapsed.num_seconds() > timeout_sec as i64 {
                        tracing::warn!("💔 Swarm {} heartbeat timeout", swarm_id);
                        false
                    } else {
                        true
                    }
                });
            }
        });
    }
}

// Default implementation for CollectiveServices
impl Default for CollectiveServices {
    fn default() -> Self {
        use std::pin::Pin;
        use std::future::Future;
        
        struct MockLLMCoordinator;
        impl LLMCoordinator for MockLLMCoordinator {
            fn route_llm_request(&self, _request: A2AMessage) -> Pin<Box<dyn Future<Output = Result<IntelligenceResult, A2AError>> + Send + '_>> {
                Box::pin(async {
                    Ok(IntelligenceResult {
                        content: "Mock response".to_string(),
                        reasoning: None,
                        confidence: 0.8,
                        sources: vec![],
                        token_usage: TokenUsage { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
                    })
                })
            }
            
            fn get_available_models(&self) -> Pin<Box<dyn Future<Output = Result<Vec<AvailableLLM>, A2AError>> + Send + '_>> {
                Box::pin(async {
                    Ok(vec![AvailableLLM {
                        model_id: "mock-llm".to_string(),
                        provider: "collective".to_string(),
                        capabilities: vec!["text-generation".to_string()],
                        cost_per_token: Some(0.001),
                        rate_limit: Some(1000),
                        current_load: 0.5,
                    }])
                })
            }
        }
        
        struct MockNeuralServices;
        impl NeuralServices for MockNeuralServices {
            fn execute_neural_task(&self, _task: A2AMessage) -> Pin<Box<dyn Future<Output = Result<TaskResult, A2AError>> + Send + '_>> {
                Box::pin(async {
                    Ok(TaskResult {
                        task_id: "mock-task".to_string(),
                        success: true,
                        result_data: serde_json::json!({"result": "success"}),
                        processing_time_ms: 100,
                    })
                })
            }
            
            fn get_neural_capabilities(&self) -> Pin<Box<dyn Future<Output = Result<Vec<NeuralService>, A2AError>> + Send + '_>> {
                Box::pin(async {
                    Ok(vec![NeuralService {
                        service_id: "mock-neural".to_string(),
                        service_type: "training".to_string(),
                        capabilities: vec!["neural-training".to_string()],
                        availability: 1.0,
                    }])
                })
            }
        }
        
        struct MockIntelligenceHub;
        impl IntelligenceHub for MockIntelligenceHub {
            fn share_repository_intelligence(&self, _intelligence: A2AMessage) -> Pin<Box<dyn Future<Output = Result<(), A2AError>> + Send + '_>> {
                Box::pin(async { Ok(()) })
            }
            
            fn get_cross_repo_patterns(&self, _domain: &str) -> Pin<Box<dyn Future<Output = Result<Vec<SharedPattern>, A2AError>> + Send + '_>> {
                Box::pin(async { Ok(vec![]) })
            }
        }
        
        Self {
            llm_coordinator: Arc::new(MockLLMCoordinator),
            neural_services: Arc::new(MockNeuralServices),
            intelligence_hub: Arc::new(MockIntelligenceHub),
        }
    }
}