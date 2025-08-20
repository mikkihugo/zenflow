//! Automatic ML Optimization Selection
//!
//! This module provides intelligent runtime selection of DSPy optimization
//! for advanced ML algorithms based on data characteristics and computational requirements.

use std::collections::HashMap;
use std::time::{Duration, Instant};

/// ML task characteristics for optimization selection
#[derive(Debug, Clone)]
pub struct MLTaskProfile {
    /// Algorithm type
    pub algorithm: MLAlgorithmType,
    /// Data dimensionality
    pub feature_count: usize,
    /// Sample count
    pub sample_count: usize,
    /// Target complexity (classification classes, regression complexity, etc.)
    pub target_complexity: usize,
    /// Data sparsity (0.0 = dense, 1.0 = very sparse)
    pub sparsity: f32,
    /// Convergence tolerance required
    pub tolerance: f64,
    /// Maximum training time allowed (milliseconds)
    pub time_budget_ms: u64,
    /// Accuracy requirement (0.0 to 1.0)
    pub accuracy_target: f32,
}

/// Types of ML algorithms
#[derive(Debug, Clone, PartialEq, Hash)]
pub enum MLAlgorithmType {
    BayesianOptimization,
    GradientOptimization,
    MultiObjective,
    OnlineLearning,
    PatternRecognition,
    Clustering,
    TextEmbedding,
    SimilarityCalculation,
}

/// System resource profile
#[derive(Debug, Clone)]
pub struct SystemProfile {
    /// Available RAM in MB
    pub ram_mb: usize,
    /// Available CPU cores
    pub cpu_cores: usize,
    /// GPU memory in MB (0 if no GPU)
    pub gpu_memory_mb: usize,
    /// Current system load (0.0 to 1.0)
    pub system_load: f32,
    /// Available disk I/O bandwidth
    pub disk_bandwidth_mbps: f32,
}

/// ML optimization strategy
#[derive(Debug, Clone, PartialEq)]
pub enum MLOptimizationStrategy {
    /// Standard implementation (fast, predictable)
    Standard,
    /// DSPy optimized (intelligent, adaptive)
    DSPyOptimized,
    /// Hybrid approach (DSPy for complex parts, standard for simple)
    Hybrid,
    /// Resource-constrained DSPy (limited memory/time)
    DSPyConstrained,
}

/// Performance metrics for learning
#[derive(Debug, Clone)]
pub struct MLPerformanceMetrics {
    pub execution_time_ms: u64,
    pub memory_peak_mb: usize,
    pub accuracy: f32,
    pub convergence_iterations: usize,
    pub resource_efficiency: f32,
}

/// ML performance record for learning
#[derive(Debug, Clone)]
struct MLPerformanceRecord {
    profile: MLTaskProfile,
    strategy: MLOptimizationStrategy,
    metrics: MLPerformanceMetrics,
    timestamp: Instant,
}

/// Automatic ML optimization selector
pub struct MLOptimizationSelector {
    /// Performance history by algorithm type
    performance_history: HashMap<MLAlgorithmType, Vec<MLPerformanceRecord>>,
    /// Algorithm-specific thresholds
    thresholds: HashMap<MLAlgorithmType, OptimizationThresholds>,
    /// Learning parameters
    learning_config: LearningConfig,
}

#[derive(Debug, Clone)]
struct OptimizationThresholds {
    dspy_min_samples: usize,
    dspy_min_features: usize,
    dspy_min_complexity: f32,
    resource_min_ram_mb: usize,
    time_min_budget_ms: u64,
}

#[derive(Debug, Clone)]
struct LearningConfig {
    learning_rate: f32,
    history_window: usize,
    adaptation_threshold: f32,
    min_samples_for_learning: usize,
}

impl MLOptimizationSelector {
    /// Create a new ML optimization selector
    pub fn new() -> Self {
        let mut thresholds = HashMap::new();
        
        // Algorithm-specific thresholds (learned from empirical data)
        thresholds.insert(MLAlgorithmType::BayesianOptimization, OptimizationThresholds {
            dspy_min_samples: 100,
            dspy_min_features: 10,
            dspy_min_complexity: 0.3,
            resource_min_ram_mb: 512,
            time_min_budget_ms: 5000,
        });
        
        thresholds.insert(MLAlgorithmType::GradientOptimization, OptimizationThresholds {
            dspy_min_samples: 1000,
            dspy_min_features: 50,
            dspy_min_complexity: 0.4,
            resource_min_ram_mb: 1024,
            time_min_budget_ms: 10000,
        });
        
        thresholds.insert(MLAlgorithmType::MultiObjective, OptimizationThresholds {
            dspy_min_samples: 500,
            dspy_min_features: 20,
            dspy_min_complexity: 0.5,
            resource_min_ram_mb: 2048,
            time_min_budget_ms: 30000,
        });
        
        thresholds.insert(MLAlgorithmType::OnlineLearning, OptimizationThresholds {
            dspy_min_samples: 1000,
            dspy_min_features: 30,
            dspy_min_complexity: 0.3,
            resource_min_ram_mb: 256,
            time_min_budget_ms: 1000,
        });

        thresholds.insert(MLAlgorithmType::PatternRecognition, OptimizationThresholds {
            dspy_min_samples: 500,
            dspy_min_features: 100,
            dspy_min_complexity: 0.4,
            resource_min_ram_mb: 512,
            time_min_budget_ms: 15000,
        });

        thresholds.insert(MLAlgorithmType::Clustering, OptimizationThresholds {
            dspy_min_samples: 1000,
            dspy_min_features: 20,
            dspy_min_complexity: 0.3,
            resource_min_ram_mb: 1024,
            time_min_budget_ms: 20000,
        });

        thresholds.insert(MLAlgorithmType::TextEmbedding, OptimizationThresholds {
            dspy_min_samples: 100,
            dspy_min_features: 1000,
            dspy_min_complexity: 0.2,
            resource_min_ram_mb: 2048,
            time_min_budget_ms: 30000,
        });

        thresholds.insert(MLAlgorithmType::SimilarityCalculation, OptimizationThresholds {
            dspy_min_samples: 100,
            dspy_min_features: 50,
            dspy_min_complexity: 0.2,
            resource_min_ram_mb: 256,
            time_min_budget_ms: 5000,
        });

        Self {
            performance_history: HashMap::new(),
            thresholds,
            learning_config: LearningConfig {
                learning_rate: 0.1,
                history_window: 100,
                adaptation_threshold: 0.15,
                min_samples_for_learning: 5,
            },
        }
    }

    /// Select optimal ML optimization strategy
    pub fn select_strategy(
        &mut self,
        task: &MLTaskProfile,
        system: &SystemProfile,
    ) -> MLOptimizationStrategy {
        // Multi-factor analysis
        let data_complexity_score = self.calculate_data_complexity(task);
        let resource_availability_score = self.calculate_resource_availability(system, task);
        let algorithm_suitability_score = self.calculate_algorithm_suitability(task);
        let historical_performance_score = self.calculate_historical_performance(task);
        
        // Algorithm-specific thresholds
        let thresholds = self.thresholds.get(&task.algorithm)
            .expect("Algorithm thresholds not found");

        // Weighted decision matrix
        let dspy_benefit_score = 
            0.35 * data_complexity_score +      // Data complexity drives DSPy benefit
            0.25 * resource_availability_score + // Resources enable DSPy
            0.25 * algorithm_suitability_score + // Algorithm-specific benefits
            0.15 * historical_performance_score; // Learn from history

        log::debug!(
            "ML optimization selection for {:?} - Data: {:.2}, Resources: {:.2}, Algorithm: {:.2}, History: {:.2}, Benefit: {:.2}",
            task.algorithm, data_complexity_score, resource_availability_score, 
            algorithm_suitability_score, historical_performance_score, dspy_benefit_score
        );

        // Decision logic with algorithm-specific considerations
        if self.meets_dspy_requirements(task, system, thresholds) {
            if dspy_benefit_score > 0.8 {
                MLOptimizationStrategy::DSPyOptimized
            } else if dspy_benefit_score > 0.6 {
                MLOptimizationStrategy::Hybrid
            } else if dspy_benefit_score > 0.4 && resource_availability_score < 0.5 {
                MLOptimizationStrategy::DSPyConstrained
            } else {
                MLOptimizationStrategy::Standard
            }
        } else {
            // Fallback to standard when DSPy requirements not met
            MLOptimizationStrategy::Standard
        }
    }

    /// Check if task meets minimum DSPy requirements
    fn meets_dspy_requirements(
        &self,
        task: &MLTaskProfile,
        system: &SystemProfile,
        thresholds: &OptimizationThresholds,
    ) -> bool {
        task.sample_count >= thresholds.dspy_min_samples &&
        task.feature_count >= thresholds.dspy_min_features &&
        task.time_budget_ms >= thresholds.time_min_budget_ms &&
        system.ram_mb >= thresholds.resource_min_ram_mb &&
        system.system_load < 0.8 // Not overloaded
    }

    /// Calculate data complexity score
    fn calculate_data_complexity(&self, task: &MLTaskProfile) -> f32 {
        let mut score = 0.0;

        // Sample count factor (more samples = more benefit from optimization)
        score += (task.sample_count as f32 / 100000.0).min(1.0) * 0.3;

        // Feature dimensionality factor
        score += (task.feature_count as f32 / 1000.0).min(1.0) * 0.3;

        // Target complexity factor
        score += (task.target_complexity as f32 / 100.0).min(1.0) * 0.2;

        // Sparsity factor (sparse data benefits more from optimization)
        score += task.sparsity * 0.1;

        // Tolerance factor (stricter tolerance benefits from optimization)
        score += (1.0 / (task.tolerance + 0.0001) as f32).min(1.0) * 0.1;

        score.min(1.0)
    }

    /// Calculate resource availability score
    fn calculate_resource_availability(&self, system: &SystemProfile, task: &MLTaskProfile) -> f32 {
        let mut score = 0.0;

        // RAM availability
        let estimated_ram_need = self.estimate_ram_requirement(task);
        let ram_ratio = system.ram_mb as f32 / estimated_ram_need;
        score += ram_ratio.min(2.0).max(0.0) / 2.0 * 0.4;

        // CPU availability
        score += (1.0 - system.system_load) * 0.3;

        // GPU availability bonus
        if system.gpu_memory_mb > 1024 {
            score += 0.2;
        }

        // Time budget factor
        let time_factor = if task.time_budget_ms > 30000 { 1.0 }
                         else if task.time_budget_ms > 10000 { 0.7 }
                         else if task.time_budget_ms > 5000 { 0.4 }
                         else { 0.1 };
        score += time_factor * 0.1;

        score.min(1.0)
    }

    /// Estimate RAM requirement for task
    fn estimate_ram_requirement(&self, task: &MLTaskProfile) -> f32 {
        let base_mb = match task.algorithm {
            MLAlgorithmType::BayesianOptimization => 256.0,
            MLAlgorithmType::GradientOptimization => 512.0,
            MLAlgorithmType::MultiObjective => 1024.0,
            MLAlgorithmType::OnlineLearning => 128.0,
            MLAlgorithmType::PatternRecognition => 512.0,
            MLAlgorithmType::Clustering => 256.0,
            MLAlgorithmType::TextEmbedding => 2048.0,
            MLAlgorithmType::SimilarityCalculation => 128.0,
        };

        // Scale based on data size
        let data_factor = (task.sample_count * task.feature_count) as f32 / 1000000.0;
        base_mb * (1.0 + data_factor)
    }

    /// Calculate algorithm-specific suitability for DSPy
    fn calculate_algorithm_suitability(&self, task: &MLTaskProfile) -> f32 {
        match task.algorithm {
            MLAlgorithmType::BayesianOptimization => {
                // High benefit for complex optimization landscapes
                if task.feature_count > 50 && task.target_complexity > 5 { 0.9 }
                else if task.feature_count > 20 { 0.7 }
                else { 0.4 }
            },
            MLAlgorithmType::GradientOptimization => {
                // Benefits from adaptive learning rates and momentum
                if task.sample_count > 10000 { 0.8 }
                else if task.sample_count > 1000 { 0.6 }
                else { 0.3 }
            },
            MLAlgorithmType::MultiObjective => {
                // Complex optimization space benefits greatly
                let objective_complexity = task.target_complexity as f32 / 10.0;
                objective_complexity.min(1.0) * 0.9
            },
            MLAlgorithmType::OnlineLearning => {
                // Concept drift detection benefits
                if task.sparsity > 0.3 { 0.8 }
                else { 0.5 }
            },
            MLAlgorithmType::PatternRecognition => {
                // Pattern complexity drives benefit
                if task.feature_count > 100 && task.sample_count > 1000 { 0.8 }
                else if task.feature_count > 50 { 0.6 }
                else { 0.3 }
            },
            MLAlgorithmType::Clustering => {
                // Cluster optimization and validation
                if task.sample_count > 5000 { 0.7 }
                else if task.sample_count > 1000 { 0.5 }
                else { 0.3 }
            },
            MLAlgorithmType::TextEmbedding => {
                // Vocabulary optimization benefits
                if task.feature_count > 5000 { 0.8 }
                else if task.feature_count > 1000 { 0.6 }
                else { 0.4 }
            },
            MLAlgorithmType::SimilarityCalculation => {
                // Metric selection benefits
                if task.feature_count > 100 { 0.6 }
                else { 0.3 }
            },
        }
    }

    /// Calculate historical performance score
    fn calculate_historical_performance(&self, task: &MLTaskProfile) -> f32 {
        let history = match self.performance_history.get(&task.algorithm) {
            Some(h) => h,
            None => return 0.5, // Neutral when no history
        };

        if history.len() < self.learning_config.min_samples_for_learning {
            return 0.5;
        }

        // Find similar tasks
        let similar_tasks: Vec<&MLPerformanceRecord> = history
            .iter()
            .filter(|record| self.task_similarity(task, &record.profile) > 0.6)
            .collect();

        if similar_tasks.is_empty() {
            return 0.5;
        }

        // Calculate performance ratios
        let mut dspy_performance = 0.0;
        let mut standard_performance = 0.0;
        let mut dspy_count = 0;
        let mut standard_count = 0;

        for record in similar_tasks {
            // Performance score = accuracy / (time_factor * resource_factor)
            let time_factor = (record.metrics.execution_time_ms as f32 / 1000.0).max(0.1);
            let resource_factor = (record.metrics.memory_peak_mb as f32 / 1024.0).max(0.1);
            let perf_score = record.metrics.accuracy / (time_factor * resource_factor);

            if record.strategy != MLOptimizationStrategy::Standard {
                dspy_performance += perf_score;
                dspy_count += 1;
            } else {
                standard_performance += perf_score;
                standard_count += 1;
            }
        }

        if dspy_count == 0 || standard_count == 0 {
            return 0.5;
        }

        let dspy_avg = dspy_performance / dspy_count as f32;
        let standard_avg = standard_performance / standard_count as f32;

        // Return score based on historical advantage
        if dspy_avg > standard_avg * 1.3 {
            0.9 // Strong historical advantage for DSPy
        } else if dspy_avg > standard_avg * 1.1 {
            0.7 // Moderate advantage
        } else if standard_avg > dspy_avg * 1.1 {
            0.3 // Standard performed better
        } else {
            0.5 // Similar performance
        }
    }

    /// Calculate task similarity
    fn task_similarity(&self, task1: &MLTaskProfile, task2: &MLTaskProfile) -> f32 {
        if task1.algorithm != task2.algorithm {
            return 0.0; // Different algorithms = no similarity
        }

        let sample_sim = 1.0 - ((task1.sample_count as f32 - task2.sample_count as f32).abs() 
                              / task1.sample_count.max(task2.sample_count) as f32).min(1.0);
        
        let feature_sim = 1.0 - ((task1.feature_count as f32 - task2.feature_count as f32).abs()
                               / task1.feature_count.max(task2.feature_count) as f32).min(1.0);
        
        let complexity_sim = 1.0 - ((task1.target_complexity as f32 - task2.target_complexity as f32).abs()
                                   / task1.target_complexity.max(task2.target_complexity) as f32).min(1.0);
        
        let sparsity_sim = 1.0 - (task1.sparsity - task2.sparsity).abs();

        (sample_sim + feature_sim + complexity_sim + sparsity_sim) / 4.0
    }

    /// Record performance for learning
    pub fn record_performance(
        &mut self,
        profile: MLTaskProfile,
        strategy: MLOptimizationStrategy,
        metrics: MLPerformanceMetrics,
    ) {
        let record = MLPerformanceRecord {
            profile: profile.clone(),
            strategy,
            metrics,
            timestamp: Instant::now(),
        };

        self.performance_history
            .entry(profile.algorithm)
            .or_insert_with(Vec::new)
            .push(record);

        // Limit history size per algorithm
        if let Some(history) = self.performance_history.get_mut(&profile.algorithm) {
            if history.len() > self.learning_config.history_window {
                history.remove(0);
            }
        }

        // Adapt thresholds based on performance
        self.adapt_algorithm_thresholds(&profile.algorithm);
    }

    /// Adapt algorithm-specific thresholds based on performance
    fn adapt_algorithm_thresholds(&mut self, algorithm: &MLAlgorithmType) {
        let history = match self.performance_history.get(algorithm) {
            Some(h) => h,
            None => return,
        };

        if history.len() < self.learning_config.min_samples_for_learning * 2 {
            return;
        }

        // Analyze recent performance trends
        let recent_records: Vec<&MLPerformanceRecord> = history
            .iter()
            .rev()
            .take(self.learning_config.history_window / 2)
            .collect();

        // Calculate performance advantage of DSPy vs Standard
        let mut dspy_advantage = 0.0;
        let mut comparison_count = 0;

        for record in recent_records {
            if record.strategy != MLOptimizationStrategy::Standard {
                // Find similar standard tasks for comparison
                let similar_standard: Vec<&MLPerformanceRecord> = history
                    .iter()
                    .filter(|r| r.strategy == MLOptimizationStrategy::Standard && 
                               self.task_similarity(&record.profile, &r.profile) > 0.7)
                    .collect();

                if !similar_standard.is_empty() {
                    let dspy_perf = record.metrics.accuracy / (record.metrics.execution_time_ms as f32 + 100.0);
                    let standard_perf: f32 = similar_standard.iter()
                        .map(|r| r.metrics.accuracy / (r.metrics.execution_time_ms as f32 + 100.0))
                        .sum::<f32>() / similar_standard.len() as f32;
                    
                    dspy_advantage += dspy_perf / standard_perf;
                    comparison_count += 1;
                }
            }
        }

        if comparison_count > 0 {
            let avg_advantage = dspy_advantage / comparison_count as f32;
            
            // Adapt thresholds based on performance
            if let Some(thresholds) = self.thresholds.get_mut(algorithm) {
                let adaptation_rate = self.learning_config.learning_rate;
                
                if avg_advantage > 1.2 {
                    // DSPy is performing well, lower barriers
                    thresholds.dspy_min_samples = 
                        ((thresholds.dspy_min_samples as f32 * (1.0 - adaptation_rate)) as usize).max(50);
                    thresholds.resource_min_ram_mb = 
                        ((thresholds.resource_min_ram_mb as f32 * (1.0 - adaptation_rate)) as usize).max(128);
                } else if avg_advantage < 0.9 {
                    // Standard is better, raise barriers  
                    thresholds.dspy_min_samples = 
                        (thresholds.dspy_min_samples as f32 * (1.0 + adaptation_rate)) as usize;
                    thresholds.resource_min_ram_mb = 
                        (thresholds.resource_min_ram_mb as f32 * (1.0 + adaptation_rate)) as usize;
                }

                log::debug!(
                    "Adapted thresholds for {:?} - Advantage: {:.2}, Min samples: {}, Min RAM: {}MB",
                    algorithm, avg_advantage, thresholds.dspy_min_samples, thresholds.resource_min_ram_mb
                );
            }
        }
    }

    /// Get performance statistics
    pub fn get_performance_stats(&self) -> HashMap<MLAlgorithmType, (usize, f32, f32)> {
        let mut stats = HashMap::new();
        
        for (algorithm, history) in &self.performance_history {
            if history.is_empty() {
                continue;
            }

            let total = history.len();
            let dspy_usage = history.iter()
                .filter(|r| r.strategy != MLOptimizationStrategy::Standard)
                .count() as f32 / total as f32;
            
            let avg_accuracy = history.iter()
                .map(|r| r.metrics.accuracy)
                .sum::<f32>() / total as f32;

            stats.insert(*algorithm, (total, dspy_usage, avg_accuracy));
        }
        
        stats
    }
}

impl Default for MLOptimizationSelector {
    fn default() -> Self {
        Self::new()
    }
}

/// Global ML optimization selector
static mut GLOBAL_ML_SELECTOR: Option<MLOptimizationSelector> = None;
static mut ML_SELECTOR_INITIALIZED: bool = false;

/// Get the global ML optimization selector
pub fn get_global_ml_selector() -> &'static mut MLOptimizationSelector {
    unsafe {
        if !ML_SELECTOR_INITIALIZED {
            GLOBAL_ML_SELECTOR = Some(MLOptimizationSelector::new());
            ML_SELECTOR_INITIALIZED = true;
        }
        GLOBAL_ML_SELECTOR.as_mut().unwrap()
    }
}

/// Convenience function for automatic ML strategy selection
pub fn auto_select_ml_strategy(
    task: &MLTaskProfile,
    system: &SystemProfile,
) -> MLOptimizationStrategy {
    let selector = get_global_ml_selector();
    selector.select_strategy(task, system)
}

/// Convenience function for recording ML performance
pub fn record_ml_performance(
    profile: MLTaskProfile,
    strategy: MLOptimizationStrategy,
    metrics: MLPerformanceMetrics,
) {
    let selector = get_global_ml_selector();
    selector.record_performance(profile, strategy, metrics);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_standard_selection() {
        let mut selector = MLOptimizationSelector::new();
        
        // Simple task should use standard
        let task = MLTaskProfile {
            algorithm: MLAlgorithmType::BayesianOptimization,
            feature_count: 5,
            sample_count: 50,
            target_complexity: 2,
            sparsity: 0.1,
            tolerance: 1e-3,
            time_budget_ms: 1000,
            accuracy_target: 0.8,
        };

        let system = SystemProfile {
            ram_mb: 256,
            cpu_cores: 2,
            gpu_memory_mb: 0,
            system_load: 0.9,
            disk_bandwidth_mbps: 100.0,
        };

        let strategy = selector.select_strategy(&task, &system);
        assert_eq!(strategy, MLOptimizationStrategy::Standard);
    }

    #[test]
    fn test_dspy_selection() {
        let mut selector = MLOptimizationSelector::new();
        
        // Complex task with good resources should use DSPy
        let task = MLTaskProfile {
            algorithm: MLAlgorithmType::MultiObjective,
            feature_count: 100,
            sample_count: 5000,
            target_complexity: 20,
            sparsity: 0.4,
            tolerance: 1e-6,
            time_budget_ms: 60000,
            accuracy_target: 0.95,
        };

        let system = SystemProfile {
            ram_mb: 4096,
            cpu_cores: 8,
            gpu_memory_mb: 2048,
            system_load: 0.3,
            disk_bandwidth_mbps: 500.0,
        };

        let strategy = selector.select_strategy(&task, &system);
        assert_eq!(strategy, MLOptimizationStrategy::DSPyOptimized);
    }
}