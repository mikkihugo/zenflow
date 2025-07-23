/**
 * GitHub Integration Plugin
 * Advanced repository management, analysis, and automation
 */

export class GitHubIntegrationPlugin {
  constructor(config = {}) {
    this.config = {
      token: process.env.GITHUB_TOKEN,
      baseUrl: 'https://api.github.com',
      requestTimeout: 30000,
      cacheTTL: 300000, // 5 minutes
      maxConcurrentRequests: 10,
      analysisDepth: 'standard', // basic, standard, deep
      enableWebhooks: false,
      webhook: {
        secret: process.env.GITHUB_WEBHOOK_SECRET,
        events: ['push', 'pull_request', 'issues', 'release']
      },
      ...config
    };
    
    // Internal state
    this.cache = new Map();
    this.rateLimitInfo = null;
    this.requestQueue = [];
    this.activeRequests = 0;
  }

  async initialize() {
    console.log('🐙 GitHub Integration Plugin initialized');
    
    if (!this.config.token) {
      console.warn('⚠️ No GitHub token provided. Some features will be limited.');
      return;
    }
    
    // Test authentication
    try {
      const user = await this.makeRequest('/user');
      console.log(`🔑 Authenticated as: ${user.login} (${user.name})`);
      
      // Get rate limit info
      await this.updateRateLimitInfo();
      
    } catch (error) {
      console.error('❌ GitHub authentication failed:', error.message);
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  /**
   * Repository Analysis - Deep repository insights
   */
  async analyzeRepository(owner, repo, options = {}) {
    const analysisOptions = {
      includeIssues: true,
      includePRs: true,
      includeCommits: true,
      includeContributors: true,
      includeTechnology: true,
      includeHealth: true,
      timeRange: 90, // days
      ...options
    };

    console.log(`🔍 Analyzing repository: ${owner}/${repo}`);
    
    const analysis = {
      repository: await this.getRepository(owner, repo),
      timestamp: new Date().toISOString(),
      analysis_depth: this.config.analysisDepth,
      metrics: {}
    };

    // Basic repository information
    const repoData = analysis.repository;
    analysis.metrics.basic = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      open_issues: repoData.open_issues_count,
      size_kb: repoData.size,
      primary_language: repoData.language,
      created: repoData.created_at,
      updated: repoData.updated_at,
      archived: repoData.archived,
      private: repoData.private
    };

    // Technology stack analysis
    if (analysisOptions.includeTechnology) {
      analysis.technology = await this.analyzeTechnologyStack(owner, repo);
    }

    // Issue analysis
    if (analysisOptions.includeIssues) {
      analysis.issues = await this.analyzeIssues(owner, repo, analysisOptions.timeRange);
    }

    // Pull request analysis
    if (analysisOptions.includePRs) {
      analysis.pullRequests = await this.analyzePullRequests(owner, repo, analysisOptions.timeRange);
    }

    // Commit activity analysis
    if (analysisOptions.includeCommits) {
      analysis.commits = await this.analyzeCommitActivity(owner, repo, analysisOptions.timeRange);
    }

    // Contributor analysis
    if (analysisOptions.includeContributors) {
      analysis.contributors = await this.analyzeContributors(owner, repo);
    }

    // Repository health score
    if (analysisOptions.includeHealth) {
      analysis.health = this.calculateHealthScore(analysis);
    }

    return analysis;
  }

  /**
   * Technology Stack Analysis
   */
  async analyzeTechnologyStack(owner, repo) {
    try {
      // Get languages
      const languages = await this.makeRequest(`/repos/${owner}/${repo}/languages`);
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      
      const languagePercentages = {};
      for (const [lang, bytes] of Object.entries(languages)) {
        languagePercentages[lang] = ((bytes / totalBytes) * 100).toFixed(2);
      }

      // Get repository contents to analyze tech stack
      const contents = await this.getContents(owner, repo, '');
      const techStack = this.detectTechnologyStack(contents);

      return {
        languages: languagePercentages,
        primary_language: Object.keys(languagePercentages)[0],
        detected_frameworks: techStack.frameworks,
        build_tools: techStack.buildTools,
        package_managers: techStack.packageManagers,
        config_files: techStack.configFiles
      };
    } catch (error) {
      console.warn(`Failed to analyze technology stack: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Detect technology stack from repository contents
   */
  detectTechnologyStack(contents) {
    const frameworks = [];
    const buildTools = [];
    const packageManagers = [];
    const configFiles = [];

    const detectionRules = {
      'package.json': () => {
        packageManagers.push('npm');
        // Could parse package.json to detect frameworks
      },
      'yarn.lock': () => packageManagers.push('yarn'),
      'pnpm-lock.yaml': () => packageManagers.push('pnpm'),
      'Cargo.toml': () => packageManagers.push('cargo'),
      'requirements.txt': () => packageManagers.push('pip'),
      'Pipfile': () => packageManagers.push('pipenv'),
      'poetry.lock': () => packageManagers.push('poetry'),
      'go.mod': () => packageManagers.push('go modules'),
      'composer.json': () => packageManagers.push('composer'),
      'Dockerfile': () => buildTools.push('Docker'),
      'docker-compose.yml': () => buildTools.push('Docker Compose'),
      'Makefile': () => buildTools.push('Make'),
      'webpack.config.js': () => buildTools.push('Webpack'),
      'vite.config.js': () => buildTools.push('Vite'),
      'rollup.config.js': () => buildTools.push('Rollup'),
      'next.config.js': () => frameworks.push('Next.js'),
      'nuxt.config.js': () => frameworks.push('Nuxt.js'),
      'gatsby-config.js': () => frameworks.push('Gatsby'),
      'svelte.config.js': () => frameworks.push('Svelte'),
      '.eslintrc': () => configFiles.push('ESLint'),
      'tsconfig.json': () => configFiles.push('TypeScript'),
      'tailwind.config.js': () => frameworks.push('Tailwind CSS'),
      '.github': () => configFiles.push('GitHub Actions'),
      'ci.yml': () => configFiles.push('CI/CD')
    };

    for (const file of contents) {
      const fileName = file.name.toLowerCase();
      const rule = detectionRules[fileName] || detectionRules[file.name];
      if (rule) {
        rule();
      }
    }

    return {
      frameworks: [...new Set(frameworks)],
      buildTools: [...new Set(buildTools)],
      packageManagers: [...new Set(packageManagers)],
      configFiles: [...new Set(configFiles)]
    };
  }

  /**
   * Issue Analysis
   */
  async analyzeIssues(owner, repo, timeRangeDays = 90) {
    try {
      const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toISOString();
      
      // Get issues (both closed and open)
      const [openIssues, closedIssues] = await Promise.all([
        this.makeRequest(`/repos/${owner}/${repo}/issues?state=open&per_page=100`),
        this.makeRequest(`/repos/${owner}/${repo}/issues?state=closed&since=${since}&per_page=100`)
      ]);

      const allIssues = [...openIssues, ...closedIssues.filter(issue => !issue.pull_request)];
      
      // Analyze patterns
      const labels = {};
      const authors = {};
      let avgCloseTime = 0;
      let closedCount = 0;

      for (const issue of allIssues) {
        // Count labels
        for (const label of issue.labels) {
          labels[label.name] = (labels[label.name] || 0) + 1;
        }
        
        // Count authors
        authors[issue.user.login] = (authors[issue.user.login] || 0) + 1;
        
        // Calculate average close time
        if (issue.state === 'closed' && issue.closed_at) {
          const created = new Date(issue.created_at);
          const closed = new Date(issue.closed_at);
          avgCloseTime += (closed - created);
          closedCount++;
        }
      }

      const avgCloseTimeHours = closedCount > 0 ? 
        (avgCloseTime / closedCount) / (1000 * 60 * 60) : 0;

      return {
        total_issues: allIssues.length,
        open_issues: openIssues.length,
        closed_issues: closedIssues.length,
        avg_close_time_hours: Math.round(avgCloseTimeHours),
        most_common_labels: Object.entries(labels)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        top_reporters: Object.entries(authors)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        resolution_rate: closedCount / allIssues.length
      };
    } catch (error) {
      console.warn(`Failed to analyze issues: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Pull Request Analysis
   */
  async analyzePullRequests(owner, repo, timeRangeDays = 90) {
    try {
      const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toISOString();
      
      const [openPRs, closedPRs] = await Promise.all([
        this.makeRequest(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`),
        this.makeRequest(`/repos/${owner}/${repo}/pulls?state=closed&since=${since}&per_page=100`)
      ]);

      const allPRs = [...openPRs, ...closedPRs];
      
      let avgMergeTime = 0;
      let mergedCount = 0;
      const authors = {};
      const sizes = { small: 0, medium: 0, large: 0 };

      for (const pr of allPRs) {
        // Count authors
        authors[pr.user.login] = (authors[pr.user.login] || 0) + 1;
        
        // Calculate merge time
        if (pr.merged_at) {
          const created = new Date(pr.created_at);
          const merged = new Date(pr.merged_at);
          avgMergeTime += (merged - created);
          mergedCount++;
        }
        
        // Categorize by size (rough estimation)
        const additions = pr.additions || 0;
        const deletions = pr.deletions || 0;
        const totalChanges = additions + deletions;
        
        if (totalChanges < 100) sizes.small++;
        else if (totalChanges < 500) sizes.medium++;
        else sizes.large++;
      }

      const avgMergeTimeHours = mergedCount > 0 ? 
        (avgMergeTime / mergedCount) / (1000 * 60 * 60) : 0;

      return {
        total_prs: allPRs.length,
        open_prs: openPRs.length,
        merged_prs: mergedCount,
        avg_merge_time_hours: Math.round(avgMergeTimeHours),
        top_contributors: Object.entries(authors)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        size_distribution: sizes,
        merge_rate: mergedCount / allPRs.length
      };
    } catch (error) {
      console.warn(`Failed to analyze pull requests: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Commit Activity Analysis
   */
  async analyzeCommitActivity(owner, repo, timeRangeDays = 90) {
    try {
      const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toISOString();
      
      const commits = await this.makeRequest(
        `/repos/${owner}/${repo}/commits?since=${since}&per_page=100`
      );

      const authors = {};
      const dailyActivity = {};
      const hourlyActivity = new Array(24).fill(0);

      for (const commit of commits) {
        const author = commit.commit.author.name;
        authors[author] = (authors[author] || 0) + 1;
        
        const date = new Date(commit.commit.author.date);
        const day = date.toISOString().split('T')[0];
        const hour = date.getHours();
        
        dailyActivity[day] = (dailyActivity[day] || 0) + 1;
        hourlyActivity[hour]++;
      }

      return {
        total_commits: commits.length,
        unique_authors: Object.keys(authors).length,
        most_active_authors: Object.entries(authors)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        daily_activity: dailyActivity,
        peak_hour: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
        avg_commits_per_day: commits.length / timeRangeDays
      };
    } catch (error) {
      console.warn(`Failed to analyze commit activity: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Contributor Analysis
   */
  async analyzeContributors(owner, repo) {
    try {
      const contributors = await this.makeRequest(`/repos/${owner}/${repo}/contributors?per_page=100`);
      
      const analysis = {
        total_contributors: contributors.length,
        top_contributors: contributors.slice(0, 10).map(contributor => ({
          username: contributor.login,
          contributions: contributor.contributions,
          profile_url: contributor.html_url
        }))
      };

      // Calculate contribution distribution
      const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
      analysis.contribution_distribution = {
        top_10_percent: contributors.slice(0, Math.ceil(contributors.length * 0.1))
          .reduce((sum, c) => sum + c.contributions, 0) / totalContributions,
        bus_factor: contributors.slice(0, 3).reduce((sum, c) => sum + c.contributions, 0) / totalContributions
      };

      return analysis;
    } catch (error) {
      console.warn(`Failed to analyze contributors: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Calculate Repository Health Score
   */
  calculateHealthScore(analysis) {
    let score = 0;
    const factors = [];

    // Documentation (README, etc.)
    if (analysis.repository.has_wiki || analysis.repository.description) {
      score += 20;
      factors.push('Has documentation');
    }

    // Activity level
    const daysSinceUpdate = (Date.now() - new Date(analysis.repository.updated_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += 20;
      factors.push('Recently active');
    } else if (daysSinceUpdate < 90) {
      score += 10;
      factors.push('Moderately active');
    }

    // Issue management
    if (analysis.issues && analysis.issues.resolution_rate > 0.7) {
      score += 15;
      factors.push('Good issue resolution');
    }

    // Pull request management
    if (analysis.pullRequests && analysis.pullRequests.merge_rate > 0.8) {
      score += 15;
      factors.push('Good PR merge rate');
    }

    // Community engagement
    if (analysis.repository.stargazers_count > 10) {
      score += 10;
      factors.push('Community interest');
    }

    // Contributor diversity
    if (analysis.contributors && analysis.contributors.total_contributors > 5) {
      score += 10;
      factors.push('Multiple contributors');
    }

    // License
    if (analysis.repository.license) {
      score += 10;
      factors.push('Has license');
    }

    return {
      score: Math.min(score, 100),
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      factors
    };
  }

  /**
   * Enhanced Pull Request Management
   */
  async enhancePullRequest(owner, repo, prNumber, options = {}) {
    const enhancementOptions = {
      addTests: false,
      improveDocs: false,
      performanceCheck: false,
      securityCheck: false,
      addReviewers: [],
      addLabels: [],
      ...options
    };

    console.log(`🔧 Enhancing PR #${prNumber} in ${owner}/${repo}`);

    const pr = await this.makeRequest(`/repos/${owner}/${repo}/pulls/${prNumber}`);
    const enhancements = [];

    // Get PR files for analysis
    const files = await this.makeRequest(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    
    // Analyze changes
    const analysis = this.analyzePRChanges(files);
    
    const suggestions = [];

    // Test coverage suggestions
    if (enhancementOptions.addTests && analysis.hasCodeChanges && !analysis.hasTestChanges) {
      suggestions.push({
        type: 'testing',
        severity: 'medium',
        message: 'Consider adding tests for new code changes',
        files: analysis.codeFiles
      });
    }

    // Documentation suggestions
    if (enhancementOptions.improveDocs && analysis.hasPublicAPI && !analysis.hasDocChanges) {
      suggestions.push({
        type: 'documentation',
        severity: 'low',
        message: 'Consider updating documentation for API changes',
        files: analysis.publicAPIFiles
      });
    }

    // Security check
    if (enhancementOptions.securityCheck) {
      const securityIssues = this.detectSecurityIssues(files);
      suggestions.push(...securityIssues);
    }

    // Add reviewers if specified
    if (enhancementOptions.addReviewers.length > 0) {
      try {
        await this.makeRequest(`/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`, {
          method: 'POST',
          body: { reviewers: enhancementOptions.addReviewers }
        });
        enhancements.push('Added reviewers');
      } catch (error) {
        console.warn(`Failed to add reviewers: ${error.message}`);
      }
    }

    // Add labels if specified
    if (enhancementOptions.addLabels.length > 0) {
      try {
        await this.makeRequest(`/repos/${owner}/${repo}/issues/${prNumber}/labels`, {
          method: 'POST',
          body: { labels: enhancementOptions.addLabels }
        });
        enhancements.push('Added labels');
      } catch (error) {
        console.warn(`Failed to add labels: ${error.message}`);
      }
    }

    return {
      pr_number: prNumber,
      enhancements_applied: enhancements,
      suggestions,
      analysis,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze PR changes to provide intelligent suggestions
   */
  analyzePRChanges(files) {
    const analysis = {
      hasCodeChanges: false,
      hasTestChanges: false,
      hasDocChanges: false,
      hasPublicAPI: false,
      codeFiles: [],
      testFiles: [],
      publicAPIFiles: [],
      totalAdditions: 0,
      totalDeletions: 0
    };

    for (const file of files) {
      analysis.totalAdditions += file.additions;
      analysis.totalDeletions += file.deletions;

      const filename = file.filename.toLowerCase();
      
      // Detect code files
      if (filename.match(/\.(js|jsx|ts|tsx|py|java|go|rust|rb|php|cs)$/)) {
        analysis.hasCodeChanges = true;
        analysis.codeFiles.push(file.filename);
        
        // Check for public API changes
        if (file.patch && file.patch.includes('export') || file.patch.includes('public')) {
          analysis.hasPublicAPI = true;
          analysis.publicAPIFiles.push(file.filename);
        }
      }
      
      // Detect test files
      if (filename.match(/\.(test|spec)\.|test\/|spec\/|__tests__\//)) {
        analysis.hasTestChanges = true;
        analysis.testFiles.push(file.filename);
      }
      
      // Detect documentation files
      if (filename.match(/\.(md|rst|txt)$|readme|changelog|docs?\//)) {
        analysis.hasDocChanges = true;
      }
    }

    return analysis;
  }

  /**
   * Detect potential security issues in PR
   */
  detectSecurityIssues(files) {
    const issues = [];
    
    const securityPatterns = [
      { pattern: /password\s*=\s*["'][^"']+["']/i, severity: 'high', message: 'Potential hardcoded password' },
      { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/i, severity: 'high', message: 'Potential API key exposure' },
      { pattern: /secret\s*=\s*["'][^"']+["']/i, severity: 'medium', message: 'Potential secret exposure' },
      { pattern: /eval\s*\(/i, severity: 'high', message: 'Use of eval() function' },
      { pattern: /innerHTML\s*=/i, severity: 'medium', message: 'Potential XSS vulnerability' },
      { pattern: /\.exec\s*\(/i, severity: 'medium', message: 'Command execution detected' }
    ];

    for (const file of files) {
      if (!file.patch) continue;
      
      for (const { pattern, severity, message } of securityPatterns) {
        if (pattern.test(file.patch)) {
          issues.push({
            type: 'security',
            severity,
            message,
            file: file.filename,
            line: 'unknown' // Could be enhanced to find exact line
          });
        }
      }
    }

    return issues;
  }

  /**
   * Issue Intelligence and Triage
   */
  async triageIssue(owner, repo, issueNumber, options = {}) {
    const triageOptions = {
      autoLabel: true,
      assignRecommendations: true,
      priorityAssessment: true,
      duplicateDetection: true,
      ...options
    };

    console.log(`🎯 Triaging issue #${issueNumber} in ${owner}/${repo}`);

    const issue = await this.makeRequest(`/repos/${owner}/${repo}/issues/${issueNumber}`);
    const triage = {
      issue_number: issueNumber,
      title: issue.title,
      body: issue.body,
      current_labels: issue.labels.map(l => l.name),
      recommendations: {}
    };

    // Analyze issue content
    const analysis = this.analyzeIssueContent(issue.title, issue.body);

    // Auto-labeling suggestions
    if (triageOptions.autoLabel) {
      triage.recommendations.suggested_labels = this.suggestLabels(analysis);
    }

    // Priority assessment
    if (triageOptions.priorityAssessment) {
      triage.recommendations.priority = this.assessPriority(analysis, issue);
    }

    // Assignment recommendations
    if (triageOptions.assignRecommendations) {
      const contributors = await this.analyzeContributors(owner, repo);
      triage.recommendations.suggested_assignees = this.suggestAssignees(analysis, contributors);
    }

    // Duplicate detection
    if (triageOptions.duplicateDetection) {
      const recentIssues = await this.makeRequest(`/repos/${owner}/${repo}/issues?state=all&per_page=50`);
      triage.recommendations.potential_duplicates = this.findPotentialDuplicates(issue, recentIssues);
    }

    return triage;
  }

  /**
   * Analyze issue content for intelligent classification
   */
  analyzeIssueContent(title, body) {
    const text = `${title} ${body || ''}`.toLowerCase();
    
    const analysis = {
      type: 'unknown',
      complexity: 'medium',
      keywords: [],
      sentiment: 'neutral',
      urgency_indicators: []
    };

    // Issue type detection
    const typePatterns = {
      bug: /bug|error|crash|fail|broken|not work/i,
      feature: /feature|enhance|improve|add|new|would like/i,
      documentation: /doc|readme|example|guide|explain/i,
      question: /question|how|why|help|support/i,
      performance: /slow|performance|speed|optimize|memory/i,
      security: /security|vulnerability|exploit|injection/i
    };

    for (const [type, pattern] of Object.entries(typePatterns)) {
      if (pattern.test(text)) {
        analysis.type = type;
        break;
      }
    }

    // Complexity assessment
    const complexityIndicators = {
      high: /architecture|design|refactor|breaking change|major/i,
      low: /typo|spelling|simple|quick|minor/i
    };

    for (const [level, pattern] of Object.entries(complexityIndicators)) {
      if (pattern.test(text)) {
        analysis.complexity = level;
        break;
      }
    }

    // Urgency detection
    const urgencyPatterns = [
      /urgent|critical|blocker|asap/i,
      /production|live|customer/i,
      /security|vulnerability/i
    ];

    for (const pattern of urgencyPatterns) {
      if (pattern.test(text)) {
        analysis.urgency_indicators.push(pattern.source);
      }
    }

    return analysis;
  }

  /**
   * Suggest appropriate labels based on issue analysis
   */
  suggestLabels(analysis) {
    const labels = [];
    
    // Type-based labels
    const typeLabels = {
      bug: ['bug', 'needs-investigation'],
      feature: ['enhancement', 'feature-request'],
      documentation: ['documentation'],
      question: ['question', 'help-wanted'],
      performance: ['performance', 'optimization'],
      security: ['security', 'critical']
    };

    if (typeLabels[analysis.type]) {
      labels.push(...typeLabels[analysis.type]);
    }

    // Complexity labels
    if (analysis.complexity === 'high') {
      labels.push('complex');
    } else if (analysis.complexity === 'low') {
      labels.push('good-first-issue');
    }

    // Urgency labels
    if (analysis.urgency_indicators.length > 0) {
      labels.push('priority-high');
    }

    return [...new Set(labels)];
  }

  /**
   * Assess issue priority
   */
  assessPriority(analysis, issue) {
    let score = 0;
    const factors = [];

    // Type-based scoring
    const typeScores = {
      security: 40,
      bug: 20,
      performance: 15,
      feature: 10,
      documentation: 5,
      question: 2
    };

    score += typeScores[analysis.type] || 0;
    factors.push(`Type: ${analysis.type}`);

    // Urgency indicators
    score += analysis.urgency_indicators.length * 15;
    if (analysis.urgency_indicators.length > 0) {
      factors.push('Has urgency indicators');
    }

    // Community engagement (reactions, comments)
    const reactions = Object.values(issue.reactions || {}).reduce((sum, count) => sum + count, 0);
    if (reactions > 5) {
      score += 10;
      factors.push('High community interest');
    }

    // Age of issue
    const ageInDays = (Date.now() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24);
    if (ageInDays > 30) {
      score += 5;
      factors.push('Long-standing issue');
    }

    // Determine priority level
    let priority = 'low';
    if (score >= 50) priority = 'critical';
    else if (score >= 30) priority = 'high';
    else if (score >= 15) priority = 'medium';

    return {
      priority,
      score,
      factors
    };
  }

  /**
   * Suggest assignees based on expertise and availability
   */
  suggestAssignees(analysis, contributors) {
    // Simple implementation - could be enhanced with ML
    const suggestions = [];
    
    if (contributors.top_contributors) {
      // Suggest top contributors for complex issues
      if (analysis.complexity === 'high') {
        suggestions.push(contributors.top_contributors[0].username);
      }
      
      // Random assignment for simple issues
      if (analysis.complexity === 'low' && contributors.top_contributors.length > 2) {
        suggestions.push(contributors.top_contributors[2].username);
      }
    }

    return suggestions.slice(0, 2); // Max 2 suggestions
  }

  /**
   * Find potential duplicate issues
   */
  findPotentialDuplicates(currentIssue, recentIssues) {
    const duplicates = [];
    const currentTitle = currentIssue.title.toLowerCase();
    
    for (const issue of recentIssues) {
      if (issue.number === currentIssue.number) continue;
      
      const similarity = this.calculateSimilarity(currentTitle, issue.title.toLowerCase());
      if (similarity > 0.7) {
        duplicates.push({
          issue_number: issue.number,
          title: issue.title,
          similarity_score: similarity,
          url: issue.html_url
        });
      }
    }

    return duplicates.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 3);
  }

  /**
   * Simple string similarity calculation
   */
  calculateSimilarity(str1, str2) {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  /**
   * Webhook Management
   */
  async setupWebhooks(owner, repo, webhookUrl, options = {}) {
    if (!this.config.enableWebhooks) {
      throw new Error('Webhooks are disabled in configuration');
    }

    const webhookConfig = {
      url: webhookUrl,
      content_type: 'json',
      secret: this.config.webhook.secret,
      insecure_ssl: options.insecureSSL || false
    };

    const webhook = await this.makeRequest(`/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      body: {
        name: 'web',
        active: true,
        events: options.events || this.config.webhook.events,
        config: webhookConfig
      }
    });

    console.log(`🔗 Webhook created for ${owner}/${repo}: ${webhook.id}`);
    return webhook;
  }

  /**
   * Core GitHub API Methods
   */
  async getRepository(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  async getContents(owner, repo, path) {
    try {
      return await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`);
    } catch (error) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  async makeRequest(endpoint, options = {}) {
    // Rate limiting
    await this.waitForRateLimit();
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Claude-Zen-GitHub-Integration/1.0',
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: this.config.requestTimeout
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    // Check cache first
    const cacheKey = `${options.method || 'GET'}:${endpoint}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTTL) {
        return cached.data;
      }
    }

    try {
      this.activeRequests++;
      const response = await fetch(url, requestOptions);
      
      // Update rate limit info from headers
      this.updateRateLimitFromHeaders(response.headers);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the response (only for GET requests)
      if (!options.method || options.method === 'GET') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } finally {
      this.activeRequests--;
    }
  }

  async waitForRateLimit() {
    if (!this.rateLimitInfo) return;
    
    const { remaining, reset } = this.rateLimitInfo;
    if (remaining <= 10) { // Conservative threshold
      const waitTime = reset * 1000 - Date.now() + 1000; // Add 1s buffer
      if (waitTime > 0) {
        console.log(`⏳ Rate limit approaching, waiting ${Math.ceil(waitTime / 1000)}s`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  updateRateLimitFromHeaders(headers) {
    this.rateLimitInfo = {
      limit: parseInt(headers.get('x-ratelimit-limit')) || 5000,
      remaining: parseInt(headers.get('x-ratelimit-remaining')) || 5000,
      reset: parseInt(headers.get('x-ratelimit-reset')) || Date.now() / 1000 + 3600
    };
  }

  async updateRateLimitInfo() {
    try {
      const rateLimitData = await this.makeRequest('/rate_limit');
      this.rateLimitInfo = rateLimitData.rate;
      console.log(`📊 Rate limit: ${this.rateLimitInfo.remaining}/${this.rateLimitInfo.limit} remaining`);
    } catch (error) {
      console.warn('Failed to get rate limit info:', error.message);
    }
  }

  /**
   * Utility Methods
   */
  async getStats() {
    return {
      cache_size: this.cache.size,
      active_requests: this.activeRequests,
      rate_limit: this.rateLimitInfo,
      authentication: !!this.config.token,
      webhooks_enabled: this.config.enableWebhooks
    };
  }

  async cleanup() {
    this.cache.clear();
    console.log('🐙 GitHub Integration Plugin cleaned up');
  }
}

export default GitHubIntegrationPlugin;