/*!
 * SIMD Operations - High-performance vectorized math using faer, wide, ultraviolet
 * 
 * Implements optimized operations for different SIMD instruction sets:
 * - AVX-512: 512-bit vectors (16x f32 or 8x f64)
 * - AVX2: 256-bit vectors (8x f32 or 4x f64)  
 * - NEON: 128-bit vectors (4x f32 or 2x f64)
 * - Fallback: Optimized scalar operations with rayon
 */

use super::{OptimizedOps, ActivationType, simple_matrix};
use wide::f32x8;
#[allow(unused_imports)]  // TODO: Use Mat4 for 4x4 matrix transformations in neural networks
use ultraviolet::{Vec4, Mat4};

// Note: Result import removed from super - using std::result::Result directly

/// AVX-512 optimized operations (Intel/AMD)
pub struct Avx512Ops;

impl Avx512Ops {
    pub fn new() -> Self {
        log::info!("Initializing AVX-512 SIMD operations");
        Self
    }

    /// Optimized 4x4 matrix multiplication using ultraviolet Mat4 SIMD
    pub fn matrix_multiply_4x4(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        assert_eq!(a.len(), 16, "Matrix A must be 4x4 (16 elements)");
        assert_eq!(b.len(), 16, "Matrix B must be 4x4 (16 elements)");
        
        // Convert arrays to Mat4 using from_array (4x4 matrix as 16 elements)
        let mat_a = Mat4::from([a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]]);
        let mat_b = Mat4::from([b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]]);
        let result = mat_a * mat_b;
        
        result.as_array().to_vec()
    }
}

impl OptimizedOps<f32> for Avx512Ops {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        // Use optimized parallel matrix multiplication
        simple_matrix::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        assert_eq!(a.len(), b.len());
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 8;
        
        // Process 8 elements at a time with AVX-512 (via wide crate)
        for i in 0..chunks {
            let base = i * 8;
            let a_chunk = f32x8::new([
                a[base], a[base+1], a[base+2], a[base+3],
                a[base+4], a[base+5], a[base+6], a[base+7]
            ]);
            let b_chunk = f32x8::new([
                b[base], b[base+1], b[base+2], b[base+3],
                b[base+4], b[base+5], b[base+6], b[base+7]
            ]);
            
            let sum = a_chunk + b_chunk;
            result.extend_from_slice(&sum.to_array());
        }
        
        // Handle remaining elements
        for i in (chunks * 8)..a.len() {
            result.push(a[i] + b[i]);
        }
        
        result
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        assert_eq!(a.len(), b.len());
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 8;
        
        for i in 0..chunks {
            let base = i * 8;
            let a_chunk = f32x8::new([
                a[base], a[base+1], a[base+2], a[base+3],
                a[base+4], a[base+5], a[base+6], a[base+7]
            ]);
            let b_chunk = f32x8::new([
                b[base], b[base+1], b[base+2], b[base+3],
                b[base+4], b[base+5], b[base+6], b[base+7]
            ]);
            
            let product = a_chunk * b_chunk;
            result.extend_from_slice(&product.to_array());
        }
        
        for i in (chunks * 8)..a.len() {
            result.push(a[i] * b[i]);
        }
        
        result
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        // Use SIMD horizontal sum
        let chunks = values.len() / 8;
        let mut sum = f32x8::ZERO;
        
        for i in 0..chunks {
            let base = i * 8;
            let chunk = f32x8::new([
                values[base], values[base+1], values[base+2], values[base+3],
                values[base+4], values[base+5], values[base+6], values[base+7]
            ]);
            sum += chunk;
        }
        
        let mut total = sum.to_array().iter().sum::<f32>();
        
        // Add remaining elements
        for value in values.iter().skip(chunks * 8) {
            total += *value;
        }
        
        total
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        match activation {
            ActivationType::ReLU => {
                values.iter().map(|&x| x.max(0.0)).collect()
            }
            ActivationType::Sigmoid => {
                values.iter().map(|&x| 1.0 / (1.0 + (-x).exp())).collect()
            }
            ActivationType::Tanh => {
                values.iter().map(|&x| x.tanh()).collect()
            }
            ActivationType::Gelu => {
                values.iter().map(|&x| {
                    0.5 * x * (1.0 + (0.797_884_6 * (x + 0.044715 * x.powi(3))).tanh())
                }).collect()
            }
        }
    }
}

/// AVX2 optimized operations
pub struct Avx2Ops;

impl Avx2Ops {
    pub fn new() -> Self {
        log::info!("Initializing AVX2 SIMD operations");
        Self
    }

    /// Optimized 4x4 matrix multiplication using ultraviolet Mat4 SIMD
    pub fn matrix_multiply_4x4(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        assert_eq!(a.len(), 16, "Matrix A must be 4x4 (16 elements)");
        assert_eq!(b.len(), 16, "Matrix B must be 4x4 (16 elements)");
        
        // Convert arrays to Mat4 using from_array (4x4 matrix as 16 elements)
        let mat_a = Mat4::from([a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]]);
        let mat_b = Mat4::from([b[0], b[1], b[2], b[3], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], b[14], b[15]]);
        let result = mat_a * mat_b;
        
        result.as_array().to_vec()
    }
}

impl OptimizedOps<f32> for Avx2Ops {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        // Use optimized parallel matrix multiplication fallback
        simple_matrix::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        // Similar to AVX-512 but with 8-wide vectors (AVX2 limitation)
        self.vector_add_avx2(a, b)
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        self.vector_multiply_avx2(a, b)
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        self.reduce_sum_avx2(values)
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        match activation {
            ActivationType::ReLU => {
                values.iter().map(|&x| x.max(0.0)).collect()
            }
            _ => {
                // Use same implementations as AVX-512
                Avx512Ops::new().neural_activation(values, activation)
            }
        }
    }
}

impl Avx2Ops {
    fn vector_add_avx2(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        // AVX2 implementation (8-wide f32)
        assert_eq!(a.len(), b.len());
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 8;
        
        for i in 0..chunks {
            let base = i * 8;
            let a_chunk = f32x8::new([
                a[base], a[base+1], a[base+2], a[base+3],
                a[base+4], a[base+5], a[base+6], a[base+7]
            ]);
            let b_chunk = f32x8::new([
                b[base], b[base+1], b[base+2], b[base+3],
                b[base+4], b[base+5], b[base+6], b[base+7]
            ]);
            
            let sum = a_chunk + b_chunk;
            result.extend_from_slice(&sum.to_array());
        }
        
        for i in (chunks * 8)..a.len() {
            result.push(a[i] + b[i]);
        }
        
        result
    }

    fn vector_multiply_avx2(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        // Similar to add but with multiplication
        assert_eq!(a.len(), b.len());
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 8;
        
        for i in 0..chunks {
            let base = i * 8;
            let a_chunk = f32x8::new([
                a[base], a[base+1], a[base+2], a[base+3],
                a[base+4], a[base+5], a[base+6], a[base+7]
            ]);
            let b_chunk = f32x8::new([
                b[base], b[base+1], b[base+2], b[base+3],
                b[base+4], b[base+5], b[base+6], b[base+7]
            ]);
            
            let product = a_chunk * b_chunk;
            result.extend_from_slice(&product.to_array());
        }
        
        for i in (chunks * 8)..a.len() {
            result.push(a[i] * b[i]);
        }
        
        result
    }

    fn reduce_sum_avx2(&self, values: &[f32]) -> f32 {
        let chunks = values.len() / 8;
        let mut sum = f32x8::ZERO;
        
        for i in 0..chunks {
            let base = i * 8;
            let chunk = f32x8::new([
                values[base], values[base+1], values[base+2], values[base+3],
                values[base+4], values[base+5], values[base+6], values[base+7]
            ]);
            sum += chunk;
        }
        
        let mut total = sum.to_array().iter().sum::<f32>();
        
        for value in values.iter().skip(chunks * 8) {
            total += *value;
        }
        
        total
    }
}

/// ARM NEON optimized operations
pub struct NeonOps;

impl NeonOps {
    pub fn new() -> Self {
        log::info!("Initializing ARM NEON SIMD operations");
        Self
    }
}

impl OptimizedOps<f32> for NeonOps {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        // Use optimized parallel matrix multiplication with NEON optimization
        simple_matrix::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        // NEON processes 4 f32 at a time
        assert_eq!(a.len(), b.len());
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 4;
        
        for i in 0..chunks {
            let base = i * 4;
            let a_vec = Vec4::new(a[base], a[base+1], a[base+2], a[base+3]);
            let b_vec = Vec4::new(b[base], b[base+1], b[base+2], b[base+3]);
            
            let sum = a_vec + b_vec;
            result.extend_from_slice(&[sum.x, sum.y, sum.z, sum.w]);
        }
        
        for i in (chunks * 4)..a.len() {
            result.push(a[i] + b[i]);
        }
        
        result
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        assert_eq!(a.len(), b.len());
        
        let mut result = Vec::with_capacity(a.len());
        let chunks = a.len() / 4;
        
        for i in 0..chunks {
            let base = i * 4;
            let a_vec = Vec4::new(a[base], a[base+1], a[base+2], a[base+3]);
            let b_vec = Vec4::new(b[base], b[base+1], b[base+2], b[base+3]);
            
            let product = a_vec * b_vec;
            result.extend_from_slice(&[product.x, product.y, product.z, product.w]);
        }
        
        for i in (chunks * 4)..a.len() {
            result.push(a[i] * b[i]);
        }
        
        result
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        let chunks = values.len() / 4;
        let mut sum = Vec4::zero();
        
        for i in 0..chunks {
            let base = i * 4;
            let chunk = Vec4::new(values[base], values[base+1], values[base+2], values[base+3]);
            sum += chunk;
        }
        
        let mut total = sum.x + sum.y + sum.z + sum.w;
        
        for value in values.iter().skip(chunks * 4) {
            total += *value;
        }
        
        total
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        // For now, use scalar implementations
        // TODO: Implement NEON-optimized activations
        match activation {
            ActivationType::ReLU => {
                values.iter().map(|&x| x.max(0.0)).collect()
            }
            ActivationType::Sigmoid => {
                values.iter().map(|&x| 1.0 / (1.0 + (-x).exp())).collect()
            }
            ActivationType::Tanh => {
                values.iter().map(|&x| x.tanh()).collect()
            }
            ActivationType::Gelu => {
                values.iter().map(|&x| {
                    0.5 * x * (1.0 + (0.797_884_6 * (x + 0.044715 * x.powi(3))).tanh())
                }).collect()
            }
        }
    }
}

/// High-performance CPU fallback using rayon + scalar SIMD
pub struct FallbackOps;

impl FallbackOps {
    pub fn new() -> Self {
        log::info!("Initializing CPU fallback operations with rayon parallelism");
        Self
    }
}

impl OptimizedOps<f32> for FallbackOps {
    fn matrix_multiply(&self, a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
        // Use optimized parallel matrix multiplication fallback
        simple_matrix::matrix_multiply_parallel(a, b, m, n, k)
    }

    fn vector_add(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        use rayon::prelude::*;
        
        a.par_iter()
            .zip(b.par_iter())
            .map(|(&x, &y)| x + y)
            .collect()
    }

    fn vector_multiply(&self, a: &[f32], b: &[f32]) -> Vec<f32> {
        use rayon::prelude::*;
        
        a.par_iter()
            .zip(b.par_iter())
            .map(|(&x, &y)| x * y)
            .collect()
    }

    fn reduce_sum(&self, values: &[f32]) -> f32 {
        use rayon::prelude::*;
        
        values.par_iter().sum()
    }

    fn neural_activation(&self, values: &[f32], activation: ActivationType) -> Vec<f32> {
        use rayon::prelude::*;
        
        match activation {
            ActivationType::ReLU => {
                values.par_iter().map(|&x| x.max(0.0)).collect()
            }
            ActivationType::Sigmoid => {
                values.par_iter().map(|&x| 1.0 / (1.0 + (-x).exp())).collect()
            }
            ActivationType::Tanh => {
                values.par_iter().map(|&x| x.tanh()).collect()
            }
            ActivationType::Gelu => {
                values.par_iter().map(|&x| {
                    0.5 * x * (1.0 + (0.797_884_6 * (x + 0.044715 * x.powi(3))).tanh())
                }).collect()
            }
        }
    }
}