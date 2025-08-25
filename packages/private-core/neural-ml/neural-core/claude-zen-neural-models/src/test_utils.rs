//! Test utilities for neural models

use crate::foundation::*;

/// Create a simple test dataset
pub fn create_test_dataset() -> TimeSeriesDataset<f32> {
    TimeSeriesDataset {
        samples: vec![],
        metadata: DatasetMetadata {
            name: Some("test_dataset".to_string()),
            description: Some("Test dataset for unit tests".to_string()),
            num_series: 1,
            total_samples: 1,
            feature_names: vec![],
            target_names: vec!["value".to_string()],
        },
    }
}

/// Create a test time series sample
pub fn create_test_sample() -> TimeSeriesSample<f32> {
    TimeSeriesSample {
        input: TimeSeriesInput {
            historical_targets: vec![1.0, 2.0, 3.0, 4.0, 5.0],
            static_features: None,
            historical_features: None,
            future_features: None,
            unique_id: Some("test_series".to_string()),
            last_timestamp: None,
        },
        target: vec![6.0],
        weight: Some(1.0),
    }
}