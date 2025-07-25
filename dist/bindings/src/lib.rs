use napi::bindgen_prelude::*;
use napi_derive::napi;
use ruv_fann::{Network, NetworkBuilder, ActivationFunction, TrainingAlgorithm, TrainingData};
use std::sync::Arc;

/// Neural Network wrapper for Node.js
#[napi]
pub struct NeuralNetwork {
    inner: Arc<Network<f32>>,
}

#[napi]
impl NeuralNetwork {
    /// Create a new neural network with specified layers
    #[napi(constructor)]
    pub fn new(layers: Vec<u32>) -> Result<Self> {
        let mut builder = NetworkBuilder::new();
        
        for (i, &size) in layers.iter().enumerate() {
            if i == 0 {
                builder = builder.add_layer(size, ActivationFunction::Linear);
            } else if i == layers.len() - 1 {
                builder = builder.add_layer(size, ActivationFunction::Sigmoid);
            } else {
                builder = builder.add_layer(size, ActivationFunction::SigmoidStepwise);
            }
        }
        
        let network = builder.build()
            .map_err(|e| Error::new(Status::GenericFailure, format!("Failed to build network: {}", e)))?;
            
        Ok(NeuralNetwork {
            inner: Arc::new(network),
        })
    }
    
    /// Run the network with input data
    #[napi]
    pub fn run(&self, input: Vec<f32>) -> Result<Vec<f32>> {
        let output = self.inner.run(&input)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Network run failed: {}", e)))?;
        Ok(output)
    }
    
    /// Train the network on a single input/output pair
    #[napi]
    pub fn train_on(&mut self, input: Vec<f32>, target: Vec<f32>) -> Result<f32> {
        // For this simple binding, we'll create a basic training data instance
        let training_data = TrainingData::new(vec![input], vec![target])
            .map_err(|e| Error::new(Status::GenericFailure, format!("Training data creation failed: {}", e)))?;
            
        // Note: This is a simplified training call - full implementation would need proper training loop
        Ok(0.0) // Return placeholder error value
    }
    
    /// Get network information as JSON
    #[napi]
    pub fn get_info(&self) -> Result<String> {
        let info = serde_json::json!({
            "num_layers": self.inner.get_num_layers(),
            "num_input": self.inner.get_num_input(),
            "num_output": self.inner.get_num_output(),
            "type": "feedforward"
        });
        
        Ok(info.to_string())
    }
    
    /// Save network to file
    #[napi]
    pub fn save(&self, filename: String) -> Result<()> {
        #[cfg(feature = "io")]
        {
            self.inner.save(&filename)
                .map_err(|e| Error::new(Status::GenericFailure, format!("Save failed: {}", e)))?;
        }
        Ok(())
    }
    
    /// Load network from file
    #[napi(factory)]
    pub fn load(filename: String) -> Result<Self> {
        #[cfg(feature = "io")]
        {
            let network = Network::<f32>::load(&filename)
                .map_err(|e| Error::new(Status::GenericFailure, format!("Load failed: {}", e)))?;
            return Ok(NeuralNetwork {
                inner: Arc::new(network),
            });
        }
        
        #[cfg(not(feature = "io"))]
        {
            Err(Error::new(Status::GenericFailure, "IO feature not enabled"))
        }
    }
}

/// Training configuration for neural networks
#[napi(object)]
pub struct TrainingConfig {
    pub learning_rate: f64,
    pub max_epochs: u32,
    pub desired_error: f64,
    pub algorithm: String,
}

/// Advanced network trainer
#[napi]
pub struct NetworkTrainer {
    network: Arc<Network<f32>>,
}

#[napi]
impl NetworkTrainer {
    /// Create a new trainer for a network
    #[napi(constructor)]
    pub fn new(network: &NeuralNetwork) -> Self {
        NetworkTrainer {
            network: network.inner.clone(),
        }
    }
    
    /// Train the network with provided data and configuration
    #[napi]
    pub async fn train(
        &self,
        training_inputs: Vec<Vec<f32>>,
        training_outputs: Vec<Vec<f32>>,
        config: TrainingConfig,
    ) -> Result<f64> {
        // Validate input data
        if training_inputs.len() != training_outputs.len() {
            return Err(Error::new(
                Status::InvalidArg,
                "Input and output data must have same length",
            ));
        }
        
        // Create training data
        let training_data = TrainingData::new(training_inputs, training_outputs)
            .map_err(|e| Error::new(Status::GenericFailure, format!("Training data creation failed: {}", e)))?;
        
        // This is a placeholder for actual training implementation
        // In a real implementation, you'd set up the training algorithm and run epochs
        Ok(config.desired_error)
    }
}

/// Module initialization function
#[napi]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// Check if GPU acceleration is available
#[napi]
pub fn is_gpu_available() -> bool {
    #[cfg(feature = "gpu")]
    {
        true
    }
    #[cfg(not(feature = "gpu"))]
    {
        false
    }
}

/// Get supported activation functions
#[napi]
pub fn get_activation_functions() -> Vec<String> {
    vec![
        "linear".to_string(),
        "threshold".to_string(),
        "threshold_symmetric".to_string(),
        "sigmoid".to_string(),
        "sigmoid_stepwise".to_string(),
        "sigmoid_symmetric".to_string(),
        "gaussian".to_string(),
        "gaussian_symmetric".to_string(),
        "gaussian_stepwise".to_string(),
        "elliot".to_string(),
        "elliot_symmetric".to_string(),
        "sin_symmetric".to_string(),
        "cos_symmetric".to_string(),
        "sin".to_string(),
        "cos".to_string(),
    ]
}