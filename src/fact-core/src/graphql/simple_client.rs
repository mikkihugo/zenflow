//! Simplified GraphQL Client for GitHub Analysis
//!
//! Working implementation without generated types

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Simple GitHub GraphQL client
pub struct SimpleGraphQLClient {
  client: reqwest::Client,
  token: Option<String>,
}

/// Simple version analysis result  
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimpleVersionAnalysis {
  pub metadata: RepoMetadata,
  pub file_contents: Vec<FileContent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RepoMetadata {
  pub name: String,
  pub description: Option<String>,
  pub stars: u32,
  pub primary_language: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileContent {
  pub file_path: String,
  pub content: String,
}

impl SimpleGraphQLClient {
  pub fn new(token: Option<String>) -> Self {
    Self { client: reqwest::Client::new(), token }
  }

  /// Analyze version-specific repository with simplified approach
  pub async fn analyze_version_specific(
    &self,
    analysis: &super::VersionSpecificAnalysis,
  ) -> Result<SimpleVersionAnalysis> {
    // For now, use a simplified query that works
    let query = format!(
      r#"
        {{
            repository(owner: "{}", name: "{}") {{
                name
                description
                stargazers {{
                    totalCount
                }}
                primaryLanguage {{
                    name
                }}
            }}
        }}
        "#,
      analysis.owner, analysis.name
    );

    let response = self.execute_query(&query).await?;

    // Parse basic repository information
    let repo_data = response
      .get("data")
      .and_then(|d| d.get("repository"))
      .ok_or_else(|| anyhow::anyhow!("No repository data found"))?;

    let metadata = RepoMetadata {
      name: repo_data
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string(),
      description: repo_data
        .get("description")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string()),
      stars: repo_data
        .get("stargazers")
        .and_then(|s| s.get("totalCount"))
        .and_then(|c| c.as_u64())
        .unwrap_or(0) as u32,
      primary_language: repo_data
        .get("primaryLanguage")
        .and_then(|l| l.get("name"))
        .and_then(|n| n.as_str())
        .map(|s| s.to_string()),
    };

    // Fetch specific package files if requested
    let mut file_contents = Vec::new();

    // If analysis specifies target files, fetch them
    for target_file in &analysis.target_files {
      if let Ok(file_content) = self
        .fetch_file_content(
          &analysis.owner,
          &analysis.name,
          &analysis.ref_name,
          target_file,
        )
        .await
      {
        file_contents.push(FileContent {
          file_path: target_file.clone(),
          content: file_content,
        });
      }
    }

    Ok(SimpleVersionAnalysis { metadata, file_contents })
  }

  async fn execute_query(&self, query: &str) -> Result<serde_json::Value> {
    let mut request_body = HashMap::new();
    request_body.insert("query", query);

    let mut request = self
      .client
      .post("https://api.github.com/graphql")
      .json(&request_body);

    if let Some(ref token) = self.token {
      request = request.header("Authorization", format!("Bearer {}", token));
    }
    request = request.header("User-Agent", "fact-tools/1.1.0");

    let response = request
      .send()
      .await
      .context("Failed to send GraphQL request")?;

    if !response.status().is_success() {
      let status = response.status();
      let text = response.text().await.unwrap_or_default();
      anyhow::bail!("GraphQL request failed with status {}: {}", status, text);
    }

    let json: serde_json::Value = response
      .json()
      .await
      .context("Failed to parse GraphQL response")?;

    if let Some(errors) = json.get("errors") {
      anyhow::bail!("GraphQL errors: {:?}", errors);
    }

    Ok(json)
  }

  /// Fetch individual file content using GraphQL
  async fn fetch_file_content(
    &self,
    owner: &str,
    name: &str,
    ref_name: &str,
    file_path: &str,
  ) -> Result<String> {
    let query = format!(
      r#"
        {{
            repository(owner: "{}", name: "{}") {{
                object(expression: "{}:{}") {{
                    ... on Blob {{
                        text
                    }}
                }}
            }}
        }}
        "#,
      owner, name, ref_name, file_path
    );

    let response = self.execute_query(&query).await?;

    let file_content = response
      .get("data")
      .and_then(|d| d.get("repository"))
      .and_then(|r| r.get("object"))
      .and_then(|o| o.get("text"))
      .and_then(|t| t.as_str())
      .unwrap_or_default();

    Ok(file_content.to_string())
  }
}
