/*!
 * Machine-Adaptive Optimization Module
 * 
 * Automatically detects CPU/GPU capabilities and selects optimal backend:
 * - Apple Silicon: Metal GPU + Accelerate Framework + NEON SIMD
 * - NVIDIA: CUDA + cuDNN + SIMD
 * - Intel/AMD: AVX-512/AVX2 + OpenCL + SIMD 
 * - ARM: NEON SIMD + GPU acceleration
 * - Fallback: Pure Rust with rayon parallelism
 */

pub mod backend_detector;
pub mod adaptive_executor;
#[cfg(feature = "simd-acceleration")]
pub mod simd_ops;
pub mod gpu_executor;
#[cfg(feature = "apple-acceleration")]
pub mod apple_acceleration;
#[cfg(feature = "cuda-support")]
pub mod cuda_acceleration;
pub mod cpu_fallback;

use std::sync::OnceLock;
use crate::error::{Result, NeuralError};

/// Global optimization backend selected at runtime
static OPTIMIZATION_BACKEND: OnceLock<OptimizationBackend> = OnceLock::new();

#[derive(Debug, Clone, PartialEq)]
pub enum OptimizationBackend {
    /// Apple Silicon: Metal + Accelerate + NEON
    AppleSilicon {
        metal_available: bool,
        accelerate_available: bool,
        neon_available: bool,
    },
    /// NVIDIA CUDA with cuDNN
    NvidiaCuda {
        cuda_version: String,
        compute_capability: String,
        memory_gb: f32,
    },
    /// Intel/AMD with AVX and OpenCL
    IntelAmd {
        avx512: bool,
        avx2: bool,
        opencl_available: bool,
    },
    /// ARM with NEON SIMD
    ArmNeon {
        neon_fp16: bool,
        gpu_available: bool,
    },
    /// High-performance CPU fallback
    CpuOptimized {
        threads: usize,
        simd_level: String,
    },
}

/// Initialize optimization backend detection
pub fn initialize_optimization() -> Result<&'static OptimizationBackend> {
    OPTIMIZATION_BACKEND.get_or_init(|| {
        backend_detector::detect_optimal_backend().unwrap_or_else(|_| {
            OptimizationBackend::CpuOptimized {
                threads: std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4),
                simd_level: "none".to_string(),
            }
        })
    });
    
    OPTIMIZATION_BACKEND.get().ok_or_else(|| 
        NeuralError::OptimizationError("Failed to initialize optimization backend".to_string())
    )
}

/// Get the currently selected optimization backend
pub fn get_backend() -> Option<&'static OptimizationBackend> {
    OPTIMIZATION_BACKEND.get()
}

/// Matrix operations optimized for detected backend
pub trait OptimizedOps<T> {
    fn matrix_multiply(&self, a: &[T], b: &[T], m: usize, n: usize, k: usize) -> Vec<T>;
    fn vector_add(&self, a: &[T], b: &[T]) -> Vec<T>;
    fn vector_multiply(&self, a: &[T], b: &[T]) -> Vec<T>;
    fn reduce_sum(&self, values: &[T]) -> T;
    fn neural_activation(&self, values: &[T], activation: ActivationType) -> Vec<T>;
}

#[derive(Debug, Clone, Copy)]
pub enum ActivationType {
    ReLU,
    Sigmoid,
    Tanh,
    Gelu,
}

/// Get optimized operations for current backend (f32 specialized)
pub fn get_optimized_ops<T>() -> Result<Box<dyn OptimizedOps<T>>>
where
    T: Copy + Default + Send + Sync + 'static,
{
    // For now, we only support f32 operations in our SIMD backends
    // Generic types would need separate implementations
    Err(NeuralError::OptimizationError("Generic optimized operations not implemented yet - use get_f32_optimized_ops for f32".to_string()))
}

/// Get optimized f32 operations for current backend
pub fn get_f32_optimized_ops() -> Result<Box<dyn OptimizedOps<f32>>> {
    let backend = get_backend().ok_or_else(|| {
        NeuralError::OptimizationError("Backend not initialized".to_string())
    })?;

    match backend {
        #[cfg(feature = "apple-acceleration")]
        OptimizationBackend::AppleSilicon { .. } => {
            Ok(Box::new(apple_acceleration::AppleOptimizedOps::new()?))
        }
        #[cfg(feature = "cuda-support")]
        OptimizationBackend::NvidiaCuda { .. } => {
            Ok(Box::new(cuda_acceleration::CudaOptimizedOps::new()?))
        }
        #[cfg(feature = "simd-acceleration")]
        OptimizationBackend::IntelAmd { avx512: true, .. } => {
            Ok(Box::new(simd_ops::Avx512Ops::new()))
        }
        #[cfg(feature = "simd-acceleration")]
        OptimizationBackend::IntelAmd { avx2: true, .. } => {
            Ok(Box::new(simd_ops::Avx2Ops::new()))
        }
        #[cfg(feature = "simd-acceleration")]
        OptimizationBackend::IntelAmd { avx512: false, avx2: false, .. } => {
            // No SIMD support, fall back to CPU optimized
            Ok(Box::new(simd_ops::FallbackOps::new()))
        }
        #[cfg(feature = "simd-acceleration")]
        OptimizationBackend::ArmNeon { .. } => {
            Ok(Box::new(simd_ops::NeonOps::new()))
        }
        _ => {
            // Fallback to CPU-optimized operations when advanced features aren't available
            Ok(Box::new(cpu_fallback::CpuOptimizedOps::new()))
        }
    }
}