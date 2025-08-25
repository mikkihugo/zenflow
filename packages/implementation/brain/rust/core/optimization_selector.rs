//! Automatic DSPy Optimization Selection
//!
//! This module provides intelligent runtime selection of DSPy optimization
//! based on task complexity, resource availability, and performance requirements.

use std::time::Instant;
use std::sync::{Mutex, OnceLock};

/// Metrics for determining optimization strategy
#[derive(Debug, Clone)]
pub struct TaskMetrics {
    /// Number of agents involved in coordination
    pub agent_count: usize,
    /// Complexity score (0.0 to 1.0)
    pub complexity: f32,
    /// Data dimensionality
    pub dimensions: usize,
    /// Sample size
    pub samples: usize,
    /// Available memory in MB
    pub memory_mb: usize,
    /// Available CPU cores
    pub cpu_cores: usize,
    /// Time constraint in milliseconds
    pub time_limit_ms: u64,
    /// Performance requirement (0.0 to 1.0, where 1.0 is highest accuracy needed)
    pub accuracy_requirement: f32,
}

/// Resource availability assessment
#[derive(Debug, Clone)]
pub struct ResourceState {
    /// Current memory usage percentage (0.0 to 1.0)
    pub memory_usage: f32,
    /// Current CPU usage percentage (0.0 to 1.0)
    pub cpu_usage: f32,
    /// GPU availability
    pub gpu_available: bool,
    /// System load average
    pub load_average: f32,
}

/// Optimization recommendation
#[derive(Debug, Clone, PartialEq)]
pub enum OptimizationStrategy {
    /// Use basic optimization (fast, low resource)
    Basic,
    /// Use DSPy optimization (intelligent, higher resource)
    DSPy,
    /// Use DSPy with resource constraints
    DSPyConstrained,
}

/// Automatic optimization selector
pub struct OptimizationSelector {
    /// Performance history for learning
    performance_history: Vec<PerformanceRecord>,
    /// Learning rate for adaptation
    learning_rate: f32,
}

#[derive(Debug, Clone)]
struct PerformanceRecord {
    metrics: TaskMetrics,
    strategy: OptimizationStrategy,
    execution_time_ms: u64,
    accuracy: f32,
    resource_usage: f32,
    timestamp: Instant,
}

impl PerformanceRecord {
    /// Get resource usage percentage (0.0 to 1.0)
    pub fn get_resource_usage(&self) -> f32 {
        self.resource_usage
    }
    
    /// Get timestamp of this performance record
    pub fn get_timestamp(&self) -> Instant {
        self.timestamp
    }
    
    /// Calculate age of this record in milliseconds
    pub fn age_ms(&self) -> u64 {
        self.timestamp.elapsed().as_millis() as u64
    }
}

impl OptimizationSelector {
    /// Create a new optimization selector
    pub fn new() -> Self {
        Self {
            performance_history: Vec::new(),
            learning_rate: 0.1,
        }
    }

    /// Select optimization strategy automatically
    pub fn select_strategy(
        &mut self,
        metrics: &TaskMetrics,
        resources: &ResourceState,
    ) -> OptimizationStrategy {
        // Multi-factor decision algorithm
        let complexity_score = self.calculate_complexity_score(metrics);
        let resource_score = self.calculate_resource_score(resources);
        let urgency_score = self.calculate_urgency_score(metrics);
        let historical_score = self.calculate_historical_score(metrics);

        // Weighted decision matrix
        let dspy_benefit_score = 
            0.4 * complexity_score +    // High complexity benefits from DSPy
            0.3 * resource_score +      // Sufficient resources enable DSPy
            0.2 * historical_score +    // Historical performance
            0.1 * (1.0 - urgency_score); // Less urgent tasks can use DSPy

        log::debug!(
            "Optimization selection - Complexity: {:.2}, Resources: {:.2}, Urgency: {:.2}, Historical: {:.2}, DSPy Benefit: {:.2}",
            complexity_score, resource_score, urgency_score, historical_score, dspy_benefit_score
        );

        // Decision thresholds (learned from performance history)
        if dspy_benefit_score > 0.75 && resource_score > 0.6 {
            OptimizationStrategy::DSPy
        } else if dspy_benefit_score > 0.5 && resource_score > 0.3 {
            OptimizationStrategy::DSPyConstrained
        } else {
            OptimizationStrategy::Basic
        }
    }

    /// Calculate task complexity score
    fn calculate_complexity_score(&self, metrics: &TaskMetrics) -> f32 {
        let mut score = 0.0;

        // Agent count complexity (coordination gets harder with more agents)
        score += (metrics.agent_count as f32 / 100.0).min(1.0) * 0.3;

        // Direct complexity score
        score += metrics.complexity * 0.4;

        // Dimensionality complexity
        score += (metrics.dimensions as f32 / 1000.0).min(1.0) * 0.2;

        // Sample size complexity (more data = more benefit from advanced optimization)
        score += (metrics.samples as f32 / 10000.0).min(1.0) * 0.1;

        score.min(1.0)
    }

    /// Calculate resource availability score
    fn calculate_resource_score(&self, resources: &ResourceState) -> f32 {
        let mut score = 0.0;

        // Memory availability (DSPy needs memory)
        score += (1.0 - resources.memory_usage) * 0.4;

        // CPU availability
        score += (1.0 - resources.cpu_usage) * 0.3;

        // GPU availability bonus
        if resources.gpu_available {
            score += 0.2;
        }

        // System load penalty
        score -= (resources.load_average / 4.0).min(0.3);

        score.clamp(0.0, 1.0)
    }

    /// Calculate urgency score (higher = more urgent = prefer faster basic optimization)
    fn calculate_urgency_score(&self, metrics: &TaskMetrics) -> f32 {
        // Shorter time limits = higher urgency
        let time_pressure = if metrics.time_limit_ms < 1000 {
            1.0 // Very urgent
        } else if metrics.time_limit_ms < 5000 {
            0.7 // Somewhat urgent
        } else if metrics.time_limit_ms < 30000 {
            0.3 // Not very urgent
        } else {
            0.0 // No time pressure
        };

        // High accuracy requirements reduce urgency (worth spending time on DSPy)
        let accuracy_factor = 1.0 - metrics.accuracy_requirement;

        (time_pressure * 0.7 + accuracy_factor * 0.3).min(1.0)
    }

    /// Calculate historical performance score
    fn calculate_historical_score(&self, metrics: &TaskMetrics) -> f32 {
        if self.performance_history.is_empty() {
            return 0.5; // Neutral when no history
        }

        // Find similar tasks in history with age weighting
        let similar_tasks: Vec<&PerformanceRecord> = self
            .performance_history
            .iter()
            .filter(|record| {
                self.task_similarity(metrics, &record.metrics) > 0.7 && record.age_ms() < 86400000 // Within 24 hours
            })
            .collect();

        if similar_tasks.is_empty() {
            return 0.5; // Neutral when no similar tasks
        }

        // Compare DSPy vs Basic performance for similar tasks
        let dspy_performance: f32 = similar_tasks
            .iter()
            .filter(|record| record.strategy != OptimizationStrategy::Basic)
            .map(|record| record.accuracy / (record.execution_time_ms as f32 + 1.0))
            .sum();

        let basic_performance: f32 = similar_tasks
            .iter()
            .filter(|record| record.strategy == OptimizationStrategy::Basic)
            .map(|record| record.accuracy / (record.execution_time_ms as f32 + 1.0))
            .sum();

        if dspy_performance > basic_performance * 1.2 {
            0.8 // DSPy historically better
        } else if basic_performance > dspy_performance * 1.2 {
            0.2 // Basic historically better
        } else {
            0.5 // Similar performance
        }
    }

    /// Calculate similarity between tasks
    fn task_similarity(&self, task1: &TaskMetrics, task2: &TaskMetrics) -> f32 {
        let agent_sim = 1.0 - ((task1.agent_count as f32 - task2.agent_count as f32).abs() / 100.0).min(1.0);
        let complexity_sim = 1.0 - (task1.complexity - task2.complexity).abs();
        let dimension_sim = 1.0 - ((task1.dimensions as f32 - task2.dimensions as f32).abs() / 1000.0).min(1.0);

        (agent_sim + complexity_sim + dimension_sim) / 3.0
    }

    /// Record performance for learning
    pub fn record_performance(
        &mut self,
        metrics: TaskMetrics,
        strategy: OptimizationStrategy,
        execution_time_ms: u64,
        accuracy: f32,
        resource_usage: f32,
    ) {
        let record = PerformanceRecord {
            metrics,
            strategy,
            execution_time_ms,
            accuracy,
            resource_usage,
            timestamp: Instant::now(),
        };

        self.performance_history.push(record);

        // Limit history size for memory efficiency
        if self.performance_history.len() > 1000 {
            self.performance_history.remove(0);
        }

        // Adapt decision thresholds based on performance
        self.adapt_thresholds();
    }

    /// Adapt decision thresholds based on performance history
    fn adapt_thresholds(&mut self) {
        if self.performance_history.len() < 10 {
            return;
        }

        // Analyze recent performance trends
        let recent_records: Vec<&PerformanceRecord> = self
            .performance_history
            .iter()
            .rev()
            .take(50)
            .collect();

        // Calculate average performance by strategy
        let mut dspy_performance = 0.0;
        let mut basic_performance = 0.0;
        let mut dspy_count = 0;
        let mut basic_count = 0;

        for record in &recent_records {
            let perf_score = record.accuracy / (record.execution_time_ms as f32 / 1000.0 + 0.1);
            
            // Apply age weighting and resource usage considerations
            let age_weight = 1.0 - (record.age_ms() as f32 / 86400000.0).min(0.5); // Newer records weighted higher
            let resource_penalty = record.get_resource_usage() * 0.1; // Light penalty for high resource usage
            let weighted_score = perf_score * age_weight * (1.0 - resource_penalty);
            
            if record.strategy != OptimizationStrategy::Basic {
                dspy_performance += weighted_score;
                dspy_count += 1;
            } else {
                basic_performance += weighted_score;
                basic_count += 1;
            }
        }

        if dspy_count > 0 && basic_count > 0 {
            let dspy_avg = dspy_performance / dspy_count as f32;
            let basic_avg = basic_performance / basic_count as f32;
            
            // Adapt learning based on performance difference
            if dspy_avg > basic_avg * 1.1 {
                // DSPy is performing well, slightly lower threshold
                self.learning_rate = (self.learning_rate + 0.01).min(0.2);
            } else if basic_avg > dspy_avg * 1.1 {
                // Basic is performing better, slightly raise threshold  
                self.learning_rate = (self.learning_rate - 0.01).max(0.05);
            }
        }

        // Log performance history analysis with timestamp information
        let avg_age_ms = if !recent_records.is_empty() {
            recent_records.iter().map(|r| r.age_ms()).sum::<u64>() / recent_records.len() as u64
        } else {
            0
        };
        
        // Log most recent timestamp for debugging
        let latest_timestamp = recent_records.first().map(|r| r.get_timestamp());
        
        log::debug!(
            "Threshold adaptation - Learning rate: {:.3}, DSPy samples: {}, Basic samples: {}, Avg record age: {}ms, Latest: {:?}",
            self.learning_rate, dspy_count, basic_count, avg_age_ms, latest_timestamp
        );
    }

    /// Get current performance statistics with resource usage analysis
    pub fn get_performance_stats(&self) -> (usize, f32, f32) {
        if self.performance_history.is_empty() {
            return (0, 0.0, 0.0);
        }

        let total_records = self.performance_history.len();
        let dspy_usage = self.performance_history
            .iter()
            .filter(|r| r.strategy != OptimizationStrategy::Basic)
            .count() as f32 / total_records as f32;

        // Calculate weighted accuracy considering resource usage and age
        let weighted_accuracy: f32 = self.performance_history
            .iter()
            .map(|r| {
                let age_weight = 1.0 - (r.age_ms() as f32 / 86400000.0).min(0.5);
                let resource_factor = 1.0 - (r.get_resource_usage() * 0.1);
                r.accuracy * age_weight * resource_factor
            })
            .sum::<f32>() / total_records as f32;

        (total_records, dspy_usage, weighted_accuracy)
    }
}

impl Default for OptimizationSelector {
    fn default() -> Self {
        Self::new()
    }
}

/// Global optimization selector instance
static GLOBAL_SELECTOR: OnceLock<Mutex<OptimizationSelector>> = OnceLock::new();

/// Get the global optimization selector
pub fn get_global_selector() -> &'static Mutex<OptimizationSelector> {
    GLOBAL_SELECTOR.get_or_init(|| Mutex::new(OptimizationSelector::new()))
}

/// Get a reference to the global selector for read operations
pub fn with_global_selector<F, R>(f: F) -> R 
where
    F: FnOnce(&OptimizationSelector) -> R,
{
    let selector = get_global_selector().lock().unwrap();
    f(&selector)
}

/// Get a mutable reference to the global selector for write operations
pub fn with_global_selector_mut<F, R>(f: F) -> R 
where
    F: FnOnce(&mut OptimizationSelector) -> R,
{
    let mut selector = get_global_selector().lock().unwrap();
    f(&mut selector)
}

/// Convenience function for automatic strategy selection
pub fn auto_select_strategy(
    metrics: &TaskMetrics,
    resources: &ResourceState,
) -> OptimizationStrategy {
    with_global_selector_mut(|selector| selector.select_strategy(metrics, resources))
}

/// Convenience function for recording performance
pub fn record_optimization_performance(
    metrics: TaskMetrics,
    strategy: OptimizationStrategy,
    execution_time_ms: u64,
    accuracy: f32,
    resource_usage: f32,
) {
    with_global_selector_mut(|selector| {
        selector.record_performance(metrics, strategy, execution_time_ms, accuracy, resource_usage);
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_selection() {
        let mut selector = OptimizationSelector::new();
        
        // Simple task should use basic optimization
        let metrics = TaskMetrics {
            agent_count: 2,
            complexity: 0.2,
            dimensions: 10,
            samples: 100,
            memory_mb: 1024,
            cpu_cores: 4,
            time_limit_ms: 1000,
            accuracy_requirement: 0.5,
        };

        let resources = ResourceState {
            memory_usage: 0.8,
            cpu_usage: 0.9,
            gpu_available: false,
            load_average: 3.0,
        };

        let strategy = selector.select_strategy(&metrics, &resources);
        assert_eq!(strategy, OptimizationStrategy::Basic);
    }

    #[test]
    fn test_dspy_selection() {
        let mut selector = OptimizationSelector::new();
        
        // Complex task with good resources should use DSPy
        let metrics = TaskMetrics {
            agent_count: 50,
            complexity: 0.9,
            dimensions: 500,
            samples: 10000,
            memory_mb: 8192,
            cpu_cores: 16,
            time_limit_ms: 60000,
            accuracy_requirement: 0.95,
        };

        let resources = ResourceState {
            memory_usage: 0.3,
            cpu_usage: 0.2,
            gpu_available: true,
            load_average: 1.0,
        };

        let strategy = selector.select_strategy(&metrics, &resources);
        assert_eq!(strategy, OptimizationStrategy::DSPy);
    }

    #[test]
    fn test_performance_recording() {
        let mut selector = OptimizationSelector::new();
        
        let metrics = TaskMetrics {
            agent_count: 10,
            complexity: 0.5,
            dimensions: 100,
            samples: 1000,
            memory_mb: 2048,
            cpu_cores: 8,
            time_limit_ms: 10000,
            accuracy_requirement: 0.8,
        };

        // Record some performance data
        selector.record_performance(
            metrics.clone(),
            OptimizationStrategy::DSPy,
            5000,
            0.92,
            0.6,
        );

        let (count, usage, accuracy) = selector.get_performance_stats();
        assert_eq!(count, 1);
        assert_eq!(usage, 1.0); // 100% DSPy usage
        assert_eq!(accuracy, 0.92);
    }
}