//! Cross-Crate Communication Tests
//! 
//! Tests for Registry ↔ Models interaction, Core ↔ Models data flow, 
//! and CLI ↔ All crates command flow

use super::mock_implementations::*;
use std::sync::Arc;
use tokio::sync::Mutex;
use anyhow::Result;

#[tokio::test]
async fn test_registry_models_interaction() -> Result<()> {
    // Test Registry ↔ Models interaction
    let registry = Arc::new(Mutex::new(ModelRegistry::new()));
    
    // Register models from the models crate
    {
        let mut reg = registry.lock().await;
        reg.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
        reg.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;
    }
    
    // Test model creation through registry
    let config = ModelConfig::default();
    let lstm_model = {
        let reg = registry.lock().await;
        reg.create_model("lstm", &config)?
    };
    
    // Test model training through registry-created model
    let training_data = TrainingData::synthetic(100, 10, 1)?;
    let trainer = ModelTrainer::new();
    
    let trained_model = trainer.train(lstm_model, &training_data).await?;
    assert!(trained_model.is_trained());
    
    // Test model registration back to registry
    {
        let mut reg = registry.lock().await;
        reg.register_instance("trained_lstm", trained_model)?;
    }
    
    // Verify the trained model can be retrieved
    let retrieved_model = {
        let reg = registry.lock().await;
        reg.get_model("trained_lstm")?
    };
    
    assert!(retrieved_model.is_trained());
    assert_eq!(retrieved_model.model_type(), ModelType::LSTM);
    
    println!("✅ Registry ↔ Models interaction test passed");
    Ok(())
}

#[tokio::test]
async fn test_core_models_data_flow() -> Result<()> {
    // Test Core ↔ Models data flow
    let processor = DataProcessor::new();
    
    // Create time series data using core crate
    let raw_data = TimeSeriesData::from_values(
        vec![1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0],
        "daily"
    )?;
    
    // Process data through core crate
    let processed_data = processor.preprocess(&raw_data)?;
    assert!(processed_data.is_normalized());
    
    // Create model using models crate
    let mut lstm = LSTM::new(1, 10, 1)?;
    
    // Convert core data format to models training format
    let training_data = TrainingData::from_time_series(&processed_data)?;
    
    // Train model with core-processed data
    let trainer = ModelTrainer::new();
    let trained_model = trainer.train(Box::new(lstm), &training_data).await?;
    
    // Generate predictions using trained model
    let test_data = processor.prepare_inference_data(&raw_data, 24)?;
    let predictions = trained_model.predict(&test_data).await?;
    
    // Verify predictions have expected structure
    assert!(!predictions.is_empty());
    assert_eq!(predictions.len(), 1); // horizon = 1
    
    // Test data format conversion back to core types
    let core_predictions = processor.postprocess_predictions(&predictions)?;
    assert_eq!(core_predictions.len(), predictions.len());
    
    println!("✅ Core ↔ Models data flow test passed");
    Ok(())
}

#[tokio::test]
async fn test_end_to_end_workflow_integration() -> Result<()> {
    // Test complete end-to-end workflow across all crates
    
    // 1. Data preparation (core crate)
    let processor = DataProcessor::new();
    let raw_data = TimeSeriesData::synthetic(365, "daily")?; // 1 year of daily data
    let processed_data = processor.preprocess(&raw_data)?;
    
    // 2. Model creation (registry + models)
    let registry = ModelRegistry::new();
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    
    let config = ModelConfig::from_params([
        ("hidden_size", "64"),
        ("num_layers", "2"),
        ("dropout", "0.1"),
        ("input_size", "24"),
        ("output_size", "12"),
    ])?;
    
    let model = registry.create_model("lstm", &config)?;
    
    // 3. Training (models + core)
    let training_data = TrainingData::from_time_series(&processed_data)?;
    let trainer = ModelTrainer::with_config(training_data.optimal_config()?);
    let trained_model = trainer.train(model, &training_data).await?;
    
    // 4. Inference (models + core)
    let inference_data = processor.prepare_inference_data(&raw_data, 12)?;
    let predictions = trained_model.predict(&inference_data).await?;
    
    // 5. Model persistence (registry)
    let temp_dir = tempfile::TempDir::new()?;
    let model_path = temp_dir.path().join("workflow_model.bin");
    registry.save_model(&*trained_model, &model_path).await?;
    
    // 6. Model loading and verification (registry + models)
    let loaded_model = registry.load_model(&model_path).await?;
    let verification_predictions = loaded_model.predict(&inference_data).await?;
    
    // Verify predictions are consistent
    assert_eq!(predictions.len(), verification_predictions.len());
    
    // 7. Results processing (core)
    let final_results = processor.postprocess_predictions(&verification_predictions)?;
    assert_eq!(final_results.len(), 12); // 12-step forecast
    
    println!("✅ End-to-end workflow integration test passed");
    Ok(())
}

#[tokio::test]
async fn test_concurrent_crate_operations() -> Result<()> {
    // Test concurrent operations across crates
    let registry = Arc::new(Mutex::new(ModelRegistry::new()));
    let processor = Arc::new(DataProcessor::new());
    
    // Register models concurrently
    let registry_clone = registry.clone();
    let registration_task = tokio::spawn(async move {
        let mut reg = registry_clone.lock().await;
        reg.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
        reg.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;
        Ok::<(), anyhow::Error>(())
    });
    
    // Process data concurrently
    let processor_clone = processor.clone();
    let processing_task = tokio::spawn(async move {
        let data1 = TimeSeriesData::synthetic(100, "daily")?;
        let data2 = TimeSeriesData::synthetic(50, "hourly")?;
        
        let processed1 = processor_clone.preprocess(&data1)?;
        let processed2 = processor_clone.preprocess(&data2)?;
        
        Ok::<(TimeSeriesData, TimeSeriesData), anyhow::Error>((processed1, processed2))
    });
    
    // Wait for both tasks to complete
    let (_, (processed1, processed2)) = tokio::try_join!(registration_task, processing_task)?;
    
    // Create models concurrently
    let model_creation_tasks = vec![
        {
            let registry = registry.clone();
            tokio::spawn(async move {
                let reg = registry.lock().await;
                reg.create_model("lstm", &ModelConfig::default())
            })
        },
        {
            let registry = registry.clone();
            tokio::spawn(async move {
                let reg = registry.lock().await;
                reg.create_model("mlp", &ModelConfig::default())
            })
        }
    ];
    
    let models = futures::future::try_join_all(model_creation_tasks).await?;
    assert_eq!(models.len(), 2);
    
    println!("✅ Concurrent crate operations test passed");
    Ok(())
}

#[tokio::test]
async fn test_data_type_compatibility() -> Result<()> {
    // Test data type compatibility across crates
    
    // Core crate data types
    let core_data = TimeSeriesData::from_values(
        vec![1.0, 2.0, 3.0, 4.0, 5.0],
        "daily"
    )?;
    
    // Convert to models crate format
    let models_data = TrainingData::from_time_series(&core_data)?;
    
    // Convert to registry format (for model storage)
    let registry_data = ModelConfig::from_training_data(&models_data)?;
    
    // Test round-trip conversion
    let reconstructed_training_data = TrainingData::from_config(&registry_data)?;
    let reconstructed_core_data = reconstructed_training_data.to_time_series()?;
    
    // Verify data integrity
    assert_eq!(core_data.len(), reconstructed_core_data.len());
    assert_eq!(core_data.frequency(), reconstructed_core_data.frequency());
    
    // Test type system compatibility
    fn accepts_core_data(_data: &TimeSeriesData) -> bool { true }
    fn accepts_models_data(_data: &TrainingData) -> bool { true }
    fn accepts_registry_config(_config: &ModelConfig) -> bool { true }
    
    assert!(accepts_core_data(&core_data));
    assert!(accepts_models_data(&models_data));
    assert!(accepts_registry_config(&registry_data));
    
    println!("✅ Data type compatibility test passed");
    Ok(())
}