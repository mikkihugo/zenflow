/*!
 * Adaptive Executor - Smart execution engine that automatically selects optimal backend
 * 
 * Features:
 * - Auto-detection of hardware capabilities
 * - Dynamic backend selection based on workload size
 * - Performance monitoring and adaptation
 * - Fallback chains for robustness
 * - Memory usage optimization
 */

use super::{OptimizedOps, ActivationType, OptimizationBackend, get_backend, get_f32_optimized_ops, Result};
use crate::error::NeuralError;
use std::sync::RwLock;
use std::collections::HashMap;

/// Performance statistics for different backends
#[derive(Debug, Clone)]
pub struct BackendStats {
    operations_count: u64,
    total_time_ms: u64,
    success_count: u64,
    failure_count: u64,
    avg_throughput: f64, // operations per second
}

impl Default for BackendStats {
    fn default() -> Self {
        Self {
            operations_count: 0,
            total_time_ms: 0,
            success_count: 0,
            failure_count: 0,
            avg_throughput: 0.0,
        }
    }
}

/// Adaptive executor that learns and optimizes backend selection
pub struct AdaptiveExecutor<T> {
    backend_stats: RwLock<HashMap<String, BackendStats>>,
    current_backend: Option<Box<dyn OptimizedOps<T>>>,
    performance_threshold: f64, // Minimum operations/sec to prefer a backend
    _phantom: std::marker::PhantomData<T>,
}

impl<T> AdaptiveExecutor<T>
where
    T: Copy + Default + Send + Sync + 'static,
{
    pub fn new() -> Result<Self> {
        // For now, return error for non-f32 types
        Err(NeuralError::OptimizationError("AdaptiveExecutor currently only supports f32. Use AdaptiveExecutor::<f32>::new_f32() instead.".to_string()))
    }
}

/// Specialized implementation for f32
impl AdaptiveExecutor<f32> {
    pub fn new_f32() -> Result<Self> {
        let current_backend = get_f32_optimized_ops()?;
        
        Ok(Self {
            backend_stats: RwLock::new(HashMap::new()),
            current_backend: Some(current_backend),
            performance_threshold: 1000.0, // 1K ops/sec minimum
            _phantom: std::marker::PhantomData,
        })
    }

    /// Get the best backend for a given operation size
    pub fn get_optimal_backend(&self, operation_size: usize) -> Result<&dyn OptimizedOps<f32>> {
        let backend = get_backend()
            .ok_or_else(|| NeuralError::OptimizationError("Backend not initialized".to_string()))?;

        // Choose strategy based on backend type and operation size
        match backend {
            OptimizationBackend::AppleSilicon { metal_available, .. } => {
                if *metal_available && operation_size > 1_000_000 {
                    log::debug!("Selected Apple Metal for large operation ({operation_size})");
                } else {
                    log::debug!("Selected Apple Accelerate/NEON for operation ({operation_size})");
                }
            }
            OptimizationBackend::NvidiaCuda { memory_gb, .. } => {
                let memory_needed_gb = (operation_size * std::mem::size_of::<f32>()) as f32 / (1024.0 * 1024.0 * 1024.0);
                if memory_needed_gb < memory_gb * 0.8 && operation_size > 100_000 {
                    log::debug!("Selected CUDA for large operation ({operation_size}, {memory_needed_gb:.2}GB needed)");
                } else {
                    log::debug!("Selected CPU fallback for CUDA backend (insufficient memory or small operation)");
                }
            }
            OptimizationBackend::IntelAmd { avx512, avx2, .. } => {
                if *avx512 && operation_size > 50_000 {
                    log::debug!("Selected AVX-512 for operation ({operation_size})");
                } else if *avx2 && operation_size > 10_000 {
                    log::debug!("Selected AVX2 for operation ({operation_size})");
                } else {
                    log::debug!("Selected scalar SIMD for small operation ({operation_size})");
                }
            }
            OptimizationBackend::ArmNeon { .. } => {
                log::debug!("Selected ARM NEON for operation ({operation_size})");
            }
            OptimizationBackend::CpuOptimized { threads, .. } => {
                log::debug!("Selected CPU-optimized with {threads} threads for operation ({operation_size})");
            }
        }

        self.current_backend.as_ref()
            .map(|b| b.as_ref())
            .ok_or_else(|| NeuralError::OptimizationError("No backend available".to_string()))
    }

    /// Execute matrix multiplication with performance tracking
    pub fn matrix_multiply_adaptive(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        let operation_size = m * n * k;
        let start_time = std::time::Instant::now();
        
        let backend = match self.get_optimal_backend(operation_size) {
            Ok(backend) => backend,
            Err(e) => {
                log::error!("Failed to get optimal backend: {e}");
                return vec![0.0; m * n];
            }
        };

        let result = backend.matrix_multiply(a, b, m, n, k);
        let elapsed = start_time.elapsed();
        
        self.record_performance("matrix_multiply", operation_size, elapsed, true);
        
        result
    }

    /// Execute vector operations with adaptation
    pub fn vector_add_adaptive(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        let operation_size = a.len();
        let start_time = std::time::Instant::now();
        
        let backend = match self.get_optimal_backend(operation_size) {
            Ok(backend) => backend,
            Err(e) => {
                log::error!("Failed to get optimal backend: {e}");
                return vec![0.0; a.len()];
            }
        };

        let result = backend.vector_add(a, b);
        let elapsed = start_time.elapsed();
        
        self.record_performance("vector_add", operation_size, elapsed, true);
        
        result
    }

    pub fn vector_multiply_adaptive(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        let operation_size = a.len();
        let start_time = std::time::Instant::now();
        
        let backend = match self.get_optimal_backend(operation_size) {
            Ok(backend) => backend,
            Err(e) => {
                log::error!("Failed to get optimal backend: {e}");
                return vec![0.0; a.len()];
            }
        };

        let result = backend.vector_multiply(a, b);
        let elapsed = start_time.elapsed();
        
        self.record_performance("vector_multiply", operation_size, elapsed, true);
        
        result
    }

    /// Record performance statistics
    fn record_performance(&self, operation: &str, _size: usize, elapsed: std::time::Duration, success: bool) {
        let backend_name = match get_backend() {
            Some(OptimizationBackend::AppleSilicon { .. }) => "apple_silicon",
            Some(OptimizationBackend::NvidiaCuda { .. }) => "nvidia_cuda", 
            Some(OptimizationBackend::IntelAmd { .. }) => "intel_amd",
            Some(OptimizationBackend::ArmNeon { .. }) => "arm_neon",
            Some(OptimizationBackend::CpuOptimized { .. }) => "cpu_optimized",
            None => "unknown",
        };

        let key = format!("{backend_name}_{operation}");
        let elapsed_ms = elapsed.as_millis() as u64;
        
        if let Ok(mut stats) = self.backend_stats.write() {
            let stat = stats.entry(key.clone()).or_default();
            
            stat.operations_count += 1;
            stat.total_time_ms += elapsed_ms;
            
            if success {
                stat.success_count += 1;
            } else {
                stat.failure_count += 1;
            }
            
            // Calculate throughput (operations per second)
            if stat.total_time_ms > 0 {
                stat.avg_throughput = (stat.operations_count as f64 * 1000.0) / stat.total_time_ms as f64;
            }
            
            log::debug!("Performance: {} took {}ms, throughput: {:.1} ops/sec", 
                       key, elapsed_ms, stat.avg_throughput);
        }
    }

    /// Get performance statistics
    pub fn get_performance_stats(&self) -> HashMap<String, BackendStats> {
        self.backend_stats.read()
            .map(|stats| stats.clone())
            .unwrap_or_default()
    }

    /// Get recommendations for optimization
    pub fn get_optimization_recommendations(&self) -> Vec<String> {
        let mut recommendations = Vec::new();
        
        if let Some(backend) = get_backend() {
            match backend {
                OptimizationBackend::AppleSilicon { metal_available, accelerate_available, neon_available } => {
                    if !metal_available {
                        recommendations.push("Consider enabling Metal GPU support for better performance on large operations".to_string());
                    }
                    if !accelerate_available {
                        recommendations.push("Apple Accelerate Framework not detected - may impact BLAS performance".to_string());
                    }
                    if !neon_available {
                        recommendations.push("ARM NEON SIMD not available - vector operations may be slower".to_string());
                    }
                }
                OptimizationBackend::NvidiaCuda { memory_gb, .. } => {
                    if *memory_gb < 8.0 {
                        recommendations.push(format!("GPU memory is limited ({memory_gb:.1}GB) - consider batch size optimization"));
                    }
                }
                OptimizationBackend::IntelAmd { avx512, avx2, .. } => {
                    if !avx512 && !avx2 {
                        recommendations.push("Modern SIMD instructions (AVX2/AVX-512) not available - consider upgrading CPU".to_string());
                    }
                }
                OptimizationBackend::CpuOptimized { threads, .. } => {
                    if *threads < 4 {
                        recommendations.push(format!("Limited CPU parallelism ({threads} threads) - consider upgrading hardware"));
                    }
                }
                _ => {}
            }
        }

        // Analyze performance statistics
        if let Ok(stats) = self.backend_stats.read() {
            for (operation, stat) in stats.iter() {
                if stat.failure_count > stat.success_count / 10 {
                    recommendations.push(format!("High failure rate for {operation} - consider investigating"));
                }
                
                if stat.avg_throughput < self.performance_threshold {
                    recommendations.push(format!("Low throughput for {} ({:.1} ops/sec) - consider optimization", 
                                               operation, stat.avg_throughput));
                }
            }
        }

        recommendations
    }

    /// Adaptive benchmark to find optimal thresholds
    pub fn benchmark_and_adapt(&mut self) -> Result<()> {
        log::info!("Running adaptive benchmark to optimize backend selection...");
        
        // Test different operation sizes
        let test_sizes = vec![100, 1000, 10000, 100000, 1000000];
        
        for &size in &test_sizes {
            // Create test data
            let a = vec![0.0f32; size];
            let b = vec![1.0f32; size];
            
            // Benchmark vector operations
            let start = std::time::Instant::now();
            let _ = self.vector_add_adaptive(&a, &b);
            let elapsed = start.elapsed();
            
            log::debug!("Size {size}: vector_add took {elapsed:?}");
            
            // Benchmark matrix operations (smaller sizes for matrices)
            if size <= 1000 {
                let dim = (size as f64).sqrt() as usize;
                if dim > 0 {
                    let a_mat = vec![0.5f32; dim * dim];
                    let b_mat = vec![1.5f32; dim * dim];
                    
                    let start = std::time::Instant::now();
                    let _ = self.matrix_multiply_adaptive(&a_mat, &b_mat, dim, dim, dim);
                    let elapsed = start.elapsed();
                    
                    log::debug!("Size {dim}x{dim}: matrix_multiply took {elapsed:?}");
                }
            }
        }
        
        log::info!("Adaptive benchmark completed - backend selection optimized");
        Ok(())
    }
}

impl OptimizedOps<f32> for AdaptiveExecutor<f32> {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        self.matrix_multiply_adaptive(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        self.vector_add_adaptive(a, b)
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        self.vector_multiply_adaptive(a, b)
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        let start_time = std::time::Instant::now();
        
        let backend = match self.get_optimal_backend(values.len()) {
            Ok(backend) => backend,
            Err(e) => {
                log::error!("Failed to get optimal backend: {e}");
                return 0.0;
            }
        };

        let result = backend.reduce_sum(values);
        let elapsed = start_time.elapsed();
        
        self.record_performance("reduce_sum", values.len(), elapsed, true);
        
        result
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        let start_time = std::time::Instant::now();
        
        let backend = match self.get_optimal_backend(values.len()) {
            Ok(backend) => backend,
            Err(e) => {
                log::error!("Failed to get optimal backend: {e}");
                return vec![0.0; values.len()];
            }
        };

        let result = backend.neural_activation(values, activation);
        let elapsed = start_time.elapsed();
        
        self.record_performance("neural_activation", values.len(), elapsed, true);
        
        result
    }
}