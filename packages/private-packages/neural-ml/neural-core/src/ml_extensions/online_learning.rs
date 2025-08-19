//! # Online Learning Module
//!
//! Provides adaptive learning algorithms with concept drift detection
//! and continual learning capabilities for evolving environments.

use super::{MLError, MLResult, AsyncOptimizer, MemoryAware, GpuAccelerated, Serializable, monitoring::Timer};
use ndarray::{Array1, Array2, ArrayView1, Axis};
use num_traits::Float;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use std::sync::Arc;
use std::time::{Duration, Instant};
use rayon::prelude::*;

/// Types of concept drift
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DriftType {
    /// Sudden, abrupt change
    Sudden,
    /// Gradual, incremental change
    Gradual,
    /// Periodic, recurring change
    Periodic,
    /// Incremental drift over time
    Incremental,
}

/// Concept drift detection result
#[derive(Debug, Clone)]
pub struct DriftDetection {
    /// Whether drift was detected
    pub drift_detected: bool,
    /// Type of drift detected
    pub drift_type: Option<DriftType>,
    /// Confidence in drift detection
    pub confidence: f64,
    /// Timestamp of detection
    pub timestamp: Instant,
    /// Statistical significance
    pub p_value: f64,
    /// Change magnitude
    pub change_magnitude: f64,
}

/// Statistical test for concept drift detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StatisticalTest {
    /// Page-Hinkley test
    PageHinkley {
        threshold: f64,
        alpha: f64,
    },
    /// ADWIN (Adaptive Windowing)
    ADWIN {
        delta: f64,
        min_window_size: usize,
        max_window_size: usize,
    },
    /// Drift Detection Method (DDM)
    DDM {
        warning_level: f64,
        drift_level: f64,
        min_samples: usize,
    },
    /// Early Drift Detection Method (EDDM)
    EDDM {
        warning_level: f64,
        drift_level: f64,
        min_samples: usize,
    },
    /// Kolmogorov-Smirnov test
    KolmogorovSmirnov {
        window_size: usize,
        significance_level: f64,
    },
}

impl Default for StatisticalTest {
    fn default() -> Self {
        Self::PageHinkley {
            threshold: 10.0,
            alpha: 0.005,
        }
    }
}

/// Concept drift detector
#[derive(Debug)]
pub struct ConceptDriftDetector {
    /// Statistical test configuration
    test: StatisticalTest,
    /// Historical performance data
    performance_history: VecDeque<f64>,
    /// Current drift state
    drift_state: DriftState,
    /// Detection history
    detection_history: Vec<DriftDetection>,
    /// Statistics for different tests
    page_hinkley_stats: PageHinkleyStats,
    adwin_stats: ADWINStats,
    ddm_stats: DDMStats,
    eddm_stats: EDDMStats,
    ks_stats: KSStats,
}

/// Internal drift detection state
#[derive(Debug, Clone)]
enum DriftState {
    Stable,
    Warning,
    Drift,
}

/// Page-Hinkley test statistics
#[derive(Debug, Clone)]
struct PageHinkleyStats {
    cumulative_sum: f64,
    min_sum: f64,
    test_statistic: f64,
}

impl Default for PageHinkleyStats {
    fn default() -> Self {
        Self {
            cumulative_sum: 0.0,
            min_sum: 0.0,
            test_statistic: 0.0,
        }
    }
}

/// ADWIN test statistics
#[derive(Debug, Clone)]
struct ADWINStats {
    window: VecDeque<f64>,
    window_sum: f64,
    window_sum_sq: f64,
    total_count: usize,
}

impl Default for ADWINStats {
    fn default() -> Self {
        Self {
            window: VecDeque::new(),
            window_sum: 0.0,
            window_sum_sq: 0.0,
            total_count: 0,
        }
    }
}

/// DDM test statistics
#[derive(Debug, Clone)]
struct DDMStats {
    error_count: usize,
    sample_count: usize,
    min_p_plus_s: f64,
    p_i: f64,
    s_i: f64,
}

impl Default for DDMStats {
    fn default() -> Self {
        Self {
            error_count: 0,
            sample_count: 0,
            min_p_plus_s: f64::INFINITY,
            p_i: 0.0,
            s_i: 0.0,
        }
    }
}

/// EDDM test statistics
#[derive(Debug, Clone)]
struct EDDMStats {
    distances: VecDeque<usize>,
    mean_distance: f64,
    std_distance: f64,
    max_mean_plus_2std: f64,
}

impl Default for EDDMStats {
    fn default() -> Self {
        Self {
            distances: VecDeque::new(),
            mean_distance: 0.0,
            std_distance: 0.0,
            max_mean_plus_2std: 0.0,
        }
    }
}

/// Kolmogorov-Smirnov test statistics
#[derive(Debug, Clone)]
struct KSStats {
    reference_window: VecDeque<f64>,
    current_window: VecDeque<f64>,
}

impl Default for KSStats {
    fn default() -> Self {
        Self {
            reference_window: VecDeque::new(),
            current_window: VecDeque::new(),
        }
    }
}

impl ConceptDriftDetector {
    /// Create new concept drift detector
    pub fn new(test: StatisticalTest) -> Self {
        Self {
            test,
            performance_history: VecDeque::new(),
            drift_state: DriftState::Stable,
            detection_history: Vec::new(),
            page_hinkley_stats: PageHinkleyStats::default(),
            adwin_stats: ADWINStats::default(),
            ddm_stats: DDMStats::default(),
            eddm_stats: EDDMStats::default(),
            ks_stats: KSStats::default(),
        }
    }
    
    /// Add new performance observation and check for drift
    pub fn add_observation(&mut self, performance: f64) -> MLResult<DriftDetection> {
        let timer = Timer::new("ConceptDriftDetector::add_observation");
        
        self.performance_history.push_back(performance);
        
        // Limit history size to prevent memory issues
        if self.performance_history.len() > 10000 {
            self.performance_history.pop_front();
        }
        
        let detection = match &self.test {
            StatisticalTest::PageHinkley { threshold, alpha } => {
                self.page_hinkley_test(performance, *threshold, *alpha)?
            },
            StatisticalTest::ADWIN { delta, min_window_size, max_window_size } => {
                self.adwin_test(performance, *delta, *min_window_size, *max_window_size)?
            },
            StatisticalTest::DDM { warning_level, drift_level, min_samples } => {
                self.ddm_test(performance, *warning_level, *drift_level, *min_samples)?
            },
            StatisticalTest::EDDM { warning_level, drift_level, min_samples } => {
                self.eddm_test(performance, *warning_level, *drift_level, *min_samples)?
            },
            StatisticalTest::KolmogorovSmirnov { window_size, significance_level } => {
                self.ks_test(performance, *window_size, *significance_level)?
            },
        };
        
        if detection.drift_detected {
            self.detection_history.push(detection.clone());
        }
        
        timer.finish();
        Ok(detection)
    }
    
    /// Page-Hinkley test implementation
    fn page_hinkley_test(&mut self, performance: f64, threshold: f64, alpha: f64) -> MLResult<DriftDetection> {
        // Update cumulative sum
        self.page_hinkley_stats.cumulative_sum += performance - alpha;
        
        // Update minimum
        if self.page_hinkley_stats.cumulative_sum < self.page_hinkley_stats.min_sum {
            self.page_hinkley_stats.min_sum = self.page_hinkley_stats.cumulative_sum;
        }
        
        // Calculate test statistic
        self.page_hinkley_stats.test_statistic = 
            self.page_hinkley_stats.cumulative_sum - self.page_hinkley_stats.min_sum;
        
        let drift_detected = self.page_hinkley_stats.test_statistic > threshold;
        
        if drift_detected {
            // Reset statistics after drift detection
            self.page_hinkley_stats = PageHinkleyStats::default();
        }
        
        Ok(DriftDetection {
            drift_detected,
            drift_type: if drift_detected { Some(DriftType::Sudden) } else { None },
            confidence: if drift_detected { 
                (self.page_hinkley_stats.test_statistic / threshold).min(1.0) 
            } else { 
                0.0 
            },
            timestamp: Instant::now(),
            p_value: if drift_detected { alpha } else { 1.0 },
            change_magnitude: self.page_hinkley_stats.test_statistic / threshold,
        })
    }
    
    /// ADWIN test implementation
    fn adwin_test(
        &mut self, 
        performance: f64, 
        delta: f64, 
        min_window_size: usize, 
        max_window_size: usize
    ) -> MLResult<DriftDetection> {
        // Add to window
        self.adwin_stats.window.push_back(performance);
        self.adwin_stats.window_sum += performance;
        self.adwin_stats.window_sum_sq += performance * performance;
        self.adwin_stats.total_count += 1;
        
        // Maintain window size
        if self.adwin_stats.window.len() > max_window_size {
            let removed = self.adwin_stats.window.pop_front().unwrap();
            self.adwin_stats.window_sum -= removed;
            self.adwin_stats.window_sum_sq -= removed * removed;
        }
        
        let mut drift_detected = false;
        let mut cut_point = 0;
        
        if self.adwin_stats.window.len() >= min_window_size {
            // Check for change points
            for i in min_window_size..(self.adwin_stats.window.len() - min_window_size) {
                let n0 = i;
                let n1 = self.adwin_stats.window.len() - i;
                
                // Calculate means for both windows
                let sum0: f64 = self.adwin_stats.window.iter().take(i).sum();
                let sum1: f64 = self.adwin_stats.window.iter().skip(i).sum();
                
                let mean0 = sum0 / n0 as f64;
                let mean1 = sum1 / n1 as f64;
                
                // ADWIN bound calculation (simplified)
                let m = 1.0 / ((1.0 / n0 as f64) + (1.0 / n1 as f64));
                let bound = (2.0 * (1.0 / delta).ln() / m).sqrt();
                
                if (mean0 - mean1).abs() > bound {
                    drift_detected = true;
                    cut_point = i;
                    break;
                }
            }
        }
        
        if drift_detected {
            // Remove old data up to cut point
            for _ in 0..cut_point {
                if let Some(removed) = self.adwin_stats.window.pop_front() {
                    self.adwin_stats.window_sum -= removed;
                    self.adwin_stats.window_sum_sq -= removed * removed;
                }
            }
        }
        
        Ok(DriftDetection {
            drift_detected,
            drift_type: if drift_detected { Some(DriftType::Gradual) } else { None },
            confidence: if drift_detected { 0.9 } else { 0.0 },
            timestamp: Instant::now(),
            p_value: delta,
            change_magnitude: if drift_detected { 1.0 } else { 0.0 },
        })
    }
    
    /// DDM (Drift Detection Method) test implementation
    fn ddm_test(
        &mut self, 
        performance: f64, 
        warning_level: f64, 
        drift_level: f64, 
        min_samples: usize
    ) -> MLResult<DriftDetection> {
        // Assume performance is error rate (0 = correct, 1 = error)
        let is_error = performance > 0.5;
        
        self.ddm_stats.sample_count += 1;
        if is_error {
            self.ddm_stats.error_count += 1;
        }
        
        if self.ddm_stats.sample_count >= min_samples {
            // Calculate error rate and standard deviation
            self.ddm_stats.p_i = self.ddm_stats.error_count as f64 / self.ddm_stats.sample_count as f64;
            self.ddm_stats.s_i = (self.ddm_stats.p_i * (1.0 - self.ddm_stats.p_i) / self.ddm_stats.sample_count as f64).sqrt();
            
            let p_plus_s = self.ddm_stats.p_i + self.ddm_stats.s_i;
            
            // Update minimum
            if p_plus_s < self.ddm_stats.min_p_plus_s {
                self.ddm_stats.min_p_plus_s = p_plus_s;
            }
            
            // Check for drift
            let drift_detected = p_plus_s > self.ddm_stats.min_p_plus_s + drift_level * self.ddm_stats.s_i;
            let warning = p_plus_s > self.ddm_stats.min_p_plus_s + warning_level * self.ddm_stats.s_i;
            
            self.drift_state = if drift_detected {
                DriftState::Drift
            } else if warning {
                DriftState::Warning
            } else {
                DriftState::Stable
            };
            
            if drift_detected {
                // Reset statistics
                self.ddm_stats = DDMStats::default();
            }
            
            Ok(DriftDetection {
                drift_detected,
                drift_type: if drift_detected { Some(DriftType::Sudden) } else { None },
                confidence: if drift_detected { 0.95 } else if warning { 0.5 } else { 0.0 },
                timestamp: Instant::now(),
                p_value: if drift_detected { 0.05 } else { 1.0 },
                change_magnitude: (p_plus_s - self.ddm_stats.min_p_plus_s) / self.ddm_stats.s_i,
            })
        } else {
            Ok(DriftDetection {
                drift_detected: false,
                drift_type: None,
                confidence: 0.0,
                timestamp: Instant::now(),
                p_value: 1.0,
                change_magnitude: 0.0,
            })
        }
    }
    
    /// EDDM (Early Drift Detection Method) test implementation
    fn eddm_test(
        &mut self, 
        performance: f64, 
        warning_level: f64, 
        drift_level: f64, 
        min_samples: usize
    ) -> MLResult<DriftDetection> {
        let is_error = performance > 0.5;
        
        if is_error {
            // Calculate distance between errors
            if let Some(&last_error_pos) = self.eddm_stats.distances.back() {
                let distance = self.eddm_stats.distances.len() - last_error_pos;
                self.eddm_stats.distances.push_back(distance);
            } else {
                self.eddm_stats.distances.push_back(1);
            }
            
            // Limit history
            if self.eddm_stats.distances.len() > 1000 {
                self.eddm_stats.distances.pop_front();
            }
        }
        
        if self.eddm_stats.distances.len() >= min_samples {
            // Calculate mean and standard deviation of distances
            let sum: usize = self.eddm_stats.distances.iter().sum();
            self.eddm_stats.mean_distance = sum as f64 / self.eddm_stats.distances.len() as f64;
            
            let variance: f64 = self.eddm_stats.distances.iter()
                .map(|&d| (d as f64 - self.eddm_stats.mean_distance).powi(2))
                .sum::<f64>() / self.eddm_stats.distances.len() as f64;
            
            self.eddm_stats.std_distance = variance.sqrt();
            
            let mean_plus_2std = self.eddm_stats.mean_distance + 2.0 * self.eddm_stats.std_distance;
            
            // Update maximum
            if mean_plus_2std > self.eddm_stats.max_mean_plus_2std {
                self.eddm_stats.max_mean_plus_2std = mean_plus_2std;
            }
            
            // Check for drift
            let drift_threshold = drift_level * self.eddm_stats.max_mean_plus_2std;
            let warning_threshold = warning_level * self.eddm_stats.max_mean_plus_2std;
            
            let drift_detected = mean_plus_2std < drift_threshold;
            let warning = mean_plus_2std < warning_threshold;
            
            if drift_detected {
                self.eddm_stats = EDDMStats::default();
            }
            
            Ok(DriftDetection {
                drift_detected,
                drift_type: if drift_detected { Some(DriftType::Gradual) } else { None },
                confidence: if drift_detected { 0.9 } else if warning { 0.5 } else { 0.0 },
                timestamp: Instant::now(),
                p_value: if drift_detected { 0.1 } else { 1.0 },
                change_magnitude: if self.eddm_stats.max_mean_plus_2std > 0.0 {
                    1.0 - (mean_plus_2std / self.eddm_stats.max_mean_plus_2std)
                } else {
                    0.0
                },
            })
        } else {
            Ok(DriftDetection {
                drift_detected: false,
                drift_type: None,
                confidence: 0.0,
                timestamp: Instant::now(),
                p_value: 1.0,
                change_magnitude: 0.0,
            })
        }
    }
    
    /// Kolmogorov-Smirnov test implementation
    fn ks_test(
        &mut self, 
        performance: f64, 
        window_size: usize, 
        significance_level: f64
    ) -> MLResult<DriftDetection> {
        self.ks_stats.current_window.push_back(performance);
        
        // Maintain window size
        if self.ks_stats.current_window.len() > window_size {
            self.ks_stats.current_window.pop_front();
        }
        
        // Initialize reference window
        if self.ks_stats.reference_window.is_empty() && self.ks_stats.current_window.len() == window_size {
            self.ks_stats.reference_window = self.ks_stats.current_window.clone();
        }
        
        let mut drift_detected = false;
        let mut ks_statistic = 0.0;
        
        if self.ks_stats.reference_window.len() == window_size && 
           self.ks_stats.current_window.len() == window_size {
            
            // Perform two-sample KS test
            let mut ref_data: Vec<f64> = self.ks_stats.reference_window.iter().cloned().collect();
            let mut cur_data: Vec<f64> = self.ks_stats.current_window.iter().cloned().collect();
            
            ref_data.sort_by(|a, b| a.partial_cmp(b).unwrap());
            cur_data.sort_by(|a, b| a.partial_cmp(b).unwrap());
            
            // Calculate empirical CDFs and find maximum difference
            let mut max_diff = 0.0;
            let mut i = 0;
            let mut j = 0;
            
            while i < ref_data.len() || j < cur_data.len() {
                let cdf_ref = (i + 1) as f64 / ref_data.len() as f64;
                let cdf_cur = (j + 1) as f64 / cur_data.len() as f64;
                
                max_diff = max_diff.max((cdf_ref - cdf_cur).abs());
                
                if i < ref_data.len() && (j >= cur_data.len() || ref_data[i] <= cur_data[j]) {
                    i += 1;
                } else {
                    j += 1;
                }
            }
            
            ks_statistic = max_diff;
            
            // Critical value for two-sample KS test (approximation)
            let n = window_size as f64;
            let critical_value = (-0.5 * (significance_level / 2.0).ln()).sqrt() * (2.0 / n).sqrt();
            
            drift_detected = ks_statistic > critical_value;
            
            if drift_detected {
                // Update reference window
                self.ks_stats.reference_window = self.ks_stats.current_window.clone();
            }
        }
        
        Ok(DriftDetection {
            drift_detected,
            drift_type: if drift_detected { Some(DriftType::Sudden) } else { None },
            confidence: if drift_detected { 1.0 - significance_level } else { 0.0 },
            timestamp: Instant::now(),
            p_value: significance_level,
            change_magnitude: ks_statistic,
        })
    }
    
    /// Get detection history
    pub fn get_detection_history(&self) -> &[DriftDetection] {
        &self.detection_history
    }
    
    /// Reset detector state
    pub fn reset(&mut self) {
        self.performance_history.clear();
        self.drift_state = DriftState::Stable;
        self.detection_history.clear();
        self.page_hinkley_stats = PageHinkleyStats::default();
        self.adwin_stats = ADWINStats::default();
        self.ddm_stats = DDMStats::default();
        self.eddm_stats = EDDMStats::default();
        self.ks_stats = KSStats::default();
    }
}

/// Adaptive learning rate scheduler
#[derive(Debug)]
pub struct AdaptiveLearningRate {
    /// Base learning rate
    base_rate: f64,
    /// Current learning rate
    current_rate: f64,
    /// Adaptation strategy
    strategy: AdaptationStrategy,
    /// Performance history for adaptation
    performance_history: VecDeque<f64>,
    /// Learning rate history
    rate_history: Vec<f64>,
    /// Adaptation parameters
    params: AdaptationParams,
}

/// Learning rate adaptation strategies
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AdaptationStrategy {
    /// Fixed learning rate
    Fixed,
    /// Exponential decay
    ExponentialDecay {
        decay_rate: f64,
        decay_steps: usize,
    },
    /// Step decay
    StepDecay {
        drop_rate: f64,
        epochs_drop: usize,
    },
    /// Performance-based adaptation
    PerformanceBased {
        patience: usize,
        factor: f64,
        min_delta: f64,
    },
    /// Cyclical learning rate
    Cyclical {
        base_lr: f64,
        max_lr: f64,
        step_size: usize,
    },
    /// Adaptive based on gradient information
    AdaGrad {
        epsilon: f64,
        initial_accumulator: f64,
    },
}

/// Adaptation parameters
#[derive(Debug, Clone)]
struct AdaptationParams {
    step_count: usize,
    epoch_count: usize,
    best_performance: f64,
    patience_counter: usize,
    accumulated_gradients: HashMap<String, f64>,
}

impl Default for AdaptationParams {
    fn default() -> Self {
        Self {
            step_count: 0,
            epoch_count: 0,
            best_performance: f64::NEG_INFINITY,
            patience_counter: 0,
            accumulated_gradients: HashMap::new(),
        }
    }
}

impl AdaptiveLearningRate {
    /// Create new adaptive learning rate scheduler
    pub fn new(base_rate: f64, strategy: AdaptationStrategy) -> Self {
        Self {
            base_rate,
            current_rate: base_rate,
            strategy,
            performance_history: VecDeque::new(),
            rate_history: vec![base_rate],
            params: AdaptationParams::default(),
        }
    }
    
    /// Update learning rate based on performance
    pub fn update(&mut self, performance: f64) -> MLResult<f64> {
        let timer = Timer::new("AdaptiveLearningRate::update");
        
        self.performance_history.push_back(performance);
        self.params.step_count += 1;
        
        // Limit history size
        if self.performance_history.len() > 1000 {
            self.performance_history.pop_front();
        }
        
        self.current_rate = match &self.strategy {
            AdaptationStrategy::Fixed => self.base_rate,
            
            AdaptationStrategy::ExponentialDecay { decay_rate, decay_steps } => {
                let decay_factor = (*decay_rate).powf(self.params.step_count as f64 / *decay_steps as f64);
                self.base_rate * decay_factor
            },
            
            AdaptationStrategy::StepDecay { drop_rate, epochs_drop } => {
                let drop_count = self.params.epoch_count / epochs_drop;
                self.base_rate * drop_rate.powi(drop_count as i32)
            },
            
            AdaptationStrategy::PerformanceBased { patience, factor, min_delta } => {
                if performance > self.params.best_performance + min_delta {
                    self.params.best_performance = performance;
                    self.params.patience_counter = 0;
                } else {
                    self.params.patience_counter += 1;
                }
                
                if self.params.patience_counter >= *patience {
                    self.params.patience_counter = 0;
                    self.current_rate * factor
                } else {
                    self.current_rate
                }
            },
            
            AdaptationStrategy::Cyclical { base_lr, max_lr, step_size } => {
                let cycle = (1.0 + self.params.step_count as f64 / (2.0 * *step_size as f64)).floor();
                let x = (self.params.step_count as f64 / *step_size as f64 - 2.0 * cycle + 1.0).abs();
                base_lr + (max_lr - base_lr) * 0_f64.max(1.0 - x)
            },
            
            AdaptationStrategy::AdaGrad { epsilon, initial_accumulator } => {
                // Simplified AdaGrad (would need gradient information in practice)
                let accumulated = self.params.accumulated_gradients
                    .get("default")
                    .copied()
                    .unwrap_or(*initial_accumulator);
                
                // Approximate gradient as performance change
                let grad_approx = if self.performance_history.len() > 1 {
                    let prev_perf = self.performance_history[self.performance_history.len() - 2];
                    (performance - prev_perf).abs()
                } else {
                    0.1
                };
                
                let new_accumulated = accumulated + grad_approx * grad_approx;
                self.params.accumulated_gradients.insert("default".to_string(), new_accumulated);
                
                self.base_rate / (new_accumulated.sqrt() + epsilon)
            },
        };
        
        self.rate_history.push(self.current_rate);
        
        timer.finish();
        Ok(self.current_rate)
    }
    
    /// Signal end of epoch
    pub fn step_epoch(&mut self) {
        self.params.epoch_count += 1;
    }
    
    /// Get current learning rate
    pub fn get_current_rate(&self) -> f64 {
        self.current_rate
    }
    
    /// Get learning rate history
    pub fn get_rate_history(&self) -> &[f64] {
        &self.rate_history
    }
    
    /// Reset scheduler state
    pub fn reset(&mut self) {
        self.current_rate = self.base_rate;
        self.performance_history.clear();
        self.rate_history = vec![self.base_rate];
        self.params = AdaptationParams::default();
    }
}

/// Experience replay buffer for continual learning
#[derive(Debug)]
pub struct ReplayBuffer {
    /// Buffer capacity
    capacity: usize,
    /// Stored experiences
    experiences: VecDeque<Experience>,
    /// Sampling strategy
    sampling_strategy: SamplingStrategy,
    /// Current buffer size
    current_size: usize,
    /// Experience insertion counter
    insert_counter: usize,
}

/// Individual experience in the replay buffer
#[derive(Debug, Clone)]
pub struct Experience {
    /// Input features
    pub input: Array1<f64>,
    /// Target output
    pub target: Array1<f64>,
    /// Experience importance/priority
    pub priority: f64,
    /// Timestamp when experience was added
    pub timestamp: Instant,
    /// Unique experience ID
    pub id: usize,
}

/// Sampling strategies for replay buffer
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SamplingStrategy {
    /// Uniform random sampling
    Uniform,
    /// Reservoir sampling for streaming data
    Reservoir,
    /// Priority-based sampling
    PrioritizedReplay {
        alpha: f64,  // Prioritization exponent
        beta: f64,   // Importance sampling correction
        epsilon: f64, // Small constant to prevent zero probabilities
    },
    /// Recency-weighted sampling
    RecencyWeighted {
        decay_factor: f64,
    },
    /// Diversity-based sampling
    DiversityBased {
        similarity_threshold: f64,
    },
}

impl ReplayBuffer {
    /// Create new replay buffer
    pub fn new(capacity: usize, sampling_strategy: SamplingStrategy) -> Self {
        Self {
            capacity,
            experiences: VecDeque::new(),
            sampling_strategy,
            current_size: 0,
            insert_counter: 0,
        }
    }
    
    /// Add experience to buffer
    pub fn add_experience(&mut self, input: Array1<f64>, target: Array1<f64>, priority: f64) -> MLResult<()> {
        let experience = Experience {
            input,
            target,
            priority,
            timestamp: Instant::now(),
            id: self.insert_counter,
        };
        
        self.insert_counter += 1;
        
        if self.current_size < self.capacity {
            self.experiences.push_back(experience);
            self.current_size += 1;
        } else {
            // Buffer is full, replace based on strategy
            match &self.sampling_strategy {
                SamplingStrategy::Uniform | SamplingStrategy::Reservoir => {
                    // Random replacement
                    let replace_idx = rand::random::<usize>() % self.capacity;
                    self.experiences[replace_idx] = experience;
                },
                
                SamplingStrategy::PrioritizedReplay { .. } => {
                    // Replace lowest priority experience
                    let min_priority_idx = self.experiences.iter()
                        .enumerate()
                        .min_by(|(_, a), (_, b)| a.priority.partial_cmp(&b.priority).unwrap())
                        .map(|(idx, _)| idx)
                        .unwrap_or(0);
                    
                    if experience.priority > self.experiences[min_priority_idx].priority {
                        self.experiences[min_priority_idx] = experience;
                    }
                },
                
                SamplingStrategy::RecencyWeighted { .. } => {
                    // Replace oldest experience
                    self.experiences.pop_front();
                    self.experiences.push_back(experience);
                },
                
                SamplingStrategy::DiversityBased { similarity_threshold } => {
                    // Replace most similar experience
                    let most_similar_idx = self.find_most_similar_experience(&experience.input, *similarity_threshold)?;
                    if let Some(idx) = most_similar_idx {
                        self.experiences[idx] = experience;
                    } else {
                        // No similar experience found, replace randomly
                        let replace_idx = rand::random::<usize>() % self.capacity;
                        self.experiences[replace_idx] = experience;
                    }
                },
            }
        }
        
        Ok(())
    }
    
    /// Sample batch of experiences
    pub fn sample_batch(&self, batch_size: usize) -> MLResult<Vec<Experience>> {
        let timer = Timer::new("ReplayBuffer::sample_batch");
        
        if self.current_size == 0 {
            timer.finish();
            return Ok(Vec::new());
        }
        
        let actual_batch_size = batch_size.min(self.current_size);
        let mut batch = Vec::with_capacity(actual_batch_size);
        
        match &self.sampling_strategy {
            SamplingStrategy::Uniform => {
                // Uniform random sampling
                for _ in 0..actual_batch_size {
                    let idx = rand::random::<usize>() % self.current_size;
                    batch.push(self.experiences[idx].clone());
                }
            },
            
            SamplingStrategy::Reservoir => {
                // Reservoir sampling
                let mut indices: Vec<usize> = (0..self.current_size).collect();
                for i in 0..actual_batch_size {
                    let j = i + rand::random::<usize>() % (self.current_size - i);
                    indices.swap(i, j);
                }
                
                for i in 0..actual_batch_size {
                    batch.push(self.experiences[indices[i]].clone());
                }
            },
            
            SamplingStrategy::PrioritizedReplay { alpha, beta: _, epsilon } => {
                // Priority-based sampling
                let priorities: Vec<f64> = self.experiences.iter()
                    .map(|exp| (exp.priority + epsilon).powf(*alpha))
                    .collect();
                
                let total_priority: f64 = priorities.iter().sum();
                
                for _ in 0..actual_batch_size {
                    let mut random_val = rand::random::<f64>() * total_priority;
                    let mut selected_idx = 0;
                    
                    for (i, &priority) in priorities.iter().enumerate() {
                        random_val -= priority;
                        if random_val <= 0.0 {
                            selected_idx = i;
                            break;
                        }
                    }
                    
                    batch.push(self.experiences[selected_idx].clone());
                }
            },
            
            SamplingStrategy::RecencyWeighted { decay_factor } => {
                // Recency-weighted sampling
                let now = Instant::now();
                let weights: Vec<f64> = self.experiences.iter()
                    .map(|exp| {
                        let age_seconds = now.duration_since(exp.timestamp).as_secs_f64();
                        (-decay_factor * age_seconds).exp()
                    })
                    .collect();
                
                let total_weight: f64 = weights.iter().sum();
                
                for _ in 0..actual_batch_size {
                    let mut random_val = rand::random::<f64>() * total_weight;
                    let mut selected_idx = 0;
                    
                    for (i, &weight) in weights.iter().enumerate() {
                        random_val -= weight;
                        if random_val <= 0.0 {
                            selected_idx = i;
                            break;
                        }
                    }
                    
                    batch.push(self.experiences[selected_idx].clone());
                }
            },
            
            SamplingStrategy::DiversityBased { .. } => {
                // Diversity-based sampling (simplified)
                let mut selected_indices = HashSet::new();
                
                while selected_indices.len() < actual_batch_size && selected_indices.len() < self.current_size {
                    let candidate_idx = rand::random::<usize>() % self.current_size;
                    
                    // Check diversity with already selected experiences
                    let mut is_diverse = true;
                    for &selected_idx in &selected_indices {
                        let similarity = self.calculate_similarity(
                            &self.experiences[candidate_idx].input,
                            &self.experiences[selected_idx].input,
                        );
                        
                        if similarity > 0.8 { // High similarity threshold
                            is_diverse = false;
                            break;
                        }
                    }
                    
                    if is_diverse || selected_indices.is_empty() {
                        selected_indices.insert(candidate_idx);
                    }
                }
                
                for &idx in &selected_indices {
                    batch.push(self.experiences[idx].clone());
                }
            },
        }
        
        timer.finish();
        Ok(batch)
    }
    
    /// Find most similar experience to given input
    fn find_most_similar_experience(&self, input: &Array1<f64>, threshold: f64) -> MLResult<Option<usize>> {
        let mut max_similarity = 0.0;
        let mut most_similar_idx = None;
        
        for (idx, experience) in self.experiences.iter().enumerate() {
            let similarity = self.calculate_similarity(input, &experience.input);
            if similarity > max_similarity && similarity > threshold {
                max_similarity = similarity;
                most_similar_idx = Some(idx);
            }
        }
        
        Ok(most_similar_idx)
    }
    
    /// Calculate cosine similarity between two inputs
    fn calculate_similarity(&self, input1: &Array1<f64>, input2: &Array1<f64>) -> f64 {
        if input1.len() != input2.len() {
            return 0.0;
        }
        
        let dot_product = input1.iter().zip(input2.iter()).map(|(a, b)| a * b).sum::<f64>();
        let norm1 = input1.iter().map(|x| x * x).sum::<f64>().sqrt();
        let norm2 = input2.iter().map(|x| x * x).sum::<f64>().sqrt();
        
        if norm1 == 0.0 || norm2 == 0.0 {
            0.0
        } else {
            dot_product / (norm1 * norm2)
        }
    }
    
    /// Update experience priority
    pub fn update_priority(&mut self, experience_id: usize, new_priority: f64) -> MLResult<()> {
        for experience in &mut self.experiences {
            if experience.id == experience_id {
                experience.priority = new_priority;
                return Ok(());
            }
        }
        
        Err(MLError::OnlineLearningError(
            format!("Experience {} not found in buffer", experience_id)
        ))
    }
    
    /// Get buffer statistics
    pub fn get_statistics(&self) -> HashMap<String, f64> {
        let mut stats = HashMap::new();
        
        stats.insert("size".to_string(), self.current_size as f64);
        stats.insert("capacity".to_string(), self.capacity as f64);
        stats.insert("utilization".to_string(), self.current_size as f64 / self.capacity as f64);
        
        if !self.experiences.is_empty() {
            let avg_priority = self.experiences.iter().map(|exp| exp.priority).sum::<f64>() / self.current_size as f64;
            stats.insert("avg_priority".to_string(), avg_priority);
            
            let max_priority = self.experiences.iter().map(|exp| exp.priority).fold(f64::NEG_INFINITY, f64::max);
            let min_priority = self.experiences.iter().map(|exp| exp.priority).fold(f64::INFINITY, f64::min);
            
            stats.insert("max_priority".to_string(), max_priority);
            stats.insert("min_priority".to_string(), min_priority);
        }
        
        stats
    }
    
    /// Clear buffer
    pub fn clear(&mut self) {
        self.experiences.clear();
        self.current_size = 0;
        self.insert_counter = 0;
    }
}

/// Online learner configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnlineLearnerConfig {
    /// Learning rate adaptation strategy
    pub learning_rate_strategy: AdaptationStrategy,
    /// Initial learning rate
    pub initial_learning_rate: f64,
    /// Concept drift detection test
    pub drift_test: StatisticalTest,
    /// Replay buffer capacity
    pub replay_buffer_capacity: usize,
    /// Replay buffer sampling strategy
    pub sampling_strategy: SamplingStrategy,
    /// Batch size for replay
    pub replay_batch_size: usize,
    /// Enable experience replay
    pub enable_replay: bool,
    /// Minimum samples before adaptation
    pub min_adaptation_samples: usize,
}

impl Default for OnlineLearnerConfig {
    fn default() -> Self {
        Self {
            learning_rate_strategy: AdaptationStrategy::PerformanceBased {
                patience: 10,
                factor: 0.8,
                min_delta: 0.001,
            },
            initial_learning_rate: 0.01,
            drift_test: StatisticalTest::default(),
            replay_buffer_capacity: 1000,
            sampling_strategy: SamplingStrategy::Uniform,
            replay_batch_size: 32,
            enable_replay: true,
            min_adaptation_samples: 10,
        }
    }
}

/// Main online learner
#[derive(Debug)]
pub struct OnlineLearner {
    config: OnlineLearnerConfig,
    drift_detector: ConceptDriftDetector,
    learning_rate_scheduler: AdaptiveLearningRate,
    replay_buffer: Option<ReplayBuffer>,
    adaptation_counter: usize,
    total_samples: usize,
    performance_history: VecDeque<f64>,
}

impl OnlineLearner {
    /// Create new online learner
    pub fn new(config: OnlineLearnerConfig) -> Self {
        let drift_detector = ConceptDriftDetector::new(config.drift_test.clone());
        let learning_rate_scheduler = AdaptiveLearningRate::new(
            config.initial_learning_rate,
            config.learning_rate_strategy.clone(),
        );
        
        let replay_buffer = if config.enable_replay {
            Some(ReplayBuffer::new(
                config.replay_buffer_capacity,
                config.sampling_strategy.clone(),
            ))
        } else {
            None
        };
        
        Self {
            config,
            drift_detector,
            learning_rate_scheduler,
            replay_buffer,
            adaptation_counter: 0,
            total_samples: 0,
            performance_history: VecDeque::new(),
        }
    }
    
    /// Process new sample and adapt if necessary
    pub fn process_sample(
        &mut self,
        input: Array1<f64>,
        target: Array1<f64>,
        performance: f64,
    ) -> MLResult<OnlineLearningUpdate> {
        let timer = Timer::new("OnlineLearner::process_sample");
        
        self.total_samples += 1;
        self.performance_history.push_back(performance);
        
        // Limit history size
        if self.performance_history.len() > 1000 {
            self.performance_history.pop_front();
        }
        
        // Check for concept drift
        let drift_detection = self.drift_detector.add_observation(performance)?;
        
        // Update learning rate
        let new_learning_rate = self.learning_rate_scheduler.update(performance)?;
        
        // Add to replay buffer if enabled
        if let Some(ref mut buffer) = self.replay_buffer {
            let priority = if drift_detection.drift_detected {
                10.0 // High priority for samples near drift
            } else {
                1.0 + performance // Performance-based priority
            };
            
            buffer.add_experience(input.clone(), target.clone(), priority)?;
        }
        
        // Determine if adaptation is needed
        let adaptation_needed = drift_detection.drift_detected || 
                               self.adaptation_counter >= self.config.min_adaptation_samples;
        
        let replay_batch = if adaptation_needed && self.replay_buffer.is_some() {
            self.replay_buffer.as_ref().unwrap().sample_batch(self.config.replay_batch_size)?
        } else {
            Vec::new()
        };
        
        if adaptation_needed {
            self.adaptation_counter = 0;
        } else {
            self.adaptation_counter += 1;
        }
        
        timer.finish();
        
        Ok(OnlineLearningUpdate {
            current_sample: (input, target),
            drift_detected: drift_detection.drift_detected,
            drift_info: drift_detection,
            new_learning_rate,
            replay_batch,
            adaptation_needed,
            total_samples: self.total_samples,
        })
    }
    
    /// Get current statistics
    pub fn get_statistics(&self) -> HashMap<String, f64> {
        let mut stats = HashMap::new();
        
        stats.insert("total_samples".to_string(), self.total_samples as f64);
        stats.insert("current_learning_rate".to_string(), self.learning_rate_scheduler.get_current_rate());
        stats.insert("adaptation_counter".to_string(), self.adaptation_counter as f64);
        
        if !self.performance_history.is_empty() {
            let avg_performance = self.performance_history.iter().sum::<f64>() / self.performance_history.len() as f64;
            stats.insert("avg_performance".to_string(), avg_performance);
            
            let recent_performance = if self.performance_history.len() >= 10 {
                let recent = &self.performance_history[self.performance_history.len() - 10..];
                recent.iter().sum::<f64>() / recent.len() as f64
            } else {
                avg_performance
            };
            stats.insert("recent_performance".to_string(), recent_performance);
        }
        
        if let Some(ref buffer) = self.replay_buffer {
            let buffer_stats = buffer.get_statistics();
            for (key, value) in buffer_stats {
                stats.insert(format!("buffer_{}", key), value);
            }
        }
        
        stats.insert("drift_detections".to_string(), self.drift_detector.get_detection_history().len() as f64);
        
        stats
    }
    
    /// Reset learner state
    pub fn reset(&mut self) {
        self.drift_detector.reset();
        self.learning_rate_scheduler.reset();
        if let Some(ref mut buffer) = self.replay_buffer {
            buffer.clear();
        }
        self.adaptation_counter = 0;
        self.total_samples = 0;
        self.performance_history.clear();
    }
}

/// Update information from online learning step
#[derive(Debug)]
pub struct OnlineLearningUpdate {
    /// Current sample being processed
    pub current_sample: (Array1<f64>, Array1<f64>),
    /// Whether concept drift was detected
    pub drift_detected: bool,
    /// Detailed drift information
    pub drift_info: DriftDetection,
    /// Updated learning rate
    pub new_learning_rate: f64,
    /// Batch of replay experiences
    pub replay_batch: Vec<Experience>,
    /// Whether model adaptation is needed
    pub adaptation_needed: bool,
    /// Total samples processed so far
    pub total_samples: usize,
}

impl AsyncOptimizer for OnlineLearner {
    type Input = (Array1<f64>, Array1<f64>, f64); // Input, target, performance
    type Output = OnlineLearningUpdate;
    type Config = OnlineLearnerConfig;
    
    async fn initialize(&mut self, config: Self::Config) -> MLResult<()> {
        *self = Self::new(config);
        Ok(())
    }
    
    async fn optimize(&mut self, input: Self::Input, _timeout: Duration) -> MLResult<Self::Output> {
        let (input_data, target_data, performance) = input;
        self.process_sample(input_data, target_data, performance)
    }
    
    fn get_metrics(&self) -> MLResult<super::metrics::PerformanceMetrics> {
        let stats = self.get_statistics();
        
        Ok(super::metrics::PerformanceMetrics {
            iterations: self.total_samples,
            best_value: stats.get("recent_performance").copied().unwrap_or(0.0),
            convergence_rate: stats.get("current_learning_rate").copied().unwrap_or(0.0),
            memory_usage: if let Some(ref buffer) = self.replay_buffer {
                buffer.current_size * 1000 * 8 // Approximate
            } else {
                self.performance_history.len() * 8
            },
            computation_time: Duration::from_secs(0), // Would track in real implementation
        })
    }
}

impl MemoryAware for OnlineLearner {
    fn check_memory_requirements(&self, config: &super::MLExtensionsConfig) -> MLResult<()> {
        let estimated = self.estimated_memory_usage();
        if estimated > config.max_memory {
            return Err(MLError::MemoryError {
                requested: estimated,
                limit: config.max_memory,
            });
        }
        Ok(())
    }
    
    fn estimated_memory_usage(&self) -> usize {
        let history_memory = self.performance_history.len() * 8;
        let drift_memory = self.drift_detector.performance_history.len() * 8;
        let lr_memory = self.learning_rate_scheduler.rate_history.len() * 8;
        
        let buffer_memory = if let Some(ref buffer) = self.replay_buffer {
            buffer.current_size * 1000 * 8 // Approximate per experience
        } else {
            0
        };
        
        history_memory + drift_memory + lr_memory + buffer_memory
    }
}

impl GpuAccelerated for OnlineLearner {
    fn is_gpu_available(&self) -> bool {
        false // CPU-only implementation
    }
    
    fn enable_gpu(&mut self) -> MLResult<()> {
        Err(MLError::GpuError("GPU acceleration not implemented".to_string()))
    }
    
    fn disable_gpu(&mut self) {
        // No-op for CPU-only implementation
    }
}

impl Serializable for OnlineLearner {
    fn serialize(&self) -> MLResult<Vec<u8>> {
        let data = serde_json::to_vec(&self.config)
            .map_err(|e| MLError::SerializationError(format!("Failed to serialize OnlineLearner: {}", e)))?;
        Ok(data)
    }
    
    fn deserialize(data: &[u8]) -> MLResult<Self> {
        let config: OnlineLearnerConfig = serde_json::from_slice(data)
            .map_err(|e| MLError::SerializationError(format!("Failed to deserialize OnlineLearner: {}", e)))?;
        
        Ok(Self::new(config))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;
    
    #[test]
    fn test_page_hinkley_drift_detection() {
        let test = StatisticalTest::PageHinkley {
            threshold: 5.0,
            alpha: 0.1,
        };
        let mut detector = ConceptDriftDetector::new(test);
        
        // Add stable performance
        for _ in 0..20 {
            let detection = detector.add_observation(0.9).unwrap();
            assert!(!detection.drift_detected);
        }
        
        // Add degraded performance to trigger drift
        for _ in 0..10 {
            let detection = detector.add_observation(0.1).unwrap();
            if detection.drift_detected {
                assert_eq!(detection.drift_type, Some(DriftType::Sudden));
                return;
            }
        }
        
        // Should have detected drift
        assert!(false, "Drift should have been detected");
    }
    
    #[test]
    fn test_adaptive_learning_rate() {
        let strategy = AdaptationStrategy::PerformanceBased {
            patience: 3,
            factor: 0.5,
            min_delta: 0.01,
        };
        let mut scheduler = AdaptiveLearningRate::new(0.1, strategy);
        
        // Performance not improving
        for _ in 0..5 {
            let rate = scheduler.update(0.5).unwrap();
            // Should reduce learning rate after patience
            if rate < 0.1 {
                assert_relative_eq!(rate, 0.05, epsilon = 1e-6);
                return;
            }
        }
    }
    
    #[test]
    fn test_replay_buffer() {
        let strategy = SamplingStrategy::Uniform;
        let mut buffer = ReplayBuffer::new(5, strategy);
        
        // Add experiences
        for i in 0..10 {
            let input = Array1::from_vec(vec![i as f64]);
            let target = Array1::from_vec(vec![(i * 2) as f64]);
            buffer.add_experience(input, target, i as f64).unwrap();
        }
        
        assert_eq!(buffer.current_size, 5);
        
        // Sample batch
        let batch = buffer.sample_batch(3).unwrap();
        assert_eq!(batch.len(), 3);
    }
    
    #[test]
    fn test_prioritized_replay_buffer() {
        let strategy = SamplingStrategy::PrioritizedReplay {
            alpha: 0.6,
            beta: 0.4,
            epsilon: 1e-6,
        };
        let mut buffer = ReplayBuffer::new(5, strategy);
        
        // Add experiences with different priorities
        for i in 0..3 {
            let input = Array1::from_vec(vec![i as f64]);
            let target = Array1::from_vec(vec![(i * 2) as f64]);
            let priority = if i == 1 { 10.0 } else { 1.0 }; // High priority for middle sample
            buffer.add_experience(input, target, priority).unwrap();
        }
        
        // Sample should favor high-priority experiences
        let batch = buffer.sample_batch(10).unwrap();
        assert!(batch.len() <= 3);
        
        // Check that high-priority sample appears frequently
        let high_priority_count = batch.iter().filter(|exp| exp.priority > 5.0).count();
        assert!(high_priority_count > 0);
    }
    
    #[test]
    fn test_online_learner() {
        let config = OnlineLearnerConfig::default();
        let mut learner = OnlineLearner::new(config);
        
        // Process samples
        let input = Array1::from_vec(vec![1.0, 2.0]);
        let target = Array1::from_vec(vec![3.0]);
        let performance = 0.8;
        
        let update = learner.process_sample(input, target, performance).unwrap();
        
        assert_eq!(update.total_samples, 1);
        assert!(!update.drift_detected); // Should not detect drift on first sample
        assert!(update.new_learning_rate > 0.0);
    }
    
    #[test]
    fn test_experience_similarity() {
        let strategy = SamplingStrategy::Uniform;
        let buffer = ReplayBuffer::new(10, strategy);
        
        let input1 = Array1::from_vec(vec![1.0, 2.0, 3.0]);
        let input2 = Array1::from_vec(vec![1.0, 2.0, 3.0]); // Identical
        let input3 = Array1::from_vec(vec![4.0, 5.0, 6.0]); // Different
        
        let similarity1 = buffer.calculate_similarity(&input1, &input2);
        let similarity2 = buffer.calculate_similarity(&input1, &input3);
        
        assert_relative_eq!(similarity1, 1.0, epsilon = 1e-6);
        assert!(similarity2 < 1.0);
    }
    
    #[test]
    fn test_ddm_drift_detection() {
        let test = StatisticalTest::DDM {
            warning_level: 2.0,
            drift_level: 3.0,
            min_samples: 10,
        };
        let mut detector = ConceptDriftDetector::new(test);
        
        // Add samples with low error rate
        for _ in 0..20 {
            let detection = detector.add_observation(0.1).unwrap(); // Low error
            if detection.drift_detected {
                break;
            }
        }
        
        // Add samples with high error rate
        for _ in 0..20 {
            let detection = detector.add_observation(0.9).unwrap(); // High error
            if detection.drift_detected {
                assert_eq!(detection.drift_type, Some(DriftType::Sudden));
                return;
            }
        }
    }
    
    #[test]
    fn test_cyclical_learning_rate() {
        let strategy = AdaptationStrategy::Cyclical {
            base_lr: 0.001,
            max_lr: 0.1,
            step_size: 10,
        };
        let mut scheduler = AdaptiveLearningRate::new(0.01, strategy);
        
        let mut rates = Vec::new();
        for _ in 0..30 {
            let rate = scheduler.update(0.5).unwrap();
            rates.push(rate);
        }
        
        // Check that learning rate cycles
        let min_rate = rates.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let max_rate = rates.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        
        assert!(min_rate < 0.01);
        assert!(max_rate > 0.01);
    }
}