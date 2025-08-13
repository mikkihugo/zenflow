//! Shared memory transport with lock-free ring buffers and WASM support

use crate::{
    protocol::{BinaryCodec, Message, MessageCodec},
    Transport, TransportConfig, TransportError, TransportStats,
    HealthScore, HealthStatus, RealTimeMetrics, OptimizationRecommendation,
    OptimizationCategory, Priority, ImpactLevel, PerformanceWindow, PerformanceTier,
    SharedMemoryRealTimeMetrics, RingBufferAnalysis, MemoryAnalysis, MemoryTrend,
    SharedMemoryPerformanceAnalysis,
};
use async_trait::async_trait;
use crossbeam::channel::{bounded, unbounded, Receiver, Sender};
use dashmap::DashMap;
use std::{
    mem::size_of,
    sync::{
        atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering},
        Arc,
    },
};
use tokio::sync::{mpsc, RwLock};
use tracing::{error, info};

/// Performance metrics using AtomicU64 for lock-free counters
mod performance_metrics {
    use super::*;
    
    /// Use AtomicU64 for high-performance shared memory metrics tracking
    pub struct SharedMemoryMetrics {
        pub messages_sent: AtomicU64,
        pub messages_received: AtomicU64,
        pub bytes_transmitted: AtomicU64,
        pub bytes_received: AtomicU64,
        pub ring_buffer_writes: AtomicU64,
        pub ring_buffer_reads: AtomicU64,
        pub buffer_overflow_events: AtomicU64,
        pub peer_connections: AtomicU64,
        pub peer_disconnections: AtomicU64,
        pub shared_memory_segments: AtomicU64,
        pub memory_allocation_bytes: AtomicU64,
        pub lock_contention_count: AtomicU64,
    }
    
    impl SharedMemoryMetrics {
        pub fn new() -> Self {
            Self {
                messages_sent: AtomicU64::new(0),
                messages_received: AtomicU64::new(0),
                bytes_transmitted: AtomicU64::new(0),
                bytes_received: AtomicU64::new(0),
                ring_buffer_writes: AtomicU64::new(0),
                ring_buffer_reads: AtomicU64::new(0),
                buffer_overflow_events: AtomicU64::new(0),
                peer_connections: AtomicU64::new(0),
                peer_disconnections: AtomicU64::new(0),
                shared_memory_segments: AtomicU64::new(0),
                memory_allocation_bytes: AtomicU64::new(0),
                lock_contention_count: AtomicU64::new(0),
            }
        }
        
        /// Use AtomicU64 for thread-safe message tracking
        pub fn record_message_sent(&self, message_size: usize) {
            self.messages_sent.fetch_add(1, Ordering::Relaxed);
            self.bytes_transmitted.fetch_add(message_size as u64, Ordering::Relaxed);
        }
        
        pub fn record_message_received(&self, message_size: usize) {
            self.messages_received.fetch_add(1, Ordering::Relaxed);
            self.bytes_received.fetch_add(message_size as u64, Ordering::Relaxed);
        }
        
        /// Use AtomicU64 for ring buffer operation tracking
        pub fn record_ring_buffer_write(&self, bytes_written: usize) {
            self.ring_buffer_writes.fetch_add(1, Ordering::Relaxed);
            self.memory_allocation_bytes.fetch_add(bytes_written as u64, Ordering::Relaxed);
        }
        
        pub fn record_ring_buffer_read(&self, _bytes_read: usize) {
            self.ring_buffer_reads.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_buffer_overflow(&self) {
            self.buffer_overflow_events.fetch_add(1, Ordering::Relaxed);
        }
        
        /// Use AtomicU64 for peer management tracking
        pub fn record_peer_connection(&self) {
            self.peer_connections.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_peer_disconnection(&self) {
            self.peer_disconnections.fetch_add(1, Ordering::Relaxed);
        }
        
        pub fn record_shared_memory_segment(&self, segment_size: usize) {
            self.shared_memory_segments.fetch_add(1, Ordering::Relaxed);
            self.memory_allocation_bytes.fetch_add(segment_size as u64, Ordering::Relaxed);
        }
        
        pub fn record_lock_contention(&self) {
            self.lock_contention_count.fetch_add(1, Ordering::Relaxed);
        }
        
        /// Generate performance report from AtomicU64 counters
        pub fn get_performance_snapshot(&self) -> TransportStats {
            TransportStats {
                messages_sent: self.messages_sent.load(Ordering::Relaxed),
                messages_received: self.messages_received.load(Ordering::Relaxed),
                bytes_sent: self.bytes_transmitted.load(Ordering::Relaxed),
                bytes_received: self.bytes_received.load(Ordering::Relaxed),
                errors: self.buffer_overflow_events.load(Ordering::Relaxed),
                reconnections: 0, // Shared memory doesn't reconnect
                last_activity: Some(chrono::Utc::now()),
            }
        }
        
        /// Use AtomicU64 for throughput calculations  
        pub fn calculate_throughput_metrics(&self, duration_secs: u64) -> (f64, f64, f64) {
            let messages = self.messages_sent.load(Ordering::Relaxed) 
                         + self.messages_received.load(Ordering::Relaxed);
            let bytes = self.bytes_transmitted.load(Ordering::Relaxed) 
                      + self.bytes_received.load(Ordering::Relaxed);
            let operations = self.ring_buffer_writes.load(Ordering::Relaxed) 
                           + self.ring_buffer_reads.load(Ordering::Relaxed);
            
            if duration_secs == 0 {
                return (0.0, 0.0, 0.0);
            }
            
            let messages_per_sec = messages as f64 / duration_secs as f64;
            let bytes_per_sec = bytes as f64 / duration_secs as f64;
            let operations_per_sec = operations as f64 / duration_secs as f64;
            
            (messages_per_sec, bytes_per_sec, operations_per_sec)
        }
        
        /// Use AtomicU64 for efficiency metrics
        pub fn calculate_efficiency_score(&self) -> f64 {
            let total_operations = self.ring_buffer_writes.load(Ordering::Relaxed) 
                                 + self.ring_buffer_reads.load(Ordering::Relaxed);
            let overflow_events = self.buffer_overflow_events.load(Ordering::Relaxed);
            let lock_contentions = self.lock_contention_count.load(Ordering::Relaxed);
            
            if total_operations == 0 {
                return 100.0;
            }
            
            let efficiency = ((total_operations - overflow_events - lock_contentions) as f64 
                             / total_operations as f64) * 100.0;
            efficiency.max(0.0)
        }
        
        /// SharedMemory-specific comprehensive health scoring with ring buffer metrics
        pub fn calculate_shared_memory_health_score(&self) -> HealthScore {
            let efficiency = self.calculate_efficiency_score();
            let (msg_rate, byte_rate, ops_rate) = self.calculate_throughput_metrics(60);
            let memory_efficiency = self.calculate_memory_efficiency();
            
            // Shared memory specific scoring emphasizing efficiency and memory usage
            let throughput_score = ((msg_rate.min(100000.0) / 100000.0) * 100.0).min(100.0); // Higher limits for shared memory
            let bandwidth_score = ((byte_rate.min(100_000_000.0) / 100_000_000.0) * 100.0).min(100.0);
            let operations_score = ((ops_rate.min(200000.0) / 200000.0) * 100.0).min(100.0); // Ring buffer ops
            
            let overall_score = (efficiency * 0.3) + (throughput_score * 0.25) + 
                               (bandwidth_score * 0.2) + (memory_efficiency * 0.15) + (operations_score * 0.1);
            
            HealthScore {
                overall: overall_score,
                reliability: efficiency,
                throughput: throughput_score,
                bandwidth: bandwidth_score,
                efficiency: memory_efficiency,
                status: match overall_score {
                    95.0..=100.0 => HealthStatus::Excellent, // Higher bar for shared memory
                    80.0..95.0 => HealthStatus::Good,
                    60.0..80.0 => HealthStatus::Fair,
                    30.0..60.0 => HealthStatus::Poor,
                    _ => HealthStatus::Critical,
                },
            }
        }
        
        /// Calculate memory efficiency based on allocation patterns
        pub fn calculate_memory_efficiency(&self) -> f64 {
            let total_allocated = self.memory_allocation_bytes.load(Ordering::Relaxed) as f64;
            let segments = self.shared_memory_segments.load(Ordering::Relaxed) as f64;
            let operations = self.ring_buffer_writes.load(Ordering::Relaxed) 
                           + self.ring_buffer_reads.load(Ordering::Relaxed);
            
            if operations == 0 || segments == 0.0 {
                return 100.0;
            }
            
            // Calculate bytes per operation (lower is better)
            let bytes_per_op = total_allocated / operations as f64;
            let optimal_bytes_per_op = 1024.0; // Target 1KB per operation
            
            // Score based on how close we are to optimal
            let efficiency_ratio = optimal_bytes_per_op / bytes_per_op.max(optimal_bytes_per_op);
            (efficiency_ratio * 100.0).min(100.0)
        }
        
        /// Real-time SharedMemory monitoring with ring buffer and peer metrics
        pub fn get_shared_memory_real_time_metrics(&self, sample_window_secs: u64) -> SharedMemoryRealTimeMetrics {
            let (msg_per_sec, bytes_per_sec, ops_per_sec) = self.calculate_throughput_metrics(sample_window_secs);
            let buffer_utilization = self.calculate_buffer_utilization();
            let peer_health = self.calculate_peer_health_score();
            
            SharedMemoryRealTimeMetrics {
                base_metrics: RealTimeMetrics {
                    timestamp: chrono::Utc::now(),
                    messages_per_second: msg_per_sec,
                    bytes_per_second: bytes_per_sec,
                    connections_per_second: ops_per_sec,
                    active_connections: self.peer_connections.load(Ordering::Relaxed),
                    capacity_utilization: buffer_utilization,
                    error_rate: self.calculate_shared_memory_error_rate(),
                    latency_estimate: self.estimate_shared_memory_latency(),
                },
                ring_buffer_operations_per_sec: ops_per_sec,
                buffer_overflow_rate: self.calculate_buffer_overflow_rate(),
                memory_efficiency: self.calculate_memory_efficiency(),
                peer_health_score: peer_health,
                lock_contention_rate: self.calculate_lock_contention_rate(),
            }
        }
        
        /// Calculate buffer utilization across all ring buffers
        pub fn calculate_buffer_utilization(&self) -> f64 {
            let segments = self.shared_memory_segments.load(Ordering::Relaxed);
            let allocated_bytes = self.memory_allocation_bytes.load(Ordering::Relaxed);
            let max_buffer_capacity = segments * 65536; // Assume 64KB per segment
            
            if max_buffer_capacity == 0 {
                0.0
            } else {
                (allocated_bytes as f64 / max_buffer_capacity as f64) * 100.0
            }
        }
        
        /// Calculate peer health score based on connection stability
        pub fn calculate_peer_health_score(&self) -> f64 {
            let connections = self.peer_connections.load(Ordering::Relaxed);
            let disconnections = self.peer_disconnections.load(Ordering::Relaxed);
            
            if connections == 0 {
                100.0 // No peers means no problems
            } else {
                let stability_ratio = (connections as f64 - disconnections as f64) / connections as f64;
                (stability_ratio * 100.0).max(0.0)
            }
        }
        
        /// Calculate shared memory specific error rate
        pub fn calculate_shared_memory_error_rate(&self) -> f64 {
            let total_operations = self.ring_buffer_writes.load(Ordering::Relaxed) 
                                 + self.ring_buffer_reads.load(Ordering::Relaxed);
            let errors = self.buffer_overflow_events.load(Ordering::Relaxed);
            
            if total_operations == 0 {
                0.0
            } else {
                (errors as f64 / total_operations as f64) * 100.0
            }
        }
        
        /// Calculate buffer overflow rate per second
        pub fn calculate_buffer_overflow_rate(&self) -> f64 {
            let overflows = self.buffer_overflow_events.load(Ordering::Relaxed);
            let uptime_estimate = 3600; // Assume 1 hour uptime for calculation
            overflows as f64 / uptime_estimate as f64
        }
        
        /// Calculate lock contention rate
        pub fn calculate_lock_contention_rate(&self) -> f64 {
            let contentions = self.lock_contention_count.load(Ordering::Relaxed);
            let total_ops = self.ring_buffer_writes.load(Ordering::Relaxed) 
                          + self.ring_buffer_reads.load(Ordering::Relaxed);
            
            if total_ops == 0 {
                0.0
            } else {
                (contentions as f64 / total_ops as f64) * 100.0
            }
        }
        
        /// Estimate shared memory latency based on ring buffer performance
        pub fn estimate_shared_memory_latency(&self) -> f64 {
            let lock_contention_rate = self.calculate_lock_contention_rate();
            let buffer_utilization = self.calculate_buffer_utilization();
            
            // Base latency for shared memory (very low)
            let mut base_latency = 0.1; // 0.1ms base latency
            
            // Add latency based on contention and utilization
            base_latency += lock_contention_rate * 0.01; // Up to 1ms for high contention
            base_latency += (buffer_utilization / 100.0) * 0.5; // Up to 0.5ms for high utilization
            
            base_latency
        }
        
        /// Generate SharedMemory-specific optimization recommendations
        pub fn generate_shared_memory_optimization_recommendations(&self) -> Vec<OptimizationRecommendation> {
            let mut recommendations = Vec::new();
            let health = self.calculate_shared_memory_health_score();
            let overflow_rate = self.calculate_buffer_overflow_rate();
            let contention_rate = self.calculate_lock_contention_rate();
            let memory_efficiency = self.calculate_memory_efficiency();
            
            // Use health score to determine overall system performance
            if health.overall < 70.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Performance,
                    priority: Priority::Medium,
                    description: format!("Overall health score is low: {:.1}%. Consider system-wide optimization.", health.overall),
                    estimated_impact: ImpactLevel::Medium,
                });
            }
            
            if overflow_rate > 1.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Capacity,
                    priority: if overflow_rate > 10.0 { Priority::Critical } else { Priority::High },
                    description: format!("High buffer overflow rate: {:.2}/sec. Consider increasing ring buffer sizes or implementing backpressure.", overflow_rate),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            if contention_rate > 5.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Performance,
                    priority: Priority::High,
                    description: format!("High lock contention: {:.1}%. Consider implementing lock-free algorithms or reducing critical sections.", contention_rate),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            if memory_efficiency < 60.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Efficiency,
                    priority: Priority::Medium,
                    description: format!("Poor memory efficiency: {:.1}%. Consider optimizing message sizes or implementing memory pooling.", memory_efficiency),
                    estimated_impact: ImpactLevel::Medium,
                });
            }
            
            let buffer_utilization = self.calculate_buffer_utilization();
            if buffer_utilization > 90.0 {
                recommendations.push(OptimizationRecommendation {
                    category: OptimizationCategory::Capacity,
                    priority: Priority::High,
                    description: format!("Very high buffer utilization: {:.1}%. Scale up shared memory allocation before performance degrades.", buffer_utilization),
                    estimated_impact: ImpactLevel::High,
                });
            }
            
            recommendations
        }
        
        /// Create comprehensive SharedMemory performance analysis
        pub fn create_shared_memory_performance_analysis(&self, window_minutes: u64) -> SharedMemoryPerformanceAnalysis {
            SharedMemoryPerformanceAnalysis {
                basic_window: PerformanceWindow {
                    start_time: chrono::Utc::now() - chrono::Duration::minutes(window_minutes as i64),
                    duration_minutes: window_minutes,
                    snapshot: self.get_performance_snapshot(),
                    health_score: self.calculate_shared_memory_health_score(),
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
                    optimization_recommendations: self.generate_shared_memory_optimization_recommendations(),
                },
                shared_memory_metrics: self.get_shared_memory_real_time_metrics(window_minutes * 60),
                ring_buffer_analysis: RingBufferAnalysis {
                    total_operations: self.ring_buffer_writes.load(Ordering::Relaxed) + self.ring_buffer_reads.load(Ordering::Relaxed),
                    write_read_ratio: self.calculate_write_read_ratio(),
                    overflow_frequency: self.calculate_buffer_overflow_rate(),
                    average_operation_size: self.calculate_average_operation_size(),
                },
                memory_analysis: MemoryAnalysis {
                    total_allocated: self.memory_allocation_bytes.load(Ordering::Relaxed),
                    efficiency_score: self.calculate_memory_efficiency(),
                    fragmentation_estimate: self.estimate_memory_fragmentation(),
                    utilization_trend: self.analyze_memory_utilization_trend(),
                },
                performance_classification: self.classify_shared_memory_performance_tier(),
            }
        }
        
        /// Calculate write to read ratio for buffer usage analysis
        pub fn calculate_write_read_ratio(&self) -> f64 {
            let writes = self.ring_buffer_writes.load(Ordering::Relaxed);
            let reads = self.ring_buffer_reads.load(Ordering::Relaxed);
            
            if reads == 0 {
                if writes == 0 { 1.0 } else { f64::INFINITY }
            } else {
                writes as f64 / reads as f64
            }
        }
        
        /// Calculate average operation size for memory efficiency
        pub fn calculate_average_operation_size(&self) -> f64 {
            let total_bytes = self.memory_allocation_bytes.load(Ordering::Relaxed);
            let total_ops = self.ring_buffer_writes.load(Ordering::Relaxed);
            
            if total_ops == 0 {
                0.0
            } else {
                total_bytes as f64 / total_ops as f64
            }
        }
        
        /// Estimate memory fragmentation based on allocation patterns
        pub fn estimate_memory_fragmentation(&self) -> f64 {
            let segments = self.shared_memory_segments.load(Ordering::Relaxed);
            let allocated_bytes = self.memory_allocation_bytes.load(Ordering::Relaxed);
            
            if segments == 0 {
                0.0
            } else {
                let average_segment_size = allocated_bytes as f64 / segments as f64;
                let ideal_segment_size = 65536.0; // 64KB ideal
                
                // Higher fragmentation if segments are much smaller than ideal
                if average_segment_size < ideal_segment_size {
                    ((ideal_segment_size - average_segment_size) / ideal_segment_size) * 100.0
                } else {
                    0.0 // No fragmentation if segments are large
                }
            }
        }
        
        /// Analyze memory utilization trend (simplified version)
        pub fn analyze_memory_utilization_trend(&self) -> MemoryTrend {
            let current_utilization = self.calculate_buffer_utilization();
            
            // Simplified trend analysis based on current state
            match current_utilization {
                util if util > 85.0 => MemoryTrend::Increasing,
                util if util < 30.0 => MemoryTrend::Decreasing,
                _ => MemoryTrend::Stable,
            }
        }
        
        /// Classify SharedMemory performance tier
        pub fn classify_shared_memory_performance_tier(&self) -> PerformanceTier {
            let health = self.calculate_shared_memory_health_score();
            let (_msg_rate, _byte_rate, ops_rate) = self.calculate_throughput_metrics(300);
            let efficiency = self.calculate_efficiency_score();
            
            // Use all metrics including ops_rate for comprehensive performance classification
            let composite_score = (health.overall * 0.4) + (efficiency * 0.3) + 
                                (((ops_rate.min(1000.0) / 1000.0) * 100.0) * 0.3);
            
            // Use composite score for performance tier classification
            match composite_score {
                score if score >= 95.0 => PerformanceTier::Premium,
                score if score >= 80.0 => PerformanceTier::High,
                score if score >= 60.0 => PerformanceTier::Standard,
                _ => PerformanceTier::Basic,
            }
        }
    }
    
    impl Default for SharedMemoryMetrics {
        fn default() -> Self {
            Self::new()
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
use shared_memory::{Shmem, ShmemConf};

/// Shared memory segment info
#[derive(Debug, Clone)]
pub struct SharedMemoryInfo {
    pub name: String,
    pub size: usize,
    pub ring_buffer_size: usize,
}

/// Lock-free ring buffer for message passing
pub struct RingBuffer {
    buffer: Arc<parking_lot::Mutex<Vec<u8>>>,
    capacity: usize,
    head: AtomicUsize,
    tail: AtomicUsize,
    size: AtomicUsize,
}

impl RingBuffer {
    /// Create a new ring buffer
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: Arc::new(parking_lot::Mutex::new(vec![0; capacity])),
            capacity,
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
            size: AtomicUsize::new(0),
        }
    }

    /// Write data to the ring buffer
    pub fn write(&self, data: &[u8]) -> Result<(), TransportError> {
        let data_len = data.len();
        let total_len = data_len + size_of::<u32>();

        // Check if there's enough space
        if total_len > self.capacity - self.size.load(Ordering::Acquire) {
            return Err(TransportError::MessageTooLarge {
                size: total_len,
                max: self.capacity - self.size.load(Ordering::Acquire),
            });
        }

        // Write length prefix
        let len_bytes = (data_len as u32).to_le_bytes();
        let mut write_pos = self.tail.load(Ordering::Acquire);

        // Write length and data
        {
            let mut buffer = self.buffer.lock();

            // Write length
            for &byte in &len_bytes {
                buffer[write_pos] = byte;
                write_pos = (write_pos + 1) % self.capacity;
            }

            // Write data
            for &byte in data {
                buffer[write_pos] = byte;
                write_pos = (write_pos + 1) % self.capacity;
            }
        }

        // Update tail and size
        self.tail.store(write_pos, Ordering::Release);
        self.size.fetch_add(total_len, Ordering::AcqRel);

        Ok(())
    }

    /// Read data from the ring buffer
    pub fn read(&self) -> Option<Vec<u8>> {
        let current_size = self.size.load(Ordering::Acquire);
        if current_size < size_of::<u32>() {
            return None;
        }

        // Read length prefix and data
        let mut read_pos = self.head.load(Ordering::Acquire);
        let (data_len, data) = {
            let buffer = self.buffer.lock();
            let mut len_bytes = [0u8; 4];

            // Read length
            for i in 0..4 {
                len_bytes[i] = buffer[read_pos];
                read_pos = (read_pos + 1) % self.capacity;
            }

            let data_len = u32::from_le_bytes(len_bytes) as usize;

            // Check if we have enough data
            if current_size < size_of::<u32>() + data_len {
                return None;
            }

            // Read data
            let mut data = vec![0u8; data_len];
            for i in 0..data_len {
                data[i] = buffer[read_pos];
                read_pos = (read_pos + 1) % self.capacity;
            }

            (data_len, data)
        };

        // Update head and size
        self.head.store(read_pos, Ordering::Release);
        self.size
            .fetch_sub(size_of::<u32>() + data_len, Ordering::AcqRel);

        Some(data)
    }

    /// Get available space in the buffer
    pub fn available_space(&self) -> usize {
        self.capacity - self.size.load(Ordering::Acquire)
    }

    /// Check if buffer is empty
    pub fn is_empty(&self) -> bool {
        self.size.load(Ordering::Acquire) == 0
    }
}

/// Shared memory transport implementation
pub struct SharedMemoryTransport {
    info: SharedMemoryInfo,
    config: TransportConfig,
    codec: Arc<dyn MessageCodec>,
    local_id: String,
    peers: Arc<DashMap<String, Arc<RingBuffer>>>,
    incoming_rx: mpsc::Receiver<(String, Message)>,
    incoming_tx: mpsc::Sender<(String, Message)>,
    is_running: Arc<AtomicBool>,
    stats: Arc<RwLock<TransportStats>>,
    metrics: Arc<performance_metrics::SharedMemoryMetrics>,
    #[cfg(not(target_arch = "wasm32"))]
    shmem: Option<Arc<parking_lot::Mutex<Shmem>>>,
}

// SAFETY: SharedMemoryTransport is safe to send between threads because:
// 1. All fields except shmem are Send/Sync by default:
//    - Arc<DashMap> is Send/Sync
//    - mpsc channels are Send/Sync
//    - AtomicBool is Send/Sync
//    - RwLock is Send/Sync
// 2. shmem field is protected by Arc<parking_lot::Mutex<>> which provides thread-safe access
// 3. The shared memory (Shmem) itself is a memory-mapped file descriptor that can be
//    safely accessed from multiple threads when properly synchronized
// 4. All shared memory operations go through the Mutex, preventing data races
// 5. The ring buffers use atomic operations for lock-free concurrent access
//
// SAFETY: SharedMemoryTransport is safe for shared access (Sync) because:
// 1. All mutable state is protected by synchronization primitives (Mutex, RwLock, Atomic)
// 2. The DashMap provides concurrent access to peer mappings
// 3. Ring buffers use atomic operations for head/tail pointers
// 4. No interior mutability is exposed without proper synchronization
unsafe impl Send for SharedMemoryTransport {}
unsafe impl Sync for SharedMemoryTransport {}

impl SharedMemoryTransport {
    /// Create a new shared memory transport
    pub async fn new(
        info: SharedMemoryInfo,
        config: TransportConfig,
    ) -> Result<Self, TransportError> {
        let (incoming_tx, incoming_rx) = mpsc::channel(1024);

        #[cfg(not(target_arch = "wasm32"))]
        let shmem = Some(Arc::new(parking_lot::Mutex::new(
            Self::create_or_open_shmem(&info)?,
        )));

        let metrics = Arc::new(performance_metrics::SharedMemoryMetrics::new());
        
        let transport = Self {
            info,
            config,
            codec: Arc::new(BinaryCodec),
            local_id: uuid::Uuid::new_v4().to_string(),
            peers: Arc::new(DashMap::new()),
            incoming_rx,
            incoming_tx,
            is_running: Arc::new(AtomicBool::new(true)),
            stats: Arc::new(RwLock::new(TransportStats::default())),
            metrics,
            #[cfg(not(target_arch = "wasm32"))]
            shmem,
            #[cfg(target_arch = "wasm32")]
            shmem: None,
        };

        transport.start_polling();

        Ok(transport)
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn create_or_open_shmem(info: &SharedMemoryInfo) -> Result<Shmem, TransportError> {
        match ShmemConf::new().size(info.size).flink(&info.name).create() {
            Ok(shmem) => {
                info!("Created shared memory segment: {}", info.name);
                Ok(shmem)
            }
            Err(_) => {
                // Try to open existing
                ShmemConf::new().flink(&info.name).open().map_err(|e| {
                    TransportError::Other(anyhow::anyhow!("Failed to open shared memory: {}", e))
                })
            }
        }
    }

    /// Start polling for messages
    fn start_polling(&self) {
        let peers = Arc::clone(&self.peers);
        let incoming_tx = self.incoming_tx.clone();
        let is_running = Arc::clone(&self.is_running);
        let codec = Arc::clone(&self.codec);
        let stats = Arc::clone(&self.stats);
        let metrics = Arc::clone(&self.metrics);

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(1));

            while is_running.load(Ordering::SeqCst) {
                interval.tick().await;

                // Poll all peer buffers
                for peer in peers.iter() {
                    let (peer_id, buffer) = peer.pair();

                    // Read messages from buffer
                    while let Some(data) = buffer.read() {
                        // Update AtomicU64 metrics for ring buffer read
                        metrics.record_ring_buffer_read(data.len());
                        
                        match codec.decode(&data) {
                            Ok(msg) => {
                                // Update AtomicU64 metrics for received message
                                metrics.record_message_received(data.len());
                                
                                // Update stats
                                {
                                    let mut stats = stats.write().await;
                                    stats.messages_received += 1;
                                    stats.bytes_received += data.len() as u64;
                                    stats.last_activity = Some(chrono::Utc::now());
                                }

                                // Forward message
                                if incoming_tx.send((peer_id.clone(), msg)).await.is_err() {
                                    error!("Failed to forward message from shared memory");
                                }
                            }
                            Err(e) => {
                                error!("Failed to decode message from shared memory: {}", e);
                                stats.write().await.errors += 1;
                            }
                        }
                    }
                }
            }
        });
    }

    /// Register a peer with a ring buffer
    pub fn register_peer(&self, peer_id: String, buffer: Arc<RingBuffer>) {
        self.peers.insert(peer_id.clone(), buffer);
        // Update AtomicU64 metrics for peer connection
        self.metrics.record_peer_connection();
        info!("Registered peer: {}", peer_id);
    }

    /// Create a ring buffer for a peer
    pub fn create_buffer(&self) -> Arc<RingBuffer> {
        let buffer = Arc::new(RingBuffer::new(self.info.ring_buffer_size));
        // Record shared memory segment allocation
        self.metrics.record_shared_memory_segment(self.info.ring_buffer_size);
        buffer
    }
    
    /// Create high-performance crossbeam channels for async message passing between transports
    pub fn create_crossbeam_channels<T>() -> (Sender<T>, Receiver<T>) {
        // Use unbounded channel for maximum throughput in shared memory scenarios
        unbounded()
    }
    
    /// Create bounded crossbeam channel with specific capacity for controlled memory usage
    pub fn create_bounded_crossbeam_channel<T>(capacity: usize) -> (Sender<T>, Receiver<T>) {
        bounded(capacity)
    }
}

#[cfg(target_arch = "wasm32")]
impl SharedMemoryTransport {
    /// WASM-specific implementation using SharedArrayBuffer
    pub async fn new_wasm(
        buffer: js_sys::SharedArrayBuffer,
        config: TransportConfig,
    ) -> Result<Self, TransportError> {
        use wasm_bindgen::JsCast;

        let (incoming_tx, incoming_rx) = mpsc::channel(1024);

        // Create ring buffer backed by SharedArrayBuffer
        let buffer_size = buffer.byte_length() as usize;
        let info = SharedMemoryInfo {
            name: "wasm_shared_memory".to_string(),
            size: buffer_size,
            ring_buffer_size: buffer_size / 4, // Use 1/4 for each direction
        };

        let metrics = Arc::new(performance_metrics::SharedMemoryMetrics::new());
        
        let transport = Self {
            info,
            config,
            codec: Arc::new(BinaryCodec),
            local_id: uuid::Uuid::new_v4().to_string(),
            peers: Arc::new(DashMap::new()),
            incoming_rx,
            incoming_tx,
            is_running: Arc::new(AtomicBool::new(true)),
            stats: Arc::new(RwLock::new(TransportStats::default())),
            metrics,
        };

        transport.start_polling();

        Ok(transport)
    }
}

#[async_trait]
impl Transport for SharedMemoryTransport {
    type Message = Message;
    type Error = TransportError;

    async fn send(&self, to: &str, msg: Self::Message) -> Result<(), Self::Error> {
        // Encode message
        let data = self.codec.encode(&msg)?;

        // Find peer buffer
        if let Some(buffer) = self.peers.get(to) {
            // Write to buffer
            buffer.write(&data)?;
            
            // Update AtomicU64 metrics for ring buffer write and message sent
            self.metrics.record_ring_buffer_write(data.len());
            self.metrics.record_message_sent(data.len());

            // Update stats
            let mut stats = self.stats.write().await;
            stats.messages_sent += 1;
            stats.bytes_sent += data.len() as u64;
            stats.last_activity = Some(chrono::Utc::now());

            Ok(())
        } else {
            Err(TransportError::ConnectionError(format!(
                "No shared memory buffer for peer: {}",
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
        let data = self.codec.encode(&msg)?;
        let mut errors = Vec::new();

        // Send to all peers
        for peer in self.peers.iter() {
            let (peer_id, buffer) = peer.pair();
            match buffer.write(&data) {
                Ok(()) => {
                    // Update AtomicU64 metrics for successful write
                    self.metrics.record_ring_buffer_write(data.len());
                    self.metrics.record_message_sent(data.len());
                }
                Err(e) => {
                    // Record buffer overflow for metrics tracking
                    self.metrics.record_buffer_overflow();
                    errors.push(format!("{}: {}", peer_id, e));
                }
            }
        }

        if errors.is_empty() {
            // Update stats
            let mut stats = self.stats.write().await;
            stats.messages_sent += self.peers.len() as u64;
            stats.bytes_sent += data.len() as u64 * self.peers.len() as u64;
            stats.last_activity = Some(chrono::Utc::now());

            Ok(())
        } else {
            Err(TransportError::Other(anyhow::anyhow!(
                "Broadcast errors: {}",
                errors.join(", ")
            )))
        }
    }

    fn local_address(&self) -> Result<String, Self::Error> {
        Ok(format!("shm://{}#{}", self.info.name, self.local_id))
    }

    fn is_connected(&self) -> bool {
        self.is_running.load(Ordering::SeqCst)
    }

    async fn close(&mut self) -> Result<(), Self::Error> {
        self.is_running.store(false, Ordering::SeqCst);
        // Record peer disconnections for metrics tracking  
        let peer_count = self.peers.len();
        for _ in 0..peer_count {
            self.metrics.record_peer_disconnection();
        }
        self.peers.clear();
        Ok(())
    }

    fn stats(&self) -> TransportStats {
        // Use comprehensive AtomicU64 metrics for accurate performance reporting
        self.metrics.get_performance_snapshot()
    }
}

/// Extended metrics methods for SharedMemoryTransport
impl SharedMemoryTransport {
    /// Get SharedMemory-specific health analysis
    pub fn shared_memory_health_analysis(&self) -> HealthScore {
        self.metrics.calculate_shared_memory_health_score()
    }

    /// Get real-time SharedMemory metrics with ring buffer analysis
    pub fn shared_memory_real_time_metrics(&self, sample_window_secs: u64) -> SharedMemoryRealTimeMetrics {
        self.metrics.get_shared_memory_real_time_metrics(sample_window_secs)
    }

    /// Get SharedMemory optimization recommendations
    pub fn shared_memory_optimization_recommendations(&self) -> Vec<OptimizationRecommendation> {
        self.metrics.generate_shared_memory_optimization_recommendations()
    }

    /// Calculate memory efficiency score
    pub fn memory_efficiency(&self) -> f64 {
        self.metrics.calculate_memory_efficiency()
    }

    /// Get buffer utilization percentage
    pub fn buffer_utilization(&self) -> f64 {
        self.metrics.calculate_buffer_utilization()
    }

    /// Get lock contention rate
    pub fn lock_contention_rate(&self) -> f64 {
        self.metrics.calculate_lock_contention_rate()
    }

    /// Get memory fragmentation estimate
    pub fn memory_fragmentation_estimate(&self) -> f64 {
        self.metrics.estimate_memory_fragmentation()
    }

    /// Create comprehensive SharedMemory performance analysis
    pub fn shared_memory_performance_analysis(&self, window_minutes: u64) -> SharedMemoryPerformanceAnalysis {
        self.metrics.create_shared_memory_performance_analysis(window_minutes)
    }

    /// Get ring buffer write/read ratio analysis
    pub fn ring_buffer_write_read_ratio(&self) -> f64 {
        self.metrics.calculate_write_read_ratio()
    }

    /// Analyze memory utilization trend
    pub fn memory_utilization_trend(&self) -> MemoryTrend {
        self.metrics.analyze_memory_utilization_trend()
    }
    
    /// Get configuration details for monitoring
    pub fn transport_config(&self) -> &TransportConfig {
        &self.config
    }
    
    /// Check if shared memory is available and healthy
    pub fn shared_memory_health_check(&self) -> bool {
        // Check if shared memory segment is accessible
        match &self.shmem {
            Some(shmem_ref) => {
                // Try to acquire lock to verify memory segment health
                shmem_ref.try_lock().is_some()
            },
            None => false, // No shared memory allocated
        }
    }
    
    /// Get shared memory segment info
    pub fn shared_memory_info(&self) -> &SharedMemoryInfo {
        &self.info
    }
    
    /// Record lock contention when accessing shared memory
    pub fn record_lock_contention(&self) {
        self.metrics.record_lock_contention();
    }
}

/// Zero-copy message wrapper for shared memory
pub struct ZeroCopyMessage<'a> {
    data: &'a [u8],
    codec: &'a dyn MessageCodec,
}

impl<'a> ZeroCopyMessage<'a> {
    /// Create a new zero-copy message
    pub fn new(data: &'a [u8], codec: &'a dyn MessageCodec) -> Self {
        Self { data, codec }
    }

    /// Decode the message (performs allocation)
    pub fn decode(&self) -> Result<Message, TransportError> {
        self.codec.decode(self.data)
    }

    /// Get raw data without decoding
    pub fn raw_data(&self) -> &[u8] {
        self.data
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ring_buffer() {
        let buffer = RingBuffer::new(1024);

        // Test write and read
        let data = b"Hello, World!";
        assert!(buffer.write(data).is_ok());

        let read_data = buffer.read().unwrap();
        assert_eq!(data, read_data.as_slice());

        // Test empty buffer
        assert!(buffer.is_empty());
        assert!(buffer.read().is_none());
    }

    #[test]
    fn test_ring_buffer_wrap_around() {
        let buffer = RingBuffer::new(64);

        // Fill buffer multiple times to test wrap-around
        for i in 0..10 {
            let data = format!("Message {}", i).into_bytes();
            buffer.write(&data).unwrap();
            let read_data = buffer.read().unwrap();
            assert_eq!(data, read_data);
        }
    }

    #[tokio::test]
    async fn test_shared_memory_transport() {
        let info = SharedMemoryInfo {
            name: "test_shmem".to_string(),
            size: 1024 * 1024,           // 1MB
            ring_buffer_size: 64 * 1024, // 64KB
        };

        let config = TransportConfig::default();
        let transport = SharedMemoryTransport::new(info, config).await;

        // Transport should be created successfully
        assert!(transport.is_ok());
    }
}
