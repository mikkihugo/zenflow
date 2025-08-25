//! # Claude-Zen Neural ML: Machine-Adaptive High-Performance Neural Library
//!
//! Claude-Zen Neural ML provides comprehensive machine learning capabilities with
//! automatic optimization for any hardware configuration. The library automatically
//! detects and optimizes for Apple Silicon, NVIDIA CUDA, Intel/AMD, ARM, and more.
//!
//! ## Features
//!
//! - **Machine-Adaptive Optimization**: Auto-detects optimal backend (Metal, CUDA, AVX-512, NEON)
//! - **Universal Performance**: Optimized for Apple Silicon, NVIDIA, Intel, AMD, ARM
//! - **SIMD Acceleration**: faer, wide, ultraviolet for vectorized operations
//! - **GPU Acceleration**: Metal, CUDA, OpenCL support with automatic fallback
//! - **27+ Neural Models**: LSTM, N-BEATS, DeepAR, Transformers, classification, regression
//! - **Memory Safety**: Zero-cost abstractions with compile-time guarantees
//! - **Async Support**: Asynchronous training and prediction
//! - **Performance Monitoring**: Adaptive optimization with runtime benchmarking
//!
//! ## Quick Start
//!
//! ```rust
//! use neuro_divergent::{NeuralForecast, models::LSTM, data::TimeSeriesDataFrame, Frequency};
//!
//! # fn main() -> Result<(), Box<dyn std::error::Error>> {
//! // Create LSTM model
//! let lstm = LSTM::builder()
//!     .hidden_size(128)
//!     .num_layers(2)
//!     .dropout(0.1)
//!     .horizon(12)
//!     .input_size(24)
//!     .build()?;
//!
//! // Create NeuralForecast instance
//! let mut nf = NeuralForecast::builder()
//!     .with_model(Box::new(lstm))
//!     .with_frequency(Frequency::Monthly)
//!     .build()?;
//!
//! // Load your time series data
//! let data = TimeSeriesDataFrame::from_csv("data.csv")?;
//!
//! // Fit the model
//! nf.fit(data.clone())?;
//!
//! // Generate forecasts
//! let forecasts = nf.predict()?;
//! # Ok(())
//! # }
//! ```
//!
//! ## Architecture
//!
//! The library is structured in several layers:
//!
//! - **API Layer**: User-facing interface with NeuralForecast compatibility
//! - **Model Layer**: Neural network model implementations
//! - **Core Layer**: Base traits and abstractions
//! - **Data Layer**: Time series data handling and preprocessing
//! - **Foundation Layer**: Integration with ruv-FANN neural networks

#![cfg_attr(docsrs, feature(doc_cfg))]
#![allow(missing_docs)] // Temporarily disabled for development
#![warn(rust_2018_idioms)]
#![allow(clippy::new_without_default)]

// Re-export essential types at the crate root
pub use config::{Frequency, PredictionIntervals, ScalerType};
pub use errors::{NeuroDivergentError, NeuroDivergentResult};
pub use neural_forecast::{NeuralForecast, NeuralForecastBuilder};
pub use results::{
  CrossValidationDataFrame, ForecastDataFrame, TimeSeriesDataFrame,
};

// Core modules
pub mod builders;
pub mod config;
pub mod errors;
pub mod neural_forecast;
pub mod results;
pub mod utils;
pub mod optimization;
pub mod error;
pub mod runtime_detection;

// Export runtime detection for Node.js/browser usage
pub use runtime_detection::{
    get_runtime_hardware, 
    get_optimal_features, 
    RuntimeHardware, 
    Platform, 
    Architecture, 
    OptimizationLevel
};

// Core abstractions
// Re-export from external crates (commented out - standalone package)
// #[cfg(feature = "models")]
// pub use neuro_divergent_models as models;

// #[cfg(feature = "registry")]
// pub use neuro_divergent_registry as registry;

// pub use neuro_divergent_core as core;

// Data and training crates - enabled with local path dependencies (commented out - standalone package)
// #[cfg(feature = "data")]
// pub use neuro_divergent_data as data;

// #[cfg(feature = "training")]
// pub use neuro_divergent_training as training;

// Prelude for common imports
pub mod prelude {
  //! Common imports for everyday use

  pub use crate::{
    CrossValidationDataFrame, ForecastDataFrame, Frequency, NeuralForecast,
    NeuralForecastBuilder, NeuroDivergentError, NeuroDivergentResult,
    PredictionIntervals, ScalerType, TimeSeriesDataFrame,
  };

  // TODO: Re-enable when all crates are published
  // pub use crate::core::{BaseModel, ModelConfig};
  // pub use crate::models::{LSTM, NBEATS, DeepAR, RNN, Transformer};
  // pub use crate::data::{TimeSeriesDataset, TimeSeriesSchema};
  // pub use crate::training::{TrainingConfig, AccuracyMetrics};
}

// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const PACKAGE_NAME: &str = env!("CARGO_PKG_NAME");
pub const DESCRIPTION: &str = env!("CARGO_PKG_DESCRIPTION");

pub mod info {
  //! Library metadata and version information

  /// Get the library version
  pub fn version() -> &'static str {
    super::VERSION
  }

  /// Get the package name
  pub fn name() -> &'static str {
    super::PACKAGE_NAME
  }

  /// Get the library description
  pub fn description() -> &'static str {
    super::DESCRIPTION
  }

  /// Check if GPU support is available
  #[cfg(feature = "gpu")]
  pub fn has_gpu_support() -> bool {
    true
  }

  #[cfg(not(feature = "gpu"))]
  pub fn has_gpu_support() -> bool {
    false
  }

  /// Check if async support is available
  #[cfg(feature = "async")]
  pub fn has_async_support() -> bool {
    true
  }

  #[cfg(not(feature = "async"))]
  pub fn has_async_support() -> bool {
    false
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_version_info() {
    assert!(!info::version().is_empty());
    assert!(!info::name().is_empty());
    assert!(!info::description().is_empty());
  }

  #[test]
  fn test_feature_detection() {
    // These should not panic
    let _ = info::has_gpu_support();
    let _ = info::has_async_support();
  }
}
