//! libSQL backend implementation for native platforms
//! Migrated from rusqlite to libSQL for better maintenance and SQLite compatibility

use crate::{models::*, Storage, StorageError, Transaction as TransactionTrait};
use async_trait::async_trait;
use parking_lot::Mutex;
use r2d2::{Pool, PooledConnection};
use libsql::{params, Connection, Error as LibSqlError, OptionalExtension};
use std::sync::Arc;
use std::time::Duration;
use tracing::{debug, info, warn};

#[cfg(test)]
use num_cpus;

// Custom connection manager for libSQL with r2d2
#[derive(Debug)]
pub struct LibSqlConnectionManager {
    database_path: String,
}

impl LibSqlConnectionManager {
    pub fn file<P: AsRef<std::path::Path>>(path: P) -> Self {
        Self {
            database_path: path.as_ref().to_string_lossy().to_string(),
        }
    }
}

impl r2d2::ManageConnection for LibSqlConnectionManager {
    type Connection = Connection;
    type Error = LibSqlError;

    fn connect(&self) -> Result<Self::Connection, Self::Error> {
        libsql::Connection::open(&self.database_path)
    }

    fn is_valid(&self, conn: &mut Self::Connection) -> Result<(), Self::Error> {
        conn.execute("SELECT 1", []).map(|_| ())
    }

    fn has_broken(&self, _conn: &mut Self::Connection) -> bool {
        false
    }
}

type LibSqlPool = Pool<LibSqlConnectionManager>;
type LibSqlConn = PooledConnection<LibSqlConnectionManager>;

/// libSQL storage implementation
pub struct LibSqlStorage {
    pool: Arc<LibSqlPool>,
    path: String,
}

impl LibSqlStorage {
    /// Create new libSQL storage instance
    pub async fn new(path: &str) -> Result<Self, StorageError> {
        let manager = LibSqlConnectionManager::file(path);

        // Use larger pool size for tests to handle concurrent operations
        #[cfg(test)]
        let pool_size = (4 * num_cpus::get()).min(100) as u32;
        #[cfg(not(test))]
        let pool_size = 16;
        
        // Shorter timeout for tests
        #[cfg(test)]
        let connection_timeout = Duration::from_secs(5);
        #[cfg(not(test))]
        let connection_timeout = Duration::from_secs(30);

        let pool = Pool::builder()
            .max_size(pool_size)
            .min_idle(Some(2))
            .connection_timeout(connection_timeout)
            .idle_timeout(Some(Duration::from_secs(300)))
            .build(manager)
            .map_err(|e| StorageError::Pool(e.to_string()))?;

        let storage = Self {
            pool: Arc::new(pool),
            path: path.to_string(),
        };

        // Initialize schema using proper migration system
        storage.init_schema_with_migrations().await?;
        
        // Configure libSQL settings after schema initialization
        storage.configure_libsql().await?;

        info!("libSQL storage initialized at: {}", path);
        Ok(storage)
    }
    
    /// Create libSQL storage from an existing pool (for testing)
    #[cfg(test)]
    pub async fn from_pool(pool: LibSqlPool) -> Result<Self, StorageError> {
        let storage = Self {
            pool: Arc::new(pool),
            path: ":memory:".to_string(),
        };
        
        // Schema and configuration should already be done by caller
        Ok(storage)
    }

    /// Get connection from pool
    fn get_conn(&self) -> Result<LibSqlConn, StorageError> {
        self.pool
            .get()
            .map_err(|e| StorageError::Pool(e.to_string()))
    }
    
    /// Get connection from pool (for testing)
    #[cfg(test)]
    pub fn get_conn_test(&self) -> Result<LibSqlConn, StorageError> {
        self.get_conn()
    }
    
    /// Configure libSQL settings after schema initialization
    async fn configure_libsql(&self) -> Result<(), StorageError> {
        self.exec_blocking(move |conn| {
            // Configure libSQL settings for better concurrency
            conn.execute_batch(
                r#"
                PRAGMA journal_mode = WAL;
                PRAGMA synchronous = NORMAL;
                PRAGMA busy_timeout = 30000;
                PRAGMA foreign_keys = ON;
                PRAGMA wal_autocheckpoint = 1000;
                PRAGMA temp_store = MEMORY;
                PRAGMA mmap_size = 268435456;
                "#
            )?;
                
            debug!("libSQL configuration complete: WAL mode, busy_timeout=30s, optimized for concurrency");
            Ok(())
        }).await
    }
    
    /// Execute a database operation with retry logic for handling locks
    async fn with_retry<F, T>(&self, operation: F) -> Result<T, StorageError>
    where
        F: Fn(&LibSqlConn) -> Result<T, LibSqlError> + Send,
        T: Send,
    {
        const MAX_RETRIES: u32 = 10;
        const BASE_DELAY_MS: u64 = 5;
        
        let mut retries = 0;
        loop {
            let result = {
                let conn = self.get_conn()?;
                operation(&conn)
            };
            
            match result {
                Ok(result) => return Ok(result),
                Err(e) => {
                    let err_str = e.to_string();
                    if (err_str.contains("database is locked") 
                        || err_str.contains("database table is locked")
                        || err_str.contains("SQLITE_BUSY")) 
                        && retries < MAX_RETRIES {
                        retries += 1;
                        let base_delay = BASE_DELAY_MS * (1 << retries.min(5));
                        let jitter = fastrand::u64(0..base_delay / 2);
                        let delay = base_delay + jitter;
                        debug!("Database locked, retry {} of {} with {}ms delay", retries, MAX_RETRIES, delay);
                        tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
                        continue;
                    }
                    return Err(StorageError::Database(err_str));
                }
            }
        }
    }
    
    /// Execute a blocking database operation using spawn_blocking
    async fn exec_blocking<F, R>(&self, operation: F) -> Result<R, StorageError>
    where
        F: FnOnce(&LibSqlConn) -> Result<R, LibSqlError> + Send + 'static,
        R: Send + 'static,
    {
        let pool = self.pool.clone();
        tokio::task::spawn_blocking(move || {
            let conn = pool.get().map_err(|e| StorageError::Pool(e.to_string()))?;
            operation(&conn).map_err(|e| StorageError::Database(e.to_string()))
        })
        .await
        .map_err(|e| StorageError::Other(format!("Join error: {}", e)))?
    }
    
    /// Execute a blocking database operation with retry logic
    async fn exec_blocking_with_retry<F, R>(&self, operation: F) -> Result<R, StorageError>
    where
        F: Fn(&LibSqlConn) -> Result<R, LibSqlError> + Send + Clone + 'static,
        R: Send + 'static,
    {
        const MAX_RETRIES: u32 = 10;
        const BASE_DELAY_MS: u64 = 5;
        
        let mut retries = 0;
        loop {
            let result = {
                let pool = self.pool.clone();
                let op = operation.clone();
                tokio::task::spawn_blocking(move || {
                    let conn = pool.get().map_err(|e| StorageError::Pool(e.to_string()))?;
                    op(&conn).map_err(|e| StorageError::Database(e.to_string()))
                })
                .await
                .map_err(|e| StorageError::Other(format!("Join error: {}", e)))?
            };
            
            match result {
                Ok(result) => return Ok(result),
                Err(StorageError::Database(err_str)) => {
                    if (err_str.contains("database is locked") 
                        || err_str.contains("database table is locked")
                        || err_str.contains("SQLITE_BUSY")) 
                        && retries < MAX_RETRIES {
                        retries += 1;
                        let base_delay = BASE_DELAY_MS * (1 << retries.min(5));
                        let jitter = fastrand::u64(0..base_delay / 2);
                        let delay = base_delay + jitter;
                        debug!("Database locked, retry {} of {} with {}ms delay", retries, MAX_RETRIES, delay);
                        tokio::time::sleep(tokio::time::Duration::from_millis(delay)).await;
                        continue;
                    }
                    return Err(StorageError::Database(err_str));
                }
                Err(e) => return Err(e),
            }
        }
    }

    /// Initialize database schema using proper migration system
    async fn init_schema_with_migrations(&self) -> Result<(), StorageError> {
        self.exec_blocking(move |conn| {
            let manager = crate::migrations::MigrationManager::new();
            manager.migrate(conn).map_err(|e| {
                match e {
                    StorageError::Database(msg) => LibSqlError::SqliteFailure(
                        libsql::ffi::Error::new(libsql::ffi::SQLITE_ERROR), 
                        Some(msg)
                    ),
                    _ => LibSqlError::SqliteFailure(
                        libsql::ffi::Error::new(libsql::ffi::SQLITE_ERROR), 
                        Some(e.to_string())
                    ),
                }
            })?;
            debug!("Schema initialized via migrations");
            Ok(())
        }).await
    }
}

// For now, create a type alias to maintain compatibility
pub type SqliteStorage = LibSqlStorage;

#[async_trait]
impl Storage for LibSqlStorage {
    type Error = StorageError;

    // Agent operations (implementing a few key methods - full implementation would continue)
    async fn store_agent(&self, agent: &AgentModel) -> Result<(), Self::Error> {
        let json = serde_json::to_string(agent)?;
        let capabilities_json = serde_json::to_string(&agent.capabilities)?;
        let metadata_json = serde_json::to_string(&agent.metadata)?;
        
        let agent_id = agent.id.clone();
        let agent_name = agent.name.clone();
        let agent_type = agent.agent_type.clone();
        let status = agent.status.to_string();
        let heartbeat = agent.heartbeat.timestamp();
        let created_at = agent.created_at.timestamp();
        let updated_at = agent.updated_at.timestamp();

        self.exec_blocking_with_retry(move |conn| {
            conn.execute(
                "INSERT INTO agents (id, name, agent_type, status, capabilities, metadata, heartbeat, created_at, updated_at, data) 
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                params![
                    &agent_id,
                    &agent_name,
                    &agent_type,
                    &status,
                    &capabilities_json,
                    &metadata_json,
                    heartbeat,
                    created_at,
                    updated_at,
                    &json
                ],
            )
        }).await?;

        debug!("Stored agent: {}", agent.id);
        Ok(())
    }

    // Add stub implementations for all other required methods
    async fn get_agent(&self, _id: &str) -> Result<Option<AgentModel>, Self::Error> {
        todo!("Implement get_agent")
    }
    
    async fn update_agent(&self, _agent: &AgentModel) -> Result<(), Self::Error> {
        todo!("Implement update_agent")  
    }
    
    async fn delete_agent(&self, _id: &str) -> Result<(), Self::Error> {
        todo!("Implement delete_agent")
    }
    
    async fn list_agents(&self) -> Result<Vec<AgentModel>, Self::Error> {
        todo!("Implement list_agents")
    }
    
    async fn list_agents_by_status(&self, _status: &str) -> Result<Vec<AgentModel>, Self::Error> {
        todo!("Implement list_agents_by_status") 
    }

    // Task operations - stubs
    async fn store_task(&self, _task: &TaskModel) -> Result<(), Self::Error> {
        todo!("Implement store_task")
    }
    
    async fn get_task(&self, _id: &str) -> Result<Option<TaskModel>, Self::Error> {
        todo!("Implement get_task")
    }
    
    async fn update_task(&self, _task: &TaskModel) -> Result<(), Self::Error> {
        todo!("Implement update_task")
    }
    
    async fn get_pending_tasks(&self) -> Result<Vec<TaskModel>, Self::Error> {
        todo!("Implement get_pending_tasks") 
    }
    
    async fn get_tasks_by_agent(&self, _agent_id: &str) -> Result<Vec<TaskModel>, Self::Error> {
        todo!("Implement get_tasks_by_agent")
    }
    
    async fn claim_task(&self, _task_id: &str, _agent_id: &str) -> Result<bool, Self::Error> {
        todo!("Implement claim_task")
    }

    // Event operations - stubs
    async fn store_event(&self, _event: &EventModel) -> Result<(), Self::Error> {
        todo!("Implement store_event")
    }
    
    async fn get_events_by_agent(&self, _agent_id: &str, _limit: usize) -> Result<Vec<EventModel>, Self::Error> {
        todo!("Implement get_events_by_agent")
    }
    
    async fn get_events_by_type(&self, _event_type: &str, _limit: usize) -> Result<Vec<EventModel>, Self::Error> {
        todo!("Implement get_events_by_type")
    }
    
    async fn get_events_since(&self, _timestamp: i64) -> Result<Vec<EventModel>, Self::Error> {
        todo!("Implement get_events_since")
    }

    // Message operations - stubs
    async fn store_message(&self, _message: &MessageModel) -> Result<(), Self::Error> {
        todo!("Implement store_message") 
    }
    
    async fn get_messages_between(&self, _agent1: &str, _agent2: &str, _limit: usize) -> Result<Vec<MessageModel>, Self::Error> {
        todo!("Implement get_messages_between")
    }
    
    async fn get_unread_messages(&self, _agent_id: &str) -> Result<Vec<MessageModel>, Self::Error> {
        todo!("Implement get_unread_messages")
    }
    
    async fn mark_message_read(&self, _message_id: &str) -> Result<(), Self::Error> {
        todo!("Implement mark_message_read")
    }

    // Metric operations - stubs  
    async fn store_metric(&self, _metric: &MetricModel) -> Result<(), Self::Error> {
        todo!("Implement store_metric")
    }
    
    async fn get_metrics_by_agent(&self, _agent_id: &str, _metric_type: &str) -> Result<Vec<MetricModel>, Self::Error> {
        todo!("Implement get_metrics_by_agent")
    }
    
    async fn get_aggregated_metrics(&self, _metric_type: &str, _start_time: i64, _end_time: i64) -> Result<Vec<MetricModel>, Self::Error> {
        todo!("Implement get_aggregated_metrics")
    }

    // Transaction support - stubs
    async fn begin_transaction(&self) -> Result<Box<dyn TransactionTrait>, Self::Error> {
        todo!("Implement begin_transaction")
    }

    // Maintenance operations - stubs
    async fn vacuum(&self) -> Result<(), Self::Error> {
        todo!("Implement vacuum")
    }
    
    async fn checkpoint(&self) -> Result<(), Self::Error> {
        todo!("Implement checkpoint")
    }
    
    async fn get_storage_size(&self) -> Result<u64, Self::Error> {
        todo!("Implement get_storage_size")
    }
}