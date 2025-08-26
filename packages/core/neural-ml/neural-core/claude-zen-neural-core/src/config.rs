//! Configuration management and builder patterns for neuro-divergent.
//!
//! This module provides comprehensive configuration management for all aspects
//! of neural forecasting, including model configurations, training parameters,
//! and system settings.

use std::collections::HashMap;
use std::fmt;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Utc};
use num_traits::Float;
use serde::{Deserialize, Serialize};

use crate::{
  config_error,
  error::{ErrorBuilder, NeuroDivergentResult},
  traits::{ConfigBuilder, ConfigParameter, ExogenousConfig, ModelConfig},
};

/// Generic model configuration implementation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenericModelConfig<T: Float + Send + Sync + 'static> {
  /// Model type identifier
  pub model_type: String,
  /// Forecast horizon
  pub horizon: usize,
  /// Input window size
  pub input_size: usize,
  /// Output size (usually equals horizon)
  pub output_size: usize,
  /// Exogenous variable configuration
  pub exogenous_config: ExogenousConfig,
  /// Model-specific parameters
  pub parameters: HashMap<String, ConfigParameter<T>>,
  /// Configuration metadata
  pub metadata: ConfigMetadata,
}

/// Configuration metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigMetadata {
  /// Configuration name
  pub name: Option<String>,
  /// Configuration description
  pub description: Option<String>,
  /// Configuration version
  pub version: String,
  /// Creation timestamp
  pub created_at: DateTime<Utc>,
  /// Last modified timestamp
  pub modified_at: DateTime<Utc>,
  /// Configuration author/creator
  pub author: Option<String>,
  /// Configuration tags
  pub tags: Vec<String>,
  /// Custom metadata fields
  pub custom_fields: HashMap<String, String>,
}

/// Builder for generic model configurations
pub struct ModelConfigBuilder<T: Float + Send + Sync + 'static> {
  model_type: Option<String>,
  horizon: Option<usize>,
  input_size: Option<usize>,
  output_size: Option<usize>,
  exogenous_config: ExogenousConfig,
  parameters: HashMap<String, ConfigParameter<T>>,
  metadata: ConfigMetadata,
}

/// System-wide configuration for neuro-divergent
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SystemConfig {
  /// Logging configuration
  pub logging: LoggingConfig,
  /// Performance settings
  pub performance: PerformanceConfig,
  /// Memory management settings
  pub memory: MemoryConfig,
  /// Parallel processing configuration
  pub parallel: ParallelConfig,
  /// I/O configuration
  pub io: IoConfig,
  /// Development and debugging settings
  pub debug: DebugConfig,
  /// Feature flags
  pub features: FeatureFlags,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
  /// Log level (trace, debug, info, warn, error)
  pub level: String,
  /// Log output format
  pub format: LogFormat,
  /// Log file path (None for stdout)
  pub file_path: Option<PathBuf>,
  /// Maximum log file size in MB
  pub max_file_size_mb: Option<usize>,
  /// Number of log files to retain
  pub max_files: Option<usize>,
  /// Enable structured logging
  pub structured: bool,
  /// Log timestamps
  pub timestamps: bool,
}

/// Log output formats
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LogFormat {
  /// Human-readable text format
  Text,
  /// JSON format
  Json,
  /// Compact format
  Compact,
  /// Pretty formatted
  Pretty,
}

/// Performance feature options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PerformanceFeature {
  /// SIMD optimizations
  Simd,
  /// GPU acceleration  
  Gpu,
  /// Automatic mixed precision
  Amp,
  /// Performance profiling
  Profiling,
}

/// Performance feature configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceFeatures {
  /// Enabled performance features
  pub enabled_features: Vec<PerformanceFeature>,
}

impl PerformanceFeatures {
  /// Check if a feature is enabled
  #[must_use]
  pub fn is_enabled(&self, feature: &PerformanceFeature) -> bool {
    self.enabled_features.contains(feature)
  }

  /// Enable a feature
  pub fn enable(&mut self, feature: PerformanceFeature) {
    if !self.enabled_features.contains(&feature) {
      self.enabled_features.push(feature);
    }
  }

  /// Disable a feature
  pub fn disable(&mut self, feature: &PerformanceFeature) {
    self.enabled_features.retain(|f| f != feature);
  }

  /// Legacy accessor for simd
  #[must_use]
  pub fn simd(&self) -> bool {
    self.is_enabled(&PerformanceFeature::Simd)
  }

  /// Legacy accessor for gpu
  #[must_use]
  pub fn gpu(&self) -> bool {
    self.is_enabled(&PerformanceFeature::Gpu)
  }
}

impl Default for PerformanceFeatures {
  fn default() -> Self {
    Self {
      enabled_features: vec![PerformanceFeature::Simd],
    }
  }
}

impl PartialEq for PerformanceFeature {
  fn eq(&self, other: &Self) -> bool {
    std::mem::discriminant(self) == std::mem::discriminant(other)
  }
}

/// Performance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
  /// Performance features to enable
  pub features: PerformanceFeatures,
  /// Preferred GPU device ID
  pub gpu_device_id: Option<usize>,
  /// CPU optimization level
  pub cpu_optimization: CpuOptimization,
  /// Performance profiling output directory
  pub profiling_output_dir: Option<PathBuf>,
}

/// CPU optimization levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CpuOptimization {
  /// No specific optimization
  None,
  /// Optimize for current CPU
  Native,
  /// Optimize for specific CPU features
  Features(Vec<String>),
  /// Conservative optimizations for compatibility
  Conservative,
}

/// Memory configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
  /// Memory pool size in MB
  pub pool_size_mb: Option<usize>,
  /// Enable memory pool
  pub enable_pool: bool,
  /// Memory allocation strategy
  pub allocation_strategy: AllocationStrategy,
  /// Memory usage monitoring
  pub enable_monitoring: bool,
  /// Memory usage warning threshold (percentage)
  pub warning_threshold: Option<f64>,
  /// Garbage collection hints
  pub gc_hints: bool,
}

/// Memory allocation strategies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AllocationStrategy {
  /// Default system allocator
  System,
  /// Pool-based allocation
  Pool,
  /// Arena-based allocation
  Arena,
  /// Custom allocation strategy
  Custom(String),
}

/// Parallel processing feature types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ParallelFeature {
  /// Enable parallel training
  Training,
  /// Enable parallel prediction
  Prediction,
  /// Enable data parallelism
  Data,
  /// Enable model parallelism
  Model,
}

/// Parallel processing features configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelFeatures {
  /// Enabled parallel features
  pub enabled_features: Vec<ParallelFeature>,
}

impl ParallelFeatures {
  /// Check if a feature is enabled
  #[must_use]
  pub fn is_enabled(&self, feature: &ParallelFeature) -> bool {
    self.enabled_features.contains(feature)
  }

  /// Enable a feature
  pub fn enable(&mut self, feature: ParallelFeature) {
    if !self.enabled_features.contains(&feature) {
      self.enabled_features.push(feature);
    }
  }

  /// Disable a feature
  pub fn disable(&mut self, feature: &ParallelFeature) {
    self.enabled_features.retain(|f| f != feature);
  }

  /// Legacy accessor for training
  #[must_use]
  pub fn training(&self) -> bool {
    self.is_enabled(&ParallelFeature::Training)
  }

  /// Legacy accessor for prediction
  #[must_use]
  pub fn prediction(&self) -> bool {
    self.is_enabled(&ParallelFeature::Prediction)
  }

  /// Legacy accessor for data
  #[must_use]
  pub fn data(&self) -> bool {
    self.is_enabled(&ParallelFeature::Data)
  }

  /// Legacy accessor for model
  #[must_use]
  pub fn model(&self) -> bool {
    self.is_enabled(&ParallelFeature::Model)
  }
}

impl Default for ParallelFeatures {
  fn default() -> Self {
    Self {
      enabled_features: vec![
        ParallelFeature::Training,
        ParallelFeature::Prediction,
        ParallelFeature::Data,
      ],
    }
  }
}

/// Parallel processing configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[derive(Default)]
pub struct ParallelConfig {
  /// Number of threads (None for automatic)
  pub num_threads: Option<usize>,
  /// Thread pool configuration
  pub thread_pool: ThreadPoolConfig,
  /// Parallel processing features
  pub features: ParallelFeatures,
}

/// Thread pool configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThreadPoolConfig {
  /// Thread pool type
  pub pool_type: ThreadPoolType,
  /// Stack size per thread in KB
  pub stack_size_kb: Option<usize>,
  /// Thread naming prefix
  pub thread_name_prefix: Option<String>,
  /// Thread priority
  pub thread_priority: Option<ThreadPriority>,
}

/// Thread pool types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThreadPoolType {
  /// Global thread pool
  Global,
  /// Custom thread pool
  Custom,
  /// Work-stealing thread pool
  WorkStealing,
}

/// Thread priority levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThreadPriority {
  /// Low priority
  Low,
  /// Normal priority
  Normal,
  /// High priority
  High,
}

/// I/O configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IoConfig {
  /// Default data format for saving
  pub default_format: DataFormat,
  /// Enable compression
  pub enable_compression: bool,
  /// Compression level (1-9)
  pub compression_level: Option<u8>,
  /// I/O buffer size in KB
  pub buffer_size_kb: usize,
  /// Enable async I/O
  pub enable_async_io: bool,
  /// Network timeout in seconds
  pub network_timeout_secs: Option<u64>,
  /// Retry configuration for I/O operations
  pub retry_config: RetryConfig,
}

/// Data formats
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataFormat {
  /// JSON format
  Json,
  /// BSON format
  Bson,
  /// `MessagePack` format
  MessagePack,
  /// Binary format
  Binary,
  /// Parquet format
  Parquet,
  /// CSV format
  Csv,
}

/// Retry configuration for I/O operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryConfig {
  /// Maximum number of retries
  pub max_retries: usize,
  /// Initial delay between retries in milliseconds
  pub initial_delay_ms: u64,
  /// Maximum delay between retries in milliseconds
  pub max_delay_ms: u64,
  /// Exponential backoff multiplier
  pub backoff_multiplier: f64,
  /// Enable jitter
  pub enable_jitter: bool,
}

/// Debug feature types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum DebugFeature {
  /// Save intermediate results
  Intermediates,
  /// Enable detailed timing
  Timing,
  /// Enable memory tracking
  Memory,
  /// Enable network visualization
  Visualization,
}

/// Debug features configuration
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DebugFeatures {
  /// Enabled debug features
  pub enabled_features: Vec<DebugFeature>,
}

impl DebugFeatures {
  /// Check if a feature is enabled
  #[must_use]
  pub fn is_enabled(&self, feature: &DebugFeature) -> bool {
    self.enabled_features.contains(feature)
  }

  /// Enable a feature
  pub fn enable(&mut self, feature: DebugFeature) {
    if !self.enabled_features.contains(&feature) {
      self.enabled_features.push(feature);
    }
  }

  /// Disable a feature
  pub fn disable(&mut self, feature: &DebugFeature) {
    self.enabled_features.retain(|f| f != feature);
  }

  /// Legacy accessor for intermediates
  #[must_use]
  pub fn intermediates(&self) -> bool {
    self.is_enabled(&DebugFeature::Intermediates)
  }

  /// Legacy accessor for timing
  #[must_use]
  pub fn timing(&self) -> bool {
    self.is_enabled(&DebugFeature::Timing)
  }

  /// Legacy accessor for memory
  #[must_use]
  pub fn memory(&self) -> bool {
    self.is_enabled(&DebugFeature::Memory)
  }

  /// Legacy accessor for visualization
  #[must_use]
  pub fn visualization(&self) -> bool {
    self.is_enabled(&DebugFeature::Visualization)
  }
}



/// Debug configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugConfig {
  /// Enable debug mode
  pub enabled: bool,
  /// Debug output directory
  pub output_dir: Option<PathBuf>,
  /// Debug features to enable
  pub features: DebugFeatures,
  /// Debug verbosity level
  pub verbosity: DebugVerbosity,
}

/// Debug verbosity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DebugVerbosity {
  /// Minimal debug output
  Minimal,
  /// Normal debug output
  Normal,
  /// Verbose debug output
  Verbose,
  /// Very verbose debug output
  VeryVerbose,
}

/// Experimental feature types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ExperimentalFeature {
  /// Enable experimental GPU kernels
  GpuKernels,
  /// Enable experimental optimizations
  Optimizations,
  /// Enable experimental model architectures
  Models,
  /// Enable experimental data formats
  DataFormats,
}

/// Experimental features configuration
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ExperimentalFeatures {
  /// Enabled experimental features
  pub enabled_features: Vec<ExperimentalFeature>,
}

impl ExperimentalFeatures {
  /// Check if a feature is enabled
  #[must_use]
  pub fn is_enabled(&self, feature: &ExperimentalFeature) -> bool {
    self.enabled_features.contains(feature)
  }

  /// Enable a feature
  pub fn enable(&mut self, feature: ExperimentalFeature) {
    if !self.enabled_features.contains(&feature) {
      self.enabled_features.push(feature);
    }
  }

  /// Disable a feature
  pub fn disable(&mut self, feature: &ExperimentalFeature) {
    self.enabled_features.retain(|f| f != feature);
  }

  /// Legacy accessor for `gpu_kernels`
  #[must_use]
  pub fn gpu_kernels(&self) -> bool {
    self.is_enabled(&ExperimentalFeature::GpuKernels)
  }

  /// Legacy accessor for optimizations
  #[must_use]
  pub fn optimizations(&self) -> bool {
    self.is_enabled(&ExperimentalFeature::Optimizations)
  }

  /// Legacy accessor for models
  #[must_use]
  pub fn models(&self) -> bool {
    self.is_enabled(&ExperimentalFeature::Models)
  }

  /// Legacy accessor for `data_formats`
  #[must_use]
  pub fn data_formats(&self) -> bool {
    self.is_enabled(&ExperimentalFeature::DataFormats)
  }
}



/// Automatic feature types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AutoFeature {
  /// Enable automatic hyperparameter tuning
  HyperparameterTuning,
  /// Enable automatic model selection
  ModelSelection,
  /// Enable distributed training
  DistributedTraining,
}

/// Automatic features configuration
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AutoFeatures {
  /// Enabled automatic features
  pub enabled_features: Vec<AutoFeature>,
}

impl AutoFeatures {
  /// Check if a feature is enabled
  #[must_use]
  pub fn is_enabled(&self, feature: &AutoFeature) -> bool {
    self.enabled_features.contains(feature)
  }

  /// Enable a feature
  pub fn enable(&mut self, feature: AutoFeature) {
    if !self.enabled_features.contains(&feature) {
      self.enabled_features.push(feature);
    }
  }

  /// Disable a feature
  pub fn disable(&mut self, feature: &AutoFeature) {
    self.enabled_features.retain(|f| f != feature);
  }

  /// Legacy accessor for `hyperparameter_tuning`
  #[must_use]
  pub fn hyperparameter_tuning(&self) -> bool {
    self.is_enabled(&AutoFeature::HyperparameterTuning)
  }

  /// Legacy accessor for `model_selection`
  #[must_use]
  pub fn model_selection(&self) -> bool {
    self.is_enabled(&AutoFeature::ModelSelection)
  }

  /// Legacy accessor for `distributed_training`
  #[must_use]
  pub fn distributed_training(&self) -> bool {
    self.is_enabled(&AutoFeature::DistributedTraining)
  }
}



/// Feature flags for experimental features
#[derive(Debug, Clone, Serialize, Deserialize)]
#[derive(Default)]
pub struct FeatureFlags {
  /// Experimental features
  pub experimental: ExperimentalFeatures,
  /// Automatic features
  pub auto: AutoFeatures,
}


/// Configuration validation result
#[derive(Debug, Clone)]
pub struct ValidationResult {
  /// Validation status
  pub is_valid: bool,
  /// Validation errors
  pub errors: Vec<ValidationError>,
  /// Validation warnings
  pub warnings: Vec<ValidationWarning>,
}

/// Configuration validation error
#[derive(Debug, Clone)]
pub struct ValidationError {
  /// Error field path
  pub field: String,
  /// Error message
  pub message: String,
  /// Error code
  pub code: Option<String>,
}

/// Configuration validation warning
#[derive(Debug, Clone)]
pub struct ValidationWarning {
  /// Warning field path
  pub field: String,
  /// Warning message
  pub message: String,
  /// Warning code
  pub code: Option<String>,
}

/// Configuration file manager
pub struct ConfigManager {
  /// Default configuration search paths
  search_paths: Vec<PathBuf>,
  /// Current configuration
  current_config: Option<SystemConfig>,
  /// Configuration file format
  #[allow(dead_code)]
  file_format: DataFormat,
}

impl<T: Float + Send + Sync + 'static> GenericModelConfig<T> {
  /// Create a new generic model configuration
  pub fn new(model_type: impl Into<String>) -> Self {
    Self {
      model_type: model_type.into(),
      horizon: 1,
      input_size: 1,
      output_size: 1,
      exogenous_config: ExogenousConfig::default(),
      parameters: HashMap::new(),
      metadata: ConfigMetadata::new(),
    }
  }

  /// Add a parameter to the configuration
  #[must_use]
  pub fn with_parameter(
    mut self,
    key: impl Into<String>,
    value: ConfigParameter<T>,
  ) -> Self {
    self.parameters.insert(key.into(), value);
    self
  }

  /// Set multiple parameters
  #[must_use]
  pub fn with_parameters(
    mut self,
    params: HashMap<String, ConfigParameter<T>>,
  ) -> Self {
    self.parameters.extend(params);
    self
  }

  /// Set configuration metadata
  #[must_use]
  pub fn with_metadata(mut self, metadata: ConfigMetadata) -> Self {
    self.metadata = metadata;
    self
  }

  /// Get a parameter value
  #[must_use]
  pub fn get_parameter(&self, key: &str) -> Option<&ConfigParameter<T>> {
    self.parameters.get(key)
  }

  /// Get a parameter as a specific type
  #[must_use]
  pub fn get_float_parameter(&self, key: &str) -> Option<T> {
    match self.parameters.get(key) {
      Some(ConfigParameter::Float(val)) => Some(*val),
      _ => None,
    }
  }

  /// Get an integer parameter
  #[must_use]
  pub fn get_integer_parameter(&self, key: &str) -> Option<i64> {
    match self.parameters.get(key) {
      Some(ConfigParameter::Integer(val)) => Some(*val),
      _ => None,
    }
  }

  /// Get a string parameter
  #[must_use]
  pub fn get_string_parameter(&self, key: &str) -> Option<&String> {
    match self.parameters.get(key) {
      Some(ConfigParameter::String(val)) => Some(val),
      _ => None,
    }
  }

  /// Get a boolean parameter
  #[must_use]
  pub fn get_boolean_parameter(&self, key: &str) -> Option<bool> {
    match self.parameters.get(key) {
      Some(ConfigParameter::Boolean(val)) => Some(*val),
      _ => None,
    }
  }

  /// Save configuration to file
  /// TODO: Implement serialization for generic configurations
  ///
  /// # Errors
  ///
  /// This function is not yet implemented and will return an error.
  #[allow(dead_code)]
  pub fn save<P: AsRef<Path>>(&self, _path: P) -> NeuroDivergentResult<()> {
    todo!("Configuration serialization needs to be implemented without generic type constraints")
  }

  /// Load configuration from file
  /// TODO: Implement deserialization for generic configurations  
  ///
  /// # Errors
  ///
  /// This function is not yet implemented and will return an error.
  #[allow(dead_code)]
  pub fn load<P: AsRef<Path>>(_path: P) -> NeuroDivergentResult<Self> {
    todo!("Configuration deserialization needs to be implemented without generic type constraints")
  }

  /// Merge with another configuration
  #[must_use]
  pub fn merge(mut self, other: Self) -> Self {
    // Merge parameters, with other taking precedence
    self.parameters.extend(other.parameters);

    // Update other fields if they're set in other
    if other.horizon != 1 {
      self.horizon = other.horizon;
    }
    if other.input_size != 1 {
      self.input_size = other.input_size;
    }
    if other.output_size != 1 {
      self.output_size = other.output_size;
    }

    // Merge exogenous config
    if !other.exogenous_config.static_features.is_empty() {
      self.exogenous_config.static_features =
        other.exogenous_config.static_features;
    }
    if !other.exogenous_config.historical_features.is_empty() {
      self.exogenous_config.historical_features =
        other.exogenous_config.historical_features;
    }
    if !other.exogenous_config.future_features.is_empty() {
      self.exogenous_config.future_features =
        other.exogenous_config.future_features;
    }

    self.metadata.modified_at = Utc::now();
    self
  }
}

impl<T: Float + Send + Sync + 'static> ModelConfig<T>
  for GenericModelConfig<T>
{
  fn validate(&self) -> NeuroDivergentResult<()> {
    if self.horizon == 0 {
      return Err(config_error!("Horizon must be greater than 0"));
    }

    if self.input_size == 0 {
      return Err(config_error!("Input size must be greater than 0"));
    }

    if self.output_size == 0 {
      return Err(config_error!("Output size must be greater than 0"));
    }

    if self.model_type.is_empty() {
      return Err(config_error!("Model type cannot be empty"));
    }

    Ok(())
  }

  fn horizon(&self) -> usize {
    self.horizon
  }

  fn input_size(&self) -> usize {
    self.input_size
  }

  fn output_size(&self) -> usize {
    self.output_size
  }

  fn exogenous_config(&self) -> &ExogenousConfig {
    &self.exogenous_config
  }

  fn model_type(&self) -> &str {
    &self.model_type
  }

  fn to_parameters(&self) -> HashMap<String, ConfigParameter<T>> {
    let mut params = self.parameters.clone();

    // Add basic parameters
    #[allow(clippy::cast_possible_wrap)]
    {
      params.insert(
        "horizon".to_string(),
        ConfigParameter::Integer(self.horizon as i64),
      );
      params.insert(
        "input_size".to_string(),
        ConfigParameter::Integer(self.input_size as i64),
      );
      params.insert(
        "output_size".to_string(),
        ConfigParameter::Integer(self.output_size as i64),
      );
    }
    params.insert(
      "model_type".to_string(),
      ConfigParameter::String(self.model_type.clone()),
    );

    params
  }

  fn from_parameters(
    params: HashMap<String, ConfigParameter<T>>,
  ) -> NeuroDivergentResult<Self> {
    let model_type = params
      .get("model_type")
      .and_then(|p| match p {
        ConfigParameter::String(s) => Some(s.clone()),
        _ => None,
      })
      .ok_or_else(|| config_error!("Missing required parameter: model_type"))?;

    let horizon = params
      .get("horizon")
      .and_then(|p| match p {
        #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
        ConfigParameter::Integer(i) => Some(*i as usize),
        _ => None,
      })
      .unwrap_or(1);

    let input_size = params
      .get("input_size")
      .and_then(|p| match p {
        #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
        ConfigParameter::Integer(i) => Some(*i as usize),
        _ => None,
      })
      .unwrap_or(1);

    let output_size = params
      .get("output_size")
      .and_then(|p| match p {
        #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
        ConfigParameter::Integer(i) => Some(*i as usize),
        _ => None,
      })
      .unwrap_or(1);

    let mut config = Self::new(model_type);
    config.horizon = horizon;
    config.input_size = input_size;
    config.output_size = output_size;

    // Filter out basic parameters and keep the rest
    let mut remaining_params = params;
    remaining_params.remove("model_type");
    remaining_params.remove("horizon");
    remaining_params.remove("input_size");
    remaining_params.remove("output_size");

    config.parameters = remaining_params;
    Ok(config)
  }

  fn builder() -> impl ConfigBuilder<Self, T> {
    ModelConfigBuilder::new()
  }
}

impl<T: Float + Send + Sync + 'static> ModelConfigBuilder<T> {
  /// Create a new builder
  #[must_use]
  pub fn new() -> Self {
    Self {
      model_type: None,
      horizon: None,
      input_size: None,
      output_size: None,
      exogenous_config: ExogenousConfig::default(),
      parameters: HashMap::new(),
      metadata: ConfigMetadata::new(),
    }
  }

  /// Set the model type
  #[must_use]
  pub fn with_model_type(mut self, model_type: impl Into<String>) -> Self {
    self.model_type = Some(model_type.into());
    self
  }

  /// Add a parameter
  #[must_use]
  pub fn with_parameter(
    mut self,
    key: impl Into<String>,
    value: ConfigParameter<T>,
  ) -> Self {
    self.parameters.insert(key.into(), value);
    self
  }

  /// Set metadata
  #[must_use]
  pub fn with_metadata(mut self, metadata: ConfigMetadata) -> Self {
    self.metadata = metadata;
    self
  }
}

impl<T: Float + Send + Sync + 'static> ConfigBuilder<GenericModelConfig<T>, T>
  for ModelConfigBuilder<T>
{
  fn build(self) -> NeuroDivergentResult<GenericModelConfig<T>> {
    let model_type = self
      .model_type
      .ok_or_else(|| config_error!("Model type is required"))?;

    let horizon = self.horizon.unwrap_or(1);
    let input_size = self.input_size.unwrap_or(1);
    let output_size = self.output_size.unwrap_or(horizon);

    let mut config = GenericModelConfig::new(model_type);
    config.horizon = horizon;
    config.input_size = input_size;
    config.output_size = output_size;
    config.exogenous_config = self.exogenous_config;
    config.parameters = self.parameters;
    config.metadata = self.metadata;

    config.validate()?;
    Ok(config)
  }

  fn with_horizon(mut self, horizon: usize) -> Self {
    self.horizon = Some(horizon);
    self
  }

  fn with_input_size(mut self, input_size: usize) -> Self {
    self.input_size = Some(input_size);
    self
  }

  fn with_exogenous_config(mut self, config: ExogenousConfig) -> Self {
    self.exogenous_config = config;
    self
  }
}

impl ConfigMetadata {
  /// Create new metadata with current timestamp
  #[must_use]
  pub fn new() -> Self {
    let now = Utc::now();
    Self {
      name: None,
      description: None,
      version: "1.0.0".to_string(),
      created_at: now,
      modified_at: now,
      author: None,
      tags: Vec::new(),
      custom_fields: HashMap::new(),
    }
  }

  /// Set name
  #[must_use]
  pub fn with_name(mut self, name: impl Into<String>) -> Self {
    self.name = Some(name.into());
    self
  }

  /// Set description
  #[must_use]
  pub fn with_description(mut self, description: impl Into<String>) -> Self {
    self.description = Some(description.into());
    self
  }

  /// Set version
  #[must_use]
  pub fn with_version(mut self, version: impl Into<String>) -> Self {
    self.version = version.into();
    self
  }

  /// Set author
  #[must_use]
  pub fn with_author(mut self, author: impl Into<String>) -> Self {
    self.author = Some(author.into());
    self
  }

  /// Add tags
  #[must_use]
  pub fn with_tags(mut self, tags: Vec<String>) -> Self {
    self.tags = tags;
    self
  }

  /// Add custom field
  #[must_use]
  pub fn with_custom_field(
    mut self,
    key: impl Into<String>,
    value: impl Into<String>,
  ) -> Self {
    self.custom_fields.insert(key.into(), value.into());
    self
  }
}

impl ConfigManager {
  /// Create a new configuration manager
  #[must_use]
  pub fn new() -> Self {
    let mut search_paths = Vec::new();

    // Add default search paths
    if let Ok(home) = std::env::var("HOME") {
      let home_dir = PathBuf::from(home);
      search_paths.push(home_dir.join(".config").join("neuro-divergent"));
    }

    search_paths.push(PathBuf::from("/etc/neuro-divergent"));
    search_paths.push(PathBuf::from("./config"));

    Self {
      search_paths,
      current_config: None,
      file_format: DataFormat::Json,
    }
  }

  /// Add a search path
  ///
  /// # Errors
  ///
  /// This function does not return errors but may panic if the path cannot be converted.
  ///
  /// # Panics
  ///
  /// Panics if the path cannot be converted to a `PathBuf`.
  pub fn add_search_path<P: AsRef<Path>>(&mut self, path: P) {
    self.search_paths.push(path.as_ref().to_path_buf());
  }

  /// Load configuration from the first found file
  ///
  /// # Errors
  ///
  /// Returns an error if no configuration file is found or if there are issues reading the file.
  ///
  /// # Panics
  ///
  /// Panics if the current config is `None` when it should have been set.
  pub fn load_config(&mut self) -> NeuroDivergentResult<&SystemConfig> {
    for search_path in &self.search_paths {
      let config_file = search_path.join("config.json");
      if config_file.exists() {
        let config = self.load_from_file(&config_file)?;
        self.current_config = Some(config);
        return Ok(self.current_config.as_ref().unwrap());
      }
    }

    // Use default configuration if no file found
    self.current_config = Some(SystemConfig::default());
    Ok(self.current_config.as_ref().unwrap())
  }

  /// Load configuration from specific file
  ///
  /// # Errors
  ///
  /// Returns an error if the file cannot be read or if the JSON cannot be parsed.
  pub fn load_from_file<P: AsRef<Path>>(
    &self,
    path: P,
  ) -> NeuroDivergentResult<SystemConfig> {
    let content = std::fs::read_to_string(path).map_err(|e| {
      ErrorBuilder::config(format!("Failed to read config file: {e}")).build()
    })?;

    let config: SystemConfig = serde_json::from_str(&content).map_err(|e| {
      ErrorBuilder::config(format!("Failed to parse config: {e}")).build()
    })?;

    Ok(config)
  }

  /// Save current configuration
  ///
  /// # Errors
  ///
  /// Returns an error if no configuration is loaded, if serialization fails, or if the file cannot be written.
  pub fn save_config<P: AsRef<Path>>(
    &self,
    path: P,
  ) -> NeuroDivergentResult<()> {
    let config = self
      .current_config
      .as_ref()
      .ok_or_else(|| config_error!("No configuration loaded"))?;

    let content = serde_json::to_string_pretty(config).map_err(|e| {
      ErrorBuilder::config(format!("Failed to serialize config: {e}")).build()
    })?;

    std::fs::write(path, content).map_err(|e| {
      ErrorBuilder::config(format!("Failed to write config file: {e}"))
        .build()
    })?;

    Ok(())
  }

  /// Get current configuration
  #[must_use]
  pub const fn config(&self) -> Option<&SystemConfig> {
    self.current_config.as_ref()
  }

  /// Get mutable reference to current configuration
  pub const fn config_mut(&mut self) -> Option<&mut SystemConfig> {
    self.current_config.as_mut()
  }

  /// Validate current configuration
  #[must_use]
  pub fn validate(&self) -> ValidationResult {
    let mut result = ValidationResult {
      is_valid: true,
      errors: Vec::new(),
      warnings: Vec::new(),
    };

    if let Some(config) = &self.current_config {
      Self::validate_system_config(config, &mut result);
    } else {
      result.is_valid = false;
      result.errors.push(ValidationError {
        field: "config".to_string(),
        message: "No configuration loaded".to_string(),
        code: Some("NO_CONFIG".to_string()),
      });
    }

    result
  }

  const fn validate_system_config(
    _config: &SystemConfig,
    _result: &mut ValidationResult,
  ) {
    // TODO: Implement comprehensive configuration validation
  }
}


impl Default for LoggingConfig {
  fn default() -> Self {
    Self {
      level: "info".to_string(),
      format: LogFormat::Text,
      file_path: None,
      max_file_size_mb: Some(100),
      max_files: Some(5),
      structured: false,
      timestamps: true,
    }
  }
}

impl Default for PerformanceConfig {
  fn default() -> Self {
    Self {
      features: PerformanceFeatures::default(),
      gpu_device_id: None,
      cpu_optimization: CpuOptimization::Native,
      profiling_output_dir: None,
    }
  }
}

impl Default for MemoryConfig {
  fn default() -> Self {
    Self {
      pool_size_mb: None,
      enable_pool: false,
      allocation_strategy: AllocationStrategy::System,
      enable_monitoring: false,
      warning_threshold: Some(80.0),
      gc_hints: true,
    }
  }
}


impl Default for ThreadPoolConfig {
  fn default() -> Self {
    Self {
      pool_type: ThreadPoolType::Global,
      stack_size_kb: None,
      thread_name_prefix: Some("neuro-divergent".to_string()),
      thread_priority: Some(ThreadPriority::Normal),
    }
  }
}

impl Default for IoConfig {
  fn default() -> Self {
    Self {
      default_format: DataFormat::Json,
      enable_compression: false,
      compression_level: Some(6),
      buffer_size_kb: 64,
      enable_async_io: false,
      network_timeout_secs: Some(30),
      retry_config: RetryConfig::default(),
    }
  }
}

impl Default for RetryConfig {
  fn default() -> Self {
    Self {
      max_retries: 3,
      initial_delay_ms: 100,
      max_delay_ms: 5000,
      backoff_multiplier: 2.0,
      enable_jitter: true,
    }
  }
}

impl Default for DebugConfig {
  fn default() -> Self {
    Self {
      enabled: false,
      output_dir: None,
      features: DebugFeatures::default(),
      verbosity: DebugVerbosity::Normal,
    }
  }
}


impl Default for ConfigMetadata {
  fn default() -> Self {
    Self::new()
  }
}

impl Default for ConfigManager {
  fn default() -> Self {
    Self::new()
  }
}

impl<T: Float + Send + Sync + 'static> Default for ModelConfigBuilder<T> {
  fn default() -> Self {
    Self::new()
  }
}

impl fmt::Display for LogFormat {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      Self::Text => write!(f, "text"),
      Self::Json => write!(f, "json"),
      Self::Compact => write!(f, "compact"),
      Self::Pretty => write!(f, "pretty"),
    }
  }
}

impl fmt::Display for DataFormat {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      Self::Json => write!(f, "json"),
      Self::Bson => write!(f, "bson"),
      Self::MessagePack => write!(f, "msgpack"),
      Self::Binary => write!(f, "binary"),
      Self::Parquet => write!(f, "parquet"),
      Self::Csv => write!(f, "csv"),
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_generic_config_creation() {
    let config = GenericModelConfig::<f64>::new("test_model")
      .with_parameter("learning_rate".to_string(), ConfigParameter::Float(0.01))
      .with_parameter("epochs".to_string(), ConfigParameter::Integer(100));

    assert_eq!(config.model_type, "test_model");
    assert_eq!(config.get_float_parameter("learning_rate"), Some(0.01));
    assert_eq!(config.get_integer_parameter("epochs"), Some(100));
  }

  #[test]
  fn test_config_builder() {
    let config = ModelConfigBuilder::<f64>::new()
      .with_model_type("lstm")
      .with_horizon(12)
      .with_input_size(24)
      .with_parameter("hidden_size".to_string(), ConfigParameter::Integer(64))
      .build()
      .unwrap();

    assert_eq!(config.model_type, "lstm");
    assert_eq!(config.horizon, 12);
    assert_eq!(config.input_size, 24);
    assert_eq!(config.get_integer_parameter("hidden_size"), Some(64));
  }

  #[test]
  fn test_config_validation() {
    let mut valid_config = GenericModelConfig::<f64>::new("test")
      .with_parameter("horizon".to_string(), ConfigParameter::Integer(12));

    valid_config.horizon = 12;
    assert!(valid_config.validate().is_ok());

    let mut invalid_config = GenericModelConfig::<f64>::new("test");
    invalid_config.horizon = 0;
    assert!(invalid_config.validate().is_err());
  }

  #[test]
  fn test_config_serialization() {
    let config = GenericModelConfig::<f64>::new("test_model")
      .with_parameter("param1".to_string(), ConfigParameter::Float(1.0))
      .with_parameter(
        "param2".to_string(),
        ConfigParameter::String("value".to_string()),
      );

    let serialized = serde_json::to_string(&config).unwrap();
    let deserialized: GenericModelConfig<f64> =
      serde_json::from_str(&serialized).unwrap();

    assert_eq!(config.model_type, deserialized.model_type);
    assert_eq!(config.parameters.len(), deserialized.parameters.len());
  }

  #[test]
  fn test_system_config_defaults() {
    let config = SystemConfig::default();

    assert_eq!(config.logging.level, "info");
    assert!(config.performance.features.simd());
    assert!(!config.debug.enabled);
    assert!(!config.features.experimental.gpu_kernels());
  }

  #[test]
  fn test_config_manager() {
    let mut manager = ConfigManager::new();

    // Should load default config when no file exists
    let config = manager.load_config().unwrap();
    assert_eq!(config.logging.level, "info");

    // Should be able to get current config
    assert!(manager.config().is_some());
  }

  #[test]
  fn test_metadata_builder() {
    let metadata = ConfigMetadata::new()
      .with_name("test_config")
      .with_description("Test configuration")
      .with_author("test_author")
      .with_tags(vec!["test".to_string(), "config".to_string()])
      .with_custom_field("custom_key", "custom_value");

    assert_eq!(metadata.name, Some("test_config".to_string()));
    assert_eq!(metadata.description, Some("Test configuration".to_string()));
    assert_eq!(metadata.author, Some("test_author".to_string()));
    assert_eq!(metadata.tags, vec!["test", "config"]);
    assert_eq!(
      metadata.custom_fields.get("custom_key"),
      Some(&"custom_value".to_string())
    );
  }
}
