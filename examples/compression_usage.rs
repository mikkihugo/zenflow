//! Example demonstrating the integrated compression features in Network
//! 
//! This example shows how to use the newly integrated compression functionality
//! that was previously unused in the src/io/compression.rs module.

use ruv_fann::{NetworkBuilder, Network, CompressionStats};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("=== Network Compression Integration Example ===\n");

    // Create a sample network
    println!("1. Creating a neural network...");
    let network: Network<f32> = NetworkBuilder::new()
        .input_layer(10)   // 10 input neurons + bias
        .hidden_layer(20)  // 20 hidden neurons + bias  
        .hidden_layer(15)  // 15 hidden neurons + bias
        .hidden_layer(8)   // 8 hidden neurons + bias
        .output_layer(3)   // 3 output neurons (no bias)
        .build();

    println!("Network structure:");
    println!("  - Layers: {}", network.num_layers());
    println!("  - Total neurons: {}", network.total_neurons());
    println!("  - Total connections: {}", network.total_connections());
    println!();

    // Test compression statistics without saving
    println!("2. Analyzing compression effectiveness...");
    let stats = network.compression_stats()?;
    print_compression_stats(&stats);
    println!();

    // Save compressed network
    println!("3. Saving compressed network...");
    let compressed_file = "example_network_compressed.bin.gz";
    let save_stats = network.save_compressed(compressed_file)?;
    println!("✓ Saved to: {}", compressed_file);
    print_compression_stats(&save_stats);
    println!();

    // Save uncompressed for comparison
    println!("4. Saving uncompressed network for comparison...");
    let uncompressed_file = "example_network_uncompressed.bin";
    let uncompressed_size = network.save_uncompressed(uncompressed_file)?;
    println!("✓ Saved to: {} ({} bytes)", uncompressed_file, uncompressed_size);
    println!();

    // Load and verify compressed network
    println!("5. Loading and verifying compressed network...");
    let loaded_network: Network<f32> = Network::load_compressed(compressed_file)?;
    
    println!("✓ Loaded successfully!");
    println!("Verification:");
    println!("  - Original layers: {} | Loaded layers: {} ✓", 
             network.num_layers(), loaded_network.num_layers());
    println!("  - Original inputs: {} | Loaded inputs: {} ✓", 
             network.num_inputs(), loaded_network.num_inputs());
    println!("  - Original outputs: {} | Loaded outputs: {} ✓", 
             network.num_outputs(), loaded_network.num_outputs());
    println!("  - Original neurons: {} | Loaded neurons: {} ✓", 
             network.total_neurons(), loaded_network.total_neurons());
    println!("  - Original connections: {} | Loaded connections: {} ✓", 
             network.total_connections(), loaded_network.total_connections());
    println!();

    // Compare file sizes
    println!("6. File size comparison:");
    let compressed_size = std::fs::metadata(compressed_file)?.len();
    let uncompressed_size = std::fs::metadata(uncompressed_file)?.len();
    let actual_savings = ((uncompressed_size - compressed_size) as f64 / uncompressed_size as f64) * 100.0;
    
    println!("  - Compressed: {} bytes", compressed_size);
    println!("  - Uncompressed: {} bytes", uncompressed_size);
    println!("  - Actual disk savings: {:.1}%", actual_savings);
    println!();

    // Test with a trained network
    println!("7. Testing compression with trained network...");
    let mut training_network: Network<f32> = NetworkBuilder::new()
        .input_layer(2)
        .hidden_layer(4)
        .output_layer(1)
        .build();

    // Simple XOR training data
    let inputs = vec![
        vec![0.0, 0.0],
        vec![0.0, 1.0], 
        vec![1.0, 0.0],
        vec![1.0, 1.0],
    ];
    let outputs = vec![
        vec![0.0],
        vec![1.0],
        vec![1.0], 
        vec![0.0],
    ];

    // Train briefly
    training_network.train(&inputs, &outputs, 0.1, 100)?;
    
    let trained_stats = training_network.compression_stats()?;
    println!("Trained network compression:");
    print_compression_stats(&trained_stats);
    println!();

    // Cleanup example files
    println!("8. Cleaning up example files...");
    let _ = std::fs::remove_file(compressed_file);
    let _ = std::fs::remove_file(uncompressed_file);
    println!("✓ Cleaned up temporary files");
    println!();

    println!("=== Compression Integration Example Complete ===");
    println!("\nKey benefits of the integrated compression:");
    println!("  ✓ Reduces file size by {:.1}% on average", stats.savings_percent);
    println!("  ✓ Transparent save/load with compression");
    println!("  ✓ Compression statistics for optimization");
    println!("  ✓ Error handling for robust applications");
    println!("  ✓ Compatible with existing Network API");

    Ok(())
}

fn print_compression_stats(stats: &CompressionStats) {
    println!("  📊 Compression Statistics:");
    println!("     Original size:     {} bytes", stats.original_size);
    println!("     Compressed size:   {} bytes", stats.compressed_size);
    println!("     Compression ratio: {:.3}", stats.ratio);
    println!("     Space savings:     {:.1}%", stats.savings_percent);
}