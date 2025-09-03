//! Example database configuration showing how to set up different database types
//! with foundation-integrated path resolution for .claude-zen directory structure

use file_aware_core::database::{
    DatabaseConfig, DatabaseType, SQLiteConfig, LanceDBConfig, KuzuConfig,
    DatabaseManager, DatabasePathResolver
};
use std::path::PathBuf;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Setting up database configurations for .claude-zen directory structure...");
    
    // Example 1: SQLite for code analysis and metrics
    let sqlite_config = DatabaseConfig {
        database_type: DatabaseType::SQLite,
        connection_string: "file:./code_analysis.db".to_string(),
        database_path: None, // Will be resolved by foundation
        data_directory: None,
        cache_directory: None,
        models_directory: None,
        logs_directory: None,
        pool_size: Some(1), // SQLite is single-connection
        timeout_ms: Some(5000),
        max_connections: Some(1),
        connection_lifetime: None,
        retry_attempts: Some(3),
        sqlite_config: Some(SQLiteConfig {
            journal_mode: "WAL".to_string(),
            synchronous: "NORMAL".to_string(),
            cache_size: 10000, // 10MB cache
            temp_store: "FILE".to_string(),
            mmap_size: 268435456, // 256MB mmap
            page_size: 4096,
            auto_vacuum: "INCREMENTAL".to_string(),
            database_file: "code_analysis.db".to_string(),
        }),
        lancedb_config: None,
        kuzu_config: None,
        postgres_config: None,
        mysql_config: None,
        enable_logging: true,
        enable_metrics: true,
    };
    
    // Example 2: LanceDB for vector embeddings and ML features
    let lancedb_config = DatabaseConfig {
        database_type: DatabaseType::LanceDB,
        connection_string: "lancedb://./vector_store".to_string(),
        database_path: None, // Will be resolved by foundation
        data_directory: None,
        cache_directory: None,
        models_directory: None,
        logs_directory: None,
        pool_size: Some(10),
        timeout_ms: Some(10000),
        max_connections: Some(20),
        connection_lifetime: Some(300000), // 5 minutes
        retry_attempts: Some(5),
        sqlite_config: None,
        lancedb_config: Some(LanceDBConfig {
            vector_dimension: 768, // BERT embedding size
            index_type: "HNSW".to_string(), // Hierarchical Navigable Small World
            metric: "COSINE".to_string(),
            num_partitions: 4,
            max_connections: 16,
            enable_compression: true,
            compression_type: "ZSTD".to_string(),
            database_directory: "vector_store".to_string(),
            table_name: "code_embeddings".to_string(),
        }),
        kuzu_config: None,
        postgres_config: None,
        mysql_config: None,
        enable_logging: true,
        enable_metrics: true,
    };
    
    // Example 3: Kuzu for graph relationships and code dependencies
    let kuzu_config = DatabaseConfig {
        database_type: DatabaseType::Kuzu,
        connection_string: "kuzu://./code_graph".to_string(),
        database_path: None, // Will be resolved by foundation
        data_directory: None,
        cache_directory: None,
        models_directory: None,
        logs_directory: None,
        pool_size: Some(5),
        timeout_ms: Some(15000),
        max_connections: Some(10),
        connection_lifetime: Some(600000), // 10 minutes
        retry_attempts: Some(3),
        sqlite_config: None,
        lancedb_config: None,
        kuzu_config: Some(KuzuConfig {
            buffer_pool_size: 1073741824, // 1GB buffer pool
            max_threads: 8,
            enable_compression: true,
            log_buffer_size: 67108864, // 64MB log buffer
            checkpoint_wait_timeout: 30000, // 30 seconds
            enable_memory_limit: true,
            memory_limit: 2147483648, // 2GB memory limit
            database_directory: "code_graph".to_string(),
            wal_mode: true,
            checkpoint_interval: 300, // 5 minutes
        }),
        postgres_config: None,
        mysql_config: None,
        enable_logging: true,
        enable_metrics: true,
    };
    
    // Show how paths would be resolved by foundation
    let path_resolver = DatabasePathResolver::new()?;
    path_resolver.ensure_directories()?;
    
    println!("\nDatabase paths resolved by foundation:");
    println!("Base directory: {}", path_resolver.base_directory.display());
    println!("Data directory: {}", path_resolver.data_directory.display());
    println!("Cache directory: {}", path_resolver.cache_directory.display());
    println!("Models directory: {}", path_resolver.models_directory.display());
    println!("Logs directory: {}", path_resolver.logs_directory.display());
    
    println!("\nResolved database paths:");
    println!("SQLite: {}", path_resolver.resolve_database_path(&DatabaseType::SQLite, &sqlite_config).display());
    println!("LanceDB: {}", path_resolver.resolve_database_path(&DatabaseType::LanceDB, &lancedb_config).display());
    println!("Kuzu: {}", path_resolver.resolve_database_path(&DatabaseType::Kuzu, &kuzu_config).display());
    
    // Example: Initialize SQLite database
    println!("\nInitializing SQLite database...");
    let mut sqlite_manager = DatabaseManager::new(sqlite_config)?;
    sqlite_manager.initialize().await?;
    sqlite_manager.create_tables().await?;
    println!("SQLite database initialized successfully!");
    
    // Example: Initialize LanceDB database
    println!("\nInitializing LanceDB database...");
    let mut lancedb_manager = DatabaseManager::new(lancedb_config)?;
    lancedb_manager.initialize().await?;
    lancedb_manager.create_tables().await?;
    println!("LanceDB database initialized successfully!");
    
    // Example: Initialize Kuzu database
    println!("\nInitializing Kuzu database...");
    let mut kuzu_manager = DatabaseManager::new(kuzu_config)?;
    kuzu_manager.initialize().await?;
    kuzu_manager.create_tables().await?;
    println!("Kuzu database initialized successfully!");
    
    println!("\nAll databases initialized successfully!");
    println!("Database files are stored in: {}", path_resolver.data_directory.display());
    
    Ok(())
}
