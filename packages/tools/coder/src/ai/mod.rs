//! AI Integration Module
//! 
//! Provides file-aware AI processing capabilities by bridging
//! Rust AI engine with TypeScript code analysis

pub mod file_aware_engine;

pub use file_aware_engine::{
    FileAwareEngine, FileAwareRequest, FileAwareResponse,
    FileChange, AnalyzedContext, ChangeType, ComplexityLevel
};