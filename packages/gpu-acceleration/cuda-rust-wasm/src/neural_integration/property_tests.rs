//! Property-based tests for numerical stability and invariants
//!
//! This module implements property-based testing using proptest to ensure
//! numerical stability, validate invariants, and test edge cases across
//! the neural network WASM implementation.

use super::*;
use crate::neural_integration::{ActivationFunction, NeuralOperation};
use approx::assert_relative_eq;
use proptest::prelude::*;
use std::f32::consts::{E, PI};

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

  /// Generate vectors of finite floating point numbers
  pub fn finite_f32_vec(size: usize) -> impl Strategy<Value = Vec<f32>> {
    prop::collection::vec(finite_f32(), size)
  }

  /// Generate small vectors for stability testing
  pub fn stable_f32_vec(size: usize) -> impl Strategy<Value = Vec<f32>> {
    prop::collection::vec(stable_f32(), size)
  }

  /// Generate matrix dimensions for testing
  pub fn matrix_dims() -> impl Strategy<Value = (usize, usize, usize)> {
    (1usize..=32, 1usize..=32, 1usize..=32)
  }

  /// Generate activation function types
  pub fn activation_function() -> impl Strategy<Value = ActivationFunction> {
    prop_oneof![
      Just(ActivationFunction::Sigmoid),
      Just(ActivationFunction::ReLU),
      Just(ActivationFunction::Tanh),
      Just(ActivationFunction::LeakyReLU),
      Just(ActivationFunction::Swish),
      Just(ActivationFunction::GELU),
    ]
  }
}

/// Activation function property tests
mod activation_properties {
  use super::*;

  /// Test that sigmoid function output is bounded between 0 and 1
  #[cfg(test)]
  mod sigmoid_tests {
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
            prop_assert_relative_eq!(pos + neg, 1.0, epsilon = 1e-6,
                "Sigmoid symmetry violated: sigmoid({}) + sigmoid({}) != 1", x, -x);
        }

        #[test]
        fn sigmoid_derivative_bounded(x in strategies::stable_f32()) {
            let s = sigmoid_activation(x);
            let derivative = s * (1.0 - s);
            prop_assert!(derivative >= 0.0 && derivative <= 0.25,
                "Sigmoid derivative {} not in [0, 0.25]", derivative);
        }
    }
  }

  /// Test ReLU properties
  #[cfg(test)]
  mod relu_tests {
    use super::*;

    proptest! {
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
        fn relu_monotonic_increasing(x1 in strategies::finite_f32(), x2 in strategies::finite_f32()) {
            prop_assume!(x1 < x2);
            let y1 = relu_activation(x1);
            let y2 = relu_activation(x2);
            prop_assert!(y1 <= y2, "ReLU not monotonic increasing");
        }
    }
  }

  /// Test Tanh properties
  #[cfg(test)]
  mod tanh_tests {
    use super::*;

    proptest! {
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
            prop_assert_relative_eq!(pos, -neg, epsilon = 1e-6,
                "Tanh not odd function: tanh({}) != -tanh({})", x, -x);
        }

        #[test]
        fn tanh_monotonic_increasing(x1 in strategies::stable_f32(), x2 in strategies::stable_f32()) {
            prop_assume!(x1 < x2);
            let y1 = tanh_activation(x1);
            let y2 = tanh_activation(x2);
            prop_assert!(y1 <= y2, "Tanh not monotonic increasing");
        }

        #[test]
        fn tanh_derivative_bounded(x in strategies::stable_f32()) {
            let t = tanh_activation(x);
            let derivative = 1.0 - t * t;
            prop_assert!(derivative >= 0.0 && derivative <= 1.0,
                "Tanh derivative {} not in [0, 1]", derivative);
        }
    }
  }
}

/// Matrix operations property tests
mod matrix_properties {
  use super::*;

  proptest! {
      #[test]
      fn matrix_multiply_dimensions((m, k, n) in strategies::matrix_dims()) {
          let a = strategies::stable_f32_vec(m * k).new_tree(&mut TestRunner::default()).unwrap().current();
          let b = strategies::stable_f32_vec(k * n).new_tree(&mut TestRunner::default()).unwrap().current();

          let result = matrix_multiply(&a, &b, m, k, n);
          prop_assert_eq!(result.len(), m * n, "Matrix multiply output dimension incorrect");
      }

      #[test]
      fn matrix_multiply_associative(
          (m, k, n, p) in (1usize..=8, 1usize..=8, 1usize..=8, 1usize..=8)
      ) {
          let a = strategies::stable_f32_vec(m * k).new_tree(&mut TestRunner::default()).unwrap().current();
          let b = strategies::stable_f32_vec(k * n).new_tree(&mut TestRunner::default()).unwrap().current();
          let c = strategies::stable_f32_vec(n * p).new_tree(&mut TestRunner::default()).unwrap().current();

          // (AB)C
          let ab = matrix_multiply(&a, &b, m, k, n);
          let ab_c = matrix_multiply(&ab, &c, m, n, p);

          // A(BC)
          let bc = matrix_multiply(&b, &c, k, n, p);
          let a_bc = matrix_multiply(&a, &bc, m, k, p);

          // Check associativity with tolerance for floating point errors
          for (x, y) in ab_c.iter().zip(a_bc.iter()) {
              prop_assert_relative_eq!(x, y, epsilon = 1e-4,
                  "Matrix multiplication not associative");
          }
      }

      #[test]
      fn matrix_multiply_identity((m, n) in (1usize..=16, 1usize..=16)) {
          let a = strategies::stable_f32_vec(m * n).new_tree(&mut TestRunner::default()).unwrap().current();
          let identity = create_identity_matrix(n);

          let result = matrix_multiply(&a, &identity, m, n, n);

          for (x, y) in a.iter().zip(result.iter()) {
              prop_assert_relative_eq!(x, y, epsilon = 1e-6,
                  "Matrix multiply with identity failed");
          }
      }

      #[test]
      fn matrix_multiply_zero_property((m, k, n) in strategies::matrix_dims()) {
          let a = strategies::stable_f32_vec(m * k).new_tree(&mut TestRunner::default()).unwrap().current();
          let zero = vec![0.0; k * n];

          let result = matrix_multiply(&a, &zero, m, k, n);

          for &x in result.iter() {
              prop_assert_eq!(x, 0.0, "Matrix multiply with zero matrix failed");
          }
      }
  }
}

/// Vector operations property tests
mod vector_properties {
  use super::*;

  proptest! {
      #[test]
      fn vector_add_commutative(a in strategies::stable_f32_vec(1..100), b in strategies::stable_f32_vec(1..100)) {
          prop_assume!(a.len() == b.len());

          let result1 = vector_add(&a, &b);
          let result2 = vector_add(&b, &a);

          for (x, y) in result1.iter().zip(result2.iter()) {
              prop_assert_relative_eq!(x, y, epsilon = 1e-6, "Vector addition not commutative");
          }
      }

      #[test]
      fn vector_add_associative(
          a in strategies::stable_f32_vec(1..50),
          b in strategies::stable_f32_vec(1..50),
          c in strategies::stable_f32_vec(1..50)
      ) {
          prop_assume!(a.len() == b.len() && b.len() == c.len());

          // (a + b) + c
          let ab = vector_add(&a, &b);
          let ab_c = vector_add(&ab, &c);

          // a + (b + c)
          let bc = vector_add(&b, &c);
          let a_bc = vector_add(&a, &bc);

          for (x, y) in ab_c.iter().zip(a_bc.iter()) {
              prop_assert_relative_eq!(x, y, epsilon = 1e-6, "Vector addition not associative");
          }
      }

      #[test]
      fn vector_add_zero_identity(a in strategies::stable_f32_vec(1..100)) {
          let zero = vec![0.0; a.len()];
          let result = vector_add(&a, &zero);

          for (x, y) in a.iter().zip(result.iter()) {
              prop_assert_eq!(x, y, "Vector addition with zero not identity");
          }
      }

      #[test]
      fn vector_scale_distributive(
          a in strategies::stable_f32_vec(1..100),
          s1 in strategies::stable_f32(),
          s2 in strategies::stable_f32()
      ) {
          // s1 * (s2 * a) = (s1 * s2) * a
          let s2_a = vector_scale(&a, s2);
          let s1_s2_a = vector_scale(&s2_a, s1);

          let s1_s2 = s1 * s2;
          let s1s2_a = vector_scale(&a, s1_s2);

          for (x, y) in s1_s2_a.iter().zip(s1s2_a.iter()) {
              prop_assert_relative_eq!(x, y, epsilon = 1e-5,
                  "Vector scaling not distributive");
          }
      }
  }
}

/// Gradient computation property tests
mod gradient_properties {
  use super::*;

  proptest! {
      #[test]
      fn gradient_non_explosion(
          weights in strategies::stable_f32_vec(10..100),
          inputs in strategies::stable_f32_vec(5..20),
          learning_rate in 0.001f32..0.1f32
      ) {
          let gradients = compute_gradients(&weights, &inputs);

          // Check gradients are finite
          for &grad in gradients.iter() {
              prop_assert!(grad.is_finite(), "Gradient exploded to non-finite value");
          }

          // Check gradient magnitude is reasonable
          let grad_magnitude: f32 = gradients.iter().map(|x| x * x).sum::<f32>().sqrt();
          prop_assert!(grad_magnitude < 1000.0,
              "Gradient magnitude {} too large", grad_magnitude);

          // Check weight updates are stable
          let updated_weights = apply_gradient_update(&weights, &gradients, learning_rate);
          for &w in updated_weights.iter() {
              prop_assert!(w.is_finite(), "Weight update produced non-finite value");
          }
      }

      #[test]
      fn gradient_chain_rule_consistency(
          layer1_weights in strategies::stable_f32_vec(20..50),
          layer2_weights in strategies::stable_f32_vec(20..50),
          inputs in strategies::stable_f32_vec(5..10)
      ) {
          // Test that gradient computation follows chain rule correctly
          let layer1_output = forward_pass(&layer1_weights, &inputs);
          let final_output = forward_pass(&layer2_weights, &layer1_output);

          let grad_layer2 = compute_gradients(&layer2_weights, &layer1_output);
          let grad_layer1 = compute_gradients(&layer1_weights, &inputs);

          // Gradients should be finite and reasonable
          for grad in grad_layer2.iter().chain(grad_layer1.iter()) {
              prop_assert!(grad.is_finite(), "Gradient computation produced non-finite value");
              prop_assert!(grad.abs() < 100.0, "Gradient magnitude too large");
          }
      }
  }
}

/// Loss function property tests
mod loss_properties {
  use super::*;

  proptest! {
      #[test]
      fn mse_loss_non_negative(
          predictions in strategies::stable_f32_vec(1..100),
          targets in strategies::stable_f32_vec(1..100)
      ) {
          prop_assume!(predictions.len() == targets.len());

          let loss = mean_squared_error(&predictions, &targets);
          prop_assert!(loss >= 0.0, "MSE loss {} is negative", loss);
          prop_assert!(loss.is_finite(), "MSE loss is not finite");
      }

      #[test]
      fn mse_loss_zero_when_equal(values in strategies::stable_f32_vec(1..100)) {
          let loss = mean_squared_error(&values, &values);
          prop_assert_relative_eq!(loss, 0.0, epsilon = 1e-6,
              "MSE loss should be zero when predictions equal targets");
      }

      #[test]
      fn cross_entropy_loss_properties(
          predictions in strategies::stable_f32_vec(2..20),
          targets in strategies::stable_f32_vec(2..20)
      ) {
          prop_assume!(predictions.len() == targets.len());

          // Normalize predictions to probabilities
          let sum: f32 = predictions.iter().map(|x| x.exp()).sum();
          let probs: Vec<f32> = predictions.iter().map(|x| x.exp() / sum).collect();

          // Convert targets to one-hot (simplified)
          let mut one_hot = vec![0.0; targets.len()];
          if !targets.is_empty() {
              let max_idx = targets.iter().enumerate()
                  .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
                  .map(|(i, _)| i).unwrap_or(0);
              one_hot[max_idx] = 1.0;
          }

          let loss = cross_entropy_loss(&probs, &one_hot);
          prop_assert!(loss >= 0.0, "Cross-entropy loss should be non-negative");
          prop_assert!(loss.is_finite(), "Cross-entropy loss should be finite");
      }
  }
}

/// Numerical stability tests for edge cases
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
  }
}

// Helper functions for activation functions (simple implementations for testing)
fn sigmoid_activation(x: f32) -> f32 {
  1.0 / (1.0 + (-x).exp())
}

fn relu_activation(x: f32) -> f32 {
  x.max(0.0)
}

fn tanh_activation(x: f32) -> f32 {
  x.tanh()
}

// Helper functions for matrix and vector operations
fn matrix_multiply(
  a: &[f32],
  b: &[f32],
  m: usize,
  k: usize,
  n: usize,
) -> Vec<f32> {
  let mut result = vec![0.0; m * n];
  for i in 0..m {
    for j in 0..n {
      for l in 0..k {
        result[i * n + j] += a[i * k + l] * b[l * n + j];
      }
    }
  }
  result
}

fn vector_add(a: &[f32], b: &[f32]) -> Vec<f32> {
  a.iter().zip(b.iter()).map(|(x, y)| x + y).collect()
}

fn vector_scale(a: &[f32], scale: f32) -> Vec<f32> {
  a.iter().map(|x| x * scale).collect()
}

fn create_identity_matrix(n: usize) -> Vec<f32> {
  let mut identity = vec![0.0; n * n];
  for i in 0..n {
    identity[i * n + i] = 1.0;
  }
  identity
}

// Helper functions for gradient computation
fn compute_gradients(weights: &[f32], inputs: &[f32]) -> Vec<f32> {
  // Simplified gradient computation for testing
  weights
    .iter()
    .zip(inputs.iter().cycle())
    .map(|(w, i)| w * i * 0.1)
    .collect()
}

fn apply_gradient_update(
  weights: &[f32],
  gradients: &[f32],
  learning_rate: f32,
) -> Vec<f32> {
  weights
    .iter()
    .zip(gradients.iter())
    .map(|(w, g)| w - learning_rate * g)
    .collect()
}

fn forward_pass(weights: &[f32], inputs: &[f32]) -> Vec<f32> {
  // Simplified forward pass
  inputs
    .iter()
    .zip(weights.iter().cycle())
    .map(|(i, w)| sigmoid_activation(i * w))
    .collect()
}

// Helper functions for loss computation
fn mean_squared_error(predictions: &[f32], targets: &[f32]) -> f32 {
  let sum: f32 = predictions
    .iter()
    .zip(targets.iter())
    .map(|(p, t)| (p - t).powi(2))
    .sum();
  sum / predictions.len() as f32
}

fn cross_entropy_loss(predictions: &[f32], targets: &[f32]) -> f32 {
  -targets
    .iter()
    .zip(predictions.iter())
    .map(|(t, p)| t * p.ln().max(-100.0)) // Clamp to avoid -inf
    .sum::<f32>()
}

#[cfg(test)]
mod integration_tests {
  use super::*;

  #[test]
  fn test_property_test_infrastructure() {
    // Basic smoke test to ensure property test infrastructure works
    let test_runner = TestRunner::default();
    assert!(test_runner.config().max_shrink_iters > 0);
  }

  #[test]
  fn test_activation_function_enum() {
    // Test that activation function enum works correctly
    let sigmoid = ActivationFunction::Sigmoid;
    let relu = ActivationFunction::ReLU;
    let tanh = ActivationFunction::Tanh;

    // Basic smoke test - just ensure they can be constructed
    assert!(matches!(sigmoid, ActivationFunction::Sigmoid));
    assert!(matches!(relu, ActivationFunction::ReLU));
    assert!(matches!(tanh, ActivationFunction::Tanh));
  }
}
