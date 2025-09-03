//! Knowledge Integration for File-Aware Core
//! 
//! Integrates with both RAG (Retrieval-Augmented Generation) and FACT (Factual Augmented Contextual Training)
//! systems through the brain and knowledge domains for intelligent code generation and analysis.

use crate::{Result, FileAwareError, FileAnalyzer, DatabaseManager};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

/// Knowledge integration types with comprehensive validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum KnowledgeType {
    /// RAG: Retrieval-Augmented Generation for semantic search
    RAG {
        query: String,
        context_window: usize,
        similarity_threshold: f32,
        max_results: usize,
        freshness_requirement: Option<u64>, // seconds
        access_level: AccessLevel,
        version: String,
    },
    
    /// FACT: Factual Augmented Contextual Training for verified knowledge
    FACT {
        domain: String,
        fact_type: FactType,
        verification_level: VerificationLevel,
        source_authority: SourceAuthority,
        last_verified: u64, // timestamp
        access_level: AccessLevel,
        version: String,
    },
}

impl KnowledgeType {
    /// Validate knowledge type parameters
    pub fn validate(&self) -> Result<()> {
        match self {
            KnowledgeType::RAG { query, context_window, similarity_threshold, max_results, .. } => {
                if query.is_empty() {
                    return Err(FileAwareError::Analysis { 
                        message: "RAG query cannot be empty".to_string() 
                    });
                }
                if *context_window == 0 {
                    return Err(FileAwareError::Analysis { 
                        message: "RAG context window must be greater than 0".to_string() 
                    });
                }
                if !(0.0..=1.0).contains(similarity_threshold) {
                    return Err(FileAwareError::Analysis { 
                        message: "RAG similarity threshold must be between 0.0 and 1.0".to_string() 
                    });
                }
                if *max_results == 0 {
                    return Err(FileAwareError::Analysis { 
                        message: "RAG max results must be greater than 0".to_string() 
                    });
                }
                Ok(())
            }
            KnowledgeType::FACT { domain, .. } => {
                if domain.is_empty() {
                    return Err(FileAwareError::Analysis { 
                        message: "FACT domain cannot be empty".to_string() 
                    });
                }
                Ok(())
            }
        }
    }
    
    /// Check if knowledge is fresh enough
    pub fn is_fresh(&self, max_age_seconds: u64) -> bool {
        match self {
            // RAG queries are performed in real-time, so they are always considered fresh.
            // The `freshness_requirement` field is for the query system to use, not for this check.
            KnowledgeType::RAG { .. } => true,
            KnowledgeType::FACT { last_verified, .. } => {
                let current_time = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .expect("System time is before the UNIX epoch")
                    .as_secs();
                current_time - *last_verified <= max_age_seconds
            }
        }
    }
    
    /// Get access level for this knowledge type
    pub fn access_level(&self) -> AccessLevel {
        match self {
            KnowledgeType::RAG { access_level, .. } => access_level.clone(),
            KnowledgeType::FACT { access_level, .. } => access_level.clone(),
        }
    }
    
    /// Get version information
    pub fn version(&self) -> &str {
        match self {
            KnowledgeType::RAG { version, .. } => version,
            KnowledgeType::FACT { version, .. } => version,
        }
    }
}

/// Access control levels for knowledge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AccessLevel {
    Public,
    Internal,
    Confidential,
    Restricted,
    Secret,
}

impl AccessLevel {
    /// Check if user has access to this level
    pub fn can_access(&self, user_level: &AccessLevel) -> bool {
        let level_hierarchy = [
            AccessLevel::Public,
            AccessLevel::Internal,
            AccessLevel::Confidential,
            AccessLevel::Restricted,
            AccessLevel::Secret,
        ];
        
        let required_index = level_hierarchy.iter().position(|l| l == self).unwrap_or(0);
        let user_index = level_hierarchy.iter().position(|l| l == user_level).unwrap_or(0);
        
        user_index >= required_index
    }
}

/// Types of facts for FACT system with validation and optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactType {
    /// Code patterns and best practices
    CodePattern,
    /// Architectural decisions and patterns
    ArchitecturalDecision,
    /// Security vulnerabilities and fixes
    SecurityVulnerability,
    /// Performance optimization techniques
    PerformanceOptimization,
    /// Dependency and package information
    DependencyInfo,
    /// API documentation and usage
    APIDocumentation,
    /// Testing strategies and patterns
    TestingStrategy,
    /// Deployment and infrastructure
    DeploymentInfo,
    /// Code review guidelines
    CodeReview,
    /// Refactoring patterns
    Refactoring,
    /// Debugging techniques
    Debugging,
    /// Code quality metrics
    CodeQuality,
    /// Security best practices
    SecurityBestPractices,
}

impl FactType {
    /// Get validation rules for this fact type
    pub fn validation_rules(&self) -> Vec<ValidationRule> {
        match self {
            FactType::CodePattern => vec![
                ValidationRule::Required("pattern_name".to_string()),
                ValidationRule::Required("pattern_description".to_string()),
                ValidationRule::Required("code_example".to_string()),
                ValidationRule::Required("language".to_string()),
                ValidationRule::Optional("complexity_score".to_string()),
            ],
            FactType::ArchitecturalDecision => vec![
                ValidationRule::Required("decision_title".to_string()),
                ValidationRule::Required("decision_context".to_string()),
                ValidationRule::Required("decision_outcome".to_string()),
                ValidationRule::Required("alternatives_considered".to_string()),
                ValidationRule::Required("consequences".to_string()),
            ],
            FactType::SecurityVulnerability => vec![
                ValidationRule::Required("vulnerability_id".to_string()),
                ValidationRule::Required("description".to_string()),
                ValidationRule::Required("severity".to_string()),
                ValidationRule::Required("mitigation".to_string()),
                ValidationRule::Required("affected_versions".to_string()),
            ],
            FactType::PerformanceOptimization => vec![
                ValidationRule::Required("optimization_name".to_string()),
                ValidationRule::Required("description".to_string()),
                ValidationRule::Required("performance_impact".to_string()),
                ValidationRule::Required("implementation".to_string()),
                ValidationRule::Optional("benchmarks".to_string()),
            ],
            _ => vec![
                ValidationRule::Required("title".to_string()),
                ValidationRule::Required("description".to_string()),
            ],
        }
    }
    
    /// Get optimization strategies for this fact type
    pub fn optimization_strategies(&self) -> Vec<String> {
        match self {
            FactType::CodePattern => vec![
                "Use vector embeddings for similarity search".to_string(),
                "Implement pattern caching for frequently accessed patterns".to_string(),
                "Use language-specific pattern indexing".to_string(),
            ],
            FactType::ArchitecturalDecision => vec![
                "Use decision tree structures for quick navigation".to_string(),
                "Implement decision tagging for cross-referencing".to_string(),
                "Use decision impact analysis for relevance scoring".to_string(),
            ],
            FactType::SecurityVulnerability => vec![
                "Use CVE database integration for up-to-date information".to_string(),
                "Implement severity-based prioritization".to_string(),
                "Use affected version matching for relevance".to_string(),
            ],
            _ => vec![
                "Use semantic indexing for improved search".to_string(),
                "Implement relevance scoring based on context".to_string(),
            ],
        }
    }
}

/// Verification levels for facts with automation and monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VerificationLevel {
    /// Unverified - needs review
    Unverified,
    /// Community verified - peer reviewed
    CommunityVerified,
    /// Expert verified - domain expert approved
    ExpertVerified,
    /// Official verified - official documentation
    OfficialVerified,
    /// Enterprise verified - enterprise compliance
    EnterpriseVerified,
    /// AI verified - AI model validation
    AIVerified,
    /// Automated verified - automated testing
    AutomatedVerified,
}

impl VerificationLevel {
    /// Get verification requirements
    pub fn requirements(&self) -> Vec<String> {
        match self {
            VerificationLevel::Unverified => vec![
                "Manual review required".to_string(),
                "Source validation needed".to_string(),
            ],
            VerificationLevel::CommunityVerified => vec![
                "Peer review completed".to_string(),
                "Community consensus reached".to_string(),
            ],
            VerificationLevel::ExpertVerified => vec![
                "Domain expert review completed".to_string(),
                "Expert credentials verified".to_string(),
            ],
            VerificationLevel::OfficialVerified => vec![
                "Official documentation reference".to_string(),
                "Authoritative source confirmed".to_string(),
            ],
            VerificationLevel::EnterpriseVerified => vec![
                "Enterprise compliance check".to_string(),
                "Security review completed".to_string(),
            ],
            VerificationLevel::AIVerified => vec![
                "AI model validation completed".to_string(),
                "Confidence score above threshold".to_string(),
            ],
            VerificationLevel::AutomatedVerified => vec![
                "Automated tests passing".to_string(),
                "CI/CD pipeline validation".to_string(),
            ],
        }
    }
    
    /// Check if verification can be automated
    pub fn can_automate(&self) -> bool {
        matches!(self, 
            VerificationLevel::AIVerified | 
            VerificationLevel::AutomatedVerified
        )
    }
    
    /// Get verification confidence score
    pub fn confidence_score(&self) -> f32 {
        match self {
            VerificationLevel::Unverified => 0.0,
            VerificationLevel::CommunityVerified => 0.3,
            VerificationLevel::ExpertVerified => 0.6,
            VerificationLevel::OfficialVerified => 0.8,
            VerificationLevel::EnterpriseVerified => 0.9,
            VerificationLevel::AIVerified => 0.7,
            VerificationLevel::AutomatedVerified => 0.8,
        }
    }
}

/// Source authority levels with scoring and monitoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SourceAuthority {
    /// Personal blog or website
    Personal,
    /// Community forum or discussion
    Community,
    /// Technical blog or article
    TechnicalBlog,
    /// Official documentation
    OfficialDocumentation,
    /// Academic paper or research
    Academic,
    /// Industry standard or specification
    IndustryStandard,
    /// Government or regulatory body
    Government,
    /// Enterprise documentation
    Enterprise,
}

impl SourceAuthority {
    /// Get authority score
    pub fn authority_score(&self) -> f32 {
        match self {
            SourceAuthority::Personal => 0.1,
            SourceAuthority::Community => 0.2,
            SourceAuthority::TechnicalBlog => 0.4,
            SourceAuthority::OfficialDocumentation => 0.8,
            SourceAuthority::Academic => 0.7,
            SourceAuthority::IndustryStandard => 0.9,
            SourceAuthority::Government => 0.9,
            SourceAuthority::Enterprise => 0.8,
        }
    }
    
    /// Check if source requires verification
    pub fn requires_verification(&self) -> bool {
        matches!(self, 
            SourceAuthority::Personal | 
            SourceAuthority::Community
        )
    }
    
    /// Get verification recommendations
    pub fn verification_recommendations(&self) -> Vec<String> {
        match self {
            SourceAuthority::Personal => vec![
                "Cross-reference with official sources".to_string(),
                "Verify author credentials".to_string(),
                "Check for recent updates".to_string(),
            ],
            SourceAuthority::Community => vec![
                "Verify community consensus".to_string(),
                "Check for expert validation".to_string(),
                "Look for official confirmation".to_string(),
            ],
            _ => vec![
                "Source authority is generally reliable".to_string(),
                "Regular updates recommended".to_string(),
            ],
        }
    }
}

/// Validation rule types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ValidationRule {
    Required(String),
    Optional(String),
    Conditional(String, String), // rule, condition
}
