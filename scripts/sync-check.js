#!/usr/bin/env node

/**
 * Upstream Sync Checker
 * Monitors alignment with ruvnet/claude-flow and provides sync status
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

class UpstreamSyncChecker {
  constructor() {
    this.upstreamRemote = 'upstream';
    this.upstreamUrl = 'https://github.com/ruvnet/claude-flow.git';
    this.ourVersion = this.getOurVersion();
    this.lastSyncFile = './.sync-status.json';
  }

  getOurVersion() {
    try {
      const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
      return packageJson.version;
    } catch (_error) {
      return 'unknown';
    }
  }

  execCommand(command, options = {}) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options,
      }).trim();
    } catch (error) {
      if (!options.ignoreError) {
        console.error(`Command failed: ${command}`);
        console.error(error.message);
      }
      return null;
    }
  }

  setupUpstreamRemote() {
    console.warn('🔧 Setting up upstream remote...');

    // Check if upstream remote exists
    const remotes = this.execCommand('git remote -v', { silent: true });

    if (!remotes?.includes(this.upstreamRemote)) {
      console.warn(`➕ Adding upstream remote: ${this.upstreamUrl}`);
      this.execCommand(`git remote add ${this.upstreamRemote} ${this.upstreamUrl}`);
    }

    // Fetch latest changes
    console.warn('📡 Fetching upstream changes...');
    this.execCommand(`git fetch ${this.upstreamRemote}`, { silent: true });
  }

  getUpstreamVersion() {
    try {
      const packageJson = this.execCommand(`git show ${this.upstreamRemote}/main:package.json`, {
        silent: true,
      });
      if (packageJson) {
        const parsed = JSON.parse(packageJson);
        return parsed.version;
      }
    } catch (_error) {
      console.warn('⚠️ Could not fetch upstream version');
    }
    return 'unknown';
  }

  getCommitsBehind() {
    try {
      const commits = this.execCommand(`git rev-list --count HEAD..${this.upstreamRemote}/main`, {
        silent: true,
      });
      return parseInt(commits) || 0;
    } catch (_error) {
      return 0;
    }
  }

  getRecentUpstreamCommits(days = 7) {
    try {
      const since = `${days} days ago`;
      const commits = this.execCommand(
        `git log ${this.upstreamRemote}/main --since="${since}" --oneline`,
        { silent: true }
      );
      return commits ? commits.split('\n').filter((line) => line.trim()) : [];
    } catch (_error) {
      return [];
    }
  }

  getChangedFiles() {
    try {
      const files = this.execCommand(`git diff --name-only HEAD..${this.upstreamRemote}/main`, {
        silent: true,
      });
      return files ? files.split('\n').filter((line) => line.trim()) : [];
    } catch (_error) {
      return [];
    }
  }

  analyzeChanges(recentCommits) {
    const analysis = {
      bugFixes: 0,
      features: 0,
      security: 0,
      performance: 0,
      breaking: 0,
      other: 0,
    };

    recentCommits.forEach((commit) => {
      const lower = commit.toLowerCase();
      if (lower.includes('fix:') || lower.includes('bug') || lower.includes('error')) {
        analysis.bugFixes++;
      } else if (lower.includes('feat:') || lower.includes('feature')) {
        analysis.features++;
      } else if (lower.includes('security') || lower.includes('vuln')) {
        analysis.security++;
      } else if (lower.includes('perf:') || lower.includes('performance')) {
        analysis.performance++;
      } else if (lower.includes('breaking') || lower.includes('major')) {
        analysis.breaking++;
      } else {
        analysis.other++;
      }
    });

    return analysis;
  }

  calculateSyncStatus(commitsBehind, versionGap, _recentCommits) {
    // Determine sync status based on multiple factors
    if (commitsBehind === 0) {
      return { status: '🟢 SYNCED', priority: 'low' };
    } else if (commitsBehind <= 5 && versionGap <= 1) {
      return { status: '🟡 MONITORING', priority: 'medium' };
    } else if (commitsBehind <= 15 && versionGap <= 3) {
      return { status: '🟡 BEHIND', priority: 'medium' };
    } else {
      return { status: '🔴 ACTION_REQUIRED', priority: 'high' };
    }
  }

  parseVersion(version) {
    const match = version.match(/(\d+)\.(\d+)\.(\d+)-alpha\.(\d+)/);
    if (match) {
      return {
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
        alpha: parseInt(match[4]),
      };
    }
    return null;
  }

  calculateVersionGap(ourVersion, upstreamVersion) {
    const our = this.parseVersion(ourVersion);
    const upstream = this.parseVersion(upstreamVersion);

    if (!our || !upstream) return 0;

    // Focus on alpha version gap
    return Math.abs(upstream.alpha - our.alpha);
  }

  generateReport() {
    console.warn('\n📊 UPSTREAM SYNC REPORT');
    console.warn('='.repeat(50));

    this.setupUpstreamRemote();

    const upstreamVersion = this.getUpstreamVersion();
    const commitsBehind = this.getCommitsBehind();
    const recentCommits = this.getRecentUpstreamCommits();
    const changedFiles = this.getChangedFiles();
    const analysis = this.analyzeChanges(recentCommits);
    const versionGap = this.calculateVersionGap(this.ourVersion, upstreamVersion);
    const syncStatus = this.calculateSyncStatus(commitsBehind, versionGap, recentCommits);

    const report = {
      timestamp: new Date().toISOString(),
      versions: {
        ours: this.ourVersion,
        upstream: upstreamVersion,
        gap: versionGap,
      },
      sync: {
        commitsBehind: commitsBehind,
        status: syncStatus.status,
        priority: syncStatus.priority,
      },
      recentActivity: {
        commitsLastWeek: recentCommits.length,
        changedFiles: changedFiles.length,
        analysis: analysis,
      },
      recommendations: this.generateRecommendations(syncStatus, analysis, commitsBehind),
    };

    // Display report
    console.warn(`\n🏷️  VERSIONS:`);
    console.warn(`   Our Version:      ${report.versions.ours}`);
    console.warn(`   Upstream Version: ${report.versions.upstream}`);
    console.warn(`   Version Gap:      ${report.versions.gap} alpha releases`);

    console.warn(`\n📈 SYNC STATUS: ${report.sync.status}`);
    console.warn(`   Commits Behind:   ${report.sync.commitsBehind}`);
    console.warn(`   Priority:         ${report.sync.priority.toUpperCase()}`);

    console.warn(`\n📊 RECENT ACTIVITY (7 days):`);
    console.warn(`   Total Commits:    ${report.recentActivity.commitsLastWeek}`);
    console.warn(`   Files Changed:    ${report.recentActivity.changedFiles}`);
    console.warn(`   Bug Fixes:        ${analysis.bugFixes}`);
    console.warn(`   Features:         ${analysis.features}`);
    console.warn(`   Security:         ${analysis.security}`);
    console.warn(`   Performance:      ${analysis.performance}`);

    if (recentCommits.length > 0) {
      console.warn(`\n📝 RECENT COMMITS:`);
      recentCommits.slice(0, 5).forEach((commit) => {
        console.warn(`   • ${commit}`);
      });
      if (recentCommits.length > 5) {
        console.warn(`   ... and ${recentCommits.length - 5} more`);
      }
    }

    console.warn(`\n💡 RECOMMENDATIONS:`);
    report.recommendations.forEach((rec) => {
      console.warn(`   ${rec.icon} ${rec.message}`);
    });

    // Save status
    this.saveSyncStatus(report);

    console.warn(
      `\n📅 Next sync check: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
    );
    console.warn('='.repeat(50));

    return report;
  }

  generateRecommendations(syncStatus, analysis, commitsBehind) {
    const recommendations = [];

    if (syncStatus.priority === 'high') {
      recommendations.push({
        icon: '🚨',
        message: 'URGENT: Significant gap detected. Review and integrate critical changes.',
      });
    }

    if (analysis.security > 0) {
      recommendations.push({
        icon: '🔒',
        message: `${analysis.security} security update(s) available. Priority integration recommended.`,
      });
    }

    if (analysis.bugFixes > 2) {
      recommendations.push({
        icon: '🐛',
        message: `${analysis.bugFixes} bug fixes available. Consider selective integration.`,
      });
    }

    if (commitsBehind > 10) {
      recommendations.push({
        icon: '📦',
        message: 'Consider bulk integration or version alignment strategy.',
      });
    }

    if (commitsBehind === 0) {
      recommendations.push({
        icon: '✅',
        message: 'Fully synced! Monitor for new upstream changes.',
      });
    } else if (commitsBehind <= 5) {
      recommendations.push({
        icon: '👀',
        message: 'Good sync status. Continue weekly monitoring.',
      });
    }

    return recommendations;
  }

  saveSyncStatus(report) {
    try {
      writeFileSync(this.lastSyncFile, JSON.stringify(report, null, 2));
      console.warn(`\n💾 Sync status saved to ${this.lastSyncFile}`);
    } catch (_error) {
      console.warn('⚠️ Could not save sync status');
    }
  }

  quickStatus() {
    try {
      const status = JSON.parse(readFileSync(this.lastSyncFile, 'utf8'));
      const age = Math.floor((Date.now() - new Date(status.timestamp)) / (1000 * 60 * 60 * 24));

      console.warn(`\n📊 QUICK SYNC STATUS (${age} days old):`);
      console.warn(`   Status: ${status.sync.status}`);
      console.warn(`   Commits Behind: ${status.sync.commitsBehind}`);
      console.warn(`   Version Gap: ${status.versions.gap}`);

      if (age > 7) {
        console.warn(`\n⚠️  Status is ${age} days old. Run 'npm run sync:check' for fresh data.`);
      }
    } catch (_error) {
      console.warn('\n❌ No sync status found. Run "npm run sync:check" first.');
    }
  }
}

// CLI Interface
const command = process.argv[2];
const checker = new UpstreamSyncChecker();

switch (command) {
  case 'quick':
  case 'status':
    checker.quickStatus();
    break;
  default:
    checker.generateReport();
    break;
}

export default UpstreamSyncChecker;
