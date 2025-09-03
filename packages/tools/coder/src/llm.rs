//! LLM provider abstractions and implementations

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use crate::ts_event_bus::EventBus;
use serde_wasm_bindgen::to_value;
use tokio::sync::oneshot;
use wasm_bindgen::closure::Closure;

// Re-export only the core types, not the providers
pub use model::{
    Message, MessageRole, MessageContent, MessagePart, ImageData,
    ToolCall, ToolDefinition, GenerateOptions, StreamOptions,
    GenerateResult, StreamChunk, Usage, FinishReason
};

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

pub struct LlmClient {
    model_name: String,
}

impl LlmClient {
    pub fn new(model_name: String) -> Self {
        Self { model_name }
    }

    pub async fn generate(
        &self,
        messages: Vec<Message>,
        options: GenerateOptions,
    ) -> crate::Result<GenerateResult> {
        let (tx, rx) = oneshot::channel();

        let callback = Closure::once(move |result: JsValue| {
            let result: GenerateResult = serde_wasm_bindgen::from_value(result).unwrap();
            tx.send(result).unwrap();
        });

        EventBus::subscribe("llm:generate-response", &callback.as_ref().unchecked_ref());

        let request = to_value(&serde_json::json!({
            "model": self.model_name,
            "messages": messages,
            "options": options,
        })).unwrap();

        EventBus::publish("llm:generate-request", &request);

        let result = rx.await.unwrap();
        Ok(result)
    }

    pub async fn stream(
        &self,
        messages: Vec<Message>,
        options: StreamOptions,
    ) -> crate::Result<Box<dyn futures::Stream<Item = crate::Result<StreamChunk>> + Send + Unpin>> {
        // TODO: Implement streaming with TypeScript event bus
        todo!("LLM streaming not yet implemented")
    }
}

pub mod model {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Message {
        pub role: MessageRole,
        pub content: MessageContent,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub enum MessageRole {
        User,
        Assistant,
        System,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub enum MessageContent {
        Text(String),
        Parts(Vec<MessagePart>),
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub enum MessagePart {
        Text(String),
        Image(ImageData),
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ImageData {
        pub media_type: String,
        pub data: Vec<u8>,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ToolCall { }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct ToolDefinition { }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct GenerateOptions { }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct StreamOptions { }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct GenerateResult { }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct StreamChunk {
        pub delta: String,
    }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Usage { }

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub enum FinishReason { }
}