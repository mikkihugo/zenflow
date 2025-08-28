//! Metrics for evaluating neural network performance

use ndarray::Array1;

/// Evaluation metrics for neural networks
#[derive(Debug, Clone)]
pub struct Metrics {
    pub accuracy: Option<f32>,
    pub precision: Option<f32>,
    pub recall: Option<f32>,
    pub f1_score: Option<f32>,
    pub mse: Option<f32>,
    pub mae: Option<f32>,
    pub r2_score: Option<f32>,
}

impl Metrics {
    pub fn new() -> Self {
        Self {
            accuracy: None,
            precision: None,
            recall: None,
            f1_score: None,
            mse: None,
            mae: None,
            r2_score: None,
        }
    }

    /// Calculate classification accuracy
    pub fn accuracy(predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        let correct = predictions
            .iter()
            .zip(targets.iter())
            .filter(|(&pred, &target)| (pred.round() - target).abs() < 1e-6)
            .count();
        correct as f32 / predictions.len() as f32
    }

    /// Calculate mean squared error
    pub fn mse(predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        let diff = predictions - targets;
        diff.mapv(|x| x * x).mean().unwrap()
    }

    /// Calculate mean absolute error
    pub fn mae(predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        let diff = predictions - targets;
        diff.mapv(|x| x.abs()).mean().unwrap()
    }

    /// Calculate R² (coefficient of determination)
    pub fn r2_score(predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        let target_mean = targets.mean().unwrap();
        let ss_res = predictions
            .iter()
            .zip(targets.iter())
            .map(|(&pred, &target)| (target - pred).powi(2))
            .sum::<f32>();
        let ss_tot = targets
            .iter()
            .map(|&target| (target - target_mean).powi(2))
            .sum::<f32>();
        
        if ss_tot == 0.0 {
            1.0 // Perfect prediction if variance is zero
        } else {
            1.0 - (ss_res / ss_tot)
        }
    }

    /// Calculate precision for binary classification
    pub fn precision(predictions: &Array1<f32>, targets: &Array1<f32>, threshold: f32) -> f32 {
        let mut true_positive = 0;
        let mut false_positive = 0;

        for (&pred, &target) in predictions.iter().zip(targets.iter()) {
            let pred_class = if pred >= threshold { 1.0 } else { 0.0 };
            let target_class = if target >= 0.5 { 1.0 } else { 0.0 };

            if pred_class == 1.0 && target_class == 1.0 {
                true_positive += 1;
            } else if pred_class == 1.0 && target_class == 0.0 {
                false_positive += 1;
            }
        }

        if true_positive + false_positive == 0 {
            0.0
        } else {
            true_positive as f32 / (true_positive + false_positive) as f32
        }
    }

    /// Calculate recall for binary classification
    pub fn recall(predictions: &Array1<f32>, targets: &Array1<f32>, threshold: f32) -> f32 {
        let mut true_positive = 0;
        let mut false_negative = 0;

        for (&pred, &target) in predictions.iter().zip(targets.iter()) {
            let pred_class = if pred >= threshold { 1.0 } else { 0.0 };
            let target_class = if target >= 0.5 { 1.0 } else { 0.0 };

            if pred_class == 1.0 && target_class == 1.0 {
                true_positive += 1;
            } else if pred_class == 0.0 && target_class == 1.0 {
                false_negative += 1;
            }
        }

        if true_positive + false_negative == 0 {
            0.0
        } else {
            true_positive as f32 / (true_positive + false_negative) as f32
        }
    }

    /// Calculate F1 score
    pub fn f1_score(predictions: &Array1<f32>, targets: &Array1<f32>, threshold: f32) -> f32 {
        let precision = Self::precision(predictions, targets, threshold);
        let recall = Self::recall(predictions, targets, threshold);

        if precision + recall == 0.0 {
            0.0
        } else {
            2.0 * precision * recall / (precision + recall)
        }
    }

    /// Calculate root mean squared error
    pub fn rmse(predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        Self::mse(predictions, targets).sqrt()
    }

    /// Calculate mean absolute percentage error
    pub fn mape(predictions: &Array1<f32>, targets: &Array1<f32>) -> f32 {
        let mut mape = 0.0;
        let mut count = 0;

        for (&pred, &target) in predictions.iter().zip(targets.iter()) {
            if target.abs() > 1e-6 {
                mape += ((target - pred) / target).abs();
                count += 1;
            }
        }

        if count == 0 {
            0.0
        } else {
            100.0 * mape / count as f32
        }
    }
}

impl Default for Metrics {
    fn default() -> Self {
        Self::new()
    }
}

/// Metric tracker for training
#[derive(Debug)]
pub struct MetricTracker {
    pub train_losses: Vec<f32>,
    pub val_losses: Vec<f32>,
    pub train_accuracies: Vec<f32>,
    pub val_accuracies: Vec<f32>,
}

impl MetricTracker {
    pub fn new() -> Self {
        Self {
            train_losses: Vec::new(),
            val_losses: Vec::new(),
            train_accuracies: Vec::new(),
            val_accuracies: Vec::new(),
        }
    }

    pub fn record_epoch(&mut self, train_loss: f32, val_loss: Option<f32>, train_acc: Option<f32>, val_acc: Option<f32>) {
        self.train_losses.push(train_loss);
        if let Some(loss) = val_loss {
            self.val_losses.push(loss);
        }
        if let Some(acc) = train_acc {
            self.train_accuracies.push(acc);
        }
        if let Some(acc) = val_acc {
            self.val_accuracies.push(acc);
        }
    }

    pub fn best_val_loss(&self) -> Option<f32> {
        self.val_losses.iter().fold(None, |acc, &loss| {
            match acc {
                None => Some(loss),
                Some(best) => Some(best.min(loss)),
            }
        })
    }

    pub fn best_val_accuracy(&self) -> Option<f32> {
        self.val_accuracies.iter().fold(None, |acc, &accuracy| {
            match acc {
                None => Some(accuracy),
                Some(best) => Some(best.max(accuracy)),
            }
        })
    }
}

impl Default for MetricTracker {
    fn default() -> Self {
        Self::new()
    }
}