//! Neural Models - Pure Rust Implementation
//!
//! Our own implementation of neural networks, replacing FANN with modern Rust.

use std::f32::consts::E;
use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};
use anyhow::Result;
use rand::prelude::*;

/// Activation function enumeration
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ActivationFunction {
    Linear,
    Sigmoid,
    Tanh,
    ReLU,
    LeakyReLU(f32),
    Softmax,
    Swish,
}

impl ActivationFunction {
    /// Apply activation function
    pub fn apply(&self, x: f32) -> f32 {
        match self {
            ActivationFunction::Linear => x,
            ActivationFunction::Sigmoid => 1.0 / (1.0 + E.powf(-x)),
            ActivationFunction::Tanh => x.tanh(),
            ActivationFunction::ReLU => x.max(0.0),
            ActivationFunction::LeakyReLU(alpha) => {
                if x > 0.0 { x } else { alpha * x }
            },
            ActivationFunction::Softmax => x.exp(), // Note: proper softmax needs normalization
            ActivationFunction::Swish => x * (1.0 / (1.0 + E.powf(-x))),
        }
    }

    /// Apply activation derivative for backprop
    pub fn derivative(&self, x: f32) -> f32 {
        match self {
            ActivationFunction::Linear => 1.0,
            ActivationFunction::Sigmoid => {
                let s = self.apply(x);
                s * (1.0 - s)
            },
            ActivationFunction::Tanh => {
                let t = x.tanh();
                1.0 - t * t
            },
            ActivationFunction::ReLU => if x > 0.0 { 1.0 } else { 0.0 },
            ActivationFunction::LeakyReLU(alpha) => {
                if x > 0.0 { 1.0 } else { *alpha }
            },
            ActivationFunction::Softmax => {
                let s = self.apply(x);
                s * (1.0 - s)
            },
            ActivationFunction::Swish => {
                let sigmoid = 1.0 / (1.0 + E.powf(-x));
                sigmoid + x * sigmoid * (1.0 - sigmoid)
            },
        }
    }
}

/// Dense/fully connected layer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DenseLayer {
    pub weights: Array2<f32>,
    pub biases: Array1<f32>,
    pub activation: ActivationFunction,
    
    // For training
    pub weight_gradients: Option<Array2<f32>>,
    pub bias_gradients: Option<Array1<f32>>,
    pub last_input: Option<Array1<f32>>,
    pub last_output: Option<Array1<f32>>,
}

impl DenseLayer {
    /// Create new dense layer
    pub fn new(input_size: usize, output_size: usize, activation: ActivationFunction) -> Self {
        // Xavier/Glorot initialization
        let scale = (2.0 / (input_size + output_size) as f32).sqrt();
        
        let mut rng = thread_rng();
        let weights = Array2::from_shape_fn((output_size, input_size), |_| {
            (rng.gen::<f32>() - 0.5) * 2.0 * scale
        });
        
        let biases = Array1::zeros(output_size);

        Self {
            weights,
            biases,
            activation,
            weight_gradients: None,
            bias_gradients: None,
            last_input: None,
            last_output: None,
        }
    }

    /// Forward pass
    pub fn forward(&mut self, input: &Array1<f32>) -> Array1<f32> {
        // Store input for backprop
        self.last_input = Some(input.clone());
        
        // Linear transformation: output = weights * input + biases
        let linear_output = self.weights.dot(input) + &self.biases;
        
        // Apply activation function
        let activated_output = linear_output.mapv(|x| self.activation.apply(x));
        
        // Store output for backprop
        self.last_output = Some(activated_output.clone());
        
        activated_output
    }

    /// Backward pass (compute gradients)
    pub fn backward(&mut self, output_gradients: &Array1<f32>) -> Array1<f32> {
        let last_input = self.last_input.as_ref().unwrap();
        let last_output = self.last_output.as_ref().unwrap();
        
        // Compute activation gradients
        let activation_gradients = last_output.mapv(|x| self.activation.derivative(x));
        let delta = output_gradients * &activation_gradients;
        
        // Compute weight gradients
        let weight_grads = Array2::from_shape_fn(self.weights.dim(), |(i, j)| {
            delta[i] * last_input[j]
        });
        
        // Compute bias gradients
        let bias_grads = delta.clone();
        
        // Compute input gradients
        let input_gradients = self.weights.t().dot(&delta);
        
        // Store gradients
        self.weight_gradients = Some(weight_grads);
        self.bias_gradients = Some(bias_grads);
        
        input_gradients
    }

    /// Update weights using gradients
    pub fn update_weights(&mut self, learning_rate: f32) {
        if let Some(ref weight_grads) = self.weight_gradients {
            self.weights = &self.weights - &(weight_grads * learning_rate);
        }
        
        if let Some(ref bias_grads) = self.bias_gradients {
            self.biases = &self.biases - &(bias_grads * learning_rate);
        }
    }
}

/// Multi-layer neural network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Network {
    pub layers: Vec<DenseLayer>,
    pub learning_rate: f32,
}

impl Network {
    /// Create new network
    pub fn new(layer_sizes: &[usize], activations: &[ActivationFunction], learning_rate: f32) -> Self {
        assert_eq!(layer_sizes.len() - 1, activations.len());
        
        let mut layers = Vec::new();
        
        for i in 0..layer_sizes.len() - 1 {
            let layer = DenseLayer::new(
                layer_sizes[i],
                layer_sizes[i + 1],
                activations[i]
            );
            layers.push(layer);
        }
        
        Self {
            layers,
            learning_rate,
        }
    }

    /// Forward pass through entire network
    pub fn predict(&mut self, input: &Array1<f32>) -> Array1<f32> {
        let mut current_input = input.clone();
        
        for layer in &mut self.layers {
            current_input = layer.forward(&current_input);
        }
        
        current_input
    }

    /// Train on single example
    pub fn train_single(&mut self, input: &Array1<f32>, target: &Array1<f32>) -> f32 {
        // Forward pass
        let output = self.predict(input);
        
        // Compute loss (mean squared error)
        let loss = (&output - target).mapv(|x| x * x).mean().unwrap();
        
        // Compute output gradients (derivative of MSE)
        let mut output_gradients = 2.0 * (&output - target) / output.len() as f32;
        
        // Backward pass
        for layer in self.layers.iter_mut().rev() {
            output_gradients = layer.backward(&output_gradients);
        }
        
        // Update weights
        for layer in &mut self.layers {
            layer.update_weights(self.learning_rate);
        }
        
        loss
    }

    /// Train on batch of examples
    pub fn train_batch(&mut self, inputs: &[Array1<f32>], targets: &[Array1<f32>]) -> f32 {
        assert_eq!(inputs.len(), targets.len());
        
        let mut total_loss = 0.0;
        
        for (input, target) in inputs.iter().zip(targets.iter()) {
            total_loss += self.train_single(input, target);
        }
        
        total_loss / inputs.len() as f32
    }
}

/// Training batch structure
#[derive(Debug, Clone)]
pub struct Batch {
    pub inputs: Vec<Array1<f32>>,
    pub targets: Vec<Array1<f32>>,
}

/// Training data structure
#[derive(Debug, Clone)]
pub struct TrainingData {
    pub inputs: Vec<Array1<f32>>,
    pub targets: Vec<Array1<f32>>,
}

impl TrainingData {
    /// Create new training data
    pub fn new() -> Self {
        Self {
            inputs: Vec::new(),
            targets: Vec::new(),
        }
    }

    /// Add training example
    pub fn add_example(&mut self, input: Array1<f32>, target: Array1<f32>) {
        self.inputs.push(input);
        self.targets.push(target);
    }

    /// Get number of examples
    pub fn len(&self) -> usize {
        self.inputs.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.inputs.is_empty()
    }

    /// Get shuffled batches  
    pub fn get_batches(&self, batch_size: usize) -> Vec<Batch> {
        let mut batches = Vec::new();
        let total_examples = self.len();
        
        for start in (0..total_examples).step_by(batch_size) {
            let end = (start + batch_size).min(total_examples);
            let batch_inputs = self.inputs[start..end].to_vec();
            let batch_targets = self.targets[start..end].to_vec();
            batches.push(Batch { inputs: batch_inputs, targets: batch_targets });
        }
        
        batches
    }
}

impl Default for TrainingData {
    fn default() -> Self {
        Self::new()
    }
}

/// Network builder for easy construction
pub struct NetworkBuilder {
    layer_sizes: Vec<usize>,
    activations: Vec<ActivationFunction>,
    learning_rate: f32,
}

impl NetworkBuilder {
    /// Create new builder
    pub fn new() -> Self {
        Self {
            layer_sizes: Vec::new(),
            activations: Vec::new(),
            learning_rate: 0.01,
        }
    }

    /// Add input layer
    pub fn input(mut self, size: usize) -> Self {
        self.layer_sizes.push(size);
        self
    }

    /// Add hidden layer
    pub fn hidden(mut self, size: usize, activation: ActivationFunction) -> Self {
        self.layer_sizes.push(size);
        if self.layer_sizes.len() > 1 {
            self.activations.push(activation);
        }
        self
    }

    /// Add output layer
    pub fn output(mut self, size: usize, activation: ActivationFunction) -> Self {
        self.layer_sizes.push(size);
        self.activations.push(activation);
        self
    }

    /// Set learning rate
    pub fn learning_rate(mut self, lr: f32) -> Self {
        self.learning_rate = lr;
        self
    }

    /// Build the network
    pub fn build(self) -> Result<Network> {
        if self.layer_sizes.len() < 2 {
            return Err(anyhow::anyhow!("Network must have at least input and output layers"));
        }

        if self.activations.len() != self.layer_sizes.len() - 1 {
            return Err(anyhow::anyhow!("Must specify activation for each layer except input"));
        }

        Ok(Network::new(&self.layer_sizes, &self.activations, self.learning_rate))
    }
}

impl Default for NetworkBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// Error types for neural networks
#[derive(Debug, thiserror::Error)]
pub enum NetworkError {
    #[error("Dimension mismatch: expected {expected}, got {actual}")]
    DimensionMismatch { expected: usize, actual: usize },
    
    #[error("Invalid network configuration: {message}")]
    InvalidConfig { message: String },
    
    #[error("Training error: {message}")]
    TrainingError { message: String },
}

/// Training algorithm trait
pub trait TrainingAlgorithm {
    fn train_epoch(&mut self, network: &mut Network, training_data: &TrainingData) -> Result<f32>;
}

/// Stochastic Gradient Descent
pub struct SGD {
    pub batch_size: usize,
}

impl SGD {
    pub fn new(batch_size: usize) -> Self {
        Self { batch_size }
    }
}

impl TrainingAlgorithm for SGD {
    fn train_epoch(&mut self, network: &mut Network, training_data: &TrainingData) -> Result<f32> {
        let batches = training_data.get_batches(self.batch_size);
        let mut total_loss = 0.0;
        
        for batch in batches {
            let batch_loss = network.train_batch(&batch.inputs, &batch.targets);
            total_loss += batch_loss;
        }
        
        Ok(total_loss)
    }
}

/// Adam optimizer
pub struct Adam {
    pub batch_size: usize,
    pub beta1: f32,
    pub beta2: f32,
    pub epsilon: f32,
}

impl Adam {
    pub fn new(batch_size: usize) -> Self {
        Self {
            batch_size,
            beta1: 0.9,
            beta2: 0.999,
            epsilon: 1e-8,
        }
    }
}

impl TrainingAlgorithm for Adam {
    fn train_epoch(&mut self, network: &mut Network, training_data: &TrainingData) -> Result<f32> {
        // For now, use SGD implementation
        // Full Adam would require momentum tracking per parameter
        let mut sgd = SGD::new(self.batch_size);
        sgd.train_epoch(network, training_data)
    }
}

// Re-export key types for compatibility
pub use ActivationFunction as ActivationFunc;
pub use NetworkError as TrainingError;

// Advanced modules
pub mod advanced;

// Re-export optimization types for easy access
pub use advanced::optimization::{
    GeneticOptimizer, ParticleSwarmOptimizer, HyperparameterOptimizer,
    OptimizationResult, Individual, Particle
};

// Re-export financial operations
pub use advanced::financial_ops::{
    FinancialMatrix, TechnicalIndicators, PatternRecognition
};