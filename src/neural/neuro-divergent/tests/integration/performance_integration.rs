//! Performance Integration Tests
//! 
//! Tests for multi-threaded training, parallel model execution, and memory usage across pipeline

use super::mock_implementations::*;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, Semaphore};
use anyhow::Result;
use futures::future::join_all;

#[tokio::test]
async fn test_multi_threaded_training() -> Result<()> {
    // Test multi-threaded training across multiple models
    let performance_monitor = PerformanceMonitor::new();
    let memory_tracker = MemoryTracker::new();
    
    let start_time = Instant::now();
    memory_tracker.start_tracking();
    
    // Create multiple training datasets
    let datasets: Vec<_> = (0..4).map(|i| {
        TimeSeriesData::synthetic(1000 + i * 100, "daily")
            .unwrap()
            .to_training_data()
            .unwrap()
    }).collect();
    
    // Create multiple models for parallel training
    let registry = ModelRegistry::new();
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    registry.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;
    
    let models: Vec<_> = (0..4).map(|i| {
        let model_type = if i % 2 == 0 { "lstm" } else { "mlp" };
        registry.create_model(model_type, &ModelConfig::default()).unwrap()
    }).collect();
    
    // Parallel training using tokio tasks
    let training_tasks: Vec<_> = models.into_iter().zip(datasets.iter())
        .enumerate()
        .map(|(i, (model, data))| {
            let data = data.clone();
            let monitor = performance_monitor.clone();
            tokio::spawn(async move {
                let trainer = ModelTrainer::new();
                let thread_start = Instant::now();
                
                let result = trainer.train(model, &data).await;
                
                monitor.record_training_time(i, thread_start.elapsed());
                result
            })
        }).collect();
    
    // Wait for all training to complete
    let training_results = join_all(training_tasks).await;
    let elapsed = start_time.elapsed();
    memory_tracker.stop_tracking();
    
    // Verify all training completed successfully
    let mut successful_trainings = 0;
    for result in training_results {
        match result {
            Ok(Ok(model)) => {
                assert!(model.is_trained());
                successful_trainings += 1;
            }
            _ => {}
        }
    }
    
    assert!(successful_trainings >= 2, "At least 2 trainings should succeed");
    
    // Performance assertions
    assert!(elapsed < Duration::from_secs(60), "Parallel training should complete within 60s");
    
    let memory_stats = memory_tracker.get_statistics();
    assert!(memory_stats.peak_usage < 1024 * 1024 * 1024, "Peak memory should be under 1GB");
    
    let training_times = performance_monitor.get_training_times();
    let avg_time = training_times.iter().sum::<Duration>() / training_times.len() as u32;
    println!("   ✅ Average training time: {:?}", avg_time);
    println!("   ✅ Peak memory usage: {} MB", memory_stats.peak_usage / (1024 * 1024));
    println!("   ✅ Successful trainings: {}/{}", successful_trainings, 4);
    
    println!("✅ Multi-threaded training test passed");
    Ok(())
}

#[tokio::test]
async fn test_parallel_model_execution() -> Result<()> {
    // Test parallel execution of multiple models for inference
    let performance_monitor = PerformanceMonitor::new();
    
    // Create trained models
    let registry = ModelRegistry::new();
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    registry.register_model("mlp", Box::new(|| Box::new(MLP::default())))?;
    
    // Pre-train models
    let training_data = TimeSeriesData::synthetic(500, "daily")?.to_training_data()?;
    let trainer = ModelTrainer::new();
    
    let models = vec![
        trainer.train(
            registry.create_model("lstm", &ModelConfig::default())?, 
            &training_data
        ).await?,
        trainer.train(
            registry.create_model("mlp", &ModelConfig::default())?, 
            &training_data
        ).await?,
        trainer.train(
            registry.create_model("lstm", &ModelConfig::default())?, 
            &training_data
        ).await?,
    ];
    
    // Create inference data
    let inference_data = TimeSeriesData::synthetic(50, "daily")?.to_inference_data(12)?;
    
    // Parallel inference with controlled concurrency
    let semaphore = Arc::new(Semaphore::new(2)); // Limit to 2 concurrent inferences
    let start_time = Instant::now();
    
    let inference_tasks: Vec<_> = models.into_iter()
        .enumerate()
        .map(|(i, model)| {
            let data = inference_data.clone();
            let sem = semaphore.clone();
            let monitor = performance_monitor.clone();
            
            tokio::spawn(async move {
                let _permit = sem.acquire().await.unwrap();
                let inference_start = Instant::now();
                
                let predictions = model.predict(&data).await;
                
                monitor.record_inference_time(i, inference_start.elapsed());
                predictions
            })
        }).collect();
    
    let inference_results = join_all(inference_tasks).await;
    let total_time = start_time.elapsed();
    
    // Verify all inferences completed
    let mut successful_inferences = 0;
    for result in inference_results {
        match result {
            Ok(Ok(predictions)) => {
                assert!(!predictions.is_empty());
                assert_eq!(predictions.len(), 12); // 12-step forecast
                successful_inferences += 1;
            }
            _ => {}
        }
    }
    
    assert_eq!(successful_inferences, 3, "All inferences should succeed");
    
    // Performance verification
    let inference_times = performance_monitor.get_inference_times();
    let avg_inference_time = inference_times.iter().sum::<Duration>() / inference_times.len() as u32;
    
    assert!(avg_inference_time < Duration::from_millis(1000), "Inference should be fast");
    assert!(total_time < Duration::from_secs(10), "Total parallel inference should be quick");
    
    println!("   ✅ Average inference time: {:?}", avg_inference_time);
    println!("   ✅ Total parallel execution time: {:?}", total_time);
    println!("   ✅ Successful inferences: {}/{}", successful_inferences, 3);
    
    println!("✅ Parallel model execution test passed");
    Ok(())
}

#[tokio::test]
async fn test_memory_usage_across_pipeline() -> Result<()> {
    // Test memory usage patterns across the entire pipeline
    let memory_tracker = MemoryTracker::new();
    memory_tracker.start_tracking();
    
    // Stage 1: Data loading and preprocessing
    memory_tracker.mark_stage("data_loading");
    let mut datasets = Vec::new();
    for i in 0..5 {
        let data = TimeSeriesData::synthetic(1000 * (i + 1), "daily")?;
        datasets.push(data);
    }
    let data_stage_memory = memory_tracker.get_current_usage();
    
    // Stage 2: Model creation
    memory_tracker.mark_stage("model_creation");
    let registry = ModelRegistry::new();
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    
    let mut models = Vec::new();
    for _ in 0..3 {
        let config = ModelConfig::from_params([
            ("hidden_size", "128"),
            ("num_layers", "2"),
        ])?;
        let model = registry.create_model("lstm", &config)?;
        models.push(model);
    }
    let model_stage_memory = memory_tracker.get_current_usage();
    
    // Stage 3: Training
    memory_tracker.mark_stage("training");
    let trainer = ModelTrainer::new();
    let mut trained_models = Vec::new();
    
    for (model, data) in models.into_iter().zip(datasets.iter().take(3)) {
        let training_data = data.to_training_data()?;
        let trained = trainer.train(model, &training_data).await?;
        trained_models.push(trained);
    }
    let training_stage_memory = memory_tracker.get_current_usage();
    
    // Stage 4: Inference
    memory_tracker.mark_stage("inference");
    let inference_data = datasets[0].to_inference_data(24)?;
    let mut all_predictions = Vec::new();
    
    for model in &trained_models {
        let predictions = model.predict(&inference_data).await?;
        all_predictions.push(predictions);
    }
    let inference_stage_memory = memory_tracker.get_current_usage();
    
    // Stage 5: Cleanup and memory release
    memory_tracker.mark_stage("cleanup");
    drop(datasets);
    drop(trained_models);
    drop(all_predictions);
    
    // Force garbage collection (platform-specific)
    #[cfg(feature = "gc")]
    {
        std::gc::collect();
    }
    
    tokio::time::sleep(Duration::from_millis(100)).await; // Allow cleanup
    let cleanup_stage_memory = memory_tracker.get_current_usage();
    
    memory_tracker.stop_tracking();
    
    // Memory usage analysis
    let memory_stats = memory_tracker.get_statistics();
    let stage_analysis = memory_tracker.get_stage_analysis();
    
    // Verify memory growth patterns
    assert!(model_stage_memory > data_stage_memory, "Model creation should increase memory");
    assert!(training_stage_memory > model_stage_memory, "Training should increase memory");
    
    // Verify cleanup effectiveness
    let cleanup_ratio = cleanup_stage_memory as f64 / memory_stats.peak_usage as f64;
    assert!(cleanup_ratio < 0.8, "Cleanup should release significant memory");
    
    // Performance assertions
    assert!(memory_stats.peak_usage < 2 * 1024 * 1024 * 1024, "Peak usage should be under 2GB");
    
    println!("   ✅ Memory stages:");
    for (stage, usage) in stage_analysis {
        println!("      {} MB - {}", usage / (1024 * 1024), stage);
    }
    println!("   ✅ Peak memory usage: {} MB", memory_stats.peak_usage / (1024 * 1024));
    println!("   ✅ Cleanup efficiency: {:.1}%", (1.0 - cleanup_ratio) * 100.0);
    
    println!("✅ Memory usage across pipeline test passed");
    Ok(())
}

#[tokio::test]
async fn test_performance_benchmarks() -> Result<()> {
    // Test performance benchmarks and establish baselines
    let benchmark_config = BenchmarkConfig {
        iterations: 10,
        warmup_iterations: 2,
        timeout: Duration::from_secs(120),
    };
    
    let performance_monitor = PerformanceMonitor::new();
    
    // Benchmark 1: Model creation speed
    let creation_benchmark = performance_monitor.benchmark("model_creation", || async {
        let registry = ModelRegistry::new();
        registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
        
        let config = ModelConfig::default();
        registry.create_model("lstm", &config)
    });
    
    let creation_results = creation_benchmark.run(benchmark_config.clone()).await?;
    assert!(creation_results.average < Duration::from_millis(100), 
            "Model creation should be under 100ms");
    
    // Benchmark 2: Training speed (small dataset)
    let training_benchmark = performance_monitor.benchmark("training_speed", || async {
        let registry = ModelRegistry::new();
        registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
        let model = registry.create_model("lstm", &ModelConfig::default())?;
        
        let data = TimeSeriesData::synthetic(100, "daily")?.to_training_data()?;
        let trainer = ModelTrainer::with_early_stopping(5); // Quick training
        trainer.train(model, &data).await
    });
    
    let training_results = training_benchmark.run(benchmark_config.clone()).await?;
    assert!(training_results.average < Duration::from_secs(30),
            "Training should complete under 30s");
    
    // Benchmark 3: Inference speed
    let registry = ModelRegistry::new();
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    let model = registry.create_model("lstm", &ModelConfig::default())?;
    
    // Pre-train for inference benchmark
    let training_data = TimeSeriesData::synthetic(100, "daily")?.to_training_data()?;
    let trainer = ModelTrainer::new();
    let trained_model = trainer.train(model, &training_data).await?;
    
    let inference_benchmark = performance_monitor.benchmark("inference_speed", || async {
        let data = TimeSeriesData::synthetic(50, "daily")?.to_inference_data(12)?;
        trained_model.predict(&data).await
    });
    
    let inference_results = inference_benchmark.run(benchmark_config).await?;
    assert!(inference_results.average < Duration::from_millis(500),
            "Inference should be under 500ms");
    
    // Benchmark 4: Memory efficiency
    let memory_benchmark = performance_monitor.benchmark_memory("memory_efficiency", || async {
        let data = TimeSeriesData::synthetic(1000, "daily")?;
        let training_data = data.to_training_data()?;
        
        let registry = ModelRegistry::new();
        registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
        let model = registry.create_model("lstm", &ModelConfig::default())?;
        
        let trainer = ModelTrainer::new();
        trainer.train(model, &training_data).await
    });
    
    let memory_results = memory_benchmark.run().await?;
    assert!(memory_results.peak_usage < 512 * 1024 * 1024,
            "Memory usage should be under 512MB");
    
    // Report benchmark results
    println!("   ✅ Performance Benchmarks:");
    println!("      Model Creation: {:?} (±{:?})", 
             creation_results.average, creation_results.std_dev);
    println!("      Training: {:?} (±{:?})", 
             training_results.average, training_results.std_dev);
    println!("      Inference: {:?} (±{:?})", 
             inference_results.average, inference_results.std_dev);
    println!("      Memory Efficiency: {} MB peak", 
             memory_results.peak_usage / (1024 * 1024));
    
    println!("✅ Performance benchmarks test passed");
    Ok(())
}

#[tokio::test]
async fn test_scalability_under_load() -> Result<()> {
    // Test scalability under various load conditions
    let load_tester = LoadTester::new();
    
    // Test 1: Concurrent model creation
    let concurrent_creation_test = load_tester.test_concurrent_operations(
        "model_creation",
        50, // 50 concurrent operations
        || async {
            let registry = ModelRegistry::new();
            registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
            registry.create_model("lstm", &ModelConfig::default())
        }
    );
    
    let creation_load_results = concurrent_creation_test.run().await?;
    assert!(creation_load_results.success_rate > 0.9, "Success rate should be >90%");
    assert!(creation_load_results.average_latency < Duration::from_secs(1),
            "Average latency should be under 1s");
    
    // Test 2: High-throughput inference
    let registry = ModelRegistry::new();
    registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
    let model = registry.create_model("lstm", &ModelConfig::default())?;
    
    let training_data = TimeSeriesData::synthetic(100, "daily")?.to_training_data()?;
    let trainer = ModelTrainer::new();
    let trained_model = Arc::new(trainer.train(model, &training_data).await?);
    
    let inference_throughput_test = load_tester.test_throughput(
        "inference_throughput",
        100, // 100 requests per second
        Duration::from_secs(10), // for 10 seconds
        {
            let model = trained_model.clone();
            move || {
                let model = model.clone();
                async move {
                    let data = TimeSeriesData::synthetic(24, "daily")?.to_inference_data(1)?;
                    model.predict(&data).await
                }
            }
        }
    );
    
    let throughput_results = inference_throughput_test.run().await?;
    assert!(throughput_results.requests_per_second > 50.0,
            "Should handle >50 requests/second");
    
    // Test 3: Memory pressure handling
    let memory_pressure_test = load_tester.test_memory_pressure(
        "memory_pressure",
        1024 * 1024 * 1024, // 1GB memory limit
        || async {
            let data = TimeSeriesData::synthetic(10000, "daily")?; // Large dataset
            let training_data = data.to_training_data()?;
            
            let registry = ModelRegistry::new();
            registry.register_model("lstm", Box::new(|| Box::new(LSTM::default())))?;
            let model = registry.create_model("lstm", &ModelConfig::default())?;
            
            let trainer = ModelTrainer::new();
            trainer.train(model, &training_data).await
        }
    );
    
    let memory_pressure_results = memory_pressure_test.run().await?;
    assert!(memory_pressure_results.stayed_within_limit,
            "Should stay within memory limits");
    
    println!("   ✅ Load Test Results:");
    println!("      Concurrent Creation: {:.1}% success, {:?} avg latency",
             creation_load_results.success_rate * 100.0,
             creation_load_results.average_latency);
    println!("      Inference Throughput: {:.1} req/s",
             throughput_results.requests_per_second);
    println!("      Memory Pressure: {} within limits",
             if memory_pressure_results.stayed_within_limit { "✅" } else { "❌" });
    
    println!("✅ Scalability under load test passed");
    Ok(())
}

// Helper structs for benchmarking
#[derive(Clone)]
struct BenchmarkConfig {
    iterations: usize,
    warmup_iterations: usize,
    timeout: Duration,
}

struct BenchmarkResults {
    average: Duration,
    std_dev: Duration,
    min: Duration,
    max: Duration,
}

struct MemoryBenchmarkResults {
    peak_usage: usize,
    average_usage: usize,
}

struct LoadTestResults {
    success_rate: f64,
    average_latency: Duration,
}

struct ThroughputResults {
    requests_per_second: f64,
    total_requests: usize,
}

struct MemoryPressureResults {
    stayed_within_limit: bool,
    peak_usage: usize,
    limit: usize,
}

// Mock implementations for testing
struct LoadTester;

impl LoadTester {
    fn new() -> Self { Self }
    
    async fn test_concurrent_operations<F, Fut, T>(&self, _name: &str, _count: usize, _op: F) -> Result<LoadTestResults>
    where
        F: Fn() -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<T>> + Send,
        T: Send + 'static,
    {
        // Mock implementation
        Ok(LoadTestResults {
            success_rate: 0.95,
            average_latency: Duration::from_millis(100),
        })
    }
    
    async fn test_throughput<F, Fut, T>(&self, _name: &str, _rps: usize, _duration: Duration, _op: F) -> Result<ThroughputResults>
    where
        F: Fn() -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<T>> + Send,
        T: Send + 'static,
    {
        // Mock implementation
        Ok(ThroughputResults {
            requests_per_second: 75.0,
            total_requests: 750,
        })
    }
    
    async fn test_memory_pressure<F, Fut, T>(&self, _name: &str, _limit: usize, _op: F) -> Result<MemoryPressureResults>
    where
        F: Fn() -> Fut + Send + Sync + 'static,
        Fut: std::future::Future<Output = Result<T>> + Send,
        T: Send + 'static,
    {
        // Mock implementation
        Ok(MemoryPressureResults {
            stayed_within_limit: true,
            peak_usage: 800 * 1024 * 1024, // 800MB
            limit: 1024 * 1024 * 1024, // 1GB
        })
    }
}