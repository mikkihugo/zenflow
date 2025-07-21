//! Demonstration of streaming training for large datasets
//!
//! This example shows how to:
//! 1. Create large training datasets that don't fit in memory
//! 2. Use streaming I/O to train on datasets larger than RAM
//! 3. Configure optimal batch sizes and memory usage
//! 4. Monitor streaming statistics and performance

use claude_code_flow::io::streaming::{TrainingDataStreamReader, memory};
use claude_code_flow::training::{StreamingBatchBackprop, StreamingConfig, MemoryRequirements};
use claude_code_flow::{Network, NetworkBuilder, ActivationFunction};
use std::io::{BufReader, Write, BufWriter};
use std::fs::File;
use std::time::Instant;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🌊 Streaming Training Demo - Processing Large Datasets");
    println!("=====================================================");

    // Create a large synthetic dataset that simulates real-world scenarios
    let dataset_file = "large_training_dataset.txt";
    create_large_dataset(dataset_file, 10000, 20, 5)?;
    
    println!("📁 Created dataset: {} samples, {} inputs, {} outputs", 10000, 20, 5);
    
    // Analyze memory requirements before training
    let config = StreamingConfig {
        buffer_size: 8192,
        batch_size: 100,
        memory_limit_bytes: 32 * 1024 * 1024, // 32MB limit to demonstrate streaming
        adaptive_batching: true,
    };
    
    let memory_analysis = claude_code_flow::training::streaming::utils::analyze_dataset_memory::<f32>(
        dataset_file, 
        &config
    )?;
    
    print_memory_analysis(&memory_analysis);
    
    // Create a neural network for the task
    let mut network = NetworkBuilder::new()
        .add_layer(20, ActivationFunction::Sigmoid) // Input layer
        .add_layer(15, ActivationFunction::Sigmoid) // Hidden layer
        .add_layer(10, ActivationFunction::Sigmoid) // Hidden layer
        .add_layer(5, ActivationFunction::Sigmoid)  // Output layer
        .build()?;
    
    println!("🧠 Network created: 20→15→10→5 architecture");
    
    // Demonstrate streaming training
    println!("\n🚀 Starting streaming training...");
    
    let results = claude_code_flow::training::streaming::utils::train_from_file(
        &mut network,
        dataset_file,
        config,
        3, // 3 epochs
    )?;
    
    print_training_results(&results);
    
    // Demonstrate different streaming configurations
    println!("\n⚡ Comparing different streaming configurations:");
    compare_streaming_configs(dataset_file)?;
    
    // Demonstrate memory efficiency features
    println!("\n💾 Memory efficiency analysis:");
    demonstrate_memory_efficiency()?;
    
    // Cleanup
    std::fs::remove_file(dataset_file).ok();
    println!("\n✅ Demo completed successfully!");
    
    Ok(())
}

/// Create a large synthetic dataset for demonstration
fn create_large_dataset(
    filename: &str, 
    num_samples: usize, 
    num_inputs: usize, 
    num_outputs: usize
) -> Result<(), Box<dyn std::error::Error>> {
    let file = File::create(filename)?;
    let mut writer = BufWriter::new(file);
    
    // Write header
    writeln!(writer, "{} {} {}", num_samples, num_inputs, num_outputs)?;
    
    // Generate synthetic data
    for i in 0..num_samples {
        // Generate inputs (simple pattern for demonstration)
        let inputs: Vec<f32> = (0..num_inputs)
            .map(|j| ((i * 37 + j * 19) % 100) as f32 / 100.0)
            .collect();
        
        // Generate outputs based on inputs (simple transformation)
        let outputs: Vec<f32> = (0..num_outputs)
            .map(|j| (inputs[j % num_inputs] * 0.8 + 0.1).tanh())
            .collect();
        
        // Write input line
        for (idx, input) in inputs.iter().enumerate() {
            if idx > 0 { write!(writer, " ")?; }
            write!(writer, "{:.6}", input)?;
        }
        writeln!(writer)?;
        
        // Write output line
        for (idx, output) in outputs.iter().enumerate() {
            if idx > 0 { write!(writer, " ")?; }
            write!(writer, "{:.6}", output)?;
        }
        writeln!(writer)?;
    }
    
    writer.flush()?;
    Ok(())
}

/// Print memory analysis results
fn print_memory_analysis(analysis: &MemoryRequirements) {
    println!("\n📊 Memory Requirements Analysis:");
    println!("  • Bytes per sample: {}", analysis.bytes_per_sample);
    println!("  • Optimal batch size: {}", analysis.optimal_batch_size);
    println!("  • Total memory needed: {:.2} MB", 
             analysis.estimated_total_memory as f64 / (1024.0 * 1024.0));
    println!("  • Batches needed: {}", analysis.batches_needed);
    println!("  • Memory efficiency: {:.2}%", analysis.memory_efficiency_ratio * 100.0);
}

/// Print training results
fn print_training_results(results: &[(f32, claude_code_flow::io::streaming::StreamStats)]) {
    println!("\n📈 Training Results:");
    for (epoch, (error, stats)) in results.iter().enumerate() {
        println!("  Epoch {}: Error = {:.6}, Samples = {}, Bytes = {}, Avg bytes/sample = {:.2}",
                 epoch + 1,
                 error,
                 stats.samples_processed,
                 stats.bytes_read,
                 stats.avg_bytes_per_sample());
    }
}

/// Compare different streaming configurations
fn compare_streaming_configs(dataset_file: &str) -> Result<(), Box<dyn std::error::Error>> {
    let configs = vec![
        ("Small batches", StreamingConfig {
            buffer_size: 4096,
            batch_size: 50,
            memory_limit_bytes: 16 * 1024 * 1024,
            adaptive_batching: false,
        }),
        ("Large batches", StreamingConfig {
            buffer_size: 16384,
            batch_size: 500,
            memory_limit_bytes: 64 * 1024 * 1024,
            adaptive_batching: false,
        }),
        ("Adaptive batching", StreamingConfig {
            buffer_size: 8192,
            batch_size: 200,
            memory_limit_bytes: 32 * 1024 * 1024,
            adaptive_batching: true,
        }),
    ];
    
    for (name, config) in configs {
        let start = Instant::now();
        
        let analysis = claude_code_flow::training::streaming::utils::analyze_dataset_memory::<f32>(
            dataset_file, 
            &config
        )?;
        
        let duration = start.elapsed();
        
        println!("  {}: {} batches, {:.2}% efficiency, analysis took {:?}",
                 name,
                 analysis.batches_needed,
                 analysis.memory_efficiency_ratio * 100.0,
                 duration);
    }
    
    Ok(())
}

/// Demonstrate memory efficiency features
fn demonstrate_memory_efficiency() -> Result<(), Box<dyn std::error::Error>> {
    let scenarios = vec![
        ("Small network", (10, 5)),
        ("Medium network", (50, 20)),
        ("Large network", (200, 50)),
        ("Very large network", (1000, 100)),
    ];
    
    let memory_limits = vec![16, 32, 64, 128]; // MB
    
    println!("  Network Size → Memory Limit (MB):");
    println!("  {:20} {:>8} {:>8} {:>8} {:>8}", "Size", "16MB", "32MB", "64MB", "128MB");
    println!("  {:-<60}", "");
    
    for (name, (inputs, outputs)) in scenarios {
        print!("  {:20}", name);
        for &memory_mb in &memory_limits {
            let memory_bytes = memory_mb * 1024 * 1024;
            let optimal_batch = memory::optimal_batch_size(memory_bytes, inputs, outputs);
            print!(" {:>7}", optimal_batch);
        }
        println!();
    }
    
    Ok(())
}