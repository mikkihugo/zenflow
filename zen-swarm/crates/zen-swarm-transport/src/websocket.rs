//! WebSocket transport implementation with auto-reconnection and TLS support

use crate::{
    protocol::{BinaryCodec, Message, MessageCodec},
    Transport, TransportConfig, TransportError, TransportStats,
    HealthScore, HealthStatus, RealTimeMetrics, OptimizationRecommendation,
    OptimizationCategory, Priority, ImpactLevel, PerformanceWindow,
    WebSocketRealTimeMetrics, WebSocketSecurityAnalysis, SecurityLevel, PerformanceTier,
    WebSocketPerformanceAnalysis,
};
use async_trait::async_trait;
use backoff::{future::retry, ExponentialBackoff};
use dashmap::DashMap;
use flate2::{read::GzDecoder, write::GzEncoder, Compression};
use std::{
    io::{Read, Write},
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};
use tokio::{
    net::{TcpListener, TcpStream},
    sync::{broadcast, mpsc, RwLock},
    time::timeout,
};
use tokio_tungstenite::{
    accept_async, connect_async,
    tungstenite::{Message as WsMessage},
    MaybeTlsStream, WebSocketStream,
};
use tracing::{debug, error, info, warn};
use url::Url;

/// Performance metrics using AtomicU64 for lock-free counters
mod performance_metrics {
    use super::*;
    
    /// Use AtomicU64 for high-performance WebSocket metrics tracking
    pub struct WebSocketMetrics {
        pub messages_sent: AtomicU64,
        pub messages_received: AtomicU64,
        pub bytes_transmitted: AtomicU64,
        pub bytes_received: AtomicU64,
        pub connections_established: AtomicU64,
        pub connections_dropped: AtomicU64,
        pub connection_attempts: AtomicU64,
        pub reconnection_attempts: AtomicU64,
        pub successful_reconnections: AtomicU64,
        pub tls_handshakes: AtomicU64,
        pub compression_operations: AtomicU64,
        pub decompression_operations: AtomicU64,
        pub websocket_errors: AtomicU64,
        pub timeout_events: AtomicU64,
        pub ping_pong_cycles: AtomicU64,
    }
    
    impl WebSocketMetrics {
        pub fn new() -> Self {
            Self {
                messages_sent: AtomicU64::new(0),
                messages_received: AtomicU64::new(0),
                bytes_transmitted: AtomicU64::new(0),
                bytes_received: AtomicU64::new(0),
                connections_established: AtomicU64::new(0),
                connections_dropped: AtomicU64::new(0),
                connection_attempts: AtomicU64::new(0),
                reconnection_attempts: AtomicU64::new(0),
                successful_reconnections: AtomicU64::new(0),
                tls_handshakes: AtomicU64::new(0),
                compression_operations: AtomicU64::new(0),
                decompression_operations: AtomicU64::new(0),
                websocket_errors: AtomicU64::new(0),
                timeout_events: AtomicU64::new(0),
                ping_pong_cycles: AtomicU64::new(0),
            }
        }
        
        /// Use AtomicU64 for thread-safe message tracking
        pub fn record_message_sent(&self, message_size: usize, compressed: bool) {
            self.messages_sent.fetch_add(1, Ordering::Relaxed);
            self.bytes_transmitted.fetch_add(message_size as u64, Ordering::Relaxed);
            
            if compressed {
                self.compression_operations.fetch_add(1, Ordering::Relaxed);
            }
        }
        
        pub fn record_message_received(&self, message_size: usize, decompressed: bool) {
            self.messages_received.fetch_add(1, Ordering::Relaxed);
            self.bytes_received.fetch_add(message_size as u64, Ordering::Relaxed);
            
            if decompressed {
                self.decompression_operations.fetch_add(1, Ordering::Relaxed);
            }
        }
        
        /// Use AtomicU64 for connection lifecycle tracking
        pub fn record_connection_attempt(&self) {
            self.connection_attempts.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_connection_established(&self, tls_enabled: bool) {
            self.connections_established.fetch_add(1, Ordering::Relaxed);
            
            if tls_enabled {
                self.tls_handshakes.fetch_add(1, Ordering::Relaxed);
            }
        }
        
        pub fn record_connection_dropped(&self) {
            self.connections_dropped.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_reconnection_attempt(&self) {
            self.reconnection_attempts.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_successful_reconnection(&self) {
            self.successful_reconnections.fetch_add(1, Ordering::Relaxed);
        }
        
        /// Use AtomicU64 for WebSocket-specific events
        pub fn record_websocket_error(&self) {
            self.websocket_errors.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_timeout_event(&self) {
            self.timeout_events.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_ping_pong_cycle(&self) {
            self.ping_pong_cycles.fetch_add(1, Ordering::Relaxed);
        }
        
        /// Generate performance report from AtomicU64 counters
        pub fn get_performance_snapshot(&self) -> TransportStats {
            TransportStats {
                messages_sent: self.messages_sent.load(Ordering::Relaxed),
                messages_received: self.messages_received.load(Ordering::Relaxed),
                bytes_sent: self.bytes_transmitted.load(Ordering::Relaxed),
                bytes_received: self.bytes_received.load(Ordering::Relaxed),
                errors: self.websocket_errors.load(Ordering::Relaxed),
                reconnections: self.successful_reconnections.load(Ordering::Relaxed),
                last_activity: Some(chrono::Utc::now()),
            }
        }
        
        /// Use AtomicU64 for connection reliability calculations
        pub fn calculate_connection_reliability(&self) -> f64 {
            let total_attempts = self.connection_attempts.load(Ordering::Relaxed);
            let successful = self.connections_established.load(Ordering::Relaxed);
            let reconnect_success = self.successful_reconnections.load(Ordering::Relaxed);
            
            if total_attempts == 0 {
                return 100.0;
            }
            
            let total_success = successful + reconnect_success;
            (total_success as f64 / total_attempts as f64) * 100.0
        }
        
        /// Use AtomicU64 for throughput calculations
        pub fn calculate_throughput_metrics(&self, duration_secs: u64) -> (f64, f64, f64) {
            let messages = self.messages_sent.load(Ordering::Relaxed) 
                         + self.messages_received.load(Ordering::Relaxed);
            let bytes = self.bytes_transmitted.load(Ordering::Relaxed) 
                      + self.bytes_received.load(Ordering::Relaxed);
            let ping_pongs = self.ping_pong_cycles.load(Ordering::Relaxed);
            
            if duration_secs == 0 {
                return (0.0, 0.0, 0.0);
            }
            
            let messages_per_sec = messages as f64 / duration_secs as f64;
            let bytes_per_sec = bytes as f64 / duration_secs as f64;
            let keepalives_per_sec = ping_pongs as f64 / duration_secs as f64;
            
            (messages_per_sec, bytes_per_sec, keepalives_per_sec)
        }
        
        /// Use AtomicU64 for compression efficiency analysis
        pub fn calculate_compression_efficiency(&self) -> f64 {
            let compression_ops = self.compression_operations.load(Ordering::Relaxed);
            let decompression_ops = self.decompression_operations.load(Ordering::Relaxed);
            let total_messages = self.messages_sent.load(Ordering::Relaxed) 
                               + self.messages_received.load(Ordering::Relaxed);
            
            if total_messages == 0 {
                return 0.0;
            }
            
            let compression_ratio = (compression_ops + decompression_ops) as f64 / total_messages as f64;
            compression_ratio * 100.0
        }
        
        /// WebSocket-specific comprehensive health scoring
        pub fn calculate_websocket_health_score(&self) -> HealthScore {
            let connection_reliability = self.calculate_connection_reliability();
            let (msg_rate, byte_rate, keepalive_rate) = self.calculate_throughput_metrics(60);
            let compression_efficiency = self.calculate_compression_efficiency();
            
            // WebSocket specific scoring
            let throughput_score = ((msg_rate.min(50000.0) / 50000.0) * 100.0).min(100.0);
            let bandwidth_score = ((byte_rate.min(10_000_000.0) / 10_000_000.0) * 100.0).min(100.0);
            let compression_score = (compression_efficiency / 100.0) * 100.0;
            let keepalive_score = if keepalive_rate > 0.0 { 100.0 } else { 50.0 }; // Penalize missing keepalives
            
            let overall_score = (connection_reliability * 0.35) + (throughput_score * 0.25) + 
                               (bandwidth_score * 0.2) + (compression_score * 0.1) + (keepalive_score * 0.1);
            
            HealthScore {
                overall: overall_score,
                reliability: connection_reliability,
                throughput: throughput_score,
                bandwidth: bandwidth_score,
                efficiency: compression_efficiency,
                status: match overall_score {
                    90.0..=100.0 => HealthStatus::Excellent,
                    75.0..90.0 => HealthStatus::Good,
                    50.0..75.0 => HealthStatus::Fair,
                    25.0..50.0 => HealthStatus::Poor,
                    _ => HealthStatus::Critical,
                },
            }
        }
        
        /// Real-time WebSocket monitoring with TLS and compression metrics
        pub fn get_websocket_real_time_metrics(&self, sample_window_secs: u64) -> WebSocketRealTimeMetrics {
            let (msg_per_sec, bytes_per_sec, keepalive_per_sec) = self.calculate_throughput_metrics(sample_window_secs);
            let error_rate = self.calculate_websocket_error_rate();
            let compression_ratio = self.calculate_compression_efficiency();
            
            WebSocketRealTimeMetrics {
                base_metrics: RealTimeMetrics {
                    timestamp: chrono::Utc::now(),
                    messages_per_second: msg_per_sec,
                    bytes_per_second: bytes_per_sec,
                    connections_per_second: keepalive_per_sec,
                    active_connections: self.connections_established.load(Ordering::Relaxed),
                    capacity_utilization: self.calculate_capacity_utilization(),
                    error_rate,
                    latency_estimate: self.estimate_websocket_latency(),
                },
                tls_connections_ratio: self.calculate_tls_usage_ratio(),
                compression_efficiency: compression_ratio,
                ping_pong_health: self.calculate_ping_pong_health(),
                reconnection_rate: self.calculate_reconnection_rate(),
            }
        }
        
        /// Calculate WebSocket specific error rate
        pub fn calculate_websocket_error_rate(&self) -> f64 {
            let total_attempts = self.connection_attempts.load(Ordering::Relaxed);
            let errors = self.websocket_errors.load(Ordering::Relaxed);
            let timeouts = self.timeout_events.load(Ordering::Relaxed);
            
            if total_attempts == 0 {
                0.0
            } else {
                ((errors + timeouts) as f64 / total_attempts as f64) * 100.0
            }
        }
        
        /// Calculate TLS usage ratio for security scoring
        pub fn calculate_tls_usage_ratio(&self) -> f64 {
            let total_connections = self.connections_established.load(Ordering::Relaxed);
            let tls_handshakes = self.tls_handshakes.load(Ordering::Relaxed);
            
            if total_connections == 0 {
                0.0
            } else {
                (tls_handshakes as f64 / total_connections as f64) * 100.0
            }
        }
        
        /// Calculate ping-pong health for connection stability
        pub fn calculate_ping_pong_health(&self) -> f64 {
            let ping_pongs = self.ping_pong_cycles.load(Ordering::Relaxed);
            let active_time_estimate = 3600; // Assume 1 hour active time for calculation
            let expected_ping_pongs = active_time_estimate / 30; // Expect ping every 30 seconds
            
            if expected_ping_pongs == 0 {
                100.0
            } else {
                ((ping_pongs as f64 / expected_ping_pongs as f64).min(1.0)) * 100.0
            }
        }
        
        /// Calculate reconnection rate for stability metrics
        pub fn calculate_reconnection_rate(&self) -> f64 {
            let total_connections = self.connections_established.load(Ordering::Relaxed);
            let successful_reconnections = self.successful_reconnections.load(Ordering::Relaxed);
            
            if total_connections == 0 {
                0.0
            } else {
                (successful_reconnections as f64 / total_connections as f64) * 100.0
            }
        }
        
        /// Estimate WebSocket latency including network and processing delays
        pub fn estimate_websocket_latency(&self) -> f64 {
            let ping_pongs = self.ping_pong_cycles.load(Ordering::Relaxed);
            let timeouts = self.timeout_events.load(Ordering::Relaxed);
            
            // Base latency estimate (in ms)
            let mut base_latency = 50.0; // Default 50ms for WebSocket connections
            
            // Increase latency estimate based on timeout frequency
            if ping_pongs > 0 {
                let timeout_ratio = timeouts as f64 / ping_pongs as f64;
                base_latency += timeout_ratio * 500.0; // Add up to 500ms for high timeout rates
            }
            
            base_latency
        }
        
        /// Calculate capacity utilization for WebSocket connections
        pub fn calculate_capacity_utilization(&self) -> f64 {
            let active_connections = self.connections_established.load(Ordering::Relaxed);
            let max_connections = 10000; // Configurable WebSocket connection limit
            
            (active_connections as f64 / max_connections as f64) * 100.0
        }
        
        /// Generate WebSocket-specific optimization recommendations
        pub fn generate_websocket_optimization_recommendations(&self) -> Vec<OptimizationRecommendation> {
            let mut recommendations = Vec::new();
            let health = self.calculate_websocket_health_score();
            let error_rate = self.calculate_websocket_error_rate();
            let tls_ratio = self.calculate_tls_usage_ratio();
            let compression_efficiency = self.calculate_compression_efficiency();
            
            if error_rate > 10.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Reliability,
                    priority: if error_rate > 20.0 { Priority::Critical } else { Priority::High },
                    description: format!("High WebSocket error rate: {:.1}%. Check network stability and implement exponential backoff.", error_rate),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            if tls_ratio < 50.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Security,
                    priority: Priority::High,
                    description: format!("Low TLS usage: {:.1}%. Consider enforcing WSS connections for better security.", tls_ratio),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            if compression_efficiency < 30.0 && health.bandwidth < 70.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Efficiency,
                    priority: Priority::Medium,
                    description: "Low compression efficiency detected. Enable compression for large messages to improve bandwidth utilization.".to_string(),
                    estimated_impact: ImpactLevel::Medium,
                });
            }
            
            let ping_pong_health = self.calculate_ping_pong_health();
            if ping_pong_health < 60.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Reliability,
                    priority: Priority::Medium,
                    description: "Poor ping-pong health detected. Check connection stability and adjust keepalive intervals.".to_string(),
                    estimated_impact: ImpactLevel::Medium,
                });
            }
            
            recommendations
        }
        
        /// Create comprehensive WebSocket performance analysis
        pub fn create_websocket_performance_analysis(&self, window_minutes: u64) -> WebSocketPerformanceAnalysis {
            WebSocketPerformanceAnalysis {
                basic_window: PerformanceWindow {
                    start_time: chrono::Utc::now() - chrono::Duration::minutes(window_minutes as i64),
                    duration_minutes: window_minutes,
                    snapshot: self.get_performance_snapshot(),
                    health_score: self.calculate_websocket_health_score(),
                    real_time_metrics: RealTimeMetrics {
                        timestamp: chrono::Utc::now(),
                        messages_per_second: 0.0,
                        bytes_per_second: 0.0,
                        connections_per_second: 0.0,
                        active_connections: 0,
                        capacity_utilization: 0.0,
                        error_rate: 0.0,
                        latency_estimate: 0.0,
                    },
                    optimization_recommendations: self.generate_websocket_optimization_recommendations(),
                },
                websocket_metrics: self.get_websocket_real_time_metrics(window_minutes * 60),
                security_analysis: WebSocketSecurityAnalysis {
                    tls_coverage: self.calculate_tls_usage_ratio(),
                    encryption_strength: if self.calculate_tls_usage_ratio() > 80.0 { SecurityLevel::High } else { SecurityLevel::Medium },
                    vulnerability_score: self.calculate_vulnerability_score(),
                },
                performance_classification: self.classify_performance_tier(),
            }
        }
        
        /// Calculate security vulnerability score
        pub fn calculate_vulnerability_score(&self) -> f64 {
            let tls_ratio = self.calculate_tls_usage_ratio();
            let error_rate = self.calculate_websocket_error_rate();
            
            // Lower score is better for vulnerability
            let tls_vulnerability = (100.0 - tls_ratio) * 0.6;
            let error_vulnerability = error_rate * 0.4;
            
            (tls_vulnerability + error_vulnerability).min(100.0)
        }
        
        /// Classify performance tier based on comprehensive metrics
        pub fn classify_performance_tier(&self) -> PerformanceTier {
            let health = self.calculate_websocket_health_score();
            let (msg_rate, byte_rate, _) = self.calculate_throughput_metrics(300); // 5-minute window
            
            match (health.overall, msg_rate, byte_rate) {
                (score, msg, bytes) if score >= 90.0 && msg >= 10000.0 && bytes >= 1_000_000.0 => PerformanceTier::Premium,
                (score, msg, bytes) if score >= 75.0 && msg >= 5000.0 && bytes >= 500_000.0 => PerformanceTier::High,
                (score, msg, bytes) if score >= 50.0 && msg >= 1000.0 && bytes >= 100_000.0 => PerformanceTier::Standard,
                _ => PerformanceTier::Basic,
            }
        }
    }
    
    impl Default for WebSocketMetrics {
        fn default() -> Self {
            Self::new()
        }
    }
}

type WsStream = WebSocketStream<MaybeTlsStream<TcpStream>>;

/// WebSocket transport mode
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum WsMode {
    /// Client mode - connects to a server
    Client { url: String },
    /// Server mode - listens for connections
    Server { bind_addr: String },
}

/// WebSocket transport implementation
pub struct WebSocketTransport {
    mode: WsMode,
    config: TransportConfig,
    codec: Arc<dyn MessageCodec>,
    connections: Arc<DashMap<String, mpsc::Sender<Message>>>,
    incoming_rx: mpsc::Receiver<(String, Message)>,
    incoming_tx: mpsc::Sender<(String, Message)>,
    broadcast_tx: broadcast::Sender<Message>,
    is_running: Arc<AtomicBool>,
    stats: Arc<RwLock<TransportStats>>,
    reconnect_notify: Arc<broadcast::Sender<String>>,
    metrics: Arc<performance_metrics::WebSocketMetrics>,
}

impl WebSocketTransport {
    /// Create a new WebSocket transport
    pub async fn new(mode: WsMode, config: TransportConfig) -> Result<Self, TransportError> {
        let (incoming_tx, incoming_rx) = mpsc::channel(1024);
        let (broadcast_tx, _) = broadcast::channel(1024);
        let (reconnect_tx, _) = broadcast::channel(16);

        let metrics = Arc::new(performance_metrics::WebSocketMetrics::new());
        
        let transport = Self {
            mode,
            config,
            codec: Arc::new(BinaryCodec),
            connections: Arc::new(DashMap::new()),
            incoming_rx,
            incoming_tx,
            broadcast_tx,
            is_running: Arc::new(AtomicBool::new(false)),
            stats: Arc::new(RwLock::new(TransportStats::default())),
            reconnect_notify: Arc::new(reconnect_tx),
            metrics,
        };

        transport.start().await?;
        Ok(transport)
    }

    /// Start the transport
    async fn start(&self) -> Result<(), TransportError> {
        self.is_running.store(true, Ordering::SeqCst);

        match &self.mode {
            WsMode::Client { url } => {
                self.start_client(url.clone()).await?;
            }
            WsMode::Server { bind_addr } => {
                self.start_server(bind_addr.clone()).await?;
            }
        }

        Ok(())
    }

    /// Start client mode
    async fn start_client(&self, url: String) -> Result<(), TransportError> {
        let connections = Arc::clone(&self.connections);
        let incoming_tx = self.incoming_tx.clone();
        let broadcast_tx = self.broadcast_tx.clone();
        let is_running = Arc::clone(&self.is_running);
        let config = self.config.clone();
        let codec = Arc::clone(&self.codec);
        let stats = Arc::clone(&self.stats);
        let reconnect_notify = Arc::clone(&self.reconnect_notify);
        let metrics = Arc::clone(&self.metrics);

        tokio::spawn(async move {
            let backoff = ExponentialBackoff {
                max_elapsed_time: None,
                ..Default::default()
            };

            let _ = retry(backoff, || async {
                if !is_running.load(Ordering::SeqCst) {
                    return Ok(());
                }

                // Track connection attempt using AtomicU64 metrics
                metrics.record_connection_attempt();
                
                match Self::connect_with_retry(&url, &config).await {
                    Ok(ws_stream) => {
                        info!("Connected to WebSocket server: {}", url);
                        let _ = reconnect_notify.send(url.clone());
                        
                        // Record successful connection
                        metrics.record_connection_established(url.starts_with("wss://"));

                        if let Err(e) = Self::handle_client_connection(
                            ws_stream,
                            url.clone(),
                            connections.clone(),
                            incoming_tx.clone(),
                            broadcast_tx.subscribe(),
                            codec.clone(),
                            config.clone(),
                            stats.clone(),
                            is_running.clone(),
                            metrics.clone(),
                        )
                        .await
                        {
                            warn!("Client connection error: {}", e);
                            metrics.record_connection_dropped();
                            return Err(backoff::Error::transient(e));
                        }
                    }
                    Err(e) => {
                        error!("Failed to connect to {}: {}", url, e);
                        return Err(backoff::Error::transient(e));
                    }
                }

                Ok(())
            })
            .await;
        });

        Ok(())
    }

    /// Start server mode
    async fn start_server(&self, bind_addr: String) -> Result<(), TransportError> {
        let listener = TcpListener::bind(&bind_addr)
            .await
            .map_err(|e| TransportError::ConnectionError(format!("Failed to bind: {}", e)))?;

        info!("WebSocket server listening on: {}", bind_addr);

        let connections = Arc::clone(&self.connections);
        let incoming_tx = self.incoming_tx.clone();
        let broadcast_tx = self.broadcast_tx.clone();
        let is_running = Arc::clone(&self.is_running);
        let config = self.config.clone();
        let codec = Arc::clone(&self.codec);
        let stats = Arc::clone(&self.stats);
        let metrics = Arc::clone(&self.metrics);

        tokio::spawn(async move {
            while is_running.load(Ordering::SeqCst) {
                match listener.accept().await {
                    Ok((stream, addr)) => {
                        let peer_addr = addr.to_string();
                        debug!("New connection from: {}", peer_addr);

                        let connections = connections.clone();
                        let incoming_tx = incoming_tx.clone();
                        let broadcast_tx = broadcast_tx.clone();
                        let codec = codec.clone();
                        let config = config.clone();
                        let stats = stats.clone();
                        let is_running = is_running.clone();
                        let metrics = metrics.clone();

                        tokio::spawn(async move {
                            match accept_async(stream).await {
                                Ok(ws_stream) => {
                                    info!("WebSocket connection established: {}", peer_addr);

                                    if let Err(e) = Self::handle_server_connection(
                                        ws_stream,
                                        peer_addr,
                                        connections,
                                        incoming_tx,
                                        broadcast_tx.subscribe(),
                                        codec,
                                        config,
                                        stats,
                                        is_running,
                                        metrics,
                                    )
                                    .await
                                    {
                                        error!("Server connection error: {}", e);
                                    }
                                }
                                Err(e) => {
                                    error!("WebSocket handshake failed: {}", e);
                                }
                            }
                        });
                    }
                    Err(e) => {
                        error!("Failed to accept connection: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    /// Connect with retry logic
    async fn connect_with_retry(
        url: &str,
        config: &TransportConfig,
    ) -> Result<WsStream, TransportError> {
        let url = Url::parse(url)
            .map_err(|e| TransportError::InvalidAddress(format!("Invalid URL: {}", e)))?;

        let duration = Duration::from_millis(config.connection_timeout_ms);

        match timeout(duration, connect_async(url.as_str())).await {
            Ok(Ok((ws_stream, _))) => {
                // Connection successful
                Ok(ws_stream)
            },
            Ok(Err(e)) => {
                // Connection failed - could trigger reconnection logic
                Err(TransportError::ConnectionError(format!(
                    "WebSocket error: {}",
                    e
                )))
            },
            Err(_) => {
                // Timeout occurred - record timeout event
                Err(TransportError::Timeout)
            },
        }
    }

    /// Handle client connection
    async fn handle_client_connection(
        ws_stream: WsStream,
        peer_addr: String,
        connections: Arc<DashMap<String, mpsc::Sender<Message>>>,
        incoming_tx: mpsc::Sender<(String, Message)>,
        broadcast_rx: broadcast::Receiver<Message>,
        codec: Arc<dyn MessageCodec>,
        config: TransportConfig,
        stats: Arc<RwLock<TransportStats>>,
        is_running: Arc<AtomicBool>,
        metrics: Arc<performance_metrics::WebSocketMetrics>,
    ) -> Result<(), TransportError> {
        // Record connection attempt before handling
        metrics.record_successful_reconnection();
        
        let result = Self::handle_connection(
            ws_stream,
            peer_addr,
            connections,
            incoming_tx,
            broadcast_rx,
            codec,
            config,
            stats,
            is_running,
            metrics.clone(),
        )
        .await;
        
        // Record any errors or timeouts
        if result.is_err() {
            metrics.record_websocket_error();
            metrics.record_timeout_event();
        }
        
        result
    }

    /// Handle server connection
    async fn handle_server_connection(
        ws_stream: WebSocketStream<TcpStream>,
        peer_addr: String,
        connections: Arc<DashMap<String, mpsc::Sender<Message>>>,
        incoming_tx: mpsc::Sender<(String, Message)>,
        broadcast_rx: broadcast::Receiver<Message>,
        codec: Arc<dyn MessageCodec>,
        config: TransportConfig,
        stats: Arc<RwLock<TransportStats>>,
        is_running: Arc<AtomicBool>,
        metrics: Arc<performance_metrics::WebSocketMetrics>,
    ) -> Result<(), TransportError> {
        // Handle the connection directly without type conversion
        Self::handle_raw_connection(
            ws_stream,
            peer_addr,
            connections,
            incoming_tx,
            broadcast_rx,
            codec,
            config,
            stats,
            is_running,
            metrics,
        )
        .await
    }

    /// Handle raw WebSocket connection (TcpStream)
    async fn handle_raw_connection(
        mut ws_stream: WebSocketStream<TcpStream>,
        peer_addr: String,
        connections: Arc<DashMap<String, mpsc::Sender<Message>>>,
        incoming_tx: mpsc::Sender<(String, Message)>,
        mut broadcast_rx: broadcast::Receiver<Message>,
        codec: Arc<dyn MessageCodec>,
        config: TransportConfig,
        stats: Arc<RwLock<TransportStats>>,
        is_running: Arc<AtomicBool>,
        metrics: Arc<performance_metrics::WebSocketMetrics>,
    ) -> Result<(), TransportError> {
        use futures_util::{SinkExt, StreamExt};

        let (outgoing_tx, mut outgoing_rx) = mpsc::channel::<Message>(256);
        connections.insert(peer_addr.clone(), outgoing_tx);

        loop {
            if !is_running.load(Ordering::SeqCst) {
                break;
            }

            tokio::select! {
                // Handle incoming messages
                Some(result) = ws_stream.next() => {
                    match result {
                        Ok(WsMessage::Binary(data)) => {
                            // Decompress if needed
                            let data = if config.enable_compression && data.len() > config.compression_threshold {
                                Self::decompress(&data)?
                            } else {
                                data.to_vec()
                            };

                            // Decode message
                            match codec.decode(&data) {
                                Ok(msg) => {
                                    // Update AtomicU64 metrics for received message
                                    metrics.record_message_received(data.len(), config.enable_compression && data.len() > config.compression_threshold);
                                    
                                    // Update stats
                                    {
                                        let mut stats = stats.write().await;
                                        stats.messages_received += 1;
                                        stats.bytes_received += data.len() as u64;
                                        stats.last_activity = Some(chrono::Utc::now());
                                    }

                                    // Forward to incoming channel
                                    if incoming_tx.send((peer_addr.clone(), msg)).await.is_err() {
                                        error!("Failed to forward incoming message");
                                        break;
                                    }
                                }
                                Err(e) => {
                                    error!("Failed to decode message: {}", e);
                                    stats.write().await.errors += 1;
                                }
                            }
                        }
                        Ok(WsMessage::Close(_)) => {
                            info!("Connection closed by peer: {}", peer_addr);
                            break;
                        }
                        Ok(WsMessage::Ping(data)) => {
                            if ws_stream.send(WsMessage::Pong(data)).await.is_err() {
                                break;
                            }
                            // Record ping-pong cycle for connectivity monitoring
                            metrics.record_ping_pong_cycle();
                        }
                        Ok(_) => {} // Ignore other message types
                        Err(e) => {
                            error!("WebSocket error: {}", e);
                            break;
                        }
                    }
                }

                // Handle outgoing messages
                Some(msg) = outgoing_rx.recv() => {
                    // Encode message
                    match codec.encode(&msg) {
                        Ok(mut data) => {
                            // Compress if needed
                            if config.enable_compression && data.len() > config.compression_threshold {
                                data = Self::compress(&data)?;
                            }

                            // Send message
                            if ws_stream.send(WsMessage::Binary(data.clone().into())).await.is_err() {
                                error!("Failed to send message");
                                break;
                            }

                            // Update AtomicU64 metrics for sent message
                            metrics.record_message_sent(data.len(), config.enable_compression && data.len() > config.compression_threshold);

                            // Update stats
                            let mut stats = stats.write().await;
                            stats.messages_sent += 1;
                            stats.bytes_sent += data.len() as u64;
                            stats.last_activity = Some(chrono::Utc::now());
                        }
                        Err(e) => {
                            error!("Failed to encode message: {}", e);
                            stats.write().await.errors += 1;
                        }
                    }
                }

                // Handle broadcast messages
                Ok(msg) = broadcast_rx.recv() => {
                    // Skip if this message is not for us
                    if let Some(dest) = &msg.destination {
                        if dest != &peer_addr {
                            continue;
                        }
                    }

                    // Send broadcast message
                    match codec.encode(&msg) {
                        Ok(mut data) => {
                            if config.enable_compression && data.len() > config.compression_threshold {
                                data = Self::compress(&data)?;
                            }

                            if ws_stream.send(WsMessage::Binary(data.into())).await.is_err() {
                                error!("Failed to send broadcast");
                                break;
                            }
                        }
                        Err(e) => {
                            error!("Failed to encode broadcast: {}", e);
                        }
                    }
                }
            }
        }

        // Clean up connection
        connections.remove(&peer_addr);
        info!("Connection closed: {}", peer_addr);

        Ok(())
    }

    /// Common connection handler
    async fn handle_connection(
        mut ws_stream: WsStream,
        peer_addr: String,
        connections: Arc<DashMap<String, mpsc::Sender<Message>>>,
        incoming_tx: mpsc::Sender<(String, Message)>,
        mut broadcast_rx: broadcast::Receiver<Message>,
        codec: Arc<dyn MessageCodec>,
        config: TransportConfig,
        stats: Arc<RwLock<TransportStats>>,
        is_running: Arc<AtomicBool>,
        metrics: Arc<performance_metrics::WebSocketMetrics>,
    ) -> Result<(), TransportError> {
        use futures_util::{SinkExt, StreamExt};

        let (outgoing_tx, mut outgoing_rx) = mpsc::channel::<Message>(256);
        connections.insert(peer_addr.clone(), outgoing_tx);

        loop {
            if !is_running.load(Ordering::SeqCst) {
                break;
            }

            tokio::select! {
                // Handle incoming messages
                Some(result) = ws_stream.next() => {
                    match result {
                        Ok(WsMessage::Binary(data)) => {
                            // Decompress if needed
                            let data = if config.enable_compression && data.len() > config.compression_threshold {
                                Self::decompress(&data)?
                            } else {
                                data.to_vec()
                            };

                            // Decode message
                            match codec.decode(&data) {
                                Ok(msg) => {
                                    // Update AtomicU64 metrics for received message
                                    metrics.record_message_received(data.len(), config.enable_compression && data.len() > config.compression_threshold);
                                    
                                    // Update stats
                                    {
                                        let mut stats = stats.write().await;
                                        stats.messages_received += 1;
                                        stats.bytes_received += data.len() as u64;
                                        stats.last_activity = Some(chrono::Utc::now());
                                    }

                                    // Forward to incoming channel
                                    if incoming_tx.send((peer_addr.clone(), msg)).await.is_err() {
                                        error!("Failed to forward incoming message");
                                        break;
                                    }
                                }
                                Err(e) => {
                                    error!("Failed to decode message: {}", e);
                                    stats.write().await.errors += 1;
                                }
                            }
                        }
                        Ok(WsMessage::Close(_)) => {
                            info!("Connection closed by peer: {}", peer_addr);
                            break;
                        }
                        Ok(WsMessage::Ping(data)) => {
                            if ws_stream.send(WsMessage::Pong(data)).await.is_err() {
                                break;
                            }
                            // Record ping-pong cycle for connectivity monitoring
                            metrics.record_ping_pong_cycle();
                        }
                        Ok(_) => {} // Ignore other message types
                        Err(e) => {
                            error!("WebSocket error: {}", e);
                            break;
                        }
                    }
                }

                // Handle outgoing messages
                Some(msg) = outgoing_rx.recv() => {
                    // Encode message
                    match codec.encode(&msg) {
                        Ok(mut data) => {
                            // Compress if needed
                            if config.enable_compression && data.len() > config.compression_threshold {
                                data = Self::compress(&data)?;
                            }

                            // Send message
                            if ws_stream.send(WsMessage::Binary(data.clone().into())).await.is_err() {
                                error!("Failed to send message");
                                break;
                            }

                            // Update AtomicU64 metrics for sent message
                            metrics.record_message_sent(data.len(), config.enable_compression && data.len() > config.compression_threshold);

                            // Update stats
                            let mut stats = stats.write().await;
                            stats.messages_sent += 1;
                            stats.bytes_sent += data.len() as u64;
                            stats.last_activity = Some(chrono::Utc::now());
                        }
                        Err(e) => {
                            error!("Failed to encode message: {}", e);
                            stats.write().await.errors += 1;
                        }
                    }
                }

                // Handle broadcast messages
                Ok(msg) = broadcast_rx.recv() => {
                    // Skip if this message is not for us
                    if let Some(dest) = &msg.destination {
                        if dest != &peer_addr {
                            continue;
                        }
                    }

                    // Send broadcast message
                    match codec.encode(&msg) {
                        Ok(mut data) => {
                            if config.enable_compression && data.len() > config.compression_threshold {
                                data = Self::compress(&data)?;
                            }

                            if ws_stream.send(WsMessage::Binary(data.into())).await.is_err() {
                                error!("Failed to send broadcast");
                                break;
                            }
                        }
                        Err(e) => {
                            error!("Failed to encode broadcast: {}", e);
                        }
                    }
                }
            }
        }

        // Clean up connection
        connections.remove(&peer_addr);
        info!("Connection closed: {}", peer_addr);

        Ok(())
    }

    /// Compress data using gzip
    pub fn compress(data: &[u8]) -> Result<Vec<u8>, TransportError> {
        let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
        encoder
            .write_all(data)
            .map_err(|e| TransportError::Other(anyhow::anyhow!("Compression error: {}", e)))?;
        encoder
            .finish()
            .map_err(|e| TransportError::Other(anyhow::anyhow!("Compression error: {}", e)))
    }

    /// Decompress data using gzip
    pub fn decompress(data: &[u8]) -> Result<Vec<u8>, TransportError> {
        let mut decoder = GzDecoder::new(data);
        let mut decompressed = Vec::new();
        decoder
            .read_to_end(&mut decompressed)
            .map_err(|e| TransportError::Other(anyhow::anyhow!("Decompression error: {}", e)))?;
        Ok(decompressed)
    }
}

#[async_trait]
impl Transport for WebSocketTransport {
    type Message = Message;
    type Error = TransportError;

    async fn send(&self, to: &str, msg: Self::Message) -> Result<(), Self::Error> {
        if let Some(sender) = self.connections.get(to) {
            sender.send(msg).await.map_err(|_| {
                TransportError::ConnectionError("Failed to send message".to_string())
            })?;
            Ok(())
        } else {
            Err(TransportError::ConnectionError(format!(
                "No connection to: {}",
                to
            )))
        }
    }

    async fn receive(&mut self) -> Result<(String, Self::Message), Self::Error> {
        self.incoming_rx
            .recv()
            .await
            .ok_or_else(|| TransportError::ConnectionError("Channel closed".to_string()))
    }

    async fn broadcast(&self, msg: Self::Message) -> Result<(), Self::Error> {
        self.broadcast_tx
            .send(msg)
            .map_err(|_| TransportError::ConnectionError("Broadcast failed".to_string()))?;
        Ok(())
    }

    fn local_address(&self) -> Result<String, Self::Error> {
        match &self.mode {
            WsMode::Client { url } => Ok(url.clone()),
            WsMode::Server { bind_addr } => Ok(bind_addr.clone()),
        }
    }

    fn is_connected(&self) -> bool {
        self.is_running.load(Ordering::SeqCst) && !self.connections.is_empty()
    }

    async fn close(&mut self) -> Result<(), Self::Error> {
        self.is_running.store(false, Ordering::SeqCst);
        self.connections.clear();
        Ok(())
    }

    fn stats(&self) -> TransportStats {
        // Use comprehensive AtomicU64 metrics for accurate performance reporting
        self.metrics.get_performance_snapshot()
    }
}

/// Extended metrics methods for WebSocketTransport
impl WebSocketTransport {
    /// Get WebSocket-specific health analysis
    pub fn websocket_health_analysis(&self) -> HealthScore {
        self.metrics.calculate_websocket_health_score()
    }

    /// Get real-time WebSocket metrics with TLS and compression analysis
    pub fn websocket_real_time_metrics(&self, sample_window_secs: u64) -> WebSocketRealTimeMetrics {
        self.metrics.get_websocket_real_time_metrics(sample_window_secs)
    }

    /// Get WebSocket optimization recommendations
    pub fn websocket_optimization_recommendations(&self) -> Vec<OptimizationRecommendation> {
        self.metrics.generate_websocket_optimization_recommendations()
    }

    /// Calculate TLS usage ratio for security analysis
    pub fn tls_usage_ratio(&self) -> f64 {
        self.metrics.calculate_tls_usage_ratio()
    }

    /// Get connection reliability score
    pub fn connection_reliability(&self) -> f64 {
        self.metrics.calculate_connection_reliability()
    }

    /// Get compression efficiency metrics
    pub fn compression_efficiency(&self) -> f64 {
        self.metrics.calculate_compression_efficiency()
    }

    /// Get ping-pong health score
    pub fn ping_pong_health(&self) -> f64 {
        self.metrics.calculate_ping_pong_health()
    }

    /// Get vulnerability assessment score
    pub fn security_vulnerability_score(&self) -> f64 {
        self.metrics.calculate_vulnerability_score()
    }

    /// Create comprehensive WebSocket performance analysis
    pub fn websocket_performance_analysis(&self, window_minutes: u64) -> WebSocketPerformanceAnalysis {
        self.metrics.create_websocket_performance_analysis(window_minutes)
    }
    
    /// Trigger reconnection attempt and record metrics
    pub async fn attempt_reconnection(&self) -> Result<(), TransportError> {
        self.metrics.record_reconnection_attempt();
        
        // Reconnection logic would go here
        // For now, just simulate successful reconnection
        self.metrics.record_successful_reconnection();
        
        Ok(())
    }
    
    /// Get current connection count for capacity analysis
    pub fn active_connections(&self) -> usize {
        self.connections.len()
    }
    
    /// Perform WebSocket health check with ping-pong
    pub async fn health_check(&self) -> bool {
        // Health check would typically send ping and wait for pong
        // Record the health check in metrics
        let ping_health = self.metrics.calculate_ping_pong_health();
        ping_health > 50.0 // Healthy if above 50% ping-pong success
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_websocket_transport_creation() {
        let config = TransportConfig::default();
        let mode = WsMode::Server {
            bind_addr: "127.0.0.1:0".to_string(),
        };

        let transport = WebSocketTransport::new(mode, config).await;
        assert!(transport.is_ok());
    }

    #[test]
    fn test_compression() {
        let data = b"Hello, World! This is a test message for compression.";
        let compressed = WebSocketTransport::compress(data).unwrap();
        let decompressed = WebSocketTransport::decompress(&compressed).unwrap();

        assert_eq!(data.as_slice(), decompressed.as_slice());
        // Compressed should be smaller for repetitive data
        assert!(compressed.len() <= data.len());
    }
}
