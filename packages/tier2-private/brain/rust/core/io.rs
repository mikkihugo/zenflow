//! I/O module for saving and loading neural network data
//!
//! This module provides functionality for serializing and deserializing
//! neural networks and training data using various formats.

use crate::{Network, TrainingData};
use crate::errors::RuvFannError;
use num_traits::Float;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;

#[cfg(feature = "io")]
use serde::{Deserialize, Serialize};

/// Error types for I/O operations
#[derive(Debug, thiserror::Error)]
pub enum IoError {
    #[error("File not found: {0}")]
    FileNotFound(String),
    #[error("Serialization error: {0}")]
    SerializationError(String),
    #[error("I/O error: {0}")]
    IoError(#[from] std::io::Error),
    #[cfg(feature = "io")]
    #[error("Bincode error: {0}")]
    BincodeError(#[from] bincode::Error),
}

impl From<IoError> for RuvFannError {
    fn from(error: IoError) -> Self {
        use crate::errors::IoErrorCategory;
        RuvFannError::Io {
            category: IoErrorCategory::FileAccess,
            message: error.to_string(),
            source: None,
        }
    }
}

/// Save a neural network to a file in binary format
#[cfg(feature = "io")]
pub fn save_network<T: Float + Serialize>(
    network: &Network<T>,
    path: impl AsRef<Path>,
) -> Result<(), IoError> {
    let mut file = File::create(path)?;
    let encoded = bincode::serialize(network)?;
    file.write_all(&encoded)?;
    Ok(())
}

/// Load a neural network from a file in binary format
#[cfg(feature = "io")]
pub fn load_network<T: Float + for<'de> Deserialize<'de>>(
    path: impl AsRef<Path>,
) -> Result<Network<T>, IoError> {
    let mut file = File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    let network = bincode::deserialize(&buffer)?;
    Ok(network)
}

/// Save training data to a file in binary format
#[cfg(feature = "io")]
pub fn save_training_data<T: Float + Serialize>(
    data: &TrainingData<T>,
    path: impl AsRef<Path>,
) -> Result<(), IoError> {
    let mut file = File::create(path)?;
    let encoded = bincode::serialize(data)?;
    file.write_all(&encoded)?;
    Ok(())
}

/// Load training data from a file in binary format
#[cfg(feature = "io")]
pub fn load_training_data<T: Float + for<'de> Deserialize<'de>>(
    path: impl AsRef<Path>,
) -> Result<TrainingData<T>, IoError> {
    let mut file = File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    let data = bincode::deserialize(&buffer)?;
    Ok(data)
}

/// Save a neural network to JSON format (requires serde feature)
#[cfg(feature = "io")]
pub fn save_network_json<T: Float + Serialize>(
    network: &Network<T>,
    path: impl AsRef<Path>,
) -> Result<(), IoError> {
    let mut file = File::create(path)?;
    let json = serde_json::to_string_pretty(network)
        .map_err(|e| IoError::SerializationError(e.to_string()))?;
    file.write_all(json.as_bytes())?;
    Ok(())
}

/// Load a neural network from JSON format (requires serde feature)
#[cfg(feature = "io")]
pub fn load_network_json<T: Float + for<'de> Deserialize<'de>>(
    path: impl AsRef<Path>,
) -> Result<Network<T>, IoError> {
    let mut file = File::open(path)?;
    let mut buffer = String::new();
    file.read_to_string(&mut buffer)?;
    let network = serde_json::from_str(&buffer)
        .map_err(|e| IoError::SerializationError(e.to_string()))?;
    Ok(network)
}

/// Export network configuration as human-readable format
pub fn export_network_info<T: Float>(
    network: &Network<T>,
    path: impl AsRef<Path>,
) -> Result<(), IoError> {
    let mut file = File::create(path)?;
    
    let info = format!(
        "Neural Network Information\n\
         ==========================\n\
         Layers: {}\n\
         Total Connections: {}\n\
         Network Type: Feed Forward\n\
         \n\
         Layer Configuration:\n",
        network.layers.len(),
        network.get_total_connections()
    );
    
    file.write_all(info.as_bytes())?;
    
    for (i, layer) in network.layers.iter().enumerate() {
        let layer_info = format!(
            "Layer {}: {} neurons\n",
            i,
            layer.neurons.len()
        );
        file.write_all(layer_info.as_bytes())?;
    }
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::NetworkBuilder;
    
    #[test]
    fn test_export_network_info() {
        let network = NetworkBuilder::new()
            .layers(&[2, 3, 1])
            .build();
            
        let temp_path = std::env::temp_dir().join("test_network_info.txt");
        
        let result = export_network_info(&network, &temp_path);
        assert!(result.is_ok());
        
        // Clean up
        let _ = std::fs::remove_file(&temp_path);
    }
    
    #[cfg(feature = "io")]
    #[test]
    fn test_save_load_network() {
        let network = NetworkBuilder::new()
            .layers(&[2, 3, 1])
            .build();
            
        let temp_path = std::env::temp_dir().join("test_network.bin");
        
        // Save network
        let save_result = save_network(&network, &temp_path);
        assert!(save_result.is_ok());
        
        // Load network
        let loaded_network: Result<Network<f32>, _> = load_network(&temp_path);
        assert!(loaded_network.is_ok());
        
        // Clean up
        let _ = std::fs::remove_file(&temp_path);
    }
}