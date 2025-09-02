//! LLM provider abstractions and implementations
//! 
//! This module provides event-driven LLM integration that communicates
//! with the platform's LLM providers via the EventBus system.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use crate::events::{Event, EventBus, EventHandler};

// Keep only the core types and remove direct provider implementations
pub mod model;

// Remove direct provider modules - they should come from llm-provider packages
// pub mod anthropic;
// pub mod openai;
// #[cfg(feature = "copilot")]
// pub mod github_copilot;
// pub mod registry;

#[cfg(test)]
mod anthropic_test;

// Re-export only the core types, not the providers
pub use model::{
    Message, MessageRole, MessageContent, MessagePart, ImageData,
    ToolCall, ToolDefinition, GenerateOptions, StreamOptions,
    GenerateResult, StreamChunk, Usage, FinishReason
};

/// Event-driven language model interface
/// This replaces the direct provider trait with event-based communication
#[async_trait]
pub trait EventDrivenLanguageModel: Send + Sync {
    /// Generate text via event bus
    async fn generate_via_events(
        &self,
        event_bus: &EventBus,
        messages: Vec<Message>,
        options: GenerateOptions,
    ) -> crate::Result<GenerateResult>;
    
    /// Stream text generation via event bus
    async fn stream_via_events(
        &self,
        event_bus: &EventBus,
        messages: Vec<Message>,
        options: StreamOptions,
    ) -> crate::Result<Box<dyn futures::Stream<Item = crate::Result<StreamChunk>> + Send + Unpin>>;
    
    /// Check if the model supports tool calling
    fn supports_tools(&self) -> bool;
    
    /// Check if the model supports vision/images
    fn supports_vision(&self) -> bool;
    
    /// Check if the model supports caching
    fn supports_caching(&self) -> bool;
}

/// Legacy trait for backward compatibility - now delegates to events
#[async_trait]
pub trait LanguageModel: Send + Sync {
    /// Generate text from a list of messages
    async fn generate(
        &self,
        messages: Vec<Message>,
        options: GenerateOptions,
    ) -> crate::Result<GenerateResult>;
    
    /// Stream text generation
    async fn stream(
        &self,
        messages: Vec<Message>,
        options: StreamOptions,
    ) -> crate::Result<Box<dyn futures::Stream<Item = crate::Result<StreamChunk>> + Send + Unpin>>;
    
    /// Check if the model supports tool calling
    fn supports_tools(&self) -> bool;
    
    /// Check if the model supports vision/images
    fn supports_vision(&self) -> bool;
    
    /// Check if the model supports caching
    fn supports_caching(&self) -> bool;
}

/// Stream state for tracking active streaming operations
#[derive(Debug, Clone)]
pub struct StreamState {
    pub request_id: String,
    pub model: String,
    pub chunks: Vec<StreamChunk>,
    pub is_complete: bool,
    pub error: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_chunk_at: chrono::DateTime<chrono::Utc>,
}

impl StreamState {
    pub fn new(request_id: String, model: String) -> Self {
        let now = chrono::Utc::now();
        Self {
            request_id,
            model,
            chunks: Vec::new(),
            is_complete: false,
            error: None,
            created_at: now,
            last_chunk_at: now,
        }
    }
    
    pub fn add_chunk(&mut self, chunk: StreamChunk) {
        self.chunks.push(chunk);
        self.last_chunk_at = chrono::Utc::now();
    }
    
    pub fn complete(&mut self) {
        self.is_complete = true;
        self.last_chunk_at = chrono::Utc::now();
    }
    
    pub fn set_error(&mut self, error: String) {
        self.error = Some(error);
        self.is_complete = true;
        self.last_chunk_at = chrono::Utc::now();
    }
    
    pub fn get_full_content(&self) -> String {
        self.chunks.iter()
            .map(|chunk| chunk.delta.clone())
            .collect::<Vec<_>>()
            .join("")
    }
}

/// Stream manager for handling multiple concurrent streams
#[derive(Clone)]
pub struct StreamManager {
    streams: Arc<RwLock<HashMap<String, StreamState>>>,
}

impl StreamManager {
    pub fn new() -> Self {
        Self {
            streams: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Start a new stream
    pub async fn start_stream(&self, request_id: String, model: String) -> Result<(), crate::Error> {
        let mut streams = self.streams.write().await;
        let stream_state = StreamState::new(request_id.clone(), model);
        streams.insert(request_id, stream_state);
        Ok(())
    }
    
    /// Add a chunk to an active stream
    pub async fn add_chunk(&self, request_id: &str, chunk: StreamChunk) -> Result<(), crate::Error> {
        let mut streams = self.streams.write().await;
        if let Some(stream) = streams.get_mut(request_id) {
            stream.add_chunk(chunk);
            Ok(())
        } else {
            Err(crate::Error::Other(anyhow::anyhow!("Stream not found: {}", request_id)))
        }
    }
    
    /// Complete a stream
    pub async fn complete_stream(&self, request_id: &str) -> Result<(), crate::Error> {
        let mut streams = self.streams.write().await;
        if let Some(stream) = streams.get_mut(request_id) {
            stream.complete();
            Ok(())
        } else {
            Err(crate::Error::Other(anyhow::anyhow!("Stream not found: {}", request_id)))
        }
    }
    
    /// Set error on a stream
    pub async fn set_stream_error(&self, request_id: &str, error: String) -> Result<(), crate::Error> {
        let mut streams = self.streams.write().await;
        if let Some(stream) = streams.get_mut(request_id) {
            stream.set_error(error);
            Ok(())
        } else {
            Err(crate::Error::Other(anyhow::anyhow!("Stream not found: {}", request_id)))
        }
    }
    
    /// Get stream state
    pub async fn get_stream(&self, request_id: &str) -> Option<StreamState> {
        let streams = self.streams.read().await;
        streams.get(request_id).cloned()
    }
    
    /// Clean up completed streams older than specified duration
    pub async fn cleanup_old_streams(&self, max_age: chrono::Duration) -> Result<usize, crate::Error> {
        let mut streams = self.streams.write().await;
        let now = chrono::Utc::now();
        let initial_count = streams.len();
        
        streams.retain(|_, stream| {
            if stream.is_complete {
                let age = now - stream.last_chunk_at;
                age < max_age
            } else {
                true // Keep active streams
            }
        });
        
        let removed_count = initial_count - streams.len();
        Ok(removed_count)
    }
}

/// Event-driven LLM client that communicates via EventBus
pub struct EventDrivenLLMClient {
    model_name: String,
    event_bus: EventBus,
    stream_manager: StreamManager,
}

impl EventDrivenLLMClient {
    pub fn new(model_name: String, event_bus: EventBus) -> Self {
        Self {
            model_name,
            event_bus,
            stream_manager: StreamManager::new(),
        }
    }
    
    /// Generate text by publishing an event and waiting for response
    pub async fn generate(
        &self,
        messages: Vec<Message>,
        options: GenerateOptions,
    ) -> crate::Result<GenerateResult> {
        // Create request event
        let request = LLMGenerateRequest {
            model: self.model_name.clone(),
            messages,
            options,
            request_id: Uuid::new_v4().to_string(),
        };
        
        // Publish request event
        self.event_bus.publish(request).await?;
        
        // TODO: Wait for response event
        // This will be implemented when we integrate with the TypeScript EventBus
        todo!("Event-driven LLM generation not yet implemented")
    }
    
    /// Stream text generation with real-time chunk processing
    pub async fn stream(
        &self,
        messages: Vec<Message>,
        options: StreamOptions,
    ) -> crate::Result<StreamHandle> {
        let request_id = Uuid::new_v4().to_string();
        
        // Start stream tracking
        self.stream_manager.start_stream(request_id.clone(), self.model_name.clone()).await?;
        
        // Create streaming request event
        let stream_request = LLMStreamRequest {
            model: self.model_name.clone(),
            messages,
            options,
            request_id: request_id.clone(),
        };
        
        // Publish streaming request
        self.event_bus.publish(stream_request).await?;
        
        // Return stream handle for monitoring
        Ok(StreamHandle {
            request_id,
            stream_manager: self.stream_manager.clone(),
        })
    }
}

/// Handle for monitoring and controlling an active stream
pub struct StreamHandle {
    request_id: String,
    stream_manager: StreamManager,
}

impl StreamHandle {
    /// Get the current stream state
    pub async fn get_state(&self) -> Option<StreamState> {
        self.stream_manager.get_stream(&self.request_id).await
    }
    
    /// Wait for stream completion
    pub async fn wait_for_completion(&self, timeout: std::time::Duration) -> Result<StreamState, crate::Error> {
        let start = std::time::Instant::now();
        
        while start.elapsed() < timeout {
            if let Some(stream) = self.stream_manager.get_stream(&self.request_id).await {
                if stream.is_complete {
                    return Ok(stream);
                }
            }
            
            // Wait a bit before checking again
            tokio::time::sleep(std::time::Duration::from_millis(50)).await;
        }
        
        Err(crate::Error::Other(anyhow::anyhow!("Stream timeout after {:?}", timeout)))
    }
    
    /// Get all chunks received so far
    pub async fn get_chunks(&self) -> Result<Vec<StreamChunk>, crate::Error> {
        if let Some(stream) = self.stream_manager.get_stream(&self.request_id).await {
            Ok(stream.chunks)
        } else {
            Err(crate::Error::Other(anyhow::anyhow!("Stream not found")))
        }
    }
    
    /// Get the full content as a string
    pub async fn get_content(&self) -> Result<String, crate::Error> {
        if let Some(stream) = self.stream_manager.get_stream(&self.request_id).await {
            Ok(stream.get_full_content())
        } else {
            Err(crate::Error::Other(anyhow::anyhow!("Stream not found")))
        }
    }
}

/// LLM generation request event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMGenerateRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub options: GenerateOptions,
    pub request_id: String,
}

impl Event for LLMGenerateRequest {
    fn event_type(&self) -> &'static str {
        "llm:generate-request"
    }
    
    fn priority(&self) -> crate::events::EventPriority {
        crate::events::EventPriority::High
    }
}

/// LLM generation response event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMGenerateResponse {
    pub request_id: String,
    pub result: GenerateResult,
    pub error: Option<String>,
}

impl Event for LLMGenerateResponse {
    fn event_type(&self) -> &'static str {
        "llm:generate-response"
    }
    
    fn priority(&self) -> crate::events::EventPriority {
        crate::events::EventPriority::High
    }
}

/// LLM streaming request event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMStreamRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub options: StreamOptions,
    pub request_id: String,
}

impl Event for LLMStreamRequest {
    fn event_type(&self) -> &'static str {
        "llm:stream-request"
    }
    
    fn priority(&self) -> crate::events::EventPriority {
        crate::events::EventPriority::High
    }
}

/// LLM streaming chunk event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMStreamChunk {
    pub request_id: String,
    pub chunk: StreamChunk,
    pub error: Option<String>,
    pub is_final: bool,
}

impl Event for LLMStreamChunk {
    fn event_type(&self) -> &'static str {
        "llm:stream-chunk"
    }
    
    fn priority(&self) -> crate::events::EventPriority {
        crate::events::EventPriority::High
    }
}

/// LLM stream completion event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMStreamComplete {
    pub request_id: String,
    pub final_chunk: Option<StreamChunk>,
    pub error: Option<String>,
    pub usage: Option<Usage>,
}

impl Event for LLMStreamComplete {
    fn event_type(&self) -> &'static str {
        "llm:stream-complete"
    }
    
    fn priority(&self) -> crate::events::EventPriority {
        crate::events::EventPriority::High
    }
}

/// Stream chunk handler for processing incoming chunks
pub struct StreamChunkHandler {
    stream_manager: StreamManager,
}

impl StreamChunkHandler {
    pub fn new(stream_manager: StreamManager) -> Self {
        Self { stream_manager }
    }
}

#[async_trait]
impl EventHandler<LLMStreamChunk> for StreamChunkHandler {
    async fn handle(&self, event: &LLMStreamChunk) -> Result<(), crate::Error> {
        if let Some(error) = &event.error {
            // Handle chunk error
            self.stream_manager.set_stream_error(&event.request_id, error.clone()).await?;
        } else {
            // Process chunk
            self.stream_manager.add_chunk(&event.request_id, event.chunk.clone()).await?;
            
            // If this is the final chunk, complete the stream
            if event.is_final {
                self.stream_manager.complete_stream(&event.request_id).await?;
            }
        }
        Ok(())
    }
}

/// Stream completion handler
pub struct StreamCompleteHandler {
    stream_manager: StreamManager,
}

impl StreamCompleteHandler {
    pub fn new(stream_manager: StreamManager) -> Self {
        Self { stream_manager }
    }
}

#[async_trait]
impl EventHandler<LLMStreamComplete> for StreamCompleteHandler {
    async fn handle(&self, event: &LLMStreamComplete) -> Result<(), crate::Error> {
        if let Some(error) = &event.error {
            // Handle stream error
            self.stream_manager.set_stream_error(&event.request_id, error.clone()).await?;
        } else {
            // Add final chunk if provided
            if let Some(final_chunk) = &event.final_chunk {
                self.stream_manager.add_chunk(&event.request_id, final_chunk.clone()).await?;
            }
            
            // Complete the stream
            self.stream_manager.complete_stream(&event.request_id).await?;
        }
        Ok(())
    }
}