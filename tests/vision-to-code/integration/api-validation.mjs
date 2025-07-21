#!/usr/bin/env node
/**
 * Vision-to-Code API Validation Test
 * Tests all endpoints and service communication
 */

import { createRequire } from 'module';
import { writeFile } from 'fs/promises';

const require = createRequire(import.meta.url);
const http = require('http');

const BASE_URLS = {
  business: 'http://localhost:4106',
  core: 'http://localhost:4105', 
  swarm: 'http://localhost:4108',
  development: 'http://localhost:4103'
};

async function httpRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vision-to-Code-Test/1.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const request = http.request(options, (response) => {
      let responseData = '';
      
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      
      response.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: responseData
          });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      request.write(JSON.stringify(data));
    }
    
    request.end();
  });
}

const API_TESTS = [
  // Business Service Tests
  {
    name: 'Business Service - Health Check',
    method: 'GET',
    url: `${BASE_URLS.business}/health`,
    expectedStatus: 200
  },
  {
    name: 'Business Service - Create Vision',
    method: 'POST',
    url: `${BASE_URLS.business}/api/v1/visions`,
    data: {
      title: "Test Vision",
      description: "A test vision for API validation",
      strategic_goals: ["Test goal 1", "Test goal 2"],
      timeline_months: 6,
      budget_usd: 100000,
      stakeholders: ["test@example.com"],
      priority: "high"
    },
    expectedStatus: [200, 201]
  },
  {
    name: 'Business Service - List Visions',
    method: 'GET',
    url: `${BASE_URLS.business}/api/v1/visions`,
    expectedStatus: 200
  },
  
  // Core Service Tests
  {
    name: 'Core Service - Health Check',
    method: 'GET',
    url: `${BASE_URLS.core}/health`,
    expectedStatus: 200
  },
  {
    name: 'Core Service - Register Workflow',
    method: 'POST',
    url: `${BASE_URLS.core}/api/v1/workflows/vision`,
    data: {
      workflow_type: "vision_to_code",
      vision_id: "test_vision_123",
      metadata: {
        source_service: "business-service",
        priority: "high",
        estimated_duration_days: 30
      }
    },
    expectedStatus: [200, 201]
  },
  {
    name: 'Core Service - Service Health',
    method: 'GET',
    url: `${BASE_URLS.core}/api/v1/services/health`,
    expectedStatus: 200
  },
  
  // Swarm Service Tests
  {
    name: 'Swarm Service - Health Check',
    method: 'GET',
    url: `${BASE_URLS.swarm}/health`,
    expectedStatus: 200
  },
  {
    name: 'Swarm Service - Agent Status',
    method: 'GET',
    url: `${BASE_URLS.swarm}/api/v1/agents/status`,
    expectedStatus: 200
  },
  {
    name: 'Swarm Service - Coordinate Vision',
    method: 'POST',
    url: `${BASE_URLS.swarm}/api/v1/coordination/vision`,
    data: {
      action: "coordinate_vision_workflow",
      vision_data: {
        vision_id: "test_vision_123",
        strategic_goals: ["Test goal"],
        technical_requirements: ["microservices", "ai_integration"]
      },
      coordination_type: "queen_led"
    },
    expectedStatus: [200, 201]
  },
  
  // Development Service Tests
  {
    name: 'Development Service - Health Check',
    method: 'GET',
    url: `${BASE_URLS.development}/health`,
    expectedStatus: 200
  },
  {
    name: 'Development Service - Execute Vision-to-Code',
    method: 'POST',
    url: `${BASE_URLS.development}/api/v1/vision-to-code/execute`,
    data: {
      technical_plan: {
        plan_id: "test_plan_123",
        architecture: "microservices",
        phases: ["foundation", "core_features"]
      },
      execution_mode: "squad_based",
      claude_integration: true
    },
    expectedStatus: [200, 201]
  }
];

async function runAPIValidation() {
  console.log('🔬 Vision-to-Code API Validation Starting...\n');
  
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of API_TESTS) {
    try {
      console.log(`🧪 ${test.name}...`);
      
      const response = await httpRequest(test.method, test.url, test.data);
      
      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];
      
      const success = expectedStatuses.includes(response.statusCode);
      
      if (success) {
        console.log(`   ✅ PASS (${response.statusCode})`);
        passed++;
      } else {
        console.log(`   ❌ FAIL (Expected: ${expectedStatuses.join('|')}, Got: ${response.statusCode})`);
        failed++;
      }

      results.push({
        name: test.name,
        method: test.method,
        url: test.url,
        expectedStatus: test.expectedStatus,
        actualStatus: response.statusCode,
        success: success,
        responseData: typeof response.data === 'object' ? response.data : response.data.substring(0, 200)
      });

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
      
      results.push({
        name: test.name,
        method: test.method,
        url: test.url,
        expectedStatus: test.expectedStatus,
        success: false,
        error: error.message
      });
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 API Validation Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  const summary = {
    timestamp: new Date().toISOString(),
    total_tests: API_TESTS.length,
    passed: passed,
    failed: failed,
    success_rate: (passed / (passed + failed)) * 100,
    results: results
  };

  await writeFile(
    '/tmp/vision-to-code-api-validation.json',
    JSON.stringify(summary, null, 2)
  );

  console.log(`📄 Detailed report: /tmp/vision-to-code-api-validation.json`);
  
  return failed === 0;
}

// Run the validation
runAPIValidation()
  .then(success => {
    console.log(`\n🎯 Overall Result: ${success ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });