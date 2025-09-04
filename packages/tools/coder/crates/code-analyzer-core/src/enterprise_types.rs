//! Enterprise-grade type definitions for production use
use serde::{Deserialize, Serialize};

/// Task priority levels for enterprise task management
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TaskPriority {
    Critical,
    High,
    Medium, 
    Low,
}

impl Default for TaskPriority {
    fn default() -> Self {
        Self::Medium
    }
}

/// Task status for tracking execution state
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled,
}

impl Default for TaskStatus {
    fn default() -> Self {
        Self::Pending
    }
}

/// TSOS permission levels for secure operations
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TsosPermissionLevel {
    Administrator,
    PowerUser,
    User,
    Guest,
    Restricted,
}

impl Default for TsosPermissionLevel {
    fn default() -> Self {
        Self::User
    }
}

/// Compliance levels for enterprise governance
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ComplianceLevel {
    Full,
    Partial,
    NonCompliant,
    Unknown,
}

impl Default for ComplianceLevel {
    fn default() -> Self {
        Self::Unknown
    }
}