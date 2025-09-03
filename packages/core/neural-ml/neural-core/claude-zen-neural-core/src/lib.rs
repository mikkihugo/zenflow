//! # Neuro-Divergent Core
//!
//! High-performance neural forecasting library for Rust, built on the ruv-FANN foundation.
//! This crate provides the core abstractions, traits, and data structures needed for
//! advanced time series forecasting with neural networks.
//!
//! ## Features
//!
//! - **Type-safe Neural Networks**: Built on ruv-FANN with generic floating-point support
//! - **Time Series Data Structures**: Efficient handling of temporal data with exogenous variables
//! - **Memory-safe Operations**: Rust's ownership model ensures memory safety without garbage collection
//! - **Parallel Processing**: Built-in support for multi-threaded training and inference
//! - **Comprehensive Error Handling**: Detailed error types for robust error management
//! - **Flexible Configuration**: Builder patterns and configuration systems for easy setup
//!
//! ## Architecture
//!
//! The library is organized into several key modules:
//!
//! - [`traits`]: Core traits that define the forecasting model interface
//! - [`data`]: Time series data structures and preprocessing utilities
//! - [`error`]: Comprehensive error handling types
//! - [`integration`]: Integration layer with ruv-FANN neural networks
//! - [`config`]: Configuration management and builder patterns
//!
//! ## Quick Start
//!
//! ```rust
//! use neuro_divergent_core::prelude::*;
//! use chrono::{DateTime, Utc};
//!
//! // Create a time series dataset
//! let mut dataset = TimeSeriesDatasetBuilder::new()
//!     .with_target_column("value")
//!     .with_time_column("timestamp")
//!     .with_unique_id_column("series_id")
//!     .build()?;
//!
//! // Configure a forecasting model
//! let config = ModelConfigBuilder::new()
//!     .with_horizon(12)
//!     .with_input_size(24)
//!     .build()?;
//!
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```
//!
//! ## Integration with ruv-FANN
//!
//! This library extends ruv-FANN's neural network capabilities with time series-specific
//! functionality:
//!
//! ```rust
//! use neuro_divergent_core::integration::NetworkAdapter;
//! use ruv_fann::Network;
//!
//! // Create a ruv-FANN network
//! let network = Network::new(&[24, 64, 32, 12])?;
//!
//! // Wrap it with our adapter for time series forecasting
//! let adapter = NetworkAdapter::from_network(network)
//!     .with_input_preprocessor(/* ... */)
//!     .with_output_postprocessor(/* ... */);
//!
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```

#![deny(missing_docs)]
#![deny(unsafe_code)]
#![warn(clippy::all, clippy::pedantic, clippy::nursery)]

// Re-export essential types from dependencies
pub use chrono::{DateTime, Utc};
pub use ndarray::{Array1, Array2, ArrayView1, ArrayView2};
pub use num_traits::Float;
pub use polars::prelude::*;
pub use serde::{Deserialize, Serialize};

// Core module declarations
pub mod config;
pub mod data;
pub mod error;
pub mod integration;
pub mod traits;

/// DSPy acceleration module for high-performance DSPy operations
pub mod dspy_acceleration;

// Re-export claude-zen neural feedforward types for convenience
pub use claude_zen_neural_feedforward::{
  ActivationFunction, Network, NetworkBuilder, TrainingAlgorithmTrait as TrainingAlgorithm, TrainingData,
};

// Public API re-exports - specific exports to avoid ambiguity
pub use crate::{
  config::{
    ConfigManager, ConfigMetadata, DataFormat, DebugConfig, FeatureFlags,
    GenericModelConfig, IoConfig, LoggingConfig, MemoryConfig,
    ModelConfigBuilder, ParallelConfig, PerformanceConfig, SystemConfig,
    ThreadPoolConfig, ValidationError as ConfigValidationError,
    ValidationResult as ConfigValidationResult,
    ValidationWarning as ConfigValidationWarning,
  },
  data::{
    DatasetMetadata, MissingValueStats, PreprocessingConfig,
    RollingStatistic as DataRollingStatistic, ScalingConfig,
    ScalingMethod as DataScalingMethod, SeriesData, TimeSeriesDataFrame,
    TimeSeriesDataset, TimeSeriesSchema,
    ValidationError as DataValidationError,
    ValidationReport as DataValidationReport,
    ValidationWarning as DataValidationWarning,
  },
  error::*,
  integration::{
    ActivationMapper, NetworkAdapter,
    RollingStatistic as IntegrationRollingStatistic,
    ScalingMethod as IntegrationScalingMethod,
  },
  traits::*,
};

/// Commonly used types and traits for convenient importing
pub mod prelude {
  pub use crate::{
    config::ModelConfigBuilder,
    data::{
      TimeSeriesDataFrame, TimeSeriesDataset, TimeSeriesDatasetBuilder,
      TimeSeriesSchema,
    },
    error::{NeuroDivergentError, NeuroDivergentResult},
    integration::{NetworkAdapter, TrainingBridge},
    traits::ModelConfig,
    traits::{BaseModel, ForecastingEngine, ModelState},
  };

  // Essential external types
  pub use chrono::{DateTime, Utc};
  pub use num_traits::Float;
  pub use polars::prelude::*;
  pub use serde::{Deserialize, Serialize};
}

/// Library version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Library name
pub const NAME: &str = env!("CARGO_PKG_NAME");

/// Library description
pub const DESCRIPTION: &str = env!("CARGO_PKG_DESCRIPTION");

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_version_info() {
    // Verify that version info is accessible and non-empty
    assert_eq!(VERSION, env!("CARGO_PKG_VERSION"));
    assert_eq!(NAME, env!("CARGO_PKG_NAME"));
    assert_eq!(DESCRIPTION, env!("CARGO_PKG_DESCRIPTION"));
  }

  #[test]
  fn test_prelude_imports() {
    // Ensure all prelude imports are accessible
    use crate::prelude::*;

    // Test that we can reference the main types
    let _: Option<TimeSeriesSchema> = None;
    let _: Option<NeuroDivergentError> = None;
    let _: Option<ModelConfigBuilder<f64>> = None;
  }
}
