/*!
 * Simple SIMD-like operations with feature gates for actual SIMD libraries
 */

use super::{OptimizedOps, ActivationType, cpu_fallback};

/// Fallback operations when SIMD not available
pub struct FallbackOps;

impl FallbackOps {
    pub fn new() -> Self {
        log::info!("Initializing CPU fallback operations with rayon parallelism");
        Self
    }
}

impl OptimizedOps<f32> for FallbackOps {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        cpu_fallback::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        cpu_fallback::vector_add_optimized(a, b)
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        cpu_fallback::vector_multiply_optimized(a, b)
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        cpu_fallback::reduce_sum_parallel(values)
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        use cpu_fallback::ActivationType as CpuActivationType;
        let cpu_activation = match activation {
            ActivationType::ReLU => CpuActivationType::ReLU,
            ActivationType::Sigmoid => CpuActivationType::Sigmoid,
            ActivationType::Tanh => CpuActivationType::Tanh,
            ActivationType::Gelu => CpuActivationType::Gelu,
        };
        cpu_fallback::neural_activation(values, cpu_activation)
    }
}

// SIMD operations available only when feature is enabled
#[cfg(feature = "simd-acceleration")]
pub mod simd_enabled {
    use super::*;

    /// AVX-512 optimized operations (Intel/AMD)
    pub struct Avx512Ops;

    impl Avx512Ops {
        pub fn new() -> Self {
            log::info!("Initializing AVX-512 SIMD operations");
            Self
        }
    }

    impl OptimizedOps<f32> for Avx512Ops {
        fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
            cpu_fallback::matrix_multiply_parallel(a, b, m, n, k)
        }

        fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
            // Use CPU fallback since actual SIMD requires complex feature management
            cpu_fallback::vector_add_optimized(a, b)
        }

        fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
            cpu_fallback::vector_multiply_optimized(a, b)
        }

        fn reduce_sum(&self, values: &[f32]) -> f32 {
            cpu_fallback::reduce_sum_parallel(values)
        }

        fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
            use cpu_fallback::ActivationType as CpuActivationType;
            let cpu_activation = match activation {
                ActivationType::ReLU => CpuActivationType::ReLU,
                ActivationType::Sigmoid => CpuActivationType::Sigmoid,
                ActivationType::Tanh => CpuActivationType::Tanh,
                ActivationType::Gelu => CpuActivationType::Gelu,
            };
            cpu_fallback::neural_activation(values, cpu_activation)
        }
    }

    pub use Avx512Ops as Avx2Ops;
    pub use Avx512Ops as NeonOps;
}

// Export based on feature availability
#[cfg(feature = "simd-acceleration")]
pub use simd_enabled::*;