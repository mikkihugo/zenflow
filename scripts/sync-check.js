#!/usr/bin/env node

/**
 * Upstream Sync Checker
 * Monitors alignment with ruvnet/claude-flow and provides sync status
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

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
    } catch (error) {
      return 'unknown';
    }
  }

  execCommand(command, options = {}) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
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
    console.log('🔧 Setting up upstream remote...');
    
    // Check if upstream remote exists
    const remotes = this.execCommand('git remote -v', { silent: true });
    
    if (!remotes?.includes(this.upstreamRemote)) {
      console.log(`➕ Adding upstream remote: ${this.upstreamUrl}`);
      this.execCommand(`git remote add ${this.upstreamRemote} ${this.upstreamUrl}`);
    }
    
    // Fetch latest changes
    console.log('📡 Fetching upstream changes...');
    this.execCommand(`git fetch ${this.upstreamRemote}`, { silent: true });
  }

  getUpstreamVersion() {
    try {
      const packageJson = this.execCommand(`git show ${this.upstreamRemote}/main:package.json`, { silent: true });
      if (packageJson) {
        const parsed = JSON.parse(packageJson);
        return parsed.version;
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch upstream version');
    }
    return 'unknown';
  }

  getCommitsBehind() {
    try {
      const commits = this.execCommand(`git rev-list --count HEAD..${this.upstreamRemote}/main`, { silent: true });
      return parseInt(commits) || 0;
    } catch (error) {
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
      return commits ? commits.split('\n').filter(line => line.trim()) : [];
    } catch (error) {
      return [];
    }
  }

  getChangedFiles() {
    try {
      const files = this.execCommand(`git diff --name-only HEAD..${this.upstreamRemote}/main`, { silent: true });
      return files ? files.split('\n').filter(line => line.trim()) : [];
    } catch (error) {
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
      other: 0
    };

    recentCommits.forEach(commit => {
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

  calculateSyncStatus(commitsBehind, versionGap, recentCommits) {
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
        alpha: parseInt(match[4])
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
    console.log('\n📊 UPSTREAM SYNC REPORT');
    console.log('=' .repeat(50));
    
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
        gap: versionGap
      },
      sync: {
        commitsBehind: commitsBehind,
        status: syncStatus.status,
        priority: syncStatus.priority
      },
      recentActivity: {
        commitsLastWeek: recentCommits.length,
        changedFiles: changedFiles.length,
        analysis: analysis
      },
      recommendations: this.generateRecommendations(syncStatus, analysis, commitsBehind)
    };

    // Display report
    console.log(`\n🏷️  VERSIONS:`);
    console.log(`   Our Version:      ${report.versions.ours}`);
    console.log(`   Upstream Version: ${report.versions.upstream}`);
    console.log(`   Version Gap:      ${report.versions.gap} alpha releases`);
    
    console.log(`\n📈 SYNC STATUS: ${report.sync.status}`);
    console.log(`   Commits Behind:   ${report.sync.commitsBehind}`);
    console.log(`   Priority:         ${report.sync.priority.toUpperCase()}`);
    
    console.log(`\n📊 RECENT ACTIVITY (7 days):`);
    console.log(`   Total Commits:    ${report.recentActivity.commitsLastWeek}`);
    console.log(`   Files Changed:    ${report.recentActivity.changedFiles}`);
    console.log(`   Bug Fixes:        ${analysis.bugFixes}`);
    console.log(`   Features:         ${analysis.features}`);
    console.log(`   Security:         ${analysis.security}`);
    console.log(`   Performance:      ${analysis.performance}`);
    
    if (recentCommits.length > 0) {
      console.log(`\n📝 RECENT COMMITS:`);
      recentCommits.slice(0, 5).forEach(commit => {
        console.log(`   • ${commit}`);
      });
      if (recentCommits.length > 5) {
        console.log(`   ... and ${recentCommits.length - 5} more`);
      }
    }

    console.log(`\n💡 RECOMMENDATIONS:`);
    report.recommendations.forEach(rec => {
      console.log(`   ${rec.icon} ${rec.message}`);
    });

    // Save status
    this.saveSyncStatus(report);
    
    console.log(`\n📅 Next sync check: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    console.log('=' .repeat(50));
    
    return report;
  }

  generateRecommendations(syncStatus, analysis, commitsBehind) {
    const recommendations = [];

    if (syncStatus.priority === 'high') {
      recommendations.push({
        icon: '🚨',
        message: 'URGENT: Significant gap detected. Review and integrate critical changes.'
      });
    }

    if (analysis.security > 0) {
      recommendations.push({
        icon: '🔒',
        message: `${analysis.security} security update(s) available. Priority integration recommended.`
      });
    }

    if (analysis.bugFixes > 2) {
      recommendations.push({
        icon: '🐛',
        message: `${analysis.bugFixes} bug fixes available. Consider selective integration.`
      });
    }

    if (commitsBehind > 10) {
      recommendations.push({
        icon: '📦',
        message: 'Consider bulk integration or version alignment strategy.'
      });
    }

    if (commitsBehind === 0) {
      recommendations.push({
        icon: '✅',
        message: 'Fully synced! Monitor for new upstream changes.'
      });
    } else if (commitsBehind <= 5) {
      recommendations.push({
        icon: '👀',
        message: 'Good sync status. Continue weekly monitoring.'
      });
    }

    return recommendations;
  }

  saveSyncStatus(report) {
    try {
      writeFileSync(this.lastSyncFile, JSON.stringify(report, null, 2));
      console.log(`\n💾 Sync status saved to ${this.lastSyncFile}`);
    } catch (error) {
      console.warn('⚠️ Could not save sync status');
    }
  }

  quickStatus() {
    try {
      const status = JSON.parse(readFileSync(this.lastSyncFile, 'utf8'));
      const age = Math.floor((Date.now() - new Date(status.timestamp)) / (1000 * 60 * 60 * 24));
      
      console.log(`\n📊 QUICK SYNC STATUS (${age} days old):`);
      console.log(`   Status: ${status.sync.status}`);
      console.log(`   Commits Behind: ${status.sync.commitsBehind}`);
      console.log(`   Version Gap: ${status.versions.gap}`);
      
      if (age > 7) {
        console.log(`\n⚠️  Status is ${age} days old. Run 'npm run sync:check' for fresh data.`);
      }
    } catch (error) {
      console.log('\n❌ No sync status found. Run "npm run sync:check" first.');
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
  case 'report':
  case 'full':
  default:
    checker.generateReport();
    break;
}

export default UpstreamSyncChecker;