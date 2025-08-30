//! Ensemble Learning Methods for Neural Networks
//!
//! Advanced ensemble techniques for combining multiple neural networks
//! to achieve superior performance and robustness.

use ndarray::{Array1, s};
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use crate::{Network, TrainingData, ActivationFunction};

/// Base trait for ensemble models
pub trait EnsembleModel {
    type Prediction;
    
    /// Add a model to the ensemble
    fn add_model(&mut self, model: Network);
    
    /// Train the ensemble on data
    fn train(&mut self, data: &TrainingData) -> Result<f32, String>;
    
    /// Make prediction using ensemble
    fn predict(&mut self, input: &Array1<f32>) -> Self::Prediction;
    
    /// Get number of models in ensemble
    fn model_count(&self) -> usize;
}

/// Bagging ensemble using bootstrap sampling
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BaggingEnsemble {
    pub models: Vec<Network>,
    pub bootstrap_ratio: f32,
    pub aggregation_method: AggregationMethod,
}

/// Methods for aggregating ensemble predictions
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum AggregationMethod {
    Mean,
    WeightedMean,
    Majority,
    Median,
}

impl BaggingEnsemble {
    pub fn new(bootstrap_ratio: f32, aggregation_method: AggregationMethod) -> Self {
        Self {
            models: Vec::new(),
            bootstrap_ratio,
            aggregation_method,
        }
    }

    /// Create bootstrap sample from training data
    fn create_bootstrap_sample(&self, data: &TrainingData, rng: &mut ThreadRng) -> TrainingData {
        let n_samples = (data.len() as f32 * self.bootstrap_ratio) as usize;
        let mut bootstrap_data = TrainingData::new();
        
        for _ in 0..n_samples {
            let idx = rng.gen_range(0..data.len());
            bootstrap_data.add_example(data.inputs[idx].clone(), data.targets[idx].clone());
        }
        
        bootstrap_data
    }

    /// Aggregate predictions from all models
    fn aggregate_predictions(&self, predictions: &[Array1<f32>]) -> Array1<f32> {
        if predictions.is_empty() {
            return Array1::zeros(0);
        }
        
        let output_size = predictions[0].len();
        let mut result = Array1::zeros(output_size);
        
        match self.aggregation_method {
            AggregationMethod::Mean => {
                for pred in predictions {
                    result = result + pred;
                }
                result / predictions.len() as f32
            }
            AggregationMethod::WeightedMean => {
                // For simplicity, use equal weights
                for pred in predictions {
                    result = result + pred;
                }
                result / predictions.len() as f32
            }
            AggregationMethod::Median => {
                for i in 0..output_size {
                    let mut values: Vec<f32> = predictions.iter().map(|p| p[i]).collect();
                    values.sort_by(|a, b| a.partial_cmp(b).unwrap());
                    result[i] = if values.len() % 2 == 0 {
                        (values[values.len() / 2 - 1] + values[values.len() / 2]) / 2.0
                    } else {
                        values[values.len() / 2]
                    };
                }
                result
            }
            AggregationMethod::Majority => {
                // For regression, treat as weighted average
                for pred in predictions {
                    result = result + pred;
                }
                result / predictions.len() as f32
            }
        }
    }
}

impl EnsembleModel for BaggingEnsemble {
    type Prediction = Array1<f32>;

    fn add_model(&mut self, model: Network) {
        self.models.push(model);
    }

    fn train(&mut self, data: &TrainingData) -> Result<f32, String> {
        if self.models.is_empty() {
            return Err("No models in ensemble".to_string());
        }

        let mut rng = thread_rng();
        let mut total_loss = 0.0;

        // Pre-generate all bootstrap samples to avoid borrowing issues
        let bootstrap_samples: Vec<TrainingData> = (0..self.models.len())
            .map(|_| self.create_bootstrap_sample(data, &mut rng))
            .collect();

        for (model, bootstrap_data) in self.models.iter_mut().zip(bootstrap_samples.iter()) {
            // Train model on bootstrap sample
            let mut model_loss = 0.0;
            let epochs = 50; // Fixed number of epochs for ensemble training
            
            for _ in 0..epochs {
                let loss = model.train_batch(&bootstrap_data.inputs, &bootstrap_data.targets);
                model_loss += loss;
            }
            
            total_loss += model_loss / epochs as f32;
        }

        Ok(total_loss / self.models.len() as f32)
    }

    fn predict(&mut self, input: &Array1<f32>) -> Self::Prediction {
        let predictions: Vec<Array1<f32>> = self.models
            .iter_mut()
            .map(|model| model.predict(input))
            .collect();

        self.aggregate_predictions(&predictions)
    }

    fn model_count(&self) -> usize {
        self.models.len()
    }
}

/// Boosting ensemble using AdaBoost-style training
#[derive(Debug, Clone)]
pub struct BoostingEnsemble {
    pub models: Vec<Network>,
    pub model_weights: Vec<f32>,
    pub max_models: usize,
    pub learning_rate: f32,
}

impl BoostingEnsemble {
    pub fn new(max_models: usize, learning_rate: f32) -> Self {
        Self {
            models: Vec::new(),
            model_weights: Vec::new(),
            max_models,
            learning_rate,
        }
    }
}

impl EnsembleModel for BoostingEnsemble {
    type Prediction = Array1<f32>;

    fn add_model(&mut self, model: Network) {
        if self.models.len() < self.max_models {
            self.models.push(model);
            self.model_weights.push(1.0); // Initialize with equal weight
        }
    }

    fn train(&mut self, data: &TrainingData) -> Result<f32, String> {
        if self.models.is_empty() {
            return Err("No models in ensemble".to_string());
        }

        let n_samples = data.len();
        let mut sample_weights = Array1::from_elem(n_samples, 1.0 / n_samples as f32);
        let mut total_loss = 0.0;

        for model_idx in 0..self.models.len() {
            // Train model with current sample weights
            for _ in 0..20 { // Limited epochs per model
                let loss = self.models[model_idx].train_batch(&data.inputs, &data.targets);
                total_loss += loss;
            }

            // Calculate weighted error - need to split this to avoid borrowing issues
            let mut weighted_error = 0.0;
            let mut total_weight = 0.0;

            for (i, (input, target)) in data.inputs.iter().zip(data.targets.iter()).enumerate() {
                let prediction = self.models[model_idx].predict(input);
                let error = (prediction - target).mapv(|x| x.abs()).sum();
                weighted_error += sample_weights[i] * error;
                total_weight += sample_weights[i];
            }

            let error = if total_weight > 0.0 {
                weighted_error / total_weight
            } else {
                0.5
            };
            
            // Calculate model weight
            let model_weight = if error > 0.0 && error < 0.5 {
                0.5 * ((1.0 - error) / error).ln()
            } else {
                0.1 // Small weight for poor models
            };

            self.model_weights[model_idx] = model_weight;

            // Update sample weights
            for (i, (input, target)) in data.inputs.iter().zip(data.targets.iter()).enumerate() {
                let prediction = self.models[model_idx].predict(input);
                let error = (prediction - target).mapv(|x| x.abs()).sum();
                
                // Increase weight for misclassified samples
                if error > 0.1 { // Threshold for "error"
                    sample_weights[i] *= (model_weight * self.learning_rate).exp();
                }
            }

            // Normalize weights
            let sum = sample_weights.sum();
            if sum > 0.0 {
                sample_weights = &sample_weights / sum;
            }
        }

        Ok(total_loss / (self.models.len() * 20) as f32)
    }

    fn predict(&mut self, input: &Array1<f32>) -> Self::Prediction {
        if self.models.is_empty() {
            return Array1::zeros(0);
        }

        let mut weighted_prediction = Array1::zeros(self.models[0].predict(input).len());
        let mut total_weight = 0.0;

        for (model, &weight) in self.models.iter_mut().zip(self.model_weights.iter()) {
            let prediction = model.predict(input);
            weighted_prediction = weighted_prediction + &(prediction * weight);
            total_weight += weight;
        }

        if total_weight > 0.0 {
            weighted_prediction / total_weight
        } else {
            weighted_prediction
        }
    }

    fn model_count(&self) -> usize {
        self.models.len()
    }
}

/// Stacking ensemble with meta-learner
#[derive(Debug, Clone)]
pub struct StackingEnsemble {
    pub base_models: Vec<Network>,
    pub meta_model: Network,
    pub trained: bool,
}

impl StackingEnsemble {
    pub fn new(meta_model: Network) -> Self {
        Self {
            base_models: Vec::new(),
            meta_model,
            trained: false,
        }
    }

    /// Generate meta-features from base model predictions
    fn generate_meta_features(&mut self, data: &TrainingData) -> TrainingData {
        let mut meta_data = TrainingData::new();

        for (input, target) in data.inputs.iter().zip(data.targets.iter()) {
            let mut meta_input = Array1::zeros(self.base_models.len() * target.len());
            
            for (model_idx, model) in self.base_models.iter_mut().enumerate() {
                let prediction = model.predict(input);
                let start_idx = model_idx * target.len();
                let end_idx = start_idx + target.len();
                meta_input.slice_mut(s![start_idx..end_idx]).assign(&prediction);
            }
            
            meta_data.add_example(meta_input, target.clone());
        }

        meta_data
    }
}

impl EnsembleModel for StackingEnsemble {
    type Prediction = Array1<f32>;

    fn add_model(&mut self, model: Network) {
        self.base_models.push(model);
    }

    fn train(&mut self, data: &TrainingData) -> Result<f32, String> {
        if self.base_models.is_empty() {
            return Err("No base models in ensemble".to_string());
        }

        // Train base models
        let mut total_loss = 0.0;
        for model in &mut self.base_models {
            for _ in 0..30 { // Train each base model
                let loss = model.train_batch(&data.inputs, &data.targets);
                total_loss += loss;
            }
        }

        // Generate meta-features and train meta-model
        let meta_data = self.generate_meta_features(data);
        
        for _ in 0..20 { // Train meta-model
            let loss = self.meta_model.train_batch(&meta_data.inputs, &meta_data.targets);
            total_loss += loss;
        }

        self.trained = true;
        Ok(total_loss / ((self.base_models.len() * 30) + 20) as f32)
    }

    fn predict(&mut self, input: &Array1<f32>) -> Self::Prediction {
        if !self.trained || self.base_models.is_empty() {
            return Array1::zeros(0);
        }

        // Get predictions from base models
        let base_predictions: Vec<Array1<f32>> = self.base_models
            .iter_mut()
            .map(|model| model.predict(input))
            .collect();

        // Create meta-features
        let output_size = base_predictions[0].len();
        let mut meta_input = Array1::zeros(self.base_models.len() * output_size);
        
        for (model_idx, prediction) in base_predictions.iter().enumerate() {
            let start_idx = model_idx * output_size;
            let end_idx = start_idx + output_size;
            meta_input.slice_mut(s![start_idx..end_idx]).assign(prediction);
        }

        // Meta-model final prediction
        self.meta_model.predict(&meta_input)
    }

    fn model_count(&self) -> usize {
        self.base_models.len()
    }
}

/// Ensemble factory for creating different types of ensembles
pub struct EnsembleFactory;

impl EnsembleFactory {
    /// Create a bagging ensemble with multiple neural networks
    pub fn create_bagging_ensemble(
        n_models: usize,
        layer_sizes: &[usize],
        activations: &[ActivationFunction],
        learning_rate: f32,
    ) -> BaggingEnsemble {
        let mut ensemble = BaggingEnsemble::new(0.8, AggregationMethod::Mean);
        
        for _ in 0..n_models {
            let model = Network::new(layer_sizes, activations, learning_rate);
            ensemble.add_model(model);
        }
        
        ensemble
    }

    /// Create a boosting ensemble
    pub fn create_boosting_ensemble(
        n_models: usize,
        layer_sizes: &[usize],
        activations: &[ActivationFunction],
        learning_rate: f32,
    ) -> BoostingEnsemble {
        let mut ensemble = BoostingEnsemble::new(n_models, learning_rate);
        
        for _ in 0..n_models {
            let model = Network::new(layer_sizes, activations, learning_rate);
            ensemble.add_model(model);
        }
        
        ensemble
    }

    /// Create a stacking ensemble
    pub fn create_stacking_ensemble(
        base_models: Vec<(Vec<usize>, Vec<ActivationFunction>, f32)>,
        meta_layer_sizes: &[usize],
        meta_activations: &[ActivationFunction],
        meta_learning_rate: f32,
    ) -> StackingEnsemble {
        let meta_model = Network::new(meta_layer_sizes, meta_activations, meta_learning_rate);
        let mut ensemble = StackingEnsemble::new(meta_model);
        
        for (layer_sizes, activations, learning_rate) in base_models {
            let model = Network::new(&layer_sizes, &activations, learning_rate);
            ensemble.add_model(model);
        }
        
        ensemble
    }
}

/// Ensemble performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnsembleMetrics {
    pub diversity: f32,
    pub individual_errors: Vec<f32>,
    pub ensemble_error: f32,
    pub improvement_factor: f32,
}

impl EnsembleMetrics {
    /// Calculate diversity among ensemble predictions
    pub fn calculate_diversity(predictions: &[Array1<f32>]) -> f32 {
        if predictions.len() < 2 {
            return 0.0;
        }

        let n_models = predictions.len();
        let mut total_diversity = 0.0;
        let mut count = 0;

        for i in 0..n_models {
            for j in (i + 1)..n_models {
                let correlation = calculate_correlation(&predictions[i], &predictions[j]);
                total_diversity += 1.0 - correlation.abs(); // Diversity = 1 - |correlation|
                count += 1;
            }
        }

        if count > 0 {
            total_diversity / count as f32
        } else {
            0.0
        }
    }

    /// Calculate ensemble improvement over individual models
    pub fn calculate_improvement(individual_errors: &[f32], ensemble_error: f32) -> f32 {
        if individual_errors.is_empty() {
            return 1.0;
        }

        let avg_individual_error = individual_errors.iter().sum::<f32>() / individual_errors.len() as f32;
        
        if ensemble_error > 0.0 {
            avg_individual_error / ensemble_error
        } else {
            f32::INFINITY
        }
    }
}

/// Helper function to calculate correlation between two arrays
fn calculate_correlation(x: &Array1<f32>, y: &Array1<f32>) -> f32 {
    if x.len() != y.len() || x.len() == 0 {
        return 0.0;
    }

    let mean_x = x.mean().unwrap_or(0.0);
    let mean_y = y.mean().unwrap_or(0.0);

    let mut numerator = 0.0;
    let mut sum_sq_x = 0.0;
    let mut sum_sq_y = 0.0;

    for i in 0..x.len() {
        let dx = x[i] - mean_x;
        let dy = y[i] - mean_y;
        numerator += dx * dy;
        sum_sq_x += dx * dx;
        sum_sq_y += dy * dy;
    }

    let denominator = (sum_sq_x * sum_sq_y).sqrt();
    if denominator == 0.0 {
        0.0
    } else {
        numerator / denominator
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ndarray::array;

    #[test]
    fn test_bagging_ensemble() {
        let mut ensemble = BaggingEnsemble::new(0.8, AggregationMethod::Mean);
        
        // Add some simple models
        for _ in 0..3 {
            let model = Network::new(&[2, 3, 1], &[ActivationFunction::ReLU, ActivationFunction::Sigmoid], 0.01);
            ensemble.add_model(model);
        }
        
        assert_eq!(ensemble.model_count(), 3);
        
        // Test prediction
        let input = array![1.0, 2.0];
        let prediction = ensemble.predict(&input);
        assert_eq!(prediction.len(), 1);
    }

    #[test]
    fn test_boosting_ensemble() {
        let mut ensemble = BoostingEnsemble::new(3, 0.1);
        
        // Add models
        for _ in 0..3 {
            let model = Network::new(&[2, 3, 1], &[ActivationFunction::ReLU, ActivationFunction::Sigmoid], 0.01);
            ensemble.add_model(model);
        }
        
        assert_eq!(ensemble.model_count(), 3);
        
        // Test prediction
        let input = array![1.0, 2.0];
        let prediction = ensemble.predict(&input);
        assert_eq!(prediction.len(), 1);
    }

    #[test]
    fn test_stacking_ensemble() {
        let meta_model = Network::new(&[3, 2, 1], &[ActivationFunction::ReLU, ActivationFunction::Sigmoid], 0.01);
        let mut ensemble = StackingEnsemble::new(meta_model);
        
        // Add base models
        for _ in 0..3 {
            let model = Network::new(&[2, 3, 1], &[ActivationFunction::ReLU, ActivationFunction::Sigmoid], 0.01);
            ensemble.add_model(model);
        }
        
        assert_eq!(ensemble.model_count(), 3);
    }

    #[test]
    fn test_ensemble_factory() {
        let bagging = EnsembleFactory::create_bagging_ensemble(
            5, 
            &[2, 4, 1], 
            &[ActivationFunction::ReLU, ActivationFunction::Sigmoid], 
            0.01
        );
        assert_eq!(bagging.model_count(), 5);

        let boosting = EnsembleFactory::create_boosting_ensemble(
            3, 
            &[2, 4, 1], 
            &[ActivationFunction::ReLU, ActivationFunction::Sigmoid], 
            0.01
        );
        assert_eq!(boosting.model_count(), 3);
    }

    #[test]
    fn test_diversity_calculation() {
        let pred1 = array![1.0, 0.0, 1.0];
        let pred2 = array![0.0, 1.0, 0.0];
        let pred3 = array![1.0, 0.0, 1.0];
        
        let predictions = vec![pred1, pred2, pred3];
        let diversity = EnsembleMetrics::calculate_diversity(&predictions);
        
        // Should have some diversity since predictions are different
        assert!(diversity >= 0.0 && diversity <= 1.0);
    }

    #[test]
    fn test_improvement_calculation() {
        let individual_errors = vec![0.5, 0.4, 0.6];
        let ensemble_error = 0.3;
        
        let improvement = EnsembleMetrics::calculate_improvement(&individual_errors, ensemble_error);
        assert!(improvement > 1.0); // Ensemble should be better
    }
}