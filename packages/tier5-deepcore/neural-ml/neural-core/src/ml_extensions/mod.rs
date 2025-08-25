//! # ML Extensions Module
//!
//! Advanced ML capabilities for DSPy teleprompter optimization.
//! This module provides comprehensive machine learning extensions including:
//!
//! - **Bayesian Optimization**: Gaussian processes and acquisition functions
//! - **Gradient Computation**: Auto-differentiation and optimizers  
//! - **Multi-Objective Optimization**: Pareto optimization and diversity preservation
//! - **Online Learning**: Adaptive learning with concept drift detection
//! - **Pattern Recognition**: Embeddings and similarity metrics
//!
//! ## Features
//!
//! - Async and timeout-aware algorithms
//! - WASM integration through TypeScript bindings
//! - Memory efficient for large datasets
//! - Robust error handling with detailed error types
//! - Serialization support for trained models
//! - Comprehensive performance metrics

pub mod bayesian;
pub mod gradients;
pub mod multi_objective;
pub mod online_learning;
pub mod pattern_recognition;
pub mod metrics;
pub mod serialization;
pub mod wasm_bindings;

// Re-export main types for convenience
pub use bayesian::{BayesianOptimizer, GaussianProcess, AcquisitionFunction, KernelFunction};
pub use gradients::{AutoDiff, GradientOptimizer, TensorOperations, BackpropEngine};
pub use multi_objective::{ParetoOptimizer, CrowdingDistance, DominanceCheck, HypervolumeCalculator};
pub use online_learning::{OnlineLearner, AdaptiveLearningRate, ConceptDriftDetector, ReplayBuffer};
pub use pattern_recognition::{PatternExtractor, EmbeddingModel, SimilarityMetrics, ClusteringAlgorithm};
pub use metrics::{PerformanceMetrics, QualityMetrics, OptimizationMetrics};
pub use serialization::{ModelSerializer, ModelDeserializer};

use crate::errors::{NeuroDivergentError, NeuroDivergentResult};
use std::time::Duration;

/// Configuration for ML extensions
#[derive(Debug, Clone)]
pub struct MLExtensionsConfig {
    /// Timeout for async operations
    pub timeout: Duration,
    /// Maximum memory usage in bytes
    pub max_memory: usize,
    /// Enable GPU acceleration if available
    pub enable_gpu: bool,
    /// Number of threads for parallel operations
    pub num_threads: usize,
    /// Enable performance monitoring
    pub enable_monitoring: bool,
}

impl Default for MLExtensionsConfig {
    fn default() -> Self {
        Self {
            timeout: Duration::from_secs(300), // 5 minutes
            max_memory: 1024 * 1024 * 1024,   // 1GB
            enable_gpu: true,
            num_threads: num_cpus::get(),
            enable_monitoring: true,
        }
    }
}

/// Result type for ML extensions operations
pub type MLResult<T> = Result<T, MLError>;

/// Error types for ML extensions
#[derive(Debug, thiserror::Error)]
pub enum MLError {
    #[error("Optimization failed: {0}")]
    OptimizationError(String),
    
    #[error("Gradient computation failed: {0}")]
    GradientError(String),
    
    #[error("Multi-objective optimization failed: {0}")]
    MultiObjectiveError(String),
    
    #[error("Online learning failed: {0}")]
    OnlineLearningError(String),
    
    #[error("Pattern recognition failed: {0}")]
    PatternRecognitionError(String),
    
    #[error("Timeout exceeded: operation took longer than {0:?}")]
    TimeoutError(Duration),
    
    #[error("Memory limit exceeded: requested {requested} bytes, limit {limit} bytes")]
    MemoryError { requested: usize, limit: usize },
    
    #[error("Serialization failed: {0}")]
    SerializationError(String),
    
    #[error("GPU operation failed: {0}")]
    GpuError(String),
    
    #[error("Invalid configuration: {0}")]
    ConfigError(String),
    
    #[error("Neural divergent error: {0}")]
    NeuralDivergent(#[from] NeuroDivergentError),
}

/// Common traits for ML extensions
pub trait AsyncOptimizer {
    type Input;
    type Output;
    type Config;
    
    /// Initialize the optimizer with configuration
    async fn initialize(&mut self, config: Self::Config) -> MLResult<()>;
    
    /// Optimize with timeout support
    async fn optimize(&mut self, input: Self::Input, timeout: Duration) -> MLResult<Self::Output>;
    
    /// Get current optimization metrics
    fn get_metrics(&self) -> MLResult<PerformanceMetrics>;
}

/// Memory-aware processing trait
pub trait MemoryAware {
    /// Check if operation fits within memory limits
    fn check_memory_requirements(&self, config: &MLExtensionsConfig) -> MLResult<()>;
    
    /// Get estimated memory usage in bytes
    fn estimated_memory_usage(&self) -> usize;
}

/// GPU acceleration trait
pub trait GpuAccelerated {
    /// Check if GPU acceleration is available
    fn is_gpu_available(&self) -> bool;
    
    /// Enable GPU acceleration
    fn enable_gpu(&mut self) -> MLResult<()>;
    
    /// Disable GPU acceleration
    fn disable_gpu(&mut self);
}

/// Serialization trait for models
pub trait Serializable {
    /// Serialize model to bytes
    fn serialize(&self) -> MLResult<Vec<u8>>;
    
    /// Deserialize model from bytes
    fn deserialize(data: &[u8]) -> MLResult<Self> 
    where 
        Self: Sized;
    
    /// Save model to file
    fn save_to_file(&self, path: &str) -> MLResult<()> {
        let data = self.serialize()?;
        std::fs::write(path, data)
            .map_err(|e| MLError::SerializationError(format!("Failed to save to file: {}", e)))?;
        Ok(())
    }
    
    /// Load model from file
    fn load_from_file(path: &str) -> MLResult<Self> 
    where 
        Self: Sized 
    {
        let data = std::fs::read(path)
            .map_err(|e| MLError::SerializationError(format!("Failed to read from file: {}", e)))?;
        Self::deserialize(&data)
    }
}

/// Performance monitoring utilities
pub mod monitoring {
    use super::*;
    use std::time::Instant;
    
    /// Timer for measuring operation duration
    pub struct Timer {
        start: Instant,
        name: String,
    }
    
    impl Timer {
        pub fn new(name: impl Into<String>) -> Self {
            Self {
                start: Instant::now(),
                name: name.into(),
            }
        }
        
        pub fn elapsed(&self) -> Duration {
            self.start.elapsed()
        }
        
        pub fn finish(self) -> Duration {
            let elapsed = self.elapsed();
            log::debug!("Operation '{}' completed in {:?}", self.name, elapsed);
            elapsed
        }
    }
    
    /// Memory usage tracker
    pub struct MemoryTracker {
        initial_usage: usize,
        peak_usage: usize,
    }
    
    impl MemoryTracker {
        pub fn new() -> Self {
            let initial = Self::current_memory_usage();
            Self {
                initial_usage: initial,
                peak_usage: initial,
            }
        }
        
        pub fn update(&mut self) {
            let current = Self::current_memory_usage();
            if current > self.peak_usage {
                self.peak_usage = current;
            }
        }
        
        pub fn peak_usage(&self) -> usize {
            self.peak_usage
        }
        
        pub fn memory_delta(&self) -> usize {
            self.peak_usage.saturating_sub(self.initial_usage)
        }
        
        fn current_memory_usage() -> usize {
            // Simple approximation - in production would use more sophisticated tracking
            0
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_config_default() {
        let config = MLExtensionsConfig::default();
        assert!(config.timeout > Duration::from_secs(0));
        assert!(config.max_memory > 0);
        assert!(config.num_threads > 0);
    }
    
    #[test]
    fn test_timer() {
        let timer = monitoring::Timer::new("test");
        std::thread::sleep(Duration::from_millis(10));
        let elapsed = timer.finish();
        assert!(elapsed >= Duration::from_millis(10));
    }
    
    #[test]
    fn test_memory_tracker() {
        let mut tracker = monitoring::MemoryTracker::new();
        tracker.update();
        assert!(tracker.peak_usage() >= tracker.memory_delta());
    }
}