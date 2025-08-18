//! # Gradient Computation & Auto-Differentiation Module
//!
//! Provides automatic differentiation and gradient-based optimization
//! capabilities for neural network training and parameter optimization.

use super::{MLError, MLResult, AsyncOptimizer, MemoryAware, GpuAccelerated, Serializable, monitoring::Timer};
use ndarray::{Array1, Array2, Array3, ArrayView1, ArrayView2, Zip};
use num_traits::Float;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use rayon::prelude::*;

/// Tensor operations for automatic differentiation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TensorOp {
    /// Addition of two tensors
    Add,
    /// Subtraction of two tensors
    Sub,
    /// Element-wise multiplication
    Mul,
    /// Matrix multiplication
    MatMul,
    /// Element-wise division
    Div,
    /// Power operation
    Pow,
    /// Exponential function
    Exp,
    /// Natural logarithm
    Log,
    /// Sine function
    Sin,
    /// Cosine function
    Cos,
    /// Hyperbolic tangent
    Tanh,
    /// Sigmoid function
    Sigmoid,
    /// ReLU activation
    ReLU,
    /// Sum reduction
    Sum,
    /// Mean reduction
    Mean,
    /// Transpose operation
    Transpose,
    /// Reshape operation
    Reshape(Vec<usize>),
}

/// Computational graph node for automatic differentiation
#[derive(Debug, Clone)]
pub struct ComputationNode {
    /// Unique node identifier
    pub id: usize,
    /// Operation that created this node
    pub operation: Option<TensorOp>,
    /// Input nodes (parents in the graph)
    pub inputs: Vec<usize>,
    /// Output shape
    pub shape: Vec<usize>,
    /// Whether this node requires gradient computation
    pub requires_grad: bool,
    /// Cached gradient value
    pub gradient: Option<Array1<f64>>,
}

impl ComputationNode {
    /// Create a new leaf node (variable)
    pub fn leaf(id: usize, shape: Vec<usize>, requires_grad: bool) -> Self {
        Self {
            id,
            operation: None,
            inputs: Vec::new(),
            shape,
            requires_grad,
            gradient: None,
        }
    }
    
    /// Create a new operation node
    pub fn operation(
        id: usize,
        operation: TensorOp,
        inputs: Vec<usize>,
        shape: Vec<usize>,
        requires_grad: bool,
    ) -> Self {
        Self {
            id,
            operation: Some(operation),
            inputs,
            shape,
            requires_grad,
            gradient: None,
        }
    }
}

/// Automatic differentiation computation graph
#[derive(Debug)]
pub struct AutoDiff {
    /// Computation nodes indexed by ID
    nodes: HashMap<usize, ComputationNode>,
    /// Tensor values indexed by node ID
    values: HashMap<usize, Array1<f64>>,
    /// Next available node ID
    next_id: usize,
    /// Gradients computed during backpropagation
    gradients: HashMap<usize, Array1<f64>>,
    /// Whether the graph is in training mode
    training_mode: bool,
}

impl AutoDiff {
    /// Create new computation graph
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            values: HashMap::new(),
            next_id: 0,
            gradients: HashMap::new(),
            training_mode: true,
        }
    }
    
    /// Create a new variable (leaf node)
    pub fn variable(&mut self, data: Array1<f64>, requires_grad: bool) -> MLResult<usize> {
        let id = self.next_id;
        self.next_id += 1;
        
        let shape = vec![data.len()];
        let node = ComputationNode::leaf(id, shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, data);
        
        Ok(id)
    }
    
    /// Create a parameter (trainable variable)
    pub fn parameter(&mut self, data: Array1<f64>) -> MLResult<usize> {
        self.variable(data, true)
    }
    
    /// Create a constant (non-trainable variable)
    pub fn constant(&mut self, data: Array1<f64>) -> MLResult<usize> {
        self.variable(data, false)
    }
    
    /// Get tensor value by node ID
    pub fn get_value(&self, node_id: usize) -> MLResult<&Array1<f64>> {
        self.values.get(&node_id)
            .ok_or_else(|| MLError::GradientError(format!("Node {} not found", node_id)))
    }
    
    /// Get tensor gradient by node ID
    pub fn get_gradient(&self, node_id: usize) -> MLResult<&Array1<f64>> {
        self.gradients.get(&node_id)
            .ok_or_else(|| MLError::GradientError(format!("Gradient for node {} not computed", node_id)))
    }
    
    /// Addition operation
    pub fn add(&mut self, a: usize, b: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let b_val = self.get_value(b)?.clone();
        
        if a_val.len() != b_val.len() {
            return Err(MLError::GradientError("Tensor shapes must match for addition".to_string()));
        }
        
        let result = &a_val + &b_val;
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad || self.nodes[&b].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Add, vec![a, b], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Subtraction operation
    pub fn sub(&mut self, a: usize, b: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let b_val = self.get_value(b)?.clone();
        
        if a_val.len() != b_val.len() {
            return Err(MLError::GradientError("Tensor shapes must match for subtraction".to_string()));
        }
        
        let result = &a_val - &b_val;
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad || self.nodes[&b].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Sub, vec![a, b], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Element-wise multiplication
    pub fn mul(&mut self, a: usize, b: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let b_val = self.get_value(b)?.clone();
        
        if a_val.len() != b_val.len() {
            return Err(MLError::GradientError("Tensor shapes must match for multiplication".to_string()));
        }
        
        let result = &a_val * &b_val;
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad || self.nodes[&b].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Mul, vec![a, b], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Matrix multiplication (dot product for 1D arrays)
    pub fn matmul(&mut self, a: usize, b: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let b_val = self.get_value(b)?.clone();
        
        if a_val.len() != b_val.len() {
            return Err(MLError::GradientError("Arrays must have same length for dot product".to_string()));
        }
        
        let result = Array1::from_vec(vec![a_val.dot(&b_val)]);
        let shape = vec![1];
        
        let requires_grad = self.nodes[&a].requires_grad || self.nodes[&b].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::MatMul, vec![a, b], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Exponential function
    pub fn exp(&mut self, a: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let result = a_val.mapv(|x| x.exp());
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Exp, vec![a], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Natural logarithm
    pub fn log(&mut self, a: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let result = a_val.mapv(|x| {
            if x <= 0.0 {
                f64::NEG_INFINITY
            } else {
                x.ln()
            }
        });
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Log, vec![a], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Sigmoid activation function
    pub fn sigmoid(&mut self, a: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let result = a_val.mapv(|x| 1.0 / (1.0 + (-x).exp()));
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Sigmoid, vec![a], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// ReLU activation function
    pub fn relu(&mut self, a: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let result = a_val.mapv(|x| x.max(0.0));
        let shape = vec![result.len()];
        
        let requires_grad = self.nodes[&a].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::ReLU, vec![a], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Sum reduction
    pub fn sum(&mut self, a: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let result = Array1::from_vec(vec![a_val.sum()]);
        let shape = vec![1];
        
        let requires_grad = self.nodes[&a].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Sum, vec![a], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Mean reduction
    pub fn mean(&mut self, a: usize) -> MLResult<usize> {
        let a_val = self.get_value(a)?.clone();
        let result = Array1::from_vec(vec![a_val.mean().unwrap_or(0.0)]);
        let shape = vec![1];
        
        let requires_grad = self.nodes[&a].requires_grad;
        
        let id = self.next_id;
        self.next_id += 1;
        
        let node = ComputationNode::operation(id, TensorOp::Mean, vec![a], shape, requires_grad);
        
        self.nodes.insert(id, node);
        self.values.insert(id, result);
        
        Ok(id)
    }
    
    /// Backward pass to compute gradients
    pub fn backward(&mut self, output_node: usize) -> MLResult<()> {
        let timer = Timer::new("AutoDiff::backward");
        
        // Clear previous gradients
        self.gradients.clear();
        
        // Initialize output gradient
        let output_shape = &self.nodes[&output_node].shape;
        let output_grad = if output_shape == &vec![1] {
            Array1::from_vec(vec![1.0])
        } else {
            Array1::ones(output_shape[0])
        };
        self.gradients.insert(output_node, output_grad);
        
        // Topological sort for backward pass
        let mut visited = std::collections::HashSet::new();
        let mut order = Vec::new();
        self.topological_sort(output_node, &mut visited, &mut order)?;
        
        // Backward pass in reverse topological order
        for &node_id in order.iter().rev() {
            let node = self.nodes[&node_id].clone();
            
            if !node.requires_grad {
                continue;
            }
            
            if let Some(ref operation) = node.operation {
                self.backward_operation(node_id, operation, &node.inputs)?;
            }
        }
        
        timer.finish();
        Ok(())
    }
    
    /// Topological sort for computation graph
    fn topological_sort(
        &self,
        node_id: usize,
        visited: &mut std::collections::HashSet<usize>,
        order: &mut Vec<usize>,
    ) -> MLResult<()> {
        if visited.contains(&node_id) {
            return Ok(());
        }
        
        visited.insert(node_id);
        
        let node = self.nodes.get(&node_id)
            .ok_or_else(|| MLError::GradientError(format!("Node {} not found", node_id)))?;
        
        for &input_id in &node.inputs {
            self.topological_sort(input_id, visited, order)?;
        }
        
        order.push(node_id);
        Ok(())
    }
    
    /// Backward pass for specific operation
    fn backward_operation(
        &mut self,
        node_id: usize,
        operation: &TensorOp,
        inputs: &[usize],
    ) -> MLResult<()> {
        let grad_output = self.gradients.get(&node_id).unwrap().clone();
        
        match operation {
            TensorOp::Add => {
                // Gradient flows through unchanged
                for &input_id in inputs {
                    if self.nodes[&input_id].requires_grad {
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_output.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_output);
                    }
                }
            },
            
            TensorOp::Sub => {
                // First input: gradient unchanged, second input: gradient negated
                if inputs.len() == 2 {
                    if self.nodes[&inputs[0]].requires_grad {
                        let existing_grad = self.gradients.get(&inputs[0]).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_output.len()));
                        self.gradients.insert(inputs[0], &existing_grad + &grad_output);
                    }
                    if self.nodes[&inputs[1]].requires_grad {
                        let existing_grad = self.gradients.get(&inputs[1]).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_output.len()));
                        self.gradients.insert(inputs[1], &existing_grad - &grad_output);
                    }
                }
            },
            
            TensorOp::Mul => {
                // Chain rule for element-wise multiplication
                if inputs.len() == 2 {
                    let a_val = self.values[&inputs[0]].clone();
                    let b_val = self.values[&inputs[1]].clone();
                    
                    if self.nodes[&inputs[0]].requires_grad {
                        let grad_a = &grad_output * &b_val;
                        let existing_grad = self.gradients.get(&inputs[0]).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_a.len()));
                        self.gradients.insert(inputs[0], &existing_grad + &grad_a);
                    }
                    if self.nodes[&inputs[1]].requires_grad {
                        let grad_b = &grad_output * &a_val;
                        let existing_grad = self.gradients.get(&inputs[1]).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_b.len()));
                        self.gradients.insert(inputs[1], &existing_grad + &grad_b);
                    }
                }
            },
            
            TensorOp::MatMul => {
                // Gradient for dot product
                if inputs.len() == 2 {
                    let a_val = self.values[&inputs[0]].clone();
                    let b_val = self.values[&inputs[1]].clone();
                    
                    if self.nodes[&inputs[0]].requires_grad {
                        let grad_a = &b_val * grad_output[0];
                        let existing_grad = self.gradients.get(&inputs[0]).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_a.len()));
                        self.gradients.insert(inputs[0], &existing_grad + &grad_a);
                    }
                    if self.nodes[&inputs[1]].requires_grad {
                        let grad_b = &a_val * grad_output[0];
                        let existing_grad = self.gradients.get(&inputs[1]).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_b.len()));
                        self.gradients.insert(inputs[1], &existing_grad + &grad_b);
                    }
                }
            },
            
            TensorOp::Exp => {
                // d/dx(exp(x)) = exp(x)
                if !inputs.is_empty() {
                    let input_id = inputs[0];
                    if self.nodes[&input_id].requires_grad {
                        let exp_val = self.values[&node_id].clone();
                        let grad_input = &grad_output * &exp_val;
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_input.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_input);
                    }
                }
            },
            
            TensorOp::Log => {
                // d/dx(log(x)) = 1/x
                if !inputs.is_empty() {
                    let input_id = inputs[0];
                    if self.nodes[&input_id].requires_grad {
                        let input_val = self.values[&input_id].clone();
                        let grad_input = &grad_output / &input_val;
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_input.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_input);
                    }
                }
            },
            
            TensorOp::Sigmoid => {
                // d/dx(sigmoid(x)) = sigmoid(x) * (1 - sigmoid(x))
                if !inputs.is_empty() {
                    let input_id = inputs[0];
                    if self.nodes[&input_id].requires_grad {
                        let sigmoid_val = self.values[&node_id].clone();
                        let grad_input = &grad_output * &sigmoid_val * &sigmoid_val.mapv(|x| 1.0 - x);
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_input.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_input);
                    }
                }
            },
            
            TensorOp::ReLU => {
                // d/dx(ReLU(x)) = 1 if x > 0, else 0
                if !inputs.is_empty() {
                    let input_id = inputs[0];
                    if self.nodes[&input_id].requires_grad {
                        let input_val = self.values[&input_id].clone();
                        let relu_grad = input_val.mapv(|x| if x > 0.0 { 1.0 } else { 0.0 });
                        let grad_input = &grad_output * &relu_grad;
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_input.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_input);
                    }
                }
            },
            
            TensorOp::Sum => {
                // Gradient broadcasts to all elements
                if !inputs.is_empty() {
                    let input_id = inputs[0];
                    if self.nodes[&input_id].requires_grad {
                        let input_shape = &self.nodes[&input_id].shape;
                        let grad_input = Array1::from_elem(input_shape[0], grad_output[0]);
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_input.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_input);
                    }
                }
            },
            
            TensorOp::Mean => {
                // Gradient broadcasts and divides by number of elements
                if !inputs.is_empty() {
                    let input_id = inputs[0];
                    if self.nodes[&input_id].requires_grad {
                        let input_shape = &self.nodes[&input_id].shape;
                        let n_elements = input_shape[0] as f64;
                        let grad_input = Array1::from_elem(input_shape[0], grad_output[0] / n_elements);
                        let existing_grad = self.gradients.get(&input_id).cloned()
                            .unwrap_or_else(|| Array1::zeros(grad_input.len()));
                        self.gradients.insert(input_id, &existing_grad + &grad_input);
                    }
                }
            },
            
            _ => {
                return Err(MLError::GradientError(format!("Backward pass not implemented for {:?}", operation)));
            },
        }
        
        Ok(())
    }
    
    /// Zero gradients for all parameters
    pub fn zero_grad(&mut self) {
        self.gradients.clear();
    }
    
    /// Set training mode
    pub fn train(&mut self) {
        self.training_mode = true;
    }
    
    /// Set evaluation mode
    pub fn eval(&mut self) {
        self.training_mode = false;
    }
    
    /// Get number of nodes in the graph
    pub fn num_nodes(&self) -> usize {
        self.nodes.len()
    }
    
    /// Get number of parameters (nodes requiring gradients)
    pub fn num_parameters(&self) -> usize {
        self.nodes.values().filter(|node| node.requires_grad).count()
    }
}

impl Default for AutoDiff {
    fn default() -> Self {
        Self::new()
    }
}

/// Tensor operations utility struct
#[derive(Debug)]
pub struct TensorOperations {
    /// Internal computation graph
    graph: AutoDiff,
}

impl TensorOperations {
    /// Create new tensor operations
    pub fn new() -> Self {
        Self {
            graph: AutoDiff::new(),
        }
    }
    
    /// Create tensor from data
    pub fn tensor(&mut self, data: Array1<f64>, requires_grad: bool) -> MLResult<usize> {
        self.graph.variable(data, requires_grad)
    }
    
    /// Matrix multiplication for 2D tensors (simplified as outer product for 1D)
    pub fn matrix_multiply(&mut self, a: usize, b: usize) -> MLResult<usize> {
        self.graph.matmul(a, b)
    }
    
    /// Compute loss function (Mean Squared Error)
    pub fn mse_loss(&mut self, predicted: usize, target: usize) -> MLResult<usize> {
        let diff = self.graph.sub(predicted, target)?;
        let squared = self.graph.mul(diff, diff)?;
        self.graph.mean(squared)
    }
    
    /// Compute cross-entropy loss
    pub fn cross_entropy_loss(&mut self, predicted: usize, target: usize) -> MLResult<usize> {
        let log_pred = self.graph.log(predicted)?;
        let product = self.graph.mul(target, log_pred)?;
        let sum = self.graph.sum(product)?;
        
        // Return negative log likelihood
        let minus_one = self.graph.constant(Array1::from_vec(vec![-1.0]))?;
        self.graph.mul(sum, minus_one)
    }
    
    /// Apply linear transformation: y = Wx + b
    pub fn linear(&mut self, input: usize, weight: usize, bias: usize) -> MLResult<usize> {
        let wx = self.graph.mul(input, weight)?;
        self.graph.add(wx, bias)
    }
    
    /// Get computation graph
    pub fn get_graph(&self) -> &AutoDiff {
        &self.graph
    }
    
    /// Get mutable computation graph
    pub fn get_graph_mut(&mut self) -> &mut AutoDiff {
        &mut self.graph
    }
}

impl Default for TensorOperations {
    fn default() -> Self {
        Self::new()
    }
}

/// Optimizer types for gradient-based optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OptimizerType {
    /// Stochastic Gradient Descent
    SGD { 
        learning_rate: f64,
        momentum: f64,
        weight_decay: f64,
    },
    /// Adam optimizer
    Adam {
        learning_rate: f64,
        beta1: f64,
        beta2: f64,
        epsilon: f64,
        weight_decay: f64,
    },
    /// RMSprop optimizer
    RMSprop {
        learning_rate: f64,
        alpha: f64,
        epsilon: f64,
        weight_decay: f64,
    },
    /// AdaGrad optimizer
    AdaGrad {
        learning_rate: f64,
        epsilon: f64,
        weight_decay: f64,
    },
}

/// Gradient-based optimizer
#[derive(Debug)]
pub struct GradientOptimizer {
    optimizer_type: OptimizerType,
    /// Momentum buffers for SGD
    momentum_buffers: HashMap<usize, Array1<f64>>,
    /// First moment estimates for Adam
    first_moments: HashMap<usize, Array1<f64>>,
    /// Second moment estimates for Adam
    second_moments: HashMap<usize, Array1<f64>>,
    /// Squared gradients for RMSprop/AdaGrad
    squared_grads: HashMap<usize, Array1<f64>>,
    /// Current step number
    step_count: usize,
}

impl GradientOptimizer {
    /// Create SGD optimizer
    pub fn sgd(learning_rate: f64, momentum: f64, weight_decay: f64) -> Self {
        Self {
            optimizer_type: OptimizerType::SGD { learning_rate, momentum, weight_decay },
            momentum_buffers: HashMap::new(),
            first_moments: HashMap::new(),
            second_moments: HashMap::new(),
            squared_grads: HashMap::new(),
            step_count: 0,
        }
    }
    
    /// Create Adam optimizer
    pub fn adam(learning_rate: f64, beta1: f64, beta2: f64, epsilon: f64, weight_decay: f64) -> Self {
        Self {
            optimizer_type: OptimizerType::Adam { learning_rate, beta1, beta2, epsilon, weight_decay },
            momentum_buffers: HashMap::new(),
            first_moments: HashMap::new(),
            second_moments: HashMap::new(),
            squared_grads: HashMap::new(),
            step_count: 0,
        }
    }
    
    /// Create RMSprop optimizer
    pub fn rmsprop(learning_rate: f64, alpha: f64, epsilon: f64, weight_decay: f64) -> Self {
        Self {
            optimizer_type: OptimizerType::RMSprop { learning_rate, alpha, epsilon, weight_decay },
            momentum_buffers: HashMap::new(),
            first_moments: HashMap::new(),
            second_moments: HashMap::new(),
            squared_grads: HashMap::new(),
            step_count: 0,
        }
    }
    
    /// Perform optimization step
    pub fn step(&mut self, graph: &mut AutoDiff, parameter_ids: &[usize]) -> MLResult<()> {
        let timer = Timer::new("GradientOptimizer::step");
        self.step_count += 1;
        
        match &self.optimizer_type {
            OptimizerType::SGD { learning_rate, momentum, weight_decay } => {
                self.sgd_step(graph, parameter_ids, *learning_rate, *momentum, *weight_decay)?;
            },
            
            OptimizerType::Adam { learning_rate, beta1, beta2, epsilon, weight_decay } => {
                self.adam_step(graph, parameter_ids, *learning_rate, *beta1, *beta2, *epsilon, *weight_decay)?;
            },
            
            OptimizerType::RMSprop { learning_rate, alpha, epsilon, weight_decay } => {
                self.rmsprop_step(graph, parameter_ids, *learning_rate, *alpha, *epsilon, *weight_decay)?;
            },
            
            OptimizerType::AdaGrad { learning_rate, epsilon, weight_decay } => {
                self.adagrad_step(graph, parameter_ids, *learning_rate, *epsilon, *weight_decay)?;
            },
        }
        
        timer.finish();
        Ok(())
    }
    
    /// SGD optimization step
    fn sgd_step(
        &mut self,
        graph: &mut AutoDiff,
        parameter_ids: &[usize],
        learning_rate: f64,
        momentum: f64,
        weight_decay: f64,
    ) -> MLResult<()> {
        for &param_id in parameter_ids {
            let gradient = graph.get_gradient(param_id)?.clone();
            let mut param_value = graph.values.get_mut(&param_id)
                .ok_or_else(|| MLError::GradientError(format!("Parameter {} not found", param_id)))?;
            
            // Apply weight decay
            let mut effective_grad = if weight_decay > 0.0 {
                &gradient + &(&*param_value * weight_decay)
            } else {
                gradient
            };
            
            // Apply momentum
            if momentum > 0.0 {
                let momentum_buffer = self.momentum_buffers.entry(param_id)
                    .or_insert_with(|| Array1::zeros(param_value.len()));
                
                // Update momentum buffer: momentum * buffer + gradient
                *momentum_buffer = &(*momentum_buffer * momentum) + &effective_grad;
                effective_grad = momentum_buffer.clone();
            }
            
            // Update parameters: param = param - learning_rate * gradient
            *param_value = &*param_value - &(&effective_grad * learning_rate);
        }
        
        Ok(())
    }
    
    /// Adam optimization step
    fn adam_step(
        &mut self,
        graph: &mut AutoDiff,
        parameter_ids: &[usize],
        learning_rate: f64,
        beta1: f64,
        beta2: f64,
        epsilon: f64,
        weight_decay: f64,
    ) -> MLResult<()> {
        for &param_id in parameter_ids {
            let gradient = graph.get_gradient(param_id)?.clone();
            let mut param_value = graph.values.get_mut(&param_id)
                .ok_or_else(|| MLError::GradientError(format!("Parameter {} not found", param_id)))?;
            
            // Apply weight decay
            let effective_grad = if weight_decay > 0.0 {
                &gradient + &(&*param_value * weight_decay)
            } else {
                gradient
            };
            
            // Initialize first and second moment estimates
            let first_moment = self.first_moments.entry(param_id)
                .or_insert_with(|| Array1::zeros(param_value.len()));
            let second_moment = self.second_moments.entry(param_id)
                .or_insert_with(|| Array1::zeros(param_value.len()));
            
            // Update first moment estimate: m_t = beta1 * m_{t-1} + (1 - beta1) * g_t
            *first_moment = &(*first_moment * beta1) + &(&effective_grad * (1.0 - beta1));
            
            // Update second moment estimate: v_t = beta2 * v_{t-1} + (1 - beta2) * g_t^2
            let grad_squared = effective_grad.mapv(|g| g * g);
            *second_moment = &(*second_moment * beta2) + &(&grad_squared * (1.0 - beta2));
            
            // Bias correction
            let bias_correction1 = 1.0 - beta1.powi(self.step_count as i32);
            let bias_correction2 = 1.0 - beta2.powi(self.step_count as i32);
            
            let corrected_first = &*first_moment / bias_correction1;
            let corrected_second = &*second_moment / bias_correction2;
            
            // Update parameters: param = param - learning_rate * m_hat / (sqrt(v_hat) + epsilon)
            let denominator = corrected_second.mapv(|v| v.sqrt() + epsilon);
            let update = &corrected_first / &denominator;
            *param_value = &*param_value - &(&update * learning_rate);
        }
        
        Ok(())
    }
    
    /// RMSprop optimization step
    fn rmsprop_step(
        &mut self,
        graph: &mut AutoDiff,
        parameter_ids: &[usize],
        learning_rate: f64,
        alpha: f64,
        epsilon: f64,
        weight_decay: f64,
    ) -> MLResult<()> {
        for &param_id in parameter_ids {
            let gradient = graph.get_gradient(param_id)?.clone();
            let mut param_value = graph.values.get_mut(&param_id)
                .ok_or_else(|| MLError::GradientError(format!("Parameter {} not found", param_id)))?;
            
            // Apply weight decay
            let effective_grad = if weight_decay > 0.0 {
                &gradient + &(&*param_value * weight_decay)
            } else {
                gradient
            };
            
            // Initialize squared gradients
            let squared_grad = self.squared_grads.entry(param_id)
                .or_insert_with(|| Array1::zeros(param_value.len()));
            
            // Update squared gradients: E[g^2]_t = alpha * E[g^2]_{t-1} + (1 - alpha) * g_t^2
            let grad_squared = effective_grad.mapv(|g| g * g);
            *squared_grad = &(*squared_grad * alpha) + &(&grad_squared * (1.0 - alpha));
            
            // Update parameters: param = param - learning_rate * g_t / (sqrt(E[g^2]_t) + epsilon)
            let denominator = squared_grad.mapv(|v| v.sqrt() + epsilon);
            let update = &effective_grad / &denominator;
            *param_value = &*param_value - &(&update * learning_rate);
        }
        
        Ok(())
    }
    
    /// AdaGrad optimization step
    fn adagrad_step(
        &mut self,
        graph: &mut AutoDiff,
        parameter_ids: &[usize],
        learning_rate: f64,
        epsilon: f64,
        weight_decay: f64,
    ) -> MLResult<()> {
        for &param_id in parameter_ids {
            let gradient = graph.get_gradient(param_id)?.clone();
            let mut param_value = graph.values.get_mut(&param_id)
                .ok_or_else(|| MLError::GradientError(format!("Parameter {} not found", param_id)))?;
            
            // Apply weight decay
            let effective_grad = if weight_decay > 0.0 {
                &gradient + &(&*param_value * weight_decay)
            } else {
                gradient
            };
            
            // Initialize accumulated squared gradients
            let accumulated_grad = self.squared_grads.entry(param_id)
                .or_insert_with(|| Array1::zeros(param_value.len()));
            
            // Accumulate squared gradients: G_t = G_{t-1} + g_t^2
            let grad_squared = effective_grad.mapv(|g| g * g);
            *accumulated_grad = &*accumulated_grad + &grad_squared;
            
            // Update parameters: param = param - learning_rate * g_t / (sqrt(G_t) + epsilon)
            let denominator = accumulated_grad.mapv(|v| v.sqrt() + epsilon);
            let update = &effective_grad / &denominator;
            *param_value = &*param_value - &(&update * learning_rate);
        }
        
        Ok(())
    }
    
    /// Zero optimizer state
    pub fn zero_state(&mut self) {
        self.momentum_buffers.clear();
        self.first_moments.clear();
        self.second_moments.clear();
        self.squared_grads.clear();
        self.step_count = 0;
    }
    
    /// Get current step count
    pub fn get_step_count(&self) -> usize {
        self.step_count
    }
}

/// Backpropagation engine for efficient gradient computation
#[derive(Debug)]
pub struct BackpropEngine {
    /// Computation graph
    graph: AutoDiff,
    /// Tensor operations helper
    tensor_ops: TensorOperations,
    /// Optimizer
    optimizer: GradientOptimizer,
    /// Parameter IDs
    parameter_ids: Vec<usize>,
}

impl BackpropEngine {
    /// Create new backpropagation engine
    pub fn new(optimizer: GradientOptimizer) -> Self {
        Self {
            graph: AutoDiff::new(),
            tensor_ops: TensorOperations::new(),
            optimizer,
            parameter_ids: Vec::new(),
        }
    }
    
    /// Add parameter to be optimized
    pub fn add_parameter(&mut self, data: Array1<f64>) -> MLResult<usize> {
        let param_id = self.graph.parameter(data)?;
        self.parameter_ids.push(param_id);
        Ok(param_id)
    }
    
    /// Forward pass through the network
    pub fn forward(&mut self, inputs: &[(usize, Array1<f64>)]) -> MLResult<usize> {
        // Set input values
        for &(node_id, ref data) in inputs {
            self.graph.values.insert(node_id, data.clone());
        }
        
        // For now, return the first input as output (placeholder)
        if !inputs.is_empty() {
            Ok(inputs[0].0)
        } else {
            Err(MLError::GradientError("No inputs provided".to_string()))
        }
    }
    
    /// Backward pass and parameter update
    pub fn backward_and_step(&mut self, loss_node: usize) -> MLResult<()> {
        // Compute gradients
        self.graph.backward(loss_node)?;
        
        // Update parameters
        self.optimizer.step(&mut self.graph, &self.parameter_ids)?;
        
        // Zero gradients
        self.graph.zero_grad();
        
        Ok(())
    }
    
    /// Get parameter values
    pub fn get_parameters(&self) -> MLResult<Vec<Array1<f64>>> {
        let mut params = Vec::new();
        for &param_id in &self.parameter_ids {
            let param_value = self.graph.get_value(param_id)?.clone();
            params.push(param_value);
        }
        Ok(params)
    }
    
    /// Set parameter values
    pub fn set_parameters(&mut self, parameters: Vec<Array1<f64>>) -> MLResult<()> {
        if parameters.len() != self.parameter_ids.len() {
            return Err(MLError::GradientError("Parameter count mismatch".to_string()));
        }
        
        for (i, param) in parameters.into_iter().enumerate() {
            let param_id = self.parameter_ids[i];
            self.graph.values.insert(param_id, param);
        }
        
        Ok(())
    }
    
    /// Get computation graph
    pub fn get_graph(&self) -> &AutoDiff {
        &self.graph
    }
    
    /// Get mutable computation graph
    pub fn get_graph_mut(&mut self) -> &mut AutoDiff {
        &mut self.graph
    }
}

impl MemoryAware for BackpropEngine {
    fn check_memory_requirements(&self, config: &super::MLExtensionsConfig) -> MLResult<()> {
        let estimated = self.estimated_memory_usage();
        if estimated > config.max_memory {
            return Err(MLError::MemoryError {
                requested: estimated,
                limit: config.max_memory,
            });
        }
        Ok(())
    }
    
    fn estimated_memory_usage(&self) -> usize {
        // Estimate memory usage
        let n_nodes = self.graph.num_nodes();
        let n_params = self.parameter_ids.len();
        
        // Graph structure
        let graph_memory = n_nodes * 128; // Approximate per node
        
        // Parameter storage
        let param_memory = n_params * 1000 * 8; // Assume 1000 elements per parameter
        
        // Optimizer state
        let optimizer_memory = n_params * 3 * 1000 * 8; // 3 buffers per parameter
        
        graph_memory + param_memory + optimizer_memory
    }
}

impl GpuAccelerated for BackpropEngine {
    fn is_gpu_available(&self) -> bool {
        // Would check for actual GPU availability
        false
    }
    
    fn enable_gpu(&mut self) -> MLResult<()> {
        Err(MLError::GpuError("GPU acceleration not implemented".to_string()))
    }
    
    fn disable_gpu(&mut self) {
        // No-op for CPU-only implementation
    }
}

impl Serializable for BackpropEngine {
    fn serialize(&self) -> MLResult<Vec<u8>> {
        let data = serde_json::to_vec(&self.optimizer.optimizer_type)
            .map_err(|e| MLError::SerializationError(format!("Failed to serialize BackpropEngine: {}", e)))?;
        Ok(data)
    }
    
    fn deserialize(data: &[u8]) -> MLResult<Self> {
        let optimizer_type: OptimizerType = serde_json::from_slice(data)
            .map_err(|e| MLError::SerializationError(format!("Failed to deserialize BackpropEngine: {}", e)))?;
        
        let optimizer = match optimizer_type {
            OptimizerType::SGD { learning_rate, momentum, weight_decay } => {
                GradientOptimizer::sgd(learning_rate, momentum, weight_decay)
            },
            OptimizerType::Adam { learning_rate, beta1, beta2, epsilon, weight_decay } => {
                GradientOptimizer::adam(learning_rate, beta1, beta2, epsilon, weight_decay)
            },
            OptimizerType::RMSprop { learning_rate, alpha, epsilon, weight_decay } => {
                GradientOptimizer::rmsprop(learning_rate, alpha, epsilon, weight_decay)
            },
            OptimizerType::AdaGrad { learning_rate, epsilon, weight_decay } => {
                GradientOptimizer::rmsprop(learning_rate, 0.99, epsilon, weight_decay) // Approximate as RMSprop
            },
        };
        
        Ok(Self::new(optimizer))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;
    
    #[test]
    fn test_autodiff_basic_operations() {
        let mut graph = AutoDiff::new();
        
        let a = graph.variable(Array1::from_vec(vec![2.0, 3.0]), true).unwrap();
        let b = graph.variable(Array1::from_vec(vec![4.0, 5.0]), true).unwrap();
        
        let c = graph.add(a, b).unwrap();
        let expected = Array1::from_vec(vec![6.0, 8.0]);
        
        assert_relative_eq!(graph.get_value(c).unwrap().as_slice().unwrap(), expected.as_slice().unwrap());
    }
    
    #[test]
    fn test_autodiff_backward() {
        let mut graph = AutoDiff::new();
        
        let x = graph.variable(Array1::from_vec(vec![2.0]), true).unwrap();
        let y = graph.variable(Array1::from_vec(vec![3.0]), true).unwrap();
        
        // z = x * y
        let z = graph.mul(x, y).unwrap();
        
        graph.backward(z).unwrap();
        
        // dz/dx should be y = 3.0
        let grad_x = graph.get_gradient(x).unwrap();
        assert_relative_eq!(grad_x[0], 3.0);
        
        // dz/dy should be x = 2.0
        let grad_y = graph.get_gradient(y).unwrap();
        assert_relative_eq!(grad_y[0], 2.0);
    }
    
    #[test]
    fn test_tensor_operations() {
        let mut tensor_ops = TensorOperations::new();
        
        let a = tensor_ops.tensor(Array1::from_vec(vec![1.0, 2.0]), true).unwrap();
        let b = tensor_ops.tensor(Array1::from_vec(vec![3.0, 4.0]), true).unwrap();
        let target = tensor_ops.tensor(Array1::from_vec(vec![5.0, 6.0]), false).unwrap();
        
        let predicted = tensor_ops.get_graph_mut().add(a, b).unwrap();
        let loss = tensor_ops.mse_loss(predicted, target).unwrap();
        
        tensor_ops.get_graph_mut().backward(loss).unwrap();
        
        // Check that gradients were computed
        assert!(tensor_ops.get_graph().get_gradient(a).is_ok());
        assert!(tensor_ops.get_graph().get_gradient(b).is_ok());
    }
    
    #[test]
    fn test_sgd_optimizer() {
        let mut optimizer = GradientOptimizer::sgd(0.1, 0.0, 0.0);
        let mut graph = AutoDiff::new();
        
        let param = graph.parameter(Array1::from_vec(vec![1.0, 2.0])).unwrap();
        
        // Simulate gradient
        graph.gradients.insert(param, Array1::from_vec(vec![0.5, 1.0]));
        
        optimizer.step(&mut graph, &[param]).unwrap();
        
        // Parameter should be updated: param = param - lr * grad
        let updated_param = graph.get_value(param).unwrap();
        assert_relative_eq!(updated_param[0], 1.0 - 0.1 * 0.5); // 0.95
        assert_relative_eq!(updated_param[1], 2.0 - 0.1 * 1.0); // 1.9
    }
    
    #[test]
    fn test_adam_optimizer() {
        let mut optimizer = GradientOptimizer::adam(0.01, 0.9, 0.999, 1e-8, 0.0);
        let mut graph = AutoDiff::new();
        
        let param = graph.parameter(Array1::from_vec(vec![1.0])).unwrap();
        
        // Simulate gradient
        graph.gradients.insert(param, Array1::from_vec(vec![0.1]));
        
        optimizer.step(&mut graph, &[param]).unwrap();
        
        // Parameter should be updated (exact value depends on Adam computation)
        let updated_param = graph.get_value(param).unwrap();
        assert!(updated_param[0] < 1.0); // Should decrease
    }
    
    #[test]
    fn test_backprop_engine() {
        let optimizer = GradientOptimizer::sgd(0.1, 0.0, 0.0);
        let mut engine = BackpropEngine::new(optimizer);
        
        let param1 = engine.add_parameter(Array1::from_vec(vec![1.0, 2.0])).unwrap();
        let param2 = engine.add_parameter(Array1::from_vec(vec![3.0, 4.0])).unwrap();
        
        let params = engine.get_parameters().unwrap();
        assert_eq!(params.len(), 2);
        assert_eq!(params[0], Array1::from_vec(vec![1.0, 2.0]));
        assert_eq!(params[1], Array1::from_vec(vec![3.0, 4.0]));
    }
    
    #[test]
    fn test_activation_functions() {
        let mut graph = AutoDiff::new();
        
        let x = graph.variable(Array1::from_vec(vec![0.0, 1.0, -1.0]), true).unwrap();
        
        // Test sigmoid
        let sigmoid_out = graph.sigmoid(x).unwrap();
        let sigmoid_values = graph.get_value(sigmoid_out).unwrap();
        assert_relative_eq!(sigmoid_values[0], 0.5, epsilon = 1e-6);
        assert!(sigmoid_values[1] > 0.5);
        assert!(sigmoid_values[2] < 0.5);
        
        // Test ReLU
        let relu_out = graph.relu(x).unwrap();
        let relu_values = graph.get_value(relu_out).unwrap();
        assert_relative_eq!(relu_values[0], 0.0);
        assert_relative_eq!(relu_values[1], 1.0);
        assert_relative_eq!(relu_values[2], 0.0);
    }
}