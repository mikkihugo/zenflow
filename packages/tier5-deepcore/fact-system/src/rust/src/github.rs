//! Simple GitHub Repository Analysis for FACT System
//!
//! Basic GitHub API integration for extracting code snippets and examples.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[cfg(feature = "github")]
use octocrab::Octocrab;

/// GitHub repository information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepoInfo {
  pub owner: String,
  pub name: String,
  pub branch: Option<String>,
}

/// Code snippet extracted from repository
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeSnippet {
  pub id: String,
  pub title: String,
  pub description: String,
  pub code: String,
  pub language: String,
  pub file_path: String,
  pub repo_url: String,
  pub stars: u32,
}

/// Analysis result for a repository
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepoAnalysis {
  pub snippets: Vec<CodeSnippet>,
  pub repo_name: String,
  pub repo_description: String,
  pub stars: u32,
  pub language: String,
}

/// Analysis result for Hex packages
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HexPackageAnalysis {
  pub official_repo: Option<Vec<CodeSnippet>>,
  pub example_repos: Vec<CodeSnippet>,
  pub tutorial_repos: Vec<CodeSnippet>,
}

/// FACT-compatible entries
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FACTEntries {
  pub documentation: String,
  pub snippets: Vec<FACTSnippet>,
  pub examples: Vec<FACTExample>,
  pub best_practices: Vec<FACTBestPractice>,
  pub troubleshooting: Vec<FACTTroubleshooting>,
  pub github_sources: Vec<GitHubSource>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FACTSnippet {
  pub title: String,
  pub code: String,
  pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FACTExample {
  pub title: String,
  pub code: String,
  pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FACTBestPractice {
  pub practice: String,
  pub rationale: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FACTTroubleshooting {
  pub issue: String,
  pub solution: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitHubSource {
  pub repo: String,
  pub stars: u32,
  pub last_update: String,
}

/// GitHub analyzer with GraphQL priority
pub struct GitHubAnalyzer {
  #[cfg(feature = "github")]
  client: octocrab::Octocrab,

  #[cfg(feature = "github-graphql")]
  graphql_client: crate::graphql::GitHubGraphQLClient,

  beam_tools: HashSet<String>,
  prefer_graphql: bool,
}

impl GitHubAnalyzer {
  /// Create new GitHub analyzer with optional token (GraphQL priority)
  pub fn new(token: Option<String>) -> Result<Self> {
    #[cfg(feature = "github")]
    let client = match &token {
      Some(token) => Octocrab::builder()
        .personal_token(token.clone())
        .build()
        .context("Failed to create GitHub client with token")?,
      None => Octocrab::builder()
        .build()
        .context("Failed to create GitHub client")?,
    };

    #[cfg(feature = "github-graphql")]
    let graphql_client =
      crate::graphql::GitHubGraphQLClient::new(token.clone());

    #[cfg(feature = "github-graphql")]
    let prefer_graphql = true; // Always prefer GraphQL when available

    #[cfg(not(feature = "github-graphql"))]
    let prefer_graphql = false;

    let beam_tools = [
      "phoenix",
      "ecto",
      "plug",
      "cowboy",
      "jason",
      "tesla",
      "broadway",
      "oban",
      "libcluster",
      "guardian",
      "absinthe",
      "nerves",
      "scenic",
      "liveview",
      "live_view",
      "bandit",
      "finch",
      "bamboo",
      "swoosh",
    ]
    .iter()
    .map(|s| s.to_string())
    .collect();

    Ok(Self {
      #[cfg(feature = "github")]
      client,

      #[cfg(feature = "github-graphql")]
      graphql_client,

      beam_tools,
      prefer_graphql,
    })
  }

  /// Analyze a specific repository (GraphQL priority)
  pub async fn analyze_repository(
    &self,
    repo_info: &RepoInfo,
  ) -> Result<RepoAnalysis> {
    // Try GraphQL first if available
    #[cfg(feature = "github-graphql")]
    if self.prefer_graphql {
      match self.analyze_repository_graphql(repo_info).await {
        Ok(analysis) => return Ok(analysis),
        Err(e) => {
          tracing::warn!(
            "GraphQL analysis failed, falling back to REST: {}",
            e
          );
          // Fall through to REST API
        }
      }
    }

    // Fall back to REST API
    #[cfg(feature = "github")]
    {
      // Get repository metadata
      let repo = self
        .client
        .repos(&repo_info.owner, &repo_info.name)
        .get()
        .await
        .context("Failed to get repository information")?;

      // Create basic analysis result
      Ok(RepoAnalysis {
        snippets: vec![], // For now, return empty - would implement file analysis
        repo_name: repo
          .full_name
          .unwrap_or_else(|| format!("{}/{}", repo_info.owner, repo_info.name)),
        repo_description: repo.description.unwrap_or_default(),
        stars: repo.stargazers_count.unwrap_or(0),
        language: repo
          .language
          .map(|l| l.to_string())
          .unwrap_or_else(|| "unknown".to_string()),
      })
    }
    #[cfg(not(feature = "github"))]
    {
      anyhow::bail!(
        "GitHub feature not enabled. Rebuild with --features github"
      );
    }
  }

  /// Analyze repository using GraphQL API v4 (version-specific)
  #[cfg(feature = "github-graphql")]
  async fn analyze_repository_graphql(
    &self,
    repo_info: &RepoInfo,
  ) -> Result<RepoAnalysis> {
    use crate::graphql::VersionSpecificAnalysis;

    // Determine the reference to analyze (branch or latest release)
    let ref_name = match &repo_info.branch {
      Some(branch) => format!("refs/heads/{}", branch),
      None => "HEAD".to_string(), // Will resolve to default branch
    };

    // Create version-specific analysis request
    let analysis_request = VersionSpecificAnalysis {
      owner: repo_info.owner.clone(),
      name: repo_info.name.clone(),
      version_tag: None, // Will be determined by GraphQL query
      ref_name,
      target_files: vec![
        "mix.exs".to_string(),
        "Cargo.toml".to_string(),
        "package.json".to_string(),
        "pyproject.toml".to_string(),
        "setup.py".to_string(),
        "gleam.toml".to_string(),
      ],
    };

    // Execute GraphQL analysis to FETCH file contents
    let graphql_result = self
      .graphql_client
      .analyze_version_specific(&analysis_request)
      .await
      .context("GraphQL version-specific analysis failed")?;

    // Convert GraphQL result to RepoAnalysis
    let mut snippets = Vec::new();

    // Extract code snippets from fetched package files
    // GraphQL just fetches - existing FACT system would parse dependencies
    for file_content in graphql_result.file_contents {
      if !file_content.content.trim().is_empty() {
        let language = match file_content.file_path.as_str() {
          path if path.ends_with(".exs") => "elixir",
          path if path.ends_with(".toml") => "toml",
          path if path.ends_with(".json") => "json",
          path if path.ends_with(".py") => "python",
          _ => "text",
        };

        snippets.push(CodeSnippet {
          id: format!("{}:{}", repo_info.name, file_content.file_path),
          title: format!("{} Configuration", file_content.file_path),
          description: format!(
            "Package configuration from {} - ready for FACT parsing",
            file_content.file_path
          ),
          code: file_content.content.clone(), // Raw content for FACT auto_orchestrator to parse
          language: language.to_string(),
          file_path: file_content.file_path.clone(),
          repo_url: format!(
            "https://github.com/{}/{}",
            repo_info.owner, repo_info.name
          ),
          stars: graphql_result.metadata.stars,
        });

        // The raw file_content.content gets passed to existing auto_orchestrator
        // which already has parse_cargo_toml(), parse_mix_exs() etc.
        // GraphQL just fetches faster than git clone
      }
    }

    Ok(RepoAnalysis {
      snippets,
      repo_name: format!("{}/{}", repo_info.owner, repo_info.name),
      repo_description: graphql_result.metadata.description.unwrap_or_default(),
      stars: graphql_result.metadata.stars,
      language: graphql_result
        .metadata
        .primary_language
        .unwrap_or_else(|| "unknown".to_string()),
    })
  }

  /// Analyze Hex package repositories for BEAM ecosystem
  pub async fn analyze_hex_package_repos(
    &self,
    package_name: &str,
    version: &str,
  ) -> Result<HexPackageAnalysis> {
    #[cfg(feature = "github")]
    {
      let search_query = format!("{} {} language:elixir", package_name, version);

      let search_result = self
        .client
        .search()
        .repositories(&search_query)
        .sort("stars")
        .order("desc")
        .per_page(10)
        .send()
        .await
        .context("GitHub repository search failed")?;

      let mut all_snippets = Vec::new();
      let mut official_repo = None;

      // Use Edition 2024 enhanced iterator and async patterns
      for repo in search_result.items.iter().take(5) {
        let repo_info = RepoInfo {
          owner: repo
            .owner
            .as_ref()
            .map(|owner| owner.login.clone())
            .unwrap_or_else(|| "unknown".to_string()),
          name: repo.name.clone(),
          branch: None,
        };

        // Use Edition 2024 improved error handling
        match self.analyze_repository(&repo_info).await {
          Ok(analysis) => {
            // Check if this is the official repo using Edition 2024 pattern matching
            if repo.full_name.as_ref().is_some_and(|name| {
              name.to_lowercase().contains(&package_name.to_lowercase())
            }) {
              official_repo = Some(analysis.snippets.clone());
            }
            all_snippets.extend(analysis.snippets);
          }
          Err(_) => continue, // Skip failed analyses
        }
      }

      Ok(HexPackageAnalysis {
        official_repo,
        example_repos: all_snippets.clone(),
        tutorial_repos: all_snippets,
      })
    }
    #[cfg(not(feature = "github"))]
    {
      anyhow::bail!(
        "GitHub feature not enabled. Rebuild with --features github"
      );
    }
  }

  /// Generate FACT-compatible entries from analyzed repositories
  pub fn generate_fact_entries(
    &self,
    tool_name: &str,
    version: &str,
    analysis: &HexPackageAnalysis,
  ) -> FACTEntries {
    let snippets = analysis
      .official_repo
      .as_ref()
      .unwrap_or(&analysis.example_repos);

    FACTEntries {
      documentation: format!(
        "GitHub-sourced documentation and examples for {}@{}",
        tool_name, version
      ),
      snippets: snippets
        .iter()
        .map(|s| FACTSnippet {
          title: s.title.clone(),
          code: s.code.clone(),
          description: s.description.clone(),
        })
        .collect(),
      examples: snippets
        .iter()
        .map(|s| FACTExample {
          title: format!("{} Example", s.title),
          code: s.code.clone(),
          explanation: s.description.clone(),
        })
        .collect(),
      best_practices: vec![], // Would implement pattern detection
      troubleshooting: vec![], // Would implement from issue analysis
      github_sources: vec![], // Would populate with repo metadata
    }
  }
}
