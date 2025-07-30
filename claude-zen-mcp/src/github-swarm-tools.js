/*
 * MCP Tools for GitHub Swarm Integration
 *
 * This file provides MCP tools for interacting with GitHub-related swarm commands.
 * It wraps the `npx ruv-swarm github` commands to provide a consistent MCP interface.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function executeRuvSwarmCommand(command, args = []) {
  const commandString = `npx ruv-swarm github ${command} ${args.join(' ')}`;
  try {
    const { stdout, stderr } = await execAsync(commandString);
    if (stderr) {
      // Handle warnings or non-critical errors
      return { success: true, stdout, stderr };
    }
    return { success: true, stdout };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

export const githubSwarmTools = {
  github_review_init: {
    name: 'mcp__github__review_init',
    description: 'Initialize a code review swarm for a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        pr_data: { type: 'string', description: 'JSON string of PR data' },
        diff: { type: 'string', description: 'Diff of the pull request' },
        agents: { type: 'string', description: 'Comma-separated list of agents' },
        depth: { type: 'string', description: 'Review depth (e.g., comprehensive)' },
      },
      required: ['pr'],
    },
    async handler(args) {
      const cliArgs = [`review-init`, `--pr ${args.pr}`];
      if (args.pr_data) cliArgs.push(`--pr-data '${args.pr_data}'`);
      if (args.diff) cliArgs.push(`--diff '${args.diff}'`);
      if (args.agents) cliArgs.push(`--agents "${args.agents}"`);
      if (args.depth) cliArgs.push(`--depth ${args.depth}`);
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_security: {
    name: 'mcp__github__review_security',
    description: 'Run a security-focused review on a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        files: { type: 'string', description: 'Comma-separated list of files to review' },
        check: { type: 'string', description: 'Comma-separated list of security checks' },
        suggest_fixes: { type: 'boolean', description: 'Suggest fixes for found issues' },
      },
      required: ['pr', 'files'],
    },
    async handler(args) {
      const cliArgs = [`review-security`, `--pr ${args.pr}`, `--files "${args.files}"`];
      if (args.check) cliArgs.push(`--check "${args.check}"`);
      if (args.suggest_fixes) cliArgs.push('--suggest-fixes');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_performance: {
    name: 'mcp__github__review_performance',
    description: 'Run a performance-focused review on a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        profile: { type: 'string', description: 'Comma-separated list of aspects to profile' },
        benchmark_against: { type: 'string', description: 'Branch to benchmark against' },
        suggest_optimizations: { type: 'boolean', description: 'Suggest optimizations' },
      },
      required: ['pr'],
    },
    async handler(args) {
      const cliArgs = [`review-performance`, `--pr ${args.pr}`];
      if (args.profile) cliArgs.push(`--profile "${args.profile}"`);
      if (args.benchmark_against) cliArgs.push(`--benchmark-against ${args.benchmark_against}`);
      if (args.suggest_optimizations) cliArgs.push('--suggest-optimizations');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_architecture: {
    name: 'mcp__github__review_architecture',
    description: 'Run an architecture-focused review on a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        check: { type: 'string', description: 'Comma-separated list of architecture checks' },
        visualize_impact: { type: 'boolean', description: 'Visualize the impact of changes' },
        suggest_refactoring: { type: 'boolean', description: 'Suggest refactoring opportunities' },
      },
      required: ['pr'],
    },
    async handler(args) {
      const cliArgs = [`review-architecture`, `--pr ${args.pr}`];
      if (args.check) cliArgs.push(`--check "${args.check}"`);
      if (args.visualize_impact) cliArgs.push('--visualize-impact');
      if (args.suggest_refactoring) cliArgs.push('--suggest-refactoring');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_context: {
    name: 'mcp__github__review_context',
    description: 'Review a pull request with full context',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        load_related_prs: { type: 'boolean', description: 'Load related pull requests' },
        analyze_impact: { type: 'boolean', description: 'Analyze the impact of the changes' },
        check_breaking_changes: { type: 'boolean', description: 'Check for breaking changes' },
      },
      required: ['pr'],
    },
    async handler(args) {
      const cliArgs = [`review-context`, `--pr ${args.pr}`];
      if (args.load_related_prs) cliArgs.push('--load-related-prs');
      if (args.analyze_impact) cliArgs.push('--analyze-impact');
      if (args.check_breaking_changes) cliArgs.push('--check-breaking-changes');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_learn: {
    name: 'mcp__github__review_learn',
    description: 'Learn from past reviews to improve suggestions',
    inputSchema: {
      type: 'object',
      properties: {
        analyze_past_reviews: { type: 'boolean', description: 'Analyze past reviews' },
        identify_patterns: { type: 'boolean', description: 'Identify patterns in reviews' },
        improve_suggestions: {
          type: 'boolean',
          description: 'Improve suggestions based on learning',
        },
        reduce_false_positives: { type: 'boolean', description: 'Reduce false positives' },
      },
      required: [],
    },
    async handler(args) {
      const cliArgs = ['review-learn'];
      if (args.analyze_past_reviews) cliArgs.push('--analyze-past-reviews');
      if (args.identify_patterns) cliArgs.push('--identify-patterns');
      if (args.improve_suggestions) cliArgs.push('--improve-suggestions');
      if (args.reduce_false_positives) cliArgs.push('--reduce-false-positives');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_batch: {
    name: 'mcp__github__review_batch',
    description: 'Analyze related pull requests together',
    inputSchema: {
      type: 'object',
      properties: {
        prs: { type: 'string', description: 'Comma-separated list of pull request numbers' },
        check_consistency: { type: 'boolean', description: 'Check for consistency across PRs' },
        verify_integration: { type: 'boolean', description: 'Verify integration between PRs' },
        combined_impact: { type: 'boolean', description: 'Analyze the combined impact' },
      },
      required: ['prs'],
    },
    async handler(args) {
      const cliArgs = [`review-batch`, `--prs "${args.prs}"`];
      if (args.check_consistency) cliArgs.push('--check-consistency');
      if (args.verify_integration) cliArgs.push('--verify-integration');
      if (args.combined_impact) cliArgs.push('--combined-impact');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_comment: {
    name: 'mcp__github__review_comment',
    description: 'Generate contextual review comments',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        diff: { type: 'string', description: 'Diff of the pull request' },
        files: { type: 'string', description: 'JSON string of PR files' },
        style: { type: 'string', description: 'Comment style (e.g., constructive)' },
        include_examples: { type: 'boolean', description: 'Include code examples in comments' },
        suggest_fixes: { type: 'boolean', description: 'Suggest fixes for found issues' },
      },
      required: ['pr', 'diff', 'files'],
    },
    async handler(args) {
      const cliArgs = [
        `review-comment`,
        `--pr ${args.pr}`,
        `--diff '${args.diff}'`,
        `--files '${args.files}'`,
      ];
      if (args.style) cliArgs.push(`--style ${args.style}`);
      if (args.include_examples) cliArgs.push('--include-examples');
      if (args.suggest_fixes) cliArgs.push('--suggest-fixes');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_review_comments: {
    name: 'mcp__github__review_comments',
    description: 'Manage review comments efficiently',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        group_by: { type: 'string', description: 'Group comments by agent, severity, etc.' },
        summarize: { type: 'boolean', description: 'Summarize the comments' },
        resolve_outdated: { type: 'boolean', description: 'Resolve outdated comments' },
      },
      required: ['pr'],
    },
    async handler(args) {
      const cliArgs = [`review-comments`, `--pr ${args.pr}`];
      if (args.group_by) cliArgs.push(`--group-by "${args.group_by}"`);
      if (args.summarize) cliArgs.push('--summarize');
      if (args.resolve_outdated) cliArgs.push('--resolve-outdated');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_multi_repo_init: {
    name: 'mcp__github__multi_repo_init',
    description: 'Initialize a multi-repo swarm',
    inputSchema: {
      type: 'object',
      properties: {
        repo_details: { type: 'string', description: 'JSON string of repository details' },
        repos: { type: 'string', description: 'Comma-separated list of repositories' },
        topology: { type: 'string', description: 'Swarm topology' },
        shared_memory: { type: 'boolean', description: 'Use shared memory' },
        sync_strategy: { type: 'string', description: 'Synchronization strategy' },
      },
      required: ['repos'],
    },
    async handler(args) {
      const cliArgs = [`multi-repo-init`, `--repos "${args.repos}"`];
      if (args.repo_details) cliArgs.push(`--repo-details '${args.repo_details}'`);
      if (args.topology) cliArgs.push(`--topology ${args.topology}`);
      if (args.shared_memory) cliArgs.push('--shared-memory');
      if (args.sync_strategy) cliArgs.push(`--sync-strategy ${args.sync_strategy}`);
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_board_init: {
    name: 'mcp__github__board_init',
    description: 'Initialize a project board for swarm synchronization',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'GitHub project ID' },
        sync_mode: { type: 'string', description: 'Synchronization mode' },
        create_views: { type: 'string', description: 'Comma-separated list of views to create' },
      },
      required: ['project_id'],
    },
    async handler(args) {
      const cliArgs = [`board-init`, `--project-id "${args.project_id}"`];
      if (args.sync_mode) cliArgs.push(`--sync-mode ${args.sync_mode}`);
      if (args.create_views) cliArgs.push(`--create-views "${args.create_views}"`);
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_release_plan: {
    name: 'mcp__github__release_plan',
    description: 'Plan a new release by analyzing commits and pull requests',
    inputSchema: {
      type: 'object',
      properties: {
        commits: { type: 'string', description: 'JSON string of commits' },
        merged_prs: { type: 'string', description: 'JSON string of merged pull requests' },
        analyze_commits: { type: 'boolean', description: 'Analyze commits' },
        suggest_version: { type: 'boolean', description: 'Suggest a new version' },
        identify_breaking: { type: 'boolean', description: 'Identify breaking changes' },
        generate_timeline: { type: 'boolean', description: 'Generate a release timeline' },
      },
      required: ['commits', 'merged_prs'],
    },
    async handler(args) {
      const cliArgs = [
        `release-plan`,
        `--commits '${args.commits}'`,
        `--merged-prs '${args.merged_prs}'`,
      ];
      if (args.analyze_commits) cliArgs.push('--analyze-commits');
      if (args.suggest_version) cliArgs.push('--suggest-version');
      if (args.identify_breaking) cliArgs.push('--identify-breaking');
      if (args.generate_timeline) cliArgs.push('--generate-timeline');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_issue_to_swarm: {
    name: 'mcp__github__issue_to_swarm',
    description: 'Create a swarm from a GitHub issue',
    inputSchema: {
      type: 'object',
      properties: {
        issue_number: { type: 'number', description: 'Issue number' },
        issue_data: { type: 'string', description: 'JSON string of issue data' },
        auto_decompose: {
          type: 'boolean',
          description: 'Automatically decompose the issue into tasks',
        },
        assign_agents: { type: 'boolean', description: 'Automatically assign agents to the tasks' },
      },
      required: ['issue_number'],
    },
    async handler(args) {
      const cliArgs = [`issue-to-swarm`, `${args.issue_number}`];
      if (args.issue_data) cliArgs.push(`--issue-data '${args.issue_data}'`);
      if (args.auto_decompose) cliArgs.push('--auto-decompose');
      if (args.assign_agents) cliArgs.push('--assign-agents');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_pr_init: {
    name: 'mcp__github__pr_init',
    description: 'Initialize a swarm from a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        pr: { type: 'number', description: 'Pull request number' },
        auto_agents: { type: 'boolean', description: 'Automatically assign agents' },
        pr_data: { type: 'string', description: 'JSON string of PR data' },
        diff: { type: 'string', description: 'Diff of the pull request' },
        analyze_impact: { type: 'boolean', description: 'Analyze the impact of the changes' },
      },
      required: ['pr'],
    },
    async handler(args) {
      const cliArgs = [`pr-init`, `${args.pr}`];
      if (args.auto_agents) cliArgs.push('--auto-agents');
      if (args.pr_data) cliArgs.push(`--pr-data '${args.pr_data}'`);
      if (args.diff) cliArgs.push(`--diff '${args.diff}'`);
      if (args.analyze_impact) cliArgs.push('--analyze-impact');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },

  github_actions_analyze: {
    name: 'mcp__github__actions_analyze',
    description: 'Analyze changes and suggest tests for a GitHub Actions workflow',
    inputSchema: {
      type: 'object',
      properties: {
        commit: { type: 'string', description: 'Commit SHA to analyze' },
        suggest_tests: { type: 'boolean', description: 'Suggest tests to run' },
        optimize_pipeline: { type: 'boolean', description: 'Optimize the pipeline' },
      },
      required: ['commit'],
    },
    async handler(args) {
      const cliArgs = [`actions`, `analyze`, `--commit ${args.commit}`];
      if (args.suggest_tests) cliArgs.push('--suggest-tests');
      if (args.optimize_pipeline) cliArgs.push('--optimize-pipeline');
      return await executeRuvSwarmCommand('', cliArgs);
    },
  },
};
