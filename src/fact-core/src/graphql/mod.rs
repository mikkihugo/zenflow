//! Version-Specific GitHub GraphQL Integration for FACT
//!
//! High-priority GraphQL implementation for efficient repository analysis
//! with precise version targeting and minimal API calls.

use anyhow::Result;
use serde::{Deserialize, Serialize};

pub mod simple_client;
pub mod test;
pub use simple_client::{SimpleGraphQLClient, SimpleVersionAnalysis};

/// Version-specific repository analysis request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionSpecificAnalysis {
  pub owner: String,
  pub name: String,
  pub version_tag: Option<String>,
  pub ref_name: String, // branch, tag, or commit SHA
  pub target_files: Vec<String>, // Specific file patterns to analyze
}

/// Extracted version-specific code with metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionCodeSnippet {
  pub file_path: String,
  pub content: String,
  pub language: String,
  pub version: String,
  pub commit_sha: String,
  pub last_modified: String,
  pub size_bytes: u64,
}

/// Version-specific repository data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionRepoAnalysis {
  pub repo_name: String,
  pub description: String,
  pub stars: u32,
  pub primary_language: String,
  pub version: String,
  pub release_date: Option<String>,
  pub snippets: Vec<VersionCodeSnippet>,
  pub dependencies: Vec<VersionDependency>,
}

/// Version-specific dependency information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionDependency {
  pub name: String,
  pub version_constraint: String,
  pub ecosystem: String, // npm, hex, cargo, etc.
}

#[cfg(feature = "github-graphql")]
pub struct GitHubGraphQLClient {
  simple_client: SimpleGraphQLClient,
}

#[cfg(feature = "github-graphql")]
impl GitHubGraphQLClient {
  pub fn new(token: Option<String>) -> Self {
    Self { simple_client: SimpleGraphQLClient::new(token) }
  }

  /// Analyze version-specific repository using simplified GraphQL
  pub async fn analyze_version_specific(
    &self,
    analysis: &VersionSpecificAnalysis,
  ) -> Result<SimpleVersionAnalysis> {
    self.simple_client.analyze_version_specific(analysis).await
  }
}

#[cfg(not(feature = "github-graphql"))]
pub struct GitHubGraphQLClient;

#[cfg(not(feature = "github-graphql"))]
impl GitHubGraphQLClient {
  pub fn new(_token: Option<String>) -> Self {
    Self
  }

  pub async fn analyze_version_specific(
    &self,
    _analysis: &VersionSpecificAnalysis,
  ) -> Result<SimpleVersionAnalysis> {
    anyhow::bail!(
      "GitHub GraphQL feature not enabled. Rebuild with --features github-graphql"
    );
  }
}

/// Priority patterns for version-specific file extraction
pub fn get_priority_files_for_ecosystem(ecosystem: &str) -> Vec<String> {
  match ecosystem.to_lowercase().as_str() {
    "beam" | "elixir" | "erlang" | "gleam" => vec![
      "mix.exs".to_string(),
      "rebar.config".to_string(),
      "gleam.toml".to_string(),
      "lib/**/*.ex".to_string(),
      "src/**/*.erl".to_string(),
      "src/**/*.gleam".to_string(),
      "README.md".to_string(),
      "CHANGELOG.md".to_string(),
    ],
    "rust" | "cargo" => vec![
      "Cargo.toml".to_string(),
      "src/lib.rs".to_string(),
      "src/main.rs".to_string(),
      "examples/**/*.rs".to_string(),
      "README.md".to_string(),
    ],
    "npm" | "node" | "javascript" | "typescript" => vec![
      "package.json".to_string(),
      "src/index.js".to_string(),
      "src/index.ts".to_string(),
      "lib/**/*.js".to_string(),
      "examples/**/*.js".to_string(),
      "README.md".to_string(),
    ],
    "python" | "pypi" => vec![
      "setup.py".to_string(),
      "pyproject.toml".to_string(),
      "requirements.txt".to_string(),
      "src/**/*.py".to_string(),
      "examples/**/*.py".to_string(),
      "README.md".to_string(),
    ],
    _ => vec!["README.md".to_string(), "LICENSE".to_string()],
  }
}
