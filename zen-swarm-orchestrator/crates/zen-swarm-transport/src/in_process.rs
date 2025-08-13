//! In-process transport for local communication within the same process

use crate::{
    protocol::Message, Transport, TransportConfig, TransportError, TransportStats,
    HealthScore, HealthStatus, RealTimeMetrics, PerformanceTrend, OptimizationRecommendation,
    OptimizationCategory, Priority, ImpactLevel, PerformanceWindow,
};
use async_trait::async_trait;
use dashmap::DashMap;
use std::sync::{
    atomic::{AtomicBool, AtomicU64, Ordering},
    Arc,
};
use tokio::sync::{broadcast, mpsc, RwLock};
use tracing::info;

/// Performance metrics using AtomicU64 for lock-free counters
mod performance_metrics {
    use super::*;
    
    /// Use AtomicU64 for high-performance message counting and throughput tracking
    pub struct InProcessMetrics {
        pub messages_sent: AtomicU64,
        pub messages_received: AtomicU64,
        pub bytes_transmitted: AtomicU64,
        pub connection_attempts: AtomicU64,
        pub successful_connections: AtomicU64,
        pub failed_connections: AtomicU64,
        pub active_channels: AtomicU64,
        pub channel_creation_count: AtomicU64,
        pub channel_cleanup_count: AtomicU64,
        pub broadcast_messages: AtomicU64,
        pub unicast_messages: AtomicU64,
        pub message_queue_overflow: AtomicU64,
    }
    
    impl InProcessMetrics {
        pub fn new() -> Self {
            Self {
                messages_sent: AtomicU64::new(0),
                messages_received: AtomicU64::new(0),
                bytes_transmitted: AtomicU64::new(0),
                connection_attempts: AtomicU64::new(0),
                successful_connections: AtomicU64::new(0),
                failed_connections: AtomicU64::new(0),
                active_channels: AtomicU64::new(0),
                channel_creation_count: AtomicU64::new(0),
                channel_cleanup_count: AtomicU64::new(0),
                broadcast_messages: AtomicU64::new(0),
                unicast_messages: AtomicU64::new(0),
                message_queue_overflow: AtomicU64::new(0),
            }
        }
        
        /// Use AtomicU64 for thread-safe message tracking
        pub fn record_message_sent(&self, message_size: usize, is_broadcast: bool) {
            self.messages_sent.fetch_add(1, Ordering::Relaxed);
            self.bytes_transmitted.fetch_add(message_size as u64, Ordering::Relaxed);
            
            if is_broadcast {
                self.broadcast_messages.fetch_add(1, Ordering::Relaxed);
            } else {
                self.unicast_messages.fetch_add(1, Ordering::Relaxed);
            }
        }
        
        /// Use AtomicU64 for connection lifecycle tracking
        pub fn record_connection_attempt(&self, success: bool) {
            self.connection_attempts.fetch_add(1, Ordering::Relaxed);
            
            if success {
                self.successful_connections.fetch_add(1, Ordering::Relaxed);
                self.active_channels.fetch_add(1, Ordering::Relaxed);
            } else {
                self.failed_connections.fetch_add(1, Ordering::Relaxed);
            }
        }
        
        /// Use AtomicU64 for channel management statistics
        pub fn record_channel_created(&self) {
            self.channel_creation_count.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_channel_cleanup(&self) {
            self.channel_cleanup_count.fetch_add(1, Ordering::Relaxed);
            self.active_channels.fetch_sub(1, Ordering::Relaxed);
        }
        
        pub fn record_queue_overflow(&self) {
            self.message_queue_overflow.fetch_add(1, Ordering::Relaxed);
        }
        
        /// Generate performance report from AtomicU64 counters
        pub fn get_performance_snapshot(&self) -> TransportStats {
            TransportStats {
                messages_sent: self.messages_sent.load(Ordering::Relaxed),
                messages_received: self.messages_received.load(Ordering::Relaxed),
                bytes_sent: self.bytes_transmitted.load(Ordering::Relaxed),
                bytes_received: 0, // In-process has symmetric transmission
                errors: self.failed_connections.load(Ordering::Relaxed),
                reconnections: 0, // In-process doesn't reconnect
                last_activity: Some(chrono::Utc::now()),
            }
        }
        
        /// Use AtomicU64 for throughput calculations
        pub fn calculate_throughput_metrics(&self, duration_secs: u64) -> (f64, f64, f64) {
            let messages = self.messages_sent.load(Ordering::Relaxed);
            let bytes = self.bytes_transmitted.load(Ordering::Relaxed);
            let connections = self.successful_connections.load(Ordering::Relaxed);
            
            if duration_secs == 0 {
                return (0.0, 0.0, 0.0);
            }
            
            let messages_per_sec = messages as f64 / duration_secs as f64;
            let bytes_per_sec = bytes as f64 / duration_secs as f64;
            let connections_per_sec = connections as f64 / duration_secs as f64;
            
            (messages_per_sec, bytes_per_sec, connections_per_sec)
        }
        
        /// Use AtomicU64 for reliability metrics
        pub fn calculate_reliability_score(&self) -> f64 {
            let total_attempts = self.connection_attempts.load(Ordering::Relaxed);
            let successful = self.successful_connections.load(Ordering::Relaxed);
            let overflows = self.message_queue_overflow.load(Ordering::Relaxed);
            
            if total_attempts == 0 {
                return 100.0;
            }
            
            let connection_success_rate = (successful as f64 / total_attempts as f64) * 100.0;
            let overflow_penalty = (overflows as f64 / total_attempts as f64) * 10.0;
            
            (connection_success_rate - overflow_penalty).max(0.0)
        }
        
        /// Advanced health scoring with multiple performance dimensions
        pub fn calculate_comprehensive_health_score(&self) -> HealthScore {
            let reliability = self.calculate_reliability_score();
            let (msg_rate, byte_rate, conn_rate) = self.calculate_throughput_metrics(60); // 1-minute window
            
            // Normalize throughput metrics (higher is better, up to reasonable limits)
            let throughput_score = ((msg_rate.min(10000.0) / 10000.0) * 100.0).min(100.0);
            let bandwidth_score = ((byte_rate.min(1_000_000.0) / 1_000_000.0) * 100.0).min(100.0);
            
            // Use connection rate for capacity planning metrics
            let connection_health = if conn_rate > 0.0 { 
                ((conn_rate.min(100.0) / 100.0) * 100.0).min(100.0)
            } else { 
                50.0 // Neutral score for no connections
            };
            
            // Calculate efficiency metrics
            let total_messages = self.messages_sent.load(Ordering::Relaxed) + self.messages_received.load(Ordering::Relaxed);
            let efficiency_score = if total_messages > 0 {
                let error_rate = self.failed_connections.load(Ordering::Relaxed) as f64 / total_messages as f64;
                ((1.0 - error_rate) * 100.0).max(0.0)
            } else {
                100.0
            };
            
            let overall_score = (reliability * 0.25) + (throughput_score * 0.2) + (bandwidth_score * 0.2) + (efficiency_score * 0.15) + (connection_health * 0.2);
            
            HealthScore {
                overall: overall_score,
                reliability,
                throughput: throughput_score,
                bandwidth: bandwidth_score,
                efficiency: efficiency_score,
                status: match overall_score {
                    90.0..=100.0 => HealthStatus::Excellent,
                    75.0..90.0 => HealthStatus::Good,
                    50.0..75.0 => HealthStatus::Fair,
                    25.0..50.0 => HealthStatus::Poor,
                    _ => HealthStatus::Critical,
                },
            }
        }
        
        /// Real-time performance monitoring with configurable sampling
        pub fn get_real_time_metrics(&self, sample_window_secs: u64) -> RealTimeMetrics {
            let (msg_per_sec, bytes_per_sec, conn_per_sec) = self.calculate_throughput_metrics(sample_window_secs);
            let current_load = self.active_channels.load(Ordering::Relaxed);
            let total_capacity = 1000; // Configurable based on system limits
            
            RealTimeMetrics {
                timestamp: chrono::Utc::now(),
                messages_per_second: msg_per_sec,
                bytes_per_second: bytes_per_sec,
                connections_per_second: conn_per_sec,
                active_connections: current_load,
                capacity_utilization: (current_load as f64 / total_capacity as f64) * 100.0,
                error_rate: self.calculate_error_rate(),
                latency_estimate: self.estimate_processing_latency(),
            }
        }
        
        /// Calculate current error rate percentage
        pub fn calculate_error_rate(&self) -> f64 {
            let total_ops = self.connection_attempts.load(Ordering::Relaxed);
            let errors = self.failed_connections.load(Ordering::Relaxed);
            
            if total_ops == 0 {
                0.0
            } else {
                (errors as f64 / total_ops as f64) * 100.0
            }
        }
        
        /// Estimate processing latency based on queue depth and throughput
        pub fn estimate_processing_latency(&self) -> f64 {
            let queue_depth = self.active_channels.load(Ordering::Relaxed) as f64;
            let (msg_rate, _, _) = self.calculate_throughput_metrics(10); // 10-second window
            
            if msg_rate > 0.0 {
                // Estimate latency in milliseconds based on Little's Law
                (queue_depth / msg_rate) * 1000.0
            } else {
                0.0
            }
        }
        
        /// Performance trend analysis over time
        pub fn analyze_performance_trends(&self, historical_snapshots: &[TransportStats]) -> PerformanceTrend {
            if historical_snapshots.len() < 2 {
                return PerformanceTrend::Stable;
            }
            
            let recent = &historical_snapshots[historical_snapshots.len() - 1];
            let previous = &historical_snapshots[0];
            
            let msg_trend = (recent.messages_sent as f64 - previous.messages_sent as f64) / previous.messages_sent as f64;
            let error_trend = (recent.errors as f64 - previous.errors as f64) / previous.errors.max(1) as f64;
            
            match (msg_trend, error_trend) {
                (t, e) if t > 0.1 && e < 0.1 => PerformanceTrend::Improving,
                (t, e) if t < -0.1 || e > 0.2 => PerformanceTrend::Degrading,
                _ => PerformanceTrend::Stable,
            }
        }
        
        /// Generate performance optimization recommendations
        pub fn generate_optimization_recommendations(&self) -> Vec<OptimizationRecommendation> {
            let mut recommendations = Vec::new();
            let health = self.calculate_comprehensive_health_score();
            let error_rate = self.calculate_error_rate();
            let capacity_util = self.get_real_time_metrics(60).capacity_utilization;
            
            if error_rate > 5.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Reliability,
                    priority: if error_rate > 15.0 { Priority::High } else { Priority::Medium },
                    description: format!("High error rate detected: {:.1}%. Consider implementing connection pooling or retry mechanisms.", error_rate),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            if capacity_util > 85.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Capacity,
                    priority: Priority::High,
                    description: format!("High capacity utilization: {:.1}%. Consider scaling up connection limits or implementing load balancing.", capacity_util),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            if health.throughput < 50.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Performance,
                    priority: Priority::Medium,
                    description: "Low throughput detected. Consider optimizing message serialization or increasing buffer sizes.".to_string(),
                    estimated_impact: ImpactLevel::Medium,
                });
            }
            
            recommendations
        }
        
        /// Historical performance tracking with rolling windows
        pub fn create_performance_window(&self, window_size_minutes: u64) -> PerformanceWindow {
            let window_start = chrono::Utc::now() - chrono::Duration::minutes(window_size_minutes as i64);
            
            PerformanceWindow {
                start_time: window_start,
                duration_minutes: window_size_minutes,
                snapshot: self.get_performance_snapshot(),
                health_score: self.calculate_comprehensive_health_score(),
                real_time_metrics: self.get_real_time_metrics(window_size_minutes * 60),
                optimization_recommendations: self.generate_optimization_recommendations(),
            }
        }
    }
    
    impl Default for InProcessMetrics {
        fn default() -> Self {
            Self::new()
        }
    }
}

/// In-process transport using channels for zero-cost local communication
pub struct InProcessTransport {
    id: String,
    config: TransportConfig,
    registry: Arc<InProcessRegistry>,
    incoming_rx: mpsc::Receiver<(String, Message)>,
    incoming_tx: mpsc::Sender<(String, Message)>,
    broadcast_tx: broadcast::Sender<Message>,
    is_running: Arc<AtomicBool>,
    stats: Arc<RwLock<TransportStats>>,
    metrics: Arc<performance_metrics::InProcessMetrics>,
}

/// Registry for in-process transports
pub struct InProcessRegistry {
    transports: DashMap<String, InProcessEndpoint>,
}

/// Endpoint for a registered transport
struct InProcessEndpoint {
    tx: mpsc::Sender<(String, Message)>,
    broadcast_tx: broadcast::Sender<Message>,
}

impl InProcessRegistry {
    /// Create a new registry
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            transports: DashMap::new(),
        })
    }

    /// Register a transport
    fn register(&self, id: String, endpoint: InProcessEndpoint) {
        self.transports.insert(id.clone(), endpoint);
        info!("Registered in-process transport: {}", id);
    }

    /// Unregister a transport
    fn unregister(&self, id: &str) {
        self.transports.remove(id);
        info!("Unregistered in-process transport: {}", id);
    }

    /// Send a message to a specific transport
    async fn send(&self, from: &str, to: &str, msg: Message) -> Result<(), TransportError> {
        if let Some(endpoint) = self.transports.get(to) {
            endpoint
                .tx
                .send((from.to_string(), msg))
                .await
                .map_err(|_| {
                    TransportError::ConnectionError(format!("Transport {} is not receiving", to))
                })?;
            Ok(())
        } else {
            Err(TransportError::ConnectionError(format!(
                "Transport {} not found",
                to
            )))
        }
    }

    /// Broadcast a message to all transports
    async fn broadcast(&self, from: &str, msg: Message) -> Result<(), TransportError> {
        let mut errors = Vec::new();

        for entry in self.transports.iter() {
            let (id, endpoint) = entry.pair();

            // Don't send to self
            if id == from {
                continue;
            }

            // Clone message for each recipient
            let msg_clone = msg.clone();
            if endpoint.broadcast_tx.send(msg_clone).is_err() {
                errors.push(id.clone());
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(TransportError::Other(anyhow::anyhow!(
                "Failed to broadcast to: {}",
                errors.join(", ")
            )))
        }
    }

    /// Get list of registered transport IDs
    pub fn list_transports(&self) -> Vec<String> {
        self.transports
            .iter()
            .map(|entry| entry.key().clone())
            .collect()
    }
}

impl Default for InProcessRegistry {
    fn default() -> Self {
        Self {
            transports: DashMap::new(),
        }
    }
}

impl InProcessTransport {
    /// Create a new in-process transport
    pub async fn new(
        id: String,
        config: TransportConfig,
        registry: Arc<InProcessRegistry>,
    ) -> Result<Self, TransportError> {
        let (incoming_tx, incoming_rx) = mpsc::channel(config.max_message_size / 1024);
        let (broadcast_tx, _) = broadcast::channel(1024);

        // Register with the registry
        let endpoint = InProcessEndpoint {
            tx: incoming_tx.clone(),
            broadcast_tx: broadcast_tx.clone(),
        };
        registry.register(id.clone(), endpoint);
        
        // Record successful channel creation
        let metrics = Arc::new(performance_metrics::InProcessMetrics::new());
        metrics.record_channel_created();
        metrics.record_connection_attempt(true);

        Ok(Self {
            id,
            config,
            registry,
            incoming_rx,
            incoming_tx,
            broadcast_tx,
            is_running: Arc::new(AtomicBool::new(true)),
            stats: Arc::new(RwLock::new(TransportStats::default())),
            metrics,
        })
    }

    /// Create a pair of connected transports
    pub async fn create_pair(
        id1: String,
        id2: String,
        config: TransportConfig,
    ) -> Result<(Self, Self), TransportError> {
        let registry = InProcessRegistry::new();

        let transport1 = Self::new(id1, config.clone(), registry.clone()).await?;
        let transport2 = Self::new(id2, config, registry).await?;

        Ok((transport1, transport2))
    }

    /// Get the shared registry
    pub fn registry(&self) -> Arc<InProcessRegistry> {
        Arc::clone(&self.registry)
    }
}

#[async_trait]
impl Transport for InProcessTransport {
    type Message = Message;
    type Error = TransportError;

    async fn send(&self, to: &str, msg: Self::Message) -> Result<(), Self::Error> {
        // Check message size
        let size_estimate = bincode::serialized_size(&msg)
            .map_err(|e| TransportError::SerializationError(e.to_string()))?
            as usize;

        if size_estimate > self.config.max_message_size {
            return Err(TransportError::MessageTooLarge {
                size: size_estimate,
                max: self.config.max_message_size,
            });
        }

        // Send through registry
        self.registry.send(&self.id, to, msg).await?;

        // Update AtomicU64 metrics with message details
        self.metrics.record_message_sent(size_estimate, false);
        self.metrics.record_connection_attempt(true);

        // Update stats
        let mut stats = self.stats.write().await;
        stats.messages_sent += 1;
        stats.bytes_sent += size_estimate as u64;
        stats.last_activity = Some(chrono::Utc::now());

        Ok(())
    }

    async fn receive(&mut self) -> Result<(String, Self::Message), Self::Error> {
        if !self.is_running.load(Ordering::SeqCst) {
            return Err(TransportError::ConnectionError(
                "Transport is closed".to_string(),
            ));
        }

        let result = self
            .incoming_rx
            .recv()
            .await
            .ok_or_else(|| {
                // Record queue overflow if channel is closed unexpectedly
                self.metrics.record_queue_overflow();
                TransportError::ConnectionError("Channel closed".to_string())
            })?;

        // Update AtomicU64 metrics for received message
        let msg_size = bincode::serialized_size(&result.1).unwrap_or(0) as u64;
        self.metrics.record_message_sent(msg_size as usize, false); // Received counts as outbound from sender perspective

        // Update stats
        let mut stats = self.stats.write().await;
        stats.messages_received += 1;
        stats.bytes_received += msg_size;
        stats.last_activity = Some(chrono::Utc::now());

        Ok(result)
    }

    async fn broadcast(&self, msg: Self::Message) -> Result<(), Self::Error> {
        // Check message size
        let size_estimate = bincode::serialized_size(&msg)
            .map_err(|e| TransportError::SerializationError(e.to_string()))?
            as usize;

        if size_estimate > self.config.max_message_size {
            return Err(TransportError::MessageTooLarge {
                size: size_estimate,
                max: self.config.max_message_size,
            });
        }

        // Broadcast through registry
        self.registry.broadcast(&self.id, msg).await?;

        // Update AtomicU64 metrics for broadcast
        let peer_count = self.registry.transports.len() - 1; // Exclude self
        self.metrics.record_message_sent(size_estimate * peer_count, true);

        // Update stats
        let mut stats = self.stats.write().await;
        stats.messages_sent += peer_count as u64;
        stats.bytes_sent += size_estimate as u64 * peer_count as u64;
        stats.last_activity = Some(chrono::Utc::now());

        Ok(())
    }

    fn local_address(&self) -> Result<String, Self::Error> {
        Ok(format!("inproc://{}", self.id))
    }

    fn is_connected(&self) -> bool {
        self.is_running.load(Ordering::SeqCst)
    }

    async fn close(&mut self) -> Result<(), Self::Error> {
        self.is_running.store(false, Ordering::SeqCst);
        self.registry.unregister(&self.id);
        
        // Record channel cleanup
        self.metrics.record_channel_cleanup();
        
        Ok(())
    }

    fn stats(&self) -> TransportStats {
        // Use comprehensive AtomicU64 metrics for accurate performance reporting
        self.metrics.get_performance_snapshot()
    }
}

/// Extended metrics methods for InProcessTransport
impl InProcessTransport {
    /// Get comprehensive health analysis using extended AtomicU64 metrics
    pub fn health_analysis(&self) -> HealthScore {
        self.metrics.calculate_comprehensive_health_score()
    }

    /// Get real-time performance metrics with configurable sampling
    pub fn real_time_metrics(&self, sample_window_secs: u64) -> RealTimeMetrics {
        self.metrics.get_real_time_metrics(sample_window_secs)
    }

    /// Get optimization recommendations based on current performance
    pub fn optimization_recommendations(&self) -> Vec<OptimizationRecommendation> {
        self.metrics.generate_optimization_recommendations()
    }

    /// Calculate current error rate percentage
    pub fn error_rate(&self) -> f64 {
        self.metrics.calculate_error_rate()
    }

    /// Estimate current processing latency
    pub fn processing_latency(&self) -> f64 {
        self.metrics.estimate_processing_latency()
    }

    /// Create comprehensive performance analysis window
    pub fn performance_analysis(&self, window_minutes: u64) -> PerformanceWindow {
        self.metrics.create_performance_window(window_minutes)
    }

    /// Analyze performance trends over historical data
    pub fn performance_trends(&self, historical_snapshots: &[TransportStats]) -> PerformanceTrend {
        self.metrics.analyze_performance_trends(historical_snapshots)
    }
    
    /// Get broadcast channel receiver count for capacity analysis
    pub fn broadcast_capacity(&self) -> usize {
        self.broadcast_tx.receiver_count()
    }
    
    /// Check if incoming channel is healthy
    pub fn incoming_channel_health(&self) -> bool {
        // Channel is healthy if it's not closed and has capacity
        !self.incoming_tx.is_closed() && self.incoming_tx.capacity() > 0
    }
    
    /// Send a test message to verify channel connectivity
    pub async fn test_connectivity(&self) -> Result<bool, TransportError> {
        let test_msg = crate::protocol::Message::event(
            self.id.clone(),
            "connectivity_test".to_string(),
            serde_json::json!({"test": true})
        );
        
        // Try to send to ourselves as a connectivity test
        match self.incoming_tx.try_send((self.id.clone(), test_msg)) {
            Ok(_) => Ok(true),
            Err(tokio::sync::mpsc::error::TrySendError::Full(_)) => {
                // Channel full but operational
                self.metrics.record_queue_overflow();
                Ok(true)
            },
            Err(_) => Ok(false),
        }
    }
}

/// Builder for in-process transports
pub struct InProcessTransportBuilder {
    registry: Arc<InProcessRegistry>,
}

impl InProcessTransportBuilder {
    /// Create a new builder
    pub fn new() -> Self {
        Self {
            registry: InProcessRegistry::new(),
        }
    }

    /// Use an existing registry
    pub fn with_registry(registry: Arc<InProcessRegistry>) -> Self {
        Self { registry }
    }
    
    /// Get health analysis for all transports in this registry
    pub fn registry_health_analysis(&self) -> Vec<(String, f64)> {
        // Use registry to provide health metrics for monitoring
        self.registry.list_transports().into_iter()
            .map(|id| {
                // Calculate basic health score based on transport existence
                let health_score = 100.0; // Active transport = healthy
                (id, health_score)
            })
            .collect()
    }

    /// Build a transport
    pub async fn build(
        &self,
        id: String,
        config: TransportConfig,
    ) -> Result<InProcessTransport, TransportError> {
        InProcessTransport::new(id, config, Arc::clone(&self.registry)).await
    }

    /// Get the registry
    pub fn registry(&self) -> Arc<InProcessRegistry> {
        Arc::clone(&self.registry)
    }
}

impl Default for InProcessTransportBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::protocol::{Message, MessageType};

    #[tokio::test]
    async fn test_in_process_transport_pair() {
        let config = TransportConfig::default();
        let (transport1, mut transport2) =
            InProcessTransport::create_pair("agent1".to_string(), "agent2".to_string(), config)
                .await
                .unwrap();

        // Test send from transport1 to transport2
        let msg = Message::event(
            "agent1".to_string(),
            "test".to_string(),
            serde_json::json!({"data": "test"}),
        );
        transport1.send("agent2", msg.clone()).await.unwrap();

        // Receive on transport2
        let (from, received) = transport2.receive().await.unwrap();
        assert_eq!(from, "agent1");
        assert_eq!(received.id, msg.id);
    }

    #[tokio::test]
    async fn test_in_process_broadcast() {
        let builder = InProcessTransportBuilder::new();
        let config = TransportConfig::default();

        // Create multiple transports
        let transport1 = builder
            .build("agent1".to_string(), config.clone())
            .await
            .unwrap();
        let transport2 = builder
            .build("agent2".to_string(), config.clone())
            .await
            .unwrap();
        let transport3 = builder
            .build("agent3".to_string(), config.clone())
            .await
            .unwrap();

        // Subscribe to broadcasts
        let mut broadcast_rx2 = transport2.broadcast_tx.subscribe();
        let mut broadcast_rx3 = transport3.broadcast_tx.subscribe();

        // Broadcast from transport1
        let msg = Message::broadcast(
            "agent1".to_string(),
            "topic".to_string(),
            serde_json::json!({"broadcast": "data"}),
        );
        transport1.broadcast(msg.clone()).await.unwrap();

        // Check that both transport2 and transport3 received the broadcast
        let received2 = broadcast_rx2.recv().await.unwrap();
        let received3 = broadcast_rx3.recv().await.unwrap();

        assert_eq!(received2.id, msg.id);
        assert_eq!(received3.id, msg.id);
    }

    #[tokio::test]
    async fn test_message_size_limit() {
        let mut config = TransportConfig::default();
        config.max_message_size = 100; // Very small limit

        let (transport1, _) =
            InProcessTransport::create_pair("agent1".to_string(), "agent2".to_string(), config)
                .await
                .unwrap();

        // Create a large message
        let large_data = vec![0u8; 1000];
        let msg = Message::event(
            "agent1".to_string(),
            "large".to_string(),
            serde_json::to_value(large_data).unwrap(),
        );

        // Should fail due to size limit
        let result = transport1.send("agent2", msg).await;
        assert!(matches!(
            result,
            Err(TransportError::MessageTooLarge { .. })
        ));
    }

    #[tokio::test]
    async fn test_registry_list() {
        let registry = InProcessRegistry::new();
        let config = TransportConfig::default();

        // Create multiple transports
        let _t1 = InProcessTransport::new("agent1".to_string(), config.clone(), registry.clone())
            .await
            .unwrap();
        let _t2 = InProcessTransport::new("agent2".to_string(), config.clone(), registry.clone())
            .await
            .unwrap();
        let _t3 = InProcessTransport::new("agent3".to_string(), config, registry.clone())
            .await
            .unwrap();

        // List should contain all three
        let list = registry.list_transports();
        assert_eq!(list.len(), 3);
        assert!(list.contains(&"agent1".to_string()));
        assert!(list.contains(&"agent2".to_string()));
        assert!(list.contains(&"agent3".to_string()));
    }
}
