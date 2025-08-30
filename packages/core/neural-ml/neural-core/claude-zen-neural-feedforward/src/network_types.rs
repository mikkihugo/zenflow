//! Neural network types for feedforward networks

/// Feedforward neural network structure
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct FeedforwardNetwork {
  pub num_layers: usize,
  pub learning_rate: f32,
  pub connection_rate: f32,
  pub layer_sizes: Vec<usize>,
  pub weights: Vec<f32>,
}

/// Training data structure for neural networks
#[derive(Debug, Clone, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct TrainingDataSet {
  pub num_data: usize,
  pub num_input: usize,
  pub num_output: usize,
  pub inputs: Vec<Vec<f32>>,
  pub outputs: Vec<Vec<f32>>,
}

impl FeedforwardNetwork {
  /// Create a new feedforward network with specified layer sizes
  pub fn new(layer_sizes: Vec<usize>, learning_rate: f32) -> Self {
    let num_layers = layer_sizes.len();
    let total_weights = layer_sizes.windows(2)
      .map(|window| window[0] * window[1])
      .sum::<usize>();
    
    Self {
      num_layers,
      learning_rate,
      connection_rate: 1.0, // Fully connected by default
      layer_sizes,
      weights: vec![0.0; total_weights],
    }
  }
  
  /// Initialize weights with random values
  pub fn initialize_random_weights(&mut self, range: f32) {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    
    for weight in &mut self.weights {
      *weight = rng.gen_range(-range..range);
    }
  }
}

impl TrainingDataSet {
  /// Create a new training dataset
  pub fn new(inputs: Vec<Vec<f32>>, outputs: Vec<Vec<f32>>) -> Result<Self, String> {
    if inputs.len() != outputs.len() {
      return Err("Input and output lengths must match".to_string());
    }
    
    if inputs.is_empty() {
      return Err("Training data cannot be empty".to_string());
    }
    
    let num_input = inputs[0].len();
    let num_output = outputs[0].len();
    
    // Validate all inputs have same size
    for input in &inputs {
      if input.len() != num_input {
        return Err("All inputs must have the same dimension".to_string());
      }
    }
    
    // Validate all outputs have same size
    for output in &outputs {
      if output.len() != num_output {
        return Err("All outputs must have the same dimension".to_string());
      }
    }
    
    Ok(Self {
      num_data: inputs.len(),
      num_input,
      num_output,
      inputs,
      outputs,
    })
  }
  
  /// Split the dataset into training and validation sets
  pub fn split(&self, train_ratio: f32) -> (Self, Self) {
    let train_size = ((self.num_data as f32) * train_ratio) as usize;
    
    let train_inputs = self.inputs[..train_size].to_vec();
    let train_outputs = self.outputs[..train_size].to_vec();
    
    let val_inputs = self.inputs[train_size..].to_vec();
    let val_outputs = self.outputs[train_size..].to_vec();
    
    let train_set = Self::new(train_inputs, train_outputs).unwrap();
    let val_set = Self::new(val_inputs, val_outputs).unwrap();
    
    (train_set, val_set)
  }
}
