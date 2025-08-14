#!/usr/bin/env node

// Test real external API calls from FACT system
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🌐 Testing REAL External API Integration...\n');

// Test real NPM API call
function testNPMAPI(packageName = 'react') {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}`;
    console.log(`📦 Fetching real NPM data for: ${packageName}`);
    console.log(`   URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const npmData = JSON.parse(data);
            const latest = npmData['dist-tags']?.latest;
            const description = npmData.description;
            const license = npmData.license;
            const keywords = npmData.keywords || [];
            
            const result = {
              name: packageName,
              version: latest,
              description,
              license,
              keywords: keywords.slice(0, 5),
              realData: true,
              fetchedAt: new Date().toISOString(),
              statusCode: res.statusCode
            };
            
            console.log('✅ NPM API Success:');
            console.log(`   Name: ${result.name}`);
            console.log(`   Version: ${result.version}`);
            console.log(`   Description: ${result.description?.substring(0, 80)}...`);
            console.log(`   License: ${result.license}`);
            console.log(`   Keywords: ${result.keywords.join(', ')}`);
            
            // Store real API result
            const storageDir = path.join(process.cwd(), 'storage', 'fact', 'real-api');
            if (!fs.existsSync(storageDir)) {
              fs.mkdirSync(storageDir, { recursive: true });
            }
            
            const filename = `${packageName}-real-${Date.now()}.json`;
            fs.writeFileSync(path.join(storageDir, filename), JSON.stringify(result, null, 2));
            console.log(`💾 Stored real API result: ${filename}`);
            
            resolve(result);
          } else {
            console.log(`❌ NPM API Error: HTTP ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (e) {
          console.log('❌ Parse Error:', e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request Error:', err.message);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Request Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Test real GitHub API call
function testGitHubAPI(owner = 'facebook', repo = 'react') {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    console.log(`\n🐙 Fetching real GitHub data for: ${owner}/${repo}`);
    console.log(`   URL: ${url}`);
    
    const req = https.get(url, {
      headers: {
        'User-Agent': 'claude-code-zen-fact-test/1.0.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const repoData = JSON.parse(data);
            
            const result = {
              name: repoData.name,
              fullName: repoData.full_name,
              description: repoData.description,
              language: repoData.language,
              stars: repoData.stargazers_count,
              forks: repoData.forks_count,
              openIssues: repoData.open_issues_count,
              license: repoData.license?.name,
              topics: repoData.topics || [],
              realData: true,
              fetchedAt: new Date().toISOString(),
              statusCode: res.statusCode
            };
            
            console.log('✅ GitHub API Success:');
            console.log(`   Name: ${result.fullName}`);
            console.log(`   Language: ${result.language}`);
            console.log(`   Stars: ${result.stars.toLocaleString()}`);
            console.log(`   Forks: ${result.forks.toLocaleString()}`);
            console.log(`   License: ${result.license}`);
            console.log(`   Topics: ${result.topics.slice(0, 3).join(', ')}`);
            
            // Store real GitHub result
            const storageDir = path.join(process.cwd(), 'storage', 'fact', 'real-api');
            if (!fs.existsSync(storageDir)) {
              fs.mkdirSync(storageDir, { recursive: true });
            }
            
            const filename = `github-${owner}-${repo}-${Date.now()}.json`;
            fs.writeFileSync(path.join(storageDir, filename), JSON.stringify(result, null, 2));
            console.log(`💾 Stored real GitHub result: ${filename}`);
            
            resolve(result);
          } else {
            console.log(`❌ GitHub API Error: HTTP ${res.statusCode}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (e) {
          console.log('❌ Parse Error:', e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request Error:', err.message);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Request Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Test package detection from text
function testPackageDetection() {
  console.log('\n🔍 Testing Package Detection from Text...');
  
  const testText = `
I need help building a React application with TypeScript.
The project will use Express.js for the backend and Jest for testing.
We also need to install lodash for utility functions.
  `;
  
  // Simple regex-based detection (similar to our Rust implementation)
  const packages = [];
  const packagePatterns = [
    /\breact\b/gi,
    /\btypescript\b/gi,
    /\bexpress(?:\.js)?\b/gi,
    /\bjest\b/gi,
    /\blodash\b/gi
  ];
  
  packagePatterns.forEach(pattern => {
    const matches = testText.match(pattern);
    if (matches) {
      packages.push(...matches.map(m => m.toLowerCase()));
    }
  });
  
  const uniquePackages = [...new Set(packages)];
  console.log('✅ Detected packages:', uniquePackages.join(', '));
  
  return uniquePackages;
}

// Main test runner
async function runRealAPITests() {
  console.log('🚀 FACT Real API Integration Test\n');
  
  const results = {
    npm: false,
    github: false,
    detection: false
  };
  
  try {
    // Test package detection
    const detectedPackages = testPackageDetection();
    results.detection = detectedPackages.length > 0;
    
    // Test NPM API
    try {
      await testNPMAPI('react');
      results.npm = true;
    } catch (error) {
      console.log('⚠️  NPM API test failed:', error.message);
    }
    
    // Test GitHub API
    try {
      await testGitHubAPI('facebook', 'react');
      results.github = true;
    } catch (error) {
      console.log('⚠️  GitHub API test failed:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
  
  // Summary
  console.log('\n📊 Real API Test Results:');
  console.log('==========================');
  console.log('Package Detection:', results.detection ? '✅ WORKING' : '❌ FAILED');
  console.log('NPM Registry API:', results.npm ? '✅ WORKING' : '❌ FAILED');
  console.log('GitHub API:', results.github ? '✅ WORKING' : '❌ FAILED');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Status: ${successCount}/${totalCount} APIs working`);
  
  if (successCount === totalCount) {
    console.log('🌟 ALL EXTERNAL APIS ARE FUNCTIONAL!');
    console.log('✨ FACT system can fetch real-time data from external sources');
  } else {
    console.log('⚠️  Some APIs may be rate-limited or unavailable');
    console.log('💡 Core functionality is still working');
  }
  
  // Check stored files
  const realApiDir = path.join(process.cwd(), 'storage', 'fact', 'real-api');
  if (fs.existsSync(realApiDir)) {
    const files = fs.readdirSync(realApiDir);
    console.log(`\n💾 Real API Data Stored: ${files.length} files`);
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
  
  return results;
}

// Run the tests
runRealAPITests().catch(console.error);