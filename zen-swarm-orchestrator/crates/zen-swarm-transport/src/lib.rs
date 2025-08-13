//! Transport layer for RUV-FANN swarm communication
//!
//! This crate provides multiple transport implementations for efficient
//! inter-agent communication in distributed swarm systems.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::error::Error as StdError;
use std::fmt::Debug;
use thiserror::Error;
use uuid::Uuid;

pub mod in_process;
pub mod protocol;
pub mod shared_memory;
pub mod websocket;

#[cfg(test)]
mod tests;

pub use protocol::{Message, MessageType, ProtocolVersion};

/// Transport error types
#[derive(Error, Debug)]
pub enum TransportError {
    #[error("Connection error: {0}")]
    ConnectionError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Message too large: {size} bytes (max: {max}")]
    MessageTooLarge { size: usize, max: usize },

    #[error("Transport not available: {0}")]
    NotAvailable(String),

    #[error("Timeout occurred")]
    Timeout,

    #[error("Invalid address: {0}")]
    InvalidAddress(String),

    #[error("Protocol version mismatch: expected {expected}, got {actual}")]
    VersionMismatch { expected: String, actual: String },

    #[error("Other error: {0}")]
    Other(#[from] anyhow::Error),
}

/// Transport configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransportConfig {
    /// Maximum message size in bytes
    pub max_message_size: usize,

    /// Connection timeout in milliseconds
    pub connection_timeout_ms: u64,

    /// Retry attempts for failed operations
    pub retry_attempts: u32,

    /// Enable compression for messages
    pub enable_compression: bool,

    /// Minimum size for compression (bytes)
    pub compression_threshold: usize,
}

impl Default for TransportConfig {
    fn default() -> Self {
        Self {
            max_message_size: 10 * 1024 * 1024, // 10MB
            connection_timeout_ms: 5000,
            retry_attempts: 3,
            enable_compression: true,
            compression_threshold: 1024, // 1KB
        }
    }
}

/// Core transport trait for all communication implementations
#[async_trait]
pub trait Transport: Send + Sync {
    /// Message type for this transport
    type Message: Serialize + for<'de> Deserialize<'de> + Send + Sync + Debug;

    /// Error type for this transport
    type Error: StdError + Send + Sync + 'static;

    /// Send a message to a specific recipient
    async fn send(&self, to: &str, msg: Self::Message) -> Result<(), Self::Error>;

    /// Receive a message from any sender
    async fn receive(&mut self) -> Result<(String, Self::Message), Self::Error>;

    /// Broadcast a message to all connected peers
    async fn broadcast(&self, msg: Self::Message) -> Result<(), Self::Error>;

    /// Get the transport's local address
    fn local_address(&self) -> Result<String, Self::Error>;

    /// Check if the transport is connected
    fn is_connected(&self) -> bool;

    /// Close the transport connection
    async fn close(&mut self) -> Result<(), Self::Error>;

    /// Get transport statistics
    fn stats(&self) -> TransportStats {
        TransportStats::default()
    }
}

/// Transport statistics
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct TransportStats {
    pub messages_sent: u64,
    pub messages_received: u64,
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub errors: u64,
    pub reconnections: u64,
    pub last_activity: Option<chrono::DateTime<chrono::Utc>>,
}

/// Advanced health scoring system for transport performance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthScore {
    pub overall: f64,
    pub reliability: f64,
    pub throughput: f64,
    pub bandwidth: f64,
    pub efficiency: f64,
    pub status: HealthStatus,
}

/// Health status categories
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HealthStatus {
    Excellent,
    Good,
    Fair,
    Poor,
    Critical,
}

/// Real-time metrics for live monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RealTimeMetrics {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub messages_per_second: f64,
    pub bytes_per_second: f64,
    pub connections_per_second: f64,
    pub active_connections: u64,
    pub capacity_utilization: f64,
    pub error_rate: f64,
    pub latency_estimate: f64,
}

/// Performance trend analysis
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PerformanceTrend {
    Improving,
    Stable,
    Degrading,
}

/// Optimization recommendation system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationRecommendation {
    pub category: OptimizationCategory,
    pub priority: Priority,
    pub description: String,
    pub estimated_impact: ImpactLevel,
}

/// Categories of optimization recommendations
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OptimizationCategory {
    Reliability,
    Performance,
    Capacity,
    Security,
    Efficiency,
}

/// Priority levels for recommendations
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

/// Impact level of optimizations
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ImpactLevel {
    Low,
    Medium,
    High,
}

/// Performance window for historical tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceWindow {
    pub start_time: chrono::DateTime<chrono::Utc>,
    pub duration_minutes: u64,
    pub snapshot: TransportStats,
    pub health_score: HealthScore,
    pub real_time_metrics: RealTimeMetrics,
    pub optimization_recommendations: Vec<OptimizationRecommendation>,
}

/// WebSocket-specific real-time metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketRealTimeMetrics {
    pub base_metrics: RealTimeMetrics,
    pub tls_connections_ratio: f64,
    pub compression_efficiency: f64,
    pub ping_pong_health: f64,
    pub reconnection_rate: f64,
}

/// WebSocket security analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketSecurityAnalysis {
    pub tls_coverage: f64,
    pub encryption_strength: SecurityLevel,
    pub vulnerability_score: f64,
}

/// Security level classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Performance tier classification
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum PerformanceTier {
    Basic,
    Standard,
    High,
    Premium,
}

/// Comprehensive WebSocket performance analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebSocketPerformanceAnalysis {
    pub basic_window: PerformanceWindow,
    pub websocket_metrics: WebSocketRealTimeMetrics,
    pub security_analysis: WebSocketSecurityAnalysis,
    pub performance_classification: PerformanceTier,
}

/// SharedMemory-specific real-time metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedMemoryRealTimeMetrics {
    pub base_metrics: RealTimeMetrics,
    pub ring_buffer_operations_per_sec: f64,
    pub buffer_overflow_rate: f64,
    pub memory_efficiency: f64,
    pub peer_health_score: f64,
    pub lock_contention_rate: f64,
}

/// Ring buffer analysis for SharedMemory transport
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RingBufferAnalysis {
    pub total_operations: u64,
    pub write_read_ratio: f64,
    pub overflow_frequency: f64,
    pub average_operation_size: f64,
}

/// Memory analysis for SharedMemory transport
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryAnalysis {
    pub total_allocated: u64,
    pub efficiency_score: f64,
    pub fragmentation_estimate: f64,
    pub utilization_trend: MemoryTrend,
}

/// Memory utilization trend
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MemoryTrend {
    Increasing,
    Stable,
    Decreasing,
}

/// Comprehensive SharedMemory performance analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedMemoryPerformanceAnalysis {
    pub basic_window: PerformanceWindow,
    pub shared_memory_metrics: SharedMemoryRealTimeMetrics,
    pub ring_buffer_analysis: RingBufferAnalysis,
    pub memory_analysis: MemoryAnalysis,
    pub performance_classification: PerformanceTier,
}

/// Transport builder trait for creating configured transports
#[async_trait]
pub trait TransportBuilder: Send + Sync {
    /// Build a new transport instance
    async fn build(
        &self,
        config: TransportConfig,
    ) -> Result<Box<dyn Transport<Message = Message, Error = TransportError>>, TransportError>;
}

/// Generate unique transport IDs using UUID for identification and tracking
pub fn generate_transport_id() -> String {
    Uuid::new_v4().to_string()
}

/// Registry for available transports
pub struct TransportRegistry {
    transports: dashmap::DashMap<String, Box<dyn TransportBuilder>>,
}

impl TransportRegistry {
    pub fn new() -> Self {
        Self {
            transports: dashmap::DashMap::new(),
        }
    }

    /// Register a transport builder
    pub fn register<B>(&self, name: &str, builder: B)
    where
        B: TransportBuilder + 'static,
    {
        self.transports.insert(name.to_string(), Box::new(builder));
    }

    /// Create a transport by name
    pub async fn create(
        &self,
        name: &str,
        config: TransportConfig,
    ) -> Result<Box<dyn Transport<Message = Message, Error = TransportError>>, TransportError> {
        self.transports
            .get(name)
            .ok_or_else(|| {
                TransportError::NotAvailable(format!("Transport '{}' not registered", name))
            })?
            .build(config)
            .await
    }
}

impl Default for TransportRegistry {
    fn default() -> Self {
        Self::new()
    }
}
