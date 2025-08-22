/**
 * TaskFlow Predictor WASM Module
 * 
 * Lightweight Rust/WASM module for fast task flow predictions.
 * Provides bottleneck prediction and threshold optimization without
 * the overhead of full neural networks.
 */

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct BottleneckPrediction {
    pub state: String,
    pub probability: f32,
    pub time_to_bottleneck: f32,
    pub actions: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ThresholdOptimization {
    pub current: f32,
    pub recommended: f32,
    pub confidence: f32,
    pub reasoning: String,
}

#[wasm_bindgen]
pub struct TaskFlowPredictor {
    // Simple moving averages for prediction
    throughput_history: Vec<f32>,
    queue_history: Vec<f32>,
    approval_history: Vec<f32>,
    
    // Learning parameters
    learning_rate: f32,
    prediction_accuracy: f32,
}

#[wasm_bindgen]
impl TaskFlowPredictor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TaskFlowPredictor {
        TaskFlowPredictor {
            throughput_history: Vec::new(),
            queue_history: Vec::new(),
            approval_history: Vec::new(),
            learning_rate: 0.1,
            prediction_accuracy: 0.7,
        }
    }

    /// Predict bottleneck probability based on historical data
    #[wasm_bindgen]
    pub fn predict_bottleneck(
        &mut self,
        wip_usage: &[f32],
        queue_depth: &[f32],
        throughput: &[f32],
    ) -> JsValue {
        if wip_usage.is_empty() || queue_depth.is_empty() || throughput.is_empty() {
            return JsValue::NULL;
        }

        // Simple trend analysis
        let avg_usage = wip_usage.iter().sum::<f32>() / wip_usage.len() as f32;
        let queue_trend = self.calculate_trend(queue_depth);
        let throughput_trend = self.calculate_trend(throughput);
        
        // Bottleneck probability calculation
        let mut probability = avg_usage;
        
        // Increase probability if queue is growing
        if queue_trend > 0.1 {
            probability += 0.2;
        }
        
        // Increase probability if throughput is declining
        if throughput_trend < -0.1 {
            probability += 0.3;
        }
        
        probability = probability.min(0.95).max(0.0);
        
        // Time to bottleneck (in milliseconds)
        let time_to_bottleneck = if probability > 0.8 {
            (1.0 - probability) * 3600000.0 // Hours to milliseconds
        } else {
            f32::INFINITY
        };

        let prediction = BottleneckPrediction {
            state: "detected".to_string(),
            probability,
            time_to_bottleneck,
            actions: vec![
                "Increase WIP limits".to_string(),
                "Add reviewer capacity".to_string(),
                "Enable auto-approval".to_string(),
            ],
        };

        serde_wasm_bindgen::to_value(&prediction).unwrap_or(JsValue::NULL)
    }

    /// Optimize approval threshold based on historical human decisions
    #[wasm_bindgen]
    pub fn optimize_threshold(
        &mut self,
        confidence_values: &[f32],
        approval_decisions: &[u8], // 1 = approved, 0 = rejected
    ) -> JsValue {
        if confidence_values.len() != approval_decisions.len() || confidence_values.is_empty() {
            return JsValue::NULL;
        }

        // Calculate optimal threshold using simple statistical analysis
        let mut approved_confidences = Vec::new();
        let mut rejected_confidences = Vec::new();

        for (i, &decision) in approval_decisions.iter().enumerate() {
            if decision == 1 {
                approved_confidences.push(confidence_values[i]);
            } else {
                rejected_confidences.push(confidence_values[i]);
            }
        }

        if approved_confidences.is_empty() || rejected_confidences.is_empty() {
            return JsValue::NULL;
        }

        let avg_approved = approved_confidences.iter().sum::<f32>() / approved_confidences.len() as f32;
        let avg_rejected = rejected_confidences.iter().sum::<f32>() / rejected_confidences.len() as f32;

        // Optimal threshold is between average approved and rejected confidences
        let recommended = (avg_approved + avg_rejected) / 2.0;
        let recommended = recommended.max(0.5).min(0.95);

        let optimization = ThresholdOptimization {
            current: 0.8, // Default current threshold
            recommended,
            confidence: 0.8,
            reasoning: format!(
                "Based on {} decisions: approved avg {:.2}, rejected avg {:.2}",
                confidence_values.len(),
                avg_approved,
                avg_rejected
            ),
        };

        serde_wasm_bindgen::to_value(&optimization).unwrap_or(JsValue::NULL)
    }

    /// Learn from decision outcomes to improve future predictions
    #[wasm_bindgen]
    pub fn learn_from_decisions(
        &mut self,
        prediction_accuracy: &[u8], // 1 = accurate, 0 = inaccurate
        outcome_positive: &[u8],    // 1 = positive, 0 = negative
    ) {
        if prediction_accuracy.is_empty() || outcome_positive.is_empty() {
            return;
        }

        // Update learning parameters based on prediction accuracy
        let accuracy_rate = prediction_accuracy.iter()
            .map(|&x| x as f32)
            .sum::<f32>() / prediction_accuracy.len() as f32;

        // Adaptive learning rate
        if accuracy_rate > 0.8 {
            self.learning_rate *= 0.9; // Reduce learning rate if doing well
        } else {
            self.learning_rate *= 1.1; // Increase learning rate if struggling
        }

        self.learning_rate = self.learning_rate.max(0.01).min(0.5);
        self.prediction_accuracy = accuracy_rate;
    }

    /// Get current predictor status
    #[wasm_bindgen]
    pub fn get_status(&self) -> JsValue {
        let status = serde_json::json!({
            "learning_rate": self.learning_rate,
            "prediction_accuracy": self.prediction_accuracy,
            "data_points": self.throughput_history.len(),
            "status": "active"
        });

        JsValue::from_str(&status.to_string())
    }
}

impl TaskFlowPredictor {
    /// Calculate trend from time series data
    fn calculate_trend(&self, data: &[f32]) -> f32 {
        if data.len() < 2 {
            return 0.0;
        }

        let n = data.len() as f32;
        let sum_x: f32 = (0..data.len()).map(|i| i as f32).sum();
        let sum_y: f32 = data.iter().sum();
        let sum_xy: f32 = data.iter().enumerate()
            .map(|(i, &y)| i as f32 * y)
            .sum();
        let sum_x_squared: f32 = (0..data.len())
            .map(|i| (i as f32).powi(2))
            .sum();

        // Linear regression slope (trend)
        let denominator = n * sum_x_squared - sum_x.powi(2);
        if denominator.abs() < f32::EPSILON {
            return 0.0;
        }

        (n * sum_xy - sum_x * sum_y) / denominator
    }
}

// WASM module initialization
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}