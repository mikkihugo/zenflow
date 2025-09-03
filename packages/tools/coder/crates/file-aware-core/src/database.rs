//! Database integration for file-aware core with direct Rust database connections
//! Supports multiple database types optimized for different data structures:
//! - SQLite: Relational data, code metrics, analysis results
//! - LanceDB: Vector embeddings, semantic search, ML features  
//! - Kuzu: Graph relationships, code dependencies, call graphs
//! - Specialized: Code analysis, ML models, knowledge graphs
//! 
//! All databases are disk-based and get their paths from foundation package
//! for consistent .claude-zen directory structure

use crate::{Result, FileAwareError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

// TODO: Import foundation database path utilities when available
// use @claude-zen/foundation::database::get_database_path;
// use @claude-zen/foundation::config::get_database_config;

/// Database connection configuration with type-specific optimizations
/// Paths are resolved through foundation package for consistent .claude-zen structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub database_type: DatabaseType,
    pub connection_string: String,
    
    // Database paths resolved through foundation package
    pub database_path: Option<PathBuf>,        // Primary database file/directory
    pub data_directory: Option<PathBuf>,       // .claude-zen/data directory
    pub cache_directory: Option<PathBuf>,      // .claude-zen/cache directory
    pub models_directory: Option<PathBuf>,     // .claude-zen/models directory
    pub logs_directory: Option<PathBuf>,       // .claude-zen/logs directory
    
    // Connection pooling and performance
    pub pool_size: Option<usize>,
    pub timeout_ms: Option<u64>,
    pub max_connections: Option<usize>,
    pub connection_lifetime: Option<u64>,
    pub retry_attempts: Option<usize>,
    
    // Type-specific configurations for disk-based databases
    pub sqlite_config: Option<SQLiteConfig>,
    // Future database configurations (when crates are available):
    // pub lancedb_config: Option<LanceDBConfig>,
    // pub kuzu_config: Option<KuzuConfig>,
    // pub postgres_config: Option<PostgreSQLConfig>,
    // pub mysql_config: Option<MySQLConfig>,
    
    pub enable_logging: bool,
    pub enable_metrics: bool,
}

/// SQLite configuration for code analysis and metrics (disk-based)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SQLiteConfig {
    pub journal_mode: String, // WAL, DELETE, TRUNCATE, PERSIST, MEMORY, OFF
    pub synchronous: String,  // OFF, NORMAL, FULL, EXTRA
    pub cache_size: i64,      // Pages in cache
    pub temp_store: String,   // DEFAULT, FILE, MEMORY
    pub mmap_size: i64,       // Memory-mapped I/O size
    pub page_size: i32,       // Page size in bytes
    pub auto_vacuum: String,  // NONE, FULL, INCREMENTAL
    pub database_file: String, // Specific database file name
}

/// LanceDB configuration for vector embeddings and ML features (disk-based)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanceDBConfig {
    pub vector_dimension: usize,
    pub index_type: String,   // IVF, HNSW, FLAT
    pub metric: String,       // L2, COSINE, DOT
    pub num_partitions: usize,
    pub max_connections: usize,
    pub enable_compression: bool,
    pub compression_type: String, // ZSTD, LZ4, SNAPPY
    pub database_directory: String, // Specific database directory name
    pub table_name: String,   // Collection/table name
}

/// Kuzu configuration for graph relationships and code dependencies (disk-based)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KuzuConfig {
    pub buffer_pool_size: usize,
    pub max_threads: usize,
    pub enable_compression: bool,
    pub log_buffer_size: usize,
    pub checkpoint_wait_timeout: u64,
    pub enable_memory_limit: bool,
    pub memory_limit: usize,
    pub database_directory: String, // Specific database directory name
    pub wal_mode: bool,            // Write-ahead logging
    pub checkpoint_interval: u64,  // Checkpoint interval in seconds
}

/// PostgreSQL configuration for enterprise-scale data (disk-based)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostgreSQLConfig {
    pub ssl_mode: String,
    pub application_name: String,
    pub statement_timeout: u64,
    pub idle_in_transaction_timeout: u64,
    pub enable_prepared_statements: bool,
    pub max_prepared_statements: usize,
    pub data_directory: String,    // PostgreSQL data directory
    pub config_file: String,       // postgresql.conf file
    pub hba_file: String,          // pg_hba.conf file
}

/// MySQL configuration for enterprise-scale data (disk-based)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MySQLConfig {
    pub ssl_mode: String,
    pub charset: String,
    pub collation: String,
    pub sql_mode: String,
    pub time_zone: String,
    pub enable_prepared_statements: bool,
    pub data_directory: String,    // MySQL data directory
    pub config_file: String,       // my.cnf file
    pub socket_file: String,       // MySQL socket file
}

/// Supported database types with specialized use cases
/// All databases are disk-based for persistence and performance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DatabaseType {
    SQLite,      // Relational: Code metrics, analysis results, user stories (single file)
    // Future database types (when crates are available):
    // LanceDB,     // Vector: ML embeddings, semantic search, code similarity (directory)
    // Kuzu,        // Graph: Code dependencies, call graphs, relationships (directory)
    // PostgreSQL,  // Enterprise: Large-scale data, complex queries, ACID (directory)
    // MySQL,       // Enterprise: Large-scale data, complex queries, ACID (directory)
    // ChromaDB,    // Vector: RAG systems, document embeddings (directory)
    // Neo4j,       // Graph: Complex knowledge graphs, relationships (directory)
    // InfluxDB,    // Time-series: Performance metrics, monitoring data (directory)
    // Redis,       // Cache: Session data, temporary results, ML model cache (disk + memory)
}

/// Database path resolver that integrates with foundation package
/// Ensures consistent .claude-zen directory structure across all database types
pub struct DatabasePathResolver {
    base_directory: PathBuf,
    data_directory: PathBuf,
    cache_directory: PathBuf,
    models_directory: PathBuf,
    logs_directory: PathBuf,
}

impl DatabasePathResolver {
    /// Create a new path resolver using foundation package configuration
    pub fn new() -> Result<Self> {
        // TODO: Get base directory from foundation package
        // let base_dir = foundation::config::get_base_directory()?;
        
        // For now, use default .claude-zen structure
        let home_dir = std::env::var("HOME")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("/tmp"));
        
        let base_directory = home_dir.join(".claude-zen");
        let data_directory = base_directory.join("data");
        let cache_directory = base_directory.join("cache");
        let models_directory = base_directory.join("models");
        let logs_directory = base_directory.join("logs");
        
        Ok(Self {
            base_directory,
            data_directory,
            cache_directory,
            models_directory,
            logs_directory,
        })
    }
    
    /// Resolve database path based on type and configuration
    pub fn resolve_database_path(&self, db_type: &DatabaseType, config: &DatabaseConfig) -> PathBuf {
        match db_type {
            DatabaseType::SQLite => {
                // SQLite: Single file in data directory
                let db_name = config.sqlite_config
                    .as_ref()
                    .map(|c| &c.database_file)
                    .unwrap_or(&"code_analysis.db".to_string());
                self.data_directory.join(db_name)
            },
            DatabaseType::LanceDB => {
                // LanceDB: Directory in data directory
                let db_name = config.lancedb_config
                    .as_ref()
                    .map(|c| &c.database_directory)
                    .unwrap_or(&"lancedb_code_analysis".to_string());
                self.data_directory.join(db_name)
            },
            DatabaseType::Kuzu => {
                // Kuzu: Directory in data directory
                let db_name = config.kuzu_config
                    .as_ref()
                    .map(|c| &c.database_directory)
                    .unwrap_or(&"kuzu_code_graph".to_string());
                self.data_directory.join(db_name)
            },
            DatabaseType::PostgreSQL => {
                // PostgreSQL: Use configured data directory or default
                config.database_path.clone()
                    .unwrap_or_else(|| self.data_directory.join("postgresql"))
            },
            DatabaseType::MySQL => {
                // MySQL: Use configured data directory or default
                config.database_path.clone()
                    .unwrap_or_else(|| self.data_directory.join("mysql"))
            },
        }
    }
    
    /// Get cache directory for temporary data
    pub fn get_cache_directory(&self) -> &PathBuf {
        &self.cache_directory
    }
    
    /// Get models directory for ML models
    pub fn get_models_directory(&self) -> &PathBuf {
        &self.models_directory
    }
    
    /// Get logs directory for database logs
    pub fn get_logs_directory(&self) -> &PathBuf {
        &self.logs_directory
    }
    
    /// Ensure all required directories exist
    pub fn ensure_directories(&self) -> Result<()> {
        std::fs::create_dir_all(&self.base_directory)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to create base directory: {}", e),
            })?;
        
        std::fs::create_dir_all(&self.data_directory)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to create data directory: {}", e),
            })?;
        
        std::fs::create_dir_all(&self.cache_directory)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to create cache directory: {}", e),
            })?;
        
        std::fs::create_dir_all(&self.models_directory)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to create models directory: {}", e),
            })?;
        
        std::fs::create_dir_all(&self.logs_directory)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to create logs directory: {}", e),
            })?;
        
        Ok(())
    }
}

/// Database operation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub execution_time_ms: u64,
}

/// Database integration manager
pub struct DatabaseManager {
    config: DatabaseConfig,
    #[cfg(feature = "sqlite")]
    sqlite_connection: Option<rusqlite::Connection>,
    // Future database connections (when crates are available):
    // lancedb_connection: Option<lancedb::Database>,
    // kuzu_connection: Option<kuzu::Database>,
    // postgres_connection: Option<tokio_postgres::Client>,
    // mysql_connection: Option<mysql_async::Pool>,
    connection_health: HashMap<DatabaseType, bool>,
    performance_metrics: HashMap<String, f64>,
}

/// Code analysis record for database storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeAnalysisRecord {
    pub id: String,
    pub file_path: String,
    pub language: String,
    pub complexity_score: f32,
    pub quality_score: f32,
    pub ai_mistake_score: f32,
    pub littering_score: f32,
    pub analysis_timestamp: i64,
    pub features: CodeFeatures,
    pub suggestions: Vec<String>,
}

/// Code features for database storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeFeatures {
    pub cyclomatic_complexity: f32,
    pub maintainability_index: f32,
    pub lines_of_code: usize,
    pub function_count: usize,
    pub import_count: usize,
    pub nesting_depth: usize,
    pub halstead_metrics: HalsteadMetrics,
}

/// Halstead metrics for database storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HalsteadMetrics {
    pub vocabulary: f32,
    pub length: f32,
    pub volume: f32,
    pub difficulty: f32,
    pub effort: f32,
    pub time: f32,
    pub bugs: f32,
}

/// Database query for code analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeAnalysisQuery {
    pub file_path_pattern: Option<String>,
    pub language_filter: Option<Vec<String>>,
    pub quality_threshold: Option<f32>,
    pub complexity_range: Option<(f32, f32)>,
    pub date_range: Option<(i64, i64)>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

impl DatabaseManager {
    /// Create a new database manager with foundation-integrated path resolution
    pub fn new(config: DatabaseConfig) -> Result<Self> {
        // Ensure all required directories exist
        let path_resolver = DatabasePathResolver::new()?;
        path_resolver.ensure_directories()?;
        
        Ok(Self {
            config,
            sqlite_connection: None,
            lancedb_connection: None,
            kuzu_connection: None,
            postgres_connection: None,
            mysql_connection: None,
            connection_health: HashMap::new(),
            performance_metrics: HashMap::new(),
        })
    }
    
    /// Initialize database connection with foundation-resolved paths
    pub async fn initialize(&mut self) -> Result<()> {
        let path_resolver = DatabasePathResolver::new()?;
        
        match self.config.database_type {
            DatabaseType::SQLite => self.initialize_sqlite(&path_resolver).await,
            DatabaseType::LanceDB => self.initialize_lancedb(&path_resolver).await,
            DatabaseType::Kuzu => self.initialize_kuzu(&path_resolver).await,
            DatabaseType::PostgreSQL => self.initialize_postgres(&path_resolver).await,
            DatabaseType::MySQL => self.initialize_mysql(&path_resolver).await,
        }
    }
    
    /// Initialize SQLite with foundation-resolved path
    async fn initialize_sqlite(&mut self, path_resolver: &DatabasePathResolver) -> Result<()> {
        let db_path = path_resolver.resolve_database_path(&self.config.database_type, &self.config);
        
        let conn = rusqlite::Connection::open(&db_path)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to connect to SQLite at {}: {}", db_path.display(), e),
            })?;
        
        // Apply optimizations for code analysis
        if let Some(ref sqlite_config) = self.config.sqlite_config {
            conn.execute_batch(&format!(
                "PRAGMA journal_mode = {}; \
                 PRAGMA synchronous = {}; \
                 PRAGMA cache_size = {}; \
                 PRAGMA temp_store = {}; \
                 PRAGMA mmap_size = {}; \
                 PRAGMA page_size = {}; \
                 PRAGMA auto_vacuum = {};",
                sqlite_config.journal_mode,
                sqlite_config.synchronous,
                sqlite_config.cache_size,
                sqlite_config.temp_store,
                sqlite_config.mmap_size,
                sqlite_config.page_size,
                sqlite_config.auto_vacuum
            ))
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to apply SQLite optimizations: {}", e),
            })?;
        }
        
        self.sqlite_connection = Some(conn);
        self.connection_health.insert(DatabaseType::SQLite, true);
        Ok(())
    }
    
    /// Initialize LanceDB with foundation-resolved path
    async fn initialize_lancedb(&mut self, path_resolver: &DatabasePathResolver) -> Result<()> {
        let db_path = path_resolver.resolve_database_path(&self.config.database_type, &self.config);
        
        let db = lancedb::Database::connect(db_path.to_string_lossy().as_ref())
            .await
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to connect to LanceDB at {}: {}", db_path.display(), e),
            })?;
        
        self.lancedb_connection = Some(db);
        self.connection_health.insert(DatabaseType::LanceDB, true);
        Ok(())
    }
    
    /// Initialize Kuzu with foundation-resolved path
    async fn initialize_kuzu(&mut self, path_resolver: &DatabasePathResolver) -> Result<()> {
        let db_path = path_resolver.resolve_database_path(&self.config.database_type, &self.config);
        
        let db = kuzu::Database::new(db_path.to_string_lossy().as_ref(), 0)
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to connect to Kuzu at {}: {}", db_path.display(), e),
            })?;
        
        self.kuzu_connection = Some(db);
        self.connection_health.insert(DatabaseType::Kuzu, true);
        Ok(())
    }
    
    /// Initialize PostgreSQL with foundation-resolved path
    async fn initialize_postgres(&mut self, path_resolver: &DatabasePathResolver) -> Result<()> {
        let (client, connection) = tokio_postgres::connect(&self.config.connection_string, tokio_postgres::NoTls)
            .await
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to connect to PostgreSQL: {}", e),
            })?;
        
        // Spawn connection handler
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("PostgreSQL connection error: {}", e);
            }
        });
        
        self.postgres_connection = Some(client);
        self.connection_health.insert(DatabaseType::PostgreSQL, true);
        Ok(())
    }
    
    /// Initialize MySQL with foundation-resolved path
    async fn initialize_mysql(&mut self, path_resolver: &DatabasePathResolver) -> Result<()> {
        let pool_size = self.config.max_connections.unwrap_or(10);
        
        let pool = mysql_async::Pool::new(self.config.connection_string.as_str())
            .map_err(|e| FileAwareError::DatabaseError {
                message: format!("Failed to connect to MySQL: {}", e),
            })?;
        
        self.mysql_connection = Some(pool);
        self.connection_health.insert(DatabaseType::MySQL, true);
        Ok(())
    }
    
    /// Store code analysis results in database
    pub async fn store_analysis(&self, record: CodeAnalysisRecord) -> Result<DatabaseResult<String>> {
        let features_json = serde_json::to_string(&record.features).unwrap_or("[]".to_string());
        let suggestions_json = serde_json::to_string(&record.suggestions).unwrap_or("[]".to_string());
        
        let script = format!(
            r#"
            import {{ DatabaseProvider }} from '{}/src/index.js';
            
            const db = new DatabaseProvider();
            await db.initialize();
            
            const result = await db.insert('code_analysis', {{
                id: '{}',
                file_path: '{}',
                language: '{}',
                complexity_score: {},
                quality_score: {},
                ai_mistake_score: {},
                littering_score: {},
                analysis_timestamp: {},
                features: {},
                suggestions: {}
            }});
            
            console.log(JSON.stringify({{ success: true, data: result.id }}));
            "#,
            self.node_modules_path,
            record.id,
            record.file_path,
            record.language,
            record.complexity_score,
            record.quality_score,
            record.ai_mistake_score,
            record.littering_score,
            record.analysis_timestamp.timestamp(),
            features_json,
            suggestions_json
        );
        
        let result = self.run_typescript_script(&script).await?;
        self.parse_database_result(&result)
    }
    
    /// Query code analysis records from database
    pub async fn query_analysis(&self, query: CodeAnalysisQuery) -> Result<DatabaseResult<Vec<CodeAnalysisRecord>>> {
        let where_clause = self.build_where_clause(&query);
        
        let script = format!(
            r#"
            import {{ DatabaseProvider }} from '{}/src/index.js';
            
            const db = new DatabaseProvider();
            await db.initialize();
            
            const results = await db.query('code_analysis', {{
                where: {},
                limit: {},
                offset: {}
            }});
            
            console.log(JSON.stringify({{ success: true, data: results }}));
            "#,
            self.node_modules_path,
            where_clause,
            query.limit.unwrap_or(100),
            query.offset.unwrap_or(0)
        );
        
        let result = self.run_typescript_script(&script).await?;
        self.parse_database_result(&result)
    }
    
    /// Get code quality statistics from database
    pub async fn get_quality_stats(&self) -> Result<DatabaseResult<QualityStats>> {
        let script = format!(
            r#"
            import {{ DatabaseProvider }} from '{}/src/index.js';
            
            const db = new DatabaseProvider();
            await db.initialize();
            
            const stats = await db.query('code_analysis', {{
                select: ['AVG(quality_score) as avg_quality', 'AVG(complexity_score) as avg_complexity', 'COUNT(*) as total_files'],
                groupBy: ['language']
            }});
            
            console.log(JSON.stringify({{ success: true, data: stats }}));
            "#,
            self.node_modules_path
        );
        
        let result = self.run_typescript_script(&script).await?;
        self.parse_database_result(&result)
    }
    
    /// Update existing code analysis record
    pub async fn update_analysis(&self, id: &str, updates: HashMap<String, serde_json::Value>) -> Result<DatabaseResult<bool>> {
        let updates_json = serde_json::to_string(&updates)?;
        
        let script = format!(
            r#"
            import {{ DatabaseProvider }} from '{}/src/index.js';
            
            const db = new DatabaseProvider();
            await db.initialize();
            
            const result = await db.update('code_analysis', {}, {{
                where: {{ id: '{}' }}
            }});
            
            console.log(JSON.stringify({{ success: true, data: result.affectedRows > 0 }}));
            "#,
            self.node_modules_path,
            updates_json,
            id
        );
        
        let result = self.run_typescript_script(&script).await?;
        self.parse_database_result(&result)
    }
    
    /// Delete code analysis record
    pub async fn delete_analysis(&self, id: &str) -> Result<DatabaseResult<bool>> {
        let script = format!(
            r#"
            import {{ DatabaseProvider }} from '{}/src/index.js';
            
            const db = new DatabaseProvider();
            await db.initialize();
            
            const result = await db.delete('code_analysis', {{
                where: {{ id: '{}' }}
            }});
            
            console.log(JSON.stringify({{ success: true, data: result.affectedRows > 0 }}));
            "#,
            self.node_modules_path,
            id
        );
        
        let result = self.run_typescript_script(&script).await?;
        self.parse_database_result(&result)
    }
    
    /// Create database tables if they don't exist
    pub async fn create_tables(&self) -> Result<()> {
        let script = format!(
            r#"
            import {{ DatabaseProvider }} from '{}/src/index.js';
            
            const db = new DatabaseProvider();
            await db.initialize();
            
            // Create code_analysis table
            await db.execute(`
                CREATE TABLE IF NOT EXISTS code_analysis (
                    id TEXT PRIMARY KEY,
                    file_path TEXT NOT NULL,
                    language TEXT NOT NULL,
                    complexity_score REAL,
                    quality_score REAL,
                    ai_mistake_score REAL,
                    littering_score REAL,
                    analysis_timestamp INTEGER,
                    features TEXT,
                    suggestions TEXT
                )
            `);
            
            // Create indexes
            await db.execute('CREATE INDEX IF NOT EXISTS idx_file_path ON code_analysis(file_path)');
            await db.execute('CREATE INDEX IF NOT EXISTS idx_language ON code_analysis(language)');
            await db.execute('CREATE INDEX IF NOT EXISTS idx_quality_score ON code_analysis(quality_score)');
            await db.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON code_analysis(analysis_timestamp)');
            
            console.log('Tables created successfully');
            "#,
            self.node_modules_path
        );
        
        self.run_typescript_script(&script).await?;
        Ok(())
    }
    
    /// Run TypeScript script through Node.js
    async fn run_typescript_script(&self, script: &str) -> Result<String> {
        let temp_file = tempfile::NamedTempFile::new()?;
        let temp_path = temp_file.path().to_string_lossy().to_string();
        
        // Write script to temporary file
        std::fs::write(&temp_path, script)?;
        
        // Run script with Node.js
        let output = tokio::process::Command::new("node")
            .arg(&temp_path)
            .current_dir(&self.ts_database_path)
            .env("NODE_PATH", &self.node_modules_path)
            .output()
            .await?;
        
        // Clean up temp file
        let _ = std::fs::remove_file(&temp_path);
        
        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(FileAwareError::DatabaseError {
                message: String::from_utf8_lossy(&output.stderr).to_string(),
            })
        }
    }
    
    /// Build WHERE clause for database queries
    fn build_where_clause(&self, query: &CodeAnalysisQuery) -> String {
        let mut conditions = Vec::new();
        
        if let Some(ref pattern) = query.file_path_pattern {
            conditions.push(format!("file_path LIKE '{}'", pattern));
        }
        
        if let Some(ref languages) = query.language_filter {
            let lang_list = languages.iter()
                .map(|lang| format!("'{}'", lang))
                .collect::<Vec<_>>()
                .join(",");
            conditions.push(format!("language IN ({})", lang_list));
        }
        
        if let Some(threshold) = query.quality_threshold {
            conditions.push(format!("quality_score >= {}", threshold));
        }
        
        if let Some((min, max)) = query.complexity_range {
            conditions.push(format!("complexity_score BETWEEN {} AND {}", min, max));
        }
        
        if let Some((start, end)) = query.date_range {
            conditions.push(format!("analysis_timestamp BETWEEN {} AND {}", start, end));
        }
        
        if conditions.is_empty() {
            "1=1".to_string()
        } else {
            conditions.join(" AND ")
        }
    }
    
    /// Parse database result from TypeScript output
    fn parse_database_result<T>(&self, output: &str) -> Result<DatabaseResult<T>>
    where
        T: for<'de> Deserialize<'de>,
    {
        // Find JSON output in the script output
        if let Some(json_start) = output.find('{') {
            if let Some(json_end) = output.rfind('}') {
                let json_str = &output[json_start..=json_end];
                if let Ok(result) = serde_json::from_str::<DatabaseResult<T>>(json_str) {
                    return Ok(result);
                }
            }
        }
        
        Err(FileAwareError::DatabaseError {
            message: "Failed to parse database result".to_string(),
        })
    }
}

/// Quality statistics for code analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityStats {
    pub total_files: usize,
    pub avg_quality_score: f32,
    pub avg_complexity_score: f32,
    pub language_stats: HashMap<String, LanguageStats>,
}

/// Language-specific statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageStats {
    pub file_count: usize,
    pub avg_quality: f32,
    pub avg_complexity: f32,
    pub avg_ai_mistake_score: f32,
    pub avg_littering_score: f32,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        Self {
            database_type: DatabaseType::SQLite,
            connection_string: "file:./code_analysis.db".to_string(),
            database_path: None,
            data_directory: None,
            cache_directory: None,
            models_directory: None,
            logs_directory: None,
            pool_size: Some(10),
            timeout_ms: Some(5000),
            max_connections: Some(100),
            connection_lifetime: Some(3600),
            retry_attempts: Some(3),
            sqlite_config: Some(SQLiteConfig {
                journal_mode: "WAL".to_string(),
                synchronous: "NORMAL".to_string(),
                cache_size: 10000,
                temp_store: "DEFAULT".to_string(),
                mmap_size: 100000000,
                page_size: 4096,
                auto_vacuum: "INCREMENTAL".to_string(),
                database_file: "code_analysis.db".to_string(),
            }),
            lancedb_config: Some(LanceDBConfig {
                vector_dimension: 128,
                index_type: "IVF".to_string(),
                metric: "L2".to_string(),
                num_partitions: 10,
                max_connections: 100,
                enable_compression: true,
                compression_type: "ZSTD".to_string(),
                database_directory: "lancedb_code_analysis".to_string(),
                table_name: "code_analysis_embeddings".to_string(),
            }),
            kuzu_config: Some(KuzuConfig {
                buffer_pool_size: 100000000,
                max_threads: 8,
                enable_compression: true,
                log_buffer_size: 10000000,
                checkpoint_wait_timeout: 300,
                enable_memory_limit: true,
                memory_limit: 10000000000,
                database_directory: "kuzu_code_graph".to_string(),
                wal_mode: true,
                checkpoint_interval: 300,
            }),
            postgres_config: Some(PostgreSQLConfig {
                ssl_mode: "disable".to_string(),
                application_name: "claude-zen-code-analysis".to_string(),
                statement_timeout: 30000,
                idle_in_transaction_timeout: 30000,
                enable_prepared_statements: true,
                max_prepared_statements: 100,
                data_directory: "postgresql".to_string(),
                config_file: "postgresql.conf".to_string(),
                hba_file: "pg_hba.conf".to_string(),
            }),
            mysql_config: Some(MySQLConfig {
                ssl_mode: "disable".to_string(),
                charset: "utf8mb4".to_string(),
                collation: "utf8mb4_unicode_ci".to_string(),
                sql_mode: "STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION".to_string(),
                time_zone: "+00:00".to_string(),
                enable_prepared_statements: true,
                data_directory: "mysql".to_string(),
                config_file: "my.cnf".to_string(),
                socket_file: "mysql.sock".to_string(),
            }),
            enable_logging: true,
            enable_metrics: true,
        }
    }
}

impl Default for DatabaseManager {
    fn default() -> Self {
        Self::new(DatabaseConfig::default()).unwrap()
    }
}

// Error types for database operations
impl From<serde_json::Error> for FileAwareError {
    fn from(error: serde_json::Error) -> Self {
        FileAwareError::DatabaseError {
            message: error.to_string(),
        }
    }
}

impl From<std::io::Error> for FileAwareError {
    fn from(error: std::io::Error) -> Self {
        FileAwareError::DatabaseError {
            message: error.to_string(),
        }
    }
}
