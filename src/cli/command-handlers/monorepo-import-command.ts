
/** Monorepo Import and Analysis Command
/** Import existing monorepo code and analyze service structure
/** For 15 microservices pilot - single domain, flat structure

import { existsSync  } from 'node:fs';
import { readFile  } from 'node:fs';
import path from 'node:path';
import { glob  } from 'glob';
import { KuzuGraphInterface  } from '../database/kuzu-graph-interface.js';
import { printInfo  } from '..';

/** Analyze monorepo structure and discover services

export async function importMonorepoCommand(args = args[0]  ?? process.cwd();
const _options = {maxServices = = false, // default truesetupGraph = = false,   // default trueverbose = await discoverServices(monorepoPath, options);

    // 2. Analyze service code and dependencies
// const _analysis = awaitanalyzeServices(services, options);
// 3. Set up graph database with Kuzu
  if(options.setupGraph) {
// // await setupServiceGraph(analysis, options);
// }
// 4. Auto-create hives if requested
  if(options.autoCreateHives) {
// // await createServiceHives(analysis, options);
// }
// 5. Generate import summary
const _summary = generateImportSummary(analysis, options);
// // await saveImportSummary(summary);
printSuccess(` Monorepo importcompleted = new Map();`
  const _discoveryStrategies = [
    discoverByDirectoryStructure,
    discoverByPackageJson,
    discoverByDockerfile,
    discoverByBuildFiles,
    discoverByNxConfig;
  ];
  for(const strategy of discoveryStrategies) {
    try {
// const _found = awaitstrategy(monorepoPath, options); 
      found.forEach(service => {)
        const _key = service.path; if(!services.has(key) {) {
          services.set(key, service);
        } else {
          // Merge service information
          const _existing = services.get(key);
          services.set(key, mergeServiceInfo(existing, service));
        //         }
      });
    } catch(error) {
  if(options.verbose) {
        printWarning(`Strategyfailed = Array.from(services.values());`
slice(0, options.maxServices) // Limit to target count

printSuccess(` Found $`
// {
  serviceList.length;
// }
services`);`
// return serviceList;
// }

/** Strategy1 = []
  const _patterns = [
    'services/*', */
    'apps/*', */
    'packages/*', */
    'microservices/*', */
    'projects/*' */
  ];
  for(const pattern of patterns) {
    try {

        const _serviceName = path.basename(match); services.push({name = []; try {

        const _packageContent = JSON.parse(// await readFile(fullPath, 'utf8') {);
        const _servicePath = path.dirname(fullPath);
        const _serviceName = packageContent.name  ?? path.basename(servicePath);

        // Skip root package.json
        if(servicePath === monorepoPath) continue;

        services.push({name = [];

  try {

      const _serviceName = path.basename(servicePath);

      services.push({name = [];

  try {

      const _serviceName = path.basename(servicePath);

      services.push({name = [];

  try {
    // Check for nx.json/g)
    const _nxConfigPath = path.join(monorepoPath, 'nx.json');
    if(!existsSync(nxConfigPath)) {
      // return services;
    //   // LINT: unreachable code removed}

    const _nxConfig = JSON.parse(// await readFile(nxConfigPath, 'utf8'));

    // Look for project.json files

        const _projectConfig = JSON.parse(// await readFile(fullPath, 'utf8'));
        const _servicePath = path.dirname(fullPath);
        const _serviceName = projectConfig.name  ?? path.basename(servicePath);

        services.push({name = === newInfo.type ? existing.type = {services = // await analyzeService(service, options);
      analysis.services.push(serviceAnalysis);

      // Build dependency map
  if(serviceAnalysis.dependencies.length > 0) {
        analysis.dependencies.set(service.name, serviceAnalysis.dependencies);
      //       }

      // Extract relationships
      analysis.relationships.push(...serviceAnalysis.relationships);

    } catch(error)
// {
  printWarning(`;`
 Failed to analyzeservice = detectServicePatterns(analysis.services)
  printSuccess(` Analysis completed =`
// {
..service,dependencies = [
..service.packageInfo.dependencies,
..service.packageInfo.devDependencies
  //   ]
// }
// Analyze NX dependencies
if(service.nxInfo) {
  analysis.dependencies.push(...service.nxInfo.implicitDependencies);
// }
// Code analysis(if enabled)
  if(options.analyzeCode) {
  analysis.codeStats = // await analyzeServiceCode(service.path);
  analysis.apis = // await detectAPIs(service.path);
  analysis.databases = // await detectDatabases(service.path);
  analysis.technologies = // await detectTechnologies(service.path);
// }
// Build relationships
analysis.relationships = buildServiceRelationships(service, analysis);
} catch(error)
// {
  printWarning(`Service analysis error for ${service.name});`
// }
// return analysis;
// }

/** Analyze service code structure

async function analyzeServiceCode(servicePath = {fileCount = // await glob('**/*', {cwd = files.length
for (const file of files.slice(0, 100)) {
  // Limit for performance
  const _ext = path.extname(file).toLowerCase(); stats.languages[ext] = (stats.languages[ext]  ?? 0) + 1; try {
// const _content = awaitreadFile(path.join(servicePath, file) {, 'utf8');
    stats.lineCount += content.split('\n').length;
  } catch(/* _error */) {
    // Skip files that can't be read'
  //   }
// }
// Estimate complexity
if(stats.lineCount > 10000) stats.complexity = 'high';
else if(stats.lineCount > 2000) stats.complexity = 'medium';
else stats.complexity = 'low';
} catch(error)
// {
  // Return basic stats on error
// }
// return stats;
// }

/** Detect APIs in service

async function _detectAPIs() {
// const __files = awaitglob(pattern, {cwd = await glob('**/swagger.{json,yaml,yml}', {cwd = await glob('**/openapi.{json,yaml,yml}', { cwd => {
      apis.push({
        file,type = [];

  try {
    // Look for database configuration files
    const _configPatterns = [
      '**
      '**
      '**
      '**/migrations/\*\*/*',
      '**/schema/\*\*/*'
    ];

  for(const pattern of configPatterns) {
// const __files = awaitglob(pattern, {cwd = // await glob('**/docker-compose*.{yml,yaml}', {cwd = // await readFile(path.join(servicePath, file), 'utf8')
        if(content.includes('postgres')  ?? content.includes('mysql')  ?? content.includes('mongodb')) {
          databases.push({file = new Set(); try {
    // Check package.json for technology indicators
    const _packagePath = path.join(servicePath, 'package.json'); if(existsSync(packagePath) {) {
      const _packageContent = JSON.parse(// await readFile(packagePath, 'utf8'));
      const _deps = { ...packageContent.dependencies, ...packageContent.devDependencies };

      // Detect frameworks and libraries
      if(deps.express) technologies.add('express');
      if(deps.fastify) technologies.add('fastify');
      if(deps.nestjs) technologies.add('nestjs');
      if(deps.react) technologies.add('react');
      if(deps.vue) technologies.add('vue');
      if(deps.angular) technologies.add('angular');
      if(deps.typescript) technologies.add('typescript');
      if(deps.prisma) technologies.add('prisma');
      if(deps.mongoose) technologies.add('mongodb');
      if(deps.pg  ?? deps.postgres) technologies.add('postgresql');
      if(deps.mysql) technologies.add('mysql');
      if(deps.redis) technologies.add('redis');
      if(deps.graphql) technologies.add('graphql');
    //     }

    // Check for Docker
    if(existsSync(path.join(servicePath, 'Dockerfile'))) {
      technologies.add('docker');
    //     }

    // Check for Kubernetes

  // Dependency relationships
  analysis.dependencies.forEach(_dep => {
    relationships.push({from = [];

  // Technology usage patterns
  const _techUsage = {};
  services.forEach(service => {
    service.technologies.forEach(tech => {))))
      techUsage[tech] = (techUsage[tech]  ?? 0) + 1;
    });
  });

  Object.entries(techUsage).forEach(([_tech, count]) => {
  if(count >= 3) { // Used by 3+ services
      patterns.push({
        //         type = {
      small => {)
  if(service._codeStats._complexity) {
      if(service.codeStats.complexity === 'low') sizeCounts.small++;
      else if(service.codeStats.complexity === 'medium') sizeCounts.medium++;
      else sizeCounts.large++;
    //     }
  });

  patterns.push({ type = new KuzuGraphInterface({dbPath = new Set();
    analysis.services.forEach(service => {)
      service.technologies.forEach(tech => allTechnologies.add(tech));
      });
// // await graphDb.insertTechnologies(Array.from(allTechnologies));
    // Insert relationships
// // await graphDb.insertRelationships(analysis.relationships);
    // Insert hive coordination data if hives exist

    analysis.architecturePatterns = patterns;

    // Export data for external Kuzu usage

    // Close database
// // await graphDb.close();
    printSuccess(' Kuzu graph database setup completed');
  printInfo(` Kuzu export availableat = 0;`
  for (const service of analysis.services) {
    try {
// // await createHive([service.name], {
        path => {
        service.technologies.forEach(tech => acc.add(tech)); return acc; //   // LINT: unreachable code removed}, new Set() {).size;
    },services = > ({name = [];

  // Technology standardization recommendations
  const _techUsage = {};
  analysis.services.forEach(service => {
    service.technologies.forEach(tech => {))
      techUsage[tech] = (techUsage[tech]  ?? 0) + 1;
    });
  });

  const _dominantTech = Object.entries(techUsage);
filter(([tech, count]) => count >= Math.ceil(analysis.services.length * 0.5))
map(([tech]) => tech);
  if(dominantTech.length > 0) {
    recommendations.push({type = analysis.services;)
filter(service => service.codeStats.complexity === 'high');
map(service => service.name);
  if(complexServices.length > 0) {
    recommendations.push({type = analysis.services;)
filter(service => service.apis.length > 0);
map(service => service.name);
  if(apiServices.length > 0) {
    recommendations.push({type = './monorepo-import-summary.json';/g)
// // await writeFile(summaryPath, JSON.stringify(summary, null, 2));
  printInfo(` Import summary saved);`
// }

// export default {
  importMonorepoCommand,
  discoverServices,
  analyzeServices,
  setupServiceGraph;
};

}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}})))))))))))))))))))))))))))))
