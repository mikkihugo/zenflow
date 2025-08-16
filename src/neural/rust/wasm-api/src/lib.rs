//! WASM API for claude-zen neural networks using modern wasm-bindgen patterns
//!
//! This module provides the TypeScript-friendly interface to the existing Rust FANN implementation.
//! It uses the latest wasm-bindgen patterns for efficient array passing and automatic
//! type conversions between JavaScript and Rust.

use wasm_bindgen::prelude::*;
use js_sys::Float32Array;
use std::collections::HashMap;
use std::sync::{Mutex, Arc};

// Module declaration for FANN core bridge
mod fann_core;

// Import the actual FANN implementation from the existing core library
use fann_core::{
    Network, NetworkBuilder, TrainingData as FannTrainingData, 
    TrainingAlgorithm, ActivationFunction, NetworkError
};

// Set up console error panic hook for better debugging
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    wasm_logger::init(wasm_logger::Config::default());
    log::info!("Claude-zen neural WASM module initialized");
}

/// Error type for neural network operations
#[derive(Debug, thiserror::Error)]
pub enum NeuralError {
    #[error("Invalid layer configuration: {0}")]
    InvalidLayers(String),
    #[error("Training data mismatch: expected {expected} inputs, got {actual}")]
    DataMismatch { expected: usize, actual: usize },
    #[error("Network training failed: {0}")]
    TrainingFailed(String),
    #[error("Prediction failed: {0}")]
    PredictionFailed(String),
    #[error("Network not found or invalid handle")]
    InvalidHandle,
}

impl From<NeuralError> for JsValue {
    fn from(err: NeuralError) -> JsValue {
        JsValue::from_str(&err.to_string())
    }
}

/// Wrapper around the actual FANN Network implementation
/// This bridges the existing FANN library to the WASM interface
struct WasmNetworkCore {
    network: Network<f32>,
    layers: Vec<usize>,
}

impl WasmNetworkCore {
    fn new(layers: &[u32]) -> Result<Self, NeuralError> {
        if layers.len() < 2 {
            return Err(NeuralError::InvalidLayers(
                "Network must have at least 2 layers".to_string()
            ));
        }

        let layers_usize: Vec<usize> = layers.iter().map(|&x| x as usize).collect();
        
        // Use the actual FANN NetworkBuilder from the core library
        let network = NetworkBuilder::new()
            .layers(&layers_usize)
            .activation_function(ActivationFunction::Sigmoid)
            .build()
            .map_err(|e| NeuralError::InvalidLayers(format!("FANN network creation failed: {:?}", e)))?;

        Ok(WasmNetworkCore {
            network,
            layers: layers_usize,
        })
    }

    fn forward(&self, inputs: &[f32]) -> Result<Vec<f32>, NeuralError> {
        if inputs.len() != self.layers[0] {
            return Err(NeuralError::DataMismatch {
                expected: self.layers[0],
                actual: inputs.len(),
            });
        }

        // Use the actual FANN network's run method
        self.network.run(inputs)
            .map_err(|e| NeuralError::PredictionFailed(format!("FANN prediction failed: {:?}", e)))
    }

    fn train_batch(&mut self, inputs: &[f32], targets: &[f32], epochs: u32) -> Result<f32, NeuralError> {
        let input_size = self.layers[0];
        let output_size = self.layers[self.layers.len() - 1];
        
        if inputs.len() % input_size != 0 {
            return Err(NeuralError::DataMismatch {
                expected: input_size,
                actual: inputs.len() % input_size,
            });
        }
        
        if targets.len() % output_size != 0 {
            return Err(NeuralError::DataMismatch {
                expected: output_size,
                actual: targets.len() % output_size,
            });
        }

        let num_samples = inputs.len() / input_size;
        
        // Create FANN training data structure
        let mut training_inputs = Vec::new();
        let mut training_outputs = Vec::new();
        
        for sample_idx in 0..num_samples {
            let sample_start = sample_idx * input_size;
            let sample_inputs = &inputs[sample_start..sample_start + input_size];
            training_inputs.push(sample_inputs.to_vec());
            
            let target_start = sample_idx * output_size;
            let sample_targets = &targets[target_start..target_start + output_size];
            training_outputs.push(sample_targets.to_vec());
        }
        
        // Create FannTrainingData using the actual FANN library
        let training_data = FannTrainingData::new(training_inputs, training_outputs)
            .map_err(|e| NeuralError::TrainingFailed(format!("Failed to create training data: {:?}", e)))?;
        
        // Use the actual FANN training algorithm
        self.network.train(&training_data, TrainingAlgorithm::IncrementalBackprop, epochs)
            .map_err(|e| NeuralError::TrainingFailed(format!("FANN training failed: {:?}", e)))?;
        
        // Return the network's current error
        self.network.get_MSE()
            .map_err(|e| NeuralError::TrainingFailed(format!("Failed to get MSE: {:?}", e)))
    }
}

/// Global network storage
static NETWORKS: Mutex<HashMap<u32, WasmNetworkCore>> = Mutex::new(HashMap::new());
static NEXT_HANDLE: Mutex<u32> = Mutex::new(1);

/// WASM-bindgen exported struct for neural networks
/// This is the main interface that TypeScript will interact with
#[wasm_bindgen]
pub struct WasmNetwork {
    handle: u32,
}

#[wasm_bindgen]
impl WasmNetwork {
    /// Create a new neural network with the specified layer configuration
    /// 
    /// # Arguments
    /// * `layers` - Array of layer sizes (e.g., [784, 128, 64, 10] for a 4-layer network)
    /// 
    /// # Returns
    /// * `Result<WasmNetwork, JsValue>` - The network instance or an error
    #[wasm_bindgen(constructor)]
    pub fn new(layers: &[u32]) -> Result<WasmNetwork, JsValue> {
        log::info!("Creating new neural network with layers: {:?}", layers);
        
        let network = WasmNetworkCore::new(layers)?;
        
        let mut networks = NETWORKS.lock().unwrap();
        let mut next_handle = NEXT_HANDLE.lock().unwrap();
        
        let handle = *next_handle;
        *next_handle += 1;
        
        networks.insert(handle, network);
        
        log::info!("Created neural network with handle: {}", handle);
        
        Ok(WasmNetwork { handle })
    }

    /// Train the network with the provided data
    /// 
    /// # Arguments
    /// * `inputs` - Flattened training inputs as Float32Array
    /// * `outputs` - Flattened expected outputs as Float32Array  
    /// * `epochs` - Number of training epochs
    /// 
    /// # Returns
    /// * `Result<f32, JsValue>` - Final training error or an error
    pub fn train(&mut self, inputs: &[f32], outputs: &[f32], epochs: u32) -> Result<f32, JsValue> {
        log::info!("Training network {} for {} epochs", self.handle, epochs);
        
        let mut networks = NETWORKS.lock().unwrap();
        let network = networks.get_mut(&self.handle)
            .ok_or_else(|| JsValue::from_str("Network not found"))?;
        
        let mut final_error = 0.0;
        
        for epoch in 0..epochs {
            let error = network.train_batch(inputs, outputs, 1)
                .map_err(|e| JsValue::from(e))?;
            
            final_error = error;
            
            // Log progress every 100 epochs
            if epoch % 100 == 0 || epoch == epochs - 1 {
                log::debug!("Epoch {}/{}, Error: {:.6}", epoch + 1, epochs, error);
            }
        }
        
        log::info!("Training completed for network {}. Final error: {:.6}", self.handle, final_error);
        Ok(final_error)
    }

    /// Make a prediction with the network
    /// 
    /// # Arguments
    /// * `inputs` - Input data as Float32Array
    /// 
    /// # Returns
    /// * `Result<Vec<f32>, JsValue>` - Prediction outputs or an error
    /// 
    /// Note: The returned Vec<f32> is automatically converted to Float32Array by wasm-bindgen
    pub fn predict(&self, inputs: &[f32]) -> Result<Vec<f32>, JsValue> {
        let networks = NETWORKS.lock().unwrap();
        let network = networks.get(&self.handle)
            .ok_or_else(|| JsValue::from_str("Network not found"))?;
        
        let outputs = network.forward(inputs)
            .map_err(|e| JsValue::from(e))?;
        
        log::debug!("Prediction completed for network {}", self.handle);
        Ok(outputs)
    }

    /// Get the network's layer configuration
    /// 
    /// # Returns
    /// * `Vec<u32>` - Array of layer sizes
    pub fn get_layers(&self) -> Result<Vec<u32>, JsValue> {
        let networks = NETWORKS.lock().unwrap();
        let network = networks.get(&self.handle)
            .ok_or_else(|| JsValue::from_str("Network not found"))?;
        
        Ok(network.layers.iter().map(|&x| x as u32).collect())
    }

    /// Set the learning rate for training
    /// 
    /// # Arguments
    /// * `rate` - New learning rate (typically between 0.001 and 0.1)
    pub fn set_learning_rate(&mut self, rate: f32) -> Result<(), JsValue> {
        let mut networks = NETWORKS.lock().unwrap();
        let network = networks.get_mut(&self.handle)
            .ok_or_else(|| JsValue::from_str("Network not found"))?;
        
        // Use the FANN library's learning rate setting method
        network.network.set_learning_rate(rate)
            .map_err(|e| JsValue::from_str(&format!("Failed to set learning rate: {:?}", e)))?;
        
        log::info!("Set learning rate for network {} to {}", self.handle, rate);
        Ok(())
    }

    /// Get the current learning rate
    /// 
    /// # Returns
    /// * `f32` - Current learning rate
    pub fn get_learning_rate(&self) -> Result<f32, JsValue> {
        let networks = NETWORKS.lock().unwrap();
        let network = networks.get(&self.handle)
            .ok_or_else(|| JsValue::from_str("Network not found"))?;
        
        // Use the FANN library's learning rate getter
        network.network.get_learning_rate()
            .map_err(|e| JsValue::from_str(&format!("Failed to get learning rate: {:?}", e)))
    }
}

/// Clean up a network when it's no longer needed
/// This is called automatically when the WasmNetwork is dropped
impl Drop for WasmNetwork {
    fn drop(&mut self) {
        if let Ok(mut networks) = NETWORKS.lock() {
            networks.remove(&self.handle);
            log::info!("Cleaned up network with handle: {}", self.handle);
        }
    }
}

/// Utility function to get system information
#[wasm_bindgen]
pub fn get_wasm_info() -> JsValue {
    let info = serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "build_timestamp": env!("VERGEN_BUILD_TIMESTAMP"),
        "features": {
            "fann_integration": cfg!(feature = "fann-rs"),
            "console_errors": cfg!(feature = "console_error_panic_hook")
        }
    });
    
    serde_wasm_bindgen::to_value(&info).unwrap_or_else(|_| JsValue::from_str("{}"))
}

/// Get the number of active networks
#[wasm_bindgen]
pub fn get_active_network_count() -> u32 {
    if let Ok(networks) = NETWORKS.lock() {
        networks.len() as u32
    } else {
        0
    }
}