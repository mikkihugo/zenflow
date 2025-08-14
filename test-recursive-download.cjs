#!/usr/bin/env node

// Test recursive package downloading - download ALL discovered dependencies
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🌳 Testing RECURSIVE Package Download...\n');
console.log('This will download ALL discovered dependencies, not just direct ones!\n');

const RATE_LIMIT_DELAY = 300; // 300ms between requests to be extra careful
const MAX_DEPTH = 3; // Prevent infinite recursion
const MAX_PACKAGES = 50; // Safety limit

let downloadedPackages = new Set();
let totalDownloads = 0;
let totalDependenciesFound = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Download single package data
function downloadPackageData(packageName, depth = 0) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}`;
    const indent = '  '.repeat(depth);
    console.log(`${indent}📥 [Depth ${depth}] Downloading: ${packageName}...`);
    
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
              devDependencyCount: Object.keys(devDependencies).length,
              realData: true,
              fetchedAt: new Date().toISOString(),
              depth: depth
            };
            
            console.log(`${indent}✅ ${packageName} v${latest} (${result.dependencyCount} deps, ${result.devDependencyCount} devDeps)`);
            totalDownloads++;
            totalDependenciesFound += result.dependencyCount + result.devDependencyCount;
            resolve(result);
          } else {
            console.log(`${indent}❌ ${packageName}: HTTP ${res.statusCode}`);
            resolve({ name: packageName, error: `HTTP ${res.statusCode}`, realData: false, depth: depth });
          }
        } catch (e) {
          console.log(`${indent}❌ ${packageName}: Parse error`);
          resolve({ name: packageName, error: e.message, realData: false, depth: depth });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`${indent}❌ ${packageName}: ${err.message}`);
      resolve({ name: packageName, error: err.message, realData: false, depth: depth });
    });
    
    req.setTimeout(5000, () => {
      console.log(`${indent}⏰ ${packageName}: Timeout`);
      req.destroy();
      resolve({ name: packageName, error: 'Timeout', realData: false, depth: depth });
    });
  });
}

// Recursive package downloader
async function downloadRecursively(packageNames, depth = 0, maxDepth = MAX_DEPTH) {
  if (depth > maxDepth) {
    console.log(`🛑 Max depth ${maxDepth} reached, stopping recursion`);
    return [];
  }
  
  if (totalDownloads >= MAX_PACKAGES) {
    console.log(`🛑 Max package limit ${MAX_PACKAGES} reached, stopping download`);
    return [];
  }
  
  const results = [];
  const storageDir = path.join(process.cwd(), 'storage', 'fact', 'recursive-download', `depth-${depth}`);
  
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  console.log(`\\n🌲 Processing depth ${depth} (${packageNames.length} packages)...`);
  
  for (let i = 0; i < packageNames.length && totalDownloads < MAX_PACKAGES; i++) {
    const packageName = packageNames[i];
    
    // Skip if already downloaded
    if (downloadedPackages.has(packageName)) {
      console.log(`  ⏭️  Skipping ${packageName} (already downloaded)`);
      continue;
    }
    
    console.log(`[${totalDownloads + 1}/${MAX_PACKAGES}] Processing ${packageName}`);
    
    try {
      const packageData = await downloadPackageData(packageName, depth);
      results.push(packageData);
      downloadedPackages.add(packageName);
      
      // Store individual package data
      if (packageData.realData) {
        const filename = `${packageName.replace('/', '-')}-depth${depth}-${Date.now()}.json`;
        fs.writeFileSync(path.join(storageDir, filename), JSON.stringify(packageData, null, 2));
      }
      
      // Rate limiting delay
      if (i < packageNames.length - 1) {
        await delay(RATE_LIMIT_DELAY);
      }
    } catch (error) {
      console.log(`   ❌ Error processing ${packageName}:`, error.message);
      results.push({ name: packageName, error: error.message, realData: false, depth: depth });
    }
  }
  
  // Recursively download dependencies of successful packages
  const nextLevelPackages = [];
  for (const pkg of results) {
    if (pkg.realData && pkg.dependencies) {
      // Only download production dependencies (not devDependencies) for recursion to keep it manageable
      nextLevelPackages.push(...pkg.dependencies);
    }
  }
  
  if (nextLevelPackages.length > 0 && depth < maxDepth && totalDownloads < MAX_PACKAGES) {
    console.log(`\\n🔄 Found ${nextLevelPackages.length} dependencies to download at depth ${depth + 1}`);
    const uniqueNextLevel = [...new Set(nextLevelPackages)].filter(pkg => !downloadedPackages.has(pkg));
    console.log(`   ${uniqueNextLevel.length} unique new dependencies`);
    
    if (uniqueNextLevel.length > 0) {
      const recursiveResults = await downloadRecursively(uniqueNextLevel, depth + 1, maxDepth);
      results.push(...recursiveResults);
    }
  }
  
  return results;
}

// Main test runner
async function testRecursiveDownload() {
  console.log('🚀 FACT Recursive Package Download Test\\n');
  
  // Start with a smaller set for testing
  const startingPackages = ['react', 'express'];
  console.log(`🌱 Starting with: ${startingPackages.join(', ')}`);
  console.log(`🎯 Max depth: ${MAX_DEPTH}`);
  console.log(`🛡️  Safety limit: ${MAX_PACKAGES} packages\\n`);
  
  try {
    const allResults = await downloadRecursively(startingPackages);
    
    console.log('\\n📊 Recursive Download Summary:');
    console.log('==============================');
    console.log(`🗂️  Total packages downloaded: ${totalDownloads}`);
    console.log(`📦 Unique packages: ${downloadedPackages.size}`);
    console.log(`🔍 Total dependencies discovered: ${totalDependenciesFound}`);
    console.log(`✅ Successful downloads: ${allResults.filter(r => r.realData).length}`);
    console.log(`❌ Failed downloads: ${allResults.filter(r => !r.realData).length}`);
    
    // Group by depth
    const byDepth = {};
    allResults.forEach(pkg => {
      const depth = pkg.depth || 0;
      if (!byDepth[depth]) byDepth[depth] = [];
      byDepth[depth].push(pkg);
    });
    
    console.log('\\n🌳 Download Tree:');
    Object.keys(byDepth).sort().forEach(depth => {
      const packages = byDepth[depth];
      const successful = packages.filter(p => p.realData);
      console.log(`   Depth ${depth}: ${successful.length}/${packages.length} packages`);
      if (successful.length > 0) {
        const sample = successful.slice(0, 5).map(p => p.name).join(', ');
        console.log(`      Examples: ${sample}${successful.length > 5 ? '...' : ''}`);
      }
    });
    
    // Storage analysis
    const recursiveDir = path.join(process.cwd(), 'storage', 'fact', 'recursive-download');
    if (fs.existsSync(recursiveDir)) {
      let totalFiles = 0;
      let totalSize = 0;
      
      const depthDirs = fs.readdirSync(recursiveDir);
      depthDirs.forEach(dir => {
        const depthPath = path.join(recursiveDir, dir);
        if (fs.statSync(depthPath).isDirectory()) {
          const files = fs.readdirSync(depthPath);
          totalFiles += files.length;
          files.forEach(file => {
            totalSize += fs.statSync(path.join(depthPath, file)).size;
          });
        }
      });
      
      console.log(`\\n💾 Storage: ${totalFiles} files, ${(totalSize / 1024).toFixed(1)} KB`);
    }
    
    // Create comprehensive manifest
    const manifest = {
      type: 'recursive-download',
      startingPackages: startingPackages,
      maxDepth: MAX_DEPTH,
      totalDownloaded: totalDownloads,
      uniquePackages: downloadedPackages.size,
      dependenciesDiscovered: totalDependenciesFound,
      downloadTree: byDepth,
      timestamp: new Date().toISOString()
    };
    
    const manifestPath = path.join(process.cwd(), 'storage', 'fact', 'recursive-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Recursive manifest created: recursive-manifest.json`);
    
    console.log('\\n🎉 RECURSIVE DOWNLOAD COMPLETE!');
    console.log('✨ FACT system can now download complete dependency trees!');
    
    return { allResults, manifest };
  } catch (error) {
    console.error('❌ Recursive download failed:', error.message);
    return null;
  }
}

// Run the test
testRecursiveDownload().catch(console.error);