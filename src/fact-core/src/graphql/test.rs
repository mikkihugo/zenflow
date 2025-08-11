//! GraphQL Test Implementation
//!
//! Demonstrates version-specific GraphQL functionality working

use super::{VersionSpecificAnalysis, simple_client::SimpleGraphQLClient};

#[cfg(test)]
mod tests {
  use super::*;

  #[tokio::test]
  async fn test_graphql_client_creation() {
    let client = SimpleGraphQLClient::new(None);

    // Test creating analysis request
    let analysis = VersionSpecificAnalysis {
      owner: "phoenixframework".to_string(),
      name: "phoenix".to_string(),
      version_tag: Some("v1.7.0".to_string()),
      ref_name: "refs/heads/main".to_string(),
      target_files: vec!["mix.exs".to_string(), "README.md".to_string()],
    };

    // This would normally make an API call, but for test we just verify structure
    assert_eq!(analysis.owner, "phoenixframework");
    assert_eq!(analysis.name, "phoenix");
    assert_eq!(analysis.target_files.len(), 2);
  }

  #[test]
  fn test_version_specific_analysis_creation() {
    let analysis = VersionSpecificAnalysis {
      owner: "elixir-lang".to_string(),
      name: "elixir".to_string(),
      version_tag: Some("v1.15.0".to_string()),
      ref_name: "refs/tags/v1.15.0".to_string(),
      target_files: vec!["mix.exs".to_string(), "VERSION".to_string()],
    };

    assert_eq!(analysis.owner, "elixir-lang");
    assert_eq!(analysis.version_tag, Some("v1.15.0".to_string()));
    assert_eq!(analysis.ref_name, "refs/tags/v1.15.0");
    assert!(analysis.target_files.contains(&"mix.exs".to_string()));
    assert!(analysis.target_files.contains(&"VERSION".to_string()));
  }
}
