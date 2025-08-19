/*!
 * Simple matrix operations for neural-ml optimization
 * 
 * Provides basic matrix multiplication and vector operations
 * as fallback when advanced SIMD libraries have API issues
 */

use rayon::prelude::*;

/// Simple optimized matrix multiplication using rayon parallelism
pub fn matrix_multiply_parallel(a: &[f32], b: &[f32], m: usize, n: usize, k: usize) -> Vec<f32> {
    let mut result = vec![0.0f32; m * n];
    
    result.par_chunks_mut(n).enumerate().for_each(|(i, row)| {
        for j in 0..n {
            let mut sum = 0.0;
            for l in 0..k {
                sum += a[i * k + l] * b[l * n + j];
            }
            row[j] = sum;
        }
    });
    
    result
}

/// Optimized vector addition with SIMD-like chunking
pub fn vector_add_optimized(a: &[f32], b: &[f32]) -> Vec<f32> {
    assert_eq!(a.len(), b.len());
    
    let mut result = Vec::with_capacity(a.len());
    
    // Process in chunks for better cache performance
    const CHUNK_SIZE: usize = 8;
    let chunks = a.len() / CHUNK_SIZE;
    
    for chunk_idx in 0..chunks {
        let start = chunk_idx * CHUNK_SIZE;
        for i in 0..CHUNK_SIZE {
            let idx = start + i;
            result.push(a[idx] + b[idx]);
        }
    }
    
    // Handle remaining elements
    for i in (chunks * CHUNK_SIZE)..a.len() {
        result.push(a[i] + b[i]);
    }
    
    result
}

/// Optimized vector multiplication
pub fn vector_multiply_optimized(a: &[f32], b: &[f32]) -> Vec<f32> {
    assert_eq!(a.len(), b.len());
    
    a.par_iter()
        .zip(b.par_iter())
        .map(|(x, y)| x * y)
        .collect()
}

/// Fast reduction sum with parallel processing
pub fn reduce_sum_parallel(a: &[f32]) -> f32 {
    a.par_iter().sum()
}

/// Neural activation functions
pub fn neural_activation(input: &[f32], activation_type: ActivationType) -> Vec<f32> {
    match activation_type {
        ActivationType::ReLU => input.par_iter().map(|&x| x.max(0.0)).collect(),
        ActivationType::Sigmoid => input.par_iter().map(|&x| 1.0 / (1.0 + (-x).exp())).collect(),
        ActivationType::Tanh => input.par_iter().map(|&x| x.tanh()).collect(),
        ActivationType::Gelu => input.par_iter().map(|&x| {
            0.5 * x * (1.0 + (x * 0.797_884_6 * (1.0 + 0.044715 * x * x)).tanh())
        }).collect(),
    }
}

#[derive(Debug, Clone, Copy)]
pub enum ActivationType {
    ReLU,
    Sigmoid,
    Tanh,
    Gelu,
}