#!/usr/bin/env node

/** Upstream Sync Checker */
/** Monitors alignment with ruvnet/claude-flow and provides sync status */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

class UpstreamSyncChecker {
  constructor() {
    this.upstreamRemote = 'upstream';
    this.upstreamUrl = 'https://github.com/ruvnet/claude-flow.git';
    this.ourVersion = this.getOurVersion();
    this.lastSyncFile = '.last-sync';
  }

  getOurVersion() {
    try {
      const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
      return packageJson.version;
    } catch(error) {
      return 'unknown';
    }
  }

  execCommand(command, options = {}) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
    } catch(error) {
      throw error;
    }
  }

  async checkUpstreamStatus() {
    console.log('\n🔍 Checking upstream sync status...\n');
    
    try {
      // Check if upstream remote exists
      const remotes = this.execCommand('git remote -v', { silent: true });
      if (!remotes.includes(this.upstreamRemote)) {
        console.log('⚠️ Upstream remote not configured');
        console.log(`Run: git remote add ${this.upstreamRemote} ${this.upstreamUrl}`);
        return false;
      }

      // Fetch upstream changes
      console.log('📡 Fetching upstream changes...');
      this.execCommand(`git fetch ${this.upstreamRemote}`, { silent: true });

      // Compare versions
      console.log(`📦 Our version: ${this.ourVersion}`);
      
      // Get commit information
      const ourCommit = this.execCommand('git rev-parse HEAD', { silent: true }).trim();
      const upstreamCommit = this.execCommand(`git rev-parse ${this.upstreamRemote}/main`, { silent: true }).trim();
      
      console.log(`🔄 Our commit: ${ourCommit.substring(0, 8)}`);
      console.log(`🔄 Upstream commit: ${upstreamCommit.substring(0, 8)}`);

      if (ourCommit === upstreamCommit) {
        console.log('✅ Fully synchronized with upstream!');
        return true;
      } else {
        // Check how many commits behind
        try {
          const behindCount = this.execCommand(
            `git rev-list --count ${ourCommit}..${upstreamCommit}`, 
            { silent: true }
          ).trim();
          
          if (parseInt(behindCount) > 0) {
            console.log(`📊 ${behindCount} commits behind upstream`);
            console.log('📝 Recent upstream changes:');
            
            const recentCommits = this.execCommand(
              `git log --oneline -5 ${this.upstreamRemote}/main`,
              { silent: true }
            ).trim();
            
            recentCommits.split('\n').forEach(commit => {
              console.log(`   ${commit}`);
            });
          }
        } catch (error) {
          console.log('⚠️ Could not determine sync status');
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking upstream status:', error.message);
      return false;
    }
  }

  async generateSyncReport() {
    console.log('\n📋 Sync Report Generation');
    console.log('========================');
    
    const isSync = await this.checkUpstreamStatus();
    
    const report = {
      timestamp: new Date().toISOString(),
      ourVersion: this.ourVersion,
      synchronized: isSync,
      upstreamUrl: this.upstreamUrl
    };

    try {
      const fs = await import('node:fs/promises');
      await fs.writeFile('.sync-report.json', JSON.stringify(report, null, 2));
      console.log('\n📄 Sync report saved to .sync-report.json');
    } catch (error) {
      console.warn('⚠️ Could not save sync report:', error.message);
    }

    return report;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new UpstreamSyncChecker();
  checker.generateSyncReport()
    .then(report => {
      if (report.synchronized) {
        console.log('\n✅ Sync check completed successfully');
        process.exit(0);
      } else {
        console.log('\n⚠️ Sync issues detected - see report above');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Sync check failed:', error);
      process.exit(1);
    });
}

export { UpstreamSyncChecker };
export default UpstreamSyncChecker;