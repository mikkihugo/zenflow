/**
 * Mock data fixtures for Vision-to-Code tests;
 */
// Sample images for different test scenarios
export const mockImages = {
  valid: {
    small: {
      name: 'small-ui.png',
size, // 100KB
  type;
: 'image/png',
// {
  width, height;
// }
 },
// {
  name: 'medium-dashboard.jpg',
  size, // 500KB
    type;
  : 'image/jpeg',
  width, height
// }
// {
  name: 'large-app.webp',
  size, // 2MB
    type;
  : 'image/webp',
  width, height
// }
 },
// {
  name: 'corrupted.png',
  error: 'Invalid image format',

  name: 'oversized.jpg',
  size, // 10MB
    error
  : 'File size exceeds limit',

  name: 'document.pdf',
  type: 'application/pdf',
  error: 'Unsupported file format' }
// }
// Mock vision analysis results
const _mockVisionResults = {
  simpleLayout: {
    components: [;
// {
        type: 'header',
        bounds: { x, y, width, height },
        confidence: 0.98,
        children: ['logo', 'navigation'] },
// {
        type: 'hero',
        bounds: { x, y, width, height },
        confidence: 0.95,
        children: ['heading', 'subheading', 'cta-button'] },
// {
        type: 'content',
        bounds: { x, y, width, height },
        confidence: 0.97,
        children: ['card-grid'] } ],
// {
  type: 'single-column',
  responsive,
  breakpoints: ['mobile', 'tablet', 'desktop']
// }
// {
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#ffffff',
  text: '#333333',

  headingFont: 'sans-serif',
  bodyFont: 'sans-serif',
  baseFontSize }
 },
// {
  components: [;
// {
        type: 'sidebar',
        bounds: { x, y, width, height },
        confidence: 0.96,
        children: ['logo', 'nav-menu', 'user-profile'] },
// {
        type: 'main-content',
        bounds: { x, y, width, height },
        confidence: 0.97,
        children: ['toolbar', 'data-grid', 'pagination'] } ],
  type: 'dashboard',
  responsive,
  fixedWidth }
// }
// Mock code generation templates
const _mockCodeTemplates = {
  react: {
    component: (name) => `import React from 'react';`
// import styles from './${name}.module.css';
// interface ${name}Props {
  className?;
// }
// export const ${name}: React.FC<${name}Props> = () => {
  return (;
    // <div className={\`\${styles.container // LINT);`
};
// export default ${name};`,`

    styles: (name) => `.container {`
  /* ${name} styles */
}`,`
test: (name) => `import React from 'react';`
// import { render } from '@testing-library/react';
// import ${name} from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});` },`
// {
  component: (name) => `<template>;`
  <div class="${name.toLowerCase()}">;
    <!-- ${name} content -->;
  </div>;
</template>
<script>;
// export default {
  name: '${name}',
  props: {
    className;
// }
};
</script>
<style scoped>;
${name.toLowerCase()} {
  /* ${name} styles */
// }
</style>`
// }// }
// Mock user data
// export const mockUsers = {
  authenticated: {
    id: 'user_123',
email: 'test@example.com',
name: 'Test User',
role: 'developer',
subscription: 'pro',
apiKey: 'sk_test_1234567890',
// {
  monthlyImages,
  concurrentRequests,
  maxImageSize, // 5MB
// }
 },
// {
  id: 'user_456',
  email: 'free@example.com',
  name: 'Free User',
  role: 'user',
  subscription: 'free',
  monthlyImages,
  concurrentRequests,
  maxImageSize, // 2MB
// }// }
// Mock API responses
const _mockApiResponses = {
  success: {
    upload: {
      status: 'success',
// {
  imageId: 'img_123',
  uploadUrl: 'https://storage.example.com/img_123', processingStatus;
  : 'queued'
// }
 },
// {
  status: 'success',
  analysisId: 'analysis_123',
  imageId: 'img_123',
  result: mockVisionResults.simpleLayout,
  processingTime }
// {
  status: 'success',
  generationId: 'gen_123',
  analysisId: 'analysis_123',
  framework: 'react',
  files: [;
          { name: 'App.tsx', content: mockCodeTemplates.react.component('App') },
          { name: 'App.module.css', content: mockCodeTemplates.react.styles('App') } ],
  downloadUrl: 'https://downloads.example.com/gen_123.zip' }
 },
// {
  status: 'error',
  code: 'UNAUTHORIZED',
  message: 'Invalid or missing API key',

  status: 'error',
  code: 'RATE_LIMIT_EXCEEDED',
  message: 'Rate limit exceeded. Please try again later.',
  retryAfter,

  status: 'error',
  code: 'INTERNAL_SERVER_ERROR',
  message: 'An unexpected error occurred',
// }// }
// Performance test data
const _performanceTestData = {
  loadTestScenarios: [;
// {
      name: 'Normal Load',
      users,
      duration: '5m',
      rampUp: '1m' },
// {
      name: 'Peak Load',
      users,
      duration: '10m',
      rampUp: '2m' },
// {
      name: 'Stress Test',
      users,
      duration: '15m',
      rampUp: '5m' } ],
// {
  p50,
  p95,
  p99,

  normal,
  peak,
  max,

  acceptable: 0.001, // 0.1%
    warning
  : 0.01, // 1%
      critical: 0.05, // 5%
// }// }
// Export all mock data
// export { mockVisionResults, mockCodeTemplates, mockApiResponses, performanceTestData };

}}