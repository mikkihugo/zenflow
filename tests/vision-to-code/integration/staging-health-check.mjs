#!/usr/bin/env node
/**
 * Vision-to-Code Staging Health Check
 * Validates all services are running and responsive
 */

import { createRequire } from 'module';
import { writeFile } from 'fs/promises';

const require = createRequire(import.meta.url);
const http = require('http');

const SERVICES = [
  { name: 'Business Service', port: 4106, path: '/health' },
  { name: 'Core Service', port: 4105, path: '/health' },
  { name: 'Swarm Service', port: 4108, path: '/health' },
  { name: 'Development Service', port: 4103, path: '/health' }
];

async function httpGet(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: data
          });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkServiceHealth(service) {
  const url = `http://localhost:${service.port}${service.path}`;
  
  try {
    console.log(`🔍 Checking ${service.name}...`);
    const response = await httpGet(url);
    
    return {
      name: service.name,
      status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
      port: service.port,
      statusCode: response.statusCode,
      responseTime: response.headers['x-response-time'] || 'N/A',
      data: response.data
    };
  } catch (error) {
    return {
      name: service.name,
      status: 'unhealthy',
      port: service.port,
      error: error.message,
      code: error.code
    };
  }
}

async function runHealthCheck() {
  console.log('🚀 Vision-to-Code Staging Health Check\n');
  
  const healthResults = await Promise.all(
    SERVICES.map(service => checkServiceHealth(service))
  );
  
  // Display results
  console.log('📊 Health Check Results:');
  console.log('='.repeat(50));
  
  let allHealthy = true;
  
  healthResults.forEach(result => {
    const status = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${result.name} (Port ${result.port})`);
    
    if (result.status === 'healthy') {
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Response Time: ${result.responseTime}`);
      if (result.data?.status) {
        console.log(`   Service Status: ${result.data.status}`);
      }
    } else {
      console.log(`   Error: ${result.error}`);
      if (result.statusCode) {
        console.log(`   Status Code: ${result.statusCode}`);
      }
      allHealthy = false;
    }
    console.log('');
  });
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    overallStatus: allHealthy ? 'healthy' : 'degraded',
    servicesChecked: SERVICES.length,
    healthyServices: healthResults.filter(r => r.status === 'healthy').length,
    unhealthyServices: healthResults.filter(r => r.status === 'unhealthy').length,
    results: healthResults
  };
  
  // Save results
  await writeFile(
    '/tmp/vision-to-code-health.json',
    JSON.stringify(summary, null, 2)
  );
  
  console.log('='.repeat(50));
  console.log(`🎯 Overall Status: ${allHealthy ? '✅ All Systems Operational' : '❌ System Degraded'}`);
  console.log(`📋 Services: ${summary.healthyServices}/${summary.servicesChecked} healthy`);
  console.log(`📄 Full report saved to: /tmp/vision-to-code-health.json`);
  
  process.exit(allHealthy ? 0 : 1);
}

// Run the health check
runHealthCheck().catch(error => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});