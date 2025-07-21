/// Simple focused test for compression integration
#[cfg(all(feature = "compression", feature = "serde"))]
use ruv_fann::{NetworkBuilder, Network};

#[cfg(all(feature = "compression", feature = "serde"))]
#[test]
fn test_compression_integration_basic() {
    // Create a simple network
    let network: Network<f32> = NetworkBuilder::new()
        .input_layer(2)
        .hidden_layer(3)
        .output_layer(1)
        .build();

    // Test compression stats
    let stats = network.compression_stats().expect("Failed to get compression stats");
    
    // Verify basic properties
    assert!(stats.original_size > 0, "Original size should be positive");
    assert!(stats.compressed_size > 0, "Compressed size should be positive");
    assert!(stats.ratio > 0.0 && stats.ratio <= 1.0, "Compression ratio should be between 0 and 1");
    assert!(stats.savings_percent >= 0.0, "Savings percent should be non-negative");
    
    println!("✅ Compression integration test passed!");
    println!("   Original size: {} bytes", stats.original_size);
    println!("   Compressed size: {} bytes", stats.compressed_size);
    println!("   Compression ratio: {:.3}", stats.ratio);
    println!("   Space savings: {:.1}%", stats.savings_percent);
}

#[cfg(not(all(feature = "compression", feature = "serde")))]
#[test]
fn compression_features_not_enabled() {
    println!("⏭️  Compression test skipped - features not enabled");
    println!("   To test: cargo test --features compression,serde");
}