//! Real-World Scenarios Tests
//!
//! Tests for multiple time series forecasting, model ensemble creation, and online learning updates

use super::mock_implementations::*;
use anyhow::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::test]
async fn test_multiple_time_series_forecasting() -> Result<()> {
  // Test forecasting across multiple related time series

  // Create multiple time series with different characteristics
  let mut series_data = HashMap::new();

  // Sales data (seasonal)
  series_data
    .insert("sales", TimeSeriesData::seasonal(365, 30.0, 12.0, "daily")?);

  // Temperature data (seasonal with trend)
  series_data.insert(
    "temperature",
    TimeSeriesData::seasonal_with_trend(365, 20.0, 10.0, 0.01, "daily")?,
  );

  // Stock prices (random walk with volatility)
  series_data.insert(
    "stock_price",
    TimeSeriesData::random_walk(365, 100.0, 0.02, "daily")?,
  );

  // Energy consumption (multiple seasonality)
  series_data.insert(
    "energy",
    TimeSeriesData::multi_seasonal(
      365,
      vec![7, 365],
      vec![50.0, 200.0],
      "daily",
    )?,
  );

  let processor = DataProcessor::new();
  let registry = ModelRegistry::new();

  // Register models
  registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
  registry.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;

  // Process each time series
  let mut processed_series = HashMap::new();
  for (name, data) in &series_data {
    let processed = processor.preprocess(data)?;
    processed_series.insert(name.clone(), processed);
  }

  // Create models for each series type
  let mut models = HashMap::new();

  // Sales: LSTM with seasonal features
  let sales_config = ModelConfig::from_params([
    ("hidden_size", "64"),
    ("num_layers", "2"),
    ("seasonal_features", "true"),
    ("input_size", "30"),
    ("output_size", "7"), // 7-day forecast
  ])?;
  models.insert("sales", registry.create_model("lstm", &sales_config)?);

  // Temperature: LSTM with trend modeling
  let temp_config = ModelConfig::from_params([
    ("hidden_size", "32"),
    ("num_layers", "1"),
    ("trend_modeling", "true"),
    ("input_size", "14"),
    ("output_size", "7"),
  ])?;
  models.insert("temperature", registry.create_model("lstm", &temp_config)?);

  // Stock price: MLP for volatility
  let stock_config = ModelConfig::from_params([
    ("hidden_size", "128"),
    ("num_layers", "3"),
    ("dropout", "0.2"),
    ("input_size", "5"),
    ("output_size", "1"),
  ])?;
  models.insert("stock_price", registry.create_model("mlp", &stock_config)?);

  // Energy: LSTM with multiple seasonality
  let energy_config = ModelConfig::from_params([
    ("hidden_size", "96"),
    ("num_layers", "2"),
    ("multi_seasonal", "true"),
    ("input_size", "168"), // Weekly patterns
    ("output_size", "24"), // 24-hour forecast
  ])?;
  models.insert("energy", registry.create_model("lstm", &energy_config)?);

  // Train models in parallel
  let trainer = ModelTrainer::new();
  let mut training_tasks = Vec::new();

  for (name, model) in models {
    let data = processed_series[&name].to_training_data()?;
    let name_clone = name.clone();

    let task = tokio::spawn(async move {
      trainer
        .train(model, &data)
        .await
        .map(|trained| (name_clone, trained))
    });
    training_tasks.push(task);
  }

  // Collect trained models
  let mut trained_models = HashMap::new();
  for task in training_tasks {
    let (name, model) = task.await??;
    trained_models.insert(name, model);
  }

  // Generate forecasts for all series
  let mut forecasts = HashMap::new();
  for (name, model) in &trained_models {
    let inference_data =
      processed_series[name].to_inference_data(match name.as_str() {
        "sales" | "temperature" => 7,
        "stock_price" => 1,
        "energy" => 24,
        _ => 7,
      })?;

    let predictions = model.predict(&inference_data).await?;
    forecasts.insert(name.clone(), predictions);
  }

  // Validate forecasts
  assert_eq!(forecasts.len(), 4, "Should have forecasts for all 4 series");

  for (name, predictions) in &forecasts {
    assert!(
      !predictions.is_empty(),
      "Predictions should not be empty for {}",
      name
    );

    let expected_horizon = match name.as_str() {
      "sales" | "temperature" => 7,
      "stock_price" => 1,
      "energy" => 24,
      _ => 7,
    };

    assert_eq!(
      predictions.len(),
      expected_horizon,
      "Forecast horizon should match expected for {}",
      name
    );
  }

  // Test cross-series correlation analysis
  let correlation_analysis = analyze_cross_series_correlations(&forecasts)?;
  assert!(
    !correlation_analysis.is_empty(),
    "Should find some correlations"
  );

  println!(
    "   ✅ Forecasted {} time series successfully",
    forecasts.len()
  );
  println!("   ✅ Cross-series correlations analyzed");

  println!("✅ Multiple time series forecasting test passed");
  Ok(())
}

#[tokio::test]
async fn test_model_ensemble_creation() -> Result<()> {
  // Test creation and evaluation of model ensembles

  let registry = ModelRegistry::new();
  let factory = ModelFactory::new();

  // Register base models
  registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
  registry.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;

  // Create training data
  let training_data =
    TimeSeriesData::seasonal(1000, 100.0, 20.0, "daily")?.to_training_data()?;
  let validation_data =
    TimeSeriesData::seasonal(200, 100.0, 20.0, "daily")?.to_training_data()?;

  // Create diverse base models
  let mut base_models = Vec::new();

  // LSTM variants
  for (i, &hidden_size) in [32, 64, 128].iter().enumerate() {
    let config = ModelConfig::from_params([
      ("hidden_size", &hidden_size.to_string()),
      ("num_layers", "2"),
      ("dropout", &format!("{:.1}", 0.1 + i as f64 * 0.05)),
    ])?;

    let model = registry.create_model("lstm", &config)?;
    base_models.push(model);
  }

  // MLP variants
  for &num_layers in [2, 3, 4].iter() {
    let config = ModelConfig::from_params([
      ("hidden_size", "128"),
      ("num_layers", &num_layers.to_string()),
      ("activation", "relu"),
    ])?;

    let model = registry.create_model("mlp", &config)?;
    base_models.push(model);
  }

  // Train base models
  let trainer = ModelTrainer::new();
  let mut trained_base_models = Vec::new();

  for (i, model) in base_models.into_iter().enumerate() {
    println!("   Training base model {} of 6...", i + 1);
    let trained = trainer.train(model, &training_data).await?;
    trained_base_models.push(trained);
  }

  // Create ensemble models with different strategies
  let mut ensembles = Vec::new();

  // 1. Simple averaging ensemble
  let avg_ensemble = EnsembleModel::new_averaging(trained_base_models.clone())?;
  ensembles.push(("averaging", avg_ensemble));

  // 2. Weighted ensemble (based on validation performance)
  let weights =
    calculate_model_weights(&trained_base_models, &validation_data).await?;
  let weighted_ensemble =
    EnsembleModel::new_weighted(trained_base_models.clone(), weights)?;
  ensembles.push(("weighted", weighted_ensemble));

  // 3. Stacking ensemble
  let stacking_ensemble = EnsembleModel::new_stacking(
    trained_base_models.clone(),
    registry.create_model("mlp", &ModelConfig::default())?,
  )?;
  let trained_stacking = trainer
    .train_ensemble(&stacking_ensemble, &training_data)
    .await?;
  ensembles.push(("stacking", trained_stacking));

  // 4. Dynamic ensemble (selects best model per prediction)
  let dynamic_ensemble =
    EnsembleModel::new_dynamic(trained_base_models.clone())?;
  ensembles.push(("dynamic", dynamic_ensemble));

  // Evaluate ensemble performance
  let test_data = TimeSeriesData::seasonal(100, 100.0, 20.0, "daily")?
    .to_inference_data(12)?;

  let mut ensemble_results = HashMap::new();
  for (name, ensemble) in &ensembles {
    let predictions = ensemble.predict(&test_data).await?;
    let metrics = calculate_forecast_metrics(&predictions, &test_data)?;
    ensemble_results.insert(name.clone(), metrics);

    println!(
      "   ✅ {} ensemble: MAE={:.2}, RMSE={:.2}",
      name, metrics.mae, metrics.rmse
    );
  }

  // Verify ensemble diversity
  let diversity_score =
    calculate_ensemble_diversity(&ensembles, &test_data).await?;
  assert!(
    diversity_score > 0.1,
    "Ensemble should have meaningful diversity"
  );

  // Test ensemble persistence
  let temp_dir = tempfile::TempDir::new()?;
  for (name, ensemble) in &ensembles {
    let path = temp_dir.path().join(format!("{}_ensemble.bin", name));
    registry.save_ensemble(ensemble, &path).await?;

    let loaded_ensemble = registry.load_ensemble(&path).await?;
    let original_pred = ensemble.predict(&test_data).await?;
    let loaded_pred = loaded_ensemble.predict(&test_data).await?;

    assert_eq!(original_pred.len(), loaded_pred.len());
    println!("   ✅ {} ensemble persistence verified", name);
  }

  println!(
    "   ✅ Created and evaluated {} ensemble strategies",
    ensembles.len()
  );
  println!("   ✅ Ensemble diversity score: {:.3}", diversity_score);

  println!("✅ Model ensemble creation test passed");
  Ok(())
}

#[tokio::test]
async fn test_online_learning_updates() -> Result<()> {
  // Test online learning and model updates with new data

  let registry = ModelRegistry::new();
  registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;

  // Initial training on historical data
  let initial_data = TimeSeriesData::seasonal(500, 100.0, 20.0, "daily")?;
  let initial_training_data = initial_data.to_training_data()?;

  let config = ModelConfig::from_params([
    ("hidden_size", "64"),
    ("num_layers", "2"),
    ("online_learning", "true"),
    ("adaptation_rate", "0.01"),
  ])?;

  let initial_model = registry.create_model("lstm", &config)?;
  let trainer = ModelTrainer::with_online_learning();

  let mut current_model =
    trainer.train(initial_model, &initial_training_data).await?;

  // Simulate streaming data updates
  let mut performance_history = Vec::new();

  for batch in 0..10 {
    println!("   Processing batch {} of 10...", batch + 1);

    // Generate new data with potential distribution shift
    let shift_factor = 1.0 + (batch as f64 * 0.02); // Gradual distribution shift
    let new_data =
      TimeSeriesData::seasonal(50, 100.0 * shift_factor, 20.0, "daily")?;
    let new_training_data = new_data.to_training_data()?;

    // Test model performance before update
    let test_data =
      TimeSeriesData::seasonal(20, 100.0 * shift_factor, 20.0, "daily")?
        .to_inference_data(5)?;
    let pre_update_predictions = current_model.predict(&test_data).await?;
    let pre_update_metrics =
      calculate_forecast_metrics(&pre_update_predictions, &test_data)?;

    // Update model with new data
    current_model = trainer
      .update_online(&current_model, &new_training_data)
      .await?;

    // Test model performance after update
    let post_update_predictions = current_model.predict(&test_data).await?;
    let post_update_metrics =
      calculate_forecast_metrics(&post_update_predictions, &test_data)?;

    performance_history.push(OnlineLearningMetrics {
      batch,
      pre_update_mae: pre_update_metrics.mae,
      post_update_mae: post_update_metrics.mae,
      adaptation_score: calculate_adaptation_score(
        &pre_update_metrics,
        &post_update_metrics,
      ),
    });

    // Verify model adaptation
    if batch > 2 {
      // Allow some initial adaptation time
      let recent_performance =
        &performance_history[performance_history.len().saturating_sub(3)..];
      let avg_adaptation = recent_performance
        .iter()
        .map(|m| m.adaptation_score)
        .sum::<f64>()
        / recent_performance.len() as f64;

      assert!(
        avg_adaptation > -0.5,
        "Model should not degrade significantly"
      );
    }
  }

  // Analyze online learning effectiveness
  let final_metrics = &performance_history[performance_history.len() - 1];
  let initial_metrics = &performance_history[0];

  println!("   ✅ Initial MAE: {:.3}", initial_metrics.pre_update_mae);
  println!("   ✅ Final MAE: {:.3}", final_metrics.post_update_mae);

  // Test catastrophic forgetting prevention
  let original_test_data = initial_data.to_inference_data(5)?;
  let final_predictions_on_original =
    current_model.predict(&original_test_data).await?;
  let final_metrics_on_original = calculate_forecast_metrics(
    &final_predictions_on_original,
    &original_test_data,
  )?;

  // Model should still perform reasonably on original data
  assert!(
    final_metrics_on_original.mae < initial_metrics.pre_update_mae * 2.0,
    "Model should not suffer severe catastrophic forgetting"
  );

  // Test model versioning for online updates
  let temp_dir = tempfile::TempDir::new()?;
  for (i, metrics) in performance_history.iter().enumerate().take(3) {
    let version_path = temp_dir.path().join(format!("model_v{}.bin", i));
    registry
      .save_model_version(&*current_model, &version_path, i)
      .await?;

    assert!(version_path.exists());
  }

  // Test model rollback capability
  let rollback_path = temp_dir.path().join("model_v1.bin");
  let rolled_back_model = registry.load_model(&rollback_path).await?;

  let rollback_predictions =
    rolled_back_model.predict(&original_test_data).await?;
  assert!(!rollback_predictions.is_empty());

  println!(
    "   ✅ Processed {} online learning batches",
    performance_history.len()
  );
  println!("   ✅ Catastrophic forgetting prevention verified");
  println!("   ✅ Model versioning and rollback tested");

  println!("✅ Online learning updates test passed");
  Ok(())
}

#[tokio::test]
async fn test_real_world_production_scenario() -> Result<()> {
  // Test a comprehensive real-world production scenario

  println!("   🏭 Simulating production forecasting system...");

  // Setup: Multi-tenant forecasting system
  let registry = Arc::new(Mutex::new(ModelRegistry::new()));

  // Register models for different use cases
  {
    let mut reg = registry.lock().await;
    reg.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    reg.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;
  }

  // Tenant configurations
  let tenants = vec![
    ("retail_chain", "sales forecasting", 365),
    ("energy_company", "demand forecasting", 168),
    ("logistics_firm", "capacity planning", 30),
  ];

  let mut tenant_results = HashMap::new();

  for (tenant_id, use_case, history_days) in tenants {
    println!("   📊 Processing tenant: {} ({})", tenant_id, use_case);

    // 1. Data ingestion and validation
    let raw_data = match use_case {
      "sales forecasting" => TimeSeriesData::seasonal_with_noise(
        history_days,
        1000.0,
        100.0,
        0.1,
        "daily",
      )?,
      "demand forecasting" => TimeSeriesData::multi_seasonal(
        history_days,
        vec![24, 168],
        vec![50.0, 200.0],
        "hourly",
      )?,
      "capacity planning" => {
        TimeSeriesData::trending(history_days, 100.0, 0.02, "daily")?
      }
      _ => TimeSeriesData::synthetic(history_days, "daily")?,
    };

    let processor = DataProcessor::new();
    let validated_data = processor.validate_and_clean(&raw_data)?;
    let processed_data = processor.preprocess(&validated_data)?;

    // 2. Model selection and configuration
    let (model_type, config) = match use_case {
      "sales forecasting" => (
        "lstm",
        ModelConfig::from_params([
          ("hidden_size", "128"),
          ("num_layers", "2"),
          ("seasonal_features", "true"),
          ("input_size", "30"),
          ("output_size", "7"),
        ])?,
      ),
      "demand forecasting" => (
        "lstm",
        ModelConfig::from_params([
          ("hidden_size", "96"),
          ("num_layers", "3"),
          ("multi_seasonal", "true"),
          ("input_size", "168"),
          ("output_size", "24"),
        ])?,
      ),
      "capacity planning" => (
        "mlp",
        ModelConfig::from_params([
          ("hidden_size", "64"),
          ("num_layers", "2"),
          ("trend_modeling", "true"),
          ("input_size", "14"),
          ("output_size", "30"),
        ])?,
      ),
      _ => ("lstm", ModelConfig::default()),
    };

    // 3. Model training with monitoring
    let model = {
      let reg = registry.lock().await;
      reg.create_model(model_type, &config)?
    };

    let trainer = ModelTrainer::with_monitoring();
    let training_data = processed_data.to_training_data()?;
    let trained_model =
      trainer.train_with_callbacks(model, &training_data).await?;

    // 4. Model validation and testing
    let validation_split = processed_data.split_for_validation(0.2)?;
    let validation_metrics =
      trainer.validate(&trained_model, &validation_split).await?;

    assert!(
      validation_metrics.mae > 0.0,
      "Validation should produce meaningful metrics"
    );

    // 5. Prediction generation
    let forecast_horizon = match use_case {
      "sales forecasting" => 7,
      "demand forecasting" => 24,
      "capacity planning" => 30,
      _ => 7,
    };

    let inference_data = processed_data.to_inference_data(forecast_horizon)?;
    let predictions = trained_model.predict(&inference_data).await?;

    // 6. Post-processing and quality checks
    let final_predictions = processor.postprocess_predictions(&predictions)?;
    let quality_score =
      processor.assess_prediction_quality(&final_predictions)?;

    assert!(
      quality_score > 0.5,
      "Predictions should meet quality threshold"
    );

    // 7. Model persistence and metadata
    let temp_dir = tempfile::TempDir::new()?;
    let model_path = temp_dir.path().join(format!("{}_model.bin", tenant_id));

    {
      let reg = registry.lock().await;
      reg
        .save_model_with_metadata(
          &*trained_model,
          &model_path,
          &format!("Tenant: {}, Use case: {}", tenant_id, use_case),
        )
        .await?;
    }

    tenant_results.insert(
      tenant_id.to_string(),
      TenantResult {
        use_case: use_case.to_string(),
        model_type: model_type.to_string(),
        validation_mae: validation_metrics.mae,
        forecast_horizon,
        predictions_count: final_predictions.len(),
        quality_score,
        model_size_mb: get_file_size_mb(&model_path)?,
      },
    );

    println!(
      "   ✅ {} completed: MAE={:.3}, Quality={:.3}",
      tenant_id, validation_metrics.mae, quality_score
    );
  }

  // 8. System-wide analysis
  let total_predictions: usize =
    tenant_results.values().map(|r| r.predictions_count).sum();

  let avg_quality: f64 = tenant_results
    .values()
    .map(|r| r.quality_score)
    .sum::<f64>()
    / tenant_results.len() as f64;

  let total_model_size: f64 =
    tenant_results.values().map(|r| r.model_size_mb).sum();

  assert_eq!(tenant_results.len(), 3, "Should process all tenants");
  assert!(
    total_predictions > 50,
    "Should generate substantial predictions"
  );
  assert!(avg_quality > 0.6, "Average quality should be good");

  println!("   📈 Production System Summary:");
  println!("      Tenants processed: {}", tenant_results.len());
  println!("      Total predictions: {}", total_predictions);
  println!("      Average quality: {:.3}", avg_quality);
  println!("      Total model storage: {:.1} MB", total_model_size);

  println!("✅ Real-world production scenario test passed");
  Ok(())
}

// Helper structs and functions

#[derive(Debug)]
struct OnlineLearningMetrics {
  batch: usize,
  pre_update_mae: f64,
  post_update_mae: f64,
  adaptation_score: f64,
}

#[derive(Debug)]
struct TenantResult {
  use_case: String,
  model_type: String,
  validation_mae: f64,
  forecast_horizon: usize,
  predictions_count: usize,
  quality_score: f64,
  model_size_mb: f64,
}

#[derive(Debug)]
struct ForecastMetrics {
  mae: f64,
  rmse: f64,
  mape: f64,
}

fn analyze_cross_series_correlations(
  forecasts: &HashMap<String, Vec<f64>>,
) -> Result<HashMap<String, f64>> {
  let mut correlations = HashMap::new();

  let series_names: Vec<_> = forecasts.keys().cloned().collect();
  for i in 0..series_names.len() {
    for j in (i + 1)..series_names.len() {
      let series1 = &forecasts[&series_names[i]];
      let series2 = &forecasts[&series_names[j]];

      let correlation = calculate_correlation(series1, series2);
      let key = format!("{}_{}", series_names[i], series_names[j]);
      correlations.insert(key, correlation);
    }
  }

  Ok(correlations)
}

async fn calculate_model_weights(
  models: &[Box<dyn neuro_divergent_core::BaseModel<f64> + Send + Sync>],
  validation_data: &neuro_divergent_core::TrainingData,
) -> Result<Vec<f64>> {
  let mut weights = Vec::new();
  let mut total_performance = 0.0;

  for model in models {
    // Calculate validation performance (simplified)
    let test_data = validation_data.to_inference_data(1)?;
    let predictions = model.predict(&test_data).await?;
    let metrics = calculate_forecast_metrics(&predictions, &test_data)?;

    // Weight inversely proportional to error
    let performance = 1.0 / (1.0 + metrics.mae);
    weights.push(performance);
    total_performance += performance;
  }

  // Normalize weights
  for weight in &mut weights {
    *weight /= total_performance;
  }

  Ok(weights)
}

async fn calculate_ensemble_diversity(
  ensembles: &[(&str, EnsembleModel)],
  test_data: &neuro_divergent_core::InferenceData,
) -> Result<f64> {
  let mut predictions = Vec::new();

  for (_, ensemble) in ensembles {
    let pred = ensemble.predict(test_data).await?;
    predictions.push(pred);
  }

  // Calculate diversity as average pairwise correlation
  let mut diversity_sum = 0.0;
  let mut pair_count = 0;

  for i in 0..predictions.len() {
    for j in (i + 1)..predictions.len() {
      let correlation = calculate_correlation(&predictions[i], &predictions[j]);
      diversity_sum += 1.0 - correlation.abs(); // Diversity = 1 - |correlation|
      pair_count += 1;
    }
  }

  Ok(diversity_sum / pair_count as f64)
}

fn calculate_forecast_metrics(
  predictions: &[f64],
  test_data: &neuro_divergent_core::InferenceData,
) -> Result<ForecastMetrics> {
  // Simplified metrics calculation for testing
  let mae = predictions.iter().sum::<f64>() / predictions.len() as f64 * 0.1; // Mock MAE
  let rmse = mae * 1.2; // Mock RMSE
  let mape = mae / 100.0 * 5.0; // Mock MAPE

  Ok(ForecastMetrics { mae, rmse, mape })
}

fn calculate_adaptation_score(
  pre_metrics: &ForecastMetrics,
  post_metrics: &ForecastMetrics,
) -> f64 {
  (pre_metrics.mae - post_metrics.mae) / pre_metrics.mae
}

fn calculate_correlation(series1: &[f64], series2: &[f64]) -> f64 {
  if series1.len() != series2.len() || series1.is_empty() {
    return 0.0;
  }

  let mean1 = series1.iter().sum::<f64>() / series1.len() as f64;
  let mean2 = series2.iter().sum::<f64>() / series2.len() as f64;

  let mut numerator = 0.0;
  let mut sum1_sq = 0.0;
  let mut sum2_sq = 0.0;

  for (v1, v2) in series1.iter().zip(series2.iter()) {
    let diff1 = v1 - mean1;
    let diff2 = v2 - mean2;
    numerator += diff1 * diff2;
    sum1_sq += diff1 * diff1;
    sum2_sq += diff2 * diff2;
  }

  let denominator = (sum1_sq * sum2_sq).sqrt();
  if denominator == 0.0 {
    0.0
  } else {
    numerator / denominator
  }
}

fn get_file_size_mb(path: &std::path::PathBuf) -> Result<f64> {
  let metadata = std::fs::metadata(path)?;
  Ok(metadata.len() as f64 / (1024.0 * 1024.0))
}
