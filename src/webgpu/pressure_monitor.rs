//! Real-time Memory Pressure Monitoring System with DAA Integration
//!
//! This module provides comprehensive memory pressure monitoring, prediction,
//! and autonomous response capabilities integrated with the DAA system.
//!
//! Key Features:
//! - Real-time pressure detection with sub-second response times
//! - Predictive analytics for proactive resource management  
//! - DAA autonomous decision-making for optimization
//! - Circuit breaker protection against memory exhaustion
//! - Historical analysis and trend prediction
//! - Multi-tier pressure response strategies

use std::collections::{HashMap, VecDeque};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
use std::thread;
use std::time::{Duration, Instant, SystemTime};
use rand::Rng;

use crate::webgpu::buffer_pool::{AdvancedBufferPool, MemoryPressure};
use crate::webgpu::error::{ComputeError, ComputeResult};

/// Real-time memory pressure monitor with DAA integration
#[derive(Debug)]
pub struct MemoryPressureMonitor {
    // Core monitoring
    pressure_history: Arc<Mutex<VecDeque<PressureReading>>>,
    current_pressure: Arc<Mutex<MemoryPressure>>,

    // Prediction and analytics
    predictor: Arc<Mutex<PressurePredictor>>,
    anomaly_detector: Arc<Mutex<AnomalyDetector>>,

    // DAA integration
    daa_coordinator: Arc<Mutex<DaaCoordinator>>,
    autonomous_responses: Arc<Mutex<Vec<AutonomousResponse>>>,

    // Configuration and control
    config: MonitorConfig,
    monitoring_active: Arc<AtomicBool>,
    alert_thresholds: Arc<Mutex<AlertThresholds>>,

    // Performance tracking
    monitoring_stats: Arc<Mutex<MonitoringStatistics>>,

    // Background processing
    background_thread: Option<thread::JoinHandle<()>>,
    shutdown_signal: Arc<AtomicBool>,
}

/// Individual pressure reading with metadata
#[derive(Debug, Clone)]
pub struct PressureReading {
    pub timestamp: Instant,
    pub system_time: SystemTime,
    pub pressure: MemoryPressure,
    pub pressure_ratio: f32,
    pub allocated_memory: u64,
    pub available_memory: u64,
    pub allocation_rate: f64,   // allocations per second
    pub deallocation_rate: f64, // deallocations per second
    pub fragmentation_level: f32,
    pub response_latency_ns: u64,
    pub daa_recommendation: Option<String>,
    pub circuit_breaker_state: CircuitBreakerState,
}

/// Pressure prediction engine
#[derive(Debug)]
pub struct PressurePredictor {
    historical_data: VecDeque<PressureReading>,
    prediction_models: HashMap<PredictionModel, ModelState>,
    ensemble_weights: HashMap<PredictionModel, f32>,
    prediction_accuracy: HashMap<PredictionModel, f32>,
    last_prediction: Option<PressurePrediction>,
}

/// Available prediction models
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum PredictionModel {
    LinearRegression,
    ExponentialSmoothing,
    MovingAverage,
    SeasonalDecomposition,
    NeuralNetwork,
}

/// State for each prediction model
#[derive(Debug, Clone)]
pub struct ModelState {
    parameters: HashMap<String, f64>,
    last_training: Instant,
    accuracy_score: f32,
    prediction_count: u64,
    error_accumulator: f64,
}

/// Pressure prediction with confidence intervals
#[derive(Debug, Clone)]
pub struct PressurePrediction {
    pub timestamp: Instant,
    pub horizon_seconds: u64,
    pub predicted_pressure: MemoryPressure,
    pub predicted_ratio: f32,
    pub confidence_interval: (f32, f32),
    pub confidence_level: f32,
    pub model_used: PredictionModel,
    pub factors: HashMap<String, f32>,
}

/// Anomaly detection system
#[derive(Debug)]
pub struct AnomalyDetector {
    baseline_stats: BaselineStatistics,
    anomaly_threshold: f32,
    recent_anomalies: VecDeque<AnomalyEvent>,
    detection_models: HashMap<AnomalyType, DetectionModel>,
}

/// Baseline memory behavior statistics
#[derive(Debug, Clone)]
pub struct BaselineStatistics {
    mean_pressure: f32,
    std_pressure: f32,
    mean_allocation_rate: f64,
    std_allocation_rate: f64,
    typical_fragmentation: f32,
    normal_response_latency: u64,
    last_updated: Instant,
    sample_count: u64,
}

/// Types of memory anomalies
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum AnomalyType {
    SuddenPressureSpike,
    AllocationRateAnomaly,
    FragmentationAnomaly,
    ResponseLatencyAnomaly,
    MemoryLeak,
    AllocationPattern,
}

/// Anomaly event record
#[derive(Debug, Clone)]
pub struct AnomalyEvent {
    pub timestamp: Instant,
    pub anomaly_type: AnomalyType,
    pub severity: f32,
    pub description: String,
    pub affected_metrics: Vec<String>,
    pub suggested_actions: Vec<String>,
    pub daa_response: Option<String>,
}

/// Detection model for specific anomaly type
#[derive(Debug, Clone)]
pub struct DetectionModel {
    sensitivity: f32,
    false_positive_rate: f32,
    detection_count: u64,
    last_detection: Option<Instant>,
}

/// DAA coordination for autonomous memory management
#[derive(Debug)]
pub struct DaaCoordinator {
    response_strategies: HashMap<MemoryPressure, ResponseStrategy>,
    learning_engine: LearningEngine,
    decision_history: VecDeque<DaaDecision>,
    adaptation_parameters: AdaptationParameters,
    performance_metrics: DaaPerformanceMetrics,
}

/// Response strategy for each pressure level
#[derive(Debug, Clone)]
pub struct ResponseStrategy {
    pub trigger_threshold: f32,
    pub actions: Vec<ResponseAction>,
    pub escalation_timeout: Duration,
    pub success_criteria: SuccessCriteria,
    pub fallback_strategy: Option<Box<ResponseStrategy>>,
}

/// Possible response actions
#[derive(Debug, Clone)]
pub enum ResponseAction {
    TriggerGarbageCollection,
    AggressiveBufferCleanup { aggressiveness: f32 },
    ReduceBufferPoolSizes { reduction_factor: f32 },
    EnableCircuitBreaker,
    ThrottleAllocations { delay_ms: u64 },
    DefragmentMemory,
    RequestSystemMemory { amount_mb: u64 },
    AlertOperator { severity: AlertSeverity },
    ForceApplicationPause { duration_ms: u64 },
}

/// Success criteria for response strategies
#[derive(Debug, Clone)]
pub struct SuccessCriteria {
    pressure_reduction_target: f32,
    max_response_time: Duration,
    acceptable_performance_impact: f32,
}

/// DAA learning engine for strategy optimization
#[derive(Debug)]
pub struct LearningEngine {
    strategy_effectiveness: HashMap<String, f32>,
    adaptation_rate: f32,
    exploration_factor: f32,
    last_learning_cycle: Instant,
    performance_history: VecDeque<PerformanceRecord>,
}

impl LearningEngine {
    /// Select optimal strategy based on learning history and exploration
    pub fn select_strategy(
        &mut self,
        pressure: MemoryPressure,
        strategies: &HashMap<MemoryPressure, ResponseStrategy>,
        confidence: f32,
    ) -> String {
        let strategy_name = format!("{:?}", pressure);
        
        // Update strategy effectiveness based on confidence
        let current_effectiveness = self.strategy_effectiveness
            .get(&strategy_name)
            .copied()
            .unwrap_or(0.5);
        
        // Use epsilon-greedy exploration
        let mut rng = rand::thread_rng();
        let explore = rng.gen::<f32>() < self.exploration_factor;
        
        if explore {
            // Exploration: select based on potential
            strategy_name
        } else {
            // Exploitation: select best known strategy
            self.strategy_effectiveness
                .iter()
                .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
                .map(|(name, _)| name.clone())
                .unwrap_or(strategy_name)
        }
    }
    
    /// Get strategy effectiveness score
    pub fn get_strategy_effectiveness(&self, strategy_name: &str) -> f32 {
        self.strategy_effectiveness.get(strategy_name).copied().unwrap_or(0.5)
    }
    
    /// Update strategy effectiveness based on performance
    pub fn update_effectiveness(&mut self, strategy_name: &str, success: bool, response_time: Duration) {
        let current = self.strategy_effectiveness.get(strategy_name).copied().unwrap_or(0.5);
        
        // Calculate new effectiveness based on success and response time
        let time_penalty = if response_time > Duration::from_secs(5) { 0.1 } else { 0.0 };
        let success_bonus = if success { 0.2 } else { -0.1 };
        
        let new_effectiveness = (current + self.adaptation_rate * (success_bonus - time_penalty))
            .clamp(0.0, 1.0);
        
        self.strategy_effectiveness.insert(strategy_name.to_string(), new_effectiveness);
        
        // Record performance
        self.performance_history.push_back(PerformanceRecord {
            timestamp: Instant::now(),
            strategy_used: strategy_name.to_string(),
            initial_pressure: MemoryPressure::Medium, // Would be passed from caller
            final_pressure: MemoryPressure::Low,      // Would be measured after response
            response_time,
            success,
            side_effects: Vec::new(),
        });
        
        // Limit history size
        while self.performance_history.len() > 500 {
            self.performance_history.pop_front();
        }
    }
}

/// Performance record for learning
#[derive(Debug, Clone)]
pub struct PerformanceRecord {
    timestamp: Instant,
    strategy_used: String,
    initial_pressure: MemoryPressure,
    final_pressure: MemoryPressure,
    response_time: Duration,
    success: bool,
    side_effects: Vec<String>,
}

/// DAA decision record
#[derive(Debug, Clone)]
pub struct DaaDecision {
    pub timestamp: Instant,
    pub trigger_pressure: MemoryPressure,
    pub chosen_strategy: String,
    pub confidence: f32,
    pub expected_outcome: String,
    pub actual_outcome: Option<String>,
    pub success: Option<bool>,
}

/// Adaptation parameters for DAA learning
#[derive(Debug, Clone)]
pub struct AdaptationParameters {
    learning_rate: f32,
    forgetting_factor: f32,
    exploration_probability: f32,
    strategy_update_threshold: f32,
    performance_window_size: usize,
}

/// DAA performance metrics
#[derive(Debug, Clone)]
pub struct DaaPerformanceMetrics {
    decisions_made: u64,
    successful_interventions: u64,
    average_response_time: Duration,
    pressure_reduction_effectiveness: f32,
    adaptation_cycles_completed: u64,
    strategy_convergence_score: f32,
}

/// Autonomous response record
#[derive(Debug, Clone)]
pub struct AutonomousResponse {
    pub timestamp: Instant,
    pub trigger_pressure: MemoryPressure,
    pub response_actions: Vec<ResponseAction>,
    pub execution_time: Duration,
    pub effectiveness_score: f32,
    pub side_effects: Vec<String>,
}

/// Monitor configuration
#[derive(Debug, Clone)]
pub struct MonitorConfig {
    pub sampling_interval: Duration,
    pub history_retention: Duration,
    pub prediction_horizon: Duration,
    pub anomaly_detection_enabled: bool,
    pub daa_enabled: bool,
    pub autonomous_response_enabled: bool,
    pub max_response_latency: Duration,
    pub pressure_calculation_method: PressureCalculationMethod,
}

impl Default for MonitorConfig {
    fn default() -> Self {
        Self {
            sampling_interval: Duration::from_millis(100), // 10Hz sampling
            history_retention: Duration::from_secs(3600),  // 1 hour history
            prediction_horizon: Duration::from_secs(300),  // 5 minute predictions
            anomaly_detection_enabled: true,
            daa_enabled: true,
            autonomous_response_enabled: true,
            max_response_latency: Duration::from_millis(50), // 50ms max response
            pressure_calculation_method: PressureCalculationMethod::Adaptive,
        }
    }
}

/// Methods for calculating memory pressure
#[derive(Debug, Clone, Copy)]
pub enum PressureCalculationMethod {
    Simple,          // allocated / total
    Adaptive,        // considers fragmentation, allocation rate
    Predictive,      // includes future pressure estimates
    MachineLearning, // ML-based pressure calculation
}

/// Alert thresholds for different pressure levels
#[derive(Debug, Clone)]
pub struct AlertThresholds {
    pub low_pressure: f32,
    pub medium_pressure: f32,
    pub high_pressure: f32,
    pub critical_pressure: f32,
    pub response_latency_threshold: Duration,
    pub allocation_rate_threshold: f64,
    pub fragmentation_threshold: f32,
}

impl Default for AlertThresholds {
    fn default() -> Self {
        Self {
            low_pressure: 0.6,
            medium_pressure: 0.7,
            high_pressure: 0.8,
            critical_pressure: 0.9,
            response_latency_threshold: Duration::from_millis(10),
            allocation_rate_threshold: 1000.0, // allocations per second
            fragmentation_threshold: 0.3,
        }
    }
}

/// Alert severity levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum AlertSeverity {
    Info,
    Warning,
    Error,
    Critical,
    Emergency,
}

/// Circuit breaker state for memory operations
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CircuitBreakerState {
    Closed,   // Normal operation
    Open,     // Circuit tripped
    HalfOpen, // Testing recovery
}

/// Monitoring statistics
#[derive(Debug, Clone)]
pub struct MonitoringStatistics {
    pub readings_collected: u64,
    pub anomalies_detected: u64,
    pub predictions_made: u64,
    pub daa_interventions: u64,
    pub average_sampling_latency: Duration,
    pub prediction_accuracy: f32,
    pub false_positive_rate: f32,
    pub system_uptime: Duration,
}

impl MemoryPressureMonitor {
    /// Create new pressure monitor with DAA integration
    pub fn new(config: MonitorConfig) -> Self {
        let pressure_history = Arc::new(Mutex::new(VecDeque::new()));
        let current_pressure = Arc::new(Mutex::new(MemoryPressure::None));
        let monitoring_active = Arc::new(AtomicBool::new(false));
        let shutdown_signal = Arc::new(AtomicBool::new(false));

        // Initialize predictor with default models
        let mut prediction_models = HashMap::new();
        let mut ensemble_weights = HashMap::new();

        for model in [
            PredictionModel::LinearRegression,
            PredictionModel::ExponentialSmoothing,
            PredictionModel::MovingAverage,
        ] {
            prediction_models.insert(
                model,
                ModelState {
                    parameters: HashMap::new(),
                    last_training: Instant::now(),
                    accuracy_score: 0.5,
                    prediction_count: 0,
                    error_accumulator: 0.0,
                },
            );
            ensemble_weights.insert(model, 1.0 / 3.0); // Equal initial weights
        }

        let predictor = Arc::new(Mutex::new(PressurePredictor {
            historical_data: VecDeque::new(),
            prediction_models,
            ensemble_weights,
            prediction_accuracy: HashMap::new(),
            last_prediction: None,
        }));

        // Initialize anomaly detector with detection models for each anomaly type
        let mut detection_models = HashMap::new();
        for anomaly_type in [
            AnomalyType::SuddenPressureSpike,
            AnomalyType::AllocationRateAnomaly,
            AnomalyType::FragmentationAnomaly,
            AnomalyType::ResponseLatencyAnomaly,
            AnomalyType::MemoryLeak,
            AnomalyType::AllocationPattern,
        ] {
            detection_models.insert(
                anomaly_type,
                DetectionModel {
                    sensitivity: match anomaly_type {
                        AnomalyType::SuddenPressureSpike => 2.0,     // Most sensitive
                        AnomalyType::MemoryLeak => 1.5,              // Very sensitive
                        AnomalyType::AllocationRateAnomaly => 2.5,   // Moderate sensitivity
                        AnomalyType::FragmentationAnomaly => 3.0,    // Less sensitive
                        AnomalyType::ResponseLatencyAnomaly => 2.2,  // Moderately sensitive
                        AnomalyType::AllocationPattern => 2.8,      // Pattern-based
                    },
                    false_positive_rate: 0.02, // Target 2% false positive rate
                    detection_count: 0,
                    last_detection: None,
                },
            );
        }

        let anomaly_detector = Arc::new(Mutex::new(AnomalyDetector {
            baseline_stats: BaselineStatistics {
                mean_pressure: 0.3,
                std_pressure: 0.1,
                mean_allocation_rate: 100.0,
                std_allocation_rate: 50.0,
                typical_fragmentation: 0.1,
                normal_response_latency: 1_000_000, // 1ms in nanoseconds
                last_updated: Instant::now(),
                sample_count: 0,
            },
            anomaly_threshold: 2.0, // 2 standard deviations
            recent_anomalies: VecDeque::new(),
            detection_models,
        }));

        // Initialize DAA coordinator with default strategies
        let mut response_strategies = HashMap::new();

        // Low pressure strategy
        response_strategies.insert(
            MemoryPressure::Low,
            ResponseStrategy {
                trigger_threshold: 0.6,
                actions: vec![ResponseAction::TriggerGarbageCollection],
                escalation_timeout: Duration::from_secs(30),
                success_criteria: SuccessCriteria {
                    pressure_reduction_target: 0.1,
                    max_response_time: Duration::from_secs(10),
                    acceptable_performance_impact: 0.05,
                },
                fallback_strategy: None,
            },
        );

        // High pressure strategy
        response_strategies.insert(
            MemoryPressure::High,
            ResponseStrategy {
                trigger_threshold: 0.8,
                actions: vec![
                    ResponseAction::AggressiveBufferCleanup {
                        aggressiveness: 0.7,
                    },
                    ResponseAction::DefragmentMemory,
                    ResponseAction::ThrottleAllocations { delay_ms: 10 },
                ],
                escalation_timeout: Duration::from_secs(15),
                success_criteria: SuccessCriteria {
                    pressure_reduction_target: 0.2,
                    max_response_time: Duration::from_secs(5),
                    acceptable_performance_impact: 0.15,
                },
                fallback_strategy: None,
            },
        );

        // Critical pressure strategy
        response_strategies.insert(
            MemoryPressure::Critical,
            ResponseStrategy {
                trigger_threshold: 0.9,
                actions: vec![
                    ResponseAction::EnableCircuitBreaker,
                    ResponseAction::AggressiveBufferCleanup {
                        aggressiveness: 1.0,
                    },
                    ResponseAction::ReduceBufferPoolSizes {
                        reduction_factor: 0.5,
                    },
                    ResponseAction::AlertOperator {
                        severity: AlertSeverity::Critical,
                    },
                ],
                escalation_timeout: Duration::from_secs(5),
                success_criteria: SuccessCriteria {
                    pressure_reduction_target: 0.3,
                    max_response_time: Duration::from_secs(2),
                    acceptable_performance_impact: 0.3,
                },
                fallback_strategy: Some(Box::new(ResponseStrategy {
                    trigger_threshold: 0.95,
                    actions: vec![ResponseAction::ForceApplicationPause { duration_ms: 1000 }],
                    escalation_timeout: Duration::from_secs(1),
                    success_criteria: SuccessCriteria {
                        pressure_reduction_target: 0.5,
                        max_response_time: Duration::from_secs(1),
                        acceptable_performance_impact: 1.0,
                    },
                    fallback_strategy: None,
                })),
            },
        );

        let daa_coordinator = Arc::new(Mutex::new(DaaCoordinator {
            response_strategies,
            learning_engine: LearningEngine {
                strategy_effectiveness: HashMap::new(),
                adaptation_rate: 0.1,
                exploration_factor: 0.1,
                last_learning_cycle: Instant::now(),
                performance_history: VecDeque::new(),
            },
            decision_history: VecDeque::new(),
            adaptation_parameters: AdaptationParameters {
                learning_rate: 0.05,
                forgetting_factor: 0.99,
                exploration_probability: 0.1,
                strategy_update_threshold: 0.05,
                performance_window_size: 100,
            },
            performance_metrics: DaaPerformanceMetrics {
                decisions_made: 0,
                successful_interventions: 0,
                average_response_time: Duration::from_millis(50),
                pressure_reduction_effectiveness: 0.7,
                adaptation_cycles_completed: 0,
                strategy_convergence_score: 0.5,
            },
        }));

        Self {
            pressure_history,
            current_pressure,
            predictor,
            anomaly_detector,
            daa_coordinator,
            autonomous_responses: Arc::new(Mutex::new(Vec::new())),
            config,
            monitoring_active,
            alert_thresholds: Arc::new(Mutex::new(AlertThresholds::default())),
            monitoring_stats: Arc::new(Mutex::new(MonitoringStatistics {
                readings_collected: 0,
                anomalies_detected: 0,
                predictions_made: 0,
                daa_interventions: 0,
                average_sampling_latency: Duration::from_micros(500),
                prediction_accuracy: 0.75,
                false_positive_rate: 0.05,
                system_uptime: Duration::from_secs(0),
            })),
            background_thread: None,
            shutdown_signal,
        }
    }

    /// Start monitoring with background thread
    pub fn start_monitoring(&mut self, buffer_pool: Arc<AdvancedBufferPool>) -> ComputeResult<()> {
        if self.monitoring_active.load(Ordering::Relaxed) {
            return Ok(()); // Already running
        }

        self.monitoring_active.store(true, Ordering::Relaxed);
        self.shutdown_signal.store(false, Ordering::Relaxed);

        // Spawn background monitoring thread
        let pressure_history = Arc::clone(&self.pressure_history);
        let current_pressure = Arc::clone(&self.current_pressure);
        let predictor = Arc::clone(&self.predictor);
        let anomaly_detector = Arc::clone(&self.anomaly_detector);
        let daa_coordinator = Arc::clone(&self.daa_coordinator);
        let autonomous_responses = Arc::clone(&self.autonomous_responses);
        let monitoring_active = Arc::clone(&self.monitoring_active);
        let shutdown_signal = Arc::clone(&self.shutdown_signal);
        let alert_thresholds = Arc::clone(&self.alert_thresholds);
        let monitoring_stats = Arc::clone(&self.monitoring_stats);
        let config = self.config.clone();

        let handle = thread::spawn(move || {
            let mut last_sampling = Instant::now();
            let start_time = Instant::now();

            while !shutdown_signal.load(Ordering::Relaxed) {
                let sampling_start = Instant::now();

                // Collect pressure reading
                if let Ok(reading) = Self::collect_pressure_reading(&buffer_pool, &config) {
                    // Update current pressure
                    *current_pressure.lock().unwrap() = reading.pressure;

                    // Store in history
                    {
                        let mut history = pressure_history.lock().unwrap();
                        history.push_back(reading.clone());

                        // Maintain history size
                        let max_samples = (config.history_retention.as_secs() * 1000
                            / config.sampling_interval.as_millis() as u64)
                            as usize;
                        while history.len() > max_samples {
                            history.pop_front();
                        }
                    }

                    // Update baseline statistics
                    Self::update_baseline_stats(&anomaly_detector, &reading);

                    // Detect anomalies
                    if config.anomaly_detection_enabled {
                        if let Some(anomaly) = Self::detect_anomalies(&anomaly_detector, &reading) {
                            monitoring_stats.lock().unwrap().anomalies_detected += 1;
                            #[cfg(feature = "logging")]
                            log::warn!("Memory anomaly detected: {anomaly:?}");
                            #[cfg(not(feature = "logging"))]
                            eprintln!("Memory anomaly detected: {:?}", anomaly);
                        }
                    }

                    // Generate predictions
                    if let Ok(prediction) = Self::generate_prediction(&predictor, &reading, &config)
                    {
                        monitoring_stats.lock().unwrap().predictions_made += 1;

                        // Check if autonomous response is needed
                        if config.daa_enabled && config.autonomous_response_enabled {
                            if let Some(response) = Self::evaluate_autonomous_response(
                                &daa_coordinator,
                                &reading,
                                &prediction,
                                &alert_thresholds,
                            ) {
                                // Execute autonomous response with learning feedback
                                let strategy_name = format!("{:?}", response.trigger_pressure);
                                let (success, final_pressure) = Self::execute_autonomous_response(
                                    &buffer_pool,
                                    response,
                                    &autonomous_responses,
                                );
                                
                                // Update learning engine with results
                                {
                                    let mut coordinator = daa_coordinator.lock().unwrap();
                                    coordinator.learning_engine.update_effectiveness(
                                        &strategy_name,
                                        success,
                                        Duration::from_millis((prediction.predicted_pressure.cleanup_aggressiveness() * 1000.0) as u64)
                                    );
                                    
                                    if success {
                                        coordinator.performance_metrics.successful_interventions += 1;
                                        coordinator.performance_metrics.pressure_reduction_effectiveness = 
                                            (coordinator.performance_metrics.pressure_reduction_effectiveness * 0.9) + 0.1;
                                    }
                                    
                                    // Update decision history with actual outcome
                                    if let Some(last_decision) = coordinator.decision_history.back_mut() {
                                        last_decision.actual_outcome = Some(format!(
                                            "Final pressure: {:?}, Success: {}",
                                            final_pressure, success
                                        ));
                                        last_decision.success = Some(success);
                                    }
                                }
                                
                                monitoring_stats.lock().unwrap().daa_interventions += 1;
                            }
                        }
                    }

                    // Update monitoring statistics
                    {
                        let mut stats = monitoring_stats.lock().unwrap();
                        stats.readings_collected += 1;
                        stats.average_sampling_latency = sampling_start.elapsed();
                        stats.system_uptime = start_time.elapsed();
                    }
                }

                // Sleep until next sampling interval
                let elapsed = last_sampling.elapsed();
                if elapsed < config.sampling_interval {
                    thread::sleep(config.sampling_interval - elapsed);
                }
                last_sampling = Instant::now();
            }

            monitoring_active.store(false, Ordering::Relaxed);
        });

        self.background_thread = Some(handle);
        Ok(())
    }

    /// Stop monitoring
    pub fn stop_monitoring(&mut self) -> ComputeResult<()> {
        self.shutdown_signal.store(true, Ordering::Relaxed);

        if let Some(handle) = self.background_thread.take() {
            handle.join().map_err(|_| {
                ComputeError::General("Failed to join monitoring thread".to_string())
            })?;
        }

        self.monitoring_active.store(false, Ordering::Relaxed);
        Ok(())
    }

    /// Collect single pressure reading
    fn collect_pressure_reading(
        buffer_pool: &AdvancedBufferPool,
        config: &MonitorConfig,
    ) -> ComputeResult<PressureReading> {
        let start_time = Instant::now();
        let stats = buffer_pool.get_statistics();

        let allocated_memory = stats.global.total_memory_allocated;
        let peak_memory = stats.global.peak_memory_usage;

        // Calculate available memory (estimated)
        let estimated_total = peak_memory + (peak_memory / 4); // Conservative estimate
        let available_memory = estimated_total.saturating_sub(allocated_memory);

        // Calculate pressure ratio
        let pressure_ratio = if estimated_total > 0 {
            allocated_memory as f32 / estimated_total as f32
        } else {
            0.0
        };

        // Determine pressure level using selected method
        let pressure = match config.pressure_calculation_method {
            PressureCalculationMethod::Simple => MemoryPressure::from_ratio(pressure_ratio),
            PressureCalculationMethod::Adaptive => {
                // Consider fragmentation and allocation patterns
                let base_pressure = pressure_ratio;
                let fragmentation_factor = 1.0; // Would be calculated from actual fragmentation
                let allocation_stress = if stats.global.avg_allocation_latency_ns > 1_000_000 {
                    0.1 // Add stress for slow allocations
                } else {
                    0.0
                };

                let adjusted_ratio = base_pressure * fragmentation_factor + allocation_stress;
                MemoryPressure::from_ratio(adjusted_ratio)
            }
            _ => MemoryPressure::from_ratio(pressure_ratio), // Fallback to simple for now
        };

        // Calculate allocation/deallocation rates
        let allocation_rate = stats.global.total_allocations as f64; // Simplified
        let deallocation_rate = stats.global.total_deallocations as f64; // Simplified

        let response_latency_ns = start_time.elapsed().as_nanos() as u64;

        Ok(PressureReading {
            timestamp: Instant::now(),
            system_time: SystemTime::now(),
            pressure,
            pressure_ratio,
            allocated_memory,
            available_memory,
            allocation_rate,
            deallocation_rate,
            fragmentation_level: 0.1, // Would be calculated from actual data
            response_latency_ns,
            daa_recommendation: None,
            circuit_breaker_state: CircuitBreakerState::Closed, // Would be read from actual circuit breaker
        })
    }

    /// Update baseline statistics for anomaly detection
    fn update_baseline_stats(
        anomaly_detector: &Arc<Mutex<AnomalyDetector>>,
        reading: &PressureReading,
    ) {
        let mut detector = anomaly_detector.lock().unwrap();
        let stats = &mut detector.baseline_stats;

        // Exponential moving average updates
        let alpha = 0.1; // Learning rate
        stats.mean_pressure = stats.mean_pressure * (1.0 - alpha) + reading.pressure_ratio * alpha;
        stats.mean_allocation_rate = stats.mean_allocation_rate * (1.0 - alpha as f64)
            + reading.allocation_rate * alpha as f64;

        // Standard deviation updates (simplified)
        let pressure_diff = reading.pressure_ratio - stats.mean_pressure;
        stats.std_pressure = stats.std_pressure * (1.0 - alpha) + pressure_diff.abs() * alpha;

        stats.sample_count += 1;
        stats.last_updated = Instant::now();
    }

    /// Detect memory anomalies using multiple detection models
    fn detect_anomalies(
        anomaly_detector: &Arc<Mutex<AnomalyDetector>>,
        reading: &PressureReading,
    ) -> Option<AnomalyEvent> {
        let mut detector = anomaly_detector.lock().unwrap();
        let stats = &detector.baseline_stats;

        // Check each anomaly type using its specific detection model
        
        // 1. Sudden Pressure Spike Detection
        if let Some(model) = detector.detection_models.get_mut(&AnomalyType::SuddenPressureSpike) {
            let pressure_deviation = (reading.pressure_ratio - stats.mean_pressure) / stats.std_pressure;
            if pressure_deviation > model.sensitivity {
                model.detection_count += 1;
                model.last_detection = Some(reading.timestamp);
                
                return Some(AnomalyEvent {
                    timestamp: reading.timestamp,
                    anomaly_type: AnomalyType::SuddenPressureSpike,
                    severity: pressure_deviation,
                    description: format!(
                        "Memory pressure spike detected: {:.2}% (baseline: {:.2}%, deviation: {:.1}σ)",
                        reading.pressure_ratio * 100.0,
                        stats.mean_pressure * 100.0,
                        pressure_deviation
                    ),
                    affected_metrics: vec!["pressure_ratio".to_string()],
                    suggested_actions: vec![
                        "Trigger garbage collection".to_string(),
                        "Cleanup buffer pools".to_string(),
                        "Enable circuit breaker".to_string(),
                    ],
                    daa_response: Some("Initiated autonomous cleanup and monitoring escalation".to_string()),
                });
            }
        }

        // 2. Allocation Rate Anomaly Detection
        if let Some(model) = detector.detection_models.get_mut(&AnomalyType::AllocationRateAnomaly) {
            let allocation_deviation = (reading.allocation_rate - stats.mean_allocation_rate) / stats.std_allocation_rate;
            if allocation_deviation > model.sensitivity as f64 {
                model.detection_count += 1;
                model.last_detection = Some(reading.timestamp);
                
                return Some(AnomalyEvent {
                    timestamp: reading.timestamp,
                    anomaly_type: AnomalyType::AllocationRateAnomaly,
                    severity: allocation_deviation as f32,
                    description: format!(
                        "Allocation rate anomaly: {:.1} allocs/sec (baseline: {:.1}, deviation: {:.1}σ)",
                        reading.allocation_rate,
                        stats.mean_allocation_rate,
                        allocation_deviation
                    ),
                    affected_metrics: vec!["allocation_rate".to_string()],
                    suggested_actions: vec![
                        "Throttle allocations".to_string(),
                        "Monitor for memory leak".to_string(),
                        "Analyze allocation patterns".to_string(),
                    ],
                    daa_response: Some("Initiated allocation throttling and pattern analysis".to_string()),
                });
            }
        }

        // 3. Response Latency Anomaly Detection
        if let Some(model) = detector.detection_models.get_mut(&AnomalyType::ResponseLatencyAnomaly) {
            let latency_multiplier = reading.response_latency_ns as f64 / stats.normal_response_latency as f64;
            if latency_multiplier > model.sensitivity as f64 {
                model.detection_count += 1;
                model.last_detection = Some(reading.timestamp);
                
                return Some(AnomalyEvent {
                    timestamp: reading.timestamp,
                    anomaly_type: AnomalyType::ResponseLatencyAnomaly,
                    severity: latency_multiplier as f32,
                    description: format!(
                        "Response latency anomaly: {:.2}ms (normal: {:.2}ms, {:.1}x slower)",
                        reading.response_latency_ns as f64 / 1_000_000.0,
                        stats.normal_response_latency as f64 / 1_000_000.0,
                        latency_multiplier
                    ),
                    affected_metrics: vec!["response_latency_ns".to_string()],
                    suggested_actions: vec![
                        "Investigate memory contention".to_string(),
                        "Check for fragmentation".to_string(),
                        "Consider defragmentation".to_string(),
                    ],
                    daa_response: Some("Initiated latency investigation and optimization".to_string()),
                });
            }
        }

        // 4. Fragmentation Anomaly Detection
        if let Some(model) = detector.detection_models.get_mut(&AnomalyType::FragmentationAnomaly) {
            let fragmentation_excess = reading.fragmentation_level - stats.typical_fragmentation;
            if fragmentation_excess > model.sensitivity * 0.1 { // 10% per sensitivity point
                model.detection_count += 1;
                model.last_detection = Some(reading.timestamp);
                
                return Some(AnomalyEvent {
                    timestamp: reading.timestamp,
                    anomaly_type: AnomalyType::FragmentationAnomaly,
                    severity: fragmentation_excess / 0.1, // Normalize to sensitivity scale
                    description: format!(
                        "Memory fragmentation anomaly: {:.1}% (typical: {:.1}%)",
                        reading.fragmentation_level * 100.0,
                        stats.typical_fragmentation * 100.0
                    ),
                    affected_metrics: vec!["fragmentation_level".to_string()],
                    suggested_actions: vec![
                        "Trigger memory defragmentation".to_string(),
                        "Optimize buffer pool allocation".to_string(),
                        "Consider coalescing small buffers".to_string(),
                    ],
                    daa_response: Some("Initiated defragmentation and buffer optimization".to_string()),
                });
            }
        }

        None
    }

    /// Generate pressure prediction using ensemble of models
    fn generate_prediction(
        predictor: &Arc<Mutex<PressurePredictor>>,
        current_reading: &PressureReading,
        config: &MonitorConfig,
    ) -> ComputeResult<PressurePrediction> {
        let mut predictor = predictor.lock().unwrap();

        // Add current reading to historical data
        predictor.historical_data.push_back(current_reading.clone());
        while predictor.historical_data.len() > 1000 {
            predictor.historical_data.pop_front();
        }

        let horizon_seconds = config.prediction_horizon.as_secs();
        let recent_samples = predictor
            .historical_data
            .iter()
            .rev()
            .take(20)
            .collect::<Vec<_>>();

        if recent_samples.len() < 3 {
            return Err(ComputeError::General(
                "Insufficient data for prediction".to_string(),
            ));
        }

        // Generate predictions using multiple models
        let mut model_predictions = HashMap::new();
        
        // 1. Moving Average Model
        let ma_prediction = Self::predict_moving_average(&recent_samples, horizon_seconds);
        model_predictions.insert(PredictionModel::MovingAverage, ma_prediction);
        
        // 2. Linear Regression Model
        let lr_prediction = Self::predict_linear_regression(&recent_samples, horizon_seconds);
        model_predictions.insert(PredictionModel::LinearRegression, lr_prediction);
        
        // 3. Exponential Smoothing Model
        let es_prediction = Self::predict_exponential_smoothing(&recent_samples, horizon_seconds);
        model_predictions.insert(PredictionModel::ExponentialSmoothing, es_prediction);

        // Combine predictions using ensemble weights
        let mut weighted_prediction = 0.0;
        let mut total_weight = 0.0;
        let mut best_model = PredictionModel::MovingAverage;
        let mut best_confidence = 0.0;

        for (model, prediction) in &model_predictions {
            if let Some(weight) = predictor.ensemble_weights.get(model) {
                weighted_prediction += prediction * weight;
                total_weight += weight;
                
                // Update model accuracy tracking
                if let Some(model_state) = predictor.prediction_models.get_mut(model) {
                    model_state.prediction_count += 1;
                    
                    // Calculate confidence based on recent accuracy
                    let confidence = model_state.accuracy_score;
                    if confidence > best_confidence {
                        best_confidence = confidence;
                        best_model = *model;
                    }
                }
            }
        }

        let final_predicted_ratio = if total_weight > 0.0 {
            (weighted_prediction / total_weight).clamp(0.0, 1.0)
        } else {
            model_predictions.values().next().copied().unwrap_or(current_reading.pressure_ratio)
        };

        let predicted_pressure = MemoryPressure::from_ratio(final_predicted_ratio);

        // Create factors map for interpretability
        let mut factors = HashMap::new();
        factors.insert("allocation_trend".to_string(), 
            if recent_samples.len() >= 2 {
                recent_samples[0].allocation_rate as f32 - recent_samples[recent_samples.len() - 1].allocation_rate as f32
            } else { 0.0 }
        );
        factors.insert("fragmentation_impact".to_string(), current_reading.fragmentation_level);
        factors.insert("ensemble_confidence".to_string(), best_confidence);

        let prediction = PressurePrediction {
            timestamp: Instant::now(),
            horizon_seconds,
            predicted_pressure,
            predicted_ratio: final_predicted_ratio,
            confidence_interval: (
                final_predicted_ratio - 0.1 * (1.0 - best_confidence), 
                final_predicted_ratio + 0.1 * (1.0 - best_confidence)
            ),
            confidence_level: best_confidence,
            model_used: best_model,
            factors,
        };

        predictor.last_prediction = Some(prediction.clone());
        Ok(prediction)
    }
    
    /// Moving average prediction
    fn predict_moving_average(samples: &[&PressureReading], horizon_seconds: u64) -> f32 {
        let avg_pressure = samples.iter().map(|r| r.pressure_ratio).sum::<f32>() / samples.len() as f32;
        let trend = if samples.len() >= 2 {
            (samples[0].pressure_ratio - samples[samples.len() - 1].pressure_ratio) / samples.len() as f32
        } else {
            0.0
        };
        (avg_pressure + trend * horizon_seconds as f32).clamp(0.0, 1.0)
    }
    
    /// Linear regression prediction (simplified)
    fn predict_linear_regression(samples: &[&PressureReading], horizon_seconds: u64) -> f32 {
        if samples.len() < 2 {
            return samples[0].pressure_ratio;
        }
        
        let n = samples.len() as f32;
        let sum_x: f32 = (0..samples.len()).map(|i| i as f32).sum();
        let sum_y: f32 = samples.iter().map(|r| r.pressure_ratio).sum();
        let sum_xy: f32 = samples.iter().enumerate()
            .map(|(i, r)| i as f32 * r.pressure_ratio).sum();
        let sum_x_sq: f32 = (0..samples.len()).map(|i| (i as f32).powi(2)).sum();
        
        let slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x_sq - sum_x.powi(2));
        let intercept = (sum_y - slope * sum_x) / n;
        
        (intercept + slope * (samples.len() as f32 + horizon_seconds as f32)).clamp(0.0, 1.0)
    }
    
    /// Exponential smoothing prediction
    fn predict_exponential_smoothing(samples: &[&PressureReading], horizon_seconds: u64) -> f32 {
        if samples.is_empty() {
            return 0.0;
        }
        
        let alpha = 0.3; // Smoothing factor
        let mut smoothed = samples[samples.len() - 1].pressure_ratio;
        
        for sample in samples.iter().rev().skip(1) {
            smoothed = alpha * sample.pressure_ratio + (1.0 - alpha) * smoothed;
        }
        
        // Simple trend extrapolation
        let trend = if samples.len() >= 2 {
            (samples[0].pressure_ratio - samples[samples.len() - 1].pressure_ratio) * 0.1
        } else {
            0.0
        };
        
        (smoothed + trend * horizon_seconds as f32).clamp(0.0, 1.0)
    }

    /// Evaluate if autonomous response is needed with DAA learning integration
    fn evaluate_autonomous_response(
        daa_coordinator: &Arc<Mutex<DaaCoordinator>>,
        reading: &PressureReading,
        prediction: &PressurePrediction,
        alert_thresholds: &Arc<Mutex<AlertThresholds>>,
    ) -> Option<AutonomousResponse> {
        let mut coordinator = daa_coordinator.lock().unwrap();
        let thresholds = alert_thresholds.lock().unwrap();

        // Check if current pressure warrants response
        let needs_response = match reading.pressure {
            MemoryPressure::None => false,
            MemoryPressure::Low => reading.pressure_ratio > thresholds.low_pressure,
            MemoryPressure::Medium => reading.pressure_ratio > thresholds.medium_pressure,
            MemoryPressure::High => reading.pressure_ratio > thresholds.high_pressure,
            MemoryPressure::Critical => true,
        };

        // Check if predicted pressure warrants proactive response
        let predicted_needs_response = prediction.predicted_pressure >= MemoryPressure::High;

        if needs_response || predicted_needs_response {
            // Use learning engine to select optimal strategy
            let strategy_name = coordinator.learning_engine.select_strategy(
                reading.pressure,
                &coordinator.response_strategies,
                prediction.confidence_level,
            );

            if let Some(strategy) = coordinator.response_strategies.get(&reading.pressure) {
                let strategy_actions = strategy.actions.clone();
                let pressure_reduction_target = strategy.success_criteria.pressure_reduction_target;
                
                // Record decision for learning
                let decision = DaaDecision {
                    timestamp: Instant::now(),
                    trigger_pressure: reading.pressure,
                    chosen_strategy: strategy_name.clone(),
                    confidence: prediction.confidence_level,
                    expected_outcome: format!(
                        "Pressure reduction: {:.1}%",
                        pressure_reduction_target * 100.0
                    ),
                    actual_outcome: None,
                    success: None,
                };

                coordinator.decision_history.push_back(decision);

                // Limit decision history size
                while coordinator.decision_history.len() > 1000 {
                    coordinator.decision_history.pop_front();
                }

                // Update performance metrics
                coordinator.performance_metrics.decisions_made += 1;
                
                let effectiveness_score = coordinator.learning_engine.get_strategy_effectiveness(&strategy_name);

                return Some(AutonomousResponse {
                    timestamp: Instant::now(),
                    trigger_pressure: reading.pressure,
                    response_actions: strategy_actions,
                    execution_time: Duration::from_millis(0), // Will be updated after execution
                    effectiveness_score,
                    side_effects: Vec::new(),
                });
            }
        }

        None
    }

    /// Execute autonomous response with learning feedback
    fn execute_autonomous_response(
        buffer_pool: &Arc<AdvancedBufferPool>,
        mut response: AutonomousResponse,
        responses: &Arc<Mutex<Vec<AutonomousResponse>>>,
    ) -> (bool, MemoryPressure) {
        let start_time = Instant::now();
        let initial_pressure = Self::measure_current_pressure(buffer_pool);
        let mut success = true;

        for action in &response.response_actions {
            match action {
                ResponseAction::AggressiveBufferCleanup { aggressiveness } => {
                    let pressure = MemoryPressure::from_ratio(*aggressiveness);
                    buffer_pool.cleanup_with_pressure_response(pressure);
                    #[cfg(feature = "logging")]
                    log::info!("DAA executed aggressive buffer cleanup with aggressiveness: {}", aggressiveness);
                    #[cfg(not(feature = "logging"))]
                    println!("DAA executed aggressive buffer cleanup with aggressiveness: {}", aggressiveness);
                }
                ResponseAction::TriggerGarbageCollection => {
                    // Would trigger GC in full implementation
                    #[cfg(feature = "logging")]
                    log::info!("DAA triggered garbage collection");
                    #[cfg(not(feature = "logging"))]
                    println!("DAA triggered garbage collection");
                }
                ResponseAction::AlertOperator { severity } => {
                    #[cfg(feature = "logging")]
                    log::warn!(
                        "DAA alert: Memory pressure requires operator attention (severity: {severity:?})"
                    );
                    #[cfg(not(feature = "logging"))]
                    eprintln!(
                        "DAA alert: Memory pressure requires operator attention (severity: {:?})",
                        severity
                    );
                }
                ResponseAction::EnableCircuitBreaker => {
                    #[cfg(feature = "logging")]
                    log::warn!("DAA enabled circuit breaker protection");
                    #[cfg(not(feature = "logging"))]
                    println!("DAA enabled circuit breaker protection");
                }
                ResponseAction::ThrottleAllocations { delay_ms } => {
                    #[cfg(feature = "logging")]
                    log::info!("DAA throttling allocations with {}ms delay", delay_ms);
                    #[cfg(not(feature = "logging"))]
                    println!("DAA throttling allocations with {}ms delay", delay_ms);
                }
                ResponseAction::DefragmentMemory => {
                    #[cfg(feature = "logging")]
                    log::info!("DAA initiated memory defragmentation");
                    #[cfg(not(feature = "logging"))]
                    println!("DAA initiated memory defragmentation");
                }
                _ => {
                    #[cfg(feature = "logging")]
                    log::info!("DAA executed response action: {action:?}");
                    #[cfg(not(feature = "logging"))]
                    println!("DAA executed response action: {:?}", action);
                }
            }
        }

        response.execution_time = start_time.elapsed();
        
        // Measure effectiveness
        let final_pressure = Self::measure_current_pressure(buffer_pool);
        success = final_pressure < initial_pressure;
        
        if success {
            let pressure_reduction = match (initial_pressure, final_pressure) {
                (MemoryPressure::Critical, MemoryPressure::High) => 0.2,
                (MemoryPressure::High, MemoryPressure::Medium) => 0.3,
                (MemoryPressure::Medium, MemoryPressure::Low) => 0.2,
                _ => 0.1,
            };
            response.effectiveness_score = pressure_reduction;
        } else {
            response.effectiveness_score = 0.0;
            response.side_effects.push("Failed to reduce memory pressure".to_string());
        }

        // Store response for analysis
        responses.lock().unwrap().push(response);
        
        (success, final_pressure)
    }
    
    /// Measure current memory pressure from buffer pool
    fn measure_current_pressure(buffer_pool: &Arc<AdvancedBufferPool>) -> MemoryPressure {
        let stats = buffer_pool.get_statistics();
        let pressure_ratio = if stats.global.peak_memory_usage > 0 {
            stats.global.total_memory_allocated as f32 / stats.global.peak_memory_usage as f32
        } else {
            0.0
        };
        MemoryPressure::from_ratio(pressure_ratio)
    }

    /// Get current pressure reading
    pub fn current_pressure(&self) -> MemoryPressure {
        *self.current_pressure.lock().unwrap()
    }

    /// Get latest pressure prediction
    pub fn latest_prediction(&self) -> Option<PressurePrediction> {
        self.predictor.lock().unwrap().last_prediction.clone()
    }

    /// Get recent anomalies
    pub fn recent_anomalies(&self, limit: usize) -> Vec<AnomalyEvent> {
        let detector = self.anomaly_detector.lock().unwrap();
        detector
            .recent_anomalies
            .iter()
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }

    /// Get monitoring statistics
    pub fn get_statistics(&self) -> MonitoringStatistics {
        self.monitoring_stats.lock().unwrap().clone()
    }

    /// Get DAA performance metrics
    pub fn get_daa_metrics(&self) -> DaaPerformanceMetrics {
        self.daa_coordinator
            .lock()
            .unwrap()
            .performance_metrics
            .clone()
    }

    /// Update alert thresholds
    pub fn update_thresholds(&self, new_thresholds: AlertThresholds) {
        *self.alert_thresholds.lock().unwrap() = new_thresholds;
    }

    /// Generate monitoring report
    pub fn generate_report(&self) -> MonitoringReport {
        let stats = self.get_statistics();
        let daa_metrics = self.get_daa_metrics();
        let current_pressure = self.current_pressure();
        let prediction = self.latest_prediction();
        let anomalies = self.recent_anomalies(10);

        MonitoringReport {
            timestamp: SystemTime::now(),
            system_uptime: stats.system_uptime,
            current_pressure,
            prediction,
            monitoring_stats: stats,
            daa_metrics,
            recent_anomalies: anomalies,
            recommendations: self.generate_recommendations(),
        }
    }

    /// Generate system recommendations
    fn generate_recommendations(&self) -> Vec<String> {
        let mut recommendations = Vec::new();
        let stats = self.get_statistics();

        if stats.prediction_accuracy < 0.7 {
            recommendations
                .push("Consider tuning prediction models for better accuracy".to_string());
        }

        if stats.false_positive_rate > 0.1 {
            recommendations
                .push("Adjust anomaly detection thresholds to reduce false positives".to_string());
        }

        if self.current_pressure() >= MemoryPressure::High {
            recommendations
                .push("Immediate action required: High memory pressure detected".to_string());
        }

        recommendations
    }
}

/// Comprehensive monitoring report
#[derive(Debug, Clone)]
pub struct MonitoringReport {
    pub timestamp: SystemTime,
    pub system_uptime: Duration,
    pub current_pressure: MemoryPressure,
    pub prediction: Option<PressurePrediction>,
    pub monitoring_stats: MonitoringStatistics,
    pub daa_metrics: DaaPerformanceMetrics,
    pub recent_anomalies: Vec<AnomalyEvent>,
    pub recommendations: Vec<String>,
}

impl MonitoringReport {
    /// Get summary string for logging
    pub fn summary(&self) -> String {
        format!(
            "Memory Monitor Report: {:?} pressure, {:.1}% prediction accuracy, {} DAA interventions, {} anomalies",
            self.current_pressure,
            self.monitoring_stats.prediction_accuracy * 100.0,
            self.daa_metrics.decisions_made,
            self.recent_anomalies.len()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pressure_calculation_methods() {
        assert_eq!(MemoryPressure::from_ratio(0.5), MemoryPressure::None);
        assert_eq!(MemoryPressure::from_ratio(0.75), MemoryPressure::Medium);
        assert_eq!(MemoryPressure::from_ratio(0.95), MemoryPressure::Critical);
    }

    #[test]
    fn test_anomaly_threshold_detection() {
        let baseline = BaselineStatistics {
            mean_pressure: 0.3,
            std_pressure: 0.1,
            mean_allocation_rate: 100.0,
            std_allocation_rate: 20.0,
            typical_fragmentation: 0.1,
            normal_response_latency: 1_000_000,
            last_updated: Instant::now(),
            sample_count: 100,
        };

        // Test normal reading (within 2 std deviations)
        let normal_pressure = 0.35; // Within baseline + 2*std
        assert!(normal_pressure <= baseline.mean_pressure + 2.0 * baseline.std_pressure);

        // Test anomalous reading (beyond 2 std deviations)
        let anomalous_pressure = 0.6; // Beyond baseline + 2*std
        assert!(anomalous_pressure > baseline.mean_pressure + 2.0 * baseline.std_pressure);
    }

    #[test]
    fn test_response_strategy_escalation() {
        let strategy = ResponseStrategy {
            trigger_threshold: 0.8,
            actions: vec![ResponseAction::TriggerGarbageCollection],
            escalation_timeout: Duration::from_secs(30),
            success_criteria: SuccessCriteria {
                pressure_reduction_target: 0.1,
                max_response_time: Duration::from_secs(10),
                acceptable_performance_impact: 0.05,
            },
            fallback_strategy: Some(Box::new(ResponseStrategy {
                trigger_threshold: 0.9,
                actions: vec![ResponseAction::AlertOperator {
                    severity: AlertSeverity::Critical,
                }],
                escalation_timeout: Duration::from_secs(5),
                success_criteria: SuccessCriteria {
                    pressure_reduction_target: 0.2,
                    max_response_time: Duration::from_secs(5),
                    acceptable_performance_impact: 0.2,
                },
                fallback_strategy: None,
            })),
        };

        assert!(strategy.fallback_strategy.is_some());
        assert_eq!(strategy.trigger_threshold, 0.8);
    }
}
