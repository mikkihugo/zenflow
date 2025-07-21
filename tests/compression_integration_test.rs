//! Integration test for compression features in Network struct
//! This test validates that the unused compression features are now properly integrated

#[cfg(all(feature = "compression", feature = "serde"))]
mod tests {
    use ruv_fann::{Network, NetworkBuilder, CompressionStats};
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_compressed_save_load_roundtrip() {
        // Create a test network
        let network: Network<f32> = NetworkBuilder::new()
            .input_layer(4)
            .hidden_layer(6)
            .hidden_layer(4)
            .output_layer(2)
            .build();

        // Create temporary directory
        let temp_dir = TempDir::new().unwrap();
        let compressed_path = temp_dir.path().join("network_compressed.bin.gz");
        let uncompressed_path = temp_dir.path().join("network_uncompressed.bin");

        // Test compressed save
        let compression_stats = network
            .save_compressed(compressed_path.to_str().unwrap())
            .expect("Failed to save compressed network");

        // Verify compression stats are reasonable
        assert!(compression_stats.original_size > 0);
        assert!(compression_stats.compressed_size > 0);
        assert!(compression_stats.ratio > 0.0 && compression_stats.ratio < 1.0);
        assert!(compression_stats.savings_percent > 0.0 && compression_stats.savings_percent < 100.0);

        println!("Compression Stats:");
        println!("  Original size: {} bytes", compression_stats.original_size);
        println!("  Compressed size: {} bytes", compression_stats.compressed_size);
        println!("  Compression ratio: {:.3}", compression_stats.ratio);
        println!("  Space savings: {:.1}%", compression_stats.savings_percent);

        // Test compressed load
        let loaded_network: Network<f32> = Network::load_compressed(compressed_path.to_str().unwrap())
            .expect("Failed to load compressed network");

        // Verify network structure is preserved
        assert_eq!(network.num_layers(), loaded_network.num_layers());
        assert_eq!(network.num_inputs(), loaded_network.num_inputs());
        assert_eq!(network.num_outputs(), loaded_network.num_outputs());
        assert_eq!(network.total_neurons(), loaded_network.total_neurons());
        assert_eq!(network.total_connections(), loaded_network.total_connections());

        // Compare with uncompressed save for size comparison
        let uncompressed_size = network
            .save_uncompressed(uncompressed_path.to_str().unwrap())
            .expect("Failed to save uncompressed network");

        // Verify compression actually reduces file size
        assert!(compression_stats.compressed_size < uncompressed_size);

        // Verify the uncompressed network also loads correctly
        let loaded_uncompressed: Network<f32> = Network::load_uncompressed(uncompressed_path.to_str().unwrap())
            .expect("Failed to load uncompressed network");

        assert_eq!(network.num_layers(), loaded_uncompressed.num_layers());
        assert_eq!(network.num_inputs(), loaded_uncompressed.num_inputs());
        assert_eq!(network.num_outputs(), loaded_uncompressed.num_outputs());
    }

    #[test]
    fn test_compression_stats_without_saving() {
        // Create a test network
        let network: Network<f32> = NetworkBuilder::new()
            .input_layer(10)
            .hidden_layer(20)
            .hidden_layer(15)
            .hidden_layer(10)
            .output_layer(5)
            .build();

        // Get compression stats without actually saving
        let stats = network.compression_stats()
            .expect("Failed to get compression stats");

        // Verify stats are reasonable
        assert!(stats.original_size > 0);
        assert!(stats.compressed_size > 0);
        assert!(stats.ratio > 0.0 && stats.ratio < 1.0);
        assert!(stats.savings_percent > 0.0 && stats.savings_percent < 100.0);

        // For neural networks, we expect decent compression due to redundancy in weights
        assert!(stats.savings_percent > 10.0, "Expected at least 10% compression savings");

        println!("Network compression effectiveness:");
        println!("  Original size: {} bytes", stats.original_size);
        println!("  Compressed size: {} bytes", stats.compressed_size);
        println!("  Compression ratio: {:.3}", stats.ratio);
        println!("  Space savings: {:.1}%", stats.savings_percent);
    }

    #[test]
    fn test_compression_with_trained_network() {
        // Create and train a simple XOR network
        let mut network: Network<f32> = NetworkBuilder::new()
            .input_layer(2)
            .hidden_layer(4)
            .output_layer(1)
            .build();

        // Simple training data for XOR
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

        // Train the network briefly
        network.train(&inputs, &outputs, 0.1, 10)
            .expect("Training failed");

        // Test compression on trained network
        let stats = network.compression_stats()
            .expect("Failed to get compression stats for trained network");

        assert!(stats.original_size > 0);
        assert!(stats.compressed_size > 0);
        assert!(stats.savings_percent > 0.0);

        println!("Trained network compression:");
        println!("  Space savings: {:.1}%", stats.savings_percent);
    }

    #[test]
    fn test_error_handling() {
        let network: Network<f32> = NetworkBuilder::new()
            .input_layer(2)
            .output_layer(1)
            .build();

        // Test with invalid path
        let result = network.save_compressed("/invalid/path/network.bin.gz");
        assert!(result.is_err());

        // Test loading non-existent file
        let result = Network::<f32>::load_compressed("/non/existent/file.bin.gz");
        assert!(result.is_err());
    }
}

#[cfg(not(all(feature = "compression", feature = "serde")))]
mod tests {
    #[test]
    fn test_compression_features_disabled() {
        // When compression or serde features are disabled, 
        // the test should still pass but indicate features are unavailable
        println!("Compression integration test skipped - features not enabled");
        println!("To test compression: cargo test --features compression,serde");
    }
}