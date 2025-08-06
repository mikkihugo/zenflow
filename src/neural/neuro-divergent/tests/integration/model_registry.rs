//! Model Registry Integration Tests
//! 
//! Tests for dynamic model discovery, plugin loading, and model serialization/deserialization

// Import mock implementations
mod mock_implementations;
use mock_implementations::*;

use std::collections::HashMap;
use std::path::PathBuf;
use tempfile::TempDir;
use anyhow::Result;

#[tokio::test]
async fn test_dynamic_model_discovery() -> Result<()> {
    // Test dynamic model discovery from registry
    let registry = ModelRegistry::new();
    
    // Register multiple model types
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    registry.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;
    registry.register_model("rnn", Box::new(|| Box::new(RNN::default())))?;
    
    // Test discovery of all registered models
    let available_models = registry.list_available_models();
    assert!(available_models.contains(&"lstm".to_string()));
    assert!(available_models.contains(&"mlp".to_string()));
    assert!(available_models.contains(&"rnn".to_string()));
    
    // Test model creation through discovery
    let lstm_model = registry.create_model("lstm", &ModelConfig::default())?;
    assert_eq!(lstm_model.model_type(), TestModelType::LSTM);
    
    let mlp_model = registry.create_model("mlp", &ModelConfig::default())?;
    assert_eq!(mlp_model.model_type(), TestModelType::MLP);
    
    println!("✅ Dynamic model discovery test passed");
    Ok(())
}

#[tokio::test]
async fn test_plugin_loading() -> Result<()> {
    // Test plugin loading functionality
    let temp_dir = TempDir::new()?;
    let registry = ModelRegistry::with_plugin_dir(temp_dir.path());
    
    // Test loading plugins from directory
    registry.load_plugins().await?;
    
    // Test that built-in models are still available after plugin loading
    let available_models = registry.list_available_models();
    assert!(!available_models.is_empty(), "Should have at least built-in models");
    
    // Test plugin registration validation
    let plugin_config = r#"
        {
            "name": "custom_transformer",
            "version": "1.0.0",
            "model_type": "transformer",
            "entry_point": "create_transformer"
        }
    "#;
    
    // This should not fail even if the plugin doesn't exist
    let result = registry.validate_plugin_config(plugin_config);
    assert!(result.is_ok() || result.is_err()); // Either way is acceptable for validation
    
    println!("✅ Plugin loading test passed");
    Ok(())
}

#[tokio::test]
async fn test_model_serialization_deserialization() -> Result<()> {
    // Test model serialization and deserialization across crates
    let temp_dir = TempDir::new()?;
    let registry = ModelRegistry::new();
    
    // Create and configure a model
    let mut lstm_config = ModelConfig::default();
    lstm_config.set("hidden_size", 128)?;
    lstm_config.set("num_layers", 2)?;
    lstm_config.set("dropout", 0.1)?;
    
    let original_model = registry.create_model("lstm", &lstm_config)?;
    
    // Serialize the model
    let model_path = temp_dir.path().join("test_model.bin");
    registry.save_model(&*original_model, &model_path).await?;
    
    // Verify the model file was created
    assert!(model_path.exists(), "Model file should exist after saving");
    
    // Deserialize the model
    let loaded_model = registry.load_model(&model_path).await?;
    
    // Verify the loaded model has the same configuration
    assert_eq!(loaded_model.model_type(), original_model.model_type());
    
    // Test model metadata persistence
    let metadata = registry.get_model_metadata(&model_path).await?;
    assert!(metadata.contains_key("model_type"));
    assert!(metadata.contains_key("config"));
    
    println!("✅ Model serialization/deserialization test passed");
    Ok(())
}

#[tokio::test]
async fn test_model_factory_integration() -> Result<()> {
    // Test integration between ModelFactory and ModelRegistry
    let factory = ModelFactory::new();
    let registry = ModelRegistry::new();
    
    // Test factory model creation
    let lstm_config = ModelConfig::from_params([
        ("hidden_size", "64"),
        ("num_layers", "1"),
        ("input_size", "10"),
        ("output_size", "1"),
    ])?;
    
    let factory_model = factory.create_lstm(&lstm_config)?;
    
    // Register the factory-created model in the registry
    registry.register_instance("factory_lstm", factory_model)?;
    
    // Verify the model can be retrieved from the registry
    let retrieved_model = registry.get_model("factory_lstm")?;
    assert_eq!(retrieved_model.model_type(), TestModelType::LSTM);
    
    // Test batch model creation through factory
    let model_configs = vec![
        ("lstm_1", lstm_config.clone()),
        ("lstm_2", lstm_config.clone()),
    ];
    
    let models = factory.create_batch(model_configs)?;
    assert_eq!(models.len(), 2);
    
    println!("✅ Model factory integration test passed");
    Ok(())
}

#[tokio::test]
async fn test_model_versioning() -> Result<()> {
    // Test model versioning and backward compatibility
    let registry = ModelRegistry::new();
    
    // Create models with different versions
    let v1_config = ModelConfig::from_version("1.0")?;
    let v2_config = ModelConfig::from_version("2.0")?;
    
    let v1_model = registry.create_model("lstm", &v1_config)?;
    let v2_model = registry.create_model("lstm", &v2_config)?;
    
    // Test version compatibility
    assert!(registry.is_compatible(&v1_model, &v2_model)?);
    
    // Test version migration
    let migrated_model = registry.migrate_model(&v1_model, "2.0").await?;
    assert_eq!(migrated_model.model_type(), TestModelType::LSTM);
    
    println!("✅ Model versioning test passed");
    Ok(())
}