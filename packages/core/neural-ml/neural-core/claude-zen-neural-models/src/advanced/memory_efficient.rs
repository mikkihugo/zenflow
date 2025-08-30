//! Memory-Efficient Neural Architectures
//!
//! Implements memory-optimized neural network architectures for resource-constrained
//! environments and high-frequency trading applications common in MQL5 systems.

use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use crate::ActivationFunction;

/// Memory-efficient neural network with quantized weights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantizedNetwork {
    pub layers: Vec<QuantizedLayer>,
    pub learning_rate: f32,
    pub quantization_bits: u8,
}

/// Quantized layer with compressed weights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuantizedLayer {
    pub weights: Array2<i8>,  // Quantized weights
    pub weight_scale: f32,    // Scale factor for dequantization
    pub weight_zero_point: i8, // Zero point for quantization
    pub biases: Array1<f32>,  // Keep biases in full precision
    pub activation: ActivationFunction,
    pub input_size: usize,
    pub output_size: usize,
}

impl QuantizedLayer {
    /// Create new quantized layer
    pub fn new(input_size: usize, output_size: usize, activation: ActivationFunction, _bits: u8) -> Self {
        let weights = Array2::zeros((output_size, input_size));
        Self {
            weights,
            weight_scale: 1.0,
            weight_zero_point: 0,
            biases: Array1::zeros(output_size),
            activation,
            input_size,
            output_size,
        }
    }

    /// Quantize full-precision weights to low-bit representation
    pub fn quantize_weights(&mut self, fp_weights: &Array2<f32>) {
        let min_val = fp_weights.fold(f32::INFINITY, |acc, &x| acc.min(x));
        let max_val = fp_weights.fold(f32::NEG_INFINITY, |acc, &x| acc.max(x));
        
        let qmin = -(1i32 << (8 - 1)) as f32;  // -128 for 8-bit
        let qmax = (1i32 << (8 - 1)) as f32 - 1.0;  // 127 for 8-bit
        
        self.weight_scale = (max_val - min_val) / (qmax - qmin);
        self.weight_zero_point = (qmin - min_val / self.weight_scale).round() as i8;
        
        self.weights = fp_weights.mapv(|x| {
            let quantized = (x / self.weight_scale + self.weight_zero_point as f32).round();
            quantized.clamp(qmin, qmax) as i8
        });
    }

    /// Dequantize weights for computation
    pub fn dequantize_weights(&self) -> Array2<f32> {
        self.weights.mapv(|x| {
            self.weight_scale * (x as f32 - self.weight_zero_point as f32)
        })
    }

    /// Forward pass with quantized weights
    pub fn forward(&self, input: &Array1<f32>) -> Array1<f32> {
        // Dequantize weights on-the-fly
        let fp_weights = self.dequantize_weights();
        
        // Linear transformation
        let linear_output = fp_weights.dot(input) + &self.biases;
        
        // Apply activation
        linear_output.mapv(|x| self.activation.apply(x))
    }
}

impl QuantizedNetwork {
    /// Create new quantized network
    pub fn new(layer_sizes: &[usize], activations: &[ActivationFunction], learning_rate: f32, bits: u8) -> Self {
        let mut layers = Vec::new();
        
        for i in 0..layer_sizes.len() - 1 {
            let layer = QuantizedLayer::new(layer_sizes[i], layer_sizes[i + 1], activations[i], bits);
            layers.push(layer);
        }
        
        Self {
            layers,
            learning_rate,
            quantization_bits: bits,
        }
    }

    /// Forward pass through quantized network
    pub fn predict(&self, input: &Array1<f32>) -> Array1<f32> {
        let mut current_input = input.clone();
        
        for layer in &self.layers {
            current_input = layer.forward(&current_input);
        }
        
        current_input
    }

    /// Get memory usage estimate in bytes
    pub fn memory_usage(&self) -> usize {
        let mut total_size = 0;
        
        for layer in &self.layers {
            // Quantized weights (1 byte per weight)
            total_size += layer.weights.len();
            // Biases (4 bytes per bias)
            total_size += layer.biases.len() * 4;
            // Scale and zero point (4 + 1 bytes)
            total_size += 5;
        }
        
        total_size
    }
}

/// Streaming neural network for real-time processing
#[derive(Debug, Clone)]
pub struct StreamingNetwork {
    pub layers: Vec<StreamingLayer>,
    pub buffer_size: usize,
    pub learning_rate: f32,
}

/// Layer optimized for streaming data
#[derive(Debug, Clone)]
pub struct StreamingLayer {
    pub weights: Array2<f32>,
    pub biases: Array1<f32>,
    pub activation: ActivationFunction,
    pub input_buffer: VecDeque<Array1<f32>>,
    pub gradient_buffer: VecDeque<Array2<f32>>,
    pub buffer_size: usize,
}

impl StreamingLayer {
    pub fn new(input_size: usize, output_size: usize, activation: ActivationFunction, buffer_size: usize) -> Self {
        let weights = Array2::from_shape_fn((output_size, input_size), |_| {
            (rand::random::<f32>() - 0.5) * 2.0 * (1.0 / input_size as f32).sqrt()
        });
        
        Self {
            weights,
            biases: Array1::zeros(output_size),
            activation,
            input_buffer: VecDeque::with_capacity(buffer_size),
            gradient_buffer: VecDeque::with_capacity(buffer_size),
            buffer_size,
        }
    }

    /// Process single input in streaming fashion
    pub fn process_stream(&mut self, input: &Array1<f32>) -> Array1<f32> {
        // Add to buffer
        if self.input_buffer.len() >= self.buffer_size {
            self.input_buffer.pop_front();
        }
        self.input_buffer.push_back(input.clone());

        // Forward pass
        let output = self.weights.dot(input) + &self.biases;
        output.mapv(|x| self.activation.apply(x))
    }

    /// Update weights using buffered gradients
    pub fn update_streaming(&mut self, learning_rate: f32) {
        if self.gradient_buffer.len() > 0 {
            // Average gradients from buffer
            let mut avg_gradient: Array2<f32> = Array2::zeros(self.weights.dim());
            for grad in &self.gradient_buffer {
                avg_gradient = avg_gradient + grad;
            }
            avg_gradient = avg_gradient / self.gradient_buffer.len() as f32;

            // Update weights
            self.weights = &self.weights - &(avg_gradient * learning_rate);
            
            // Clear gradient buffer
            self.gradient_buffer.clear();
        }
    }
}

impl StreamingNetwork {
    pub fn new(layer_sizes: &[usize], activations: &[ActivationFunction], learning_rate: f32, buffer_size: usize) -> Self {
        let mut layers = Vec::new();
        
        for i in 0..layer_sizes.len() - 1 {
            let layer = StreamingLayer::new(layer_sizes[i], layer_sizes[i + 1], activations[i], buffer_size);
            layers.push(layer);
        }
        
        Self {
            layers,
            buffer_size,
            learning_rate,
        }
    }

    /// Process streaming input
    pub fn process_stream(&mut self, input: &Array1<f32>) -> Array1<f32> {
        let mut current_input = input.clone();
        
        for layer in &mut self.layers {
            current_input = layer.process_stream(&current_input);
        }
        
        current_input
    }

    /// Update all layers with streaming learning
    pub fn update_streaming(&mut self) {
        for layer in &mut self.layers {
            layer.update_streaming(self.learning_rate);
        }
    }
}

/// Sparse neural network with pruned connections
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparseNetwork {
    pub layers: Vec<SparseLayer>,
    pub learning_rate: f32,
    pub sparsity_ratio: f32,
}

/// Sparse layer with pruned weights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparseLayer {
    pub weights: Array2<f32>,
    pub weight_mask: Array2<bool>,  // Mask for active weights
    pub biases: Array1<f32>,
    pub activation: ActivationFunction,
    pub sparsity_ratio: f32,
}

impl SparseLayer {
    pub fn new(input_size: usize, output_size: usize, activation: ActivationFunction, sparsity_ratio: f32) -> Self {
        let weights = Array2::from_shape_fn((output_size, input_size), |_| {
            (rand::random::<f32>() - 0.5) * 2.0 * (1.0 / input_size as f32).sqrt()
        });
        
        let weight_mask = Array2::from_elem((output_size, input_size), true);
        
        Self {
            weights,
            weight_mask,
            biases: Array1::zeros(output_size),
            activation,
            sparsity_ratio,
        }
    }

    /// Prune weights based on magnitude
    pub fn prune_weights(&mut self) {
        let total_weights = self.weights.len();
        let n_prune = (total_weights as f32 * self.sparsity_ratio) as usize;
        
        // Get weight magnitudes with indices
        let mut weight_mags: Vec<(usize, usize, f32)> = Vec::new();
        for ((i, j), &weight) in self.weights.indexed_iter() {
            weight_mags.push((i, j, weight.abs()));
        }
        
        // Sort by magnitude (ascending)
        weight_mags.sort_by(|a, b| a.2.partial_cmp(&b.2).unwrap());
        
        // Prune smallest weights
        for i in 0..n_prune.min(weight_mags.len()) {
            let (row, col, _) = weight_mags[i];
            self.weight_mask[[row, col]] = false;
            self.weights[[row, col]] = 0.0;
        }
    }

    /// Forward pass with sparse weights
    pub fn forward(&self, input: &Array1<f32>) -> Array1<f32> {
        let mut output = self.biases.clone();
        
        // Sparse matrix-vector multiplication
        for ((i, j), &weight) in self.weights.indexed_iter() {
            if self.weight_mask[[i, j]] {
                output[i] += weight * input[j];
            }
        }
        
        output.mapv(|x| self.activation.apply(x))
    }

    /// Get effective sparsity ratio
    pub fn effective_sparsity(&self) -> f32 {
        let total_weights = self.weight_mask.len() as f32;
        let active_weights = self.weight_mask.iter().filter(|&&mask| mask).count() as f32;
        1.0 - (active_weights / total_weights)
    }
}

impl SparseNetwork {
    pub fn new(layer_sizes: &[usize], activations: &[ActivationFunction], learning_rate: f32, sparsity_ratio: f32) -> Self {
        let mut layers = Vec::new();
        
        for i in 0..layer_sizes.len() - 1 {
            let layer = SparseLayer::new(layer_sizes[i], layer_sizes[i + 1], activations[i], sparsity_ratio);
            layers.push(layer);
        }
        
        Self {
            layers,
            learning_rate,
            sparsity_ratio,
        }
    }

    /// Forward pass through sparse network
    pub fn predict(&self, input: &Array1<f32>) -> Array1<f32> {
        let mut current_input = input.clone();
        
        for layer in &self.layers {
            current_input = layer.forward(&current_input);
        }
        
        current_input
    }

    /// Prune all layers
    pub fn prune_network(&mut self) {
        for layer in &mut self.layers {
            layer.prune_weights();
        }
    }

    /// Get memory usage compared to dense network
    pub fn memory_efficiency(&self) -> f32 {
        let mut total_params = 0;
        let mut active_params = 0;
        
        for layer in &self.layers {
            total_params += layer.weights.len() + layer.biases.len();
            active_params += layer.weight_mask.iter().filter(|&&mask| mask).count() + layer.biases.len();
        }
        
        1.0 - (active_params as f32 / total_params as f32)
    }
}

/// Factory for creating memory-efficient networks
pub struct MemoryEfficientFactory;

impl MemoryEfficientFactory {
    /// Create quantized network for memory efficiency
    pub fn create_quantized(
        layer_sizes: &[usize],
        activations: &[ActivationFunction],
        learning_rate: f32,
        bits: u8,
    ) -> QuantizedNetwork {
        QuantizedNetwork::new(layer_sizes, activations, learning_rate, bits)
    }

    /// Create streaming network for real-time processing
    pub fn create_streaming(
        layer_sizes: &[usize],
        activations: &[ActivationFunction],
        learning_rate: f32,
        buffer_size: usize,
    ) -> StreamingNetwork {
        StreamingNetwork::new(layer_sizes, activations, learning_rate, buffer_size)
    }

    /// Create sparse network for computation efficiency
    pub fn create_sparse(
        layer_sizes: &[usize],
        activations: &[ActivationFunction],
        learning_rate: f32,
        sparsity_ratio: f32,
    ) -> SparseNetwork {
        SparseNetwork::new(layer_sizes, activations, learning_rate, sparsity_ratio)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::array;

    #[test]
    fn test_quantized_network() {
        let layer_sizes = vec![3, 4, 2];
        let activations = vec![ActivationFunction::ReLU, ActivationFunction::Sigmoid];
        let network = QuantizedNetwork::new(&layer_sizes, &activations, 0.01, 8);

        // Test prediction
        let input = array![1.0, 2.0, 3.0];
        let output = network.predict(&input);
        assert_eq!(output.len(), 2);

        // Test memory usage
        let memory = network.memory_usage();
        assert!(memory > 0);
    }

    #[test]
    fn test_weight_quantization() {
        let mut layer = QuantizedLayer::new(3, 2, ActivationFunction::ReLU, 8);
        
        // Create test weights
        let fp_weights = Array2::from_shape_vec((2, 3), vec![1.0, -1.0, 0.5, -0.5, 2.0, -2.0]).unwrap();
        
        // Quantize and dequantize
        layer.quantize_weights(&fp_weights);
        let dequantized = layer.dequantize_weights();
        
        // Should be approximately equal
        for (orig, deq) in fp_weights.iter().zip(dequantized.iter()) {
            assert!((orig - deq).abs() < 0.1, "Original: {}, Dequantized: {}", orig, deq);
        }
    }

    #[test]
    fn test_streaming_network() {
        let layer_sizes = vec![2, 3, 1];
        let activations = vec![ActivationFunction::ReLU, ActivationFunction::Sigmoid];
        let mut network = StreamingNetwork::new(&layer_sizes, &activations, 0.01, 10);

        // Test streaming
        let input1 = array![1.0, 2.0];
        let input2 = array![2.0, 3.0];
        
        let output1 = network.process_stream(&input1);
        let output2 = network.process_stream(&input2);
        
        assert_eq!(output1.len(), 1);
        assert_eq!(output2.len(), 1);
    }

    #[test]
    fn test_sparse_network() {
        let layer_sizes = vec![4, 3, 2];
        let activations = vec![ActivationFunction::ReLU, ActivationFunction::Sigmoid];
        let mut network = SparseNetwork::new(&layer_sizes, &activations, 0.01, 0.5);

        // Test prediction before pruning
        let input = array![1.0, 2.0, 3.0, 4.0];
        let output1 = network.predict(&input);
        
        // Prune network
        network.prune_network();
        
        // Test prediction after pruning
        let output2 = network.predict(&input);
        
        assert_eq!(output1.len(), 2);
        assert_eq!(output2.len(), 2);
        
        // Check sparsity
        let efficiency = network.memory_efficiency();
        assert!(efficiency > 0.0 && efficiency < 1.0);
    }

    #[test]
    fn test_memory_efficient_factory() {
        let layer_sizes = vec![3, 4, 2];
        let activations = vec![ActivationFunction::ReLU, ActivationFunction::Sigmoid];

        let quantized = MemoryEfficientFactory::create_quantized(&layer_sizes, &activations, 0.01, 8);
        assert_eq!(quantized.layers.len(), 2);

        let streaming = MemoryEfficientFactory::create_streaming(&layer_sizes, &activations, 0.01, 10);
        assert_eq!(streaming.layers.len(), 2);

        let sparse = MemoryEfficientFactory::create_sparse(&layer_sizes, &activations, 0.01, 0.3);
        assert_eq!(sparse.layers.len(), 2);
    }

    #[test]
    fn test_sparsity_calculation() {
        let mut layer = SparseLayer::new(4, 3, ActivationFunction::ReLU, 0.5);
        
        // Before pruning, sparsity should be 0
        assert_eq!(layer.effective_sparsity(), 0.0);
        
        // After pruning, should have some sparsity
        layer.prune_weights();
        let sparsity = layer.effective_sparsity();
        assert!(sparsity > 0.0 && sparsity <= 1.0);
    }
}