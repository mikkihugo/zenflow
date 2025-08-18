//! Mock implementations for testing
//!
//! This module provides mock implementations of types and functions
//! that are referenced in integration tests but may not be fully implemented yet.

use anyhow::Result;
use std::collections::HashMap;
use std::time::Duration;

// Mock core types
pub struct TimeSeriesData {
  values: Vec<f64>,
  frequency: String,
}

impl TimeSeriesData {
  pub fn from_values(values: Vec<f64>, frequency: &str) -> Result<Self> {
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn synthetic(length: usize, frequency: &str) -> Result<Self> {
    let values: Vec<f64> = (0..length)
      .map(|i| i as f64 + rand::random::<f64>())
      .collect();
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn seasonal(
    length: usize,
    base: f64,
    amplitude: f64,
    frequency: &str,
  ) -> Result<Self> {
    let values: Vec<f64> = (0..length)
      .map(|i| {
        base + amplitude * (i as f64 * 2.0 * std::f64::consts::PI / 365.0).sin()
      })
      .collect();
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn seasonal_with_trend(
    length: usize,
    base: f64,
    amplitude: f64,
    trend: f64,
    frequency: &str,
  ) -> Result<Self> {
    let values: Vec<f64> = (0..length)
      .map(|i| {
        base
          + amplitude * (i as f64 * 2.0 * std::f64::consts::PI / 365.0).sin()
          + trend * i as f64
      })
      .collect();
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn seasonal_with_noise(
    length: usize,
    base: f64,
    amplitude: f64,
    noise: f64,
    frequency: &str,
  ) -> Result<Self> {
    let values: Vec<f64> = (0..length)
      .map(|i| {
        base
          + amplitude * (i as f64 * 2.0 * std::f64::consts::PI / 365.0).sin()
          + noise * (rand::random::<f64>() - 0.5) * 2.0
      })
      .collect();
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn random_walk(
    length: usize,
    start: f64,
    volatility: f64,
    frequency: &str,
  ) -> Result<Self> {
    let mut values = vec![start];
    for _ in 1..length {
      let last = values.last().unwrap();
      let change = volatility * (rand::random::<f64>() - 0.5) * 2.0;
      values.push(last + change);
    }
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn multi_seasonal(
    length: usize,
    periods: Vec<usize>,
    amplitudes: Vec<f64>,
    frequency: &str,
  ) -> Result<Self> {
    let values: Vec<f64> = (0..length)
      .map(|i| {
        periods
          .iter()
          .zip(amplitudes.iter())
          .map(|(period, amplitude)| {
            amplitude
              * (i as f64 * 2.0 * std::f64::consts::PI / *period as f64).sin()
          })
          .sum::<f64>()
      })
      .collect();
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn trending(
    length: usize,
    start: f64,
    trend: f64,
    frequency: &str,
  ) -> Result<Self> {
    let values: Vec<f64> =
      (0..length).map(|i| start + trend * i as f64).collect();
    Ok(Self {
      values,
      frequency: frequency.to_string(),
    })
  }

  pub fn from_csv(_path: &std::path::PathBuf) -> Result<Self> {
    // Mock CSV loading
    Self::synthetic(100, "daily")
  }

  pub fn len(&self) -> usize {
    self.values.len()
  }

  pub fn frequency(&self) -> &str {
    &self.frequency
  }

  pub fn is_normalized(&self) -> bool {
    true
  }

  pub fn to_training_data(&self) -> Result<TrainingData> {
    Ok(TrainingData {
      inputs: self.values.clone(),
      targets: self.values.clone(),
    })
  }

  pub fn to_inference_data(&self, horizon: usize) -> Result<InferenceData> {
    Ok(InferenceData {
      inputs: self.values.clone(),
      horizon,
    })
  }

  pub fn split_for_validation(&self, _ratio: f64) -> Result<TrainingData> {
    self.to_training_data()
  }

  pub fn n_series(&self) -> Result<usize> {
    Ok(1)
  }

  pub fn shape(&self) -> (usize, usize) {
    (self.values.len(), 1)
  }
}

#[derive(Clone)]
pub struct TrainingData {
  pub inputs: Vec<f64>,
  pub targets: Vec<f64>,
}

impl TrainingData {
  pub fn synthetic(
    rows: usize,
    input_size: usize,
    output_size: usize,
  ) -> Result<Self> {
    let inputs: Vec<f64> = (0..rows * input_size).map(|i| i as f64).collect();
    let targets: Vec<f64> = (0..rows * output_size).map(|i| i as f64).collect();
    Ok(Self { inputs, targets })
  }

  pub fn from_time_series(data: &TimeSeriesData) -> Result<Self> {
    Ok(Self {
      inputs: data.values.clone(),
      targets: data.values.clone(),
    })
  }

  pub fn from_config(_config: &ModelConfig) -> Result<Self> {
    Self::synthetic(100, 10, 1)
  }

  pub fn to_time_series(&self) -> Result<TimeSeriesData> {
    TimeSeriesData::from_values(self.inputs.clone(), "daily")
  }

  pub fn optimal_config(&self) -> Result<ModelConfig> {
    Ok(ModelConfig::default())
  }

  pub fn to_inference_data(&self, horizon: usize) -> Result<InferenceData> {
    Ok(InferenceData {
      inputs: self.inputs.clone(),
      horizon,
    })
  }
}

#[derive(Clone)]
pub struct InferenceData {
  pub inputs: Vec<f64>,
  pub horizon: usize,
}

#[derive(Clone)]
pub struct ModelConfig {
  params: HashMap<String, String>,
}

impl ModelConfig {
  pub fn new() -> Self {
    Self {
      params: HashMap::new(),
    }
  }

  pub fn default() -> Self {
    Self::new()
  }

  pub fn from_params<T: AsRef<str>>(
    params: impl IntoIterator<Item = (T, T)>,
  ) -> Result<Self> {
    let mut config = Self::new();
    for (key, value) in params {
      config
        .params
        .insert(key.as_ref().to_string(), value.as_ref().to_string());
    }
    Ok(config)
  }

  pub fn from_version(version: &str) -> Result<Self> {
    let mut config = Self::new();
    config
      .params
      .insert("version".to_string(), version.to_string());
    Ok(config)
  }

  pub fn from_training_data(_data: &TrainingData) -> Result<Self> {
    Ok(Self::default())
  }

  pub fn set(&mut self, key: &str, value: impl Into<String>) -> Result<()> {
    self.params.insert(key.to_string(), value.into());
    Ok(())
  }

  pub fn get_int(&self, key: &str) -> Option<i64> {
    self.params.get(key).and_then(|v| v.parse().ok())
  }

  pub fn version(&self) -> &str {
    self
      .params
      .get("version")
      .map(|s| s.as_str())
      .unwrap_or("1.0")
  }

  pub fn get_config(&self) -> &Self {
    self
  }
}

// Mock model types
pub enum ModelType {
  LSTM,
  MLP,
  RNN,
}

use std::future::Future;
use std::pin::Pin;

pub trait BaseModel<T>: Send + Sync {
  fn model_type(&self) -> ModelType;
  fn is_trained(&self) -> bool;
  fn predict(
    &self,
    data: &InferenceData,
  ) -> Pin<Box<dyn Future<Output = Result<Vec<f64>>> + Send + '_>>;
  fn get_config(&self) -> ModelConfig;
}

#[derive(Default)]
pub struct LSTM {
  trained: bool,
}

impl LSTM {
  pub fn new(
    _input_size: usize,
    _hidden_size: usize,
    _output_size: usize,
  ) -> Result<Self> {
    Ok(Self::default())
  }
}

impl BaseModel<f64> for LSTM {
  fn model_type(&self) -> ModelType {
    ModelType::LSTM
  }

  fn is_trained(&self) -> bool {
    self.trained
  }

  fn predict(
    &self,
    data: &InferenceData,
  ) -> Pin<Box<dyn Future<Output = Result<Vec<f64>>> + Send + '_>> {
    let horizon = data.horizon;
    Box::pin(async move { Ok(vec![1.0; horizon]) })
  }

  fn get_config(&self) -> ModelConfig {
    ModelConfig::default()
  }
}

#[derive(Default)]
pub struct MLP {
  trained: bool,
}

impl BaseModel<f64> for MLP {
  fn model_type(&self) -> ModelType {
    ModelType::MLP
  }

  fn is_trained(&self) -> bool {
    self.trained
  }

  fn predict(
    &self,
    data: &InferenceData,
  ) -> Pin<Box<dyn Future<Output = Result<Vec<f64>>> + Send + '_>> {
    let horizon = data.horizon;
    Box::pin(async move { Ok(vec![1.0; horizon]) })
  }

  fn get_config(&self) -> ModelConfig {
    ModelConfig::default()
  }
}

#[derive(Default)]
pub struct RNN {
  trained: bool,
}

impl BaseModel<f64> for RNN {
  fn model_type(&self) -> ModelType {
    ModelType::RNN
  }

  fn is_trained(&self) -> bool {
    self.trained
  }

  fn predict(
    &self,
    data: &InferenceData,
  ) -> Pin<Box<dyn Future<Output = Result<Vec<f64>>> + Send + '_>> {
    let horizon = data.horizon;
    Box::pin(async move { Ok(vec![1.0; horizon]) })
  }

  fn get_config(&self) -> ModelConfig {
    ModelConfig::default()
  }
}

// Mock registry types
pub struct ModelRegistry {
  models: HashMap<
    String,
    Box<dyn Fn() -> Box<dyn BaseModel<f64> + Send + Sync> + Send + Sync>,
  >,
  instances: HashMap<String, Box<dyn BaseModel<f64> + Send + Sync>>,
}

impl ModelRegistry {
  pub fn new() -> Self {
    Self {
      models: HashMap::new(),
      instances: HashMap::new(),
    }
  }

  pub fn with_plugin_dir(_path: &std::path::Path) -> Self {
    Self::new()
  }

  pub fn register_model(
    &self,
    _name: &str,
    _factory: Box<
      dyn Fn() -> Box<dyn BaseModel<f64> + Send + Sync> + Send + Sync,
    >,
  ) -> Result<()> {
    // Note: This is a simplified mock - in real implementation we'd use Arc<Mutex<>> for interior mutability
    Ok(())
  }

  pub fn create_model(
    &self,
    model_type: &str,
    _config: &ModelConfig,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    match model_type {
      "lstm" => Ok(Box::new(LSTM::default())),
      "mlp" => Ok(Box::new(MLP::default())),
      "rnn" => Ok(Box::new(RNN::default())),
      _ => Err(anyhow::anyhow!("Unknown model type: {}", model_type)),
    }
  }

  pub fn list_available_models(&self) -> Vec<String> {
    vec!["lstm".to_string(), "mlp".to_string(), "rnn".to_string()]
  }

  pub async fn load_plugins(&self) -> Result<()> {
    Ok(())
  }

  pub fn validate_plugin_config(&self, _config: &str) -> Result<()> {
    Ok(())
  }

  pub async fn save_model(
    &self,
    _model: &dyn BaseModel<f64>,
    _path: &std::path::PathBuf,
  ) -> Result<()> {
    Ok(())
  }

  pub async fn load_model(
    &self,
    _path: &std::path::PathBuf,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    Ok(Box::new(LSTM::default()))
  }

  pub async fn get_model_metadata(
    &self,
    _path: &std::path::PathBuf,
  ) -> Result<HashMap<String, String>> {
    let mut metadata = HashMap::new();
    metadata.insert("model_type".to_string(), "lstm".to_string());
    metadata.insert("config".to_string(), "{}".to_string());
    Ok(metadata)
  }

  pub fn register_instance(
    &self,
    _name: &str,
    _model: Box<dyn BaseModel<f64> + Send + Sync>,
  ) -> Result<()> {
    Ok(())
  }

  pub fn get_model(
    &self,
    _name: &str,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    Ok(Box::new(LSTM::default()))
  }

  pub fn is_compatible(
    &self,
    _model1: &dyn BaseModel<f64>,
    _model2: &dyn BaseModel<f64>,
  ) -> Result<bool> {
    Ok(true)
  }

  pub async fn migrate_model(
    &self,
    _model: &dyn BaseModel<f64>,
    _version: &str,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    Ok(Box::new(LSTM::default()))
  }

  pub async fn create_model_with_fallback(
    &self,
    model_type: &str,
    _config: &ModelConfig,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    self.create_model(model_type, &ModelConfig::default())
  }

  pub fn from_corrupted_state() -> Result<Self> {
    Ok(Self::new())
  }

  pub async fn download_model_with_retry(
    &self,
    _model_name: &str,
    _retries: usize,
  ) -> Result<()> {
    Err(
      RegistryError::ModelNotFound {
        model_name: _model_name.to_string(),
        alternatives: vec!["lstm".to_string(), "mlp".to_string()],
      }
      .into(),
    )
  }

  pub async fn load_model_with_validation(
    &self,
    _path: &std::path::PathBuf,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    Err(
      RegistryError::CorruptedModel {
        path: _path.clone(),
        checksum_mismatch: true,
      }
      .into(),
    )
  }

  pub async fn migrate_config(
    &self,
    _config: &ModelConfig,
    _target_version: &str,
  ) -> Result<ModelConfig> {
    Err(
      RegistryError::UnsupportedMigration {
        from: "1.0".to_string(),
        to: _target_version.to_string(),
        reason: "Version too old".to_string(),
      }
      .into(),
    )
  }

  pub async fn save_model_with_metadata(
    &self,
    _model: &dyn BaseModel<f64>,
    _path: &std::path::PathBuf,
    _metadata: &str,
  ) -> Result<()> {
    std::fs::write(_path, b"mock_model_data")?;
    Ok(())
  }

  pub async fn save_model_version(
    &self,
    _model: &dyn BaseModel<f64>,
    _path: &std::path::PathBuf,
    _version: usize,
  ) -> Result<()> {
    std::fs::write(_path, format!("mock_model_v{}", _version))?;
    Ok(())
  }

  pub async fn save_ensemble(
    &self,
    _ensemble: &EnsembleModel,
    _path: &std::path::PathBuf,
  ) -> Result<()> {
    std::fs::write(_path, b"mock_ensemble_data")?;
    Ok(())
  }

  pub async fn load_ensemble(
    &self,
    _path: &std::path::PathBuf,
  ) -> Result<EnsembleModel> {
    Ok(EnsembleModel::new_averaging(vec![Box::new(
      LSTM::default(),
    )])?)
  }
}

#[derive(Debug, thiserror::Error)]
pub enum RegistryError {
  #[error("Model not found: {model_name}. Alternatives: {alternatives:?}")]
  ModelNotFound {
    model_name: String,
    alternatives: Vec<String>,
  },

  #[error(
    "Corrupted model at {path:?}, checksum mismatch: {checksum_mismatch}"
  )]
  CorruptedModel {
    path: std::path::PathBuf,
    checksum_mismatch: bool,
  },

  #[error("Invalid format")]
  InvalidFormat { details: String },

  #[error("Unsupported migration from {from} to {to}: {reason}")]
  UnsupportedMigration {
    from: String,
    to: String,
    reason: String,
  },

  #[error("Training failed")]
  TrainingFailed {
    source: Option<Box<dyn std::error::Error + Send + Sync>>,
  },

  #[error("Multiple errors: {errors:?}")]
  Multiple { errors: Vec<RegistryError> },
}

impl RegistryError {
  pub fn get_detailed_report(&self) -> String {
    format!("{}", self)
  }

  pub fn get_categories(&self) -> Vec<&str> {
    vec!["validation", "configuration"]
  }

  pub fn get_recovery_suggestions(&self) -> Vec<String> {
    vec!["Try using default configuration".to_string()]
  }

  pub fn get_summary(&self) -> String {
    format!("{}", self)
  }

  pub fn multiple(errors: Vec<RegistryError>) -> Self {
    Self::Multiple { errors }
  }
}

// Mock training types
pub struct ModelTrainer {
  config: Option<TrainingConfig>,
}

impl ModelTrainer {
  pub fn new() -> Self {
    Self { config: None }
  }

  pub fn with_config(config: TrainingConfig) -> Self {
    Self {
      config: Some(config),
    }
  }

  pub fn with_early_stopping(_patience: usize) -> Self {
    Self::new()
  }

  pub fn with_online_learning() -> Self {
    Self::new()
  }

  pub fn with_memory_limit(_limit: usize) -> Self {
    Self::new()
  }

  pub fn with_monitoring() -> Self {
    Self::new()
  }

  pub async fn train(
    &self,
    mut model: Box<dyn BaseModel<f64> + Send + Sync>,
    _data: &TrainingData,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    // Mock training - just set the model as trained
    tokio::time::sleep(Duration::from_millis(10)).await; // Simulate training time
    Ok(model)
  }

  pub fn validate_data_for_training(
    &self,
    _error: &anyhow::Error,
  ) -> Result<()> {
    Err(
      ModelError::InvalidData {
        reason: "Core error propagated".to_string(),
      }
      .into(),
    )
  }

  pub async fn train_with_recovery(
    &self,
    model: Box<dyn BaseModel<f64> + Send + Sync>,
    _data: &TrainingData,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    self.train(model, _data).await
  }

  pub async fn update_online(
    &self,
    model: &Box<dyn BaseModel<f64> + Send + Sync>,
    _data: &TrainingData,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    // Mock online learning update
    Ok(Box::new(LSTM::default()))
  }

  pub async fn train_with_callbacks(
    &self,
    model: Box<dyn BaseModel<f64> + Send + Sync>,
    _data: &TrainingData,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    self.train(model, _data).await
  }

  pub async fn validate(
    &self,
    _model: &Box<dyn BaseModel<f64> + Send + Sync>,
    _data: &TrainingData,
  ) -> Result<ValidationMetrics> {
    Ok(ValidationMetrics { mae: 0.1 })
  }

  pub async fn train_ensemble(
    &self,
    _ensemble: &EnsembleModel,
    _data: &TrainingData,
  ) -> Result<EnsembleModel> {
    Ok(EnsembleModel::new_averaging(vec![Box::new(
      LSTM::default(),
    )])?)
  }
}

#[derive(Debug, thiserror::Error)]
pub enum ModelError {
  #[error("Invalid data: {reason}")]
  InvalidData { reason: String },

  #[error("Out of memory. Recovery suggestions: {recovery_suggestions:?}")]
  OutOfMemory { recovery_suggestions: Vec<String> },
}

pub struct ValidationMetrics {
  pub mae: f64,
}

#[derive(Clone)]
pub struct TrainingConfig;

impl TrainingConfig {
  pub fn default() -> Self {
    Self
  }
}

// Mock data processing
pub struct DataProcessor;

impl DataProcessor {
  pub fn new() -> Self {
    Self
  }

  pub fn preprocess(&self, data: &TimeSeriesData) -> Result<TimeSeriesData> {
    Ok(data.clone())
  }

  pub fn prepare_inference_data(
    &self,
    data: &TimeSeriesData,
    horizon: usize,
  ) -> Result<InferenceData> {
    data.to_inference_data(horizon)
  }

  pub fn postprocess_predictions(
    &self,
    predictions: &[f64],
  ) -> Result<Vec<f64>> {
    Ok(predictions.to_vec())
  }

  pub fn validate_and_clean(
    &self,
    data: &TimeSeriesData,
  ) -> Result<TimeSeriesData> {
    Ok(data.clone())
  }

  pub fn assess_prediction_quality(&self, _predictions: &[f64]) -> Result<f64> {
    Ok(0.8) // Mock quality score
  }
}

pub struct DataValidator;

impl DataValidator {
  pub fn new() -> Self {
    Self
  }

  pub fn validate(&self, _data: &TimeSeriesData) -> Result<ValidationReport> {
    Ok(ValidationReport {
      errors: vec![],
      is_valid: true,
    })
  }
}

pub struct ValidationReport {
  pub errors: Vec<String>,
  pub is_valid: bool,
}

impl ValidationReport {
  pub fn is_valid(&self) -> bool {
    self.is_valid
  }
}

// Mock ensemble model
pub struct EnsembleModel {
  models: Vec<Box<dyn BaseModel<f64> + Send + Sync>>,
}

impl EnsembleModel {
  pub fn new_averaging(
    models: Vec<Box<dyn BaseModel<f64> + Send + Sync>>,
  ) -> Result<Self> {
    Ok(Self { models })
  }

  pub fn new_weighted(
    models: Vec<Box<dyn BaseModel<f64> + Send + Sync>>,
    _weights: Vec<f64>,
  ) -> Result<Self> {
    Ok(Self { models })
  }

  pub fn new_stacking(
    models: Vec<Box<dyn BaseModel<f64> + Send + Sync>>,
    _meta_model: Box<dyn BaseModel<f64> + Send + Sync>,
  ) -> Result<Self> {
    Ok(Self { models })
  }

  pub fn new_dynamic(
    models: Vec<Box<dyn BaseModel<f64> + Send + Sync>>,
  ) -> Result<Self> {
    Ok(Self { models })
  }

  pub async fn predict(&self, data: &InferenceData) -> Result<Vec<f64>> {
    Ok(vec![1.0; data.horizon])
  }
}

// Mock performance monitoring
#[derive(Clone)]
pub struct PerformanceMonitor;

impl PerformanceMonitor {
  pub fn new() -> Self {
    Self
  }

  pub fn record_training_time(&self, _id: usize, _duration: Duration) {}

  pub fn record_inference_time(&self, _id: usize, _duration: Duration) {}

  pub fn get_training_times(&self) -> Vec<Duration> {
    vec![Duration::from_millis(100); 4]
  }

  pub fn get_inference_times(&self) -> Vec<Duration> {
    vec![Duration::from_millis(50); 3]
  }

  pub fn benchmark<F, T>(&self, _name: &str, _op: F) -> MockBenchmark<F>
  where
    F: Fn() -> T,
  {
    MockBenchmark { op: _op }
  }

  pub fn benchmark_memory<F, T>(
    &self,
    _name: &str,
    _op: F,
  ) -> MockMemoryBenchmark<F>
  where
    F: Fn() -> T,
  {
    MockMemoryBenchmark { op: _op }
  }
}

pub struct MockBenchmark<F> {
  op: F,
}

impl<F, T> MockBenchmark<F>
where
  F: Fn() -> T,
{
  pub async fn run(
    &self,
    _config: BenchmarkConfig,
  ) -> Result<BenchmarkResults> {
    Ok(BenchmarkResults {
      average: Duration::from_millis(100),
      std_dev: Duration::from_millis(10),
      min: Duration::from_millis(90),
      max: Duration::from_millis(110),
    })
  }
}

pub struct MockMemoryBenchmark<F> {
  op: F,
}

impl<F, T> MockMemoryBenchmark<F>
where
  F: Fn() -> T,
{
  pub async fn run(&self) -> Result<MemoryBenchmarkResults> {
    Ok(MemoryBenchmarkResults {
      peak_usage: 256 * 1024 * 1024,    // 256MB
      average_usage: 128 * 1024 * 1024, // 128MB
    })
  }
}

// Mock memory tracking
pub struct MemoryTracker;

impl MemoryTracker {
  pub fn new() -> Self {
    Self
  }

  pub fn start_tracking(&self) {}

  pub fn stop_tracking(&self) {}

  pub fn mark_stage(&self, _stage: &str) {}

  pub fn get_current_usage(&self) -> usize {
    128 * 1024 * 1024 // 128MB mock usage
  }

  pub fn get_statistics(&self) -> MemoryStatistics {
    MemoryStatistics {
      peak_usage: 256 * 1024 * 1024, // 256MB
    }
  }

  pub fn get_stage_analysis(&self) -> Vec<(String, usize)> {
    vec![
      ("data_loading".to_string(), 64 * 1024 * 1024),
      ("model_creation".to_string(), 128 * 1024 * 1024),
      ("training".to_string(), 256 * 1024 * 1024),
      ("inference".to_string(), 192 * 1024 * 1024),
      ("cleanup".to_string(), 32 * 1024 * 1024),
    ]
  }
}

pub struct MemoryStatistics {
  pub peak_usage: usize,
}

// Mock model factory
pub struct ModelFactory;

impl ModelFactory {
  pub fn new() -> Self {
    Self
  }

  pub fn create_lstm(
    &self,
    _config: &ModelConfig,
  ) -> Result<Box<dyn BaseModel<f64> + Send + Sync>> {
    Ok(Box::new(LSTM::default()))
  }

  pub fn create_batch(
    &self,
    configs: Vec<(&str, ModelConfig)>,
  ) -> Result<Vec<Box<dyn BaseModel<f64> + Send + Sync>>> {
    configs
      .into_iter()
      .map(|(_, _)| {
        Ok(Box::new(LSTM::default()) as Box<dyn BaseModel<f64> + Send + Sync>)
      })
      .collect()
  }
}

// Re-export for test modules - avoiding name conflicts
pub use self::{
  DataProcessor, DataValidator, EnsembleModel, InferenceData, MemoryStatistics,
  MemoryTracker, ModelConfig, ModelError, ModelFactory, ModelRegistry,
  ModelTrainer, PerformanceMonitor, RegistryError, TrainingConfig,
  TrainingData, ValidationMetrics, ValidationReport, LSTM, MLP, RNN,
};

// Alias exports to avoid naming conflicts with main module types
pub type TestTimeSeriesData = TimeSeriesData;
pub type TestModelType = ModelType;
pub type TestBaseModel<T> = dyn BaseModel<T> + Send + Sync;

// Add these missing structs referenced in performance tests
#[derive(Clone)]
pub struct BenchmarkConfig {
  pub iterations: usize,
  pub warmup_iterations: usize,
  pub timeout: Duration,
}

pub struct BenchmarkResults {
  pub average: Duration,
  pub std_dev: Duration,
  pub min: Duration,
  pub max: Duration,
}

pub struct MemoryBenchmarkResults {
  pub peak_usage: usize,
  pub average_usage: usize,
}

// Missing core error type
#[derive(Debug, thiserror::Error)]
pub enum CoreError {
  #[error("Invalid frequency: {0}")]
  InvalidFrequency(String),
}
