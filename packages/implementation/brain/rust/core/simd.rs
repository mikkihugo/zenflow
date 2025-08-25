//! SIMD acceleration module for CPU optimizations
//!
//! This module provides SIMD (Single Instruction, Multiple Data) optimizations
//! for neural network computations, enabling parallel processing on modern CPUs.

use num_traits::Float;

/// SIMD-accelerated vector operations for neural networks
pub struct SimdAccelerator;

impl SimdAccelerator {
    /// Create a new SIMD accelerator instance
    pub fn new() -> Self {
        SimdAccelerator
    }

    /// Check if SIMD instructions are available on this CPU
    pub fn is_available() -> bool {
        // Check for SSE/AVX support on x86_64
        #[cfg(target_arch = "x86_64")]
        {
            is_x86_feature_detected!("sse2")
        }
        #[cfg(target_arch = "aarch64")]
        {
            // ARM NEON is standard on AArch64
            true
        }
        #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
        {
            false
        }
    }

    /// SIMD-accelerated dot product for neural network weights
    pub fn dot_product<T: Float>(a: &[T], b: &[T]) -> T {
        if a.len() != b.len() {
            panic!("Vector lengths must match for dot product");
        }

        // Use SIMD if available and vectors are large enough
        if Self::is_available() && a.len() >= 8 {
            Self::simd_dot_product(a, b)
        } else {
            // Fallback to regular computation
            Self::scalar_dot_product(a, b)
        }
    }

    /// SIMD-accelerated vector addition
    pub fn vector_add<T: Float>(a: &[T], b: &[T]) -> Vec<T> {
        if a.len() != b.len() {
            panic!("Vector lengths must match for addition");
        }

        if Self::is_available() && a.len() >= 8 {
            Self::simd_vector_add(a, b)
        } else {
            Self::scalar_vector_add(a, b)
        }
    }

    /// SIMD-accelerated matrix multiplication (for layer operations)
    pub fn matrix_multiply<T: Float>(
        matrix: &[Vec<T>],
        vector: &[T]
    ) -> Vec<T> {
        let rows = matrix.len();
        let cols = vector.len();
        
        if matrix.is_empty() || matrix[0].len() != cols {
            panic!("Matrix dimensions incompatible with vector");
        }

        let mut result = Vec::with_capacity(rows);
        
        for row in matrix {
            let dot_product = Self::dot_product(row, vector);
            result.push(dot_product);
        }
        
        result
    }

    /// SIMD implementation of dot product
    #[inline]
    fn simd_dot_product<T: Float>(a: &[T], b: &[T]) -> T {
        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("avx2") && std::mem::size_of::<T>() == 4 {
                // Use AVX2 for f32 if available
                let result = unsafe {
                    Self::avx2_dot_product_f32(
                        std::mem::transmute::<&[T], &[f32]>(a),
                        std::mem::transmute::<&[T], &[f32]>(b)
                    )
                };
                return T::from(result).unwrap_or_else(|| T::zero());
            } else if is_x86_feature_detected!("sse2") && std::mem::size_of::<T>() == 4 {
                // Use SSE2 for f32
                let result = unsafe {
                    Self::sse2_dot_product_f32(
                        std::mem::transmute::<&[T], &[f32]>(a),
                        std::mem::transmute::<&[T], &[f32]>(b)
                    )
                };
                return T::from(result).unwrap_or_else(|| T::zero());
            }
        }

        // Fallback to scalar implementation
        Self::scalar_dot_product(a, b)
    }

    /// SIMD implementation of vector addition
    #[inline]
    fn simd_vector_add<T: Float>(a: &[T], b: &[T]) -> Vec<T> {
        #[cfg(target_arch = "x86_64")]
        {
            if is_x86_feature_detected!("avx2") && std::mem::size_of::<T>() == 4 {
                let result_f32 = unsafe {
                    Self::avx2_vector_add_f32(
                        std::mem::transmute::<&[T], &[f32]>(a),
                        std::mem::transmute::<&[T], &[f32]>(b)
                    )
                };
                return result_f32.into_iter()
                    .map(|x| T::from(x).unwrap_or_else(|| T::zero()))
                    .collect();
            }
        }

        // Fallback to scalar implementation
        Self::scalar_vector_add(a, b)
    }

    /// Scalar fallback for dot product
    #[inline]
    fn scalar_dot_product<T: Float>(a: &[T], b: &[T]) -> T {
        a.iter()
            .zip(b.iter())
            .map(|(x, y)| *x * *y)
            .fold(T::zero(), |acc, x| acc + x)
    }

    /// Scalar fallback for vector addition
    #[inline]
    fn scalar_vector_add<T: Float>(a: &[T], b: &[T]) -> Vec<T> {
        a.iter()
            .zip(b.iter())
            .map(|(x, y)| *x + *y)
            .collect()
    }

    /// AVX2 accelerated dot product for f32
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "avx2")]
    unsafe fn avx2_dot_product_f32(a: &[f32], b: &[f32]) -> f32 {
        use std::arch::x86_64::*;
        
        let mut sum = _mm256_setzero_ps();
        let chunks = a.len() / 8;
        
        // Process 8 elements at a time
        for i in 0..chunks {
            let offset = i * 8;
            let va = _mm256_loadu_ps(a.as_ptr().add(offset));
            let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
            let prod = _mm256_mul_ps(va, vb);
            sum = _mm256_add_ps(sum, prod);
        }
        
        // Horizontal sum of AVX register
        let sum_high = _mm256_extractf128_ps(sum, 1);
        let sum_low = _mm256_castps256_ps128(sum);
        let sum128 = _mm_add_ps(sum_low, sum_high);
        let sum64 = _mm_add_ps(sum128, _mm_movehl_ps(sum128, sum128));
        let sum32 = _mm_add_ss(sum64, _mm_shuffle_ps(sum64, sum64, 1));
        
        let mut result = _mm_cvtss_f32(sum32);
        
        // Handle remaining elements
        let remainder_start = chunks * 8;
        for i in remainder_start..a.len() {
            result += a[i] * b[i];
        }
        
        result
    }

    /// SSE2 accelerated dot product for f32
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "sse2")]
    unsafe fn sse2_dot_product_f32(a: &[f32], b: &[f32]) -> f32 {
        use std::arch::x86_64::*;
        
        let mut sum = _mm_setzero_ps();
        let chunks = a.len() / 4;
        
        // Process 4 elements at a time
        for i in 0..chunks {
            let offset = i * 4;
            let va = _mm_loadu_ps(a.as_ptr().add(offset));
            let vb = _mm_loadu_ps(b.as_ptr().add(offset));
            let prod = _mm_mul_ps(va, vb);
            sum = _mm_add_ps(sum, prod);
        }
        
        // Horizontal sum
        let sum64 = _mm_add_ps(sum, _mm_movehl_ps(sum, sum));
        let sum32 = _mm_add_ss(sum64, _mm_shuffle_ps(sum64, sum64, 1));
        let mut result = _mm_cvtss_f32(sum32);
        
        // Handle remaining elements
        let remainder_start = chunks * 4;
        for i in remainder_start..a.len() {
            result += a[i] * b[i];
        }
        
        result
    }

    /// AVX2 accelerated vector addition for f32
    #[cfg(target_arch = "x86_64")]
    #[target_feature(enable = "avx2")]
    unsafe fn avx2_vector_add_f32(a: &[f32], b: &[f32]) -> Vec<f32> {
        use std::arch::x86_64::*;
        
        let mut result: Vec<f32> = Vec::with_capacity(a.len());
        let chunks = a.len() / 8;
        
        // Process 8 elements at a time
        for i in 0..chunks {
            let offset = i * 8;
            let va = _mm256_loadu_ps(a.as_ptr().add(offset));
            let vb = _mm256_loadu_ps(b.as_ptr().add(offset));
            let sum = _mm256_add_ps(va, vb);
            
            // Store result
            let ptr = result.as_mut_ptr().add(offset);
            _mm256_storeu_ps(ptr, sum);
        }
        
        // Set length after SIMD operations
        result.set_len(chunks * 8);
        
        // Handle remaining elements
        let remainder_start = chunks * 8;
        for i in remainder_start..a.len() {
            result.push(a[i] + b[i]);
        }
        
        result
    }
}

impl Default for SimdAccelerator {
    fn default() -> Self {
        Self::new()
    }
}

/// Convenience function to check SIMD availability
pub fn simd_available() -> bool {
    SimdAccelerator::is_available()
}

/// Convenience function for SIMD dot product
pub fn simd_dot_product<T: Float>(a: &[T], b: &[T]) -> T {
    SimdAccelerator::dot_product(a, b)
}

/// Convenience function for SIMD vector addition
pub fn simd_vector_add<T: Float>(a: &[T], b: &[T]) -> Vec<T> {
    SimdAccelerator::vector_add(a, b)
}

/// Convenience function for SIMD matrix multiplication
pub fn simd_matrix_multiply<T: Float>(matrix: &[Vec<T>], vector: &[T]) -> Vec<T> {
    SimdAccelerator::matrix_multiply(matrix, vector)
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn test_scalar_dot_product() {
        let a = vec![1.0_f32, 2.0, 3.0, 4.0];
        let b = vec![2.0_f32, 3.0, 4.0, 5.0];
        let result = SimdAccelerator::scalar_dot_product(&a, &b);
        assert_relative_eq!(result, 40.0, epsilon = 1e-6);
    }

    #[test]
    fn test_scalar_vector_add() {
        let a = vec![1.0_f32, 2.0, 3.0, 4.0];
        let b = vec![2.0_f32, 3.0, 4.0, 5.0];
        let result = SimdAccelerator::scalar_vector_add(&a, &b);
        assert_eq!(result, vec![3.0, 5.0, 7.0, 9.0]);
    }

    #[test]
    fn test_simd_dot_product() {
        let a = vec![1.0_f32; 16];
        let b = vec![2.0_f32; 16];
        let result = SimdAccelerator::dot_product(&a, &b);
        assert_relative_eq!(result, 32.0, epsilon = 1e-6);
    }

    #[test]
    fn test_simd_vector_add() {
        let a = vec![1.0_f32; 16];
        let b = vec![2.0_f32; 16];
        let result = SimdAccelerator::vector_add(&a, &b);
        assert_eq!(result, vec![3.0_f32; 16]);
    }

    #[test]
    fn test_matrix_multiply() {
        let matrix = vec![
            vec![1.0_f32, 2.0],
            vec![3.0_f32, 4.0],
        ];
        let vector = vec![2.0_f32, 3.0];
        let result = SimdAccelerator::matrix_multiply(&matrix, &vector);
        assert_relative_eq!(result[0], 8.0, epsilon = 1e-6);  // 1*2 + 2*3 = 8
        assert_relative_eq!(result[1], 18.0, epsilon = 1e-6); // 3*2 + 4*3 = 18
    }

    #[test]
    fn test_simd_availability() {
        // This test will pass on most modern systems
        println!("SIMD available: {}", SimdAccelerator::is_available());
    }
}