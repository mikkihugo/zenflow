#!/usr/bin/env node

// Test bulk package detection and downloading from package.json
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('📦 Testing BULK Package Download from package.json...\n');

// Mock a realistic package.json
const mockPackageJson = {
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "express": "^4.18.0",
    "lodash": "^4.17.21",
    "axios": "^1.6.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0"
  }
};

// Rate limiting to be nice to NPM API
const RATE_LIMIT_DELAY = 200; // 200ms between requests

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Download single package data
function downloadPackageData(packageName) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}`;
    console.log(`   📥 Downloading: ${packageName}...`);
    
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
            const dependencies = npmData.versions?.[latest]?.dependencies || {};
            const devDependencies = npmData.versions?.[latest]?.devDependencies || {};
            
            const result = {
              name: packageName,
              version: latest,
              description: npmData.description?.substring(0, 100) + '...',
              license: npmData.license,
              dependencies: Object.keys(dependencies),
              devDependencies: Object.keys(devDependencies),
              dependencyCount: Object.keys(dependencies).length,
              weeklyDownloads: null, // Would need separate API call
              realData: true,
              fetchedAt: new Date().toISOString()
            };
            
            console.log(`   ✅ ${packageName} v${latest} (${result.dependencyCount} deps)`);
            resolve(result);
          } else {
            console.log(`   ❌ ${packageName}: HTTP ${res.statusCode}`);
            resolve({ name: packageName, error: `HTTP ${res.statusCode}`, realData: false });
          }
        } catch (e) {
          console.log(`   ❌ ${packageName}: Parse error`);
          resolve({ name: packageName, error: e.message, realData: false });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ ${packageName}: ${err.message}`);
      resolve({ name: packageName, error: err.message, realData: false });
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ ${packageName}: Timeout`);
      req.destroy();
      resolve({ name: packageName, error: 'Timeout', realData: false });
    });
  });
}

// Process all packages with rate limiting
async function downloadAllPackages(packageJson) {
  console.log('🔍 Detected packages in package.json:');
  
  const allPackages = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const packageNames = Object.keys(allPackages);
  console.log(`   Total packages: ${packageNames.length}`);
  console.log(`   Dependencies: ${Object.keys(packageJson.dependencies).length}`);
  console.log(`   DevDependencies: ${Object.keys(packageJson.devDependencies).length}`);
  console.log('');
  
  const results = [];
  const storageDir = path.join(process.cwd(), 'storage', 'fact', 'bulk-download');
  
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  console.log('📥 Downloading package data (with rate limiting)...');
  
  for (let i = 0; i < packageNames.length; i++) {
    const packageName = packageNames[i];
    const versionConstraint = allPackages[packageName];
    
    console.log(`[${i + 1}/${packageNames.length}] Processing ${packageName}${versionConstraint}`);
    
    try {
      const packageData = await downloadPackageData(packageName);
      results.push(packageData);
      
      // Store individual package data
      if (packageData.realData) {
        const filename = `${packageName.replace('/', '-')}-${Date.now()}.json`;
        fs.writeFileSync(path.join(storageDir, filename), JSON.stringify(packageData, null, 2));
      }
      
      // Rate limiting delay
      if (i < packageNames.length - 1) {
        await delay(RATE_LIMIT_DELAY);
      }
    } catch (error) {
      console.log(`   ❌ Error processing ${packageName}:`, error.message);
      results.push({ name: packageName, error: error.message, realData: false });
    }
  }
  
  return results;
}

// Analyze download results
function analyzeResults(results) {
  const successful = results.filter(r => r.realData);
  const failed = results.filter(r => !r.realData);
  
  console.log('\n📊 Bulk Download Analysis:');
  console.log('==========================');
  console.log(`✅ Successful downloads: ${successful.length}`);
  console.log(`❌ Failed downloads: ${failed.length}`);
  console.log(`📈 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
  
  if (successful.length > 0) {
    console.log('\n🎯 Successfully Downloaded Packages:');
    successful.forEach(pkg => {
      console.log(`   • ${pkg.name} v${pkg.version} (${pkg.dependencyCount} deps)`);
    });
    
    // Calculate total dependencies discovered
    const totalDeps = successful.reduce((sum, pkg) => sum + pkg.dependencyCount, 0);
    console.log(`\n🔍 Total Dependencies Discovered: ${totalDeps}`);
    console.log('   (These could be downloaded recursively!)');
  }
  
  if (failed.length > 0) {
    console.log('\n⚠️  Failed Downloads:');
    failed.forEach(pkg => {
      console.log(`   • ${pkg.name}: ${pkg.error}`);
    });
  }
  
  // Storage summary
  const storageDir = path.join(process.cwd(), 'storage', 'fact', 'bulk-download');
  if (fs.existsSync(storageDir)) {
    const files = fs.readdirSync(storageDir);
    console.log(`\n💾 Files stored: ${files.length}`);
    
    // Calculate total storage size
    let totalSize = 0;
    files.forEach(file => {
      const filePath = path.join(storageDir, file);
      totalSize += fs.statSync(filePath).size;
    });
    
    console.log(`💾 Total storage: ${(totalSize / 1024).toFixed(1)} KB`);
  }
}

// Create comprehensive package manifest
function createPackageManifest(results, packageJson) {
  const manifest = {
    projectName: packageJson.name,
    projectVersion: packageJson.version,
    analysisDate: new Date().toISOString(),
    totalPackages: results.length,
    successfulDownloads: results.filter(r => r.realData).length,
    packages: results,
    summary: {
      totalDependencies: Object.keys(packageJson.dependencies).length,
      totalDevDependencies: Object.keys(packageJson.devDependencies).length,
      uniqueLicenses: [...new Set(results.filter(r => r.license).map(r => r.license))],
      totalTransitiveDependencies: results.reduce((sum, pkg) => sum + (pkg.dependencyCount || 0), 0)
    }
  };
  
  const manifestPath = path.join(process.cwd(), 'storage', 'fact', 'package-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Package manifest created: package-manifest.json`);
  
  return manifest;
}

// Main test runner
async function testBulkPackageDownload() {
  console.log('🚀 FACT Bulk Package Download Test\n');
  
  try {
    // Step 1: Parse package.json (this would come from file in real usage)
    console.log('📄 Mock package.json:');
    console.log(JSON.stringify(mockPackageJson, null, 2));
    console.log('');
    
    // Step 2: Download all package data
    const results = await downloadAllPackages(mockPackageJson);
    
    // Step 3: Analyze results
    analyzeResults(results);
    
    // Step 4: Create comprehensive manifest
    const manifest = createPackageManifest(results, mockPackageJson);
    
    console.log('\n🎉 BULK DOWNLOAD COMPLETE!');
    console.log('✨ FACT system can process entire package.json files');
    console.log('🔍 Next step: Recursive dependency analysis possible');
    
    return { results, manifest };
  } catch (error) {
    console.error('❌ Bulk download test failed:', error.message);
    return null;
  }
}

// Run the test
testBulkPackageDownload().catch(console.error);