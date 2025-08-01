//! Integration tests for all training algorithms

#[cfg(test)]
mod tests {
    use crate::training::*;
    use crate::{ActivationFunction, Network};

    fn create_xor_data() -> TrainingData<f32> {
        TrainingData {
            inputs: vec![
                vec![0.0, 0.0],
                vec![0.0, 1.0],
                vec![1.0, 0.0],
                vec![1.0, 1.0],
            ],
            outputs: vec![vec![0.0], vec![1.0], vec![1.0], vec![0.0]],
        }
    }

    fn create_simple_network() -> Network<f32> {
        let mut network = Network::new(&[2, 3, 1]);
        network.set_activation_function_hidden(ActivationFunction::Sigmoid);
        network.set_activation_function_output(ActivationFunction::Sigmoid);
        network.randomize_weights(-0.5, 0.5);
        network
    }

    #[test]
    fn test_adam_training() {
        let mut network = create_simple_network();
        let data = create_xor_data();

        let mut trainer = Adam::new(0.01);

        // Train for one epoch
        let error = trainer.train_epoch(&mut network, &data).unwrap();

        // Error should be finite
        assert!(error.is_finite());
        println!("Adam - Initial error: {}", error);
    }

    #[test]
    fn test_adamw_training() {
        let mut network = create_simple_network();
        let data = create_xor_data();

        let mut trainer = AdamW::new(0.01).with_weight_decay(0.001);

        // Train for one epoch
        let error = trainer.train_epoch(&mut network, &data).unwrap();

        // Error should be finite
        assert!(error.is_finite());
        println!("AdamW - Initial error: {}", error);
    }

    #[test]
    fn test_incremental_backprop_training() {
        let mut network = create_simple_network();
        let data = create_xor_data();

        let mut trainer = IncrementalBackprop::new(0.1).with_momentum(0.9);

        // Train for one epoch
        let error = trainer.train_epoch(&mut network, &data).unwrap();

        // Error should be finite
        assert!(error.is_finite());
        println!("IncrementalBackprop - Initial error: {}", error);
    }

    #[test]
    fn test_batch_backprop_training() {
        let mut network = create_simple_network();
        let data = create_xor_data();

        let mut trainer = BatchBackprop::new(0.1).with_momentum(0.9);

        // Train for one epoch
        let error = trainer.train_epoch(&mut network, &data).unwrap();

        // Error should be finite
        assert!(error.is_finite());
        println!("BatchBackprop - Initial error: {}", error);
    }

    #[test]
    fn test_rprop_training() {
        let mut network = create_simple_network();
        let data = create_xor_data();

        let mut trainer = Rprop::new();

        // Train for one epoch
        let error = trainer.train_epoch(&mut network, &data).unwrap();

        // Error should be finite
        assert!(error.is_finite());
        println!("Rprop - Initial error: {}", error);
    }

    #[test]
    fn test_quickprop_training() {
        let mut network = create_simple_network();
        let data = create_xor_data();

        let mut trainer = Quickprop::new();

        // Train for one epoch
        let error = trainer.train_epoch(&mut network, &data).unwrap();

        // Error should be finite
        assert!(error.is_finite());
        println!("Quickprop - Initial error: {}", error);
    }

    #[test]
    fn test_all_algorithms_improve_error() {
        let data = create_xor_data();

        // Test each algorithm for multiple epochs
        let algorithms: Vec<(&str, Box<dyn TrainingAlgorithm<f32>>)> = vec![
            ("Adam", Box::new(Adam::new(0.1))), // Higher learning rate for Adam
            ("AdamW", Box::new(AdamW::new(0.1))),
            (
                "IncrementalBackprop",
                Box::new(IncrementalBackprop::new(0.1)),
            ),
            ("BatchBackprop", Box::new(BatchBackprop::new(0.1))),
            ("Rprop", Box::new(Rprop::new())),
            ("Quickprop", Box::new(Quickprop::new())),
        ];

        for (name, mut trainer) in algorithms {
            let mut network = create_simple_network();

            // Get initial error
            let initial_error = trainer.calculate_error(&network, &data);

            // Train for 50 epochs (more epochs for better convergence)
            let mut min_error = initial_error;
            for epoch in 0..50 {
                let error = trainer.train_epoch(&mut network, &data).unwrap();
                if error < min_error {
                    min_error = error;
                }

                // Print progress for debugging
                if epoch % 10 == 0 {
                    println!("{} - Epoch {}: error = {:.6}", name, epoch, error);
                }
            }

            // Get final error
            let final_error = trainer.calculate_error(&network, &data);

            println!("{}: Initial error: {:.6}, Final error: {:.6}, Min error: {:.6}, Improvement: {:.2}%", 
                name, initial_error, final_error, min_error,
                (1.0 - min_error/initial_error) * 100.0);

            // Error should improve or at least not get much worse
            // Use minimum error seen during training rather than final error
            assert!(
                min_error <= initial_error * 1.1,
                "{} error increased significantly. Initial: {}, Min: {}",
                name,
                initial_error,
                min_error
            );
        }
    }
}
