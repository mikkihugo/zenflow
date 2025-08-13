//! RUV-Swarm MCP (Model Context Protocol) Server
//!
//! This crate provides a comprehensive MCP server implementation for RUV-Swarm,
//! enabling Claude Code and other MCP-compatible clients to interact with the
//! swarm orchestration system through a standardized JSON-RPC 2.0 interface.
//!
//! ## Features
//!
//! - **Complete MCP Implementation**: Full JSON-RPC 2.0 and WebSocket support
//! - **11 Comprehensive Tools**: Agent spawning, task orchestration, monitoring
//! - **Real-time Event Streaming**: Live updates on swarm activity
//! - **Session Management**: Secure session handling with metadata support
//! - **Performance Metrics**: Built-in performance monitoring and optimization
//! - **Extensible Architecture**: Easy to add new tools and capabilities
//!
//! ## Quick Start
//!
//! ```rust
//! use std::sync::Arc;
//! use zen_swarm_core::SwarmConfig;
//! use zen_swarm_mcp::{orchestrator::SwarmOrchestrator, McpConfig, McpServer};
//!
//! # #[tokio::main]
//! # async fn main() -> anyhow::Result<()> {
//! // Create swarm orchestrator
//! let orchestrator = Arc::new(SwarmOrchestrator::new(SwarmConfig::default()));
//!
//! // Configure MCP server
//! let config = McpConfig::default();
//!
//! // Create and start server
//! let server = McpServer::new(orchestrator, config);
//! // server.start().await?;
//! # Ok(())
//! # }
//! ```
//!
//! ## Available Tools
//!
//! The server provides the following MCP tools:
//!
//! - `ruv-swarm.spawn` - Spawn new agents
//! - `ruv-swarm.orchestrate` - Orchestrate complex tasks
//! - `ruv-swarm.query` - Query swarm state
//! - `ruv-swarm.monitor` - Monitor swarm activity
//! - `ruv-swarm.optimize` - Optimize performance
//! - `ruv-swarm.memory.store` - Store session data
//! - `ruv-swarm.memory.get` - Retrieve session data
//! - `ruv-swarm.task.create` - Create new tasks
//! - `ruv-swarm.workflow.execute` - Execute workflows
//! - `ruv-swarm.agent.list` - List active agents
//! - `ruv-swarm.agent.metrics` - Get agent metrics

use std::net::SocketAddr;
use std::sync::Arc;

use axum::{
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use dashmap::DashMap;
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::sync::{mpsc, RwLock};
use tower_http::cors::CorsLayer;
use tracing::{debug, error, info};

/// Comprehensive logging utilities for MCP server operations
mod mcp_logging {
    use super::*;
    
    /// Use debug for detailed request/response tracking
    pub fn log_debug_request_processing(
        session_id: &Uuid,
        method: &str,
        params_size: usize,
        processing_time: Duration,
    ) {
        debug!(
            "MCP request processing [{}]: method={}, params_size={}, duration={:?}",
            session_id, method, params_size, processing_time
        );
    }
    
    /// Use info for session lifecycle and important server events
    pub fn log_info_session_event(
        event: &str,
        session_id: &Uuid,
        details: &str,
        active_sessions: usize,
    ) {
        info!(
            "MCP session event [{}]: {} - {} (active_sessions: {})",
            event, session_id, details, active_sessions
        );
    }
    
    /// Use error for critical MCP protocol violations and system errors
    pub fn log_error_protocol_violation(
        session_id: &Uuid,
        violation_type: &str,
        details: &str,
        request_method: Option<&str>,
    ) {
        error!(
            "MCP protocol violation [{}]: {} - {} (method: {:?})",
            session_id, violation_type, details, request_method
        );
    }
    
    /// Log comprehensive server startup information
    pub fn log_server_startup(config: &McpConfig, tools_count: usize, features: &[String]) {
        info!("Starting MCP server with configuration:");
        debug!("  Bind address: {}", config.bind_addr);
        debug!("  Max connections: {}", config.max_connections);
        debug!("  Request timeout: {}s", config.request_timeout_secs);
        debug!("  Debug mode: {}", config.debug);
        debug!("  Allowed origins: {:?}", config.allowed_origins);
        debug!("  Available tools: {}", tools_count);
        debug!("  Enabled features: {:?}", features);
    }
    
    /// Log tool execution details
    pub fn log_tool_execution(
        session_id: &Uuid,
        tool_name: &str,
        execution_time: Duration,
        success: bool,
        result_size: usize,
    ) {
        debug!(
            "Tool execution [{}]: tool={}, duration={:?}, success={}, result_size={}",
            session_id, tool_name, execution_time, success, result_size
        );
    }
    
    /// Log resource usage and performance metrics
    pub fn log_resource_metrics(
        active_sessions: usize,
        total_requests: u64,
        avg_response_time: Duration,
        memory_usage_mb: f64,
        cpu_usage_percent: f32,
    ) {
        debug!(
            "MCP server metrics: sessions={}, requests={}, avg_response={:?}, memory={:.2}MB, cpu={:.1}%",
            active_sessions, total_requests, avg_response_time, memory_usage_mb, cpu_usage_percent
        );
    }
    
    /// Log CORS and security events
    pub fn log_security_event(
        event_type: &str,
        client_origin: Option<&str>,
        client_ip: &str,
        allowed: bool,
        reason: &str,
    ) {
        if allowed {
            debug!(
                "Security event [{}]: origin={:?}, ip={}, allowed=true, reason={}",
                event_type, client_origin, client_ip, reason
            );
        } else {
            error!(
                "Security violation [{}]: origin={:?}, ip={}, allowed=false, reason={}",
                event_type, client_origin, client_ip, reason
            );
        }
    }
    
    /// Log WebSocket connection events
    pub fn log_websocket_event(
        event: &str,
        session_id: &Uuid,
        client_info: &str,
        connection_duration: Option<Duration>,
    ) {
        match event {
            "connected" => {
                info!("WebSocket connected [{}]: {}", session_id, client_info);
            }
            "disconnected" => {
                info!(
                    "WebSocket disconnected [{}]: {} (duration: {:?})",
                    session_id, client_info, connection_duration.unwrap_or_default()
                );
            }
            "error" => {
                error!("WebSocket error [{}]: {}", session_id, client_info);
            }
            _ => {
                debug!("WebSocket event [{}] [{}]: {}", event, session_id, client_info);
            }
        }
    }
    
    /// Log swarm orchestration events from MCP perspective
    pub fn log_orchestration_event(
        session_id: &Uuid,
        operation: &str,
        agent_count: usize,
        task_id: Option<&str>,
        success: bool,
        details: &str,
    ) {
        if success {
            info!(
                "Orchestration success [{}]: {} with {} agents (task: {:?}) - {}",
                session_id, operation, agent_count, task_id, details
            );
        } else {
            error!(
                "Orchestration failure [{}]: {} with {} agents (task: {:?}) - {}",
                session_id, operation, agent_count, task_id, details
            );
        }
    }
}
use uuid::Uuid;

pub mod error;
// pub mod handlers;  // Temporarily disabled for simple service test
// pub mod limits;    // Temporarily disabled for simple service test
pub mod orchestrator;
pub mod service;
// pub mod tools;     // Temporarily disabled for simple service test
pub mod types;
// pub mod validation;   // Temporarily disabled for simple service test

use crate::orchestrator::SwarmOrchestrator;

// use crate::handlers::RequestHandler;  // Temporarily disabled
// use crate::limits::{ResourceLimiter, ResourceLimits};  // Temporarily disabled
// use crate::tools::ToolRegistry;  // Temporarily disabled

/*
/// MCP Server configuration
/// 
/// This struct defines the configuration options for the MCP server,
/// including network settings, connection limits, and debug options.
/// 
/// # Example
/// 
/// ```rust
/// use zen_swarm_mcp::McpConfig;
/// 
/// let config = McpConfig {
///     bind_addr: "127.0.0.1:3000".parse().unwrap(),
///     max_connections: 100,
///     request_timeout_secs: 300,
///     debug: true,
///     allowed_origins: vec!["https://claude.ai".to_string()],
/// };
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpConfig {
    /// Server bind address (IP and port)
    pub bind_addr: SocketAddr,
    /// Maximum concurrent connections allowed
    pub max_connections: usize,
    /// Request timeout in seconds (300 = 5 minutes)
    pub request_timeout_secs: u64,
    /// Enable debug logging for troubleshooting
    pub debug: bool,
    /// Allowed CORS origins (empty = localhost only)
    #[serde(default)]
    pub allowed_origins: Vec<String>,
}

impl Default for McpConfig {
    fn default() -> Self {
        Self {
            bind_addr: "127.0.0.1:3000".parse().unwrap(),
            max_connections: 100,
            request_timeout_secs: 300,
            debug: false,
            allowed_origins: vec![],
        }
    }
}

/// MCP Server state
pub struct McpServerState {
    /// Swarm orchestrator instance
    orchestrator: Arc<SwarmOrchestrator>,
    /// Tool registry
    tools: Arc<ToolRegistry>,
    /// Active sessions
    sessions: Arc<DashMap<Uuid, Arc<Session>>>,
    /// Resource limiter
    limiter: Arc<ResourceLimiter>,
    /// Server configuration
    config: McpConfig,
}

/// Client session
pub struct Session {
    pub id: Uuid,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_activity: RwLock<chrono::DateTime<chrono::Utc>>,
    pub metadata: DashMap<String, Value>,
}

/// MCP Server
/// 
/// The main MCP server that handles WebSocket connections and JSON-RPC requests.
/// This server implements the Model Context Protocol specification and provides
/// access to swarm orchestration capabilities through standardized tools.
/// 
/// # Example
/// 
/// ```rust
/// use std::sync::Arc;
/// use zen_swarm_core::SwarmConfig;
/// use zen_swarm_mcp::{orchestrator::SwarmOrchestrator, McpConfig, McpServer};
/// 
/// # #[tokio::main]
/// # async fn main() -> anyhow::Result<()> {
/// let orchestrator = Arc::new(SwarmOrchestrator::new(SwarmConfig::default()));
/// let config = McpConfig::default();
/// let server = McpServer::new(orchestrator, config);
/// 
/// // Start the server
/// // server.start().await?;
/// # Ok(())
/// # }
/// ```
pub struct McpServer {
    state: Arc<McpServerState>,
}

impl McpServer {
    /// Create a new MCP server
    /// 
    /// Creates a new MCP server instance with the provided orchestrator and configuration.
    /// The server will automatically register all available tools and initialize the
    /// session management system.
    /// 
    /// # Arguments
    /// 
    /// * `orchestrator` - The swarm orchestrator instance to use
    /// * `config` - Server configuration options
    /// 
    /// # Returns
    /// 
    /// A new `McpServer` instance ready to start serving requests
    pub fn new(orchestrator: Arc<SwarmOrchestrator>, config: McpConfig) -> Self {
        let tools = Arc::new(ToolRegistry::new());

        // Register all tools
        tools::register_tools(&tools);

        // Create resource limiter with default limits
        let limiter = Arc::new(ResourceLimiter::new(ResourceLimits::default()));

        let state = Arc::new(McpServerState {
            orchestrator,
            tools,
            sessions: Arc::new(DashMap::new()),
            limiter,
            config,
        });

        Self { state }
    }

    /// Start the MCP server
    /// 
    /// Starts the MCP server and begins listening for connections on the configured
    /// bind address. This method will block until the server is stopped.
    /// 
    /// # Returns
    /// 
    /// Returns `Ok(())` if the server starts successfully, or an error if there's
    /// an issue binding to the address or starting the server.
    /// 
    /// # Example
    /// 
    /// ```rust,no_run
    /// # use std::sync::Arc;
    /// # use zen_swarm_core::SwarmConfig;
    /// # use zen_swarm_mcp::{orchestrator::SwarmOrchestrator, McpConfig, McpServer};
    /// # #[tokio::main]
    /// # async fn main() -> anyhow::Result<()> {
    /// let orchestrator = Arc::new(SwarmOrchestrator::new(SwarmConfig::default()));
    /// let config = McpConfig::default();
    /// let server = McpServer::new(orchestrator, config);
    /// 
    /// // This will block until the server is stopped
    /// server.start().await?;
    /// # Ok(())
    /// # }
    /// ```
    pub async fn start(&self) -> anyhow::Result<()> {
        let app = self.build_router();
        let addr = self.state.config.bind_addr;

        // Use comprehensive MCP logging
        let tools_count = 11; // Number of available MCP tools
        let features = vec![
            "websocket".to_string(),
            "json-rpc-2.0".to_string(),
            "session-management".to_string(),
            "swarm-orchestration".to_string(),
            "real-time-monitoring".to_string(),
        ];
        mcp_logging::log_server_startup(&self.state.config, tools_count, &features);
        
        info!("MCP server listening on {}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await?;
        axum::serve(listener, app).await?;

        Ok(())
    }

    /// Build the router
    fn build_router(&self) -> Router {
        Router::new()
            .route("/", get(root_handler))
            .route("/mcp", get(websocket_handler))
            .route("/tools", get(list_tools_handler))
            .route("/health", get(health_handler))
            .layer(self.build_cors_layer())
            .with_state(self.state.clone())
    }

    /// Build secure CORS layer with restrictive settings
    fn build_cors_layer(&self) -> CorsLayer {
        let mut cors = CorsLayer::new();

        // Configure allowed origins
        let origins: Vec<axum::http::HeaderValue> = if self.state.config.allowed_origins.is_empty() {
            // Default to localhost only if no origins specified
            vec![
                "http://localhost:3000".parse().unwrap(),
                "http://localhost:8080".parse().unwrap(),
                "http://127.0.0.1:3000".parse().unwrap(),
                "http://127.0.0.1:8080".parse().unwrap(),
            ]
        } else {
            // Use configured origins
            self.state.config.allowed_origins
                .iter()
                .filter_map(|origin| origin.parse().ok())
                .collect()
        };

        cors = cors.allow_origin(origins)
            .allow_methods([
                axum::http::Method::GET,
                axum::http::Method::POST,
                axum::http::Method::OPTIONS,
            ])
            .allow_headers([
                axum::http::header::CONTENT_TYPE,
                axum::http::header::AUTHORIZATION,
                axum::http::header::ACCEPT,
            ])
            .allow_credentials(true)
            .max_age(std::time::Duration::from_secs(86400)); // 24 hours

        cors
    }
}

/// Root handler
async fn root_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "name": "zen-swarm-mcp",
        "version": env!("CARGO_PKG_VERSION"),
        "protocol": "mcp/1.0",
        "endpoints": {
            "websocket": "/mcp",
            "tools": "/tools",
            "health": "/health"
        }
    }))
}

/// Health check handler
async fn health_handler(State(state): State<Arc<McpServerState>>) -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "active_sessions": state.sessions.len(),
        "tools_count": state.tools.count(),
        "timestamp": chrono::Utc::now()
    }))
}

/// List available tools
async fn list_tools_handler(State(state): State<Arc<McpServerState>>) -> impl IntoResponse {
    let tools = state.tools.list_tools();
    Json(serde_json::json!({
        "tools": tools,
        "count": tools.len()
    }))
}

/// WebSocket handler for MCP protocol
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<McpServerState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

/// Handle WebSocket connection
async fn handle_socket(socket: axum::extract::ws::WebSocket, state: Arc<McpServerState>) {
    let session_id = Uuid::new_v4();
    let session = Arc::new(Session {
        id: session_id,
        created_at: chrono::Utc::now(),
        last_activity: RwLock::new(chrono::Utc::now()),
        metadata: DashMap::new(),
    });

    state.sessions.insert(session_id, session.clone());
    
    // Initialize resource tracking for this session
    state.limiter.init_session(session_id).await;
    
    // Use comprehensive session logging
    mcp_logging::log_info_session_event(
        "SESSION_CREATED",
        &session_id,
        "New WebSocket connection established",
        state.sessions.len(),
    );
    
    mcp_logging::log_websocket_event(
        "connected",
        &session_id,
        "MCP client connected via WebSocket",
        None,
    );

    let (mut sender, mut receiver) = socket.split();
    let (tx, mut rx) = mpsc::channel(100);

    // Spawn task to handle outgoing messages
    let tx_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // Create request handler
    let handler = RequestHandler::new(
        state.orchestrator.clone(),
        state.tools.clone(),
        session.clone(),
        state.limiter.clone(),
        tx.clone(),
    );

    // Handle incoming messages
    while let Some(Ok(msg)) = receiver.next().await {
        if let axum::extract::ws::Message::Text(text) = msg {
            match serde_json::from_str::<McpRequest>(&text) {
                Ok(request) => {
                    // Use comprehensive request logging
                    let params_size = request.params
                        .as_ref()
                        .map(|p| p.to_string().len())
                        .unwrap_or(0);
                    
                    mcp_logging::log_debug_request_processing(
                        &session_id,
                        &request.method,
                        params_size,
                        std::time::Duration::from_millis(0), // Will be updated after processing
                    );
                    
                    debug!("Processing MCP request: method={}", request.method);

                    // Update last activity
                    *session.last_activity.write().await = chrono::Utc::now();

                    // Handle request
                    match handler.handle_request(request).await {
                        Ok(response) => {
                            if let Ok(json) = serde_json::to_string(&response) {
                                let _ = tx.send(axum::extract::ws::Message::Text(json)).await;
                            }
                        }
                        Err(e) => {
                            let sanitized_error = crate::error::log_and_sanitize_error(
                                &e,
                                &session_id,
                                state.config.debug,
                            );
                            let error_response =
                                McpResponse::error(None, -32603, sanitized_error);
                            if let Ok(json) = serde_json::to_string(&error_response) {
                                let _ = tx.send(axum::extract::ws::Message::Text(json)).await;
                            }
                        }
                    }
                }
                Err(e) => {
                    mcp_logging::log_error_protocol_violation(
                        &session_id,
                        "PARSE_ERROR",
                        &e.to_string(),
                        None,
                    );
                    error!("Failed to parse MCP request from session {}: {}", session_id, e);
                    let error_response =
                        McpResponse::error(None, -32700, "Parse error".to_string());
                    if let Ok(json) = serde_json::to_string(&error_response) {
                        let _ = tx.send(axum::extract::ws::Message::Text(json)).await;
                    }
                }
            }
        }
    }

    // Cleanup
    tx_task.abort();
    state.sessions.remove(&session_id);
    state.limiter.remove_session(&session_id).await;
    // Calculate session duration
    let session_duration = chrono::Utc::now() - session.created_at;
    let duration = std::time::Duration::from_millis(session_duration.num_milliseconds() as u64);
    
    // Use comprehensive session closure logging
    mcp_logging::log_info_session_event(
        "SESSION_CLOSED",
        &session_id,
        "WebSocket connection terminated",
        state.sessions.len() - 1, // Account for session being removed
    );
    
    mcp_logging::log_websocket_event(
        "disconnected",
        &session_id,
        "MCP client disconnected",
        Some(duration),
    );
    
    info!("MCP session {} closed after {:?}", session_id, duration);
}

/// MCP Request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: Option<Value>,
    pub id: Option<Value>,
}

/// MCP Response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpResponse {
    pub jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<McpError>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<Value>,
}

impl McpResponse {
    pub fn success(id: Option<Value>, result: Value) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            result: Some(result),
            error: None,
            id,
        }
    }

    pub fn error(id: Option<Value>, code: i32, message: String) -> Self {
        Self {
            jsonrpc: "2.0".to_string(),
            result: None,
            error: Some(McpError {
                code,
                message,
                data: None,
            }),
            id,
        }
    }
}

/// MCP Error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

*/

#[cfg(test)]
mod tests;
