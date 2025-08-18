/*!
 * Example: Machine-Adaptive Optimization
 * 
 * Demonstrates how the neural-ml library automatically detects
 * and optimizes for different hardware configurations:
 * - Apple Silicon (M1/M2/M3/M4) with Metal + Accelerate + NEON
 * - NVIDIA CUDA GPUs with cuDNN optimization
 * - Intel/AMD with AVX-512/AVX2 SIMD acceleration
 * - ARM processors with NEON SIMD
 * - CPU fallback with rayon parallelism
 */

use claude_zen_neural_ml::{
    optimization::{
        initialize_optimization, get_optimized_ops, 
        adaptive_executor::AdaptiveExecutor,
        gpu_executor::GpuExecutor,
        ActivationType,
    },
    error::Result,
};

fn main() -> Result<()> {
    env_logger::init();

    println!("🚀 Claude-Zen Neural ML: Machine-Adaptive Optimization Demo");
    println!("============================================================");

    // Initialize optimization - auto-detects best backend
    let backend = initialize_optimization()?;
    println!("✅ Detected optimization backend: {:?}", backend);

    // Create adaptive executor that learns and optimizes
    let mut executor = AdaptiveExecutor::<f32>::new()?;
    println!("🧠 Adaptive executor initialized");

    // Run adaptive benchmark to optimize thresholds
    executor.benchmark_and_adapt()?;
    println!("📊 Adaptive benchmarking completed");

    // Demo 1: Matrix multiplication with different sizes
    println!("\n🔢 Matrix Multiplication Performance Test");
    println!("-----------------------------------------");
    
    let sizes = vec![
        (128, 128, 128),   // Small - should use SIMD
        (512, 512, 512),   // Medium - should use CPU optimized
        (1024, 1024, 1024), // Large - should use GPU if available
    ];

    for (m, n, k) in sizes {
        let a = vec![1.0f32; m * k];
        let b = vec![2.0f32; k * n];
        
        let start = std::time::Instant::now();
        let result = executor.matrix_multiply(&a, &b, m, n, k);
        let elapsed = start.elapsed();
        
        println!("  {}x{}x{}: {:?} (result sum: {:.2})", 
                 m, n, k, elapsed, result.iter().sum::<f32>());
    }

    // Demo 2: Vector operations with SIMD acceleration
    println!("\n🧮 Vector Operations Performance Test");
    println!("-------------------------------------");
    
    let vector_sizes = vec![1000, 10000, 100000, 1000000];
    
    for size in vector_sizes {
        let a = vec![1.5f32; size];
        let b = vec![2.5f32; size];
        
        // Vector addition
        let start = std::time::Instant::now();
        let add_result = executor.vector_add(&a, &b);
        let add_time = start.elapsed();
        
        // Vector multiplication
        let start = std::time::Instant::now();
        let mul_result = executor.vector_multiply(&a, &b);
        let mul_time = start.elapsed();
        
        // Reduction
        let start = std::time::Instant::now();
        let sum = executor.reduce_sum(&a);
        let reduce_time = start.elapsed();
        
        println!("  Size {}: add={:?}, mul={:?}, sum={:?} (sum={:.2})", 
                 size, add_time, mul_time, reduce_time, sum);
    }

    // Demo 3: Neural activation functions
    println!("\n🧠 Neural Activation Functions Test");
    println!("------------------------------------");
    
    let activations = vec![
        ActivationType::ReLU,
        ActivationType::Sigmoid,
        ActivationType::Tanh,
        ActivationType::Gelu,
    ];
    
    let test_data = vec![-2.0, -1.0, 0.0, 1.0, 2.0];
    
    for activation in activations {
        let start = std::time::Instant::now();
        let result = executor.neural_activation(&test_data, activation);
        let elapsed = start.elapsed();
        
        println!("  {:?}: {:?} -> {:?} (time: {:?})", 
                 activation, test_data, result, elapsed);
    }

    // Demo 4: GPU executor (if available)
    println!("\n🎮 GPU Acceleration Test");
    println!("------------------------");
    
    match GpuExecutor::new() {
        Ok(gpu_executor) => {
            let device_info = gpu_executor.device_info();
            println!("✅ GPU detected: {} ({:?})", device_info.name, device_info.backend);
            println!("   Memory: {}MB, Compute Units: {}, FP16: {}", 
                     device_info.memory_mb, device_info.compute_units, device_info.supports_fp16);

            // Test GPU matrix multiplication
            let size = 512;
            let a = vec![1.0f32; size * size];
            let b = vec![2.0f32; size * size];
            
            let start = std::time::Instant::now();
            let result = gpu_executor.matrix_multiply(&a, &b, size, size, size);
            let elapsed = start.elapsed();
            
            println!("   GPU Matrix {}x{}: {:?} (sum: {:.2})", 
                     size, size, elapsed, result.iter().sum::<f32>());
                     
            // Get GPU stats if available
            if let Ok(stats) = gpu_executor.get_gpu_stats() {
                println!("   GPU Stats: {:.1}% utilization, {}/{}MB memory", 
                         stats.utilization_percent, stats.memory_used_mb, stats.memory_total_mb);
            }
        }
        Err(e) => {
            println!("❌ No GPU acceleration available: {}", e);
        }
    }

    // Demo 5: Performance statistics and recommendations
    println!("\n📊 Performance Analysis & Recommendations");
    println!("==========================================");
    
    let stats = executor.get_performance_stats();
    for (operation, stat) in stats {
        println!("  {}: {} ops, {:.1} ops/sec, {:.1}% success rate", 
                 operation, 
                 stat.operations_count,
                 stat.avg_throughput,
                 (stat.success_count as f64 / stat.operations_count as f64) * 100.0);
    }
    
    println!("\n💡 Optimization Recommendations:");
    let recommendations = executor.get_optimization_recommendations();
    if recommendations.is_empty() {
        println!("  ✅ System is optimally configured!");
    } else {
        for (i, rec) in recommendations.iter().enumerate() {
            println!("  {}. {}", i + 1, rec);
        }
    }

    println!("\n🎉 Demo completed successfully!");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_optimization_initialization() {
        let result = initialize_optimization();
        assert!(result.is_ok());
    }

    #[test]
    fn test_adaptive_executor() {
        let executor = AdaptiveExecutor::<f32>::new();
        assert!(executor.is_ok());
    }

    #[test]
    fn test_basic_operations() {
        let executor = AdaptiveExecutor::<f32>::new().unwrap();
        
        // Test vector operations
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![4.0, 5.0, 6.0];
        
        let sum = executor.vector_add(&a, &b);
        assert_eq!(sum, vec![5.0, 7.0, 9.0]);
        
        let product = executor.vector_multiply(&a, &b);
        assert_eq!(product, vec![4.0, 10.0, 18.0]);
        
        let total = executor.reduce_sum(&a);
        assert_eq!(total, 6.0);
    }

    #[test]
    fn test_matrix_multiplication() {
        let executor = AdaptiveExecutor::<f32>::new().unwrap();
        
        // 2x2 matrix multiplication
        let a = vec![1.0, 2.0, 3.0, 4.0]; // [[1,2], [3,4]]
        let b = vec![5.0, 6.0, 7.0, 8.0]; // [[5,6], [7,8]]
        
        let result = executor.matrix_multiply(&a, &b, 2, 2, 2);
        // Expected: [[1*5+2*7, 1*6+2*8], [3*5+4*7, 3*6+4*8]] = [[19,22], [43,50]]
        assert_eq!(result, vec![19.0, 22.0, 43.0, 50.0]);
    }

    #[test]
    fn test_neural_activations() {
        let executor = AdaptiveExecutor::<f32>::new().unwrap();
        
        let input = vec![-1.0, 0.0, 1.0];
        
        // Test ReLU
        let relu = executor.neural_activation(&input, ActivationType::ReLU);
        assert_eq!(relu, vec![0.0, 0.0, 1.0]);
        
        // Test other activations (approximate)
        let sigmoid = executor.neural_activation(&input, ActivationType::Sigmoid);
        assert!(sigmoid[1] > 0.4 && sigmoid[1] < 0.6); // sigmoid(0) ≈ 0.5
    }
}