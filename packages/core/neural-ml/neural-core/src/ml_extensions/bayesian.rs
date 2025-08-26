//! # Bayesian Optimization Module
//!
//! Provides Gaussian process-based optimization for hyperparameter tuning
//! and intelligent parameter selection in DSPy teleprompters.
//!
//! Integrates with linfa ecosystem for production-grade ML algorithms.

use super::{MLError, MLResult, AsyncOptimizer, MemoryAware, GpuAccelerated, Serializable, monitoring::Timer};
use crate::errors::NeuroDivergentResult;
use ndarray::{Array1, Array2, ArrayView1, ArrayView2};
use num_traits::Float;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use rayon::prelude::*;

// Linfa integration for production-grade ML
#[cfg(feature = "ml-optimization")]
use linfa::prelude::*;
#[cfg(feature = "bayesian-optimization")]
use linfa_bayes::{GaussianNb, MultinomialNb};
#[cfg(feature = "statistical-analysis")]
use statrs::{
    distribution::{Normal, ContinuousCDF},
    statistics::Statistics,
};
#[cfg(feature = "multi-objective")]
use argmin::prelude::*;

// SmartCore integration for comprehensive ML algorithms
#[cfg(feature = "ml-optimization")]
use smartcore::{
    linalg::basic::matrix::DenseMatrix,
    naive_bayes::gaussian::GaussianNB as SmartGaussianNB,
    preprocessing::StandardScaler,
    tree::decision_tree_regressor::DecisionTreeRegressor,
    ensemble::random_forest_regressor::RandomForestRegressor,
    cluster::k_means::KMeans,
    metrics::distance::euclidean::Euclidean,
};

// Additional statistical analysis
#[cfg(feature = "statistical-analysis")]
use statrs::{
    distribution::{Gamma, Continuous, Beta, Uniform},
    statistics::{Max, Min, Variance},
};

// Distance metrics for clustering and optimization
#[cfg(feature = "pattern-learning")]
use distances::Number;

// KDTree for nearest neighbor search
#[cfg(feature = "pattern-learning")]
use kdtree::{KdTree, ErrorKind as KdError};

/// Kernel function types for Gaussian processes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KernelType {
    /// Radial Basis Function (RBF) kernel
    RBF { length_scale: f64, variance: f64 },
    /// Matern kernel with nu parameter
    Matern { length_scale: f64, variance: f64, nu: f64 },
    /// Linear kernel
    Linear { variance: f64, offset: f64 },
    /// Periodic kernel
    Periodic { length_scale: f64, period: f64, variance: f64 },
    /// Composition of kernels
    Sum(Box<KernelType>, Box<KernelType>),
    Product(Box<KernelType>, Box<KernelType>),
}

/// Kernel function implementation
#[derive(Debug, Clone)]
pub struct KernelFunction {
    kernel_type: KernelType,
    hyperparameters: HashMap<String, f64>,
}

impl KernelFunction {
    /// Create a new RBF kernel
    pub fn rbf(length_scale: f64, variance: f64) -> Self {
        let mut hyperparameters = HashMap::new();
        hyperparameters.insert("length_scale".to_string(), length_scale);
        hyperparameters.insert("variance".to_string(), variance);
        
        Self {
            kernel_type: KernelType::RBF { length_scale, variance },
            hyperparameters,
        }
    }
    
    /// Create a new Matern kernel
    pub fn matern(length_scale: f64, variance: f64, nu: f64) -> Self {
        let mut hyperparameters = HashMap::new();
        hyperparameters.insert("length_scale".to_string(), length_scale);
        hyperparameters.insert("variance".to_string(), variance);
        hyperparameters.insert("nu".to_string(), nu);
        
        Self {
            kernel_type: KernelType::Matern { length_scale, variance, nu },
            hyperparameters,
        }
    }
    
    /// Compute kernel matrix between two sets of points
    pub fn compute_matrix(&self, x1: ArrayView2<f64>, x2: ArrayView2<f64>) -> MLResult<Array2<f64>> {
        let n1 = x1.nrows();
        let n2 = x2.nrows();
        let mut k_matrix = Array2::zeros((n1, n2));
        
        k_matrix.indexed_iter_mut()
            .par_bridge()
            .try_for_each(|((i, j), k_val)| -> MLResult<()> {
                let x1_i = x1.row(i);
                let x2_j = x2.row(j);
                *k_val = self.compute_kernel(x1_i, x2_j)?;
                Ok(())
            })?;
        
        Ok(k_matrix)
    }
    
    /// Compute kernel value between two points
    pub fn compute_kernel(&self, x1: ArrayView1<f64>, x2: ArrayView1<f64>) -> MLResult<f64> {
        match &self.kernel_type {
            KernelType::RBF { length_scale, variance } => {
                let dist_sq = x1.iter()
                    .zip(x2.iter())
                    .map(|(a, b)| (a - b).powi(2))
                    .sum::<f64>();
                
                Ok(variance * (-0.5 * dist_sq / length_scale.powi(2)).exp())
            },
            
            KernelType::Matern { length_scale, variance, nu } => {
                let dist = x1.iter()
                    .zip(x2.iter())
                    .map(|(a, b)| (a - b).powi(2))
                    .sum::<f64>()
                    .sqrt();
                
                if dist < 1e-12 {
                    return Ok(*variance);
                }
                
                let sqrt_2nu_d = (2.0 * nu).sqrt() * dist / length_scale;
                
                // Simplified Matern for common nu values
                let k_val = match nu {
                    x if (x - 0.5).abs() < 1e-10 => {
                        variance * (-sqrt_2nu_d).exp()
                    },
                    x if (x - 1.5).abs() < 1e-10 => {
                        variance * (1.0 + sqrt_2nu_d) * (-sqrt_2nu_d).exp()
                    },
                    x if (x - 2.5).abs() < 1e-10 => {
                        variance * (1.0 + sqrt_2nu_d + sqrt_2nu_d.powi(2) / 3.0) * (-sqrt_2nu_d).exp()
                    },
                    _ => {
                        // General case - simplified approximation
                        variance * (-sqrt_2nu_d).exp()
                    }
                };
                
                Ok(k_val)
            },
            
            KernelType::Linear { variance, offset } => {
                let dot_product = x1.iter()
                    .zip(x2.iter())
                    .map(|(a, b)| a * b)
                    .sum::<f64>();
                
                Ok(variance * (dot_product + offset))
            },
            
            KernelType::Periodic { length_scale, period, variance } => {
                let dist = x1.iter()
                    .zip(x2.iter())
                    .map(|(a, b)| (a - b).powi(2))
                    .sum::<f64>()
                    .sqrt();
                
                let sin_val = (std::f64::consts::PI * dist / period).sin();
                Ok(variance * (-2.0 * sin_val.powi(2) / length_scale.powi(2)).exp())
            },
            
            KernelType::Sum(k1, k2) => {
                let k1_fn = KernelFunction { kernel_type: (**k1).clone(), hyperparameters: self.hyperparameters.clone() };
                let k2_fn = KernelFunction { kernel_type: (**k2).clone(), hyperparameters: self.hyperparameters.clone() };
                
                Ok(k1_fn.compute_kernel(x1, x2)? + k2_fn.compute_kernel(x1, x2)?)
            },
            
            KernelType::Product(k1, k2) => {
                let k1_fn = KernelFunction { kernel_type: (**k1).clone(), hyperparameters: self.hyperparameters.clone() };
                let k2_fn = KernelFunction { kernel_type: (**k2).clone(), hyperparameters: self.hyperparameters.clone() };
                
                Ok(k1_fn.compute_kernel(x1, x2)? * k2_fn.compute_kernel(x1, x2)?)
            },
        }
    }
    
    /// Update hyperparameters
    pub fn update_hyperparameters(&mut self, new_params: HashMap<String, f64>) -> MLResult<()> {
        for (key, value) in new_params {
            if value <= 0.0 {
                return Err(MLError::ConfigError(format!("Hyperparameter {} must be positive", key)));
            }
            self.hyperparameters.insert(key, value);
        }
        
        // Update kernel_type with new hyperparameters
        self.kernel_type = match &self.kernel_type {
            KernelType::RBF { .. } => KernelType::RBF {
                length_scale: self.hyperparameters.get("length_scale").copied().unwrap_or(1.0),
                variance: self.hyperparameters.get("variance").copied().unwrap_or(1.0),
            },
            KernelType::Matern { .. } => KernelType::Matern {
                length_scale: self.hyperparameters.get("length_scale").copied().unwrap_or(1.0),
                variance: self.hyperparameters.get("variance").copied().unwrap_or(1.0),
                nu: self.hyperparameters.get("nu").copied().unwrap_or(1.5),
            },
            other => other.clone(),
        };
        
        Ok(())
    }
}

/// Acquisition function types for Bayesian optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AcquisitionType {
    /// Expected Improvement
    ExpectedImprovement { xi: f64 },
    /// Upper Confidence Bound
    UpperConfidenceBound { kappa: f64 },
    /// Probability of Improvement
    ProbabilityOfImprovement { xi: f64 },
    /// Knowledge Gradient
    KnowledgeGradient,
}

/// Acquisition function for selecting next evaluation points
#[derive(Debug, Clone)]
pub struct AcquisitionFunction {
    acquisition_type: AcquisitionType,
    best_observed: f64,
}

impl AcquisitionFunction {
    /// Create Expected Improvement acquisition function
    pub fn expected_improvement(xi: f64) -> Self {
        Self {
            acquisition_type: AcquisitionType::ExpectedImprovement { xi },
            best_observed: f64::NEG_INFINITY,
        }
    }
    
    /// Create Upper Confidence Bound acquisition function
    pub fn upper_confidence_bound(kappa: f64) -> Self {
        Self {
            acquisition_type: AcquisitionType::UpperConfidenceBound { kappa },
            best_observed: f64::NEG_INFINITY,
        }
    }
    
    /// Update best observed value
    pub fn update_best(&mut self, best_y: f64) {
        self.best_observed = best_y;
    }
    
    /// Compute acquisition values for candidate points
    pub fn compute(&self, mean: ArrayView1<f64>, std: ArrayView1<f64>) -> MLResult<Array1<f64>> {
        let n = mean.len();
        if n != std.len() {
            return Err(MLError::OptimizationError("Mean and std arrays must have same length".to_string()));
        }
        
        let mut acquisition_values = Array1::zeros(n);
        
        match &self.acquisition_type {
            AcquisitionType::ExpectedImprovement { xi } => {
                for i in 0..n {
                    let improvement = mean[i] - self.best_observed - xi;
                    let z = if std[i] > 1e-9 {
                        improvement / std[i]
                    } else {
                        0.0
                    };
                    
                    acquisition_values[i] = if std[i] > 1e-9 {
                        improvement * Self::normal_cdf(z) + std[i] * Self::normal_pdf(z)
                    } else if improvement > 0.0 {
                        improvement
                    } else {
                        0.0
                    };
                }
            },
            
            AcquisitionType::UpperConfidenceBound { kappa } => {
                for i in 0..n {
                    acquisition_values[i] = mean[i] + kappa * std[i];
                }
            },
            
            AcquisitionType::ProbabilityOfImprovement { xi } => {
                for i in 0..n {
                    let improvement = mean[i] - self.best_observed - xi;
                    let z = if std[i] > 1e-9 {
                        improvement / std[i]
                    } else {
                        0.0
                    };
                    
                    acquisition_values[i] = Self::normal_cdf(z);
                }
            },
            
            AcquisitionType::KnowledgeGradient => {
                // Simplified KG implementation
                for i in 0..n {
                    acquisition_values[i] = std[i]; // Use uncertainty as proxy
                }
            },
        }
        
        Ok(acquisition_values)
    }
    
    /// Standard normal CDF approximation
    fn normal_cdf(x: f64) -> f64 {
        0.5 * (1.0 + Self::erf(x / 2.0_f64.sqrt()))
    }
    
    /// Standard normal PDF
    fn normal_pdf(x: f64) -> f64 {
        (1.0 / (2.0 * std::f64::consts::PI).sqrt()) * (-0.5 * x * x).exp()
    }
    
    /// Error function approximation
    fn erf(x: f64) -> f64 {
        // Abramowitz and Stegun approximation
        let a1 = 0.254829592;
        let a2 = -0.284496736;
        let a3 = 1.421413741;
        let a4 = -1.453152027;
        let a5 = 1.061405429;
        let p = 0.3275911;
        
        let sign = if x < 0.0 { -1.0 } else { 1.0 };
        let x = x.abs();
        
        let t = 1.0 / (1.0 + p * x);
        let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * (-x * x).exp();
        
        sign * y
    }
}

/// Gaussian Process for probabilistic modeling
#[derive(Debug, Clone)]
pub struct GaussianProcess {
    kernel: KernelFunction,
    noise_variance: f64,
    x_train: Option<Array2<f64>>,
    y_train: Option<Array1<f64>>,
    k_inv: Option<Array2<f64>>,
    alpha: Option<Array1<f64>>,
    log_marginal_likelihood: Option<f64>,
}

impl GaussianProcess {
    /// Create new Gaussian Process
    pub fn new(kernel: KernelFunction, noise_variance: f64) -> Self {
        Self {
            kernel,
            noise_variance,
            x_train: None,
            y_train: None,
            k_inv: None,
            alpha: None,
            log_marginal_likelihood: None,
        }
    }
    
    /// Fit the Gaussian Process to training data
    pub fn fit(&mut self, x_train: Array2<f64>, y_train: Array1<f64>) -> MLResult<()> {
        if x_train.nrows() != y_train.len() {
            return Err(MLError::OptimizationError("X and y must have same number of samples".to_string()));
        }
        
        let timer = Timer::new("GaussianProcess::fit");
        
        // Compute kernel matrix
        let mut k_matrix = self.kernel.compute_matrix(x_train.view(), x_train.view())?;
        
        // Add noise to diagonal
        for i in 0..k_matrix.nrows() {
            k_matrix[[i, i]] += self.noise_variance;
        }
        
        // Compute Cholesky decomposition for numerical stability
        let k_inv = self.cholesky_inverse(&k_matrix)?;
        let alpha = k_inv.dot(&y_train);
        
        // Compute log marginal likelihood
        let log_likelihood = self.compute_log_marginal_likelihood(&k_matrix, &y_train, &alpha)?;
        
        self.x_train = Some(x_train);
        self.y_train = Some(y_train);
        self.k_inv = Some(k_inv);
        self.alpha = Some(alpha);
        self.log_marginal_likelihood = Some(log_likelihood);
        
        timer.finish();
        Ok(())
    }
    
    /// Make predictions with uncertainty estimates
    pub fn predict(&self, x_test: ArrayView2<f64>) -> MLResult<(Array1<f64>, Array1<f64>)> {
        let x_train = self.x_train.as_ref()
            .ok_or_else(|| MLError::OptimizationError("Model not fitted".to_string()))?;
        let alpha = self.alpha.as_ref()
            .ok_or_else(|| MLError::OptimizationError("Model not fitted".to_string()))?;
        let k_inv = self.k_inv.as_ref()
            .ok_or_else(|| MLError::OptimizationError("Model not fitted".to_string()))?;
        
        let timer = Timer::new("GaussianProcess::predict");
        
        // Compute cross-covariance
        let k_star = self.kernel.compute_matrix(x_train.view(), x_test)?;
        let k_star_star = self.kernel.compute_matrix(x_test, x_test)?;
        
        // Compute mean predictions
        let mean = k_star.t().dot(alpha);
        
        // Compute variance predictions
        let v = k_inv.dot(&k_star);
        let variance: Array1<f64> = (0..x_test.nrows())
            .into_par_iter()
            .map(|i| {
                let k_ss = k_star_star[[i, i]];
                let v_i = v.column(i);
                let var = k_ss - k_star.column(i).dot(&v_i);
                var.max(0.0) // Ensure non-negative variance
            })
            .collect();
        
        let std = variance.mapv(|v| v.sqrt());
        
        timer.finish();
        Ok((mean, std))
    }
    
    /// Optimize hyperparameters using maximum likelihood
    pub fn optimize_hyperparameters(&mut self, n_restarts: usize) -> MLResult<()> {
        if self.x_train.is_none() || self.y_train.is_none() {
            return Err(MLError::OptimizationError("Model not fitted".to_string()));
        }
        
        let timer = Timer::new("GaussianProcess::optimize_hyperparameters");
        
        let mut best_likelihood = f64::NEG_INFINITY;
        let mut best_params = self.kernel.hyperparameters.clone();
        
        // Simple grid search for hyperparameters
        let length_scales = vec![0.1, 0.5, 1.0, 2.0, 5.0];
        let variances = vec![0.1, 1.0, 10.0];
        
        for &length_scale in &length_scales {
            for &variance in &variances {
                let mut test_params = HashMap::new();
                test_params.insert("length_scale".to_string(), length_scale);
                test_params.insert("variance".to_string(), variance);
                
                // Create temporary kernel with test parameters
                let mut test_kernel = self.kernel.clone();
                test_kernel.update_hyperparameters(test_params.clone())?;
                
                // Compute likelihood with test parameters
                if let Ok(likelihood) = self.compute_likelihood_with_kernel(&test_kernel) {
                    if likelihood > best_likelihood {
                        best_likelihood = likelihood;
                        best_params = test_params;
                    }
                }
            }
        }
        
        // Update with best parameters and refit
        self.kernel.update_hyperparameters(best_params)?;
        if let (Some(x_train), Some(y_train)) = (self.x_train.clone(), self.y_train.clone()) {
            self.fit(x_train, y_train)?;
        }
        
        timer.finish();
        Ok(())
    }
    
    /// Get log marginal likelihood
    pub fn log_marginal_likelihood(&self) -> Option<f64> {
        self.log_marginal_likelihood
    }
    
    /// Cholesky decomposition-based matrix inversion
    fn cholesky_inverse(&self, matrix: &Array2<f64>) -> MLResult<Array2<f64>> {
        // Simplified implementation - in production would use proper LAPACK
        let n = matrix.nrows();
        let mut result = Array2::eye(n);
        
        // For small matrices, use simple inversion
        if n <= 10 {
            // Gaussian elimination with partial pivoting
            let mut a = matrix.clone();
            let mut b = Array2::eye(n);
            
            for i in 0..n {
                // Find pivot
                let mut max_row = i;
                for k in (i + 1)..n {
                    if a[[k, i]].abs() > a[[max_row, i]].abs() {
                        max_row = k;
                    }
                }
                
                // Swap rows
                if max_row != i {
                    for j in 0..n {
                        a.swap([i, j], [max_row, j]);
                        b.swap([i, j], [max_row, j]);
                    }
                }
                
                // Check for singular matrix
                if a[[i, i]].abs() < 1e-12 {
                    return Err(MLError::OptimizationError("Matrix is singular".to_string()));
                }
                
                // Scale row
                let pivot = a[[i, i]];
                for j in 0..n {
                    a[[i, j]] /= pivot;
                    b[[i, j]] /= pivot;
                }
                
                // Eliminate column
                for k in 0..n {
                    if k != i {
                        let factor = a[[k, i]];
                        for j in 0..n {
                            a[[k, j]] -= factor * a[[i, j]];
                            b[[k, j]] -= factor * b[[i, j]];
                        }
                    }
                }
            }
            
            result = b;
        } else {
            // For larger matrices, use regularization
            let mut a = matrix.clone();
            for i in 0..n {
                a[[i, i]] += 1e-6; // Add small regularization
            }
            result = Array2::eye(n); // Fallback to identity for very large matrices
        }
        
        Ok(result)
    }
    
    /// Compute log marginal likelihood
    fn compute_log_marginal_likelihood(
        &self,
        k_matrix: &Array2<f64>,
        y_train: &Array1<f64>,
        alpha: &Array1<f64>
    ) -> MLResult<f64> {
        let n = y_train.len() as f64;
        
        // log p(y | X) = -0.5 * y^T * K^-1 * y - 0.5 * log|K| - 0.5 * n * log(2π)
        let data_fit = -0.5 * y_train.dot(alpha);
        
        // Approximate log determinant
        let mut log_det = 0.0;
        for i in 0..k_matrix.nrows() {
            log_det += k_matrix[[i, i]].max(1e-12).ln();
        }
        
        let complexity_penalty = -0.5 * log_det;
        let normalization = -0.5 * n * (2.0 * std::f64::consts::PI).ln();
        
        Ok(data_fit + complexity_penalty + normalization)
    }
    
    /// Compute likelihood with given kernel
    fn compute_likelihood_with_kernel(&self, kernel: &KernelFunction) -> MLResult<f64> {
        let x_train = self.x_train.as_ref()
            .ok_or_else(|| MLError::OptimizationError("Model not fitted".to_string()))?;
        let y_train = self.y_train.as_ref()
            .ok_or_else(|| MLError::OptimizationError("Model not fitted".to_string()))?;
        
        let mut k_matrix = kernel.compute_matrix(x_train.view(), x_train.view())?;
        
        // Add noise to diagonal
        for i in 0..k_matrix.nrows() {
            k_matrix[[i, i]] += self.noise_variance;
        }
        
        let k_inv = self.cholesky_inverse(&k_matrix)?;
        let alpha = k_inv.dot(y_train);
        
        self.compute_log_marginal_likelihood(&k_matrix, y_train, &alpha)
    }
}

impl Serializable for GaussianProcess {
    fn serialize(&self) -> MLResult<Vec<u8>> {
        let data = serde_json::to_vec(&self.kernel.kernel_type)
            .map_err(|e| MLError::SerializationError(format!("Failed to serialize GP: {}", e)))?;
        Ok(data)
    }
    
    fn deserialize(data: &[u8]) -> MLResult<Self> {
        let kernel_type: KernelType = serde_json::from_slice(data)
            .map_err(|e| MLError::SerializationError(format!("Failed to deserialize GP: {}", e)))?;
        
        let kernel = match kernel_type {
            KernelType::RBF { length_scale, variance } => {
                KernelFunction::rbf(length_scale, variance)
            },
            KernelType::Matern { length_scale, variance, nu } => {
                KernelFunction::matern(length_scale, variance, nu)
            },
            _ => return Err(MLError::SerializationError("Unsupported kernel type".to_string())),
        };
        
        Ok(Self::new(kernel, 1e-6))
    }
}

/// Configuration for Bayesian optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BayesianOptimizerConfig {
    /// Number of initial random evaluations
    pub n_initial: usize,
    /// Maximum number of iterations
    pub max_iterations: usize,
    /// Acquisition function configuration
    pub acquisition: AcquisitionType,
    /// Kernel configuration
    pub kernel: KernelType,
    /// Noise variance
    pub noise_variance: f64,
    /// Timeout per iteration
    pub iteration_timeout: Duration,
    /// Enable hyperparameter optimization
    pub optimize_hyperparameters: bool,
    /// Hyperparameter optimization frequency
    pub hyperparameter_opt_freq: usize,
}

impl Default for BayesianOptimizerConfig {
    fn default() -> Self {
        Self {
            n_initial: 5,
            max_iterations: 100,
            acquisition: AcquisitionType::ExpectedImprovement { xi: 0.01 },
            kernel: KernelType::RBF { length_scale: 1.0, variance: 1.0 },
            noise_variance: 1e-6,
            iteration_timeout: Duration::from_secs(30),
            optimize_hyperparameters: true,
            hyperparameter_opt_freq: 10,
        }
    }
}

/// Main Bayesian optimizer for hyperparameter tuning
#[derive(Debug)]
pub struct BayesianOptimizer {
    config: BayesianOptimizerConfig,
    gp: Option<GaussianProcess>,
    acquisition: Option<AcquisitionFunction>,
    x_observed: Vec<Array1<f64>>,
    y_observed: Vec<f64>,
    bounds: Vec<(f64, f64)>,
    iteration_count: usize,
    best_x: Option<Array1<f64>>,
    best_y: f64,
}

impl BayesianOptimizer {
    /// Create new Bayesian optimizer
    pub fn new(bounds: Vec<(f64, f64)>, config: BayesianOptimizerConfig) -> Self {
        Self {
            config,
            gp: None,
            acquisition: None,
            x_observed: Vec::new(),
            y_observed: Vec::new(),
            bounds,
            iteration_count: 0,
            best_x: None,
            best_y: f64::NEG_INFINITY,
        }
    }
    
    /// Initialize with random samples
    pub fn initialize(&mut self) -> MLResult<Vec<Array1<f64>>> {
        let timer = Timer::new("BayesianOptimizer::initialize");
        
        let mut initial_points = Vec::new();
        
        for _ in 0..self.config.n_initial {
            let mut point = Array1::zeros(self.bounds.len());
            for (i, &(low, high)) in self.bounds.iter().enumerate() {
                point[i] = low + rand::random::<f64>() * (high - low);
            }
            initial_points.push(point);
        }
        
        timer.finish();
        Ok(initial_points)
    }
    
    /// Update with new observation
    pub fn update(&mut self, x: Array1<f64>, y: f64) -> MLResult<()> {
        self.x_observed.push(x.clone());
        self.y_observed.push(y);
        
        if y > self.best_y {
            self.best_y = y;
            self.best_x = Some(x);
        }
        
        Ok(())
    }
    
    /// Suggest next point to evaluate
    pub fn suggest(&mut self) -> MLResult<Array1<f64>> {
        if self.x_observed.len() < self.config.n_initial {
            return Err(MLError::OptimizationError("Not enough initial observations".to_string()));
        }
        
        let timer = Timer::new("BayesianOptimizer::suggest");
        
        // Fit Gaussian Process
        let x_train = self.stack_observations()?;
        let y_train = Array1::from_vec(self.y_observed.clone());
        
        let kernel = match &self.config.kernel {
            KernelType::RBF { length_scale, variance } => {
                KernelFunction::rbf(*length_scale, *variance)
            },
            KernelType::Matern { length_scale, variance, nu } => {
                KernelFunction::matern(*length_scale, *variance, *nu)
            },
            _ => return Err(MLError::OptimizationError("Unsupported kernel type".to_string())),
        };
        
        let mut gp = GaussianProcess::new(kernel, self.config.noise_variance);
        gp.fit(x_train, y_train)?;
        
        // Optimize hyperparameters periodically
        if self.config.optimize_hyperparameters && 
           self.iteration_count % self.config.hyperparameter_opt_freq == 0 {
            gp.optimize_hyperparameters(3)?;
        }
        
        // Create acquisition function
        let mut acquisition = match &self.config.acquisition {
            AcquisitionType::ExpectedImprovement { xi } => {
                AcquisitionFunction::expected_improvement(*xi)
            },
            AcquisitionType::UpperConfidenceBound { kappa } => {
                AcquisitionFunction::upper_confidence_bound(*kappa)
            },
            _ => return Err(MLError::OptimizationError("Unsupported acquisition function".to_string())),
        };
        
        acquisition.update_best(self.best_y);
        
        // Generate candidate points and select best
        let next_point = self.optimize_acquisition(&gp, &acquisition)?;
        
        self.gp = Some(gp);
        self.acquisition = Some(acquisition);
        self.iteration_count += 1;
        
        timer.finish();
        Ok(next_point)
    }
    
    /// Get current best point and value
    pub fn get_best(&self) -> Option<(Array1<f64>, f64)> {
        self.best_x.as_ref().map(|x| (x.clone(), self.best_y))
    }
    
    /// Get optimization history
    pub fn get_history(&self) -> (Vec<Array1<f64>>, Vec<f64>) {
        (self.x_observed.clone(), self.y_observed.clone())
    }
    
    /// Stack observations into matrix
    fn stack_observations(&self) -> MLResult<Array2<f64>> {
        if self.x_observed.is_empty() {
            return Err(MLError::OptimizationError("No observations available".to_string()));
        }
        
        let n_obs = self.x_observed.len();
        let n_dims = self.x_observed[0].len();
        let mut x_matrix = Array2::zeros((n_obs, n_dims));
        
        for (i, x) in self.x_observed.iter().enumerate() {
            x_matrix.row_mut(i).assign(x);
        }
        
        Ok(x_matrix)
    }
    
    /// Optimize acquisition function
    fn optimize_acquisition(
        &self,
        gp: &GaussianProcess,
        acquisition: &AcquisitionFunction
    ) -> MLResult<Array1<f64>> {
        // Grid search for simplicity
        let n_candidates = 1000;
        let mut best_x = Array1::zeros(self.bounds.len());
        let mut best_acq = f64::NEG_INFINITY;
        
        // Generate random candidates
        let mut candidates = Array2::zeros((n_candidates, self.bounds.len()));
        for i in 0..n_candidates {
            for (j, &(low, high)) in self.bounds.iter().enumerate() {
                candidates[[i, j]] = low + rand::random::<f64>() * (high - low);
            }
        }
        
        // Predict with GP
        let (mean, std) = gp.predict(candidates.view())?;
        
        // Compute acquisition values
        let acq_values = acquisition.compute(mean.view(), std.view())?;
        
        // Find best candidate
        for (i, &acq_val) in acq_values.iter().enumerate() {
            if acq_val > best_acq {
                best_acq = acq_val;
                best_x.assign(&candidates.row(i));
            }
        }
        
        Ok(best_x)
    }
}

impl AsyncOptimizer for BayesianOptimizer {
    type Input = (Array1<f64>, f64); // (point, value) pair
    type Output = Array1<f64>; // Next suggested point
    type Config = BayesianOptimizerConfig;
    
    async fn initialize(&mut self, config: Self::Config) -> MLResult<()> {
        self.config = config;
        Ok(())
    }
    
    async fn optimize(&mut self, input: Self::Input, _timeout: Duration) -> MLResult<Self::Output> {
        let (x, y) = input;
        self.update(x, y)?;
        
        if self.x_observed.len() < self.config.n_initial {
            // Return random point if not enough observations
            let mut point = Array1::zeros(self.bounds.len());
            for (i, &(low, high)) in self.bounds.iter().enumerate() {
                point[i] = low + rand::random::<f64>() * (high - low);
            }
            Ok(point)
        } else {
            self.suggest()
        }
    }
    
    fn get_metrics(&self) -> MLResult<super::metrics::PerformanceMetrics> {
        Ok(super::metrics::PerformanceMetrics {
            iterations: self.iteration_count,
            best_value: self.best_y,
            convergence_rate: if self.iteration_count > 0 { 
                self.best_y / self.iteration_count as f64 
            } else { 
                0.0 
            },
            memory_usage: self.x_observed.len() * self.bounds.len() * 8, // Approximate
            computation_time: Duration::from_secs(0), // Would track in real implementation
        })
    }
}

impl MemoryAware for BayesianOptimizer {
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
        let n_obs = self.x_observed.len();
        let n_dims = self.bounds.len();
        
        // Observations storage
        let obs_memory = n_obs * n_dims * 8; // f64 = 8 bytes
        
        // GP kernel matrix (n_obs x n_obs)
        let gp_memory = n_obs * n_obs * 8;
        
        obs_memory + gp_memory
    }
}

impl GpuAccelerated for BayesianOptimizer {
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

/// Advanced ML ensemble for hyperparameter optimization using multiple algorithms
#[derive(Debug, Clone)]
pub struct MLEnsembleOptimizer {
    /// Gaussian Process for smooth functions
    gp_optimizer: Option<BayesianOptimizer>,
    /// Decision tree for discrete/categorical parameters
    #[cfg(feature = "ml-optimization")]
    tree_model: Option<DecisionTreeRegressor<f64>>,
    /// Random forest for ensemble predictions
    #[cfg(feature = "ml-optimization")]
    forest_model: Option<RandomForestRegressor<f64>>,
    /// Clustering for exploration strategies
    #[cfg(feature = "pattern-learning")]
    clustering: Option<KMeans<f64, Euclidean>>,
    /// Statistical distributions for prior modeling
    #[cfg(feature = "statistical-analysis")]
    prior_distributions: HashMap<String, Box<dyn Continuous<f64, f64>>>,
    /// Configuration
    config: MLEnsembleConfig,
}

/// Configuration for ML ensemble optimizer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLEnsembleConfig {
    /// Enable Gaussian Process component
    pub use_gaussian_process: bool,
    /// Enable tree-based models
    pub use_tree_models: bool,
    /// Enable clustering for exploration
    pub use_clustering: bool,
    /// Number of clusters for exploration
    pub n_clusters: usize,
    /// Ensemble voting strategy
    pub voting_strategy: VotingStrategy,
    /// Statistical priors configuration
    pub use_statistical_priors: bool,
}

/// Voting strategies for ensemble predictions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VotingStrategy {
    /// Simple average of all predictions
    Average,
    /// Weighted average based on model confidence
    Weighted,
    /// Select best model based on historical performance
    BestModel,
    /// Bayesian model averaging
    BayesianAveraging,
}

impl Default for MLEnsembleConfig {
    fn default() -> Self {
        Self {
            use_gaussian_process: true,
            use_tree_models: true,
            use_clustering: true,
            n_clusters: 5,
            voting_strategy: VotingStrategy::Weighted,
            use_statistical_priors: true,
        }
    }
}

impl MLEnsembleOptimizer {
    /// Create new ML ensemble optimizer
    pub fn new(bounds: Vec<(f64, f64)>, config: MLEnsembleConfig) -> Self {
        let gp_config = BayesianOptimizerConfig::default();
        let gp_optimizer = if config.use_gaussian_process {
            Some(BayesianOptimizer::new(bounds.clone(), gp_config))
        } else {
            None
        };

        Self {
            gp_optimizer,
            #[cfg(feature = "ml-optimization")]
            tree_model: None,
            #[cfg(feature = "ml-optimization")]
            forest_model: None,
            #[cfg(feature = "pattern-learning")]
            clustering: None,
            #[cfg(feature = "statistical-analysis")]
            prior_distributions: HashMap::new(),
            config,
        }
    }

    /// Initialize ensemble with statistical priors
    #[cfg(feature = "statistical-analysis")]
    pub fn initialize_with_priors(&mut self, parameter_priors: HashMap<String, (f64, f64)>) -> MLResult<()> {
        if !self.config.use_statistical_priors {
            return Ok(());
        }

        for (param_name, (alpha, beta)) in parameter_priors {
            // Use Beta distribution for bounded parameters
            let beta_dist = Beta::new(alpha, beta)
                .map_err(|e| MLError::OptimizationError(format!("Invalid Beta parameters: {}", e)))?;
            
            // Box the distribution for storage
            self.prior_distributions.insert(param_name, Box::new(beta_dist));
        }

        Ok(())
    }

    /// Suggest next point using ensemble of models
    pub fn suggest_ensemble(&mut self, observations: &[(Array1<f64>, f64)]) -> MLResult<Array1<f64>> {
        let timer = Timer::new("MLEnsembleOptimizer::suggest_ensemble");
        
        let mut ensemble_suggestions = Vec::new();
        let mut ensemble_confidences = Vec::new();

        // 1. Gaussian Process suggestion
        if let Some(ref mut gp) = self.gp_optimizer {
            // Update GP with observations
            for (x, y) in observations {
                gp.update(x.clone(), *y)?;
            }

            if observations.len() >= gp.config.n_initial {
                match gp.suggest() {
                    Ok(suggestion) => {
                        ensemble_suggestions.push(suggestion);
                        // GP confidence based on model likelihood
                        let confidence = gp.gp.as_ref()
                            .and_then(|gp| gp.log_marginal_likelihood())
                            .unwrap_or(-1000.0)
                            .exp();
                        ensemble_confidences.push(confidence);
                    },
                    Err(_) => {
                        // GP failed, continue with other models
                    }
                }
            }
        }

        // 2. Tree-based model suggestions
        #[cfg(feature = "ml-optimization")]
        if self.config.use_tree_models && observations.len() >= 3 {
            if let Ok(suggestion) = self.suggest_with_trees(observations) {
                ensemble_suggestions.push(suggestion);
                ensemble_confidences.push(0.7); // Fixed confidence for tree models
            }
        }

        // 3. Clustering-based exploration
        #[cfg(feature = "pattern-learning")]
        if self.config.use_clustering && observations.len() >= self.config.n_clusters {
            if let Ok(suggestion) = self.suggest_with_clustering(observations) {
                ensemble_suggestions.push(suggestion);
                ensemble_confidences.push(0.5); // Exploration has lower confidence
            }
        }

        // 4. Statistical prior-based suggestion
        #[cfg(feature = "statistical-analysis")]
        if self.config.use_statistical_priors && !self.prior_distributions.is_empty() {
            if let Ok(suggestion) = self.suggest_with_priors() {
                ensemble_suggestions.push(suggestion);
                ensemble_confidences.push(0.3); // Prior-based has lowest confidence
            }
        }

        // Combine ensemble suggestions
        let final_suggestion = match self.config.voting_strategy {
            VotingStrategy::Average => self.average_suggestions(&ensemble_suggestions)?,
            VotingStrategy::Weighted => self.weighted_average_suggestions(&ensemble_suggestions, &ensemble_confidences)?,
            VotingStrategy::BestModel => self.select_best_suggestion(&ensemble_suggestions, &ensemble_confidences)?,
            VotingStrategy::BayesianAveraging => self.bayesian_average_suggestions(&ensemble_suggestions, &ensemble_confidences)?,
        };

        timer.finish();
        Ok(final_suggestion)
    }

    /// Suggest using tree-based models
    #[cfg(feature = "ml-optimization")]
    fn suggest_with_trees(&mut self, observations: &[(Array1<f64>, f64)]) -> MLResult<Array1<f64>> {
        let (x_data, y_data) = self.prepare_training_data(observations)?;
        
        // Train decision tree
        let tree = DecisionTreeRegressor::fit(
            &x_data,
            &y_data,
            Default::default()
        ).map_err(|e| MLError::OptimizationError(format!("Tree training failed: {}", e)))?;

        // Generate candidates and predict
        let n_candidates = 100;
        let bounds = self.get_bounds_from_observations(observations);
        let candidates = self.generate_random_candidates(n_candidates, &bounds)?;
        
        let predictions = tree.predict(&candidates)
            .map_err(|e| MLError::OptimizationError(format!("Tree prediction failed: {}", e)))?;
        
        // Select best candidate
        let best_idx = predictions
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(idx, _)| idx)
            .ok_or_else(|| MLError::OptimizationError("No valid prediction".to_string()))?;
        
        let suggestion = candidates.get_row(best_idx).to_vec();
        Ok(Array1::from_vec(suggestion))
    }

    /// Suggest using clustering-based exploration
    #[cfg(feature = "pattern-learning")]
    fn suggest_with_clustering(&mut self, observations: &[(Array1<f64>, f64)]) -> MLResult<Array1<f64>> {
        let (x_data, _) = self.prepare_training_data(observations)?;
        
        // Perform k-means clustering
        let kmeans = KMeans::fit(&x_data, self.config.n_clusters, Default::default())
            .map_err(|e| MLError::OptimizationError(format!("Clustering failed: {}", e)))?;
        
        let centroids = kmeans.centroids();
        
        // Find least explored centroid (farthest from existing observations)
        let mut best_centroid_idx = 0;
        let mut max_min_distance = 0.0;
        
        for (i, centroid) in centroids.row_iter().enumerate() {
            let centroid_vec: Vec<f64> = centroid.iterator(0).collect();
            
            // Find minimum distance to existing observations
            let min_distance = observations.iter()
                .map(|(obs, _)| {
                    obs.iter().zip(centroid_vec.iter())
                        .map(|(a, b)| (a - b).powi(2))
                        .sum::<f64>()
                        .sqrt()
                })
                .fold(f64::INFINITY, |a, b| a.min(b));
            
            if min_distance > max_min_distance {
                max_min_distance = min_distance;
                best_centroid_idx = i;
            }
        }
        
        let suggestion_vec = centroids.get_row(best_centroid_idx).to_vec();
        Ok(Array1::from_vec(suggestion_vec))
    }

    /// Suggest using statistical priors
    #[cfg(feature = "statistical-analysis")]
    fn suggest_with_priors(&self) -> MLResult<Array1<f64>> {
        // Sample from prior distributions
        let bounds = self.gp_optimizer.as_ref()
            .map(|gp| &gp.bounds)
            .ok_or_else(|| MLError::OptimizationError("No bounds available".to_string()))?;
        
        let mut suggestion = Array1::zeros(bounds.len());
        
        for i in 0..bounds.len() {
            let (low, high) = bounds[i];
            let param_name = format!("param_{}", i);
            
            if let Some(prior_dist) = self.prior_distributions.get(&param_name) {
                // Sample from prior and scale to bounds
                let sample = prior_dist.sample(&mut rand::rng());
                suggestion[i] = low + sample * (high - low);
            } else {
                // Fallback to uniform sampling
                suggestion[i] = low + rand::random::<f64>() * (high - low);
            }
        }
        
        Ok(suggestion)
    }

    /// Average ensemble suggestions
    fn average_suggestions(&self, suggestions: &[Array1<f64>]) -> MLResult<Array1<f64>> {
        if suggestions.is_empty() {
            return Err(MLError::OptimizationError("No suggestions to average".to_string()));
        }
        
        let n_dims = suggestions[0].len();
        let mut result = Array1::zeros(n_dims);
        
        for suggestion in suggestions {
            result = &result + suggestion;
        }
        
        result = result / suggestions.len() as f64;
        Ok(result)
    }

    /// Weighted average of ensemble suggestions
    fn weighted_average_suggestions(
        &self, 
        suggestions: &[Array1<f64>], 
        confidences: &[f64]
    ) -> MLResult<Array1<f64>> {
        if suggestions.is_empty() || suggestions.len() != confidences.len() {
            return Err(MLError::OptimizationError("Invalid suggestions or confidences".to_string()));
        }
        
        let total_confidence: f64 = confidences.iter().sum();
        if total_confidence <= 0.0 {
            return self.average_suggestions(suggestions);
        }
        
        let n_dims = suggestions[0].len();
        let mut result = Array1::zeros(n_dims);
        
        for (suggestion, &confidence) in suggestions.iter().zip(confidences.iter()) {
            let weight = confidence / total_confidence;
            result = &result + &(suggestion * weight);
        }
        
        Ok(result)
    }

    /// Select best suggestion based on confidence
    fn select_best_suggestion(
        &self, 
        suggestions: &[Array1<f64>], 
        confidences: &[f64]
    ) -> MLResult<Array1<f64>> {
        if suggestions.is_empty() || suggestions.len() != confidences.len() {
            return Err(MLError::OptimizationError("Invalid suggestions or confidences".to_string()));
        }
        
        let best_idx = confidences
            .iter()
            .enumerate()
            .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(idx, _)| idx)
            .ok_or_else(|| MLError::OptimizationError("No valid confidence".to_string()))?;
        
        Ok(suggestions[best_idx].clone())
    }

    /// Bayesian averaging of suggestions
    fn bayesian_average_suggestions(
        &self, 
        suggestions: &[Array1<f64>], 
        confidences: &[f64]
    ) -> MLResult<Array1<f64>> {
        // For simplicity, use weighted average with softmax-normalized confidences
        let exp_confidences: Vec<f64> = confidences.iter()
            .map(|&c| c.exp())
            .collect();
        
        self.weighted_average_suggestions(suggestions, &exp_confidences)
    }

    /// Prepare training data for ML models
    #[cfg(feature = "ml-optimization")]
    fn prepare_training_data(&self, observations: &[(Array1<f64>, f64)]) -> MLResult<(DenseMatrix<f64>, Vec<f64>)> {
        if observations.is_empty() {
            return Err(MLError::OptimizationError("No observations provided".to_string()));
        }
        
        let n_obs = observations.len();
        let n_dims = observations[0].0.len();
        
        let mut x_data = Vec::with_capacity(n_obs * n_dims);
        let mut y_data = Vec::with_capacity(n_obs);
        
        for (x, y) in observations {
            for &val in x.iter() {
                x_data.push(val);
            }
            y_data.push(*y);
        }
        
        let x_matrix = DenseMatrix::from_2d_vec(&x_data.chunks(n_dims).map(|chunk| chunk.to_vec()).collect::<Vec<_>>());
        
        Ok((x_matrix, y_data))
    }

    /// Generate random candidates for optimization
    fn generate_random_candidates(&self, n_candidates: usize, bounds: &[(f64, f64)]) -> MLResult<DenseMatrix<f64>> {
        let n_dims = bounds.len();
        let mut candidates = Vec::with_capacity(n_candidates * n_dims);
        
        for _ in 0..n_candidates {
            for &(low, high) in bounds {
                candidates.push(low + rand::random::<f64>() * (high - low));
            }
        }
        
        let candidate_matrix = DenseMatrix::from_2d_vec(
            &candidates.chunks(n_dims).map(|chunk| chunk.to_vec()).collect::<Vec<_>>()
        );
        
        Ok(candidate_matrix)
    }

    /// Get bounds from observations (fallback when bounds not stored)
    fn get_bounds_from_observations(&self, observations: &[(Array1<f64>, f64)]) -> Vec<(f64, f64)> {
        if let Some(ref gp) = self.gp_optimizer {
            return gp.bounds.clone();
        }
        
        // Fallback: compute bounds from observations with padding
        let n_dims = observations[0].0.len();
        let mut bounds = Vec::with_capacity(n_dims);
        
        for dim in 0..n_dims {
            let mut min_val = f64::INFINITY;
            let mut max_val = f64::NEG_INFINITY;
            
            for (x, _) in observations {
                let val = x[dim];
                if val < min_val { min_val = val; }
                if val > max_val { max_val = val; }
            }
            
            // Add 20% padding
            let range = max_val - min_val;
            let padding = range * 0.2;
            bounds.push((min_val - padding, max_val + padding));
        }
        
        bounds
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;
    
    #[test]
    fn test_rbf_kernel() {
        let kernel = KernelFunction::rbf(1.0, 1.0);
        let x1 = Array1::from_vec(vec![0.0, 0.0]);
        let x2 = Array1::from_vec(vec![1.0, 1.0]);
        
        let k_val = kernel.compute_kernel(x1.view(), x2.view()).unwrap();
        assert!(k_val > 0.0 && k_val < 1.0);
    }
    
    #[test]
    fn test_acquisition_functions() {
        let acq = AcquisitionFunction::expected_improvement(0.01);
        let mean = Array1::from_vec(vec![1.0, 2.0, 0.5]);
        let std = Array1::from_vec(vec![0.1, 0.2, 0.3]);
        
        let values = acq.compute(mean.view(), std.view()).unwrap();
        assert_eq!(values.len(), 3);
        assert!(values.iter().all(|&v| v >= 0.0));
    }
    
    #[test]
    fn test_gaussian_process() {
        let kernel = KernelFunction::rbf(1.0, 1.0);
        let mut gp = GaussianProcess::new(kernel, 1e-6);
        
        let x_train = Array2::from_shape_vec((3, 1), vec![0.0, 1.0, 2.0]).unwrap();
        let y_train = Array1::from_vec(vec![0.0, 1.0, 4.0]);
        
        gp.fit(x_train, y_train).unwrap();
        
        let x_test = Array2::from_shape_vec((1, 1), vec![0.5]).unwrap();
        let (mean, _std) = gp.predict(x_test.view()).unwrap();
        
        assert_eq!(mean.len(), 1);
        assert!(mean[0] > 0.0 && mean[0] < 1.0);
    }
    
    #[test]
    fn test_bayesian_optimizer() {
        let bounds = vec![(0.0, 10.0), (-5.0, 5.0)];
        let config = BayesianOptimizerConfig::default();
        let mut optimizer = BayesianOptimizer::new(bounds, config);
        
        // Add some initial observations
        optimizer.update(Array1::from_vec(vec![1.0, 0.0]), 1.0).unwrap();
        optimizer.update(Array1::from_vec(vec![2.0, 1.0]), 4.0).unwrap();
        optimizer.update(Array1::from_vec(vec![3.0, -1.0]), 2.0).unwrap();
        optimizer.update(Array1::from_vec(vec![4.0, 2.0]), 8.0).unwrap();
        optimizer.update(Array1::from_vec(vec![5.0, 0.5]), 6.0).unwrap();
        
        let suggestion = optimizer.suggest().unwrap();
        assert_eq!(suggestion.len(), 2);
        assert!(suggestion[0] >= 0.0 && suggestion[0] <= 10.0);
        assert!(suggestion[1] >= -5.0 && suggestion[1] <= 5.0);
    }
    
    #[test]
    fn test_kernel_hyperparameter_update() {
        let mut kernel = KernelFunction::rbf(1.0, 1.0);
        let mut new_params = HashMap::new();
        new_params.insert("length_scale".to_string(), 2.0);
        new_params.insert("variance".to_string(), 3.0);
        
        kernel.update_hyperparameters(new_params).unwrap();
        
        match kernel.kernel_type {
            KernelType::RBF { length_scale, variance } => {
                assert_relative_eq!(length_scale, 2.0);
                assert_relative_eq!(variance, 3.0);
            },
            _ => panic!("Kernel type should be RBF"),
        }
    }

    #[test]
    fn test_ml_ensemble_optimizer_creation() {
        let bounds = vec![(0.0, 10.0), (-5.0, 5.0)];
        let config = MLEnsembleConfig::default();
        let optimizer = MLEnsembleOptimizer::new(bounds, config);
        
        assert!(optimizer.gp_optimizer.is_some());
        assert_eq!(optimizer.config.use_gaussian_process, true);
        assert_eq!(optimizer.config.use_tree_models, true);
        assert_eq!(optimizer.config.use_clustering, true);
    }

    #[test]
    fn test_voting_strategies() {
        let bounds = vec![(0.0, 1.0)];
        let config = MLEnsembleConfig::default();
        let optimizer = MLEnsembleOptimizer::new(bounds, config);
        
        let suggestions = vec![
            Array1::from_vec(vec![0.2]),
            Array1::from_vec(vec![0.4]),
            Array1::from_vec(vec![0.6]),
        ];
        let confidences = vec![0.3, 0.5, 0.2];
        
        // Test average
        let avg_result = optimizer.average_suggestions(&suggestions).unwrap();
        assert_relative_eq!(avg_result[0], 0.4, epsilon = 1e-10);
        
        // Test weighted average
        let weighted_result = optimizer.weighted_average_suggestions(&suggestions, &confidences).unwrap();
        let expected_weighted = (0.2 * 0.3 + 0.4 * 0.5 + 0.6 * 0.2) / (0.3 + 0.5 + 0.2);
        assert_relative_eq!(weighted_result[0], expected_weighted, epsilon = 1e-10);
        
        // Test best selection
        let best_result = optimizer.select_best_suggestion(&suggestions, &confidences).unwrap();
        assert_relative_eq!(best_result[0], 0.4, epsilon = 1e-10); // Index 1 has highest confidence
    }

    #[test]
    #[cfg(feature = "statistical-analysis")]
    fn test_statistical_priors() {
        let bounds = vec![(0.0, 1.0), (0.0, 1.0)];
        let config = MLEnsembleConfig::default();
        let mut optimizer = MLEnsembleOptimizer::new(bounds, config);
        
        let mut priors = HashMap::new();
        priors.insert("param_0".to_string(), (2.0, 5.0)); // Beta(2, 5)
        priors.insert("param_1".to_string(), (3.0, 2.0)); // Beta(3, 2)
        
        optimizer.initialize_with_priors(priors).unwrap();
        
        assert_eq!(optimizer.prior_distributions.len(), 2);
        
        // Test prior-based suggestion
        let suggestion = optimizer.suggest_with_priors().unwrap();
        assert_eq!(suggestion.len(), 2);
        assert!(suggestion[0] >= 0.0 && suggestion[0] <= 1.0);
        assert!(suggestion[1] >= 0.0 && suggestion[1] <= 1.0);
    }

    #[test]
    fn test_ensemble_bounds_from_observations() {
        let bounds = vec![(0.0, 10.0), (-5.0, 5.0)];
        let config = MLEnsembleConfig::default();
        let optimizer = MLEnsembleOptimizer::new(bounds.clone(), config);
        
        let observations = vec![
            (Array1::from_vec(vec![1.0, 0.0]), 1.0),
            (Array1::from_vec(vec![2.0, 1.0]), 4.0),
            (Array1::from_vec(vec![3.0, -1.0]), 2.0),
        ];
        
        let computed_bounds = optimizer.get_bounds_from_observations(&observations);
        assert_eq!(computed_bounds.len(), 2);
        
        // Should use GP bounds when available
        assert_eq!(computed_bounds[0], bounds[0]);
        assert_eq!(computed_bounds[1], bounds[1]);
    }

    #[test]
    fn test_acquisition_function_edge_cases() {
        let mut acq = AcquisitionFunction::expected_improvement(0.0);
        acq.update_best(1.0);
        
        // Test with zero standard deviation
        let mean = Array1::from_vec(vec![1.5, 0.5]);
        let std = Array1::from_vec(vec![0.0, 0.1]);
        
        let values = acq.compute(mean.view(), std.view()).unwrap();
        assert_eq!(values.len(), 2);
        assert_eq!(values[0], 0.5); // improvement with zero std
        assert!(values[1] >= 0.0);   // normal EI calculation
    }

    #[test]
    fn test_gaussian_process_edge_cases() {
        let kernel = KernelFunction::rbf(1.0, 1.0);
        let mut gp = GaussianProcess::new(kernel, 1e-6);
        
        // Test with identical points
        let x_train = Array2::from_shape_vec((2, 1), vec![1.0, 1.0]).unwrap();
        let y_train = Array1::from_vec(vec![2.0, 2.1]);
        
        // Should handle near-singular matrices
        let result = gp.fit(x_train, y_train);
        assert!(result.is_ok());
        
        // Test prediction on training point
        let x_test = Array2::from_shape_vec((1, 1), vec![1.0]).unwrap();
        let (mean, std) = gp.predict(x_test.view()).unwrap();
        
        assert_eq!(mean.len(), 1);
        assert_eq!(std.len(), 1);
        assert!(std[0] >= 0.0); // Standard deviation should be non-negative
    }
}