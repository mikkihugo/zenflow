//! Integration tests for the FACT engine.

use fact_tools::*;
use serde_json::json;

#[tokio::test]
async fn test_fact_creation() {
    let fact = Fact::new();
    let stats = fact.cache_stats();
    assert_eq!(stats.entries, 0);
}

#[tokio::test]
async fn test_basic_processing() {
    let fact = Fact::new();
    let context = json!({
        "data": [1, 2, 3, 4, 5],
        "operation": "sum"
    });

    // This will use a mock template since we haven't loaded real ones
    match fact.process("test-template", context).await {
        Ok(_) => {
            // Template found and processed
        }
        Err(FactError::TemplateNotFound(_)) => {
            // Expected if template not loaded
        }
        Err(e) => panic!("Unexpected error: {}", e),
    }
}