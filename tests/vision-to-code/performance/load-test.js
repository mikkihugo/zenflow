import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const visionAnalysisTime = new Trend('vision_analysis_time');
const codeGenerationTime = new Trend('code_generation_time');

// Test configuration
export const options = {
  scenarios: {
    // Normal load scenario
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 }, // Ramp up to 100 users
        { duration: '5m', target: 100 }, // Stay at 100 users
        { duration: '2m', target: 0 }, // Ramp down
      ],
      gracefulRampDown: '30s',
    },

    // Stress test scenario
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '3m', target: 500 },
        { duration: '5m', target: 1000 },
        { duration: '5m', target: 5000 },
        { duration: '5m', target: 0 },
      ],
      gracefulRampDown: '1m',
      startTime: '10m', // Start after normal load test
    },

    // Spike test scenario
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '30s', target: 5000 }, // Sudden spike
        { duration: '2m', target: 100 },
        { duration: '30s', target: 10000 }, // Extreme spike
        { duration: '2m', target: 0 },
      ],
      startTime: '35m', // Start after stress test
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<100', 'p(99)<200'], // 95% of requests under 100ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
    errors: ['rate<0.1'], // Custom error rate
    api_response_time: ['p(95)<100'], // API response time
    vision_analysis_time: ['p(95)<300'], // Vision analysis time
    code_generation_time: ['p(95)<500'], // Code generation time
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'test-api-key';

// Sample test image (base64 encoded small PNG)
const TEST_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg === ';

// Helper function to check response
function checkResponse(res, expectedStatus = 200) {
  const success = check(res, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'has valid JSON body': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);
  return success;
}

// Main test scenario
export default function () {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  // Scenario 1: Health check
  const healthCheck = http.get(`${BASE_URL}/health`);
  checkResponse(healthCheck);

  // Scenario 2: Upload image
  const uploadPayload = {
    image: TEST_IMAGE,
    format: 'png',
    name: `test-${Date.now()}.png`,
  };

  const uploadStart = Date.now();
  const uploadRes = http.post(`${BASE_URL}/api/v1/images/upload`, JSON.stringify(uploadPayload), {
    headers,
  });
  const uploadDuration = Date.now() - uploadStart;
  apiResponseTime.add(uploadDuration);

  if (!checkResponse(uploadRes)) {
    return; // Skip rest of test if upload fails
  }

  const { imageId } = JSON.parse(uploadRes.body).data;

  // Scenario 3: Analyze image
  const analysisStart = Date.now();
  const analysisRes = http.post(`${BASE_URL}/api/v1/vision/analyze/${imageId}`, '{}', { headers });
  const analysisDuration = Date.now() - analysisStart;
  visionAnalysisTime.add(analysisDuration);

  if (!checkResponse(analysisRes)) {
    return;
  }

  const { analysisId } = JSON.parse(analysisRes.body).data;

  // Scenario 4: Generate code
  const generatePayload = {
    analysisId,
    framework: 'react',
    language: 'typescript',
    options: {
      includeTests: true,
      includeStyles: true,
    },
  };

  const generateStart = Date.now();
  const generateRes = http.post(
    `${BASE_URL}/api/v1/code/generate`,
    JSON.stringify(generatePayload),
    { headers }
  );
  const generateDuration = Date.now() - generateStart;
  codeGenerationTime.add(generateDuration);

  checkResponse(generateRes);

  // Think time between iterations
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Handle summary export
export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Custom text summary
function textSummary(data, _options) {
  const { metrics } = data;

  let summary = '\n=== Vision-to-Code Load Test Results ===\n\n';

  // Request metrics
  summary += 'Request Metrics:\n';
  summary += `  Total Requests: ${metrics.http_reqs.values.count}\n`;
  summary += `  Failed Requests: ${metrics.http_req_failed.values.passes}\n`;
  summary += `  Error Rate: ${(metrics.errors.values.rate * 100).toFixed(2)}%\n\n`;

  // Response time metrics
  summary += 'Response Time Metrics:\n';
  summary += `  Average: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `  P50: ${metrics.http_req_duration.values.p(50).toFixed(2)}ms\n`;
  summary += `  P95: ${metrics.http_req_duration.values.p(95).toFixed(2)}ms\n`;
  summary += `  P99: ${metrics.http_req_duration.values.p(99).toFixed(2)}ms\n\n`;

  // Service-specific metrics
  summary += 'Service Performance:\n';
  summary += `  API Response (P95): ${metrics.api_response_time.values.p(95).toFixed(2)}ms\n`;
  summary += `  Vision Analysis (P95): ${metrics.vision_analysis_time.values.p(95).toFixed(2)}ms\n`;
  summary += `  Code Generation (P95): ${metrics.code_generation_time.values.p(95).toFixed(2)}ms\n\n`;

  // Throughput
  const duration = Date.now() - data.state.testRunDurationMs;
  const rps = metrics.http_reqs.values.count / (duration / 1000);
  summary += `Throughput: ${rps.toFixed(2)} requests/second\n`;

  // Threshold results
  summary += '\nThreshold Results:\n';
  Object.entries(data.metrics).forEach(([name, metric]) => {
    if (metric.thresholds) {
      const passed = Object.values(metric.thresholds).every((t) => t.ok);
      summary += `  ${name}: ${passed ? '✓ PASSED' : '✗ FAILED'}\n`;
    }
  });

  return summary;
}

// Additional test scenarios for specific endpoints
export function testConcurrentUploads() {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  const batch = [];
  for (let i = 0; i < 10; i++) {
    batch.push([
      'POST',
      `${BASE_URL}/api/v1/images/upload`,
      JSON.stringify({
        image: TEST_IMAGE,
        format: 'png',
        name: `batch-${Date.now()}-${i}.png`,
      }),
      { headers },
    ]);
  }

  const responses = http.batch(batch);
  responses.forEach((res) => checkResponse(res));
}

export function testRateLimiting() {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  // Send rapid requests to trigger rate limiting
  let rateLimited = false;
  for (let i = 0; i < 100; i++) {
    const res = http.get(`${BASE_URL}/api/v1/user/profile`, { headers });
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }

  check(rateLimited, {
    'rate limiting is enforced': (r) => r === true,
  });
}

export function testCachePerformance() {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  // First request (cache miss)
  const firstRes = http.get(`${BASE_URL}/api/v1/projects`, { headers });
  const firstTime = firstRes.timings.duration;

  // Second request (cache hit)
  const secondRes = http.get(`${BASE_URL}/api/v1/projects`, { headers });
  const secondTime = secondRes.timings.duration;

  check(secondTime, {
    'cached response is faster': (t) => t < firstTime * 0.5,
  });
}
