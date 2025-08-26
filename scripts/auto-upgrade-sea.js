#!/usr/bin/env node

/**
 * Automatic SEA Binary Upgrade System for Claude Code Zen
 * Handles downloading and updating SEA binaries automatically
 */

const { createWriteStream, existsSync, chmodSync, renameSync } = require('fs');
const { join } = require('path');
const { platform } = require('os');
const https = require('https');

class SEAUpgrader {
  constructor() {
    this.binDir = join(__dirname, '..', 'bin');
    this.githubRepo = 'zen-neural/claude-code-zen';
    this.platformBinary = this.getPlatformBinary();
  }

  getPlatformBinary() {
    const platformMap = {
      'linux': 'claude-zen-linux',
      'darwin': 'claude-zen-macos', 
      'win32': 'claude-zen-win.exe'
    };
    return platformMap[platform()] || 'claude-zen-linux';
  }

  async getLatestVersion() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${this.githubRepo}/releases/latest`,
        headers: { 'User-Agent': 'claude-code-zen-updater' }
      };

      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            resolve({
              version: release.tag_name,
              downloadUrl: release.assets.find(asset => 
                asset.name === this.platformBinary
              )?.browser_download_url
            });
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  async downloadBinary(downloadUrl, targetPath) {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(targetPath);
      
      https.get(downloadUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          return this.downloadBinary(response.headers.location, targetPath)
            .then(resolve)
            .catch(reject);
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          chmodSync(targetPath, 0o755); // Make executable
          resolve();
        });
      }).on('error', reject);
    });
  }

  async upgrade(force = false) {
    try {
      console.log('🔍 Checking for SEA binary updates...');
      
      const currentBinaryPath = join(this.binDir, this.platformBinary);
      const latest = await this.getLatestVersion();
      
      if (!latest.downloadUrl) {
        console.log('⚠️ No binary available for platform:', platform());
        return false;
      }

      if (!force && existsSync(currentBinaryPath)) {
        console.log('✅ Binary already exists. Use --force to update.');
        return false;
      }

      console.log(`📥 Downloading ${latest.version} binary...`);
      const tempPath = `${currentBinaryPath}.tmp`;
      
      await this.downloadBinary(latest.downloadUrl, tempPath);
      
      // Atomic rename
      if (existsSync(currentBinaryPath)) {
        renameSync(currentBinaryPath, `${currentBinaryPath}.backup`);
      }
      renameSync(tempPath, currentBinaryPath);
      
      console.log(`✅ Updated to ${latest.version}`);
      return true;
      
    } catch (error) {
      console.error('❌ Update failed:', error.message);
      return false;
    }
  }

  async checkAndUpgrade() {
    const currentBinaryPath = join(this.binDir, this.platformBinary);
    
    if (!existsSync(currentBinaryPath)) {
      console.log('⚡ No SEA binary found, downloading latest...');
      return await this.upgrade(true);
    }
    
    // Check periodically (e.g., once per day)
    const lastCheck = this.getLastCheckTime();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - lastCheck > oneDayMs) {
      console.log('🔄 Checking for updates (daily check)...');
      this.setLastCheckTime(now);
      return await this.upgrade();
    }
    
    return false;
  }

  getLastCheckTime() {
    try {
      const checkFile = join(this.binDir, '.last-check');
      if (existsSync(checkFile)) {
        return parseInt(require('fs').readFileSync(checkFile, 'utf8'));
      }
    } catch {}
    return 0;
  }

  setLastCheckTime(timestamp) {
    try {
      const checkFile = join(this.binDir, '.last-check');
      require('fs').writeFileSync(checkFile, timestamp.toString());
    } catch {}
  }
}

// CLI interface
if (require.main === module) {
  const upgrader = new SEAUpgrader();
  const force = process.argv.includes('--force');
  const check = process.argv.includes('--check');
  
  if (check) {
    upgrader.checkAndUpgrade();
  } else {
    upgrader.upgrade(force);
  }
}

module.exports = SEAUpgrader;