# GitHub Integration Plugin

Advanced GitHub repository management, analysis, and automation capabilities for Claude Zen.

## Features

### 🔍 Repository Analysis
- **Deep Technology Stack Detection** - Automatically identifies frameworks, build tools, and dependencies
- **Health Scoring** - Comprehensive repository health assessment with A-D grading
- **Activity Metrics** - Commit activity, contributor patterns, and project velocity
- **Community Analysis** - Issue resolution rates, PR merge patterns, contributor diversity

### 🎯 Intelligent Issue Triage
- **Auto-Labeling** - Smart label suggestions based on content analysis
- **Priority Assessment** - Automated priority scoring with justification
- **Duplicate Detection** - Identifies potential duplicate issues using similarity analysis  
- **Assignee Recommendations** - Suggests optimal assignees based on expertise patterns

### 🔧 Pull Request Enhancement
- **Automated Code Review** - Security scanning, test coverage analysis
- **Documentation Suggestions** - Identifies missing docs for API changes
- **Performance Analysis** - Detects potential performance impacts
- **Auto-Reviewer Assignment** - Smart reviewer suggestions based on changed files

### 📊 Advanced Analytics
- **Contributor Analysis** - Detailed contributor metrics and bus factor calculation
- **Commit Patterns** - Daily/hourly activity analysis and peak productivity times
- **Issue Resolution Tracking** - Average resolution times and success rates
- **Technology Evolution** - Track technology stack changes over time

### 🔗 Webhook Integration
- **Real-time Events** - Push, PR, issue, and release webhook support
- **Secure Processing** - Webhook signature verification and rate limiting
- **Custom Handlers** - Extensible event processing pipeline

## Quick Start

```javascript
import { GitHubIntegrationPlugin } from './index.js';

const github = new GitHubIntegrationPlugin({
  token: process.env.GITHUB_TOKEN,
  analysisDepth: 'deep',
  enableWebhooks: true
});

await github.initialize();

// Analyze repository
const analysis = await github.analyzeRepository('owner', 'repo', {
  includeIssues: true,
  includePRs: true,
  includeContributors: true,
  timeRange: 90 // days
});

console.log(`Repository Health: ${analysis.health.grade} (${analysis.health.score}/100)`);
```

## Repository Analysis

### Basic Usage
```javascript
const analysis = await github.analyzeRepository('facebook', 'react');

console.log('Repository Metrics:', analysis.metrics.basic);
console.log('Technology Stack:', analysis.technology);
console.log('Health Score:', analysis.health);
```

### Advanced Options
```javascript
const deepAnalysis = await github.analyzeRepository('owner', 'repo', {
  analysisDepth: 'deep',
  timeRange: 180,          // 6 months of data
  includeIssues: true,     // Issue analysis
  includePRs: true,        // Pull request analysis  
  includeCommits: true,    // Commit activity analysis
  includeContributors: true, // Contributor patterns
  includeTechnology: true,  // Tech stack detection
  includeHealth: true      // Health scoring
});
```

## Issue Intelligence

### Auto-Triage Issues
```javascript
const triage = await github.triageIssue('owner', 'repo', 123, {
  autoLabel: true,           // Suggest appropriate labels
  assignRecommendations: true, // Suggest assignees
  priorityAssessment: true,   // Calculate priority score
  duplicateDetection: true    // Find potential duplicates
});

console.log('Suggested Labels:', triage.recommendations.suggested_labels);
console.log('Priority:', triage.recommendations.priority);
console.log('Suggested Assignees:', triage.recommendations.suggested_assignees);
```

### Issue Classification
The plugin automatically classifies issues into:
- **Bug Reports** - Error, crash, broken functionality
- **Feature Requests** - Enhancement, new capability
- **Documentation** - README, guides, examples
- **Questions** - Help requests, support
- **Performance** - Speed, memory, optimization
- **Security** - Vulnerabilities, exploits

## Pull Request Enhancement

### Automated PR Analysis
```javascript
const enhancement = await github.enhancePullRequest('owner', 'repo', 456, {
  addTests: true,           // Suggest test additions
  improveDocs: true,        // Documentation improvements
  securityCheck: true,      // Security vulnerability scan
  performanceCheck: true,   // Performance impact analysis
  addReviewers: ['expert1', 'expert2'], // Auto-assign reviewers
  addLabels: ['enhancement', 'needs-review'] // Auto-label
});

console.log('Enhancements Applied:', enhancement.enhancements_applied);
console.log('Security Issues:', enhancement.suggestions.filter(s => s.type === 'security'));
```

### Security Scanning
Automatically detects:
- Hardcoded passwords and API keys
- Use of dangerous functions (`eval`, `innerHTML`)
- Command injection vulnerabilities
- Potential XSS issues

## Webhook Management

### Setup Webhooks
```javascript
const webhook = await github.setupWebhooks('owner', 'repo', 'https://your-app.com/webhook', {
  events: ['push', 'pull_request', 'issues', 'release'],
  insecureSSL: false
});

console.log('Webhook ID:', webhook.id);
```

### Supported Events
- `push` - Code pushes to repository
- `pull_request` - PR opened, closed, merged
- `issues` - Issue created, updated, closed
- `release` - New releases published
- `fork` - Repository forked
- `star` - Repository starred

## Configuration

### Environment Variables
```bash
# Required
GITHUB_TOKEN=ghp_your_personal_access_token

# Optional
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### Plugin Configuration
```javascript
const config = {
  token: process.env.GITHUB_TOKEN,
  baseUrl: 'https://api.github.com',      // GitHub API base URL
  requestTimeout: 30000,                   // Request timeout (ms)
  cacheTTL: 300000,                       // Cache TTL (5 minutes)
  maxConcurrentRequests: 10,              // Max concurrent API calls
  analysisDepth: 'standard',              // basic, standard, deep
  enableWebhooks: false,                  // Enable webhook support
  
  autoEnhancements: {
    pullRequests: {
      addTests: false,                    // Auto-suggest test additions
      improveDocs: false,                 // Auto-suggest doc improvements
      securityCheck: true,                // Always run security checks
      performanceCheck: false             // Performance impact analysis
    },
    issues: {
      autoLabel: true,                    // Auto-suggest labels
      assignRecommendations: true,        // Suggest assignees
      priorityAssessment: true,           // Calculate priority
      duplicateDetection: true            // Find duplicates
    }
  }
};
```

## API Reference

### Core Methods

#### `analyzeRepository(owner, repo, options)`
Comprehensive repository analysis including metrics, technology stack, and health scoring.

#### `triageIssue(owner, repo, issueNumber, options)`
Intelligent issue analysis with auto-labeling, priority assessment, and assignee recommendations.

#### `enhancePullRequest(owner, repo, prNumber, options)`
Enhanced PR analysis with security scanning, test suggestions, and automated improvements.

#### `analyzeTechnologyStack(owner, repo)`
Detect frameworks, build tools, package managers, and configuration files.

#### `analyzeContributors(owner, repo)`
Analyze contributor patterns, bus factor, and contribution distribution.

### Utility Methods

#### `makeRequest(endpoint, options)`
Make authenticated GitHub API requests with rate limiting and caching.

#### `getStats()`
Get plugin statistics including cache size, rate limits, and active requests.

#### `cleanup()`
Clean up resources and clear caches.

## GitHub Token Permissions

The plugin requires a GitHub Personal Access Token with these scopes:

### Minimum Required (Read-only analysis):
- `repo` (for private repositories) or `public_repo` (for public only)

### Enhanced Features:
- `repo:write` - PR/issue enhancements and labeling
- `admin:repo_hook` - Webhook management
- `user` - User information for authentication

### Creating a Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select required scopes based on your needs
4. Set expiration (recommend 90 days for security)
5. Generate and copy the token
6. Set as `GITHUB_TOKEN` environment variable

## Rate Limiting

The plugin automatically handles GitHub's rate limits:
- **5,000 requests/hour** for authenticated requests
- **Smart caching** reduces API calls by 60-80%
- **Request queuing** prevents rate limit exceeded errors
- **Automatic backoff** when limits are approached

## Error Handling

```javascript
try {
  const analysis = await github.analyzeRepository('owner', 'repo');
} catch (error) {
  if (error.message.includes('404')) {
    console.log('Repository not found or access denied');
  } else if (error.message.includes('rate limit')) {
    console.log('Rate limit exceeded, waiting...');
  } else {
    console.error('Analysis failed:', error.message);
  }
}
```

## Best Practices

### Performance Optimization
- Use `analysisDepth: 'basic'` for quick insights
- Set appropriate `timeRange` to limit data fetching
- Enable caching for repeated repository analysis
- Use concurrent requests judiciously to avoid rate limits

### Security Considerations
- Store GitHub tokens as environment variables
- Use webhook secrets for secure event processing
- Regularly rotate access tokens
- Monitor API usage to detect anomalies

### Integration Patterns
```javascript
// Batch analysis for multiple repositories
const repositories = ['owner/repo1', 'owner/repo2', 'owner/repo3'];
const analyses = await Promise.all(
  repositories.map(repo => {
    const [owner, name] = repo.split('/');
    return github.analyzeRepository(owner, name);
  })
);

// Health monitoring dashboard
const healthScores = analyses.map(analysis => ({
  repo: analysis.repository.full_name,
  score: analysis.health.score,
  grade: analysis.health.grade
}));
```

## Troubleshooting

### Common Issues

**Authentication Failed**
- Verify `GITHUB_TOKEN` is set correctly
- Check token hasn't expired
- Ensure token has required permissions

**Rate Limit Exceeded** 
- Reduce `maxConcurrentRequests`
- Increase `cacheTTL` for better caching
- Use `analysisDepth: 'basic'` for lighter requests

**Repository Not Found**
- Verify repository name and owner
- Check if repository is private and token has access
- Ensure repository exists and isn't archived

**Webhook Issues**
- Verify webhook URL is accessible
- Check webhook secret matches configuration
- Review webhook events in repository settings

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.