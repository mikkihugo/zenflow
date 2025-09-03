//! Example of database integration between Rust and TypeScript layers

use file_aware_core::{DatabaseManager, DatabaseConfig, DatabaseType, CodeAnalysisRecord, CodeFeatures, HalsteadMetrics, CodeAnalysisQuery};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting file-aware core database integration example...");
    
    // Configure database connection
    let config = DatabaseConfig {
        database_type: DatabaseType::SQLite,
        connection_string: "file:./code_analysis.db".to_string(),
        pool_size: Some(10),
        timeout_ms: Some(5000),
        enable_logging: true,
    };
    
    // Create database manager
    let db_manager = DatabaseManager::new(config)?;
    
    // Initialize database connection through TypeScript layer
    println!("📊 Initializing database connection...");
    db_manager.initialize().await?;
    
    // Create tables if they don't exist
    println!("🏗️  Creating database tables...");
    db_manager.create_tables().await?;
    
    // Example: Store code analysis results
    println!("💾 Storing code analysis results...");
    
    let features = CodeFeatures {
        cyclomatic_complexity: 5.0,
        maintainability_index: 75.0,
        lines_of_code: 150,
        function_count: 8,
        import_count: 12,
        nesting_depth: 3,
        halstead_metrics: HalsteadMetrics {
            vocabulary: 45.0,
            length: 120.0,
            volume: 540.0,
            difficulty: 8.0,
            effort: 4320.0,
            time: 240.0,
            bugs: 0.18,
        },
    };
    
    let record = CodeAnalysisRecord {
        id: "example_file_001".to_string(),
        file_path: "src/example.rs".to_string(),
        language: "rust".to_string(),
        complexity_score: 5.0,
        quality_score: 0.75,
        ai_mistake_score: 0.1,
        littering_score: 0.05,
        analysis_timestamp: chrono::Utc::now().timestamp(),
        features,
        suggestions: vec![
            "Consider reducing nesting depth".to_string(),
            "Add more error handling".to_string(),
        ],
    };
    
    let result = db_manager.store_analysis(record).await?;
    if result.success {
        println!("✅ Analysis stored successfully with ID: {:?}", result.data);
    } else {
        println!("❌ Failed to store analysis: {:?}", result.error);
    }
    
    // Example: Query analysis results
    println!("🔍 Querying analysis results...");
    
    let query = CodeAnalysisQuery {
        file_path_pattern: Some("%.rs".to_string()),
        language_filter: Some(vec!["rust".to_string()]),
        quality_threshold: Some(0.7),
        complexity_range: Some((1.0, 10.0)),
        date_range: None,
        limit: Some(10),
        offset: Some(0),
    };
    
    let query_result = db_manager.query_analysis(query).await?;
    if query_result.success {
        if let Some(records) = query_result.data {
            println!("📋 Found {} analysis records:", records.len());
            for record in records {
                println!("  - {}: {} (Quality: {:.2}, Complexity: {:.2})", 
                    record.id, record.file_path, record.quality_score, record.complexity_score);
            }
        }
    } else {
        println!("❌ Query failed: {:?}", query_result.error);
    }
    
    // Example: Get quality statistics
    println!("📈 Getting quality statistics...");
    
    let stats_result = db_manager.get_quality_stats().await?;
    if stats_result.success {
        if let Some(stats) = stats_result.data {
            println!("📊 Quality Statistics:");
            println!("  - Total files: {}", stats.total_files);
            println!("  - Average quality score: {:.2}", stats.avg_quality_score);
            println!("  - Average complexity score: {:.2}", stats.avg_complexity_score);
            
            for (language, lang_stats) in &stats.language_stats {
                println!("  - {}: {} files, avg quality: {:.2}, avg complexity: {:.2}", 
                    language, lang_stats.file_count, lang_stats.avg_quality, lang_stats.avg_complexity);
            }
        }
    } else {
        println!("❌ Failed to get statistics: {:?}", stats_result.error);
    }
    
    println!("🎉 Database integration example completed successfully!");
    Ok(())
}
