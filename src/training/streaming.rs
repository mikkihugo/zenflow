//! Streaming training algorithms for large datasets
//!
//! This module provides training algorithms optimized for datasets that don't fit in memory.
//! It leverages the streaming I/O capabilities to process data in chunks while maintaining
//! training effectiveness.

use super::*;
use crate::io::streaming::{TrainingDataStreamReader, StreamStats, memory};
use num_traits::Float;
use std::io::BufRead;

/// Streaming batch backpropagation for large datasets
pub struct StreamingBatchBackprop<T: Float + Send + Default> {
    learning_rate: T,
    momentum: T,
    error_function: Box<dyn ErrorFunction<T>>,
    previous_weight_deltas: Vec<Vec<T>>,
    previous_bias_deltas: Vec<Vec<T>>,
    callback: Option<TrainingCallback<T>>,
    streaming_config: StreamingConfig,
}

impl<T: Float + Send + Default> StreamingBatchBackprop<T> {
    /// Create a new streaming batch backpropagation trainer
    pub fn new(learning_rate: T) -> Self {
        Self {
            learning_rate,
            momentum: T::zero(),
            error_function: Box::new(MseError),
            previous_weight_deltas: Vec::new(),
            previous_bias_deltas: Vec::new(),
            callback: None,
            streaming_config: StreamingConfig {
                buffer_size: 8192,
                batch_size: 100,
                memory_limit_bytes: 128 * 1024 * 1024, // 128MB default
                adaptive_batching: true,
            },
        }
    }

    /// Configure streaming parameters
    pub fn with_streaming_config(mut self, config: StreamingConfig) -> Self {
        self.streaming_config = config;
        self
    }

    /// Set momentum
    pub fn with_momentum(mut self, momentum: T) -> Self {
        self.momentum = momentum;
        self
    }

    /// Set error function
    pub fn with_error_function(mut self, error_function: Box<dyn ErrorFunction<T>>) -> Self {
        self.error_function = error_function;
        self
    }

    /// Train on streaming data from a reader
    pub fn train_streaming<R: BufRead>(&mut self, network: &mut Network<T>, reader: &mut R) 
        -> Result<(T, StreamStats), TrainingError> 
    where
        T: Copy,
    {
        self.train_streaming_epoch(network, reader, self.streaming_config.clone())
    }

    /// Get current streaming configuration
    pub fn get_streaming_config(&self) -> &StreamingConfig {
        &self.streaming_config
    }

    /// Calculate memory requirements for given dataset parameters
    pub fn calculate_memory_requirements(&self, num_input: usize, num_output: usize, samples: usize) -> MemoryRequirements {
        let sample_memory = memory::estimate_batch_memory(1, num_input, num_output);
        let optimal_batch = memory::optimal_batch_size(
            self.streaming_config.memory_limit_bytes, 
            num_input, 
            num_output
        );
        
        MemoryRequirements {
            bytes_per_sample: sample_memory,
            optimal_batch_size: optimal_batch,
            estimated_total_memory: sample_memory * samples,
            batches_needed: (samples + optimal_batch - 1) / optimal_batch,
            memory_efficiency_ratio: optimal_batch as f64 * sample_memory as f64 / self.streaming_config.memory_limit_bytes as f64,
        }
    }

    fn initialize_deltas(&mut self, network: &Network<T>) {
        if self.previous_weight_deltas.is_empty() {
            self.previous_weight_deltas = network
                .layers
                .iter()
                .skip(1) // Skip input layer
                .map(|layer| {
                    let num_neurons = layer.neurons.len();
                    let num_connections = if layer.neurons.is_empty() {
                        0
                    } else {
                        layer.neurons[0].connections.len()
                    };
                    vec![T::zero(); num_neurons * num_connections]
                })
                .collect();
            self.previous_bias_deltas = network
                .layers
                .iter()
                .skip(1) // Skip input layer
                .map(|layer| vec![T::zero(); layer.neurons.len()])
                .collect();
        }
    }
}

/// Memory requirements analysis for streaming training
#[derive(Debug, Clone)]
pub struct MemoryRequirements {
    /// Bytes required per training sample
    pub bytes_per_sample: usize,
    /// Optimal batch size for memory constraints
    pub optimal_batch_size: usize,
    /// Estimated total memory needed for full dataset
    pub estimated_total_memory: usize,
    /// Number of batches needed for processing
    pub batches_needed: usize,
    /// Memory efficiency (0.0 to 1.0, where 1.0 = perfect utilization)
    pub memory_efficiency_ratio: f64,
}

impl<T: Float + Send + Default + Copy> super::StreamingTrainingAlgorithm<T> for StreamingBatchBackprop<T> {}

impl<T: Float + Send + Default> TrainingAlgorithm<T> for StreamingBatchBackprop<T> {
    fn train_epoch(
        &mut self,
        network: &mut Network<T>,
        data: &TrainingData<T>,
    ) -> Result<T, TrainingError> {
        // Delegate to regular batch backprop for in-memory data
        let mut batch_trainer = super::BatchBackprop::new(self.learning_rate)
            .with_momentum(self.momentum);
        
        batch_trainer.train_epoch(network, data)
    }

    fn calculate_error(&self, network: &Network<T>, data: &TrainingData<T>) -> T {
        let mut total_error = T::zero();
        let mut network_clone = network.clone();

        for (input, desired_output) in data.inputs.iter().zip(data.outputs.iter()) {
            let output = network_clone.run(input);
            total_error = total_error + self.error_function.calculate(&output, desired_output);
        }

        total_error / T::from(data.inputs.len()).unwrap()
    }

    fn count_bit_fails(
        &self,
        network: &Network<T>,
        data: &TrainingData<T>,
        bit_fail_limit: T,
    ) -> usize {
        let mut bit_fails = 0;
        let mut network_clone = network.clone();

        for (input, desired_output) in data.inputs.iter().zip(data.outputs.iter()) {
            let output = network_clone.run(input);
            for (&actual, &desired) in output.iter().zip(desired_output.iter()) {
                if (actual - desired).abs() > bit_fail_limit {
                    bit_fails += 1;
                }
            }
        }

        bit_fails
    }

    fn save_state(&self) -> TrainingState<T> {
        let mut state = std::collections::HashMap::new();
        state.insert("learning_rate".to_string(), vec![self.learning_rate]);
        state.insert("momentum".to_string(), vec![self.momentum]);

        TrainingState {
            epoch: 0,
            best_error: T::from(f32::MAX).unwrap(),
            algorithm_specific: state,
        }
    }

    fn restore_state(&mut self, state: TrainingState<T>) {
        if let Some(lr) = state.algorithm_specific.get("learning_rate") {
            if !lr.is_empty() {
                self.learning_rate = lr[0];
            }
        }
        if let Some(mom) = state.algorithm_specific.get("momentum") {
            if !mom.is_empty() {
                self.momentum = mom[0];
            }
        }
    }

    fn set_callback(&mut self, callback: TrainingCallback<T>) {
        self.callback = Some(callback);
    }

    fn call_callback(
        &mut self,
        epoch: usize,
        network: &Network<T>,
        data: &TrainingData<T>,
    ) -> bool {
        let error = self.calculate_error(network, data);
        if let Some(ref mut callback) = self.callback {
            callback(epoch, error)
        } else {
            true
        }
    }
}

/// Utilities for streaming training
pub mod utils {
    use super::*;
    use std::fs::File;
    use std::io::BufReader;

    /// Train a network on a large dataset file using streaming
    pub fn train_from_file<T: Float + Send + Default + Copy>(
        network: &mut crate::Network<T>,
        file_path: &str,
        config: StreamingConfig,
        epochs: usize,
    ) -> Result<Vec<(T, StreamStats)>, TrainingError> {
        let mut trainer = StreamingBatchBackprop::new(T::from(0.01).unwrap())
            .with_streaming_config(config);

        let mut results = Vec::new();

        for epoch in 0..epochs {
            let file = File::open(file_path)
                .map_err(|e| TrainingError::TrainingFailed(format!("File error: {}", e)))?;
            let mut reader = BufReader::new(file);

            let (error, stats) = trainer.train_streaming(network, &mut reader)?;
            results.push((error, stats));

            println!("Epoch {}: Error = {:.6}, Samples = {}, Bytes = {}", 
                     epoch + 1, 
                     error.to_f64().unwrap_or(0.0), 
                     stats.samples_processed, 
                     stats.bytes_read);

            // Call callback if training should stop
            if !trainer.call_callback(epoch, network, &TrainingData { inputs: vec![], outputs: vec![] }) {
                break;
            }
        }

        Ok(results)
    }

    /// Analyze memory requirements for a dataset file
    pub fn analyze_dataset_memory<T: Float + Send + Default>(
        file_path: &str,
        config: &StreamingConfig,
    ) -> Result<MemoryRequirements, TrainingError> {
        let file = File::open(file_path)
            .map_err(|e| TrainingError::TrainingFailed(format!("File error: {}", e)))?;
        let mut reader = BufReader::new(file);

        // Read just the header to get dimensions
        let mut line = String::new();
        reader.read_line(&mut line)
            .map_err(|e| TrainingError::TrainingFailed(format!("Read error: {}", e)))?;

        let header_parts: Vec<&str> = line.split_whitespace().collect();
        if header_parts.len() != 3 {
            return Err(TrainingError::InvalidData(
                "Header must contain exactly 3 numbers".to_string(),
            ));
        }

        let num_data: usize = header_parts[0].parse()
            .map_err(|_| TrainingError::InvalidData("Invalid data count".to_string()))?;
        let num_input: usize = header_parts[1].parse()
            .map_err(|_| TrainingError::InvalidData("Invalid input count".to_string()))?;
        let num_output: usize = header_parts[2].parse()
            .map_err(|_| TrainingError::InvalidData("Invalid output count".to_string()))?;

        let trainer = StreamingBatchBackprop::<T>::new(T::from(0.01).unwrap())
            .with_streaming_config(config.clone());

        Ok(trainer.calculate_memory_requirements(num_input, num_output, num_data))
    }
}