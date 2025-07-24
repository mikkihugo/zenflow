/**
 * Monorepo Import and Analysis Command
 * Import existing monorepo code and analyze service structure
 * For 15 microservices pilot - single domain, flat structure
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { glob } from 'glob';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { createHive } from './hive-mind-command.js';
import { KuzuGraphInterface } from '../database/kuzu-graph-interface.js';

/**
 * Analyze monorepo structure and discover services
 */
export async function importMonorepoCommand(args, flags) {
  const monorepoPath = args[0] || process.cwd();
  const options = {
    maxServices: flags.maxServices || 15,
    autoCreateHives: flags.autoCreateHives || false,
    analyzeCode: flags.analyzeCode !== false, // default true
    setupGraph: flags.setupGraph !== false,   // default true
    verbose: flags.verbose || false
  };

  printInfo(`🔍 Importing monorepo from: ${monorepoPath}`);
  printInfo(`📊 Target: ${options.maxServices} microservices (single domain)`);

  try {
    // 1. Discover services in monorepo
    const services = await discoverServices(monorepoPath, options);
    
    // 2. Analyze service code and dependencies
    const analysis = await analyzeServices(services, options);
    
    // 3. Set up graph database with Kuzu
    if (options.setupGraph) {
      await setupServiceGraph(analysis, options);
    }
    
    // 4. Auto-create hives if requested
    if (options.autoCreateHives) {
      await createServiceHives(analysis, options);
    }
    
    // 5. Generate import summary
    const summary = generateImportSummary(analysis, options);
    await saveImportSummary(summary);
    
    printSuccess(`✅ Monorepo import completed: ${services.length} services analyzed`);
    return summary;
    
  } catch (error) {
    printError(`❌ Monorepo import failed: ${error.message}`);
    throw error;
  }
}

/**
 * Discover services in monorepo using multiple strategies
 */
async function discoverServices(monorepoPath, options) {
  printInfo('🔍 Discovering services...');
  
  const services = new Map();
  const discoveryStrategies = [
    discoverByDirectoryStructure,
    discoverByPackageJson,
    discoverByDockerfile,
    discoverByBuildFiles,
    discoverByNxConfig
  ];
  
  for (const strategy of discoveryStrategies) {
    try {
      const found = await strategy(monorepoPath, options);
      found.forEach(service => {
        const key = service.path;
        if (!services.has(key)) {
          services.set(key, service);
        } else {
          // Merge service information
          const existing = services.get(key);
          services.set(key, mergeServiceInfo(existing, service));
        }
      });
    } catch (error) {
      if (options.verbose) {
        printWarning(`Strategy failed: ${strategy.name} - ${error.message}`);
      }
    }
  }
  
  const serviceList = Array.from(services.values())
    .slice(0, options.maxServices); // Limit to target count
  
  printSuccess(`📦 Found ${serviceList.length} services`);
  return serviceList;
}

/**
 * Strategy 1: Directory structure analysis
 */
async function discoverByDirectoryStructure(monorepoPath, options) {
  const services = [];
  const patterns = [
    'services/*',
    'apps/*', 
    'packages/*',
    'microservices/*',
    'projects/*'
  ];
  
  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, { 
        cwd: monorepoPath,
        onlyDirectories: true 
      });
      
      for (const match of matches) {
        const servicePath = path.join(monorepoPath, match);
        const serviceName = path.basename(match);
        
        services.push({
          name: serviceName,
          path: servicePath,
          relativePath: match,
          type: 'directory',
          discoveredBy: 'directory-structure'
        });
      }
    } catch (error) {
      // Continue with other patterns
    }
  }
  
  return services;
}

/**
 * Strategy 2: package.json analysis
 */
async function discoverByPackageJson(monorepoPath, options) {
  const services = [];
  
  try {
    const packageFiles = await glob('**/package.json', {
      cwd: monorepoPath,
      ignore: ['**/node_modules/**']
    });
    
    for (const packageFile of packageFiles) {
      try {
        const fullPath = path.join(monorepoPath, packageFile);
        const packageContent = JSON.parse(await readFile(fullPath, 'utf8'));
        const servicePath = path.dirname(fullPath);
        const serviceName = packageContent.name || path.basename(servicePath);
        
        // Skip root package.json
        if (servicePath === monorepoPath) continue;
        
        services.push({
          name: serviceName,
          path: servicePath,
          relativePath: path.relative(monorepoPath, servicePath),
          type: 'npm-package',
          discoveredBy: 'package-json',
          packageInfo: {
            version: packageContent.version,
            description: packageContent.description,
            scripts: Object.keys(packageContent.scripts || {}),
            dependencies: Object.keys(packageContent.dependencies || {}),
            devDependencies: Object.keys(packageContent.devDependencies || {})
          }
        });
      } catch (error) {
        // Skip invalid package.json files
      }
    }
  } catch (error) {
    // Strategy failed, return empty array
  }
  
  return services;
}

/**
 * Strategy 3: Dockerfile analysis
 */
async function discoverByDockerfile(monorepoPath, options) {
  const services = [];
  
  try {
    const dockerFiles = await glob('**/Dockerfile*', {
      cwd: monorepoPath,
      ignore: ['**/node_modules/**']
    });
    
    for (const dockerFile of dockerFiles) {
      const servicePath = path.dirname(path.join(monorepoPath, dockerFile));
      const serviceName = path.basename(servicePath);
      
      services.push({
        name: serviceName,
        path: servicePath,
        relativePath: path.relative(monorepoPath, servicePath),
        type: 'docker-service',
        discoveredBy: 'dockerfile',
        containerInfo: {
          dockerFile: dockerFile
        }
      });
    }
  } catch (error) {
    // Strategy failed
  }
  
  return services;
}

/**
 * Strategy 4: Build files analysis (BUILD, BUILD.bazel, etc.)
 */
async function discoverByBuildFiles(monorepoPath, options) {
  const services = [];
  
  try {
    const buildFiles = await glob('**/BUILD*', {
      cwd: monorepoPath,
      ignore: ['**/node_modules/**']
    });
    
    for (const buildFile of buildFiles) {
      const servicePath = path.dirname(path.join(monorepoPath, buildFile));
      const serviceName = path.basename(servicePath);
      
      services.push({
        name: serviceName,
        path: servicePath,  
        relativePath: path.relative(monorepoPath, servicePath),
        type: 'bazel-target',
        discoveredBy: 'build-files',
        buildInfo: {
          buildFile: buildFile
        }
      });
    }
  } catch (error) {
    // Strategy failed
  }
  
  return services;
}

/**
 * Strategy 5: NX workspace analysis
 */
async function discoverByNxConfig(monorepoPath, options) {
  const services = [];
  
  try {
    // Check for nx.json
    const nxConfigPath = path.join(monorepoPath, 'nx.json');
    if (!existsSync(nxConfigPath)) {
      return services;
    }
    
    const nxConfig = JSON.parse(await readFile(nxConfigPath, 'utf8'));
    
    // Look for project.json files
    const projectFiles = await glob('**/project.json', {
      cwd: monorepoPath,
      ignore: ['**/node_modules/**']
    });
    
    for (const projectFile of projectFiles) {
      try {
        const fullPath = path.join(monorepoPath, projectFile);
        const projectConfig = JSON.parse(await readFile(fullPath, 'utf8'));
        const servicePath = path.dirname(fullPath);
        const serviceName = projectConfig.name || path.basename(servicePath);
        
        services.push({
          name: serviceName,
          path: servicePath,
          relativePath: path.relative(monorepoPath, servicePath),
          type: 'nx-project',
          discoveredBy: 'nx-config',
          nxInfo: {
            sourceRoot: projectConfig.sourceRoot,
            targets: Object.keys(projectConfig.targets || {}),
            tags: projectConfig.tags || [],
            implicitDependencies: projectConfig.implicitDependencies || []
          }
        });
      } catch (error) {
        // Skip invalid project.json files
      }
    }
  } catch (error) {
    // Strategy failed
  }
  
  return services;
}

/**
 * Merge service information from multiple discovery strategies
 */
function mergeServiceInfo(existing, newInfo) {
  return {
    ...existing,
    ...newInfo,
    discoveredBy: [existing.discoveredBy, newInfo.discoveredBy].flat(),
    type: existing.type === newInfo.type ? existing.type : `${existing.type}+${newInfo.type}`,
    packageInfo: { ...existing.packageInfo, ...newInfo.packageInfo },
    containerInfo: { ...existing.containerInfo, ...newInfo.containerInfo },
    buildInfo: { ...existing.buildInfo, ...newInfo.buildInfo },
    nxInfo: { ...existing.nxInfo, ...newInfo.nxInfo }
  };
}

/**
 * Analyze services for dependencies and relationships
 */
async function analyzeServices(services, options) {
  printInfo('🔬 Analyzing service code and dependencies...');
  
  const analysis = {
    services: [],
    dependencies: new Map(),
    relationships: [],  
    codeStats: {},
    patterns: []
  };
  
  for (const service of services) {
    try {
      const serviceAnalysis = await analyzeService(service, options);
      analysis.services.push(serviceAnalysis);
      
      // Build dependency map
      if (serviceAnalysis.dependencies.length > 0) {
        analysis.dependencies.set(service.name, serviceAnalysis.dependencies);
      }
      
      // Extract relationships
      analysis.relationships.push(...serviceAnalysis.relationships);
      
    } catch (error) {
      printWarning(`⚠️ Failed to analyze service: ${service.name} - ${error.message}`);
    }
  }
  
  // Detect patterns across services
  analysis.patterns = detectServicePatterns(analysis.services);
  
  printSuccess(`🔬 Analysis completed: ${analysis.services.length} services`);
  return analysis;
}

/**
 * Analyze individual service
 */
async function analyzeService(service, options) {
  const analysis = {
    ...service,
    dependencies: [],
    relationships: [],
    codeStats: {},
    apis: [],
    databases: [],
    technologies: []
  };
  
  try {
    // Analyze package.json dependencies
    if (service.packageInfo) {
      analysis.dependencies = [
        ...service.packageInfo.dependencies,
        ...service.packageInfo.devDependencies
      ];
    }
    
    // Analyze NX dependencies  
    if (service.nxInfo) {
      analysis.dependencies.push(...service.nxInfo.implicitDependencies);
    }
    
    // Code analysis (if enabled)
    if (options.analyzeCode) {
      analysis.codeStats = await analyzeServiceCode(service.path);
      analysis.apis = await detectAPIs(service.path);
      analysis.databases = await detectDatabases(service.path);
      analysis.technologies = await detectTechnologies(service.path);
    }
    
    // Build relationships
    analysis.relationships = buildServiceRelationships(service, analysis);
    
  } catch (error) {
    printWarning(`Service analysis error for ${service.name}: ${error.message}`);
  }
  
  return analysis;
}

/**
 * Analyze service code structure
 */
async function analyzeServiceCode(servicePath) {
  const stats = {
    fileCount: 0,
    lineCount: 0,  
    languages: {},
    complexity: 'unknown'
  };
  
  try {
    const files = await glob('**/*', {
      cwd: servicePath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      nodir: true
    });
    
    stats.fileCount = files.length;
    
    for (const file of files.slice(0, 100)) { // Limit for performance
      const ext = path.extname(file).toLowerCase();
      stats.languages[ext] = (stats.languages[ext] || 0) + 1;
      
      try {
        const content = await readFile(path.join(servicePath, file), 'utf8');
        stats.lineCount += content.split('\n').length;
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Estimate complexity
    if (stats.lineCount > 10000) stats.complexity = 'high';
    else if (stats.lineCount > 2000) stats.complexity = 'medium';
    else stats.complexity = 'low';
    
  } catch (error) {
    // Return basic stats on error
  }
  
  return stats;
}

/**
 * Detect APIs in service
 */
async function detectAPIs(servicePath) {
  const apis = [];
  
  try {
    // Look for common API patterns
    const patterns = [
      '**/routes/**/*.js',
      '**/controllers/**/*.js', 
      '**/api/**/*.js',
      '**/handlers/**/*.js',
      '**/*route*.js',
      '**/*controller*.js',
      '**/*api*.js'
    ];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: servicePath });
      for (const file of files) {
        apis.push({
          file: file,
          type: 'rest-api',
          detected: 'file-pattern'
        });
      }
    }
    
    // Look for OpenAPI/Swagger specs
    const specFiles = await glob('**/swagger.{json,yaml,yml}', { cwd: servicePath });
    const openApiFiles = await glob('**/openapi.{json,yaml,yml}', { cwd: servicePath });
    
    [...specFiles, ...openApiFiles].forEach(file => {
      apis.push({
        file: file,
        type: 'openapi-spec',
        detected: 'spec-file'
      });
    });
    
  } catch (error) {
    // Return empty on error
  }
  
  return apis;
}

/**
 * Detect databases in service
 */
async function detectDatabases(servicePath) {
  const databases = [];
  
  try {
    // Look for database configuration files
    const configPatterns = [
      '**/database.{js,json,yml,yaml}',
      '**/db.{js,json,yml,yaml}',
      '**/*database*.{js,json,yml,yaml}',
      '**/migrations/**/*',
      '**/schema/**/*'
    ];
    
    for (const pattern of configPatterns) {
      const files = await glob(pattern, { cwd: servicePath });
      for (const file of files) {
        databases.push({
          file: file,
          type: 'config',
          detected: 'file-pattern'
        });
      }
    }
    
    // Look for Docker Compose with databases
    const composeFiles = await glob('**/docker-compose*.{yml,yaml}', { cwd: servicePath });
    for (const file of composeFiles) {
      try {
        const content = await readFile(path.join(servicePath, file), 'utf8');
        if (content.includes('postgres') || content.includes('mysql') || content.includes('mongodb')) {
          databases.push({
            file: file,
            type: 'docker-compose',
            detected: 'compose-file'
          });
        }
      } catch (error) {
        // Skip on error
      }
    }
    
  } catch (error) {
    // Return empty on error  
  }
  
  return databases;
}

/**
 * Detect technologies used in service
 */
async function detectTechnologies(servicePath) {
  const technologies = new Set();
  
  try {
    // Check package.json for technology indicators
    const packagePath = path.join(servicePath, 'package.json');
    if (existsSync(packagePath)) {
      const packageContent = JSON.parse(await readFile(packagePath, 'utf8'));
      const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
      
      // Detect frameworks and libraries
      if (deps['express']) technologies.add('express');
      if (deps['fastify']) technologies.add('fastify');
      if (deps['nestjs']) technologies.add('nestjs');
      if (deps['react']) technologies.add('react');
      if (deps['vue']) technologies.add('vue');
      if (deps['angular']) technologies.add('angular');
      if (deps['typescript']) technologies.add('typescript');
      if (deps['prisma']) technologies.add('prisma');
      if (deps['mongoose']) technologies.add('mongodb');
      if (deps['pg'] || deps['postgres']) technologies.add('postgresql');
      if (deps['mysql']) technologies.add('mysql');
      if (deps['redis']) technologies.add('redis');
      if (deps['graphql']) technologies.add('graphql');
    }
    
    // Check for Docker
    if (existsSync(path.join(servicePath, 'Dockerfile'))) {
      technologies.add('docker');
    }
    
    // Check for Kubernetes
    const k8sFiles = await glob('**/k8s/**/*.{yml,yaml}', { cwd: servicePath });
    if (k8sFiles.length > 0) {
      technologies.add('kubernetes');
    }
    
  } catch (error) {
    // Return empty on error
  }
  
  return Array.from(technologies);
}

/**
 * Build service relationships
 */
function buildServiceRelationships(service, analysis) {
  const relationships = [];
  
  // Dependency relationships
  analysis.dependencies.forEach(dep => {
    relationships.push({
      from: service.name,
      to: dep,
      type: 'depends-on',
      strength: 'medium'
    });
  });
  
  // API relationships (if service exposes APIs, others might depend on it)
  if (analysis.apis.length > 0) {
    relationships.push({
      from: service.name,
      type: 'provides-api',
      strength: 'high'
    });
  }
  
  // Database relationships
  if (analysis.databases.length > 0) {
    relationships.push({
      from: service.name,
      type: 'uses-database',
      strength: 'high'
    });
  }
  
  return relationships;
}

/**
 * Detect patterns across services
 */
function detectServicePatterns(services) {
  const patterns = [];
  
  // Technology usage patterns
  const techUsage = {};
  services.forEach(service => {
    service.technologies.forEach(tech => {
      techUsage[tech] = (techUsage[tech] || 0) + 1;
    });
  });
  
  Object.entries(techUsage).forEach(([tech, count]) => {
    if (count >= 3) { // Used by 3+ services
      patterns.push({
        type: 'technology-adoption',
        technology: tech,
        usage: count,
        percentage: Math.round((count / services.length) * 100)
      });
    }
  });
  
  // Service size patterns
  const sizeCounts = { small: 0, medium: 0, large: 0 };
  services.forEach(service => {
    if (service.codeStats.complexity) {
      if (service.codeStats.complexity === 'low') sizeCounts.small++;
      else if (service.codeStats.complexity === 'medium') sizeCounts.medium++;
      else sizeCounts.large++;
    }
  });
  
  patterns.push({
    type: 'service-size-distribution',
    distribution: sizeCounts
  });
  
  return patterns;
}

/**
 * Set up Kuzu graph database with service relationships
 */
async function setupServiceGraph(analysis, options) {
  printInfo('📊 Setting up Kuzu graph database...');
  
  try {
    // Initialize Kuzu graph interface
    const graphDb = new KuzuGraphInterface({
      dbPath: './graph-db',
      dbName: 'claude-zen-microservices-pilot',
      batchSize: options.batchSize || 100
    });
    
    await graphDb.initialize();
    
    // Insert services into graph
    await graphDb.insertServices(analysis.services);
    
    // Extract and insert technologies
    const allTechnologies = new Set();
    analysis.services.forEach(service => {
      service.technologies.forEach(tech => allTechnologies.add(tech));
    });
    await graphDb.insertTechnologies(Array.from(allTechnologies));
    
    // Insert relationships
    await graphDb.insertRelationships(analysis.relationships);
    
    // Insert hive coordination data if hives exist
    const hiveData = analysis.services.map(service => ({
      service_name: service.name,
      hive_id: `hive-${service.name}`,
      status: 'pending',
      agent_count: 0
    }));
    await graphDb.insertHives(hiveData);
    
    // Generate architecture analysis
    const patterns = await graphDb.analyzeArchitecturePatterns();
    analysis.architecturePatterns = patterns;
    
    // Export data for external Kuzu usage
    const exportPath = await graphDb.exportForKuzu();
    
    // Close database
    await graphDb.close();
    
    printSuccess('✅ Kuzu graph database setup completed');
    printInfo(`📤 Kuzu export available at: ${exportPath}`);
    
    return {
      status: 'success',
      exportPath,
      patterns,
      stats: await graphDb.getStats()
    };
    
  } catch (error) {
    printError(`❌ Graph database setup failed: ${error.message}`);
    throw error;
  }
}


/**
 * Auto-create hives for services
 */
async function createServiceHives(analysis, options) {
  printInfo('🏗️ Auto-creating service hives...');
  
  let created = 0;
  for (const service of analysis.services) {
    try {
      await createHive([service.name], {
        path: service.path,
        description: `Auto-created hive for ${service.name}`,
        scope: `Service: ${service.name}\nType: ${service.type}\nTechnologies: ${service.technologies.join(', ')}`
      });
      created++;
    } catch (error) {
      printWarning(`⚠️ Failed to create hive for ${service.name}: ${error.message}`);
    }
  }
  
  printSuccess(`✅ Created ${created} service hives`);
}

/**
 * Generate import summary
 */
function generateImportSummary(analysis, options) {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalServices: analysis.services.length,
      relationships: analysis.relationships.length,
      patterns: analysis.patterns.length,
      technologies: analysis.services.reduce((acc, service) => {
        service.technologies.forEach(tech => acc.add(tech));
        return acc;
      }, new Set()).size
    },
    services: analysis.services.map(service => ({
      name: service.name,
      type: service.type,
      complexity: service.codeStats.complexity,
      technologies: service.technologies,
      apis: service.apis.length,
      databases: service.databases.length
    })),
    patterns: analysis.patterns,
    recommendations: generateRecommendations(analysis)
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Technology standardization recommendations
  const techUsage = {};
  analysis.services.forEach(service => {
    service.technologies.forEach(tech => {
      techUsage[tech] = (techUsage[tech] || 0) + 1;
    });
  });
  
  const dominantTech = Object.entries(techUsage)
    .filter(([tech, count]) => count >= Math.ceil(analysis.services.length * 0.5))
    .map(([tech]) => tech);
  
  if (dominantTech.length > 0) {
    recommendations.push({
      type: 'standardization',
      priority: 'medium',
      message: `Consider standardizing on: ${dominantTech.join(', ')}`,
      services: dominantTech
    });
  }
  
  // Service complexity recommendations
  const complexServices = analysis.services
    .filter(service => service.codeStats.complexity === 'high')
    .map(service => service.name);
  
  if (complexServices.length > 0) {
    recommendations.push({
      type: 'complexity',
      priority: 'high',
      message: `Consider breaking down complex services: ${complexServices.join(', ')}`,
      services: complexServices
    });
  }
  
  // API standardization
  const apiServices = analysis.services
    .filter(service => service.apis.length > 0)
    .map(service => service.name);
  
  if (apiServices.length > 0) {
    recommendations.push({
      type: 'api-standardization',
      priority: 'medium',
      message: `Consider API standardization across: ${apiServices.join(', ')}`,
      services: apiServices
    });
  }
  
  return recommendations;
}

/**
 * Save import summary
 */
async function saveImportSummary(summary) {
  const summaryPath = './monorepo-import-summary.json';
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));
  printInfo(`📋 Import summary saved: ${summaryPath}`);
}

export default {
  importMonorepoCommand,
  discoverServices,
  analyzeServices,
  setupServiceGraph
};