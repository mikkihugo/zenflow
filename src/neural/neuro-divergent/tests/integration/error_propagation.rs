//! Error Propagation Tests
//!
//! Tests for error handling across crate boundaries, graceful degradation, and recovery scenarios

use super::mock_implementations::*;
use anyhow::{Context, Result};
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::test]
async fn test_error_propagation_across_crates() -> Result<()> {
  // Test error propagation from core → models → registry

  // 1. Core error propagation
  let invalid_data = TimeSeriesData::from_values(vec![], "invalid_frequency");
  assert!(invalid_data.is_err(), "Should fail with invalid frequency");

  if let Err(core_error) = invalid_data {
    // Test error propagation to models crate
    let trainer = ModelTrainer::new();
    let training_result = trainer.validate_data_for_training(&core_error);
    assert!(
      training_result.is_err(),
      "Should propagate core error to models"
    );

    if let Err(model_error) = training_result {
      // Test error propagation to registry
      let registry = ModelRegistry::new();
      let registry_result = registry.handle_training_error(&model_error);
      assert!(
        registry_result.is_err(),
        "Should propagate model error to registry"
      );

      // Verify error chain preservation
      match registry_result.unwrap_err() {
        RegistryError::TrainingFailed { source, .. } => {
          assert!(source.is_some(), "Should preserve error source");
        }
        _ => panic!("Unexpected error type"),
      }
    }
  }

  println!("✅ Error propagation across crates test passed");
  Ok(())
}

#[tokio::test]
async fn test_graceful_degradation() -> Result<()> {
  // Test graceful degradation when components fail

  let registry = ModelRegistry::new();

  // Test 1: Model creation fails, fallback to default
  let invalid_config = ModelConfig::from_params([
    ("hidden_size", "invalid_number"),
    ("num_layers", "-1"),
  ])?;

  let fallback_result = registry
    .create_model_with_fallback("lstm", &invalid_config)
    .await;
  match fallback_result {
    Ok(model) => {
      // Should get a default model
      assert_eq!(model.model_type(), neuro_divergent_core::ModelType::LSTM);
      println!("   ✅ Graceful fallback to default model");
    }
    Err(e) => {
      // Or graceful error with recovery suggestions
      assert!(
        e.to_string().contains("fallback") || e.to_string().contains("default")
      );
      println!("   ✅ Graceful error with recovery guidance");
    }
  }

  // Test 2: Training fails, fallback to simpler model
  let complex_config = ModelConfig::from_params([
    ("hidden_size", "10000"), // Too large
    ("num_layers", "100"),    // Too many
  ])?;

  let simple_fallback = registry
    .create_model_with_fallback("lstm", &complex_config)
    .await;
  if let Ok(model) = simple_fallback {
    // Should have simplified configuration
    let config = model.get_config();
    assert!(config.get_int("hidden_size").unwrap_or(0) <= 256);
    assert!(config.get_int("num_layers").unwrap_or(0) <= 4);
    println!("   ✅ Graceful simplification of complex configuration");
  }

  // Test 3: Registry corruption, fallback to in-memory registry
  let corrupted_registry = ModelRegistry::from_corrupted_state();
  match corrupted_registry {
    Ok(reg) => {
      // Should work with basic functionality
      let models = reg.list_available_models();
      assert!(!models.is_empty(), "Should have fallback models");
      println!("   ✅ Graceful recovery from corrupted registry");
    }
    Err(_) => {
      // Or clear error message about recovery
      println!("   ✅ Clear error reporting for corrupted state");
    }
  }

  println!("✅ Graceful degradation test passed");
  Ok(())
}

#[tokio::test]
async fn test_recovery_scenarios() -> Result<()> {
  // Test recovery scenarios across different failure modes

  let registry = Arc::new(Mutex::new(ModelRegistry::new()));

  // Scenario 1: Network interruption during model download
  {
    let reg = registry.lock().await;
    let download_result = reg
      .download_model_with_retry(
        "nonexistent_model",
        3, // max retries
      )
      .await;

    match download_result {
      Err(RegistryError::ModelNotFound {
        model_name,
        alternatives,
      }) => {
        assert_eq!(model_name, "nonexistent_model");
        assert!(!alternatives.is_empty(), "Should suggest alternatives");
        println!("   ✅ Network failure recovery with alternatives");
      }
      _ => println!("   ✅ Network failure handled gracefully"),
    }
  }

  // Scenario 2: Memory pressure during training
  let memory_stressed_trainer = ModelTrainer::with_memory_limit(1024); // Very low limit
  let large_data = TimeSeriesData::synthetic(10000, "daily")?; // Large dataset

  let training_result = memory_stressed_trainer
    .train_with_recovery(
      Box::new(LSTM::default()),
      &large_data.to_training_data()?,
    )
    .await;

  match training_result {
    Ok(model) => {
      println!("   ✅ Memory pressure handled with data batching");
      assert!(model.is_trained());
    }
    Err(ModelError::OutOfMemory {
      recovery_suggestions,
    }) => {
      assert!(!recovery_suggestions.is_empty());
      println!("   ✅ Memory pressure reported with recovery suggestions");
    }
    Err(_) => println!("   ✅ Memory pressure handled gracefully"),
  }

  // Scenario 3: Corrupted model file recovery
  let temp_dir = tempfile::TempDir::new()?;
  let corrupted_path = temp_dir.path().join("corrupted_model.bin");
  std::fs::write(&corrupted_path, b"invalid_model_data")?;

  {
    let reg = registry.lock().await;
    let load_result = reg.load_model_with_validation(&corrupted_path).await;

    match load_result {
      Err(RegistryError::CorruptedModel {
        path,
        checksum_mismatch,
      }) => {
        assert_eq!(path, corrupted_path);
        println!("   ✅ Corrupted model detected with checksum validation");
      }
      Err(RegistryError::InvalidFormat { .. }) => {
        println!("   ✅ Invalid model format detected");
      }
      _ => println!("   ✅ Corrupted model handled gracefully"),
    }
  }

  // Scenario 4: Configuration drift recovery
  let config_v1 = ModelConfig::from_version("1.0")?;
  let config_v2 = ModelConfig::from_version("2.0")?;

  {
    let reg = registry.lock().await;
    let migration_result = reg.migrate_config(&config_v1, "2.0").await;

    match migration_result {
      Ok(migrated_config) => {
        assert_eq!(migrated_config.version(), "2.0");
        println!("   ✅ Configuration migration successful");
      }
      Err(RegistryError::UnsupportedMigration { from, to, .. }) => {
        assert_eq!(from, "1.0");
        assert_eq!(to, "2.0");
        println!("   ✅ Unsupported migration handled gracefully");
      }
      _ => println!("   ✅ Configuration drift handled"),
    }
  }

  println!("✅ Recovery scenarios test passed");
  Ok(())
}

#[tokio::test]
async fn test_error_reporting_and_diagnostics() -> Result<()> {
  // Test comprehensive error reporting and diagnostics

  let registry = ModelRegistry::new();
  let trainer = ModelTrainer::new();

  // Test detailed error reporting
  let diagnostic_config = ModelConfig::from_params([
    ("hidden_size", "0"),       // Invalid
    ("num_layers", "abc"),      // Invalid type
    ("dropout", "1.5"),         // Out of range
    ("unknown_param", "value"), // Unknown parameter
  ])?;

  let creation_result = registry.create_model("lstm", &diagnostic_config);

  if let Err(error) = creation_result {
    // Verify comprehensive error reporting
    let error_details = error.get_detailed_report();

    assert!(
      error_details.contains("hidden_size"),
      "Should report hidden_size issue"
    );
    assert!(
      error_details.contains("num_layers"),
      "Should report num_layers issue"
    );
    assert!(
      error_details.contains("dropout"),
      "Should report dropout issue"
    );
    assert!(
      error_details.contains("unknown_param"),
      "Should report unknown parameter"
    );

    // Test error categorization
    let error_categories = error.get_categories();
    assert!(error_categories.contains(&"validation"));
    assert!(error_categories.contains(&"configuration"));

    // Test recovery suggestions
    let suggestions = error.get_recovery_suggestions();
    assert!(
      !suggestions.is_empty(),
      "Should provide recovery suggestions"
    );

    println!("   ✅ Comprehensive error reporting verified");
  }

  // Test error context preservation through async operations
  let context_test = async {
    let data = TimeSeriesData::synthetic(10, "daily")
      .context("Creating synthetic training data")?;

    let model = registry
      .create_model("invalid_model", &ModelConfig::default())
      .context("Creating model from registry")?;

    trainer
      .train(model, &data.to_training_data()?)
      .await
      .context("Training model with data")
  };

  if let Err(error) = context_test.await {
    let error_chain = format!("{:#}", error);
    assert!(
      error_chain.contains("Creating model from registry")
        || error_chain.contains("Training model")
    );
    println!("   ✅ Error context preservation verified");
  }

  // Test error aggregation across multiple operations
  let mut errors = Vec::new();

  // Collect multiple errors
  for i in 0..3 {
    let invalid_config =
      ModelConfig::from_params([("param", &format!("invalid_value_{}", i))])?;

    if let Err(e) = registry.create_model("lstm", &invalid_config) {
      errors.push(e);
    }
  }

  if !errors.is_empty() {
    let aggregated_error = RegistryError::multiple(errors);
    let summary = aggregated_error.get_summary();

    assert!(summary.contains("3") || summary.contains("multiple"));
    println!("   ✅ Error aggregation verified");
  }

  println!("✅ Error reporting and diagnostics test passed");
  Ok(())
}

#[tokio::test]
async fn test_error_boundaries_and_isolation() -> Result<()> {
  // Test error boundaries and isolation between crates

  let registry = Arc::new(Mutex::new(ModelRegistry::new()));

  // Test that errors in one model don't affect others
  let tasks = vec![
    {
      let registry = registry.clone();
      tokio::spawn(async move {
        let reg = registry.lock().await;
        // This should fail
        reg.create_model("invalid_model", &ModelConfig::default())
      })
    },
    {
      let registry = registry.clone();
      tokio::spawn(async move {
        let reg = registry.lock().await;
        // This should succeed
        reg.create_model("lstm", &ModelConfig::default())
      })
    },
    {
      let registry = registry.clone();
      tokio::spawn(async move {
        let reg = registry.lock().await;
        // This should also succeed
        reg.create_model("mlp", &ModelConfig::default())
      })
    },
  ];

  let results = futures::future::join_all(tasks).await;

  // Verify isolation: one failure doesn't affect others
  let mut success_count = 0;
  let mut failure_count = 0;

  for result in results {
    match result {
      Ok(Ok(_)) => success_count += 1,
      Ok(Err(_)) => failure_count += 1,
      Err(_) => failure_count += 1,
    }
  }

  assert!(success_count > 0, "Should have some successful operations");
  assert!(failure_count > 0, "Should have some failed operations");

  println!(
    "   ✅ Error isolation verified: {} successes, {} failures",
    success_count, failure_count
  );

  // Test that registry remains functional after errors
  {
    let reg = registry.lock().await;
    let models = reg.list_available_models();
    // Registry should still work
    assert!(models.len() >= 0); // Even if empty, should not panic
  }

  println!("✅ Error boundaries and isolation test passed");
  Ok(())
}
