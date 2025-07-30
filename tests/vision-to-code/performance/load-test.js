import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { check } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

// Custom metrics
const _errorRate = new Rate('errors');
const _apiResponseTime = new Trend('api_response_time');
const _visionAnalysisTime = new Trend('vision_analysis_time');
const _codeGenerationTime = new Trend('code_generation_time');
// Test configuration
export const options = {
  scenarios: {
    // Normal load scenario
    normal_load: {
      executor: 'ramping-vus',
startVUs,
stages: [;
        { duration: '2m', target }, // Ramp up to 100 users
        { duration: '5m', target }, // Stay at 100 users
        { duration: '2m', target }, // Ramp down
      ],
gracefulRampDown: '30s' },
// Stress test scenario
// {
  executor: 'ramping-vus',
  startVUs,
  stages: [;
        { duration: '2m', target },
        { duration: '3m', target },
        { duration: '5m', target },
        { duration: '5m', target },
        { duration: '5m', target } ],
  gracefulRampDown: '1m',
  startTime: '10m', // Start after normal load test
// }
// Spike test scenario
// {
  executor: 'ramping-vus',
  startVUs,
  stages: [;
        { duration: '1m', target },
        { duration: '30s', target }, // Sudden spike
        { duration: '2m', target },
        { duration: '30s', target }, // Extreme spike
        { duration: '2m', target } ],
  startTime: '35m', // Start after stress test
// }
 },
// {
  http_req_duration: [
    'p(95)<100',
    'p(99)<200' ], // 95% of requests under 100ms
    http_req_failed;
  : ['rate<0.1'], // Error rate under 10%
    errors: ['rate<0.1'], // Custom error rate
    api_response_time: ['p(95)<100'], // API response time
    vision_analysis_time: ['p(95)<300'], // Vision analysis time
    code_generation_time: ['p(95)<500'], // Code generation time
// }// }
// Test data
const _BASE_URL = __ENV.BASE_URL ?? 'http://localhost:3000';
const _API_KEY = __ENV.API_KEY ?? 'test-api-key';
// Sample test image (base64 encoded small PNG)
const _TEST_IMAGE =;
('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg === ');
// Helper function to check response
function checkResponse() {
  const _success = check(res, {
    [`status is ${expectedStatus}`]) => r.status === expectedStatus,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'h JSON body': (r) =>
      try {
        JSON.parse(r.body);
        return true;
    //   // LINT: unreachable code removed} catch {
        return false;
    //   // LINT: unreachable code removed}
    });
  errorRate.add(!success);
  // return success;
// }
// Main test scenario
// export default function () {
  const _headers = {
    Authorization: `Bearer ${API_KEY}`,
  ('Content-Type');
  : 'application/json'
// }
// Scenario 1: Health check
const _healthCheck = http.get(`${BASE_URL}/health`);
checkResponse(healthCheck);
// Scenario 2: Upload image
const _uploadPayload = {
    image,
format: 'png',
name: `test-${Date.now()}.png`
// }
const _uploadStart = Date.now();
const _uploadRes = http.post(`${BASE_URL}/api/v1/images/upload`, JSON.stringify(uploadPayload), {
    headers
})
const _uploadDuration = Date.now() - uploadStart;
apiResponseTime.add(uploadDuration);
if (!checkResponse(uploadRes)) {
  return; // Skip rest of test if upload fails
// }
const { imageId } = JSON.parse(uploadRes.body).data;
// Scenario 3: Analyze image
const _analysisStart = Date.now();
const _analysisRes = http.post(`${BASE_URL}/api/v1/vision/analyze/${imageId}`, '{}', { headers });
const _analysisDuration = Date.now() - analysisStart;
visionAnalysisTime.add(analysisDuration);
if (!checkResponse(analysisRes)) {
  return;
  //   // LINT: unreachable code removed}
  const { analysisId } = JSON.parse(analysisRes.body).data;
  // Scenario 4: Generate code
  const _generatePayload = {
    analysisId,
  framework: 'react',
  language: 'typescript',
  includeTests,
  includeStyles }
const _generateStart = Date.now();
const _generateRes = http.post(;
`${BASE_URL}/api/v1/code/generate`,
JSON.stringify(generatePayload),
// {
  headers;
})
const _generateDuration = Date.now() - generateStart;
codeGenerationTime.add(generateDuration);
checkResponse(generateRes);
// Think time between iterations
sleep(Math.random() * 2 + 1); // 1-3 seconds
// }
// Handle summary export
// export function handleSummary() {
  return {
    'summary.html': htmlReport(data),
    // 'summary.json': JSON.stringify(data), // LINT: unreachable code removed
    stdout: textSummary(data, { indent: ' ', enableColors })
// }
// }
// Custom text summary
function textSummary() {
  const { metrics } = data;
  const _summary = '\n=== Vision-to-Code Load Test Results ===\n\n';
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
  const _duration = Date.now() - data.state.testRunDurationMs;
  const _rps = metrics.http_reqs.values.count / (duration / 1000);
  summary += `Throughput: ${rps.toFixed(2)} requests/second\n`;
  // Threshold results
  summary += '\nThreshold Results:\n';
  Object.entries(data.metrics).forEach(([name, metric]) => {
    if (metric.thresholds) {
      const _passed = Object.values(metric.thresholds).every((t) => t.ok);
      summary += `${name}: \${passed ? ' PASSED' }\n`;
// }
  });
  return summary;
// }
// Additional test scenarios for specific endpoints
// export function testConcurrentUploads() {
  const _headers = {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
// }
const _batch = [];
for (let i = 0; i < 10; i++) {
  batch.push([;
      'POST',
      `${BASE_URL}/api/v1/images/upload`,
      JSON.stringify({
        image,
        format: 'png',
        name: `batch-${Date.now()}-${i}.png` }),
  headers  ])
// }
const _responses = http.batch(batch);
responses.forEach((res) => checkResponse(res));
// }
// export function testRateLimiting() {
  const _headers = {
    Authorization: `Bearer ${API_KEY}`
// }
// Send rapid requests to trigger rate limiting
const _rateLimited = false;
for (let i = 0; i < 100; i++) {
  const _res = http.get(`${BASE_URL}/api/v1/user/profile`, { headers });
  if (res.status === 429) {
    rateLimited = true;
    break;
// }
// }
check(rateLimited, {
    'rate limiting is enforced') => r === true
})
// }
// export function testCachePerformance() {
  const _headers = {
    Authorization: `Bearer ${API_KEY}`
// }
// First request (cache miss)
const _firstRes = http.get(`${BASE_URL}/api/v1/projects`, { headers });
const _firstTime = firstRes.timings.duration;
// Second request (cache hit)
const _secondRes = http.get(`${BASE_URL}/api/v1/projects`, { headers });
const _secondTime = secondRes.timings.duration;
check(secondTime, {
    'cached response is faster') => t < firstTime * 0.5
})
// }