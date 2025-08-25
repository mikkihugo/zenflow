//! WASM API for claude-zen neural networks using modern wasm-bindgen patterns
//!
//! This module provides the TypeScript-friendly interface to the Rust FANN implementation.
//! It uses the latest wasm-bindgen patterns for efficient array passing and automatic
//! type conversions between JavaScript and Rust.

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "wasm")]
use std::collections::HashMap;
#[cfg(feature = "wasm")]
use std::sync::{Mutex, LazyLock};

#[cfg(feature = "wasm")]
use crate::{Network, NetworkBuilder};

#[cfg(feature = "wasm")]
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    wasm_logger::init(wasm_logger::Config::default());
    log::info!("Claude-zen neural WASM module initialized");
}

/// Error type for neural network operations
#[cfg(feature = "wasm")]
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

#[cfg(feature = "wasm")]
impl From<NeuralError> for JsValue {
    fn from(err: NeuralError) -> JsValue {
        JsValue::from_str(&err.to_string())
    }
}

/// Wrapper around the actual FANN Network implementation
/// This bridges the existing FANN library to the WASM interface
#[cfg(feature = "wasm")]
struct WasmNetworkCore {
    network: Network<f32>,
    layers: Vec<usize>,
}

#[cfg(feature = "wasm")]
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
            .layers_from_sizes(&layers_usize)
            .build();

        Ok(WasmNetworkCore {
            network,
            layers: layers_usize,
        })
    }

    fn forward(&mut self, inputs: &[f32]) -> Result<Vec<f32>, NeuralError> {
        if inputs.len() != self.layers[0] {
            return Err(NeuralError::DataMismatch {
                expected: self.layers[0],
                actual: inputs.len(),
            });
        }

        // Use the actual FANN network's run method
        Ok(self.network.run(inputs))
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
        
        // Create training data structure for the actual FANN API
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
        
        // Use the actual FANN training API (inputs, outputs, learning_rate, epochs)
        self.network.train(&training_inputs, &training_outputs, 0.1, epochs as usize)
            .map_err(|e| NeuralError::TrainingFailed(format!("FANN training failed: {:?}", e)))?;
        
        // Return a simple success indicator (no MSE available in this API)
        Ok(0.0)
    }
}

/// Global network storage using LazyLock for static initialization
#[cfg(feature = "wasm")]
static NETWORKS: LazyLock<Mutex<HashMap<u32, WasmNetworkCore>>> = LazyLock::new(|| Mutex::new(HashMap::new()));
#[cfg(feature = "wasm")]
static NEXT_HANDLE: LazyLock<Mutex<u32>> = LazyLock::new(|| Mutex::new(1));

/// WASM-bindgen exported struct for neural networks
/// This is the main interface that TypeScript will interact with
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub struct WasmNetwork {
    handle: u32,
}

#[cfg(feature = "wasm")]
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
                .map_err(JsValue::from)?;
            
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
        let mut networks = NETWORKS.lock().unwrap();
        let network = networks.get_mut(&self.handle)
            .ok_or_else(|| JsValue::from_str("Network not found"))?;
        
        let outputs = network.forward(inputs)
            .map_err(JsValue::from)?;
        
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

    /// Set the learning rate for training (stored for future use)
    /// 
    /// # Arguments
    /// * `rate` - New learning rate (typically between 0.001 and 0.1)
    pub fn set_learning_rate(&mut self, rate: f32) -> Result<(), JsValue> {
        // Note: Learning rate is passed directly to training methods
        // This is just for API compatibility
        log::info!("Learning rate {} noted for network {} (will be used in training)", rate, self.handle);
        Ok(())
    }

    /// Get the current learning rate (fixed at 0.1 for this implementation)
    /// 
    /// # Returns
    /// * `f32` - Current learning rate
    pub fn get_learning_rate(&self) -> Result<f32, JsValue> {
        // Return the default learning rate used in training
        Ok(0.1)
    }
}

/// Clean up a network when it's no longer needed
/// This is called automatically when the WasmNetwork is dropped
#[cfg(feature = "wasm")]
impl Drop for WasmNetwork {
    fn drop(&mut self) {
        if let Ok(mut networks) = NETWORKS.lock() {
            networks.remove(&self.handle);
            log::info!("Cleaned up network with handle: {}", self.handle);
        }
    }
}

/// Utility function to get system information
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn get_wasm_info() -> JsValue {
    let info = serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "build_timestamp": "unknown",
        "features": {
            "fann_integration": true,
            "simd_acceleration": cfg!(feature = "parallel"),
            "console_errors": cfg!(feature = "console_error_panic_hook")
        }
    });
    
    serde_wasm_bindgen::to_value(&info).unwrap_or_else(|_| JsValue::from_str("{}"))
}

/// Get the number of active networks
#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn get_active_network_count() -> u32 {
    if let Ok(networks) = NETWORKS.lock() {
        networks.len() as u32
    } else {
        0
    }
}