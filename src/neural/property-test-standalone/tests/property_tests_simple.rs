//! Simple property-based tests for neural network numerical stability
//! 
//! This demonstrates property-based testing patterns for neural networks using proptest.

use proptest::prelude::*;

// Activation function implementations for testing
fn sigmoid_activation(x: f32) -> f32 {
    1.0 / (1.0 + (-x).exp())
}

fn relu_activation(x: f32) -> f32 {
    x.max(0.0)
}

fn tanh_activation(x: f32) -> f32 {
    x.tanh()
}

// Matrix and vector operations
fn vector_add(a: &[f32], b: &[f32]) -> Vec<f32> {
    a.iter().zip(b.iter()).map(|(x, y)| x + y).collect()
}

fn vector_scale(a: &[f32], scale: f32) -> Vec<f32> {
    a.iter().map(|x| x * scale).collect()
}

// Loss function implementations
fn mean_squared_error(predictions: &[f32], targets: &[f32]) -> f32 {
    let sum: f32 = predictions.iter().zip(targets.iter())
        .map(|(p, t)| (p - t).powi(2))
        .sum();
    sum / predictions.len() as f32
}

/// Test strategies for generating neural network inputs
mod strategies {
    use super::*;
    
    /// Generate finite floating point numbers (excludes NaN, infinity)
    pub fn finite_f32() -> impl Strategy<Value = f32> {
        any::<f32>().prop_filter("must be finite", |x| x.is_finite())
    }
    
    /// Generate small floating point numbers for numerical stability
    pub fn stable_f32() -> impl Strategy<Value = f32> {
        (-100.0f32..100.0f32).prop_filter("must be finite", |x| x.is_finite())
    }
    
    /// Generate small vectors for stability testing
    pub fn stable_f32_vec(size: usize) -> impl Strategy<Value = Vec<f32>> {
        prop::collection::vec(stable_f32(), size)
    }
}

/// Activation function property tests
#[cfg(test)]
mod activation_properties {
    use super::*;
    
    proptest! {
        #[test]
        fn sigmoid_bounded(x in strategies::finite_f32()) {
            let result = sigmoid_activation(x);
            prop_assert!(result >= 0.0 && result <= 1.0, 
                "Sigmoid output {} for input {} not in [0,1]", result, x);
        }
        
        #[test]
        fn sigmoid_monotonic_increasing(x1 in strategies::stable_f32(), x2 in strategies::stable_f32()) {
            prop_assume!(x1 < x2);
            let y1 = sigmoid_activation(x1);
            let y2 = sigmoid_activation(x2);
            prop_assert!(y1 <= y2, 
                "Sigmoid not monotonic: f({}) = {} > f({}) = {}", x1, y1, x2, y2);
        }
        
        #[test]
        fn sigmoid_symmetry(x in strategies::stable_f32()) {
            let pos = sigmoid_activation(x);
            let neg = sigmoid_activation(-x);
            let sum = pos + neg;
            prop_assert!((sum - 1.0).abs() < 1e-6,
                "Sigmoid symmetry violated: sigmoid({}) + sigmoid({}) = {} != 1", x, -x, sum);
        }
        
        #[test]
        fn sigmoid_derivative_bounded(x in strategies::stable_f32()) {
            let s = sigmoid_activation(x);
            let derivative = s * (1.0 - s);
            prop_assert!(derivative >= 0.0 && derivative <= 0.25,
                "Sigmoid derivative {} not in [0, 0.25]", derivative);
        }
        
        #[test]
        fn relu_non_negative(x in strategies::finite_f32()) {
            let result = relu_activation(x);
            prop_assert!(result >= 0.0, "ReLU output {} is negative", result);
        }
        
        #[test]
        fn relu_identity_positive(x in 0.0f32..1000.0f32) {
            let result = relu_activation(x);
            prop_assert_eq!(result, x, "ReLU(positive) should be identity");
        }
        
        #[test]
        fn relu_zero_negative(x in -1000.0f32..0.0f32) {
            let result = relu_activation(x);
            prop_assert_eq!(result, 0.0, "ReLU(negative) should be zero");
        }
        
        #[test]
        fn tanh_bounded(x in strategies::finite_f32()) {
            let result = tanh_activation(x);
            prop_assert!(result >= -1.0 && result <= 1.0,
                "Tanh output {} not in [-1, 1]", result);
        }
        
        #[test]
        fn tanh_odd_function(x in strategies::stable_f32()) {
            let pos = tanh_activation(x);
            let neg = tanh_activation(-x);
            prop_assert!((pos + neg).abs() < 1e-6,
                "Tanh not odd function: tanh({}) != -tanh({})", x, -x);
        }
    }
}

/// Vector operations property tests
#[cfg(test)]
mod vector_properties {
    use super::*;
    
    proptest! {
        #[test]
        fn vector_add_commutative(a in strategies::stable_f32_vec(50), b in strategies::stable_f32_vec(50)) {
            let result1 = vector_add(&a, &b);
            let result2 = vector_add(&b, &a);
            
            for (x, y) in result1.iter().zip(result2.iter()) {
                prop_assert!((x - y).abs() < 1e-6, "Vector addition not commutative");
            }
        }
        
        #[test]
        fn vector_add_associative(
            a in strategies::stable_f32_vec(20), 
            b in strategies::stable_f32_vec(20), 
            c in strategies::stable_f32_vec(20)
        ) {
            // (a + b) + c
            let ab = vector_add(&a, &b);
            let ab_c = vector_add(&ab, &c);
            
            // a + (b + c)
            let bc = vector_add(&b, &c);
            let a_bc = vector_add(&a, &bc);
            
            for (x, y) in ab_c.iter().zip(a_bc.iter()) {
                prop_assert!((x - y).abs() < 1e-6, "Vector addition not associative");
            }
        }
        
        #[test]
        fn vector_add_zero_identity(a in strategies::stable_f32_vec(100)) {
            let zero = vec![0.0; a.len()];
            let result = vector_add(&a, &zero);
            
            for (x, y) in a.iter().zip(result.iter()) {
                prop_assert_eq!(x, y, "Vector addition with zero not identity");
            }
        }
        
        #[test]
        fn vector_scale_distributive(
            a in strategies::stable_f32_vec(50), 
            s1 in strategies::stable_f32(), 
            s2 in strategies::stable_f32()
        ) {
            // s1 * (s2 * a) = (s1 * s2) * a
            let s2_a = vector_scale(&a, s2);
            let s1_s2_a = vector_scale(&s2_a, s1);
            
            let s1_s2 = s1 * s2;
            let s1s2_a = vector_scale(&a, s1_s2);
            
            for (x, y) in s1_s2_a.iter().zip(s1s2_a.iter()) {
                prop_assert!((x - y).abs() < 1e-5, 
                    "Vector scaling not distributive");
            }
        }
    }
}

/// Loss function property tests
#[cfg(test)]
mod loss_properties {
    use super::*;
    
    proptest! {
        #[test]
        fn mse_loss_non_negative(
            predictions in strategies::stable_f32_vec(50),
            targets in strategies::stable_f32_vec(50)
        ) {
            let loss = mean_squared_error(&predictions, &targets);
            prop_assert!(loss >= 0.0, "MSE loss {} is negative", loss);
            prop_assert!(loss.is_finite(), "MSE loss is not finite");
        }
        
        #[test]
        fn mse_loss_zero_when_equal(values in strategies::stable_f32_vec(50)) {
            let loss = mean_squared_error(&values, &values);
            prop_assert!((loss - 0.0).abs() < 1e-6, 
                "MSE loss should be zero when predictions equal targets");
        }
        
        #[test]
        fn mse_symmetry(
            predictions in strategies::stable_f32_vec(20),
            targets in strategies::stable_f32_vec(20)
        ) {
            let loss1 = mean_squared_error(&predictions, &targets);
            let loss2 = mean_squared_error(&targets, &predictions);
            
            prop_assert!((loss1 - loss2).abs() < 1e-6,
                "MSE loss should be symmetric");
        }
    }
}

/// Numerical stability tests for edge cases
#[cfg(test)]
mod stability_tests {
    use super::*;
    
    proptest! {
        #[test]
        fn handle_extreme_values(x in -1000.0f32..1000.0f32) {
            // Test activation functions with extreme values
            let sigmoid_result = sigmoid_activation(x);
            prop_assert!(sigmoid_result.is_finite(), "Sigmoid failed on extreme value {}", x);
            prop_assert!(sigmoid_result >= 0.0 && sigmoid_result <= 1.0, 
                "Sigmoid bounds violated on extreme value");
            
            let tanh_result = tanh_activation(x);
            prop_assert!(tanh_result.is_finite(), "Tanh failed on extreme value {}", x);
            prop_assert!(tanh_result >= -1.0 && tanh_result <= 1.0, 
                "Tanh bounds violated on extreme value");
            
            let relu_result = relu_activation(x);
            prop_assert!(relu_result.is_finite(), "ReLU failed on extreme value {}", x);
            prop_assert!(relu_result >= 0.0, "ReLU negativity on extreme value");
        }
        
        #[test]
        fn numerical_precision_stability(
            small_values in prop::collection::vec(-1e-6f32..1e-6f32, 10..50)
        ) {
            // Test operations with very small values
            let sum: f32 = small_values.iter().sum();
            prop_assert!(sum.is_finite(), "Small value summation failed");
            
            let scaled = vector_scale(&small_values, 1e6);
            for &val in scaled.iter() {
                prop_assert!(val.is_finite(), "Small value scaling failed");
            }
        }
        
        #[test]
        fn memory_safety_large_operations(size in 1000usize..5000) {
            let large_vector = vec![1.0f32; size];
            let result = vector_scale(&large_vector, 2.0);
            
            prop_assert_eq!(result.len(), size, "Large operation size mismatch");
            for &val in result.iter() {
                prop_assert_eq!(val, 2.0, "Large operation value error");
            }
        }
        
        #[test]
        fn gradient_magnitude_bounds(
            weights in strategies::stable_f32_vec(100),
            learning_rate in 0.001f32..0.1f32
        ) {
            // Simulate gradient computation
            let gradients: Vec<f32> = weights.iter().map(|w| w * 0.1).collect();
            
            // Check gradients are finite
            for &grad in gradients.iter() {
                prop_assert!(grad.is_finite(), "Gradient exploded to non-finite value");
            }
            
            // Check gradient magnitude is reasonable
            let grad_magnitude: f32 = gradients.iter().map(|x| x * x).sum::<f32>().sqrt();
            prop_assert!(grad_magnitude < 1000.0, 
                "Gradient magnitude {} too large", grad_magnitude);
            
            // Check weight updates are stable
            let updated_weights: Vec<f32> = weights.iter().zip(gradients.iter())
                .map(|(w, g)| w - learning_rate * g)
                .collect();
            for &w in updated_weights.iter() {
                prop_assert!(w.is_finite(), "Weight update produced non-finite value");
            }
        }
    }
}

/// Integration tests combining multiple operations
#[cfg(test)]
mod integration_tests {
    use super::*;
    
    proptest! {
        #[test]
        fn forward_pass_stability(
            weights in strategies::stable_f32_vec(100),
            inputs in strategies::stable_f32_vec(10)
        ) {
            // Simulate a simple forward pass
            let mut layer_output = inputs.clone();
            
            // Apply weights (simplified linear layer)
            for i in 0..layer_output.len() {
                layer_output[i] *= weights[i % weights.len()];
            }
            
            // Apply activation function
            for output in layer_output.iter_mut() {
                *output = sigmoid_activation(*output);
            }
            
            // Check all outputs are valid
            for &output in layer_output.iter() {
                prop_assert!(output.is_finite(), "Forward pass produced non-finite output");
                prop_assert!(output >= 0.0 && output <= 1.0, "Sigmoid output out of bounds");
            }
        }
        
        #[test]
        fn training_step_stability(
            weights in strategies::stable_f32_vec(50),
            inputs in strategies::stable_f32_vec(10),
            targets in strategies::stable_f32_vec(10),
            learning_rate in 0.001f32..0.1f32
        ) {
            // Simulate a complete training step
            
            // Forward pass
            let predictions: Vec<f32> = inputs.iter().enumerate()
                .map(|(i, &input)| sigmoid_activation(input * weights[i % weights.len()]))
                .collect();
            
            // Compute loss
            let loss = mean_squared_error(&predictions, &targets);
            prop_assert!(loss.is_finite(), "Loss computation failed");
            prop_assert!(loss >= 0.0, "Loss is negative");
            
            // Compute gradients (simplified)
            let gradients: Vec<f32> = weights.iter().enumerate()
                .map(|(i, _w)| {
                    let pred = predictions[i % predictions.len()];
                    let target = targets[i % targets.len()];
                    2.0 * (pred - target) * pred * (1.0 - pred) * inputs[i % inputs.len()]
                })
                .collect();
            
            // Update weights
            let updated_weights: Vec<f32> = weights.iter().zip(gradients.iter())
                .map(|(w, g)| w - learning_rate * g)
                .collect();
            
            // Check all values remain finite and reasonable
            for &grad in gradients.iter() {
                prop_assert!(grad.is_finite(), "Gradient computation failed");
            }
            
            for &w in updated_weights.iter() {
                prop_assert!(w.is_finite(), "Weight update failed");
            }
        }
    }
}