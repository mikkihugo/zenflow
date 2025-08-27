//! Loss functions for neural network training

use ndarray::Array1;

/// Loss function enumeration
#[derive(Debug, Clone, Copy)]
pub enum LossFunction {
    MeanSquaredError,
    MeanAbsoluteError,
    CrossEntropy,
    BinaryCrossEntropy,
    Huber(f32),
}

impl LossFunction {
    /// Compute loss value
    pub fn compute(&self, predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        match self {
            LossFunction::MeanSquaredError => {
                let diff = predictions - targets;
                diff.mapv(|x| x * x).mean().unwrap()
            },
            LossFunction::MeanAbsoluteError => {
                let diff = predictions - targets;
                diff.mapv(|x| x.abs()).mean().unwrap()
            },
            LossFunction::CrossEntropy => {
                let mut loss = 0.0;
                for (pred, target) in predictions.iter().zip(targets.iter()) {
                    loss -= target * pred.ln();
                }
                loss / predictions.len() as f32
            },
            LossFunction::BinaryCrossEntropy => {
                let mut loss = 0.0;
                for (pred, target) in predictions.iter().zip(targets.iter()) {
                    let p = pred.max(1e-7).min(1.0 - 1e-7); // Clip to avoid log(0)
                    loss -= target * p.ln() + (1.0 - target) * (1.0 - p).ln();
                }
                loss / predictions.len() as f32
            },
            LossFunction::Huber(delta) => {
                let diff = predictions - targets;
                let mut loss = 0.0;
                for &d in diff.iter() {
                    let abs_d = d.abs();
                    if abs_d <= *delta {
                        loss += 0.5 * d * d;
                    } else {
                        loss += delta * (abs_d - 0.5 * delta);
                    }
                }
                loss / predictions.len() as f32
            },
        }
    }

    /// Compute gradient of loss with respect to predictions
    pub fn gradient(&self, predictions: &Array1<f32>, targets: &Array1<f32>) -> Array1<f32> {
        match self {
            LossFunction::MeanSquaredError => {
                2.0 * (predictions - targets) / predictions.len() as f32
            },
            LossFunction::MeanAbsoluteError => {
                let diff = predictions - targets;
                diff.mapv(|x| if x > 0.0 { 1.0 } else if x < 0.0 { -1.0 } else { 0.0 }) / predictions.len() as f32
            },
            LossFunction::CrossEntropy => {
                // For softmax cross-entropy: gradient = predictions - targets
                predictions - targets
            },
            LossFunction::BinaryCrossEntropy => {
                let mut gradient = Array1::zeros(predictions.len());
                for (i, (pred, target)) in predictions.iter().zip(targets.iter()).enumerate() {
                    let p = pred.max(1e-7).min(1.0 - 1e-7); // Clip to avoid division by 0
                    gradient[i] = (-target / p + (1.0 - target) / (1.0 - p)) / predictions.len() as f32;
                }
                gradient
            },
            LossFunction::Huber(delta) => {
                let diff = predictions - targets;
                let mut gradient = Array1::zeros(predictions.len());
                for (i, &d) in diff.iter().enumerate() {
                    if d.abs() <= *delta {
                        gradient[i] = d;
                    } else {
                        gradient[i] = delta * d.signum();
                    }
                }
                gradient / predictions.len() as f32
            },
        }
    }
}

/// Mean Squared Error loss
pub struct MSELoss;

impl MSELoss {
    pub fn new() -> Self {
        Self
    }

    pub fn forward(&self, predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        LossFunction::MeanSquaredError.compute(predictions, targets)
    }

    pub fn backward(&self, predictions: &Array1<f32>, targets: &Array1<f32>) -> Array1<f32> {
        LossFunction::MeanSquaredError.gradient(predictions, targets)
    }
}

/// Cross Entropy loss
pub struct CrossEntropyLoss;

impl CrossEntropyLoss {
    pub fn new() -> Self {
        Self
    }

    pub fn forward(&self, predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        LossFunction::CrossEntropy.compute(predictions, targets)
    }

    pub fn backward(&self, predictions: &Array1<f32>, targets: &Array1<f32>) -> Array1<f32> {
        LossFunction::CrossEntropy.gradient(predictions, targets)
    }
}

impl Default for MSELoss {
    fn default() -> Self {
        Self::new()
    }
}

impl Default for CrossEntropyLoss {
    fn default() -> Self {
        Self::new()
    }
}